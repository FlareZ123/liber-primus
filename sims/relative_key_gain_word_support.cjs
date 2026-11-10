"use strict";

/**
 * Exact dictionary-word feasibility for the strongest affine-gain LP2
 * page-pair candidates. The gain/center candidates are frozen from the
 * symmetry scan before any dictionary tests; do not fit these on language
 * scores.
 *
 * Cipher model:
 *   C_A[i] = P_A[i] + K[i] + center (mod 29)
 *   C_B[i] = inv(gain)*(P_B[i] + K[i]) (mod 29)
 *   => P_A[i] - P_B[i] = C_A[i] - gain*C_B[i] - center.
 *
 * The equation must hold for EVERY overlapped rune where both plaintexts
 * are complete English words. A true shared pad supplies a single exact
 * candidate pair for each word overlap before rewriting; planted controls
 * measure how many survive realistic lexical mismatch and sparse rewrites.
 *
 * Node.js 22 CJS; node sims/relative_key_gain_word_support.cjs --trials 150
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encode,pageWords} = require("./relative_key_word_overlap.cjs");
const ROOT = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const shakespeare = fs.readFileSync(
  path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const MOD=29;
const mod=x=>(x%MOD+MOD)%MOD;

/** Candidate order fixed by original gain-symmetry statistic. */
const candidates=[
  {a:28,b:42,gain:1,center:0,score:65.20074349442378},
  {a:2,b:31,gain:19,center:2,score:62.66915422885573},
  {a:18,b:48,gain:6,center:23,score:56.71346153846154},
  {a:16,b:28,gain:13,center:19,score:48.85018726591759},
  {a:28,b:31,gain:23,center:24,score:45.7955390334572},
  {a:24,b:31,gain:24,center:6,score:45.09479553903344}
];

/** @param {string} source @param {boolean} unique */
function lexicon(source,unique) {
  const byLen=new Map();
  for(const token of source.match(/[A-Za-z]+/g)||[]) {
    const word=encode(token);
    const length=word.length;
    if(!byLen.has(length))byLen.set(length,unique?new Map():[]);
    const group=byLen.get(length);
    if(unique)group.set(word.join(","),word);
    else group.push(word);
  }
  return new Map([...byLen].map(([length,v])=>[
    length,unique?[...v.values()]:v
  ]));
}
const train=lexicon(shakespeare.slice(0,240000),true);
const holdout=lexicon(shakespeare.slice(240000),false);

/**
 * @param {ReturnType<typeof pageWords>} a
 * @param {ReturnType<typeof pageWords>} b
 */
function makeOverlaps(a,b) {
  const out=[];
  for(const x of a.spans)for(const y of b.spans) {
    const start=Math.max(x.start,y.start);
    const size=Math.min(x.end,y.end)-start;
    if(size<4)continue;
    const left=(train.get(x.len)||[]).map(w=>
      w.slice(start-x.start,start-x.start+size));
    const right=new Set((train.get(y.len)||[]).map(w=>
      w.slice(start-y.start,start-y.start+size).join(",")));
    out.push({start,size,left,right});
  }
  return out;
}

/**
 * @param {number[]} d
 * @param {ReturnType<typeof makeOverlaps>} overlaps
 */
function support(d,overlaps) {
  const hit=[],sizes=[];
  for(const overlap of overlaps) {
    const {start,size,left,right}=overlap;
    sizes.push(size);
    let possible=false;
    for(const text of left) {
      const other=text.map((v,i)=>mod(v-d[start+i])).join(",");
      if(right.has(other)){possible=true;break;}
    }
    hit.push(possible);
  }
  return {
    total:hit.length,
    supported:hit.filter(Boolean).length,
    eligibleAtLeast5:sizes.filter(v=>v>=5).length,
    supportedAtLeast5:hit.filter((v,i)=>v&&sizes[i]>=5).length,
    supportedSizes:hit.flatMap((v,i)=>v?[sizes[i]]:[])
  };
}

/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/** @param {number[][]} template @param {()=>number} random */
function sampleWords(template,random){
  const out=[];
  for(const word of template) {
    const pool=holdout.get(word.length);
    assert(pool&&pool.length,"no heldout reference for rune word length "+word.length);
    const chosen=pool[random()%pool.length];
    out.push(...chosen);
  }
  return out;
}

