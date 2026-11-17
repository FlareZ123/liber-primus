"use strict";

/**
 * GP29 carry-key from the two independently solved terminal LP2 pages:
 *   sum(indices(p56 plaintext || p57 plaintext)) = 2204 = 29 * 76.
 * Starting with residue zero and adding printed GP index values generates
 * exactly 76 carry events over a 29-position ring, and ends at zero.
 * P55 is 76 cipher runes. This selects a key SIZE without searching.
 *
 * Source-constrained direct test: both physical page orders; the crossing
 * rune, preceding wheel position, resulting wheel position, or its GP
 * prime-value residue as a 76-symbol event tape; both GP29 additive signs.
 * Test the full 76 original p55 runes with immutable printed word slots.
 *
 * Windows Node22: node sims/lp2_terminal180_76carry_p55_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),"utf8")
  .replace(/\r\n/g,"\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const byLength = new Map();
const runeMap = new Map(gp.runes.map((r,i)=>[r,i]));
const tokens = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const mod = x => (x%29+29)%29;

/** Calibration to established LP1 GP-English orthography.
 * @param {string} word @returns {number[]}
 */
function gpWord(word) {
  word = word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out = [];
  for (let i=0;i<word.length;) {
    if (word.startsWith("ING",i)) {out.push(21);i+=3;}
    else if (word.startsWith("IO",i)) {out.push(27);i+=2;}
    else {
      const t=tokens.find(t=>word.startsWith(t.s,i));
      assert(t, "invalid source GP spelling");
      out.push(t.i);
      i+=t.s.length;
    }
  }
  return out;
}
const dictionary=new Map();
for(const term of read("resources/control/english_wordfreq_textblob.txt")
  .match(/^[a-z]+/gmi)||[]) {
  const p=gpWord(term),key=p.join(",");
  if(p.length===0||p.length>16)continue;
  if(!dictionary.has(key))dictionary.set(key,term);
  if(!byLength.has(p.length))byLength.set(p.length,[]);
  byLength.get(p.length).push(p);
}
assert.equal(dictionary.size,29055);
const sourceP55=transcription.split("%")[54];
const p55Words=[];
let partial=[];
for(const mark of sourceP55) {
  if(runeMap.has(mark)) partial.push(runeMap.get(mark));
  else if("-.$&§".includes(mark) && partial.length) {
    p55Words.push(partial);partial=[];
  }
}
if(partial.length)p55Words.push(partial);
assert.deepEqual(p55Words.map(w=>w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(p55Words.flat(),gp.pages[55].indices);
const p55=gp.pages[55].indices;
assert.equal(p55.length,76);

// Independently authenticated AN END solution and its forward prime clock.
const clearWords = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const clearP56=clearWords.split(" ").flatMap(gpWord);
const clearP57=gp.pages[57].indices;
assert.equal(clearP56.length,85);
assert.equal(clearP57.length,95);
assert.deepEqual(clearP56.filter(v=>v===0),[0]);
assert.equal(clearP56.indexOf(0),56);
const primes=[];
/** @param {number} x @returns {boolean} */
function isPrime(x){for(let j=2;j*j<=x;j++)if(x%j===0)return false;return x>=2}
for(let i=2;primes.length<84;i++)if(isPrime(i))primes.push(i-1);
let pi=0;
const restoredP56=clearP56.map(x=>x===0?0:mod(x+primes[pi++]));
assert.equal(pi,84);
assert.deepEqual(restoredP56,gp.pages[56].indices);
const joined=clearP56.concat(clearP57);
assert.equal(joined.length,180);
assert.equal(joined.reduce((s,x)=>s+x,0),2204);
assert.equal(2204,29*p55.length);

/** Four simple source-output maps at the exact wheel crossings.
 * @param {number[]} source
 * @returns {Record<string,number[]>}
 */
function extract(source) {
  const key={trigger:[],after:[],before:[],primeTrigger:[]};
  let wheel=0;
  for(const rune of source) {
    const before=wheel;
    const total=wheel+rune;
    wheel=total%29;
    if(total>=29) {
      key.trigger.push(rune);
      key.after.push(wheel);
      key.before.push(before);
      key.primeTrigger.push(gp.prime[rune]%29);
    }
  }
  assert.equal(wheel,0);
  for(const seq of Object.values(key))assert.equal(seq.length,76);
  return key;
}

/** @param {number[]} runes @returns {number} Scaled GP29 index of coincidence */
function scaledIoC(runes) {
  const hist=Array(29).fill(0);
  runes.forEach(i=>hist[i]++);
  return 29*hist.reduce((s,n)=>s+n*(n-1),0)
    /(runes.length*(runes.length-1));
}
/** @param {number[]} source @returns {{words:number,matchedWords:number,examples:string[]}} */
function wordScore(source) {
  let cursor=0,matchedWords=0,examples=[];
  for(const [wi,slot] of p55Words.entries()) {
    const part=source.slice(cursor,cursor+slot.length);
    cursor+=slot.length;
    // Original first page rune continues the prior page's final word.
    if(wi===0||slot.length<3)continue;
    const known=dictionary.get(part.join(","));
    if(known){matchedWords++;examples.push(wi+":"+known);}
  }
  assert.equal(cursor,p55.length);
  return {words:p55Words.length-1,matchedWords,examples};
}
const results=[];
for(const [order,known] of [
  ["p56-then-p57",joined],
  ["p57-then-p56",clearP57.concat(clearP56)]]) {
  const keys=extract(known);
  for(const [extractor,key] of Object.entries(keys)) {
    for(const sign of [-1,1]) {
      const plain=p55.map((v,i)=>mod(v+sign*key[i]));
      const rebuilt=plain.map((v,i)=>mod(v-sign*key[i]));
      assert.deepEqual(rebuilt,p55);
      const lexical=wordScore(plain);
      results.push({order,extractor,sign,
        scaledIoC:scaledIoC(plain),...lexical,
        output:plain.map(i=>gp.translit[i]).join(" ")});
    }
  }
}
assert.equal(results.length,16);
const bestCount=Math.max(...results.map(x=>x.matchedWords));
assert.equal(bestCount,1);
assert.equal(results.filter(x=>x.matchedWords===1).length,1);
const bestIoC=Math.max(...results.map(x=>x.scaledIoC));
assert(Math.abs(bestIoC-1.2108771929824561)<0.00001);

// Reversible method-positive: encode a genuine source-native dictionary
// word of each exact original physical slot length and decode by the
// source-frozen natural order's trigger-carry key.
const plant=[gp.pages[57].indices[0]];
for(const slot of p55Words.slice(1)){
  const entries=byLength.get(slot.length);
  assert(entries&&entries.length>0);
  plant.push(...entries[0]);
}
assert.equal(plant.length,76);
const plantedKey=extract(joined).trigger;
const cipher=plant.map((v,i)=>mod(v-plantedKey[i]));
const recovered=cipher.map((v,i)=>mod(v+plantedKey[i]));
assert.deepEqual(recovered,plant);
assert.equal(wordScore(recovered).matchedWords,11);


// Independently motivated anti-repeat receiver: nonzero ciphertext
// predecessor steps rank 1..28, with rank-specific GP28 additive carry
// and literal F/index0 represented by an exact repeated ciphertext rune.
// P55[0] is carried from p54 in the source and serves as IV only.
const rankResults=[];
const stepDuplicates=p55.flatMap((c,i)=>
  i>0&&c===p55[i-1]?[i]:[]);
assert.deepEqual(stepDuplicates,[59]);
for(const [order,known] of [
  ["p56-then-p57",joined],
  ["p57-then-p56",clearP57.concat(clearP56)]]) {
  for(const [extractor,key] of Object.entries(extract(known))) {
    for(const sign of [-1,1]) {
      /** @param {number[]} ciphertext @returns {number[]} */
      function decodeSteps(ciphertext) {
        const plain=[ciphertext[0]];
        for(let i=1;i<ciphertext.length;i++) {
          const delta=mod(ciphertext[i]-ciphertext[i-1]);
          plain.push(delta===0 ? 0
            : 1+((delta-1+sign*(key[i]%28))%28+28)%28);
        }
        return plain;
      }
      /** @param {number[]} plaintext @returns {number[]} */
      function encodeSteps(plaintext) {
        const out=[plaintext[0]];
        for(let i=1;i<plaintext.length;i++) {
          const delta=plaintext[i]===0?0
            :1+((plaintext[i]-1-sign*(key[i]%28))%28+28)%28;
          out.push(mod(out[i-1]+delta));
        }
        return out;
      }
      const candidate=decodeSteps(p55);
      assert.deepEqual(encodeSteps(candidate),p55);
      const synthetic=clearP57.slice(0,76).map((v,i)=>
        i===59?0:v===0?2:v);
      assert.equal(synthetic.length,76);
      assert.deepEqual(decodeSteps(encodeSteps(synthetic)),synthetic);
      const lexical=wordScore(candidate);
      rankResults.push({order,extractor,sign,
        scaledIoC:scaledIoC(candidate),...lexical,
        output:candidate.map(i=>gp.translit[i]).join(" ")});
    }
  }
}
assert.equal(rankResults.length,16);
const bestStepWords=Math.max(...rankResults.map(x=>x.matchedWords));
assert.equal(bestStepWords,1);
assert.equal(rankResults.filter(x=>x.matchedWords===1).length,1);

if(require.main===module)console.log(JSON.stringify({
  status:"new source-exact 76-carry key route; direct GP29 p55 inverse negative",
  original:{p55Runes:76,p56PlaintextRunes:85,p57ClearRunes:95,
    p56FInterruptAt:56,p56PrimeClock:84,
    totalKnownIndexSum:2204,wheelFullTurns:76,
    finalWheelPosition:0,originalWordSlots:p55Words.length},
  tested:results.length,bestDictionaryWords:bestCount,bestScaledIoC:bestIoC,
  plant:{sourceNativeMatchedWords:wordScore(recovered).matchedWords,
    runesReencryptedAndRecovered:recovered.length},
  stepDecoder:{tested:rankResults.length,originalCipherDoubletPositions:stepDuplicates,
    bestDictionaryWords:bestStepWords,allPositiveRecovered:rankResults.length,results:rankResults},
  results,
  interpretation:"All 16 source-limited direct 76-symbol additive carry keys fail to decode coherent p55 text. The exact wheel-closure/key-length identity remains an unverified possible clue, not an authentic author cipher."
},null,2));
