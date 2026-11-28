"use strict";
/**
 * Soft-key phase EM for GP29 independent deletion (proposal model).
 * Key coordinate distributions are relaxed to mixtures of GP29 shifts.
 * Geometric deletion phase transitions are marginalized in O(Nq).
 * Anneal to point masses, then refine discrete key candidates.
 * Strict retry dependence omitted; calibrate blind recovery before original use.
 */
const A=29,D=.187,KEEP=1-D,mod=x=>(x%A+A)%A;
function emission(pi){return Array.from({length:A},(_,k)=>Float64Array.from({length:A},(_,c)=>pi[mod(c-k)]));}
function mixed(W,E){return W.map(w=>Float64Array.from({length:A},(_,c)=>w.reduce((a,v,k)=>a+v*E[k][c],0)));}
function forward(C,E,stats=false){
  const q=E.length,n=C.length,den=1-D**q,F=new Float64Array(n*q),Z=new Float64Array(n);
  let z=0,LL=0;for(let j=0;j<q;j++){F[j]=E[j][C[0]]/q;z+=F[j];}Z[0]=z;LL=Math.log(z);for(let j=0;j<q;j++)F[j]/=z;
  for(let t=1;t<n;t++){const p=(t-1)*q,v=t*q;let r=0;for(let j=0;j<q;j++)r=KEEP*F[p+j]+D*r;r/=den;z=0;const c=C[t];
    for(let j=0;j<q;j++){const a=r*E[j][c];F[v+j]=a;z+=a;r=KEEP*F[p+j]+D*r;}
    Z[t]=z;LL+=Math.log(z);for(let j=0;j<q;j++)F[v+j]/=z;
  }
  if(!stats)return LL/n;
  const counts=Array.from({length:q},()=>new Float64Array(A));let b=new Float64Array(q).fill(1),prev=new Float64Array(q),v=new Float64Array(q);
  for(let t=n-1;t>=0;t--){const c=C[t];for(let j=0;j<q;j++)counts[j][c]+=F[t*q+j]*b[j];if(!t)break;
    for(let j=0;j<q;j++)v[j]=E[j][c]*b[j];let r=0;for(let j=q-1;j>=0;j--)r=KEEP*v[j]+D*r;r/=den;
    for(let j=q-1;j>=0;j--){prev[j]=r/Z[t];r=KEEP*v[j]+D*r;}[b,prev]=[prev,b];
  }
  return {score:LL/n,counts};
}
function normalize(w){const z=w.reduce((a,b)=>a+b,0);for(let k=0;k<w.length;k++)w[k]/=z;return w;}
function softFit(C,q,E,rng,steps=100){
  let W=Array.from({length:q},()=>normalize(Float64Array.from({length:A},()=>.05-Math.log((rng(1000000)+1)/1000001))));
  const history=[];
  for(let t=0;t<steps;t++){
    const M=mixed(W,E),z=forward(C,M,true);
    const power=1+Math.max(0,(t/steps-.25))*.50;
    for(let j=0;j<q;j++){const w=W[j],counts=z.counts[j],a=new Float64Array(A);
      for(let k=0;k<A;k++){let r=0;for(let c=0;c<A;c++)r+=counts[c]*E[k][c]/M[j][c];a[k]=Math.pow(Math.max(1e-15,w[k]*r),power);}
      W[j]=normalize(a);
    }
    if(t%10===0||t===steps-1)history.push({step:t,score:z.score,meanMax:W.reduce((a,w)=>a+Math.max(...w),0)/q});
  }
  const K=W.map(w=>{let k=0;for(let i=1;i<A;i++)if(w[i]>w[k])k=i;return k;});
  return {K,score:forward(C,K.map(k=>E[k])),history,W:W.map(x=>Array.from(x))};
}
function refine(C,K,E,rng,sweeps=8){
  K=K.slice();let value=forward(C,K.map(k=>E[k])),calls=1;
  for(let sw=0;sw<sweeps;sw++){
    const order=Array.from({length:K.length},(_,i)=>i);for(let i=order.length-1;i>0;i--){const j=rng(i+1);[order[i],order[j]]=[order[j],order[i]];}
    let changes=0;
    for(const j of order){const old=K[j];let best=old;for(let k=0;k<A;k++){if(k===old)continue;K[j]=k;const v=forward(C,K.map(k=>E[k]));calls++;if(v>value+1e-10){value=v;best=k;}}K[j]=best;if(best!==old)changes++;}
    if(!changes)break;
  }
  return {K,score:value,calls};
}
function cyclicMatches(K,L){let best=0;for(let s=0;s<K.length;s++)best=Math.max(best,K.filter((v,i)=>v===L[(i+s)%L.length]).length);return best;}
function experiment(raw,base,opt={}){
  const q=opt.q||16,m=base.model(raw,"delete"),E=emission(m.pi),seed=opt.seed||20261128,r=base.rng(seed),K=Array.from({length:q},()=>r(A)),cut=opt.cut||1479,length=opt.length||1883;
  const name=opt.source||"gibran",plant=base.sender(m.tests[name].slice(opt.offset||5000),K,m,length,seed^0x12345678),C=plant.C.slice(0,cut),rows=[];
  const starts=opt.starts||[17,3301,1033,761];if(starts.includes(seed))throw Error("plant seed collides with initialization");
  for(const s of starts){const g=base.rng(s),z=softFit(C,q,E,g,opt.steps||100),a=refine(C,z.K,E,g,opt.sweeps||8);rows.push({seed:s,softKey:z.K,softScore:z.score,history:z.history,...a,matches:cyclicMatches(a.K,K),hold:(forward(plant.C,a.K.map(k=>E[k]))*length-a.score*cut)/(length-cut)});}
  rows.sort((a,b)=>b.score-a.score);
  return {source:name,q,cut,length,truth:K,trueScore:forward(C,K.map(k=>E[k])),rows};
}
if(typeof module!=="undefined")module.exports={emission,forward,softFit,refine,cyclicMatches,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),opt=process.argv.find(x=>x.startsWith("--options="));
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
 console.log(JSON.stringify(experiment(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),opt?JSON.parse(fs.readFileSync(opt.slice(10),"utf8")):{}),null,2));
}
