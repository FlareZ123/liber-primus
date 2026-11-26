'use strict';
// Agent42: distinct nonlinear plaintext-predecessor additive permutation.
// Parallel-frame search adapted from Agent15's escape/log-rank SFT; no word cuts.
// The public IV and F reset are model assumptions, not authenticated LP2 rules.
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,{width=128,count=3,startPlant=0,originalTest=false,refineSweeps=8}={}){
 const gp=JSON.parse(raw[0]),A=29,mod=(x,m=29)=>(x%m+m)%m,assert=(x,m)=>{if(!x)throw Error(m)},alphabet=gp.translit,tokens=alphabet.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1).map(native),train=donors.map(d=>d.slice(0,d.length-16000)),U0=new Float64Array(A).fill(.5),B0=new Float64Array(A*A),T0=new Float64Array(A*A*A),sum=a=>a.reduce((x,y)=>x+y,0);
 for(const p of train)for(let i=0;i<p.length;i++){U0[p[i]]++;if(i)B0[p[i-1]*A+p[i]]++;if(i>1)T0[(p[i-2]*A+p[i-1])*A+p[i]]++;}
 const U=U0.map(x=>x/sum(U0)),B=new Float64Array(A*A),T=new Float64Array(A*A*A);for(let q=0;q<A;q++){const n=sum(B0.subarray(q*A,(q+1)*A));for(let p=0;p<A;p++)B[q*A+p]=(B0[q*A+p]+8*U[p])/(n+8);}
 for(let a=0;a<A;a++)for(let q=0;q<A;q++){const j=(a*A+q)*A,n=sum(T0.subarray(j,j+A));for(let p=0;p<A;p++)T[j+p]=(T0[j+p]+12*B[q*A+p])/(n+12);}
 const L1=U.map(x=>Math.log(A*x)),L2=B.map(x=>Math.log(A*x)),L3=T.map(x=>Math.log(A*x));
 // D = P - K[previous P] modulo 29; K is one shared permutation.
 const rows=Array.from({length:A},(_,k)=>Uint8Array.from({length:A},(_,d)=>mod(d+k)));
 const inv=Array.from({length:A},(_,k)=>Uint8Array.from({length:A},(_,p)=>mod(p-k)));
 // Source-visible chapter frames; chapter carries are retained.
 const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const original=sections.map(([a,b])=>{const pages=gp.pages.filter(p=>p.page>=a&&p.page<=b&&p.indices.length),C=pages.flatMap(p=>p.indices);return {page:a,iv:C[0],d:C.slice(1).map((c,j)=>mod(c-C[j])),parts:pages.map(p=>p.page)}});
 const isTrain=f=>f.page!==0&&f.page!==15;
 assert(original.length===9&&sum(original.map(f=>f.d.length))===12947,"frame geometry");
 for(const f of original){const c=[f.iv];for(const d of f.d)c.push(mod(c.at(-1)+d));assert(c.join()===f.parts.flatMap(p=>gp.pages[p].indices).join(),"source replay");}
 function decode(d,K){let q=0;const P=[];for(const v of d){q=rows[K[q]][v];P.push(q);}return P}
 function encode(P,K){let q=0;return P.map(p=>{const d=inv[K[q]][p];q=p;return d})}
 function score(P){let s=0;for(let j=0;j<P.length;j++)s+=j===0?L1[P[j]]:j===1?L2[P[j-1]*A+P[j]]:L3[(P[j-2]*A+P[j-1])*A+P[j]];return s}
 function solve(frames,width,truth){
  const F=frames.map(f=>f.d),N=F.length,total=sum(F.map(f=>f.length));
  const empty=new Int8Array(A).fill(-1);
  let beam=[{K:empty,mask:0,pos:new Uint16Array(N),q:new Uint8Array(N),prev:new Uint8Array(N),s:0,n:0}],trace=[];
  for(let round=0;round<A;round++){
   const next=[];
   for(const old of beam){
    const occ=new Uint16Array(A);
    for(let i=0;i<N;i++)if(old.pos[i]<F[i].length)occ[old.q[i]]++;
    let z=0;for(let q=1;q<A;q++)if(occ[q]>occ[z])z=q;
    if(!occ[z]){next.push(old);continue;}
    assert(old.K[z]<0,"unassigned frontier");
    for(let k=0;k<A;k++){
     if(old.mask&(1<<k))continue;
     const K=old.K.slice();K[z]=k;
     const pos=old.pos.slice(),q=old.q.slice(),prev=old.prev.slice();
     let s=old.s,n=old.n;
     for(let i=0;i<N;i++){
      const d=F[i];let j=pos[i],b=q[i],a=prev[i];
      while(j<d.length&&K[b]>=0){const p=mod(d[j]+K[b]);s+=j===0?L1[p]:j===1?L2[b*A+p]:L3[(a*A+b)*A+p];j++;n++;a=b;b=p;}
      pos[i]=j;q[i]=b;prev[i]=a;
     }
     next.push({K,mask:old.mask|(1<<k),pos,q,prev,s,n});
    }
   }
   next.sort((a,b)=>b.s-a.s);beam=next.slice(0,width);
   const best=beam[0],matching=truth?beam.filter(x=>x.K.every((k,i)=>k<0||k===truth[i])).length:null;
   trace.push({round:round+1,best:best.s,n:best.n,matching,assigned:best.K.filter(k=>k>=0).length});
   if(beam.every(x=>x.n===total))break;
  }
  assert(beam[0].n===total,"incomplete beam");
  const K=Array.from(beam[0].K),unused=Array.from({length:A},(_,i)=>i).filter(k=>!K.includes(k));
  for(let q=0;q<A;q++)if(K[q]<0)K[q]=unused.shift();
  assert(new Set(K).size===A,"bijection");
  return {K,trace};
 }
 function refine(frames,init,{sweeps=8}={}){
  const F=frames.map(f=>f.d),K=init.slice(),N=sum(F.map(d=>d.length));let evals=0;
  function value(){let s=0;evals++;for(const d of F){let a=0,b=0;for(let j=0;j<d.length;j++){const p=mod(d[j]+K[b]);s+=j===0?L1[p]:j===1?L2[b*A+p]:L3[(a*A+b)*A+p];a=b;b=p;}}return s;}
  let best=value(),history=[];
  for(let t=0;t<sweeps;t++){
   let improved=0;
   for(let a=0;a<A;a++)for(let b=a+1;b<A;b++){
    [K[a],K[b]]=[K[b],K[a]];const v=value();
    if(v>best+1e-9){best=v;improved++}else [K[a],K[b]]=[K[b],K[a]];
   }
   history.push({sweep:t+1,score:best/N,improved,evals});
   if(!improved)break;
  }
  return {K,history,score:best/N};
 }
 let seed=0x42a3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function key(){
  // Calibrate with genuine low-repeat plants, selecting keys using training
  // bigrams alone; the withheld source-native donor text is never consulted.
  const K=Array.from({length:A},(_,q)=>q);
  for(let i=A-1;i>0;i--){const j=rng()%(i+1);[K[i],K[j]]=[K[j],K[i]]}
  const target=.00664,cost=(q,p)=>U[q]*B[q*A+p];
  let rate=sum(K.map((p,q)=>cost(q,p)));
  for(let it=0;it<20000&&Math.abs(rate-target)>.00001;it++){
   const a=rng()%A,b=rng()%A;
   const nr=rate-cost(a,K[a])-cost(b,K[b])+cost(a,K[b])+cost(b,K[a]);
   if(a!==b&&Math.abs(nr-target)<Math.abs(rate-target)){[K[a],K[b]]=[K[b],K[a]];rate=nr;}
  }
  assert(new Set(K).size===A,"plant permutation");
  return K;
 }
 function plant(donor,K){let pos=donor.length-16000;return original.map(f=>{const P=donor.slice(pos,pos+f.d.length);pos+=P.length;assert(P.length===f.d.length,"donor length");return {page:f.page,iv:f.iv,P,d:encode(P,K)}})}
 function evaluate(frames,truth){const r=solve(frames.filter(isTrain),width,truth),initial=r.K.slice(),opt=refine(frames.filter(isTrain),r.K,{sweeps:refineSweeps});r.K=opt.K;
  function evalpart(F){let n=0,s=0,correct=0,repeats=0,used=new Set();for(const f of F){const P=decode(f.d,r.K);assert(encode(P,r.K).join()===f.d.join(),"replay");n+=P.length;s+=score(P);repeats+=f.d.filter(x=>!x).length;if(f.P){correct+=P.filter((p,i)=>p===f.P[i]).length;used.add(0);for(let i=0;i<f.P.length-1;i++)used.add(f.P[i]);}}return {n,repeats,gain:s/n,correct:F[0].P?correct:null,usedRows:truth?used.size:null,keyRows:truth?[...used].filter(q=>truth[q]===r.K[q]).length:null,preview:F.slice(0,2).map(f=>decode(f.d,r.K).slice(0,80).map(p=>alphabet[p]).join(""))}}
  return {key:r.K,initial,refinement:opt.history,truth,train:evalpart(frames.filter(isTrain)),held:evalpart(frames.filter(f=>!isTrain(f))),trace:r.trace}
 }
 const pilots=[];for(let i=0;i<count;i++){const K=key();if(i>=startPlant)pilots.push(evaluate(plant(donors[i%3],K),K))}
 // Do not score original data unless all three unseen native plants meet the
 // predeclared 95% holdout rune accuracy and have repeat rates below 1.2%.
 const eligible=pilots.length===3&&pilots.every(p=>p.held.correct/p.held.n>=.95&&(p.train.repeats+p.held.repeats)/(p.train.n+p.held.n)<.012);
 let negative=null,unknown=null;
 if(eligible&&originalTest){
   const randomFrames=original.map(f=>({...f,d:f.d.map(()=>rng()%A)}));
   negative=evaluate(randomFrames,null);
   // Require a positive heldout gain on unknown text; a mere best score or
   // exact round-trip does not support a plaintext claim.
   unknown=evaluate(original,null);
 }
 return {width,donorLengths:donors.map(d=>d.length),eligible,pilots,negative,original:unknown};
}
if(require.main===module)console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),{width:128,count:3,originalTest:true}),null,2));
module.exports={experiment,INPUTS};
