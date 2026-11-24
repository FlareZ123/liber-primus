"use strict";
// Agent 5: spacing-free common-fixed-point multiplicative five-state redraw inverse.
// Run: node sims/lp2_p8_five_multiplier_redraw_spacingfree_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function experiment(corpus,solved,literary,config={perCenter:256,topK:128,controls:true,original:true}){
 const N=29,mod=x=>(x%N+N)%N, idx=new Map(corpus.runes.map((r,i)=>[r,i])),check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g," ");const a=[];for(const word of s.split(/ +/)){for(let i=0;i<word.length;){if(word.startsWith("ING",i)){a.push(21);i+=3}else if(word.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>word.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}}return a}
 const native=solved.sections.map(s=>({name:s.name,tape:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const lit=literary.map((text,i)=>({name:["Gibran","Shakespeare","Emerson"][i],tape:encode(text).slice(4000,44000)}));check(lit.every(x=>x.tape.length===40000),"literary length");
 const target=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices).slice(12);check(target.length===1717,"target length");

 const inv=Array.from({length:N},(_,x)=>x===0?0:Array.from({length:N-1},(_,i)=>i+1).find(y=>x*y%N===1));
 const source=[2,8,11,15,26],sourceInv=source.map(k=>inv[k]).sort((a,b)=>a-b);
 const banks=[],bankIds=new Map();
 function add(a,k){if(a.length===5){bankIds.set(a.join(','),banks.length);banks.push(a);return}for(let i=k;i<=N-(5-a.length);i++)add([...a,i],i+1)}
 add([],1);check(banks.length===98280,"bank count");
 const sourceIds=[bankIds.get(source.join(',')),bankIds.get(sourceInv.join(','))];
 const total=N*banks.length;
 const key=id=>({center:Math.floor(id/banks.length),bank:banks[id%banks.length]});
 const keyId=(center,B)=>center*banks.length+bankIds.get(B.join(','));
 const inverseMaps=Array.from({length:N},(_,b)=>Array.from({length:N},(_,a)=>Array.from({length:N},(_,c)=>mod(b+inv[a]*(c-b)))));
 const forwardMaps=Array.from({length:N},(_,b)=>Array.from({length:N},(_,a)=>Array.from({length:N},(_,p)=>mod(b+a*(p-b)))));
  function language(exclude){const u=new Float64Array(N),b=new Float64Array(N*N),t=new Float64Array(N*N*N),bu=new Float64Array(N),tb=new Float64Array(N*N);let total=0;
  for(const s of [...native,...lit]){if(s.name===exclude)continue;for(let i=0;i<s.tape.length;i++){const c=s.tape[i];u[c]++;total++;if(i>=1){let a=s.tape[i-1];b[a*N+c]++;bu[a]++}if(i>=2){let ab=s.tape[i-2]*N+s.tape[i-1];t[ab*N+c]++;tb[ab]++}}}
  for(let c=0;c<N;c++)u[c]=(u[c]+.5)/(total+N*.5);
  for(let a=0;a<N;a++)for(let c=0;c<N;c++)b[a*N+c]=(b[a*N+c]+20*u[c])/(bu[a]+20);
  for(let ab=0;ab<N*N;ab++)for(let c=0;c<N;c++)t[ab*N+c]=(t[ab*N+c]+12*b[(ab%N)*N+c])/(tb[ab]+12);
  return {u,b,t};
 }

 function emissions(K,hold,normalize=false){
  const {center:b,bank:B}=K;
  const opts=Array.from({length:N},(_,c)=>[...new Set(B.map(a=>inverseMaps[b][a][c]).filter(p=>!hold||p!==0).concat(hold&&c===0?[0]:[]))]);
  const E=Array.from({length:N+1},(_,prev)=>Array.from({length:N},(_,c)=>opts[c].map(p=>{
   if((hold&&p===0)||p===b)return 1;
   if(prev===N)return .2;
   const canRepeat=B.some(a=>forwardMaps[b][a][p]===prev);
   return canRepeat?(prev===c?.04:.24):.2;
  })));
  if(normalize)for(let prev=0;prev<=N;prev++)for(let p=0;p<N;p++){let z=0;for(let c=0;c<N;c++){const j=opts[c].indexOf(p);if(j>=0)z+=E[prev][c][j]}check(Math.abs(z-1)<1e-12,"conditional distribution")}
  return {opts,E};
 }
 function iidScore(K,hold,M,counts,trans,first){
  const {center:b,bank:B}=K,maps=B.map(a=>inverseMaps[b][a]),support=Array.from({length:N},(_,p)=>B.reduce((m,a)=>m|(1<<forwardMaps[b][a][p]),0));
  const vals=Array.from({length:N},(_,c)=>{
   const fixed=(c===b?M.u[b]:0)+(hold&&c===0&&b!==0?M.u[0]:0);
   const ps=c===b?[]:maps.map(m=>m[c]).filter(p=>!hold||p!==0);
   return {fixed,ps,mass:fixed+.2*ps.reduce((z,p)=>z+M.u[p],0)}
  });
  let score=Math.log(vals[first].mass);
  for(const [prev,c,n] of trans){const {fixed,ps}=vals[c];let z=fixed;for(const p of ps)z+=M.u[p]*((support[p]&(1<<prev))?(prev===c?.04:.24):.2);score+=n*Math.log(z)}
  return score;
 }
 function rank(c,cut,hold,M){
  const counts=new Uint16Array(N),pairs=new Uint16Array(N*N);for(let i=0;i<cut;i++){counts[c[i]]++;if(i)pairs[c[i-1]*N+c[i]]++}
  const trans=[];for(let j=0;j<pairs.length;j++)if(pairs[j])trans.push([Math.floor(j/N),j%N,pairs[j]]);
  const short=[],unigramRank=new Map();
  for(let b=0;b<N;b++){
   const scores=new Float64Array(banks.length),tab=Array.from({length:N},(_,a)=>Float64Array.from({length:N},(_,v)=>{let p=inverseMaps[b][a][v];return p===b||hold&&p===0?0:.2*M.u[p]})),fix=Array.from({length:N},(_,v)=>(v===b?M.u[b]:0)+(hold&&v===0&&b!==0?M.u[0]:0));
   for(let id=0;id<banks.length;id++){let B=banks[id],a=tab[B[0]],d=tab[B[1]],e=tab[B[2]],f=tab[B[3]],g=tab[B[4]],s=0;for(let v=0;v<N;v++)if(counts[v])s+=counts[v]*Math.log(fix[v]+a[v]+d[v]+e[v]+f[v]+g[v]);scores[id]=s}
   const order=Array.from({length:banks.length},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b).slice(0,config.perCenter);
   for(let j=0;j<order.length;j++){let id=b*banks.length+order[j];unigramRank.set(id,j+1);short.push({id,score:iidScore(key(id),hold,M,counts,trans,c[0])})}
  }
  short.sort((a,b)=>b.score-a.score||a.id-b.id);
  return {short,unigramRank};
 }
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

 function plant(p,hold,seed){
  let z=seed>>>0;const rng=()=>z=(Math.imul(z,1664525)+1013904223)>>>0;
  let center=rng()%N,bank=[];while(bank.length<5){let a=1+rng()%(N-1);if(!bank.includes(a))bank.push(a)}bank.sort((a,b)=>a-b);
  const K={center,bank};emissions(K,hold,true);const c=[];for(const a of p){if(hold&&a===0){c.push(0);continue}let v=forwardMaps[center][bank[rng()%5]][a];if(v===c.at(-1))v=forwardMaps[center][bank[rng()%5]][a];check(bank.some(k=>forwardMaps[center][k][a]===v),"plant replay");c.push(v)}
  return {c,K};
 }
 function fit(c,hold,M,truth=null,p=null){
  const cut=1024,started=Date.now(),R=rank(c,cut,hold,M),tid=truth?keyId(truth.center,truth.bank):null;
  const ids=[...new Set([...R.short.slice(0,config.topK).map(x=>x.id),...Array.from({length:N},(_,b)=>sourceIds.map(id=>b*banks.length+id)).flat()])];
  const prefix=c.slice(0,cut),scored=ids.map(id=>({id,score:forward(prefix,cut,key(id),hold,M).log})).sort((a,b)=>b.score-a.score||a.id-b.id);
  const best=scored[0],K=key(best.id),f=forward(c,cut,K,hold,M,true),nul=nullLog(c,cut);
  const gain=x=>({train:(x.trainLog-nul.train)/cut,holdout:((x.log-x.trainLog)-(nul.log-nul.train))/(c.length-cut)});
  const src=sourceIds.map(id=>({key:key(id),...gain(forward(c,cut,key(id),hold,M))}));
  return {hold,elapsedMs:Date.now()-started,truth,truthUnigramCenterRank:tid===null?null:R.unigramRank.get(tid)??null,truthIidShortRank:tid===null?null:(R.short.findIndex(x=>x.id===tid)+1||null),truthTrigramRank:tid===null?null:(scored.findIndex(x=>x.id===tid)+1||null),key:K,exact:tid===null?null:best.id===tid,gain:gain(f),runnerGap:best.score-scored[1].score,sourceCenter0:src,accuracy:p===null?null:f.out.filter((x,i)=>x===p[i]).length,withheld:p===null?null:f.out.slice(cut).filter((x,i)=>x===p[cut+i]).length,candidate:p===null?f.out.slice(0,200).map(x=>corpus.translit[x]).join(""):null};
 }
 let result={bankCount:total,config,controls:[],original:[]};
 if(config.controls)for(const hold of [false,true])for(const s of lit){const p=s.tape.slice(0,1717),z=plant(p,hold,503301+result.controls.length);result.controls.push({name:s.name,...fit(z.c,hold,language(s.name),z.K,p)})}
 if(config.original)for(const hold of [false,true])result.original.push(fit(target,hold,language(null)));
 return result;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2)),null,2));
