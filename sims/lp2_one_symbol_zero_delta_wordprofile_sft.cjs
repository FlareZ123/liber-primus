'use strict';
/**
 * Original-input key-independent exclusion of a reserved GP29 plaintext
 * marker for adjacent identical ciphertext runes.
 *
 * Tested evolving-key family:
 *   C_i == C_(i-1) iff P_i == s, for one unknown global fixed s in GP29,
 *   i >= 1. All other 28 outputs can use arbitrary position-dependent secret
 *   keys, clocks, permutations, and output matrices, provided this iff holds.
 *
 * The original position profile [total,start-of-word,end-of-word] is exact,
 * independent of every such key. The one unknown first plaintext rune is
 * excluded in source and controls. Native-GP English controls are independently
 * drawn by *every original printed word length*. A synthetic variable-key
 * 29-state full encoder proves the positive implementation.
 *
 * Windows Node22 SFT: node sims/lp2_one_symbol_zero_delta_wordprofile_sft.cjs
 * Source-native English comparison is conditional and cannot rule out
 * different languages, exceptional escape semantics or added sidebands.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
  .replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const byGlyph = new Map(gp.runes.map((r, i) => [r, i]));
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const joined = transcription.split('%').slice(0, 55).join('')
  .replace(/\/\n/g, '').replace(/\n/g, '');
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const originalWords = (joined.match(runePattern) || [])
  .map(w => Array.from(w, r => byGlyph.get(r)));
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flat(), original);

const lens = Array(15).fill(0);
for (const w of originalWords) lens[w.length]++;
assert.deepEqual(lens.slice(1),
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

/**
 * @param {number[][]} words
 * @returns {{T:number,B:number,E:number}}
 */
function eventProfile(words) {
  const result = {T:0, B:0, E:0};
  let prev = -1;
  for (const w of words) {
    for (let i = 0; i < w.length; i++) {
      if (w[i] === prev) {
        result.T++;
        if (i === 0) result.B++;
        if (i === w.length - 1) result.E++;
      }
      prev = w[i];
    }
  }
  return result;
}
const target = eventProfile(originalWords);
assert.deepEqual(target, {T:86, B:23, E:19});

/**
 * Marker occurrence profile of every possible fixed secret GP29 rune.
 * The first plaintext position is freely unencrypted and not charged.
 * @param {number[][]} words
 */
function markerProfiles(words) {
  const out = Array.from({length:29}, () => ({T:0,B:0,E:0}));
  let count = 0;
  for (const w of words) {
    for (let j = 0; j < w.length; j++) {
      if (count++ === 0) continue;
      const record = out[w[j]];
      record.T++;
      if (j === 0) record.B++;
      if (j === w.length - 1) record.E++;
    }
  }
  return out;
}

/** @param {number} seed */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/** @param {number[][][]} banks @param {()=>number} rnd */
function matchedPlant(banks, rnd) {
  const result = [];
  for (const originalWord of originalWords) {
    const bank = banks[originalWord.length];
    assert(bank.length > 0, 'missing native GP length ' + originalWord.length);
    result.push(bank[Math.floor(rnd() * bank.length)]);
  }
  return result;
}
/** @param {number[][][]} banks */
function meansAndVariance(banks) {
  const avg = Array.from({length:29}, () => ({T:0,B:0,E:0}));
  const variance = Array.from({length:29}, () => ({T:0,B:0,E:0}));
  for (let L = 1; L < lens.length; L++) {
    const b = banks[L];
    for (let z = 0; z < 29; z++) {
      const one = {T:0,B:0,E:0}, squares = {T:0,B:0,E:0};
      for (const w of b) {
        const values = {
          T:w.filter(x => x === z).length,
          B:Number(w[0] === z),
          E:Number(w[w.length - 1] === z)
        };
        for (const k of ['T','B','E']) {
          one[k] += values[k];
          squares[k] += values[k] * values[k];
        }
      }
      for (const k of ['T','B','E']) {
        const mu = one[k] / b.length;
        avg[z][k] += lens[L] * mu;
        variance[z][k] += lens[L] *
          (squares[k] / b.length - mu * mu);
      }
    }
  }
  // Correction: original position 0 is not an implied escape event.
  // The first word is one of the L=8 words. Remove its first-rune mean,
  // and its Bernoulli variance; the terminal event remains eligible.
  const firstLength = originalWords[0].length;
  assert.equal(firstLength, 8);
  for (let z = 0; z < 29; z++) {
    const f = banks[firstLength].filter(w => w[0] === z).length /
      banks[firstLength].length;
    avg[z].T -= f;
    avg[z].B -= f;
    variance[z].T -= f * (1 - f);
    variance[z].B -= f * (1 - f);
  }
  return {avg, variance};
}

