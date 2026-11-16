"use strict";

/**
 * Source-authored F-zero differential alternative for original LP2:
 *
 * The authentically solved p56 says plaintext GP29 F (index zero) is
 * transparent to its consecutive-prime/totient key pointer. We explicitly
 * test a distinct 28-nonzero-step *differential* interpretation:
 *
 *    P=F => delta=0 and key pointer does NOT advance.
 *    P!=F => delta=1+((P-1 + ((prime[ptr]-1) mod28)) mod28),
 *            then pointer advances.
 *    C=(previous C + delta) mod29, with initial previous C=0, ptr=0.
 *
 * This is one fully reversible model, NOT a historically authenticated
 * LP2 rule. Because this mapping is bijective over all 29 GP runes, every
 * original doublet necessarily decodes to F, independent of key. No
 * alternative keys, reset points, padding, language scores or rune
 * permutations are searched. Physical printed word/page boundaries are
 * preserved and parsed independently of the differential state.
 *
 * Windows Node22: node sims/lp2_fzero_prime_gp28_differential_original_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalText = read("resources/liber-primus/lp2-transcription.txt");
const normalizedSolved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const dictionarySource = read("resources/control/english_wordfreq_textblob.txt");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x, n) => ((x % n) + n) % n;

/** @typedef {{gp:number,page:number,local:number,global:number}} Rune */
/** @returns {Rune[][]} */
function originalWords() {
  const pages = originalText.split("%").slice(0, 55);
  assert.equal(pages.length, 55);
  let physical = 0, local = 0, global = 0;
  /** @type {Rune[][]} */
  const words = [];
  /** @type {Rune[]} */
  let word = [];
  const finish = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (const ch of pages.join("%")) {
    if (runeToIndex.has(ch)) {
      word.push({gp: runeToIndex.get(ch),
        page: physical >= 50 ? physical + 1 : physical,
        local: local++, global: global++});
    } else if (ch === "%") {
      physical++;
      local = 0;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Formatting line wraps and physical pages are not words.
    } else finish();
  }
  finish();
  assert.equal(words.length, 2896);
  const flat = words.flat();
  assert.equal(flat.length, 12956);
  assert.equal(words.filter(w => new Set(w.map(r => r.page)).size > 1).length, 32);
  assert.equal(words.filter(w => w.length === 1).length, 83);
  assert.deepEqual(flat.map(x => x.gp),
    corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
  return words;
}

/** @returns {number[]} */
function primeTable() {
  const upper = 200000;
  const sieve = new Uint8Array(upper);
  const list = [];
  for (let p = 2; p < upper; p++) {
    if (sieve[p]) continue;
    list.push(p);
    if (p * p < upper) {
      for (let n = p * p; n < upper; n += p) sieve[n] = 1;
    }
  }
  assert.ok(list.length >= 12956);
  return list;
}
const primes = primeTable();

/** @param {number[]} clear @param {number} [offset=0] @returns {number[]} */
function encrypt(clear, offset = 0) {
  let previous = 0, cursor = 0;
  return clear.map(p => {
    const step = p === 0 ? 0 :
      1 + mod(p - 1 + mod(primes[cursor] - 1 + offset, 28), 28);
    if (p !== 0) cursor++;
    previous = mod(previous + step, 29);
    return previous;
  });
}

/** @param {number[]} ciphertext @param {number} [offset=0] @returns {number[]} */
function decrypt(ciphertext, offset = 0) {
  let previous = 0, cursor = 0;
  return ciphertext.map(c => {
    const step = mod(c - previous, 29);
    const key = mod(primes[cursor] - 1 + offset, 28);
    const p = step === 0 ? 0 : 1 + mod(step - 1 - key, 28);
    if (p !== 0) cursor++;
    previous = c;
    return p;
  });
}

// Standard native GP orthography with source-attested letter aliases.
// This encoder is used only on known clear controls and finite lexicon.
const gp = new Map(corpus.translit.map((t, i) => [t, i]));
for (const [from, to] of [["ING", "NG"], ["IO", "IA"],
    ["K", "C"], ["Z", "S"], ["V", "U"]]) gp.set(from, gp.get(to));
const groups = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA", "IO"];
/** @param {string} raw @returns {number[]|null} */
function encode(raw) {
  const s = raw.toUpperCase().replace(/QU/g, "KW");
  const result = [];
  for (let pos = 0; pos < s.length;) {
    const part = groups.find(g => s.startsWith(g, pos)) || s[pos];
    if (!gp.has(part)) return null;
    result.push(gp.get(part));
    pos += part.length;
  }
  return result;
}

/** @param {number} section @returns {string} */
function solvedSection(section) {
  const parts = normalizedSolved.split(/###\s+(\d+)\s*\n/);
  for (let i = 1; i + 1 < parts.length; i += 2) {
    if (+parts[i] === section) return parts[i + 1];
  }
  throw new Error("Missing original solved section " + section);
}

/** @param {number} section @returns {number[][]} */
function clearWords(section) {
  const words = solvedSection(section).split(/\r?\n/)
    .filter(line => line.length && !line.startsWith("[") &&
      !line.startsWith("#") && !/^\d/.test(line))
    .join(" ").match(/[A-Za-z]+/g) || [];
  return words.map(encode).filter(word => word !== null);
}

const words = originalWords();
const original = words.flat().map(x => x.gp);
const wordContexts = words.flatMap((runes, w) => runes.map((r, k) => ({
  ...r, word:w, withinWord:k, length:runes.length
})));
assert.equal(wordContexts.length, original.length);
const events = wordContexts.filter((r, i) =>
  i > 0 && original[i] === original[i - 1]);
const count = selector => events.filter(selector).length;
assert.equal(events.length, 86);
assert.equal(count(e => e.withinWord === 0), 23);
assert.equal(count(e => e.withinWord === e.length - 1), 19);
assert.equal(count(e => e.withinWord > 0 && e.withinWord < e.length - 1), 44);
assert.equal(count(e => e.length === 1), 0);
assert.equal(count(e => e.page !== wordContexts[e.global - 1].page), 0);
assert.equal(new Set(events.map(e => e.word)).size, 85);

const fMask = words.map(runes => runes.map(r =>
  r.global > 0 && original[r.global] === original[r.global - 1] ?
    "1" : "0").join(""));
const lexicon = dictionarySource.split(/\r?\n/)
  .filter(line => /^[a-z]+ [0-9]+$/.test(line))
  .map(line => {
    const [text, count] = line.split(" ");
    return {text, count:+count, runes:encode(text)};
  }).filter(row => row.runes !== null);
const possible = new Map();
for (const entry of lexicon) {
  const sig = entry.runes.map(i => i === 0 ? "1" : "0").join("");
  if (!possible.has(sig)) possible.set(sig, []);
  possible.get(sig).push(entry);
}
const mismatches = fMask.flatMap((mask, index) =>
  possible.has(mask) ? [] : [{
    word:index, page:words[index][0].page,
    local:words[index][0].local,
    global:words[index][0].global,
    length:words[index].length, Fmask:mask
  }]);
assert.deepEqual(mismatches.map(r => [r.page, r.length, r.Fmask]), [
  [25, 9, "000000001"],
  [27, 12, "000001000001"],
  [30, 9, "000000001"]
]);

// Stronger key-independent F-zero constraints: short plain words with
// one medial F have very few choices in the *frozen* TextBlob reference.
// This is a register-conditional discriminator, not a global theorem
// against every language or all author spellings.
const rareShortMasks = ["010", "0100"].map(mask => {
  const originalSites = fMask.flatMap((x, index) => x !== mask ? [] :
    [{word:index,page:words[index][0].page,
      local:words[index][0].local,global:words[index][0].global}]);
  const nativeCandidates = possible.get(mask) || [];
  const matchingFrequency = nativeCandidates.reduce((sum,x) => sum+x.count, 0);
  const matchingWordLength = mask.length;
  const wholeLengthFrequency = lexicon
    .filter(x => x.runes.length === matchingWordLength)
    .reduce((sum,x) => sum+x.count, 0);
  const originalLengthWords = words.filter(w => w.length === matchingWordLength).length;
  return {mask,originalLengthWords,originalCount:originalSites.length,
    originalSites,onlySourceLexiconCandidates:nativeCandidates
      .map(x => ({word:x.text,count:x.count})),
    sourceMatchedFrequency:matchingFrequency,
    sourceLengthFrequency:wholeLengthFrequency,
    expectedMatchedWordsFromSourceWeightedSameLength:
      originalLengthWords*matchingFrequency/wholeLengthFrequency};
});
assert.deepEqual(rareShortMasks.map(x=>x.originalCount), [3,3]);
assert.deepEqual(rareShortMasks.map(x=>x.originalLengthWords), [720,513]);
assert.deepEqual(rareShortMasks.map(x=>x.sourceMatchedFrequency), [3,6]);

// Author-authentic GP text as known plaintext. p56's printed hex digest is
// out-of-band in its solved page; the normalized reference has those lines
// starting with decimal digits. p57 uses the original 95 source runes.
const p56 = clearWords(56).flat();
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
const clearControls = [
  {name:"p56",plain:p56},
  {name:"p57",plain:p57},
];
const controlResults = clearControls.map(({name, plain}) => {
  const cipher = encrypt(plain);
  const recovered = decrypt(cipher);
  assert.deepEqual(recovered, plain);
  assert.deepEqual(encrypt(recovered), cipher);
  assert.ok(decrypt(cipher, 1).some((value, i) => value !== plain[i]),
    "wrong independently frozen key must change its plaintext");
  const repeats = cipher.filter((v, i) => i > 0 && v === cipher[i-1]).length;
  assert.equal(repeats, plain.slice(1).filter(x => x === 0).length);
  return {name,sourceNativeRunes:plain.length,plaintextF:plain.filter(x => x===0).length,
    plantedDoublets:repeats,positiveInverse:"PASS",wrongKey:"REJECT"};
});

// Actual source-native solved LP1/LP2 reference, only non-duplicate sections.
const solvedIDs = [1,3,5,6,9,10,11,12,13,14,15,16,56,57];
const nativeWords = solvedIDs.flatMap(clearWords);
const native = nativeWords.flat();
assert.equal(nativeWords.length, 705);
assert.equal(native.length, 2835);
assert.equal(native.filter(x=>x===0).length, 46);
const sourceFMask = nativeWords.map(w =>
  w.map(x => x === 0 ? "1" : "0").join(""));
const solvedShortF = ["010", "0100"].map(mask => ({
  mask, matched:sourceFMask.filter(x => x === mask).length,
  candidateLengthWords:nativeWords.filter(x => x.length === mask.length).length
}));
assert.deepEqual(solvedShortF.map(x => x.matched), [0, 0]);

// Contrasting original-text language control: previously pinned and
// corrected source-native Old English Beowulf GP29 word fixture.
const oe = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
assert.equal(oe.schema, 2);
assert.equal(oe.acceptedSourceWords, 10885);
assert.equal(oe.sourceGpBase29.length, 48012);
assert.equal(oe.allSourceGpWordLengths.reduce((a,b)=>a+b,0), 48012);
assert.equal(oe.positiveControlAlphabet[0], "A"); // GP index 0 is F.
let pOE = 0;
const oldEnglishMasks = oe.allSourceGpWordLengths.map(n => {
  const text = oe.sourceGpBase29.slice(pOE,pOE+n);
  pOE += n;
  return [...text].map(c=>c === "A" ? "1" : "0").join("");
});
const OE = ["010","0100"].map(m => ({
  mask:m,
  originalMatched:fMask.filter(x=>x===m).length,
  originalEligible:words.filter(w=>w.length===m.length).length,
  beowulfMatched:oldEnglishMasks.filter(x=>x===m).length,
  beowulfEligible:oe.allSourceGpWordLengths
    .filter(n=>n===m.length).length
}));
assert.deepEqual(OE.map(x=>[
  x.originalMatched,x.originalEligible,x.beowulfMatched,x.beowulfEligible
]), [[3,720,42,2305],[3,513,62,2176]]);

/** @param {number} n @param {number} p @param {number} k @returns {number} */
function binomialCDF(n,p,k) {
  let term = Math.pow(1-p,n), sum=term;
  for (let i=1;i<=k;i++) {
    term *= (n-i+1)*p/(i*(1-p));
    sum += term;
  }
  return sum;
}
for (const row of OE) {
  row.conditionalExpected = row.originalEligible *
    row.beowulfMatched/row.beowulfEligible;
  row.exploratoryIndependentBinomialLowerTail = binomialCDF(
    row.originalEligible,
    row.beowulfMatched/row.beowulfEligible,
    row.originalMatched);
}

// Frozen original inverse. The complete cipher is actually inverted;
// reencryption is a necessary program-integrity check, not a key proof.
const decoded = decrypt(original);
assert.deepEqual(encrypt(decoded), original);
const eqFromF = decoded.flatMap((p, i) => p===0 ? [i] : []);
assert.equal(eqFromF.length, 86);
assert.deepEqual(eqFromF, events.map(e => e.global));
const p0to2 = decoded.slice(0, 729);
const openingWords = words.slice(0, 32).map(w =>
  w.map(r => corpus.translit[decoded[r.global]]).join(""));
const dictionary = new Set(lexicon.map(row => row.text.toUpperCase()));
const openingKnownWords = openingWords.filter(w => dictionary.has(w)).length;

// Exactly one source-selected full-text original key choice is tested.
const output = {
  model:"29-state reversible previous-C differential; F emits step0, other 28 steps rotate by (nth_prime-1) mod28; F does not advance cursor; prevC=0, cursor=0 globally",
  canonicalSource:{unknownRunes:original.length,printedWords:words.length,
    pageCarryWords:32,singletons:83,originalDoublets:events.length,
    wordsWithDoublet:85},
  forcedOriginalPlainF:{
    all:events.length,wordInitial:23,wordInterior:44,wordFinal:19,
    singleRuneWords:0,acrossPhysicalPage:0,
    finiteTextBlobExactFMaskMissing:mismatches,
    rareMedialFShortWords:rareShortMasks
  },
  authenticControls:controlResults,
  sourceNativeBenchmark:{sections:solvedIDs,nativeRunes:native.length,
    nativeWords:nativeWords.length,plaintextF:native.filter(x=>x===0).length,
    authenticSolvedShortF:solvedShortF,
    correctedBeowulfOldEnglishShortF:OE},
  originalInverse:{
    first729F:p0to2.filter(x=>x===0).length,
    first32PrintedWords:openingWords,
    dictionaryExactFirst32Words:openingKnownWords,
    completeForwardReencryption:"PASS",
    originalPlaintextRecovered:false
  },
  decision:"Original F-zero equality is consistent at singleton sites but has three missing word-shape masks in the finite 29154-word TextBlob register; this is not a universal grammar proof. The source-fixed prime/totient GP28 differential produces nonlinguistic original output, despite perfect inverse on native planted p56/p57 text. No authorial selector establishes this distinct GP28 transfer; do not generalize the negative to arbitrary F-zero stateful ciphers."
};
console.log(JSON.stringify(output, null, 2));
