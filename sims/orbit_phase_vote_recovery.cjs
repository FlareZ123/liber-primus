'use strict';

/**
 * Recover an unknown shared six-lane key in the 28-cycle of
 * T(x) = 24 - 2*x (mod 29), despite arbitrary per-word rotor offsets.
 *
 * Hypothesis: C[w,i] = T^(s_w + floor(i/6) + q[i%6])(P[w,i]).
 * First five letters eliminate s_w; dictionary cribs vote on four
 * independent key differences q[1]-q[0] ... q[4]-q[0].
 * A sixth position can identify q[5]-q[0].
 *
 * The exact same attack is evaluated on genuine LP2, plus independent
 * held-out Shakespeare plaintext encrypted with known phases and
 * deliberate ciphertext doublet repair. No claimed LP2 decryption.
 *
 * @module orbit_phase_vote_recovery
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const CORPUS = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ALPHABET = new Map(CORPUS.runes.map((r, i) => [r, i]));
const ROMAN = new Map(CORPUS.translit.map((r, i) => [r, i]));
const SOURCE = read('resources/lp2-transcription.txt');
const ENGLISH = read('resources/control/shakespeare_first300k.txt');
const KEY = [0, 7, 11, 16, 23, 5];
const SEED = 0x201183;
const mod28 = x => ((x % 28) + 28) % 28;

/** @param {number} x Rune index in the canonical GP alphabet. */
function T(x) { return (24 - 2 * x + 58) % 29; }

const ORBIT = [];
const LOG = Array(29).fill(-1);
{
  let x = 0;
  for (let i = 0; i < 28; i++) {
    assert.equal(LOG[x], -1);
    ORBIT.push(x);
    LOG[x] = i;
    x = T(x);
  }
  assert.equal(x, 0);
  assert.equal(T(8), 8);
  assert.equal(LOG[8], -1);
}

