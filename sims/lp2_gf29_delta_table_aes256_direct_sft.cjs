'use strict';
/**
 * Original pp49–51 32x8 table as eight vertical AES-256 keys, fed to a
 * GF29 ciphertext-delta multiplicative cipher. One fixed, source-motivated
 * composition; negative tests do not rule out other table consumers.
 * Run: node sims/lp2_gf29_delta_table_aes256_direct_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const lexSource = read('resources/control/english_wordfreq_textblob.txt');
const order = db.translit.map((t, i) => ({t, i})).sort((a, b) => b.t.length - a.t.length);
const rune = new Map(db.runes.map((v, i) => [v, i]));
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} v @returns {number} */
function inv(v) {
  assert(v > 0 && v < 29);
  for (let x = 1; x < 29; x++) if ((x * v) % 29 === 1) return x;
  throw Error('not unit');
}
/** @param {string} english @returns {number[] | null} */
function gp(english) {
  const s = english.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = order.find(x => s.startsWith(x.t, i));
    if (!t) return null;
    out.push(t.i);
    i += t.t.length;
  }
  return out;
}
const lex = new Set();
for (const m of lexSource.matchAll(/^([a-z]+) (\d+)$/gm)) {
  const c = gp(m[1]);
  if (c) lex.add(c.join(','));
}
assert.equal(lex.size, 29058);
const chapters = [[3,7], [8,14], [15,22], [23,26], [27,32],
  [33,39], [40,53], [54,55]];
assert.equal(table.bytes.length, 256);
const vertical = Array.from({length:8}, (_, c) =>
  Buffer.from(Array.from({length:32}, (_, row) => table.bytes[8*row+c])));
const horizontal = Array.from({length:8}, (_, c) =>
  Buffer.from(table.bytes.slice(32*c, 32*c+32)));
for (const x of vertical.concat(horizontal)) assert.equal(x.length, 32);
/** @param {Buffer} key @param {number} n @returns {Buffer} */
function aesKey(key, n) {
  const enc = crypto.createCipheriv('aes-256-ctr', key, Buffer.alloc(16));
  return Buffer.concat([enc.update(Buffer.alloc(n)), enc.final()]);
}
let p = 0, words = [], current = [];
/** Flush current printed token. */
function finish() {
  if (current.length) words.push(current);
  current = [];
}
for (const char of source) {
  if (rune.has(char)) current.push({page:p >= 50 ? p+1 : p, v:rune.get(char)});
  else if ('-.$&§'.includes(char)) finish();
  else if (char === '%') p++;
}
finish();
const originalWords = words.filter(w => w[0].page >= 3 && w[0].page <= 55);
const actualRunes = originalWords.flat();
const testedRaw = chapters.flatMap(([lo, hi]) => db.pages
  .filter(page => page.page >= lo && page.page <= hi)
  .flatMap(page => page.indices));
assert.equal(testedRaw.length, 12227);
assert.deepEqual(actualRunes.map(r => r.v), testedRaw);
const byPage = new Map(db.pages.map(page => [page.page, page.indices]));
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const h = Array(29).fill(0);
  for (const x of xs) h[x]++;
  const n = xs.length;
  return h.reduce((s, c) => s + c*(c-1), 0) / (n*(n-1));
}
const results = [];
for (const [layout, keys] of [['vertical',vertical],['horizontal',horizontal]]) {
  for (const clock of ['chapter','page']) {
    const decodedPages = new Map();
    for (let j = 0; j < chapters.length; j++) {
      const [first,last] = chapters[j];
      const pages = db.pages.filter(p => p.page >= first && p.page <= last);
      const ks = clock === 'chapter'
        ? aesKey(keys[j], pages.reduce((n, p) => n+p.indices.length, 0))
        : null;
      let pos = 0;
      for (const page of pages) {
        const generated = clock === 'page' ? aesKey(keys[j],page.indices.length)
          : ks.subarray(pos, pos+page.indices.length);
        assert.equal(generated.length, page.indices.length);
        pos += page.indices.length;
        let previous = 0;
        decodedPages.set(page.page, page.indices.map((c, i) => {
          const v = mod((c - previous) * inv(1 + generated[i] % 28) - 1);
          previous = c;
          return v;
        }));
      }
    }
    const offsets = new Map();
    const decodedWordStream = originalWords.map(w => w.map(({page}) => {
      const o = offsets.get(page) || 0;
      offsets.set(page, o+1);
      return decodedPages.get(page)[o];
    }));
    for (const [page, source] of byPage)
      if (page >= 3 && page <= 55) assert.equal(offsets.get(page) || 0, source.length);
    const flat = decodedWordStream.flat();
    let longEnglish = 0, allEnglish = 0, fullWords = 0;
    for (const w of decodedWordStream) {
      fullWords++;
      if (lex.has(w.join(','))) {
        allEnglish++;
        if (w.length >= 6) longEnglish++;
      }
    }
    // Assert inverse correctness against exact original ciphertext.
    for (let j = 0; j < chapters.length; j++) {
      const [first,last] = chapters[j];
      const pages = db.pages.filter(p => p.page >= first && p.page <= last);
      const ks = clock === 'chapter'
        ? aesKey(keys[j], pages.reduce((n,p) => n+p.indices.length, 0))
        : null;
      let pos = 0;
      for (const page of pages) {
        const gen = clock === 'page' ? aesKey(keys[j],page.indices.length)
          : ks.subarray(pos,pos+page.indices.length);
        pos += page.indices.length;
        let previous = 0;
        const forward = decodedPages.get(page.page).map((plain,i) => {
          previous = mod(previous + (1 + gen[i] % 28)*(plain+1));
          return previous;
        });
        assert.deepEqual(forward, page.indices);
      }
    }
    results.push({layout, clock, runeCount:flat.length, words:fullWords,
      nativeEnglishWords:allEnglish, nativeEnglishLongWords:longEnglish,
      decodedIoC:+ioc(flat).toFixed(6),
      prefix:flat.slice(0,44).map(i=>db.translit[i]).join(' ')});
  }
}
// Native GP29 positive plant with the exact same table-selected cipher.
const known = db.pages[57].indices.concat(gp('each'));
const key = aesKey(vertical[0], known.length);
const enciphered = [];
let previous = 0;
for (let i = 0; i < known.length; i++) {
  previous = mod(previous + (1 + key[i]%28)*(known[i]+1));
  enciphered.push(previous);
}
previous = 0;
const output = enciphered.map((c,i) => {
  const value = mod((c - previous)*inv(1+key[i]%28)-1);
  previous = c; return value;
});
assert.deepEqual(output, known);
console.log(JSON.stringify({tableSource:'32 rows x 8 columns, base60 bytes',
  rule:'AES256-CTR zero IV, 32-byte key per column / 4-row band, 1+byte mod28',
  originalCipherIoC:+ioc(testedRaw).toFixed(6),tested:results,
  knownSourceGpPlant:{originalP57:95,extraEa:3,recovered:output.length,
    exact:true}},null,2));
