'use strict';

/**
 * All-256-seed plaintext-feedback walk over the physical 32x8 LP2 table.
 *
 * SFT: node sims/lp2_p50_plaintextprime_256state_exhaustive_sft.cjs
 * Read-only; Node 22 CommonJS, built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceText = read('resources/liber-primus/lp2-transcription.txt');
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));

const glyphs = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const lookup = new Map(glyphs.map((glyph, index) => [glyph, index]));
const words = sourceText.replace(/[^-\.\u16a0-\u16ff]/gu, '')
  .split(/[-.]/).filter(Boolean).slice(0, 2896)
  .map((word) => [...word].map((rune) => lookup.get(rune)));
const original = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(words.flat(), original);
assert.deepEqual(solved.runes, glyphs);

const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const alpha59 = table.alphabet.replace('f', '');
const sources = [
  { radix: 60, bytes: table.bytes },
  { radix: 59, bytes: tokens.map((token) =>
    59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1])) },
];
assert.ok(sources[1].bytes.every((value) => value >= 0 && value <= 255));
const mod29 = (n) => ((n % 29) + 29) % 29;

function normalizedIC(histogram, count) {
  return 29 * histogram.reduce((sum, k) => sum + k * (k - 1), 0)
    / (count * (count - 1));
}

/**
 * Inverse C -> P: subtract/add table-byte mod29 at a live byte pointer,
 * then advance byte pointer by PRIME(P) modulo256 after each word/rune.
 * The pointer update uses recovered PLAINTEXT, unlike prior cipher-word
 * direction automata and same-word eight-compass fixed-point tests.
 *
 * @param {number[][]} cipher
 * @param {number} seed Original byte pointer 0..255
 * @param {number[]} byteTable Exact table in source row-major order
 * @param {1|-1} sign Inverse additive sign
 * @param {'word'|'rune'} unit State advances once per full word or rune
 * @returns {{output: number[][], state: number}}
 */
function decrypt(cipher, seed, byteTable, sign, unit) {
  let state = seed;
  const output = [];
  for (const word of cipher) {
    const key = byteTable[state] % 29;
    let sumPrime = 0;
    const decoded = [];
    for (const cipherRune of word) {
      const localKey = unit === 'word' ? key : byteTable[state] % 29;
      const plainRune = mod29(cipherRune + sign * localKey);
      decoded.push(plainRune);
      sumPrime += corpus.prime[plainRune];
      if (unit === 'rune') state = (state + corpus.prime[plainRune]) & 255;
    }
    if (unit === 'word') state = (state + sumPrime) & 255;
    output.push(decoded);
  }
  return { output, state };
}

/** Exact causal forward inverse using the same PLAINTEXT state updates. */
function encrypt(plain, seed, byteTable, sign, unit) {
  let state = seed;
  const output = [];
  for (const word of plain) {
    const key = byteTable[state] % 29;
    let sumPrime = 0;
    const encoded = [];
    for (const plainRune of word) {
      const localKey = unit === 'word' ? key : byteTable[state] % 29;
      encoded.push(mod29(plainRune - sign * localKey));
      sumPrime += corpus.prime[plainRune];
      if (unit === 'rune') state = (state + corpus.prime[plainRune]) & 255;
    }
    if (unit === 'word') state = (state + sumPrime) & 255;
    output.push(encoded);
  }
  return { output, state };
}

/**
 * Exhaustively propagate all 256 original byte seeds simultaneously.
 * A unique state after a unit means all further plaintext is forced.
 */
