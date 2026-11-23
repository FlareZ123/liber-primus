"use strict";
/**
 * Exact original-input 2014 Stage10 first filename107 -> prime ordinal28 ->
 * p55 terminal echo on p27 rune offset28 -> next word AE.F prime sum103 ->
 * zero-based source table[103]=="3Q" -> candidate 70-rune p55 inverse.
 *
 * Two source-natural complete byte consumers: 70 consecutive row-major
 * byte values from cell103, or 70 pointer-successors from cell103.
 * Two signs; no phase/order/key tuning, 2 disjoint 35-rune receivers.
 * The known LP2 p56 F-bypass rule is checked for all possible mask choices.
 * No plaintext claim. Read-only CommonJS Windows11 Node22 standalone test:
 * node sims/lp2_stage10_prime28_p27sum103_p55_p50_source_inverses_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const b = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const t = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const old = read("resources/external/2014-stage10-post-square-response.html");
const names = [...old.matchAll(/src="\/(\d+)[.]jpg"/g)].map(m => Number(m[1]));
assert.deepEqual(names, [107,167,229]);
let primes = [];
for (let n = 2; n <= 229; n++) {
  if (primes.every(p => n % p !== 0)) primes.push(n);
}
assert.deepEqual(names.map(v => primes.indexOf(v)+1), [28,39,50]);
const p = n => b.pages.find(page => page.page === n).indices;
const moth = p(55), wing = p(27), c = moth.slice(0,70);
assert.equal(moth.length, 76);
assert.equal(moth.length-c.length, 6);
assert.deepEqual(moth.slice(-6), wing.slice(28,34));
assert.deepEqual(wing.slice(28,35), moth.slice(-6).concat(p(56)[0]));
assert.equal(55 - 27, 28);
assert.deepEqual(wing.slice(34,36),[25,0]);
assert.equal(b.prime[25]+b.prime[0],103);
assert.equal(t.bytes.length,256);
const tokens=t.pages.flatMap(page=>page.tokens);
assert.equal(tokens[103],"3Q");
assert.equal(t.bytes[103],206);
const old2013=read("resources/external/2013-tcp-server-signed-source.md");
assert.ok(old2013.includes("BASE29 3301 → 3QO"));
const sequential=t.bytes.slice(103,173);
assert.equal(sequential.length,70);
const pointer=[];
let cell=103;
for (let i=0;i<70;i++){const v=t.bytes[cell];pointer.push(v);cell=v;}
assert.deepEqual(pointer.slice(0,6),[206,127,193,155,112,73]);
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {number[]} xs */
function ioc(xs) {
  const h=Array(29).fill(0);
  xs.forEach(x=>h[x]++);
  return h.reduce((v,n)=>v+n*(n-1),0)/(xs.length*(xs.length-1));
}
const runeMap=new Map(b.runes.map((v,i)=>[v,i]));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const p57=solved.sections.find(x=>x.name==="p57_parable");
const positive=[...p57.source_text].filter(v=>runeMap.has(v))
  .map(v=>runeMap.get(v)).slice(0,70);
assert.equal(positive.length,70);
const Fpositions=c.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(Fpositions,[15,25,41]);
/** @param {number[]} key @param {number} sign @param {number} mask */
function strictFFailure(key,sign,mask) {
  let k=0;
  for(let i=0;i<c.length;i++){
    const fIndex=Fpositions.indexOf(i);
    if(fIndex!==-1&&(mask&(1<<fIndex))) continue;
    if(mod(c[i]+sign*key[k++])===0) return i;
  }
  return null;
}
const result=[];
for (const [name,key] of [["source-103-sequential",sequential],["source-103-pointer",pointer]]) {
  for (const sign of [-1,1]) {
    const deciphered=c.map((x,i)=>mod(x+sign*key[i]));
    assert.deepEqual(deciphered.map((v,i)=>mod(v-sign*key[i])),c);
    const plantCipher=positive.map((v,i)=>mod(v-sign*key[i]));
    assert.deepEqual(plantCipher.map((v,i)=>mod(v+sign*key[i])),positive);
    const bypassMasks=Array.from({length:8},(_,m)=>strictFFailure(key,sign,m));
    assert.ok(bypassMasks.every(x=>x!==null));
    result.push({mode:name,sign,
      first35IoC:ioc(deciphered.slice(0,35)),last35IoC:ioc(deciphered.slice(35)),
      full70IoC:ioc(deciphered),
      native70ControlIoC:ioc(positive),
      all8AuthenticFBypassContradictionPositions:bypassMasks,
      initial35:deciphered.slice(0,35).map(i=>b.translit[i]).join("."),
      terminal35:deciphered.slice(35).map(i=>b.translit[i]).join(".")});
  }
}
assert.ok(result.every(r=>r.first35IoC<0.055&&r.full70IoC<0.055));
console.log(JSON.stringify({
  sourcePath:"107.jpg 28th prime -> p55=>p27 at 28 -> next whole word AE.F sum103 -> p50[103]=3Q -> 70-rune original p55 prefix",
  historical2013SignedBase29:"3301=3QO",
  originalP55MothRunes:76,unmodifiedP55CipherConsumer:70,
  firstCell:"3Q",firstByte:206,
  exactNativePositiveControl:runeMap.size,
  firstPhysicalSourceTarget:"p27",
  allResults:result,
  significance:"All four fixed original inverses fail native language; all F-bypass masks contradict; a hypothetical other cipher or operation is not excluded."
},null,2));
console.log("PASS: historical first-name prime28 p55-p27 p50 zero-based103 source-fixed 70-rune inverse and p57 planted native positive");
