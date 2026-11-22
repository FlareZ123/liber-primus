"use strict";
/**
 * Cicada-anchored multiplicative pad: phase-independent collision inverse.
 *
 * The solved LP2 Parable prime clause sums produce a documented original
 * 2013 ID3 value 1,595,277,641 = 1259*1031*1229. Its residues are
 * primitive roots 70 modulo 3301 (period 3300) and 68 modulo 79
 * (period 78). Test a specifically declared global/page/section-reset
 * direct running-key model against all ORIGINAL LP2 ciphertext runes.
 *
 * For C[i] = sigma((P[i] + K[i]) mod 29), where sigma is any fixed unknown
 * alphabet bijection, at equal key phases ciphertext equality is exactly
 * plaintext equality, independent of seed, pad phase or sigma.
 *
 * For 28-choice previous-rune difference output, at equal nonzero-step
 * clock phases, difference-symbol equality also preserves direct GP28
 * plaintext equality under an arbitrary fixed secret difference alphabet.
 * Immediately repeated runes consume NO key symbols in this branch.
 *
 * These are conditional source-language discriminators, NOT proofs that
 * the manuscript uses any particular GP plaintext, generator or cipher.
 * All original rate results are compared with complete, geometry-matched
 * source windows and with synthetic complete re-encryption positives.
 *
 * Node.js 22 CommonJS, built-in modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname,"..");
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourcePaths = [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const pages = corpus.pages.filter(p=>p.page<56 && p.indices.length);
const lengths = pages.map(p=>p.indices.length);
const sections = [729,1145,1738,1894,1021,1433,1680,3316];
const cipher = pages.flatMap(p=>p.indices);
const N = cipher.length, PRODUCT = 1259*1031*1229;
assert.equal(PRODUCT,1595277641);
assert.equal(N,12956);
assert.equal(pages.length,55);
assert.equal(sections.reduce((s,n)=>s+n,0),N);
const T = corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} source */
function gp(source) {
  const out = [];
  for(let w of source.toUpperCase().match(/[A-Z]+/g)||[]) {
    w = w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;) {
      const t = T.find(t=>w.startsWith(t.s,i));
      assert.ok(t,"Unrecognized GP encoding: "+w.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/** @param {number[]} arr @param {number[]} lens */
function split(arr,lens) {
  let start=0;
  const result=lens.map(len=>{
    const out=arr.slice(start,start+len);
    start += len;
    return out;
  });
  assert.equal(start,arr.length);
  return result;
}
const cipherPages = pages.map(p=>p.indices);
const cipherSections = split(cipher,sections);

/** @param {number[]} page */
function steps(page) {
  const out=[];
  for(let i=1;i<page.length;i++) {
    const d=(page[i]-page[i-1]+29)%29;
    if(d)out.push(d);
  }
  return out;
}
const cleanPages = cipherPages.map(steps);
const cleanBook = cleanPages.flat();
const cleanSections = cipherSections.map(steps);
assert.equal(cleanBook.length,12815);

/**
 * Equality rate at a fixed positive lag on one source sequence.
 * @param {number[]} data @param {number} period
 */
function lag(data,period) {
  assert(data.length>period);
  let equal=0;
  for(let i=period;i<data.length;i++)equal+=Number(data[i]===data[i-period]);
  return {equal,pairs:data.length-period,rate:equal/(data.length-period)};
}

/**
 * Equality at the same local clock phase across any number of segments.
 * Exclude the per-segment initial IV at local index zero.
 * @param {number[][]} group
 */
function clock(group) {
  let equal=0,pairs=0;
  for(let i=1;i<Math.max(...group.map(a=>a.length));i++) {
    const count=new Uint16Array(29);
    let n=0;
    for(const seg of group)if(i<seg.length){count[seg[i]]++;n++;}
    pairs+=n*(n-1)/2;
    for(const v of count)equal+=v*(v-1)/2;
  }
  return {equal,pairs,rate:equal/pairs};
}

/** For nonzero-step payloads no per-page first-symbol IV needs exclusion. */
function clockSteps(group) {
  let equal=0,pairs=0;
  for(let i=0;i<Math.max(...group.map(a=>a.length));i++) {
    const count=new Uint16Array(29);
    let n=0;
    for(const seg of group)if(i<seg.length){count[seg[i]]++;n++;}
    pairs+=n*(n-1)/2;
    for(const v of count)equal+=v*(v-1)/2;
  }
  return {equal,pairs,rate:equal/pairs};
}

/** @param {number} base @param {number} exponent @param {number} mod */
function powmod(base,exponent,mod) {
  let v=1;
  for(let i=0;i<exponent;i++)v=v*base%mod;
  return v;
}
function orders() {
  assert.equal(PRODUCT%3301,70);
  assert.equal(PRODUCT%79,68);
  const result=[];
  for(const {prime,period,factors} of [
    {prime:3301,period:3300,factors:[2,3,5,11]},
    {prime:79,period:78,factors:[2,3,13]}
  ]) {
    const root=PRODUCT%prime;
    const proof=factors.map(q=>({q,value:powmod(root,period/q,prime)}));
    assert.equal(powmod(root,period,prime),1);
    assert(proof.every(x=>x.value!==1));
    result.push({prime,root,order:period,primeFactorObstructions:proof});
  }
  return result;
}

/** @param {number} seed @param {number} modulus */
function generator(seed,modulus) {
  const g=PRODUCT%modulus;
  let state=seed%modulus;
  assert(state>0);
  return ()=>{const out=state;state=state*g%modulus;return out;};
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;};
}
/** @param {number} n @param {()=>number} random */
function permutation(n,random) {
  const a=Array.from({length:n},(_,i)=>i);
  for(let i=n-1;i>0;i--) {
    const j=random()%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/**
 * Genuine full manuscript-shaped GP29 fixed substitution + running-key plant.
 * The same seed is restarted at every page or section boundary as specified.
 * @param {number[]} plain
 * @param {"book"|"pages"|"sections"} mode
 * @param {number} modulus
 */
function gp29Plant(plain,mode,modulus) {
  const lens=mode==="book"?[N]:mode==="pages"?lengths:sections;
  const random=rng(0x33017000+modulus);
  const alphabet=permutation(29,random),inverse=Array(29);
  alphabet.forEach((v,i)=>{inverse[v]=i;});
  const sourceParts=split(plain,lens),produced=[],recovered=[];
  for(let j=0;j<sourceParts.length;j++) {
    const stream=sourceParts[j];
    const key=generator(PRODUCT%modulus,modulus);
    const enc=[(11+7*j)%29],dec=[null];
    for(let i=1;i<stream.length;i++) {
      const k=key()%29;
      enc.push(alphabet[(stream[i]+k)%29]);
      dec.push((inverse[enc[i]]-k+29)%29);
    }
    for(let i=1;i<stream.length;i++)assert.equal(dec[i],stream[i]);
    produced.push(enc);
    recovered.push(dec);
  }
  const plainRecovered=recovered.flat();
  const c=produced.flat();
  assert.equal(c.length,N);
  for(let i=0,parts=produced;i<parts.length;i++) {
    const enc=parts[i],rec=recovered[i],source=sourceParts[i];
    assert.equal(enc.length,source.length);
    assert.equal(rec.length,source.length);
  }
  const input=mode==="book"?lag(plain,modulus===3301?3300:78):
    mode==="pages"?clock(sourceParts):clock(sourceParts);
  const output=mode==="book"?lag(c,modulus===3301?3300:78):
    mode==="pages"?clock(produced):clock(produced);
  // Book first symbol is an unconstrained IV; its single lag pair may differ.
  if(mode!=="book") assert.deepEqual(output,input);
  else assert.ok(Math.abs(output.equal-input.equal)<=1);
  return {modulus,mode,recipheredRunes:N,
    exactRecoveredPlaintextRunes:N-lens.length,
    observedEqualityRate:output.rate,sourceEqualityRate:input.rate,
    originalShapedSegments:lens.length};
}

/**
 * GP28 per-nonzero-step running pad, fixed secret 28-way difference table,
 * manuscript page initials as IVs and exact 86 equal-adjacent marker sites.
 * @param {number[]} native
 * @param {number} modulus
 */
function gp28Plant(native,modulus) {
  const material=native.filter(x=>x!==28);
  assert(material.length>=cleanBook.length);
  const plain=material.slice(0,cleanBook.length);
  const random=rng(0x28283301+modulus),alpha=permutation(28,random);
  const inverse=Array(28);
  alpha.forEach((v,i)=>{inverse[v]=i;});
  const key=generator(PRODUCT%modulus,modulus);
  let pointer=0,original=[],recovered=[];
  for(let j=0;j<cipherPages.length;j++) {
    const target=cipherPages[j],out=[(7*j+5)%29];
    for(let i=1;i<target.length;i++) {
      if(target[i]===target[i-1])out.push(out[i-1]);
      else {
        const rank=alpha[(plain[pointer++]+key()%28)%28];
        out.push((out[i-1]+rank+1)%29);
      }
    }
    original.push(out);
  }
  assert.equal(pointer,12815);
  const keyBack=generator(PRODUCT%modulus,modulus);
  for(const page of original)for(let i=1;i<page.length;i++) {
    const delta=(page[i]-page[i-1]+29)%29;
    if(delta===0)continue;
    const k=keyBack()%28;
    recovered.push((inverse[delta-1]-k+28)%28);
  }
  assert.deepEqual(recovered,plain);
  const encoded=original.flatMap(steps);
  const stepKey=generator(PRODUCT%modulus,modulus);
  const regained=encoded.map(d=>(inverse[d-1]-stepKey()%28+28)%28);
  assert.deepEqual(regained,plain);
  const originalMarkerCount=original.reduce((s,p)=>s+
    p.slice(1).filter((v,i)=>v===p[i]).length,0);
  assert.equal(originalMarkerCount,86);
  return {modulus,allOriginalRunes:original.flat().length,
    exactNonzeroSteps:recovered.length,markersPreserved:original.reduce(
      (s,p)=>s+p.slice(1).filter((v,i)=>v===p[i]).length,0),
    sourceLagEquality:lag(plain,modulus===3301?3300:78).rate,
    ciphertextStepLagEquality:lag(encoded,modulus===3301?3300:78).rate};
}

/** Construct source control windows under exact original lengths. */
function references() {
  const result={};
  for(const [name,file] of sourcePaths) {
    const data=gp(read(file)),entries=[];
    for(let i=0;i<20;i++) {
      const begin=(1013+2639*i)%(data.length-N);
      const sample=data.slice(begin,begin+N);
      const withoutEA=sample.filter(v=>v!==28);
      entries.push({
        book78:lag(sample,78).rate,
        book3300:lag(sample,3300).rate,
        nonEA78:lag(withoutEA,78).rate,
        nonEA3300:lag(withoutEA,3300).rate,
        pageClock:clock(split(sample,lengths)).rate,
        sectionClock:clock(split(sample,sections)).rate
      });
    }
    const stats={sourceRunes:data.length,windows:entries.length};
    for(const feature of Object.keys(entries[0])) {
      const values=entries.map(x=>x[feature]);
      stats[feature]={
        min:Math.min(...values),
        mean:values.reduce((s,x)=>s+x,0)/values.length,
        max:Math.max(...values)
      };
    }
    result[name]=stats;
  }
  return result;
}
function main() {
  const periodProof=orders();
  const original={
    book78:lag(cipher,78),book3300:lag(cipher,3300),
    nonzeroStepBook78:lag(cleanBook,78),
    nonzeroStepBook3300:lag(cleanBook,3300),
    pageClock:clock(cipherPages),
    sectionClock:clock(cipherSections),
    nonzeroPageClock:clockSteps(cleanPages),
    nonzeroSectionClock:clockSteps(cleanSections)
  };
  assert.deepEqual([
    original.book78.equal,original.book3300.equal,
    original.nonzeroStepBook78.equal,original.nonzeroStepBook3300.equal,
    original.pageClock.equal,original.sectionClock.equal,
    original.nonzeroPageClock.equal,original.nonzeroSectionClock.equal],
    [456,307,466,339,10699,1119,10943,1166]);
  const control=references();
  const source=gp(read(sourcePaths[0][1]));
  const plantPlain=source.slice(12731,12731+N);
  const positive=[],positiveGP28=[];
  for(const mod of [3301,79]) {
    for(const mode of ["book","pages","sections"])
      positive.push(gp29Plant(plantPlain,mode,mod));
    positiveGP28.push(gp28Plant(source.slice(12731,12731+N+600),mod));
  }
  return {
    sourceProof:"Parable product residue is primitive root in F3301 and F79",
    product:PRODUCT,periodProof,
    physicalPages:55,cipherRunes:N,nonzeroCiphertextSteps:cleanBook.length,
    model:"Direct stationary secret-alphabet additive GP29 pad or direct stationary GP28 nonzero-step pad, repeating after full multiplicative cycle; book/global period, page reset, section reset",
    original,reference:{geometryMatchedTwentySourceWindowsPerEdition:control},
    plantedSourceTrueGP29:positive,plantedSourceTrueGP28:positiveGP28,
    sourceConclusion:"No English-like equality concentration at matching source-authenticated pad phases under declared stationary direct models. Cipher or plaintext language and more complex state remain open.",
    caveat:"Phase-independent collision constraints rely on a fixed outer bijection and a repeating additive key in the corresponding symbol stream; English source references are illustrative, not a mathematical exclusion of every possible plaintext. Source windows overlap; no uncorrected discovery-wide significance claim."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={gp,lag,clock,clockSteps,generator,orders,gp29Plant,gp28Plant,references,main};
