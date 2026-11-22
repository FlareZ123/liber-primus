'use strict';

/**
 * p39 marked-rune, reversible GP29 word-reversal candidate.
 * Windows 11 / Node.js 22 single-file test; no network/file writes.
 * Every candidate is applied to untouched original p40-53 black ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const rune = new Map(gp.runes.map((r, i) => [r, i]));
const mod = n => ((n % 29) + 29) % 29;
const source = [];
let word = [];
let pages = [];
const chunks = read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0, 55);
for (let i = 0; i < 55; i++) {
  for (const ch of chunks[i].replace(/[\/\s]/g, '')) {
    if (rune.has(ch)) {
      word.push(rune.get(ch));
      pages.push(i < 50 ? i : i + 1);
    } else if (word.length) {
      source.push({word, page: pages[0]});
      word = [];
      pages = [];
    }
  }
}
if (word.length) source.push({word, page: pages[0]});
assert.equal(source.length, 2896);
assert.deepEqual(source.flatMap(x => x.word),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

const red = gp.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
assert.equal(mod(red[0] * red[1] * red[2]), 24);
assert.equal(mod(red.reduce((a, b) => a + b, 0)), 18);
assert.equal(mod(red.reduce((a, b) => a + gp.prime[b], 0)), 28);
const selected = source.filter(x => x.page >= 40 && x.page <= 53);
assert.equal(selected.length, 669);
assert.deepEqual(selected.slice(0, 2).map(x => x.word.length), [3, 5]);
const iv = selected[1].word.at(-1);
assert.equal(iv, 8);
const body = selected.slice(2).map(x => x.word);
assert.equal(body.length, 667);
assert.equal(body.flat().length, 3000);

const pow = Array.from({length: 28}, (_, i) => {
  let v = 1;
  for (let j = 0; j < i; j++) v = mod(v * 15);
  return v;
});
assert.equal(new Set(pow).size, 28);

/**
 * @param {number} previous
 * @param {number[]} publishedWord
 * @param {number} index
 * @param {number} firstMarker
 * @param {number} innerMarker
 * @returns {number[]}
 */
function permutation(previous, publishedWord, index, firstMarker, innerMarker) {
  const outputs = Array.from({length: 29},
    (_, p) => p === 28 ? previous : mod(previous + pow[p]));
  /** @param {number} plain @param {number} visible */
  const assign = (plain, visible) => {
    const displaced = outputs.indexOf(visible);
    assert(displaced >= 0);
    [outputs[plain], outputs[displaced]] = [outputs[displaced], outputs[plain]];
  };
  assign(index === 0 ? firstMarker : innerMarker, previous);
  if (index >= 6) {
    const echo = mod(red[0] * publishedWord[index - 6] + mod(red[0]*red[1]*red[2]));
    if (echo !== previous) assign(red[2], echo);
  }
  assert.equal(new Set(outputs).size, 29);
  return outputs;
}

/**
 * @param {number[][]} ciphertext
 * @param {number} initial
 * @param {number} firstMarker
 * @param {number} innerMarker
 * @returns {number[][]}
 */
function decrypt(ciphertext, initial, firstMarker, innerMarker) {
  let previous = initial;
  return ciphertext.map(word => {
    const decoded = [];
    for (let i = 0; i < word.length; i++) {
      const outputs = permutation(previous, word, i, firstMarker, innerMarker);
      const plain = outputs.indexOf(word[i]);
      assert(plain >= 0);
      decoded.push(plain);
      previous = word[i];
    }
    return decoded;
  });
}

/**
 * @param {number[][]} plaintext
 * @param {number} initial
 * @param {number} firstMarker
 * @param {number} innerMarker
 * @returns {number[][]}
 */
function encrypt(plaintext, initial, firstMarker, innerMarker) {
  let previous = initial;
  return plaintext.map(word => {
    const published = [];
    for (let i = 0; i < word.length; i++) {
      const outputs = permutation(previous, published, i, firstMarker, innerMarker);
      const current = outputs[word[i]];
      published.push(current);
      previous = current;
    }
    return published;
  });
}
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word */
function nativeGP(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const values = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { values.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { values.push(27); i += 2; }
    else {
      const found = tokens.find(t => s.startsWith(t.s, i));
      assert(found);
      values.push(found.i);
      i += found.s.length;
    }
  }
  return values;
}
const lex = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!m) continue;
  const key = nativeGP(m[1]).join(',');
  const old = lex.get(key);
  if (!old || Number(m[2]) > old.freq) lex.set(key, {word: m[1], freq: +m[2]});
}
const bins = new Map();
for (const roman of read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g) || []) {
  const x = nativeGP(roman);
  if (!bins.has(x.length)) bins.set(x.length, []);
  bins.get(x.length).push(x);
}
let seed = 0x33013301;
const rand = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
};
const plantedEnglish = body.map(w => {
  const options = bins.get(w.length);
  assert(options?.length > 0);
  return options[rand() % options.length];
});
const plantCipherInput = plantedEnglish.map(w => w.slice().reverse());
const variants = [];
for (const firstMarker of [10, 5]) {
  for (const innerMarker of [27, 28]) {
    const cipher = encrypt(plantCipherInput, iv, firstMarker, innerMarker);
    assert.deepEqual(decrypt(cipher, iv, firstMarker, innerMarker), plantCipherInput);
    const out = decrypt(body, iv, firstMarker, innerMarker)
      .map(w => w.slice().reverse());
    assert.deepEqual(encrypt(out.map(w => w.slice().reverse()), iv, firstMarker, innerMarker), body);
    let exact = 0, long = 0, score = 0, maxLength = 0;
    for (const w of out) {
      const match = lex.get(w.join(','));
      if (match) {
        exact++;
        if (w.length >= 6) long++;
        maxLength = Math.max(maxLength, w.length);
        score += Math.log1p(match.freq);
      }
    }
    assert.equal(long, 0);
    variants.push({firstMarker: gp.translit[firstMarker],
      innerMarker: gp.translit[innerMarker], exact, long,
      maxLength, score: +score.toFixed(3),
      firstWords: out.slice(0, 12).map(w => w.map(i => gp.translit[i]).join(' '))});
  }
}
console.log(JSON.stringify({red, product: 24, indexSum: 18, primeSum: 28,
  originalWords: body.length, originalRunes: body.flat().length,
  exactPositiveRoundTrips: 4, variants}, null, 2));
console.log('PASS: p39-triad word-reversal permutation is reversible; fixed source choices fail original native English.');
