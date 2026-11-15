'use strict';

/**
 * Original LP2 GP29 predecessor-conditioned substitution capacity gate.
 * SFT: node sims/lp2_prevstate_chapter_majorization_sft.cjs
 *
 * Model: for each candidate visual chapter g, a fixed family of 29
 * arbitrary GP29 bijections pi[g][previous ciphertext] maps current
 * plaintext rune P_i to current ciphertext rune C_i. Word initials may
 * use a separate unmodelled rule; only internal positions are evaluated.
 * The 9 chapters are hypothetical key resets, not confirmed cryptographic
 * boundaries. No plaintext is inferred by this program.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const pattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const normalized = transcription.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const printed = (normalized.match(pattern) || [])
  .map(w => Array.from(w, ch => runeIndex.get(ch)));
assert.equal(printed.length, 2896);
const original = printed.flat();
assert.equal(original.length, 12956);

const internal = [];
for (const w of printed) {
  internal.push(false);
  for (let j = 1; j < w.length; j++) internal.push(true);
}
assert.equal(internal.filter(Boolean).length, 10060);
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapters = chapterLengths.flatMap((n, g) => Array(n).fill(g));
assert.equal(chapters.length, original.length);
const pages = gp.pages.slice(0, 56)
  .flatMap(p => Array(p.indices.length).fill(p.page));
assert.equal(pages.length, original.length);
const global = Array(original.length).fill(0);

/**
 * For each row (partition id, preceding ciphertext rune), sort its
 * 29 outgoing ciphertext counts decreasingly. The sum of each row's
 * largest k counts bounds the sum for ANY k chosen plaintext runes,
 * for ALL secret row bijections. This is exact majorization.
 * @param {number[]} cipher
 * @param {number[]} partitions
 * @returns {{n:number, groups:number, counts:number[]}}
 */
function capacity(cipher, partitions) {
  const rows = new Map();
  let n = 0;
  for (let i = 1; i < cipher.length; i++) {
    if (!internal[i] || partitions[i] !== partitions[i - 1]) continue;
    const key = 29 * partitions[i] + cipher[i - 1];
    let row = rows.get(key);
    if (!row) { row = Array(29).fill(0); rows.set(key, row); }
    row[cipher[i]]++;
    n++;
  }
  const counts = Array(29).fill(0);
  for (const row of rows.values()) {
    row.sort((a, b) => b - a);
    let total = 0;
    for (let k = 0; k < 29; k++) {
      total += row[k];
      counts[k] += total;
    }
  }
  assert.equal(counts[28], n);
  return {n, groups: rows.size, counts};
}

/**
 * Compare the largest k frequencies of a known plaintext at precisely
 * the same eligible internal source sites.
 * @param {number[]} plain
 * @param {number[]} partitions
 * @returns {{n:number, counts:number[], e:number}}
 */
function plaintextCounts(plain, partitions) {
  const freq = Array(29).fill(0);
  let n = 0;
  for (let i = 1; i < plain.length; i++) {
    if (!internal[i] || partitions[i] !== partitions[i - 1]) continue;
    freq[plain[i]]++;
    n++;
  }
  const e = freq[18];
  freq.sort((a, b) => b - a);
  let sum = 0;
  return {n, e, counts: freq.map(x => (sum += x))};
}
const observed = {
  global: capacity(original, global),
  chapters: capacity(original, chapters),
  pages: capacity(original, pages)
};
assert.deepEqual(observed.global.counts.slice(0, 3), [578, 1086, 1582]);
assert.deepEqual(observed.chapters.counts.slice(0, 3), [1068, 1938, 2692]);
assert.deepEqual(observed.pages.counts.slice(0, 3), [2396, 4135, 5624]);
assert.equal(observed.chapters.n, 10060);
assert.equal(observed.pages.n, 10028);

const tokens = gp.translit.map((str, i) => ({str, i}))
  .sort((a, b) => b.str.length - a.str.length);
