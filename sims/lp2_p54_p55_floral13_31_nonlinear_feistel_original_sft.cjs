'use strict';
/**
 * LP2 original p54→p55 43+43 source-tape Feistel receiver.
 *
 * Fresh physical operand is p54 last ten runes + p55 33 word exteriors
 * paired with p55 43 strict word interiors. The repeated source floral
 * left five-dot mask 01101=13 and right mask 11111=31 supply the two
 * round exponents of a finite-field triangular/Feistel operation.
 *
 * Original-ink evidence does NOT authenticate modular exponentiation or
 * Feistel, so this tests one exact source-readable nonlinear candidate,
 * not a family fit and not a discovered cipher.
 *
 * Windows 11: node sims/lp2_p54_p55_floral13_31_nonlinear_feistel_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt').split('%');
const runeMap = new Map(c.runes.map((s, i) => [s, i]));
const words = p => transcript[p < 50 ? p : p - 1]
  .split(/[-.]/).map(chunk => Array.from(chunk, ch => runeMap.get(ch))
    .filter(x => x !== undefined)).filter(w => w.length);
for (const p of [54, 55]) assert.deepEqual(words(p).flat(), c.pages[p].indices);

const p54Tail = words(54).at(-1);
const p55Words = words(55);
const widths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.deepEqual(p55Words.map(w => w.length), widths);
assert.equal(p54Tail.length, 10);
assert.deepEqual(p54Tail, c.pages[54].indices.slice(-10));
const p55 = c.pages[55].indices;
assert.equal(p55.length, 76);
const innerSites = [], outerSites = [];
let position = 0;
for (const word of p55Words) {
  for (let j = 0; j < word.length; j++) {
    (j > 0 && j + 1 < word.length ? innerSites : outerSites).push(position + j);
  }
  position += word.length;
}
assert.equal(position, 76);
assert.equal(innerSites.length, 43);
assert.equal(outerSites.length, 33);
const physical = [...p54Tail, ...p55];
assert.equal(physical.length, 86);
assert.deepEqual([physical[9], physical[10]], [26, 21]); // authentic Y|NG word carry
/** @param {number[]} full */
function separate(full) {
  assert.equal(full.length, 86);
  return {
    a: innerSites.map(i => full[10 + i]),
    b: full.slice(0, 10).concat(outerSites.map(i => full[10 + i]))
  };
}
/** @param {number[]} a @param {number[]} b */
function combine(a, b) {
  assert.equal(a.length, 43);
  assert.equal(b.length, 43);
  const out = Array(86).fill(-1);
  for (let i = 0; i < 10; i++) out[i] = b[i];
  for (let i = 0; i < 33; i++) out[10 + outerSites[i]] = b[10 + i];
  for (let i = 0; i < 43; i++) out[10 + innerSites[i]] = a[i];
  assert.ok(out.every(x => x >= 0 && x < 29));
  return out;
}
assert.deepEqual(combine(...Object.values(separate(physical))), physical);
const mod = value => ((value % 29) + 29) % 29;
/** @param {number} value @param {number} e */
function pow(value, e) {
  let result = 1;
  for (let i = 0; i < e; i++) result = result * value % 29;
  return result;
}
assert.equal(pow(2, 13), 14);
assert.equal(pow(2, 31), pow(2, 3));

/**
 * A 2-round keyed Feistel-type triangular bijection on GP29 pairs.
 * Using left=13 and right=31 from 5-bit floral masks, and only addition
 * modulo29 to couple the two streams. Forward A'=A+B^13, B'=B+(A')^31.
 * Inverse B=B'-(A')^31, A=A'-B^13. Plaintext pairing can reverse B to
 * mirror the original moth's wings.
 *
 * @param {number[]} full Complete 86 original-order symbols
 * @param {boolean} mirror Reverse outer B's pair correspondence
 * @param {boolean} decrypt Interpret input as encoded and invert
 * @returns {number[]}
 */
