"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const allParsed = parseLP2Words(transcription, 58);
const allWords = allParsed.words;
const words = allWords.filter((w) => w.startPage === 32 && w.endPage === 32);
const page = corpus.pages.find((p) => p.page === 32);
assert.ok(page, "physical p32 corpus record must exist");
assert.equal(page.indices.length, 121, "p32 must be the 121-rune 11x11 square");
assert.equal(words.length, 22, "canonical p32 parser must recover 22 words");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const wordPrimeValues = (word) => [...word.runes].map((r) => {
  const index = runeIndex.get(r);
  assert.notEqual(index, undefined, "every rune must be in the canonical GP alphabet");
  return corpus.prime[index];
});
const wordValues = words.map(wordPrimeValues);
const flattenedIndices = words.flatMap((word) => [...word.runes].map((r) => runeIndex.get(r)));
assert.deepEqual(flattenedIndices, page.indices, "p32 word stream must reproduce the original row-major corpus");

const firstClauseWords = words.slice(0, 7);
const secondClauseWords = words.slice(7);
const firstClauseRunes = firstClauseWords.reduce((n, w) => n + w.length, 0);
const secondClauseRunes = secondClauseWords.reduce((n, w) => n + w.length, 0);
const firstClauseSum = wordValues.slice(0, 7).flat().reduce((a, b) => a + b, 0);
const secondClauseSum = wordValues.slice(7).flat().reduce((a, b) => a + b, 0);
assert.equal(firstClauseRunes, 33);
assert.equal(secondClauseRunes, 88);
assert.equal(firstClauseSum, 1467);
assert.equal(secondClauseSum, 4578);

const allWordSums = allWords.map((word) => ({
  page: word.startPage,
  length: word.length,
  runes: word.runes,
  sum: wordPrimeValues(word).reduce((a, b) => a + b, 0),
}));
const elevenRuneWords = allWordSums.filter((w) => w.length === 11);
const all540Words = allWordSums.filter((w) => w.sum === 540);
const elevenRune540Words = elevenRuneWords.filter((w) => w.sum === 540);
assert.equal(allWords.length, 2941);
assert.equal(elevenRuneWords.length, 32);
assert.equal(all540Words.length, 2);
assert.deepEqual(all540Words.map((w) => [w.page, w.length]).sort((a, b) => a[0] - b[0]), [[5, 9], [32, 11]]);
assert.equal(elevenRune540Words.length, 1);
assert.equal(elevenRune540Words[0].page, 32);
assert.equal(elevenRune540Words[0].runes, "ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ");

const armor = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const signaturePart = armor.split("-----BEGIN PGP SIGNATURE-----")[1].split("-----END PGP SIGNATURE-----")[0];
const signatureLines = signaturePart.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const base64 = signatureLines.filter((line) => !line.startsWith("Version:") && !line.startsWith("=")).join("");
const packet = Buffer.from(base64, "base64");
assert.equal(Buffer.byteLength(armor, "utf8"), 1136);
assert.equal(packet.length, 543);
assert.deepEqual([...packet.subarray(0, 3)], [0x89, 0x02, 0x1c]);
assert.equal(packet[0] & 0x80, 0x80);
assert.equal(packet[0] & 0x40, 0);
assert.equal((packet[0] >> 2) & 0x0f, 2, "old-format packet tag must be Signature");
assert.equal(packet[0] & 0x03, 1, "old-format packet must use two-octet length");
const packetBodyLength = (packet[1] << 8) | packet[2];
assert.equal(packetBodyLength, 540);
assert.equal(packet.length, packetBodyLength + 3);
assert.equal(wordValues[7].reduce((a, b) => a + b, 0), packetBodyLength, "first second-clause word sum must equal PGP packet body length");

const secondClauseFirstWordSum = wordValues[7].reduce((a, b) => a + b, 0);
const remainingFourteenSum = secondClauseSum - secondClauseFirstWordSum;
assert.equal(secondClauseFirstWordSum, 540);
assert.equal(remainingFourteenSum, 4038);

const ringSums = Array(6).fill(0);
const ringCounts = Array(6).fill(0);
const categoryByCell = Array(121);
for (let r = 0; r < 11; r++) {
  for (let c = 0; c < 11; c++) {
    const d = Math.max(Math.abs(r - 5), Math.abs(c - 5));
    const i = r * 11 + c;
    const value = corpus.prime[page.indices[i]];
    ringSums[d] += value;
    ringCounts[d]++;
    categoryByCell[i] = d === 2 ? 1 : d <= 1 ? 2 : 0;
  }
}
assert.deepEqual(ringCounts, [1, 8, 16, 24, 32, 40]);
assert.deepEqual(ringSums, [19, 388, 1136, 1046, 1539, 1917]);

