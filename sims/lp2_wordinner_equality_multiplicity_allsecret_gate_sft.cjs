'use strict';
/**
 * Key-independent word-internal equality-multiplicity gate for LP2.
 *
 * Every operation consisting of a bijective symbol relabelling and an
 * arbitrary symbol-position permutation WITHIN EACH printed word preserves
 * the number of equal unordered symbol pairs in that word. This remains
 * true with independently secret maps/permutations for all 2,896 words.
 *
 * Compare the original invariant with native GP-length-matched controls.
 * This rules out ordinary English/Latin/Old English word-preserving
 * bijection+anagram architectures under the exact corpus/null stated.
 * It does not recover unknown LP2 plaintext or constrain changing word
 * boundaries, many-to-one alphabets, per-position keys or other languages.
 *
 * Run: node sims/lp2_wordinner_equality_multiplicity_allsecret_gate_sft.cjs
 * Windows 11 / Node 22 / CommonJS / builtins only / read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const transcript = read('resources/lp2-transcription.txt');
const sourceCorpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = transcript.split('%').slice(0, 55).join('%');
/** @param {string} s @returns {string[]} */
function originalWords(s) {
  /** @type {string[]} */ const result = [];
  let word = '';
  for (const ch of s) {
    if (/[\u16A0-\u16FF]/u.test(ch)) word += ch;
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // A printed physical line/page break can continue the same word.
    } else if (word) { result.push(word); word = ''; }
  }
  if (word) result.push(word);
  return result;
}
const original = originalWords(source);
assert.equal(original.length, 2896);
assert.equal(original.join('').length, 12956);

const compounds = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
/** @param {string} word @returns {string[]} */
function gpTokens(word) {
  /** @type {string[]} */ const tokens = [];
  for (let i = 0; i < word.length;) {
    const m = compounds.find(s => word.startsWith(s, i));
    if (m) { tokens.push(m === 'ING' ? 'NG' : m); i += m.length; }
    else { tokens.push(word[i]); i++; }
  }
  return tokens;
}
/** @param {string} s @returns {string[][]} */
function latinWords(s) {
  return (s.toUpperCase().match(/[A-Z]+/g) || []).map(gpTokens);
}
/** @param {readonly string[] | string} w @returns {[number,number,number]} */
function signature(w) {
  const counts = new Map();
  for (const ch of w) counts.set(ch, (counts.get(ch) || 0) + 1);
  const freq = [...counts.values()];
  return [freq.reduce((s, n) => s + n * (n - 1) / 2, 0),
    Number(freq.some(n => n >= 2)), Number(freq.some(n => n >= 3))];
}
const originalSignatures = original.map(signature);
assert.deepEqual(originalSignatures.reduce(
  (a, s) => a.map((v, i) => v + s[i]), [0, 0, 0]), [811, 621, 29]);

// Source-native solved p57 checks that GP text grouping and normalizer
// preserve actual original symbol-collision counts, word for word.
const solved = read('resources/liber-primus/lp1-plaintext-reference.txt');
const p57Words = latinWords(solved.split('### 57')[1]);
const p57Original = sourceCorpus.pages.find(p => p.page === 57).indices;
assert.equal(p57Original.length, 95);
assert.equal(p57Words.length, 20);
let p57Offset = 0;
for (const word of p57Words) {
  const slice = p57Original.slice(p57Offset, p57Offset + word.length);
  assert.equal(slice.length, word.length);
  assert.equal(signature(slice)[0], signature(word)[0]);
  p57Offset += word.length;
}
assert.equal(p57Offset, 95);

// Explicit all-secret invariant positive: arbitrary per-word relabelling
// composed with reversal or rotation preserves every equality signature.
const alphabet = sourceCorpus.runes;
assert.equal(alphabet.length, 29);
const mapped = alphabet.map((_, i) => alphabet[(17 * i + 9) % 29]);
assert.equal(new Set(mapped).size, 29);
for (const word of original) {
  const transformed = [...word].map(c => mapped[alphabet.indexOf(c)]).reverse();
  assert.deepEqual(signature(transformed), signature(word));
}

/** @type {{name:string,words:string[][]}[]} */
const controls = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt']
].map(([name, p]) => ({name, words: latinWords(read(p))}));

