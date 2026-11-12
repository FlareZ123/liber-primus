"use strict";

/**
 * Original-input terminal-256 row/column separability gate.
 *
 * SFT: node sims/lp2_terminal256_inner_rowcol_rank_sft.cjs
 *
 * Source: original 32x8 LP2 pp49-51 table, original p55-57 runes,
 * accepted prime-totient p56 plaintext, and literal clear p57.
 *
 * HYPOTHESIS: after the 76-symbol outer ring (p55) has been peeled,
 * the known 180-symbol inner area is read as three concentric rings.
 * The table bytes reduced modulo29 are transformed to GP29 by an
 * unknown scalar a and a rank <=5 row/column-separable field mask:
 *
 *    P[row,col] = a * byte[row,col] + D[row,col] (mod29).
 *
 * A sum of five outer products has rank <=5. An additive row+column
 * mask or one multiplicative row*column mask is included. Each of
 * the three known inner rings may independently start at any corner
 * and traverse clockwise or anticlockwise (8^3=512 orders).
 *
 * An all-six-column rank on the original 30x6 residual excludes every
 * such mask, independent of keys. This is a bounded family exclusion,
 * NOT a recovered cipher, and it does not test arbitrary nonlinear
 * cellwise maps, evolving state or hidden intermediates.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}
const db = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const Q = 29;
/** @param {number} x */
const mod = x => ((x % Q) + Q) % Q;

