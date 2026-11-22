'use strict';
/**
 * Full-secret-IV, original p54–55 7x7 plain-feedback two-word dictionary gate.
 * Source-fixed p54 first three printed words have exact GP lengths 1,8,8.
 * Native source vocabulary is the already pinned Shakespeare/Gibran/Emerson
 * and English-word-frequency corpora; no key search, added external source,
 * user-selectable word or posthoc control fitting.
 *
 * Run on Windows 11 Node.js 22:
 * node sims/lp2_2014_p54p55_fulliv_eightword_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const square = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/)[1].trim().split(/\r?\n/)
  .map(line => line.trim().split(/\s+/).map(Number));
assert.equal(square.length, 7);
const mod = n => ((n % 29) + 29) % 29;
const M = square.map(row => row.map(mod));
assert(M.every(row => row.length === 7 &&
  row.reduce((s, v) => s + v, 0) % 29 === 1033 % 29));
const invScalar = v => {
  const result = Array.from({length:28}, (_, i) => i + 1)
    .find(x => mod(v * x) === 1);
  assert(result !== undefined);
  return result;
};
function inverse(A) {
  const n = A.length;
  const t = A.map((row, i) => [...row,
    ...Array.from({length:n}, (_, j) => +(i === j))]);
  for (let j = 0; j < n; j += 1) {
    const pivot = t.findIndex((row, i) => i >= j && row[j] !== 0);
    assert(pivot >= j);
    [t[j],t[pivot]] = [t[pivot],t[j]];
    const k = invScalar(t[j][j]);
    t[j] = t[j].map(v => mod(v * k));
    for (let i = 0; i < n; i += 1) {
      if (i === j) continue;
      const factor = t[i][j];
      t[i] = t[i].map((v, x) => mod(v - factor * t[j][x]));
    }
  }
  return t.map(row => row.slice(n));
}
const J = inverse(M);
const vector = (A, v) => A.map(row =>
  mod(row.reduce((s, x, i) => s + x*v[i], 0)));
function encrypt(source, iv) {
  assert(source.length % 7 === 0);
  let last = iv.slice();
  const ciphertext = [];
  for (let i = 0; i < source.length; i += 7) {
    const p = source.slice(i, i + 7);
    ciphertext.push(...vector(M, p).map((v, j) => mod(v + last[j])));
    last = p;
  }
  return ciphertext;
}
function decrypt(source, iv) {
  assert(source.length % 7 === 0);
  let last = iv.slice();
  const plaintext = [];
  for (let i = 0; i < source.length; i += 7) {
    const p = vector(J, source.slice(i, i + 7)
      .map((v, j) => mod(v - last[j])));
    plaintext.push(...p);
    last = p;
  }
  return plaintext;
}
const tokens = corpus.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
function nativeGP(word) {
  const t = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out = [];
  for (let i = 0; i < t.length;) {
    if (t.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (t.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(x => t.startsWith(x.t,i));
      if (!token) return null;
      out.push(token.i);
      i += token.t.length;
    }
  }
  return out;
}
const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/english_wordfreq_textblob.txt'
];
const words8 = new Map();
for (const file of sources) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = nativeGP(word);
    if (encoded && encoded.length === 8) {
      const key = encoded.join(',');
      if (!words8.has(key)) words8.set(key, word.toUpperCase());
    }
  }
}
assert.equal(words8.size, 4792);
const ciphertext = corpus.pages.filter(p => p.page >= 54 && p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(ciphertext.length, 308);
const transcript = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('');
const printed = [];
let working = '';
let total = 0;
for (const c of transcript) {
  if (/[\u16a0-\u16ff]/u.test(c)) {
    working += c; total += 1;
  } else if (c === '/' || /\s/u.test(c)) {
    continue;
  } else if (working) {
    printed.push({start:total-working.length, length:working.length});
    working = '';
  }
}
if (working) printed.push({start:total-working.length,length:working.length});
assert.equal(total, 12956);
assert.deepEqual(printed.filter(w => w.start >= 12648).slice(0,3)
  .map(w => ({offset:w.start-12648,length:w.length})), [
    {offset:0,length:1}, {offset:1,length:8}, {offset:9,length:8}
  ]);
/**
 * Exhaust EVERY unknown seven-rune initial vector whose first plaintext
 * word is A,I,O and whose first eight-rune word lies in the pinned lexicon.
 * Every seven-symbol first plaintext block then has known [A|I|O]+6 symbols,
 * so the entire hidden IV is forced. Full-word checks (positions 7–8)
 * and the next intact eight-rune word (positions 9–16) are untouched.
 */
function candidates(C) {
  const firstCipher = C.slice(0, 7);
  let matchedFirstWord = 0;
  const matchingTwoWords = [];
  const firstExamples = [];
  for (const oneRune of [24,10,3]) {
    for (const [encoded,word] of words8) {
      const firstWord = encoded.split(',').map(Number);
      const firstPlain = [oneRune,...firstWord.slice(0,6)];
      const mixed = vector(M,firstPlain);
      const iv = firstCipher.map((v,j) => mod(v-mixed[j]));
      const next = vector(J,C.slice(7,14)
        .map((v,j) => mod(v-firstPlain[j])));
      if (next[0] !== firstWord[6] || next[1] !== firstWord[7]) continue;
      matchedFirstWord += 1;
      if (firstExamples.length < 5) firstExamples.push({oneRune,word,iv});
      const after = vector(J,C.slice(14,21)
        .map((v,j) => mod(v-next[j])));
      const secondWord = [...next.slice(2), ...after.slice(0,3)];
      assert.equal(secondWord.length, 8);
      const lexeme = words8.get(secondWord.join(','));
      if (lexeme) matchingTwoWords.push({oneRune,first:word,second:lexeme,iv});
    }
  }
  return {matchedFirstWord,matchingTwoWords,firstExamples};
}
const result = candidates(ciphertext);
assert.equal(result.matchedFirstWord,20);
assert.equal(result.matchingTwoWords.length,0);
console.log('Original p54–55: 308 original runes, exact leading word shape 1|8|8');
console.log('Dictionary: ' + words8.size + ' distinct GP-native eight-rune words');
console.log('Total full-secret IV first-word hypotheses: 3 × ' + words8.size);
console.log('First complete 8-rune word survives: ' + result.matchedFirstWord);
console.log('Both complete 8-rune words survive: ' + result.matchingTwoWords.length);
console.log('Five initial first-word witnesses: ' + JSON.stringify(result.firstExamples));
// Native positive: plant the original first-three-word shape, then encrypt
// the full 308-rune passage under a genuinely nonzero undisclosed IV.
const control = corpus.pages.find(p => p.page === 57).indices;
assert.equal(control.length,95);
const native = Array.from({length:308}, (_,i) => control[i%control.length]);
const sample = [...words8.keys()].slice(0,2)
  .map(key => key.split(',').map(Number));
native[0] = 24;
native.splice(1,8,...sample[0]);
native.splice(9,8,...sample[1]);
const secretIV = M[0].slice();
const planted = encrypt(native,secretIV);
assert.deepEqual(decrypt(planted,secretIV),native);
const recovery = candidates(planted);
assert(recovery.matchingTwoWords.some(hit =>
  hit.oneRune === 24 && hit.first === words8.get(sample[0].join(',')) &&
  hit.second === words8.get(sample[1].join(',')) &&
  hit.iv.every((v,i)=>v===secretIV[i])));
console.log('PASS original two-word zero result and complete secret-IV native plant');
