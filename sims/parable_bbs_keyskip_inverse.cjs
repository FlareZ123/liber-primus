"use strict";
/**
 * Historical three-prime Cicada Parable modular-squaring source, original-LP2
 * additive GP29 inverse with collision-only hidden key re-draws.
 *
 * Source prime products, BBS generators, and extraction functions come from
 * parable_threeprime_bbs_source_inverse.cjs. The exact skip Viterbi is the
 * established source-independent grid_stream_collision_viterbi.cjs solver.
 *
 * This is a source-motivated hypothesis test, not a claimed historical cipher.
 * Run: node sims/parable_bbs_keyskip_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {keyGenerator}=require("./parable_threeprime_bbs_source_inverse.cjs");
const {viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pageIds=[0,3,8,23,27,40],trainCount=130,holdCount=80;
const original=pageIds.map(page=>corpus.pages[page].indices.slice(0,trainCount+holdCount));
assert(original.every(p=>p.length===210));
const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const MOD=29,mod=x=>(x%MOD+MOD)%MOD;
const N3=BigInt(1259*1031*1229),N2=BigInt(1259*1031);
const source=[
  {label:"Parable-threeprime",modulus:N3},
  {label:"Parable-Blum-twofactor",modulus:N2}
];
const seeds=[761,1033,3301,3299,2013,2014];
const formats=["state-low8","state-low5","bits5-lsb","bits5-msb","bits8-msb"];
/** @param {bigint} modulus @param {number} seed @param {string} format */
function pad(modulus,seed,format){
  const next=keyGenerator(modulus,seed,format);
  return Array.from({length:320},()=>next()%29);
}
/** @param {number[]} cipher @param {number[]} padStream @param {number} sign */
function twoStage(cipher,padStream,sign){
  const first=viterbi(cipher.slice(0,trainCount),padStream,sign,lm);
  const held=viterbi(cipher.slice(trainCount,trainCount+holdCount),
    padStream.slice(trainCount+first.skips),sign,lm);
  return {train:first.perRune,hold:held.perRune,
    guessedSkips:first.skips+held.skips,
    head:held.plaintext.slice(0,20).map(x=>corpus.translit[x]).join("")};
}
function evaluate(texts){
  const out=[];
  for(const {label,modulus} of source)for(const seed of seeds)
    for(const format of formats){
      const key=pad(modulus,seed,format);
      for(const sign of [-1,1]){
        let s1=0,s2=0,skips=0;
        let heads=[];
        for(const cipher of texts){
          const result=twoStage(cipher,key,sign);
          s1+=result.train;s2+=result.hold;skips+=result.guessedSkips;
          if(heads.length<2)heads.push(result.head);
        }
        out.push({source:label,seed,format,sign,
          train:s1/texts.length,hold:s2/texts.length,
          inferredSkips:skips,heldoutHeads:heads});
      }
    }
  out.sort((a,b)=>b.train-a.train);
  assert.equal(out.length,120);
  return out;
}
function random(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
function positive(){
  const plain=encode(read("resources/control/shakespeare_first300k.txt").slice(215000));
  assert(plain.length>=pageIds.length*(trainCount+holdCount));
  const trueKey={source:"Parable-threeprime",seed:3301,format:"bits5-msb",sign:1};
  const key=pad(N3,trueKey.seed,trueKey.format),draw=random(0x7613301);
  let synthetic=[],trueWords=[],skipped=0;
  for(let i=0;i<pageIds.length;i++){
    const selected=plain.slice(i*210,(i+1)*210),cipher=[];
    let index=0,previous=-1;
    for(const p of selected){
      let c=mod(p+key[index]);
      if(c===previous && draw()<.81){
        index++;
        c=mod(p+key[index]);
        skipped++;
      }
      cipher.push(c);previous=c;index++;
    }
    assert(index<=320);
    synthetic.push(cipher);trueWords.push(selected);
  }
  const ranked=evaluate(synthetic);
  const best=ranked[0];
  assert(Object.entries(trueKey).every(([name,val])=>best[name]===val),
    "unknown planted modular-squaring key must rank first");
  let matched=0,total=0;
  for(let p=0;p<pageIds.length;p++){
    const predicted=viterbi(synthetic[p],key,trueKey.sign,lm);
    for(let i=0;i<210;i++){
      matched+=Number(predicted.plaintext[i]===trueWords[p][i]);total++;
    }
  }
  assert(total===1260);
  assert(matched>=.85*total);
  return {source:trueKey,plantedKeySkips:skipped,blindSelected:best,
    exactRecoveredPlainRunes:matched,total,accuracy:matched/total,
    secondBest:ranked[1]};
}
function main(){
  const result=evaluate(original);
  const p=positive();
  console.log(JSON.stringify({question:"historical Parable-prime modular-squaring key with collision-only key skips",
    sourcePrimes:[1259,1031,1229],models:result.length,
    sixOriginalPages:pageIds,trainPerPage:trainCount,heldoutPerPage:holdCount,
    bestTrain:result.slice(0,8),bestHeldPostselected:[...result].sort((a,b)=>b.hold-a.hold).slice(0,3),
    planted:p,
    result:"No authentic original LP2 key/plaintext unless decoded heldouts form verified native-GP language"},null,2));
}
if(require.main===module)main();
module.exports={pad,twoStage,evaluate,positive,main};
