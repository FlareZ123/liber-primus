'use strict';

/**
 * One source-motivated p32 finite-difference image-filter inverse.
 * Source: original physical p32 11x11 GP29 rune reflow, blurred tree on
 * p32 and outlined version of its source tree on p55.
 * Hypothesis only: the edge operator is NOT specified by Cicada.
 * Run with Node.js 22; no package, network or file write required.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const C = corpus.pages.find(page => page.page === 32).indices;
const side = 11;
const modulus = 29;
assert.equal(C.length, side * side);
const mod = value => (value % modulus + modulus) % modulus;

/** @param {number} value @returns {number} */
function inverse(value) {
  assert.notEqual(mod(value), 0);
  return Array.from({length: modulus - 1}, (_, i) => i + 1)
    .find(i => mod(i * value) === 1);
}

/**
 * Ordinary four-neighbor discrete image Laplacian, with zero boundary.
 * The 2D 11x11 matrix is over the same GP29 symbol field used by Cicada.
 * @param {number[]} runes
 * @returns {number[]}
 */
function laplacian(runes) {
  assert.equal(runes.length, side * side);
  return runes.map((rune, i) => {
    const row = Math.floor(i / side);
    const col = i % side;
    let sum = 4 * rune;
    if (row) sum -= runes[i - side];
    if (row < side - 1) sum -= runes[i + side];
    if (col) sum -= runes[i - 1];
    if (col < side - 1) sum -= runes[i + 1];
    return mod(sum);
  });
}

/**
 * Exact sparse-operator GF29 inversion, without a guessed state or key.
 * @param {number[]} runes Original printed ciphertext, 121 symbols.
 * @returns {{plaintext:number[],determinant:number}}
 */
function invertLaplacian(runes) {
  const n = side * side;
  const system = Array.from({length:n}, (_, i) => {
    const row = Math.floor(i / side);
    const col = i % side;
    const entries = Array(n + 1).fill(0);
    entries[i] = 4;
    if (row) entries[i-side] = mod(-1);
    if (row < side - 1) entries[i+side] = mod(-1);
    if (col) entries[i-1] = mod(-1);
    if (col < side - 1) entries[i+1] = mod(-1);
    entries[n] = runes[i];
    return entries;
  });
  let determinant = 1;
  for (let col=0;col<n;col++) {
    let pivot=col;
    while(pivot<n && system[pivot][col]===0) pivot++;
    assert.ok(pivot<n, `singular image Laplacian at column ${col}`);
    if(pivot!==col) {
      [system[pivot],system[col]]=[system[col],system[pivot]];
      determinant=mod(-determinant);
    }
    const factor=system[col][col];
    determinant=mod(determinant*factor);
    const normalized=inverse(factor);
    for(let j=col;j<=n;j++) system[col][j]=mod(system[col][j]*normalized);
    for(let row=0;row<n;row++) {
      if(row===col) continue;
      const scalar=system[row][col];
      if(scalar===0) continue;
      for(let j=col;j<=n;j++) {
        system[row][j]=mod(system[row][j]-scalar*system[col][j]);
      }
    }
  }
  return {plaintext:system.map(row => row[n]), determinant};
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const count=Array(modulus).fill(0);
  for(const symbol of runes) count[symbol]++;
  return count.reduce((total,n)=>total+n*(n-1),0)
    / (runes.length*(runes.length-1));
}

const rows = Array.from({length:side},(_,r)=>C.slice(r*side,(r+1)*side));
assert.equal(rows[0].reduce((total,r)=>total+corpus.prime[r],0),563);
assert.equal(rows.reduce((total,row)=>total+corpus.prime[row[0]],0),569);
const result=invertLaplacian(C);
assert.equal(result.determinant,1);
assert.deepEqual(laplacian(result.plaintext),C);
assert.ok(Math.abs(ioc(C)-0.03415977961432507)<1e-12);
assert.ok(Math.abs(ioc(result.plaintext)-0.032920110192837464)<1e-12);

// Positive source-native known plaintext control, independent of p32 cipher.
const solved = corpus.pages.find(page=>page.page===57).indices;
assert.equal(solved.length,95);
const plant=solved.concat(solved.slice(0,26));
const transformed=laplacian(plant);
assert.deepEqual(invertLaplacian(transformed).plaintext,plant);
const render = runes => runes.map(r=>corpus.translit[r]).join('');
console.log(JSON.stringify({
  original:'original LP2 physical p32 / 49.jpg',
  sourceAxisPrimeSums:[563,569],
  sourceTreeRelationship:'blurred p32 tree / outlined p55 source tree',
  proposedOperator:'4*center-up-down-left-right, zero boundary, GF29',
  determinant:result.determinant,
  originalIoC:ioc(C),
  decodedIoC:ioc(result.plaintext),
  decodedRows:Array.from({length:side},(_,i)=>
    render(result.plaintext.slice(i*side,(i+1)*side))),
  sourceReencrypted:121,
  nativeSolvedPlantRecovered:121,
  authenticUnknownPlaintextRecovered:false
},null,2));
