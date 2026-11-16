'use strict';
/**
 * Source-shaped extended GF31 Reed-Solomon 32x8 terminal product-code gate.
 * Original LP2 180 known p56+p57 runes reconstruct a hypothetical 76-rune
 * outer ring. 32 = 31 finite projective points plus infinity.
 *
 * Node.js 22 CommonJS SFT: node sims/lp2_terminal_gf31_extended_product_sft.cjs
 * No external dependencies, fitted keys, language-model choice, or CI writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/lp2-grid-256.json');
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(db.pages.slice(55).map(p=>p.indices.length),[76,85,95]);
/** @param {number} x @returns {number} */
const mod=x=>(x%31+31)%31;
/** @param {number} x @returns {number} */
function inverse(x){for(let y=1;y<31;y++)if(mod(x*y)===1)return y;throw Error('zero denominator');}
/**
 * Evaluate polynomial through supplied finite GF31 points at finite x.
 * x=null evaluates the projective infinity point, i.e. leading coefficient.
 * @param {number[]} xs @param {number[]} ys @param {number|null} x
 */
function L(xs,ys,x){
 assert.equal(xs.length,ys.length);
 assert.equal(new Set(xs).size,xs.length);
 let ans=0;
 for(let i=0;i<xs.length;i++){
  let term=ys[i];
  for(let j=0;j<xs.length;j++)if(i!==j)
   term=mod(term*(x===null?1:x-xs[j])*inverse(xs[i]-xs[j]));
  ans=mod(ans+term);
 }
 return ans;
}
/**
 * Extend native row-major 30x6 data to full 32x8 product code.
 * @param {number[]} data
 * @param {{infinityTop:boolean,reverseRows:boolean,reverseCols:boolean}} o
 * @returns {number[][]}
 */
function extend(data,o){
 assert.equal(data.length,180);
 const m=Array.from({length:32},()=>Array(8).fill(-1));
 const X=[1,2,3,4,5,6];
 for(let k=0;k<30;k++){
  const r=o.reverseRows?30-k:1+k;
  for(let j=0;j<6;j++)m[r][o.reverseCols?6-j:j+1]=data[k*6+j];
  const y=X.map(c=>m[r][c]);
  m[r][0]=L(X,y,0);m[r][7]=L(X,y,7);
 }
 const rows=Array.from({length:30},(_,i)=>i+1);
 const coords=rows.map(r=>o.infinityTop?r-1:r);
 for(let c=0;c<8;c++){
  const v=rows.map(r=>m[r][c]);
  m[0][c]=L(coords,v,o.infinityTop?null:0);
  m[31][c]=L(coords,v,o.infinityTop?30:null);
 }
 assert(m.flat().every(x=>x>=0&&x<31));
 return m;
}
/** @param {number[][]} m @returns {number[]} */
function ring(m){
 const out=[...m[0]];
 for(let r=1;r<32;r++)out.push(m[r][7]);
 for(let c=6;c>=0;c--)out.push(m[31][c]);
 for(let r=30;r>=1;r--)out.push(m[r][0]);
 assert.equal(out.length,76);
 return out;
}
/** @param {number} n @returns {number[]} */
function primes(n){
 const ps=[];
 for(let v=2;ps.length<n;v++){
  let p=true;for(let k=2;k*k<=v;k++)if(v%k===0){p=false;break;}
  if(p)ps.push(v);
 }
 return ps;
}
const seq=primes(85);
let clock=0;
const plain56=db.pages[56].indices.map((c,i)=>
 i===56?0:(c-(seq[clock++]-1)+29000)%29);
assert.equal(clock,84);
assert.deepEqual(plain56.slice(0,5),[24,9,18,9,23]); // AN END
const known=plain56.concat(db.pages[57].indices);
assert.equal(known.length,180);
const c55=db.pages[55].indices;
const result=[];
for(const infinityTop of [false,true])
for(const reverseRows of [false,true])
for(const reverseCols of [false,true]){
 const o={infinityTop,reverseRows,reverseCols};
 const m=extend(known,o),restored=[];
 for(let k=0;k<30;k++){
  const r=reverseRows?30-k:1+k;
  for(let j=0;j<6;j++)restored.push(m[r][reverseCols?6-j:j+1]);
 }
 assert.deepEqual(restored,known);
 const border=ring(m),illegal=border.flatMap((v,i)=>v>=29?[i]:[]);
 let best=0;
 for(const corner of [0,7,38,45])for(const dir of [-1,1]){
  let match=0;
  for(let i=0;i<76;i++)match+=Number(border[(corner+dir*i+152)%76]===c55[i]);
  best=Math.max(best,match);
 }
 // Synthetic native-geometry positive: exact 180/180 and 76/76 inversion.
 const plant=Array.from({length:180},(_,i)=>mod(i*i*7+i*19+13));
 const pm=extend(plant,o),back=[];
 for(let k=0;k<30;k++){
  const r=reverseRows?30-k:1+k;
  for(let j=0;j<6;j++)back.push(pm[r][reverseCols?6-j:j+1]);
 }
 assert.deepEqual(back,plant);
 assert.deepEqual(extend(back,o),pm);
 assert.equal(ring(pm).length,76);
 result.push({...o,forbiddenGp29Values:illegal.length,
  forbiddenOffsets:illegal,bestPrintedCipherMatches:best});
}
assert.deepEqual(result.map(r=>r.forbiddenGp29Values),[5,5,3,3,5,5,3,3]);
assert.deepEqual(result.map(r=>r.bestPrintedCipherMatches),[3,3,4,4,4,4,4,4]);
const byteRows=Array.from({length:32},(_,r)=>grid.bytes.slice(r*8,r*8+8).map(x=>x%31));
const interior=byteRows.slice(1,31).flatMap(row=>row.slice(1,7));
const predicted=ring(extend(interior,{infinityTop:false,reverseRows:false,reverseCols:false}));
const sourceBorderMatches=predicted.filter((v,i)=>v===ring(byteRows)[i]).length;
assert.equal(sourceBorderMatches,1);
console.log(JSON.stringify({
 source:'Original 256-cell table, original p55-57, source-authentic p56 inversion',
 geometry:'32x8, 180 known interior + 76 perimeter',field:31,
 sourceGridPerimeterMatches:sourceBorderMatches,
 variants:result,
 conclusion:'All eight systematic direct GP29 decoders require 3-5 forbidden rune indices. No unknown plaintext recovered.'
},null,2));
console.log('PASS: source input and synthetic 76/76 positives');
