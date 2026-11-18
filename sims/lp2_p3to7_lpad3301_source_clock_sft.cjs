'use strict';

/**
 * Source-constrained LPAD/3301 alignment, with two frozen GP29 key consumers.
 * This is a diagnostic on original ciphertext, not a recovered plaintext.
 * Single file, Node.js 22/CommonJS. Run from the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n/g, '\n');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt').split('%');
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.flatMap((n, i) => n === 0 ? [i] : []), [192, 229]);

const segment = transcription.slice(3, 8).join('').replace(/[\/\r\n]/g, '').replace(/[&$]/g, '.');
const words = segment.split(/[.-]/).filter(Boolean).map(w =>
  [...w].map(r => corpus.runes.indexOf(r)));
assert(words.every(w => w.length > 0 && w.every(x => x >= 0)));
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
assert.equal(Math.max(...words.map(w => w.length)), 12);

const red = ink.pages.find(p => p.page === 7).red_spans[0];
assert.equal(red.start, 194);
assert.equal(red.length, 14);
assert.equal(red.start + red.length, corpus.pages[7].indices.length);
assert.deepEqual(words.slice(-5).map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(words.slice(-5).flat(), [...red.runes].map(r => corpus.runes.indexOf(r)));
const starts = ink.pages.filter(p => [3, 4, 5, 6, 7].includes(p.page))
  .flatMap(p => (p.red_spans || []).map(span => corpus.translit[corpus.pages[p.page].indices[span.start]]));
assert.equal(starts.join(''), 'LPAD');

const WIDTH = 13;
const totalPadded = words.length * WIDTH;
assert.equal(totalPadded, 3315);
assert.equal(totalPadded - red.length, 3301);
assert.equal((totalPadded - red.length) % bytes.length, 229);

// Include all five terminal red words when computing word rows and padding.
// Remove only their 14 actual red rune cells. In particular, their 51
// hypothetical leading padding-F positions remain in the 3301-cell readout.
// This unusual partial removal is a *hypothesis*, not a printed instruction.
const positions = words.slice(0, -5).flatMap((w, row) => w.map((cipher, j) => ({
  cipher, at: row * WIDTH + (WIDTH - w.length) + j
})));
assert.equal(positions.length, 1131);
assert(positions.every(x => x.at >= 0 && x.at < totalPadded - WIDTH * 5));

const primes = [];
for (let v = 2; primes.length < totalPadded; v++) {
  let prime = true;
  for (let d = 2; d * d <= v; d++) {
    if (v % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(v);
}
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} text @returns {number} */
function ioc(text) {
  const counts = Array(29).fill(0);
  for (const x of text) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (text.length * (text.length - 1));
}
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const tests = [];
for (const name of ['p50-row-major-base60', 'prime-totient']) {
  const key = positions.map(({at}) => name === 'p50-row-major-base60'
    ? bytes[at % 256] : primes[at] - 1);
  for (const sign of [-1, 1]) {
    const decrypted = positions.map((x, i) => mod29(x.cipher + sign * key[i]));
    assert(positions.every((x, i) => mod29(decrypted[i] - sign * key[i]) === x.cipher));
    const positive = positions.map((_, i) => native[i % native.length]);
    const plantedCipher = positive.map((p, i) => mod29(p - sign * key[i]));
    assert.deepEqual(plantedCipher.map((c, i) => mod29(c + sign * key[i])), positive);
    tests.push({
      model: name, direction: sign < 0 ? 'subtract' : 'add',
      originalRunes: positions.length, ioc: ioc(decrypted),
      positiveRecovered: positive.length,
      prefix: decrypted.slice(0, 45).map(x => corpus.translit[x]).join('')
    });
  }
}
console.log(JSON.stringify({
  status: 'no authentic plaintext or independently selected receiver',
  sourcePages: 'p3-p7', redInitials: starts.join(''),
  originalWords: words.length, originalRunes: 1145,
  finalRedWords: [2, 4, 3, 2, 3], finalRedRunes: red.length,
  paddedCells: totalPadded, remainingAfterRemovingFinal14: 3301,
  omittedColophonPaddingRetained: WIDTH * 5 - red.length,
  nextCyclicTableAddress: 3301 % 256, knownTableZeroIndices: [192, 229],
  directConsumers: tests, baselineIoc: ioc(positions.map(x => x.cipher))
}, null, 2));
