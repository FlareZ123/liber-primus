"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {edges,mod,encode,makeRng,words,train,decode,names}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/cicada2014-openpuff-magic-squares.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(raw){
 const c=JSON.parse(raw[0]),squares=raw[1].trim().split(/\s+/).map(Number);if(squares.length!==99)throw Error("source size");
 const seq=raw.slice(2,5).map(x=>words(x).flat()),lp=train(seq.map(x=>x.slice(0,Math.floor(x.length*.7))));
 const n=JSON.parse(raw[5]),rm=new Map(n.runes.map((r,i)=>[r,i])),P=[...n.sections.find(s=>s.name==="p57_parable").source_text].filter(x=>rm.has(x)).map(x=>rm.get(x));
 function gate(C,K){const D=Array.from({length:C.length+1},()=>new Set());D[0].add(0);let max=0,states=0;for(let i=0;i<C.length;i++){for(const j of D[i])for(const e of edges(C,K,i,j))D[e.i].add(e.j);if(D[i].size)max=i;states+=D[i].size;}return{n:C.length,possible:!!D.at(-1).size,max:D.at(-1).size?C.length:max,states,ends:D.at(-1).size}}
 const ch=c.pages.slice(33,40).flatMap(p=>p.indices),page=c.pages[33].indices,sources={all99:squares,central49:squares.slice(25,74)},targets={whole:ch,after_heading:ch.slice(10),p33_black1:page.slice(10,91),p33_black2:page.slice(99)},original=[],controls=[],rng=makeRng(0x47a913);
 for(const [source,s] of Object.entries(sources))for(const sign of [1,-1]){
   const key=n=>Array.from({length:n},(_,i)=>mod(sign*s[i%s.length]));
   for(const [target,C] of Object.entries(targets)){const K=key(C.length),g=gate(C,K),d=g.possible?decode(C,K,lp):null;original.push({source,target,sign,...g,bf:d?.bf??null,plaintext:d?.P.map(x=>names[x]).join("")??null})}
   const truth=P.slice(0,81),K=key(200),plant=encode(truth,K,rng),d=decode(plant.C,K,lp);
   if(!d.possible)throw Error("positive failed");controls.push({source,sign,n:plant.C.length,bf:d.bf,exact:truth.length===d.P.length&&truth.every((x,i)=>x===d.P[i])});
 }
 return {original,controls};
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={run,paths};
