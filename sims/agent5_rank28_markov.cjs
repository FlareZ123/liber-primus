"use strict";
/**
 * Held-out original-LP2 shared-key test using the *two-step language law*
 * of consecutive 28-rune predecessor differences. The 28 key residues
 * cancel without estimating a key, under the exact reversible EA-sentinel
 * cipher of agent5_rank28_sharedpad.cjs. Unlike a marginal-only difference
 * score, this uses GP-English correlations across consecutive plaintext
 * symbols. No ciphertext is used to fit the language law.
 *
 * Run in Node 22: node sims/agent5_rank28_markov.cjs 120 24
 * Original 8 LP2 sections: 12,956 original runes, 28 pairs x 301 shifts.
 * A candidate's first 300 aligned positions are train and next 300 heldout.
 * Positive plants use the same *original* lengths and a random shared pad.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=require("./agent5_rank28_sharedpad.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alpha=new Map(corpus.runes.map((r,i)=>[r,i]));
const original=read("resources/lp2-transcription.txt").split("$")
  .map(s=>[...s].filter(c=>alpha.has(c)).map(c=>alpha.get(c)))
  .filter(s=>s.length).slice(0,8);
const LENGTHS=[729,1145,1738,1894,1021,1433,1680,3316];
assert.deepEqual(original.map(x=>x.length),LENGTHS);
const originalSteps=original.map(base.rank28),M=28,TRAIN=300,HOLD=300,TOP=20,SHIFT=150;
const source=read("resources/control/shakespeare_first300k.txt");
const gpTrain=base.encodeGP(source.slice(0,240000));
const gpTest=base.encodeGP(source.slice(240000));
const maxOriginal=Math.max(...LENGTHS);
assert(gpTest.length>maxOriginal);

/**
 * Correlation law: P(D_t=d,D_{t+1}=e) = sum_xy P(x,y)P(x-d,y-e),
 * where each P is an independently sampled first-order 28-symbol
 * GP-English chain. Its conditional likelihood is a key-free aligned
 * ciphertext-pair test. GP EA is a separate copy/erasure sentinel.
 */
