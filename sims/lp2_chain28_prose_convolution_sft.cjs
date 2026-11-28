"use strict";
/*
 * LP2 full-tape GP28 chain: independent prose-running-key marginal gate.
 * A direct chain inverse is supplied for *known* GP28 keys. No original key
 * or unknown plaintext is claimed or fitted.
 *
 * node sims/lp2_chain28_prose_convolution_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"));
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const vulgate = JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json"));
const ORIGINAL = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ORIGINAL.length, 12956);
assert.equal(corpus.translit.length, 29);
const DIGRAPHS = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const gp = new Map(corpus.translit.map((s, i) => [s, i]));
function encodeNative(source, aliases = false) {
  let s = source.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  if (aliases) s = s.replace(/ING/g, "NG").replace(/IO/g, "IA");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = DIGRAPHS.find(x => s.startsWith(x, i));
    if (pair) {
      out.push(gp.get(pair));
      i += pair.length;
    } else {
      const x = gp.get(s[i]);
      if (x !== undefined) out.push(x);
      i++;
    }
  }
  return out;
}
function counts(a) {
  const c = Array(29).fill(0);
  for (const x of a) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    c[x]++;
  }
  return c;
}
function profile(c) {
  const n = c.reduce((x, y) => x + y, 0);
  assert(n > 0 && c.length === 29);
  return c.map(x => x / n);
}
function donorProfiles(aliases) {
  const sh = encodeNative(read("resources/control/shakespeare_first300k.txt"), aliases);
  const gi = encodeNative(read("resources/control/gibran_prophet_58585.txt"), aliases);
  const em = encodeNative(read("resources/control/emerson_essays_2944.txt"), aliases);
  const sources = [
    { name: "LP1", c: counts(lp1.key), stream: lp1.key },
    { name: "Shakespeare", c: counts(sh), stream: sh },
    { name: "Gibran", c: counts(gi), stream: gi },
    { name: "Emerson", c: counts(em), stream: em },
    { name: "Beowulf", c: beowulf.allGpCounts },
    { name: "Vulgate", c: counts(vulgate.runes) }
  ];
  return sources.map(x => ({ ...x, p: profile(x.c) }));
}
function deltaCounts(stream) {
  const h = Array(28).fill(0);
  let doubles = 0;
  for (let i = 1; i < stream.length; i++) {
    const d = (stream[i] - stream[i - 1] + 29) % 29;
    if (d === 0) doubles++;
    else h[d - 1]++;
  }
  return { h, doubles };
}
const observed = deltaCounts(ORIGINAL);
assert.equal(observed.doubles, 86);
assert.deepEqual(observed.h, [
  459,504,440,438,446,430,470,426,510,497,455,449,504,474,
  470,449,404,434,474,467,463,421,486,468,467,457,476,431
]);
const N = observed.h.reduce((a,b) => a+b, 0);
assert.equal(N, 12869);
const UNITS = [1,3,5,9,11,13,15,17,19,23,25,27];
const KEY_MULTIPLIERS=Array.from({length:28},(_,i)=>i);
const MOD = 28;
const mod = x => ((x % MOD) + MOD) % MOD;
const statistic = (counts, probability) => {
  const n = counts.reduce((a,b) => a+b, 0);
  return counts.reduce((a, v, i) => a + ((v - n*probability[i])**2)/(n*probability[i]), 0);
};
const uniform28 = Array(28).fill(1/28);
const originalVsUniform = statistic(observed.h, uniform28);
/*
 * Explicit scoped sender:
 *   plain EA (28): delta=0;
 *   otherwise delta=1+(a*P + sign*b*K) mod 28;
 *   C_i=(C_(i-1)+delta) mod 29.
 * K=EA is either mapped to K=0 ("mod28") or treated as a skipped key
 * emission ("skip28"). Both choices are sensitivity assumptions,
 * not authenticated LP2 instructions.
 */
