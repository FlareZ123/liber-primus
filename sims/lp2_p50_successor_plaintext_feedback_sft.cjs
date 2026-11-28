'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,grid){
 const mod=x=>(x%29+29)%29, assert=(b,m)=>{if(!b)throw Error(m)},inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const [c55,c56,p57]=corpus.pages.slice(-3).map(p=>p.indices);assert(c55.length===76&&c56.length===85&&p57.length===95,"physical lengths");
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 let k=0;const p56=c56.map((c,i)=>i===56?0:mod(c-primes[k++]+1));
 k=0;assert(p56.every((p,i)=>p===0?i===56&&c56[i]===0:mod(p+primes[k++]-1)===c56[i])&&k===84,"native control");
 const row=Array.from({length:256},(_,i)=>i);
 const rim=[...Array.from({length:8},(_,i)=>i),...Array.from({length:30},(_,i)=>8*(i+1)+7),...Array.from({length:8},(_,i)=>255-i),...Array.from({length:30},(_,i)=>8*(30-i))];
 const layouts={row,rim:[...rim,...row.filter(i=>!rim.includes(i))]};
 const res=[];
 for(const radix of [59,60]){
  const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  const f=grid.pages.flatMap(p=>p.tokens).map(t=>radix*alpha.indexOf(t[0])+alpha.indexOf(t[1]));assert(f.length===256&&f.every(x=>x>=0&&x<256),"table");
  const lengths=[],done=new Set();for(let i=0;i<256;i++){let j=i;const track=new Map();while(!done.has(j)&&!track.has(j)){track.set(j,track.size);j=f[j]}if(track.has(j))lengths.push(track.size-track.get(j));for(const v of track.keys())done.add(v)}
  const invertible=(a,b)=>lengths.every(L=>{let p=1;for(let i=0;i<L;i++)p=mod(p*(-b*inv(a)));return p!==1});
  function inverse(C,a,b,d){
   const q=mod(-b*inv(a)),v=C.map(c=>mod((c-d)*inv(a))),P=Array(256).fill(null);
   for(let i=0;i<256;i++){if(P[i]!==null)continue;const chain=[],seen=new Map();let j=i;while(P[j]===null&&!seen.has(j)){seen.set(j,chain.length);chain.push(j);j=f[j]}if(P[j]===null){let sum=0,pow=1;for(const t of chain.slice(seen.get(j))){sum=mod(sum+pow*v[t]);pow=mod(pow*q)}P[j]=mod(sum*inv(mod(1-pow)))}for(let t=chain.length-1;t>=0;t--){const x=chain[t];if(P[x]===null)P[x]=mod(v[x]+q*P[f[x]])}}
   assert(P.every((p,i)=>mod(a*p+b*P[f[i]]+d)===C[i]),"round trip");return P;
  }
  function fit(rs){let count=0;const fits=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)if(invertible(a,b))for(let d=0;d<29;d++){count++;if(rs.every(x=>mod(a*x.p+b*x.s+d)===x.c))fits.push([a,b,d])}return {count,fits}}
  function check(rs){const seenP=new Map(),seenC=new Map();let fc=0,ic=0,first=null;for(const x of rs){const u=`${x.s},${x.p}`,v=`${x.s},${x.c}`;if(seenP.has(u)&&seenP.get(u).c!==x.c){fc++;first??={type:"function",a:seenP.get(u),b:x}}if(seenC.has(v)&&seenC.get(v).p!==x.p){ic++;first??={type:"injection",a:seenC.get(v),b:x}}if(!seenP.has(u))seenP.set(u,x);if(!seenC.has(v))seenC.set(v,x)}return {records:rs.length,functionConflicts:fc,injectionConflicts:ic,first}}
  for(const [layout,order] of Object.entries(layouts)){
   const scatter=xs=>{const p=Array(256);order.forEach((x,i)=>p[x]=xs[i]);return p};const pos=Array(256);order.forEach((x,i)=>pos[x]=i);
   const C=scatter([...c55,...c56,...p57]),P=scatter([...Array(76).fill(null),...p56,...p57]);
   const records=(C,P,lo,hi,targetLo,targetHi)=>order.slice(lo,hi).filter(i=>pos[f[i]]>=targetLo&&pos[f[i]]<targetHi).map(i=>({i,j:pos[i],target:f[i],targetJ:pos[f[i]],p:P[i],s:P[f[i]],c:C[i]}));
   const train=records(C,P,76,161,76,161),joint=records(C,P,76,256,76,256);
   const stateRecords=order.slice(76,161).map(i=>{const j=pos[i],target=f[i],targetJ=pos[target],state=targetJ>=76&&targetJ<161?"known:"+P[target]:"address:"+target;return {i,j,target,targetJ,p:P[i],c:C[i],s:state}});
   const p56AllState=check(stateRecords);assert(p56AllState.first,"forced conflict for every external state assignment");
   const fit56=fit(train),fitJoint=fit(joint);
   const truth=scatter([...p57.slice(0,76),...p56,...p57]);let key=[3,2,7];if(!invertible(key[0],key[1]))key=[3,1,7];assert(invertible(key[0],key[1]),"plant invertible");
   const cp=truth.map((p,i)=>mod(key[0]*p+key[1]*truth[f[i]]+key[2]));const plantTrain=records(cp,truth,76,161,76,161),pf=fit(plantTrain);assert(pf.fits.length===1&&pf.fits[0].every((x,i)=>x===key[i]),"blind plant key");
   const recovered=inverse(cp,...pf.fits[0]);const plantHeld=order.filter((i,j)=>j<76||j>=161).filter(i=>recovered[i]===truth[i]).length;assert(plantHeld===171&&!check(plantTrain).first,"plant held");
   const predictions=fit56.fits.map(key=>{const out=inverse(C,...key);return {key,p57Correct:order.slice(161).filter(i=>out[i]===P[i]).length,p56Correct:order.slice(76,161).filter(i=>out[i]===P[i]).length,p55:order.slice(0,76).map(i=>out[i])}});
   res.push({radix,layout,cycleLengths:lengths,train:check(train),p56AllState,joint:check(joint),fit56,fitJoint,predictions,plant:{key,train:plantTrain.length,heldCorrect:plantHeld}});
  }
 }
 return {source:{corpus:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",grid:"2550eae357442912220e05dc51147523a61dd75a"},p56Replay:85,results:res};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
console.log(JSON.stringify(experiment(read('lp2-corpus.json'),read('lp2-grid-256.json')),null,2));
