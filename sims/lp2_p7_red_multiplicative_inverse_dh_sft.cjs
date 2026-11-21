"use strict";
/**
 * SFT: p7 original red GF29 inverse-word products, charged 15-pair family,
 * and two fixed, source-constrained direct cipher inverse failures.
 * Run: node sims/lp2_p7_red_multiplicative_inverse_dh_sft.cjs
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
const mod29 = value => ((value % 29) + 29) % 29;
/** @param {number[]} values */
const product = values => values.reduce((a, v) => mod29(a * v), 1);
/** @param {number} base @param {number} exponent @param {number} modulus */
function powmod(base, exponent, modulus) {
  let value = 1;
  for (let i = 0; i < exponent; i++) value = value * base % modulus;
  return value;
}
/** @param {number} value */
const inverse = value => {
  assert.ok(value > 0 && value < 29);
  return powmod(value, 27, 29);
};
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number} page */
function wordsOnPage(page) {
  const out = [];
  let values = [], offset = 0;
  const flush = () => {
    if (!values.length) return;
    out.push({ page, start: offset - values.length, end: offset,
      values: values.slice(), length: values.length,
      gp0: values.reduce((a, v) => a + v, 0), gpProduct: product(values) });
    values = [];
  };
  for (const ch of Array.from(pages[page])) {
    const v = glyph.get(ch);
    if (v !== undefined) { values.push(v); offset++; }
    else if ("-.$&§".includes(ch)) flush();
  }
  flush();
  return out;
}
/** @param {number} p @param {number} start */
function redWords(p, start) {
  const span = ink.pages.find(x => x.page === p).red_spans.find(x => x.start === start);
  assert.ok(span);
  return wordsOnPage(p).filter(w => w.start >= span.start && w.end <= span.start + span.length);
}
const p6 = redWords(6, 71), p7 = redWords(7, 194);
assert.deepEqual(p6.map(w => w.values), [
  [24,16,14,17], [19], [6,27,15,17], [14,12]
]);
assert.deepEqual(p7.map(w => w.values), [
  [23,3], [22,16,2,25], [5,7,11], [14,28], [6,28,19]
]);
const products = p7.map(w => w.gpProduct);
assert.deepEqual(products, [11,26,8,15,2]);
assert.deepEqual(p7.map(w => w.gp0), [26,65,23,42,53]);
assert.equal(mod29(products[0]*products[2]), 1);
assert.equal(mod29(products[3]*products[4]), 1);
assert.equal(mod29(products[1]*p6[1].gpProduct), 1);
assert.equal(p7[2].gp0, 23);
assert.equal(p7[2].gpProduct, 8);
assert.deepEqual(p7[2].values, [5,7,11]);

const p = p7[0].values[0], g = p7[2].values[0], a = p7[4].values[0];
const b = products[3], A = products[2], B = inverse(products[1]), K = products[4];
assert.deepEqual([p,g,a,b,A,B,K], [23,5,6,15,8,19,2]);
assert.equal(powmod(g,a,p), A);
assert.equal(powmod(g,b,p), B);
assert.equal(powmod(B,a,p), K);
assert.deepEqual(products, [inverse(A), inverse(B), A, inverse(K), K]);
assert.deepEqual([p6.reduce((s,w)=>s+w.gp0,0),p7.reduce((s,w)=>s+w.gp0,0)], [181,209]);
assert.equal(products[0]*p6[1].values[0], 209);
assert.equal(new Set(Array.from({length:28},(_,i)=>powmod(products[0],i,29))).size,28);
const allWords = Array.from({ length: 56 }, (_, page) => wordsOnPage(page));
const dhStates = new Set([A,B,K,inverse(A),inverse(B),inverse(K)]);
assert.deepEqual([...dhStates].sort((x,y)=>x-y), [2,8,11,15,19,26]);
const dhStateWindows = [];
for (let page = 0; page < 56; page++) {
  const list = allWords[page];
  for (let j = 0; j + 5 <= list.length; j++) {
    const values = list.slice(j, j+5).map(w => w.gpProduct);
    if (values.every(v => dhStates.has(v)))
      dhStateWindows.push({ page, start:list[j].start, products:values });
  }
}
assert.deepEqual(dhStateWindows,
  [{page:7,start:194,products:[11,26,8,15,2]}]);


// Five positions yield 5 choices of unpaired singleton and 3 pairings of
// the remaining four: charge all 15 possible two-disjoint-inverse matches.
const pairings = [];
for (let singleton = 0; singleton < 5; singleton++) {
  const other = [0,1,2,3,4].filter(i => i !== singleton);
  for (let j = 1; j < 4; j++) {
    const rest = other.slice(1).filter((_,k) => k !== j - 1);
    pairings.push({ singleton, pairs: [[other[0], other[j]], rest] });
  }
}
assert.equal(pairings.length, 15);

