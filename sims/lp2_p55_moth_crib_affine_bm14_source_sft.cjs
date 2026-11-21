"use strict";
/**
 * Original p55 terminal-moth quotation: affine order-14 extrapolation.
 *
 * The source LP1 moth page supplies a *hypothetical*, unverified p55
 * 30-rune terminal crib, THE TOTIENT FUNCTION IS SACRED ALL THINGS.
 * For every secret a in F29* and b in F29, compute the additive residue
 * K_i = C_i - aP_i - b. Berlekamp-Massey determines the least recurrence
 * from the 30 terminal samples. Predict the 46 genuine ORIGINAL preceding
 * ciphertext positions under the strongest short-recurrence candidate.
 *
 * All 812 hypotheses and a fixed 192-replicate random-cipher null included.
 * This is a candidate original-text decryption attempt, NOT proof of a
 * true LP2 crib, key, cipher, or plaintext.
 *
 * SFT: node sims/lp2_p55_moth_crib_affine_bm14_source_sft.cjs
 * Windows 11, Node 22, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const p55 = corpus.pages.find(p=>p.page===55).indices;
const p57 = corpus.pages.find(p=>p.page===57).indices;
assert.equal(p55.length,76);
const lens=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(lens.reduce((x,y)=>x+y,0),76);
assert.equal(lens.slice(0,10).reduce((x,y)=>x+y,0),46);
const plainCrib=encodeSourceNativeGP("THE TOTIENT FUNCTION IS SACRED ALL THINGS");
assert.deepEqual(plainCrib,[2,18,16,3,16,10,18,9,16,0,1,9,5,16,
  27,9,10,15,15,24,5,4,18,23,24,20,20,2,21,15]);
const mod=x=>(x%29+29)%29;
const inverses=Array.from({length:29},(_,x)=>{
  if(!x)return 0;
  for(let i=1;i<29;i++)if(x*i%29===1)return i;
  throw Error("noninvertible");});

/**
 * Return shortest connection polynomial 1 + sum_{i=1..L} C[i] X^i.
 * @param {number[]} s
 * @returns {{L:number,C:number[]}}
 */
function berlekampMassey(s){
  let C=[1], B=[1], L=0, m=1, b=1;
  for(let n=0;n<s.length;n++){
    let d=s[n];
    for(let i=1;i<=L;i++)d=mod(d+(C[i]||0)*s[n-i]);
    if(d===0){m++;continue;}
    const previous=C.slice(),factor=mod(d*inverses[b]);
    while(C.length<B.length+m)C.push(0);
    for(let j=0;j<B.length;j++)C[j+m]=mod(C[j+m]-factor*B[j]);
    if(2*L<=n){L=n+1-L;B=previous;b=d;m=1;}
    else m++;
  }
  return {L,C};
}
/**
 * @param {number[]} c30 Source terminal ciphertext
 * @param {number} a Nonzero GP29 affine slope
 * @param {number} b GP29 affine intercept
 * @returns {number[]}
 */
function forcedKey(c30,a,b){
  return plainCrib.map((p,i)=>mod(c30[i]-a*p-b));
}
/** @param {number[]} c30 */
function scan(c30){
  const hist={};let low=31;
  const candidates=[];
  for(let a=1;a<29;a++)for(let b=0;b<29;b++){
    const {L,C}=berlekampMassey(forcedKey(c30,a,b));
    hist[L]=(hist[L]||0)+1;
    if(L<low)low=L;
    if(L<=14)candidates.push({a,b,L,C});
  }
  return {low,hist,candidates};
}
/**
 * Extrapolate earlier key positions by exact inversion of the fixed
 * shortest recurrence. Only last coefficient nonzero gives backward
 * invertibility over GF29.
 * @param {number[]} known
 * @param {{L:number,C:number[]}} recurrence
 * @param {number} previousLength
 * @returns {number[]}
 */
