'use strict';
/**
 * Source-anchored ternary incidence-algebra inverse for the first 3^8 LP2 runes.
 * Run: node sims/lp2_ternary_mobius_zeta_inverse.cjs
 * Node 22+, CommonJS, no dependencies beyond the repository's source corpus.
 *
 * The 8-axis ternary tensor zeta transform is an invertible model, NOT a
 * claim that the historical cipher used this operation.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const N = 6561;
const MOD = 29;
const LATIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRS';

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
/** @param {number} n @returns {number} */
const field = n => ((n % MOD) + MOD) % MOD;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const book = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(book.length, 12956);
assert.deepEqual(book.slice(6555, N), book.slice(-6));

/**
 * Each ternary axis is independently oriented as 0<1<2 or 2<1<0.
 * direction=+1: 3-state zeta; direction=-1: inverse (Möbius).
 * Applying all 8 axes gives the tensor product, with no fitted rune key.
 * @param {number[]} input 6561 F29 symbols
 * @param {number} mask 0..255, one reversal bit per trit
 * @param {number} direction +1 or -1
 * @returns {number[]}
 */
function transform(input, mask, direction) {
  assert.equal(input.length, N);
  assert(direction === 1 || direction === -1);
  const out = input.slice();
  for (let axis = 0, stride = 1; axis < 8; axis++, stride *= 3) {
    const reverse = (mask >>> axis) & 1;
    for (let base = 0; base < N; base += 3 * stride) {
      for (let delta = 0; delta < stride; delta++) {
        const i = base + delta, j = i + stride, k = j + stride;
        const x = out[i], y = out[j], z = out[k];
        if (direction === -1) {
          if (reverse) {
            out[i] = field(x - y);
            out[j] = field(y - z);
          } else {
            out[j] = field(y - x);
            out[k] = field(z - y);
          }
        } else if (reverse) {
          out[j] = field(y + z);
          out[i] = field(x + y + z);
        } else {
          out[j] = field(y + x);
          out[k] = field(z + y + x);
        }
      }
    }
  }
  return out;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const count = new Int32Array(MOD);
  for (const x of symbols) count[x]++;
  let equal = 0;
  for (const n of count) equal += n * (n - 1);
  return equal / (symbols.length * (symbols.length - 1));
}

/**
 * Exhaust both tensor directions, all 256 coordinate-orientation choices,
 * and all 29 offsets before the inverse. Global nonzero F29 scaling is
 * redundant under the permutation-invariant index of coincidence:
 * T(a*C+b) = a*T(C+(b/a)).
 * @param {number[]} symbols
 * @returns {{full: {ioc:number, direction:number, mask:number, shift:number},
 *            zeroShift: {ioc:number, direction:number, mask:number, shift:number}}}
 */
function scan(symbols) {
  const ones = Array(N).fill(1);
  let full = { ioc: -1, direction: 0, mask: 0, shift: 0 };
  let zeroShift = { ...full };
  for (const direction of [-1, 1]) {
    for (let mask = 0; mask < 256; mask++) {
      const base = transform(symbols, mask, direction);
      const unit = transform(ones, mask, direction);
      for (let shift = 0; shift < 29; shift++) {
        const count = new Int32Array(29);
        for (let i = 0; i < N; i++) {
          count[field(base[i] + shift * unit[i])]++;
        }
        let matches = 0;
        for (const n of count) matches += n * (n - 1);
        const score = matches / (N * (N - 1));
        const result = { ioc: score, direction, mask, shift };
        if (score > full.ioc) full = result;
        if (shift === 0 && score > zeroShift.ioc) zeroShift = result;
      }
    }
  }
  return { full, zeroShift };
}

/** @param {string} raw @returns {number[]} */
function gpEnglish(raw) {
  const tokens = corpus.translit.map((name, i) => ({ name, i }))
    .sort((a, b) => b.name.length - a.name.length);
  const words = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(t => word.startsWith(t.name, i));
      if (match) {
        result.push(match.i);
        i += match.name.length;
      } else i++;
    }
  }
  return result;
}

/** @returns {number[]} */
function latinSource() {
  const content = read('resources/control/latin-vulgate-gp-wholewords.txt');
  const letters = content.split(/\r?\n/).filter(s => /^[0-9A-S]+$/.test(s))
    .join('').slice(0, N);
  assert.equal(letters.length, N);
  return Array.from(letters, ch => LATIN_ALPHABET.indexOf(ch));
}

function main() {
  const original = book.slice(0, N);
  const latin = latinSource();
  const shakespeare = gpEnglish(read('resources/control/shakespeare_first300k.txt'))
    .slice(0, N);
  assert.equal(shakespeare.length, N);
  const originalResult = scan(original);
  const secretMask = 173, secretScale = 5, secretIntercept = 17;
  const plant = transform(latin, secretMask, 1)
    .map(v => field(secretScale * v + secretIntercept));
  const plantedResult = scan(plant);
  assert.equal(plantedResult.full.mask, secretMask);
  assert.equal(plantedResult.full.direction, -1);
  const sourceLockedRecovery = transform(
    plant.map(v => field(6 * (v - secretIntercept))), secretMask, -1
  );
  assert.deepEqual(sourceLockedRecovery, latin);
  assert.deepEqual(
    transform(sourceLockedRecovery, secretMask, 1)
      .map(v => field(secretScale * v + secretIntercept)),
    plant
  );
  // I.o.C. can choose the wrong affine intercept by changing just one rune.
  const selectedRecovery = transform(
    plant.map(v => field(v + plantedResult.full.shift)), secretMask, -1
  ).map(v => field(6 * v));
  const matched = selectedRecovery.filter((v, i) => v === latin[i]).length;
  assert.equal(matched, 6560);

  const output = {
    scope: 'Original first 6561 of 12956 LP2 runes, 8-axis ternary tensor',
    configurations: { directions: 2, orientationMasks: 256, affineOffsets: 29,
      globalAffineScales: 28, evaluatedIocCandidates: 14848 },
    originalRawIoc: ioc(original),
    originalBest: originalResult,
    sourceControls: { latinIoc: ioc(latin), shakespeareIoc: ioc(shakespeare) },
    planted: { orientation: secretMask, scale: secretScale,
      intercept: secretIntercept, best: plantedResult.full,
      orientationRecovered: true, iocSelectedCorrectRunes: matched,
      sourceLockedCorrectRunes: N, sourceLockedRoundTrip: true }
  };
  assert(Math.abs(output.originalBest.full.ioc - 0.03469057735844848) < 1e-12);
  assert(Math.abs(output.sourceControls.latinIoc - 0.07503057609451266) < 1e-12);
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) main();
module.exports = { transform, ioc, scan, gpEnglish, latinSource };
