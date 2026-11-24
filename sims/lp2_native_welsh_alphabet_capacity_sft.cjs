'use strict';

/**
 * Historical native-Welsh alphabet capacity gate (#2648).
 * Node 22 / CommonJS. Run from repository root:
 * node sims/lp2_native_welsh_alphabet_capacity_sft.cjs
 * A stationary single-symbol mapping cannot increase alphabet support.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const alphabet = 'A B C CH D DD E F FF G NG H I L LL M N O P PH R RH S T TH U W Y'.split(' ');
assert.equal(alphabet.length, 28);
assert.equal(new Set(alphabet).size, 28);
assert.equal(corpus.runes.length, 29);
const pages = corpus.pages.slice(0, 56);
assert.equal(pages.length, 56);
/** @param {number[]} indices @returns {number[]} */
function histogram(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) {
    assert(Number.isInteger(index) && index >= 0 && index < 29);
    counts[index]++;
  }
  return counts;
}
const counts = pages.map(p => histogram(p.indices));
const total = histogram(pages.flatMap(p => p.indices));
assert.equal(total.reduce((a,b) => a+b,0), 12956);
const fullPages = counts.filter(h => h.every(n => n > 0)).length;
const minGlobal = Math.min(...total);
const minPageTotal = counts.reduce((s,h) => s + Math.min(...h), 0);
assert.equal(fullPages, 53);
assert.equal(minGlobal, 399);
assert.equal(minPageTotal, 180);
// For any injective 29-letter map including J, its unknown image is
// one output symbol. The same permutation in the entire book requires
// >=399 occurrences of J; even independent page permutations need >=180.
// These bounds do not assume any rank alignment or particular Welsh text.
console.log(JSON.stringify({
  traditionalWelshAlphabetSize: alphabet.length,
  originalRunes: total.reduce((a,b) => a+b,0),
  fullSupportPages: fullPages,
  supportExceptions: pages.map((p,i) => ({page:p.page, support:counts[i].filter(n => n > 0).length})).filter(x => x.support < 29),
  minimumJCountStationaryMap: minGlobal,
  minimumJCountIndependentPageMaps: minPageTotal,
  classification:'Only fixed single-symbol maps; no exclusion of position-dependent or variable-length ciphers.'
},null,2));
