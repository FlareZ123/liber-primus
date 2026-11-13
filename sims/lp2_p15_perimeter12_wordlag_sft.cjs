"use strict";

/**
 * LP2 source-pinned 12-word-lag screen and p15-spiral perimeter transport.
 * Exploratory structural diagnostic, not a plaintext decoder.
 *
 * Run: node sims/lp2_p15_perimeter12_wordlag_sft.cjs
 * Inputs: canonical physical transcript and solved GP source references.
 * Outputs: complete 181-lag look-elsewhere and two frozen direct ring decoders.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
const source = raw.split("%").slice(0, 55).join("%");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const prior = parseSharedCorpus();
const GP = /[\u16A0-\u16FF]/u;

/**
 * Preserve a cross-line/page word as one word at its START page and line.
 * @returns {Array<{len:number,page:number,line:number}>}
 */
function parseWords() {
  const words = [];
  let rune = "", page = 0, line = 0, startPage = 0, startLine = 0;
  function flush() {
    if (rune) words.push({len: [...rune].length, page: startPage, line: startLine});
    rune = "";
  }
  for (const ch of source) {
    if (GP.test(ch)) {
      if (!rune) { startPage = page; startLine = line; }
      rune += ch;
    } else if (ch === "%") {
      page++; line++;
    } else if (ch === "/" || ch === "\n") {
      line++;
    } else if (!/\s/u.test(ch)) flush();
  }
  flush();
  return words;
}
const words = parseWords();
assert.equal(words.length, 2896);
assert.equal(words.reduce((s, w) => s + w.len, 0), 12956);
assert.deepEqual(words.map(w => w.len), prior.words.map(w => w.length));
const a = words.map(w => w.len);
const x = a.map(len => Math.min(len, 10));
const n = x.length, mean = x.reduce((s, v) => s + v, 0) / n;
const variance = x.reduce((s, v) => s + (v - mean) ** 2, 0) / n;

/** @param {number[]} values @param {number} lag */
function correlation(values, lag) {
  let sum = 0;
  for (let i = lag; i < values.length; i++) {
    sum += (values[i] - mean) * (values[i - lag] - mean);
  }
  return sum / (values.length - lag) / variance;
}

/** Pearson chi-square of nine-class GP word-length transitions. */
function chi(values) {
  const rows = Array(10).fill(0), cols = Array(10).fill(0);
  const pairs = Array.from({length: 10}, () => Array(10).fill(0));
  for (let i = 1; i < values.length; i++) {
    const j = Math.min(9, values[i - 1]), k = Math.min(9, values[i]);
    rows[j]++; cols[k]++; pairs[j][k]++;
  }
  let total = 0;
  for (let j = 1; j < 10; j++) for (let k = 1; k < 10; k++) {
    const expected = rows[j] * cols[k] / (values.length - 1);
    if (expected) total += (pairs[j][k] - expected) ** 2 / expected;
  }
  return total;
}

/** @param {number} start */
function generator(start) {
  let seed = start >>> 0;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
}

/**
 * @template T
 * @param {T[]} values
 * @param {()=>number} random
 */
function shuffle(values, random) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
const observedR12 = correlation(x, 12);
const observedMax = Math.max(...Array.from({length: 181},
  (_, i) => Math.abs(correlation(x, i + 1))));
assert(Math.abs(observedR12 - 0.07288391616042422) < 1e-12);
assert.equal(observedMax, observedR12);

