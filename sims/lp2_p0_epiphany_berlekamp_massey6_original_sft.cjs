'use strict';

/**
 * Frozen 13-crib Berlekamp-Massey six-stage key-extension attempt.
 * Entire original p0..55 cipher, unchanged GP29, known native p57 control.
 * SFT: node sims/lp2_p0_epiphany_berlekamp_massey6_original_sft.cjs
 *
 * Conditional premise: the 2016 signed EPIPHANY SEEKS (GP EPIPHANY SEECS)
 * might be the exact 8+5 red plaintext rubric of p0. The 13 key digits
 * follow algebraically from the original 13 cipher runes under GP29 plus.
 *
 * Source does not instruct LFSR or transparent F on unknown text.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const title = [18,13,10,13,8,24,9,26,15,18,18,5,15];
assert.equal(title.map((i) => corpus.translit[i]).join(''), 'EPIPHANYSEECS');
const pages = corpus.pages.filter((p) => p.page < 56);
const ciphertext = pages.flatMap((p) => p.indices);
const p0 = pages[0].indices;
const seed = p0.slice(0,13).map((c,i) => mod(c-title[i]));
assert.deepEqual(seed, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.equal(ciphertext.length, 12956);

/** @param {number[]} observed */
function berlekampMassey(observed) {
  let current = [1];
  let previous = [1];
  let complexity = 0;
  let shift = 1;
  let lastDiscrepancy = 1;
  for (let n=0; n<observed.length; n++) {
    let discrepancy = observed[n];
    for (let i=1; i<=complexity; i++) discrepancy += current[i]*observed[n-i];
    discrepancy = mod(discrepancy);
    if (discrepancy===0) {shift++; continue;}
    const original = current.slice();
    let inverse=1;
    while (mod(lastDiscrepancy*inverse)!==1) inverse++;
    const factor = mod(discrepancy*inverse);
    while (current.length < previous.length+shift) current.push(0);
    for (let j=0;j<previous.length;j++) current[shift+j]=mod(current[shift+j]-factor*previous[j]);
    if (2*complexity<=n) {
      complexity=n+1-complexity;
      previous=original;
      lastDiscrepancy=discrepancy;
      shift=1;
    } else shift++;
  }
  return {complexity, connection:current};
}
const recovered = berlekampMassey(seed);
assert.deepEqual(recovered, {complexity:6, connection:[1,9,13,23,22,17,23]});
const key = seed.slice();
for(let i=key.length;i<12956;i++) {
  let value=0;
  for(let j=1;j<recovered.connection.length;j++) value+=recovered.connection[j]*key[i-j];
  key.push(mod(-value));
}
for(let i=6;i<13;i++) {
  let value=seed[i];
  for(let j=1;j<7;j++) value+=recovered.connection[j]*seed[i-j];
  assert.equal(mod(value),0);
}
// Frozen first 13 are both consumed: true presumed title has no literal F.
const deciphered = ciphertext.map((c,i)=>mod(c-key[i]));
assert.deepEqual(deciphered.slice(0,13),title);
assert.deepEqual(deciphered.map((p,i)=>mod(p+key[i])), ciphertext);
const known = corpus.pages[57].indices;
assert.deepEqual(known.map((v,i)=>mod(mod(v+key[i])-key[i])), known);
function coincidence(x) {
  const n=x.length,f=Array(29).fill(0);
  for(const v of x)f[v]++;
  return f.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
const p0body=deciphered.slice(13,262);
const controlIoC=coincidence(known);
const bodyIoC=coincidence(p0body);
assert.ok(bodyIoC < 0.05);
const label=deciphered.slice(0,75).map(i=>corpus.translit[i]).join('');

/**
 * Exhaust legal F-transparent original-cipher interpretations: if a true
 * plaintext F occurs, the original attested p56 coder emits literal F and
 * does not advance its key; any non-F ciphertext may not decode to F.
 * @param {number[]} source
 * @param {number[]} schedule
 */
function strictTransparentPaths(source, schedule) {
  let states=new Set([13]);
  let eliminated=-1;
  for(let offset=13;offset<source.length;offset++){
    const c=source[offset], updated=new Set();
    for(const cursor of states) {
      const plain=mod(c-schedule[cursor]);
      if(plain!==0)updated.add(cursor+1);
      if(c===0)updated.add(cursor);
    }
    if(updated.size===0) {eliminated=offset;break;}
    states=updated;
  }
  return {eliminated, surviving:states.size};
}
const strictOriginal = strictTransparentPaths(p0,key);
assert.ok(strictOriginal.eliminated>=13 && strictOriginal.eliminated<262,
  'frozen continuous key must contradict nontransparent plaintext-F early');
// Independent strict-F positive plant: source-supplied known clear p57 text,
// correctly enciphered with the same schedule and legal no-consume F.
const nativePlant = title.concat(known);
const nativeCipher = [];
let ki=0;
for(const p of nativePlant){
  if(p===0)nativeCipher.push(0);
  else nativeCipher.push(mod(p+key[ki++]));
}
assert.deepEqual(nativeCipher.slice(0,13),p0.slice(0,13));
const positive = strictTransparentPaths(nativeCipher,key);
assert.equal(positive.eliminated,-1);
assert.ok(positive.surviving>0);
const details={
  recovered,
  sourceSeed:seed,
  next20SourceDerivedKeyDigits:key.slice(13,33),
  originalBodyIoC:bodyIoC,
  nativeSolvedP57IoC:controlIoC,
  originalFirst75Translit:label,
  strictP56FRuleFirstImpossibleOriginalP0Offset:strictOriginal.eliminated,
  strictP56FRulePlantStates:positive.surviving,
  noFOriginalPositionsReencrypt:12956,
  plantedKnownP57PositionsReencrypt:known.length
};
console.log(JSON.stringify(details,null,2));
console.log('PASS: smallest six-lag model from conditional p0 red13 seed; fails original, genuine controls pass');
