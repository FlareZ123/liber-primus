'use strict';
/**
 * A frozen original-input test of the LP2 256-token quotient as nine
 * 28-position GP28 differential keys. This is a candidate, not a decryption.
 *
 * Original source facts: nine visually delimited unknown chapters, a
 * 252-coefficient Q obtained from P50/(H*G), and a 28-element nonzero
 * multiplicative group in GF(29). The proposed Q-to-keystream transfer and
 * predecessor-difference decoder are hypotheses.
 *
 * Run directly under Node.js 22 from the repository root:
 * node sims/lp2_q252_ninechapter_gp28_step_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {any} */
function json(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
}
const source = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/base60-grid.json');
const mod = n => ((n % 29) + 29) % 29;
const mod28 = n => ((n % 28) + 28) % 28;
/**
 * Polynomial product with ascending coefficients over GF29.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function product(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}
/**
 * Exact, full polynomial long division in the chosen high-to-low source
 * coefficient order. Returns a high-to-low quotient and low-degree remainder.
 * @param {number[]} highToLow
 * @param {number[]} divisor Ascending order
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(highToLow, divisor) {
  const data = highToLow.slice().reverse();
  const t = data.slice();
  const quotient = Array(data.length - divisor.length + 1).fill(0);
  const lead = divisor.at(-1);
  const inverse = Array.from({length: 28}, (_, i) => i + 1)
    .find(x => (lead * x) % 29 === 1);
  assert.notEqual(inverse, undefined);
  for (let i = t.length - 1; i >= divisor.length - 1; i--) {
    const shift = i - divisor.length + 1;
    const coefficient = mod(t[i] * inverse);
    quotient[shift] = coefficient;
    for (let j = 0; j < divisor.length; j++) {
      t[shift + j] = mod(t[shift + j] - coefficient * divisor[j]);
    }
  }
  return {quotient: quotient.reverse(), remainder: t.slice(0, divisor.length - 1)};
}
const H = [3,26,24], G = [27,5,15];
const divisor = product(H,G);
assert.deepEqual(divisor, [23,21,11,17,12]);
const printedBytes = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
assert.equal(printedBytes.length, 256);
const {quotient: Q, remainder} =
  divide(printedBytes.map(value => value % 29), divisor);
assert.deepEqual(remainder, [0,0,0,0]);
assert.equal(Q.length, 252);
assert.deepEqual(Q.slice(0, 16),
  [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]);
const chapterStart = [0,3,8,15,23,27,33,40,54,56];
const lengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const chapters = lengths.map((n, s) => source.pages
  .filter(p => p.page >= chapterStart[s] &&
    p.page < chapterStart[s + 1])
  .flatMap(p => p.indices));
assert.deepEqual(chapters.map(x => x.length), lengths);
assert.equal(chapters.flat().length, 12956);
const nonzero = Array.from({length:28},(_,j) => {
  let n = 1;
  for (let i = 0; i < j; i++) n = (15 * n) % 29;
  return n;
});
assert.equal(new Set(nonzero).size, 28);
const logs = Array(29).fill(-1);
nonzero.forEach((n, i) => { logs[n] = i; });
/**
 * One fixed source-order candidate: unmodified chapter-first rune as IV,
 * zero difference as a conditional transparent GP-EA marker, otherwise
 * subtract the local 28-Q key position from log15(C[i]-C[i-1]).
 * The key advances only for nonzero steps.
 * @param {number[]} cipher
 * @param {number} section
 * @returns {number[]}
 */
function decrypt(cipher, section) {
  let phase = 0;
  return cipher.map((value, i) => {
    if (i === 0) return value;
    const difference = mod(value - cipher[i-1]);
    if (!difference) return 28;
    const key = mod28(Q[28*section + (phase++ % 28)]);
    return mod28(logs[difference] - key);
  });
}
/**
 * Forward encoder proves the candidate is invertible on real native GP text.
 * @param {number[]} plain
 * @param {number} section
 * @returns {number[]}
 */
function encrypt(plain, section) {
  const result = [plain[0]];
  let phase = 0;
  for (let i = 1; i < plain.length; i++) {
    if (plain[i] === 28) {
      result.push(result[i-1]);
    } else {
      const key = mod28(Q[28*section + (phase++ % 28)]);
      result.push(mod(result[i-1] +
        nonzero[mod28(plain[i] + key)]));
    }
  }
  return result;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n*(n-1), 0) /
    (data.length * (data.length-1));
}
const decoded = chapters.map((cipher, s) => decrypt(cipher,s));
const sourceNative = source.pages.find(p => p.page === 57).indices;
assert.equal(sourceNative.length,95);
const positive = chapters.map((cipher, s) => {
  const native = Array.from({length:cipher.length},
    (_,i) => sourceNative[i % sourceNative.length]);
  assert.deepEqual(decrypt(encrypt(native,s),s), native);
  assert.deepEqual(encrypt(decrypt(cipher,s),s), cipher);
  return native;
});
const observed = decoded.map((runes,s) => ({
  chapter:s+1,
  physicalPages: String(chapterStart[s]) + '-' +
    String(chapterStart[s+1]-1),
  symbols:runes.length,
  ciphertextIoc:ioc(chapters[s]),
  candidateIoc:ioc(runes),
  positiveIoc:ioc(positive[s]),
  candidateFirst80GP:runes.slice(0,80)
    .map(x => source.translit[x]).join('')
}));
/**
 * Key-independent collision invariant for the distinct NONZERO-step clock.
 * Secret 28-symbol substitutions and phase-specific Q-derived changes cannot
 * alter symbol equality within any of the nine by 28 phase bins. Use original
 * C differences minus one, a bijective relabeling of log15 differences.
 *
 * @typedef {{bin:number,symbol:number}} RankSite
 */
