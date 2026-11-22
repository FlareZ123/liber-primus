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
    const native = corpus.pages.find((p) => p.page === 57).indices.slice(0, 75);
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

// Original printed p57 line 1 has 20 runes; the other four lines have 75.
// The first four printed words have 19 runes; the last 16 words have 76.
const printedLines = lastPage.split('/').slice(0, 5).map((line) =>
  [...line].filter((rune) => corpus.runes.includes(rune)).map(indexOf)
);
assert.deepEqual(printedLines.map((line) => line.length), [20, 17, 17, 18, 23]);
assert.deepEqual(printedLines.flat(), knownP57);
assert.equal(indexed(words.slice(0, 4).join('')).length, 19);
const tail75 = printedLines.slice(1).flat();
const tail76 = indexed(words.slice(4).join(''));
assert.deepEqual(tail75, knownP57.slice(20));
assert.deepEqual(tail76, knownP57.slice(19));
assert.equal(tail75.length, 75);
assert.equal(tail76.length, 76);
const p57TailPadGate = [];
for (const [name, cipher, key] of [
  ['after-first-line-75-to-p55-body-75', p55Body, tail75],
  ['after-first-four-words-76-to-full-p55-76', p55, tail76]
]) {
  for (const sign of [-1, 1]) {
    const plaintext = transform(cipher, key, sign);
    assert.deepEqual(transform(plaintext, key, -sign), cipher);
    const native = knownP57.slice(0, cipher.length);
    assert.deepEqual(transform(transform(native, key, -sign), key, sign), native);
    p57TailPadGate.push({
      sourceAlignment: name, decryptSign: sign,
      ioc: coincidence(plaintext), romanization: asGp(plaintext)
    });
  }
}

// Key-independent necessary condition for any fixed symbol substitution:
// every pair of equal ciphertext symbols must have equal paired plaintext symbols.
// A secret bijection must preserve both equality directions.
const equalityConflictCounts = (cipher, candidatePlaintext) => {
  assert.equal(cipher.length, candidatePlaintext.length);
  let repeatedCipherDifferentPlaintext = 0;
  let differentCipherRepeatedPlaintext = 0;
  for (let i = 0; i < cipher.length; i++) {
    for (let j = i + 1; j < cipher.length; j++) {
      if (cipher[i] === cipher[j] && candidatePlaintext[i] !== candidatePlaintext[j]) {
        repeatedCipherDifferentPlaintext++;
      }
      if (cipher[i] !== cipher[j] && candidatePlaintext[i] === candidatePlaintext[j]) {
        differentCipherRepeatedPlaintext++;
      }
    }
  }
  return { repeatedCipherDifferentPlaintext, differentCipherRepeatedPlaintext };
};
const substitutionCribGate = {
  last16WordsToFullP55: equalityConflictCounts(p55, tail76),
  lastFourLinesToP55Body: equalityConflictCounts(p55Body, tail75)
};
assert.deepEqual(substitutionCribGate.last16WordsToFullP55, {
  repeatedCipherDifferentPlaintext: 99, differentCipherRepeatedPlaintext: 171
});
assert.deepEqual(substitutionCribGate.lastFourLinesToP55Body, {
  repeatedCipherDifferentPlaintext: 98, differentCipherRepeatedPlaintext: 168
});

const probe55 = [];
for (const sign of [-1, 1]) {
  const outputPages = eligiblePages.map((p, i) => p.indices.map((v) => mod(v + sign * withoutBoth[i])));
  const output = outputPages.flat();
  const native = corpus.pages.find((p) => p.page === 57).indices;
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
  p57LineWordTailPadGate: p57TailPadGate,
  equalityInvariantCribGate: substitutionCribGate,
  allPagesDirectPageShiftGate: probe55,
  verdict: 'All original decodes remain nonlinguistic; the fixed p57 word-edge, physical-line, word-tail pad and page-shift consumers are negative. Exact round trips are implementation checks.'
}, null, 2));
