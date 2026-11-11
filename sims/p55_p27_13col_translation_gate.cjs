"use strict";

/**
 * Source-fixed p27 18x13 grid translation -> p55 direct-key gate.
 *
 * Facts fixed upstream:
 * - p55 fold selects fragment18 on physical p27;
 * - physical p27 has exactly 234 = 18*13 runes;
 * - the unique DJU-BEI pair starts at p27 local28 and p55 local70;
 * - in row-major 13-column coordinates these are (2,2) and (5,5).
 *
 * Therefore align the pages by the literal coordinate translation (-3,-3):
 * p55(r,c) reads p27((r-3) mod18, (c-3) mod13). This preserves the whole
 * six-rune duplicate at p55 70..75 -> p27 28..33 and fixes one 76-rune
 * source sequence without a phase, width, or offset search.
 *
 * Test only GP-index and GP-prime-mod29 source projections under the three
 * standard direct same-alphabet orientations C-K, C+K, K-C.
 *
 * Run: node sims/p55_p27_13col_translation_gate.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(
  ROOT, "resources/control/emerson_essays_2944.txt"), "utf8");

const MOD = 29;
const COLS = 13;
const P27_ROWS = 18;
const ROW_SHIFT = 3;
const COL_SHIFT = 3;
const p27 = corpus.pages.find((page) => page.page === 27).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p27.length, P27_ROWS * COLS);
assert.equal(p55.length, 76);

const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(p27.slice(28, 34), bookend);
assert.deepEqual(p55.slice(70, 76), bookend);
assert.deepEqual([Math.floor(28 / COLS), 28 % COLS], [2, 2]);
assert.deepEqual([Math.floor(70 / COLS), 70 % COLS], [5, 5]);

const sourcePositions = p55.map((_, index) => {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const sourceRow = (row - ROW_SHIFT + P27_ROWS) % P27_ROWS;
  const sourceCol = (col - COL_SHIFT + COLS) % COLS;
  return sourceRow * COLS + sourceCol;
});
const keyOrdinal = sourcePositions.map((index) => p27[index]);
assert.deepEqual(sourcePositions.slice(70, 76), [28, 29, 30, 31, 32, 33]);
assert.deepEqual(keyOrdinal.slice(70, 76), bookend);

const outsideAnchorEqualities = p55.slice(0, 70).reduce(
  (count, value, index) => count + Number(value === keyOrdinal[index]), 0);

const keyPrime = keyOrdinal.map((index) => corpus.prime[index] % MOD);
const projections = [
  {name: "gp-index", key: keyOrdinal},
  {name: "gp-prime-mod29", key: keyPrime}
];

const gp = new Map(corpus.translit.map((token, index) => [token, index]));
gp.set("ING", gp.get("NG"));
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {string} source @returns {number[]} */
function encodeEnglish(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find((candidate) => word.startsWith(candidate, offset));
      assert.ok(token, "Unmappable reference spelling: " + word.slice(offset));
      out.push(gp.get(token));
      offset += token.length;
    }
  }
  return out;
}

const english = encodeEnglish(reference);
assert.ok(english.length > 220000);
const tri = new Uint32Array(MOD ** 3);
const TRAIN = 50000;
for (let i = 2; i < TRAIN; i++) {
  tri[english[i - 2] * MOD * MOD + english[i - 1] * MOD + english[i]]++;
}
const alpha = 0.2;
const denominator = TRAIN - 2 + tri.length * alpha;

/** @param {number[]} values @returns {number} */
function score(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    const index = values[i - 2] * MOD * MOD + values[i - 1] * MOD + values[i];
    total += Math.log((tri[index] + alpha) / denominator);
  }
  return total / (values.length - 2);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((index) => corpus.translit[index]).join("");
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {"subtract"|"add"|"beaufort"} mode
 * @returns {number[]}
 */
function decrypt(cipher, key, mode) {
  return cipher.map((value, index) => {
    if (mode === "subtract") return mod(value - key[index]);
    if (mode === "add") return mod(value + key[index]);
    return mod(key[index] - value);
  });
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {"subtract"|"add"|"beaufort"} mode
 * @returns {number[]}
 */
function encrypt(plain, key, mode) {
  return plain.map((value, index) => {
    if (mode === "subtract") return mod(value + key[index]);
    if (mode === "add") return mod(value - key[index]);
    return mod(key[index] - value);
  });
}

const modes = ["subtract", "add", "beaufort"];
const candidates = projections.flatMap((projection) => modes.map((mode) => {
  const plain = decrypt(p55, projection.key, mode);
  return {
    projection: projection.name,
    mode,
    score: score(plain),
    transliteration: translit(plain),
    plain
  };
})).sort((a, b) => b.score - a.score);

const controls = [];
for (let i = 0; i < 1000; i++) {
  const offset = 60000 + i * 137;
  controls.push(score(english.slice(offset, offset + 76)));
}
controls.sort((a, b) => a - b);

const planted = english.slice(210000, 210076);
assert.equal(planted.length, 76);
for (const projection of projections) for (const mode of modes) {
  assert.deepEqual(
    decrypt(encrypt(planted, projection.key, mode), projection.key, mode),
    planted);
}

const result = {
  classification:
    "source-fixed p27 18x13 to p55 13-column translation direct-key gate",
  source: {
    p27Shape: [P27_ROWS, COLS],
    p55Columns: COLS,
    anchorP27: {local: 28, coordinate: [2, 2]},
    anchorP55: {local: 70, coordinate: [5, 5]},
    translationP55ToP27: [-ROW_SHIFT, -COL_SHIFT],
    sourcePositions,
    keyTailMatchesBookend: keyOrdinal.slice(-6).every(
      (value, index) => value === bookend[index]),
    outsideAnchorEqualities,
    keyTransliteration: translit(keyOrdinal)
  },
  candidates: candidates.map(({plain, ...candidate}) => candidate),
  reference: {
    nativeWindows: controls.length,
    nativeMinimum: controls[0],
    nativeMedian: controls[500],
    nativeMaximum: controls.at(-1),
    candidatesBeatingNativeMinimum: candidates.filter(
      (candidate) => candidate.score >= controls[0]).length
  },
  positiveControl: {
    plantedRunes: planted.length,
    allProjectionModesExact: true,
    recoveredScore: score(planted)
  },
  decision: candidates[0].score >= controls[0]
    ? "A frozen grid-translation candidate reaches native-GP range; inspect before any plaintext claim."
    : "All six fixed grid-translation direct variants score below every matched native-GP window; retire direct additive use of this 13-column registration."
};
console.log(JSON.stringify(result, null, 2));
