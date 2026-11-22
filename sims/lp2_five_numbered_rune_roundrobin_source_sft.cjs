'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const get = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const transcription = get('resources/liber-primus/lp2-transcription.txt')
  .replace(/\r\n/g, '\n').split('\n%\n');
assert.equal(transcription.length, 57);
const source = transcription.slice(36, 39).join('\n');
const marks = [...source.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(marks.map(m => Number(m[1])), [1, 2, 3, 4, 5]);
const lookup = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} s @returns {number[]} */
function runes(s) {
  return [...s].flatMap(ch => lookup.has(ch) ? [lookup.get(ch)] : []);
}
const pieces = marks.map((mark, i) => {
  const start = mark.index + mark[0].length;
  const end = i === 4 ? source.indexOf('\n&\n', start) : marks[i + 1].index;
  assert(end > start);
  return {
    number: i + 1,
    raw: source.slice(start, end).trim(),
    data: runes(source.slice(start, end))
  };
});
assert.deepEqual(pieces.map(u => u.data.length), [139, 91, 98, 96, 129]);
assert.equal(pieces.reduce((n, u) => n + u.data.length, 0), 553);

const order = [];
for (let index = 0; index < 139; index += 1) {
  for (let lane = 0; lane < pieces.length; lane += 1) {
    if (index < pieces[lane].data.length) order.push({ lane, index });
  }
}
assert.equal(order.length, 553);

/** @param {number[][]} lanes @returns {number[]} */
function interleave(lanes) {
  return order.map(({ lane, index }) => lanes[lane][index]);
}
/** @param {number[]} sequence @returns {number[][]} */
function deinterleave(sequence) {
  assert.equal(sequence.length, 553);
  const lanes = pieces.map(p => Array(p.data.length));
  for (let i = 0; i < order.length; i += 1) {
    const { lane, index } = order[i];
    lanes[lane][index] = sequence[i];
  }
  return lanes;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const freq = Array(29).fill(0);
  for (const symbol of a) freq[symbol] += 1;
  return freq.reduce((s, n) => s + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {string} */
function translit(a) {
  return a.map(n => gp.translit[n]).join('');
}
const original = pieces.map(p => p.data);
const merged = interleave(original);
assert.deepEqual(deinterleave(merged), original);
const sourceSerial = original.flat();
assert.equal(sourceSerial.length, merged.length);
assert.equal(ioc(merged), ioc(sourceSerial));
assert.equal(ioc(merged), 0.03423356125979035); // exact source-derived checksum

// Known-original-rune positive: p57 is printed in GP29 clear, and p56
// is separate solved material. Compose a 553-symbol genuine source plant
// from the 95 p57 native runes, deliberately withheld from original test.
const clear = gp.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
const positive = Array.from({ length: 553 }, (_, i) => clear[i % clear.length]);
const splitPositive = deinterleave(positive);
assert.deepEqual(interleave(splitPositive), positive);
assert.notDeepEqual(merged, positive);
assert(ioc(positive) > 0.05);
const cOriginal = original.flat().reduce((m, s) =>
  (m[s] = (m[s] || 0) + 1, m), Array(29).fill(0));
const cMerged = merged.reduce((m, s) =>
  (m[s] = (m[s] || 0) + 1, m), Array(29).fill(0));
assert.deepEqual(cMerged, cOriginal);

console.log(JSON.stringify({
  source: 'LP2 original physical pp36-38 numbered units 1-5',
  lengths: original.map(a => a.length),
  coverage: merged.length,
  reading: 'one rune from each nonexhausted lane, 1->5, repeated',
  retainedSourceRuneMap: order.slice(0, 22),
  inverse: '553/553 original runes restored in exact original positions',
  originalIoC: ioc(sourceSerial),
  uneditedInterleavedIoC: ioc(merged),
  p57PositiveIoC: ioc(positive),
  positive: '553/553 genuine solved GP rune plant restored',
  first150GP: translit(merged.slice(0, 150)),
  last100GP: translit(merged.slice(-100)),
  decision: 'Direct one-rune 1->5 round robin preserves near-uniform '
    + 'cipher frequencies; no coherent contiguous GP native plaintext.'
}, null, 2));
