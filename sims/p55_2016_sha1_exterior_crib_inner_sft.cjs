"use strict";
/**
 * One frozen p55 SHA1-crib to interior-key transfer.
 * Source: signed 2016 canonical RSA/SHA1 digest, original p55 17 words,
 * solved p57 instruction "shed our own circumferences".
 * Run: node sims/p55_2016_sha1_exterior_crib_inner_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(lengths.reduce((a,b) => a+b, 0), 76);
const digest = "f065d7bfaa3963c313eec67bfe5496c491d0c26d";
// Recomputed against the actual source in the existing original signed-message SFT:
// sims/lp2_p32_signed2016_pgphash_source_sft.cjs
let n = BigInt("0x" + digest);
const known = [];
while (n > 0n) {
  known.unshift(Number(n % 29n));
  n /= 29n;
}
assert.equal(known.length, 33);
assert.deepEqual(known, [
  21,26,16,1,7,28,4,17,22,24,26,11,22,5,14,7,8,
  16,22,14,28,26,13,15,8,16,15,15,23,28,3,20,8
]);
const outside = [];
const inside = [];
let off = 0;
for (const size of lengths) {
  const word = p55.slice(off, off+size);
  assert.equal(word.length, size);
  off += size;
  if (size===1) {
    outside.push(word[0]);
  } else {
    outside.push(word[0],word.at(-1));
    inside.push(...word.slice(1,-1));
  }
}
assert.deepEqual([off, outside.length, inside.length], [76,33,43]);
const mod29 = (n) => (n % 29+29)%29;
const key = outside.map((v,i)=>mod29(v-known[i]));
const translit = (arr) => arr.map((i)=>corpus.translit[i]).join("");
assert.equal(translit(key), "FEALXISSIAOCRAEJEOIAEONGUEOIAMTHTHOWSWMLAIAYTH");
const entry = corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(text) {
  const normalized = text.replace(/^#.*$/gm," ").replace(/\[[^\]]*\]/g," ").toUpperCase();
  const out = [];
  for (let word of normalized.match(/[A-Z]+/g)||[]) {
    word = [...word].map((c)=>({K:"C",V:"U",Z:"S"}[c]||c)).join("");
    for (let i=0;i<word.length;) {
      const tok = entry.find((e)=>word.startsWith(e.s,i));
      if(tok){out.push(tok.i);i+=tok.s.length;}
      else i++;
    }
  }
  return out;
}
const lp1 = encode(read("resources/liber-primus/lp1-plaintext-reference.txt"));
assert(lp1.length>3000);
const trigrams = new Uint32Array(29**3);
for (let i=2;i<lp1.length;i++)trigrams[lp1[i-2]*841+lp1[i-1]*29+lp1[i]]++;
function score(values){
  let total=0;
  for(let i=2;i<values.length;i++) {
    total+=Math.log((trigrams[values[i-2]*841+values[i-1]*29+values[i]]+.05)/
      (lp1.length+.05*trigrams.length));
  }
  return total/(values.length-2);
}
const originalNativeMin = Math.min(...Array.from(
  {length:lp1.length-42},(_,i)=>score(lp1.slice(i,i+43))));
function decrypt(cipher,sign){
  return cipher.map((v,i)=>mod29(v+sign*key[i%33]));
}
function encrypt(plain,sign){
  return plain.map((v,i)=>mod29(v-sign*key[i%33]));
}
const planted = p57.slice(7,50);
assert.equal(planted.length,43);
const readings=[];
for(const sign of [-1,1]){
  const plain=decrypt(inside,sign);
  assert.deepEqual(encrypt(plain,sign),inside);
  assert.deepEqual(decrypt(encrypt(planted,sign),sign),planted);
  readings.push({sign,score:score(plain),text:translit(plain)});
}
// The original LP1 reference has accrued one more encoded rune since this SFT
// was first pinned. The absolute smoothed model denominator shifts all
// original and control log scores by the same constant. Preserve the
// original fixed evidence as score *differences* independent of that length.
assert(Math.abs((readings[0].score-originalNativeMin)
  -(-2.975987256659279))<1e-10);
assert(Math.abs((readings[1].score-originalNativeMin)
  -(-3.167214402593917))<1e-10);
assert(readings.every((r)=>r.score<originalNativeMin));
console.log(JSON.stringify({
  source:"p55 strict circumference exterior 33 and interior 43, historical signed-2016 SHA1",
  digest, base29Known:translit(known), exterior:translit(outside),
  derivedKey:translit(key), rawInteriorScore:score(inside), originalNativeMin,
  originalReadings:readings,
  positiveControl:"43/43 solved p57 GP plaintext recovered under both signs",
  conclusion:"No source-native readable original plaintext in this exact 33-digit SHA1 crib transfer"
},null,2));
