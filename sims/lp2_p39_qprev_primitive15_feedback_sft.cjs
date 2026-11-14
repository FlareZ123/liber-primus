'use strict';
/**
 * Original p39 red [27,5,15] quadratic as previous-ciphertext keyed nonlinear GP29.
 * Entirely specified single-state reversible test; no ciphertext-fitted parameters.
 * Node 22 CommonJS. Run directly from repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname,'..');
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(root,filename),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parsed = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
const page = n => corpus.pages.find(p => p.page===n).indices;
const mod = n => ((n%29)+29)%29;
/** @param {number} a @param {number} exponent */
function pow(a,exponent) {
 let n=exponent,out=1,base=mod(a);
 while(n>0) {
  if(n%2) out=mod(out*base);
  base=mod(base*base); n=Math.floor(n/2);
 }
 return out;
}
/** @param {number} prev */
function key(prev) {
 const q=mod(27+5*prev+15*prev*prev);
 return pow(15,q);
}
/** @param {number[]} text @param {number} initial */
function encrypt(text,initial) {
 let prev=initial;
 return text.map(p => {
  const c=mod(prev+key(prev)*(p+1));
  prev=c;
  return c;
 });
}
/** @param {number[]} text @param {number} initial */
function decrypt(text,initial) {
 let prev=initial;
 return text.map(c => {
  const p=mod(mod(c-prev)*pow(key(prev),27)-1);
  prev=c;
  return p;
 });
}
/** @param {number[]} values */
function ioc(values) {
 const counts=Array(29).fill(0);
 for(const x of values)counts[x]++;
 return counts.reduce((s,v)=>s+v*(v-1),0)/(values.length*(values.length-1));
}
const triad=page(39).slice(119,122);
assert.deepEqual(triad,[27,5,15]);
for(let x=0;x<29;x++) {
 assert.equal(mod(27+5*x+15*x*x),mod(15*(x-24)*(x-24)));
 assert.notEqual(key(x),0);
 assert.equal(mod(key(x)*pow(key(x),27)),1);
}
const chapter=Array.from({length:14},(_,i)=>page(i+40)).flat();
assert.equal(chapter.length,3008);
const heading=chapter.slice(0,8);
assert.equal(heading[7],8);
const actual=chapter.slice(8);
assert.equal(actual.length,3000);
const actualDecoded=decrypt(actual,8);
assert.deepEqual(encrypt(actualDecoded,8),actual);
const words=parsed.words.filter(w=>w.startPage>=40&&w.startPage<=52).slice(2);
assert.equal(words.length,667);
const lengths=words.map(w=>w.length);
assert.equal(lengths.reduce((a,b)=>a+b,0),3000);
// Locked independent prediction 1, before inspecting any original plaintext result:
// all original one-rune printed English words must be GP29 A/I/O.
const singletonOffsets=[128,298,1203,1324,1347,1438,1878,1999,2154,2303,2517,2585,2606];
const actualSingletons=singletonOffsets.map(i=>actualDecoded[i]);
const nativeSingles=new Set([3,10,24]);
assert(actualSingletons.every(i=>!nativeSingles.has(i)),
 'Predeclared original singleton mismatch count changed');
assert.equal(singletonOffsets.length,13);
// Stronger all-secret source-original gate, independent of Q or the author's
// unknown predecessor-key algebra: any fixed affine GP29 alphabet row
// C=Cprev+a(Cprev)*P+b(Cprev), a nonzero, must map the three genuine
// standalone GP source tokens A,I,O to the three outputs that share Cprev=15.
const commonPrevSites=singletonOffsets.filter(i=>actual[i-1]===15);
assert.deepEqual(commonPrevSites,[1347,2154,2606]);
const commonDelta=commonPrevSites.map(i=>mod(actual[i]-actual[i-1]));
assert.deepEqual(commonDelta,[17,20,4]);
const targetSet=commonDelta.slice().sort((a,b)=>a-b);
const allSecretPredecessorAffineKeys=[];
for(let a=1;a<29;a++)for(let b=0;b<29;b++) {
 const mapped=[3,10,24].map(p=>mod(a*p+b)).sort((x,y)=>x-y);
 if(mapped.every((value,i)=>value===targetSet[i]))
  allSecretPredecessorAffineKeys.push([a,b]);
}
assert.equal(allSecretPredecessorAffineKeys.length,0,
 'A fixed secret affine predecessor row unexpectedly matches three original singletons');
