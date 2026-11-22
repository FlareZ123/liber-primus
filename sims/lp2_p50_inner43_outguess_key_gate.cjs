"use strict";

// Run from the repository root with Node 22:
// node sims/lp2_p50_inner43_outguess_key_gate.cjs
//
// One frozen transfer test, not an LP2 cipher claim:
// - The literal p50 token "3D" occurs at flattened offsets 83 and 127.
// - The 43 base60-decoded bytes strictly between those tokens are tested as
//   (a) a raw RC4 key and (b) an OutGuess password using MD5(type || password).
// - The literal 86-character base60 token string is the password representation.
// - The source-compatible OutGuess role is "Encryption"; "Seeding" is a
//   wrong-role control.
// - p57's circumference instruction selects the 43 strict word-interior
//   runes on p55. No phase, reversal, discard, salt, or fitted transform.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

const p50Tokens = grid.rows.flat();
const p50Bytes = grid.byte_rows.flat();
assert.equal(p50Tokens.length, 256);
assert.equal(p50Bytes.length, 256);
assert.equal(p50Tokens[83], "3D");
assert.equal(p50Tokens[127], "3D");
const tokenBase60Value = (token) =>
  grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]);
assert.equal(p50Bytes[83], 193); // base60 value of token "3D", i.e. 0xC1
assert.equal(p50Bytes[127], 193);

const intervalBytes = p50Bytes.slice(84, 127);
const intervalTokens = p50Tokens.slice(84, 127);
assert.equal(intervalBytes.length, 43);
assert.equal(intervalTokens.length, 43);
assert.deepEqual(intervalTokens.map(tokenBase60Value), intervalBytes);
assert.deepEqual(intervalBytes, [
  173, 28, 111, 65, 211, 220, 198, 49, 236, 84, 56, 35, 222, 150, 72,
  34, 83, 229, 32, 206, 122, 63, 31, 218, 14, 184, 32, 115, 73, 143,
  197, 247, 54, 171, 35, 184, 42, 237, 86, 54, 13, 20, 163
]);
const literalPassword = intervalTokens.join("");
assert.equal(literalPassword.length, 86);

