'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const T = corpus.translit;
const GRID = corpus.pages.filter((page) => page.page <= 2)
  .flatMap((page) => page.indices);
const AXES = [[0,1],[1,0],[1,1],[1,-1]];
const PREVIOUS_LEFTMOST = [25,25];
assert.equal(GRID.length, 729);

/** @param {number} row @param {number} col */
function at(row,col) {
  return GRID[(row-1)*27+col-1];
}

/** @param {number} value */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} value */
function phi(value) {
  let result=value;
  let rest=value;
  for(let prime=2;prime*prime<=rest;prime++){
    if(rest%prime!==0) continue;
    while(rest%prime===0) rest/=prime;
    result-=result/prime;
  }
  if(rest>1) result-=result/rest;
  return result;
}

/** @param {number} value */
function mu(value) {
  let rest=value;
  let sign=1;
  for(let prime=2;prime*prime<=rest;prime++){
    if(rest%prime!==0) continue;
    rest/=prime;
    sign=-sign;
    if(rest%prime===0) return 0;
  }
  return rest>1 ? -sign : sign;
}

/** @param {number} row @param {number} col */
function n1(row,col) {
  return 27*(col-1)+28-row;
}

/** @param {number[]} from @param {number[]} to */
function eightRayDeviation(from,to) {
  const dr=to[0]-from[0];
  const dc=to[1]-from[1];
  return Math.min(Math.abs(dr),Math.abs(dc),
    Math.abs(Math.abs(dr)-Math.abs(dc)));
}

/** @param {number} outer @param {number} center */
function deriveMirrorKey(outer,center) {
  const derived=[outer,phi(center),outer];
  const signature=derived.map((value)=>mu(phi(value)));
  const phase=mod29(signature.reduce((sum,value)=>sum+value,0))%3;
  const key=derived.slice(phase).concat(derived.slice(0,phase));
  return {derived,signature,phase,key};
}

const mirrorKeys=[];
for(let row=1;row<=27;row++){
  for(let col=1;col<=27;col++){
    // Report 04 after THEN: even center row, odd center column.
    if(row%2!==0 || col%2!==1) continue;
    for(const [dr,dc] of AXES){
      for(let radius=1;radius<=13;radius++){
        const a=[row-dr*radius,col-dc*radius];
        const b=[row+dr*radius,col+dc*radius];
        if([...a,...b].some((value)=>value<1||value>27)) break;
        const outerA=at(a[0],a[1]);
        const outerB=at(b[0],b[1]);
        if(outerA!==outerB) continue;
        const derived=deriveMirrorKey(outerA,at(row,col));
        // Report 01 after THEN: (+1,+1,+1), phase 0.
        if(derived.phase!==0 || derived.signature.some((value)=>value!==1)) {
          continue;
        }
        mirrorKeys.push({
          center:[row,col],
          axis:[dr,dc],
          radius,
          outer:outerA,
          centerRune:at(row,col),
          key:derived.key,
        });
      }
    }
  }
}

const segments=[];
for(let startRow=1;startRow<=27;startRow++){
  for(let startCol=1;startCol<=27;startCol++){
    // Report 06 after THEN: q=1 from the previous W endpoint.
    if(eightRayDeviation(PREVIOUS_LEFTMOST,[startRow,startCol])>1) continue;
    // Reports 02-03: diagonal, leftmost is END, so reading moves left.
    for(const dr of [-1,1]){
      for(let length=2;length<=10;length++){
        const endRow=startRow+dr*(length-1);
        const endCol=startCol-(length-1);
        if(endRow<1||endRow>27||endCol<1||endCol>27) break;
        // Report 05: endpoint/leftmost row is odd.
        if(endRow%2!==1) continue;
        // Report 02 reflected-mode leftmost class.
        const classValue=mu(n1(endRow,endCol));
        if(classValue!==0 && classValue!==-1) continue;
        const cells=Array.from({length},(_,index)=>[
          startRow+dr*index,
          startCol-index,
        ]);
        segments.push({
          start:[startRow,startCol],
          end:[endRow,endCol],
          direction:[dr,-1],
          cipher:cells.map(([row,col])=>at(row,col)),
        });
      }
    }
  }
}

