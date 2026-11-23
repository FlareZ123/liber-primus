'use strict';

/**
 * Original-source shared-keystream decipherment test on the new p28/p33
 * equal-cubic-remainder pair. The source Q=[15,18,12,6] is derived from
 * p39's red polynomial and the original p29 terminal source field.
 *
 * If two source-paired pages use the same unknown additive running key K,
 * their differences cancel K before any language model is consulted:
 * C28[i]-C33[i] = P28[i]-P33[i] (mod29).
 * We compare direct source runes and independently fixed high-first Q
 * quotients; for unequal lengths consider only left/right alignment.
 * Full genuine solved-GP planted language positives and seeded shuffled
 * differences distinguish actual plaintext recovery from n-gram mirages.
 *
 * Run: node sims/lp2_p28_p33_q_sharedpad_joint_original_sft.cjs
 * Requires Node 22, only built-in modules, original repository resources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
/** @param {string} p */
const load = p => JSON.parse(read(p));

const corpus = load('resources/liber-primus/lp2-corpus.json');
const alphabet = corpus.translit;
const runeMap = new Map(alphabet.map((x, i) => [x, i]));
const MOD = 29;
const SPACE2 = 29 * 29;
const SPACE3 = SPACE2 * 29;
const SPACE4 = SPACE3 * 29;
const BEAM = 2000;
/** @param {number} x */
const mod = x => (x % MOD + MOD) % MOD;

/**
 * GP-native greedy transliteration used for the pinned held-out controls.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const out = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      // Exact solved-LP1/p57 source spelling: ING and IO are whole runes.
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
        continue;
      }
      if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
        continue;
      }
      let found;
      let advance = 0;
      for (const len of [3, 2, 1]) {
        const symbol = runeMap.get(word.slice(i, i + len));
        if (symbol !== undefined) {
          found = symbol;
          advance = len;
          break;
        }
      }
      if (found !== undefined) out.push(found);
      i += advance || 1;
    }
  }
  return out;
}

/**
 * Fixed-orientation polynomial long division, coefficients high-degree-first.
 * @param {number[]} input
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divide(input, divisor) {
  const remainder = input.map(mod);
  const quotient = [];
  const inverse = Array.from({length: MOD}, (_, i) => i)
    .find(i => mod(i * divisor[0]) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= remainder.length - divisor.length; i++) {
    const coefficient = mod(remainder[i] * inverse);
    quotient.push(coefficient);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(-divisor.length + 1) };
}

/**
 * MLE frequency counts with interpolated lower-order backoff.
 * @param {number[]} train
 */
function trainLanguageModel(train) {
  const c1 = new Float64Array(MOD);
  const c2 = new Float64Array(SPACE2);
  const c3 = new Float64Array(SPACE3);
  const c4 = new Float64Array(SPACE4);
  for (let i = 0; i < train.length; i++) {
    const a = train[i];
    c1[a]++;
    if (i >= 1) c2[train[i - 1] * MOD + a]++;
    if (i >= 2) c3[(train[i - 2] * MOD + train[i - 1]) * MOD + a]++;
    if (i >= 3) {
      c4[((train[i - 3] * MOD + train[i - 2]) * MOD +
        train[i - 1]) * MOD + a]++;
    }
  }
  const p1 = new Float64Array(MOD);
  const p2 = new Float64Array(SPACE2);
  const p3 = new Float64Array(SPACE3);
  const l1 = new Float64Array(MOD);
  const l2 = new Float64Array(SPACE2);
  const l3 = new Float64Array(SPACE3);
  const l4 = new Float32Array(SPACE4);
  for (let i = 0; i < MOD; i++) {
    p1[i] = (c1[i] + 0.2) / (train.length + 0.2 * MOD);
    l1[i] = Math.log(p1[i]);
  }
  for (let i = 0; i < SPACE2; i++) {
    p2[i] = (c2[i] + 5 * p1[i % MOD]) /
      (c1[Math.floor(i / MOD)] + 5);
    l2[i] = Math.log(p2[i]);
  }
  for (let i = 0; i < SPACE3; i++) {
    p3[i] = (c3[i] + 5 * p2[i % SPACE2]) /
      (c2[Math.floor(i / MOD)] + 5);
    l3[i] = Math.log(p3[i]);
  }
  for (let i = 0; i < SPACE4; i++) {
    l4[i] = Math.log((c4[i] + 7 * p3[i % SPACE3]) /
      (c3[Math.floor(i / MOD)] + 7));
  }
  return {l1, l2, l3, l4};
}

