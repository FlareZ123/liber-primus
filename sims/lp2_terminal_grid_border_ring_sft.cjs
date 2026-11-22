"use strict";
/**
 * Original-source SFT: PARABLE's circumference instruction, the physical
 * 32x8 numeric grid, and the exact LP2 p55/p56/p57 rune counts.
 *
 * Tests only direct byte->GP substitution and the table-byte mod29
 * pad hypotheses under fixed source reading orders; neither the size
 * congruence nor a reversible arbitrary cipher identifies an LP2 key.
 *
 * Node.js 22: node sims/lp2_terminal_grid_border_ring_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {any} */
const json = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/base60-grid.json");
const rows = grid.byte_rows;

assert.equal(rows.length, 32);
for (const row of rows) assert.equal(row.length, 8);
const page55 = corpus.pages[55].indices;
const page56 = corpus.pages[56].indices;
const page57 = corpus.pages[57].indices;
assert.deepEqual([page55.length, page56.length, page57.length], [76,85,95]);

// Clockwise beginning at the upper-left, without repeating a corner.
const border = [
  ...rows[0],
  ...rows.slice(1).map((row) => row[7]),
  ...rows[31].slice(0, 7).reverse(),
  ...rows.slice(1, 31).reverse().map((row) => row[0]),
];
const inner = rows.slice(1,31).flatMap((row) => row.slice(1,7));
assert.deepEqual([border.length, inner.length], [76,180]);
assert.equal(border.length, page55.length);
assert.equal(inner.length, page56.length + page57.length);
assert.equal(border.length + inner.length, 256);

/**
 * Count contradictions for a single unknown fixed lookup f(x) = observed GP.
 * Each repeat of an input byte with a different observed output contradicts f.
 * @param {number[]} input
 * @param {number[]} output
 * @param {number} modulus
 * @returns {{unique:number,repeats:number,conflicts:number}}
 */
function lookupWitness(input,output,modulus) {
  assert.equal(input.length,output.length);
  const seen = new Map();
  let repeats=0,conflicts=0;
  for (let i=0;i<input.length;i++) {
    const x=input[i]%modulus;
    if (seen.has(x)) {
      repeats++;
      if (seen.get(x)!==output[i]) conflicts++;
    } else seen.set(x,output[i]);
  }
  return {unique:seen.size,repeats,conflicts};
}

// Exactly the four geometric corner choices and two read directions.
const corners=[0,7,38,45];
const borderOrders=[];
for (const start of corners) for(const direction of [-1,1]) {
  const ordered=page55.map((_,i)=>border[
    (start+direction*i+border.length*2)%border.length
  ]);
  borderOrders.push({
    start,direction,
    ...lookupWitness(ordered,page55,256),
  });
}
assert.equal(borderOrders.length,8);
assert.ok(borderOrders.every((caseResult)=>caseResult.conflicts>=5));

// Independent GP-orthographic wording of the known solved p56 plaintext.
// Under the historical cipher, p56 has 85 ciphertext runes; p57's 95
// published runes are already the plaintext (PARABLE).
const solved56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const glyphs = corpus.translit.map((token,i)=>({token,i}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} words @returns {number[]} */
function gpEncode(words) {
  const out=[];
  for (const word of words.split(" ")) for (let i=0;i<word.length;) {
    const match=glyphs.find(({token})=>word.startsWith(token,i));
    assert.ok(match,"unknown GP text: "+word.slice(i));
    out.push(match.i);
    i+=match.token.length;
  }
  return out;
}
const known56 = gpEncode(solved56);
assert.equal(known56.length,page56.length);
const knownPlain = [...known56,...page57];
const knownCipher = [...page56,...page57];
const knownShifts = page56.map((value,i)=>
  (value-known56[i]+29)%29).concat(Array(page57.length).fill(0));
assert.equal(knownShifts.length,inner.length);

const innerPlain=lookupWitness(inner,knownPlain,256);
const innerCipher=lookupWitness(inner,knownCipher,256);
const innerShift=lookupWitness(inner,knownShifts,256);
const innerShift29=lookupWitness(inner,knownShifts,29);
assert.deepEqual(innerPlain,{unique:127,repeats:53,conflicts:47});
assert.deepEqual(innerCipher,{unique:127,repeats:53,conflicts:51});
assert.deepEqual(innerShift,{unique:127,repeats:53,conflicts:43});
assert.deepEqual(innerShift29,{unique:29,repeats:151,conflicts:140});
const mod29Matches=inner.filter((value,i)=>value%29===knownShifts[i]).length;
assert.equal(mod29Matches,6);

console.log(JSON.stringify({
  geometry:"32x8 -> border 76 / interior 30x6 = 180",
  lp2_pages:[76,85,95],
  borderOrders,
  rowMajorInterior:{
    plain:innerPlain,cipher:innerCipher,shift:innerShift,
    shiftByResidue:innerShift29,exactMod29ShiftMatches:mod29Matches,
  },
  interpretation:"size match; direct byte substitution and natural mod29 key fail",
},null,2));
