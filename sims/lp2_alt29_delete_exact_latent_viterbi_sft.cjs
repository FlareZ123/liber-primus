"use strict";
/**
 * A decoding test for the Round48 V-DELETE construction, with known key K.
 * Unlike clock-gap heuristics, this exact channel recognizer enumerates 0-3
 * truly deleted plaintext symbols between printed symbols, applies strict
 * no-repeat cipher rejection to every hidden and printed symbol, consumes
 * all used and rejected key indices, and retains a 4th-order GP29 language
 * state over BOTH recovered and hypothesized deleted plaintext symbols.
 *
 * This is a beam approximation to an exact finite-state transducer; no
 * manuscript key is claimed or assumed. Positive plants use disjoint
 * training/test intervals of three public literary donors.
 *
 * Execute: node sims/lp2_alt29_delete_exact_latent_viterbi_sft.cjs
 */
function experiment(raw, options={}) {
  const gp=JSON.parse(raw.gp),mod=(x,m=29)=>((x%m)+m)%m,
    labels=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),
    SENT=30,Q=31,Pdel=.187,keepLog=Math.log(1-Pdel),delLog=Math.log(Pdel);
  function words(text){
    const out=[];
    for(let w of (text.toUpperCase().match(/[A-Z]+/g)||[])){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      const a=[];for(let i=0;i<w.length;){
        const z=w.startsWith("ING",i)?{s:"ING",i:21}:
          w.startsWith("IO",i)?{s:"IO",i:27}:labels.find(z=>w.startsWith(z.s,i));
        if(!z)throw Error("unmapped "+w);
        a.push(z.i);i+=z.s.length;
      }
      out.push(a);
    }return out;
  }
  const datasets=[
    {name:"Shakespeare",arr:words(raw.shakespeare)},
    {name:"Gibran",arr:words(raw.gibran)},
    {name:"Emerson",arr:words(raw.emerson)}];
  function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%n;};}
  function makeLM(){
    const U=new Uint32Array(29),B=new Uint32Array(Q*Q),
      T=new Uint32Array(Q*Q*Q),F=new Uint32Array(Q*Q*Q*Q),
      Utotal=new Uint32Array(Q),Btotal=new Uint32Array(Q*Q),
      Ttotal=new Uint32Array(Q*Q*Q);
    for(const donor of datasets){
      const W=donor.arr.slice(0,Math.floor(donor.arr.length*.57));
      let a=SENT,b=SENT,c=SENT;
      for(const w of W)for(const p of w){
        U[p]++; B[c*Q+p]++; T[(b*Q+c)*Q+p]++;
        F[((a*Q+b)*Q+c)*Q+p]++;
        Utotal[c]++;Btotal[b*Q+c]++;Ttotal[(a*Q+b)*Q+c]++;
        a=b;b=c;c=p;
      }
    }
    const n=U.reduce((a,b)=>a+b,0),lp3=new Float32Array(Q*Q*Q),
      lp4=new Float32Array(Q*Q*Q*Q);
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let p=0;p<29;p++){
      const u=(U[p]+.3)/(n+29*.3);
      const bi=(B[b*Q+p]+12*u)/(Utotal[b]+12);
      lp3[(a*Q+b)*Q+p]=Math.log((T[(a*Q+b)*Q+p]+16*bi)/(Btotal[a*Q+b]+16));
    }
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++)for(let p=0;p<29;p++){
      const q=((a*Q+b)*Q+c)*Q+p;
      lp4[q]=Math.log((F[q]+10*Math.exp(lp3[(b*Q+c)*Q+p]))/(Ttotal[(a*Q+b)*Q+c]+10));
    }
    return lp4;
  }
  function encode(P,K) {
    const A=[];let j=0,last=-1;
    for(const p of P){
      while(mod(p+K[j])===last){j++;if(j>=K.length)throw Error("short key");}
      const c=mod(p+K[j]);A.push({c,p,j});j++;last=c;
    }return A;
  }
  function plant(donor,seed){
    const W=donor.arr,cut=Math.floor(W.length*.57),
      test=W.slice(cut).flat(),r=rng(seed),N=300;
    const off=50+r(test.length-N-150),P=test.slice(off,off+N);
    const K=Array.from({length:6*N},()=>r(29));
    const wrong=Array.from({length:6*N},()=>r(29));
    const A=encode(P,K),picked=A.filter(()=>r(10000)>=1870);
    return {name:donor.name,seed,K,wrong,C:picked.map(x=>x.c),truth:picked.map(x=>x.p),
      actualLastKeyIndex:picked.at(-1).j};
  }
  function inverseKeep(z,c,K,LM,onAccept,maxJ){
    const j0=z.j+1;
    if(c===z.prev)return [];
    const out=[];
    for(let h=0;h<=3;h++){
      const j=j0+h;if(j>=K.length||j>maxJ)break;
      const p=mod(c-K[j]);
      let okay=true;
      for(let t=j0;t<j;t++)if(mod(p+K[t])!==z.prev){okay=false;break;}
      if(!okay)continue;
      const s=z.s+keepLog+LM[((z.a*Q+z.b)*Q+z.c)*Q+p];
      out.push({j,prev:c,a:z.b,b:z.c,c:p,s,
        path:{p,prev:z.path}});
    }
    return out;
  }
  function deletedOne(z,K,LM,maxJ){
    const out=[],j0=z.j+1;if(j0>=K.length||j0>maxJ)return out;
    for(let p=0;p<29;p++){
      let j=j0;
      while(j<K.length&&mod(p+K[j])===z.prev)j++;
      if(j>=K.length||j>maxJ)continue;
      const c=mod(p+K[j]);
      out.push({j,prev:c,a:z.b,b:z.c,c:p,
        s:z.s+delLog+LM[((z.a*Q+z.b)*Q+z.c)*Q+p],
        path:z.path});
    }
    return out;
  }
  function top(rows,beam){
    const m=new Map();
    for(const z of rows){
      // prev is the exact hidden ciphertext state, not just a last visible rune.
      const id=((((z.j*29+z.prev)*Q+z.a)*Q+z.b)*Q+z.c);
      const old=m.get(id);if(!old||z.s>old.s)m.set(id,z);
    }
    const a=[...m.values()];
    // Exact score top-K in O(n) expected time; sort only retained K.
    if(a.length>beam){
      let lo=0,hi=a.length-1,goal=beam-1;
      while(lo<hi){
        const pivot=a[(lo+hi)>>>1].s;let i=lo,j=hi;
        while(i<=j){
          while(i<=hi&&a[i].s>pivot)i++;
          while(j>=lo&&a[j].s<pivot)j--;
          if(i<=j){[a[i],a[j]]=[a[j],a[i]];i++;j--;}
        }
        if(goal<=j)hi=j;
        else if(goal>=i)lo=i;
        else break;
      }
      a.length=beam;
    }
    a.sort((x,y)=>y.s-x.s);
    return a;
  }
  function decode(C,K,LM,beam=700,maxDeleted=3) {
    let states=[{j:-1,prev:-1,a:SENT,b:SENT,c:SENT,s:0,path:null}];
    let visited=0,maxState=1;
    for(let i=0;i<C.length;i++){
      const maxJ=Math.ceil((i+1)*1.6+12);
      let accepted=[],layers=states;
      for(let d=0;d<=maxDeleted;d++){
        for(const z of layers){
          const a=inverseKeep(z,C[i],K,LM,null,maxJ);accepted.push(...a);visited+=a.length;
        }
        if(d===maxDeleted)break;
        const grow=[];
        for(const z of layers)grow.push(...deletedOne(z,K,LM,maxJ));
        visited+=grow.length;
        layers=top(grow,Math.min(beam,900));
        if(!layers.length)break;
      }
      states=top(accepted,beam);
      if(!states.length)return {failedAt:i,visited,score:-Infinity};
      maxState=Math.max(maxState,states.length);
    }
    const z=states[0],P=[];
    for(let h=z.path;h;h=h.prev)P.push(h.p);
    P.reverse();
    return {P,score:z.s/C.length,lastKeyIndex:z.j,visited,maxState,
      preview:P.slice(0,100).map(i=>gp.translit[i]).join("")};
  }
  function lcs(a,b){
    let p=new Uint16Array(b.length+1),c=new Uint16Array(b.length+1);
    for(const x of a){c.fill(0);
      for(let i=0;i<b.length;i++)c[i+1]=x===b[i]?p[i]+1:Math.max(p[i+1],c[i]);
      [p,c]=[c,p];}
    return p[b.length];
  }
  const lm=makeLM(),beam=options.beam||700,results=[];
  for(let z=0;z<(options.plants||3);z++){
    const donor=datasets[z%datasets.length],plant0=plant(donor,80421+z*547);
    const a=decode(plant0.C,plant0.K,lm,beam,options.maxDeleted||3);
    const b=decode(plant0.C,plant0.wrong,lm,beam,options.maxDeleted||3);
    results.push({name:donor.name,seed:plant0.seed,printed:plant0.C.length,
      truthLength:plant0.truth.length,actualLastKeyIndex:plant0.actualLastKeyIndex,
      right:{recovery:a.P?lcs(a.P,plant0.truth)/Math.max(a.P.length,plant0.truth.length):0,
        score:a.score,visited:a.visited,finalKeyIndex:a.lastKeyIndex,preview:a.preview},
      wrong:{recovery:b.P?lcs(b.P,plant0.truth)/Math.max(b.P.length,plant0.truth.length):0,
        score:b.score,visited:b.visited,finalKeyIndex:b.lastKeyIndex,preview:b.preview}});
  }
  return {description:"Approximate exact generative V-DELETE keyed inverse; no original key",
    training:"First57% native GP donor words vs planted last43%, no planted oracle data",
    beam,maxDeleted:options.maxDeleted||3,results};
}
if(typeof module!=="undefined")module.exports={experiment};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  console.log(JSON.stringify(experiment({
    gp:read("resources/liber-primus/lp2-corpus.json"),
    shakespeare:read("resources/control/shakespeare_first300k.txt"),
    gibran:read("resources/control/gibran_prophet_58585.txt"),
    emerson:read("resources/control/emerson_essays_2944.txt")},
    {beam:process.argv.includes("--wide")?2000:700,plants:3}),null,2));
}
