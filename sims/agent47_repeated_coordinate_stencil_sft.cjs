"use strict";
const fs=require("node:fs");
function experiment(v){const code=v[0].split(/\r?\n/).filter(s=>/^(?:I|II|III):\d+:\d+$|^[05]$/.test(s)),chapters=v.slice(1).map(t=>t.split(/\d+\. /).filter(Boolean).map(s=>s.replace(/[ \n]/g,'')));const groups=new Map();let output="";for(let i=0;i<code.length;i++){const s=code[i];if(s.length===1){output+=s;continue}const [c,l,k]=s.split(":"),x=chapters[c.length-1][+l-1]?.[+k-1];if(x===undefined)throw Error("coordinate");output+=x;if(!groups.has(s))groups.set(s,[]);groups.get(s).push(i)}
 const repeats=[...groups].filter(([s,p])=>p.length>1).map(([coordinate,positions])=>({coordinate,positions,characters:positions.map(i=>output[i])}));
 return {records:code.length,coordinates:code.length-2,distinctCoordinates:groups.size,repeats,output};
}
function calibrate(N){
 const q=29,mod=x=>(x%q+q)%q,idx=new Map(N.runes.map((x,i)=>[x,i]));
 function solve(C,pairs,p0){const out=[];for(let b=0;b<q;b++){if(pairs.every(([i,j])=>mod(C[i]-C[j])===mod(b*(i-j))))out.push({a:mod(C[0]-p0),b})}return out}
 const controls=[];
 for(const s of N.sections){const P=Array.from(s.source_text).filter(x=>idx.has(x)).map(x=>idx.get(x)),pairs=[],used=new Set([0]);
   for(let i=1;i<60&&pairs.length<3;i++)for(let j=i+10;j<60&&pairs.length<3;j++){if(P[i]===P[j]&&(j-i)%q&&!used.has(i)&&!used.has(j)){pairs.push([i,j]);used.add(i);used.add(j);break}}
   if(pairs.length!==3)throw Error("insufficient control pairs");
   // Wrong stencil: first endpoint displaced to nearest following rune
   // not equal to its mate; chosen by plant author, not decoder.
   let [i,j]=pairs[0],m=j+1;while(m<60&&P[m]===P[i])m++;if(m>=60)throw Error("no wrong endpoint");
   const wrongPairs=[[i,m],...pairs.slice(1)];let correct=0,wrongMaskFeasible=0,wrongLawFeasible=0,held=0;
   for(const [a,b] of [[7,13],[11,2],[21,17]]){
     const C=P.map((x,i)=>mod(x+a+b*i)),hits=solve(C,pairs,P[0]);if(hits.length!==1||hits[0].a!==a||hits[0].b!==b)throw Error("control inverse");correct++;
     const key=hits[0],Q=C.map((c,i)=>mod(c-key.a-key.b*i));if(Q.join()!==P.join())throw Error("held-out mismatch");held+=Q.length-60;
     if(solve(C,wrongPairs,P[0]).length)wrongMaskFeasible++;
     const W=P.map((x,i)=>mod(x+a+b*i+3*i*i));if(solve(W,pairs,P[0]).length)wrongLawFeasible++;
   }
   controls.push({name:s.name,n:P.length,pairs,wrongPair:wrongPairs[0],correct,wrongMaskFeasible,wrongLawFeasible,held});
 }
 return {controls,summary:controls.reduce((a,x)=>({plants:a.plants+x.correct,wrongMaskFeasible:a.wrongMaskFeasible+x.wrongMaskFeasible,wrongLawFeasible:a.wrongLawFeasible+x.wrongLawFeasible,held:a.held+x.held}),{plants:0,wrongMaskFeasible:0,wrongLawFeasible:0,held:0})};
}
if(require.main===module){const paths=process.argv.slice(2);if(paths.length!==4)throw Error("Supply archived ASC and three source chapters");const historical=experiment(paths.map(p=>fs.readFileSync(p,"utf8")));const native=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));console.log(JSON.stringify({historical,calibration:calibrate(native)},null,2));}
module.exports={experiment,calibrate};
