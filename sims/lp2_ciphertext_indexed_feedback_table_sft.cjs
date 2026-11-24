'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const chart = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gp = new Map(chart.runes.map((x,i)=>[x,i]));
const digits = s => [...s].filter(c=>gp.has(c)).map(c=>gp.get(c));
const C = chart.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(C.length,12956);
assert.deepEqual(C,digits(read('resources/transcriptions/lp2-image-corrected.txt')).slice(0,12956));
const donors = native.sections.map(s=>({name:s.name,d:digits(s.source_text)}));
const excluded = new Set(['0_koan_1','0_loss_of_divinity']);
const cnt = Array(29).fill(.5), tr = Array.from({length:29},()=>Array(29).fill(.5));
for (const s of donors) if (!excluded.has(s.name)) for(let i=0;i<s.d.length;i++){
  cnt[s.d[i]]++;
  if(i) tr[s.d[i-1]][s.d[i]]++;
}
const norm = r => { const n=r.reduce((a,b)=>a+b); return r.map(x=>x/n); };
const P=norm(cnt), B=tr.map(norm);
const mod=x=>(x+29)%29;
const opts=(c,t)=>c===0?(t?[0,29-t]:[0]):c===t?[]:[mod(c-t)];
/** @param {number[][]} xs */
function domains(xs){
  const d=Array.from({length:29},()=>Array.from({length:29},(_,i)=>i));
  for(const x of xs) for(let i=1;i<x.length;i++) if(x[i]) d[x[i-1]]=d[x[i-1]].filter(t=>t!==x[i]);
  return d;
}
/** @param {number[]} x @param {number[]} k */
function score(x,k){
  let v0=1,v1=0,last0=-1,last1=-1,log=0;
  for(let i=1;i<x.length;i++){
    const c=x[i],t=k[x[i-1]],a=c===0?0:mod(c-t),b=c===0&&t?29-t:-1;
    if(c&&a===0) return -Infinity;
    const p0=last0===-1?P[a]:v0*B[last0][a]+(last1<0?0:v1*B[last1][a]);
    const p1=b<0?0:last0===-1?P[b]:v0*B[last0][b]+(last1<0?0:v1*B[last1][b]);
    const z=p0+p1;
    log+=Math.log(29*z); v0=p0/z; v1=p1/z; last0=a; last1=b;
  }
  return log;
}
/** @param {number[][]} xs */
function unigram(xs){
  const m=Array.from({length:29},()=>Array(29).fill(0));
  for(const x of xs) for(let i=1;i<x.length;i++) m[x[i-1]][x[i]]++;
  const d=domains(xs), k=[], scores=[];
  for(let j=0;j<29;j++){
    const rows=d[j].map(t=>{
      let s=0;
      for(let c=0;c<29;c++) if(m[j][c]) s+=m[j][c]*Math.log(29*opts(c,t).reduce((v,q)=>v+P[q],0));
      return {t,s};
    }).sort((a,b)=>b.s-a.s||a.t-b.t);
    k.push(rows[0].t); scores.push(rows[0].s);
    d[j]=rows.map(r=>r.t);
  }
  return {k,d,score:scores.reduce((a,b)=>a+b,0)};
}
/** @param {number[]} x @param {{k:number[],d:number[][]}} f */
function refine(x,f){
  const k=f.k.slice(); let s=score(x,k), sweeps=0;
  for(;sweeps<12;sweeps++){
    let changed=false;
    for(let j=0;j<29;j++){
      let bt=k[j],bs=s;
      for(const t of f.d[j]){ k[j]=t; const z=score(x,k); if(z>bs+1e-10){bt=t;bs=z;} }
      k[j]=bt; if(bs>s+1e-10)changed=true; s=bs;
    }
    if(!changed){sweeps++;break;}
  }
  return {k,s,sweeps};
}
/** @param {number[]} x @param {number[]} k */
function viterbi(x,k){
  let prev=[{q:-1,s:0}]; const layers=[];
  for(let i=1;i<x.length;i++){
    const o=opts(x[i],k[x[i-1]]);
    if(!o.length)return null;
    const next=o.map(q=>{
      let bs=-Infinity,bj=-1;
      for(let j=0;j<prev.length;j++){
        const z=prev[j],s=z.s+Math.log(z.q<0?P[q]:B[z.q][q]);
        if(s>bs){bs=s;bj=j;}
      }
      return {q,s:bs,j:bj};
    });
    layers.push(next);prev=next;
  }
  let j=prev.reduce((b,z,i)=>z.s>prev[b].s?i:b,0),out=[];
  for(let i=layers.length-1;i>=0;i--){const z=layers[i][j];out.push(z.q);j=z.j;}
  return out.reverse();
}
const illegal=(x,k)=>x.slice(1).filter((c,i)=>c!==0&&c===k[x[i]]).length;
const replay=(x,k,q)=>q.every((p,i)=>(p===0?0:(p+k[x[i]])%29)===x[i+1]);
function enumerate(xs){
  const d=domains(xs),k=Array(29).fill(0);
  let best=-Infinity,second=-Infinity,bestK,visited=0;
  function rec(i){
    if(i===29){
      const z=xs.reduce((v,x)=>v+score(x,k),0);
      visited++;if(z>best){second=best;best=z;bestK=k.slice();}else if(z>second)second=z;
      return;
    }
    for(const t of d[i]){k[i]=t;rec(i+1);}
  }
  rec(0);
  const forced=d.map((r,i)=>r.length===1&&r[0]===0?i:-1).filter(i=>i>=0);
  let n=0,unchanged=0,pad=0,ambiguous=0;
  for(const x of xs)for(let i=1;i<x.length;i++){
    n++;if(forced.includes(x[i-1]))unchanged++;
    pad+=Math.log(29*(x[i]===0?P[0]+(1-P[0])/29:(1-P[0])/29));
    if(x[i]===0&&bestK[x[i-1]])ambiguous++;
  }
  const examples=xs.map(x=>{
    const q=viterbi(x,bestK);
    assert(q&&replay(x,bestK,q));
    return {score:score(x,bestK),preview:q.slice(0,60).map(i=>chart.runes[i]).join('')};
  });
  return {d,visited,best,second,bestK,n,unchanged,pad,ambiguous,forced,examples};
}
const X=C.slice(3603,5506),Y=C.slice(9640,12648),xs=[X,Y];
const a=unigram([X]),b=unigram([Y]),ab=unigram(xs);
const fit=refine(X.slice(0,1000),unigram([X.slice(0,1000)]));
const held={same:illegal(X.slice(999),fit.k),other:illegal(Y,fit.k)};
const joint=enumerate(xs);
const starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapters=starts.slice(0,-1).map((v,i)=>C.slice(v,starts[i+1]));
const whole=enumerate(chapters);
const plants=[];
for(const [ix,s] of donors.filter(s=>excluded.has(s.name)).entries()){
  let seed=[0x3301,0x7135][ix];
  const key=Array.from({length:29},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29;});
  let last=ix+1;
  const ct=s.d.map(p=>last=p===0?0:(p+key[last])%29);
  const cut=Math.floor(ct.length*2/3),prefix=ct.slice(0,cut),test=ct.slice(cut-1);
  const f=unigram([prefix]),r=refine(prefix,f),v=viterbi(test,r.k);
  assert(v&&replay(test,r.k,v));
  plants.push({name:s.name,cut,trainScore:r.s,sweeps:r.sweeps,
    uniExact:f.k.filter((t,i)=>t===key[i]).length,bigramExact:r.k.filter((t,i)=>t===key[i]).length,
    correct:v.filter((q,i)=>q===s.d[cut+i]).length,heldout:ct.length-cut,
    heldoutScore:score(test,r.k),truthScore:score(test,key)});
}
assert.deepEqual(plants.map(p=>[p.bigramExact,p.correct,p.heldout]),[[29,254,260],[29,249,252]]);
assert.deepEqual(held,{same:36,other:95});
assert.equal(joint.visited,6144);assert.equal(joint.unchanged,2916);
assert(Math.abs(joint.best+2267.7352592701363)<1e-6);
assert.equal(whole.visited,2);assert.equal(whole.unchanged,12502);
assert(Math.abs(whole.best+6213.719434793622)<1e-6);
console.log(JSON.stringify({nativeCounts:cnt,plants,unigram:{first:a.score,second:b.score,shared:ab.score},
  fit,held,joint,whole},null,2));