/**
 * Joint 4-gram decoding of two unknown GP29 plaintext streams.
 * Each first-stream 3-rune suffix is a beam state; each second-stream
 * suffix is uniquely determined by its difference from the first.
 * @param {number[]} difference
 * @param {ReturnType<typeof trainLanguageModel>} lang
 */
function recover(difference, lang) {
  const n = difference.length;
  assert(n >= 4);
  const {l1, l2, l3, l4} = lang;
  const stateScore = new Float64Array(SPACE3);
  const stateParent = new Int32Array(SPACE3);
  let beam = [];
  for (let a = 0; a < MOD; a++) {
    for (let b = 0; b < MOD; b++) {
      for (let c = 0; c < MOD; c++) {
        const x = mod(a - difference[0]);
        const y = mod(b - difference[1]);
        const z = mod(c - difference[2]);
        const first = (a * MOD + b) * MOD + c;
        const second = (x * MOD + y) * MOD + z;
        const score = l1[a] + l1[x] + l2[a * MOD + b] +
          l2[x * MOD + y] + l3[first] + l3[second];
        beam.push({
          index: first,
          score,
          first: alphabet[a] + alphabet[b] + alphabet[c],
          second: alphabet[x] + alphabet[y] + alphabet[z],
        });
      }
    }
  }
  beam.sort((a, b) => b.score - a.score);
  beam.length = BEAM;
  for (let i = 3; i < n; i++) {
    stateScore.fill(-Infinity);
    for (let parent = 0; parent < beam.length; parent++) {
      const candidate = beam[parent];
      const key = candidate.index;
      const c = key % MOD;
      const b = Math.floor(key / MOD) % MOD;
      const a = Math.floor(key / SPACE2);
      const x = mod(a - difference[i - 3]);
      const y = mod(b - difference[i - 2]);
      const z = mod(c - difference[i - 1]);
      const firstBase = key * MOD;
      const secondBase = ((x * MOD + y) * MOD + z) * MOD;
      const nextBase = (b * MOD + c) * MOD;
      for (let v = 0; v < MOD; v++) {
        const next = nextBase + v;
        const w = mod(v - difference[i]);
        const score = candidate.score + l4[firstBase + v] +
          l4[secondBase + w];
        if (score > stateScore[next]) {
          stateScore[next] = score;
          stateParent[next] = parent;
        }
      }
    }
    const nextStates = [];
    for (let k = 0; k < SPACE3; k++) {
      if (stateScore[k] > -Infinity) nextStates.push(k);
    }
    nextStates.sort((a, b) => stateScore[b] - stateScore[a]);
    beam = nextStates.slice(0, BEAM).map(key => {
      const parent = beam[stateParent[key]];
      const a = key % MOD;
      const b = mod(a - difference[i]);
      return {
        index: key,
        score: stateScore[key],
        first: parent.first + alphabet[a],
        second: parent.second + alphabet[b],
      };
    });
  }
  assert.equal(beam[0].first.length > 0, true);
  return {
    scorePerPlaintextRune: beam[0].score / (2 * n),
    first: beam[0].first.slice(0, 180),
    second: beam[0].second.slice(0, 180),
  };
}

