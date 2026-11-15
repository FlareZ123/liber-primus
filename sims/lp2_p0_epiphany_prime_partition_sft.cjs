'use strict';

/**
 * One-file original-source test of the signed-2016 EPIPHANY SEEKS
 * hypothesis as a prime-length GP29 block-shift key.
 *
 * Run on Windows 11 with Node.js 22 from repository root:
 * node sims/lp2_p0_epiphany_prime_partition_sft.cjs
 *
 * This reads source fixtures only and writes no files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const chapterPages = data.pages.filter((p) => p.page >= 0 && p.page <= 2);
assert.deepStrictEqual(chapterPages.map((p) => [p.page, p.indices.length]),
  [[0, 262], [1, 266], [2, 201]]);
const cipher = chapterPages.flatMap((p) => p.indices);
assert.equal(cipher.length, 729);

// GP-native runes for the *unproved* 2016 phrase EPIPHANY SEEKS.
// GP transliteration uses C for K in SEEKS.
const proposedPlainTitle = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const actualRedTitle = cipher.slice(0, proposedPlainTitle.length);
assert.deepStrictEqual(actualRedTitle,
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const key = actualRedTitle.map((c, i) => (c - proposedPlainTitle[i] + 29) % 29);
assert.deepStrictEqual(key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
const blockLengths = key.map((rune) => data.prime[rune]);
assert.deepStrictEqual(blockLengths,
  [103, 97, 23, 71, 107, 97, 67, 7, 2, 23, 2, 59, 71]);
assert.equal(blockLengths.reduce((total, n) => total + n, 0), cipher.length);

/**
 * Apply each key rune to precisely the number of following positions
 * given by its GP prime. The key and all boundaries are source-derived.
 *
 * @param {number[]} input - Exactly 729 GP29 indices.
 * @param {1|-1} direction - Plus encrypts; minus decrypts.
 * @returns {number[]} Transformed GP29 indices.
 */
function blocks(input, direction) {
  assert.equal(input.length, 729);
  const output = new Array(input.length);
  let pos = 0;
  for (let k = 0; k < key.length; k += 1) {
    const end = pos + blockLengths[k];
    for (; pos < end; pos += 1) {
      output[pos] = (input[pos] + direction * key[k] + 29) % 29;
    }
  }
  assert.equal(pos, input.length);
  return output;
}

/**
 * @param {number[]} xs - GP29 indices.
 * @returns {number} Empirical collision index.
 */
