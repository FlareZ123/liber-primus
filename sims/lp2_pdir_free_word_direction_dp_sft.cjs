'use strict';

/**
 * Source-selected phi(prime) key, but with every printed word's traversal
 * direction latent. This tests whether the 2016 "numbers ... direction"
 * hint could point to an inferred wordwise key-direction sequence whose
 * rule is not among the 66 ciphertext-number rules of Issue #1329.
 *
 * Exact finite-state Viterbi over (29? no) all 464 historical prime-key
 * positions, granting every word a free +1 or -1 traversal and a freely
 * chosen original starting key position. Optimistically strong, since the
 * signs are allowed to depend on unknown plaintext without any rule.
 *
 * node sims/lp2_pdir_free_word_direction_dp_sft.cjs
 * Node 22 / CommonJS / read-only; original-input first chapter p0-p2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalText = read('resources/liber-primus/lp2-transcription.txt');
const runes = new Map(gp.runes.map((c, i) => [c, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const physical = originalText.split('%').map(s => s.replace(/\/\s*\n/g, '').replace(/\s+/g, ''));
assert.equal(physical.length, 57);
const opening = physical.slice(0, 3).join('');
/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  return (text.match(runePattern) || []).map(w => Array.from(w, c => {
    const i = runes.get(c);
    assert.notEqual(i, undefined);
    return i;
  }));
}
const words = runeWords(opening);
assert.equal(words.length, 158);
assert.equal(words.flat().length, 729);
assert.deepEqual(words.flat(), gp.pages.slice(0, 3).flatMap(p => p.indices));

const primeNumbers = [];
for (let x = 2; primeNumbers.length < 464; x++) {
  let prime = true;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
  if (prime) primeNumbers.push(x);
}
assert.equal(primeNumbers[463], 3301);
const KEY = primeNumbers.map(p => (p - 1) % 29);
const N = KEY.length;
/** @param {number} x @returns {number} */
const mod = x => ((x % N) + N) % N;
const tok = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/**
 * English -> GP source-calibrated spelling (ING, IO, V/U, Q/C).
 * @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const a = [];
  for (let j = 0; j < s.length;) {
    if (s.startsWith('ING', j)) { a.push(21); j += 3; continue; }
    if (s.startsWith('IO', j)) { a.push(27); j += 2; continue; }
    const t = tok.find(x => s.startsWith(x.s, j));
    if (!t) return [];
    a.push(t.i);
    j += t.s.length;
  }
  return a;
}
assert.equal(encode('FUNCTION').map(i => gp.runes[i]).join(''), 'ᚠᚢᚾᚳᛏᛡᚾ');

/** @param {number[]} a @returns {string} */
const spell = a => a.map(i => gp.translit[i]).join('');
const source = [
  read('resources/liber-primus/lp1-plaintext-reference.txt'),
  read('resources/external/2013-book-of-law-I.txt'),
  read('resources/external/2013-book-of-law-II.txt'),
  read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt'),
  read('resources/external/kjv-passion-gospels-2014.txt'),
];
const holdoutText = read('resources/external/2013-book-of-law-III.txt');
const native = [];
const dictionary = new Map();
for (const document of source) {
  for (const match of document.matchAll(/\b[A-Za-z]+\b/g)) {
    const w = encode(match[0]);
    if (!w.length || w.length > 15) continue;
    native.push(w);
    const key = w.join(',');
    dictionary.set(key, (dictionary.get(key) || 0) + 1);
  }
}
assert(native.length > 10000, 'native GP language reference');
const holdoutByLength = new Map();
for (const match of holdoutText.matchAll(/\b[A-Za-z]+\b/g)) {
  const w = encode(match[0]);
  if (!w.length || w.length > 15) continue;
  if (!holdoutByLength.has(w.length)) holdoutByLength.set(w.length, []);
  holdoutByLength.get(w.length).push({w, frequency:1});
}
const byLength = new Map();
for (const [key, frequency] of dictionary) {
  const w = key.split(',').map(Number);
  if (!byLength.has(w.length)) byLength.set(w.length, []);
  byLength.get(w.length).push({w, frequency});
}
const UNI = new Float64Array(29).fill(1);
const TRI = new Float64Array(30 * 30 * 29);
const CTX = new Float64Array(30 * 30);
for (const w of native) {
  let a = 29, b = 29;
  for (const c of w) {
    UNI[c]++;
    TRI[(a * 30 + b) * 29 + c]++;
    CTX[a * 30 + b]++;
    a = b; b = c;
  }
}
const total = UNI.reduce((a, b) => a + b, 0);
const logtri = new Float64Array(TRI.length);
for (let i = 0; i < 30 * 30; i++) {
  for (let c = 0; c < 29; c++) {
    const alpha = 8;
    logtri[i * 29 + c] = Math.log((TRI[i * 29 + c] + alpha * UNI[c] / total) /
      (CTX[i] + alpha));
  }
}
/** @param {number[]} w @returns {number} */
function languageScore(w) {
  let a = 29, b = 29, s = 0;
  for (const c of w) {
    s += logtri[(a * 30 + b) * 29 + c];
    a = b; b = c;
  }
  const count = dictionary.get(w.join(',')) || 0;
  if (count) s += Math.min(6, 2 + Math.log1p(count));
  return s;
}
/** @param {number[]} word @param {number} start @param {number} direction @param {number[]} key @returns {number[]} */
function decrypt(word, start, direction, key) {
  return word.map((c, j) => (c - key[mod(start + direction * j)] + 29) % 29);
}
/** @param {number[]} word @param {number} start @param {number} direction @param {number[]} key @returns {number[]} */
function encrypt(word, start, direction, key) {
  return word.map((c, j) => (c + key[mod(start + direction * j)]) % 29);
}

