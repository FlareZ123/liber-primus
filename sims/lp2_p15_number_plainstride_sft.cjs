'use strict';
function run(corpus,native){
  const mod=(x,n)=>(x%n+n)%n;
  const check=(v,m)=>{if(!v)throw Error(m)};
  const factors=[3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516].flatMap(n=>{let a=[];for(let d=2;d*d<=n;d++)if(n%d===0){a.push(d);while(n%d===0)n/=d}if(n>1)a.push(n);return a});
  const keys=[["factor",factors.map(x=>x%29)],["phi",factors.map(x=>(x-1)%29)],["digits",factors.flatMap(x=>{let a=[];do{a.unshift(x%29);x=Math.floor(x/29)}while(x);return a})]];
  check(keys.map(x=>x[1].length).join()==="44,44,59","key sizes");
  const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const step=[["ordinal",p=>p+1],["prime",p=>primes[p]]];
  const page=n=>corpus.pages.find(p=>p.page===n).indices;
  const c=Array.from({length:7},(_,i)=>page(16+i)).flat(),split=Array.from({length:4},(_,i)=>page(16+i)).flat().length;
  check(c.length===1744&&split===1071,"sizes");
  const train=native.key.slice(0,1000),donor=native.key.slice(1000,1000+c.length);
  const ns=Array(29).fill(0),bs=Array.from({length:29},()=>Array(29).fill(0));
  for(let i=1;i<train.length;i++){ns[train[i-1]]++;bs[train[i-1]][train[i]]++}
  const ll=bs.map((b,i)=>b.map(n=>Math.log((n+.5)/(ns[i]+14.5))));
  const score=p=>p.slice(1).reduce((s,x,i)=>s+ll[p[i]][x],0)/(p.length-1);
  /** @param {number[]} data @param {number[]} k @param {number} sign @param {(p:number)=>number} advance @param {number[]} starts */
  function feasible(data,k,sign,advance,starts){
    let states=new Set(starts);
    for(let i=0;i<data.length;i++){const next=new Set();for(const j of states){if(data[i]===0)next.add(j);const p=mod(data[i]-sign*k[j],29);if(p!==0)next.add((j+advance(p))%k.length)}if(!next.size)return {failure:i,ends:[]};states=next}
    return {failure:null,ends:[...states]};
  }
  /** @param {number[]} p @param {number[]} k @param {number} sign @param {(p:number)=>number} advance @param {number} start */
  function encode(p,k,sign,advance,start){let j=start;return p.map(x=>{if(x===0)return 0;const z=mod(x+sign*k[j],29);j=(j+advance(x))%k.length;return z})}
  /** @param {number[]} data @param {number[]} k @param {number} sign @param {(p:number)=>number} advance @param {number[]} starts @param {number} prev */
  function best(data,k,sign,advance,starts,prev=-1){
    let states=new Map(starts.map(j=>[j*30+prev+1,{j,p:prev,s:0,txt:"",start:j}]));
    for(let i=0;i<data.length;i++){
      const next=new Map();
      const add=(v,j,p)=>{const s=v.s+(v.p<0?0:ll[v.p][p]),id=j*30+p+1;const old=next.get(id);if(!old||s>old.s)next.set(id,{j,p,s,txt:v.txt+String.fromCharCode(65+p),start:v.start})};
      for(const v of states.values()){if(data[i]===0)add(v,v.j,0);const p=mod(data[i]-sign*k[v.j],29);if(p!==0)add(v,(v.j+advance(p))%k.length,p)}
      if(!next.size)return null;states=next;
    }
    let out=null;for(const v of states.values())if(!out||v.s>out.s)out=v;
    return {...out,plain:Array.from(out.txt,x=>x.charCodeAt(0)-65)};
  }
  const out=[];
  for(const [family,k] of keys)for(const [law,advance] of step){
    const allStarts=k.map((_,i)=>i),rows=[];let passed=0;
    for(const sign of [1,-1]){
      const byPhase=allStarts.map(j=>feasible(c,k,sign,advance,[j]));
      const plant57=allStarts.map(j=>feasible(encode(page(57),k,sign,advance,j),k,sign,advance,[j]));
      check(plant57.every(x=>x.failure===null),"positive control");passed+=plant57.length;
      const pages=Array.from({length:7},(_,i)=>feasible(page(16+i),k,sign,advance,allStarts));
      const fit=best(c.slice(0,split),k,sign,advance,allStarts);
      const held=fit?best(c.slice(split),k,sign,advance,[fit.j],fit.p):null;
      rows.push({sign,fullPhases:byPhase.flatMap((x,i)=>x.failure===null?[i]:[]),latestFailure:Math.max(...byPhase.map(x=>x.failure??c.length)),pages:pages.map(x=>x.failure),fit:fit?{start:fit.start,score:fit.s/(split-1),state:fit.j}:null,held:held?{score:held.s/(c.length-split),preview:held.plain.slice(0,24).map(x=>corpus.translit[x]).join("-")}:null});
    }
    const sign=-1,start=k.length-3,planted=encode(donor,k,sign,advance,start);
    const fits=[1,-1].map(s=>({sign:s,v:best(planted.slice(0,split),k,s,advance,allStarts)})).filter(x=>x.v).sort((a,b)=>b.v.s-a.v.s);
    const fit=fits[0],held=best(planted.slice(split),k,fit.sign,advance,[fit.v.j],fit.v.p);
    const control={sign:fit.sign,start:fit.v.start,expectedSign:sign,expectedStart:start,fitCorrect:fit.v.plain.filter((x,i)=>x===donor[i]).length,heldCorrect:held?held.plain.filter((x,i)=>x===donor[split+i]).length:0,fitScore:fit.v.s/(split-1),heldScore:held?.s/(c.length-split)};
    out.push({family,law,period:k.length,plantedFeasibilityPassed:passed,rows,control});
  }
  return {originalLength:c.length,split,donorScore:score(donor),out};
}
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(run(load('resources/liber-primus/lp2-corpus.json'),load('resources/derived/dukotah-r37-lp1-map-runes.json')),null,2));}
module.exports={run};
