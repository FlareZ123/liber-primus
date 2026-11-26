"use strict";
// Projective cumulative-cipher state capacity; no lexical or printed-boundary assumptions.
const fs=require("node:fs"),path=require("node:path");
function run(gp,sources){
 const mod=x=>((x%29)+29)%29;
 const dirs=[];for(let v=0;v<29;v++)for(let w=0;w<29;w++)dirs.push([1,v,w]);for(let w=0;w<29;w++)dirs.push([0,1,w]);dirs.push([0,0,1]);
 function top2(h){let a=0,b=0;for(const q of h){if(q>=a){b=a;a=q}else if(q>b)b=q}return a+b}
 function bound(h){let v=0;for(let j=0;j<841;j+=29)v+=top2(h.subarray(j,j+29));return v}
 const pages=gp.pages.slice(40,54),sizes=pages.map(p=>p.indices.length),N=sizes.reduce((a,b)=>a+b,0);
 function scan(reset){
  const A=new Uint8Array(N),B=new Uint8Array(N),T=new Uint8Array(N),X=new Uint8Array(N),C=new Uint8Array(N);
  let a=0,b=0,t=0,x=0,i=0;
  for(const p of pages){if(reset)a=b=t=x=0;for(const c of p.indices){A[i]=a;B[i]=b;T[i]=t;X[i]=x;C[i++]=c;a=(a+c)%29;b=(b+gp.prime[c]-1)%29;t=(t+1)%29;x=c;}}
  const h=new Uint16Array(841),base=new Uint16Array(N),residuals=Array.from({length:29},(_,r)=>Uint8Array.from(C,(c,i)=>(c+r*X[i])%29));
  let best=0,params=null,all0=0,allDiff=0;
  for(const [u,v,w] of dirs){for(let i=0;i<N;i++)base[i]=29*((u*A[i]+v*B[i]+w*T[i])%29);
   for(let r=0;r<29;r++){h.fill(0);const z=residuals[r];for(let i=0;i<N;i++)h[base[i]+z[i]]++;const b2=bound(h);if(b2>best){best=b2;params=[u,v,w,r]}if(r===0)all0=Math.max(all0,b2);if(r===28)allDiff=Math.max(allDiff,b2);}}
  return{n:N,best,params,all0,allDiff,classes:dirs.length*29}
 }
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return a}
 const original={continuous:scan(false),page:scan(true)},ceiling=Math.max(original.continuous.best,original.page.best);
 const tapes=sources.map(x=>native(x.source));
 const stats=tapes.map((tape,j)=>{const h=new Uint16Array(29);let min=Infinity,minAt=-1,passes=0;for(let i=0;i<N;i++)h[tape[i]]++;for(let i=0;i+N<=tape.length;i++){const k=top2(h);if(k<min){min=k;minAt=i}if(k<=ceiling)passes++;if(i+N<tape.length){h[tape[i]]--;h[tape[i+N]]++}}return{name:sources[j].name,tapeLength:tape.length,windows:tape.length-N+1,min,minAt,passes}});
 function plant(P,seed,params,reset){
  let s=seed;const rng=m=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)%m};
  const table=Array.from({length:29},()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
  const [u,v,w,r]=params,h=new Uint16Array(841),enc=[];let a=0,b=0,t=0,x=0,i=0;
  for(const len of sizes){if(reset)a=b=t=x=0;for(let j=0;j<len;j++){const state=(u*a+v*b+w*t)%29,z=table[state].indexOf(P[i++]),c=mod(z-r*x);enc.push(c);h[29*state+z]++;a=(a+c)%29;b=(b+gp.prime[c]-1)%29;t=(t+1)%29;x=c;}}
  const dec=[];a=b=t=x=i=0;for(const len of sizes){if(reset)a=b=t=x=0;for(let j=0;j<len;j++){const c=enc[i++],state=(u*a+v*b+w*t)%29,z=(c+r*x)%29;dec.push(table[state][z]);a=(a+c)%29;b=(b+gp.prime[c]-1)%29;t=(t+1)%29;x=c;}}
  const ph=new Uint16Array(29);for(const p of P)ph[p]++;
  if(dec.length!==P.length||dec.some((p,i)=>p!==P[i])||top2(ph)>bound(h))throw Error("control failure");
  return{seed,params,reset,n:dec.length,correct:dec.length,trueTop2:top2(ph),bound:bound(h)}
 }
 const plants=[plant(tapes[0].slice(1000,4008),0x6112601,[0,1,0,0],false),plant(tapes[1].slice(30000,33008),0x6112602,[1,25,9,28],false),plant(tapes[0].slice(17000,20008),0x6112603,[1,6,27,9],true)];
 return{original,stats,sizes,plants}
}
module.exports=run;
if(require.main===module){const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");const files=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),files.map(name=>({name,source:read(name)}))),null,2));}
