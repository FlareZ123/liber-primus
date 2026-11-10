"use strict";
/**
 * Exact-source LP2 Parable primitive-field full-seed collision gate for
 * arbitrary stationary PREVIOUS-CIPHERTEXT-GLYPH substitution rows.
 *
 * The independently documented original Cicada 2013 Parable number
 * 1595277641 (1259*1031*1229 from solved LP2 p57 clauses) reduces to
 * primitive roots 68 mod79 (full period78), 70 mod3301 (period3300).
 *
 * Conditional reversible 29-state / GP28-output model, for every page:
 *   C[0] = arbitrary IV
 *   if P[i] = GP-EA: C[i] = C[i-1]   (possibly advance key clock)
 *   else C[i] = S[C[i-1]][(P[i] + K[t]) mod28],
 * where each S[a] is an ANY fixed unknown permutation of the 28
 * glyphs other than a, shared globally across original LP2.
 *
 * The key K[t] = (seed * g^t mod q) mod28, with all q-1 nonzero seeds,
 * either book/page/section resets and either consume/skip marker clocks.
 *
 * At two equal (previous-ciphertext glyph, K) pairs, output-glyph
 * equality is EXACTLY equivalent to plaintext-rune equality under any
 * unknown S[a]. This is a secret-alphabet and key-phase-independent
 * collisional statistic when the phase is exhaustively searched.
 *
 * Original manuscript and full synthetic source-true English GP28 55-page
 * plants, with identical page lengths and all 86 repeated-output marker
 * positions, receive the identical complete 20,268-model sweep.
 *
 * No authentic plaintext, key, cipher mechanism or destination is claimed.
 * Run: node sims/parable_primitive_feedback_row_collision.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {gp,orders}=require("./parable_primitive_period_source_gate.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const SECTIONS=new Set([0,3,8,15,23,27,33,40]);
const C=pages.flatMap(p=>p.indices),N=C.length;
assert.equal(pages.length,55);
assert.equal(N,12956);

/**
 * Each original nonzero transition receives six PUBLIC clock indices:
 * book/physical-page/text-section; key steps counting only nonzero
 * transitions, or all within-page transitions including literal doublets.
 */
function originalRecords(){
 const pairPrev=[],pairCur=[],pageMap=[],cleanCoords=[];
 const indices={bc:[],ba:[],pc:[],pa:[],sc:[],sa:[]};
 let bc=0,ba=0,sc=0,sa=0,markers=0;
 for(let j=0;j<pages.length;j++){
  const physical=pages[j].page,p=pages[j].indices;
  let pc=0,pa=0;
  if(SECTIONS.has(physical)){sc=0;sa=0;}
  for(let i=1;i<p.length;i++){
   if(p[i]===p[i-1]){markers++;}
   else{
    pairPrev.push(p[i-1]);pairCur.push(p[i]);
    pageMap.push(j);cleanCoords.push(i);
    for(const [name,val] of Object.entries({bc,ba,pc,pa,sc,sa}))
     indices[name].push(val);
    bc++;pc++;sc++;
   }
   ba++;pa++;sa++;
  }
 }
 assert.equal(bc,12815);
 assert.equal(markers,86);
 const clockFields=Object.fromEntries(Object.entries(indices)
  .map(([k,v])=>[k,Uint16Array.from(v)]));
 return {previous:Uint8Array.from(pairPrev),
  current:Uint8Array.from(pairCur),
  pageMap:Uint8Array.from(pageMap),cleanCoords:Uint16Array.from(cleanCoords),
  clockFields,count:bc,markers};
}
const raw=originalRecords();
const nativeGP=gp(read("resources/control/shakespeare_first300k.txt"));
assert.equal(nativeGP.length,218800);
const gp28=nativeGP.slice(12731).filter(x=>x!==28).slice(0,raw.count);
assert.equal(gp28.length,12815);
const label="held-out native GP Shakespeare, no EA in clean positions, 86 original marker sites";

