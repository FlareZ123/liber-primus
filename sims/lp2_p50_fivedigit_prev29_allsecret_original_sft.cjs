'use strict';

/**
 * LP2 original p50 first-digit × prior-ciphertext 145-row secret-alphabet gate.
 * Source-only, key-independent reversible-cipher necessary condition.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_p50_fivedigit_prev29_allsecret_original_sft.cjs
 *
 * C_i = Q[q_i, C_(i-1)](P_i), where q_i is the literal first character 0..4
 * of original 32x8 table cell (i-1) mod 256. Every one of the 145 Q
 * rows is an entirely arbitrary secret permutation of all 29 GP runes.
 * Physical page first runes are freely copied IVs, not scored.
 * The source has not authenticated this hypothetical operation.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8')
  .replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const originalPages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = originalPages.flatMap(p => p.indices);
const printedTokens = table.pages.flatMap(p => p.tokens);
assert.equal(originalPages.length, 55);
assert.equal(original.length, 12956);
assert.equal(printedTokens.length, 256);
assert.deepEqual(printedTokens.map(t => t[0]).sort()
  .filter((d, i, arr) => !i || d !== arr[i-1]), ['0','1','2','3','4']);
const originalWords = (read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('').replace(/\/\n/g, '')
  .replace(/\n/g, '').match(new RegExp('[' + gp.runes.join('') + ']+', 'gu')) || [])
  .map(w => [...w].map(r => gp.runes.indexOf(r)));
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flat(), original);
const wordStarts = new Set();
let cursor = 0;
for (const w of originalWords) {
  wordStarts.add(cursor);
  cursor += w.length;
}
assert.equal(cursor, original.length);
assert.equal(wordStarts.size, 2896);
const pageStarts = new Set();
const pageAt = new Int8Array(original.length);
cursor = 0;
for (const page of originalPages) {
  pageStarts.add(cursor);
  for (const _ of page.indices) pageAt[cursor++] = page.page;
}
assert.equal(cursor, original.length);
assert.equal(pageStarts.size, 55);

/** @param {number} physicalPage @returns {number} */
function chapter(physicalPage) {
  if (physicalPage <= 2) return 0;
  if (physicalPage <= 7) return 1;
  if (physicalPage <= 14) return 2;
  if (physicalPage <= 22) return 3;
  if (physicalPage <= 26) return 4;
  if (physicalPage <= 32) return 5;
  if (physicalPage <= 39) return 6;
  if (physicalPage <= 53) return 7;
  return 8;
}

/** @param {number} originalRuneIndex @returns {number} */
function highDigit(originalRuneIndex) {
  const token = printedTokens[(originalRuneIndex - 1) % 256];
  const digit = token.charCodeAt(0) - 48;
  assert(digit >= 0 && digit <= 4);
  return digit;
}

/**
 * For every secret permutation row, each one of k chosen GP plaintext
 * labels can receive at most one observed ciphertext bin. The sum of
 * the k largest bins in each state is the exact maximum for arbitrary
 * independent secret rows. No assumed English/key training enters.
 *
 * @param {number[]} cipher
 * @param {{chapterPrivate:boolean, withinWord:boolean}} settings
 */
