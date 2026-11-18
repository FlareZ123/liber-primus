"use strict";

/**
 * Source-native Latin and Old English capacity gate for an independent
 * secret five-phase GP29 substitution alphabet per printed LP2 word.
 *
 * Runnable as: node sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs
 * Dependencies: Node.js 22 built-ins and the repository's word parser.
 * This test only reads committed files and never writes outputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus, parseLP2Words, physicalLP2Page } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..", "resources", "control");
const native = parseSharedCorpus();
assert.equal(native.words.length, 2896);
assert.equal(native.runeCount, 12956);
assert.equal(native.crossPageWords, 32);

const latinRaw = fs.readFileSync(
  path.join(root, "latin-vulgate-gp-wholewords.txt"), "utf8");
const latin = latinRaw.split(/\r?\n/u)
  .filter((line) => /^[0-9A-S]+$/u.test(line));
assert.equal(latin.length, 39835);

const old = JSON.parse(fs.readFileSync(
  path.join(root, "beowulf_oe_gp_profile_corrected.json"), "utf8"));
assert.equal(old.schema, 2);
assert.equal(old.positiveControlAlphabet, "ABCDEFGHIJKLMNOPQRSTUVWXYZabc");
assert.equal(old.acceptedSourceWords, 10885);
assert.equal(old.sourceGpBase29.length, 48012);
const beowulf = [];
let cursor = 0;
for (const n of old.allSourceGpWordLengths) {
  beowulf.push(old.sourceGpBase29.slice(cursor, cursor + n));
  cursor += n;
}
assert.equal(cursor, old.sourceGpBase29.length);
assert.equal(beowulf.length, 10885);

/**
 * All equality and inequality relationships between positions having the
 * same phase modulo five, for words of length at most 14. All lag-five
 * bits precede all lag-ten bits, exactly as in the original English study.
 * @param {string} word One GP29-encoded word.
 * @returns {string}
 */
function signature(word) {
  let bits = "";
  for (const lag of [5, 10]) {
    for (let i = 0; i + lag < word.length; i++) {
      bits += word[i] === word[i + lag] ? "1" : "0";
    }
  }
  return bits;
}

/** @param {string} word @returns {string} */
function shape(word) {
  return word.length + ":" + signature(word);
}

/** @param {string[]} source @returns {Map<string,string[]>} */
function indexSource(source) {
  const result = new Map();
  for (const word of source) {
    const key = shape(word);
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(word);
  }
  return result;
}

const inputs = native.words.map((item, i) => ({
  index: i,
  runes: item.runes,
  page: physicalLP2Page(item.startPage),
  length: item.length,
  shape: shape(item.runes)
}));

/** @param {Map<string,string[]>} index @returns {{covered:number,misses:object[]}} */
function checkOriginal(index) {
  const misses = inputs.filter((w) => !(index.get(w.shape)?.length))
    .map((w) => ({
      index: w.index, page: w.page, length: w.length, shape: w.shape
    }));
  return {covered: inputs.length - misses.length, misses};
}

const latinIndex = indexSource(latin);
const oldIndex = indexSource(beowulf);
const latinResult = checkOriginal(latinIndex);
const oldResult = checkOriginal(oldIndex);
assert.equal(latinResult.covered, 2894);
assert.deepEqual(latinResult.misses, [
  {index: 1220, page: 22, length: 12, shape: "12:001010000"},
  {index: 1967, page: 36, length: 10, shape: "10:10011"}
]);
assert.equal(oldResult.covered, 2873);
assert.equal(oldResult.misses.length, 23);
assert(oldResult.misses.some((w) => w.index === 2722 && w.page === 51));
assert(oldResult.misses.some((w) => w.index === 1967 && w.page === 36));

/**
 * Exact iid source-token conditional null for the already established
 * *printed within-word lag-five* equality statistic. Sampling one native
 * word with replacement at each original word-length slot preserves every
 * authentic original word length. This null is independent of secret keys:
 * all five-phase bijections preserve these within-word equalities.
 * @param {string[]} reference Source-native words.
 * @returns {{usedWords:number,missingLengths:number,observed:number,
 * expected:number,variance:number,leftTailProbability:number}}
 */
