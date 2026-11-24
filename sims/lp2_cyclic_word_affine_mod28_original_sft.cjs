"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"../resources/liber-primus");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const parts=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8").split("%");
/** @param {string} s @returns {number[][]} */
const words=s=>(s.replace(/[\/\s]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,c=>corpus.runes.indexOf(c)));
const nonempty=corpus.pages.filter(p=>p.runic_count>0);
assert.equal(parts.length,nonempty.length);
for(let i=0;i<parts.length;i++)assert.deepEqual(words(parts[i]).flat(),nonempty[i].indices);
const unknown=nonempty.filter(p=>p.page<56);
const w=words(parts.slice(0,unknown.length).join(""));
assert.equal(w.length,2896);
assert.deepEqual(w.flat(),unknown.flatMap(p=>p.indices));
assert.equal(w.flat().length,12956);
const single=w.map((v,t)=>({t,c:v[0],len:v.length})).filter(x=>x.len===1);
const ordinary=single.filter(x=>x.c!==28);
assert.equal(single.length,83);
assert.equal(ordinary.length,79);
/** @param {number} x @param {number} n */
const mod=(x,n)=>((x%n)+n)%n;
const stats=Array.from({length:28},(_,d)=>{
 const h=Array(28).fill(0);
 for(const {t,c} of ordinary)h[mod(c-d*t,28)]++;
 h.sort((a,b)=>b-a);
 const mass=k=>h.slice(0,k).reduce((a,b)=>a+b,0);
 return {d,types:h.filter(Boolean).length,top2:mass(2),top3:mass(3),top8:mass(8),top12:mass(12)};
});
console.table(stats);
const minTypes=Math.min(...stats.map(x=>x.types));
assert.equal(minTypes,23);
const maxMass=k=>Math.max(...stats.map(x=>x["top"+k]));
assert.equal(maxMass(3),22);assert.equal(maxMass(8),46);assert.equal(maxMass(12),59);
const units=Array.from({length:28},(_,a)=>a).filter(a=>Array.from({length:28},(_,x)=>x).some(x=>mod(a*x,28)===1));
assert.equal(units.length,12);
const sets=[[10,24],[3,10,24],[0,1,3,10,18,24,26,25,12,22,27,28]];
const best=sets.map(S=>{
 let max=0;
 for(const a of units){
  const inv=units.find(x=>mod(a*x,28)===1);
  for(let b=0;b<28;b++)for(let d=0;d<28;d++){
   let hit=0;
   for(const {t,c} of single)if(S.includes(c===28?28:mod(inv*(c-b-d*t),28)))hit++;
   max=Math.max(max,hit);
  }
 }
 return max;
});
assert.deepEqual(best,[13,18,52]);
const witness=[single.find(x=>x.t===54),single.find(x=>x.t===516)];
assert.deepEqual(witness.map(x=>x.c),[15,3]);
assert.equal(mod(witness[1].t-witness[0].t,14),0);
assert.notEqual(mod(witness[1].c-witness[0].c,14),0);
console.log({minTypesIncludingFixedEA:minTypes+1,bestAI:best[0],bestAIO:best[1],bestBroad:best[2],witness});
/** @param {bigint} x @param {bigint} n */
const modBig=(x,n)=>((x%n)+n)%n;
/** @param {number[]} w @param {number} t @param {boolean} reverse */
function transform(w,t,reverse=false){
 const L=w.length,M=29n**BigInt(L)-1n,x=w.reduce((v,d)=>v*29n+BigInt(d),0n);
 const k=13n+17n*BigInt(t);
 if(x===M)return w.slice();
 let y=reverse?modBig((x-k)*29n**BigInt(L-1),M):modBig(29n*x+k,M);
 const out=Array(L);
 for(let i=L-1;i>=0;i--){out[i]=Number(y%29n);y/=29n;}
 return out;
}
const native=words(parts[parts.length-1]);
assert.equal(native.length,20);assert.equal(native.flat().length,95);
const encrypted=native.map((x,t)=>transform(x,t));
assert.deepEqual(encrypted.map((x,t)=>transform(x,t,true)),native);
const ref=fs.readFileSync(path.join(root,"lp1-plaintext-reference.txt"),"utf8").split("### 56")[0];
const ai=ref.split("\n").filter(l=>!l.startsWith("#")&&!l.startsWith("[")&&!l.startsWith("(")).join(" ").match(/\b(?:A|I)\b/g).map(x=>x==="A"?24:10);
const plant=ai.map((x,t)=>({t,c:transform([x],t)[0]}));
assert.equal(plant.length,32);
assert.deepEqual(plant.map(x=>transform([x.c],x.t,true)[0]),ai);
const fits=[];
for(let d=0;d<14;d++)if(new Set(plant.map(x=>mod(x.c-d*x.t,14))).size===1)fits.push([d,mod(plant[0].c-d*plant[0].t,14)]);
assert.deepEqual(fits,[[3,9]]);
assert.deepEqual(transform(transform([28],0),0,true),[28]);
assert.deepEqual([transform([1,0],0),transform([2,0],0)],[[0,14],[0,15]]);
console.log("PASS: authentic p57 20-word exact replay; LP1 A/I extracted 32-singleton plant recovered projected slope/intercept; original all-secret singleton obstruction.");
