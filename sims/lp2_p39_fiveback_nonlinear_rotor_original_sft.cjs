'use strict';

/**
 * Source-frozen nonlinear GP29 context rotor, Director #867.
 *
 * Original p39 red coefficients [27,5,15] specify Q(x)=15(x-24)^2 mod29.
 * The independently visible five-circle stencil motivates a within-word
 * five-back output. GP-EA (28) reserves predecessor-copy, GP-S (15)
 * reserves five-back-copy, with a deterministic tie rule. Q(previous
 * ciphertext) rotates the 27 other output assignments; all 29 maps are
 * bijective at every step. These marker semantics are conjectural.
 *
 * Reads repo-owned original LP2 input and GP-native Gibran source.
 * Run in Node.js 22 on Windows 11 from any working directory.
 * No external packages, randomness outside the fixed seed, or writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(base, filename), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyph = new Map(gp.runes.map((c, i) => [c, i]));
const translit = new Map(gp.translit.map((c, i) => [c, i]));

/** @returns {number[][]} Original 2896 printed words, including page carries. */
function sourceWords() {
  const words = [];
  let current = [];
  for (const c of read('resources/lp2-transcription.txt')
    .split('%').slice(0, 55).join('%')) {
    const rune = glyph.get(c);
    if (rune !== undefined) current.push(rune);
    else if ('-.$&§0123456789'.includes(c) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  const expected = gp.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.equal(words.length, 2896);
  assert.equal(expected.length, 12956);
  assert.deepEqual(words.flat(), expected);
  return words;
}

/** @param {number} x @returns {number} */
function Q(x) {
  const a = (27 + 5 * x + 15 * x * x) % 29;
  const b = (15 * ((x + 5) % 29) ** 2) % 29;
  assert.equal(a, b);
  return a;
}

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/**
 * Bidirectional context-specific 29-permutation.
 * Previous published ciphertext persists across printed words.
 * The initial H=8 is the p40 red heading's actual last rune; outside
 * that body it is an exploratory choice affecting only stream rune 0.
 * @param {number[][]} input
 * @param {boolean} encode
 * @returns {number[][]}
 */
function transform(input, encode) {
  let previous = 8;
  const result = [];
  for (const word of input) {
    const translated = [];
    for (let j = 0; j < word.length; j++) {
      const context = encode ? translated : word;
      const forbiddenOutput = [previous];
      const forbiddenPlain = [28];
      if (j >= 5) {
        const fiveBack = context[j - 5];
        forbiddenOutput.push(fiveBack === previous
          ? mod29(previous + 1) : fiveBack);
        forbiddenPlain.push(15);
      }
      const outputs = Array.from({length: 29}, (_, i) => i)
        .filter(i => !forbiddenOutput.includes(i));
      const plains = Array.from({length: 29}, (_, i) => i)
        .filter(i => !forbiddenPlain.includes(i));
      assert.equal(outputs.length, plains.length);

      let value;
      if (encode) {
        const special = forbiddenPlain.indexOf(word[j]);
        if (special >= 0) value = forbiddenOutput[special];
        else {
          const rank = plains.indexOf(word[j]);
          assert(rank >= 0);
          const outputRank = (rank - Q(previous) % plains.length
            + plains.length) % plains.length;
          value = outputs[outputRank];
        }
        previous = value;
      } else {
        const special = forbiddenOutput.indexOf(word[j]);
        if (special >= 0) value = forbiddenPlain[special];
        else {
          const rank = outputs.indexOf(word[j]);
          assert(rank >= 0);
          value = plains[(rank + Q(previous)) % plains.length];
        }
        previous = word[j];
      }
      translated.push(value);
    }
    result.push(translated);
  }
  return result;
}

/**
 * Authentic solved-LP source spelling (NG/ING and IA/IO collisions).
 * @param {string} raw
 * @returns {number[] | null}
 */
function encodeNativeGP(raw) {
  const s = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < s.length;) {
    let token;
    let rune;
    if (s.slice(i, i + 3) === 'ING') { token = 'ING'; rune = 21; }
    else if (s.slice(i, i + 2) === 'IO') { token = 'IO'; rune = 27; }
    else {
      token = s.slice(i, i + 2);
      rune = translit.get(token);
      if (rune === undefined) {
        token = s[i];
        rune = translit.get(token);
      }
    }
    if (rune === undefined) return null;
    result.push(rune);
    i += token.length;
  }
  return result;
}

/** @returns {Map<number, number[][]>} */
function nativePool() {
  const pool = new Map();
  for (const token of read('resources/control/gibran_prophet_58585.txt')
    .match(/[A-Za-z]+/g) || []) {
    const word = encodeNativeGP(token);
    if (!word) continue;
    if (!pool.has(word.length)) pool.set(word.length, []);
    pool.get(word.length).push(word);
  }
  return pool;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const v of a) count[v]++;
  return count.reduce((z, n) => z + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}

/** @param {number[][]} words @returns {{doublets:number,echo5:number,eligible:number}} */
function motifs(words) {
  let previous = 8, doublets = 0, echo5 = 0, eligible = 0;
  for (const w of words) {
    for (let j = 0; j < w.length; j++) {
      if (w[j] === previous) doublets++;
      if (j >= 5) {
        eligible++;
        if (w[j] === w[j - 5]) echo5++;
      }
      previous = w[j];
    }
  }
  return {doublets, echo5, eligible};
}

/** @returns {() => number} */
function generator() {
  let state = 0x3301;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const originalWords = sourceWords();
const original = originalWords.flat();
const decodedWords = transform(originalWords, false);
const decoded = decodedWords.flat();
assert.deepEqual(transform(decodedWords, true).flat(), original);
assert.equal(motifs(originalWords).echo5, 104);
assert.equal(motifs(originalWords).doublets, 86);
assert.equal(motifs(originalWords).eligible, 2105);
assert(Math.abs(ioc(original) - 0.03447839786450569) < 1e-12);
assert(Math.abs(ioc(decoded) - 0.03531304898126831) < 1e-12);

// p40 red heading ends in GP H; the 3000 black-body runes follow it.
// Every physical p40–53 body singleton should decode to native A/I/O.
const offsets = [0];
for (let p = 0; p <= 55; p++) {
  offsets.push(offsets[offsets.length - 1] + gp.pages[p].indices.length);
}
const start = offsets[40] + 8, end = offsets[54];
assert.equal(end - start, 3000);
let position = 0;
const singletons = [];
for (let i = 0; i < originalWords.length; i++) {
  if (position >= start && position < end && originalWords[i].length === 1) {
    singletons.push({offset: position - start, plaintext: decodedWords[i][0]});
  }
  position += originalWords[i].length;
}
assert.equal(singletons.length, 13);
const nativeSingletons = new Set([24, 10, 3]);
const nativeHits = singletons.filter(x => nativeSingletons.has(x.plaintext));
assert.equal(nativeHits.length, 2);

// Keep the original 2896 word lengths; draw only authentic source-native
// GP-English words, then encode/decode with the identical frozen mechanism.
const pool = nativePool(), random = generator();
const positives = [];
for (let sample = 0; sample < 50; sample++) {
  const planted = originalWords.map(word => {
    const options = pool.get(word.length);
    assert(options && options.length, 'No GP-English word of length ' + word.length);
    return options[random() % options.length];
  });
  const ciphertext = transform(planted, true);
  assert.deepEqual(transform(ciphertext, false), planted);
  positives.push({plainIoC: ioc(planted.flat()),
    cipherIoC: ioc(ciphertext.flat()), ...motifs(ciphertext)});
}
const average = key => positives.reduce((z, p) => z + p[key], 0)
  / positives.length;
const ranges = Object.fromEntries(['cipherIoC', 'doublets', 'echo5']
  .map(key => [key, [Math.min(...positives.map(p => p[key])),
    Math.max(...positives.map(p => p[key]))]]));
assert(positives.every(p => p.echo5 > 104));
assert(positives.every(p => p.doublets > 86));
console.log(JSON.stringify({
  scope: 'LP2 original p0–55',
  runes: original.length,
  words: originalWords.length,
  quadraticCoefficients: [27, 5, 15],
  originalIoC: ioc(original),
  decodedIoC: ioc(decoded),
  p40BodyIoC: ioc(decoded.slice(start, end)),
  originalP40BodyIoC: ioc(original.slice(start, end)),
  p40BodySingletons: singletons.map(x =>
    ({offset: x.offset, GP: gp.translit[x.plaintext]})),
  p40BodyNativeEnglishSingletonHits: nativeHits.length,
  originalMotifs: motifs(originalWords),
  positiveControls: positives.length,
  positiveAverages: {
    plainIoC: average('plainIoC'),
    cipherIoC: average('cipherIoC'),
    doublets: average('doublets'),
    echo5: average('echo5')
  },
  positiveRanges: ranges,
  result: 'No authentic unknown-page GP-English plaintext'
}, null, 2));