"use strict";

/**
 * Original-input source support gate for LP2 one-rune printed words.
 * Run: node sims/lp2_singleton_word_state_lower_bound_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const CHAPTERS = [[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]];
const EXPECTED = [[5,5],[8,7],[11,9],[18,12],[5,5],[12,8],[9,9],[13,11],[2,2]];

/**
 * @param {number} distinct Number of different observed ciphertext runes.
 * @param {number} plaintextTypes Maximum count of allowed one-rune plaintext words.
 * @returns {number} Required independent deterministic maps.
 */
function minimumStates(distinct, plaintextTypes) {
  assert(Number.isInteger(distinct) && distinct >= 0);
  assert(Number.isInteger(plaintextTypes) && plaintextTypes > 0);
  return Math.ceil(distinct / plaintextTypes);
}

/**
 * @param {Array<{runes:string,startPage:number,length:number}>} words
 * @param {number} firstPage Inclusive original physical page.
 * @param {number} endPage Exclusive original physical page.
 * @returns {{wordCount:number,distinct:number,glyphs:number[],minimumStates:{two:number,three:number,four:number}}}
 */
function measure(words, firstPage, endPage) {
  const singleton = words.filter(w => w.length === 1 &&
    physicalLP2Page(w.startPage) >= firstPage &&
    physicalLP2Page(w.startPage) < endPage);
  const glyphs = [...new Set(singleton.map(w => corpus.runes.indexOf(w.runes)))].sort((a,b)=>a-b);
  assert(glyphs.every(x => x>=0 && x<29));
  return {wordCount:singleton.length,distinct:glyphs.length,glyphs,
    minimumStates:{two:minimumStates(glyphs.length,2),
      three:minimumStates(glyphs.length,3),four:minimumStates(glyphs.length,4)}};
}

/**
 * @param {number} state State index in [0,13].
 * @returns {number[]} Complete bijective GP29 alphabet substitution.
 */
function plantPermutation(state) {
  assert(Number.isInteger(state) && state>=0 && state<14);
  const m = Array(29).fill(-1);
  m[24]=2*state;
  m[10]=2*state+1;
  const remain = Array.from({length:29},(_,i)=>i).filter(x=>x!==m[24]&&x!==m[10]);
  let index=0;
  for(let i=0;i<29;i++) if(m[i]<0) m[i]=remain[index++];
  assert.equal(new Set(m).size,29);
  return m;
}

/** @returns {{states:number,symbolsRecovered:number,distinctOutputs:number}} */
function runPlant() {
  const maps=Array.from({length:14},(_,s)=>plantPermutation(s));
  const expected=[],observed=[],decoded=[];
  for(let state=0;state<14;state++){
    const inverse=Array(29);
    maps[state].forEach((output,input)=>{inverse[output]=input});
    for(const input of [24,10]){
      const output=maps[state][input];
      expected.push(input);
      observed.push(output);
      decoded.push(inverse[output]);
    }
  }
  assert.deepEqual(decoded,expected);
  assert.equal(new Set(observed).size,28);
  assert(2*13<28);
  return {states:14,symbolsRecovered:decoded.length,distinctOutputs:new Set(observed).size};
}

/**
 * Page-clock exact witness. At the same native page-local rune offset 2,
 * printed complete singleton words appear on p2, p25, p39 with outputs
 * U=1, G=6, TH=2. A reused deterministic page-local alphabet with only A/I
 * inputs could have produced at most two different outputs here.
 * A page-reset additive GP29 pad also cannot fit these three outputs
 * when plaintext may be A/I/O (checked by exact intersection).
 * @returns {{localIndex:number,witness:Array<{physicalPage:number,index:number}>,candidateKeysAIO:number[][],sharedAdditiveKeys:number[]}}
 */
