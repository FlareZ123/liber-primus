'use strict';
/**
 * The two authentic 1033/3301 cuneiform numerals are themselves primes.
 * Apply the exact solved p56 successive-prime/totient shift and plaintext-F
 * non-advancing rule, except initialize at each printed numeral as the first
 * prime. No phase, word, or key offsets are fitted to the unknown cipher.
 * Original LP2 item1 is 139 GP29 runes, p36 indices[99:238].
 * Read-only native Windows Node22 SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const page=n=>corpus.pages.find(x=>x.page===n).indices;
const units=[
  page(36).slice(99,238),page(37).slice(0,91),
  page(37).slice(91,189),
  [...page(37).slice(189,228),...page(38).slice(0,57)],
  page(38).slice(57,186)
];
assert.deepEqual(units.map(x=>x.length),[139,91,98,96,129]);
const ciphertext=units.flat(),positive=page(57);
assert.equal(ciphertext.length,553);
assert.equal(positive.length,95);
const mod=n=>((n%29)+29)%29;
/** @param {number} n */
function prime(n){
  if(n<2)return false;
  for(let i=2;i*i<=n;i++)if(n%i===0)return false;
  return true;
}
/** @param {number} seed @param {number} length */
function keyChain(seed,length){
  assert(prime(seed));
  const result=[];
  for(let n=seed;result.length<length;n++)
    if(prime(n))result.push(mod(n-1));
  return result;
}
/** @param {number[]} values */
function ioc(values){
  const count=Array(29).fill(0);
  for(const x of values)count[x]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/**
 * Exhaust every legal plaintext F literal/non-advancing phase history.
 * A source ciphertext F may also be a shifted non-F rune, so branch both.
 * @param {number[]} source
 * @param {number[]} shifts
 * @param {number} sign
 */
function allFSkipPaths(source,shifts,sign){
  let states=new Set([0]);
  for(let i=0;i<source.length;i++){
    const next=new Set();
    for(const j of states){
      if(source[i]===0)next.add(j);
      const plain=mod(source[i]+sign*shifts[j]);
      if(plain!==0)next.add(j+1);
    }
    if(next.size===0)return {firstImpossible:i,legalStates:0};
    states=next;
  }
  return {firstImpossible:null,legalStates:states.size};
}
const expected=[[31,22],[19,29]];
const result=[];
for(const [k,seed] of [1033,3301].entries()){
  const shifts=keyChain(seed,ciphertext.length);
  for(const [j,sign] of [-1,1].entries()){
    const plain=ciphertext.map((v,i)=>mod(v+sign*shifts[i]));
    for(let i=0;i<ciphertext.length;i++)
      assert.equal(mod(plain[i]-sign*shifts[i]),ciphertext[i]);
    const original=allFSkipPaths(ciphertext,shifts,sign);
    assert.equal(original.firstImpossible,expected[k][j]);
    let phase=0;
    const plant=[];
    for(let i=0;i<ciphertext.length;i++){
      const x=positive[i%positive.length];
      plant.push(x===0?0:mod(x-sign*shifts[phase++]));
    }
    const native=allFSkipPaths(plant,shifts,sign);
    assert.equal(native.firstImpossible,null);
    result.push({seed,sign,first10TotientShifts:shifts.slice(0,10),
      direct553Ioc:ioc(plain),
      fTransparentFirstImpossibleRune:original.firstImpossible,
      nativeSolvedP57PlantReplayed:553,
      forwardOriginalReplayed:553});
  }
}
const want=[0.03428597636082501,0.034213905705375164,0.033709411117226196,0.034548051471551745];
result.forEach((r,i)=>assert(Math.abs(r.direct553Ioc-want[i])<1e-13));
console.log(JSON.stringify({
  decision:'prime-seeded p56 exact original decoder algebraically impossible before 32nd ciphertext rune',
  source:'original cuneiform first-party numbers 1033 / 3301',
  note:'other prime/totient receivers or separate keys remain untouched',
  results:result
},null,2));
