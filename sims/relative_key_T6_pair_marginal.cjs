"use strict";
/**
 * Test the independently selected LP2 page28/42 scale-four shared-key
 * hypothesis with an EXACT emission-marginal T6 repair channel.
 *
 * For each i, a real T6-repaired published rune C admits X in {C,Cprev}
 * under the specified emission, and the hypothesized common additive pad
 * implies P28-P42=inv4*(X28-X42) mod29. Sum all 1..4 legal X-pairs
 * and all 29 P-pairs at each position; independent GP-English rune source
 * probabilities learned solely from Shakespeare [0,200000).
 * This is a unigram *necessary-condition screen*, not a full language model.
 *
 * Fixed image-independent page pair and scale were selected before this
 * test. Compare all 272 cyclic alignments, a T6-positive source control,
 * and an independent-pad negative source control under identical site gates.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {lp2Page,corpusWords}=require("./relative_key_english_probe.cjs");
const {encipher}=require("./lag6_repair_keyed_inverse.cjs");
const {words}=require("./outer_permutation_word_context.cjs");
const {plant}=require("./lag6_repair_contextual_inverse.cjs");
const solved=require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");

const M=29, Q=.81, INV4=22;
const MOD=x=>(x%M+M)%M;
const target=x=>MOD(24-2*x);

/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}

/** @param {{xs:number[],start:boolean[],end:boolean[]}} src */
function wordLengths(src){
  const sizes=[];
  let n=0;
  for(let i=0;i<src.xs.length;i++){
    if(src.start[i]&&n){sizes.push(n);n=0;}
    n++;
  }
  if(n)sizes.push(n);
  assert.equal(sizes.reduce((s,x)=>s+x,0),src.xs.length);
  return sizes;
}

/**
 * Exact channel-supported previous/current tentative rune candidates with
 * precomputed emission mass. Each position is conditional on real observed
 * prior published outputs, not the hypothesized key.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} record
 */
function options(record){
  const rows=[];
  let position=0;
  for(let i=0;i<record.xs.length;i++){
    if(record.start[i])position=0;
    else if(i)position++;
    const c=record.xs[i],previous=i?record.xs[i-1]:-1;
    const t=position>=6?target(record.xs[i-6]):-1;
    const unchanged=c===previous?(position>=6&&t===previous?1:1-Q):1;
    const row=[{x:c,mass:unchanged}];
    if(previous>=0&&c!==previous&&(position<6||c===t))
      row.push({x:previous,mass:position>=6?Q:Q/28});
    rows.push(row);
  }
  return rows;
}

/**
 * Sum source likelihood of two GP rune emissions subject to the exact
 * common-key scaled residue and both T6 channel branches.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} aa
 * @param {{xs:number[],start:boolean[],end:boolean[]}} bb
 * @param {number[]} prior
 */
function ranked(aa,bb,prior,from=0,to=Math.min(aa.xs.length,bb.xs.length),noRepair=false){
  const n=Math.min(aa.xs.length,bb.xs.length);
  const a=noRepair?aa.xs.map(x=>[{x,mass:1}]):options(aa);
  const b=noRepair?bb.xs.map(x=>[{x,mass:1}]):options(bb);
  const source=Array.from({length:M},(_,d)=>{
    let sum=0;
    for(let p=0;p<M;p++)sum+=prior[p]*prior[MOD(p-INV4*d)];
    return sum;
  });
  assert.ok(source.every(x=>x>0));
  const scoring=[];
  for(let phase=0;phase<bb.xs.length;phase++){
    let log=0,ambiguous=0;
    for(let i=from;i<to;i++){
      const j=(i+phase)%bb.xs.length;
      let evidence=0;
      for(const x of a[i])for(const y of b[j])
        evidence+=x.mass*y.mass*source[MOD(x.x-y.x)];
      assert.ok(evidence>0);
      log+=Math.log(evidence);
      if(a[i].length+b[j].length>2)ambiguous++;
    }
    scoring.push({phase,log,ambiguous});
  }
  scoring.sort((x,y)=>y.log-x.log);
  return {observed:scoring.find(x=>x.phase===0),rank:scoring.findIndex(x=>x.phase===0)+1,
    winner:scoring[0],second:scoring[1],median:scoring[Math.floor(scoring.length/2)],
    shifts:scoring.length};
}

