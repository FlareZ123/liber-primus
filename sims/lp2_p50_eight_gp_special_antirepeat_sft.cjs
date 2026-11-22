"use strict";
/**
 * Source-keyed eight-exception GP29 predecessor-rank inverse.
 *
 * Hypothesis: the original 32x8 printed byte grid selects eight low-frequency
 * original GP rune classes (literal F plus seven two-letter transliterations),
 * via low three bits; the 5 remaining source bits permute the other 28
 * ciphertext successors. This is one complete, reversible, human-readable
 * candidate that uses the original source instead of 28-secret sweeps.
 *
 * GP29 native English, word/page clocks and the real 256-byte table are
 * held fixed. Outcomes on original ciphertext cannot establish authentic
 * authorship without an independent historical instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root,name),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const numeric = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = numeric.bytes;
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((g,i)=>[g,i]));
const words = (text.match(runePattern) || []).map(w =>
  Array.from(w,g=>glyphIndex.get(g)));
assert.equal(bytes.length,256);
assert.deepEqual(bytes.slice(0,8),[203,231,167,186,97,237,126,183]);
assert.equal(original.length,12956);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),original);
const pageAt = new Uint8Array(original.length);
let offset = 0;
for(const page of pages) {
  pageAt.fill(page.page,offset,offset+page.indices.length);
  offset+=page.indices.length;
}
// The source GP inventory has exactly seven romanized two-letter runes.
// F (the authentic solved-p56 null-interrupt rune) is the eighth class.
const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((s,i)=>s.length===2?i:-1).filter(i=>i>=0)
];
assert.deepEqual(special,[0,2,12,21,22,25,27,28]);
const mod=(a,n)=>(a%n+n)%n;
/**
 * @param {number[]} plain Original alphabet rune indices.
 * @returns {number[]} Ciphertext indices, page-aware, full length.
 */
function encrypt(plain) {
  assert.equal(plain.length,original.length);
  const out=new Array(plain.length);
  for(let i=0;i<plain.length;i++){
    const byte=bytes[i%256];
    if(i===0||pageAt[i]!==pageAt[i-1]) {
      out[i]=mod(plain[i]+byte,29);
      continue;
    }
    const r=special[byte&7];
    const rank=plain[i]-Number(plain[i]>r);
    const delta=plain[i]===r ? 0 : 1+mod(rank+(byte>>>3),28);
    out[i]=mod(out[i-1]+delta,29);
  }
  return out;
}
/**
 * @param {number[]} cipher Original alphabet rune indices.
 * @returns {number[]} Exact original plaintext, including special runes.
 */
function decrypt(cipher) {
  assert.equal(cipher.length,original.length);
  const out=new Array(cipher.length);
  for(let i=0;i<cipher.length;i++){
    const byte=bytes[i%256];
    if(i===0||pageAt[i]!==pageAt[i-1]) {
      out[i]=mod(cipher[i]-byte,29);
      continue;
    }
    const r=special[byte&7];
    const delta=mod(cipher[i]-cipher[i-1],29);
    if(delta===0) out[i]=r;
    else {
      const rank=mod(delta-1-(byte>>>3),28);
      out[i]=rank+Number(rank>=r);
    }
  }
  return out;
}
function counts(arr) {
  let equal=0;
  for(let i=1;i<arr.length;i++)
    if(pageAt[i]===pageAt[i-1]&&arr[i]===arr[i-1])equal++;
  let sum=0,j=0,eq5=0,n5=0;
  for(const word of words){
    for(let k=5;k<word.length;k++){
      n5++;if(arr[sum+k]===arr[sum+k-5])eq5++;
    }
    sum+=word.length;
  }
  assert.equal(sum,arr.length);
  assert.equal(n5,2105);
  const hist=Array(29).fill(0);
  for(const v of arr)hist[v]++;
  const ioc=hist.reduce((s,v)=>s+v*(v-1),0)/(arr.length*(arr.length-1));
  return {equal,lag5:eq5,lag5Pairs:n5,ioc};
}
function xorshift32(seed) {
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;};
}
function nativePools(file){
  const pools=new Map();
  const raw=read(file);
  for(const w of raw.match(/[A-Za-z]+/g)||[]){
    const encoded=encodeSourceNativeGP(w);
    if(!pools.has(encoded.length))pools.set(encoded.length,[]);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}
const sourceStats=counts(original);
assert.equal(sourceStats.equal,86);
assert.equal(sourceStats.lag5,104);
const deciphered=decrypt(original);
assert.deepEqual(encrypt(deciphered),original);
const originalInverse=counts(deciphered);
const originalPrefix=deciphered.slice(0,120).map(i=>corpus.translit[i]).join("-");
const random=xorshift32(0x33015635);
const trials=48;
const synthetic=[];
for(const [name,file] of [
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
]) {
  const pools=nativePools(file);
  const observed=[];
  for(let trial=0;trial<trials;trial++){
    const gp=words.flatMap(w=>{
      const opts=pools.get(w.length);
      assert(opts?.length, "Missing source-matched word length "+w.length);
      return opts[Math.floor(random()*opts.length)];
    });
    const cipher=encrypt(gp);
    assert.deepEqual(decrypt(cipher),gp,"Complete native GP word-sized positive");
    observed.push({plain:counts(gp),cipher:counts(cipher)});
  }
  const stats=metric=>{
    const values=observed.map(x=>x.cipher[metric]);
    const mean=values.reduce((a,b)=>a+b,0)/values.length;
    return {mean,min:Math.min(...values),max:Math.max(...values),
      original:sourceStats[metric]};
  };
  synthetic.push({
    name, trials, ciphertextEqual:stats("equal"),
    ciphertextLag5:stats("lag5"),
    averageNativePlainIoC:observed.reduce((s,x)=>s+x.plain.ioc,0)/trials,
    averageCipherIoC:observed.reduce((s,x)=>s+x.cipher.ioc,0)/trials
  });
}
console.log(JSON.stringify({
  hypothesis:"Literal F plus 7 multiletter GP runes, byte-low3 marker, byte-high5 28-successor rank offset",
  pages:pages.length, printedWords:words.length,
  sourceByteCells:bytes.length, symbolCount:original.length,
  nativeSource:sourceStats, originalInverse,
  originalInversePrefix:originalPrefix,
  originalExactForwardReencryption:true,
  synthetic
},null,2));
