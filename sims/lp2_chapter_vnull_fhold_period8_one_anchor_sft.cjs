"use strict";
const fs=require("node:fs");
const {run:chapter,paths}=require("./lp2_chapter_vnull_fhold_period8_sft.cjs");
const {candidates}=require("./lp2_scroll_vnull_fhold_joint_period8_sft.cjs");
const {makeReceiver}=require("./lp2_vnull_fhold_periodic_bitmask_sft.cjs");
const {decode}=require("./lp2_vnull_fhold_periodic_language_sft.cjs");
const {names}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const Q=29,q=8,high=Q**(q-1);
function pack(k){return k.reduce((a,x,i)=>a+x*Q**i,0)}
function unpack(v,k=new Int8Array(q)){for(let i=0;i<q;i++){k[i]=v%Q;v=Math.floor(v/Q)}return k}
function canonical(v){let z=v;for(let j=1;j<q;j++){v=Math.floor(v/Q)+(v%Q)*high;if(v<z)z=v}return z}
function screen({name,ws,truth,key,p,bylen,dict,lp}){
 const C=ws.flat(),result={name,n:C.length,trainN:p.trainN,anchors:p.anchors,eligible:p.anchors.length>=1,counts:[]};if(!result.eligible)return result;
 const set=new Set();
 for(const a of p.anchors){
  const raw=candidates({...a,offset:0,zeros:0},bylen),before=set.size;for(const v of raw)set.add(canonical(v));
  result.counts.push({offset:a.offset,width:a.word.length,local:raw.size,newCycles:set.size-before,union:set.size});
 }
 const trueCycle=key?canonical(pack(key)):null;result.containsTrue=key?set.has(trueCycle):null;
 if(truth)result.trueAnchorForms=p.anchors.map(a=>({length:truth[a.index].length,inDict:dict.has(truth[a.index].join(",")),nulls:a.word.length-truth[a.index].length}));
 const R=makeReceiver(C.length,q),k=new Int8Array(q),survivors=[];let phaseCount=0;
 for(const v of set){
  R.setKey(unpack(v,k));if(!R.reach(C).possible)continue;
  let mask=0;for(let ph=0;ph<q;ph++)if(R.reach(C,1<<ph).possible){mask|=1<<ph;phaseCount++}
  if(!mask)throw Error("phase union mismatch");survivors.push([v,mask]);
 }
 result.cycles=set.size;result.survivingCycles=survivors.length;result.survivingPhases=phaseCount;result.trueSurvives=key?survivors.some(x=>x[0]===trueCycle):null;result.survivors=survivors;
 return result;
}
function score({name,ws,truth,key,p,bylen,dict,lp},screened,start=0,end=screened.survivors.length){
 const C=ws.flat(),rows=[];let best=null;
 for(const [v,mask] of screened.survivors.slice(start,end)){
  const k=Array.from(unpack(v));for(let ph=0;ph<q;ph++)if(mask&(1<<ph)){
   const d=decode(C,k,ph,lp);if(!d.possible)throw Error("screen mismatch");
   const row={v,phase:ph,bf:d.bf,ll:d.ll};rows.push(row);
   if(!best||d.ll>best.ll){const eff=Array.from({length:q},(_,i)=>k[(i+ph)%q]);best={...row,key:eff,P:d.P,plain:d.P.map(x=>names[x]).join(""),correctKey:key?eff.every((x,i)=>x===key[i]):null}}
  }
 }
 return {name,start,end,scored:rows.length,best,rows};
}
function run(raw,mode="original",start=0,end=9,screened=null,lo=0,hi=null){
 return chapter(raw,mode,start,end,screened===null?screen:x=>score(x,screened,lo,hi??screened.survivors.length));
}
if(require.main===module){const raw=paths.map(p=>fs.readFileSync(p,"utf8"));const i=Number(process.argv[2]??0),mode=process.argv[3]??"original",out=run(raw,mode,i,i+1);console.log(JSON.stringify(out,null,2))}
module.exports={run,screen,score,canonical,paths};
