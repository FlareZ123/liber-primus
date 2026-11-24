"use strict";
// Exact adjacent-quote key extension to untouched p40 ciphertext.
const experiment=require("./lp2_geb_quine_fhold_original_sft.cjs");
function extend(experiment,c,meta,raw){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=(x,q)=>(x%q+q)%q;
 const x=experiment(c,meta,raw).results.find(z=>z.s===9715&&z.q===13);
 assert(x.candidates.length===17,"candidate family changed");
 const page=c.pages.find(p=>p.page===40),start=c.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),end=start+page.indices.length;
 assert(start===9640&&end===9871,"page coordinates changed");
 const tape=page.indices,lo=x.s-start,hi=lo+2*x.n;
 function reach(k,phase,seq,dir){
  let states=new Set([phase]),j=0;
  for(const C of seq){const next=new Set();for(const s of states){
   if(C===0)next.add(s); // literal held F
   const u=dir===1?s:mod(s-1,k.length);
   if(C!==k[u])next.add(mod(s+dir,k.length)); // consuming, nonzero plaintext
  }if(!next.size)return {covered:j,deadAt:j,states:[]};states=next;j++;}
  return {covered:j,deadAt:null,states:[...states].sort((a,b)=>a-b)};
 }
 const result=x.candidates.map(w=>{
  const left=reach(w.key,0,tape.slice(0,lo).reverse(),-1),right=reach(w.key,mod(2*(x.n-w.holds.length),13),tape.slice(hi),1);
  return {key:w.key,plaintext:w.plaintext,left,right,leftFailure:left.deadAt===null?null:x.s-1-left.deadAt,rightFailure:right.deadAt===null?null:x.s+2*x.n+right.deadAt,survives:left.deadAt===null&&right.deadAt===null};
 });
 // Positive control: actual p57 runes encrypted continuously using a known q13 key.
 const p=c.pages.find(p=>p.page===57).indices,k=[0,10,4,0,1,19,0,18,4,18,9,0,18],offset=48;let phase=0;
 const enc=p.map(y=>y===0?0:(y+k[phase++%13])%29),phaseAt=p.slice(0,offset).filter(y=>y!==0).length%13;
 const left=reach(k,phaseAt,enc.slice(0,offset).reverse(),-1),right=reach(k,phaseAt,enc.slice(offset),1);
 assert(left.deadAt===null&&left.states.includes(0)&&right.deadAt===null&&right.states.includes(phase%13),"true control clock excluded");
 const suffix=c.pages.filter(p=>p.page>=41&&p.page<=53).flatMap(p=>p.indices);
 assert(suffix.length===2777,"section continuation changed");
 const section=result.filter(v=>v.survives).map(v=>{
  const paths=v.right.states.map(s=>reach(v.key,s,suffix,1));
  const covered=Math.max(...paths.map(p=>p.covered));
  return {key:v.key,covered,failure:covered===suffix.length?null:end+covered,survives:covered===suffix.length};
 });
 return {page:40,start,end,anchor:[x.s,x.s+2*x.n],control:{left,right},result,survivors:result.filter(v=>v.survives).length,section,sectionSurvivors:section.filter(v=>v.survives).length};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(extend(experiment,require("../resources/liber-primus/lp2-corpus.json"),require("../resources/liber-primus/lp2-quote-punctuation-spans.json"),fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-transcription.txt"),"utf8")),null,2));}
module.exports=extend;
