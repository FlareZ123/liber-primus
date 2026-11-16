#!/usr/bin/env node
'use strict';

// Source-frozen test: p50 outer 76 -> p32 compass walk -> p55 2013 NEXT chain.
// Run from the repository root or from any working directory.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const MOD29 = 29;
const MOD28 = 28;
const mod = (x, n) => ((x % n) + n) % n;
const rune = (i) => corpus.translit[i];

assert.equal(corpus.translit.length, 29);
assert.equal(table.bytes.length, 256);
const tableSha256 = crypto.createHash('sha256').update(Buffer.from(table.bytes)).digest('hex');
assert.equal(tableSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

// The visible HOMEX begins at p32 index 33 = row 3, column 0.
const startCell = 33;
const iv = p32[startCell];
assert.equal(rune(iv), 'H');
assert.equal(p32.slice(startCell, startCell + 5).map(rune).join(''), 'HOMEX');

// The fixed clockwise perimeter of the original 32x8 p50 byte table.
const perimeter = [];
for (let col = 0; col < 8; col++) perimeter.push(col);
for (let row = 1; row < 32; row++) perimeter.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) perimeter.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) perimeter.push(row * 8);
assert.equal(perimeter.length, 76);

// Low three bits choose N, NE, E, SE, S, SW, W, NW; high five bits are distance.
// The walk wraps on the 11x11 p32 rune map.
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
let row = 3;
let col = 0;
const visited = [];
for (const cell of perimeter) {
  const byte = table.bytes[cell];
  const [dr, dc] = directions[byte & 7];
  const distance = byte >> 3;
  row = mod(row + dr * distance, 11);
  col = mod(col + dc * distance, 11);
  visited.push(row * 11 + col);
}
assert.equal(visited.length, 76);
const routeRunes = visited.map((i) => p32[i]);
assert.equal(rune(routeRunes[routeRunes.length - 1]), 'X');
assert.equal(visited[visited.length - 1], 61);
assert.equal(new Set(visited).size, 52);

