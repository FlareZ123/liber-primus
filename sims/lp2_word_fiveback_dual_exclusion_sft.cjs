/**
 * LP2 word-local five-back/two-output exclusion: all-secret alphabet gate.
 *
 * Reproducer: node sims/lp2_word_fiveback_dual_exclusion_sft.cjs
 * Input: original 2014 GP29 ciphertext and three fixed native-GP controls.
 * Result: a stationary GP29 rank alphabet, even if the five word phases
 * are independently secret permutations, cannot reproduce the measured
 * source-native GP-English rank spectra on the original ciphertext.
 *
 * A candidate model, not an authenticated Cicada operation.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const translit = new Map(gp.translit.map((name, i) => [name, i]));
const rune = new Map(gp.runes.map((name, i) => [name, i]));
const text = load('resources/lp2-transcription.txt');
const sourcePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
const sourceNames = ['Shakespeare', 'Gibran', 'Emerson'];

/** @returns {number[][]} Original full printed words, including page-crossing words. */
function getCipherWords() {
  const out = [];
  let word = [];
  const segments = text.split('%').slice(0, 55);
  assert.equal(segments.length, 55);
  for (const char of segments.join('%')) {
    const index = rune.get(char);
    if (index !== undefined) {
      word.push(index);
    } else if ('-.$&§0123456789'.includes(char) && word.length > 0) {
      out.push(word);
      word = [];
    }
  }
  if (word.length > 0) out.push(word);
  const reconstructed = out.flat();
  const canonical = gp.pages.filter((page) => page.page <= 55)
    .flatMap((page) => page.indices);
  assert.equal(out.length, 2896);
  assert.equal(reconstructed.length, 12956);
  assert.deepStrictEqual(reconstructed, canonical);
  return out;
}

/** @param {string} string @returns {number[] | null} */
function encodeGP(string) {
  const word = string.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < word.length;) {
    const digraph = translit.get(word.slice(i, i + 2));
    if (digraph !== undefined) {
      output.push(digraph);
      i += 2;
      continue;
    }
    const letter = translit.get(word[i]);
    if (letter === undefined) return null;
    output.push(letter);
    i++;
  }
  return output;
}

/** @param {string} input @returns {Map<number, number[][]>} */
function makePool(input) {
  const result = new Map();
  for (const word of input.toUpperCase().match(/[A-Z]+/g) || []) {
    const encoded = encodeGP(word);
    if (!encoded || encoded.length < 6 || encoded.length > 14) continue;
    if (!result.has(encoded.length)) result.set(encoded.length, []);
    result.get(encoded.length).push(encoded);
  }
  for (let length = 6; length <= 14; length++) {
    assert.ok(result.has(length), 'Missing GP word length ' + length);
  }
  return result;
}

/**
 * Candidate rank encoding for a word-local five-back cipher.
 * Output code 0 is the preceding ciphertext rune. Output code 28 is the
 * ciphertext five symbols earlier, unless that duplicates code 0, in
 * which case use the next cyclic rune. Codes 1..27 enumerate all 27
 * other output runes in their canonical GP ordering.
 * @param {number} value
 * @param {number} previous
 * @param {number} fiveBack
 * @returns {number}
 */
function toRank(value, previous, fiveBack) {
  const second = fiveBack === previous ? (previous + 1) % 29 : fiveBack;
  if (value === previous) return 0;
  if (value === second) return 28;
  let code = 1;
  for (let v = 0; v < value; v++) {
    if (v !== previous && v !== second) code++;
  }
  return code;
}

/** @param {number} code @param {number} previous @param {number} fiveBack */
function fromRank(code, previous, fiveBack) {
  const second = fiveBack === previous ? (previous + 1) % 29 : fiveBack;
  if (code === 0) return previous;
  if (code === 28) return second;
  let rank = 1;
  for (let value = 0; value < 29; value++) {
    if (value === previous || value === second) continue;
    if (rank === code) return value;
    rank++;
  }
  throw new Error('Invalid rank code ' + code);
}

/** @returns {Float64Array[]} */
function emptyPhases() {
  return Array.from({length: 5}, () => new Float64Array(29));
}

/** @param {number[][]} words @returns {Float64Array[]} */
function sourceRanks(words) {
  const result = emptyPhases();
  for (const word of words) {
    for (let i = 5; i < word.length; i++) {
      result[i % 5][toRank(word[i], word[i - 1], word[i - 5])]++;
    }
  }
  return result;
}

/** @param {number[]} lengths @param {Map<number, number[][]>} pool */
function sourceExpectations(lengths, pool) {
  const count = new Map();
  for (const length of lengths) count.set(length, (count.get(length) || 0) + 1);
  const result = emptyPhases();
  for (const [length, total] of count) {
    const options = pool.get(length);
    assert.ok(options && options.length);
    for (const word of options) {
      for (let i = 5; i < word.length; i++) {
        result[i % 5][word[i]] += total / options.length;
      }
    }
  }
  return result;
}

