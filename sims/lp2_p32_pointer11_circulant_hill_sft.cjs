'use strict';

/**
 * Source-fixed p50 11-state pointer-cycle -> p32 Hill-11 circulant inverse.
 * Run: node sims/lp2_p32_pointer11_circulant_hill_sft.cjs
 *
 * Original table contains an exact 11-cycle starting at byte-cell 0; original
 * physical p32 is a 121-rune (11x11) page with dimensions selected by the
 * signed 2016 563x569 tree image. Build one full 11x11 circulant GF29 key
 * directly from the 11 byte-cell addresses or their printed successor bytes.
 * No source-visible rule selects Hill specifically, so these are conditional
 * original-cipher inverse tests, not assertions of historical mechanism.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} rel @returns {unknown} */
const readJson = rel =>
  JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const gp = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const table = grid.bytes;
const p32 = gp.pages.find(p => p.page === 32).indices;
const known = gp.pages.find(p => p.page === 57).indices;
assert.equal(table.length, 256);
assert.equal(p32.length, 121);
assert.equal(known.length, 95);
const mod = (x, n) => (x % n + n) % n;
const mod29 = value => mod(value, 29);
const cycle = [];
for (let state = 0; !cycle.includes(state); state = table[state])
  cycle.push(state);
assert.deepEqual(cycle, [0,203,68,199,47,76,114,197,115,247,192]);
assert.equal(table[cycle.at(-1)], 0);
const primes = p32.map(v => gp.prime[v]);
assert.equal(primes.slice(0, 11).reduce((a, b) => a+b, 0), 563);
assert.equal(primes.filter((_, i) => i%11 === 0).reduce((a, b) => a+b, 0), 569);

/** @param {number[][]} matrix @returns {number[][]} */
function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}
/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function apply(matrix, vector) {
  return matrix.map(row => mod29(row.reduce(
    (sum, v, i) => sum + v * vector[i], 0)));
}
/**
 * Gauss-Jordan over F29 with row pivoting and exact identity check.
 * @param {number[][]} matrix
 * @returns {number[][] | null}
 */
function inverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.concat(
    Array.from({length:n}, (_, j) => +(i === j))));
  for (let col = 0; col < n; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    if (pivot < 0) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const reciprocal = Array.from({length:28}, (_, i) => i + 1)
      .find(x => mod29(a[col][col] * x) === 1);
    assert.ok(reciprocal);
    a[col] = a[col].map(x => mod29(x * reciprocal));
    for (let i = 0; i < n; i++) {
      if (i === col || a[i][col] === 0) continue;
      const pivotValue = a[i][col];
      a[i] = a[i].map((x, j) => mod29(x - pivotValue * a[col][j]));
    }
  }
  const result = a.map(row => row.slice(n));
  for (let i = 0; i < n; i++) {
    const e = Array.from({length:n}, (_, j) => +(i === j));
    assert.deepEqual(apply(result, matrix.map(row => row[i])), e);
  }
  return result;
}
/** @param {number[]} letters @returns {number} */
function ioc(letters) {
  const counts = Array(29).fill(0);
  for (const letter of letters) counts[letter]++;
  return counts.reduce((sum, count) => sum + count*(count-1), 0) /
    (letters.length*(letters.length-1));
}
const textGrid = Array.from({length:11}, (_, r) =>
  p32.slice(r*11,r*11+11));
// Independently known fully readable original p57 runes, recycled to fill
// exactly the source 11x11 shape for the invertibility positive control.
const known121 = known.concat(known.slice(0,26));
const controlGrid = Array.from({length:11}, (_, r) =>
  known121.slice(r*11,r*11+11));
const variants = [];
for (const [keySource, addresses] of [
  ['original pointer cell addresses', cycle],
  ['printed successor bytes', cycle.map(x => table[x])]
]) {
  for (const direction of ['right-circulant','left-circulant']) {
    const key = Array.from({length:11}, (_, row) =>
      Array.from({length:11}, (_, col) =>
        mod29(addresses[mod(direction === 'right-circulant' ?
          col-row : row-col, 11)])));
    const keyInverse = inverse(key);
    assert.ok(keyInverse, 'source circulant must be invertible');
    for (const blockAxis of ['row','column']) {
      const blocks = blockAxis === 'row' ? textGrid : transpose(textGrid);
      const restored = blocks.map(v => apply(keyInverse, v));
      const restoredMatrix = blockAxis === 'row' ?
        restored : transpose(restored);
      const controlBlocks = blockAxis === 'row' ?
        controlGrid : transpose(controlGrid);
      const plantedCipher = controlBlocks.map(v => apply(key, v));
      const plantedRecovered = plantedCipher.map(v => apply(keyInverse, v));
      assert.deepEqual(plantedRecovered, controlBlocks,
        '121/121 independently solved GP runes must roundtrip');

      for (const readout of ['row','column']) {
        const candidate = readout === 'row' ?
          restoredMatrix.flat() : transpose(restoredMatrix).flat();
        assert.equal(candidate.length, 121);
        assert.deepEqual(blocks, restored.map(v => apply(key, v)),
          'each original ciphertext block must roundtrip');
        variants.push({
          keySource,direction,blockAxis,readout,
          recoveredOriginalRunes: candidate.length,
          ioc: ioc(candidate),
          initial55: candidate.slice(0,55).map(v => gp.translit[v]).join('')
        });
      }
    }
  }
}
assert.equal(variants.length,16);
assert(variants.every(v=>v.recoveredOriginalRunes === 121));
const best = variants.slice().sort((a,b) => b.ioc-a.ioc)[0];
assert.equal(best.ioc, 0.03815426997245179);
assert.equal(ioc(p32), 0.03415977961432507);
console.log(JSON.stringify({
  hypothesis: 'source 11-state pointer cycle as an original p32 Hill11 circulant',
  src: {pointerCells:cycle, page32PrimeAxes:[563,569],
    p32Runes:p32.length, originalIoC:ioc(p32)},
  originalCases:variants,
  highestOriginalIoC:best,
  positive: {knownOriginalGp:95, padByKnownGp:26,
    recoveredEveryOriginalGpSymbol:121, variantsRecovered:16},
  conclusion: 'Every source-circulant setting is exactly reversible, but none decrypts p32 into recognizable native GP English. No authentic key or plaintext recovered.'
}, null, 2));
