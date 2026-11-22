"use strict";
/**
 * All-secret per-mode monoalphabetic no-go gate for the exact 2014 B1033
 * CHANGE eigencoordinate architecture on two original LP2 sections.
 *
 * For fixed source B, each full five-rune block C has eigencoordinates
 * X=V^-1*C mod29. Any independently chosen 29! bijection for each physical
 * page and each of the five eigencoordinates preserves identical-symbol pair
 * counts within that page/mode. Arbitrary per-page fixed mode permutations
 * also preserve their sum. This is an exact theorem over EVERY secret alphabet,
 * with no key search and no plaintext-informed model choice.
 *
 * Both native GP controls and original input retain fixed source page lengths.
 * The separate chapter-contiguous clock retains all complete 5-blocks.
 * Incomplete trailing page blocks remain outside the page-reset model.
 *
 * Read-only; Node.js 22, CommonJS, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const KEYS = [5, 8, 24, 21, 18]; // source LP1 warning: C H A NG E
const EXPECTED_V = [
  [1,1,1,1,1], [0,24,11,18,1], [0,8,0,20,1],
  [0,24,18,18,1], [28,1,28,1,1]
];
const EXPECTED_INV = [
  [15,25,0,4,14], [1,5,17,5,1], [0,4,0,25,0],
  [8,18,6,18,8], [6,6,6,6,6]
];

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
/** @param {number} x @returns {number} */
function mod(x) { return (x % MOD + MOD) % MOD; }
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let v = 1; v < MOD; v++) if (mod(x * v) === 1) return v;
  throw new Error("noninvertible GF29 value: " + x);
}
/** @param {number[][]} a @returns {number[][]} */
function invertMatrix(a) {
  const n = a.length;
  const m = a.map((r, i) => [
    ...r.map(mod), ...Array.from({length:n}, (_, j) => Number(i === j))
  ]);
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && !m[p][c]) p++;
    assert.ok(p < n, "matrix must be invertible");
    [m[c], m[p]] = [m[p], m[c]];
    const z = inverse(m[c][c]);
    m[c] = m[c].map(x => mod(x * z));
    for (let r = 0; r < n; r++) if (r !== c) {
      const k = m[r][c];
      m[r] = m[r].map((x, j) => mod(x - k * m[c][j]));
    }
  }
  return m.map(r => r.slice(n));
}
/**
 * Canonically normalize a right eigenvector by its first nonzero component.
 * @param {number[][]} square @param {number} eigen @returns {number[]}
 */
function eigenvector(square, eigen) {
  const n = square.length;
  const m = square.map((r, i) => r.map((x, j) => mod(x - (i === j ? eigen : 0))));
  const pivots = [];
  let row = 0;
  for (let c = 0; c < n && row < n; c++) {
    let p = row;
    while (p < n && !m[p][c]) p++;
    if (p === n) continue;
    [m[row], m[p]] = [m[p], m[row]];
    const z = inverse(m[row][c]);
    m[row] = m[row].map(x => mod(x*z));
    for (let r = 0; r < n; r++) if (r !== row) {
      const f = m[r][c];
      m[r] = m[r].map((x, j) => mod(x - f*m[row][j]));
    }
    pivots.push(c);
    row++;
  }
  const free = Array.from({length:n}, (_, i) => i).filter(i => !pivots.includes(i));
  assert.equal(free.length, 1, "source eigenvalue must have one-dimensional kernel");
  const v = Array(n).fill(0);
  v[free[0]] = 1;
  for (let i = 0; i < pivots.length; i++) v[pivots[i]] = mod(-m[i][free[0]]);
  const scale = inverse(v.find(x => x !== 0));
  return v.map(x => mod(x*scale));
}
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
function times(m, v) {
  return m.map(row => mod(row.reduce((s, x, j) => s + x*v[j], 0)));
}
const rawSquares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/).map(s =>
    s.trim().split(/\r?\n/).map(row => row.trim().split(/\s+/).map(Number)));
assert.equal(rawSquares.length, 3);
const B = rawSquares[2];
assert.deepEqual(B.map(r => r.length), [5,5,5,5,5]);
for (const row of B) assert.equal(row.reduce((s,x) => s+x), 1033);
const Vcolumns = KEYS.map(key => eigenvector(B, key));
const V = Array.from({length:5}, (_, i) => Vcolumns.map(column => column[i]));
assert.deepEqual(V, EXPECTED_V);
const VI = invertMatrix(V);
assert.deepEqual(VI, EXPECTED_INV);
for (let i = 0; i < 5; i++) {
  assert.deepEqual(times(B, Vcolumns[i]).map(mod),
    Vcolumns[i].map(x => mod(x*KEYS[i])));
  const unit = Array.from({length:5}, (_, j) => Number(i===j));
  assert.deepEqual(times(VI, Vcolumns[i]), unit);
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const map = new Map(corpus.translit.map((token, i) => [token, i]));
assert.equal(map.size, 29);
/** Exact existing project GP spelling policy: QU->CW, K/Q->C, V->U, Z->S, digraphs greedy. */
function englishGP(text) {
  const clean = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, " ");
  const result = [];
  for (const word of clean.split(" ")) {
    for (let j = 0; j < word.length;) {
      const digraph = map.get(word.slice(j, j+2));
      if (digraph !== undefined) { result.push(digraph); j+=2; }
      else {
        const value = map.get(word[j]);
        assert.notEqual(value, undefined);
        result.push(value); j++;
      }
    }
  }
  return result;
}
/** @param {number[]} data @returns {number[][]} */
function decodeFive(data) {
  const lanes = Array.from({length:5}, () => []);
  for (let j = 0; j+5 <= data.length; j += 5) {
    const output = times(VI, data.slice(j, j+5));
    for (let k = 0; k < 5; k++) lanes[k].push(output[k]);
  }
  return lanes;
}
/** @param {number[]} data @returns {number[][]} */
function nativeFive(data) {
  const lanes = Array.from({length:5}, () => []);
  for (let j = 0; j+5 <= data.length; j += 5) {
    for (let k = 0; k < 5; k++) lanes[k].push(data[j+k]);
  }
  return lanes;
}
/** @param {number[]} lane @returns {number} */
function equalPairs(lane) {
  const hist = Array(29).fill(0);
  for (const x of lane) { assert.ok(x>=0 && x<29); hist[x]++; }
  return hist.reduce((sum, n) => sum + n*(n-1)/2, 0);
}
/**
 * The exact invariant under ANY mode-wise alphabet bijection, independently
 * for each page if clock="pages"; mode order may be permuted per page.
 * @param {number[][]} pages @param {"pages"|"chapter"} clock
 * @param {boolean} spectral @returns {{pairs:number,processed:number}}
 */
