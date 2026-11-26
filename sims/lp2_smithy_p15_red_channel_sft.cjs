'use strict';
// Frozen issue #3041 receiver: p15 lower rubric through p54; red-only continuous cyclic Fibonacci ordinal key, plus direction, all-consuming or authentic literal plaintext F hold. No fitting.
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,ink){
 const mod=(x,n=29)=>((x%n)+n)%n;
 const check=(condition,msg)=>{if(!condition)throw Error(msg)};
 const smithC="JAEIEXTOSTGPSACGREAMQWFKADPMQZVZ", smithP="JACKIEFISTERWHOAREYOUDREADNOUGHT", sk=[0,0,-2,2,4,7,12,20];
 const smithDecoded=[...smithC].map((c,i)=>String.fromCharCode(65+mod(c.charCodeAt(0)-65+sk[i%8],26))).join("");
 check(smithDecoded===smithP,"Smithy historical effective key");
 const fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
 const primes=[];for(let x=2;primes.length<1100;x++){if(primes.every(p=>p*p>x||x%p!==0))primes.push(x)}
 check(JSON.stringify(fib.map(x=>Math.abs(3301-primes[x])))===JSON.stringify([3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]),"grid");
 const key=fib.map(x=>mod(x));
 const map=new Map(gp.runes.map((r,i)=>[r,i]));
 const spans=ink.pages.flatMap(p=>(p.red_spans||[]).map(s=>({page:p.page,start:s.start,c:[...s.runes].map(r=>map.get(r))})));
 for(const s of spans)check(JSON.stringify(s.c)===JSON.stringify(gp.pages[s.page].indices.slice(s.start,s.start+s.c.length)),"source span");
 const p56=gp.pages[56].indices;
 check(JSON.stringify(p56.slice(0,6).map((c,i)=>mod(c-primes[i]+1)))===JSON.stringify([24,9,18,9,23,7]),"authentic p56 prefix");
 check(spans.find(s=>s.page===57).c.map(i=>gp.translit[i]).join("")==="PARABLE","authentic p57");
 const selected=spans.filter(s=>(s.page>15||s.page===15&&s.start>=9)&&s.page<56);
 const c=selected.flatMap(s=>s.c);
 const cut=selected.filter(s=>s.page<53).reduce((n,s)=>n+s.c.length,0);
 const decode=(a)=>a.map((x,i)=>mod(x+key[i%16]));
 const enc=(a,hold)=>{let j=0;return a.map(x=>hold&&x===0?0:mod(x-key[j++%16]))};
 const plain=decode(c);
 check(JSON.stringify(enc(plain,false))===JSON.stringify(c),"ordinary replay");
 const paths=(a)=>{let states=new Map([[0,1n]]);let firstEmpty=null;const trace=[];for(let i=0;i<a.length;i++){const next=new Map();const put=(j,n)=>next.set(j,(next.get(j)||0n)+n);for(const [j,n] of states){if(a[i]===0)put(j,n);if(mod(a[i]+key[j%16])!==0)put(j+1,n)}states=next;trace.push(states.size);if(!states.size){firstEmpty=i;break}}return {firstEmpty,terminalStates:states.size,paths:[...states.values()].reduce((a,b)=>a+b,0n).toString(),peak:Math.max(1,...trace),statesAtCut:trace[cut-1]??0}};
 const donor=gp.pages[57].indices;const plant=Array.from({length:c.length},(_,i)=>donor[i%donor.length]);
 check(JSON.stringify(decode(enc(plant,false)))===JSON.stringify(plant),"ordinary plant");
 const plantHold=paths(enc(plant,true));check(plantHold.firstEmpty===null,"hold plant");
 const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((n,x)=>n+x*(x-1),0)/(a.length*(a.length-1))};
 let pos=0;const bySpan=selected.map(s=>{const p=plain.slice(pos,pos+s.c.length);pos+=s.c.length;return {page:s.page,start:s.start,length:p.length,plain:p.map(i=>gp.translit[i]).join(" "),runes:p.map(i=>gp.runes[i]).join("")}});
 return {smithDecoded,key,sourceSpans:spans.length,redRunes:spans.reduce((n,s)=>n+s.c.length,0),cut,length:c.length,ordinary:{developmentIoC:ioc(plain.slice(0,cut)),holdoutIoC:ioc(plain.slice(cut)),spans:bySpan},hold:paths(c),plantHold,donorIoC:ioc(donor),ordinaryPlantRecovered:plant.length};
}
const root=path.resolve(__dirname,'..');const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-ink-annotations.json')),null,2));
