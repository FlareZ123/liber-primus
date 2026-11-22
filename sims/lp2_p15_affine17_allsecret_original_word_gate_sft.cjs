'use strict';

/**
 * Exhaustive 17-parameter affine GF(29) inverse tests on original LP2 p16-22.
 *
 * Two distinct fixed-clock source-p15-width hypotheses are tested:
 * (1) block-cyclic Hill: P[t] = b + sum_j h[j] C[blockStart+(t+j)%16];
 * (2) causal FIR:       P[t] = b + sum_j h[j] C[t-j], for t>=15.
 *
 * Every possible affine secret vector h[0..15],b that yields the source
 * English singleton words A/I/O at all 17 original positions is recovered
 * by exact GF29 inversion and a full 3^17 ternary enumeration. Every
 * source double-word is evaluated against the entire pinned GP29 dictionary.
 * The test does not assume the printed numeric p15 kernel to constrain h.
 *
 * Windows11 Node22 CommonJS, deterministic original-input SFT.
 * node sims/lp2_p15_affine17_allsecret_original_word_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const wordList = fs.readFileSync(path.join(root,
  'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8');
const WIDTH = 16;
const DIM = 17; // sixteen secret GF29 coefficients plus arbitrary affine constant
const Q = 29;
const nativeSingletons = [24, 10, 3]; // source-native A, I, O
const expectedSingletons = [21, 119, 244, 380, 386, 414, 455, 471, 596,
  712, 871, 937, 989, 1032, 1491, 1557, 1574];
const printedP15 = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];

/** @param {number} x @returns {number} */
function mod(x) { return ((x % Q) + Q) % Q; }

/**
 * Complete exact Gauss-Jordan over GF29, including free-position failure.
 * @param {number[][]} matrix
 * @returns {{rank:number,inverse:number[][] | null}}
 */
function invert(matrix) {
  const n = matrix.length;
  assert(matrix.every((row) => row.length === n));
  const a = matrix.map((r, i) => [...r,
    ...Array.from({length:n}, (_, j) => Number(i === j))]);
  let rank = 0;
  for (let j = 0; j < n; j++) {
    const p = a.findIndex((r, i) => i >= rank && r[j]);
    if (p < 0) continue;
    [a[rank], a[p]] = [a[p], a[rank]];
    let scalar = 0;
    for (let i = 1; i < Q; i++) if (mod(i * a[rank][j]) === 1) {
      scalar = i;
      break;
    }
    assert(scalar);
    a[rank] = a[rank].map((x) => mod(scalar * x));
    for (let i = 0; i < n; i++) {
      if (i === rank || !a[i][j]) continue;
      const factor = a[i][j];
      a[i] = a[i].map((x, k) => mod(x - factor * a[rank][k]));
    }
    rank++;
  }
  return {rank, inverse: rank === n ? a.map((r) => r.slice(n)) : null};
}

/**
 * @param {'cyclic'|'causal'} mode
 * @param {number[]} original
 * @param {number} t
 * @returns {number[]} Affine equations with final coefficient 1
 */
