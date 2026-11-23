"use strict";
/**
 * Original LP2 p50 dual-00 179/75 moth-page source gate.
 * Read-only Node.js 22 CommonJS single-file test, uses existing original transcriptions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}
const grid = read("resources/liber-primus/lp2-grid-256.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const tokens = grid.pages.flatMap((p) => p.tokens);
const pages = new Map(corpus.pages.map((p) => [p.page, p.indices]));
const p53 = pages.get(53);
const p55 = pages.get(55);
const solved = pages.get(57);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(tokens.length, 256);
assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
assert.equal(solved.length, 95);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const rim = [], inner = [];
for (let n = 0; n < 256; n++) {
  const row = Math.floor(n / 8), col = n % 8;
  (row === 0 || row === 31 || col === 0 || col === 7 ? rim : inner)
    .push({ index: n, token: tokens[n] });
}
assert.deepEqual(rim.filter((p) => p.token === "00").map((p) => p.index), [192]);
assert.deepEqual(inner.filter((p) => p.token === "00").map((p) => p.index), [229]);
assert.equal(rim.length, 76);
assert.equal(inner.length, 180);
const keyRim = rim.filter((p) => p.token !== "00");
const keyInner = inner.filter((p) => p.token !== "00");
assert.equal(keyRim.length, 75);
assert.equal(keyInner.length, 179);

/** @param {number} x @param {number} n */
const mod = (x, n) => ((x % n) + n) % n;
/** @param {number[]} a */
function ioc(a) {
  const freq = Array(29).fill(0);
  for (const v of a) freq[v]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {{index:number,token:string}[]} items @param {59|60} radix */
function sourceBytes(items, radix) {
  const letters = radix === 59 ? alphabet59 : alphabet60;
  return items.map(({ token }) => {
    const first = letters.indexOf(token[0]);
    const second = letters.indexOf(token[1]);
    assert(first >= 0 && second >= 0);
    const v = radix * first + second;
    assert(v >= 0 && v <= 255);
    return v;
  });
}
/** @param {number[]} data @param {28|29} n @param {string} mapping */
const project = (data, n, mapping) => data.map((v) =>
  mapping === "mod" ? v % n : Math.floor(v * n / 256));
/** @param {number[]} c @param {number[]} k @param {number} sign */
const direct = (c, k, sign) => {
  assert.equal(c.length, k.length);
  return c.map((v, i) => mod(v + sign * k[i], 29));
};
/** @param {number[]} c @param {number[]} k @param {number} sign @param {string} order @param {boolean} iv */
function rank28(c, k, sign, order, iv) {
  assert.equal(c.length - Number(iv), k.length);
  return k.map((value, i) => {
    const pos = i + Number(iv), rune = c[pos];
    if (pos === 0) return mod(rune + sign * value, 29);
    const prev = c[pos - 1];
    if (rune === prev) return 28;
    const rank = order === "cyclic" ? mod(rune - prev - 1, 29) :
      rune - Number(rune > prev);
    return mod(rank + sign * value, 28);
  });
}
/** @param {number[]} p @param {number[]} k @param {number} sign @param {string} order @param {number|null} iv */
function emitRank28(p, k, sign, order, iv) {
  assert.equal(p.length, k.length);
  const result = [];
  let prev = iv;
  for (let i = 0; i < p.length; i++) {
    let rune;
    if (prev === null) rune = mod(p[i] - sign * k[i], 29);
    else if (p[i] === 28) rune = prev;
    else {
      const rank = mod(p[i] - sign * k[i], 28);
      rune = order === "cyclic" ? mod(prev + rank + 1, 29) :
        rank + Number(rank >= prev);
    }
    result.push(rune);
    prev = rune;
  }
  return result;
}
const native179 = Array.from({length:179}, (_, i) => solved[i % solved.length]);
const native75 = solved.slice(0, 75);
const directScores = [], rankScores = [], ascii = [];
for (const radix of [59, 60]) {
  const insideOriginal = sourceBytes(keyInner, radix);
  const outsideOriginal = sourceBytes(keyRim, radix);
  for (const reverse of [false, true]) {
    const inside = reverse ? insideOriginal.slice().reverse() : insideOriginal;
    const outside = reverse ? outsideOriginal.slice().reverse() : outsideOriginal;
    for (const projection of ["mod", "scaled"]) {
      for (const sign of [-1, 1]) {
        const k53 = project(inside, 29, projection);
        const k55 = project(outside, 29, projection);
        const d53 = direct(p53, k53, sign);
        const d55 = direct(p55.slice(1), k55, sign);
        assert.deepEqual(direct(d53, k53, -sign), p53);
        assert.deepEqual(direct(d55, k55, -sign), p55.slice(1));
        assert.deepEqual(direct(direct(native179, k53, -sign), k53, sign), native179);
        directScores.push({radix,reverse,projection,sign,p53_ioc:ioc(d53),p55_ioc:ioc(d55),
          p53_first50:d53.slice(0,50).map(v=>corpus.translit[v]).join(""),
          p55_first50:d55.slice(0,50).map(v=>corpus.translit[v]).join("")});
        const k28in = project(inside, 28, projection);
        const k28out = project(outside, 28, projection);
        for (const order of ["cyclic", "sorted"]) {
          const r53 = rank28(p53, k28in, sign, order, false);
          const r55 = rank28(p55, k28out, sign, order, true);
          assert.deepEqual(emitRank28(r53, k28in, sign, order, null), p53);
          assert.deepEqual(emitRank28(r55, k28out, sign, order, p55[0]), p55.slice(1));
          assert.deepEqual(rank28(emitRank28(native179, k28in, sign, order, null),
            k28in, sign, order, false), native179);
          const plant55 = [p55[0], ...emitRank28(native75, k28out, sign, order, p55[0])];
          assert.deepEqual(rank28(plant55, k28out, sign, order, true), native75);
          rankScores.push({radix,reverse,projection,sign,order,p53_ioc:ioc(r53),
            p55_ioc:ioc(r55),p53_first50:r53.slice(0,50).map(v=>corpus.translit[v]).join(""),
            p55_first50:r55.slice(0,50).map(v=>corpus.translit[v]).join("")});
        }
      }
    }
    for (const representation of ["ordinal", "prime"]) {
      const convert = (v) => representation === "prime" ? corpus.prime[v] : v;
      const result53 = inside.map((v,i) => v ^ convert(p53[i]));
      const result55 = outside.map((v,i) => v ^ convert(p55[i+1]));
      const alphaCount = (arr) => arr.filter(v => v>=65&&v<=90||v>=97&&v<=122).length;
      ascii.push({radix,reverse,representation,p53_alpha:alphaCount(result53),
        p55_alpha:alphaCount(result55),
        p53_printable:result53.filter(v=>v>=32&&v<=126||v===9||v===10||v===13).length,
        p55_printable:result55.filter(v=>v>=32&&v<=126||v===9||v===10||v===13).length});
    }
  }
}
// The original LP1 p05 image is itself an authored reversed-JPEG carrier with a 179-byte core.
const p05 = fs.readFileSync(path.join(root, "resources/liber-primus/05.jpg"));
assert.equal(p05.length, 673066);
const half = (p05.length - 360) / 2;
for (let i = 0; i < half; i++) assert.equal(p05[half + 360 + i], p05[half - i - 1]);
const asciiHex = p05.subarray(half,half+360).toString("ascii");
assert(asciiHex.startsWith("\n\n"));
assert(/^[0-9a-fA-F]{358}$/.test(asciiHex.slice(2)));
const old179 = [...Buffer.from(asciiHex.slice(2),"hex")];
assert.equal(old179.length,179);
assert.equal(crypto.createHash("sha256").update(Buffer.from(old179)).digest("hex"),
  "82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa");
const combined = [];
for (const radix of [59,60]) {
  const inner = sourceBytes(keyInner,radix);
  for (const reversal of ["neither","grid","p05","both"]) {
    const first = reversal === "grid" || reversal === "both" ? inner.slice().reverse() : inner;
    const second = reversal === "p05" || reversal === "both" ? old179.slice().reverse() : old179;
    const mixed = first.map((v,i)=>v^second[i]);
    for (const projection of ["mod","scaled"])
      for (const sign of [-1,1]) {
        const k=project(mixed,29,projection), d=direct(p53,k,sign);
        assert.deepEqual(direct(d,k,-sign),p53);
        combined.push({radix,reversal,projection,sign,ioc:ioc(d)});
      }
  }
}

/** @param {number} n */
function totient(n) {
  assert(n > 0);
  let res = n, t = n;
  for (let p=2; p*p<=t; p++) if(t%p===0) {
    res = res/p*(p-1);
    while(t%p===0) t/=p;
  }
  if(t>1) res=res/t*(t-1);
  return res;
}
/** @param {number[]} source @param {number[]} key @param {number} sign */
function transparentPaths(source,key,sign) {
  let states = new Map([[0,1]]);
  for(let i=0; i<source.length; i++) {
    const next = new Map();
    for(const [k,count] of states) {
      if(source[i]===0) next.set(k,(next.get(k)||0)+count);
      if(k<key.length && mod(source[i]+sign*key[k],29)!==0)
        next.set(k+1,(next.get(k+1)||0)+count);
    }
    if(next.size===0) return {complete:false,first_invalid:i,paths:0};
    states=next;
  }
  return {complete:true,paths:[...states.values()].reduce((a,b)=>a+b,0),consumed:[...states.keys()]};
}
/** @param {number[]} p @param {number[]} key @param {number} sign */
function encryptTransparent(p,key,sign) {
  let k=0;
  return p.map(v=>{
    if(v===0) return 0;
    assert(k<key.length);
    return mod(v-sign*key[k++],29);
  });
}
const totientScores=[];
for(const radix of [59,60]) {
  const innerPhi=sourceBytes(keyInner,radix).map(v=>totient(v)%29);
  const rimPhi=sourceBytes(keyRim,radix).map(v=>totient(v)%29);
  for(const reverse of [false,true]) {
    const a=reverse?innerPhi.slice().reverse():innerPhi;
    const b=reverse?rimPhi.slice().reverse():rimPhi;
    for(const sign of [-1,1]) {
      const d53=direct(p53,a,sign), d55=direct(p55.slice(1),b,sign);
      const legal53=transparentPaths(p53,a,sign);
      const legal55=transparentPaths(p55.slice(1),b,sign);
      assert.deepEqual(direct(d53,a,-sign),p53);
      assert.deepEqual(direct(d55,b,-sign),p55.slice(1));
      assert(transparentPaths(encryptTransparent(native179,a,sign),a,sign).complete);
      assert(transparentPaths(encryptTransparent(native75,b,sign),b,sign).complete);
      totientScores.push({radix,reverse,sign,p53_ioc:ioc(d53),p55_ioc:ioc(d55),
        p53_F_transparent:legal53,p55_F_transparent:legal55});
    }
  }
}
assert.equal(totientScores.length,8);
assert(totientScores.every(v=>!v.p53_F_transparent.complete));
assert.equal(totientScores.filter(v=>v.p55_F_transparent.complete).length,1);


const primes=[];
for(let n=2;primes.length<255;n++) if(primes.every(p=>n%p!==0||p*p>n)) primes.push(n);
assert.equal(primes.length,255);
assert.equal(primes[0],2);
assert.equal(primes[49],229);
const primeIndexedScores=[];
for(const radix of [59,60]) {
  // Two 00 entries are undefined as one-based prime ordinals, so skip them.
  const indexed = (positions) => sourceBytes(positions,radix).map(v=>{
    assert(v>0 && v<=255);
    return (primes[v-1]-1)%29;
  });
  const normalInside=indexed(keyInner), normalRim=indexed(keyRim);
  for(const reverse of [false,true]) {
    const a=reverse?normalInside.slice().reverse():normalInside;
    const b=reverse?normalRim.slice().reverse():normalRim;
    for(const sign of [-1,1]) {
      const d53=direct(p53,a,sign),d55=direct(p55.slice(1),b,sign);
      const legal53=transparentPaths(p53,a,sign),legal55=transparentPaths(p55.slice(1),b,sign);
      assert.deepEqual(direct(d53,a,-sign),p53);
      assert.deepEqual(direct(d55,b,-sign),p55.slice(1));
      assert(transparentPaths(encryptTransparent(native179,a,sign),a,sign).complete);
      assert(transparentPaths(encryptTransparent(native75,b,sign),b,sign).complete);
      primeIndexedScores.push({radix,reverse,sign,p53_ioc:ioc(d53),p55_ioc:ioc(d55),
        p53_F_transparent:legal53,p55_F_transparent:legal55});
    }
  }
}
assert.equal(primeIndexedScores.length,8);
assert(primeIndexedScores.every(v=>!v.p53_F_transparent.complete));
assert.equal(primeIndexedScores.filter(v=>v.p55_F_transparent.complete).length,3);

/** @param {{p53_ioc:number,p55_ioc:number}[]} result */
function extrema(result) {
  return {
    p53:[Math.min(...result.map(v=>v.p53_ioc)),Math.max(...result.map(v=>v.p53_ioc))],
    p55:[Math.min(...result.map(v=>v.p55_ioc)),Math.max(...result.map(v=>v.p55_ioc))]
  };
}
assert.equal(directScores.length,16);
assert.equal(rankScores.length,32);
assert.equal(ascii.length,8);
assert.equal(combined.length,32);
const summary = {
  totient_direct_range:extrema(totientScores), totient_Ftransparent:totientScores,
  prime_indexed_totient_range:extrema(primeIndexedScores), prime_indexed_Ftransparent:primeIndexedScores,
  source: {runes_p53:179,runes_p55:76,table:{rim:76,interior:180,zero_rim:192,zero_interior:229,
    rim_after_null:75,interior_after_null:179},old_hidden179_sha256:"82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa"},
  native_p57_ioc:ioc(solved),
  direct_range:extrema(directScores),rank28_range:extrema(rankScores),
  p05_mix_ioc_range:[Math.min(...combined.map(v=>v.ioc)),Math.max(...combined.map(v=>v.ioc))],
  best_direct:directScores.sort((a,b)=>b.p53_ioc+b.p55_ioc-a.p53_ioc-a.p55_ioc).slice(0,3),
  best_rank28:rankScores.sort((a,b)=>b.p53_ioc+b.p55_ioc-a.p53_ioc-a.p55_ioc).slice(0,3),
  ascii_xor:ascii,model_counts:{direct:16,rank28:32,p05_xor:32,ascii_xor:8,totient:8,prime_indexed_totient:8}
};
assert(summary.native_p57_ioc>0.05);
assert(summary.direct_range.p53[1]<0.04);
assert(summary.rank28_range.p53[1]<0.04);
assert(summary.p05_mix_ioc_range[1]<0.04);
console.log(JSON.stringify(summary,null,2));
