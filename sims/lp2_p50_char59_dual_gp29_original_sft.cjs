"use strict";

/**
 * Source-character test: p50 printed 59-symbol second glyphs as two complete
 * GP29 alphabets plus one literal x escape, selected by five printed leading
 * digits. No byte radix, learned symbol key, plaintext crib, or key fitting.
 *
 * Execute from repository root: node sims/lp2_p50_char59_dual_gp29_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = table.alphabet.replace("f", "");
const tokens = table.rows.flat();
assert.equal(table.alphabet, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
assert.equal(alphabet.length, 59);
assert.equal(gp.runes.length, 29);
assert.equal(tokens.length, 256);
assert.deepEqual(table.rows.map(row => row.length), Array(32).fill(8));

/**
 * The right-hand source glyphs 0..28 / 29..57 are two 29-rune banks.
 * Glyph 58 ('x') is reserved as a lossless escape and omitted from text.
 * Each distinct (first digit, bank) admits a completely secret GP29
 * permutation. This generous cipher family preserves within-mode equality.
 * @typedef {{position:number, code:number}} ModeItem
 * @type {ModeItem[][]}
 */
const groups = Array.from({length: 10}, () => []);
const escapes = [];
/** @type {number[]} */
const sourceCodes = Array(256).fill(-1);
const firstDigitCounts = Array(5).fill(0);
const rightGlyphs = new Set();
for (const [position, token] of tokens.entries()) {
  assert.match(token, /^[0-4][0-9A-Za-z]$/);
  const first = Number(token[0]);
  const second = alphabet.indexOf(token[1]);
  assert(second >= 0, "all printed glyphs belong to compressed alphabet");
  firstDigitCounts[first]++;
  rightGlyphs.add(token[1]);
  if (second === 58) {
    escapes.push(position);
    continue;
  }
  const bank = second >= 29 ? 1 : 0;
  const code = second % 29;
  const mode = 2 * first + bank;
  groups[mode].push({position, code});
  sourceCodes[position] = code;
}
assert.equal(rightGlyphs.size, 59);
assert.deepEqual(firstDigitCounts, [60, 58, 65, 56, 17]);
assert.deepEqual(escapes, [22, 51, 129, 219]);
assert.deepEqual(groups.map(g => g.length), [22, 35, 34, 24, 29, 35, 30, 26, 17, 0]);

/**
 * Exact same-secret-alphabet collision invariant, with source mode schedule.
 * @param {number[]} sequence 256 GP rune values; escapes may be -1.
 * @returns {{pairs:number,hits:number}}
 */
function collisions(sequence) {
  assert.equal(sequence.length, 256);
  let pairs = 0;
  let hits = 0;
  for (const group of groups) {
    const counts = Array(29).fill(0);
    for (const {position} of group) {
      const value = sequence[position];
      assert(Number.isInteger(value) && value >= 0 && value < 29);
      counts[value]++;
    }
    pairs += group.length * (group.length - 1) / 2;
    for (const n of counts) hits += n * (n - 1) / 2;
  }
  return {pairs, hits};
}

const actual = collisions(sourceCodes);
assert.deepEqual(actual, {pairs: 3560, hits: 124});

// Real solved-LP1 rune witness; no guessed English-to-GP transliteration.
const originalLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const sectionStart = originalLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const sectionEnd = originalLP1.indexOf("\n$\n%\n", sectionStart);
assert(sectionStart >= 0 && sectionEnd > sectionStart);
const symbols = new Map(gp.runes.map((rune, i) => [rune, i]));
const native = [...originalLP1.slice(sectionStart, sectionEnd)]
  .filter(character => symbols.has(character))
  .map(character => symbols.get(character));
assert.equal(native.length, 755);
const nativeResults = [];
for (let start = 0; start + 256 <= native.length; start++) {
  nativeResults.push(collisions(native.slice(start, start + 256)).hits);
}
assert.equal(nativeResults.length, 500);
const minimum = Math.min(...nativeResults);
const maximum = Math.max(...nativeResults);
assert.equal(minimum, 170);
assert.equal(maximum, 292);
assert(nativeResults.every(hit => hit > actual.hits), "native-GP original window contradiction");

// Stronger-than-needed positive: encrypt a real source-native 256-rune sample
// under ten independently secret affine permutations and encode both literal
// 29-symbol banks with original 2-character token shape. Invert each token.
const coefficients = [1, 2, 3, 5, 7, 11, 13, 17, 19, 23];
const shifts = coefficients.map((_, mode) => (11 * mode + 5) % 29);
/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;
/** @param {number} value @returns {number} */
function inverse(value) {
  const result = Array.from({length: 28}, (_, i) => i + 1)
    .find(candidate => candidate * value % 29 === 1);
  assert(result);
  return result;
}
const plant = native.slice(0, 256);
const planted = tokens.slice();
const plantedCodes = Array(256).fill(-1);
let restored = 0;
for (let mode = 0; mode < 10; mode++) {
  const bank = mode % 2;
  for (const {position} of groups[mode]) {
    const rawCode = mod(coefficients[mode] * plant[position] + shifts[mode]);
    planted[position] = tokens[position][0] + alphabet[29 * bank + rawCode];
    const observedCode = alphabet.indexOf(planted[position][1]) % 29;
    const decoded = mod(inverse(coefficients[mode]) * (observedCode - shifts[mode]));
    assert.equal(decoded, plant[position]);
    plantedCodes[position] = observedCode;
    restored++;
  }
}
assert.equal(restored, 252);
for (const position of escapes) assert.equal(planted[position], tokens[position]);
assert.deepEqual(collisions(plantedCodes), collisions(plant));
assert(collisions(plant).hits >= minimum, "actual source-native plant collision signal");

// A possible source-led but unselected fully reversible direct GP rune
// readout: multiply each bank rune by the inverse of the corresponding
// printed p7 five-red-word product. All sidecar mode/escape glyphs are kept.
const fiveP7Products = [11, 26, 8, 15, 2];
const directGP = tokens.flatMap(token => {
  const second = alphabet.indexOf(token[1]);
  if (second === 58) return [];
  return [mod(second * inverse(fiveP7Products[Number(token[0])]))];
});
assert.equal(directGP.length, 252);
const counts = Array(29).fill(0);
for (const rune of directGP) counts[rune]++;
const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0) /
  (directGP.length * (directGP.length - 1));
assert(Math.abs(ioc - 0.03573009549105167) < 1e-13);

process.stdout.write(JSON.stringify({
  input: "original physical p49-p51 32x8 printed numeral cells",
  premise: "59-character right glyph = two GP29 banks + one x escape",
  modes: "five printed first digits times two banks; 10 arbitrary secret permutations",
  firstDigitCounts,
  reservedXPositions: escapes,
  populatedModes: groups.map(g => g.length),
  keyIndependentOriginal: actual,
  solvedLP1PhysicalP10to13: {
    runes: native.length,
    windows256: nativeResults.length,
    leastCollisions: minimum,
    greatestCollisions: maximum,
    windowsAtOrBelowOriginal: nativeResults.filter(n => n <= actual.hits).length
  },
  nativePositivePlant: {fullyRecoveredDataRunes: restored, of: 252,
    collisions: collisions(plantedCodes)},
  sourceP7ProductsDirectRead: {extractedRunes: directGP.length,
    ioc, preview: directGP.slice(0, 80).map(x => gp.translit[x]).join(" ")},
  outcome: "no independently source-selected character grammar recovers native-GP prose"
}, null, 2) + "\n");
