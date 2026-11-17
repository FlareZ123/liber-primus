// Seed-free, exact 21-bit Blum-modulus GP29 search on original LP2 p55.
// Run: node sims/lp2_p55_parable_bbs_allstate_gp29_original_sft.cjs
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(base, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const lp1 = fs.readFileSync(
  path.join(base, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8'
);
const { buildSourceNativeTrigramModel } = require('./lp1_source_native_trigram_model.cjs');
const model = buildSourceNativeTrigramModel({corpus, referenceText: lp1});
const training = model.training;
const target = corpus.pages.find((p) => p.page === 55).indices.slice(1);
const clear = corpus.pages.find((p) => p.page === 57).indices.slice(0, target.length);
assert.equal(target.length, 75);
assert.equal(clear.length, 75);

const Q = 29;
const V = Q * Q * Q;
const bigram = new Int32Array(Q * Q);
const trigram = new Int32Array(V);
for (let i = 2; i < training.length; i++) {
  const j = Q * training[i - 2] + training[i - 1];
  bigram[j]++;
  trigram[Q * j + training[i]]++;
}
const logProb = new Float64Array(V);
for (let a = 0; a < Q; a++) {
  for (let b = 0; b < Q; b++) {
    const j = Q * a + b;
    for (let c = 0; c < Q; c++) {
      logProb[Q * j + c] = Math.log((1 + trigram[Q * j + c]) / (29 + bigram[j]));
    }
  }
}

/** @param {number[]} indices @param {number} length @returns {number} */
function score(indices, length = indices.length) {
  let total = 0;
  for (let i = 2; i < length; i++) {
    total += logProb[Q * (Q * indices[i - 2] + indices[i - 1]) + indices[i]];
  }
  return total / (length - 2);
}
assert.ok(Math.abs(score(clear) - model.scoreStream(clear).mean) < 1e-12);

const p = 1259;
const q = 1031;
const m = p * q;
assert.equal(m * 1229, 1595277641);

/**
 * Canonical BBS low-bit stream, after-square first bit,
 * five bits per GP29 symbol, MSB-first, reduced modulo29.
 * The entire GF29 additive state/start is searched with no seed assumption.
 * @param {number} initial
 * @param {number} length
 * @returns {number[]}
 */
function pad(initial, length) {
  const out = [];
  let state = initial;
  while (out.length < length) {
    let symbol = 0;
    for (let bit = 0; bit < 5; bit++) {
      state = state * state % m;
      symbol = symbol * 2 + (state & 1);
    }
    out.push(symbol % Q);
  }
  return out;
}

const knownState = 1229 * 1229 % m;
const plantedKey = pad(knownState, 75);
const plantedCipher = clear.map((x, i) => (x + plantedKey[i]) % Q);
assert.deepEqual(plantedCipher.map((c, i) => (c - plantedKey[i] + Q) % Q), clear);

const screenLength = 35;
const topCount = 24;
/** @type {{state:number,sign:number,screenScore:number}[]} */
const best = [];
const bestPlant = [];
let acceptedAbovePositive = 0;
let bestScreen = -Infinity;
const positiveScreen = score(clear, screenLength);
for (const actual of [{source:'original',cipher:target},{source:'planted',cipher:plantedCipher}]) {
  const top = actual.source === 'original' ? best : bestPlant;
  for (let state = 0; state < m; state++) {
    let x = state;
    let sumPlus = 0;
    let sumMinus = 0;
    let pp = -1, ppp = -1, pm = -1, pmm = -1;
    for (let i = 0; i < screenLength; i++) {
      let k = 0;
      for (let bit = 0; bit < 5; bit++) {
        x = x * x % m;
        k = (k << 1) | (x & 1);
      }
      k %= Q;
      const add = (actual.cipher[i] + k) % Q;
      const subtract = (actual.cipher[i] - k + Q) % Q;
      if (i >= 2) {
        sumPlus += logProb[Q * (Q * ppp + pp) + add];
        sumMinus += logProb[Q * (Q * pmm + pm) + subtract];
      }
      ppp = pp;
      pp = add;
      pmm = pm;
      pm = subtract;
    }
    for (const [sign, total] of [[1, sumPlus],[-1, sumMinus]]) {
      const screenScore = total / (screenLength - 2);
      if (screenScore > bestScreen && actual.source === 'original') bestScreen = screenScore;
      if (screenScore >= positiveScreen && actual.source === 'original') acceptedAbovePositive++;
      if (top.length < topCount || screenScore > top[top.length - 1].screenScore) {
        top.push({state,sign,screenScore});
        top.sort((a,b)=>b.screenScore-a.screenScore);
        if (top.length > topCount) top.pop();
      }
    }
  }
}

function fullCandidates(top, cipher) {
  return top.map(({state,sign,screenScore})=>{
    const key=pad(state,cipher.length);
    const plain=cipher.map((c,i)=>(c+sign*key[i]+Q)%Q);
    return {state,sign,screenScore,fullScore:score(plain),
      heldoutScore:score(plain.slice(screenLength)),
      text:model.spell(plain)};
  });
}
const originals=fullCandidates(best,target);
const positives=fullCandidates(bestPlant,plantedCipher);
const expected=positives.find((v)=>v.state===knownState && v.sign===-1);
assert.ok(expected, 'planted true generator must survive all-state top-24 search');
assert.deepEqual(pad(knownState,75),plantedKey);
assert.equal(expected.fullScore,score(clear));
const lp1Scores=[];
for(let i=0;i+75<=training.length;i++)lp1Scores.push(score(training.slice(i,i+75)));
lp1Scores.sort((a,b)=>a-b);
const output={
  hypothesis:'BBS p=1259,q=1031, entirely unknown initial state; native GP29 five-bit modulo29 stream',
  cipher:'original source p55 complete printed-word suffix (75 runes)',
  statesPerTarget:m,
  twoAdditiveSigns:true,
  screenLength,
  positiveScreen,
  acceptedAbovePositive,
  lp1Native75:{min:lp1Scores[0],median:lp1Scores[Math.floor(lp1Scores.length/2)],
    p05:lp1Scores[Math.floor(lp1Scores.length*0.05)],p95:lp1Scores[Math.floor(lp1Scores.length*0.95)]},
  p57Clear75Score:score(clear),
  originalRaw75Score:score(target),
  originalBestByScreen:originals.slice(0,12),
  plantedBestByScreen:positives.slice(0,5),
  plantedTrueKey:{state:knownState,sign:-1,screenScore:expected.screenScore,
    fullScore:expected.fullScore,heldoutScore:expected.heldoutScore}
};
console.log(JSON.stringify(output,null,2));
console.log('PASS: exhaustive BBS state+sign original GP29 cribless screen with positive plant');
