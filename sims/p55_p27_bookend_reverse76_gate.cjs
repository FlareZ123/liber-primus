"use strict";

/**
 * Frozen p27 reverse-window -> p55 direct-key gate.
 *
 * Inputs are all independently fixed by the current source-navigation chain:
 * - fold-selected p27 $ section, 1433 runes;
 * - unique p27/p55 bookend DJU-BEI;
 * - canonical word-number gap 1432 mod1433 = -1, fixing backward traversal;
 * - p55 target length 76.
 *
 * Starting at p55 local75 / p27 section local33 and walking both targets
 * backward fixes one cyclic 76-rune p27 window. In forward p55 order it is
 * section[1391..1432] || section[0..33], with no phase search.
 *
 * Test only the standard direct same-alphabet additive orientations under
 * GP-index and GP-prime-mod29 projections. No phase, permutation, fitted IV,
 * or alternate anchor is searched.
 *
 * Run: node sims/p55_p27_bookend_reverse76_gate.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"), "utf8");
const reference = fs.readFileSync(path.join(
  ROOT, "resources/control/emerson_essays_2944.txt"), "utf8");

const MOD = 29;
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pageByNumber = new Map(corpus.pages.map((page) => [page.page, page]));
const p27 = pageByNumber.get(27).indices;
const p55 = pageByNumber.get(55).indices;
assert.equal(p55.length, 76);

const sectionRunes = [...transcription.split("$")[5]]
  .filter((character) => runeToIndex.has(character))
  .map((rune) => runeToIndex.get(rune));
assert.equal(sectionRunes.length, 1433);
assert.deepEqual(sectionRunes.slice(0, 19), p27.slice(0, 19));

const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(p27.slice(28, 34), bookend);
assert.deepEqual(p55.slice(70, 76), bookend);

const sectionAnchorEnd = 33;
const targetAnchorEnd = 75;
const windowLength = p55.length;
const start = ((sectionAnchorEnd - (windowLength - 1)) % sectionRunes.length
  + sectionRunes.length) % sectionRunes.length;
assert.equal(start, 1391);
const keyOrdinal = Array.from({length: windowLength}, (_, offset) =>
  sectionRunes[(start + offset) % sectionRunes.length]);
assert.deepEqual(keyOrdinal.slice(70, 76), bookend);

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
 * Direct same-alphabet decipherment.
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
 * Exact forward emitter for positive controls.
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
    "source-fixed p27 reverse-window direct p55 gate; no phase search",
  source: {
    selectedSectionRunes: sectionRunes.length,
    reverseStep: sectionRunes.length - 1,
    p27BookendLocal: [28, 33],
    p55BookendLocal: [70, 75],
    bookendTransliteration: translit(bookend),
    targetLength: windowLength,
    cyclicWindowStart: start,
    cyclicWindowEnd: sectionAnchorEnd,
    keyTailMatchesBookend: keyOrdinal.slice(-6).every(
      (value, index) => value === bookend[index]),
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
    ? "A frozen candidate reaches native-GP range; inspect before any plaintext claim."
    : "All six source-fixed direct variants score below every matched native-GP window; retire direct additive use of the anchored reverse p27 window."
};
console.log(JSON.stringify(result, null, 2));