function pageLocalSingletonWitness() {
  const fs=require("node:fs");
  const path=require("node:path");
  const raw=fs.readFileSync(path.join(__dirname,"..","resources","lp2-transcription.txt"),"utf8");
  const stream=raw.split("%").slice(0,55).join("%");
  const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
  let page=0,local=0,lineLocal=0,global=0,current=[],begin=null,nonemptyLines=0,inLine=false;
  const one=[];
  function finish(){
    if(current.length===1)one.push({...begin,index:current[0]});
    current=[];
  }
  for(const ch of stream){
    const index=runeMap.get(ch);
    if(index!==undefined){
      if(current.length===0)begin={physicalPage:physicalLP2Page(page),localIndex:local,lineIndex:lineLocal,globalIndex:global};
      current.push(index);
      global++;
      local++;
      lineLocal++;
      inLine=true;
    }else if(ch==="%"){if(inLine)nonemptyLines++;inLine=false;page++;local=0;lineLocal=0}
    else if(ch==="/"||ch==="\n"){if(inLine)nonemptyLines++;inLine=false;lineLocal=0}
    else if(/\s/u.test(ch)){}
    else finish();
  }
  finish();
  if(inLine)nonemptyLines++;
  assert.equal(nonemptyLines,594);
  assert.equal(global,12956);
  assert.equal(one.length,83);
  const witness=one.filter(w=>w.localIndex===2).map(
    w=>({physicalPage:w.physicalPage,index:w.index}));
  assert.deepEqual(witness,[
    {physicalPage:2,index:1},
    {physicalPage:25,index:6},
    {physicalPage:39,index:2},
  ]);
  assert.equal(new Set(witness.map(w=>w.index)).size,3);
  const candidateKeysAIO=witness.map(w=>[24,10,3].map(p=>(w.index-p+29)%29));
  const sharedAdditiveKeys=candidateKeysAIO[0].filter(key=>
    candidateKeysAIO.every(keys=>keys.includes(key)));
  assert.deepEqual(sharedAdditiveKeys,[]);
  const lineWitness=one.filter(w=>w.lineIndex===18).map(w=>({
    physicalPage:w.physicalPage,index:w.index}));
  assert.deepEqual(lineWitness,[
    {physicalPage:1,index:9},
    {physicalPage:10,index:6},
    {physicalPage:18,index:13},
    {physicalPage:30,index:8},
    {physicalPage:34,index:22},
    {physicalPage:35,index:7},
  ]);
  assert.equal(new Set(lineWitness.map(w=>w.index)).size,6);
  const sourceIndices=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  const predecessorW = previous => one.filter(
    w=>w.localIndex>0 && sourceIndices[w.globalIndex-1]===previous).map(
      w=>({physicalPage:w.physicalPage,index:w.index}));
  const prev17=predecessorW(17);
  assert.deepEqual(prev17,[
    {physicalPage:3,index:21},
    {physicalPage:6,index:19},
    {physicalPage:12,index:14},
    {physicalPage:21,index:28},
    {physicalPage:28,index:15},
    {physicalPage:41,index:22},
  ]);
  const prev23=predecessorW(23);
  assert.deepEqual(prev23,[
    {physicalPage:10,index:10},
    {physicalPage:13,index:11},
    {physicalPage:18,index:16},
    {physicalPage:19,index:4},
    {physicalPage:29,index:19},
    {physicalPage:48,index:1},
  ]);
  assert.equal(new Set(prev17.map(w=>w.index)).size,6);
  assert.equal(new Set(prev23.map(w=>w.index)).size,6);
  const predecessorFeedback={prev17,prev23,distinctAtEach:6,
    minimumAdditionalMaps:{two:3,three:2,five:2}};
  return {localIndex:2,witness,candidateKeysAIO,sharedAdditiveKeys,
    nonemptyLines,predecessorFeedback,lineOffset18:{witness:lineWitness,distinct:6,
      minimumStateMaps:{two:3,three:2}}};

}

