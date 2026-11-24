"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,gold,transcript,donors){
 const N=1729,Q=8,H=346,R=242,FIT=1209,PERM=[2,4,0,3,1],FULL=(1<<29)-1;
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const sections=gold.sections.map(s=>Array.from(s.source_text,x=>corpus.runes.indexOf(x)).filter(i=>i>=0)),native=sections.flat();
 const mixed=transcript.split(/\n%\n/).slice(8,15).flatMap(s=>Array.from(s).filter(x=>x==="7"||corpus.runes.includes(x)));
 const original=mixed.filter(x=>x!=="7").map(x=>corpus.runes.indexOf(x));
 assert(mixed.length===1730&&mixed[692]==="7"&&mixed.filter(x=>x==="7").length===1,"marker");
 assert(eq(original,corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices)),"source");
 const order=[],colOf=[];for(let row=0;row<H;row++)for(const c of PERM){const i=c*H+row;if(i!==692){order.push(i-(i>692?1:0));colOf.push(c)}}
 const inverse=Array(N);order.forEach((p,i)=>inverse[p]=i);assert(order.length===N&&new Set(order).size===N,"permutation");
 const fit=new Set(order.slice(0,FIT)),columns=[];
 for(let c=0;c<5;c++){let a=[];for(let j=0;j<H;j++){let i=c*H+j;if(i!==692)a.push(i-(i>692?1:0))}let m=a.filter(i=>fit.has(i)).length;assert(a.slice(0,m).every(i=>fit.has(i))&&a.slice(m).every(i=>!fit.has(i)),"column split");columns.push({a,m})}
 const encode=raw=>{const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),out=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));assert(t,"GP encode");out.push(t.i);w=w.slice(t.s.length)}}return out};
 const allow=p=>p!==0&&p!==12&&p!==22;
 const mask=Array.from({length:29},(_,c)=>FULL&~((1<<c)|(1<<mod(c-12))|(1<<mod(c-22))));
 function enc(P,k){let j=0;return P.map(p=>p===0?0:mod(p+k[j++%Q]))}
 function printed(P){return inverse.map(i=>P[i])}
 function blockCandidates(C){
  let bs=[],cur=[];function flush(){if(cur.length){bs.push(cur);cur=[]}}
  for(let i=0;i<C.length;i++){if(fit.has(i)&&C[i]!==0)cur.push(C[i]);else flush()}flush();
  let blocks=bs.map((v,id)=>{let m=Array(Q).fill(FULL);for(let i=0;i<v.length;i++)m[i%Q]&=mask[v[i]];return {m,len:v.length,id}}).sort((a,b)=>b.len-a.len);
  let nodes=0,depth=0,leaves=0,maxProduct=0,keys=new Set(),memo=new Set(),capped=false;
  function join(a,b,k){let v=a.map((x,i)=>x&b[(i-k+Q)%Q]);return v.every(x=>x!==0)?v:null}
  function dfs(m,left,d){
   if(++nodes>300000||keys.size>100000){capped=true;return}depth=Math.max(d,depth);
   let next=[],best=-1,opts=null;
   for(let i=0;i<left.length;i++){
    let a=[],seen=new Set(),free=false;
    for(let k=0;k<Q;k++){let v=join(m,left[i].m,k);if(v){if(eq(v,m)){free=true;break}const s=v.join(",");if(!seen.has(s)){a.push(v);seen.add(s)}}}
    if(free)continue;if(!a.length)return;next.push(left[i]);if(!opts||a.length<opts.length){best=left[i].id;opts=a}
   }
   const state=m.join(",")+"/"+next.map(b=>b.id).join(",");if(memo.has(state))return;memo.add(state);
   if(!next.length){
    leaves++;let prod=m.reduce((s,v)=>s*v.toString(2).replace(/0/g,"").length,1);maxProduct=Math.max(maxProduct,prod);if(prod>100000){capped=true;return}
    function rec(i,k){if(i===Q){for(let j=0;j<Q;j++)keys.add(k.slice(j).concat(k.slice(0,j)).join(","));return}for(let j=0;j<29;j++)if((m[i]>>>j)&1)rec(i+1,[...k,j])}rec(0,[]);return
   }
   for(const v of opts){dfs(v,next.filter(b=>b.id!==best),d+1);if(capped)return}
  }
  dfs(blocks[0].m,blocks.slice(1),1);
  return {nodes,depth,leaves,maxProduct,capped,blocks:blocks.length,largest:blocks[0].len,keys:[...keys].map(x=>x.split(",").map(Number))}
 }
 function lang(train){
  const A=29,U=Array(A).fill(.5),B=Array(A*A).fill(0),T=Array(A*A*A).fill(0),BT=Array(A).fill(0),TT=Array(A*A).fill(0);
  for(const P of train)for(let i=0;i<P.length;i++){const x=P[i];U[x]++;if(i>=1){B[A*P[i-1]+x]++;BT[P[i-1]]++}if(i>=2){T[(P[i-2]*A+P[i-1])*A+x]++;TT[P[i-2]*A+P[i-1]]++}}
  const tot=U.reduce((a,b)=>a+b,0),log=Array(30*30*A).fill(0);
  for(let a=0;a<A;a++)for(let b=0;b<A;b++)for(let x=0;x<A;x++){const p1=U[x]/tot,p2=(B[b*A+x]+4*p1)/(BT[b]+4);log[(a*30+b)*A+x]=Math.log((T[(a*A+b)*A+x]+8*p2)/(TT[a*A+b]+8))}
  return log
 }
 function step(c,k,j,native){let p=mod(c-k[j]),out=[];if(c===0)out.push([j,0]);if(p!==0&&(!native||allow(p)))out.push([(j+1)%Q,p]);return out}
 function backward(C,k,native,ends){
  let can=Array(C.length+1).fill(0);can[C.length]=ends;
  for(let i=C.length-1;i>=0;i--)for(let j=0;j<Q;j++)if(step(C[i],k,j,native).some(([n])=>(can[i+1]>>>n)&1))can[i]|=1<<j;
  return can
 }
 function reach(C,k,start,native){let m=1<<start;for(let c of C){let n=0;for(let j=0;j<Q;j++)if((m>>>j)&1)for(let [p] of step(c,k,j,native))n|=1<<p;m=n;if(!m)break}return m}
 function bitValues(m){return Array.from({length:Q},(_,j)=>j).filter(j=>(m>>>j)&1)}
 function rowDP(C,k,log,from,to,starts,ends,previous,strict){
  const b=columns.map(({a,m},c)=>backward((from===0?a.slice(0,m):a.slice(m)).map(i=>C[i]),k,strict,ends[c]));
  if(starts.some((j,c)=>!(b[c][0]>>>j&1)))return {best:null,capped:false,peak:0,steps:0};
  let packed=starts.reduce((s,j,c)=>s|(j<<(3*c)),0);
  const seen=Array(5).fill(0);let states=new Map([[packed*900+previous[0]*30+previous[1],{s:0,P:""}]]),peak=1,steps=0;
  for(let i=from;i<to;i++){
   const c=colOf[i],shift=3*c,z=C[order[i]],next=new Map(),pos=++seen[c];
   for(const [id,v] of states){const a=Math.floor(id/900),ctx=id%900,j=a>>>shift&7;for(const [nj,p] of step(z,k,j,strict)){
    if(!(b[c][pos]>>>nj&1))continue;
    const np=(a&~(7<<shift))|(nj<<shift),newid=np*900+(ctx%30)*30+p,s=v.s+log[ctx*29+p],old=next.get(newid);steps++;
    if(!old||s>old.s+1e-10)next.set(newid,{s,P:v.P+String.fromCharCode(65+p)})
   }}
   states=next;peak=Math.max(peak,states.size);if(peak>100000||steps>20000000)return {best:null,capped:true,peak,steps};if(!states.size)return {best:null,capped:false,peak,steps}
  }
  let best=null;for(const [id,v] of states){if(!best||v.s>best.s+1e-10){const a=Math.floor(id/900);best={score:v.s,P:Array.from(v.P,c=>c.charCodeAt(0)-65),end:Array.from({length:5},(_,i)=>a>>>(3*i)&7)}}}
  return {best,capped:false,peak,steps}
 }
 function keyFit(C,key,log){
  const cols=columns.map(({a,m})=>({a,m,C:a.map(i=>C[i])}));
  const tail=cols.map(({C,m})=>Array.from({length:Q},(_,j)=>reach(C.slice(m),key,j,false)));
  const training=cols.map(({C,m})=>Array.from({length:Q},(_,j)=>reach(C.slice(0,m),key,j,true)));
  const full=training.map((a,c)=>a.map(m=>bitValues(m).reduce((s,j)=>s|tail[c][j],0)));
  let good=Array(6).fill(0);good[5]=255;for(let c=4;c>=0;c--)for(let j=0;j<Q;j++)if(full[c][j]&good[c+1])good[c]|=1<<j;
  if(!(good[0]&1))return {best:null,capped:false,tuples:0,steps:0,peak:0};
  let best=null,tuples=0,steps=0,peak=0,capped=false;
  function rec(c,starts){
   if(capped)return;
   if(c===5){
    tuples++;const ends=tail.map((r,i)=>r.reduce((m,a,j)=>m|((a&(i===4?255:1<<starts[i+1]))?1<<j:0),0));
    const z=rowDP(C,key,log,0,FIT,starts,ends,[29,29],true);
    steps+=z.steps;peak=Math.max(peak,z.peak);if(z.capped){capped=true;return}
    if(z.best&&(!best||z.best.score>best.score+1e-10))best={...z.best,starts:starts.slice(),key:key.slice()};return
   }
   for(const j of bitValues(full[c-1][starts[c-1]]&good[c]))rec(c+1,[...starts,j])
  }
  rec(1,[0]);return {best,capped,tuples,steps,peak}
 }
 function decodeTail(C,best,log){
  const ends=best.starts.map((_,i)=>i===4?255:1<<best.starts[i+1]);
  return rowDP(C,best.key,log,FIT,N,best.end,ends,best.P.slice(-2),false)
 }
 function run(C,log,truth=null){
  const {keys,...certificate}=blockCandidates(C);let feasible=0,tuples=0,steps=0,peak=0,capped=certificate.capped,best=null,ranked=[];
  if(!capped)for(let key of keys){const z=keyFit(C,key,log);if(z.capped){capped=true;break}tuples+=z.tuples;steps+=z.steps;peak=Math.max(peak,z.peak);if(z.best){feasible++;ranked.push(z.best);if(!best||z.best.score>best.score+1e-10)best=z.best}}
  if(capped||!best)return {certificate,keys:keys.length,feasible,tuples,steps,peak,capped,best:null,truthIncluded:truth?keys.some(k=>eq(k,truth.key)):null};
  const tail=decodeTail(C,best,log),P=tail.best?best.P.concat(tail.best.P):null,replay=P?eq(enc(printed(P),best.key),C):false;
  if(P)assert(replay,"forward replay");
  return {certificate,keys:keys.length,feasible,tuples,steps,peak,capped,truthIncluded:truth?keys.some(k=>eq(k,truth.key)):null,best:{key:best.key,fit:best.score/(FIT-2),tie:ranked.filter(x=>Math.abs(x.score-best.score)<1e-10).length,hold:tail.best?tail.best.score/(N-FIT):null,tailPeak:tail.peak,tailSteps:tail.steps,tailCapped:tail.capped,replay,exactKey:truth?eq(best.key,truth.key):null,fitCorrect:truth?best.P.filter((x,i)=>x===truth.P[i]).length:null,holdCorrect:truth&&tail.best?tail.best.P.filter((x,i)=>x===truth.P[i+FIT]).length:null}}
 }
 const ps=[native.slice(0,N),encode(donors[0]).slice(1551,1551+N),encode(donors[1]).slice(994,994+N)],names=["Native solved register","Shakespeare GP27 window","Gibran GP27 window"];
 const keys=[[3,20,8,25,13,1,18,6],[10,27,15,3,20,8,25,13],[17,5,22,10,27,15,3,20]];
 const controls=ps.map((P,i)=>{assert(P.length===N&&P.every(p=>p===0||allow(p)),"plant GP27");const C=enc(printed(P),keys[i]);return {name:names[i],truth:keys[i],zeros:C.filter(x=>x===0).length,...run(C,lang(i===0?[native.slice(N)]:sections),{P,key:keys[i]})}});
 const pass=controls.every(x=>x.best?.exactKey&&x.best.replay&&x.best.holdCorrect>=Math.ceil((N-FIT)*.98));
 const target=pass?run(original,lang(sections)):null;
 return {geometry:{order:PERM,rows:H,fitRows:R,fit:FIT,held:N-FIT,marker:692},controls,pass,target};
}
if(require.main===module){const p=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];const d=p.map(x=>fs.readFileSync(path.resolve(__dirname,"..",x),"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),JSON.parse(d[1]),d[2],d.slice(3)),null,2));}
module.exports={experiment};