// Exact page-wise and line-wise inventory-preserving nulls.
const pages = [];
const linesByPage = [];
for (const w of words) {
  if (!pages[w.page]) { pages[w.page] = []; linesByPage[w.page] = []; }
  pages[w.page].push(Math.min(w.len, 10));
  const lines = linesByPage[w.page];
  if (!lines.length || lines[lines.length - 1].line !== w.line) {
    lines.push({line: w.line, values: []});
  }
  lines[lines.length - 1].values.push(Math.min(w.len, 10));
}
assert.equal(pages.length, 55);
const nulls = {};
for (const kind of ["page", "line"]) {
  const random = generator(kind === "page" ? 0x3301c025 : 0x3301ca13);
  let marginalExceed = 0, familyExceed = 0, sum = 0;
  for (let rep = 0; rep < 500; rep++) {
    const out = [];
    for (let p = 0; p < pages.length; p++) {
      if (kind === "page") {
        const z = shuffle(pages[p].slice(), random);
        out.push(...z);
      } else {
        const blocks = shuffle(linesByPage[p].slice(), random);
        for (const block of blocks) out.push(...block.values);
      }
    }
    assert.equal(out.length, n);
    const r12 = correlation(out, 12);
    sum += r12;
    if (r12 >= observedR12) marginalExceed++;
    let maximum = 0;
    for (let lag = 1; lag <= 181; lag++) {
      maximum = Math.max(maximum, Math.abs(correlation(out, lag)));
    }
    if (maximum >= observedMax) familyExceed++;
  }
  nulls[kind] = {meanR12: sum / 500, upperP12: (marginalExceed + 1) / 501,
    upperP181lags: (familyExceed + 1) / 501};
}

// Original physical p15 4x4 Fibonacci-prime spiral, printed row-major.
const grid = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const outer = [[0,0],[0,1],[0,2],[0,3],[1,0],[1,3],
  [2,0],[2,3],[3,0],[3,1],[3,2],[3,3]];