const matches = [], fixed = [];
let windows = 0;
for (let page = 0; page <= 55; page++) {
  const ws = allWords[page];
  for (let j = 0; j + 5 <= ws.length; j++) {
    windows++;
    const seq = ws.slice(j, j + 5);
    const values = seq.map(w => w.gpProduct);
    const isInverse = (u,v) => mod29(values[u]*values[v]) === 1;
    if (isInverse(0,2) && isInverse(3,4))
      fixed.push({page,start:seq[0].start,products:values});
    const valid = pairings.filter(item => item.pairs.every(([u,v]) => isInverse(u,v)));
    if (valid.length)
      matches.push({
        page, start: seq[0].start, products: values, count: valid.length,
        singleton26: valid.some(item => values[item.singleton] === 26)
      });
  }
}
assert.equal(windows, 2729);
assert.deepEqual(fixed, [{page:7,start:194,products:[11,26,8,15,2]}]);
assert.equal(matches.length, 21);
assert.equal(matches.reduce((n,x) => n+x.count, 0), 23);
assert.deepEqual(matches.filter(x => x.singleton26), [{
  page:7, start:194, products:[11,26,8,15,2],
  count:1, singleton26:true
}]);
const redSpanFiveCount = ink.pages.filter(x => x.page <= 55).flatMap(x =>
  (x.red_spans || []).map(span => ({
    page:x.page, count: allWords[x.page].filter(w =>
      w.start >= span.start && w.end <= span.start + span.length).length
  }))
).filter(span => span.count >= 5);
assert.deepEqual(redSpanFiveCount, [{page:7,count:5},{page:53,count:10}]);

// Freeze the most direct p7-key→p8 receiver: multiplicative five-word key
// in physical order and phase zero, no fallback alpha/origin/key search.
const p8Cipher = corpus.pages[8].indices;
assert.equal(p8Cipher.length, 255);
const p8Plain = p8Cipher.map((v,i) => mod29(v * inverse(products[i % 5])));
assert.deepEqual(p8Plain.map((v,i) => mod29(v * products[i % 5])), p8Cipher);

// Freeze the one naturally full-order GF29 11-column × 28-row affine
// model: p6 red11 additive key, p7 product11 as primitive row generator.
const gap = corpus.pages[6].indices.slice(82).concat(corpus.pages[7].indices.slice(0,194));
assert.equal(gap.length, 308);
const key = p6.flatMap(w => w.values);
assert.equal(key.length, 11);
const powers = Array.from({ length: 28 }, (_, r) => powmod(11,r,29));
assert.equal(new Set(powers).size, 28);
assert.equal(powers[0], 1);
assert.equal(powers[1], 11);
assert.equal(powmod(11,28,29), 1);
const gapPlain = gap.map((v,i) => mod29((v-key[i%11]) *
  inverse(powers[Math.floor(i / 11)])));
const gapReplay = gapPlain.map((v,i) => mod29(v *
  powers[Math.floor(i / 11)] + key[i%11]));
assert.deepEqual(gapReplay, gap);
const p8IoC = ioc(p8Plain), gapIoC = ioc(gapPlain);
assert.ok(Math.abs(p8IoC-0.0322989038134939)<1e-14);
assert.ok(Math.abs(gapIoC-0.03375777317145395)<1e-14);

console.log(JSON.stringify({
  classification: "Unique original GP29 inverse-word packet; no plaintext decoder",
  p7: {words: p7.map(w => ({start:w.start, length:w.length, values:w.values,
    sum:w.gp0, product:w.gpProduct})), inversePairs:[[0,2],[3,4]],
    externalInverseWord: "p6 red singleton 19" },
  dh23: {p,g,a,b,A,B,K, inversePacket:products},
  originalCorpusControls: {windows, fixedPairMatches:fixed,
    dhStateMembershipWindows:dhStateWindows, all15Matchings:matches.length, labeledMatchingPairings:
    matches.reduce((n,x)=>n+x.count,0), withP6SingletonInverse:
    matches.filter(x=>x.singleton26), spansWithFiveWords:redSpanFiveCount},
  failedFixedConsumers: {
    p8KeyedMultiplication: {runes:p8Cipher.length,cipherIoC:ioc(p8Cipher),
      decodedIoC:p8IoC, first120:p8Plain.slice(0,120)
        .map(v=>corpus.translit[v]).join(""), exactReplay:true},
    p6p7FullCycleAffine: {runes:gap.length,generator:11,cycleLength:
      new Set(powers).size,cipherIoC:ioc(gap),decodedIoC:gapIoC,
      first120:gapPlain.slice(0,120).map(v=>corpus.translit[v]).join(""),
      exactReplay:true}
  }
}, null, 2));
