"use strict";

/**
 * Original LP2 pp8–14: five-dot / literal-7, 5-bit GP29 -> 7-bit ASCII gate.
 *
 * Stronger than testing a guessed GP29 symbol-to-bit map: prove how many
 * ASCII control characters even the optimally chosen *secret* injective
 * 29-of-32 five-bit codebook must produce on the original ciphertext.
 *
 * SFT: node sims/lp2_p7_fivedot_sevenbit_allsecret_ascii_sft.cjs
 * Node 22, Windows compatible, only built-in libraries, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = read("resources/liber-primus/lp2-transcription.txt").split(/\r?\n%\r?\n/);
const ordinal = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(gp.runes.length, 29);
assert.equal(pages.length, 57);
const hash = crypto.createHash("sha256").update(fs.readFileSync(
  path.join(root, "resources/liber-primus/24.jpg"))).digest("hex");
assert.equal(hash, "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c");

// Exact printed mixed-unit chapter. The numeral is not silently a GP rune.
const mixed = [];
for (let page = 8; page <= 14; page++) {
  const indices = [];
  for (const ch of pages[page]) {
    if (!ordinal.has(ch) && ch !== "7") continue;
    mixed.push(ch);
    if (ordinal.has(ch)) indices.push(ordinal.get(ch));
  }
  assert.deepEqual(indices, gp.pages[page].indices);
}
assert.equal(mixed.length, 1730);
assert.equal(mixed.indexOf("7"), 692);
assert.equal(mixed.lastIndexOf("7"), 692);

// Original-image left-to-right circle ranks, from measured top-to-bottom y.
const dotY = [3105.73973, 3166.68765, 2866.70402, 3127.5, 2936.20488];
const dotOrder = [0, 1, 2, 3, 4].sort((a, b) => dotY[a] - dotY[b]);
assert.deepEqual(dotOrder, [2, 4, 0, 3, 1]);
const rearranged = [];
for (let row = 0; row < 346; row++)
  for (const col of dotOrder) rearranged.push(mixed[346 * col + row]);
assert.equal(rearranged[0], "7");
const dot5 = rearranged.slice(1).map(r => ordinal.get(r));

/** @param {number[]} a @param {number[]} order @returns {number[]} */
function sevenTuple(a, order) {
  assert.equal(a.length % 7, 0);
  const out = [];
  for (let i = 0; i < a.length; i += 7)
    for (const j of order) out.push(a[i + j]);
  return out;
}

/** @param {number[]} a @param {boolean} down @returns {number[]} */
function sevenColumns(a, down) {
  const height = a.length / 7;
  assert(Number.isInteger(height));
  const out = [];
  if (down)
    for (let c = 0; c < 7; c++)
      for (let r = 0; r < height; r++) out.push(a[7 * r + c]);
  else
    for (let r = 0; r < height; r++)
      for (let c = 0; c < 7; c++) out.push(a[height * c + r]);
  return out;
}
const streams = [
  ["original", mixed.filter(x => x !== "7").map(r => ordinal.get(r))],
  ["dot5", dot5],
  ["tuple7", sevenTuple(dot5, [0, 6, 2, 5, 1, 4, 3])],
  ["inverse7", sevenTuple(dot5, [0, 4, 2, 6, 5, 3, 1])],
  ["sevenDown", sevenColumns(dot5, true)],
  ["sevenAcross", sevenColumns(dot5, false)]
];
const sourceHistogram = Array(29).fill(0);
for (const v of streams[0][1]) sourceHistogram[v]++;
for (const [name, a] of streams) {
  assert.equal(a.length, 1729, name);
  const histogram = Array(29).fill(0);
  for (const v of a) histogram[v]++;
  assert.deepEqual(histogram, sourceHistogram, name);
}
// Exactly seven source symbols of five bits -> five ASCII characters of seven bits.
assert.equal(1729 * 5, 1235 * 7);

