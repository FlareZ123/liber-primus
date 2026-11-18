'use strict';

/**
 * Predictive (no decryption) source-native F1 five-phase word-key/redraw test.
 *
 * Original-source question: after calibrating one collision-rejection rate
 * from the manuscript's 86 adjacent doublets, can a shared five-phase cipher
 * with independently redrawn word keys also explain its word-internal fifth-
 * and sixth-back structure? All 812 affine six-back maps are reselected for
 * each planted English book to avoid a selected-map comparison.
 *
 * The model is a hypothesis, not an authenticated Cicada cipher.
 * Windows Node 22 SFT: node sims/lp2_f1_wordkey_redraw_joint_original_sft.cjs
 * Inputs are committed source artifacts. Writes: none.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalSource = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const unknown = originalSource.words.map(w => [...w.runes].map(c => glyph.get(c)));
const sourceTape = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(unknown.length, 2896);
assert.equal(originalSource.runeCount, 12956);
assert.deepEqual(unknown.flat(), sourceTape);
assert.deepEqual(unknown.map(w => w.length).sort((a, b) => a-b).at(-1), 14);

const runePage = gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices.map(() => p.page));
const pagePairs = runePage.slice(1).filter((v, i) => v === runePage[i]).length;
assert.equal(pagePairs, 12901);

/**
 * The original word segmentation is held fixed in controls.
 * @param {number[][]} words
 * @returns {{ doublets:number,withinDoublets:number,boundaryDoublets:number,
 *   fifth:number, pairedFifth:number, selectedS:number, mostFifth:number,
 *   affineSix:number,bestA:number,bestB:number }}
 */
function metrics(words) {
  const fifthGlyphs = new Int32Array(29);
  const sixPairs = new Int32Array(29 * 29);
  let doublets = 0, withinDoublets = 0, boundaryDoublets = 0;
  let fifth = 0, pairedFifth = 0, selectedS = 0, pos = 0, prev = -1;
  for (const w of words) {
    for (let j = 0; j < w.length; j++, pos++) {
      const c = w[j];
      if (pos && runePage[pos] === runePage[pos-1] && c === prev) {
        doublets++;
        if (j) withinDoublets++;
        else boundaryDoublets++;
      }
      if (j >= 5 && c === w[j-5]) {
        fifth++;
        fifthGlyphs[c]++;
        if (c === 15) selectedS++;
      }
      if (j >= 6) {
        sixPairs[w[j-6] * 29 + c]++;
        if (c === w[j-5] && w[j-1] === w[j-6]) pairedFifth++;
      }
      prev = c;
    }
  }
  assert.equal(pos, 12956);
  let affineSix = -1, bestA = -1, bestB = -1;
  // Exactly 28 invertible slopes * 29 offsets, reselected on each sample.
  for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
    let count = 0;
    for (let x = 0; x < 29; x++)
      count += sixPairs[29*x + (a*x+b)%29];
    if (count > affineSix) {
      affineSix = count; bestA = a; bestB = b;
    }
  }
  return {
    doublets, withinDoublets, boundaryDoublets, fifth, pairedFifth,
    selectedS, mostFifth: Math.max(...fifthGlyphs),
    affineSix, bestA, bestB
  };
}

const observed = metrics(unknown);
assert.deepEqual(observed, {
  doublets: 86, withinDoublets: 63, boundaryDoublets: 23,
  fifth: 104, pairedFifth: 9, selectedS: 11, mostFifth: 11,
  affineSix: 80, bestA: 27, bestB: 24
});
const rejectionProbability = 1 - 29 * observed.doublets / pagePairs;
assert(rejectionProbability > .80 && rejectionProbability < .82);

