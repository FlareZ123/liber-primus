"use strict";
/**
 * Source-registered LP2 candidate-plaintext discriminator.
 *
 * Genuine solved Liber Primus clauses often sum to GP primes. That historical
 * author-level property supplies a language-independent additional *score*
 * for a fully specified candidate plaintext, provided clause boundaries are
 * preserved. This script validates the score on three original solved scans,
 * tests every additive GP Caesar shift, plants a secret shift, and evaluates
 * a 29-key-family matched page-histogram shuffle null.
 *
 * No original unsolved LP2 key, plaintext, or cipher relation is inferred.
 * Reproduce: node sims/native_gp_prime_clause_discriminator.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {toGematria}=require("./previous_cipher_sbox_invariant.cjs");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const master=read("resources/transcriptions/liber_primus_master.txt");
const lookup=new Map(corpus.runes.map((c,i)=>[c,i]));
const gpPrime=corpus.prime;
const originalSegmentIDs=[4,15,73];
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if(!Number.isSafeInteger(n)||n<2)return false;
  for(let k=2;k*k<=n;k++)if(n%k===0)return false;
  return true;
}
/** @param {string} page @returns {number[][]} */
function parseClauses(page) {
  return page.split(".").map(text=>[...text]
    .filter(ch=>lookup.has(ch)).map(ch=>lookup.get(ch)))
    .filter(clause=>clause.length>0);
}
const masterPages=master.split("%");
const known=originalSegmentIDs.map(n=>parseClauses(masterPages[n]));
const sourceIndices=(i)=>[...masterPages[i]].filter(x=>lookup.has(x)).map(x=>lookup.get(x));
// The original transcription has one fewer segment than physical JPEG scans.
assert.deepEqual(sourceIndices(16),corpus.pages[0].indices);
assert.deepEqual(sourceIndices(73),corpus.pages[57].indices);
assert.deepEqual(known.map(page=>page.map(clause=>clause.length)),
  [[10,17,24,23,7,76],[12,13,26,14,17,7],[7,30,30,28]]);
const sums=known.map(page=>page.map(clause=>clause.reduce(
  (total,glyph)=>total+gpPrime[glyph],0)));
assert.deepEqual(sums,[
  [468,853,1039,1237,157,3274],
  [520,727,971,383,571,157],
  [449,1259,1031,1229]
]);
/** @param {number[][][]} pages @param {number} decryptShift */
function score(pages,decryptShift) {
  let primeClauses=0,totalClauses=0;
  for(const page of pages)for(const clause of page){
    let sum=0;
    for(const glyph of clause)sum+=gpPrime[(glyph-decryptShift+29)%29];
    primeClauses+=Number(isPrime(sum));
    totalClauses++;
  }
  return {primeClauses,totalClauses};
}
/** @param {number[][][]} pages */
function rankAllShifts(pages) {
  return Array.from({length:29},(_,shift)=>({
    shift,...score(pages,shift)
  })).sort((a,b)=>b.primeClauses-a.primeClauses||a.shift-b.shift);
}
/** @param {number[][][]} pages @param {number} shift */
function plantShift(pages,shift){
  return pages.map(page=>page.map(clause=>clause.map(x=>(x+shift)%29)));
}
/** @param {number} initial */
function rng(initial){
  let state=initial|0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;};
}
/** @param {number[][][]} pages @param {()=>number} random */
function pageHistogramNull(pages,random) {
  return pages.map(page=>{
    const values=page.flat();
    for(let i=values.length-1;i>0;i--){
      const k=random()%(i+1);
      [values[i],values[k]]=[values[k],values[i]];
    }
    let cursor=0;
    return page.map(clause=>{
      const next=values.slice(cursor,cursor+clause.length);
      cursor+=clause.length;
      return next;
    });
  });
}
/** @param {number[]} corpusRunes @param {number[][][]} shape @param {number} offset */
function sourceShape(corpusRunes,shape,offset) {
  let at=offset;
  return shape.map(page=>page.map(clause=>{
    const next=corpusRunes.slice(at,at+clause.length);
    assert.equal(next.length,clause.length);
    at+=clause.length;
    return next;
  }));
}
function main(){
  const originalRank=rankAllShifts(known);
  assert.equal(originalRank[0].shift,0);
  assert.equal(originalRank[0].primeClauses,13);
  assert.equal(originalRank[1].primeClauses,5);
  const secretShift=19;
  const plantedRank=rankAllShifts(plantShift(known,secretShift));
  assert.equal(plantedRank[0].shift,secretShift);
  assert.equal(plantedRank[0].primeClauses,13);
  const shakespeare=toGematria(read("resources/control/shakespeare_first300k.txt"));
  const shakespeareRank=rankAllShifts(sourceShape(shakespeare,known,3301));
  const seed=0x73c1a15,draw=rng(seed),repetitions=5000;
  let beat=0,scoreSum=0;
  const maxima={};
  for(let i=0;i<repetitions;i++){
    const nullSet=pageHistogramNull(known,draw);
    const max=rankAllShifts(nullSet)[0].primeClauses;
    maxima[max]=(maxima[max]||0)+1;
    beat+=Number(max>=13);
    scoreSum+=max;
  }
  const result={
    status:"source-authenticated plaintext score, not a decryption",
    source:"exact master segments 4, 15, 73; segment 73 matches solved LP2 physical page 57 (JPEG 74)",
    transcriptionSegmentIDs:originalSegmentIDs,
    physicalClausePrimeSums:sums,
    original:originalRank,
    plantedUnknownShift:{secretShift,highest:plantedRank[0],runnerUp:plantedRank[1]},
    nonNativeShakespeare:{sourceOffset:3301,highest:shakespeareRank[0]},
    shuffleNull:{
      model:"permute each page's actual GP runes independently across fixed physical clause lengths; refit all 29 shifts",
      seed:"0x73c1a15",repetitions,maxima,
      meanRefitMaximum:scoreSum/repetitions,
      nullAtLeastOriginal:beat,
      upperTailAddOne:(beat+1)/(repetitions+1)
    },
    limitations:"The three positive source pages were selected because their authored clause sums are known to favor primes. This is a conditional detector-power check, not a discovery-wide chance or proof that unknown LP2 plaintext also uses prime sums. Original unknown sections remain encrypted."
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
if(require.main===module)main();
module.exports={isPrime,parseClauses,score,rankAllShifts};