/** @param {number} v @returns {number} */
function reverse5(v) {
  assert(Number.isInteger(v) && v >= 0 && v < 32);
  let reversed = 0;
  for (let bit = 0; bit < 5; bit++) reversed = reversed * 2 + ((v >> bit) & 1);
  return reversed;
}

/**
 * Exact fixed-width, MSB-first big-endian bitstream regrouping.
 * @param {number[]} codes
 * @param {number} from
 * @param {number} to
 * @returns {number[]}
 */
function regroup(codes, from, to) {
  assert(Number.isInteger(codes.length * from / to));
  const out = [];
  let held = 0;
  let bits = 0;
  for (const v of codes) {
    assert(Number.isInteger(v) && v >= 0 && v < (1 << from));
    held = (held << from) | v;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((held >> bits) & ((1 << to) - 1));
      held &= (1 << bits) - 1;
    }
  }
  assert.equal(bits, 0);
  assert.equal(out.length * to, codes.length * from);
  return out;
}

/** @param {number} value @returns {number[]} */
function fiveBits(value) {
  return Array.from({length: 5}, (_, i) => (value >> (4 - i)) & 1);
}
const noAdjacentZero = [];
for (let code = 0; code < 32; code++) {
  const bits = fiveBits(code);
  if (!bits.some((bit, j) => j < 4 && bit === 0 && bits[j + 1] === 0))
    noAdjacentZero.push(code);
}
assert.equal(noAdjacentZero.length, 13);

/**
 * Exact rectangular Hungarian minimum-weight injective assignment n <= m.
 * One output codeword for each rune class, and no two rune classes share it.
 * Proof-bound objective: count ASCII septets whose two most significant
 * bits are both zero and lie inside the same five-bit rune codeword.
 * Cross-rune zero pairs are ignored, so this is a conservative lower bound.
 *
 * @param {number[][]} costs
 * @returns {{total:number,assignment:number[]}}
 */
function minInjectiveAssignment(costs) {
  const n = costs.length;
  const m = costs[0].length;
  assert(n > 0 && n <= m);
  assert(costs.every(row => row.length === m &&
    row.every(x => Number.isInteger(x) && x >= 0)));
  const rowPotential = Array(n + 1).fill(0);
  const colPotential = Array(m + 1).fill(0);
  const assignedRow = Array(m + 1).fill(0);
  const predecessor = Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    assignedRow[0] = i;
    let col0 = 0;
    const minReduced = Array(m + 1).fill(Infinity);
    const used = Array(m + 1).fill(false);
    do {
      used[col0] = true;
      const currentRow = assignedRow[col0];
      let delta = Infinity;
      let nextCol = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const reduced = costs[currentRow - 1][j - 1]
          - rowPotential[currentRow] - colPotential[j];
        if (reduced < minReduced[j]) {
          minReduced[j] = reduced;
          predecessor[j] = col0;
        }
        if (minReduced[j] < delta) {
          delta = minReduced[j];
          nextCol = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          rowPotential[assignedRow[j]] += delta;
          colPotential[j] -= delta;
        } else {
          minReduced[j] -= delta;
        }
      }
      col0 = nextCol;
    } while (assignedRow[col0] !== 0);
    do {
      const prev = predecessor[col0];
      assignedRow[col0] = assignedRow[prev];
      col0 = prev;
    } while (col0 !== 0);
  }
  const assignment = Array(n).fill(-1);
  for (let col = 1; col <= m; col++)
    if (assignedRow[col] !== 0) assignment[assignedRow[col] - 1] = col - 1;
  assert(assignment.every(x => x >= 0));
  assert.equal(new Set(assignment).size, n);
  return {
    total: assignment.reduce((total, col, row) => total + costs[row][col], 0),
    assignment
  };
}
// Exact small independent exhaustive certificate for the optimizer.
const small = [[9,4,6,7,2], [3,8,7,5,9], [6,2,4,8,1]];
const brute = [];
for (let a = 0; a < 5; a++)
  for (let b = 0; b < 5; b++)
    for (let c = 0; c < 5; c++)
      if (a !== b && a !== c && b !== c)
        brute.push(small[0][a] + small[1][b] + small[2][c]);
