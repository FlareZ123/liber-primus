'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
).replace(/\r/g, '');
const runeIndex = new Map(corpus.runes.map((rune, value) => [rune, value]));
const parts = transcription.split('%');
const pageObj = (page) => corpus.pages.find((item) => item.page === page);
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function pageFragments(page) {
  const source = pageObj(page).indices;
  const fragments = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    fragments.push({ start, end: offset, values: current.slice() });
    current = [];
  }

  for (const ch of segment(page)) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      assert.equal(source[offset], value, 'transcription mismatch p' + page + '@' + offset);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length);
  return fragments;
}

/** @param {number[]} schedule */
function operand(schedule) {
  return schedule.flatMap((index, i) => {
    const fragments = pageFragments(8 + i);
    const actual = index >= 0 ? index : fragments.length + index;
    assert.ok(actual >= 0 && actual < fragments.length);
    return fragments[actual].values;
  });
}

const signed = operand([2, -1, 5, -1, 23, -1, -2]);
const raw = operand([2, 28, 5, 28, 23, 28, 27]);
assert.equal(signed.length, 28);
assert.equal(raw.length, 28);
assert.deepEqual(signed, [
  27,9,16,7,27,28,4,25,7,27,23,24,2,9,22,14,24,1,18,9,24,18,10,12,17,22,22,20,
]);
assert.deepEqual(raw, [
  27,9,16,24,21,13,9,22,23,14,28,21,0,4,27,5,12,18,9,16,18,10,5,4,5,13,3,16,
]);

const receiver = pageObj(15).indices.slice(19);
assert.equal(receiver.length, 140);
const scalars = [11, 23, 17, 18, 5];

/** @param {number[]} op @param {-1|1} sign */
function decode(op, sign) {
  const output = [];
  for (let block = 0; block < 5; block += 1) {
    for (let j = 0; j < 28; j += 1) {
      output.push(mod(receiver[block * 28 + j] + sign * scalars[block] * op[j]));
    }
  }
  return output;
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @param {number[]} training @param {number} order */
function crossEntropy(values, training, order) {
  const contexts = new Map();
  const alpha = 0.5;
  const key = (items) => items.join(',');

  for (let i = order; i < training.length; i += 1) {
    const context = key(training.slice(i - order, i));
    if (!contexts.has(context)) contexts.set(context, Array(29).fill(0));
    contexts.get(context)[training[i]] += 1;
  }

  let entropy = 0;
  for (let i = order; i < values.length; i += 1) {
    const context = key(values.slice(i - order, i));
    const counts = contexts.get(context) || Array(29).fill(0);
    const denominator = counts.reduce((a, b) => a + b, 0) + alpha * 29;
    entropy -= Math.log2((counts[values[i]] + alpha) / denominator);
  }
  return entropy / (values.length - order);
}

const solved = pageObj(56).indices.concat(pageObj(57).indices);
const variants = [];
for (const [name, op] of [['signed', signed], ['raw', raw]]) {
  for (const sign of [-1, 1]) {
    const output = decode(op, /** @type {-1|1} */ (sign));
    variants.push({
      name,
      sign,
      ioc: ioc(output),
      unigramCE: crossEntropy(output, solved, 0),
      bigramCE: crossEntropy(output, solved, 1),
      opening: output.slice(0, 100).map((x) => corpus.translit[x]).join(''),
    });
  }
}

const expected = [
  ['signed', -1, 0.034635149023638234, 4.989894803355818, 5.030547489315642],
  ['signed', 1, 0.032682425488180886, 5.150398805889131, 5.000119016660884],
  ['raw', -1, 0.03340184994861254, 5.152319988060104, 5.033136160350046],
  ['raw', 1, 0.03442959917780062, 5.1976386067663185, 5.04655810508978],
];
for (let i = 0; i < variants.length; i += 1) {
  assert.equal(variants[i].name, expected[i][0]);
  assert.equal(variants[i].sign, expected[i][1]);
  assert.ok(Math.abs(variants[i].ioc - expected[i][2]) < 1e-12);
  assert.ok(Math.abs(variants[i].unigramCE - expected[i][3]) < 1e-12);
  assert.ok(Math.abs(variants[i].bigramCE - expected[i][4]) < 1e-12);
}

console.log(JSON.stringify({
  status: 'PASS',
  pretargetCommit: '3fb9d61ed8e75137b322185b4807eebf0d60a0ef',
  scalars,
  receiverLength: receiver.length,
  solvedBigramCE: {
    p56: crossEntropy(pageObj(56).indices, solved, 1),
    p57: crossEntropy(pageObj(57).indices, solved, 1),
  },
  variants,
  decision: 'Reject warmup-scaled five-block additive/subtractive p15 consumer.',
}, null, 2));
