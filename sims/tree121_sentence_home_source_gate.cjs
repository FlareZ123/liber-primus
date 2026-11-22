"use strict";

/**
 * Original LP2 p32 tree/signed-2016 clue gate:
 * the image-dimension 11x11 GP-prime grid, its independent sentence geometry,
 * and the literal GP-rune HOME prefix at the start of its fourth row.
 *
 * The HOME substring is visible ciphertext. No plaintext is claimed.
 * Tests a finite historical Vigenere reading and holds the image-dimension
 * prime axes fixed in a retrospective word-prefix permutation control.
 *
 * SFT: node sims/tree121_sentence_home_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const textblob = read("resources/control/english_wordfreq_textblob.txt");
const quadgrams = read("resources/control/duko_round27_english_quadgrams.txt");
const tree = corpus.pages.find(p => p.page === 32);
const otherTree = corpus.pages.find(p => p.page === 55);
const solved = corpus.pages.find(p => p.page === 57);
const alphabet = corpus.translit;
const isRune = ch => /[\u16A0-\u16FF]/u.test(ch);
const mod = n => (n % 29 + 29) % 29;
assert.equal(tree.indices.length, 121);
assert.equal(otherTree.indices.length, 76);
assert.equal(solved.indices.length, 95);

const raw = transcription.split("%")[32];
const words = [];
const sentences = [];
let word = "", start = 0, runeOffset = 0, sentenceStart = 0, sentenceWordStart = 0;
/** Emit an original printed word; '%' and '/' are layout-only. */
function flush() {
  if (!word) return;
  words.push({start, end: runeOffset, runes: word, length: word.length});
  word = "";
}
for (const ch of raw) {
  if (isRune(ch)) {
    if (!word) start = runeOffset;
    word += ch;
    runeOffset++;
  } else if (ch !== "/" && !/\s/u.test(ch)) {
    flush();
    if (ch === ".") {
      sentences.push({start: sentenceStart, end: runeOffset,
        runes: runeOffset - sentenceStart,
        words: words.length - sentenceWordStart});
      sentenceStart = runeOffset;
      sentenceWordStart = words.length;
    }
  }
}
flush();
assert.equal(runeOffset, 121);
assert.equal(words.length, 22);
assert.deepEqual(sentences, [
  {start: 0, end: 33, runes: 33, words: 7},
  {start: 33, end: 121, runes: 88, words: 15}
]);
assert.equal(words[7].start, 33);
assert.equal(words[7].end, 44);
assert.equal(words[7].runes, "ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ");
const home = "ᚻᚩᛗᛖ";
assert.equal(words[7].runes.slice(0, 4), home);
const homeGP = [...home].map(r => corpus.runes.indexOf(r));
assert.deepEqual(homeGP, [8, 3, 19, 18]);
assert.equal(homeGP.map(i => alphabet[i]).join(""), "HOME");

// Strongest image-selected original-source geometry.
const prime = i => corpus.prime[i];
const topRow = tree.indices.slice(0, 11).map(prime);
const leftCol = Array.from({length: 11}, (_, j) => prime(tree.indices[11 * j]));
assert.equal(topRow.reduce((a,b) => a+b), 563);
assert.equal(leftCol.reduce((a,b) => a+b), 569);
const unsolved = corpus.pages.filter(p => p.status === "unsolved");
const globalStart = unsolved.filter(p => p.page < 32)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(globalStart + 33, 7872);
const all = unsolved.flatMap(p => p.indices);
let homeHits = 0;
for (let i = 0; i + 4 <= all.length; i++) {
  if (homeGP.every((r,j) => all[i+j] === r)) {
    assert.equal(i, 7872);
    homeHits++;
  }
}
assert.equal(homeHits, 1);
const buds = "ᛒᚢᛞᛋ";
const budsGP = [...buds].map(r => corpus.runes.indexOf(r));
assert.deepEqual(budsGP, [17, 1, 23, 15]);
assert.equal(words[15].start, 89);
assert.equal(words[15].end, 97);
assert.equal(words[15].runes, "ᛟᛝᚩᛗᛒᚢᛞᛋ");
assert.equal(words[15].runes.slice(-4), buds);
assert.equal(93-33, 60);
assert.deepEqual([Math.floor(33/11), 33%11], [3,0]);
assert.deepEqual([Math.floor(93/11), 93%11], [8,5]);
let budsHits = 0;
for (let i = 0; i + 4 <= all.length; i++) {
  if (budsGP.every((v,j) => all[i+j] === v)) {
    assert.equal(i, 7932);
    budsHits++;
  }
}
assert.equal(budsHits, 1);


