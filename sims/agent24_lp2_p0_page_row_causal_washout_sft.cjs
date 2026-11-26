#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function washout(src,native){
 const Q=29, ALL=(1<<29)-1, mod=x=>(x%Q+Q)%Q,check=(x,m)=>{if(!x)throw Error(m)};
 const inv=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>j).find(j=>mod(i*j)===1));
 const pages=src.pages.map(x=>x.indices), opening=pages.slice(0,3).flat(),rows=[null,...Array.from({length:55},(_,i)=>opening.slice(14+13*i,27+13*i))],sums=rows.map(x=>x&&mod(x.reduce((a,b)=>a+b,0)));
 check(opening.length===729&&opening[13]===2&&sums[50]===0,"source partition");
 const configs=[];for(const reverse of [false,true])for(const normalized of [false,true])for(const scaled of [false,true])for(let lambda=0;lambda<Q;lambda++)configs.push({reverse,normalized,scaled,lambda});
 const keyOf=a=>String.fromCharCode(...a), bit=x=>1<<x, labs=m=>{const a=[];while(m){const z=m&-m;a.push(31-Math.clz32(z));m^=z}return a};
 function co(p,k){return (k.reverse?rows[p].slice().reverse():rows[p]).map(v=>mod(v*k.lambda*(k.normalized?inv[sums[p]]:1)))}
 function shift(s,v){return s.slice(1)+String.fromCharCode(v)}
 function feedback(s,c){let b=0;for(let j=0;j<13;j++)b+=c[j]*s.charCodeAt(12-j);return b}
 function residual(v,s,c,a){return mod((v-feedback(s,c))*inv[a])}
 function add(map,s,m){if(m)map.set(s,(map.get(s)||0)|m)}
 function anchor(c,clock){if(clock==="physical")return c.length>=13?0:-1;let n=0;for(let i=0;i<c.length;i++){n=c[i]===0?0:n+1;if(n===13)return i-12;}return -1}
 function support(d,k,clock){
   const i0=anchor(d.c,clock);if(i0<0)return {mask:ALL,peak:0,anchor:-1,counts:0};const a=k.scaled?sums[d.page]:1,c=co(d.page,k),x=d.c;
   let states=new Map([[keyOf(x.slice(i0,i0+13)),ALL]]),peak=1;const deaths=Array(Q).fill(null);
   for(let i=i0+13;i<x.length;i++){const v=x[i],next=new Map();let before=0,after=0;for(const [s,m] of states){before|=m;const ns=shift(s,v),rr=residual(v,s,c,a);add(next,ns,m&~bit(rr));if(v===0)add(next,clock==="physical"?ns:s,m);}
    for(const m of next.values())after|=m;for(const t of labs(before&~after))deaths[t]=i;
    if(!next.size)return {mask:0,peak,anchor:i0,deaths};states=next;peak=Math.max(peak,states.size);
   }let mask=0;for(const m of states.values())mask|=m;return {mask,peak,anchor:i0,deaths};
 }
 const original=pages.slice(3,56).map((c,i)=>({page:i+3,c})).filter(d=>d.c.length>13);
 function exact(ds,clock){
  const survivors=[],firstFailure={},certificates=[];let maxStates=0;
  for(const k of configs){let mask=ALL;for(const d of ds){const z=support(d,k,clock);maxStates=Math.max(maxStates,z.peak);const dead=mask&~z.mask;for(const t of labs(dead)){firstFailure[d.page]=(firstFailure[d.page]||0)+1;certificates.push({k,t,page:d.page,anchor:z.anchor,offset:z.deaths[t]});}mask&=z.mask;if(!mask)break;}
   for(const t of labs(mask))survivors.push({...k,t});
  }return {survivors,firstFailure,maxStates,certificates};
 }
 const result={};for(const clock of ["physical","consuming"]){result[clock]={anchors:original.map(d=>({page:d.page,anchor:anchor(d.c,clock),n:d.c.length})),...exact(original,clock)};}
 let seed=151;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 const controls=[];
 for(const clock of ["physical","consuming"]){const k={reverse:clock==="physical",normalized:true,scaled:clock==="consuming",lambda:19},alpha=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){const j=rnd(i+1);[alpha[i],alpha[j]]=[alpha[j],alpha[i]]}
  const ds=[];for(const [i,name] of ["0_warning","0_welcome","0_koan_1","0_loss_of_divinity"].entries()){const page=[3,4,23,54][i],p=native.sections.find(s=>s.name===name),truth=[...p.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0),a=k.scaled?sums[page]:1,c=co(page,k);
   let s=keyOf(Array.from({length:13},()=>rnd(Q)));const out=[];for(const v of truth){const z=v===0?0:mod(a*alpha[v]+feedback(s,c));out.push(z);if(v!==0||clock==="physical")s=shift(s,z);}
   const d={page,c:out};check(anchor(out,clock)>=0,"missing control anchor");const u=support(d,k,clock);check(u.mask&bit(alpha[0]),"true hidden-IV plant rejected");ds.push(d);
  }
  const z=exact(ds,clock);check(z.survivors.some(x=>x.reverse===k.reverse&&x.normalized===k.normalized&&x.scaled===k.scaled&&x.lambda===k.lambda&&x.t===alpha[0]),"true pair absent");
  controls.push({clock,k,t:alpha[0],n:ds.reduce((s,d)=>s+d.c.length,0),anchors:ds.map(d=>({page:d.page,offset:anchor(d.c,clock)})),survivors:z.survivors});
 }
 return {result,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(washout(...paths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')))),null,2));