// Both directly source-motivated one-parameter subfamilies are special cases:
// fixed additive offset a=1, and fixed multiplier of (P+1) b=a.
for(const target of [{a:1},{bEqualsA:true}]) {
 const passes=allSecretPredecessorAffineKeys.filter(([a,b])=>
  target.a===undefined ? b===a : a===target.a);
 assert.equal(passes.length,0);
}
const wordsSingletons=[];
let offset=0;
for(const length of lengths) {
 if(length===1)wordsSingletons.push(offset);
 offset+=length;
}
assert.deepEqual(wordsSingletons,singletonOffsets,
 'One-rune controls must be derived from original source word breaks');
// Independent prediction 2, a real GP-English inverse must preserve
// natural native text frequency concentration, tested on matched controls.
const candidateIoc=ioc(actualDecoded);
assert(candidateIoc<0.04);
// Native source-shaped controls: preserve every printed word length, while
// source vocabulary comes only from independent Gibran text.
const tokens=corpus.translit.map((token,i)=>({token,i}))
 .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word */
function encodeWord(word) {
 const w=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
 const out=[];
 for(let i=0;i<w.length;) {
  const hit=tokens.find(t=>w.startsWith(t.token,i));
  if(!hit)return null;
  out.push(hit.i);i+=hit.token.length;
 }
 return out;
}
const pools=Array.from({length:40},()=>[]);
for(const word of read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g)||[]) {
 const enc=encodeWord(word);
 if(enc&&enc.length<pools.length)pools[enc.length].push(enc);
}
// Punctuation-split source apostrophes produce bare S/T fragments; a printed
// standalone English word is A, I or O, as the frozen original test assumes.
pools[1]=pools[1].filter(x=>nativeSingles.has(x[0]));
for(const length of lengths)assert(pools[length].length>0,'No authentic native word of length '+length);
let state=0x29c3301;
/** @returns {number} */
function random32() {
 state^=state<<13;state^=state>>>17;state^=state<<5;
 state>>>=0;return state;
}
const trials=160,controlIoc=[],cipherDoublets=[],cipherLagFive=[];
const singletonSites = [];
for(let trial=0;trial<trials;trial++) {
 const native=[];
 for(const length of lengths)
  native.push(...pools[length][random32()%pools[length].length]);
 assert.equal(native.length,3000);
 for(const index of singletonOffsets)
  assert(nativeSingles.has(native[index]),'Original word-length-conditioned native one-rune control');
 const encoded=encrypt(native,8);
 assert.deepEqual(decrypt(encoded,8),native);
 const decodedIoc=ioc(native);
 controlIoc.push(decodedIoc);
 let doublets=0,lag=0;
 for(let i=1;i<encoded.length;i++)if(encoded[i]===encoded[i-1])doublets++;
 let start=0;
 for(const length of lengths) {
  for(let j=5;j<length;j++)if(encoded[start+j]===encoded[start+j-5])lag++;
  start+=length;
 }
 cipherDoublets.push(doublets);
 cipherLagFive.push(lag);
 singletonSites.push(singletonOffsets.filter(i=>nativeSingles.has(native[i])).length);
}
assert(Math.min(...controlIoc)>candidateIoc);
assert(singletonSites.every(x=>x===13));
// A wider, existing-source-compatible k=3 singleton capacity extension.
// Predecessor chooses an arbitrary GP29 permutation row, never just affine.
// Unlike older A/I-only k=2 gates, explicitly admit the additional native O.
// The exact top-three ciphertext output count is the maximum achievable by
// ANY 29! secret bijection for a given stationary row. No key is guessed.
const runeMap = new Map(corpus.runes.map((r,i)=>[r,i]));
const transcript=read('resources/liber-primus/lp2-transcription.txt')
 .split('%').slice(0,55).join('%');
