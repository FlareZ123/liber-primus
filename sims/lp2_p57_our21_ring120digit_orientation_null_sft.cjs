"use strict";

/**
 * Original-source exact arithmetic gate for the claimed p57 OUR=21
 * DH-private-exponent candidate from the source-p50 inner 60-ring.
 *
 * In base59, 60 two-digit tokens concatenate to a 120-digit integer.
 * Under DH exponent modulus 150, each TOKEN multiplier is 59^2 = 31,
 * and 31^k = 1+30k (mod 150). The two ring traversal readouts at a
 * fixed initial cell are therefore algebraically paired. Demonstrate the
 * equivalence and estimate the one surviving conditional 1-of-5 event.
 * All inputs source-owned, no ciphertext key/phase/output fitted.
 * Reproduce: node sims/lp2_p57_our21_ring120digit_orientation_null_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/liber-primus/lp2-transcription.txt");
const ALPH=grid.alphabet.replace("f","");
assert.equal(ALPH.length,59);
const values=grid.rows.flat().map(token=>{
  const a=ALPH.indexOf(token[0]),b=ALPH.indexOf(token[1]);
  assert.ok(a>=0&&b>=0);return 59*a+b;
});
assert.equal(values.length,256);
/** Original 32x8 grid ring (depth2), fixed by original p57 phi(MUST)=60. */
function ring(depth){
  const out=[],top=depth,bottom=31-depth,left=depth,right=7-depth;
  for(let c=left;c<=right;c++)out.push(top*8+c);
  for(let r=top+1;r<=bottom;r++)out.push(r*8+right);
  for(let c=right-1;c>=left;c--)out.push(bottom*8+c);
  for(let r=bottom-1;r>top;r--)out.push(r*8+left);
  return out;
}
const cells=ring(2);
assert.equal(cells.length,60);
const origin=cells.indexOf(149);
assert.ok(origin>=0);
const ORIGINAL=Array.from({length:60},(_,i)=>values[cells[(origin+i)%60]]);
const backward=x=>[x[0],...x.slice(1).reverse()];
const MODULUS=150,FACTOR=59*59%MODULUS;
assert.equal(FACTOR,31);
let pow=1;
for(let i=0;i<60;i++){
  assert.equal(pow,(1+30*i)%MODULUS);
  pow=pow*FACTOR%MODULUS;
}
/** @param {number[]} tokens */
function exponent(tokens){
  let out=0;
  for(const x of tokens)out=(out*FACTOR+x)%MODULUS;
  return out;
}
const sum=x=>x.reduce((s,v)=>s+v,0);
const originalSum=sum(ORIGINAL);
const fwd=exponent(ORIGINAL),rev=exponent(backward(ORIGINAL));
assert.equal(originalSum,6951);
assert.equal(originalSum%MODULUS,51);
assert.equal(originalSum%30,21);
assert.equal((92*originalSum)%MODULUS,42);
assert.equal(fwd,21);assert.equal(rev,21);
// Source p57 word "OUR" exact three GP indices, no external words.
const runemap=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=text.split("%").at(-1).replace(/[\/\r\n§&$]/g,"")
  .split(/[-.]/).filter(Boolean).map(word=>{
    const indices=[...word].map(ch=>runemap.get(ch));
    assert.ok(indices.every(x=>x!==undefined));
    return {word:indices.map(i=>corpus.translit[i]).join(""),
      weight:indices.reduce((s,i)=>s+corpus.prime[i],0)};
  });
assert.equal(words.length,20);
assert.equal(words.filter(w=>w.word==="OUR").length,1);
assert.equal(words.find(w=>w.word==="OUR").weight,21);
const contenders=[...new Set(words.filter(w=>w.weight<150)
  .map(w=>w.weight))];
assert.deepEqual(contenders.slice().sort((a,b)=>a-b),[21,55,66,72,86,115]);
assert.deepEqual(contenders.filter(w=>w%30===originalSum%30),[21]);

const trials=200000,results=[];
let state=0x6e0c21ea;
/** Deterministic Xorshift32 used only to draw matched token permutations. */
function random(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
for(const fixedStart of [false,true]){
  let forward21=0,reverse21=0,both21=0,allPair=0;
  const histogram=new Array(5).fill(0);
  for(let trial=0;trial<trials;trial++){
    const arr=ORIGINAL.slice(),first=fixedStart?1:0;
    for(let i=arr.length-1;i>first;i--){
      const j=first+random()%(i+1-first);
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    const a=exponent(arr),b=exponent(backward(arr));
    assert.equal(a%30,21);
    assert.equal(b%30,21);
    assert.equal((a+b)%150,42);
    assert.equal(a===21,b===21);
    histogram[(a-21)/30]++;
    forward21+=+(a===21);reverse21+=+(b===21);
    both21+=+(a===21&&b===21);
    allPair++;
  }
  assert.equal(forward21,reverse21);
  assert.equal(forward21,both21);
  assert.ok(forward21/trials>0.18&&forward21/trials<0.22);
  results.push({fixedStart,trials,conditionalMatches:both21,
    empiricalProbability:both21/trials,allPair,forwardMatches:forward21,
    reverseMatches:reverse21,possibleForwardResidues:[21,51,81,111,141],
    histogram});
}
console.log(JSON.stringify({
  question:"Does p57 OUR=21 in both directions independently select an inner-ring private exponent?",
  original60TokenSum:originalSum,
  sumModulo150:originalSum%150,
  sumModulo30:originalSum%30,
  factor59SquaredModulo150:FACTOR,
  identity:"BOTH orientations sum to 92*(sum of 60 values)=42 mod150 for every permutation",
  originalForward:fwd,originalReverse:rev,
  soleP57ShortWordWithRightMod30:"OUR",
  nulls:results,
  decision:"The two 21 readouts are exactly dependent, and their joint match occurs approximately 20% under matched token shuffling; it does not supply an independent DH private exponent or p55 receiver"
},null,2));
