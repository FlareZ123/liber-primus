"use strict";
/**
 * LP2 p24-p26 original three-mayfly word-weave obstruction.
 *
 * SFT: node sims/lp2_p24p26_whole_word_weave_original_sft.cjs
 * Windows 11 / Node 22 / CommonJS; read-only, no third-party packages.
 * All source files are read locally from the repository.
 *
 * A permutation of intact original words, including optional reversal of
 * any entire word, cannot change their combined 29-rune histogram or IoC.
 * The finite English tests here condition on the exact 178 source word sizes
 * while the lexicon check grants three broad period-plausible GP registers.
 * These tests reject only the direct native-prose word-weave interpretation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")
  .replace(/\r\n/g, "\n");
const corpusText = read("resources/liber-primus/lp2-corpus.json");
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const gp = JSON.parse(corpusText);
const runes = new Map(gp.runes.map((r, i) => [r, i]));
const N = 29;
const targets = new Set([24, 25, 26]);

/** @typedef {{r:number,p:number}} SourceRune */
/** @type {SourceRune[][]} */
const words = [];
/** @type {SourceRune[]} */
let working = [];
let physicalPage = 0;
/** @type {number[][]} */
const pageRunes = Array.from({length: 58}, () => []);
function emitWord() {
  if (working.length) words.push(working);
  working = [];
}
// Percent is a physical-page divider, never a word delimiter. Hyphen,
// period, and section stops are word delimiters; slash/newline are visual
// line wraps. Numeric/object text outside rune alphabet is ignored.
for (const glyph of transcript) {
  if (glyph === "%") {
    physicalPage++;
  } else if (runes.has(glyph)) {
    const r = runes.get(glyph);
    working.push({r, p:physicalPage});
    pageRunes[physicalPage].push(r);
  } else if ("-.$&".includes(glyph)) {
    emitWord();
  }
}
emitWord();
assert.deepEqual([24,25,26].map(p => pageRunes[p].length),
  [270,273,265]);
for (const p of [24,25,26]) {
  assert.deepEqual(pageRunes[p],
    gp.pages.find(row => row.page === p).indices);
}
const complete = words.filter(w => w.every(x => targets.has(x.p)));
const touching = words.filter(w => w.some(x => targets.has(x.p)));
const source = complete.flatMap(w => w.map(x => x.r));
assert.equal(complete.length, 178);
assert.equal(source.length, 805);
assert.equal(touching.length, 179);
assert.equal(touching.reduce((sum,w) => sum+w.length,0), 812);
assert.equal([24,25,26].reduce((n,p) => n+pageRunes[p].length,0),808);
const equals = complete.reduce((n,w) => n+w.slice(1)
  .filter((x,i) => x.r === w[i].r).length, 0);
const opportunities = complete.reduce((n,w) => n+w.length-1, 0);
assert.deepEqual([equals,opportunities], [8,627]);

/** @param {number[]} arr */
function frequencies(arr) {
  const f = new Uint32Array(N);
  for (const v of arr) f[v]++;
  return [...f];
}
/** @param {number[]} arr */
function indexOfCoincidence(arr) {
  return frequencies(arr).reduce((sum,x) => sum+x*(x-1),0) /
    (arr.length*(arr.length-1));
}
/** @param {number[]} arr */
function topFive(arr) {
  return frequencies(arr).sort((a,b) => b-a).slice(0,5)
    .reduce((sum,x)=>sum+x,0);
}
const originalIoc = indexOfCoincidence(source);
const originalTopFive = topFive(source);
assert(Math.abs(originalIoc - 0.034399431414356786) < 1e-15);
assert.equal(originalTopFive,171);

// Deterministic, deliberately unnatural complete-word permutation with
// intermittent complete-word reversals; trace indices for exact inversion.
// It has no alleged historical source selector. This is a class invariant
// positive, not evidence of a Cicada decoder.
const reordered = complete.map((_, i) => (i*37) % complete.length);
assert.equal(new Set(reordered).size,complete.length);
const moved = reordered.map((j,i) => i%3===0
  ? complete[j].map(x=>x.r).reverse()
  : complete[j].map(x=>x.r));
const tape = moved.flat();
assert.deepEqual(frequencies(tape),frequencies(source));
assert.equal(indexOfCoincidence(tape),originalIoc);
assert.equal(topFive(tape),originalTopFive);
const restored = Array(complete.length);
reordered.forEach((j,i) => {
  restored[j] = i%3===0 ? moved[i].slice().reverse() : moved[i].slice();
});
assert.deepEqual(restored.flat(),source);

