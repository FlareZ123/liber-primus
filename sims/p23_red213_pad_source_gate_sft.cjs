'use strict';

/**
 * LP2 red-only 213-rune / physical p23 213-rune direct-pad SFT.
 *
 * Source-visible: original unsolved LP2 pp0..55 contain exactly 213 red
 * runes (225 total minus 12 solved p56/p57), and physical p23 has exactly
 * 213 runes. A concrete source-register hypothesis is that the ordered red
 * runes supply a one-time GP29 additive pad for the exact-length p23 page.
 * This test fixes the original reading order, offset zero, 29-symbol GP
 * alphabet and whole-page clock before checking language. It also scores
 * opposite-sign subtraction as a sensitivity control. Do not treat the
 * length equality as a cipher instruction.
 *
 * Run: node sims/p23_red213_pad_source_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const page23 = corpus.pages.find(p => p.page === 23).indices;
const gpRune = new Map(corpus.runes.map((r, index) => [r, index]));
const red213 = ink.pages.filter(p => p.page <= 55).flatMap(p =>
  (p.red_spans || []).flatMap(span => [...span.runes].map(r => {
    assert.ok(gpRune.has(r), 'non-GP red source glyph');
    return gpRune.get(r);
  }))
);
assert.equal(corpus.pages.slice(0, 56).reduce((a, p) => a + p.indices.length, 0), 12956);
assert.equal(red213.length, 213);
assert.equal(page23.length, 213);
assert.equal(ink.counts.red, 225);

/** @param {number[]} text @param {number[]} key @param {number} sign */
const add = (text, key, sign) => text.map((x, i) => ((x + sign * key[i]) % 29 + 29) % 29);
const minus = add(page23, red213, -1);
const plus = add(page23, red213, 1);
assert.deepEqual(add(minus, red213, 1), page23);
assert.deepEqual(add(plus, red213, -1), page23);

const quads = new Map();
let total = 0;
const source = fs.readFileSync(path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8');
for (const line of source.trim().split(/\r?\n/)) {
  const [gram, val] = line.trim().split(/\s+/);
  const n = Number(val);
  if (gram.length !== 4 || !Number.isFinite(n)) continue;
  quads.set(gram, n);
  total += n;
}
/** @param {number[]} runes */
function score(runes) {
  const text = runes.map(i => corpus.translit[i]).join('');
  let sum = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    sum += Math.log10((quads.get(text.slice(i, i + 4)) || .01) / total);
  }
  return {quadgramMean: sum / (text.length - 3), prefix: text.slice(0, 90)};
}
const scored = {original: score(page23), redKey: score(red213), subtract: score(minus), add: score(plus)};
assert.ok(Math.abs(scored.original.quadgramMean - (-7.350740544591115)) < 1e-8);
assert.ok(Math.abs(scored.subtract.quadgramMean - (-7.617607119740183)) < 1e-8);
assert.ok(Math.abs(scored.add.quadgramMean - (-7.51077675341179)) < 1e-8);

// A planted true key does recover a known original plain GP sequence.
const knownPlain = corpus.pages.find(p => p.page === 57).indices;
const plant = add(knownPlain, red213, 1);
assert.deepEqual(add(plant, red213, -1), knownPlain);
console.log(JSON.stringify({
  original: 'lp2-corpus.json p23 and lp2-ink-annotations.json unsolved red spans in source order',
  keySourceRunes: red213.length, ciphertextRunes: page23.length,
  operation: 'P[i]=(C_p23[i]-red213[i]) mod29, no key phase or skippable F',
  scored, exactForwardReplay: true, nativeGpPlant: 'solved p57 95-rune sequence exactly round-tripped',
  interpretation: 'NEGATIVE: exact length match exists but direct original red-only pad yields no plaintext'
}, null, 2));
