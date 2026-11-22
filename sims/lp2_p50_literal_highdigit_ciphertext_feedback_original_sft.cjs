/**
 * First-token high digit as an actual reversible GP29 output-feedback key.
 * Source motive: original p50 phase-zero '0' tokens predict 33/86 same-rune
 * LP2 events. Freeze the first-rune-indexed 256-cell clock used by #1508.
 * Hypothesis C[i] = C[i-1] + P[i] + floor(B[(i-1) mod 256]/60) (mod 29).
 * No secret coefficients, language-fitted keys, phases, page resets or skips.
 * Direct source-rune decoder, with authentic 95-rune solved-p57 positive.
 *
 * Windows 11, Node.js 22 CommonJS; read-only.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');

const pages = corpus.pages.filter(p => p.page <= 55 && p.runic_count > 0);
const original = pages.flatMap(p => p.indices);
const positive = corpus.pages.find(p => p.page === 57).indices;
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(positive.length, 95);
assert.equal(grid.bytes.length, 256);

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} currentIndex @returns {number} */
function highDigit(currentIndex) {
  // Clocked at first ciphertext rune of the preceding two-rune pair,
  // making this the unchanged #1508 event annotation at i >= 1.
  const sourceIndex = Math.max(0, currentIndex - 1) % 256;
  return Math.floor(grid.bytes[sourceIndex] / 60);
}

/** @param {number[]} encrypted @returns {number[]} */
function decrypt(encrypted) {
  return encrypted.map((c, i) =>
    mod(c - (i > 0 ? encrypted[i - 1] : 0) - highDigit(i)));
}

/** @param {number[]} plaintext @returns {number[]} */
function encrypt(plaintext) {
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    out.push(mod(plaintext[i] + (i > 0 ? out[i - 1] : 0) + highDigit(i)));
  }
  return out;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((s, count) => s + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {string} */
const latin = symbols => symbols.map(index => corpus.translit[index]).join('');

const decoded = decrypt(original);
assert.equal(decoded.length, 12956);
assert.deepEqual(encrypt(decoded), original);
const planted = encrypt(positive);
assert.deepEqual(decrypt(planted), positive);
const alteredPhasePositive = planted.map((c, i) =>
  mod(c - (i > 0 ? planted[i - 1] : 0) -
    Math.floor(grid.bytes[i % 256] / 60)));
assert.ok(alteredPhasePositive.some((symbol, i) => symbol !== positive[i]),
  'positive control detects an off-by-one source clock');
const highCounts = Array(5).fill(0);
for (const byte of grid.bytes) highCounts[Math.floor(byte / 60)]++;
assert.deepEqual(highCounts, [60, 58, 65, 56, 17]);

let offset = 0;
const eventCounts = Array(5).fill(0);
let events = 0;
for (const page of pages) {
  for (let local = 1; local < page.indices.length; local++) {
    if (page.indices[local] !== page.indices[local - 1]) continue;
    const globalIndex = offset + local;
    const digit = highDigit(globalIndex);
    eventCounts[digit]++;
    events++;
    assert.equal(decoded[globalIndex], mod(-digit),
      'ciphertext duplicate decodes to the expected rare GP letter');
  }
  offset += page.indices.length;
}
assert.equal(offset, original.length);
assert.equal(events, 86);
assert.equal(eventCounts[0], 33);

const out = {
  model: 'GP29 first-order output feedback with original p50 base60 high digit',
  classification: 'source-shaped exact reversible candidate; no author opcode',
  sourceCellPhase: '(current-rune-global-index-1) modulo 256',
  originalPages: pages.length,
  originalRunes: original.length,
  originalIoC: ioc(original),
  decodedIoC: ioc(decoded),
  nativeClearP57IoC: ioc(positive),
  topDigitCellCounts: highCounts,
  samePageOriginalDoublets: events,
  doubletsPerDigit: eventCounts,
  eventExpectedPlainLabels: [0, 28, 27, 26, 25].map(i => corpus.translit[i]),
  exactOriginalReencryption: original.length,
  authenticNativeP57PlantRecovered: positive.length,
  wrongPhasePlantMatches: alteredPhasePositive.filter((v, i) => v === positive[i]).length,
  decodedFirst160: latin(decoded.slice(0, 160)),
};
console.log('LP2_P50_HIGHDIGIT_FEEDBACK_ORIGINAL', JSON.stringify(out, null, 2));
