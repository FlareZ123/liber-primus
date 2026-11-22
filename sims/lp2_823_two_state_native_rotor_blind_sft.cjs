'use strict';

/**
 * Director #823. One finite source-complete two-state rotor on original GP29.
 *
 * Source-selected motivation is only the original diagonal suppression; no
 * manuscript text authenticates the parity flip or affine rotor, so this is
 * an explicit bounded model and NOT a proposed decoded LP2 passage.
 *
 * 29-rune inverse: each printed physical page restarts state, first rune
 * C0=(P0+b+7*s) mod29. For all next positions, P==28 maps to Cprev
 * exactly; P<28 maps to (Cprev+1+(a*P+b+7*s) mod28) mod29.
 * The additional state s flips when recovered plaintext GP index is odd.
 * a is a unit modulo28, b is any residue0..27, s0 in {0,1}.
 *
 * With a,b,s0 given, every 29-rune plaintext is uniquely reversible
 * including repeated ciphertext runes. The key-blind attack scans all 672
 * permitted keys, using frozen native-GP trigram training source bytes and
 * only authentic training ciphertext pp0–39. pp40–53 is held out.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = original.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const train = pages.filter(p => p.page <= 39);
const held = pages.filter(p => p.page >= 40 && p.page <= 53);
const tail = pages.filter(p => p.page >= 54);
assert.equal(train.reduce((x, p) => x + p.indices.length, 0), 9640);
assert.equal(held.reduce((x, p) => x + p.indices.length, 0), 3008);
assert.equal(tail.reduce((x, p) => x + p.indices.length, 0), 308);

const letterIndex = {
  A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,
  N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15
};
const digraph = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
/** @param {string} word */
function encodeEnglishWord(word) {
  const chars=word.toUpperCase();
  const out=[];
  for(let i=0;i<chars.length;i++){
    const pair=digraph[chars.slice(i,i+2)];
    if(pair!==undefined){out.push(pair);i++;}
    else out.push(letterIndex[chars[i]]);
  }
  return out;
}
// Preserve every native English word boundary before GP digraph conversion.
// This prevents illicit TH, EA or IA glyphs from straddling two source words.
const sourceWords=read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g);
assert.ok(sourceWords.length>30000);
const sourceWordSpans=[];
const english=[];
for(const word of sourceWords) {
  const runes=encodeEnglishWord(word);
  const start=english.length;
  english.push(...runes);
  sourceWordSpans.push({start,end:english.length});
}
assert.ok(english.length>205000);
const model=buildTrigram(english.slice(0,140000));
const units = Array.from({length:28},(_,i)=>i).filter(a=>a%2!==0&&a%7!==0);
assert.equal(units.length,12);

