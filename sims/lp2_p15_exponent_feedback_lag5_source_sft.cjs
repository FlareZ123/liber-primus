'use strict';

/**
 * Source-fixed nonlinear GP29 feedback test, distinct from prior scalar GF29
 * multiplication: p15's clockwise 16-number spiral is the exponent CLOCK,
 * and its first ordinary prime 2 generates F29's 28-element nonzero group.
 *
 * Reversible rule:
 * C[0] is the unchanged page-16 first rune;
 * for i>0: if P[i]==28 (EA), C[i]=C[i-1];
 * else C[i]=(C[i-1]+2^((P[i]+K[(i-1)%16]) mod28)) mod29.
 * Inverse uses a discrete log to base2; zero step recovers EA.
 *
 * The p15 artwork selects the 16 printed values, but not the EA exception
 * or group-exponent operation. This is an exploratory finite hypothesis;
 * no search of secret mappings, phases, offsets or roots is performed.
 *
 * Positive control encodes genuine Gibran GP-English into original 1,744-rune
 * chapter lengths and passes an exact lossless inverse, with p57 clear native
 * 95-rune plant as an independent short check.
 *
 * Node.js 22/CommonJS/Windows-compatible. Read-only; no network access.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
assert.equal(corpus.pages.slice(0,56).flatMap(p=>p.indices).length,12956);

/** @param {number} x @returns {number} */
const mod29=x=>(x%29+29)%29;
/** @param {number} x @returns {number} */
const mod28=x=>(x%28+28)%28;

// Source p15, original clockwise spiral beginning at the red 3299 cell.
// Verified original p15 source mechanism N=|3301-prime(F+1)|.
const printed=[3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const clock=printed.map(mod28);
const exp=Array.from({length:28},(_,index)=>(2**index)%29);
assert.equal(new Set(exp).size,28,'2 must generate F29 multiplicative group');
const logarithm=new Map(exp.map((v,i)=>[v,i]));
assert.equal(logarithm.size,28);

const firstPage=16,lastExclusive=23;
const original=corpus.pages.slice(firstPage,lastExclusive).flatMap(p=>p.indices);
assert.equal(original.length,1744);
assert.equal(original.filter((v,i)=>i>0&&v===original[i-1]).length,10);

/**
 * Decode the published original cipher in physical rune order.
 * First cipher rune serves as IV; every later rune emits GP29 0..28.
 * @param {number[]} cipher
 * @returns {number[]}
 */
function decode(cipher) {
  const out=[cipher[0]];
  for(let i=1;i<cipher.length;i++){
    const step=mod29(cipher[i]-cipher[i-1]);
    out.push(step===0?28:mod28(logarithm.get(step)-clock[(i-1)%16]));
  }
  return out;
}
/**
 * Forward inverse for any GP29 text; preserves the seed c0 separately.
 * @param {number[]} plain
 * @param {number} firstCipherRune
 * @returns {number[]}
 */
function encode(plain,firstCipherRune) {
  const out=[firstCipherRune];
  for(let i=1;i<plain.length;i++){
    const symbol=plain[i];
    const delta=symbol===28?0:exp[mod28(symbol+clock[(i-1)%16])];
    out.push(mod29(out[i-1]+delta));
  }
  return out;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const f=Array(29).fill(0);
  arr.forEach(v=>f[v]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
/** @param {number[]} arr @returns {number} */
function doublets(arr) {
  return arr.slice(1).filter((v,i)=>v===arr[i]).length;
}
// Recover actual GP rune local word positions from the full original
// runic transcription, retaining midline '/' and physical page carries.
// The runeless p50 is outside this visual chapter and is irrelevant here.
const rune=new Map(corpus.runes.map((v,i)=>[v,i]));
const wordPositions=[];
let page=0,atWord=0,offset=0;
for(const char of read('resources/liber-primus/lp2-transcription.txt')){
  if(rune.has(char)){
    if(page>=firstPage && page<lastExclusive){
      const local=wordPositions.length;
      assert.equal(corpus.pages[page].indices[offset],rune.get(char));
      wordPositions.push(atWord);
      assert.ok(local<original.length);
    }
    atWord++;
    offset++;
  }else if(char==='-' || char==='.')atWord=0;
  else if(char==='%'){page++;offset=0;}
}
assert.equal(wordPositions.length,original.length);

/**
 * Count within-page, within-printed-word source-lag5 equalities.
 * @param {number[]} data
 * @returns {{hits:number,eligible:number}}
 */
function lag5(data){
  let hits=0,eligible=0;
  let start=0;
  for(const p of corpus.pages.slice(firstPage,lastExclusive)){
    for(let i=5;i<p.indices.length;i++){
      const here=start+i;
      if(wordPositions[here]<5)continue;
      eligible++;
      if(data[here]===data[here-5])hits++;
    }
    start+=p.indices.length;
  }
  return {hits,eligible};
}

const candidate=decode(original);
assert.deepEqual(encode(candidate,original[0]),original);
assert.equal(candidate.slice(1).filter(x=>x===28).length,10);
const originalStats={originalCipherRunes:original.length,
  originalDoublets:doublets(original),
  originalLag5:lag5(original),
  transformedIoC:ioc(candidate.slice(1)),
  candidatePrefix:candidate.slice(1,35).map(v=>corpus.translit[v]).join(' ')};
console.log(JSON.stringify({kind:'original',...originalStats}));

const native=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'));
assert.ok(native.length>1744);
const plant=native.slice(0,1744);
const plantCipher=encode(plant,original[0]);
const recovered=decode(plantCipher);
assert.deepEqual(recovered.slice(1),plant.slice(1));
assert.deepEqual(encode(recovered,original[0]),plantCipher);
const nativeStats={originalRunes:1744,
  nativePlaintextIoC:ioc(plant.slice(1)),
  nativeEA:plant.slice(1).filter(x=>x===28).length,
  plantedCipherDoublets:doublets(plantCipher),
  plantedCipherLag5:lag5(plantCipher),
  recoveredRunes:'1743/1743'};
console.log(JSON.stringify({kind:'positive-original-shape',...nativeStats}));

const clear=corpus.pages[57].indices;
assert.equal(clear.length,95);
const shortCipher=encode(clear,clear[0]);
assert.deepEqual(decode(shortCipher).slice(1),clear.slice(1));
console.log(JSON.stringify({kind:'positive-clear-p57',runes:95,recovered:94}));
console.log('PASS p15 printed-clock GF29 exponent feedback original and native controls');
