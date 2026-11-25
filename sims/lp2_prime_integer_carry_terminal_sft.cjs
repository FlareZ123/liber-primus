"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,G){
 const mod=x=>(x%29+29)%29,idx=new Map(A.runes.map((r,i)=>[r,i])),s=new Uint8Array(50000);s.fill(1,2);for(let p=2;p*p<s.length;p++)if(s[p])for(let j=p*p;j<s.length;j+=p)s[j]=0;const K=Array.from(s.keys()).filter(i=>s[i]).map(p=>(p-1)%29);if(K.length<3601)throw Error("prime tape");
 const native=G.sections.map(s=>({name:s.name,p:Array.from(s.source_text).filter(r=>idx.has(r)).map(r=>idx.get(r))}));
 const P56=native.find(x=>x.name==="p56_an_end").p;let j=0;let C56=P56.map(p=>p===0?0:mod(p+K[j++]));if(C56.join(",")!==A.pages[56].indices.join(","))throw Error("p56 authentic control");
 function arithmetic(X,o,sign,carry=0){let p=Array(X.length);for(let i=X.length-1;i>=0;i--){let v=X[i]+sign*K[o+i]+carry;p[i]=mod(v);carry=(v-p[i])/29}return {p,carry}}
 function model(ex){let z=new Float64Array(30*30*29).fill(.1);for(let x of native){if(x.name===ex)continue;let a=29,b=29;for(let p of x.p){z[(a*30+b)*29+p]++;a=b;b=p}}for(let i=0;i<z.length;i+=29){let t=0;for(let q=0;q<29;q++)t+=z[i+q];for(let q=0;q<29;q++)z[i+q]=Math.log(z[i+q]/t)}return z}
 function score(p,M,a=29,b=29){let s=0;for(let v of p){s+=M[(a*30+b)*29+v];a=b;b=v}return s}
 function test(C,ex,truth,seed){const cut=223,M=model(ex),pre=C.slice(0,cut),suf=C.slice(cut);let best=null,runner=null,ranked=[];for(let o=0;o<=3301;o++)for(let carry of [0,-1]){let p=arithmetic(pre,o,-1,carry).p,v=score(p,M);let x={o,carry,p,v};ranked.push({o,carry,v});if(!best||v>best.v){runner=best;best=x}else if(!runner||v>runner.v)runner=x}let hold=arithmetic(suf,best.o+cut,-1),complete=best.carry===hold.carry,p=best.p.concat(hold.p),replay=complete&&arithmetic(p,best.o,1).p.every((x,i)=>x===C[i]);let suffixScore=score(hold.p,M,best.p.at(-2),best.p.at(-1))/suf.length;const trueCarry=truth?arithmetic(suf,seed+cut,-1).carry:null;
 return {selected:best.o,hidden:seed,selectedBorrow:best.carry,actualBorrow:hold.carry,trueBorrow:trueCarry,originRank:truth?1+ranked.filter(x=>x.v>ranked.find(x=>x.o===seed&&x.carry===trueCarry).v).length:null,prefixScore:best.v/cut,runnerGap:best.v-runner.v,holdoutScore:suffixScore,complete,replay,correctPrefix:truth?best.p.filter((v,i)=>v===truth[i]).length:null,correctHeld:truth?hold.p.filter((v,i)=>v===truth[i+cut]).length:null,readout:p.map(x=>A.translit[x]).join("")}}
 const C=A.pages[54].indices.slice(9).concat(A.pages[55].indices);if(C.length!==299)throw Error("body");
 let controls=[["0_welcome",1147],["0_koan_1",2089]].map(([n,o])=>{let P=native.find(x=>x.name===n).p.slice(0,299);return {name:n,...test(arithmetic(P,o,1).p,n,P,o)}});
 return {p56:{matched:C56.length,consumed:j},controls,original:test(C,null,null,null)}
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
