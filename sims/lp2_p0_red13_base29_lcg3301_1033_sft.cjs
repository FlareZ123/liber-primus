'use strict';

/**
 * Original p0 red-13 GP29 integer as a 64-bit seed for a two-number LCG.
 *
 * Source-visible operands: the 13 red runes on p0 (17.jpg) and the manuscript's
 * 3301 and 1033 numerical markers. The choice of an LCG and its two readout
 * conventions is conjectural; it is not a demonstrated Cicada instruction.
 *
 * Node.js 22+, CommonJS; run from any directory:
 *   node sims/lp2_p0_red13_base29_lcg3301_1033_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'
));

const red = corpus.pages[0].indices.slice(0, 13);
const train = corpus.pages[0].indices.slice(13);
const hold = corpus.pages.slice(1, 3).flatMap(page => page.indices);
const clear = corpus.pages[57].indices;
const MODULUS = 29;
const MASK_64 = (1n << 64n) - 1n;

/** @param {number} n @returns {number} */
const mod29 = n => ((n % MODULUS) + MODULUS) % MODULUS;

/** @param {number[]} symbols @param {boolean} mostSignificantFirst @returns {bigint} */
function base29(symbols, mostSignificantFirst) {
  const digits = mostSignificantFirst ? symbols : symbols.slice().reverse();
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}

/**
 * @param {bigint} seed
 * @param {bigint} multiplier
 * @param {bigint} increment
 * @param {'low29'|'high29'} extraction
 * @param {boolean} updateBeforeRead
 * @param {number} length
 * @returns {number[]}
 */
function generate(seed, multiplier, increment, extraction, updateBeforeRead, length) {
  let state = seed;
  const key = [];
  const step = () => { state = (state * multiplier + increment) & MASK_64; };
  for (let i = 0; i < length; i++) {
    if (updateBeforeRead) step();
    key.push(Number((extraction === 'high29' ? state >> 35n : state) % 29n));
    if (!updateBeforeRead) step();
  }
  return key;
}

/** @param {number[]} ciphertext @param {number[]} key @param {-1|1} sign @returns {number[]} */
function decode(ciphertext, key, sign) {
  assert.equal(ciphertext.length, key.length);
  return ciphertext.map((rune, i) => mod29(rune + sign * key[i]));
}

/** @param {number[]} plaintext @param {number[]} key @param {-1|1} sign @returns {number[]} */
function encode(plaintext, key, sign) {
  assert.equal(plaintext.length, key.length);
  return plaintext.map((rune, i) => mod29(rune - sign * key[i]));
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const rune of values) counts[rune]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

/** @returns {object} */
function run() {
  const printed = red.map(value => corpus.translit[value]).join('');
  assert.equal(printed, 'SHEOGMIAFSYENGC');
  assert.deepEqual(ink.pages[0].red_spans.map(({start, length}) =>
    [start, length]), [[0, 13]]);
  assert.deepEqual([red.length, train.length, hold.length, clear.length],
    [13, 249, 467, 95]);
  assert.equal(base29(red, true), 5412445423142629857n);
  assert.equal(base29(red, false), 2033242057252411977n);

  const models = [];
  for (const [seedOrder, seed] of [
    ['printed-msb', base29(red, true)],
    ['printed-lsb', base29(red, false)]
  ]) {
    for (const [multiplier, increment] of [
      [3301n, 1033n], [1033n, 3301n]
    ]) {
      for (const extraction of ['low29', 'high29']) {
        for (const updateBeforeRead of [false, true]) {
          const key = generate(seed, multiplier, increment, extraction,
            updateBeforeRead, train.length + hold.length);
          for (const sign of /** @type {Array<-1|1>} */ ([-1, 1])) {
            const training = decode(train, key.slice(0, train.length), sign);
            const withheld = decode(hold, key.slice(train.length), sign);
            assert.deepEqual(encode(training, key.slice(0, train.length), sign),
              train);
            assert.deepEqual(encode(withheld, key.slice(train.length), sign),
              hold);
            // Independent, actually clear original LP2 p57 source-native
            // plaintext is planted under each source-selected candidate key.
            const plantedKey = key.slice(0, clear.length);
            assert.deepEqual(decode(encode(clear, plantedKey, sign), plantedKey,
              sign), clear);
            models.push({seedOrder, multiplier: multiplier.toString(),
              increment: increment.toString(), extraction, updateBeforeRead,
              sign, trainIoC: ioc(training), holdIoC: ioc(withheld),
              first80: training.slice(0, 80).map(r => corpus.translit[r]).join('')});
          }
        }
      }
    }
  }
  models.sort((a, b) => b.trainIoC - a.trainIoC);
  assert.equal(models.length, 32);
  assert.ok(Math.abs(models[0].trainIoC - 0.03646845446301334) < 1e-14);
  assert.ok(Math.abs(models[0].holdIoC - 0.03427043221733097) < 1e-14);
  assert.ok(models.every(model => model.trainIoC < 0.045 &&
    model.holdIoC < 0.045));

  return {
    source: 'Original red13 p0; original 3301/1033 numbers; GP29 corpus',
    conjecturedOperation: '64-bit LCG x←3301x+1033 or 1033x+3301; mod2^64',
    red: printed, seedIntegers: {
      printedMSB: base29(red, true).toString(),
      printedLSB: base29(red, false).toString()
    },
    original: {redRunes: red.length, trainingRunes: train.length,
      withheldRunes: hold.length, trainingIoC: ioc(train),
      withheldIoC: ioc(hold), clearP57IoC: ioc(clear)},
    exactModels: models.length, bestTrainingOnly: models[0],
    bestFive: models.slice(0, 5),
    plantedClearP57RoundTrips: models.length,
    decision: 'No original GP29 plaintext; retire this bounded two-constant LCG transfer'
  };
}

if (require.main === module)
  console.log(JSON.stringify(run(), null, 2));
module.exports = {base29, generate, decode, encode, ioc, run};
