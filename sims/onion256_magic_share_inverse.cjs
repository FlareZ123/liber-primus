'use strict';

/**
 * Recover or exclude known binary-file headers under *arbitrary* fixed GF256
 * reconstruction coefficients for three historical 256-byte sources plus the
 * LP2 256-byte numerical grid. Known bytes determine candidate coefficients by
 * exact field Gaussian elimination. The original scan covers all file offsets.
 *
 * Two 4-parameter families:
 * (A) arbitrary four linear coefficients, without a fixed XOR byte;
 * (B) four normalized Shamir interpolation coefficients summing to one,
 *     plus an arbitrary unknown fixed XOR byte.
 *
 * No ciphertext scoring, language guesses or unknown-coordinate enumeration.
 * Synthetic hidden-byte plants check exact recovery of a full 256-byte message.
 * Run: node sims/onion256_magic_share_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gfMul, arrange} = require('./onion256_fourshare_ascii_rank.cjs');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const readJson = (relative) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relative), 'utf8')
);
const HISTORY = readJson('resources/cicada-hiddenservice-256-candidates.json');
const GRID = readJson('resources/liber-primus/lp2-grid-256.json');
const CORRECTIONS = [[45,81], [50,21], [165,47], [172,174], [246,224]];
const LAYOUTS = ['row-major', 'row-major-reversed',
  'column-major', 'column-major-reversed'];
const FIELDS = [0x1b, 0x1d];

/** @param {number} a @param {number} exponent @param {number} poly */
function gfPow(a, exponent, poly) {
  let result = 1;
  for (; exponent; exponent = Math.floor(exponent / 2)) {
    if (exponent & 1) result = gfMul(result, a, poly);
    a = gfMul(a, a, poly);
  }
  return result;
}

/**
 * Build a finite known-file byte mask. Positions are relative to the file
 * start, not required to be contiguous.
 * @param {string} name
 * @param {string} hex
 * @param {number} [start]
 */
function signature(name, hex, start = 0) {
  assert.match(hex, /^(?:[0-9a-f]{2})+$/i);
  return {name, known: Array.from(Buffer.from(hex, 'hex'),
    (byte, index) => [start + index, byte])};
}
const SIGNATURES = [
  signature('PNG', '89504e470d0a1a0a'),
  signature('SQLite', '53514c69746520666f726d6174203300'),
  signature('7z', '377abcaf271c'),
  signature('XZ', 'fd377a585a00'),
  signature('RAR4', '526172211a0700'),
  signature('RAR5', '526172211a070100'),
  signature('PDF-1', '255044462d312e'),
  signature('PDF-2', '255044462d322e'),
  signature('GIF87a', '474946383761'),
  signature('GIF89a', '474946383961'),
  signature('ELF64LE', '7f454c46020101'),
  signature('ELF32LE', '7f454c46010101'),
  signature('Unix-ar', '213c617263683e0a'),
  {name: 'JPEG-JFIF',
    known: signature('', 'ffd8ffe0').known
      .concat(signature('', '4a46494600', 6).known)},
  {name: 'WAV-RIFF',
    known: signature('', '52494646').known
      .concat(signature('', '57415645', 8).known)}
];
for (const s of SIGNATURES) assert.ok(s.known.length >= 6);

/**
 * Exact rectangular Gaussian elimination over GF256. Fully specified unique
 * solutions only: returns null if inconsistent or underdetermined.
 * @param {number[][]} A Rows of four field coefficients.
 * @param {number[]} b Target field elements.
 * @param {number} poly
 * @returns {number[]|null}
 */