assert.equal(minInjectiveAssignment(small).total, Math.min(...brute));

/**
 * Exact lower bound with a *different completely secret injective 29→32
 * bit-codebook at each periodic rune position*. The cost omits every
 * cross-codeword septet top-bit pair, hence never overstates forced controls.
 *
 * @param {number[]} stream
 * @param {number} period
 * @returns {number}
 */
function periodicSecretLowerBound(stream, period) {
  const grouped = Array.from({length: period},
    () => Array.from({length: 29}, () => Array(4).fill(0)));
  for (let asciiPosition = 0; asciiPosition < 1235; asciiPosition++) {
    const firstBit = 7 * asciiPosition;
    const runeIndex = Math.floor(firstBit / 5);
    const runeOffset = firstBit % 5;
    if (runeOffset < 4)
      grouped[runeIndex % period][stream[runeIndex]][runeOffset]++;
  }
  let total = 0;
  for (const row of grouped) {
    const costs = row.map(occurrences =>
      Array.from({length: 32}, (_, code) => {
        const bits = fiveBits(code);
        return occurrences.reduce((sum, count, offset) =>
          sum + count * Number(bits[offset] === 0 && bits[offset + 1] === 0), 0);
      }));
    total += minInjectiveAssignment(costs).total;
  }
  return total;
}
const allSecretPeriods = [1, 5, 7, 14, 16, 35];
const expectedPeriodicGuaranteedControls = [
  [102, 29, 86, 67, 0, 12],
  [117, 24, 104, 67, 0, 8],
  [114, 28, 99, 63, 0, 12],
  [115, 22, 100, 67, 0, 7],
  [109, 26, 96, 60, 0, 14],
  [121, 36, 104, 60, 0, 21]
];

