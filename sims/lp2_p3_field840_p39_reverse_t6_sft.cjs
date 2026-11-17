'use strict';

/**
 * Source-p3 primitive GF29² 840-phase clock composed with the source-p39
 * lossless word-reversed six-back echo cipher. Original p40-53 black text.
 * Windows 11 / Node.js 22: node sims/lp2_p3_field840_p39_reverse_t6_sft.cjs
 *
 * Read-only original-cipher inverse. Success requires actual long connected
 * GP-native plaintext, not isolated dictionary words from 3360 guesses.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const m29 = x => ((x % 29) + 29) % 29;
const m28 = x => ((x % 28) + 28) % 28;
const map = new Map(gp.runes.map((r, i) => [r, i]));
const words = [];
let current = [], page = [];
for (let physical = 0; physical < 55; physical++) {
  const part = read('resources/liber-primus/lp2-transcription.txt').split('%')[physical];
  for (const c of part.replace(/[\/\s]/g, '')) {
    if (map.has(c)) {
      current.push(map.get(c));
      page.push(physical < 50 ? physical : physical + 1);
    } else if (current.length) {
      words.push({symbols: current, page: page[0]});
      current = []; page = [];
    }
  }
}
if (current.length) words.push({symbols: current, page: page[0]});
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(w => w.symbols),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.deepEqual(gp.pages.find(p => p.page === 3).indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(gp.pages.find(p => p.page === 39).indices.slice(119, 122), [27, 5, 15]);
const p40 = gp.pages.find(p => p.page === 40).indices.slice(0, 8);
assert.deepEqual(p40, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.equal(p40.reduce((a, i) => a + gp.prime[i], 0), 435);
assert.equal(435 / 29, 15);
const selected = words.filter(w => w.page >= 40 && w.page <= 53);
assert.equal(selected.length, 669);
const iv = p40.at(-1);
const ciphertext = selected.slice(2).map(w => w.symbols);
assert.equal(ciphertext.length, 667);
assert.equal(ciphertext.flat().length, 3000);

// Root u of original p3 red polynomial 13+23u+2u²=0.
// This yields u²=3u+8 and multiplicative order 840=29²-1.
function multiply([a, b], [c, d]) {
  return [m29(a * c + 8 * b * d), m29(a * d + b * c + 3 * b * d)];
}
const trace = [];
let point = [1, 0];
for (let phase = 0; phase < 840; phase++) {
  trace.push(m29(2 * point[0] + 3 * point[1]));
  point = multiply(point, [0, 1]);
  if (phase < 839) assert.notDeepEqual(point, [1, 0]);
}
assert.deepEqual(point, [1, 0]);
assert.equal(new Set(trace).size, 29);
const g15 = [1];
for (let i = 1; i < 28; i++) g15.push(m29(g15.at(-1) * 15));
assert.equal(new Set(g15).size, 28);
const log = Array(29).fill(-1);
for (let i = 0; i < 28; i++) log[g15[i]] = i;

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} roman @returns {number[]} */
function encodeEnglish(roman) {
  const s = roman.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(x => s.startsWith(x.s, i));
      assert(t);
      out.push(t.i); i += t.s.length;
    }
  }
  return out;
}
const dictionary = new Set();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (m) dictionary.add(encodeEnglish(m[1]).join(','));
}
/** @param {number} phase @param {number} first @param {number} inside */
function decrypt(phase, first, inside) {
  let last = iv, position = 0;
  const result = [];
  for (const word of ciphertext) {
    const decoded = [];
    for (let j = 0; j < word.length; j++) {
      const cur = word[j], step = m29(cur - last);
      const key = trace[(phase + position) % 840] % 28;
      const reserved = j === 0 ? first : inside;
      const inverse = delta => {
        const p = delta === 0 ? 28 : m28(log[delta] - key);
        return p === 28 ? reserved : p === reserved ? 28 : p;
      };
      let plain = inverse(step);
      if (j >= 6) {
        const target = m29(27 * word[j - 6] + 24), diff = m29(target - last);
        if (diff !== 0) {
          const displaced = inverse(diff);
          if (step === diff) plain = 15;
          else if (plain === 15) plain = displaced;
        }
      }
      decoded.push(plain);
      last = cur;
      position++;
    }
    result.push(decoded);
  }
  return result;
}
/** @param {number[][]} original @param {number} phase
 * @param {number} first @param {number} inside */
function encrypt(original, phase, first, inside) {
  let last = iv, position = 0;
  const out = [];
  for (const word of original) {
    const published = [];
    for (let j = 0; j < word.length; j++) {
      const key = trace[(phase + position) % 840] % 28;
      const m = Array.from({length: 29},
        (_, p) => p === 28 ? last : m29(last + g15[(p + key) % 28]));
      const assign = (plain, target) => {
        const q = m.indexOf(target); assert(q >= 0);
        [m[plain], m[q]] = [m[q], m[plain]];
      };
      assign(j === 0 ? first : inside, last);
      if (j >= 6) {
        const target = m29(27 * published[j - 6] + 24);
        if (target !== last) assign(15, target);
      }
      const c = m[word[j]];
      published.push(c);
      last = c; position++;
    }
    out.push(published);
  }
  return out;
}
const variants = [];
for (const [first, inside] of [[10, 27], [10, 28], [5, 27], [5, 28]]) {
  let maximumMatched = 0, maximumLong = 0, keysWithLong = 0;
  const top = [];
  for (let phase = 0; phase < 840; phase++) {
    const decoded = decrypt(phase, first, inside).map(w => w.slice().reverse());
    let matched = 0, long = 0;
    const longWords = [];
    for (let i = 0; i < decoded.length; i++) {
      if (dictionary.has(decoded[i].join(','))) {
        matched++;
        if (decoded[i].length >= 6) {
          long++;
          longWords.push({i, value: decoded[i].map(v => gp.translit[v]).join('')});
        }
      }
    }
    maximumMatched = Math.max(maximumMatched, matched);
    maximumLong = Math.max(maximumLong, long);
    if (long > 0) { keysWithLong++; top.push({phase, matched, longWords}); }
  }
  assert.equal(maximumLong, 1);
  assert.equal(keysWithLong, 2);
  assert.deepEqual(top.map(x => x.phase), [94, 495]);
  assert.deepEqual(top[0].longWords.map(x => x.value), ['GOITRE']);
  assert.deepEqual(top[1].longWords.map(x => x.value), ['SPICES']);
  assert.deepEqual(decrypt(94, first, inside),
    decrypt(94, first, inside));
  assert.deepEqual(encrypt(decrypt(94, first, inside), 94, first, inside), ciphertext);
  variants.push({first: gp.translit[first], inside: gp.translit[inside],
    seeds: 840, maximumMatched, maximumLong, keysWithLong, top});
}
console.log(JSON.stringify({
  sourceP3: [13, 23, 2], sourceP39: [27, 5, 15],
  sourceP40PrimeSum: 435, primitiveFieldOrder: 840,
  originalRunes: 3000, originalWords: 667,
  sourceSelectedClock: 'Trace(u^(phase+i))',
  variants
}, null, 2));
console.log('PASS: all 3360 original GP29 inverses fail to form connected GP-English, with exact forward replay of original.');