function invariant(pages, clock, spectral) {
  const units = clock === "chapter" ? [pages.flat()] : pages;
  let pairs = 0, processed = 0;
  for (const data of units) {
    const lanes = spectral ? decodeFive(data) : nativeFive(data);
    for (const lane of lanes) { pairs += equalPairs(lane); processed += lane.length; }
  }
  return {pairs,processed};
}
/** Fixed original page sizes used identically on each native-control window. */
function shapedWindow(arr, start, lengths) {
  let at = start;
  return lengths.map(n => { const slice = arr.slice(at, at+n); at+=n; return slice; });
}
/** @param {number[][]} pages @returns {number[][]} */
function encodeNativePlant(pages) {
  return pages.map((data, page) => {
    const cipher = data.slice();
    for (let j = 0; j+5 <= data.length; j+=5) {
      const coords = [];
      for (let k = 0; k < 5; k++) {
        const alpha = 1 + (page*7+k*3)%28;
        const beta = (page*11+k*5)%29;
        const shifted = data[j+(k+page)%5];
        coords.push(mod(inverse(alpha)*(shifted-beta)));
      }
      const packet = times(V, coords);
      for (let k = 0; k < 5; k++) cipher[j+k] = packet[k];
    }
    return cipher;
  });
}
const donors = [
  {name:"Gibran", file:"resources/control/gibran_prophet_58585.txt"},
  {name:"Shakespeare",file:"resources/control/shakespeare_first300k.txt"},
  {name:"Emerson",file:"resources/control/emerson_essays_2944.txt"}
].map(x => ({name:x.name, symbols:englishGP(read(x.file))}));
const sections = [
  {first:33,last:39,total:1680,pagePairs:1398,chapterPairs:9756,pageProcessed:1665},
  {first:40,last:53,total:3008,pagePairs:2511,chapterPairs:31187,pageProcessed:2980}
];
const results = [];
for (const section of sections) {
  const pages = corpus.pages.filter(p =>
    p.page >= section.first && p.page <= section.last && p.indices.length)
    .map(p => p.indices);
  const lengths = pages.map(p => p.length);
  const total = lengths.reduce((s,n) => s+n,0);
  assert.equal(total, section.total);
  const realPage = invariant(pages,"pages",true);
  const realChapter = invariant(pages,"chapter",true);
  assert.deepEqual(realPage,{pairs:section.pagePairs,processed:section.pageProcessed});
  assert.equal(realChapter.pairs,section.chapterPairs);
  assert.equal(realChapter.processed,total-total%5);
  const witnesses = [];
  for (const donor of donors) {
    const values = {pages:[], chapter:[]};
    for (let start = 0; start+total <= donor.symbols.length; start+=137) {
      const sample = shapedWindow(donor.symbols,start,lengths);
      values.pages.push(invariant(sample,"pages",false).pairs);
      values.chapter.push(invariant(sample,"chapter",false).pairs);
    }
    assert.ok(values.pages.length>300);
    const minPage = Math.min(...values.pages);
    const minChapter = Math.min(...values.chapter);
    assert.ok(realPage.pairs < minPage, "actual source must be below entire donor panel");
    assert.ok(realChapter.pairs < minChapter);
    witnesses.push({donor:donor.name,windows:values.pages.length,
      minimumPagePairs:minPage,minimumChapterPairs:minChapter});
  }
  const plant = shapedWindow(donors[1].symbols, 251, lengths);
  const encrypted = encodeNativePlant(plant);
  for (let i = 0; i < pages.length; i++) {
    const coords = decodeFive(encrypted[i]);
    for (let j = 0; j < coords[0].length; j++)
      for (let k = 0; k < 5; k++) {
        const alpha = 1+(i*7+k*3)%28, beta=(i*11+k*5)%29;
        assert.equal(mod(alpha*coords[k][j]+beta),
          plant[i][j*5+(k+i)%5]);
      }
    assert.deepEqual(encrypted[i].slice(coords[0].length*5),
      plant[i].slice(coords[0].length*5));
  }
  assert.deepEqual(invariant(encrypted,"pages",true),
    invariant(plant,"pages",false));
  results.push({range:[section.first,section.last],pageCount:pages.length,
    total,sourcePage:realPage,sourceChapter:realChapter,witnesses,
    plantedPageAndModeBijectiveRoundtrip:true});
}
console.log(JSON.stringify({
  architecture:"B1033 CHANGE eigenbasis, all 29! mode substitutions and fixed mode permutations",
  originalSource:"resources/cicada2014-openpuff-magic-squares.txt",
  controls:donors.map(x=>({name:x.name,GPsymbols:x.symbols.length})),
  result:results
},null,2));
console.log("PASS: original LP2 structural exclusions and native positive plants");
