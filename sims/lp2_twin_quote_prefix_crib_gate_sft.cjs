'use strict';

/**
 * Two original printed LP2 quotations share a five-word-length opening:
 * original p40 quote [9811,9869) and p53 quote [12522,12592).
 * Test a potential shared-plaintext 21-rune crib without fitting any plaintext.
 *
 * Source: canonical LP2 rune corpus, transcription and quote annotations,
 * 2014 256-byte hidden-service excerpts, LP2 original 32x8 numeral table.
 * Run: node sims/lp2_twin_quote_prefix_crib_gate_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
/** @param {string} relative @returns {any} */
function json(relative){return JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));}
const corpus=json('resources/liber-primus/lp2-corpus.json');
const quote=json('resources/liber-primus/lp2-quote-punctuation-spans.json').quotes;
const ink=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const grid=json('resources/liber-primus/base60-grid.json').byte_rows.flat();
const historical=json('resources/cicada-hiddenservice-256-candidates.json').sourceServices
  .map(x=>({name:x.id,bytes:[...Buffer.from(x.hex,'hex')]}));
const sources=[{name:'lp2grid',bytes:grid},...historical];
assert.equal(sources.length,4);
assert.ok(sources.every(x=>x.bytes.length===256));

const sourceRunes=new Set(corpus.runes);
const words=[];
let offset=0,length=0,start=0;
for (const ch of ink) {
  if(sourceRunes.has(ch)){if(!length)start=offset;length++;offset++;}
  else if(/[-.&$§%]/.test(ch)&&length){
    words.push({start,length});length=0;
  }
}
if(length)words.push({start,length});
assert.equal(words.length,2973);

/** @param {number} runeOffset @returns {number} */
function wordIndex(runeOffset) {
  const pos=words.findIndex(x=>x.start===runeOffset);
  assert.ok(pos>=0,'quotation must open at a canonical word start');
  return pos;
}
/** @param {number} wordStart @param {number} size @returns {number[]} */
function pattern(wordStart,size) {
  return words.slice(wordStart,wordStart+size).map(x=>x.length);
}
const starts=quote.map(q=>wordIndex(q.start));
const matches=[];
for(let i=0;i<starts.length;i++)for(let j=i+1;j<starts.length;j++){
  let common=0;
  while(words[starts[i]+common]&&words[starts[j]+common]
    &&words[starts[i]+common].length===words[starts[j]+common].length)common++;
  if(common>=2)matches.push({quoteA:i,quoteB:j,prefixWords:common});
}
assert.deepEqual(matches,[{quoteA:3,quoteB:6,prefixWords:5}]);
const firstPattern=pattern(starts[3],5);
assert.deepEqual(firstPattern,[5,7,2,3,4]);
assert.deepEqual(pattern(starts[6],5),firstPattern);
assert.deepEqual(pattern(starts[3],14).reduce((a,b)=>a+b,0),58);
assert.deepEqual(pattern(starts[6],14).reduce((a,b)=>a+b,0),70);
const patternKey=firstPattern.join(',');
const samePatternPositions=[];
const patternCounts=new Map();
for(let i=0;i+5<=words.length;i++){
  const key=pattern(i,5).join(',');
  patternCounts.set(key,(patternCounts.get(key)||0)+1);
  if(key===patternKey)samePatternPositions.push(words[i].start);
}
assert.deepEqual(samePatternPositions,[9811,12522]);
const fivegramPairs=[...patternCounts.values()].reduce((s,n)=>s+n*(n-1)/2,0);
assert.equal(fivegramPairs,282);

const allCipher=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(allCipher.length,12956);
const aStart=quote[3].start,bStart=quote[6].start;
const p40=corpus.pages.find(p=>p.page===40);
const p53=corpus.pages.find(p=>p.page===53);
const startsPages=corpus.pages.reduce((s,p)=>{s[p.page]=(s.total||0);if(p.page<=55)s.total=(s.total||0)+p.indices.length;return s;},{total:0});
const offsets=[
  {name:'global',a:aStart,b:bStart},
  {name:'page',a:aStart-startsPages[40],b:bStart-startsPages[53]},
];
assert.equal(offsets[1].a,171);
assert.equal(offsets[1].b,53);
assert.equal(p40.indices.length,231);
assert.equal(p53.indices.length,179);

