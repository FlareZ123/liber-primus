'use strict';
// Graph elimination of 29 unknown coordinates into the eight common shifts.
module.exports=function projectedTrial(h,pl,config={}){
 const {by,TRAIN,encode,decode,sameAction,key}=h,N=29,Q=8;
 const mod=x=>((x%N)+N)%N, inv=Array.from({length:N},(_,v)=>v?Array.from({length:N},(_,i)=>i).find(i=>v*i%N===1):0);
 const zero=()=>new Int16Array(Q),unit=Array.from({length:Q},(_,j)=>{const v=zero();v[j]=1;return v});
 const add=(a,b,s=1)=>Int16Array.from(a,(v,i)=>mod(v+s*b[i]));
 const lead=a=>a.findIndex(v=>v!==0);
 function reduce(a,rows){a=Int16Array.from(a);for(let j=0;j<Q;j++){const r=rows[j],v=a[j];if(r&&v)for(let i=j;i<Q;i++)a[i]=mod(a[i]-v*r[i])}return a}
 function impose(a,rows){a=reduce(a,rows);const j=lead(a);if(j<0)return;const v=inv[a[j]];rows[j]=a.map(x=>x*v%N)}
 function edges(c,w,start){
  const out=[];let phase=start;
  for(let i=0;i<w.length;i++){const p=w[i];if(p===0){if(c[i]!==0)return null;continue}out.push([p,c[i],phase]);phase=(phase+1)%Q}
  return out;
 }
 function project(es){
  const adj=Array.from({length:N},()=>[]),forward=new Int16Array(Q*N).fill(-1),back=new Int16Array(Q*N).fill(-1),z=new Int8Array(Q).fill(-1);
  for(const [p,c,j] of es){
   const a=j*N+p,b=j*N+c,f=+(p===c);
   if((forward[a]>=0&&forward[a]!==c)||(back[b]>=0&&back[b]!==p)||(z[j]>=0&&z[j]!==f))return null;
   forward[a]=c;back[b]=p;z[j]=f;adj[p].push([c,j,1]);adj[c].push([p,j,-1]);
  }
  const rows=Array(Q).fill(null),pot=Array(N).fill(null),components=[];
  for(let root=0;root<N;root++)if(!pot[root]){
   pot[root]=zero();const members=[root];for(let i=0;i<members.length;i++){
    const a=members[i];for(const [b,j,s] of adj[a]){const p=add(pot[a],unit[j],s);if(pot[b])impose(add(p,pot[b],-1),rows);else{pot[b]=p;members.push(b)}}
   }components.push(members);
  }
  if(components.length===1){const sum=pot.reduce((a,b)=>add(a,b),zero());impose(sum,rows)}
  const rank=rows.filter(Boolean).length;if(rank===Q)return null;
  if(Array.from({length:Q/2},(_,i)=>lead(reduce(add(unit[i],unit[i+Q/2],-1),rows))<0).every(Boolean))return null;
  const forms=pot.map(a=>reduce(a,rows));for(const members of components){const seen=new Set();for(const v of members){const s=forms[v].join();if(seen.has(s))return null;seen.add(s)}}
  return {rows,rank,components,forms};
 }
 function complete(state,limit=100000){
  const {rows,rank,components,forms}=state,free=Array.from({length:Q},(_,i)=>i).filter(i=>!rows[i]),solutions=[],k=new Int16Array(Q),out=new Int16Array(N),stats={projective:0,distinct:0,packed:0,nodes:0,capped:false};
  if(free.length>3)return {solutions,stats,skipped:true};
  const ordered=[...components].sort((a,b)=>Number(b.includes(0))-Number(a.includes(0))||b.length-a.length);
  function checkKey(){
   for(let j=Q-1;j>=0;j--)if(rows[j]){let sum=0;for(let i=j+1;i<Q;i++)sum+=rows[j][i]*k[i];k[j]=mod(-sum)}
   stats.projective++;if(!Array.from({length:Q/2},(_,i)=>k[i]!==k[i+Q/2]).some(Boolean))return;
   const val=forms.map(a=>mod(a.reduce((sum,v,j)=>sum+v*k[j],0)));
   for(const members of ordered)if(new Set(members.map(x=>val[x])).size!==members.length)return;
   stats.distinct++;
   const opts=ordered.map(members=>Array.from({length:members.includes(0)?1:N},(_,t)=>{const shift=members.includes(0)?mod(-val[0]):t;let mask=0;for(const a of members)mask|=1<<mod(val[a]+shift);return {shift,mask}}));
   function pack(i,used){
    if(stats.capped)return;if(++stats.nodes>limit){stats.capped=true;return}
    if(i===ordered.length){stats.packed++;solutions.push({pi:Array.from(out),k:Array.from(k)});return}
    for(const {shift,mask} of opts[i])if(!(used&mask)){for(const a of ordered[i])out[a]=mod(val[a]+shift);pack(i+1,used|mask);if(stats.capped)return}
   }pack(0,0);
  }
  function enumTail(i){if(stats.capped)return;if(i===free.length){checkKey();return}for(let v=0;v<N;v++){k[free[i]]=v;enumTail(i+1);if(stats.capped)return}}
  for(let first=0;first<free.length&&!stats.capped;first++){for(let i=0;i<first;i++)k[free[i]]=0;k[free[first]]=1;enumTail(first+1)}
  return {solutions,stats,skipped:false};
 }
 const order=pl.cipher.slice(0,TRAIN).map((c,g)=>({g,L:c.length})).sort((a,b)=>b.L-a.L||a.g-b.g).map(x=>x.g);
 // Oracle diagnostic only: truth is supplied to measure how quickly linear graph constraints identify the action.
 const es=[],oracle=[];
 const start0=Array.from({length:Q},(_,j)=>j).find(j=>encode(pl.truth[order[0]],pl.pi,pl.k,j).join()===pl.cipher[order[0]].join());
 for(const g of order){
  const c=pl.cipher[g],w=pl.truth[g],s=Array.from({length:Q},(_,j)=>j).find(j=>encode(w,pl.pi,pl.k,j).join()===c.join());
  if(s===undefined)throw Error('plant mismatch');es.push(...edges(c,w,(s-start0+Q)%Q));const state=project(es);if(!state)throw Error('rejected true path');
  const row={g,rank:state.rank,components:state.components.map(x=>x.length).sort((a,b)=>b-a)};
  if(state.rank>=5){const r=complete(state,config.oracleCap??10000);row.completion=r.stats;row.effectiveExact=r.solutions.filter(x=>sameAction(x.pi,x.k,pl.pi,pl.k)).length;
   if(!r.stats.capped&&r.solutions.length===1&&row.effectiveExact===1){oracle.push(row);break}}
  oracle.push(row);
 }
 function domain(g,first){const c=pl.cipher[g],out=[];
  for(const {w} of by[c.length])for(let j=0;j<(first?1:Q);j++){const e=edges(c,w,j);if(e&&project(e))out.push({w,j,e})}
  return out;
 }
 const a=domain(order[0],true),b=domain(order[1],false),total=a.length*b.length;
 const bound=Math.min(total,config.pairCap??100000),counts=Array(Q).fill(0),sizes=Array(N+1).fill(0),testedTrue=[];
 // Deterministic evenly-spaced indices, no use of plant labels to choose candidates.
 for(let t=0;t<bound;t++){const pos=Math.floor(t*total/bound),x=a[Math.floor(pos/b.length)],y=b[pos%b.length],state=project([...x.e,...y.e]);if(!state)continue;counts[state.rank]++;sizes[Math.max(...state.components.map(v=>v.length))]++;if(x.w.join()===pl.truth[order[0]].join()&&y.w.join()===pl.truth[order[1]].join())testedTrue.push({rank:state.rank,s:y.j})}
 return {oracle,anchorGroups:order.slice(0,2),domains:[a.length,b.length],pairs:total,tested:bound,survivingRankCounts:counts,largestComponentCounts:sizes,testedTrue};
};
