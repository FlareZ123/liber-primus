"use strict";

/**
 * Original LP2 grid-column AES/ChaCha keyskip inversion under a source-locked,
 * independent Latin Gematria Primus trigram model. Five source-defined
 * title-nonce schemes, full eight-key assignment, and matched random-grid
 * competitors are tested without fitting plaintext to the original LP2.
 *
 * Reuses exact original-rune Viterbi decoder and section extraction.
 * Run: node sims/grid_latin_register_inverse.cjs
 * @module grid_latin_register_inverse
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const {originalKeys,originalBodies,streamKey,viterbi} =
  require("./grid_stream_collision_viterbi.cjs");
const {redTitles,titleNonces,search,nulls} =
  require("./red_title_nonce_grid_viterbi.cjs");
const {base29IV} = require("./red_title_base29_grid_iv.cjs");
const {train,encode} = require("./grid_keyskip_viterbi.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const N=29;
const latinCounts=JSON.parse(read("resources/control/latin-vulgate-gp-trigrams.json"));
const latinHoldout=JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json"));
const rng=(seed)=>{let state=seed>>>0;return()=>{
  state^=state<<13; state^=state>>>17; state^=state<<5;
  return state>>>0;
};};
const mod=x=>(x%N+N)%N;

/**
 * A source-pinned finite trigram table with precisely the same prior/smoothing
 * formula as the original English-GP Viterbi. Training counts are file-local
 * so no synthetically joined distinct Biblical books enter the fit.
 */
function latinModel() {
  const u=Uint32Array.from(latinCounts.u),b=new Uint32Array(N*N),
    t=new Uint32Array(N*N*N);
  for(const [i,v] of latinCounts.b)b[i]=v;
  for(const [i,v] of latinCounts.t)t[i]=v;
  assert.equal(u.reduce((a,c)=>a+c,0),latinCounts.n);
  const unigram=new Float64Array(N),bigram=new Float64Array(N*N),
    trigram=new Float64Array(N*N*N);
  for(let c=0;c<N;c++)
    unigram[c]=Math.log((u[c]+1)/(latinCounts.n+N));
  for(let a=0;a<N;a++)for(let c=0;c<N;c++)
    bigram[a*N+c]=Math.log((b[a*N+c]+12*Math.exp(unigram[c]))/(u[a]+12));
  for(let a=0;a<N;a++)for(let v=0;v<N;v++)for(let c=0;c<N;c++) {
    const j=(a*N+v)*N+c;
    trigram[j]=Math.log((t[j]+9*Math.exp(bigram[v*N+c]))/(b[a*N+v]+9));
  }
  return {symbols:latinCounts.n,unigram,bigram,trigram};
}

/**
 * True GP runes from a Latin New Testament section never used in training,
 * AES-256-CTR encryption with all original keys, source IVs, and a secret
 * section-to-column permutation. Encoder consumes one extra key draw on
 * approximately 81% of immediate repeated tentative ciphertext symbols.
 *
 * @param {Buffer[]} keys Authentic grid byte columns.
 * @param {Buffer[]} ivs Source-derived red-title nonces.
 * @param {object} lm Independent Latin-GP language model.
 */
