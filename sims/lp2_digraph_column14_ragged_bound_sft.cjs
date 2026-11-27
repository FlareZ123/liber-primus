'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const b=fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/lp2-corpus.json'));
function ragged(d){
 const W=14,A=29,B=841,starts=[0,3,8,15,23,27,33,40,54,56],floors=[548,1392,3490,4232,1092,2398,3332,11102,66];
 const rev=Array.from({length:B},(_,i)=>A*(i%A)+Math.floor(i/A));
 const out=[];
 for(let i=0;i<9;i++){
  const a=d.pages.slice(starts[i],starts[i+1]).flatMap(p=>p.indices),R=Math.floor(a.length/W),t=a.length%W;
  if(!t){out.push({pages:[starts[i],starts[i+1]-1],R,t,nativeFloor:floors[i],status:"complete rectangle; previous exact test"});continue}
  const cs=Array.from({length:W},(_,j)=>Array.from({length:Math.min(j,t)-Math.max(0,t-(W-j))+1},(_,u)=>{const k=u+Math.max(0,t-(W-j));return {j,k,start:j*R+k}}));
  const es=[];let maxSelf=0;
  for(let i=0;i<W;i++)for(let j=i+1;j<W;j++)for(const x of cs[i])for(const y of cs[j]){
   if(y.k<x.k||y.k-x.k>j-i)continue;
   const h=new Uint16Array(B),nz=[];
   for(let r=0;r<R;r++){const v=A*a[x.start+r]+a[y.start+r];if(!h[v])nz.push(v);h[v]++}
   const self=nz.reduce((s,v)=>s+h[v]*(h[v]-1),0);
   maxSelf=Math.max(maxSelf,self);es.push({x,y,h,nz,self,mask:(1<<i)|(1<<j)});
  }
  // Pairwise maxima need not share the same global ragged geometry; this
  // relaxation can only increase the attainable collision score.
  let maxCross=0,comparisons=0,crossWitness=null;
  const pairMax=Array.from({length:W},()=>Array(W).fill(0));
  for(const e of es)pairMax[e.x.j][e.y.j]=Math.max(pairMax[e.x.j][e.y.j],e.self);
  for(let i=0;i<es.length;i++){let e=es[i];for(let j=i+1;j<es.length;j++){let f=es[j];if(e.mask&f.mask)continue;
    // Check simultaneous prefix feasibility for all four columns.
    const z=[e.x,e.y,f.x,f.y].sort((a,b)=>a.j-b.j);let ok=true;
    for(let k=1;k<4;k++){let delta=z[k].k-z[k-1].k;if(delta<0||delta>z[k].j-z[k-1].j){ok=false;break}}
    if(!ok)continue;
    comparisons++;let s=0,o=0;
    for(const v of e.nz){s+=e.h[v]*f.h[v];o+=e.h[v]*f.h[rev[v]]}
    let m=Math.max(s,o);if(m>maxCross){maxCross=m;crossWitness=[e.x,e.y,f.x,f.y]}
  }}
  // Tighten within-edge contribution via all perfect column matchings,
  // granting each pair its own locally feasible ragged geometry.
  const memo=new Map([[0,0]]);
  function best(mask){if(memo.has(mask))return memo.get(mask);let x=31-Math.clz32(mask&-mask),rem=mask^(1<<x),m=-1;for(let z=rem;z;z&=z-1){let y=31-Math.clz32(z&-z);m=Math.max(m,pairMax[x][y]+best(rem^(1<<y)))}memo.set(mask,m);return m}
  const selfUpper=best((1<<W)-1),upper=selfUpper+42*maxCross;
  out.push({pages:[starts[i],starts[i+1]-1],R,t,possibleEdges:es.length,comparisons,maxSelf,selfUpper,maxCross,crossWitness,upper,nativeFloor:floors[i],excluded:upper<floors[i]})
 }
 return out;
}
console.log(JSON.stringify({inputSha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),results:ragged(JSON.parse(b.toString('utf8')))},null,2));
