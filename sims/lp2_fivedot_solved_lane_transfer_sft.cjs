"use strict";
/**
 * Reproducible five-dot-triad lane-key transfer on original LP2 ciphertext.
 *
 * Input: physical pp3-7, pp23-26, solved p56, and the exact original
 * printed-line transcription. Uses the p7/p23/p56 mirrored art as a
 * hypothesized lane orientation; does not claim it instructs this cipher.
 *
 * Run from repository root: node sims/lp2_fivedot_solved_lane_transfer_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8").split("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let v = 2; out.length < count; v++) {
    let prime = true;
    for (let d = 2; d * d <= v; d++) {
      if (v % d === 0) { prime = false; break; }
    }
    if (prime) out.push(v);
  }
  return out;
}

/** @param {number} page @returns {number[][]} */
function pageLines(page) {
  const lines = transcription[page].split(/\/\s*|\n+/)
    .map(line => [...line].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)))
    .filter(line => line.length > 0);
  assert.deepEqual(lines.flat(), corpus.pages[page].indices);
  return lines;
}

/**
 * @param {number[]} stream
 * @param {number} width
 * @param {"rows"|"interleave"} order
 * @returns {number[][]}
 */
function unpack(stream, width, order) {
  assert.equal(stream.length, 5 * width);
  return Array.from({ length: 5 }, (_, lane) => Array.from(
    { length: width }, (_, j) => stream[order === "rows" ? lane * width + j : 5 * j + lane]));
}

/**
 * @param {number[][]} strips
 * @param {number} width
 * @param {"rows"|"interleave"} order
 * @returns {number[]}
 */
function pack(strips, width, order) {
  const out = Array(5 * width);
  for (let lane = 0; lane < 5; lane++) {
    for (let j = 0; j < width; j++) {
      out[order === "rows" ? lane * width + j : 5 * j + lane] = strips[lane][j];
    }
  }
  return out;
}

/**
 * Model additive five-lane transfer with source-reflected lane order.
 * @param {number[]} stream
 * @param {number[]} key
 * @param {"rows"|"interleave"} sourceOrder
 * @param {"rows"|"interleave"} keyOrder
 * @param {-1|1} sign
 * @returns {number[]}
 */
function apply(stream, key, sourceOrder, keyOrder, sign) {
  const width = stream.length / 5;
  const period = key.length / 5;
  const sourceLanes = unpack(stream, width, sourceOrder);
  const keyLanes = unpack(key, period, keyOrder);
  const decoded = sourceLanes.map((lane, i) =>
    lane.map((value, j) => (value + sign * keyLanes[4 - i][j % period] + 29) % 29));
  return pack(decoded, width, sourceOrder);
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const value of stream) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (stream.length * (stream.length - 1));
}

/** @param {number[]} a @returns {string} */
function latin(a) { return a.map(i => corpus.translit[i]).join(""); }

const p56Cipher = corpus.pages[56].indices;
assert.equal(p56Cipher.length, 85);
const primes = firstPrimes(85);
let phase = 0;
const p56Plain = p56Cipher.map((v, i) =>
  i === 56 ? 0 : (v - (primes[phase++] - 1) % 29 + 29) % 29);
assert.equal(phase, 84);
assert.equal(latin(p56Plain),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const p56Shifts = p56Cipher.map((c, i) => (c - p56Plain[i] + 29) % 29);
assert.equal(p56Shifts[56], 0);

const original23 = corpus.pages.slice(23, 27).flatMap(page => page.indices);
assert.deepEqual(original23.slice(0, 16), pageLines(23).flat().slice(0, 16));
const target23 = original23.slice(16).reverse();
assert.equal(original23.length, 1021);
assert.equal(target23.length, 1005);

const pages3to7 = [3, 4, 5, 6, 7];
const target3 = pages3to7.flatMap(p =>
  pageLines(p).flatMap(line => line.slice().reverse()));
assert.equal(target3.length, 1145);

/**
 * Source-control challenge: p56 contains five printed rune lines.
 * Independent original-JPEG dot centroids, sorted by increasing x, rank by
 * increasing y as [2,0,4,1,3] for p56, [2,4,0,3,1] for p7,
 * and [1,3,0,4,2] for p23. See the pre-existing original-image SFT:
 * sims/lp2_p7_p23_p56_dot_triad_sft.py
 *
 * If five-dot reading order selects a pre-totient rune transposition for
 * solved p56, it must reproduce independently known plaintext under the
 * unchanged authentic 85 cipher shifts. Try only these source-visible orders,
 * each on printed lines, 17 quintets, and five contiguous 17-rune stripes.
 */
const p56Lines = transcription[55].split(/\/\s*|\n+/)
  .map(line => [...line].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)))
  .filter(line => line.length > 0);
