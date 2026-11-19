"use strict";

/**
 * Source-bounded inverse: five original numbered LP2 passages, round-robin
 * column mixing, and the historically solved page-56 prime-totient pad.
 * Candidate only. A failing original-language result does not reject other
 * mix clocks, transpositions, encodings, or keys.
 * @returns {void}
 */
function main() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
  ));
  /** @param {number} n @returns {number[]} */
  const page = n => corpus.pages.find(p => p.page === n).indices;
  const input = [...page(36).slice(99), ...page(37), ...page(38).slice(0, 186)];
  const lengths = [139, 91, 98, 96, 129];
  assert.equal(input.length, 553);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 553);

  const parts = [];
  for (let i = 0, offset = 0; i < lengths.length; i++) {
    parts.push(input.slice(offset, offset + lengths[i]));
    offset += lengths[i];
  }

  /**
   * Visit source numbered passages column-by-column, skipping exhausted
   * passages without adding symbols.
   * @param {boolean} reverse
   * @returns {{stream:number[], originalPositions:number[]}}
   */
  function interleave(reverse) {
    const indices = reverse ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
    const starts = [0, 139, 230, 328, 424];
    const stream = [];
    const originalPositions = [];
    for (let col = 0; col < 139; col++) {
      for (const row of indices) {
        if (col < lengths[row]) {
          stream.push(parts[row][col]);
          originalPositions.push(starts[row] + col);
        }
      }
    }
    assert.equal(stream.length, input.length);
    const recovered = Array(input.length);
    originalPositions.forEach((offset, i) => { recovered[offset] = stream[i]; });
    assert.deepEqual(recovered, input);
    return {stream, originalPositions};
  }

  const primes = [];
  for (let n = 2; primes.length < input.length; n++) {
    let prime = true;
    for (const p of primes) {
      if (p * p > n) break;
      if (n % p === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  const key = primes.map(p => (p - 1) % 29);
  /** @param {number[]} sequence @returns {number} */
  function ioc(sequence) {
    const counts = Array(29).fill(0);
    sequence.forEach(i => counts[i]++);
    return counts.reduce((s, n) => s + n * (n - 1), 0) /
      (sequence.length * (sequence.length - 1));
  }
  /** @param {number[]} sequence @param {number} sign @returns {number[]} */
  const shift = (sequence, sign) =>
    sequence.map((c, i) => (c + sign * key[i] + 29) % 29);

  const models = [
    ["as-printed", input],
    ["round-robin-1-to-5", interleave(false).stream],
    ["round-robin-5-to-1", interleave(true).stream]
  ];
  const results = [];
  for (const [model, sequence] of models) {
    for (const sign of [-1, 1]) {
      const output = shift(sequence, sign);
      assert.deepEqual(shift(output, -sign), sequence);
      results.push({
        model, sign, length: output.length, ioc: ioc(output),
        beginning: output.slice(0, 35).map(i => corpus.translit[i]).join(" ")
      });
    }
  }
  const expected = [
    .03418114631653432, .034797022826742144,
    .03466598527137878, .0346201221270016,
    .0347642634379013, .034823230337814814
  ];
  assert.equal(results.length, expected.length);
  results.forEach((r, i) => assert.ok(Math.abs(r.ioc - expected[i]) < 1e-12));
  assert.ok(Math.max(...results.map(r => r.ioc)) < 0.035);
  
/* Exact F-transparent p56 inverse on as-printed and mixed five-passage streams. */
const wordTranscription=fs.readFileSync(path.join(ROOT,"resources","lp2-transcription.txt"),"utf8").replaceAll("\r","");
const wordRuneIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const wordSegments=wordTranscription.split("%").slice(0,55);
function parseWordPage(segment){
 let runeOffset=0,current=[],currentStart=0;const words=[];
 function finish(){if(current.length){words.push({start:currentStart,end:runeOffset,values:current.slice()});current=[];}}
 for(const ch of segment){
  if(wordRuneIndex.has(ch)){if(!current.length)currentStart=runeOffset;current.push(wordRuneIndex.get(ch));runeOffset++;}
  else if(ch==="/"||/\s/u.test(ch)){}
  else finish();
 }
 finish();return {runeCount:runeOffset,words};
}
const wordPages=wordSegments.map(parseWordPage);
for(const p of [36,37,38])assert.equal(wordPages[p].runeCount,page(p).length);
const wordSpecs=[
 [{page:36,start:99,end:238}],
 [{page:37,start:0,end:91}],
 [{page:37,start:91,end:189}],
 [{page:37,start:189,end:228},{page:38,start:0,end:57}],
 [{page:38,start:57,end:186}],
];
const wordPassages=wordSpecs.map((pageParts,passageIndex)=>{
 const words=[];let offset=0;
 for(const part of pageParts){
  for(const w of wordPages[part.page].words.filter(x=>x.start<part.end&&x.end>part.start)){
   assert.ok(w.start>=part.start&&w.end<=part.end);
   words.push({values:w.values,start:offset});offset+=w.values.length;
  }
 }
 assert.equal(offset,lengths[passageIndex]);return words;
});
assert.deepEqual(wordPassages.map(p=>p.length),[30,20,25,19,28]);
function interleaveWholeWords(reverse){
 const order=reverse?[4,3,2,1,0]:[0,1,2,3,4],stream=[],positions=[],wordOrder=[];
 for(let col=0;col<Math.max(...wordPassages.map(p=>p.length));col++){
  for(const row of order){
   const w=wordPassages[row][col];if(!w)continue;
   for(let i=0;i<w.values.length;i++){stream.push(w.values[i]);positions.push(starts[row]+w.start+i);}
   wordOrder.push({passage:row+1,word:col+1,runes:w.values.length});
  }
 }
 assert.equal(stream.length,input.length);
 assert.equal(new Set(positions).size,input.length);
 const restored=Array(input.length);positions.forEach((pos,i)=>{restored[pos]=stream[i];});
 assert.deepEqual(restored,input);
 return {stream,wordOrder};
}
function inverseFTransparent(cipher,sign){
 let states=new Map([[0,1n]]);
 for(let pos=0;pos<cipher.length;pos++){
  const next=new Map(),value=cipher[pos];
  for(const [phase,count] of states){
   if(value===0)next.set(phase,(next.get(phase)||0n)+count);
   const plain=((value-sign*key[phase])%29+29)%29;
   if(plain!==0)next.set(phase+1,(next.get(phase+1)||0n)+count);
  }
  if(!next.size)return {firstImpossible:pos,phaseStates:0,phaseRange:null,pathCount:"0"};
  states=next;
 }
 return {firstImpossible:null,phaseStates:states.size,phaseRange:[Math.min(...states.keys()),Math.max(...states.keys())],
  pathCount:[...states.values()].reduce((s,n)=>s+n,0n).toString()};
}
function forwardFTransparent(plain,sign){
 let phase=0;return plain.map(value=>{if(value===0)return 0;const c=((value+sign*key[phase])%29+29)%29;phase++;return c;});
}
const fTransparentSequences=[
 {name:"as-printed",stream:input},
 {name:"rune-round-robin-1-to-5",stream:interleave(false).stream},
 {name:"rune-round-robin-5-to-1",stream:interleave(true).stream},
 {name:"word-round-robin-1-to-5",stream:interleaveWholeWords(false).stream},
 {name:"word-round-robin-5-to-1",stream:interleaveWholeWords(true).stream},
];
const expectedFailures={
 "as-printed":{"1":1,"-1":13},
 "rune-round-robin-1-to-5":{"1":31,"-1":21},
 "rune-round-robin-5-to-1":{"1":29,"-1":14},
 "word-round-robin-1-to-5":{"1":1,"-1":9},
 "word-round-robin-5-to-1":{"1":45,"-1":7},
};
const fTransparentVariants=[];
for(const seq of fTransparentSequences)for(const sign of [1,-1]){
 const result=inverseFTransparent(seq.stream,sign);
 assert.equal(result.firstImpossible,expectedFailures[seq.name][String(sign)]);
 assert.equal(result.phaseStates,0);
 fTransparentVariants.push({sequence:seq.name,sign,runes:seq.stream.length,...result});
}
assert.deepEqual(fTransparentVariants.map(x=>x.firstImpossible),[1,13,31,21,29,14,1,9,45,7]);
const p57=page(57);assert.equal(p57.length,95);
const planted=Array.from({length:input.length},(_,i)=>p57[i%p57.length]);
const fTransparentPositiveControls=[1,-1].map(sign=>{
 const result=inverseFTransparent(forwardFTransparent(planted,sign),sign);
 assert.equal(result.firstImpossible,null);assert.ok(BigInt(result.pathCount)>0n);
 return {sign,plaintextLength:planted.length,...result};
});
const fTransparentP56Gate={
 wordPassageCounts:wordPassages.map(p=>p.length),
 totalWords:wordPassages.reduce((s,p)=>s+p.length,0),
 forwardWordOrder:interleaveWholeWords(false).wordOrder.slice(0,15),
 reverseWordOrder:interleaveWholeWords(true).wordOrder.slice(0,15),
 variants:fTransparentVariants,
 positiveControls:fTransparentPositiveControls,
 classification:"no legal F-transparent p56 plaintext history for any of ten as-printed/rune/word interleave variants; p57 positive controls pass"
};
assert.equal(fTransparentP56Gate.totalWords,122);

console.log(JSON.stringify({
    source: "Original LP2 pp36-38, numbered 1-5, 553 GP29 runes",
    originalIoc: ioc(input), primeCount: key.length,
    keyRule: "k_j = (jth prime - 1) mod 29; phase zero at source enclosure",
    outcomes: results,
  fTransparentP56Gate,
    conclusion: "No direct native GP29 plaintext under these six fixed mixes and signed shifts"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main};
