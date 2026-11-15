/**
 * GP29 all-secret period-812 equivalence on the original nine LP2 chapters.
 * Period comes from the sign-restored original p15 GF29 matrix, not a fitted
 * period. Negative is conditional on preserving original GP plaintext rune
 * positions: no F skip, resegmentation, per-word reset, or key-clock skips.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const size = 812, modulus = 29;
const mod = (n) => ((n % modulus) + modulus) % modulus;
const unknown = gp.pages.filter((p) => p.page < 56);
const chapterRunes = chapters.map(([lo, hi]) =>
  unknown.filter((p) => p.page >= lo && p.page <= hi).flatMap((p) => p.indices));
const lengths = chapterRunes.map((p) => p.length);
assert.deepEqual(lengths, [729,1145,1729,1903,1021,1433,1680,3008,308]);
const total = lengths.reduce((a, b) => a + b, 0);
assert.equal(total, 12956);

/** @param {number[]} vals @param {boolean} differential */
function counts(vals, differential) {
  let hits = 0, eligible = 0;
  if (differential) {
    for (let i = 1; i + size < vals.length; i += 1) {
      hits += Number(mod(vals[i] - vals[i - 1]) ===
        mod(vals[i + size] - vals[i + size - 1]));
      eligible += 1;
    }
  } else {
    for (let i = 0; i + size < vals.length; i += 1) {
      hits += Number(vals[i] === vals[i + size]);
      eligible += 1;
    }
  }
  return {hits, eligible};
}
/** @param {number[][]} groups @param {boolean} differential */
function pool(groups, differential) {
  const per = groups.map((xs) => counts(xs, differential));
  return {hits:per.reduce((s, p) => s + p.hits, 0),
    eligible:per.reduce((s, p) => s + p.eligible, 0),
    perChapter: per.map((p) => p.hits)};
}
const originalRaw = pool(chapterRunes, false);
const originalDiff = pool(chapterRunes, true);
assert.deepEqual(originalRaw,{hits:206,eligible:6235,perChapter:[0,8,22,37,7,21,30,81,0]});
assert.deepEqual(originalDiff,{hits:215,eligible:6228,perChapter:[0,9,37,29,5,26,33,76,0]});

