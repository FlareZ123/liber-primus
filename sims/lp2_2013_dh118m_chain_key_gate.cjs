#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/liber-primus/lp2-grid-256.json"), "utf8"));

const P = 118818811n;
const G = 5n;
const K = 8686271n;
const MOD28 = 28n;
const FACTORS_P_MINUS_1 = [2n, 3n, 5n, 11n, 257n, 467n];

function modN(x, m) { return ((x % m) + m) % m; }
function modB(x, m) { return ((x % m) + m) % m; }
function powMod(base, exponent, modulus) {
  let b = modB(base, modulus), e = exponent, out = 1n;
  while (e > 0n) {
    if ((e & 1n) !== 0n) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return out;
}
function multiplicativeOrder(a, modulus) {
  let order = modulus - 1n;
  for (const q of FACTORS_P_MINUS_1) {
    while (order % q === 0n && powMod(a, order / q, modulus) === 1n) order /= q;
  }
  return order;
}
function ioc(values, alphabetSize) {
  const n = values.length;
  if (n < 2) return 0;
  const counts = Array(alphabetSize).fill(0);
  for (const value of values) counts[value]++;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return alphabetSize * numerator / (n * (n - 1));
}
function advance(state) { return (state * G) % P; }

// Synthetic encoder: EA(28) emits step 0; otherwise step=1+(p+key) mod 28;
// ciphertext is the cumulative step modulo 29.
function encryptSynthetic(plain, consumeAtZero) {
  let state = K, previous = 0;
  const cipher = [];
  for (const value of plain) {
    let step;
    if (value === 28) {
      step = 0;
      if (consumeAtZero) state = advance(state);
    } else {
      const key = Number(state % MOD28);
      step = 1 + modN(value + key, 28);
      state = advance(state);
    }
    previous = modN(previous + step, 29);
    cipher.push(previous);
  }
  return cipher;
}
function decryptSynthetic(cipher, consumeAtZero, sign) {
  let state = K, previous = 0;
  const plain = [];
  for (const current of cipher) {
    const step = modN(current - previous, 29);
    if (step === 0) {
      plain.push(28);
      if (consumeAtZero) state = advance(state);
    } else {
      const key = Number(state % MOD28);
      plain.push(modN(step - 1 + sign * key, 28));
      state = advance(state);
    }
    previous = current;
  }
  return plain;
}
function decryptCorpus(cipher, consumeAtZero, sign, translit) {
  let state = K, previous = cipher[0];
  const plain = [], nonzeroPlain = [];
  let zeroSteps = 0, keyConsumed = 0;
  for (let i = 1; i < cipher.length; i++) {
    const step = modN(cipher[i] - previous, 29);
    if (step === 0) {
      zeroSteps++;
      plain.push(28);
      if (consumeAtZero) { state = advance(state); keyConsumed++; }
    } else {
      const key = Number(state % MOD28);
      const value = modN(step - 1 + sign * key, 28);
      plain.push(value);
      nonzeroPlain.push(value);
      state = advance(state);
      keyConsumed++;
    }
    previous = cipher[i];
  }
  return {
    sign, consumeAtZero, keyConsumed, zeroSteps,
    nonzeroCount: nonzeroPlain.length,
    ioc28: ioc(nonzeroPlain, 28),
    distinct28: new Set(nonzeroPlain).size,
    sample: plain.slice(0, 96).map(value => translit[value]).join("")
  };
}

const pages = corpus.pages.filter(page => page.page <= 55).sort((a, b) => a.page - b.page);
assert.equal(pages.length, 56);
const cipher = pages.flatMap(page => page.indices);
assert.equal(cipher.length, 12956);
const differences = cipher.slice(1).map((value, i) => modN(value - cipher[i], 29));
const zeroSteps = differences.filter(value => value === 0).length;
assert.equal(zeroSteps, 86);

const syntheticPlain = Array.from({ length: 400 }, (_, i) => i % 29);
for (const consumeAtZero of [true, false]) {
  const recovered = decryptSynthetic(encryptSynthetic(syntheticPlain, consumeAtZero), consumeAtZero, -1);
  assert.deepEqual(recovered, syntheticPlain);
}

const chainVariants = [];
for (const sign of [-1, 1]) {
  for (const consumeAtZero of [true, false]) {
    chainVariants.push(decryptCorpus(cipher, consumeAtZero, sign, corpus.translit));
  }
}

const orderG = multiplicativeOrder(G, P);
const orderK = multiplicativeOrder(K, P);
assert.equal(orderG, 59409405n);
assert.equal(orderK, 720114n);

const hG = powMod(G, (P - 1n) / 257n, P);
const hK = powMod(K, orderK / 257n, P);
assert.equal(powMod(hG, 257n, P), 1n);
assert.equal(powMod(hK, 257n, P), 1n);
assert.notEqual(hG, 1n);
assert.notEqual(hK, 1n);

const tableTokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tableTokens.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]), low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "invalid p50 token: " + token);
  return high * alphabet.length + low;
}
const tableValues = {
  base60: tableTokens.map(token => decodeToken(token, alphabet60)),
  base59: tableTokens.map(token => decodeToken(token, alphabet59))
};
const tableUnique = {
  base60: new Set(tableValues.base60).size,
  base59: new Set(tableValues.base59).size
};
const cycleTests = [];
for (const [rootName, root] of [["g", hG], ["K", hK]]) {
  for (const offset of [0, 1]) {
    const projected = Array.from({ length: 256 }, (_, i) =>
      Number(powMod(root, BigInt(i + offset), P) % 256n)
    );
    for (const [radix, observed] of Object.entries(tableValues)) {
      let matches = 0;
      for (let i = 0; i < 256; i++) if (projected[i] === observed[i]) matches++;
      cycleTests.push({ root: rootName, offset, radix, exactPositionMatches: matches });
    }
  }
}
const maxCycleMatches = Math.max(...cycleTests.map(test => test.exactPositionMatches));

console.log(JSON.stringify({
  dhCandidate: {
    p: String(P), g: String(G), sharedSecret: String(K),
    pMinus1Factorization: "2 * 3^2 * 5 * 11 * 257 * 467",
    orderOfG: String(orderG), orderOfSharedSecret: String(orderK)
  },
  corpus: {
    pages: pages.length, runes: cipher.length,
    adjacentDifferences: differences.length,
    zeroSteps, nonzeroSteps: differences.length - zeroSteps
  },
  syntheticPositiveControls: "PASS: both EA key-consumption conventions recover 400/400 symbols",
  chainVariants: chainVariants.map(result => ({
    decryptOrientation: result.sign === -1 ? "subtract key" : "add key",
    consumeKeyAtEA: result.consumeAtZero,
    keySymbolsConsumed: result.keyConsumed,
    zeroStepsMappedToEA: result.zeroSteps,
    nonzeroPlainSymbols: result.nonzeroCount,
    distinctNonzeroSymbols: result.distinct28,
    IoC28: Number(result.ioc28.toFixed(9)),
    sample: result.sample
  })),
  p50Direct257CycleProjection: {
    tableUniqueValues: tableUnique,
    maximumExactPositionMatches: maxCycleMatches,
    tests: cycleTests
  }
}, null, 2));
