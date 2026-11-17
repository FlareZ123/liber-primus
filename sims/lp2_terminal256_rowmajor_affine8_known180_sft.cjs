"use strict";

/**
 * All-secret row-major 8x8 GF(29) affine known-plaintext inverse:
 * LP2 printed 32x8 base60 table vs p55:76 + p56:85 + p57:95.
 * This uses the actual printed row order, independently distinct from
 * the previously tested perimeter/ring 8x8 affine association.
 *
 * SFT: node sims/lp2_terminal256_rowmajor_affine8_known180_sft.cjs
 * Windows-compatible CommonJS, no package dependencies, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const rawGrid = read("resources/liber-primus/lp2-grid-256.json");
const originalBytes = rawGrid.pages.flatMap(page => page.bytes);
assert.equal(originalBytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(originalBytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const grid = originalBytes.map(n => n % 29);
const mod = n => (n % 29 + 29) % 29;
const tokens = corpus.translit.map((text, value) => ({text, value}))
  .sort((a, b) => b.text.length - a.text.length);

/** @param {string} phrase @returns {number[]} */
function gpEncode(phrase) {
  const indices = [];
  for (const word of phrase.split(" ")) {
    for (let at = 0; at < word.length;) {
      const token = tokens.find(t => word.startsWith(t.text, at));
      assert(token, "Unknown native GP token: " + word.slice(at));
      indices.push(token.value);
      at += token.text.length;
    }
  }
  return indices;
}
const solved56 = gpEncode(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
const printed56 = corpus.pages[56].indices;
const native57 = corpus.pages[57].indices;
assert.deepEqual([corpus.pages[55].indices.length, solved56.length,
  printed56.length, native57.length], [76, 85, 85, 95]);

const primes = [];
for (let x = 2; primes.length < 85; x++) {
  if (primes.every(p => p * p > x || x % p !== 0)) primes.push(x);
}
let primeClock = 0;
const reconstructed56 = solved56.map((r, i) => {
  if (i === 56) { assert.equal(r, 0); return 0; }
  return mod(r + primes[primeClock++] - 1);
});
assert.equal(primeClock, 84);
assert.deepEqual(reconstructed56, printed56, "Original solved p56 reproduces 85/85 ciphertext runes");

/** Finite-field RREF, all secret coefficients and bias allowed.
 * @param {number[][]} equations Each vector has n coefficients + one RHS.
 * @param {number} n Number of unknown parameters.
 * @returns {{rank:number,inconsistent:boolean,coefficients:number[]}}
 */
function solve(equations, n) {
  const A = equations.map(row => {
    assert.equal(row.length, n + 1);
    return row.map(mod);
  });
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < n && rank < A.length; col++) {
    let selected = rank;
    while (selected < A.length && A[selected][col] === 0) selected++;
    if (selected === A.length) continue;
    [A[rank], A[selected]] = [A[selected], A[rank]];
    let inverse = 1;
    while (mod(A[rank][col] * inverse) !== 1) inverse++;
    for (let j = col; j <= n; j++) A[rank][j] = mod(A[rank][j] * inverse);
    for (let i = 0; i < A.length; i++) {
      if (i === rank || A[i][col] === 0) continue;
      const multiple = A[i][col];
      for (let j = col; j <= n; j++)
        A[i][j] = mod(A[i][j] - multiple * A[rank][j]);
    }
    pivots.push(col);
    rank++;
  }
  const inconsistent = A.some(row => row.slice(0, n).every(v => v === 0) && row[n] !== 0);
  const coefficients = Array(n).fill(0);
  for (let i = 0; i < rank; i++) coefficients[pivots[i]] = A[i][n];
  return {rank, inconsistent, coefficients};
}
/** @param {number[]} x @param {number[]} w */
function apply(x, w) {
  return mod(w.reduce((sum, v, j) => sum + v * x[j], 0));
}
/**
 * A row has exactly 8 contiguous published cells and 8 terminal rune slots.
 * Of 32 physical rows, complete known rows are 10..31. Row9
 * contains the 4 mixed known/unknown slots at indices 72..79.
 * @param {number[]} table Values 0..28, source or synthetic.
 * @param {number[]} suffix Known 180 GP values at indices 76..255.
 */
