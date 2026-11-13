'use strict';

/**
 * 2016 signed-source JPEG dimensions -> Euclidean quotient -> LP2 p32 BUDS.
 * A cipher key and next operation remain unknown. Retrospective clue test.
 * Reproduce: node sims/p32_signed2016_euclid93_buds_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const image = fs.readFileSync(path.join(
  root, 'resources/historical/cicada2016-4gq25.jpg'));
assert.equal(image.length, 26342);
const header = Buffer.from('blob ' + image.length + '\0', 'utf8');
const sha = crypto.createHash('sha1')
  .update(Buffer.concat([header, image])).digest('hex');
assert.equal(sha, '22027296dcd7df53c5127e6aadbabeaf3223f72d');
const sof = image.indexOf(Buffer.from([0xff, 0xc0]));
assert.ok(sof > 0 && sof < 500);
const width = image.readUInt16BE(sof + 7);
const height = image.readUInt16BE(sof + 5);
assert.deepEqual([width, height], [563, 569]);
const p32 = corpus.pages.find(p => p.page === 32);
assert.equal(p32.status, 'unsolved');
assert.equal(p32.indices.length, 121);
const runes = p32.indices;
const primeSum = indices => indices.reduce((n, i) => n + corpus.prime[i], 0);
assert.equal(primeSum(runes.slice(0, 11)), width);
assert.equal(primeSum(Array.from({length: 11}, (_, r) => runes[11 * r])), height);

// Remove the obvious quotient 1 of two nearly equal image dimensions and
// use the next quotient as a candidate zero-based rune address.
let a = height;
let b = width;
const steps = [];
while (b) {
  const q = Math.floor(a / b);
  const remainder = a % b;
  steps.push({dividend: a, divisor: b, quotient: q, remainder});
  a = b;
  b = remainder;
}
assert.deepEqual(steps.map(s => s.quotient), [1, 93, 1, 5]);
const address = steps[1].quotient;
assert.equal(address, 93);
assert.deepEqual([Math.floor(address / 11), address % 11], [8, 5]);
assert.equal(steps[1].remainder, address % 11);
const translit = xs => xs.map(i => corpus.translit[i]).join('');
assert.equal(translit(runes.slice(33, 37)), 'HOME');
const hit = runes.slice(address, address + 4);
assert.equal(translit(hit), 'BUDS');
assert.deepEqual(hit.map(i => corpus.prime[i]), [61, 3, 89, 53]);
assert.equal(primeSum(hit), 206);
assert.equal(translit(runes.slice(102, 104)), 'EN');

// Exact original printed word. Slash/newline are line wraps, not delimiters.
const raw = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .split('%')[32].replace(/\/\s*/gu, '');
const byRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const words = raw.split(/[-.&$§]/u).map(piece =>
  [...piece].filter(ch => byRune.has(ch)).map(ch => byRune.get(ch)))
  .filter(x => x.length);
assert.deepEqual(words.flat(), runes);
let cursor = 0;
let carrier = null;
for (const word of words) {
  if (cursor <= address && address < cursor + word.length)
    carrier = {start: cursor, end: cursor + word.length,
      spelling: translit(word)};
  cursor += word.length;
}
assert.deepEqual(carrier, {
  start: 89, end: 97, spelling: 'OENGOMBUDS'
});
const book = corpus.pages.filter(p => p.status === 'unsolved')
  .flatMap(p => p.indices);
assert.equal(book.length, 12956);
let count = 0;
let onlyOffset = -1;
for (let i = 0; i <= book.length - hit.length; i++) {
  if (hit.every((v, j) => book[i + j] === v)) {
    count++;
    onlyOffset = i;
  }
}
const expectedBookOffset = corpus.pages.filter(p =>
  p.status === 'unsolved' && p.page < 32)
  .reduce((n, p) => n + p.indices.length, 0) + address;
assert.equal(count, 1);
assert.equal(onlyOffset, expectedBookOffset);
assert.equal(onlyOffset, 7932);
const phi206 = 102; // 206 = 2 * 103, so phi(206) = 102.
console.log(JSON.stringify({
  original2016Jpeg: {width, height, gitBlobSha: sha},
  p32AxisPrimeSums: [width, height],
  euclideanSteps: steps,
  pointer: {page: 32, localRuneOffset: address, row: 8, column: 5,
    transliteration: translit(hit), wordContext: carrier,
    fullBookRuneOffset: onlyOffset, totalOriginalOccurrences: count},
  conditionalNumericalContinuation: {
    budsPrimeSum: primeSum(hit), phi206, textAtOffset102: translit(runes.slice(102, 104))
  },
  status: 'Source-motivated address hypothesis only; original plaintext and key remain unknown.'
}, null, 2));
