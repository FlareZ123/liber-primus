'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,raw){
 const M=29,A=M*M,mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"GP token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 const P=raw.map(native),U=new Float64Array(M).fill(.5),B=new Float64Array(A).fill(.25);
 for(let i=0;i<P[0].length;i++){U[P[0][i]]++;if(i)B[P[0][i-1]*M+P[0][i]]++}const N=U.reduce((a,b)=>a+b);for(let x=0;x<M;x++){U[x]/=N;let s=0;for(let y=0;y<M;y++)s+=B[x*M+y];for(let y=0;y<M;y++)B[x*M+y]/=s}
 const map=Array.from({length:A},()=>new Int8Array(M).fill(-1));
 function emit(p,k,prev){if(!p)return 0;const c=mod(p+k);return k!==0&&c===prev?k:c}
 for(let prev=0;prev<M;prev++)for(let k=0;k<M;k++)for(let p=1;p<M;p++){let c=emit(p,k,prev);assert(map[prev*M+c][k]<0,"active injection");map[prev*M+c][k]=p}
 for(let prev=0;prev<M;prev++)for(let c=0;c<M;c++)for(let k=0;k<M;k++)assert((map[prev*M+c][k]>=0)===(k===0?c!==0:c!==prev),"support law");
 const em=map.map(row=>Float64Array.from(row,p=>p<0?0:U[p])),logB=B.map(Math.log),logU=U.map(Math.log),h=U[0];
 function encode(p,key,start=0,iv=0){let t=start,c=iv,out=[c],repaired=0;for(let x of p){let k=key(t);let y=emit(x,k,c);if(x){repaired+=Number(y!==mod(x+k));t++}out.push(y);c=y}return {C:out,repaired,end:t}}
 function reach(C,key,start,period=0){let live=[start],next=[],seen=new Uint8Array(period||start+C.length+2),maxWidth=1;for(let i=1;i<C.length;i++){const c=C[i],r=map[C[i-1]*M+c];next.length=0;for(let t of live){if(c===0&&!seen[t]){seen[t]=1;next.push(t)}if(r[key(t)]>=0){const u=period?(t+1)%period:t+1;if(!seen[u]){seen[u]=1;next.push(u)}}}if(!next.length)return {reach:i-1,maxWidth};for(let t of next)seen[t]=0;maxWidth=Math.max(maxWidth,next.length);[live,next]=[next,live]}return {reach:C.length-1,maxWidth,end:live.slice()}}
 function viterbi(C,key,start,period=0,initial=-1){
  let a=new Map([[2*start+1,{v:0,p:initial}]]),back=[];for(let i=1;i<C.length;i++){let c=C[i],r=map[C[i-1]*M+c],v=new Map(),b=new Map();const put=(s,p,z,prev)=>{let old=v.get(s);if(!old||z>old.v){v.set(s,{v:z,p});b.set(s,prev)}};for(let [s,o] of a){let t=s>>1,k=key(t),p=r[k];if(c===0)put(2*t,0,o.v+(o.p<0?logU[0]:logB[o.p*M]),s);if(p>=0){let u=period?(t+1)%period:t+1;put(2*u+1,p,o.v+(o.p<0?logU[p]:logB[o.p*M+p]),s)}}if(!v.size)return {reach:i-1};back.push(b);a=v}
  let best=[-1,{v:-Infinity}];for(let z of a)if(z[1].v>best[1].v)best=z;let s=best[0],end=s>>1,last=best[1].p,plain=new Array(C.length-1);for(let i=C.length-1;i>=1;i--){let prev=back[i-1].get(s);plain[i-1]=(s&1)?map[C[i-1]*M+C[i]][key(prev>>1)]:0;s=prev}assert(encode(plain,key,start,C[0]).C.join()===C.join(),"exact replay");return {reach:C.length-1,score:best[1].v/(C.length-1),plain,end,last}
 }
 const primes=[];for(let n=2;primes.length<21000;n++){let p=true;for(let d of primes){if(d*d>n)break;if(n%d===0){p=false;break}}if(p)primes.push(n)}
 const kw8=native("DIUINITY"),kw13=native("FIRFUMFERENFE");assert(kw8.length===8&&kw13.length===13&&kw13.filter(x=>x===0).length===4,"native keywords");const laws=[{name:"DIUINITY",key:t=>kw8[t%8],period:8,origins:8},{name:"FIRFUMFERENFE",key:t=>kw13[t%13],period:13,origins:13},{name:"prime-totient",key:t=>(primes[t]-1)%29,period:0,origins:3302}];
 const chap=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],scopes=chap.map(([a,b])=>({name:`p${a}–${b}`,C:gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));scopes.push({name:"p0–55",C:scopes.flatMap(x=>x.C)});
 function known(C,law,trainN){let training=C.slice(0,trainN+1),best=null,maxFull=0,full=[],train=[];for(let s=0;s<law.origins;s++){let r=reach(training,law.key,s,law.period);if(r.reach===trainN){train.push(s);let v=viterbi(training,law.key,s,law.period);if(!best||v.score>best.score)best={...v,start:s}}}if(best){let v=viterbi(C.slice(trainN),law.key,best.end,law.period,best.last);best={start:best.start,score:best.score,end:best.end,last:best.last,heldReach:v.reach,heldScore:v.score,fitPlain:best.plain,heldPlain:v.plain}}for(let s=0;s<law.origins;s++){let r=reach(C,law.key,s,law.period);maxFull=Math.max(maxFull,r.reach);if(r.reach===C.length-1)full.push(s)}return {full,train,maxFull,best}}
 const knownControls=[];for(let j=0;j<laws.length;j++){const law=laws[j],p=P[1+j%2].slice(10000+j*2000,13007+j*2000),start=[3,7,761][j],iv=23,C=encode(p,law.key,start,iv),r=known(C.C,law,2000);assert(r.full.includes(start),"known schedule true origin");knownControls.push({name:law.name,start,repaired:C.repaired,repeats:C.C.slice(1).filter((x,i)=>x===C.C[i]).length,selected:r.best?.start,fitExact:r.best?.fitPlain.filter((x,i)=>x===p[i]).length,heldExact:r.best?.heldPlain?.filter((x,i)=>x===p[2000+i]).length,full:r.full,train:r.train,heldScore:r.best?.heldScore})}
 const originalKnown=scopes.map(({name,C})=>({name,length:C.length,nonzeroRepeats:C.slice(1).filter((x,i)=>x!==0&&x===C[i]).length,results:laws.map(law=>({law:law.name,...known(C,law,Math.floor((C.length-1)*.75))}))}));
 // Efficient exact expectation step over latent consuming phase. Aggregate posterior active-edge
 // weights by (phase, visible ciphertext pair) before estimating the shift row.
 function pairCodes(C){return Uint16Array.from(C.slice(1),(c,i)=>C[i]*M+c)}
 const emFlat=Float64Array.from(em.flatMap(x=>Array.from(x)));
 function hardScore(D,f){const q=f.length;let a=new Float64Array(q).fill(1/q),v=new Float64Array(q),score=0;for(let d of D){const z=d%M===0?h:0;let s=0;for(let r=0;r<q;r++){let next=r+1===q?0:r+1;v[next]=a[r]*emFlat[d*M+f[r]]+z*a[next];s+=v[next]}if(!s)return -Infinity;score+=Math.log(s);for(let r=0;r<q;r++)v[r]/=s;[a,v]=[v,a]}return score/D.length}
 function step(D,w,q){
  const V=new Float64Array(q*A),G=new Float64Array(q*A),E=new Float64Array(q*M),aa=new Float64Array((D.length+1)*q),sc=new Float64Array(D.length);let a=new Float64Array(q).fill(1/q),v=new Float64Array(q),score=0;aa.set(a);
  for(let r=0;r<q;r++)for(let d=0;d<A;d++){let s=0;for(let k=0;k<M;k++)s+=w[r*M+k]*emFlat[d*M+k];V[r*A+d]=s}
  for(let i=0;i<D.length;i++){let d=D[i],z=d%M===0?h:0,s=0;for(let r=0;r<q;r++){let next=r+1===q?0:r+1;v[next]=a[r]*V[r*A+d]+z*a[next];s+=v[next]}assert(s>0,"soft support");sc[i]=s;score+=Math.log(s);for(let r=0;r<q;r++)v[r]/=s;[a,v]=[v,a];aa.set(a,(i+1)*q)}
  let b=new Float64Array(q).fill(1),u=new Float64Array(q);for(let i=D.length-1;i>=0;i--){let d=D[i],z=d%M===0?h:0,s=sc[i];for(let r=0;r<q;r++){let next=r+1===q?0:r+1,t=b[next]/s;G[r*A+d]+=aa[i*q+r]*t;u[r]=z*b[r]/s+V[r*A+d]*t}[b,u]=[u,b]}
  for(let r=0;r<q;r++)for(let k=0;k<M;k++){let s=0;for(let d=0;d<A;d++)s+=G[r*A+d]*emFlat[d*M+k];E[r*M+k]=w[r*M+k]*s}
  // Active counts and hold counts sum to N. Sharpen only modestly; this is generalized EM.
  const out=new Float64Array(q*M);for(let r=0;r<q;r++){let s=0;for(let k=0;k<M;k++){let t=Math.pow(E[r*M+k]+.03,1.035);out[r*M+k]=t;s+=t}for(let k=0;k<M;k++)out[r*M+k]/=s}
  return {w:out,score:score/D.length};
 }
 let seed=0x19fe0ca;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
 const harden=(w,q)=>Array.from({length:q},(_,r)=>{let b=0;for(let k=1;k<M;k++)if(w[r*M+k]>w[r*M+b])b=k;return b});
 const canon=f=>{let b=f.join(",");for(let r=1;r<f.length;r++){let z=f.slice(r).concat(f.slice(0,r)).join(",");if(z<b)b=z}return b};
 function fit(C,q,truth=null){const D=pairCodes(C),cache=new Map(),matches=f=>truth?Math.max(...Array.from({length:q},(_,r)=>f.filter((v,i)=>v===truth[(i+r)%q]).length)):null;let best={f:Array(q).fill(0),score:hardScore(D,Array(q).fill(0)),start:-1,it:0},trace=[];
  function consider(f,start,it){let id=canon(f),score=cache.get(id);if(score===undefined){score=hardScore(D,f);cache.set(id,score)}if(score>best.score)best={f:f.slice(),score,start,it};return {score:Number.isFinite(score)?score:null,matches:matches(f)}}
  for(let start=0;start<8;start++){let w=new Float64Array(q*M);for(let r=0;r<q;r++){let s=0;for(let k=0;k<M;k++){let v=.5+rnd();if(k===0)v*=3;w[r*M+k]=v;s+=v}for(let k=0;k<M;k++)w[r*M+k]/=s}let last=null,rec=[];
   for(let i=0;i<=100;i++){let f=harden(w,q);if(i%5===0||i===100){const z=consider(f,start,i);rec.push({i,soft:last,hard:z.score,matches:z.matches})}if(i===100)break;let t=step(D,w,q);w=t.w;last=t.score}
   trace.push({start,history:rec,final:harden(w,q)});
  }
  let f=best.f.slice(),score=best.score;for(let sweep=0;sweep<2;sweep++){let changed=0;for(let r=0;r<q;r++){let old=f[r],k0=old,s0=score;for(let k=0;k<M;k++)if(k!==old){f[r]=k;let v=hardScore(D,f);if(v>s0){s0=v;k0=k}}f[r]=k0;score=s0;changed+=Number(k0!==old)}if(!changed)break}
  if(score>best.score)best={f,score,start:best.start,it:best.it,refined:true};
  return {best:{...best,matches:matches(best.f)},trace,uniqueHard:cache.size};
 }
 function decodeFit(C,q,f,n){const law={name:"unknown",key:t=>f[t%q],period:q,origins:q};let T=C.slice(0,n+1),best=null;for(let r=0;r<q;r++){const v=viterbi(T,law.key,r,q);if(v.reach===n&&(!best||v.score>best.score))best={...v,start:r}}if(!best)return {fitReach:0};let h=viterbi(C.slice(n),law.key,best.end,q,best.last);return {fitReach:n,fitScore:best.score,start:best.start,fitPlain:best.plain,heldReach:h.reach,heldScore:h.score,heldPlain:h.plain,heldPreview:h.plain?.slice(0,80).map(x=>gp.translit[x]).join(" ")}}
 const controls=[],original=[],n=10000,originalC=scopes.at(-1).C;
 for(let j=0;j<2;j++){const q=[8,13][j],p=P[j+1].slice(18000+j*12000,30955+j*12000),f=Array.from({length:q},()=>1+Math.floor(rnd()*28)),zero=new Set();while(zero.size<2)zero.add(Math.floor(rnd()*q));for(let r of zero)f[r]=0;const start=Math.floor(rnd()*q),e=encode(p,t=>f[t%q],start,17),fitResult=fit(e.C.slice(0,n+1),q,f),d=decodeFit(e.C,q,fitResult.best.f,n);const z={q,source:["Gibran","Emerson"][j],truth:f,start,repaired:e.repaired,repeats:e.C.slice(1).filter((x,i)=>x===e.C[i]).length,...fitResult,...d,fitExact:d.fitPlain?.filter((x,i)=>x===p[i]).length,heldExact:d.heldPlain?.filter((x,i)=>x===p[n+i]).length};controls.push(z);
   if(z.heldReach===2955&&z.heldExact>=.95*2955){const a=fit(originalC.slice(0,n+1),q),v=decodeFit(originalC,q,a.best.f,n);original.push({q,...a,...v})}else original.push({q,skipped:"blind positive gate failed"});
 }
 return {knownControls,originalKnown,controls,original,lawKeys:[kw8,kw13],holdPrior:h,n,model:"zero-key bypass; nonzero-key active collision goes to unused key digit",nativeLengths:P.map(x=>x.length)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1)),null,2));
