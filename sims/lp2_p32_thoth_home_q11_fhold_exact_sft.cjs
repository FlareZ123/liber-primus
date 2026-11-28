'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw){
 const [c0,n0,...lit]=raw,c=JSON.parse(c0),n=JSON.parse(n0),Q=29,q=11,L=121,A=28,B=37,cut=80;
 const mod=(x,m=Q)=>(x%m+m)%m;
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a})}
 const donorNames=["0_welcome","0_koan_1"];
 const train=[...n.sections.filter(s=>!donorNames.includes(s.name)&&s.name!=="p57_parable").map(s=>read(s.source_text)),...lit.map(gp)];
 const uni=new Uint32Array(Q),bi=new Uint32Array(Q*Q),ctx=new Uint32Array(Q);let total=0;
 for(const t of train){for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i){bi[t[i-1]*Q+t[i]]++;ctx[t[i-1]]++}}}
 const U=Array.from(uni,x=>Math.round(1024*Math.log((x+1)/(total+Q))));
 const M=Array.from({length:Q*Q},(_,i)=>Math.round(1024*Math.log((bi[i]+16*(uni[i%Q]+1)/(total+Q))/(ctx[Math.floor(i/Q)]+16))));
 function score(P){return U[P[0]]+P.slice(1).reduce((s,b,i)=>s+M[P[i]*Q+b],0)}
 function enc(P,key,phase){const C=[];for(const p of P){C.push(p?mod(p+key[phase]):0);if(p)phase=(phase+1)%q}return C}
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function inverse(C){
  if(C.length<B||C.slice(A,B).filter(x=>x===0).length!==2||!C[A]||!C[B-1])throw Error("anchor");
  const optional=C.map((x,i)=>x===0&&(i<A||i>=B)?i:-1).filter(i=>i>=0);
  if(optional.length>20)throw Error("hold mask capacity");
  const forced=C.map((x,i)=>i>=A&&i<B&&x===0);
  let best=null,assignments=0n,validMasks=0;
  for(let bits=0;bits<2**optional.length;bits++){
   const H=forced.slice();optional.forEach((i,j)=>{H[i]=Boolean(bits&(1<<j))});
   const start=mod(-H.slice(0,A).filter(x=>!x).length,q);
   let phase=start;
   const slots=C.map((x,i)=>{if(H[i])return {v:-1,p:0};const k=phase;phase=(phase+1)%q;return k<7?{v:-1,p:x}:{v:k-7,c:x}});
   if(slots.some((s,i)=>!H[i]&&s.v<0&&s.p===0))continue;
   const domain=Array.from({length:4},()=>Array(Q).fill(true));
   for(const s of slots)if(s.v>=0)domain[s.v][s.c]=false;
   const D=domain.map(a=>a.map((ok,i)=>ok?i:-1).filter(i=>i>=0));
   if(D.some(a=>!a.length))continue;
   validMasks++;assignments+=D.reduce((a,b)=>a*BigInt(b.length),1n);
   const un=Array.from({length:4},()=>new Int32Array(Q)),edges=Array.from({length:3},()=>new Int32Array(Q*Q));let constant=0;
   const value=(s,k)=>s.v<0?s.p:mod(s.c-k);
   const s0=slots[0];if(s0.v<0)constant+=U[s0.p];else for(const k of D[s0.v])un[s0.v][k]+=U[value(s0,k)];
   for(let i=1;i<slots.length;i++){
    const a=slots[i-1],b=slots[i];if(a.v<0&&b.v<0){constant+=M[a.p*Q+b.p];continue}
    if(a.v<0||b.v<0){const v=Math.max(a.v,b.v);for(const k of D[v])un[v][k]+=M[value(a,k)*Q+value(b,k)];continue}
    if(b.v!==a.v+1)throw Error("factor not chain");
    for(const k of D[a.v])for(const j of D[b.v])edges[a.v][k*Q+j]+=M[value(a,k)*Q+value(b,j)];
   }
   let dp=Array(Q).fill(-Infinity);for(const k of D[0])dp[k]=un[0][k];
   const prev=[];
   for(let v=1;v<4;v++){const nd=Array(Q).fill(-Infinity),back=Array(Q).fill(-1);for(const k of D[v])for(const j of D[v-1]){const z=dp[j]+edges[v-1][j*Q+k]+un[v][k];if(z>nd[k]){nd[k]=z;back[k]=j}}dp=nd;prev.push(back)}
   let last=D[3].reduce((a,b)=>dp[b]>dp[a]?b:a),opt=constant+dp[last];
   if(!best||opt>best.score){const tail=[last];for(let v=2;v>=0;v--)tail.unshift(prev[v][tail[0]]);const key=[0,0,0,0,0,0,0,...tail];const P=slots.map(s=>value(s,tail[s.v]));if(score(P)!==opt||!same(enc(P,key,start),C)||!same(P.slice(A,B),C.slice(A,B)))throw Error("replay or factor");best={score:opt,key,start,endPhase:phase,hold:H.map((x,i)=>x?i:-1).filter(x=>x>=0),P}}
  }
  return {best,optional,validMasks,assignments:assignments.toString(),masks:2**optional.length};
 }
 function continueFixed(C,fit){
  let candidates=0,best=null;
  function dfs(i,phase,P,sc){
   if(i===C.length){candidates++;if(!best||sc>best.score)best={P:P.slice(),score:sc};return}
   const x=C[i],k=fit.key[phase],p=mod(x-k);
   if(x===0){const z=M[P[P.length-1]*Q];P.push(0);dfs(i+1,phase,P,sc+z);P.pop()}
   if(p!==0){const z=M[P[P.length-1]*Q+p];P.push(p);dfs(i+1,(phase+1)%q,P,sc+z);P.pop()}
  }
  dfs(cut,fit.endPhase,fit.P.slice(),0);
  if(best&&!same(enc(best.P,fit.key,fit.start),C))throw Error("continuation replay");
  return {candidates,best};
 }
 const render=P=>P.map(x=>c.translit[x]).join(" ");
 function attempt(C){
  const fit=inverse(C.slice(0,cut));
  const held=fit.best?continueFixed(C,fit.best):null;
  const full=inverse(C);
  return {fit,held,full,fitText:fit.best&&render(fit.best.P),continuationText:held?.best&&render(held.best.P.slice(cut)),fullText:full.best&&render(full.best.P),fitPerRune:fit.best&&fit.best.score/1024/cut,heldPerRune:held?.best&&held.best.score/1024/(L-cut),fullPerRune:full.best&&full.best.score/1024/L};
 }
 const controls=[];
 for(const [i,offset,tail] of [[0,125,[4,17,9,26]],[1,650,[21,6,13,3]]]){
  const P=read(n.sections.find(s=>s.name===donorNames[i]).source_text).slice(offset,offset+L);
  const key=[0,0,0,0,0,0,0,...tail],start=mod(-P.slice(0,A).filter(x=>x!==0).length,q),C=enc(P,key,start);
  const out=attempt(C),fitCorrect=out.fit.best?.P.filter((x,j)=>x===P[j]).length??0,heldCorrect=out.held?.best?.P.slice(cut).filter((x,j)=>x===P[cut+j]).length??0,fullCorrect=out.full.best?.P.filter((x,j)=>x===P[j]).length??0;
  controls.push({source:donorNames[i],offset,key,start,C,truth:P,truthText:render(P),fitCorrect,heldCorrect,fullCorrect,fitKeyCorrect:same(out.fit.best?.key??[],key),fullKeyCorrect:same(out.full.best?.key??[],key),...out});
 }
 const pass=controls.every(x=>x.fitKeyCorrect&&x.fitCorrect>=75&&x.heldCorrect>=38&&x.fullCorrect>=115);
 const C=c.pages[32].indices;if(C.length!==L||!same(C.slice(A,B),[2,0,0,3,2,8,3,19,18]))throw Error("source p32 anchor");
 const original=pass?attempt(C):null;
 return {trainingRunes:total,gate:"Both controls: exact fit key, >=75/80 fit, >=38/41 held, >=115/121 full",pass,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
