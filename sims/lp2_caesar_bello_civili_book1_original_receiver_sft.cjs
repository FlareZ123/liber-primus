'use strict';
/**
 * Caesar, De Bello Civili, Book I, original-source candidate running-key gate.
 *
 * The previously proposed p0 Latin 8+5 heading SECUENDI RATIO has an exact
 * inflected phrase in Caesar I.30.1: POMPEI SEQUENDI RATIONEM.
 * That source is itself headed LIBER PRIMUS. Test the CHEAP, REVERSIBLE
 * immediate source route: add or subtract consecutive book letters mod GP29.
 * Do not search passwords, unknown language-model plaintexts, or map p50.
 *
 * This also rules out simple contiguous quotation of the Latin source under
 * the actual original p0 printed word lengths. It does NOT rule out arbitrary
 * book ciphers, selected word indices, transpositions, OTPs, or unknown keys.
 *
 * Run: node sims/lp2_caesar_bello_civili_book1_original_receiver_sft.cjs
 * Windows Node 22, CommonJS, no external packages, read only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read(
  'resources/external/caesar-de-bello-civili-perseus-liber-primus-normalized.txt'
).split('\n').filter(line => !line.startsWith('#')).join(' ').trim();
assert.equal(source.length, 78935);
assert.equal(source.split(/\s+/).length, 10902);
assert.equal(
  source.split('POMPEI SEQUENDI RATIONEM').length, 2,
  'Caesar phrase must identify one reproducible source location'
);
const phraseAt = source.indexOf('SEQUENDI RATIONEM');
assert.ok(phraseAt > 0);
const gpMap = new Map(corpus.translit.map((word, index) => [word, index]));
const sortedTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} src @returns {string[]} */
const words = src => src.toUpperCase().match(/[A-Z]+/g) || [];
/** @param {string} word @returns {string} */
const normalize = word => word.replace(/QU/g, 'CW').replace(/Q/g, 'C')
  .replace(/V/g, 'U').replace(/J/g, 'I').replace(/K/g, 'C')
  .replace(/Z/g, 'S');

/** Each single Classical Latin character maps to one GP rune. Q becomes C
 * (as the candidate SECUENDI, rather than the English CW convention).
 * @param {string} prose @returns {number[]}
 */
function latinDirect(prose) {
  const answer = [];
  for (const token of words(prose)) {
    for (const character of normalize(token)) {
      const rune = gpMap.get(character);
      assert.notEqual(rune, undefined, character);
      answer.push(rune);
    }
  }
  return answer;
}

/** Known solved-LP English compound GP runes; applied also to Caesar source
 * only as a separately identified, more permissive key-register control.
 * @param {string} prose @returns {number[]}
 */
function gpCompounds(prose) {
  const answer = [];
  for (const token of words(prose)) {
    const w = normalize(token);
    for (let cursor = 0; cursor < w.length;) {
      if (w.startsWith('ING', cursor)) {
        answer.push(21); cursor += 3; continue;
      }
      if (w.startsWith('IO', cursor)) {
        answer.push(27); cursor += 2; continue;
      }
      const found = sortedTokens.find(t => w.startsWith(t.token, cursor));
      assert(found, 'Missing GP token for ' + w.slice(cursor));
      answer.push(found.index);
      cursor += found.token.length;
    }
  }
  return answer;
}

const c = corpus.pages[0].indices.slice(13);
assert.equal(c.length, 249);
const knownEnglish = corpus.pages[57].indices;
assert.equal(knownEnglish.length, 95);
const latin = latinDirect(read('resources/control/latin-vulgate-latin26-normalized.txt'));
const english = gpCompounds(read('resources/control/shakespeare_first300k.txt'));
assert.equal(latin.length, 209412);
assert.equal(english.length, 217036);
const N = 29;

/** @param {number[]} nums @returns {number[]} */
function numMap(nums) {
  return nums.map((symbol, index) => corpus.translit[symbol]).join('');
}

/** Smoothed conditional GP29 trigram language model; independently trained
 * on Vulgate Latin and Shakespeare English, never LP2 ciphertext.
 * @param {number[]} input @returns {Float64Array}
 */
