"use strict";

/**
 * Original-source SFT for the p33 palindrome -> Stage10 square -> p8 236+7
 * bridge and a single, source-motivated 7-column/7-rune original-cipher gate.
 * This is a conditional decode test, not a claim to recover LP2 plaintext.
 *
 * Run: node sims/lp2_p33_palindrome_p8_236_7_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt").replace(/\r\n/gu, "\n");
const pages = raw.split(/\n%\n/);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const isRune = (r) => runeIndex.has(r);
const onlyRunes = (s) => [...s].filter(isRune);
/** @param {string} s */
const roman = (s) => [...s].map((r) => corpus.translit[runeIndex.get(r)]).join("");
/** @param {string} s */
const tokens = (s) => s.replace(/[\s/]/gu, "").split(/[.\-]/u).filter(Boolean);
/** @param {number} n */
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} values */
const ioc = (values) => {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
};
/** @param {{runes: string}} word */
const pal3 = (word) => [...word.runes].length === 3 &&
  word.runes[0] === word.runes[2];

const parsed = parseLP2Words(raw);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, 12956);
const pals = parsed.words.filter(pal3);
assert.equal(pals.length, 32);
const triples = [];
for (let i = 0; i + 2 < parsed.words.length; i++) {
  if (pal3(parsed.words[i]) && pal3(parsed.words[i + 2])) triples.push(i);
}
assert.equal(triples.length, 1,
  "only p33 word47..49 has a three-word palindrome/nonpalindrome/palindrome pattern");
const triple = parsed.words.slice(triples[0], triples[0] + 3);
assert.deepEqual(triple.map((w) => w.runes), ["ᚱᚪᚱ", "ᚫᚪᚷᛟᛞ", "ᛒᛗᛒ"]);
assert.deepEqual(triple.map((w) => w.startPage), [33, 33, 33]);
assert.equal(triple[2].endPage, 34);
assert.equal(parsed.words.filter((w) => w.startPage !== w.endPage && pal3(w)).length, 1);

const p33 = pages[33].split("&");
assert.equal(p33.length, 2);
const blackWords = p33.map((part) => tokens(part.slice(part.indexOf(".") + 1))).flat();
assert.equal(blackWords.length, 49);
assert.equal(blackWords.join("").length, 196);
assert.equal(blackWords[48], "ᛒ");
const p34First = tokens(pages[34])[0];
assert.equal(p34First, "ᛗᛒ");
blackWords[48] += p34First;
assert.equal(blackWords.join("").length, 198);
assert.deepEqual(blackWords.slice(-3), triple.map((w) => w.runes));

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\n\s*\n/u);
const square = squares[1].trim().split("\n")
  .flatMap((line) => line.trim().split(/\s+/u).map(Number));
assert.equal(square.length, 49);
assert.equal(square[46], 236); // 47th black word, RAR
assert.equal(square[48], 7);   // 49th complete word, BMB
assert.equal(square[46] + square[48], 243);
assert(square.every((value, i) => value === square[48 - i]),
  "the historical 7x7 square is centrally symmetric");

const p8 = corpus.pages.find((p) => p.page === 8);
assert.equal(p8.indices.length, 255);
const p8Black = p8.indices.slice(12);
assert.equal(p8Black.length, 243);
const key = p8Black.slice(236);
assert.deepEqual(key, [15, 3, 10, 28, 26, 9, 12]);
assert.equal(p8Black.slice(0, 236).length, 236);
const page8text = pages[8];
let lastAt236 = -1;
let ordinal = 0;
for (let i = 0; i < page8text.length; i++) {
  if (isRune(page8text[i])) {
    ordinal++;
    if (ordinal === 248) lastAt236 = i; // red12 + black236
  }
}
assert(lastAt236 >= 0);
assert.equal(page8text[lastAt236 + 1], "-",
  "source p8 has a literal word boundary after its 236th black rune");

// Source-drawn 7x7 word grid has a repeated 3,5,3 ending in its first and
// last rows, in addition to the palindromic last-row endpoint words.
// This is a source morphology observation, not an encrypted key claim.
const topRowLengths = blackWords.slice(0, 7).map((w) => [...w].length);
const bottomRowLengths = blackWords.slice(42, 49).map((w) => [...w].length);
assert.deepEqual(topRowLengths, [2, 9, 6, 3, 3, 5, 3]);
assert.deepEqual(bottomRowLengths, [2, 4, 3, 7, 3, 5, 3]);
assert.deepEqual(topRowLengths.slice(-3),bottomRowLengths.slice(-3));
assert.equal(topRowLengths.filter((n,i)=>n===bottomRowLengths[i]).length,4);

const numbered = pages.slice(36, 39).join("\n")
  .split(/(?=[1-5]-)/u).filter((s) => /^[1-5]-/u.test(s))
  .map((s) => onlyRunes(s.split("&")[0]).map((r) => runeIndex.get(r)));
assert.deepEqual(numbered.map((n) => n.length), [139, 91, 98, 96, 129]);
const ciphertext = numbered.flat();
assert.equal(ciphertext.length, 553);
assert.equal(ciphertext.length % 7, 0);

