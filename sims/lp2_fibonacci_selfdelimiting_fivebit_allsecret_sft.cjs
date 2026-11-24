#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(c,g){
const F=[1,2];while(F.at(-1)<10000)F.push(F.at(-1)+F.at(-2));
function encode(n){if(n<1)throw Error("positive integers only");let k=F.findIndex(v=>v>n),a=Array(k).fill(0);for(let i=k-1;i>=0;i--)if(F[i]<=n){a[i]=1;n-=F[i]}if(n)throw Error("unrepresentable");return a.join("")+"1"}
function decode(bits,max=Infinity){let pos=0,out=[];while(pos<bits.length){let e=bits.indexOf("11",pos);if(e<0)return{out,tail:bits.slice(pos),failure:null};let s=bits.slice(pos,e+2),v=0;for(let i=0;i<s.length-1;i++)if(s[i]==="1")v+=F[i]??Infinity;if(v>max)return{out,tail:bits.slice(pos),failure:{pos,code:s,value:v}};out.push(v);pos=e+2}return{out,tail:"",failure:null}}
const historical=[[1,"11"],[2,"011"],[3,"0011"],[4,"1011"],[5,"00011"],[6,"10011"],[7,"01011"],[8,"000011"],[16,"0010011"],[32,"00101011"]];
const histBits=historical.map(x=>x[1]).join(""),histDec=decode(histBits);if(historical.some(([n,s])=>encode(n)!==s)||histDec.out.join()!==historical.map(x=>x[0]).join()||histDec.tail)throw Error("historical control");
function graph(P){let E=Array.from({length:29},()=>Array(29).fill(false));for(let i=1;i<P.length;i++)E[P[i-1]][P[i]]=true;let best=[];function dfs(s,start){if(s.length>best.length)best=s;for(let i=start;i<29;i++)if(!E[i][i]&&s.every(v=>!E[i][v]&&!E[v][i]))dfs([...s,i],i+1)}dfs([],0);return{edges:E.flat().filter(Boolean).length,loops:E.filter((row,i)=>row[i]).length,maxIndependent:best,maxSize:best.length}}
const no11=Array.from({length:32},(_,i)=>i.toString(2).padStart(5,"0")).filter(s=>s[0]==="0"&&!s.includes("11"));
const runeMap=new Map(c.runes.map((x,i)=>[x,i])),section=g.sections.find(s=>s.name==="jpg107-167"),P=Array.from(section.source_text).filter(x=>runeMap.has(x)).map(x=>runeMap.get(x)+1),pb=P.map(encode).join("");
const chunks=pb.match(/.{5}/g).map(s=>parseInt(s,2)),tail=pb.slice(chunks.length*5),alphabet=[...new Set(chunks)];for(let i=0;i<32&&alphabet.length<29;i++)if(!alphabet.includes(i))alphabet.push(i);if(alphabet.length!==29)throw Error("no fixed 29 symbol transport");
const planted=chunks.map(v=>alphabet.indexOf(v)),recovered=decode(planted.map(i=>alphabet[i].toString(2).padStart(5,"0")).join("")+tail,29);if(recovered.out.join()!==P.join()||recovered.tail||recovered.failure)throw Error("plant inverse failed");
const pg=graph(planted),witness=alphabet.map((v,i)=>no11.includes(v.toString(2).padStart(5,"0"))?i:-1).filter(i=>i>=0);if(pg.maxSize<witness.length||witness.length<5)throw Error("plant graph theorem");
const orig=c.pages.slice(16,23).flatMap(p=>p.indices),og=graph(orig),bits=orig.map(i=>i.toString(2).padStart(5,"0")).join(""),d=decode(bits,29);
return{historical:{values:histDec.out,bits:histBits.length},maxCodeLength:Math.max(...Array.from({length:29},(_,i)=>encode(i+1).length)),no11,positive:{nativeSymbols:P.length,bits:pb.length,cipherRunes:planted.length,tail,usedCodes:new Set(chunks).size,exact:recovered.out.length,requiredIndependent:witness,graph:pg},original:{runes:orig.length,firstInvalid:d.failure,decodedBeforeFailure:d.out.length,graph:og,necessaryIndependent:5,maxPossibleAlphabet:32-no11.length+og.maxSize}};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const z=experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"));console.log(JSON.stringify(z,null,2));if(z.original.graph.maxSize>=5||z.positive.exact!==z.positive.nativeSymbols)process.exitCode=1;