function observe(mode, original, t) {
  if (mode === 'causal') assert(t >= WIDTH - 1);
  const start = Math.floor(t / WIDTH) * WIDTH;
  return [
    ...Array.from({length: WIDTH}, (_, j) =>
      original[mode === 'cyclic'
        ? start + ((t % WIDTH + j) % WIDTH) : t - j]),
    1
  ];
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function dot(a, b) {
  assert.equal(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return mod(sum);
}

/**
 * @param {number[][]} probes
 * @param {number[][]} inverse
 * @returns {number[][]}
 */
function project(probes, inverse) {
  return probes.map((probe) => Array.from({length:DIM}, (_, j) =>
    mod(probe.reduce((sum, x, i) => sum + x * inverse[i][j], 0))
  ));
}

/**
 * @param {number[]} original
 * @param {number[]} plain
 * @param {'cyclic'|'causal'} mode
 * @param {number[]} singles
 * @param {number[]} doubles
 * @param {Uint8Array} permittedPairs
 * @returns {{recovered:number,secretKernel:number[]}}
 */
function validatePlant(original, plain, mode, singles, doubles, permittedPairs) {
  const rows = singles.map((t) => observe(mode, original, t));
  const {rank, inverse} = invert(rows);
  assert.equal(rank, DIM);
  assert(inverse);
  const secretKernel = inverse.map((r) =>
    dot(r, singles.map((site) => plain[site])));
  const first = mode === 'causal' ? WIDTH - 1 : 0;
  for (let t = first; t < original.length; t++) {
    assert.equal(dot(observe(mode, original, t), secretKernel), plain[t],
      'Positive plant exact GP plaintext recovery at position ' + t);
  }
  for (const t of doubles) {
    assert(permittedPairs[plain[t] * Q + plain[t + 1]],
      'Positive plant two-rune dictionary at original word');
  }
  return {recovered: original.length - first, secretKernel};
}

/**
 * @param {number[]} plain
 * @returns {number[]} Literal p15-cyclic encryption of (P-b).
 */
function cyclicPlant(plain) {
  const bias = 7;
  const matrix = Array.from({length: WIDTH}, (_, i) =>
    Array.from({length: WIDTH}, (_, j) =>
      mod(printedP15[((j - i) % WIDTH + WIDTH) % WIDTH])));
  const {rank} = invert(matrix);
  assert.equal(rank, WIDTH);
  const result = [];
  for (let b = 0; b < plain.length; b += WIDTH) {
    for (const row of matrix) {
      let sum = 0;
      for (let j = 0; j < WIDTH; j++) sum += row[j] * mod(plain[b+j]-bias);
      result.push(mod(sum));
    }
  }
  return result;
}

/**
 * @param {number[]} plain
 * @returns {number[]} The p15 tap coefficients as an inverse FIR with bias 7.
 */
function causalPlant(plain) {
  const kernel = printedP15.map(mod);
  const bias = 7;
  let inv = 0;
  for (let i = 1; i < Q; i++) if (mod(i * kernel[0]) === 1) {
    inv = i;
    break;
  }
  assert(inv);
  const cipher = plain.slice(0, WIDTH-1); // exactly 15 explicit public IVs
  for (let t = WIDTH - 1; t < plain.length; t++) {
    let history = 0;
    for (let j = 1; j < WIDTH; j++) history += kernel[j] * cipher[t-j];
    cipher.push(mod((plain[t] - bias - history) * inv));
  }
  return cipher;
}

/** @param {number} n @returns {number} */
function grayCount(n) {
  const digits = new Uint8Array(n);
  const direction = new Int8Array(n).fill(1);
  let total = 0;
  while (true) {
    total++;
    let j = 0;
    for (; j < n; j++) {
      const next = digits[j] + direction[j];
      if (next >= 0 && next <= 2) break;
    }
    if (j === n) break;
    digits[j] += direction[j];
    for (let k = 0; k < j; k++) direction[k] *= -1;
  }
  return total;
}
assert.equal(grayCount(4), 81);
assert.equal(corpus.translit[24], 'A');
assert.equal(corpus.translit[10], 'I');
assert.equal(corpus.translit[3], 'O');

const lengthByPage = Array.from({length:7}, (_, i) => 
  corpus.pages.find((p) => p.page === i+16).indices.length);
assert.deepEqual(lengthByPage, [267,273,260,271,269,273,131]);
const ciphertext = Array.from({length:7}, (_, i) =>
  corpus.pages.find((p) => p.page === i+16).indices).flat();
assert.equal(ciphertext.length, 1744);

const start = corpus.pages.filter((p) => p.page < 16).reduce(
  (sum,p) => sum + p.indices.length, 0);
const end = start + ciphertext.length;
const targetWords = [];
let cursor = 0;
for (const word of parseSharedCorpus().words) {
  if (cursor >= start && cursor < end) {
    assert(cursor + word.length <= end);
    targetWords.push({at:cursor-start, length:word.length});
  }
  cursor += word.length;
}
assert.equal(targetWords.length, 400);
assert.equal(targetWords.reduce((s,w) => s + w.length, 0), 1744);
const singles = targetWords.filter((w) => w.length === 1).map((w) => w.at);
const doubles = targetWords.filter((w) => w.length === 2).map((w) => w.at);
assert.deepEqual(singles, expectedSingletons);
assert.equal(doubles.length, 69);
assert.deepEqual(doubles.slice(0,5), [32,76,78,120,150]);

const wordBuckets = new Map();
const permittedPairs = new Uint8Array(Q * Q);
for (const line of wordList.split(/\r?\n/u)) {
  const match = line.match(/^([a-z]+)\s+(\d+)$/u);
  if (!match) continue;
  const runes = encodeSourceNativeGP(match[1]);
  if (!wordBuckets.has(runes.length)) wordBuckets.set(runes.length, []);
  wordBuckets.get(runes.length).push({runes,frequency:Number(match[2])});
  if (runes.length === 2) permittedPairs[runes[0] * Q + runes[1]] = 1;
}
assert.equal(permittedPairs.reduce((s,v) => s+v,0),189);
for (const bucket of wordBuckets.values()) bucket.sort((x,y) => 
  y.frequency - x.frequency);

/** @returns {number[]} */
function nativePlant() {
  const result=[];
  let singletonIndex=0;
  targetWords.forEach((word, i) => {
    let part;
    if (word.length === 1) {
      part = [nativeSingletons[singletonIndex%3]];
      singletonIndex++;
    } else {
      const pool = wordBuckets.get(word.length);
      assert(pool?.length, 'native dictionary must cover every original word length');
      const limit = Math.min(20, pool.length);
      part = pool[(i*7+Math.floor(i/5))%limit].runes;
    }
    assert.equal(part.length, word.length);
    result.push(...part);
  });
  assert.equal(result.length,ciphertext.length);
  assert.equal(singletonIndex,DIM);
  return result;
}
const knownNative = nativePlant();
const output = [];
const deltaTypes = [-14,-7,7,14];
const deltaTable = deltaTypes.map((d) =>
  Uint8Array.from({length:Q}, (_, x) => mod(d*x))
);
for (const mode of ['cyclic','causal']) {
  const originalRows = singles.map((site) => observe(mode,ciphertext,site));
  const {rank, inverse} = invert(originalRows);
  assert.equal(rank,DIM);
  assert(inverse);
  const plantedCipher = mode === 'cyclic'
    ? cyclicPlant(knownNative) : causalPlant(knownNative);
  const plant = validatePlant(plantedCipher,knownNative,mode,
    singles,doubles,permittedPairs);
  const testProbes = doubles.map((site) => [
    observe(mode,ciphertext,site),observe(mode,ciphertext,site+1)
  ]).flat();
  const testVectors = project(testProbes,inverse);
  const fastVectors = testVectors.slice(0,4);
  const values = Uint8Array.from(fastVectors.map((row) =>
    row.reduce((sum,x) => sum+x*nativeSingletons[0],0)%Q));
  const digits = new Uint8Array(DIM);
  const directions = new Int8Array(DIM).fill(1);
  const assignments = new Uint8Array(DIM).fill(nativeSingletons[0]);
  let total=0, first2=0, matches=0;
  const survivorCounts = new Uint32Array(doubles.length+1);
  const examples=[];
  while(true) {
    total++;
    if (permittedPairs[values[0]*Q+values[1]] &&
        permittedPairs[values[2]*Q+values[3]]) {
      first2++;
      survivorCounts[2]++;
      for(let w=2;w<doubles.length;w++) {
        const a = testVectors[2*w];
        const b = testVectors[2*w+1];
        const i0=dot(a,assignments),i1=dot(b,assignments);
        if (!permittedPairs[i0*Q+i1]) break;
        survivorCounts[w+1]++;
        if(w===doubles.length-1) {
          matches++;
          if(examples.length<3) {
            examples.push({secretParameters: inverse.map((r) =>
              dot(r,assignments))});
          }
        }
      }
    }
    let j=0;
    for(;j<DIM;j++) {
      const next=digits[j]+directions[j];
      if(next>=0&&next<=2)break;
    }
    if(j===DIM)break;
    const old=digits[j];
    digits[j]+=directions[j];
    for(let k=0;k<j;k++) directions[k]*=-1;
    const next=digits[j];
    const delta=nativeSingletons[next]-nativeSingletons[old];
    const kind=deltaTypes.indexOf(delta);
    assert(kind>=0);
    assignments[j]=nativeSingletons[next];
    for(let t=0;t<values.length;t++) {
      const updated=values[t]+deltaTable[kind][fastVectors[t][j]];
      values[t]=updated>=Q ? updated-Q : updated;
    }
  }
  assert.equal(total,3**DIM);
  output.push({
    mode,originalRunes:ciphertext.length,originalWords:targetWords.length,
    singletonRank:rank,unknownAffineParameters:DIM,
    enumeratedUnknownAffineKeys:total,permittedGPDoubleWords:189,
    originalDoubleWords:doubles.length,firstTwoSurvivors:first2,
    completeSurvivors:matches,
    wordSurvival:Array.from({length:survivorCounts.length}, (_,i) =>
      survivorCounts[i]?{words:i,keys:survivorCounts[i]}:null).filter(Boolean),
    plantedPlainGPRecovered:plant.recovered,
    plantSecretParameters:plant.secretKernel,
    originalSurvivorExamples:examples
  });
}
console.log(JSON.stringify({status:'complete GF29 affine inverse attack on original LP2',results:output},null,2));
