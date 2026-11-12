#!/usr/bin/env node
"use strict";
/**
 * Archived 2014 Stage04 reversed-rune lookup, with each original LP2 red
 * heading as its following body key. Unlike an ordinary additive GP29
 * Vigenere, Stage04's actual output is (28 - cipher + key) modulo 29.
 *
 * Source: original LP2 red-ink annotations, original GP corpus;
 * historical decoder independently frozen in
 * sims/stage04_small_image_vigenere_repro.cjs.
 *
 * Node.js 22, CJS, dependency-free original-input SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const C = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const mod = n => (n % 29 + 29) % 29;

/** Source-exact reflected mapping for historical GP-tokenized rune keys.
 * @param {number[]} cipher @param {number[]} key @returns {number[]}
 */
function transform(cipher, key) {
  assert.ok(key.length > 0);
  return cipher.map((c, i) => mod(28 - c + key[i % key.length]));
}

const keyFromSource2014 = [
  7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18
];
assert.equal(keyFromSource2014.length, 18);
const originalOnion = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ";
let runeClock = 0;
const onionDecoded = [...originalOnion].map(symbol => {
  const c = C.runes.indexOf(symbol);
  if (c < 0) return symbol;
  const next = transform([c],[keyFromSource2014[runeClock++]]);
  return C.translit[next[0]];
}).join("");
assert.equal(runeClock, 18);
assert.equal(onionDecoded, "AUOWYFGL5LCSFJ3NONION");

const positions = [
  [0,0,13],[3,0,16],[8,0,12],[15,9,11],[23,0,16],
  [27,0,19],[33,0,10],[33,91,8],[40,0,8]
];
const byPage = new Map(C.pages.map(p => [p.page,p]));
const byInk = new Map(ink.pages.map(p => [p.page,p]));
const bases = new Map(), ciphertext = [];
for (let page = 0; page < 56; page++) {
  const p = byPage.get(page);
  assert.ok(p);
  bases.set(page,ciphertext.length);
  ciphertext.push(...p.indices);
}
assert.equal(ciphertext.length,12956);
assert.equal(byPage.get(50).indices.length,0);
const groups = positions.map(([page,offset,count],i) => {
  const source = byPage.get(page);
  const annotation = byInk.get(page).red_spans.find(
    span => span.start === offset && span.length === count);
  assert.ok(annotation);
  const key = source.indices.slice(offset,offset+count);
  assert.equal(key.length,count);
  assert.equal(key.map(x=>C.runes[x]).join(""),annotation.runes);
  const start = bases.get(page)+offset+count;
  const end = i+1<positions.length
    ? bases.get(positions[i+1][0])+positions[i+1][1]
    : ciphertext.length;
  return {page,offset,key,body:ciphertext.slice(start,end)};
});
assert.deepEqual(groups.map(x=>x.body.length),
  [716,1129,1726,1883,1005,1414,81,1581,3308]);
assert.equal(groups.reduce((a,s)=>a+s.body.length,0),12843);

// Author-native reference, entirely separate from unknown LP2.
const tokens=C.translit.map((token,i)=>({token,i}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text */
function encode(text) {
  const out=[];
  for (const word of text.toUpperCase().replace(/V/g,"U")
    .replace(/K/g,"C").replace(/[^A-Z ]/g," ").split(/\s+/u)) {
    for (let i=0;i<word.length;) {
      const token=tokens.find(t=>word.startsWith(t.token,i));
      if (token) {out.push(token.i);i+=token.token.length;}
      else i++;
    }
  }
  return out;
}
const native=encode(lp1.replace(/^#.*$/gm,""));
assert.ok(native.length>3000);
const bi=new Map(),tri=new Map();
for(let i=2;i<native.length;i++) {
  const b=29*native[i-2]+native[i-1];
  bi.set(b,(bi.get(b)||0)+1);
  const t=29*b+native[i];
  tri.set(t,(tri.get(t)||0)+1);
}
/** @param {number[]} a */
function score(a) {
  assert.ok(a.length>=3);
  let total=0;
  for(let i=2;i<a.length;i++) {
    const b=29*a[i-2]+a[i-1];
    total+=Math.log(((tri.get(29*b+a[i])||0)+1)/
      ((bi.get(b)||0)+29));
  }
  return total/(a.length-2);
}
const outputs=groups.map(group=>{
  const p=transform(group.body,group.key);
  assert.deepEqual(transform(p,group.key),group.body);
  // Full-length planted GP-native inverse using the same complete original
  // section size and original key, without knowing any candidate plaintext.
  const planted=Array.from({length:group.body.length},
    (_,i)=>native[i%native.length]);
  assert.deepEqual(transform(transform(planted,group.key),group.key),planted);
  return {page:group.page,headingOffset:group.offset,
    titleLength:group.key.length,bodyRunes:group.body.length,
    rawScore:score(group.body),decodedScore:score(p),
    preview:p.slice(0,42).map(x=>C.translit[x]).join("")};
});
/** @param {"rawScore"|"decodedScore"} k */
const weighted=k=>outputs.reduce((a,x)=>a+x.bodyRunes*x[k],0)/
  outputs.reduce((a,x)=>a+x.bodyRunes,0);
const result={
  status:"PASS",
  sourceExactHistorical2014Onion:onionDecoded,
  nativeReferenceScore:score(native),
  totalRedKeyRunes:113,
  totalBodies:12843,
  originalCiphertextScore:weighted("rawScore"),
  originalReflectedTitleKeyScore:weighted("decodedScore"),
  exactOriginalRoundtrips:12843,
  exactPlantedNativeRoundtrips:12843,
  credibleUnknownPlaintext:false,
  outputs
};
assert.ok(result.originalReflectedTitleKeyScore < -3.35);
assert.ok(result.originalCiphertextScore < -3.35);
console.log(JSON.stringify(result,null,2));