/** @param {number} x @param {number} n */
function mod(x,n){return ((x%n)+n)%n;}
/** @param {number} a */
function inverse28(a) {
  for(let x=1;x<28;x++)if(a*x%28===1)return x;
  throw new Error('unpermitted a');
}
/** @typedef {{a:number,b:number,s:number}} Key */
/** @param {number[]} plain @param {Key} key */
function encrypt(plain,key) {
  if(!plain.length)return [];
  let state=key.s;
  const out=[mod(plain[0]+key.b+7*state,29)];
  state^=(plain[0]&1);
  for(let i=1;i<plain.length;i++) {
    const p=plain[i];
    out.push(p===28?out[i-1]:mod(out[i-1]+1+mod(key.a*p+key.b+7*state,28),29));
    state^=(p&1);
  }
  return out;
}
/** @param {number[]} cipher @param {Key} key @param {boolean} [wrongState=false] */
function decrypt(cipher,key,wrongState=false) {
  if(!cipher.length)return [];
  let state=key.s;
  const out=[mod(cipher[0]-key.b-7*state,29)];
  if(!wrongState)state^=(out[0]&1);
  const inv=inverse28(key.a);
  for(let i=1;i<cipher.length;i++){
    const p=cipher[i]===cipher[i-1]?28:
      mod(inv*mod(mod(cipher[i]-cipher[i-1]-1,29)-key.b-7*state,28),28);
    out.push(p);
    if(!wrongState)state^=(p&1);
  }
  return out;
}
/** @param {number[]} tokens */
function buildTrigram(tokens) {
  const N=29*29*29;
  const counts=new Uint32Array(N);
  for(let i=2;i<tokens.length;i++)
    counts[(tokens[i-2]*29+tokens[i-1])*29+tokens[i]]++;
  const alpha=.08, den=tokens.length-2+N*alpha;
  const table=new Float64Array(N);
  for(let j=0;j<N;j++)table[j]=Math.log((counts[j]+alpha)/den);
  return table;
}
/** @param {number[]} tokens @param {Float64Array} logTable */
function score(tokens,logTable) {
  let value=0;
  for(let i=2;i<tokens.length;i++)
    value+=logTable[(tokens[i-2]*29+tokens[i-1])*29+tokens[i]];
  return value/Math.max(1,tokens.length-2);
}
/** @param {{indices:number[]}[]} source @param {Key} key @param {boolean} [wrongState=false] */
function decodePages(source,key,wrongState=false) {
  return source.flatMap(p=>decrypt(p.indices,key,wrongState));
}
/** @param {number[]} source @param {{indices:number[]}[]} layout */
function splitPage(source,layout) {
  let offset=0;
  const result=layout.map(p=>{
    const n=p.indices.length;const indices=source.slice(offset,offset+n);offset+=n;
    return {page:p.page,indices};
  });
  assert.equal(offset,source.length);
  return result;
}
/** @param {{indices:number[]}[]} source */
function flatten(source){return source.flatMap(p=>p.indices);}
/** @param {{indices:number[]}[]} sources @param {number} [topN=1] */
function blindSearch(sources,topN=1) {
  const winners=[];
  for(const a of units)for(let b=0;b<28;b++)for(let s=0;s<2;s++){
    const key={a,b,s};
    const p=decodePages(sources,key);
    const rating=score(p,model);
    if(winners.length<topN || rating>winners[winners.length-1].rating){
      winners.push({key,rating});
      winners.sort((x,y)=>y.rating-x.rating);
      if(winners.length>topN)winners.pop();
    }
  }
  return winners;
}
const literal=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
for(const key of [{a:5,b:17,s:1},{a:11,b:3,s:0},{a:9,b:25,s:1}]){
  assert.deepEqual(decrypt(encrypt(literal,key),key),literal);
  assert.deepEqual(encrypt(decrypt(encrypt(literal,key),key),key),encrypt(literal,key));
}
const plantStarts=[146000,169000,191000];
const plantKeys=[{a:5,b:17,s:1},{a:11,b:3,s:0},{a:9,b:25,s:1}];
const nativeCompleteWordCounts=plantStarts.map(start=>
  sourceWordSpans.filter(w=>w.start>=start&&w.end<=start+12956).length);
