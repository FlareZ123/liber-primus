'use strict';
/**
 * SFT: original LP2 repeat sites under a frozen word-rotation plus fixed
 * GP29 escape emitter, calibrated against native historical English words.
 *
 * Hypothesis: rotate each plaintext GP word by one, two, or five runes in
 * either direction, then map one globally fixed plaintext rune to an
 * adjacent-equal ciphertext repeat and the other 28 runes bijectively to
 * the 28 unequal successor symbols. The unknown ordinary keystream and
 * every ordinary alphabet permutation cancel from the necessary event-site
 * constraint. This is a targeted source-cue gate, not a generic cipher
 * exclusion, a recovered key, or a claim about word-specific rotations.
 *
 * Execute: node sims/lp2_wordrotate_singleescape_all29_original_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const runeId = new Map(gp.runes.map((r, i) => [r, i]));
const words = [];
let current = [], last = -1, runeCount = 0;
function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}
for (const ch of transcript.split('%').slice(0, 55).join('%')) {
  if (runeId.has(ch)) {
    const val = runeId.get(ch);
    current.push({ val, repeat: runeCount > 0 && last === val });
    last = val;
    runeCount++;
  } else if (!('%/ \r\n\t'.includes(ch))) finishWord();
}
finishWord();
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
const repeats = words.flat().filter(x => x.repeat).length;
assert.equal(repeats, 86);
const lengthCount = new Map();
for (const word of words) {
  lengthCount.set(word.length, (lengthCount.get(word.length) || 0) + 1);
}
const labels = gp.translit.map((s, i) => ({ s, i }))
  .concat([{s:'ING',i:21},{s:'IO',i:27}])
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Source-native GP spelling, retaining ING and IO as actual runes.
 * @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g,'CW')
    .replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const hit = labels.find(label => s.startsWith(label.s, i));
    if (!hit) return [];
    out.push(hit.i);
    i += hit.s.length;
  }
  return out;
}
/**
 * @param {string} text
 * @returns {Map<number, number[][]>}
 */
function bucketsFor(text) {
  const buckets = new Map();
  for (const raw of text.match(/[A-Za-z]+/g) || []) {
    const seq = encode(raw);
    if (!seq.length) continue;
    if (!buckets.has(seq.length)) buckets.set(seq.length, []);
    buckets.get(seq.length).push(seq);
  }
  for (const length of lengthCount.keys()) {
    assert.ok(buckets.has(length) && buckets.get(length).length > 0);
  }
  return buckets;
}
/**
 * Inverse of a 3x3 covariance matrix. Cholesky is unnecessary at this
 * fixed small dimension; Gaussian pivoting handles genuine correlations.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function inverse3(matrix) {
  const a = matrix.map(row => row.slice());
  const b = a.map((row, i) => row.map((_, j) => Number(i === j)));
  for (let k = 0; k < 3; k++) {
    let pivot = k;
    for (let r = k + 1; r < 3; r++) {
      if (Math.abs(a[r][k]) > Math.abs(a[pivot][k])) pivot = r;
    }
    if (Math.abs(a[pivot][k]) < 1e-8) return null;
    [a[k], a[pivot]] = [a[pivot], a[k]];
    [b[k], b[pivot]] = [b[pivot], b[k]];
    const norm = a[k][k];
    for (let j = 0; j < 3; j++) { a[k][j] /= norm; b[k][j] /= norm; }
    for (let r = 0; r < 3; r++) {
      if (r === k) continue;
      const factor = a[r][k];
      for (let j = 0; j < 3; j++) {
        a[r][j] -= factor * a[k][j];
        b[r][j] -= factor * b[k][j];
      }
    }
  }
  return b;
}
/**
 * Original ciphertext repeat sites must equal the locations of one fixed
 * plaintext rune E after the specified per-word left rotation.
 * The three sufficient marginal counts are total E, plaintext word start
 * E, plaintext word end E. Rotation preserves the total.
 * @param {number} rotate
 * @returns {number[]}
 */
function originalEvents(rotate) {
  const observed = [0,0,0];
  for (const word of words) {
    const L = word.length;
    for (let j = 0; j < L; j++) if (word[j].repeat) {
      const plaintextSite = ((j - rotate) % L + L) % L;
      observed[0]++;
      observed[1] += Number(plaintextSite === 0);
      observed[2] += Number(plaintextSite === L-1);
    }
  }
  return observed;
}
/**
 * Exact word-length-conditioned covariance and means under independent
 * native-English word draws, with no Monte Carlo noise in the statistics.
 * @param {Map<number, number[][]>} buckets
 * @param {number} E
 */
