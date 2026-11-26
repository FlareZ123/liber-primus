#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function privateGate(src,donorTexts,native){
 const Q=29, ALL=(1<<29)-1, mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
 const inv=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>j).find(j=>mod(i*j)===1));
 const pages=src.pages.map(x=>x.indices),op=pages.slice(0,3).flat(), rows=[null,...Array.from({length:55},(_,i)=>op.slice(14+13*i,27+13*i))],sums=rows.map(r=>r&&mod(r.reduce((a,b)=>a+b,0)));
 check(op.length===729&&op[13]===2&&sums[50]===0,"source partition");
 const cs=[];for(const reverse of [false,true])for(const normalized of [false,true])for(const scaled of [false,true])for(let lambda=0;lambda<Q;lambda++)cs.push({reverse,normalized,scaled,lambda});
 const keyOf=a=>String.fromCharCode(...a), bit=x=>1<<x, labels=m=>{const a=[];while(m){const z=m&-m;a.push(31-Math.clz32(z));m^=z}return a};
 function coeff(p,k){return (k.reverse?rows[p].slice().reverse():rows[p]).map(v=>mod(v*k.lambda*(k.normalized?inv[sums[p]]:1)))}
 function res(v,s,coef,a){let b=0;for(let j=0;j<13;j++)b+=coef[j]*s.charCodeAt(12-j);return mod((v-b)*inv[a])}
 function step(s,v){return s.slice(1)+String.fromCharCode(v)}
 function add(map,s,m){if(m)map.set(s,(map.get(s)||0)|m)}
 // Each state tracks all fixed t values reachable at that physical position.
 function support(c,co,a,clock){
  const layers=[new Map([[keyOf(c.slice(0,13)),ALL]])];let peak=1;
  for(let i=13;i<c.length;i++){const v=c[i],next=new Map();for(const [s,m] of layers[layers.length-1]){const ns=step(s,v),rr=res(v,s,co,a);add(next,ns,m&~bit(rr));if(v===0)add(next,clock==="physical"?ns:s,m)}
   if(!next.size)return null;layers.push(next);peak=Math.max(peak,next.size);
  }
  let accepted=0;for(const m of layers[layers.length-1].values())accepted|=m;
  // backward viable labels and exact per-position possible output labels by t
  let future=layers[layers.length-1];
  const cap=Array.from({length:Q},()=>({hist:new Int32Array(Q),overlap:new Int32Array(Q*Q)}));
  for(let i=c.length-1;i>=13;i--){const v=c[i],prev=new Map(),out=new Int32Array(Q);for(const [s,m] of layers[i-13]){const ns=step(s,v),rr=res(v,s,co,a),ordinary=m&~bit(rr)&(future.get(ns)||0);
    if(ordinary){add(prev,s,ordinary);for(const t of labels(ordinary))out[t]|=bit(rr)}
    if(v===0){const fm=m&(future.get(clock==="physical"?ns:s)||0);if(fm){add(prev,s,fm);for(const t of labels(fm))out[t]|=bit(t)}}
   }
   for(const t of labels(accepted)){const a=labels(out[t]);check(a.length,"missing viable label");const {hist,overlap}=cap[t];for(let j=0;j<a.length;j++){hist[a[j]]++;for(let k=j+1;k<a.length;k++)overlap[a[j]*Q+a[k]]++;}}
   future=prev;
  }
  let best=-1,bestT=-1,bestPair=null;for(const t of labels(accepted)){const {hist,overlap}=cap[t];for(let u=0;u<Q;u++)for(let v=u+1;v<Q;v++){const n=hist[u]+hist[v]-overlap[u*Q+v];if(n>best){best=n;bestT=t;bestPair=[u,v]}}}
  return {best,bestT,bestPair,accepted,peak};
 }
 function ordinary(c,co,a){const h=new Int32Array(Q);for(let i=13;i<c.length;i++)h[res(c[i],keyOf(c.slice(i-13,i)),co,a)]++;return [...h].sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0)}
 function page(d){
  const result={page:d.page,n:d.c.length-13,ordinary:{best:-1},physical:{best:-1,legalNonstatic:0},consuming:{best:-1,legalNonstatic:0}};
  for(const k of cs){const co=coeff(d.page,k),a=k.scaled?sums[d.page]:1,ob=ordinary(d.c,co,a);if(ob>result.ordinary.best)result.ordinary={best:ob,k};
   for(const clock of ["physical","consuming"]){const x=support(d.c,co,a,clock);if(!x)continue;const rr=result[clock];if(k.lambda)rr.legalNonstatic+=labels(x.accepted).length;if(x.best>rr.best)Object.assign(rr,{best:x.best,k,t:x.bestT,pair:x.bestPair,peak:x.peak});}
  }return result;
 }
 const original=pages.slice(3,56).map((c,i)=>({page:i+3,c})).filter(d=>d.c.length>13).map(page),n=original.reduce((s,x)=>s+x.n,0);
 const total={};for(const clock of ["ordinary","physical","consuming"])total[clock]=original.reduce((s,x)=>s+x[clock].best,0);
 const tok=src.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function encode(s){return [...s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)].flatMap(m=>{const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const t=tok.find(t=>w.startsWith(t.t,i));if(t){a.push(t.i);i+=t.t.length}else i++}return a})}
 function floor(x,n){const h=new Int32Array(Q);let min=Infinity,pos=-1;for(let i=0;i<x.length;i++){h[x[i]]++;if(i>=n)h[x[i-n]]--;if(i>=n-1){let a=0,b=0;for(const v of h){if(v>a){b=a;a=v}else if(v>b)b=v}if(a+b<min){min=a+b;pos=i-n+1}}}return {length:x.length,windows:x.length-n+1,min,pos}}
 const floors=donorTexts.map(x=>floor(encode(x),n));
 // true native path test: per-t union bound cannot undercount any two labels
 let seed=1033;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 const controls=[];
 for(const clock of ["physical","consuming"]){const x=native.sections.find(s=>s.name=== (clock==="physical"?"0_welcome":"0_koan_1"));const truth=[...x.source_text].map(c=>native.runes.indexOf(c)).filter(c=>c>=0);const p=clock==="physical"?7:54,k={reverse:true,normalized:true,scaled:clock==="physical",lambda:9};const co=coeff(p,k),a=k.scaled?sums[p]:1,alpha=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){const j=rnd(i+1);[alpha[i],alpha[j]]=[alpha[j],alpha[i]]}
  const c=Array.from({length:13},()=>rnd(Q));let state=keyOf(c);for(const z of truth){let b=0;for(let j=0;j<13;j++)b+=co[j]*state.charCodeAt(12-j);const v=z===0?0:mod(a*alpha[z]+b);c.push(v);if(z!==0||clock==="physical")state=step(state,v)}
  const actual=Array(Q).fill(0);for(const z of truth)actual[z]++;const top2=actual.sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0);const g=support(c,co,a,clock);check(g&&(g.accepted&bit(alpha[0]))&&g.best>=top2,"control bound");controls.push({clock,n:truth.length,k,t:alpha[0],trueTop2:top2,upper:g.best,accepted:labels(g.accepted),peak:g.peak});
 }
 return {n,total,floors,original,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const inputs=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(privateGate(JSON.parse(inputs[0]),inputs.slice(1,3),JSON.parse(inputs[3])),null,2));
