'use strict';

/**
 * Exact five held-out runes from p8's 243 black slots against the
 * nontrivial degree-238 factor of the authentic p49–51 256-byte table.
 *
 * Windows Node22:
 * node sims/lp2_p8_q238_fiveword_recurrence_heldout_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} x */
const read=x=>JSON.parse(fs.readFileSync(path.join(ROOT,x),'utf8'));
const source=read('resources/liber-primus/lp2-corpus.json');
const table=read('resources/liber-primus/lp2-grid-256.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const p8=source.pages[8].indices;
assert.equal(p8.length,255);
assert.deepEqual([ink.pages.find(p=>p.page===8).red_spans[0].start,
  ink.pages.find(p=>p.page===8).red_spans[0].length],[0,12]);
const body=p8.slice(12);
assert.equal(body.length,243);
const mod=x=>((x%29)+29)%29;
/** @param {number[]} a @param {number[]} b */
function mul(a,b){
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++){
    for(let j=0;j<b.length;j++)out[i+j]=mod(out[i+j]+a[i]*b[j]);
  }
  return out;
}
// Independently original-source, previously proved exact factorization.
// All arrays are monic polynomial coefficients HIGH power first.
const factors=[
  [1,10,25], // (X+5)^2
  [1,18,11], // historical 2013 base29 modulus
  [1,14,16,24],
  [1,12,20,10,5,1,9,0,15,11]
];
const smallProduct=factors.reduce(mul,[1]);
assert.equal(smallProduct.length,17);
assert.equal(table.bytes.length,256);
assert.equal(table.bytes[0]%29,0);
const remainder=table.bytes.slice(1).map(x=>mod(-x)); // 28^-1=28
/** @type {number[]} */
const quotient=[];
for(let i=0;i<=remainder.length-smallProduct.length;i++){
  const coefficient=remainder[i];
  quotient.push(coefficient);
  for(let j=0;j<smallProduct.length;j++){
    remainder[i+j]=mod(remainder[i+j]-coefficient*smallProduct[j]);
  }
}
assert.equal(quotient.length,239);
assert.equal(quotient[0],1);
assert.ok(remainder.slice(-16).every(x=>x===0));
const rebuilt=mul(smallProduct,quotient).map(v=>mod(-v));
assert.deepEqual(rebuilt,table.bytes.slice(1).map(x=>x%29));
/** @param {number} x */
function inverse(x){
  for(let j=1;j<29;j++)if(mod(x*j)===1)return j;
  throw new Error('Nonunit');
}
const reciprocal=quotient.slice().reverse()
  .map(x=>mod(x*inverse(quotient.at(-1))));
assert.equal(reciprocal[0],1);
const truth=body.slice(238);
/**
 * Generate the five held-out GF29 symbols from the first 238 states.
 * @param {number[]} initial
 * @param {number[]} characteristic
 */
function continueFive(initial,characteristic){
  assert.equal(initial.length,238);
  assert.equal(characteristic.length,239);
  assert.equal(characteristic[0],1);
  const running=initial.slice();
  for(let i=0;i<5;i++){
    const length=running.length;
    running.push(mod(-characteristic.slice(1).reduce((sum,weight,lag)=>
      sum+weight*running[length-1-lag],0)));
  }
  return running.slice(-5);
}
const direct=continueFive(body.slice(0,238),quotient);
const reverse=continueFive(body.slice(0,238),reciprocal);
assert.deepEqual(truth,[10,28,26,9,12]);
assert.deepEqual(direct,[4,5,26,1,4]);
assert.deepEqual(reverse,[25,13,12,8,19]);
assert.notDeepEqual(direct,truth);
assert.notDeepEqual(reverse,truth);
// True members of each separately sourced LFSR must pass all 5 predictions.
for(const coeff of [quotient,reciprocal]){
  const seed=Array.from({length:238},(_,i)=>mod(7*i*i+11*i+3));
  const encoded=seed.concat(continueFive(seed,coeff));
  assert.deepEqual(continueFive(encoded.slice(0,238),coeff),
    encoded.slice(238));
  assert.equal(encoded.length,243);
}
console.log(JSON.stringify({
  originalP8BlackRunes:243,firstStates:238,heldoutFive:true,
  originalP50Bytes:256,sourceSmallDegree:16,remainingQDegree:238,
  sourceFactorization:'P(X)=28 * (X+5)^2 * H2 * C3 * N9 * Q238',
  sourceFullFactorRoundtrip:true,
  originalHeldout:truth,
  predictedByOriginalQ238:direct,
  predictedByReciprocalQ238:reverse,
  exactSymbolMatches:[direct,reverse].map(v=>
    v.filter((x,i)=>x===truth[i]).length),
  positiveFullFiveSymbolControls:2,
  actualP8CipherSequenceFollowsEitherRecurrence:false,
  recoveredPlaintext:false
},null,2));
