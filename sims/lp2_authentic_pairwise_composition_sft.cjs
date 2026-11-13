"use strict";

/**
 * SFT: independently attested Cicada GP29 primitives, paired without invented
 * source material. Node 22; read-only, deterministic, CommonJS.
 *
 * The two Vigenere keys are from the solved LP1 regressions. The prime-totient
 * operation and exceptional literal-F position are checked on solved LP2 p56.
 * These historical operators do not constitute an LP2 cipher instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const originalPages = corpus.pages.filter(p => p.page <= 55);
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapterData = chapterRanges.map(([from,to]) => originalPages
  .filter(p => p.page >= from && p.page <= to).flatMap(p => p.indices));
const chapterLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
assert.deepEqual(chapterData.map(a => a.length), chapterLengths);
assert.equal(chapterData.flat().length, 12956);
assert.equal(corpus.pages[50].runic_count, 0);
const keys = {
  DIVINITY: [23,10,1,10,9,10,16,26],
  FIRFUMFERENCE: [0,10,4,0,1,19,0,18,4,18,9,5,18]
};
assert.equal(keys.DIVINITY.length,8);
assert.equal(keys.FIRFUMFERENCE.length,13);
const sources = [
  {name:"DIVINITY", values:keys.DIVINITY},
  {name:"FIRFUMFERENCE", values:keys.FIRFUMFERENCE},
  {name:"PHI_PRIMES", values:null}
];
const pairs = [[sources[0],sources[1]],[sources[0],sources[2]],
  [sources[1],sources[2]]];
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const result = [];
  for (let value=2;result.length<n;value++) {
    let isPrime = true;
    for (let f=2;f*f<=value;f++) if (value % f === 0) {
      isPrime=false;break;
    }
    if (isPrime) result.push(value);
  }
  return result;
}
const primes=firstPrimes(12956+100);
const keyAt=(source,index,phase) => source.values ?
  source.values[(index+phase)%source.values.length] :
  mod(primes[index]-1);

/**
 * @typedef {{pair:string,resetA:boolean,resetB:boolean,
 *  literalF:boolean,atbash:boolean,signA:number,signB:number,
 *  phaseA:number,phaseB:number}} Configuration
 */
/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  if(sequence.length<2) return 0;
  const counts=new Uint32Array(29);
  for(const val of sequence) counts[val]++;
  let matches=0;
  for(const n of counts) matches+=n*(n-1);
  return 29*matches/(sequence.length*(sequence.length-1));
}
/**
 * Apply one exact source-conditioned candidate, retaining the original
 * visible chapter lengths; the exceptional p56 single-F rule is validated
 * separately and the all-F option is deliberately a generous conjecture.
 * @param {number[][]} chapters
 * @param {[{name:string,values:number[]|null},{name:string,values:number[]|null}]} pair
 * @param {Configuration} cfg
 * @returns {number[][]}
 */
function decode(chapters,pair,cfg) {
  let posA=cfg.phaseA,posB=cfg.phaseB;
  const output=[];
  for(const sourceChapter of chapters){
    if(cfg.resetA)posA=cfg.phaseA;
    if(cfg.resetB)posB=cfg.phaseB;
    const plain=[];
    for(const c of sourceChapter){
      if(cfg.literalF && c===0){plain.push(0);continue;}
      const v=cfg.atbash ? 28-c : c;
      const a=keyAt(pair[0],posA++,0);
      const b=keyAt(pair[1],posB++,0);
      plain.push(mod(v+cfg.signA*a+cfg.signB*b));
    }
    output.push(plain);
  }
  return output;
}
/** @param {number[]} vals @returns {number[]} */
const scoreChapters=vals=>vals.map(ioc);
const tests=[];
const raw=chapterData.flat();
const originalIoc=ioc(raw);
for(const pair of pairs) {
  const phaseCountA=pair[0].values?.length || 1;
  const phaseCountB=pair[1].values?.length || 1;
  let bestPooled=null,bestChapter=null,count=0,highChapters=0;
  for(const resetA of [false,true])
  for(const resetB of [false,true])
  for(const literalF of [false,true])
  for(const atbash of [false,true])
  for(const signA of [-1,1])
  for(const signB of [-1,1])
  for(let phaseA=0;phaseA<phaseCountA;phaseA++)
  for(let phaseB=0;phaseB<phaseCountB;phaseB++){
    const cfg={pair:pair[0].name+"+"+pair[1].name,
      resetA,resetB,literalF,atbash,signA,signB,phaseA,phaseB};
    const decoded=decode(chapterData,pair,cfg);
    const chapterScores=scoreChapters(decoded);
    const pooled=ioc(decoded.flat());
    const highest=Math.max(...chapterScores);
    const candidate={...cfg,pooled,highest,chapterScores};
    count++;
    if(highest>=1.35)highChapters++;
    if(!bestPooled||pooled>bestPooled.pooled)bestPooled=candidate;
    if(!bestChapter||highest>bestChapter.highest)bestChapter=candidate;
  }
  tests.push({pair:pair[0].name+"+"+pair[1].name,configs:count,
    configsChapterAtLeast135:highChapters,bestPooled,bestChapter});
}

// Authentic p56 positive: independently established 85-rune plaintext,
// first successive prime, subtraction of phi(p), ONLY local offset56 literal F.
const p56=corpus.pages.find(p=>p.page===56).indices;
let t=0;
const authenticP56=p56.map((c,i)=>i===56 ? 0 : mod(c-(primes[t++]-1)));
const expected="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const gpSorted=corpus.translit.map((part,i)=>({part,i}))
  .sort((a,b)=>b.part.length-a.part.length);
const expectedIndices=[];
for(const word of expected.split(" "))for(let start=0;start<word.length;){
  const hit=gpSorted.find(item=>word.startsWith(item.part,start));
  assert.ok(hit,word.slice(start));
  expectedIndices.push(hit.i);
  start+=hit.part.length;
}
assert.deepEqual(authenticP56,expectedIndices);
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const solvedP57Ioc=ioc(p57);
assert.ok(solvedP57Ioc>1.5);

// A planted two-key forward example has no Fehu ambiguity: no skips, exact
// independent source keys, independent chapter resets, full 95 original
// solved-p57 GP symbols recovered by applying the same specified inverse.
const pair=pairs[0];
const sampleCfg={pair:"DIVINITY+FIRFUMFERENCE",resetA:true,resetB:true,
  literalF:false,atbash:false,signA:-1,signB:-1,phaseA:0,phaseB:0};
const encrypted=p57.map((v,i)=>mod(v+
  keyAt(pair[0],i,0)+keyAt(pair[1],i,0)));
assert.deepEqual(decode([encrypted],pair,sampleCfg)[0],p57);

assert.equal(t,84);
assert.equal(originalIoc>0.97&&originalIoc<1.05,true);
assert.equal(tests.length,3);
console.log(JSON.stringify({
  source:"original 55 rune-bearing LP2 pages; nine source-visible visual chapters",
  runes:raw.length,chapterLengths,rawNormalizedIoC:originalIoc,
  solvedP57NormalizedIoC:solvedP57Ioc,
  authenticP56Regression:"85/85 exact, one source-authentic literal-F skip at p56 offset56",
  plantedTwoKeyControl:"95/95 exact inverse",
  totalConfigurations:tests.reduce((n,x)=>n+x.configs,0),
  tests,unreadableAtNativeEnglishConcentration:
    tests.every(t=>t.configsChapterAtLeast135===0)
},null,2));
