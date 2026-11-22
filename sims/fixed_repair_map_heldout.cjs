'use strict';

/**
 * Single runnable fixed duplicate-repair destination test.
 * Uses exact original rune page boundaries; Node.js CommonJS.
 */
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const M = 29;
const mat = () => Array.from({length:M}, () => new Int32Array(M));

/** Reproducible 32-bit xorshift generator. */
function random32(seed) {
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

/** Map each source rune to its most anomalously frequent next rune. */
function fit(a) {
  const row = new Float64Array(M), col = new Float64Array(M);
  for (let s=0;s<M;s++) for(let t=0;t<M;t++) if(s!==t) {
    row[s]+=a[s][t];col[t]+=a[s][t];
  }
  const total=row.reduce((x,y)=>x+y,0);
  return Array.from({length:M},(_,s)=>{
    let best=-Infinity, winner=-1;
    for(let t=0;t<M;t++) if(t!==s) {
      const exp=row[s]*col[t]/(total-col[s]);
      const z=(a[s][t]-exp)/Math.sqrt(Math.max(1,exp));
      if(z>best){best=z;winner=t;}
    }
    return winner;
  });
}
function score(b,map) {
  let n=0;for(let s=0;s<M;s++)n+=b[s][map[s]];
  return n;
}
function observed() {
  const a=mat(), b=mat(), heldout=[];
  let nA=0,nB=0,dA=0,dB=0;
  for(const p of pages) for(let i=1;i<p.indices.length;i++) {
    const s=p.indices[i-1], t=p.indices[i];
    if(p.page<=27){a[s][t]++;nA++;if(s===t)dA++;}
    else {b[s][t]++;nB++;if(s===t)dB++;else heldout.push([s,t]);}
  }
  if(pages.length!==55||nA!==6733||nB!==6168||dA!==45||dB!==41)throw Error('LP2 corpus contract changed');
  return {a,b,heldout,nA,nB,dA,dB};
}
function summary(a) {
  const sorted=a.slice().sort((x,y)=>x-y);
  const mean=sorted.reduce((x,y)=>x+y,0)/sorted.length;
  const sd=Math.sqrt(sorted.reduce((x,y)=>x+(y-mean)**2,0)/sorted.length);
  return {min:sorted[0],median:sorted[sorted.length>>1],max:sorted.at(-1),mean,sd};
}

/**
 * Row/column degree-preserving target switches on the held-out edges.
 * Reject self-loops. Excluded real diagonal transitions stay fixed.
 */
function nullScores(edges,map,samples=1000,swaps=30000) {
  const pool=edges.map(([s,t])=>[s,t]),r=random32(0x34bacafe),vals=[];
  for(let i=0;i<samples;i++) {
    for(let k=0;k<swaps;k++) {
      const ai=Math.floor(r()*pool.length),bi=Math.floor(r()*pool.length);
      if(ai===bi)continue;
      const a=pool[ai],b=pool[bi];
      if(a[0]===b[1]||b[0]===a[1])continue;
      const t=a[1];a[1]=b[1];b[1]=t;
    }
    let n=0;
    for(const [s,t] of pool)if(map[s]===t)n++;
    vals.push(n);
  }
  return vals;
}

/** Hidden derangement f, iid 29-symbol base stream, 81% repeat repair. */
function planted(trials=100) {
  const r=random32(0x34cab123),out=[];
  for(let run=0;run<trials;run++) {
    const f=Array.from({length:M},(_,i)=>i);
    for(let i=M-1;i>0;i--){const j=Math.floor(r()*i);[f[i],f[j]]=[f[j],f[i]];}
    const a=mat(),b=mat();let repairs=0,doubles=0;
    for(const page of pages) {
      let prior=Math.floor(r()*M);
      for(let i=1;i<page.indices.length;i++) {
        let x=Math.floor(r()*M);
        if(x===prior&&r()<0.81){x=f[prior];repairs++;}
        if(x===prior)doubles++;
        (page.page<=27?a:b)[prior][x]++;prior=x;
      }
    }
    const guess=fit(a);let correct=0;
    for(let s=0;s<M;s++)if(guess[s]===f[s])correct++;
    out.push({hits:score(b,guess),correct,repairs,doubles});
  }
  return out;
}
function main() {
  const {a,b,heldout,nA,nB,dA,dB}=observed();
  const mapping=fit(a),hits=score(b,mapping);
  const vals=nullScores(heldout,mapping);
  const above=vals.filter(v=>v>=hits).length;
  const controls=planted(), cHits=controls.map(x=>x.hits);
  console.log(JSON.stringify({
    train:{physicalPages:'0-27',pairs:nA,doublets:dA},
    test:{physicalPages:'28-55 excluding page 50',pairs:nB,doublets:dB},
    mapping,actualHits:hits,
    null:{seed:'0x34bacafe',samples:vals.length,swapsPerSample:30000,
      ...summary(vals),exceed:above,p:(above+1)/(vals.length+1)},
    synthetic:{seed:'0x34cab123',trials:controls.length,repairProbability:0.81,
      hits:summary(cHits),mapCorrect:summary(controls.map(x=>x.correct)),
      repairs:summary(controls.map(x=>x.repairs)),
      doublets:summary(controls.map(x=>x.doubles)),
      aboveActual:cHits.filter(v=>v>hits).length,
      aboveNullMaximum:cHits.filter(v=>v>Math.max(...vals)).length}
  },null,2));
}
if(require.main===module)main();
module.exports={fit,score,observed,nullScores,planted,main};