function solve(A, b, poly) {
  assert.equal(A.length, b.length);
  const matrix = A.map((row, i) => row.concat([b[i]]));
  const pivotColumns = [];
  let rank = 0;
  for (let col = 0; col < 4; col++) {
    let pivot = rank;
    while (pivot < matrix.length && matrix[pivot][col] === 0) pivot++;
    if (pivot === matrix.length) continue;
    [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
    const inverse = gfPow(matrix[rank][col], 254, poly);
    for (let j = col; j < 5; j++)
      matrix[rank][j] = gfMul(matrix[rank][j], inverse, poly);
    for (let i = 0; i < matrix.length; i++) {
      if (i === rank || matrix[i][col] === 0) continue;
      const factor = matrix[i][col];
      for (let j = col; j < 5; j++)
        matrix[i][j] ^= gfMul(factor, matrix[rank][j], poly);
    }
    pivotColumns.push(col);
    rank++;
  }
  if (matrix.some(row => row.slice(0, 4).every(v => v === 0) &&
      row[4] !== 0)) return null;
  if (rank !== 4) return null;
  const parameters = Array(4).fill(0);
  for (let i = 0; i < rank; i++)
    parameters[pivotColumns[i]] = matrix[i][4];
  return parameters;
}

/**
 * @param {number[][]} sources Four 256-byte source arrays.
 * @param {number} position
 * @param {'linear'|'shamir-xor'} family
 */
function rowAt(sources, position, family) {
  const x = sources.map(source => source[position]);
  if (family === 'linear') return {row: x, fixed: 0};
  if (family === 'shamir-xor')
    return {row: [x[0]^x[3], x[1]^x[3], x[2]^x[3], 1],
      fixed: x[3]};
  throw new Error('Unknown family: ' + family);
}

/**
 * @param {number[][]} sources
 * @param {number[]} params
 * @param {'linear'|'shamir-xor'} family
 * @param {number} poly
 * @returns {number[]}
 */
function reconstruct(sources, params, family, poly) {
  const out = [];
  for (let i = 0; i < 256; i++) {
    const {row, fixed} = rowAt(sources, i, family);
    let byte = fixed;
    for (let j = 0; j < 4; j++)
      byte ^= gfMul(row[j], params[j], poly);
    out.push(byte);
  }
  return out;
}

/**
 * Solve exact known-message bytes at every legal source offset.
 * @param {number[][]} sources
 * @param {'linear'|'shamir-xor'} family
 * @param {number} poly
 * @param {typeof SIGNATURES} signatures
 */
function search(sources, family, poly, signatures = SIGNATURES) {
  const hits = [];
  let trials = 0;
  for (const s of signatures) {
    const maxIndex = Math.max(...s.known.map(([i]) => i));
    for (let offset = 0; offset + maxIndex < 256; offset++) {
      const A = [], b = [];
      for (const [i, expected] of s.known) {
        const {row, fixed} = rowAt(sources, offset + i, family);
        A.push(row);
        b.push(expected ^ fixed);
      }
      trials++;
      const solved = solve(A, b, poly);
      if (solved !== null) hits.push({
        signature: s.name, offset, coefficients: solved,
        outputSha256: require('node:crypto').createHash('sha256')
          .update(Buffer.from(reconstruct(sources, solved, family, poly)))
          .digest('hex')
      });
    }
  }
  return {trials, hits};
}

/**
 * Plant a 256-byte message with an independently hidden PNG header and recover
 * every coefficient by the same full-offset search used on original sources.
 * @param {'linear'|'shamir-xor'} family
 * @param {number} poly
 */
function control(family, poly) {
  let state = 0x3301bada;
  /** @returns {number} */
  function nextByte() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state & 255;
  }
  const sources = Array.from({length: 4}, () =>
    Array.from({length: 256}, nextByte));
  const message = Array.from({length: 256}, nextByte);
  const png = SIGNATURES[0];
  const plantedOffset = 41;
  for (const [i, byte] of png.known) message[plantedOffset + i] = byte;
  const params = family === 'linear' ?
    [7,11,13,17] : [17,29,61,101];
  for (let i = 0; i < 256; i++) {
    let known = family === 'linear' ? 0 : params[3];
    const coefficients = family === 'linear' ?
      params : [params[0], params[1], params[2],
        1 ^ params[0] ^ params[1] ^ params[2]];
    for (let j = 0; j < 3; j++)
      known ^= gfMul(coefficients[j], sources[j][i], poly);
    const last = coefficients[3];
    assert.notEqual(last, 0);
    sources[3][i] = gfMul(message[i] ^ known, gfPow(last, 254, poly), poly);
  }
  assert.deepEqual(reconstruct(sources, params, family, poly), message);
  const found = search(sources, family, poly, [png]);
  const hit = found.hits.find(h => h.offset === plantedOffset);
  assert.ok(hit, 'Failed to recover planted binary header');
  assert.deepEqual(hit.coefficients, params);
  assert.deepEqual(reconstruct(sources, hit.coefficients, family, poly), message);
  return {family, polynomial: '0x' + poly.toString(16),
    recoveredBytes: 256, plantedOffset, recoveredOffset: hit.offset,
    recoveredCoefficients: hit.coefficients};
}

function run() {
  assert.equal(HISTORY.sourceServices.length, 3);
  const historic = HISTORY.sourceServices.map(({hex}) =>
    [...Buffer.from(hex, 'hex')]);
  const outcomes = [], allHits = [];
  let comparisons = 0;
  for (const corrected of [false, true]) {
    const grid = GRID.bytes.slice();
    if (corrected) for (const [i, value] of CORRECTIONS) grid[i] = value;
    for (const layout of LAYOUTS) {
      const sources = historic.concat([arrange(grid, layout)]);
      for (const poly of FIELDS) {
        for (const family of ['linear', 'shamir-xor']) {
          const result = search(sources, family, poly);
          comparisons += result.trials;
          allHits.push(...result.hits.map(hit =>
            ({corrected, layout, polynomial: '0x' + poly.toString(16),
              family, ...hit})));
          outcomes.push({
            corrected, layout, polynomial: '0x' + poly.toString(16),
            family, testedOffsetsAndSignatures: result.trials,
            detectedHeaders: result.hits.length
          });
        }
      }
    }
  }
  const controls = FIELDS.flatMap(poly =>
    ['linear', 'shamir-xor'].map(family => control(family, poly)));
  assert.equal(outcomes.length, 32);
  assert.equal(allHits.length, 0,
    'An original-source candidate needs independent file validation');
  assert.equal(controls.length, 4);
  const result = {
    source: 'Three 256-byte historical onion candidates and LP2 256-byte grid',
    hypothesis: 'All globally fixed GF256 share coefficients selected from a ' +
      'predeclared 15-format magic-header panel, with any bytewise file offset',
    formats: SIGNATURES.map(s => ({name: s.name, knownBytes: s.known.length})),
    comparisons, outcomes, originalMatches: allHits, controls,
    conclusion: 'No source-aligned 256-byte direct binary file ' +
      'can have any listed header in either exact four-coefficient family',
    scope: 'Neither a full file-format absence proof nor a cipher-key exclusion; ' +
      'does not test encryption, compression without a known file header, ' +
      'changing share coefficients, alternate relative alignments, or other fields'
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {signature, solve, rowAt, reconstruct, search, control, run};
