"use strict";
function run(native,cipherSource,lp2){
 const m=x=>(x%29+29)%29,A=native.runes,idx=new Map(A.map((x,i)=>[x,i])),extract=s=>[...s].filter(x=>idx.has(x)).map(x=>idx.get(x)),str=a=>a.map(i=>A[i]).join(""),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),assert=(v,msg)=>{if(!v)throw Error(msg)};
 const C=cipherSource.split("$").map(extract).filter(a=>a.length);const P=native.sections.map(s=>extract(s.source_text));P[3]=C[3].map(x=>m(2-x));assert(C[3].length===778,"corrected reflection source");
 const heading=extract("ᚪᚾᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ");
 const occurrences=a=>a.flatMap((_,i)=>eq(a.slice(i,i+heading.length),heading)?[i]:[]);
 const hits=P.map((p,i)=>({section:native.sections[i].name,offsets:occurrences(p)})).filter(x=>x.offsets.length);
 const w=occurrences(P[1])[0],k=occurrences(P[3])[0];assert(w===485&&heading.length===12&&k>=0,"rubric");
 const a=C[1].slice(w,w+12),b=C[3].slice(k,k+12);
 const d=a.map((x,i)=>m(x+b[i]-2)),periods=[];for(let q=1;q<=12;q++)if(d.every((v,i)=>v===d[i%q]))periods.push(q);
 const local=d.slice(0,periods[0]);const phase=P[1].slice(0,w).filter(x=>x!==0).length%local.length;
 const key=local.map((_,i)=>local[(i-phase+local.length)%local.length]);
 let j=0;const predicted=P[1].map(p=>p===0?0:m(p+key[j++%key.length]));const outside=predicted.filter((x,i)=>(i<w||i>=w+12)&&x===C[1][i]).length;assert(outside===P[1].length-12,"full holdout replay");
 // Distinct-source exact common runs, encrypted units only. All pairs longest, no arbitrary LP2 matching.
 const enc=[{i:0,c:C[0],p:P[0]},{i:1,c:C[1],p:P[1]},{i:3,c:C[3],p:P[3]},{i:5,c:C[5],p:P[5]},{i:7,c:lp2.pages[56].indices,p:P[7]}];const common=[];
 for(let u=0;u<enc.length;u++)for(let v=u+1;v<enc.length;v++){const x=enc[u],y=enc[v],prev=new Uint16Array(y.p.length+1);let best=0,pos=[];for(let i=1;i<=x.p.length;i++){let old=0;for(let j=1;j<=y.p.length;j++){const save=prev[j];prev[j]=x.p[i-1]===y.p[j-1]?old+1:0;old=save;if(prev[j]>best){best=prev[j];pos=[[i-best,j-best]]}else if(prev[j]===best)pos.push([i-best,j-best])}}common.push({a:native.sections[x.i].name,b:native.sections[y.i].name,len:best,positions:pos.slice(0,8),multiplicity:pos.length})}
 const delta=a.map((x,i)=>m(x+b[i]-a[0]-b[0]));
 const wrong=[];for(const shift of [-2,-1,1,2]){const bb=C[3].slice(k+shift,k+shift+12);const dd=a.map((x,i)=>m(x+bb[i]-2));wrong.push({shift,period8:dd.every((x,i)=>x===dd[i%8]),period8Mismatches:dd.slice(8).filter((x,i)=>x!==dd[i]).length})}
 return {schema:"lp1-repeat-rubric-differential-v1",heading:str(heading),hits,align:{welcome:w,koan:k,a,b,d,relativeDelta:delta,periods,phase,key,holdout:outside,total:P[1].length-12},wrong,common};
}
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"))),null,2))}
module.exports={run};
