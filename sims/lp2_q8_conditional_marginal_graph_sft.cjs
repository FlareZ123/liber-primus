"use strict";
/** Agent21: native GP29 conditional-marginal cyclic graph recovery, control-only. */
function recover(rows,ind,score,graph,rnd,truthGraph){
 const R=29,Q=8,mod=x=>(x+R)%R;
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 const overlaps=(g,h)=>g.reduce((s,x,i)=>s+pop(x&h[i]),0);
 const exact=g=>overlaps(g,truthGraph);
 const uniform=()=>rnd(0x1000000)/0x1000000;
 const members=m=>Array.from({length:R},(_,p)=>p).filter(p=>m&(1<<p));
 const randomMove=m=>{let a,b;do{a=rnd(R)}while(!(m&(1<<a)));do{b=rnd(R)}while(m&(1<<b));return (m^(1<<a))|(1<<b)};
 // A row-wise relaxed posterior. Starting sets are independently fitted
 // without the hidden action. Tempering at 2 nats prevents false certainty.
 let A=rows.map((row,c)=>{let m=ind[c].estimate,s=row.score(m),out=new Float64Array(R),n=0;
  for(let i=0;i<5000;i++){const v=randomMove(m),z=row.score(v);if(z>=s||uniform()<Math.exp((z-s)/2)){m=v;s=z}if(i>=1000&&i%5===0){for(const p of members(m))out[p]++;n++}}
  return Float64Array.from(out,v=>.01+.98*v/n);
 });
 const project=v=>{let lo=-1,hi=1;for(let t=0;t<24;t++){let x=(lo+hi)/2,s=0;for(const u of v)s+=Math.min(1,Math.max(0,u-x));if(s>Q)lo=x;else hi=x}const x=(lo+hi)/2;return Float64Array.from(v,u=>Math.min(1,Math.max(0,u-x)))};
 for(let t=0;t<40;t++){A=A.map(project);for(let p=0;p<R;p++){const col=project(A.map(row=>row[p]));for(let c=0;c<R;c++)A[c][p]=col[c]}}
 const maxRowError=Math.max(...A.map(row=>Math.abs(row.reduce((s,v)=>s+v,0)-Q)));
 const softOverlap=A.reduce((s,row,c)=>s+row.reduce((u,v,p)=>u+((truthGraph[c]&(1<<p))?v:0),0),0);
 const eigen=M=>{
  let a=M.map(row=>Float64Array.from(row)),v=Array.from({length:R},(_,i)=>Float64Array.from({length:R},(_,j)=>i===j?1:0));
  for(let iter=0;iter<40000;iter++){
   let p=0,q=1,max=0;for(let i=0;i<R;i++)for(let j=i+1;j<R;j++)if(Math.abs(a[i][j])>max){max=Math.abs(a[i][j]);p=i;q=j}
   if(max<1e-10)break;
   const apq=a[p][q],tau=(a[q][q]-a[p][p])/(2*apq),t=(tau>=0?1:-1)/(Math.abs(tau)+Math.sqrt(1+tau*tau)),c=1/Math.sqrt(1+t*t),s=t*c;
   a[p][p]-=t*apq;a[q][q]+=t*apq;a[p][q]=a[q][p]=0;
   for(let i=0;i<R;i++)if(i!==p&&i!==q){const x=a[i][p],y=a[i][q];a[i][p]=a[p][i]=c*x-s*y;a[i][q]=a[q][i]=s*x+c*y}
   for(let i=0;i<R;i++){const x=v[i][p],y=v[i][q];v[i][p]=c*x-s*y;v[i][q]=s*x+c*y}
  }return {values:a.map((row,i)=>row[i]),v};
 };
 const canonical=pi=>{let n=1;while(pi[1]*n%R!==1)n++;return pi.map(v=>v*n%R)};
 const weight=M=>M.map(row=>Float64Array.from(row,v=>Math.log(Math.min(.995,Math.max(.005,v))/(1-Math.min(.995,Math.max(.005,v))))));
 function spectral(M){
  const W=weight(M);
  const mats=[Array.from({length:R},(_,i)=>Array.from({length:R},(_,j)=>M[i][j]+M[j][i])),
   Array.from({length:R},(_,i)=>Array.from({length:R},(_,j)=>M.reduce((s,row,k)=>s+M[i][k]*M[j][k],0))),
   Array.from({length:R},(_,i)=>Array.from({length:R},(_,j)=>M.reduce((s,row)=>s+row[i]*row[j],0)))];
  const seeds=[],seen=new Set();
  const keyFor=pi=>{const s=new Float64Array(R);for(let c=0;c<R;c++)for(let p=0;p<R;p++)s[mod(pi[c]-pi[p])]+=W[c][p];const k=Array.from({length:R},(_,i)=>i).sort((a,b)=>s[b]-s[a]).slice(0,Q);return {pi,k,z:k.reduce((u,v)=>u+s[v],0)}};
  for(const mat of mats){
   const E=eigen(mat),cols=Array.from({length:R},(_,j)=>j).filter(j=>Math.abs(E.v.reduce((s,row)=>s+row[j],0))<Math.sqrt(R)*.8);
   for(let i=0;i<cols.length;i++)for(let j=i+1;j<cols.length;j++){
    const a=cols[i],b=cols[j],theta=E.v.map(row=>Math.atan2(row[b],row[a])),origin=theta[0];
    const order=Array.from({length:R},(_,k)=>k).sort((x,y)=>((theta[x]-origin+2*Math.PI)%(2*Math.PI))-((theta[y]-origin+2*Math.PI)%(2*Math.PI)));
    const pi=Array(R);order.forEach((x,i)=>pi[x]=i);if(pi[0]!==0)throw Error("F anchor");
    const p=canonical(pi),id=p.join(",");if(seen.has(id))continue;seen.add(id);seeds.push(keyFor(p));
   }
  }
  seeds.sort((a,b)=>b.z-a.z);return {seeds,W};
 }
 const oracle=truthGraph.map(m=>Float64Array.from({length:R},(_,p)=>(m&(1<<p))?1:0));
 const oracleSeeds=spectral(oracle).seeds;
 if(!oracleSeeds.length||exact(graph(oracleSeeds[0].pi,oracleSeeds[0].k))!==R*Q)throw Error("noiseless spectral graph recovery failed");
 const {seeds,W}=spectral(A);
 const surrogate=(pi,k)=>{const inv=Array(R);pi.forEach((v,i)=>inv[v]=i);let s=0;for(let c=0;c<R;c++)for(const a of k)s+=W[c][inv[mod(pi[c]-a)]];return s};
 const randRank=()=>{const p=Array.from({length:R},(_,i)=>i);for(let i=R-1;i>1;i--){const j=1+rnd(i);[p[i],p[j]]=[p[j],p[i]]}return p};
 const randKey=()=>{let k=[];while(k.length<Q){let a=rnd(R);if(!k.includes(a))k.push(a)}return k};
 function anneal(seed,steps){
  let pi=seed.pi.slice(),k=seed.k.slice(),z=surrogate(pi,k),best={pi:pi.slice(),k:k.slice(),z};
  for(let i=0;i<steps;i++){
   const temp=2.0*Math.pow(.02,i/(steps-1));let a,b,isKey=rnd(6)===0;
   if(isKey){a=rnd(Q);do{b=rnd(R)}while(k.includes(b));const old=k[a];k[a]=b;let v=surrogate(pi,k);if(v>=z||uniform()<Math.exp((v-z)/temp))z=v;else k[a]=old}
   else{a=1+rnd(R-1);do{b=1+rnd(R-1)}while(a===b);[pi[a],pi[b]]=[pi[b],pi[a]];let v=surrogate(pi,k);if(v>=z||uniform()<Math.exp((v-z)/temp))z=v;else [pi[a],pi[b]]=[pi[b],pi[a]]}
   if(z>best.z+1e-10)best={pi:pi.slice(),k:k.slice(),z};
  }return best;
 }
 const top=seeds.slice(0,8).concat(Array.from({length:4},()=>({pi:randRank(),k:randKey()})));
 const results=top.map(v=>anneal(v,25000));
 const ranked=seeds.slice(0,8).concat(results).map(x=>({...x,score:score(x.pi,x.k),overlap:exact(graph(x.pi,x.k))})).sort((a,b)=>b.score-a.score);
 function hill(seed){
  let pi=seed.pi.slice(),k=seed.k.slice(),z=seed.score,steps=0;
  for(;steps<40;steps++){
   let best=z,move=null;
   for(let a=1;a<R;a++)for(let b=a+1;b<R;b++){[pi[a],pi[b]]=[pi[b],pi[a]];let v=score(pi,k);[pi[a],pi[b]]=[pi[b],pi[a]];if(v>best+1e-9){best=v;move=[0,a,b]}}
   for(let a=0;a<Q;a++)for(let b=0;b<R;b++)if(!k.includes(b)){let old=k[a];k[a]=b;let v=score(pi,k);k[a]=old;if(v>best+1e-9){best=v;move=[1,a,b]}}
   if(!move)break;
   const [type,a,b]=move;if(type)k[a]=b;else [pi[a],pi[b]]=[pi[b],pi[a]];
   z=best;
  }return {pi,k,score:z,overlap:exact(graph(pi,k)),steps};
 }
 const refined=ranked.slice(0,3).map(hill).sort((a,b)=>b.score-a.score);
 return {oracleExact:true,maxRowError,softOverlap,spectralCandidates:seeds.length,topSpectralOverlap:exact(graph(seeds[0].pi,seeds[0].k)),bestSpectralOverlap:Math.max(...seeds.slice(0,8).map(x=>exact(graph(x.pi,x.k)))),annealed:ranked.slice(0,5),refined,best:refined[0],edgeCount:R*Q};
}
function experiment(corpus,transcript,donors){
 const R=29,Q=8,ix=new Map(corpus.translit.map((x,i)=>[x,i])),ri=new Map(corpus.runes.map((x,i)=>[x,i]));
 const words=t=>(t.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
  const s=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  const out=[];for(let i=0;i<s.length;i++){let a=s.slice(i,i+2);if(a.length===2&&ix.has(a)){out.push(ix.get(a));i++}else if(ix.has(s[i]))out.push(ix.get(s[i]));}return out;
 }).filter(w=>w.length);
 const d=donors.map(words),train=d.flatMap(w=>w.slice(0,Math.floor(w.length*.67))),test=d.flatMap(w=>w.slice(Math.floor(w.length*.67)));
 let page=0,w=[],start=0,groups=[];const finish=()=>{if(w.length){groups.push({start,page,w});w=[]}};
 for(const c of transcript.split("%").slice(0,55).join("%")){
   if(ri.has(c)){if(!w.length)start=page;w.push(ri.get(c))}
   else if(c==="%")page++;else if(c!=="/"&&!/\s/.test(c))finish();
 }finish();
 if(groups.length!==2896||groups.reduce((s,g)=>s+g.w.length,0)!==12956)throw Error("corpus");
 const category=(L,j)=>L<=10?`${L}:${j}`:`11+:${j<3?"h"+j:L-j<=3?"t"+(L-j):"m"}`;
 const profiles=new Map(),global=new Float64Array(R);
 for(const w of train)for(let j=0;j<w.length;j++){const c=category(w.length,j);let p=profiles.get(c);if(!p){p=new Float64Array(R);profiles.set(c,p)}p[w[j]]++;global[w[j]]++;}
 let gs=global.reduce((s,x)=>s+x,0);for(let j=0;j<R;j++)global[j]=(global[j]+.5)/(gs+R*.5);
 for(const p of profiles.values()){const n=p.reduce((s,x)=>s+x,0);for(let j=0;j<R;j++)p[j]=(p[j]+10*global[j])/(n+10);}
 const byLen=new Map();for(const w of test){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}
 const physical=p=>p>=50?p+1:p;
 const chapter=groups.filter(g=>physical(g.start)>=40&&physical(g.page)<=53);
 const mod=x=>(x+R)%R;
 function run(arr,label,seed){
  let state=seed;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};
  const perm=Array.from({length:R},(_,i)=>i);for(let i=R-1;i>1;i--){const j=1+rnd(i);[perm[i],perm[j]]=[perm[j],perm[i]]}
  const inverse=Array(R);perm.forEach((v,i)=>inverse[v]=i);
  const key=[];while(key.length<Q){let k=rnd(R);if(!key.includes(k))key.push(k)}
  const plain=arr.map(g=>{let b=byLen.get(g.w.length);if(!b)throw Error("missing held length");return b[rnd(b.length)]});
  const ct=plain.map(w=>{let j=rnd(Q);return w.map(p=>p===0?0:inverse[mod(perm[p]+key[(j++)%Q])]);});
  const counts=new Map();for(const w of ct)for(let j=0;j<w.length;j++){let name=category(w.length,j);if(!counts.has(name))counts.set(name,new Float64Array(R));counts.get(name)[w[j]]++}
  const ctx=[...counts].map(([name,counts])=>({counts,prior:profiles.get(name)||global,n:counts.reduce((s,x)=>s+x,0)}));
  const rows=Array.from({length:R},(_,c)=>{
   const obs=[],total=new Float64Array(R);let baseTotal=0;
   for(const g of ctx){const f=g.prior,base=c===0?g.n*f[0]:0;const rate=Float64Array.from(f,(v,p)=>p===0?0:g.n*v/Q);baseTotal+=base;for(let p=0;p<R;p++)total[p]+=rate[p];if(g.counts[c])obs.push({n:g.counts[c],base,rate});}
   const cache=new Map();
   const score=(mask)=>{let s=cache.get(mask);if(s!==undefined)return s;const set=[];for(let p=0;p<R;p++)if(mask&(1<<p))set.push(p);s=-baseTotal;for(const p of set)s-=total[p];for(const v of obs){let z=v.base;for(const p of set)z+=v.rate[p];s+=v.n*Math.log(z)}cache.set(mask,s);return s;};
   return {score,cache};
  });
  const graph=(pi,k)=>{const inv=Array(R);pi.forEach((v,i)=>inv[v]=i);return pi.map(v=>k.reduce((m,a)=>m|(1<<inv[mod(v-a)]),0))};
  const score=(pi,k)=>graph(pi,k).reduce((s,m,c)=>s+rows[c].score(m),0);
  const truth=score(perm,key),g0=graph(perm,key);
  let swapBetter=0,keyBetter=0,swapMax=-Infinity,keyMax=-Infinity,bestSwap=null,bestKey=null;
  for(let a=1;a<R;a++)for(let b=a+1;b<R;b++){const p=perm.slice();[p[a],p[b]]=[p[b],p[a]];const s=score(p,key);if(s>truth+1e-8)swapBetter++;if(s>swapMax){swapMax=s;bestSwap=[a,b]}}
  for(let a=0;a<Q;a++)for(let b=0;b<R;b++)if(!key.includes(b)){const k=key.slice();k[a]=b;const s=score(perm,k);if(s>truth+1e-8)keyBetter++;if(s>keyMax){keyMax=s;bestKey=[key[a],b]}}
  const nulls=[];for(let t=0;t<100;t++){const p=Array.from({length:R},(_,i)=>i);for(let i=R-1;i>1;i--){const j=1+rnd(i);[p[i],p[j]]=[p[j],p[i]]}const k=[];while(k.length<Q){const v=rnd(R);if(!k.includes(v))k.push(v)}nulls.push(score(p,k));}
  const randomSet=()=>{let m=0,n=0;while(n<Q){const p=rnd(R);if(!(m&(1<<p))){m|=1<<p;n++}}return m};
  const popcnt=x=>{let n=0;while(x){x&=x-1;n++}return n};
  const ind=rows.map((row,c)=>{const t=row.score(g0[c]);let beat=0,m=0,best=-Infinity;for(let j=0;j<2000;j++){const u=randomSet(),s=row.score(u);if(s>=t)beat++;if(s>best){best=s;m=u}}let changed=true;while(changed){changed=false;let n=m,z=best;for(let a=0;a<R;a++)if(m&(1<<a))for(let b=0;b<R;b++)if(!(m&(1<<b))){const u=(m^(1<<a))|(1<<b),s=row.score(u);if(s>z+1e-10){z=s;n=u}}if(n!==m){m=n;best=z;changed=true}}return {truth:g0[c],estimate:m,overlap:popcnt(g0[c]&m),randomBeat:beat,delta:best-t};});
  return {label,seed,groups:arr.length,runes:ct.reduce((s,w)=>s+w.length,0),contexts:ctx.length,key,perm,truthScore:truth,swapBetter,keyBetter,bestSwap,bestSwapDelta:swapMax-truth,bestKey,bestKeyDelta:keyMax-truth,nullMax:Math.max(...nulls),nullMedian:nulls.sort((a,b)=>a-b)[50],rowMeanOverlap:ind.reduce((s,x)=>s+x.overlap,0)/R,rowExact:ind.filter(x=>x.overlap===Q).length,rows:ind,recovery:recover(rows,ind,score,graph,rnd,g0)};
 }
 return {trainWords:train.length,testWords:test.length,controls:[run(chapter,"chapter",0x2176a01),run(chapter,"chapter",0x2176a02),run(groups,"full-book",0x2176a03),run(groups,"full-book",0x2176a04)]};
}

if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),["resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(read)),null,2));}
module.exports={experiment};
