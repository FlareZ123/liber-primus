"use strict";
/**
 * Exact 29! unknown output alphabet, fully inferred from GP English with
 * latent collision-consumed key-index draws, under the source F79 Fibonacci
 * 78-period keystream. Reuses the exact pooled 29-way Hungarian, forward/
 * backward alignment and Viterbi pipeline. All eight bodies share one
 * output rune permutation and source running key, independently resetting
 * the key position at each section body. All 8×240 ciphertext runes original.
 *
 * The source key is determined before any plaintext optimization by the red
 * triangle p40=15, p15=22, p53=78 and the associated F79 Fibonacci recurrence.
 * No authenticated use of this key or an outer alphabet is presupposed.
 *
 * Fixed original-page reference/transcription word-context attributes.
 * Planted genuine English comparison and matched shuffled-cycle negatives.
 * CommonJS, Node22, no writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {fibonacciCycle}=require("./fibonacci_red_field79_inversion.cjs");
const {originalBodies}=require("./grid_stream_collision_viterbi.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {seededRandom,shuffledPermutation,encrypt}=
  require("./outer_permutation_assignment.cjs");
const {buildSegments,recover}=
  require("./outer_permutation_pooled_sections.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const N=240,SEED=0x11f79f16;
const LENGTHS=[729,1145,1729,9,1894,1021,1524,1589,3316];
const MERGED=[0,1,2,4,5,6,7,8],HEAD=[13,16,12,11,16,19,8,8];
const mod=x=>(x%29+29)%29;
/** @param {number[]} period */
function keyGroups(period) {
  assert.equal(period.length,78);
  return Array.from({length:8},()=>Array.from({length:N+100},(_,i)=>period[i%78]%29));
}
/** Source-synchronized original rune groups and contextual word classes. */
function real(){
  const canon=lp2(),all=originalBodies();
  assert.equal(canon.values.length,12956);
  const offset=[0];
  for(const n of LENGTHS)offset.push(offset.at(-1)+n);
  const cipher=[],context=[];
  for(let g=0;g<8;g++){
    const start=offset[MERGED[g]]+HEAD[g];
    const seq=canon.values.slice(start,start+N);
    assert.deepEqual(seq,all[g].slice(0,N),
      "LP2 source ciphertext, section start and word classes must agree");
    cipher.push(seq);
    context.push(canon.classes.slice(start,start+N));
  }
  return {cipher,context};
}
/** Execute exact pooled unknown sigma inference with source-fixed keystream. */
function fit(cipher,context,keys,language){
  const found=recover(buildSegments(cipher,keys,context,language),
    language,{maxDrift:35,suppress:.81});
  const preview=cipher.slice(0,3).map((row,g)=>row.slice(0,70)
    .map((c,i)=>mod(found.inverse[c]-keys[g][i+found.paths[g].drift[i]]))
    .join(","));
  return {scorePerRune:found.score/(8*N),
    sourceSeed:found.seed,initializations:found.seeds,
    inverseAlphabet:found.inverse,
    originalGPDecodedPrefix:preview,
    inferredKeyDraws:found.paths.map(p=>p.finalDrift)};
}
/** Source-language, unknown-shuffled-outer-alphabet planted GP control. */
function plant(keys,language){
  const corpus=flatten(words(read("resources/control/shakespeare_first300k.txt")
    .slice(205000)));
  assert.ok(corpus.values.length>=8*N);
  const next=seededRandom(SEED);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),next);
  const clear=[],ctx=[],cipher=[],indices=[],skips=[];
  for(let g=0;g<8;g++){
    const x=corpus.values.slice(g*N,(g+1)*N);
    const cl=corpus.classes.slice(g*N,(g+1)*N);
    const z=encrypt(x,keys[g],sigma,next,.81);
    clear.push(x);ctx.push(cl);cipher.push(z.ciphertext);
    indices.push(z.keyIndices);skips.push(z.extraDraws);
  }
  const result=recover(buildSegments(cipher,keys,ctx,language),
    language,{maxDrift:35,suppress:.81});
  const label=Array.from({length:29},(_,c)=>sigma.indexOf(c));
  const labels=label.filter((x,i)=>x===result.inverse[i]).length;
  const actualRunes=cipher.reduce((sum,row,g)=>sum+row.filter((c,i)=>{
    const decoded=mod(result.inverse[c]-keys[g][i+result.paths[g].drift[i]]);
    return decoded===clear[g][i];
  }).length,0);
  const correctPositions=cipher.reduce((sum,row,g)=>sum+row.filter((_,i)=>
    i+result.paths[g].drift[i]===indices[g][i]).length,0);
  return {scorePerRune:result.score/(8*N),knownUnknownSigmaLabels:labels,
    exactRecoveredGPPlaintextRunes:actualRunes,sourceRunes:8*N,
    alignedKeyDraws:correctPositions,actualCollisionDraws:skips,
    decodedFinalDrifts:result.paths.map(x=>x.finalDrift),
    startingSeed:result.seed};
}
function scan({nulls=8}={}){
  const period=fibonacciCycle(),keys=keyGroups(period);
  const {cipher,context}=real();
  const src=words(read("resources/control/shakespeare_first300k.txt"));
  const language=training(flatten(src.slice(6000,50000)));
  const control=plant(keys,language);
  const actual=fit(cipher,context,keys,language);
  const rng=seededRandom(SEED+1),wrong=[];
  for(let r=0;r<nulls;r++){
    const surrogate=shuffledPermutation(period,rng);
    const candidate=fit(cipher,context,keyGroups(surrogate),language);
    wrong.push(candidate.scorePerRune);
  }
  wrong.sort((a,b)=>a-b);
  const exceed=wrong.filter(s=>s>=actual.scorePerRune).length;
  const result={
    model:"F79 seed(15,22) GP29 Fibonacci running key modulo78 with arbitrary *shared* global output alphabet, 8 section resets, exact collision-rejected key draws",
    sourceCycleFirst20:period.slice(0,20),
    originalCiphertextRunes:8*N,englishTrainingWords:44000,
    genuineEnglishPlant:control,
    original:{scorePerRune:actual.scorePerRune,initializations:actual.initializations,
      sourceSeed:actual.sourceSeed,inferredKeyDraws:actual.inferredKeyDraws,
      prefixes:actual.originalGPDecodedPrefix},
    shuffledCycleNull:{trials:nulls,scores:wrong,
      exceed,addOnePUpper:(exceed+1)/(nulls+1)},
    status:"Unknown global output alphabet is fully optimized and required to generalize across the eight original sections; no authentic key or plaintext without heldout and exact reencryption"
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module)scan({nulls:Number(process.env.F79_OUTER_NULLS||8)});
module.exports={keyGroups,real,fit,plant,scan};
