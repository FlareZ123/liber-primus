"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** Read a repository-relative JSON resource. @param {string} file */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
}

/** Modulus reduced to 0..28. @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** Exact GP29 rune-label collision fraction. @param {number[]} sequence */
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const label of sequence) counts[label]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (sequence.length * (sequence.length - 1));
}

/** Assert a pinned original-source floating-point observation. @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, String(actual) + " != " + String(expected));
}

const original = readJSON("resources/liber-primus/lp2-corpus.json");
const table = readJSON("resources/liber-primus/lp2-grid-256.json");
const pages = original.pages;
assert.equal(pages.slice(0, 56).reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(pages[50].indices.length, 0);
assert.equal(pages[56].indices.length, 85);
assert.equal(pages[57].indices.length, 95);

/**
 * The original red decimal 1..5 markers delimit five actual GP29 passages
 * within the p33..p39 cuneiform illustration chapter. Physical p50 has no runes.
 */
const passage = [
  pages[36].indices.slice(99, 238),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189, 228).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186)
];
assert.deepEqual(passage.map((part) => part.length), [139, 91, 98, 96, 129]);
assert.equal(passage.reduce((sum, part) => sum + part.length, 0), 553);

const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(table.bytes.length, 256);
assert.equal(tokens.length, 256);
const hash = crypto.createHash("sha256").update(Buffer.from(table.bytes)).digest("hex");
assert.equal(hash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(table.alphabet.length, 60);

const usedPassages = Array(5).fill(0);
const sourceKey = tokens.map((token, position) => {
  assert.equal(token.length, 2);
  const passageIndex = table.alphabet.indexOf(token[0]);
  const runeIndex = table.alphabet.indexOf(token[1]);
  assert.ok(passageIndex >= 0 && passageIndex < 5);
  assert.ok(runeIndex >= 0 && runeIndex < 60);
  assert.equal(table.bytes[position], 60 * passageIndex + runeIndex);
  usedPassages[passageIndex]++;
  return passage[passageIndex][runeIndex];
});
assert.deepEqual(usedPassages, [60, 58, 65, 56, 17]);
assert.equal(new Set(table.bytes).size, 161);
assert.equal(new Set(sourceKey).size, 28);

/**
 * Direct table-as-cipher register using the same source coordinate as its key.
 * If the map is a homophonic book cipher the decoded symbols should form text.
 * @param {number} direction +1 or -1
 */
function gridDecode(direction) {
  return table.bytes.map((byte, position) => mod29(byte + direction * sourceKey[position]));
}
const subtractTable = gridDecode(-1);
const addTable = gridDecode(1);
near(ioc(table.bytes.map(mod29)), 0.03716299019607843);
near(ioc(sourceKey), 0.03939950980392157);
near(ioc(subtractTable), 0.0382046568627451);
near(ioc(addTable), 0.03740808823529412);
assert.ok(table.bytes.every((byte, index) =>
  mod29(subtractTable[index] + sourceKey[index]) === byte % 29));

/**
 * Probe only source-naturally nominated rune receivers, preserving original
 * rune position and repeating the 256-coordinate key without fitted offsets.
 * @param {number[]} cipher
 * @param {number} direction
 */
function decodeRuneScope(cipher, direction) {
  const output = cipher.map((rune, index) => mod29(rune + direction * sourceKey[index % 256]));
  assert.ok(cipher.every((rune, index) =>
    mod29(output[index] - direction * sourceKey[index % 256]) === rune));
  return output;
}
const originalScopes = [
  { name: "p55", cipher: pages[55].indices, minus: 0.030877192982456142, plus: 0.037192982456140354 },
  { name: "p54..p55", cipher: pages[54].indices.concat(pages[55].indices), minus: 0.03496340792757731, plus: 0.03454037818858666 },
  { name: "p0..p2", cipher: pages.slice(0, 3).flatMap((page) => page.indices), minus: 0.033999608073682144, plus: 0.034598803117321636 },
  { name: "p32", cipher: pages[32].indices, minus: 0.03898071625344353, plus: 0.03429752066115702 }
];
const receivers = originalScopes.map(({name, cipher, minus, plus}) => {
  const negative = decodeRuneScope(cipher, -1);
  const positive = decodeRuneScope(cipher, +1);
  near(ioc(negative), minus);
  near(ioc(positive), plus);
  return {name, runeCount: cipher.length, originalIoC: ioc(cipher),
    subtractIoC: ioc(negative), addIoC: ioc(positive)};
});

/**
 * The published period-available alternative treats the absent lowercase f
 * as a removed radix digit, so every printed token is a base59 number.
 * This is source-motivated; no other alphabet or tuning is introduced.
 */
const alphabet59 = table.alphabet.replace("f", "");
assert.equal(alphabet59.length, 59);
const alternatePassageUse = Array(5).fill(0);
const alternateByte = tokens.map((token) => {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && high < 5 && low >= 0 && low < 59);
  alternatePassageUse[high]++;
  return 59 * high + low;
});
const alternateKey = tokens.map((token) =>
  passage[alphabet59.indexOf(token[0])][alphabet59.indexOf(token[1])]);
assert.deepEqual(alternatePassageUse, [60, 58, 65, 56, 17]);
assert.equal(new Set(alternateKey).size, 27);
near(ioc(alternateKey), 0.03909313725490196);
near(ioc(alternateByte.map(mod29)), 0.034895833333333334);
const alternateGP = {
  minus: alternateByte.map((byte, i) => mod29(byte - alternateKey[i])),
  plus: alternateByte.map((byte, i) => mod29(byte + alternateKey[i]))
};
near(ioc(alternateGP.minus), 0.03719362745098039);
near(ioc(alternateGP.plus), 0.03740808823529412);
assert.ok(alternateByte.every((byte, i) =>
  mod29(alternateGP.minus[i] + alternateKey[i]) === byte % 29));