const latin = read('resources/control/latin-vulgate-latin26-wholewords.txt')
  .split(/\r?\n/u).filter(l => !l.trimStart().startsWith('#')).join(' ');
controls.push({name:'Latin Vulgate', words:latinWords(latin)});
assert.equal(controls[3].words.length, 39835);

// Authentic solved Cicada controls use the same editorial selection as the
// separate native word-length grammar experiment.
const sections = solved.replace(/\r\n/gu, '\n').split(/\n### (\d+)\n/gu);
const selected = new Set([1,3,5,6,9,10,11,12,13,14,15,56,57]);
/** @type {string[][]} */ const authentic = [];
for (let i = 1; i < sections.length; i += 2) {
  const number = Number(sections[i]);
  if (!selected.has(number)) continue;
  let lines = sections[i+1].split('\n').filter(line =>
    !line.startsWith('[') && !line.startsWith('#') &&
    !/^[\d\s,;]+$/u.test(line) && !/^\s*$/u.test(line) &&
    !/^(?:WISDOM|A KOAN|AN INSTRUCTION|KNOW THIS)$/iu.test(line));
  if (number === 56) lines = lines.slice(0, 2);
  authentic.push(...latinWords(lines.join(' ')));
}
assert.equal(authentic.length, 713);
controls.push({name:'Solved Cicada', words:authentic});

// This Old English control is already GP29-normalized from the pinned
// Beowulf source. Slicing its true GP words avoids unsupported ASCII
// approximations to Old English runes.
const old = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
let pos = 0;
const oldWords = old.allSourceGpWordLengths.map(length => {
  const word = old.sourceGpBase29.slice(pos, pos + length);
  pos += length;
  return [...word];
});
assert.equal(pos, old.allSourceGpRunes);
assert.equal(oldWords.length, old.acceptedSourceWords);
controls.push({name:'Old English Beowulf', words:oldWords});

/** @returns {number} */
let state = 0x20143301;
function nextRandom() {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return state >>> 0;
}
/**
 * @param {string[][]} words
 * @returns {object}
 */
function evaluate(words) {
  /** @type {Map<number,number[]>} */ const byLength = new Map();
  for (const w of words) {
    const n = w.length;
    if (!byLength.has(n)) byLength.set(n, []);
    byLength.get(n).push(signature(w)[0]);
  }
  const lengths = original.filter(w => byLength.has(w.length)).map(w => w.length);
  const target = original.filter(w => byLength.has(w.length));
  const observed = target.reduce((sum, w) => sum + signature(w)[0], 0);
  let expected = 0, variance = 0;
  for (const n of lengths) {
    const x = byLength.get(n);
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    expected += mean;
    variance += x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
  }
  let min = Infinity, max = -Infinity, below = 0;
  const samples = 4000;
  for (let trial = 0; trial < samples; trial++) {
    let count = 0;
    for (const n of lengths) {
      const x = byLength.get(n);
      count += x[nextRandom() % x.length];
    }
    min = Math.min(min, count);
    max = Math.max(max, count);
    if (count <= observed) below++;
  }
  return {originalWordsEvaluated:target.length,
    missingOriginalWords:original.length-target.length,
    observed, expected:Number(expected.toFixed(6)),
    z:Number(((observed-expected)/Math.sqrt(variance)).toFixed(6)),
    nullSamples:samples, nullMin:min, nullMax:max, nullAtOrBelow:below,
    smoothedOneSidedP:(1+below)/(samples+1)};
}
const outcomes = controls.map(c => ({source:c.name,sourceWords:c.words.length,
  ...evaluate(c.words)}));
assert.ok(outcomes.every(r => r.z < -5));
assert.ok(outcomes.every(r => r.nullAtOrBelow === 0));
console.log(JSON.stringify({
  status:'Finite word-internal equality-multiplicity exclusion; no plaintext/key',
  originalWords:original.length,originalRunes:12956,
  originalPairEvents:811,originalWordsWithRepeat:621,
  originalWordsWithTriple:29,
  verifiedSolvedP57WordProfiles:20,
  independentlyBijectionAndTranspositionInvariantWords:original.length,
  outcomes
}, null, 2));