function envelope(cipher, settings) {
  assert.equal(cipher.length, original.length);
  const counts = new Map();
  let eligible = 0;
  let adjacentRepeats = 0;
  const digitExposures = [0,0,0,0,0];
  for (let i = 1; i < cipher.length; i++) {
    if (pageStarts.has(i)) continue;
    if (settings.withinWord && wordStarts.has(i)) continue;
    const digit = highDigit(i);
    const key = (settings.chapterPrivate ? chapter(pageAt[i]) * 145 : 0)
      + digit * 29 + cipher[i - 1];
    let row = counts.get(key);
    if (!row) {
      row = new Uint16Array(29);
      counts.set(key, row);
    }
    row[cipher[i]]++;
    eligible++;
    digitExposures[digit]++;
    if (cipher[i] === cipher[i-1]) adjacentRepeats++;
  }
  const kValues = [1,2,3,5,8,10];
  const maxima = Object.fromEntries(kValues.map(k => [k, 0]));
  let equalOrdered = 0;
  let totalOrdered = 0;
  for (const histogram of counts.values()) {
    const sorted = [...histogram].sort((a,b) => b-a);
    for (const k of kValues) {
      maxima[k] += sorted.slice(0, k).reduce((a,b) => a+b, 0);
    }
    const n = sorted.reduce((a,b) => a+b, 0);
    totalOrdered += n * (n-1);
    equalOrdered += sorted.reduce((a,b) => a+b*(b-1), 0);
  }
  return {
    eligible, adjacentRepeats, occupiedSecretRows: counts.size,
    digitExposures, maxima,
    invariantWithinRowEquality: equalOrdered / totalOrdered
  };
}
const book = envelope(original, {chapterPrivate:false, withinWord:false});
const wordInterior = envelope(original, {chapterPrivate:false, withinWord:true});
const chapterPrivate = envelope(original, {chapterPrivate:true, withinWord:false});
const chapterPrivateWord = envelope(original, {chapterPrivate:true, withinWord:true});
assert.equal(book.eligible, 12901);
assert.equal(book.adjacentRepeats, 86);
assert.equal(book.occupiedSecretRows, 145);
assert.deepEqual(book.digitExposures, [3025,2926,3270,2825,855]);
assert.deepEqual(book.maxima,
  {1:1013,2:1887,3:2703,5:4146,8:6021,10:7138});
assert.equal(wordInterior.eligible, 10028);
assert.equal(wordInterior.adjacentRepeats, 63);
assert.deepEqual(wordInterior.maxima,
  {1:869,2:1602,3:2263,5:3453,8:4968,10:5848});
assert.equal(chapterPrivate.occupiedSecretRows, 1273);
assert.deepEqual(chapterPrivate.maxima,
  {1:2383,2:4189,3:5658,5:7921,8:10344,10:11414});
assert.equal(chapterPrivateWord.occupiedSecretRows, 1250);
assert.deepEqual(chapterPrivateWord.maxima,
  {1:2094,2:3641,3:4878,5:6786,8:8636,10:9337});

/** @param {number} seed @returns {()=>number} */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number[]} values @param {()=>number} rng @returns {number[]} */
function shuffled(values, rng) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

/** @param {()=>number} rng @returns {number[][]} */
function secretKey(rng) {
  return Array.from({length:145}, () =>
    shuffled(Array.from({length:29}, (_, i) => i), rng));
}

/**
 * @param {number[]} plaintext
 * @param {number[][]} secretPermutations
 */
function encrypt(plaintext, secretPermutations) {
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    if (pageStarts.has(i)) out.push(plaintext[i]);
    else out.push(secretPermutations[
      highDigit(i)*29 + out[i-1]][plaintext[i]]);
  }
  return out;
}

/**
 * @param {number[]} ciphertext
 * @param {number[][]} secretPermutations
 */
function decrypt(ciphertext, secretPermutations) {
  const inverse = secretPermutations.map(row => {
    const inv = new Array(29);
    for (let i = 0; i < 29; i++) inv[row[i]] = i;
    return inv;
  });
  const out = [];
  for (let i = 0; i < ciphertext.length; i++) {
    if (pageStarts.has(i)) out.push(ciphertext[i]);
    else out.push(inverse[
      highDigit(i)*29 + ciphertext[i-1]][ciphertext[i]]);
  }
  return out;
}

/** @param {number[]} plaintext @param {boolean} wordsOnly */
function plaintextCounts(plaintext, wordsOnly) {
  const counts = new Uint32Array(29);
  for (let i=0; i<plaintext.length; i++) {
    if (pageStarts.has(i)) continue;
    if (wordsOnly && wordStarts.has(i)) continue;
    counts[plaintext[i]]++;
  }
  const sorted = [...counts].sort((a,b)=>b-a);
  return {
    E:counts[gp.translit.indexOf('E')],
    top1:sorted[0],
    top5:sorted.slice(0,5).reduce((a,b)=>a+b,0)
  };
}

