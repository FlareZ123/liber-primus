'use strict';
// Agent42: continuous-chapter EM initialization for nonlinear additive permutation.
// Soft row weights are projected heuristically; Hungarian hardening is exact.
// Parallel-frame search adapted from Agent15's escape/log-rank SFT; no word cuts.
// The public IV and F reset are model assumptions, not authenticated LP2 rules.
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,{width=128,count=3,startPlant=0,originalTest=false,refineSweeps=8,externalPilots=[],target='both'}={}){
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
 // Hungarian hardening: minimum cost assignment of q to k.
 function assignment(W){
  const u=new Float64Array(A+1),v=new Float64Array(A+1),match=new Int32Array(A+1),way=new Int32Array(A+1);
  for(let i=1;i<=A;i++){
   match[0]=i;let j0=0;const min=new Float64Array(A+1).fill(Infinity),used=new Uint8Array(A+1);
   do{used[j0]=1;const i0=match[j0];let delta=Infinity,j1=0;
    for(let j=1;j<=A;j++)if(!used[j]){const cur=-Math.log(Math.max(W[(i0-1)*A+j-1],1e-300))-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}
    for(let j=0;j<=A;j++){if(used[j]){u[match[j]]+=delta;v[j]-=delta}else min[j]-=delta}
    j0=j1;
   }while(match[j0]);
   do{const j1=way[j0];match[j0]=match[j1];j0=j1}while(j0);
  }
  const K=new Array(A);for(let j=1;j<=A;j++)K[match[j]-1]=j-1;assert(new Set(K).size===A,"assignment");return K;
 }
 function sinkhorn(W,steps=40){
  for(let it=0;it<steps;it++){
   for(let q=0;q<A;q++){let z=0;for(let k=0;k<A;k++)z+=W[q*A+k];for(let k=0;k<A;k++)W[q*A+k]/=z}
   for(let k=0;k<A;k++){let z=0;for(let q=0;q<A;q++)z+=W[q*A+k];for(let q=0;q<A;q++)W[q*A+k]/=z}
  }
  // Row-normalized emission distribution is required by forward-backward.
  for(let q=0;q<A;q++){let z=0;for(let k=0;k<A;k++)z+=W[q*A+k];for(let k=0;k<A;k++)W[q*A+k]/=z}
  return W;
 }
 const cost=Float64Array.from({length:A*A},(_,i)=>U[Math.floor(i/A)]*B[i]);
 function initPrior(){
  let lo=0,hi=1;
  const at=lambda=>sinkhorn(Float64Array.from(cost,x=>Math.exp(-Math.min(650,lambda*x))));
  const rate=W=>sum(W.map((w,i)=>w*cost[i]));
  while(rate(at(hi))>.00664&&hi<1e7)hi*=2;
  for(let i=0;i<30;i++){const m=(lo+hi)/2;if(rate(at(m))>.00664)lo=m;else hi=m}
  return at((lo+hi)/2);
 }
 const prior=initPrior();
 const W0=prior.map(w=>Math.max(w,1e-8));
 const iterations=60,starts=2;
 function solve(frames,width,truth){
  const N=sum(frames.map(f=>f.d.length)),runs=[];
  for(let start=0;start<starts;start++){
   let W=sinkhorn(W0.map(w=>w*(.25+rng()/4294967296)));
   const history=[];
   let bestK=null,best=-Infinity;
   for(let it=0;it<iterations;it++){
    const M=new Float64Array(A*A*A),C=new Float64Array(A*A);
    for(let d=0;d<A;d++)for(let q=0;q<A;q++)for(let p=0;p<A;p++)M[(d*A+q)*A+p]=B[q*A+p]*W[q*A+mod(p-d)];
    let ll=0;
    for(const f of frames){
     const d=f.d,alpha=new Float64Array((d.length+1)*A),scale=new Float64Array(d.length);alpha[0]=1;
     for(let i=0;i<d.length;i++){
      const off=i*A,nxt=off+A,base=d[i]*A*A;
      if(i===0){for(let p=0;p<A;p++)alpha[nxt+p]=U[p]*W[mod(p-d[i])]}
      else for(let q=0;q<A;q++){const a=alpha[off+q],b=base+q*A;for(let p=0;p<A;p++)alpha[nxt+p]+=a*M[b+p]}
      let z=0;for(let p=0;p<A;p++)z+=alpha[nxt+p];assert(z>0,"scale");ll+=Math.log(z);scale[i]=z;for(let p=0;p<A;p++)alpha[nxt+p]/=z;
     }
     let beta=new Float64Array(A).fill(1),tmp=new Float64Array(A);
     for(let i=d.length-1;i>=0;i--){
      const base=d[i]*A*A,off=i*A,sc=scale[i],di=d[i];
      if(i===0){for(let p=0;p<A;p++){const k=mod(p-di);C[k]+=U[p]*W[k]*beta[p]/sc}continue}
      for(let q=0;q<A;q++){const b=base+q*A,a=alpha[off+q]/sc;let z=0;for(let p=0;p<A;p++){const h=M[b+p]*beta[p];z+=h;C[q*A+mod(p-di)]+=a*h}tmp[q]=z/sc}
      const t=beta;beta=tmp;tmp=t;
     }
    }
    W=sinkhorn(C.map((x,i)=>Math.pow(x+.02*W0[i],it>=iterations/2?1.15:1)));
    if(it%5===4){
     const K=assignment(W);let hard=0;for(const f of frames)hard+=score(decode(f.d,K));
     history.push({iteration:it+1,softLL:ll/N,hardGain:hard/N,keyRows:truth?K.filter((k,q)=>k===truth[q]).length:null});
     if(hard>best){best=hard;bestK=K}
    }
   }
   runs.push({K:bestK,score:best/N,history});
  }
  runs.sort((a,b)=>b.score-a.score);
  return {K:runs[0].K,trace:runs.map(({K,score,history})=>({K,score,history}))};
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
 let seed=0x42b3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
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
 const gate=externalPilots.length?externalPilots:pilots;
 const eligible=gate.length===3&&gate.every(p=>p.held.correct/p.held.n>=.95&&(p.train.repeats+p.held.repeats)/(p.train.n+p.held.n)<.012);
 let negative=null,unknown=null;
 if(eligible&&originalTest){
   // Separate execution is needed for the connected runtime's per-call budget.
   // Fix the inference seed independently of whether the controls ran together.
   if(target==='both'||target==='matched-null'){
    seed=0x42c3301;
    const n=sum(original.map(f=>f.d.length)),repeats=sum(original.map(f=>f.d.filter(d=>d===0).length));
    const ds=Array.from({length:n},(_,i)=>i<repeats?0:1+rng()%28);
    for(let i=n-1;i>0;i--){const j=rng()%(i+1);[ds[i],ds[j]]=[ds[j],ds[i]]}
    let off=0;const randomFrames=original.map(f=>{const d=ds.slice(off,off+f.d.length);off+=f.d.length;return {...f,d}});
    negative=evaluate(randomFrames,null);
   }
   if(target==='both'||target==='original'){seed=0x42d3301;unknown=evaluate(original,null)}
 }
 return {width,donorLengths:donors.map(d=>d.length),eligible,pilots,negative,original:unknown};
}
if(require.main===module){
 const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
 const arg=process.argv.find(x=>x.startsWith('--plant='));
 const target=process.argv.includes('--original')?'original':process.argv.includes('--matched-null')?'matched-null':null;
 const controls=['gibran','shakespeare','emerson'].map(x=>'im-results/lp2-gp29-plainprev-shift-permutation-chapter-em-'+x+'.json');
 const opts=target?{count:0,originalTest:true,target,externalPilots:controls.map(p=>JSON.parse(read(p)).pilots[0])}:arg?{count:1+Number(arg.slice(8)),startPlant:Number(arg.slice(8)),originalTest:false}:{count:3,originalTest:true};
 console.log(JSON.stringify(experiment(INPUTS.map(read),opts),null,2));
}
module.exports={experiment,INPUTS};
