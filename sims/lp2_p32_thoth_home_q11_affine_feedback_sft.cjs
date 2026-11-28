'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/hapgood1906_service_excerpts.txt","resources/control/hovamol_bellows_1923_stanzas.json"];
function experiment(raw,which){
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

 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function enc(P,key,a,b){let K=key.slice(),t=0;return P.map(p=>{if(!p)return 0;const j=t++%q,c=mod(p+K[j]);K[j]=mod(a*K[j]+b);return c})}
 const masks=[1,2,4,8,3,6,12,7,14], sizes=masks.map(m=>Q**m.toString(2).replace(/0/g,"").length);
 function inverse(C){
  const optional=C.map((x,i)=>!x&&(i<A||i>=B)?i:-1).filter(i=>i>=0);
  if(optional.length>12)throw Error("mask capacity");
  let best=null,assignments=0n,valid=0, ties=0n;
  const F=Object.fromEntries(masks.map((m,i)=>[m,new Int32Array(sizes[i])]));
  for(let bits=0;bits<2**optional.length;bits++){
   const H=C.map((x,i)=>!x&&i>=A&&i<B);optional.forEach((i,j)=>H[i]=!!(bits&(1<<j)));
   const anchorPhase=H.slice(0,A).filter(x=>!x).length%q;
   const chains=Array.from({length:q},()=>[]);let phase=0;
   C.forEach((x,i)=>{if(!H[i]){chains[phase].push(i);phase=(phase+1)%q}});
   for(let a=1;a<Q;a++)for(let b=0;b<Q;b++){
    if(a===1&&b===0)continue;
    const slots=C.map(()=>({v:-1,p:0})),D=Array.from({length:4},()=>[]),fixed=Array(q).fill(null);
    let ok=true;
    for(let j=0;j<q&&ok;j++){
     const label=mod(j-anchorPhase,q),v=label-7,ix=chains[j];
     const allowed=[];
     for(const i of ix)if(v>=0)slots[i]={v,values:new Int8Array(Q)};
     for(let s=0;s<Q;s++){
      let k=s,good=true;const P=[];
      for(const i of ix){const p=mod(C[i]-k);if(!p||(i>=A&&i<B&&k!==0)){good=false;break}P.push(p);k=mod(a*k+b)}
      if(!good)continue;
      allowed.push(s);
      if(v>=0)ix.forEach((i,l)=>slots[i].values[s]=P[l]);
      else {fixed[j]=s;ix.forEach((i,l)=>slots[i]={v:-1,p:P[l]})}
     }
     if(!allowed.length||v<0&&allowed.length!==1)ok=false;
     else if(v>=0)D[v]=allowed;
    }
    if(!ok)continue;
    valid++;assignments+=D.reduce((p,d)=>p*BigInt(d.length),1n);
    for(const m of masks)F[m].fill(0);
    let constant=0;const k4=[0,0,0,0];
    const val=s=>s.v<0?s.p:s.values[k4[s.v]];
    for(let i=0;i<slots.length;i++){
     const S=slots.slice(Math.max(0,i-2),i+1),vs=[...new Set(S.filter(s=>s.v>=0).map(s=>s.v))].sort((a,b)=>a-b),m=vs.reduce((x,v)=>x|(1<<v),0);
     const f=F[m],get=S.length===3?()=>T[(val(S[0])*Q+val(S[1]))*Q+val(S[2])]:S.length===2?()=>M[val(S[0])*Q+val(S[1])]:()=>U[val(S[0])];
     if(!m){constant+=get();continue}
     if(!f)throw Error("factor "+m);
     function fill(j,idx){if(j===vs.length){f[idx]+=get();return}const v=vs[j];for(const k of D[v]){k4[v]=k;fill(j+1,idx*Q+k)}}
     fill(0,0);
    }
    for(const y of D[1])for(const z of D[2]){
     const yz=y*Q+z;let left=-Infinity,right=-Infinity,x0,w0,nl=0,nr=0;
     for(const x of D[0]){const xy=x*Q+y,s=F[1][x]+F[3][xy]+F[7][xy*Q+z];if(s>left){left=s;x0=x;nl=1}else if(s===left)nl++}
     for(const w of D[3]){const s=F[8][w]+F[12][z*Q+w]+F[14][yz*Q+w];if(s>right){right=s;w0=w;nr=1}else if(s===right)nr++}
     const s=constant+F[2][y]+F[4][z]+F[6][yz]+left+right;
     if(!best||s>best.score){
      const tail=[x0,y,z,w0];for(let j=0;j<4;j++)k4[j]=tail[j];
      const P=slots.map(val),key=fixed.map((k,j)=>k??tail[mod(j-anchorPhase,q)-7]);
      if(score(P)!==s||!same(enc(P,key,a,b),C)||!same(P.slice(A,B),C.slice(A,B)))throw Error("replay/factor");
      best={score:s,a,b,key,P};ties=BigInt(nl*nr);
     }else if(s===best.score)ties+=BigInt(nl*nr);
    }
   }
  }
  return {best,optional,valid,assignments:assignments.toString(),ties:ties.toString()};
 }
 function continuation(C,fit){
  let K=fit.key.slice(),t=0;
  for(const p of fit.P)if(p){const j=t++%q;K[j]=mod(fit.a*K[j]+fit.b)}
  let count=0,best=null;const P=fit.P.slice();
  function dfs(i,t,s){
   if(i===C.length){count++;if(!best||s>best.score)best={P:P.slice(),score:s};return}
   const j=t%q,k=K[j],p=mod(C[i]-k);
   if(!C[i]){const d=term([P.at(-2),P.at(-1),0]);P.push(0);dfs(i+1,t,s+d);P.pop()}
   if(p){const d=term([P.at(-2),P.at(-1),p]);P.push(p);K[j]=mod(fit.a*k+fit.b);dfs(i+1,t+1,s+d);K[j]=k;P.pop()}
  }
  dfs(cut,t,0);
  if(best&&!same(enc(best.P,fit.key,fit.a,fit.b),C))throw Error("held replay");
  return {count,best};
 }
 function plant(P,a,b,seed){
  const forced=Array(q).fill(null);let t=0;
  for(let i=0;i<P.length;i++){if(!P[i])continue;const j=t%q;if(i>=A&&i<B){let k=0;const inv=Array.from({length:Q},(_,v)=>v).find(v=>mod(a*v)===1);for(let z=0;z<Math.floor(t/q);z++)k=mod(inv*(k-b));forced[j]=k}t++}
  for(let attempt=0;attempt<10000;attempt++){
   const key=forced.map(k=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return k??seed%Q});
   const C=enc(P,key,a,b);
   if(same(C.slice(A,B),P.slice(A,B))&&C.slice(0,A).concat(C.slice(B,cut)).filter(x=>!x).length<=3&&C.slice(cut).filter(x=>!x).length<=3)return {C,key,a,b,P};
  }throw Error("no matched plant");
 }
 let C,truth=null;
 if(which===0){const P=read(n.sections.find(s=>s.name==="0_welcome").source_text).slice(130,251);truth=plant(P,7,12,817);C=truth.C}
 else if(which===1){const P=gp(lit[3].slice(lit[3].indexOf("Blessed are the poor"))).slice(1094,1215);truth=plant(P,1,1,993);C=truth.C}
 else if(which==="original"){C=c.pages.find(p=>p.page===32)?.indices??c.pages[32].indices}
 else throw Error("which");
 if(C.length!==L||!C[A]||C[A+1]||C[A+2]||C.slice(A+3,B).some(x=>!x))throw Error("anchor shape");
 const fit=inverse(C.slice(0,cut)),held=fit.best?continuation(C,fit.best):null;
 const hit=truth&&fit.best&&held?.best?{param:fit.best.a===truth.a&&fit.best.b===truth.b,key:same(fit.best.key,truth.key),fit:fit.best.P.filter((p,i)=>p===truth.P[i]).length,held:held.best.P.slice(cut).filter((p,i)=>p===truth.P[cut+i]).length}:null;
 const render=P=>P.map(x=>c.translit[x]).join(" ");
 return {which,trainingRunes:total,C,truth,fit,held,hit,pass:!!(hit&&hit.param&&hit.key&&hit.fit>=75&&hit.held>=38),fitText:fit.best&&render(fit.best.P),heldText:held?.best&&render(held.best.P.slice(cut)),fitPerRune:fit.best&&fit.best.score/(1024*cut),heldPerRune:held?.best&&held.best.score/(1024*(L-cut))};
}
module.exports={experiment,files};
if(require.main===module){const raw=files.map(f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8"));const controls=[experiment(raw,0),experiment(raw,1)];console.log(JSON.stringify({controls,original:controls.every(x=>x.pass)?experiment(raw,"original"):null},null,2))}
