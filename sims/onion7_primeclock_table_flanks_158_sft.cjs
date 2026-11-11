"use strict";
/**
 * Source-key + authentic solved-p56 prime-totient inverse challenged on
 * 158 unchanged LP2 flanking runes (p49:66, p51:92).
 *
 * Five independently sourced key ordinal starts × signs × table-nonrune
 * clock continuation/reset × all 2^6 possible p56-like literal-F masks.
 * The complete finite challenge has no recovered unknown plaintext.
 *
 * Run: node sims/onion7_primeclock_table_flanks_158_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} name @returns {string} */
const load=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const text=load("resources/control/shakespeare_first300k.txt");
const alpha=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const map=new Map(corpus.translit.map((t,i)=>[t,i]));
/** Original GP transcription convention, with ING compacted to NG. */
function encode(raw) {
  const str=raw.toUpperCase().replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Q/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<str.length;) {
    if(!/[A-Z]/.test(str[i])){i++;continue;}
    if(str.slice(i,i+3)==="ING") {
      result.push(map.get("NG"));i+=3;continue;
    }
    const token=alpha.find(item=>str.startsWith(item.token,i));
    if(token) {result.push(token.index);i+=token.token.length;}
    else i++;
  }
  return result;
}
const trained=encode(text);
assert.equal(trained.length,217644);
const counts=new Float64Array(29*29*29);
const totals=new Float64Array(29*29);
for(let i=2;i<trained.length;i++) {
  const key=trained[i-2]*29+trained[i-1];
  counts[key*29+trained[i]]++;
  totals[key]++;
}
/** @param {number[][]} pages @returns {number} */
function trigramScore(pages) {
  let sum=0,n=0;
  for(const p of pages)for(let i=2;i<p.length;i++) {
    const key=p[i-2]*29+p[i-1];
    sum+=Math.log((counts[key*29+p[i]]+0.5)/(totals[key]+14.5));
    n++;
  }
  return sum/n;
}
const p49=corpus.pages.find(p=>p.page===49).indices;
const p51=corpus.pages.find(p=>p.page===51).indices;
const p56=corpus.pages.find(p=>p.page===56).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p49.length,66);
assert.equal(p51.length,92);
assert.equal(p56.length,85);
assert.equal(p57.length,95);
const original=[p49,p51];
const F=[];
for(let pg=0,at=0;pg<2;at+=original[pg].length,pg++) {
  original[pg].forEach((r,i)=>{if(r===0) F.push(at+i);});
}
assert.deepEqual(F,[3,33,69,123,126,157]);
const literalBits=new Map(F.map((x,i)=>[x,i]));
const sieve=new Uint8Array(40001);
const primes=[];
for(let i=2;i<sieve.length;i++)if(!sieve[i]) {
  primes.push(i);
  for(let j=i*i;j<sieve.length;j+=i) sieve[j]=1;
}
assert(primes.length>3301);
assert.equal(primes[86],449);   // red PARABLE heading's prime sum
assert.equal(primes[173],1033); // historical Onion7 7x7 magic sum
assert.equal(primes[463],3301); // historical Onion7 5x5 magic sum
const mod=x=>((x%29)+29)%29;
/**
 * All possible source-original F positions may consume a totient or
 * be literal plaintext F and consume no key, as in authentic p56.
 * @param {number} start 0-based prime ordinal
 * @param {number} sign +1 or -1 in P=C+sign*phi(prime)
 * @param {boolean} reset at p51 rather than skipping table bytes
 * @param {number} mask one literal-F choice for each of six source F runes
 * @param {number[][]} pages
 */
function decode(start,sign,reset,mask,pages=original) {
  let next=start,global=0;
  const output=[];
  for(const page of pages) {
    if(reset)next=start;
    const out=[];
    for(const cipher of page) {
      const bit=literalBits.get(global);
      if(bit!==undefined&&(mask&(1<<bit)))out.push(0);
      else out.push(mod(cipher+sign*(primes[next++]-1)));
      global++;
    }
    output.push(out);
  }
  return output;
}
const knownP56=encode(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
assert.equal(knownP56.length,85);
// Source-native authentic solved-page regression: its one literal
// non-consuming F at offset 56 and exactly 84 consumed primes.
let pos=0;
const actualP56=p56.map((r,i)=>i===56?0:mod(r-(primes[pos++]-1)));
assert.equal(pos,84);
assert.deepEqual(actualP56,knownP56);
// Independently planted exact inverse for a source-fixed, no-skip mask.
const planted=knownP56.concat(p57).slice(0,158);
const plantStart=463,plantSign=-1;
let plantIndex=plantStart;
const plantCipher=planted.map(r=>mod(r-plantSign*(primes[plantIndex++]-1)));
const plantRecovered=decode(plantStart,plantSign,false,0,
  [plantCipher.slice(0,66),plantCipher.slice(66)]);
assert.deepEqual(plantRecovered.flat(),planted);

const sources=[
  {name:"Authentic p56 prime origin",start:0},
  {name:"PARABLE red prime sum449 = prime87",start:86},
  {name:"Onion7 7x7 magic1033 = prime174",start:173},
  {name:"Onion7 5x5 magic3301 = prime464",start:463},
  {name:"Literal ordinal3301",start:3300}
];
const results=[];
for(const source of sources)for(const sign of [-1,1])for(const reset of [false,true]) {
  let best={score:-Infinity};
  for(let mask=0;mask<64;mask++) {
    const plain=decode(source.start,sign,reset,mask);
    const score=trigramScore(plain);
    if(score>best.score)best={
      score,mask,pageScores:plain.map(p=>trigramScore([p])),
      prefixes:plain.map(p=>p.slice(0,45).map(i=>corpus.translit[i]).join(""))
    };
  }
  results.push({...source,sign,reset,...best});
}
results.sort((a,b)=>b.score-a.score);
const bestBySource=sources.map(source=>results.find(r=>r.start===source.start));
assert.equal(results.length,20);
assert.equal(results[0].start,173);
assert.equal(results[0].sign,1);
assert.equal(results[0].reset,true);
assert.equal(results[0].mask,14);
assert(Math.abs(results[0].score-(-3.9461826077674487))<1e-10);
const solvedReference=trigramScore([knownP56.slice(0,66),p57.slice(0,92)]);
assert(Math.abs(solvedReference-(-2.5437750824772922))<1e-10);
console.log(JSON.stringify({
  sourcePages:{49:66,50:"256 byte nonrune table",51:92},
  finiteSourceKeyStarts:sources,
  sourceFpositions:F,
  candidates:20*64,
  unmodifiedOriginalScore:trigramScore(original),
  solvedKnownLanguageScore:solvedReference,
  bestBySource,
  bestOverall:results[0],
  positiveControls:{authenticP56:"85/85",syntheticFlanks:"158/158"},
  verdict:"No authentic unknown flank plaintext under any tested source start, prime-clock convention or literal-F exception mask"
},null,2));
