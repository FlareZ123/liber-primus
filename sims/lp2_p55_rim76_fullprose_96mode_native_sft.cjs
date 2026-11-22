"use strict";

/**
 * Original p55 complete 76-rune inverse under *all source-visible*
 * first-perimeter keys, with an independent source-native GP language
 * receiver and a matched max-over-models null.
 *
 * The perimeter and 76 runes are original; the proposed GP29 additive
 * key schedule itself is NOT an authenticated Cicada operation.
 *
 * Exact model family:
 * 2 original token radices 59/60 × four corners × two directions ×
 * three classical GP29 additive/Beaufort signs × two explicit clocks
 * (one key consumed per rune, or skip exact observed ciphertext F).
 * Every mode is fixed before any plaintext scoring. No key tuning.
 *
 * The source-native GP29 Shakespeare text trains a 29^3 conditional
 * trigram model. Independent Gibran text supplies 735 held-out windows
 * of 76 GP runes, plus the actual solved p57 text is another control.
 * The exact null shuffles the original p55 cipher 250 times, maximizes
 * over all 96 same modes, and counts best-null exceedances.
 *
 * Windows Node.js 22 CommonJS SFT, no writes, no CLI args:
 *   node sims/lp2_p55_rim76_fullprose_96mode_native_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const C=gp.pages.find(page=>page.page===55).indices;
const known=gp.pages.find(page=>page.page===57).indices;
assert.equal(C.length,76);
assert.equal(known.length,95);
const table=grid.pages.flatMap(p=>p.tokens);
assert.equal(table.length,256);
const rim=[];
for(let col=0;col<8;col++)rim.push(col);
for(let row=1;row<32;row++)rim.push(row*8+7);
for(let col=6;col>=0;col--)rim.push(31*8+col);
for(let row=30;row>=1;row--)rim.push(row*8);
assert.equal(rim.length,76);
assert.equal(new Set(rim).size,76);
const alphabet=grid.alphabet;
const values={};
for(const radix of [59,60]){
 const letters=radix===59?alphabet.replace("f",""):alphabet;
 assert.equal(letters.length,radix);
 values[radix]=table.map(t=>{
  const x=letters.indexOf(t[0]),y=letters.indexOf(t[1]);
  assert(x>=0&&y>=0);
  return (radix*x+y)%29;
 });
}
const mod=n=>((n%29)+29)%29;
/**
 * @typedef {{radix:59|60,corner:number,reverse:boolean,sign:0|1|2,skip:boolean}} Mode
 */
/** @type {Mode[]} */
const modes=[];
for(const radix of [59,60])
for(const corner of [0,7,38,45])
for(const reverse of [false,true])
for(const sign of [0,1,2])
for(const skip of [false,true])
 modes.push({radix,corner,reverse,sign,skip});
assert.equal(modes.length,96);
/**
 * Deterministic ciphertext-F bypass, an optimistic simplified
 * interpretation of the solved p56 plaintext-F nonconsuming clock.
 * @param {number[]} cipher
 * @param {Mode} m
 * @returns {number[]}
 */
function decode(cipher,m){
 const result=[];let step=0;
 for(const c of cipher){
  if(m.skip&&c===0){result.push(0);continue}
  const address=rim[mod76(m.corner+(m.reverse?-step:step))];
  const key=values[m.radix][address];
  const plain=m.sign===0?c-key:m.sign===1?c+key:key-c;
  result.push(mod(plain));step++;
 }
 return result;
}
const mod76=n=>((n%76)+76)%76;
/**
 * Construct a legal and invertible plant from source-native GP symbols.
 * C0 is reserved for transparent F in skip modes, so any non-F source
 * rune that would encrypt to 0 is changed by one symbol in this *plant*.
 * The original p55 ciphertext is never altered.
 * @param {number[]} source
 * @param {Mode} m
 */
function positivePlant(source,m){
 const Cplant=[],Pplant=[];let step=0;
 for(const original of source){
  if(m.skip&&original===0){
   Cplant.push(0);Pplant.push(0);continue;
  }
  const addr=rim[mod76(m.corner+(m.reverse?-step:step))];
  const key=values[m.radix][addr];
  let plain=original;
  let c=m.sign===0?mod(plain+key):
    m.sign===1?mod(plain-key):mod(key-plain);
  if(m.skip&&c===0){
   plain=mod(plain+1);
   c=m.sign===0?mod(plain+key):
     m.sign===1?mod(plain-key):mod(key-plain);
   assert.notEqual(c,0);
  }
  Pplant.push(plain);Cplant.push(c);step++;
 }
 assert.deepEqual(decode(Cplant,m),Pplant);
 return {Cplant,Pplant};
}
for(const m of modes)positivePlant(known.slice(0,76),m);

