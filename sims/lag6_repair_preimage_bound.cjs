'use strict';

/**
 * Constructive non-injectivity proof for the published M1 sparse LP2
 * collision-repair transform, on the original 55 unsolved rune-bearing pages.
 *
 * Even if the encryption pad is known and removed, an output satisfying
 * C[i]=T(C[i-6]) with T(C[i-6])!=C[i-1] can have arisen from:
 *  (A) raw=output; or
 *  (B) raw=previous output and a collision repaired to the target.
 * Each eligible event doubles the count of compatible unfiltered streams.
 *
 * Run: node sims/lag6_repair_preimage_bound.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {readWords, T} = require('./lag6_sparse_collision_repair.cjs');

const root = path.resolve(__dirname, '..');
const corpus = fs.readFileSync(path.join(root,
  'resources/lp2-transcription.txt'), 'utf8');
const words = readWords(corpus).words;

/** @param {number[][]} ciphertext */
function candidateSites(ciphertext) {
  const sites = [];
  let hits = 0;
  for (let wi = 0; wi < ciphertext.length; wi++) {
    const word = ciphertext[wi];
    for (let i = 6; i < word.length; i++) {
      const target = T(word[i-6]);
      if (word[i] !== target) continue;
      hits++;
      if (target !== word[i-1]) sites.push([wi, i]);
    }
  }
  return {sites, hits};
}

/** @param {number[][]} reference Known output.
 *  @param {Array<[number,number]>} chosen Subset of source-ambiguity sites. */
function constructRaw(reference, chosen) {
  const raw = reference.map(word => word.slice());
  const mask = reference.map(word => new Uint8Array(word.length));
  for (const [wi, i] of chosen) {
    raw[wi][i] = reference[wi][i-1];
    mask[wi][i] = 1;
  }
  return {raw, mask};
}

/** @param {number[][]} raw Inputs to the repair map.
 *  @param {Uint8Array[]} mask For each position, choose collision repair. */
function reencrypt(raw, mask) {
  const output = [];
  let prev = -1;
  for (let wi = 0; wi < raw.length; wi++) {
    const word = [], values = raw[wi];
    for (let i = 0; i < values.length; i++) {
      let c = values[i];
      if (c === prev && mask[wi][i]) {
        if (i < 6) throw new Error('Ambiguous site must lie at position >=6');
        c = T(word[i-6]);
        if (c === prev) throw new Error('Ambiguous target cannot be previous rune');
      }
      word.push(c);
      prev = c;
    }
    output.push(word);
  }
  return output;
}

/** @param {number[][]} left
 *  @param {number[][]} right */
function equalWords(left, right) {
  if (left.length !== right.length) return false;
  return left.every((word, i) => word.length === right[i].length &&
    word.every((value, j) => value === right[i][j]));
}

const {sites, hits} = candidateSites(words);
assert.equal(hits, 80);
assert.equal(sites.length, 79);
const zero = constructRaw(words, []);
assert.ok(equalWords(reencrypt(zero.raw, zero.mask), words));

const all = constructRaw(words, sites);
assert.ok(equalWords(reencrypt(all.raw, all.mask), words));
const changed = all.raw.flat().filter((value, i) => value !==
  words.flat()[i]).length;
assert.equal(changed, 79);
for (const site of sites) {
  const trial = constructRaw(words, [site]);
  assert.ok(equalWords(reencrypt(trial.raw, trial.mask), words));
}

const repairProbability = 1 - 29 * 86 / 12955;
const q = repairProbability / (1 + repairProbability);
const entropyBit = -q * Math.log2(q) - (1-q) * Math.log2(1-q);
process.stdout.write(JSON.stringify({
  proof:'Two distinct raw rune options at each qualifying site; all 79 individually and jointly reconstructed',
  source:'First 55 unsolved LP2 rune records, 2896 words',
  affineMatches:hits,
  matchedPreviousCipherRune:hits-sites.length,
  independentBinaryChoiceSites:sites.length,
  distinctRawStreamLowerBound:'2^79',
  base10LogLowerBound:sites.length * Math.log10(2),
  posterior:{
    assumptions:'iid uniform raw rune and independent per-collision repair with probability p',
    p:repairProbability,
    collisionRepairProbabilityGivenAffineOutput:q,
    binaryShannonEntropyBitsPerAmbiguousPosition:entropyBit,
    totalConditionalAmbiguityBits:sites.length * entropyBit
  }
}, null, 2) + '\n');
