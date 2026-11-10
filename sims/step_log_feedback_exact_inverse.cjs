"use strict";
/**
 * An EXACT original-LP2 cipher inverse, followed by source-language
 * prediction on unfitted ciphertext, for a two-tap autoregressive
 * discrete-logarithm GP29 output-step cipher.
 *
 * Let D_i=C_i-C_(i-1) mod29 and e_i=log_15(D_i) mod28 for D_i !=0.
 * When D_i=0, plaintext is fixed to the GP rune EA (index28).
 * Otherwise
 *   e_i=(P_i+a*ePrev+b*ePrev2+c) mod28
 * for a,b,c in Z28. The prior output-exponent history may reset on
 * word, section, physical page or book boundaries; zero steps may consume
 * a zero-valued state position or skip history update.
 *
 * All 28^2 feedback pairs and all 28 constant offsets are learned on
 * first four original source sections and frozen for the final four.
 * Decoding and re-encoding all available source ciphertext positions
 * is exact for any model, so a genuine discovery ALSO needs a linguistic
 * signal on the unused pages/sections, not just invertibility.
 *
 * This is different from a GP29 affine feedback on raw ciphertext,
 * a periodic additive pad, or the constant-key pure discrete-log map.
 * Node22 CommonJS, no external packages, all source data committed.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {makePrior}=require("./caesar_pad_spectral.cjs");
const {loadLexicon,sampleHeldout}=
  require("./word_period5_unknown_key_exact_inverse.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const RAW=read("resources/lp2-transcription.txt");
const CORPUS=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ALPHA=new Map(CORPUS.runes.map((v,i)=>[v,i]));
const WORDS=parseSharedCorpus().words.map(word=>[...word.runes].map(ch=>ALPHA.get(ch)));
const LONG=WORDS.flat(),N=LONG.length,M=28,RUNE_MOD=29;
assert.equal(N,12956);assert.equal(WORDS.length,2896);
const EXP=[],LOG=new Int8Array(29).fill(-1);
for(let i=0,x=1;i<M;i++,x=15*x%29){assert.equal(LOG[x],-1);EXP.push(x);LOG[x]=i;}
assert.equal(EXP.length,M);
const mod28=x=>(x%M+M)%M;
const mod29=x=>(x%RUNE_MOD+RUNE_MOD)%RUNE_MOD;
/** @param {number} seed */
function rng(seed){let v=seed>>>0;return()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;};}
const wordIdx=[],pageIdx=[],sectionIdx=[],original=[];
let section=0,page=0;
for(const chr of RAW.split("%").slice(0,55).join("%")){
  if(ALPHA.has(chr)){
    original.push(ALPHA.get(chr));pageIdx.push(page);sectionIdx.push(section);
  }else if(chr==="%")page++;
  else if(chr==="$")section++;
}
assert.deepEqual(original,LONG);
assert.equal(Math.max(...sectionIdx),7);
assert.equal(Math.max(...pageIdx),54);
for(let i=0;i<WORDS.length;i++)for(const _ of WORDS[i])wordIdx.push(i);
assert.equal(wordIdx.length,N);
const INFO=Array.from({length:N},(_,i)=>({
  section:sectionIdx[i],page:pageIdx[i],word:wordIdx[i]}));
const UNKNOWN=-2,ZERO=-1;
/**
 * Ciphertext logs with exact previous-printed-rune chaining. At the
 * first original glyph the preceding value is unknown: do not invent
 * a first plaintext symbol for that unobserved transition.
 * @param {number[]} ciphertext
 * @param {number} [before=-1]
 */
function getSteps(ciphertext,before=-1){
  assert.equal(ciphertext.length,N);
  const out=new Int8Array(N);
  let prev=before;
  for(let i=0;i<N;i++){
    out[i]=prev<0?UNKNOWN:LOG[mod29(ciphertext[i]-prev)];
    prev=ciphertext[i];
  }
  return out;
}
/**
 * @param {Int8Array} steps
 * @param {"book"|"page"|"section"|"word"} reset
 * @param {"skip"|"consume"} zeroPolicy
 * @returns {{a:Int8Array,b:Int8Array,valid:Uint8Array}}
 */
function historical(steps,reset,zeroPolicy){
  const h1=new Int8Array(N),h2=new Int8Array(N),valid=new Uint8Array(N);
  let last1=0,last2=0,former=-1;
  for(let i=0;i<N;i++){
    const group=reset==="book"?0:INFO[i][reset];
    if(i>0&&group!==former){last1=0;last2=0;}
    former=group;
    h1[i]=last1;h2[i]=last2;
    const e=steps[i];
    if(e>=0){last2=last1;last1=e;valid[i]=1;}
    else if(e===ZERO&&zeroPolicy==="consume"){last2=last1;last1=0;}
  }
  return {a:h1,b:h2,valid};
}
const refShakespeare=read("resources/control/shakespeare_first300k.txt");
const refCicada=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const x=line.trim();
    return !x.startsWith("#")&&!x.startsWith("[")&&!/^[0-9a-f]{25,}$/iu.test(x);
  }).join(" ");
