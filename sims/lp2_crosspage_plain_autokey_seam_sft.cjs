"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const lexicon = fs.readFileSync(path.join(root, "resources/control/english_wordfreq_textblob.txt"), "utf8");

/** @typedef {{c: number[], pages: number[]}} RuneWord */
/** @typedef {{word: string, indices: number[]}} DictionaryWord */
const indexByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const multiTokens = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Convert a printed/transliterated source word to native GP29.
 * Seven historical composite glyphs and the longer ING ligature take priority.
 * @param {string} source
 * @returns {number[] | null}
 */
function toGP(source) {
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = multiTokens.find((value) => normalized.startsWith(value, i)) || normalized[i];
    const n = corpus.translit.indexOf(token === "ING" ? "NG" : token);
    if (n === -1) return null;
    result.push(n);
    i += token.length;
  }
  return result;
}

/**
 * Page separators are layout and never terminate a printed word.
 * The original numerical-table-only physical page 50 has no rune page.
 * @param {string} source
 * @returns {RuneWord[]}
 */
function parsePrintedWords(source) {
  const segments = source.split("%").slice(0, 55);
  assert.equal(segments.length, 55);
  const words = [];
  let c = [], pages = [], page = 0;
  /** @returns {void} */
  function finish() {
    if (c.length) words.push({c, pages});
    c = [];
    pages = [];
  }
  for (const character of segments.join("%")) {
    const index = indexByRune.get(character);
    if (index !== undefined) {
      c.push(index);
      pages.push(page >= 50 ? page + 1 : page);
    } else if (character === "%") {
      page++;
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical wraps are within a GP word.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/**
 * Deduplicate native-GP spellings within each original printed rune length.
 * @param {string} source
 * @returns {Map<number, DictionaryWord[]>}
 */
function dictionaryByLength(source) {
  const grouped = new Map();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^([a-z]+)\s+\d+$/u.exec(line);
    if (!match) continue;
    const indices = toGP(match[1]);
    if (!indices) continue;
    if (!grouped.has(indices.length)) grouped.set(indices.length, new Map());
    grouped.get(indices.length).set(indices.join(","), {word: match[1], indices});
  }
  return new Map(Array.from(grouped, ([length, values]) => [length, Array.from(values.values())]));
}

const words = parsePrintedWords(transcription);
const candidates = dictionaryByLength(lexicon);
const pages = corpus.pages.slice(0, 56).filter((page) => page.indices.length > 0);
const sourceRunes = words.flatMap((word) => word.c);
const canonicalRunes = pages.flatMap((page) => page.indices);
assert.deepEqual(sourceRunes, canonicalRunes);
assert.equal(sourceRunes.length, 12956);
assert.equal(words.length, 2896);
assert.equal(pages.length, 55);

const crossPage = words.map((word, i) => ({word, i})).filter(({word}) =>
  word.pages[0] !== word.pages[word.pages.length - 1]);
assert.equal(crossPage.length, 32);

/**
 * The exact key-independent invariant of C_i = P_i + P_(i-1) + key[page_i].
 * For positions i>=2 in the same page as i-1:
 *       C_i-C_(i-1) = P_i-P_(i-2).
 * This is valid even when P_(i-2) lies on an earlier physical page.
 * @param {number[]} ciphertext
 * @param {RuneWord} printed
 * @param {number[]} candidate
 * @returns {boolean}
 */
function compatible(ciphertext, printed, candidate) {
  for (let i = 2; i < ciphertext.length; i++) {
    if (printed.pages[i] !== printed.pages[i - 1]) continue;
    if (mod29(ciphertext[i] - ciphertext[i - 1]) !==
        mod29(candidate[i] - candidate[i - 2])) return false;
  }
  return true;
}

/**
 * @param {number[]} ciphertext
 * @param {RuneWord} printed
 * @returns {DictionaryWord[]}
 */
function matchedWords(ciphertext, printed) {
  return (candidates.get(printed.c.length) || []).filter((candidate) =>
    compatible(ciphertext, printed, candidate.indices));
}

/**
 * For a seam at position i>=2, its relative page key is fixed by a
 * proposed complete plaintext word:
 *    delta = (C_i-C_(i-1)) - (P_i-P_(i-2)).
 * @param {number[]} ciphertext
 * @param {number[]} plaintext
 * @param {number} cut
 * @returns {number}
 */
function relativePageKey(ciphertext, plaintext, cut) {
  assert.ok(cut >= 2);
  return mod29(ciphertext[cut] - ciphertext[cut - 1] -
    plaintext[cut] + plaintext[cut - 2]);
}

/**
 * @param {number[]} message
 * @param {number[]} pageAtPosition
 * @param {number[]} pageKeys
 * @returns {number[]}
 */
function encrypt(message, pageAtPosition, pageKeys) {
  const output = [];
  let previousPlaintext = 0;
  for (let i = 0; i < message.length; i++) {
    output.push(mod29(message[i] + previousPlaintext + pageKeys[pageAtPosition[i]]));
    previousPlaintext = message[i];
  }
  return output;
}

/**
 * @param {number[]} message
 * @param {number[]} pageAtPosition
 * @param {number[]} pageKeys
 * @returns {number[]}
 */
function decrypt(message, pageAtPosition, pageKeys) {
  const output = [];
  let previousPlaintext = 0;
  for (let i = 0; i < message.length; i++) {
    const value = mod29(message[i] - previousPlaintext - pageKeys[pageAtPosition[i]]);
    output.push(value);
    previousPlaintext = value;
  }
  return output;
}

const rows = [];
for (const {word} of crossPage) {
  const cut = word.pages.findIndex((page) => page !== word.pages[0]);
  assert.ok(cut >= 1);
  const selected = matchedWords(word.c, word);
  const deltas = new Set(cut >= 2
    ? selected.map((candidate) => relativePageKey(word.c, candidate.indices, cut))
    : []);
  rows.push({
    boundary: String(word.pages[0]) + "->" + word.pages[word.pages.length - 1],
    length: word.c.length,
    leftLength: cut,
    constraints: word.c.length - 2 - (cut >= 2 ? 1 : 0),
    dictionarySize: (candidates.get(word.c.length) || []).length,
    compatible: selected.length,
    relativeKeyCandidates: cut >= 2 ? deltas.size : null
  });
}
assert.equal(rows.filter((row) => row.compatible === 0).length, 19);
assert.equal(rows.filter((row) => row.relativeKeyCandidates !== null).length, 25);
assert.equal(rows.filter((row) => row.compatible === 0 && row.relativeKeyCandidates !== null).length, 15);

// Native GP positive: exactly the original 2,896 printed word lengths,
// exact original positions and the 32 original cross-page word cuts.
const plantedWords = words.map((word, i) => {
  const pool = candidates.get(word.c.length);
  assert.ok(pool && pool.length, "no native-GP lexicon words of required length");
  return pool[(i * 173 + 31) % pool.length].indices;
});
const plaintext = plantedWords.flat();
const pageAtPosition = words.flatMap((word) => word.pages);
const pageKeys = Array.from({length: 58}, (_, physicalPage) => (11 * physicalPage + 7) % 29);
const planted = encrypt(plaintext, pageAtPosition, pageKeys);
assert.deepEqual(decrypt(planted, pageAtPosition, pageKeys), plaintext);
assert.deepEqual(encrypt(decrypt(planted, pageAtPosition, pageKeys),
  pageAtPosition, pageKeys), planted);

let offset = 0, nativeSeamsFound = 0, deltaSeamsFound = 0;
for (let i = 0; i < words.length; i++) {
  const word = words[i], trueWord = plantedWords[i];
  if (word.pages[0] !== word.pages[word.pages.length - 1]) {
    const ciphertext = planted.slice(offset, offset + word.c.length);
    const selected = matchedWords(ciphertext, word);
    assert.ok(selected.some((candidate) =>
      candidate.indices.join(",") === trueWord.join(",")), "plant's native word must survive");
    nativeSeamsFound++;
    const cut = word.pages.findIndex((page) => page !== word.pages[0]);
    if (cut >= 2) {
      const trueDelta = mod29(pageKeys[word.pages[cut]] - pageKeys[word.pages[cut - 1]]);
      const deltas = new Set(selected.map((candidate) =>
        relativePageKey(ciphertext, candidate.indices, cut)));
      assert.ok(deltas.has(trueDelta), "plant's true relative key must survive");
      deltaSeamsFound++;
    }
  }
  offset += word.c.length;
}
assert.equal(offset, 12956);
assert.equal(nativeSeamsFound, 32);
assert.equal(deltaSeamsFound, 25);

/** @type {Set<number>} */
const seenPages = new Set();
let pageComponents = 0;
const neighbors = new Map(pages.map((page) => [page.page, []]));
for (const {word} of crossPage) {
  const first = word.pages[0], last = word.pages[word.pages.length - 1];
  neighbors.get(first).push(last);
  neighbors.get(last).push(first);
}
for (const physicalPage of neighbors.keys()) {
  if (seenPages.has(physicalPage)) continue;
  pageComponents++;
  const stack = [physicalPage];
  while (stack.length) {
    const item = stack.pop();
    if (seenPages.has(item)) continue;
    seenPages.add(item);
    stack.push(...neighbors.get(item));
  }
}
assert.equal(pageComponents, 23);


/**
 * Affine plaintext-one-back model with completely arbitrary independent page keys:
 * C_i=P_i+a*P_(i-1)+k[page_i], for every a in all GF29 residues.
 * Compare an original complete spanning word against every dictionary candidate
 * without guessing any page key.
 * @param {number[]} ciphertext
 * @param {RuneWord} printed
 * @param {number[]} plaintextWord
 * @param {number} a
 * @returns {boolean}
 */
function affineCompatible(ciphertext, printed, plaintextWord, a) {
  for (let j = 2; j < ciphertext.length; j++) {
    if (printed.pages[j] !== printed.pages[j - 1]) continue;
    if (mod29(ciphertext[j] - ciphertext[j - 1]) !==
        mod29(plaintextWord[j] + (a - 1) * plaintextWord[j - 1] -
          a * plaintextWord[j - 2])) return false;
  }
  return true;
}

/**
 * @param {number[]} message
 * @param {number[]} physicalPages
 * @param {number[]} keys
 * @param {number} coefficient
 * @param {boolean} inverse
 * @returns {number[]}
 */
function affineTransform(message, physicalPages, keys, coefficient, inverse) {
  const output = [];
  let lastPlain = 0;
  for (let i = 0; i < message.length; i++) {
    const currentPlain = inverse
      ? mod29(message[i] - coefficient * lastPlain - keys[physicalPages[i]])
      : message[i];
    output.push(inverse ? currentPlain
      : mod29(currentPlain + coefficient * lastPlain + keys[physicalPages[i]]));
    lastPlain = currentPlain;
  }
  return output;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} plaintextWord
 * @param {number} cut
 * @param {number} a
 * @returns {number}
 */
function affineRelativePageKey(ciphertext, plaintextWord, cut, a) {
  assert.ok(cut >= 2);
  return mod29(ciphertext[cut] - ciphertext[cut - 1] -
    plaintextWord[cut] - (a - 1) * plaintextWord[cut - 1] +
    a * plaintextWord[cut - 2]);
}

const affineRows = [];
const sharedSlopeSurvival = Array(29).fill(true);
for (const {word} of crossPage) {
  const candidateList = candidates.get(word.c.length) || [];
  const matchesPerSlope = Array(29).fill(0);
  for (const candidate of candidateList) {
    for (let slope = 0; slope < 29; slope++) {
      if (affineCompatible(word.c, word, candidate.indices, slope)) {
        matchesPerSlope[slope]++;
      }
    }
  }
  for (let slope = 0; slope < 29; slope++) {
    if (!matchesPerSlope[slope]) sharedSlopeSurvival[slope] = false;
  }
  affineRows.push({boundary: word.pages[0] + "->" + word.pages[word.pages.length - 1],
    length: word.c.length, compatibleSlopes: matchesPerSlope.filter(Boolean).length,
    compatibleDictionarySlopePairs: matchesPerSlope.reduce((sum, n) => sum + n, 0)});
}
assert.equal(affineRows.filter((row) => row.compatibleSlopes === 0).length, 16);
assert.equal(affineRows.filter((row) =>
  row.compatibleSlopes === 0 && row.length >= 7).length, 13);
assert.equal(sharedSlopeSurvival.filter(Boolean).length, 0);

const knownSlope = 17;
const plantedAffine = affineTransform(plaintext, pageAtPosition, pageKeys, knownSlope, false);
assert.deepEqual(affineTransform(plantedAffine, pageAtPosition, pageKeys, knownSlope, true), plaintext);
let affineOffset = 0, affineValidNativeWords = 0, affineValidRelativeKeys = 0;
for (let i = 0; i < words.length; i++) {
  const source = words[i], wordPlain = plantedWords[i];
  if (source.pages[0] !== source.pages[source.pages.length - 1]) {
    const observed = plantedAffine.slice(affineOffset, affineOffset + source.c.length);
    assert.ok(affineCompatible(observed, source, wordPlain, knownSlope));
    assert.ok((candidates.get(source.c.length) || []).some((candidate) =>
      candidate.indices.join(",") === wordPlain.join(",")));
    affineValidNativeWords++;
    const cut = source.pages.findIndex((p) => p !== source.pages[0]);
    if (cut >= 2) {
      const actualDelta = mod29(pageKeys[source.pages[cut]] - pageKeys[source.pages[cut - 1]]);
      const inferredDelta = affineRelativePageKey(observed, wordPlain, cut, knownSlope);
      assert.equal(inferredDelta, actualDelta);
      affineValidRelativeKeys++;
    }
  }
  affineOffset += source.c.length;
}
assert.equal(affineOffset, plaintext.length);
assert.equal(affineValidNativeWords, 32);
assert.equal(affineValidRelativeKeys, 25);


/**
 * Latin/Old-English published native GP29 direct index tapes, without
 * English respelling or ciphertext-selected dictionary additions.
 * @returns {Array<{label:string,words:Map<number,DictionaryWord[]>,expected:number}>}
 */
function otherLanguageLexica() {
  const latin = fs.readFileSync(path.join(root,
    "resources/control/latin-vulgate-gp-wholewords.txt"), "utf8");
  const latinAlpha = "0123456789ABCDEFGHIJKLMNOPQRS";
  const latinWords = latin.split(/\r?\n/u).filter((line) => /^[0-9A-S]+$/u.test(line))
    .map((line) => [...line].map((ch) => latinAlpha.indexOf(ch)));
  assert.equal(latinWords.length, 39835);

  const oe = JSON.parse(fs.readFileSync(path.join(root,
    "resources/control/beowulf_oe_gp_profile_corrected.json"), "utf8"));
  assert.equal(oe.positiveControlAlphabet, "ABCDEFGHIJKLMNOPQRSTUVWXYZabc");
  const oldWords = [];
  let offset = 0;
  for (const length of oe.allSourceGpWordLengths) {
    const sourceWord = oe.sourceGpBase29.slice(offset, offset + length);
    assert.equal(sourceWord.length, length);
    oldWords.push([...sourceWord].map((ch) => oe.positiveControlAlphabet.indexOf(ch)));
    offset += length;
  }
  assert.equal(offset, 48012);
  assert.equal(oldWords.length, 10885);

  /**
   * @param {number[][]} wordTape
   * @param {number} unique
   * @returns {Map<number,DictionaryWord[]>}
   */
  function makeLexicon(wordTape, unique) {
    const bins = new Map();
    for (const indices of wordTape) {
      assert.ok(indices.every((n) => n >= 0 && n < 29));
      if (!bins.has(indices.length)) bins.set(indices.length, new Map());
      bins.get(indices.length).set(indices.join(","), {word: indices.join(","),indices});
    }
    assert.equal(Array.from(bins.values()).reduce((sum, items) => sum + items.size, 0), unique);
    return new Map(Array.from(bins, ([n,items]) => [n, Array.from(items.values())]));
  }
  return [
    {label:"Latin Vulgate",words:makeLexicon(latinWords,7305),expected:17},
    {label:"Old English Beowulf",words:makeLexicon(oldWords,3372),expected:17}
  ];
}

/**
 * Exercise the identical invariant under all 29 possible feedback slopes,
 * then recover independently planted native-language words and seam keys.
 * @param {string} label
 * @param {Map<number,DictionaryWord[]>} lexicon
 * @param {number} expectedZero
 */
function crossLanguageGate(label, lexicon, expectedZero) {
  const keys = Array.from({length:58},(_,physical)=>(11*physical+7)%29);
  const zero = [],zeroLong=[];
  let nativePositives=0,relativeKeys=0;
  for (let i=0;i<crossPage.length;i++) {
    const printed=crossPage[i].word;
    const candidates=lexicon.get(printed.c.length)||[];
    assert.ok(candidates.length);
    const cut=printed.pages.findIndex((pg)=>pg!==printed.pages[0]);
    let exists=false;
    for (let a=0;a<29;a++) {
      if (candidates.some((v)=>affineCompatible(printed.c,printed,v.indices,a))) {
        exists=true;
        break;
      }
    }
    if (!exists) {
      const boundary=printed.pages[0]+"->"+printed.pages[printed.pages.length-1];
      zero.push(boundary);
      if (printed.c.length>=7) zeroLong.push(boundary);
    }

    const sourceWord=candidates[(i*17+5)%candidates.length].indices;
    const encrypted=affineTransform(sourceWord,printed.pages,keys,17,false);
    assert.deepEqual(affineTransform(encrypted,printed.pages,keys,17,true),sourceWord);
    assert.ok(affineCompatible(encrypted,printed,sourceWord,17));
    nativePositives++;
    if (cut>=2) {
      assert.equal(affineRelativePageKey(encrypted,sourceWord,cut,17),
        mod29(keys[printed.pages[cut]]-keys[printed.pages[cut-1]]));
      relativeKeys++;
    }
  }
  assert.equal(zero.length,expectedZero);
  assert.equal(zeroLong.length,13);
  assert.equal(nativePositives,32);
  assert.equal(relativeKeys,25);
  return {label,zeroAll29:zero.length,zeroLong:zeroLong.length,
    zeroBoundaries:zero,nativePositives,relativeKeys};
}
const historicalLanguageGates=otherLanguageLexica().map(({label,words,expected})=>
  crossLanguageGate(label,words,expected));
const englishZeroLong=affineRows.filter((row)=>row.compatibleSlopes===0&&row.length>=7)
  .map((row)=>row.boundary);
assert.equal(englishZeroLong.length,13);
for (const result of historicalLanguageGates) {
  for (const boundary of englishZeroLong) assert.ok(result.zeroBoundaries.includes(boundary));
}

console.log(JSON.stringify({
  model: "GP29 plaintext-one-back with independent per-physical-page additive keys",
  source: {runes: sourceRunes.length, words: words.length,
    sourcePages: pages.length, crossPageWords: crossPage.length,
    seamGraphComponents: pageComponents},
  original: {zeroDictionaryCompatibleSeams: 19, ambiguousOrViableSeams: 13,
    seamsWithObservableKeyDifference: 25,
    zeroCompatibleObservableKeyDifferences: 15, rows},
  historicalLanguageGates,
  affineAll29: {zeroWordsAnySlope: 16, zeroWordsLengthAtLeast7: 13, sharedSurvivingSlopes: 0, rows: affineRows},
  nativePlant: {affineKnownSlope: 17, affineCompleteRecovered: plaintext.length,
    affineSeamWordsRecovered: affineValidNativeWords, affineTrueRelativeKeys: affineValidRelativeKeys,
    runesRecovered: plaintext.length,
    originalLayoutSeamWordsRecovered: nativeSeamsFound,
    originalLayoutRelativeKeysRetained: deltaSeamsFound}
}, null, 2));
