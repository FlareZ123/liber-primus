"use strict";
/**
 * Exact local inverse of the hypothetical LP2 collision-T overwrite layer
 * WHEN its additive keystream is already known.
 *
 * Every output rune has at most two possible tentative input runes: itself,
 * or the preceding *published* output rune, since a rewrite fires only when
 * the tentative output was an adjacent collision. Posterior weights use
 * the exact encryption likelihood and an independently trained GP-English
 * word-position prior. This proves candidate-set completeness, not an LP2 key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {words,flatten,category,training}=require("./outer_permutation_word_context.cjs");
const mod=x=>(x%29+29)%29;
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/**
 * @param {number[][]} plaintext
 * @param {number[]} pad
 * @param {()=>number} rand
 * @param {number} q
 */
function encipher(plaintext,pad,rand,q){
  const output=[],rewritten=[];
  let last=-1,offset=0;
  for(const word of plaintext){
    const out=[];
    for(let j=0;j<word.length;j++){
      const candidate=mod(word[j]+pad[offset]);
      let value=candidate,rewrite=false;
      if(last===candidate&&rand()<q){
        value=j>=6?mod(24-2*out[j-6]):mod(candidate+1+Math.floor(28*rand()));
        rewrite=true;
      }
      out.push(value);last=value;rewritten.push(rewrite);offset++;
    }
    output.push(out);
  }
  assert.equal(offset,pad.length);
  return {ciphertext:output,rewritten};
}
/**
 * Exhaustive two-candidate inverse at each position conditional on known key.
 * @param {number[][]} cipher
 * @param {number[]} pad
 * @param {ReturnType<typeof training>} lang
 * @param {number} q
 */
function decipher(cipher,pad,lang,q){
  const decoded=[],bare=[],ambiguity=[];
  let prev=-1,offset=0;
  for(const w of cipher){
    const wordsOut=[],wordsBare=[];
    for(let j=0;j<w.length;j++){
      const c=w[j],same=c===prev,t=j>=6?mod(24-2*w[j-6]):-1;
      const p0=mod(c-pad[offset]);
      const lp=lang.logProb[category(w.length,j)]||lang.prior.map(Math.log);
      let best=p0,choice="literal",p1=null,logRatio=null;
      const literalLikelihood=same?(j>=6&&t===prev?1:1-q):1;
      if(prev>=0&&!same&&(j<6||c===t)){
        p1=mod(prev-pad[offset]);
        const rewriteLikelihood=j>=6?q:q/28;
        logRatio=lp[p1]+Math.log(rewriteLikelihood)-lp[p0]-Math.log(literalLikelihood);
        if(logRatio>0){best=p1;choice="rewrite";}
      }
      wordsOut.push(best);wordsBare.push(p0);
      ambiguity.push({offset,j,possible:1+Number(p1!==null),choice,logRatio});
      prev=c;offset++;
    }
    decoded.push(wordsOut);bare.push(wordsBare);
  }
  assert.equal(offset,pad.length);
  return {decoded,bare,ambiguity};
}
function run(){
  const original=fs.readFileSync(path.join(__dirname,"..","resources/control/shakespeare_first300k.txt"),"utf8");
  const trainWords=words(original.slice(0,240000));
  const heldout=words(original.slice(240000));
  const model=training(flatten(trainWords));
  const bins=Array.from({length:30},()=>[]);
  for(const w of heldout)if(w.length<30)bins[w.length].push(w);
  const lengths=parseSharedCorpus().words.map(w=>w.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
  const holdoutStream=heldout.flat(),rand=rng(0x391165);
  let fallbackWords=0;
  const source=lengths.map(n=>{
    const bin=bins[n];
    if(bin&&bin.length)return bin[Math.floor(rand()*bin.length)];
    fallbackWords++;
    const offset=Math.floor(rand()*(holdoutStream.length-n));
    return holdoutStream.slice(offset,offset+n);
  });
  const pad=Array.from({length:12956},()=>Math.floor(rand()*29));
  const planted=encipher(source,pad,rand,.81);
  const recovered=decipher(planted.ciphertext,pad,model,.81);
  const sourceFlat=source.flat(),pred=recovered.decoded.flat(),naive=recovered.bare.flat();
  let naiveCorrect=0,finalCorrect=0,originalWithinCandidates=0,rewriteTotal=0,
      rewriteRecovered=0,needsTwo=0,selectedRewrite=0;
  for(let i=0;i<sourceFlat.length;i++){
    const p=sourceFlat[i],record=recovered.ambiguity[i];
    if(naive[i]===p)naiveCorrect++;
    if(pred[i]===p)finalCorrect++;
    if(record.possible===2)needsTwo++;
    if(record.choice==="rewrite")selectedRewrite++;
    if(record.possible===2&&planted.rewritten[i])rewriteRecovered++;
    if(planted.rewritten[i])rewriteTotal++;
    if(pred[i]===p||naive[i]===p||record.possible===2)originalWithinCandidates++;
  }
  assert.equal(originalWithinCandidates,12956,"Every true GP rune must be in the exact inverse candidate set");
  return {source:"GP-English heldout Shakespeare source words matched to 2,896 exact LP2 word lengths",
    seed:"0x391165",runes:12956,words:lengths.length,fallbackWords,
    sourceTraining:"First 240,000 Shakespeare characters, word-position GP unigram model",
    sourceHoldout:"Last 60,000 Shakespeare characters",
    q:0.81,withKnownPad:true,actualCiphertextRecovered:false,
    rewriteTotal,rewriteRecovered,ambiguousCandidates:needsTwo,
    naiveCorrect,posteriorCorrect:finalCorrect,selectedRewrite,
    naiveAccuracy:naiveCorrect/12956,posteriorAccuracy:finalCorrect/12956,
    exactTrueCandidateCoverage:originalWithinCandidates,
    consequence:"At any position the tentative cipher symbol was either the published rune, or the previous published rune; if word-local index>=6 and C!=T(C[i-6]), only literal is possible."};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encipher,decipher,run};
