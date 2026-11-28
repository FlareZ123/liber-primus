"use strict";
/**
 * Blind periodic GP29 deletion key recovery, soft-phase proposals followed
 * by strict-channel native Markov marginal likelihood. All hidden paths
 * summed by a geometric matrix series with explicit row-mass tail bound.
 * Held original split is fixed, no manuscript tuning.
 */
const D=.187,KEEP=1-D,A=29;
function effective(K,m,base,tol=1e-14){
  const {G,q,N}=base.graph(K,m);
  const edges=G.slice(0,N).map(row=>row.map(e=>({id:e.id,p:Math.exp(-e.base)})));
  let power=new Float64Array(N*N),next=new Float64Array(N*N),M=new Float64Array(N*N);
  for(let i=0;i<N;i++)for(const e of edges[i])power[i*N+e.id]+=e.p;
  let w=KEEP,n=1;
  for(;;){
    for(let i=0;i<M.length;i++)M[i]+=w*power[i];
    if(D**n<tol)break;
    next.fill(0);
    for(let i=0;i<N;i++){
      const off=i*N;
      for(const e of edges[i]){
        const src=e.id*N,p=e.p;
        for(let j=0;j<N;j++)next[off+j]+=p*power[src+j];
      }
    }
    [power,next]=[next,power];w*=D;n++;
  }
  let massError=0;
  for(let i=0;i<N;i++){let z=0;for(let j=0;j<N;j++)z+=M[i*N+j];massError=Math.max(massError,Math.abs(z-1));}
  if(massError>tol*3+1e-10)throw Error("bad effective row mass "+massError);
  return {K,m,q,N,M,terms:n,tailBound:D**n,massError};
}
function initial(e,origin){
  const {K,m,q,N,M}=e,z=new Float64Array(N);
  for(let p=0;p<A;p++){
    const c=(p+K[origin])%A,id=c*q+(origin+1)%q,prior=m.pi[p];
    z[id]+=KEEP*prior;
    for(let j=0;j<N;j++)z[j]+=D*prior*M[id*N+j];
  }
  return z;
}
function likelihood(C,e,origin=0,cut=C.length){
  const {q,N,M}=e,first=initial(e,origin);
  let a=new Float64Array(q),b=new Float64Array(q),z=0,LL=0,fit=0;
  for(let j=0;j<q;j++){a[j]=first[C[0]*q+j];z+=a[j];}
  if(z<=0)return {total:-Infinity,fit:-Infinity,hold:null};
  LL=Math.log(z);for(let j=0;j<q;j++)a[j]/=z;if(cut===1)fit=LL;
  for(let t=1;t<C.length;t++){
    b.fill(0);const src=C[t-1]*q,dst=C[t]*q;
    for(let i=0;i<q;i++){const off=(src+i)*N+dst,v=a[i];for(let j=0;j<q;j++)b[j]+=v*M[off+j];}
    z=b.reduce((a,b)=>a+b,0);if(z<=0)return {total:-Infinity,fit:-Infinity,hold:null,failedAt:t};
    LL+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z;[a,b]=[b,a];if(t+1===cut)fit=LL;
  }
  return {total:LL/C.length,fit:fit/cut,hold:cut<C.length?(LL-fit)/(C.length-cut):null};
}
function canonical(K){return K.map((_,s)=>K.slice(s).concat(K.slice(0,s)).join(",")).sort()[0];}
function fitKeys(C,q,m,base,soft,opt={}){
  const E=soft.emission(m.pi),starts=opt.starts||[17,3301,1033,761],rows=[];
  for(const seed of starts){
    const r=base.rng(seed),z=soft.softFit(C,q,E,r,opt.steps||100),a=soft.refine(C,z.K,E,r,opt.sweeps||8);
    rows.push({seed,softKey:z.K,softScore:z.score,K:a.K,score:a.score,calls:a.calls});
  }
  return rows.sort((a,b)=>b.score-a.score);
}
function select(C,rows,m,base){
  const seen=new Set(),candidates=[];
  for(const row of rows){
    const id=canonical(row.K);if(seen.has(id))continue;seen.add(id);
    if(new Set(row.K).size<2)continue;
    const e=effective(row.K,m,base);
    for(let s=0;s<row.K.length;s++){
      const L=likelihood(C,e,s),K=row.K.slice(s).concat(row.K.slice(0,s));
      candidates.push({K,fit:L.fit,origin:s,seed:row.seed,terms:e.terms,tailBound:e.tailBound,massError:e.massError});
    }
  }
  candidates.sort((a,b)=>b.fit-a.fit);return candidates;
}
function split(events,cut){let n=0,i=0;for(;i<events.length;i++)if(events[i].keep&&++n===cut){i++;break;}if(n!==cut)throw Error("cut missing");return [events.slice(0,i),events.slice(i)];}
function experiment(raw,base,soft,opt={}){
  const m=base.model(raw,"delete"),q=opt.q||16,cut=1479,length=1883,starts=opt.starts||[17,3301,1033,761];
  let C,plant=null,truth=null;
  if(opt.original){C=m.gp.pages[15].indices.slice(20).concat(m.gp.pages.slice(16,23).flatMap(p=>p.indices));}
  else{
    const seed=opt.seed||20261128;if(starts.includes(seed))throw Error("plant initializer overlap");
    const r=base.rng(seed);truth=Array.from({length:q},()=>r(A));plant=base.sender(m.tests[opt.source||"gibran"].slice(opt.offset||5000),truth,m,length,seed^0x12345678);C=plant.C;
  }
  if(C.length!==length)throw Error("fixture length");
  const fit=C.slice(0,cut),rows=fitKeys(fit,q,m,base,soft,opt),candidates=select(fit,rows,m,base),best=candidates[0];
  const e=effective(best.K,m,base),L=likelihood(C,e,0,cut),z=base.decode(C,best.K,m);
  const out={source:opt.original?"original p15 body–22":opt.source||"gibran",q,cut,length,rows,candidates,best,likelihood:L,decode:z};
  if(plant){
    const [,te]=split(plant.events,cut),[,de]=split(z.events,cut),ret=a=>a.filter(x=>x.keep).map(x=>x.p),full=a=>a.map(x=>x.p);
    out.truth={K:truth,cyclicMatches:soft.cyclicMatches(best.K,truth),likelihood:likelihood(C,effective(truth,m,base),0,cut),fullLCS:base.lcs(z.full,plant.full),retainedLCS:base.lcs(z.retained,plant.retained),holdFullLCS:base.lcs(full(de),full(te)),holdRetainedLCS:base.lcs(ret(de),ret(te))};
  }
  return out;
}
if(typeof module!=="undefined")module.exports={effective,initial,likelihood,fitKeys,select,split,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),opt=process.argv.find(x=>x.startsWith("--options="));
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
 console.log(JSON.stringify(experiment(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),require("./lp2_alt29_delete_soft_phase_em_sft.cjs"),opt?JSON.parse(fs.readFileSync(opt.slice(10),"utf8")):{}),null,2));
}
