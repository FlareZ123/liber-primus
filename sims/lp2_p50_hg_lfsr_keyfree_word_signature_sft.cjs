"use strict";

/**
 * Original-cipher, completely key-free inverse for any fourth-order
 * GF29 additive keystream with the source-selected p50 R*G polynomial.
 *
 * A native-GP candidate word P and an original word C, both of length n,
 * can be related by C=P+K with arbitrary four initial key elements and
 * A[0]K[i]+...+A[4]K[i+4]=0 iff their length-(n-4) four-tap
 * annihilator signatures agree. Thus matching is necessary AND sufficient
 * for ANY secret 4-rune seed, even a new seed for each original word.
 *
 * No English score, cipher key or unknown plaintext is fitted. Exact
 * all-word source dictionary, true randomly keyed encrypt/decrypt positive
 * controls and adjacent-word propagation check.
 *
 * Read-only Node22 CommonJS, Windows 11 compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpusPages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const sourceTape = corpusPages.flatMap(p => p.indices);
const CHAPTER_ENDS = [729,1874,3603,5506,6527,7960,9640,12648,12956];
const MOD = x => (x % 29 + 29) % 29;

const originalWords = [];
const runeIndex = new Map(gp.runes.map((g, i) => [g, i]));
const sourceText = read("resources/liber-primus/lp2-transcription.txt");
let last = [], count = 0, offset = 0;
for (const glyph of sourceText) {
  if (runeIndex.has(glyph)) {
    last.push(runeIndex.get(glyph));
    count++;
    if (count === 12956) {
      originalWords.push({start:offset, runes:last});
      break;
    }
  } else if ("-.&".includes(glyph) && last.length) {
    originalWords.push({start:offset, runes:last});
    offset += last.length;
    last = [];
  }
}
assert.equal(count, 12956);
assert.equal(originalWords.length, 2896);
assert.deepEqual(originalWords.flatMap(w => w.runes), sourceTape);
const numLong = originalWords.filter(w => w.runes.length >= 8).length;
const noFLong = originalWords.filter(w =>
  w.runes.length >= 8 && !w.runes.includes(0)).length;
assert.equal(numLong, 343);
assert.equal(noFLong, 247);

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const p = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      p[i + j] = MOD(p[i + j] + a[i] * b[j]);
  return p;
}
const H = [3,26,24], R = [23,6,10], G = [27,5,15];
const forward = multiply(R, G);
const signed = multiply(H, G);
const reverse = forward.slice().reverse();
assert.deepEqual(forward, [12,16,7,24,5]);
assert.deepEqual(signed, [23,21,11,17,12]);
assert(forward.every((v, i) => v === MOD(27 * signed[i])),
  "p23 R is 27× signed H; scalar factors share the annihilator");
assert.deepEqual(reverse, [5,24,7,16,12]);
// Show the source shape is the exact original 256-cell GF29 factor.
// The byte order is the printed p50 row-major order.
const descending = forward.slice().reverse();
const invLead = Array.from({length:29}, (_, i) => i)
  .find(i => MOD(i * descending[0]) === 1);
assert.notEqual(invLead, undefined);
const remainder = grid.bytes.map(MOD);
const quotient = [];
for (let i = 0; i < remainder.length - descending.length + 1; i++) {
  const q = MOD(remainder[i] * invLead);
  quotient.push(q);
  for (let j = 0; j < descending.length; j++)
    remainder[i+j] = MOD(remainder[i+j] - q * descending[j]);
}
assert.deepEqual(remainder.slice(-4), [0,0,0,0]);
assert.equal(quotient.length, 252);

/**
 * The complete source lexicon is fixed independently of unknown LP2.
 * @returns {Map<string,{indices:number[],word:string}>}
 */
