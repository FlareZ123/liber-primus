'use strict';
/**
 * Exact trigram Viterbi inversion of an LP2 pages 28/42 shared factor-four
 * additive pad, allowing per-word reversal before encryption. The source
 * and punctuation masks are held fixed. Candidate text is never certified
 * without an independent pad/key or exact T6 repair reconstruction.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {corpusWords,lp2Page}=require('./relative_key_english_probe.cjs');
const {trainTrigram,solve}=require('./relative_key_trigram_probe.cjs');
const {matched}=require('./relative_key_word_reversal_marginal.cjs');
const MOD=29;
const mod=x=>(x%MOD+MOD)%MOD;
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function conceal(a,b,rand){
  const key=Array.from({length:Math.max(a.xs.length,b.xs.length)},()=>Math.floor(rand()*MOD));
  return [{...a,xs:a.xs.map((x,i)=>mod(4*x+key[i]))},
          {...b,xs:b.xs.map((x,i)=>mod(4*x+key[i]))}];
}
function run(){
  const source=fs.readFileSync(path.resolve(__dirname,'../resources/control/shakespeare_first300k.txt'),'utf8');
  const training=corpusWords(source.slice(0,240000)),heldout=corpusWords(source.slice(240000));
  const lm=[trainTrigram(training),trainTrigram(training.map(w=>w.slice().reverse()))];
  const a=lp2Page(28),b=lp2Page(42);
  const original=[];
  for(let oa=0;oa<2;oa++)for(let ob=0;ob<2;ob++){
    const x=solve(a,b,lm[oa],0,true,4,lm[ob]);
    original.push({orientation:(oa?'reverse':'forward')+'/'+(ob?'reverse':'forward'),
      score:x.score,p28:x.pText,p42:x.qText});
  }
  assert.equal(original.length,4);
  const winner=original.reduce((x,y)=>x.score>=y.score?x:y);
  const offsets=[1,2,3,4,5,6,7,8,9,10,12,16,20,29,31,37,43,58,73,89,109,127,151,193,239,271];
  const shifted=[];
  for(const shift of offsets)shifted.push({shift,score:solve(a,b,lm[1],shift,false,4,lm[1]).score});
  const random=rng(0x33015517),positive=[],decoy=[];
  for(let k=0;k<20;k++){
    const p=matched(a,heldout,random,true),q=matched(b,heldout,random,true);
    const [ca,cb]=conceal(p,q,random);
    const rec=solve(ca,cb,lm[1],0,true,4,lm[1]);
    const accuracyA=rec.p.filter((v,i)=>v===p.xs[i]).length/p.xs.length;
    const accuracyB=rec.q.filter((v,i)=>v===q.xs[i]).length/p.xs.length;
    positive.push({score:rec.score,accuracyA,accuracyB});
    const wrong={...cb,xs:cb.xs.map(()=>Math.floor(random()*MOD))};
    decoy.push(solve(ca,wrong,lm[1],0,false,4,lm[1]).score);
  }
  const summary=x=>({min:Math.min(...x),mean:x.reduce((s,z)=>s+z,0)/x.length,
    max:Math.max(...x)});
  console.log(JSON.stringify({
    model:'shared four-scaled additive pad, per-word GP-English reversal on original rune order',
    original,winner:winner.orientation,shiftSamples:shifted,
    reverseReverseShiftScore:summary(shifted.map(x=>x.score)),
    heldoutPositive:{runs:positive.length,score:summary(positive.map(x=>x.score)),
      runeAccuracy:summary(positive.map(x=>x.accuracyA))},
    independentPadDecoy:{score:summary(decoy)},
    caveat:'No original source key or candidate text authenticated; both page pair and factor-four relation were selected from LP2.'
  },null,2));
}
if(require.main===module)run();
module.exports={run};
