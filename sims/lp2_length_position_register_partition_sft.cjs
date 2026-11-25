"use strict";
const fs=require("node:fs");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt"
];
function partitionGate(raw){
 const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i]));let w=[],between="",all=[];for(const c of raw[1]){if(ix.has(c)){if(w.length&&/[-.&]/.test(between)){all.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)all.push(w);
 const ranges=[[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]];let off=0;const chapters=ranges.map(([a,b,n])=>{const g=all.slice(off,off+=n);if(g.flat().join()!==gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).join())throw Error("source mismatch");return g;});
 const N=12956,zeros=chapters.flat(2).filter(x=>x===0).length;if(zeros!==458)throw Error("source zero count");
 function rowsFor(groups,hold){const out=new Map();for(const c of groups){const poss=Array.from({length:c.length},()=>new Set());let z=0;for(let i=0;i<c.length;i++){for(let j=hold?i-z:i;j<=i;j++)poss[j].add(c[i]);if(c[i]===0)z++;}
 for(let j=0;j<c.length;j++){const k=c.length+":"+j;if(!out.has(k))out.set(k,new Uint32Array(29));for(const v of poss[j])out.get(k)[v]++;}}
 return out;}
 function run(hold){const each=chapters.map(g=>rowsFor(g,hold)),cache=[null];for(let mask=1;mask<512;mask++){const rows=new Map();for(let i=0;i<9;i++)if(mask&(1<<i))for(const [k,h] of each[i]){if(!rows.has(k))rows.set(k,new Uint32Array(29));const d=rows.get(k);for(let j=0;j<29;j++)d[j]+=h[j];}
 const sum=Array(29).fill(0);for(const h of rows.values())Array.from(h).sort((a,b)=>b-a).forEach((v,i)=>sum[i]+=v);cache.push(sum);}
 const out=Array.from({length:10},(_,k)=>({k,count:0,maxIoC:0,maxE:0,maxIoCPartition:null,maxEPartition:null,passesBoth:0}));
 const minIoC=0.057216772285951,minE=1408;let total=0;
 function evaluate(blocks){total++;const b=out[blocks.length],sum=Array(29).fill(0);for(const m of blocks)for(let j=0;j<29;j++)sum[j]+=cache[m][j];const E=sum[0];let h=hold?sum.slice(0,28).concat(zeros).sort((a,b)=>b-a):sum;let left=N;h=h.map(x=>{const v=Math.min(x,left);left-=v;return v;});if(left!==0)throw Error("capacity");const ioc=h.reduce((s,x)=>s+x*(x-1),0)/(N*(N-1));b.count++;if(ioc>b.maxIoC){b.maxIoC=ioc;b.maxIoCPartition=blocks.slice();}if(E>b.maxE){b.maxE=E;b.maxEPartition=blocks.slice();}if(ioc>=minIoC&&E>=minE)b.passesBoth++;}
 function rec(i,blocks){if(i===9){evaluate(blocks);return;}const bit=1<<i;for(let k=0;k<blocks.length;k++){blocks[k]|=bit;rec(i+1,blocks);blocks[k]^=bit;}blocks.push(bit);rec(i+1,blocks);blocks.pop();}
 rec(0,[]);if(total!==21147)throw Error("Bell count");return out.slice(1);}
 return {ranges:ranges.map(x=>x.slice(0,2)),N,zeros,ordinary:run(false),latentF:run(true)};
}
if(require.main===module)console.log(JSON.stringify(partitionGate(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={partitionGate};
