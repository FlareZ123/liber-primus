#!/usr/bin/env node
"use strict";

/*
 * Cross-route bridge:
 *   2016 signed-message word indices
 *     -> source-indexed LP2 fragments
 *     -> five 5-rune fragments / 5x5 row-sum readout
 *     -> words THE DIRECTION SEEK THE NUMBERS
 *     -> fixed p57 GP0 -> p50 byte -> divmod29 register
 *     -> ordered DH-state pair sequence.
 *
 * The 2016 page/fragment map and row-sum readout remain intermediate
 * hypotheses. This script tests the frozen chain and discriminating table
 * controls; it does not decrypt an unknown LP2 page.
 *
 * From repository root:
 *   node sims/lp2_five_fragment_p50_dh_pair_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root,file),"utf8").replace(/\r/g,"");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p50Bytes = grid.pages.flatMap(page => page.bytes);
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune,index) => [rune,index]));
const mod = (value,n) => ((value%n)+n)%n;

function modPow(base,exponent,modulus) {
  let result=1;
  base=mod(base,modulus);
  while(exponent>0) {
    if(exponent%2) result=(result*base)%modulus;
    base=(base*base)%modulus;
    exponent=Math.floor(exponent/2);
  }
  return result;
}

function parsePageWords(page) {
  const words=[];
  let values=[];
  let offset=0;
  let start=0;
  const flush=()=>{
    if(!values.length) return;
    words.push({
      page,
      index:words.length,
      ordinal:words.length+1,
      start,
      end:offset-1,
      values:values.slice(),
      length:values.length,
      gp0:values.reduce((sum,value)=>sum+value,0),
    });
    values=[];
  };
  for(const character of (parts[page]||"")){
    if(runeIndex.has(character)){
      if(!values.length) start=offset;
      values.push(runeIndex.get(character));
      offset++;
    } else if(character==="/" || /\s/u.test(character)){
      // Printed line wraps do not terminate a word.
    } else {
      flush();
    }
  }
  flush();
  return {words,runeCount:offset};
}

function signedWords() {
  const clear=signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"")
    .replace(/\b3301\b/g,"")
    .replace(/\b[0-9A-F]{8,}\b/g,"");
  return (clear.match(/[A-Za-z]+/g)||[]).map(word=>word.toUpperCase());
}

const translit=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

function gpWord(word) {
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<normalized.length;){
    if(normalized.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(normalized.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const token=translit.find(item=>normalized.startsWith(item.symbol,i));
    assert.ok(token, "unmapped GP29 spelling at "+normalized.slice(i));
    out.push(token.value);
    i+=token.symbol.length;
  }
  return out;
}

const words=signedWords();
assert.equal(words.length,43);
assert.equal(p50Bytes.length,256);

const indexed=[];
for(let i=0;i<words.length;i++){
  const fragment=parsePageWords(i).words[i];
  if(fragment) indexed.push(fragment);
}
assert.equal(indexed.length,42); // page32 has no fragment33.
const selected=indexed.filter(fragment=>fragment.length===5);
assert.deepEqual(selected.map(fragment=>[fragment.page,fragment.ordinal]),[
  [9,10],[12,13],[15,16],[36,37],[40,41]
]);
assert.deepEqual(selected.map(fragment=>fragment.values),[
  [15,13,14,27,6],
  [28,1,0,15,20],
  [10,13,8,27,17],
  [2,22,4,1,20],
  [0,23,4,28,6]
]);

// Place the five fragments as columns in ascending physical-page order.
const C=Array.from({length:5},(_,row)=>selected.map(fragment=>fragment.values[row]));
const rowIndices=C.map(row=>mod(row.reduce((sum,value)=>sum+value,0),43));
assert.deepEqual(rowIndices,[12,29,30,12,26]);
const rowWords=rowIndices.map(index=>words[index]);
assert.deepEqual(rowWords,["THE","DIRECTION","SEEK","THE","NUMBERS"]);

const gpWords=rowWords.map(gpWord);
const addresses=gpWords.map(values=>values.reduce((sum,value)=>sum+value,0));
assert.deepEqual(addresses,[20,112,56,20,83]);
const p50Values=addresses.map(address=>p50Bytes[address]);
assert.deepEqual(p50Values,[102,73,254,102,193]);
const expectedPairs=[[3,15],[2,15],[8,22],[3,15],[6,19]];
const divmodPairs=p50Values.map(value=>[Math.floor(value/29),value%29]);
assert.deepEqual(divmodPairs,expectedPairs);

// The known 2013 DH state is p=23, g=5, a=6, b=15, A=8, B=19,
// K=2, e=3, q=4. Four pairs are exact members of the frozen p57
// vocabulary; DIRECTION supplies the natural cross-pair [K,b].
const labels=["[e,b]","[K,b]","[A,p-1]","[e,b]","[a,B]"];
const statePairValues=new Map([
  ["3,15","[e,b]"],
  ["2,15","[K,b]"],
  ["8,22","[A,p-1]"],
  ["6,19","[a,B]"],
]);
assert.deepEqual(divmodPairs.map(pair=>statePairValues.get(pair.join(","))),labels);
const p57Vocabulary=new Set(["3,15","2,5","4,17","8,22","6,19"]);
assert.equal(divmodPairs.filter(pair=>p57Vocabulary.has(pair.join(","))).length,4);

const selectedWordRecords=rowWords.map((word,j)=>({
  wordIndex:rowIndices[j],
  word,
  GP29:gpWords[j],
  GP0:addresses[j],
  p50Byte:p50Values[j],
  divmod29:divmodPairs[j],
  DHStatePair:labels[j],
}));

// The exact ordered pair sequence is selected only by the authored p50 order.
function pairsForTape(tape) {
  return addresses.map(address=>{
    const value=tape[address];
    return [Math.floor(value/29),value%29];
  });
}
const samePairs=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const positionMatches=pairs=>pairs.reduce((count,pair,i)=>
  count+(samePairs(pair,expectedPairs[i])?1:0),0);

const cyclic=[];
for(let shift=0;shift<256;shift++){
  const tape=Array.from({length:256},(_,address)=>p50Bytes[(address+shift)%256]);
  const pairs=pairsForTape(tape);
  cyclic.push({shift,pairs,exact:samePairs(pairs,expectedPairs),matches:positionMatches(pairs)});
}
const cyclicExact=cyclic.filter(item=>item.exact);
const cyclicMax=Math.max(...cyclic.map(item=>item.matches));
const cyclicMaxShifts=cyclic.filter(item=>item.matches===cyclicMax).map(item=>item.shift);
assert.deepEqual(cyclicExact.map(item=>item.shift),[0]);
assert.equal(cyclicMax,5);
assert.deepEqual(cyclicMaxShifts,[0]);

let affineExactCount=0;
let affineMax=0;
let affineMaxCount=0;
let affineIdentityPairs=null;
for(let multiplier=1;multiplier<256;multiplier+=2){
  for(let add=0;add<256;add++){
    const tape=Array.from({length:256},(_,address)=>
      p50Bytes[(multiplier*address+add)%256]);
    const pairs=pairsForTape(tape);
    const exact=samePairs(pairs,expectedPairs);
    if(exact) affineExactCount++;
    const matches=positionMatches(pairs);
    if(multiplier===1&&add===0) affineIdentityPairs=pairs;
    if(matches>affineMax){affineMax=matches;affineMaxCount=1;}
    else if(matches===affineMax) affineMaxCount++;
  }
}
assert.deepEqual(affineIdentityPairs,expectedPairs);
assert.equal(affineExactCount,1);
assert.equal(affineMax,5);
assert.equal(affineMaxCount,1);

const sourceInventory=words.map((word,index)=>{
  const address=gpWord(word).reduce((sum,value)=>sum+value,0);
  const value=p50Bytes[address];
  const pair=[Math.floor(value/29),value%29];
  return {index,word,address,p50Byte:value,pair};
});
const pairOccurrences=Object.fromEntries(["3,15","2,15","8,22","6,19"].map(key=>[
  key,sourceInventory.filter(item=>item.pair.join(",")===key)
    .map(item=>({index:item.index,word:item.word}))
]));

// Candidate consumer test. The 2013 DH example fixes p=23 and the
// exponent-first/base-second orientation through B^a mod p = K.
const dhReadout=divmodPairs.map(([exponent,base])=>modPow(base,exponent,23));
const dhWords=dhReadout.map(index=>words[index]);
assert.deepEqual(dhReadout,[17,18,1,17,2]);
assert.deepEqual(dhWords,["THE","MAP","THE","THE","PATH"]);
assert.equal(modPow(19,6,23),2); // B^a mod p = K

// Reverse pair orientation is a control, not the DH convention.
const reverseDhReadout=divmodPairs.map(([base,exponent])=>modPow(base,exponent,23));
const reverseDhWords=reverseDhReadout.map(index=>words[index]);
assert.deepEqual(reverseDhReadout,[12,16,1,12,18]);
assert.deepEqual(reverseDhWords,["THE","ARE","THE","THE","MAP"]);

// A preselected singleton source-word holdout is not a general successor:
// OPENPGP maps to ARE, not to the next word in the signed message.
const openpgpRecord=sourceInventory.find(item=>item.word==="OPENPGP");
assert.deepEqual(openpgpRecord.pair,[6,3]);
const openpgpDhIndex=modPow(openpgpRecord.pair[1],openpgpRecord.pair[0],23);
assert.equal(openpgpDhIndex,16);
assert.equal(words[openpgpDhIndex],"ARE");

// Locked controls from the already-published 5x5 fragment readout.
// They were not used to choose the exponent-first/base-second consumer.
const holdoutSequences={
  mcRow:["THE","EPIPHANY","IS","THE","PRIMUS"],
  rawColumn:["YOU","IS","YOU","SEEKS","MAP"],
  mcColumn:["BEWARE","EMPTY","BE","MEANING","THE"]
};
const consumeWords=sequence=>sequence.map(word=>{
  const item=sourceInventory.find(candidate=>candidate.word===word);
  const index=modPow(item.pair[1],item.pair[0],23);
  return {word,pair:item.pair,index,outputWord:words[index]};
});
const dhConsumerHoldouts=Object.fromEntries(
  Object.entries(holdoutSequences).map(([name,sequence])=>[name,consumeWords(sequence)])
);
assert.deepEqual(dhConsumerHoldouts.mcRow.map(x=>x.index),[17,16,1,17,2]);
assert.deepEqual(dhConsumerHoldouts.mcRow.map(x=>x.outputWord),["THE","ARE","THE","THE","PATH"]);
assert.deepEqual(dhConsumerHoldouts.rawColumn.map(x=>x.index),[16,1,16,15,1]);
assert.deepEqual(dhConsumerHoldouts.rawColumn.map(x=>x.outputWord),["ARE","THE","ARE","WORDS","THE"]);
assert.deepEqual(dhConsumerHoldouts.mcColumn.map(x=>x.index),[12,9,10,4,17]);
assert.deepEqual(dhConsumerHoldouts.mcColumn.map(x=>x.outputWord),["THE","LIBER","PRIMUS","EMPTY","THE"]);

console.log(JSON.stringify({
  status:"intermediate source-indexed DH-state path; no unknown-page plaintext",
  sourceWordCount:words.length,
  selectedFiveRuneFragments:selected.map(fragment=>({
    page:fragment.page,fragment:fragment.ordinal,values:fragment.values
  })),
  rawMatrix:C,
  rowSumIndices:rowIndices,
  rowSumWords:rowWords,
  selectedWordRecords,
  frozenP57VocabularyHits:4,
  pairOccurrencesInAll43Words:pairOccurrences,
  candidateDhConsumer:{
    modulus:23,
    convention:"[exponent,base] -> base^exponent mod p",
    outputIndices:dhReadout,
    outputWords:dhWords,
    exactReadout:"THE MAP THE THE PATH",
    cycleCollapsedGloss:"THE MAP THE PATH (normalization not source-authenticated)",
    reverseOrientation:{indices:reverseDhReadout,words:reverseDhWords},
    finalPairDhCheck:"19^6 mod 23 = 2 = K",
    openpgpHoldout:{pair:openpgpRecord.pair,index:openpgpDhIndex,word:words[openpgpDhIndex]},
    preselectedReadoutHoldouts:dhConsumerHoldouts
  },
  controls:{
    cyclicRotations:256,
    cyclicExactSequenceCount:cyclicExact.length,
    cyclicExactShifts:cyclicExact.map(item=>item.shift),
    cyclicPositionwiseMaximum:cyclicMax,
    cyclicMaximumShifts:cyclicMaxShifts,
    affineAddressPermutations:128*256,
    affineExactSequenceCount:affineExactCount,
    affinePositionwiseMaximum:affineMax,
    affineMaximumCount:affineMaxCount,
  }
},null,2));