function buildLexicon() {
  const sources = [
    "resources/control/english_wordfreq_textblob.txt",
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/shakespeare_first300k.txt",
    "resources/control/emerson_essays_2944.txt",
    "resources/liber-primus/lp1-plaintext-reference.txt",
    "resources/control/blake_song_of_liberty_train.txt"
  ];
  const result = new Map();
  for (const file of sources) {
    for (const word of read(file).match(/[A-Za-z]+/g) || []) {
      const seq = encodeSourceNativeGP(word);
      // Store by actual GP rune sequence so variant spellings do not
      // inflate the number of distinct decryptable candidate words.
      const key = seq.join(",");
      if (!result.has(key)) result.set(key, {indices:seq, word});
    }
  }
  return result;
}
const lexicon = buildLexicon();
const longLexicon = [...lexicon.values()]
  .filter(v => v.indices.length >= 5);
assert(longLexicon.length >= 28000);

/**
 * Filter key-invariant consecutive 5-tap dot products.
 * @param {number[]} values @param {number[]} filter
 * @returns {string}
 */
function signature(values, filter) {
  const out = [];
  for (let i = 0; i + 4 < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < 5; j++)
      sum += values[i+j] * filter[j];
    out.push(MOD(sum));
  }
  return out.join(",");
}

/** For every real word length, choose an attested GP-native control word. */
const byLen = new Map();
for (const v of lexicon.values())
  if (!byLen.has(v.indices.length))
    byLen.set(v.indices.length, v.indices);
for (let i = 1; i <= 14; i++)
  assert(byLen.has(i), "source GP register word length " + i);

/** @param {number[]} filter @param {number[]} initial @param {number} n */
function keyFromSeed(filter, initial, n) {
  const key = initial.slice(0, Math.min(n, 4));
  const inv = Array.from({length:29}, (_, i) => i)
    .find(x => MOD(filter[4] * x) === 1);
  assert.notEqual(inv, undefined);
  for (let i = 4; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++)
      sum += filter[j] * key[i - 4 + j];
    key.push(MOD(-sum * inv));
  }
  return key;
}
let randomState = 0x33014929;
/** @returns {number} */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}

/**
 * The only unknown model parameter is four arbitrary GP29 seed runes.
 * Exact annihilation is necessary and sufficient for any word with
 * length at least 4. We do not choose the seed from original ciphertext.
 *
 * @param {number[]} filter
 * @returns {{recovered:number, longMatches:number}}
 */
function plantedControl(filter) {
  let recovered = 0, longMatches = 0;
  for (const w of originalWords) {
    const p = byLen.get(w.runes.length);
    const initial = Array.from({length:4}, () => random() % 29);
    const stream = keyFromSeed(filter, initial, p.length);
    const c = p.map((v, j) => MOD(v + stream[j]));
    const decoded = c.map((v, j) => MOD(v - stream[j]));
    assert.deepEqual(decoded, p);
    assert.equal(signature(c, filter), signature(p, filter));
    recovered += decoded.length;
    if (p.length >= 8) {
      assert.equal(signature(c, filter), signature(p, filter));
      longMatches++;
    }
  }
  assert.deepEqual([recovered, longMatches], [12956, 343]);
  return {runesRecovered:recovered, longWordSignatures:longMatches};
}

/**
 * Search ALL distinct genuine GP word sequences with the model-specific
 * annihilator. This is a key-free complete dictionary inverse.
 * @param {number[]} filter
 */
function originalMatches(filter) {
  const indexed = new Map();
  for (const candidate of longLexicon) {
    const id = candidate.indices.length + "/" +
      signature(candidate.indices, filter);
    if (!indexed.has(id)) indexed.set(id, []);
    indexed.get(id).push(candidate);
  }
  const matches = [];
  for (let i = 0; i < originalWords.length; i++) {
    const original = originalWords[i];
    if (original.runes.length < 5) continue;
    const key = original.runes.length + "/" +
      signature(original.runes, filter);
    const candidates = indexed.get(key) || [];
    if (candidates.length) {
      matches.push({
        wordIndex:i,
        absoluteRuneOffset:original.start,
        originalLength:original.runes.length,
        candidateWords:candidates.map(x => x.word),
        candidateIndexes:candidates.map(x => x.indices)
      });
    }
  }
  return matches;
}

