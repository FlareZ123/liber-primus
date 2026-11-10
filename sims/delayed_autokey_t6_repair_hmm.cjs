"use strict";
/**
 * Exact finite hidden-Markov inversion of LP2 delayed GP29 plaintext autokey
 * under the manuscript-motivated six-back affine collision rewrite.
 *
 * Tentative X_i=(P_i+a*P_(i-L)) mod29 after an unrestricted L-rune IV.
 * If X_i equals prior PUBLISHED C_(i-1), with probability q=0.81 emit
 * T(C_(i-6))=(24-2*C_(i-6)) mod29 when i>=6 within the ORIGINAL complete
 * rune word; otherwise emit one of the other 28 runes uniformly.
 * This exact sum-product and Viterbi inference integrates both possible
 * tentative-source values, without picking convenient overwrite locations.
 *
 * Independent training Shakespeare first240k chars; heldout last60k.
 * 12 lags x28 nonzero coefficients x3 resets = 1008 original models;
 * controls planted using the actual word-local, printed-cipher T6 rule.
 *
 * Note: T6 is a source-motivated HYPOTHESIS, not a proven LP2 cipher rule.
 * Node 22, CommonJS, built-in packages only, no files written.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {encode}=require("./delayed_plaintext_autokey_hmm.cjs");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");

const ROOT=path.resolve(__dirname,".."), M=29, Q=.81,MAX_LAG=12;
const corpusText=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"));
const corpus=JSON.parse(corpusText);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
const flat=pages.flat(), wordCorpus=parseSharedCorpus();
const offsets=wordCorpus.words.flatMap(w=>Array.from({length:[...w.runes].length},(_,j)=>j));
assert.equal(flat.length,12956);
assert.equal(wordCorpus.words.length,2896);
assert.equal(wordCorpus.crossPageWords,32);
assert.equal(offsets.length,12956);
const map=new Map(corpus.runes.map((g,i)=>[g,i]));
assert.deepEqual(wordCorpus.words.flatMap(w=>[...w.runes].map(c=>map.get(c))),flat);
const sectionLengths=[729,1145,1729,9,1894,1021,1524,1589,3316];
const mod=x=>(x%M+M)%M;
const T=x=>mod(24-2*x);
function targets(cipher){
  assert.equal(cipher.length,offsets.length);
  return offsets.map((k,i)=>k>=6?T(cipher[i-6]):-1);
}
const realTargets=targets(flat);
/**
 * @param {number[]} lengths
 * @param {number[]} cipher
 * @param {number[]} target
 */
