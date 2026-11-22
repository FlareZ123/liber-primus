"use strict";

/**
 * Source-visible 16-term Fibonacci-prime spiral against the 16 physical pages
 * carrying the repeated floral frame (LP2 pp40-55).
 *
 * Test one exact, clue-constrained cipher consumer: the independently solved
 * p56 prime-totient subtraction, restarted at prime ordinal F_n+1 on each
 * corresponding physical page. The runeless numerical page p50 retains its
 * original eleventh position and consumes no ciphertext.
 *
 * Run: node sims/p15_fibonacci_16floral_page_phi_sft.cjs
 * This is an original-cipher negative, not a recovered LP2 key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const printedSpiral = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
];
const primes = [];
for (let n=2; primes.length<1400; n++) {
  let prime = true;
  for (let d=2; d*d<=n; d++) if (n%d===0) {prime=false;break;}
  if (prime) primes.push(n);
}
assert.deepEqual(fib.map(f=>Math.abs(3301-primes[f])), printedSpiral);
const pages = Array.from({length:16}, (_,i)=> {
  const p = gp.pages.find(p=>p.page===i+40);
  assert.ok(p);
  return p;
});
assert.deepEqual(pages.map(p=>p.indices.length),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]);
const mod = n=>(n%29+29)%29;
/**
 * @param {number[]} input Original GP29 indices
 * @param {number} start Zero-based index of initial prime
 * @param {-1|1} sign
 * @returns {number[]}
 */
function translate(input, start, sign) {
  return input.map((value,j)=>mod(value+sign*(primes[start+j]-1)));
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const f=Array(29).fill(0);
  for (const value of input) f[value]++;
  const n=input.length;
  return f.reduce((sum,x)=>sum+x*(x-1),0)/(n*(n-1));
}
const solved56 = gp.pages.find(p=>p.page===56).indices;
assert.equal(translate(solved56.slice(0,5),0,-1)
  .map(i=>gp.translit[i]).join(""),"ANEND");

const original = pages.flatMap(p=>p.indices);
const naturalOrder = fib.map((_,i)=>i);
/**
 * @param {number[]} assignment
 * @returns {number[]}
 */
function decodeAssignment(assignment) {
  return pages.flatMap((p,i)=>translate(p.indices,fib[assignment[i]],-1));
}
const decoded = decodeAssignment(naturalOrder);
for (let i=0; i<16; i++) {
  const back = translate(translate(pages[i].indices,fib[i],-1),fib[i],1);
  assert.deepEqual(back,pages[i].indices);
}
const originalIoc = ioc(original);
const decodedIoc = ioc(decoded);
assert.equal(original.length,3316);
assert.ok(Math.abs(originalIoc-0.03446282660786315)<1e-13);
assert.ok(Math.abs(decodedIoc-0.034540697600372615)<1e-13);

let seed=0x3311;
/** @returns {number} */
function random() {
  seed ^= seed<<13;
  seed ^= seed>>>17;
  seed ^= seed<<5;
  return seed>>>0;
}
let lower=0, upper=0;
const trials=10000;
for (let t=0; t<trials; t++) {
  const order=naturalOrder.slice();
  for (let i=order.length-1; i>0; i--) {
    const j=random()%(i+1);
    [order[i],order[j]]=[order[j],order[i]];
  }
  const other=ioc(decodeAssignment(order));
  if (other<=decodedIoc) lower++;
  if (other>=decodedIoc) upper++;
}
assert.equal(lower,7672);
assert.equal(upper,2332);
const p40=translate(pages[0].indices,fib[0],-1);
const summary = {
  result:"DIRECT FIBONACCI PAGE-START PRIME-TOTIENT INVERSE: NO PLAINTEXT",
  originalSource:"LP2 page15 4x4 spiral; physical pp40-55 shared floral border",
  testedFamily:"One Fibonacci prime start per physical page, p56 phi(prime) subtraction",
  originalRunes:original.length,
  physicalPages:pages.length,
  runeFreePage:50,
  originalIoc,
  decodedIoc,
  firstDecryptedGP:decoded.slice(0,100).map(i=>gp.translit[i]).join(""),
  p40DecodedFirstWord:p40.slice(0,12).map(i=>gp.translit[i]).join(""),
  permutationTrials:trials,
  lower,
  upper,
  upperTailP:(upper+1)/(trials+1),
  plantedForwardReplay:"all 3316 original runes reproduced exactly",
  conclusion:"The 16-to-16 visual match does not select this prime-totient decoder."
};
console.log(JSON.stringify(summary,null,2));
