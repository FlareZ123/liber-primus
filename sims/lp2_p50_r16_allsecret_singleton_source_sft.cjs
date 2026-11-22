'use strict';

/**
 * SFT: every hidden GP29 state of the source p50 degree-16 cofactor, both
 * recurrence directions, rune and word clocks, with two unknown singleton
 * plaintext symbols. Native GP English ordinarily has one-letter A/I words.
 *
 * Source hypothesis: C_i = sigma(P_i) + K_clock(i) modulo29, where sigma is
 * any fixed 29-symbol permutation and K obeys the original table factor R16.
 * The exhaustive constraint solver never guesses a seed or output alphabet.
 *
 * Run: node sims/lp2_p50_r16_allsecret_singleton_source_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const q = 29;
const mod = x => (x % q + q) % q;
const inverse = new Uint8Array(q);
for (let a = 1; a < q; a++) {
  for (let b = 1; b < q; b++) {
    if (a * b % q === 1) inverse[a] = b;
  }
}
const factor16 = [13, 20, 26, 12, 6, 2, 13, 26, 6, 26,
  11, 7, 15, 11, 17, 25, 1];
const otherDirection = factor16.slice().reverse();

/** Preserve actual rune-word boundaries through physical line/page wraps. */
function originalWords() {
  const symbol = new Map(corpus.runes.map((r, i) => [r, i]));
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  function finish() {
    if (current.length === 0) return;
    words.push({start, runes:current});
    current = [];
  }
  for (const ch of transcript.split('%').slice(0, 55).join('%')) {
    if (symbol.has(ch)) {
      if (current.length === 0) start = offset;
      current.push(symbol.get(ch));
      offset++;
    } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Pure layout markers leave a word open.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(offset, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(w => w.runes.length === 1).length, 83);
  assert.deepEqual(
    words.flatMap(w => w.runes),
    corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
  return words;
}

/** Original table must actually be divisible by the proposed cofactor. */
function checkOriginalFactor() {
  const bytes = grid.pages.flatMap(p => p.bytes);
  assert.equal(bytes.length, 256);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes))
    .digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  assert.deepEqual(grid.bytes, bytes);
  const polynomial = bytes.map(b => b % q).reverse();
  for (let i = polynomial.length - 1; i >= 16; i--) {
    const lead = polynomial[i];
    for (let j = 0; j <= 16; j++) {
      polynomial[i - 16 + j] = mod(
        polynomial[i - 16 + j] - lead * factor16[j]);
    }
  }
  assert.ok(polynomial.slice(0, 16).every(v => v === 0));
  assert.equal(factor16[16], 1);
}

