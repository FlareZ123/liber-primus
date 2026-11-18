'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));

const tokens = grid.rows.flat();
const base60Alphabet = grid.alphabet;
const base59Alphabet = base60Alphabet.replace('f', '');
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(base60Alphabet.length, 60);
assert.equal(base59Alphabet.length, 59);

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(n > 0);
  let out = n;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    out -= out / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) out -= out / x;
  return out;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} row @param {number} column @returns {number} */
function address(row, column) {
  return row * 8 + column;
}

/**
 * Clockwise perimeter from upper-left, zero-based inclusive bounds.
 * @returns {Array<[number, number]>}
 */
function perimeter(rowMin, rowMax, colMin, colMax) {
  const cells = [];
  for (let col = colMin; col <= colMax; col += 1) cells.push([rowMin, col]);
  for (let row = rowMin + 1; row <= rowMax; row += 1) cells.push([row, colMax]);
  for (let col = colMax - 1; col >= colMin; col -= 1) cells.push([rowMax, col]);
  for (let row = rowMax - 1; row > rowMin; row -= 1) cells.push([row, colMin]);
  return cells;
}

/** @param {number[]} map @param {number} start @param {number} hops */
function walk(map, start, hops) {
  const route = [start];
  let at = start;
  for (let i = 0; i < hops; i += 1) {
    at = map[at];
    route.push(at);
  }
  return route;
}

const dh = {p: 23, g: 5, serverPublic: 8, clientPublic: 19, shared: 2};

const headingLength = 19;
const markerCount = 13;
const selectedRuneGpPrime = 31;
const serverSecret = headingLength - markerCount;
assert.equal(serverSecret, 6);
assert.equal(selectedRuneGpPrime * serverSecret, 186);
assert.equal(modPow(dh.g, serverSecret, dh.p), dh.serverPublic);

const transducerAddress = address(selectedRuneGpPrime, serverSecret);
assert.equal(transducerAddress, 254);
assert.equal(tokens[transducerAddress], '39');
assert.equal(decodeToken(tokens[transducerAddress], base59Alphabet), 186);
assert.equal(decodeToken(tokens[transducerAddress], base60Alphabet), 189);

const start = address(dh.p, dh.shared);
const endpoint = address(dh.p, dh.g);
assert.equal(start, 186);
assert.equal(endpoint, 189);
assert.equal(tokens[start], '0J');
assert.equal(decodeToken(tokens[start], base59Alphabet), dh.clientPublic);
assert.equal(decodeToken(tokens[start], base60Alphabet), dh.clientPublic);

const values59 = tokens.map(token => decodeToken(token, base59Alphabet));
const values60 = tokens.map(token => decodeToken(token, base60Alphabet));
const path59 = walk(values59, start, dh.serverPublic);
const path60 = walk(values60, start, dh.serverPublic);
assert.deepEqual(path59, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.deepEqual(path60, [186, 19, 33, 114, 197, 115, 247, 192, 0]);
assert.equal(path59.at(-1), endpoint);
assert.notEqual(path60.at(-1), endpoint);

const translitIndex = new Map(corpus.translit.map((name, index) => [name, index]));
const mustPrimeSum = ['M', 'U', 'S', 'T'].reduce(
  (sum, name) => sum + corpus.prime[translitIndex.get(name)],
  0
);
assert.equal(mustPrimeSum, 186);
assert.equal(phi(mustPrimeSum), 60);

const rings = [];
for (let depth = 0; depth <= 3; depth += 1) {
  const cells = perimeter(depth, 31 - depth, depth, 7 - depth);
  rings.push({
    depth,
    rows: 32 - 2 * depth,
    columns: 8 - 2 * depth,
    addresses: cells.map(([row, column]) => address(row, column)),
  });
}
assert.deepEqual(rings.map(ring => ring.addresses.length), [76, 68, 60, 52]);

const containingBoth = rings.filter(
  ring => ring.addresses.includes(start) && ring.addresses.includes(endpoint)
);
assert.deepEqual(containingBoth.map(ring => ring.depth), [dh.shared]);

const selectedRing = containingBoth[0];
assert.equal(selectedRing.rows, 28);
assert.equal(selectedRing.columns, 4);
assert.equal(selectedRing.addresses.length, phi(mustPrimeSum));
assert.equal(selectedRing.addresses.length, base60Alphabet.length);

const startPosition = selectedRing.addresses.indexOf(start);
const endpointPosition = selectedRing.addresses.indexOf(endpoint);
assert.equal(startPosition, 39);
assert.equal(endpointPosition, 24);

const clockwise = (
  endpointPosition - startPosition + selectedRing.addresses.length
) % selectedRing.addresses.length;
const counterclockwise = (
  startPosition - endpointPosition + selectedRing.addresses.length
) % selectedRing.addresses.length;
const ringDistance = Math.min(clockwise, counterclockwise);
assert.deepEqual([clockwise, counterclockwise], [45, 15]);
assert.equal(ringDistance, 15);

const clientSecrets = [];
for (let exponent = 0; exponent < dh.p - 1; exponent += 1) {
  if (modPow(dh.g, exponent, dh.p) === dh.clientPublic) clientSecrets.push(exponent);
}
assert.deepEqual(clientSecrets, [15]);
assert.equal(ringDistance, clientSecrets[0]);
assert.equal(modPow(dh.g, ringDistance, dh.p), dh.clientPublic);
assert.equal(modPow(dh.serverPublic, ringDistance, dh.p), dh.shared);

const longArc = Math.max(clockwise, counterclockwise);
assert.equal(modPow(dh.g, longArc, dh.p), 5);
assert.notEqual(modPow(dh.g, longArc, dh.p), dh.clientPublic);

console.log(JSON.stringify({
  status: 'PASS: source-constrained DH client-secret circumference closure',
  dh: {...dh, serverSecret, clientSecret: ringDistance},
  p27: {
    headingLength,
    markerCount,
    markerSelectedGpPrime: selectedRuneGpPrime,
    residualRuneCount: serverSecret,
    productClosure: selectedRuneGpPrime * serverSecret,
  },
  transducer: {
    address: transducerAddress,
    token: tokens[transducerAddress],
    base59: decodeToken(tokens[transducerAddress], base59Alphabet),
    base60: decodeToken(tokens[transducerAddress], base60Alphabet),
    base59PointerPath: path59,
    base60ControlPath: path60,
  },
  shedding: {
    ringLengths: rings.map(ring => ring.addresses.length),
    uniqueDepthContainingBothDhAddresses: selectedRing.depth,
    selectedDimensions: [selectedRing.rows, selectedRing.columns],
    selectedCircumference: selectedRing.addresses.length,
    phiMust: phi(mustPrimeSum),
    base60AlphabetLength: base60Alphabet.length,
  },
  exposedDhCoordinates: {
    start: {address: start, row: 23, column: 2, ringPosition: startPosition},
    endpoint: {address: endpoint, row: 23, column: 5, ringPosition: endpointPosition},
    arcLengths: [clockwise, counterclockwise],
    geodesic: ringDistance,
  },
  verification: {
    clientDiscreteLogsMod22: clientSecrets,
    gPowRecoveredSecret: modPow(dh.g, ringDistance, dh.p),
    serverPublicPowRecoveredSecret: modPow(dh.serverPublic, ringDistance, dh.p),
  },
}, null, 2));
