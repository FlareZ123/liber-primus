'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p55 = corpus.pages[55].indices;
const solved = corpus.pages[57].indices.slice(0, 76);
assert.equal(p55.length, 76);
assert.equal(solved.length, 76);

// The signed 2013 TCP DH worked example names modulus 23. The previously
// published 2013 MP3 gives 761. Reversing the first modulus into a group
// generator is a *hypothesis*, not a Cicada instruction.
const state = [];
let x = 1;
for (let i = 0; i < 76; i++) {
  assert(!state.includes(x), 'Orbit repeats before target end');
  state.push(x);
  x = (x * 23) % 761;
}
assert.equal(x, 1);
const key = state.map(value => value % 29);

/** @param {number[]} input @param {-1|1} sign */
function additive(input, sign) {
  assert.equal(input.length, 76);
  return input.map((c, i) => (c + sign * key[i] + 29) % 29);
}
/** @param {number[]} v */
function ioc(v) {
  const counts = new Array(29).fill(0);
  for (const symbol of v) counts[symbol]++;
  return counts.reduce((n, freq) => n + freq * (freq - 1), 0) / (v.length * (v.length - 1));
}
for (const sign of /** @type {const} */ ([-1, 1])) {
  const recovered = additive(p55, sign);
  assert.deepEqual(additive(recovered, /** @type {-1|1} */ (-sign)), p55);
  const nativePlant = additive(solved, /** @type {-1|1} */ (-sign));
  assert.deepEqual(additive(nativePlant, sign), solved);
  assert.deepEqual(additive(additive(nativePlant, sign), /** @type {-1|1} */ (-sign)), nativePlant);
  console.log(JSON.stringify({
    sign, originalLength: p55.length,
    decipheredIoC: ioc(recovered),
    originalIoC: ioc(p55),
    solvedPlantIoC: ioc(solved),
    decrypted: recovered.map(i => corpus.translit[i]).join('')
  }));
}
console.log(JSON.stringify({
  modulus: 761,
  historicalDHModulusTransposedAsGenerator: 23,
  orbitLength: state.length,
  lastGroupValue: state[state.length - 1],
  nextGroupValue: x,
  first16KeyIndices: key.slice(0, 16)
}));
