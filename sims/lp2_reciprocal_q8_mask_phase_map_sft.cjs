'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,native){
 const N=29,Q=8,B=4096,M=128,FIT=232, LEN=308;
 const mp=new Map(gp.runes.map((x,i)=>[x,i]));
 const sections=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).filter(x=>mp.has(x)).map(x=>mp.get(x))}));
 const names=["0_welcome","0_koan_1","0_loss_of_divinity"];
 const keys=[[9,10,19,26,4,2,0,6],[24,8,24,10,17,23,10,28],[0,0,17,28,11,22,2,13]];
 const unig=new Float64Array(N).fill(.5),big=new Float64Array(N*N),rows=new Float64Array(N);
 for(const s of sections.filter(x=>!names.includes(x.name))){for(let i=0;i<s.p.length;i++){unig[s.p[i]]++;if(i){big[s.p[i-1]*N+s.p[i]]++;rows[s.p[i-1]]++}}}
 const total=unig.reduce((a,b)=>a+b), lp=Float64Array.from(unig,x=>Math.log(x/total));
 const lb=Float64Array.from(big,(x,i)=>Math.log((x+8*unig[i%N]/total)/(rows[Math.floor(i/N)]+8)));
 const mod=x=>(x+N)%N;
 function enc(p,key){let q=key.slice();return p.map(v=>{if(!v)return 0;let c=mod(q.shift()-v);q.push(v);return c})}
 function initial(){return {off:new Uint8Array(Q),phase:0,sc:new Float64Array(Q*N),held:0,mask:0}}
 function clone(s){return {...s,off:s.off.slice(),sc:s.sc.slice()}}
 function consume(s,c){const r=s.phase,o=mod(s.off[r]+c);s.off[r]=o;s.phase=(r+1)%Q;for(let k=0;k<N;k++){const v=mod(k-o);s.sc[r*N+k]=v===0?-Infinity:s.sc[r*N+k]+lp[v]}}
 function upper(s){let v=s.held*lp[0];for(let r=0;r<Q;r++){let a=-Infinity;for(let k=0;k<N;k++)a=Math.max(a,s.sc[r*N+k]);v+=a}return v}
 function masks(c){let st=[initial()],z=0,prunes=0;for(const x of c){if(x===0){const next=[];for(const s of st){const h=clone(s);h.mask+=2**z;h.held++;next.push(h);consume(s,x);next.push(s)}z++;st=next.map(s=>({s,v:upper(s)})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>b.v-a.v);prunes+=Math.max(0,st.length-B);st=st.slice(0,B).map(x=>x.s)}else for(const s of st)consume(s,x)}
  const ranked=st.map(s=>({s,v:upper(s)})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>b.v-a.v);return {ranked,prunes,z};
 }
 function positions(c,mask){let s=initial(),z=0;const pp=[];for(const x of c){if(x===0&&((Math.floor(mask/2**z++)%2)===1)){pp.push(null);continue}const r=s.phase;consume(s,x);pp.push([r,s.off[r]])}return {pp,s}}
 function solve(c,mask){
  const {pp,s}=positions(c,mask);const D=Array.from({length:Q},(_,r)=>Array.from({length:N},(_,i)=>i).filter(k=>Number.isFinite(s.sc[r*N+k])));if(D.some(x=>!x.length))return null;
  const U=Array.from({length:Q},()=>new Float64Array(N)),E=Array.from({length:Q},()=>new Float64Array(N*N));let constant=0;
  const fst=pp[0];if(!fst)constant+=lp[0];else for(const k of D[fst[0]])U[fst[0]][k]+=lp[mod(k-fst[1])];
  for(let i=1;i<pp.length;i++){const a=pp[i-1],b=pp[i];if(!a&&!b){constant+=lb[0];continue}if(!a){for(const k of D[b[0]])U[b[0]][k]+=lb[mod(k-b[1])];continue}if(!b){for(const k of D[a[0]])U[a[0]][k]+=lb[mod(k-a[1])*N];continue}
   if((a[0]+1)%Q!==b[0])throw Error("phase");
   for(const k of D[a[0]])for(const j of D[b[0]])E[a[0]][k*N+j]+=lb[mod(k-a[1])*N+mod(j-b[1])];
  }
  let best=-Infinity,key=null;
  for(const start of D[0]){let dp=new Float64Array(N).fill(-Infinity);dp[start]=U[0][start];const back=[];
   for(let r=1;r<Q;r++){let nd=new Float64Array(N).fill(-Infinity),bk=new Int8Array(N).fill(-1);for(const j of D[r]){let v=-Infinity,ki=-1;for(const k of D[r-1]){const w=dp[k]+E[r-1][k*N+j];if(w>v){v=w;ki=k}}nd[j]=v+U[r][j];bk[j]=ki}dp=nd;back[r]=bk}
   for(const last of D[Q-1]){const v=dp[last]+E[Q-1][last*N+start]+constant;if(v>best){best=v;key=Array(Q);key[Q-1]=last;for(let r=Q-1;r>0;r--)key[r-1]=back[r][key[r]]}}
  }
  const plain=pp.map(x=>x?mod(key[x[0]]-x[1]):0);if(String(enc(plain,key))!==String(c))throw Error("replay");
  return {score:best,key,plain,mask,off:Array.from(s.off),phase:s.phase};
 }
 function continueHeld(c,fit){let states=[{off:fit.off.slice(),phase:fit.phase,p:[],score:0,last:fit.plain.at(-1)}];for(const x of c){const next=[];for(const s of states){if(!x)next.push({...s,p:s.p.concat(0),score:s.score+lb[s.last*N],last:0});const r=s.phase,o=mod(s.off[r]+x),v=mod(fit.key[r]-o);if(v){const off=s.off.slice();off[r]=o;next.push({off,phase:(r+1)%Q,p:s.p.concat(v),score:s.score+lb[s.last*N+v],last:v})}}states=next.sort((a,b)=>b.score-a.score).slice(0,B)}return states[0]||null}
 function actualMask(c,p){let m=0,z=0;for(let i=0;i<c.length;i++)if(!c[i]){if(!p[i])m+=2**z;z++}return m}
 const eq=(a,b)=>String(a)===String(b),acc=(a,b)=>a?.reduce((n,v,i)=>n+(v===b[i]),0)||0;
 function attack(c,truth,key){const prefix=c.slice(0,FIT),m=masks(prefix);const truemask=truth?actualMask(prefix,truth):null;
  const oracle=truth?solve(prefix,truemask):null;
  const top=m.ranked.slice(0,M).map(x=>solve(prefix,x.s.mask)).filter(Boolean).sort((a,b)=>b.score-a.score),best=top[0];
  const h=best?continueHeld(c.slice(FIT),best):null;
  if(h&&!eq(enc(best.plain.concat(h.p),best.key),c))throw Error("full replay");
  return {zeros:m.z,maskPrunes:m.prunes,beamFinal:m.ranked.length,trueMaskRank:truth?m.ranked.findIndex(x=>x.s.mask===truemask)+1:null,oracleKey:oracle?eq(oracle.key,key):null,oracleAcc:oracle?acc(oracle.plain,truth):null,fitScore:best?.score,fitKey:best?.key,fitMask:best?.mask,trueMask:truemask,keyExact:truth?eq(best?.key,key):null,fitAcc:truth?acc(best?.plain,truth):null,heldAcc:truth?acc(h?.p,truth.slice(FIT)):null,heldScore:h?.score,heldExists:!!h,plain:best?best.plain.concat(h?.p||[]).map(x=>gp.translit[x]).join(" "):null}
 }
 const controls=[];for(let i=0;i<names.length;i++){const p=sections.find(s=>s.name===names[i]).p.slice(0,LEN),key=keys[i],c=enc(p,key);const out=attack(c,p,key);delete out.plain;controls.push({name:names[i],key,...out})}
 // Frozen control thresholds: worst genuine per-rune fit and held-out scores.
 const gate={fit:Math.min(...controls.map(x=>x.fitScore/FIT)),held:Math.min(...controls.map(x=>x.heldScore/(LEN-FIT)))};
 const passes=x=>!!x.heldExists&&x.fitScore/FIT>=gate.fit&&x.heldScore/(LEN-FIT)>=gate.held;
 const nulls=[];
 for(let i=0;i<names.length;i++){
  const truth=sections.find(s=>s.name===names[i]).p.slice(0,LEN);
  let state=[3301,1033,201405][i]>>>0;
  function draw(){let v;do{state=(Math.imul(1664525,state)+1013904223)>>>0;v=state>>>8}while(v>=Math.floor(16777216/N)*N);return v%N}
  const c=truth.map(v=>v?draw():0),out=attack(c,null,null);delete out.plain;nulls.push({name:names[i],passed:passes(out),...out});
 }
 let original=null;
 if(controls.every(x=>x.keyExact&&x.fitAcc===FIT&&x.heldAcc===LEN-FIT)&&nulls.every(x=>!x.passed)){
  const c=gp.pages.slice(54,56).flatMap(x=>x.indices);
  if(c.length!==LEN||gp.pages[54].indices.length!==FIT)throw Error("page split");
  original=attack(c,null,null);original.passed=passes(original);
 }
 return {params:{B,M,FIT,LEN,train:sections.filter(s=>!names.includes(s.name)).map(s=>s.name)},gate,controls,nulls,original};
}
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