function backPredict(known,recurrence,previousLength){
  const {L,C}=recurrence;
  assert(L>0 && C[L]!==0);
  const all=known.slice();
  for(let j=0;j<previousLength;j++){
    let s=all[0];
    for(let i=1;i<L;i++)s+=C[i]*all[i];
    all.unshift(mod(-s*inverses[C[L]]));
  }
  for(let i=0;i<all.length-L;i++){
    const end=i+L;
    let total=all[end];
    for(let j=1;j<=L;j++)total+=C[j]*all[end-j];
    assert.equal(mod(total),0);
  }
  return all;
}
const observed=scan(p55.slice(46));
assert.deepEqual(observed.hist,{"14":1,"15":785,"16":26});
assert.equal(observed.low,14);
assert.equal(observed.candidates.length,1);
const chosen=observed.candidates[0];
assert.deepEqual({a:chosen.a,b:chosen.b,L:chosen.L},
  {a:20,b:8,L:14});
assert.deepEqual(chosen.C,[1,22,11,27,25,21,21,21,4,8,26,9,6,3,2]);
const observedKey=backPredict(forcedKey(p55.slice(46),chosen.a,chosen.b),
  chosen,46);
const originalCandidate=p55.map((c,i)=>
  mod((c-chosen.b-observedKey[i])*inverses[chosen.a]));
assert.deepEqual(originalCandidate.slice(46),plainCrib);
assert.deepEqual(originalCandidate.map((p,i)=>
  mod(chosen.a*p+chosen.b+observedKey[i])),p55);
let start=0;
const first46Words=lens.slice(0,10).map(len=>{
  const word=originalCandidate.slice(start,start+len)
    .map(x=>corpus.translit[x]).join("");
  start+=len;return word;
});
assert.deepEqual(first46Words,[
  "OE","OENGH","FX","DTH","NGAYWWN","PPCWAW",
  "XIA","PBEATHWGTHYYFEAN","LWTHNGIAA","SIFI"
]);

// Unrelated positive control with a true 14th-degree key recurrence,
// source-native solved p57 runes, and a second known solved LP1 suffix.
// Recover 46 held-out plaintext positions without giving them to BM.
const positivePlain=p57.slice(0,46).concat(plainCrib);
const coeff=[1,3,5,7,11,13,17,19,23,2,4,6,8,10,12];
const key=Array.from({length:14},(_,i)=>(i+1)%29);
for(let i=14;i<76;i++){
  let total=0;for(let j=1;j<=14;j++)total+=coeff[j]*key[i-j];
  key.push(mod(-total));
}
const encrypted=positivePlain.map((p,i)=>mod(20*p+8+key[i]));
const fitted=berlekampMassey(forcedKey(encrypted.slice(46),20,8));
assert.equal(fitted.L,14);
const inverseKey=backPredict(forcedKey(encrypted.slice(46),20,8),
  fitted,46);
const recovered=encrypted.map((c,i)=>
  mod((c-8-inverseKey[i])*inverses[20]));
assert.deepEqual(recovered,positivePlain);

// Comparison: minimize BM order over the SAME 812 guesses on 192
// independently generated 30-GP29-symbol random suffixes.
let state=0x5514a330;
function next(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)%29;
}
const trials=192, control={best13OrLess:0,best14:0,best15OrMore:0,
  exactlyOneOrder14:0, multipleOrder14:0};
for(let t=0;t<trials;t++){
  const s=Array.from({length:30},next);
  const out=scan(s);
  if(out.low<=13)control.best13OrLess++;
  else if(out.low===14)control.best14++;
  else control.best15OrMore++;
  const count14=out.candidates.filter(x=>x.L===14).length;
  if(count14===1)control.exactlyOneOrder14++;
  if(count14>1)control.multipleOrder14++;
}
assert.deepEqual(control,{best13OrLess:0,best14:121,
  best15OrMore:71,exactlyOneOrder14:66,multipleOrder14:55});
console.log(JSON.stringify({
  model:"C=a*P+b+K mod29 with unknown affine a,b and BM 30-rune suffix",
  sourcePage:55, sourceRunes:76,
  sourceCrib:"THE TOTIENT FUNCTION IS SACRED ALL THINGS (UNVERIFIED)",
  affineKeys:812, orderHistogram:observed.hist,
  uniqueOrder14:chosen, first46CandidateWords:first46Words,
  controlRandomSuffixes:trials, control, positiveReconstruction:76,
  observation:"No intelligible preceding source words; null often attains order14"
},null,2));
console.log("PASS: exact original source, 812-key enumeration, 46 withheld decoding, positive inverse, random controls.");