function recover(table, suffix) {
  assert.equal(table.length, 256);
  assert.equal(suffix.length, 180);
  const known = Array(256).fill(null);
  for (let j = 0; j < 180; j++) known[j + 76] = suffix[j];
  const decoded = [];
  for (const direction of ["table-to-rune", "rune-to-table"]) {
    const columns = [];
    const trainedKeys = [];
    for (let col = 0; col < 8; col++) {
      const equations = [];
      for (let row = 10; row < 32; row++) {
        const tableRow = table.slice(8 * row, 8 * row + 8);
        const plainRow = known.slice(8 * row, 8 * row + 8);
        const x = direction === "table-to-rune" ? tableRow : plainRow;
        const y = direction === "table-to-rune" ? plainRow[col] : tableRow[col];
        assert(x.every(Number.isInteger));
        equations.push([...x, 1, y]);
      }
      const training = solve(equations.slice(0, 9), 9);
      const complete = solve(equations, 9);
      assert.equal(training.rank, 9);
      assert.equal(complete.rank, 9);
      const heldout = equations.slice(9);
      const matches = heldout.filter(eq =>
        apply(eq.slice(0, 9), training.coefficients) === eq[9]).length;
      const firstContradictoryRow = equations.findIndex((_, i) =>
        solve(equations.slice(0, i + 1), 9).inconsistent);
      columns.push({column:col, rank:complete.rank,
        globallyConsistent:!complete.inconsistent,
        holdoutMatches:matches, holdoutTotal:heldout.length,
        firstContradictoryPrintedRow:firstContradictoryRow < 0 ?
          null : firstContradictoryRow + 10});
      trainedKeys.push(training.coefficients);
    }
    decoded.push({direction, columns,trainedKeys});
  }
  return decoded;
}
const actual = [
  {name:"solved-p56-plus-clear-p57", suffix:[...solved56, ...native57]},
  {name:"printed-p56-plus-clear-p57", suffix:[...printed56, ...native57]}
].map(entry => ({
  register:entry.name,
  directions:recover(grid,entry.suffix).map(({direction,columns}) => ({direction,columns}))
}));
for (const version of actual)
  for (const side of version.directions) {
    assert(side.columns.every(c => !c.globallyConsistent));
    assert(side.columns.every(c => c.firstContradictoryPrintedRow === 19));
  }
assert.deepEqual(
  actual.flatMap(v=>v.directions.map(s=>s.columns.map(c=>c.holdoutMatches))),
  [[0,0,0,1,1,0,1,2],[1,1,1,0,0,0,2,0],
   [0,0,0,0,0,1,0,1],[0,1,1,0,1,0,0,1]]
);

/** Full original-shaped positive plant using a hidden invertible affine
 * 8x8 row operation. Both the original 180 known rune slots and all 76
 * planted unknown rune slots are recovered using just 9 known rows.
 */
const knownSuffix = [...solved56, ...native57];
const allPlain = [...native57.slice(0, 76), ...knownSuffix];
assert.equal(allPlain.length, 256);
// Input T[r,c] = P[r,c] + 2 * P[r,(c+1)%8] + (3*c+4) modulo29.
// The 8x8 circulant has determinant 1 - 256 = -255 = 6 mod29,
// so its inverse exists and no synthetic key fitting is required.
const keyBias = Array.from({length:8}, (_,c) => (3*c+4)%29);
const plantedTable = [];
for (let row = 0; row < 32; row++)
  for (let col = 0; col < 8; col++) {
    const a = allPlain[row*8+col];
    const b = allPlain[row*8+(col+1)%8];
    plantedTable.push(mod(a+2*b+keyBias[col]));
  }
const planted = recover(plantedTable,knownSuffix);
const plantedReverse = planted.find(x=>x.direction==="table-to-rune");
assert(plantedReverse.columns.every(x=>x.globallyConsistent && x.holdoutMatches===13));
const projected = [];
for(let row=0;row<32;row++) {
  const x=[...plantedTable.slice(row*8,row*8+8),1];
  for(let col=0;col<8;col++)
    projected.push(apply(x,plantedReverse.trainedKeys[col]));
}
assert.deepEqual(projected,allPlain,"Entire 256-rune plant recovered from 180 known symbols");
console.log(JSON.stringify({
  source:"unaltered 32x8 original grid and 76+85+95 terminal GP rune slots",
  originalP56PrimeTotientReconstruction:"85/85",
  model:"all-secret stationary GF29 affine 8x8 row-major map",
  original:actual,
  completeKnownRows:22,
  withheldRows:13,
  positive:{rowIndependentRecoveredTrue:true,
    fullSourceShapeGPRecovered:projected.length,
    hiddenP55RunesRecovered:projected.slice(0,76).length,
    withheldPredictions:8*13},
  conclusion:"All 4 source-register/direction families are exactly inconsistent by printed row19. No plaintext/key recovered."
},null,2));
