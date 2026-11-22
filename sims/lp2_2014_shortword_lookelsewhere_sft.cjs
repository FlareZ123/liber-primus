"use strict";

/**
 * Familywise test of the original May 23, 2014 LESS/ITS progressive-shift cribs.
 * Original physical-page word-piece profile and rune streams are retained.
 * Node.js 22; zero dependencies; fixed reproducible page-rotation null.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;
const files = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];

function transliterate(input) {
  const word = input.toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const indices = [];
  for (let i = 0; i < word.length;) {
    const two = word.slice(i, i + 2);
    if (gp.has(two)) {
      indices.push(gp.get(two));
      i += 2;
    } else if (gp.has(word[i])) {
      indices.push(gp.get(word[i]));
      i++;
    } else return null;
  }
  return indices;
}
function codeOf(indexSequence) {
  let code = 0;
  for (const x of indexSequence) code = code * 29 + x;
  return code;
}
const dictionary = {3: new Map(), 4: new Map()};
for (const file of files) {
  const source = read(file);
  for (const entry of source.matchAll(/[A-Za-z]+/g)) {
    const v = transliterate(entry[0]);
    if (!v || (v.length !== 3 && v.length !== 4)) continue;
    const k = codeOf(v);
    const old = dictionary[v.length].get(k) || {spelling: entry[0].toLowerCase(), count: 0};
    old.count++;
    dictionary[v.length].set(k, old);
  }
}
assert.equal(dictionary[3].size, 407);
assert.equal(dictionary[4].size, 1177);

/* The source transcription omits all-GP-runeless physical p50. Strip
   whitespace, slash line wrap and the non-GP numeric annotation "7".
   Retain printed hyphen/period/section boundaries as word breaks. */
const chunks = transcript.split("%").slice(0, 55);
const pages = chunks.map((chunk, segment) => {
  const number = segment < 50 ? segment : segment + 1;
  const source = corpus.pages.find((x) => x.page === number);
  const segmented = Array.from(chunk).map((ch) =>
    runes.has(ch) ? ch : /[-.&$§]/.test(ch) ? "-" : "").join("");
  const pieces = segmented.split("-").filter(Boolean).map((w) => Array.from(w).map((ch) => runes.get(ch)));
  assert.deepEqual(pieces.flat(), source.indices);
  return {page: number, indices: source.indices, pieces, lengths: pieces.map((w) => w.length)};
});
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(pages.reduce((n, p) => n + p.lengths.length, 0), 2928);

const targetLESS = transliterate("LESS");
const targetITS = transliterate("ITS");
assert.deepEqual(targetLESS, [20, 18, 15, 15]);
assert.deepEqual(targetITS, [10, 16, 15]);

function sourceMatch(word, target) {
  if (word.length !== target.length) return null;
  const k = mod(target[0] - word[0]);
  return word.every((c, j) => mod(c + k + j) === target[j]) ? k : null;
}
function originalHistoricalHits() {
  const hits = [];
  for (const page of pages) {
    for (const [wordIndex, word] of page.pieces.entries()) {
      const less = sourceMatch(word, targetLESS);
      const its = sourceMatch(word, targetITS);
      if (less !== null || its !== null) {
        hits.push({page: page.page, wordIndex, target: less !== null ? "LESS" : "ITS",
          seed: less !== null ? less : its});
      }
    }
  }
  return hits;
}
const originalNamedHits = originalHistoricalHits();
assert.deepEqual(originalNamedHits, [
  {page: 34, wordIndex: 19, target: "LESS", seed: 27},
  {page: 35, wordIndex: 16, target: "ITS", seed: 26},
  {page: 36, wordIndex: 43, target: "ITS", seed: 13},
  {page: 37, wordIndex: 36, target: "ITS", seed: 12}
]);

/* All source-English GP words of 3 and 4 runes, not only two remembered
   after the fact, are eligible for one page decrement relation s,p -> s-1,p+1.
   We enumerate all 29 seeds per printed local rune-piece. */
function pageHits(page, shift) {
  const four = new Uint16Array(29);
  const three = new Uint16Array(29);
  const source = page.indices, size = source.length;
  let pos = 0;
  for (const n of page.lengths) {
    if (n === 3 || n === 4) {
      const lex = dictionary[n];
      for (let key = 0; key < 29; key++) {
        let packed = 0;
        for (let j = 0; j < n; j++) {
          const cipher = source[(shift + pos + j) % size];
          packed = packed * 29 + (cipher + key + j) % 29;
        }
        if (lex.has(packed)) (n === 3 ? three : four)[key]++;
      }
    }
    pos += n;
  }
  assert.equal(pos, size);
  return {four, three};
}
function pairedScore(perPageHits) {
  let hits = 0, adjacentPairs = 0;
  for (let p = 0; p < pages.length - 1; p++) {
    if (pages[p].page + 1 !== pages[p + 1].page) continue;
    let here = 0;
    const a = perPageHits[p].four, b = perPageHits[p + 1].three;
    for (let k = 0; k < 29; k++) here += a[k] * b[(k + 28) % 29];
    if (here) adjacentPairs++;
    hits += here;
  }
  return {hits, adjacentPairs};
}
const observed = pairedScore(pages.map((p) => pageHits(p, 0)));
assert.deepEqual(observed, {hits: 8, adjacentPairs: 7});

let state = 0x20143301;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
const iterations = 3000;
let greater = 0, greaterPairs = 0, sum = 0, square = 0, min = Infinity, max = 0;
for (let t = 0; t < iterations; t++) {
  const rotated = pages.map((p) => pageHits(p, Math.floor(random() * p.indices.length)));
  const score = pairedScore(rotated);
  greater += Number(score.hits >= observed.hits);
  greaterPairs += Number(score.adjacentPairs >= observed.adjacentPairs);
  sum += score.hits;
  square += score.hits * score.hits;
  min = Math.min(min, score.hits);
  max = Math.max(max, score.hits);
}
const avg = sum / iterations;
const result = {
  context: "May 23 2014 direct idontworkfor3301 IRC proposal; May 24 Mothwing retelling",
  wordPieces: 2928, gpEnglishDictionary: {three: dictionary[3].size, four: dictionary[4].size},
  namedOriginalHits: originalNamedHits, linkedOriginalAnyEnglish: observed,
  null: {kind: "independent pagewise circular original-rune rotations",
    iterations, seed: "0x20143301", mean: avg,
    sd: Math.sqrt(square / iterations - avg * avg), min, max,
    familyUpperP: (greater + 1) / (iterations + 1),
    pagePairUpperP: (greaterPairs + 1) / (iterations + 1)}
};
assert.ok(Math.abs(avg - 5.830333333333333) < 1e-11);
assert.ok(Math.abs(result.null.familyUpperP - 0.24458513828723757) < 1e-12);
console.log(JSON.stringify(result, null, 2));
