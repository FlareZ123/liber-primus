"use strict";

/**
 * Original LP2 page55 terminal six-rune to p27 offset28 loopback.
 * Page numbers/offsets are zero-based LP2 physical page and rune positions.
 * Exact source link and one frozen, directionally motivated key consumer.
 *
 * SFT: node sims/lp2_p55_final6_p27_28loop_original_sft.cjs
 * Node.js 20+ CommonJS. Original corpus read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const ps = source.pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(ps.length, 55);
const p27 = ps.find(p => p.page === 27);
const p55 = ps.find(p => p.page === 55);
const p57 = source.pages.find(p => p.page === 57);
assert(p27 && p55 && p57);
assert.equal(p27.indices.length, 234);
assert.equal(p55.indices.length, 76);
const same = (a, b) => a.length === b.length &&
  a.every((v, i) => v === b[i]);
const tail = p55.indices.slice(-6);
const anchor = p27.indices.slice(28, 34);
assert(same(tail, anchor));
assert.equal(p55.page - p27.page, 28);

// Search every source-page six-rune endpoint against every other page.
// A match is counted even when its target page is later rather than earlier.
const links = [];
for (const from of ps) {
  const suffix = from.indices.slice(-6);
  for (const to of ps) {
    if (from.page === to.page) continue;
    for (let offset = 0; offset + 6 <= to.indices.length; offset++) {
      if (same(suffix, to.indices.slice(offset, offset + 6))) {
        links.push({
          from: from.page, to: to.page,
          offset, gap: from.page - to.page
        });
      }
    }
  }
}
assert.deepEqual(links, [{from: 55, to: 27, offset: 28, gap: 28}]);
assert.equal(tail.map(i => source.translit[i]).join("."), "D.J.U.B.E.I");
const gpPrime = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,
  61,67,71,73,79,83,89,97,101,103,107,109];
const wordPrimeSums = [
  tail.slice(0,3).reduce((n,i)=>n+gpPrime[i],0),
  tail.slice(3).reduce((n,i)=>n+gpPrime[i],0)
];
const combinedPrimeSum = wordPrimeSums[0] + wordPrimeSums[1];
assert.deepEqual(wordPrimeSums, [129,159]);
assert.equal(combinedPrimeSum, 288);
assert.equal(combinedPrimeSum % 29, p27.page);
assert.equal(combinedPrimeSum % 58, 56);
const directedPrimeDifference =
  ((wordPrimeSums[0] - wordPrimeSums[1]) % 29 + 29) % 29;
assert.equal(directedPrimeDifference, 28);
assert.equal(directedPrimeDifference, p55.page-p27.page);

const transcription = fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-transcription.txt"), "utf8");
const sourcePages = new Map();
for (const [chapterIndex, body] of transcription.split("%").slice(0,55).entries()) {
  const physicalPage = chapterIndex >= 50 ? chapterIndex + 1 : chapterIndex;
  const words = [];
  let start = 0, offset = 0, word = [];
  function flush() {
    if (word.length) {
      words.push({start, runes: word.slice(),
        primeSum: word.reduce((n, c) => n + gpPrime[c], 0)});
      word = [];
    }
  }
  for (const glyph of body) {
    const rune = source.runes.indexOf(glyph);
    if (rune >= 0) {
      if (!word.length) start = offset;
      word.push(rune);
      offset++;
    } else if ("-.assert.equal(directedPrimeDifference, p55.page-p27.page);§".includes(glyph)) flush();
  }
  flush();
  const registered = source.pages.find(p => p.page === physicalPage);
  assert(registered);
  assert.equal(offset, registered.indices.length);
  sourcePages.set(physicalPage, {words, runes: registered.indices});
}
// Predeclare the same arithmetic on ALL page-local adjacent printed-word
// pairs of total length >=6. The source page index must differ from the
// destination. No allowed reorientation, alternative modulus or word skip.
let eligiblePairs = 0;
const arithmeticHits = [];
for (const [from, record] of sourcePages) {
  const words = record.words;
  for (let j = 0; j + 1 < words.length; j++) {
    const [a, b] = [words[j], words[j + 1]];
    const candidate = a.runes.concat(b.runes);
    if (candidate.length < 6) continue;
    eligiblePairs++;
    const to = (a.primeSum + b.primeSum) % 29;
    const offset = ((a.primeSum - b.primeSum) % 29 + 29) % 29;
    if (to === from || !sourcePages.has(to)) continue;
    const target = sourcePages.get(to).runes;
    if (candidate.every((rune, i) => target[offset + i] === rune)) {
      arithmeticHits.push({
        from, sourceWordIndex: j, sourceRuneOffset: a.start,
        to, targetRuneOffset: offset, length: candidate.length,
        isTerminalPair: j === words.length - 2
      });
    }
  }
}
const targetP27Words = sourcePages.get(27).words;
assert.deepEqual(targetP27Words[5].runes, tail.slice(0,3));
assert.deepEqual(targetP27Words[6].runes, tail.slice(3));
assert.deepEqual(targetP27Words[7].runes, [25,0]);  // AE F
assert.equal(targetP27Words[7].start, 34);
assert.equal(targetP27Words[7].primeSum, 103);
const originalTable = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/base60-grid.json"), "utf8"));
const cells = originalTable.rows.flat();
assert.equal(cells.length, 256);
assert.equal(cells[102], "0W");  // 103rd cell
assert.equal(cells[103], "3Q");  // 104th cell
assert.equal(eligiblePairs, 2454);
assert.deepEqual(arithmeticHits, [{
  from: 55, sourceWordIndex: 15, sourceRuneOffset: 70,
  to: 27, targetRuneOffset: 28, length: 6, isTerminalPair: true
}]);



const afterAnchor = p27.indices.slice(34, 104);
const front = p55.indices.slice(0, 70);
assert.equal(afterAnchor.length, front.length);

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
const subtract = front.map((c, i) => (c - afterAnchor[i] + 29) % 29);
const add = front.map((c, i) => (c + afterAnchor[i]) % 29);
const plant = p57.indices.slice(0, 70);
assert.equal(plant.length, 70);
const reencr = plant.map((p, i) => (p + afterAnchor[i]) % 29);
assert(same(reencr.map((c, i) => (c - afterAnchor[i] + 29) % 29), plant));
assert(!same(subtract, plant));
assert(indexOfCoincidence(plant) > indexOfCoincidence(subtract));
assert(indexOfCoincidence(plant) > indexOfCoincidence(add));

// Conditional after selecting this exact pair and six-rune marker, there
// are 76*234 possible independent circular shifts, and exactly one pair
// puts both marker positions at the observed endpoint/offset. This is a
// positional reference, never an uncorrected discovery significance.
const conditionalRotations = p55.indices.length * p27.indices.length;
console.log(JSON.stringify({
  claim: "candidate terminal-page navigation marker, not plaintext",
  source: {runeBearingPages: ps.length,
    p55Len: p55.indices.length, p27Len: p27.indices.length},
  endpointLinksOfSixRunesAcrossAllPages: links,
  sourceDirectedWordPairCoordinateTest: {eligiblePairs, arithmeticHits},
  repeatedGematria: tail.map(i => source.translit[i]).join("-"),
  sourceNumberDirectionCandidate: {
    wordPrimeSums, combinedPrimeSum,
    modAlphabet29: combinedPrimeSum % 29,
    firstMinusSecondMod29: directedPrimeDifference,
    targetPageRuneOffset: 28,
    immediateNextP27WordPrimeSum: 103,
    tableCell103: cells[102], tableCell104: cells[103],
    destinationPhysicalPage: p27.page,
    modTotalPages58: combinedPrimeSum % 58
  },
  conditionalRotationalPlacements: conditionalRotations,
  fixedHypothesis: "p27 following six-rune marker at offset34 supplies 70 GP29 key runes for p55 preceding 70 cipher runes",
  directAdditiveResults: {
    subtractIoC: indexOfCoincidence(subtract),
    addIoC: indexOfCoincidence(add),
    solvedP57First70IoC: indexOfCoincidence(plant),
    subtractLatin: subtract.map(i => source.translit[i]).join(""),
    addLatin: add.map(i => source.translit[i]).join("")
  },
  recoveredUnknownPlaintext: false
}, null, 2));
