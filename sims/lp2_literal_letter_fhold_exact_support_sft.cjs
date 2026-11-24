#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(c,g,train){
const A=c.translit.map((t,i)=>t.length===1?i:-1).filter(i=>i>=0), map=new Map(c.runes.map((t,i)=>[t,c.translit[i]])),letters=new Map(A.map(i=>[c.translit[i],i])),P=g.sections.flatMap(s=>Array.from(s.source_text).filter(x=>map.has(x)).flatMap(x=>Array.from(map.get(x),t=>letters.get(t))));
const K=[17,2,28,9,12,25,6,14],enc=(p,k)=>{let j=0;return p.map(x=>x===0?0:(x+k[j++%k.length])%29)};
const L=8,full=(1<<29)-1,allow=Array.from({length:29},(_,c)=>A.filter(p=>p!==0).reduce((m,p)=>m|(1<<((c-p+29)%29)),0));
function recover(C){
let states=[{j:0,m:Array(L).fill(full)}],peak=1,counts=[];
for(let i=0;i<C.length;i++){const v=C[i],next=new Map;for(const s of states){if(v===0)next.set(s.j+":"+s.m.join(","),s);let m=s.m[s.j]&allow[v];if(m){let a=s.m.slice();a[s.j]=m;let t={j:(s.j+1)%L,m:a};next.set(t.j+":"+a.join(","),t)}}states=[...next.values()];counts.push(states.length);peak=Math.max(peak,states.length);if(!states.length)return{states,peak,death:i+1,counts};}
return {states,peak,death:null,counts}}
const n=29,starts=Array(n*n).fill(0),trigram=Array(n*n*n).fill(0),normalize=s=>Array.from(s.toUpperCase().replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C")).map(t=>letters.get(t)).filter(x=>x!==undefined);
const model=normalize(train);for(let i=2;i<model.length;i++){let j=model[i-2]*n+model[i-1];starts[j]++;trigram[j*n+model[i]]++}
const ll=(a,b,v)=>a<0||b<0?0:Math.log((trigram[(a*n+b)*n+v]+0.1)/(starts[a*n+b]+0.1*A.length));
function decode(C,key,phases){let states=new Map(phases.map(j=>[j+":-1:-1",{j,a:-1,b:-1,s:0,out:[]}]));
for(const v of C){let next=new Map;for(const st of states.values()){let choices=[];if(v===0)choices.push([0,st.j]);let p=(v-key[st.j]+29)%29;if(p!==0&&A.includes(p))choices.push([p,(st.j+1)%L]);for(const [p,j] of choices){let s=st.s+ll(st.a,st.b,p),id=j+":"+st.b+":"+p;if(!next.has(id)||next.get(id).s<s)next.set(id,{j,a:st.b,b:p,s,out:[...st.out,p]})}}states=next;}return [...states.values()].sort((a,b)=>b.s-a.s)[0]}
const C=enc(P,K), cut=2500,cr=recover(C.slice(0,cut));const keys=[...new Set(cr.states.map(s=>s.m.map(m=>{if((m&(m-1))!==0)throw Error("not unique");return Math.log2(m)}).join(",")))].map(s=>s.split(",").map(Number));const phases=[...new Set(cr.states.map(s=>s.j))];if(keys.length!==1)throw Error("key not unique");const pred=decode(C.slice(cut),keys[0],phases);let matches=pred.out.filter((p,i)=>p===P[cut+i]).length;
const orig=c.pages.slice(0,3).flatMap(p=>p.indices),o=recover(orig);
return {inventory:A,control:{length:P.length,train:cut,heldout:C.length-cut,key:K,recoveredKey:keys[0],phases,peak:cr.peak,matches,firstPrediction:pred.out.slice(0,120).map(i=>c.translit[i]).join(""),firstActual:P.slice(cut,cut+120).map(i=>c.translit[i]).join("")},original:{length:orig.length,death:o.death,peak:o.peak,counts:o.counts}}
}
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/gibran_prophet_58585.txt"));
console.log(JSON.stringify(result,null,2));
if(result.control.key.join()!==result.control.recoveredKey.join()||result.original.death!==85)process.exitCode=1;
