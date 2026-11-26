'use strict';
// Agent42: literal-F-held nonlinear additive permutation pilot (native F does not update q).
// Soft row weights are projected heuristically; Hungarian hardening is exact.
// Parallel-frame search adapted from Agent15's escape/log-rank SFT; no word cuts.
// The public IV and F reset are model assumptions, not authenticated LP2 rules.
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,{count=1,startPlant=0,iterations=40,starts=1,externalPilots=[],originalTest=false}={}){
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
 // Physical pages, with authentic literal plaintext-F bypass of key state.
 // The previous physical ciphertext is public and may change on an F hold.
 // q is the previous *consuming* plaintext symbol; h is whether the last
 // physical plaintext was held F. A nonzero plaintext can also emit C=0.
 const original=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,iv:p.indices[0],c:p.indices.slice(1),d:p.indices.slice(1).map((c,j)=>mod(c-p.indices[j]))}));
 const isTrain=f=>!(f.page<=2||f.page>=15&&f.page<=22);
 assert(original.length===55&&sum(original.map(f=>f.d.length))===12901,"frame geometry");
 function encode(P,K,iv){
  let q=0,prev=iv;const c=[],d=[];
  for(const p of P){const x=p===0?0:mod(prev+p-K[q]);c.push(x);d.push(mod(x-prev));prev=x;if(p)q=p;}
  return {c,d};
 }
 // Exact known-key bigram Viterbi across both legal C=0 interpretations.
 function decode(f,K){
  const N=f.d.length,S=2*A,back=new Int16Array(N*S).fill(-1),value=new Uint8Array(N*S);
  let v=new Float64Array(S).fill(-Infinity);v[0]=0;
  for(let i=0;i<N;i++){
   const next=new Float64Array(S).fill(-Infinity),d=f.d[i],z=f.c[i]===0;
   for(let state=0;state<S;state++){
    if(!Number.isFinite(v[state]))continue;
    const q=state%A,prev=state>=A?0:q,p=mod(d+K[q]);
    if(p){const score=v[state]+(i===0?L1[p]:L2[prev*A+p]);if(score>next[p]){next[p]=score;back[i*S+p]=state;value[i*S+p]=p}}
    if(z){const to=A+q,score=v[state]+(i===0?L1[0]:L2[prev*A]);if(score>next[to]){next[to]=score;back[i*S+to]=state;value[i*S+to]=0}}
   }
   v=next;
  }
  let state=0;for(let k=1;k<S;k++)if(v[k]>v[state])state=k;
  if(!Number.isFinite(v[state]))return {P:null,gain:-Infinity};
  const gain=v[state],P=new Array(N);for(let i=N-1;i>=0;i--){P[i]=value[i*S+state];state=back[i*S+state];assert(state>=0,"backtrace")}
  assert(encode(P,K,f.iv).c.join()===f.c.join(),"literal F replay");
  return {P,gain};
 }
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
 const shiftIndex=Array.from({length:A},(_,d)=>Uint8Array.from({length:A},(_,p)=>mod(p-d)));
 function solve(frames,truth){
  const N=sum(frames.map(f=>f.d.length)),runs=[],S=2*A;
  for(let start=0;start<starts;start++){
   let W=sinkhorn(W0.map(w=>w*(.25+rng()/4294967296)));
   const history=[];let bestK=null,best=-Infinity;
   for(let it=0;it<iterations;it++){
    // Two language contexts for each consuming predecessor q:
    // actual previous rune q or an intervening literal F.
    const M0=new Float64Array(A*A*A),MF=new Float64Array(A*A*A),C=new Float64Array(A*A);
    for(let d=0;d<A;d++)for(let q=0;q<A;q++)for(let p=1;p<A;p++){
     const w=W[q*A+shiftIndex[d][p]],at=(d*A+q)*A+p;
     M0[at]=B[q*A+p]*w;MF[at]=B[p]*w;
    }
    let ll=0;
    for(const f of frames){
     const d=f.d,L=d.length,alpha=new Float64Array((L+1)*S),scale=new Float64Array(L);alpha[0]=1;
     for(let i=0;i<L;i++){
      const off=i*S,nxt=off+S,base=d[i]*A*A,z=f.c[i]===0;
      if(i===0){
       for(let p=1;p<A;p++)alpha[nxt+p]=U[p]*W[shiftIndex[d[i]][p]];
       if(z)alpha[nxt+A]=U[0];
      }else for(let q=0;q<A;q++){
       const a=alpha[off+q],h=alpha[off+A+q],b=base+q*A;
       if(a||h){for(let p=1;p<A;p++)alpha[nxt+p]+=a*M0[b+p]+h*MF[b+p];if(z)alpha[nxt+A+q]+=a*B[q*A]+h*B[0]}
      }
      let total=0;for(let p=0;p<S;p++)total+=alpha[nxt+p];assert(total>0,"scale");
      ll+=Math.log(total);scale[i]=total;for(let p=0;p<S;p++)alpha[nxt+p]/=total;
     }
     let beta=new Float64Array(S).fill(1),tmp=new Float64Array(S);
     for(let i=L-1;i>=0;i--){
      const base=d[i]*A*A,off=i*S,sc=scale[i],di=d[i],z=f.c[i]===0,ix=shiftIndex[di];
      if(i===0){for(let p=1;p<A;p++){const k=ix[p];C[k]+=U[p]*W[k]*beta[p]/sc}continue}
      for(let q=0;q<A;q++){
       const b=base+q*A,a=alpha[off+q]/sc,h=alpha[off+A+q]/sc;
       let v0=0,vf=0;
       for(let p=1;p<A;p++){
        const x=M0[b+p]*beta[p],y=MF[b+p]*beta[p];v0+=x;vf+=y;C[q*A+ix[p]]+=a*x+h*y;
       }
       if(z){v0+=B[q*A]*beta[A+q];vf+=B[0]*beta[A+q]}
       tmp[q]=v0/sc;tmp[A+q]=vf/sc;
      }
      const t=beta;beta=tmp;tmp=t;
     }
    }
    W=sinkhorn(C.map((x,i)=>Math.pow(x+.02*W0[i],it>=iterations/2?1.15:1)));
    if(it%5===4||it===iterations-1){
     const K=assignment(W);let hard=0,legal=0;
     for(const f of frames){const x=decode(f,K);hard+=x.gain;if(x.P)legal++}
     history.push({iteration:it+1,softLL:ll/N,hardGain:Number.isFinite(hard)?hard/N:null,legal,keyRows:truth?K.filter((k,q)=>k===truth[q]).length:null});
     if(hard>best){best=hard;bestK=K}
    }
   }
   runs.push({K:bestK,score:Number.isFinite(best)?best/N:null,history});
  }
  runs.sort((a,b)=>(b.score??-Infinity)-(a.score??-Infinity));
  return runs[0];
 }
 let seed=0x4313301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
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
 function plant(donor,K){let pos=donor.length-16000;return original.map(f=>{const P=donor.slice(pos,pos+f.d.length);pos+=P.length;assert(P.length===f.d.length,"donor length");return {page:f.page,iv:f.iv,P,...encode(P,K,f.iv)}})}
 function evaluate(frames,truth){
  const train=frames.filter(isTrain),fit=solve(train,truth);
  function metrics(F,K){
   let n=0,repeats=0,correct=0,legal=0,gain=0;
   for(const f of F){const x=decode(f,K);n+=f.d.length;repeats+=f.d.filter(x=>!x).length;if(!x.P)continue;legal++;gain+=x.gain;if(f.P)correct+=x.P.filter((p,i)=>p===f.P[i]).length;}
   return {n,repeats,legal,frames:F.length,correct:F[0].P?correct:null,gain:legal===F.length?gain/n:null};
  }
  const oracle=truth?{train:metrics(train,truth),held:metrics(frames.filter(f=>!isTrain(f)),truth)}:null;
  return {truth,fit,oracle,train:fit.K?metrics(train,fit.K):null,held:fit.K?metrics(frames.filter(f=>!isTrain(f)),fit.K):null};
 }
 const pilots=[];for(let i=0;i<count;i++){const K=key();if(i>=startPlant)pilots.push(evaluate(plant(donors[i%3],K),K))}
 const eligible=externalPilots.length===3&&externalPilots.every(p=>p.held&&p.train&&p.held.legal===p.held.frames&&p.train.legal===p.train.frames&&p.held.correct/p.held.n>=.95&&(p.held.repeats+p.train.repeats)/(p.held.n+p.train.n)<.012);
 let originalFit=null;if(originalTest&&eligible){seed=0x4323301;originalFit=evaluate(original,null)}
 return {iterations,starts,pilots,eligible,original:originalFit};
}
if(require.main===module){
 const arg=process.argv.find(x=>x.startsWith('--plant='));
 const n=arg?Number(arg.slice(8)):0;
 const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
 const opts=process.argv.includes('--original')?{count:0,originalTest:true,externalPilots:['gibran','shakespeare','emerson'].map(name=>JSON.parse(read('im-results/lp2-gp29-plainprev-shift-permutation-fhold-pilot-'+name+'.json')).pilots[0])}:{count:n+1,startPlant:n};
 console.log(JSON.stringify(experiment(INPUTS.map(read),opts),null,2));
}
module.exports={experiment,INPUTS};
