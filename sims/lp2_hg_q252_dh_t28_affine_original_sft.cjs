#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = process.cwd();
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.deepEqual(grid.pages.map(page => page.bytes.length), [80, 104, 72]);
const byteHash = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(byteHash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mod = (x, m) => ((x % m) + m) % m;
function inverse(a, m) {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  throw new Error('No modular inverse');
}
const divisor = [12, 17, 11, 21, 23]; // descending coefficients of H2013 * Gp39
const remainder = bytes.map(value => value % 29);
const quotient = [];
const invLead = inverse(divisor[0], 29);
for (let i = 0; i < 252; i++) {
  const q = mod(remainder[i] * invLead, 29);
  quotient.push(q);
  for (let j = 0; j < divisor.length; j++) remainder[i + j] = mod(remainder[i + j] - q * divisor[j], 29);
}
assert.equal(quotient.length, 252);
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 20), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);

const pages = corpus.pages;
const ciphertext = pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const p57 = pages.find(page => page.page === 57).indices;
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(ciphertext.length, 12956);
assert.equal(p57.length, 95);
assert.equal(p57.filter(value => value === 0).length, 3);
assert.deepEqual(
  Array.from({ length: 9 }, (_, s) => new Set(quotient.slice(28 * s, 28 * s + 28)).size),
  [16, 19, 21, 16, 19, 16, 18, 17, 22]
);

const T = x => mod(24 - 2 * x, 29);
const powers = Array.from({ length: 29 }, (_, x) => {
  const row = [x];
  for (let k = 1; k < 28; k++) row.push(T(row[k - 1]));
  return row;
});
assert.equal(T(8), 8);
assert.equal(T(0), 24);
for (let x = 0; x < 29; x++) {
  let y = x;
  for (let k = 0; k < 28; k++) y = T(y);
  assert.equal(y, x);
  if (x !== 8) assert.equal(new Set(powers[x]).size, 28);
}
const applyPower = (x, k) => powers[x][mod(k, 28)];

function transformBook(input, sign) {
  assert.equal(input.length, 12956);
  const output = [];
  let offset = 0;
  for (let s = 0; s < 9; s++) {
    for (let i = 0; i < chapterLengths[s]; i++) {
      const k = quotient[28 * s + (i % 28)] % 28;
      output.push(applyPower(input[offset + i], sign * k));
    }
    offset += chapterLengths[s];
  }
  assert.equal(offset, input.length);
  return output;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function prefix(values, count = 60) {
  return values.slice(0, count).map(value => corpus.translit[value]).join(' ');
}

const decodedMinus = transformBook(ciphertext, -1);
const decodedPlus = transformBook(ciphertext, 1);
assert.deepEqual(transformBook(decodedMinus, 1), ciphertext);
assert.deepEqual(transformBook(decodedPlus, -1), ciphertext);
const iocMinus = ioc(decodedMinus);
const iocPlus = ioc(decodedPlus);
assert.ok(Math.abs(iocMinus - 0.03447243998599184) < 1e-12);
assert.ok(Math.abs(iocPlus - 0.03447035472851199) < 1e-12);

// Full-length positive control for the always-consuming model.
const directPlant = Array.from({ length: 12956 }, (_, i) => p57[i % p57.length]);
assert.deepEqual(transformBook(transformBook(directPlant, 1), -1), directPlant);

// Solved-p56 literal-F bypass: at ciphertext F, retain the literal,
// nonconsuming branch and any ordinary inverse that yields a non-F rune.
function phaseDP(cipher, keyRow, starts) {
  let states = new Set(starts);
  let firstDead = null;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Set();
    for (const phase of states) {
      if (c === 0) next.add(phase);
      const plain = applyPower(c, -keyRow[phase]);
      if (plain !== 0) next.add((phase + 1) % 28);
    }
    states = next;
    if (states.size === 0) { firstDead = i; break; }
  }
  return { firstDead, remaining: [...states].sort((a, b) => a - b) };
}
const fixedDead = [], allDead = [], fBypassResults = [];
let offset = 0;
for (let s = 0; s < 9; s++) {
  const chunk = ciphertext.slice(offset, offset + chapterLengths[s]);
  const keyRow = quotient.slice(28 * s, 28 * s + 28);
  const fixed = phaseDP(chunk, keyRow, [0]);
  const all = phaseDP(chunk, keyRow, Array.from({ length: 28 }, (_, i) => i));
  assert.equal(fixed.remaining.length, 0);
  assert.equal(all.remaining.length, 0);
  fixedDead.push(fixed.firstDead);
  allDead.push(all.firstDead);
  fBypassResults.push({
    chapter: s + 1,
    phaseZeroFirstImpossible1Based: fixed.firstDead + 1,
    anyPhaseFirstImpossible1Based: all.firstDead + 1
  });
  offset += chapterLengths[s];
}
assert.deepEqual(fixedDead, [34, 5, 44, 63, 4, 1, 39, 61, 37]);
assert.deepEqual(allDead, [341, 159, 154, 179, 162, 183, 123, 103, 157]);

// Positive control: known literal-F positions preserve the true phase.
function encryptBypass(plain, keyRow) {
  let phase = 0;
  const cipher = [], literalF = [];
  for (const value of plain) {
    if (value === 0) { cipher.push(0); literalF.push(true); }
    else { cipher.push(applyPower(value, keyRow[phase % 28])); literalF.push(false); phase++; }
  }
  return { cipher, literalF, endingPhase: phase % 28 };
}
function decryptKnownBypass(cipher, literalF, keyRow) {
  let phase = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (literalF[i]) { assert.equal(cipher[i], 0); plain.push(0); }
    else {
      const value = applyPower(cipher[i], -keyRow[phase % 28]);
      assert.notEqual(value, 0);
      plain.push(value);
      phase++;
    }
  }
  return { plain, endingPhase: phase % 28 };
}
const bypassPlants = [];
for (let s = 0; s < 9; s++) {
  const plain = Array.from({ length: chapterLengths[s] }, (_, i) => p57[i % p57.length]);
  const keyRow = quotient.slice(28 * s, 28 * s + 28);
  const encrypted = encryptBypass(plain, keyRow);
  const recovered = decryptKnownBypass(encrypted.cipher, encrypted.literalF, keyRow);
  assert.deepEqual(recovered.plain, plain);
  assert.equal(recovered.endingPhase, encrypted.endingPhase);
  const reachable = phaseDP(encrypted.cipher, keyRow, [0]).remaining;
  assert.ok(reachable.includes(encrypted.endingPhase));
  bypassPlants.push({
    chapter: s + 1,
    runes: plain.length,
    literalFCount: encrypted.literalF.filter(Boolean).length,
    trueEndingPhase: encrypted.endingPhase
  });
}

console.log(JSON.stringify({
  classification: 'bounded negative; no unknown plaintext or authentic key',
  byteSha256: byteHash,
  quotientLength: quotient.length,
  quotientHead: quotient.slice(0, 20),
  zeroRemainder: remainder.slice(252),
  chapterLengths,
  originalRunes: ciphertext.length,
  direct: [
    { inverse: 'T^-k', ioc: iocMinus, prefix: prefix(decodedMinus) },
    { inverse: 'T^+k', ioc: iocPlus, prefix: prefix(decodedPlus) }
  ],
  originalFBypassFirstImpossible: fBypassResults,
  allFBypassStartingPhasesFail: true,
  positiveControls: {
    directPlantRoundTripRunes: directPlant.length,
    literalFBypassChapterPlants: bypassPlants
  }
}, null, 2));
