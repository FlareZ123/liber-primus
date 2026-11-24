"use strict";
// Read-only deterministic GP-prime ciphertext-clock blind recovery test.
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function experiment(corpus,gold){
  const primes=corpus.prime, alphabet=corpus.translit, rune=new Map(corpus.runes.map((r,i)=>[r,i]));
  const native=gold.sections.map(s=>Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x)));
  const mod=(n,m)=>(n%m+m)%m;
  const rng=(seed)=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
  const mean=(xs)=>xs.reduce((a,b)=>a+b,0)/xs.length;
  const render=xs=>xs.map(x=>alphabet[x]).join("");
  function model(exclude){
    const u=new Float64Array(29),b=new Float64Array(841),bt=new Float64Array(29),t=new Float64Array(24389),tt=new Float64Array(841);
    let n=0;
    for(let s=0;s<native.length;s++){
      if(exclude.includes(s))continue;
      const a=native[s];n+=a.length;
      for(let i=0;i<a.length;i++){
        u[a[i]]++;
        if(i>0){b[a[i-1]*29+a[i]]++;bt[a[i-1]]++;}
        if(i>1){const j=a[i-2]*29+a[i-1];t[j*29+a[i]]++;tt[j]++;}
      }
    }
    const up=Array.from(u,x=>(x+.25)/(n+7.25));
    const bp=Array.from(b,(x,i)=>(x+8*up[i%29])/(bt[Math.floor(i/29)]+8));
    const tp=Array.from(t,(x,i)=>(x+8*bp[i%841])/(tt[Math.floor(i/29)]+8));
    return {u:up.map(Math.log),b:bp.map(Math.log),t:tp.map(Math.log)};
  }
  function phaseTape(C,L){
    let q=0;return C.map(c=>{const old=q;q=(q+primes[c])%L;return old;});
  }
  function enc(P,K){
    let q=0;return P.map(p=>{const c=(p+K[q])%29;q=(q+primes[c])%K.length;return c;});
  }
  const dec=(C,Q,K)=>C.map((c,i)=>mod(c-K[Q[i]],29));
  function point(P,i,M){return i===0?M.u[P[0]]:i===1?M.b[P[0]*29+P[1]]:M.t[(P[i-2]*29+P[i-1])*29+P[i]];}
  function score(P,M,lo=0,hi=P.length){let v=0;for(let i=lo;i<hi;i++)v+=point(P,i,M);return v/(hi-lo);}
  function fit(C,Q,L,M,seed,restarts=8){
    const rand=rng(seed),loc=Array.from({length:L},()=>[]);
    Q.forEach((q,i)=>loc[q].push(i));
    const affected=loc.map(a=>Array.from(new Set(a.flatMap(i=>[i,i+1,i+2]).filter(i=>i<C.length))));
    const initial=loc.map(a=>Array.from({length:29},(_,k)=>({k,s:a.reduce((s,i)=>s+M.u[mod(C[i]-k,29)],0)})).sort((a,b)=>b.s-a.s).map(x=>x.k));
    const uniq=new Map();
    for(let r=0;r<restarts;r++){
      const key=initial.map(a=>r===0?a[0]:a[Math.floor(rand()*(r<5?3:29))]);
      const P=dec(C,Q,key);
      for(let sweep=0;sweep<12;sweep++){
        let changed=0;
        const order=Array.from({length:L},(_,i)=>i);
        for(let i=L-1;i>0;i--){const j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
        for(const q of order){
          let bestK=key[q],best=affected[q].reduce((v,i)=>v+point(P,i,M),0);
          for(let k=0;k<29;k++){
            if(k===key[q])continue;
            for(const i of loc[q])P[i]=mod(C[i]-k,29);
            let v=0;for(const i of affected[q])v+=point(P,i,M);
            if(v>best+1e-9){best=v;bestK=k;}
          }
          for(const i of loc[q])P[i]=mod(C[i]-bestK,29);
          if(bestK!==key[q])changed++;
          key[q]=bestK;
        }
        if(!changed)break;
      }
      const s=score(P,M);uniq.set(key.join(","),{key,s});
    }
    const ranked=Array.from(uniq.values()).sort((a,b)=>b.s-a.s);
    return {key:ranked[0].key,train:ranked[0].s,margin:ranked.length>1?ranked[0].s-ranked[1].s:null,distinct:ranked.length};
  }
  function stats(C,L,M,cut,seed,K=null,P=null){
    const Q=phaseTape(C,L), f=fit(C.slice(0,cut),Q.slice(0,cut),L,M,seed);
    const D=dec(C,Q,f.key);
    if(enc(D,f.key).some((c,i)=>c!==C[i]))throw Error("replay");
    const rand=rng(seed^0x93f4abcd);
    const baseline=Array.from({length:64},()=>score(dec(C,Q,Array.from({length:L},()=>Math.floor(rand()*29))),M,cut));
    const result={period:L,n:C.length,cut,key:f.key,train:f.train,hold:score(D,M,cut),randomHoldMean:mean(baseline),randomHoldMax:Math.max(...baseline),margin:f.margin,distinct:f.distinct,holdPreview:render(D.slice(cut,cut+100)),trainPreview:render(D.slice(0,100)),replay:true};
    if(K){result.trueKey=K;result.keyCorrect=f.key.filter((x,i)=>x===K[i]).length;result.holdCorrect=D.slice(cut).filter((x,i)=>x===P[cut+i]).length;result.trueHold=score(P,M,cut);result.holdLength=C.length-cut;}
    return result;
  }
  const plants=[];
  for(const section of [1,3,4]){
    const P=native[section],cut=Math.floor(P.length*.67),M=model([section,7,8]);
    for(const L of [8,13,29]){
      const random=rng(0x33010000+section*100+L);
      const K=Array.from({length:L},()=>Math.floor(random()*29));
      const C=enc(P,K);
      plants.push({section:gold.sections[section].name,...stats(C,L,M,cut,0x20140000+section*100+L,K,P)});
    }
  }
  const original=[];
  for(const [a,b,cutPage] of [[0,2,1],[40,53,45]]){
    const pages=corpus.pages.filter(x=>x.page>=a&&x.page<=b);
    const C=pages.flatMap(x=>x.indices),cut=pages.filter(x=>x.page<=cutPage).reduce((n,x)=>n+x.indices.length,0);
    for(const L of [8,13,29])original.push({scope:`p${a}-${b}`,fitThrough:cutPage,...stats(C,L,model([7,8]),cut,0x33012000+a*100+L)});
  }
  return {model:"C=P+K[q] mod29; q'=q+GPprime(C) modL, q0=0; no F bypass",periods:[8,13,29],training:"native LP1; target section withheld on plants; LP2 p56/p57 excluded from every model",plants,original};
}
console.log(JSON.stringify(experiment(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
