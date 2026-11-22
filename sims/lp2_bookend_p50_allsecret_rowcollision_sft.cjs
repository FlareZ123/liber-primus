"use strict";
/**
 * All-secret, key-independent original LP2 collision invariant:
 * C_i = S_{p50state(i),K_i}(P_i), for an ARBITRARY GP29 permutation
 * S independently chosen for every p50 state and source K rune.
 *
 * Every equality pair inside one (state,K) row is invariant under
 * that row's completely unknown 29! alphabet. Test ALL 32 visible
 * first-digit + subset-of-parity-splits p50 clocks, two original A/B
 * bookend maps, and 256 independent source-native full-length GP29
 * word-shaped English controls. Every secret alphabet is allowed.
 *
 * SFT: node sims/lp2_bookend_p50_allsecret_rowcollision_sft.cjs
 * Windows 11 Node.js 22 CommonJS, read-only source data.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8")
  .replace(/\r\n/g, "\n");
const lp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const full = lp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices || []);
assert.equal(full.length, 12956);
const A = full.slice(0, 6561), C = full.slice(6561);
assert.deepEqual([A.length, C.length, grid.bytes.length],
  [6561, 6395, 256]);
assert.deepEqual(A.slice(-6), C.slice(-6));
const printed = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\n/g, "").replace(/\n/g, "");
const rex = new RegExp("[" + lp.runes.join("") + "]+", "gu");
const wordLengths = (printed.match(rex) || []).map(w => [...w].length);
assert.equal(wordLengths.length, 2896);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), full.length);
assert.deepEqual(wordLengths.reduce((a, b) => {
  a[b]++; return a;
}, Array(15).fill(0)).slice(1),
[83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

const holes = new Set([2244,2384,2476,2575,2672]);
const originalCells = Array.from({length:6400}, (_, i) => i)
  .filter(i => !holes.has(i));
/** GF(3^4) generator x+1 as selected in original p7 source work. */
function mul(x) {
  const d = [0,0,0,0,0];
  for (let i = 0; i < 4; i++) {
    const trit = x % 3;
    x = Math.floor(x / 3);
    d[i] += trit;
    d[i+1] += trit;
  }
  const high = d[4] % 3;
  for (let i=0;i<3;i++) d[i] -= high;
  return d.slice(0,4).reduce((s,v,i) =>
    s + ((v % 3 + 3) % 3)*3**i,0);
}
const gp81=[1];
while(gp81.length<80)gp81.push(mul(gp81.at(-1)));
assert.equal(new Set(gp81).size,80);
assert.equal(mul(gp81[79]),1);
const partner={
  field:originalCells.map(i =>
    A[81*gp81[Math.floor(i/80)]+gp81[i%80]]),
  crop:originalCells.map(i =>
    A[81*(Math.floor(i/80)+1)+1+i%80])
};
const originalBytes = C.map((_,i) => grid.bytes[(6560+i)%256]);
/** @param {number} mask All 32 combinations of high-digit parity split. */
function stateFor(mask){
  const base=Array(5).fill(0);
  let states=0;
  for(let d=0;d<5;d++){
    base[d]=states;
    states+=1+((mask>>d)&1);
  }
  const state=originalBytes.map(v=>{
    const high=Math.floor(v/60);
    assert(high>=0&&high<5);
    return base[high] + (((mask>>high)&1) ? v%2 : 0);
  });
  return {state,states};
}
/**
 * Exact ordered same-rune pairs conditioned on original source (z,K).
 * A substitution independently permutes labels within EVERY row but
 * preserves equality exactly, for every possible unknown 29! choice.
 *
 * @param {number[]} letters Either original ciphertext or GP29 native
 * @param {number[]} state Original per-position source p50 state
 * @param {number} nStates Number of source states
 * @param {number[]} K Original A-rune source partner
 * @returns {{ numerator:number, denominator:number, rate:number}}
 */
function collisions(letters,state,nStates,K){
  assert.equal(letters.length,C.length);
  assert.equal(state.length,C.length);
  assert.equal(K.length,C.length);
  const h=Array.from({length:nStates*29},()=>new Uint16Array(29));
  for(let i=0;i<letters.length;i++)
    h[state[i]*29+K[i]][letters[i]]++;
  let numerator=0,denominator=0;
  for(const row of h){
    const n=row.reduce((s,x)=>s+x,0);
    denominator+=n*(n-1);
    for(const x of row)numerator+=x*(x-1);
  }
  return {numerator,denominator,rate:numerator/denominator};
}
const masks=Array.from({length:32},(_,mask)=>{
  const {state,states}=stateFor(mask);
  return {mask,states,state};
});
const original=Object.fromEntries(Object.entries(partner).map(([name,K])=>
  [name,masks.map(({mask,states,state})=>({
    mask,states,...collisions(C,state,states,K)
  }))]));
assert.deepEqual(
  [original.field[0].numerator,original.field[7].numerator,
    original.field[31].numerator],
  [10868,6786,5508]);
assert.deepEqual(
  [original.crop[0].numerator,original.crop[7].numerator,
    original.crop[31].numerator],
  [11032,7016,5666]);