/**
 * Best over all 464 starts and every sign per word.
 * @param {number[][]} cipherWords
 * @param {number[]} key
 * @returns {{average:number,score:number,plaintext:number[][],states:{start:number,dir:number}[],seed:number}}
 */
function viterbi(cipherWords, key) {
  let dp = new Float64Array(N);
  /** @type {{prev:Int16Array, sign:Int8Array}[]} */
  const trace = [];
  for (const cw of cipherWords) {
    const next = new Float64Array(N).fill(-Infinity);
    const prev = new Int16Array(N).fill(-1);
    const sign = new Int8Array(N);
    for (let i = 0; i < N; i++) {
      for (const d of [-1, 1]) {
        const p = decrypt(cw, i, d, key);
        const pos = mod(i + d * cw.length);
        const candidate = dp[i] + languageScore(p);
        if (candidate > next[pos]) {
          next[pos] = candidate;
          prev[pos] = i;
          sign[pos] = d;
        }
      }
    }
    trace.push({prev, sign});
    dp = next;
  }
  let end = 0;
  for (let i = 1; i < N; i++) if (dp[i] > dp[end]) end = i;
  const score = dp[end];
  const plaintext = Array.from({length:cipherWords.length}, () => []);
  const states = Array.from({length:cipherWords.length}, () => ({start:0,dir:1}));
  for (let t = cipherWords.length - 1; t >= 0; t--) {
    const d = trace[t].sign[end];
    const start = trace[t].prev[end];
    assert(start >= 0 && (d === 1 || d === -1));
    plaintext[t] = decrypt(cipherWords[t], start, d, key);
    states[t] = {start, dir:d};
    end = start;
  }
  for (let i = 0; i < cipherWords.length; i++) {
    assert.deepEqual(encrypt(plaintext[i], states[i].start, states[i].dir, key), cipherWords[i]);
    if (i) assert.equal(states[i].start, mod(states[i-1].start + states[i-1].dir * plaintext[i-1].length));
  }
  return {average:score/cipherWords.flat().length,score,plaintext,states,seed:end};
}
/**
 * Native-English GP word-length-matched positive control:
 * controls use a deterministic plaintext-derived prime/nonprime
 * direction rule, while the decoder is given no knowledge of that rule.
 * @param {number[]} lengths
 * @returns {{cipher:number[][],plain:number[][],states:{start:number,dir:number}[]}}
 */
function positive(lengths, selection = byLength) {
  let position = 73;
  const cipher = [], plain = [], states = [];
  let direction = 1;
  for (let i = 0; i < lengths.length; i++) {
    const list = selection.get(lengths[i]) || byLength.get(lengths[i]);
    assert(list?.length > 0, 'native GP word coverage length ' + lengths[i]);
    const selected = list[(i * 17 + 5) % list.length].w;
    plain.push(selected);
    cipher.push(encrypt(selected, position, direction, KEY));
    states.push({start:position,dir:direction});
    position = mod(position + direction * lengths[i]);
    const sum = selected.reduce((x,y)=>x+gp.prime[y],0);
    let prime = sum > 1;
    for (let d = 2; d*d <= sum; d++) if (sum%d===0){prime=false;break;}
    direction = prime ? 1 : -1;
  }
  return {cipher,plain,states};
}
/** @param {number[][]} a @returns {number} */
function doublets(a) {
  const s = a.flat();
  let n = 0; for (let i=1;i<s.length;i++) if (s[i]===s[i-1]) n++;
  return n;
}
const plant = positive(words.map(w=>w.length));
const recovered = viterbi(plant.cipher, KEY);
const holdoutPlant = positive(words.map(w=>w.length), holdoutByLength);
const holdoutRecovered = viterbi(holdoutPlant.cipher, KEY);
const holdoutHits = holdoutRecovered.plaintext.reduce((a,w,i)=>a + Number(w.join(',') === holdoutPlant.plain[i].join(',')),0);
const hits = recovered.plaintext.reduce((a,w,i)=>a + Number(w.join(',') === plant.plain[i].join(',')),0);
const original = viterbi(words, KEY);
const percent = (n,den)=> (100*n/den).toFixed(2)+'%';
const sourceWordHits = original.plaintext.filter(w=>dictionary.has(w.join(','))).length;
console.log('SOURCE-PINNED INPUT 729 original runes / 158 words / N=464 phi(prime) key positions');
console.log('Native dictionary word tokens=' + native.length + ', distinct=' + dictionary.size);
console.log('Original doublets=' + doublets(words) + ', planted doublets=' + doublets(plant.cipher));
console.log('Planted free-direction DP average logscore=' + recovered.average.toFixed(6) +
  ', exact words=' + hits + '/158 (' + percent(hits,158) + ')');
console.log('Source-held-out BookIII DP average logscore=' + holdoutRecovered.average.toFixed(6) +
  ', exact words=' + holdoutHits + '/158 (' + percent(holdoutHits,158) + ')');
console.log('Original free-direction DP average logscore=' + original.average.toFixed(6) +
  ', exact native-dictionary hits=' + sourceWordHits + '/158, seed=' + original.seed);
console.log('Original top 70 decoded GP words:');
console.log(original.plaintext.slice(0,70).map(spell).join(' '));
console.log('Planted top 30 decoded GP words:');
console.log(recovered.plaintext.slice(0,30).map(spell).join(' '));
console.log('First original 40 latent directions: ' + original.states.slice(0,40).map(x=>x.dir>0?'+':'-').join(''));
console.log('Selftests: canonical original, 464-prime key, whole-word positive, inverse, trace all PASS');
if (hits < 70) throw new Error('Insufficient planted recovery: language model or architecture inadequate');
