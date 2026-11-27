"use strict";
/** Count-local alphabet permutation constraints, #3174. Node 22. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function run(raw,assert){
  const d=JSON.parse(raw[0]), q=29, ID=Array.from({length:q},(_,i)=>i);
  const hist=x=>{const h=Array(q).fill(0);for(const v of x)h[v]++;return h};
  const C=hist(d.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),N=C.reduce((a,b)=>a+b,0);
  assert(N===12956,"original length");
  const tokens=d.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(text){
    const out=[];
    for(const w of text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){
        if(w.startsWith("ING",i)){out.push(21);i+=3}
        else if(w.startsWith("IO",i)){out.push(27);i+=2}
        else{const t=tokens.find(t=>w.startsWith(t.s,i));assert(t,"native token");out.push(t.i);i+=t.s.length}
      }
    }
    return out;
  }
  function gate(ch){
    const S=[...ch].sort((a,b)=>b-a),pre=[0];
    for(const n of S)pre.push(pre.at(-1)+n);
    const singles=new Uint8Array(pre.at(-1)+1),pairs=new Uint8Array(pre.at(-1)+1);
    for(let i=0;i<q;i++){singles[ch[i]]=1;for(let j=i+1;j<q;j++)pairs[ch[i]+ch[j]]=1}
    const minPair=S[q-2]+S[q-1],maxPair=S[0]+S[1];
    const lower=Array(q+1).fill(q);
    for(let m=0;m<=q;m++)for(let v=m;v<=q;v++){
      if(v===1||v===2)continue;
      const k=Math.floor(v/3);
      lower[m]=Math.min(lower[m],v-k+(q-v)%2);
    }
    return {pre,evaluate(P){
      let forced=0,mass=0;
      for(let i=0;i<q;i++){
        if(singles[P[i]])continue;
        let ok=false;
        for(let j=0;j<q;j++){
          if(j===i)continue;
          const s=P[i]+P[j];
          if(s>=minPair&&s<=maxPair&&pairs[s]){ok=true;break}
        }
        if(!ok){forced++;mass+=P[i]}
      }
      let m=forced?Math.max(forced,3):0;
      while(pre[m]<mass)m++;
      return {forced,mass,m,inactive:lower[m]};
    }};
  }
  const original=gate(C),literary=raw.slice(1).map(encode),results=[];
  for(let k=0;k<literary.length;k++){
    const x=literary[k], P=hist(x.slice(0,N));let min=q,max=0,minForced=q,minMass=N,minAt=0,minLargeVertices=q;
    const dist=Array(q+1).fill(0);
    for(let i=0;i+N<=x.length;i++){
      const a=original.evaluate(P);
      if(a.inactive<min){min=a.inactive;minAt=i}
      minForced=Math.min(minForced,a.forced);minMass=Math.min(minMass,a.mass);minLargeVertices=Math.min(minLargeVertices,a.m);
      max=Math.max(max,a.inactive);dist[a.inactive]++;
      if(i+N<x.length){P[x[i]]--;P[x[i+N]]++}
    }
    results.push({runes:x.length,windows:x.length-N+1,minInactive:min,maxInactive:max,minForced,minMass,minLargeVertices,minAt,distribution:dist.map((n,i)=>[i,n]).filter(x=>x[1])});
  }
  // A fixed star partition with two larger stars, ten active pairs, one singleton.
  // This is a theorem check, not a historically nominated sender.
  function pivot(x,k){
    if(x===0)return 1+k%4;
    if(x===5)return 6+k%2;
    if(x>=8&&x<28)return 8+((x-8)^1);
    return x;
  }
  function transduce(input,A0,decode=false){
    const A=A0.slice(), counts=Array(q).fill(0),out=[];
    for(const v of input){
      const p=decode?A.indexOf(v):v;
      assert(p>=0,"unique inverse");
      out.push(decode?p:A[p]);
      const y=pivot(p,counts[p]++);
      [A[p],A[y]]=[A[y],A[p]];
    }
    return {out,A};
  }
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const plants=[...literary.map(x=>x.slice(0,N)),d.pages.find(p=>p.page===57).indices].map((P,i)=>{
    const A0=ID.map(x=>((7+2*i)*x+5+i)%q),enc=transduce(P,A0),dec=transduce(enc.out,A0,true);
    assert(same(P,dec.out),"native exact inverse");
    assert(same(enc.out,transduce(dec.out,A0).out),"native replay");
    assert(same(enc.A,transduce(P.slice().reverse(),A0).A),"reverse count state");
    assert(same(enc.A,transduce(P.slice().sort((a,b)=>a-b),A0).A),"sorted count state");
    const bound=gate(hist(enc.out)).evaluate(hist(P));
    assert(bound.inactive<=7,"sound inactive lower bound");
    return {n:P.length,exact:dec.out.length,inactiveTruth:7,inactiveBound:bound.inactive,forced:bound.forced,finalStateOrderIndependent:true};
  });
  return {N,cipherHistogram:C,topPrefix:original.pre,sourceWindows:results,plants};
}
const raw=files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(raw,assert),null,2));
