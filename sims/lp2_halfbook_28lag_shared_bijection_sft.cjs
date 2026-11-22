'use strict';

/**
 * 28-page half-book shared-bijection equality gate.
 *
 * Freeze before any unknown-plaintext scoring: compare physical LP2 pages
 * p and p+28 at the same zero-based within-page rune offset, p=0..27.
 * Every shared bijection at an aligned position preserves equality between
 * its two plaintext inputs, regardless of the undisclosed key or alphabet.
 *
 * Run: node sims/lp2_halfbook_28lag_shared_bijection_sft.cjs
 * Node.js 22 CommonJS; no dependencies and no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const physical = gp.pages.filter(p => p.page <= 55);
const original = physical.flatMap(p => p.indices);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));

/** @param {string} source @returns {number[][]} */
function parseWords(source) {
  const words = [];
  let word = [];
  for (const character of source) {
    if (runeIndex.has(character)) {
      word.push(runeIndex.get(character));
    } else if (character === '%' || character === '/' || /\s/u.test(character)) {
      // Physical page and line breaks do not end an original printed word.
    } else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const words = parseWords(transcript.split('%').slice(0, 55).join('%'));
assert.equal(physical.length, 56);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(words.flat(), original);

const pageBounds = new Map();
let absolute = 0;
for (const p of physical) {
  pageBounds.set(p.page, [absolute, p.indices.length]);
  absolute += p.indices.length;
}
assert.equal(pageBounds.get(50)[1], 0);

const pairedIndices = [];
const originalByPair = [];
for (let page = 0; page < 28; page++) {
  const a = pageBounds.get(page);
  const b = pageBounds.get(page + 28);
  let matched = 0;
  for (let i = 0; i < Math.min(a[1], b[1]); i++) {
    pairedIndices.push([a[0] + i, b[0] + i]);
    if (original[a[0] + i] === original[b[0] + i]) matched++;
  }
  originalByPair.push({pages: [page, page + 28], opportunities: Math.min(a[1], b[1]), identical: matched});
}
assert.equal(pairedIndices.length, 5663);

/** @param {number[]} tape @returns {number} */
function countEqual(tape) {
  let total = 0;
  for (const [a, b] of pairedIndices) if (tape[a] === tape[b]) total++;
  return total;
}
assert.equal(countEqual(original), 195);
assert.equal(originalByPair.reduce((s, r) => s + r.identical, 0), 195);

const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/** Source-native GP29: preserve ING/IO tokens and documented substitutions.
 * @param {string} text @returns {number[][]}
 */
function nativeWords(text) {
  const out = [];
  for (let term of text.toUpperCase().match(/[A-Z]+/g) || []) {
    term = term.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    const symbols = [];
    for (let i = 0; i < term.length;) {
      const t = tokens.find(x => term.startsWith(x.s, i));
      assert.ok(t, 'Unencodable GP word ' + term);
      symbols.push(t.i);
      i += t.s.length;
    }
    out.push(symbols);
  }
  return out;
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

/** @param {number[][]} pool @returns {Map<number, number[][]>} */
function byLength(pool) {
  const out = new Map();
  for (const w of pool) {
    if (!out.has(w.length)) out.set(w.length, []);
    out.get(w.length).push(w);
  }
  return out;
}

/** @param {Map<number, number[][]>} bins @param {()=>number} rng @returns {number[]} */
function sample(bins, rng) {
  return words.flatMap(w => {
    const pool = bins.get(w.length);
    assert.ok(pool && pool.length, 'No source-native word length ' + w.length);
    return pool[rng() % pool.length];
  });
}

/** @param {number[]} values */
function summary(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
    mean: values.reduce((s, v) => s + v, 0) / values.length
  };
}

const commonRandom = random(0x3301f4a3);
const controls = {};
const originalEnglishFiles = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
for (const [name, filename] of originalEnglishFiles) {
  const pool = nativeWords(read(filename));
  const bins = byLength(pool);
  const results = [];
  for (let i = 0; i < 160; i++) results.push(countEqual(sample(bins, commonRandom)));
  controls[name] = {poolWords: pool.length, samples: results.length, ...summary(results)};
  assert.ok(controls[name].min > 195);
}
assert.deepEqual(
  [controls.Gibran.min, controls.Shakespeare.min, controls.Emerson.min],
  [292, 290, 306]
);

// Source-native solved Cicada register, as calibrated by the existing test corpus.
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const parts = lp1.split(/^###\s+(\d+)/m);
const included = new Set([1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16]);
const solvedWords = [];
for (let i = 1; i + 1 < parts.length; i += 2) {
  if (!included.has(Number(parts[i]))) continue;
  solvedWords.push(...nativeWords(parts[i + 1].split('\n')
    .filter(line => !line.trim().startsWith('[') && !line.trim().startsWith('#'))
    .join(' ')));
}
solvedWords.push(...parseWords(transcript.split('%').at(-1)));
assert.equal(solvedWords.length, 715);
const solvedBins = byLength(solvedWords);
const solvedRandom = random(0x3310f123);
const solvedResults = [];
for (let i = 0; i < 500; i++) solvedResults.push(countEqual(sample(solvedBins, solvedRandom)));
controls['Solved LP1 + p57'] = {
  poolWords: solvedWords.length,
  samples: solvedResults.length,
  ...summary(solvedResults)
};
assert.equal(controls['Solved LP1 + p57'].min, 299);

// Exact positive plant: the two halves use the SAME otherwise arbitrary
// per-rune-position shift for each physical-page pair, including unmatched
// positions. An unknown general permutation would preserve equality too.
const gibran = byLength(nativeWords(read(originalEnglishFiles[0][1])));
const plantedPlaintext = sample(gibran, commonRandom);
const shifts = Array.from({length: 28}, () =>
  Array.from({length: 300}, () => commonRandom() % 29));
const encrypted = [];
const decrypted = [];
for (const p of physical) {
  const [start, length] = pageBounds.get(p.page);
  const key = shifts[p.page % 28];
  assert.ok(length <= key.length);
  for (let i = 0; i < length; i++) {
    const plaintext = plantedPlaintext[start + i];
    const ciphertext = (plaintext + key[i]) % 29;
    encrypted.push(ciphertext);
    decrypted.push((ciphertext - key[i] + 29) % 29);
  }
}
assert.deepEqual(decrypted, plantedPlaintext);
assert.equal(countEqual(encrypted), countEqual(plantedPlaintext));
assert.equal(encrypted.length, 12956);
assert.ok(countEqual(encrypted) > 195);

console.log(JSON.stringify({
  model: 'reused arbitrary position-wise GP29 bijection for page p and p+28',
  original: {runes: original.length, pages: physical.length, pairedPositions: pairedIndices.length,
    identical: countEqual(original), rate: countEqual(original) / pairedIndices.length,
    byPagePair: originalByPair},
  controls,
  positive: {
    recovered: decrypted.length,
    plaintextEqualities: countEqual(plantedPlaintext),
    ciphertextEqualities: countEqual(encrypted),
    exactReencryption: true
  },
  decision: 'The original 28-page matched-position equality rate is below all 980 native-English controls. This rejects shared bijective page-position keys for those finite native-English registers, not independently keyed halves or context-dependent encryption. No unknown plaintext is recovered.'
}, null, 2));
