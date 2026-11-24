"use strict";
// Arbitrary common shift per cycle plus arbitrary fixed phase shifts and transparent F; keyless rectangular invariants.
function run(gp,donor,raw){
 const mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((v,i)=>[v,i])),readRunes=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function increment(h,c,s,L){let pairs=0,triples=0,quads=0;for(let k=1;k<=3;k++){const lag=k*L;if(h.length<lag)continue;const delta=mod(c-h.charCodeAt(h.length-lag));let m=0;for(let j=1;j<=s&&h.length>=lag+j;j++)if(mod(h.charCodeAt(h.length-j)-h.charCodeAt(h.length-lag-j))===delta)m++;pairs+=m;triples+=m*(m-1)/2;quads+=m*(m-1)*(m-2)/6;}return [pairs,triples,quads]}
 function stats(active,L,phase){let h="",s=phase,out=[0,0,0];for(const c of active){const a=increment(h,c,s,L);for(let j=0;j<3;j++)out[j]+=a[j];h=(h+String.fromCharCode(c)).slice(-(4*L-1));s=(s+1)%L}return out}
 function bounds(C,L){const D=4*L-1;let S=new Map(),peak=0;for(let s=0;s<L;s++)S.set(String.fromCharCode(s),[0,0,0]);for(const c of C){const T=new Map(),z=String.fromCharCode(c);function merge(key,v,inc){const a=T.get(key);if(!a){T.set(key,[v[0]+inc[0],v[1]+inc[1],v[2]+inc[2]]);return;}for(let j=0;j<3;j++)a[j]=Math.max(a[j],v[j]+inc[j])}for(const [key,v] of S){const s=key.charCodeAt(0),h=key.slice(1);if(c===0)merge(key,v,[0,0,0]);merge(String.fromCharCode((s+1)%L)+(h+z).slice(-D),v,increment(h,c,s,L));}S=T;peak=Math.max(peak,S.size)}const out=[0,0,0];for(const a of S.values())for(let j=0;j<3;j++)out[j]=Math.max(out[j],a[j]);return {max:out,peak}}
 const toy=[0,1,0,1,1,0,2,2,0,1,2,0,1],zz=toy.flatMap((x,i)=>x===0?[i]:[]),tb=bounds(toy,3),ts=[0,0,0];for(let m=0;m<1<<zz.length;m++){const skip=new Set(zz.filter((_,i)=>m>>i&1));const a=toy.filter((_,i)=>!skip.has(i));for(let s=0;s<3;s++){const x=stats(a,3,s);for(let j=0;j<3;j++)ts[j]=Math.max(ts[j],x[j])}}check(ts.join()===tb.max.join(),"toy exact");
 const P=readRunes(donor.sections.find(s=>s.name==="0_koan_1").source_text);const positives=[];
 for(const L of [8,13]){let t=3;const K=Array.from({length:L},(_,i)=>(i*i*7+13*i+4)%29),G=Array.from({length:Math.ceil((P.length+3)/L)},(_,i)=>(i*i*i*13+17*i+9)%29);const C=P.map(p=>{if(p===0)return 0;const c=mod(p+K[t%L]+G[Math.floor(t/L)]);t++;return c});const A=P.filter(x=>x!==0),B=C.filter((_,i)=>P[i]!==0),a=stats(A,L,3),b=stats(B,L,3),bo=bounds(C,L);check(a.join()===b.join()&&a.every((x,i)=>x<=bo.max[i]),"plant");positives.push({L,n:P.length,actual:a,bounds:bo})}
 const controls=raw.map((x,i)=>({name:["Shakespeare","Emerson","Gibran"][i],P:native(x)}));
 const pages=gp.pages.filter(p=>p.page<56),ranges=[[0,2],[23,26],[40,53],[54,55],[0,55]];
 const result=[];for(const [a,b] of ranges){const C=pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);for(const L of [8,13]){const bo=bounds(C,L);const cs=controls.map(({name,P})=>{const windows=[];for(let i=0;i<32;i++){const off=Math.round(i*(P.length-C.length)/31),act=P.slice(off,off+C.length).filter(x=>x!==0);const phase=Array.from({length:L},(_,s)=>stats(act,L,s));windows.push(phase)}const min=[0,1,2].map(j=>Math.min(...windows.flat().map(x=>x[j])));return {name,min,pass:windows.filter(ph=>ph.some(x=>x.every((v,j)=>v<=bo.max[j]))).length}});result.push({pages:[a,b],L,n:C.length,...bo,controls:cs});}}
 return {positives,toyBrute:tb,result};
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),JSON.parse(d[1]),d.slice(2)),null,2));
