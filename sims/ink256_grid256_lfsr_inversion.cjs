"use strict";
/**
 * Source-defined 256-event / 256-byte finite-field recurrence and original
 * LP2 inverse. Read-only Node.js 22 CommonJS SFT.
 *
 * Exactly 225 red GP runes plus 31 source 13-dot punctuation events seed a
 * 256-place F29 recurrence. The 256 printed base-60 bytes provide tap values.
 * A p54 oversized Ac/GP-index-24 clue motivates the source-polynomial
 * quotient by (X - 24)^2, independently known to divide the coefficients.
 *
 * The two coefficient streams (raw256, Ac-quotient254), two directions,
 * three output registers and both signs are finite declared comparators.
 * They do not identify the historical cipher. Never score the first 256
 * positions as heldout: the seed itself contains ciphertext glyphs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const cipher = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(cipher.length, 12956);

/** @param {number} a @param {number} n */
function mod(a, n) { return ((a % n) + n) % n; }

/**
 * Chronological original-ink 256-event state: an original red rune contributes
 * its zero-based GP index; every source 13-dot mark contributes F29 zero.
 * Mark precedes rune at coincident source coordinates.
 * @returns {number[]}
 */
function sourceSeed() {
  const e = [];
  for (const pg of ink.pages) {
    const original = corpus.pages[pg.page];
    assert.equal(original.indices.length, pg.rune_count);
    for (const span of pg.red_spans || []) {
      assert.equal(
        span.runes,
        original.indices.slice(span.start, span.start + span.length)
          .map(n => corpus.runes[n]).join("")
      );
      for (let off = span.start; off < span.start + span.length; off++)
        e.push({page:pg.page, off, kind:1, value:original.indices[off]});
    }
    for (const m of pg.large_punctuation || []) {
      if (m[1] === 13)
        e.push({page:pg.page, off:m[0], kind:0, value:0});
    }
  }
  e.sort((a,b) => a.page-b.page || a.off-b.off || a.kind-b.kind);
  assert.equal(e.length,256);
  assert.equal(e.filter(x => x.kind).length,225);
  assert.equal(e.filter(x => !x.kind).length,31);
  return e.map(x => x.value);
}

/**
 * Synthetic division by X-24 in F29, high-degree coefficient first.
 * @param {number[]} coefficients
 * @returns {{quotient:number[], remainder:number}}
 */
function divideAc(coefficients) {
  const quotient = [coefficients[0]];
  for (let i=1;i<coefficients.length-1;i++)
    quotient.push(mod(coefficients[i] + 24*quotient[i-1],29));
  return {
    quotient,
    remainder:mod(coefficients[coefficients.length-1]+24*quotient.at(-1),29)
  };
}

/**
 * Full-length F29 recurrence using the original 256 source events as initial
 * state. Taps are applied in forward coefficient order, optionally reversed.
 * @param {number[]} initial
 * @param {number[]} coefficients
 * @returns {number[]}
 */
function stream(initial, coefficients) {
  const out=initial.slice();
  for (let n=out.length;n<cipher.length;n++) {
    let sum=0;
    for (let j=0;j<coefficients.length;j++)
      sum+=coefficients[j]*out[n-coefficients.length+j];
    out.push(sum%29);
  }
  return out;
}

const log15=Array(29).fill(-1), pow15=[];
for (let i=0,v=1;i<28;i++,v=v*15%29) {
  assert.equal(log15[v],-1);
  pow15.push(v);
  log15[v]=i;
}
assert.equal(new Set(pow15).size,28);

/**
 * @typedef {{family:"direct"|"delta"|"ea",sign:-1|1}} Mode
 * @param {number[]} c
 * @param {number[]} key
 * @param {Mode} mode
 * @returns {number[]}
 */
function decrypt(c,key,mode) {
  const result=[];
  for (let i=0;i<c.length;i++) {
    const diff=mod(c[i]-(i?c[i-1]:0),29);
    const letter=mode.family==="direct"?c[i]:diff;
    result.push(mode.family==="ea"
      ? diff===0?28:mod(log15[diff]+mode.sign*(key[i]%28),28)
      : mod(letter+mode.sign*key[i],29));
  }
  return result;
}

