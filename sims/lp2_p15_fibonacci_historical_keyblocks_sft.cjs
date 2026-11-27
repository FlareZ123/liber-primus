"use strict";
const fs=require("node:fs");
function experiment(corpus,native){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 const original=corpus.pages.slice(15,23).flatMap(p=>p.indices).slice(20);
 const fit=original.length-corpus.pages[22].indices.length;
 assert(original.length===1883&&fit===1752,"original geometry");
 function stream(order,n){let w="0";while(w.length<n)w=w.replace(/./g,c=>c==="0"?"01":"0");return [...w].flatMap(c=>keys[Number(c)^order]).slice(0,n)}
 function encode(p,k,sign){let j=0;return p.map(x=>x===0?0:mod(x+sign*k[j++]));}
 function reach(c,k,s,truth=null){let states=new Set([0]),max=1,exact=true,jtrue=0;for(let i=0;i<c.length;i++){let next=new Set;for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-s*k[j])!==0)next.add(j+1)}if(truth){if(truth[i]!==0)jtrue++;if(!next.has(jtrue))exact=false}if(!next.size)return {prefix:i,complete:false,max,exact};states=next;max=Math.max(max,states.size)}return {prefix:c.length,complete:true,max,ends:states.size,exact};}
 const io=x=>{const f=Array(29).fill(0);x.forEach(y=>f[y]++);return f.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1))};
 const donor=native.sections.map(s=>[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0));
 const p56=donor[7],pr=[];for(let i=2;pr.length<100;i++)if(pr.every(p=>i%p))pr.push(i);
 assert(p56.length===85&&encode(p56,pr.map(x=>x-1),1).every((x,i)=>x===corpus.pages[56].indices[i]),"p56 replay");
 const results=[];
 for(let order=0;order<2;order++){const k=stream(order,original.length+1);for(const sign of [1,-1]){const ordinary=original.map((x,i)=>mod(x-sign*k[i]));const raw=reach(original,k,sign);const ctl=donor.map(p=>reach(encode(p,k,sign),k,sign,p));assert(ctl.every(x=>x.complete&&x.exact),"planted true path");assert(ordinary.every((x,i)=>mod(x+sign*k[i])===original[i]),"ordinary replay");results.push({order,sign,original:raw,ordinaryIoC:io(ordinary),ordinaryHeldIoC:io(ordinary.slice(fit)),ordinaryHead:ordinary.slice(0,60).map(x=>corpus.translit[x]).join(" "),controls:ctl,keyHead:k.slice(0,55)});}}
 assert(results.map(x=>x.original.prefix).join(",")==="38,36,59,16","original source gate changed");
 return {length:original.length,fit,hold:original.length-fit,p56Replay:85,donorLengths:donor.map(x=>x.length),results};
}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
module.exports=experiment;
