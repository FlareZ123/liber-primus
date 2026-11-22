'use strict';
/**
 * Source-selected word-number hypothesis: a prefix/suffix GP29 checksum
 * enciphered by an unknown affine alphabet plus a position-dependent,
 * word-reset additive key. All secret multipliers, offsets and checksum
 * residues disappear from the three necessary length-conditioned invariants.
 *
 * Node 22, standard library only. Run from any directory as a repo script.
 */
const assert = require('node:assert/strict');
const {loadWords} = require('./word_partition_invariant.cjs');
const MIN = 2, MAX = 11, M = 29;
const VARIANTS = ['prefix=sum(body)', 'suffix=sum(body)', 'whole-word zero sum'];

/** @param {number} x @returns {number} */
const mod = x => (x % M + M) % M;

/** @param {number[]} word @returns {number[]} */
function invariants(word) {
  const sum = word.reduce((a,b) => a + b, 0);
  return [mod(2 * word[0] - sum), mod(2 * word[word.length - 1] - sum), mod(sum)];
}

/** @param {number[][]} words @returns {object} */
function audit(words) {
  const byLength = Array.from({length: MAX + 1}, () => []);
  for (const word of words) if (word.length >= MIN && word.length <= MAX)
    byLength[word.length].push(word);
  const rows = [];
  let total = 0, maxConsistent = 0;
  for (let length = MIN; length <= MAX; length++) {
    const group = byLength[length];
    if (group.length < 25) continue;
    const bins = Array.from({length: 3}, () => new Uint32Array(M));
    for (const word of group) {
      const residues = invariants(word);
      for (let variant = 0; variant < 3; variant++) bins[variant][residues[variant]]++;
    }
    let best = {model: '', residue: -1, matches: -1};
    for (let variant = 0; variant < 3; variant++)
      for (let residue = 0; residue < M; residue++)
        if (bins[variant][residue] > best.matches) best = {
          model: VARIANTS[variant], residue, matches: bins[variant][residue]
        };
    total += group.length;
    maxConsistent += best.matches;
    rows.push({length, n: group.length, ...best});
  }
  return {total, maxConsistent, fraction: maxConsistent / total, rows};
}

/** @param {number} seed @returns {()=>number} */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Generate a word-length-matched stream with an authentic checksum rule.
 * Original word lengths and word order are preserved, including singletons.
 * The reversible stream before doublet repairs is C=(11*P+k_position) mod29.
 * An 81% repair of an attempted immediate duplicate overwrites one output
 * rune without altering the printed word length, as in prior project controls.
 * @param {number[][]} exemplar
 * @param {number} seed
 * @returns {{words:number[][],rawRepeat:number,repaired:number,finalRepeat:number}}
 */
function plant(exemplar, seed) {
  const random = randomGenerator(seed);
  const keys = Array.from({length: Math.max(...exemplar.map(w => w.length))},
    () => Math.floor(random() * M));
  let prev = -1, rawRepeat = 0, repaired = 0, finalRepeat = 0;
  const out = [];
  for (const original of exemplar) {
    const length = original.length;
    const plain = Array.from({length: Math.max(0, length - 1)},
      () => Math.floor(random() * M));
    plain.push(mod(plain.reduce((sum, x) => sum + x, 0)));
    const ciphertext = [];
    for (let j = 0; j < length; j++) {
      let value = mod(11 * plain[j] + keys[j]);
      if (value === prev) {
        rawRepeat++;
        if (random() < 0.81) {
          value = mod(value + 1 + Math.floor(random() * 28));
          repaired++;
        }
      }
      if (value === prev) finalRepeat++;
      ciphertext.push(value);
      prev = value;
    }
    out.push(ciphertext);
  }
  return {words: out, rawRepeat, repaired, finalRepeat};
}

/** @param {number[][]} exemplar @param {number} seed */
function nullCorpus(exemplar, seed) {
  const random = randomGenerator(seed);
  let prev = -1;
  return exemplar.map(word => Array.from({length: word.length}, () => {
    let value = Math.floor(random() * M);
    if (value === prev && random() < 0.81)
      value = mod(value + 1 + Math.floor(random() * 28));
    prev = value;
    return value;
  }));
}

function main() {
  const words = loadWords().cipher;
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((sum,w) => sum + w.length, 0), 12956);
  const original = audit(words);
  assert.equal(original.total, 2788);
  assert.equal(original.maxConsistent, 181);

  const planted = plant(words, 0x20163301);
  const positive = audit(planted.words);
  assert(positive.fraction > 0.75,
    'A true affine word-checksum control should be distinguishable after repairs');
  const scores = Array.from({length:128}, (_,i) =>
    audit(nullCorpus(words, (0x19315301 + i*0x9e3779b1) >>> 0)).maxConsistent);
  scores.sort((a,b) => a-b);
  const outcome = {
    originalRuneCount: 12956,
    originalWordCount: words.length,
    hypothesis: 'One GP29 sum checksum rune per word, with length-wise arbitrary secret affine/position-reset key; allow checksum at first or last and either sign',
    variants: VARIANTS,
    original,
    positive: {audit:positive, ...Object.fromEntries(Object.entries(planted).filter(([key])=>key !== 'words'))},
    matchedNoRepeatNull: {
      repetitions: scores.length, min: scores[0], median: scores[64], max: scores[127],
      geOriginal: scores.filter(x=>x>=original.maxConsistent).length
    },
    decision: 'No majority-of-words checksum under this family; 181/2788 is an exact best-case capacity bound, after granting distinct model and residue for each length. Moving word-specific keys or a separately encrypted checksum are outside the test.'
  };
  console.log(JSON.stringify(outcome, null, 2));
  return outcome;
}
if (require.main === module) main();
module.exports = {mod, invariants, audit, plant, nullCorpus, main};
