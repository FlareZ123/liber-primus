'use strict';

/**
 * PARABLE 2013 metadata and 2014 p57 four-clause DH reconstruction.
 * Run from repository root: node sims/lp2_p57_parable_dh85_source_sft.cjs
 * Source-only math; no guessed LP2 unknown plaintext or ciphertext fit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = (index) => corpus.pages.find((p) => p.page === index);
const p55 = page(55), p56 = page(56), p57 = page(57);
assert.deepEqual([p55.runic_count ?? p55.indices.length, p56.runic_count ?? p56.indices.length,
  p57.runic_count ?? p57.indices.length], [76, 85, 95]);
const clauses = [[0, 7], [7, 37], [37, 67], [67, 95]];
const sums = clauses.map(([start, end]) => p57.indices.slice(start, end)
  .reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(sums, [449, 1259, 1031, 1229]);
assert.equal(sums.slice(1).reduce((product, value) => product * value, 1), 1595277641);

/** @param {number} x @param {number} e @param {number} mod @returns {number} */
function powMod(x, e, mod) {
  let result = 1;
  for (let base = x % mod, exponent = e; exponent > 0; exponent = Math.floor(exponent / 2), base = base * base % mod) {
    if (exponent % 2 === 1) result = result * base % mod;
  }
  return result;
}
/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}
/**
 * Small historical DH modulus allows a complete deterministic discrete-log scan.
 * @param {number} p @param {number} g @param {number} target
 * @returns {{log:number|null,order:number}}
 */
function discreteLog(p, g, target) {
  let value = 1, first = null, order = 0;
  for (let exponent = 0; exponent < p; exponent++) {
    if (value === target && first === null) first = exponent;
    value = value * g % p;
    if (value === 1) { order = exponent + 1; break; }
  }
  assert.ok(order > 0);
  return { log: first, order };
}

// Positive control is Cicada's signed 2013 DH 23 worked tuple:
// p=23, g=5, a=6, A=8, b=15, B=19, shared key=2.
assert.equal(powMod(5, 6, 23), 8);
assert.equal(powMod(5, 15, 23), 19);
assert.equal(powMod(8, 15, 23), 2);
assert.equal(powMod(19, 6, 23), 2);

// Natural printed order: title=B, three body clauses=[p,g,A].
const [B, p, g, A] = sums;
assert.ok(prime(p) && prime(g) && prime(A));
assert.ok(0 < g && g < p && 0 < A && A < p && 0 < B && B < p);
const server = discreteLog(p, g, A), client = discreteLog(p, g, B);
assert.deepEqual(server, { log: 85, order: 629 });
assert.deepEqual(client, { log: 349, order: 629 });
assert.equal(server.log, p56.indices.length); // Independent solved-page rune count.
const sharedServer = powMod(B, server.log, p);
const sharedClient = powMod(A, client.log, p);
assert.equal(sharedServer, 352);
assert.equal(sharedClient, 352);
console.log(JSON.stringify({
  sourceClauses:sums,
  signed2013Metadata:1595277641,
  auth2013DH23Shared:2,
  inferredPacket:{p,g,serverPublic:A,clientPublic:B,groupOrder:server.order,
    serverExponent:server.log,clientExponent:client.log,sharedSecret:sharedServer},
  adjacentSolvedP56OriginalRunes:p56.indices.length,
  newUnknownPlaintextRecovered:false,
  interpretation:'source-typed hypothesis; DH mode and intended consumer not author-authenticated'
},null,2));