/**
 * One frozen original-input schedule preflight for the original p15
 * Fibonacci-prime spiral and the already-published BASE29 expansion.
 * Phase zero is the first original unsolved rune; no key search occurs.
 * @param {Array<{runes:string,length:number}>} words All original unsolved words.
 * @returns {{candidate:string,period:number,distinctAlphabets:number,singletonMatchesAI:number,singletonMatchesAIO:number}[]}
 */
function p15SourceScheduleGate(words) {
  const differences=[3299,3298,3296,3294,3288,3278,3258,3222,
    3152,3038,2838,2472,1820,708,1206,4516];
  const primes=[2,3,5,7,13,23,43,79,149,263,463,829,
    1481,2593,4507,7817];
  assert.deepEqual(differences,primes.map(p=>Math.abs(3301-p)));
  const digits="0123456789ABCDEFGHIJKLMNOPQRS";
  const publishedKey="3QM3QL3QJ3QH3QB3Q13PA3O33LK3HM3AP2R724MOC1CH5AL";
  const base29=publishedKey.split("").map(c=>digits.indexOf(c));
  assert.equal(base29.length,47);
  assert(base29.every(n=>n>=0&&n<29));
  const base29String=n=>{
    let x=n;
    let out="";
    do {out=digits[x%29]+out;x=Math.floor(x/29)} while(x>0);
    return out;
  };
  assert.equal(differences.map(base29String).join(""),publishedKey);
  let offset=0;
  const singleton=[];
  for(const word of words){
    if(word.length===1)singleton.push({
      offset,cipher:corpus.runes.indexOf(word.runes)});
    offset+=word.length;
  }
  assert.equal(offset,12956);
  assert.equal(singleton.length,83);
  const schedules=[
    {candidate:"p15 printed differences mod29",key:differences.map(n=>n%29)},
    {candidate:"p15 recovered primes mod29",key:primes.map(n=>n%29)},
    {candidate:"p15 printed BASE29 digits",key:base29},
  ];
  const results=schedules.map(({candidate,key})=>{
    const actual=singleton.map(({offset,cipher})=>
      (cipher-key[offset%key.length]+29)%29);
    const singletonMatchesAI=actual.filter(p=>p===24||p===10).length;
    const singletonMatchesAIO=actual.filter(p=>p===24||p===10||p===3).length;
    const distinctAlphabets=new Set(key).size;
    const plant=singleton.map(({offset},i)=>{
      const plaintext=i%2===0?24:10;
      const cipher=(plaintext+key[offset%key.length])%29;
      return (cipher-key[offset%key.length]+29)%29;
    });
    assert(plant.every((p,i)=>p===(i%2===0?24:10)));
    return {candidate,period:key.length,distinctAlphabets,
      singletonMatchesAI,singletonMatchesAIO};
  });
  assert.deepEqual(results,[
    {candidate:"p15 printed differences mod29",period:16,
      distinctAlphabets:12,singletonMatchesAI:4,singletonMatchesAIO:6},
    {candidate:"p15 recovered primes mod29",period:16,
      distinctAlphabets:13,singletonMatchesAI:1,singletonMatchesAIO:5},
    {candidate:"p15 printed BASE29 digits",period:47,
      distinctAlphabets:18,singletonMatchesAI:5,singletonMatchesAIO:7},
  ]);
  return results;
}

/**
 * All-secret cyclic substitution contradiction for the original 47-digit
 * p15 BASE29 schedule. No Caesar assumption and no hidden key selection.
 * @param {Array<{runes:string,startPage:number,length:number}>} words
 * @returns {{period:number,globalPhase:number,globalWitness:object[],pagePhase:number,pageWitness:object[],positivePlant:boolean}}
 */
