'use strict';

/**
 * Source-derived p15 16-number / p50 F16 recurrence with the historical
 * plaintext-F-transparent key clock, exhaustively branching on literal F.
 * This is a conditional hypothesis, not an original Cicada cipher instruction.
 * Original full p55 and independent p0; native p57 positive, Node22/CJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const d = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const m = (x) => (x % 29 + 29) % 29;
const factor = [1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13];
const p15Printed = [
  3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820
];
// Clockwise original visible spiral begins with the uniquely red 3299.
const p15SpiralOrder = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];

/**
 * @param {number[]} p15Numbers
 * @returns {(clock: number) => number}
 */
function makeStream(p15Numbers) {
  const states = p15Numbers.map(m);
  return function key(clock) {
    while (states.length <= clock) {
      let residue = 0;
      for (let lag = 1; lag <= 16; lag++)
        residue = m(residue - factor[lag] * states[states.length - lag]);
      states.push(residue);
    }
    return states[clock];
  };
}

/**
 * Historical solved-p56 grammar: only ciphertext F can emit plaintext F,
 * and if treated as literal it does not advance the key.
 * @param {number[]} c
 * @param {number[]} seed
 * @param {number} sign Inverse P=C+sign*K.
 * @returns {{plain:number[],clock:number,skips:number[]}[]}
 */
function decipher(c, seed, sign) {
  const key = makeStream(seed);
  /** @type {{plain:number[],clock:number,skips:number[]}[]} */
  let states = [{ plain: [], clock: 0, skips: [] }];
  for (let i = 0; i < c.length; i++) {
    const next = [];
    for (const state of states) {
      const p = m(c[i] + sign * key(state.clock));
      if (p !== 0) next.push({
        plain: [...state.plain, p], clock: state.clock + 1,
        skips: state.skips
      });
      if (c[i] === 0) next.push({
        plain: [...state.plain, 0], clock: state.clock,
        skips: [...state.skips, i]
      });
    }
    states = next;
  }
  return states;
}

/**
 * @param {number[]} p
 * @param {number[]} seed
 * @param {number} sign
 * @returns {number[]}
 */
function encipher(p, seed, sign) {
  const key = makeStream(seed);
  let clock = 0;
  return p.map((v) => {
    if (v === 0) return 0;
    const c = m(v - sign * key(clock));
    clock++;
    return c;
  });
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const rune of a) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {string} */
function romanize(a) {
  return a.map((index) => d.translit[index]).join('');
}

function main() {
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const rem = bytes.map(m);
  // F16 polynomial is a demonstrable factor of the original 256-byte table.
  for (let i = 0; i < 240; i++) {
    const v = rem[i];
    for (let j = 0; j < factor.length; j++)
      rem[i+j] = m(rem[i+j] - v * factor[j]);
  }
  assert.ok(rem.every((v) => v === 0));
  const page55 = d.pages[55].indices;
  const page0 = d.pages[0].indices;
  const page15 = d.pages[15].indices;
  // The p54-to-p55 first rune carries a physical word across these pages.
  const terminal = d.pages[54].indices.concat(page55);
  const solved = d.pages[57].indices;
  assert.equal(page55.length, 76);
  assert.equal(page0.length, 262);
  assert.equal(page15.length, 159);
  assert.equal(terminal.length, 308);
  assert.equal(terminal.filter((v) => v === 0).length, 6);
  assert.equal(solved.length, 95);
  assert.deepEqual(
    page55.map((x, i) => x === 0 ? i : -1).filter((i) => i >= 0),
    [15, 25, 41]);
  const results = [];
  let positives = 0;
  for (const sourceSeed of [
    'row-printed', 'row-restored-signs',
    'red-center-spiral-printed', 'red-center-spiral-restored-signs'
  ]) {
    const positions = sourceSeed.startsWith('red-center-spiral')
      ? p15SpiralOrder : Array.from({ length: 16 }, (_, i) => i);
    const seed = positions.map((i) => {
      const v = p15Printed[i];
      return sourceSeed.endsWith('restored-signs') && (i === 12 || i === 13)
        ? -v : v;
    });
    for (const sign of [-1, +1]) {
      for (const [page, observed] of [
        [55, page55], [0, page0], [15, page15], ['terminal54-55', terminal]
      ]) {
        const candidates = decipher(observed, seed, sign);
        for (const candidate of candidates)
          assert.deepEqual(encipher(candidate.plain, seed, sign), observed);
        const plantedPlain = solved.slice(0, Math.min(solved.length, observed.length));
        const planted = encipher(plantedPlain, seed, sign);
        const decoded = decipher(planted, seed, sign);
        const exact = decoded.filter((x) =>
          x.plain.length === plantedPlain.length
          && x.plain.every((v,i) => v === plantedPlain[i]));
        assert.equal(exact.length, 1);
        positives++;
        results.push({
          page,
          sourceSeed,
          inverseSign: sign,
          originalSurvivorCount: candidates.length,
          originalMeanIoC: candidates.length ?
            candidates.reduce((s,x) => s + ioc(x.plain), 0) / candidates.length : null,
          originalMaxIoC: candidates.length ?
            Math.max(...candidates.map((x) => ioc(x.plain))) : null,
          firstCandidatePrefix: candidates.length ?
            romanize(candidates[0].plain.slice(0, 48)) : null,
          literalFSkipPaths: candidates.map((x) => x.skips),
          plantedNativeGpRecovered: plantedPlain.length
        });
      }
    }
  }
  assert.equal(positives, 32);
  assert.equal(results.filter((x) => x.page === 'terminal54-55').length, 8);
  assert.ok(results.filter((x) => x.page === 'terminal54-55')
    .every((x) => x.originalSurvivorCount === 0));
  assert.deepEqual(results.filter((x) => x.page !== 'terminal54-55')
    .map((x) => x.originalSurvivorCount),
    [2,0,0,0,0,0,3,0,0,0,6,0,0,0,0,1,0,2,0,0,0,0,0,0]);
  // Thirty-two source cases; eight full p54–55 natural terminal clocks rejected.
  console.log(JSON.stringify({
    status: 'PASS: original F-transparent p15/p50 recurrence candidates',
    originalSourceP55Runes: page55.length,
    originalSourceP0Runes: page0.length,
    originalSourceP15Runes: page15.length,
    originalTerminalChapterRunes: terminal.length,
    originalP55IoC: ioc(page55),
    originalP0IoC: ioc(page0),
    originalVariants: results,
    successfulExactNativeGpPlants: positives,
    originalUnknownPlaintextRecovered: false
  }, null, 2));
}
if (require.main === module) main();
module.exports = { makeStream, decipher, encipher };
