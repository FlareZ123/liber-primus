'use strict';
/**
 * Original 2014 sexagesimal.bin vs later LP2 printed table: exactly 10 differing
 * byte readings. Enumerate all 2^10 source-supported mixtures, hashing the
 * literal 256-byte array as a p56 SHA512/SHA3-512/BLAKE2b-512/SHAKE256(64)
 * candidate. This is a source-selected finite preimage gate, not a cipher.
 *
 * SFT: node sims/sexagesimal10_mixed_sha512_gate.cjs
 * Node.js 22, built-in modules only.
 */
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {any} */
function load(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
}
const archive = load('resources/cicada2014-sexagesimal-source.json');
const grid = load('resources/liber-primus/base60-grid.json');
const historical = Buffer.from(archive.binary_hex, 'hex');
const printed = Buffer.from(grid.byte_rows.flat());
const target = archive.p56_target_sha512.toLowerCase();
const differences = [];
const B60 = grid.alphabet;
const algos = ['sha512', 'sha3-512', 'blake2b512', 'shake256'];

assert.equal(historical.length, 256);
assert.equal(printed.length, 256);
assert.equal(target.length, 128);
assert.equal(createHash('sha256').update(historical).digest('hex'),
  archive.source_sha256.binary);
for (let i = 0; i < 256; i++) {
  if (historical[i] !== printed[i]) differences.push(i);
}
assert.deepEqual(differences, [25,45,50,165,170,172,175,182,199,246]);
/** @param {number} n @returns {string} */
function asBase60(n) {
  return B60[Math.floor(n / 60)] + B60[n % 60];
}
const caseChanges = differences.filter(i =>
  asBase60(historical[i]).toLowerCase() ===
  asBase60(printed[i]).toLowerCase());
assert.equal(caseChanges.length, 8);

/**
 * @param {number} mask in [0,2^10).
 * @returns {Buffer}
 */
function mixed(mask) {
  const bytes = Buffer.from(printed);
  for (let j = 0; j < differences.length; j++) {
    if ((mask & (1 << j)) !== 0) {
      const i = differences[j];
      bytes[i] = historical[i];
    }
  }
  return bytes;
}
/** @param {string} algo @param {Buffer} bytes @returns {string} */
function hash(algo, bytes) {
  return createHash(algo, algo === 'shake256' ? {outputLength:64} : undefined)
    .update(bytes).digest('hex');
}
function main() {
  const plantedMask = 731;
  const plantedAlgo = 'blake2b512';
  const plantedTarget = hash(plantedAlgo, mixed(plantedMask));
  const hits = [], planted = [];
  let checked = 0;
  for (let mask = 0; mask < (1 << differences.length); mask++) {
    const data = mixed(mask);
    for (const algorithm of algos) {
      const digest = hash(algorithm, data);
      checked++;
      if (digest === target) hits.push({mask, algorithm});
      if (digest === plantedTarget) planted.push({mask, algorithm});
    }
  }
  assert.deepEqual(planted, [{mask: plantedMask, algorithm: plantedAlgo}]);
  assert.equal(checked, 4096);
  console.log(JSON.stringify({
    test: 'Source-supported ambiguous 2014/LP2 256-byte table SHA preimage',
    originalTableBytes: 256, differingPositions: differences,
    literalCaseOnlyChanges: caseChanges.length,
    candidateBytes: 1024, digestFamilies: algos, digestsChecked: checked,
    p56Target: target, originalHits: hits,
    plantedTargetRecovery: planted,
    conclusion: hits.length ?
      'A digest matches; inspect corresponding original 256-byte preimage.' :
      'None of the 1024 source-supported mixed byte tables hashes to p56 under the four digest families.'
  }, null, 2));
}
main();
