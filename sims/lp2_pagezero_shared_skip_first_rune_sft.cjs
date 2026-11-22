"use strict";

/**
 * Test whether LP2 pages may share one page-reset keystream even if later
 * ciphertext-collision attempts consume or reject variable numbers of keys.
 *
 * A shared first emitted key symbol implies C_page[0] = pi(P_page[0])
 * for the same secret bijection pi across pages. Equality of page-initial
 * ciphertext glyphs is then an exact, key-independent plaintext invariant.
 *
 * This is a restricted cipher-family gate. It does not decrypt LP2 or reject
 * independent per-page keys/IVs, source-defined variable starts, or encodings
 * that skip/rewrite even the first emitted rune.
 *
 * Node 22, CommonJS, source-native GP controls, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(grid.bytes.length, 256);

const lengths = pages.map(p => p.indices.length);
const starts = [];
let nRunes = 0;
for (const length of lengths) {
  starts.push(nRunes);
  nRunes += length;
}
assert.equal(nRunes, 12956);
const nPairs = pages.length * (pages.length - 1) / 2;
assert.equal(nPairs, 1485);

/** @param {number[]} data  */
function equalityPairs(data) {
  const bins = new Uint16Array(29);
  for (const x of data) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    bins[x]++;
  }
  let pairs = 0;
  for (const count of bins) pairs += count * (count - 1) / 2;
  return pairs;
}

/**
 * Exhaust every possible contiguous source window of the exact unknown LP2
 * rune length. Original physical page lengths and all 55 page initial offsets
 * remain fixed. Control windows overlap, so counts are finite-reference
 * frequencies rather than independent p-values.
 *
 * @param {number[]} source
 * @param {number} actual
 * @param {number} nonceDerived
 */
function scanControl(source, actual, nonceDerived) {
  let minimum = Infinity;
  let atMostOriginal = 0;
  let atMostNonceDerived = 0;
  let sum = 0;
  const count = source.length - nRunes + 1;
  assert(count > 0);
  const bins = new Uint16Array(29);
  for (let begin = 0; begin < count; begin++) {
    bins.fill(0);
    for (const offset of starts) bins[source[begin + offset]]++;
    let hits = 0;
    for (const m of bins) hits += m * (m - 1) / 2;
    if (hits < minimum) minimum = hits;
    if (hits <= actual) atMostOriginal++;
    if (hits <= nonceDerived) atMostNonceDerived++;
    sum += hits;
  }
  return {
    gpRunes: source.length,
    testedWindows: count,
    minimum,
    atMostOriginal,
    atMostNonceDerived,
    averagePairs: sum / count
  };
}

const originalFirstRunes = pages.map(p => p.indices[0]);
const originalPairs = equalityPairs(originalFirstRunes);
assert.equal(originalPairs, 52);

// Source-selected page-dependent nonce hypothesis. Printed 32x8 grid has
// 256 literal bytes; first 56 row-major values address physical pp0..55.
// Page p50 is runeless but retains its physical address. Any common unknown
// initial additive key cancels in equality of the nonce-removed first runes.
const nonceRemovedInitials = pages.map(p =>
  (p.indices[0] - grid.bytes[p.page] % 29 + 29) % 29);
const nonceRemovedPairs = equalityPairs(nonceRemovedInitials);
assert.equal(nonceRemovedPairs, 51);

const fixedSources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106, 204151, 50, 18, 10],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492, 49537, 50, 8, 3],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 321327, 308372, 49, 16, 14]
];
const sourceControls = [];
let plant = null;
for (const [name, file, expectedLength, expectedCount, expectedMin, expectedTail, expectedNonceTail] of fixedSources) {
  const encoded = encodeSourceNativeGP(read(file));
  assert.equal(encoded.length, expectedLength, name);
  const verdict = scanControl(encoded, originalPairs, nonceRemovedPairs);
  assert.deepEqual(
    [verdict.testedWindows, verdict.minimum, verdict.atMostOriginal, verdict.atMostNonceDerived],
    [expectedCount, expectedMin, expectedTail, expectedNonceTail],
    name
  );
  sourceControls.push({name, ...verdict});
  if (name === "Shakespeare") plant = encoded.slice(0, nRunes);
}
assert(plant && plant.length === nRunes);

// Algebraic all-secret control: any single common permutation at page start
// preserves all same-symbol pairs without choosing/estimating the permutation.
const plantedInitials = starts.map(offset => plant[offset]);
const permutedInitials = plantedInitials.map(x => (7 * x + 3) % 29);
assert.equal(equalityPairs(plantedInitials), equalityPairs(permutedInitials));
assert.equal(equalityPairs(plantedInitials), 91);

