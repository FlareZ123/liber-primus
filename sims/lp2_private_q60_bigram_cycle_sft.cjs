"use strict";
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt"
];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ",A=29,Q=60,N=3008,T=2256;
 const gpMap=new Map(["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((x,i)=>[x,i]));
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 function literary(s){const st=s.search(/\*\*\* START OF/i);if(st>=0)s=s.slice(s.indexOf("\n",st)+1);const en=s.search(/\*\*\* END OF/i);if(en>=0)s=s.slice(0,en);return (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).flatMap(w=>[...w.toUpperCase().replace(/['’]/g,"").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>gpMap.get(m[0]==="ING"?"NG":m[0])))}
 const p=JSON.parse(inputs[0]),orig=p.pages.filter(x=>x.page>=40&&x.page<=53).flatMap(x=>x.indices);
 assert(orig.length===N,"chapter count");
 const native=JSON.parse(inputs[1]).sections.map(s=>({name:s.name,words:[...s.source_text].filter(x=>R.includes(x)).map(x=>R.indexOf(x))}));
 const em=literary(inputs[2]),donors=["Gibran","Shakespeare","Blake"].map((name,i)=>({name,words:literary(inputs[i+3])}));
 const m=new Float64Array(A*A).fill(.5),row=new Float64Array(A).fill(.5*A);
 for(let i=1;i<em.length;i++){m[em[i-1]*A+em[i]]++;row[em[i-1]]++}
 for(let a=0;a<A;a++)for(let b=0;b<A;b++)m[a*A+b]=Math.log(m[a*A+b]/row[a]);
 const mod=x=>(x+A)%A,dec=(c,k)=>c.map((x,i)=>mod(x-k[i%k.length])),enc=(p,k)=>p.map((x,i)=>mod(x+k[i%k.length]));
 const score=(p,lo,hi)=>{let s=0;for(let i=lo+1;i<hi;i++)s+=m[p[i-1]*A+p[i]];return s};
 function factors(c,q,a=A,model=m){
  const fs=Array.from({length:q},()=>new Float64Array(a*a));for(let i=1;i<c.length;i++){const f=fs[(i-1)%q];for(let x=0;x<a;x++){const u=(c[i-1]-x+a)%a;for(let y=0;y<a;y++)f[x*a+y]+=model[u*a+(c[i]-y+a)%a]}}return fs;
 }
 function solve(fs,a=A){
  const q=fs.length;let global=-Infinity,runner=-Infinity,key=null;
  for(let start=0;start<a;start++){
   let best=new Float64Array(a).fill(-Infinity),second=new Float64Array(a).fill(-Infinity);best[start]=0;
   const parents=Array.from({length:q},()=>new Int16Array(a).fill(-1));
   for(let j=0;j<q-1;j++){
    const f=fs[j],b=new Float64Array(a).fill(-Infinity),s=new Float64Array(a).fill(-Infinity);
    for(let v=0;v<a;v++)for(let u=0;u<a;u++){
     const w=f[u*a+v],x=best[u]+w,y=second[u]+w;
     if(x>b[v]){s[v]=b[v];b[v]=x;parents[j+1][v]=u}else if(x>s[v])s[v]=x;
     if(y>s[v])s[v]=y;
    }best=b;second=s;
   }
   for(let end=0;end<a;end++){
    const w=fs[q-1][end*a+start],x=best[end]+w,y=second[end]+w;
    if(x>global){runner=global;global=x;key=Array(q);key[q-1]=end;for(let j=q-1;j>0;j--)key[j-1]=parents[j][key[j]]}else if(x>runner)runner=x;
    if(y>runner)runner=y;
   }
  }
  return {key,best:global,runner,margin:global-runner};
 }
 // Independent brute-force check of exact optimum and second distinct key.
 const checks=[];for(let seed=1;seed<=12;seed++){
  let v=seed;const f=Array.from({length:4},()=>Float64Array.from({length:9},()=>{v=(v*1664525+1013904223)>>>0;return (v%13)-6}));
  const all=[];for(let i=0;i<81;i++){let x=i,k=[];for(let j=0;j<4;j++){k.push(x%3);x=Math.floor(x/3)}all.push(k.reduce((s,z,j)=>s+f[j][z*3+k[(j+1)%4]],0))}
  all.sort((x,y)=>y-x);const a=solve(f,3);assert(a.best===all[0]&&a.runner===all[1],"toy optimum");checks.push(a.margin);
 }
 function keyFor(seed){let v=seed;return Array.from({length:Q},()=>{v=(v*1664525+1013904223)>>>0;return v%A})}
 function fit(c,split,truth,keyTruth){const a=solve(factors(c.slice(0,split),Q)),d=dec(c,a.key),train=score(d,0,split),test=score(d,split,d.length);
  assert(Math.abs(train-a.best)<1e-6,"score replay");assert(enc(d,a.key).every((x,i)=>x===c[i]),"forward");
  return {...a,train:train/(split-1),holdout:test/(d.length-split-1),split,n:c.length,keyHits:keyTruth?keyTruth.filter((x,i)=>x===a.key[i]).length:null,fitHits:truth?truth.slice(0,split).filter((x,i)=>x===d[i]).length:null,holdoutHits:truth?truth.slice(split).filter((x,i)=>x===d[split+i]).length:null,preview:d.slice(0,150).map(x=>R[x]).join(""),holdoutPreview:d.slice(split,split+150).map(x=>R[x]).join(""),decoded:d};
 }
 const controls=[];let seed=917133;
 for(const d of donors){for(const off of [0,3008,6016]){if(off+N>d.words.length)continue;const truth=d.words.slice(off,off+N),k=keyFor(seed++);const a=fit(enc(truth,k),T,truth,k);const {decoded,...out}=a;controls.push({name:d.name,off,...out,trueKey:k})}}
 const authentic=native.flatMap(s=>s.words),nk=keyFor(seed++),nt=Math.floor(authentic.length*.75/Q)*Q;const {decoded:nd,...nc}=fit(enc(authentic,nk),nt,authentic,nk);controls.push({name:"solved-native concatenated (joins descriptive)",off:0,...nc,trueKey:nk});
 const accepted=controls.every(c=>c.keyHits===Q&&c.holdoutHits===c.n-c.split);
 function collision(words){const c=new Int32Array(Q*A);let e=0;for(let i=0;i<words.length;i++){let j=i%Q*A+words[i];e+=c[j]++}return e}
 function scan(w){let c=new Int32Array(Q*A),e=0,min=Infinity,max=-Infinity,eq=0,le=0;const original=collision(orig);for(let i=0;i<N;i++)e+=c[i%Q*A+w[i]]++;for(let off=0;off+N<=w.length;off++){if(off){const j=(off-1)%Q*A+w[off-1];e-=--c[j];const k=(off+N-1)%Q*A+w[off+N-1];e+=c[k]++}min=Math.min(min,e);max=Math.max(max,e);if(e===original)eq++;if(e<=original)le++}return {windows:w.length-N+1,min,max,eq,le}}
 const exactGate={original:collision(orig),donors:[{name:"Emerson (training, descriptive)",words:em},...donors].map(d=>({name:d.name,...scan(d.words)}))};
 const originalFit=accepted?fit(orig,T,null,null):null;
 return {q:Q,source:"p40–53",n:N,fit:T,holdout:N-T,trainingRunes:em.length,checks,controls,accepted,exactGate,originalFit};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