const inner5Perimeter = ringSums[2];
const inner3AndCenter = ringSums[1] + ringSums[0];
const outerThreeRings = ringSums[5] + ringSums[4] + ringSums[3];
const tableCircumference = 2 * 32 + 2 * 8 - 4;
const squareCenter = 331;
const signedArmorBytes = 1136;
const onionIndexSum = 133 + 331;
assert.equal(firstClauseSum, signedArmorBytes + squareCenter);
assert.equal(secondClauseSum, outerThreeRings + tableCircumference);
assert.equal(outerThreeRings, 4502);
assert.equal(outerThreeRings - remainingFourteenSum, 464);
assert.equal(464, 16 * 29);
assert.equal(464, onionIndexSum);
assert.equal(squareCenter + tableCircumference, inner3AndCenter);
assert.equal(inner5Perimeter, signedArmorBytes);
assert.equal(inner3AndCenter, 407);

// Conditional null: uniformly permute rune values within each printed word.
// This preserves every word's length and rune multiset, word order, punctuation
// boundary, 33/88 clause split, and the original 11x11 cell/line geometry.
// It randomizes only which rune of each word occupies each original cell.
const wordMeta = [];
let offset = 0;
for (const values of wordValues) {
  wordMeta.push({ values: values.slice(), categories: categoryByCell.slice(offset, offset + values.length) });
  offset += values.length;
}
assert.equal(offset, 121);

let seed = 0x10a39b32 >>> 0;
function random01() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0x100000000;
}
function shuffled(values) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random01() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const trials = Number(process.env.TRIALS || 1000000);
assert.ok(Number.isSafeInteger(trials) && trials > 0);
let hitInner5 = 0;
let hitInner3 = 0;
let hitBoth = 0;
for (let trial = 0; trial < trials; trial++) {
  let sumInner5 = 0;
  let sumInner3 = 0;
  for (const word of wordMeta) {
    const values = shuffled(word.values);
    for (let i = 0; i < values.length; i++) {
      if (word.categories[i] === 1) sumInner5 += values[i];
      else if (word.categories[i] === 2) sumInner3 += values[i];
    }
  }
  const h5 = sumInner5 === signedArmorBytes;
  const h3 = sumInner3 === 407;
  if (h5) hitInner5++;
  if (h3) hitInner3++;
  if (h5 && h3) hitBoth++;
}

const addOneP = (hits) => (hits + 1) / (trials + 1);
console.log(JSON.stringify({
  p32Words: words.map((w, i) => ({ length: w.length, runes: w.runes, primeSum: wordValues[i].reduce((a, b) => a + b, 0) })),
  corpus: { words: allWords.length, elevenRuneWords: elevenRuneWords.length, allSum540Words: all540Words, uniqueElevenRune540Word: elevenRune540Words },
  pgpSignature: { armorBytes: Buffer.byteLength(armor, "utf8"), packetBytes: packet.length, header: [...packet.subarray(0, 3)], packetTag: 2, bodyBytes: packetBodyLength },
  clause: { words: [7, 15], runes: [firstClauseRunes, secondClauseRunes], primeSums: [firstClauseSum, secondClauseSum], secondClauseFirstWordSum: secondClauseFirstWordSum, remainingFourteenSum },
  ringsOutsideIn: ringSums.slice().reverse(),
  ringCountsOutsideIn: ringCounts.slice().reverse(),
  identities: {
    firstClause: firstClauseSum + " = " + signedArmorBytes + " + " + squareCenter,
    secondClause: secondClauseSum + " = " + outerThreeRings + " + " + tableCircumference,
    remainingWords: outerThreeRings + " - " + remainingFourteenSum + " = " + (outerThreeRings - remainingFourteenSum),
    residual: squareCenter + " + " + tableCircumference + " = " + inner3AndCenter,
  },
  conditionalWithinWordShuffle: { trials, seed: "0x10a39b32", hitInner5, hitInner3, hitBoth, pInner5: addOneP(hitInner5), pInner3: addOneP(hitInner3), pBoth: addOneP(hitBoth) },
}, null, 2));