// Fully reversible, nontrivial collision-skipping source-table positive plant.
// This uses the original 256-grid bytes as a shared circular additive key,
// fixed common initial key offset 7, and seeded stochastic collision rejection.
// The exact consumed key indices serve as side information for this control;
// the theorem needs only the first emission, which is never rejected.
let randomState = 0x3301a9b;
const randomUint32 = () => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
};
let totalRejected = 0;
let repeated = 0;
let maximumRejected = 0;
const encryptedInitials = [];
let k = 0;
for (const length of lengths) {
  let previous = -1;
  let keyPointer = 7;
  for (let i = 0; i < length; i++) {
    const plain = plant[k++];
    let out;
    let attempts = 0;
    while (true) {
      out = (plain + grid.bytes[keyPointer % 256]) % 29;
      if (i > 0 && out === previous && randomUint32() % 1000 < 810) {
        keyPointer++;
        attempts++;
        totalRejected++;
        assert(attempts <= 40, "synthetic collision loop");
        continue;
      }
      break;
    }
    const knownIndex = keyPointer % 256;
    assert.equal((out - grid.bytes[knownIndex] % 29 + 29) % 29, plain);
    keyPointer++;
    if (i === 0) encryptedInitials.push(out);
    else if (out === previous) repeated++;
    previous = out;
    maximumRejected = Math.max(maximumRejected, attempts);
  }
}
assert.equal(k, nRunes);
assert(totalRejected > 0 && repeated < 300);
assert.equal(equalityPairs(encryptedInitials), equalityPairs(plantedInitials));
assert.equal(encryptedInitials[0], (plantedInitials[0] + grid.bytes[7]) % 29);

// A page-index source nonce changes every physical page's actual C[0],
// but removing its exactly printed 256-table value recovers the same common
// initial secret-key invariant even if later key skips remain present.
const withSourcePageNonce = encryptedInitials.map((x, i) =>
  (x + grid.bytes[pages[i].page]) % 29);
const recoveredFromPageNonce = withSourcePageNonce.map((x, i) =>
  (x - grid.bytes[pages[i].page] % 29 + 29) % 29);
assert.deepEqual(recoveredFromPageNonce, encryptedInitials);
assert.equal(equalityPairs(recoveredFromPageNonce), 91);

// Orthography sensitivity: first-rune equality can be ordinary in source
// registers outside modern English. These are separately source-pinned GP29
// corpora, rather than re-encodings with a modern-English tokenizer.
const gp29Digits = "0123456789ABCDEFGHIJKLMNOPQRS";
/**
 * @param {string} data Rune indices represented by one GP-base29 digit each.
 * @returns {number[]}
 */
function parseGpBase29(data) {
  return [...data].map(ch => {
    const index = gp29Digits.indexOf(ch);
    assert(index >= 0, "invalid GP-base29 rune");
    return index;
  });
}
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).filter(x => /^[0-9A-S]+$/.test(x)).join("");
const otherRegisters = [
  ["Old English Beowulf", beowulf.sourceGpBase29, 48012, 35057, 15, 10052, 9219],
  ["Latin Vulgate", latinWords, 204802, 191847, 62, 0, 0]
];
const otherRegisterControls = [];
for (const [name, digits, len, windows, min, tail52, tail51] of otherRegisters) {
  assert.equal(digits.length, len);
  const verdict = scanControl(parseGpBase29(digits), originalPairs, nonceRemovedPairs);
  assert.deepEqual([verdict.testedWindows, verdict.minimum,
    verdict.atMostOriginal, verdict.atMostNonceDerived],
  [windows, min, tail52, tail51], name);
  otherRegisterControls.push({name, ...verdict});
}

const totalControlWindows = sourceControls.reduce((sum, x) => sum + x.testedWindows, 0);
const totalControlAtMost = sourceControls.reduce((sum, x) => sum + x.atMostOriginal, 0);
assert.equal(totalControlWindows, 562060);
assert.equal(totalControlAtMost, 42);
const totalControlsAtMostNonce = sourceControls.reduce((sum, x) => sum + x.atMostNonceDerived, 0);
assert.equal(totalControlsAtMostNonce, 27);

console.log(JSON.stringify({
  classification: "page-reset shared-first-key collision-skip gate; no unknown plaintext recovered",
  hypothesis: "C_page[0] = same secret permutation(plaintext_page[0])",
  original: {pages: pages.length, totalRunes: nRunes, pairComparisons: nPairs,
    sameRunePairs: originalPairs, rate: originalPairs / nPairs,
    sourceTablePageNonceRemovedPairs: nonceRemovedPairs},
  controls: sourceControls,
  otherRegisterControls,
  allSourceWindows: totalControlWindows,
  allSourceWindowsAtMostOriginal: totalControlAtMost,
  allSourceWindowsAtMostSourcePageNonce: totalControlsAtMostNonce,
  reversiblePositivePlant: {
    firstRunePairsBefore: equalityPairs(plantedInitials),
    afterSecretPermutation: equalityPairs(permutedInitials),
    afterSourceGridCollisionSkip: equalityPairs(encryptedInitials),
    afterKnownPageNonceRemoval: equalityPairs(recoveredFromPageNonce),
    sourceGridCommonStart: 7,
    rejectedKeySteps: totalRejected,
    acceptedAdjacentRepeats: repeated,
    maximumRejectedAtOnePosition: maximumRejected,
    exactRoundTrip: true
  }
}, null, 2));