/** @param {number[]} a @param {number[]} b */
const difference = (a, b) => {
  assert.equal(a.length, b.length);
  return a.map((value, i) => mod(value - b[i]));
};
/** @param {number} initial */
function randomGenerator(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const sources = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
].map(p => encode(read(p)));
const training = sources.flatMap(x => x.slice(0, Math.floor(x.length * 0.7)));
const heldout = sources.map(x => x.slice(Math.floor(x.length * 0.7)));
const lang = trainLanguageModel(training);
assert(training.length > 390000 && training.length < 430000);


const p28 = corpus.pages[28].indices;
const p33 = corpus.pages[33].indices;
const Q = [15, 18, 12, 6];
const q28 = divide(p28, Q);
const q33 = divide(p33, Q);
assert.deepEqual(q28.remainder, [17, 27, 12]);
assert.deepEqual(q33.remainder, [17, 27, 12]);
assert.equal(q28.quotient.length, 266);
assert.equal(q33.quotient.length, 211);

const originalCases = [
  {name:'raw-left',first:p28.slice(0,p33.length),second:p33},
  {name:'raw-right',first:p28.slice(-p33.length),second:p33},
  {name:'Q-quotient-left',
   first:q28.quotient.slice(0,q33.quotient.length),second:q33.quotient},
  {name:'Q-quotient-right',
   first:q28.quotient.slice(-q33.quotient.length),second:q33.quotient},
];
const originals = originalCases.map(item => ({
  name:item.name,
  n:item.second.length,
  ...recover(difference(item.first,item.second),lang),
}));

// Heldout positive plants encrypted with the *same source-independent
// arbitrary nonlinear pad*; the pad disappears from observed differences.
const positives = [];
for(let j=0;j<6;j++) {
  const n=211;
  const a=heldout[0].slice(j*310,j*310+n);
  const b=heldout[1].slice(4200+j*310,4200+j*310+n);
  assert.equal(a.length,n);
  assert.equal(b.length,n);
  const key=Array.from({length:n},(_,i)=>mod(17*i*i+19*i+23));
  const cipherA=a.map((x,i)=>mod(x+key[i]));
  const cipherB=b.map((x,i)=>mod(x+key[i]));
  assert.deepEqual(difference(cipherA,cipherB),difference(a,b));
  positives.push(recover(difference(cipherA,cipherB),lang).scorePerPlaintextRune);
}

const rng=randomGenerator(0x33012026);
const shuffles=[];
for(const {name,first,second} of originalCases) {
  const delta=difference(first,second);
  for(let j=0;j<3;j++) {
    const v=delta.slice();
    for(let i=v.length-1;i>0;i--) {
      const k=Math.floor(rng()*(i+1));
      [v[i],v[k]]=[v[k],v[i]];
    }
    shuffles.push({name,score:recover(v,lang).scorePerPlaintextRune});
  }
}

const sourceClear57=corpus.pages[57].indices;
const nativeKnown=heldout[2].slice(1000,1000+sourceClear57.length);
assert.equal(nativeKnown.length,95);
const sourceNativePositive=recover(difference(sourceClear57,nativeKnown),lang);
const ranks=originals.map(item=>({
  name:item.name,
  lessThanHeldoutPositives:positives.filter(v=>item.scorePerPlaintextRune<v).length,
  heldoutNativeTotal:positives.length,
}));
console.log(JSON.stringify({
  status:'PASS: exact original-input paired-quotient inference completed',
  premise:'Q polynomial remainder p28 == p33 == [17,27,12]',
  source:{rawLengths:[269,214],quotientLengths:[266,211],
    q28:q28.remainder,q33:q33.remainder,
    trainedGpRunes:training.length,heldoutGpRunes:heldout.map(x=>x.length)},
  originals,
  ranks,
  sourceNativePositive,
  plantedNativeHeldoutPositive:positives,
  shuffledOriginalControls:shuffles,
  keyAndPlaintextRecovered:false,
  caveat:'Only synchronous same-additive-pad, source-leading/ending alignments, ordinary GP-native prose; no source-authored shared key or reset is known.'
},null,2));
