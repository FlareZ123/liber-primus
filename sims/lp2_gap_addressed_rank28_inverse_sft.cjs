#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const src=JSON.parse(data[0]), C=src.pages.slice(0,56).flatMap(x=>x.indices), B=[0,729,1874,3612,5506,6527,7960,9640,12648,12956], N=29,M=28,R=21;
 const mod=(x,m=M)=>(x%m+m)%m, gp=q=>q>=R?q+1:q, rk=x=>x>R?x-1:x;
 const tok=src.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(s){return [...s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)].flatMap(m=>{const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const t=tok.find(t=>w.startsWith(t.t,i));if(t){a.push(t.i);i+=t.t.length}else i++}return a})}
 const donors=data.slice(1).map(native);
 const U=new Float64Array(N), H2=new Float64Array(N*N),H3=new Float64Array(N**3);
 for(const a of [donors[0]])for(let i=0;i<a.length;i++){U[a[i]]++;if(i)H2[a[i-1]*N+a[i]]++;if(i>1)H3[(a[i-2]*N+a[i-1])*N+a[i]]++}
 const un=U.reduce((a,b)=>a+b,0), L1=Float64Array.from(U,x=>Math.log((x+.5)/(un+N*.5))), L3=new Float64Array(N**3);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let s2=0,s3=0;for(let c=0;c<N;c++){s2+=H2[b*N+c];s3+=H3[(a*N+b)*N+c]}for(let c=0;c<N;c++){const p2=(H2[b*N+c]+10*Math.exp(L1[c]))/(s2+10);L3[(a*N+b)*N+c]=Math.log((H3[(a*N+b)*N+c]+10*p2)/(s3+10))}}
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}}
 function events(c){const last=Array(N).fill(-1);last[c[0]]=0;let g=0;const s=[],d=[];for(let i=1;i<c.length;i++){const x=c[i],delta=mod(x-c[i-1],N);s.push(g);d.push(delta-1);const old=last[x];g=old<0?0:i-old;last[x]=i}return {s,d}}
 function encrypt(p,k,iv){const c=[iv],last=Array(N).fill(-1);last[iv]=0;let g=0;for(let i=0;i<p.length;i++){const y=p[i]===R?c[i]:mod(c[i]+1+mod(rk(p[i])+k[g]),N);c.push(y);const old=last[y];g=old<0?0:i+1-old;last[y]=i+1}return c}
 function decode(e,k){return e.d.map((d,i)=>d<0?R:gp(mod(d-k[e.s[i]])))}
 function score(p,a=0,b=p.length){let sum=0;for(let i=a+2;i<b;i++)sum+=L3[(p[i-2]*N+p[i-1])*N+p[i]];return sum/Math.max(1,b-a-2)}
 function cap(c,H=new Map()){const e=events(c);let rep=0;for(let i=0;i<e.s.length;i++){if(e.d[i]<0){rep++;continue}const g=e.s[i];if(!H.has(g))H.set(g,new Int32Array(M));H.get(g)[e.d[i]]++}return {H,rep}}
 function sums(H){let out=Array(M).fill(0);for(const h of H.values()){const x=[...h].sort((a,b)=>b-a);let s=0;for(let i=0;i<M;i++){s+=x[i];out[i]+=s}}return {states:H.size,top1:out[0],top5:out[4],top10:out[9]}}
 const H=new Map(),sec=[];let repeats=0;for(let i=0;i<9;i++){const c=C.slice(B[i],B[i+1]);const h=cap(c);cap(c,H);repeats+=h.rep;sec.push({n:c.length-1,repeats:h.rep,...sums(h.H)})}
 const common={n:C.length-9,repeats,...sums(H)};
 const top5=[...Array(N).keys()].filter(i=>i!==R).sort((a,b)=>U[b]-U[a]).slice(0,5),E=18;
 function floors(p,n){let e=0,t=0,minE=Infinity,min5=Infinity;const set=new Set(top5);for(let i=0;i<p.length;i++){e+=Number(p[i]===E);t+=Number(set.has(p[i]));if(i>=n){e-=Number(p[i-n]===E);t-=Number(set.has(p[i-n]))}if(i>=n-1){minE=Math.min(minE,e);min5=Math.min(min5,t)}}return {minE,min5,windows:p.length-n+1}}
 const allFloors=[common,...sec].map(x=>donors.slice(1).map(p=>floors(p,x.n)));
 const primes=[];for(let x=2;primes.length<=C.length;x++){let yes=true;for(const q of primes){if(q*q>x)break;if(x%q===0){yes=false;break}}if(yes)primes.push(x)}
 function fixedFit(c,cut){const e=events(c);let best={v:-Infinity},maxG=Math.max(...e.s);for(let a=0;a<M;a++)for(let b=0;b<M;b++){const k=Array.from({length:maxG+1},(_,g)=>mod(a*(primes[g]-1)+b));const p=decode(e,k),v=score(p,0,cut);if(v>best.v)best={v,a,b,p,k}}const h=score(best.p,cut);if(encrypt(best.p,best.k,c[0]).some((x,i)=>x!==c[i]))throw Error("fixed replay");return {a:best.a,b:best.b,train:best.v,held:h,excerpt:best.p.slice(cut,cut+120).map(x=>src.translit[x]).join("")}}
 function fit(c,cut,seed){
  const e=events(c), n=cut, G=Math.max(...e.s)+1, rnd=rng(seed), pos=Array.from({length:G},()=>[]), aff=Array.from({length:G},()=>[]);
  for(let i=0;i<n;i++)if(e.d[i]>=0)pos[e.s[i]].push(i);
  const used=[];for(let g=0;g<G;g++)if(pos[g].length){used.push(g);const set=new Set();for(const i of pos[g])for(let j=Math.max(2,i);j<=Math.min(n-1,i+2);j++)set.add(j);aff[g]=[...set]}
  const init=Array.from({length:G},(_,g)=>mod(primes[g]-1));
  for(const g of used){let v=-Infinity;for(let k=0;k<M;k++){let s=0;for(const i of pos[g])s+=L1[gp(mod(e.d[i]-k))];if(s>v){v=s;init[g]=k}}}
  let best={value:-Infinity}, restarts=10,sweeps=20;
  for(let z=0;z<restarts;z++){
   const k=init.slice();if(z)for(const g of used)if(rnd(4)===0)k[g]=rnd(M);
   const p=decode(e,k).slice(0,n), order=used.slice();
   for(let sw=0;sw<sweeps;sw++){
    for(let j=order.length-1;j>0;j--){const a=rnd(j+1);[order[j],order[a]]=[order[a],order[j]]}
    const temp=sw>=15?0:2*(1-sw/15);
    for(const g of order){
     const vals=new Float64Array(M);let mx=-Infinity,arg=0;
     for(let q=0;q<M;q++){for(const i of pos[g])p[i]=gp(mod(e.d[i]-q));let s=0;for(const i of aff[g])s+=L3[(p[i-2]*N+p[i-1])*N+p[i]];vals[q]=s;if(s>mx){mx=s;arg=q}}
     if(temp){let total=0;for(let q=0;q<M;q++)total+=Math.exp((vals[q]-mx)/temp);let u=(rnd(1<<24)/(1<<24))*total;for(let q=0;q<M;q++){u-=Math.exp((vals[q]-mx)/temp);if(u<=0){arg=q;break}}}
     k[g]=arg;for(const i of pos[g])p[i]=gp(mod(e.d[i]-arg));
    }
    const v=score(p);if(v>best.value)best={value:v,k:k.slice(),restart:z,sweep:sw};
   }
  }
  const p=decode(e,best.k);if(encrypt(p,best.k,c[0]).some((v,i)=>v!==c[i]))throw Error("replay mismatch");
  const seen=new Set(used);return {train:best.value,held:score(p,cut),key:best.k,seen:used,heldSeen:e.s.slice(cut).filter((g,i)=>seen.has(g)||e.d[cut+i]<0).length,plain:p,bestRestart:best.restart,bestSweep:best.sweep,excerpt:p.slice(cut,cut+120).map(x=>src.translit[x]).join("")}
 }
 const cOrig=C.slice(B[7],B[8]), len=cOrig.length-1, cut=2000;
 const controls=[];
 for(let d=1;d<=2;d++){const rnd=rng(0x6c1d3301+d),k=Array.from({length:len+1},()=>rnd(M)),p=donors[d].slice(6000+d*1700,6000+d*1700+len),iv=rnd(N),c=encrypt(p,k,iv),e=events(c),f=fit(c,cut,0x6c1d7700+d);let exactTrain=0,exactHeld=0,seenExact=0;const seen=new Set(f.seen);for(let i=0;i<len;i++)if(p[i]===f.plain[i]){if(i<cut)exactTrain++;else {exactHeld++;if(seen.has(e.s[i])||e.d[i]<0)seenExact++}}const keyCorrect=f.seen.filter(g=>k[g]===f.key[g]).length;controls.push({donor:d===1?"Gibran":"Emerson",train:f.train,held:f.held,trueTrain:score(p,0,cut),trueHeld:score(p,cut),exactTrain,exactHeld,seenExact,heldSeen:f.heldSeen,keyCorrect,keyTotal:f.seen.length,heldTotal:len-cut,excerpt:f.excerpt})}
 const fixedControls=[];for(let d=1;d<=2;d++){const a=d===1?5:9,b=d===1?11:19,k=Array.from({length:len+1},(_,g)=>mod(a*(primes[g]-1)+b)),p=donors[d].slice(11000+d*1700,11000+d*1700+len),c=encrypt(p,k,7+d),f=fixedFit(c,cut);fixedControls.push({trueA:a,trueB:b,...f})}
 const origFixed=fixedFit(cOrig,cut);
 const calibrated=controls.every(x=>x.exactHeld/x.heldTotal>=.85&&x.seenExact/x.heldSeen>=.9);
 let original=null;if(calibrated){const f=fit(cOrig,cut,0x6c1d8899);original={train:f.train,held:f.held,heldSeen:f.heldSeen,seenStates:f.seen.length,key:f.key,excerpt:f.excerpt,fullCandidate:f.plain}}
 return {scope:{start:B[7],end:B[8],cut,marker:R,trainDonor:"Shakespeare",top5,donorLengths:donors.map(x=>x.length)},common,sec,allFloors,controls,fixedControls,origFixed,calibrated,original};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