function units(lengths,cipher,target){
  let at=0;
  const result=lengths.map(length=>{
    const item={c:cipher.slice(at,at+length),t:target.slice(at,at+length)};
    at+=length;
    return item;
  });
  assert.equal(at,cipher.length);
  return result;
}
const scopes={
  page:pages.map(p=>p.length),
  section:sectionLengths,
  continuous:[flat.length]
};
const english=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const train=encode(english.slice(0,240000)),held=encode(english.slice(240000));
const prior=Float64Array.from({length:M},()=>.5);
for(const x of train)prior[x]++;
const normalization=prior.reduce((a,b)=>a+b,0);
for(let i=0;i<M;i++)prior[i]/=normalization;
const logPrior=Array.from(prior,Math.log);
function randomizer(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/**
 * An exact emission probability for the candidate raw output x.
 * T6 target=-1 means within-word offset less than six.
 * @param {number} x
 * @param {number} output
 * @param {number} prev
 * @param {number} target
 */
function emission(x,output,prev,target){
  if(x!==prev)return Number(x===output);
  if(target<0){
    return output===prev?1-Q:Q/28;
  }
  if(target===prev)return Number(output===prev);
  return output===prev?1-Q:output===target?Q:0;
}
/**
 * The observable iid-uniform tentative-rune baseline is calculated using
 * the same known six-apart target and the same collision approval law.
 * @param {number} output
 * @param {number} previous
 * @param {number} target
 */
function nullProbability(output,previous,target){
  if(target<0)return (output===previous?1-Q:1+Q/28)/M;
  if(target===previous)return 1/M;
  return (output===previous?1-Q:output===target?1+Q:1)/M;
}
/**
 * Exact 29-state sum-product HMM, one independent lane per delayed lag.
 * @param {{c:number[],t:number[]}[]} input
 * @param {number} lag
 * @param {number} a
 */
function marginal(input,lag,a){
  let ll=0,nullLL=0,n=0,observedEcho=0,observedDoublet=0;
  for(const u of input)for(let lane=0;lane<Math.min(lag,u.c.length);lane++){
    let state=Float64Array.from(prior);
    for(let j=lane+lag;j<u.c.length;j+=lag){
      const output=u.c[j],previous=u.c[j-1],target=u.t[j];
      const next=new Float64Array(M);
      if(output===previous)observedDoublet++;
      if(target>=0&&output===target)observedEcho++;
      for(let old=0;old<M;old++){
        const literal=mod(output-a*old);
        const literalWeight=output===previous?(target===previous?1:1-Q):1;
        next[literal]+=state[old]*prior[literal]*literalWeight;
        const rewriteWeight=output!==previous?
          target<0?Q/28:output===target?Q:0:0;
        if(rewriteWeight>0){
          const alternative=mod(previous-a*old);
          next[alternative]+=state[old]*prior[alternative]*rewriteWeight;
        }
      }
      let z=0;
      for(const x of next)z+=x;
      assert.ok(z>0);
      ll+=Math.log(z);
      nullLL+=Math.log(nullProbability(output,previous,target));
      for(let i=0;i<M;i++)next[i]/=z;
      state=next;
      n++;
    }
  }
  return {lag,a,n,observedEcho,observedDoublet,
    modelLogPerRune:ll/n,nullLogPerRune:nullLL/n,
    gainPerRune:(ll-nullLL)/n};
}
function scan(input){
  const ranked=[];
  for(let lag=1;lag<=MAX_LAG;lag++)for(let a=1;a<M;a++)
    ranked.push(marginal(input,lag,a));
  assert.equal(ranked.length,336);
  return ranked.sort((x,y)=>y.gainPerRune-x.gainPerRune);
}
/**
 * Exact Viterbi MAP path and collision-emission consistency.
 * @param {{c:number[],t:number[]}} u
 * @param {number} lag
 * @param {number} a
 */
function viterbi(u,lag,a){
  const plain=new Array(u.c.length),repaired=new Array(u.c.length).fill(false);
  let consistency=0;
  for(let lane=0;lane<Math.min(lag,u.c.length);lane++){
    const steps=Math.ceil((u.c.length-lane)/lag);
    let prev=Float64Array.from(logPrior);
    const traces=new Array(steps);
    for(let step=1;step<steps;step++){
      const j=lane+step*lag,output=u.c[j],older=u.c[j-1],target=u.t[j];
      const best=new Float64Array(M).fill(-Infinity),parent=new Int8Array(M),masks=new Uint8Array(M);
      for(let p0=0;p0<M;p0++)for(const repair of [false,true]){
        const outputCandidate=repair?older:output;
        const w=emission(outputCandidate,output,older,target);
        if(w<=0||(!repair&&outputCandidate===older&&output!==older))continue;
        if(repair&&(output===older||outputCandidate!==older))continue;
        const p1=mod(outputCandidate-a*p0);
        const weight=prev[p0]+logPrior[p1]+Math.log(w);
        if(weight>best[p1]){
          best[p1]=weight;parent[p1]=p0;masks[p1]=Number(repair);
        }
      }
      traces[step]={parent,masks};
      const largest=Math.max(...best);
      assert.ok(Number.isFinite(largest));
      for(let k=0;k<M;k++)best[k]-=largest;
      prev=best;
    }
    let state=prev.indexOf(Math.max(...prev));
    for(let step=steps-1;step>=0;step--){
      const j=lane+step*lag;
      plain[j]=state;
      if(step){
        repaired[j]=Boolean(traces[step].masks[state]);
        state=traces[step].parent[state];
      }
    }
  }
  for(let j=lag;j<u.c.length;j++){
    const tentative=mod(plain[j]+a*plain[j-lag]);
    const weight=emission(tentative,u.c[j],u.c[j-1],u.t[j]);
    assert.ok(weight>0,"Decoded path must forward publish original ciphertext");
    if(repaired[j])assert.equal(tentative,u.c[j-1]);
    consistency++;
  }
  return {plain,repaired,consistency};
}
function decipher(input,lag,a){
  const all=input.map(u=>viterbi(u,lag,a));
  return {plain:all.flatMap(x=>x.plain),
    effectiveRewrites:all.reduce((n,x)=>n+x.repaired.filter(Boolean).length,0),
    positionsConfirmed:all.reduce((n,x)=>n+x.consistency,0)};
}
/**
 * Original-matched T6 forward encoding of independent heldout Shakespeare.
 * Makes the target from PUBLISHED synthetic preceding C and original word
 * offsets, including when a complete rune word crosses a physical page.
 * @param {number[]} lengths
 * @param {number} lag
 * @param {number} a
 * @param {number} seed
 */
function plant(lengths,lag,a,seed){
  const random=randomizer(seed),cipher=[],plaintext=[],flags=[];
  const published=[],knownStart=[];
  let repairs=0,unrepaired=0,total=0;
  for(const length of lengths){
    const at=Math.floor(random()*(held.length-length));
    const source=held.slice(at,at+length),c=[],masked=[];
    for(let j=0;j<length;j++){
      const globalIndex=published.length,wordOffset=offsets[globalIndex];
      let value=j<lag?Math.floor(M*random()):mod(source[j]+a*source[j-lag]);
      const previous=published.at(-1);
      let changed=false;
      if(j>=lag &&value===previous){
        if(random()<Q){
          if(wordOffset>=6)value=T(published[globalIndex-6]);
          else{
            const rank=Math.floor(28*random());
            value=rank>=previous?rank+1:rank;
          }
          changed=value!==previous;
          if(changed)repairs++;
        }else unrepaired++;
      }
      masked.push(changed);
      c.push(value);
      published.push(value);
      total++;
    }
    plaintext.push(source);
    flags.push(masked);
    cipher.push(c);
  }
  assert.equal(total,12956);
  for(let unit=0;unit<lengths.length;unit++)
    for(let j=lag;j<lengths[unit];j++){
      const u=plaintext[unit],c=cipher[unit],prev=cipher[unit][j-1];
      const previousGlobal=lengths.slice(0,unit).reduce((a,b)=>a+b,0)+j;
      const target=offsets[previousGlobal]>=6?T(published[previousGlobal-6]):-1;
      assert.ok(emission(mod(u[j]+a*u[j-lag]),c[j],prev,target)>0);
    }
  return {plaintext,cipher,flags,repairs,unrepaired};
}
function run(){
  const original={};
  for(const [name,lengths]of Object.entries(scopes)){
    const observed=units(lengths,flat,realTargets);
    const ranking=scan(observed),best=ranking[0];
    const candidate=decipher(observed,best.lag,best.a);
    original[name]={bestFive:ranking.slice(0,5),
      worst:ranking.at(-1),all336GainsNegative:ranking.every(x=>x.gainPerRune<0),
      candidateCount:ranking.length,
      bestExactPathPositions:candidate.positionsConfirmed,
      bestMAPEffectiveRewrites:candidate.effectiveRewrites,
      bestMAPFirst40Glyphs:candidate.plain.slice(0,40).map(x=>corpus.translit[x]).join(" ")};
  }
  const layout=scopes.page;
  const planted=plant(layout,5,17,0x5a63a120);
  const plantCipher=planted.cipher.flat();
  const plantUnits=units(layout,plantCipher,targets(plantCipher));
  const plantRanked=scan(plantUnits);
  const truthRank=1+plantRanked.filter(x=>x.gainPerRune>marginal(plantUnits,5,17).gainPerRune).length;
  assert.equal(truthRank,1);
  assert.ok(plantRanked[0].gainPerRune>.1);
  const recovered=decipher(plantUnits,5,17),expected=planted.plaintext.flat();
  const correct=expected.reduce((s,x,i)=>s+Number(x===recovered.plain[i]),0);
  const result={
    model:"exact GP29 delayed plaintext-autokey plus manuscript-derived word-local T6 collision repair",
    corpusSha256:crypto.createHash("sha256").update(corpusText).digest("hex"),
    scopeLengths:scopes,originalRunes:flat.length,
    sourceGP:{trainRunes:train.length,heldoutRunes:held.length},
    q:Q,sweeps:1008,original,
    positive:{lag:5,a:17,seed:"0x5a63a120",truthRank,
      emissionRepairs:planted.repairs,unrepaired:planted.unrepaired,
      top:plantRanked[0],second:plantRanked[1],
      viterbiPlaintextAccuracy:correct/expected.length,
      viterbiExactForwardPositions:recovered.positionsConfirmed}
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module)run();
module.exports={T,targets,emission,nullProbability,marginal,scan,viterbi,plant,run};
