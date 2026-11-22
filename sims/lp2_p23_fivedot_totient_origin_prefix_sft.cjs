"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const primes = firstPrimes(300);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} cardinal @returns {number} */
function totientPrimeOrdinal(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1 && cardinal <= primes.length);
  return mod29(primes[cardinal - 1] - 1);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} line @returns {number[]} */
function wordLengths(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
}

/** @param {string} line @returns {number} */
function terminalGp0(line) {
  const words = line.match(/[\u16A0-\u16FF]+/gu) || [];
  const terminalRune = [...words.at(-1)].at(-1);
  const value = runeIndex.get(terminalRune);
  assert.notEqual(value, undefined);
  return value;
}

/** @param {number} page @returns {{line:number,lens:number[],runes:number,text:string,terminalGp0:number}[]} */
function pageLines(page) {
  return physicalPart(page)
    .split(/\r?\n/)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line))
    .map((line, index) => {
      const lens = wordLengths(line);
      return {
        line: index + 1,
        lens,
        runes: lens.reduce((sum, value) => sum + value, 0),
        text: spell(lens.map(totientPrimeOrdinal)),
        terminalGp0: terminalGp0(line)
      };
    });
}

assert.deepEqual([2, 8, 5, 3].map(totientPrimeOrdinal), [2, 18, 10, 4]);
assert.equal(spell([2, 8, 5, 3].map(totientPrimeOrdinal)), "THEIR");

const p7 = pageLines(7);
const p23 = pageLines(23);
const p56 = pageLines(56);
assert.equal(p7.length, 10);
assert.equal(p23.length, 10);
assert.deepEqual(p7[9].lens, [2, 4, 3, 2, 3]);
assert.deepEqual(p23[0].lens, [2, 6, 3, 5, 4]);

const p7Ink = ink.pages.find((page) => page.page === 7);
const p23Ink = ink.pages.find((page) => page.page === 23);
assert.ok(p7Ink);
assert.ok(p23Ink);
assert.deepEqual(p7Ink.red_spans.map((span) => [span.start, span.length]), [[194, 14]]);
assert.deepEqual(p23Ink.red_spans.map((span) => [span.start, span.length]), [[0, 16]]);

assert.equal(p23[0].lens.slice(0, 4).reduce((sum, n) => sum + n, 0), 16);
assert.equal(p23[0].lens[4], 4);
assert.equal(spell(p23[0].lens.slice(0, 4).map(totientPrimeOrdinal)), "THEORI");
assert.equal(p23[0].text, "THEORIG");

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
assert.deepEqual(p23[0].lens, [dh.K, dh.a, dh.e, dh.g, dh.q]);

const allLines = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  for (const row of pageLines(page)) allLines.push({ page, ...row });
}
assert.equal(allLines.length, 604);
assert.deepEqual(
  allLines.filter((row) => row.text.includes("THEORIG")).map((row) => [row.page, row.line, row.lens]),
  [[23, 1, [2, 6, 3, 5, 4]]]
);
assert.deepEqual(
  allLines.filter((row) => JSON.stringify(row.lens) === JSON.stringify([2, 6, 3, 5, 4]))
    .map((row) => [row.page, row.line]),
  [[23, 1]]
);

const consecutiveCardinalLines = allLines
  .filter((row) => row.lens.length === 5)
  .filter((row) => JSON.stringify([...row.lens].sort((a, b) => a - b)) === JSON.stringify([2, 3, 4, 5, 6]))
  .map((row) => ({
    page: row.page,
    line: row.line,
    lens: row.lens,
    text: row.text,
    endpointInward:
      JSON.stringify(row.lens) === JSON.stringify([2, 6, 3, 5, 4]) ||
      JSON.stringify(row.lens) === JSON.stringify([6, 2, 5, 3, 4])
  }));
