"use strict";
/**
 * Blind periodic key inference for the mod36 silent-output channel.
 * Search uses a soft iid deletion HMM with O(qN) exact phase marginalization
 * (the search surrogate omits strict-repeat retries). Reranking uses the
 * exact strict-repeat transducer with a first-order native GP language law,
 * summing any number of silent emissions via absorbing-chain elimination.
 * Neither model is an authenticated LP2 cipher.
 */
const MOD=36, VISIBLE=29, PLAIN=30;
const mod=x=>((x%MOD)+MOD)%MOD;
/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%n;};
}
/** @param {string} text @param {string[]} labels */
function words(text,labels){
  const tok=labels.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const out=[];
    for(let j=0;j<w.length;){
      const t=w.startsWith("ING",j)?{s:"ING",i:21}:w.startsWith("IO",j)?{s:"IO",i:27}:tok.find(x=>w.startsWith(x.s,j));
      if(!t)throw Error("unmapped word "+w);
      out.push(t.i);j+=t.s.length;
    }
    out.push(29);return out;
  });
}
/** @param {{gp:string,shakespeare:string,gibran:string,emerson:string}} raw */
function model(raw){
  const gp=JSON.parse(raw.gp), names=["shakespeare","gibran","emerson"];
  const W=Object.fromEntries(names.map(n=>[n,words(raw[n],gp.translit)]));
  const U=new Float64Array(PLAIN),B=Array.from({length:PLAIN},()=>new Float64Array(PLAIN));
  const tests={};
  for(const name of names){
    const w=W[name],cut=Math.floor(.57*w.length);
    let prev=-1;
    for(const group of w.slice(0,cut))for(const p of group){
      U[p]++;if(prev>=0)B[prev][p]++;prev=p;
    }
    tests[name]=w.slice(cut).flat();
  }
  const sum=U.reduce((a,b)=>a+b,0);
  const pi=Float64Array.from(U,x=>(x+.3)/(sum+PLAIN*.3));
  for(const row of B){
    const n=row.reduce((a,b)=>a+b,0);
    for(let p=0;p<PLAIN;p++)row[p]=(row[p]+12*pi[p])/(n+12);
  }
  // Smoothing is a search surrogate only, not a physical extension.
  const soft=Array.from({length:MOD},(_,p)=>(p<PLAIN?U[p]:0)+120);
  const Z=soft.reduce((a,b)=>a+b,0);
  const E=Array.from({length:MOD},(_,k)=>Float64Array.from({length:MOD},(_,c)=>soft[mod(c-k)]/Z));
  const H=Float64Array.from(E,row=>row.slice(VISIBLE).reduce((a,b)=>a+b,0));
  return {gp,pi,B,E,H,tests};
}
/**
 * Exact likelihood for the simplified iid model, integrating all invisible
 * phase runs with a geometric series. Returned total log probability.
 * @param {number[]} C @param {number[]} K @param {{E:Float64Array[],H:Float64Array}} m
 */
