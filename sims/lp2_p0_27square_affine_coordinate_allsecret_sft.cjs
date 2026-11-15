'use strict';

/**
 * All-key GF(29) 27x27 coordinate-affine inverse of untouched LP2 pp0..2.
 * Node.js 22, CommonJS; uses original GP29 corpus and first-party solved controls.
 * Frozen source geometry: 729 runes = 27x27; two opposing Orthodox crosses are
 * 180-degree rotated copies in the original artwork (not asserted as a cipher key).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const mod = x => ((x % 29) + 29) % 29;

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const freq = new Uint32Array(29);
  for (const n of a) freq[n]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} input @param {number} rowSlope @param {number} colSlope @param {boolean} encrypt */
function transport(input, rowSlope, colSlope, encrypt) {
  assert.equal(input.length, 729);
  return input.map((glyph, pos) => mod(
    glyph + (encrypt ? 1 : -1) * (rowSlope * Math.floor(pos / 27) + colSlope * (pos % 27))
  ));
}

/** @param {number[]} input */
function gridSearch(input) {
  const candidates = [];
  for (let rowSlope = 0; rowSlope < 29; rowSlope++) {
    for (let colSlope = 0; colSlope < 29; colSlope++) {
      const proposed = transport(input, rowSlope, colSlope, false);
      assert.deepEqual(transport(proposed, rowSlope, colSlope, true), input);
      candidates.push({
        rowSlope, colSlope,
        train: ioc(proposed.slice(0, 540)),
        holdout: ioc(proposed.slice(540)),
        full: ioc(proposed)
      });
    }
  }
  return candidates;
}

/** @param {number[]} gp @param {string[]} symbols */
function readSolvedSection(gp, symbols) {
  return gp.flatMap(section => Array.from(section.source_text)
    .filter(glyph => symbols.includes(glyph))
    .map(glyph => symbols.indexOf(glyph)));
}

/** @param {ReturnType<typeof gridSearch>} candidates @param {'train'|'full'} metric */
function best(candidates, metric) {
  return candidates.slice().sort((x, y) => y[metric] - x[metric])[0];
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
  ));
  assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
  const original = corpus.pages.slice(0, 3).flatMap(p => p.indices);
  assert.equal(original.length, 729);
  assert.deepEqual(original.slice(0, 10), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26]);
  const variants = gridSearch(original);
  const trainWinner = best(variants, 'train');
  const fullWinner = best(variants, 'full');

  assert.deepEqual([trainWinner.rowSlope, trainWinner.colSlope], [10, 28]);
  assert.deepEqual([fullWinner.rowSlope, fullWinner.colSlope], [15, 25]);
  assert.ok(trainWinner.train < 0.037 && trainWinner.holdout < 0.037);
  assert.ok(fullWinner.full < 0.036);

  const solved = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources', 'external', 'relikd-solved-gp29-native-v1.json'), 'utf8'
  ));
  const controls = [
    ['0_koan_1'],
    ['0_welcome', '0_wisdom', '0_warning'],
    ['0_loss_of_divinity']
  ];
  const positiveResults = [];
  for (const [index, names] of controls.entries()) {
    const native = readSolvedSection(
      solved.sections.filter(section => names.includes(section.name)),
      corpus.runes
    ).slice(0, 729);
    assert.equal(native.length, 729);
    const rowSlope = [11, 25, 7][index];
    const colSlope = [7, 28, 2][index];
    const planted = transport(native, rowSlope, colSlope, true);
    const bestPlant = best(gridSearch(planted), 'train');
    assert.equal(bestPlant.rowSlope, rowSlope);
    assert.equal(bestPlant.colSlope, colSlope);
    assert.deepEqual(transport(planted, rowSlope, colSlope, false), native);
    assert.ok(bestPlant.train > 0.055);
    assert.ok(bestPlant.holdout > 0.055);
    positiveResults.push({
      names, trueMask: [rowSlope, colSlope],
      recoveredMask: [bestPlant.rowSlope, bestPlant.colSlope],
      nativeFullIoc: ioc(native),
      sourceMaskedIoc: ioc(planted),
      trainIoc: bestPlant.train,
      holdoutIoc: bestPlant.holdout
    });
  }
  console.log(JSON.stringify({
    claim: '27x27 coordinate-affine GP29 shift, all 29^2 masks, arbitrary constant shift',
    original: { n: 729, rawIoc: ioc(original), trainWinner, fullWinner },
    positiveResults,
    interpretation: 'none of the affine two-coordinate keys can raise original IoC to native GP English control; 180-degree output rotation cannot change the IoC'
  }, null, 2));
}
if (require.main === module) main();
module.exports = { ioc, transport, gridSearch, readSolvedSection, best };
