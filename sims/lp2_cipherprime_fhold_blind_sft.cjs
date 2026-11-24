"use strict";
// Deterministic read-only native-GP blind key and latent F-clock recovery.
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function experiment(corpus,gold){
  const primes=corpus.prime, rune=new Map(corpus.runes.map((r,i)=>[r,i]));
  const native=gold.sections.map(s=>Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x)));
  const mod=(n,m)=>(n%m+m)%m;
  const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
  const render=P=>P.map(x=>corpus.translit[x]).join("");
  function model(exclude){
    const u=new Float64Array(29),b=new Float64Array(841),bt=new Float64Array(29),t=new Float64Array(24389),tt=new Float64Array(841);
    let n=0;
    for(let s=0;s<native.length;s++){
      if(exclude.includes(s))continue;
      const P=native[s];n+=P.length;
      for(let i=0;i<P.length;i++){
        u[P[i]]++;
        if(i>0){b[P[i-1]*29+P[i]]++;bt[P[i-1]]++;}
        if(i>1){const j=P[i-2]*29+P[i-1];t[j*29+P[i]]++;tt[j]++;}
      }
    }
    const up=Array.from(u,x=>(x+.25)/(n+7.25));
    const bp=Array.from(b,(x,i)=>(x+8*up[i%29])/(bt[Math.floor(i/29)]+8));
    const tp=Array.from(t,(x,i)=>(x+8*bp[i%841])/(tt[Math.floor(i/29)]+8));
    return {u:up.map(Math.log),b:bp.map(Math.log),t:tp.map(Math.log)};
  }
  function enc(P,K){
    let q=0;return P.map(p=>{if(p===0)return 0;const c=(p+K[q])%29;q=(q+primes[c])%K.length;return c;});
  }
  function maxShift(counts,M,L){
    const K=[];
    for(let q=0;q<L;q++){
      let best=-Infinity,choice=-1;
      for(let k=0;k<29;k++){
        if(counts[q*29+k])continue;
        let v=0;for(let c=0;c<29;c++)if(counts[q*29+c])v+=counts[q*29+c]*M.u[mod(c-k,29)];
        if(v>best){best=v;choice=k;}
      }
      if(choice<0)return null;
      K.push(choice);
    }
    return K;
  }
  function seedKey(C,L,M,random,rate){
    const counts=new Uint32Array(L*29);let q=0;
    for(const c of C){
      if(c===0&&random()<rate)continue;
      counts[q*29+c]++;q=(q+primes[c])%L;
    }
    return maxShift(counts,M,L);
  }
  function viterbiUni(C,K,M){
    const L=K.length,n=C.length,shift=C.map(c=>primes[c]%L);
    let scores=new Float64Array(L).fill(-Infinity);scores[0]=0;
    const prev=new Int16Array(n*L).fill(-1),plain=new Int8Array(n*L).fill(-1);
    for(let i=0;i<n;i++){
      const c=C[i],next=new Float64Array(L).fill(-Infinity);
      for(let q=0;q<L;q++){
        if(!Number.isFinite(scores[q]))continue;
        if(c===0&&scores[q]+M.u[0]>next[q]){next[q]=scores[q]+M.u[0];prev[i*L+q]=q;plain[i*L+q]=0;}
        const p=mod(c-K[q],29),j=(q+shift[i])%L;
        if(p!==0&&scores[q]+M.u[p]>next[j]){next[j]=scores[q]+M.u[p];prev[i*L+j]=q;plain[i*L+j]=p;}
      }
      scores=next;
    }
    let q=0;for(let i=1;i<L;i++)if(scores[i]>scores[q])q=i;
    if(!Number.isFinite(scores[q]))return null;
    const score=scores[q],counts=new Uint32Array(L*29);
    for(let i=n-1;i>=0;i--){
      const j=i*L+q,p=plain[j];q=prev[j];
      if(p!==0)counts[q*29+C[i]]++;
    }
    return {score,counts};
  }
  function tri(C,K,M,start={q:0,a:29,b:29}){
    const L=K.length, base=900;
    let states=new Map([[start.q*base+start.a*30+start.b,{score:0,path:null}]]);
    for(const c of C){
      const next=new Map();
      for(const [id,state] of states){
        const q=Math.floor(id/base),ctx=id%base,a=Math.floor(ctx/30),b=ctx%30;
        const update=(p,j)=>{
          const v=state.score+(b===29?M.u[p]:a===29?M.b[b*29+p]:M.t[(a*29+b)*29+p]);
          const nid=j*base+b*30+p,old=next.get(nid);
          if(!old||v>old.score)next.set(nid,{score:v,path:{p,prev:state.path}});
        };
        if(c===0)update(0,q);
        const p=mod(c-K[q],29);if(p!==0)update(p,(q+primes[c])%L);
      }
      if(!next.size)return null;
      states=next;
    }
    let best=null,bid=-1;
    for(const [id,x] of states)if(!best||x.score>best.score){best=x;bid=id;}
    const P=[];for(let p=best.path;p;p=p.prev)P.push(p.p);
    return {score:best.score,P:P.reverse(),end:{q:Math.floor(bid/base),a:Math.floor((bid%base)/30),b:bid%30},terminalStates:states.size};
  }
  function fit(C,L,M,seed){
    const random=rng(seed),found=new Map();
    let valid=0;
    for(let r=0;r<192;r++){
      const rate=[1,0,.25,.5,.75][r%5];
      let K=seedKey(C,L,M,random,rate);
      if(!K)continue;
      valid++;
      let v=null;
      for(let step=0;step<15;step++){
        v=viterbiUni(C,K,M);if(!v)break;
        const K2=maxShift(v.counts,M,L);if(!K2)throw Error("valid path lost");
        if(K2.every((k,i)=>k===K[i]))break;
        K=K2;
      }
      v=viterbiUni(C,K,M);if(v)found.set(K.join(","),{K,score:v.score});
    }
    const top=Array.from(found.values()).sort((a,b)=>b.score-a.score).slice(0,32);
    const ranked=top.map(x=>({K:x.K,decoded:tri(C,x.K,M)})).filter(x=>x.decoded).sort((a,b)=>b.decoded.score-a.decoded.score);
    if(!ranked.length)return null;
    return {best:ranked[0],distinct:found.size,valid,ranked:ranked.length,margin:ranked.length>1?ranked[0].decoded.score-ranked[1].decoded.score:null};
  }
  function run(C,L,M,cut,seed,K=null,P=null){
    const f=fit(C.slice(0,cut),L,M,seed);
    if(!f)return {period:L,n:C.length,cut,feasible:false};
    const {K:key,decoded}=f.best;
    const suffix=tri(C.slice(cut),key,M,decoded.end);
    const out={period:L,n:C.length,cut,key,validStarts:f.valid,distinctKeys:f.distinct,trigramRanked:f.ranked,margin:f.margin,prefixScore:decoded.score/cut,prefixEnd:decoded.end,prefixPreview:render(decoded.P.slice(0,80)),suffixFeasible:!!suffix};
    if(suffix){
      const D=decoded.P.concat(suffix.P);
      if(enc(D,key).some((c,i)=>c!==C[i]))throw Error("replay");
      out.suffixScore=suffix.score/(C.length-cut);out.suffixPreview=render(suffix.P.slice(0,100));out.replay=true;
    }
    const full=tri(C,key,M);
    out.fullFeasible=!!full;
    if(full){
      if(enc(full.P,key).some((c,i)=>c!==C[i]))throw Error("full replay");
      out.fullScore=full.score/C.length;
    }
    if(K){
      out.trueKey=K;out.keyCorrect=key.filter((x,i)=>x===K[i]).length;out.suffixLength=C.length-cut;
      out.suffixCorrect=suffix?suffix.P.filter((x,i)=>x===P[cut+i]).length:0;
      out.fullCorrect=full?full.P.filter((x,i)=>x===P[i]).length:0;
      out.trueFullScore=tri(C,K,M).score/C.length;
    }
    return out;
  }
  const plants=[];
  for(const section of [1,3,4]){
    const P=native[section],M=model([section,7,8]),cut=Math.floor(P.length*.67);
    for(const L of [8,13,29]){
      const random=rng(0x33010000+section*100+L),K=Array.from({length:L},()=>Math.floor(random()*29));
      plants.push({section:gold.sections[section].name,...run(enc(P,K),L,M,cut,0x20140000+section*100+L,K,P)});
    }
  }
  const passed=[8,13,29].filter(L=>plants.filter(x=>x.period===L&&x.keyCorrect===L&&x.suffixCorrect===x.suffixLength).length>=2);
  const original=[];
  for(const [a,b,cutPage] of [[15,22,18],[33,39,35]]){
    const pages=corpus.pages.filter(x=>x.page>=a&&x.page<=b),C=pages.flatMap(x=>x.indices),cut=pages.filter(x=>x.page<=cutPage).reduce((n,x)=>n+x.indices.length,0);
    for(const L of passed)original.push({scope:`p${a}-${b}`,fitThrough:cutPage,...run(C,L,model([7,8]),cut,0x33012000+a*100+L)});
  }
  return {model:"native GP29 additive, plaintext F bypass/no advance, ordinary advance prime[C] mod L",gate:"at least two of three exact planted keys and withheld texts per period",passed,plants,original};
}
console.log(JSON.stringify(experiment(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
