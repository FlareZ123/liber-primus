'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function witness(corpus,assert){
  const c=corpus.pages.slice(0,56).flatMap(p=>p.indices),N=c.length,q=29,m=14,B=1024;
  assert(N===12956&&c.slice(1).filter((v,i)=>v===c[i]).length===86,"original source");
  const id=Array.from({length:q},(_,i)=>i),sym=v=>String.fromCharCode(65+v);
  const rot=(a,k)=>a.slice(k).concat(a.slice(0,k));
  /** @param {number[]} L @param {number[]} R @param {number} j */
  function advance(L,R,j){L=rot(L,j);R=rot(R,j);L.splice(m,0,L.splice(1,1)[0]);R=rot(R,1);R.splice(m,0,R.splice(2,1)[0]);return {L,R};}
  // Public identical canonical wheels; fixed greedy right-preferred encoder.
  let seed=3301;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  let beam=[{L:id,R:id,p:""}],minAtRepeat=B,repeatSteps=0,ambiguousSites=0,pruned=0,firstDead=null,repeatSizes=[];
  for(let i=0;i<N;i++){
    let a=[],seen=0;const v=c[i],prev=c[i-1],repeat=v===prev;
    function put(s,j,p){
      seen++;let dest;
      if(a.length<B)dest=a.length;
      else {dest=Math.floor(rng()*seen);pruned++;if(dest>=B)return;}
      a[dest]={...advance(s.L,s.R,j),p:s.p+sym(p)};
    }
    for(const s of beam){
      const {L,R}=s,j=L.indexOf(v),p=R[j];
      if(!repeat||R[L.indexOf(p)]===prev)put(s,j,p);
      if(i&&!repeat){
        const p0=R[L.indexOf(prev)],k=L.indexOf(p0);
        if(R[k]===v){ambiguousSites++;put(s,k,p0);}
      }
    }
    beam=a;
    if(repeat){repeatSteps++;repeatSizes.push([i,a.length]);minAtRepeat=Math.min(minAtRepeat,beam.length);}
    if(!beam.length){firstDead=i;break;}
  }
  function encode(p){let L=id,R=id;const out=[],bits=[];for(const x of p){let j=R.indexOf(x),v=L[j],side=0;const prev=out.at(-1);if(v===prev){const k=L.indexOf(x),w=R[k];if(w!==prev){side=1;j=k;v=w;}}out.push(v);bits.push(side);({L,R}=advance(L,R,j));}return {out,bits};}
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const completed=beam.length>0&&firstDead===null;
  const reps=completed?[...new Set(beam.map(s=>s.p))]:[];
  const witnesses=reps.slice(0,2).map(s=>{const p=Array.from(s,v=>v.charCodeAt(0)-65),r=encode(p);assert(same(r.out,c),"full deterministic greedy replay");return{p,switched:r.bits.reduce((s,v)=>s+v,0)}});
  const diff=witnesses.length>1?witnesses[0].p.reduce((s,v,i)=>s+(v!==witnesses[1].p[i]),0):0;
  return {summary:{N,B,repeatSteps,minAtRepeat,repeatSizes,ambiguousSites,pruned,firstDead,completed,paths:beam.length,distinct:reps.length,diffFirstTwo:diff,firstTwoSwitches:witnesses.map(z=>z.switched)},witnesses};
}
const corpus=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(witness(corpus,assert.ok),null,2));
