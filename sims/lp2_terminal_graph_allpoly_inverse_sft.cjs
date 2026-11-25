'use strict';
// Agent 2 — terminal graph inverse; run from repository root with Node 22.
const fs = require('node:fs');
const crypto = require('node:crypto');
const inputs = [
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
 const n=256,q=29,M=x=>(x%q+q)%q,check=(c,m)=>{if(!c)throw Error(m)};
 const inv=x=>{for(let y=1;y<q;y++)if(M(x*y)===1)return y;throw Error("zero pivot")};
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const native=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const p56=native("p56_an_end"),p57=native("p57_parable");
 const inner=Array.from({length:n},(_,i)=>i).filter(i=>i>=8&&i<248&&i%8>0&&i%8<7);
 const ring=[...Array.from({length:8},(_,i)=>i),...Array.from({length:31},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>254-i),...Array.from({length:30},(_,i)=>(30-i)*8)];
 check(ring.length===76&&new Set([...ring,...inner]).size===256,"partition");
 const [c55,c56,c57]=[55,56,57].map(i=>corpus.pages[i].indices);
 check(c55.length===76&&c56.length===85&&c57.length===95&&p56.length===85&&eq(p57,c57),"source lengths/clear p57");
 let primes=[];for(let k=2;primes.length<84;k++)if(primes.every(p=>p*p>k||k%p!==0))primes.push(k);
 let j=0;check(eq(p56.map((p,i)=>i===56?p:M(p+primes[j++]-1)),c56)&&j===84&&p56[56]===0,"authentic p56 replay");
 const layout=(a,b,c)=>{const v=Array(n).fill(0);ring.forEach((x,i)=>v[x]=a[i]);inner.forEach((x,i)=>v[x]=i<85?b[i]:c[i-85]);return v};
 const C=layout(c55,c56,c57),known=[...p56,...p57],knownMap=new Map(inner.map((i,j)=>[i,known[j]]));
 function elim(A,b=null){
   const k=A[0].length,a=A.map((r,i)=>b===null?r.slice():[...r,b[i]]),piv=[];
   for(let col=0,row=0;col<k&&row<a.length;col++){
     let z=row;while(z<a.length&&a[z][col]===0)z++;if(z===a.length)continue;
     [a[z],a[row]]=[a[row],a[z]];const u=inv(a[row][col]);
     for(let i=col;i<a[row].length;i++)a[row][i]=M(a[row][i]*u);
     for(let h=0;h<a.length;h++)if(h!==row&&a[h][col]!==0){const v=a[h][col];for(let i=col;i<a[h].length;i++)a[h][i]=M(a[h][i]-v*a[row][i]);}
     piv.push(col);row++;
   }
   const inconsistent=b!==null&&a.slice(piv.length).some(r=>r[k]!==0),x=Array(k).fill(0);
   if(b!==null&&!inconsistent)piv.forEach((col,i)=>x[col]=a[i][k]);
   return {rank:piv.length,inconsistent,x};
 }
 function powers(T){
   const states=[],seen=new Map();let s=Array.from({length:n},(_,i)=>i);
   while(!seen.has(s.join(","))){seen.set(s.join(","),states.length);states.push(s);s=s.map(i=>T[i]);}
   return {states,tail:seen.get(s.join(",")),period:states.length-seen.get(s.join(","))};
 }
 function features(v,states,mode){
   const f=states.map(s=>s.map(i=>v[i]));
   const r=states.map(s=>{const o=Array(n).fill(0);s.forEach((j,i)=>o[j]=M(o[j]+v[i]));return o});
   const cols=mode==="forward"?f:mode==="reverse"?r:[...f,...r.slice(1)];
   cols.push(Array(n).fill(1));return Array.from({length:n},(_,i)=>cols.map(c=>c[i]));
 }
 const predict=(A,x)=>A.map(r=>M(r.reduce((s,v,i)=>s+v*x[i],0)));
 function evaluate(A,Y){
   const K=inner.map(i=>A[i]),train=elim(K.slice(0,85),Y.slice(0,85)),all=elim(K,Y),full=elim(A);
   let first=null;if(all.inconsistent){let lo=1,hi=180;while(lo<hi){const m=(lo+hi)>>1;if(elim(K.slice(0,m),Y.slice(0,m)).inconsistent)hi=m;else lo=m+1;}first={knownOffset:lo-1,cell:inner[lo-1],page:lo<=85?56:57};}
   return {columns:A[0].length,trainRank:train.rank,trainConsistent:!train.inconsistent,allRank:all.rank,allConsistent:!all.inconsistent,augmentedRank:all.rank+Number(all.inconsistent),fullRank:full.rank,firstContradiction:first,outerFreedom:all.inconsistent?null:full.rank-all.rank,knownReplay:all.inconsistent?null:inner.filter((i,j)=>predict([A[i]],all.x)[0]===Y[j]).length,outer:all.inconsistent?null:ring.map(i=>predict([A[i]],all.x)[0])};
 }
 function classes(A){
   const m=new Map();for(let i=0;i<n;i++){const k=A[i].join(",");if(!m.has(k))m.set(k,[]);m.get(k).push(i);}
   const groups=[...m.values()],conflicts=groups.filter(g=>new Set(g.filter(i=>knownMap.has(i)).map(i=>knownMap.get(i))).size>1);
   const cross=groups.filter(g=>g.some(i=>knownMap.has(i))&&g.some(i=>!knownMap.has(i)));
   return {distinct:groups.length,conflicts:conflicts.map(g=>g.map(i=>({cell:i,plain:knownMap.get(i)??null}))),crossClasses:cross.length};
 }
 const tokens=grid.pages.flatMap(p=>p.tokens),results=[];
 check(tokens.length===256,"grid length");
 for(const radix of [59,60]){
   const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
   const T=tokens.map(t=>alphabet.indexOf(t[0])*radix+alphabet.indexOf(t[1]));
   check(T.every(x=>x>=0&&x<n),"table range");if(radix===60)check(eq(T,grid.bytes),"base60 bytes");
   const {states,tail,period}=powers(T),donor=native("0_warning").slice(0,76),plantP=layout(donor,p56,p57);
   const mergeWitnesses=[];
   for(let a=0;a<inner.length;a++)for(let b=a+1;b<inner.length;b++){
     const i=inner[a],j=inner[b];if(C[i]===C[j]&&T[i]===T[j]&&known[a]!==known[b])mergeWitnesses.push({cells:[i,j],knownOffsets:[a,b],cipher:C[i],next:T[i],plain:[known[a],known[b]]});
   }
   for(const mode of ["forward","reverse","both"]){
     const D=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j))),s=states[3];
     for(let i=0;i<n;i++)if(mode==="reverse")D[s[i]][i]=M(D[s[i]][i]+2);else D[i][s[i]]=M(D[i][s[i]]+2);
     const e=elim(D,plantP.map(x=>M(x-7)));check(!e.inconsistent&&e.rank===n,"invertible plant");
     const plantC=e.x,plant=evaluate(features(plantC,states,mode),known);
     check(plant.allConsistent&&plant.knownReplay===180,"plant fit");
     const outerRecovery=plant.outer.filter((x,i)=>x===donor[i]).length;
     if(plant.outerFreedom===0)check(outerRecovery===76,"identifiable plant");
     const A=features(C,states,mode),original=evaluate(A,known),nonlinear=classes(A);
     results.push({radix,mode,tail,period,powers:states.length,original,nonlinear,mergeWitnesses:mode==="forward"?mergeWitnesses:[],plant:{rank:plant.allRank,fullRank:plant.fullRank,outerFreedom:plant.outerFreedom,outerRecovery,exactEncoderReplay:eq(predict(D,plantC).map(x=>M(x+7)),plantP)}});
   }
 }
 check(eq(results.map(r=>r.original.allRank),[38,34,70,34,29,61]),"original ranks");
 check(results.every(r=>r.original.augmentedRank===r.original.allRank+1&&!r.original.trainConsistent&&r.plant.exactEncoderReplay),"original impossibility / controls");
 check(eq(results.map(r=>r.nonlinear.distinct),[249,187,256,248,186,256]),"nonlinear classes");
 check(eq(results.map(r=>r.nonlinear.conflicts.length),[2,16,0,3,14,0]),"nonlinear conflicts");
 check(results.filter(r=>r.mode==="forward").every(r=>r.mergeWitnesses.length===2),"placement-independent merge witnesses");
 return {sourceReplay:85,results};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`input blob changed: ${path}: ${actual}`);return JSON.parse(b);});
console.log(JSON.stringify(experiment(...data),null,2));
