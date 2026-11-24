"use strict";
// Agent 5: spacing-free five-increment random walk with exact one-redraw/F-hold inverse.
// Run: node sims/lp2_p8_five_increment_redraw_spacingfree_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function experiment(corpus,solved,literary,config={topK:128,controls:true,original:true}){
 const N=29,mod=x=>(x%N+N)%N, idx=new Map(corpus.runes.map((r,i)=>[r,i])),check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g," ");const a=[];for(const word of s.split(/ +/)){for(let i=0;i<word.length;){if(word.startsWith("ING",i)){a.push(21);i+=3}else if(word.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>word.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}}return a}
 const native=solved.sections.map(s=>({name:s.name,tape:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const lit=literary.map((text,i)=>({name:["Gibran","Shakespeare","Emerson"][i],tape:encode(text).slice(4000,44000)}));check(lit.every(x=>x.tape.length===40000),"literary length");
 const target=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices).slice(12);check(target.length===1717,"target length");

 const sourceBank=[2,8,11,15,26], sourceInverse=sourceBank.map(k=>mod(-k)).sort((a,b)=>a-b);
 const banks=[],ids=new Map(),mask=b=>b.reduce((m,x)=>m|(1<<x),0);
 function add(b,k){if(b.length===5){ids.set(mask(b),banks.length);banks.push(b);return}for(let i=k;i<=N-(5-b.length);i++)add([...b,i],i+1)}
 add([],0);check(banks.length===118755,"bank count");
 const sourceIds=[ids.get(mask(sourceBank)),ids.get(mask(sourceInverse))];
  function language(exclude){const u=new Float64Array(N),b=new Float64Array(N*N),t=new Float64Array(N*N*N),bu=new Float64Array(N),tb=new Float64Array(N*N);let total=0;
  for(const s of [...native,...lit]){if(s.name===exclude)continue;for(let i=0;i<s.tape.length;i++){const c=s.tape[i];u[c]++;total++;if(i>=1){let a=s.tape[i-1];b[a*N+c]++;bu[a]++}if(i>=2){let ab=s.tape[i-2]*N+s.tape[i-1];t[ab*N+c]++;tb[ab]++}}}
  for(let c=0;c<N;c++)u[c]=(u[c]+.5)/(total+N*.5);
  for(let a=0;a<N;a++)for(let c=0;c<N;c++)b[a*N+c]=(b[a*N+c]+20*u[c])/(bu[a]+20);
  for(let ab=0;ab<N*N;ab++)for(let c=0;c<N;c++)t[ab*N+c]=(t[ab*N+c]+12*b[(ab%N)*N+c])/(tb[ab]+12);
  return {u,b,t};
 }

 // Complete rank by a one-difference marginal. The F-hold screen uses only
 // pairs of nonzero ciphertext, and conditions the stationary plaintext pair
 // distribution on non-F endpoints; this is a screen, not the exact F filter.
 function rank(c,cut,hold,M){
  const D=new Float64Array(N),counts=new Uint16Array(N);
  for(let p=0;p<N;p++)for(let q=0;q<N;q++)if(!hold||p&&q)D[mod(q-p)]+=M.u[p]*M.b[p*N+q];
  let z=D.reduce((a,b)=>a+b,0);for(let d=0;d<N;d++)D[d]/=z;
  for(let i=1;i<cut;i++)if(!hold||c[i-1]&&c[i])counts[mod(c[i]-c[i-1])]++;
  const scores=new Float64Array(banks.length),tab=Array.from({length:N},(_,d)=>Float64Array.from({length:N},(_,k)=>D[mod(d-k)])),neg=Array.from({length:N},(_,k)=>1<<mod(-k));
  for(let id=0;id<banks.length;id++){
   let B=banks[id],m=mask(B),s=0,mass=0;
   for(let d=0;d<N;d++){let z=0;for(let k of B){let w=tab[d][k];z+=w*(d===0?.04:.2+((m&neg[mod(d-k)])?.04:0))}
    if(hold)z*=d===0?28/29:27/29;
    mass+=z;if(counts[d])s+=counts[d]*Math.log(z)
   }
   if(hold)s-=counts.reduce((a,b)=>a+b,0)*Math.log(mass);
   scores[id]=s;
  }
  const order=Array.from({length:banks.length},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b);
  return {order,scores};
 }

 // Second-order difference composite screen, conditional on three
 // consecutive nonzero C symbols for F-hold. No original plaintext or
 // holdout is used; exact forward filtering remains the refinement.
 function rank2(c,cut,hold,M){
  const D=new Float64Array(N*N),counts=new Uint16Array(N*N);
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let q=0;q<N;q++)if(!hold||a&&b&&q)D[mod(b-a)*N+mod(q-b)]+=M.u[a]*M.b[a*N+b]*M.t[(a*N+b)*N+q];
  let total=D.reduce((a,b)=>a+b,0);for(let j=0;j<D.length;j++)D[j]/=total;
  for(let i=2;i<cut;i++)if(!hold||c[i-2]&&c[i-1]&&c[i])counts[mod(c[i-1]-c[i-2])*N+mod(c[i]-c[i-1])]++;
  let n=counts.reduce((a,b)=>a+b,0),valid=Array.from({length:N*N},(_,j)=>{let d0=Math.floor(j/N),d1=j%N;return (N-new Set([0,d0,mod(d0+d1)]).size)/N});
  const scores=new Float64Array(banks.length),X=new Float64Array(N*N),ti=new Uint8Array(N*5),wt=new Float64Array(N*5);
  for(let id=0;id<banks.length;id++){
   let B=banks[id],m=mask(B),s=0,mass=0;
   for(let d=0;d<N;d++){
    let k=d*5;for(let j=0;j<5;j++){let t=mod(d-B[j]);ti[k+j]=t;wt[k+j]=d===0?.04:.2+((m&(1<<mod(-t)))?.04:0)}
    let a=ti[k]*N,b=ti[k+1]*N,e=ti[k+2]*N,f=ti[k+3]*N,g=ti[k+4]*N,r0=wt[k],r1=wt[k+1],r2=wt[k+2],r3=wt[k+3],r4=wt[k+4];
    for(let t=0;t<N;t++)X[d*N+t]=r0*D[a+t]+r1*D[b+t]+r2*D[e+t]+r3*D[f+t]+r4*D[g+t]
   }
   for(let j=0;j<N*N;j++){
    if(!hold&&!counts[j])continue;
    let d1=j%N,off=j-d1,k=d1*5;
    let z=wt[k]*X[off+ti[k]]+wt[k+1]*X[off+ti[k+1]]+wt[k+2]*X[off+ti[k+2]]+wt[k+3]*X[off+ti[k+3]]+wt[k+4]*X[off+ti[k+4]];
    if(hold){z*=valid[j];mass+=z}if(counts[j])s+=counts[j]*Math.log(z)
   }
   if(hold)s-=n*Math.log(mass);scores[id]=s
  }
  const order=Array.from({length:banks.length},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b);
  return {order,scores};
 }
 function filter(c,cut,B,hold,M,wantPath=false){
  const n=c.length,m=mask(B);
  // For each observed ciphertext, enumerate all (plaintext,key-state) pairs.
  // Nonzero plaintext and key determine C; transparent F permits every key.
  const ps=[],ss=[],lookup=[];
  for(let v=0;v<N;v++){
   let p=[],s=[],L=new Int16Array(N*N).fill(-1);
   for(let a=0;a<N;a++)if(!hold||a!==0){let k=mod(v-a);L[a*N+k]=p.length;p.push(a);s.push(k)}
   if(hold&&v===0)for(let k=0;k<N;k++){L[k]=p.length;p.push(0);s.push(k)}
   ps.push(p);ss.push(s);lookup.push(L)
  }
  const cache=new Map();
  function edges(v,w){
   let k=v*N+w;if(cache.has(k))return cache.get(k);
   let A=ps[v],S=ss[v],L=lookup[w],E=[];
   for(let j=0;j<A.length;j++){
    let s=S[j],p=A[j];
    for(let inc of B){
     let ns=mod(s+inc),q=mod(w-ns);if(hold&&q===0)continue;
     let repeat=mod(v-q-s),prob=(m&(1<<repeat))?(v===w?.04:.24):.2;
     let ix=L[q*N+ns];check(ix>=0,"pair lookup");
     E.push([j,ix,p,q,prob])
    }
    if(hold&&w===0)E.push([j,L[s],p,0,1]);
   }
   cache.set(k,E);return E;
  }
  const A=ps[c[0]],S=ss[c[0]],a=Float64Array.from(A,p=>M.u[p]/N);
  let z=a.reduce((x,y)=>x+y,0),log=Math.log(z);for(let i=0;i<a.length;i++)a[i]/=z;
  let cur=new Float64Array(ps[c[1]].length*N),vcur=wantPath?new Float64Array(cur.length).fill(-Infinity):null,back=[];
  let bp=wantPath?new Int16Array(cur.length).fill(-1):null;
  for(const [j,k,p,q,w] of edges(c[0],c[1])){
   let to=k*N+p,pr=M.b[p*N+q]*w;cur[to]+=a[j]*pr;
   if(wantPath){let val=Math.log(M.u[p]/N)+Math.log(pr);if(val>vcur[to]){vcur[to]=val;bp[to]=j}}
  }
  if(wantPath)back.push(bp);
  z=cur.reduce((x,y)=>x+y,0);check(z>0,"second");log+=Math.log(z);for(let i=0;i<cur.length;i++)cur[i]/=z;
  let trainLog=cut===2?log:null;
  // Transpose the trigram table so the 29 predecessor positions are contiguous.
  const T=new Float64Array(N*N*N),LT=wantPath?new Float64Array(T.length):null;
  for(let a=0;a<N;a++)for(let p=0;p<N;p++)for(let q=0;q<N;q++){let k=(p*N+q)*N+a;T[k]=M.t[(a*N+p)*N+q];if(wantPath)LT[k]=Math.log(T[k])}
  for(let pos=2;pos<n;pos++){
   const next=new Float64Array(ps[c[pos]].length*N),vn=wantPath?new Float64Array(next.length).fill(-Infinity):null,bb=wantPath?new Int16Array(next.length).fill(-1):null;
   for(const [j,k,p,q,w] of edges(c[pos-1],c[pos])){
    const from=j*N,to=k*N+p,off=(p*N+q)*N;let sum=0;
    for(let a=0;a<N;a++)sum+=cur[from+a]*T[off+a];
    next[to]+=w*sum;
    if(wantPath){let best=-Infinity,at=-1;for(let a=0;a<N;a++){let val=vcur[from+a]+LT[off+a];if(val>best){best=val;at=from+a}}
     const val=best+Math.log(w);if(val>vn[to]){vn[to]=val;bb[to]=at}}
   }
   z=next.reduce((x,y)=>x+y,0);check(z>0,"forward path");log+=Math.log(z);for(let i=0;i<next.length;i++)next[i]/=z;
   if(pos+1===cut)trainLog=log;cur=next;if(wantPath){vcur=vn;back.push(bb)}
  }
  if(!wantPath)return {log,trainLog};
  let j=vcur.indexOf(Math.max(...vcur)),out=new Array(n),state=new Array(n);
  for(let pos=n-1;pos>=1;pos--){let k=Math.floor(j/N);out[pos]=ps[c[pos]][k];state[pos]=ss[c[pos]][k];j=back[pos-1][j];check(j>=0,"backtrace")}
  out[0]=ps[c[0]][j];state[0]=ss[c[0]][j];
  for(let i=0;i<n;i++){if(hold&&out[i]===0){check(c[i]===0&&(!i||state[i]===state[i-1]),"F replay")}else{check(mod(out[i]+state[i])===c[i]&&(!i||(m&(1<<mod(state[i]-state[i-1])))),"path replay")}}
  return {log,trainLog,out,state};
 }
 function nullLog(c,cut){let log=-Math.log(N),train=null;for(let i=1;i<c.length;i++){log+=Math.log(c[i]===c[i-1]?1/145:(1-1/145)/28);if(i+1===cut)train=log}return {train,log}}
 function plant(p,hold,seed){
  let z=seed>>>0;const rng=()=>z=(Math.imul(z,1664525)+1013904223)>>>0;
  let B=[];while(B.length<5){let k=rng()%N;if(!B.includes(k))B.push(k)}B.sort((a,b)=>a-b);let s=rng()%N,c=[];
  for(const q of p){if(hold&&q===0){c.push(0);continue}let ns=mod(s+B[rng()%5]),v=mod(q+ns);if(v===c.at(-1)){ns=mod(s+B[rng()%5]);v=mod(q+ns)}s=ns;c.push(v)}
  return {B,c}
 }
 function fit(c,hold,M,truth=null,p=null){
  const cut=1024,started=Date.now(),R=(config.rankOrder===2?rank2:rank)(c,cut,hold,M),tid=truth===null?null:ids.get(mask(truth)),rankMs=Date.now()-started;
  const shortlist=[...new Set([...R.order.slice(0,config.topK),...sourceIds])],prefix=c.slice(0,cut);
  const scores=shortlist.map(id=>({id,score:filter(prefix,cut,banks[id],hold,M).log})).sort((a,b)=>b.score-a.score||a.id-b.id);
  const best=scores[0],B=banks[best.id],f=filter(c,cut,B,hold,M,true),nul=nullLog(c,cut);
  const gain=x=>({train:(x.trainLog-nul.train)/cut,holdout:((x.log-x.trainLog)-(nul.log-nul.train))/(c.length-cut)});
  return {hold,rankMs,elapsedMs:Date.now()-started,truth,truthRank:tid===null?null:R.order.indexOf(tid)+1,truthTrigramRank:tid===null?null:(scores.findIndex(x=>x.id===tid)+1||null),bank:B,exact:tid===null?null:best.id===tid,gain:gain(f),runnerGap:best.score-scores[1].score,source:sourceIds.map(id=>({bank:banks[id],rank:R.order.indexOf(id)+1,...gain(filter(c,cut,banks[id],hold,M))})),accuracy:p===null?null:f.out.filter((x,i)=>x===p[i]).length,withheld:p===null?null:f.out.slice(cut).filter((x,i)=>x===p[cut+i]).length,candidate:p===null?f.out.slice(0,250).map(x=>corpus.translit[x]).join(""):null};
 }
 let result={config,controls:[],original:[]};
 if(config.controls)for(const hold of [false,true])for(const s of lit){const i=3*Number(hold)+lit.indexOf(s);if(config.case!==undefined&&config.case!==i)continue;const p=s.tape.slice(0,1717),z=plant(p,hold,803301+i);result.controls.push({name:s.name,...fit(z.c,hold,language(s.name),z.B,p)})}
 if(config.original)for(const hold of [false,true]){if(config.case!==undefined&&config.case!==6+Number(hold))continue;result.original.push(fit(target,hold,language(null)))}
 return result;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2)),null,2));
