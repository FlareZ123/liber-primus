'use strict';
/**
 * Source-original LP2 255-scroll-word to p8 nonlinear commutative
 * root-polynomial check under the already frozen GF4/radix59 receiver.
 * Run from repo root on Windows 11 / Node22:
 *   node sims/lp2_scroll255_shifted_product_wordhash_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const parts = read('lp2-transcription.txt').split('%');
const index = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const c of parts[page]) {
    if (index.has(c)) pending.push(index.get(c));
    else if ((c === '-' || c === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap(p => p.indices));
const original = gp.pages[8].indices;
assert.equal(original.length, 255);
const pairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
for (const [i, j] of pairs) {
  assert.deepEqual([...words[i]].sort((a,b) => a-b),
    [...words[j]].sort((a,b) => a-b));
}
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const table = grid.pages.flatMap(page => page.tokens).map(token =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert.equal(table.length, 256);
/** @param {number} a @param {number} b @returns {number} */
function mul4(a, b) {
  let out = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) out ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return out;
}
let state = [2, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((v, x) => 4 * v + x, 0));
  let feedback = 0;
  const taps = [3, 2, 0, 3];
  for (let t = 0; t < 4; t++) feedback ^= mul4(state[t], taps[t]);
  state = [state[1], state[2], state[3], feedback];
}
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
const corrected = original.map((v, i) => mod(v + table[addresses[i]]));
assert.deepEqual(pairs.map(([i, j]) => [corrected[i], corrected[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);
/** @param {number[]} word @param {number} k
 * @param {'ordinal'|'prime'|'square'} register @returns {number} */
function polynomial(word, k, register) {
  let out = 1;
  for (const rune of word) {
    const x = register === 'ordinal' ? rune :
      register === 'prime' ? gp.prime[rune] : rune * rune;
    out = mod(out * mod(x - k));
  }
  return out;
}
/** @param {number[]} xs @param {number[]} ys
 * @returns {{count:number, slope:number, intercept:number}} */
function maximumAffine(xs, ys) {
  let best = {count: 0, slope: 0, intercept: 0};
  for (let slope = 0; slope < 29; slope++) {
    const counts = new Uint16Array(29);
    for (let i = 0; i < xs.length; i++)
      counts[mod(ys[i] - slope * xs[i])]++;
    for (let intercept = 0; intercept < 29; intercept++) {
      if (counts[intercept] > best.count)
        best = {count: counts[intercept], slope, intercept};
    }
  }
  return best;
}
const candidates = [];
for (const register of ['ordinal', 'prime', 'square']) {
  for (let rootValue = 0; rootValue < 29; rootValue++) {
    const xs = words.map(w => polynomial(w, rootValue, register));
    const best = maximumAffine(xs, corrected);
    candidates.push({register, rootValue, ...best});
  }
}
candidates.sort((a, b) => b.count - a.count ||
  a.register.localeCompare(b.register) || a.rootValue - b.rootValue);
assert.equal(candidates.length, 87);
assert.equal(candidates[0].count, 22);
assert.equal(candidates.filter(x => x.count === 22).length, 12);
const hexCandidates = candidates.filter(x => [8, 18, 14].includes(x.rootValue));
assert.equal(Math.max(...hexCandidates.map(x => x.count)), 21);
const originalWinner = candidates[0];
const plant = words.map(w => mod(21 * polynomial(w, 5, 'ordinal') + 8));
const recovered = maximumAffine(words.map(w => polynomial(w, 5, 'ordinal')), plant);
assert.deepEqual(recovered, {count: 255, slope: 21, intercept: 8});
const inverse = plant.map((v, i) => mod(v - 21 * polynomial(words[i], 5, 'ordinal') - 8));
assert(inverse.every(v => v === 0));
const output = {
  originalWords: words.length, p8Runes: original.length,
  preexistingParikhEqualities: pairs.length,
  candidateRootRegisters: 87, affineChoicesPerRegister: 841,
  candidateTotal: 73167, bestOriginalMatches: originalWinner.count,
  bestOriginalRoot: originalWinner, bestHexRootMatches: 21,
  unsatisfiedOriginalRunesAtBest: original.length - originalWinner.count,
  independentPlantedMatches: recovered.count,
};
console.log(JSON.stringify(output, null, 2));
console.log('PASS: 87 nonlinear commutative shifted-product word summaries fail to explain full original p8; solved synthetic plant replays exactly.');