function ioc(xs) {
  const counts = new Array(29).fill(0);
  for (const x of xs) counts[x] += 1;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

const minus = blocks(cipher, -1);
const plus = blocks(cipher, 1);
assert.ok(Math.abs(ioc(cipher) - 0.034082515563997044) < 1e-13);
assert.ok(Math.abs(ioc(minus) - 0.034621414251043876) < 1e-13);
assert.ok(Math.abs(ioc(plus) - 0.03471939583050694) < 1e-13);
assert.deepStrictEqual(blocks(minus, 1), cipher);
assert.deepStrictEqual(blocks(plus, -1), cipher);
assert.notDeepStrictEqual(minus.slice(0, 13), proposedPlainTitle);

// The historical plaintext-F transparent / no-key-consumption rule
// cannot produce a non-F ciphertext symbol when C equals the shift.
let impossibleFPositions = 0;
let impossibleFOutsideTitle = 0;
let offset = 0;
for (let k = 0; k < key.length; k += 1) {
  for (let i = offset; i < offset + blockLengths[k]; i += 1) {
    if (cipher[i] === key[k] && cipher[i] !== 0) {
      impossibleFPositions += 1;
      if (i >= 13) impossibleFOutsideTitle += 1;
    }
  }
  offset += blockLengths[k];
}
assert.equal(impossibleFPositions, 21);
assert.equal(impossibleFOutsideTitle, 20);

// Positive: exact recovery of independently clear solved p57 native GP runes.
const solved = data.pages.find((p) => p.page === 57);
assert.equal(solved.indices.length, 95);
const nativePlant = Array.from({ length: 729 },
  (_, i) => solved.indices[i % solved.indices.length]);
assert.deepStrictEqual(blocks(blocks(nativePlant, 1), -1), nativePlant);


/**
 * Collision pairs within the thirteen independently fixed variable-sized
 * blocks are unchanged under every secret 29-symbol permutation per block.
 * This also holds after arbitrary position permutation within the blocks.
 *
 * @param {number[]} xs - Exactly 729 native GP rune indices.
 * @returns {number} Key-independent pooled within-block collision index.
 */
function blockCollisionIndex(xs) {
  assert.equal(xs.length, 729);
  let offset = 0;
  let equalPairs = 0;
  let possiblePairs = 0;
  for (const size of blockLengths) {
    const freq = new Array(29).fill(0);
    for (let i = offset; i < offset + size; i += 1) freq[xs[i]] += 1;
    equalPairs += freq.reduce((sum, n) => sum + n * (n - 1) / 2, 0);
    possiblePairs += size * (size - 1) / 2;
    offset += size;
  }
  assert.equal(offset, 729);
  return {equalPairs, possiblePairs, value: equalPairs / possiblePairs};
}

const originalBlockPairs = blockCollisionIndex(cipher);
assert.equal(originalBlockPairs.equalPairs, 1070);
assert.equal(originalBlockPairs.possiblePairs, 29657);
assert.ok(Math.abs(originalBlockPairs.value - 0.03607917186498972) < 1e-13);

// Match the repository's independently developed, ordinary GP29 source
// spelling convention; this is a *language reference*, never a fitted key.
const gpTokens = data.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * @param {string} prose - Ordinary Latin English source text.
 * @returns {number[]} GP29 runes from whole source words, concatenated.
 */
function encodeGPReference(prose) {
  const stream = [];
  const words = prose.toUpperCase().match(/[A-Z]+/g) || [];
  for (const word of words) {
    const normalized = word.replace(/[KQ]/g, 'C')
      .replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let i = 0; i < normalized.length;) {
      const token = gpTokens.find((candidate) =>
        normalized.startsWith(candidate.symbol, i));
      assert.ok(token, 'Unmapped GP rune in reference');
      stream.push(token.value);
      i += token.symbol.length;
    }
  }
  return stream;
}

const comparisonTexts = [
  ['shakespeare_first300k.txt', 218800, 1718],
  ['gibran_prophet_58585.txt', 63114, 492],
  ['emerson_essays_2944.txt', 324630, 2551]
];
let comparisons = 0;
let passingReferenceWindows = 0;
const referenceSummaries = [];
for (const [filename, expectedLength, expectedWindows] of comparisonTexts) {
  const text = fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'control', filename), 'utf8');
  const encoded = encodeGPReference(text);
  assert.equal(encoded.length, expectedLength);
  let count = 0;
  let low = Infinity;
  let high = -Infinity;
  for (let offset = 0; offset + 729 <= encoded.length; offset += 127) {
    const value = blockCollisionIndex(encoded.slice(offset, offset + 729)).value;
    low = Math.min(low, value);
    high = Math.max(high, value);
    if (value <= originalBlockPairs.value) passingReferenceWindows += 1;
    count += 1;
  }
  assert.equal(count, expectedWindows);
  assert.ok(low > 0.05);
  comparisons += count;
  referenceSummaries.push({filename, count, low, high});
}
assert.equal(comparisons, 4761);
assert.equal(passingReferenceWindows, 0);

// Positive controls for the exact all-secret theorem: arbitrary per-block
// bijections must preserve the pooled coincidence statistic.
let position = 0;
const permuted = nativePlant.slice();
for (let block = 0; block < blockLengths.length; block += 1) {
  const size = blockLengths[block];
  const multiplier = [1, 2, 3, 4, 5, 6, 7][block % 7];
  for (let i = position; i < position + size; i += 1) {
    permuted[i] = (nativePlant[i] * multiplier + block + 1) % 29;
  }
  position += size;
}
assert.deepStrictEqual(blockCollisionIndex(nativePlant),
  blockCollisionIndex(permuted));
console.log('PASS: arbitrary secret block alphabets preserve collision pairs');
console.log('Original pooled within-block pairs: 1070/29657 (' +
  originalBlockPairs.value.toFixed(12) + ')');
console.log('Native GP reference windows: ' + comparisons +
  '; at or below original: ' + passingReferenceWindows);
for (const summary of referenceSummaries) {
  console.log(summary.filename + ': ' + summary.count +
    ' windows, min ' + summary.low.toFixed(9) +
    ', max ' + summary.high.toFixed(9));
}


