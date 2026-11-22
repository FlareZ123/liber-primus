'use strict';
/**
 * Source-exact p0 original red-title SECUENDI RATIO candidate and 27x27
 * geometry randomization. Node 22 CommonJS, read-only, no packages.
 * A conditional shuffled-grid control cannot authenticate a selected crib.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const original=data.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(original.length,729);
const glyph=n=>data.translit[n];
const title=original.slice(0,13),key8=[14,9,14,5],key5=[11,2,2];
assert.equal(title.slice(0,8).map(glyph).join(''),'SHEOGMIAF');
assert.equal(title.slice(8).map(glyph).join(''),'SYENGC');
const first=title.slice(0,8).reverse().map((v,i)=>(v-key8[i%4]+29)%29);
const second=title.slice(8).map((v,i)=>(v-key5[i%3]+29)%29);
assert.equal(first.map(glyph).join(''),'SECUENDI');
assert.equal(second.map(glyph).join(''),'RATIO');
assert.deepEqual(first.map((v,i)=>(v+key8[i%4])%29),title.slice(0,8).reverse());
assert.deepEqual(second.map((v,i)=>(v+key5[i%3])%29),title.slice(8));
/** @param {number} i */
function row(i){return Math.floor(i/27)}
/** @param {number} i */
function col(i){return i%27}
/** @param {number[]} grid @param {number} r @param {number} c */
function at(grid,r,c){return grid[27*r+c]}
/** X,N,X,C around one rectangle, source-clockwise, with reverse read identical. 
 * @param {number[]} grid */
function rectangles(grid){
 const xs=[];for(let i=0;i<729;i++)if(grid[i]===14)xs.push(i);
 let total=0;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
  const a=xs[i],b=xs[j],ra=row(a),rb=row(b),ca=col(a),cb=col(b);
  if(ra===rb||ca===cb)continue;
  const north=Math.min(ra,rb),south=Math.max(ra,rb),west=Math.min(ca,cb),east=Math.max(ca,cb);
  if((ra<rb)===(ca<cb)){
    if(at(grid,north,east)===9&&at(grid,south,west)===5)total++;
  }else{
    if(at(grid,north,west)===9&&at(grid,south,east)===5)total++;
  }
 }
 return total;
}
const paths=[];
for(let s=0;s<729;s++)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
 if(!dr&&!dc)continue;
 for(let distance=1;distance<=13;distance++){
  const r1=row(s)+distance*dr,c1=col(s)+distance*dc;
  const r2=row(s)+2*distance*dr,c2=col(s)+2*distance*dc;
  if(Math.min(r1,c1,r2,c2)<0||Math.max(r1,c1,r2,c2)>26)continue;
  paths.push([s,r1*27+c1,r2*27+c2]);
 }
}
assert.equal(paths.length,29952);
/** J, center in {O,R,G} (totient of rune index equals 2), TH.
 * The source center R at (18,17) is one of these.
 * @param {number[]} grid
 */
function triples(grid){
 let total=0;
 for(const [a,b,c] of paths){
  const m=grid[b];
  if(grid[a]===11&&grid[c]===2&&(m===3||m===4||m===6))total++;
 }
 return total;
}
assert.equal(at(original,5,2),14);
assert.equal(at(original,5,8),9);
assert.equal(at(original,23,8),14);
assert.equal(at(original,23,2),5);
assert.equal(at(original,12,11),11);
assert.equal(at(original,17,16),4);
assert.equal(at(original,22,21),2);
const observed={rectangle:rectangles(original),totientTriple:triples(original)};
assert.deepEqual(observed,{rectangle:1,totientTriple:6});

let state=0x47a11fee;
/** Reproducible xorshift32 for the explicitly conditional null, not encryption. */
function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
const iterations=10000;
const copy=original.slice();
let rAtLeast=0,tAtLeast=0,joint=0;
for(let t=0;t<iterations;t++){
 for(let k=728;k>=13;k--){
  const j=13+rng()%(k-12);
  const v=copy[k];copy[k]=copy[j];copy[j]=v;
 }
 const r=rectangles(copy),q=triples(copy);
 if(r>=1)rAtLeast++;
 if(q>=6)tAtLeast++;
 if(r>=1&&q>=6)joint++;
}
assert.equal(rAtLeast,3919);
assert.equal(tAtLeast,2010);
assert.equal(joint,822);
console.log(JSON.stringify({
 firstTitle:'SECUENDI',secondTitle:'RATIO',
 firstKey:key8,secondKey:key5,source27square:729,
 observed,randomization:{
  n:iterations,seed:'0x47a11fee',
  null:'first13 original symbols fixed; remaining 716 shuffled without replacement',
  pRectangle:(rAtLeast+1)/(iterations+1),
  pTriple:(tAtLeast+1)/(iterations+1),
  pJoint:(joint+1)/(iterations+1)
 }
},null,2));