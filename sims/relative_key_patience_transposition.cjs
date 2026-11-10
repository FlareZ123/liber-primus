'use strict';

/**
 * Agent 15: source-fixed PATIENCE 8-column inverse on the original LP2
 * physical-page 28/42 factor-four difference stream.
 *
 * Known 2014 PATIENCE column order (GP prime ranking) is [6,5,3,0,2,4,7,1].
 * The factor four and page pair are previously selected exploratory hypotheses.
 * This probe tests only an additional independently specified ordering;
 * it does not assert a shared pad, key, plaintext, or Cicada transposition.
 *
 * Run: node sims/relative_key_patience_transposition.cjs
 * Node 22, CommonJS, no third-party packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ref = require('./relative_key_english_probe.cjs');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const PATIENCE = Object.freeze([6,5,3,0,2,4,7,1]);
const MOD = 29, WIDTH = 8, HEIGHT = 32, LENGTH = WIDTH * HEIGHT;
const mod = x => ((x % MOD) + MOD) % MOD;

/** @param {number[]} train @returns {Float64Array} */
function differenceTransitionLogs(train) {
  const freq = new Float64Array(MOD);
  const raw = new Float64Array(MOD * MOD);
  const rows = new Float64Array(MOD);
  for (let i = 0; i < train.length; i++) {
    freq[train[i]]++;
    if (i) {raw[train[i-1] * MOD + train[i]]++; rows[train[i-1]]++;}
  }
  const q = Float64Array.from(freq, n => (n + 1) / (train.length + MOD));
  for (let x = 0; x < MOD; x++)
    for (let y = 0; y < MOD; y++)
      raw[x * MOD + y] = (raw[x * MOD + y] + 10*q[y]) / (rows[x] + 10);
  const out = new Float64Array(MOD * MOD);
  for (let d = 0; d < MOD; d++) {
    let denominator = 0;
    for (let x = 0; x < MOD; x++) denominator += q[x]*q[mod(x-d)];
    for (let e = 0; e < MOD; e++) {
      let numerator = 0;
      for (let x = 0; x < MOD; x++) {
        const y = mod(x-d);
        for (let z = 0; z < MOD; z++) {
          const other = mod(z-e);
          numerator += q[x]*q[y]*raw[x*MOD+z]*raw[y*MOD+other];
        }
      }
      out[d*MOD+e] = Math.log(numerator/denominator);
    }
  }
  return out;
}

/** @param {ArrayLike<number>} d @param {ArrayLike<number>} perm */
function reorderRows(d, perm) {
  const out = new Uint8Array(LENGTH);
  for (let row = 0; row < HEIGHT; row++)
    for (let col = 0; col < WIDTH; col++)
      out[WIDTH*row+col] = d[WIDTH*row+perm[col]];
  return out;
}

/** @param {ArrayLike<number>} d @param {ArrayLike<number>} perm */
function scrambleRows(d, perm) {
  const out = new Uint8Array(LENGTH);
  for (let row = 0; row < HEIGHT; row++)
    for (let col = 0; col < WIDTH; col++)
      out[WIDTH*row+perm[col]] = d[WIDTH*row+col];
  return out;
}

/** @param {ArrayLike<number>} d @param {ArrayLike<number>} perm */
function reorderColumns(d, perm) {
  const out = new Uint8Array(LENGTH);
  for (let row = 0; row < HEIGHT; row++)
    for (let col = 0; col < WIDTH; col++)
      out[WIDTH*row+col] = d[HEIGHT*perm[col]+row];
  return out;
}

/** @param {ArrayLike<number>} d @param {Float64Array} log */
function score(d, log) {
  let s = 0;
  for (let t = 1; t < LENGTH; t++) s += log[MOD*d[t-1]+d[t]];
  return s;
}

/**
 * Exhaust every 8! relabeling, retaining the 256 observed difference values.
 * @param {Uint8Array} d @param {Float64Array} log
 * @param {(d:Uint8Array,p:number[])=>Uint8Array} transform
 */
