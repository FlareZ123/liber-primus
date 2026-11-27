'use strict';
const fs = require('node:fs');
const path = require('node:path');
function experiment(c){
 const mod=x=>((x%29)+29)%29, cube=x=>mod(x*x*x);
 function stream(seed,n){const k=seed.slice(0,n);while(k.length<n){const i=k.length;k.push(cube(mod(22*k[i-1]+5*k[i-2]+17*k[i-3])))}return k}
 function decode(c,k){return c.map((x,i)=>mod(x-k[i]))}
 function ioc(a){const h=new Uint32Array(29);for(const x of a)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))}
 const targets=[["p28",c.pages[28].indices],["p29 interior",c.pages[29].indices.slice(3,272)],["p33",c.pages[33].indices]];
 const seed=[2,23,6];if(c.pages[29].indices.slice(0,3).join()!=seed.join())throw Error("source seed changed");
 const n=Math.max(...targets.map(x=>x[1].length));
 const controls=targets.map(([name,a])=>{const plain=Array.from({length:a.length},(_,i)=>c.pages[57].indices[i%95]);const k=stream(seed,a.length);const enc=plain.map((x,i)=>mod(x+k[i]));const recovered=decode(enc,k);return {name,plainIoC:ioc(plain),cipherIoC:ioc(enc),recovered:recovered.filter((x,i)=>x===plain[i]).length,length:plain.length}});
 const stats=targets.map(([name,a])=>({name,length:a.length,max:0,seed:null,above045:0,above05:0,sourceIoC:ioc(decode(a,stream(seed,a.length))),sourceOutput:decode(a,stream(seed,a.length)).map(x=>c.translit[x]).join(" "),bestOutput:null}));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){const k=stream([a,b,d],n);for(let j=0;j<targets.length;j++){const dec=decode(targets[j][1],k),s=ioc(dec),v=stats[j];if(s>v.max){v.max=s;v.seed=[a,b,d];v.bestOutput=dec.map(x=>c.translit[x]).join(" ")}if(s>=.045)v.above045++;if(s>=.05)v.above05++}}
 return {states:29**3,controls,stats};
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
