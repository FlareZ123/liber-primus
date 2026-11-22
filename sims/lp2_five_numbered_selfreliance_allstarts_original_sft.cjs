'use strict';

/**
 * One original-input, source-authentic text-key exclusion for five printed
 * numbered Liber Primus passages. Node.js 22, Windows 11 compatible.
 *
 * Source: neuroretransmit/cicada pinned 2014 first-onion Self-Reliance text.
 * Exact native 2014 GP29 additive running-key mechanism, every contiguous
 * key source position, both signs, one continuous five-unit key clock.
 *
 * Running directly requires network access to raw.githubusercontent.com.
 * Pinned Git blob SHA detects version/content changes.
 *
 * This test does not assert the original source instructed LP2 key use.
 * It excludes only a direct additive source stream without transparent-F
 * key skips, space changes, reordering, or additional transformations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  originalParagraphs, gpLength, longestMatch, gitBlobSha,
} = require('./lp2_pp36_38_numbered_aphorism_crib_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const sourceUrl = 'https://raw.githubusercontent.com/neuroretransmit/cicada/'
  + 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/'
  + '2014/001-twitter/self-reliance.txt';
const sourceSha = '12a6bc018047a1276e77f2b7f633d5905732fff9';

/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = new Uint32Array(29);
  for (const v of symbols) counts[v]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (symbols.length * (symbols.length - 1));
}

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = new Map(corpus.translit.map((s, i) => [s, i]));
const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
/**
 * Source-native Gematria Primus word serialization, with historically
 * attested QU, V, K, Z folding and the ING / IO contractions.
 * @param {string} raw
 * @returns {number[]}
 */
function gpWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; continue; }
    if (word.startsWith('IO', i)) { out.push(27); i += 2; continue; }
    const token = digraphs.find(s => word.startsWith(s, i)) || word[i];
    assert(translit.has(token), 'unsupported GP source symbol ' + token);
    out.push(translit.get(token));
    i += token.length;
  }
  return out;
}

const numbered = [
  corpus.pages[36].indices.slice(99, 238),
  corpus.pages[37].indices.slice(0, 91),
  corpus.pages[37].indices.slice(91, 189),
  corpus.pages[37].indices.slice(189, 228)
    .concat(corpus.pages[38].indices.slice(0, 57)),
  corpus.pages[38].indices.slice(57, 186),
];
assert.deepEqual(numbered.map(p => p.length), [139, 91, 98, 96, 129]);
const original = numbered.flat();
assert.equal(original.length, 553);
const wordLengths = originalParagraphs(read('resources/liber-primus/lp2-transcription.txt'));
assert.deepEqual(wordLengths.map(p => p.reduce((a, v) => a + v, 0)),
  numbered.map(p => p.length));

function histogramScore(hist, length) {
  let sum = 0;
  for (const n of hist) sum += n * (n - 1);
  return sum / (length * (length - 1));
}

/** @param {number[]} key */
function exhaustiveDirectKeys(key) {
  const best = {minus: {ioc: -1}, plus: {ioc: -1}};
  let originalStarts = 0;
  let genuineLongWindowHits = 0;
  let firstPassageHits = 0;
  for (const sign of [-1, +1]) {
    for (let off = 0; off + original.length <= key.length; off++) {
      const whole = new Uint32Array(29);
      const first = new Uint32Array(29);
      const second = new Uint32Array(29);
      const heldout = new Uint32Array(29);
      for (let i = 0; i < original.length; i++) {
        const z = (original[i] + sign * key[off + i] + 29) % 29;
        whole[z]++;
        if (i < 139) first[z]++;
        if (i >= 139 && i < 230) second[z]++;
        if (i >= 139) heldout[z]++;
      }
      const score = histogramScore(whole, 553);
      const firstScore = histogramScore(first, 139);
      const secondScore = histogramScore(second, 91);
      const heldoutScore = histogramScore(heldout, 414);
      const label = sign === -1 ? 'minus' : 'plus';
      if (score > best[label].ioc) {
        best[label] = {ioc: score, sourceOffset: off, firstIoC: firstScore,
          secondIoC: secondScore, heldoutIoC: heldoutScore};
      }
      if (score >= 0.05) genuineLongWindowHits++;
      if (firstScore >= 0.051089563) firstPassageHits++;
      originalStarts++;
    }
  }
  return {best, originalStarts, genuineLongWindowHits, firstPassageHits};
}

