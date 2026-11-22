'use strict';

/**
 * Original LP2 direct decryption challenge from independent source mathematics.
 *
 * Eight authenticated 32-byte columns of the original 4x8 base60 LP2 grid
 * are symmetric keys for a complete existing exact rune-output Viterbi
 * decoder (AES-256-CTR / ChaCha20, 16 mode variants, 8! assignments).
 *
 * NEW source-derived IV proposal: LP2 page15 supplies a 4x4 Fibonacci-prime
 * square (16 slots). The red prime-totient triangle selects 53 as primitive
 * root modulo79, order78, with 53^15 = 15. This fixes 16-byte IVs as
 * consecutive generator powers, with exactly two prospectively declared
 * nonce-routing schemes:
 *  A) all bodies use exponent15, the triangle's self-indexed position;
 *  B) each body's original red heading GP-prime sum modulo78 determines
 *     its first exponent, followed by 16 consecutive powers.
 *
 * Both are original-source inputs, not fitted to ciphertext or English.
 * Exact original section bodies and cipher pipeline are inherited from
 * Agent37. A positive GP-English plant uses the same IV. The independent
 * shuffled-grid null tests the complete 16-mode/column-assignment search.
 *
 * Neither variant is a known historical method. Do not promote a high
 * post-selected score without readable heldout LP2 and re-encryption.
 *
 * Windows Node.js 22. No writes. Manual CI only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {train}=require('./grid_keyskip_viterbi.cjs');
const {originalBodies,originalKeys}=require('./grid_stream_collision_viterbi.cjs');
const {redTitles,search,plant,nulls}=require('./red_title_nonce_grid_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=(x,q)=>(x%q+q)%q;
const powers=[];
for(let t=0,v=1;t<78;t++,v=v*53%79)powers.push(v);
assert.equal(new Set(powers).size,78);
assert.equal(powers[15],15);
const titleMap=new Map(corpus.runes.map((r,i)=>[r,corpus.prime[i]]));

/**
 * @param {number} exponent
 * @returns {Buffer} Exactly 16 independently source-specified bytes.
 */
function ivFromExponent(exponent){
  return Buffer.from(Array.from({length:16},(_,i)=>
    powers[mod(exponent+i,78)]));
}

/** @returns {Array<{scheme:string,exponents:number[],ivs:Buffer[]}>} */
function proposed(){
  const titles=redTitles();
  const titleSums=titles.map(heading=>[...heading].reduce((sum,rune)=>{
    const p=titleMap.get(rune);
    assert.notEqual(p,undefined);
    return sum+p;
  },0));
  const schemes=[
    {scheme:'self-indexed-common-53-power',exponents:Array(8).fill(15)},
    {scheme:'red-title-GP-prime-sum-power',exponents:titleSums.map(x=>x%78)}
  ];
  return schemes.map(x=>({...x,ivs:x.exponents.map(ivFromExponent),
    redTitleSums:titleSums}));
}
function run(){
  const original=originalBodies(),keys=originalKeys();
  const lm=train(read('resources/control/shakespeare_first300k.txt').slice(0,200000));
  assert.deepEqual(original.map(x=>x.length),Array(8).fill(300));
  const trials=Number(process.env.F79_GRID_NULLS||12);
  assert.ok(Number.isInteger(trials)&&trials>=1);
  const cases=proposed().map(spec=>{
    const fit=search(keys,original,spec.ivs,lm);
    const positive=plant(keys,spec.ivs,lm);
    const controls=nulls(keys,original,spec.ivs,lm,fit,trials);
    assert.ok(positive.correct>=2000);
    return {scheme:spec.scheme,exponents:spec.exponents,
      titleSums:spec.redTitleSums,
      ivHex:spec.ivs.map(iv=>iv.toString('hex')),
      sourcePlant:{matched:positive.correct,of:positive.total,
        modeRecovered:positive.modeRecovered,
        assignmentRecovered:positive.assignmentRecovered},
      originalBest:fit.best,originalAlternates:fit.runnersUp,
      shuffledGridFamilyNull:controls};
  });
  const report={
    hypothesis:'F79 source-primitive-root IV for authentic base60 256-bit grid keys and exact AES/ChaCha collision-skip Viterbi',
    field:{prime:79,root:53,order:78,selfIndex:15,ivBytes:16},
    targets:'Eight original LP2 post-heading bodies, first 300 runes each',
    modes:16,allEightKeyColumnAssignments:'exact maximum-weight bipartite matching',
    cases,
    status:'Candidate plaintext requires coherent heldout original GP English, re-encryption, and lag-five/lag-six architecture; see scores and decoded prefixes.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)run();
module.exports={ivFromExponent,proposed,run};