const parsed = parseSharedCorpus();
const p55Words = parsed.byContainedPage[54];
assert.equal(p55Words.length, 16);
const wordLengths = p55Words.map((word) => word.length);
assert.deepEqual(wordLengths, [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const interiorGroups = p55Words.map((word) =>
  [...word.runes].slice(1, -1).map((rune) => runeToIndex.get(rune))
);
const ciphertext = interiorGroups.flat();
assert.equal(ciphertext.length, 43);
assert.deepEqual(ciphertext, [
  19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20,
  15, 23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18
]);

function rc4(key, length) {
  assert.ok(key.length >= 1 && key.length <= 256);
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const out = Buffer.alloc(length);
  let i = 0;
  j = 0;
  for (let n = 0; n < length; n++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
    out[n] = S[(S[i] + S[j]) & 255];
  }
  return [...out];
}

function outguessArc4(type, password, length) {
  const digest = crypto.createHash("md5")
    .update(type + password, "ascii")
    .digest();
  return rc4([...digest], length);
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function ioc(values) {
  const frequency = Array(29).fill(0);
  for (const value of values) frequency[value]++;
  const n = values.length;
  return frequency.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function decodeMod29(cipher, stream, sign) {
  return cipher.map((value, i) => mod29(value + sign * (stream[i] % 29)));
}

function groupDecoded(values) {
  let cursor = 0;
  return interiorGroups.map((group, index) => {
    const part = values.slice(cursor, cursor + group.length);
    cursor += group.length;
    return {
      originalP55Word: index + 1,
      gp: part.map((value) => corpus.translit[value]).join(" ")
    };
  }).filter((item) => item.gp.length > 0);
}

const p57 = corpus.pages.find((page) => page.page === 57).indices;
const p57Probe = p57.slice(0, 43);
assert.equal(p57Probe.length, 43);

// RFC 6229 / classic RC4 known-answer check.
assert.equal(
  Buffer.from(rc4([...Buffer.from("Key", "ascii")], 9)).toString("hex"),
  "eb9f7781b734ca72a7"
);

const candidates = [
  {
    name: "raw-inner43-bytes-as-standard-RC4-key",
    role: "raw-key",
    stream: rc4(intervalBytes, 43)
  },
  {
    name: "literal-inner43-base60-token-string-as-OutGuess-password",
    role: "Encryption",
    stream: outguessArc4("Encryption", literalPassword, 43)
  },
  {
    name: "literal-inner43-base60-token-string-as-OutGuess-password-control",
    role: "Seeding",
    stream: outguessArc4("Seeding", literalPassword, 43)
  }
];

const outputs = candidates.map((candidate) => {
  const { stream } = candidate;
  const directXor = ciphertext.map((value, i) => value ^ stream[i]);
  const subtract = decodeMod29(ciphertext, stream, -1);
  const add = decodeMod29(ciphertext, stream, 1);

  // Independent synthetic controls verify both byte-XOR and mod-29 transport.
  const plantedXorCipher = p57Probe.map((value, i) => value ^ stream[i]);
  assert.deepEqual(plantedXorCipher.map((value, i) => value ^ stream[i]), p57Probe);
  const plantedModCipher = p57Probe.map((value, i) => mod29(value + stream[i] % 29));
  assert.deepEqual(decodeMod29(plantedModCipher, stream, -1), p57Probe);

  return {
    candidate: candidate.name,
    role: candidate.role,
    keystreamFirst12: stream.slice(0, 12),
    directByteXor: {
      validGP29Symbols: directXor.filter((value) => value >= 0 && value < 29).length,
      first16Values: directXor.slice(0, 16)
    },
    mod29Diagnostic: {
      subtract: {
        ioc: ioc(subtract),
        gp: subtract.map((value) => corpus.translit[value]).join(" "),
        groupedByOriginalP55Word: groupDecoded(subtract)
      },
      add: {
        ioc: ioc(add),
        gp: add.map((value) => corpus.translit[value]).join(" "),
        groupedByOriginalP55Word: groupDecoded(add)
      }
    },
    syntheticXorRoundTrip: true,
    syntheticMod29RoundTrip: true
  };
});

console.log(JSON.stringify({
  classification: "BOUNDED HISTORICAL-TRANSFER NEGATIVE",
  sourceCaveat: "The 2016 image carrier used OutGuess, but no Cicada instruction selects OutGuess as an LP2 cipher. This is one frozen transfer test, not an authenticated mechanism.",
  p50: {
    leftMarkerTokenOffset: 83,
    leftMarkerToken: p50Tokens[83],
    leftMarkerBase60Value: p50Bytes[83],
    rightMarkerTokenOffset: 127,
    rightMarkerToken: p50Tokens[127],
    rightMarkerBase60Value: p50Bytes[127],
    intervalOffsets: "84..126 inclusive",
    intervalBytes: intervalBytes,
    intervalTokens: intervalTokens,
    literalPasswordLength: literalPassword.length
  },
  p55: {
    completeWordCount: p55Words.length,
    wordLengths,
    interiorCount: ciphertext.length,
    interiorIndices: ciphertext,
    interiorGP: ciphertext.map((value) => corpus.translit[value]).join(" ")
  },
  controls: {
    rc4KnownAnswer: "passed",
    syntheticRoundTrips: "passed for all three candidate streams"
  },
  outputs,
  decision: "The source-compatible OutGuess Encryption role yields 0/43 valid GP29 symbols under direct bytewise XOR; neither mod-29 direction yields plaintext. The raw inner43 RC4 key also fails. Seeding is a wrong-role control only."
}, null, 2));
