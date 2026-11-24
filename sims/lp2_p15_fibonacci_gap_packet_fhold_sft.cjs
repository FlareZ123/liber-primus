'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const chart=read('resources/liber-primus/lp2-corpus.json'),native=read('resources/external/relikd-solved-gp29-native-v1.json'),ink=read('resources/liber-primus/lp2-ink-annotations.json');
const gp=new Map(chart.runes.map((r,i)=>[r,i])),runes=t=>[...t].filter(c=>gp.has(c)).map(c=>gp.get(c));
const mod=x=>(x+29)%29,primes=[];
for(let n=2;primes.length<988;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
const fib=[0,1,2];while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));
const ord=fib.map(x=>x+1),grid=ord.map(i=>Math.abs(3301-primes[i-1]));
assert.deepEqual(grid,[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const packets=ord.slice(0,-1).map((rank,i)=>({rank,len:ord[i+1]-rank,shift:mod(primes[rank-1]-1)}));
const k=packets.flatMap(p=>Array(p.len).fill(p.shift));assert.equal(k.length,987);
function encode(p,key){
  let j=0;const c=[];
  for(let i=0;i<p.length;i++){const v=p[i];c.push(v===0?0:mod(v+key[j++]));if(j===key.length)return {c,plain:p.slice(0,i+1),j}}
  return {c,plain:p,j};
}
function decode(c,key){
  let states=new Map([[0,1n]]),ends=[],trace=[];
  for(let i=0;i<c.length;i++){const next=new Map(),add=(j,n)=>next.set(j,(next.get(j)||0n)+n),v=c[i];
    for(const [j,n] of states){
      if(v===0)add(j,n);
      if(mod(v-key[j])!==0){if(j+1===key.length)ends.push({physicalLength:i+1,paths:String(n)});else add(j+1,n)}
    }
    trace.push({i,v,states:[...next].map(([j,n])=>[j,String(n)])});states=next;
    if(!states.size)return {ends,death:i,trace:trace.slice(-8)};
  }
  return {ends,death:null,trace:trace.slice(-8)};
}
const p56=runes(native.sections.find(s=>s.name==='p56_an_end').source_text);
const p56k=primes.slice(0,p56.filter(v=>v!==0).length).map(p=>mod(p-1)),p56replay=encode(p56,p56k);
assert.deepEqual(p56replay.c,chart.pages[56].indices);
const start=ink.pages.find(p=>p.page===15).red_spans[1];assert.equal(start.start+start.length,20);
const source=chart.pages.slice(15,23).flatMap(p=>p.indices).slice(20);assert.equal(source.length,1883);
const result=decode(source,k);assert.equal(result.death,36);assert.equal(result.ends.length,0);
const donors=[native.sections.slice(0,5),native.sections.slice(4,9)].map((ss,i)=>{
  const p=ss.flatMap(s=>runes(s.source_text)),plant=encode(p,k),inv=decode(plant.c,k);
  assert.equal(plant.j,987);assert(inv.ends.some(x=>x.physicalLength===plant.c.length));
  assert.deepEqual(encode(plant.plain,k).c,plant.c);
  return {i,n:plant.c.length,holds:plant.c.length-987,terminal:inv.ends.filter(x=>x.physicalLength===plant.c.length),endCount:inv.ends.length,death:inv.death,truthReplay:true};
});
console.log(JSON.stringify({fib,ord,grid,packets,kLen:k.length,sourceLen:source.length,firstSource:source.slice(0,15),p56Replay:p56replay.c.length,p56Consumes:p56replay.j,result,donors},null,2));