/** @param {number} seed @returns {()=>number} */
function seeded(seed){
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;
  };
}
const sourceControlFiles={
  Gibran:"resources/control/gibran_prophet_58585.txt",
  Shakespeare:"resources/control/shakespeare_first300k.txt"
};
const nControls=128;
const controls={};
let firstPlant=null;
for(const [author,file] of Object.entries(sourceControlFiles)){
  const bookIndex=Object.keys(sourceControlFiles).indexOf(author);
  const random=seeded(0x50330181 + bookIndex*0x1000333);
  const bank=Array.from({length:15},()=>[]);
  for(const word of read(file).toUpperCase().match(/[A-Z]+/g)||[]){
    const w=encodeSourceNativeGP(word);
    if(w.length>=1&&w.length<=14)bank[w.length].push(w);
  }
  assert(wordLengths.every(n=>bank[n].length>0));
  const samples=[];
  for(let test=0;test<nControls;test++){
    const P=wordLengths.flatMap(n=>{
      const candidates=bank[n];
      return candidates[Math.floor(random()*candidates.length)];
    }).slice(6561);
    assert.equal(P.length,6395);
    if(!firstPlant)firstPlant=P;
    samples.push(P);
  }
  controls[author]=samples;
}

// Match every real matched-length control against every unfitted
// 32-state clock and both original A-source bookend readings.
const measurements={};
for(const [sourceName,K] of Object.entries(partner)){
  measurements[sourceName]={};
  for(const [author,samples] of Object.entries(controls)){
    const cases=[];
    for(const {mask,states,state} of masks){
      const observed=original[sourceName][mask];
      let minimum=Infinity,maximum=-Infinity,noHigher=0;
      for(const P of samples){
        const d=collisions(P,state,states,K);
        assert.equal(d.denominator,observed.denominator);
        minimum=Math.min(minimum,d.rate);
        maximum=Math.max(maximum,d.rate);
        if(d.numerator<=observed.numerator)noHigher++;
      }
      cases.push({
        mask,states,original:observed.rate,
        nativeMin:minimum,nativeMax:maximum,
        donorsAsLowAsOriginal:noHigher,
        donors:nControls
      });
    }
    measurements[sourceName][author]=cases;
  }
}
for(const bySource of Object.values(measurements))
  for(const cases of Object.values(bySource))
    assert.ok(cases.every(c=>c.donorsAsLowAsOriginal===0),
      "Expected all independent native GP29 donor controls above original");

// Positive plant: a distinct completely arbitrary SECRET 29! alphabet
// for every observed state/K row, including 10-state and 8-state clocks.
let plants=0;
for(const mask of [7,31])for(const [name,K] of Object.entries(partner)){
  const {state,states}=stateFor(mask);
  const random=seeded(0x11335577+mask);
  const secret=Array.from({length:states*29},()=>{
    const perm=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [perm[i],perm[j]]=[perm[j],perm[i]];
    }
    return perm;
  });
  const cipher=firstPlant.map((p,i)=>
    secret[state[i]*29+K[i]][p]);
  const decoded=cipher.map((v,i)=>
    secret[state[i]*29+K[i]].indexOf(v));
  assert.deepEqual(decoded,firstPlant);
  const b=collisions(firstPlant,state,states,K);
  const a=collisions(cipher,state,states,K);
  assert.deepEqual(a,b,
    "Any row-secret permutation must preserve exact same-symbol collisions");
  plants++;
}
assert.equal(plants,4);
console.log(JSON.stringify({
  status:"PASS",
  originalSource:{runes:full.length,A:A.length,C:C.length,
    p50Bytes:grid.bytes.length,printedWords:wordLengths.length},
  theorem:"Every arbitrary secret GP29 row permutation S_(state,K) preserves the exact within-row same-letter-pair numerator and denominator. The original low conditional collision frequencies cannot be caused by a stationary secret row alphabet alone.",
  sourceMasks:masks.length,sourcePairings:Object.keys(partner),
  nativeControlsPerAuthor:nControls,
  representative:Object.fromEntries(Object.entries(original).map(([name,list])=>
    [name,list.filter(x=>[0,7,15,23,31].includes(x.mask))
      .map(x=>({
        ...x,
        Gibran:measurements[name].Gibran[x.mask],
        Shakespeare:measurements[name].Shakespeare[x.mask]
      }))])),
  allMasks:Object.fromEntries(Object.entries(measurements).map(
    ([name,byAuthor])=>[name,Object.fromEntries(Object.entries(byAuthor)
      .map(([author,cases])=>[author,cases.map(x=>({
        mask:x.mask,original:x.original,
        nativeMin:x.nativeMin,nativeMax:x.nativeMax,
        donorsAsLowAsOriginal:x.donorsAsLowAsOriginal
      }))]))])),
  positiveFullySecretRowBijections:plants,
  caveat:"Source partner and p50 clock are hypotheses; the negative is conditional on original preserved native GP29 English words and unchanged word boundaries. Fully mixed 841! pair permutations and evolving keys remain outside the theorem."
},null,2));
