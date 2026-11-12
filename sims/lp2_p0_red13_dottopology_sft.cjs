/** Original-source 8:5 red-heading / 13-dot route and held-out body gate. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const firstHeader = transcription.split(/\r?\n/u, 1)[0].split('.', 1)[0].split('-');
assert.deepEqual(firstHeader.map((s) => Array.from(s).length), [8, 5]);

const p0 = ink.pages.find((x) => x.page === 0);
assert.deepEqual(p0.red_spans[0], {
  start: 0, length: 13, runes: 'ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ'
});
assert(p0.large_punctuation.some((m) => m[0] === 13 && m[1] === 13 && m[2] === 'red'));

const source = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.runic_count), [262, 266, 201]);
assert.equal(source.length, 729);
const header = source.slice(0, 13);
const outside = header.slice(0, 8);
const middle = header.slice(8, 13);
// Mark occupancy is .#./#.#/.#./#.#/.#./#.#/.#./#.#/.#.
// Place the first printed (8-rune) word in the eight outer slots,
// the second (5-rune) word in the five central slots; read rows L->R.
const routed = [];
for (let row = 0; row < 9; row++) {
  if (row % 2 === 0) routed.push(middle[row / 2]);
  else routed.push(outside[row - 1], outside[row]);
}
assert.deepEqual(routed, [15, 15, 8, 26, 18, 3, 18, 6, 19, 21, 27, 0, 5]);
const body = source.slice(13);
assert.equal(body.length, 716);

const mod29 = (n) => ((n % 29) + 29) % 29;
const ioc = (seq) => {
  const freq = Array(29).fill(0);
  for (const rune of seq) freq[rune]++;
  return freq.reduce((acc, n) => acc + n * (n - 1), 0) / (seq.length * (seq.length - 1));
};
const name = (seq) => seq.map((n) => corpus.translit[n]).join(' ');

/**
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @param {boolean} ciphertextFhold A diagnostic cipher-dependent hold rule.
 * @returns {{plain:number[], ambiguity:number, literalF:number}}
 */
function decode(cipher, sign, ciphertextFhold) {
  const plain = [];
  let clock = 0;
  let ambiguity = 0;
  let literalF = 0;
  for (const c of cipher) {
    if (ciphertextFhold && c === 0) {
      plain.push(0);
      literalF++;
      continue;
    }
    const p = mod29(c + sign * routed[clock % 13]);
    if (ciphertextFhold && p === 0) ambiguity++;
    plain.push(p);
    clock++;
  }
  return { plain, ambiguity, literalF };
}
function encodeUnskipped(plain, sign) {
  return plain.map((p, i) => mod29(p - sign * routed[i % 13]));
}
const plantSource = corpus.pages.find((p) => p.page === 57).indices;
const nativePlant = Array.from({ length: body.length }, (_, i) => plantSource[i % plantSource.length]);

const diagnostics = [];
for (const skipF of [false, true]) {
  for (const sign of [-1, 1]) {
    const result = decode(body, sign, skipF);
    if (!skipF) {
      assert.deepEqual(encodeUnskipped(result.plain, sign), body);
      const encPlant = encodeUnskipped(nativePlant, sign);
      assert.deepEqual(decode(encPlant, sign, false).plain, nativePlant);
    }
    const item = {
      sign, skipF, ioc: ioc(result.plain),
      pages: [ioc(result.plain.slice(0, 249)), ioc(result.plain.slice(249, 515)),
        ioc(result.plain.slice(515))],
      ambiguity: result.ambiguity, literalF: result.literalF,
      prefix: name(result.plain.slice(0, 28))
    };
    diagnostics.push(item);
  }
}
assert(Math.abs(diagnostics[0].ioc - 0.034597804430206665) < 1e-12);
assert.deepEqual(diagnostics.filter((d) => d.skipF).map((d) => d.ambiguity), [21, 22]);
console.log(JSON.stringify({
  original: 'LP2 physical pp0-2; archive JPEGs 17-19',
  heading: name(header),
  dotOccupancy: ['.#.', '#.#', '.#.', '#.#', '.#.', '#.#', '.#.', '#.#', '.#.'],
  transposed: name(routed),
  bodyRunes: body.length,
  nativePlantRunes: nativePlant.length,
  directEncoderRoundtrip: true,
  variants: diagnostics
}, null, 2));
