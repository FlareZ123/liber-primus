"use strict";
/**
 * Exact AGL(1,29) shared-position inverse for tree pages p8..14.
 * No printed-word constraints. Six physical pages fit; seventh predicts.
 * Node 22 CommonJS, standard library. No cipher key guesses or beam.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json");
const native=read("resources/external/relikd-solved-gp29-native-v1.json");
const sections=native.sections.map(s=>[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0));
assert.equal(sections.reduce((n,s)=>n+s.length,0),2979);
const Q=29, K=812, N=137, M=7;
const maps=Array.from({length:K},(_,k)=>Uint8Array.from({length:Q},(_,x)=>((1+Math.floor(k/Q))*x+k%Q)%Q));
const original=gp.pages.slice(8,15).map(p=>p.indices);
assert.deepEqual(original.map(p=>p.length),[255,268,263,273,261,272,137]);
/** @param {number[][]} ss */
function train(ss) {
 const u=new Float64Array(Q).fill(.5), B=new Float64Array(Q*Q), total=new Float64Array(Q);
 for(const s of ss) for(let i=0;i<s.length;i++){u[s[i]]++; if(i){B[s[i-1]*Q+s[i]]++;total[s[i-1]]++;}}
 const z=u.reduce((a,b)=>a+b,0); for(let x=0;x<Q;x++)u[x]/=z;
 for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)B[x*Q+y]=(B[x*Q+y]+8*u[y])/(total[x]+8);
 return {u,B};
}
/** Exact forward likelihood (uniform independent inverse maps) and MAP of first six streams.
 * @param {number[][]} pages @param {{u:Float64Array,B:Float64Array}} model */
function infer(pages,model) {
 const {u,B}=model;
 const rows=pages.map(p=>p.slice(0,N)); assert(rows.every(p=>p.length===N));
 const decoded=Array.from({length:N},(_,t)=>Array.from({length:M},(_,j)=>Uint8Array.from(maps,m=>m[rows[j][t]])));
 let f6=new Float64Array(K),f7=new Float64Array(K),v=new Float64Array(K);
 const back=new Uint16Array(N*K);
 for(let k=0;k<K;k++){
  let p=1;for(let j=0;j<6;j++)p*=u[decoded[0][j][k]];
  f6[k]=p/K;f7[k]=p*u[decoded[0][6][k]]/K;v[k]=p;
 }
 function normalize(a){const s=a.reduce((x,y)=>x+y,0);for(let i=0;i<K;i++)a[i]/=s;return Math.log(s);}
 function maxnorm(a){let s=0;for(let i=0;i<K;i++)if(a[i]>s)s=a[i];for(let i=0;i<K;i++)a[i]/=s;return Math.log(s);}
 let z6=normalize(f6),z7=normalize(f7),mv=maxnorm(v);
 for(let t=1;t<N;t++){
  const old=decoded[t-1],cur=decoded[t];
  const next6=new Float64Array(K),next7=new Float64Array(K),nv=new Float64Array(K);
  const c0=cur[0],c1=cur[1],c2=cur[2],c3=cur[3],c4=cur[4],c5=cur[5],c6=cur[6];
  for(let a=0;a<K;a++){
   const o0=old[0][a]*Q,o1=old[1][a]*Q,o2=old[2][a]*Q,o3=old[3][a]*Q,o4=old[4][a]*Q,o5=old[5][a]*Q,o6=old[6][a]*Q;
   const w6=f6[a],w7=f7[a],wv=v[a];
   for(let b=0;b<K;b++){
    const p=B[o0+c0[b]]*B[o1+c1[b]]*B[o2+c2[b]]*B[o3+c3[b]]*B[o4+c4[b]]*B[o5+c5[b]];
    next6[b]+=w6*p;next7[b]+=w7*p*B[o6+c6[b]];
    const w=wv*p;if(w>nv[b]){nv[b]=w;back[t*K+b]=a;}
   }
  }
  z6+=normalize(next6)-Math.log(K);z7+=normalize(next7)-Math.log(K);mv+=maxnorm(nv);
  f6=next6;f7=next7;v=nv;
 }
 let last=0;for(let k=1;k<K;k++)if(v[k]>v[last])last=k;
 const keys=new Array(N);keys[N-1]=last;for(let t=N-1;t>0;t--)keys[t-1]=back[t*K+keys[t]];
 const out=rows.map((r,j)=>r.map((x,t)=>maps[keys[t]][x]));
 const inv=maps.map(m=>{const a=new Uint8Array(Q);m.forEach((x,i)=>a[x]=i);return a;});
 for(let j=0;j<M;j++)for(let t=0;t<N;t++)assert.equal(inv[keys[t]][out[j][t]],rows[j][t]);
 const llr=r=>Math.log(Q*u[r[0]])+r.slice(1).reduce((s,x,i)=>s+Math.log(Q*B[r[i]*Q+x]),0);
 return {fitMarginalLLR:(z6+6*N*Math.log(Q))/(6*N),
  conditionalHeldLLR:(z7-z6+N*Math.log(Q))/N,fitMAPLLR:(mv+6*N*Math.log(Q))/(6*N),
  frozenHeldMAPLLR:llr(out[6])/N,keys,held:out[6],fit:out.slice(0,6)};
}
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n;};}
function plant(which,seed,independent=false){
 const spec=which===0?[[1,3],[3,4]]:[[4,5],[5,2]];
 const excluded=new Set(spec.map(x=>x[0]));
 const plain=spec.flatMap(([s,n])=>Array.from({length:n},(_,i)=>sections[s].slice(i*N,(i+1)*N)));
 assert.equal(plain.length,7);assert(plain.every(p=>p.length===N));
 const rand=rng(seed), truth=Array.from({length:N},()=>rand(K));
 const ciphertext=plain.map((p,j)=>p.map((x,t)=>maps[independent&&j===6?rand(K):truth[t]].indexOf(x)));
 const r=infer(ciphertext,train(sections.filter((_,i)=>!excluded.has(i))));
 const keyHits=r.keys.filter((k,t)=>k===truth[t]).length;
 const fitHits=r.fit.reduce((s,row,j)=>s+row.filter((x,t)=>x===plain[j][t]).length,0);
 const heldHits=r.held.filter((x,t)=>x===plain[6][t]).length;
 delete r.fit;delete r.held;delete r.keys;
 return {which,seed,independent,keyHits,fitHits,heldHits,...r};
}
const mode=process.argv[2]||"original";
let result;
if(mode==="original"){
 const r=infer(original,train(sections));
 result={...r,heldRendered:r.held.map(x=>gp.translit[x]).join(" "),fitRendered:r.fit.map(p=>p.map(x=>gp.translit[x]).join(" ")),sourcePages:[8,9,10,11,12,13,14]};
}else if(mode==="plant0"||mode==="plant1"||mode==="null0"||mode==="null1"){
 const which=Number(mode.slice(-1));result=plant(which,461101+which,mode.startsWith("null"));
}else{throw Error("unknown mode");}
console.log(JSON.stringify(result));
