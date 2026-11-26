#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function extend(src,donors,prior){
 const Q=29,ALL=(1<<29)-1,mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)},inv=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>j).find(j=>mod(i*j)===1));
 const pages=src.pages.map(x=>x.indices),op=pages.slice(0,3).flat(),rows=[null,...Array.from({length:55},(_,i)=>op.slice(14+13*i,27+13*i))],sums=rows.map(r=>r&&mod(r.reduce((a,b)=>a+b,0)));
 check(op.length===729&&op[13]===2&&sums[50]===0,"partition");
 const keyOf=a=>String.fromCharCode(...a),bit=x=>1<<x,labs=m=>{const a=[];while(m){const z=m&-m;a.push(31-Math.clz32(z));m^=z}return a},shift=(s,v)=>s.slice(1)+String.fromCharCode(v);
 const cs=[];for(const reverse of [false,true])for(const normalized of [false,true])for(const scaled of [false,true])for(let lambda=0;lambda<Q;lambda++)cs.push({reverse,normalized,scaled,lambda});
 function add(map,s,m){if(m)map.set(s,(map.get(s)||0)|m)}
 function coeff(p,k){return (k.reverse?rows[p].slice().reverse():rows[p]).map(v=>mod(v*k.lambda*(k.normalized?inv[sums[p]]:1)))}
 function res(v,s,co,a){let b=0;for(let j=0;j<13;j++)b+=co[j]*s.charCodeAt(12-j);return mod((v-b)*inv[a])}
 function anchor(c){let n=0;for(let i=0;i<c.length;i++){n=c[i]===0?0:n+1;if(n===13)return i-12;}return -1}
 function support(c,co,a){
  const layers=[new Map([[keyOf(c.slice(0,13)),ALL]])];
  for(let i=13;i<c.length;i++){const v=c[i],next=new Map();for(const [s,m] of layers.at(-1)){const ns=shift(s,v),rr=res(v,s,co,a);add(next,ns,m&~bit(rr));if(v===0)add(next,s,m)}if(!next.size)return null;layers.push(next);}
  let accepted=0;for(const m of layers.at(-1).values())accepted|=m;let future=layers.at(-1);
  const caps=Array.from({length:Q},()=>({h:new Int32Array(Q),o:new Int32Array(Q*Q)}));
  for(let i=c.length-1;i>=13;i--){const v=c[i],prev=new Map(),out=new Int32Array(Q);for(const [s,m] of layers[i-13]){const ns=shift(s,v),rr=res(v,s,co,a),ordinary=m&~bit(rr)&(future.get(ns)||0);if(ordinary){add(prev,s,ordinary);for(const t of labs(ordinary))out[t]|=bit(rr)}if(v===0){const fm=m&(future.get(s)||0);if(fm){add(prev,s,fm);for(const t of labs(fm))out[t]|=bit(t)}}}
   for(const t of labs(accepted)){const L=labs(out[t]);check(L.length,"viable label");const {h,o}=caps[t];for(let j=0;j<L.length;j++){h[L[j]]++;for(let k=j+1;k<L.length;k++)o[L[j]*Q+L[k]]++;}}future=prev;
  }
  let best=-1,bt=-1,bp=null;for(const t of labs(accepted)){const {h,o}=caps[t];for(let u=0;u<Q;u++)for(let v=u+1;v<Q;v++){const n=h[u]+h[v]-o[u*Q+v];if(n>best){best=n;bt=t;bp=[u,v]}}}return {best,t:bt,pair:bp,accepted:labs(accepted)};
 }
 const items=[],changed=[];let cursor=0;
 for(const d of prior.original){const p=d.page,c=pages[p],at=anchor(c);check(at>=0&&c.slice(at,at+13).every(x=>x!==0),"washout");
  let best=d.consuming;if(at){best={best:-1};for(const k of cs){const z=support(c.slice(at),coeff(p,k),k.scaled?sums[p]:1);if(z&&z.best>best.best)best={...z,k};}changed.push({page:p,anchor:at,old:d.consuming.best,new:best.best,k:best.k,t:best.t,pair:best.pair});}
  items.push({page:p,start:cursor,end:cursor+c.length,physicalStart:cursor+13,consumingStart:cursor+at+13,ordinary:d.ordinary.best,physical:d.physical.best,consuming:best.best});cursor+=c.length;
 }
 const tok=src.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function encode(s){return [...s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)].flatMap(m=>{const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const t=tok.find(t=>w.startsWith(t.t,i));if(t){a.push(t.i);i+=t.t.length}else i++}return a})}
 function floor(x,clock){const h=new Int32Array(Q);for(const v of x)h[v]++;const pair=Array.from({length:Q},(_,i)=>i).sort((a,b)=>h[b]-h[a]).slice(0,2),P=new Int32Array(x.length+1);for(let i=0;i<x.length;i++)P[i+1]=P[i]+Number(pair.includes(x[i]));let min=Infinity,pos=-1;const spans=items.map(d=>[clock==="consuming"?d.consumingStart:d.physicalStart,d.end]);
  for(let j=0;j+cursor<=x.length;j++){let n=0;for(const [a,b] of spans)n+=P[j+b]-P[j+a];if(n<min){min=n;pos=j}}return {pair,pairNames:pair.map(i=>src.translit[i]),min,pos,windows:x.length-cursor+1};
 }
 const caps={},retained={};for(const clock of ["ordinary","physical","consuming"]){caps[clock]=items.reduce((s,d)=>s+d[clock],0);retained[clock]=items.reduce((s,d)=>s+d.end-(clock==="consuming"?d.consumingStart:d.physicalStart),0);}
 const floors=donors.map(t=>{const x=encode(t);return {length:x.length,physical:floor(x,"physical"),consuming:floor(x,"consuming")};});
 return {fullSpan:cursor,caps,retained,floors,changed,items};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-p0-page-row-causal-private-output.json"];
const a=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(extend(JSON.parse(a[0]),a.slice(1,3),JSON.parse(a[3])),null,2));
