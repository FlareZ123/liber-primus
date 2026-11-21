"use strict";
/**
 * Exact original GP0(KEY)=49 and GP-prime(MAP)=211 dual-checksum gate.
 * Input: unchanged physical LP2 p32 11x11 runes and p33 red13-separated body81.
 * Run: node sims/lp2_p32_p33_key49_map211_dual_checksum_sft.cjs
 * Selection of geometry and keyword labels was retrospective; this script
 * reports only finite original-input counts and conditional shuffle frequencies.
 * @module lp2_p32_p33_key49_map211_dual_checksum_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const c = JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const gpPrime = c.prime;
/** @param {number[]} x @returns {number} */
const sum = x => x.reduce((s,v)=>s+v,0);
/** @param {number[]} x @returns {number} */
const primeSum = x => x.reduce((s,v)=>s+gpPrime[v],0);
/** @param {string} word @returns {number} */
const gp0 = word => sum([...word].map(ch=>c.translit.indexOf(ch)));
/** @param {number} input @returns {()=>number} */
function xorshift32(input) {
  let state = input >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
}
/** Test the unchanged original source and finite original-cipher controls. */
function run() {
  const p32 = c.pages[32].indices;
  const p33 = c.pages[33].indices;
  assert.equal(p32.length,121);
  assert.equal(p33.length>=91,true);
  const inner81 = Array.from({length:81},(_,i)=>p32[(Math.floor(i/9)+1)*11+1+(i%9)]);
  const body81 = p33.slice(10,91);
  assert.equal(body81.length,81);
  const topPrime = primeSum(p32.slice(0,11));
  const leftPrime = primeSum(Array.from({length:11},(_,i)=>p32[11*i]));
  assert.deepEqual([topPrime,leftPrime],[563,569]);
  assert.equal(gp0("CEY"),49); // Conventional Latin KEY uses GP rune C.
  assert.equal(primeSum([19,24,13]),211); // MAP.
  const keyIndex = sum(inner81),bodyIndex = sum(body81);
  const keyPrime = primeSum(inner81),bodyPrime = primeSum(body81);
  assert.deepEqual([keyIndex,bodyIndex,bodyIndex-keyIndex],[1134,1183,49]);
  assert.deepEqual([keyPrime,bodyPrime,bodyPrime-keyPrime],[4128,4339,211]);

  const corpus = c.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
  assert.equal(corpus.length,12956);
  let runningIndex=sum(corpus.slice(0,81)),runningPrime=primeSum(corpus.slice(0,81));
  let indexHits=0,primeHits=0;
  const dualOffsets=[];
  for(let i=0;i<=corpus.length-81;i++) {
    if(i>0) {
      runningIndex+=corpus[i+80]-corpus[i-1];
      runningPrime+=gpPrime[corpus[i+80]]-gpPrime[corpus[i-1]];
    }
    const key49=runningIndex-keyIndex===49;
    const map211=runningPrime-keyPrime===211;
    indexHits+=key49;
    primeHits+=map211;
    if(key49&&map211)dualOffsets.push(i);
  }
  assert.deepEqual([indexHits,primeHits,dualOffsets],[51,11,[7970]]);

  // Match the source SFT's existing seed, Fisher-Yates shuffle and
  // frozen p32 top-row/left-column condition for a directly comparable null.
  const move=[];
  for(let row=1;row<11;row++)for(let col=1;col<11;col++)move.push(p32[row*11+col]);
  assert.equal(move.length,100);
  const sites=Array.from({length:81},(_,i)=>10*Math.floor(i/9)+i%9);
  const rand=xorshift32(0x56356981);
  const trials=200000;
  let key49=0,map211=0,joint=0;
  for(let t=0;t<trials;t++) {
    const shuffled=move.slice();
    for(let i=shuffled.length-1;i>0;i--) {
      const j=rand()%(i+1);
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    let k0=0,kp=0;
    for(const site of sites) {const n=shuffled[site];k0+=n;kp+=gpPrime[n];}
    const k=bodyIndex-k0===49,m=bodyPrime-kp===211;
    key49+=k;map211+=m;joint+=k&&m;
  }
  assert.deepEqual([key49,map211,joint],[1836,444,46]);
  const output={
    input:{page32:"inner9x9, 81 runes",page33:"red13-delimited body81",topPrime,leftPrime},
    original:{keyIndex,bodyIndex,gp0Difference:bodyIndex-keyIndex,
      keyPrime,bodyPrime,primeDifference:bodyPrime-keyPrime,
      decodedEnglish:"none"},
    originalAllWindow:{windows:12876,key49:indexHits,map211:primeHits,dualOffsets},
    conditionedShuffle:{seed:"0x56356981",trials,key49,map211,joint,
      descriptiveAddOneTail:(joint+1)/(trials+1)},
    interpretation:"Retrospective source labels, no plaintext or selected inverse"
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)run();
module.exports={run};