const rawPrior=makePrior(refShakespeare.slice(0,240000));
const nativePrior=makePrior(refCicada);
function mixPrior(sourceRatio){
  const pri=Array.from({length:M},(_,i)=>
    (1-sourceRatio)*rawPrior[i]+sourceRatio*nativePrior[i]);
  let sum=0;for(const p of pri)sum+=p;
  return Float64Array.from(pri,p=>Math.log(p/sum));
}
const LOG_PRIOR=mixPrior(.25);
const UNIFORM_LOG_PRIOR=LOG_PRIOR.reduce((s,x)=>s+x,0)/M;
const SOURCE_ENTROPY=-Math.log(M);
/**
 * @param {Int8Array} steps
 * @param {ReturnType<typeof historical>} hist
 * @param {boolean} onlyTraining
 * @param {number} a
 * @param {number} b
 */
function histogram(steps,hist,onlyTraining,a,b){
  const counts=new Uint32Array(M);
  let valid=0;
  for(let i=0;i<N;i++){
    if((INFO[i].section<4)!==onlyTraining)continue;
    const e=steps[i];
    if(e<0)continue;
    const p=mod28(e-a*hist.a[i]-b*hist.b[i]);
    counts[p]++;valid++;
  }
  return {counts,valid};
}
/** @param {Uint32Array} counts @param {Float64Array} prior @param {number} phase */
function score(counts,prior,phase){
  let s=0;for(let x=0;x<M;x++)s+=counts[x]*prior[mod28(x-phase)];
  return s;
}
/**
 * @param {number[]} printed
 * @param {Float64Array} [prior]
 * @returns {object}
 */
function fit(printed,prior=LOG_PRIOR){
  const e=getSteps(printed),out=[];
  for(const reset of ["book","page","section","word"])
    for(const zeroPolicy of ["skip","consume"]){
      const h=historical(e,reset,zeroPolicy);
      let best=null;
      for(let a=0;a<M;a++)for(let b=0;b<M;b++){
        const training=histogram(e,h,true,a,b);
        let highest=-Infinity,phase=-1;
        for(let c=0;c<M;c++){
          const candidate=score(training.counts,prior,c);
          if(candidate>highest){highest=candidate;phase=c;}
        }
        if(best===null||highest>best.trainLogTotal){
          const hold=histogram(e,h,false,a,b);
          best={reset,zeroPolicy,a,b,c:phase,
            trainLogTotal:highest,
            trainPerRune:highest/training.valid,
            heldoutPerRune:score(hold.counts,prior,phase)/hold.valid,
            trainCount:training.valid,heldoutCount:hold.valid};
        }
      }
      out.push(best);
    }
  return out.sort((x,y)=>y.trainPerRune-x.trainPerRune);
}
/**
 * Exactly decrypt all original positions using fully specified parameters
 * learned in the training set. EA is identified by zero delta. At index0
 * an unknown previous published rune leaves the plaintext indeterminate.
 *
 * @param {number[]} printed
 * @param {{reset:string,zeroPolicy:string,a:number,b:number,c:number}} selected
 * @param {number} [before=-1]
 */
function decode(printed,selected,before=-1){
  const steps=getSteps(printed,before),h=historical(steps,selected.reset,selected.zeroPolicy);
  const plain=Array(N).fill(null);
  for(let i=0;i<N;i++){
    const e=steps[i];
    if(e===ZERO)plain[i]=28;
    else if(e>=0)plain[i]=mod28(e-selected.a*h.a[i]-
      selected.b*h.b[i]-selected.c);
  }
  return plain;
}
/**
 * Actual forward encryption of the proposed cipher. For original LP2,
 * the first symbol is treated as the printed IV and repeated; only
 * indices 1..N-1 are re-encoded. For planted plaintext, before=8
 * enciphers all symbols from the known initial output state.
 *
 * @param {(number|null)[]} plain
 * @param {{reset:string,zeroPolicy:string,a:number,b:number,c:number}} settings
 * @param {{before:number,skipFirst:boolean}} config
 */
function encode(plain,settings,config){
  let lastOutput=config.before,old1=0,old2=0,prevGroup=-1;
  const output=[];
  for(let i=0;i<N;i++){
    const group=settings.reset==="book"?0:INFO[i][settings.reset];
    if(i>0&&group!==prevGroup){old1=0;old2=0;}
    prevGroup=group;
    if(i===0&&config.skipFirst){
      output.push(lastOutput);
      continue;
    }
    const p=plain[i];
    assert.ok(Number.isInteger(p)&&p>=0&&p<=28);
    if(p===28){
      output.push(lastOutput);
      if(settings.zeroPolicy==="consume"){old2=old1;old1=0;}
      continue;
    }
    const e=mod28(p+settings.a*old1+settings.b*old2+settings.c);
    lastOutput=mod29(lastOutput+EXP[e]);
    output.push(lastOutput);
    old2=old1;old1=e;
  }
  return output;
}
/**
 * @param {number} [nullTrials=24]
 */
