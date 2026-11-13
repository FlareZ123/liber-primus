'use strict';

/**
 * Exact original-input GF(29) H/G codeword-window gate.
 *
 * Checks whether the p50 256-byte table's two independently selected
 * quadratic factors also divide any natural 256-rune ciphertext window.
 * Source-original physical page order is retained, including p50 with zero
 * runes. No ciphertext symbol, code frame, or key is altered.
 *
 * Run with Node.js 22 from the repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const P = 29;
const H = [3, 26, 24]; // historical 2013 BASE29 3301; low to high
const G = [27, 5, 15]; // original p39 red-rune triad; low to high
const expectedGridHash =
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % P) + P) % P;
}

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < P; i++) {
    if (mod(i * x) === 1) return i;
  }
  throw new Error('Nonunit in GF(29): ' + x);
}

/** @param {readonly number[]} factor @returns {{a:number,b:number}} */
function parameters(factor) {
  assert.equal(factor.length, 3);
  return {
    a: mod(-factor[0] * inverse(factor[2])),
    b: mod(-factor[1] * inverse(factor[2])),
  };
}

/**
 * Multiply a degree-less-than-two residue by X and add a new coefficient.
 * @param {readonly number[]} state
 * @param {{a:number,b:number}} factor
 * @param {number} digit
 * @returns {number[]}
 */
function advance(state, factor, digit) {
  return [
    mod(state[1] * factor.a + digit),
    mod(state[0] + state[1] * factor.b),
  ];
}

/**
 * Descending coefficients of a polynomial reduced modulo one quadratic.
 * @param {readonly number[]} coefficients
 * @param {{a:number,b:number}} factor
 * @returns {number[]}
 */
function remainder(coefficients, factor) {
  let state = [0, 0];
  for (const digit of coefficients) state = advance(state, factor, digit);
  return state;
}

/**
 * Residue of X^exponent modulo one quadratic.
 * @param {number} exponent
 * @param {{a:number,b:number}} factor
 * @returns {number[]}
 */
function xPower(exponent, factor) {
  let state = [1, 0];
  for (let i = 0; i < exponent; i++) {
    state = advance(state, factor, 0);
  }
  return state;
}

/**
 * Convolve two descending-coefficient polynomials over GF(29).
 * @param {readonly number[]} left
 * @param {readonly number[]} right
 * @returns {number[]}
 */
function multiply(left, right) {
  const result = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      result[i + j] = mod(result[i + j] + left[i] * right[j]);
    }
  }
  return result;
}

/**
 * Check every overlapping width-symbol window in O(N) field operations
 * after one initial Horner reduction. Each update removes the outgoing
 * leading coefficient and includes the incoming trailing coefficient.
 *
 * @param {readonly number[]} source
 * @param {number} width
 * @param {{a:number,b:number}} h
 * @param {{a:number,b:number}} g
 * @returns {{windows:number,hHits:number[],gHits:number[],both:number[]}}
 */
function scan(source, width, h, g) {
  assert.ok(source.length >= width);
  const hp = xPower(width, h);
  const gp = xPower(width, g);
  let hr = remainder(source.slice(0, width), h);
  let gr = remainder(source.slice(0, width), g);
  const hHits = [];
  const gHits = [];
  const both = [];
  const count = source.length - width + 1;

  for (let offset = 0; offset < count; offset++) {
    const matchesH = hr[0] === 0 && hr[1] === 0;
    const matchesG = gr[0] === 0 && gr[1] === 0;
    if (matchesH) hHits.push(offset);
    if (matchesG) gHits.push(offset);
    if (matchesH && matchesG) both.push(offset);

    if (offset === count - 1) break;
    const outgoing = source[offset];
    const incoming = source[offset + width];
    hr = advance(hr, h, incoming);
    gr = advance(gr, g, incoming);
    hr[0] = mod(hr[0] - outgoing * hp[0]);
    hr[1] = mod(hr[1] - outgoing * hp[1]);
    gr[0] = mod(gr[0] - outgoing * gp[0]);
    gr[1] = mod(gr[1] - outgoing * gp[1]);

    if ((offset + 1) % 257 === 0) {
      assert.deepEqual(hr, remainder(source.slice(offset + 1, offset + 1 + width), h));
      assert.deepEqual(gr, remainder(source.slice(offset + 1, offset + 1 + width), g));
    }
  }
  return { windows: count, hHits, gHits, both };
}

