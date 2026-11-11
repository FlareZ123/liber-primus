"use strict";
/**
 * Source-constrained prime-gap compass route candidate.
 *
 * Node.js 22:
 *   node sims/lp2_2013_prime_gap_compass_route_sft.cjs
 *
 * Inputs:
 * - resources/liber-primus/lp2-corpus.json
 * - resources/liber-primus/lp2-grid-256.json
 * - resources/historical/cicada2016-4gq25-outguess.asc
 *
 * Historical lead: the archived 2013 Cicada source documents a number command
 * that reverses prime digits and factors the reversal, and a primes output
 * omitting p21..p200. The archive is secondary, not an authenticated server
 * capture:
 * https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md
 *
 * Status: candidate navigation hypothesis only. The gap/2 -> compass mapping
 * is inferred from the 2016 "numbers are direction" instruction and reuses the
 * eight-way convention in lp2_2016_43word_compass_sft.cjs. No plaintext/key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const mod=(n,m)=>((n%m)+m)%m;
const inBounds=(r,c)=>r>=0&&r<11&&c>=0&&c<11;

function firstPrimes(count){
 const out=[];
 for(let n=2;out.length<count;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)out.push(n);
 }
 return out;
}
function reverseDigits(n){return Number(String(n).split("").reverse().join(""));}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function factorize(n){
 const out=[];
 for(let d=2;d*d<=n;d++)while(n%d===0){out.push(d);n/=d;}
 if(n>1)out.push(n);
 return out;
}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p32=corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const p32Prime=p32.map(i=>corpus.prime[i]);

// The p32 first row and first column are the authenticated 2016 image axes.
const imageDimensions=[563,569];
const row0Sum=p32Prime.slice(0,11).reduce((a,b)=>a+b,0);
const col0Sum=p32Prime.filter((_,i)=>i%11===0).reduce((a,b)=>a+b,0);
assert.deepEqual([row0Sum,col0Sum],imageDimensions);
assert.equal(p32Prime[0],73);
assert.equal(corpus.translit[p32[0]],"L");

// The archived 2013 number operation reverses each prime dimension and
// factors the reversal. The common factor 5 selects a candidate five-step
// prefix; the quotients are the endpoints of the omitted-prime interval.
const reversedDimensions=imageDimensions.map(reverseDigits);
assert.deepEqual(reversedDimensions,[365,965]);
const sharedFactor=gcd(...reversedDimensions);
assert.equal(sharedFactor,5);
const anchors=reversedDimensions.map(n=>n/sharedFactor);
assert.deepEqual(anchors,[73,193]);
assert.deepEqual(factorize(reversedDimensions[0]),[5,73]);
assert.deepEqual(factorize(reversedDimensions[1]),[5,193]);

// The 2013 primes output omits p21..p200. The p39 red polynomial
// 27 + 5x + 15x^2 has the exact double root 24 mod 29.
const allPrimes=firstPrimes(200);
assert.equal(allPrimes[20],73);   // p21
assert.equal(allPrimes[43],193);  // p44
assert.equal(allPrimes[199],1223);// p200
const primeInterval=allPrimes.slice(20,44);
assert.equal(primeInterval.length,24);
assert.deepEqual([primeInterval[0],primeInterval.at(-1)],[73,193]);
const p39Roots=Array.from({length:29},(_,x)=>x)
 .filter(x=>mod(27+5*x+15*x*x,29)===0);
assert.deepEqual(p39Roots,[24]);
assert.equal(mod(5+30*24,29),0);
assert.equal(primeInterval.length,p39Roots[0]);

// Consecutive odd-prime gaps are even. Halving gives 1..7, which are
// direction codes in the same eight-way image-coordinate convention used by
// the independent signed-2016 43-word compass candidate.
const compass=[
 [-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]
];
const compassNames=["N","NE","E","SE","S","SW","W","NW"];
const gapValues=primeInterval.slice(1).map((p,i)=>p-primeInterval[i]);
assert.equal(gapValues.length,23);
assert.ok(gapValues.every(g=>g%2===0));
const directionCodes=gapValues.map(g=>g/2);
assert.ok(directionCodes.every(d=>Number.isInteger(d)&&d>=1&&d<=7));
const firstFiveDirections=directionCodes.slice(0,5);
assert.deepEqual(gapValues.slice(0,5),[6,4,6,8,4]);
assert.deepEqual(firstFiveDirections,[3,2,3,4,2]);
assert.deepEqual(firstFiveDirections.map(d=>compassNames[d]),["SE","E","SE","S","E"]);

// Start at p32's top-left L (prime weight 73). The first five steps remain
// inside the finite 11x11 square; no wrap or boundary convention is needed.
const primeGapPath=[[0,0]];
let row=0,col=0;
for(const direction of firstFiveDirections){
 const [dr,dc]=compass[direction];
 row+=dr;col+=dc;
 assert(inBounds(row,col));
 primeGapPath.push([row,col]);
}
assert.deepEqual(primeGapPath,[[0,0],[1,1],[1,2],[2,3],[3,3],[3,4]]);
const pathGlyphs=primeGapPath.map(([r,c])=>corpus.translit[p32[r*11+c]]);
assert.deepEqual(pathGlyphs,["L","W","B","IA","E","X"]);
const p32Row3=p32.slice(33,44).map(i=>corpus.translit[i]).join("");
assert.equal(p32Row3,"HOMEXWDSLFD");
const targetIndex=3*11+4;
assert.equal(corpus.translit[p32[targetIndex]],"X");
assert.equal(corpus.prime[p32[targetIndex]],47);

// Cross-check the already-frozen 2016 43-word route. This deliberately reuses
// the [84,127) table-byte window selected in lp2_2016_43word_compass_sft.cjs;
// it does not claim to rediscover that window.
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedStart=signed.indexOf("Hello.");
const signedEnd=signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(signedStart>=0&&signedEnd>signedStart);
const signedBody=signed.slice(signedStart,signedEnd);
const signedWords=signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
const wordBytes=grid.bytes.slice(84,127);
assert.equal(wordBytes.length,43);
let wordRow=3,wordCol=0;
for(const byte of wordBytes){
 const distance=byte>>3,[dr,dc]=compass[byte&7];
 wordRow=mod(wordRow+dr*distance,11);
 wordCol=mod(wordCol+dc*distance,11);
}
assert.deepEqual([wordRow,wordCol],[3,4]);
assert.equal(corpus.translit[p32[wordRow*11+wordCol]],"X");

// Exact multiset-preserving null: uniformly permute the 23 direction tokens,
// take the first five, and ask whether their net displacement is (3,4).
// Weights count the underlying distinct tokens, so this is exact, not Monte
// Carlo. A separate count requires the five-step path to remain in bounds.
const counts=Array(8).fill(0);
for(const d of directionCodes)counts[d]++;
const totalDraws=23n*22n*21n*20n*19n;
let displacementFavourable=0n;
let validDraws=0n;
let validTargetDraws=0n;
function enumerate(countsLeft,r,c,depth,weight,valid){
 if(depth===5){
  if(r===3&&c===4)displacementFavourable+=weight;
  if(valid)validDraws+=weight;
  if(valid&&r===3&&c===4)validTargetDraws+=weight;
  return;
 }
 for(let d=0;d<8;d++){
  const n=countsLeft[d];
  if(!n)continue;
  countsLeft[d]--;
  const [dr,dc]=compass[d];
  const nr=r+dr,nc=c+dc;
  enumerate(countsLeft,nr,nc,depth+1,weight*BigInt(n),
   valid&&inBounds(nr,nc));
  countsLeft[d]++;
 }
}
enumerate(counts.slice(),0,0,0,1n,true);
assert.equal(totalDraws,4037880n);
assert.equal(displacementFavourable,63000n);
assert.equal(validDraws,1624644n);
assert.equal(validTargetDraws,57960n);

// Continuing all 23 gaps without wrap exits the finite map; do not silently
// impose a torus. The shared factor 5 only supports the first five-step prefix.
let fullRow=0,fullCol=0,firstExitStep=null;
for(let i=0;i<directionCodes.length;i++){
 const [dr,dc]=compass[directionCodes[i]];
 fullRow+=dr;fullCol+=dc;
 if(firstExitStep===null&&!inBounds(fullRow,fullCol))firstExitStep=i+1;
}
assert.equal(firstExitStep,16);

console.log(JSON.stringify({
 dimensions:{
  image:imageDimensions,
  p32Row0Sum:row0Sum,
  p32Column0Sum:col0Sum,
  reversed:reversedDimensions,
  factorizations:[factorize(reversedDimensions[0]),factorize(reversedDimensions[1])],
  sharedFactor,
  intervalAnchors:anchors
 },
 historicalPrimeGap:{
  archivedGap:"p21..p200",
  p21:allPrimes[20],
  p44:allPrimes[43],
  p200:allPrimes[199],
  selectedInterval:primeInterval,
  selectedPrimeCount:primeInterval.length,
  p39RedPolynomial:{coefficients:[27,5,15],roots:p39Roots,doubleRoot:true}
 },
 primeGapCompass:{
  gaps:gapValues,
  directionCodes,
  directionNames:directionCodes.map(d=>compassNames[d]),
  firstFiveDirections,
  firstFiveNames:firstFiveDirections.map(d=>compassNames[d]),
  path:primeGapPath,
  pathGlyphs,
  target:{row:3,col:4,index:targetIndex,glyph:"X",gpPrime:47},
  p32Row3
 },
 independent2016Route:{
  signedWordCount:signedWords.length,
  reusedTableByteWindow:[84,127],
  start:[3,0],
  endpoint:[wordRow,wordCol],
  endpointGlyph:"X",
  sameTarget:true
 },
 conditionalNull:{
  method:"uniform permutation of the 23 direction tokens; first five moves; no wrap",
  totalOrderedDraws:totalDraws.toString(),
  displacementFavourable:displacementFavourable.toString(),
  displacementProbability:Number(displacementFavourable)/Number(totalDraws),
  inBoundsDraws:validDraws.toString(),
  inBoundsProbability:Number(validDraws)/Number(totalDraws),
  inBoundsTargetDraws:validTargetDraws.toString(),
  inBoundsTargetProbability:Number(validTargetDraws)/Number(totalDraws),
  targetGivenInBoundsProbability:Number(validTargetDraws)/Number(validDraws),
  interpretation:"conditional diagnostic only; not a global discovery p-value"
 },
 continuation:{noWrapFirstExitStep:firstExitStep,wrapAssumed:false},
 status:"candidate navigation hypothesis only; gap/2-to-compass mapping inferred; no unknown LP2 plaintext or key recovered"
},null,2));
