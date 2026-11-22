'use strict';

/**
 * Test a specific two-leakage, ciphertext-feedback GP29 cipher on original LP2.
 *
 * The 2013/p39 source-root recurrence T(x)=24-2*x mod29 fixes GP rune H
 * (index 8). In this proposed reversible model EA maps to a repetition
 * of the preceding ciphertext rune and H maps to T(the sixth-back rune).
 * Other letters use a bijective index rank keyed by the printed 32x8 table.
 *
 * A necessary, key-INDEPENDENT consequence is that all noncollision lag-six
 * T matches identify plaintext H. Compare their WORD-FINAL positions with
 * historical GP-native English of exactly the original word lengths.
 *
 * Node.js 22, built-in libraries only. Run from the repository root:
 * node sims/lp2_lag6_fixedpoint_h_two_marker_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const runes = new Map(gp.runes.map((ch, i) => [ch, i]));
const translit = new Map(gp.translit.map((ch, i) => [ch, i]));
const corpus = read('resources/lp2-transcription.txt');

/** @returns {number[][]} Source-exact 2,896 printed unknown words. */
function originalWords() {
  const words = [];
  let current = [];
  for (const ch of corpus.split('%').slice(0, 55).join('%')) {
    const v = runes.get(ch);
    if (v !== undefined) {
      current.push(v);
    } else if ('-.$&§0123456789'.includes(ch) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  const original = gp.pages.filter(page => page.page <= 55)
    .flatMap(page => page.indices);
  assert.equal(words.length, 2896);
  assert.deepEqual(words.flat(), original);
  assert.equal(original.length, 12956);
  return words;
}

/**
 * Encode standard source spellings in GP29; only 2013-attested aliases.
 * @param {string} word
 * @returns {number[] | null}
 */
function encodeGP(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = translit.get(s.slice(i, i + 2));
    if (digraph !== undefined) {
      out.push(digraph);
      i += 2;
    } else {
      const single = translit.get(s[i]);
      if (single === undefined) return null;
      out.push(single);
      i++;
    }
  }
  return out;
}

/** @param {string} source @returns {Map<number,number[][]>} */
function pool(source) {
  const choices = new Map();
  for (const token of source.match(/[A-Za-z]+/g) || []) {
    const indices = encodeGP(token);
    if (!indices) continue;
    if (!choices.has(indices.length)) choices.set(indices.length, []);
    choices.get(indices.length).push(indices);
  }
  return choices;
}

/** @param {number} x @returns {number} */
function transform(x) { return (24 - 2*x + 58) % 29; }
assert.equal(transform(8), 8);

/**
 * Bernoulli Poisson-binomial tail P(X >= threshold); the last cell is an
 * absorbing tail bucket so there is no catastrophic 1-CDF cancellation.
 * Each word is independently selected from source words matched on GP length.
 * @param {number[]} ps
 * @param {number} threshold
 */
function tailProbability(ps, threshold) {
  const probabilities = new Float64Array(threshold + 1);
  probabilities[0] = 1;
  for (const p of ps) {
    for (let i = threshold; i > 0; i--) {
      probabilities[i] = i === threshold
        ? probabilities[i] + probabilities[i-1]*p
        : probabilities[i]*(1-p) + probabilities[i-1]*p;
    }
    probabilities[0] *= 1-p;
  }
  return probabilities[threshold];
}

/** @param {number[][]} words */
function markerCounts(words) {
  let repeated = 0, affine = 0, affineAtEnd = 0, conflict = 0;
  let eligible = 0, previous = null;
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const doublet = previous === word[i];
      if (doublet) repeated++;
      if (i >= 6) {
        eligible++;
        const hit = word[i] === transform(word[i-6]);
        if (hit) {
          affine++;
          if (i === word.length-1) affineAtEnd++;
          if (doublet) conflict++;
        }
      }
      previous = word[i];
    }
  }
  return {repeated, affine, affineAtEnd, conflict, eligible};
}

/**
 * For one original word length, independently sample a native-language word.
 * @param {number[][]} cipherWords
 * @param {Map<number,number[][]>} choices
 * @param {() => number} random32
 */
function plantWords(cipherWords, choices, random32) {
  return cipherWords.map(word => {
    const entries = choices.get(word.length);
    assert(entries && entries.length, 'Missing native word of GP length ' + word.length);
    return entries[random32() % entries.length];
  });
}

/** @param {number} seed */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Full reversible GP29 one-step map with H and EA as special plaintexts.
 * For i<6 only EA is special. At i>=6 H uses T(C[i-6]), with a
 * deterministic +1 fallback when its target collides with C[i-1].
 *
 * Remaining 27 (or 28) plaintext symbols are cyclically indexed by
 * an original table byte selected by the previous ciphertext rune
 * (row 0..28) and the within-word offset (column 0..7).
 * No secret alphabet, plaintext optimization or fitted parameters.
 *
 * @param {number} value Cipher or plain GP index
 * @param {number | null} previous Previous ciphertext index, or null
 * @param {number | null} sixthBack Word-local previous ciphertext index
 * @param {number} offset Within-word index
 * @param {boolean} decrypt
 */