/**
 * An exact word crib fixes the complete order-four stream over the whole
 * visual chapter, if the secret seed is shared over that chapter. Extend
 * it to adjacent real words without choosing any English scores.
 * @param {number[]} filter
 * @param {{wordIndex:number,absoluteRuneOffset:number,
 * originalLength:number,candidateIndexes:number[][]}} match
 */
function adjacentSourceWordTest(filter, match) {
  const first = match.absoluteRuneOffset;
  const ch = CHAPTER_ENDS.findIndex(end => first < end);
  const chapterStart = ch ? CHAPTER_ENDS[ch-1] : 0;
  const chapterEnd = CHAPTER_ENDS[ch];
  const p = match.candidateIndexes[0];
  const original = originalWords[match.wordIndex].runes;
  const seed = original.slice(0, 4).map((v, i) => MOD(v - p[i]));
  const initial = keyFromSeed(filter, seed, p.length);
  assert.deepEqual(initial, original.map((v,i) => MOD(v - p[i])));
  const key = Array(chapterEnd - chapterStart).fill(null);
  for (let i = 0; i < 4; i++)
    key[first - chapterStart + i] = seed[i];
  // propagate forward (and backward using nonzero constant coefficient).
  const i4 = Array.from({length:29}, (_, i) => i)
    .find(x => MOD(filter[4] * x) === 1);
  const i0 = Array.from({length:29}, (_, i) => i)
    .find(x => MOD(filter[0] * x) === 1);
  for (let i = first - chapterStart + 4; i < key.length; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++)
      sum += filter[j] * key[i-4+j];
    key[i] = MOD(-sum * i4);
  }
  for (let i = first - chapterStart - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = 1; j <= 4; j++)
      sum += filter[j] * key[i+j];
    key[i] = MOD(-sum * i0);
  }
  const neighbors = [];
  for (const wi of [match.wordIndex-1, match.wordIndex,
    match.wordIndex+1, match.wordIndex+2]) {
    const w = originalWords[wi];
    if (!w || w.start < chapterStart ||
      w.start + w.runes.length > chapterEnd) continue;
    const decoded = w.runes.map((v,i) =>
      MOD(v - key[w.start - chapterStart + i]));
    neighbors.push({
      wordIndex:wi,
      exactAttestedWord:lexicon.has(decoded.join(",")),
      transliteration:decoded.map(v => gp.translit[v]).join(""),
      indices:decoded
    });
  }
  assert(neighbors.some(n => n.wordIndex === match.wordIndex &&
    n.exactAttestedWord));
  assert(neighbors.some(n => n.wordIndex !== match.wordIndex &&
    !n.exactAttestedWord));
  return {keySeed:seed, neighbors};
}

const results = [];
for (const [name, filter] of [
  ["p23-R-times-p39-G", forward],
  ["reversed-coefficient-orientation", reverse]
]) {
  const matches = originalMatches(filter);
  const longMatches = matches.filter(x => x.originalLength >= 8);
  const planted = plantedControl(filter);
  assert.equal(longMatches.length, 1,
    "complete key-free original long-word survivors " + name);
  assert.equal(longMatches[0].originalLength, 8);
  const isForward = name === "p23-R-times-p39-G";
  assert.equal(longMatches[0].wordIndex, isForward ? 2048 : 865);
  const expected = isForward ? "JOURNEYING" : "AFFERENT";
  assert(longMatches[0].candidateWords.some(x =>
    x.toUpperCase() === expected));
  const implicated = adjacentSourceWordTest(filter, longMatches[0]);
  results.push({
    model:name,
    seedParameterCount:4,
    originalWordsCompatibleByLength:Object.fromEntries(
      Array.from({length:14}, (_, i) => i+1).map(len => [
        len, matches.filter(x => x.originalLength === len).length
      ]).filter(([len]) => len >= 5)),
    longOriginalMatches:longMatches,
    impliedChapterStream:implicated,
    planted
  });
}


