'use strict';

/**
 * Complete-word equality-partition test of the one-per-word GP29
 * five-back ciphertext-feedback family on ORIGINAL LP2 ciphertext.
 *
 * For a single unknown bijection sigma_w reused at all positions of
 * original printed word w:
 *   C_j = sigma_w(P_j)                       when j < 5
 *   C_j = (C_(j-5) + sigma_w(P_j)) mod 29    when j >= 5
 * Consequently D_j = C_j for j<5, else (C_j-C_(j-5)) mod29,
 * is exactly sigma_w(P_j) at EVERY position, so the entire equality
 * partition must match the genuine plaintext word under every key.
 *
 * This family remains conditional: the original manuscript has no
 * authenticated source for its 2,896 individual secret permutations.
 * Native reference vocabulary absence is not a proof of cipher failure.
 *
 * Single runnable test (Node.js 22):
 *   node sims/lp2_fiveback_fullword_partition_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const runeRE = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const transcription = read('resources/lp2-transcription.txt');
const words = (transcription.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '')
  .replace(/[\r\n%]/g, '')
  .match(runeRE) || [])
  .map(w => Array.from(w, c => byRune.get(c)));
const flat = words.flat();
assert.equal(words.length, 2896);
assert.equal(flat.length, 12956);
assert.deepEqual(flat, gp.pages.filter(p => p.page < 56 && p.indices.length)
  .flatMap(p => p.indices));

/**
 * @param {number[]} symbols
 * @returns {string}
 * Canonical first-occurrence labels, comma-separated to keep 10+ unambiguous.
 */
function signature(symbols) {
  const labels = new Map();
  return symbols.map(v => {
    if (!labels.has(v)) labels.set(v, labels.size);
    return labels.get(v);
  }).join(',');
}
/** @param {number[]} ciphertext @returns {number[]} */
function differences(ciphertext) {
  return ciphertext.map((v, j) => j < 5
    ? v : (v - ciphertext[j - 5] + 29) % 29);
}
/** @param {number[]} native @returns {string} */
function dictionaryKey(native) {
  return native.length + ':' + signature(native);
}
/**
 * @param {number[][]} sample
 * @param {Set<string>} dictionary
 * @returns {{total:number,unmatched:number,longTotal:number,longUnmatched:number,byLength:Record<string,number>}}
 */
function compare(sample, dictionary) {
  let unmatched = 0, longUnmatched = 0, longTotal = 0;
  const byLength = {};
  for (const word of sample) {
    if (word.length >= 10) longTotal++;
    if (!dictionary.has(dictionaryKey(word))) {
      unmatched++;
      byLength[word.length] = (byLength[word.length] || 0) + 1;
      if (word.length >= 10) longUnmatched++;
    }
  }
  return {total: sample.length, unmatched, longTotal, longUnmatched, byLength};
}
/** @param {number} initial @returns {()=>number} */
function random(initial) {
  let state = initial >>> 0;
  return () => ((state =
    (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}
const sources = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
  ['Latin Vulgate', 'resources/control/latin-vulgate-latin26-wholewords.txt']
];
const refs = sources.map(([name, file]) => {
  const pools = Array.from({length: 15}, () => []);
  const signatures = new Set();
  const content = read(file).split(/\r?\n/)
    .filter(line => !line.startsWith('#')).join(' ');
  for (const token of content.match(/[a-zA-Z]+/g) || []) {
    const w = encodeSourceNativeGP(token);
    if (w.length > 14) continue;
    pools[w.length].push(w);
    signatures.add(dictionaryKey(w));
  }
  return {name, pools, signatures};
});
const union = new Set(refs.flatMap(x => [...x.signatures]));
const originalDifferences = words.map(differences);
const transformed = compare(originalDifferences, union);
const raw = compare(words, union);
assert.equal(transformed.total, 2896);
assert.equal(transformed.unmatched, 78);
assert.equal(transformed.longTotal, 109);
assert.equal(transformed.longUnmatched, 59);
assert.deepEqual([10, 11, 12, 13, 14].map(n => transformed.byLength[n]),
  [22, 16, 14, 4, 3]);
assert.equal(raw.unmatched, 62);
assert.equal(raw.longUnmatched, 52);

// Native source controls: match EVERY authentic word length, but compare
// against three reference registers not containing that sampled source.
// They probe the finite-dictionary miss rate rather than fitting ciphertext.
const rng = random(0x019d3e11);
const controls = [];
for (let i = 0; i < refs.length; i++) {
  const ref = refs[i];
  const withheld = new Set(refs.filter((_, j) => i !== j)
    .flatMap(other => [...other.signatures]));
  const totals = [], longs = [];
  for (let trial = 0; trial < 500; trial++) {
    const sampled = words.map(w => {
      const pool = ref.pools[w.length];
      assert(pool.length > 0, ref.name + ' lacks rune length ' + w.length);
      return pool[Math.floor(rng() * pool.length)];
    });
    const result = compare(sampled, withheld);
    totals.push(result.unmatched);
    longs.push(result.longUnmatched);
  }
  totals.sort((a, b) => a - b);
  longs.sort((a, b) => a - b);
  controls.push({name: ref.name, draws: 500,
    allMissing: [totals[0], totals[25], totals[250], totals[475], totals[499]],
    longMissing: [longs[0], longs[25], longs[250], longs[475], longs[499]]});
}

/**
 * Exact 2,896-secret-map native-control plaintext plant, recovering all
 * original-format 12,956 positions. The first five cipher runes are not
 * silently exempt from a reused word-map equality condition.
 */
const plantRng = random(0x53012911);
const native = words.map(w => {
  const pool = refs[0].pools[w.length];
  return pool[Math.floor(plantRng() * pool.length)];
});
let recovered = 0;
for (let wi = 0; wi < words.length; wi++) {
  const perm = Array.from({length: 29}, (_, j) => j);
  for (let j = 28; j > 0; j--) {
    const k = Math.floor(plantRng() * (j + 1));
    [perm[j], perm[k]] = [perm[k], perm[j]];
  }
  const p = native[wi], c = [];
  for (let j = 0; j < p.length; j++)
    c[j] = j < 5 ? perm[p[j]] : (c[j - 5] + perm[p[j]]) % 29;
  assert.equal(signature(differences(c)), signature(p));
  for (let j = 0; j < p.length; j++) {
    assert.equal(perm.indexOf(differences(c)[j]), p[j]);
    recovered++;
  }
}
assert.equal(recovered, 12956);
console.log(JSON.stringify({
  original: {runes: flat.length, words: words.length,
    fullWordFiveback: transformed, rawCipherWordShape: raw},
  sourceNativeControl: {
    metric: '[minimum, p05, median, p95, maximum] unmatched native full words',
    holdOutOtherThreeCorpora: controls
  },
  plantedPositive: {independentWordPermutations: words.length,
    originalShapeGPPlainRunesRecovered: recovered},
  decision: 'Full-word partition is key-independent for this particular one-per-word map; 78/2896 and 59/109 long native vocabulary misses are NOT a general exclusion without an independently supplied plaintext register and word-key schedule. No LP2 plaintext recovered.'
}, null, 2));
