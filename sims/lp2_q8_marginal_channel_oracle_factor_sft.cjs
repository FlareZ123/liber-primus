"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus,raw,g,s,e){
 const M=29,mod=x=>(x+M*2)%M,F=0,eps=1e-5;
 const idx=new Map(corpus.runes.map((v,i)=>[v,i])),profile=Array(40).fill(0);let wlen=0;
 const flush=()=>{if(wlen){profile[wlen]++;wlen=0}};
 for(const c of raw.split("%").slice(0,55).join("%")){if(idx.has(c))wlen++;else if(c!=="/"&&c!=="%"&&!/\s/u.test(c))flush()}flush();
 const alphabet=corpus.translit;
 const pool=text=>{let by=Array.from({length:40},()=>[]);for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
  let a=[];while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
  if(a.length&&a.length<40)by[a.length].push(a)
 }return by};
 const oracle=pool(s),train=pool(g+"\n"+e),contexts=[];
 for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length)for(let i=0;i<l;i++)contexts.push({l,i,n:profile[l]});
 const ci=Object.fromEntries(contexts.map((v,i)=>[`${v.l}:${v.i}`,i]));
 const X=by=>contexts.map(({l,i})=>{let h=Array(M).fill(0);for(const w of by[l])h[w[i]]++;return h.map(n=>n/by[l].length)});
 const XO=X(oracle),XT=X(train);
 let st=0xca3420e7;
 const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return st>>>0},rand=()=>rng()/4294967296;
 const perm=()=>{let p=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>1;i--){let j=1+rng()%i;[p[i],p[j]]=[p[j],p[i]]}return p};
 const ranks=ord=>{let pi=[];ord.forEach((v,i)=>pi[v]=i);return pi};
 const counts=k=>{let h=Array(M).fill(0);for(let d of k)h[d]++;return h};
 const asH=k=>k.map(n=>n/8);
 const histEq=(a,b)=>a.every((v,i)=>v===b[i]);
 function observe(ord,k,mult){
  let Y=contexts.map(()=>Array(M).fill(0)),pi=ranks(ord);
  for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length){
   const by=oracle[l];for(let j=0;j<profile[l]*mult;j++){
    let w=by[rng()%by.length],phase=rng()%8;for(let i=0;i<l;i++){let p=w[i],c=F;if(p!==F){c=ord[mod(pi[p]+k[phase])];phase=(phase+1)%8}Y[ci[`${l}:${i}`]][c]++}
   }
  }return Y;
 }
 const predicted=(x,h)=>{let q=Array(M).fill(eps/M);q[0]+=(1-eps)*x[0];for(let p=1;p<M;p++)if(x[p])for(let d=0;d<M;d++)if(h[d])q[mod(p+d)]+=(1-eps)*x[p]*h[d];return q};
 const rankData=(X,Y,ord)=>({X:X.map(row=>ord.map(i=>row[i])),Y:Y.map(row=>ord.map(i=>row[i]))});
 const score=(D,h)=>D.X.reduce((sum,x,t)=>{let q=predicted(x,h);for(let c=0;c<M;c++)if(D.Y[t][c])sum+=D.Y[t][c]*Math.log(q[c]);return sum},0);
 function inferHist(D){
  let h=Array(M).fill(1/M);
  for(let it=0;it<150;it++){let n=Array(M).fill(0);for(let t=0;t<D.X.length;t++){
   const x=D.X[t],y=D.Y[t],q=predicted(x,h);
   for(let d=0;d<M;d++){let w=0;for(let p=1;p<M;p++)w+=x[p]*y[mod(p+d)]/q[mod(p+d)];n[d]+=h[d]*w}
  }let sum=n.reduce((a,b)=>a+b,0);h=n.map(v=>Math.max(1e-12,v/sum));sum=h.reduce((a,b)=>a+b,0);h=h.map(v=>v/sum)}
  let k=h.map(v=>Math.floor(v*8)),remain=8-k.reduce((a,b)=>a+b,0);
  let order=Array.from({length:M},(_,i)=>i).sort((a,b)=>(h[b]*8-k[b])-(h[a]*8-k[a]));
  for(let i=0;i<remain;i++)k[order[i]]++;
  let z=score(D,asH(k)),changes=0;
  // Exact score for every one-count transfer; repeat to local optimum.
  for(let it=0;it<10;it++){let best=z,move=null;
   for(let a=0;a<M;a++)if(k[a])for(let b=0;b<M;b++)if(a!==b){k[a]--;k[b]++;let q=score(D,asH(k));k[a]++;k[b]--;if(q>best+1e-7){best=q;move=[a,b]}}
   if(!move)break;k[move[0]]--;k[move[1]]++;z=best;changes++;
  }
  return {k,score:z,changes};
 }
 function equivalence(ord,trueOrd){
  let pi=ranks(trueOrd),step=mod(pi[ord[1]]-pi[ord[0]]);
  return ord.every((v,i)=>pi[v]===mod(i*step));
 }
 function anneal(X,Y,start,h,iterations){
  let ord=start.slice(),D=rankData(X,Y,ord),Q=D.X.map(x=>predicted(x,h)),L=Q.map(row=>row.map(Math.log));
  let val=D.Y.reduce((z,row,t)=>z+row.reduce((q,n,c)=>q+n*L[t][c],0),0),best=val,bestOrd=ord.slice();
  const dif=Array.from({length:M},(_,a)=>Array.from({length:M},(_,b)=>Array.from({length:M},(_,c)=>(1-eps)*(h[mod(c-a)]-h[mod(c-b)]))));
  for(let it=0;it<iterations;it++){
   let a=1+rng()%(M-1),b=1+rng()%(M-2);if(b>=a)b++;
   let delta=0,deltaH=dif[a][b];
   for(let t=0;t<D.X.length;t++){let x=D.X[t],y=D.Y[t],q=Q[t],l=L[t],dx=x[b]-x[a];
    for(let c=0;c<M;c++){let yy=c===a?y[b]:c===b?y[a]:y[c];if(yy)delta+=yy*Math.log(Math.max(eps/M,q[c]+dx*deltaH[c]));if(y[c])delta-=y[c]*l[c]}
   }
   let temp=18*Math.pow(0.015,it/Math.max(1,iterations-1));
   if(delta>=0||rand()<Math.exp(delta/temp)){
    for(let t=0;t<D.X.length;t++){let x=D.X[t],y=D.Y[t],q=Q[t],l=L[t],dx=x[b]-x[a];for(let c=0;c<M;c++){q[c]=Math.max(eps/M,q[c]+dx*deltaH[c]);l[c]=Math.log(q[c])}[x[a],x[b]]=[x[b],x[a]];[y[a],y[b]]=[y[b],y[a]]}
    [ord[a],ord[b]]=[ord[b],ord[a]];val+=delta;
    if(val>best){best=val;bestOrd=ord.slice()}
   }
  }
  // Independent re-score to catch numerical update error.
  let re=score(rankData(X,Y,bestOrd),h);
  if(Math.abs(re-best)>1e-4)throw Error(`score drift ${re-best}`);
  return {ord:bestOrd,score:re};
 }
 const results=[];
 // Cover both repeated/zero and all-distinct profiles explicitly; both are primitive.
 const vectors=[[0,4,4,7,13,13,22,28],[2,6,9,12,17,19,23,27],[1,1,1,3,3,7,0,24]];
 for(let t=0;t<vectors.length;t++){
  let key=vectors[t],ord=perm(),kh=counts(key),Y=observe(ord,key,1),row={key,ord,knownCycle:[],knownHistogram:[]};
  for(const [name,X] of [["oracle",XO],["independent",XT]]){
   const D=rankData(X,Y,ord),fit=inferHist(D),trueScore=score(D,asH(kh));
   row.knownCycle.push({reference:name,actual:kh,fit:fit.k,exact:histEq(kh,fit.k),fitScore:fit.score,trueScore,changes:fit.changes});
   // Give exact histogram as an oracle and attempt full cycle recovery from two independent random starts.
   let best=null;
   for(let n=0;n<2;n++){const f=anneal(X,Y,perm(),asH(kh),10000);if(!best||f.score>best.score)best=f}
   row.knownHistogram.push({reference:name,exact:equivalence(best.ord,ord),fitScore:best.score,trueScore,fitOrd:best.ord});
  }
  results.push(row);
 }
 return {sourceGroups:profile.reduce((a,b)=>a+b,0),sourceRunes:profile.reduce((a,b,i)=>a+b*i,0),contexts:contexts.length,results};
}
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
