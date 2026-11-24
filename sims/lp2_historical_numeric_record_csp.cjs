"use strict";
// Node 22: node sims/lp2_historical_numeric_record_csp.cjs self-reliance.txt zN4h51m.jpg.asc
// Source files: neuroretransmit/cicada @ ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, 2014/001-twitter/.
function run(book,signed) {
 const mod=x=>(x%29+29)%29;
 const lines=signed.split(/\r?\n/).filter(l=>/^(?:[1-9]\d*:){3}[1-9]\d*$|^3$/.test(l));
 const paras=book.split("\n\n").map(p=>p.split(/(?<=[.!?])\s+/).map(s=>s.replace(/\n/g," ").split(" ")));
 const byShape=new Map();
 const address=new Map();
 for(let p=1;p<=paras.length;p++){
   const para=paras[p-1+(p>=45?1:0)];if(!para)continue;
   for(let s=1;s<=para.length;s++)for(let w=1;w<=para[s-1].length;w++){
     const word=Array.from(para[s-1][w-1]);for(let c=1;c<=word.length;c++){
       if(!/^[a-z]$/i.test(word[c-1]))continue;
       const rec=[p,s,w,c].join(":");const shape=rec.split(":").map(x=>x.length).join(",");const ds=rec.replaceAll(":","").split("").map(Number);
       if(!byShape.has(shape))byShape.set(shape,[]);byShape.get(shape).push(ds);address.set(rec,word[c-1].toLowerCase());
     }
   }
 }
 const lookup=r=>r==="3"?"3":address.get(r);
 const historical=lines.map(lookup).join("");
 if(historical!=="auqgnxjtvdbll3pv")throw new Error("historical replay failed "+historical);
 const key=[17,2,24,11,6,27,9,20,4,15,28,8,12],q=key.length;
 let clock=0;const enc=lines.map(line=>{const shape=line.split(":").map(x=>x.length);const start=clock;const c=line.replaceAll(":","").split("").map(x=>mod(+x+key[clock++%q]));return {shape,start,c};});
 const train=enc.slice(0,13);
 let domains=Array(q).fill((1<<29)-1);
 for(const r of train)for(let i=0;i<r.c.length;i++){const j=(r.start+i)%q;let m=0;for(let d=0;d<=9;d++)m|=1<<mod(r.c[i]-d);domains[j]&=m;}
 const tables=train.map(r=>{const positions=r.c.map((_,i)=>(r.start+i)%q);let options=(byShape.get(r.shape.join(","))||[]).map(ds=>ds.map((d,i)=>mod(r.c[i]-d))).filter(ks=>ks.every((k,i)=>domains[positions[i]]&(1<<k)));return {positions,options};});
 const initial=tables.map(t=>t.options.length);
 const solutions=[];let nodes=0;
 function solve(ds,ts){
  nodes++;
  let changed=true;
  while(changed){
   changed=false;
   const next=[];
   for(const t of ts){
    const opts=t.options.filter(ks=>ks.every((k,i)=>ds[t.positions[i]]&(1<<k)));
    if(!opts.length)return;
    if(opts.length!==t.options.length)changed=true;
    for(let i=0;i<t.positions.length;i++){let mask=0;for(const ks of opts)mask|=1<<ks[i];const j=t.positions[i];const x=ds[j]&mask;if(!x)return;if(x!==ds[j]){ds[j]=x;changed=true;}}
    next.push({positions:t.positions,options:opts});
   }ts=next;
  }
  let j=-1,best=30;for(let i=0;i<q;i++){let n=0;for(let k=0;k<29;k++)if(ds[i]&(1<<k))n++;if(n>1&&n<best){best=n;j=i;}}
  if(j<0){solutions.push(ds.map(x=>31-Math.clz32(x)));return;}
  for(let k=0;k<29;k++)if(ds[j]&(1<<k)){const nd=ds.slice();nd[j]=1<<k;solve(nd,ts);}
 }
 solve(domains.slice(),tables);
 const decode=(r,k)=>{const digits=r.c.map((x,i)=>mod(x-k[(r.start+i)%q]));if(digits.some(d=>d>9))return null;let i=0;return r.shape.map(n=>{const s=digits.slice(i,i+n).join("");i+=n;return s;}).join(":");};
 const predictions=solutions.map(k=>({key:k,held:enc.slice(13).map(r=>decode(r,k)),letters:enc.slice(13).map(r=>lookup(decode(r,k))??"?").join("")}));
 return {historical,lines,recordCount:lines.length,addresses:address.size,trainingDigits:train.reduce((a,r)=>a+r.c.length,0),initial,searchNodes:nodes,solutionCount:solutions.length,plantedIncluded:solutions.some(k=>String(k)===String(key)),predictions:predictions.slice(0,20),expectedHeld:lines.slice(13),encoded:enc,sourceShapeCounts:[...byShape].map(([shape,v])=>[shape,v.length])};
}
const fs=require("node:fs");
const [book,signed]=process.argv.slice(2).map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(run(book,signed),null,2));
