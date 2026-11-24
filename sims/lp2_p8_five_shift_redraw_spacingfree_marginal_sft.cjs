"use strict";
// Agent 5: spacing-free exact marginal inverse of iid uniform five-state additive redraw.
// Run: node sims/lp2_p8_five_shift_redraw_spacingfree_marginal_sft.cjs
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
 const banks=[],ids=new Map();
 function add(b,k){if(b.length===5){ids.set(b.reduce((m,x)=>m|(1<<x),0),banks.length);banks.push(b);return}for(let i=k;i<=N-(5-b.length);i++)add([...b,i],i+1)}
 add([],0);check(banks.length===118755,"bank count");
 const mask=b=>b.reduce((m,x)=>m|(1<<x),0),mid=b=>ids.get(mask(b));
 const sourceIds=[mid(sourceBank),mid(sourceInverse)];
 function language(exclude){const u=new Float64Array(N),b=new Float64Array(N*N),t=new Float64Array(N*N*N),bu=new Float64Array(N),tb=new Float64Array(N*N);let total=0;
  for(const s of [...native,...lit]){if(s.name===exclude)continue;for(let i=0;i<s.tape.length;i++){const c=s.tape[i];u[c]++;total++;if(i>=1){let a=s.tape[i-1];b[a*N+c]++;bu[a]++}if(i>=2){let ab=s.tape[i-2]*N+s.tape[i-1];t[ab*N+c]++;tb[ab]++}}}
  for(let c=0;c<N;c++)u[c]=(u[c]+.5)/(total+N*.5);
  for(let a=0;a<N;a++)for(let c=0;c<N;c++)b[a*N+c]=(b[a*N+c]+20*u[c])/(bu[a]+20);
  for(let ab=0;ab<N*N;ab++)for(let c=0;c<N;c++)t[ab*N+c]=(t[ab*N+c]+12*b[(ab%N)*N+c])/(tb[ab]+12);
  return {u,b,t};
 }
 function histogram(c,cut){const h=new Uint16Array(N*N),counts=new Uint16Array(N);counts[c[0]]++;for(let i=1;i<cut;i++){let d=mod(c[i-1]-c[i]);h[d*N+c[i]]++;counts[c[i]]++}return {h,counts}}
 /** Exact iid-plaintext marginal of the specified redraw rule; no plaintext spaces. */
 function iidRank(c,cut,hold,model){const {h,counts}=histogram(c,cut),byK=Array.from({length:N},(_,k)=>Float64Array.from({length:N},(_,v)=>hold&&mod(v-k)===0?0:model.u[mod(v-k)]));
  const base=new Float64Array(N),same=new Float64Array(N),over=new Uint8Array(N),scores=new Float64Array(banks.length);let sum=0;
  for(let id=0;id<banks.length;id++){const B=banks[id];over.fill(0);for(let a=0;a<5;a++)for(let b=0;b<5;b++)if(a!==b)over[mod(B[b]-B[a])]|=1<<a;
   let score=0;for(let c=0;c<N;c++){let z=byK[B[0]][c]+byK[B[1]][c]+byK[B[2]][c]+byK[B[3]][c]+byK[B[4]][c],f=hold&&c===0?model.u[0]:0;base[c]=z*.2+f;same[c]=z*.04+f;if(counts[c])score+=(counts[c]-h[c])*Math.log(base[c])+h[c]*Math.log(same[c])}
   for(let d=1;d<N;d++){let m=over[d];if(!m)continue;for(let c=0;c<N;c++){let count=h[d*N+c];if(!count)continue;let z=0;for(let a=0;a<5;a++)if(m&(1<<a))z+=byK[B[a]][c];score+=count*Math.log1p(.04*z/base[c])}}
   scores[id]=score;sum+=score;
  }
  const order=Array.from({length:banks.length},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b);
  return {scores,order};
 }
 function emissions(B,hold){const m=mask(B),opts=Array.from({length:N},(_,c)=>[...B.map(k=>mod(c-k)).filter(p=>!hold||p!==0),...(hold&&c===0?[0]:[])]);
  const E=Array.from({length:N+1},(_,prior)=>Array.from({length:N},(_,c)=>opts[c].map(p=>hold&&p===0?1:prior===N?.2:((m&(1<<mod(prior-p)))?(prior===c?.04:.24):.2))));
  // Every plaintext/prior conditional distribution must normalize.
  for(let prev=0;prev<=N;prev++)for(let p=0;p<N;p++){let s=0;for(let c=0;c<N;c++){let j=opts[c].indexOf(p);if(j>=0)s+=E[prev][c][j]}check(Math.abs(s-1)<1e-12,"emission normalization")}
  return {opts,E}
 }
 /** Exact forward filter and optional MAP path. All held-out probabilities use filtered prefix state. */
 function forward(c,cut,B,hold,M,wantPath=false){
  const {opts,E}=emissions(B,hold),n=c.length;let A=opts[c[0]],Bprev=opts[c[1]],a=Float64Array.from(A,(p,j)=>M.u[p]*E[N][c[0]][j]),v=Float64Array.from(a,Math.log);let z=a.reduce((x,y)=>x+y,0),log=Math.log(z);for(let i=0;i<a.length;i++)a[i]/=z;
  let cur=new Float64Array(A.length*Bprev.length),vcur=new Float64Array(cur.length),e=E[c[0]][c[1]];z=0;for(let i=0;i<A.length;i++)for(let j=0;j<Bprev.length;j++){let k=i*Bprev.length+j,p=M.b[A[i]*N+Bprev[j]]*e[j];cur[k]=a[i]*p;z+=cur[k];vcur[k]=v[i]+Math.log(p)}log+=Math.log(z);for(let i=0;i<cur.length;i++)cur[i]/=z;let trainLog=cut===2?log:null,back=[];
  for(let pos=2;pos<n;pos++){let C=opts[c[pos]],emit=E[c[pos-1]][c[pos]],next=new Float64Array(Bprev.length*C.length),vn=wantPath?new Float64Array(next.length).fill(-Infinity):null,bp=wantPath?new Int8Array(next.length).fill(-1):null;z=0;
   for(let i=0;i<A.length;i++)for(let j=0;j<Bprev.length;j++){let ij=i*Bprev.length+j,ab=(A[i]*N+Bprev[j])*N;for(let k=0;k<C.length;k++){let jk=j*C.length+k,prob=M.t[ab+C[k]]*emit[k];next[jk]+=cur[ij]*prob;if(wantPath){let val=vcur[ij]+Math.log(prob);if(val>vn[jk]){vn[jk]=val;bp[jk]=i}}}}
   z=next.reduce((x,y)=>x+y,0);check(z>0,"forward path");log+=Math.log(z);for(let i=0;i<next.length;i++)next[i]/=z;if(pos+1===cut)trainLog=log;if(wantPath){back.push(bp);vcur=vn}cur=next;A=Bprev;Bprev=C;
  }
  if(!wantPath)return {trainLog,log};
  let j=vcur.indexOf(Math.max(...vcur)),out=Array(n);out[n-2]=A[Math.floor(j/Bprev.length)];out[n-1]=Bprev[j%Bprev.length];for(let pos=n-1;pos>=2;pos--){let k=back[pos-2][j],prev=opts[c[pos-1]],current=opts[c[pos]];out[pos-2]=opts[c[pos-2]][k];j=k*prev.length+Math.floor(j/current.length)}check(out.every((p,i)=>opts[c[i]].includes(p)),"MAP path");return {trainLog,log,out};
 }
 function nullLog(c,cut){let first=-Math.log(N),prev=0,log=first,train=null;for(let i=1;i<c.length;i++){log+=Math.log(c[i]===c[i-1]?1/145:(1-1/145)/28);if(i+1===cut)train=log}return {train,log}}
 function plant(p,hold,seed){let z=seed>>>0;const rng=()=>z=(Math.imul(z,1664525)+1013904223)>>>0;let bank=0;while(pop(bank)<5)bank|=1<<(rng()%N);const B=Array.from({length:N},(_,i)=>i).filter(i=>bank&(1<<i));let c=[],attempts=0,leaks=0;
  for(const a of p){if(hold&&a===0){c.push(0);continue}let k=B[rng()%5],v=mod(a+k);if(v===c.at(-1)){attempts++;k=B[rng()%5];v=mod(a+k);if(v===c.at(-1))leaks++}c.push(v);check(bank&(1<<mod(v-a)),"plant replay")}
  return {c,B,attempts,leaks};
 }
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function fit(c,hold,M,truth=null,p=null){const cut=1024;let started=Date.now();const rank=iidRank(c,cut,hold,M),iidMs=Date.now()-started,truthId=truth===null?null:mid(truth),truthRank=truthId===null?null:rank.order.indexOf(truthId)+1;
  let prefix=c.slice(0,cut),ids=[...new Set([...rank.order.slice(0,config.topK),...sourceIds])];let scored=ids.map(i=>({i,score:forward(prefix,cut,banks[i],hold,M).log})).sort((a,b)=>b.score-a.score||a.i-b.i),best=scored[0];const chosen=forward(c,cut,banks[best.i],hold,M,true),nulls=nullLog(c,cut),source=sourceIds.map(i=>{const d=forward(c,cut,banks[i],hold,M);return {bank:banks[i],trainGain:(d.trainLog-nulls.train)/cut,heldoutGain:((d.log-d.trainLog)-(nulls.log-nulls.train))/(c.length-cut),iidRank:rank.order.indexOf(i)+1}});
  let oracle=truth===null?null:forward(c,cut,truth,hold,M,true);
  return {hold,cut,length:c.length,distinct:c.length,repeatCount:c.slice(1).filter((v,i)=>v===c[i]).length,iidMs,elapsedMs:Date.now()-started,trueBank:truth,truthRank,truthTrigramRank:truth===null?null:(scored.findIndex(x=>x.i===truthId)+1||null),bank:banks[best.i],exactBank:truth===null?null:truthId===best.i,trainGain:(chosen.trainLog-nulls.train)/cut,heldoutGain:((chosen.log-chosen.trainLog)-(nulls.log-nulls.train))/(c.length-cut),runnerGap:best.score-scored[1].score,source,accuracy:p===null?null:chosen.out.filter((x,i)=>x===p[i]).length,withheldAccuracy:p===null?null:chosen.out.slice(cut).filter((x,i)=>x===p[cut+i]).length,oracleAccuracy:p===null?null:oracle.out.filter((x,i)=>x===p[i]).length,oracleHeldoutGain:oracle===null?null:((oracle.log-oracle.trainLog)-(nulls.log-nulls.train))/(c.length-cut),candidate:truth===null?chosen.out.map(x=>corpus.translit[x]).join("").slice(0,350):null};
 }
 let result={controls:[],original:[],config};if(config.controls){for(const hold of [false,true])for(const s of lit){let p=s.tape.slice(0,1717),z=plant(p,hold,103301+result.controls.length);result.controls.push({name:s.name,attempts:z.attempts,leaks:z.leaks,...fit(z.c,hold,language(s.name),z.B,p)})}}if(config.original){for(const hold of [false,true])result.original.push(fit(target,hold,language(null)))}return result;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2)),null,2));
