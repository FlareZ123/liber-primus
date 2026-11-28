'use strict';

const assert = require('node:assert/strict');

const GP29 = 29;
const BASE29_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRS';

// State recovered from p15 original-artifact relations before this source lookup.
const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
  F: 0
});

const grid = Object.freeze([
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
]);

/** @param {number} n @param {number} m */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/** @param {number} a @param {number} m */
function invMod(a, m) {
  for (let x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) return x;
  }
  throw new Error('no inverse');
}

/** @param {number} n */
function base29Digits(n) {
  assert(Number.isSafeInteger(n) && n >= 0);
  if (n === 0) return [0];
  const out = [];
  for (let x = n; x > 0; x = Math.floor(x / GP29)) out.push(x % GP29);
  return out.reverse();
}

/** @param {number} n */
function base29String(n) {
  return base29Digits(n).map(x => BASE29_ALPHABET[x]).join('');
}

/** @param {number} base @param {number} target @param {number} p */
function discreteLogs(base, target, p) {
  const out = [];
  for (let x = 1; x < p; x++) {
    let v = 1;
    for (let i = 0; i < x; i++) v = mod(v * base, p);
    if (v === target) out.push(x);
  }
  return out;
}

function main() {
  // Authenticated 2013 TCP protocol worked DH example:
  // C: DH 23
  // S: 01 OK 5 8
  // C: 19
  // S: 03 DATA 2
  assert.deepEqual(
    [state.p, state.g, state.A, state.B, state.K],
    [23, 5, 8, 19, 2]
  );
  assert.deepEqual(discreteLogs(state.g, state.A, state.p), [state.a]);
  assert.deepEqual(discreteLogs(state.g, state.B, state.p), [state.b]);
  assert.equal(Number(BigInt(state.B) ** BigInt(state.a) % BigInt(state.p)), state.K);

  const bInv29 = invMod(state.B, GP29);
  assert.equal(bInv29, 26);
  assert.equal(mod(-state.g, GP29), 24);

  // Independent red-cell/Base29 consequence.
  const red = 3299;
  const redDigits = base29Digits(red);
  const expectedRedDigits = [state.e, bInv29, state.p - 1];
  assert.deepEqual(redDigits, expectedRedDigits);
  assert.equal(base29String(red), '3QM');

  // The already-derived shared key bridges the red LP2 value to Cicada's name.
  assert.equal(red + state.K, 3301);
  assert.equal(state.p - 1 + state.K, mod(-state.g, GP29));

  // Authenticated source's separate BASE29 worked example.
  const cicadaDigits = base29Digits(3301);
  const expectedCicadaDigits = [state.e, bInv29, mod(-state.g, GP29)];
  assert.deepEqual(cicadaDigits, expectedCicadaDigits);
  assert.equal(base29String(3301), '3QO');

  // Finite original-grid check: the exact red state serialization is unique.
  const hits = [];
  const plusKeyHits = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const n = grid[r][c];
      if (JSON.stringify(base29Digits(n)) === JSON.stringify(expectedRedDigits)) {
        hits.push({r, c, n});
      }
      if (n + state.K === 3301) plusKeyHits.push({r, c, n});
    }
  }
  assert.deepEqual(hits, [{r: 1, c: 1, n: 3299}]);
  assert.deepEqual(plusKeyHits, [{r: 1, c: 1, n: 3299}]);

  console.log(JSON.stringify({
    schema: 'lp2-p15-signed-2013-tcp-dual-example-v1',
    state,
    signedDhExample: {
      transcript: ['DH 23', '01 OK 5 8', '19', '03 DATA 2'],
      exactPublicMatch: true,
      uniqueServerSecret: state.a,
      uniqueClientSecret: state.b
    },
    redCell: {
      decimal: red,
      base29: base29String(red),
      digits: redDigits,
      stateReadout: ['e', 'B^-1 mod29', 'p-1'],
      plusK: red + state.K
    },
    signedBase29Example: {
      input: 3301,
      output: base29String(3301),
      digits: cicadaDigits,
      stateReadout: ['e', 'B^-1 mod29', '-g mod29']
    },
    gridExactSerializationHits: hits,
    gridPlusKeyTo3301Hits: plusKeyHits
  }, null, 2));
}

if (require.main === module) main();

module.exports = {base29Digits, base29String, invMod, discreteLogs};
