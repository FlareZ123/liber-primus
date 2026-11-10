'use strict';
/**
 * Agent 38: original LP2 pages 28/42, scaled shared-key hypothesis without
 * assuming their printed word breaks are plaintext boundaries.
 * Exact 29-state bigram and 29^2-state trigram marginal likelihoods,
 * all 272 shifts, held-out source-native true-key control.
 * Only Node.js 22 built-ins and existing repository resources are needed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = require('./relative_key_english_probe.cjs');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const N = 29, STATES = N * N, MOD = N;
const mod = x => ((x % MOD) + MOD) % MOD;
const train = base.corpusWords(reference.slice(0, 240000)).flat();
const test = base.corpusWords(reference.slice(240000)).flat();

/** @param {number[]} symbols */
function probabilities(symbols) {
  const h1 = new Float64Array(N), h2 = new Float64Array(STATES), h3 = new Float64Array(STATES*N);
  const t2 = new Float64Array(N), t3 = new Float64Array(STATES);
  for (let i = 0; i < symbols.length; i++) {
    const c = symbols[i]; h1[c]++;
    if (i > 0) {
      const prev = symbols[i-1]; h2[prev*N+c]++; t2[prev]++;
      if (i > 1) { const k = symbols[i-2]*N+prev; h3[k*N+c]++; t3[k]++; }
    }
  }
  const p1 = Float64Array.from(h1, v => (v+1)/(symbols.length+N));
  const p2 = new Float64Array(STATES), p3 = new Float64Array(STATES*N);
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++)
    p2[a*N+b] = (h2[a*N+b]+10*p1[b])/(t2[a]+10);
  for (let j = 0; j < STATES; j++) for (let c = 0; c < N; c++)
    p3[j*N+c] = (h3[j*N+c]+5*p2[(j%N)*N+c])/(t3[j]+5);
  return {p1,p2,p3};
}
const lm = probabilities(train);

/** @param {number[]} a @param {number[]} b @param {number} shift */
function differences(a,b,shift) {
  const out = new Uint8Array(a.length);
  for (let i=0;i<a.length;i++) out[i]=mod(22*(a[i]-b[(i+shift)%b.length]));
  return out;
}

/** @param {Uint8Array} differences @param {2|3} order */
function marginal(differences, order) {
  const n=differences.length;
  assert.ok(n>=2);
  const q=new Uint8Array(n*N);
  for(let i=0;i<n;i++)for(let x=0;x<N;x++)q[i*N+x]=mod(x-differences[i]);
  if(order===2){
    let a=new Float64Array(N),b=new Float64Array(N),norm=0,score=0;
    for(let x=0;x<N;x++)norm+=a[x]=lm.p1[x]*lm.p1[q[x]];
    score+=Math.log(norm);for(let x=0;x<N;x++)a[x]/=norm;
    for(let i=1;i<n;i++){
      b.fill(0);
      for(let x=0;x<N;x++){
        const qx=q[(i-1)*N+x],weight=a[x],j=x*N,k=qx*N;
        for(let y=0;y<N;y++)b[y]+=weight*lm.p2[j+y]*lm.p2[k+q[i*N+y]];
      }
      norm=0;for(let y=0;y<N;y++)norm+=b[y];score+=Math.log(norm);
      for(let y=0;y<N;y++)b[y]/=norm;[a,b]=[b,a];
    }
    return score;
  }
  let a=new Float64Array(STATES),b=new Float64Array(STATES),norm=0,score=0;
  for(let x=0;x<N;x++)for(let y=0;y<N;y++){
    const qx=q[x],qy=q[N+y];
    norm+=a[x*N+y]=lm.p1[x]*lm.p1[qx]*lm.p2[x*N+y]*lm.p2[qx*N+qy];
  }
  score+=Math.log(norm);for(let j=0;j<STATES;j++)a[j]/=norm;
  for(let i=2;i<n;i++){
    b.fill(0);const at=i*N,one=(i-1)*N,two=(i-2)*N;
    for(let x=0;x<N;x++){
      const qx=q[two+x];
      for(let y=0;y<N;y++){
        const qy=q[one+y],w=a[x*N+y],r=(x*N+y)*N,s=(qx*N+qy)*N,k=y*N;
        for(let z=0;z<N;z++)b[k+z]+=w*lm.p3[r+z]*lm.p3[s+q[at+z]];
      }
    }
    norm=0;for(let j=0;j<STATES;j++)norm+=b[j];
    score+=Math.log(norm);for(let j=0;j<STATES;j++)b[j]/=norm;[a,b]=[b,a];
  }
  return score;
}

/** @param {number[]} a @param {number[]} b @param {2|3} order */
function rankShifts(a,b,order) {
  const scores=[];
  for(let shift=0;shift<b.length;shift++)scores.push({shift,score:marginal(differences(a,b,shift),order)});
  scores.sort((a,b)=>b.score-a.score);
  return {zeroRank:scores.findIndex(x=>x.shift===0)+1,zero:scores.find(x=>x.shift===0),top:scores.slice(0,8),median:scores[Math.floor(scores.length/2)],tested:scores.length};
}

/** @param {number} seed */
function rng(seed) {let x=seed>>>0;return () => ((x=(Math.imul(1664525,x)+1013904223)>>>0)/4294967296);}
function study() {
  const a=corpus.pages.find(p=>p.page===28).indices,b=corpus.pages.find(p=>p.page===42).indices;
  assert.equal(a.length,269);assert.equal(b.length,272);
  assert.equal(train.length,174998);assert.equal(test.length,43802);
  const p=test.slice(1000,1269),q=test.slice(8000,8269),random=rng(3301);
  const keys=p.map(()=>Math.floor(29*random()));
  const ca=p.map((v,i)=>mod(4*v+keys[i])),cb=q.map((v,i)=>mod(4*v+keys[i]));
  const originalBigram=rankShifts(a,b,2), plantedBigram=rankShifts(ca,cb,2);
  assert.equal(originalBigram.zeroRank,1);
  assert.equal(plantedBigram.zeroRank,1);
  const originalTrigram=rankShifts(a,b,3), plantedTrigram=rankShifts(ca,cb,3);
  return {model:'continuous unspaced GP: scale-four shared-pad exact marginal',trainingRunes:train.length,
    heldoutRunes:test.length,originalBigram,plantedBigram,originalTrigram,plantedTrigram,
    note:'Pair and factor four are earlier postselected LP2 hypotheses; rotation ranks are within-study diagnostics. Neither a conditional rank nor a key-blind recipher proves plaintext.'};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={probabilities,differences,marginal,rankShifts,study};
