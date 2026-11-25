'use strict';
// Agent17, 2026-11-25. Node 22, no dependencies. Run from repository root.
// Two selected authentic native donor windows are deliberate counterexamples, not recovered LP2 text.
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
function experiment(grid,corpus,solved){
 const N=256,Q=29,M=x=>(x%Q+Q)%Q,A=(x,m)=>{if(!x)throw Error(m)},range=n=>Array.from({length:n},(_,i)=>i),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const inv=range(Q).map(x=>range(Q).find(y=>M(x*y)===1)||0);
 const native=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const Ck=[...corpus.pages[56].indices,...corpus.pages[57].indices],Pk=[...native("p56_an_end"),...native("p57_parable")];
 A(Ck.length===180&&Pk.length===180&&corpus.pages[55].indices.length===76,"source lengths");
 const primes=[];for(let i=2;primes.length<85;i++){let ok=true;for(let d=2;d*d<=i;d++)if(i%d===0){ok=false;break}if(ok)primes.push(i)}
 let cursor=0;const replay56=Pk.slice(0,85).map(x=>x===0?0:M(x+primes[cursor++]-1));
 A(cursor===84&&eq(replay56,Ck.slice(0,85))&&eq(Pk.slice(85),Ck.slice(85)),"authentic p56/p57 replay");
 const perimeter=[...range(8),...range(31).map(i=>8*(i+1)+7),...range(7).map(i=>254-i),...range(30).map(i=>240-8*i)];
 A(perimeter.length===76&&new Set(perimeter).size===76,"perimeter");
 function rref(rows,n,rhs=null){
   const r=rows.map((v,i)=>Uint8Array.from(rhs===null?Array.from(v,M):[...Array.from(v,M),M(rhs[i])]));
   const piv=[];const width=n+(rhs!==null?1:0);
   for(let c=0;c<n&&piv.length<r.length;c++){
     const k=piv.length;let p=k;while(p<r.length&&!r[p][c])p++;if(p===r.length)continue;
     [r[k],r[p]]=[r[p],r[k]];const z=inv[r[k][c]];for(let j=c;j<width;j++)r[k][j]=M(r[k][j]*z);
     for(let i=0;i<r.length;i++)if(i!==k&&r[i][c]){const a=r[i][c];for(let j=c;j<width;j++)r[i][j]=M(r[i][j]-a*r[k][j])}
     piv.push(c);
   }
   return {r,piv,rank:piv.length,consistent:rhs===null||r.slice(piv.length).every(v=>v[n]===0)};
 }
 function forcedEquality(rows){
   const {r,piv,rank}=rref(rows,Q);const map=new Map();
   for(let i=0;i<Q;i++){
     const j=piv.indexOf(i);const v=range(Q).map(k=>j<0?+(i===k):k===i?0:M(-r[j][k]));const s=v.join(",");
     if(map.has(s))return {pair:[map.get(s),i],rank};map.set(s,i);
   }
   return {pair:null,rank};
 }
 function layout(axis,outerRev,innerRev,snake){
   const outer=axis==="row"?30:6,inner=axis==="row"?6:30,sites=[];
   for(let i=0;i<outer;i++)for(let j=0;j<inner;j++){
     const a=outerRev?outer-i:i+1,b=(innerRev!==(snake&&i%2===1))?inner-j:j+1;
     sites.push(axis==="row"?8*a+b:8*b+a);
   }
   A(new Set([...sites,...perimeter]).size===N,"layout");
   return sites;
 }
 function table(radix){
   const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
   const T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
   A(T.length===N&&T.every(x=>x>=0&&x<N),"source table");return T;
 }
 function siblingPairs(T,sites){
   const degree=range(N).map(()=>0);T.forEach(x=>degree[x]++);
   const groups=new Map();sites.forEach((x,i)=>{if(!degree[x]){const g=groups.get(T[x])||[];g.push(i);groups.set(T[x],g)}});
   return [...groups.values()].flatMap(g=>g.slice(1).map(i=>[g[0],i]));
 }
 function constraints(pairs,C,P,a){
   return pairs.map(([i,j])=>{const r=range(Q).map(()=>0);r[P[i]]++;r[P[j]]--;r[C[i]]-=a;r[C[j]]+=a;return r.map(M)});
 }
 const gate=[];
 for(const radix of [59,60])for(const axis of ["row","column"])for(const outerRev of [false,true])for(const innerRev of [false,true])for(const snake of [false,true]){
   const sites=layout(axis,outerRev,innerRev,snake),pairs=siblingPairs(table(radix),sites);
   const tests=range(Q).map(a=>({a,...forcedEquality(constraints(pairs,Ck,Pk,a))}));
   gate.push({radix,axis,outerRev,innerRev,snake,pairs:pairs.length,tests});
 }
 const survivors=gate.filter(g=>g.tests.some(t=>t.pair===null));
 A(survivors.length===1&&survivors[0].radix===60&&survivors[0].axis==="column"&&!survivors[0].outerRev&&!survivors[0].innerRev&&!survivors[0].snake&&eq(survivors[0].tests.filter(t=>t.pair===null).map(t=>t.a),range(27).map(i=>i+2)),"surviving gate");
 const T=table(60),sites=layout("column",false,false,false),C=range(N).map(()=>0);
 perimeter.forEach((s,i)=>C[s]=corpus.pages[55].indices[i]);sites.forEach((s,i)=>C[s]=Ck[i]);
 const allPairs=siblingPairs(T,range(N));A(allPairs.length===17,"sibling rank");
 function F(v){return Uint8Array.from(T,i=>v[i])}
 function R(v){const u=new Uint8Array(N);for(let i=0;i<N;i++)u[T[i]]=M(u[T[i]]+v[i]);return u}
 function closure(v){
   const queue=[{w:"F",v:F(v)},{w:"R",v:R(v)}],e=Array(N).fill(null),out=[];
   for(let k=0;k<queue.length;k++){
     const x=queue[k],r=x.v.slice();
     for(let p=0;p<N;p++)if(e[p]&&r[p]){const a=r[p];for(let j=p;j<N;j++)r[j]=M(r[j]-a*e[p][j])}
     const p=r.findIndex(z=>z!==0);if(p<0)continue;
     const z=inv[r[p]];for(let j=p;j<N;j++)r[j]=M(r[j]*z);e[p]=r;out.push(x);
     queue.push({w:x.w+"F",v:F(x.v)},{w:x.w+"R",v:R(x.v)});
   }
   A(out.every(x=>allPairs.every(([i,j])=>x.v[i]===x.v[j])),"sibling span");
   return out;
 }
 const I=new Uint8Array(N*N);for(let i=0;i<N;i++)I[i*N+i]=1;
 const cache=new Map([["",I]]);
 function matrix(w){
   if(cache.has(w))return cache.get(w);
   const p=matrix(w.slice(0,-1)),out=new Uint8Array(N*N);
   if(w.endsWith("F"))for(let i=0;i<N;i++)out.set(p.subarray(T[i]*N,(T[i]+1)*N),i*N);
   else for(let i=0;i<N;i++){const j=T[i]*N,k=i*N;for(let h=0;h<N;h++)out[j+h]=M(out[j+h]+p[k+h])}
   cache.set(w,out);return out;
 }
 function matvec(D,v){return range(N).map(i=>{let s=0;for(let j=0;j<N;j++)s+=D[i*N+j]*v[j];return M(s)})}
 function model(pi,a){
   A(new Set(pi).size===Q&&pi.every(x=>Number.isInteger(x)&&x>=0&&x<Q),"permutation");
   const v=C.map(x=>pi[x]),features=closure(v),n=features.length;
   A(n===N-allPairs.length,"saturated nonempty span");
   const W=range(N).map(i=>Uint8Array.from(features,x=>x.v[i]));
   const target=sites.map((s,i)=>M(pi[Pk[i]]-a*v[s]));
   const fit=rref(sites.map(s=>W[s]),n,target);A(fit.consistent&&fit.rank===171,"known suffix fit");
   const free=range(n).filter(i=>!fit.piv.includes(i));
   A(free.length===68,"free fit directions");
   return {pi,a,v,features,W,n,fit,free};
 }
 function coeffFrom(r,n,free=[],values=[]){
   A(r.consistent&&free.length===values.length,"coefficients");const x=range(n).map(()=>0);
   free.forEach((j,i)=>x[j]=values[i]);
   r.piv.forEach((p,i)=>{let v=r.r[i][n];for(const f of free)v-=r.r[i][f]*x[f];x[p]=M(v)});
   return x;
 }
 function fullDecode(m,coeff){
   const {pi,a,v,features}=m,Dm=Uint8Array.from(I,x=>a*x);
   for(let k=0;k<features.length;k++)if(coeff[k]){
     const u=matrix(features[k].w),z=coeff[k];for(let j=0;j<Dm.length;j++)Dm[j]=M(Dm[j]+z*u[j]);
   }
   const y=matvec(Dm,v),P=y.map(x=>pi.indexOf(x));
   A(eq(sites.map(s=>P[s]),Pk),"authentic suffix");
   const E=rref(range(N).map(i=>Dm.subarray(i*N,(i+1)*N)),N,y);
   if(E.rank!==N)return {rank:E.rank};
   const restored=E.r.map(r=>pi.indexOf(r[N]));
   A(eq(restored,C),"exact forward reencryption");
   return {rank:N,p55:perimeter.map(s=>P[s]),knownMatches:180,replayed:N,coeff};
 }
 const fixedPi=[0,2,1,3,20,9,21,7,8,11,4,6,13,14,16,18,22,19,23,24,5,28,25,17,10,15,26,12,27];
 const fm=model(fixedPi,2),fixed=[];
 for(let i=0;i<perimeter.length;i++){
   const row=fm.W[perimeter[i]];
   const moving=fm.free.some(f=>M(row[f]-fm.fit.piv.reduce((s,p,j)=>s+row[p]*fm.fit.r[j][f],0))!==0);
   if(!moving)fixed.push(i);
 }
 let seed=0x17c0ffee;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%Q}
 const fixedWitnesses=[];
 for(let trial=0;trial<32&&fixedWitnesses.length<2;trial++){
   const coeff=coeffFrom(fm.fit,fm.n,fm.free,fm.free.map(rnd)),d=fullDecode(fm,coeff);
   if(d.rank===N)fixedWitnesses.push({trial,...d});
 }
 A(fixedWitnesses.length===2&&fixedWitnesses[0].p55.some((x,i)=>x!==fixedWitnesses[1].p55[i]),"fixed alphabet ambiguity");
 const donorSpecs=[
   {name:"0_warning",start:102,pi:[0,1,25,7,12,3,4,8,10,13,19,2,15,20,21,11,6,26,27,16,18,9,5,23,28,14,24,17,22]},
   {name:"jpg107-167",start:36,pi:[0,1,25,9,22,20,15,17,26,13,4,21,16,18,23,8,24,6,12,3,19,11,14,5,7,2,27,10,28]}
 ];
 const donors=donorSpecs.map(d=>{
   const src=solved.sections.find(s=>s.name===d.name).source_text,bounds=new Set([0]);let pos=0,inRun=false;
   for(const x of src){if(corpus.runes.includes(x)){if(!inRun)bounds.add(pos);inRun=true;pos++}else if(inRun){bounds.add(pos);inRun=false}}bounds.add(pos);
   const target=native(d.name).slice(d.start,d.start+76);
   A(target.length===76&&bounds.has(d.start)&&bounds.has(d.start+76),"complete source word window");
   const P=range(N).map(()=>0);sites.forEach((s,i)=>P[s]=Pk[i]);perimeter.forEach((s,i)=>P[s]=target[i]);
   const a=8,m=model(d.pi,a),b=range(N).map(i=>M(d.pi[P[i]]-a*m.v[i]));
   A(constraints(allPairs,C,P,a).every(r=>M(r.reduce((s,x,j)=>s+x*d.pi[j],0))===0),"full sibling constraints");
   const fit=rref(m.W,m.n,b);A(fit.consistent&&fit.rank===m.n,"full known+donor fit");
   const coeff=coeffFrom(fit,m.n),decoded=fullDecode(m,coeff);
   A(decoded.rank===N&&eq(decoded.p55,target),"full-rank donor replay");
   return {name:d.name,start:d.start,end:d.start+76,pi:d.pi,a,span:m.n,knownRank:m.fit.rank,words:m.features.map(x=>x.w),terms:coeff.filter(x=>x!==0).length,maxDegree:Math.max(...m.features.map(x=>x.w.length)),...decoded};
 });
 const hamming=(a,b)=>a.filter((x,i)=>x!==b[i]).length;
 return {authentic:{p56:85,primes:cursor,p57:95},layoutGate:{tests:32*29,excluded:32*29-27,survivingLayouts:survivors.length,survivingSlopes:survivors[0].tests.filter(t=>t.pair===null).map(t=>t.a),gate},geometry:{radix:60,axis:"column",outerRev:false,innerRev:false,snake:false,perimeter:"clockwise upper-left",siblingConstraints:17},fixedAlphabet:{pi:fixedPi,a:2,span:fm.n,knownRank:fm.fit.rank,free:fm.free.length,fixedPositions:fixed,fixedValues:fixed.map(i=>fixedWitnesses[0].p55[i]),words:fm.features.map(x=>x.w),witnesses:fixedWitnesses,hamming:hamming(fixedWitnesses[0].p55,fixedWitnesses[1].p55)},donors,donorHamming:hamming(donors[0].p55,donors[1].p55)};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`source changed: ${path}`);return JSON.parse(b)});
console.log(JSON.stringify(experiment(...data),null,2));
