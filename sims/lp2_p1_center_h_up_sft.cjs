"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const referenceText = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8"
);
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

const MOD = 29;
const UP = [1, 13];
const HISTORICAL_2014_ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

// Existing source-derived p3 field map. This report consumes Q rather than
// re-deriving the polynomial quotient that produced it.
const Q = [17, 24];

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function fieldMul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
  ];
}

/** @param {[number,number]} base @param {number} exponent @returns {[number,number]} */
function fieldPow(base, exponent) {
  let out = [1, 0];
  let x = base;
  let n = exponent;
  while (n > 0) {
    if (n & 1) out = fieldMul(out, x);
    x = fieldMul(x, x);
    n = Math.floor(n / 2);
  }
  return out;
}


/** @param {number} a @param {number} b @returns {[number,number]} */
function H(a, b) {
  return [mod(a - b), mod(a + b)];
}

/** @param {number[]} values @returns {number[]} */
function historicalRowPermutation(values) {
  assert.equal(values.length % 14, 0);
  const out = [];
  for (let r = 0; r < values.length / 14; r++) {
    const row = values.slice(14 * r, 14 * r + 14);
    for (const c of HISTORICAL_2014_ORDER) out.push(row[c]);
  }
  return out;
}

/** @param {number[]} values @returns {number[]} */
function historicalColumnUp(values) {
  assert.equal(values.length % 14, 0);
  const rows = values.length / 14;
  const out = [];
  for (const c of HISTORICAL_2014_ORDER) {
    for (let r = rows - 1; r >= 0; r--) out.push(values[14 * r + c]);
  }
  return out;
}

/**
 * Pair the 180-degree counterparts, start at the center, and emerge outward.
 * The upright/right member is first, so H(right,left)=[difference,sum].
 * @param {number[]} values
 * @returns {number[]}
 */
function centerOutH(values) {
  assert.equal(values.length % 2, 0);
  const out = [];
  for (let i = values.length / 2 - 1; i >= 0; i--) {
    const left = values[i];
    const right = values[values.length - 1 - i];
    out.push(...H(right, left));
  }
  return out;
}

const p1 = corpus.pages.find(p => p.page === 1);
assert(p1);
assert.equal(p1.indices.length, 266);
assert.equal(266, 14 * 19);

const leftCenter = p1.indices[132];
const rightCenter = p1.indices[133];
assert.deepEqual([leftCenter, rightCenter], [6, 7]);
assert.equal(corpus.translit[leftCenter], "G");
assert.equal(corpus.translit[rightCenter], "W");
const centerH = H(rightCenter, leftCenter);
assert.deepEqual(centerH, UP);
assert.equal(model.spell(centerH), "UP");

// Complete control over all nonempty unsolved physical pages with an even rune count.
const evenCenters = corpus.pages
  .filter(p => p.page < 56 && p.indices.length > 0 && p.indices.length % 2 === 0)
  .map(p => {
    const m = p.indices.length / 2;
    const output = H(p.indices[m], p.indices[m - 1]);
    return { page: p.page, n: p.indices.length, output, spell: model.spell(output) };
  });
assert.equal(evenCenters.length, 23);
const upHits = evenCenters.filter(row => row.output[0] === UP[0] && row.output[1] === UP[1]);

assert.deepEqual(upHits.map(row => row.page), [1]);

// The signed 2016 register independently types the Q orbit.
const signed2016 = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8"
);
const signedBody = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = signedBody.match(/\b[A-Za-z]+\b/g)
  .filter(word => !["BEGIN", "PGP", "SIGNED", "MESSAGE", "Hash", "SHA"].includes(word))
  .map(word => word.toUpperCase());
assert.equal(signedWords[18], "MAP");
assert.equal(signedWords[23], "ROAD");
assert.equal(signedWords[29], "DIRECTION");

const qLog = new Map();
let qState = [1, 0];
for (let k = 0; k < 840; k++) {
  qLog.set(qState.join(","), k);
  qState = fieldMul(qState, Q);
}
assert.equal(qLog.size, 840);
assert.equal(qLog.get(centerH.join(",")), 18);
assert.deepEqual([signedWords[centerH[0]], signedWords[centerH[1]]], ["THE", "WAY"]);

const direction29 = fieldPow(Q, 29);
assert.deepEqual(direction29, [2, 5]);
const p1DirectionDestination = fieldMul(centerH, direction29);
assert.deepEqual(p1DirectionDestination, [0, 23]);
assert.deepEqual(
  p1DirectionDestination.map(value => signedWords[value]),
  ["HELLO", "ROAD"]
);

// Full even-center charge: after the same +29 Q-path stride, only p1 reaches
// any coordinate equal to the authenticated ROAD index 23.
const directionRows = evenCenters.map(row => {
  const destination = fieldMul(row.output, direction29);
  return { page: row.page, destination };
});
const roadDestinationPages = directionRows
  .filter(row => row.destination.includes(23))
  .map(row => row.page);
