"use strict";

/**
 * First-party constrained candidate: original p15 16-cell Fibonacci-prime
 * spiral + its illustrated infinity glyph => four consecutive PGL2(F29)
 * transformations of one projective register. Tests the resulting entire
 * deterministic orbit, allowing all 120 distinct phase/state secret
 * GP29 bijections simultaneously. An adaptive ciphertext-driven update
 * requires an additional author-selected opcode and is out of scope.
 *
 * Deterministic original-corpus/secret-positive native-language SFT.
 * Windows/Node22: node sims/lp2_p15_spiral_mobius120_original_gp_native_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const orig = pages.flatMap(p => p.indices);
assert.equal(orig.length, 12956);
const runeIndex = new Map(gp.runes.map((v, i) => [v, i]));
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const words = (read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\n/g, "").replace(/[\n%]/g, "")
  .match(pattern) || []).map(w => Array.from(w, c => runeIndex.get(c)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), orig);

/** Original p15 colored red start, then clockwise outward square spiral. */
const printedSpiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const rows = Array.from({ length: 4 }, (_, i) =>
  printedSpiral.slice(4*i, 4*i + 4).map(n => n % 29));
const mod = v => ((v % 29) + 29) % 29;
function pow(value, exponent) {
  let x = 1;
  for (let a = mod(value); exponent; exponent >>= 1, a = a*a % 29)
    if (exponent & 1) x = x*a % 29;
  return x;
}
function invert(x) {
  assert.notEqual(mod(x), 0);
  return pow(x, 27);
}
/** Möbius projective point x in F29 ∪ {∞}, with ∞ as -1. */
function mobius(x, [a,b,c,d]) {
  if (x === -1) return c ? a*invert(c)%29 : -1;
  const denominator = mod(c*x + d);
  if (!denominator) return -1;
  return mod(a*x+b)*invert(denominator)%29;
}
function multiply([a,b,c,d], [e,f,g,h]) {
  return [mod(a*e+b*g),mod(a*f+b*h),mod(c*e+d*g),mod(c*f+d*h)];
}
const determinant = ([a,b,c,d]) => mod(a*d-b*c);
assert.deepEqual(rows.map(determinant), [4, 23, 25, 26]);
let product = [1,0,0,1];
for (const matrix of rows) product = multiply(matrix, product);
assert.deepEqual(product, [11, 8, 13, 7]);
assert.equal(determinant(product), 2);
assert.equal(mod(product[0]+product[3]), 18);
const projectiveScalarIdentity = ([a,b,c,d]) => b===0 && c===0 && a===d;
let power = [1,0,0,1], firstIdentity = 0;
for (let k = 1; k <= 30; k++) {
  power = multiply(product,power);
  if (projectiveScalarIdentity(power)) {
    firstIdentity = k;
    break;
  }
}
assert.equal(firstIdentity, 30, "four-step projective monodromy has order 30");
assert.deepEqual(power,[2,0,0,2]);
let state = -1;
const phaseStates = [];
for (let i = 0; i < 120; i++) {
  phaseStates.push([i % 4, state]);
  state = mobius(state, rows[i % 4]);
}
assert.equal(state, -1);
assert.equal(new Set(phaseStates.map(pair=>pair.join(","))).size, 120);
for (let phase = 0; phase < 4; phase++)
  assert.equal(new Set(phaseStates.filter(pair => pair[0] === phase)
    .map(pair => pair[1])).size, 30);