let gpSeen=0,wordSeen=0,pagePos=0,sectionPos=0,lastPage=-1,lastRune=null;
let currentWord=[],wordStartPage=0,wordStartSection=0,wordPrevious=null;
const singletonRecords=[];
function finishWord() {
 if(!currentWord.length)return;
 wordSeen++;
 if(currentWord.length===1&&wordPrevious!==null)
  singletonRecords.push({page:wordStartPage,section:wordStartSection,
   prev:wordPrevious,c:currentWord[0]});
 currentWord=[];
}
for(const ch of transcript) {
 if(runeMap.has(ch)) {
  if(currentWord.length===0) {
   wordStartPage=pagePos;wordStartSection=sectionPos;
   wordPrevious=lastPage===pagePos?lastRune:null;
  }
  currentWord.push(runeMap.get(ch));
  lastRune=runeMap.get(ch);lastPage=pagePos;gpSeen++;
 } else if(ch==='%')pagePos++;
 else if(ch==='/'||/\s/u.test(ch)) {}
 else {finishWord();if(ch.charCodeAt(0)===36)sectionPos++;}
}
finishWord();
assert.equal(gpSeen,12956);assert.equal(wordSeen,2896);
assert.equal(singletonRecords.length,82);
/** @param {'book'|'section'|'page'} scope */
function singletonCapacity(scope) {
 const groups=new Map();
 for(const item of singletonRecords) {
  const key=(scope==='book'?'':scope==='section'?item.section+':':item.page+':')+item.prev;
  if(!groups.has(key))groups.set(key,Array(29).fill(0));
  groups.get(key)[item.c]++;
 }
 let forced=0,violations=0;
 for(const h of groups.values()) {
  const total=h.reduce((a,b)=>a+b,0);
  const top=[...h].sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b,0);
  forced+=total-top;
  if(total>top)violations++;
 }
 return {rowStates:groups.size,forcedExceptions:forced,violatingRows:violations};
}
const completeBookRows=singletonCapacity('book'),
 redChapterRows=singletonCapacity('section'),
 physicalPageRows=singletonCapacity('page');
assert.deepEqual(completeBookRows,{rowStates:28,forcedExceptions:15,violatingRows:9});
assert.deepEqual(redChapterRows,{rowStates:67,forcedExceptions:0,violatingRows:0});
assert.deepEqual(physicalPageRows,{rowStates:80,forcedExceptions:0,violatingRows:0});
const preview=actualDecoded.slice(0,65).map(x=>corpus.translit[x]).join('-');
const plant=page(57).concat(encodeWord('EACH'));
assert.deepEqual(encodeWord('EACH'),[28,5,8]);
const plantC=encrypt(plant,8);
assert.deepEqual(decrypt(plantC,8),plant);
const countDoublets=(xs,start)=>xs.filter((c,i)=>c===(i?xs[i-1]:start)).length;
assert.equal(countDoublets(plantC,8),plant.filter(p=>p===28).length);
const observedDoublets=countDoublets(actual,8);
assert.equal(observedDoublets,18);
assert.equal(actualDecoded.filter(x=>x===28).length,observedDoublets);
console.log(JSON.stringify({
 evidence:'Original LP2 p39 red GP triad [27,5,15], printed p40 heading last GP H=8',
 reversibleModel:'Q(x)=15*(x-24)^2 mod29; K=15^Q(prevC) mod29; C=prevC+K*(P+1) mod29; P=(C-prevC)*K^-1-1 mod29',
 sourceConjectureNotAuthenticated:true,
 chapter:'Original LP2 p40-p53 black body',runes:3000,printedWords:667,iv:8,
 actualCiphertextDoublets:observedDoublets,
 actualRecoveredEAcount:actualDecoded.filter(x=>x===28).length,
 originalIoC:ioc(actual),inverseIoC:candidateIoc,
 exactSourceOriginalSingletonOffsets:singletonOffsets,
 sourceNativeSingleAIO: [...nativeSingles],
 inverseOriginalSingletons:actualSingletons.map(n=>corpus.translit[n]),
 successfulSingletons:0,requiredEnglishSingletons:13,
 independentAllSecretAffinePredecessorGate:{previousCipherRune:15,originalRuneOffsets:commonPrevSites,observedDeltaSet:targetSet,nativeStandaloneSet:[3,10,24],allUnknownAffinePairsTested:812,compatibleKeys:0},
 expandedAllSecretBookPredecessorPermutationsAIO:{eligibleSingletons:singletonRecords.length,book:completeBookRows,section:redChapterRows,page:physicalPageRows,allowedNativeGPValues:[3,10,24]},
 independentNativeControls:trials,
 nativeControlIoCMin:Math.min(...controlIoc),nativeControlIoCMax:Math.max(...controlIoc),
 matchedLengthNativeCipherDoubletsMin:Math.min(...cipherDoublets),
 matchedLengthNativeCipherDoubletsMax:Math.max(...cipherDoublets),
 nativeCipherLagFiveRange:[Math.min(...cipherLagFive),Math.max(...cipherLagFive)],
 exactNativePlantRunes:plant.length,authenticSolvedP57PlusEACH:plant.length,
 roundTrip:'all 3000 original; all 160 native shape controls; p57+EACH',
 originalFirst65:preview,
 decision:'Reject exact GP-native-English direct decoder without phase/key rescue: every one of the 13 original one-rune words is outside A/I/O, and output IoC falls below all 160 independently matched native GP source controls. Unknown 56-page plaintext remains unsolved.'
},null,2));
)sectionPos++;}
}
finishWord();
assert.equal(gpSeen,12956);assert.equal(wordSeen,2896);
assert.equal(singletonRecords.length,82);
/** @param {'book'|'section'|'page'} scope */
function singletonCapacity(scope) {
 const groups=new Map();
 for(const item of singletonRecords) {
  const key=(scope==='book'?'':scope==='section'?item.section+':':item.page+':')+item.prev;
  if(!groups.has(key))groups.set(key,Array(29).fill(0));
  groups.get(key)[item.c]++;
 }
 let forced=0,violations=0;
 for(const h of groups.values()) {
  const total=h.reduce((a,b)=>a+b,0);
  const top=[...h].sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b,0);
  forced+=total-top;
  if(total>top)violations++;
 }
 return {rowStates:groups.size,forcedExceptions:forced,violatingRows:violations};
}
const completeBookRows=singletonCapacity('book'),
 redChapterRows=singletonCapacity('section'),
 physicalPageRows=singletonCapacity('page');