function main() {
  const corpus = JSON.parse(
    fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'),
  );
  const table = JSON.parse(
    fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'),
  );

  const bytes = table.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.ok(bytes.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
  assert.equal(
    crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    expectedGridHash,
  );

  const h = parameters(H);
  const g = parameters(G);
  const byteResidues = bytes.map((v) => mod(v));
  assert.deepEqual(remainder(byteResidues, h), [0, 0]);
  assert.deepEqual(remainder(byteResidues, g), [0, 0]);

  const unknownPages = corpus.pages.filter((page) => page.page <= 55);
  const source = unknownPages.flatMap((page) => page.indices);
  assert.equal(source.length, 12956);
  assert.equal(unknownPages.length, 56);
  assert.equal(unknownPages.filter((page) => page.indices.length === 0).length, 1);

  // Source-native exact positive plant: solved p57 GP29 text is 95 runes.
  const solved = corpus.pages.find((page) => page.page === 57).indices;
  assert.equal(solved.length, 95);
  const plant = Array.from({ length: 252 }, (_, i) => solved[i % solved.length]);
  const generator = multiply([...H].reverse(), [...G].reverse());
  const codeword = multiply(plant, generator);
  assert.equal(codeword.length, 256);
  assert.deepEqual(remainder(codeword, h), [0, 0]);
  assert.deepEqual(remainder(codeword, g), [0, 0]);
  const perturbed = codeword.slice();
  perturbed[0] = mod(perturbed[0] + 1);
  assert.notDeepEqual(remainder(perturbed, h), [0, 0]);
  assert.notDeepEqual(remainder(perturbed, g), [0, 0]);
  assert.deepEqual(scan(codeword, 256, h, g).both, [0]);

  // An exhaustive 256-rune window includes every possible literal phase,
  // including windows that cross a printed physical page boundary.
  const full = scan(source, 256, h, g);
  assert.equal(full.windows, 12701);
  assert.equal(full.hHits.length, 22);
  assert.equal(full.gHits.length, 11);
  assert.deepEqual(full.both, []);

  // Two independently visible, restricted framing conventions.
  const fixedBlocks = Array.from(
    { length: Math.floor(source.length / 256) },
    (_, i) => i * 256,
  );
  const pageStarts = unknownPages
    .filter((page) => page.indices.length >= 256)
    .map((page) => page.page);

  assert.equal(fixedBlocks.length, 50);
  assert.equal(pageStarts.length, 33);
  assert.equal(fixedBlocks.filter((offset) => full.both.includes(offset)).length, 0);
  for (const page of unknownPages) {
    if (page.indices.length < 256) continue;
    assert.notDeepEqual(remainder(page.indices.slice(0, 256), h), [0, 0]);
    assert.notDeepEqual(remainder(page.indices.slice(0, 256), g), [0, 0]);
  }

  const output = {
    sourceRunes: source.length,
    table: '256 bytes, sha256 ' + expectedGridHash,
    originalDualFactorTableRemainders: [0, 0, 0, 0],
    testedWindowLength: 256,
    literalOverlappingWindows: full.windows,
    hOnlyHits: full.hHits.length,
    hOffsets: full.hHits,
    gOnlyHits: full.gHits.length,
    gOffsets: full.gHits,
    jointHGHits: full.both,
    fullBookPhaseZeroBlocks: fixedBlocks.length,
    pageStartWindows: pageStarts.length,
    expectedJointHitsUniform: full.windows / (29 ** 4),
    solvedGPPlant: '252 source-native runes times degree-4 HG = 256-rune exact codeword; first-symbol mutation rejected',
  };
  console.log(JSON.stringify(output, null, 2));
}

main();
