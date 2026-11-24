'use strict';
/** Exact shared q13 affine plaintext-F-hold feasibility, arbitrary page phases. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const cp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt');
const donor=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const id=new Map(cp.runes.map((x,i)=>[x,i]));
const Q=13,ALL=(1<<29)-1,mod=x=>(x%29+29)%29;
function parseSource(){
  let C=[],w=[],ss=new Set();
  const flush=()=>{if(w.length===1)ss.add(C.length-1);w=[]};
  for(const c of raw){
    if(id.has(c)){w.push(id.get(c));C.push(id.get(c))}
    else if('-.&$§'.includes(c))flush();
  }
  flush();assert.deepEqual(C,cp.pages.flatMap(p=>p.indices));
  const bounds=[0];
  for(const p of cp.pages.filter(p=>p.page<=14))bounds.push(bounds.at(-1)+p.indices.length);
  assert.equal(bounds.at(-1),3603);
  assert.equal([...ss].filter(i=>i<3603).length,24);
  return {C,ss,bounds};
}
/** Compile exact per-phase masks between visible ciphertext zero events. */
function compile(C,ss,a,start,end){
  const runs=[[]],zeros=[];
  for(let i=start;i<end;i++){
    const x=C[i],s=ss.has(i);
    const m=s?(1<<mod(x-a*24))|(1<<mod(x-a*10)):ALL&~(1<<x);
    if(x===0){zeros.push({s,m});runs.push([])}
    else runs.at(-1).push(m);
  }
  const masks=runs.map(r=>Array.from({length:Q},(_,p)=>{
    const m=Array(Q).fill(ALL);r.forEach((x,i)=>m[(p+i)%Q]&=x);return m;
  }));
  return {start,end,runs,zeros,masks,singles:[...ss].filter(i=>i>=start&&i<end).length};
}
/** Each leaf is the exact Cartesian key domain for one latent-F schedule. */
function enumerate(b,D,phases,callback,counter){
  let leaves=0;
  function go(t,p,d){
    counter.nodes++;
    const e=d.map((x,j)=>x&b.masks[t][p][j]);
    if(e.some(x=>!x))return false;
    const phase=(p+b.runs[t].length)%Q;
    if(t===b.zeros.length){leaves++;return callback(e)}
    const z=b.zeros[t];
    if(!z.s&&go(t+1,phase,e))return true;
    const v=e[phase]&z.m;
    if(v){e[phase]=v;if(go(t+1,(phase+1)%Q,e))return true}
    return false;
  }
  for(const p of phases)if(go(0,p,D))break;
  return leaves;
}
const phases=Array.from({length:Q},(_,i)=>i);
function solve(C,ss,bounds,a){
  const counter={nodes:0};let branches=0;
  const regions=bounds.slice(0,-1).map((s,i)=>compile(C,ss,a,s,bounds[i+1]))
    .sort((a,b)=>b.singles-a.singles||a.zeros.length-b.zeros.length);
  assert.equal(regions[0].start,2397); // p10, phase zero WLOG
  function prop(D){
    let change=true,d=D.slice();
    while(change){
      change=false;
      for(const b of regions.slice(1)){
        const union=Array(Q).fill(0);
        const n=enumerate(b,d,phases,e=>{
          for(let j=0;j<Q;j++)union[j]|=e[j];
          return union.every((x,j)=>x===d[j]);
        },counter);
        if(!n)return null;
        if(union.some((x,j)=>x!==d[j])){d=union;change=true}
      }
    }
    return d;
  }
  function dfs(D){
    branches++;
    const d=prop(D);if(!d)return null;
    let j=-1,min=30;
    for(let i=0;i<Q;i++){
      let k=0;for(let z=d[i];z;z&=z-1)k++;
      if(k>1&&k<min){min=k;j=i}
    }
    if(j<0)return d.map(x=>31-Math.clz32(x));
    for(let z=d[j];z;z&=z-1){
      const next=d.slice();next[j]=z&-z;
      const f=dfs(next);if(f)return f;
    }
    return null;
  }
  let key=null;
  const anchorPaths=enumerate(regions[0],Array(Q).fill(ALL),[0],e=>{
    key=dfs(e);return Boolean(key);
  },counter);
  return {a,key,nodes:counter.nodes,branches,anchorPaths};
}
function controls(){
  const out=[];
  for(const section of donor.sections.filter(s=>['0_welcome','0_koan_1'].includes(s.name))){
    const words=[...section.source_text.matchAll(/[ᚠ-᛿]+/gu)].map(m=>[...m[0]].map(c=>id.get(c)));
    const ss=new Set();let i=0;
    for(const w of words){if(w.length===1){assert([24,10].includes(w[0]));ss.add(i)}i+=w.length}
    const P=words.flat(),bounds=[0,Math.floor(P.length/3),Math.floor(2*P.length/3),P.length];
    let tests=0;
    for(let a=1;a<=28;a++)for(const mode of ['fixed-page','continuous']){
      const C=[],incoming=[];let phase=0;
      const K=Array.from({length:Q},(_,i)=>mod(a*17+i*7+i*i*3+section.name.length));
      for(let j=0;j<3;j++){
        if(mode==='fixed-page')phase=0;
        incoming.push(phase);
        for(const p of P.slice(bounds[j],bounds[j+1])){
          C.push(p===0?0:mod(a*p+K[phase]));
          if(p!==0)phase=(phase+1)%Q;
        }
      }
      const D=K.map(k=>1<<k);
      for(let j=0;j<3;j++){
        const b=compile(C,ss,a,bounds[j],bounds[j+1]);
        assert(enumerate(b,D,[incoming[j]],()=>true,{nodes:0})>0,'planted key excluded');
      }
      tests++;
    }
    out.push({name:section.name,runes:P.length,singletons:ss.size,tests});
  }
  assert.equal(out.reduce((s,x)=>s+x.tests,0),112);
  return out;
}
const {C,ss,bounds}=parseSource();
const out=Array.from({length:28},(_,i)=>solve(C,ss,bounds,i+1));
const expectedNodes=[8908,10629,10790,18012,840,19392,21130,5169,15282,27228,150981,3010,3727,4496,17567,54109,21140,29288,12150,19921,21421,7631,6509,9061,11211,16126,35817,4115];
const expectedPaths=[28,35,50,59,3,52,82,31,31,37,77,16,23,35,62,53,12,52,20,36,88,65,33,47,64,79,32,8];
assert.deepEqual(out.map(x=>x.nodes),expectedNodes);
assert.deepEqual(out.map(x=>x.anchorPaths),expectedPaths);
assert(out.every(x=>x.key===null&&x.branches===x.anchorPaths));
console.log(JSON.stringify({original:{runes:3603,singletons:24,slopesSurviving:0,totalNodes:565660,totalAnchorPaths:1210,perSlope:out},controls:controls()},null,2));