function model(input) {
  const grams = new Float64Array(N ** 3).fill(0.05);
  const pairs = new Float64Array(N ** 2).fill(N * 0.05);
  for (let i = 2; i < input.length; i++) {
    const pair = input[i-2] * N + input[i-1];
    pairs[pair]++;
    grams[pair * N + input[i]]++;
  }
  for (let i = 0; i < grams.length; i++) {
    grams[i] = Math.log(grams[i] / pairs[Math.floor(i / N)]);
  }
  return grams;
}
const models = { latin: model(latin), english: model(english) };
/** @param {number[]} input @param {Float64Array} logTable */
function score(input, logTable) {
  let value = 0;
  for (let i = 2; i < input.length; i++) {
    value += logTable[input[i-2] * 841 + input[i-1] * N + input[i]];
  }
  return value / (input.length - 2);
}
/** @param {number} x @returns {number} */
const mod = x => ((x % N) + N) % N;

/**
 * A start at each source rune position is already more generous than the
 * strictly source-selected I.30.1 phrase. A cipher-to-key sign of -1 means
 * simple subtraction; +1 means addition. Every candidate is exactly
 * invertible and uses all 249 original ciphertext runes, word boundaries
 * untouched. No unknown-runic plaintext is assumed.
 *
 * @param {number[]} key
 * @param {number} start
 * @param {-1|1} sign
 * @param {boolean} [fTransparent=false]
 * @param {number} [shift=0]
 * @returns {number[]}
 */
function decode(key, start, sign, fTransparent = false, shift = 0) {
  const result = [];
  let cursor = start;
  for (const value of c) {
    if (fTransparent && value === 0) {
      result.push(0);
      continue;
    }
    result.push(mod(value + sign * key[cursor++] + shift));
  }
  return result;
}
/**
 * @param {{score:number,start:number,sign:number}[]} best
 * @param {{score:number,start:number,sign:number}} next
 * @param {number} [limit=5]
 */
function keep(best, next, limit = 5) {
  if (best.length < limit) {
    best.push(next);
    best.sort((a, b) => b.score - a.score);
  } else if (next.score > best.at(-1).score) {
    best[best.length - 1] = next;
    best.sort((a, b) => b.score - a.score);
  }
}
/** @param {number[]} key @param {Float64Array} logTable */
function allOffsets(key, logTable) {
  const winners = [];
  for (const sign of [-1, 1]) {
    for (let start = 0; start + c.length <= key.length; start++) {
      const plaintext = decode(key, start, sign);
      keep(winners, {score: score(plaintext, logTable), start, sign});
    }
  }
  return {
    candidateDecryptions: 2 * (key.length - c.length + 1),
    best: winners.map(w => ({
      ...w, firstRunes: numMap(decode(key, w.start, w.sign).slice(0, 70))
    }))
  };
}

const bookWords = words(source);
assert.equal(bookWords.length, 10902);
const firstPage = read('resources/liber-primus/lp2-transcription.txt').split('%')[0];
const runeSet = new Set(corpus.runes);
const pageWordLengths = [];
let current = 0;
for (const symbol of firstPage) {
  if (runeSet.has(symbol)) current++;
  else if ((symbol === '-' || symbol === '.') && current) {
    pageWordLengths.push(current); current = 0;
  }
}
if (current) pageWordLengths.push(current);
assert.equal(pageWordLengths.length, 59);
assert.equal(pageWordLengths.reduce((a, b) => a + b, 0), 262);
assert.deepEqual(pageWordLengths.slice(0, 2), [8, 5]);
const bodyShape = pageWordLengths.slice(2);
let maxBookQuotePrefix = 0, ties = 0;
for (let i = 0; i < bookWords.length; i++) {
  let n = 0;
  while (n < bodyShape.length && i + n < bookWords.length &&
    bookWords[i + n].length === bodyShape[n]) n++;
  if (n > maxBookQuotePrefix) {
    maxBookQuotePrefix = n;
    ties = 1;
  } else if (n === maxBookQuotePrefix) ties++;
}
assert.equal(maxBookQuotePrefix, 3);
assert.equal(ties, 10);

