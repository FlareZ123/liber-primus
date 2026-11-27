'use strict';
const fs=require('node:fs');
const path=require('node:path');
// #3182: exact source gap obstruction and native punctuation boundary-state collision.
// All nonrunes are granted as observed events, even editorial layout markup.
// Inputs: resources/liber-primus/lp2-corpus.json and resources/transcriptions/lp2-image-corrected.txt.
function run(corpus,src){
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const map=new Map(corpus.runes.map((r,i)=>[r,i]));
 const C=[],gaps=new Map();
 for(const ch of src){if(map.has(ch))C.push(map.get(ch));else gaps.set(C.length,(gaps.get(C.length)||"")+ch)}
 assert(same(C,corpus.pages.flatMap(p=>p.indices)),"source/corpus mismatch");
 const N=corpus.pages.slice(0,56).reduce((a,p)=>a+p.indices.length,0);
 const repeats=[];
 for(let i=1;i<N;i++)if(C[i]===C[i-1])repeats.push({i,r:C[i],event:gaps.get(i)||""});
 const counts={all:repeats.length,anyEvent:repeats.filter(x=>x.event).length,nonFUnmarked:repeats.filter(x=>x.r!==0&&!x.event).length,unmarked:repeats.filter(x=>!x.event).length,wordOnly:repeats.filter(x=>x.event.includes("-")).length,firstUnmarkedNonF:repeats.find(x=>!x.event&&x.r!==0),marked:repeats.filter(x=>x.event)};
 // Ordinary GP29 retry. All observed events reset remembered rune; phase remains continuous.
 function step(p,prev,t,key){for(let j=0;j<key.length;j++){const c=(p+key[t%key.length])%29;t++;if(c!==prev)return {c,t}}throw Error("constant key")}
 function plant(P,start,key){let t=0,prev=-1;const out=[],states=[];for(let i=0;i<P.length;i++){if(gaps.has(start+i))prev=-1;states.push({prev,t});const z=step(P[i],prev,t,key);out.push(z.c);prev=z.c;t=z.t}states.push({prev,t});return {out,states}}
 function collision(P,start,key){
  const {out,states}=plant(P,start,key),blocks=[];let lo=0;
  for(let i=1;i<=P.length;i++)if(i===P.length||gaps.has(start+i)){blocks.push([lo,i]);lo=i}
  let ways=1n;const amb=[];
  for(const [l,h] of blocks){
   let dp=new Map([[states[l].t,{count:1n,examples:[[]]}]]);
   for(let i=l;i<h;i++){const nd=new Map(),prev=i===l?states[l].prev:out[i-1];for(const [t,x] of dp)for(let p=0;p<29;p++){const z=step(p,prev,t,key);if(z.c!==out[i]||z.t>states[h].t)continue;const y=nd.get(z.t)||{count:0n,examples:[]};y.count+=x.count;for(const hist of x.examples)if(y.examples.length<2)y.examples.push([...hist,p]);nd.set(z.t,y)}dp=nd}
   const x=dp.get(states[h].t);assert(x,"true boundary clock lost");ways*=x.count;
   if(x.count>1n){const trueP=P.slice(l,h),alt=x.examples.find(v=>!same(v,trueP));assert(alt,"alternate missing");const altP=[...P.slice(0,l),...alt,...P.slice(h)],z=plant(altP,start,key);assert(same(z.out,out),"ciphertext replay failed");assert(blocks.every(([a,b])=>same(z.states[a],states[a])&&same(z.states[b],states[b])),"boundary state replay failed");amb.push({l,h,count:String(x.count),trueP,alt,cipher:out.slice(l,h),startState:states[l],endT:states[h].t})}
  }
  return {blocks:blocks.length,attempts:states.at(-1).t,ways:String(ways),ambiguousBlocks:amb.length,first:amb[0]||null}
 }
 const p56=corpus.pages[56].indices,primes=[];for(let i=2;primes.length<85;i++)if(!primes.some(p=>i%p===0))primes.push(i);
 let t=0;const P56=p56.map((v,i)=>i===56?v:(v-(primes[t++]-1)%29+29)%29);
 assert(t===84&&P56[56]===0,"p56 consuming clock");
 assert(P56.map(r=>corpus.translit[r]).join("").startsWith("ANENDWITHINTHEDEEPWEB"),"p56 historical opening");
 const P57=corpus.pages[57].indices,keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 const controls=[P56,P57].flatMap((p,i)=>keys.map((key,k)=>({page:56+i,key:k===0?"DIUINITY":"FIRFUMFERENFE",...collision(p,i===0?N:N+p56.length,key)})));
 assert(counts.all===86&&counts.anyEvent===26&&counts.nonFUnmarked===57,"repeat census regression");
 assert(controls.map(c=>c.ways).join(",")==="1,1,1,2","boundary inverse regression");
 return {counts,controls};
}
const root=path.join(__dirname,'..');
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'resources/transcriptions/lp2-image-corrected.txt'),'utf8')),null,2));
