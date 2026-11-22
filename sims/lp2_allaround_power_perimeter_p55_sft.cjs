"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @returns {number} */
function modPow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @returns {number[]} */
function outerRing() {
  const ring = [];
  for (let column = 0; column < 8; column += 1) ring.push(column);
  for (let row = 1; row < 32; row += 1) ring.push(row * 8 + 7);
  for (let column = 6; column >= 0; column -= 1) ring.push(31 * 8 + column);
  for (let row = 30; row >= 1; row -= 1) ring.push(row * 8);
  return ring;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {"minus"|"plus"|"beaufort"} mode
 * @param {number} fMask
 * @returns {number[]}
 */
function decode(cipher, key, mode, fMask) {
  let keyIndex = 0;
  let fOrdinal = 0;
  return cipher.map((value) => {
    if (value === 0) {
      const bypass = (fMask & (1 << fOrdinal)) !== 0;
      fOrdinal += 1;
      if (bypass) return 0;
    }
    const k = key[keyIndex];
    keyIndex += 1;
    if (mode === "minus") return mod29(value - k);
    if (mode === "plus") return mod29(value + k);
    return mod29(k - value);
  });
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {"minus"|"plus"|"beaufort"} mode
 * @returns {number[]}
 */
function encodeNoBypass(plain, key, mode) {
  return plain.map((value, index) => {
    const k = key[index];
    if (mode === "minus") return mod29(value + k);
    if (mode === "plus") return mod29(value - k);
    return mod29(k - value);
  });
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const alphabet = grid.alphabet;
const tableValues = tokens.map((token) => {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 60 * high + low;
});

const ring = outerRing();
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
const startCell = 252;
const startPosition = ring.indexOf(startCell);
assert.ok(startPosition >= 0);
assert.equal(tokens[startCell], "30");
assert.equal(tableValues[startCell], 180);

const p55 = corpus.pages.find((page) => page.page === 55);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p55 && p57);
assert.equal(p55.indices.length, 76);
assert.ok(p57.indices.length >= 76);
assert.deepEqual(
  p55.indices.map((value, index) => value === 0 ? index : -1).filter((index) => index >= 0),
  [15, 25, 41]
);

// Native positive for the already established p28 power operation.
const p28Input = [9, 28, 24, 10, 1, 20];
const p28Output = [
  modPow29(p28Input[0], 3),
  ...p28Input.slice(1).map((value) => modPow29(value, 27)),
];
assert.deepEqual(p28Output, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(p28Output), "READOUT");

const routeRows = [];
for (const direction of [1, -1]) {
  const cells = Array.from({length: 76}, (_, index) =>
    ring[(startPosition + direction * index + ring.length * 10) % ring.length]
  );
  assert.equal(cells[0], startCell);
  assert.equal(new Set(cells).size, 76);
  const residues = cells.map((cell) => tableValues[cell] % 29);

  for (const order of ["source", "reversed"]) {
    const firstExponent = order === "source" ? 3 : 27;
    const tailExponent = order === "source" ? 27 : 3;
    const key = residues.map((value, index) =>
      modPow29(value, index === 0 ? firstExponent : tailExponent)
    );
    const directReadout = translit(key);
    const visibleP55Matches = key.filter((value, index) =>
      value === p55.indices[index]
    ).length;

    // Synthetic round-trip uses authentic p57 plaintext values as a fixed native-GP plant.
    for (const mode of ["minus", "plus", "beaufort"]) {
      const plantedPlain = p57.indices.slice(0, 76);
      const plantedCipher = encodeNoBypass(plantedPlain, key, mode);
      assert.deepEqual(decode(plantedCipher, key, mode, 0), plantedPlain);
    }

    for (const mode of ["minus", "plus", "beaufort"]) {
      for (let fMask = 0; fMask < 8; fMask += 1) {
        const plain = decode(p55.indices, key, mode, fMask);
        routeRows.push({
          direction: direction === 1 ? "clockwise" : "counterclockwise",
          order,
          directReadout,
          visibleP55Matches,
          mode,
          fMask,
          ioc: ioc(plain),
          plaintext: translit(plain),
          values: plain,
        });
      }
    }
  }
}

assert.equal(routeRows.length, 96);

const ourOwn = [3, 1, 4, 3, 7, 9];
for (const row of routeRows) {
  row.footerMatches = row.values.slice(-6)
    .filter((value, index) => value === ourOwn[index]).length;
  row.exactFooter = row.footerMatches === 6;
}

const primary = routeRows.filter((row) => row.order === "source");
const controls = routeRows.filter((row) => row.order === "reversed");
assert.equal(primary.length, 48);
assert.equal(controls.length, 48);

const primaryExact = primary.filter((row) => row.exactFooter);
const controlExact = controls.filter((row) => row.exactFooter);
const bestPrimaryFooter = Math.max(...primary.map((row) => row.footerMatches));
const bestControlFooter = Math.max(...controls.map((row) => row.footerMatches));
assert.equal(bestPrimaryFooter, 2);
assert.equal(primaryExact.length, 0);

const directPrimary = [...new Map(primary.map((row) => [
  row.direction,
  {
    direction: row.direction,
    visibleP55Matches: row.visibleP55Matches,
    readout: row.directReadout,
  },
])).values()];
assert.deepEqual(directPrimary.map((row) => [row.direction, row.visibleP55Matches]), [
  ["clockwise", 1],
  ["counterclockwise", 4],
]);

const topPrimary = [...primary]
  .sort((a, b) => b.ioc - a.ioc || b.footerMatches - a.footerMatches)
  .slice(0, 12)
  .map(({direction, mode, fMask, ioc: score, footerMatches, plaintext}) => ({
    direction,
    mode,
    fMask,
    ioc: score,
    footerMatches,
    plaintext,
  }));

console.log(JSON.stringify({
  status: "PASS",
  hypothesis: "ALL-AROUND-selected p50 circumference, start cell252; mirror the authenticated p28 power geometry by applying exponent3 to the selected first cell and exponent27 to the remaining 75 cells, then use the resulting GP29 stream as a direct p55 additive key.",
  sourceFacts: {
    startCell,
    token: tokens[startCell],
    base60Value: tableValues[startCell],
    circumferenceCells: ring.length,
    p55Runes: p55.indices.length,
    p28PositivePlaintext: translit(p28Output),
  },
  chargedFamily: {
    primaryVariants: primary.length,
    reversedOrderControls: controls.length,
    directions: ["clockwise", "counterclockwise"],
    registers: ["cipher-key", "cipher+key", "key-cipher"],
    literalFBypassMasks: 8,
  },
  directSourceOrderReadout: directPrimary,
  conditionalOurOwnGate: {
    bestPrimaryFooterMatches: bestPrimaryFooter,
    exactPrimaryHits: primaryExact.map((row) => ({
      direction: row.direction,
      mode: row.mode,
      fMask: row.fMask,
      plaintext: row.plaintext,
    })),
    bestReversedControlFooterMatches: bestControlFooter,
    exactReversedControlHits: controlExact.length,
  },
  topPrimaryByIoC: topPrimary,
  decision: primaryExact.length === 0
    ? "Negative under the exact source-order power-perimeter direct-pad family: no primary variant recovers the conditional OUR OWN footer. The [3,27] value-changing operation therefore does not rescue the already source-selected circumference as a simple direct additive p55 key."
    : "A primary variant recovers the full conditional OUR OWN footer and requires immediate independent whole-page adjudication.",
}, null, 2));
