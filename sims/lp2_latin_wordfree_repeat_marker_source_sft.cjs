"use strict";
/**
 * A conditional source-quotation decoder gate from the original 86 GP29
 * equal-neighbor sites, including the historically available Latin Vulgate.
 *
 * Hypothesis: C[i] = C[i-1] if and only if native plaintext[i] is
 * an (unknown) reserved rune R. The 28 other plaintext values map
 * bijectively to nonzero ciphertext differences. Printed word separators
 * are NOT assumed to be plaintext word boundaries.
 *
 * SFT: node sims/lp2_latin_wordfree_repeat_marker_source_sft.cjs
 * Node 22, CommonJS, exact repository source fixtures.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<56 && p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.equal(pages.length,55);
const starts=[0];let total=0;
for(const p of pages.slice(0,-1)){total+=p.indices.length;starts.push(total);}
const boundaries=new Set(starts);
const events=original.map((v,i)=>i>0&&!boundaries.has(i)&&v===original[i-1]?1:0);
assert.equal(events.reduce((s,v)=>s+v,0),86);

const latinSource=read("resources/control/latin-vulgate-gp-wholewords.txt");
const latin=Array.from(latinSource.split(/\r?\n/)
  .filter(line=>/^[0-9A-S]+$/.test(line.trim())).join(""),
  ch=>parseInt(ch,29));
assert.equal(latin.length,204802);
/** @type {{s:string,i:number}[]} */
const tokens=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} source @returns {number[]} */
function nativeGP(source){
  const words=source.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .match(/[A-Z]+/g)||[];
  const out=[];
  for(const word of words){
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const found=tokens.find(t=>word.startsWith(t.s,i));
      assert.ok(found,word);
      out.push(found.i);i+=found.s.length;
    }
  }
  return out;
}
/**
 * Extract source-native F counts from complete length-12956 windows, excluding
 * the SAME ORIGINAL 55 physical page-start positions that cannot have
 * defined source repeat events. Overlapping windows are descriptive,
 * NOT independent hypothesis-test observations.
 * @param {number[]} tape @returns {object}
 */
function frequencyWindows(tape){
  const prefix=new Uint32Array(tape.length+1);
  for(let i=0;i<tape.length;i++)prefix[i+1]=prefix[i]+(tape[i]===0);
  const values=[];
  for(let offset=0;offset+original.length<=tape.length;offset+=32){
    let n=prefix[offset+original.length]-prefix[offset];
    for(const edge of starts)n-=tape[offset+edge]===0;
    values.push(n);
  }
  assert.ok(values.length>0);
  return {
    sampledWindows:values.length,
    minimum:Math.min(...values),maximum:Math.max(...values),
    mean:values.reduce((a,b)=>a+b,0)/values.length,
    countAtMostOriginal:values.filter(v=>v<=86).length,
    countEqualOriginal:values.filter(v=>v===86).length
  };
}
const language=[
  ["Latin Vulgate native GP",latin],
  ["Gibran native GP",nativeGP(read("resources/control/gibran_prophet_58585.txt"))],
  ["Shakespeare native GP",nativeGP(read("resources/control/shakespeare_first300k.txt"))],
  ["Emerson native GP",nativeGP(read("resources/control/emerson_essays_2944.txt"))]
].map(([name,tape])=>({source:name,fullLength:tape.length,
  overallF:tape.filter(x=>x===0).length/tape.length,
  ...frequencyWindows(tape)}));

/** @param {number[]} pgNumbers @returns {{cipher:number[],starts:Set<number>,repeats:number[]}} */
function makeTarget(pgNumbers){
  const selected=pages.filter(p=>pgNumbers.includes(p.page));
  const cipher=selected.flatMap(p=>p.indices);
  const begins=new Set([0]);let pos=0;
  for(const p of selected.slice(0,-1)){pos+=p.indices.length;begins.add(pos);}
  const repeats=[];
  for(let i=1;i<cipher.length;i++){
    if(begins.has(i))continue;
    if(cipher[i]===cipher[i-1])repeats.push(i);
  }
  assert.ok(repeats.length>0);
  return {cipher,starts:begins,repeats};
}
/**
 * Scan every literal source offset and all 29 reserved-runic choices.
 * First observed repeat fixes the candidate reserved rune for each offset,
 * so there is no unknown-key enumeration.
 * @param {number[]} tape
 * @param {{cipher:number[],starts:Set<number>,repeats:number[]}} target
 * @returns {{count:number,first:{offset:number,reserved:number}[]}}
 */
