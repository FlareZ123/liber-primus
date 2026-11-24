#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(c,g){
const F=[1,2,3,5,8,13,21,34,55,89];function fib(n){let k=F.findIndex(v=>v>n),a=Array(k).fill(0);for(let i=k-1;i>=0;i--)if(F[i]<=n){n-=F[i];a[i]=1}return a.join("")+"1"}
function graph(P){const E=Array.from({length:29},()=>Array(29).fill(false));for(let i=1;i<P.length-1;i++)E[P[i-1]][P[i]]=true;return E}
const good=(E,i,j)=>!E[i][j]&&!E[j][i];function capacity(E){let best=[],longs=[];for(let i=0;i<29;i++)for(let j=i+1;j<29;j++)if(good(E,i,i)&&good(E,j,j)&&good(E,i,j)){const common=Array.from({length:29},(_,k)=>k).filter(k=>k!==i&&k!==j&&good(E,i,k)&&good(E,j,k));if(common.length+2>best.length){best=[i,j,...common];longs=[i,j]}}return{max:best.length,best,longs}}
const b5=Array.from({length:32},(_,i)=>i.toString(2).padStart(5,"0"));const b4=Array.from({length:16},(_,i)=>i.toString(2).padStart(4,"0"));const bad=s=>s[0]==="0"&&!s.includes("11");
let cases=0,minBad=29,minLong=29,shapes=new Map;for(let i=0;i<16;i++)for(let j=i+1;j<16;j++)for(let k=j+1;k<16;k++){const short=[b4[i],b4[j],b4[k]],code=[...short,...b5.filter(s=>!short.includes(s.slice(0,4)))],badShort=short.filter(bad).length,badLong=code.filter(s=>s.length===5&&bad(s)).length;minBad=Math.min(minBad,badShort+badLong);minLong=Math.min(minLong,badLong);const name=`${badShort},${badLong}`;shapes.set(name,(shapes.get(name)||0)+1);cases++}
const P=c.pages.slice(16,23).flatMap(p=>p.indices),E=graph(P),orig=capacity(E);
const m=new Map(c.runes.map((s,i)=>[s,i]));const plain=Array.from(g.sections.find(s=>s.name==="jpg107-167").source_text).filter(s=>m.has(s)).map(s=>m.get(s)+1),bits=plain.map(fib).join("");
const short=["0000","0001","0010"],code=[...short,...b5.filter(s=>!short.includes(s.slice(0,4)))];let chunks=[],pos=0,pad="";while(pos<bits.length){let w=code.find(s=>bits.startsWith(s,pos));if(!w){let rest=bits.slice(pos);w=code.find(s=>s.startsWith(rest));if(!w)throw Error("prefix");pad=w.slice(rest.length)}chunks.push(code.indexOf(w));pos+=w.length}
const stream=chunks.map(i=>code[i]).join("").slice(0,bits.length);let z=0,recovered=[];while(z<stream.length){let e=stream.indexOf("11",z);if(e<0)throw Error("terminal");let w=stream.slice(z,e+2);recovered.push(Array.from(w.slice(0,-1)).reduce((a,v,i)=>a+Number(v)*F[i],0));z=e+2}if(recovered.join()!==plain.join())throw Error("control");const CE=graph(chunks),control=capacity(CE),badLabels=code.map((s,i)=>bad(s)?i:-1).filter(i=>i>=0),longLabels=badLabels.filter(i=>code[i].length===5);for(const i of longLabels)for(const j of badLabels)if(!good(CE,i,j))throw Error("control graph theorem");
return{cases,minBad,minLong,shapes:[...shapes],original:{n:P.length,distinctEdges:E.flat().filter(Boolean).length,...orig},control:{n:plain.length,decoded:recovered.length,bits:bits.length,cipherRunes:chunks.length,pad,badLabels,longLabels,usedLabels:new Set(chunks).size,...control}}
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const z=experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"));console.log(JSON.stringify(z,null,2));if(z.cases!==560||z.minBad!==5||z.minLong!==2||z.original.max!==2||z.control.decoded!==319)process.exitCode=1;
