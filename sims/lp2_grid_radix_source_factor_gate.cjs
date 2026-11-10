'use strict';
/** Source-constrained original LP2 base60/base59 p39 polynomial-factor comparison. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} name @returns {any} */
function read(name) { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8')); }
const grid = read('base60-grid.json'), ink = read('lp2-ink-annotations.json'), corpus = read('lp2-corpus.json');
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const p39 = ink.pages.find(x => x.page === 39).red_spans.find(x => x.start === 119 && x.length === 3);
assert.deepEqual([...p39.runes].map(x => corpus.runes.indexOf(x)), [27, 5, 15]);
const ac = corpus.runes.indexOf([...ink.pages.find(x => x.page === 54).red_spans[0].runes][0]);
assert.equal(ac, 24);
assert.equal((27 + 5 * ac + 15 * ac * ac) % 29, 0);
assert.equal((5 + 30 * ac) % 29, 0);
/** @param {number[]} a @param {number} x @returns {[number, number]} */
function evalPair(a, x) {
  let v = 0, d = 0;
  for (const b of a) { d = (d * x + v) % 29; v = (v * x + b) % 29; }
  return [v, d];
}
/** @param {string} alphabet @returns {number[]} */
function decode(alphabet) {
  return tokens.map(t => {
    const u = alphabet.indexOf(t[0]), v = alphabet.indexOf(t[1]);
    assert(u >= 0 && v >= 0);
    const b = u * alphabet.length + v;
    assert(b >= 0 && b <= 255);
    return b;
  });
}
/** @param {number[]} a @returns {number[]} */
function transpose(a) { return Array.from({length: 256}, (_, i) => a[8 * (i % 32) + Math.floor(i / 32)]); }
const cases = [];
for (const [codec, alphabet, expectedHash] of [
  ['base60', grid.alphabet, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'],
  ['base59', grid.alphabet.replace('f', ''), '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79']
]) {
  const bytes = decode(alphabet);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'), expectedHash);
  for (const [order, seq] of [['row-major', bytes], ['column-major', transpose(bytes)]])
    for (const [direction, array] of [['forward', seq], ['reverse', seq.slice().reverse()]]) {
      const [value, derivative] = evalPair(array, ac);
      cases.push({codec, order, direction, value, derivative});
    }
}
assert.deepEqual(cases.filter(x => x.value === 0 && x.derivative === 0), [
  {codec: 'base60', order: 'row-major', direction: 'forward', value: 0, derivative: 0}
]);
const a = decode(grid.alphabet);
let state = 73013;
/** @returns {number} */
function random32() { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; }
let hits = 0;
const trials = 50000;
for (let t = 0; t < trials; t++) {
  for (let i = 255; i > 0; i--) {
    const j = random32() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  const [v, d] = evalPair(a, ac);
  if (v === 0 && d === 0) hits++;
}
assert.equal(hits, 63);
console.log(JSON.stringify({redPolynomial: '27+5x+15x^2=15(x-24)^2', root: ac, cases, shuffle: {trials, hits, addOne: (hits + 1) / (trials + 1)}}, null, 2));
