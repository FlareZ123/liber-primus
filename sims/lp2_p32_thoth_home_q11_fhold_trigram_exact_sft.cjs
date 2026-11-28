'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/hapgood1906_service_excerpts.txt","resources/control/hovamol_bellows_1923_stanzas.json"];
function experiment(raw){
 const [c0,n0,...lit]=raw,c=JSON.parse(c0),n=JSON.parse(n0),Q=29,q=11,L=121,A=28,B=37,cut=80;
 const mod=(x,m=Q)=>(x%m+m)%m;
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a})}
 const donorNames=["0_welcome","0_koan_1"];
 const train=[...n.sections.filter(s=>!donorNames.includes(s.name)&&s.name!=="p57_parable").map(s=>read(s.source_text)),...lit.slice(0,3).map(gp)];
 const uni=new Uint32Array(Q),bi=new Uint32Array(Q*Q),tri=new Uint32Array(Q**3),ctx=new Uint32Array(Q),ctx2=new Uint32Array(Q*Q);let total=0;
 for(const t of train){for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i){bi[t[i-1]*Q+t[i]]++;ctx[t[i-1]]++}if(i>=2){const j=t[i-2]*Q+t[i-1];tri[j*Q+t[i]]++;ctx2[j]++}}}
 const u=Array.from(uni,x=>(x+1)/(total+Q));
 const b=Array.from({length:Q*Q},(_,i)=>(bi[i]+16*u[i%Q])/(ctx[Math.floor(i/Q)]+16));
 const U=u.map(x=>Math.round(1024*Math.log(x))),M=b.map(x=>Math.round(1024*Math.log(x)));
 const T=Array.from({length:Q**3},(_,i)=>Math.round(1024*Math.log((tri[i]+12*b[i%(Q*Q)])/(ctx2[Math.floor(i/Q)]+12))));
 function term(P){return P.length===1?U[P[0]]:P.length===2?M[P[0]*Q+P[1]]:T[(P[0]*Q+P[1])*Q+P[2]]}
 function score(P){return P.reduce((s,_,i)=>s+term(P.slice(Math.max(0,i-2),i+1)),0)}
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
   const F=Object.fromEntries([1,2,4,8,3,6,12,7,14].map(m=>[m,new Int32Array(Q**m.toString(2).replace(/0/g,"").length)]));let constant=0;
   const value=(s,k)=>s.v<0?s.p:mod(s.c-k[s.v]);
   const key4=[0,0,0,0];
   for(let i=0;i<slots.length;i++){
    const S=slots.slice(Math.max(0,i-2),i+1),vs=[...new Set(S.filter(x=>x.v>=0).map(x=>x.v))].sort((a,b)=>a-b);
    const mask=vs.reduce((m,v)=>m|(1<<v),0);
    if(!mask){constant+=term(S.map(s=>s.p));continue}
    if(!F[mask])throw Error("unexpected factor "+mask);
    function fill(j,index){if(j===vs.length){F[mask][index]+=term(S.map(s=>value(s,key4)));return}const v=vs[j];for(const k of D[v]){key4[v]=k;fill(j+1,index*Q+k)}}
    fill(0,0);
   }
   let opt=-Infinity,tail=null;
   for(const a of D[0])for(const b of D[1])for(const d of D[2]){
    const ab=a*Q+b,bd=b*Q+d;
    const z=constant+F[1][a]+F[2][b]+F[4][d]+F[3][ab]+F[6][bd]+F[7][ab*Q+d];
    for(const e of D[3]){const s=z+F[8][e]+F[12][d*Q+e]+F[14][bd*Q+e];if(s>opt){opt=s;tail=[a,b,d,e]}}
   }
   if(!best||opt>best.score){const key=[0,0,0,0,0,0,0,...tail];const P=slots.map(s=>value(s,tail));if(score(P)!==opt||!same(enc(P,key,start),C)||!same(P.slice(A,B),C.slice(A,B)))throw Error("replay or factor");best={score:opt,key,start,endPhase:phase,hold:H.map((x,i)=>x?i:-1).filter(x=>x>=0),P}}
  }
  return {best,optional,validMasks,assignments:assignments.toString(),masks:2**optional.length};
 }
 function continueFixed(C,fit){
  let candidates=0,best=null;
  function dfs(i,phase,P,sc){
   if(i===C.length){candidates++;if(!best||sc>best.score)best={P:P.slice(),score:sc};return}
   const x=C[i],k=fit.key[phase],p=mod(x-k);
   if(x===0){const z=term([P[P.length-2],P[P.length-1],0]);P.push(0);dfs(i+1,phase,P,sc+z);P.pop()}
   if(p!==0){const z=term([P[P.length-2],P[P.length-1],p]);P.push(p);dfs(i+1,(phase+1)%q,P,sc+z);P.pop()}
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
 function control(source,offset,P,tail,kind){
  const key=[0,0,0,0,0,0,0,...tail],start=mod(-P.slice(0,A).filter(x=>x!==0).length,q),C=enc(P,key,start);
  const out=attempt(C),fitCorrect=out.fit.best?.P.filter((x,j)=>x===P[j]).length??0,heldCorrect=out.held?.best?.P.slice(cut).filter((x,j)=>x===P[cut+j]).length??0,fullCorrect=out.full.best?.P.filter((x,j)=>x===P[j]).length??0;
  const fitKeyCorrect=same(out.fit.best?.key??[],key),fullKeyCorrect=same(out.full.best?.key??[],key);
  controls.push({source,offset,kind,key,start,C,truth:P,truthText:render(P),fitCorrect,heldCorrect,fullCorrect,fitKeyCorrect,fullKeyCorrect,pass:fitKeyCorrect&&fitCorrect>=75&&heldCorrect>=38&&fullCorrect>=115,...out});
 }
 for(const [i,offset,tail] of [[0,125,[4,17,9,26]],[1,650,[21,6,13,3]]]){
  const P=read(n.sections.find(s=>s.name===donorNames[i]).source_text).slice(offset,offset+L);control(donorNames[i],offset,P,tail,"development")
 }
 const fresh=[["Hapgood1906",gp(lit[3].slice(lit[3].indexOf("Blessed are the poor")))],["Bellows1923",gp(JSON.parse(lit[4]).stanzas.flatMap(s=>s.words).join(" "))]];
 const tails=[[8,18,22,7],[19,11,3,25],[12,2,23,15],[20,4,9,28]];
 let j=0;
 for(const [name,D] of fresh){
  let picked=0;
  for(let i=0;i+L<=D.length&&picked<2;i++){const a=D.slice(i+A,i+B);if(a[0]&&a[8]&&a.filter(x=>x===0).length===2){control(name,i,D.slice(i,i+L),tails[j++],"fresh");picked++;i+=L-1}}
  if(picked!==2)throw Error("insufficient disjoint controls "+name)
 }
 const pass=controls.filter(x=>x.kind==="fresh"&&x.pass).length>=3&&controls.filter(x=>x.kind==="development").every(x=>x.pass);
 const C=c.pages[32].indices;if(C.length!==L||!same(C.slice(A,B),[2,0,0,3,2,8,3,19,18]))throw Error("source p32 anchor");
 const original=pass?attempt(C):null;
 return {trainingRunes:total,gate:"Both development controls and >=3/4 disjoint fresh controls: exact fit key, >=75/80 fit, >=38/41 held, >=115/121 full",pass,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