/**
 * Solved p56 / LP1 F-transparent variant: plaintext F=0 bypasses key
 * consumption and prints F; an encrypted non-F may also print F.
 * The proposed plaintext itself fixes the skip positions exactly.
 *
 * @param {number[]} cipher @param {number[]} plain
 * @param {number[]} filter @returns {boolean}
 */
function transparentCompatible(cipher, plain, filter) {
  const consumed = [];
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) {
      if (cipher[i] !== 0) return false;
    } else consumed.push(MOD(cipher[i] - plain[i]));
  }
  for (let i = 0; i + 4 < consumed.length; i++) {
    let sum = 0;
    for (let j = 0; j < 5; j++)
      sum += filter[j] * consumed[i+j];
    if (MOD(sum) !== 0) return false;
  }
  return true;
}

/** @param {number[]} filter */
function transparentLongMatches(filter) {
  const byLength = new Map();
  for (const value of lexicon.values()) {
    const len = value.indices.length;
    if (len < 8) continue;
    if (!byLength.has(len)) byLength.set(len, []);
    byLength.get(len).push(value);
  }
  const matches = [];
  for (let i = 0; i < originalWords.length; i++) {
    const orig = originalWords[i];
    if (orig.runes.length < 8) continue;
    const found = (byLength.get(orig.runes.length) || [])
      .filter(value => transparentCompatible(
        orig.runes, value.indices, filter));
    if (found.length) matches.push({
      originalWordIndex:i,
      absoluteRuneOffset:orig.start,
      runeLength:orig.runes.length,
      sourceCandidates:found.map(x => x.word)
    });
  }
  return matches;
}

/** Complete authentic GP-native plaintext-F-bypass source positives. */
function plantTransparent(filter) {
  let glyphCount = 0, longCount = 0, bypassCount = 0;
  for (const word of originalWords) {
    const p = byLen.get(word.runes.length);
    const seeds = Array.from({length:4}, () => random() % 29);
    const stream = keyFromSeed(filter, seeds, p.filter(x => x !== 0).length);
    let used = 0;
    const c = p.map(x => {
      if (x === 0) {
        bypassCount++;
        return 0;
      }
      return MOD(x + stream[used++]);
    });
    assert.equal(used, stream.length);
    assert(transparentCompatible(c, p, filter));
    glyphCount += p.length;
    if (p.length >= 8) longCount++;
  }
  assert.deepEqual([glyphCount,longCount], [12956,343]);
  return {cipherRuneCount:glyphCount, longWordCount:longCount,
    literalFBypasses:bypassCount, fullInverseValid:true};
}

const authenticatedSkip = [];
for (const [orientation, filter] of [
  ["p23-R-times-p39-G", forward],
  ["reversed-coefficient-orientation", reverse]
]) {
  const matched = transparentLongMatches(filter);
  const planted = plantTransparent(filter);
  authenticatedSkip.push({
    orientation, originalLongWordMatches:matched,
    countLength8Plus:matched.length,
    countLength9Plus:matched.filter(x => x.runeLength >= 9).length,
    planted
  });
}

console.log(JSON.stringify({
  source:"exact GF29 p50 factor p23 R × centered-red-p39 G, scalar equivalent to signed H × G",
  filter:forward,
  p50QuotientLength:quotient.length,
  originalRunes:sourceTape.length,
  completeOriginalPrintedWords:originalWords.length,
  originalWordsLength8Plus:numLong,
  originalWordsLength8PlusFfree:noFLong,
  independentUniqueGPDictionary:lexicon.size,
  results,
  authenticFtransparent:authenticatedSkip,
  decision:"No original chapter-continuous fourth-order source-polynomial LFSR plaintext; two isolated 8-GP-word coincidences do not extend and all 9-plus-runic original words lack native-English source candidates. Word-by-word IV models are only excluded conditional on this finite source lexicon."
}, null, 2));