/**
 * Select the most compatible of all 29 *unknown* secret marker identities
 * and charge the most discrepant of three predeclared original statistics.
 * @param {{T:number,B:number,E:number}[]} sample
 * @param {{avg:object[],variance:object[]}} stats
 */
function bestScore(sample, stats) {
  let best = {rune:-1, z:Infinity, coordinates:{}};
  for (let rune = 0; rune < 29; rune++) {
    const coordinates = {};
    for (const k of ['T','B','E']) {
      const variance = Math.max(stats.variance[rune][k], 0.01);
      coordinates[k] = Math.abs(sample[rune][k] -
        stats.avg[rune][k]) / Math.sqrt(variance);
    }
    const z = Math.max(coordinates.T, coordinates.B, coordinates.E);
    if (z < best.z) best = {rune,z,coordinates};
  }
  return best;
}
/**
 * A complete evolving-key GP29 bijection with distinguished rune 28.
 * Every non-marker plaintext rune has a position-dependent secret rotation.
 * @param {number[]} plaintext
 * @param {number[]} keys
 */
function encrypt(plaintext, keys) {
  const out = [plaintext[0]];
  for (let i = 1; i < plaintext.length; i++) {
    const p = plaintext[i], prev = out[i - 1];
    out.push(p === 28 ? prev :
      (prev + 1 + ((p + keys[i]) % 28)) % 29);
  }
  return out;
}
/** @param {number[]} ciphertext @param {number[]} keys */
function decrypt(ciphertext, keys) {
  const out = [ciphertext[0]];
  for (let i = 1; i < ciphertext.length; i++) {
    const delta = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
    out.push(delta === 0 ? 28 :
      (delta - 1 - keys[i] + 56) % 28);
  }
  return out;
}
const corpora = [
  ['Gibran','resources/control/gibran_prophet_58585.txt',0x79211eab],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',0x79211eef]
];
const results = [];
for (const [name, filename, seed] of corpora) {
  const controls = (read(filename).toUpperCase().match(/[A-Z]+/g) || [])
    .map(encodeSourceNativeGP);
  const banks = Array.from({length:15}, () => []);
  for (const w of controls)
    if (w.length < banks.length) banks[w.length].push(w);
  const stats = meansAndVariance(banks);
  const observed = bestScore(Array.from({length:29}, () => target), stats);
  const rnd = random(seed);
  const SAMPLES = 2000;
  let exceed = 0;
  let maxControl = 0;
  for (let k = 0; k < SAMPLES; k++) {
    const plant = matchedPlant(banks, rnd);
    const score = bestScore(markerProfiles(plant), stats).z;
    if (score >= observed.z) exceed++;
    maxControl = Math.max(maxControl, score);
  }
  assert.equal(exceed, 0,
    'matched native GP control should not replicate source event profile');
  assert(observed.z > 6, 'distinct source event mismatch');
  const positive = matchedPlant(banks, rnd);
  const plain = positive.flat();
  assert.equal(plain.length, 12956);
  const k = plain.map(() => Math.floor(rnd() * 28));
  const ciphertext = encrypt(plain, k);
  assert.deepEqual(decrypt(ciphertext, k), plain);
  assert.deepEqual(encrypt(decrypt(ciphertext, k), k), ciphertext);
  let offset = 0;
  const cipherWords = positive.map(w => {
    const result = ciphertext.slice(offset, offset + w.length);
    offset += w.length;
    return result;
  });
  assert.equal(offset, ciphertext.length);
  assert.deepEqual(eventProfile(cipherWords), markerProfiles(positive)[28]);
  results.push({
    corpus:name,
    sampledSourceNativeWordMatchedControls:SAMPLES,
    worstOriginalRunicMarker:gp.translit[observed.rune],
    bestOriginalSigmaDiscrepancy:observed.z,
    componentSigma:observed.coordinates,
    maxNativeControlSigmaDiscrepancy:maxControl,
    controlAtLeastAsExtreme:exceed,
    evolvingKeyPositiveGP29Runes:plain.length,
    positiveRecoveredExactly:true
  });
}
console.log(JSON.stringify({
  status:'PASS: bounded full-secret special-marker family excluded for tested GP-native registers; zero unknown plaintext',
  source:{runes:original.length, words:originalWords.length,
    adjacentEqualProfile:target},
  corpora:results,
  caveat:'The iff rule is a hypothesis; source authorship, nonnative text, other escape rules and non-GP intermediates remain open.'
}, null, 2));