function predicted(p, k, a, b, sign, keyEA) {
  const z = Array(28).fill(0);
  const visiblePlain = 1-p[28];
  const keyDen = keyEA === "skip28" ? 1-k[28] : 1;
  for(let i=0; i<28; i++) for(let j=0; j<29; j++) {
    if (j === 28 && keyEA === "skip28") continue;
    z[mod(a*i + sign*b*(j%28))] += (p[i]/visiblePlain) * (k[j]/keyDen);
  }
  assert(Math.abs(z.reduce((s,x)=>s+x,0)-1)<1e-12);
  return z;
}
function scan(donors) {
  const pairs=[];
  let global={statistic:Infinity};
  for(const p of donors) for(const k of donors) {
    let best={statistic:Infinity};
    for(const keyEA of ["mod28","skip28"]) for(const a of UNITS)
      for(const b of KEY_MULTIPLIERS) for(const sign of [-1,1]) {
        const model=predicted(p.p,k.p,a,b,sign,keyEA);
        const s=statistic(observed.h,model);
        if(s<best.statistic) best={statistic:s,a,b,sign,keyEA};
      }
    pairs.push({plaintext:p.name,key:k.name,statistic:best.statistic,
      a:best.a,b:best.b,sign:best.sign,keyEA:best.keyEA});
    if(best.statistic<global.statistic) global=pairs[pairs.length-1];
  }
  return {global,pairs};
}
// Synthetic known-key round-trip, seeded from independently frozen GP sources.
function encodeChain(plain,key,a,b,sign,seed) {
  let prev=seed, out=[];
  assert(UNITS.includes(a) && UNITS.includes(b) && key.length>=plain.length);
  for(let i=0;i<plain.length;i++) {
    const d=plain[i]===28 ? 0 : 1+mod(a*plain[i]+sign*b*(key[i]%28));
    prev=(prev+d)%29;
    out.push(prev);
  }
  return out;
}
function decodeChain(cipher,key,a,b,sign,seed) {
  let prev=seed, out=[], inv=UNITS.find(v=>mod(a*v)===1);
  assert(inv!==undefined);
  for(let i=0;i<cipher.length;i++) {
    const d=(cipher[i]-prev+29)%29;
    out.push(d===0?28:mod(inv*(d-1-sign*b*(key[i]%28))));
    prev=cipher[i];
  }
  return out;
}
function xorshift(seed) {
  let state=seed>>>0;
  return () => {
    state ^= state<<13; state ^= state>>>17; state ^= state<<5;
    return (state>>>0)/4294967296;
  };
}
function quantiles(values) {
  values.sort((a,b)=>a-b);
  return [values[0],values[9],values[99],values[189],values[199]];
}
function controls(donors) {
  const sh=donors.find(x=>x.name==="Shakespeare");
  const gi=donors.find(x=>x.name==="Gibran");
  const a=13,b=3,sign=-1, L=12956;
  assert(sh.stream.length>L && gi.stream.length>L);
  const model=predicted(sh.p,gi.p,a,b,sign,"mod28");
  const rng=xorshift(0x3301);
  const natural=[],flat=[];
  for(let trial=0;trial<200;trial++) {
    const offp=Math.floor(rng()*(sh.stream.length-L));
    const offk=Math.floor(rng()*(gi.stream.length-L));
    const plain=sh.stream.slice(offp,offp+L);
    const key=gi.stream.slice(offk,offk+L);
    const cipher=encodeChain(plain,key,a,b,sign,7);
    if (trial===0 || trial===199)
      assert.deepEqual(decodeChain(cipher,key,a,b,sign,7),plain);
    const v=deltaCounts([7,...cipher]);
    natural.push(statistic(v.h,model));
    const uniformKey=Array.from({length:L},()=>Math.floor(rng()*28));
    const uniformCipher=encodeChain(plain,uniformKey,a,b,sign,7);
    const u=deltaCounts([7,...uniformCipher]);
    flat.push(statistic(u.h,uniform28));
    if(trial===0)
      assert.deepEqual(decodeChain(uniformCipher,uniformKey,a,b,sign,7),plain);
  }
  return {nativeProfileChiQuantiles:quantiles(natural),
    uniformKeyChiQuantiles:quantiles(flat),
    originalUnderSameNativeModel:statistic(observed.h,model)};
}
const standard=donorProfiles(false);
const aliased=donorProfiles(true);
const base=scan(standard);
const alias=scan(aliased);
assert(base.global.statistic > 150 && alias.global.statistic > 150);
const cal=controls(standard);
assert(cal.nativeProfileChiQuantiles[4] < base.global.statistic);

