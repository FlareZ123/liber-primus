"use strict";

/**
 * LP2 terminal 5-rune / 25-bit channel candidate, from unmodified source.
 * Run: node sims/lp2_terminal_quintet_overflow_sft.cjs
 * Windows 11, Node.js 22; no dependencies.
 *
 * Original p55 has a one-rune continuation of p54 followed by exactly
 * 75 physical-page body runes. 15 natural 5-rune quintets follow the carry.
 * The raw integer in radix29 takes at most 25 binary bits; a 24-bit/three
 * byte reduction needs a 1-bit overflow flag to retain invertibility.
 *
 * This is a candidate serialization, not an authenticated Cicada instruction.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources",
  "liber-primus","lp2-corpus.json"),"utf8"));
const original=corpus.pages[55].indices;
assert.equal(original.length,76);
const body=original.slice(1);
assert.equal(body.length,75);
const RADIX=29, LIMIT=2**24, MAX=RADIX**5;

/** @param {number[]} quintet @returns {number} */
function quintetValue(quintet) {
  assert.equal(quintet.length,5);
  return quintet.reduce((number,digit)=>{
    assert.ok(Number.isInteger(digit)&&digit>=0&&digit<RADIX);
    return number*RADIX+digit;
  },0);
}

/** @param {number} number @returns {number[]} */
function radix29(number) {
  assert.ok(Number.isInteger(number)&&number>=0&&number<MAX);
  const arr=Array(5);
  for(let i=4;i>=0;i--){arr[i]=number%RADIX;number=Math.floor(number/RADIX);}
  assert.equal(number,0);
  return arr;
}

/** @param {number[]} digits @returns {{bytes:number[],flags:number[],values:number[]}} */
function decode(digits) {
  assert.equal(digits.length%5,0);
  const bytes=[], flags=[], values=[];
  for(let i=0;i<digits.length;i+=5) {
    const number=quintetValue(digits.slice(i,i+5));
    values.push(number);
    const flag=Number(number>=LIMIT), lower=number-flag*LIMIT;
    flags.push(flag);
    bytes.push((lower>>>16)&255,(lower>>>8)&255,lower&255);
  }
  return {bytes,flags,values};
}

/** @param {number[]} bytes @param {number[]} flags @returns {number[]} */
function encode(bytes,flags) {
  assert.equal(bytes.length,3*flags.length);
  return flags.flatMap((flag,i)=>{
    assert.ok(flag===0||flag===1);
    const three=bytes.slice(3*i,3*i+3);
    for(const b of three)assert.ok(Number.isInteger(b)&&b>=0&&b<256);
    const n=flag*LIMIT+(three[0]<<16)+(three[1]<<8)+three[2];
    assert.ok(n<MAX,"not every arbitrary 25-bit value has five GP29 digits");
    return radix29(n);
  });
}
const d=decode(body);
assert.equal(d.bytes.length,45);
assert.equal(d.flags.length,15);
assert.equal(d.flags.join(""),"100100000000000");
assert.deepEqual(encode(d.bytes,d.flags),body);
assert.equal(d.values.filter(v=>v>=LIMIT).length,2);
const hex=d.bytes.map(x=>x.toString(16).padStart(2,"0")).join("");
assert.equal(hex,
  "15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e"+
  "8892b6460c27a66059a2e9bc73106377502d");
const mask="10010"; // reported original p55 left-ornament hollow-site positions
assert.equal(d.flags.slice(0,5).join(""),mask);
assert.equal(d.flags.slice(5,10).join(""),"00000");
// The already-known authentic p55 right ornament has five filled sites.
const checks=[0,1,LIMIT-1,LIMIT,MAX-1].map(v=>{
  const runes=radix29(v);
  const decoded=decode(runes);
  assert.deepEqual(encode(decoded.bytes,decoded.flags),runes);
  return {value:v,carry:decoded.flags[0],runes};
});

/** @param {number[]} arr @param {number} phase @returns {string} */
function carrySignature(arr,phase) {
  const first=arr.slice(phase,phase+75);
  return first.length===75 ? decode(first).flags.join("") : "";
}
const sourceNull=[];
for(const p of corpus.pages.slice(0,56)) {
  for(let phase=0;phase<5;phase++) {
    if(carrySignature(p.indices,phase)===d.flags.join(""))
      sourceNull.push({physicalPage:p.page,phase});
  }
}
assert.deepEqual(sourceNull,[
  {physicalPage:1,phase:0},
  {physicalPage:53,phase:4},
  {physicalPage:55,phase:1}
]);
const nEligible=corpus.pages.slice(0,56).filter(p=>p.indices.length>=79).length*5;
assert.equal(nEligible,265);
const randomOverflowProbability=(MAX-LIMIT)/MAX;
const exactIidPatternProbability=randomOverflowProbability**2*
  (1-randomOverflowProbability)**13;
console.log(JSON.stringify({
  status:"PASS",
  source:"original LP2 physical p55, local indices 1..75",
  originalRuneCount:original.length,
  quintets:15,
  originalOverflowBits:d.flags.join(""),
  matchesPreviouslyDocumentedFiveDotLeftOrnament:mask,
  firstTenBitsMatchFiveHollowFiveFilled:"1001000000",
  originalLow24BytesHex:hex,
  no24BitFixedThreeByteFormat:d.flags.includes(1),
  exactReconstruction:encode(d.bytes,d.flags).every((v,i)=>v===body[i]),
  positiveControl:checks,
  sourcePagePhaseMatches:sourceNull,
  testedPagePhaseWindows:nEligible,
  iid29SinglePrefixedPatternProbability:exactIidPatternProbability,
  conclusion:"speculative lossless 25-bit packing, no unknown plaintext or key"
},null,2));