assert.deepEqual(p56Lines.map(line => line.length), [20, 19, 6, 22, 18]);
assert.deepEqual(p56Lines.flat(), p56Cipher);
const dotOrders = {
  leftToRight: [0, 1, 2, 3, 4],
  p56TopToBottom: [2, 0, 4, 1, 3],
  p56BottomToTop: [3, 1, 4, 0, 2],
  rightToLeft: [4, 3, 2, 1, 0],
  p7TopToBottom: [2, 4, 0, 3, 1],
  p23TopToBottom: [1, 3, 0, 4, 2]
};
/** @param {number[]} order @param {string} grouping @returns {number[]} */
function permuteP56(order, grouping) {
  if (grouping === "printedLines") return order.flatMap(j => p56Lines[j]);
  const lanes = unpack(p56Cipher, 17, grouping === "quintets" ? "interleave" : "rows");
  return pack(order.map(j => lanes[j]), 17,
    grouping === "quintets" ? "interleave" : "rows");
}
const p56DotControls = [];
for (const [orderName, order] of Object.entries(dotOrders)) {
  for (const grouping of ["printedLines", "quintets", "stripes17"]) {
    const rearranged = permuteP56(order, grouping);
    const decoded = rearranged.map((v, i) => (v - p56Shifts[i] + 29) % 29);
    const knownPlaintextMismatches = decoded.reduce(
      (sum, v, i) => sum + (v === p56Plain[i] ? 0 : 1), 0);
    p56DotControls.push({ orderName, grouping, knownPlaintextMismatches });
  }
}
assert.equal(p56DotControls.filter(x => x.knownPlaintextMismatches === 0).length, 3);
assert.ok(p56DotControls.every(x =>
  x.orderName === "leftToRight" || x.knownPlaintextMismatches >= 64));

const solvedControl = corpus.pages[57].indices;
assert.equal(solvedControl.length, 95);
const targets = [
  { name: "pp3-7 line-mirrored", original: target3, width: 229 },
  { name: "pp23-26 post-heading reversed", original: target23, width: 201 }
];
const keys = [
  { name: "solved-p56-plaintext", values: p56Plain },
  { name: "solved-p56-actual-cipher-shifts", values: p56Shifts },
  { name: "solved-p56-body80-plaintext", values: p56Plain.slice(5) }
];
const results = [];
for (const target of targets) {
  for (const key of keys) {
    for (const sourceOrder of ["rows", "interleave"]) {
      for (const keyOrder of ["rows", "interleave"]) {
        for (const sign of [-1, 1]) {
          const candidate = apply(target.original, key.values, sourceOrder, keyOrder, sign);
          assert.deepEqual(
            apply(candidate, key.values, sourceOrder, keyOrder, -sign), target.original);
          const nativePlain = Array.from({ length: target.original.length },
            (_, i) => solvedControl[i % solvedControl.length]);
          const plantedCipher = apply(nativePlain, key.values, sourceOrder, keyOrder, -sign);
          assert.deepEqual(
            apply(plantedCipher, key.values, sourceOrder, keyOrder, sign), nativePlain);
          results.push({
            target: target.name,
            key: key.name,
            sourceOrder,
            keyOrder,
            sign,
            runeCount: target.original.length,
            originalIoc: ioc(target.original),
            outputIoc: ioc(candidate),
            first60Latin: latin(candidate).slice(0, 60),
            exactForwardReencryption: true,
            knownNativeControlRecovered: true
          });
        }
      }
    }
  }
}
for (const target of targets) {
  const byTarget = results.filter(x => x.target === target.name);
  assert.ok(Math.max(...byTarget.map(x => x.outputIoc)) < 0.04);
}
/**
 * Key-independent two-time-pad consequence of an even broader five-dot
 * hypothesis: pp3-7 and p23-26 post-heading share a common GP29 additive pad
 * reset from their visually matched section boundaries. The source supports
 * only four untuned full-chapter directions. If true, C_A-C_B=P_A-P_B.
 *
 * Calibrate the exact difference-symbol IoC against independent real English
 * GP passages of the same 1005-rune length. This is a bounded native-English
 * necessary condition for a *pure* common additive pad with no downstream
 * rune substitutions, hidden key skips, or differential feedback.
 */
