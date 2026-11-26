'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(source){
 let state=0x292745;
 const random=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 const mod=(x,p)=>((x%p)+p)%p;
 const inverse=(x,p)=>{for(let a=1;a<p;a++)if(x*a%p===1)return a;throw Error("nonunit")};
 const shuffled=p=>{const a=Array.from({length:p},(_,i)=>i);for(let i=p-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const force=(a,b,p)=>mod(-[...a,...b].reduce((s,x)=>s+x,0)*inverse(b.length,p),p);
 const complete=(a,b,d,p)=>new Set([...a,...b.map(x=>mod(x+d,p))]).size===p;
 const oracle=(a,b,p)=>Array.from({length:p},(_,i)=>i).filter(d=>complete(a,b,d,p));
 const rows=[];
 for(const p of [3,5,7,11,29]){
  let valid=0,planted=0,invalid=0;
  for(let t=0;t<4000;t++){
   const n=1+random(p-1),v=shuffled(p),w=shuffled(p-1).map(x=>x+1),z=shuffled(p-1).map(x=>x+1);
   const a=t%2===0?v.slice(0,n).map(x=>mod(x-v[0],p)):[0,...w.slice(0,n-1)];
   const b=t%2===0?v.slice(n).map(x=>mod(x-v[n],p)):[0,...z.slice(0,p-n-1)];
   const d=force(a,b,p),o=oracle(a,b,p),pred=complete(a,b,d,p)?[d]:[];
   if(JSON.stringify(o)!==JSON.stringify(pred)||t%2===0&&!o.length)throw Error("numeric closure disagreement");
   valid+=!!o.length;invalid+=!o.length;planted+=t%2===0;
  }
  rows.push({p,tested:4000,planted,valid,invalid});
 }
 // Verify the exact symbolic coefficient rule against every k1,k2 in small fields,
 // including affine constants, for arbitrary component offset expressions.
 let symbolic=0;
 for(const p of [3,5,7,11,29]){
  for(let t=0;t<32;t++){
   const n=1+random(p-1),dim=3;
   const gen=m=>Array.from({length:m},(_,i)=>Array.from({length:dim},()=>i===0?0:random(p)));
   const a=gen(n),b=gen(p-n);
   const coef=Array.from({length:dim},(_,j)=>mod(-[...a,...b].reduce((s,x)=>s+x[j],0)*inverse(b.length,p),p));
   for(let k1=0;k1<p;k1++)for(let k2=0;k2<p;k2++){
    const ev=v=>mod(v[0]+k1*v[1]+k2*v[2],p),av=a.map(ev),bv=b.map(ev),d=ev(coef);
    if(d!==force(av,bv,p))throw Error("symbolic coefficient disagreement");
    const o=oracle(av,bv,p);
    if((o.length===1)!==complete(av,bv,d,p)||o.length>1||o.length&&o[0]!==d)throw Error("symbolic completion disagreement");
    symbolic++;
   }
  }
 }
 const groups=source.p54.body_groups;
 if(groups.length!==48||groups.join("").length!==223)throw Error("source profile");
 const alphabet="0123456789abcdefghijklmnopqrs"; const tape=groups.join("").split("").map(c=>alphabet.indexOf(c));
 // Source-shaped graph controls: construct legal edges from actual p54 ciphertext
 // by imposing an independently randomized known pi and q8 key. This is not a
 // fitted plaintext or original family exclusion.
 let reached=0,forbiddenEdges=0,crossEdges=0;
 for(let t=0;t<1000;t++){
  const p=29,pi=shuffled(p);const ip=[];pi.forEach((x,i)=>ip[x]=i);
  const k=[1,...Array.from({length:7},()=>random(p))];
  if(k.slice(0,4).every((v,i)=>v===k[i+4]))k[4]=mod(k[4]+1,p);
  const root=Array.from({length:p},(_,i)=>i),off=Array(p).fill(0);
  let components=p;
  for(const c of tape){
   const j=random(8),a=ip[mod(pi[c]-k[j],p)];if(!a||root[a]===root[c])continue;
   const ra=root[a],rc=root[c],delta=mod(k[j]+off[a]-off[c],p);
   for(let x=0;x<p;x++)if(root[x]===rc){root[x]=ra;off[x]=mod(off[x]+delta,p)}
   components--;
   if(components===2){
    reached++;
    const A=root[0],B=root.find(x=>x!==A),aa=[],bb=[];
    for(let x=0;x<p;x++)(root[x]===A?aa:bb).push(off[x]);
    const d=force(aa,bb,p);
    if(!complete(aa,bb,d,p)||d!==mod(pi[B]-pi[A],p))throw Error("source-shaped merge lost planted map");
    for(let x=0;x<p;x++)for(let y=1;y<p;y++)if(root[x]!==root[y])for(let j=0;j<8;j++){
     crossEdges++;
     if(mod(pi[x]-pi[y],p)!==k[j])forbiddenEdges++;
    }
    break;
   }
  }
 }
 return {numeric:rows,symbolicAssignments:symbolic,sourceShaped:{plants:1000,reachedTwoComponents:reached,crossEdges,forbiddenEdges,meaning:"Exact cross-component relations after closure; known-map controls only, not a measured search speedup or LP2 fit."}};
}
const src=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-page-groups-54-55-derived.json'),'utf8'));
console.log(JSON.stringify(run(src),null,2));
