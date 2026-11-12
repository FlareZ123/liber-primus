"use strict";
/**
 * Original p32 11x11 rune matrix -> Micro QR M1 7x7 finder:
 * test ALL static 29-symbol binary labels without enumerating 2^29 keys.
 * Original-source orientation is fixed by 563/569 prime checksum.
 *
 * Source background: https://www.qrcode.com/en/codes/microqr.html
 * Finder: https://docs.cognex.com/dmst_623/web/EN/DM475V_Manual/Content/Topics/DM475V/iso-18004-qr-code-grading-parameters.htm
 *
 * Read-only Node.js 22 SFT, run from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const p32 = C.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const source = Array.from({length:11},(_,r)=>p32.slice(11*r,11*r+11));
const sum = a=>a.reduce((s,v)=>s+C.prime[v],0);
const top = sum(source[0]);
const left = sum(source.map(row=>row[0]));
assert.deepEqual([top,left],[563,569]);
/** Micro QR M1 upper-left 7x7 finder: 7 black, 5 white, 3 black squares. */
const finder = (r,c) =>
  Number(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4));
/**
 * @param {number[][]} matrix 11x11 rune ordinals.
 * @returns {{minMismatch:number,conflictingRunes:number,usedRunes:number,assignments:Array<{index:number,light:number,dark:number}>}}
 */
function allSecretLabelGate(matrix) {
  const counts = Array.from({length:29},()=>[0,0]);
  for(let r=0;r<7;r++)for(let c=0;c<7;c++){
    counts[matrix[r][c]][finder(r,c)]++;
  }
  return {
    minMismatch:counts.reduce((sum,pair)=>sum+Math.min(...pair),0),
    conflictingRunes:counts.filter(pair=>pair[0]&&pair[1]).length,
    usedRunes:counts.filter(pair=>pair[0]||pair[1]).length,
    assignments:counts.map((pair,index)=>({
      index,light:pair[0],dark:pair[1]
    })).filter(pair=>pair.light||pair.dark)
  };
}
const sourceGate = allSecretLabelGate(source);
assert.deepEqual(
  [sourceGate.minMismatch,sourceGate.conflictingRunes,sourceGate.usedRunes],
  [9,8,23]
);
// Positive plant: create a valid finder under an arbitrary secret 2-class map.
// Only two of the 29 available rune labels are needed to represent the mask.
const plant=source.map(row=>row.slice());
for(let r=0;r<7;r++)for(let c=0;c<7;c++)
  plant[r][c]=finder(r,c)?4:22;
assert.equal(allSecretLabelGate(plant).minMismatch,0);
// Wrong-key/one-corrupted-module control: conflicting labels force an error.
plant[0][0]=22;
assert.equal(allSecretLabelGate(plant).minMismatch,1);
const orientations = {
  native:(r,c)=>[r,c],
  rotate90:(r,c)=>[10-c,r],
  rotate180:(r,c)=>[10-r,10-c],
  rotate270:(r,c)=>[c,10-r],
  mirrorH:(r,c)=>[r,10-c],
  mirrorV:(r,c)=>[10-r,c],
  transpose:(r,c)=>[c,r],
  antiTranspose:(r,c)=>[10-c,10-r]
};
const checks=Object.fromEntries(Object.entries(orientations).map(([name,project])=>{
  const transformed=Array.from({length:11},(_,r)=>
    Array.from({length:11},(_,c)=>{
      const [i,j]=project(r,c);
      return source[i][j];
    }));
  const gate=allSecretLabelGate(transformed);
  return [name,{minMismatch:gate.minMismatch,
    conflictingRunes:gate.conflictingRunes,usedRunes:gate.usedRunes}];
}));
assert.deepEqual(Object.values(checks).map(x=>x.minMismatch),[
  9,7,12,9,9,7,9,12
]);
console.log(JSON.stringify({
  source:"original 121-rune p32 matrix, top 563 left 569 source checksums",
  target:"11x11 Micro QR M1 dark/white finder; upper-left 7x7 required",
  orientation:"source-fixed native row-major, controls D4",
  original:sourceGate,
  orientations:checks,
  plantedValidFinderRecovered:0,
  plantedSingleIncorrectModuleDetected:1,
  verdict:"No global rune-identity->binary labeling can satisfy a Micro QR M1 finder in the original p32 11x11; at least nine of its 49 mandatory finder modules disagree."
},null,2));
