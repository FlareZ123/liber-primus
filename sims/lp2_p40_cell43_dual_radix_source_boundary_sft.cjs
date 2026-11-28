"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"
));
const tokens=grid.rows.flat();
assert.equal(tokens.length,256);
const a60=grid.alphabet;
const a59=a60.replace("f","");
assert.equal(a60.length,60);
assert.equal(a59.length,59);

/** @param {string} token @param {string} alphabet @param {number} radix */
function value(token,alphabet,radix){
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  if(hi<0||lo<0) return null;
  return radix*hi+lo;
}

const rows=[];
for(let cell=0;cell<tokens.length;cell+=1){
  const token=tokens[cell];
  const v59=value(token,a59,59),v60=value(token,a60,60);
  if(v59===null||v60===null) continue;
  rows.push({
    cell,token,v59,v60,
    d59:v59-cell,
    d60:v60-cell,
  });
}
const boundaryHits=rows.filter(r=>r.d59===29&&r.d60===30);
assert.deepEqual(boundaryHits,[{
  cell:43,token:"1D",v59:72,v60:73,d59:29,d60:30,
}]);

const cell43=rows.find(r=>r.cell===43);
assert.ok(cell43);
assert.deepEqual(cell43,boundaryHits[0]);

console.log(JSON.stringify({
  status:"PASS",
  chargedCells:rows.length,
  selectedCell43:cell43,
  sourceBoundary:{
    establishedZeroBasedWordIndex29:"DIRECTION",
    establishedZeroBasedWordIndex30:"SEEK",
    establishedTail:"SEEK ... OPENPGP = indices30..42",
  },
  exactOrderedDisplacementPairHits:boundaryHits,
  conclusion:"Across every p50 cell readable under both base59 and base60, cell43 alone has forward pointer displacements [29,30]. Those are exactly the established zero-based authenticated-source boundary indices DIRECTION/SEEK. This is a unique post-discovery cross-artifact convergence; it does not itself choose a radix or decode LP2 plaintext.",
},null,2));