function run(nullTrials=24){
  const actual=fit(original),winner=actual[0];
  const guess=decode(original,winner);
  assert.equal(guess.length,N);assert.equal(guess[0],null);
  const replay=encode(guess,winner,{before:original[0],skipFirst:true});
  assert.deepEqual(replay,original);
  const posWords=sampleHeldout(loadLexicon(),rng(0x3f291715)).plaintext;
  assert.equal(posWords.flat().length,N);
  const plantedPlain=posWords.flat();
  const truth={a:15,b:22,c:7,reset:"word",zeroPolicy:"skip"};
  const planted=encode(plantedPlain,truth,{before:8,skipFirst:false});
  const blind=fit(planted);
  const plantedTop=blind[0],bestActual=blind.find(x=>
    x.reset===truth.reset&&x.zeroPolicy===truth.zeroPolicy);
  const exactlyDecoded=decode(planted,truth,8);
  assert.deepEqual(exactlyDecoded,plantedPlain);
  assert.deepEqual(encode(exactlyDecoded,truth,{before:8,skipFirst:false}),planted);
  const fullRecovered=bestActual.a===truth.a&&bestActual.b===truth.b&&bestActual.c===truth.c;
  assert.ok(fullRecovered,"Synthetic true feedback coefficients are not recovered");
  const unaltered=original.slice(),nullResults=[],r=rng(0x29282215);
  // Preserve every zero marker, source section and original 28-step inventory
  // inside each section. Independently permute nonzero log steps, then
  // regenerate a valid source-shaped published ciphertext.
  const srcSteps=getSteps(original);
  const bySection=Array.from({length:8},()=>[]);
  for(let i=1;i<N;i++)if(srcSteps[i]>=0)bySection[INFO[i].section].push(i);
  for(let trial=0;trial<nullTrials;trial++){
    const shuffled=Int8Array.from(srcSteps);
    for(const group of bySection){
      const pool=group.map(i=>srcSteps[i]);
      for(let j=pool.length-1;j>0;j--){
        const k=r()%(j+1);
        [pool[j],pool[k]]=[pool[k],pool[j]];
      }
      group.forEach((i,j)=>{shuffled[i]=pool[j];});
    }
    const sample=[unaltered[0]];
    for(let i=1;i<N;i++){
      const x=shuffled[i];
      sample.push(x===ZERO?sample.at(-1):mod29(sample.at(-1)+EXP[x]));
    }
    const attempt=fit(sample);
    nullResults.push({bestTraining:attempt[0].trainPerRune,
      selectedHeldout:attempt[0].heldoutPerRune});
  }
  return {
    cipher:"log_15(C_i-C_(i-1) mod29) = P_i + a*e_(i-1) + b*e_(i-2) + c (mod28), with EA as zero-step",
    source:{pages:55,words:WORDS.length,runes:N,
      originalTranscriptSha256:crypto.createHash("sha256").update(RAW).digest("hex"),
      trainingSource:"first240k Shakespeare characters blended 75% with solved Cicada author prose 25%",
      priorLogMeanUniform:UNIFORM_LOG_PRIOR,
      markerOriginal:srcSteps.filter(x=>x===ZERO).length},
    settings:{feedbackPairs:784,offsets:28,resetModes:4,zeroHistoryModes:2,
      learned:"Original sections 0..3",heldout:"Original sections 4..7"},
    actual:{allModes:actual,topOriginal:{...winner,
      firstUnfittedGPTranslit:guess.filter((x,i)=>INFO[i].section>=4).slice(0,100)
        .map(x=>CORPUS.translit[x]).join("")},
      exactOriginalForwardRoundTrip:N-1},
    positive:{sourceRgg:"source-matched heldout GP-English words under exact original source word-length layout",
      planted:truth,blindBest:plantedTop,correctModeBest:bestActual,
      originalTrueCoefficientsRecovered:fullRecovered,
      entireSourceRecovered:exactlyDecoded.length,
      exactReenciphered:planted.length},
    null:{
      trials:nullTrials,seed:"0x29282215",
      meanHeldout:nullResults.reduce((s,x)=>s+x.selectedHeldout,0)/nullResults.length,
      minHeldout:Math.min(...nullResults.map(x=>x.selectedHeldout)),
      maxHeldout:Math.max(...nullResults.map(x=>x.selectedHeldout)),
      trainSelectedHeldoutOriginalUpperTail:
        (1+nullResults.filter(x=>x.selectedHeldout>=winner.heldoutPerRune).length)/(nullTrials+1),
      detail:nullResults
    },
    verdict:"Exact decryption with frozen state plus untrained original GP-language scoring; raw forward roundtrip is necessary but not sufficient for a genuine original key."
  };
}
if(require.main===module)
  console.log(JSON.stringify(run(Number(process.argv[2]||24)),null,2));
module.exports={getSteps,historical,fit,decode,encode,run};
