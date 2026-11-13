/**
 * Source-fixed p57 "SHED OUR OWN CIRCUMFERENCES" edge-rune key gate.
 * Copyright (c) 2026 research contributors; use source attribution in report.
 *
 * Run with Node.js 22 from anywhere in this repository:
 *   node sims/lp2_p57_word_shed_edge_key_sft.cjs
 *
 * No external packages. All inputs read from committed canonical sources.
 * The test is deliberately limited to direct GP29 additive pad consumers.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const modulus = corpus.runes.length;
assert.equal(modulus, 29);

const lastPage = source.split('%').at(-1);
const glyphPattern = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const words = lastPage.replace(/\/\s*/g, '').match(glyphPattern);
const indexOf = (rune) => {
  const i = corpus.runes.indexOf(rune);
  assert.notEqual(i, -1);
  return i;
};
const indexed = (runes) => [...runes].map(indexOf);
const knownP57 = corpus.pages.find((p) => p.page === 57).indices;
const sourceP57 = indexed(words.join(''));
assert.equal(words.length, 20);
assert.equal(sourceP57.length, 95);
assert.deepEqual(sourceP57, knownP57, 'solved p57 transcription must match original corpus');
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(p55.length, 76);
const p55Body = p55.slice(1);
assert.equal(p55Body.length, 75);

const withoutFirst = words.flatMap((word) => [...word].slice(1)).map(indexOf);
const withoutLast = words.flatMap((word) => [...word].slice(0, -1)).map(indexOf);
const withoutBoth = words.flatMap((word) => [...word].slice(1, -1)).map(indexOf);
assert.equal(withoutFirst.length, 75);
assert.equal(withoutLast.length, 75);
assert.equal(withoutBoth.length, 55);

const eligiblePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(eligiblePages.length, 55);
assert.equal(eligiblePages.reduce((n, p) => n + p.indices.length, 0), 12956);

const mod = (x) => ((x % modulus) + modulus) % modulus;
const coincidence = (sequence) => {
  const bins = Array(modulus).fill(0);
  for (const symbol of sequence) bins[symbol]++;
  const n = sequence.length;
  return bins.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
};
const asGp = (xs) => xs.map((x) => corpus.translit[x]).join('');
const transform = (sequence, key, sign) => sequence.map((symbol, i) => mod(symbol + sign * key[i]));

const probe75 = [];
for (const [name, key] of [['remove-first', withoutFirst], ['remove-last', withoutLast]]) {
  for (const sign of [-1, 1]) {
    const output = transform(p55Body, key, sign);
    // A real reversible pad must recover a planted known passage under the same fixed key.
    const native = corpus.pages.find((p) => p.page === 56).indices.slice(0, 75);
    const ciphertextPlant = transform(native, key, -sign);
    assert.deepEqual(transform(ciphertextPlant, key, sign), native);
    // Candidate exact re-encryption is an implementation check, never a proof of success.
    assert.deepEqual(transform(output, key, -sign), p55Body);
    probe75.push({
      edge: name, decryptSign: sign, ioc: coincidence(output),
      romanization: asGp(output)
    });
  }
}

const probe55 = [];
for (const sign of [-1, 1]) {
  const outputPages = eligiblePages.map((p, i) => p.indices.map((v) => mod(v + sign * withoutBoth[i])));
  const output = outputPages.flat();
  const native = corpus.pages.find((p) => p.page === 56).indices;
  const syntheticPlainPages = eligiblePages.map((p, i) => Array.from(
    { length: p.indices.length },
    (_, j) => native[(i + j) % native.length]
  ));
  const syntheticCipherPages = syntheticPlainPages.map((p, i) => p.map((v) => mod(v - sign * withoutBoth[i])));
  for (let i = 0; i < syntheticPlainPages.length; i++) {
    assert.deepEqual(
      syntheticCipherPages[i].map((v) => mod(v + sign * withoutBoth[i])),
      syntheticPlainPages[i]
    );
    assert.deepEqual(
      outputPages[i].map((v) => mod(v - sign * withoutBoth[i])),
      eligiblePages[i].indices
    );
  }
  probe55.push({
    decryptSign: sign, ioc: coincidence(output),
    firstHundredRomanization: asGp(output.slice(0, 100)),
    terminal76Romanization: asGp(output.slice(-76))
  });
}

console.log(JSON.stringify({
  source: 'original LP2 p55/p57 rune series and exact printed p57 words',
  p57WordLengths: words.map((w) => [...w].length),
  p57Runes: sourceP57.length,
  p55FullRunes: p55.length,
  p55CompleteWordBodyRunes: p55Body.length,
  manuscriptRunePages: eligiblePages.length,
  sourceP55BodyIoc: coincidence(p55Body),
  sourceAllUnsolvedIoc: coincidence(eligiblePages.flatMap((p) => p.indices)),
  sourceSolvedP57Ioc: coincidence(knownP57),
  p55BodyAdditiveGate: probe75,
  allPagesDirectPageShiftGate: probe55,
  verdict: 'All original decodes remain nonlinguistic; the explicit pad and page-shift consumers are negative. Exact round trips are implementation checks.'
}, null, 2));