const alternateXor = alternateByte.map((byte, i) => byte ^ original.prime[alternateKey[i]]);
assert.equal(alternateXor.filter((byte) => byte >= 32 && byte <= 126).length, 102);
assert.ok(alternateByte.every((byte, i) =>
  (alternateXor[i] ^ original.prime[alternateKey[i]]) === byte));
const alternateCode = {
  radix: 59, selectedRunes: alternateKey.length,
  distinctRunes: new Set(alternateKey).size,
  keyIoC: ioc(alternateKey),
  tableIoC: ioc(alternateByte.map(mod29)),
  tableMinusKeyIoC: ioc(alternateGP.minus),
  tablePlusKeyIoC: ioc(alternateGP.plus),
  byteXorPrintable: byteMetrics(alternateXor).printable
};

/* Independent positive plant: encrypt and recover actual solved p57 GP runes. */
const plantedPlain = sourceKey.map((_, i) => pages[57].indices[i % pages[57].indices.length]);
const plantedCipher = plantedPlain.map((rune, i) => mod29(rune + sourceKey[i]));
const plantedRecovered = plantedCipher.map((rune, i) => mod29(rune - sourceKey[i]));
assert.deepEqual(plantedRecovered, plantedPlain);
assert.ok(ioc(plantedPlain) > ioc(subtractTable));

/**
 * The table's source-selected 0..255 byte register can also be tested as a
 * book-code byte ciphertext under original GP prime-number key weights.
 * Cicada's earlier byte XOR and GP additive operations motivate these finite
 * readouts; no fitted key or secret byte alphabet is allowed.
 * @param {number[]} bytes
 */
function byteMetrics(bytes) {
  const printable = bytes.map((byte) => byte >= 32 && byte <= 126);
  let currentRun = 0;
  let longestRun = 0;
  for (const yes of printable) {
    currentRun = yes ? currentRun + 1 : 0;
    longestRun = Math.max(longestRun, currentRun);
  }
  const counts = Array(256).fill(0);
  for (const byte of bytes) counts[byte]++;
  const entropy = -counts.reduce((sum, count) => count > 0
    ? sum + (count / bytes.length) * Math.log2(count / bytes.length) : sum, 0);
  return {printable: printable.filter(Boolean).length, longestRun, entropy,
    first16Hex: bytes.slice(0, 16).map((byte) => byte.toString(16).padStart(2, "0")).join("")};
}
const sourcePrime = sourceKey.map((rune) => original.prime[rune]);
const byteCandidate = {
  original: table.bytes,
  xorPrime: table.bytes.map((byte, i) => byte ^ sourcePrime[i]),
  subtractPrime: table.bytes.map((byte, i) => (byte - sourcePrime[i] + 256) % 256),
  addPrime: table.bytes.map((byte, i) => (byte + sourcePrime[i]) % 256)
};
const byteScores = Object.fromEntries(
  Object.entries(byteCandidate).map(([name, bytes]) => [name, byteMetrics(bytes)])
);
assert.equal(byteScores.original.printable, 103);
assert.deepEqual(
  [byteScores.xorPrime.printable, byteScores.subtractPrime.printable, byteScores.addPrime.printable],
  [105, 87, 92]
);
assert.deepEqual(
  [byteScores.xorPrime.longestRun, byteScores.subtractPrime.longestRun, byteScores.addPrime.longestRun],
  [5, 5, 4]
);
near(byteScores.xorPrime.entropy, 6.770611707231604);
near(byteScores.subtractPrime.entropy, 6.754015417874233);
near(byteScores.addPrime.entropy, 6.713239785461156);
assert.ok(table.bytes.every((byte, i) => (byteCandidate.xorPrime[i] ^ sourcePrime[i]) === byte));
assert.ok(table.bytes.every((byte, i) =>
  (byteCandidate.subtractPrime[i] + sourcePrime[i]) % 256 === byte));

/* Source-native ASCII positive: GP transliteration of independently clear p57. */
const clearWords = pages[57].indices.map((rune) => original.translit[rune]).join("");
const asciiPlant = Array.from({length: 256}, (_, i) => clearWords.charCodeAt(i % clearWords.length));
assert.ok(asciiPlant.every((byte) => byte >= 65 && byte <= 90));
const xorPlant = asciiPlant.map((byte, i) => byte ^ sourcePrime[i]);
const addPlant = asciiPlant.map((byte, i) => (byte + sourcePrime[i]) % 256);
assert.deepEqual(xorPlant.map((byte, i) => byte ^ sourcePrime[i]), asciiPlant);
assert.deepEqual(addPlant.map((byte, i) => (byte - sourcePrime[i] + 256) % 256), asciiPlant);
assert.equal(byteMetrics(asciiPlant).printable, 256);

console.log(JSON.stringify({
  source: {passageLengths: passage.map((part) => part.length),
    tableCells: table.bytes.length, coordinatePassageCounts: usedPassages,
    uniquePrintedByteValues: new Set(table.bytes).size, sourceKeyDistinctRunes: new Set(sourceKey).size},
  table: {sourceKeyIoC: ioc(sourceKey), originalResidueIoC: ioc(table.bytes.map(mod29)),
    subtractIoC: ioc(subtractTable), addIoC: ioc(addTable)},
  receiverResults: receivers,
  byteReceiverResults: byteScores,
  publishedRadix59Alternative: alternateCode,
  planted: {runesRecovered: plantedRecovered.length, nativePlainIoC: ioc(plantedPlain)}
}, null, 2));
