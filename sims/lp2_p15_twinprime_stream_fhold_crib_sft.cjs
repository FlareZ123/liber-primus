'use strict';
const fs = require('node:fs');
const path = require('node:path');

function experiment(c){
  const mod=n=>((n%29)+29)%29;
  function primes(limit){const a=new Uint8Array(limit+1);const p=[];for(let i=2;i<=limit;i++)if(!a[i]){p.push(i);if(i*i<=limit)for(let j=i*i;j<=limit;j+=i)a[j]=1;}return p;}
  const ps=primes(1000000);
  const pairs=ps.slice(0,-1).map((p,i)=>[p,ps[i+1]]).filter(([p,q])=>q-p===2);
  const modes={
    lower:a=>a.map(([p])=>mod(p-1)),
    upper:a=>a.map(([,q])=>mod(q-1)),
    interleave:a=>a.flatMap(([p,q])=>[mod(p-1),mod(q-1)]),
    semiprimeTotient:a=>a.map(([p,q])=>mod((p-1)*(q-1)))
  };
  // Every state is a possible number of consumed key values. A decoded F
  // is forbidden on the ordinary branch; literal F emits zero and holds.
  function reach(cipher,key){let states=new Set([0]),max=1;for(let i=0;i<cipher.length;i++){const next=new Set();for(const k of states){if(k>=key.length)throw Error("key exhausted");if(cipher[i]===0)next.add(k);if(cipher[i]!==key[k])next.add(k+1);}if(!next.size)return {survived:i,terminal:[],max};states=next;max=Math.max(max,states.size);}return {survived:cipher.length,terminal:[...states].sort((a,b)=>a-b),max};}
  function encrypt(plain,key){let k=0;return {cipher:plain.map(p=>p===0?0:mod(p+key[k++])),consumed:k};}
  const p15=c.pages.find(p=>p.page===15).indices;
  const next=c.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
  if(p15.length!==159||next.length!==1744||p15.slice(0,9).join()!=="0,1,20,19,24,28,26,22,24")throw Error("original input mismatch");
  const original=[["p15-black-through-p22",p15.slice(20).concat(next)],["p16-through-p22",next]];
  const native=c.pages.find(p=>p.page===57).indices;
  if(native.length!==95)throw Error("p57 input mismatch");
  const nativeLong=Array.from({length:20},()=>native).flat();
  const control56=reach(c.pages.find(p=>p.page===56).indices,ps.map(p=>mod(p-1)));
  if(!control56.terminal.includes(84))throw Error("p56 known control");
  const tests=[];
  for(const start of [3,461,3299]){const ix=pairs.findIndex(([p])=>p===start);if(ix<0)throw Error("source twin");for(const [mode,fn] of Object.entries(modes)){const key=fn(pairs.slice(ix));if(key.length<2000)throw Error("too short");const plant=encrypt(nativeLong,key);const ctl=reach(plant.cipher,key);if(!ctl.terminal.includes(plant.consumed))throw Error("native path lost");const results=original.map(([name,input])=>({name,n:input.length,...reach(input,key)}));tests.push({start,mode,keyPrefix:key.slice(0,12),nativeN:nativeLong.length,nativeConsumed:plant.consumed,nativeTerminalStates:ctl.terminal.length,results});}}
  // Independent exact conditional crib. No original data selects the
  // stream origin: every full nine-symbol window up to 1,000,000 is tested.
  const crib=[16,7,10,9,13,4,10,19,18]; 
  const implied=p15.slice(0,9).map((x,i)=>mod(x-crib[i]));
  function scan(key,pattern){let best=-1,top=0,hits=[];for(let i=0;i+pattern.length<=key.length;i++){let s=0;for(let j=0;j<pattern.length;j++)if(key[i+j]===pattern[j])s++;if(s>best){best=s;top=1;}else if(s===best)top++;if(s===pattern.length)hits.push(i);}return {windows:key.length-pattern.length+1,best,top,hits};}
  const cribResults=[];
  for(const [mode,fn] of Object.entries(modes)){
    const key=fn(pairs);const plantedOffset=117;const positive=scan(key,key.slice(plantedOffset,plantedOffset+9));
    if(!positive.hits.includes(plantedOffset))throw Error("crib plant lost");
    cribResults.push({mode,...scan(key,implied),plantExactMatches:positive.hits.length});
  }
  const squares=new Set(Array.from({length:29},(_,i)=>mod(i*i)));
  return {pairs:pairs.length,control56,tests,implied,cribResults,totientImpossible:implied.map((v,i)=>[i,v,mod(v+1)]).filter(x=>!squares.has(x[2])),interleavedPairDifferences:[0,1].map(phase=>implied.slice(phase).filter((_,i)=>i%2===0).slice(0,4).map((_,j)=>mod(implied[phase+2*j+1]-implied[phase+2*j])))};
}

const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(experiment(corpus),null,2));
