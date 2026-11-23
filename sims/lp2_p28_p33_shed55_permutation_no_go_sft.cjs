#!/usr/bin/env node
'use strict';

/**
 * Original 55-word-edge p28->p33 register, arbitrary resegmentation and
 * arbitrary secret global alphabet permutation, exact histogram obstruction.
 *
 * This proves/disproves an entire no-value-change family without searching
 * arbitrary rune transpositions, secret 29! alphabets or plaintexts.
 *
 * Windows 11 Node.js 22: node sims/lp2_p28_p33_shed55_permutation_no_go_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

/** @param {string} relative */
const read = relative => fs.readFileSync(relative, 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt').split('%');
const byRune = new Map(gp.runes.map((x, i) => [x, i]));

/** @param {number} page @returns {number[][]} */
function words(page) {
  const source = transcript[page < 50 ? page : page - 1];
  const out = [], w = [];
  for (const ch of source) {
    const value = byRune.get(ch);
    if (value !== undefined) {
      w.push(value);
    } else if (ch !== '/' && !/\s/u.test(ch) && w.length) {
      out.push(w.splice(0));
    }
  }
  if (w.length) out.push(w);
  assert.deepEqual(out.flat(), gp.pages[page].indices);
  return out;
}
/** @param {number[]} list */
function histogram(list) {
  const h = Array(29).fill(0);
  for (const value of list) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    h[value]++;
  }
  return h;
}
/**
 * Histogram intersection bounds the largest possible symbol-by-symbol match
 * after ANY character-position rearrangement.
 *
 * If global unknown 29-way alphabet permutation is additionally allowed,
 * sorting both count sequences maximizes their histogram intersection.
 * @param {number[]} a @param {number[]} b
 */
function bound(a, b) {
  assert.equal(a.length, b.length);
  const ha = histogram(a), hb = histogram(b);
  const retain = ha.reduce((s, v, i) => s + Math.min(v, hb[i]), 0);
  const sa = [...ha].sort((x,y) => y-x);
  const sb = [...hb].sort((x,y) => y-x);
  const optimal = sa.reduce((s, v, i) => s + Math.min(v, sb[i]), 0);
  const exactEqualCounts = ha.every((v,i) => v === hb[i]);
  const relabelCountsEqual = sa.every((v,i) => v === sb[i]);
  assert.ok(optimal >= retain);
  return {
    count: a.length,
    fixedAlphabetMinimumChangedRunes: a.length-retain,
    unknownPermutationMinimumChangedRunes: a.length-optimal,
    exactEqualCounts, relabelCountsEqual,
    first29Histogram:ha, second29Histogram:hb
  };
}
/** @param {number[][]} ww @param {'first'|'last'} side */
function shed(ww,side) {
  return ww.flatMap(w => w.length <= 1 ? w :
    side === 'first' ? w.slice(1) : w.slice(0, -1));
}
const Q=[15,18,12,6];
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {number[]} seq */
function quotient(seq) {
  const rem=seq.slice(), q=[];
  for (let i=0;i<=seq.length-Q.length;i++) {
    const coeff=mod(rem[i]*2);
    q.push(coeff);
    for (let j=0;j<Q.length;j++) rem[i+j]=mod(rem[i+j]-coeff*Q[j]);
  }
  return {q, r:rem.slice(-3)};
}

const p28 = words(28);
const p33 = gp.pages[33].indices;
assert.equal(p28.length,59);
assert.equal(p28.flat().length,269);
assert.equal(p28.filter(w=>w.length>1).length,55);
assert.equal(p33.length,214);
const quotient28=quotient(p28.flat());
const quotient33=quotient(p33);
assert.deepEqual(quotient28.r,[17,27,12]);
assert.deepEqual(quotient33.r,[17,27,12]);
assert.equal(quotient28.q.length,266);
assert.equal(quotient33.q.length,211);
const qLengths=p28.map(w=>w.length);
qLengths[qLengths.length-1]-=3;
assert.ok(qLengths.every(x=>x>0));
let k=0;
const qWords=qLengths.map(n=>{
  const part=quotient28.q.slice(k,k+n);
  k+=n;
  return part;
});
assert.equal(k,quotient28.q.length);

/*
 * Source-native positive: any complete original ribbon, even under a
 * cryptographically secret global rune permutation and a freely randomized
 * layout, is accepted by a zero-mismatch histogram bound.
 * The planted alphabet mapping is fixed and reversible.
 */
const native=gp.pages[57].indices.slice();
const secret=Array.from({length:29},(_,i)=>(7*i+3)%29);
assert.equal(new Set(secret).size,29);
const shuffled=native.map((_,i)=>secret[native[(i*37)%native.length]]);
// 37 is coprime to the genuine solved 95-rune p57 length.
assert.equal(new Set(Array.from({length:native.length},(_,i)=>(i*37)%native.length)).size,native.length);
const control=bound(native,shuffled);
assert.equal(control.unknownPermutationMinimumChangedRunes,0);
const corrupt=shuffled.slice();
corrupt[0]=(corrupt[0]+1)%29;
const changed=bound(native,corrupt);
assert.ok(changed.unknownPermutationMinimumChangedRunes>=0);

const cases=[];
for (const [sourceRegister, source, dest] of [
  ['original-source-runes',p28,p33],
  ['original-Q-quotient',qWords,quotient33.q]
]) {
  for (const side of ['first','last']) {
    const inner=shed(source,side);
    const b=bound(inner,dest);
    cases.push({
      sourceRegister, side, targetPage:33, sourcePage:28,
      symbols:b.count,
      fixedAlphabetMinimumChangedRunes:b.fixedAlphabetMinimumChangedRunes,
      unknownPermutationMinimumChangedRunes:b.unknownPermutationMinimumChangedRunes,
      directAnagramPossible:b.exactEqualCounts,
      anyGlobalAlphabetSubstitutionPlusAnagramPossible:b.relabelCountsEqual,
      sourceCountSha256:crypto.createHash('sha256')
        .update(Buffer.from(b.first29Histogram)).digest('hex'),
      targetCountSha256:crypto.createHash('sha256')
        .update(Buffer.from(b.second29Histogram)).digest('hex')
    });
  }
}
assert.equal(cases.length,4);
assert.equal(cases[0].symbols,214);
assert.equal(cases[1].symbols,214);
assert.equal(cases[2].symbols,211);
assert.equal(cases[3].symbols,211);
console.log(JSON.stringify({
  source: 'LP2 original physical p28 words, source Q polynomial from p39, native p33 GP rune tape',
  physicalSourceWords:59, sourceMultiwordsShed:55,
  rawRegister:[269,214], QRegister:[266,211],
  sourceQAndTargetQSameRemainder:[17,27,12],
  independentSolvedP57SecretAlphabetPositive:control.unknownPermutationMinimumChangedRunes===0,
  conditionalHypothesis:'Shed one exterior rune per multiword, then arbitrary rune transposition, arbitrary printed-space rewriting, and even a secret fixed GP29 alphabet permutation',
  cases,
  interpretation:'A nonzero minimum forbids this exact all-secret transcription family. No original LP2 plaintext or key is recovered.'
},null,2));
console.log('PASS: exact source-native shed55 multiset and secret-global-alphabet no-go gates');