function compatible(tape,target){
  const {cipher,starts,repeats}=target;
  const pivot=repeats[0],first=[],n=cipher.length;
  let count=0;
  for(let offset=0;offset+n<=tape.length;offset++){
    const reserved=tape[offset+pivot];
    if(repeats.some(i=>tape[offset+i]!==reserved))continue;
    let okay=true;
    for(let i=1;i<n;i++){
      if(starts.has(i))continue;
      const equal=cipher[i]===cipher[i-1];
      if((tape[offset+i]===reserved)!==equal){okay=false;break;}
    }
    if(okay){count++;if(first.length<6)first.push({offset,reserved});}
  }
  return {count,first};
}
const groups=[
  {name:"p0-2",pages:[0,1,2]},
  {name:"p3-7",pages:[3,4,5,6,7]},
  {name:"p8-14",pages:[8,9,10,11,12,13,14]},
  {name:"p9",pages:[9]},
  {name:"p19",pages:[19]},
  {name:"p24",pages:[24]}
];
const sourceTests=groups.map(g=>{
  const target=makeTarget(g.pages),res=compatible(latin,target);
  return {name:g.name,runeCount:target.cipher.length,
    equalEvents:target.repeats.length,...res};
});
assert.equal(sourceTests[0].runeCount,729);
assert.equal(sourceTests[0].equalEvents,4);
assert.deepEqual(sourceTests.map(x=>x.count),[0,0,0,1,0,0]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){
  let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a;
}
// Exact combinatorial conditional expectation under uniformly random
// placement of 3 repeat sites in p9, holding their number fixed.
// A source substring is a possible hit iff one rune occurs exactly 3 times
// at its 267 eligible indices, and its three positions equal the random mask.
const p9=makeTarget([9]);const length=p9.cipher.length,ways=choose(length-1,3);
const freq=Array(29).fill(0);
for(let i=1;i<length;i++)freq[latin[i]]++;
let compatibleClassTally=0;
for(let offset=0;offset+length<=latin.length;offset++){
  compatibleClassTally+=freq.filter(v=>v===3).length;
  if(offset+length===latin.length)break;
  freq[latin[offset+1]]--;freq[latin[offset+length]]++;
}
const expectedP9RandomMaskHits=compatibleClassTally/ways;
assert.ok(expectedP9RandomMaskHits>0.08 && expectedP9RandomMaskHits<0.10);

// Independent true-Latin 729-GP-rune positive: encrypt with zero->zero
// and a fixed 28-way bijection on the others, resetting at the same three
// page starts. The exact native passage must be found by the mask scanner.
const startIndex=10000;
const plant=latin.slice(startIndex,startIndex+729);
const plantCipher=[];const lengths=[262,266,201];let i=0;
for(const pLength of lengths){
  let prev=0;
  for(let k=0;k<pLength;k++,i++){
    const v=plant[i],delta=v===0?0:1+(((v-1)*11+3)%28);
    const c=(prev+delta)%29;plantCipher.push(c);prev=c;
  }
}
const plantedTarget={cipher:plantCipher,starts:new Set([0,262,528]),repeats:[]};
for(let i=1;i<plantCipher.length;i++){
  if(plantedTarget.starts.has(i))continue;
  if(plantCipher[i]===plantCipher[i-1])plantedTarget.repeats.push(i);
}
assert.ok(plantedTarget.repeats.length>0);
const plantedHit=compatible(latin,plantedTarget);
assert.ok(plantedHit.count>=1);
assert.ok(plantedHit.first.some(x=>x.offset===startIndex && x.reserved===0),
  "recover authentic exact Latin source offset");

/**
 * Stronger necessary equality test for the single p9 Vulgate passage
 * surviving the weak marker mask. For every possible secret bijection
 * from plaintext symbols to ciphertext first differences, a stationary
 * alphabet within a fixed position phase must map repeated plaintext
 * values to repeated deltas and different plaintext values to different
 * deltas. A single contradiction excludes that phase-period family.
 * @param {number[]} cipher
 * @param {number[]} plain
 * @param {number} period
 */
function mappingContradictions(cipher,plain,period){
  const forward=Array.from({length:period},()=>Array(29).fill(-1));
  const inverse=Array.from({length:period},()=>Array(29).fill(-1));
  let forwardErrors=0,inverseErrors=0;
  for(let i=1;i<cipher.length;i++){
    const delta=(cipher[i]-cipher[i-1]+29)%29;
    const phase=i%period,source=plain[i];
    if(forward[phase][source]===-1)forward[phase][source]=delta;
    else if(forward[phase][source]!==delta)forwardErrors++;
    if(inverse[phase][delta]===-1)inverse[phase][delta]=source;
    else if(inverse[phase][delta]!==source)inverseErrors++;
  }
  return {forwardErrors,inverseErrors};
}
const p9Candidate=latin.slice(147972,147972+p9.cipher.length);
const p9Tests=Array.from({length:60},(_,i)=>{
  const period=i+1, errors=mappingContradictions(p9.cipher,p9Candidate,period);
  return {period,...errors};
});
assert.ok(p9Tests.every(x=>x.forwardErrors+x.inverseErrors>0));
const actualNativePlant=latin.slice(startIndex,startIndex+262);
const actualCipherPlant=plantCipher.slice(0,262);
assert.deepEqual(mappingContradictions(actualCipherPlant,actualNativePlant,1),
  {forwardErrors:0,inverseErrors:0});

