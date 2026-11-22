"use strict";
/**
 * Frozen source-led 16-position GF(29) Walsh/Hadamard inverse candidate.
 *
 * Premise: the authentic LP2 physical p15 4x4 Fibonacci-prime square offers
 * a 16-cell layout and its already-established spiral order. A small
 * key-free candidate is the involutory Sylvester order-16 transform H,
 * with H^2=16I modulo29. This is a bounded hypothesis, not an authentic
 * cipher instruction.
 *
 * Test unmodified original physical pages 16..22; source orderings are
 * printed 4x4 row-major, established clockwise spiral, and its inverse.
 * Two whole-source clocks and both signed encode/decode conventions are
 * included. English GP trigram training and a separate source-native
 * Gibran 1600-rune planted control establish decoder sensitivity.
 *
 * Run: node sims/lp2_p15_walsh16_direct_inverse_sft.cjs
 * CommonJS Node 22; no external packages; no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=(file)=>fs.readFileSync(path.join(ROOT,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=corpus.pages.filter(p=>p.page>=16&&p.page<=22).map(p=>p.indices);
const RUNES=29, BLOCK=16;
const SPIRAL=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const INVERSE=Array(BLOCK);
SPIRAL.forEach((v,i)=>INVERSE[v]=i);
const ORDERS=[
  Array.from({length:BLOCK},(_,i)=>i),
  SPIRAL,
  INVERSE
];
assert.equal(source.flat().length,1744);

/** @param {string} text @returns {number[]} */
function nativeGP(text) {
  const index=new Map(corpus.translit.map((s,i)=>[s,i]));
  const digraphs=["ING","TH","EO","NG","OE","AE","IA","EA","IO"];
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const found=digraphs.find(k=>word.startsWith(k,i)
        &&index.has(k==="ING"?"NG":k==="IO"?"IA":k));
      if(found!==undefined) {
        out.push(index.get(found==="ING"?"NG":found==="IO"?"IA":found));
        i+=found.length;
      } else {
        const x=index.get(word[i]);
        if(x!==undefined)out.push(x);
        i++;
      }
    }
  }
  return out;
}

/**
 * Smoothed native-GP trigram model trained on pinned Shakespeare,
 * independent of actual unknown LP2.
 * @param {number[]} train
 */
function makeScorer(train) {
  const counts=new Float64Array(RUNES**3);
  const contexts=new Float64Array(RUNES**2);
  for(let i=2;i<train.length;i++) {
    const b=RUNES*train[i-2]+train[i-1];
    counts[RUNES*b+train[i]]++;
    contexts[b]++;
  }
  /** @param {number[]} text */
  return text=>{
    let nats=0;
    for(let i=2;i<text.length;i++) {
      const b=RUNES*text[i-2]+text[i-1];
      nats+=Math.log((counts[RUNES*b+text[i]]+.1)
        /(contexts[b]+RUNES*.1));
    }
    return nats/(text.length-2);
  };
}

/** @param {number} x @returns {-1|1} */
function sign(x) {
  let v=x;
  v^=v>>2;v^=v>>1;
  return (v&1)?-1:1;
}

/**
 * Matrix H has H_ij=(-1)^popcount(i&j); H^2=16I (mod29).
 * Its inverse is 20*H because 16*20=1 (mod29).
 * @param {number[]} block
 * @param {number[]} inputOrder
 * @param {number[]} outputOrder
 * @param {number} scalar
 * @returns {number[]}
 */
function transform(block,inputOrder,outputOrder,scalar) {
  assert.equal(block.length,BLOCK);
  const input=inputOrder.map(i=>block[i]);
  const output=Array(BLOCK);
  for(let i=0;i<BLOCK;i++) {
    let total=0;
    for(let j=0;j<BLOCK;j++)total+=sign(i&j)*input[j];
    output[outputOrder[i]]=((total*scalar)%RUNES+RUNES)%RUNES;
  }
  return output;
}

/**
 * @param {number[][]} parts
 * @param {number} inputKey
 * @param {number} outputKey
 * @param {number} scalar
 * @param {boolean} reset
 * @returns {number[]}
 */
function inverseCandidate(parts,inputKey,outputKey,scalar,reset) {
  const sections=reset?parts:[parts.flat()];
  const output=[];
  for(const part of sections) {
    for(let i=0;i+BLOCK<=part.length;i+=BLOCK)
      output.push(...transform(part.slice(i,i+BLOCK),
        ORDERS[inputKey],ORDERS[outputKey],scalar));
  }
  return output;
}

function main() {
  const train=nativeGP(read("resources/control/shakespeare_first300k.txt"));
  const independent=nativeGP(read("resources/control/gibran_prophet_58585.txt"));
  assert.equal(train.length,217106);
  assert.equal(independent.length,62492);
  const score=makeScorer(train);
  const original=source.flat();
  const trials=[];
  for(const reset of [true,false])
    for(let inputKey=0;inputKey<ORDERS.length;inputKey++)
      for(let outputKey=0;outputKey<ORDERS.length;outputKey++)
        for(const signFlip of [1,-1])
          for(const inverse of [true,false]) {
            const scalar=signFlip*(inverse?20:1);
            const candidate=inverseCandidate(source,inputKey,outputKey,scalar,reset);
            trials.push({
              reset,inputKey,outputKey,signFlip,inverse,
              symbols:candidate.length,
              scoreNatsPerRune:score(candidate)
            });
          }
  trials.sort((a,b)=>b.scoreNatsPerRune-a.scoreNatsPerRune);

  const plant=independent.slice(1000,2600),encrypted=[],recovered=[];
  for(let i=0;i<plant.length;i+=BLOCK)
    encrypted.push(...transform(plant.slice(i,i+BLOCK),SPIRAL,INVERSE,1));
  for(let i=0;i<encrypted.length;i+=BLOCK)
    recovered.push(...transform(encrypted.slice(i,i+BLOCK),INVERSE,SPIRAL,20));
  assert.deepEqual(recovered,plant);
  assert.equal(recovered.length,1600);
  const result={
    decision:"Direct 16-point Walsh/Hadamard decoder is nonlinguistic on original pp16-22; source does not select the transform",
    originalRunes:original.length,
    baselineNatsPerRune:score(original),
    bestOriginal:trials[0],
    bottomOriginal:trials[trials.length-1],
    variants:trials.length,
    positive:{runes:recovered.length,exactRecovered:true,
      independentPlainScore:score(plant),
      encryptedScore:score(encrypted)},
    boundaries:"48 runes of page-local incomplete blocks omitted only in page-reset modes",
    limits:"Only these key-free 16-point GF29 Sylvester transforms, orders, clocks and signs; no source-authenticated cipher or plaintext"
  };
  assert.ok(result.bestOriginal.scoreNatsPerRune< -4.50);
  assert.ok(result.positive.independentPlainScore> -3.00);
  return result;
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={nativeGP,makeScorer,transform,inverseCandidate,main};