assert.deepEqual(consecutiveCardinalLines, [
  { page: 12, line: 5, lens: [6, 3, 2, 4, 5], text: "EORTHGI", endpointInward: false },
  { page: 23, line: 1, lens: [2, 6, 3, 5, 4], text: "THEORIG", endpointInward: true },
  { page: 53, line: 3, lens: [3, 4, 2, 5, 6], text: "RGTHIEO", endpointInward: false }
]);

/**
 * The stencil contributes d=5. For its adjacent text line, append d and d*m,
 * where m is that line's printed word count.
 * @param {{lens:number[]}} row
 * @returns {{cardinals:number[],text:string}}
 */
function motifCardinalExtension(row) {
  const dotCount = 5;
  const wordCount = row.lens.length;
  const cardinals = [...row.lens, dotCount, dotCount * wordCount];
  return { cardinals, text: spell(cardinals.map(totientPrimeOrdinal)) };
}

const motifControls = {
  p7: motifCardinalExtension(p7.at(-1)),
  p23: motifCardinalExtension(p23[0]),
  p56: motifCardinalExtension(p56.at(-1))
};
assert.equal(motifControls.p7.text, "THGRTHRIN");
assert.equal(motifControls.p23.text, "THEORIGIN");
assert.equal(motifControls.p56.text, "THTHGRRGIAE");
assert.deepEqual(motifControls.p23.cardinals, [2, 6, 3, 5, 4, 5, 25]);
assert.equal(p23[0].terminalGp0, 25);
assert.equal(spell([p23[0].terminalGp0].map(totientPrimeOrdinal)), "N");

const originHits = allLines
  .filter((row) => row.lens.length === 5)
  .filter((row) => motifCardinalExtension(row).text === "THEORIGIN")
  .map((row) => [row.page, row.line]);
assert.deepEqual(originHits, [[23, 1]]);

const nCardinals = [];
for (let cardinal = 1; cardinal <= 300; cardinal += 1) {
  if (totientPrimeOrdinal(cardinal) === corpus.translit.indexOf("N")) nCardinals.push(cardinal);
}
assert.deepEqual(nCardinals.slice(0, 10), [25, 58, 96, 114, 123, 163, 220, 237, 261, 268]);
assert.deepEqual(p23.filter((row) => row.runes === 25).map((row) => row.line), [9]);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelector: {
    fiveDotPages: [7, 23, 56],
    p7TerminalRedLine: { line: 10, wordLengths: p7[9].lens },
    p23ReflectedInitialLine: { line: 1, wordLengths: p23[0].lens, runes: p23[0].runes }
  },
  serializer: "T(n)=phi(p_n) mod29=(p_n-1) mod29, positive one-based cardinal",
  p23: {
    redHeadingLengths: p23[0].lens.slice(0, 4),
    redHeadingOutput: spell(p23[0].lens.slice(0, 4).map(totientPrimeOrdinal)),
    fullFirstLineLengths: p23[0].lens,
    fullFirstLineOutput: p23[0].text,
    dhTypedLengths: ["K", "a", "e", "g", "q"],
    dotCount: 5,
    wordCount: p23[0].lens.length,
    extendedCardinals: motifControls.p23.cardinals,
    candidateInstruction: motifControls.p23.text,
    uniqueAcross604Lines: true,
    consecutiveCardinalPermutationControls: consecutiveCardinalLines,
    endpointInwardOrderUniqueWithinThatFamily: true
  },
  matchedMotifControls: {
    p7TerminalAdjacent: motifControls.p7,
    p23InitialAdjacent: motifControls.p23,
    p56TerminalAdjacent: motifControls.p56
  },
  chronologyCaveat: "THEORIG was observed before the 5x5=25 completion. Treat THE ORIGIN as a source-constrained candidate instruction, not a blind plaintext probability.",
  independentEchoes: {
    smallestCardinalMappingToN: 25,
    p23Unique25RuneLine: [9],
    signed2016SecondTheirPosition: 25,
    p23SelectedLineTerminalGp0: p23[0].terminalGp0
  }
}, null, 2));
