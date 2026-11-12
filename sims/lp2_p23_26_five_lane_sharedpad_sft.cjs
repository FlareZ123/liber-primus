"use strict";

/**
 * LP2 pp23-26 five-dot / 201x5 common-pad necessary-invariant gate.
 *
 * A repeated GP29 additive pad shared across five native-English text lanes
 * cancels in pairwise lane differences. Unknown independent Caesar offsets
 * merely rotate each difference histogram, preserving its maximum count.
 * Tests both original source-natural lane layouts, with exact key-invariant
 * positive controls. Run: node sims/lp2_p23_26_five_lane_sharedpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(readText("resources/liber-primus/lp2-corpus.json"));
const nativePaths = [
  ["gibran", "resources/control/gibran_prophet_58585.txt"],
  ["emerson", "resources/control/emerson_essays_2944.txt"],
  ["shakespeare", "resources/control/shakespeare_first300k.txt"]
];
const tokens = corpus.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);

/**
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const normalized = text.toUpperCase().replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const runes = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(({t}) => word.startsWith(t, i));
      assert.ok(match, "Unmapped English GP token: " + word.slice(i));
      runes.push(match.i);
      i += match.t.length;
    }
  }
  return runes;
}

/**
 * @param {number[][]} lanes Exactly five aligned lanes of 201 symbols.
 * @returns {{sameRune:number, independentShiftUpperBound:number, pairCounts:number[]}}
 */
function collisionGate(lanes) {
  assert.equal(lanes.length, 5);
  for (const lane of lanes) assert.equal(lane.length, 201);
  let sameRune = 0;
  let independentShiftUpperBound = 0;
  const pairCounts = [];
  for (let a = 0; a < 5; a++) {
    for (let b = a + 1; b < 5; b++) {
      const histogram = Array(29).fill(0);
      for (let i = 0; i < 201; i++) {
        histogram[(lanes[a][i] - lanes[b][i] + 29) % 29]++;
      }
      pairCounts.push(histogram[0]);
      sameRune += histogram[0];
      independentShiftUpperBound += Math.max(...histogram);
    }
  }
  return {sameRune, independentShiftUpperBound, pairCounts};
}

/** @param {number[]} stream @returns {number[][]} */
function fiveBlocks(stream) {
  assert.equal(stream.length, 1005);
  return Array.from({length: 5}, (_, i) => stream.slice(i * 201, (i + 1) * 201));
}

/** @param {number[]} stream @returns {number[][]} */
function fiveQuintetPositions(stream) {
  assert.equal(stream.length, 1005);
  return Array.from({length: 5}, (_, i) => stream.filter((_, j) => j % 5 === i));
}

const counts = [213, 270, 273, 265];
const originals = corpus.pages.slice(23, 27);
assert.deepEqual(originals.map((p) => p.page), [23, 24, 25, 26]);
assert.deepEqual(originals.map((p) => p.indices.length), counts);
const body = originals.flatMap((page) => page.indices).slice(16);
assert.equal(body.length, 1005);
assert.deepEqual(corpus.pages[23].indices.slice(0, 16),
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);

const originalQuintet = collisionGate(fiveQuintetPositions(body));
const originalBlocks = collisionGate(fiveBlocks(body));
assert.equal(originalQuintet.sameRune, 55);
assert.equal(originalQuintet.independentShiftUpperBound, 126);
assert.equal(originalBlocks.sameRune, 60);
assert.equal(originalBlocks.independentShiftUpperBound, 122);

const controls = {};
const sourceLengths = [];
let positiveControl = null;
for (const [name, file] of nativePaths) {
  const source = nativeGP(readText(file));
  sourceLengths.push(source.length);
  const experiments = [];
  for (let i = 0; i + 1005 <= source.length; i += 1005) {
    experiments.push(collisionGate(fiveBlocks(source.slice(i, i + 1005))));
  }
  assert.ok(experiments.length > 0);
  const minimumSame = Math.min(...experiments.map((x) => x.sameRune));
  const minimumUpperBound = Math.min(...experiments.map((x) => x.independentShiftUpperBound));
  controls[name] = {
    nativeRunes: source.length,
    disjoint1005RuneWindows: experiments.length,
    minimumSame,
    minimumUpperBound,
    atOrBelowOriginalQuintet: experiments.filter(
      (x) => x.independentShiftUpperBound <= originalQuintet.independentShiftUpperBound).length,
    atOrBelowOriginalBlocks: experiments.filter(
      (x) => x.independentShiftUpperBound <= originalBlocks.independentShiftUpperBound).length
  };

  if (name === "gibran") {
    assert.equal(experiments.length, 62);
    assert.equal(minimumSame, 93);
    assert.equal(minimumUpperBound, 129);

    // Exact positive plant: arbitrary stream mask plus five independent,
    // unknown constant shifts leave every difference-histogram maximum fixed.
    let seed = 0x3301c1ca;
    /** @returns {number} */
    function nextRandom() {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return seed >>> 0;
    }
    const plain = fiveBlocks(source.slice(0, 1005));
    const pad = Array.from({length: 201}, () => nextRandom() % 29);
    const offsets = [0, 7, 13, 23, 28];
    const ciphertext = plain.map((lane, a) =>
      lane.map((value, i) => (value + pad[i] + offsets[a]) % 29));
    const recovered = ciphertext.map((lane, a) =>
      lane.map((value, i) => (value - pad[i] - offsets[a] + 58) % 29));
    assert.deepEqual(recovered, plain);
    assert.equal(collisionGate(ciphertext).independentShiftUpperBound,
      collisionGate(plain).independentShiftUpperBound);
    positiveControl = {
      padAndUnknownLaneOffsetsRecoverExactGP: true,
      plantedIndependentShiftUpperBound: collisionGate(ciphertext).independentShiftUpperBound
    };
  }
}
assert.deepEqual(sourceLengths, [63114, 324630, 218800]);
assert.deepEqual([
  controls.gibran.atOrBelowOriginalQuintet,
  controls.emerson.atOrBelowOriginalQuintet,
  controls.shakespeare.atOrBelowOriginalQuintet
], [0, 1, 0]);
assert.deepEqual([
  controls.gibran.atOrBelowOriginalBlocks,
  controls.emerson.atOrBelowOriginalBlocks,
  controls.shakespeare.atOrBelowOriginalBlocks
], [0, 0, 0]);
assert.equal(controls.emerson.minimumUpperBound, 125);
assert.equal(controls.shakespeare.minimumUpperBound, 129);

console.log(JSON.stringify({
  original: {quintetPositionLanes: originalQuintet, consecutive201RuneBlocks: originalBlocks},
  originalAlignedPairs: 2010,
  nativeControls: controls,
  originalNativeOffsetIndependentUpperBound: {
    quintetAtOrBelow: 1, blocksAtOrBelow: 0, sampleSize: 602
  },
  positiveControl
}, null, 2));
