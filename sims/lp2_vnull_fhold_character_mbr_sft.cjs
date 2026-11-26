"use strict";
const fs=require("node:fs");
const {train,decode:mapDecode,edges,replay,words,primes,encode,makeRng,paths,mod}=require("./lp2_vnull_fhold_joint_clock_sft.cjs");
const Q=29,M=30,B=M**3,S=29,SUPP=1-.664/3.448;
const la=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
function decode(C,K,lp,L=null,supp=SUPP){
 const n=C.length;
 if(K.length<n)throw Error("short key");
 const E=Array.from({length:n+1},()=>new Map()),R=Array.from({length:n+1},()=>new Set());R[0].add(0);
 for(let i=0;i<n;i++)for(const j of R[i]){const es=edges(C,K,i,j,supp);E[i].set(j,es);for(const e of es)R[e.i].add(e.j)}
 for(let i=n-1;i>=0;i--)for(const [j,es] of E[i]){const good=es.filter(e=>R[e.i].has(e.j));E[i].set(j,good);if(!good.length)R[i].delete(j)}
 if(!R[0].has(0))return null;
 const D=Array.from({length:n+1},()=>new Map()),H=(S*M+S)*M+S,key=(j,t,h)=>(j*(n+1)+t)*B+h;
 D[0].set(key(0,0,H),{j:0,t:0,h:H,a:0,b:-Infinity});
 function dest(u,e){const t=u.t+1;if(L!==null&&(t>L||t+n-e.i<L))return null;const h=(u.h%(M*M))*M+e.p;return {t,h,k:key(e.j,t,h)}}
 for(let i=0;i<n;i++)for(const u of D[i].values())for(const e of E[i].get(u.j)){
  const d=dest(u,e);if(!d)continue;let v=D[e.i].get(d.k);if(!v){v={j:e.j,t:d.t,h:d.h,a:-Infinity,b:-Infinity};D[e.i].set(d.k,v)}
  v.a=la(v.a,u.a+e.w+lp[u.h*Q+e.p]);
 }
 let Z=-Infinity;for(const u of D[n].values())if(L===null||u.t===L){u.b=0;Z=la(Z,u.a)}
 if(!Number.isFinite(Z))return null;
 const P=Array.from({length:n},()=>new Float64Array(Q));
 for(let i=n-1;i>=0;i--)for(const u of D[i].values())for(const e of E[i].get(u.j)){
  const d=dest(u,e);if(!d)continue;const v=D[e.i].get(d.k);if(!v||v.b===-Infinity)continue;
  const w=e.w+lp[u.h*Q+e.p];u.b=la(u.b,w+v.b);P[u.t][e.p]+=Math.exp(u.a+w+v.b-Z);
 }
 if(Math.abs(D[0].get(key(0,0,H)).b-Z)>1e-7)throw Error("forward-backward");
 const T=Array.from({length:n+1},()=>new Map());T[0].set(0,{j:0,t:0,v:0});
 for(let i=0;i<n;i++)for(const u of T[i].values())for(const e of E[i].get(u.j)){
  const t=u.t+1;if(L!==null&&(t>L||t+n-e.i<L))continue;const k=e.j*(n+1)+t,v=u.v+P[u.t][e.p],o=T[e.i].get(k);if(!o||v>o.v)T[e.i].set(k,{j:e.j,t,v,back:u,e});
 }
 let best=null;for(const u of T[n].values())if((L===null||u.t===L)&&(!best||u.v>best.v))best=u;
 const ev=[];for(let u=best;u.back;u=u.back)ev.push(u.e);ev.reverse();replay(C,K,ev,supp);
 return {P:ev.map(e=>e.p),events:ev,ll:Z/n,states:D.reduce((a,x)=>a+x.size,0),risk:best.v};
}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
function experiment(raw,seed=0x47f0a11,N=60,holdout=false,start=0){
 const rng=makeRng(seed),prime=primes(2000).map(p=>mod(p-1)),kw=["WELCOME","DIUINITY","FIRFUMFERENFE"].map(w=>words(w).flat()),native=JSON.parse(raw[4]),rm=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(r=>rm.has(r)).map(r=>rm.get(r))})).filter(x=>x.P.length>=240);
 const seq=raw.slice(1,4).map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7)))),other=holdout?words(raw[5]).flat():null,out=[];
 function score(d,P){return d?{pos:d.P.reduce((n,x,i)=>n+(x===P[i]),0)/P.length,edit:edit(d.P,P),len:d.P.length,ll:d.ll,states:d.states}:null}
 for(let i=0;i<N;i++){
  const donor=i%2===0?ns[rng(ns.length)].P:holdout?other:seq[i%3].slice(Math.floor(seq[i%3].length*.7)),at=rng(donor.length-239),P=donor.slice(at,at+240),kind=i%5,K=kind===0?Array.from({length:600},()=>rng(29)):kind===1?prime.slice(0,600):Array.from({length:600},(_,j)=>kw[kind-2][j%kw[kind-2].length]);
  const {C}=encode(P,K,rng),W=Array.from({length:600},()=>rng(29));if(i<start)continue;
  const map=mapDecode(C,K,lp),blind=decode(C,K,lp),fixed=decode(C,K,lp,240),wrong=decode(C,W,lp);
  if(!blind||!fixed||!map.possible)throw Error("true path lost");
  if(Math.abs(blind.ll-map.ll)>1e-8)throw Error("marginal evidence disagreement");
  out.push({i,kind,at,n:C.length,map:score(map,P),blind:score(blind,P),fixed:score(fixed,P),wrong:wrong?wrong.ll:null});
 }
 function summary(k){const a=out.map(x=>x[k]);return {exact:a.filter(x=>x.edit===0).length,pass:a.filter(x=>x.pos>=.85).length,meanPos:a.reduce((n,x)=>n+x.pos,0)/a.length,meanEdit:a.reduce((n,x)=>n+x.edit,0)/a.length,minLL:Math.min(...a.map(x=>x.ll)),maxStates:Math.max(...a.map(x=>x.states))}}
 return {seed:"0x"+seed.toString(16),holdout,N,start,summary:{map:summary("map"),blind:summary("blind"),fixed:summary("fixed"),wrongFeasible:out.filter(x=>x.wrong!==null).length,wrongMax:Math.max(...out.filter(x=>x.wrong!==null).map(x=>x.wrong))},rows:out};
}
if(require.main===module){const raw=[...paths,"resources/control/orthodox_daily_prayers_pg34981.txt"].map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify({development:experiment(raw),holdout:experiment(raw,0x47a91c2,40,true)},null,2))}
module.exports={decode,experiment};
