'use strict';
// Agent 9 — graph-equivariant reversible decoder identifiability, 25 Nov 2026.
const fs=require('node:fs'),crypto=require('node:crypto');
const specs=[
  [
    "resources/liber-primus/lp2-grid-256.json",
    "2550eae357442912220e05dc51147523a61dd75a"
  ],
  [
    "resources/liber-primus/lp2-corpus.json",
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  ],
  [
    "resources/external/relikd-solved-gp29-native-v1.json",
    "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  ]
];
function experiment(grid,corpus,solved){
 const assert=(x,m)=>{if(!x)throw Error(m)},M=x=>(x%29+29)%29;
 let seed=0x3301cafe;const rng=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
 const fac=n=>{let r=1n;for(let i=2;i<=n;i++)r*=BigInt(i);return r};
 const nat=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const ct=corpus.pages[55].indices.concat(corpus.pages[56].indices,corpus.pages[57].indices);
 const pt=nat("p56_an_end").concat(nat("p57_parable"));
 assert(ct.length===256&&pt.length===180,"lengths");
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 let clock=0;for(let i=0;i<85;i++){const p=pt[i];assert(ct[76+i]===(p===0?0:M(p+primes[clock++]-1)),"authentic p56 replay "+i)}
 assert(clock===84&&pt.slice(85).every((x,i)=>x===ct[161+i]),"p56 clock / p57 clear");
 function graph(T){
  const n=T.length,children=Array.from({length:n},()=>[]);T.forEach((v,i)=>children[v].push(i));
  const deg=children.map(x=>x.length),q=[];for(let i=0;i<n;i++)if(!deg[i])q.push(i);
  for(let i=0;i<q.length;i++){const v=T[q[i]];if(--deg[v]===0)q.push(v)}
  const cyclic=deg.map(x=>x>0),cycles=[],seen=new Set();
  for(let i=0;i<n;i++)if(cyclic[i]&&!seen.has(i)){const c=[];let j=i;do{seen.add(j);c.push(j);j=T[j]}while(j!==i);cycles.push(c)}
  return {T,n,cyclic,cycles,children:children.map(a=>a.filter(x=>!cyclic[x])),order:[...q,...cycles.flat()]};
 }
 function symmetry(g,color,orbits=false){
  const {T,n,cycles,children,order}=g,ids=Array(n),table=new Map(),counts=new Map();let size=1n;
  for(const u of order){
   const a=children[u].map(v=>ids[v]).sort((a,b)=>a-b);
   const k=JSON.stringify([color[u],a]);if(!table.has(k))table.set(k,table.size);ids[u]=table.get(k);
   for(let i=0,j;i<a.length;i=j){j=i+1;while(j<a.length&&a[j]===a[i])j++;size*=fac(j-i)}
  }
  const orb=Array(n);for(const c of cycles){
   const seq=c.map(v=>ids[v]);const rotations=c.map((_,i)=>seq.slice(i).concat(seq.slice(0,i)).join(","));
   const canonical=rotations.reduce((a,b)=>a<b?a:b);size*=BigInt(rotations.filter(x=>x===rotations[0]).length);
   counts.set(canonical,(counts.get(canonical)||0)+1);
   if(orbits)c.forEach((v,i)=>orb[v]="R"+rotations[i]);
  }
  for(const v of counts.values())size*=fac(v);
  if(orbits)for(let i=order.length-1;i>=0;i--){const v=order[i];if(!g.cyclic[v])orb[v]=orb[T[v]]+"|"+ids[v]}
  return {size,orb};
 }
 function assess(g,C,known,outer,attempts=12){
  const s=symmetry(g,C,true),values=new Map();let conflict=null;
  for(let v=0;v<g.n;v++)if(known[v]!==null){
   const k=s.orb[v];if(values.has(k)&&values.get(k).value!==known[v]){conflict=[values.get(k).site,v];break}
   values.set(k,{value:known[v],site:v});
  }
  if(conflict)return {status:"cipher-symmetry-conflict",witness:conflict.map(i=>({site:i,C:C[i],P:known[i]}))};
  const free=new Map(),partial=s.orb.map(k=>{if(values.has(k))return values.get(k).value;if(!free.has(k))free.set(k,29+free.size);return free.get(k)});
  const forced=outer.flatMap((v,i)=>partial[v]<29?[{offset:i,value:partial[v]}]:[]);
  const a=symmetry(g,partial).size,j=symmetry(g,partial.map((p,i)=>[p,C[i]])).size;
  assert(j===s.size,"cipher stabilizer must fix completed partial colors");
  if(a!==j)return {status:"unavoidable-plain-symmetry",Corder:String(s.size),partialOrder:String(a),forced};
  const witnesses=[],seen=Array.from({length:outer.length},()=>new Set());
  for(let t=0;t<attempts;t++){
   const digits=Array.from({length:free.size},()=>rng(29));
   const p=partial.map(v=>v<29?v:digits[v-29]);
   if(symmetry(g,p).size!==s.size)continue;
   // C stabilizer already fixes every p; equality of orders proves equality of groups.
   const tape=outer.map(v=>p[v]);if(witnesses.some(w=>w.every((v,i)=>v===tape[i])))continue;
   witnesses.push(tape);tape.forEach((v,i)=>seen[i].add(v));
  }
  return {status:witnesses.length?"feasible":"no-sampled-completion",Corder:String(s.size),freeOrbits:free.size,forced,witnessCount:witnesses.length,varied:seen.filter(x=>x.size>1).length,witnesses:witnesses.slice(0,2)};
 }
 function ring(d,corner,rev){
  const r0=d,r1=31-d,c0=d,c1=7-d,arr=[];
  for(let c=c0;c<=c1;c++)arr.push(8*r0+c);for(let r=r0+1;r<=r1;r++)arr.push(8*r+c1);
  for(let c=c1-1;c>=c0;c--)arr.push(8*r1+c);for(let r=r1-1;r>r0;r--)arr.push(8*r+c0);
  const cs=[8*r0+c0,8*r0+c1,8*r1+c1,8*r1+c0],k=arr.indexOf(cs[corner]);
  return arr.map((_,i)=>arr[(k+(rev?-i:i)+arr.length)%arr.length]);
 }
 const layouts=[];
 for(const axis of ["row","column"])for(const outerRev of [false,true])for(const innerRev of [false,true])for(const snake of [false,true]){
  const sites=[],outer=axis==="row"?30:6,inner=axis==="row"?6:30;
  for(let i=0;i<outer;i++)for(let j=0;j<inner;j++){const a=outerRev?outer-i:i+1,b=(innerRev!==(snake&&i%2===1))?inner-j:j+1;sites.push(axis==="row"?8*a+b:8*b+a)}
  layouts.push({name:[axis,+outerRev,+innerRev,+snake].join("-"),sites});
 }
 for(let corner=0;corner<4;corner++)for(const rev of [false,true])layouts.push({name:`rings-${corner}-${+rev}`,sites:[1,2,3].flatMap(d=>ring(d,corner,rev))});
 function place(outer,inner,C0,P0){const C=Array(256),P=Array(256).fill(null);outer.forEach((v,i)=>C[v]=C0[i]);inner.forEach((v,i)=>{C[v]=C0[76+i];P[v]=P0[i]});assert(C.every(Number.isInteger)&&new Set([...outer,...inner]).size===256,"placement");return [C,P]}
 // Exhaustive independent permutation oracle on 100 small random functional graphs.
 function perms(a){if(a.length===0)return [[]];return a.flatMap((v,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[v,...p]))}
 const perm=perms([0,1,2,3,4]);
 for(let t=0;t<100;t++){
  const T=Array.from({length:5},()=>rng(5)),c=Array.from({length:5},()=>rng(3)),g=graph(T),s=symmetry(g,c,true);
  const valid=perm.filter(p=>p.every((v,i)=>c[v]===c[i]&&T[v]===p[T[i]]));
  assert(s.size===BigInt(valid.length),"small graph order");
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)assert((s.orb[i]===s.orb[j])===valid.some(p=>p[i]===j),"small graph orbit");
 }
 const out=[],controls=[];
 for(const radix of [59,60]){
  const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet,T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1])),g=graph(T);
  for(const l of layouts)for(let corner=0;corner<4;corner++)for(const rev of [false,true]){
   const outer=ring(0,corner,rev),[C,P]=place(outer,l.sites,ct,pt);
   out.push({radix,layout:l.name,corner,rev,...assess(g,C,P,outer)});
  }
  for(const donor of ["0_warning","0_welcome","0_koan_1"]){
   const l=layouts[0],outer=ring(0,0,false),target=nat(donor).slice(0,76),[P]=place(outer,l.sites,target.concat(pt),pt);
   const C=P.map((v,i)=>g.cyclic[i]?v:M(v+P[T[i]])),back=Array(256);
   for(let k=g.order.length-1;k>=0;k--){const i=g.order[k];back[i]=g.cyclic[i]?C[i]:M(C[i]-back[T[i]])}
   assert(back.every((v,i)=>v===P[i]),"equivariant cipher exact roundtrip");
   const known=P.map((v,i)=>outer.includes(i)?null:v),a=assess(g,C,known,outer,32);
   assert(a.status==="feasible"&&a.forced.every(f=>target[f.offset]===f.value),"native control");
   controls.push({radix,donor,forced:a.forced.length,varied:a.varied,witnessCount:a.witnessCount,replay:256});
  }
 }
 const summary={};
 for(const radix of [59,60]){
  const a=out.filter(x=>x.radix===radix),b=a.filter(x=>x.status==="feasible");
  summary[radix]={layouts:a.length,statusCounts:Object.fromEntries([...new Set(a.map(x=>x.status))].map(s=>[s,a.filter(x=>x.status===s).length])),feasibleForcedRange:b.length?[Math.min(...b.map(x=>x.forced.length)),Math.max(...b.map(x=>x.forced.length))]:null,feasibleVariedRange:b.length?[Math.min(...b.map(x=>x.varied)),Math.max(...b.map(x=>x.varied))]:null,feasibleWitnesses:b.reduce((s,x)=>s+x.witnessCount,0)};
 }
 const feasible=out.filter(x=>x.status==="feasible"),all=out.filter(x=>x.status==="feasible"||x.status==="no-sampled-completion");
 const commonForced=Array.from({length:76},(_,i)=>{const v=all[0]?.forced.find(f=>f.offset===i)?.value;return v!==undefined&&all.every(x=>x.forced.some(f=>f.offset===i&&f.value===v))?{offset:i,value:v}:null}).filter(Boolean);
 return {summary,commonForced,controls,originalCases:out,smallOracleTrials:100};
}
const data=specs.map(([path,sha])=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(actual!==sha)throw Error('source changed '+path);return JSON.parse(b)});
console.log(JSON.stringify(experiment(...data),null,2));
