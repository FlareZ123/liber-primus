"use strict";

/**
 * SFT: p0 117..121 FOUND candidate from the p28 literal-DH state.
 *
 * The p0 receiver and the target label FOUND are selected upstream by the
 * authenticated WILL -> BE -> FOUND carrier before this word's values are
 * consumed. This test derives an Alice-side five-rune shell key from the
 * independently reconstructed p28 DH23 state, verifies the exact inverse,
 * charges a broad role/permutation family, and records the next source-native
 * FOUND -> GOOD compound navigation consequence without claiming GOOD
 * plaintext.
 *
 * Run:
 *   node sims/lp2_p0_found_dh_shell_inverse_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(word) {
  return sum(gp(word));
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function outerH(fragment) {
  assert.ok(fragment.length >= 2);
  return H(fragment[0], fragment[fragment.length - 1]);
}

function physicalLines(page) {
  return parts[page].trim().split("/").filter((line) => line.trim().length > 0);
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function uniquePermutations(values) {
  const output = new Map();
  function visit(prefix, rest) {
    if (!rest.length) {
      output.set(prefix.join(","), prefix);
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1))
      );
    }
  }
  visit([], values);
  return [...output.values()];
}

function decrypt(values, key, sign) {
  return values.map((value, index) => mod29(value + sign * key[index]));
}

const p0 = parsePage(parts[0]);
const message = signedWords();
assert.equal(p0.words.length, 59);
assert.equal(message.length, 43);

// Reconstruct the source-local DH state from the sole literal-DH line.
const p28Lines = physicalLines(28);
const literalDhLines = [];
for (let lineIndex = 0; lineIndex < p28Lines.length; lineIndex += 1) {
  const fragments = lineFragments(p28Lines[lineIndex]);
  if (fragments.length && translit(fragments[0]) === "DH") {
    literalDhLines.push({ lineIndex, fragments });
  }
}
assert.equal(literalDhLines.length, 1);
const dhLine = literalDhLines[0];
assert.equal(dhLine.lineIndex + 1, 6);
assert.equal(dhLine.fragments.length, 5);
const hStream = dhLine.fragments.map(outerH);
assert.deepEqual(hStream, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.A, state.b, state.p), state.K);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.deepEqual(hStream[0], [state.b, state.K]);
assert.deepEqual(hStream[3], [state.p, mod29(state.K * state.a)]);
assert.deepEqual(hStream[4], [state.A, state.B]);

// Upstream receiver selection from the authenticated WILL -> BE -> FOUND triple.
const willIndex = message.findIndex((word, index) =>
  word.toLowerCase() === "will" && message[index + 1]?.toLowerCase() === "be"
);
assert.equal(willIndex, 33);
assert.equal(message[willIndex + 2].toLowerCase(), "found");
assert.equal(gp0("WILL"), 57);
assert.equal(gp0("BE"), 35);

let direction = gp0("WILL");
const walk = [direction];
for (let hop = 0; hop < state.K; hop += 1) {
  direction = decodeToken(tableTokens[direction], alphabet60);
  walk.push(direction);
}
assert.deepEqual(walk, [57, 118, 35]);
const foundReceiver = p0.words.find((word) =>
  word.start <= walk[1] && walk[1] <= word.end
);
assert.ok(foundReceiver);
assert.equal(foundReceiver.index, 26);
assert.equal(foundReceiver.start, 117);
assert.equal(foundReceiver.end, 121);
assert.equal(foundReceiver.length, gp("FOUND").length);
assert.deepEqual(foundReceiver.values, [12, 2, 11, 10, 2]);

// Alice-side shell key. In word order its shells are:
// outer [K*a, A], inner [g-a, a-g], center K*g.
const aliceKey = [
  mod29(state.K * state.a),
  mod29(state.g - state.a),
  mod29(state.K * state.g),
  mod29(state.a - state.g),
  state.A,
];
const bobKey = [
  mod29(state.K * state.b),
  mod29(state.g - state.b),
  mod29(state.K * state.g),
  mod29(state.b - state.g),
  state.B,
];
assert.deepEqual(aliceKey, [12, 28, 10, 1, 8]);
assert.deepEqual(bobKey, [1, 19, 10, 10, 19]);

const foundPlain = decrypt(foundReceiver.values, aliceKey, -1);
assert.deepEqual(foundPlain, gp("FOUND"));
assert.equal(translit(foundPlain), "FOUND");
assert.deepEqual(decrypt(foundPlain, aliceKey, +1), foundReceiver.values);

// Under the frozen H shell, FOUND is itself a compact DH-state readout.
const foundShell = [
  ...H(foundPlain[0], foundPlain[4]),
  ...H(foundPlain[1], foundPlain[3]),
  foundPlain[2],
];
assert.deepEqual(foundShell, [
  state.a,
  state.p,
  state.p,
  mod29(state.K * state.a),
  mod29(state.a - state.g),
]);

// Charge a deliberately broad role/permutation family. Start with Alice and
// Bob shell keys, allow every unique permutation and both additive signs, and
// score against every distinct five-rune word in the authenticated carrier.
const fiveRuneTargets = [...new Map(
  message
    .map((word) => ({ word: word.toUpperCase(), values: gp(word) }))
    .filter((entry) => entry.values.length === 5)
    .map((entry) => [entry.values.join(","), entry])
).values()];
assert.deepEqual(
  fiveRuneTargets.map((entry) => entry.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);

const family = new Map();
for (const [role, baseKey] of [["alice", aliceKey], ["bob", bobKey]]) {
  for (const key of uniquePermutations(baseKey)) {
    for (const sign of [-1, +1]) {
      family.set(sign + ":" + key.join(","), { role, key, sign });
    }
  }
}
const familyMembers = [...family.values()];
assert.equal(familyMembers.length, 300);

const selectedHits = [];
for (const member of familyMembers) {
  const plain = decrypt(foundReceiver.values, member.key, member.sign);
  for (const target of fiveRuneTargets) {
    if (plain.join(",") === target.values.join(",")) {
      selectedHits.push({ member, target: target.word });
    }
  }
}
assert.equal(selectedHits.length, 1);
assert.equal(selectedHits[0].member.role, "alice");
assert.equal(selectedHits[0].member.sign, -1);
assert.deepEqual(selectedHits[0].member.key, aliceKey);
assert.equal(selectedHits[0].target, "FOUND");

// Manuscript-wide control across every complete five-rune unknown-page word.
const manuscriptHits = [];
let fiveRuneWordCount = 0;
for (let page = 0; page < 56; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(parts[page]);
  for (const word of parsed.words) {
    if (word.length !== 5) continue;
    fiveRuneWordCount += 1;
    for (const member of familyMembers) {
      const plain = decrypt(word.values, member.key, member.sign);
      for (const target of fiveRuneTargets) {
        if (plain.join(",") === target.values.join(",")) {
          manuscriptHits.push({
            page,
            word: word.index,
            start: word.start,
            member,
            target: target.word,
          });
        }
      }
    }
  }
}
assert.equal(fiveRuneWordCount, 318);
assert.equal(manuscriptHits.length, 1);
assert.equal(manuscriptHits[0].page, 0);
assert.equal(manuscriptHits[0].word, 26);
assert.equal(manuscriptHits[0].target, "FOUND");
assert.deepEqual(manuscriptHits[0].member.key, aliceKey);
assert.equal(manuscriptHits[0].member.sign, -1);

// Exact finite GP29 null without enumerating all 29^5 ciphertexts. Every
// family-member/target pair generates one ciphertext; count the union.
const generatedCiphertexts = new Map();
for (const member of familyMembers) {
  for (const target of fiveRuneTargets) {
    const ciphertext = target.values.map((value, index) =>
      mod29(value - member.sign * member.key[index])
    );
    const signature = ciphertext.join(",");
    if (!generatedCiphertexts.has(signature)) generatedCiphertexts.set(signature, []);
    generatedCiphertexts.get(signature).push({ member, target: target.word });
  }
}
assert.equal(generatedCiphertexts.size, 2100);
const selectedSignature = foundReceiver.values.join(",");
assert.equal(generatedCiphertexts.get(selectedSignature).length, 1);
const exactCoverage = generatedCiphertexts.size / (29 ** 5);
assert.ok(Math.abs(exactCoverage - 0.00010238334283467006) < 1e-15);

// Prospective consequence after recovering FOUND. Include zero-count literal
// tokens, both radices, zero/one origins, start/end boundaries, and require the
// selected p0 word length to match the next authenticated word's GP length.
const compoundHits = [];
for (let index = 0; index < message.length - 1; index += 1) {
  const address = gp0(message[index]);
  if (address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const match = token.match(/^([0-9])([A-Za-z])$/);
  if (!match) continue;

  const count = Number(match[1]);
  const letter = match[2].toLowerCase();
  const nextWord = message[index + 1];
  const actual = [...nextWord.toLowerCase()].filter((char) => char === letter).length;
  if (actual !== count) continue;
  const nextLength = gp(nextWord).length;

  for (const [radix, alphabet] of [["base60", alphabet60], ["base59", alphabet59]]) {
    const raw = decodeToken(token, alphabet);
    if (raw === null) continue;
    for (const origin of [0, 1]) {
      const position = raw - origin;
      for (const boundary of ["start", "end"]) {
        const receiver = p0.words.find((word) =>
          word[boundary] === position && word.length === nextLength
        );
        if (!receiver) continue;
        compoundHits.push({
          from: message[index].toUpperCase(),
          to: nextWord.toUpperCase(),
          token,
          radix,
          origin,
          boundary,
          position,
          word: receiver.index,
        });
      }
    }
  }
}
assert.deepEqual(compoundHits, [
  {
    from: "YOU",
    to: "WILL",
    token: "2L",
    radix: "base60",
    origin: 0,
    boundary: "start",
    position: 141,
    word: 32,
  },
  {
    from: "FOUND",
    to: "GOOD",
    token: "0s",
    radix: "base59",
    origin: 1,
    boundary: "end",
    position: 52,
    word: 10,
  },
  {
    from: "GOOD",
    to: "LUCK",
    token: "0d",
    radix: "base60",
    origin: 0,
    boundary: "start",
    position: 39,
    word: 7,
  },
  {
    from: "GOOD",
    to: "LUCK",
    token: "0d",
    radix: "base59",
    origin: 0,
    boundary: "start",
    position: 39,
    word: 7,
  },
]);

const foundGood = compoundHits.find((hit) =>
  hit.from === "FOUND" && hit.to === "GOOD"
);
assert.ok(foundGood);
assert.equal(tableTokens[gp0("FOUND")], "0s");
assert.equal(gp0("FOUND"), 36);
assert.equal(foundGood.word, 10);

console.log(JSON.stringify({
  dh: state,
  receiver: {
    page: 0,
    word: foundReceiver.index,
    start: foundReceiver.start,
    end: foundReceiver.end,
    cipher: foundReceiver.values,
  },
  aliceKey,
  plaintext: translit(foundPlain),
  plaintextShell: foundShell,
  familyMembers: familyMembers.length,
  selectedFamilyHits: selectedHits.length,
  manuscriptFiveRuneWords: fiveRuneWordCount,
  manuscriptFamilyHits: manuscriptHits.length,
  exactNullCiphertexts: generatedCiphertexts.size,
  exactGp29Space: 29 ** 5,
  exactCoverage,
  nextCompoundHit: foundGood,
}, null, 2));

console.log("PASS p0 FOUND DH-shell inverse");
