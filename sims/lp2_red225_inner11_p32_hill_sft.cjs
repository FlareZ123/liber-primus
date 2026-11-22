"use strict";
/**
 * Original 225 red runes -> 15x15 -> peel two borders -> 11x11 matrix
 * as a proposed source-key for original p32's 11x11 GP29 cipher register.
 *
 * This is an exact GF29 Hill existence test; the source selects neither
 * Hill multiplication nor the red peel, so report only the bounded result.
 *
 * Windows 11, Node.js 22: node sims/lp2_red225_inner11_p32_hill_sft.cjs
 *
 * @typedef {{rank:number,pivots:number[],free:number[],basis:number[][]}} Kernel
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const red=ink.pages.flatMap(p=>(p.red_spans||[]).flatMap(s=>{
  const page=corpus.pages.find(q=>q.page===p.page);
  assert.ok(page,"Missing annotated page");
  return page.indices.slice(s.start,s.start+s.length);
}));
assert.equal(red.length,225);
const p32=corpus.pages.find(p=>p.page===32).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p32.length,121);
assert.equal(p57.length,95);
const mod=n=>(n%29+29)%29;
const source=Array.from({length:11},(_,r)=>
  Array.from({length:11},(_,c)=>red[(r+2)*15+c+2]));
/** @param {number[][]} matrix @returns {number[][]} */
function transpose(matrix){
  return matrix[0].map((_,j)=>matrix.map(row=>row[j]));
}
/** @param {number[][]} matrix @returns {Kernel} */
function nullspace(matrix){
  const a=matrix.map(row=>row.slice());
  const n=a.length;
  assert.equal(n,a[0].length);
  const pivots=[];
  let row=0;
  for(let col=0;col<n;col++){
    let pivot=row;
    while(pivot<n&&a[pivot][col]===0)pivot++;
    if(pivot===n)continue;
    [a[row],a[pivot]]=[a[pivot],a[row]];
    let inv=1;
    while(mod(inv*a[row][col])!==1)inv++;
    a[row]=a[row].map(v=>mod(v*inv));
    for(let other=0;other<n;other++){
      if(other===row)continue;
      const coefficient=a[other][col];
      a[other]=a[other].map((v,j)=>mod(v-coefficient*a[row][j]));
    }
    pivots.push(col);
    row++;
  }
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!pivots.includes(i));
  const basis=free.map(f=>{
    const v=Array(n).fill(0);
    v[f]=1;
    for(let i=0;i<pivots.length;i++)v[pivots[i]]=mod(-a[i][f]);
    return v;
  });
  for(const v of basis)assert.ok(matrix.every(row=>mod(row.reduce((sum,x,i)=>sum+x*v[i],0))===0));
  return {rank:pivots.length,pivots,free,basis};
}
/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function multiply(matrix,vector){
  return matrix.map(row=>mod(row.reduce((s,v,i)=>s+v*vector[i],0)));
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function dot(a,b){
  return mod(a.reduce((s,x,i)=>s+x*b[i],0));
}
const blocks={
  row: Array.from({length:11},(_,i)=>p32.slice(i*11,i*11+11)),
  column: Array.from({length:11},(_,i)=>Array.from({length:11},(_,j)=>p32[11*j+i]))
};
const variants=[];
for(const [key,matrix] of [["printed",source],["transpose",transpose(source)]]){
  const left=nullspace(transpose(matrix));
  const right=nullspace(matrix);
  assert.equal(left.rank,10);
  assert.equal(right.rank,10);
  assert.equal(left.basis.length,1);
  assert.equal(right.basis.length,1);
  for(const [read,originalBlocks] of Object.entries(blocks)){
    const obstruction=originalBlocks.map(vector=>dot(left.basis[0],vector));
    const zero=obstruction.filter(x=>x===0).length;
    assert.ok(zero<11,"Unexpectedly all source blocks lie in source-key column space");
    // Construct genuine p57-native GP29 plant under this singular but exact
    // forward operator, then confirm every planted block obeys the same gate.
    const planted=Array.from({length:11},(_,j)=>
      multiply(matrix,Array.from({length:11},(_,k)=>p57[(j*11+k)%p57.length])));
    assert.ok(planted.every(block=>dot(left.basis[0],block)===0));
    assert.deepEqual(planted,Array.from({length:11},(_,j)=>
      multiply(matrix,Array.from({length:11},(_,k)=>p57[(j*11+k)%p57.length]))));
    variants.push({
      key,read,rank:10,sourceLeftNullVector:left.basis[0],
      originalBlockSyndromes:obstruction,invalidBlocks:11-zero,
      plantedGP57BlocksPassing:11,sourceCiphertextHillCompatible:false
    });
  }
}
assert.deepEqual(variants.map(v=>v.invalidBlocks),[10,11,10,10]);
console.log(JSON.stringify({
  status:"PASS",
  evidence:"Exact necessary GF29 Hill column-space failure on original p32 ciphertext",
  source:"all 225 original red runes as 15x15, peel two concentric borders; centre 11x11 is singular rank10",
  matrixFirstRow:source[0],knownSource:{redRunes:225,p32Runes:121,p57ControlRunes:95},
  variants,positiveControls:"All 11 genuine GP57 native planted blocks passed each left-kernel syndrome"
},null,2));
