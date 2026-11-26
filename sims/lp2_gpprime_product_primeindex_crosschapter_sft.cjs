"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,native){
  const A=29,N=3301,mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)},g=corpus.prime;
  const equal=(x,y)=>x.length===y.length&&x.every((v,i)=>v===y[i]);
  const pr=[];for(let x=2;pr.length<N-1;x++)if(!pr.some(p=>p*p<=x&&x%p===0))pr.push(x);
  const K=Int32Array.from([0,...pr.map(x=>mod(x-1))]);
  assert(g.length===29&&g[0]===2&&g[28]===109&&pr.length===3300&&pr[0]===2&&pr[1]===3,"prime chart");
  const ix=new Map(corpus.runes.map((r,i)=>[r,i]));
  const refs=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c))}));
  function model(ds){
    const u=new Float64Array(A).fill(.5),b=new Float64Array(A*A).fill(0),tot=new Float64Array(A);let n=14.5;
    for(const {p} of ds)for(let i=0;i<p.length;i++){u[p[i]]++;n++;if(i){b[p[i-1]*A+p[i]]++;tot[p[i-1]]++;}}
    for(let i=0;i<A;i++)u[i]/=n;
    for(let a=0;a<A;a++)for(let x=0;x<A;x++)b[a*A+x]=Math.log((b[a*A+x]+10*u[x])/(tot[a]+10));
    return {u:Array.from(u,Math.log),b};
  }
  function encode(P,s){
    const C=[];for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+K[s]));s=s*g[p]%N;}}
    return C;
  }
  // Use 30 slots per state to distinguish start from preceding plaintext F.
  const key=(s,p)=>s*30+p+1;
  function start(){const m=new Map();for(let s=1;s<N;s++)m.set(key(s,-1),{m:-Math.log(N-1),v:0,rare:0,prev:null,p:-1,iv:s,s});return m}
  function logadd(a,b){if(a===-Infinity)return b;if(b===-Infinity)return a;return Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)))}
  function advance(M,C,LM,from,to){
    let states=M,peak=states.size,firstDead=null;const counts=[];
    for(let i=from;i<to;i++){
      const c=C[i],next=new Map();
      function add(o,p,s){
        const l=o.p<0?LM.u[p]:LM.b[o.p*A+p],v=o.v+l,m=o.m+l,rare=o.rare+Number(p===12||p===22),k=key(s,p),old=next.get(k);
        if(!old){next.set(k,{m,v,rare,prev:o,p,iv:o.iv,s});return}
        old.m=logadd(old.m,m);old.rare=Math.min(old.rare,rare);
        if(v>old.v+1e-12||(Math.abs(v-old.v)<=1e-12&&o.iv<old.iv)){
          old.v=v;old.prev=o;old.iv=o.iv;
        }
      }
      for(const o of states.values()){
        if(c===0)add(o,0,o.s);
        const p=mod(c-K[o.s]);if(p!==0)add(o,p,o.s*g[p]%N);
      }
      states=next;peak=Math.max(peak,states.size);counts.push(states.size);
      if(!states.size){firstDead=i;break}
    }
    return {states,peak,firstDead,counts};
  }
  function summary(m){
    let best=null,e=-Infinity,rare=Infinity;
    for(const o of m.values()){e=logadd(e,o.m);rare=Math.min(rare,o.rare);if(best===null||o.v>best.v+1e-12||(Math.abs(o.v-best.v)<=1e-12&&o.iv<best.iv))best=o}
    return {best,e,rare:Number.isFinite(rare)?rare:null};
  }
  function path(o){const p=[];while(o&&o.p>=0){p.push(o.p);o=o.prev}return p.reverse()}
  function solve(C,LM,fit){
    const f=advance(start(),C,LM,0,fit),F=summary(f.states),r={n:C.length,fit,fitStates:f.states.size,fitPeak:f.peak,fitDead:f.firstDead,fitMinRare:F.rare,fitEvidence:F.e===-Infinity?null:F.e};
    if(!F.best)return r;
    const fitP=path(F.best);assert(equal(encode(fitP,F.best.iv),C.slice(0,fit)),"prefix replay");
    const freeze=advance(new Map([[key(F.best.s,F.best.p),{...F.best,m:0,v:0,rare:0}]]),C,LM,fit,C.length),S=summary(freeze.states);
    const full=advance(f.states,C,LM,fit,C.length),G=summary(full.states);
    const fullP=G.best?path(G.best):null,frozenP=S.best?path(S.best):null;
    if(fullP)assert(equal(encode(fullP,G.best.iv),C),"full replay");
    if(frozenP)assert(equal(encode(frozenP,F.best.iv),C),"frozen replay");
    return {...r,fitIV:F.best.iv,fitV:F.best.v/fit,fitP,frozenState:F.best.s,frozenStates:freeze.states.size,frozenDead:freeze.firstDead,frozenScore:S.best?S.best.v/(C.length-fit):null,frozenP,fullStates:full.states.size,fullDead:full.firstDead,fullPeak:Math.max(f.peak,full.peak),fullMinRare:G.rare,fullIV:G.best?.iv??null,fullP,posteriorPredictive:G.best?(G.e-F.e)/(C.length-fit):null};
  }
  const p56=refs.find(x=>x.name==="p56_an_end").p,p57=refs.find(x=>x.name==="p57_parable").p;
  let q=0;assert(equal(p56.map(p=>p===0?0:mod(p+pr[q++]-1)),corpus.pages[56].indices)&&equal(p57,corpus.pages[57].indices),"actual p56/p57 controls");
  // Transfer test: the exact same frozen law, across independent physical chapters.
  // p33 full was already completed by the initial experiment.
  const framing=[[0,2,13],[3,7,16],[8,14,12],[15,22,9],[23,26,16],[27,32,19],[33,39,10],[40,53,8],[54,55,9]];
  const results=[],LM=model(refs);
  for(const [lo,hi,heading] of framing){
    const full=corpus.pages.slice(lo,hi+1).flatMap(p=>p.indices);
    const baseFit=corpus.pages.slice(lo,hi).reduce((s,p)=>s+p.indices.length,0);
    for(const cut of [0,heading]){
      if(lo===33&&cut===0)continue;
      const r=solve(full.slice(cut),LM,baseFit-cut);
      results.push({lo,hi,cut,...r});
    }
  }
  return results;
}
const root=path.join(__dirname,"..");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...inputs.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")))),null,2));
