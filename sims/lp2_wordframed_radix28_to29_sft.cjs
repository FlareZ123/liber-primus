'use strict';
/**
 * Source-word-framed GP28 to GP29 integer inverse, independent of byte-block
 * packing and direct GP28 rune-rank readouts. Node 22, built-ins only.
 * Run from any working directory: node sims/lp2_wordframed_radix28_to29_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const script = read('resources/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const spellings = read('resources/control/english_wordfreq_textblob.txt');
const symbols = db.runes;
const lookup = new Map(symbols.map((s, i) => [s, i]));
const tokens = db.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} latin @returns {number[] | null} */
function gpEncode(latin) {
  const normalized = latin.toUpperCase().replace(/QU/g, 'CW')
    .replace(/K/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG');
  const out = [];
  for (let j = 0; j < normalized.length;) {
    const found = tokens.find(t => normalized.startsWith(t.token, j));
    if (!found) return null;
    out.push(found.index);
    j += found.token.length;
  }
  return out;
}
const words = [];
let seen = 0, sourceEnd = -1;
for (let i = 0; i < script.length; i++) {
  if (lookup.has(script[i])) seen++;
  if (seen === 12956) { sourceEnd = i + 1; break; }
}
assert(sourceEnd > 0, 'Expected all 12,956 unknown source runes');
const original = script.slice(0, sourceEnd).replace(/[\r\n/%]/g, '');
const separator = new RegExp('[^' + symbols.join('') + ']+', 'u');
for (const w of original.split(separator)) {
  if (w) words.push([...w].map(rune => lookup.get(rune)));
}
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, w) => sum + w.length, 0), 12956);
const lexicon = new Set();
for (const line of spellings.split(/\r?\n/)) {
  if (!/^[a-z]+\s+\d+\s*$/i.test(line)) continue;
  const encoded = gpEncode(line.split(/\s+/)[0]);
  if (encoded) lexicon.add(encoded.join(','));
}
assert.equal(lexicon.size, 29059);
/** @param {number} value @param {number} preceding @param {'sorted'|'cyclic'} mode */
function successorRank(value, preceding, mode) {
  return mode === 'sorted'
    ? value - Number(value > preceding)
    : (value - preceding + 29) % 29 - 1;
}
/** @param {number} rank @param {number} preceding @param {'sorted'|'cyclic'} mode */
function successorRune(rank, preceding, mode) {
  return mode === 'sorted'
    ? rank + Number(rank >= preceding)
    : (preceding + rank + 1) % 29;
}
/** @param {number[]} digits @param {number} radix */
function asInteger(digits, radix) {
  return digits.reduce((value, digit) => value * BigInt(radix) + BigInt(digit), 0n);
}
/** @param {bigint} value @param {number} radix */
function asMinimalDigits(value, radix) {
  const output = [];
  do {
    output.unshift(Number(value % BigInt(radix)));
    value /= BigInt(radix);
  } while (value > 0n);
  return output;
}
/**
 * @param {number[][]} cipherWords
 * @param {'sorted'|'cyclic'} mode
 * @param {boolean} firstIsSeed
 */
function decode(cipherWords, mode, firstIsSeed) {
  let previous = 0, rejected = 0;
  const emitted = [], decodedWords = [];
  for (const source of cipherWords) {
    const ranks = [];
    let repeat = false;
    for (let j = 0; j < source.length; j++) {
      const current = source[j];
      const preceding = j ? source[j - 1] : previous;
      if (firstIsSeed && j === 0) continue;
      if (current === preceding) { repeat = true; break; }
      ranks.push(successorRank(current, preceding, mode));
    }
    previous = source[source.length - 1];
    if (repeat) { rejected++; decodedWords.push(null); continue; }
    const restored = asMinimalDigits(asInteger(ranks, 28), 29);
    decodedWords.push(restored);
    emitted.push(...restored);
  }
  return { decodedWords, emitted, rejected };
}
/**
 * Reversible planted codec: integer GP29 word => minimal GP28 digits,
 * then predecessor-excluding rune ranks. The initial word leader in seed
 * mode is explicit framing data, not part of the decoded word.
 * @param {number[][]} plainWords
 * @param {'sorted'|'cyclic'} mode
 * @param {boolean} firstIsSeed
 */
function encryptPlant(plainWords, mode, firstIsSeed) {
  let previous = 0;
  const cipherWords = [];
  for (const plain of plainWords) {
    const ranks = asMinimalDigits(asInteger(plain, 29), 28);
    const encoded = [];
    if (firstIsSeed) {
      const leader = (previous + 7) % 29;
      encoded.push(leader);
      previous = leader;
    }
    for (const rank of ranks) {
      const rune = successorRune(rank, previous, mode);
      assert.notEqual(rune, previous);
      assert.equal(successorRank(rune, previous, mode), rank);
      encoded.push(rune);
      previous = rune;
    }
    cipherWords.push(encoded);
  }
  return cipherWords;
}
const authenticGp = shakespeare.match(/[a-z]+/gi).map(gpEncode)
  .filter(a => a && a[0] !== 0 && a.length <= 14).slice(0, 300);