/** @param {number[]} symbols @param {()=>number} random @param {number} chance */
function rewriteDoublets(symbols,random,chance){
  let rewrites=0;
  for(let i=1;i<symbols.length;i++){
    if(symbols[i]===symbols[i-1] && random()%1000 < chance*1000){
      symbols[i]=(symbols[i]+1+random()%28)%29;
      rewrites++;
    }
  }
  return rewrites;
}

/**
 * @param {ReturnType<typeof pageWords>} a
 * @param {ReturnType<typeof pageWords>} b
 * @param {{gain:number,center:number}} c
 * @param {()=>number} random
 */
function plant(a,b,c,random) {
  const P=sampleWords(a.words,random),Q=sampleWords(b.words,random);
  let inverse=0;
  for(let x=1;x<MOD;x++)if(mod(x*c.gain)===1)inverse=x;
  assert(inverse);
  const C=[],D=[];
  for(let i=0;i<Math.max(P.length,Q.length);i++){
    const K=random()%MOD;
    if(i<P.length)C.push(mod(P[i]+K+c.center));
    if(i<Q.length)D.push(mod(inverse*(Q[i]+K)));
    if(i<P.length && i<Q.length)
      assert.equal(mod(C[i]-c.gain*D[i]-c.center),mod(P[i]-Q[i]));
  }
  const repaired=rewriteDoublets(C,random,.81)+
    rewriteDoublets(D,random,.81);
  return {a:C,b:D,repaired};
}

/**
 * @param {{a:number,b:number,gain:number,center:number,score:number}} c
 * @param {number} trials
 */
function runCandidate(c,trials){
  const wa=pageWords(c.a),wb=pageWords(c.b);
  const a=corpus.pages.find(p=>p.page===c.a).indices;
  const b=corpus.pages.find(p=>p.page===c.b).indices;
  const diff=a.slice(0,Math.min(a.length,b.length))
    .map((v,i)=>mod(v-c.gain*b[i]-c.center));
  const overlaps=makeOverlaps(wa,wb);
  const observed=support(diff,overlaps);
  const random=rng(0x33010000 ^ c.a*4099 ^ c.b*17 ^ c.gain);
  const controls=[];
  for(let t=0;t<trials;t++){
    const p=plant(wa,wb,c,random);
    const d=p.a.slice(0,diff.length)
      .map((v,i)=>mod(v-c.gain*p.b[i]-c.center));
    controls.push({...support(d,overlaps),repaired:p.repaired});
  }
  return {...c,observed,
    planted:{
      trials,
      model:"heldout Shakespeare words matched to exact source word lengths; shared pad, gain, center and 81% overwrite of adjacent equal output runes",
      meanSupported:controls.reduce((s,x)=>s+x.supported,0)/trials,
      minSupported:Math.min(...controls.map(x=>x.supported)),
      maxSupported:Math.max(...controls.map(x=>x.supported)),
      atMostObserved:controls.filter(x=>x.supported<=observed.supported).length,
      upperLowerTail:(1+controls.filter(x=>x.supported<=observed.supported).length)/(trials+1),
      meanAtLeast5:controls.reduce((s,x)=>s+x.supportedAtLeast5,0)/trials,
      atMostObservedAtLeast5:controls.filter(x=>x.supportedAtLeast5<=observed.supportedAtLeast5).length,
      meanRepaired:controls.reduce((s,x)=>s+x.repaired,0)/trials
    }};
}

function main(){
  const i=process.argv.indexOf("--trials");
  const trials=i<0?150:Number(process.argv[i+1]);
  assert(Number.isSafeInteger(trials)&&trials>0&&trials<=2000);
  const rows=candidates.map(c=>runCandidate(c,trials));
  assert.equal(rows[0].observed.total,24);
  assert.equal(rows[1].observed.total,15);
  process.stdout.write(JSON.stringify({
    source:"canonical LP2 cipher, physical word boundaries, disjoint Shakespeare GP-encoded lexicon",
    trainingWords:[...train.values()].reduce((s,x)=>s+x.length,0),
    candidatesFrozenFrom:"sims/relative_key_gain_scan.cjs, original symmetry scores",
    rows,
    caveat:"No true LP2 plaintext or key. Positive controls depend on Shakespeare word-length-matched register; dictionary coincidences at overlap length4 alone are not verified plaintext."
  },null,2)+"\n");
}
if(require.main===module)main();
module.exports={lexicon,makeOverlaps,support,runCandidate};
