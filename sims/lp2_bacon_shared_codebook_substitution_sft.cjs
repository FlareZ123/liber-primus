"use strict";
// Fixed-seed unknown-output-codebook recovery on the two surviving original masks.
// Positive control: actual disjoint Gibran and Emerson windows, with the planted
// arbitrary codebook from the Python all-mask SFT. Neither window trains the model.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=n=>fs.readFileSync(path.resolve(__dirname,"..",n),"utf8");
const names=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"];
const docs=names.map(n=>read("resources/control/"+n).toUpperCase().replace(/[^A-Z]/g,""));
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const train=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices).slice(8);
const hold=corpus.pages.slice(23,27).flatMap(p=>p.indices).slice(16);
assert.equal(train.length,3000);assert.equal(hold.length,1005);
const freq=new Uint32Array(26),quad=new Float64Array(26**4);
let total=0;
for(let z=0;z<docs.length;z++){
 let s=docs[z],omit=z===0?600:z===1?201:0;
 for(const chunk of (omit?[s.slice(0,5000),s.slice(5000+omit)]:[s])){
  const a=Array.from(chunk,c=>c.charCodeAt(0)-65);
  for(let i=0;i<a.length;i++){
   freq[a[i]]++;
   if(i>=3){quad[((a[i-3]*26+a[i-2])*26+a[i-1])*26+a[i]]++;total++;}
  }
 }
}
for(let i=0;i<quad.length;i++)quad[i]=Math.log((quad[i]+.05)/(total+quad.length*.05));
const plain=docs[0].slice(5000,5600),plainHold=docs[1].slice(5000,5201);
const plantMap=[29,15,24,28,5,3,21,12,13,7,8,1,23,31,20,27,22,26,9,30,19,17,11,18,16,6];
const gp=s=>Array.from(s,c=>plantMap[c.charCodeAt(0)-65]);
/** @param {number[]} a @param {number} k */
function decode(a,k){let out=[];for(let i=0;i<a.length;i+=5){let n=0;for(let j=0;j<5;j++)n=n*2+((k>>>a[i+j])&1);out.push(n);}return out;}
/** @param {number[]} raw @param {number[]} held @param {number} seed */
function fit(raw,held,seed,restarts=28,steps=18000){
 let state=seed>>>0;
 const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296};
 const counts=new Uint32Array(32);for(const c of raw)counts[c]++;
 const present=Array.from({length:32},(_,i)=>i).sort((a,b)=>counts[b]-counts[a]||a-b).slice(0,26);
 const inv=new Int8Array(32).fill(-1);present.forEach((c,i)=>inv[c]=i);
 const data=Uint8Array.from(raw,c=>inv[c]);
 const rank=Array.from({length:26},(_,i)=>i).sort((a,b)=>freq[b]-freq[a]);
 const affected=Array.from({length:26},()=>Array.from({length:26},()=>[]));
 for(let i=0;i+3<data.length;i++){
  let bits=0;for(let j=0;j<4;j++)bits|=1<<data[i+j];
  for(let x=0;x<26;x++)for(let y=x+1;y<26;y++)if(bits&((1<<x)|(1<<y)))affected[x][y].push(i);
 }
 let best=-Infinity,bestMap=null;const end=data.length-3;
 for(let run=0;run<restarts;run++){
  let map=Uint8Array.from(rank);
  if(run)for(let j=25;j>0;j--){let i=Math.floor(rng()*(j+1));[map[i],map[j]]=[map[j],map[i]];}
  const score=i=>quad[((map[data[i]]*26+map[data[i+1]])*26+map[data[i+2]])*26+map[data[i+3]]];
  let cur=0;for(let i=0;i<end;i++)cur+=score(i);
  for(let n=0;n<steps;n++){
   let x=Math.floor(rng()*26),y=Math.floor(rng()*25);if(y>=x)y++;if(y<x)[x,y]=[y,x];
   const sites=affected[x][y];let delta=0;for(let i of sites)delta-=score(i);
   [map[x],map[y]]=[map[y],map[x]];for(let i of sites)delta+=score(i);
   const temp=12*Math.pow(.025,n/(steps-1));
   if(delta>=0||rng()<Math.exp(delta/temp)){cur+=delta;if(cur>best){best=cur;bestMap=Array.from(map);}}
   else [map[x],map[y]]=[map[y],map[x]];
  }
 }
 const render=seq=>seq.map(c=>inv[c]>=0?String.fromCharCode(65+bestMap[inv[c]]):"?").join("");
 return {mean:best/end,training:render(raw),held:render(held),unmapped:held.filter(c=>inv[c]<0).length};
}
for(const k of [209830276,536657522,"plant"]){
 const a=k==="plant"?gp(plain):decode(train,k),b=k==="plant"?gp(plainHold):decode(hold,k);
 const v=fit(a,b,3301);
 console.log(JSON.stringify({key:k,mean:v.mean,trainExcerpt:v.training.slice(0,180),heldExcerpt:v.held.slice(0,120),unmapped:v.unmapped,
   trainMatches:k==="plant"?[...v.training].filter((c,i)=>c===plain[i]).length:undefined,
   heldMatches:k==="plant"?[...v.held].filter((c,i)=>c===plainHold[i]).length:undefined}));
 if(k==="plant"){assert.equal(v.training,plain);assert.equal(v.held,plainHold);}
 else assert.equal(v.unmapped,k===209830276?5:3);
}
