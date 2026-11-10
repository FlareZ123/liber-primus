"use strict";
/**
 * Source-locked LP1 p05/p16 paired-grid and prime/totient transfer test.
 *
 * This is a bounded negative, not an LP2 decipherment. It:
 *   1. verifies original JPEG 05.jpg and 16.jpg against SHA256SUMS;
 *   2. parses the p05 5x5 mixed word/number grid and p16 5x5 numeric grid
 *      from the canonical LP1 transcription;
 *   3. maps p05 rune-words through the manuscript GP prime weights;
 *   4. verifies two exact magic squares: the p05 1033 prime-sum matrix and p16's 3301 numeric
 *      square without repairing the two literal 18 cells;
 *   5. tests 48 predeclared 25-symbol periodic additive transfers on all
 *      12,956 original unknown LP2 runes:
 *        {p05 word-grid, p16 numeric-square}
 *        x {raw value, Euler phi(value), phi(prime_at_1_based_index)}
 *        x {row-major, column-major}
 *        x {subtract, add}
 *        x {book-global, reset each physical page}.
 *
 * The prime-index transform is phi(p_n)=p_n-1, motivated by the p16
 * "primes/totient" instruction and the independently solved p56 cipher.
 * This does NOT establish that either square is an LP2 key.
 *
 * Run from repository root:
 *   node sims/lp1_magic_square_prime_totient_gate.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const emerson = read("resources/control/emerson_essays_2944.txt");
const shaSums = read("resources/liber-primus/SHA256SUMS.txt");

const expectedImageSha = {
  "05.jpg": "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
  "16.jpg": "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe"
};
for (const [name, expected] of Object.entries(expectedImageSha)) {
  const bytes = fs.readFileSync(path.join(ROOT, "resources/liber-primus", name));
  const actual = crypto.createHash("sha256").update(bytes).digest("hex");
  const manifest = shaSums.match(new RegExp("^([a-f0-9]{64})\\\\s+" + name.replace(".", "\\\\.") + "$", "m"));
  assert.equal(actual, expected, name + " original image hash");
  assert.ok(manifest, name + " checksum manifest entry");
  assert.equal(manifest[1], actual, name + " checksum manifest agreement");
}

assert.ok(lp1.includes("ᚦᛖ-ᛈᚱᛁᛗᛖᛋ-ᚪᚱᛖ-ᛋᚪᚳ/"));
assert.ok(lp1.includes("ᚱᛖᛞ.ᚦᛖ-ᛏᚩᛏᛁᛖᚾᛏ-ᚠᚢᚾᚳᛏᛡᚾ-ᛁᛋ-ᛋᚪ/"));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpPrime = corpus.prime;
const lines = lp1.split(/\\r?\\n/);
function findFiveRows(prefix) {
  const start = lines.findIndex((line) => line.startsWith(prefix));
  assert.ok(start >= 0, "missing transcription row " + prefix);
  const rows = lines.slice(start, start + 5);
  assert.equal(rows.length, 5);
  assert.ok(rows.every((line) => line.endsWith("/")), "five contiguous source rows");
  return rows;
}
function rowTokens(line) {
  return line.replace(/\\/$/, "").split("-");
}
function tokenValue(token) {
  if (/^\\d+$/.test(token)) return Number(token);
  const indices = [...token].map((r) => {
    assert.ok(runeIndex.has(r), "unmapped source rune " + r);
    return runeIndex.get(r);
  });
  assert.ok(indices.length > 0, "empty word token");
  return indices.reduce((sum, i) => sum + gpPrime[i], 0);
}
const p05Rows = findFiveRows("272-138-");
const p16Rows = findFiveRows("434-1311-");
const A = p05Rows.map((line) => rowTokens(line).map(tokenValue));
const B = p16Rows.map((line) => rowTokens(line).map((token) => {
  assert.match(token, /^\\d+$/, "p16 square must be numeric");
  return Number(token);
}));
for (const M of [A, B]) {
  assert.equal(M.length, 5);
  assert.ok(M.every((r) => r.length === 5));
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++)
    assert.equal(M[i][j], M[4 - i][4 - j], "180-degree source symmetry");
}
function rowSums(M) { return M.map((r) => r.reduce((a, b) => a + b, 0)); }
function colSums(M) { return Array.from({ length: 5 }, (_, j) => M.reduce((s, r) => s + r[j], 0)); }
function diagSums(M) {
  return [
    M.reduce((s, r, i) => s + r[i], 0),
    M.reduce((s, r, i) => s + r[4 - i], 0)
  ];
}
const AStats = { rows: rowSums(A), columns: colSums(A), diagonals: diagSums(A) };
const BStats = { rows: rowSums(B), columns: colSums(B), diagonals: diagSums(B) };
assert.deepEqual(AStats.rows, [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(AStats.columns, [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(AStats.diagonals, [1033, 1033]);
assert.deepEqual(BStats.rows, [3301, 3301, 3301, 3301, 3301]);
assert.deepEqual(BStats.columns, [3301, 3301, 3301, 3301, 3301]);
assert.deepEqual(BStats.diagonals, [3301, 3301]);

function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(n);
  }
  return out;
}
const maxCell = Math.max(...A.flat(), ...B.flat());
const primeList = firstPrimes(maxCell);
function colMajor(M) {
  return Array.from({ length: 5 }, (_, j) =>
    Array.from({ length: 5 }, (_, i) => M[i][j])).flat();
}
function deriveKey(M, transform) {
  return M.flat().map((n) => {
    if (transform === "raw") return n % 29;
    if (transform === "phi") return phi(n) % 29;
    if (transform === "prime-index-totient") return (primeList[n - 1] - 1) % 29;
    throw new Error("unknown transform " + transform);
  });
}
const pages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(pages.length, 56);
const original = pages.flatMap((p) => p.indices);

const GP_MAP = new Map(corpus.translit.map((label, i) => [label, i]));
GP_MAP.set("ING", 21);
function englishToGP(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const token of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < token.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const part = token.slice(i, i + n);
        if (GP_MAP.has(part)) {
          out.push(GP_MAP.get(part));
          i += n;
          found = true;
          break;
        }
      }
      assert.ok(found, "unmapped GP plaintext at " + token.slice(i));
    }
  }
  return out;
}
const train = englishToGP(emerson);
const trigrams = new Map();
let trigramCount = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigrams.set(k, (trigrams.get(k) || 0) + 1);
  trigramCount++;
}
function metrics(indices) {
  const freq = Array(29).fill(0);
  for (const x of indices) freq[x]++;
  const ioc = freq.reduce((s, n) => s + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
  const top12 = freq.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((s, n) => s + n, 0) / indices.length;
  const alpha = 0.05;
  const denominator = trigramCount + alpha * 29 ** 3;
  let logScore = 0;
  for (let i = 0; i + 2 < indices.length; i++) {
    const k = indices[i] * 841 + indices[i + 1] * 29 + indices[i + 2];
    logScore += Math.log(((trigrams.get(k) || 0) + alpha) / denominator);
  }
  return { ioc, top12, trigram: logScore / (indices.length - 2) };
}
function decrypt(key, sign, pageReset) {
  const out = [];
  let globalOffset = 0;
  for (const page of pages) {
    let pageOffset = 0;
    for (const c of page.indices) {
      const offset = pageReset ? pageOffset : globalOffset;
      out.push((c + sign * key[offset % 25] + 29) % 29);
      pageOffset++;
      globalOffset++;
    }
  }
  return out;
}
const baseline = metrics(original);
const positiveTexts = {
  "LP1 A WARNING": "A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED",
  "LP1 WELCOME": "WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE",
  "LP2 AN END": "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE"
};
const positives = Object.fromEntries(Object.entries(positiveTexts).map(([name, text]) => {
  const symbols = englishToGP(text);
  return [name, { length: symbols.length, ...metrics(symbols) }];
}));
assert.equal(positives["LP1 A WARNING"].length, 184);
assert.equal(positives["LP1 WELCOME"].length, 116);
assert.equal(positives["LP2 AN END"].length, 85);

const variants = [];
for (const [matrixName, M] of [["p05-word-grid", A], ["p16-numeric-square", B]]) {
  for (const transform of ["raw", "phi", "prime-index-totient"]) {
    const rowKey = deriveKey(M, transform);
    const colKey = colMajor(Array.from({ length: 5 }, (_, i) => rowKey.slice(i * 5, i * 5 + 5)));
    for (const [traversal, key] of [["row-major", rowKey], ["column-major", colKey]]) {
      for (const sign of [-1, 1]) {
        for (const pageReset of [false, true]) {
          const result = metrics(decrypt(key, sign, pageReset));
          variants.push({
            matrix: matrixName,
            transform,
            traversal,
            direction: sign < 0 ? "subtract" : "add",
            clock: pageReset ? "physical-page-reset" : "book-global",
            ...result
          });
        }
      }
    }
  }
}
assert.equal(variants.length, 48);
const range = (field) => ({
  min: Math.min(...variants.map((v) => v[field])),
  max: Math.max(...variants.map((v) => v[field]))
});
const positiveMin = {
  ioc: Math.min(...Object.values(positives).map((p) => p.ioc)),
  top12: Math.min(...Object.values(positives).map((p) => p.top12)),
  trigram: Math.min(...Object.values(positives).map((p) => p.trigram))
};
assert.ok(range("ioc").max < positiveMin.ioc);
assert.ok(range("top12").max < positiveMin.top12);
assert.ok(range("trigram").max < positiveMin.trigram);

const result = {
  status: "PASS: bounded negative; no LP2 plaintext recovered",
  originalImageSha256: expectedImageSha,
  p05PrimeSumMatrix: A,
  p05LineSums: AStats,
  p16MagicSquare: B,
  p16LineSums: BStats,
  p05AndP16Both180DegreeSymmetric: true,
  p05Literal18CellsPreserved: true,
  originalUnknownRunes: original.length,
  originalBaseline: baseline,
  authenticSolvedTextControls: positives,
  GPTrigramTrainingRunes: train.length,
  testedVariants: variants.length,
  candidateMetricRanges: {
    ioc: range("ioc"),
    top12: range("top12"),
    trigram: range("trigram")
  },
  bestCandidateTrigram: variants.slice().sort((a, b) => b.trigram - a.trigram)[0],
  bestCandidateIoC: variants.slice().sort((a, b) => b.ioc - a.ioc)[0],
  bestCandidateTop12: variants.slice().sort((a, b) => b.top12 - a.top12)[0],
  variants
};
console.log(JSON.stringify(result, null, 2));
