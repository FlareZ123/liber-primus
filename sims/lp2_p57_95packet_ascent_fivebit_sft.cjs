"use strict";

/**
 * Five-bit ascent/descent and complete binary-integer interpretations of the
 * original 95 doublet-delimited LP2 GP29 packets. Standalone Windows Node22
 * CommonJS SFT, with an independently supplied original-solved p57 receiver.
 *
 * This does not claim an author-selected opcode or hidden plaintext.
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

/** @typedef {{page:number, indices:number[],runic_count:number}} Page */
/** @typedef {{bits:number[],value:number}} Packet */
/** @type {[number,number][]} */
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedEvents = [4,6,9,10,11,13,12,18,3];
const pages = new Map(corpus.pages.map(p=>[p.page,p]));

/**
 * Returns bits for strict increases (1) or decreases (0).
 * Identical neighbors end one packet and start the next; no bit is emitted.
 * @param {number[][]} chapters
 * @returns {{packets:Packet[],lengths:number[],events:number[]}}
 */
function readPackets(chapters) {
  /** @type {Packet[]} */
  const packets = [];
  const lengths=[],events=[];
  for(const a of chapters) {
    let bits=[],value=0,nEvents=0;
    for(let i=1;i<a.length;i++){
      if(a[i]===a[i-1]){
        packets.push({bits,value});
        nEvents++;
        bits=[];
        value=0;
      } else {
        const bit = a[i]>a[i-1]?1:0;
        bits.push(bit);
        value=(2*value+bit)%29;
      }
    }
    packets.push({bits,value});
    lengths.push(a.length);
    events.push(nEvents);
  }
  return {packets,lengths,events};
}

/** @param {number[]} bits @returns {number} */
function toFive(bits) {
  assert.equal(bits.length,5);
  return bits.reduce((a,b)=>a*2+b,0);
}

/** @param {number} rune @returns {number[]} */
function fiveBits(rune) {
  assert(rune>=0 && rune<=28);
  return Array.from({length:5},(_,i)=>(rune>>(4-i))&1);
}

/** Positive test: encode one genuine p57 rune as five inequalities.
 * Start and finish at 14 so doublet markers delimit the selected codewords.
 * @param {number[]} plaintext
 * @param {number[]} counts
 * @returns {number[][]}
 */
function plant(plaintext,counts) {
  let cursor=0;
  const result=[];
  for(const count of counts) {
    const c=[14];
    for(let j=0;j<count;j++){
      for(const b of fiveBits(plaintext[cursor++])){
        c.push(c.at(-1)+(b?1:-1));
      }
      // Reversible synthetic filler returns to 14 without a forbidden equal step.
      while(c.at(-1)!==14) c.push(c.at(-1)+(c.at(-1)>14?-1:1));
      if(j<count-1) c.push(14); // genuine equality-delimited packet
    }
    result.push(c);
  }
  assert.equal(cursor,plaintext.length);
  return result;
}

/** Exact 5-comparison sign-pattern count under a uniform no-repeat GP29 chain.
 * Allows all 29 starts and 28 alternatives at each step; no empirical fitting.
 * @param {number} pattern
 * @returns {number}
 */
function waysForPattern(pattern) {
  let dp=Array(29).fill(1);
  for(let i=4;i>=0;i--){
    const rise=(pattern>>i)&1;
    const next=Array(29).fill(0);
    for(let prev=0;prev<29;prev++){
      for(let curr=0;curr<29;curr++){
        if(curr!==prev && (curr>prev?1:0)===rise) next[curr]+=dp[prev];
      }
    }
    dp=next;
  }
  return dp.reduce((a,b)=>a+b,0);
}

const chapters = chapterRanges.map(([start,end])=>{
  const result=[];
  for(let p=start;p<=end;p++)result.push(...pages.get(p).indices);
  return result;
});
const totalUnsolved = [...pages.values()]
 .filter(p=>p.page<56).reduce((a,p)=>a+p.indices.length,0);
assert.equal(totalUnsolved,12956);
const {packets,lengths,events}=readPackets(chapters);
assert.deepEqual(lengths,expectedLengths);
assert.deepEqual(events,expectedEvents);
assert.equal(events.reduce((a,b)=>a+b,0),86);
assert.equal(packets.length,95);
assert(packets.every(p=>p.bits.length>=5));

/** @type {number[]} */
const clearP57=pages.get(57).indices;
assert.equal(clearP57.length,95);

const binaryMod29=packets.map(p=>p.value);
const prefix5=packets.map(p=>toFive(p.bits.slice(0,5)));
const suffix5=packets.map(p=>toFive(p.bits.slice(-5)));

function evaluate(values) {
 const invalid=values.reduce((n,x)=>n+(x>=29?1:0),0);
 const matches=values.flatMap((x,i)=>x===clearP57[i]?[i]:[]);
 return {invalid,matches,head:values.slice(0,24).map(x=>x<29?corpus.translit[x]:"?").join("-")};
}
const whole=evaluate(binaryMod29);
const first=evaluate(prefix5);
const last=evaluate(suffix5);
assert.deepEqual(whole.matches,[11,32,61]);
assert.deepEqual(first.matches,[7,53,74,78,94]);
assert.deepEqual(last.matches,[24,36,65,78,91]);
assert.equal(first.invalid,1);
assert.equal(last.invalid,3);
assert(packets.every(p=>p.value>=0 && p.value<29));

const packetCounts=expectedEvents.map(x=>x+1);
const planted=readPackets(plant(clearP57,packetCounts));
const plantReadout=planted.packets.map(p=>toFive(p.bits.slice(0,5)));
assert.deepEqual(planted.events,expectedEvents);
assert.deepEqual(plantReadout,clearP57);
assert.equal(planted.packets.length,95);

const alphabetWays=29*(28**5);
const invalidWays=[29,30,31].reduce((a,x)=>a+waysForPattern(x),0);
const pInvalid=invalidWays/alphabetWays;
const pAtMost1=Math.pow(1-pInvalid,95)+95*pInvalid*Math.pow(1-pInvalid,94);
assert(Math.abs(pInvalid-0.024793136323406913)<1e-12);
assert(Math.abs(pAtMost1-0.3144930238542546)<1e-10);

console.log("LP2 original sign-packet/p57 receiver SFT");
console.log("runes",totalUnsolved,"chapters",chapters.length,"adjacent equalities",86,"packets",packets.length);
console.log("packet sign-bit lengths",Math.min(...packets.map(p=>p.bits.length)),"through",Math.max(...packets.map(p=>p.bits.length)));
console.log("integer mod29",JSON.stringify(whole));
console.log("prefix5",JSON.stringify(first));
console.log("suffix5",JSON.stringify(last));
console.log("uniform nonrepeat-chain P(first five bits encode 29..31)",pInvalid.toFixed(9));
console.log("binomial P(one or fewer invalid values in 95 packets)",pAtMost1.toFixed(9));
console.log("positive p57 synthetic plant 95/95, chapter event counts unchanged");
console.log("PASS: no 95-rune original decoded stream equals solved p57; no plaintext recovered");
