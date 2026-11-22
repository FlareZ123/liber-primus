"use strict";
/**
 * Agent 26 / Director #656: eight floral pages p41..48, first 270 runes,
 * and the source-anchored common positional additive-pad key-cancel invariant.
 * Node.js 22, CommonJS, read-only. Run: node sims/lp2_p41_48_floral_sharedpad_subset_sft.cjs
 * This is a finite language-control exclusion, not a historical decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page >= 41 && p.page <= 48);
const N = 270;
assert.deepEqual(pages.map(p => p.runic_count), [273, 272, 274, 273, 270, 270, 274, 271]);
const gp = new Map(corpus.translit.map((s, i) => [s, i]));
/** @param {string} text @returns {number[]} */
function toGP(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (gp.has(pair)) { out.push(gp.get(pair)); i += 2; }
      else if (gp.has(word[i])) { out.push(gp.get(word[i])); i++; }
      else { i++; }
    }
  }
  return out;
}
/** @param {number[][]} streams @returns {{equal:number,max:number,aligned:number,zeroRate:number,maxRate:number}} */
function agreement(streams) {
  assert.equal(streams.length, 8);
  let equal = 0, max = 0;
  for (let p = 0; p < 8; p++) for (let q = p + 1; q < 8; q++) {
    const counts = new Uint16Array(29);
    assert.equal(streams[p].length, N);
    assert.equal(streams[q].length, N);
    for (let i = 0; i < N; i++)
      counts[(streams[p][i] - streams[q][i] + 29) % 29]++;
    equal += counts[0];
    max += Math.max(...counts);
  }
  return {equal, max, aligned: 28*N, zeroRate: equal/(28*N), maxRate: max/(28*N)};
}
/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let state = seed;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/** @param {number[]} x @param {number} page @returns {number[]} */
function encrypt(x, page) {
  return x.map((v, i) => (v + (13*i*i+17*i+5)%29 + (page*13+3)%29)%29);
}
/** @param {number[]} x @param {number} page @returns {number[]} */
function decrypt(x, page) {
  return x.map((v, i) => (v - (13*i*i+17*i+5)%29 - (page*13+3)%29 + 58)%29);
}
/** @param {number} a @returns {number} */
function inverse29(a) {
  for (let b = 1; b < 29; b++) if ((a*b)%29 === 1) return b;
  throw new Error("Missing GF29 inverse");
}
/** @param {number[]} plain @returns {number[]} */
function permuteByColumn(plain) {
  return plain.map((x,i) => ((1+i%28)*x+(17*i+5)%29)%29);
}
/** @param {number[]} cipher @returns {number[]} */
function unpermuteByColumn(cipher) {
  return cipher.map((x,i) => inverse29(1+i%28)*(x-(17*i+5)%29+29)%29);
}
function main() {
  const original = agreement(pages.map(p => p.indices.slice(0, N)));
  assert.deepEqual([original.aligned,original.equal,original.max],[7560,303,453]);
  const sources = [
    ["Shakespeare","resources/control/shakespeare_first300k.txt",9876513,218800,0.050661375661375664,0.06256613756613756],
    ["Gibran","resources/control/gibran_prophet_58585.txt",12345678,63114,0.049867724867724866,0.06283068783068783],
    ["Emerson","resources/control/emerson_essays_2944.txt",98765432,324630,0.052116402116402116,0.06388888888888888]
  ];
  const controls = [];
  for (const [name, file, seed, expectedLength, expectedMinZero, expectedMinMax] of sources) {
    const native = toGP(read(file));
    assert.equal(native.length, expectedLength);
    const random = prng(seed);
    let minZero = 1, minMax = 1, meanZero = 0, meanMax = 0, lowerZero = 0, lowerMax = 0;
    for (let trial = 0; trial < 4000; trial++) {
      const tapes = pages.map(() => {
        const start = Math.floor(random() * (native.length-N));
        return native.slice(start,start+N);
      });
      const control = agreement(tapes);
      minZero = Math.min(minZero,control.zeroRate);
      minMax = Math.min(minMax,control.maxRate);
      meanZero += control.zeroRate;
      meanMax += control.maxRate;
      if (control.zeroRate <= original.zeroRate) lowerZero++;
      if (control.maxRate <= original.maxRate) lowerMax++;
    }
    assert.equal(minZero,expectedMinZero);
    assert.equal(minMax,expectedMinMax);
    assert.equal(lowerZero,0);
    assert.equal(lowerMax,0);
    controls.push({name,GPsymbols:native.length,trials:4000,minZero,minMax,
      meanZero:meanZero/4000,meanMax:meanMax/4000,lowerZero,lowerMax});
  }
  const native = toGP(read(sources[0][1]));
  const plants = pages.map((_,i)=>native.slice(190000+i*1000,190000+i*1000+N));
  const encrypted = plants.map((p,i)=>encrypt(p,i));
  encrypted.forEach((p,i)=>assert.deepEqual(decrypt(p,i),plants[i]));
  const oldScore = agreement(plants);
  const newScore = agreement(encrypted);
  const permuted = plants.map(permuteByColumn);
  permuted.forEach((c,i) => assert.deepEqual(unpermuteByColumn(c),plants[i]));
  const permutedScore = agreement(permuted);
  assert.equal(oldScore.equal,436);
  assert.equal(permutedScore.equal,oldScore.equal);
  assert.equal(oldScore.max, newScore.max);
  assert.ok(oldScore.maxRate > original.maxRate);
  return {scope:"p41..p48 original phase-zero first 270 GP29 runes each",
    original,controls,plant:{recoveredRuneCount:8*N,invariantPreserved:true,
      plaintextMaxRate:oldScore.maxRate,ciphertextMaxRate:newScore.maxRate},
    secretPositionwisePermutationPlant:{recoveredRuneCount:8*N,
      rawEqualitiesBefore:oldScore.equal,rawEqualitiesAfter:permutedScore.equal},
    conclusion:"specific reused positional GF29 additive pad excluded for three finite native-English controls; no unknown plaintext/key"};
}
if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports = {agreement,toGP,main};