function referenceMoments(buckets, E) {
  const mean=[0,0,0], cov=Array.from({length:3},()=>[0,0,0]);
  for (const [L, count] of lengthCount) {
    const sample=buckets.get(L), n=sample.length;
    const first=[0,0,0];
    const second=Array.from({length:3},()=>[0,0,0]);
    for (const word of sample) {
      const x=[word.filter(v=>v===E).length,Number(word[0]===E),
        Number(word[L-1]===E)];
      for (let i=0;i<3;i++) {
        first[i]+=x[i];
        for(let j=0;j<3;j++)second[i][j]+=x[i]*x[j];
      }
    }
    for (let i=0;i<3;i++) {
      mean[i]+=count*first[i]/n;
      for(let j=0;j<3;j++)cov[i][j]+=
        count*(second[i][j]/n-first[i]*first[j]/(n*n));
    }
  }
  return {mean,cov};
}
/**
 * @param {number[]} observed
 * @param {{mean:number[],cov:number[][]}} moments
 */
function distance(observed,moments) {
  const d=observed.map((x,i)=>x-moments.mean[i]);
  const inv=inverse3(moments.cov);
  if (inv===null) return {chi:Infinity,maxZ:Infinity};
  let chi=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++) {
    chi+=d[i]*inv[i][j]*d[j];
  }
  const maxZ=Math.max(...d.map((x,i)=>Math.abs(x)/
    Math.sqrt(moments.cov[i][i])));
  return {chi,maxZ};
}
const ROTATIONS=[-5,-2,-1,0,1,2,5];
/**
 * The reversible emitter uses the previous ciphertext rune as its
 * alphabet state. The skip is the transparent E event, not a key consume.
 * A zero pad is a valid planted key and makes the inverse easy to inspect.
 * @param {number[][]} source
 * @param {number} E
 * @param {number} rotate
 */
function plantAndInvert(source,E,rotate) {
  const cipher=[],clear=[],markers=[];
  let prev=13;
  for (const plain of source) {
    const L=plain.length;
    const rotated=plain.map((_,i)=>plain[(i+rotate%L+L)%L]);
    const recovered=[];
    for (const sym of rotated) {
      const rank=sym<E?sym:sym-1;
      const c=sym===E?prev:(prev+1+rank)%29;
      const again=c===prev?E:
        ((c-prev+29)%29-1 < E
          ?(c-prev+29)%29-1 : (c-prev+29)%29);
      assert.equal(again,sym);
      cipher.push(c);clear.push(again);
      markers.push(c===prev);
      recovered.push(again);prev=c;
    }
    const restored=recovered.map((_,i)=>
      recovered[(i-rotate%L+L)%L]);
    assert.deepEqual(restored,plain);
  }
  assert.equal(cipher.length,12956);
  assert.deepEqual(clear.map(x=>x===E),markers);
  return {runes:cipher.length,markers:markers.filter(Boolean).length,
    roundTripExact:true};
}
function rng(seed) {
  let state=seed>>>0;
  return max=>{
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    return Math.floor((state/4294967296)*max);
  };
}
const refs=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
const evidence=[];
for(const [source,file] of refs) {
  const buckets=bucketsFor(read(file)),candidates=[];
  const moments=gp.translit.map((_,E)=>referenceMoments(buckets,E));
  for(const rotate of ROTATIONS) {
    const observed=originalEvents(rotate);
    for(let E=0;E<29;E++) {
      const result=distance(observed,moments[E]);
      candidates.push({
        rotation:rotate,escape:gp.translit[E],escapeIndex:E,
        chi:Number(result.chi.toFixed(3)),
        maxAbsZ:Number(result.maxZ.toFixed(3)),
        expected: moments[E].mean.map(x=>Number(x.toFixed(2))),
        observed
      });
    }
  }
  candidates.sort((a,b)=>a.chi-b.chi);
  evidence.push({source,searchCases:candidates.length,
    best:candidates[0],unrotated:candidates.find(x=>x.rotation===0)});
  assert(candidates[0].chi>50);
  assert(candidates[0].maxAbsZ>5);
  if(source==='Gibran') {
    const choose=rng(0x33011117),plant=[];
    for(const original of words) {
      const choices=buckets.get(original.length);
      plant.push(choices[choose(choices.length)]);
    }
    evidence.at(-1).plantedForwardInverse=plantAndInvert(plant,6,2);
  }
}
assert.equal(evidence.length,3);
console.log(JSON.stringify({
  model:'word-wise fixed left rotation; one fixed GP29 escape emits repeat; arbitrary 28-way ordinary keystream',
  sourceOriginal:{runes:runeCount,words:words.length,repeats,
    wordLengths:Object.fromEntries(lengthCount)},
  variants:ROTATIONS,escapeCandidates:29,reference:evidence,
  conclusion:'No original native-English escape-site model fits under the predeclared fixed word rotations. This is a necessary condition, independent of ordinary 28-symbol key. Word-specific rotations, relocated printed boundaries and other language registers are not tested. No authentic plaintext or key.'
},null,2));
