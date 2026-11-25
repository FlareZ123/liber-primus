'use strict';
// Agent 2, 2026-11-25. Run from repository root.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-grid-256.json",
    "sha": "2550eae357442912220e05dc51147523a61dd75a"
  },
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  }
];
function closureExperiment(grid,corpus,solved){
 const q=29,n=256,M=x=>(x%q+q)%q,assert=(x,m)=>{if(!x)throw Error(m)},inv=x=>{for(let i=1;i<q;i++)if(M(x*i)===1)return i;throw Error("zero")};
 const nat=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const inner=Array.from({length:n},(_,i)=>i).filter(i=>i>=8&&i<248&&i%8>0&&i%8<7);
 const ring=[...Array.from({length:8},(_,i)=>i),...Array.from({length:31},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>254-i),...Array.from({length:30},(_,i)=>(30-i)*8)];
 const [c55,c56,c57]=[55,56,57].map(i=>corpus.pages[i].indices),known=[...nat("p56_an_end"),...nat("p57_parable")],C=Array(n).fill(0);
 ring.forEach((i,j)=>C[i]=c55[j]);inner.forEach((i,j)=>C[i]=j<85?c56[j]:c57[j-85]);const P=new Map(inner.map((x,j)=>[x,known[j]]));
 function basisOf(vs,sites){const B=new Map();for(const v of vs){let a=v.slice();for(const i of sites){if(!a[i])continue;const b=B.get(i);if(b){const k=a[i];for(let h=0;h<a.length;h++)a[h]=M(a[h]-k*b[h]);}else{const k=inv(a[i]);B.set(i,a.map(x=>M(x*k)));break;}}}return B;}
 function relation(cols,sites){const rows=new Map();for(let j=0;j<sites.length;j++){
   const cell=sites[j],x=cols.map(v=>v[cell]),w=Array(sites.length).fill(0);w[j]=1;let b=P.get(cell),added=false;
   for(let i=0;i<x.length;i++){if(!x[i])continue;const old=rows.get(i);if(old){const k=x[i];for(let h=i;h<x.length;h++)x[h]=M(x[h]-k*old.x[h]);for(let h=0;h<w.length;h++)w[h]=M(w[h]-k*old.w[h]);b=M(b-k*old.b);}else{const k=inv(x[i]);for(let h=i;h<x.length;h++)x[h]=M(x[h]*k);for(let h=0;h<w.length;h++)w[h]=M(w[h]*k);b=M(b*k);rows.set(i,{x,w,b});added=true;break;}}
   if(!added&&b){const terms=w.flatMap((a,i)=>a?[{cell:sites[i],knownOffset:inner.indexOf(sites[i]),coef:a,cipher:C[sites[i]],plain:P.get(sites[i])}]:[]);assert(cols.every(v=>M(terms.reduce((s,t)=>s+t.coef*v[t.cell],0))===0),"null relation");return {prefix:j+1,terms,residue:b};}
 }return null;}
 const results=[];for(const radix of [59,60]){
  const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet,T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
  const indegree=Array(n).fill(0);T.forEach(x=>indegree[x]++);
  const leaves=inner.filter(x=>indegree[x]===0),pairs=[];
  for(let i=0;i<leaves.length;i++)for(let j=i+1;j<leaves.length;j++){const a=leaves[i],b=leaves[j];if(T[a]!==T[b])continue;const dc=M(C[a]-C[b]),dp=M(P.get(a)-P.get(b));pairs.push({a,b,parent:T[a],knownOffsets:[inner.indexOf(a),inner.indexOf(b)],C:[C[a],C[b]],P:[P.get(a),P.get(b)],dc,dp,requiredA:dc?M(dp*inv(dc)):dp?"impossible":"any"});}
  const contradict=pairs.find(x=>x.requiredA==="impossible"),determined=pairs.filter(x=>Number.isInteger(x.requiredA)),conflict=determined.flatMap((a,i)=>determined.slice(i+1).filter(b=>a.requiredA!==b.requiredA).map(b=>[a,b])).sort((a,b)=>Math.max(...a.flatMap(x=>x.knownOffsets))-Math.max(...b.flatMap(x=>x.knownOffsets)))[0]||null;
  const ops=(v,d)=>{if(d==="F")return T.map(i=>v[i]);const w=Array(n).fill(0);T.forEach((p,i)=>w[p]=M(w[p]+v[i]));return w};
  const B=new Map(),queue=[],sites=Array.from({length:n},(_,i)=>i);function add(v){const a=v.slice();for(const i of sites){if(!a[i])continue;const b=B.get(i);if(b){const k=a[i];for(let h=i;h<n;h++)a[h]=M(a[h]-k*b[h]);}else{const k=inv(a[i]),u=a.map(x=>M(x*k));B.set(i,u);queue.push(u);return true;}}return false;}
  add(C);add(Array(n).fill(1));for(let i=0;i<queue.length;i++){add(ops(queue[i],"F"));add(ops(queue[i],"R"));}
  assert(queue.every(v=>["F","R"].every(d=>basisOf([...queue,ops(v,d)],sites).size===queue.length)),"invariant span");
  const train=inner.slice(0,85),fullRank=queue.length,trainRank=basisOf(queue,train).size,knownRank=basisOf(queue,inner).size;
  const trainWitness=relation(queue,train),knownWitness=relation(queue,inner);
  results.push({radix,fullRank,trainRank,knownRank,trainWitness,knownWitness,leafPairCount:pairs.length,leafSameCipherContradiction:contradict||null,leafSlopeConflict:conflict,leafSlopeValues:[...new Set(determined.map(x=>x.requiredA))].sort((a,b)=>a-b)});
 }
 return results;
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`input changed: ${path}`);return JSON.parse(b)});
console.log(JSON.stringify(closureExperiment(...data),null,2));
