/**
 * Original LP2 word-shape test of a source-motivated Russian plaintext register.
 * The three public-domain Russian controls are byte-pinned in the accompanying
 * derived source-word-length file. No plaintext or cipher key is inferred.
 * Run: node sims/lp2_orthodox_russian_wordshape_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const original = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, -2).join('')
  .replace(/\/\s*/g, '')
  .replace(/[.\-&$\r\n]/g, '-')
  .split('-').filter((w) => /[\u16A0-\u16FF]/u.test(w))
  .map((w) => [...w].filter((ch) => /[\u16A0-\u16FF]/u.test(ch)).length);

assert.equal(original.length, 2896);
assert.equal(original.reduce((a, b) => a + b, 0), 12956);
const bucket = (length) => Math.min(length, 14);
const target = Array(15).fill(0);
for (const length of original) target[bucket(length)]++;
assert.deepEqual(target, [0, 83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);

/** @param {number[]} lengths @param {number[]} targetCounts */
function scan(lengths, targetCounts) {
  const n = original.length;
  assert.ok(lengths.length >= n);
  const h = Array(15).fill(0);
  for (let k = 0; k < n; k++) h[bucket(lengths[k])]++;
  let minOne = Infinity;
  let maxThree = -Infinity;
  let bestL1 = Infinity;
  let bestOffset = -1;
  let bestOne = 0;
  let bestThree = 0;
  for (let start = 0; start + n <= lengths.length; start++) {
    minOne = Math.min(minOne, h[1]);
    maxThree = Math.max(maxThree, h[3]);
    let l1 = 0;
    for (let i = 1; i < h.length; i++) l1 += Math.abs(h[i] - targetCounts[i]);
    if (l1 < bestL1) {
      bestL1 = l1;
      bestOffset = start;
      bestOne = h[1];
      bestThree = h[3];
    }
    if (start + n < lengths.length) {
      h[bucket(lengths[start])]--;
      h[bucket(lengths[start + n])]++;
    }
  }
  return { windows: lengths.length - n + 1, minOne, maxThree,
    bestL1, bestOffset, bestOne, bestThree };
}

const controls = JSON.parse(read('resources/control/orthodox-russian-wordlengths.json'));
assert.equal(controls.source_commit, '4509680428729da225a73a22008133660f92bb7e');
const expected = [
  { n: 7912, minOne: 300, maxThree: 418, bestL1: 1196, bestOffset: 5004 },
  { n: 17057, minOne: 301, maxThree: 595, bestL1: 772, bestOffset: 10853 },
  { n: 11705, minOne: 368, maxThree: 392, bestL1: 1290, bestOffset: 8454 },
];
console.log('LP2 original printed whole-word histogram:', target);
controls.sources.forEach((source, i) => {
  assert.equal(source.lengths.length, expected[i].n);
  const stats = scan(source.lengths, target);
  for (const [key, value] of Object.entries(expected[i])) {
    if (key !== 'n') assert.equal(stats[key], value, source.source_path + ': ' + key);
  }
  console.log('Russian', source.source_path, stats);
});
const emerson = (read('resources/control/emerson_essays_2944.txt')
  .match(/[a-z]+/gi) || []).map((word) => word.length);
assert.equal(emerson.length, 77932);
const english = scan(emerson, target);
assert.equal(english.minOne, 50);
assert.equal(english.maxThree, 769);
assert.equal(english.bestL1, 196);
assert.equal(english.bestOffset, 47897);
console.log('English Emerson control', english);
console.log('PASS: 28,000+ exact source-shaped Russian windows tested; no plaintext or cipher recovered');
