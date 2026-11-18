'use strict';

/**
 * Original-source two-time-pad attack on the unique p29 / p50 repeated-root
 * pair. Tests whether two factor-stripped GP29 registers were independently
 * encoded from English with the same unknown additive pad:
 * C1[i]=P1[i]+K[i], C2[i]=P2[i]+K[i] (mod 29).
 *
 * The unknown K cancels. Recover both P1/P2 jointly from their difference
 * using an interpolated GP29 fourth-order language model and a bounded beam.
 *
 * All four alignments are source-determined front/back for p29/G and
 * table/G or table/(H*G). They are candidate interpretations, not authentic
 * Cicada-selected decryption instructions. No key is fitted to original data.
 *
 * Run: node sims/lp2_p29_p50_twotimepad_joint_original_sft.cjs
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
const table = load('resources/liber-primus/base60-grid.json');
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
  assert(remainder.slice(-divisor.length + 1).every(x => x === 0));
  return quotient;
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
assert.equal(training.length, 424580);

const p29 = corpus.pages.find(p => p.page === 29).indices;
const grid = table.byte_rows.flat();
assert.equal(p29.length, 277);
assert.equal(grid.length, 256);
const quotient29 = divide(p29, [15, 5, 27]);
const quotient50G = divide(grid, [15, 5, 27]);
const quotient50HG = divide(grid, [12, 17, 11, 21, 23]);
assert.deepEqual([quotient29.length, quotient50G.length, quotient50HG.length],
  [275, 254, 252]);

const originals = [];
const originalDifferences = [];
for (const [label, quotient] of [['G', quotient50G], ['HG', quotient50HG]]) {
  for (const alignment of ['front', 'back']) {
    const sliced = alignment === 'front'
      ? quotient29.slice(0, quotient.length)
      : quotient29.slice(-quotient.length);
    const delta = difference(sliced, quotient);
    originals.push({
      label: label + '-' + alignment,
      ...recover(delta, lang),
    });
    originalDifferences.push({label: label + '-' + alignment, delta});
  }
}
const positives = [];
for (let j = 0; j < 6; j++) {
  const first = heldout[0].slice(j * 310, j * 310 + 252);
  const second = heldout[1].slice(4200 + j * 310, 4452 + j * 310);
  assert.equal(first.length, 252);
  assert.equal(second.length, 252);
  positives.push(recover(difference(first, second), lang)
    .scorePerPlaintextRune);
}
const rng = randomGenerator(91237);
const uniform = [];
for (let j = 0; j < 10; j++) {
  uniform.push(recover(Array.from({length: 252},
    () => Math.floor(rng() * MOD)), lang).scorePerPlaintextRune);
}
const shuffles = [];
for (const {label, delta} of originalDifferences) {
  for (let j = 0; j < 5; j++) {
    const shuffled = delta.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const k = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[k]] = [shuffled[k], shuffled[i]];
    }
    shuffles.push({
      label,
      score: recover(shuffled, lang).scorePerPlaintextRune,
    });
  }
}
const bestOriginal = Math.max(...originals.map(x => x.scorePerPlaintextRune));
const bestShuffled = Math.max(...shuffles.map(x => x.score));
const worstPositive = Math.min(...positives);
assert(bestShuffled >= bestOriginal,
  'At least one same-histogram shuffled original is expected to score higher');
assert(worstPositive > bestOriginal,
  'All disjoint held-out native GP English pairs should score higher');
console.log(JSON.stringify({
  source: {
    p29Runes: p29.length,
    p29FactorQuotient: quotient29.length,
    tableBytes: grid.length,
    tableFactorQuotients: [quotient50G.length, quotient50HG.length],
    trainingRunes: training.length,
    heldoutRunes: heldout.map(x => x.length),
    beamStates: BEAM,
    interpretation: 'Unverified same-pad hypothesis on two distinct factor quotients',
  },
  original: originals,
  heldoutNativeEnglish: positives,
  randomUniform: uniform,
  originalDifferenceShuffles: shuffles,
  comparison: {
    bestOriginal,
    worstNativePositive: worstPositive,
    bestShuffledOriginal: bestShuffled,
    matchedOriginalShuffledAtLeastAsGood: bestShuffled >= bestOriginal,
    newPlaintextRecovered: false,
  },
}, null, 2));
