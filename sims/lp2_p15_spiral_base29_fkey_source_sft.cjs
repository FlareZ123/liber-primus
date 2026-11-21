'use strict';
/**
 * P15 authored Fibonacci-prime 4x4 spiral, serialized through the signed
 * 2013 BASE29 operation, as a candidate GP29 key for its own section.
 *
 * Source-readable inputs: p15/32.jpg 16 numbers in red-origin spiral order,
 * 2013 signed BASE29(3301)=3QO, solved p56 plaintext-F passthrough.
 * This is a bounded decoder gate, not a recovered Cicada key.
 *
 * Windows 11 / Node 22: node sims/lp2_p15_spiral_base29_fkey_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const page = id => {
  const entry = pages.find(x => x.page === id);
  assert(entry, 'Missing original page ' + id);
  return entry.indices;
};
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const coordinates = [
  [1,1], [1,2], [2,2], [2,1], [2,0], [1,0], [0,0], [0,1],
  [0,2], [0,3], [1,3], [2,3], [3,3], [3,2], [3,1], [3,0]
];
const numbers = coordinates.map(([r,c]) => printed[r][c]);
assert.deepEqual(numbers, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);
assert.equal(fs.existsSync(
  path.join(ROOT, 'resources/liber-primus/32.jpg')), true);
assert.equal(page(15).length, 159);
assert.equal(page(19).length, 271);
assert.equal(pages.filter(p => p.page < 56 && p.indices.length).length, 55);

/** Base29 decimal-to-digit operation, big-endian and canonical minimal width.
 *  This is the digit convention of the signed 2013 3301 -> 3QO example.
 *  @param {number} number @returns {number[]}
 */
function base29(number) {
  assert(Number.isSafeInteger(number) && number >= 0);
  const out = [];
  do {
    out.unshift(number % 29);
    number = Math.floor(number / 29);
  } while (number);
  return out;
}
assert.deepEqual(base29(3301), [3,26,24]);
assert.deepEqual(base29(3299), [3,26,22]);
const keys = {
  minimal: numbers.flatMap(base29),
  fixedWidth3: numbers.flatMap(n => {
    const d = base29(n);
    return Array(3 - d.length).fill(0).concat(d);
  })
};
assert.equal(keys.minimal.length, 47);
assert.equal(keys.fixedWidth3.length, 48);
assert.deepEqual(base29(708), [24,12]);
assert.deepEqual(keys.fixedWidth3.slice(39,42), [0,24,12]);

const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} source */
function ioc(source) {
  const counts = Array(29).fill(0);
  for (const v of source) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    counts[v]++;
  }
  return counts.reduce((a,n) => a + n*(n-1), 0) /
    (source.length*(source.length-1));
}
/** Exact ordinary additive inverse at displayed phase0.
 *  @param {number[]} ciphertext @param {number[]} key
 *  @param {-1|1} sign
 */
function direct(ciphertext, key, sign) {
  return ciphertext.map((v,i) => mod(v + sign*key[i%key.length]));
}
/**
 * Solved-p56-style plaintext-F-transparent inverse feasibility:
 * plaintext F(0) is emitted as ciphertext F(0) without consuming key.
 * A non-F plaintext always consumes one key digit, even when its
 * encrypted ciphertext happens to equal F.
 *
 * sign -1: P=C-K. sign +1: P=C+K.
 * @param {number[]} ciphertext @param {number[]} key
 * @param {-1|1} sign @param {number} start
 */
function feasible(ciphertext, key, sign, start) {
  let states = new Set([start]);
  for (let i=0;i<ciphertext.length;i++) {
    const c = ciphertext[i], next = new Set();
    for (const t of states) {
      const p = mod(c + sign*key[t%key.length]);
      if (c === 0) {
        next.add(t); // plaintext F emitted directly
        if (p !== 0) next.add(t+1); // non-F encrypted to F
      } else if (p !== 0) next.add(t+1);
    }
    if (next.size === 0) return {survives:false, firstImpossible:i};
    states = next;
  }
  return {survives:true, firstImpossible:ciphertext.length};
}
/** Positive control with the exact inverse's F-bypass semantics.
 * @param {number[]} plain @param {number[]} key
 * @param {-1|1} sign @param {number} start
 */
function encrypt(plain,key,sign,start) {
  const output = [];
  let clock=start;
  for (const p of plain) {
    if (p === 0) output.push(0);
    else {
      output.push(mod(p - sign*key[clock%key.length]));
      clock++;
    }
  }
  return output;
}
const plant = page(57); // original solved, clear PARABLE; 95 GP runes
assert.equal(plant.length,95);
const tests = [];
for(const [label,key] of Object.entries(keys)) {
  for(const sign of [-1,1]) {
    const synthetic = encrypt(plant,key,sign,0);
    assert(feasible(synthetic,key,sign,0).survives,
      'F-transparent authentic clear-source plant failed');
    const target = page(19);
    let survives=0,furthest=0,phase0=-1;
    for(let phase=0;phase<key.length;phase++) {
      const trial=feasible(target,key,sign,phase);
      if(trial.survives) survives++;
      furthest=Math.max(furthest,trial.firstImpossible);
      if(phase===0) phase0=trial.firstImpossible;
    }
    assert.equal(survives,0,'Original p19 unexpectedly has legal F-key path');
    tests.push({
      serializer:label, digits:key.length, sign,
      targetPage:19, targetRunes:271,
      allPhaseViable:survives, firstImpossiblePhase0:phase0,
      lastPossiblePrefixAnyPhase:furthest,
      p16to22DirectIoC:ioc(direct(
        pages.filter(p=>p.page>=16&&p.page<=22)
          .flatMap(p=>p.indices),key,sign)),
      plantedClearRunes:plant.length
    });
  }
}
assert.deepEqual(tests.map(t=>t.lastPossiblePrefixAnyPhase),
  [69,109,125,101]);
assert.equal(page(15).slice(20).length,139);
console.log(JSON.stringify({
  classification:'bounded negative for p15 spiral -> BASE29 key -> p19 inverse',
  source:'original p15 spiral, signed 2013 BASE29, authenticated solved-p56 F rule',
  digits47:keys.minimal, digits48:keys.fixedWidth3,
  page15BlackRunes:139,
  tests,
  conclusion:'No full original p19 inverse exists under any start phase of either source BASE29 serialization or arithmetic sign. This does not exclude a different key generator or ciphertext transform.'
},null,2));