assert.deepEqual(roadDestinationPages, [1]);

// Adversarial orientation control: if center operand order is allowed to float,
// three additional pages can reach ROAD23. The p1 uniqueness claim is therefore
// conditional on the pre-existing upright/right artwork orientation.
const bothOrientationRoadHits = [];
for (const page of corpus.pages.filter(
  p => p.page < 56 && p.indices.length > 0 && p.indices.length % 2 === 0
)) {
  const m = page.indices.length / 2;
  const left = page.indices[m - 1];
  const right = page.indices[m];
  for (const [orientation, a, b] of [
    ["right-left", right, left],
    ["left-right", left, right],
  ]) {
    const destination = fieldMul(H(a, b), direction29);
    if (destination.includes(23)) {
      bothOrientationRoadHits.push({ page: page.page, orientation, destination });
    }
  }
}
assert.deepEqual(bothOrientationRoadHits, [
  { page: 0, orientation: "left-right", destination: [23, 7] },
  { page: 1, orientation: "right-left", destination: [0, 23] },
  { page: 18, orientation: "left-right", destination: [23, 27] },
  { page: 47, orientation: "left-right", destination: [23, 1] },
]);

// Downstream p8 chapter object. Its PRODUCT=2 is the chapter OUT label; under
// the established graph this addresses the unique chapter IN=2 (p27), not
// physical p2. Physical p2 is retained only as a rejected direct-address rival.
const p8 = corpus.pages.find(p => p.page === 8);
assert(p8);
assert.deepEqual(p8.indices.slice(12, 15), [27, 9, 16]);
const p8FirstBlack = p8.indices.slice(12, 15);
assert.equal(p8FirstBlack.reduce((sum, value) => mod(sum + value), 0), 23);
assert.equal(p8FirstBlack.reduce((product, value) => mod(product * value), 1), 2);

// Rejected direct-address rival: if OUT2 were incorrectly read as physical p2,
 // that page has a single center N. This is recorded to prevent revival; it is
 // not the chapter graph consumer.
const p2 = corpus.pages.find(p => p.page === 2);
assert(p2);
assert.equal(p2.indices.length, 201);
assert.equal(p2.indices[Math.floor(p2.indices.length / 2)], 9);
assert.equal(corpus.translit[9], "N");


const divisibleBy14 = corpus.pages
  .filter(p => p.page < 56 && p.indices.length > 0 && p.indices.length % 14 === 0)
  .map(p => [p.page, p.indices.length, p.indices.length / 14]);
assert.deepEqual(divisibleBy14, [[1, 266, 19], [6, 196, 14], [36, 238, 17]]);

const rowPermuted = historicalRowPermutation(p1.indices);
const columnUp = historicalColumnUp(p1.indices);
const emerged = centerOutH(p1.indices);
assert.deepEqual(emerged.slice(0, 2), UP);
assert.equal(model.spell(emerged.slice(0, 2)), "UP");

// A genuine local UP result does not make the obvious whole-page consumers prose.
const scores = {
  training: model.trainingScore,
  solvedP57: model.p57Score,
  p1Printed: model.scoreStream(p1.indices).mean,
  historical2014RowPermutation: model.scoreStream(rowPermuted).mean,
  historical2014ColumnUp: model.scoreStream(columnUp).mean,
  centerOutH: model.scoreStream(emerged).mean
};
const expected = {
  training: -2.260728012730832,
  solvedP57: -2.468144714244746,
  p1Printed: -3.440978878397509,
  historical2014RowPermutation: -3.416230853368736,
  historical2014ColumnUp: -3.422646357226988,
  centerOutH: -3.42560360331045
};
for (const [name, value] of Object.entries(expected)) {
  assert(Math.abs(scores[name] - value) < 1e-12, name);
}

console.log(JSON.stringify({
  p1: {
    runes: p1.indices.length,
    factorization: "14x19",
    centerIndices: [132, 133],
    centerValuesLeftRight: [leftCenter, rightCenter],
    directedHRightLeft: centerH,
    directedHSpell: model.spell(centerH),
    qExponent: qLog.get(centerH.join(",")),
    qExponentWord: signedWords[qLog.get(centerH.join(","))],
    coordinateWords: centerH.map(value => signedWords[value]),
    direction29Destination: p1DirectionDestination,
    direction29DestinationWords: p1DirectionDestination.map(value => signedWords[value])
  },
  evenCenterCount: evenCenters.length,
  exactUpCenterPages: upHits.map(row => row.page),
  roadDestinationPages,
  bothOrientationRoadHits,
  downstream: {
    p8FirstBlack,
    p8FirstBlackSum: 23,
    p8FirstBlackProduct: 2,
    p2RuneCount: p2.indices.length,
    p2CenterValue: p2.indices[Math.floor(p2.indices.length / 2)],
    p2CenterSpell: corpus.translit[9]
  },
  divisibleBy14,
  historical2014Order: HISTORICAL_2014_ORDER,
  scores
}, null, 2));
