"use strict";
/**
 * Source-visible p54 red9 as one 3x3 GF29 stencil on the printed 32x8 table.
 *
 * A 3x3 valid convolution of a 32x8 matrix is 30x6 = 180 symbols,
 * exactly the independently solved LP2 p56 (85 GP runes) plus p57 (95).
 * The nine p54 red runes fix one natural kernel. More importantly, an
 * exact rank test excludes every unknown 3x3 linear kernel (with optional
 * global bias) in the fixed original row-major register.
 *
 * Run: node sims/lp2_p54_red9_valid_convolution_original_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const mod=x=>((x%29)+29)%29;
assert.equal(grid.bytes.length,256);
assert.equal(grid.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");
const p56=corpus.pages.find(p=>p.page===56).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p56.length,85);
assert.equal(p57.length,95);
/** Independent established p56 plaintext retaining GP orthography. */
const p56Words="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const sorted=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} sentence @returns {number[]} */
function toGP(sentence){
  const out=[];
  for(const w of sentence.split(" ")){
    for(let i=0;i<w.length;){
      const found=sorted.find(x=>w.startsWith(x.s,i));
      assert.ok(found,"unparsed GP letter");
      out.push(found.i);
      i+=found.s.length;
    }
  }
  return out;
}
const known=[...toGP(p56Words),...p57];
assert.equal(known.length,180);
const red54=ink.pages.find(p=>p.page===54).red_spans.flatMap(span=>
  [...span.runes].map(r=>corpus.runes.indexOf(r)));
assert.deepEqual(red54,[24,19,21,23,27,2,14,10,19]);
assert.deepEqual(corpus.pages.find(p=>p.page===54).indices.slice(0,9),red54);
/** 180x9 source matrix in the sole natural valid-convolution register. */
const X=[];
for(let r=1;r<=30;r++)for(let c=1;c<=6;c++){
  const cell=[];
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)
    cell.push(grid.bytes[(r+dr)*8+c+dc]%29);
  X.push(cell);
}
assert.deepEqual([X.length,X[0].length],[180,9]);
/** @param {number[][]} rows @returns {number} */
function rank(rows){
  const a=rows.map(row=>row.map(mod));
  let pivotRow=0;
  for(let col=0;col<a[0].length&&pivotRow<a.length;col++){
    let r=pivotRow;
    while(r<a.length&&a[r][col]===0)r++;
    if(r===a.length)continue;
    [a[r],a[pivotRow]]=[a[pivotRow],a[r]];
    let inverse=1;
    while(mod(a[pivotRow][col]*inverse)!==1)inverse++;
    for(let k=col;k<a[0].length;k++)
      a[pivotRow][k]=mod(a[pivotRow][k]*inverse);
    for(let rr=pivotRow+1;rr<a.length;rr++){
      const factor=a[rr][col];
      if(!factor)continue;
      for(let k=col;k<a[0].length;k++)
        a[rr][k]=mod(a[rr][k]-factor*a[pivotRow][k]);
    }
    pivotRow++;
  }
  return pivotRow;
}
/** @param {number[][]} matrix @param {number[]} output */
function modelRank(matrix,output){
  const rankA=rank(matrix),rankAug=rank(matrix.map((row,i)=>[...row,output[i]]));
  let firstContradiction=null;
  for(let n=1;n<=Math.min(25,matrix.length);n++){
    if(rank(matrix.slice(0,n))!==rank(matrix.slice(0,n)
      .map((row,i)=>[...row,output[i]]))){
      firstContradiction=n;
      break;
    }
  }
  return {rankA,rankAug,firstContradiction,consistent:rankA===rankAug};
}
/** @param {number[]} kernel */
const apply=kernel=>X.map(row=>mod(row.reduce((s,v,i)=>s+v*kernel[i],0)));
const clockwiseCenter=Array(9);
clockwiseCenter[4]=red54[0];
for(const [slot,source] of [[0,1],[1,2],[2,3],[5,4],
  [8,5],[7,6],[6,7],[3,8]]) clockwiseCenter[slot]=red54[source];
assert.deepEqual(clockwiseCenter,[19,21,23,19,24,27,10,14,2]);
const direct=[
  ["printed-nine-row-major",red54],
  ["oversized-first-center-clockwise",clockwiseCenter],
].map(([name,kernel])=>{
  const output=apply(kernel);
  return {name,kernel,
    matchesKnownPlain:output.filter((x,i)=>x===known[i]).length,
    matchesPrintedRuneStream:output.filter((x,i)=>
      x===[...p56,...p57][i]).length,
    first60Translit:output.slice(0,60).map(i=>corpus.translit[i]).join("")};
});
assert.deepEqual(direct.map(x=>x.matchesKnownPlain),[6,3]);
const models=[];
for(const bias of [false,true]){
  const matrix=X.map(row=>bias?[...row,1]:row);
  const original=modelRank(matrix,known);
  const planted=matrix.map(row=>mod(row.reduce(
    (s,v,i)=>s+v*((i*7+3)%29),0)));
  assert.deepEqual(modelRank(matrix,planted),{
    rankA:matrix[0].length,rankAug:matrix[0].length,
    firstContradiction:null,consistent:true
  });
  assert.equal(original.consistent,false);
  models.push({bias,unknownCoefficients:matrix[0].length,...original,
    exactPositiveControl:true});
}
assert.deepEqual(models.map(x=>x.firstContradiction),[10,11]);
console.log(JSON.stringify({
  originalSource:"LP2 original p50 32x8 table, p54 nine red runes, independently established p56/p57 plaintext",
  sourceDimensions:{printed:[32,8],kernel:[3,3],validOutput:[30,6],
    knownPlainGpRunes:known.length},
  directSourceKernels:direct,allSecretLinearKernelRankTests:models,
  status:"NO DIRECT INTERIOR PAYLOAD OR SECRET LINEAR 3x3 KERNEL FITS THE ORIGINAL SOLVED PAGES"
},null,2));
