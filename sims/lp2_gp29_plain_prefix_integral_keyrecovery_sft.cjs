'use strict';

/**
 * Recover a book-shared two-parameter cumulative Gematria cipher from actual
 * LP2 word ciphertexts, even with an arbitrary private additive key per word.
 *
 *   C[w,j] = a P[w,j] + b * sum_{t<j} F(P[w,t]) + k[w] (mod 29).
 *
 * Two independent source-defined accumulators are charged: F(P)=GP ordinal
 * and F(P)=published GP prime. Both are reversible when a is nonzero.
 * The first rune is included; all 56 unresolved physical pages are screened.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_gp29_plain_prefix_integral_keyrecovery_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const spellings = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const mod = (x) => ((x % 29) + 29) % 29;
const inv = Array.from({length:29}, (_, n) => {
  if (n === 0) return 0;
  for (let k = 1; k < 29; k++) if ((n*k)%29 === 1) return k;
  throw Error('nonzero GF29 element has no inverse');
});

/** @returns {number[][]} */
function originalWords() {
  const words = [];
  let word = [];
  for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
    const v = runeMap.get(ch);
    if (v !== undefined) word.push(v);
    else if ("-.'".includes(ch) && word.length) {
      words.push(word);
      word = [];
    }
  }
  // The transcription additionally contains solved p56 and clear p57.
  const unresolved = words.slice(0, 2896);
  assert.equal(unresolved.length, 2896);
  assert.deepStrictEqual(unresolved.flat(), corpus.pages.slice(0, 56)
    .flatMap((page) => page.indices));
  assert.equal(unresolved.flat().length, 12956);
  return unresolved;
}

/**
 * @param {string} latin
 * @returns {number[]}
 */
function gpWord(latin) {
  const s = latin.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('Z', 'S')
    .replaceAll('ING', 'NG').replaceAll('IO', 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = spellings.find((candidate) => s.startsWith(candidate.token, i));
    assert.ok(t, 'cannot encode source word '+latin);
    out.push(t.index);
    i += t.token.length;
  }
  return out;
}

/** @returns {Map<number,{p:number[],latin:string}[]>} */
function dictionary() {
  const unique = new Map();
  for (const file of [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'
  ]) {
    for (const latin of read(file).match(/[A-Za-z]+/g) || []) {
      const p = gpWord(latin);
      if (p.length < 5 || p.length > 14) continue;
      const key = p.join(',');
      if (!unique.has(key)) unique.set(key, {latin:latin.toUpperCase(), p});
    }
  }
  assert.equal(unique.size, 10433);
  const byLength = new Map();
  for (const donor of unique.values()) {
    const len = donor.p.length;
    if (!byLength.has(len)) byLength.set(len, []);
    byLength.get(len).push(donor);
  }
  return byLength;
}

/**
 * Fixed plaintext structural coefficients for a potential English donor.
 * Select the earliest linearly independent two equations, without ciphertext.
 * @param {{p:number[],latin:string}} donor
 * @param {boolean} primes
 * @returns {object|null}
 */
function prepare(donor, primes) {
  const p = donor.p, prefix = Array(p.length).fill(0);
  for (let j = 1; j < p.length; j++) {
    prefix[j] = mod(prefix[j-1] +
      (primes ? corpus.prime[p[j-1]] : p[j-1]));
  }
  for (let i = 1; i < p.length; i++) {
    for (let j = i+1; j < p.length; j++) {
      const xi = mod(p[i]-p[0]), xj = mod(p[j]-p[0]);
      const det = mod(xi*prefix[j]-xj*prefix[i]);
      if (det) return {p, prefix, xi, xj, i, j, invDet: inv[det],
        latin: donor.latin};
    }
  }
  return null;
}

/**
 * Recover the unique coefficient pair and private word key, if one exists.
 * @param {number[]} c
 * @param {ReturnType<prepare>} q
 * @returns {{a:number,b:number,k:number}|null}
 */
function recover(c, q) {
  const di = mod(c[q.i]-c[0]), dj = mod(c[q.j]-c[0]);
  const a = mod((di*q.prefix[q.j]-dj*q.prefix[q.i])*q.invDet);
  if (!a) return null;
  const b = mod((q.xi*dj-q.xj*di)*q.invDet);
  const k = mod(c[0]-a*q.p[0]);
  for (let j = 1; j < c.length; j++) {
    if (mod(a*q.p[j]+b*q.prefix[j]+k) !== c[j]) return null;
  }
  return {a,b,k};
}

