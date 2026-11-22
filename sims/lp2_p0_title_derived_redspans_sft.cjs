'use strict';

/**
 * Source-constrained trial: use the conditional EPIPHANY SEEKS reading of the
 * original p0 red 8|5 heading to derive an exact 13-rune additive key.
 * Read every other original red heading in source order, without phase search.
 * This is a falsification of a direct shared-key proposal, not a decryption.
 *
 * Inputs: original-derived corpus, ink annotations, 2016 signed message phrase.
 * Node 22 CommonJS standalone test. Never overwrites any files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const mod29 = x => ((x % 29) + 29) % 29;
const gpIndex = new Map(corpus.runes.map((v, i) => [v, i]));

/** @param {number[]} a */
function ioc(a) {
  const histogram = Array(29).fill(0);
  for (const value of a) histogram[value]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} plaintext @param {number[]} key @param {number} sign @param {number} phase */
function encrypt(plaintext, key, sign, phase) {
  return plaintext.map((value, i) => mod29(value - sign * key[(phase + i) % key.length]));
}

/** @param {number[]} ciphertext @param {number[]} key @param {number} sign @param {number} phase */
function decrypt(ciphertext, key, sign, phase) {
  return ciphertext.map((value, i) => mod29(value + sign * key[(phase + i) % key.length]));
}

assert.equal(corpus.pages.length, 58);
assert.equal(ink.counts.red, 225);
const red = ink.pages.filter(p => p.page <= 55).flatMap(p =>
  (p.red_spans || []).map(s => ({
    page: p.page, start: s.start, ciphertext: Array.from(s.runes, r => gpIndex.get(r))
  }))
);
assert.equal(red[0].page, 0);
assert.equal(red[0].start, 0);
assert.equal(red[0].ciphertext.length, 13);
assert.equal(red.reduce((n, s) => n + s.ciphertext.length, 0), 213);
assert.deepEqual(red[0].ciphertext, corpus.pages[0].indices.slice(0, 13));

// Source phrase has EPIPHANY (8 letters) SEEKS (5 letters). GP writes K as C.
const candidate = 'EPIPHANYSEECS'.split('').map(ch => corpus.translit.indexOf(ch));
assert(candidate.every(x => x >= 0));
const key = red[0].ciphertext.map((c, i) => mod29(c - candidate[i]));
assert.deepEqual(key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
assert.deepEqual(decrypt(red[0].ciphertext, key, -1, 0), candidate);

const holdout = red.slice(1);
const original = holdout.flatMap(s => s.ciphertext);
assert.equal(original.length, 200);
const solvedP57 = corpus.pages[57].indices;
const outputs = [];
for (const clock of ['span-reset', 'continuous-red']) {
  for (const sign of [-1, 1]) {
    let phase = 0;
    const decoded = [];
    const page3 = [];
    for (const span of holdout) {
      const startPhase = clock === 'span-reset' ? 0 : phase;
      const a = decrypt(span.ciphertext, key, sign, startPhase);
      assert.deepEqual(encrypt(a, key, sign, startPhase), span.ciphertext);
      if (span.page === 3 && span.start === 0) page3.push(...a);
      decoded.push(...a);
      phase += span.ciphertext.length;
    }
    const synthetic = Array.from({ length: 200 }, (_, i) => solvedP57[i % solvedP57.length]);
    const ciphertextPlant = encrypt(synthetic, key, sign, 0);
    assert.deepEqual(decrypt(ciphertextPlant, key, sign, 0), synthetic);
    const value = ioc(decoded);
    assert(value < 0.041, 'no original red-heading output resembles plain-language unigram concentration');
    outputs.push({
      clock, sign, n: decoded.length, ioc: value,
      page3_heading: page3.map(x => corpus.translit[x]).join(''),
      hash: crypto.createHash('sha256').update(Buffer.from(decoded)).digest('hex')
    });
  }
}
const p0Body = corpus.pages[0].indices.slice(13);
assert.equal(p0Body.length, 249);
const bodyDecoded = decrypt(p0Body, key, -1, 0);
assert.deepEqual(encrypt(bodyDecoded, key, -1, 0), p0Body);
const report = {
  source: 'original p0 red 8|5 heading + signed 2016 EPIPHANY SEEKS hypothesis',
  status: 'no authentic unknown-page plaintext recovered',
  p0_header_gp: red[0].ciphertext,
  key_cp: key,
  source_red_remaining: original.length,
  original_red_ioc: ioc(original),
  p0_body_ioc: ioc(bodyDecoded),
  clear_p57_ioc: ioc(solvedP57),
  outputs
};
console.log(JSON.stringify(report, null, 2));
