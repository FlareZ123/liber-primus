'use strict';
// Run from repository root with Node 22. Agent 2, 2026-11-25.
const fs=require('node:fs'), crypto=require('node:crypto');
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
function experiment(grid,corpus,solved){
 const q=29,n=256,M=x=>(x%q+q)%q,assert=(x,m)=>{if(!x)throw Error(m)},inv=x=>{for(let a=1;a<q;a++)if(M(x*a)===1)return a;throw Error("zero")};
 const native=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const p56=native("p56_an_end"),p57=native("p57_parable"),donor=native("0_warning").slice(0,76);
 const inner=Array.from({length:n},(_,i)=>i).filter(i=>i>=8&&i<248&&i%8>0&&i%8<7);
 const ring=[...Array.from({length:8},(_,i)=>i),...Array.from({length:31},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>254-i),...Array.from({length:30},(_,i)=>(30-i)*8)];
 const [c55,c56,c57]=[55,56,57].map(i=>corpus.pages[i].indices), known=[...p56,...p57];
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 let primes=[];for(let k=2;primes.length<84;k++)if(primes.every(p=>k%p))primes.push(k);
 let j=0;assert(eq(p56.map((p,i)=>i===56?p:M(p+primes[j++]-1)),c56)&&eq(p57,c57),"native replay");
 const layout=(a,b,c)=>{const v=Array(n).fill(0);ring.forEach((x,i)=>v[x]=a[i]);inner.forEach((x,i)=>v[x]=i<85?b[i]:c[i-85]);return v};
 const C=layout(c55,c56,c57),P=layout(donor,p56,p57);
 function ops(T,v,d){if(d==="F")return T.map(i=>v[i]);const w=Array(n).fill(0);T.forEach((p,i)=>w[p]=M(w[p]+v[i]));return w}
 function columns(T,v,maxDepth){
   let out=[{word:"I",v}],level=[out[0]],seen=new Set([v.join(",")]);const sizes=[1];
   for(let d=1;d<=maxDepth;d++){const next=[];for(const x of level)for(const ch of ["F","R"]){const w=ops(T,x.v,ch),key=w.join(",");if(!seen.has(key)){seen.add(key);next.push({word:x.word==="I"?ch:x.word+ch,v:w});}}out.push(...next);level=next;sizes.push(out.length);}
   return {out,sizes};
 }
 // Eliminate coefficient columns as rows in observation space. Their span determines
 // fit feasibility; tracked full-length vectors give exact prediction freedom.
 function span(cols,sites,y=null){
   const basis=new Map();
   for(const src of cols){
     let a=src.slice();
     for(const i of sites){if(a[i]===0)continue;const b=basis.get(i);if(b){const k=a[i];for(let h=0;h<n;h++)a[h]=M(a[h]-k*b[h]);}else{const k=inv(a[i]);a=a.map(x=>M(x*k));basis.set(i,a);a=null;break;}}
   }
   let residual=null,fit=null;if(y){residual=Array(n).fill(0);sites.forEach((i,j)=>residual[i]=y[j]);fit=Array(n).fill(0);
     for(const i of sites){const b=basis.get(i);if(b&&residual[i]){const k=residual[i];for(let h=0;h<n;h++){residual[h]=M(residual[h]-k*b[h]);fit[h]=M(fit[h]+k*b[h]);}}}
   }
   return {rank:basis.size,consistent:y?sites.every(i=>residual[i]===0):null,fit,basis};
 }
 function prediction(cols,sites,y,held){
   const s=span(cols,sites,y),all=span(cols,[...sites,...held]);
   // A held row is fixed iff its coordinate vanishes on the nullspace of training rows.
   // Process training then held sites in one elimination: derive each independent
   // residual vector using the training basis, take union of nonzero held positions.
   const free=new Set();
   for(const v of cols){const a=v.slice();for(const i of sites){const b=s.basis.get(i);if(a[i]&&b){const k=a[i];for(const h of [...sites,...held])a[h]=M(a[h]-k*b[h]);}}for(const h of held)if(a[h])free.add(h);}
   return {rank:s.rank,consistent:s.consistent,heldRank:all.rank-s.rank,fixed:held.filter(i=>!free.has(i)),fit:s.fit};
 }
 function sparse(cols,sites,y){
   // Center on first training symbol to eliminate intercept. Normalize by
   // first nonzero coordinate for exact projective hash.
   const t=y.slice(1).map(x=>M(x-y[0]));
   const normalize=v=>{let j=v.findIndex(x=>x!==0);if(j<0)return null;let a=v[j],b=inv(a);return {key:v.map(x=>M(x*b)).join(","),a};};
   const centered=cols.map(x=>sites.slice(1).map(i=>M(x.v[i]-x.v[sites[0]])));
   const map=new Map();centered.forEach((v,j)=>{const h=normalize(v);if(h){let l=map.get(h.key);if(!l){l=[];map.set(h.key,l);}l.push([j,h.a]);}});
   const hits=[],seen=new Set();
   function add(i,a,j,b){let terms=[[i,a],[j,b]].filter(t=>t[0]>=0&&t[1]);if(terms.length===2&&terms[0][0]===terms[1][0])terms=[[i,M(a+b)]].filter(t=>t[1]);terms.sort((x,y)=>x[0]-y[0]);const key=JSON.stringify(terms);if(seen.has(key))return;seen.add(key);
     const h=M(y[0]-terms.reduce((s,[i,a])=>s+a*cols[i].v[sites[0]],0));
     const v=Array.from({length:n},(_,k)=>M(h+terms.reduce((s,[i,a])=>s+a*cols[i].v[k],0)));
     assert(sites.every((i,j)=>v[i]===y[j]),"sparse replay");
     hits.push({terms:terms.map(([i,a])=>[cols[i].word,a]),h,v});
   }
   const one=normalize(t);if(one)for(const [j,b] of map.get(one.key)||[])add(-1,0,j,M(one.a*inv(b)));
   for(let i=0;i<cols.length;i++)for(let a=1;a<q;a++){
     const rem=t.map((x,j)=>M(x-a*centered[i][j])),h=normalize(rem);
     if(!h){add(i,a,-1,0);continue;}
     for(const [j,b] of map.get(h.key)||[])add(i,a,j,M(h.a*inv(b)));
   }
   return hits;
 }
 const results=[];
 for(const radix of [59,60]){
   const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
   const T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
   assert(T.length===n&&T.every(x=>x>=0&&x<n),"graph");
   // Invert a genuinely mixed, source-independent synthetic plant.
   const plantApply=v=>v.map((x,i)=>M(x+2*ops(T,ops(T,v,"F"),"R")[i]+7));
   // D=I+2 R F = diagonal with entry 1+2 indegree; if singular change
   // coefficient deterministically to first nonzero choice avoiding all degrees.
   const degrees=Array(n).fill(0);T.forEach(i=>degrees[i]++);
   let a=1;while(degrees.some(d=>M(1+a*d)===0))a++;
   const plantC=P.map((x,i)=>M((x-7)*inv(M(1+a*degrees[i]))));
   const plantReplay=plantC.map((x,i)=>M(x+a*ops(T,ops(T,plantC,"F"),"R")[i]+7));
   assert(eq(plantReplay,P),"plant forward replay");
   for(const [kind,v] of [["original",C],["plant",plantC]]){
     const {out,sizes}=columns(T,v,10),train=inner.slice(0,85),hold=inner.slice(85);
     let first=null,depths=[];
     for(let d=0;d<=10;d++){
       const cols=[...out.slice(0,sizes[d]).map(x=>x.v),Array(n).fill(1)];
       const s=span(cols,train,p56),all=span(cols,inner,known);
       depths.push({d,columns:cols.length,trainRank:s.rank,trainConsistent:s.consistent,allRank:all.rank,allConsistent:all.consistent});
       if(s.consistent&&first===null){const h=prediction(cols,train,p56,hold),o=prediction(cols,inner,known,ring);first={d,holdFreedom:h.heldRank,holdFixed:h.fixed.length,holdFixedCorrect:h.fixed.filter(i=>h.fit[i]===known[inner.indexOf(i)]).length,holdWitnessMatches:hold.filter(i=>h.fit[i]===known[inner.indexOf(i)]).length,allConsistent:o.consistent,outerFreedom:o.consistent?o.heldRank:null,outerFixed:o.consistent?o.fixed.length:null,outerWitness:o.consistent?ring.map(i=>o.fit[i]):null};}
       if(all.rank===180&&d>=7)break;
     }
     const hits=sparse(out,train,p56),pass=hits.filter(h=>hold.every((i,j)=>h.v[i]===p57[j]));
     results.push({radix,kind,plantA:kind==="plant"?a:null,uniqueColumns:out.length,sizes,depths,first,sparseTrainHits:hits.length,sparseHoldoutHits:pass.length,sparseSolutions:pass.map(h=>({terms:h.terms,h:h.h,outer:ring.map(i=>h.v[i]),outerCorrect:kind==="plant"?ring.filter((i,j)=>h.v[i]===donor[j]).length:null}))});
   }
 }
 assert(results.filter(r=>r.kind==="plant").every(r=>r.sparseHoldoutHits>0&&r.sparseSolutions.some(s=>s.outerCorrect===76)),"plant recovery");
 return {authenticReplay:85,results};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`input changed: ${path}`);return JSON.parse(b)});
console.log(JSON.stringify(experiment(...data),null,2));