/** @param {string} text @returns {number[]} */
function englishGp(text) {
  const lookup = new Map(corpus.translit.map((x, i) => [x, i]));
  const out = [];
  for (let word of text.match(/[A-Za-z]+/g) || []) {
    word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let j = 0; j < word.length;) {
      const pair = word.slice(j, j + 2);
      if (lookup.has(pair)) { out.push(lookup.get(pair)); j += 2; }
      else { assert.ok(lookup.has(word[j])); out.push(lookup.get(word[j])); j++; }
    }
  }
  return out;
}
/** @param {number[]} left @param {number[]} right @returns {number[]} */
function modDifferences(left, right) {
  return Array.from({ length: 1005 }, (_, i) => (left[i] - right[i] + 29) % 29);
}
const sourceA = corpus.pages.slice(3, 8).flatMap(page => page.indices);
const sourceB = corpus.pages.slice(23, 27).flatMap(page => page.indices).slice(16);
assert.equal(sourceA.length, 1145);
assert.equal(sourceB.length, 1005);
const originalRelative = [];
for (const reverseA of [false, true]) {
  for (const reverseB of [false, true]) {
    const a = reverseA ? sourceA.slice().reverse() : sourceA;
    const b = reverseB ? sourceB.slice().reverse() : sourceB;
    const d = modDifferences(a, b);
    originalRelative.push({ reverseA, reverseB, differenceIoc: ioc(d),
      alignedExactCipherRunePairs: d.filter(x => x === 0).length });
  }
}
const gpShakespeare = englishGp(fs.readFileSync(
  path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"));
const gpGibran = englishGp(fs.readFileSync(
  path.join(root, "resources/control/gibran_prophet_58585.txt"), "utf8"));
assert.equal(gpShakespeare.length, 218800);
assert.equal(gpGibran.length, 63114);
let seed = 1337;
/** @returns {number} */
function nextRandom() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const nativeRelativeScores = [];
for (let trial = 0; trial < 200; trial++) {
  const startA = Math.floor(nextRandom() * (gpShakespeare.length - 1005));
  const startB = Math.floor(nextRandom() * (gpGibran.length - 1005));
  const nativeA = gpShakespeare.slice(startA, startA + 1005);
  const nativeB = gpGibran.slice(startB, startB + 1005);
  const expectedDifference = modDifferences(nativeA, nativeB);
  const pad = Array.from({ length: 1005 }, () => Math.floor(nextRandom() * 29));
  const encryptedA = nativeA.map((x, i) => (x + pad[i]) % 29);
  const encryptedB = nativeB.map((x, i) => (x + pad[i]) % 29);
  assert.deepEqual(modDifferences(encryptedA, encryptedB), expectedDifference);
  nativeRelativeScores.push(ioc(expectedDifference));
}
const maxOriginalRelative = Math.max(...originalRelative.map(x => x.differenceIoc));
const nativeRelativeMinimum = Math.min(...nativeRelativeScores);
const nativeRelativeMean =
  nativeRelativeScores.reduce((sum, x) => sum + x, 0) / nativeRelativeScores.length;
assert.ok(maxOriginalRelative < nativeRelativeMinimum);
const sharedPadComparison = {
  model: "Exactly reused 1005-position mod29 additive pad on both original stencil-joined chapters",
  originalOrientations: originalRelative,
  originalHighestIoc: maxOriginalRelative,
  nativeIndependentGP1005RuneSourceWindows: nativeRelativeScores.length,
  nativeDifferenceIocMinimum: nativeRelativeMinimum,
  nativeDifferenceIocMean: nativeRelativeMean,
  nativeControlsAtOrBelowStrongestOriginal: nativeRelativeScores.filter(
    x => x <= maxOriginalRelative).length,
  exactReusedPadPlants: 200,
  interpretation: "No native GP-English shared-pad difference signal in four source-fixed directions; pure common-additive-key model only."
};

/**
 * Stronger five-lane shared-pad invariant. Give each of five lanes its own
 * unknown constant Caesar difference; each lane's difference IoC stays
 * unchanged under arbitrary such constants. Both original five-lane layouts
 * and all four original complete-section reversals are frozen in advance.
 * The full family max is recalculated for every native-GP control pair.
 *
 * @param {number[]} a Original first-section stream
 * @param {number[]} b Original second-section stream
 * @param {boolean} reverseA
 * @param {boolean} reverseB
 * @param {"rows"|"interleave"} order
 * @returns {number}
 */
function fiveLaneDifferenceIoc(a, b, reverseA, reverseB, order) {
  const left = reverseA ? a.slice().reverse() : a;
  const right = reverseB ? b.slice().reverse() : b;
  const d = modDifferences(left, right);
  const lanes = unpack(d, 201, order);
  return lanes.reduce((sum, lane) => sum + ioc(lane), 0) / 5;
}
const fiveLaneSettings = [];
for (const reverseA of [false, true]) for (const reverseB of [false, true]) {
  for (const order of ["rows", "interleave"]) {
    fiveLaneSettings.push({ reverseA, reverseB, order,
      originalIoc: fiveLaneDifferenceIoc(sourceA, sourceB, reverseA, reverseB, order) });
  }
}
let laneSeed = 1337;
/** @returns {number} */
function laneRand() {
  laneSeed = (Math.imul(laneSeed, 1664525) + 1013904223) >>> 0;
  return laneSeed / 4294967296;
}
const nativeFiveLaneMaxima = [];
const nativeLaneScoresBySetting = fiveLaneSettings.map(() => []);
for (let trial = 0; trial < 500; trial++) {
  const startA = Math.floor(laneRand() * (gpShakespeare.length - 1005));
  const startB = Math.floor(laneRand() * (gpGibran.length - 1005));
  const a = gpShakespeare.slice(startA, startA + 1005);
  const b = gpGibran.slice(startB, startB + 1005);
  const scores = fiveLaneSettings.map((setting, i) => {
    const score = fiveLaneDifferenceIoc(a, b,
      setting.reverseA, setting.reverseB, setting.order);
    nativeLaneScoresBySetting[i].push(score);
    return score;
  });
  nativeFiveLaneMaxima.push(Math.max(...scores));
}
const bestOriginalLaneIoc = Math.max(...fiveLaneSettings.map(x => x.originalIoc));
const sourceLaneMaxControlsAtOrBelow = nativeFiveLaneMaxima.filter(
  x => x <= bestOriginalLaneIoc).length;
assert.equal(sourceLaneMaxControlsAtOrBelow, 2);

/**
 * A genuine common five-lane GP29-pad plant with unrelated secret offsets
 * on the same positions can be decoded using the invariant without
 * identifying the key values. Use both original five-lane layouts.
 */
for (const order of ["rows", "interleave"]) {
  const nativeA = gpShakespeare.slice(0, 1005);
  const nativeB = gpGibran.slice(0, 1005);
  const aLanes = unpack(nativeA, 201, order);
  const bLanes = unpack(nativeB, 201, order);
  const aEncoded = [];
  const bEncoded = [];
  const key = Array.from({ length: 201 }, (_, j) => (7 * j + 13) % 29);
  for (let lane = 0; lane < 5; lane++) {
    aEncoded.push(aLanes[lane].map((x, j) => (x + key[j] + 3 * lane) % 29));
    bEncoded.push(bLanes[lane].map((x, j) => (x + key[j] + 7 * lane) % 29));
  }
  const encryptedA = pack(aEncoded, 201, order);
  const encryptedB = pack(bEncoded, 201, order);
  assert.ok(Math.abs(
    fiveLaneDifferenceIoc(encryptedA, encryptedB, false, false, order) -
    fiveLaneDifferenceIoc(nativeA, nativeB, false, false, order)
  ) < 1e-12);
}
const fiveLaneSharedPadInvariant = {
  premise: "Five independently unknown lane Caesar offsets on an otherwise repeated five-lane source-length common pad",
  originalSettings: fiveLaneSettings.map((x, i) => ({
    ...x, matchedNativeGPControlsAtOrBelow: nativeLaneScoresBySetting[i].filter(
      y => y <= x.originalIoc).length
  })),
  observedMaximum: bestOriginalLaneIoc,
  controlSourcePairWindows: nativeFiveLaneMaxima.length,
  controlMaxMinimum: Math.min(...nativeFiveLaneMaxima),
  controlMaxMean: nativeFiveLaneMaxima.reduce(
    (sum, x) => sum + x, 0) / nativeFiveLaneMaxima.length,
  sourceControlMaximaAtOrBelowObserved: sourceLaneMaxControlsAtOrBelow,
  matchedFiniteLowerTail: (sourceLaneMaxControlsAtOrBelow + 1) /
    (nativeFiveLaneMaxima.length + 1),
  positiveEncryptedLanePlants: 2
};

/**
 * Authentic geometry extension:
 * - p7 horizontal reflection applies to each original printed line in
 *   physical pp3-7, rather than reversing the 1145-rune chapter wholesale.
 * - p23 180-degree reflection may operate separately on each physical page
 *   pp23-26, rather than reversing the 1005-rune chapter wholesale.
 * The source-visible 3 x 3 x 2 family includes those two distinct mappings,
 * plus the prior identity and global reversals.
 */
/** @param {number} count @returns {number[]} */
function identityPositions(count) {
  return Array.from({ length: count }, (_, i) => i);
}
const aFullMirrorIds = [];
let aOffset = 0;
for (const p of [3, 4, 5, 6, 7]) {
  for (const line of pageLines(p)) {
    for (let j = line.length - 1; j >= 0; j--) aFullMirrorIds.push(aOffset + j);
    aOffset += line.length;
  }
}
assert.equal(aOffset, 1145);
const bPageLengths = [
  corpus.pages[23].indices.length - 16,
  corpus.pages[24].indices.length,
  corpus.pages[25].indices.length,
  corpus.pages[26].indices.length
];
assert.deepEqual(bPageLengths, [197, 270, 273, 265]);
const bEachPageReverseIds = [];
let bOffset = 0;
for (const length of bPageLengths) {
  for (let j = length - 1; j >= 0; j--) bEachPageReverseIds.push(bOffset + j);
  bOffset += length;
}
assert.equal(bOffset, 1005);
const originalAOrientations = {
  natural: identityPositions(1145),
  chapterReverse: identityPositions(1145).reverse(),
  horizontalPrintedLineMirror: aFullMirrorIds
};
const originalBOrientations = {
  natural: identityPositions(1005),
  chapterReverse: identityPositions(1005).reverse(),
  rotateEachPage180: bEachPageReverseIds
};
/**
 * @param {number[]} a A complete 1145-rune source window
 * @param {number[]} b A complete 1005-rune source window
 * @param {number[]} ai
 * @param {number[]} bi
 * @param {"rows"|"interleave"} order
 * @returns {number}
 */
function geometricallyAlignedLaneIoc(a, b, ai, bi, order) {
  const d = Array.from({ length: 1005 }, (_, i) => (a[ai[i]] - b[bi[i]] + 29) % 29);
  return unpack(d, 201, order).reduce((sum, lane) => sum + ioc(lane), 0) / 5;
}
const physicalGeometrySettings = [];
for (const [aOrientation, ai] of Object.entries(originalAOrientations)) {
  for (const [bOrientation, bi] of Object.entries(originalBOrientations)) {
    for (const order of ["rows", "interleave"]) {
      physicalGeometrySettings.push({ aOrientation, bOrientation, order,
        originalIoc: geometricallyAlignedLaneIoc(sourceA, sourceB, ai, bi, order) });
    }
  }
}
let geomSeed = 1337;
/** @returns {number} */
function geomRand() {
  geomSeed = (Math.imul(geomSeed, 1664525) + 1013904223) >>> 0;
  return geomSeed / 4294967296;
}
const geometricControlMaxima = [];
for (let trial = 0; trial < 500; trial++) {
  const aStart = Math.floor(geomRand() * (gpShakespeare.length - 1145));
  const bStart = Math.floor(geomRand() * (gpGibran.length - 1005));
  const aa = gpShakespeare.slice(aStart, aStart + 1145);
  const bb = gpGibran.slice(bStart, bStart + 1005);
  let maximum = -Infinity;
  for (const setting of physicalGeometrySettings) {
    const score = geometricallyAlignedLaneIoc(aa, bb,
      originalAOrientations[setting.aOrientation],
      originalBOrientations[setting.bOrientation], setting.order);
    if (score > maximum) maximum = score;
  }
  geometricControlMaxima.push(maximum);
}
const highestGeometryOriginal = Math.max(...physicalGeometrySettings.map(x => x.originalIoc));
const controlsAtOrBelowGeometry = geometricControlMaxima.filter(
  x => x <= highestGeometryOriginal).length;
assert.equal(controlsAtOrBelowGeometry, 0);
assert.equal(physicalGeometrySettings.length, 18);
const geometryAwareSharedPadInvariant = {
  physicalLineLengths: [3, 4, 5, 6, 7].map(p => pageLines(p).map(line => line.length)),
  physicalPageBLengths: bPageLengths,
  options: physicalGeometrySettings,
  actualOriginalHighestIoC: highestGeometryOriginal,
  sourceNative1005RuneControlPairs: geometricControlMaxima.length,
  sourceNativeControlMin: Math.min(...geometricControlMaxima),
  sourceNativeControlMean: geometricControlMaxima.reduce(
    (sum, x) => sum + x, 0) / geometricControlMaxima.length,
  sourceNativeControlsAtOrBelowActual: controlsAtOrBelowGeometry,
  finiteLowerTail: (controlsAtOrBelowGeometry + 1) /
    (geometricControlMaxima.length + 1),
  conclusion: "No original 18-way physical mirror interpretation yields the expected native GP-English five-lane common-pad difference."
};

console.log(JSON.stringify({
  hypothesis: "Five black dots select five lanes; p56 solved text/shifts may key the other two stencil-linked sections",
  originalEvidence: {
    p3to7Runes: target3.length, p23to26PostHeadingRunes: target23.length,
    p56SolvedRunes: p56Plain.length, p56AfterHeadingRunes: p56Plain.slice(5).length,
    p56PrimeClockEvents: phase
  },
  sourceImageP56DotOrdersAgainstSolvedControl: p56DotControls,
  sharedPadComparison,
  fiveLaneSharedPadInvariant,
  geometryAwareSharedPadInvariant,
  candidates: results.length,
  positiveControl: "Every keyed synthetic solved-p57-native-GP plant recovers exactly.",
  decision: "No deciphered unknown text or source-authenticated lane-key instruction.",
  results
}, null, 2));
