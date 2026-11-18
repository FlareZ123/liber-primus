'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const primeEcho = fs.readFileSync(
  path.join(root, 'resources', 'historical', 'cicada2013-os-original-prime-echo.sh'),
  'utf8'
);
const live = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'external', '2013-tcp-live-test-vectors.json'),
  'utf8'
));

function modPow(base, exponent, modulus) {
  let result = 1n;
  let b = BigInt(base) % BigInt(modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

function multiplicativeOrder(base, modulus) {
  let value = 1;
  for (let exponent = 1; exponent < modulus; exponent += 1) {
    value = (value * base) % modulus;
    if (value === 1) return exponent;
  }
  throw new Error('order not found');
}

const specialLines = primeEcho
  .split(/\r?\n/)
  .filter((line) => line.includes('sleep 2'));
const special = specialLines.map((line) => {
  const match = line.match(/\d+/);
  assert.ok(match);
  return Number(match[0]);
});
assert.deepEqual(special, [1033, 3301]);
assert.ok(specialLines[1].includes('3301'));
assert.equal(primeEcho.trimEnd().split(/\r?\n/).at(-1), specialLines[1]);

const observed = live.sources.find(
  (source) => source.role === 'full participant server transcript of a later Cicada test'
).observed;

assert.equal(observed.dhModulus, 3301);
assert.equal(observed.serverSelectedBase, 2757);
assert.equal(observed.serverSelectedSecret, 331);
assert.equal(observed.serverPublic, 1264);
assert.equal(observed.clientPublic, 2800);
assert.equal(observed.sharedKeyReturned, 1067);

const p = observed.dhModulus;
const g = observed.serverSelectedBase;
const a = observed.serverSelectedSecret;
const A = observed.serverPublic;
const B = observed.clientPublic;
const K = observed.sharedKeyReturned;

assert.equal(modPow(g, a, p), A);
assert.equal(modPow(B, a, p), K);

const order = multiplicativeOrder(g, p);
assert.equal(order, 550);
assert.equal(multiplicativeOrder(A, p), 550);

const residues = [];
for (let exponent = 0; exponent < order; exponent += 1) {
  if (modPow(g, exponent, p) === B) residues.push(exponent);
}
assert.deepEqual(residues, [11]);

const representatives = [];
for (let exponent = 1; exponent < p; exponent += 1) {
  if (modPow(g, exponent, p) === B) representatives.push(exponent);
}
assert.deepEqual(representatives, [11, 561, 1111, 1661, 2211, 2761]);
assert.ok(representatives.every((exponent) => modPow(A, exponent, p) === K));

console.log(JSON.stringify({
  status: 'PASS',
  primeEcho: {
    specialTwoSecondValues: special,
    terminalValue: 3301,
  },
  liveDh3301: {
    modulus: p,
    base: g,
    serverSecret: a,
    serverPublic: A,
    clientPublic: B,
    sharedValue: K,
    baseOrder: order,
    clientExponentClass: '11 mod 550',
    ordinaryRangeRepresentatives: representatives,
  },
  decision:
    '3301 is independently player-visible in prime_echo and the live DH request, ' +
    'but the live shared value depends on participant-selected DH state and the ' +
    'client exponent is not unique in the ordinary range. No LP2 receiver follows.',
}, null, 2));
