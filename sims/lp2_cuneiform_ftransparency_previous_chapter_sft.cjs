"use strict";
/**
 * One-file original LP2 p27..32 / marked p33..39 F-transparent pairing gate.
 *
 * Source-selected candidate: use the preceding 1,433-rune visual chapter as
 * a GP29 additive key for the exactly 1,433 non-F rune positions in the
 * later cuneiform-bracketed 1,468-rune passage. This is a HYPOTHESIS,
 * NOT an authenticated Cicada cipher operation.
 *
 * Run with Node.js 22 from repository root, without dependencies or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page = index => {
  const found = data.pages.find(value => value.page === index);
  assert.ok(found,"missing original page "+index);
  return found.indices;
};
const mod = n => (n % 29 + 29) % 29;
const parse = a => a.map(value => data.translit[value]).join("");
const hash = a => createHash("sha256").update(Buffer.from(a)).digest("hex");
const ioc = a => {
  const counts = Array(29).fill(0);
  for (const n of a) counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};

/** @type {number[]} Exact original physical p27..32 full visual chapter. */
const key = data.pages.filter(p=>p.page>=27 && p.page<=32)
  .flatMap(p=>p.indices);
/**
 * Exact original 13-dot/heading bracket: p33 local91 through p39 local119.
 * Excludes the 91-rune p33 prelude and the 121-rune p39 red-triad/tail.
 * @type {number[]}
 */
const marked = [
  ...page(33).slice(91),
  ...data.pages.filter(p=>p.page>=34 && p.page<=38).flatMap(p=>p.indices),
  ...page(39).slice(0,119)
];
const keyLocations=[];
const skipped=[];
marked.forEach((value,i)=>{
  (value===0?skipped:keyLocations).push(i);
});
const payload = keyLocations.map(i=>marked[i]);
assert.equal(key.length,1433);
assert.equal(marked.length,1468);
assert.equal(skipped.length,35);
assert.equal(payload.length,1433);
assert.ok(payload.every(value=>value!==0));
assert.equal(page(33).length,214);
assert.equal(page(39).length,240);
console.log("SOURCE",JSON.stringify({
  keyPageRange:[27,32],keyLength:key.length,
  markedStart:{page:33,local:91},markedEnd:{page:39,local:119},
  markedLength:marked.length,originalTransparentF:skipped.length,
  transmittedLength:payload.length,
  keySha256:hash(key),markedSha256:hash(marked),filteredSha256:hash(payload),
  rawKeyIoc:ioc(key),rawMarkedIoc:ioc(marked),rawFilteredIoc:ioc(payload)
}));

/** Reconstitute the marked 1,468-runic layout from its 1,433 consumed slots.
 * @param {number[]} active values at non-F slots
 */
function insertTransparentF(active) {
  assert.equal(active.length,keyLocations.length);
  const output=marked.map(() => 0);
  keyLocations.forEach((original,i)=>{output[original]=active[i];});
  return output;
}
/** Extract originally fixed nontransparent slots. */
function extract(source) {
  assert.equal(source.length,marked.length);
  assert.ok(skipped.every(i=>source[i]===0));
  return keyLocations.map(i=>source[i]);
}
assert.deepEqual(extract(marked),payload);
assert.deepEqual(insertTransparentF(payload),marked);

for(const sign of [-1,+1]){
  const plaintext=payload.map((v,i)=>mod(v+sign*key[i]));
  const reencryption=plaintext.map((v,i)=>mod(v-sign*key[i]));
  assert.deepEqual(reencryption,payload);
  assert.deepEqual(insertTransparentF(reencryption),marked);
  console.log("ORIGINAL-INVERSE",JSON.stringify({
    sign,length:plaintext.length,ioc:ioc(plaintext),
    first90Gp:parse(plaintext.slice(0,90)),
    first90Indices:plaintext.slice(0,90)
  }));
}

const native=page(57);
assert.equal(native.length,95);
const plant=Array.from({length:key.length},(_,i)=>native[i%native.length]);
for(const sign of [-1,+1]){
  const ciphertext=plant.map((v,i)=>mod(v-sign*key[i]));
  const markedCarrier=insertTransparentF(ciphertext);
  const decrypted=extract(markedCarrier).map((v,i)=>mod(v+sign*key[i]));
  assert.deepEqual(decrypted,plant);
  assert.deepEqual(extract(markedCarrier),ciphertext);
  assert.deepEqual(skipped.map(i=>markedCarrier[i]),Array(skipped.length).fill(0));
}
console.log("NATIVE-PLANT",JSON.stringify({
  originalSolvedPage:57,sourceNativeLength:95,
  plantedConsumed:plant.length,plantedPlaintextIoc:ioc(plant),
  exactRecoveredInBothDirections:plant.length,
  positiveIsFixedHoleModel:true
}));
assert.ok(ioc(plant)>0.055);
/**
 * All-hidden-pad necessary invariant:
 *  A_i = plainA_i + pad_i, B_i = plainB_i + pad_i (mod29)
 * implies B_i-A_i = plainB_i-plainA_i, independently of the pad.
 *
 * Allow any second-channel constant offset as an extra concession: the
 * maximum across 29 equalities is necessary for two readable registers.
 * The source F holes are fixed; the B controls also remove literal Fs
 * before taking their 1,433 consumed positions.
 *
 * @param {number[]} first full A register
 * @param {number[]} second B consumed register
 */
