/**
 * Original LP2 native GP29 byte-reduction fingerprint.
 * SFT: node sims/lp2_gp29_modbyte_output_fingerprint_sft.cjs
 * Reproducible Node.js built-ins only; independent of any guessed key.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const values = source.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(values.length, 12956);
const counts = Array(29).fill(0);
for (const rune of values) counts[rune]++;
assert.equal(counts.reduce((a, b) => a + b), values.length);

const logF = new Float64Array(values.length + 1);
for (let i = 2; i < logF.length; i++) logF[i] = logF[i - 1] + Math.log(i);
/** Exact independent-trial binomial upper tail computed by a stable PMF recurrence. */
function upperTail(n, k, p) {
  let term = Math.exp(logF[n] - logF[k] - logF[n-k] + k*Math.log(p) + (n-k)*Math.log1p(-p));
  let tail = term;
  for (let i = k; i < n; i++) {
    term *= ((n-i)/(i+1))*(p/(1-p));
    tail += term;
  }
  return tail;
}
function lowMass(seedWidth, favoredWidth, lowIndices, observed) {
  const p = lowIndices / seedWidth * favoredWidth;
  return {observed, expected:values.length*p, observed_fraction:observed/values.length, p, upper_tail:upperTail(values.length, observed, p)};
}
const low256 = counts.slice(24).reduce((a,b) => a+b, 0);
const low255 = counts.slice(23).reduce((a,b) => a+b, 0);
assert.equal(low256, 2305);
assert.equal(low255, 2744);
const m256 = lowMass(256, 8, 5, low256); // byte 0..255, residues 24..28 occur 8 times each
const m255 = lowMass(255, 8, 6, low255); // GIMP range 0..254, residues 23..28 occur 8 times each
assert.ok(m256.upper_tail > 1e-12 && m256.upper_tail < 1e-10);
assert.ok(m255.upper_tail > 1e-12 && m255.upper_tail < 1e-10);
// The probability and favored sets are controlled by the byte range.
for (let m=0;m<2;m++) {
  const range=m===0?256:255, begin=m===0?24:23;
  const countsWhole=Array(29).fill(0);
  for(let i=0;i<range;i++)countsWhole[i%29]++;
  for(let j=begin;j<29;j++)assert.equal(countsWhole[j],8);
  for(let j=0;j<begin;j++)assert.equal(countsWhole[j],9);
}
// Even a repeated-state rejection redraw only minimally changes expected byte-mod29 symbol mass.
const qH = 9/256, qL = 8/256, s=1;
const oneRedrawLow = (5*qL/(1+s*qL))/(24*qH/(1+s*qH)+5*qL/(1+s*qL));
const untilAcceptedLow = (5*qL*(1-s*qL))/(24*qH*(1-s*qH)+5*qL*(1-s*qL));
assert.ok(oneRedrawLow < .1568 && untilAcceptedLow < .1568);
console.log(JSON.stringify({n:values.length, gp_counts:counts, byte256:m256, gimp_range255:m255, max_stationary_low_fraction_after_repeat_redraw:Math.max(oneRedrawLow,untilAcceptedLow)},null,2));
