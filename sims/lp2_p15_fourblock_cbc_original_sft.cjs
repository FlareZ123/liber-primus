"use strict";

/**
 * Source-visible LP2 p15 matrix in a lossless four-rune CBC cipher.
 *
 * This tests the distinct chaining architecture left open by the direct
 * Hill-block collision gate: P_i = A*C_i - C_(i-1) or
 * P_i = A*(C_i - C_(i-1)) over GF(29). A is the literal p15 matrix,
 * its inverse, transpose, or inverse transpose, with zero initial IV.
 *
 * Original target: physical pp16-22, the immediately following 1,744
 * runes, exactly 436 complete four-rune blocks. No phase or crib fit.
 * All eight candidate inverses have an explicit native-GP positive plant.
 *
 * SFT on Windows 11 / Node.js 22:
 *   node sims/lp2_p15_fourblock_cbc_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const target = gp.pages.filter(p => p.page >= 16 && p.page <= 22)
  .flatMap(p => p.indices);
assert.equal(target.length, 1744);

const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
].map(row => row.map(x => x % 29));
const Minv = [
  [19, 1, 6, 3],
  [11, 7, 8, 22],
  [2, 10, 15, 28],
  [25, 4, 1, 15]
];
const mod = v => (v % 29 + 29) % 29;
/** @param {number[][]} m @returns {number[][]} */
const transpose = m => m[0].map((_, j) => m.map(row => row[j]));
/** @param {number[][]} a @param {number[]} v @returns {number[]} */
const multiply = (a, v) => a.map(row =>
  mod(row.reduce((sum, x, j) => sum + x * v[j], 0)));
for (const [A,B] of [[M,Minv],[Minv,M]]) {
  for (let i = 0; i < 4; i++) {
    const got = multiply(A, B.map(row => row[i]));
    assert.deepEqual(got, [0,1,2,3].map(j => +(j === i)));
  }
}

/**
 * The two exact invertible CBC orderings:
 * 0: P_i = D*C_i - C_(i-1)
 * 1: P_i = D*(C_i - C_(i-1)).
 * @param {number[]} symbols @param {number[][]} D
 * @param {number[][]} inverseD @param {0|1} mode
 * @param {boolean} encrypt
 */
function transform(symbols, D, inverseD, mode, encrypt) {
  assert.equal(symbols.length % 4, 0);
  const out = [];
  let previous = [0,0,0,0];
  for (let i = 0; i < symbols.length; i += 4) {
    const current = symbols.slice(i, i + 4);
    let result;
    if (encrypt) {
      result = mode === 0
        ? multiply(inverseD, current.map((x,j) => mod(x+previous[j])))
        : multiply(inverseD, current).map((x,j) => mod(x+previous[j]));
      previous = result;
    } else {
      result = mode === 0
        ? multiply(D, current).map((x,j) => mod(x-previous[j]))
        : multiply(D, current.map((x,j) => mod(x-previous[j])));
      previous = current;
    }
    out.push(...result);
  }
  return out;
}

/** @param {number[]} s */
function ioc(s) {
  const count = new Uint32Array(29);
  for (const x of s) count[x]++;
  return count.reduce((sum,n) => sum+n*(n-1), 0)/(s.length*(s.length-1));
}
const tokens = gp.translit.map((label,i) => ({label,i}))
  .sort((a,b) => b.label.length-a.label.length);
/** Source-native GP spellings, preserving single-rune ING and IO. */
function nativeGp(text) {
  const out=[];
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let pos=0; pos<word.length;) {
      if (word.startsWith("ING", pos)) {out.push(21); pos+=3; continue;}
      if (word.startsWith("IO", pos)) {out.push(27); pos+=2; continue;}
      const t=tokens.find(v => word.startsWith(v.label,pos));
      assert.ok(t, "Unencodable GP word "+word+" at "+pos);
      out.push(t.i);
      pos+=t.label.length;
    }
  }
  return out;
}

const controls = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
].map(filename => ({filename, values:nativeGp(read(filename))}));
const sourceMin = Math.min(...controls.flatMap(c => {
  const out=[];
  for (let at=0;at+target.length<=c.values.length;at+=target.length/2)
    out.push(ioc(c.values.slice(at,at+target.length)));
  return out;
}));
assert.ok(sourceMin>0.05, "Native-English windows must be calibrated");

const plant=controls[0].values.slice(0,target.length);
const candidates=[];
for (const [name,D,invD] of [
  ["matrix",M,Minv],
  ["inverse",Minv,M],
  ["transpose",transpose(M),transpose(Minv)],
  ["inverse-transpose",transpose(Minv),transpose(M)]
]) for (const mode of [0,1]) {
  const plantedCipher = transform(plant,D,invD,mode,true);
  assert.deepEqual(transform(plantedCipher,D,invD,mode,false),plant,
    "Original 1,744-rune native-GP CBC positive plant");
  const plaintext = transform(target,D,invD,mode,false);
  assert.deepEqual(transform(plaintext,D,invD,mode,true),target);
  const value=ioc(plaintext);
  candidates.push({matrix:name,mode,decodedIoC:value,
    first20GpSymbols:plaintext.slice(0,20).map(x=>gp.translit[x]).join("-")});
}
assert.equal(candidates.length,8);
const max = Math.max(...candidates.map(v=>v.decodedIoC));
assert.ok(max<sourceMin, "All original candidates remain below pinned GP English controls");
console.log(JSON.stringify({
  originalPages:"16-22", originalRunes:1744, originalIoC:ioc(target),
  nativeEnglishMatchedWindowMin:sourceMin,
  maxOriginalCBCIoC:max, positivePlant:"8/8 exact 1744-symbol recoveries",
  candidates
},null,2));
