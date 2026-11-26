"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus,raw,g,s,e){
 const M=29,F=0,mod=x=>((x%M)+M)%M;
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const mat=(n,m)=>Array.from({length:n},()=>new Float64Array(m));
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let cur=[];
 const flush=()=>{if(cur.length){words.push(cur);cur=[]}};
 for(const c of raw.split("%").slice(0,55).join("%")){
  if(idx.has(c))cur.push(idx.get(c));else if(c!=="/"&&c!=="%"&&!/\s/u.test(c))flush();
 }flush();
 assert(words.length===2896&&words.reduce((a,b)=>a+b.length,0)===12956,"original grouping");
 const profile=Array(40).fill(0);for(const w of words)profile[w.length]++;
 const alphabet=corpus.translit;
 function pool(text){
  let by=Array.from({length:40},()=>[]);
  for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
   w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
   let a=[];while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
   if(a.length&&a.length<40)by[a.length].push(a);
  }return by;
 }
 const train=pool(g+"\n"+e),oracle=pool(s);
 const contexts=[];
 for(let l=1;l<40;l++)if(profile[l]&&train[l].length&&oracle[l].length)for(let i=0;i<l;i++)contexts.push({l,i,n:profile[l]});
 const keys=Object.fromEntries(contexts.map((c,i)=>[`${c.l}:${c.i}`,i]));
 function marginals(by){
  return contexts.map(({l,i})=>{let h=new Float64Array(M);for(const w of by[l])h[w[i]]++;return h.map(x=>x/by[l].length)});
 }
 const Xtrain=marginals(train),Xoracle=marginals(oracle);
 function solve(A,B){ // small dense system, partial pivoting
  const n=A.length,k=B[0].length,T=A.map((r,i)=>Array.from(r).concat(Array.from(B[i]))),piv=[];
  for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(T[i][c])>Math.abs(T[p][c]))p=i;
   const v=Math.abs(T[p][c]);if(v<1e-12)return null;piv.push(v);[T[c],T[p]]=[T[p],T[c]];
   let d=T[c][c];for(let j=c;j<n+k;j++)T[c][j]/=d;
   for(let i=0;i<n;i++)if(i!==c){let f=T[i][c];if(f)for(let j=c;j<n+k;j++)T[i][j]-=f*T[c][j]}
  }return {solution:T.map(row=>row.slice(n)),piv};
 }
 function fit(X,Y,mult,lambda){
  let G=mat(M-1,M-1),B=mat(M-1,M);
  for(let t=0;t<contexts.length;t++){
   const w=contexts[t].n*mult,x=X[t],y=Y[t];
   for(let p=1;p<M;p++){
    for(let q=1;q<M;q++)G[p-1][q-1]+=w*x[p]*x[q];
    for(let c=0;c<M;c++)B[p-1][c]+=w*x[p]*(y[c]-(c===F?x[F]:0));
   }
  }
  for(let p=0;p<M-1;p++){G[p][p]+=lambda;for(let c=0;c<M;c++)B[p][c]+=lambda/M}
  const sol=solve(G,B);if(!sol)return null;
  const A=mat(M,M);for(let c=0;c<M;c++){let sum=0;for(let p=1;p<M;p++){A[c][p]=sol.solution[p-1][c];sum+=A[c][p]}A[c][F]=1-sum}
  return {A,pivMin:Math.min(...sol.piv),pivMax:Math.max(...sol.piv)};
 }
 function eigenSym(A){
  const n=A.length,B=A.map(r=>Array.from(r)),V=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
  for(let it=0;it<50000;it++){
   let p=0,q=1,off=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(B[i][j])>off){p=i;q=j;off=Math.abs(B[i][j])}
   if(off<1e-10)break;
   const theta=0.5*Math.atan2(2*B[p][q],B[q][q]-B[p][p]),c=Math.cos(theta),s=Math.sin(theta),app=B[p][p],aqq=B[q][q],apq=B[p][q];
   B[p][p]=c*c*app-2*c*s*apq+s*s*aqq;B[q][q]=s*s*app+2*c*s*apq+c*c*aqq;B[p][q]=B[q][p]=0;
   for(let k=0;k<n;k++)if(k!==p&&k!==q){let x=B[k][p],y=B[k][q];B[k][p]=B[p][k]=c*x-s*y;B[k][q]=B[q][k]=s*x+c*y}
   for(let k=0;k<n;k++){let x=V[k][p],y=V[k][q];V[k][p]=c*x-s*y;V[k][q]=s*x+c*y}
  }
  return B.map((r,i)=>({v:r[i],vec:V.map(row=>row[i])}));
 }
 function spectral(A,pi){
  const B=mat(M,M);
  for(let i=0;i<M;i++)for(let j=0;j<M;j++)B[i][j]=(A[i][j]+A[j][i])/2;
  let means=B.map(r=>r.reduce((a,b)=>a+b,0)/M),grand=means.reduce((a,b)=>a+b,0)/M;
  for(let i=0;i<M;i++)for(let j=0;j<M;j++)B[i][j]+=-means[i]-means[j]+grand;
  let eig=eigenSym(B);
  let dc=eig.reduce((best,x,i)=>Math.abs(x.vec.reduce((a,b)=>a+b,0))>Math.abs(eig[best].vec.reduce((a,b)=>a+b,0))?i:best,0);
  eig.splice(dc,1);eig.sort((a,b)=>b.v-a.v);
  const candidates=[];
  for(let k=0;k<M-1;k+=2){
   const x=eig[k].vec,y=eig[k+1].vec,ord=Array.from({length:M},(_,i)=>i).sort((a,b)=>Math.atan2(y[a],x[a])-Math.atan2(y[b],x[b]));
   const h=new Float64Array(M);for(let i=0;i<M;i++)for(let j=0;j<M;j++)h[mod(i-j)]+=A[ord[i]][ord[j]]/M;
   let err=0;for(let i=0;i<M;i++)for(let j=0;j<M;j++)err+=(A[ord[i]][ord[j]]-h[mod(i-j)])**2;
   const step=mod(pi[ord[1]]-pi[ord[0]]),exact=ord.every((v,i)=>pi[v]===mod(pi[ord[0]]+i*step));
   let bestEdges=0;for(let d=1;d<M;d++){let z=0;for(let i=0;i<M;i++)z+=+(mod(pi[ord[(i+1)%M]]-pi[ord[i]])===d);bestEdges=Math.max(bestEdges,z)}
   candidates.push({err,exact,bestEdges,ord});
  }
  candidates.sort((a,b)=>a.err-b.err);
  return {winnerExact:candidates[0].exact,winnerEdges:candidates[0].bestEdges,anyExact:candidates.some(c=>c.exact),maxEdges:Math.max(...candidates.map(c=>c.bestEdges)),winnerErr:candidates[0].err};
 }
 let state=0x94f14e7b;
 const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
 function key(){
  const pi=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>1;i--){let j=1+rnd()%i;[pi[i],pi[j]]=[pi[j],pi[i]]}
  let k;do{k=Array.from({length:8},()=>rnd()%M)}while(k.slice(0,4).every((v,i)=>v===k[i+4]));
  const rev=[];pi.forEach((v,i)=>rev[v]=i);
  let A=mat(M,M);for(let p=0;p<M;p++)for(const v of k)A[rev[mod(pi[p]+v)]][p]+=1/8;
  return {pi,k,rev,A};
 }
 const err=(A,B)=>Math.sqrt(A.reduce((s,r,i)=>s+r.reduce((t,v,j)=>t+(v-B[i][j])**2,0),0)/(M*M));
 function observe(K,mult){
  const Y=mat(contexts.length,M);
  for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length){
   const by=oracle[l],n=profile[l]*mult;
   for(let j=0;j<n;j++){const w=by[rnd()%by.length];let phase=rnd()%8;for(let i=0;i<l;i++){let p=w[i],c=0;if(p!==F){c=K.rev[mod(K.pi[p]+K.k[phase])];phase=(phase+1)%8}Y[keys[`${l}:${i}`]][c]++}}
   for(let i=0;i<l;i++){const row=Y[keys[`${l}:${i}`]];for(let c=0;c<M;c++)row[c]/=n}
  }return Y;
 }
 function population(K){return Xoracle.map(x=>Array.from({length:M},(_,c)=>(c===F?x[F]:0)+K.A[c].reduce((sum,v,p)=>sum+(p===F?0:v*x[p]),0)))}
 const results=[];
 for(let t=0;t<3;t++){
  const K=key(),pop=fit(Xoracle,population(K),1,0);
  assert(pop&&err(pop.A,K.A)<1e-8,"population channel exact");
  const ideal=spectral(pop.A,K.pi),finite=[];
  for(const mult of [1,10,100]){
   const Y=observe(K,mult);
   for(const [name,X] of [["oracle",Xoracle],["independent",Xtrain]]){
    const fits=[];
    for(const lambda of [0.01,0.1,1,10]){
     const f=fit(X,Y,mult,lambda),spec=spectral(f.A,K.pi);
     fits.push({lambda,rmse:err(f.A,K.A),...spec});
    }
    finite.push({mult,reference:name,fits});
   }
  }
  results.push({shiftVector:K.k,pi:K.pi,population:{rmse:err(pop.A,K.A),pivotRange:[pop.pivMin,pop.pivMax],...ideal},finite});
 }
 return {source:{groups:words.length,runes:words.reduce((s,w)=>s+w.length,0),profile:profile.map((n,l)=>[l,n]).filter(x=>x[1]),contexts:contexts.length,usedRunes:contexts.reduce((s,c)=>s+c.n,0)},results};
}
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
