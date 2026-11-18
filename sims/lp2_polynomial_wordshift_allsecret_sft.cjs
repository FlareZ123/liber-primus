'use strict';

/**
 * Original LP2 all-secret per-word polynomial GP29 additive key exclusion.
 * SFT for Node.js 22 on Windows 11 or other OSes.
 *
 * Hypothesis: C[w,j] = P[w,j] + sum_{k=0..d} a[w,k]*j^k (mod29),
 * with every coefficient independently arbitrary per word; d=2..7.
 * The (d+1)st finite difference removes every possible secret coefficient.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const controlPaths = [
  'resources/control/english_wordfreq_textblob.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/blake_song_of_liberty_train.txt'
];
const MAXLEN = 14;
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[] | null} */
function encode(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(t => normalized.startsWith(t.s, i));
    if (!token) return null;
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
/**
 * Compute invariant delta^(d+1) of an index tape in GF(29).
 * @param {number[]} values
 * @param {number} degree
 * @returns {string}
 */
function signature(values, degree) {
  let v = values.slice();
  for (let t = 0; t <= degree; t++) {
    const next = new Array(v.length - 1);
    for (let i = 0; i < next.length; i++) next[i] = mod(v[i + 1] - v[i]);
    v = next;
  }
  return v.map(x => String.fromCharCode(65 + x)).join('');
}
/** @returns {number[][]} */
function printedWords() {
  const result = [];
  const ri = new Map(gp.runes.map((r, i) => [r, i]));
  let current = [];
  function finish() {
    if (current.length) result.push(current);
    current = [];
  }
  // The source text compresses out runeless LP2 physical p50.
  for (const ch of transcript.split('%').slice(0, 55).join('%')) {
    const value = ri.get(ch);
    if (value !== undefined) current.push(value);
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Line and page wraps do not end a printed word.
    } else finish();
  }
  finish();
  return result;
}
const tape = gp.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const original = printedWords();
assert.equal(tape.length, 12956);
assert.equal(original.length, 2896);
assert.deepEqual(original.flat(), tape);
const dictionary = Array.from({length: MAXLEN + 1}, () => new Map());
for (const [sourceIndex, name] of controlPaths.entries()) {
  const words = read(name).match(sourceIndex === 0 ? /^[A-Za-z]+/gm : /[A-Za-z]+/g) || [];
  for (const word of words) {
    const values = encode(word);
    if (values && values.length <= MAXLEN)
      dictionary[values.length].set(values.join(','), values);
  }
}
const sourceCount = dictionary.reduce((sum, words) => sum + words.size, 0);
assert.equal(sourceCount, 32021);
console.log('Original ciphertext:', tape.length, 'runes in', original.length, 'words');
console.log('Control dictionary:', sourceCount, 'unique GP29 word encodings in five existing control files');
/** @param {number[]} values @param {number[]} coefficients @returns {number[]} */
function encrypt(values, coefficients) {
  return values.map((p, j) => {
    let key = 0, power = 1;
    for (const a of coefficients) { key += a * power; power = mod(power * j); }
    return mod(p + key);
  });
}
/** @param {number[]} values @param {number[]} coefficients @returns {number[]} */
function decrypt(values, coefficients) {
  return values.map((c, j) => {
    let key = 0, power = 1;
    for (const a of coefficients) { key += a * power; power = mod(power * j); }
    return mod(c - key);
  });
}
const expectations = [
  {degree: 2, minLength: 9, longLength: 9},
  {degree: 3, minLength: 10, longLength: 10},
  {degree: 4, minLength: 11, longLength: 11},
  {degree: 5, minLength: 12, longLength: 12},
  {degree: 6, minLength: 12, longLength: 12},
  {degree: 7, minLength: 14, longLength: 14}
];
const all = [];
for (const {degree, minLength, longLength} of expectations) {
  const rows = [];
  for (let n = degree + 3; n <= MAXLEN; n++) {
    const candidates = [...dictionary[n].values()];
    const valid = new Set(candidates.map(x => signature(x, degree)));
    let printed = 0, compatible = 0, anyCut = 0;
    for (const word of original) {
      if (word.length !== n) continue;
      printed++;
      if (valid.has(signature(word, degree))) compatible++;
    }
    for (let start = 0; start <= tape.length - n; start++) {
      if (valid.has(signature(tape.slice(start, start + n), degree))) anyCut++;
    }
    // Independent source-native planted key with all coefficients nonzero.
    const exemplar = candidates[Math.floor(candidates.length / 3)];
    assert(exemplar, 'missing native control word of length ' + n);
    const key = Array.from({length: degree + 1}, (_, k) => (11 + k * 7) % 29);
    const ciphertext = encrypt(exemplar, key);
    assert.deepEqual(decrypt(ciphertext, key), exemplar);
    assert.equal(signature(ciphertext, degree), signature(exemplar, degree));
    rows.push({n, dictionaryWords: candidates.length, printed, compatible, anyCut});
  }
  for (const row of rows.filter(row => row.n >= minLength)) {
    assert.equal(row.anyCut, 0, 'expected original all-cut exclusion at d=' + degree + '/n=' + row.n);
  }
  const anchor = rows.find(row => row.n === longLength);
  assert(anchor && anchor.printed > 0, 'no actual original words requiring excluded length');
  all.push({degree, allCutZeroFrom: minLength, printedDemand: rows
    .filter(r => r.n >= minLength).reduce((sum, r) => sum + r.printed, 0), rows});
  console.log('Degree', degree, 'PASS, all-cut zero for lengths', minLength + '..14',
    'with', all[all.length - 1].printedDemand, 'original required printed slots');
}
assert.deepEqual(all.map(x => x.printedDemand), [187, 109, 57, 25, 25, 3]);
console.log(JSON.stringify({status: 'PASS', model: 'independent arbitrary hidden polynomial coefficients per word',
  referenceGPWords: sourceCount, originalRunes: tape.length, originalWords: original.length, all}, null, 2));

