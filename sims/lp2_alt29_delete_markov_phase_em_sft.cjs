"use strict";
/**
 * Blind GP29 deletion-channel key recovery by a Markov phase EM surrogate.
 * Unlike iid phase proposals, integrate the plaintext Markov transition
 * over all geometric deletion gaps of each residue class, then optimize
 * cyclic shifted key emissions by expected transition statistics.
 * Strict retry dependence is deliberately omitted in this proposal model.
 */
const A=29,D=.187,KEEP=1-D,mod=x=>(x%A+A)%A;
function matMul(a,b){const c=new Float64Array(A*A);for(let i=0;i<A;i++)for(let k=0;k<A;k++){const v=a[i*A+k];for(let j=0;j<A;j++)c[i*A+j]+=v*b[k*A+j];}return c;}
function kernel(B,q){
  const b=Float64Array.from(B.flatMap(row=>Array.from(row))),T=Array.from({length:q},()=>new Float64Array(A*A));
  let M=b,w=KEEP,n=1;
  while(w>1e-17){const dst=T[n%q];for(let i=0;i<dst.length;i++)dst[i]+=w*M[i];M=matMul(M,b);w*=D;n++;}
  const logs=T.map(x=>Float64Array.from(x,v=>Math.log(v)));
  return {q,T,logs,tail:D**(n-1)};
}
function forward(C,K,m,ker,wantCounts=false){
  const q=K.length,n=C.length,{T}=ker,P=new Uint8Array(n*q),F=new Float64Array(n*q),Z=new Float64Array(n);
  for(let t=0;t<n;t++)for(let j=0;j<q;j++)P[t*q+j]=mod(C[t]-K[j]);
  let norm=0,LL=0;
  for(let j=0;j<q;j++){F[j]=m.pi[P[j]]/q;norm+=F[j];}Z[0]=norm;LL=Math.log(norm);for(let j=0;j<q;j++)F[j]/=norm;
  for(let t=1;t<n;t++){
    const v=t*q,u=v-q;norm=0;
    for(let i=0;i<q;i++){const a=F[u+i],p=P[u+i]*A;for(let j=0;j<q;j++)F[v+j]+=a*T[(j-i+q)%q][p+P[v+j]];}
    for(let j=0;j<q;j++)norm+=F[v+j];Z[t]=norm;LL+=Math.log(norm);
    for(let j=0;j<q;j++)F[v+j]/=norm;
  }
  if(!wantCounts)return LL/n;
  const counts=Array.from({length:q*q},()=>new Float64Array(A*A));
  let beta=new Float64Array(q).fill(1),prev=new Float64Array(q);
  for(let t=n-1;t>0;t--){
    const v=t*q,u=v-q,cp=C[t-1]*A+C[t];prev.fill(0);
    for(let i=0;i<q;i++){const p=P[u+i]*A;
      for(let j=0;j<q;j++){
        const x=T[(j-i+q)%q][p+P[v+j]]*beta[j]/Z[t];
        prev[i]+=x;counts[i*q+j][cp]+=F[u+i]*x;
      }
    }
    [beta,prev]=[prev,beta];
  }
  const init=Float64Array.from(beta,(v,j)=>v*F[j]);
  return {LL:LL/n,counts,init};
}
const SHIFT=Array.from({length:A},(_,k)=>Uint8Array.from({length:A},(_,c)=>mod(c-k)));
function mstep(C,K,m,ker,stats,order){
  K=K.slice();const q=K.length,entries=stats.counts.map(arr=>{
    const cp=[],c=[],v=[];for(let i=0;i<arr.length;i++)if(arr[i]>1e-12){cp.push(Math.floor(i/A));c.push(i%A);v.push(arr[i]);}
    return {cp:Uint8Array.from(cp),c:Uint8Array.from(c),v:Float64Array.from(v)};
  });
  const logPi=Float64Array.from(m.pi,v=>Math.log(v));let changed=0;
  for(const j of order){
    const vals=new Float64Array(A);
    for(let k=0;k<A;k++)vals[k]=stats.init[j]*logPi[SHIFT[k][C[0]]];
    for(let i=0;i<q;i++){
      if(i===j){const {cp,c,v}=entries[j*q+j],L=ker.logs[0];
        for(let k=0;k<A;k++){const sk=SHIFT[k];let z=0;for(let x=0;x<v.length;x++)z+=v[x]*L[sk[cp[x]]*A+sk[c[x]]];vals[k]+=z;}continue;}
      const left=entries[i*q+j],right=entries[j*q+i],Li=ker.logs[(j-i+q)%q],Lo=ker.logs[(i-j+q)%q],si=SHIFT[K[i]];
      for(let k=0;k<A;k++){
        const sk=SHIFT[k];let z=0;
        for(let x=0;x<left.v.length;x++)z+=left.v[x]*Li[si[left.cp[x]]*A+sk[left.c[x]]];
        for(let x=0;x<right.v.length;x++)z+=right.v[x]*Lo[sk[right.cp[x]]*A+si[right.c[x]]];
        vals[k]+=z;
      }
    }
    let best=K[j];for(let k=0;k<A;k++)if(vals[k]>vals[best]+1e-10)best=k;
    if(best!==K[j]){K[j]=best;changed++;}
  }
  return {K,changed};
}
function fit(C,initial,m,ker,rng,steps=24){
  let K=initial.slice();const history=[];
  for(let t=0;t<steps;t++){
    const z=forward(C,K,m,ker,true),order=Array.from({length:K.length},(_,i)=>i);
    for(let j=order.length-1;j>0;j--){const i=rng(j+1);[order[i],order[j]]=[order[j],order[i]];}
    const a=mstep(C,K,m,ker,z,order);history.push({score:z.LL,changes:a.changed});
    K=a.K;if(!a.changed)break;
  }
  return {K,score:forward(C,K,m,ker),history};
}
function cyclicMatches(K,L){let best=0;for(let s=0;s<K.length;s++)best=Math.max(best,K.filter((v,i)=>v===L[(i+s)%L.length]).length);return best;}
function experiment(raw,base,opt={}){
  const q=opt.q||16,m=base.model(raw,"delete"),ker=kernel(m.B,q),seed=opt.seed||20261128,r=base.rng(seed),K=Array.from({length:q},()=>r(A)),cut=opt.cut||1479,length=opt.length||1883;
  const name=opt.source||"gibran",plant=base.sender(m.tests[name].slice(opt.offset||5000),K,m,length,seed^0x12345678),C=plant.C.slice(0,cut);
  const starts=opt.starts||[17,3301,1033,761],rows=[];
  if(starts.includes(seed))throw Error("plant seed collides with initialization");
  for(const s of starts){
    const g=base.rng(s),init=Array.from({length:q},()=>g(A)),a=fit(C,init,m,ker,g,opt.steps||24);
    rows.push({seed:s,initial:init,...a,matches:cyclicMatches(a.K,K),hold:(forward(plant.C,a.K,m,ker)*length-a.score*cut)/(length-cut)});
  }
  rows.sort((a,b)=>b.score-a.score);
  return {source:name,q,cut,length,truth:K,trueScore:forward(C,K,m,ker),tailBound:ker.tail,rows};
}
if(typeof module!=="undefined")module.exports={kernel,forward,mstep,fit,cyclicMatches,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),opt=process.argv.find(x=>x.startsWith("--options="));
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
 console.log(JSON.stringify(experiment(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),opt?JSON.parse(fs.readFileSync(opt.slice(10),"utf8")):{}),null,2));
}