/** @param {number} seed */
function random32(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function secretRows(){
 const random=random32(0x17293301);
 return Array.from({length:29},(_,prev)=>{
  const options=Array.from({length:29},(_,i)=>i).filter(x=>x!==prev);
  for(let i=options.length-1;i>0;i--){
   const j=random()%(i+1);
   [options[i],options[j]]=[options[j],options[i]];
  }
  assert.equal(new Set(options).size,28);
  assert.ok(!options.includes(prev));
  return options;
 });
}
const TABLE=secretRows();

/**
 * @param {number} modulus
 * @returns {Uint16Array} powers g^t mod modulus, all possible manuscript
 * step/marker clocks; 3301 is prime, g has full order3300.
 */
function powers(modulus){
 const out=new Uint16Array(12957),g=1595277641%modulus;
 out[0]=1;
 for(let i=1;i<out.length;i++)out[i]=out[i-1]*g%modulus;
 return out;
}

/**
 * Genuine lossless full 55-page cipher plant. Each source rune except the
 * EA markers is encrypted by the hidden 29 independent 28-permutation rows,
 * which are then inverted. Preserves exact original 86 marker site geometry.
 * @param {Uint16Array} factors
 * @param {number} modulus
 * @param {number} seed
 */
function plant(factors,modulus,seed){
 const generated=[],previous=[],current=[],recovered=[];
 let ptr=0;
 for(let j=0;j<pages.length;j++){
  const original=pages[j].indices,produced=[(5+7*j)%29];
  for(let i=1;i<original.length;i++){
   const last=produced[i-1];
   if(original[i]===original[i-1]) {
    produced.push(last);
    continue;
   }
   assert.equal(raw.pageMap[ptr],j);
   assert.equal(raw.cleanCoords[ptr],i);
   const k=((seed*factors[ptr])%modulus)%28;
   const p=gp28[ptr];
   const out=TABLE[last][(p+k)%28];
   produced.push(out);
   previous.push(last);
   current.push(out);
   const inverse=TABLE[last].indexOf(out);
   assert(inverse>=0);
   const decrypted=(inverse-k+28)%28;
   recovered.push(decrypted);
   assert.equal(decrypted,p);
   assert.equal(TABLE[last][(decrypted+k)%28],out);
   ptr++;
  }
  generated.push(produced);
 }
 assert.equal(ptr,12815);
 assert.deepEqual(recovered,gp28);
 assert.equal(generated.reduce((n,p)=>n+p.length,0),N);
 assert.equal(generated.reduce((n,p)=>n+p.slice(1)
  .filter((v,i)=>v===p[i]).length,0),86);
 return {previous:Uint8Array.from(previous),
  current:Uint8Array.from(current),exactRecoveredRunes:ptr,
  exactlyRecipheredOriginalShape:N,transparentMarkers:86};
}

/**
 * Equality among outputs with the SAME previous ciphertext glyph and pad.
 * This quantity is invariant under arbitrary static previous-glyph-indexed
 * secret substitution permutations S[a].
 */
function makeCollisionMeasure(){
 const table=new Uint16Array(29*28*29),groupCounts=new Uint16Array(29*28);
 /**
  * @param {Uint8Array} prev
  * @param {Uint8Array} cur
  * @param {Uint8Array} pad
  */
 return (prev,cur,pad)=>{
  table.fill(0);groupCounts.fill(0);
  for(let i=0;i<prev.length;i++){
   const group=28*prev[i]+pad[i];
   groupCounts[group]++;
   table[29*group+cur[i]]++;
  }
  let equal=0,pairs=0;
  for(const n of groupCounts)pairs+=n*(n-1)/2;
  for(const n of table)equal+=n*(n-1)/2;
  return {equal,pairs,rate:equal/pairs};
 };
}
const collision=makeCollisionMeasure();

/** @param {number} modulus @param {"b"|"p"|"s"} reset @param {boolean} consumeMarkers */
function analyze(modulus,reset,consumeMarkers){
 const name=reset+(consumeMarkers?"a":"c");
 const proofPowers=powers(modulus);
 const clock=raw.clockFields[name];
 assert.equal(clock.length,raw.count);
 const factors=Uint16Array.from(clock.map(t=>proofPowers[t]));
 const trueSeed=1595277641%modulus;
 const sourceTrue=plant(factors,modulus,trueSeed);
 const K=new Uint8Array(raw.count);
 let maxOriginal=-Infinity,originalWinner=null,maxPlant=-Infinity,
  plantedWinner=null,originalMean=0,correctSeedPlant=null;
 let originalMin=Infinity,sourcePlantMin=Infinity;
 for(let seed=1;seed<modulus;seed++){
  for(let j=0;j<K.length;j++)K[j]=((seed*factors[j])%modulus)%28;
  const origin=collision(raw.previous,raw.current,K);
  const positive=collision(sourceTrue.previous,sourceTrue.current,K);
  originalMean+=origin.rate;
  if(origin.rate>maxOriginal){
   maxOriginal=origin.rate;originalWinner={seed,...origin};
  }
  if(origin.rate<originalMin)originalMin=origin.rate;
  if(positive.rate>maxPlant){
   maxPlant=positive.rate;plantedWinner={seed,...positive};
  }
  if(positive.rate<sourcePlantMin)sourcePlantMin=positive.rate;
  if(seed===trueSeed)correctSeedPlant=positive;
 }
 // The planted true seed is required to survive the original-output phase
 // search and to show positive sensitivity; phase-equivalent seeds may tie.
 assert.ok(correctSeedPlant && correctSeedPlant.rate>0.055);
 assert(maxOriginal<0.045);
 assert.ok(maxPlant+1e-12>=correctSeedPlant.rate);
 assert.equal(sourceTrue.exactRecoveredRunes,12815);
 assert.equal(sourceTrue.transparentMarkers,86);
 originalMean/=(modulus-1);
 return {
  prime:modulus,primitiveRoot:1595277641%modulus,
  reset:reset==="b"?"book":reset==="p"?"page":"section",
  markerClock:consumeMarkers?"consume":"skip",
  seedsExhausted:modulus-1,
  original:{maximum:originalWinner,minimumRate:originalMin,
    meanRate:originalMean},
  planted:{source:label,knownTrueSeed:trueSeed,
    trueSeedCollision:correctSeedPlant,bestOverAllSeeds:plantedWinner,
    minimumAcrossSeeds:sourcePlantMin,
    sourceRuneRecovery:sourceTrue.exactRecoveredRunes,
    outputRunes:sourceTrue.exactlyRecipheredOriginalShape,
    transparentMarkers:sourceTrue.transparentMarkers}
 };
}
function main(){
 const ord=orders();
 assert.equal(ord.length,2);
 const results=[];
 for(const reset of ["b","p","s"])
  for(const consume of [false,true])
   for(const mod of [79,3301])
    results.push(analyze(mod,reset,consume));
 assert.equal(results.length,12);
 assert.equal(results.reduce((sum,x)=>sum+x.seedsExhausted,0),20268);
 const globalOriginalMax=Math.max(...results.map(x=>x.original.maximum.rate));
 const globalPlantTrueMin=Math.min(...results.map(x=>x.planted.trueSeedCollision.rate));
 assert(globalPlantTrueMin>globalOriginalMax);
 return {
  status:"Exact original-input all-seed source-language collision discrimination; no manuscript plaintext or authentic key recovered.",
  source:"Cicada 2013 original Parable factorization and original 12956-rune LP2",
  sourceProof:ord,
  originalPages:55,ciphertextRunes:N,sourceCleanTransitions:raw.count,
  literalSourceRepeatMarkers:raw.markers,
  hypothesis:"Global fixed arbitrary per-predecessor 28-way output glyph permutations, GP-EA self outputs, additive GP28 prime-field multiplicative pad",
  clockAlternatives:"book, eight printed sections, 55 physical page resets, with markers consuming or skipping pad steps",
  seedVariantsExhausted:20268,
  originalGlobalMaxCollisionRate:globalOriginalMax,
  plantedGlobalMinTrueKeyCollisionRate:globalPlantTrueMin,
  results,
  qualification:"The necessary equality channel is exact for the declared fixed row family, but treating rates near GP-English source controls as evidence is a language assumption. Unknown plaintext, independently rekeyed pages, dynamic S-box, hidden intermediate encoding, unknown punctuation and other stateful cryptosystems remain unexcluded."
 };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={originalRecords,powers,plant,makeCollisionMeasure,analyze,main};
