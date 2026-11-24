"use strict";
const fs=require("node:fs");
const A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const k=[];for(let n=2;k.length<5500;n++){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break}if(p)k.push((n-1)%29)}
const mask=Array.from({length:29},()=>Array(k.length).fill(0n)),cap=(1n<<128n)-1n;
for(let c=0;c<29;c++)for(let q=0;q<k.length;q++)mask[c][q]=((q?mask[c][q-1]<<1n:0n)|(c===k[q]?0n:1n))&cap;
for(const [name,c,expected] of [["p8-14",A.pages.slice(8,15).flatMap(p=>p.indices),524],["p15body-22",A.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(20)),539],["p33-39",A.pages.slice(33,40).flatMap(p=>p.indices),594]]){
 if(c.filter(v=>v===0).length>=128)throw Error("hold capacity");
 let best=0,phases=[],legal=[];
 for(let o=0;o<=3301;o++){let s=1n,i=0;for(;i<c.length;i++){let v=c[i];s=(s&mask[v][o+i])|(v===0?s<<1n:0n);if(!s)break}
 if(i>best){best=i;phases=[o]}else if(i===best)phases.push(o);if(i===c.length)legal.push(o)}
 console.log(JSON.stringify({name,len:c.length,legal:legal.length,longest:best,bestOrigins:phases}));
 if(legal.length||best!==expected)throw Error("scope result mismatch");
}
