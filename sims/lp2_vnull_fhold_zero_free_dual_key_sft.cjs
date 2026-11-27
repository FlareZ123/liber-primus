"use strict";
const fs=require("node:fs");
const {mod,words,makeRng,names,SUPP,train}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const {model,factors,search,exact,encode,paths}=require("./lp2_vnull_fhold_zero_free_blind_key_sft.cjs");
const Q=29,B=Q*Q,NEG=-Infinity,ln=Math.log(SUPP/28),lr=Math.log1p(-SUPP);
/** Each overlapping pair chooses its own labels; multipliers penalize inconsistent labels at shared positions. */
function local(C,M,prev=0){
 const A=new Float64Array((C.length-1)*B*4).fill(NEG);
 for(let i=0;i+1<C.length;i++){
  const c=C[i],d=C[i+1],p=i?C[i-1]:prev;
  for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){
   const a=mod(c-x),an=mod(p-x),b=mod(d-y),bn=mod(c-y),I=(i*B+x*Q+y)*4;
   const R=d===c?lr:0,first=i===0&&a?M.best[a]+(c===p?lr:0):0,firstN=i===0?ln:0;
   if(a&&b)A[I]=first+M.B[a*Q+b]+R;
   if(a&&bn&&d!==c)A[I+1]=first+ln;
   if(an&&c!==p&&b&&an===b)A[I+2]=firstN+M.best[b]+R;
   if(an&&c!==p&&bn&&d!==c&&an===bn)A[I+3]=firstN+ln;
  }
 }
 return A;
}
function combine(A,q,L){
 const F=Array.from({length:q},()=>new Float64Array(B));
 for(let i=0;i+1<L.length;i++){
  const a=-L[i],b=L[i+1],f=F[i%q],I=i*B*4;
  for(let x=0;x<B;x++){const t=I+4*x;f[x]+=Math.max(A[t],A[t+1]+b,A[t+2]+a,A[t+3]+a+b)}
 }
 return F;
}
function maximize(F){
 const q=F.length,back=Array.from({length:q},()=>new Uint8Array(Q));let best=NEG,key=null;
 const d0=new Float64Array(Q),d1=new Float64Array(Q);
 for(let s=0;s<Q;s++){
  let d=d0,e=d1;d.fill(NEG);d[s]=0;
  for(let j=0;j<q-1;j++){e.fill(NEG);const f=F[j],b=back[j+1];for(let x=0;x<Q;x++)if(d[x]>NEG){const dx=d[x],I=x*Q;for(let y=0;y<Q;y++){const v=dx+f[I+y];if(v>e[y]){e[y]=v;b[y]=x}}}[d,e]=[e,d]}
  for(let x=0;x<Q;x++){const v=d[x]+F[q-1][x*Q+s];if(v>best){best=v;key=new Array(q);key[q-1]=x;for(let j=q-1;j>0;j--)key[j-1]=back[j][key[j]]}}
 }
 return {bound:best,K:key};
}
function subgradient(A,K,L){
 const G=new Float64Array(L.length);let sum=0;
 for(let i=0;i+1<L.length;i++){
  const x=K[i%K.length],y=K[(i+1)%K.length],I=(i*B+x*Q+y)*4,a=-L[i],b=L[i+1],v=[A[I],A[I+1]+b,A[I+2]+a,A[I+3]+a+b];let m=0;for(let j=1;j<4;j++)if(v[j]>v[m])m=j;
  sum+=v[m];if(i>0&&(m&2))G[i]--;if(i+1<L.length-1&&(m&1))G[i+1]++;
 }
 return {G,sum,norm:G.reduce((s,x)=>s+x*x,0)};
}
/** Optimize a valid upper bound (not a claim of exact dual minimization); retain best primal candidate. */
function dual(C,q,M,iterations=256,limit=2048,truth=null,prev=0){
 const A=local(C,M,prev),L=new Float64Array(C.length),seen=new Set();let upper=Infinity,best=null,bestL=null,initial=null,history=[],primalKeys=0;
 for(let i=0;i<iterations;i++){
  const F=combine(A,q,L),opt=maximize(F);if(!opt.K)return {impossible:true};
  if(i===0){initial=opt.bound;const ref=factors(C,q,M,prev);if(ref.some((f,j)=>f.some((v,k)=>Math.abs(v-F[j][k])>1e-8||Number.isFinite(v)!==Number.isFinite(F[j][k]))))throw Error("zero multipliers disagree")}
  const {G,sum,norm}=subgradient(A,opt.K,L);if(Math.abs(sum-opt.bound)>1e-7)throw Error("dual maximizer inconsistent");
  const id=opt.K.join(",");if(!seen.has(id)){seen.add(id);const d=exact(C,opt.K,M,prev);if(d){primalKeys++;if(d.score>opt.bound+1e-8)throw Error("primal violates dual");if(!best||d.score>best.score)best={K:opt.K,...d}}}
  if(opt.bound<upper){upper=opt.bound;bestL=Float64Array.from(L)}
  if(best&&best.score>upper+1e-8)throw Error("primal exceeds global upper");
  if(i%32===0||i===iterations-1)history.push({i,upper,best:best?.score??null,norm});
  if(!norm||best&&upper-best.score<1e-8)break;
  const gap=best?Math.max(0,upper-best.score):2*norm,eta=Math.min(2,Math.max(.002,.6*gap/norm))/Math.sqrt(1+i/32);
  for(let j=1;j<L.length-1;j++)L[j]-=eta*G[j];
 }
 const F=combine(A,q,bestL),enumeration=search(C,q,M,limit,truth,prev,F);if(enumeration.best&&(!best||enumeration.best.score>best.score))best=enumeration.best;
 if(best&&best.score>upper+1e-8)throw Error("final primal exceeds upper");
 return {q,n:C.length,initial,upper,history,primalKeys,distinctKeys:seen.size,enumeration,best,certified:!!best&&(upper-best.score<1e-8||enumeration.certified&&enumeration.best?.score<=best.score+1e-8)};
}
/** Full 4-gram MAP with pending-null replay and interior boundary; key supplied by the blind bigram solver. */
function decode4(C,K,LP,prev=0){
 const M=30,H=M**3;let D=new Map([[H-1,{h:H-1,pending:0,s:0,back:null}]]);
 for(let i=0;i<C.length;i++){
  const c=C[i],p=i?C[i-1]:prev,x=K[i%K.length],r=mod(c-x),n=mod(p-x),T=new Map();
  function add(h,pending,s,z,event,v){const id=h*Q+pending,t=T.get(id);if(!t||s>t.s)T.set(id,{h,pending,s,back:z,event,v})}
  for(let z of D.values()){
   if(r&&(!z.pending||z.pending===r))add((z.h%(M*M))*M+r,0,z.s+LP[z.h*Q+r]+(c===p?lr:0),z,"R",r);
   if(n&&c!==p&&(!z.pending||z.pending===n))add(z.h,n,z.s+ln,z,"N",n);
  }D=T;if(!D.size)return null;
 }
 let b=null;for(let z of D.values())if(!b||z.s>b.s)b=z;
 const P=[],events=[];for(let z=b;z.back;z=z.back){events.push(z.event);if(z.event==="R")P.push(z.v)}P.reverse();events.reverse();
 let j=0,pending=0;for(let i=0;i<C.length;i++){const p=i?C[i-1]:prev,v=events[i]==="R"?P[j++]:mod(p-K[i%K.length]);if(!v||pending&&pending!==v||mod(v+K[i%K.length])!==(events[i]==="R"?C[i]:p)||events[i]==="N"&&C[i]===p)throw Error("decode4 replay");pending=events[i]==="N"?v:0}
 return {score:b.s,P,events:events.join(""),pending};
}
function run(raw,iterations=256,limit=2048,controls=12){
 const corpus=JSON.parse(raw[0]),seq=raw.slice(1,4).map(x=>words(x).flat()),M=model(seq.slice(0,2)),LP=train(seq.slice(0,2)),rng=makeRng(0x47a57b),native=JSON.parse(raw[4]),rm=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x))}));
 const runs=[];for(const {name,P} of [{name:"Gibran",P:seq[2]},...ns]){let s=0;for(let i=0;i<=P.length;i++)if(i===P.length||P[i]===0){if(i-s>=169)runs.push({name,P:P.slice(s,i),start:s});s=i+1}}
 const control=[];for(let i=0;i<controls;i++){
  const q=i%2?13:8,L=[126,129,169][Math.floor(i/2)%3],run=runs[rng(runs.length)],offset=rng(run.P.length-L+1),P=run.P.slice(offset,offset+L);let K,C,attempts=0;
  do{K=Array.from({length:q},()=>rng(Q));C=encode(P,K,rng);if(++attempts>100000)throw Error("plant conditioning budget")}while(C.includes(0));
  const d=dual(C,q,M,iterations,limit,K),truth=exact(C,K,M),correctKey=d.best?.K.join(",")===K.join(","),four=d.best?decode4(C,d.best.K,LP):null;
  if(!truth||truth.score>d.upper+1e-8)throw Error("planted truth violates bound");
  control.push({donor:run.name,offset:run.start+offset,attempts,truthKey:K,truthScore:truth.score,truthP:P,correctKey,correctText:d.best?.P.join(",")===P.join(","),correctFour:four?.P.join(",")===P.join(","),four,...d});
 }
 const original=[];for(const [page,a,b] of [[7,25,194],[8,35,161],[54,66,195]])for(const q of [8,13]){const C=corpus.pages[page].indices.slice(a,b),d=dual(C,q,M,iterations,limit),four=d.best?decode4(C,d.best.K,LP):null;original.push({page,start:a,end:b,...d,four,fourText:four?.P.map(x=>names[x]).join("")??null,text:d.best?.P.map(x=>names[x]).join("")??null})}
 return {control,original,iterations,limit};
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8")),Number(process.argv[2]||256),Number(process.argv[3]||2048),Number(process.argv[4]||12)),null,2));
module.exports={run,dual,decode4,local,combine,maximize,subgradient};
