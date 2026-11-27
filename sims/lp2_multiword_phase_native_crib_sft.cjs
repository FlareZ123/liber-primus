'use strict';
/** Exact aligned quotation transfer from native solved GP29 sections, no full-word anchor needed.
 * node sims/lp2_multiword_phase_native_crib_sft.cjs
 */
const {trial,S}=require("./lp2_multiword_phase_affine_crib.cjs");
const {scopeIndex}=require("./lp2_q8_historical_wordphase_crib_sft.cjs");
const {candidates,scan}=require("./lp2_multiword_phase_historical_crib_sft.cjs");
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
function sourceBlocks(gold){
 const idx=new Map(gold.runes.map((x,i)=>[x,i])),out=[];
 for(const rec of gold.sections){let words=[],block=0;
  const emit=()=>{if(words.length)out.push({name:rec.name+":"+block++,words});words=[]};
  for(const seg of rec.source_text.split(/[⁘⁜]/u)){
   if(/[0-9]/.test(seg)){emit();continue}
   for(const w of seg.match(/[\u16a0-\u16ff]+/gu)||[]){
    const p=[...w].map(x=>{if(!idx.has(x))throw Error("unknown rune "+x);return S[idx.get(x)]}).join("");words.push(p);
   }
  }emit()
 }
 return out
}
function study(A,gold,configs=[[8,64],[8,96],[13,96],[13,128]]){
 const D=sourceBlocks(gold);let offset=0;
 const scopes=ranges.map(([a,b])=>{const c=A.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>S[x]).join("");const s=scopeIndex("p"+a+"-"+b,c,offset);offset+=c.length;return s});
 if(offset!==12956)throw Error("LP2 length");
 const outputs=[],controls=[];
 for(const [q,n] of configs){
  const pool=[];for(const d of D){const ss=candidates(d.words,n,q,q===8);if(ss.length)pool.push({name:d.name,words:d.words,ss})}
  const eligible=pool.flatMap(d=>d.ss.filter(s=>s.max<q&&s.to+16<=d.words.length).map(s=>({d,s})));
  if(eligible.length)for(let i=0;i<3;i++){const seed=2014+q*17+n*31+i*101,{d,s}=eligible[(seed*3301)%eligible.length];controls.push({source:d.name,from:s.from,to:s.to,...trial(s.p,q,seed,d.words.slice(s.to,s.to+16))})}
  for(const d of pool)outputs.push({q,n,source:d.name,spans:d.ss.length,partialSpans:d.ss.filter(s=>s.max<q).length,scopes:scopes.map(s=>scan(s,d.ss,q))});
 }
 return {schema:1,configs,sourceBlocks:D.map(d=>({name:d.name,words:d.words.length,runes:d.words.join("").length})),controls,outputs}
}
if(require.main===module){const fs=require("node:fs"),A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),G=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));console.log(JSON.stringify(study(A,G),null,2))}
module.exports={study,sourceBlocks};
