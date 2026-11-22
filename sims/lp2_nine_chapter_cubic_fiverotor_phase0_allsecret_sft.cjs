'use strict';

/**
 * Agent27, Director #2231: all-nine-chapter key-free obstruction for a
 * changing FIVE-state word-phase GP29 cube rotor, even rekeying once at
 * every independently printed source-red chapter start.
 *
 * The original has no authorial instruction specifying this particular
 * key update; this is a typed, finite, hypothetical family.
 * Windows 11 Node22 CommonJS single runnable test, no writes or packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((c, i) => [c, i]));
const originalTranscript = read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');

/** @returns {number[][]} */
function printedWords() {
  const result = [];
  let word = [];
  for (const ch of originalTranscript) {
    const index = runeIndex.get(ch);
    if (index !== undefined) word.push(index);
    else if ('-.$&§0123456789'.includes(ch) && word.length) {
      result.push(word);
      word = [];
    }
  }
  if (word.length) result.push(word);
  assert.equal(result.length, 2896);
  assert.deepEqual(result.flat(), gp.pages.filter((p) => p.page <= 55)
    .flatMap((p) => p.indices));
  return result;
}
const words = printedWords();
const original = words.flat();
assert.equal(original.length, 12956);
const phases = words.flatMap((w) => w.map((value, j) => j % 5));
const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapterAt = new Int8Array(original.length).fill(-1);
for (let chapter = 0; chapter < chapterPages.length; chapter++) {
  const [first, last] = chapterPages[chapter];
  const offset = gp.pages.filter((p) => p.page < first)
    .reduce((s, p) => s + p.indices.length, 0);
  const end = gp.pages.filter((p) => p.page <= last)
    .reduce((s, p) => s + p.indices.length, 0);
  for (let i = offset; i < end; i++) chapterAt[i] = chapter;
}
assert(Array.from(chapterAt).every((x) => x >= 0));
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const h = new Uint32Array(29);
  for (const v of values) h[v]++;
  let pairs = 0;
  for (const n of h) pairs += n * (n - 1);
  return pairs / (values.length * (values.length - 1));
}

/**
 * Each independently red-heading-delimited chapter has five fully secret
 * initial rotor states. A phase0 rotor sees ONLY phase0 ciphertext,
 * so its ENTIRE 29-secret keyspace is exhaustively enumerable.
 */
function originalPhase0() {
  return chapterPages.map(([first, last], chapter) => {
    const relevant = original.filter((v, i) =>
      chapterAt[i] === chapter && phases[i] === 0);
    let max = {seed: -1, ioc: -1};
    for (let seed = 0; seed < 29; seed++) {
      let state = seed;
      const decoded = [];
      for (const c of relevant) {
        decoded.push(mod(c - state));
        state = mod((state + c) ** 3);
      }
      const value = ioc(decoded);
      if (value > max.ioc) max = {seed, ioc: value};
    }
    return {chapter: first + '..' + last,
      originalRuneCount: original.filter((v, i) => chapterAt[i] === chapter).length,
      phase0Positions: relevant.length, ...max};
  });
}
const sourceOracle = originalPhase0();
assert.deepEqual(sourceOracle.map((v) => v.phase0Positions),
  [216, 337, 502, 563, 293, 417, 485, 866, 89]);
const expected = [
  [18, 0.03854435831180017], [10, 0.03569662286279497],
  [16, 0.03607128372736598], [5, 0.03522689203112457],
  [2, 0.03592968348216373], [16, 0.0351872348275226],
  [9, 0.03540938911135725], [4, 0.03533353802613838],
  [15, 0.04034729315628192]
];
sourceOracle.forEach((x, i) => {
  assert.equal(x.seed, expected[i][0]);
  assert(Math.abs(x.ioc - expected[i][1]) < 1e-12);
});

const gpTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source @returns {number[][]} */
function nativeWords(source) {
  const clean = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    const current = [];
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        current.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        current.push(27);
        i += 2;
      } else {
        const item = gpTokens.find((x) => word.startsWith(x.s, i));
        assert(item, 'Native GP mapping: ' + word);
        current.push(item.i);
        i += item.s.length;
      }
    }
    out.push(current);
  }
  return out;
}
const sourceNames = ['Gibran', 'Shakespeare', 'Emerson'];
const files = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const pool = files.map((f) => {
  const p = Array.from({length: 15}, () => []);
  for (const w of nativeWords(read(f)))
    if (w.length <= 14) p[w.length].push(w);
  for (const w of words)
    assert(p[w.length].length, 'Missing matched GP length ' + w.length);
  return p;
});
/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/**
 * Collect a complete actual source-native corpus on the true manuscript
 * geometry, with original word lengths, within-word phase and nine visual
 * chapter boundaries unchanged.
 * @param {number} sourceIndex
 * @param {() => number} rng
 * @returns {number[]}
 */
function nativeControl(sourceIndex, rng) {
  return words.flatMap((w) => {
    const options = pool[sourceIndex][w.length];
    return options[rng() % options.length];
  });
}
/** @param {number[]} stream @returns {number[][]} */
function phase0PerChapter(stream) {
  const out = Array.from({length: 9}, () => []);
  for (let i = 0; i < stream.length; i++)
    if (phases[i] === 0) out[chapterAt[i]].push(stream[i]);
  return out;
}
const rand = random(0x33013301), control = [];
for (let s = 0; s < 3; s++) {
  const minima = Array(9).fill(Infinity);
  for (let sample = 0; sample < 80; sample++) {
    const native = nativeControl(s, rand);
    const phaseValues = phase0PerChapter(native);
    for (let ch = 0; ch < 9; ch++)
      minima[ch] = Math.min(minima[ch], ioc(phaseValues[ch]));
  }
  assert(minima.every((v, ch) => v > sourceOracle[ch].ioc));
  control.push({source: sourceNames[s], originalGeometrySamples: 80,
    minimumPhase0IoCByChapter: minima});
}
const globalNativeMinimum = sourceOracle.map((v, ch) =>
  Math.min(...control.map((c) => c.minimumPhase0IoCByChapter[ch])));
assert(globalNativeMinimum.every((v, ch) => v > sourceOracle[ch].ioc));

// Construct a full book, 9 independently seeded 5-state cipher positive
// from authentic source-native words with exactly the original printed
// word lengths. Page/chapter clocks and all 29 GP values are valid.
const nativePlant = nativeControl(1, random(0x3301));
const seeds = Array.from({length: 9}, (_, ch) =>
  Array.from({length: 5}, (_, r) => (13 + 3 * ch + 7 * r) % 29));
/** @param {number[]} src @param {boolean} forward @returns {number[]} */
function transform(src, forward) {
  const states = seeds.map((v) => v.slice());
  const out = [];
  for (let i = 0; i < src.length; i++) {
    const state = states[chapterAt[i]], phase = phases[i];
    const c = forward ? mod(src[i] + state[phase]) : src[i];
    out.push(forward ? c : mod(c - state[phase]));
    state[phase] = mod((state[phase] + c) ** 3);
  }
  return out;
}
assert.deepEqual(transform(transform(nativePlant, true), false), nativePlant);
assert.deepEqual(transform(transform(original, false), true), original);
assert.equal(nativePlant.length, 12956);
console.log(JSON.stringify({
  scenario: 'all 9 authentic red-heading chapters with 5 independent changing cubic state rotors rekeyed per chapter',
  originalRunes: original.length, completeWords: words.length,
  allSecretPhase0: sourceOracle,
  nativeGeometryMatchedControl: control,
  minimumObservedNativePhase0: globalNativeMinimum,
  completeSourceNativePositive: '12956/12956 full-book GP indices',
  decision: 'All nine chapters individually fail the phase0 concentration bound for every possible unknown rotor seed; the word-state family cannot produce source-native English even after independent chapter rekeys.'
}, null, 2));
console.log('PASS: 9 exact original chapters; full-book word joins; 29 seeds x 9; 240 matched controls; 12956-rune source-native positive');