/** @param {string} raw Complete rune transcript with % page separators. */
function parseLP2(raw) {
  const text = raw.split('%').slice(0, 55).join('%')
    .replace(/[\r\n\t\/% ]/g, '');
  const words = text.split(/[-.&$§0-9]+/).filter(Boolean).map(word =>
    [...word].map(rune => {
      const index = ALPHABET.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
  return words;
}

/**
 * Greedy standard GP phonetic transliteration of one Latin word.
 * @param {string} source Uppercase Latin word.
 * @returns {number[]|null}
 */
function encode(source) {
  const latin = source.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < latin.length;) {
    const two = ROMAN.get(latin.slice(i, i + 2));
    const one = ROMAN.get(latin[i]);
    if (two !== undefined) { result.push(two); i += 2; }
    else if (one !== undefined) { result.push(one); i++; }
    else return null;
  }
  return result;
}

/** @param {string} text Latin language-model source. */
function englishTokens(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode).filter(word => word !== null && word.length > 0);
}

/** @param {number[][]} words Reference rune words. */
function groupByLength(words) {
  const seen = new Map();
  for (const word of words) {
    if (word.length < 5 || word.length > 14) continue;
    const key = word.join(',');
    if (!seen.has(key)) seen.set(key, word);
  }
  const out = new Map();
  for (const word of seen.values()) {
    if (!out.has(word.length)) out.set(word.length, []);
    out.get(word.length).push(word);
  }
  return out;
}

/**
 * @param {number[]} cipher At least five ciphertext runes.
 * @param {number[]} plain Candidate GP English rune sequence.
 * @returns {number} Packed relative phase signature, or -1 when
 * a fixed-point rune prevents its determination.
 */
function signature5(cipher, plain) {
  if (cipher.length < 5 || plain.length !== cipher.length) return -1;
  for (let i = 0; i < 5; i++) {
    if (cipher[i] === 8 || plain[i] === 8) return -1;
  }
  const phase0 = mod28(LOG[cipher[0]] - LOG[plain[0]]);
  let key = 0;
  let radix = 1;
  for (let i = 1; i < 5; i++) {
    const relative = mod28(LOG[cipher[i]] - LOG[plain[i]] - phase0);
    key += radix * relative;
    radix *= 28;
  }
  return key;
}

/** @param {number} code A packed four-component base28 signature. */
function unpack(code) {
  const q = [0];
  for (let i = 1; i < 5; i++) {
    q.push(code % 28);
    code = Math.floor(code / 28);
  }
  return q;
}

/**
 * Count votes for every relative key signature over independently chosen
 * words in one manuscript split; duplicates in the English dictionary
 * are removed before voting.
 * @param {number[][]} words Ciphertext words.
 * @param {Map<number, number[][]>} dictionary Word-length lookup.
 * @param {number} first Inclusive word offset.
 * @param {number} last Exclusive word offset.
 */
function vote(words, dictionary, first, last) {
  const counts = new Map();
  let pairs = 0;
  let eligibleWords = 0;
  for (let i = first; i < last; i++) {
    const c = words[i];
    const candidates = dictionary.get(c.length);
    if (!candidates || c.slice(0, 5).includes(8)) continue;
    eligibleWords++;
    for (const p of candidates) {
      const code = signature5(c, p);
      if (code < 0) continue;
      counts.set(code, (counts.get(code) || 0) + 1);
      pairs++;
    }
  }
  const ranked = [...counts].sort((a, b) => b[1] - a[1]);
  return {counts, pairs, eligibleWords, ranked};
}

/**
 * Use the sixth rune to recover q[5]-q[0] under a specific four-phase
 * signature; the sixth rune must also be outside T's fixed point.
 * @param {number[][]} words
 * @param {Map<number,number[][]>} dictionary
 * @param {number} first
 * @param {number} last
 * @param {number} key Signature from signature5.
 */
function voteSixth(words, dictionary, first, last, key) {
  const q = Array(28).fill(0);
  for (let i = first; i < last; i++) {
    const c = words[i];
    if (c.length < 6 || c[5] === 8) continue;
    for (const p of dictionary.get(c.length) || []) {
      if (p[5] === 8 || signature5(c, p) !== key) continue;
      const phase0 = mod28(LOG[c[0]] - LOG[p[0]]);
      q[mod28(LOG[c[5]] - LOG[p[5]] - phase0)]++;
    }
  }
  return q;
}

/** @param {number} seed Deterministic nonzero unsigned 32-bit seed. */
function random32(seed) {
  let state = seed >>> 0;
  assert.notEqual(state, 0);
  return function draw() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Generate genuine GP-English words with the exact LP2 word lengths,
 * one random word rotor offset, one shared six-phase key, and an 81%
 * ciphertext collision-replacement rule.
 *
 * The source words come from the held-out 60k-character Shakespeare slice.
 * @param {number[][]} layout LP2 ciphertext word lengths.
 * @param {number[][]} heldout Source words.
 * @param {() => number} draw RNG.
 * @returns {{words:number[][],replaced:number,total:number}}
 */
function plant(layout, heldout, draw) {
  const pool = new Map();
  for (const word of heldout) {
    if (!pool.has(word.length)) pool.set(word.length, []);
    pool.get(word.length).push(word);
  }
  let replaced = 0;
  let total = 0;
  let previous = -1;
  const output = layout.map(source => {
    const alternatives = pool.get(source.length);
    assert.ok(alternatives && alternatives.length > 0,
      'No held-out reference of word length ' + source.length);
    const plain = alternatives[draw() % alternatives.length];
    const offset = draw() % 28;
    return plain.map((p, i) => {
      let c = p === 8 ? 8 :
        ORBIT[mod28(LOG[p] + offset + KEY[i % 6] + Math.floor(i / 6))];
      if (c === previous && draw() % 10000 < 8100) {
        const other = draw() % 28;
        c = other >= previous ? other + 1 : other;
        replaced++;
      }
      previous = c;
      total++;
      return c;
    });
  });
  return {words: output, replaced, total};
}

/** @param {ReturnType<typeof vote>} result @param {number} [take=4] */
function leading(result, take = 4) {
  return result.ranked.slice(0, take).map(([signature, count]) =>
    ({signature, relativeKey: unpack(signature), votes: count}));
}

function run() {
  const words = parseLP2(SOURCE);
  const dictionaryWords = englishTokens(ENGLISH.slice(0, 240000));
  const reference = groupByLength(dictionaryWords);
  const heldout = englishTokens(ENGLISH.slice(240000));
  const split = 1448;
  const realTraining = vote(words, reference, 0, split);
  const realTest = vote(words, reference, split, words.length);
  const trainingSignature = realTraining.ranked[0][0];
  const testSignature = realTest.ranked[0][0];
  const draw = random32(SEED);
  const synthetic = plant(words, heldout, draw);
  const plantTraining = vote(synthetic.words, reference, 0, split);
  const plantTest = vote(synthetic.words, reference, split, words.length);
  const known = KEY.slice(1, 5).reduce((n, value, i) =>
    n + value * 28 ** i, 0);

  assert.equal(plantTraining.ranked[0][0], known,
    'Known phase key missing from planted training');
  assert.equal(plantTest.ranked[0][0], known,
    'Known phase key missing from planted holdout');
  assert.ok((plantTest.counts.get(known) || 0) > 40,
    'Planted true key has inadequate heldout evidence');

  const phase6True = voteSixth(synthetic.words, reference, 0, split, known);
  assert.equal(phase6True.indexOf(Math.max(...phase6True)), KEY[5],
    'Sixth planted key phase was not recovered');

  return {
    schema: 1,
    inputSha256: createHash('sha256').update(SOURCE).digest('hex'),
    reference: 'Shakespeare GP words; first 240,000 chars train; last 60,000 plant',
    hypothesis: 'T(x)=24-2x mod29; per-word unknown T offset; global six-lane key',
    dictionaryDistinctGPWordTypes: [...reference.values()]
      .reduce((n, group) => n + group.length, 0),
    manuscript: {words: words.length, runeCount: 12956},
    genuine: {
      firstHalf: {eligibleWords: realTraining.eligibleWords,
        wordDictionaryComparisons: realTraining.pairs,
        top: leading(realTraining)},
      secondHalf: {eligibleWords: realTest.eligibleWords,
        wordDictionaryComparisons: realTest.pairs,
        top: leading(realTest)},
      firstHalfBestSignatureVotesInUntouchedSecondHalf:
        realTest.counts.get(trainingSignature) || 0,
      reverseHoldoutVotes:
        realTraining.counts.get(testSignature) || 0,
      firstHalfSixthPhaseVotes: voteSixth(words, reference,
        0, split, trainingSignature),
      decipherment: 'No shared recovered phase key or LP2 plaintext'
    },
    syntheticPositive: {
      seed: '0x' + SEED.toString(16),
      trueKey: KEY,
      trueRelativeSignature: known,
      ciphertextReplacements: synthetic.replaced,
      generatedRunes: synthetic.total,
      firstHalf: leading(plantTraining),
      secondHalf: leading(plantTest),
      trueSignatureFirstVotes: plantTraining.counts.get(known) || 0,
      trueSignatureHeldoutVotes: plantTest.counts.get(known) || 0,
      sixthPhaseVotes: phase6True,
      status: 'Correct 4 relative phases and sixth phase independently recovered'
    }
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {parseLP2, encode, groupByLength, signature5, unpack,
  vote, voteSixth, plant, random32, run};
