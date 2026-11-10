"use strict";
/**
 * Key-independent fixed 5-bit GP->ASCII capacity proof.
 * Each of 29 distinct canonical runes gets a different 5-bit integer in 0..31,
 * leaving any three five-bit codewords unused. Every valid 7-bit ASCII output
 * byte must have its high bit zero. Any 5-bit position has only 16 codewords
 * with a zero bit; thus the observed source forces a positive number of invalid
 * high bits for every possible secret injective codebook when the 17th distinct
 * rune occurs at a required-zero position.
 *
 * Tests all eight global bit phases, both reading directions, and manuscript-
 * defined 13-dot fragment clock resets. Source-positive plant encodes ASCII
 * 'A' using a secret injective mapping without hidden codeword loss.
 *
 * No file writes; no external dependencies. Node.js 22 CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {events} = require("./red_256_event_key_inverse.cjs");
const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const unsolved = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(unsolved.length,12956);
const fullBook = corpus.pages.flatMap(p=>p.indices);
assert.equal(fullBook.length,13136);

/**
 * Exact all-injective-alphabet LOWER BOUND on wrong ASCII high bits.
 * The bound independently optimizes each of the five source bit positions,
 * so it is conservative even when their 29 distinct codeword assignments
 * cannot simultaneously be realized.
 *
 * @param {number[]} source GP29 labels
 * @param {number} phase Number of unobserved leading bits, 0..7
 * @returns {{phase:number,bound:number,used:number,coveredHighBits:number,
 *   perDigitBitBounds:number[]}}
 */
function boundForPhase(source,phase) {
  assert.ok(phase>=0 && phase<8 && Number.isInteger(phase));
  const present = [...new Set(source)];
  assert.ok(present.every(x=>x>=0 && x<29 && Number.isInteger(x)));
  const count = Array.from({length:5},()=>new Uint32Array(29));
  let coveredHighBits=0;
  const bitEnd=phase+source.length*5;
  for(let i=0;i<source.length;i++) {
    for(let j=0;j<5;j++) {
      const k=phase+5*i+j;
      // Ignore the first byte even when phase0, and any partial final byte.
      if(k>=8 && k%8===0 && k+8<=bitEnd) {
        count[j][source[i]]++;
        coveredHighBits++;
      }
    }
  }
  const forcedOnes=Math.max(0,present.length-16);
  const perDigitBitBounds=count.map(row=>
    present.map(x=>row[x]).sort((a,b)=>a-b).slice(0,forcedOnes)
      .reduce((a,b)=>a+b,0));
  return {phase,bound:perDigitBitBounds.reduce((a,b)=>a+b,0),
    used:present.length,coveredHighBits,perDigitBitBounds};
}

/** @param {number[]} source */
function allPhases(source) {
  return Array.from({length:8},(_,phase)=>boundForPhase(source,phase));
}

/** Locate a short, fully source-grounded global-prefix contradiction. */
function shortestFailedPrefix(source) {
  let lo=1,hi=source.length;
  while(lo<hi) {
    const mid=(lo+hi)>>1;
    if(allPhases(source.slice(0,mid)).every(x=>x.bound>0))hi=mid;
    else lo=mid+1;
  }
  assert.ok(allPhases(source.slice(0,lo)).every(x=>x.bound>0));
  if(lo>1)assert.ok(allPhases(source.slice(0,lo-1))
    .some(x=>x.bound===0));
  return lo;
}

