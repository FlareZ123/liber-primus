'use strict';

/**
 * Exact negative: source dimension-selected original words do not converge
 * to a common BASE29 address on 121-runic physical p32.
 *
 * Uses source exact 0..28 GP indices, canonical page-crossing-aware words.
 * Run: node sims/lp2_dimword_base29_root121_source_gate_sft.cjs
 * @module lp2_dimword_base29_root121_source_gate_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const segments = transcription.split(/\s*%\s*/);
assert.equal(segments.length, 57);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} source @returns {number[][]} */
function words(source) {
  const tokens = source.replaceAll('/', '').replace(/\s/gu, '')
    .match(/\p{Script=Runic}+/gu) || [];
  return tokens.map(token => [...token].map(r => {
    assert.ok(runeIndex.has(r), 'Unknown GP rune');
    return runeIndex.get(r);
  }));
}
/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
/** @param {number[]} digits @returns {number} */
function sumPrimes(digits) {
  return digits.reduce((s, v) => s + corpus.prime[v], 0);
}
/** @param {number[]} digits @returns {string} */
function roman(digits) {
  return digits.map(v => corpus.translit[v]).join('');
}
/** @param {number[]} digits @returns {number} */
function address(digits) {
  return Number(base29(digits) % 121n);
}

const first = words(segments[0])[5];
const second = words(segments[1])[32];
assert.deepEqual(first, [9, 18, 7, 17, 24, 15, 22, 12, 10, 21, 1]);
assert.deepEqual(second, [11, 0, 10, 9, 27, 5, 26, 28, 10, 27]);
assert.equal(roman(first), 'NEWBASOEEOINGU');
assert.equal(roman(second), 'JFINIACYEAIIA');
assert.deepEqual([sumPrimes(first), sumPrimes(second)], [563, 569]);

const nativeWords = parseLP2Words(transcription).words;
assert.equal(nativeWords.length, 2896);
const sourceSums = nativeWords.map(w => sumPrimes(
  [...w.runes].map(r => runeIndex.get(r))));
assert.deepEqual([563, 569].map(s =>
  sourceSums.filter(x => x === s).length), [1, 1]);

assert.equal(base29(first), 4051303299344240n);
assert.equal(base29(second), 159757015902945n);
assert.deepEqual([address(first), address(second)], [115, 32]);
assert.deepEqual([address([...first].reverse()),
  address([...second].reverse())], [42, 62]);
assert.deepEqual([address(first.map(x => x + 1)),
  address(second.map(x => x + 1))], [17, 87]);

const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);
assert.deepEqual([p32[115], p32[32]], [11, 2]);
assert.deepEqual([roman([p32[115]]), roman([p32[32]])], ['J', 'TH']);
assert.equal(roman(p32.slice(93, 97)), 'BUDS');
assert.notEqual(address(first), address(second));

console.log(JSON.stringify({
  verdict: 'REJECTED: two authentic dimension-word BASE29 residues disagree',
  originalPrimeSums: [563, 569],
  positionalBase29Integers: [base29(first).toString(), base29(second).toString()],
  originalResiduesMod121: [115, 32],
  11by11Destinations: [
    {offset: 115, row: 10, col: 5, rune: 'J'},
    {offset: 32, row: 2, col: 10, rune: 'TH'}
  ],
  separateOriginalBUDS: {offset: 93, row: 8, col: 5},
  oldIncorrectSecondWord: '11,0,10,9,28,5,26,27,10,28',
  reason: 'An earlier hand-copied p1 digit sequence changed three actual runes and falsely created a shared residue 115; source exact reread invalidates it',
  unknownPlaintextRecovered: 0
}, null, 2));