// Reuse the historical 2013 key-source convention: F is filtered from the key.
// The starting H is the IV; the 76 path runes then yield 75 key symbols.
const fPositions = routeRunes.map((x, i) => x === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(fPositions, [38]);
const filteredKeySymbols = routeRunes.filter((x) => x !== 0);
assert.equal(filteredKeySymbols.length, 75);
assert(filteredKeySymbols.every((x) => x >= 1 && x <= 28));

// The 76 p55 ciphertext symbols generate 76 deltas from H. Exactly one is zero,
// at offset 59 (the repeated TH/TH pair); 75 nonzero transitions consume 75 keys
// when the historical NEXT zero-step convention does not advance the key clock.
let previous = iv;
const p55Deltas = p55.map((current) => {
  const delta = mod(current - previous, MOD29);
  previous = current;
  return delta;
});
const zeroOffsets = p55Deltas.map((d, i) => d === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(zeroOffsets, [59]);
assert.equal(p55Deltas.length - zeroOffsets.length, 75);

// First 29 primes, indexed by the GP rune value exactly as in the local 2013 NEXT SFT.
const primes = [];
for (let n = 2; primes.length < 29; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
const keyFamilies = [
  { name: 'direct-GP-index-minus-one', values: filteredKeySymbols.map((x) => x - 1) },
  { name: 'phi-prime-index', values: filteredKeySymbols.map((x) => mod(primes[x] - 1, MOD28)) },
];

const powMod = (base, exponent, modulus) => {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1;
  }
  return result;
};
const log2 = Array(MOD29).fill(-1);
for (let exponent = 0; exponent < MOD28; exponent++) {
  log2[powMod(2, exponent, MOD29)] = exponent;
}
assert(log2.slice(1).every((x) => x >= 0));

// These are the three sigma families already operationalized in the repository's
// 2013 NEXT-chain SFT: identity, DH2 power-order, and DH2 log-order.
const sigmaFamilies = [
  { name: 'identity', forward: (x) => x, inverse: (x) => x },
  {
    name: 'DH2-power-order',
    forward: (x) => mod(powMod(2, x, MOD29) - 1, MOD29),
    inverse: (x) => log2[x + 1],
  },
  {
    name: 'DH2-log-order',
    forward: (x) => log2[x + 1],
    inverse: (x) => mod(powMod(2, x, MOD29) - 1, MOD29),
  },
];

function decode(cipher, key, sigma, sign, skipZero) {
  let previousCipher = iv;
  let keyPosition = 0;
  let zeroSteps = 0;
  const plain = [];
  for (const current of cipher) {
    const delta = mod(current - previousCipher, MOD29);
    previousCipher = current;
    if (delta === 0) {
      plain.push(28); // GP29 index 28 is EA in this corpus.
      zeroSteps++;
      if (!skipZero) keyPosition++;
    } else {
      if (keyPosition >= key.length) {
        throw new Error('key exhausted at plaintext offset ' + plain.length);
      }
      const q = mod(delta - 1 + sign * key[keyPosition], MOD28);
      const value = sigma.inverse(q);
      assert(value >= 0 && value < MOD28);
      plain.push(value);
      keyPosition++;
    }
  }
  return { plain, used: keyPosition, zeroSteps };
}

function encode(plain, key, sigma, sign, skipZero) {
  let previousCipher = iv;
  let keyPosition = 0;
  const cipher = [];
  for (const value of plain) {
    let delta;
    if (value === 28) {
      delta = 0;
      if (!skipZero) keyPosition++;
    } else {
      if (keyPosition >= key.length) {
        throw new Error('key exhausted at plaintext offset ' + cipher.length);
      }
      delta = 1 + mod(sigma.forward(value) - sign * key[keyPosition], MOD28);
      keyPosition++;
    }
    const current = mod(previousCipher + delta, MOD29);
    cipher.push(current);
    previousCipher = current;
  }
  return { cipher, used: keyPosition };
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

// Synthetic native-GP positive control: 75 source-native non-EA p57 runes plus one
// EA marker. It verifies the zero-step/skip clock without altering source material.
const plant = p57.filter((x) => x !== 28).slice(0, 75).concat([28]);
assert.equal(plant.length, 76);
assert.equal(plant.filter((x) => x === 28).length, 1);

const models = [];
for (const keyFamily of keyFamilies) {
  assert.equal(keyFamily.values.length, 75);
  for (const sigma of sigmaFamilies) {
    for (const sign of [-1, 1]) {
      const decoded = decode(p55, keyFamily.values, sigma, sign, true);
      assert.equal(decoded.used, 75);
      assert.equal(decoded.zeroSteps, 1);
      const reencrypted = encode(decoded.plain, keyFamily.values, sigma, sign, true);
      assert.deepEqual(reencrypted.cipher, p55);
      assert.equal(reencrypted.used, 75);

      const controlCipher = encode(plant, keyFamily.values, sigma, sign, true);
      const controlPlain = decode(controlCipher.cipher, keyFamily.values, sigma, sign, true);
      assert.deepEqual(controlPlain.plain, plant);
      assert.equal(controlCipher.used, 75);
      assert.equal(controlPlain.used, 75);

      models.push({
        keyFamily: keyFamily.name,
        sigma: sigma.name,
        sign,
        used: decoded.used,
        zeroSteps: decoded.zeroSteps,
        ioc: ioc(decoded.plain),
        plaintext: decoded.plain.map(rune).join(' '),
      });
    }
  }
}

const summary = {
  tableByteSha256: tableSha256,
  p50PerimeterLength: perimeter.length,
  p32VisibleMarker: 'HOMEX',
  iv: rune(iv),
  routeLength: routeRunes.length,
  routeEnd: rune(routeRunes[routeRunes.length - 1]),
  routeEndCell: visited[visited.length - 1],
  routeUniqueCells: new Set(visited).size,
  routeFPositions: fPositions,
  filteredKeyLength: filteredKeySymbols.length,
  p55CipherLength: p55.length,
  p55ZeroDeltaOffsetsFromH: zeroOffsets,
  p55KeyConsumptionsWithSkipZero: p55Deltas.length - zeroOffsets.length,
  p55CiphertextIoC: ioc(p55),
  p57PlaintextIoC: ioc(p57),
  modelCount: models.length,
  skipZeroFalseRequiredKeySymbols: p55Deltas.length,
  skipZeroFalseAvailableKeySymbols: filteredKeySymbols.length,
  models: models.sort((a, b) => b.ioc - a.ioc),
};
console.log(JSON.stringify(summary, null, 2));
