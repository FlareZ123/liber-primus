"use strict";

/**
 * Independent source-selected GF43 alternative to the already-negative
 * GF29 3-of-5 p27 source-sharing hypothesis.
 * The p27 red-title P/P fold supplies prime43, and p55 ornament selects
 * 1-based rows 2,3,5. Test exact withheld 1/4 shares on original 43 columns.
 * Run: node sims/p27_p55_shamir_gf43_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gp = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const body = gp.pages[27].indices.slice(19);
assert.equal(body.length, 215);
const rowMajor = Array.from({length: 43}, (_, c) =>
  Array.from({length: 5}, (_, r) => body[r * 43 + c]));
const groups = Array.from({length: 43}, (_, c) =>
  body.slice(5 * c, 5 * c + 5));
const m = n => ((n % 43) + 43) % 43;

/**
 * The unique quadratic interpolant of rows 2,3,5 in GF43 gives row1
 * =17y2+41y3+29y5 and row4=14y2+y3+29y5, all modulo43.
 * @param {number[][]} columns
 * @param {"ordinal"|"prime"} encoding
 */
function probe(columns, encoding) {
  let both=0, onlyOne=0, neither=0, row1=0, row4=0;
  for(const col of columns){
    const a = col.map(i => encoding === "ordinal" ? i : gp.prime[i] % 43);
    const first = m(17*a[1]+41*a[2]+29*a[4]) === a[0];
    const fourth = m(14*a[1]+a[2]+29*a[4]) === a[3];
    row1 += Number(first);
    row4 += Number(fourth);
    if(first&&fourth)both++;
    else if(first||fourth)onlyOne++;
    else neither++;
  }
  return {both,onlyOne,neither,row1,row4};
}
const original = {
  rowOrdinal: probe(rowMajor,"ordinal"),
  rowPrime: probe(rowMajor,"prime"),
  groupsOrdinal: probe(groups,"ordinal"),
  groupsPrime: probe(groups,"prime")
};
assert.deepEqual(Object.values(original).map(x => [
  x.both,x.onlyOne,x.neither,x.row1,x.row4]),
[[0,1,42,0,1],[0,1,42,1,0],[0,4,39,1,3],[0,1,42,0,1]]);

// Positive: use a degree2 polynomial with coefficient values in GF43;
// all 43 synthetic columns MUST reconstruct both withheld shares.
const plant=Array.from({length:43},(_,c) =>
  Array.from({length:5},(_,r)=>m((c+1)+3*(r+1)+7*(r+1)**2)));
const positive=probe(plant.map(col=>col.map(x=>x)),"ordinal");
assert.equal(positive.both,43);
console.log(JSON.stringify({
  status:"GF43 original 3-of-5 quadratic sharing falsified on all 43 columns",
  source:"p27 215 black runes and P/P prime43; p55 five-dot mask 01101",
  selectedRowsOneBased:[2,3,5],
  layouts:["row-major","groups-of-five"],
  encodings:["GP ordinal","GP prime mod43"],
  original,syntheticPositive:positive
},null,2));
