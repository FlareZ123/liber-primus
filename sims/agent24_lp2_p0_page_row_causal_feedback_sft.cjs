#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function main(corpus,native){
  const Q=29,mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
  const inv=Array.from({length:Q},(_,i)=>Array.from({length:Q},(_,j)=>j).find(j=>mod(i*j)===1));
  const pages=corpus.pages.map(p=>p.indices),opening=pages.slice(0,3).flat();
  check(opening.length===729&&opening[13]===2,"partition");
  const rows=[null,...Array.from({length:55},(_,i)=>opening.slice(14+13*i,27+13*i))];
  const sums=rows.map(r=>r&&mod(r.reduce((a,b)=>a+b,0)));
  check(sums.map((s,i)=>s===0?i:null).filter(x=>x!==null).join(",")==="50","zero row");
  const original=pages.slice(3,56).map((c,i)=>({page:i+3,c})).filter(d=>d.c.length>13);
  const sections=native.sections.map(s=>({name:s.name,x:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
  const allConfigs=[];for(const reverse of [false,true])for(const normalized of [false,true])for(const scaled of [false,true])for(let lambda=0;lambda<Q;lambda++)allConfigs.push({reverse,normalized,scaled,lambda});
  function coefficients(page,k){return (k.reverse?rows[page].slice().reverse():rows[page]).map(v=>mod(v*k.lambda*(k.normalized?inv[sums[page]]:1)))}
  function residual(v,state,coef,a){let b=0;for(let j=0;j<13;j++)b+=coef[j]*state[12-j];return mod((v-b)*inv[a]);}
  function shift(state,v){return state.slice(1).concat(v)}
  function countTop2(counts){return counts.slice().sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0)}
  function ordinary(ds,k){let counts=Array(Q).fill(0),privateTop2=0,n=0;for(const {page,c} of ds){const coef=coefficients(page,k),a=k.scaled?sums[page]:1,local=Array(Q).fill(0);for(let i=13;i<c.length;i++){const v=residual(c[i],c.slice(i-13,i),coef,a);local[v]++;counts[v]++;n++;}privateTop2+=countTop2(local);}return {n,top2:countTop2(counts),privateTop2,counts}}
  // In physical-clock mode every emission updates the public register.
  // In consuming-clock mode a literal F leaves it unchanged, while an ordinary
  // ciphertext zero enters it. t=S(F) is unknown, all other labels are available.
  function feasible(d,k,t,clock){const {page,c}=d,coef=coefficients(page,k),a=k.scaled?sums[page]:1;let states=[c.slice(0,13)],peak=1;
    for(let i=13;i<c.length;i++){const v=c[i],next=new Map();for(const s of states){if(v===0){const z=clock==="physical"?shift(s,v):s;next.set(z.join(","),z)}if(residual(v,s,coef,a)!==t){const z=shift(s,v);next.set(z.join(","),z)}}if(!next.size)return {ok:false,offset:i,peak};states=[...next.values()];peak=Math.max(peak,states.length);}
    return {ok:true,offset:c.length,peak};}
  function exact(ds){const result={physical:[],consuming:[]},counts={physical:0,consuming:0},peak={physical:0,consuming:0},failure={physical:{},consuming:{}};
    for(const clock of Object.keys(result))for(const k of allConfigs)for(let t=0;t<Q;t++){let failed=null;for(const d of ds){const s=feasible(d,k,t,clock);peak[clock]=Math.max(peak[clock],s.peak);if(!s.ok){failed={page:d.page,offset:s.offset};break}}if(failed){counts[clock]++;const key=failed.page+":"+failed.offset;failure[clock][key]=(failure[clock][key]||0)+1;}else result[clock].push({...k,t});}
    return {result,counts,peak,failure};}
  const ranked=allConfigs.map(k=>({...k,...ordinary(original,k)})).sort((a,b)=>b.top2-a.top2);
  const gate=exact(original);
  let seed=3301;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
  function perm(){const x=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){const j=rand(i+1);[x[i],x[j]]=[x[j],x[i]]}return x}
  function encrypt(d,k,alphabet,clock){const coef=coefficients(d.page,k),a=k.scaled?sums[d.page]:1,c=Array.from({length:13},()=>rand(Q));let state=c.slice();for(const p of d.truth){let b=0;for(let j=0;j<13;j++)b+=coef[j]*state[12-j];let v=p===0?0:mod(a*alphabet[p]+b);c.push(v);if(p!==0||clock==="physical")state=shift(state,v);}return {...d,c}}
  const controls=[];
  for(const clock of ["physical","consuming"]){const held=sections.filter(s=>["0_warning","jpg107-167","p56_an_end","p57_parable"].includes(s.name));
    const k={reverse:clock==="consuming",normalized:clock==="physical",scaled:clock==="consuming",lambda:clock==="physical"?7:11},alphabet=perm();
    const ds=held.map((s,i)=>encrypt({page:[3,7,54,55][i],truth:s.x},k,alphabet,clock));
    for(const d of ds)check(feasible(d,k,alphabet[0],clock).ok,"plant true path");
    const g=exact(ds),hits=g.result[clock].filter(x=>x.reverse===k.reverse&&x.normalized===k.normalized&&x.scaled===k.scaled&&x.lambda===k.lambda&&x.t===alphabet[0]);
    check(hits.length===1,"planted configuration lost");
    controls.push({clock,k,t:alphabet[0],n:ds.reduce((a,d)=>a+d.truth.length,0),trueSurvives:hits.length===1,allSurvivors:g.result[clock],otherClockSurvivors:g.result[clock==="physical"?"consuming":"physical"].length,peak:g.peak});
  }
  const nativeStats=sections.map(({name,x})=>{const counts=Array(Q).fill(0);for(const v of x)counts[v]++;return {name,n:x.length,top2:countTop2(counts),fraction:countTop2(counts)/x.length}});
  return {partition:{total:opening.length,zeroRow:50,rows:55},configCount:allConfigs.length,original:{pages:original.length,n:ranked[0].n,top2Best:ranked[0],privateTop2Best:ranked.slice().sort((a,b)=>b.privateTop2-a.privateTop2)[0],ordinary:ranked.map(({counts,...r})=>r),gate},nativeStats,controls};
}
console.log(JSON.stringify(main(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
