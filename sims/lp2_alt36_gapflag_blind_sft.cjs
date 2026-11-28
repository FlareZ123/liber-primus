"use strict";
/**
 * Conditional mod36 side-information receiver: each operational printed
 * word break flags >=1 silent accepted emission; every other internal
 * inter-rune gap flags zero. This is a new interpretation to test, NOT
 * authenticated punctuation semantics. Leading hidden count is unknown.
 */
const MOD=36,V=29,RHO=1/36;
function source(raw,m){
  const g=new Map(m.gp.runes.map((x,i)=>[x,i])),tape=[],before=[];let gap=false;
  for(const c of raw.transcription){
    if(g.has(c)){tape.push(g.get(c));before.push(gap);gap=false;}
    else if(!/[/\s%]/u.test(c)&&tape.length)gap=true;
  }
  const expected=m.gp.pages.flatMap(p=>p.indices);
  if(JSON.stringify(tape)!==JSON.stringify(expected))throw Error("transcription rune tape differs from corpus");
  const start=m.gp.pages.slice(0,15).reduce((s,p)=>s+p.indices.length,0)+20,
    end=m.gp.pages.slice(0,23).reduce((s,p)=>s+p.indices.length,0);
  const C=tape.slice(start,end),flags=before.slice(start,end);flags[0]=null;
  if(C.length!==1883)throw Error("original fixture drift");
  return {C,flags};
}
function flagsOf(events){
  const C=[],flags=[];let h=false;
  for(const e of events){if(!e.keep){h=true;continue;}C.push(e.c);flags.push(C.length===1?null:h);h=false;}
  return {C,flags};
}
function proposalModel(m){
  const P=Float64Array.from({length:MOD},(_,i)=>(i<m.pi.length?m.pi[i]:0)+.00032),z=P.reduce((a,b)=>a+b,0);for(let i=0;i<MOD;i++)P[i]/=z;
  const E=Array.from({length:MOD},(_,k)=>Float64Array.from({length:MOD},(_,c)=>P[(c-k+MOD)%MOD]));
  const U=Float64Array.from(E,row=>RHO+(1-RHO)*row.slice(V).reduce((a,b)=>a+b,0));
  return {E,U};
}
/** O(Nq) cyclic hidden closure, with independent geometric retry surrogate. */
function proposal(C,flags,K,m){
  const q=K.length,E=K.map(k=>m.E[k]),U=K.map(k=>m.U[k]),den=1-U.reduce((a,b)=>a*b,1),dr=1-RHO**q;
  let a=new Float64Array(q).fill(1/q),b=new Float64Array(q),LL=0;
  for(let t=0;t<C.length;t++){
    let u=0,r=0;for(let j=0;j<q;j++){u=a[j]+U[j]*u;r=a[j]+RHO*r;}
    u/=den;r/=dr;let z=0;
    for(let j=0;j<q;j++){
      const mass=t===0?u:flags[t]?Math.max(0,u-r):r;
      b[j]=mass*(1-RHO)*E[j][C[t]];z+=b[j];
      u=a[j]+U[j]*u;r=a[j]+RHO*r;
    }
    if(z<=0)return -Infinity;LL+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z;[a,b]=[b,a];
  }
  return LL/C.length;
}
function coordinate(C,flags,K,m,rng,steps=10){
  K=K.slice();let score=proposal(C,flags,K,m),calls=1;const hist=[];
  for(let sw=0;sw<steps;sw++){
    const order=Array.from({length:K.length},(_,i)=>i);for(let j=order.length-1;j>0;j--){const i=rng(j+1);[order[i],order[j]]=[order[j],order[i]];}
    let changes=0;
    for(const j of order){const old=K[j];let best=old;for(let k=0;k<MOD;k++){if(k===old)continue;K[j]=k;const v=proposal(C,flags,K,m);calls++;if(v>score+1e-10){score=v;best=k;}}K[j]=best;if(best!==old)changes++;}
    hist.push({score,changes});if(!changes)break;
  }
  return {K,score,calls,hist};
}
function exactMatrices(K,m,base){
  const g=base.graph(K,m),q=K.length,N=V*q,H=(MOD-V)*q,W=H+N;
  const G=g.G.map(row=>row.map(e=>({id:e.id,p:Math.exp(-e.base)})));
  const A=Array.from({length:H},(_,h)=>{
    const row=new Float64Array(W);row[h]=1;
    for(const e of G[N+h]){if(e.id<N)row[H+e.id]+=e.p;else row[e.id-N]-=e.p;}
    return row;
  });
  for(let k=0;k<H;k++){
    let pivot=k;for(let i=k+1;i<H;i++)if(Math.abs(A[i][k])>Math.abs(A[pivot][k]))pivot=i;
    if(Math.abs(A[pivot][k])<1e-12)throw Error("singular hidden closure");
    if(pivot!==k)[A[pivot],A[k]]=[A[k],A[pivot]];
    const row=A[k],v=row[k];for(let j=k;j<W;j++)row[j]/=v;
    for(let i=0;i<H;i++){if(i===k)continue;const dst=A[i],u=dst[k];if(u===0)continue;dst[k]=0;for(let j=k+1;j<W;j++)dst[j]-=u*row[j];}
  }
  const direct=Array.from({length:N},()=>new Float64Array(N)),hidden=Array.from({length:N},()=>new Float64Array(N));
  let massError=0;
  function fill(id,d,h){
    for(const e of G[id]){
      if(e.id<N)d[e.id]+=e.p;
      else{const row=A[e.id-N];for(let j=0;j<N;j++)h[j]+=e.p*row[H+j];}
    }
    if(G[id].length){const z=d.reduce((a,b)=>a+b,0)+h.reduce((a,b)=>a+b,0);massError=Math.max(massError,Math.abs(1-z));}
  }
  for(let i=0;i<N;i++)fill(i,direct[i],hidden[i]);
  // Initial phase s has no previous accepted ciphertext and no retry.
  const first=Array.from({length:q},(_,s)=>{
    const row=new Float64Array(N);
    for(let p=0;p<m.P;p++){
      const c=(p+K[s])%MOD,id=c*q+(s+1)%q,prior=m.pi[p];
      if(c<V)row[id]+=prior;else{const a=A[id-N];for(let j=0;j<N;j++)row[j]+=prior*a[H+j];}
    }
    massError=Math.max(massError,Math.abs(1-row.reduce((a,b)=>a+b,0)));return row;
  });
  if(massError>1e-8)throw Error("transition mass error");
  return {q,N,direct,hidden,first,massError};
}
function likelihood(C,flags,e,origin=0,cut=C.length){
  const {q,direct,hidden,first}=e;let a=new Float64Array(q),b=new Float64Array(q),z=0,LL=0,fit=0;
  for(let j=0;j<q;j++){a[j]=first[origin][C[0]*q+j];z+=a[j];}
  if(z<=0)return {fit:-Infinity,total:-Infinity,hold:null,failedAt:0};
  LL=Math.log(z);for(let j=0;j<q;j++)a[j]/=z;if(cut===1)fit=LL;
  for(let t=1;t<C.length;t++){
    b.fill(0);const M=flags[t]?hidden:direct,src=C[t-1]*q,dst=C[t]*q;
    for(let i=0;i<q;i++){const row=M[src+i],v=a[i];if(v===0)continue;for(let j=0;j<q;j++)b[j]+=v*row[dst+j];}
    z=b.reduce((a,b)=>a+b,0);if(z<=0)return {fit:t<cut?-Infinity:fit/cut,total:-Infinity,hold:t>=cut?-Infinity:null,failedAt:t};
    LL+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z;[a,b]=[b,a];if(t+1===cut)fit=LL;
  }
  return {fit:fit/cut,total:LL/C.length,hold:cut<C.length?(LL-fit)/(C.length-cut):null};
}
function canonical(K){return K.map((_,s)=>K.slice(s).concat(K.slice(0,s)).join(",")).sort()[0];}
function cyclicMatches(K,L){let best=0;for(let s=0;s<K.length;s++)best=Math.max(best,K.filter((v,i)=>v===L[(i+s)%L.length]).length);return best;}
function stats(flags){let n=0,pairs=0;for(let t=1;t<flags.length;t++){if(flags[t])n++;if(flags[t]&&flags[t-1])pairs++;}return {n,pairs,rate:n/(flags.length-1)};}
function experiment(raw,base,opt={}){
  const m=base.model(raw,"silent"),pm=proposalModel(m),q=opt.q||16,cut=1479,length=1883,starts=opt.starts||[17,3301,1033,761];
  let C,flags,truth=null,plant=null;
  if(opt.original){({C,flags}=source(raw,m));}
  else{
    const seed=opt.seed||20261128;if(starts.includes(seed))throw Error("plant seed collision");
    const r=base.rng(seed);truth=Array.from({length:q},()=>r(MOD));plant=base.sender(m.tests[opt.source||"gibran"].slice(opt.offset||5000),truth,m,length,seed^0x12345678);({C,flags}=flagsOf(plant.events));
  }
  const rows=[],candidates=[],seen=new Set(),f=C.slice(0,cut),g=flags.slice(0,cut);
  if(opt.key){rows.push({seed:null,K:opt.key,score:proposal(f,g,opt.key,pm)});}
  else for(const seed of starts){const r=base.rng(seed),K=Array.from({length:q},()=>r(MOD));rows.push({seed,...coordinate(f,g,K,pm,r,opt.steps||10)});}
  rows.sort((a,b)=>b.score-a.score);
  for(const row of rows){
    const id=canonical(row.K);if(seen.has(id)||new Set(row.K).size<2)continue;seen.add(id);
    const e=exactMatrices(row.K,m,base);
    for(let s=0;s<q;s++){const L=likelihood(f,g,e,s);candidates.push({K:row.K.slice(s).concat(row.K.slice(0,s)),seed:row.seed,origin:s,fit:L.fit,failedAt:L.failedAt??null,massError:e.massError});}
  }
  candidates.sort((a,b)=>b.fit-a.fit||b.failedAt-a.failedAt);
  const best=candidates[0],L=likelihood(C,flags,exactMatrices(best.K,m,base),0,cut),out={source:opt.original?"original p15 body–22":opt.source||"gibran",q,cut,length,stats:stats(flags),rows,candidates,best,likelihood:L};
  if(truth)out.truth={K:truth,cyclicMatches:cyclicMatches(best.K,truth),proposal:proposal(f,g,truth,pm),likelihood:likelihood(C,flags,exactMatrices(truth,m,base),0,cut)};
  if(opt.original){out.C=C;out.flags=flags;}
  return out;
}
if(typeof module!=="undefined")module.exports={source,flagsOf,proposalModel,proposal,coordinate,exactMatrices,likelihood,cyclicMatches,stats,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),opt=process.argv.find(x=>x.startsWith("--options="));
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),transcription:read("resources/transcriptions/lp2-image-corrected.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
 console.log(JSON.stringify(experiment(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),opt?JSON.parse(fs.readFileSync(opt.slice(10),"utf8")):{}),null,2));
}