assert.deepEqual(completeBookRows,{rowStates:28,forcedExceptions:15,violatingRows:9});
assert.deepEqual(redChapterRows,{rowStates:67,forcedExceptions:0,violatingRows:0});
assert.deepEqual(physicalPageRows,{rowStates:80,forcedExceptions:0,violatingRows:0});

const preview=actualDecoded.slice(0,65).map(x=>corpus.translit[x]).join('-');
const plant=page(57).concat(encodeWord('EACH'));
assert.deepEqual(encodeWord('EACH'),[28,5,8]);
const plantC=encrypt(plant,8);
assert.deepEqual(decrypt(plantC,8),plant);
const countDoublets=(xs,start)=>xs.filter((c,i)=>c===(i?xs[i-1]:start)).length;
assert.equal(countDoublets(plantC,8),plant.filter(p=>p===28).length);
const observedDoublets=countDoublets(actual,8);
assert.equal(observedDoublets,18);
assert.equal(actualDecoded.filter(x=>x===28).length,observedDoublets);
console.log(JSON.stringify({
 evidence:'Original LP2 p39 red GP triad [27,5,15], printed p40 heading last GP H=8',
 reversibleModel:'Q(x)=15*(x-24)^2 mod29; K=15^Q(prevC) mod29; C=prevC+K*(P+1) mod29; P=(C-prevC)*K^-1-1 mod29',
 sourceConjectureNotAuthenticated:true,
 chapter:'Original LP2 p40-p53 black body',runes:3000,printedWords:667,iv:8,
 actualCiphertextDoublets:observedDoublets,
 actualRecoveredEAcount:actualDecoded.filter(x=>x===28).length,
 originalIoC:ioc(actual),inverseIoC:candidateIoc,
 exactSourceOriginalSingletonOffsets:singletonOffsets,
 sourceNativeSingleAIO: [...nativeSingles],
 inverseOriginalSingletons:actualSingletons.map(n=>corpus.translit[n]),
 successfulSingletons:0,requiredEnglishSingletons:13,
 independentAllSecretAffinePredecessorGate:{previousCipherRune:15,originalRuneOffsets:commonPrevSites,observedDeltaSet:targetSet,nativeStandaloneSet:[3,10,24],allUnknownAffinePairsTested:812,compatibleKeys:0},
 independentNativeControls:trials,
 nativeControlIoCMin:Math.min(...controlIoc),nativeControlIoCMax:Math.max(...controlIoc),
 matchedLengthNativeCipherDoubletsMin:Math.min(...cipherDoublets),
 matchedLengthNativeCipherDoubletsMax:Math.max(...cipherDoublets),
 nativeCipherLagFiveRange:[Math.min(...cipherLagFive),Math.max(...cipherLagFive)],
 exactNativePlantRunes:plant.length,authenticSolvedP57PlusEACH:plant.length,
 roundTrip:'all 3000 original; all 160 native shape controls; p57+EACH',
 originalFirst65:preview,
 decision:'Reject exact GP-native-English direct decoder without phase/key rescue: every one of the 13 original one-rune words is outside A/I/O, and output IoC falls below all 160 independently matched native GP source controls. Unknown 56-page plaintext remains unsolved.'
},null,2));