/** Known ASCII source-positive with secret GP labels. */
function positiveControl() {
  const text=Buffer.alloc(8095,0x41); // ASCII capital 'A'
  const bits=[...text].flatMap(x=>
    Array.from({length:8},(_,j)=>(x>>(7-j))&1));
  assert.equal(bits.length%5,0);
  const words=[];
  for(let i=0;i<bits.length;i+=5) {
    let value=0;
    for(let j=0;j<5;j++)value=value*2+bits[i+j];
    assert.ok(value<=28,"known positive must use 29 admissible codewords");
    words.push(value);
  }
  assert.equal(words.length,12952);
  // A source-independent hidden injective codebook for the used codewords.
  const codebook=new Map();
  for(const value of new Set(words))codebook.set(value,(13*value+7)%29);
  const hidden=[...codebook.values()];
  assert.equal(new Set(hidden).size,hidden.length);
  const cipher=words.map(x=>codebook.get(x));
  const inverse=new Map([...codebook].map(([code,rune])=>[rune,code]));
  const recovered=cipher.map(rune=>inverse.get(rune));
  assert.deepEqual(recovered,words);
  const decoded=[];
  let pending=0,bitsHeld=0;
  for(const word of recovered)
    for(let k=4;k>=0;k--) {
      pending=(pending<<1)|((word>>k)&1);
      if(++bitsHeld===8) {
        decoded.push(pending);
        pending=0;
        bitsHeld=0;
      }
    }
  assert.deepEqual(Buffer.from(decoded),text);
  assert.equal(allPhases(cipher)[0].bound,0);
  return {plaintextBytes:text.length,encodedRunes:cipher.length,
    activeSecretGlyphs:new Set(cipher).size,actualAsciiHighBitsWrong:0,
    exactRecoveredBytes:decoded.length};
}

function fragments() {
  const marks=events().filter(x=>x.kind===0);
  const offsets = new Map();
  let at=0;
  for(const page of corpus.pages) {
    offsets.set(page.page,at);
    at+=page.indices.length;
  }
  const globalMarks=marks.map(m=>offsets.get(m.page)+m.offset);
  assert.equal(globalMarks.length,31);
  assert.equal(globalMarks[27],unsolved.length);
  const cuts=[0,...globalMarks,fullBook.length];
  const out=[];
  for(let i=0;i<32;i++) {
    const source=fullBook.slice(cuts[i],cuts[i+1]);
    const phase=allPhases(source);
    out.push({id:i,start:cuts[i],length:source.length,
      impossible:phase.every(x=>x.bound>0),
      minWrongHighBits:Math.min(...phase.map(x=>x.bound))});
  }
  assert.equal(out.slice(0,28).reduce((a,b)=>a+b.length,0),unsolved.length);
  return out;
}

function run() {
  const forward=allPhases(unsolved);
  const reverse=allPhases(unsolved.slice().reverse());
  const fragment=fragments();
  assert.ok(forward.every(x=>x.bound>0));
  assert.ok(reverse.every(x=>x.bound>0));
  const control=positiveControl();
  return {
    status:"Exact key-independent exclusion of static injective GP five-bit labels directly packed as eight-bit ASCII octets",
    sourceRunes:unsolved.length,
    alphabetSize:29,
    possibleFiveBitValues:32,
    maxDistinctValuesWithZeroAtOneBit:16,
    forwardBounds:forward.map(x=>x.bound),
    reversedBounds:reverse.map(x=>x.bound),
    minGlobalInvalidAsciiHighBits:Math.min(...forward.concat(reverse).map(x=>x.bound)),
    shortestContradictoryForwardPrefix:shortestFailedPrefix(unsolved),
    shortestContradictoryReversePrefix:shortestFailedPrefix(unsolved.slice().reverse()),
    source13DotFragments:fragment.length,
    unsolved13DotFragments:28,
    unsolvedFragmentsIndividuallyImpossible:fragment.slice(0,28)
      .filter(x=>x.impossible).map(x=>({id:x.id,length:x.length,
        lowerBound:x.minWrongHighBits})),
    sourcePositive:control,
    scope:"Only lossless fixed injective 5-bit rune mapping + directly " +
      "7-bit ASCII complete bytes, in both full-book directions and each " +
      "tested source-delimited fragment. Seven-bit packed characters, intermediate binary/UTF-8, " +
      "dynamic mappings, feedback masks and source-selected bit edits remain open."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={boundForPhase,allPhases,shortestFailedPrefix,run};