/** @param {number} seed @returns {()=>number} */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {()=>number} random @returns {number[]} */
function permutation(random) {
  const p = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
/** @param {number[]} permutation @returns {number[]} */
function invert(permutation) {
  const inverse = Array(29);
  permutation.forEach((v, i) => { inverse[v] = i; });
  return inverse;
}

const tokens = gp.translit.map((value, index) => ({value,index}))
  .sort((a,b) => b.value.length - a.value.length);

/** Preserves the historical GP-native ING/IO contractions.
 * @param {string} raw
 * @returns {Map<number,number[][]>}
 */
function nativePool(raw) {
  const out = new Map();
  for (const natural of raw.toUpperCase().match(/[A-Z]+/g) || []) {
    const s = natural.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    const word = [];
    for (let i = 0; i < s.length;) {
      if (s.startsWith('ING', i)) { word.push(21); i += 3; continue; }
      if (s.startsWith('IO', i)) { word.push(27); i += 2; continue; }
      const match = tokens.find(t => s.startsWith(t.value, i));
      assert(match, 'unknown source GP character: ' + natural);
      word.push(match.index);
      i += match.value.length;
    }
    const bucket = out.get(word.length) || [];
    bucket.push(word);
    out.set(word.length, bucket);
  }
  for (const original of unknown) assert(out.has(original.length));
  return out;
}

/** Produce an exact reversible source-English plant.
 * Q: five shared arbitrary GP29 permutations, D: shared output permutation.
 * Each new printed word receives a uniform independent shift. When an output
 * would immediately repeat the previous ciphertext symbol, reject/redraw
 * the word shift with the one fixed probability learned from original doublets.
 * @param {Map<number,number[][]>} pool
 * @param {()=>number} random
 * @param {boolean} checkInverse
 * @returns {{ counts: ReturnType<typeof metrics>, redraws:number }}
 */
function plant(pool, random, checkInverse) {
  const Q = Array.from({length:5}, () => permutation(random));
  const D = permutation(random);
  const Dinv = invert(D), Qinv = Q.map(invert);
  const cwords = [];
  let previous = -1, redraws = 0;
  for (const template of unknown) {
    const candidates = pool.get(template.length);
    const p = candidates[random() % candidates.length];
    const c = [], shiftHistory = [];
    let shift = random() % 29;
    for (let j = 0; j < p.length; j++) {
      let value = D[(Q[j%5][p[j]] + shift) % 29];
      while (value === previous &&
        random() / 4294967296 < rejectionProbability) {
        shift = random() % 29;
        value = D[(Q[j%5][p[j]] + shift) % 29];
        redraws++;
      }
      c.push(value);
      if (checkInverse) shiftHistory.push(shift);
      previous = value;
    }
    if (checkInverse) {
      const recovered = c.map((value, j) => {
        const symbol = (Dinv[value] - shiftHistory[j] + 29) % 29;
        return Qinv[j%5][symbol];
      });
      assert.deepEqual(recovered, p);
    }
    cwords.push(c);
  }
  return {counts:metrics(cwords),redraws};
}

/**
 * @param {number[]} a
 * @param {number} target
 * @returns {object}
 */
function describe(a, target) {
  const mean = a.reduce((sum,v) => sum+v, 0) / a.length;
  const std = Math.sqrt(a.reduce((sum,v) => sum+(v-mean)**2, 0) / a.length);
  const values = a.slice().sort((x,y) => x-y);
  return {
    mean: Number(mean.toFixed(4)),
    sd: Number(std.toFixed(4)),
    min: values[0],
    median: values[Math.floor(values.length/2)],
    max: values.at(-1),
    atLeastObserved: target === null ? null : a.filter(v => v >= target).length,
    trials: a.length
  };
}

const registrations = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 0x513347ac],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 0xcf0a3e15],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 0x8d6c46de]
];
const trials = 1000;
const fields = [
  'doublets','withinDoublets','boundaryDoublets','fifth','pairedFifth',
  'mostFifth','selectedS','affineSix'
];
const controls = [];
for (const [label, filename, seed] of registrations) {
  const pool = nativePool(read(filename));
  const random = xorshift(seed);
  const samples = [];
  for (let trial = 0; trial < trials; trial++)
    samples.push(plant(pool, random, trial === 0));
  const counts = Object.fromEntries(fields.map(k => [
    k, describe(samples.map(sample => sample.counts[k]), observed[k])
  ]));
  const conditional = samples.filter(sample =>
    Math.abs(sample.counts.doublets - observed.doublets) <= 18 &&
    Math.abs(sample.counts.fifth - observed.fifth) <= 12
  );
  controls.push({
    source: label, sourcePoolLengths: pool.size, trials, seed,
    counts, redraws: describe(samples.map(s => s.redraws), null),
    joint80and11: samples.filter(s =>
      s.counts.affineSix >= observed.affineSix &&
      s.counts.mostFifth >= observed.mostFifth).length,
    conditionedOnNearDoubletsAndFifth: {
      count: conditional.length,
      affineSixAtLeast80: conditional.filter(s =>
        s.counts.affineSix >= observed.affineSix).length,
      mostFifthAtLeast11: conditional.filter(s =>
        s.counts.mostFifth >= observed.mostFifth).length,
      joint: conditional.filter(s =>
        s.counts.affineSix >= observed.affineSix &&
        s.counts.mostFifth >= observed.mostFifth).length
    }
  });
}

console.log(JSON.stringify({
  status: 'Original F1 structural predictive gate; no original plaintext or key',
  mechanism: 'shared D/Q0..4 secret permutations, independently chosen word shifts, collision-triggered word-key redraw',
  source: '55 original rune-bearing pages; 2896 real words; same 12956 symbols',
  fittedParameter: {collisionRejectionProbability: rejectionProbability,
    fit: '86 / 12901 actual same-page adjacent repeats versus ideal 1/29 collision baseline'},
  original: observed,
  positive: 'first full 12956-rune source-native synthetic sample in each corpus recovered by exact inverse with recorded shift history',
  controlledFamilySelection: 'all 812 invertible six-back affine functions maximized independently for each sample',
  controls,
  interpretation: 'Matching original doublet frequency and fifth-back echoes does not alone recover plaintext. Source-language/redraw joint distribution must also account for the independently observed selected-family six-back maximum 80 and glyph-agnostic five-back peak 11. Fully secret or source-selected nonrandom key schedules remain open.'
},null,2));
