"use strict";
const fs=require("node:fs");const path=require("node:path");
function experiment(j){
 const idx=new Map(j.runes.map((x,i)=>[x,i])),sections=j.sections.map(s=>({name:s.name,v:Array.from(s.source_text).filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const mod=x=>(x+29)%29;
 function keyOf(c,p){const key=[];for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0)return null}else key.push(mod(c[i]-p[i]))}return key}
 function endFor(v,start,ticks){let n=0,i=start;while(i<v.length&&n<ticks){if(v[i++]!==0)n++}if(n!==ticks)throw Error("donor too short");return i}
 function run(seed,wrong){
   let st=seed>>>0;const rand=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return(st>>>0)%29};
   const ai=seed%2===0?1:3,bi=seed%2===0?4:5;
   const oa=(seed*13)%101,ob=(seed*17)%97;const A=sections[ai].v.slice(oa,oa+110),B=sections[bi].v.slice(ob,ob+123);
   const cutA=17+seed%5,overlap=A.slice(cutA).filter(x=>x!==0).length,cutB=endFor(B,0,overlap),shared=Array.from({length:overlap},rand);
   function enc(P,lo,hi,K){let t=0;return P.map((p,i)=>p===0?0:mod(p+(i>=lo&&i<hi?K[t++]:rand())))}
   const CA=enc(A,cutA,A.length,shared),CB=enc(B,0,cutB,wrong?Array.from({length:overlap},rand):shared);
   const left=new Map(),right=[];
   let nA=0,nB=0;for(const s of sections){
     for(let start=0;start+CA.length<=s.v.length;start++){
       const p=s.v.slice(start,start+CA.length),pre=keyOf(CA.slice(0,cutA),p.slice(0,cutA)),k=keyOf(CA.slice(cutA),p.slice(cutA));
       if(pre===null||k===null)continue;nA++;const sig=k.join(",");if(!left.has(sig))left.set(sig,[]);left.get(sig).push({section:s.name,start,p,k});
     }
     for(let start=0;start+CB.length<=s.v.length;start++){
       const p=s.v.slice(start,start+CB.length),k=keyOf(CB.slice(0,cutB),p.slice(0,cutB));if(k===null)continue;nB++;
       const list=left.get(k.join(",")); // deferred until all A candidates indexed
       right.push({section:s.name,start,p,k});
     }
   }
   const matches=[];for(const b of right)for(const a of left.get(b.k.join(","))??[])matches.push({a,b});
   const uniquePlain=new Set(matches.map(m=>m.a.p.join(",")+"|"+m.b.p.join(",")));
   const keys=new Set(matches.map(m=>m.a.k.join(",")));
   const good=matches.filter(m=>m.a.p.join()===A.join()&&m.b.p.join()===B.join()&&m.a.k.join()===shared.join());
   return {seed,wrong,nA,nB,cutA,cutB,lengthA:A.length,lengthB:B.length,overlap,matchedPairs:matches.length,distinctPlainPairs:uniquePlain.size,distinctKeys:keys.size,truePairs:good.length,heldTail: B.length-cutB,tailCorrect:matches.length===1?matches[0].b.p.slice(cutB).filter((p,i)=>p===B[cutB+i]).length:null};
 }
 const controls=[];for(const seed of [11,24,37,52])for(const wrong of [false,true])controls.push(run(seed,wrong));
 if(controls.some(x=>x.wrong?x.matchedPairs!==0:x.truePairs<1))throw Error("control failed");
 return {controls,finiteDonorOnly:true};
}
if(require.main===module){console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/external/relikd-solved-gp29-native-v1.json"),"utf8"))),null,2));}
module.exports=experiment;
