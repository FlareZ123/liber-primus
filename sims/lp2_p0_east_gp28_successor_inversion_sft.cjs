'use strict';

/**
 * Recover an original unknown-page plaintext, if one follows the conditional
 * 27x27 "EAST OF THE MAP" clue and an invertible 28-successor cipher.
 *
 * p0-p2's 27th column supplies a literal 27-rune key. A successor coder
 * excludes the previous ciphertext rune (28 remaining choices) and reserves
 * equality for plaintext EA. Both rank conventions, both key directions,
 * three first-party numerical registers, and both marker clock policies are
 * frozen before measuring untouched p3-p7 and p8-p14.
 *
 * Windows/Node 22 single-file read-only test: node sims/lp2_p0_east_gp28_successor_inversion_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const page = n => {
  const record = corpus.pages.find(p => p.page === n);
  assert.ok(record);
  return record.indices;
};
const segment = (a, b) => Array.from({length:b-a+1}, (_,i)=>page(a+i)).flat();
const mod = (v,n) => ((v%n)+n)%n;
const ioc = seq => {
  const counts = Array(29).fill(0);
  for (const i of seq) counts[i]++;
  return counts.reduce((s,x)=>s+x*(x-1),0)/(seq.length*(seq.length-1));
};

const map = segment(0,2);
assert.equal(map.length,729);
const east = Array.from({length:27}, (_,r)=>map[r*27+26]);
assert.deepEqual(east,
  [17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]);

const keyVariants = [
  {name:'GP ordinal', values:east},
  {name:'GP prime weight', values:east.map(i=>corpus.prime[i])},
  {name:'phi(GP prime)', values:east.map(i=>corpus.prime[i]-1)}
];

/**
 * A complete 29-rune-to-29-rune bijection for a public ciphertext predecessor
 * and a GP28 key. The literal first rune is its own initialization symbol.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {'numeric'|'cyclic'} ordering
 * @param {-1|1} sign
 * @param {boolean} skipRepeatClock
 * @returns {number[]}
 */
function decode(cipher,key,ordering,sign,skipRepeatClock) {
  const output = [cipher[0]];
  let tick = 0;
  for (let i=1;i<cipher.length;i++) {
    const previous = cipher[i-1], current=cipher[i];
    if (current === previous) {
      output.push(28); // source GP rune EA, reserved marker
      if (!skipRepeatClock) tick++;
      continue;
    }
    const rank = ordering === 'numeric'
      ? current - (current > previous ? 1 : 0)
      : mod(current-previous-1,29);
    assert.ok(rank>=0 && rank<28);
    output.push(mod(rank + sign*key[tick%key.length],28));
    tick++;
  }
  return output;
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {'numeric'|'cyclic'} ordering
 * @param {-1|1} sign
 * @param {boolean} skipRepeatClock
 * @returns {number[]}
 */
function encode(plain,key,ordering,sign,skipRepeatClock) {
  const cipher = [plain[0]];
  let tick=0;
  for(let i=1;i<plain.length;i++) {
    const p=plain[i], previous=cipher[i-1];
    if(p===28) {
      cipher.push(previous);
      if(!skipRepeatClock) tick++;
      continue;
    }
    const rank=mod(p-sign*key[tick%key.length],28);
    const current=ordering==='numeric'
      ? rank+(rank>=previous?1:0)
      : mod(previous+rank+1,29);
    assert.ok(current!==previous&&current>=0&&current<29);
    cipher.push(current);
    tick++;
  }
  return cipher;
}

const fit=segment(3,7),held=segment(8,14),clear=page(57);
assert.equal(fit.length,1145);
assert.equal(held.length,1729);
assert.equal(clear.length,95);
assert.ok(Math.abs(ioc(clear)-0.06270996640537514)<1e-12);
const plant=Array.from({length:fit.length},(_,i)=>clear[i%clear.length]);
for(const pos of [2,28,105,500,1000]) plant[pos]=28;

const candidates=[];
for(const variant of keyVariants) {
  for(const ordering of ['numeric','cyclic']) {
    for(const sign of [-1,1]) {
      for(const skipRepeatClock of [false,true]) {
        const s={key:variant.name,ordering,sign,skipRepeatClock};
        const encrypted=encode(plant,variant.values,ordering,sign,skipRepeatClock);
        assert.deepEqual(decode(encrypted,variant.values,ordering,sign,skipRepeatClock),plant);
        const pf=decode(fit,variant.values,ordering,sign,skipRepeatClock);
        const ph=decode(held,variant.values,ordering,sign,skipRepeatClock);
        candidates.push({...s,firstIoc:ioc(pf),heldoutIoc:ioc(ph),
          first32:pf.slice(0,32).map(i=>corpus.translit[i]).join(' ')});
      }
    }
  }
}
assert.equal(candidates.length,24);
const bestFit=[...candidates].sort((a,b)=>b.firstIoc-a.firstIoc)[0];
const bestHold=[...candidates].sort((a,b)=>b.heldoutIoc-a.heldoutIoc)[0];
assert.equal(bestFit.key,'phi(GP prime)');
assert.equal(bestFit.ordering,'cyclic');
assert.equal(bestFit.sign,-1);
assert.equal(bestFit.skipRepeatClock,true);
assert.ok(Math.abs(bestFit.firstIoc-0.03576052768192506)<1e-12);
assert.ok(Math.abs(bestHold.heldoutIoc-0.03552819013345329)<1e-12);
assert.ok(bestFit.firstIoc<0.036);
assert.ok(bestHold.heldoutIoc<0.036);
assert.equal(encode(decode(fit,keyVariants[2].values,'cyclic',-1,true),
  keyVariants[2].values,'cyclic',-1,true).join(','),fit.join(','));

console.log(JSON.stringify({
  source:'Original p0-p2 27x27 eastern edge, no chosen ciphertext key',
  original:[{pages:'3-7',runes:fit.length,ioc:ioc(fit)},
    {pages:'8-14',runes:held.length,ioc:ioc(held)}],
  clearSolvedP57:{runes:clear.length,ioc:ioc(clear)},
  receiver:'GP28 excluding preceding ciphertext rune, with EA as exact repeated-output escape',
  candidateCount:candidates.length,
  sameLengthNativePlantsRecovered:candidates.length,
  bestFit,
  bestIndependentHoldout:bestHold,
  candidates,
  verdict:'No complete prose or author-selected key from this exact source-motivated family',
},null,2));
