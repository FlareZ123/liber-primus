'use strict';
/**
 * Source-constrained composition test:
 *   - central row of the original 2014 Stage10 7x7/1033 square, transformed by Euler phi modulo 29;
 *   - exact row-wise seven-character Stage05 permutation, key 1736254.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_cuneiform_p36_stage05_phi_composition_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const squareBytes = fs.readFileSync(path.join(__dirname, '..', 'resources', 'cicada2014-openpuff-magic-squares.txt'));
assert.equal(squareBytes.length, 745);
assert.equal(crypto.createHash('sha256').update(squareBytes).digest('hex'), '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const rows = squareBytes.toString('ascii').split(/\r?\n/).filter(line => /\d/.test(line)).map(line => [...line.matchAll(/\d+/g)].map(match => Number(match[0])));
const square = rows.slice(5, 12);
assert.equal(square.length, 7);
assert.ok(square.every(row => row.length === 7 && row.reduce((sum, value) => sum + value, 0) === 1033));
function phi(n) {
  let q = n, result = n;
  for (let p = 2; p * p <= q; p++) {
    if (q % p !== 0) continue;
    while (q % p === 0) q /= p;
    result -= result / p;
  }
  if (q > 1) result -= result / q;
  return result;
}
const key = square[3].map(value => phi(value) % 29);
assert.deepEqual(key, [8, 19, 14, 11, 14, 19, 8]);
const page = n => corpus.pages.find(item => item.page === n).indices;
const cipher = page(36), plainControl = page(57);
assert.equal(cipher.length, 238);
assert.equal(cipher.length % 7, 0);
assert.equal(cipher.filter(value => value === 0).length, 8);
assert.equal(plainControl.length, 95);
const STAGE05_KEY = '1736254';
const { decode: stage05Decode, encode: stage05Encode } = require('./stage5_original_outguess_columnar_sft.cjs');
const pack = symbols => symbols.map(value => String.fromCharCode(0xE000 + value)).join('');
const unpack = text => [...text].map(character => character.charCodeAt(0) - 0xE000);
const transposeDecode = symbols => unpack(stage05Decode(pack(symbols), STAGE05_KEY));
const transposeEncode = symbols => unpack(stage05Encode(pack(symbols), STAGE05_KEY));
assert.deepEqual(transposeDecode(transposeEncode(cipher)), cipher);
const mod29 = value => (value % 29 + 29) % 29;
function inverse(ciphertext, shifts, sign) {
  let states = new Map([[0, [[]]]]);
  for (let i = 0; i < ciphertext.length; i++) {
    const following = new Map();
    const add = (phase, sequence) => {
      if (!following.has(phase)) following.set(phase, []);
      following.get(phase).push(sequence);
    };
    for (const [phase, sequences] of states) for (const sequence of sequences) {
      if (ciphertext[i] === 0) add(phase, sequence.concat(0));
      const candidate = mod29(ciphertext[i] - sign * shifts[phase]);
      if (candidate !== 0) add((phase + 1) % shifts.length, sequence.concat(candidate));
    }
    if (following.size === 0) return { firstImpossible: i, paths: [] };
    states = following;
  }
  return { firstImpossible: null, paths: [...states.values()].flat() };
}
function encrypt(plaintext, shifts, sign) {
  let phase = 0;
  return plaintext.map(value => {
    if (value === 0) return 0;
    const result = mod29(value + sign * shifts[phase]);
    phase = (phase + 1) % shifts.length;
    return result;
  });
}
function same(a, b) { return a.length === b.length && a.every((value, i) => value === b[i]); }
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (symbols.length * (symbols.length - 1));
}
const quadgramText = fs.readFileSync(path.join(__dirname, '..', 'resources', 'control', 'duko_round27_english_quadgrams.txt'), 'utf8');
const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of quadgramText.split(/\r?\n/)) {
  const match = line.match(/^([A-Z]{4})\s+(\d+)/);
  if (!match) continue;
  const count = Number(match[2]);
  quadgrams.set(match[1], count);
  quadgramTotal += count;
}
assert.equal(quadgrams.size, 79495);
const toText = symbols => symbols.map(value => corpus.translit[value]).join('');
function quadgramScore(symbols) {
  const text = toText(symbols);
  let sum = 0;
  for (let i = 0; i <= text.length - 4; i++) sum += Math.log10((quadgrams.get(text.slice(i, i + 4)) || 0.01) / quadgramTotal);
  return sum / (text.length - 3);
}
function summarize(paths) {
  return paths.map((symbols, index) => ({
    index, ioc: ioc(symbols), quadgram: quadgramScore(symbols),
    prefix: toText(symbols).slice(0, 64), full: toText(symbols),
  }));
}
const direct = {}, compositions = {};
for (const sign of [1, -1]) {
  const directResult = inverse(cipher, key, sign);
  const outerResult = inverse(transposeDecode(cipher), key, sign);
  const innerResult = inverse(cipher, key, sign);
  direct[sign] = { firstImpossible: directResult.firstImpossible, outputs: summarize(directResult.paths) };
  compositions[sign] = {
    stage05AsFinalLayer: { firstImpossible: outerResult.firstImpossible, outputs: summarize(outerResult.paths) },
    stage05AsFirstLayer: { firstImpossible: innerResult.firstImpossible, outputs: summarize(innerResult.paths.map(transposeDecode)) },
  };
}
assert.equal(direct[1].outputs.length, 3);
assert.equal(direct[-1].outputs.length, 0);
assert.equal(compositions[1].stage05AsFinalLayer.outputs.length, 0);
assert.equal(compositions[-1].stage05AsFinalLayer.outputs.length, 0);
assert.equal(compositions[1].stage05AsFirstLayer.outputs.length, 3);
assert.equal(compositions[-1].stage05AsFirstLayer.outputs.length, 0);
const plant = plainControl.slice(0, 91);
assert.equal(plant.length, 91);
const positiveControls = [];
for (const sign of [1, -1]) {
  const modelA = transposeEncode(encrypt(plant, key, sign));
  const modelAInverse = inverse(transposeDecode(modelA), key, sign);
  assert.ok(modelAInverse.paths.some(candidate => same(candidate, plant)));
  const modelBIntermediate = transposeEncode(plant);
  const modelB = encrypt(modelBIntermediate, key, sign);
  const modelBInverse = inverse(modelB, key, sign);
  assert.ok(modelBInverse.paths.some(candidate => same(transposeDecode(candidate), plant)));
  positiveControls.push({ sign, modelAInversePaths: modelAInverse.paths.length, modelBInversePaths: modelBInverse.paths.length });
}
const summary = {
  source: {
    central2014SquareRow: square[3], phiRowModulo29: key, stage05Key: STAGE05_KEY,
    stage05DecodeOrder: [0, 6, 2, 5, 1, 4, 3], physicalPage: 36,
    originalRunes: cipher.length, sevenRuneBlocks: cipher.length / 7,
    ciphertextFCount: cipher.filter(value => value === 0).length,
  },
  baseline: {
    p36Ciphertext: { ioc: ioc(cipher), quadgram: quadgramScore(cipher) },
    p57NativeControl: { ioc: ioc(plainControl), quadgram: quadgramScore(plainControl) },
  },
  directPhiRow: direct, compositions, positiveControls, recoveredUnknownPlaintext: false,
};
assert.ok(Math.abs(summary.baseline.p57NativeControl.quadgram - (-4.420633417052125)) < 1e-12);
console.log(JSON.stringify(summary, null, 2));
