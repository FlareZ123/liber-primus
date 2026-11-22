"use strict";

/**
 * LP2 source-geometry known-plaintext attack: recover the 76 outer grid
 * symbols from 180 independently known interior GP29 runes if a separable
 * row-column pad, or its recoverable affine subfamily, exists.
 *
 * Run: node sims/lp2_terminal_grid_separable_mask_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const mod = (x) => ((x % 29) + 29) % 29;
const table = grid.byte_rows;
assert.equal(table.length, 32);
assert(table.every((row) => row.length === 8));
assert.equal(crypto.createHash("sha256")
  .update(Buffer.from(table.flat())).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {string} words @returns {number[]} */
function toGp(words) {
  const alphabet = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(" ")) {
    for (let i = 0; i < word.length;) {
      const found = alphabet.find(({ token }) => word.startsWith(token, i));
      assert(found, "Missing GP spelling in " + word);
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p56 = corpus.pages.find((p) => p.page === 56).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const p56Plain = toGp(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS " +
  "THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p56Plain.length, 85);
assert.equal(p57.length, 95);
const known = p56Plain.concat(p57);
const printed = p56.concat(p57);

const interior = [];
for (let r = 1; r < 31; r++) {
  for (let c = 1; c < 7; c++) interior.push([r, c]);
}
const border = [];
for (let c = 0; c < 8; c++) border.push([0, c]);
for (let r = 1; r < 32; r++) border.push([r, 7]);
for (let c = 6; c >= 0; c--) border.push([31, c]);
for (let r = 30; r >= 1; r--) border.push([r, 0]);
assert.equal(interior.length, 180);
assert.equal(border.length, 76);
assert.equal(new Set(interior.concat(border)
  .map(([r, c]) => r * 8 + c)).size, 256);

/**
 * A row+column secret in GF29 requires every adjacent 2x2 minor to vanish:
 * (T-P)[r,c] - (T-P)[r,c+1] - (T-P)[r+1,c] + (T-P)[r+1,c+1] = 0.
 * This checks every possible secret row pad and every secret column pad,
 * including the three-parameter affine plane as a strict subfamily.
 * @param {number[][]} observedTable GP29 grid values.
 * @param {number[]} text Independently known interior runes in row-major order.
 * @returns {{minors:number,nonzero:number,first:object|null,affine:number,affineParams:number[]}}
 */
function gate(observedTable, text) {
  const k = Array.from({ length: 30 }, () => Array(6));
  for (let i = 0; i < interior.length; i++) {
    const [r, c] = interior[i];
    k[r - 1][c - 1] = mod(observedTable[r][c] - text[i]);
  }
  let minors = 0;
  let nonzero = 0;
  let first = null;
  for (let r = 0; r < 29; r++) {
    for (let c = 0; c < 5; c++) {
      const four = [k[r][c], k[r][c+1], k[r+1][c], k[r+1][c+1]];
      const residual = mod(four[0] - four[1] - four[2] + four[3]);
      minors++;
      if (residual !== 0) {
        nonzero++;
        if (first === null) first = { r: r + 1, c: c + 1, four, residual };
      }
    }
  }
  const rowStep = mod(k[1][0] - k[0][0]);
  const colStep = mod(k[0][1] - k[0][0]);
  const offset = mod(k[0][0] - rowStep - colStep);
  let affine = 0;
  for (let r = 0; r < 30; r++) {
    for (let c = 0; c < 6; c++) {
      if (k[r][c] === mod(offset + rowStep*(r+1) + colStep*(c+1)))
        affine++;
    }
  }
  return { minors, nonzero, first, affine, affineParams:[rowStep,colStep,offset] };
}

const sourceTable = table.map((row) => row.map(mod));
const solved = gate(sourceTable, known);
const visible = gate(sourceTable, printed);
assert.deepEqual({
  solved: [solved.minors, solved.nonzero, solved.affine, solved.first.residual],
  visible: [visible.minors, visible.nonzero, visible.affine, visible.first.residual]
}, {
  solved:[145,142,12,15],
  visible:[145,136,10,14]
});
assert.deepEqual(solved.first, {
  r:1,c:1,four:[22,2,18,13],residual:15
});

// A source-shaped rank-one-plus-row-column pad always satisfies the
// necessary condition, even when its row and column masks are nonlinear.
const arbitraryRow = Array.from({length:32},(_,r)=>mod(7*r*r+3*r+9));
const arbitraryCol = Array.from({length:8},(_,c)=>mod(11*c*c+2*c+5));
const arbitraryTable = table.map((row,r)=>row.map((_,c)=>0));
for (let i=0;i<interior.length;i++) {
  const [r,c] = interior[i];
  arbitraryTable[r][c] = mod(known[i]+arbitraryRow[r]+arbitraryCol[c]);
}
const arbitraryPlant = gate(arbitraryTable,known);
assert.equal(arbitraryPlant.nonzero,0);

// A stronger genuine p55 recovery plant: the complete 32x8 perimeter is a
// 76-rune artificial secret, while the interior is *exactly* the solved p56
// and clear p57 original plaintext. A secret affine 2D GP29 pad has just
// three unknown parameters recoverable using three interior positions.
const syntheticPlain = table.map((row)=>row.map(()=>0));
for (let i=0;i<interior.length;i++){
  const [r,c] = interior[i]; syntheticPlain[r][c]=known[i];
}
for (let i=0;i<border.length;i++){
  const [r,c] = border[i]; syntheticPlain[r][c]=p55[i];
}
const actualKey = [7,11,5]; // synthetic-only, never applied to real LP2 as a key
const plantedTable=syntheticPlain.map((row,r)=>row.map((p,c)=>
  mod(p+actualKey[0]*r+actualKey[1]*c+actualKey[2])));
const learned=gate(plantedTable,known);
assert.equal(learned.nonzero,0);
assert.equal(learned.affine,180);
assert.deepEqual(learned.affineParams,actualKey);
const recoveredBorder=border.map(([r,c])=>mod(plantedTable[r][c]-
  learned.affineParams[0]*r-learned.affineParams[1]*c-learned.affineParams[2]));
assert.deepEqual(recoveredBorder,p55);

console.log(JSON.stringify({
  source:"unaltered LP2 32x8 radix60 byte grid and 180 solved/clear terminal GP runes",
  grid:"32x8", border:76, interior:180,
  originalSolved:solved, originalPrinted:visible,
  arbitraryRowsAndColumnsPlant:{
    sourceShape:"same 30x6 known interior", nonzeroMinors:arbitraryPlant.nonzero
  },
  genuineCompleteP55RecoveryPlant:{
    unknownBorderRunes:76, recovered:recoveredBorder.length,
    learnedSecretParameters:learned.affineParams,
    interiorPredictions:learned.affine
  },
  verdict:"Original 2D row-plus-column key family disproved by 2x2 invariant; no p55 plaintext recovered"
},null,2));
console.log("PASS: complete source geometry, both native known registers and 76-rune recovery plant.");
