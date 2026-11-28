"use strict";
/**
 * SFT: all exact four-word LP2 red spans under word-product -> adjacent H.
 * Run: node sims/lp2_fourword_red_product_h_dh_register_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const pages = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%");
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {number} x */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} xs */
const product = xs => xs.reduce((a, x) => mod29(a * x), 1);
/** @param {number} x @param {number} n */
function powmod(x, n) {
  let out = 1;
  for (let i = 0; i < n; i++) out = out * x % 29;
  return out;
}
/** @param {number} x */
const inverse = x => powmod(x, 27);
/** @param {number[]} v */
const adjacentH = v => {
  assert.equal(v.length, 4);
  return [mod29(v[0] - v[1]), mod29(v[0] + v[1]),
    mod29(v[2] - v[3]), mod29(v[2] + v[3])];
};
/** @param {number} page */
function wordsOnPage(page) {
  const out = [];
  let values = [];
  let offset = 0;
  const flush = () => {
    if (!values.length) return;
    out.push({page, start: offset - values.length, end: offset,
      values: values.slice(), length: values.length, gpProduct: product(values)});
    values = [];
  };
  for (const ch of Array.from(pages[page] || "")) {
    const value = glyph.get(ch);
    if (value !== undefined) {
      values.push(value);
      offset++;
    } else if ("-.$&§".includes(ch)) {
      flush();
    }
  }
  flush();
  return out;
}

const allWords = Array.from({length: 56}, (_, page) => wordsOnPage(page));
assert.equal(allWords.reduce((n, ws) => n + ws.length, 0), 2953);

/** @param {number} page @param {number} start */
function redWords(page, start) {
  const ip = ink.pages.find(x => x.page === page);
  assert.ok(ip);
  const span = ip.red_spans.find(x => x.start === start);
  assert.ok(span);
  return allWords[page].filter(w =>
    w.start >= span.start && w.end <= span.start + span.length);
}

const exactFourSpans = [];
for (const ip of ink.pages.filter(x => x.page <= 55)) {
  for (const span of ip.red_spans || []) {
    const ws = allWords[ip.page].filter(w =>
      w.start >= span.start && w.end <= span.start + span.length);
    if (ws.length === 4)
      exactFourSpans.push({page: ip.page, start: span.start,
        lengths: ws.map(w => w.length), products: ws.map(w => w.gpProduct)});
  }
}
assert.deepEqual(exactFourSpans, [
  {page:6,start:71,lengths:[4,1,4,2],products:[13,19,14,23]},
  {page:23,start:0,lengths:[2,6,3,5],products:[24,13,18,13]},
  {page:54,start:0,lengths:[1,4,2,2],products:[21,16,23,5]}
]);

// Independently established p7 word-product DH packet.
const p7 = redWords(7, 194);
assert.deepEqual(p7.map(w => w.length), [2,4,3,2,3]);
const p7Products = p7.map(w => w.gpProduct);
assert.deepEqual(p7Products, [11,26,8,15,2]);

const p = p7[0].values[0];       // 23
const e = p7[0].values[1];       // 3
const g = p7[2].values[0];       // 5
const a = p7[4].values[0];       // 6
const b = p7Products[3];         // 15 = K^-1
const A = p7Products[2];         // 8
const B = inverse(p7Products[1]);// 19
const K = p7Products[4];         // 2
const q = p7Products.reduce((s,x) => mod29(s+x), 0); // 4
assert.deepEqual({p,e,g,a,b,A,B,K,q}, {p:23,e:3,g:5,a:6,b:15,A:8,B:19,K:2,q:4});
assert.equal(powmod(g, a), A);
assert.equal(powmod(g, b), B);
assert.equal(powmod(B, a), K);

const p6Products = redWords(6, 71).map(w => w.gpProduct);
const p23Products = redWords(23, 0).map(w => w.gpProduct);
const p54Products = redWords(54, 0).map(w => w.gpProduct);

assert.deepEqual(p6Products, [mod29(b-K), B, mod29(-b), p]);
assert.deepEqual(p23Products, [mod29(-g), mod29(b-K), mod29(p-g), mod29(b-K)]);
assert.deepEqual(p54Products, [mod29(p-K), mod29(A*K), p, g]);

const h6 = adjacentH(p6Products);
const h23 = adjacentH(p23Products);
const h54 = adjacentH(p54Products);
assert.deepEqual(h6, [p,e,mod29(q*g),A]);
assert.deepEqual(h23, [inverse(A),A,g,K]);
assert.deepEqual(h54, [g,A,mod29(p-g),mod29(-1)]);
assert.deepEqual(h6, [23,3,20,8]);
assert.deepEqual(h23, [11,8,5,2]);
assert.deepEqual(h54, [5,8,18,28]);

// Exact-vector manuscript census: every page-local 4-fragment window, same operation.
const allFour = [];
for (let page = 0; page <= 55; page++) {
  const ws = allWords[page];
  for (let i = 0; i + 4 <= ws.length; i++) {
    const seq = ws.slice(i, i + 4);
    const products = seq.map(w => w.gpProduct);
    allFour.push({page, start:seq[0].start, products, h:adjacentH(products)});
  }
}
assert.equal(allFour.length, 2785);
/** @param {number[]} a @param {number[]} b */
const same = (a,b) => a.length === b.length && a.every((x,i) => x === b[i]);
for (const [target, expected] of [
  [h6, {page:6,start:71}],
  [h23,{page:23,start:0}],
  [h54,{page:54,start:0}]
]) {
  const hits = allFour.filter(x => same(x.h, target)).map(x => ({page:x.page,start:x.start}));
  assert.deepEqual(hits, [expected]);
}

console.log(JSON.stringify({
  classification:"shared four-word red product->H DH register; no plaintext decoder",
  dh23:{p,e,g,a,b,A,B,K,q},
  exactFourSpans: exactFourSpans.map((x,i) => ({
    ...x, h:[h6,h23,h54][i]
  })),
  census:{pageLocalWords:2953,fourWordWindows:2785,
    exactVectorOccurrences:{
      p6:allFour.filter(x=>same(x.h,h6)).map(x=>({page:x.page,start:x.start})),
      p23:allFour.filter(x=>same(x.h,h23)).map(x=>({page:x.page,start:x.start})),
      p54:allFour.filter(x=>same(x.h,h54)).map(x=>({page:x.page,start:x.start}))
    }},
  caveat:"operations have independent prior motivation, but this cross-link was discovered retrospectively"
}, null, 2));