function equality(first,second) {
  assert.equal(first.length,second.length);
  const h=Array(29).fill(0);
  for (let i=0;i<first.length;i++) h[mod(second[i]-first[i])]++;
  return {exact:h[0],best:Math.max(...h),
    phase:h.indexOf(Math.max(...h)),histogram:h};
}
const actual=equality(key,payload);
assert.equal(actual.exact,51);
assert.equal(actual.best,60);
assert.equal(actual.phase,12);
console.log("ORIGINAL-ALL-PAD-INVARIANT",JSON.stringify(actual));

/** @param {string} raw unmodified native text */
function toGP(raw) {
  const s=raw.toUpperCase().replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const tokens=data.translit.map((value,i)=>({value,i}))
    .sort((a,b)=>b.value.length-a.value.length);
  const out=[];
  for (let i=0;i<s.length;) {
    const match=tokens.find(t=>s.startsWith(t.value,i));
    if (match) {
      out.push(match.i);
      i+=match.value.length;
    } else i++;
  }
  return out;
}
/** Fixed xor-shift seed, deterministically seeding all three source panels. */
let seed=0x20143301;
/** @returns {number} Uint32 */
function rand() {
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const natives=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt",218800],
  ["Gibran","resources/control/gibran_prophet_58585.txt",63114],
  ["Emerson","resources/control/emerson_essays_2944.txt",324630]
];
let total=0,bestAsOriginal=0,exactAsOriginal=0;
for (const [name,source,expectedLength] of natives) {
  const gp=toGP(read(source));
  assert.equal(gp.length,expectedLength);
  const nonF=gp.filter(v=>v!==0);
  const L=key.length, trials=5000;
  let eqMin=Infinity,eqSum=0,bestMin=Infinity,bestSum=0;
  let exactTail=0,bestTail=0;
  for (let t=0;t<trials;t++) {
    const a=rand()%(gp.length-L);
    const b=rand()%(nonF.length-L);
    const counts=Array(29).fill(0);
    for (let i=0;i<L;i++) counts[mod(nonF[b+i]-gp[a+i])]++;
    const eq=counts[0],best=Math.max(...counts);
    eqSum+=eq;bestSum+=best;
    eqMin=Math.min(eqMin,eq);bestMin=Math.min(bestMin,best);
    if (eq<=actual.exact) exactTail++;
    if (best<=actual.best) bestTail++;
  }
  total+=trials;exactAsOriginal+=exactTail;
  bestAsOriginal+=bestTail;
  console.log("NATIVE-ALL-PAD-NULL",JSON.stringify({
    source:name,sourceLength:gp.length,nonFSourceLength:nonF.length,
    trials,exactMean:eqSum/trials,exactMin:eqMin,
    bestShiftMean:bestSum/trials,bestShiftMin:bestMin,
    originalExactOrLower:exactTail,originalBestOrLower:bestTail
  }));
}
assert.equal(total,15000);
assert.equal(exactAsOriginal,1);
assert.equal(bestAsOriginal,0);

/**
 * A deliberately source-shaped shared pad plant. Any secret GP29 keystream
 * is valid; choose one that never emits F in the second (active) lane.
 * This tests the all-secret invariant including a B channel with 0 Fs.
 */
const nativeA=toGP(read(natives[0][1])).slice(157,1590);
const nativeB=toGP(read(natives[1][1])).slice(557,1990);
assert.equal(nativeA.length,key.length);
assert.equal(nativeB.length,key.length);
const pad=nativeA.map((_,i)=>{
  let k=(i*7+3)%29;
  while(mod(nativeB[i]+k)===0) k=mod(k+1);
  return k;
});
const plantedA=nativeA.map((v,i)=>mod(v+pad[i]));
const plantedB=nativeB.map((v,i)=>mod(v+pad[i]));
assert.ok(plantedB.every(v=>v!==0));
const planted=equality(plantedA,plantedB);
assert.deepEqual(planted.histogram,equality(nativeA,nativeB).histogram);
console.log("ALL-SECRET-PLANT",JSON.stringify({
  length:plantedA.length,nonFCarrier:plantedB.every(v=>v!==0),
  exactPadCancellation:true,fullPairRecovered:plantedA.length
}));
console.log("DECISION",JSON.stringify({
  originalKeyConsumedPositions:key.length,originalSharedPadExact:actual.exact,
  originalSharedPadBestCaesar:actual.best,
  sourceNativeComparisons:total,bestCaesarControlsAtMostOriginal:bestAsOriginal,
  originalPlaintextRecovered:false,
  scope:"common additive pad with the same indexed 1433 positions, English GP controls"
}));
