"use strict";
/**
 * Exact seed-family search for the 2013 Cicada Parable multiplicative pads.
 *
 * Historical input: solved p57 GP-prime clause sums 1259,1031,1229
 * multiply to the original 2013 761.MP3 ID3 "Parable 1,595,277,641".
 * Residues g=68 mod79 and g=70 mod3301 have full orders 78 and 3300.
 *
 * Search ALL nonzero seeds x0 (equivalently every possible key-cycle
 * phase), for three exact reset clocks: entire book, each physical
 * rune-bearing page, each of eight printed text sections. The pad symbol
 * is K_t = (x0 * g^t mod q) mod29, with x0 reset per segment.
 *
 * The candidate direct GP29 mechanism is
 *   C_t = sigma((P_t + K_t) mod29),
 * allowing ANY single unknown fixed permutation sigma of 29 runes.
 * Mutual information I(C;K) is exactly invariant to unknown sigma and
 * to any bijective relabeling of K. Thus this sweep needs no cipher-key
 * or permutation fitting. Segment-first glyphs are arbitrary public IVs
 * and are excluded from all scores.
 *
 * It does not test changing substitution rows, nonlinear state or binary
 * intermediates. No manuscript plaintext or authentic key is claimed.
 * Run: node sims/parable_primitive_seed_mi_exhaustive.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {gp,orders}=require("./parable_primitive_period_source_gate.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const C=pages.flatMap(p=>p.indices);
const N=C.length,PRODUCT=1595277641;
assert.equal(pages.length,55);
assert.equal(N,12956);
const lengths={
  book:[N],
  page:pages.map(p=>p.indices.length),
  section:[729,1145,1738,1894,1021,1433,1680,3316]
};

/** @param {number} seed */
function rand(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {number} n @param {()=>number} random */
function permute(n,random){
 const a=Array.from({length:n},(_,i)=>i);
 for(let i=n-1;i>0;i--){
  const j=random()%(i+1);
  [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}

/**
 * @param {number[]} lens
 * @returns {{starts:number[],keep:Uint8Array,eligible:number}}
 */
function framing(lens){
 const starts=[],keep=new Uint8Array(N).fill(1);
 let pos=0;
 for(const n of lens){
  assert(n>0);
  starts.push(pos);
  keep[pos]=0;
  pos+=n;
 }
 assert.equal(pos,N);
 return {starts,keep,eligible:N-lens.length};
}

/**
 * Build exact modulo-q multiplicative phase pad under segmentation.
 * @param {number[]} lens @param {number} prime @param {number} seed
 */
function key(lens,prime,seed) {
 const pad=new Uint8Array(N);
 const g=PRODUCT%prime;
 let pos=0;
 for(const len of lens){
  let x=seed;
  pad[pos++]=0;
  for(let i=1;i<len;i++){
   pad[pos++]=x%29;
   x=x*g%prime;
  }
 }
 assert.equal(pos,N);
 return pad;
}

/**
 * Conditional mutual information of observed cipher glyph and source pad.
 * @param {ArrayLike<number>} cipher
 * @param {Uint8Array} pad
 * @param {Uint8Array} keep
 */
function mutual(cipher,pad,keep){
 const joint=new Uint16Array(29*29),countsK=new Uint16Array(29),
  countsC=new Uint16Array(29);
 let n=0;
 for(let i=0;i<N;i++)if(keep[i]){
  const k=pad[i],c=cipher[i];
  joint[29*k+c]++;
  countsK[k]++;
  countsC[c]++;
  n++;
 }
 let information=0;
 for(let k=0;k<29;k++)for(let c=0;c<29;c++){
  const observed=joint[29*k+c];
  if(observed)information+=observed*Math.log(
   observed*n/(countsK[k]*countsC[c]));
 }
 return information/n;
}

/**
 * Native-Shakespeare source-true direct GP29 encipherment and independent
 * exact inverse. Outer permutation and seed are not supplied to the scan.
 * @param {number[]} plain
 * @param {Uint8Array} seedPad
 * @param {Uint8Array} keep
 * @param {number} seed
 */
function plant(plain,seedPad,keep,seed){
 const random=rand(0x17293301),substitution=permute(29,random),
  inverse=Array(29),cipher=new Uint8Array(N),roundtrip=new Uint8Array(N);
 substitution.forEach((v,i)=>{inverse[v]=i;});
 for(let i=0;i<N;i++){
  const k=seedPad[i];
  cipher[i]=keep[i]?substitution[(plain[i]+k)%29]:(11+i)%29;
  if(keep[i])roundtrip[i]=(inverse[cipher[i]]-k+29)%29;
  else roundtrip[i]=plain[i];
  assert.equal(roundtrip[i],plain[i]);
  if(keep[i])assert.equal(substitution[(roundtrip[i]+k)%29],cipher[i]);
 }
 return cipher;
}

/** Exhaust every full primitive cycle, no seed search pruning. */
function examine(mode,lens,prime,plain){
 const {keep,eligible}=framing(lens);
 const trueSeed=PRODUCT%prime;
 const trueKey=key(lens,prime,trueSeed);
 const positive=plant(plain,trueKey,keep,trueSeed);
 const trueMI=mutual(positive,trueKey,keep);
 let maxOriginal=-Infinity,maxSeed=null,meanOriginal=0;
 let maxPlant=-Infinity,plantBestSeed=null,higherPlantSeeds=0;
 let originalTrueSeedMI=0;
 for(let seed=1;seed<prime;seed++){
  const k=key(lens,prime,seed);
  const originalMI=mutual(C,k,keep),plantMI=mutual(positive,k,keep);
  meanOriginal+=originalMI;
  if(seed===trueSeed)originalTrueSeedMI=originalMI;
  if(originalMI>maxOriginal){maxOriginal=originalMI;maxSeed=seed;}
  if(plantMI>maxPlant){maxPlant=plantMI;plantBestSeed=seed;}
  if(plantMI>trueMI+1e-12)higherPlantSeeds++;
 }
 meanOriginal/=(prime-1);
 assert.equal(higherPlantSeeds,0);
 assert(maxOriginal<0.04);
 assert(trueMI>0.35);
 assert(Math.abs(maxPlant-trueMI)<1e-12);
 return {clock:mode,prime,fullPeriod:prime-1,
  seedVariantsExhausted:prime-1,eligibleNonIVRunes:eligible,
  original:{maximumMI:maxOriginal,maxSeed,meanMI:meanOriginal,
   sourceProductSeedMI:originalTrueSeedMI},
  planted:{source:"held-out GP Shakespeare full 12,956-rune window",
   sourceOffset:12731,seed:trueSeed,MI:trueMI,
   maximumOverAllSeeds:maxPlant,bestSeed:plantBestSeed,
   correctSeedRankWithTies:1,recoveredGP29Runes:eligible,
   exactForwardReencryption:true}
 };
}
function main(){
 const proof=orders();
 assert.deepEqual(proof.map(x=>x.order),[3300,78]);
 const whole=gp(read("resources/control/shakespeare_first300k.txt"));
 assert.equal(whole.length,218800);
 const plain=whole.slice(12731,12731+N);
 assert.equal(plain.length,N);
 const results=[];
 for(const [name,lens] of Object.entries(lengths))
  for(const mod of [79,3301])results.push(examine(name,lens,mod,plain));
 assert.equal(results.length,6);
 assert.equal(results.reduce((s,r)=>s+r.seedVariantsExhausted,0),10134);
 return {
  source:"Original 2013 Parable number from p57 prime clauses; original LP2 55 physical glyph pages; native GP English held-out positive",
  models:"Book/page/section resets, 79 and 3301 primitive fields, ALL nonzero seed phases, fixed unknown whole-book 29! outer rune substitution",
  originalRunes:N,exhaustedAuthenticSeedModels:10134,
  originalMaxOverAllFamilies:Math.max(...results.map(x=>x.original.maximumMI)),
  plantMinCorrectMI:Math.min(...results.map(x=>x.planted.MI)),
  results,
  interpretation:"All 10,134 authentic-input direct primitive-cycle pad variants have MI near the independent/uniform null; source-true English GP encipherments survive by large margin. This is conditional rejection of that restricted GP-English transport, no recovered original key or plaintext.",
  exclusions:"No claim for changing output alphabets, independent page-specific unknown seeds, hidden marker clocks, P dependent on K, binary pre-encoding, nonlinear ciphertext feedback, or plaintext languages unlike the three source controls."
 };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={key,framing,mutual,plant,examine,main};
