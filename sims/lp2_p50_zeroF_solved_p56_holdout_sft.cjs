"use strict";

/**
 * Held-out solved-p56 test for the fixed p50 zero->F moving-exception surface
 * transform. The transform was selected on p0-55 before this solved-page test.
 *
 * Test the frozen global continuous predecessor-cell clock on p56, then scan
 * the complete authenticated solved-p56 decoder family used by the repository:
 * phi or prime key, both signs, starts 0..28, and every legal displayed-F
 * literal/nonconsuming branch.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const tokens = grid.pages.flatMap(page => page.tokens);
const bytes = grid.bytes;

const pages = corpus.pages.filter(page => page.page <= 56 && page.indices.length);
const source = pages.flatMap(page => page.indices);
const p56 = corpus.pages.find(page => page.page === 56).indices;
const p56Start = source.length - p56.length;
assert.equal(p56Start, 12956);
assert.equal(p56.length, 85);

const special = [0, 2, 12, 21, 22, 25, 27, 28];

/** @param {number} value @param {number} left @param {number} right @returns {number} */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {number} control @returns {number} */
function marker(control) {
  return tokens[control][0] === "0" ? 0 : special[bytes[control] & 7];
}

/** @param {number[]} plain @returns {number[]} */
function surfaceEncrypt(plain) {
  const out = new Array(plain.length);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    out[i] = swap(plain[i], out[i - 1], marker((i - 1) & 255));
  }
  return out;
}

/** @param {number[]} cipher @returns {number[]} */
function surfaceDecrypt(cipher) {
  const out = new Array(cipher.length);
  out[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    out[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return out;
}

const expectedWords =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE " +
  "DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const sorted = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const expected = [];
for (const word of expectedWords.split(" ")) {
  for (let i = 0; i < word.length;) {
    const match = sorted.find(entry => word.startsWith(entry.token, i));
    assert.ok(match);
    expected.push(match.index);
    i += match.token.length;
  }
}
assert.equal(expected.length, 85);

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}
const primes = firstPrimes(200);

/**
 * @param {number[]} cipher
 * @returns {{
 *   fPositions:number[],full:Array,best:Object
 * }}
 */
function scanHistoricalFamily(cipher) {
  const fPositions = cipher.map((value, index) => value === 0 ? index : -1)
    .filter(index => index >= 0);
  let best = { matches: -1 };
  const full = [];

  for (const keyMode of ["phi", "prime"]) {
    for (const sign of [-1, 1]) {
      for (let start = 0; start < 29; start++) {
        for (let mask = 0; mask < (1 << fPositions.length); mask++) {
          let pointer = start;
          let matches = 0;
          const mismatch = [];

          for (let position = 0; position < cipher.length; position++) {
            const fIndex = fPositions.indexOf(position);
            let value;
            if (fIndex !== -1 && (mask & (1 << fIndex))) {
              value = 0;
            } else {
              const prime = primes[pointer++];
              const shift = keyMode === "phi" ? prime - 1 : prime;
              value = ((cipher[position] + sign * shift) % 29 + 29) % 29;
            }
            if (value === expected[position]) matches++;
            else mismatch.push(position);
          }

          if (matches > best.matches) {
            best = { keyMode, sign, start, mask, matches, mismatch };
          }
          if (matches === cipher.length) {
            full.push({ keyMode, sign, start, mask });
          }
        }
      }
    }
  }
  return { fPositions, full, best };
}

const sourceScan = scanHistoricalFamily(p56);
assert.deepEqual(sourceScan.fPositions, [35, 47, 51, 56, 74]);
assert.deepEqual(sourceScan.full, [
  { keyMode: "phi", sign: -1, start: 0, mask: 8 }
]);
assert.equal(sourceScan.best.matches, 85);

const transformedAll = surfaceDecrypt(source);
assert.deepEqual(surfaceEncrypt(transformedAll), source);
const transformed56 = transformedAll.slice(p56Start);
const changed = transformed56.map(
  (value, index) => value !== p56[index] ? index : -1)
  .filter(index => index >= 0);
assert.deepEqual(changed, [16, 18, 25, 74]);

const heldout = scanHistoricalFamily(transformed56);
assert.deepEqual(heldout.fPositions, [16, 25, 35, 47, 51, 56]);
assert.equal(heldout.full.length, 0);
assert.deepEqual(heldout.best, {
  keyMode: "phi",
  sign: -1,
  start: 0,
  mask: 32,
  matches: 81,
  mismatch: [16, 18, 25, 74]
});

// Layered positive: explicitly wrap the known-valid p0-56 source stream in the
// fixed surface encoder, then undo it and recover the unique historical p56 path.
const plantedOuter = surfaceEncrypt(source);
const recovered = surfaceDecrypt(plantedOuter);
assert.deepEqual(recovered, source);
const recoveredScan = scanHistoricalFamily(recovered.slice(p56Start));
assert.equal(recoveredScan.full.length, 1);
assert.equal(recoveredScan.best.matches, 85);

console.log(JSON.stringify({
  model: "fixed global zero-F p50 surface layer tested on solved p56",
  p56StartGlobal: p56Start,
  p56StartPhase: p56Start & 255,
  sourceHistoricalFullPaths: sourceScan.full,
  surfaceInverseChanges: changed,
  transformedHistoricalBest: heldout.best,
  transformedHistoricalFullPaths: heldout.full.length,
  positive: {
    exactSurfaceRoundtrip: true,
    recoveredHistoricalFullPaths: recoveredScan.full.length
  },
  decision:
    "REJECT universal/book-wide outer-layer interpretation: solved p56 loses its authenticated full path"
}, null, 2));