/**
 * Encrypt heldout genuine GP-English under the exact hypothesized shared
 * scale-four pad and independent T6 output rewrites; physical page word
 * lengths are kept exactly, preserving original scanned text punctuation.
 * @param {ReturnType<typeof lp2Page>} layout
 * @param {number[][]} sourceWords
 * @param {number[]} pad
 * @param {number} seed
 */
function simulated(layout,sourceWords,pad,seed){
  const lengths=wordLengths(layout);
  const source=plant(sourceWords,lengths,seed).plaintext;
  const random=rng(seed+1);
  const plain=source.map(w=>w.map(c=>MOD(4*c)));
  const cipher=encipher(plain,pad.slice(0,layout.xs.length),random,Q);
  const xs=cipher.ciphertext.flat();
  assert.equal(xs.length,layout.xs.length);
  return {...layout,xs,source,rewrites:cipher.rewritten.filter(Boolean).length};
}
function run(){
  const input=fs.readFileSync(path.join(__dirname,"..","resources","control",
    "shakespeare_first300k.txt"),"utf8");
  const train=corpusWords(input.slice(0,200000)),heldout=words(input.slice(240000));
  const count=Array(M).fill(0.75);
  for(const w of train)for(const x of w)count[x]++;
  const total=count.reduce((a,b)=>a+b);
  const prior=count.map(x=>x/total);
  const aa=lp2Page(28),bb=lp2Page(42);
  assert.equal(aa.xs.length,269);assert.equal(bb.xs.length,272);
  const actual=ranked(aa,bb,prior);
  const actualFirst=ranked(aa,bb,prior,0,134);
  const actualSecond=ranked(aa,bb,prior,134,269);
  const flat=ranked(aa,bb,Array(M).fill(1/M));
  const direct=ranked(aa,bb,prior,0,269,true);
  const authenticCount=prior.map(x=>100*x);
  for(const symbol of solved.plaintext)authenticCount[symbol]++;
  const nAuthentic=authenticCount.reduce((a,b)=>a+b);
  const cicadaPrior=authenticCount.map(x=>x/nAuthentic);
  const cicada=ranked(aa,bb,cicadaPrior);
  const cicadaFirst=ranked(aa,bb,cicadaPrior,0,134);
  const cicadaSecond=ranked(aa,bb,cicadaPrior,134,269);
  const random=rng(0x394290);
  const pad=Array.from({length:272},()=>Math.floor(random()*M));
  const ca=simulated(aa,heldout,pad,0x394291);
  const cb=simulated(bb,heldout,pad,0x394292);
  const positive=ranked(ca,cb,prior);
  const positiveFirst=ranked(ca,cb,prior,0,134);
  const positiveSecond=ranked(ca,cb,prior,134,269);
  const badPad=Array.from({length:272},()=>Math.floor(random()*M));
  const other=simulated(bb,heldout,badPad,0x394293);
  const negative=ranked(ca,other,prior);
  const negativeFirst=ranked(ca,other,prior,0,134);
  const negativeSecond=ranked(ca,other,prior,134,269);
  return {status:"exploratory original scale-four LP2 pair test; no original key or plaintext recovered",
    originalPages:[28,42],nCompared:269,scale:4,
    source:"Shakespeare GP prior first200000 chars; synthetic last60000 independent",
    channel:"exact word-local T6 collision rewrite 81%, first six random different",
    model:"at each step exact marginal over all 1..4 candidate tentative symbol pairs and all 29 GP source pairs; prior per rune iid",
    actual,actualFirst,actualSecond,flatPrior:flat,directNoRepair:direct,
    cicadaPrior:{full:cicada,first:cicadaFirst,second:cicadaSecond},
    positive:{...positive,first:positiveFirst,second:positiveSecond,
      rewritesA:ca.rewrites,rewritesB:cb.rewrites},
    independentKeyNegative:{...negative,first:negativeFirst,second:negativeSecond},
    caveat:"Pages28/42 and scale4 were post-selected; 272-shift rank is within-pair only. Iid GP-rune source does not model word language."};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={wordLengths,options,ranked,run};