async function main() {
  const response = await fetch(sourceUrl);
  assert(response.ok, 'pinned source fetch failed HTTP ' + response.status);
  const sourceBytes = Buffer.from(await response.arrayBuffer());
  assert.equal(gitBlobSha(sourceBytes), sourceSha,
    'the pinned 2014 witness changed');
  const words = sourceBytes.toString('utf8').match(/[A-Za-z]+/g) || [];
  assert.equal(words.length, 10170, '2014 source token count changed');
  const key = words.flatMap(gpWord);
  assert.equal(key.length, 41181);
  const bestCrib = longestMatch(words.map(gpLength), wordLengths);
  assert.equal(bestCrib.length, 7,
    'the original-word-length match changed');
  assert(bestCrib.length < 12, 'a 12+ word literal crib needs adjudication');

  const sourceNative = native.sections.find(s => s.name === '0_koan_1');
  assert(sourceNative, 'missing Cicada solved-LP1 source');
  const solved = Array.from(sourceNative.source_text)
    .filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch));
  assert.equal(solved.length, 780);
  const native553 = solved.slice(0, 553);
  assert(ioc(native553) > 0.05, 'genuine solved-source baseline');
  const plantKeyStart = 1234;
  const planted = native553.map((n, i) => (n + key[plantKeyStart + i]) % 29);
  const recovered = planted.map((n, i) =>
    (n - key[plantKeyStart + i] + 29) % 29);
  assert.deepEqual(recovered, native553,
    'native-GP original-source-key planted inverse');
  const wrongKey = planted.map((n, i) =>
    (n - key[plantKeyStart + i + 1] + 29) % 29);
  assert.notDeepEqual(wrongKey, native553, 'wrong source-key start accepted');

  const result = exhaustiveDirectKeys(key);
  assert.equal(result.originalStarts, 81258);
  assert.equal(result.genuineLongWindowHits, 0);
  assert.equal(result.firstPassageHits, 0);
  assert(Math.abs(result.best.minus.ioc - 0.037063972534528394) < 1e-12);
  assert(Math.abs(result.best.plus.ioc - 0.03720156196765993) < 1e-12);
  console.log(JSON.stringify({
    classification: 'FINITE FIRST-PARTY TEXT-KEY EXCLUSION; NO UNKNOWN PLAINTEXT',
    originalFiveUnitLengths: numbered.map(p => p.length),
    fullCipherRunes: 553,
    source: sourceUrl,
    sourceGitBlobSha: sourceSha,
    sourceWords: words.length,
    sourceGPRunes: key.length,
    actualOriginalIoC: ioc(original),
    pinnedSourceBestWordLengthCrib: bestCrib,
    allKeyStartsTwoDirections: result.originalStarts,
    mostFavorableOriginalInverseBySign: result.best,
    originalAboveNative139Minimum: result.firstPassageHits,
    originalAboveLongGPThreshold005: result.genuineLongWindowHits,
    plantedSolvedLP1GP553IoC: ioc(native553),
    plantedForwardInverse: 'PASS',
    plantedWrongStart: 'DIFFERENT',
    interpretation: 'The 2014 named essay supplies a real historically selected source '
      + 'but no author-selected LP2 key clock. Every contiguous essay key start '
      + 'under direct GP29 addition/subtraction fails native-GP IoC.',
    scope: 'No transparent-F branch, source-word resets, transposition, '
      + 'different essay edition, or source-selected external coordinate',
  }, null, 2));
  console.log('PASS: 81,258 exact all-start direct additive source-key inverses '
    + 'fail the original 139+91+98+96+129 GP29 receiver; solved-LP1 '
    + 'keyed positive and wrong-start control pass.');
}

if (require.main === module) main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
module.exports = {gpWord, ioc, exhaustiveDirectKeys};