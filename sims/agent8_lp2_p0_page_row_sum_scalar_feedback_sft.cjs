#!/usr/bin/env node
"use strict";
const fs=require('node:fs');
function main(corpus,native){
  const q=29, mod=x=>(x%q+q)%q, inv=Array.from({length:q},(_,x)=>Array.from({length:q},(_,i)=>i).find(i=>mod(i*x)===1)), check=(v,m)=>{if(!v)throw Error(m)};
  const pages=corpus.pages.map(p=>p.indices), opening=pages.slice(0,3).flat();
  check(opening.length===729&&opening[13]===2,"partition");
  const sums=[null,...Array.from({length:55},(_,i)=>mod(opening.slice(14+13*i,27+13*i).reduce((a,b)=>a+b,0)))];
  check(sums.map((s,i)=>s===0?i:null).filter(x=>x!==null).join(",")==="50","zero row");
  const sections=native.sections.map(s=>({name:s.name,x:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
  const heldNames=["0_warning","jpg107-167","p56_an_end","p57_parable"];
  const train=sections.filter(s=>!heldNames.includes(s.name)), ctrl=sections.filter(s=>heldNames.includes(s.name));
  check(ctrl.length===4,"section names");
  const u=Array(q).fill(.5), B=Array.from({length:q},()=>Array(q).fill(.5));
  for(const {x} of train){for(const a of x)u[a]++;for(let i=1;i<x.length;i++)B[x[i-1]][x[i]]++;}
  const logs=a=>{const s=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(q*x/s));}, lu=logs(u), lb=B.map(logs);
  const top2=a=>a.slice().sort((x,y)=>y-x).slice(0,2).reduce((x,y)=>x+y,0);
  function residual(d,k){return d.c.slice(1).map((v,i)=>mod((v-k*d.c[i])*inv[sums[d.page]]));}
  function stats(ds,k){
    const counts=Array(q).fill(0),start=Array(q).fill(0),pairs=new Int32Array(q*q);
    let n=0,localTop2=0;
    for(const d of ds){const x=residual(d,k),a=Array(q).fill(0);if(!x.length)continue;start[x[0]]++;n+=x.length;for(const v of x){counts[v]++;a[v]++;}for(let i=1;i<x.length;i++)pairs[x[i-1]*q+x[i]]++;localTop2+=top2(a);}
    return {n,counts,start,pairs,top2:top2(counts),localTop2};
  }
  const keys=[];for(let g=1;g<q;g++)for(let b=0;b<q;b++){const m=Array.from({length:q},(_,v)=>mod((v-b)*inv[g]));keys.push({g,b,m});}
  function rank(ds){
    let best=null, maxTop2=0,maxLocalTop2=0,all=[];
    for(let k=0;k<q;k++){
      const st=stats(ds,k),nz=Array.from(st.pairs.entries()).filter(([,v])=>v!==0);maxTop2=Math.max(maxTop2,st.top2);maxLocalTop2=Math.max(maxLocalTop2,st.localTop2);
      let local=null;
      for(const {g,b,m} of keys){let score=0;for(let i=0;i<q;i++)score+=st.start[i]*lu[m[i]];for(const [i,v] of nz)score+=v*lb[m[Math.floor(i/q)]][m[i%q]];
        if(local===null||score>local.score)local={k,g,b,score};
      }
      all.push({k,top2:st.top2,localTop2:st.localTop2,best:local});if(best===null||local.score>best.score)best=local;
    }
    return {best,maxTop2,maxLocalTop2,n:ds.reduce((a,d)=>a+d.c.length-1,0),all};
  }
  function decode(d,key){return residual(d,key.k).map(v=>mod((v-key.b)*inv[key.g]));}
  function evaluate(ds){
    const fit=ds.filter(d=>d.fit),held=ds.filter(d=>!d.fit),a=rank(fit),z=rank(ds),key=a.best;let n=0,score=0,replay=0,correct=0,known=0;const previews=[];
    for(const d of held){const p=decode(d,key);n+=p.length;score+=lu[p[0]];for(let i=1;i<p.length;i++)score+=lb[p[i-1]][p[i]];let last=d.c[0];for(let i=0;i<p.length;i++){last=mod(sums[d.page]*(key.g*p[i]+key.b)+key.k*last);check(last===d.c[i+1],"replay");replay++;}if(d.truth){known+=p.length;correct+=p.filter((v,i)=>v===d.truth[i+1]).length;}previews.push({page:d.page,prefix:p.slice(0,64).map(v=>corpus.translit[v]).join(" ")});}
    const h=stats(held,key.k);return {fit:a,full:z,held:{n,score,scorePerRune:score/n,replay,correct:known?correct:null,known,top2:h.top2,localTop2:h.localTop2,previews}};
  }
  const original=pages.slice(3,56).map((c,i)=>({page:i+3,fit:i+3<=39,c})).filter(d=>d.c.length>1);
  function plant(key,shift){const data=[];let f=3,h=40;for(let j=0;j<ctrl.length;j++){const x=ctrl[(j+shift)%ctrl.length].x,cut=Math.floor(x.length/2);for(const [truth,fit] of [[x.slice(0,cut),true],[x.slice(cut),false]])for(let i=0;i<truth.length;i+=64){const p=truth.slice(i,i+64);if(p.length<2)continue;let page=fit?f++:h++;if(page===50)page=h++;check(page<=55,"plant page");let last=mod(page*7+shift),c=[];for(const v of p){last=mod(sums[page]*(key.g*v+key.b)+key.k*last);c.push(last);}data.push({page,fit,c,truth:p});}}
    return {truth:key,result:evaluate(data)};
  }
  const plants=[plant({k:1,g:7,b:13},0),plant({k:22,g:19,b:3},1),plant({k:0,g:11,b:26},2)];
  const o=evaluate(original);
  const nativeStats=sections.map(({name,x})=>{const counts=Array(q).fill(0);for(const v of x)counts[v]++;return {name,n:x.length,top2:top2(counts),fraction:top2(counts)/x.length}});
  return {source:{sums,opening:opening.length,originalFitPages:original.filter(d=>d.fit).map(d=>d.page),originalHeldPages:original.filter(d=>!d.fit).map(d=>d.page)},model:{train:train.map(x=>x.name),ctrl:ctrl.map(x=>x.name),alpha:.5},nativeStats,plants,original:o};
}
console.log(JSON.stringify(main(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
