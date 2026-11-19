"use strict";

/**
 * Source-locked p55 remainder-33 -> 2016 word WILL -> GP29 Vigenere gate.
 *
 * Fixed upstream premises (not re-searched):
 *   2013 BASE29: 3301 -> 3QO
 *   p55: 3301 = 43*76 + 33; p57 selects the 43/33 circumference split
 *   signed 2016 source: 43 words, zero-based word[33] === WILL
 *
 * Test only the ordinary GP29 Vigenere operation with key WILL, both
 * arithmetic directions and the two natural clocks:
 *   (a) compact 43-rune interior clock, starting at its first rune;
 *   (b) original p55 page clock, starting at p55 rune 0 and advancing through
 *       all 76 runes before the 43 interior positions are read.
 *
 * No phase search, word resets, alternative keys, or codebook. The first
 * variant explicitly sheds the 33 exterior positions; the second transforms
 * all 76 positions and then reads the 43 interiors. Neither assumes that
 * synthetic round trips authenticate a historical mechanism.
 *
 * Run with Node 22:
 *   node sims/lp2_p55_3301_remainder33_will_vigenere_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const entries = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.translit.length, 29);
assert.equal(corpus.runes.join(""),
  "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ");
assert.deepEqual(corpus.translit,
  ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]);

const mod29 = (value) => ((value % 29) + 29) % 29;

/** Encode each source word separately; GP digraphs remain single runes. */
function encodeWords(text) {
  const result = [];
  for (const word of text.trim().split(/\s+/u)) {
    let at = 0;
    while (at < word.length) {
      const hit = entries.find((entry) => word.startsWith(entry.token, at));
      assert.ok(hit, "unencodable GP word fragment: " + word.slice(at));
      result.push(hit.index);
      at += hit.token.length;
    }
  }
  return result;
}

function render(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function renderByLengths(values, lengths, separator = " | ") {
  let at = 0;
  return lengths.map((length) => {
    const word = render(values.slice(at, at + length));
    at += length;
    return word;
  }).join(separator);
}

function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** Parse the exact p55 physical transcription section; slash is a line wrap. */
const sections = transcription.split("%");
assert.equal(sections.length, 57);
const p55Section = sections[54];
const printedWords = [];
let currentWord = [];
for (const character of p55Section) {
  if (runeIndex.has(character)) {
    currentWord.push(runeIndex.get(character));
  } else if (character === "/" || /\s/u.test(character)) {
    // Line wrapping does not terminate a printed word.
  } else if (currentWord.length) {
    printedWords.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) printedWords.push(currentWord);

const p55Page = corpus.pages.find((page) => page.page === 55);
const p56Page = corpus.pages.find((page) => page.page === 56);
const p57Page = corpus.pages.find((page) => page.page === 57);
assert.ok(p55Page && p56Page && p57Page);
const p55 = p55Page.indices;
assert.equal(p55.length, 76);
assert.deepEqual(printedWords.flat(), p55);
const wordLengths = printedWords.map((word) => word.length);
assert.deepEqual(wordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(crypto.createHash("sha256").update(Buffer.from(p55)).digest("hex"),
  "9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f");

const tags = printedWords.flatMap((word, wordIndex) =>
  word.map((_, position) =>
    wordIndex === 0 || position === 0 || position === word.length - 1 ? "E" : "I"));
const exterior = p55.filter((_, index) => tags[index] === "E");
const interior = p55.filter((_, index) => tags[index] === "I");
assert.deepEqual([exterior.length, interior.length], [33,43]);
assert.equal(43 * 76 + 33, 3301);
assert.deepEqual([Math.floor(3301 / 76), 3301 % 76], [43,33]);

const expectedExterior = [
  21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,
  17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10
];
const expectedInterior = [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,
  20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
];
assert.deepEqual(exterior, expectedExterior);
assert.deepEqual(interior, expectedInterior);

/** The authenticated 2016 source has 43 alphabetic words; remainder 33 selects WILL. */
const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/gu, "");
const sourceWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/gu) || [];
assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[33].toUpperCase(), "WILL");
const key = encodeWords("WILL");
assert.deepEqual(key, [7,10,20,20]);
assert.equal(render(key), "WILL");