// Exact historical 2014 stage05 seven-position transposition, reused here
// only as an explicit, conditional LP2 original-cipher receiver.
const historicalInverse = [0, 6, 2, 5, 1, 4, 3];
const historicalForward = [0, 4, 2, 6, 5, 3, 1];
/** @param {number[]} values @param {number[]} order */
function permute(values, order) {
  assert.equal(values.length % 7, 0);
  const out = [];
  for (let i = 0; i < values.length; i += 7) {
    for (const offset of order) out.push(values[i + offset]);
  }
  return out;
}
/** @param {number[]} values @param {number[]} seven */
function decode(values, seven) {
  return permute(values, historicalInverse)
    .map((value, i) => mod29(value - seven[i % 7]));
}
/** @param {number[]} values @param {number[]} seven */
function encode(values, seven) {
  const shifted = values.map((value, i) => mod29(value + seven[i % 7]));
  return permute(shifted, historicalForward);
}
assert.deepEqual(permute(historicalInverse, historicalForward),
  [0, 1, 2, 3, 4, 5, 6]);
const plaintext = decode(ciphertext, key);
assert.deepEqual(encode(plaintext, key), ciphertext);
const solved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved.length, 95);
const planted = Array.from({length: 553}, (_, i) => solved[i % solved.length]);
assert.deepEqual(decode(encode(planted, key), key), planted);
const wrongKey = key.slice(1).concat(key[0]);
assert.notDeepEqual(decode(encode(planted, key), wrongKey), planted);
assert(ioc(planted) > 0.05);
assert(ioc(plaintext) < 0.04);

// A separate, directly motivated self-receiver: p33 source selects p8's last
// seven symbols. Treat those symbols as a seven-rune Vigenere operand to the
// source page itself. Freeze only native key direction, historical 1033/3301
// reversal, GP29 +/- direction, and either source red12 clock or black reset.
// Eight exact, original, independent-body tests; never tune key to output.
/** @param {number[]} input @param {number[]} operand @param {number} phase @param {number} sign */
function sevenKeyDecode(input,operand,phase,sign) {
  return input.map((v,i)=>mod29(v+sign*operand[(i+phase)%7]));
}
/** @param {number[]} input @param {number[]} operand @param {number} phase @param {number} sign */
function sevenKeyEncode(input,operand,phase,sign) {
  return input.map((v,i)=>mod29(v-sign*operand[(i+phase)%7]));
}
const nativePage8Control=Array.from({length:243},(_,i)=>solved[i%solved.length]);
assert(ioc(nativePage8Control)>0.05);
const p8LocalReceiver=[];
for (const reverse of [false,true]) {
  const operand=reverse?key.slice().reverse():key;
  for (const sign of [-1,1]) {
    for (const clockPhase of [0,12]) {
      const candidate=sevenKeyDecode(p8Black,operand,clockPhase,sign);
      assert.deepEqual(sevenKeyEncode(candidate,operand,clockPhase,sign),p8Black);
      const plantCipher=sevenKeyEncode(nativePage8Control,operand,clockPhase,sign);
      assert.deepEqual(sevenKeyDecode(plantCipher,operand,clockPhase,sign),nativePage8Control);
      assert.notDeepEqual(sevenKeyDecode(plantCipher,operand.slice(1).concat(operand[0]),clockPhase,sign),nativePage8Control);
      assert(ioc(candidate)<0.04);
      p8LocalReceiver.push({
        reverseSourceSeven:reverse,
        clockPhase,sign,
        decodedIoC:ioc(candidate),
        firstOriginal95:candidate.slice(0,95).map((v)=>corpus.translit[v]).join(""),
      });
    }
  }
}
assert.equal(p8LocalReceiver.length,8);

console.log(JSON.stringify({
  source: {
    p33LastThreeWords: blackWords.slice(-3).map(roman),
    p33CrossPageWord: roman(blackWords[48]),
    uniqueThreeWordPalindromePattern: true,
    p33MagicPositionsOneBased: [47, 49],
    p33MagicValues: [236, 7],
    p8BlackRuneSplit: [236, 7],
    p8TailSeven: key.map((v) => corpus.translit[v]).join(""),
    firstAndLastSquareWordLengthRows: [topRowLengths,bottomRowLengths],
    numberedUnitLengths: numbered.map((n) => n.length),
  },
  p8SelfReceiver: {
    originalBlackLength:243,
    originalBlackIoC:ioc(p8Black),
    eightSourceBoundedVariants:p8LocalReceiver,
    exactForwardAndNativePlantControls:true,
    outcome:"no readable p8 plaintext from direct 7-rune self-key",
  },
  conditionalReceiver: {
    operation: "historical-period7-block-inverse then subtract p8-tail7 GP29",
    ciphertextIoC: ioc(ciphertext),
    decodedIoC: ioc(plaintext),
    solvedNativeControlIoC: ioc(planted),
    exactReencryption: true,
    syntheticNativeRecovery: true,
    wrongKeyRejectedOnPlant: true,
    unitOutputs: (() => {
      let offset = 0;
      return numbered.map((unit) => {
        const decoded = plaintext.slice(offset, offset + unit.length);
        offset += unit.length;
        return {
          length: unit.length,
          ioc: ioc(decoded),
          transliterationPrefix: decoded.slice(0, 90)
            .map((v) => corpus.translit[v]).join(""),
        };
      });
    })(),
    outcome: "no readable original GP-native plaintext; source link provisional",
  },
}, null, 2));