function exactColumnRanking(d, log, transform) {
  const order = [0,1,2,3,4,5,6,7], scored=[];
  function walk(i) {
    if (i === WIDTH) {
      scored.push({key:order.join(''),logScore:score(transform(d,order),log)});
      return;
    }
    for (let j = i; j < WIDTH; j++) {
      [order[i],order[j]] = [order[j],order[i]];
      walk(i+1);
      [order[i],order[j]] = [order[j],order[i]];
    }
  }
  walk(0);
  scored.sort((a,b) => b.logScore-a.logScore);
  assert.equal(scored.length,40320);
  const k=PATIENCE.join('');
  const idx=scored.findIndex(v=>v.key===k);
  return {
    sourceRank:idx+1, possibleOrders:scored.length,
    exactRankFraction:(idx+1)/scored.length,
    sourceScore:scored[idx].logScore,
    best:scored[0], medianScore:scored[20160].logScore
  };
}

/**
 * Source-free reference difference marginal. The original p28/p42
 * alignment and scale four were selected by this model in earlier work.
 * This test checks whether PATIENCE applied to one stream preserves it.
 * @param {number[]} training
 */
function differenceMarginalLogs(training) {
  const h = new Float64Array(MOD);
  for(const x of training) h[x]++;
  const q=Float64Array.from(h,v=>(v+1)/(training.length+MOD));
  const out=new Float64Array(MOD);
  for(let d=0;d<MOD;d++) {
    let prob=0;
    for(let x=0;x<MOD;x++)prob+=q[x]*q[mod(x-d)];
    out[d]=Math.log(MOD*prob);
  }
  return out;
}

/** @param {ArrayLike<number>} d @param {Float64Array} marginal */
function marginalScore(d,marginal) {
  let score=0;
  for(let t=0;t<d.length;t++)score+=marginal[d[t]];
  return score;
}

/** @param {ArrayLike<number>} a @param {ArrayLike<number>} b */
function diff(a,b){
  const d=new Uint8Array(LENGTH);
  for(let t=0;t<LENGTH;t++)d[t]=mod(22*(a[t]-b[t]));
  return d;
}

/**
 * Test a source-fixed 8-column permutation to ONLY ONE ciphertext page,
 * prior to cancellation of a hypothetical shared additive pad.
 * Both paths retain all 256 original observed GP glyphs.
 * @param {number[]} a
 * @param {number[]} b
 * @param {Float64Array} bigram
 * @param {Float64Array} marginal
 * @param {'A'|'B'} side
 */
function onePageRanking(a,b,bigram,marginal,side){
  const perm=[0,1,2,3,4,5,6,7], rows=[];
  function walk(i){
    if(i===WIDTH){
      const x=side==='A'?reorderRows(a,perm):a;
      const y=side==='B'?reorderRows(b,perm):b;
      const d=diff(x,y);
      const mono=marginalScore(d,marginal);
      const transition=score(d,bigram);
      rows.push({key:perm.join(''),mono,transition,joint:mono+transition});
      return;
    }
    for(let j=i;j<WIDTH;j++){
      [perm[i],perm[j]]=[perm[j],perm[i]];
      walk(i+1);
      [perm[i],perm[j]]=[perm[j],perm[i]];
    }
  }
  walk(0);
  const key=PATIENCE.join(''),reversed=new Array(WIDTH);
  PATIENCE.forEach((v,i)=>{reversed[v]=i;});
  const r={side};
  for(const field of ['mono','transition','joint']){
    rows.sort((x,y)=>y[field]-x[field]);
    r[field]={
      historicalKeyRank:rows.findIndex(v=>v.key===key)+1,
      inverseKeyRank:rows.findIndex(v=>v.key===reversed.join(''))+1,
      candidates:rows.length,
      best:rows[0][field],
      median:rows[20160][field],
      historicalKeyScore:rows.find(v=>v.key===key)[field]
    };
  }
  return r;
}

