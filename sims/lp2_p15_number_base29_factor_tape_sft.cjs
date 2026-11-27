'use strict';
/** Retrospective historical NUMBER distinct factor tape and BASE29 transfer. */
function run(corpus,native){
  const check=(condition,message)=>{if(!condition)throw new Error(message)};
  const mod=x=>(x%29+29)%29;
  const factor=n=>{const out=[];for(let p=2;p*p<=n;p++){if(n%p===0){out.push(p);while(n%p===0)n/=p;}}if(n>1)out.push(n);return out};
  const isPrime=n=>n>1&&factor(n).length===1&&factor(n)[0]===n;
  const number=n=>{const v=isPrime(n)?Number(String(n).split("").reverse().join("")):n;return isPrime(n)&&isPrime(v)?[]:factor(v)};
  const digits=n=>{const out=[];do{out.unshift(n%29);n=Math.floor(n/29)}while(n);return out};
  const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
  const lists=spiral.map(number),factors=lists.flat();
  check(lists[0].length===0&&lists.slice(1).every(x=>x.length>0),"only red cell returns +");
  const families=[["NUMBER factors modulo29",factors.map(mod)],["NUMBER factor totients modulo29",factors.map(x=>mod(x-1))],["NUMBER factors BASE29 digits",factors.flatMap(digits)]];
  check(factors.length===44&&families[2][1].length===59,"source stream lengths");
  /** @param {number[]} c @param {number[]} k @param {number} sign @param {number} phase */
  function feasible(c,k,sign,phase){
    let active=new Set([phase]);
    for(let i=0;i<c.length;i++){
      const next=new Set();
      for(const j of active){
        if(c[i]===0)next.add(j);
        if(mod(c[i]-sign*k[j])!==0)next.add((j+1)%k.length);
      }
      if(!next.size)return {failure:i,ends:[]};
      active=next;
    }
    return {failure:null,ends:[...active].sort((a,b)=>a-b)};
  }
  /** @param {number[]} p @param {number[]} k @param {number} sign @param {number} phase @param {boolean} hold */
  function encode(p,k,sign,phase,hold){let j=phase;return p.map(x=>{if(hold&&x===0)return 0;const c=mod(x+sign*k[j]);j=(j+1)%k.length;return c})}
  const page=n=>corpus.pages.find(p=>p.page===n).indices;
  const pp=Array.from({length:7},(_,i)=>page(16+i));const all=pp.flat();
  check(all.length===1744&&page(15).length===159,"original sizes");
  const p57=page(57);check(p57.length===95,"p57 length");
  const primes=[];for(let i=2;primes.length<85;i++)if(isPrime(i))primes.push(i);
  const primeK=primes.map(x=>mod(x-1));const p56=page(56);let j=0;
  const p56Plain=p56.map((c,i)=>{if(i===56){check(c===0,"known hold");return 0}const p=mod(c-primeK[j++]);check(p!==0,"native consumed F contradiction");return p});
  check(j===84&&encode(p56Plain,primeK,1,0,true).every((c,i)=>c===p56[i]),"native p56 replay");
  const split=pp.slice(0,4).flat().length;
  const train=native.key.slice(0,1000);
  const donor=native.key.slice(1000,1000+all.length);
  check(donor.length===all.length,"native control length");
  const n=Array(29).fill(0),b=Array.from({length:29},()=>Array(29).fill(0));
  for(let i=1;i<train.length;i++){n[train[i-1]]++;b[train[i-1]][train[i]]++}
  const score=p=>{let s=0;for(let i=1;i<p.length;i++)s+=Math.log((b[p[i-1]][p[i]]+0.5)/(n[p[i-1]]+14.5));return s/(p.length-1)};
  const result=[];
  for(const [name,k] of families){
    const cases=[],pageCases=pp.map(()=>({survives:0,maxFailure:-1}));let control=0;
    for(const sign of [1,-1])for(let phase=0;phase<k.length;phase++){
      const a=feasible(all,k,sign,phase);const plant=encode(p57,k,sign,phase,true);
      check(feasible(plant,k,sign,phase).failure===null,"positive F control");
      control++;
      for(let i=0;i<pp.length;i++){const z=feasible(pp[i],k,sign,phase);if(z.failure===null)pageCases[i].survives++;else pageCases[i].maxFailure=Math.max(pageCases[i].maxFailure,z.failure)}
      const plain=all.map((c,i)=>mod(c-sign*k[(phase+i)%k.length]));
      cases.push({sign,phase,feasible:a.failure===null,failure:a.failure,ends:a.ends,ordinaryFit:score(plain.slice(0,split)),ordinaryHeld:score(plain.slice(split)),preview:plain.slice(split,split+24).map(x=>corpus.translit[x]).join("-")});
    }
    const ordered=cases.slice().sort((a,b)=>b.ordinaryFit-a.ordinaryFit);
    const phase=(k.length-3),sign=-1,plant=encode(donor,k,sign,phase,false);
    const plantCases=[];for(const s of [1,-1])for(let p=0;p<k.length;p++){const decoded=plant.map((c,i)=>mod(c-s*k[(p+i)%k.length]));plantCases.push({sign:s,phase:p,fit:score(decoded.slice(0,split)),held:score(decoded.slice(split)),correct:decoded.every((x,i)=>x===donor[i])})}
    plantCases.sort((a,b)=>b.fit-a.fit);
    result.push({name,period:k.length,key:k,caseCount:cases.length,controlsPassed:control,fullSurvivors:cases.filter(x=>x.feasible),maxFailure:Math.max(...cases.filter(x=>!x.feasible).map(x=>x.failure)),pageCases,ordinaryBestFit:ordered[0],ordinaryOracleHeld:Math.max(...cases.map(x=>x.ordinaryHeld)),ordinaryHiddenControl:plantCases[0],cases});
  }
  return {spiral,NUMBER:lists,factorCount:factors.length,sourceLength:all.length,fitRunes:split,heldRunes:all.length-split,p56NativeReplay:{runes:p56.length,consumed:j,plain:p56Plain.map(x=>corpus.translit[x]).join("-")},nativeReference:{training:train.length,donor:donor.length,fit:score(donor.slice(0,split)),held:score(donor.slice(split))},families:result};
}
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(run(load('resources/liber-primus/lp2-corpus.json'),load('resources/derived/dukotah-r37-lp1-map-runes.json')),null,2));}
module.exports={run};
