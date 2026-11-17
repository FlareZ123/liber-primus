// Exhaustive unknown-state Blum-Blum-Shub gate for the authentic 256-cell LP2 table.
// Run: node sims/lp2_p50_parable_bbs_allstate_original_sft.cjs
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));

const p = 1259;
const q = 1031;
const seed = 1229;
const modulus = p * q;
assert.equal(modulus * seed, 1595277641);
/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function modPow(base, exponent, modulus) {
  let result = 1;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = result * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

// Universal Blum-square-state period after one initial squaring:
// QR(1259) has order629=17*37, ord_629(2)=72;
// QR(1031) has order515=5*103, ord_515(2)=204.
// Therefore lcm(72,204)=1224 squarings, independent of the seed.
assert.equal((p - 1) / 2, 629);
assert.equal((q - 1) / 2, 515);
assert.equal(modPow(2, 72, 629), 1);
assert.notEqual(modPow(2, 36, 629), 1);
assert.notEqual(modPow(2, 24, 629), 1);
assert.equal(modPow(2, 204, 515), 1);
for (const divisor of [2, 3, 17]) {
  assert.notEqual(modPow(2, 204 / divisor, 515), 1);
}
const universalBitPeriod = 1224;
const universalByteLag = universalBitPeriod / 8;
assert.equal(universalByteLag, 153);

const row60 = table.byte_rows.flat();
const digits59 = table.alphabet.replace('f', '');
const row59 = table.rows.flat().map((x) =>
  59 * digits59.indexOf(x[0]) + digits59.indexOf(x[1])
);
assert.equal(row60.length, 256);
assert.equal(row59.length, 256);
const pairCounts = { base60: 0, base59: 0 };
for (let index = 1; index + universalByteLag < 256; index++) {
  if (row60[index] === row60[index + universalByteLag]) pairCounts.base60++;
  if (row59[index] === row59[index + universalByteLag]) pairCounts.base59++;
}
assert.deepEqual(pairCounts, { base60: 0, base59: 0 });

assert.deepEqual(row60, table.rows.flat().map((x) =>
  60 * table.alphabet.indexOf(x[0]) + table.alphabet.indexOf(x[1])
));

/** @param {number[]} arr @returns {number[]} */
function columnMajor(arr) {
  return Array.from({length: 256}, (_, i) =>
    arr[(i % 8) * 32 + Math.floor(i / 8)]);
}

/**
 * Eight consecutive Blum-Blum-Shub low bits, emitting the current state
 * before squaring, packed in descending bit significance.
 * All arbitrary clock starts and post-square variants are covered because
 * the main search enumerates EVERY possible current state.
 * @param {number} state
 * @returns {{value: number, next: number}}
 */
function bbsByte(state) {
  let value = 0;
  for (let i = 0; i < 8; i++) {
    value = value * 2 + (state & 1);
    state = state * state % modulus;
  }
  return { value, next: state };
}

/** @param {number} value @returns {number} */
function reverseByte(value) {
  let reversed = 0;
  for (let i = 0; i < 8; i++) {
    reversed = reversed * 2 + (value & 1);
    value >>>= 1;
  }
  return reversed;
}

const plantedState = seed * seed % modulus;
const plant = [];
let nextPlant = plantedState;
for (let i = 0; i < 4; i++) {
  const next = bbsByte(nextPlant);
  plant.push(next.value);
  nextPlant = next.next;
}
const variants = [
  {name: 'original-base60-row', prefix: row60.slice(0, 4), source: true},
  {name: 'original-base59-row', prefix: row59.slice(0, 4), source: true},
  {name: 'original-base60-column', prefix: columnMajor(row60).slice(0, 4), source: true},
  {name: 'original-base59-column', prefix: columnMajor(row59).slice(0, 4), source: true},
  {name: 'planted-source-seed-high-bit-first', prefix: plant, source: false},
  {name: 'planted-source-seed-low-bit-first', prefix: plant.map(reverseByte), source: false}
];

for (const item of variants) {
  item.msb = {prefixCounts: [0, 0, 0, 0], exampleStates: []};
  item.lsb = {prefixCounts: [0, 0, 0, 0], exampleStates: []};
}

for (let state = 0; state < modulus; state++) {
  const first = bbsByte(state);
  const firstLow = reverseByte(first.value);
  for (const item of variants) {
    for (const lowFirst of [false, true]) {
      const target = item.prefix;
      const found = lowFirst ? firstLow : first.value;
      if (found !== target[0]) continue;
      const bin = lowFirst ? item.lsb : item.msb;
      bin.prefixCounts[0]++;
      let next = first.next;
      let index = 1;
      while (index < 4) {
        const emitted = bbsByte(next);
        next = emitted.next;
        if ((lowFirst ? reverseByte(emitted.value) : emitted.value) !== target[index]) break;
        bin.prefixCounts[index]++;
        index++;
      }
      if (index === 4 && bin.exampleStates.length < 8) bin.exampleStates.push(state);
    }
  }
}

for (const item of variants) {
  if (item.source) {
    assert.equal(item.msb.prefixCounts[2], 0);
    assert.equal(item.lsb.prefixCounts[2], 0);
  }
}
assert.ok(variants[4].msb.exampleStates.includes(plantedState));
assert.ok(variants[5].lsb.exampleStates.includes(plantedState));
assert.deepEqual(variants.slice(0, 4).map((v) => v.msb.prefixCounts.slice(0, 2)),
  [[5024, 34], [5139, 22], [5024, 16], [5139, 10]]);
assert.deepEqual(variants.slice(0, 4).map((v) => v.lsb.prefixCounts.slice(0, 2)),
  [[5218, 22], [5218, 20], [5218, 14], [5218, 14]]);

console.log(JSON.stringify({
  originalSource: 'resources/liber-primus/base60-grid.json',
  id3ParableInteger: 1595277641,
  blumModulus: modulus,
  universalBitPeriod,
  universalByteLag,
  originalLag153MatchesBeyondInitialByte: pairCounts,
  testedInitialStates: modulus,
  plantedState,
  variants
}, null, 2));
console.log('PASS: all 1,298,029 BBS states tested, no source 24-bit prefix match');