/** @param {string} originalWord @returns {number[]} */
function native(originalWord) {
  const word = originalWord.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(x => word.startsWith(x.str, i));
      assert(t, 'Unmapped source word ' + originalWord);
      out.push(t.i);
      i += t.str.length;
    }
  }
  return out;
}
function sourceBag(filename) {
  const bag = new Map();
  const words = read(filename).toUpperCase().match(/[A-Z]+/g) || [];
  for (const w of words) {
    const p = native(w);
    if (!bag.has(p.length)) bag.set(p.length, []);
    bag.get(p.length).push(p);
  }
  return bag;
}
let seed = 0x009ab123;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
function sample(bag) {
  return printed.flatMap(w => {
    const options = bag.get(w.length);
    assert(options && options.length, 'Source lacks GP word length ' + w.length);
    return options[Math.floor(random() * options.length)];
  });
}
function randomPermutation() {
  const a = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function encrypt(plain, keys) {
  const cipher = Array(plain.length);
  let prev = 0, oldChapter = -1;
  for (let i = 0; i < plain.length; i++) {
    if (!internal[i] || chapters[i] !== oldChapter) prev = 0;
    const c = keys[chapters[i]][prev][plain[i]];
    cipher[i] = c;
    prev = c;
    oldChapter = chapters[i];
  }
  return cipher;
}
function decrypt(cipher, keys) {
  const inverse = keys.map(pageKeys => pageKeys.map(row => {
    const inv = Array(29);
    for (let i = 0; i < 29; i++) inv[row[i]] = i;
    return inv;
  }));
  return cipher.map((c, i) => {
    const prev = internal[i] && chapters[i] === chapters[i - 1]
      ? cipher[i - 1] : 0;
    return inverse[chapters[i]][prev][c];
  });
}

const libraries = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt']
];
const sourceStats = [];
for (const [label, filename] of libraries) {
  const bag = sourceBag(filename);
  let minE = Infinity, maxE = 0, sumE = 0;
  for (let r = 0; r < 30; r++) {
    const p = plaintextCounts(sample(bag), chapters);
    assert.equal(p.n, observed.chapters.n);
    const fraction = p.e / p.n;
    minE = Math.min(minE, fraction);
    maxE = Math.max(maxE, fraction);
    sumE += fraction;
    assert(p.e > observed.chapters.counts[0],
      'Native source E frequency must exceed original all-key ceiling');
  }
  sourceStats.push({source: label, samples: 30, minE, maxE, meanE: sumE / 30});
}

// Strong positive: a real reversible chapter-by-previous-rune keyed
// cipher of matched GP-native text MUST satisfy every exact top-k bound.
const plantedPlain = sample(sourceBag(libraries[0][1]));
const secret = Array.from({length: 9},
  () => Array.from({length: 29}, randomPermutation));
const plantedCipher = encrypt(plantedPlain, secret);
assert.deepEqual(decrypt(plantedCipher, secret), plantedPlain);
const plantCaps = capacity(plantedCipher, chapters);
const plantFreq = plaintextCounts(plantedPlain, chapters);
assert.equal(plantCaps.n, plantFreq.n);
for (let k = 0; k < 29; k++) {
  assert(plantFreq.counts[k] <= plantCaps.counts[k],
    'Reversible positive must obey exact top-' + (k + 1) + ' majorization');
}
const output = {
  original_runes: original.length,
  printed_words: printed.length,
  within_word_positions: observed.chapters.n,
  exact_global_top3: observed.global.counts.slice(0, 3),
  exact_chapter_top3: observed.chapters.counts.slice(0, 3),
  exact_page_top3: observed.pages.counts.slice(0, 3),
  page_opportunities: observed.pages.n,
  chapter_max_one_symbol_fraction:
    observed.chapters.counts[0] / observed.chapters.n,
  source_controls: sourceStats,
  planted_full_decryption: true,
  planted_all_29_majorization_checks: true
};
console.log(JSON.stringify(output, null, 2));
