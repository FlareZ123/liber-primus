"use strict";
/**
 * Bounded source operand test: scan 72.jpg SHA512->big-endian BASE29 as
 * prospective GP29 key for all 76 intact p55 runes, preserving genuine F bypass.
 *
 * SOURCE STATUS: Original JPEG and p55 physical identity are direct facts.
 * The proposed p50 radix59 node72 is analyst inference; historical SHA512 and
 * BASE29 do NOT select "hash image JPEG as the prior page's key."
 * No arbitrary digest byte offset, phase, nonce, image edit, or key search.
 *
 * node sims/lp2_p55_scan72_sha512_base29_source_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p));
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const scan=read("resources/liber-primus/72.jpg");
const sha256=crypto.createHash("sha256").update(scan).digest("hex");
const hash=crypto.createHash("sha512").update(scan).digest("hex");
assert.equal(scan.length,614928);
assert.equal(sha256,"a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba");
assert.equal(hash,"8b7aa283c5e7c40903ceea260d7903bf67ad7d1814f93f7e3df2472c4a937686f64f96ae4ae4e9a8abcbe4c0ff41b585f59add76a2ec0dcb85ac3c7d25811535");
let bigint=BigInt("0x"+hash);
const digits=[];
while(bigint>0n) {digits.unshift(Number(bigint%29n));bigint/=29n;}
assert.equal(digits.length,106);
assert.deepEqual(digits.slice(0,12),[2,1,13,11,0,17,24,17,7,24,14,27]);
assert.equal(gp.pages[55].indices.length,76);
assert.equal(gp.pages[55].indices[0],21); // NG carries from p54.
const original=gp.pages[55].indices;
assert.deepEqual(original.flatMap((x,i)=>x===0?[i]:[]),[15,25,41]);
/** @param {number} n */
const mod=n=>((n%29)+29)%29;
/**
 * P=C+sign*K for nonzero plaintext; plaintext F prints as literal F and
 * consumes no key. Ciphertext F has two possible meanings.
 * @param {number[]} ciphertext @param {number} sign
 */
function decode(ciphertext,sign) {
  let pool=[{text:[],clock:0,skips:[]}];
  for(let i=0;i<ciphertext.length;i++) {
    const next=[];
    for(const s of pool) {
      const letter=mod(ciphertext[i]+sign*digits[s.clock]);
      if(letter!==0)next.push({text:[...s.text,letter],clock:s.clock+1,skips:s.skips});
      if(ciphertext[i]===0)next.push({text:[...s.text,0],clock:s.clock,skips:[...s.skips,i]});
    }
    pool=next;
    if(!pool.length)return {pool,failAt:i};
  }
  return {pool,failAt:null};
}
/**
 * @param {number[]} plain @param {number} sign
 */
function encrypt(plain,sign) {
  let clock=0;
  return plain.map(p=>p===0?0:mod(p-sign*digits[clock++]));
}
/** @param {number[]} values */
function ioc(values) {
  const f=Array(29).fill(0);
  for(const v of values)f[v]++;
  return f.reduce((a,n)=>a+n*(n-1),0)/(values.length*(values.length-1));
}
const literal=v=>v.map(x=>gp.translit[x]).join("");
const positive=gp.pages[57].indices.slice(0,76);
assert.equal(positive.length,76);
for(const sign of [-1,1]) {
  const plant=encrypt(positive,sign);
  const recovered=decode(plant,sign);
  assert(recovered.pool.some(s=>s.text.every((v,i)=>v===positive[i])),
     "source-native p57 positive must be recovered under genuine F bypass");
  const tested=decode(original,sign);
  for(const survivor of tested.pool) {
    assert.deepEqual(encrypt(survivor.text,sign),original);
  }
  console.log(JSON.stringify({
    operation:"JPEG72 SHA512 BASE29 p55 original",
    sign,sourceJpegSHA256:sha256,numberOfDigits:digits.length,
    originalFPositions:[15,25,41],validWhole76Paths:tested.pool.length,
    failAt:tested.failAt,
    survivors:tested.pool.map(s=>({skips:s.skips,IoC:ioc(s.text),
      text:literal(s.text)})),
    originalReencode:tested.pool.length?"76/76":"algebraically impossible",
    solvedP57Plant:"76/76",
  }));
}
console.log("PASS: source-image key branch fully specified, with genuine solved-page planted control.");