function transform(full, mirror, decrypt) {
  const { a, b } = separate(full);
  const partner = mirror ? b.slice().reverse() : b;
  const aa = [], bb = [];
  for (let i = 0; i < 43; i++) {
    if (!decrypt) {
      const x = mod(a[i] + pow(partner[i], 13));
      aa.push(x);
      bb.push(mod(partner[i] + pow(x, 31)));
    } else {
      const y = mod(partner[i] - pow(a[i], 31));
      aa.push(mod(a[i] - pow(y, 13)));
      bb.push(y);
    }
  }
  return combine(aa, mirror ? bb.reverse() : bb);
}
function ioc(seq) {
  const count = Array(29).fill(0);
  for (const s of seq) count[s]++;
  return count.reduce((sum, v) => sum + v * (v - 1), 0) / (seq.length * (seq.length - 1));
}
function asGP(seq) { return seq.map(i => c.translit[i]).join(''); }
const word13Offset = 10 + 23;
assert.equal(p55Words[7].length, 13);

/** Exact native GP vocabulary from independent source corpora, as in #2229. */
const translit = c.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function encodeGP(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; continue; }
    if (s.startsWith('IO', i)) { out.push(27); i += 2; continue; }
    const t = translit.find(token => s.startsWith(token.s, i));
    assert.ok(t, 'Source token must map to GP29');
    out.push(t.i);
    i += t.s.length;
  }
  return out;
}
const refs = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/english_wordfreq_textblob.txt'
];
const lex = new Map();
for (const file of refs) {
  for (const word of (read(file).match(/[A-Za-z]+/g) || [])) {
    const key = encodeGP(word);
    if (key.length === 13 && !lex.has(key.join(','))) lex.set(key.join(','), word);
  }
}
assert.equal(lex.size, 422);
assert.equal(encodeGP('CIRCUMSTANCES').length, 13);

const results = [];
for (const mirror of [false, true]) {
  for (const decrypt of [true, false]) {
    const decoded = transform(physical, mirror, decrypt);
    assert.deepEqual(transform(decoded, mirror, !decrypt), physical);
    const gpWord = decoded.slice(word13Offset, word13Offset + 13);
    const wholeWords = p55Words.map((w, j) => {
      const before = p55Words.slice(0, j).reduce((n, v) => n + v.length, 0);
      return asGP(decoded.slice(10 + before, 10 + before + w.length));
    });
    const entry = {
      mirror, operation: decrypt ? 'Feistel inverse' : 'Feistel forward',
      sourceExponents: [13,31], whole86IoC: ioc(decoded),
      p55IoC: ioc(decoded.slice(10)), 
      original13WordGP: gpWord.join(','),
      original13WordTranslit: asGP(gpWord),
      exactNative13LexiconMatch: lex.get(gpWord.join(',')) || null,
      preservedPrintedP55Words: wholeWords
    };
    results.push(entry);
    console.log(JSON.stringify(entry));
  }
}
assert.equal(results.length, 4);
assert.ok(results.every(x => !x.exactNative13LexiconMatch));

// Positive input: original native solved p57 86-rune register with one
// independently sourced valid 13-symbol English word at the original p55 slot.
const clear = [...c.pages[57].indices.slice(0, 86)];
clear.splice(word13Offset, 13, ...encodeGP('CIRCUMSTANCES'));
assert.equal(clear.length, 86);
assert.equal(lex.get(clear.slice(word13Offset, word13Offset + 13).join(',')), 'circumstances');
for (const mirror of [false, true]) {
  const encrypt = transform(clear, mirror, false);
  assert.deepEqual(transform(encrypt, mirror, true), clear);
  const wrong = transform(encrypt, !mirror, true);
  assert.notDeepEqual(wrong, clear);
  assert.equal(asGP(clear.slice(word13Offset, word13Offset + 13)), 'CIRCUMSTANCES');
}
console.log(JSON.stringify({
  result: 'PASS: source 43+43 nonlinear floral13/31 full original negative',
  originalInputRunes: 86, originalPage55Runes: 76, nativeGPPositivesRecovered: '2 x 86/86',
  original13DictionarySize: lex.size, original13DictionaryHits: 0,
  decoderSourceSelectedByAuthor: false, originalPlaintextRecovered: 0
}));
