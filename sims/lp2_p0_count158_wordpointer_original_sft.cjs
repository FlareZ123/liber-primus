"use strict";
/**
 * Source-derived 158-word inclusive pointer graph for original LP2 pp0-2.
 * A 2013 participant report recorded "ab=158", so test retaining both red
 * heading words, unlike the older 156-body-word graph.
 *
 * No authenticated author instruction ties 2013 COUNT to 2014 LP2.
 * No unknown plaintext is asserted. Run: node sims/lp2_p0_count158_wordpointer_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const {words} = parseLP2Words(raw, 3);
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const sums = words.map(word => [...word.runes]
  .reduce((total, rune) => total + corpus.prime[runes.get(rune)], 0));
const next = sums.map(v => v % 158);
const lengths = words.map(word => word.length);
assert.equal(words.length, 158);
assert.equal(lengths.reduce((a, b) => a + b), 729);
assert.deepEqual(words.map(w => w.startPage)
  .reduce((counts, page) => (counts[page]++, counts), [0, 0, 0]), [59, 62, 37]);
assert.deepEqual(sums.slice(0, 2), [347, 315]);
assert.equal(sums[1], 2 * words.length - 1); // 315 = 2*158 - 1
assert.equal(sums[0] - sums[1], sums[0] % words.length + 1); // 32
assert.deepEqual(sums.flatMap((value, index) =>
  value === sums[1] ? [index + 1] : []), [2, 109]); // second exact match is body cell109

/** @param {number} seed @param {number[]} f @returns {{transient:number[],cycle:number[]}} */
function walk(seed, f) {
  const visited = new Map();
  const path = [];
  let at = seed;
  while (!visited.has(at)) {
    visited.set(at, path.length);
    path.push(at);
    at = f[at];
  }
  const k = visited.get(at);
  return {transient: path.slice(0, k), cycle: path.slice(k)};
}

/** @param {number[]} f @returns {number[][]} */
function allCycles(f) {
  const visited = new Set(), cycles = [];
  for (let start = 0; start < f.length; start++) {
    if (visited.has(start)) continue;
    let at = start;
    const path = [], seen = new Map();
    while (!visited.has(at) && !seen.has(at)) {
      seen.set(at, path.length);
      path.push(at);
      at = f[at];
    }
    if (seen.has(at)) cycles.push(path.slice(seen.get(at)));
    for (const node of path) visited.add(node);
  }
  return cycles;
}

const seeds = sums.slice(0, 2).map(v => v % 158);
assert.deepEqual(seeds, [31, 157]);
const first = walk(seeds[0], next), second = walk(seeds[1], next);
assert.deepEqual(first.transient.map(i => i + 1), [32, 116, 75, 109, 158, 54, 56]);
assert.equal(sums[first.transient[3]], sums[1]); // body cell109 repeats the heading sum
assert.deepEqual(first.cycle.map(i => i + 1), [148, 15, 127, 64, 83]);
assert.deepEqual(second.transient.map(i => i + 1), [158, 54, 56]);
assert.deepEqual(second.cycle, first.cycle);
assert.deepEqual(allCycles(next).map(c => c.length).sort((a, b) => a - b),
  [1, 1, 1, 1, 2, 2, 5]);

const cycleSums = first.cycle.map(i => sums[i]);
const cycleLengths = first.cycle.map(i => lengths[i]);
assert.deepEqual(cycleSums, [488, 126, 379, 240, 147]);
assert.deepEqual(cycleLengths, [10, 2, 7, 4, 3]);
assert.equal(cycleLengths.reduce((a, b) => a + b), 26);
const key = cycleSums.map(v => v % 29);
assert.deepEqual(key, [24, 10, 2, 8, 2]);
const key26 = first.cycle.flatMap(cell => [...words[cell].runes].map(rune => runes.get(rune)));
assert.equal(key26.length, 26);