// Exact combinatorial background rate for the retrospectively noted
// 729 match: under an explicit uniform independent GP29 title-rune model,
// the inferred additive key is uniform independently at thirteen sites.
// This is a null for arithmetic coincidence, not authorial probability.
let counts = new Map([[0, 1n]]);
for (let i = 0; i < 13; i += 1) {
  const next = new Map();
  for (const [sum, count] of counts) {
    for (const prime of data.prime) {
      const target = sum + prime;
      next.set(target, (next.get(target) || 0n) + count);
    }
  }
  counts = next;
}
const randomKeyCount729 = counts.get(729);
const randomKeyTotal = 29n ** 13n;
assert.equal(randomKeyCount729, 41422038766646980n);
assert.equal(randomKeyTotal, 10260628712958602189n);
console.log('Exact independent-uniform 13-rune key prime-sum729 null: ' +
  randomKeyCount729 + '/' + randomKeyTotal + ' = ' +
  (Number(randomKeyCount729) / Number(randomKeyTotal)).toFixed(12));


// A stronger, nonuniform-language null freezes exactly the original 13-rune
// red p0 source and compares every *consecutive* 8+5 GP native-English word
// pair in the three preexisting independent controls. No fitted plaintext.
const candidatePhraseTokens = data.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/**
 * @param {string} word
 * @returns {number[]}
 */
function encodeNativeWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const output = [];
  for (let p = 0; p < normalized.length;) {
    const token = candidatePhraseTokens.find((item) => normalized.startsWith(item.symbol, p));
    assert.ok(token);
    output.push(token.value);
    p += token.symbol.length;
  }
  return output;
}
let eligibleLanguagePairs = 0;
let titleLikePrimeSums = 0;
const genuinePhraseAlternatives = [];
for (const [filename, expectedEligible, expectedHit] of [
  ['shakespeare_first300k.txt', 187, 3],
  ['gibran_prophet_58585.txt', 30, 1],
  ['emerson_essays_2944.txt', 232, 0]
]) {
  const prose = fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'control', filename), 'utf8');
  const words = prose.match(/[A-Za-z]+/g) || [];
  let eligible = 0;
  let hits = 0;
  for (let i = 0; i + 1 < words.length; i += 1) {
    const first = encodeNativeWord(words[i]);
    if (first.length !== 8) continue;
    const second = encodeNativeWord(words[i + 1]);
    if (second.length !== 5) continue;
    eligible += 1;
    const phrase = first.concat(second);
    const sum = phrase.reduce((total, rune, k) =>
      total + data.prime[(actualRedTitle[k] - rune + 29) % 29], 0);
    if (sum === 729) {
      hits += 1;
      genuinePhraseAlternatives.push(words[i] + ' ' + words[i + 1]);
    }
  }
  assert.equal(eligible, expectedEligible);
  assert.equal(hits, expectedHit);
  eligibleLanguagePairs += eligible;
  titleLikePrimeSums += hits;
}
assert.equal(eligibleLanguagePairs, 449);
assert.equal(titleLikePrimeSums, 4);
assert.deepStrictEqual(genuinePhraseAlternatives,
  ['constant Titus', 'SICINIUS Where', 'SICINIUS Where',
   'laughter rises']);
console.log('Actual native-English 8+5 contiguous source phrases with sum729: ' +
  titleLikePrimeSums + '/' + eligibleLanguagePairs);
console.log('Distinct alternative phrases: ' +
  [...new Set(genuinePhraseAlternatives)].join('; '));

console.log('PASS: source p0-p2 262+266+201 = 729 original runes');
console.log('PASS: proposed title gives 13 fixed key symbols, prime total 729');
console.log('PASS: positive solved-p57 native GP plant, exact 729/729 recovery');
console.log('Original IoC: ' + ioc(cipher).toFixed(12));
console.log('Prime-block C-K IoC: ' + ioc(minus).toFixed(12));
console.log('Prime-block C+K IoC: ' + ioc(plus).toFixed(12));
console.log('Forbidden non-F C==K sites: ' + impossibleFPositions +
  ' (' + impossibleFOutsideTitle + ' after title)');
console.log('First 30 decoded GP runes: ' +
  minus.slice(0, 30).map((x) => data.translit[x]).join(' '));
console.log('NO AUTHENTIC UNKNOWN PLAINTEXT OR CIPHER KEY RECOVERED');
