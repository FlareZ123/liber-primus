'use strict';

/**
 * Entire original LP2 page unigram-balance test: a potential hidden 29-rune
 * page-balancing program, versus a source-realistic no-repeated-rune emitter.
 *
 * Null A: independent uniform 29 letters with original physical page lengths.
 * Null B: preserve the *exact original same-rune adjacent position mask* on
 * every original physical page, randomize rune labels uniformly over 29
 * at each page start and among the 28 others at each non-repeat position.
 *
 * Both exact original page lengths and source p50 zero-runepage are respected.
 * Preserves original repeat locations but never uses original rune identities.
 * One global prespecified statistic: sum of 55 page-wise Pearson chisquares
 * against the uniform 29-symbol distribution.
 *
 * Node.js 22, Windows 11, read-only, original-source SFT.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const book = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = book.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(pages.length, 55);
const q = 29, nCases = 12000;
let same = 0, originalChi = 0, total = 0;
const observedPageChi = [];
/** @param {Int32Array|number[]} freq @param {number} n */
function chi(freq, n) {
  let squares = 0;
  for (const k of freq) squares += k * k;
  return q * squares / n - n;
}
for (const page of pages) {
  const n = page.indices.length;
  const f = new Int32Array(q);
  for (let i = 0; i < n; i++) {
    const x = page.indices[i];
    assert(Number.isInteger(x) && x >= 0 && x < q);
    f[x]++;
    if (i && x === page.indices[i - 1]) same++;
  }
  const value = chi(f, n);
  observedPageChi.push({page: page.page, n, value});
  total += n;
  originalChi += value;
}
assert.equal(total, 12956);
assert.equal(same, 86);
assert.ok(Math.abs(originalChi - 1374.8117984448622) < 1e-7);
let state = 0x3301a932;
/** @returns {number} Float in [0,1) */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 0x100000000;
}
/** @typedef {{sum:number,sum2:number,less:number,min:number,max:number}} Tally */
/** @returns {Tally} */
function empty() {
  return {sum:0,sum2:0,less:0,min:Infinity,max:-Infinity};
}
const tallies = {iid:empty(), fixedRepeatSites:empty()};
for (let trial = 0; trial < nCases; trial++) {
  let iChi = 0, mChi = 0;
  for (const p of pages) {
    const fI = new Int32Array(q), fM = new Int32Array(q), n = p.indices.length;
    let prev = -1;
    for (let i = 0; i < n; i++) {
      const u = Math.floor(random() * q);
      fI[u]++;
      let v;
      if (i === 0) v = Math.floor(random() * q);
      else if (p.indices[i] === p.indices[i - 1]) v = prev;
      else {
        v = Math.floor(random() * (q - 1));
        if (v >= prev) v++;
      }
      fM[v]++;
      prev = v;
    }
    iChi += chi(fI, n);
    mChi += chi(fM, n);
  }
  for (const [name,x] of [['iid',iChi],['fixedRepeatSites',mChi]]) {
    const t = tallies[name];
    t.sum += x; t.sum2 += x*x;
    if (x <= originalChi) t.less++;
    t.min = Math.min(t.min,x); t.max = Math.max(t.max,x);
  }
}
const tests = Object.fromEntries(Object.entries(tallies).map(([k,t]) => {
  const mean=t.sum/nCases, sd=Math.sqrt(t.sum2/nCases - mean*mean);
  return [k, {
    draws:nCases,seed:'0x3301a932',mean,sd,
    lessOrEqual:t.less,addOneLowerTail:(t.less+1)/(nCases+1),
    observedZ:(originalChi-mean)/sd,min:t.min,max:t.max
  }];
}));
assert.ok(tests.iid.addOneLowerTail < 0.005);
assert.ok(tests.fixedRepeatSites.addOneLowerTail > 0.025 &&
  tests.fixedRepeatSites.addOneLowerTail < 0.20);
assert.ok(Math.abs(tests.iid.mean - 1540.057424616065) < 1e-6);
assert.ok(Math.abs(tests.fixedRepeatSites.mean - 1454.1717477951229) < 1e-6);
console.log(JSON.stringify({
  original:{pages:55,runes:12956,adjacentEqualSites:same,
    pageChiSquareTotal:originalChi,
    pageChiSquareMean:originalChi/pages.length},
  design:{statistic:'summed original page marginal chi-square, 29 categories',
    nulls:['IID per original page','exact original equal-position mask, uniform 28 alternatives'],
    controlled:'source page lengths and all observed adjacent-repeat locations',
    doesNotControl:'long-range rune correlations or original symbol values'},
  tests,
  decision:'Naive iid underdispersion mostly relaxes when the original anti-doublet constraint is incorporated. No independently demanded page-balancing cipher or plaintext was identified.'
},null,2));
console.log('PASS: original perpage rune-balance fixed-doublet-mask null.');