// Independent frozen English-word source, for base-rate diagnosis only.
// Restrict to four single-letter GP runes, no unlicensed transliteration changes.
const frequency = new Map();
for (const line of textblob.split(/\r?\n/u)) {
  const m = line.match(/^([a-z]{4})\s+(\d+)$/u);
  if (m) frequency.set(m[1].toUpperCase(), Number(m[2]));
}
assert.equal(frequency.get("HOME"), 295);
/** @param {number[]} runes @param {number} position */
function dictionaryPrefixFrequency(runes, position) {
  let key = "";
  for (let j = 0; j < 4; j++) {
    const glyph = alphabet[runes[position + j]];
    if (glyph.length !== 1) return 0;
    key += glyph;
  }
  return frequency.get(key) || 0;
}
const starts = words.filter(w => w.length >= 4).map(w => w.start);
assert.deepEqual(starts, [4,9,20,25,33,44,50,59,64,72,76,85,89,104,112,117]);
const actualMatches = starts.map(at => ({
  at, frequency: dictionaryPrefixFrequency(tree.indices, at)
})).filter(x => x.frequency > 0);
assert.deepEqual(actualMatches, [{at: 33, frequency: 295}]);
// Search the entire 11x11 source matrix in all eight directions.
// A four-letter word must comprise four single-letter GP runes.
const directions = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
/** @param {number[]} source Original 121-rune 11x11 GP square. */
function allFourLetterWords(source) {
  const result = [];
  for (let row = 0; row < 11; row++) for (let col = 0; col < 11; col++) {
    for (const [dy,dx] of directions) {
      let word = "", valid = true;
      for (let step = 0; step < 4; step++) {
        const y = row + step*dy, x = col + step*dx;
        if (y < 0 || y > 10 || x < 0 || x > 10) { valid = false; break; }
        const token = alphabet[source[11*y+x]];
        if (token.length !== 1) { valid = false; break; }
        word += token;
      }
      if (valid && frequency.has(word)) result.push({word,row,col,dy,dx});
    }
  }
  return result;
}
const originalGridWords = allFourLetterWords(tree.indices);
assert.deepEqual(originalGridWords, [
  {word:"HOME",row:3,col:0,dy:0,dx:1},
  {word:"BUDS",row:8,col:5,dy:0,dx:1}
]);
// The historically independent image-prime change was +60.
// Among source word-start -> source word-end pairs with 60-rune start gap,
// exactly two geometries survive; only one has both dictionary words.
const fourStart = new Set(words.filter(w => w.length >= 4).map(w => w.start));
const fourEnd = new Set(words.filter(w => w.length >= 4).map(w => w.end));
const wordPairs60 = [...fourStart].filter(at => fourEnd.has(at + 64));
assert.deepEqual(wordPairs60, [25,33]);
const wordPairTitles = wordPairs60.map(at =>
  [dictionaryPrefixFrequency(tree.indices,at),
    dictionaryPrefixFrequency(tree.indices,at+60)]);
assert.deepEqual(wordPairTitles, [[0,0],[295,6]]);
const planted = tree.indices.slice();
planted.splice(33, 4, ...homeGP);
planted.splice(93, 4, ...budsGP);
assert.ok(allFourLetterWords(planted).some(x => x.word === "HOME"));
assert.ok(allFourLetterWords(planted).some(x => x.word === "BUDS"));


// Conditional permutation screen. Keep the entire first row and first
// column FIXED, so the exact historical 563/569 equality remains true.
const interior = Array.from({length: 121}, (_, i) => i)
  .filter(i => i >= 11 && i % 11 !== 0);
assert.equal(interior.length, 100);
const shuffled = tree.indices.slice();
let seed = 0x56356913;
function nextRandom() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 100000;
let exactHome = 0, highAtSelectedRow = 0, highAnyWordStart = 0;
let anyWordPair60 = 0, diagonalWords5 = 0, exactHomeBuds = 0;
for (let attempt = 0; attempt < trials; attempt++) {
  for (let j = interior.length - 1; j > 0; j--) {
    const k = nextRandom() % (j + 1);
    const a = interior[j], b = interior[k];
    [shuffled[a], shuffled[b]] = [shuffled[b], shuffled[a]];
  }
  if (homeGP.every((v, j) => shuffled[33+j] === v)) exactHome++;
  if (dictionaryPrefixFrequency(shuffled, 33) >= 295) highAtSelectedRow++;
  if (starts.some(at => dictionaryPrefixFrequency(shuffled, at) >= 295))
    highAnyWordStart++;
  if (wordPairs60.some(at =>
    dictionaryPrefixFrequency(shuffled,at) > 0 &&
    dictionaryPrefixFrequency(shuffled,at+60) > 0)) anyWordPair60++;
  if (homeGP.every((v,j) => shuffled[33+j] === v) &&
      budsGP.every((v,j) => shuffled[93+j] === v)) exactHomeBuds++;
  let hasDiagonalPair = false;
  for (let row = 0; row <= 5 && !hasDiagonalPair; row++) {
    for (let col = 0; col <= 2; col++) {
      const i = 11*row+col;
      const j = 11*(row+5)+(col+5);
      if (dictionaryPrefixFrequency(shuffled,i) > 0 &&
          dictionaryPrefixFrequency(shuffled,j) > 0) {
        hasDiagonalPair = true;
        break;
      }
    }
  }
  if (hasDiagonalPair) diagonalWords5++;
}
assert.deepEqual([exactHome, highAtSelectedRow, highAnyWordStart], [3,21,176]);
// These are retrospective diagnostics, not a discovery-wide significance claim.
assert.ok(anyWordPair60 >= 0 && anyWordPair60 <= trials);
assert.ok(diagonalWords5 >= 0 && diagonalWords5 <= trials);
assert.ok(exactHomeBuds >= 0 && exactHomeBuds <= trials);


