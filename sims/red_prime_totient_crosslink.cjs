'use strict';
/**
 * Source-defined LP2 red-ink prime-totient crosslink.
 * Exploratory statistic, selected after examining source sums.
 * Run with Node.js 22: node sims/red_prime_totient_crosslink.cjs
 *
 * Empirical null: independent circular rotations of the physical-page
 * rune streams, preserving rune inventories, local adjacency and the
 * actual 16 marked-span positions and lengths.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'lp2-ink-annotations.json'),'utf8'));
const NUM=29,REPS=250000,SEED=0x17bca191;

/** @param {number} count */
function firstPrimes(count){
 const primes=[];
 for(let v=2;primes.length<count;v++){
  let prime=true;
  for(let d=2;d*d<=v;d++)if(v%d===0){prime=false;break;}
  if(prime)primes.push(v);
 }
 return primes;
}
const primes=firstPrimes(300);
assert.equal(primes[21],79);
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{
 x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)/4294967296;
};}
const source=ink.pages.flatMap(p=>p.page<56?(p.red_spans||[]).map(span=>{
 const c=corpus.pages[p.page].indices;
 assert.equal([...span.runes].length,span.length);
 assert.equal(span.runes,[...c.slice(span.start,span.start+span.length)]
   .map(k=>corpus.runes[k]).join(''));
 const sums=Array.from({length:c.length},(_,rotation)=>{
  let sum=0;
  for(let j=0;j<span.length;j++)
   sum+=corpus.prime[c[(span.start+j+rotation)%c.length]];
  return sum;
 });
 return {page:p.page,start:span.start,length:span.length,sums};
}):[]);
assert.equal(source.length,16);
const pages=[...new Set(source.map(s=>s.page))];
/** @param {number[]} rotation Rotation for each physical page, zero by default. */
function examine(rotation){
 const cells=source.map(s=>{
  const sum=s.sums[rotation[s.page]||0];
  return {page:s.page,start:s.start,length:s.length,sum,
   quotient:sum%NUM===0?sum/NUM:-1};
 });
 const edges=[];
 for(let i=0;i<cells.length;i++){
  const qi=cells[i].quotient;
  if(qi<=0||qi>primes.length)continue;
  const predicted=primes[qi-1]-1;
  for(let j=0;j<cells.length;j++)if(j!==i&&cells[j].quotient===predicted){
   edges.push({from:i,to:j,primeRank:qi,totient:predicted});
  }
 }
 return {cells,edges,zeroCount:cells.filter(c=>c.quotient>=0).length};
}
/** Exhaustive exact page-local positions for a specified pair of source spans. */
function exactTwoSpan(){
 const a=source.find(s=>s.page===15&&s.start===0);
 const b=source.find(s=>s.page===53&&s.start===128);
 assert(a&&b);
 let pairs=0,exact=0,match15=0,match53=0;
 for(const x of a.sums)for(const y of b.sums){
  const qa=x%NUM===0?x/NUM:-1;
  const qb=y%NUM===0?y/NUM:-1;
  if(qa>=1&&qa<=primes.length&&qb===primes[qa-1]-1)pairs++;
  if(x===638&&y===2262)exact++;
 }
 for(const x of a.sums)match15+=+(x===638);
 for(const y of b.sums)match53+=+(y===2262);
 assert.equal(match15,1);
 assert.equal(match53,1);
 assert.equal(exact,1);
 return {page15Offsets:a.sums.length,page53Offsets:b.sums.length,
  source15Exact638:match15,source53Exact2262:match53,
  allRotationPairs:a.sums.length*b.sums.length,
  anyTotientMatchPairs:pairs,
  totientMatchRate:pairs/(a.sums.length*b.sums.length),
  exactObservedSumsPairs:exact,
  exactObservedSumsRate:exact/(a.sums.length*b.sums.length)};
}
/** Freeze all arithmetic formulas before each random rotation. */
function nullTest(){
 const random=rng(SEED),rotations=Array(58).fill(0);
 let anyPair=0,atLeast3=0,joint=0,expectedZeros=0,totalEdges=0;
 const edgesHistogram=[0,0,0,0];
 for(let rep=0;rep<REPS;rep++){
  for(const page of pages)rotations[page]=Math.floor(random()*corpus.pages[page].indices.length);
  const state=examine(rotations),n=state.edges.length;
  anyPair+=+(n>0);atLeast3+=+(state.zeroCount>=3);
  joint+=+(n>0&&state.zeroCount>=3);
  expectedZeros+=state.zeroCount;totalEdges+=n;
  edgesHistogram[Math.min(n,3)]++;
 }
 return {replicates:REPS,seed:'0x'+SEED.toString(16),
  expectedPrimeSumsDivisibleBy29:expectedZeros/REPS,
  anyPrimeTotientPair:{exceedances:anyPair,
   upperP:(anyPair+1)/(REPS+1)},
  atLeastThreePrimeDivisible:{exceedances:atLeast3,
   upperP:(atLeast3+1)/(REPS+1)},
  pairAndAtLeastThree:{exceedances:joint,
   upperP:(joint+1)/(REPS+1)},
  meanEdges:totalEdges/REPS,edgesHistogram};
}
function run(){
 const actual=examine(Array(58).fill(0));
 assert.deepEqual(actual.edges,[{from:6,to:14,primeRank:22,totient:78}]);
 assert.equal(actual.zeroCount,3);
 assert.equal(actual.cells[6].sum,638);
 assert.equal(actual.cells[13].sum,435);
 assert.equal(actual.cells[14].sum,2262);
 const exact=exactTwoSpan(),nulls=nullTest();
 return {
  resultType:'Exploratory numeric alignment in independently red-marked source spans; no actual LP2 plaintext or cipher key',
  source:'resources/liber-primus/lp2-ink-annotations.json and lp2-corpus.json',
  constraints:'16 source-selected unsolved-page spans; GP prime sums; 29 divides sum; q -> prime(q)-1',
  observed:{zeroSumSpans:actual.cells.filter(x=>x.quotient>=0),
    primeTotientEdges:actual.edges.map(e=>({
      source:actual.cells[e.from],destination:actual.cells[e.to],
      primeRank:e.primeRank,selectedPrime:primes[e.primeRank-1],
      phiPrime:e.totient
    }))},
  matchedTwoPageExact:exact,
  globalRotationNull:nulls,
  caveat:'The relation was noticed after looking at the source sums. The p-values calibrate only this mathematically specified family under cyclic rotations, not the broader historical search over numerical relations. Neither a key schedule nor a decryptor follows without independent ciphertext predictions.'
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={firstPrimes,rng,source,examine,exactTwoSpan,nullTest,run};
