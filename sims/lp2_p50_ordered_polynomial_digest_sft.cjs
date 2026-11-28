"use strict";
const fs=require("node:fs"), path=require("node:path"), assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const ref=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const digest=ref.match(/HASHES TO\s+([0-9a-f]+)\s+([0-9a-f]+)/i).slice(1).join("").toLowerCase();
/** @param {{pages:Array<{tokens:string[]}>}} grid @param {string} digest */
function run(grid,digest){
 const t=grid.pages.flatMap(p=>p.tokens);
 assert.equal(t.length,256);assert.equal(digest.length,128);
 const edges=Array.from({length:128},(_,i)=>[t[8*(i>>2)+i%4],t[8*(i>>2)+7-i%4]]);
 function check(d,u){
  const seen=new Map(),leftOne=new Map(),rightOne=new Map();
  for(let i=0;i<edges.length;i++){
   const [l,r]=edges[i],k=r+"|"+d[i],j=seen.get(k);
   if(j!==undefined&&edges[j][0]!==l&&(d[i]&1)!==u)return {type:"equal-output",indices:[j,i],right:r,output:d[i]};
   seen.set(k,i);
   if((d[i]&1)!==u){leftOne.set(l,i);rightOne.set(r,i)}
  }
  for(let i=0;i<edges.length;i++){
   const [l,r]=edges[i];
   if((d[i]&1)===u&&leftOne.has(l)&&rightOne.has(r))return {type:"product",indices:[leftOne.get(l),rightOne.get(r),i],left:l,right:r,outputs:[d[leftOne.get(l)],d[rightOne.get(r)],d[i]]};
  }
  return null;
 }
 const original=[];
 for(const reverseRows of [false,true])for(const reversePairs of [false,true])for(const encoding of ["nibble","ascii"]){
  const d=edges.map((_,i)=>{const c=digest[4*(reverseRows?31-(i>>2):i>>2)+(reversePairs?3-i%4:i%4)];return encoding==="nibble"?parseInt(c,16):c.charCodeAt(0)});
  const u0=check(d,0),u1=check(d,1);assert.ok(u0);assert.ok(u1);
  original.push({reverseRows,reversePairs,encoding,u0,u1});
 }
 const id=new Map([...new Set(t)].map((v,i)=>[v,i]));
 const L=v=>(73*id.get(v)+19)&255,R=v=>(151*id.get(v)+7)&255;
 assert.equal(new Set([...id.keys()].map(L)).size,161);
 const controls=[];
 for(const a of [1,3,129,255])for(const b of [0,1])for(const c of [0,1])for(const e of [0,1]){
  const d=edges.map(([l,r])=>(a*L(l)*R(r)+b*L(l)+c*R(r)+e)&255),u=(e+b*c)&1;
  assert.equal(check(d,u),null);
  controls.push({a,b,c,e,u});
 }
 for(const b of [0,1])for(const c of [0,1])for(const e of [0,1]){
  const f=r=>r*r*r+2*r*r+b,g=r=>7*c*r*r+e;
  const d=edges.map(([l,r])=>(f(R(r))*L(l)+g(R(r)))&255),u=(c*b+e)&1;
  assert.equal(check(d,u),null);controls.push({polynomial:true,b,c,e,u});
 }
 return {original,controls};
}
console.log(JSON.stringify(run(grid,digest),null,2));