// Source-native GP English spelling calibrations. GP spellings "ING" and
// "IO" are attested in solved LP1. Encode EACH word independently.
const tokenOrder = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]|null} */
function encodeWord(word) {
  const s=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<s.length;) {
    if(s.startsWith("ING",i)){result.push(21);i+=3;continue;}
    if(s.startsWith("IO",i)){result.push(27);i+=2;continue;}
    const m=tokenOrder.find(t=>s.startsWith(t.s,i));
    if(!m)return null;
    result.push(m.i);
    i+=m.s.length;
  }
  return result;
}
const LP1=read("resources/liber-primus/lp1-plaintext-reference.txt");
const p57=LP1.split("### 57\n")[1].trim();
const p57encoded=(p57.match(/[A-Z]+/g)||[])
  .flatMap(w=>encodeWord(w));
assert.deepEqual(p57encoded,gp.pages.find(p=>p.page===57).indices,
  "authenticated independent solved p57 GP spelling");

const sources=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const lexicon=new Map();
const bankBySource=[];
for(const [label,file] of sources){
  const text=read(file);
  const start=label==="Shakespeare"?0:text.search(/\*\*\* START OF/i);
  const body=start>0?text.slice(start+30):text;
  const buckets=new Map();
  for(const word of body.match(/[A-Za-z]+/g)||[]){
    const runes=encodeWord(word);
    if(!runes)continue;
    if(!buckets.has(runes.length))buckets.set(runes.length,[]);
    buckets.get(runes.length).push(runes);
    const key=runes.join(",");
    if(!lexicon.has(key))lexicon.set(key,{word,label});
  }
  bankBySource.push({label,buckets});
}
assert.equal(lexicon.size,12228);
let forwardWords=0,forwardRunes=0,bothWords=0,bothRunes=0;
const matched=[];
for(let i=0;i<complete.length;i++){
  const r=complete[i].map(x=>x.r);
  const f=lexicon.get(r.join(","));
  const b=lexicon.get(r.slice().reverse().join(","));
  if(f){forwardWords++;forwardRunes+=r.length;}
  if(f||b){
    bothWords++;bothRunes+=r.length;
    matched.push({sourceWordOrdinal:i,GP29Length:r.length,
      direct:f?.word||null,reversed:b?.word||null});
  }
}
assert.deepEqual([forwardWords,forwardRunes,bothWords,bothRunes],
  [5,8,7,14]);

/** @param {number} seed */
function rng(seed){
  let state=seed>>>0;
  return max=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)%max;
  };
}
const lengths=complete.map(w=>w.length);
const trials=2000;
const controls=[];
for(const {label,buckets} of bankBySource){
  const select=rng(0x9e3779b9^label.length);
  const missing=[...new Set(lengths)].filter(len=>!buckets.get(len)?.length);
  assert.deepEqual(missing,[], label+" missing original word length");
  let minIoC=Infinity,minTopFive=Infinity,meanIoC=0,meanTopFive=0;
  let atOrBelowIoc=0,atOrBelowTopFive=0;
  for(let trial=0;trial<trials;trial++){
    const donor=[];
    for(const size of lengths){
      const pool=buckets.get(size);
      donor.push(...pool[select(pool.length)]);
    }
    const io=indexOfCoincidence(donor);
    const t5=topFive(donor);
    minIoC=Math.min(minIoC,io);
    minTopFive=Math.min(minTopFive,t5);
    meanIoC+=io;
    meanTopFive+=t5;
    if(io<=originalIoc)atOrBelowIoc++;
    if(t5<=originalTopFive)atOrBelowTopFive++;
  }
  assert.equal(atOrBelowIoc,0,label+" original IoC shape gate");
  assert.equal(atOrBelowTopFive,0,label+" original top5 shape gate");
  controls.push({label,trials,minIoC,meanIoC:meanIoC/trials,
    minTopFive,meanTopFive:meanTopFive/trials,
    atOrBelowIoc,atOrBelowTopFive});
}

console.log("LP2 p24-p26 whole-word and reverse-word weave original SFT PASS");
console.log(JSON.stringify({
  inputs:{
    corpusSHA256:crypto.createHash("sha256").update(corpusText).digest("hex"),
    transcriptionSHA256:crypto.createHash("sha256").update(transcript).digest("hex"),
    literalOriginalPageRunes:[270,273,265],
    completeOriginalWords:complete.length,
    completeOriginalRuneCount:source.length,
    untouchedPageCarryRunes:3,
    adjacentEqualWithinWords:equals,
    adjacentEligiblePositions:opportunities
  },
  permutationInvariants:{originalIoc,originalTopFive,
    arbitraryEntireWordOrderAndSomeReversalsReplayed:true,
    matchedInPeriodCorpusLexicon:{
      GP29Spellings:lexicon.size,forwardWords,forwardRunes,
      forwardOrReversedWords:bothWords,forwardOrReversedRunes:bothRunes,
      originalWords:complete.length,
      originalRunes:source.length,matched
    }},
  sourceNativeControls:controls,
  conclusion:"Pure word/rune rearrangement cannot restore source-matched GP-native English across all 805 intact ciphertext runes. A separate source-selected rune-changing operation is still required."
},null,2));