function lagFiveSourceNull(reference) {
  /** @param {string} w @returns {number} */
  const equalAtFive = (w) => {
    let count = 0;
    for (let j = 0; j + 5 < w.length; j++) {
      if (w[j] === w[j + 5]) count++;
    }
    return count;
  };

  /** @type {Map<number,number[]>} */
  const histogramByLength = new Map();
  for (const w of reference) {
    if (!histogramByLength.has(w.length)) {
      histogramByLength.set(w.length, []);
    }
    const histogram = histogramByLength.get(w.length);
    const n = equalAtFive(w);
    histogram[n] = (histogram[n] ?? 0) + 1;
  }
  const selected = inputs.filter((w) => histogramByLength.has(w.length));
  const observed = selected.reduce((total, w) => total + equalAtFive(w.runes), 0);
  const dp = new Float64Array(observed + 1);
  dp[0] = 1;
  let expected = 0;
  let variance = 0;
  for (const w of selected) {
    const hist = histogramByLength.get(w.length);
    const total = hist.reduce((sum, value) => sum + (value ?? 0), 0);
    const mean = hist.reduce(
      (sum, value, i) => sum + (value ?? 0) * i, 0) / total;
    const varOne = hist.reduce(
      (sum, value, i) => sum + (value ?? 0) * (i - mean) ** 2, 0) / total;
    expected += mean;
    variance += varOne;
    const next = new Float64Array(observed + 1);
    for (let n = 0; n < hist.length; n++) {
      const probability = (hist[n] ?? 0) / total;
      if (probability === 0) continue;
      for (let old = 0; old + n <= observed; old++) {
        next[old + n] += dp[old] * probability;
      }
    }
    dp.set(next);
  }
  return {
    usedWords:selected.length, missingLengths:inputs.length - selected.length,
    observed, expected, variance,
    leftTailProbability:dp.reduce((sum, p) => sum + p, 0)
  };
}

const latinLagFive = lagFiveSourceNull(latin);
const beowulfLagFive = lagFiveSourceNull(beowulf);
assert.equal(latinLagFive.usedWords, 2896);
assert.equal(latinLagFive.missingLengths, 0);
assert.equal(latinLagFive.observed, 104);
assert.equal(beowulfLagFive.usedWords, 2893);
assert.equal(beowulfLagFive.missingLengths, 3);
assert.equal(beowulfLagFive.observed, 102);
for (const [actual, want] of [
  [latinLagFive.expected, 133.8635671326803],
  [latinLagFive.variance, 130.55962310369944],
  [latinLagFive.leftTailProbability, 0.003969680159542658],
  [beowulfLagFive.expected, 139.42216701529767],
  [beowulfLagFive.variance, 113.83254354372973],
  [beowulfLagFive.leftTailProbability, 0.0001536882434937424]
]) {
  assert(Math.abs(actual - want) < 1e-8);
}
console.log("EXACT-IID-SOURCE-CONDITIONAL-FIVE-BACK", JSON.stringify({
  latin:latinLagFive, correctedOldEnglish:beowulfLagFive
}));


const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const roman = ["F","U","TH","O","R","C","G","W","H","N","I","J",
  "EO","P","X","S","T","B","E","M","L","NG","OE","D",
  "A","AE","Y","IA","EA"];
assert.equal(alphabet.length, 29);
assert.equal(roman.length, 29);
/** @param {string} latinGpWord @returns {string} */
const readable = (latinGpWord) => [...latinGpWord]
  .map((c) => roman[alphabet.indexOf(c)]).join("");

