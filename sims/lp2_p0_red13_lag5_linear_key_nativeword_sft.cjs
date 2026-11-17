"use strict";
/**
 * Original LP2 p0 red (8+5)-rune header crib test against homogeneous GP29
 * linear running-key recurrence of order 5.
 *
 * Source-conditioned assumptions: visible word boundaries are preserved,
 * GP29 additive cipher and the genuine Cicada plaintext-F bypass operate
 * continuously through the red title and the first black word, no reset at
 * the giant thirteen-dot mark; first word is a GP-native English word.
 * All 29 symbols, including F, are handled. No unknown LP2 language score
 * or ciphertext-derived dictionary is used to select a key.
 *
 * Windows Node22 SFT:
 * node sims/lp2_p0_red13_lag5_linear_key_nativeword_sft.cjs
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
  if(![3,4,5,8].includes(runes.length))return;
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
for(const size of [3,4,5,8])assert(vocab.get(size).size>1000);
const lex5=vocab.get(5),lex4=vocab.get(4),lex3=vocab.get(3);

const fourth=p0.slice(17,20), fifth=p0.slice(20,23);
assert.deepEqual(fourth,[0,11,22]);
assert.deepEqual(fifth,[3,9,2]);
const counts={
  firstWordCribs:0,coefficientCandidates:0,
  titleTwoWords:0,threeWords:0,fourWords:0,fiveWords:0,
  examplesTwo:[],examplesThree:[],examplesFour:[],examplesFive:[]
};
/**
 * Append exactly n key values from an explicit order-5 law, without making
 * per-branch arrays for candidates that immediately fail a word gate.
 * @param {number[]} prefix @param {number[]} co @param {number} n
 */
function pushKeys(prefix,co,n){
  for(let i=0;i<n;i++){
    const t=prefix.length;
    prefix.push(mod(co[0]*prefix[t-1]+co[1]*prefix[t-2]+
      co[2]*prefix[t-3]+co[3]*prefix[t-4]+co[4]*prefix[t-5]));
  }
}
/**
 * Original ciphertext word, all ciphertext symbols nonzero: no plaintext-F
 * branch is legal, so this has exactly one plaintext value per key state.
 * @param {number[]} word @param {number[]} k @param {number} at
 * @returns {string|null}
 */
function straightWord(word,k,at){
  const plain=word.map((c,i)=>mod(c-k[at+i]));
  return plain.includes(0)?null:plain.join(",");
}
let noSkip=0,skip=0;
for(const [encoded,first] of vocab.get(8)){
  const word=encoded.split(",").map(Number);
  const keys=forcedPrefix(word);
  if(!keys)continue;
  counts.firstWordCribs++;
  if(keys.length===7)skip++;else noSkip++;
  const laws=allCoefficients(keys,5);
  for(const co of laws){
    counts.coefficientCandidates++;
    const tape=keys.slice();
    pushKeys(tape,co,23);
    const p2=straightWord(red2,tape,keys.length);
    if(!p2||!lex5.has(p2))continue;
    counts.titleTwoWords++;
    const p3=straightWord(black1,tape,keys.length+5);
    if(counts.examplesTwo.length<12)
      counts.examplesTwo.push({first,second:lex5.get(p2),co,
        firstBlackCandidate:p3&&lex4.get(p3)||null});
    if(!p3||!lex4.has(p3))continue;
    counts.threeWords++;
    const at4=keys.length+9;
    if(counts.examplesThree.length<20)
      counts.examplesThree.push({first,second:lex5.get(p2),
        third:lex4.get(p3),co});
    // Fourth original word starts in ciphertext F; literal F may bypass
    // the key or represent an encrypted non-F. Retain both legal branches.
    const states=decryptBranches(fourth,tape,at4);
    for(const fourthState of states){
      const p4=fourthState.plain.join(",");
      if(!lex3.has(p4))continue;
      counts.fourWords++;
      if(counts.examplesFour.length<20)
        counts.examplesFour.push({first,second:lex5.get(p2),
          third:lex4.get(p3),fourth:lex3.get(p4),co,
          fourthKeyEndsAt:fourthState.end});
      for(const lastState of decryptBranches(fifth,tape,fourthState.end)){
        const p5=lastState.plain.join(",");
        if(!lex3.has(p5))continue;
        counts.fiveWords++;
        if(counts.examplesFive.length<20)
          counts.examplesFive.push({first,second:lex5.get(p2),
            third:lex4.get(p3),fourth:lex3.get(p4),fifth:lex3.get(p5),co});
      }
    }
  }
}
// Independent F-bypass planted positive: three original word geometries,
// including a terminal plaintext F in YOURSELF and a plaintext F within FOR.
const plantWords=["YOURSELF","SHALL","LIFE","AND","ONE"]
  .map(x=>encodeSourceNativeGP(x));
assert.deepEqual(plantWords.map(x=>x.length),[8,5,4,3,3]);
const plantLaw=[6,4,9,2,7], plantSeed=[8,5,17,2,9];
const plantTape=extend(plantSeed,plantLaw,50);
const plantCrypt=[];let at=0;
for(const word of plantWords){
  const t=encrypt(word,plantTape,at);plantCrypt.push(t.cipher);at=t.end;
}
const key0=[];
for(let i=0;i<8;i++)
  if(plantWords[0][i]!==0)
    key0.push(mod(plantCrypt[0][i]-plantWords[0][i]));
assert.equal(key0.length,7);
let recovered=false;
for(const co of allCoefficients(key0,5)){
  const tape=extend(key0,co,30);
  let states=[{end:key0.length}];
  for(let w=1;w<plantWords.length;w++){
    const next=[];
    for(const state of states)
      for(const d of decryptBranches(plantCrypt[w],tape,state.end))
        if(d.plain.join(",")===plantWords[w].join(","))
          next.push({end:d.end});
    states=next;
    if(!states.length)break;
  }
  if(states.length){recovered=true;break;}
}
assert(recovered);
const p57=corpus.pages.find(x=>x.page===57).indices;
assert.equal(p57.length,95);
const p57Key=extend(plantSeed,plantLaw,110);
const p57Cipher=encrypt(p57,p57Key);
assert(decryptBranches(p57Cipher.cipher,p57Key,0)
  .some(s=>s.end===p57Cipher.end&&s.plain.join(",")===p57.join(",")));
console.log(JSON.stringify({
  status:"Original source-native order-five linear-key exact word-crib screen",
  originalWords:[fmt(red1),fmt(red2),fmt(black1),fmt(fourth),fmt(fifth)],
  nativeLexiconCounts:Object.fromEntries([3,4,5,8].map(i=>[i,vocab.get(i).size])),
  originalFBypassFirstWordCases:skip,
  originalAllConsumedFirstWordCases:noSkip,
  ...counts,
  plantedAllFiveWordsExactRecovery:true,
  plantedSolvedP57ExactRecovery:true,
  interpretation:"The candidate family is an all-coefficient GP29 homogeneous lag-5 running additive key with authentic literal-F transparency. Native words required at every step; unknown words remain possible.",
  plaintextRecovered:false
},null,2));