/** @param {number} count */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let j = 2; j * j <= n; j++) {
      if (n % j === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}
const p55 = db.pages[55].indices;
const p56 = db.pages[56].indices;
const p57 = db.pages[57].indices;
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
const primeValues = primes(100);
let pIndex = 0;
const plain56 = p56.map((c, i) =>
  i === 56 ? 0 : mod(c - (primeValues[pIndex++] - 1)));
assert.equal(pIndex, 84);
const plain = plain56.concat(p57);
assert.equal(plain.length, 180);

/** @param {string} str */
function gpEncode(str) {
  const tokens = db.translit.map((s, index) => ({ s, index }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of str.split(" ")) {
    for (let at = 0; at < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, at));
      assert.ok(token, "Unrecognized native-GP token");
      out.push(token.index);
      at += token.s.length;
    }
  }
  return out;
}
assert.deepEqual(plain56, gpEncode(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"));

// Ring orders in the printed 32 x 8 table.
const rings = [];
for (let d = 0; d < 4; d++) {
  const ring = [];
  for (let x = d; x <= 7 - d; x++) ring.push(8 * d + x);
  for (let y = d + 1; y <= 31 - d; y++) ring.push(8 * y + 7 - d);
  for (let x = 6 - d; x >= d; x--) ring.push(8 * (31 - d) + x);
  for (let y = 30 - d; y > d; y--) ring.push(8 * y + d);
  rings.push(ring);
}
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
const corners = [[0, 0], [0, 7], [31, 7], [31, 0]];
const options = [[], [], [], []];
for (let d = 1; d <= 3; d++) {
  const ring = rings[d];
  for (let corner = 0; corner < 4; corner++) {
    for (const dir of [-1, 1]) {
      const [y0, x0] = corners[corner];
      const y = Math.max(d, Math.min(31 - d, y0));
      const x = Math.max(d, Math.min(7 - d, x0));
      const start = ring.indexOf(8 * y + x);
      assert.ok(start >= 0);
      options[d].push(ring.map((_, i) =>
        ring[(start + dir * i + ring.length * 2) % ring.length]));
    }
  }
}
const interior = [];
for (let y = 1; y <= 30; y++) {
  for (let x = 1; x <= 6; x++) interior.push(8 * y + x);
}
assert.equal(interior.length, 180);
const inverse = Array.from({length:Q}, (_, a) => {
  if (a === 0) return 0;
  for (let b = 1; b < Q; b++) if (a * b % Q === 1) return b;
  throw new Error("Unexpected nonunit modulo prime");
});

/** @param {number[][]} source */
function fieldRank(source) {
  const matrix = source.map(row => row.slice());
  let rank = 0;
  for (let col = 0; col < 6; col++) {
    let pivot = rank;
    while (pivot < 30 && matrix[pivot][col] === 0) pivot++;
    if (pivot === 30) continue;
    [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
    const scale = inverse[matrix[rank][col]];
    for (let x = col; x < 6; x++) {
      matrix[rank][x] = mod(matrix[rank][x] * scale);
    }
    for (let y = rank + 1; y < 30; y++) {
      const factor = matrix[y][col];
      if (factor === 0) continue;
      for (let x = col; x < 6; x++) {
        matrix[y][x] = mod(matrix[y][x] - factor * matrix[rank][x]);
      }
    }
    rank++;
  }
  return rank;
}

/**
 * Every 2x2 alternating minor of a row+column additive table must vanish.
 * A row-pair is checked by equality of its six columnwise differences.
 * @param {number[][]} matrix
 */
function additiveMinorMatches(matrix) {
  let matches = 0;
  for (let y = 0; y < 30; y++) {
    for (let z = y + 1; z < 30; z++) {
      const counts = new Uint8Array(29);
      for (let col = 0; col < 6; col++) {
        counts[mod(matrix[y][col] - matrix[z][col])]++;
      }
      for (const count of counts) matches += count * (count - 1) / 2;
    }
  }
  return matches;
}
const ALL_MINORS = 6525; // 30 choose 2 times 6 choose 2

// Native positive controls: a known additive and multiplicative mask,
// and a rank-two sum of two outer products.
const aPlant = 17;
const addPlant = Array.from({length:30}, (_, y) =>
  Array.from({length:6}, (_, x) => mod(y * 7 + x * 5 + 4)));
assert.equal(additiveMinorMatches(addPlant), ALL_MINORS);
assert.equal(fieldRank(addPlant), 2);
const mulPlant = Array.from({length:30}, (_, y) =>
  Array.from({length:6}, (_, x) => mod((y + 1) * (x + 1))));
assert.equal(fieldRank(mulPlant), 1);
const mixedPlant = Array.from({length:30}, (_, y) =>
  Array.from({length:6}, (_, x) =>
    mod((y + 1) * (x + 1) + (y + 3) * (x * x + 1))));
assert.equal(fieldRank(mixedPlant), 2);
const plantedKnown = Array.from({length:30}, (_, y) =>
  Array.from({length:6}, (_, x) =>
    mod(aPlant * bytes[8*(y+1)+x+1] + addPlant[y][x])));
const recoveredResidual = plantedKnown.map((row, y) =>
  row.map((p, x) => mod(p - aPlant * bytes[8*(y+1)+x+1])));
assert.deepEqual(recoveredResidual, addPlant);

// Original: allow independent ordering and winding for every known ring.
const targetAt = new Int16Array(256);
let tested = 0, minRank = 6, maxRank = 0;
let rankDeficient = 0, perfectAdditive = 0;
const best = {minorMatches:-1, phase:null, multiplier:null};
for (let a1 = 0; a1 < 8; a1++) {
  for (let a2 = 0; a2 < 8; a2++) {
    for (let a3 = 0; a3 < 8; a3++) {
      const route = options[1][a1].concat(options[2][a2], options[3][a3]);
      assert.equal(new Set(route).size, 180);
      route.forEach((pos, i) => { targetAt[pos] = plain[i]; });
      for (let scalar = 0; scalar < Q; scalar++) {
        const residual = Array.from({length:30}, (_, y) =>
          Array.from({length:6}, (_, x) => {
            const pos = 8 * (y + 1) + x + 1;
            return mod(targetAt[pos] - scalar * bytes[pos]);
          }));
        const rank = fieldRank(residual);
        minRank = Math.min(minRank, rank);
        maxRank = Math.max(maxRank, rank);
        if (rank < 6) rankDeficient++;
        const matches = additiveMinorMatches(residual);
        if (matches === ALL_MINORS) perfectAdditive++;
        if (matches > best.minorMatches) {
          best.minorMatches = matches;
          best.phase = [a1, a2, a3];
          best.multiplier = scalar;
        }
        tested++;
      }
    }
  }
}
assert.equal(tested, 512 * 29);
assert.deepEqual([minRank,maxRank,rankDeficient,perfectAdditive],
  [6,6,0,0]);
assert.deepEqual(best, {
  minorMatches:282, phase:[5,0,2], multiplier:7
});
const result = {
  grid_sha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  knownPlain:180, unknownOuter:76,
  ringLengths:[76,68,60,52], independentInnerRoutes:512,
  scalarChoices:29, tested, minRank, maxRank, rankDeficient,
  perfectAdditive, additiveMinorCount:ALL_MINORS, best,
  additivePlantPassed:true, multiplicativePlantPassed:true,
  rankTwoPlantPassed:true
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