/** @type {RankSite[]} */
const rankSites = [];
let markerCount = 0;
for (let s = 0; s < chapters.length; s++) {
  let phase = 0;
  const original = chapters[s];
  for (let i = 1; i < original.length; i++) {
    const d = mod(original[i] - original[i-1]);
    if (d === 0) { markerCount++; continue; }
    rankSites.push({bin:28*s+(phase++%28),symbol:d-1});
  }
}
assert.equal(markerCount, 86);
assert.equal(rankSites.length,12861);
/**
 * Same-bin exact-equality invariant; independent of any secret bijection.
 * @param {number[]} symbols One symbol per nonzero original difference.
 * @returns {{hits:number,pairs:number,rate:number}}
 */
function equality(symbols) {
  const bins = Array.from({length:252}, () => Array(28).fill(0));
  const totals = Array(252).fill(0);
  assert.equal(symbols.length,rankSites.length);
  for (let i = 0; i < rankSites.length; i++) {
    const bin=rankSites[i].bin;
    bins[bin][symbols[i]]++;
    totals[bin]++;
  }
  const choose2 = n => n*(n-1)/2;
  const hits=bins.reduce((sum,row) => sum+
    row.reduce((inner,n) => inner+choose2(n),0),0);
  const pairs=totals.reduce((sum,n) => sum+choose2(n),0);
  return {hits,pairs,rate:hits/pairs};
}
const originalEquality=equality(rankSites.map(x=>x.symbol));
assert.equal(originalEquality.hits,14513);
assert.equal(originalEquality.pairs,407716);
// Independent held-out reference: 16 non-overlapping original-author
// Shakespeare GP28 segments matched to the exact 12,861 symbol count.
// No candidate decoded source letters are used in fitting or translation.
const shakespeare=fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'),'utf8');
const letters=new Map(source.translit.map((x,i)=>[x,i]));
const englishGp28=[];
for (const raw of shakespeare.toUpperCase().match(/[A-Z]+/g)||[]) {
  const word=raw.replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  for (let i=0;i<word.length;) {
    const pair=letters.get(word.slice(i,i+2));
    const val=pair===undefined?letters.get(word[i]):pair;
    if(val!==undefined&&val!==28)englishGp28.push(val);
    i+=pair===undefined?1:2;
  }
}
assert.equal(englishGp28.length,217167);
const windowCount=Math.floor(englishGp28.length/rankSites.length);
assert.equal(windowCount,16);
const nativeRates=[];
for (let j=0;j<windowCount;j++) {
  const native=englishGp28.slice(j*rankSites.length,(j+1)*rankSites.length);
  nativeRates.push(equality(native).rate);
}
nativeRates.sort((a,b)=>a-b);
assert.ok(nativeRates[0]>0.059);
assert.ok(originalEquality.rate<0.04);
const invariant={
  original:originalEquality,
  keyClass:'arbitrary secret GP28 bijection per chapter and nonzero-step phase',
  controls:'16 disjoint source-native Shakespeare GP28 windows, each 12861 runes',
  sourcePoolSymbols:englishGp28.length,
  nativeMin:nativeRates[0],nativeMedian:nativeRates[8],
  nativeMax:nativeRates[15],nativeAtOrBelowOriginal:nativeRates.filter(
    r=>r<=originalEquality.rate).length,
  limitation:'Necessary condition assumes native-GP English source under a '+
    'stationary per-chapter period28 permutation; not a universal '+
    'exclusion of stateful or non-English ciphers.'
};

const originalIoc = ioc(chapters.flat());
const candidateIoc = ioc(decoded.flat());
const nativeIoc = ioc(positive.flat());
assert.ok(candidateIoc < 0.04);
assert.ok(nativeIoc > 0.045);
console.log(JSON.stringify({
  inputs:{originalSymbols:12956,chapters:9,Qdigits:252,
    factorRemainder:remainder},
  operator:'printed-order Q252 as nine 28-key blocks; root15 nonzero GP28 '+
    'predecessor log steps; nonzero clock; EA zero-step marker; subtract key',
  originalIoc,candidateIoc,nativeIoc,invariant,
  originalAndPositiveRoundtrip:'12956/12956 each',
  readouts:observed,
  conclusion:'Complete original decoder remains near random; no coherent '+
    'unknown-page plaintext or source-authenticated key transfer.'
},null,2));
