"use strict";
/**
 * Original LP2 p0 red (8+5)-rune header crib test against homogeneous GP29
 * linear running-key recurrences of orders 1 through 4.
 *
 * Source-conditioned assumptions: visible word boundaries are preserved,
 * GP29 additive cipher and the genuine Cicada plaintext-F bypass operate
 * continuously through the red title and the first black word, no reset at
 * the giant thirteen-dot mark; first word is a GP-native English word.
 * All 29 symbols, including F, are handled. No unknown LP2 language score
 * or ciphertext-derived dictionary is used to select a key.
 *
 * Windows Node22 SFT:
 * node sims/lp2_p0_red13_gf29_linear_title_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const base = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(base,file),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p0 = corpus.pages.find(x=>x.page===0).indices;
assert.equal(p0.length,262);
const red1 = p0.slice(0,8), red2 = p0.slice(8,13);
const black1 = p0.slice(13,17);
assert.deepEqual(red1,[15,8,18,3,6,19,27,0]);
assert.deepEqual(red2,[15,26,18,21,5]);
assert.deepEqual(black1,[2,11,6,25]);
const mod = x => ((x%29)+29)%29;
const fmt = seq => seq.map(x=>corpus.translit[x]).join("-");
/** @param {number} n */
function inv(n) {
  for(let v=1;v<29;v++)if(mod(n*v)===1)return v;
  throw Error("Inverse of zero");
}
/**
 * Enumerate exactly every coefficient vector fitting an observed prefix.
 * K[t] = sum_{j=0}^{q-1} coeff[j]*K[t-j-1] (mod29).
 * Null means inconsistent equations. Rank deficiency is enumerated, not
 * silently collapsed to one arbitrary fitted recurrence.
 * @param {number[]} prefix
 * @param {number} q
 * @returns {number[][]}
 */
function allCoefficients(prefix,q) {
  const rows = [];
  for(let t=q;t<prefix.length;t++)
    rows.push([...Array.from({length:q},(_,j)=>prefix[t-j-1]),prefix[t]]);
  let rank=0; const pivot=[];
  for(let j=0;j<q&&rank<rows.length;j++){
    let at=rank;
    while(at<rows.length && rows[at][j]===0)at++;
    if(at===rows.length)continue;
    [rows[rank],rows[at]]=[rows[at],rows[rank]];
    const factor=inv(rows[rank][j]);
    for(let col=j;col<=q;col++)rows[rank][col]=mod(rows[rank][col]*factor);
    for(let r=0;r<rows.length;r++)if(r!==rank&&rows[r][j]){
      const mul=rows[r][j];
      for(let col=j;col<=q;col++)rows[r][col]=mod(rows[r][col]-mul*rows[rank][col]);
    }
    pivot.push(j);rank++;
  }
  for(let r=rank;r<rows.length;r++)
    if(rows[r][q]!==0)return [];
  const free=[];
  for(let j=0;j<q;j++)if(!pivot.includes(j))free.push(j);
  const out=[];const candidate=Array(q).fill(0);
  function visit(i){
    if(i===free.length){
      for(let r=rank-1;r>=0;r--){
        let v=rows[r][q];
        for(let j=pivot[r]+1;j<q;j++)v-=rows[r][j]*candidate[j];
        candidate[pivot[r]]=mod(v);
      }
      out.push(candidate.slice());
      return;
    }
    for(let value=0;value<29;value++){
      candidate[free[i]]=value;visit(i+1);
    }
  }
  visit(0);
  return out;
}
/** @param {number[]} prefix @param {number[]} coeff @param {number} count */
function extend(prefix,coeff,count) {
  const k=prefix.slice(),q=coeff.length;
  for(let i=0;i<count;i++){
    const t=k.length;
    k.push(mod(coeff.reduce((sum,a,j)=>sum+a*k[t-j-1],0)));
  }
  return k;
}
/**
 * Exact forward authentic additive + plaintext-F-transparent encryption.
 * @param {number[]} plain @param {number[]} key
 * @param {number} start
 * @returns {{cipher:number[],end:number}}
 */
function encrypt(plain,key,start=0){
  const cipher=[]; let at=start;
  for(const p of plain) {
    if(p===0)cipher.push(0);
    else {cipher.push(mod(p+key[at]));at++;}
  }
  return {cipher,end:at};
}
/**
 * Source-native actual p0 first-word crib. Plaintext F must be literal
 * ciphertext F and must not consume any keystream state.
 * @param {number[]} word
 * @returns {number[]|null}
 */
function forcedPrefix(word) {
  const key=[];
  for(let i=0;i<red1.length;i++){
    const p=word[i],c=red1[i];
    if(p===0){
      if(c!==0)return null;
    }else key.push(mod(c-p));
  }
  return key;
}
/**
 * Extend a fitted recurrence, inverse the next original word. Every
 * consumed ciphertext rune must decrypt to a non-F plaintext rune.
 * This routine handles F-ciphertext ambiguity through explicit branching
 * and supports authentic source controls.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} start
 * @returns {{plain:number[],end:number}[]}
 */
