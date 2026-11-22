'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const responsePath = path.join(root, 'resources', 'external', '2014-stage10-post-square-response.html');
const dhPath = path.join(root, 'resources', 'external', '2013-tcp-server-signed-source.md');

const response = fs.readFileSync(responsePath, 'utf8');
const dhSource = fs.readFileSync(dhPath, 'utf8');

/** @param {number} x @param {number} m @returns {number} */
function mod(x, m) {
  return ((x % m) + m) % m;
}

/** @param {number} base @param {number} value @param {number} prime @returns {number} */
function discreteLog(base, value, prime) {
  let x = 1;
  for (let exponent = 0; exponent < prime - 1; exponent++) {
    if (x === value) return exponent;
    x = mod(x * base, prime);
  }
  throw new Error(`No discrete log for ${value} base ${base} mod ${prime}`);
}

const imageIds = [...response.matchAll(/src="\/(\d+)\.jpg"/g)].map(match => Number(match[1]));
assert.deepEqual(imageIds, [107, 167, 229]);

const p = 23;
const residues = imageIds.map(value => value % p);
assert.deepEqual(residues, [15, 6, 22]);

assert.match(dhSource, /server base 5 and public share 8, client public share 19, shared key 2/i);
const serverExponent = discreteLog(5, 8, p);
const clientExponent = discreteLog(5, 19, p);
const groupOrder = p - 1;
assert.deepEqual([serverExponent, clientExponent, groupOrder], [6, 15, 22]);
assert.deepEqual(residues, [clientExponent, serverExponent, groupOrder]);
assert.notDeepEqual(residues, [serverExponent, clientExponent, groupOrder]);

const lp2Labels = Array.from({ length: 58 }, (_, i) => i);
const signature = residues.join(',');
const consecutiveHits = [];
for (let i = 0; i + 2 < lp2Labels.length; i++) {
  const triple = lp2Labels.slice(i, i + 3);
  if (triple.map(value => value % p).join(',') === signature) consecutiveHits.push(triple);
}
assert.deepEqual(consecutiveHits, []);

const increasingHits = [];
for (let a = 0; a < lp2Labels.length - 2; a++) {
  for (let b = a + 1; b < lp2Labels.length - 1; b++) {
    for (let c = b + 1; c < lp2Labels.length; c++) {
      const triple = [lp2Labels[a], lp2Labels[b], lp2Labels[c]];
      if (triple.map(value => value % p).join(',') === signature) increasingHits.push(triple);
    }
  }
}
assert.equal((58 * 57 * 56) / 6, 30856);
assert.deepEqual(increasingHits, [[15, 29, 45]]);

console.log(JSON.stringify({
  stage10ImageIds: imageIds,
  stage10ResiduesMod23: residues,
  signedDhDerivedRoleOrder: {
    serverExponent,
    clientExponent,
    groupOrder,
    sourceVisiblePublicOrder: ['serverPublic=8', 'clientPublic=19']
  },
  responseResidueRoleOrder: ['clientExponent=15', 'serverExponent=6', 'groupOrder=22'],
  unmatchedLp2NumericLabelControls: {
    consecutiveTriples: 56,
    exactConsecutiveSignatureHits: consecutiveHits.length,
    increasingTriples: 30856,
    exactIncreasingSignatureHits: increasingHits
  }
}, null, 2));

console.log('PASS: exact Stage10 (15,6,22) residue match; DH role order is not source-supported.');
