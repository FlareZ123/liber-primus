"use strict";
/**
 * Original p15 16-cell Fibonacci-prime spiral: consecutive pairs as
 * eight *page-private* two-word Fibonacci-autokey seeds for pp15..22.
 * Distinct from global-clock/all-IV prior tests.
 *
 * Source SFT. Windows 11 Node.js 22.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","resources","liber-primus");
const g=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const matrix=[[3258,3222,3152,3038],[3278,3299,3298,2838],
[3288,3294,3296,2472],[4516,1206,708,1820]];
const spiralCoords=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const spiral=spiralCoords.map(([r,c])=>matrix[r][c]);
assert.deepEqual(spiral,[3299,3298,3296,3294,3288,3278,3258,3222,
 3152,3038,2838,2472,1820,708,1206,4516]);
const mod=n=>(n%29+29)%29;
const seeds=Array.from({length:8},(_,i)=>[mod(spiral[2*i]),mod(spiral[2*i+1])]);
assert.deepEqual(seeds,[[22,21],[19,17],[11,1],[10,3],[20,22],
[25,7],[22,12],[17,21]]);
const page=g.pages.filter(p=>p.page>=15&&p.page<=22);
assert.equal(page.length,8);
assert.equal(page.reduce((n,p)=>n+p.indices.length,0),1903);
assert(g.pages[57].indices.length>=95);
const positive=g.pages[57].indices;
/** @param {number[]} values */
function ioc(values){
 const cnt=Array(29).fill(0);
 for(const v of values)cnt[v]++;
 return cnt.reduce((n,k)=>n+k*(k-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} cipher @param {number[]} initial @param {string} mode @param {number} sign */
function inverse(cipher,initial,mode,sign){
 const k=initial.slice(),plain=[];
 for(let i=0;i<cipher.length;i++){
  const p=mod(cipher[i]-sign*k[i]);
  plain.push(p);
  k.push(mod(k[i]+k[i+1]+(mode==="cipher"?cipher[i]:p)));
 }
 return plain;
}
/** @param {number[]} plain @param {number[]} initial @param {string} mode @param {number} sign */
function forward(plain,initial,mode,sign){
 const k=initial.slice(),cipher=[];
 for(let i=0;i<plain.length;i++){
  const c=mod(plain[i]+sign*k[i]);
  cipher.push(c);
  k.push(mod(k[i]+k[i+1]+(mode==="cipher"?c:plain[i])));
 }
 return cipher;
}
const results=[];
for(const feedback of ["cipher","plain"])for(const sign of [1,-1]){
 const decr=page.map((p,i)=>inverse(p.indices,seeds[i],feedback,sign));
 for(let i=0;i<8;i++){
  assert.deepEqual(forward(decr[i],seeds[i],feedback,sign),page[i].indices);
  const donor=Array.from({length:page[i].indices.length},
    (_,j)=>positive[j%positive.length]);
  const c=forward(donor,seeds[i],feedback,sign);
  assert.deepEqual(inverse(c,seeds[i],feedback,sign),donor);
 }
 const values=decr.flat();
 const score=ioc(values);
 assert(score<0.04);
 results.push({feedback,sign,originalRunes:values.length,
   originalIoC:score,pageIoCs:decr.map(ioc),nativeControlFirstPageIoC:
   ioc(Array.from({length:page[0].indices.length},(_,j)=>positive[j%positive.length]))});
}
console.log(JSON.stringify({source:"Original LP2 pp15-22, all 1903 GP29 runes",
 pairs:seeds,results},null,2));
console.log("PASS: all four source-locked page-private two-seed Fibonacci feedback inverses are nonnative; 1903/1903 forward replay and planted positive recovery each.");