/*
 * Source-derived no-secret-key attack. The original pp0–2 source contributes
 * exactly 729=27^2 glyphs; treat them either as one repeating public pad or
 * as a 729-lag causal key from previously emitted ciphertext. Treat the key
 * values as raw GP glyph indices or their predecessor differences. Nothing
 * in the manuscript authenticates these four readings. This is a single
 * finite, reversible original-source gate, not a fitted key search.
 */
function coincidence(stream) {
  const h = counts(stream), n=stream.length;
  return h.reduce((sum,v)=>sum+v*(v-1),0)/(n*(n-1));
}
function opening729(donors) {
  const prefix=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
  assert.equal(prefix.length,729);
  assert.equal(prefix.length,27*27);
  const native=donors.find(x=>x.name==="Shakespeare").stream.slice(0,ORIGINAL.length-prefix.length);
  assert.equal(native.length,12227);
  const fullDifferences=[ORIGINAL[0]];
  for(let i=1;i<ORIGINAL.length;i++)
    fullDifferences.push((ORIGINAL[i]-ORIGINAL[i-1]+29)%29);
  function keyAt(glyphs,deltas,i,type,clock) {
    const j=clock==="periodic" ? (i-prefix.length)%prefix.length : i-prefix.length;
    const x=type==="glyph" ? glyphs[j] : deltas[j];
    return type==="glyph" ? x%28 : x===0 ? 0 : x-1;
  }
  const result=[];
  for(const type of ["glyph","difference"]) for(const clock of ["periodic","sliding"])
    for(const sign of [-1,1]) {
      const decode=(glyphs,deltas)=>{
        const plain=[];
        for(let i=prefix.length;i<glyphs.length;i++){
          const d=deltas[i];
          const k=keyAt(glyphs,deltas,i,type,clock);
          plain.push(d===0?28:mod(d-1+sign*k));
        }
        return plain;
      };
      const originalPlain=decode(ORIGINAL,fullDifferences);
      const synthesized=prefix.slice();
      const synthesizedDelta=fullDifferences.slice(0,prefix.length);
      for(let i=prefix.length;i<ORIGINAL.length;i++){
        const k=keyAt(synthesized,synthesizedDelta,i,type,clock);
        const p=native[i-prefix.length];
        const d=p===28 ? 0 : 1+mod(p-sign*k);
        synthesizedDelta.push(d);
        synthesized.push((synthesized[i-1]+d)%29);
      }
      assert.deepEqual(decode(synthesized,synthesizedDelta),native);
      result.push({type,clock,sign,originalIoC:coincidence(originalPlain),
        originalP3IoC:coincidence(originalPlain.slice(0,corpus.pages[3].indices.length))});
    }
  return {sourceRunes:prefix.length,sourcePages:[0,1,2],
    untouchedSourceStartPage:3,originalTestRunes:12227,
    nativeControlIoC:coincidence(native),cases:result,
    allPlantReplaysExact:true};
}
const originalOpening729 = opening729(standard);
assert(Math.max(...originalOpening729.cases.map(c=>c.originalIoC))<0.036);

const output={
  observed:{runes:ORIGINAL.length,zeroSteps:observed.doubles,
    nonzeroSteps:N,nonzeroVsUniformPearson:originalVsUniform},
  model:"EA=zero; nonzero delta=1+(a*plain+sign*b*key) mod28",
  tested: {donorProfiles:standard.map(x=>x.name),pairs:36,
    plainInvertibleMultipliers:UNITS.length,keyAffineMultipliers:KEY_MULTIPLIERS.length,signs:2,keyEAConventions:2,
    combinationsPerEncoding:36*UNITS.length*KEY_MULTIPLIERS.length*2*2},
  standard:{best:base.global,pairMinimum:base.pairs.map(x=>[x.plaintext,x.key,x.statistic])},
  aliasINGIO:{best:alias.global},
  controls:cal,
  opening729:originalOpening729,
  conclusion:"No authenticated unknown LP2 plaintext/key; exclusion conditional on independent donor-like plaintext/key unigram statistics and this exact GP28 chain emission."
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
