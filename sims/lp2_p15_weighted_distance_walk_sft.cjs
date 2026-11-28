'use strict';
const fs = require('node:fs');
const path = require('node:path');
function run(j){
const assert=(b,m)=>{if(!b)throw Error(m)};
const page=n=>j.pages.find(p=>p.page===n).indices;
const render=a=>a.map(x=>j.translit[x]).join("");
const mod=x=>(x%29+29)%29;
const f=[0,1,2];while(f.length<18)f.push(f.at(-1)+f.at(-2));
const primes=[];for(let n=2;primes.length<=f.at(-1);n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
const distances=f.map(i=>Math.abs(3301-primes[i]));
assert(JSON.stringify(distances.slice(0,16))===JSON.stringify([3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]),"grid");
assert(distances[16]===10176,"extra");
const rows=[];let s=0;
for(let p=15;p<=22;p++)for(let i=(p===15?9:0);i<page(p).length;i++){const x=page(p)[i];rows.push({page:p,offset:i,x,lo:s,hi:s+j.prime[x]});s+=j.prime[x]}
assert(rows.length===1894,"region");
let pos=0;const pointers=distances.map((d,i)=>{pos+=d;const hit=rows.find(z=>z.lo<=pos&&pos<z.hi);return {i,d,pos,hit:hit??null,exact:hit?.lo===pos}});
const key=pointers.slice(0,16).map(x=>x.hit.x);const target=j.pages.filter(p=>p.page>=23&&p.page<=32).flatMap(p=>p.indices),cut=j.pages.filter(p=>p.page>=23&&p.page<=26).reduce((s,p)=>s+p.indices.length,0);
function encode(p,sign){let i=0;return p.map(x=>x===0?0:mod(x+sign*key[i++%16]))}
function decode(c,sign){let q=new Map([[0,1n]]),firstDead=null,counts=[];for(let i=0;i<c.length;i++){let next=new Map();const add=(k,n)=>next.set(k,(next.get(k)??0n)+n);for(const [phase,n] of q){if(c[i]===0)add(phase,n);if(mod(c[i]-sign*key[phase])!==0)add((phase+1)%16,n)}q=next;counts.push([...q.values()].reduce((a,b)=>a+b,0n).toString());if(!q.size){firstDead=i;break}}return {firstDead,complete:q.size>0,paths:[...q.values()].reduce((a,b)=>a+b,0n).toString(),counts}}
const tests=[1,-1].map(sign=>{const plant=Array.from({length:target.length},(_,i)=>page(57)[i%page(57).length]);const enc=encode(plant,sign),pl=decode(enc,sign);assert(pl.complete,"plant");const ordinary=target.map((x,i)=>mod(x-sign*key[i%16]));assert(ordinary.every((x,i)=>mod(x+sign*key[i%16])===target[i]),"ordinary replay");return {sign,plantPaths:pl.paths,original:decode(target,sign),ordinary:render(ordinary),ordinaryIndices:ordinary}});
return {region:{runes:rows.length,weight:s},distances,pointers,key,keyText:render(key),cut,targetLength:target.length,tests};
}
const j=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(run(j),null,2));