function surrogate(C,K,m){
  const q=K.length, E=K.map(k=>m.E[k]),H=Float64Array.from(K,k=>m.H[k]);
  const den=1-H.reduce((a,b)=>a*b,1);
  let a=new Float64Array(q),b=new Float64Array(q),z=1/den,sum=0,LL=0;
  for(let j=0;j<q;j++){a[j]=z*E[j][C[0]];sum+=a[j];z*=H[j];}
  LL=Math.log(sum);for(let j=0;j<q;j++)a[j]/=sum;
  for(let t=1;t<C.length;t++){
    let r=0;
    for(let j=0;j<q;j++)r=a[j]+H[j]*r;
    r/=den;sum=0;const c=C[t];
    for(let j=0;j<q;j++){const v=r*E[j][c];b[j]=v;sum+=v;r=a[j]+H[j]*r;}
    LL+=Math.log(sum);for(let j=0;j<q;j++)b[j]/=sum;
    const tmp=a;a=b;b=tmp;
  }
  return LL;
}
/** @param {number[]} C @param {number[]} initial @param {object} m */
function coordinate(C,initial,m,seed,sweeps=8){
  const random=rng(seed);let K=initial.slice(),v=surrogate(C,K,m),calls=1;
  const history=[];
  for(let sw=0;sw<sweeps;sw++){
    const order=Array.from({length:K.length},(_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=random(i+1);[order[i],order[j]]=[order[j],order[i]];}
    let changes=0;
    for(const j of order){
      let best=K[j],old=best;
      for(let k=0;k<MOD;k++){
        if(k===old)continue;
        K[j]=k;const val=surrogate(C,K,m);calls++;
        if(val>v+1e-10){v=val;best=k;}
      }
      K[j]=best;if(best!==old)changes++;
    }
    history.push({score:v/C.length,changes});
    if(!changes)break;
  }
  return {K,score:v/C.length,calls,history};
}
/** @param {number[]} K @param {number[]} L */
function cyclicMatches(K,L){
  let best=0;
  for(let s=0;s<K.length;s++)best=Math.max(best,K.filter((v,i)=>v===L[(i+s)%K.length]).length);
  return best;
}
/** @param {number[]} P @param {number[]} K @param {number} [limit] */
function sender(P,K,limit=Infinity){
  if(new Set(K).size<2)throw Error("strict-repeat sender requires varying cycle");
  let j=0,prev=-1;const events=[],C=[];
  for(const p of P){
    while(mod(p+K[j%K.length])===prev)j++;
    const c=mod(p+K[j%K.length]);
    events.push({p,c,j});j++;prev=c;
    if(c<VISIBLE){C.push(c);if(C.length===limit)break;}
  }
  return {C,events,retained:events.filter(x=>x.c<VISIBLE&&x.p<VISIBLE).map(x=>x.p)};
}
/**
 * Sum all strict-repeat retries and silent outputs for a Markov plaintext
 * law. State (previous emitted c,next key phase), so previous plaintext
 * is fixed by c and the preceding key. Eliminate hidden states exactly
 * over real arithmetic with partial-pivot Gaussian elimination.
 * @param {number[]} C @param {number[]} K @param {object} m
 * @param {number} cut
 */
function exact(C,K,m,cut=C.length){
  const q=K.length,N=VISIBLE*q,H=(MOD-VISIBLE)*q,W=H+N;
  if(new Set(K).size<2)return {total:-Infinity,fit:-Infinity,hold:null};
  const edges=(prev,a)=>{
    let prior=m.pi;
    if(prev>=0){
      const p0=mod(prev-K[(a+q-1)%q]);
      if(p0>=PLAIN)return [];
      prior=m.B[p0];
    }
    const map=new Map();
    for(let p=0;p<PLAIN;p++){
      let s=a,c=mod(p+K[s]),step=0;
      while(c===prev&&step<q){s=(s+1)%q;c=mod(p+K[s]);step++;}
      if(step===q)continue;
      const id=c*q+(s+1)%q;
      map.set(id,(map.get(id)||0)+prior[p]);
    }
    return [...map.entries()];
  };
  // Hidden row states have global ids N..N+H-1.
  const A=Array.from({length:H},(_,h)=>{
    const row=new Float64Array(W);row[h]=1;
    const global=N+h;
    for(const [id,p] of edges(Math.floor(global/q),global%q)){
      if(id<N)row[H+id]+=p;else row[id-N]-=p;
    }
    return row;
  });
  for(let k=0;k<H;k++){
    let piv=k;
    for(let i=k+1;i<H;i++)if(Math.abs(A[i][k])>Math.abs(A[piv][k]))piv=i;
    if(Math.abs(A[piv][k])<1e-12)throw Error("nonabsorbing/singular hidden chain");
    if(piv!==k)[A[piv],A[k]]=[A[k],A[piv]];
    const r=A[k],v=r[k];for(let j=k;j<W;j++)r[j]/=v;
    for(let i=0;i<H;i++){
      if(i===k)continue;
      const row=A[i],u=row[k];if(u===0)continue;
      row[k]=0;for(let j=k+1;j<W;j++)row[j]-=u*r[j];
    }
  }
  const absorb=(prev,phase)=>{
    const out=new Float64Array(N);
    for(const [id,p] of edges(prev,phase)){
      if(id<N)out[id]+=p;
      else{
        const row=A[id-N];
        for(let i=0;i<N;i++)out[i]+=p*row[H+i];
      }
    }
    return out;
  };
  const M=Array.from({length:N},(_,i)=>absorb(Math.floor(i/q),i%q));
  const first=absorb(-1,0);
  let maxMassError=Math.abs(1-first.reduce((a,b)=>a+b,0));
  for(let i=0;i<N;i++){
    if(mod(Math.floor(i/q)-K[(i%q+q-1)%q])>=PLAIN)continue;
    maxMassError=Math.max(maxMassError,Math.abs(1-M[i].reduce((a,b)=>a+b,0)));
  }
  if(maxMassError>1e-8)throw Error("transition mass error "+maxMassError);
  let a=new Float64Array(q),b=new Float64Array(q),sum=0,LL=0,fit=0;
  for(let j=0;j<q;j++){a[j]=first[C[0]*q+j];sum+=a[j];}
  if(sum<=0)return {total:-Infinity,fit:-Infinity,hold:null,maxMassError};
  LL=Math.log(sum);for(let j=0;j<q;j++)a[j]/=sum;
  if(cut===1)fit=LL;
  for(let t=1;t<C.length;t++){
    b.fill(0);const prev=C[t-1]*q,dst=C[t]*q;
    for(let i=0;i<q;i++){
      const w=a[i],row=M[prev+i];if(w===0)continue;
      for(let j=0;j<q;j++)b[j]+=w*row[dst+j];
    }
    sum=b.reduce((x,y)=>x+y,0);
    if(sum<=0)return {total:-Infinity,fit:-Infinity,hold:null,maxMassError,failed:t};
    LL+=Math.log(sum);for(let j=0;j<q;j++)b[j]/=sum;
    const tmp=a;a=b;b=tmp;
    if(t+1===cut)fit=LL;
  }
  if(cut===C.length)fit=LL;
  return {total:LL/C.length,fit:fit/cut,hold:cut<C.length?(LL-fit)/(C.length-cut):null,maxMassError};
}
/** @param {number[]} C @param {number} q @param {number} cut @param {object} m */
function search(C,q,cut,m,{seeds=[17,3301,1033,761],sweeps=8}={}){
  const fit=C.slice(0,cut),rows=[];
  for(const seed of seeds){
    const r=rng(seed),initial=Array.from({length:q},()=>r(MOD));
    const z=coordinate(fit,initial,m,seed^0x9e3779b9,sweeps);
    rows.push({seed,initial,...z});
  }
  rows.sort((a,b)=>b.score-a.score);
  return rows;
}
function lcs(a,b){
  let x=new Uint16Array(b.length+1),y=new Uint16Array(b.length+1);
  for(const p of a){
    y.fill(0);for(let i=0;i<b.length;i++)y[i+1]=p===b[i]?x[i]+1:Math.max(y[i],x[i+1]);
    const t=x;x=y;y=t;
  }
  return x[b.length]/Math.max(a.length,b.length);
}
/** Instrument an exact-channel beam to expose all events, not merely retained runes. */
function instrument(source){
  const edits=[
    ["path: flag?{p,prev:z.path}:z.path","path:{p,c:newC,j,visible:flag,prev:z.path}"],
    ["const z=states[0],P=[];\n    for(let q=z.path;q;q=q.prev)P.push(q.p);\n    P.reverse();","const z=states[0],P=[],full=[],events=[];\n    for(let q=z.path;q;q=q.prev){if(q.visible)P.push(q.p);full.push(q.p);events.push({p:q.p,c:q.c,j:q.j});}\n    P.reverse();full.reverse();events.reverse();"],
    ["return {P,score:z.score/C.length,keyLast:z.j,explored,","return {P,full,events,score:z.score/C.length,keyLast:z.j,explored,"],
    ["indices:a.P,runes:a.P.map(p=>gp.runes[p]).join(\"\"),","indices:a.P,full:a.full,events:a.events,runes:a.P.map(p=>gp.runes[p]).join(\"\"),"]
  ];
  for(const [a,b] of edits){if(source.split(a).length!==2)throw Error("upstream anchor changed: "+a.slice(0,80));source=source.replace(a,b);}
  return new Function("module",source+"\nreturn experiment;")({exports:{}});
}
function decode(raw,source,C,K,beam=400){
  const exp=instrument(source),key=Array.from({length:Math.ceil(C.length*3+500)},(_,i)=>K[i%K.length]);
  const z=exp(raw,{beam,maxHidden:3,decodeInput:{cipher:C,key}});
  if(!z.full)return z;
  const replay=sender(z.full,K);
  if(JSON.stringify(replay.C)!==JSON.stringify(C)||JSON.stringify(replay.events)!==JSON.stringify(z.events))throw Error("decoded path fails strict forward replay");
  return {...z,replay:true};
}
/**
 * Frozen matched-length opening of p15 section. Fit p15 black body–p20
 * (1479 visible), predict p21–22 (404), total1883.
 */
function experiment(raw,source,options={}){
  const m=model(raw),q=options.q||16,cut=1479,n=1883;
  const name=options.source||"gibran",keySeed=options.keySeed||20261128;
  let C,plant=null,Ktruth=null;
  if(options.original){
    C=m.gp.pages[15].indices.slice(20).concat(m.gp.pages.slice(16,23).flatMap(p=>p.indices));
  }else{
    const r=rng(keySeed);
    Ktruth=Array.from({length:q},()=>r(MOD));
    plant=sender(m.tests[name].slice(options.offset||5000),Ktruth,n);C=plant.C;
  }
  if(C.length!==n)throw Error("fixture length "+C.length);
  const rows=search(C,q,cut,m,options);
  // All key rotations are possible search outputs. Rerank the unique
  // cycles/rotations by fit-only exact Markov log likelihood.
  const seen=new Set(),candidates=[];
  for(const row of rows)for(let s=0;s<q;s++){
    const K=row.K.slice(s).concat(row.K.slice(0,s)),id=K.join(",");
    if(seen.has(id))continue;seen.add(id);
    const a=exact(C.slice(0,cut),K,m);
    candidates.push({K,exactFit:a.fit,seed:row.seed,rotation:s});
  }
  candidates.sort((a,b)=>b.exactFit-a.exactFit);
  const best=candidates[0],likelihood=exact(C,best.K,m,cut);
  const z=options.noDecode?null:decode(raw,source,C,best.K,options.beam||400);
  const truth=plant?{key:Ktruth,exact:exact(C,Ktruth,m,cut),cyclicMatches:cyclicMatches(Ktruth,best.K),retainedLCS:z?.indices?lcs(z.indices,plant.retained):null,fullLCS:z?.full?lcs(z.full,plant.events.map(x=>x.p)):null}:null;
  const result={q,cut,n,source:options.original?"original p15 body through p22":name,seed:options.original?null:keySeed,rows,candidates,best,likelihood,truth,decode:z?{status:z.status,score:z.score,clock:z.lastConsumedKeyIndex,replay:z.replay,retained:z.indices,full:z.full,events:z.events}:null};
  return result;
}
if(typeof module!=="undefined")module.exports={rng,words,model,surrogate,coordinate,cyclicMatches,sender,exact,search,lcs,instrument,decode,experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
  const src=read("sims/lp2_alt36_silent_exact_latent_viterbi_sft.cjs");
  const arg=process.argv.find(x=>x.startsWith("--options="));
  const options=arg?JSON.parse(fs.readFileSync(arg.slice(10),"utf8")):{};
  console.log(JSON.stringify(experiment(raw,src,options),null,2));
}
