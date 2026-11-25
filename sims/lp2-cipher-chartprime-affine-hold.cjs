'use strict';
// Reproduces the exact continuous ciphertext-chart-prime feedback test.
// Run from repository root: node sims/lp2-cipher-chartprime-affine-hold.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const j=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const n=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const mod=x=>(x%29+29)%29,full=(1<<29)-1,w=j.prime.map(x=>mod(x-1));
const native=n.sections.map(s=>[...s.source_text].map(c=>j.runes.indexOf(c)).filter(x=>x>=0));
const params=[];
for(let a=2;a<29;a++)for(let b=1;b<29;b++)for(let d=0;d<29;d++)params.push([a,b,d]);
assert.equal(params.length,21924);
function enc(p,[a,b,d],s){
  return p.map(v=>{if(!v)return 0;const c=mod(v+s);s=mod(a*s+b*w[c]+d);return c});
}
function sweep(c){
  const survivors=[];let longest=0;
  for(const [a,b,d] of params){
    let mask=full,i=0;
    for(;i<c.length&&mask;i++){
      const v=c[i],t=mod(b*w[v]+d);
      let src=mask&~(1<<v),next=v===0?mask:0;
      while(src){const bit=src&-src,k=31-Math.clz32(bit);src^=bit;next|=1<<mod(a*k+t)}
      mask=next;
    }
    longest=Math.max(longest,i-(mask?0:1));
    if(mask)survivors.push([a,b,d]);
  }
  return {survivors,longest};
}
function model(exclude){
  let cnt=Array.from({length:30},()=>Array(29).fill(.25));
  native.forEach((v,i)=>{if(i===exclude)return;let prev=29;for(let p of v){cnt[prev][p]++;prev=p}});
  return cnt.map(row=>{let s=row.reduce((a,b)=>a+b);return row.map(v=>Math.log(v/s))});
}
function vit(c,[a,b,d],lm,initial=null,trace=false){
  let states=new Map();
  if(initial)states.set(initial[0]*30+initial[1],{v:0});
  else for(let k=0;k<29;k++)states.set(k*30+29,{v:0});
  for(let v of c){
    let next=new Map(),t=mod(b*w[v]+d);
    for(let [id,node] of states){
      let s=Math.floor(id/30),prev=id%30,p=mod(v-s);
      function add(ns,np){
        let z=ns*30+np,val=node.v+lm[prev][np];
        if(!next.has(z)||next.get(z).v<val)next.set(z,{v:val,prev:trace?node:null,p:np});
      }
      if(p!==0)add(mod(a*s+t),p);
      if(v===0)add(s,0);
    }
    states=next;if(!states.size)return null;
  }
  let best=null,bid;
  for(let [id,node]of states)if(!best||node.v>best.v){best=node;bid=id}
  let output=[];
  if(trace){let node=best;while(node.prev){output.push(node.p);node=node.prev}output.reverse()}
  return {score:best.v,end:[Math.floor(bid/30),bid%30],output};
}
function select(c,lm){
  const sw=sweep(c);let best=null;
  for(let k of sw.survivors){let fit=vit(c,k,lm);if(!best||fit.score>best.score)best={k,...fit}}
  return {sw,best};
}
function blind(p,par,s,idx){
  let c=enc(p,par,s),cut=550,lm=model(idx),a=c.slice(0,cut),b=c.slice(cut);
  let {sw,best}=select(a,lm),fit=vit(a,best.k,lm,null,true),hold=vit(b,best.k,lm,fit.end,true);
  assert.deepEqual(best.k,par);
  assert.deepEqual(fit.output,p.slice(0,cut));
  assert.deepEqual(hold.output,p.slice(cut));
  return {truth:par,selected:best.k,candidates:sw.survivors.length,trainAcc:cut,holdAcc:hold.output.length,holdScore:hold.score};
}
const pages=(a,b)=>j.pages.slice(a,b+1).flatMap(p=>p.indices);
assert.equal(pages(0,55).length,12956);
for(let [label,c] of [['p0-2',pages(0,2)],['p40-53',pages(40,53)],['p0-55',pages(0,55)]]){
  let r=sweep(c);console.log(label,{length:c.length,survivors:r.survivors.length,longestViablePrefix:r.longest});
}
console.log('controls',blind(native[3],[7,11,19],17,3),blind(native[4],[13,5,2],4,4));
const a=pages(0,2),lm=model(-1),{best}=select(a,lm),fit=vit(a,best.k,lm,null,true);
const hold=vit(pages(3,5),best.k,lm,fit.end,true);
console.log('original', {key:best.k,scorePerRune:fit.score/a.length,end:fit.end,excerpt:fit.output.slice(0,100).map(v=>j.translit[v]).join(' '),hold:!!hold});