/** @param {number} seed */
function randomGenerator(seed) {
  let state=seed>>>0;
  return () => {state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}

function study() {
  const train=ref.corpusWords(shakespeare.slice(0,240000)).flat();
  const heldout=ref.corpusWords(shakespeare.slice(240000)).flat();
  assert.equal(train.length,174998);
  assert.equal(heldout.length,43802);
  const log=differenceTransitionLogs(train);
  const marginal=differenceMarginalLogs(train);
  const a=corpus.pages.find(p=>p.page===28).indices;
  const b=corpus.pages.find(p=>p.page===42).indices;
  assert.equal(a.length,269);
  assert.equal(b.length,272);
  const d=Uint8Array.from(a.slice(0,LENGTH).map((x,i)=>mod(22*(x-b[i]))));
  const rowRanking=exactColumnRanking(d,log,reorderRows);
  const columnRanking=exactColumnRanking(d,log,reorderColumns);
  const inverted=new Array(WIDTH);
  PATIENCE.forEach((v,i)=>{inverted[v]=i;});
  const inverseColumnScore=score(reorderColumns(d,inverted),log);
  const rand=randomGenerator(39393);
  let plantWins=0,comparisons=0,plantTop5=0;
  const advantages=[];
  for (let k=0; k<60; k++) {
    const offset=1000+510*k;
    const p=heldout.slice(offset,offset+LENGTH);
    const q=heldout.slice(offset+4000,offset+4000+LENGTH);
    assert.equal(p.length,LENGTH);
    assert.equal(q.length,LENGTH);
    const ca=new Uint8Array(LENGTH),cb=new Uint8Array(LENGTH);
    for(let i=0;i<LENGTH;i++){
      const key=Math.floor(rand()*MOD);
      ca[i]=mod(4*p[i]+key);
      cb[i]=mod(4*q[i]+key);
    }
    const sa=scrambleRows(ca,PATIENCE),sb=scrambleRows(cb,PATIENCE);
    const scrambled=Uint8Array.from(sa,(v,i)=>mod(22*(v-sb[i])));
    const known=Uint8Array.from(p,(v,i)=>mod(v-q[i]));
    const recovered=reorderRows(scrambled,PATIENCE);
    assert.deepEqual(recovered,known);
    const trueScore=score(recovered,log);
    let beat=0,mean=0;
    for(let t=0;t<250;t++){
      const order=[0,1,2,3,4,5,6,7];
      for(let j=7;j>0;j--){
        const pos=Math.floor(rand()*(j+1));
        [order[j],order[pos]]=[order[pos],order[j]];
      }
      const alternative=score(reorderRows(scrambled,order),log);
      beat+=alternative<=trueScore;
      mean+=alternative;
    }
    plantWins+=beat;
    comparisons+=250;
    plantTop5+=(beat>=238);
    advantages.push(trueScore-mean/250);
  }
  advantages.sort((a,b)=>a-b);
  return {
    model:'scaled source-pair differences, GP reference-based first-order difference-Markov likelihood',
    priorSelection:'pair 28/42 and scale 4 are previously postselected, PATIENCE is source-historical',
    trainRunes:train.length, heldoutRunes:heldout.length,
    sourceKey:PATIENCE, pair:[28,42], inputRunes:LENGTH,
    baselineScore:score(d,log), rowOrdering:rowRanking,
    columnOrdering:columnRanking, inverseColumnScore,
    onePageBeforePadCancellation: {
      rawMono:marginalScore(d,marginal), rawTransition:score(d,log),
      onlyPage28:onePageRanking(a.slice(0,LENGTH),b.slice(0,LENGTH),log,marginal,'A'),
      onlyPage42:onePageRanking(a.slice(0,LENGTH),b.slice(0,LENGTH),log,marginal,'B')
    },
    synthetic:{
      trials:60, randomOrdersPerTrial:250,
      exactSourceInversePassed:60,
      correctKeyBeatsRandomFraction:plantWins/comparisons,
      positiveTopFivePercentCases:plantTop5,
      medianTrueKeyAdvantageNats:advantages[30]
    },
    conclusion:'Source ordering is only top ~5.7% for within-row permutation; true-key source plants have partial power. No independent original plaintext/key. Columnar reading is weaker.'
  };
}
if(require.main===module) console.log(JSON.stringify(study(),null,2));
module.exports={differenceTransitionLogs,differenceMarginalLogs,reorderRows,scrambleRows,reorderColumns,score,exactColumnRanking,onePageRanking,study};
