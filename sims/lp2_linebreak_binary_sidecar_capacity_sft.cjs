'use strict';
/**
 * Exact per-page feasibility bound for a universal GP29 anti-repeat encoder
 * that stores at most one independently selectable sidecar bit at each
 * original internal printed-line break. No ciphertext transformations.
 *
 * Read-only Windows Node22 CommonJS single-file test:
 * node sims/lp2_linebreak_binary_sidecar_capacity_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8').split('%');

/**
 * Probability that iid GP29 of this exact page length has no more than k
 * equal-adjacent transitions. The increment is exact because
 * Binom(n,1/29) next-term ratio is (n-i)/((i+1)*28).
 * @param {number} n Within-page rune transitions.
 * @param {number} k Allowed equal-rune transitions.
 * @returns {number} Universal encoder capacity shortfall in bits.
 */
function deficit(n, k) {
  let term = Math.pow(28 / 29, n);
  let total = term;
  for (let i = 0; i < k; i++) {
    term *= (n - i) / ((i + 1) * 28);
    total += term;
  }
  return -Math.log2(total);
}
assert.ok(Math.abs(deficit(9, 0) + 9 * Math.log2(28 / 29)) < 1e-12);
const lines = [];
let runes = 0;
let joins = 0;
let repeats = 0;
let transitions = 0;
let bits = 0;
for (let page = 0; page <= 55; page++) {
  const symbols = corpus.pages[page].indices;
  if (!symbols.length) continue; // original p50 has no runic text
  const k = symbols.slice(1).filter((x, i) => x === symbols[i]).length;
  const n = symbols.length - 1;
  const printedLines = (pages[page].match(/\//g) || []).length;
  const oneBitJoinSites = printedLines - 1;
  const b = deficit(n, k);
  const feasible = oneBitJoinSites >= b;
  runes += symbols.length;
  joins += oneBitJoinSites;
  repeats += k;
  transitions += n;
  bits += b;
  lines.push({page, runes: symbols.length, doublets: k,
    lineJoins: oneBitJoinSites, minimumSideBits: Number(b.toFixed(6)),
    perPageOneBitSufficient: feasible});
}
const fail = lines.filter(x => !x.perPageOneBitSufficient);
assert.deepEqual([lines.length, runes, transitions, repeats, joins],
  [55, 12956, 12901, 86, 540]);
assert.deepEqual(fail.map(x => x.page),
  [5, 7, 13, 14, 15, 17, 28, 31, 37, 38, 40, 49, 52, 54]);
assert.ok(Math.abs(bits - 430.5612008) < 0.01);
assert.ok(joins > bits);
console.log(JSON.stringify({
  status: 'PASS',
  theorem: 'universal page-local one-bit-per-internal-linebreak sidecar: impossible',
  source: {runePages: 55, originalRunes: runes,
    originalTransitions: transitions, observedDoublets: repeats},
  local: {availableOneBitSites: joins, minimumBitsSum: bits,
    failingPages: fail.length, failureSource: fail},
  limits: [
    'assumes independent source pages and universal acceptance of all GP29 plaintexts',
    'does not constrain true LP2 plaintext, multi-bit line choices, cross-page coding, or other image channels'
  ]
}, null, 2));
