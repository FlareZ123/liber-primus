'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,donorTexts){
  const M=29,N=3008,Q=3301,assert=(x,m)=>{if(!x)throw Error(m)};
  const C=Uint8Array.from(corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices));assert(C.length===N,"chapter frame");
  const units=[1,3,5,9,11,13,15,17,19,23,25,27];
  function pow(x,e){let z=1;while(e){if(e&1)z=z*x%29;x=x*x%29;e>>=1;}return z;}
  function inv(e){return units.find(d=>e*d%28===1);}
  const seen=new Set(),classes=[];
  for(let x=0;x<29;x++){if(seen.has(x))continue;const cls=[...new Set(units.map(e=>pow(x,e)))];for(const z of cls)seen.add(z);const keys=new Map(),groups=[];for(let j=0;j<12;j++){const t=pow(x,units[j]);if(!keys.has(t)){keys.set(t,groups.length);groups.push([]);}groups[keys.get(t)].push(j);}classes.push({size:cls.length,cls,groups});}
  assert(classes.map(c=>c.size).sort((a,b)=>a-b).join(",")==="1,1,1,2,6,6,12","order orbits");
  const bySize=new Map();for(const c of classes){if(bySize.has(c.size)){const g=c.groups.map(a=>a.join(",")).sort().join(";"),h=bySize.get(c.size).groups.map(a=>a.join(",")).sort().join(";");assert(g===h,"equal-size coset partition");}else bySize.set(c.size,c);}
  const sizes=[2,6,12],groups=sizes.map(n=>bySize.get(n).groups);
  for(const g of groups){const partition=g.map(a=>a.join(",")).sort().join(";");const invPart=g.map(a=>a.map(i=>units.indexOf(inv(units[i]))).sort((a,b)=>a-b).join(",")).sort().join(";");assert(partition===invPart,"inverse exponent cosets");}
  const sieve=new Uint8Array(150001),primes=[];for(let p=2;p<sieve.length&&primes.length<N+Q;p++)if(!sieve[p]){const k=units.indexOf(p%28);if(k!==-1)primes.push(k);if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1;}
  assert(primes.length>=N+Q,"clock");
  const stream=Uint8Array.from(primes);
  const DIG=["TH","EO","NG","OE","AE","IA","EA"],tokenMap=new Map(corpus.translit.map((x,i)=>[x,i]));
  function gpText(t){const out=[];for(const w of t.match(/[A-Za-z]+/g)||[]){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/[KV]/g,"C").replace(/Z/g,"S");for(let i=0;i<s.length;){const ing=s.startsWith("ING",i),token=ing?"NG":DIG.find(d=>s.startsWith(d,i))||s[i];assert(tokenMap.has(token),"GP token");out.push(tokenMap.get(token));i+=ing?3:token.length;}}return out;}
  const donors=donorTexts.map(gpText);
  function top2(a){let f=new Int32Array(29);for(const x of a)f[x]++;return top2Counts(f);}
  function top2Counts(f){let a=0,b=0;for(const v of f)if(v>=a){b=a;a=v;}else if(v>b)b=v;return a+b;}
  function donorFloor(t){let f=new Int32Array(29);for(let i=0;i<N;i++)f[t[i]]++;let floor=top2Counts(f),argmin=0;for(let i=N;i<t.length;i++){f[t[i-N]]--;f[t[i]]++;const z=top2Counts(f);if(z<floor){floor=z;argmin=i-N+1;}}return {length:t.length,windows:t.length-N+1,floor,argmin};}
  const reference=donors.map(donorFloor),floor=Math.min(...reference.map(x=>x.floor));
  // All rows partition by order-orbit. Each class of size k can receive exactly k cipher labels.
  // One target gets one coset; two targets in its class get at most two distinct cosets.
  function phaseLists(tape,c0){
    const a=Array.from({length:29},()=>[]);let j=0,held=0;
    for(const c of tape){if(c===c0){held++;continue;}a[c].push(j++);}
    return {a:a.map(x=>Uint16Array.from(x)),held};
  }
  function boundMaker(tape,c0){
    const {a,held}=phaseLists(tape,c0),f=new Uint16Array(29*12);
    const single=sizes.map(()=>new Uint16Array(29)),pair=sizes.map(()=>new Uint16Array(29));
    const counts=a.map(x=>x.length),singleMax=Math.max(...counts);
    function sumTop(arr,k){arr.sort();let z=0;for(let i=arr.length-k;i<arr.length;i++)z+=arr[i];return z;}
    return function(origin){
      f.fill(0);
      for(let c=0;c<29;c++){const pos=a[c],base=c*12;for(let i=0;i<pos.length;i++)f[base+stream[origin+pos[i]]]++;}
      for(let s=0;s<3;s++){
        const g=groups[s],s1=single[s],s2=pair[s];
        for(let c=0;c<29;c++){const b=c*12;let first=0,second=0;
          for(let i=0;i<g.length;i++){let v=0;const grp=g[i];for(let j=0;j<grp.length;j++)v+=f[b+grp[j]];if(v>=first){second=first;first=v;}else if(v>second)second=v;}
          s1[c]=first;s2[c]=first+second;
        }
      }
      const S=sizes.map((k,i)=>sumTop(single[i],k)),T=sizes.map((k,i)=>sumTop(pair[i],k));
      const singles=[c0===-1?singleMax:held,singleMax,singleMax,S[0],S[1],S[1],S[2]];
      const distinct=top2Counts(singles);
      return {bound:Math.max(distinct,...T),distinct,sameOrbit:T,singleOrbit:S};
    };
  }
  // Distinct-class capacities deliberately relax disjoint label allocation.
  const original=[];
  for(const hold of [false,true]){
    let best={bound:-1},min=Infinity,survivors=0,total=0;const perHeldLabel=[];
    for(const c0 of hold?Array.from({length:29},(_,i)=>i):[-1]){
      const bound=boundMaker(C,c0);let rowMax={bound:-1};for(let origin=0;origin<Q;origin++){
        const z=bound(origin);total++;if(z.bound>=floor)survivors++;min=Math.min(min,z.bound);if(z.bound>rowMax.bound)rowMax={origin,c0,...z};if(z.bound>best.bound)best={origin,c0,...z};}
      perHeldLabel.push(rowMax);
    }
    original.push({hold,originCount:Q,total,minimumBound:min,survivors,best,perHeldLabel});
  }
  let state=0x330129;const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
  function perm(){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rng()%(i+1);[p[i],p[j]]=[p[j],p[i]];}return p;}
  const controls=[];
  for(let k=0;k<4;k++){const hold=(k&1)!==0,reverse=(k&2)!==0,origin=[0,777,1234,3300][k],A=perm(),B=perm(),P=donors[k%3].slice(14000+k*1000,14000+k*1000+N),ct=[];let j=origin;
    for(const p of P){const z=A[p],e=units[stream[j]];ct.push(B[pow(z,reverse?inv(e):e)]);if(!hold||z!==0)j++;}
    const truth=top2(P),c0=hold?B[0]:-1,r=boundMaker(ct,c0)(origin);assert(r.bound>=truth,"arbitrary map planted cap");controls.push({hold,reverse,origin,c0,truth,...r});
  }
  return {chapter:"p40-53",N,Q,classes:classes.map(c=>({size:c.size,elements:c.cls,exponentCosets:c.groups.map(g=>g.map(i=>units[i]))})),reference,floor,referenceWindows:reference.reduce((s,r)=>s+r.windows,0),original,controls,decision:original.every(r=>r.survivors===0)?"Exclude this unit-prime power receiver with arbitrary fixed chapter-private input/output permutations, any origin 0..3300 and either clock/exponent direction, relative to the frozen contiguous native reference concentration floor.":"Some relaxed bound states survive; no all-origin exclusion."};
}
const root=path.resolve(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const f=files.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(f[0]),f.slice(1)),null,2));
