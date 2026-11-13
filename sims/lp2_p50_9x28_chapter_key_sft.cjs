"use strict";

/**
 * Source-constrained test of the p50 polynomial quotient as a 9 x 28
 * repeating key, one row per original-image-selected LP2 chapter.
 *
 * Run: node sims/lp2_p50_9x28_chapter_key_sft.cjs
 *
 * This is a bounded hypothesis test, not an asserted Cicada cipher.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/base60-grid.json");
const bytes = grid.byte_rows.flat();

assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(corpus.translit.length, 29);

const mod29 = x => ((x % 29) + 29) % 29;
const mod28 = x => ((x % 28) + 28) % 28;

// F(X)=X^4+28X^3+13X^2+9X+14, high-to-low coefficients.
// This is the source-linked product of the signed-2013 BASE29 factor
// and the p39 red-triad factor documented in the existing p50 study.
const F_DESC = [1, 28, 13, 9, 14];
const remainder = bytes.map(x => x % 29);
const quotient = [];
for (let i = 0; i <= remainder.length - F_DESC.length; i++) {
  const lead = remainder[i];
  quotient.push(lead);
  for (let j = 0; j < F_DESC.length; j++) {
    remainder[i + j] = mod29(remainder[i + j] - lead * F_DESC[j]);
  }
}
assert.equal(quotient.length, 252);
assert(remainder.every(x => x === 0), "original p50 vector must divide by F exactly");
assert(quotient.every(x => Number.isInteger(x) && x >= 0 && x < 29));

// Original-image-selected top-level chapters: page groups and lengths are
// independently documented in im-results/lp2-global-original-visual-section-map.md.
const chapterPages = [
  [0, 1, 2],
  [3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26],
  [27, 28, 29, 30, 31, 32],
  [33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
  [54, 55]
];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapters = chapterPages.map(group => group.flatMap(page => {
  const record = corpus.pages.find(x => x.page === page);
  assert(record, "missing original page " + page);
  return record.indices;
}));
assert.deepEqual(chapters.map(x => x.length), expectedLengths);
assert.equal(chapters.flat().length, 12956);
assert.equal(chapters.flat().length, corpus.pages
  .filter(p => p.page >= 0 && p.page <= 55)
  .reduce((n, p) => n + p.indices.length, 0));

// The quotient's natural coefficient order is split row-major into 9 x 28.
const keyRows = Array.from({ length: 9 }, (_, row) =>
  quotient.slice(row * 28, (row + 1) * 28));
assert(keyRows.every(row => row.length === 28));
const rowDistinct = keyRows.map(row => new Set(row).size);
assert.deepEqual(rowDistinct, [16, 19, 21, 16, 19, 16, 18, 17, 22]);

// Read the pinned English quadgram control. Score each chapter independently,
// so no artificial n-grams cross an original visual chapter boundary.
const quadgrams = new Map();
let quadgramTotal = 0;
const modelPath = path.join(root, "resources/control/duko_round27_english_quadgrams.txt");
for (const line of fs.readFileSync(modelPath, "utf8").trim().split(/\r?\n/u)) {
  const [gram, countText] = line.trim().split(/\s+/u);
  if (gram && countText) {
    const count = Number(countText);
    assert(Number.isFinite(count));
    quadgrams.set(gram, count);
    quadgramTotal += count;
  }
}
assert.equal(quadgrams.size, 79495);
assert.equal(quadgramTotal, 7266795);

const translit = indices => indices
  .map(index => corpus.translit[index])
  .join("")
  .replace(/[^A-Z]/gu, "");

function score(chapterArrays) {
  let sum = 0;
  let total = 0;
  const perChapter = [];
  for (const indices of chapterArrays) {
    const text = translit(indices);
    let chapterSum = 0;
    let chapterTotal = 0;
    for (let i = 0; i <= text.length - 4; i++) {
      const gram = text.slice(i, i + 4);
      chapterSum += Math.log10((quadgrams.get(gram) || 0.01) / quadgramTotal);
      chapterTotal++;
    }
    sum += chapterSum;
    total += chapterTotal;
    perChapter.push(chapterSum / chapterTotal);
  }
  return {
    mean: sum / total,
    quadgrams: total,
    perChapter,
    sample: translit(chapterArrays.flat()).slice(0, 180)
  };
}

function indexOfCoincidence(chapterArrays) {
  const indices = chapterArrays.flat();
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value]++;
  const n = indices.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

// Direct GP29 additive/subtractive interpretation: every rune consumes a key
// symbol; each chapter starts with its corresponding 28-symbol row at phase 0.
function applyGp29(chapterArrays, sign, rows = keyRows) {
  return chapterArrays.map((chapter, s) => chapter.map((value, i) =>
    mod29(value + sign * rows[s][i % 28])));
}

// Alternative only if F is a preserved zero-valued interrupter: nonzero
// symbols are shifted in the 28-symbol alphabet 1..28, and F consumes no key.
function applyFNull(chapterArrays, sign, rows = keyRows) {
  return chapterArrays.map((chapter, s) => {
    let keyIndex = 0;
    return chapter.map(value => {
      if (value === 0) return 0;
      const shift = mod28(rows[s][keyIndex % 28]);
      keyIndex++;
      return mod28((value - 1) + sign * shift) + 1;
    });
  });
}

const raw = {
  ioc: indexOfCoincidence(chapters),
  score: score(chapters)
};
const variants = [
  { model: "GP29 all symbols", direction: "subtract", sign: -1,
    output: applyGp29(chapters, -1) },
  { model: "GP29 all symbols", direction: "add", sign: 1,
    output: applyGp29(chapters, 1) },
  { model: "F preserved / GP28 nonzero alphabet", direction: "subtract", sign: -1,
    output: applyFNull(chapters, -1) },
  { model: "F preserved / GP28 nonzero alphabet", direction: "add", sign: 1,
    output: applyFNull(chapters, 1) }
];
for (const variant of variants) {
  const replay = variant.model === "GP29 all symbols"
    ? applyGp29(variant.output, -variant.sign)
    : applyFNull(variant.output, -variant.sign);
  assert.deepEqual(replay, chapters, "candidate must replay original ciphertext");
  variant.ioc = indexOfCoincidence(variant.output);
  variant.score = score(variant.output);
  delete variant.output;
}

const directQuotient = {
  ioc: indexOfCoincidence([quotient]),
  score: score([quotient])
};
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
assert(translit(p57).startsWith("PARABLE"));
const p57Score = score([p57]);

// Eighteen independent positive plants: every key row, both signs, and both
// reversible alphabet models must recover authentic solved p57 plaintext.
let positiveControls = 0;
for (let row = 0; row < 9; row++) {
  for (const sign of [-1, 1]) {
    const oneRow = [keyRows[row]];
    const plantedGp29 = applyGp29([p57], sign, oneRow);
    assert.deepEqual(applyGp29(plantedGp29, -sign, oneRow), [p57]);
    const plantedFNull = applyFNull([p57], sign, oneRow);
    assert.deepEqual(applyFNull(plantedFNull, -sign, oneRow), [p57]);
    positiveControls += 2;
  }
}
assert.equal(positiveControls, 36);

assert(Math.abs(directQuotient.score.mean - (-7.508975430564677)) < 1e-10);
assert(Math.abs(raw.score.mean - (-7.4391377865159365)) < 1e-10);
assert(Math.abs(p57Score.mean - (-4.420633417052125)) < 1e-10);
assert(Math.abs(variants[0].score.mean - (-7.517838228623048)) < 1e-10);
assert(Math.abs(variants[1].score.mean - (-7.51020953588241)) < 1e-10);
assert(Math.abs(variants[2].score.mean - (-7.517046571340038)) < 1e-10);
assert(Math.abs(variants[3].score.mean - (-7.514200204116361)) < 1e-10);

console.log(JSON.stringify({
  source: {
    p50ByteSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    polynomialHighToLow: F_DESC,
    quotientLength: quotient.length,
    remainder,
    chapterPages,
    chapterLengths: chapters.map(x => x.length),
    keyRowDistinctCounts: rowDistinct
  },
  directQuotientAsGp29Plaintext: directQuotient,
  raw,
  variants,
  solvedP57PositiveControl: { length: p57.length, ioc: indexOfCoincidence([p57]), score: p57Score },
  positiveControls,
  result: "The fixed 9x28 row-major chapter-key inverses do not recover language."
}, null, 2));