/** @param {number[]} coeffs GP29 characteristic polynomial, ascending. */
function coefficientRows(coeffs, length) {
  const normalized = coeffs.map(a => mod(a * inverse[coeffs[16]]));
  const rows = [];
  for (let i = 0; i < 16; i++) {
    const row = new Uint8Array(16);
    row[i] = 1;
    rows.push(row);
  }
  for (let t = 16; t < length; t++) {
    const row = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      let sum = 0;
      for (let k = 0; k < 16; k++) {
        sum += normalized[k] * rows[t - 16 + k][j];
      }
      row[j] = mod(-sum);
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Exhaustive field-linear constraint solver without seed enumeration.
 * For each singleton j, either row(t_j)*seed+uA=C_j or
 * row(t_j)*seed+uI=C_j. The two unknown values are arbitrary, covering
 * the two singleton letters under every secret fixed GP29 substitution.
 * First occurrence is labelled A without loss of generality.
 *
 * @param {{clock:number,c:number}[]} anchors
 * @param {number[][] | Uint8Array[]} rows
 * @param {number[] | null} truth Exact planted seed and hidden values.
 */
function solveSingletons(anchors, rows, truth = null) {
  const n = 18;
  const basis = Array(n).fill(null);
  const counts = Array(anchors.length + 1).fill(0);
  const anchorRows = anchors.map(({clock}) => rows[clock]);
  let maxPrefix = 0;
  let completeAssignments = 0;
  let exactPlantedRecovery = false;

  function decodeFullState() {
    const state = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const row = basis[i];
      if (!row) continue;
      let remainder = row[n];
      for (let k = i + 1; k < n; k++) {
        remainder -= row[k] * state[k];
      }
      state[i] = mod(remainder);
    }
    return state;
  }

  function search(index) {
    counts[index]++;
    if (index > maxPrefix) maxPrefix = index;
    if (index === anchors.length) {
      completeAssignments++;
      if (truth) {
        const recovered = decodeFullState();
        if (recovered.every((v, j) => v === truth[j])) {
          exactPlantedRecovery = true;
        }
      }
      return;
    }
    const {c} = anchors[index];
    const opts = index === 0 ? [16] : [16, 17];
    for (const selector of opts) {
      const value = new Uint8Array(n + 1);
      value.set(anchorRows[index]);
      value[selector] = 1;
      value[n] = c;
      let pivot = -1;
      for (let j = 0; j < n; j++) {
        if (value[j] === 0) continue;
        const previous = basis[j];
        if (previous) {
          const multiplier = value[j];
          for (let k = j; k <= n; k++) {
            value[k] = mod(value[k] - multiplier * previous[k]);
          }
        } else {
          const multiplier = inverse[value[j]];
          for (let k = j; k <= n; k++) {
            value[k] = mod(value[k] * multiplier);
          }
          pivot = j;
          basis[j] = value;
          break;
        }
      }
      if (pivot >= 0 || value[n] === 0) {
        search(index + 1);
      }
      if (pivot >= 0) basis[pivot] = null;
    }
  }
  search(0);
  return {
    maxCompatibleSingletonPrefix: maxPrefix,
    totalBranchesExplored: counts.reduce((a, b) => a + b, 0),
    completeAssignments,
    exactPlantedRecovery,
    countsToFirstFailure: counts.slice(0, Math.min(25, maxPrefix + 2))
  };
}

/** Full-length exact GP29 positive plaintext, including all 83 singleton A/I. */
function plantedControl(words, coeffRows, clockType) {
  const native = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(native.length, 95);
  const plain = Array.from({length:12956}, (_, i) => native[i % native.length]);
  const anchorSource = [];
  let ordinal = 0;
  for (const word of words) {
    if (word.runes.length === 1) {
      plain[word.start] = anchorSource.length % 2 === 0 ? 24 : 10;
      anchorSource.push(word.start);
    }
    ordinal++;
  }
  assert.equal(anchorSource.length, 83);
  const secretSeed = Array.from({length:16}, (_, i) => (7 * i + 3) % q);
  const secret = [...secretSeed, 7, 21];
  const keyAt = t => mod(coeffRows[t].reduce(
    (total, value, j) => total + value * secretSeed[j], 0));
  const cipher = [];
  const recovered = [];
  const anchors = [];
  for (let w = 0; w < words.length; w++) {
    for (let i = 0; i < words[w].runes.length; i++) {
      const t = clockType === 'rune' ? words[w].start + i : w;
      const p = plain[words[w].start + i];
      const c = mod(2 - p + keyAt(t));
      cipher.push(c);
      recovered.push(mod(2 - mod(c - keyAt(t))));
    }
    if (words[w].runes.length === 1) {
      anchors.push({
        clock:clockType === 'rune' ? words[w].start : w,
        c:cipher[words[w].start]
      });
    }
  }
  assert.deepEqual(recovered, plain);
  assert.equal(cipher.length, 12956);
  assert.equal(anchors.length, 83);
  const result = solveSingletons(anchors, coeffRows, secret);
  assert.equal(result.completeAssignments, 1);
  assert.equal(result.maxCompatibleSingletonPrefix, 83);
  assert.equal(result.exactPlantedRecovery, true);
  return {
    recoveredPlaintextRunes: recovered.length,
    singletonCribs: anchors.length,
    completeStates: result.completeAssignments,
    exactKnownSeedAndAlphabet: result.exactPlantedRecovery
  };
}

function run() {
  checkOriginalFactor();
  const words = originalWords();
  const result = [];
  for (const [direction, polynomial] of [
    ['cofactor', factor16],
    ['reciprocal', otherDirection]
  ]) {
    for (const clockType of ['rune', 'word']) {
      const anchors = words.flatMap((word, w) => (
        word.runes.length === 1 ? [{
          clock:clockType === 'rune' ? word.start : w,
          c:word.runes[0]
        }] : []));
      const maxClock = clockType === 'rune' ? 12956 : words.length;
      const rows = coefficientRows(polynomial, maxClock);
      const original = solveSingletons(anchors, rows);
      assert.equal(original.completeAssignments, 0);
      const positive = plantedControl(words, rows, clockType);
      result.push({direction, clockType, original, positive});
    }
  }
  return {
    status:'NO original LP2 solution for either order-16 direct additive key family',
    source:'unchanged original p49-p51 256-byte GF29 table degree16 divisor',
    originalUnknownRunes:12956,
    originalWordCount:words.length,
    originalOneRuneWords:83,
    model:'all 29^16 seeds, unknown fixed singleton-substitution labels, two LFSR directions and both whole-book clocks',
    results:result
  };
}
if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {run, solveSingletons, coefficientRows};
