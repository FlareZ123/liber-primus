'use strict';

/**
 * Historical source-word crib test that permits zero or one deleted
 * plaintext rune per ciphertext word. One runnable CommonJS test file.
 *
 * Input: original LP2 GP29 transcription, the separately pinned authentic
 * 2012 book-code source word lengths, and archived 2013 Crowley word lengths.
 * No plaintext key, hand-adjusted word boundaries, or source-specific shift.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const original = read('resources/liber-primus/lp2-transcription.txt');
const rune = /[\u16A0-\u16FF]/u;

/** Source-faithful word parser: line and page wraps do not end words.
 * @param {string} source @returns {string[]}
 */
function runeWords(source) {
  const words = [];
  let token = '';
  for (const ch of source) {
    if (rune.test(ch)) token += ch;
    else if (ch === '/' || ch === '%' || /\s/u.test(ch)) continue;
    else if (token) { words.push(token); token = ''; }
  }
  if (token) words.push(token);
  return words;
}

const originalWords = runeWords(original.split('%').slice(0, 55).join('%'));
const target = originalWords.map((w) => w.length);
assert.equal(originalWords.length, 2896);
assert.equal(target.reduce((s, n) => s + n, 0), 12956);
const books = JSON.parse(read('resources/derived/2012-bookcode-gp-wordlengths.json'));
const liberAl = JSON.parse(read('resources/derived/cicada2013_liber_al_wordlengths.json'));
const sources = [
  ...books.sources.map((entry) => ({
    name: entry.id,
    values: [...entry.encoded_lengths].map((c) => c.charCodeAt(0) - 65),
  })),
  { name: 'liber-al-three-chapters', values: liberAl.sources[1].gpWordLengths },
];
assert.deepEqual(sources.map((s) => s.values.length), [186810, 1691, 105582, 6030]);

const WINDOW = 8;
const BASE = 32;
const TAIL = BASE ** (WINDOW - 1);

/** Include every eight-word source-length vector consistent with each
 * ciphertext word having zero or one deleted plaintext rune. The packed key is exact
 * under IEEE-754, as 32**8 < 2**53.
 * @param {number[]} cipherLengths @returns {Map<number, number[]>}
 */
function indexTargets(cipherLengths) {
  const map = new Map();
  for (let i = 0; i + WINDOW <= cipherLengths.length; i++) {
    for (let mask = 0; mask < 256; mask++) {
      let key = 0;
      let valid = true;
      for (let j = 0; j < WINDOW; j++) {
        const sourceLength = cipherLengths[i + j] + ((mask >>> j) & 1);
        if (sourceLength < 1 || sourceLength >= BASE) { valid = false; break; }
        key = key * BASE + sourceLength;
      }
      if (!valid) continue;
      const slots = map.get(key);
      if (slots) slots.push(i);
      else map.set(key, [i]);
    }
  }
  return map;
}

/** @param {number} cipherLength @param {number} sourceLength
 * @returns {boolean} */
function allowed(cipherLength, sourceLength) {
  return cipherLength === sourceLength || cipherLength === sourceLength - 1;
}

/** Hash-indexed exact-longest compatible substring. Original source order
 * and word count are fixed; there is no word insertion/deletion or shift.
 * @param {number[]} cipherLengths
 * @param {Map<number, number[]>} index
 * @param {{name:string,values:number[]}} source
 * @returns {{source:string,words:number,max:number,hits:number,at:{target:number,source:number,extra:number}|null}}
 */
function scan(cipherLengths, index, source) {
  const values = source.values;
  let key = 0, run = 0, max = 0, hits = 0, at = null;
  for (let k = 0; k < values.length; k++) {
    const v = values[k];
    if (v < 1 || v >= BASE) { key = 0; run = 0; continue; }
    key = (key % TAIL) * BASE + v;
    run++;
    if (run < WINDOW) continue;
    const starts = index.get(key);
    if (!starts) continue;
    for (const i0 of starts) {
      let i = i0, j = k - WINDOW + 1, length = WINDOW;
      while (i > 0 && j > 0 && allowed(cipherLengths[i - 1], values[j - 1])) {
        i--; j--; length++;
      }
      while (i + length < cipherLengths.length
        && j + length < values.length
        && allowed(cipherLengths[i + length], values[j + length])) length++;
      hits++;
      if (length > max) {
        max = length;
        let extra = 0;
        for (let u = 0; u < length; u++) extra += cipherLengths[i + u] - values[j + u];
        at = {target: i, source: j, extra};
      }
    }
  }
  return {source: source.name, words: values.length, max, hits, at};
}

/** Fixed seeded shuffle: conserves all 2,896 original word lengths.
 * @param {number[]} input @param {()=>number} rand @returns {number[]} */
function shuffled(input, rand) {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    const temp = out[i]; out[i] = out[j]; out[j] = temp;
  }
  return out;
}
let seed = 3301;
/** @returns {number} */
function random32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}

const start = Date.now();
const observed = sources.map((s) => scan(target, indexTargets(target), s));
assert.deepEqual(observed.map((o) => o.max), [14, 10, 16, 12]);
console.log('ORIGINAL ' + JSON.stringify(observed));

// Independent 42-word positive plant. Known source lengths are shortened by
// 0/1 using a frozen ~3/7 word deletion clock. No cipher is fitted.
const plant = target.slice();
const plantedSource = sources[3];
for (let i = 0; i < 42; i++) {
  plant[150 + i] = plantedSource.values[300 + i] - (((17 * i + 3) % 7) < 3 ? 1 : 0);
}
const planted = scan(plant, indexTargets(plant), plantedSource);
assert(planted.max >= 42);
assert(planted.at !== null && planted.at.target <= 150 && planted.at.source <= 300
  && planted.at.target + planted.max >= 192
  && planted.at.source + planted.max >= 342);
console.log('PLANT ' + JSON.stringify(planted));

// 32 whole-word-order nulls, tested against the unchanged historical sources.
// This is a descriptive conditional null, not a decryption significance claim.
const nullMaxima = [];
for (let trial = 0; trial < 32; trial++) {
  const control = shuffled(target, random32);
  const index = indexTargets(control);
  nullMaxima.push(sources.map((s) => scan(control, index, s).max));
}
const comparison = sources.map((s, i) => {
  const maxima = nullMaxima.map((row) => row[i]).sort((a, b) => a - b);
  return {
    source: s.name, observed: observed[i].max, median: maxima[16],
    min: maxima[0], max: maxima[31],
    atLeastObserved: maxima.filter((n) => n >= observed[i].max).length,
    trials: maxima.length,
  };
});
assert.deepEqual(comparison.map((o) => o.atLeastObserved), [13, 31, 11, 31]);
console.log('NULL ' + JSON.stringify(comparison));
console.log('PASS original unknown runes=12956, words=2896, per-word allowed deletions={0,1}, source-validated null-and-plant elapsed_ms='
  + (Date.now() - start));
