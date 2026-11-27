"use strict";
const fs = require("node:fs");
const path = require("node:path");
function run(native,corpus) {
  const N=29, mod=x=>((x%N)+N)%N;
  const inv=Array.from({length:N},(_,i)=>i?Array.from({length:28},(_,j)=>j+1).find(j=>i*j%N===1):0);
  const tapes=native.sections.map(s=>({name:s.name,p:[...s.source_text].map(c=>native.runes.indexOf(c)).filter(i=>i>=0)}));
  const held=[1,3,4], train=tapes.filter((_,i)=>!held.includes(i)).map(x=>x.p);
  const uni=new Float64Array(N),bi=new Float64Array(N*N),tri=new Float64Array(N*N*N),den2=new Float64Array(N),den3=new Float64Array(N*N);
  let total=0;
  for(const p of train)for(let i=0;i<p.length;i++){uni[p[i]]++;total++;if(i){bi[p[i-1]*N+p[i]]++;den2[p[i-1]]++}if(i>1){tri[(p[i-2]*N+p[i-1])*N+p[i]]++;den3[p[i-2]*N+p[i-1]]++}}
  const scoreTable=new Float64Array(N*N*N);
  for(let x=0;x<N;x++)for(let y=0;y<N;y++)for(let z=0;z<N;z++){const u=(uni[z]+0.5)/(total+0.5*N);const v=(bi[y*N+z]+5*u)/(den2[y]+5);scoreTable[(x*N+y)*N+z]=Math.log((tri[(x*N+y)*N+z]+10*v)/(den3[x*N+y]+10))}
  function enc(p,k){let x=0,y=0;return p.map(z=>{const c=mod(y+k.a*inv[mod(z+k.b*x+k.t)]);x=z;y=c;return c})}
  function dec(c,k){let x=0,y=0;return c.map(z=>{const p=mod(k.a*inv[mod(z-y)]-k.b*x-k.t);x=p;y=z;return p})}
  function score(p,lo,hi){let s=0,n=0;for(let i=Math.max(2,lo);i<hi;i++){s+=scoreTable[(p[i-2]*N+p[i-1])*N+p[i]];n++}return s/n}
  function recover(c,fit){
    const d=c.slice(0,fit).map((x,i)=>inv[mod(x-(i?c[i-1]:0))]);
    let best=-Infinity,second=-Infinity,key=null;
    for(let b=1;b<N;b++)for(let a=1;a<N;a++)for(let t=0;t<N;t++){
      let x=0,y=0,s=0;
      for(let i=0;i<d.length;i++){const z=(a*d[i]-b*y-t+841)%N;if(i>1)s+=scoreTable[(x*N+y)*N+z];x=y;y=z}
      if(s>best){second=best;best=s;key={a,b,t}}else if(s>second)second=s;
    }
    const p=dec(c,key);
    return {key,fit:best/(fit-2),margin:(best-second)/(fit-2),held:score(p,fit,p.length),p,roundtrip:enc(p,key).every((z,i)=>z===c[i])};
  }
  function pairHist(ps,b){const f=Array(N).fill(0);for(const p of ps)for(let i=1;i<p.length;i++)f[(p[i]+b*p[i-1])%N]++;return f}
  const pool=tapes.map(x=>x.p), poolProfiles=Array.from({length:28},(_,i)=>{let b=i+1;let f=pairHist(pool,b);return {b,min:Math.min(...f),max:Math.max(...f),total:f.reduce((a,b)=>a+b,0)}});
  const trainProfiles=Array.from({length:28},(_,i)=>{let b=i+1;let f=pairHist(train,b);return {b,count:Math.min(...f),t:mod(-f.indexOf(Math.min(...f)))}}).sort((a,b)=>a.count-b.count||a.b-b.b);
  let seed=0x3197c1ca;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
  const repeat=p=>p.slice(1).filter((x,i)=>x===p[i]).length;
  const controls=[];const negatives=[];
  for(let j=0;j<held.length;j++){
    const {name,p}=tapes[held[j]],fit=Math.floor(p.length*2/3),k={a:[7,13,23][j],b:trainProfiles[j].b,t:trainProfiles[j].t};
    const c=enc(p,k), r=recover(c,fit);
    controls.push({name,n:p.length,fitN:fit,truth:k,selected:r.key,correct:r.p.filter((x,i)=>x===p[i]).length,fitScore:r.fit,heldScore:r.held,margin:r.margin,repeat:repeat(c),roundtrip:r.roundtrip});
    for(const kind of ["uniform-pad","static-affine"]){
      const c2=kind==="uniform-pad"?p.map(x=>mod(x+rng()%29)):p.map(x=>mod(11*x+17));
      const s=recover(c2,fit);negatives.push({name,kind,key:s.key,fitScore:s.fit,heldScore:s.held,margin:s.margin,roundtrip:s.roundtrip});
    }
  }
  const gate=Math.min(...controls.map(x=>x.heldScore));
  const calibrated=controls.every(x=>x.correct===x.n&&x.roundtrip&&JSON.stringify(x.truth)===JSON.stringify(x.selected))&&negatives.every(x=>x.heldScore<gate&&x.roundtrip);
  const original=corpus.pages.filter(x=>x.page>=40&&x.page<=48).flatMap(x=>x.indices);
  const fitN=corpus.pages.filter(x=>x.page>=40&&x.page<=43).reduce((s,x)=>s+x.indices.length,0);
  const orig=calibrated?recover(original,fitN):null;
  return {family:"c_i=c_prev+a*inv29(p_i+b*p_prev+t); IV=(0,0); inv29(0)=0",keys:28*28*29,training:tapes.filter((_,i)=>!held.includes(i)).map(x=>[x.name,x.p.length]),poolProfiles,trainProfiles,controls,negatives,gate,calibrated,original:orig?{fitPages:[40,43],heldPages:[44,48],fitN,heldN:original.length-fitN,key:orig.key,fitScore:orig.fit,heldScore:orig.held,margin:orig.margin,roundtrip:orig.roundtrip,passes:orig.held>=gate,first120:orig.p.slice(0,120).map(x=>corpus.translit[x]).join(" "),plaintextIndices:orig.p}:null};
}
const root=path.resolve(__dirname,"..");
const native=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
console.log(JSON.stringify(run(native,corpus),null,2));