/**
 * New strictly broader original-cipher family:
 *   C[w,j] = scale[w] * P[w,j] + polynomial[w](j) mod 29,
 * with arbitrary unknown NONZERO scale per word and independently
 * arbitrary polynomial coefficients, including all source-oriented cuts.
 * The (d+1)th difference is proportional to the plaintext difference.
 * Normalize by the first nonzero difference, removing all 28 scales.
 * @param {number[]} values @param {number} degree @returns {string}
 */
function affineSignature(values,degree) {
  let v=values.slice();
  for(let k=0;k<=degree;k++){
    const next=new Array(v.length-1);
    for(let j=0;j<next.length;j++)next[j]=mod(v[j+1]-v[j]);
    v=next;
  }
  const pivot=v.findIndex(x=>x!==0);
  if(pivot<0)return 'ZERO';
  let inv=0;
  for(let i=1;i<29;i++)if(i*v[pivot]%29===1){inv=i;break;}
  assert(inv!==0);
  return pivot+':'+v.map(x=>String.fromCharCode(65+mod(x*inv))).join('');
}
const affineExpectations=[
  {degree:2,zeroFrom:11,demand:57},
  {degree:3,zeroFrom:11,demand:57},
  {degree:4,zeroFrom:12,demand:25},
  {degree:5,zeroFrom:12,demand:25}
];
for(const {degree,zeroFrom,demand} of affineExpectations) {
  let longOriginal=0;
  for(let n=degree+3;n<=MAXLEN;n++){
    const examples=[...dictionary[n].values()];
    const ref=new Set(examples.map(v=>affineSignature(v,degree)));
    const sample=examples[Math.floor(examples.length/2)];
    assert(sample);
    const transformed=sample.map((x,j)=>{
      let poly=0,power=1;
      for(let k=0;k<=degree;k++){poly+=((3+7*k)%29)*power;power=mod(power*j);}
      return mod(17*x+poly);
    });
    assert.equal(affineSignature(transformed,degree),affineSignature(sample,degree));
    let actual=0;
    for(let start=0;start<=tape.length-n;start++)
      if(ref.has(affineSignature(tape.slice(start,start+n),degree)))actual++;
    if(n>=zeroFrom) {
      assert.equal(actual,0,'Original source admits affine word polynomial: d='+degree+', n='+n);
      longOriginal+=original.filter(w=>w.length===n).length;
    }
    if(n===zeroFrom-1)assert(actual>0,'model unexpectedly too restrictive near cutoff');
  }
  assert.equal(longOriginal,demand);
  console.log('Affine all-secret degree',degree,'PASS, all-cut exact-zero lengths',
    zeroFrom+'..14,',demand,'original mandatory word slots');
}