/** p56 native solved control: exact consecutive-prime-totient inverse. */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
}
function firstPrimes(count) {
  const result = [];
  for (let value = 2; result.length < count; value++) {
    if (isPrime(value)) result.push(value);
  }
  return result;
}
const p56Cipher = p56Page.indices;
assert.equal(p56Cipher.length, 85);
const p56FPositions = p56Cipher.flatMap((value, index) => value === 0 ? [index] : []);
assert.deepEqual(p56FPositions, [35,47,51,56,74]);
const p56Expected = encodeWords(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
assert.equal(p56Expected.length, 85);
const primeValues = firstPrimes(p56Cipher.length + 29);
let primeClock = 0;
const p56Decoded = p56Cipher.map((cipherRune, position) => {
  if (position === 56) return 0; // The one source-solved literal-F bypass.
  return mod29(cipherRune - (primeValues[primeClock++] - 1));
});
assert.deepEqual(p56Decoded, p56Expected);
assert.equal(primeClock, 84);

/** p57 native clear-text control: the printed circumference instruction. */
const p57 = p57Page.indices;
assert.equal(p57.length, 95);
const p57Phrase = encodeWords(
  "PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES"
);
assert.equal(p57Phrase.length, 67);
assert.deepEqual(p57.slice(0, p57Phrase.length), p57Phrase);
const p57Body43 = p57.slice(7,50);
assert.equal(p57Body43.length, 43);

/** LP1 solved prose is the fixed language reference; p55/p56/p57 are held out. */
function encodeReference(text) {
  const normalized = text.replace(/^#.*$/gm, " ")
    .replace(/\[[^\]]*\]/gu, " ").toUpperCase();
  const result = [];
  for (let word of normalized.match(/[A-Z]+/gu) || []) {
    word = [...word].map((character) =>
      ({K:"C",V:"U",Z:"S"}[character] || character)).join("");
    for (let at = 0; at < word.length;) {
      const hit = entries.find((entry) => word.startsWith(entry.token, at));
      if (hit) {
        result.push(hit.index);
        at += hit.token.length;
      } else {
        at++;
      }
    }
  }
  return result;
}
const lp1 = encodeReference(lp1Reference);
assert.ok(lp1.length > 3000);
const trigrams = new Uint32Array(29 ** 3);
for (let index = 2; index < lp1.length; index++) {
  trigrams[lp1[index - 2] * 841 + lp1[index - 1] * 29 + lp1[index]]++;
}
function trigramScore(values) {
  let total = 0;
  for (let index = 2; index < values.length; index++) {
    const slot = values[index - 2] * 841 + values[index - 1] * 29 + values[index];
    total += Math.log((trigrams[slot] + 0.05) / (lp1.length + 0.05 * trigrams.length));
  }
  return total / (values.length - 2);
}
function windowScores(length) {
  return Array.from({length: lp1.length - length + 1}, (_, index) =>
    trigramScore(lp1.slice(index, index + length))).sort((a,b) => a-b);
}
const native43 = windowScores(43);
const native76 = windowScores(76);
const nativeMin43 = native43[0];
const nativeMedian43 = native43[Math.floor(native43.length / 2)];
const nativeMin76 = native76[0];

const variants = [];
for (const sign of [-1, 1]) {
  // Clock A: shed first, then run one uninterrupted 43-symbol key stream.
  const compactDecoded = interior.map((value, index) =>
    mod29(value + sign * key[index % key.length]));
  variants.push({
    clock: "compacted-interior-start0",
    operation: sign === -1 ? "C-K" : "C+K",
    output: render(compactDecoded),
    trigramScore: trigramScore(compactDecoded),
    belowEveryNative43Window: trigramScore(compactDecoded) < nativeMin43
  });

  // Clock B: advance the same key continuously over all 76 original page runes,
  // then read the 43 strict interiors. No word reset or phase fitting.
  const pageDecoded = p55.map((value, index) =>
    mod29(value + sign * key[index % key.length]));
  const pageInterior = pageDecoded.filter((_, index) => tags[index] === "I");
  variants.push({
    clock: "original-page-start0-all76",
    operation: sign === -1 ? "C-K" : "C+K",
    full76: renderByLengths(pageDecoded, wordLengths),
    outputInterior43: render(pageInterior),
    trigramScore: trigramScore(pageInterior),
    belowEveryNative43Window: trigramScore(pageInterior) < nativeMin43
  });
}

// A source-native p57 planted control checks the exact Vigenere inverse,
// but is only an implementation control, never evidence for historical use.
const plantedControls = [];
for (const sign of [-1,1]) {
  const plantedCipher = p57Body43.map((value,index) =>
    mod29(value - sign * key[index % key.length]));
  const recovered = plantedCipher.map((value,index) =>
    mod29(value + sign * key[index % key.length]));
  assert.deepEqual(recovered, p57Body43);
  plantedControls.push({sign, recovered: recovered.length, exact: true});
}

console.log(JSON.stringify({
  sourceSelection: {
    base29Constant: 3301,
    base76Digits: [43,33],
    p55Runes: 76,
    p55Exterior: 33,
    p55Interior: 43,
    signed2016Words: sourceWords.length,
    zeroBasedWord33: sourceWords[33],
    frozenGP29Key: render(key),
    keyIndices: key
  },
  sourceNativeControls: {
    p56: {
      cipherRunes: p56Cipher.length,
      exactKnownPlaintextRunes: p56Decoded.length,
      matched: p56Decoded.filter((value,index) => value === p56Expected[index]).length,
      literalFBypassPosition: 56,
      plaintext: render(p56Decoded)
    },
    p57: {
      pageRunes: p57.length,
      exactInstructionRunes: p57Phrase.length,
      instruction: render(p57Phrase),
      bodyPlantRunes: p57Body43.length,
      syntheticVigenerePlants: plantedControls
    }
  },
  languageReference: {
    source: "LP1 solved plaintext reference only",
    trainingRunes: lp1.length,
    native43Windows: native43.length,
    native43Min: nativeMin43,
    native43Median: nativeMedian43,
    native76Min: nativeMin76,
    p57Body43Score: trigramScore(p57Body43),
    p55RawInteriorScore: trigramScore(interior)
  },
  originalP55Prediction: {
    originalRuneSHA256: crypto.createHash("sha256").update(Buffer.from(p55)).digest("hex"),
    wordLengths,
    exteriorGP: render(exterior),
    interiorGP: render(interior),
    variants
  },
  decision:
    "The source-selected remainder33 word WILL does not decrypt the untouched p55 interior under either natural zero-based Vigenere clock or either ordinary sign. No p55 plaintext or complete page decoder is recovered; the count selector does not select Vigenere or its clock."
}, null, 2));
