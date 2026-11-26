#!/usr/bin/env node
"use strict";
/** Source-selected chained circulant inverses; see consolidated report. */
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function main(corpus,native,donors){
  const Q=29,D=13,mod=x=>(x%Q+Q)%Q,assert=(v,m)=>{if(!v)throw Error(m)};
  const pages=corpus.pages.map(p=>p.indices),opening=pages.slice(0,3).flat();
  assert(opening.length===729&&opening[13]===2,"opening");
  const keys=Array.from({length:55},(_,i)=>opening.slice(14+D*i,14+D*(i+1)));
  const pageIds=Array.from({length:53},(_,i)=>i+3).filter(i=>pages[i].length);
  const fit=p=>p<=39;
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  function inverse(m){let a=m.map((r,i)=>r.concat(Array.from({length:D},(_,j)=>+(i===j))));for(let i=0;i<D;i++){const j=a.findIndex((r,k)=>k>=i&&r[i]);assert(j>=0,"singular");[a[i],a[j]]=[a[j],a[i]];const x=Array.from({length:Q},(_,k)=>k).find(k=>mod(k*a[i][i])===1);a[i]=a[i].map(v=>mod(v*x));for(let j=0;j<D;j++)if(j!==i){const f=a[j][i];a[j]=a[j].map((v,k)=>mod(v-f*a[i][k]));}}return a.map(r=>r.slice(D));}
  const mats={};for(const sign of [-1,1])mats[sign]=Object.fromEntries(pageIds.map(p=>{const k=keys[p-1],m=Array.from({length:D},(_,i)=>Array.from({length:D},(_,j)=>k[(j+sign*i+D)%D]));return [p,{m,inv:inverse(m)}];}));
  const mul=(m,x)=>m.map(r=>mod(r.reduce((s,v,j)=>s+v*x[j],0)));
  const names=native.sections.map(s=>s.name);
  const counts=Array(Q).fill(.5),bi=Array.from({length:Q},()=>Array(Q).fill(.5));
  for(const s of native.sections){const x=[...s.source_text].map(c=>native.runes.indexOf(c)).filter(v=>v>=0);for(const v of x)counts[v]++;for(let i=1;i<x.length;i++)bi[x[i-1]][x[i]]++;}
  const logp=a=>{const n=a.reduce((s,x)=>s+x,0);return a.map(x=>Math.log(x/n*Q));},u=logp(counts),b=bi.map(logp);
  const hnew=()=>Array.from({length:D},()=>new Int32Array(Q));
  function coll(h){let e=0,n=0,k=0;for(const row of h){let t=0;for(const c of row){e+=c*(c-1);t+=c;}n+=t*(t-1);k+=t;}return {rate:e/n,e,n,k};}
  function mapOffsets(h){let score=0;const key=h.map(row=>{let m=-Infinity,k=0;for(let z=0;z<Q;z++){let v=0;for(let c=0;c<Q;c++)v+=row[c]*u[mod(c-z)];if(v>m){m=v;k=z;}}score+=m;return k;});return {key,score};}
  function prep(book,phase,sign,mode){const out=[];for(const p of pageIds){const x=book[p],{m,inv}=mats[sign][p];for(let i=phase+D;i+D<=x.length;i+=D){const c=x.slice(i,i+D),prev=x.slice(i-D,i);out.push({p,i,a:mode==="CBC"?mul(inv,c):c,z:mode==="CBC"?prev:mul(m,prev)});}}return out;}
  function stats(rows,lambda){const train=hnew(),test=hnew();for(const row of rows){const h=fit(row.p)?train:test;for(let j=0;j<D;j++)h[j][mod(row.a[j]-lambda*row.z[j])]++;}const full=train.map((r,j)=>r.map((v,k)=>v+test[j][k]));return {train,test,full};}
  function scan(book){let best=null,max={fit:null,held:null,full:null};const byMode={};for(let phase=0;phase<D;phase++)for(const sign of [-1,1])for(const mode of ["CBC","CFB"]){const rows=prep(book,phase,sign,mode);for(let lambda=1;lambda<Q;lambda++){const {train,test,full}=stats(rows,lambda),m=mapOffsets(train),f=coll(train),h=coll(test),all=coll(full),v={phase,sign,mode,lambda,key:m.key,fitUnigram:m.score/f.k,fitColl:f,heldColl:h,fullColl:all};if(!best||v.fitUnigram>best.fitUnigram)best=v;if(!byMode[mode]||v.fitUnigram>byMode[mode].fitUnigram)byMode[mode]=v;for(const [k,val] of [["fit",f],["held",h],["full",all]])if(!max[k]||val.rate>max[k].rate)max[k]={...val,phase,sign,mode,lambda};}}
    const v=best,rows=prep(book,v.phase,v.sign,v.mode),plain={};let replay=0,fitScore=0,heldScore=0,nFit=0,nHeld=0;
    for(const row of rows){const {p,i,a,z}=row,{m}=mats[v.sign][p],d=a.map((c,j)=>mod(c-v.lambda*z[j])),pt=d.map((c,j)=>mod(c-v.key[j]));const mixed=pt.map((c,j)=>mod(c+v.key[j]+v.lambda*z[j])),c=v.mode==="CBC"?mul(m,mixed):mixed;assert(eq(c,book[p].slice(i,i+D)),"original replay");replay+=D;(plain[p]??=[]).push(...pt);}
    for(const p of pageIds){const x=plain[p]||[];if(!x.length)continue;let s=u[x[0]];for(let j=1;j<x.length;j++)s+=b[x[j-1]][x[j]];if(fit(p)){fitScore+=s;nFit+=x.length;}else{heldScore+=s;nHeld+=x.length;}}
    return {best,byMode,max,replay,fitBigram:fitScore/nFit,heldBigram:heldScore/nHeld,plain,heldPrefix:Object.fromEntries(pageIds.filter(p=>!fit(p)).map(p=>[p,(plain[p]||[]).slice(0,80).map(x=>corpus.translit[x]).join("")]))};
  }
  const gp=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
  function encode(text){const out=[];for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){const t=gp.find(x=>word.startsWith(x.token,i));assert(t,"token");out.push(t.i);i+=t.token.length;}}return out;}
  const encoded=donors.map(encode),total=pageIds.reduce((s,p)=>s+pages[p].length,0);
  function split(x,start){const book={};for(const p of pageIds){book[p]=x.slice(start,start+pages[p].length);start+=pages[p].length;}return book;}
  function refColl(book,phase){const train=hnew(),test=hnew();for(const p of pageIds){const x=book[p],h=fit(p)?train:test;for(let i=phase+D;i+D<=x.length;i+=D)for(let j=0;j<D;j++)h[j][x[i+j]]++;}const full=train.map((r,j)=>r.map((v,k)=>v+test[j][k]));return {fit:coll(train).rate,held:coll(test).rate,full:coll(full).rate};}
  const references=encoded.map((x,k)=>{let minima={fit:1,held:1,full:1},windows=0;for(let start=0;start+total<=x.length;start+=6400){const book=split(x,start);windows++;for(let phase=0;phase<D;phase++){const c=refColl(book,phase);for(const v of Object.keys(minima))minima[v]=Math.min(minima[v],c[v]);}}return {name:k?"Shakespeare":"Gibran",runes:x.length,windows,phases:D,minima};});
  let seed=0x13330126;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
  function plant(truth,phase,sign,mode,lambda){const key=Array.from({length:D},()=>rand()%Q),book={};for(const p of pageIds){const x=truth[p],y=x.map(()=>rand()%Q),{m}=mats[sign][p];for(let i=phase+D;i+D<=x.length;i+=D){const prev=y.slice(i-D,i),z=mode==="CBC"?prev:mul(m,prev),mixed=x.slice(i,i+D).map((c,j)=>mod(c+key[j]+lambda*z[j])),c=mode==="CBC"?mul(m,mixed):mixed;y.splice(i,D,...c);}book[p]=y;}
    const a=scan(book),v=a.best;let correct=0,n=0;for(const p of pageIds){const y=a.plain[p]||[],t=truth[p].slice(phase+D,phase+D+y.length);if(!fit(p)){n+=y.length;correct+=y.filter((c,j)=>c===t[j]).length;}}
    const {plain,...rest}=a;return {truth:{phase,sign,mode,lambda,key},recovered:v.phase===phase&&v.sign===sign&&v.mode===mode&&v.lambda===lambda,keyExact:eq(v.key,key),heldCorrect:correct,heldTotal:n,scan:rest};
  }
  const controls=[plant(split(encoded[0],3200),4,-1,"CBC",17),plant(split(encoded[1],9600),9,1,"CFB",7)];
  const original=scan(pages),{plain,...result}=original;
  assert(controls.every(x=>x.recovered&&x.keyExact&&x.heldCorrect===x.heldTotal),"hidden control");
  assert(references.every(x=>Object.keys(x.minima).every(k=>x.minima[k]>result.max[k].rate)),"all-key separation");
  return {schema:1,source:{total,opening:opening.length,keys:keys.length,p50Row:keys[49],p50Sum:mod(keys[49].reduce((s,x)=>s+x,0)),pages:pageIds.length},hypotheses:13*2*2*28,modelSections:names,references,controls,original:result};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(main(JSON.parse(read(paths[0])),JSON.parse(read(paths[1])),paths.slice(2).map(read)),null,2));