function step(value, previous, sixthBack, offset, decrypt) {
  if (previous === null) {
    return ((value + (decrypt ? -grid[0] : grid[0])) % 29 + 29) % 29;
  }
  const specialP = sixthBack === null ? [28] : [28,8];
  let target = sixthBack === null ? null : transform(sixthBack);
  if (target === previous) target = (previous+1)%29;
  const specialC = sixthBack === null ? [previous] : [previous,target];
  const otherP = [], otherC = [];
  for (let z = 0; z < 29; z++) {
    if (!specialP.includes(z)) otherP.push(z);
    if (!specialC.includes(z)) otherC.push(z);
  }
  assert.equal(otherP.length, otherC.length);
  const shift = grid[previous*8+(offset%8)] % otherP.length;
  if (decrypt) {
    const special = specialC.indexOf(value);
    if (special >= 0) return specialP[special];
    const index = otherC.indexOf(value);
    assert(index >= 0);
    return otherP[(index-shift+otherP.length)%otherP.length];
  }
  const special = specialP.indexOf(value);
  if (special >= 0) return specialC[special];
  const index = otherP.indexOf(value);
  assert(index >= 0);
  return otherC[(index+shift)%otherC.length];
}

/** @param {number[][]} words @returns {number[][]} */
function encrypt(words) {
  const out = [];
  let previous = null;
  for (const word of words) {
    const encoded = [];
    for (let i = 0; i < word.length; i++) {
      const result = step(word[i], previous, i >= 6 ? encoded[i-6] : null, i, false);
      encoded.push(result);
      previous = result;
    }
    out.push(encoded);
  }
  return out;
}

/** @param {number[][]} words @returns {number[][]} */
function decrypt(words) {
  const out = [];
  let previous = null;
  for (const word of words) {
    const decoded = [];
    for (let i = 0; i < word.length; i++) {
      decoded.push(step(word[i], previous, i >= 6 ? word[i-6] : null, i, true));
      previous = word[i];
    }
    out.push(decoded);
  }
  return out;
}

/** @param {number[][]} words */
function ioc(words) {
  const freq = Array(29).fill(0), symbols = words.flat();
  for (const i of symbols) freq[i]++;
  return freq.reduce((acc, f) => acc + f*(f-1), 0)
    / (symbols.length*(symbols.length-1));
}

const original = originalWords();
const observed = markerCounts(original);
assert.deepEqual(observed,
  {repeated:86, affine:80, affineAtEnd:32, conflict:1, eligible:1290});
const eligibleLengths = original.filter(w => w.length >= 7).map(w => w.length);
assert.equal(eligibleLengths.length, 559);
const sources = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
];
const sourceTests = sources.map(([name,file]) => {
  const candidates = pool(read(file));
  const probabilities = eligibleLengths.map(n => {
    const choices = candidates.get(n);
    assert(choices && choices.length);
    const finalH = choices.filter(word => word[word.length-1] === 8).length;
    // Conservative Jeffreys smoothing of 29 GP symbols.
    return (finalH + 0.5)/(choices.length + 29*0.5);
  });
  return {
    name,
    expectedWordFinalH: probabilities.reduce((a,b) => a+b, 0),
    tailAtLeast31: tailProbability(probabilities, 31),
    tailAtLeast32: tailProbability(probabilities, 32),
    candidates
  };
});
const expected = [
  [6.593528790096304,2.527819653950213e-12],
  [4.430524254061249,6.141921515475055e-17],
  [5.076122031453074,3.3592411493664432e-15]
];
for (let i = 0; i < 3; i++) {
  assert(Math.abs(sourceTests[i].expectedWordFinalH-expected[i][0]) < 1e-9);
  assert(Math.abs(sourceTests[i].tailAtLeast31/expected[i][1]-1) < 1e-6);
}
const plant = plantWords(original, sourceTests[0].candidates, randomGenerator(0x3301));
const encryptedPlant = encrypt(plant);
assert.deepEqual(decrypt(encryptedPlant), plant);
const result = decrypt(original);
assert.deepEqual(encrypt(result), original);
assert.equal(result.flat().filter(x => x === 28).length, 86);
assert.equal(result.flat().filter(x => x === 8).length, 515);
assert(Math.abs(ioc(result)-0.035316707118675815) < 1e-12);
assert(Math.abs(ioc(plant)-0.06059673634564466) < 1e-12);
assert.deepEqual(markerCounts(encryptedPlant),
  {repeated:68,affine:31,affineAtEnd:10,conflict:0,eligible:1290});
console.log(JSON.stringify({
  model: 'reversible ciphertext-feedback: EA->repeat; H->lag6 affine',
  original: observed,
  eligibleWords: eligibleLengths.length,
  wordFinalVisibleHLowerBound: 31,
  sourceTests: sourceTests.map(({name,expectedWordFinalH,tailAtLeast31}) =>
    ({name,expectedWordFinalH,tailAtLeast31})),
  ioc: {
    original: ioc(original),
    originalDecoded: ioc(result),
    nativePlant: ioc(plant),
    plantedCipher: ioc(encryptedPlant)
  },
  nativePlantMarkers: markerCounts(encryptedPlant),
  exactFullLengthPlantRecovered: true,
  exactOriginalRoundTrip: true,
  unknownPlaintextRecovered: false
},null,2));
