'use strict';

/**
 * Original LP2 terminal 32x8 ring known-interior linear-key recovery SFT.
 *
 * Inputs: source-authenticated original LP2 table and native GP29 corpus.
 * Hypothesis: each byte residue B mod 29 encrypts a corresponding terminal
 * GP29 rune by adding/subtracting a common short linear-recurrence key over
 * GF(29). The first 76 positions are the 32x8 perimeter (unknown p55); the
 * other 180 positions correspond to known p56 and p57 rune content.
 *
 * Train on the first 120 known interior differences; predict the untouched
 * remaining 60 before considering unknown p55. Includes solved-p56 native
 * prime/F verification and a planted full 76-rune perimeter recovery.
 *
 * This is a bounded source-shaped hypothesis, not an authenticated LP2
 * decoder. Run: node sims/lp2_terminal_ring_linear_predictor_sft.cjs
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const root = join(__dirname, '..', 'resources', 'liber-primus');
const source = JSON.parse(readFileSync(join(root, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(readFileSync(join(root, 'lp2-grid-256.json'), 'utf8'));
const bytes = table.bytes;

assert.equal(bytes.length, 256);
assert.equal(source.pages[55].indices.length, 76);
assert.equal(source.pages[56].indices.length, 85);
assert.equal(source.pages[57].indices.length, 95);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mod29 = n => ((n % 29) + 29) % 29;

/** @param {number} n @returns {number} Nonzero GF29 inverse. */
function inverse(n) {
  assert.ok(n % 29 !== 0, 'noninvertible field element');
  for (let x = 1; x < 29; x += 1) {
    if (mod29(n * x) === 1) return x;
  }
  throw new Error('noninvertible GF29 element');
}

/** @param {number} count @returns {number[]} Prime minus one mod29. */
function primeTotients(count) {
  const key = [];
  for (let p = 2; key.length < count; p += 1) {
    let prime = true;
    for (let d = 2; d * d <= p; d += 1) {
      if (p % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) key.push((p - 1) % 29);
  }
  return key;
}

/**
 * Authentic solved-p56 encoder: plaintext F bypasses both cipher and key.
 * @param {number[]} plain @returns {number[]}
 */
function encryptP56(plain) {
  const key = primeTotients(plain.length);
  let consumed = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + key[consumed++]));
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const tokens = source.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let at = 0; at < normalized.length;) {
    const found = tokens.find(token => normalized.startsWith(token.s, at));
    assert.ok(found, 'unencodable solved p56 GP29 word');
    out.push(found.i);
    at += found.s.length;
  }
  return out;
}
const p56 = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56.length, 85);
assert.deepStrictEqual(encryptP56(p56), source.pages[56].indices);
const solvedKnown = p56.concat(source.pages[57].indices);
const printedKnown = source.pages[56].indices.concat(source.pages[57].indices);
assert.equal(solvedKnown.length, 180);
assert.equal(printedKnown.length, 180);

/**
 * Outer-to-inner top-left-start clockwise traversal of the authentic 32x8.
 * @returns {number[]} Byte offsets.
 */
function spiral() {
  const positions = [];
  for (let top = 0, left = 0, bottom = 31, right = 7;
    top <= bottom && left <= right;
    top += 1, left += 1, bottom -= 1, right -= 1) {
    for (let col = left; col <= right; col += 1) positions.push(top * 8 + col);
    for (let row = top + 1; row <= bottom; row += 1) positions.push(row * 8 + right);
    for (let col = right - 1; col >= left; col -= 1) positions.push(bottom * 8 + col);
    for (let row = bottom - 1; row > top; row -= 1) positions.push(row * 8 + left);
  }
  assert.equal(positions.length, 256);
  assert.equal(new Set(positions).size, 256);
  return positions;
}
const snail = spiral();
const rowInterior = [];
for (let row = 1; row <= 30; row += 1) {
  for (let col = 1; col <= 6; col += 1) rowInterior.push(row * 8 + col);
}
assert.equal(snail.slice(76).length, 180);
assert.equal(new Set(rowInterior).size, 180);

/**
 * Berlekamp-Massey over GF29, minimal linear recurrence
 * s[n] + sum(C[j]*s[n-j], j=1..order) == 0.
 *
 * @param {number[]} sequence
 * @returns {{order:number, coeffs:number[]}}
 */
function berlekampMassey(sequence) {
  let C = [1];
  let B = [1];
  let L = 0;
  let m = 1;
  let b = 1;
  for (let n = 0; n < sequence.length; n += 1) {
    let discrepancy = sequence[n];
    for (let j = 1; j <= L; j += 1) {
      discrepancy = mod29(discrepancy + (C[j] || 0) * sequence[n - j]);
    }
    if (discrepancy === 0) {
      m += 1;
      continue;
    }
    const saved = C.slice();
    const scale = mod29(discrepancy * inverse(b));
    for (let j = 0; j < B.length; j += 1) {
      C[j + m] = mod29((C[j + m] || 0) - scale * B[j]);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B = saved;
      b = discrepancy;
      m = 1;
    } else {
      m += 1;
    }
  }
  return { order: L, coeffs: C.slice(0, L + 1) };
}