/**
 * @param {number[]} p
 * @param {number[]} key
 * @param {Mode} mode
 * @returns {number[]}
 */
function encrypt(p,key,mode) {
  const c=[];
  for (let i=0;i<p.length;i++) {
    const previous=i?c[i-1]:0;
    if (mode.family==="ea") {
      c.push(mod(previous+(p[i]===28?0:
        pow15[mod(p[i]-mode.sign*(key[i]%28),28)]),29));
    } else if(mode.family==="delta") {
      c.push(mod(previous+p[i]-mode.sign*key[i],29));
    } else {
      c.push(mod(p[i]-mode.sign*key[i],29));
    }
  }
  return c;
}

/** @param {number[]} seq */
function profile(seq) {
  const f=Array(29).fill(0);
  for (const x of seq) f[x]++;
  return {
    ioc:f.reduce((a,n)=>a+n*(n-1),0)/(seq.length*(seq.length-1)),
    top12:f.sort((a,b)=>b-a).slice(0,12)
      .reduce((a,n)=>a+n,0)/seq.length
  };
}

/**
 * Independently known LP1 source-native reference. Its text normalization
 * reproduces the project's existing GP transliteration convention.
 * Repeated only to match the manuscript length for a positive-control plant.
 * @returns {number[]}
 */
function nativeGP() {
  const mapping = corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const words=read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split(/\r?\n/).filter(s=>!s.startsWith("#"))
    .join(" ").toUpperCase().match(/[A-Z]+/g)||[];
  const plain=[];
  for (let word of words) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const symbols=[];
    for (let j=0;j<word.length;) {
      const g=mapping.find(x=>word.startsWith(x.s,j));
      if (!g) {symbols.length=0;break;}
      symbols.push(g.i);j+=g.s.length;
    }
    plain.push(...symbols);
  }
  assert.ok(plain.length>=3000);
  return Array.from({length:cipher.length},(_,i)=>plain[i%plain.length]);
}

function run() {
  const seed=sourceSeed();
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  const raw=bytes.map(x=>x%29);
  const first=divideAc(raw),second=divideAc(first.quotient);
  assert.equal(first.remainder,0);
  assert.equal(second.remainder,0);
  assert.equal(second.quotient.length,254);
  const native=nativeGP();
  const found=[];
  for (const [coefficientsName,taps] of [
    ["raw256",raw],["Ac-quotient254",second.quotient]
  ]) for(const reverse of [false,true]) {
    const k=stream(seed,reverse?taps.slice().reverse():taps);
    for(const family of ["direct","delta","ea"])
      for(const sign of [-1,1]) {
        const mode={family,sign};
        const decoded=decrypt(cipher,k,mode);
        assert.deepEqual(encrypt(decoded,k,mode),cipher);
        const planted=encrypt(native,k,mode);
        assert.deepEqual(decrypt(planted,k,mode),native);
        const heldout=decoded.slice(256),metrics=profile(heldout);
        found.push({coefficientsName,reverse,family,sign,...metrics,
          heldoutPrefix:heldout.slice(0,32)
            .map(x=>corpus.translit[x]).join("")});
      }
  }
  assert.equal(found.length,24);
  found.sort((a,b)=>b.ioc-a.ioc);
  return {
    source:"LP2 256 printed bytes plus 225 red runes and 31 13-dot marks",
    originalLength:cipher.length,sourceEvents:seed.length,
    independentHeldout:12700,coefficientsTested:2,
    modes:found.length,syntheticPlantsRecovered:found.length,
    originalReencryptionChecks:found.length,
    inputIoC:profile(cipher).ioc,nativeControlIoC:profile(native.slice(256)).ioc,
    best:found.slice(0,8),
    remaining:found.slice(8).map(({coefficientsName,reverse,family,sign,ioc,top12})=>
      ({coefficientsName,reverse,family,sign,ioc,top12})),
    conclusion:"No recognizable original GP plaintext. Exact inversion alone is not key evidence."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,sourceSeed,divideAc,stream,decrypt,encrypt,profile,nativeGP};