function allSecretP15Period47Witness(words) {
  const pageStarts=[];
  let total=0;
  for(const page of corpus.pages.filter(p=>p.page<=55)){
    pageStarts[page.page]=total;
    total+=page.indices.length;
  }
  assert.equal(total,12956);
  let global=0;
  const one=[];
  for(const word of words){
    if(word.length===1){
      const page=physicalLP2Page(word.startPage);
      one.push({physicalPage:page,globalIndex:global,
        pageLocal:global-pageStarts[page],index:corpus.runes.indexOf(word.runes)});
    }
    global+=word.length;
  }
  assert.equal(one.length,83);
  assert.equal(global,12956);
  const globalWitness=one.filter(w=>w.globalIndex%47===27).map(
    w=>({physicalPage:w.physicalPage,index:w.index}));
  assert.deepEqual(globalWitness,[
    {physicalPage:4,index:8},
    {physicalPage:10,index:10},
    {physicalPage:16,index:9},
    {physicalPage:19,index:7},
  ]);
  const pageWitness=one.filter(w=>w.pageLocal%47===32).map(
    w=>({physicalPage:w.physicalPage,index:w.index}));
  assert.deepEqual(pageWitness,[
    {physicalPage:4,index:7},
    {physicalPage:10,index:9},
    {physicalPage:25,index:26},
    {physicalPage:28,index:21},
    {physicalPage:30,index:20},
    {physicalPage:45,index:3},
  ]);
  assert.equal(new Set(globalWitness.map(w=>w.index)).size,4);
  assert.equal(new Set(pageWitness.map(w=>w.index)).size,6);

  // Positive: a genuinely arbitrary, secret GP29 full permutation per
  // repeated clock phase, used on all source positions, cannot emit >3
  // distinct types from A/I/O at any repeated phase.
  const allPerms=Array.from({length:47},(_,phase)=>plantPermutation(phase%14));
  const inputTypes=[24,10,3];
  const plant=one.map((w,j)=>{
    const phase=w.globalIndex%47;
    const plain=inputTypes[j%3];
    const cipher=allPerms[phase][plain];
    const decoded=allPerms[phase].indexOf(cipher);
    assert.equal(decoded,plain);
    return {phase,cipher};
  });
  const plantRows=new Map();
  for(const w of plant){
    const arr=plantRows.get(w.phase)||new Set();
    arr.add(w.cipher);
    plantRows.set(w.phase,arr);
  }
  assert([...plantRows.values()].every(row=>row.size<=3));
  return {period:47,globalPhase:27,globalWitness,pagePhase:32,pageWitness,
    positivePlant:true};
}

function main() {
  const {words,runeCount,crossPageWords}=parseSharedCorpus();
  assert.equal(words.length,2896);
  assert.equal(runeCount,12956);
  assert.equal(crossPageWords,32);
  const fromWords=words.flatMap(w=>[...w.runes].map(ch=>corpus.runes.indexOf(ch)));
  const source=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  assert.deepEqual(fromWords,source);
  const whole=measure(words,0,56);
  assert.equal(whole.wordCount,83);
  assert.equal(whole.distinct,28);
  assert.deepEqual(whole.glyphs,Array.from({length:29},(_,i)=>i).filter(i=>i!==5));
  const chapters=CHAPTERS.map(([first,end])=>({
    physicalPages:[first,end-1],...measure(words,first,end)}));
  assert.deepEqual(chapters.map(c=>[c.wordCount,c.distinct]),EXPECTED);
  const physical17=measure(words,17,18);
  assert.equal(physical17.wordCount,5);
  assert.equal(physical17.distinct,5);
  assert.deepEqual(physical17.glyphs,[4,10,16,17,28]);
  assert.equal(physical17.minimumStates.two,3);
  console.log(JSON.stringify({source:{runes:runeCount,words:words.length,crossPageWords},
    whole,chapters,physical17,pageLocal:pageLocalSingletonWitness(),
    p15SourceSchedules:p15SourceScheduleGate(words),
    allSecretP15Period47:allSecretP15Period47Witness(words),positivePlant:runPlant(),
    scope:"Word boundaries preserved; at most m plaintext singleton types. No historical key."},null,2));
}
main();