// One fully source-fixed, finite, historically familiar interpretation:
// HOME as a four-rune repeating Vigenere key (or its GP prime weights).
// This interpretation is a hypothesis; neither original tree page decodes.
const grams = new Map();
let gramTotal = 0;
for (const line of quadgrams.split(/\r?\n/u)) {
  const m = line.match(/^([A-Z]{4})\s+(\d+)$/u);
  if (m) {
    const n = Number(m[2]); grams.set(m[1], n); gramTotal += n;
  }
}
/** @param {number[]} runes Native GP29 stream. */
function gramScore(runes) {
  const expanded = runes.map(i => alphabet[i]).join("");
  let total = 0;
  for (let i = 0; i + 4 <= expanded.length; i++) {
    const n = grams.get(expanded.slice(i, i+4)) || 0;
    total += Math.log10((n + .01) / gramTotal);
  }
  return total / (expanded.length - 3);
}
const base32 = gramScore(tree.indices), base55 = gramScore(otherTree.indices);
const native = gramScore(solved.indices);
assert.ok(native > -5.0);
assert.ok(base32 < -7.0 && base55 < -7.0);
const results = [];
for (const [name,key] of [
  ["ordinal", homeGP], ["gp-prime", homeGP.map(i => prime(i) % 29)]
]) {
  for (const sign of [-1, 1]) for (const phase of [0, 33]) {
    const inverse = (cipher, start) => cipher.map((r,i) =>
      mod(r + sign * key[(i+start-phase+400)%4]));
    // 33 is the sentence reset, with its first four runes serving as key.
    const decodedAfter = inverse(tree.indices.slice(37), 37);
    const decodedTree = inverse(tree.indices, 0);
    const decoded55 = inverse(otherTree.indices, 0);
    // Synthetic native control, evaluated with independently solved p57.
    const encrypted = solved.indices.map((r,i) => mod(r - sign*key[i%4]));
    assert.deepEqual(inverse(encrypted, phase), solved.indices);
    results.push({key:name, sign, phase, afterSourceWord:gramScore(decodedAfter),
      p32:gramScore(decodedTree), p55:gramScore(decoded55)});
  }
}
assert.equal(results.length, 8);
const bestAfter = Math.max(...results.map(x => x.afterSourceWord));
const best55 = Math.max(...results.map(x => x.p55));
assert.ok(bestAfter < -7.0);
assert.ok(best55 < -7.0);
console.log(JSON.stringify({
  originalSource: {imageWidth:563,imageHeight:569,grid:"11x11",
    p32WordCount:words.length, sentences,
    exactRowWord:{start:33,end:44,raw:words[7].runes,
      latin:words[7].runes.split("").map(r=>alphabet[corpus.runes.indexOf(r)]).join(""),
      key:"HOME",globalOffset:7872}, bookLiteralHOMEHits:homeHits,
    secondTreeWord:{word:"BUDS",localOffset:93,globalOffset:7932,
      sourceWordEnd:97}, bookLiteralBUDSHits:budsHits,
    wordSearchFourLetters:originalGridWords,
    sourceSixtyRuneWordPairs:wordPairs60},
  conditionalInteriorShuffle:{trials,seed:"0x56356913",fixedAxisRunes:21,
    shuffledInteriorRunes:100,exactHome,highAtSelectedRow,highAnyWordStart,
    anyWordPair60,diagonalWords5,exactHomeBuds,
    note:"retrospective page/word/dictionary selection"},
  nativeModel:{baselineP32:base32,baselineP55:base55,solvedP57:native,
    bestSourceKeyAfterWord:bestAfter,bestSourceKeyP55:best55,
    originalCandidates:results, nativePlantRoundtrip:true},
  interpretation:"Original word HOME is a source-visible candidate anchor only; no unknown plaintext recovered."
}, null, 2));
