'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');
const mod = (value) => ((value % 29) + 29) % 29;

function pageWords(page) {
  const raw = parts[page];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  function emit() {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  }
  for (const ch of raw) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ('-.&$§'.includes(ch)) {
      emit();
    }
  }
  emit();
  return words;
}

const selected = pageWords(27)[19];
assert.deepEqual(selected.values, [12,4,9,15,3,3,5,24,18,26,18,18]);
const core = selected.values.slice(2, -2);
assert.deepEqual(core, [9,15,3,3,5,24,18,26]);

const h9Pairs = [
  [28,0],[27,2],[1,16],[1,2],[6,5],[17,2],[5,23],[2,27],[5,16],
];
const nonCenter = h9Pairs.filter((_, index) => index !== 4);
const high = nonCenter.map((pair) => pair[0]);
const low = nonCenter.map((pair) => pair[1]);
assert.deepEqual(high, [28,27,1,1,17,5,2,5]);
assert.deepEqual(low, [0,2,16,2,2,23,27,16]);

const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      output.push(21); offset += 3; continue;
    }
    if (normalized.startsWith('IO', offset)) {
      output.push(27); offset += 2; continue;
    }
    const token = tokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token);
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

const target = gp('DIVINITY');
assert.deepEqual(target, [23,10,1,10,9,10,16,26]);
const variants = [];

for (const [name, key] of [['HIGH', high], ['LOW', low]]) {
  for (const sign of [-1, 1]) {
    const output = core.map((value, index) => mod(value + sign * key[index]));
    variants.push({
      name,
      sign,
      key,
      output,
      transliteration: output.map((value) => corpus.translit[value]).join(''),
      exact: output.every((value, index) => value === target[index]),
    });
  }
}

assert.equal(variants.filter((item) => item.exact).length, 0);
assert.deepEqual(variants.map((item) => item.output), [
  [10,17,2,2,17,19,16,21],
  [8,13,4,4,22,0,20,2],
  [9,13,16,1,3,1,20,10],
  [9,17,19,5,7,18,16,13],
]);

const requiredKey = core.map((value, index) => mod(value - target[index]));
assert.deepEqual(requiredKey, [15,5,2,22,25,14,2,0]);

console.log(JSON.stringify({
  status: 'PASS',
  pretargetCommit: 'ec68d175387f6c319b7be2cf4270f4f64f459589',
  p27Core: core,
  target,
  high,
  low,
  variants,
  requiredKey,
  decision: 'Reject direct non-center H9 coordinate streams as the p27 ordered additive KDF.',
}, null, 2));