// Trigram source models are independently trained from Shakespeare GP
// and tested on Gibran GP. The true source-native encoder has correct
// high-priority ING and IO spellings, validated on solved LP1 and p57.
const training=encodeSourceNativeGP(read(
 "resources/control/shakespeare_first300k.txt"));
const heldout=encodeSourceNativeGP(read(
 "resources/control/gibran_prophet_58585.txt"));
assert.equal(training.length,217106);
assert.equal(heldout.length,62492);
const triples=new Uint32Array(29*29*29);
const totals=new Uint32Array(29*29);
for(let i=2;i<training.length;i++){
 const pair=29*training[i-2]+training[i-1];
 totals[pair]++;
 triples[pair*29+training[i]]++;
}
/** @param {number[]} P */
function score(P){
 let total=0;
 for(let i=2;i<P.length;i++){
  const b=29*P[i-2]+P[i-1];
  total+=Math.log((triples[29*b+P[i]]+0.5)/(totals[b]+14.5));
 }
 return total/(P.length-2);
}
const ranking=modes.map(m=>({m,score:score(decode(C,m))}))
 .sort((a,b)=>b.score-a.score);
const best=ranking[0];
assert.deepEqual(best.m,{
 radix:60,corner:7,reverse:true,sign:1,skip:true
});
assert(Math.abs(best.score-(-3.786401474995138))<1e-11);
const sourceScore=score(C);
assert(Math.abs(sourceScore-(-4.014118198822928))<1e-11);
const solvedScore=score(known);
assert(Math.abs(solvedScore-(-2.450567630649583))<1e-11);
const languageControls=[];
for(let start=0;start+76<=heldout.length;start+=85)
 languageControls.push(score(heldout.slice(start,start+76)));
assert.equal(languageControls.length,735);
const minimumHeldout=Math.min(...languageControls);
const meanHeldout=languageControls.reduce((a,b)=>a+b,0)/
 languageControls.length;
assert(Math.abs(minimumHeldout-(-3.1526798643227023))<1e-11);
assert(Math.abs(meanHeldout-(-2.373143081704478))<1e-11);
assert(best.score<minimumHeldout);

// Matched maximum-over-96 shuffle null. Every non-F position and original
// runic frequency is retained in the fixed 76-rune sequence; only order
// changes, with the exact same model-selection and F handling grammar.
let rng=0x3301225;
function random(){
 rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
 return rng>>>0;
}
const nulls=[];
for(let t=0;t<250;t++){
 const shuffled=C.slice();
 for(let i=shuffled.length-1;i>0;i--){
  const j=random()%(i+1);
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 let maximum=-Infinity;
 for(const m of modes)
  maximum=Math.max(maximum,score(decode(shuffled,m)));
 nulls.push(maximum);
}
const exceeding=nulls.filter(x=>x>=best.score).length;
const meanNull=nulls.reduce((a,b)=>a+b,0)/nulls.length;
assert.equal(exceeding,20);
assert(Math.abs(meanNull-(-3.8599516923682566))<1e-11);
assert(Math.abs(Math.max(...nulls)-(-3.6253243986100316))<1e-11);
console.log(JSON.stringify({
 source:"original p50 76-cell clockwise perimeter, original physical p55 76 GP29 rune body",
 modes:modes.length,
 sourceNativeGp:{trainedShakespeareSymbols:training.length,
  independentGibranSymbols:heldout.length,
  heldout76RuneWindows:languageControls.length,
  heldoutMean:meanHeldout,heldoutMinimum:minimumHeldout,
  solvedP57Score:solvedScore},
 original:{rawP55Score:sourceScore,bestScore:best.score,
  bestMode:best.m,
  bestTransliterated:decode(C,best.m).map(v=>gp.translit[v]).join("")},
 nullMaxOver96:{shuffles:250,exceeding,mean:meanNull,
  maximum:Math.max(...nulls)},
 positivePlants:modes.length,
 decision:"Best of 96 original-rim models is still worse than every independent 76-rune native-English control and matched shuffle maxima frequently beat it. This source-visible rim pad does not recover plaintext."
},null,2));
console.log("PASS: 96 original-rim exact positive plants, cross-source GP29 language holdout and 250 max-over-mode shuffles");