const targets = [
  {wordIndex:754,page:13,length:14,latinTokens:4,latinTypes:2},
  {wordIndex:1353,page:25,length:14,latinTokens:9,latinTypes:4},
  {wordIndex:1967,page:36,length:10,latinTokens:0,latinTypes:0},
  {wordIndex:2722,page:51,length:8,latinTokens:2,latinTypes:1}
];
for (const target of targets) {
  const word = inputs[target.wordIndex];
  assert.equal(word.page, target.page);
  assert.equal(word.length, target.length);
  const matches = latinIndex.get(word.shape) ?? [];
  assert.equal(matches.length, target.latinTokens);
  assert.equal(new Set(matches).size, target.latinTypes);
  const types = [...new Set(matches)].map(readable);
  console.log("LATIN", JSON.stringify({index:target.wordIndex,
    page:target.page, shape:word.shape,
    tokenCount:matches.length, types}));
}
assert.deepEqual(
  [...new Set(latinIndex.get(inputs[2722].shape))].map(readable),
  ["TURBETUR"]
);

/* A literal Vulgate passage must preserve neighboring printed word lengths.
 * Checking *every* Vulgate occurrence of the four source-registered sharp
 * word signatures gives an exact, key-independent fragment rejection.
 */
const sourceNeighborTable = [];
for (const target of targets) {
  const w = target.wordIndex;
  const hits = latin.flatMap((sourceWord, i) =>
    shape(sourceWord) === inputs[w].shape ? [i] : []);
  const leftMatches = hits.filter((i) =>
    i > 0 && latin[i-1].length === inputs[w-1].length).length;
  const rightMatches = hits.filter((i) =>
    i+1 < latin.length && latin[i+1].length === inputs[w+1].length).length;
  const tripleMatches = hits.filter((i) =>
    i > 0 && i+1 < latin.length &&
    latin[i-1].length === inputs[w-1].length &&
    latin[i+1].length === inputs[w+1].length).length;
  sourceNeighborTable.push({wordIndex:w,hits:hits.length,
    leftMatches,rightMatches,tripleMatches});
}
assert.deepEqual(sourceNeighborTable, [
  {wordIndex:754,hits:4,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:1353,hits:9,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:1967,hits:0,leftMatches:0,rightMatches:0,tripleMatches:0},
  {wordIndex:2722,hits:2,leftMatches:2,rightMatches:0,tripleMatches:0}
]);
console.log("VULGATE-THREE-WORD-FRAGMENTS",JSON.stringify(sourceNeighborTable));

/*
 * Genuine contiguous-source quote gate: the Vulgate twice prints TURBETUR
 * immediately followed by COR. The original p51 next word has one rune,
 * not three. No length-preserving wordwise secret key repairs this mismatch.
 */
const turbetur = latin.reduce((found,word,i) => {
  if (word === "G14HIG14") found.push(i);
  return found;
}, []);
assert.deepEqual(turbetur, [22014,22468]);
assert.equal(inputs[2721].length, 3);
assert.equal(inputs[2722].length, 8);
assert.equal(inputs[2723].length, 1);
for (const sourceIndex of turbetur) {
  assert.equal(latin[sourceIndex-1], "939"); // NON
  assert.equal(latin[sourceIndex+1], "534"); // COR
}
console.log("VULGATE-CONTIGUOUS-CRIB", JSON.stringify({
  sourceWordIndices:turbetur,
  originalNextWordLength:inputs[2723].length,
  sourceNextWords:turbetur.map((i) => readable(latin[i+1]))
}));

/* Independent secret permutations: synthetic genuine-Latin positive. */
let seed = 0x5f3759df;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
};
const byLength = new Map();
for (const word of latin) {
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}
let plantedRunes = 0;
for (let w = 0; w < inputs.length; w++) {
  const length = inputs[w].length;
  const pool = byLength.get(length);
  assert(pool?.length, "Latin source has no positive for a length");
  const source = pool[random() % pool.length];
  const permutations = Array.from({length:5}, () => {
    const row = Array.from({length:29}, (_, i) => i);
    for (let j = row.length - 1; j > 0; j--) {
      const k = random() % (j+1);
      [row[k],row[j]] = [row[j],row[k]];
    }
    return row;
  });
  const encoded = [...source].map((ch, j) =>
    alphabet[permutations[j%5][alphabet.indexOf(ch)]]).join("");
  const decoded = [...encoded].map((ch, j) =>
    alphabet[permutations[j%5].indexOf(alphabet.indexOf(ch))]).join("");
  assert.equal(decoded, source);
  assert.equal(signature(encoded), signature(source));
  plantedRunes += source.length;
}
assert.equal(plantedRunes, 12956);

