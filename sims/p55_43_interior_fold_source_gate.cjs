"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const physical = read("resources/lp2-transcription.txt").split("%");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const mod = n => (n % 29 + 29) % 29;
const gp = a => a.map(v => v === null ? "?" : corpus.translit[v]).join(" ");
const ioc = a => {
  const values = a.filter(v => v !== null);
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};

assert.equal(physical.length, 57);
assert.equal(corpus.pages.length, 58);
const pageWords = Array.from({ length: 58 }, (_, p) => {
  if (p === 50) return [];
  return physical[p > 50 ? p - 1 : p]
    .replace(/[\/\r\n]/g, "")
    .split(/[-.&$§,:!?]/u)
    .map(s => (s.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
});

/** Encode a signed-message word in the canonical GP transliteration. */
function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const alphabet = corpus.translit.map((token, index) =>
    ({ token: token.toLowerCase(), index }))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (let i = 0; i < source.length;) {
    const found = alphabet.find(({ token }) => source.startsWith(token, i));
    assert.ok(found, "Unencodable signed word: " + source.slice(i));
    result.push(found.index);
    i += found.token.length;
  }
  return result;
}

// Reconstruct the 43-word signed-message map exactly as in the source report.
// The single word "lies" addresses the rune-free p50 cell; keep its terminal
// unknown rather than assigning the final character of the numeric token.
const signedBody = signedText.slice(signedText.indexOf("Hello."),
  signedText.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const sourceRows = signedWords.map(word => {
  const sum = encodeWord(word).reduce((a, v) => a + corpus.prime[v], 0);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  const runeWord = pageWords[page][wordIndex] || null;
  const token = page === 50
    ? grid.pages.find(p => p.page === 50).tokens[wordIndex]
    : null;
  const terminal = runeWord ? [...runeWord].at(-1) : null;
  const glyphIndex = terminal === null ? null : corpus.runes.indexOf(terminal);
  assert.ok(glyphIndex === null || glyphIndex >= 0);
  return { word, sum, page, wordIndex, runeWord, token, glyphIndex };
});
assert.deepEqual(sourceRows.filter(r => r.glyphIndex === null)
  .map(r => [r.word, r.page, r.wordIndex, r.token]),
  [["lies", 50, 3, "3D"]]);

const terminal = sourceRows.map(r => r.glyphIndex);
const keyFold = Array.from({ length: 21 }, (_, i) => {
  const left = terminal[i], right = terminal[42 - i];
  return left === null || right === null ? null : mod(left + right);
});
const keyCenter = terminal[21];
assert.equal(keyCenter, 3); // original signed-message center endpoint is O
assert.deepEqual(keyFold.slice(9, 12).map(v => corpus.translit[v]),
  ["E", "N", "D"]);

// Reconstruct the 43-rune p55 circumference interior from its original words.
// Keep the page's 33 boundary runes outside this narrowly selected strip.
const p55Words = physical[54].replace(/[\/\r\n]/g, "")
  .match(/[ᚠ-᛿]+/gu) || [];
assert.equal(p55Words.length, 17);
assert.equal(p55Words.reduce((n, w) => n + [...w].length, 0), 76);
const interiorRunes = p55Words.flatMap(w => [...w].slice(1, -1));
assert.equal(interiorRunes.length, 43);
const interior = interiorRunes.map(r => corpus.runes.indexOf(r));
assert.ok(interior.every(v => v >= 0));

// The same source-selected mirror fold used on the 43 signed-word endpoints:
// pair symmetric positions by addition in GF(29), leaving the center alone.
const targetFoldSum = Array.from({ length: 21 }, (_, i) =>
  mod(interior[i] + interior[42 - i]));
// Orientation control: left-minus-right, still in original top-to-bottom order.
const targetFoldDifference = Array.from({ length: 21 }, (_, i) =>
  mod(interior[i] - interior[42 - i]));

// Test the distinct operation not covered by the prior direct-key gates:
// fold the p55 43-rune interior first, then use the folded 2016 word-end
// sequence as a GP29 additive key. The p50-derived key position remains erased.
function combine(target, sign) {
  const pairs = target.map((v, i) =>
    keyFold[i] === null ? null : mod(v + sign * keyFold[i]));
  pairs.push(mod(interior[21] + sign * keyCenter));
  return pairs;
}
const sumMinusKey = combine(targetFoldSum, -1);
const sumPlusKey = combine(targetFoldSum, 1);
const differenceMinusKey = combine(targetFoldDifference, -1);
const differencePlusKey = combine(targetFoldDifference, 1);

assert.equal(keyFold.filter(v => v === null).length, 1);
assert.deepEqual(keyFold.flatMap((v, i) => v === null ? [i] : []), [3]);
assert.deepEqual(targetFoldSum.map(v => corpus.translit[v]),
  ["H","NG","B","AE","R","U","T","Y","M","B","X","G","EA","T","F","M","B","NG","NG","M","X"]);
assert.deepEqual(targetFoldDifference.map(v => corpus.translit[v]),
  ["U","EA","W","T","P","O","N","OE","S","OE","P","D","F","R","N","EO","OE","C","A","D","Y"]);
assert.deepEqual(sumMinusKey.slice(0, 21).map(v => v === null ? null : corpus.translit[v]),
  ["J","F","E",null,"F","M","C","IA","P","EA","C","EO","Y","O","OE","E","A","D","T","E","AE"]);
assert.deepEqual(sumPlusKey.slice(0, 21).map(v => v === null ? null : corpus.translit[v]),
  ["C","P","T",null,"H","EO","IA","AE","AE","G","D","F","U","F","W","L","I","M","Y","L","O"]);
assert.deepEqual(differenceMinusKey.slice(0, 21).map(v => v === null ? null : corpus.translit[v]),
  ["R","W","H",null,"N","NG","IA","D","N","R","R","F","IA","L","TH","J","F","W","M","OE","H"]);
assert.deepEqual(differencePlusKey.slice(0, 21).map(v => v === null ? null : corpus.translit[v]),
  ["IA","L","G",null,"B","X","L","NG","NG","J","OE","B","TH","B","T","P","S","O","F","A","S"]);

const output = {
  classification: "bounded source-motivated negative; no unknown plaintext recovered",
  source: {
    signedWords: signedWords.length,
    mappedRuneWords: 42,
    runeFreeP50Slot: { word: "lies", index: 3, token: "3D" },
    keyFold: gp(keyFold),
    keyCenter: corpus.translit[keyCenter],
    centeredEND: gp(keyFold.slice(9, 12))
  },
  p55: {
    physicalWords: p55Words.length,
    pageRunes: 76,
    interiorRunes: interior.length,
    interior: gp(interior),
    foldSum: gp(targetFoldSum),
    foldSumIoC: ioc(targetFoldSum),
    foldDifference: gp(targetFoldDifference),
    foldDifferenceIoC: ioc(targetFoldDifference)
  },
  foldThenKey: {
    sumMinusKey: gp(sumMinusKey),
    sumMinusKeyIoC: ioc(sumMinusKey),
    sumPlusKey: gp(sumPlusKey),
    sumPlusKeyIoC: ioc(sumPlusKey),
    differenceMinusKey: gp(differenceMinusKey),
    differenceMinusKeyIoC: ioc(differenceMinusKey),
    differencePlusKey: gp(differencePlusKey),
    differencePlusKeyIoC: ioc(differencePlusKey)
  },
  scope: [
    "The source word-map and FOLD reading remain provisional, not authenticated instructions.",
    "The p50 lies/3D key position is deliberately left unknown.",
    "Only the 43-rune p55 interior is folded; the 33 boundary runes are not part of this test.",
    "No phases, permutations, alternative keys, or further cipher layers were searched."
  ]
};
console.log(JSON.stringify(output, null, 2));