/**
 * Original printed word lengths are held exactly. Plaintext words are
 * sampled from independent original literary witnesses and transcribed
 * using the source-verified ING/IO GP29 spelling.
 * @param {number[][][]} wordBanks
 * @param {()=>number} rng
 */
function matchedNative(wordBanks, rng) {
  const out = [];
  for (const originalWord of originalWords) {
    const candidates = wordBanks[originalWord.length];
    assert(candidates && candidates.length);
    out.push(...candidates[Math.floor(rng() * candidates.length)]);
  }
  assert.equal(out.length, original.length);
  return out;
}
const controls = [];
for (const [name,source,seed] of [
  ['Gibran','resources/control/gibran_prophet_58585.txt',0x33014502],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',0x33014503]
]) {
  const nativeWords = (read(source).toUpperCase().match(/[A-Z]+/g) || [])
    .map(encodeSourceNativeGP);
  const banks = Array.from({length:15}, () => []);
  for (const w of nativeWords) if (w.length>0 && w.length<=14)
    banks[w.length].push(w);
  const rng = seeded(seed);
  let minE = Infinity;
  let minTop5 = Infinity;
  let minInteriorE = Infinity;
  let minInteriorTop5 = Infinity;
  for (let iteration = 0; iteration < 64; iteration++) {
    const sample = matchedNative(banks, rng);
    const full = plaintextCounts(sample, false);
    const inner = plaintextCounts(sample, true);
    minE = Math.min(minE, full.E);
    minTop5 = Math.min(minTop5, full.top5);
    minInteriorE = Math.min(minInteriorE, inner.E);
    minInteriorTop5 = Math.min(minInteriorTop5, inner.top5);
    if (iteration === 0) {
      const key = secretKey(rng);
      const ciphertext = encrypt(sample, key);
      assert.deepEqual(decrypt(ciphertext, key), sample);
      assert.deepEqual(encrypt(decrypt(ciphertext, key), key), ciphertext);
      const possible = envelope(ciphertext,
        {chapterPrivate:false, withinWord:false});
      assert(possible.maxima[1] >= full.E);
      assert(possible.maxima[5] >= full.top5);
    }
  }
  assert(minE > book.maxima[1]);
  assert(minTop5 > book.maxima[5]);
  assert(minInteriorE > wordInterior.maxima[1]);
  assert(minInteriorTop5 > wordInterior.maxima[5]);
  controls.push({
    source:name, nativeWindows:64, minE, minTop5,
    minInteriorE, minInteriorTop5,
    sourceShapedPlantedReencryption:'12956/12956 exact'
  });
}
const verifiedNative = JSON.parse(
  read('resources/external/relikd-solved-gp29-native-v1.json'));
const solvedMap = new Map(gp.runes.map((r,i) => [r,i]));
const solvedRunes = verifiedNative.sections.flatMap(section =>
  [...section.source_text].filter(ch => solvedMap.has(ch))
    .map(ch => solvedMap.get(ch)));
assert.equal(solvedRunes.length,2979);
assert.equal(solvedRunes.filter(v => v === gp.translit.indexOf('E')).length,380);
assert(book.maxima[1]+55 < Math.floor(
  original.length * 380 / solvedRunes.length));
console.log(JSON.stringify({
  status:'PASS: book-shared 145 arbitrary GP29 alphabets cannot carry source-native English proportions',
  source:{
    runes:original.length, physicalPageInitialsFree:pageStarts.size,
    printedWholeWords:originalWords.length, printedTableTokens:printedTokens.length,
    clock:'global rune offset minus one, original printed first digit 0..4',
    state:'first numeral digit x previous observed ciphertext GP29 rune'
  },
  original:{book,wordInterior,chapterPrivate,chapterPrivateWord},
  sourceSolvedGP:{originalRunes:2979,E:380},
  nativeControls:controls,
  interpretation:'The chapter-private 9x145 variant passes only these capacity gates. No original plaintext, historical key, or author instruction is recovered.'
},null,2));
