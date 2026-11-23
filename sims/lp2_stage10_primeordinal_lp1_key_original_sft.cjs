"use strict";
/**
 * Source-frozen 2014 Stage10 /107.jpg /167.jpg /229.jpg prime ordinal
 * landing hypothesis: 28,39,50. LP1 source page14 and page15 known GP29
 * plaintext as unchanged cyclic Vigenere key on LP2 original p28 and p39.
 * p50 has numeric cells and no rune ciphertext; no invented decoder for it.
 * This is a hypothesis, not an authenticated Cicada instruction.
 *
 * Windows11 Node22 read-only standalone:
 * node sims/lp2_stage10_primeordinal_lp1_key_original_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const html = read("resources/external/2014-stage10-post-square-response.html");
const matches = [...html.matchAll(/src="\/(\d+)\.jpg"/g)].map(x => Number(x[1]));
assert.deepEqual(matches, [107, 167, 229]);
/** @param {number} limit */
function primes(limit) {
  const sieve = Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let p = 2; p * p <= limit; p++) {
    if (sieve[p]) for (let q = p * p; q <= limit; q += p) sieve[q] = false;
  }
  return sieve.flatMap((v, i) => v ? [i] : []);
}
const primeList = primes(1000);
const primeOrdinals = matches.map(v => {
  const i = primeList.indexOf(v);
  assert.ok(i >= 0);
  return i + 1;
});
assert.deepEqual(primeOrdinals, [28, 39, 50]);
assert.deepEqual(primeOrdinals.slice(1).map((n,i) => n-primeOrdinals[i]), [11, 11]);

const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.deepEqual(solved.runes, book.runes);
const toIndex = new Map(book.runes.map((r,i) => [r,i]));
/** @param {string} s */
const encode = s => [...s].filter(ch => toIndex.has(ch)).map(ch => toIndex.get(ch));
const source = solved.sections.find(s => s.name === "jpg107-167");
const fullKey = encode(source.source_text);
assert.equal(fullKey.length, 319);
const originalTranscription = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const lp1Pages = originalTranscription.split("%");
const original14 = encode(lp1Pages[12]);
const original15 = encode(lp1Pages[13]);
assert.equal(original14.length, 226);
assert.equal(original15.length, 93);
const original16 = encode(lp1Pages[14]);
assert.equal(original16.length, 89);
const key14 = fullKey.slice(0, original14.length);
const key15 = fullKey.slice(original14.length);
assert.equal(key14.length, original14.length);
assert.equal(key15.length, original15.length);
const koan = encode(solved.sections.find(s=>s.name==="0_koan_1").source_text);
assert.equal(koan.length, 780);
const p50 = book.pages.find(p=>p.page===50);
assert.equal(p50.indices.length, 0);
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(grid.bytes.length, 256);
console.log("SOURCE_2014",matches,"prime_ordinals",primeOrdinals,
  "LP1 source rune counts",[key14.length,key15.length,original16.length],
  "LP2 source types",["runes","runes","256 numeric table"]);
/** @param {number[]} a */
const ioc=a=>{const h=Array(29).fill(0);a.forEach(x=>h[x]++);return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
/** @param {number[]} a @param {number} n */
const show=(a,n)=>a.slice(0,n).map(x=>book.translit[x]).join("");
/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function inv(cipher,key,sign) {
  return cipher.map((x,i)=>(x + sign*key[i%key.length]+29)%29);
}
for (const {target, key,sourceName} of [
  {target:28,key:key14,sourceName:"2014 107.jpg"},
  {target:39,key:key15,sourceName:"2014 167.jpg"}
]) {
  const page=book.pages.find(p=>p.page===target);
  const c=page.indices;
  const positive=koan.slice(target,target+c.length);
  assert.equal(positive.length,c.length);
  const planted=positive.map((x,i)=>(x+key[i%key.length])%29);
  assert.deepEqual(inv(planted,key,-1),positive);
  const realMinus=inv(c,key,-1),realPlus=inv(c,key,1);
  assert.deepEqual(realMinus.map((x,i)=>(x+key[i%key.length])%29),c);
  assert.deepEqual(realPlus.map((x,i)=>(x-key[i%key.length]+29)%29),c);
  const hold=c.length>260?200:160;
  for (const [label,start,end] of [["training",0,hold],["holdout",hold,c.length]]) {
    const minus=realMinus.slice(start,end),plus=realPlus.slice(start,end);
    const control=positive.slice(start,end);
    console.log("SOURCE_PAGE",sourceName,"target",target,label,
      "n",minus.length,"minus_ioc",ioc(minus).toFixed(8),
      "plus_ioc",ioc(plus).toFixed(8),
      "native_planted_ioc",ioc(control).toFixed(8));
    console.log("TEXT",target,label,show(minus,120));
  }
  console.log("TARGET",target,"whole_orig_ioc",ioc(c).toFixed(8),
    "whole_minus_ioc",ioc(realMinus).toFixed(8),
    "whole_plus_ioc",ioc(realPlus).toFixed(8));
}
console.log("PASS: verified first-party image numbers, fixed prime ordinals, LP1 exact source lengths, planted native key inverse, original source page replay");
