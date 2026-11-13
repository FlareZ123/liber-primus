'use strict';

/**
 * The original p15 16-value Fibonacci-prime spiral selects a 16-phase
 * candidate exponent cipher on the complete pp15–22 original GP29 chapter.
 * This gates every secret bijection at each phase, not just the known key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = corpus.pages.filter((p) => p.page >= 15 && p.page <= 22)
  .flatMap((p) => p.indices);
assert.equal(source.length, 1903);
assert.equal(source[0], 0);
const mod = (x, n) => ((x % n) + n) % n;

// Original red-3299 clockwise spiral; the last two values are 3301+prime.
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const primeKey = spiral.map((x, i) => i < 14 ? 3301-x : 3301+x);
assert.deepEqual(primeKey, [2,3,5,7,13,23,43,79,149,263,
  463,829,1481,2593,4507,7817]);

const powers = [], log2 = Array(29).fill(-1);
let v = 1;
for (let i = 0; i < 28; i++) {
  assert.equal(log2[v], -1);
  log2[v] = i;
  powers.push(v);
  v = 2*v % 29;
}
assert.equal(v, 1);
/** @param {number[]} c */
const differences = (c) => c.slice(1).map((x, i) => mod(x-c[i],29));
/** @param {number[]} stream 28 nonzero GP29 steps or GP28 letters. */
function period16Bound(stream) {
  const counts = Array.from({length:16}, () => Array(29).fill(0));
  stream.forEach((x,i) => counts[i%16][x]++);
  let equalPairs = 0, totalPairs = 0, upperBoundCommonSymbol = 0;
  for (const row of counts) {
    const n = row.reduce((a,b)=>a+b,0);
    totalPairs += n*(n-1);
    equalPairs += row.reduce((a,b)=>a+b*(b-1),0);
    upperBoundCommonSymbol += Math.max(...row);
  }
  return {length:stream.length,equalPairs,totalPairs,
    phaseIoC:equalPairs/totalPairs,upperBoundCommonSymbol};
}
/** @param {string} input Native literary control in source GP29 transliteration. */
function englishGP(input) {
  const tokens = new Map(corpus.translit.map((x,i)=>[x,i]));
  tokens.set('ING',21);
  const words = input.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g) || [];
  const out = [];
  for (const w of words) for (let i=0; i<w.length;) {
    let hit = false;
    for (const size of [3,2,1]) {
      const tok = w.slice(i,i+size);
      if (tokens.has(tok)) {
        out.push(tokens.get(tok)); i+=size; hit=true; break;
      }
    }
    if (!hit) i++;
  }
  return out;
}
const steps = differences(source);
const nonzero = steps.filter((x)=>x!==0);
assert.equal(steps.length, 1902);
assert.equal(nonzero.length, 1892);
const original = period16Bound(nonzero);
assert.equal(original.equalPairs,8056);
assert.equal(original.totalPairs,221840);
assert.equal(original.upperBoundCommonSymbol,150);

const literary = englishGP(fs.readFileSync(path.join(root,
  'resources/control/emerson_essays_2944.txt'),'utf8'));
assert.equal(literary.length,323083);
const controls = [], nativeDominant = [];
for(let i=0;i+nonzero.length<=literary.length;i+=nonzero.length) {
  const window = literary.slice(i,i+nonzero.length).filter((x)=>x!==28);
  if(window.length>=nonzero.length*0.97) {
    controls.push(period16Bound(window));
    const counts = Array(29).fill(0);
    window.forEach((x)=>counts[x]++);
    nativeDominant.push(Math.max(...counts));
  }
}
assert.equal(controls.length,170);
const minControlCommon = Math.min(...controls.map((x)=>x.upperBoundCommonSymbol));
const minNativeDominant = Math.min(...nativeDominant);
const minControlIoC = Math.min(...controls.map((x)=>x.phaseIoC));
assert.equal(minControlCommon,225);
assert.equal(minNativeDominant,187);
assert.ok(minControlIoC>0.05830 && minControlIoC<0.05840);
assert.ok(original.upperBoundCommonSymbol<minNativeDominant);
assert.ok(original.phaseIoC<minControlIoC);

// Full source-shaped reversible plant with 16 *independent* secret bijections.
// Each phase uses exponent (5*plaintext + 11*phase + 2) mod28.
function encode(plaintext, iv) {
  const out = [iv]; let phase=0;
  for(const x of plaintext) {
    const step=x===28?0:powers[mod(5*x+11*phase+2,28)];
    out.push(mod(out.at(-1)+step,29));
    if(x!==28)phase++;
  }
  return out;
}
function decode(ciphertext) {
  const out = []; let phase=0;
  for(const step of differences(ciphertext)) {
    if(step===0) out.push(28);
    else {out.push(mod(17*(log2[step]-11*phase-2),28));phase++;}
  }
  return out;
}
const nativePlant = literary.slice(42000,43902).map((x,i)=>
  i%173===17?28:x===28?27:x);
const planted = encode(nativePlant,source[0]);
assert.equal(planted.length,source.length);
assert.ok(nativePlant.includes(28));
assert.deepEqual(decode(planted),nativePlant);
assert.deepEqual(encode(decode(planted),planted[0]),planted);

// One direct non-fitted prime-spinal exponent-key inverse.
let phase=0;
const literal = steps.map((x)=>{
  if(x===0)return 28;
  return mod(log2[x]-primeKey[(phase++)%16],28);
});
function ioc(seq) {
  const ct=Array(29).fill(0);seq.forEach((x)=>ct[x]++);
  return ct.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
const literalIoC=ioc(literal);
assert.ok(literalIoC>0.03538 && literalIoC<0.03539);
console.log(JSON.stringify({
  originalRunes:source.length,zeroTransitions:steps.length-nonzero.length,
  original, controlWindows:controls.length,
  minControlCommon, minNativeDominant, minControlIoC, literalIoC,
  literalPrefix:literal.slice(0,75).map((x)=>corpus.translit[x]).join(' '),
  syntheticPlaintextRecovered:nativePlant.length
},null,2));