const expectedDirectPrintable = [
  [853, 918], [901, 887], [894, 908],
  [896, 890], [900, 901], [895, 899]
];
const expectedGuaranteedControls = [102, 117, 114, 115, 109, 121];
const results = streams.map(([name, stream], index) => {
  const offsets = Array.from({length: 29}, () => Array(5).fill(0));
  for (let character = 0; character < 1235; character++) {
    const bitStart = character * 7;
    offsets[stream[Math.floor(bitStart / 5)]][bitStart % 5]++;
  }
  assert(offsets.every(row => row.slice(0, 4).every(count => count > 0)),
    "Every rune appears at each of four entirely internal ASCII top-bit offsets");
  const minimumInternalOccurrence = Math.min(...offsets.flatMap(row => row.slice(0, 4)));
  const costs = offsets.map(row =>
    Array.from({length: 32}, (_, code) => {
      const bits = fiveBits(code);
      return row.slice(0, 4).reduce((sum, occurrences, offset) =>
        sum + occurrences * Number(bits[offset] === 0 && bits[offset + 1] === 0), 0);
    }));
  const assignment = minInjectiveAssignment(costs);
  assert.equal(assignment.total, expectedGuaranteedControls[index], name);
  const phaseLowerBounds = allSecretPeriods.map(period =>
    periodicSecretLowerBound(stream, period));
  assert.deepEqual(phaseLowerBounds, expectedPeriodicGuaranteedControls[index],
    name + " complete phase-secret ASCII controls");
  assert.equal(phaseLowerBounds[0], assignment.total);
  const direct = [false, true].map(reverseBits => {
    const codes = reverseBits ? stream.map(reverse5) : stream;
    const septets = regroup(codes, 5, 7);
    assert.equal(septets.length, 1235);
    const recovered = regroup(septets, 7, 5);
    assert.deepEqual(recovered, codes, name + " bit-exact reversible direct");
    const readable = septets.filter(v => v >= 32 && v <= 126).length;
    const asciiControl = septets.filter(v => v < 32 || v === 127).length;
    const spaces = septets.filter(v => v === 32).length;
    assert.equal(readable, expectedDirectPrintable[index][Number(reverseBits)]);
    assert.equal(readable + asciiControl, 1235);
    return {reverse5bitOrder:reverseBits, printableAscii:readable,
      asciiControl, spaces, first24Hex:Buffer.from(septets.slice(0, 24)).toString("hex"),
      first80:septets.slice(0, 80).map(v => v >= 32 && v < 127
        ? String.fromCharCode(v) : ".").join("")};
  });
  return {name, minimumInternalOccurrence, minGuaranteedAsciiControls:assignment.total,
    minGuaranteedAsciiControlFraction:assignment.total / 1235,
    periodicSecretGuaranteedControls:Object.fromEntries(allSecretPeriods.map((p, i) =>
      [String(p), phaseLowerBounds[i]])), direct};
});
// Positive real English plant: 1235 printable ASCII glyphs regroup into exactly
// 1729 base32 codewords. This particular plaintext only uses 27 distinct
// five-bit codewords, so it admits an injective secret GP29 codebook.
const positive = "HELLO WORLD ".repeat(104).slice(0, 1235);
assert.equal(positive.length, 1235);
const positiveCodes = regroup([...positive].map(c => c.charCodeAt(0)), 7, 5);
assert.equal(positiveCodes.length, 1729);
const distinctCodes = [...new Set(positiveCodes)].sort((a, b) => a - b);
assert.equal(distinctCodes.length, 27);
const secretRuneToCode = distinctCodes;
const codeToRune = new Map(secretRuneToCode.map((code, i) => [code, i]));
const plantedRuneStream = positiveCodes.map(code => codeToRune.get(code));
assert(plantedRuneStream.every(x => x >= 0 && x < 29));
const recoveredText = String.fromCharCode(
  ...regroup(plantedRuneStream.map(rune => secretRuneToCode[rune]), 5, 7));
assert.equal(recoveredText, positive, "positive original-length printable plaintext plant");
console.log(JSON.stringify({
  original: "LP2 physical pp8-14, 1729 unchanged runes",
  sourceFiveDot:dotOrder, numeral7Before:692, numeral7After:0,
  transport: "1729 x 5bit = 1235 x 7bit ASCII; 7 GP runes -> 5 septets",
  codesWithNoInternalDoubleZero:noAdjacentZero,
  pigeonhole: "All 29 rune symbols appear in all 4 internally constrained septet top-bit offsets; only 13 of 32 codewords avoid adjacent 00. Therefore no injective stationary GP29->5bit alphabet can emit only printable ASCII.",
  exactMinOriginalControls:Math.min(...results.map(x => x.minGuaranteedAsciiControls)),
  exactMinDotOrderControls:results[1].minGuaranteedAsciiControls,
  allSecretPeriods,
  minimumForcedControlByPeriod:Object.fromEntries(allSecretPeriods.map(p =>
    [String(p), Math.min(...results.map(x => x.periodicSecretGuaranteedControls[p]))])),
  page15Period16Limitation:"Period16 has an internal-bit lower bound of zero, so this necessary condition does not exclude that source-adjacent family; complete printable decoding remains unestablished.",
  allSecretBound: "Hungarian assignment minimizes only interior zero-zero septet prefixes; cross-codeword control characters can increase the real count.",
  positivePlant:{length:positive.length,distinctBinaryCodewords:distinctCodes.length,
    recoveredIdentical:recoveredText===positive},
  results, conclusion:"No direct standard printable ASCII7 plaintext via a stationary injective 5bit GP29 codebook on any of six source-fixed orderings."
}, null, 2));