assert.equal(authenticGp.length, 300);
const findings = [];
for (const mode of ['sorted', 'cyclic']) {
  for (const firstIsSeed of [false, true]) {
    const plantCipher = encryptPlant(authenticGp, mode, firstIsSeed);
    const plant = decode(plantCipher, mode, firstIsSeed);
    assert.deepEqual(plant.decodedWords, authenticGp,
      'Source-native planted GP word recovery failed: ' + mode + '/' + firstIsSeed);
    assert.equal(plant.rejected, 0);
    const original = decode(words, mode, firstIsSeed);
    const freq = new Array(29).fill(0);
    for (const s of original.emitted) freq[s]++;
    const N = original.emitted.length;
    const ioc = freq.reduce((sum, h) => sum + h * (h - 1), 0) / (N * (N - 1));
    const valid = original.decodedWords.filter(x => x !== null);
    const lexHits = valid.filter(x => lexicon.has(x.join(',')));
    const longHits = lexHits.filter(x => x.length >= 4);
    const longWords = valid.filter(x => x.length >= 4);
    const longTypes = new Set(longWords.map(x => x.join(',')));
    const repeatedLongOccurrences = longWords.length - longTypes.size;
    assert.equal(repeatedLongOccurrences, 0);
    // Any fixed 29! relabelling preserves complete-word equality, so a
    // matching-length native reference rules out *all* such hidden alphabets.
    const sourceByLength = Array.from({ length: 20 }, () => []);
    for (const native of shakespeare.match(/[a-z]+/gi)) {
      const gp = gpEncode(native);
      if (gp && gp.length < 20) sourceByLength[gp.length].push(gp.join(','));
    }
    const referenceDuplicates = [];
    for (let offset = 0; offset < 20; offset++) {
      const counters = Array(20).fill(0), seenWords = new Set();
      let duplicates = 0;
      for (const w of valid) {
        if (w.length < 4) continue;
        const pool = sourceByLength[w.length];
        const signature = pool[(offset * 131 + counters[w.length]++) % pool.length];
        if (seenWords.has(signature)) duplicates++;
        seenWords.add(signature);
      }
      referenceDuplicates.push(duplicates);
    }
    const nativeLongDuplicatesRange = [
      Math.min(...referenceDuplicates), Math.max(...referenceDuplicates),
    ];
    const observation = {
      mode, firstIsSeed, recoveredPlantWords: plant.decodedWords.length,
      longWordTokens: longWords.length,
      longWordDuplicates: repeatedLongOccurrences,
      matchedShakespeareDuplicateRange: nativeLongDuplicatesRange,
      originalWords: words.length, rejectedWords: original.rejected,
      candidateWords: valid.length, outputRunes: N, ioc,
      dictionaryWords: lexHits.length,
      dictionaryWordsFourRunesOrMore: longHits.length,
      dictionaryLongExamples: longHits.map(x => x.map(j => db.translit[j]).join('')),
    };
    const checks = firstIsSeed
      ? (mode === 'sorted' ? [62, 9733, 699, 1] : [62, 9738, 696, 1])
      : (mode === 'sorted' ? [85, 12355, 213, 0] : [85, 12367, 202, 3]);
    assert.deepEqual([
      observation.rejectedWords, observation.outputRunes,
      observation.dictionaryWords, observation.dictionaryWordsFourRunesOrMore,
    ], checks);
    const expectedRepeats = firstIsSeed
      ? (mode === 'sorted' ? [423, 492] : [435, 502])
      : (mode === 'sorted' ? [694, 765] : [692, 762]);
    assert.deepEqual(nativeLongDuplicatesRange, expectedRepeats);
    findings.push(observation);
  }
}
console.log(JSON.stringify({
  question: 'Can one original LP2 word carry a direct no-repeat radix28 representation of one native-GP29 plaintext word?',
  source: 'All 2,896 original ciphertext words, 12,956 unknown runes, 29,059 exact GP-encoded lexicon entries',
  negative: 'All four inverse outputs are cipher-like; no decoded GP word of >=4 symbols repeats, while same-length native controls repeat hundreds of such words. This key-independent collision invariant excludes every fixed later permutation of the 29 output symbols under the stated transport.',
  plantedWordsPerModel: 300,
  findings,
}, null, 2));
