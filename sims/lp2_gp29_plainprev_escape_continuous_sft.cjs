'use strict';
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,{width=64,count=3,startPlant=0,originalTest=false,refineSweeps=12,wide=false,scope='chapter',chapterBeam=false,mixture=false,mixtureIterations=60,mixtureStarts=1,randomStarts=1,emSteps=4,emSchedule=[.8,.5,.2,.05],useEM=true,pairStarts=4,pairSweeps=8,pairOnly=false,annealSteps=150000,annealStarts=2,annealT0=25,annealT1=.25}={}){
 const gp=JSON.parse(raw[0]),A=29,mod=(x,m=29)=>(x%m+m)%m,assert=(x,m)=>{if(!x)throw Error(m)},alphabet=gp.translit,tokens=alphabet.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1).map(native),train=donors.map(d=>d.slice(0,d.length-16000)),U0=new Float64Array(A).fill(.5),B0=new Float64Array(A*A),T0=new Float64Array(A*A*A),sum=a=>a.reduce((x,y)=>x+y,0);
 for(const p of train)for(let i=0;i<p.length;i++){U0[p[i]]++;if(i)B0[p[i-1]*A+p[i]]++;if(i>1)T0[(p[i-2]*A+p[i-1])*A+p[i]]++;}
 const U=U0.map(x=>x/sum(U0)),B=new Float64Array(A*A),T=new Float64Array(A*A*A);for(let q=0;q<A;q++){const n=sum(B0.subarray(q*A,(q+1)*A));for(let p=0;p<A;p++)B[q*A+p]=(B0[q*A+p]+8*U[p])/(n+8);}
 for(let a=0;a<A;a++)for(let q=0;q<A;q++){const j=(a*A+q)*A,n=sum(T0.subarray(j,j+A));for(let p=0;p<A;p++)T[j+p]=(T0[j+p]+12*B[q*A+p])/(n+12);}
 const L1=U.map(x=>Math.log(A*x)),L2=B.map(x=>Math.log(A*x)),L3=T.map(x=>Math.log(A*x));
 const pow=Array(28).fill(1);for(let j=1;j<28;j++)pow[j]=pow[j-1]*15%29;assert(new Set(pow).size===28,"root15");const log=new Int8Array(29).fill(-1);for(let j=0;j<28;j++)log[pow[j]]=j;
 const rows=Array.from({length:812},(_,k)=>{const E=Math.floor(k/28),s=k%28;return Uint8Array.from({length:29},(_,d)=>{if(!d)return E;const r=mod(log[d]-s,28);return r+(r>=E)})});
 const inv=rows.map(row=>{const a=new Uint8Array(29);row.forEach((p,d)=>a[p]=d);assert(new Set(a).size===29,"row permutation");return a});
 const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const original=(scope==='book'?[[0,55]]:sections).map(([a,b])=>{const pages=gp.pages.filter(p=>p.page>=a&&p.page<=b&&p.indices.length),C=pages.flatMap(p=>p.indices);return {page:a,iv:C[0],d:C.slice(1).map((c,j)=>mod(c-C[j])),parts:pages.map(p=>({page:p.page,n:p.indices.length}))}});
 const isTrain=f=>f.page!==0&&f.page!==15;
 assert(original.length===(scope==="book"?1:9)&&sum(original.map(f=>f.d.length))===(scope==="book"?12955:12947),"frame geometry");
 for(const f of original){const c=[f.iv];for(const d of f.d)c.push(mod(c.at(-1)+d));assert(c.join()===f.parts.flatMap(p=>gp.pages[p.page].indices).join(),"source replay");}
 function chunks(frames){return frames.flatMap(f=>{let off=0;return f.parts.map(({page,n})=>{const v={page,d:f.d.slice(off,off+n-1)};off+=n;return v})})}
 function decode(d,K){let q=0;const P=[];for(const v of d){q=rows[K[q]][v];P.push(q);}return P}
 function encode(P,K){let q=0;return P.map(p=>{const d=inv[K[q]][p];q=p;return d})}
 function score(P){let s=0;for(let j=0;j<P.length;j++)s+=j===0?L1[P[j]]:j===1?L2[P[j-1]*A+P[j]]:L3[(P[j-2]*A+P[j-1])*A+P[j]];return s}
 function solve(frames,width,truth){
  const F=frames.map(f=>f.d),N=F.length,total=sum(F.map(f=>f.length));
  const makeDomain=ids=>{const force=new Int8Array(A).fill(-1);for(let d=0;d<A;d++){const v=rows[ids[0]][d];if(ids.every(k=>rows[k][d]===v))force[d]=v;}return {ids,force}};
  const all=makeDomain(Array.from({length:812},(_,k)=>k));
  let beam=[{D:Array(A).fill(all),pos:new Uint16Array(N),q:new Uint8Array(N),prev:new Uint8Array(N),s:0,n:0}],trace=[];
  for(let round=0;round<29*29;round++){
   let next=[];
   for(const old of beam){const occ=new Uint16Array(A),ds=Array.from({length:A},()=>new Set());for(let i=0;i<N;i++)if(old.pos[i]<F[i].length){const q=old.q[i];occ[q]++;ds[q].add(F[i][old.pos[i]]);}
    let z=0;for(let q=1;q<A;q++)if(occ[q]>occ[z])z=q;if(!occ[z]){next.push(old);continue;}
    const digits=[...ds[z]].sort((a,b)=>a-b),groups=new Map();
    for(const k of old.D[z].ids){const sig=String.fromCharCode(...digits.map(d=>65+rows[k][d]));const g=groups.get(sig);if(g)g.push(k);else groups.set(sig,[k]);}
    assert(groups.size>1,"ambiguous frontier");
    for(const ids of groups.values()){const D=old.D.slice();D[z]=makeDomain(ids);const pos=old.pos.slice(),q=old.q.slice(),prev=old.prev.slice();let s=old.s,n=old.n;
     for(let i=0;i<N;i++){const d=F[i];let j=pos[i],b=q[i],a=prev[i];while(j<d.length){const p=D[b].force[d[j]];if(p<0)break;s+=j===0?L1[p]:j===1?L2[b*A+p]:L3[(a*A+b)*A+p];j++;n++;a=b;b=p;}pos[i]=j;q[i]=b;prev[i]=a}
     next.push({D,pos,q,prev,s,n})
    }
   }
   next.sort((a,b)=>b.s-a.s);beam=next.slice(0,width);const best=beam[0];const matching=truth?beam.filter(x=>x.D.every((d,i)=>d.ids.includes(truth[i]))).length:null;trace.push({round:round+1,best:best.s,n:best.n,matching,domains:best.D.map(d=>d.ids.length)});if(beam.every(x=>x.n===total))break;
  }
  assert(beam[0].n===total,"incomplete beam");
  return {K:beam[0].D.map(d=>d.ids[0]),trace}
 }
 function refine(frames,init,{sweeps=12,wide=false}={}){
  const F=frames.map(f=>f.d),K=init.slice(),N=sum(F.map(d=>d.length));let evals=0;
  function value(hist){let s=0;evals++;for(const d of F){let a=0,b=0;for(let j=0;j<d.length;j++){if(hist)hist[b]++;const p=rows[K[b]][d[j]];s+=j===0?L1[p]:j===1?L2[b*A+p]:L3[(a*A+b)*A+p];a=b;b=p;}}return s;}
  let best=value(),history=[];
  for(let t=0;t<sweeps;t++){const h=new Uint32Array(A);value(h);const order=Array.from({length:A},(_,q)=>q).sort((a,b)=>h[b]-h[a]);let improved=0;
   for(const q of order){if(!h[q])continue;const k0=K[q],E=Math.floor(k0/28),s=k0%28,old=best;let winner=k0;
    const choices=wide?Array.from({length:812},(_,k)=>k):[...new Set([...Array.from({length:29},(_,e)=>28*e+s),...Array.from({length:28},(_,k)=>28*E+k),...Array.from({length:29},(_,e)=>28*e+(s+1)%28),...Array.from({length:29},(_,e)=>28*e+(s+27)%28)])];
    for(const k of choices){if(k===k0)continue;K[q]=k;const v=value();if(v>best+1e-9){best=v;winner=k}}
    K[q]=winner;if(best>old+1e-9)improved++;
   }
   history.push({sweep:t+1,score:best/N,improved,evals});if(!improved)break;
  }
  return {K,history,score:best/N};
 }
 function pairFit(frames,init,sweeps){
  const K=init.slice(),counts=new Uint32Array(A*A);let N=0;for(const f of frames)for(let i=1;i<f.d.length;i++){counts[f.d[i-1]*A+f.d[i]]++;N++;}
  const rowProb=Array.from({length:A},(_,q)=>Array.from({length:812},(_,k)=>Float64Array.from(rows[k],p=>B[q*A+p])));
  const V=K.map((k,q)=>rowProb[q][k]);
  function fullValue(K){let P=new Float64Array(A*A);for(let q=0;q<A;q++)for(let d=0;d<A;d++){const p=rows[K[q]][d],w=U[q]*rowProb[q][K[q]][d],v=rowProb[p][K[p]];for(let e=0;e<A;e++)P[d*A+e]+=w*v[e];}let s=0;for(let i=0;i<P.length;i++)s+=counts[i]*Math.log(P[i]);return s;}
  let best=fullValue(K),history=[];
  for(let t=0;t<sweeps;t++){let improved=0;const order=Array.from({length:A},(_,q)=>q).sort((a,b)=>U[b]-U[a]);
   for(const q of order){
    const base=new Float64Array(A*A),inc=new Float64Array(A);for(let a=0;a<A;a++)if(a!==q)for(let d=0;d<A;d++){const p=rows[K[a]][d],w=U[a]*V[a][d];if(p===q)inc[d]+=w;else for(let e=0;e<A;e++)base[d*A+e]+=w*V[p][e];}
    let win=K[q],top=-Infinity;
    for(let k=0;k<812;k++){const v=rowProb[q][k],row=rows[k];let z=0;for(let d=0;d<A;d++){const p=row[d],w=U[q]*v[d],next=p===q?v:V[p],at=d*A,h=inc[d];for(let e=0;e<A;e++){const c=counts[at+e];if(c)z+=c*Math.log(base[at+e]+h*v[e]+w*next[e]);}}if(z>top+1e-10){top=z;win=k;}}
    if(win!==K[q])improved++;K[q]=win;V[q]=rowProb[q][win];best=top;
   }
   const check=fullValue(K);assert(Math.abs(check-best)<1e-5,"pair score identity");history.push({sweep:t+1,ll:best/N,improved});if(!improved)break;
  }
  return {K,history,score:best/N,evalKey:K=>fullValue(K)/N};
 }
 function pairAnneal(frames,initial,steps,T0,T1){
  const K=initial.slice(),counts=new Uint32Array(A*A);let N=0;for(const f of frames)for(let i=1;i<f.d.length;i++){counts[f.d[i-1]*A+f.d[i]]++;N++;}
  const rowProb=Array.from({length:A},(_,q)=>Array.from({length:812},(_,k)=>Float64Array.from(rows[k],p=>B[q*A+p]))),V=K.map((k,q)=>rowProb[q][k]),M=new Float64Array(A*A);
  for(let q=0;q<A;q++)for(let d=0;d<A;d++){const p=rows[K[q]][d],w=U[q]*V[q][d],v=V[p];for(let e=0;e<A;e++)M[d*A+e]+=w*v[e];}
  let value=0;for(let i=0;i<M.length;i++)value+=counts[i]*Math.log(M[i]);let best=value,bestK=K.slice(),accept=0,changes=0;const trace=[],inc=new Float64Array(A),delta=new Float64Array(A*A),R=()=>rng()/4294967296;
  for(let t=0;t<steps;t++){
   const q=rng()%A,old=K[q],E=Math.floor(old/28),h=old%28,mode=rng()%5;
   let k=mode===0?rng()%812:mode===1?28*(rng()%29)+h:mode===2?28*E+(rng()%28):mode===3?28*mod(E+(rng()%2?1:-1),29)+h:28*(rng()%29)+mod(h+(rng()%2?1:-1),28);
   if(k===old)continue;
   const v=V[q],nv=rowProb[q][k],oldrow=rows[old],newrow=rows[k];inc.fill(0);
   for(let a=0;a<A;a++)if(a!==q)inc[inv[K[a]][q]]+=U[a]*B[a*A+q];
   let diff=0;
   for(let d=0;d<A;d++){const p=oldrow[d],np=newrow[d],w=U[q]*v[d],nw=U[q]*nv[d],ov=V[p],nnext=np===q?nv:V[np],at=d*A,h=inc[d];for(let e=0;e<A;e++){const x=h*(nv[e]-v[e])+nw*nnext[e]-w*ov[e];delta[at+e]=x;if(counts[at+e])diff+=counts[at+e]*Math.log1p(x/M[at+e]);}}
   const T=T0*Math.pow(T1/T0,t/Math.max(1,steps-1));changes++;
   if(diff>=0||R()<Math.exp(diff/T)){K[q]=k;V[q]=nv;for(let j=0;j<M.length;j++)M[j]+=delta[j];value+=diff;accept++;if(value>best){best=value;bestK=K.slice()}}
   if((t+1)%Math.ceil(steps/10)===0)trace.push({step:t+1,T,score:value/N,best:best/N,accepted:accept,proposals:changes});
  }
  let exact=0;const Z=new Float64Array(A*A);for(let q=0;q<A;q++)for(let d=0;d<A;d++){const p=rows[bestK[q]][d],v=rowProb[p][bestK[p]],w=U[q]*rowProb[q][bestK[q]][d];for(let e=0;e<A;e++)Z[d*A+e]+=w*v[e];}for(let i=0;i<Z.length;i++)exact+=counts[i]*Math.log(Z[i]);assert(Math.abs(exact-best)<1e-5,"anneal score");
  return {K:bestK,score:best/N,trace};
 }

 function mixtureFit(frames,truth,iterations=60,prior=.002,sharpen=1.15){
  const W=Array.from({length:A},(_,q)=>Float64Array.from({length:812},(_,k)=>{const e=Math.floor(k/28);return Math.exp(-Math.abs(B[q*A+e]-.00664)*100)*(.1+rng()/4294967296)}));
  const norm=a=>{const n=sum(a);for(let i=0;i<a.length;i++)a[i]/=n};for(const w of W)norm(w);
  const N=sum(frames.map(f=>f.d.length)),history=[];
  for(let iter=0;iter<iterations;iter++){
   const R=new Float64Array(A*A*A),M=new Float64Array(A*A*A),C=new Float64Array(A*A*A);
   for(let q=0;q<A;q++)for(let k=0;k<812;k++){const w=W[q][k],row=rows[k];for(let d=0;d<A;d++)R[(d*A+q)*A+row[d]]+=w}
   for(let d=0;d<A;d++)for(let q=0;q<A;q++)for(let p=0;p<A;p++)M[(d*A+q)*A+p]=B[q*A+p]*R[(d*A+q)*A+p];
   let ll=0;
   for(const f of frames){
    const d=f.d,alpha=new Float64Array((d.length+1)*A),scale=new Float64Array(d.length);alpha[0]=1;
    for(let i=0;i<d.length;i++){
     const off=i*A,nxt=off+A,base=d[i]*A*A;
     for(let q=0;q<A;q++){const a=alpha[off+q],b=base+q*A;if(!a)continue;for(let p=0;p<A;p++)alpha[nxt+p]+=a*(i?M[b+p]:U[p]*R[b+p]);}
     let z=0;for(let p=0;p<A;p++)z+=alpha[nxt+p];assert(z>0,"scale");ll+=Math.log(z);scale[i]=z;for(let p=0;p<A;p++)alpha[nxt+p]/=z;
    }
    let beta=new Float64Array(A).fill(1),tmp=new Float64Array(A);
    for(let i=d.length-1;i>=0;i--){const base=d[i]*A*A,off=i*A,sc=scale[i];for(let q=0;q<A;q++){const b=base+q*A,a=alpha[off+q];let z=0;for(let p=0;p<A;p++){const v=(i?M[b+p]:U[p]*R[b+p])*beta[p]/sc;z+=v;C[b+p]+=a*v}tmp[q]=z;}const t=beta;beta=tmp;tmp=t;}
   }
   for(let i=0;i<C.length;i++)C[i]=R[i]?C[i]/R[i]:0;
   let maxMass=0,truthMass=0;const K=[];
   for(let q=0;q<A;q++){
    const w=W[q];let best=0;for(let k=0;k<812;k++){const row=rows[k];let v=0;for(let d=0;d<A;d++)v+=C[(d*A+q)*A+row[d]];w[k]=Math.pow(w[k]*v+prior/812,iter>=iterations/2?sharpen:1);if(w[k]>w[best])best=k}norm(w);K.push(best);maxMass+=w[best];if(truth)truthMass+=w[truth[q]];
   }
   if(iter%5===0||iter===iterations-1)history.push({iteration:iter+1,ll:ll/N,rows:truth?K.filter((k,q)=>k===truth[q]).length:null,maxMass:maxMass/A,truthMass:truth?truthMass/A:null});
  }
  const K=W.map(w=>{let k=0;for(let i=1;i<w.length;i++)if(w[i]>w[k])k=i;return k});
  return {K,history};
 }

 function softEM(frames,initial,schedule,steps){
  const K=initial.slice(),history=[],H=A*A*A;
  function expectation(eps){
   const low=eps/A,high=1-eps,C=new Float64Array(H);let ll=0;
   for(const f of frames){
    const d=f.d,N=d.length,alpha=new Float64Array((N+1)*A),scales=new Float64Array(N);alpha[0]=1;
    for(let i=0;i<N;i++){
     const off=i*A,next=off+A,di=d[i],Bmat=i===0?null:B;
     for(let q=0;q<A;q++){const a=alpha[off+q];if(a===0)continue;const t=q*A,m=rows[K[q]][di];for(let p=0;p<A;p++)alpha[next+p]+=a*(Bmat?Bmat[t+p]:U[p])*low;alpha[next+m]+=a*(Bmat?Bmat[t+m]:U[m])*high;}
     let z=0;for(let p=0;p<A;p++)z+=alpha[next+p];assert(z>0,"zero scale");scales[i]=z;ll+=Math.log(z);for(let p=0;p<A;p++)alpha[next+p]/=z;
    }
    let beta=new Float64Array(A).fill(1),tmp=new Float64Array(A);
    for(let i=N-1;i>=0;i--){
     const di=d[i],scale=scales[i],off=i*A,Bmat=i===0?null:B;
     for(let q=0;q<A;q++){const t=q*A,m=rows[K[q]][di],base=(q*A+di)*A,a=alpha[off+q];let z=0;
      for(let p=0;p<A;p++){const v=(Bmat?Bmat[t+p]:U[p])*beta[p]*(low+(p===m?high:0))/scale;z+=v;C[base+p]+=a*v;}
      tmp[q]=z;
     }
     const x=beta;beta=tmp;tmp=x;
    }
   }
   return {ll,C};
  }
  for(const eps of schedule)for(let t=0;t<steps;t++){
   const {ll,C}=expectation(eps);let changes=0;
   for(let q=0;q<A;q++){const base=q*A*A;let best=-Infinity,winner=K[q];for(let k=0;k<812;k++){let v=0;const row=rows[k];for(let d=0;d<A;d++)v+=C[base+d*A+row[d]];if(v>best+1e-12){best=v;winner=k;}}if(winner!==K[q])changes++;K[q]=winner;}
   history.push({eps,step:t+1,ll:ll/sum(frames.map(f=>f.d.length)),changes});if(!changes)break;
  }
  return {K,history};
 }
 let seed=0x15a3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function key(){return Array.from({length:A},(_,q)=>{const c=Array.from({length:A},(_,p)=>p).sort((a,b)=>Math.abs(B[q*A+a]-.00664)-Math.abs(B[q*A+b]-.00664));return 28*c[rng()%5]+rng()%28})}
 function plant(donor,K){let pos=donor.length-16000;return original.map(f=>{const P=donor.slice(pos,pos+f.d.length);pos+=P.length;assert(P.length===f.d.length,"donor length");return {page:f.page,iv:f.iv,parts:f.parts,P,d:encode(P,K)}})}
 function evaluate(frames,truth){
  const book=scope==='book',cut=book?frames[0].d.length-2630:0;
  const tr=book?[{...frames[0],d:frames[0].d.slice(0,cut),P:frames[0].P?.slice(0,cut)}]:frames.filter(isTrain),r=mixture?{K:null,trace:[]}:solve(chapterBeam?tr:chunks(tr),width,truth);
  const mix=mixture?Array.from({length:mixtureStarts},()=>mixtureFit(tr,truth,mixtureIterations)):[];
  const starts=mixture?mix.map((m,i)=>({name:'mixture-'+i,K:m.K})): [{name:chapterBeam?"chapter-F-initializer":"page-F-initializer",K:r.K.slice()},...Array.from({length:randomStarts},(_,i)=>({name:"random-"+i,K:Array.from({length:A},()=>rng()%812)}))];
  let pair=[];for(let i=0;i<(mixture?0:pairStarts);i++){const x=pairFit(tr,Array.from({length:A},()=>rng()%812),pairSweeps);pair.push({name:"pair-"+i,K:x.K,score:x.score,history:x.history,truthScore:truth?x.evalKey(truth):null});}pair.sort((a,b)=>b.score-a.score);
  if(pair.length&&annealStarts){const base=pair[0];for(let j=0;j<annealStarts;j++){const a=pairAnneal(tr,j===0?base.K:Array.from({length:A},()=>rng()%812),annealSteps,annealT0,annealT1);const b=pairFit(tr,a.K,pairSweeps);pair.push({name:'anneal-'+j,K:b.K,score:b.score,history:b.history,anneal:a.trace,truthScore:truth?b.evalKey(truth):null});}pair.sort((a,b)=>b.score-a.score);}
  if(pair.length)starts.push(pair[0]);
  if(pairOnly)return {truth,pair:pair.map(x=>({...x,keyRows:truth?x.K.filter((k,i)=>k===truth[i]).length:null}))};
  let opt=null,initial=null,details=[];for(const st of starts){const em=useEM&&!mixture?softEM(tr,st.K,emSchedule,emSteps):{K:st.K,history:[]};const t=refine(tr,em.K,{sweeps:refineSweeps,wide});details.push({name:st.name,score:t.score,em:em.history,history:t.history});if(!opt||t.score>opt.score){opt=t;initial=st.K;}}r.K=opt.K;
  function evalpart(F){let n=0,s=0,correct=0,repeats=0,used=new Set();for(const f of F){const P=decode(f.d,r.K);assert(encode(P,r.K).join()===f.d.join(),"replay");n+=P.length;s+=score(P);repeats+=f.d.filter(x=>!x).length;if(f.P){correct+=P.filter((p,i)=>p===f.P[i]).length;used.add(0);for(let i=0;i<f.P.length-1;i++)used.add(f.P[i]);}}return {n,repeats,gain:s/n,correct:F[0].P?correct:null,usedRows:truth?used.size:null,keyRows:truth?[...used].filter(q=>truth[q]===r.K[q]).length:null,preview:F.slice(0,2).map(f=>decode(f.d,r.K).slice(0,80).map(p=>alphabet[p]).join(""))}}
  if(book){
   const f=frames[0],P=decode(f.d,r.K);assert(encode(P,r.K).join()===f.d.join(),"whole-book replay");const metrics=(a,b)=>{let s=0,correct=0,repeats=0,used=new Set();for(let j=a;j<b;j++){s+=j===0?L1[P[j]]:j===1?L2[P[j-1]*A+P[j]]:L3[(P[j-2]*A+P[j-1])*A+P[j]];if(f.P&&P[j]===f.P[j])correct++;if(f.d[j]===0)repeats++;if(f.P)used.add(j===0?0:f.P[j-1])}return {n:b-a,repeats,gain:s/(b-a),correct:f.P?correct:null,usedRows:truth?used.size:null,keyRows:truth?[...used].filter(q=>truth[q]===r.K[q]).length:null,preview:P.slice(a,80+a).map(x=>alphabet[x]).join("")}};
   return {key:r.K,initial,refinement:opt.history,details,pair,mix,truth,train:metrics(0,cut),held:metrics(cut,P.length),trace:r.trace};
  }
  return {key:r.K,initial,refinement:opt.history,details,pair,mix,truth,train:evalpart(frames.filter(isTrain)),held:evalpart(frames.filter(f=>!isTrain(f))),trace:r.trace}
 }
 const pilots=[];for(let i=0;i<count;i++){const K=key();if(i>=startPlant)pilots.push(evaluate(plant(donors[i%3],K),K))}
 return {width,donorLengths:donors.map(d=>d.length),pilots,original:originalTest?evaluate(original,null):null};
}
if(require.main===module)console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),process.argv.includes('--mixture')?{width:64,count:process.argv.includes('--original')?0:Number(process.argv.find(x=>x.startsWith('--plant='))?.slice(8)??0)+1,startPlant:Number(process.argv.find(x=>x.startsWith('--plant='))?.slice(8)??0),mixture:true,scope:process.argv.includes('--book')?'book':'chapter',originalTest:process.argv.includes('--original')}:process.argv.includes('--chapter-beam')?{width:256,count:1,chapterBeam:true,pairStarts:0,annealStarts:0,randomStarts:0,useEM:false,refineSweeps:12}:process.argv.includes('--pair-only')?{width:64,count:1,pairOnly:true,pairStarts:6,annealStarts:2,annealSteps:180000,annealT0:20,annealT1:.2}:{width:64,count:1,originalTest:false,pairStarts:0,annealStarts:0,randomStarts:1,useEM:false}),null,2));
module.exports={experiment,INPUTS};
