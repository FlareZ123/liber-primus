"use strict";
/** Exact continuous word-free known-source crib search against arbitrary integrated GP29 rows.
 * Original LP1 solved source only; no assumed printed LP2 word boundaries.
 * Node22/CommonJS, read-only. No unknown plaintext asserted.
 */
const fs=require("node:fs");const path=require("node:path");
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",f),"utf8"));
function run(gp,donor){
 const mod=x=>(x%29+29)%29,ix=new Map(gp.runes.map((g,i)=>[g,i]));
 const C=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const src=donor.sections.slice(0,7).map(s=>({name:s.name,P:[...s.source_text].filter(g=>ix.has(g)).map(g=>ix.get(g))}));
 if(C.length!==12956||src.reduce((n,s)=>n+s.P.length,0)!==2799)throw Error("source count");
 const TRAIN=64,HOLD=100;
 const jobs=[];
 for(const {name,P} of src)for(let s=0;s+TRAIN+HOLD<=P.length;s++){
   const first=new Int16Array(841).fill(-1),witness=[];
   for(let j=1;j<TRAIN;j++){const k=P[s+j-1]*29+P[s+j];if(first[k]!==-1){witness.push([first[k],j]);if(witness.length===5)break}else first[k]=j}
   jobs.push({name,P,s,witness});
 }
 const f=new Int8Array(841),rev=new Int8Array(841),ft=new Uint32Array(841),rt=new Uint32Array(841);let epoch=0;
 function put(q,p,d){const a=q*29+p,b=q*29+d;
  if(ft[a]===epoch&&f[a]!==d||rt[b]===epoch&&rev[b]!==p)return false;
  ft[a]=epoch;f[a]=d;rt[b]=epoch;rev[b]=p;return true
 }
 function scan(cipher){
   const D=Int8Array.from(cipher,(v,i)=>i?mod(v-cipher[i-1]):-1),hits=[];
   let alignments=0,shortlisted=0,known=0;
   for(const {name,P,s,witness} of jobs){
      const bound=D.length-TRAIN-HOLD;
      for(let t=0;t<=bound;t++){
        alignments++;let good=true;
        for(const [a,b] of witness)if(D[t+a]!==D[t+b]){good=false;break}
        if(!good)continue;
        shortlisted++;epoch++;
        for(let j=1;j<TRAIN;j++)if(!put(P[s+j-1],P[s+j],D[t+j])){good=false;break}
        if(!good)continue;
        known++;
        let prediction=0,correctPrefix=0,firstError=-1,q=P[s+TRAIN-1];
        for(let j=TRAIN;j<TRAIN+HOLD;j++){const k=q*29+D[t+j];if(rt[k]!==epoch)break;q=rev[k];prediction++;if(q===P[s+j]&&firstError<0)correctPrefix++;else if(firstError<0)firstError=j-TRAIN}
        let teacherCovered=0,teacherCorrect=0;
        for(let j=TRAIN;j<TRAIN+HOLD;j++){const k=P[s+j-1]*29+D[t+j];if(rt[k]===epoch){teacherCovered++;teacherCorrect+=rev[k]===P[s+j]}}
        const entries=ft.reduce((n,v)=>n+(v===epoch),0);
        let extension=TRAIN,max=Math.min(P.length-s,D.length-t);
        for(let j=TRAIN;j<max;j++){if(!put(P[s+j-1],P[s+j],D[t+j]))break;extension++}
        hits.push({name,s,t,entries,prediction,correctPrefix,firstError,teacherCovered,teacherCorrect,extension});
      }
   }
   hits.sort((a,b)=>b.extension-a.extension||b.correctPrefix-a.correctPrefix);
   return {alignments,shortlisted,compatible64:known,compatible164:hits.filter(h=>h.extension>=164).length,predicted100:hits.filter(h=>h.correctPrefix===100).length,maxExtension:hits[0]?.extension||0,hits};
 }
 const original=scan(C);
 // Independently fixed source segment and target; the scanner receives neither.
 let seed=0x33012014;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const Q=Array.from({length:29},()=>{const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand(j+1);[a[j],a[k]]=[a[k],a[j]]}return a});
 const target=5555,start=137,length=264,P=src.find(s=>s.name==="0_koan_1").P.slice(start,start+length),plant=C.slice();
 for(let j=1;j<length;j++)plant[target+j]=mod(plant[target+j-1]+Q[P[j-1]][P[j]]);
 const ctrl=scan(plant);
 const exact=ctrl.hits.find(h=>h.name==="0_koan_1"&&h.s===start&&h.t===target);
 if(!exact||exact.extension<length||exact.teacherCorrect!==exact.teacherCovered)throw Error("planted crib not recovered");
 const summarize=x=>({...x,hits:x.hits.slice(0,15)});
 return {sourceStarts:jobs.length,sourceRunes:2799,training:TRAIN,holdout:HOLD,original:summarize(original),plant:summarize(ctrl),exactPlant:exact};
}
const result=run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"));
console.log(JSON.stringify(result,null,2));
