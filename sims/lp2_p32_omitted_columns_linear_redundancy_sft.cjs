"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const c=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
/** @param {number} x */
const mod=x=>((x%29)+29)%29;
/** @param {number[][]} input */
function rank(input){
 const a=input.map(row=>row.map(mod));let k=0,det=1;
 for(let j=0;j<a[0].length&&k<a.length;j++){
  const i=a.findIndex((row,i)=>i>=k&&row[j]!==0);
  if(i<0)continue;
  if(i!==k){[a[i],a[k]]=[a[k],a[i]];det=mod(-det);}
  const v=a[k][j];det=mod(det*v);let inv=1;while(mod(inv*v)!==1)inv++;
  a[k]=a[k].map(x=>mod(x*inv));
  for(let i=k+1;i<a.length;i++){const m=a[i][j];a[i]=a[i].map((x,t)=>mod(x-m*a[k][t]));}
  k++;
 }
 return {rank:k,det:input.length===input[0].length?(k===input.length?det:0):null};
}
/** @param {number[][]} a */
function transpose(a){return a[0].map((_,j)=>a.map(row=>row[j]));}
const p=c.pages.find(x=>x.page===32).indices;
assert.equal(p.length,121);
const rows=Array.from({length:11},(_,i)=>p.slice(i*11,(i+1)*11));
const projected=new Set(Array.from({length:256},(_,s)=>11*(Math.floor(s/8)%11)+s%8));
assert.equal(projected.size,88);
assert.equal([...projected].every(i=>i%11<8),true);
const data=rows.map(row=>row.slice(0,8));
const original={rank:rank(rows),transpose:rank(transpose(rows)),data:rank(data),affineData:rank(data.map(row=>[...row,1])),prime:rank(rows.map(row=>row.map(x=>c.prime[x])))};
assert.equal(original.rank.rank,11);assert.equal(original.transpose.rank,11);assert.equal(original.data.rank,8);assert.equal(original.affineData.rank,9);assert.equal(original.prime.rank,11);
// Native systematic linear, affine, and independently row/column biased controls.
const key=Array.from({length:8},(_,i)=>Array.from({length:3},(_,j)=>mod(7*i+11*j+i*j)));
const control=data.map(row=>[...row,...Array.from({length:3},(_,j)=>mod(row.reduce((s,x,i)=>s+x*key[i][j],0)))]);
const affine=control.map(row=>row.map((x,j)=>mod(x+(j>=8?2*j+1:0))));
const biased=control.map((row,i)=>row.map((x,j)=>mod(x+i*i+j*j*j)));
assert.equal(rank(control).rank,8);
assert.ok(rank(affine).rank<=9);
assert.ok(rank(biased).rank<=10);
console.log(JSON.stringify({original,control:{linear:rank(control),affine:rank(affine),biased:rank(biased)}},null,2));
