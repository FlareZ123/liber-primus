"use strict";
/**
 * Independent GP-native conditional-bigam evaluation of short-period key
 * candidates, whose key values were fitted using ONLY the original p0..27
 * unigram model. No language text from original pages28..55 is used in
 * selection. Positive planted period28/page controls validate power.
 *
 * This report does not promote any postselected weak period28 peak to a key.
 * Run: node sims/contextual_marker29_clueperiod_bigrams.cjs
 */
const assert=require("node:assert/strict");
const {
  original,pageIndex,source,pages,red,recover
}=require("./contextual_marker29_period225_key_recovery.cjs");
const {table,plaintext,score}=
  require("./contextual_marker29_bigram225_key_recovery.cjs");
const {encrypt,decrypt}=
  require("./contextual_marker29_reversible.cjs");
const N=original.length,periods=[15,16,28,29,32,79,225,256];
const actualTable=table(original);
function scan(){
  const out=[];
  for(const period of periods)for(const clock of ["global","page"]){
    const fit=recover(original,clock,period);
    const p=plaintext(actualTable,fit.key,clock);
    out.push({period,clock,
      trainKeySelectionUnigram:fit.trainMean,
      frozenKeyedUnigram:fit.heldoutMean,
      frozenUnigramGain:fit.heldoutMean-fit.baseline,
      frozenEntireOriginalSource:score(actualTable,p,false)});
  }
  return out;
}
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function sourcePlant(random){
  const p=new Uint8Array(N);let at=0;
  for(const page of pages){
    const off=random()%source.length;
    for(let j=0;j<page.indices.length;j++)
      p[at+j]=source[(off+j)%source.length];
    at+=page.indices.length;
  }
  assert.equal(at,N);return p;
}
function run(){
  const originalScan=scan(),random=rng(0x28291507),controls=[];
  const trueKey=red.slice(0,28),cipherKey={
    repr:"index",reverse:false,clock:"page",sign:1,phase:0
  };
  for(let trial=0;trial<6;trial++){
    const sourceP=sourcePlant(random),
      ciphertext=encrypt(sourceP,cipherKey,trueKey),
      recoveredKey=recover(ciphertext,"page",28);
    const reconstructed=decrypt(ciphertext,cipherKey,recoveredKey.key);
    let correct=0,n=0;
    for(let i=0;i<N;i++)if(pageIndex[i]>=28){
      correct+=Number(reconstructed[i]===sourceP[i]);n++;
    }
    const p=plaintext(table(ciphertext),recoveredKey.key,"page");
    assert.deepEqual(p,reconstructed);
    const oracle=decrypt(ciphertext,cipherKey,trueKey);
    assert.deepEqual(oracle,sourceP);
    controls.push({
      correctKeyDigits:recoveredKey.key.filter(
        (k,i)=>k===trueKey[i]).length,
      untouchedRuneAccuracy:correct/n,
      frozenSourceLanguage:score(table(ciphertext),p,false)});
  }
  return {
    original:originalScan,
    nativePeriod28PageControls:{seed:"0x28291507",sourceRunes:N,
      trueKeyDigitCount:28,plants:controls},
    caution:"Any apparent gain is conditional on postselected cipher architecture and on 16 clue-period/clock comparisons; genuine LP2 plaintext remains unknown."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={scan,run};