/**
 * A more conservative descriptive null fixes each quote's physical page,
 * 14-word span and total number of runes before comparing starts.
 * @param {number} page
 * @param {number} totalRunes
 * @returns {{start:number,fiveWords:string}[]}
 */
function sourceCompatibleWindows(page,totalRunes) {
  const lower=startsPages[page];
  const upper=lower+corpus.pages.find(p=>p.page===page).indices.length;
  const selected=[];
  for(let i=0;i+14<=words.length;i++){
    if(words[i].start<lower||words[i+13].start>=upper)continue;
    if(pattern(i,14).reduce((n,k)=>n+k,0)!==totalRunes)continue;
    selected.push({start:words[i].start,fiveWords:pattern(i,5).join(',')});
  }
  return selected;
}
const eligibleP40=sourceCompatibleWindows(40,58);
const eligibleP53=sourceCompatibleWindows(53,70);
const matchedEligible=eligibleP40.flatMap(a=>eligibleP53
  .filter(b=>b.fiveWords===a.fiveWords).map(b=>[a.start,b.start]));
assert.equal(eligibleP40.length,5);
assert.equal(eligibleP53.length,4);
assert.deepEqual(matchedEligible,[[9811,12522]]);
const a=allCipher.slice(aStart,aStart+21),b=allCipher.slice(bStart,bStart+21);
assert.equal(a.length,21);assert.equal(b.length,21);
const diff=a.map((v,i)=>(b[i]-v+29)%29);

/**
 * Any two secret, fixed, invertible 29-rune substitutions of the same
 * plaintext preserve exactly the same within-sequence equality partition.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {{xEqualOnly:number,yEqualOnly:number,equalBoth:number,unequalBoth:number,conflicts:number}}
 */
function substitutionEqualityInvariant(x,y){
  assert.equal(x.length,y.length);
  let xEqualOnly=0,yEqualOnly=0,equalBoth=0,unequalBoth=0;
  for(let i=0;i<x.length;i++)for(let j=i+1;j<x.length;j++){
    const sameX=x[i]===x[j],sameY=y[i]===y[j];
    if(sameX&&sameY)equalBoth++;
    else if(!sameX&&!sameY)unequalBoth++;
    else if(sameX)xEqualOnly++;
    else yEqualOnly++;
  }
  return {xEqualOnly,yEqualOnly,equalBoth,unequalBoth,
    conflicts:xEqualOnly+yEqualOnly};
}
const substitutionGate=substitutionEqualityInvariant(a,b);
assert.deepEqual(substitutionGate,{
  xEqualOnly:8,yEqualOnly:4,equalBoth:0,unequalBoth:198,conflicts:12,
});
const bijectionPlant=x=>x.map(v=>(5*v+7)%29);
assert.equal(substitutionEqualityInvariant(a,bijectionPlant(a)).conflicts,0);

assert.equal(a.reduce((n,v,i)=>n+Number(v===b[i]),0),1);

/**
 * If the same 21 plaintext runes were encrypted with two continuous additive
 * GP29 key streams with a shared period p, their ciphertext difference must
 * have period p, independent of all secret key symbols and starting phases.
 * @param {number[]} sequence
 * @param {number} period
 * @returns {number}
 */
function periodMismatches(sequence,period){
  let mismatches=0;
  for(let i=period;i<sequence.length;i++)
    mismatches+=Number(sequence[i]!==sequence[i-period]);
  return mismatches;
}
const differencePeriods=Array.from({length:20},(_,i)=>({
  period:i+1,
  mismatches:periodMismatches(diff,i+1),
}));
assert.ok(differencePeriods.every(x=>x.mismatches>0));
/**
 * If both quotes contain the same first 21 plaintext runes, their key
 * differences must equal the observed ciphertext differences.
 * @param {number[]} values
 * @param {number} startA
 * @param {number} startB
 * @param {-1|1} sign
 * @param {number[]} inputDifference
 * @returns {number}
 */