function firstSynchronization(cipher, byteTable, sign, unit) {
  let states = Array.from({ length: 256 }, (_, i) => i);
  let globalRunes = 0;
  let globalUnits = 0;
  for (let wordIndex = 0; wordIndex < cipher.length; wordIndex += 1) {
    const word = cipher[wordIndex];
    if (unit === 'word') {
      states = states.map((state) => {
        const key = byteTable[state] % 29;
        let sum = 0;
        for (const value of word) {
          sum += corpus.prime[mod29(value + sign * key)];
        }
        return (state + sum) & 255;
      });
      globalUnits += 1;
      globalRunes += word.length;
    } else {
      for (const value of word) {
        states = states.map((state) => (
          state + corpus.prime[mod29(value + sign * (byteTable[state] % 29))]
        ) & 255);
        globalUnits += 1;
        globalRunes += 1;
        if (new Set(states).size === 1) {
          return { unit: globalUnits, runes: globalRunes, state: states[0], wordIndex };
        }
      }
    }
    if (unit === 'word' && new Set(states).size === 1) {
      return { unit: globalUnits, runes: globalRunes, state: states[0], wordIndex };
    }
  }
  throw new Error('A new original operand did not synchronize; inspect before publishing');
}

const authenticSolved = solved.sections.flatMap((section) => [...section.source_text]
  .filter((rune) => lookup.has(rune)).map((rune) => lookup.get(rune)));
assert.equal(authenticSolved.length, 2979);
let position = 0;
const nativePlant = words.map((word) => word.map(() =>
  authenticSolved[position++ % authenticSolved.length]));
assert.equal(position, 12956);
const nativeHistogram = Array(29).fill(0);
nativePlant.flat().forEach((rune) => nativeHistogram[rune] += 1);
const nativeIC = normalizedIC(nativeHistogram, 12956);
assert.ok(nativeIC > 1.65);

const expectedSync = [802, 299, 614, 360, 383, 173, 365, 628];
let syncIndex = 0;
const outcomes = [];
for (const { radix, bytes } of sources) {
  for (const unit of ['rune', 'word']) {
    for (const sign of [-1, 1]) {
      for (const seed of [0, 81, 255]) {
        const plantedCipher = encrypt(nativePlant, seed, bytes, sign, unit).output;
        assert.deepEqual(decrypt(plantedCipher, seed, bytes, sign, unit).output,
          nativePlant, 'Authentic GP source plant must recover exactly');
      }
      let best = { trainIC: -Infinity, seed: null, fullIC: null };
      let maxFull = -Infinity;
      let minFull = Infinity;
      for (let seed = 0; seed < 256; seed += 1) {
        const recovered = decrypt(words, seed, bytes, sign, unit).output;
        const flattened = recovered.flat();
        const hist = Array(29).fill(0);
        const train = Array(29).fill(0);
        for (let i = 0; i < flattened.length; i += 1) {
          const index = flattened[i];
          hist[index] += 1;
          if (i < 729) train[index] += 1;
        }
        const trainIC = normalizedIC(train, 729);
        const fullIC = normalizedIC(hist, 12956);
        if (trainIC > best.trainIC) best = { trainIC, seed, fullIC };
        minFull = Math.min(minFull, fullIC);
        maxFull = Math.max(maxFull, fullIC);
        if ([0, 81, 255].includes(seed)) {
          assert.deepEqual(encrypt(recovered, seed, bytes, sign, unit).output,
            words, 'Every source cipher rune must exactly reconstruct');
        }
      }
      const collapse = firstSynchronization(words, bytes, sign, unit);
      assert.equal(collapse.unit, expectedSync[syncIndex++]);
      assert.ok(collapse.runes < 3000);
      assert.ok(best.trainIC < 1.03);
      assert.ok(maxFull < 1.01);
      outcomes.push({ radix, unit, sign, collapse,
        bestSourceTrainingSeed: best, originalFullICRange: [minFull, maxFull] });
    }
  }
}
assert.equal(syncIndex, 8);
console.log(JSON.stringify({
  result: 'PASS: all 256 seeds for each of eight source-readable plaintext-feedback table walks are forced nonlinguistic',
  originalRunes: original.length, originalWords: words.length,
  authenticSolvedNativePlantRunes: authenticSolved.length,
  nativePlantIC: nativeIC,
  nativeFullRegisterForwardInverseTests: 24,
  originalFullRegisterReconstructionTests: 24,
  allSourceSeedInversions: 2048,
  outcomes,
}, null, 2));