function makeModel() {
  const counts=Array.from({length:M},()=>Array(M).fill(0.5));
  for(let i=1;i<gpTrain.length;i++) {
    const x=gpTrain[i-1],y=gpTrain[i];
    if(x<M&&y<M) counts[x][y]++;
  }
  const all=counts.flat().reduce((a,b)=>a+b,0);
  const q=counts.map(row=>row.map(n=>n/all));
  const joint=Array.from({length:M},()=>Array(M).fill(0));
  for(let d=0;d<M;d++)for(let e=0;e<M;e++)
    for(let x=0;x<M;x++)for(let y=0;y<M;y++)
      joint[d][e]+=q[x][y]*q[(x-d+M)%M][(y-e+M)%M];
  const marginal=joint.map(row=>row.reduce((a,b)=>a+b,0));
  const initial=marginal.map(p=>Math.log(M*p));
  const conditional=joint.map((row,d)=>
    row.map(x=>Math.log(M*x/marginal[d])));
  for(let d=0;d<M;d++) {
    assert(marginal[d]>0&&Number.isFinite(initial[d]));
    for(let e=0;e<M;e++)assert(Number.isFinite(conditional[d][e]));
  }
  return {initial,conditional,marginal,meanShiftScore:
    marginal.reduce((s,p,d)=>s+p*initial[d],0)};
}
const model=makeModel();
function score(steps) {
  const out=[];
  for(let a=0;a<8;a++)for(let b=a+1;b<8;b++) {
    const A=steps[a],B=steps[b];
    for(let shift=-SHIFT;shift<=SHIFT;shift++) {
      const first=Math.max(1,1-shift);
      if(Math.min(A.length,B.length-shift)-first<TRAIN+HOLD)continue;
      let ll0=0,ll1=0,uni0=0,uni1=0,valid0=0,valid1=0,pairs0=0,pairs1=0;
      let prior=-1;
      for(let j=0;j<TRAIN+HOLD;j++) {
        const i=first+j,x=A[i],y=B[i+shift];
        const d=(x>=0&&y>=0)?(x-y+M)%M:-1;
        if(d>=0) {
          const single=model.initial[d];
          const val=prior>=0 ? model.conditional[prior][d] : single;
          if(j<TRAIN) {
            ll0+=val;uni0+=single;valid0++;
            if(prior>=0)pairs0++;
          } else {
            // First validation position always starts a new chain.
            if(j===TRAIN) {
              ll1+=single;
            } else {
              ll1+=val;
              if(prior>=0)pairs1++;
            }
            uni1+=single;valid1++;
          }
        }
        prior=d;
      }
      out.push({a,b,shift,train:ll0,heldout:ll1,
        unigramTrain:uni0,unigramHeldout:uni1,
        trainN:valid0,heldoutN:valid1,trainPairs:pairs0,heldoutPairs:pairs1});
    }
  }
  out.sort((a,b)=>b.train-a.train);
  return out;
}
function summarize(r) {
  const finalists=r.slice(0,TOP);
  return {tested:r.length,top1:r[0],
    bestTop20Heldout:Math.max(...finalists.map(x=>x.heldout)),
    bestTop20Pair:finalists.reduce((b,x)=>x.heldout>b.heldout?x:b),
    topFive:finalists.slice(0,5)};
}
function rng(seed) {
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
function draw(r,n){return (r()>>>8)%n;}
function control(seed){
  const r=rng(seed),maxLen=maxOriginal+SHIFT+2;
  const keys=original.map(()=>Array.from({length:maxLen},()=>draw(r,M)));
  const a=2,b=5,sh=73;
  for(let i=1;i<LENGTHS[a];i++)if(i+sh<LENGTHS[b])
    keys[b][i+sh]=keys[a][i];
  const c=original.map((originalSection,i)=>{
    const start=draw(r,gpTest.length-originalSection.length+1);
    const p=gpTest.slice(start,start+originalSection.length);
    const ciphertext=base.encrypt(p,keys[i],draw(r,29));
    assert.deepEqual(base.decrypt(ciphertext,keys[i]).slice(1),p.slice(1));
    return ciphertext;
  });
  const test=score(c.map(base.rank28));
  const index=test.findIndex(x=>x.a===a&&x.b===b&&x.shift===sh);
  assert(index>=0);
  return {rank:index+1,trueAlignment:test[index],
    selectedHeldout:test[0].heldout,top20:index<TOP};
}
function rotateNull(originalSteps,r) {
  return originalSteps.map(s=>{
    const k=draw(r,s.length);
    return s.slice(k).concat(s.slice(0,k));
  });
}
function run(nulls=120,plants=24) {
  const actual=summarize(score(originalSteps));
  const random=rng(0x5f18034);
  const nullScores=[];
  for(let k=0;k<nulls;k++)
    nullScores.push(summarize(score(rotateNull(originalSteps,random))).bestTop20Heldout);
  const nGe=nullScores.filter(x=>x>=actual.bestTop20Heldout).length;
  const planted=Array.from({length:plants},(_,i)=>control(0x57a1330+i*131));
  const med=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
  return {
    hypothesis:"GP 28-rank EA-sentinel, key reused across two sections, key-free first-order difference Markov",
    originalRunes:LENGTHS.reduce((a,b)=>a+b,0),
    trueCipherOriginal:"unknown",
    sourceGP:{training:gpTrain.length,heldout:gpTest.length},
    search:{pairs:28,shiftMin:-SHIFT,shiftMax:SHIFT,trainPositions:TRAIN,validationPositions:HOLD},
    sourceTraining: {adjacentDistribution:"Dirichlet 0.5 per 28×28 transition",prior: "English GP first240k Shakespeare characters",actualTrueDifferenceExpectedLogLR:model.meanShiftScore},
    actual,
    matchedOriginalRotations:{n:nulls,seed:"0x05f18034",nAtLeastOriginal:nGe,
      pAddOne:(nGe+1)/(nulls+1),medianBestTop20Heldout:med(nullScores),
      maxBestTop20Heldout:Math.max(...nullScores)},
    exactInversePlanted:{n:plants,sharedPair:[2,5],sharedShift:73,
      top1:planted.filter(x=>x.rank===1).length,
      top20:planted.filter(x=>x.top20).length,
      positiveTrueHeldout:planted.filter(x=>x.trueAlignment.heldout>0).length,
      medianTrueHeldout:med(planted.map(x=>x.trueAlignment.heldout)),
      examples:planted.slice(0,5)}
  };
}
if(require.main===module) {
  const n=process.argv[2]===undefined?120:Number(process.argv[2]),
    p=process.argv[3]===undefined?24:Number(process.argv[3]);
  assert(Number.isInteger(n)&&n>=1&&n<=1000);
  assert(Number.isInteger(p)&&p>=1&&p<=200);
  console.log(JSON.stringify(run(n,p),null,2));
}
module.exports={makeModel,score,run};