function fit(values,startA,startB,sign,inputDifference){
  let hits=0;
  for(let i=0;i<21;i++){
    const keyDiff=(values[(startB+i)%256]-values[(startA+i)%256]+29)%29;
    if(inputDifference[i]===(sign*keyDiff+29)%29)hits++;
  }
  return hits;
}
const tests=[];
for (const source of sources)
for (const offset of offsets)
for (const codec of ['mod29','scaled'])
for (const sign of /** @type {const} */([-1,1])){
  const values=source.bytes.map(v=>codec==='mod29'?v%29:Math.floor(29*v/256));
  tests.push({source:source.name,clock:offset.name,codec,sign,
    matchingKeyDifferences:fit(values,offset.a,offset.b,sign,diff)});
}
assert.equal(tests.length,32);
tests.sort((a,b)=>b.matchingKeyDifferences-a.matchingKeyDifferences);
assert.equal(tests[0].matchingKeyDifferences,3);

// Native known-Cicada plaintext positive: solved LP2 physical p56 / AN END.
const solved=corpus.pages.find(p=>p.page===56).indices;
const primes=[];for(let n=2;primes.length<21;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
const plaintext=solved.slice(0,21).map((v,i)=>(v-(primes[i]-1)%29+29)%29);
const sourceKey=grid.map(x=>x%29);
const plantedA=plaintext.map((v,i)=>(v+sourceKey[(aStart+i)%256])%29);
const plantedB=plaintext.map((v,i)=>(v+sourceKey[(bStart+i)%256])%29);
const plantedDiff=plantedA.map((v,i)=>(plantedB[i]-v+29)%29);
assert.equal(fit(sourceKey,aStart,bStart,1,plantedDiff),21);

const plantedPeriodicKey=[2,7,11,3,5,13,17];
const periodicA=plaintext.map((v,i)=>(v+plantedPeriodicKey[(aStart+i)%7])%29);
const periodicB=plaintext.map((v,i)=>(v+plantedPeriodicKey[(bStart+i)%7])%29);
const periodicDiff=periodicA.map((v,i)=>(periodicB[i]-v+29)%29);
assert.equal(periodMismatches(periodicDiff,7),0);

console.log(JSON.stringify({
  quotes:{originalFirstQuote:'LP2 p40 [9811,9869)',originalSecondQuote:'LP2 p53 [12522,12592)',
    firstFiveRuneWordLengths:firstPattern,firstFiveRunes:21,
    firstQuoteWordCount:14,secondQuoteWordCount:14,
    quotePrefixPairs:matches,bookwideMatchingPatternOffsets:samePatternPositions,
    allFivegramDuplicatePairs:fivegramPairs,
    conditionalSamePageWindowCounts:[eligibleP40.length,eligibleP53.length],
    conditionalMatchedPairs:matchedEligible},
  hypothesizedPlaintextEquality:'Unestablished; quotation punctuation and word lengths alone do not authenticate a shared phrase.',
  originalCipherSameRunePositions:a.reduce((n,v,i)=>n+Number(v===b[i]),0),
  allSecretFixedBijectionExclusion:{original:substitutionGate,
    positiveControlConflicts:0},
  keyIndependentPeriodicDifferenceTest:{testedPeriods:'1 through 20',
    originalMismatches:differencePeriods,positivePeriod7:periodMismatches(periodicDiff,7)},
  testedSourceFixedKeyFamilies:tests.length,bestKeyTests:tests.slice(0,6),
  authenticSolvedPagePositive:{runicSymbols:21,matchingKeyDifferences:21},
  conclusion:'Original quote openings suggest a bounded crib candidate, but no source-fixed tested additive key explains a shared 21-rune plaintext.',
},null,2));