function decryptBranches(ciphertext,key,start){
  let states=[{plain:[],end:start}];
  for(const c of ciphertext){
    const next=[];
    for(const state of states){
      if(c===0)next.push({plain:[...state.plain,0],end:state.end});
      const p=mod(c-key[state.end]);
      if(p!==0)next.push({plain:[...state.plain,p],end:state.end+1});
    }
    states=next;
  }
  return states;
}
const vocab=new Map();
const sources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
let rawCount=0;
function add(word) {
  if(!/^[a-z]+$/i.test(word))return;
  const runes=encodeSourceNativeGP(word);
  if(![4,5,8].includes(runes.length))return;
  if(!vocab.has(runes.length))vocab.set(runes.length,new Map());
  const k=runes.join(",");
  if(!vocab.get(runes.length).has(k))vocab.get(runes.length).set(k,word.toUpperCase());
  rawCount++;
}
for(const file of sources)
  for(const word of read(file).match(/[A-Za-z]+/g)||[])add(word);
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
  const m=/^([a-z]+)\s+\d+$/.exec(line);
  if(m)add(m[1]);
}
for(const size of [4,5,8])assert(vocab.get(size).size>1000);
const lex5=vocab.get(5),lex4=vocab.get(4);
const results=Array.from({length:4},(_,i)=>({
  order:i+1,cribsTried:0,inconsistentCribs:0,
  recurrenceCandidates:0,titleTwoWordHits:0,threeWordHits:0,
  twoWordExamples:[],threeWordExamples:[]
}));
let noSkipCribs=0, skipCribs=0;
for(const [key,crib] of vocab.get(8)){
  const first=key.split(",").map(Number);
  const stream=forcedPrefix(first);
  if(!stream)continue;
  if(stream.length===8)noSkipCribs++;else skipCribs++;
  for(let order=1;order<=4;order++){
    const entry=results[order-1];entry.cribsTried++;
    const coeffs=allCoefficients(stream,order);
    if(!coeffs.length){entry.inconsistentCribs++;continue;}
    for(const coeff of coeffs){
      entry.recurrenceCandidates++;
      const tape=extend(stream,coeff,12);
      const following=decryptBranches(red2,tape,stream.length)
        .filter(s=>lex5.has(s.plain.join(",")));
      for(const second of following){
        entry.titleTwoWordHits++;
        const black=decryptBranches(black1,tape,second.end)
          .filter(s=>lex4.has(s.plain.join(",")));
        if(entry.twoWordExamples.length<15)entry.twoWordExamples.push({
          first:crib,second:lex5.get(second.plain.join(",")),
          coeff,secondRune:fmt(second.plain),
          predictedBlack:fmt(decryptBranches(black1,tape,second.end)[0]?.plain||[])
        });
        for(const third of black){
          entry.threeWordHits++;
          if(entry.threeWordExamples.length<15)entry.threeWordExamples.push({
            first:crib,second:lex5.get(second.plain.join(",")),
            third:lex4.get(third.plain.join(",")),coeff});
        }
      }
    }
  }
}
// Original independently solved plain LP2 p57 is an exact GP-native plant
// for the emitter/reader, as well as a control for genuine F transparency.
const p57=corpus.pages.find(x=>x.page===57).indices;
assert.equal(p57.length,95);
const seed=[8,5,17,2];
const law=[6,4,9,2];
const sourceTape=extend(seed,law,p57.length+20);
const nativeCipher=encrypt(p57,sourceTape);
assert.deepEqual(decryptBranches(nativeCipher.cipher,sourceTape,0)
  .filter(x=>x.end===nativeCipher.end).map(x=>x.plain)
  .some(x=>x.join(",")===p57.join(",")),true);
assert.deepEqual(encrypt(p57,sourceTape).cipher,nativeCipher.cipher);
// Recover the planted four-term recurrence from a source-native 8+5+4
// plaintext title (including genuine final-F nonconsumption).
const words=["YOURSELF","SHALL","LIFE"].map(x=>encodeSourceNativeGP(x));
assert.deepEqual(words.map(x=>x.length),[8,5,4]);
const firstPlant=encrypt(words[0],sourceTape,0);
const secondPlant=encrypt(words[1],sourceTape,firstPlant.end);
const thirdPlant=encrypt(words[2],sourceTape,secondPlant.end);
const plantPrefix=[];
for(let i=0,at=0;i<words[0].length;i++)
  if(words[0][i]!==0)plantPrefix.push(mod(firstPlant.cipher[i]-words[0][i]));
const plantCoefficients=allCoefficients(plantPrefix,4);
assert(plantCoefficients.some(x=>x.join(",")===law.join(",")));
const plantRecovered=plantCoefficients.some(x=>{
  const k=extend(plantPrefix,x,15);
  return decryptBranches(secondPlant.cipher,k,plantPrefix.length)
    .some(s=>s.plain.join(",")===words[1].join(",")&&
      decryptBranches(thirdPlant.cipher,k,s.end)
        .some(t=>t.plain.join(",")===words[2].join(",")));
});
assert(plantRecovered);
for(const entry of results){
  assert(entry.cribsTried===noSkipCribs+skipCribs);
  assert(entry.threeWordHits<=entry.titleTwoWordHits*5);
}
console.log(JSON.stringify({
  status:"source-native bounded original negative; no unknown plaintext",
  originalRedTitleWordLengths:[8,5],
  firstBlackWordLength:4,
  sourceRunes:[fmt(red1),fmt(red2),fmt(black1)],
  independentWordSources:[...sources,"resources/control/english_wordfreq_textblob.txt"],
  rawVocabularyEntriesAdded:rawCount,
  uniqueVocabularyByGP29Length:Object.fromEntries([4,5,8].map(x=>[x,vocab.get(x).size])),
  viableEightRuneCribs:noSkipCribs+skipCribs,
  firstWordNonconsumingF:skipCribs,
  firstWordAllConsuming:noSkipCribs,
  recurrenceOrders:results,
  plantedP57ExactRerender:true,
  plantedThreeWordsExactRecovery:true,
  plaintextRecovered:false,
  scope:"unknown-page GP29 English, fixed printed 8+5+4 word geometry, additive linear order<=4, authentic plaintext-F bypass, uninterrupted clock"
},null,2));
