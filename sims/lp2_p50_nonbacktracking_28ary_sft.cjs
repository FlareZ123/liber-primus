'use strict';

/**
 * Original LP2 p50 256-byte key as a 28-state nonbacktracking GP29
 * differential cipher. Source-fixed, lossless candidate gate.
 *
 * Usage from repository root: node sims/lp2_p50_nonbacktracking_28ary_sft.cjs
 * Reads the original canonical source corpus/table; no CLI parameters.
 * This is an explicit hypothesis test, not an authenticated Cicada cipher.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @template T @param {string} name @returns {T} */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
/** @param {number} x @param {number} n @returns {number} */
function mod(x, n) {
  return ((x % n) + n) % n;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  const n = symbols.length;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}
/**
 * Cipher consumes one key for every rune. GP index 0 is the hypothetical
 * transparent repeat sentinel. Other indices are a 28-state alphabet.
 * Previous ciphertext rune is carried across successive steps.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @param {number} initial
 * @returns {number[]}
 */
function enc(plaintext, key, sign, initial = 0) {
  let prev = initial;
  return plaintext.map((p, i) => {
    const delta = p === 0 ? 0 : 1 + mod(p - 1 - sign * (key[i % key.length] % 28), 28);
    prev = mod(prev + delta, 29);
    return prev;
  });
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @param {number} initial
 * @returns {number[]}
 */
function dec(ciphertext, key, sign, initial = 0) {
  let prev = initial;
  return ciphertext.map((c, i) => {
    const delta = mod(c - prev, 29);
    prev = c;
    return delta === 0 ? 0 : 1 + mod(delta - 1 + sign * (key[i % key.length] % 28), 28);
  });
}

function main() {
  const corpus = readJson('resources/liber-primus/lp2-corpus.json');
  const table = readJson('resources/liber-primus/lp2-grid-256.json');
  assert.equal(table.bytes.length, 256);
  assert.equal(corpus.runes.length, 29);
  const pages = corpus.pages.filter((p) => p.page <= 55 && p.runic_count);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

  const clear = corpus.pages.find((p) => p.page === 57).indices;
  assert.equal(clear.length, 95);
  const rows = [];
  for (const clock of ['global', 'page']) {
    for (const direction of ['printed', 'reversed']) {
      const key = direction === 'printed' ? table.bytes : [...table.bytes].reverse();
      for (const sign of [-1, 1]) {
        // A separate authentic clear-GP p57 positive verifies every rune and
        // includes all three literal F (index 0) bypass occurrences.
        const planted = enc(clear, key, sign);
        assert.deepEqual(dec(planted, key, sign), clear);

        /** @type {number[]} */
        const plaintext = [];
        let phase = 0;
        let equalPairs = 0;
        for (const p of pages) {
          const a = p.indices;
          if (clock === 'page') phase = 0;
          const stream = a.slice(1);
          const localKey = stream.map((_, i) => key[(phase + i) % 256]);
          const decoded = dec(stream, localKey, sign, a[0]);
          assert.deepEqual(enc(decoded, localKey, sign, a[0]), stream);
          for (let i = 1; i < a.length; i++) {
            if (a[i] === a[i - 1]) equalPairs++;
          }
          plaintext.push(...decoded);
          phase += stream.length;
        }
        assert.equal(plaintext.length, 12901);
        assert.equal(equalPairs, 86);
        assert.equal(plaintext.filter((x) => x === 0).length, 86);
        const score = ioc(plaintext);
        rows.push({ clock, direction, sign, length: plaintext.length,
          ioc: Number(score.toFixed(9)),
          repeatedSymbolCount: 86,
          preview: plaintext.slice(0, 60).map((x) => corpus.translit[x]).join(' ') });
        console.log(JSON.stringify(rows[rows.length - 1]));
      }
    }
  }
  assert.equal(rows.length, 8);
  assert(rows.every((r) => r.ioc > 0.035 && r.ioc < 0.036));
  console.log(JSON.stringify({ verdict: 'NO ORIGINAL PLAINTEXT',
    positive: 'p57 native rune index plant 95/95 for all 8 variants',
    original: '12901/12901 forward reencryption per variant (implementation only)',
    iocLower: Math.min(...rows.map((r) => r.ioc)),
    iocUpper: Math.max(...rows.map((r) => r.ioc)) }));
}
main();