/**
 * @param {number[][]} words
 * @param {Map<number,object[]>} donors
 */
function screen(words, donors) {
  const pairCount = new Uint16Array(29*29);
  const tripleCount = new Uint16Array(29*29*29);
  let tested = 0, matched = 0, matchedWords = 0;
  const examples = new Map();
  for (let i = 0; i < words.length; i++) {
    const c = words[i];
    if (c.length < 5) continue;
    const wordPairs = new Set(), wordTriples = new Set();
    for (const donor of donors.get(c.length) || []) {
      tested++;
      const key = recover(c, donor);
      if (!key) continue;
      matched++;
      const pair = key.a*29+key.b, triple = pair*29+key.k;
      wordPairs.add(pair);
      wordTriples.add(triple);
      const hits = examples.get(pair) || [];
      if (hits.length < 6) {
        hits.push({originalWord:i+1, donor:donor.latin});
        examples.set(pair, hits);
      }
    }
    if (wordPairs.size) matchedWords++;
    for (const id of wordPairs) pairCount[id]++;
    for (const id of wordTriples) tripleCount[id]++;
  }
  const topPairs = Array.from(pairCount, (count, id) => ({
    count, a: Math.floor(id/29), b:id%29,
    examples:examples.get(id) || []
  })).sort((a,b) => b.count-a.count).slice(0, 5);
  const topTriples = Array.from(tripleCount, (count, id) => ({
    count, a:Math.floor(id/841), b:Math.floor(id/29)%29, k:id%29
  })).sort((a,b) => b.count-a.count).slice(0, 5);
  return {tested,matched,matchedWords,topPairs,topTriples};
}

/**
 * A genuine encoded-book positive with unchanged original word shapes,
 * and a shared (a,b,k)=(3,14,9) for every eligible word.
 * @param {number[][]} words
 * @param {Map<number,{p:number[],latin:string}[]>} dictionaryWords
 * @param {boolean} primes
 * @returns {{encrypted:number[][],total:number}}
 */
function positive(words, dictionaryWords, primes) {
  let count = 0;
  const encrypted = words.map((word) => {
    if (word.length < 5) return word.slice();
    const donors = dictionaryWords.get(word.length);
    const p = donors[count++ % donors.length].p;
    const out = [], a=3, b=14, k=9;
    let sum = 0;
    for (const v of p) {
      out.push(mod(a*v+b*sum+k));
      sum = mod(sum+(primes ? corpus.prime[v] : v));
    }
    return out;
  });
  return {encrypted, total:count};
}

const original = originalWords();
const lexicon = dictionary();
const output = {model:'C[w,j]=a*P[w,j]+b*prefixGematria(P[w,<j])+k[w] (mod29)',
  originalWords:original.length, results:{}};
for (const [label, primes] of [['GP ordinal',false],['GP prime',true]]) {
  const donorData = new Map();
  for (const [length, donors] of lexicon) {
    donorData.set(length, donors.map((d) => prepare(d, primes)).filter(Boolean));
  }
  const actual = screen(original, donorData);
  const plant = positive(original, lexicon, primes);
  const recovery = screen(plant.encrypted, donorData);
  assert.equal(plant.total, 1132);
  assert.equal(recovery.topPairs[0].count, 1132);
  assert.equal(recovery.topPairs[0].a, 3);
  assert.equal(recovery.topPairs[0].b, 14);
  assert.deepStrictEqual(
    (({count,a,b,k}) => ({count,a,b,k}))(recovery.topTriples[0]),
    {count:1132,a:3,b:14,k:9}
  );
  assert.ok(actual.topPairs[0].count < 20,
    'unexpected shared original cumulative Gematria key');
  output.results[label] = {actual, planted:{
    fullRecovery:recovery.topPairs[0].count, originalShapedWords:plant.total,
    key:{a:3,b:14,k:9}
  }};
}
console.log(JSON.stringify(output,null,2));
console.log('PASS: no shared original-key recovery; 1132/1132 complete native-English plants recovered');
