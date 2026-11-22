"use strict";

/**
 * Source-locked GF(257) spectral bridge: original p0 FFF primes, p23 rune
 * count, p50 32x8 base60 bytes, p55 border-sized ciphertext, and p56.
 * Exact identities are source observations, not authenticated decipherment.
 *
 * SFT: node sims/lp2_gf257_spectral_border_source_sft.cjs
 * Windows 11 / Node 22 / CommonJS / read-only / no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const page = p => gp.pages.find(v => v.page === p);
const mod29 = n => (n % 29 + 29) % 29;
const MOD = 257;

/** @param {number} base @param {number} exp @returns {number} */
function power(base, exp) {
  let value = 1;
  for (let i = 0; i < exp; i++) value = value * base % MOD;
  return value;
}

/** Polynomial coefficients are in original printed, high-first order.
 * @param {number[]} values @param {number} x @returns {number} */
function evaluate(values, x) {
  let sum = 0;
  for (const v of values) sum = (sum * x + v) % MOD;
  return sum;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply29(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod29(out[i + j] + a[i] * b[j]);
  return out;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const hist = Array(29).fill(0);
  for (const v of a) hist[v]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** Ascending-coefficient forward 256-point finite Fourier transform.
 * @param {number[]} input @param {number} g @returns {number[]} */
function transform(input, g) {
  return Array.from({length:256}, (_, k) => {
    const step = power(g, k);
    let phase = 1, sum = 0;
    for (const value of input) {
      sum = (sum + value * phase) % MOD;
      phase = phase * step % MOD;
    }
    return sum;
  });
}

/** Descending source polynomial division by x-root over GF(257);
 * remainder must vanish for this to be a factor.
 * @param {number[]} input @param {number} root @returns {number[]} */
function divideLinear(input, root) {
  const quotient = [input[0]];
  for (let i = 1; i < input.length; i++)
    quotient.push((input[i] + root * quotient[quotient.length-1]) % MOD);
  assert.equal(quotient.pop(), 0, "source root must give zero remainder");
  return quotient;
}

assert.equal(bytes.length, 256);
assert.equal(grid.pages.length, 32);
assert(grid.pages.every(row => row.tokens.length === 8));
assert.equal(page(23).indices.length, 213);
assert.equal(page(55).indices.length, 76);
assert.equal(page(56).indices.length, 85);
assert.equal(page(57).indices.length, 95);
const firstWordStarts = [177,183,189], firstWordEnds = [183,189,192];
const sourceWords = firstWordStarts.map((start,i) =>
  page(0).indices.slice(start,firstWordEnds[i]));
assert(sourceWords.every(word => word[0] === 0), "source FFF word heads");
const sums = sourceWords.map(word =>
  word.reduce((s,v) => s + gp.prime[v], 0));
assert.deepEqual(sums, [257,295,48]);
const [modulus, secondSum, sourcePhase] = sums;
assert.equal(modulus, MOD);
const generator = secondSum % MOD;
assert.equal(generator, 38);
assert.equal(sourcePhase, 48);
const cycle = Array.from({length:256}, (_,i) => power(generator,i));
assert.equal(new Set(cycle).size, 256);
assert.equal(power(generator,128), 256);
assert.equal(power(generator,256), 1);

const outer = 2 * 32 + 2 * 8 - 4;
const inner = (32-2) * (8-2);
assert.deepEqual([inner,outer,inner+outer], [180,76,256]);
assert.equal(outer,page(55).indices.length);
const target = page(23).indices.length;
assert.equal(target, power(generator,inner));
assert.equal(power(generator,outer),146);
assert.equal(target * 146 % MOD, 1);

// Independently established p23/p39 and signed-2013 GF29 factor route.
const R=[23,6,10], G=[27,5,15], H=[3,26,24];
const factor = multiply29(R,G);
const signedFactor = multiply29(H,G);
assert.deepEqual(factor,[12,16,7,24,5]);
assert(factor.every((v,i) => v === mod29(27*signedFactor[i])));
const scratch = bytes.map(mod29);
const highFirst = factor.slice().reverse();
const inverseLead = Array.from({length:29},(_,i)=>i)
  .find(n => mod29(n*highFirst[0]) === 1);
assert.notEqual(inverseLead,undefined);
for(let i=0;i<=scratch.length-highFirst.length;i++){
  const scale=mod29(scratch[i]*inverseLead);
  for(let j=0;j<highFirst.length;j++)
    scratch[i+j]=mod29(scratch[i+j]-scale*highFirst[j]);
}
assert.deepEqual(scratch.slice(-4),[0,0,0,0]);

// New dual-field exact source bridge: the original p50 byte polynomial has
// one GF257 root, at the original p23 rune count, which is g^180.
const roots50 = Array.from({length:MOD},(_,i)=>i)
  .filter(x=>evaluate(bytes,x)===0);
assert.deepEqual(roots50,[target]);
assert.equal(evaluate(bytes.slice().reverse(),power(generator,outer)),0);
const spectral = transform(bytes,generator);
const zeroBins = spectral.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
assert.deepEqual(zeroBins,[outer]);

// The separately authenticated prime-totient-encrypted p56 ciphertext
// has three GF257 roots; their generator exponents are 1,32,35.
const roots56 = Array.from({length:MOD},(_,i)=>i)
  .filter(x=>evaluate(page(56).indices,x)===0);
assert.deepEqual(roots56,[38,97,193]);
assert.deepEqual([power(generator,1),power(generator,32),
  power(generator,35)],[38,193,97]);
assert.notEqual(evaluate(page(57).indices,generator),0);

// Source-typed direct key consumers. All operations invert exactly,
// but original p55 outputs are not native-English-looking.
const q50=divideLinear(bytes,target);
const q56=divideLinear(page(56).indices,generator);
const candidates={
  "DFT first 76":spectral.slice(0,outer),
  "DFT phase48 76":spectral.slice(sourcePhase,sourcePhase+outer),
  "p50 root213 quotient first76":q50.slice(0,outer),
  "p56 root38 quotient first76":q56.slice(0,outer)
};
const originalP55=page(55).indices;
const nativePlant=page(57).indices.slice(0,outer);
assert.equal(nativePlant.length,76);
const receiver=[];
for(const [name,key] of Object.entries(candidates)){
  assert.equal(key.length,76);
  for(const sign of [-1,1]){
    const output=originalP55.map((v,i)=>mod29(v+sign*key[i]));
    const inventedCipher=nativePlant.map((v,i)=>mod29(v-sign*key[i]));
    const control=inventedCipher.map((v,i)=>mod29(v+sign*key[i]));
    assert.deepEqual(control,nativePlant);
    receiver.push({name,sign,ioc:Number(ioc(output).toFixed(8)),
      initialRunes:output.slice(0,12).map(i=>gp.translit[i]).join("")});
    assert(ioc(output)<0.05,"promote and investigate if a long native-looking text appears");
  }
}

// Conditional, discovery-aware null: preserve every ORIGINAL byte, its
// modulo29 residue at each position, and the entire GF29 quartic factor.
// Do not misread the result as a pre-registered discovery probability.
const groups = new Map();
bytes.forEach((value,i)=>{
  const v=value%29;
  if(!groups.has(v))groups.set(v,[]);
  groups.get(v).push(i);
});
const availableLengths=[...new Set(gp.pages.filter(p=>
  p.indices.length>0 && p.indices.length<257).map(p=>p.indices.length))];
let state=0x3301257;
function random(){
  state=(Math.imul(1664525,state)+1013904223)>>>0;
  return state;
}
const perm=bytes.slice(), N=50000;
let rootHits=0, anyLengthHits=0;
for(let draw=0;draw<N;draw++){
  for(const positions of groups.values()){
    const values=positions.map(i=>bytes[i]);
    for(let j=values.length-1;j>0;j--){
      const ix=random()%(j+1);
      [values[j],values[ix]]=[values[ix],values[j]];
    }
    positions.forEach((index,i)=>{perm[index]=values[i]});
  }
  if(evaluate(perm,target)===0)rootHits++;
  if(availableLengths.some(x=>evaluate(perm,x)===0))anyLengthHits++;
}
assert.deepEqual([availableLengths.length,rootHits,anyLengthHits],
  [23,175,4244]);
console.log(JSON.stringify({
  kind:"source-locked GF257 p50/p55/p56 spectral bridge",
  originalSource:{p0FFFPrimeSums:sums,primitiveGenerator:generator,
    p23Runes:target,p50Rows:32,p50Columns:8,
    p50InnerCells:inner,p50BorderCells:outer,p55Runes:76,
    p56CipherRoots:roots56,p56RootExponents:[1,35,32],
    uniqueP50Root:roots50,onlyP50FourierZero:zeroBins},
  conditionedNull:{draws:N,exactRoot213:rootHits,
    anyOf23OriginalPageLengths:anyLengthHits,
    warning:"post-discovery conditional controls; not a global p-value"},
  p55DirectReceivers:receiver,authenticatedUnknownPlaintext:false
},null,2));