/**
 * Longest exact original-word-signature phrase shared with a full source
 * corpus. A suffix automaton makes the full contiguous passage test O(N),
 * with no guesses about any secret GP29 alphabet.
 *
 * @param {string[]} source Authentic source words, original order.
 * @param {string[]} query Ciphertext words, printed order.
 * @returns {{longest:number, hits:Array<{originalStart:number,sourceStart:number}>,
 * states:number}}
 */
function sourcePhraseGate(source, query) {
  const states = [{len:0, link:-1, edges:new Map(), sourceEnd:-1}];
  let last = 0;
  for (let pos = 0; pos < source.length; pos++) {
    const character = shape(source[pos]);
    const current = states.length;
    states.push({
      len:states[last].len + 1, link:0, edges:new Map(), sourceEnd:pos
    });
    let parent = last;
    while (parent >= 0 && !states[parent].edges.has(character)) {
      states[parent].edges.set(character, current);
      parent = states[parent].link;
    }
    if (parent >= 0) {
      const existing = states[parent].edges.get(character);
      if (states[parent].len + 1 === states[existing].len) {
        states[current].link = existing;
      } else {
        const clone = states.length;
        states.push({
          len:states[parent].len + 1,
          link:states[existing].link,
          edges:new Map(states[existing].edges),
          sourceEnd:states[existing].sourceEnd
        });
        while (parent >= 0 && states[parent].edges.get(character) === existing) {
          states[parent].edges.set(character, clone);
          parent = states[parent].link;
        }
        states[existing].link = clone;
        states[current].link = clone;
      }
    }
    last = current;
  }
  let state = 0;
  let length = 0;
  let longest = 0;
  let hits = [];
  for (let pos = 0; pos < query.length; pos++) {
    const character = shape(query[pos]);
    while (state > 0 && !states[state].edges.has(character)) {
      state = states[state].link;
      length = states[state].len;
    }
    if (states[state].edges.has(character)) {
      state = states[state].edges.get(character);
      length++;
    } else {
      state = 0;
      length = 0;
    }
    if (length >= longest && length > 0) {
      const hit = {
        originalStart:pos - length + 1,
        sourceStart:states[state].sourceEnd - length + 1
      };
      if (length > longest) {
        longest = length;
        hits = [hit];
      } else {
        hits.push(hit);
      }
    }
  }
  return {longest,hits,states:states.length};
}
const originalFullWords = inputs.map((w) => w.runes);
const latinPhrase = sourcePhraseGate(latin, originalFullWords);
const oldPhrase = sourcePhraseGate(beowulf, originalFullWords);
const sourceLP1 = fs.readFileSync(path.join(__dirname, "..", "resources",
  "transcriptions", "lp1_wulfic_canonical.txt"), "utf8");
const originalLP1Words = parseLP2Words(sourceLP1, 55)
  .words.map((w) => w.runes);
assert.equal(originalLP1Words.length, 694);
const lp1Phrase = sourcePhraseGate(originalLP1Words, originalFullWords);
assert.equal(lp1Phrase.longest, 7);
assert.deepEqual(lp1Phrase.hits.map((h) => h.originalStart),
  [318,1386]);
assert.equal(latinPhrase.longest, 8);
assert.deepEqual(latinPhrase.hits.map((h) => h.originalStart),
  [1020,1318,2024]);
assert.equal(oldPhrase.longest, 8);
assert.deepEqual(oldPhrase.hits.map((h) => h.originalStart),
  [366,1568,1704]);
for (const [source,result] of [[latin,latinPhrase],
  [beowulf,oldPhrase],[originalLP1Words,lp1Phrase]]) {
  for (const hit of result.hits) {
    for (let j = 0; j < result.longest; j++) {
      assert.equal(
        shape(originalFullWords[hit.originalStart+j]),
        shape(source[hit.sourceStart+j])
      );
    }
  }
}
console.log("FULL-BOOK-CONTIGUOUS-SOURCE-QUOTE-GATE", JSON.stringify({
  latin:latinPhrase, correctedOldEnglish:oldPhrase,
  originalLP1Source:lp1Phrase
}));