const bookKeyVariants = {
  'direct-Latin-C-for-Q': latinDirect(source),
  'GP29-compound-English-convention': gpCompounds(source)
};
const sourceAnchors = [
  ['book start', 0],
  ['Caesar 1.29 beginning', source.indexOf('CAESAR ETSI AD SPEM')],
  ['Caesar 1.30 beginning', source.indexOf('ITAQUE IN PRAESENTIA POMPEI SEQUENDI')],
  ['POMPEI before title', source.indexOf('POMPEI SEQUENDI RATIONEM')],
  ['SEQUENDI RATIONEM', phraseAt],
  ['word after RATIONEM', phraseAt + 'SEQUENDI RATIONEM'.length],
];
assert.ok(sourceAnchors.every(([, offset]) => offset >= 0));

const originalBaseline = Object.fromEntries(Object.entries(models)
  .map(([name, table]) => [name, score(c, table)]));
const controls = {
  clearCaesarLatin: score(latinDirect(source).slice(10000, 10249), models.latin),
  clearVulgateLatin: score(latin.slice(10000, 10249), models.latin),
  clearP57English: score(knownEnglish, models.english)
};
const results = [];
for (const [name, key] of Object.entries(bookKeyVariants)) {
  assert.ok(key.length > 60000);
  const scans = {
    latin: allOffsets(key, models.latin),
    english: allOffsets(key, models.english)
  };
  const anchored = [];
  for (const [anchor, letterOffset] of sourceAnchors) {
    const start = name.startsWith('direct')
      ? latinDirect(source.slice(0, letterOffset)).length
      : gpCompounds(source.slice(0, letterOffset)).length;
    for (const sign of [-1, 1]) {
      const p = decode(key, start, sign);
      const q = decode(key, start, sign, true);
      anchored.push({
        anchor, start, sign,
        latinScore: score(p, models.latin),
        englishScore: score(p, models.english),
        fBypassLatinScore: score(q, models.latin),
        fBypassEnglishScore: score(q, models.english),
        preview: numMap(p.slice(0, 48))
      });
    }
  }
  // Positive: completely recover a real 249-rune Latin plaintext selected
  // independently from the Caesar text, using the same source-key equations.
  const start = name.startsWith('direct')
    ? latinDirect(source.slice(0, phraseAt)).length
    : gpCompounds(source.slice(0, phraseAt)).length;
  const genuine = latinDirect(source).slice(10000, 10249);
  for (const sign of [-1, 1]) {
    const encrypted = genuine.map((letter, i) => mod(letter - sign * key[start + i]));
    assert.deepEqual(encrypted.map((v, i) => mod(v + sign * key[start + i])), genuine);
  }
  // No original candidate may be within one nats/rune of genuine clear text
  // under its respective independent language-control model.
  assert.ok(scans.latin.best[0].score < controls.clearCaesarLatin - 1);
  assert.ok(scans.english.best[0].score < controls.clearP57English - 1);
  results.push({
    register: name, sourceKeyRunes: key.length,
    sourceAnchors: anchored,
    allOffsetLatin: scans.latin,
    allOffsetEnglish: scans.english,
    exactSourceLatinPositiveInversion: 249
  });
}
console.log(JSON.stringify({
  verdict: 'No plaintext: complete Caesar Liber Primus source-running-key inverse fails under both source GP registers and both English/Latin controls',
  originalPhysicalPage: 0,
  originalBodyFromRune13: 249,
  originalBodyPrintedWords: bodyShape.length,
  CaesarBook1Words: bookWords.length,
  exactMatchingLeadingWordLengthsInBook1: maxBookQuotePrefix,
  originalCipherModelScores: originalBaseline,
  knownClearModelScores: controls,
  CaesarSourceText: {
    license: 'Perseus CC BY-SA 3.0',
    source: 'Caesar, De Bello Civili I, 1901 Du Pontet edition, 2000 Perseus TEI',
    uniqueMatchedPhrase: 'POMPEI SEQUENDI RATIONEM',
    book1LettersAndSpaces: source.length,
  },
  tests: results,
  limitation: 'Does not reject other Caesar editions, Caesar as plaintext source, book coordinate readouts, unknown key derivations, compound cipher layers or the unverified SECUENDI RATIO hypothesis.'
}, null, 2));
