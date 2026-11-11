'use strict';

// Source-locked GF(29^2) event-state/table key tested in the exact
// same-plaintext repeated-output skip-HMM used elsewhere in this repository.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { decode, encryptSoft } = require('./pgp_modulus_skip_hmm.cjs');

const root = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const text = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const mod = (x, m = 29) => ((x % m) + m) % m;
const gp = new Map(corpus.runes.map((r, i) => [r, i]));

const events = [];
for (const page of ink.pages) {
  (page.large_punctuation || []).forEach((mark, order) => {
    if (mark[1] === 13) {
      events.push({ page: page.page, offset: mark[0], mark: true, order, e: 0, color: mark[2] });
    }
  });
  for (const span of (page.red_spans || [])) {
    Array.from(span.runes).forEach((rune, j) => {
      const value = gp.get(rune);
      assert.notEqual(value, undefined);
      events.push({
        page: page.page, offset: span.start + j, mark: false, order: j,
        e: mod(value + 1 - 13),
      });
    });
  }
}
events.sort((a, b) =>
  a.page - b.page || a.offset - b.offset ||
  Number(b.mark) - Number(a.mark) || a.order - b.order
);
assert.equal(events.filter((e) => !e.mark).length, 225);
assert.equal(events.filter((e) => e.mark).length, 31);
assert.equal(events.length, 256);
const p7 = events.filter((e) => e.page === 7 && e.offset === 194);
assert.deepEqual(p7.map((e) => e.mark), [true, true, false]);

const mul = ([a, b], [c, d]) => [
  mod(a * c + 8 * b * d),
  mod(a * d + b * c + 3 * b * d),
];
let state = [4, 24];
const pre = [], post = [];
const z = [23, 27];
for (const event of events) {
  pre.push(grid.byte_rows[state[0] % 32][state[1] % 8]);
  state = mul(z, state);
  state[0] = mod(state[0] + event.e);
  post.push(grid.byte_rows[state[0] % 32][state[1] % 8]);
}
assert.deepEqual(state, [0, 21]);

const SIZE = 2048, WIDTH = 384;
const cipher = corpus.pages.filter((p) => p.page < 56)
  .flatMap((p) => p.indices).slice(0, SIZE);
assert.equal(cipher.length, SIZE);

const alphabet = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const native = [];
for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const values = [];
  for (let j = 0; j < word.length;) {
    const token = alphabet.find((x) => word.startsWith(x.s, j));
    if (!token) { values.length = 0; break; }
    values.push(token.i);
    j += token.s.length;
  }
  native.push(...values);
}
const clear = native.slice(3000, 3000 + SIZE);
assert.equal(clear.length, SIZE);

const makePad = (bytes) =>
  Array.from({ length: SIZE + 1024 }, (_, i) => mod(bytes[i % 256]));
const original = [];
for (const [sample, bytes] of [['pre', pre], ['post', post]]) {
  const pad = makePad(bytes);
  for (const sign of [1, -1]) {
    const result = decode(cipher, pad, sign, WIDTH);
    original.push({
      sample, sign, meanScore: result.meanScore,
      skips: result.skips, finalClock: result.finalClock,
      prefix: result.prefix,
    });
  }
}

// Independent, disjoint source-native positive control. encryptSoft and decode
// are imported unchanged from Agent 20's tested helper.
const positivePad = makePad(pre);
const planted = encryptSoft(clear, positivePad, 1);
const recovered = decode(planted.ciphertext, positivePad, 1, WIDTH);
const correct = recovered.decoded.filter((x, i) => x === clear[i]).length;
assert.ok(correct > 0.9 * SIZE, 'source-native skip-HMM positive control failed');
assert.equal(recovered.skips, planted.rejected);

console.log(JSON.stringify({
  sourceEvents: events.length,
  redRunes: events.filter((e) => !e.mark).length,
  thirteenDotMarks: events.filter((e) => e.mark).length,
  p7Offset194Records: p7.length,
  field: 'u^2 = 3u + 8',
  initialState: [4, 24],
  multiplier: z,
  finalState: state,
  key: 'pre/post table coordinate byte mod29, book-continuous period256',
  model: 'GP29 additive with same-plaintext repeated-output rejection p=0.82, max 3 hidden draws',
  originalWindow: [0, SIZE],
  beamWidth: WIDTH,
  sourceNativePositive: {
    length: SIZE, rejected: planted.rejected, drawn: planted.drawn,
    inferredSkips: recovered.skips, correct, meanScore: recovered.meanScore,
    prefix: recovered.prefix,
  },
  original,
}, null, 2));
