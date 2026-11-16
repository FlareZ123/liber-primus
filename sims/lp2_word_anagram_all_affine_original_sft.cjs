'use strict';

/**
 * Original LP2 word-bag inverse under arbitrary per-word affine key and
 * arbitrary per-word rune-position permutation.
 *
 * C_w = permutation_w(a_w * P_w + b_w mod 29), with each a_w != 0.
 * Inverting this family requires only a GP29 count-bag match against a
 * source-native encoded dictionary, after considering all 28*29 affines.
 * The permutation is unrestricted and may differ for every word.
 *
 * SFT: node sims/lp2_word_anagram_all_affine_original_sft.cjs
 * Node.js 22 CommonJS; no external network or third-party dependency.
 * This is a finite-lexicon exclusion, never a recovered LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const gp = require('../resources/liber-primus/lp2-corpus.json');

/** @typedef {{word:string,frequency:number,runes:number[]}} LexEntry */
/** @typedef {{index:number,length:number,caesar:string[],affine:string[]}} WordResult */

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = read('resources/control/english_wordfreq_textblob.txt');
const solved = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/^#.*$/gm, '');
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const corpus = parseSharedCorpus();
assert.equal(corpus.words.length, 2896);

const words = corpus.words.map(w => Array.from(w.runes, r => {
  const index = glyph.get(r);
  assert.notEqual(index, undefined);
  return index;
}));
assert.equal(words.reduce((sum, w) => sum + w.length, 0), 12956);

/**
 * Rune multiplicity signature. Rune order is discarded.
 * @param {number[]} word
 * @returns {string}
 */
function bag(word) {
  const counts = Array(29).fill(0);
  for (const r of word) counts[r]++;
  return counts.map(v => String.fromCharCode(65 + v)).join('');
}

/**
 * Arbitrary substitution plus arbitrary position permutation preserves
 * the integer partition of symbol multiplicities.
 * @param {number[]} word
 * @returns {string}
 */
function multiplicityPartition(word) {
  const counts = Array(29).fill(0);
  for (const r of word) counts[r]++;
  return counts.filter(v => v).sort((a, b) => b - a).join(',');
}

/** @type {Map<string, LexEntry[]>} */
const lexicon = new Map();
const patterns = new Set();
const reference = [];
for (const row of source.split(/\r?\n/)) {
  const found = /^([a-z]+) (\d+)$/.exec(row);
  if (!found) continue;
  const encoded = encodeSourceNativeGP(found[1]);
  if (encoded.length < 8 || encoded.length > 14) continue;
  /** @type {LexEntry} */
  const entry = { word:found[1], frequency:Number(found[2]), runes:encoded };
  const key = bag(encoded);
  const bucket = lexicon.get(key) || [];
  bucket.push(entry);
  lexicon.set(key, bucket);
  patterns.add(encoded.length + ':' + multiplicityPartition(encoded));
  reference.push(entry);
}
assert.equal(reference.length, 12894);
// Allow exact known-source vocabulary as an independent calibration and
// conservative overinclusive dictionary extension. This includes genuine
// solved words such as CIRCUMFERENCES (14 source GP runes), absent from the
// base frequency lexicon. The editorial prose in this reference can only
// broaden the register; it cannot manufacture an exclusion.
const extra = [];
for (const word of solved.match(/[A-Za-z]+/g) || []) {
  const encoded = encodeSourceNativeGP(word);
  if (encoded.length < 8 || encoded.length > 14) continue;
  const key = bag(encoded);
  const bucket = lexicon.get(key) || [];
  if (bucket.some(x => x.runes.join(',') === encoded.join(','))) continue;
  const entry = {word:word.toLowerCase(),frequency:0,runes:encoded};
  bucket.push(entry);
  lexicon.set(key, bucket);
  patterns.add(encoded.length + ':' + multiplicityPartition(encoded));
  reference.push(entry);
  extra.push(entry.word);
}
assert.deepEqual(extra.sort(), ['behaviors', 'circumferences', 'encrypted',
  'illusions', 'inhabiting', 'primality']);
assert.equal(reference.length, 12900);

/**
 * Independently grant all 812 secret GP29 affines for a source word,
 * with arbitrary additional position permutation allowed after each.
 * @param {number[]} word
 * @returns {{caesar:LexEntry[],affine:LexEntry[]}}
 */
function recover(word) {
  /** @type {Map<string, LexEntry>} */
  const caesar = new Map();
  /** @type {Map<string, LexEntry>} */
  const affine = new Map();
  for (let a = 1; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const transformed = word.map(r => (a * r + b) % 29);
      for (const entry of lexicon.get(bag(transformed)) || []) {
        affine.set(entry.word, entry);
        if (a === 1) caesar.set(entry.word, entry);
      }
    }
  }
  return {caesar:[...caesar.values()], affine:[...affine.values()]};
}

const long = [];
/** @type {WordResult[]} */
const matched = [];
const byLength = new Map();
let unrestrictedMatches = 0;
for (let i = 0; i < words.length; i++) {
  const sourceWord = words[i];
  const length = sourceWord.length;
  if (length < 8 || length > 14) continue;
  const candidate = recover(sourceWord);
  const prev = byLength.get(length) || {total:0,caesar:0,affine:0,anyBijection:0};
  prev.total++;
  if (candidate.caesar.length) prev.caesar++;
  if (candidate.affine.length) prev.affine++;
  const hasUnrestricted = patterns.has(length + ':' + multiplicityPartition(sourceWord));
  if (hasUnrestricted) {prev.anyBijection++;unrestrictedMatches++;}
  byLength.set(length, prev);
  if (candidate.affine.length) matched.push({
    index:i,length,caesar:candidate.caesar.map(x => x.word),
    affine:candidate.affine.map(x => x.word)
  });
  long.push(i);
}
assert.equal(long.length, 343);
assert.equal(unrestrictedMatches, 343);
assert.equal(matched.length, 17);
assert.equal(matched.filter(x => x.caesar.length > 0).length, 0);
for (let n = 10; n <= 14; n++) assert.equal(byLength.get(n).affine, 0);

// Positive controls: an independent affine key and arbitrary whole-word
// permutation always recover their source word through the same inverse.
const plant = [];
for (let i = 0; i < 40; i++) {
  const sample = reference[(i * 317 + 17) % reference.length];
  const a = 1 + (i * 13) % 28;
  const b = (i * 19 + 11) % 29;
  const c = sample.runes.map(v => (a * v + b) % 29);
  const shuffled = c.slice().reverse();
  if (i % 2) shuffled.push(shuffled.shift());
  const got = recover(shuffled).affine.map(x => x.word);
  assert(got.includes(sample.word));
  plant.push({word:sample.word,a,b});
}
console.log('ORIGINAL_WORD_BAG_AFFINE ' + JSON.stringify({
  sourceWords:words.length,sourceRunes:12956,sourceLongWords:long.length,
  nativeDictionaryEntries:reference.length,addedAuthenticSolvedWords:extra,sourceNativeBagSignatures:lexicon.size,
  byLength:Object.fromEntries([...byLength].sort((a,b)=>a[0]-b[0])),
  caesarWithArbitraryPositionPermutation:0,
  affineWithArbitraryPositionPermutation:matched.length,
  unmatchedOriginalLongWords:long.length-matched.length,
  allSecretArbitraryAlphabetWithPermutation:unrestrictedMatches,
  matchedOriginalWords:matched,
  sourceNativePositivePlants:plant.length,
  conclusion:'No 10-14-rune original word matches this finite GP-native English lexicon under any of 812 per-word affines, even with unrestricted within-word rune permutation. No LP2 plaintext recovered.'
}));
