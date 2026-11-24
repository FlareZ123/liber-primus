'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function study(gp,lp1,gold,original=false){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29,ix=new Map(gp.runes.map((r,i)=>[r,i])),extract=s=>[...s].filter(r=>ix.has(r)).map(r=>ix.get(r));
 const ss=gold.sections.slice(0,7).map(s=>extract(s.source_text)),edited=ss.flat(),printed=extract(lp1),sections=ss.map((s,i)=>i===3?extract(lp1.split('%').slice(4,8).join('')).map(c=>mod(31-c)):s),corrected=sections.flat();
 const streams=[["edited LP1",edited],["source-corrected LP1",corrected],["printed LP1",printed]].flatMap(([n,S])=>[[n+" index",S],[n+" prime",S.map(x=>gp.prime[x]%29)]]);
 function encrypt(P,K,start,sign){
  let k=start;const C=[];
  for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+sign*K[k]));k=(k+1)%K.length}}
  return{C,end:k}
 }
 function enumerate(C,K,sign,start=null){
  const L=K.length,n=C.length,ks=Int8Array.from(K,k=>mod(sign*k));
  const F=[new Uint8Array(L)];let counts=new Array(L).fill(0n);
  if(start===null){F[0].fill(1);counts.fill(1n)}else{F[0][start]=1;counts[start]=1n}
  for(let i=0;i<n;i++){
   const a=F[i],b=new Uint8Array(L),nc=new Array(L).fill(0n),c=C[i];
   for(let k=0;k<L;k++)if(a[k]){
    if(c===0){b[k]=1;nc[k]+=counts[k]}
    if(c!==ks[k]){const t=(k+1)%L;b[t]=1;nc[t]+=counts[k]}
   }
   if(!b.some(Boolean))return{count:"0",paths:[]};
   F.push(b);counts=nc
  }
  const count=counts.reduce((a,b)=>a+b,0n);assert(count<=100000n,'too many paths to enumerate under fixed cap');
  const paths=[],P=new Uint8Array(n);
  function dfs(i,k,end){
   if(i===0){
    const plaintext=[...P],e=encrypt(plaintext,K,k,sign);assert(e.C.every((x,j)=>x===C[j])&&e.end===end,'exact replay');
    paths.push({start:k,end,P:plaintext});return
   }
   const c=C[i-1],prev=F[i-1];
   if(c===0&&prev[k]){P[i-1]=0;dfs(i-1,k,end)}
   const j=(k+L-1)%L,p=mod(c-ks[j]);
   if(p!==0&&prev[j]){P[i-1]=p;dfs(i-1,j,end)}
  }
  for(let k=0;k<L;k++)if(F[n][k])dfs(n,k,k);
  assert(BigInt(paths.length)===count,'enumeration count');
  return{count:count.toString(),paths}
 }
 function model(S){
  const two=new Uint32Array(29**2),three=new Uint32Array(29**3);
  for(const p of S)for(let i=2;i<p.length;i++){const j=p[i-2]*29+p[i-1];two[j]++;three[j*29+p[i]]++}
  return P=>{let s=0;for(let i=2;i<P.length;i++){const j=P[i-2]*29+P[i-1];s+=Math.log((three[j*29+P[i]]+1)/(two[j]+29))}return s/(P.length-2)}
 }
 const score=model(sections),p56=extract(gold.sections[7].source_text),p57=extract(gold.sections[8].source_text);
 assert(p56.length===85&&p57.length===95,'heldout sizes');
 const native=[{name:"p56",score:score(p56)},{name:"p57",score:score(p57)}],threshold=Math.min(...native.map(x=>x.score));
 function ioc(P){const a=new Int32Array(29);for(const x of P)a[x]++;return [...a].reduce((s,n)=>s+n*(n-1),0)/(P.length*(P.length-1))}
 // Exact enumeration control: known source windows and fixed secret origins,
 // each with its own cyclic native key. Independently verify true path appears.
 const controls=[];
 for(let id=0;id<12;id++){
  const [name,K]=streams[id>>1],sign=id%2?1:-1,st=K.length-51-id, P=corrected.slice(37+id*53,37+id*53+100),e=encrypt(P,K,st,sign);
  const r=enumerate(e.C,K,sign,st);assert(r.paths.some(x=>x.start===st&&x.end===e.end&&x.P.join()===P.join()),'plant absent');
  controls.push({name,sign,n:P.length,count:r.count})
 }
 let target=null;
 if(original){
  const C=gp.pages.slice(0,56).flatMap(p=>p.indices),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  target=[];
  for(const [name,K] of streams)for(const sign of [1,-1])for(const j of [0,8]){
   const S=C.slice(starts[j],starts[j+1]),r=enumerate(S,K,sign);
   if(r.paths.length===0)continue;
   const paths=r.paths.map(x=>({...x,score:score(x.P),ioc:ioc(x.P)})).sort((a,b)=>b.score-a.score);
   target.push({name,sign,j,n:S.length,count:r.count,unique:new Set(paths.map(x=>x.P.join())).size,maxIoc:Math.max(...paths.map(x=>x.ioc)),aboveNative:paths.filter(x=>x.score>=threshold).length,best:paths[0],paths})
  }
 }
 return{method:"exact count and backward enumeration over all origins and all F branches; add-one native trigram trained on seven corrected LP1 sections; heldout p56/p57 threshold",native,threshold,controls,target}
}
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(JSON.parse(d[0]),d[1],JSON.parse(d[2]),process.argv.includes('--original')),null,2));