/**
 * Count genuine heldout symbol predictions without retraining.
 * @param {number[]} sequence @param {{order:number,coeffs:number[]}} fit
 * @param {number} training
 * @returns {number}
 */
function heldoutMatches(sequence, fit, training) {
  let matches = 0;
  for (let n = training; n < sequence.length; n += 1) {
    let predicted = 0;
    for (let j = 1; j <= fit.order; j += 1) {
      predicted -= fit.coeffs[j] * sequence[n - j];
    }
    if (mod29(predicted) === sequence[n]) matches += 1;
  }
  return matches;
}
const configurations = [
  { name: 'spiral', positions: snail.slice(76) },
  { name: 'rowmajor', positions: rowInterior },
];
const results = [];
for (const cfg of configurations) {
  for (const [target, plain] of [['solved', solvedKnown], ['printed', printedKnown]]) {
    for (const sign of [-1, 1]) {
      const differences = cfg.positions.map((pos, i) =>
        mod29(bytes[pos] + sign * plain[i]));
      const trained = berlekampMassey(differences.slice(0, 120));
      const matched = heldoutMatches(differences, trained, 120);
      const full = berlekampMassey(differences);
      results.push({
        traversal: cfg.name, target, sign,
        trainedOrder: trained.order,
        heldoutMatches: matched,
        fullOrder: full.order,
      });
    }
  }
}
const expected = [
  ['spiral','solved',-1,60,2,90],
  ['spiral','solved', 1,60,3,90],
  ['spiral','printed',-1,60,2,90],
  ['spiral','printed', 1,60,1,90],
  ['rowmajor','solved',-1,60,1,90],
  ['rowmajor','solved', 1,60,5,90],
  ['rowmajor','printed',-1,60,3,91],
  ['rowmajor','printed', 1,60,0,90],
];
assert.deepStrictEqual(results.map(x => [
  x.traversal, x.target, x.sign, x.trainedOrder,
  x.heldoutMatches, x.fullOrder,
]), expected);
assert.ok(results.every(x => x.heldoutMatches <= 5),
  'a real source residual needs independent scrutiny if predictive');

/*
 * A positive planted experiment uses a degree-seven secret GF29 recurrence,
 * generates 256 bytes with the exact original table geometry, and hides the
 * first 76 real p55 GP29 indices in the perimeter while all 180 known solved
 * p56+p57 symbols remain unchanged. The known interior alone must identify
 * the key and enable lossless backward recovery of all 76 perimeter symbols.
 */
const weights = [3, 1, 4, 1, 5, 9, 2];
const plantedKey = [2, 5, 8, 13, 21, 3, 1];
for (let n = 7; n < 256; n += 1) {
  let value = 0;
  for (let j = 1; j <= 7; j += 1) {
    value += weights[j - 1] * plantedKey[n - j];
  }
  plantedKey.push(mod29(value));
}
const plantedPlain = source.pages[55].indices.concat(solvedKnown);
assert.equal(plantedPlain.length, 256);
const plantedBytes = new Array(256);
for (let n = 0; n < 256; n += 1) {
  plantedBytes[snail[n]] = 29 * 4 + mod29(plantedPlain[n] + plantedKey[n]);
}
assert.ok(plantedBytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
const plantedResiduals = snail.slice(76)
  .map((offset, i) => mod29(plantedBytes[offset] - solvedKnown[i]));
const fit = berlekampMassey(plantedResiduals.slice(0, 120));
assert.equal(fit.order, 7);
assert.equal(heldoutMatches(plantedResiduals, fit, 120), 60);
assert.ok(fit.coeffs[7] !== 0);
const recovered = new Array(256);
for (let n = 76; n < 256; n += 1) recovered[n] = plantedResiduals[n - 76];
for (let n = 75; n >= 0; n -= 1) {
  const at = n + fit.order;
  let rhs = recovered[at];
  for (let j = 1; j < fit.order; j += 1) {
    rhs += fit.coeffs[j] * recovered[at - j];
  }
  recovered[n] = mod29(-rhs * inverse(fit.coeffs[fit.order]));
}
assert.deepStrictEqual(recovered, plantedKey);
const recoveredUnknown = snail.slice(0, 76)
  .map((offset, i) => mod29(plantedBytes[offset] - recovered[i]));
assert.deepStrictEqual(recoveredUnknown, source.pages[55].indices);
console.log('SOURCE native p56 prime/F control: 85/85');
console.log('SOURCE original table and geometry: 256 bytes, perimeter76, interior180');
for (const result of results) console.log('SOURCE ' + JSON.stringify(result));
console.log('PLANTED GF29 order7: 60/60 withheld, 76/76 perimeter recovered');
console.log('PASS original terminal-ring linear-key prediction gate; no real LP2 plaintext');