/** The rearrangement-optimal L1 distance under ALL secret permutations. */
function bestPermutationTV(left, right) {
  const a = Array.from(left).sort((x, y) => y - x);
  const b = Array.from(right).sort((x, y) => y - x);
  const an = a.reduce((sum, v) => sum + v, 0);
  const bn = b.reduce((sum, v) => sum + v, 0);
  let distance = 0;
  for (let i = 0; i < 29; i++) distance += Math.abs(a[i] / an - b[i] / bn);
  return distance / 2;
}

/** @param {Float64Array[]} actual @param {Float64Array[]} reference */
function bestFivePhaseTV(actual, reference) {
  let sum = 0, total = 0;
  for (let phase = 0; phase < 5; phase++) {
    const count = actual[phase].reduce((a, b) => a + b, 0);
    sum += count * bestPermutationTV(actual[phase], reference[phase]);
    total += count;
  }
  return sum / total;
}

/** Xorshift32 with one fixed seed per control. */
function makeRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[]} lengths @param {Map<number, number[][]>} pool @param {() => number} random */
function sampleWords(lengths, pool, random) {
  return lengths.map((length) => {
    const options = pool.get(length);
    return options[random() % options.length];
  });
}

/** @param {number[][]} words @param {() => number} random */
function proveExactCipherRoundTrip(words, random) {
  const sboxes = Array.from({length: 5}, () => {
    const result = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  });
  let checked = 0;
  for (const plain of words) {
    const cipher = plain.slice();
    for (let i = 5; i < plain.length; i++) {
      cipher[i] = fromRank(sboxes[i % 5][plain[i]], cipher[i - 1], cipher[i - 5]);
    }
    for (let i = 5; i < plain.length; i++) {
      const code = toRank(cipher[i], cipher[i - 1], cipher[i - 5]);
      assert.equal(sboxes[i % 5][plain[i]], code);
      checked++;
    }
  }
  return checked;
}

function run() {
  assert.deepStrictEqual(encodeGP('THE'), [2, 18]);
  assert.deepStrictEqual(encodeGP('NG'), [21]);
  for (let predecessor = 0; predecessor < 29; predecessor++) {
    for (let lag = 0; lag < 29; lag++) {
      for (let value = 0; value < 29; value++) {
        const code = toRank(value, predecessor, lag);
        assert.ok(code >= 0 && code <= 28);
        assert.equal(fromRank(code, predecessor, lag), value);
      }
    }
  }
  const original = getCipherWords();
  const lengths = original.map((word) => word.length).filter((len) => len >= 6);
  const originalRank = sourceRanks(original);
  assert.deepStrictEqual(originalRank.map((bin) => bin.reduce((a,b) => a+b,0)),
    [872, 584, 350, 190, 109]);
  const observed = originalRank.reduce((a, bins) => {
    a[0] += bins[0];
    a[1] += bins[28];
    return a;
  }, [0, 0]);
  assert.deepStrictEqual(observed, [15, 104]);
  assert.equal(lengths.reduce((sum, l) => sum + l - 5, 0), 2105);

  const trials = 1000;
  const controlResults = [];
  for (let z = 0; z < sourcePaths.length; z++) {
    const pool = makePool(load(sourcePaths[z]));
    const reference = sourceExpectations(lengths, pool);
    const originalTV = bestFivePhaseTV(originalRank, reference);
    const random = makeRandom((0x29b3301 + z * 0x9e3779b9) >>> 0);
    const plant = sampleWords(lengths, pool, random);
    assert.equal(proveExactCipherRoundTrip(plant, random), 2105);

    let maxControl = 0, exceed = 0, sumControl = 0;
    for (let t = 0; t < trials; t++) {
      const sample = sampleWords(lengths, pool, random);
      const native = emptyPhases();
      for (const word of sample) for (let i = 5; i < word.length; i++) {
        native[i % 5][word[i]]++;
      }
      const distance = bestFivePhaseTV(native, reference);
      maxControl = Math.max(maxControl, distance);
      sumControl += distance;
      if (distance >= originalTV) exceed++;
    }
    assert.equal(exceed, 0);
    assert.ok(originalTV > 0.30 && maxControl < 0.12);
    const result = {
      corpus: sourceNames[z],
      originalMinTV: +originalTV.toFixed(9),
      averageSourceControlTV: +(sumControl/trials).toFixed(9),
      maximumSourceControlTV: +maxControl.toFixed(9),
      controlsAtOrAboveOriginal: exceed,
      trials,
    };
    controlResults.push(result);
  }
  console.log(JSON.stringify({
    sourceWords: original.length,
    sourceRunes: 12956,
    analyzedSuffixRunes: 2105,
    fivePhaseSizes: [872, 584, 350, 190, 109],
    samePreviousOutput: observed[0],
    sameFiveBackOutput: observed[1],
    sourceNativeResults: controlResults,
    keyFamily: 'all 29! rank permutations in each of five independent word phases',
    verdict: 'original spectra unlike fixed native-GP English; no unknown plaintext recovered',
  }, null, 2));
}

run();