const gp = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const black = gp.slice(13);
const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(gp.length, 729);
assert.equal(black.length, 716);
assert.equal(p55.length, 76);
const mod29 = x => (x % 29 + 29) % 29;
const decode = (cipher, values, sign) => cipher.map((x, i) => mod29(x + sign * values[i % values.length]));
const index29 = seq => {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x] += 1;
  return 29 * hist.reduce((a, v) => a + v * (v - 1), 0) / (seq.length * (seq.length - 1));
};
const receivers = [];
for (const [name, values] of [["cycle-sum-mod29", key], ["full-cycle-26rune", key26]]) {
  for (const sign of [-1, 1]) {
    const p0 = decode(black, values, sign);
    const p55text = decode(p55, values, sign);
    assert.deepEqual(decode(p0, values, -sign), black);
    assert.deepEqual(decode(p55text, values, -sign), p55);
    receivers.push({
      sourceKey: name, inverseSign: sign,
      p0BlackNormIoC: Number(index29(p0).toFixed(6)),
      p55NormIoC: Number(index29(p55text).toFixed(6)),
      p0First30: p0.slice(0, 30).map(x => corpus.translit[x]).join(""),
    });
  }
}

// Deterministic fixed-title, within-page-words permutation control.
// The joint event is retrospective and IS NOT a corrected p-value.
const trialSums = sums.slice();
const bounds = [[2, 59], [59, 121], [121, 158]];
const attempts = 100000;
let state = 3301158 >>> 0;
const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0);
const control = {firstReachesSecondWithinFour: 0, sameFiveCycle: 0, both: 0};
for (let t = 0; t < attempts; t++) {
  for (const [begin, end] of bounds) {
    for (let i = end - 1; i > begin; i--) {
      const j = begin + random() % (i - begin + 1);
      [trialSums[i], trialSums[j]] = [trialSums[j], trialSums[i]];
    }
  }
  const perm = trialSums.map(x => x % 158);
  const a = walk(seeds[0], perm), b = walk(seeds[1], perm);
  const meets = a.transient.concat(a.cycle).indexOf(seeds[1]);
  const reaches = meets >= 0 && meets <= 4;
  const bothFive = a.cycle.length === 5 && b.cycle.some(x => a.cycle.includes(x));
  control.firstReachesSecondWithinFour += Number(reaches);
  control.sameFiveCycle += Number(bothFive);
  control.both += Number(reaches && bothFive);
}
assert.deepEqual(control, {
  firstReachesSecondWithinFour: 4740,
  sameFiveCycle: 4458,
  both: 322,
});

// Cross-section transfer control: retain each chapter's actual word count,
// and use the same first-two-word GP-sum seed convention throughout. Later
// chapters need not have two red title words: this is a deliberately generous
// structural recurrence check, not a claim to physically identical headings.
const originalChapters = raw.split("$").slice(0, 8);
const transfer = originalChapters.map((chapter, chapterIndex) => {
  const chapterWords = parseLP2Words(chapter, 100).words;
  const count = chapterWords.length;
  const sectionSums = chapterWords.map(word => [...word.runes]
    .reduce((total, rune) => total + corpus.prime[runes.get(rune)], 0));
  const graph = sectionSums.map(sum => sum % count);
  const a = walk(sectionSums[0] % count, graph);
  const b = walk(sectionSums[1] % count, graph);
  return {
    chapterIndex, count,
    sameTerminalCycle: a.cycle.some(cell => b.cycle.includes(cell)),
    cycleLengths: [a.cycle.length, b.cycle.length],
  };
});
assert.deepEqual(transfer.map(x => x.count),
  [158, 255, 385, 435, 224, 326, 378, 735]);
assert.deepEqual(transfer.map(x => x.sameTerminalCycle),
  [true, true, false, false, true, true, true, false]);

console.log(JSON.stringify({
  source: "LP2 pp0-2 original physical 729-rune transcript",
  prior: "2013 COUNT participant report ab=158, hypothesized link",
  seedCells1: seeds.map(x => x + 1),
  originalCycles: allCycles(next).map(x => x.length).sort((a, b) => a - b),
  firstTransientCells1: first.transient.map(x => x + 1),
  secondTransientCells1: second.transient.map(x => x + 1),
  commonFiveCycleCells1: first.cycle.map(x => x + 1),
  title158SelfIndex: {bodyWordCount: words.length, red2PrimeSum: sums[1],
    equation: "315 = 2 * 158 - 1", redSumDifference: sums[0] - sums[1],
    bodyCellsWithSameGPPrimeSumAsRed2: [109]},
  cycleSums, cycleLengths, key,
  receivers,
  sourceWindowTransfer: transfer,
  shuffleControl: {attempts, pageBoundaryRanges0: bounds, ...control},
  decision: "No authenticated key or original plaintext; count-included map remains speculative",
}, null, 2));
