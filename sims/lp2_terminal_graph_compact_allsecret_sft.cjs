'use strict';
// Agent17. Original terminal graph compact-operator exact inverse gate.
// Run from repository root: node sims/lp2_terminal_graph_compact_allsecret_sft.cjs
const fs=require("node:fs"),crypto=require("node:crypto");
const inputs=[
 {path:"resources/liber-primus/lp2-grid-256.json",sha:"2550eae357442912220e05dc51147523a61dd75a"},
 {path:"resources/liber-primus/lp2-corpus.json",sha:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165"},
 {path:"resources/external/relikd-solved-gp29-native-v1.json",sha:"1b064ef6d85819b7d96adaff31a82d1ec551598f"}
];
function experiment(grid,corpus,solved,options={}){
 const Q=29,N=256,M=x=>(x%Q+Q)%Q,A=(x,m)=>{if(!x)throw Error(m)},range=n=>Array.from({length:n},(_,i)=>i),eq=(x,y)=>x.length===y.length&&x.every((v,i)=>v===y[i]);
 const mul=range(Q).map(x=>Uint8Array.from(range(Q),y=>M(x*y))),sub=range(Q).map(x=>Uint8Array.from(range(Q),y=>M(x-y))),add=range(Q).map(x=>Uint8Array.from(range(Q),y=>M(x+y))),inv=range(Q).map(x=>mul[x].indexOf(1));
 const native=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const knownP=[...native("p56_an_end"),...native("p57_parable")],knownC=[...corpus.pages[56].indices,...corpus.pages[57].indices],unknownC=corpus.pages[55].indices;
 A(knownP.length===180&&knownC.length===180&&unknownC.length===76,"source lengths");
 const primes=[];for(let i=2;primes.length<85;i++){let ok=true;for(let d=2;d*d<=i;d++)if(i%d===0){ok=false;break}if(ok)primes.push(i)}
 let cursor=0;A(eq(knownP.slice(0,85).map(x=>x===0?0:M(x+primes[cursor++]-1)),knownC.slice(0,85))&&cursor===84&&eq(knownP.slice(85),knownC.slice(85)),"authentic p56/p57");
 const perimeter=[...range(8),...range(31).map(i=>8*(i+1)+7),...range(7).map(i=>254-i),...range(30).map(i=>240-8*i)];
 const layouts=[];
 for(const radix of [59,60])for(const axis of ["row","column"])for(const outerRev of [false,true])for(const innerRev of [false,true])for(const snake of [false,true]){
  const outer=axis==="row"?30:6,inner=axis==="row"?6:30,sites=[];
  for(let i=0;i<outer;i++)for(let j=0;j<inner;j++){const a=outerRev?outer-i:i+1,b=(innerRev!==(snake&&i%2===1))?inner-j:j+1;sites.push(axis==="row"?8*a+b:8*b+a)}
  A(new Set([...sites,...perimeter]).size===N,"layout");
  const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet,T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
  A(T.length===N&&T.every(x=>x>=0&&x<N),"table");
  const deg=range(N).map(()=>0);T.forEach(t=>deg[t]++);
  const groups=new Map();sites.forEach((s,i)=>{if(!deg[s]){const g=groups.get(T[s])||[];g.push(i);groups.set(T[s],g)}});
  const pairs=[...groups.values()].flatMap(g=>g.slice(1).map(i=>[g[0],i]));
  const zero=pairs.every(([i,j])=>knownP[i]===knownP[j]),nonzero=pairs.every(([i,j])=>(knownP[i]===knownP[j])===(knownC[i]===knownC[j]));
  layouts.push({radix,axis,outerRev,innerRev,snake,sites,T,deg,zero,nonzero});
 }
 const eligible=layouts.filter(l=>l.zero||l.nonzero);
 A(eligible.length===8&&layouts.every(l=>!l.zero),"independent alphabet sibling gate");
 function tape(l,c=knownC,unknown=unknownC){const C=range(N).map(()=>0);l.sites.forEach((s,i)=>C[s]=c[i]);perimeter.forEach((s,i)=>C[s]=unknown[i]);return C}
 function feature(l,C,words){
  const X=Array.from(C,c=>Uint8Array.from(range(Q),i=>+(i===c))),cache=new Map([["",X]]);
  function get(w){
   if(cache.has(w))return cache.get(w);const V=get(w.slice(0,-1));let U;
   if(w.endsWith("F"))U=l.T.map(t=>V[t].slice());
   else{U=range(N).map(()=>new Uint8Array(Q));for(let i=0;i<N;i++){const u=U[l.T[i]],v=V[i];for(let j=0;j<Q;j++)u[j]=add[u[j]][v[j]]}}
   cache.set(w,U);return U;
  }
  return words.map(w=>get(w));
 }
 function groupsByP(l,P,leaf){
  const g=new Map();l.sites.forEach((s,i)=>{if(!leaf||!l.deg[s]){const a=g.get(P[i])||[];a.push(s);g.set(P[i],a)}});
  return {pairs:[...g.values()].flatMap(a=>a.slice(1).map(s=>[a[0],s])),reps:[...g.entries()].map(([p,a])=>({p,s:a[0]}))};
 }
 function reduce(row,e,n){
  for(let j=0;j<n;j++)if(row[j]&&e[j]){const v=mul[row[j]],r=e[j];for(let k=j;k<n;k++)row[k]=sub[row[k]][v[r[k]]]}
  return row;
 }
 function insert(row,e,n){
  reduce(row,e,n);const j=row.findIndex(x=>x!==0);if(j<0)return false;const v=mul[inv[row[j]]];for(let k=j;k<n;k++)row[k]=v[row[k]];e[j]=row;return true;
 }
 function nullsignatures(e,n){
  const free=range(n).filter(j=>!e[j]),sig=range(n).map(()=>new Uint8Array(free.length));
  for(let j=0;j<free.length;j++){const x=new Uint8Array(n);x[free[j]]=1;for(let k=n-1;k>=0;k--)if(e[k]){let s=0;for(let h=k+1;h<n;h++)s+=e[k][h]*x[h];x[k]=M(-s)}for(let k=0;k<n;k++)sig[k][j]=x[k]}
  return sig;
 }
 function forced(sig){const seen=new Map();for(let i=0;i<sig.length;i++){const k=sig[i].join(",");if(seen.has(k))return [seen.get(k),i];seen.set(k,i)}return null}
 function leafGate(l,C,P,only=null){
  const Ws=feature(l,C,["","F","FF","RF"]),{pairs,reps}=groupsByP(l,P,true);
  const Arows=Ws.map(W=>pairs.map(([i,j])=>Uint8Array.from(W[j],(v,k)=>sub[v][W[i][k]])));
  const hist=range(Q+1).map(()=>0);let inputFail=0,outputFail=0;const survivors=[];
  const bs=only?[only[0]]:range(Q),ds=only?[only[1]]:range(Q),es=only?[only[2]]:range(Q);
  for(const b of bs){
   const B=Arows[0].map((r,i)=>Uint8Array.from(r,(v,j)=>add[v][mul[b][Arows[1][i][j]]]));
   for(const d of ds){
    const D=B.map((r,i)=>Uint8Array.from(r,(v,j)=>add[v][mul[d][Arows[2][i][j]]]));
    for(const f of es){
     const e=Array(Q).fill(null);let rank=0;
     for(let i=0;i<D.length&&rank<Q;i++){const r=Uint8Array.from(D[i],(v,j)=>add[v][mul[f][Arows[3][i][j]]]);if(insert(r,e,Q))rank++}
     hist[rank]++;
     if(rank===Q){inputFail++;continue}
     const sig=nullsignatures(e,Q),pair=forced(sig);if(pair){inputFail++;continue}
     const out=reps.map(({s})=>Uint8Array.from(range(Q-rank),j=>M(range(Q).reduce((z,k)=>z+M(Ws[0][s][k]+b*Ws[1][s][k]+d*Ws[2][s][k]+f*Ws[3][s][k])*sig[k][j],0))));
     if(forced(out)){outputFail++;continue}
     survivors.push({b,d,f,rank});
    }
   }
  }
  return {leafRows:pairs.length+reps.length,samePlainRows:pairs.length,distinctLeafPlain:reps.length,cases:bs.length*ds.length*es.length,inputFail,outputFail,hist,survivors};
 }
 const words=[];for(let d=1;d<=7;d++)for(let k=0;k<2**d;k++)words.push(k.toString(2).padStart(d,"0").replaceAll("0","F").replaceAll("1","R"));
 function* choose(xs,k,start=0,prefix=[]){if(!k){yield prefix;return}for(let i=start;i<=xs.length-k;i++)yield* choose(xs,k-1,i+1,[...prefix,xs[i]])}
 function sparseGate(l,C,P,sets){
  const all=["",...words],Ws=feature(l,C,all),byWord=new Map(all.map((w,i)=>[w,Ws[i]])),{pairs,reps}=groupsByP(l,P,false);
  const ds=new Map(all.map(w=>[w,pairs.map(([i,j])=>Uint8Array.from(byWord.get(w)[j],(v,k)=>sub[v][byWord.get(w)[i][k]]))]));
  function test(ws){
   const term=["",...ws],n=Q*term.length,mat=term.map(w=>ds.get(w)),e=Array(n).fill(null);let rank=0;
   for(let i=0;i<pairs.length&&rank<n;i++){const row=new Uint8Array(n);mat.forEach((a,k)=>row.set(a[i],k*Q));if(insert(row,e,n))rank++}
   for(let i=0;i<reps.length;i++)for(let j=0;j<i;j++){
    const row=new Uint8Array(n);
    term.forEach((w,k)=>{const W=byWord.get(w),a=W[reps[i].s],b=W[reps[j].s];for(let h=0;h<Q;h++)row[k*Q+h]=sub[a[h]][b[h]]});
    if(reduce(row,e,n).every(x=>x===0))return {rank,forced:[reps[j].p,reps[i].p]};
   }
   return {rank,forced:null};
  }
  return sets.map(({count,maxDegree,only})=>{const sel=only?[only]:choose(words.filter(w=>w.length<=maxDegree),count);let tested=0,excluded=0;const survivors=[];for(const ws of sel){const r=test(ws);tested++;if(r.forced)excluded++;else survivors.push({words:ws,rank:r.rank})}return {count,maxDegree,tested,excluded,survivors}});
 }
 const compactSets=[{count:1,maxDegree:7},{count:2,maxDegree:4},{count:3,maxDegree:3},{count:4,maxDegree:2}];
 const info=l=>({radix:l.radix,axis:l.axis,outerRev:l.outerRev,innerRev:l.innerRev,snake:l.snake});
 const original=[];
 for(let j=0;j<eligible.length;j++){
  const l=eligible[j];if(options.layoutIndex!==undefined&&options.layoutIndex!==j)continue;
  const C=tape(l),leaf=leafGate(l,C,knownP);
  A(!leaf.survivors.length&&leaf.inputFail===29**3,"degree-two original gate");
  const sparse=options.skipSparse?[]:sparseGate(l,C,knownP,compactSets);
  original.push({layoutIndex:j,...info(l),leaf,sparse});
 }
 // Synthetic positive using two distinct bijections and full degree-two law.
 function plant(l,term,coef,a,h){
  const pi=range(Q).map(x=>M(7*x+3)),rho=range(Q).map(x=>M(11*x+5));
  const I=range(N).map(i=>Uint8Array.from(range(N),j=>+(i===j))),cache=new Map([["",I]]);
  function mat(w){if(cache.has(w))return cache.get(w);const V=mat(w.slice(0,-1));let U;if(w.endsWith("F"))U=l.T.map(t=>V[t].slice());else{U=range(N).map(()=>new Uint8Array(N));for(let i=0;i<N;i++){const u=U[l.T[i]],v=V[i];for(let j=0;j<N;j++)u[j]=add[u[j]][v[j]]}}cache.set(w,U);return U}
  const donor=native("0_warning").slice(0,76),P=tape(l,knownP,donor),e=Array(N).fill(null);
  const D=I.map(r=>Uint8Array.from(r,x=>mul[a][x]));
  term.forEach((w,k)=>{const W=mat(w),z=mul[coef[k]];for(let i=0;i<N;i++)for(let j=0;j<N;j++)D[i][j]=add[D[i][j]][z[W[i][j]]]});
  // Elimination including RHS. The pivot is selected in the first N columns only.
  for(let i=0;i<N;i++){const row=Uint8Array.from([...D[i],M(rho[P[i]]-h)]);for(let j=0;j<N;j++)if(row[j]){if(e[j]){const z=mul[row[j]];for(let k=j;k<=N;k++)row[k]=sub[row[k]][z[e[j][k]]]}else{const z=mul[inv[row[j]]];for(let k=j;k<=N;k++)row[k]=z[row[k]];e[j]=row;break}}}
  if(e.some(r=>!r))return null;
  const x=range(N).map(()=>0);for(let j=N-1;j>=0;j--){let z=e[j][N];for(let k=j+1;k<N;k++)z-=e[j][k]*x[k];x[j]=M(z)}
  const C=x.map(v=>pi.indexOf(v));A(eq(D.map(r=>rho.indexOf(M(h+r.reduce((s,v,j)=>s+v*x[j],0)))),P),"plant replay");
  return {C,P,a,term,coef,h};
 }
 const l=eligible.find(x=>x.radix===60&&x.axis==="column"&&!x.outerRev&&!x.innerRev&&!x.snake),controls=[];
 for(const term of [["F"],["F","R"],["F","FF","RF"],["F","R","FF","FR","RF","RR"]]){
  let p=null;
  for(let a=2;a<Q&&!p;a++){const coef=term.map((_,i)=>i+1);p=plant(l,term,coef,a,7)}
  A(p,"invertible compact plant");
  const normalized=w=>M((p.coef[p.term.indexOf(w)]||0)*inv[p.a]),trueTriple=["F","FF","RF"].map(normalized);
  const leaf=leafGate(l,p.C,knownP,trueTriple);
  A(leaf.survivors.length===1,"true leaf triple retained");
  const sparse=term.length<=3?sparseGate(l,p.C,knownP,[{count:term.length,maxDegree:Math.max(...term.map(w=>w.length)),only:term}]):[];
  A(sparse.every(x=>x.excluded===0),"true relaxed compact model retained");
  controls.push({terms:term,coefficients:p.coef,a:p.a,normalizedLeafTriple:trueTriple,leafRank:leaf.survivors[0].rank,allCipherRunesReplayed:256,sparse});
 }
 return {authentic:{p56:85,primeTerms:cursor,p57:95},layoutGate:{total:32,zeroCoefficientLayouts:layouts.filter(l=>l.zero).length,eligible:eligible.map(info)},original,controls};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");if(actual!==sha)throw Error("source changed: "+path);return JSON.parse(b)});
console.log(JSON.stringify(experiment(...data),null,2));
