'use strict';
/**
 * LP2 physical p51: direct 11-cycle GP29 inverse selected by the printed
 * WWP(81) and the page's 20 complete words. Source-native, read-only SFT.
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_p51_wwp81_p50_cycle11_direct_gp29_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const load = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const tokens = grid.byte_rows.flat();
assert.equal(tokens.length, 256);
const p51 = corpus.pages[51].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p51.length, 92);
assert.deepEqual(p51.slice(0, 3), [7, 7, 13]);
assert.equal(corpus.prime[7] * 2 + corpus.prime[13], 81);
assert.equal(p57.length, 95);

const raw = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const segment = raw.split(/\n%\n/).find(section => section.startsWith('ᚹᚹᛈ-'));
assert.ok(segment, 'p51 original word segmentation must exist');
const lookup = new Map(corpus.runes.map((rune, index) => [rune, index]));
const words = segment.replace(/\r?\n|\//g, '').split(/[-.]/).filter(Boolean)
  .map(word => [...word].map(rune => {
    const value = lookup.get(rune);
    assert.notEqual(value, undefined);
    return value;
  }));
assert.equal(words.length, 20);
assert.deepEqual(words.flat(), p51);
assert.equal(words[0].length, 3);
assert.equal(words.slice(1).flat().length, 89);

const stream = [81];
for (let index = 0; index < 20; index++) stream.push(tokens[stream[index]]);
assert.equal(stream[1], 58);
assert.equal(stream[19], 32);
assert.equal(stream[20], 115);
const cycle = [];
const seen = new Set();
let state = stream[20];
while (!seen.has(state)) {
  seen.add(state);
  cycle.push(state);
  state = tokens[state];
}
assert.equal(state, 115);
assert.deepEqual(cycle, [115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197]);

/** @param {number} value @returns {number} */
const mod29 = value => (value % 29 + 29) % 29;
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const f = Array(29).fill(0);
  for (const n of arr) f[n]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}
/** @param {number[]} symbols @param {-1|1} sign */
const shift = (symbols, sign) => symbols.map((n, i) => mod29(n + sign * cycle[i % cycle.length]));
/** @param {number[]} symbols */
const roman = symbols => symbols.map(x => corpus.translit[x]).join('');

assert.ok(ioc(p57) > 0.06);
const output = [];
for (const [label, original] of [
  ['page-with-WWP', p51],
  ['19-body-words', p51.slice(3)]
]) {
  for (const sign of [-1, 1]) {
    const plaintext = shift(original, sign);
    assert.deepEqual(shift(plaintext, -sign), original, 'complete original rune replay');
    const planted = shift(p57, -sign);
    assert.deepEqual(shift(planted, sign), p57, 'authentic solved-GP-native planted positive');
    const result = {
      label, sign, runes: original.length,
      source_ioc: ioc(original),
      candidate_ioc: ioc(plaintext),
      candidate_prefix: roman(plaintext.slice(0, 45))
    };
    assert.ok(result.candidate_ioc < 0.045);
    output.push(result);
  }
}
assert.equal(output.length, 4);
console.log(JSON.stringify({
  source: 'original LP2 p51; p50 literal base60 bytes; direct GP29 addition/subtraction',
  registered_route: 'WWP GP-prime81 => 20 p51 words => T^20(81)=115 => 11-cycle',
  cycle, output, native_p57_ioc: ioc(p57),
  decision: 'No original p51 GP plaintext from direct repeated 11-cycle additive inverse.'
}, null, 2));
