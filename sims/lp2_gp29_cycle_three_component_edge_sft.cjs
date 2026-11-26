'use strict';
const fs=require('node:fs');
const path=require('node:path');
function three(source){
 let state=0x272245;
 const rnd=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 const mod=(x,p)=>((x%p)+p)%p;
 const inv=(n,p)=>{for(let v=1;v<p;v++)if(v*n%p===1)return v;throw Error("zero")};
 const shuffle=p=>{const a=Array.from({length:p},(_,i)=>i);for(let i=p-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const add=(a,b,p)=>a.map(x=>mod(x+b,p));
 const disjoint=(a,b)=>!a.some(x=>b.includes(x));
 const complete=(a,b,c,p)=>new Set([...a,...b,...c]).size===p;
 let exact=0,localPass=0,extraReject=0;
 for(const p of [3,5,7,11,29]){
  for(let t=0;t<600;t++){
   const n=1+rnd(p-2),m=1+rnd(p-n-1),l=p-n-m;
   const A=[0,...shuffle(p-1).slice(0,n-1).map(x=>x+1)];
   const B=[0,...shuffle(p-1).slice(0,m-1).map(x=>x+1)];
   const C=[0,...shuffle(p-1).slice(0,l-1).map(x=>x+1)];
   const sum=[...A,...B,...C].reduce((x,y)=>x+y,0);
   for(let d=0;d<p;d++){
    const bb=add(B,d,p),e=mod(-(sum+m*d)*inv(l,p),p),cc=add(C,e,p);
    const local=disjoint(A,bb),pred=complete(A,bb,cc,p);
    const truth=Array.from({length:p},(_,i)=>i).filter(x=>complete(A,bb,add(C,x,p),p));
    if(truth.length>1||pred!==!!truth.length||pred&&truth[0]!==e)throw Error("3-component oracle disagreement");
    exact++;localPass+=local;extraReject+=local&&!pred;
   }
  }
 }
 const tape=source.p54.body_groups.join("").split("").map(c=>"0123456789abcdefghijklmnopqrs".indexOf(c));
 const N=29,Q=8;
 let reached=0,edges=0,oldPass=0,newPass=0,truth=0;
 for(let t=0;t<1000;t++){
  const pi=shuffle(N),ip=[];pi.forEach((v,i)=>ip[v]=i);
  const k=[1,...Array.from({length:7},()=>rnd(N))];
  const root=Array.from({length:N},(_,i)=>i),off=Array(N).fill(0);let comps=N;
  for(const c of tape){
   const j=rnd(Q),a=ip[mod(pi[c]-k[j],N)];if(!a||root[c]===root[a])continue;
   const ra=root[a],rc=root[c],delta=mod(k[j]+off[a]-off[c],N);
   for(let x=0;x<N;x++)if(root[x]===rc){root[x]=ra;off[x]=mod(off[x]+delta,N);}
   if(--comps!==3)continue;
   reached++;
   const map=new Map();for(let x=0;x<N;x++){if(!map.has(root[x]))map.set(root[x],[]);map.get(root[x]).push(off[x]);}
   const sum=off.reduce((a,b)=>a+b,0);
   const rules=new Map();
   // The old filter tests only the two components joined by this edge.
   // The proposed filter also checks the third component at its forced translation.
   for(const [A,av] of map)for(const [B,bv] of map)if(A!==B){
    const [C,cv]=[...map].find(([r])=>r!==A&&r!==B);
    const flags=[];
    for(let d=0;d<N;d++){
     const e=mod(-(sum+bv.length*d)*inv(cv.length,N),N),bb=add(bv,d,N),cc=add(cv,e,N);
     flags[d]=[disjoint(av,bb),complete(av,bb,cc,N)];
    }
    rules.set(A*N+B,flags);
   }
   for(let x=0;x<N;x++)for(let y=1;y<N;y++)if(root[x]!==root[y])for(let j=0;j<Q;j++){
    const d=mod(off[y]+k[j]-off[x],N),[local,global]=rules.get(root[y]*N+root[x])[d];
    const actual=mod(pi[x]-pi[y],N)===k[j];
    if(actual&&!global)throw Error("true edge removed");
    edges++;oldPass+=local;newPass+=global;truth+=actual;
   }
   break;
  }
 }
 return {exactNumericOracle:{cases:exact,locallyCompatible:localPass,additionalRejections:extraReject},sourceShapedConcrete:{plants:1000,reached,edges,oldPass,newPass,truth,additionalRejections:oldPass-newPass,scope:"Known complete key coordinates, not symbolic unknown-key search timing."}};
}
console.log(JSON.stringify(three(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-page-groups-54-55-derived.json'),'utf8'))),null,2));