function latinPlant(keys,ivs,lm) {
  assert.equal(latinHoldout.runes.length,2400);
  const sections=Array.from({length:8},(_,i)=>
    latinHoldout.runes.slice(i*300,(i+1)*300));
  const assignment=[6,2,4,0,1,7,5,3],
    mode={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1};
  const random=rng(0x38aa771e);
  const skipped=[];
  const book=sections.map((plain,g)=>{
    const keysForSection=streamKey(keys[assignment[g]],mode,345,ivs[g]);
    let k=0,prev=-1,skips=0;
    const cipher=[];
    for(const p of plain) {
      let c=mod(p+keysForSection[k]);
      if(c===prev&&random()/4294967296<0.81) {
        k++;skips++;
        c=mod(p+keysForSection[k]);
      }
      cipher.push(c);prev=c;k++;
    }
    skipped.push(skips);
    return cipher;
  });
  const chosen=search(keys,book,ivs,lm);
  const decoded=book.map((text,g)=>{
    const stream=streamKey(keys[assignment[g]],mode,345,ivs[g]);
    const result=viterbi(text,stream,mode.sign,lm);
    return {correct:result.plaintext.filter((p,i)=>p===sections[g][i]).length,
      actualSkips:skipped[g],decodedSkips:result.skips};
  });
  const correct=decoded.reduce((n,x)=>n+x.correct,0);
  const trueMode=chosen.best.algo===mode.algo
    &&!chosen.best.reverseKey&&chosen.best.reducer===mode.reducer
    &&chosen.best.sign===mode.sign;
  const trueAssignment=assignment.every((a,i)=>a===chosen.best.columns[i]);
  assert.ok(correct>=2100,"Latin plant failed GP rune decoding");
  return {correct,total:2400,recoveryRate:correct/2400,
    originalGridModeRecovered:trueMode,
    originalGridColumnsRecovered:trueAssignment,
    mode,assignment,perRune:chosen.best.perRune,perSection:decoded};
}

/** @param {number[]} plain @param {object} lm */
function plainScore(plain,lm) {
  let score=lm.unigram[plain[0]]+lm.bigram[plain[0]*N+plain[1]];
  for(let i=2;i<plain.length;i++)
    score+=lm.trigram[(plain[i-2]*N+plain[i-1])*N+plain[i]];
  return score/plain.length;
}

/** @returns {object} Complete bounded source and language control. */
function main() {
  const lm=latinModel(),keys=originalKeys(),bodies=originalBodies();
  const red=redTitles();
  assert.equal(bodies.length,8);
  const reference=latinHoldout.runes;
  const english=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const crossScores={
    heldoutLatinUnderLatinLM:plainScore(reference,lm),
    heldoutLatinUnderEnglishLM:plainScore(reference,english),
    heldoutEnglishUnderLatinLM:plainScore(
      encode(read("resources/control/shakespeare_first300k.txt").slice(205000)).slice(0,2400),lm),
  };
  const schemes=[
    ["zero-128",red.map(()=>Buffer.alloc(16))],
    ["sha256-utf8",titleNonces(red,"sha256-utf8")],
    ["repeat-gp-indices",titleNonces(red,"repeat-gp-indices")],
    ["base29-BE",red.map(x=>base29IV(x,"BE"))],
    ["base29-LE",red.map(x=>base29IV(x,"LE"))],
  ];
  const outputs=[];
  for(const [scheme,ivs] of schemes) {
    const actual=search(keys,bodies,ivs,lm);
    const plant=latinPlant(keys,ivs,lm);
    const competitors=nulls(keys,bodies,ivs,lm,actual,20);
    outputs.push({scheme,originalScorePerRune:actual.best.perRune,
      bestOriginal:{...Object.fromEntries([
        "algo","reverseKey","reducer","sign","columns"
      ].map(k=>[k,actual.best[k]])), bodyEvidence:actual.best.bodyEvidence},
      latinSourcePlant:plant,
      shuffledOriginalGrid:{n:20,exceed:competitors.exceed,
        pUpper:competitors.pUpper,min:competitors.min,
        median:competitors.median,max:competitors.max}});
  }
  return {
    claim:"Independent Latin register source-model retest of original grid key + ciphertext-collision keyskip; original page text not yet recovered",
    latinSourceSHA256:crypto.createHash("sha256").update(read(
      "resources/control/latin-vulgate-gp-trigrams.json")).digest("hex"),
    latinHoldoutSHA256:crypto.createHash("sha256").update(read(
      "resources/control/latin-vulgate-heldout-gp.json")).digest("hex"),
    originalCipherRunes:2400,originalSections:8,
    trainingLatinRuneCount:lm.symbols,holdoutLatinRunes:2400,
    crossScores,outputs};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={latinModel,latinPlant,plainScore,main};
