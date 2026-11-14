"use strict";

/**
 * Source-fixed first-difference/chain inverse for the original LP2 stream.
 *
 * Hypothesis: C[i] = C[i-1] + P[i] - sign*K[i] (mod 29), with K drawn
 * consecutively from the authentic 2013 DATA/560.13 pad at the p15 title's
 * exact BASE29/3301 quotient. The first ciphertext rune is the transmitted IV.
 *
 * Node 22:
 *   node sims/lp2_p15_56013_chainstep_sft.cjs <full DATA/560.13 path>
 *
 * This is distinct from direct C[i]-K[i] and from the GP28 predecessor-rank
 * inverses. It uses the full 29-symbol modular first difference.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8"
);
const parsed = parseLP2Words(transcription);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const wordIndices = parsed.words.map((word) => [...word.runes].map((rune) => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined, "Unknown rune in canonical LP2 transcription");
  return index;
}));
const ciphertext = wordIndices.flat();
const canonical = corpus.pages.filter((page) => page.page <= 55 && page.indices.length)
  .flatMap((page) => page.indices);
assert.deepEqual(ciphertext, canonical, "Word parser must preserve the original canonical rune stream");

const p15 = corpus.pages.find((page) => page.page === 15);
const heading = p15.indices.slice(0, 9);
assert.deepEqual(heading, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const titleInteger = heading.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
assert.equal(titleInteger, 29553734724n);
assert.equal(titleInteger / 3301n, 8952964n);
assert.equal(titleInteger % 3301n, 560n);
const padOffset = Number(titleInteger / 3301n);

const filePath = process.argv[2];
assert.ok(filePath, "Supply the authentic full DATA/560.13 path");
const pad = fs.readFileSync(filePath);
assert.equal(pad.length, 118818811, "Unexpected historical DATA/560.13 length");
const padSha256 = crypto.createHash("sha256").update(pad).digest("hex");
assert.equal(
  padSha256,
  "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
);

// Reproduce the authentic 2013 phone-stage XOR control before using the file.
const historicalCipher = Buffer.from(
  "28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex"
);
const historicalPlain = Buffer.from(historicalCipher.map(
  (byte, index) => byte ^ pad[12821 + index]
));
assert.equal(historicalPlain.toString("ascii"), "gbyh7znm6c7ezsmr.onion\n");

const requiredKeyBytes = ciphertext.length - 1;
const padSlice = pad.subarray(padOffset, padOffset + requiredKeyBytes);
assert.equal(padSlice.length, requiredKeyBytes);

const mod29 = (value) => ((value % 29) + 29) % 29;
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function encodeGP29(text) {
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const normalize = { K: "C", Q: "C", V: "U", Z: "S" };
  const output = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (const word of words) {
    for (let position = 0; position < word.length;) {
      let token = tokens.find((candidate) => word.startsWith(candidate, position));
      if (!token) {
        const letter = normalize[word[position]] || word[position];
        token = letter;
        position++;
      } else {
        position += token.length;
      }
      const index = corpus.translit.indexOf(token);
      if (index >= 0) output.push(index);
    }
  }
  return output;
}
const nativeText = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8"
);
const native = encodeGP29(nativeText);
assert.ok(native.length >= requiredKeyBytes);
const nativeControl = native.slice(0, requiredKeyBytes);

function keyValue(byte, projection) {
  return projection === "byte_mod29" ? byte % 29 : Math.floor(29 * byte / 256);
}
function decryptChain(input, key, sign) {
  assert.equal(input.length - 1, key.length);
  const output = [];
  for (let index = 1; index < input.length; index++) {
    const step = mod29(input[index] - input[index - 1]);
    output.push(mod29(step + sign * key[index - 1]));
  }
  return output;
}
function encryptChain(plain, key, sign, iv) {
  assert.equal(plain.length, key.length);
  const output = [iv];
  for (let index = 0; index < plain.length; index++) {
    output.push(mod29(output[index] + plain[index] - sign * key[index]));
  }
  return output;
}
function nativeLogScore(values) {
  const counts = Array(29).fill(0);
  for (const value of native) counts[value]++;
  const total = native.length;
  const logp = counts.map((count) => Math.log((count + 0.5) / (total + 14.5)));
  return values.reduce((sum, value) => sum + logp[value], 0) / values.length;
}
function renderWords(values) {
  let cursor = 0;
  return wordIndices.map((word) => word.map(() => {
    if (cursor === 0) {
      cursor++;
      return "?"; // The first rune is the chain's transmitted initial state.
    }
    const token = corpus.translit[values[cursor - 1]];
    cursor++;
    return token;
  }).join(""));
}

const delta = ciphertext.slice(1).map((value, index) => mod29(value - ciphertext[index]));
const deltaCounts = Array(29).fill(0);
for (const value of delta) deltaCounts[value]++;
assert.equal(delta.length, 12955);
assert.equal(deltaCounts[0], 86, "Original adjacent-doublet count changed");

const models = [];
for (const projection of ["byte_mod29", "byte_scaled29"]) {
  const key = Array.from(padSlice, (byte) => keyValue(byte, projection));
  assert.equal(key.length, requiredKeyBytes);
  assert.ok(key.every((value) => value >= 0 && value < 29));
  for (const sign of [-1, 1]) {
    // Independent native-language positive control using the same key bytes,
    // projection, clock, sign, and chain state convention.
    const controlCipher = encryptChain(nativeControl, key, sign, 17);
    const controlRecovered = decryptChain(controlCipher, key, sign);
    assert.deepEqual(controlRecovered, nativeControl);

    const recovered = decryptChain(ciphertext, key, sign);
    models.push({
      projection,
      sign,
      originalIoC: ioc(recovered),
      originalNativeLogScore: nativeLogScore(recovered),
      nativeControlIoC: ioc(controlRecovered),
      nativeControlLogScore: nativeLogScore(controlRecovered),
      exactControlRecovery: controlRecovered.every((value, index) => value === nativeControl[index]),
      originalPrefix: recovered.slice(0, 160).map((value) => corpus.translit[value]).join(""),
      originalWordPreview: renderWords(recovered).slice(0, 48),
    });
  }
}

console.log(JSON.stringify({
  source: {
    file: "CicadaOS DATA/560.13",
    bytes: pad.length,
    sha256: padSha256,
    p15TitleGP29Integer: titleInteger.toString(),
    divisor: 3301,
    exactOffset: padOffset,
    remainder: 560,
    historical2013OnionControl: historicalPlain.toString("ascii").trim(),
  },
  originalCipher: {
    physicalPages: "LP2 p0-p55, with the numeric-only p50 omitted from the rune stream",
    words: parsed.words.length,
    runes: ciphertext.length,
    chainTransitions: delta.length,
    zeroSteps: deltaCounts[0],
    stepHistogram: deltaCounts,
    stepIoC: ioc(delta),
    initialRuneIsTransmittedIV: true,
  },
  models,
  decision: "A candidate is not a decryption unless original plaintext is independently recognizable and the exact source-derived key/operation is justified.",
}, null, 2));
