"use strict";
const fs=require("node:fs"), path=require("node:path"), assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const ref=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const digest=ref.match(/HASHES TO\s+([0-9a-f]+)\s+([0-9a-f]+)/i).slice(1).join("").toLowerCase();
/** @param {{pages:Array<{tokens:string[]}>}} grid @param {string} digest */
function run(grid,digest){
 const t=grid.pages.flatMap(p=>p.tokens);
 assert.equal(t.length,256);assert.match(digest,/^[0-9a-f]{128}$/);
 const edges=Array.from({length:128},(_,i)=>[t[8*(i>>2)+i%4],t[8*(i>>2)+7-i%4]]);
 assert.equal(new Set(t).size,161);
 function witnesses(d){
  const seen=new Map(),par=new Map();let equal=null,parity=null;
  for(let i=0;i<edges.length;i++){
   const [l,r]=edges[i],key=r+"|"+d[i];
   if(!equal&&seen.has(key)&&edges[seen.get(key)][0]!==l){
    const j=seen.get(key);equal={right:r,indices:[j,i],left:[edges[j][0],l],values:[d[j],d[i]]};
   }
   if(!parity&&par.has(r)&&((d[par.get(r)]^d[i])&1)){
    const j=par.get(r);parity={right:r,indices:[j,i],left:[edges[j][0],l],values:[d[j],d[i]]};
   }
   seen.set(key,i);par.set(r,i);
  }
  return {oddCoefficientImpossible:equal,evenCoefficientImpossible:parity};
 }
 const original=[];
 for(const reverseRows of [false,true])for(const reversePairs of [false,true])for(const encoding of ["nibble","ascii"]){
  const d=edges.map((_,i)=>{const c=digest[4*(reverseRows?31-(i>>2):i>>2)+(reversePairs?3-i%4:i%4)];return encoding==="nibble"?parseInt(c,16):c.charCodeAt(0)});
  const w=witnesses(d);assert.ok(w.oddCoefficientImpossible);assert.ok(w.evenCoefficientImpossible);
  original.push({reverseRows,reversePairs,encoding,...w});
 }
 const id=new Map([...new Set(t)].map((v,i)=>[v,i]));
 const L=v=>(73*id.get(v)+19)&255,R=v=>(151*id.get(v)+7)&255;
 assert.equal(new Set([...id.keys()].map(L)).size,161);
 assert.equal(new Set([...id.keys()].map(R)).size,161);
 const controls=[];
 for(const a of [0,2,127,128,255])for(const b of [0,1,72,255]){
  const d=edges.map(([l,r])=>(a*L(l)+b*R(r)+53)&255),w=witnesses(d);
  assert.equal(a&1?w.oddCoefficientImpossible:w.evenCoefficientImpossible,null);
  controls.push({a,b,passed:true});
 }
 return {original,controls};
}
console.log(JSON.stringify(run(grid,digest),null,2));
