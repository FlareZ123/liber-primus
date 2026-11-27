"use strict";
/** Exact cyclic bigram MAP over all q8/q13 additive keys and optional-F prefix masks. */
const fs=require("node:fs"),path=require("node:path");const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(g,donor,raw){
 const Q=29,mod=x=>(x%Q+Q)%Q, ix=new Map(g.runes.map((r,i)=>[r,i]));
 const S=donor.sections.map(s=>[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c)));
 const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const un=new Float64Array(Q),bi=new Float64Array(30*Q),btot=new Float64Array(30);let N=0;
 for(const a of [native(raw),...[0,2,4,6,8].map(i=>S[i])]){let b=29;for(const p of a){un[p]++;N++;bi[b*Q+p]++;btot[b]++;b=p}}
 const log=new Float64Array(30*Q);for(let b=0;b<30;b++)for(let p=0;p<Q;p++){const u=(un[p]+.5)/(N+.5*Q);log[b*Q+p]=Math.log((bi[b*Q+p]+5*u)/(btot[b]+5))}
 function enc(P,key,holds){let c=0;return P.map((p,i)=>{if(holds[i]){if(p!==0)throw Error("invalid hold");return 0}return mod(p+key[c++%key.length])})}
 function dec(C,key,holds){let c=0;return C.map((x,i)=>holds[i]?0:mod(x-key[c++%key.length]))}
 function opt(C,q,holds){
  const U=Array.from({length:q},()=>new Float64Array(Q)),V=Array.from({length:q},()=>new Float64Array(Q*Q));
  const T=[];let t=0,con=0;
  for(let i=0;i<C.length;i++){if(holds[i]){T.push(-1);continue}T.push(t);t=(t+1)%q}
  for(let i=0;i<C.length;i++){
   const a=i?T[i-1]:-2,b=T[i],x=i?C[i-1]:0,y=C[i];
   if(a>=0&&b>=0){
    if(b!==(a+1)%q)throw Error("phase");
    const f=V[a];for(let k=0;k<Q;k++){const px=mod(x-k);for(let l=0;l<Q;l++)f[k*Q+l]+=log[px*Q+mod(y-l)]}
   }else if(b>=0){const p=a===-2?29:0;for(let k=0;k<Q;k++)U[b][k]+=log[p*Q+mod(y-k)]}
   else if(a>=0){for(let k=0;k<Q;k++)U[a][k]+=log[mod(x-k)*Q]}
   else con+=log[(a===-2?29:0)*Q];
  }
  let best=-Infinity,key=null;
  for(let k0=0;k0<Q;k0++){
   let d=new Float64Array(Q);d.fill(-Infinity);d[k0]=U[0][k0];const back=[];
   for(let j=1;j<q;j++){const n=new Float64Array(Q),b=new Int8Array(Q);n.fill(-Infinity);const f=V[j-1];for(let k=0;k<Q;k++){let mx=-Infinity,idx=0;for(let l=0;l<Q;l++){const s=d[l]+f[l*Q+k];if(s>mx){mx=s;idx=l}}n[k]=mx+U[j][k];b[k]=idx}back.push(b);d=n}
   for(let k=0;k<Q;k++){const s=d[k]+V[q-1][k*Q+k0]+con;if(s>best){best=s;const a=[k];for(let j=q-2;j>=0;j--)a.push(back[j][a[a.length-1]]);key=a.reverse()}}
  }
  const P=dec(C,key,holds);let sc=0,b=29;for(const p of P){sc+=log[b*Q+p];b=p}if(Math.abs(sc-best)>1e-8)throw Error("factorization mismatch");
  return {score:sc,key,P,holds};
 }
 function fit(C,q){
  const zeros=C.map((x,i)=>x===0?i:-1).filter(i=>i>=0);if(zeros.length>22)throw Error("too many masks");
  let best=null,second=-Infinity;
  for(let m=0;m<2**zeros.length;m++){const h=Array(C.length).fill(false);zeros.forEach((i,j)=>h[i]=!!(m&(1<<j)));const r=opt(C,q,h);if(!best||r.score>best.score){second=best?best.score:-Infinity;best=r}else second=Math.max(second,r.score)}
  return {...best,masks:2**zeros.length,second};
 }
 function cont(C,key,j,b){let cur=new Map([[j%key.length,{j:j%key.length,b,s:0,P:[],holds:[]}]]);for(const x of C){const n=new Map();for(const v of cur.values()){const put=(p,k,h)=>{const s=v.s+log[v.b*Q+p],id=k*Q+p,old=n.get(id);if(!old||s>old.s)n.set(id,{j:k,b:p,s,P:[...v.P,p],holds:[...v.holds,h]})};put(mod(x-key[v.j]),(v.j+1)%key.length,false);if(x===0)put(0,v.j,true)}cur=n}return [...cur.values()].reduce((a,b)=>a.s>b.s?a:b)}
 function run(C,q,cut,truth=null,truthKey=null,truthHolds=null){
  const f=fit(C.slice(0,cut),q), h=cont(C.slice(cut),f.key,cut-f.holds.filter(Boolean).length,f.P.at(-1));const P=f.P.concat(h.P),holds=f.holds.concat(h.holds);
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]), acc=(a,b)=>a.reduce((n,x,i)=>n+(x===b[i]),0);
  if(!eq(enc(P,f.key,holds),C))throw Error("replay");
  return {q,cut,score:f.score/cut,heldScore:h.s/(C.length-cut),key:f.key,masks:f.masks,second:f.second/cut,P,holds,replay:true,...(truth?{keyExact:eq(f.key,truthKey),fitCorrect:acc(f.P,truth.slice(0,cut)),heldCorrect:acc(h.P,truth.slice(cut)),holdCorrect:acc(holds,truthHolds)}:{})}
 }
 const P1=S[1].slice(0,308),P2=S[3].slice(0,308),keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 const makeH=(P,j)=>{let f=0;return P.map(p=>p===0&&((f++)%3!==j))};
 const plants=[P1,P2].map((P,i)=>{const h=makeH(P,i);return run(enc(P,keys[i],h),keys[i].length,232,P,keys[i],h)});
 const original=g.pages.filter(p=>p.page===54||p.page===55).flatMap(p=>p.indices),result=keys.map(k=>run(original,k.length,232));
 return {trainingRunes:N,plants,result};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),d=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),raw=read("resources/control/shakespeare_first300k.txt");
console.log(JSON.stringify(experiment(g,d,raw),null,2));