/**
 * Latin-donor sensitivity of the already proven all-secret period28 GP29
 * escape-cipher equality invariant. The prior English-only test is
 * independently established in the other agent's source report; here
 * no original secret table is fitted, and Latin is frozen externally.
 *
 * All source page and major-mark phase resets are original physical data.
 */
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pageOffset=new Map();
let cumulative=0;
for(const page of pages){pageOffset.set(page.page,cumulative);
  cumulative+=page.indices.length;}
assert.equal(cumulative,original.length);
const pageCuts=[0,...pages.map(p=>pageOffset.get(p.page)+p.indices.length)];
const inkCuts=ink.pages.filter(p=>p.page<=55).flatMap(p=>
  (p.large_punctuation||[]).map(mark=>pageOffset.get(p.page)+mark[0]));
const uniqueSorted=values=>[...new Set(values)].sort((a,b)=>a-b);
const conditions=[
  ["global",[0,original.length]],
  ["mark",uniqueSorted([0,original.length,...inkCuts])],
  ["page",uniqueSorted(pageCuts)],
  ["mark+page",uniqueSorted([0,original.length,...pageCuts,...inkCuts])]
];
assert.deepEqual(conditions.map(x=>x[1].length-1),[1,29,55,74]);
/** @param {number[]} cuts @returns {number[][]} */
function positionGroups(cuts){
  /** @type {Map<string,number[]>} */
  const groups=new Map();
  for(let z=0;z<cuts.length-1;z++){
    for(let i=Math.max(1,cuts[z]);i<cuts[z+1];i++){
      if(original[i]===original[i-1])continue;
      const tag=z+":"+((i-cuts[z])%28);
      if(!groups.has(tag))groups.set(tag,[]);
      groups.get(tag).push(i);
    }
  }
  return [...groups.values()];
}
/**
 * Same within-(source-segment,phase28) equality count after ANY secret
 * permutation of 28 nonzero step ranks. Requires 29 native rune labels.
 * @param {number[][]} groups
 * @param {number[]} tape
 * @param {number} start
 * @returns {number}
 */
function repeatedInGroups(groups,tape,start){
  let pairs=0;
  for(const group of groups){
    const frequency=new Uint8Array(29);
    for(const i of group)frequency[tape[start+i]]++;
    for(const n of frequency)pairs+=n*(n-1)/2;
  }
  return pairs;
}
const originalDelta=original.map((v,i)=>
  i?(v-original[i-1]+29)%29:0);
const latinAllSecret=[];
for(const [name,cuts] of conditions){
  const grouped=positionGroups(cuts);
  const originalCount=repeatedInGroups(grouped,originalDelta,0);
  const latinCounts=Array.from({length:128},(_,i)=>{
    const shift=Math.floor(i*(latin.length-original.length)/127);
    return repeatedInGroups(grouped,latin,shift);
  }).sort((a,b)=>a-b);
  latinAllSecret.push({
    regime:name,sourceSegments:cuts.length-1,
    occupiedPhaseBuckets:grouped.length,originalEqualPairs:originalCount,
    latinSourceWindows:128,latinMin:latinCounts[0],
    latinMedian:latinCounts[64],latinMax:latinCounts.at(-1),
    latinWindowsAtOrBelowOriginal:latinCounts.filter(x=>x<=originalCount).length
  });
}
assert.deepEqual(latinAllSecret.map(x=>x.originalEqualPairs),
  [104918,11021,1775,1648]);
assert.deepEqual(latinAllSecret.map(x=>x.latinMin),
  [216715,22719,3593,3346]);
assert.ok(latinAllSecret.every(x=>x.latinWindowsAtOrBelowOriginal===0));

console.log(JSON.stringify({
  classification:"conditional Latin-language clue; literal Vulgate paragraph gate negative",
  originalRunes:original.length,originalEqualEvents:86,
  sourceReadout:language,latinWholePassageTests:sourceTests,
  p9RandomPositionsExpectedHits:expectedP9RandomMaskHits,
  p9SourceNativePeriodGate:{periods:60,
    firstPeriod:p9Tests[0],
    fewestContradictions:p9Tests.reduce((best,x)=>
      x.forwardErrors+x.inverseErrors<best.forwardErrors+best.inverseErrors?x:best),
    zeroContradictionPeriods:p9Tests.filter(x=>!x.forwardErrors&&!x.inverseErrors).length,
    independentLatinNativePositive:true},
  latinPrivatePeriod28EqualityGate:latinAllSecret,
  genuineLatin729RunePositive:{offset:startIndex,hits:plantedHit.count,
    correctSourceFound:true}
},null,2));
