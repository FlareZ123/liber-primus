'use strict';

/**
 * Source-physical 28-page two-time-pad test with a completely shared
 * positional GP29 key, plus key-reused first/fifth predecessor feedback.
 *
 * The only page pairing is p -> p+28, selected by the source-visible p27/p55
 * six-rune bookend; clock alignments are 0 and +/-42 physical rune positions.
 * This test addresses complete paired-page key reuse, not a special repeated
 * marker or arbitrary independently rekeyed pages.
 *
 * Single runnable Node.js CommonJS test; no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const gibran = fs.readFileSync(path.join(root, 'control', 'gibran_prophet_58585.txt'), 'utf8');
const pages = Array.from({ length: 56 }, (_, number) => {
  const page = corpus.pages.find(p => p.page === number);
  assert(page);
  return page.indices;
});
assert.equal(pages.reduce((sum, p) => sum + p.length, 0), 12956);
assert.deepEqual(pages[27].slice(28, 34), pages[55].slice(70, 76));
assert.deepEqual(pages[55].slice(70), [23, 11, 1, 17, 18, 10]);
const mod = value => (value % 29 + 29) % 29;

/**
 * This GP-native English language control preserves TH, NG and other source
 * Gematria-Primus digraphs. It starts inside the actual Gibran literary text.
 * @param {string} original
 * @returns {number[]}
 */
function nativeEnglish(original) {
  const start = original.indexOf('Almustafa');
  assert(start >= 0);
  const ascii = original.slice(start).toUpperCase()
    .replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/IO/g, 'IA').replace(/[^A-Z]/g, '');
  const table = corpus.translit.map((label, index) => ({ label, index }))
    .sort((a, b) => b.label.length - a.label.length);
  const runes = [];
  for (let i = 0; i < ascii.length;) {
    const found = table.find(item => ascii.startsWith(item.label, i));
    assert(found, 'character absent from GP29 map');
    runes.push(found.index);
    i += found.label.length;
  }
  return runes;
}
const english = nativeEnglish(gibran);
assert(english.length >= 12956);
const native = [];
let cursor = 0;
for (const page of pages) {
  native.push(english.slice(cursor, cursor + page.length));
  cursor += page.length;
}

/** @param {number[]} input @param {number} lag */
function valueAt(input, i, lag) {
  return lag === 0 ? input[i] : mod(input[i] - input[i - lag]);
}

/**
 * @param {number[][]} source
 * @param {number} shift
 * @param {number} lag
 */
function matches(source, shift, lag) {
  let n = 0, equal = 0;
  for (let page = 0; page < 28; page++) {
    const a = source[page], b = source[page + 28];
    for (let i = lag; i < a.length; i++) {
      const j = i + shift;
      if (j < lag || j >= b.length) continue;
      n++;
      if (valueAt(a, i, lag) === valueAt(b, j, lag)) equal++;
    }
  }
  return { n, equal, fraction: Number((equal / n).toFixed(8)) };
}

/**
 * Encode one entire page with additive positional key and feedback lag.
 * Key values are deterministic for a planted control only, are not
 * candidate Cicada keys and are not used to decrypt original ciphertext.
 *
 * @param {number[]} plaintext
 * @param {number[]} keys
 * @param {number} lag
 */
function encrypt(plaintext, keys, lag) {
  const c = [];
  for (let i = 0; i < plaintext.length; i++) {
    const previous = i >= lag && lag > 0 ? c[i - lag] : 0;
    c.push(mod(plaintext[i] + keys[i] + previous));
  }
  return c;
}

/**
 * @param {number} page
 * @param {number} i
 */
function fixedKey(page, i) {
  return mod(3301 + page * 37 + i * 17 + i * i * 5);
}

/**
 * Shared key at (p,i) and (p+28,i+shift); other slots are independently keyed.
 * @param {number} shift
 * @param {number} lag
 */
function sharedKeyPlant(shift, lag) {
  const encrypted = native.map(() => []);
  for (let p = 0; p < 28; p++) {
    const a = native[p], b = native[p + 28];
    const ka = a.map((_, i) => fixedKey(p, i));
    const kb = b.map((_, j) => {
      const i = j - shift;
      return i >= 0 && i < a.length ? ka[i] : fixedKey(p + 28, j);
    });
    encrypted[p] = encrypt(a, ka, lag);
    encrypted[p + 28] = encrypt(b, kb, lag);
  }
  const planted = matches(encrypted, shift, lag);
  const rawEnglish = (() => {
    let n = 0, equal = 0;
    for (let p = 0; p < 28; p++) {
      const a = native[p], b = native[p + 28];
      for (let i = lag; i < a.length; i++) {
        const j = i + shift;
        if (j < lag || j >= b.length) continue;
        n++;
        if (a[i] === b[j]) equal++;
      }
    }
    return { n, equal };
  })();
  assert.equal(planted.n, rawEnglish.n);
  assert.equal(planted.equal, rawEnglish.equal);
  return planted;
}

const results = [];
for (const shift of [0, 42, -42]) {
  for (const lag of [0, 1, 5]) {
    const source = matches(pages, shift, lag);
    const positive = sharedKeyPlant(shift, lag);
    results.push({ shift, tap: lag, source, sourceNativeEnglishSharedKeyPositive: positive });
  }
}
assert.deepEqual(results.slice(0, 3).map(r => r.source.equal), [195, 172, 192]);
assert.deepEqual(results.slice(3, 6).map(r => r.source.equal), [157, 182, 164]);
assert.deepEqual(results.slice(6, 9).map(r => r.source.equal), [195, 160, 195]);
console.log(JSON.stringify({
  hypothesis: 'same position key reused across source page p and p+28',
  physicalSourcePages: 'LP2 p0-55, inclusive (p50 empty)',
  totalOriginalRunes: cursor,
  englishControlRunes: english.length,
  bookendSpecialCase: 'p27 local28..33 equals p55 local70..75, physical shift +42',
  reset: 'each physical page',
  results
}, null, 2));