/** @param {string} source */
function gpNative(source) {
  const words = source.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g) || [];
  const tokens = gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING',i)) {out.push(21);i+=3;continue;}
      if (word.startsWith('IO',i)) {out.push(27);i+=2;continue;}
      const t = tokens.find((v) => word.startsWith(v.s,i));
      assert(t,'unencodable GP native letter '+word.slice(i));
      out.push(t.i); i+=t.s.length;
    }
  }
  return out;
}
const english = gpNative(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(english.length, 62492);
const offsets = [];
for (let base = 0, i = 0; i < lengths.length; base += lengths[i++]) offsets.push(base);

/** @param {number[]} values */
function makePrefix(values) {
  const p = new Uint32Array(values.length + 1);
  for (let i = 0; i + size < values.length; i += 1)
    p[i + 1] = p[i] + Number(values[i] === values[i + size]);
  for (let i = values.length - size; i < values.length; i += 1)
    p[i + 1] = p[i];
  return p;
}
const prefix = makePrefix(english);
/** @param {number} start @param {boolean} differential */
function nativeWindowScore(start, differential) {
  let score = 0;
  for (let k = 0; k < lengths.length; k += 1) {
    const n = Math.max(0, lengths[k] - size - (differential ? 1 : 0));
    const first = start + offsets[k] + (differential ? 1 : 0);
    score += prefix[first + n] - prefix[first];
  }
  return score;
}
let minRaw = Infinity, maxRaw = -Infinity, minDiff=Infinity, maxDiff=-Infinity;
let minRawStart = 0, minDiffStart=0, maxRawStart=0,maxDiffStart=0;
const windows = english.length - total + 1;
for (let start = 0; start < windows; start += 1) {
  const r = nativeWindowScore(start, false);
  const d = nativeWindowScore(start, true);
  if (r < minRaw) {minRaw=r;minRawStart=start;}
  if (d < minDiff) {minDiff=d;minDiffStart=start;}
  if (r > maxRaw) {maxRaw=r;maxRawStart=start;}
  if (d > maxDiff) {maxDiff=d;maxDiffStart=start;}
}
assert.equal(windows,49537);
assert(minRaw > originalRaw.hits);
assert(minDiff > originalDiff.hits);

// Synthetic authentic-GP control under arbitrary secret 812-step bijections.
// At positions i and i+812, the same secret substitution applies and
// therefore equality must be preserved for EVERY bijective key permutation.
/** @returns {()=>number} */
function random(seed) {
  let x=seed>>>0;
  return () => { x ^= x<<13; x ^= x>>>17; x ^= x<<5; return x>>>0; };
}
const rand=random(0x8123301);
const perms = chapters.map(() => Array.from({length:size}, () => {
  const a=Array.from({length:modulus},(_,i)=>i);
  for (let i=28;i>0;i--) {
    const j=rand()%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  assert.equal(new Set(a).size,29);
  return a;
}));
const plantPlain = [];
for (let off=0,k=0;k<lengths.length;off+=lengths[k++])
  plantPlain.push(english.slice(off,off+lengths[k]));
assert.equal(plantPlain.flat().length,total);

const encryptedRaw=plantPlain.map((x,chapter) => x.map((v,i)=>perms[chapter][i%size][v]));
const recoveredRaw=encryptedRaw.map((x,chapter)=>x.map((v,i)=>perms[chapter][i%size].indexOf(v)));
assert.deepEqual(recoveredRaw,plantPlain);
assert.deepEqual(pool(encryptedRaw,false),pool(plantPlain,false));

const encryptedChain=plantPlain.map((x,chapter) => {
  const out=[];
  for (let i=0,prev=0;i<x.length;i++) {
    const step=perms[chapter][i%size][x[i]];
    prev=mod(prev+step);
    out.push(prev);
  }
  return out;
});
const recoveredChain=encryptedChain.map((x,chapter) => {
  const out=[];
  for (let i=0,prev=0;i<x.length;i++) {
    const step=mod(x[i]-prev);
    out.push(perms[chapter][i%size].indexOf(step));
    prev=x[i];
  }
  return out;
});
assert.deepEqual(recoveredChain,plantPlain);
// Chain-step equality at lag812 equals the original plaintext SYMBOL
// equality at lag812, omitting each chapter's first predecessor seed. It
// need not equal the plaintext's *own difference* coincidence statistic.
const nativeChainPairCounts = plantPlain.map((p) => {
  let count=0;
  for (let i=1;i+size<p.length;i++) count+=Number(p[i]===p[i+size]);
  return count;
});
assert.deepEqual(pool(encryptedChain,true).perChapter,nativeChainPairCounts);

console.log(JSON.stringify({
  source:'Original LP2 physical p0..p55, authentic chapter segmentation',
  signedP15CandidatePeriod:size,
  originalRaw,
  originalChainStep:originalDiff,
  heldoutNativeGPControl:'Gibran normalized with source GP29 orthography',
  nativeEnglishRuneCount:english.length,
  contiguousNativeWindows:windows,
  nativeRaw812:{min:minRaw,at:minRawStart,max:maxRaw,maxAt:maxRawStart},
  nativeStep812:{min:minDiff,at:minDiffStart,max:maxDiff,maxAt:maxDiffStart},
  positiveSecretTables:'9 independent chapters × 812 phases × arbitrary full 29-way permutations',
  recoveredRaw:recoveredRaw.flat().length,
  recoveredChain:recoveredChain.flat().length,
  decision:'No original native-GP plaintext under any frozen 812-period secret permutation on rune or predecessor-difference registers, with intact original symbol clock. This does not exclude F skips, changed alphabets, non-periodic state or resegmentation.',
},null,2));
