/**
 * Original source bookend repeat at precisely 80^2-5=6395 GP runes.
 * Source-inspired periodic-key test: 6395=5*1279 and 1279 is prime.
 * A repeated additive stream key with period1279 predicts exact trigrams
 * at every 1279-same-phase lag whenever ordinary GP plaintext triples recur.
 * SFT uses original 12956 rune tape, actual native-GP text windows and
 * fully reversible planted periodic-key positives. No plaintext fit or key
 * optimization is allowed.
 *
 * Windows Node22 SFT:
 * node sims/lp2_bookend_1279_periodic_key_repeat_original_sft.cjs
 */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]);
assert.equal(tape.length,12956);
const N=tape.length, L=1279, GAP=6395;
assert.equal(GAP,5*L);
assert.equal(6561+GAP,N);
assert.deepEqual(tape.slice(6555,6561),[23,11,1,17,18,10]);
assert.deepEqual(tape.slice(N-6),tape.slice(6555,6561));

/**
 * Count all original exact recurrent n-grams at a fixed separation.
 * All windows are rune positions, not page-position fitted.
 * @param {number[]} seq
 * @param {number} lag
 * @param {number} len
 * @returns {number[]}
 */
function sameOffsetNgrams(seq,lag,len){
  const out=[];
  for(let i=0;i+lag+len<=seq.length;i++){
    let same=true;
    for(let j=0;j<len;j++){
      if(seq[i+j]!==seq[i+lag+j]){same=false;break}
    }
    if(same)out.push(i);
  }
  return out;
}
/** @param {number[]} xs @returns {{min:number,median:number,max:number,mean:number}} */
function summarize(xs){
  assert(xs.length>0);
  const a=[...xs].sort((x,y)=>x-y);
  return {min:a[0],median:a[Math.floor(a.length/2)],max:a.at(-1),
    mean:xs.reduce((s,v)=>s+v,0)/xs.length};
}

const lags=[L,2*L,3*L,4*L,GAP,6*L,7*L,8*L,9*L];
const source=lags.map(lag=>({lag,trigrams:sameOffsetNgrams(tape,lag,3).length,
  fourgrams:sameOffsetNgrams(tape,lag,4).length,
  sixgrams:sameOffsetNgrams(tape,lag,6).length}));
assert.deepEqual(source.map(x=>x.trigrams),[0,0,1,1,4,0,0,0,0]);
assert.deepEqual(sameOffsetNgrams(tape,GAP,3),[6555,6556,6557,6558]);
assert.deepEqual(sameOffsetNgrams(tape,GAP,6),[6555]);

let seed=0x12793301;
/** @returns {number} */
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const key=Array.from({length:L},()=>rng()%29);
const controlFiles={
 Gibran:'gibran_prophet_58585.txt',
 Shakespeare:'shakespeare_first300k.txt'
};
const summaries={};
for(const [label,filename] of Object.entries(controlFiles)){
  const plaintext=encodeSourceNativeGP(fs.readFileSync(
    path.join(root,'resources/control',filename),'utf8'));
  assert(plaintext.length>=N);
  const trials=[];
  const maxStart=plaintext.length-N;
  for(let trial=0;trial<128;trial++){
    const start=trial===0?0:rng()%(maxStart+1);
    const P=plaintext.slice(start,start+N);
    const C=P.map((p,i)=>(p+key[i%L])%29);
    const D=C.map((c,i)=>(c-key[i%L]+29)%29);
    assert.deepEqual(D,P);
    const native=sameOffsetNgrams(P,L,3).length;
    assert.equal(native,sameOffsetNgrams(C,L,3).length);
    trials.push({
      native1279:native,
      native6395:sameOffsetNgrams(P,GAP,3).length,
      native1279four:sameOffsetNgrams(P,L,4).length,
      native6395four:sameOffsetNgrams(P,GAP,4).length
    });
  }
  summaries[label]=Object.fromEntries(Object.keys(trials[0]).map(k=>[
    k,summarize(trials.map(t=>t[k]))]));
}
console.log(JSON.stringify({
  model:'Original bookend6 and fixed repeating GP29 additive 1279-rune key',
  original_gap:GAP,
  factorization:'6395 = 5 * 1279; 1279 prime',
  original_sole_sixgram_pair:[6555,12950],
  original_exact_lag_matches:source,
  native_source_gp_controls_128_each:summaries,
  synthetic_real_gp_period1279_encryption_and_inverse:'PASS',
  warning:'No source-selected 1279-rune key or plaintext; a negative supports only specified periodic-key model'
},null,2));