const tokens=T.map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {string} word */
function encodeSourceNative(word) {
  const normalized=word.toUpperCase()
    .replace(/QU/g,'CW')
    .replace(/V/g,'U')
    .replace(/[KQ]/g,'C')
    .replace(/Z/g,'S');
  const out=[];
  for(let offset=0;offset<normalized.length;){
    if(normalized.startsWith('ING',offset)){
      out.push(21);
      offset+=3;
      continue;
    }
    if(normalized.startsWith('IO',offset)){
      out.push(27);
      offset+=2;
      continue;
    }
    const token=tokens.find(({symbol})=>normalized.startsWith(symbol,offset));
    if(!token) return null;
    out.push(token.index);
    offset+=token.symbol.length;
  }
  return out;
}

const root=path.resolve(__dirname,'..');
const dictionary=fs.readFileSync(
  path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8');
const lexicon=new Map();
for(const line of dictionary.split(/\r?\n/)){
  const match=/^([a-z]+) (\d+)$/.exec(line.trim());
  if(!match) continue;
  const runes=encodeSourceNative(match[1]);
  if(!runes || runes.length<2 || runes.length>10) continue;
  const signature=runes.join(',');
  const frequency=Number(match[2]);
  const previous=lexicon.get(signature);
  if(!previous || frequency>previous.frequency){
    lexicon.set(signature,{word:match[1],frequency});
  }
}

const english=[];
for(const keyCandidate of mirrorKeys){
  for(const segment of segments){
    const plain=segment.cipher.map(
      (cipher,index)=>mod29(cipher-keyCandidate.key[index%3]));
    const hit=lexicon.get(plain.join(','));
    if(!hit) continue;
    english.push({
      ...hit,
      runes:plain,
      key:keyCandidate.key,
      keyCenter:keyCandidate.center,
      segmentStart:segment.start,
      segmentEnd:segment.end,
      cipher:segment.cipher,
    });
  }
}

const distinct=new Map();
for(const hit of english){
  const record=distinct.get(hit.word) || {
    word:hit.word,
    count:0,
    frequency:hit.frequency,
  };
  record.count++;
  distinct.set(hit.word,record);
}
const theHits=english.filter((hit)=>hit.word==='the');
const exact=theHits.filter((hit)=>
  hit.keyCenter[0]===20 && hit.keyCenter[1]===17 &&
  hit.segmentStart[0]===22 && hit.segmentStart[1]===21 &&
  hit.segmentEnd[0]===21 && hit.segmentEnd[1]===20);

assert.equal(mirrorKeys.length,22);
assert.equal(segments.length,1035);
assert.equal(mirrorKeys.length*segments.length,22770);
assert.equal(english.length,955);
assert.equal(distinct.size,256);
assert.equal(theHits.length,14);
assert.equal(exact.length,1);
assert.deepEqual(exact[0].key.map((value)=>T[value]),['N','E','N']);
assert.deepEqual(exact[0].cipher.map((value)=>T[value]),['J','W']);
assert.deepEqual(exact[0].runes.map((value)=>T[value]),['TH','E']);

console.log(JSON.stringify({
  frozenPredictionSet:'Reports 01-06 after THEN',
  favorableRestriction:'equal-outer mirror keys only',
  mirrorKeyCandidates:mirrorKeys.length,
  ciphertextSegmentCandidates:segments.length,
  combinations:mirrorKeys.length*segments.length,
  dictionaryDecryptions:english.length,
  distinctDictionaryWords:distinct.size,
  proposedTHEOccurrences:theHits.length,
  exactProposedGeometryOccurrences:exact.length,
  topWords:[...distinct.values()]
    .sort((a,b)=>b.frequency-a.frequency || a.word.localeCompare(b.word))
    .slice(0,20),
},null,2));
