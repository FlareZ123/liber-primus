'use strict';

// Original p14/p23/p55 native-GP29 title-key experiment.
// Run: node sims/lp2_2013_instar_title_native_fskip_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const gp = new Map(corpus.translit.map((name, i) => [name, i]));
const title = 'The Instar Emergence';
const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];

/**
 * @param {string} source
 * @param {boolean} grouped
 * @returns {number[]}
 */
function runes(source, grouped) {
  const s = source.toUpperCase().replace(/[^A-Z]/g, '').replace(/[V]/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const glyph = (grouped ? digraphs.find((v) => s.startsWith(v, i)) : undefined) ?? s[i];
    const value = gp.get(glyph);
    assert.notEqual(value, undefined);
    out.push(value);
    i += glyph.length;
  }
  return out;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign -1 or +1
 * @returns {{ plaintext: number[][], failure: number | null }}
 */
function inverse(ciphertext, key, sign) {
  let paths = [{ symbols: [], cursor: 0 }];
  for (let offset = 0; offset < ciphertext.length; offset++) {
    const c = ciphertext[offset];
    const next = [];
    for (const state of paths) {
      // Historical p56 rule: plaintext F=0 emits literal ciphertext F without a key step.
      if (c === 0) next.push({ symbols: [...state.symbols, 0], cursor: state.cursor });
      const p = ((c + sign * key[state.cursor % key.length]) % 29 + 29) % 29;
      if (p !== 0) next.push({ symbols: [...state.symbols, p], cursor: state.cursor + 1 });
    }
    if (next.length === 0) return { plaintext: [], failure: offset };
    paths = next;
  }
  return { plaintext: paths.map((v) => v.symbols), failure: null };
}

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plaintext, key, sign) {
  let cursor = 0;
  return plaintext.map((p) => {
    if (p === 0) return 0;
    const c = ((p - sign * key[cursor % key.length]) % 29 + 29) % 29;
    cursor++;
    return c;
  });
}

/** @param {number[]} runesInput */
function ioc(runesInput) {
  const counts = new Array(29).fill(0);
  for (const rune of runesInput) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (runesInput.length * (runesInput.length - 1));
}

const cases = [];
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
for (const grouped of [true, false]) {
  const key = runes(title, grouped);
  assert.equal(key.length, grouped ? 17 : 18);
  for (const sign of [-1, +1]) {
    const planted = encrypt(p57, key, sign);
    const recovered = inverse(planted, key, sign);
    assert.ok(recovered.plaintext.some((p) => p.every((value, i) => value === p57[i])), 'p57 planted exact-F skip positive');
    for (const pageNum of [14, 23, 55]) {
      const page = corpus.pages[pageNum].indices;
      const result = inverse(page, key, sign);
      const best = result.plaintext.reduce((candidate, p) => candidate === null || ioc(p) > ioc(candidate) ? p : candidate, null);
      if (best !== null) assert.deepEqual(encrypt(best, key, sign), page, 'original round-trip');
      cases.push({
        mode: grouped ? 'GP17' : 'ROMAN18', sign, page: pageNum,
        length: page.length, legal: result.plaintext.length, first_impossible: result.failure,
        best_ioc: best === null ? null : ioc(best),
        first: best === null ? null : best.slice(0, 36).map((v) => corpus.translit[v]).join(' ')
      });
    }
  }
}

const expected = [
  ['GP17', -1, 14, 34], ['GP17', -1, 23, 86], ['GP17', -1, 55, 56],
  ['GP17', +1, 14, 1], ['GP17', +1, 23, 25], ['GP17', +1, 55, 2],
  ['ROMAN18', -1, 14, 0], ['ROMAN18', -1, 23, 41], ['ROMAN18', -1, 55, 3],
  ['ROMAN18', +1, 14, 8], ['ROMAN18', +1, 23, 5], ['ROMAN18', +1, 55, null]
];
for (const [mode, sign, page, failure] of expected) {
  const row = cases.find((c) => c.mode === mode && c.sign === sign && c.page === page);
  assert.equal(row.first_impossible, failure);
  assert.equal(row.legal, failure === null ? 1 : 0);
}
assert.equal(cases.find((c) => c.mode === 'ROMAN18' && c.sign === 1 && c.page === 55).best_ioc, 0.03894736842105263);
console.log(JSON.stringify({ title, p57_planted_tests: 4, cases }, null, 2));
console.log('PASS original p14/p23/p55 F-transparent historical title gate');
