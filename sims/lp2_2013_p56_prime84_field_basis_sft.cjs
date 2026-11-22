"use strict";

/**
 * Source-frozen 2013 BASE29 field / solved-LP2 p56 final-prime selector.
 * Run: node sims/lp2_2013_p56_prime84_field_basis_sft.cjs
 * This is a finite direct-register test, not a recovered LP2 decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const native = read("resources/control/latin-vulgate-heldout-gp.json").runes;
const mod = n => (n % 29 + 29) % 29;

/** @param {number} n @returns {number[]} */
function primes(n) {
  const arr = [];
  for (let x=2; arr.length<n; x++) {
    let ok = true;
    for (let d=2; d*d<=x; d++) if (x%d===0) { ok=false; break; }
    if (ok) arr.push(x);
  }
  return arr;
}

/** Field F29[u], where the original p3 red triad says u^2=3u+8.
 * @param {[number,number]} a @param {[number,number]} b
 * @returns {[number,number]} */
function mul(a,b) {
  return [mod(a[0]*b[0]+8*a[1]*b[1]),
    mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
}
/** @param {[number,number]} a @param {number} n
 * @returns {[number,number]} */
function power(a,n) {
  let out = /** @type {[number,number]} */ ([1,0]);
  while(n>0) { if(n%2) out=mul(out,a); a=mul(a,a); n=Math.floor(n/2); }
  return out;
}
/** @param {[number,number]} a @param {[number,number]} b
 * @returns {[number,number]} */
const add=(a,b)=>[mod(a[0]+b[0]),mod(a[1]+b[1])];
/** @param {[number,number]} a @param {number} k
 * @returns {[number,number]} */
const scale=(a,k)=>[mod(a[0]*k),mod(a[1]*k)];
/** @param {number[]} arr @param {"toH"|"toU"} direction */
function basis(arr,direction) {
  const out=arr.slice();
  for(let i=0;i+1<out.length;i+=2) {
    const a=arr[i],b=arr[i+1];
    // z=u^433=23-2u: a+bu=(a+26b)+(14b)z.
    if(direction==="toH") { out[i]=mod(a+26*b); out[i+1]=mod(14*b); }
    else { out[i]=mod(a+23*b); out[i+1]=mod(-2*b); }
  }
  return out;
}
/** @param {number[]} arr */
function ioc(arr) {
  const counts=Array(29).fill(0);
  for(const x of arr) counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(arr.length*(arr.length-1));
}
function main() {
  for(const [page,expected] of [[3,[13,23,2]],[39,[27,5,15]]]) {
    const p=corpus.pages.find(x=>x.page===page);
    const red=ink.pages.find(x=>x.page===page).red_spans;
    assert.ok(red.some(x=>x.start===119&&x.length===3));
    assert.deepEqual(p.indices.slice(119,122),expected);
  }
  const page56=corpus.pages.find(p=>p.page===56);
  assert.equal(page56.indices.length,85);
  assert.equal(page56.indices[56],0);
  // The authentically solved p56 decoder consumes no prime for this lone literal-F.
  const consumed=page56.indices.length-1;
  assert.equal(consumed,84);
  const lastPrime=primes(consumed)[consumed-1];
  assert.equal(lastPrime,433);
  const u=/** @type {[number,number]} */([0,1]);
  assert.deepEqual(power(u,840),[1,0]);
  const z=power(u,lastPrime);
  assert.deepEqual(z,[23,27]);
  assert.deepEqual(add(add([3,0],scale(z,26)),scale(mul(z,z),24)),[0,0]);
  assert.deepEqual(power(u,797),[17,2]);
  assert.deepEqual(power(z,29),[17,2]);
  assert.equal(mod(lastPrime),27); // p39 constant and -2013 toy DH shared key 2

  const unknown=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert.equal(unknown.length,12956);
  const toH=basis(unknown,"toH"),toU=basis(unknown,"toU");
  assert.deepEqual(basis(toH,"toU"),unknown);
  assert.deepEqual(basis(toU,"toH"),unknown);
  const nativeSlice=native.slice(0,Math.min(native.length,unknown.length));
  assert.ok(nativeSlice.length>=2000);
  assert.deepEqual(basis(basis(nativeSlice,"toU"),"toH"),nativeSlice);
  const scores={raw:ioc(unknown),toH:ioc(toH),toU:ioc(toU),
    independentNativeGP:ioc(nativeSlice)};
  assert.ok(scores.toH<0.036 && scores.toU<0.036);
  assert.ok(scores.independentNativeGP>0.055);
  console.log(JSON.stringify({
    source:"LP2 original p3/p39 red triads; solved p56 prime-totient counter; 2013 BASE29 3301",
    solvedPageCipherRunes:85,solvedPageLiteralNonconsumingF:1,
    consumedPrimeKeys:consumed,lastConsumedPrime:lastPrime,
    rootOf2013Base29Quadratic:z,conjugateRoot:power(z,29),
    originalUnsolvedRuneCount:unknown.length,
    fieldBasis:"a+bu = (a+26b)+(14b)z over F29; z=23-2u",
    exactRoundtrip:true,IoC:scores,
    conclusion:"The p56 final-prime index independently picks one H root, but this direct fixed pairwise coordinate change reveals no original plaintext."
  },null,2));
}
if(require.main===module) main();
module.exports={main,mul,power,basis,ioc};
