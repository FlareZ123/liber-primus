"use strict";

/**
 * Withheld p32 readout for the already-fixed p0-2 23-cycle.
 * Run from repository root:
 *   node sims/lp2_13x12_wordmap_p32_withheld_readout_sft.cjs
 *
 * The operation is deliberately frozen: each p0-cycle word's GP-prime sum
 * addresses one original p32 rune modulo the p32 page's 121-rune length.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const readJson = rel => JSON.parse(read(rel));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const transcription = read("resources/lp2-transcription.txt");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
function primeSum(word) {
  return Array.from(word.runes).reduce((sum, rune) => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined, "All source runes must be in GP29");
    return sum + corpus.prime[index];
  }, 0);
}
function transliterate(runes) {
  return Array.from(runes).map(rune => corpus.translit[runeIndex.get(rune)]).join("");
}

const p0To2 = parseLP2Words(transcription, 3);
assert.equal(p0To2.words.length, 158);
const heading = p0To2.words.slice(0, 2);
const body = p0To2.words.slice(2);
assert.equal(body.length, 156);
const headingSums = heading.map(primeSum);
assert.deepEqual(headingSums, [347, 315]);

const bodySums = body.map(primeSum);
const next = bodySums.map(sum => sum % body.length);
function trace(seed) {
  const seen = new Map();
  const path = [];
  let current = seed;
  while (!seen.has(current)) {
    seen.set(current, path.length);
    path.push(current);
    current = next[current];
  }
  const cycleStart = seen.get(current);
  return {
    path,
    transient: path.slice(0, cycleStart),
    cycle: path.slice(cycleStart)
  };
}
const firstTrace = trace(headingSums[0] % body.length);
const secondTrace = trace(headingSums[1] % body.length);
function canonicalRotation(cycle) {
  const minimum = Math.min(...cycle);
  const offset = cycle.indexOf(minimum);
  return cycle.slice(offset).concat(cycle.slice(0, offset));
}
assert.deepEqual(canonicalRotation(firstTrace.cycle), canonicalRotation(secondTrace.cycle));
assert.equal(firstTrace.transient.length, 3);
assert.equal(secondTrace.transient.length, 0);
const secondSeedPhase = firstTrace.cycle.indexOf(secondTrace.cycle[0]);
assert.equal(secondSeedPhase, 6);
const cycle = firstTrace.cycle;
assert.equal(cycle.length, 23);

const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const p32Readout = cycle.map((bodyIndex, step) => {
  const sourceSum = bodySums[bodyIndex];
  const p32Index0 = sourceSum % p32.length;
  return {
    step: step + 1,
    p0BodyWordIndex0: bodyIndex,
    p0BodyWordCell1: bodyIndex + 1,
    sourcePrimeSum: sourceSum,
    p32Index0,
    p32Cell1: p32Index0 + 1,
    rune: corpus.translit[p32[p32Index0]]
  };
});
const p32ReadoutRunes = p32Readout.map(item => item.rune);
const secondSeedReadoutRunes = secondTrace.cycle.map(bodyIndex => {
  const index0 = bodySums[bodyIndex] % p32.length;
  return corpus.translit[p32[index0]];
});
assert.deepEqual(
  secondSeedReadoutRunes,
  p32ReadoutRunes.slice(secondSeedPhase).concat(p32ReadoutRunes.slice(0, secondSeedPhase))
);
const expectedReadout = [
  "EA","Y","O","U","B","W","H","A","R","T","R","L",
  "AE","S","IA","T","NG","B","M","Y","I","TH","O"
];
assert.deepEqual(p32ReadoutRunes, expectedReadout);

// Check whether the cycle length itself selects a p32 word-address map.
// This is not a permutation of p32's actual printed word list.
const allPages = parseLP2Words(transcription, 55);
const p32Words = allPages.byStartPage[32];
assert.equal(p32Words.length, 21);
const p32WordAddressReadout = cycle.map((bodyIndex, step) => {
  const address0 = bodySums[bodyIndex] % cycle.length;
  return {
    step: step + 1,
    sourcePrimeSum: bodySums[bodyIndex],
    p32WordIndex0: address0,
    p32Word: address0 < p32Words.length ? transliterate(p32Words[address0].runes) : null
  };
});
const uniqueWordAddresses = new Set(p32WordAddressReadout.map(x => x.p32WordIndex0)).size;
const outOfRangeWordAddresses = p32WordAddressReadout.filter(
  x => x.p32WordIndex0 >= p32Words.length
).length;
assert.equal(uniqueWordAddresses, 15);
assert.equal(outOfRangeWordAddresses, 1);

const p32Punctuation = ink.pages.find(page => page.page === 32).large_punctuation;
assert.deepEqual(p32Punctuation, [[121, 13, "red"]]);
const p0To2PhysicalLineCounts = transcription.split("%").slice(0, 3).map(page =>
  page.split(/\r?\n/).filter(line => /[\u16A0-\u16FF]/u.test(line)).length
);
assert.deepEqual(p0To2PhysicalLineCounts, [12, 12, 9]);

console.log(JSON.stringify({
  source: "original LP2 transcription, canonical GP29 corpus, original p32 page and ink annotations",
  p0To2: {
    totalWords: p0To2.words.length,
    redHeadingPrimeSums: headingSums,
    bodyWords: body.length,
    seeds0: headingSums.map(sum => sum % body.length),
    transientLengths: [firstTrace.transient.length, secondTrace.transient.length],
    secondSeedPhaseOnFirstCycle: secondSeedPhase,
    cycleLength: cycle.length,
    cycleBodyWordCells1: cycle.map(index => index + 1),
    cyclePrimeSums: cycle.map(index => bodySums[index]),
    cycleWords: cycle.map(index => transliterate(body[index].runes))
  },
  p32: {
    runeCount: p32.length,
    printedWords: p32Words.length,
    largePunctuation: p32Punctuation,
    p0To2PhysicalLineCounts,
    fullCycleModulo121Readout: p32Readout,
    fullCycleModulo121Transliteration: p32ReadoutRunes.join(" "),
    secondSeedModulo121Transliteration: secondSeedReadoutRunes.join(" "),
    cycleModulo23WordReadout: p32WordAddressReadout,
    cycleModulo23UniqueWordAddresses: uniqueWordAddresses,
    cycleModulo23OutOfRangeWordAddresses: outOfRangeWordAddresses
  }
}, null, 2));