/**
 * Reproduce the existing committed "writer GP" native transliterator:
 * [ING,TH,EO,OE,AE,IO,EA] are longest-first 29-rune units; V/K/Z/Q
 * are historical aliases; QU is transliterated as CW before scanning.
 * @param {string} raw Authoritative pinned Gutenberg source text.
 * @returns {string[]} One ordered GP29 word for every alphabetic word.
 */
function writerNativeWords(raw) {
  const symbols = ["F","U","TH","O","R","C","G","W","H","N","I","J",
    "EO","P","X","S","T","B","E","M","L","ING","OE","D",
    "A","AE","Y","IO","EA"];
  assert.equal(symbols.length, 29);
  const order = [...symbols.keys()].sort(
    (a,b) => symbols[b].length - symbols[a].length);
  const aliases = {V:1,K:5,Z:15,Q:5};
  const normalized = raw.normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z ]/gu, " ").toUpperCase().replace(/QU/g, "CW");
  const result = [];
  for (const word of normalized.split(/\s+/u)) {
    if (!word) continue;
    let encoded = "";
    for (let pos = 0; pos < word.length;) {
      const i = order.find((index) => word.startsWith(symbols[index], pos));
      const index = i === undefined ? aliases[word[pos]] : i;
      assert.notEqual(index, undefined);
      encoded += alphabet[index];
      pos += i === undefined ? 1 : symbols[i].length;
    }
    result.push(encoded);
  }
  return result;
}
const englishReferenceNames = [
  ["Gibran_Prophet","gibran_prophet_58585.txt",15733,9],
  ["Emerson_Essays","emerson_essays_2944.txt",77932,8],
  ["Shakespeare_First300k","shakespeare_first300k.txt",55407,9]
];
const englishPhrases = {};
for (const [name,filename,expectedWords,expectedLongest] of englishReferenceNames) {
  const source = writerNativeWords(fs.readFileSync(path.join(root, filename), "utf8"));
  assert.equal(source.length, expectedWords);
  const test = sourcePhraseGate(source, originalFullWords);
  assert.equal(test.longest, expectedLongest);
  englishPhrases[name] = {sourceWords:source.length,
    longest:test.longest,hits:test.hits};
}
console.log("AUTHOR-RELEVANT-ENGLISH-SOURCE-QUOTE-GATE",
  JSON.stringify(englishPhrases));

/* True source-native 12-word encoded phrase, independent secret alphabet
 * per word and phase, is recognized without knowing any of its keys.
 */
const trueSourcePhrase = latin.slice(1000, 1012);
assert.equal(trueSourcePhrase.length, 12);
const secretEncodedPhrase = trueSourcePhrase.map((word) => {
  const substitutions = Array.from({length:5}, () => {
    const permutation = Array.from({length:29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i+1);
      [permutation[i],permutation[j]] = [permutation[j],permutation[i]];
    }
    return permutation;
  });
  return [...word].map((symbol, i) =>
    alphabet[substitutions[i%5][alphabet.indexOf(symbol)]]).join("");
});
const positiveQuote = sourcePhraseGate(latin, secretEncodedPhrase);
assert.equal(positiveQuote.longest, 12);
assert.equal(positiveQuote.hits[0].sourceStart, 1000);
console.log("CONTIGUOUS-QUOTE-PLANT", JSON.stringify({
  trueSourceWords:trueSourcePhrase.length,
  recoveredWords:positiveQuote.longest,
  sourceStart:positiveQuote.hits[0].sourceStart
}));

console.log("ORIGINAL", JSON.stringify({
  runes:native.runeCount, words:inputs.length, crossPage:native.crossPageWords,
  latin:latinResult, oldEnglish:oldResult,
  latinPositiveRoundtripRunes:plantedRunes
}));
console.log("PASS: all 2896 source words; exact Latin/Old English lexical capacity and independent source-native reversible plant");