const spiral = [[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],
  [1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
assert.deepEqual(spiral.map(([y,z]) => grid[y][z]),
  [3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const order = spiral.map(([y,z]) =>
  outer.findIndex(([a,b]) => a === y && b === z));
const inverseOrder = order.map((_, j) => order.indexOf(j));
assert.equal(new Set(order).size, 12);
assert.deepEqual(order, [6,4,0,1,2,3,5,7,11,10,9,8]);
assert.equal(a.length, 12 * 241 + 4);

/**
 * Transpose a row-major 241 x 12 matrix in a source-fixed perimeter order.
 * The four other words are held as a literal prefix or suffix.
 * @param {number[]} input
 * @param {number[]} permutation
 * @param {"front"|"back"} tail
 */
function decode(input, permutation, tail) {
  const body = tail === "front" ? input.slice(4) : input.slice(0, 2892);
  const rest = tail === "front" ? input.slice(0, 4) : input.slice(2892);
  const result = [];
  for (const j of permutation) {
    for (let i = 0; i < 241; i++) result.push(body[12 * i + j]);
  }
  return tail === "front" ? rest.concat(result) : result.concat(rest);
}
function encode(plain, permutation, tail) {
  const body = tail === "front" ? plain.slice(4) : plain.slice(0, 2892);
  const rest = tail === "front" ? plain.slice(0, 4) : plain.slice(2892);
  const result = Array(2892);
  for (let k = 0; k < permutation.length; k++) {
    const j = permutation[k];
    for (let i = 0; i < 241; i++) result[12 * i + j] = body[241 * k + i];
  }
  return tail === "front" ? rest.concat(result) : result.concat(rest);
}
const variants = [];
for (const [label, permutation] of [["spiral",order],["inverse",inverseOrder]]) {
  for (const tail of ["front","back"]) {
    const restored = decode(a, permutation, tail);
    assert.deepEqual(encode(restored, permutation, tail), a);
    // Positive: exactly restore a held-out GP-native word stream.
    const english = fs.readFileSync(path.join(ROOT, "resources", "control",
      "shakespeare_first300k.txt"), "utf8").toUpperCase()
      .replace(/QU/g, "CW")
      .replace(/[VKZQ]/g, ch => ({V:"U",K:"C",Z:"S",Q:"C"})[ch]);
    const planted = (english.match(/[A-Z]+/g) || []).slice(0, 2896)
      .map(word => (word.match(/ING|TH|EO|NG|OE|AE|IA|EA|IO|./g) || []).length);
    assert.equal(planted.length, 2896);
    assert.deepEqual(decode(encode(planted, permutation, tail), permutation, tail),
      planted);
    variants.push({label: label + "/" + tail, permutation, tail,
      chi: chi(restored)});
  }
}
const nullRandom = generator(0x3301ee12);
const permuted = a.slice();
const best = Math.max(...variants.map(v => v.chi));
let exceeded = 0;
for (let rep = 0; rep < 1000; rep++) {
  shuffle(permuted, nullRandom);
  const maximum = Math.max(...variants.map(v =>
    chi(decode(permuted, v.permutation, v.tail))));
  if (maximum >= best) exceeded++;
}
const result = {words: n, runes: prior.runeCount, originalChi: chi(a),
  observedR12, observedMaxOver181Lags: observedMax, nulls,
  p15PerimeterOrder: order, candidates: variants.map(v => ({name:v.label,
    chi:v.chi})), bestChi: best,
  allFourVariantsMatchedShuffleP: (exceeded+1)/1001};
console.log(JSON.stringify(result, null, 2));

/** Preserve exactly original p15..p22 source chapter, with word-start ownership. */
const chapter15Words = words.filter(w => w.page >= 15 && w.page <= 22);
assert.equal(chapter15Words.length, 437);
const chapter15 = chapter15Words.map(w => w.len);
assert.equal(chapter15.reduce((s,w) => s+w,0), 1903);

/** @param {number[]} source @param {number[]} permutation @param {"front"|"back"} tail */
function decodeChapter(source, permutation, tail) {
  const extraCount = source.length % 12;
  const rows = Math.floor(source.length / 12);
  const front = tail === "front";
  const body = front ? source.slice(extraCount) : source.slice(0, rows*12);
  const rest = front ? source.slice(0, extraCount) : source.slice(rows*12);
  const output = [];
  for (const j of permutation) for (let i=0;i<rows;i++) {
    output.push(body[12*i+j]);
  }
  return front ? rest.concat(output) : output.concat(rest);
}
/** @param {number[]} source @param {number[]} permutation @param {"front"|"back"} tail */
function encodeChapter(source, permutation, tail) {
  const extraCount = source.length % 12;
  const rows = Math.floor(source.length / 12);
  const front = tail === "front";
  const body = front ? source.slice(extraCount) : source.slice(0, rows*12);
  const rest = front ? source.slice(0, extraCount) : source.slice(rows*12);
  const output = Array(rows*12);
  for (let j=0;j<12;j++)for(let i=0;i<rows;i++){
    output[12*i+permutation[j]]=body[rows*j+i];
  }
  return front ? rest.concat(output) : output.concat(rest);
}
const chapterVariants = [];
for (const [label,permutation] of [["spiral",order],["inverse",inverseOrder]]) {
  for (const tail of ["front","back"]) {
    const dec=decodeChapter(chapter15,permutation,tail);
    assert.deepEqual(encodeChapter(dec,permutation,tail),chapter15);
    chapterVariants.push({label:label+"/"+tail,chi:chi(dec),permutation,tail});
  }
}
const chapterBest = Math.max(...chapterVariants.map(v=>v.chi));
const chapterRandom = generator(0x33014547);
const randomChapter=chapter15.slice();
let chapterExceed=0;
for(let rep=0;rep<3000;rep++){
  shuffle(randomChapter,chapterRandom);
  let candidateMaximum=0;
  for(const v of chapterVariants)candidateMaximum=Math.max(candidateMaximum,
    chi(decodeChapter(randomChapter,v.permutation,v.tail)));
  if(candidateMaximum>=chapterBest)chapterExceed++;
}
console.log(JSON.stringify({
  chapter15to22: {words:chapter15.length,runes:1903,remainder:chapter15.length%12,
    originalChi:chi(chapter15),
    fourVariantChi:chapterVariants.map(v=>({label:v.label,chi:v.chi})),
    maxChi:chapterBest,matchedShuffleP:(chapterExceed+1)/3001}
},null,2));
