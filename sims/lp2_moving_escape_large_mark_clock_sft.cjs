"use strict";
// Exact all-permutation moving-escape bounds for physical large-mark rekeying.
const fs=require("node:fs");
const path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function experiment(corpus,punctuation) {
  const mod=(x,n)=>((x%n)+n)%n;
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  const x=pages.flatMap(p=>p.indices);
  const marks=punctuation.events.filter(e=>e.symbol==="⁜");
  const cuts=new Set([0]); let offset=0;
  for(const p of pages){cuts.add(offset);offset+=p.indices.length;}
  const pageCuts=new Set(cuts);
  for(const m of marks)cuts.add(m.rune_offset);
  const clock=[];let k=0;const dotByOffset=new Map();
  for(const m of marks)dotByOffset.set(m.rune_offset,(dotByOffset.get(m.rune_offset)||0)+m.large_mark.dot_count);
  for(let i=0;i<x.length;i++){k+=dotByOffset.get(i)||0;clock.push(k);}
  const rank=(prev,c,mode)=>mode==="cyclic"?mod(c-prev-1,29):c-Number(c>prev);
  const emit=(prev,q,mode)=>mode==="cyclic"?mod(prev+q+1,29):q+Number(q>=prev);
  function privateBound(cutSet){
    const counts=[];let a,b;
    for(let i=0;i<x.length;i++){if(cutSet.has(i)){a=Array(28).fill(0);b=Array(28).fill(0);counts.push([a,b]);continue;}if(x[i]===x[i-1])continue;a[rank(x[i-1],x[i],"cyclic")]++;b[rank(x[i-1],x[i],"sorted")]++;}
    return {regions:counts.length,cyclic:counts.reduce((s,[a])=>s+Math.min(...a),0),sorted:counts.reduce((s,[,b])=>s+Math.min(...b),0),mixed:counts.reduce((s,[a,b])=>s+Math.min(...a,...b),0)};
  }
  function assignment(a,maximize=false){
    const n=a.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
      do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=(maximize?-a[i0-1][j-1]:a[i0-1][j-1])-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;j0=j1;}while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);
    }
    return p.slice(1).reduce((s,i,j)=>s+a[i-1][j],0);
  }
  const oracle=[[5,2,7],[1,8,3],[4,6,0]];
  const costs=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(p=>p.reduce((s,j,i)=>s+oracle[i][j],0));
  if(assignment(oracle)!==Math.min(...costs)||assignment(oracle,true)!==Math.max(...costs))throw Error("assignment oracle");
  function bounds(cipher,mode,sign,placement){
    let free=0;const a=Array.from({length:28},()=>Array(28).fill(0)),b=Array.from({length:28},()=>Array(28).fill(0));
    for(let i=0;i<cipher.length;i++){if(cuts.has(i)||cipher[i]===cipher[i-1]){free++;continue;}const q=rank(cipher[i-1],cipher[i],mode),k=clock[i]*sign;
      for(let j=0;j<28;j++){const row=placement==="before"?mod(q-k,28):q;const r=placement==="before"?j:mod(j-k,28);a[row][j]+=Number(r===11);b[row][j]+=Number(r===17||r===18);}
    }
    return {minRare:assignment(a),maxE:assignment(b,true)+free,free};
  }
  let seed=0x330117;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  const plain=Array.from({length:x.length},(_,i)=>corpus.pages[57].indices[i%corpus.pages[57].indices.length]);const rows=[];
  for(const mode of ["cyclic","sorted"])for(const sign of [1,-1])for(const placement of ["before","after"]){
    const R=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){const j=rnd()%(i+1);[R[i],R[j]]=[R[j],R[i]];}
    const inv=Array(28);R.forEach((v,i)=>inv[v]=i);const esc=Array.from({length:29},()=>rnd()%29);
    const cipher=[],decoded=[];
    for(let i=0;i<plain.length;i++){const P=plain[i],k=sign*clock[i];if(cuts.has(i)){cipher.push(P);continue;}const e=esc[plain[i-1]];if(P===e){cipher.push(cipher[i-1]);continue;}const r=P-Number(P>e);const q=placement==="before"?mod(inv[r]+k,28):inv[mod(r+k,28)];cipher.push(emit(cipher[i-1],q,mode));}
    for(let i=0;i<cipher.length;i++){const c=cipher[i],k=sign*clock[i];if(cuts.has(i)){decoded.push(c);continue;}const e=esc[decoded[i-1]];if(c===cipher[i-1]){decoded.push(e);continue;}const q=rank(cipher[i-1],c,mode),r=placement==="before"?R[mod(q-k,28)]:mod(R[q]-k,28);decoded.push(r+Number(r>=e));}
    if(decoded.some((p,i)=>p!==plain[i]))throw Error("plant inversion failed");
    const pb=bounds(cipher,mode,sign,placement),rare=plain.filter(p=>p===11||p===12).length,E=plain.filter(p=>p===18).length;
    if(rare<pb.minRare||E>pb.maxE)throw Error("plant bound failed");
    rows.push({mode,sign,placement,...bounds(x,mode,sign,placement),plantRecovered:decoded.length,plantRare:rare,plantE:E,plantBounds:pb});
  }
  return {runes:x.length,marks:marks.length,dots:marks.reduce((s,m)=>s+m.large_mark.dot_count,0),largeOnly:privateBound(new Set([0,...marks.map(m=>m.rune_offset)])),pages:privateBound(pageCuts),pagesPlusLarge:privateBound(cuts),rows};
}
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-punctuation-identity.json")),null,2));
