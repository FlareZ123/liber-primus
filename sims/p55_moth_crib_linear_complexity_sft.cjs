'use strict';

/**
 * Original LP2 p55: test the provisional seven-word LP1 p5 moth crib against
 * every secret GF(29) linear or affine recurrence of order at most 14.
 * The crib is not authenticated plaintext. No packages or fitted keys needed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const c = data.pages.find(page => page.page === 55).indices;
const crib = [
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,
  9,10,15,15,24,5,4,18,23,24,20,20,2,21,15
];
const sourceSuffix = [
  12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,
  15,2,22,5,28,10,19,5,14,23,11,1,17,18,10
];
assert.equal(c.length, 76);
assert.equal(c[45], 5);
assert.deepEqual(c.slice(46), sourceSuffix);
assert.equal(crib.length, 30);

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let k = 1; k < 29; k++) if (mod(k * x) === 1) return k;
  throw new Error('Noninvertible GF29 element ' + x);
}

/** @param {number[]} series @returns {number} */
function berlekampMassey(series) {
  let A = [1], B = [1], L = 0, shift = 1, previous = 1;
  for (let n = 0; n < series.length; n++) {
    let d = series[n];
    for (let k = 1; k <= L; k++) d = mod(d + (A[k] || 0) * series[n-k]);
    if (d === 0) { shift++; continue; }
    const old = A.slice(), factor = mod(d * inverse(previous));
    for (let k = 0; k < B.length; k++) {
      A[k+shift] = mod((A[k+shift] || 0) - factor * B[k]);
    }
    if (2*L <= n) {
      L = n+1-L;
      B = old;
      previous = d;
      shift = 1;
    } else shift++;
  }
  return L;
}

/**
 * Exact feasibility of ANY unknown recurrence taps and optional intercept.
 * @param {number[]} series
 * @param {number} order
 * @param {boolean} affine
 * @returns {{consistent:boolean,rank:number,equations:number}}
 */
function recurrenceSystem(series, order, affine) {
  const variables = order + Number(affine), M = [];
  for (let i = order; i < series.length; i++) {
    M.push([
      ...Array.from({length:order}, (_,k) => series[i-1-k]),
      ...(affine ? [1] : []), series[i]
    ]);
  }
  let rank = 0;
  for (let j = 0; j < variables && rank < M.length; j++) {
    let pivot = rank;
    while (pivot < M.length && M[pivot][j] === 0) pivot++;
    if (pivot === M.length) continue;
    [M[rank], M[pivot]] = [M[pivot], M[rank]];
    const f = inverse(M[rank][j]);
    for (let z = j; z <= variables; z++) M[rank][z] = mod(M[rank][z]*f);
    for (let k = 0; k < M.length; k++) {
      if (k === rank || M[k][j] === 0) continue;
      const f2 = M[k][j];
      for (let z = j; z <= variables; z++) M[k][z] = mod(M[k][z]-f2*M[rank][z]);
    }
    rank++;
  }
  return {
    consistent: !M.some(row => row.slice(0,variables).every(x => x === 0) && row[variables] !== 0),
    rank, equations: M.length
  };
}

/**
 * @param {number[]} ciphertext
 * @param {boolean} step
 * @param {-1|1} sign
 * @returns {number[]}
 */
function requiredKey(ciphertext, step, sign) {
  return ciphertext.map((v,i) =>
    mod(v - (step ? (i === 0 ? c[45] : ciphertext[i-1]) : 0) + sign*crib[i]));
}

/** @param {number} intercept @returns {number[]} */
function plantedKey(intercept) {
  const key = Array.from({length:14},(_,i) => mod(7*i+3));
  const taps = Array.from({length:14},(_,i) => mod(i+3));
  for (let i = 14; i < 30; i++) {
    let next = intercept;
    for (let k = 0; k < 14; k++) next += taps[k]*key[i-1-k];
    key.push(mod(next));
  }
  return key;
}

for (const step of [false,true]) {
  for (const sign of /** @type {(-1|1)[]} */ ([-1,1])) {
    const key = requiredKey(sourceSuffix,step,sign);
    assert.equal(berlekampMassey(key), 15);
    for (let order = 0; order <= 14; order++) {
      assert.equal(recurrenceSystem(key,order,false).consistent,false);
      assert.equal(recurrenceSystem(key,order,true).consistent,false);
    }
    const rank14 = recurrenceSystem(key,14,true);
    assert.deepEqual(rank14,{consistent:false,rank:15,equations:16});
    for (const intercept of [0,7]) {
      const knownKey = plantedKey(intercept);
      let prev = c[45];
      const ciphertext = knownKey.map((v,i) => {
        const out = mod((step ? prev : 0) + v - sign*crib[i]);
        prev = out;
        return out;
      });
      assert.deepEqual(requiredKey(ciphertext,step,sign),knownKey);
      assert.equal(recurrenceSystem(knownKey,14,intercept !== 0).consistent,true);
    }
    // Source round-trip is an implementation invariant for all candidate keys.
    let prev = c[45];
    const reencryption = key.map((v,i) => {
      const out = mod((step ? prev : 0)+v-sign*crib[i]);
      prev = out;
      return out;
    });
    assert.deepEqual(reencryption,sourceSuffix);
    console.log(JSON.stringify({
      original: 'p55 offsets 46-75', model: step ? 'ciphertext step' : 'direct',
      plaintextSign: sign, homogeneousComplexity:15,
      affineOrder14:rank14, genuinePlaintext:false, plantedControls:2
    }));
  }
}
console.log('PASS: original 4/4 conditional recurrence exclusions; 8/8 plants');