assert.ok(nativeCompleteWordCounts.every(n=>n>=100));
const plantCases=[];
for(let k=0;k<plantStarts.length;k++){
  const native=english.slice(plantStarts[k],plantStarts[k]+12956);
  assert.equal(native.length,12956);
  const split=splitPage(native,pages);
  const cipher=split.map(p=>({page:p.page,indices:encrypt(p.indices,plantKeys[k])}));
  const pick=blindSearch(cipher.filter(p=>p.page<=39),2);
  const chosen=pick[0].key;
  const unrolled=decodePages(cipher,chosen);
  const match=unrolled.reduce((count,x,i)=>count+(x===native[i]),0);
  const wrong=decodePages(cipher,chosen,true);
  const wrongMatch=wrong.reduce((count,x,i)=>count+(x===native[i]),0);
  const controlScore=score(unrolled.slice(9640,9640+3008),model);
  plantCases.push({sourceStart:plantStarts[k],fullRecoveredWords:nativeCompleteWordCounts[k],hidden:plantKeys[k],selected:chosen,
    score:pick[0].rating,runnerUp:pick[1].rating,correct:match,
    full:12956,wrongStateCorrect:wrongMatch,controlHeldoutScore:controlScore,
    sentinelEACount:native.slice(1).filter(x=>x===28).length,
    ciphertextRepeatCount:cipher.reduce((n,p)=>n+p.indices.slice(1).filter((v,i)=>v===p.indices[i]).length,0)});
  assert.deepEqual(chosen,plantKeys[k],'blind model must recover exact synthetic key');
  assert.equal(match,12956,'blind complete original-length plant must decode losslessly');
  assert.ok(wrongMatch<9000,'wrong transition control must fail majority of rune positions');
  assert.equal(controlScore,score(native.slice(9640,9640+3008),model),'plant must recover exact native-source trigram score');
}
const authentic=blindSearch(train,5);
const best=authentic[0];
const originalTraining=flatten(train);
const originalHeldout=flatten(held);
const decodedTrain=decodePages(train,best.key);
const decodedHeldout=decodePages(held,best.key);
const decodedTail=decodePages(tail,best.key);
const originalScores={
  originalTraining:score(originalTraining,model),
  trainedCandidate:score(decodedTrain,model),
  originalHoldout:score(originalHeldout,model),
  keyFrozenHoldout:score(decodedHeldout,model),
  originalTerminal:score(flatten(tail),model),
  keyFrozenTerminal:score(decodedTail,model)
};
const controlMin=Math.min(...plantCases.map(p=>p.controlHeldoutScore));
const originalMeanIoC=(tokens)=>{
  const counts=new Uint32Array(29);for(const x of tokens)counts[x]++;
  return counts.reduce((acc,c)=>acc+c*(c-1),0)/(tokens.length*(tokens.length-1));
};
assert.equal(flatten(pages).length,12956);
assert.equal(flatten(pages).reduce((n,x)=>n+(x===28),0)>0,true);
assert.ok(originalScores.keyFrozenHoldout<controlMin-.25,
  'Claim of ciphertext-like original must survive heldout native-GP control');
assert.ok(originalMeanIoC(decodedHeldout)<0.045,'Original heldout still near flat');
console.log(JSON.stringify({
  question:'Can one parity-driven 2-state affine rank28 GP29 transducer, fully key-blind fitted, recover original English?',
  model:'C0=P0+b+7*s (mod29); later P=EA emits repeat; other P emits predecessor+1+(a*P+b+7*s mod28) (mod29); state toggles on odd plaintext P',
  exactSearch:{keys:units.length*28*2,aAllowed:units,bRange:[0,27],stateValues:[0,1],
    originalFittingPhysicalPages:'0-39',originalHoldoutPhysicalPages:'40-53',
    terminalPhysicalPages:'54-55',sourceText:'resources/control/shakespeare_first300k.txt',
    independentNativeGpEncoder:'standard GP29 digraphs incl IA EA and aliases'},
  originalSource:{originalRunes:12956,fit:9640,heldout:3008,terminal:308,
    unchangedSourceInput:'resources/liber-primus/lp2-corpus.json'},
  positiveBlindPlants:plantCases,
  original:{topFiveTrained:authentic,
    scores:originalScores,authenticHoldoutRuneIoC:originalMeanIoC(decodedHeldout),
    originalHoldoutRuneIoC:originalMeanIoC(originalHeldout),
    decodedFirst60:decodedTrain.slice(0,60).map(i=>original.translit?.[i]??i),
    positivePlantHeldoutMinimum:controlMin},
  verdict:'Model passes blind native-GP complete-source plants, but its frozen original heldout remains nonlinguistic. Source does not select this rotor.'
},null,2));