/** Full sequence's original GP ciphertext follows fixed 120-phase states. */
function phaseCoincidence(stream) {
  const slots = Array.from({length:120},()=>new Uint32Array(29));
  for(let i=0;i<stream.length;i++)slots[i%120][stream[i]]++;
  let pairs=0, equalPairs=0;
  for (let row of slots) {
    let n=0;
    for(let k=0;k<29;k++){
      const q=row[k];n+=q;equalPairs+=q*(q-1)/2;
    }
    pairs+=n*(n-1)/2;
  }
  return {pairs,equalPairs,IoC:equalPairs/pairs};
}
let offset=0;
const starts=new Map();
for(let page of pages){starts.set(page.page,offset);offset+=page.indices.length;}
const regions=[{name:"p16-p21",lo:16,hi:21,expected:1613,
  pairs:10049,equalPairs:391},{name:"p40-p53",lo:40,hi:53,expected:3008,
  pairs:36200,equalPairs:1246}].map(region=>{
  const a=starts.get(region.lo);
  const b=starts.get(region.hi)+pages.find(p=>p.page===region.hi).indices.length;
  assert.equal(b-a,region.expected);
  const original=phaseCoincidence(orig.slice(a,b));
  assert.deepEqual([original.pairs,original.equalPairs],
    [region.pairs,region.equalPairs]);
  return {...region,start:a,end:b,original};
});
let seed=0x33012929;
/** Deterministic source-native donor selection with preserved word lengths. */
function randomInt(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed>>>0)%n;
}
function poolsFor(file) {
  const contents=read(file);
  const text=file.includes("latin-vulgate")
    ?contents.split("\n").filter(line=>!line.startsWith("#")).join(" ")
    :contents;
  const pool=new Map();
  for(const w of text.match(/[A-Za-z]+/g)||[]){
    const runes=encodeSourceNativeGP(w);
    if(!pool.has(runes.length))pool.set(runes.length,[]);
    pool.get(runes.length).push(runes);
  }
  for(const word of words)assert(pool.has(word.length));
  return pool;
}
function donor(pool) {
  const result=[];
  for(const word of words){
    const options=pool.get(word.length);
    result.push(...options[randomInt(options.length)]);
  }
  assert.equal(result.length,orig.length);
  return result;
}
function shuffle(a) {
  for(let i=a.length-1;i>0;i--){
    const j=randomInt(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
/** Each of 120 phase/state observations gets arbitrary secret GP29 alphabet. */
function positivePlant(native) {
  const tables=Array.from({length:120},()=>shuffle(
    Array.from({length:29},(_,i)=>i)));
  const inv=tables.map(row=>{
    const result=Array(29);
    row.forEach((v,i)=>{result[v]=i;});
    assert.equal(new Set(result).size,29);
    return result;
  });
  const ciphertext=native.map((p,i)=>tables[i%120][p]);
  const recovered=ciphertext.map((c,i)=>inv[i%120][c]);
  assert.deepEqual(recovered,native);
  const a=phaseCoincidence(native),b=phaseCoincidence(ciphertext);
  assert.equal(a.equalPairs,b.equalPairs);
  return {recovered:recovered.length,IoC:a.IoC,equalPairs:a.equalPairs};
}

/**
 * One additional source-readable dynamic alternative: the authentic solved
 * LP2 p56 behavior holds the key cursor whenever the recovered rune is F.
 * The p15 infinity state is emitted as the F=0 shift. No hidden secret key
 * or fitted offset; this is an experimental cross-page transfer.
 */
function skipFDecode(ciphertext) {
  const plaintext=[];
  let state=-1, phase=0;
  for(const c of ciphertext) {
    const key=state<0?0:state;
    const p=mod(c-key);
    plaintext.push(p);
    if(p!==0) {
      state=mobius(state,rows[phase]);
      phase=(phase+1)%4;
    }
  }
  return plaintext;
}
function skipFEncode(plaintext) {
  const ciphertext=[];
  let state=-1, phase=0;
  for(const p of plaintext) {
    const key=state<0?0:state;
    ciphertext.push(mod(p+key));
    if(p!==0) {
      state=mobius(state,rows[phase]);
      phase=(phase+1)%4;
    }
  }
  return ciphertext;
}
function globalStats(a) {
  const hist=new Uint32Array(29);
  for(const p of a)hist[p]++;
  const n=a.length;
  return {
    runes:n,
    IoC:Array.from(hist).reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),
    mostCommon5:Array.from(hist).sort((a,b)=>b-a)
      .slice(0,5).reduce((s,x)=>s+x,0)
  };
}
const genuineP56FSemanticsOnP15 = {};
const skippedFPlants = {};
for(const region of regions) {
  const ciphertext=orig.slice(region.start,region.end);
  const native=skipFDecode(ciphertext);
  assert.deepEqual(skipFEncode(native),ciphertext,
    "complete original nonlinear stateful F-skip roundtrip");
  genuineP56FSemanticsOnP15[region.name]={
    ...globalStats(native),
    reconstructedCipherRunes:ciphertext.length,
    nativeHead: native.slice(0,70).map(i=>gp.translit[i]).join(" ")
  };
}


/**
 * The source-visible infinity mark actually lies on p15, after the first
 * nine red title runes. Therefore start at original p15 offset 9 (first
 * lower red heading rune) and carry the state through its remaining 150
 * runes into the whole p16–p21 intact original region.
 */
const p15 = pages.find(page=>page.page===15);
assert.equal(p15.indices.length,159);
const p15AfterInfinity=p15.indices.slice(9);
assert.equal(p15AfterInfinity.length,150);
const p16to21=regions.find(region=>region.name==="p16-p21");
const p15InfinityFullCipher=p15AfterInfinity.concat(
  orig.slice(p16to21.start,p16to21.end));
const p15InfinityDecoded=skipFDecode(p15InfinityFullCipher);
assert.deepEqual(skipFEncode(p15InfinityDecoded),p15InfinityFullCipher);
const firstP15Title=p15InfinityDecoded.slice(0,11);
const p15InfinityP16=p15InfinityDecoded.slice(150);
assert.equal(p15InfinityP16.length,1613);
const p15InfinitySeededFirstHeading={
  originalStartPage:15,
  afterInfinityStartLocalRune:9,
  remainingP15Runes:150,
  decodedLowerRedHeading11:firstP15Title.map(i=>gp.translit[i]).join(" "),
  p16to21:globalStats(p15InfinityP16),
  p16OriginalRemainderRuneCount:1613,
  exactReencrypt: true,
  first70RunesP16:p15InfinityP16.slice(0,70)
    .map(i=>gp.translit[i]).join(" ")
};

const tests=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Latin Vulgate","resources/control/latin-vulgate-latin26-wholewords.txt"]
];
const controlResults=[],PLANTS={};
for(const [name,file] of tests){
  const pool=poolsFor(file);
  const stats=Object.fromEntries(regions.map(region=>[region.name,
    {trials:90,minIoC:Infinity,maxIoC:0,atOrBelowOriginal:0}]));
  for(let trial=0;trial<90;trial++){
    const source=donor(pool);
    for(const region of regions){
      const native=source.slice(region.start,region.end);
      const result=phaseCoincidence(native);
      const info=stats[region.name];
      info.minIoC=Math.min(info.minIoC,result.IoC);
      info.maxIoC=Math.max(info.maxIoC,result.IoC);
      if(result.IoC<=region.original.IoC)info.atOrBelowOriginal++;
      assert(result.IoC>region.original.IoC,
        "120-state original native-GP all-secret gate "+
          name+" "+region.name+" trial "+trial);
      if(trial===0&&name==="Gibran") {
        PLANTS[region.name]=positivePlant(native);
        const encoded=skipFEncode(native);
        assert.deepEqual(skipFDecode(encoded),native,
          "complete GP-native F-skipped PGL2 positive");
        skippedFPlants[region.name]={runes:native.length,
          exactRecovered:true, nativeStats:globalStats(native)};
      }
    }
  }
  controlResults.push({name,file,statistics:stats});
}
if(require.main===module)console.log(JSON.stringify({
  status:"NONLINEAR PGL2 original-input 120-state conditional exclusion; no decoded unknown text",
  firstPartyOperand:"LP2 p15 4x4 physical square & infinity motif",
  interpretation:"four successive spiral quadruples become four PGL2(F29) maps; this grouping is a human solve hypothesis, not an author-authenticated opcode",
  spiralResidues:rows,
  fourStepProduct:product,
  fourStepProjectiveOrder:firstIdentity,
  distinctPhaseStatePairs:phaseStates.length,
  period:120,
  originalSource:regions.map(({name,expected,original})=>({name,n:expected,...original})),
  GPnativeWordMatchedControls:controlResults,
  plantedAllSecret120StatePositive:PLANTS,
  exactP56StyleFSkipSingleFixedOriginalInverse:genuineP56FSemanticsOnP15,
  exactP56StyleFSkipSourceNativePositive:skippedFPlants,
  sourceVisibleP15InfinitySeedWithContinuousP16To21:p15InfinitySeededFirstHeading,
  missingOpcode:"Any actual plaintext- or ciphertext-dependent state update, infinity-output interpretation, or keyed GP29 readout must come from independent first-party evidence"
},null,2));
module.exports={mobius,phaseCoincidence,rows,skipFDecode,skipFEncode};
