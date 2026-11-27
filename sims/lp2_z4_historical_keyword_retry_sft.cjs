'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),letters=new Map(gp.translit.map((x,i)=>[x,i]));
const keys=["DIUINITY","FIRFUMFERENFE"].map(s=>({name:s,k:[...s].map(c=>letters.get(c))}));if(keys.some(o=>o.k.some(x=>x===undefined)))throw Error("keyword spelling");
const bounds=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],tape=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices),chapters=bounds.slice(0,-1).map((a,i)=>tape.slice(a,bounds[i+1]));
const p57=[...gold.sections.find(s=>s.name==="p57_parable").source_text].filter(c=>ix.has(c)).map(c=>ix.get(c));if(p57.length!==95)throw Error("p57 length");
const A=29,S=29;const rows=[];
function machine(m,key,sign,mode){const q=key.length;const table=Array.from({length:q*(A+1)},()=>Array.from({length:A},()=>[])),forward=Array.from({length:q*(A+1)},()=>Array(A).fill(null));const id=(i,l)=>i*(A+1)+l;
function step(i,last,p){if(mode!=="ordinary"&&p===0)return {c:0,next:id(i,mode==="F-updates"?0:last),attempts:0,silent:0};const seen=new Set();let attempts=0,silent=0;while(!seen.has(i*(m+1)+last)){seen.add(i*(m+1)+last);const c=((p+sign*key[i])%m+m)%m;i=(i+1)%q;attempts++;if(c===last)continue;last=c;if(c>=A){silent++;continue;}return {c,next:id(i,c),attempts,silent};}return null;}
for(let i=0;i<q;i++)for(let last=0;last<=A;last++)for(let p=0;p<A;p++){const r=step(i,last,p);if(r){forward[id(i,last)][p]=r;table[id(i,last)][r.c].push({p,...r});}}
return {q,table,forward,id};}
function reach(mac,C,phases,initialLast=S){let state=new Set(phases.map(p=>mac.id(p,initialLast))),n=0,max=state.size;for(const c of C){const next=new Set();for(const s of state)for(const e of mac.table[s][c])next.add(e.next);if(!next.size)break;state=next;n++;max=Math.max(max,state.size);}return {prefix:n,complete:n===C.length,states:n===C.length?state.size:0,maxStates:max};}
function encode(mac,P){let s=mac.id(0,S),C=[],attempts=0,silent=0;for(const p of P){const e=mac.forward[s][p];if(!e)break;C.push(e.c);s=e.next;attempts+=e.attempts;silent+=e.silent;}return {C,attempts,silent};}
for(const {name,k} of keys)for(const m of [35,36,37])for(const sign of [1,-1])for(const mode of ["ordinary","F-preserves","F-updates"]){const mac=machine(m,k,sign,mode),phases=Array.from({length:k.length},(_,i)=>i);const P=Array.from({length:308},(_,i)=>p57[i%95]),plant=encode(mac,P),replay=reach(mac,plant.C,[0]);if(!replay.complete)throw Error("control inverse");const original=chapters.map(c=>reach(mac,c,phases));rows.push({name,m,sign,mode,control:{prefix:plant.C.length,total:P.length,silent:plant.silent,attempts:plant.attempts,doublets:plant.C.slice(1).filter((x,i)=>x===plant.C[i]).length},original});}
return {rows,summary:{variants:rows.length,fullControls:rows.filter(x=>x.control.prefix===308).length,completedChapters:rows.reduce((s,r)=>s+r.original.filter(x=>x.complete).length,0),maxPrefixes:chapters.map((c,i)=>({N:c.length,best:Math.max(...rows.map(x=>x.original[i].prefix))})),completeRows:rows.filter(x=>x.original.some(y=>y.complete)).map(x=>({name:x.name,m:x.m,sign:x.sign,mode:x.mode,chapters:x.original.map((a,i)=>a.complete?i+1:null).filter(Boolean)}))}};}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
