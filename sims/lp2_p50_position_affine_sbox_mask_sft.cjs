'use strict';

/**
 * Complete original p50 index-affine mask gate for a latent byte permutation.
 * SFT: node sims/lp2_p50_position_affine_sbox_mask_sft.cjs
 * Read-only, Node.js 22/Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
assert.equal(grid.alphabet, digits60);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const raw60 = grid.byte_rows.flat();
assert.equal(raw60.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(raw60)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {string[]} encoded @param {string} alphabet @returns {number[]} */
function readBytes(encoded, alphabet) {
  return encoded.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0);
    const n = hi * alphabet.length + lo;
    assert.ok(n >= 0 && n < 256);
    return n;
  });
}
assert.deepEqual(readBytes(tokens, digits60), raw60);
const datasets = [
  {name:'radix60', values:raw60},
  {name:'radix59', values:readBytes(tokens, digits59)},
];

/**
 * Complete 256^2 enumeration for T[i] XOR/ADD ((a*i+b) mod 256).
 * @param {number[]} values
 * @param {'xor'|'add'} operation
 * @returns {{maximumDistinct:number,maximizer:number[],perfectMasks:number,html133331Distinct:number}}
 */
function exhaustive(values, operation) {
  assert.equal(values.length, 256);
  const visits = new Uint16Array(256);
  let maximumDistinct = -1;
  let maximizer = [];
  let perfectMasks = 0;
  let html133331Distinct = 0;
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) {
      visits.fill(0);
      let distinct = 0;
      for (let i = 0; i < 256; i++) {
        const mask = (a * i + b) & 255;
        const value = operation === 'xor' ? values[i] ^ mask : (values[i] + mask) & 255;
        if (visits[value]++ === 0) distinct++;
      }
      if (distinct > maximumDistinct) {
        maximumDistinct = distinct;
        maximizer = [a, b];
      }
      if (distinct === 256) perfectMasks++;
      if (a === 133 && b === 331 % 256) html133331Distinct = distinct;
    }
  }
  return {maximumDistinct, maximizer, perfectMasks, html133331Distinct};
}

/** @param {number[]} values @param {'xor'|'add'} operation @param {number} a @param {number} b */
function unmask(values, operation, a, b) {
  return values.map((v, i) => operation === 'xor' ? v ^ ((a*i+b)&255) : (v+((a*i+b)&255))&255);
}
const countDistinct = seq => new Set(seq).size;
const referencePermutation = Array.from({length:256}, (_,i) => (197*i+17)&255);
assert.equal(countDistinct(referencePermutation),256);
const syntheticXor = unmask(referencePermutation,'xor',81,119);
const syntheticAdd = referencePermutation.map((v,i) => (v-((81*i+119)&255)+256)&255);
assert.deepEqual(unmask(syntheticXor,'xor',81,119),referencePermutation);
assert.deepEqual(unmask(syntheticAdd,'add',81,119),referencePermutation);
assert.ok(exhaustive(syntheticXor,'xor').perfectMasks > 0);
assert.ok(exhaustive(syntheticAdd,'add').perfectMasks > 0);
const observations = [];
for (const source of datasets) {
  for (const operation of ['xor','add']) {
    observations.push({source:source.name,operation,
      originalDistinct:countDistinct(source.values),
      ...exhaustive(source.values,operation)});
  }
}
assert.deepEqual(observations.map(v => [v.source,v.operation,v.maximumDistinct,v.perfectMasks,v.html133331Distinct]), [
  ['radix60','xor',180,0,164],
  ['radix60','add',175,0,166],
  ['radix59','xor',180,0,169],
  ['radix59','add',176,0,163],
]);
console.log(JSON.stringify({originalCells:256, originalPrintedDistinct:new Set(tokens).size,
  testedMasks:256*256*4, observations,
  syntheticPositives:'fully unmasked 256/256 distinct, both XOR and modular addition',
  conclusion:'No source table codec plus index-affine XOR/add mask produces a 256-byte permutation. No plaintext/key recovered.'},null,2));
