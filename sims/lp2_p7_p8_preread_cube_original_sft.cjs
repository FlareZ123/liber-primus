'use strict';

/**
 * Source-frozen p7/p8 GF(3) table with a pre-read GP29 cube write.
 * Run as a single CommonJS Node 22 file from any working directory.
 * Original 2014 LP2 image pages p7=24.jpg, p8=25.jpg; transcription is
 * resources/liber-primus/lp2-corpus.json.
 * This is a bounded negative test, not a discovered historical cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const getPage = (p) => corpus.pages.find((x) => x.page === p).indices;
const product29 = (word) => word.reduce((p, c) => (p * c) % 29, 1);
const p7 = getPage(7);
const p8 = getPage(8);
const p57 = getPage(57);
const red7 = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
const red8 = [[14, 10, 14, 19], [1, 14, 19, 5, 2, 13, 3, 17]];
assert.deepEqual(p7.slice(194), red7.flat());
assert.deepEqual(p8.slice(0, 12), red8.flat());
const red7Products = red7.map(product29);
const red8Products = red8.map(product29);
assert.deepEqual(red7Products, [11, 26, 8, 15, 2]);
assert.deepEqual(red8Products, [4, 3]);

// Five black dots, left to right, visually measured height ranks.
const dotRanks = [3, 5, 1, 4, 2];
const seed = dotRanks.map((v) => v % red8Products[1]);
const taps = red7Products.map((v) => v % red8Products[1]);
assert.deepEqual(seed, [0, 2, 1, 1, 2]);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

/** @param {number[]} x @returns {number} */
function address(x) {
  return x.reduce((n, v) => 3 * n + v, 0);
}

/** @returns {{sequence:number[], runs:number[]}} */
function makeOrbit() {
  const states = [];
  const visited = new Set();
  let s = seed.slice();
  while (!visited.has(address(s))) {
    visited.add(address(s));
    states.push(s.slice());
    s = s.slice(1).concat([taps.reduce((n, v, i) => n + v * s[i], 0) % 3]);
  }
  assert.equal(address(s), address(seed));
  assert.equal(states.length, 242);
  const sequence = states.map((v) => v[0]);
  const runs = [];
  for (let i = 0; i < sequence.length; i += 1) {
    if ([0, 1, 2, 3].every((j) => sequence[(i + j) % 242] === 0)) runs.push(i);
  }
  assert.deepEqual(runs, [22, 143]);
  return { sequence, runs };
}

/** @param {number[]} sequence @param {number} run @returns {number[]} */
function makeTable(sequence, run) {
  const trits = sequence.slice();
  trits.splice(run + 4, 0, 0);
  assert.equal(trits.length, 243);
  const addresses = trits.map((_, i) => address(
    Array.from({ length: 5 }, (_, j) => trits[(i + j) % 243])
  ));
  assert.equal(new Set(addresses).size, 243);
  const table = Array(243);
  const black = p8.slice(12);
  assert.equal(black.length, 243);
  for (let i = 0; i < 243; i += 1) table[addresses[i]] = black[i];
  assert.equal(new Set(table.keys()).size, 243);
  return table;
}

/**
 * Pre-read cube: k <- k^3 (mod29) in the selected cell, then C=P+k.
 * C-only five-trit history makes both encryption and decryption online.
 * @param {number[]} input
 * @param {number[]} initial
 * @param {'index'|'prime'} mode
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function apply(input, initial, mode, decrypt) {
  const table = initial.slice();
  const history = p8.slice(-5);
  const output = [];
  for (const value of input) {
    const a = address(history.map((r) =>
      mode === 'index' ? r % 3 : corpus.prime[r] % 3
    ));
    const k = (table[a] ** 3) % 29;
    table[a] = k;
    const c = decrypt ? value : (value + k) % 29;
    const p = decrypt ? (c - k + 29) % 29 : value;
    output.push(decrypt ? p : c);
    history.shift();
    history.push(c);
  }
  return output;
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const hist = Array(29).fill(0);
  for (const x of runes) hist[x] += 1;
  return hist.reduce((n, v) => n + v * (v - 1), 0) / (runes.length * (runes.length - 1));
}

const { sequence, runs } = makeOrbit();
const original = [9, 10, 11, 12, 13, 14].flatMap(getPage);
const p13Offset = [9, 10, 11, 12].map((p) => getPage(p).length).reduce((a, b) => a + b, 0);
assert.equal(original.length, 1474);
assert.equal(p57.length, 95);
const nativePlant = Array.from({ length: original.length }, (_, i) => p57[i % p57.length]);
const findings = [];
for (const run of runs) {
  const table = makeTable(sequence, run);
  for (const mode of ['index', 'prime']) {
    const pt = apply(original, table, mode, true);
    assert.deepEqual(apply(pt, table, mode, false), original);
    const encryptedPlant = apply(nativePlant, table, mode, false);
    assert.deepEqual(apply(encryptedPlant, table, mode, true), nativePlant);
    const r = {
      zeroRun: run,
      addressMode: mode,
      originalRunes: original.length,
      originalIoC: ioc(pt),
      first300IoC: ioc(pt.slice(0, 300)),
      p13First200IoC: ioc(pt.slice(p13Offset, p13Offset + 200)),
      nativePlantIoC: ioc(nativePlant),
      sourceNativePlantExact: nativePlant.length,
      originalForwardReplayExact: original.length,
      prefix: pt.slice(0, 42).map((n) => corpus.translit[n]).join('')
    };
    assert.ok(r.originalIoC < 0.04);
    assert.ok(r.first300IoC < 0.04);
    assert.ok(r.p13First200IoC < 0.04);
    findings.push(r);
  }
}
console.log('Source products p7=' + red7Products + ' p8=' + red8Products);
console.log('Primitive GF3 cycle=242 zero-runs=' + runs + ' black-runic cells=243');
console.log(JSON.stringify(findings, null, 2));
console.log('PASS: 4 original 1474-rune exact inverses and 4 genuine p57-GP native plants');
