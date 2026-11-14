"use strict";

/**
 * LP1 p05 5x5 mixed-square word spiral as a GP29 source tape for LP2 p55.
 * Windows/Node 22 SFT: node sims/lp1_p05_spiral76_p55_ftransparent_sft.cjs
 * Reads original-source canonical rune strings without modifying reference data.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start = reference.indexOf("272-138-");
assert(start > 0);
const cells = reference.slice(start).split(/\r?\n/).slice(0, 5)
  .map(line => line.replace(/\/$/, "").split("-"));
assert(cells.every(row => row.length === 5));
assert.equal(cells[2][2], "ᚠᚩᚱᛗ");
const cipher = corpus.pages.find(p => p.page === 55).indices;
const solvedControl = corpus.pages.find(p => p.page === 57).indices;
assert.equal(cipher.length, 76);
assert.equal(solvedControl.length, 95);
const fPositions = cipher.flatMap((index, i) => index === 0 ? [i] : []);
assert.deepEqual(fPositions, [15, 25, 41]);
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73,
  79, 83, 89, 97, 101, 103, 107, 109];

/**
 * One strictly source-shaped outside-in spiral of all 25 physical cells.
 * Coordinates of numerical cells do not contribute plaintext key glyphs.
 * @param {boolean} ccw Counterclockwise rather than clockwise perimeter.
 * @returns {number[][]} Original (row,col) source words in peel order.
 */
function sourceSpiral(ccw) {
  const order = [];
  for (let a = 0, b = 4; a <= b; a++, b--) {
    if (ccw) {
      for (let r = a; r <= b; r++) order.push([r, a]);
      for (let col = a + 1; col <= b; col++) order.push([b, col]);
      if (a < b) {
        for (let r = b - 1; r >= a; r--) order.push([r, b]);
        for (let col = b - 1; col > a; col--) order.push([a, col]);
      }
    } else {
      for (let col = a; col <= b; col++) order.push([a, col]);
      for (let r = a + 1; r <= b; r++) order.push([r, b]);
      if (a < b) {
        for (let col = b - 1; col >= a; col--) order.push([b, col]);
        for (let r = b - 1; r > a; r--) order.push([r, a]);
      }
    }
  }
  assert.equal(order.length, 25);
  assert.equal(new Set(order.map(x => x.join(","))).size, 25);
  return order.filter(([r, col]) => !/^\d+$/.test(cells[r][col]));
}

const mod29 = value => (value % 29 + 29) % 29;
const ioc = indices => {
  const hist = Array(29).fill(0);
  for (const index of indices) hist[index]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0)
    / (indices.length * (indices.length - 1));
};

/**
 * Candidate GP29 key tape, derived exclusively from original p05 words.
 * @param {boolean} ccw Source 5x5 orientation.
 * @param {boolean} reversed Full derived-tape reversal.
 * @param {"rune"|"prime"|"totient"} map Original rune index/GP-prime/prime totient.
 * @returns {number[]} Entire 76-shift source key.
 */
function sourceKey(ccw, reversed, map) {
  const words = sourceSpiral(ccw);
  assert.equal(words.length, 13);
  assert.equal(words.slice(-1)[0].join(","), "2,2");
  let key = words.flatMap(([r, col]) =>
    [...cells[r][col]].map(glyph => {
      const index = corpus.runes.indexOf(glyph);
      assert(index >= 0);
      return index;
    }));
  assert.equal(key.length, 76);
  if (reversed) key = key.reverse();
  return key.map(index =>
    map === "rune" ? index :
    map === "prime" ? primes[index] % 29 : (primes[index] - 1) % 29);
}

/**
 * Undo a GP29 additive key stream under exactly the p56 transparent-F rule.
 * The three original ciphertext Fs may have been literal skips or encrypted.
 * @param {number[]} sourceCipher Source ciphertext indices.
 * @param {number[]} shifts Source-selected 76-element running key.
 * @param {number} sign -1 for C-K, +1 for C+K.
 * @param {Set<number>} bypasses Known or hypothesized literal-F positions.
 * @returns {{plain:number[],contradictions:number[],consumed:number}}
 */
function decode(sourceCipher, shifts, sign, bypasses) {
  const plain = [], contradictions = [];
  let consumed = 0;
  for (let i = 0; i < sourceCipher.length; i++) {
    const bypass = bypasses.has(i);
    if (bypass) assert.equal(sourceCipher[i], 0);
    const p = bypass ? 0 : mod29(sourceCipher[i] + sign * shifts[consumed++]);
    if (!bypass && p === 0) contradictions.push(i);
    plain.push(p);
    if (!bypass) assert.equal(mod29(p - sign * shifts[consumed - 1]), sourceCipher[i]);
  }
  return {plain, contradictions, consumed};
}

/** Forward p56-style F-transparent cipher, to validate all source-key decoders. */
function encrypt(plain, shifts, sign) {
  const result = [], bypasses = new Set();
  let consumed = 0;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) {
      result.push(0);
      bypasses.add(i);
    } else {
      result.push(mod29(plain[i] - sign * shifts[consumed++]));
    }
  }
  return {result, bypasses, consumed};
}

function main() {
  const models = [];
  const truth = [...solvedControl.slice(0, 76)];
  assert.equal(truth.length, 76);
  for (const ccw of [false, true]) {
    for (const reversed of [false, true]) {
      for (const map of ["rune", "prime", "totient"]) {
        const key = sourceKey(ccw, reversed, map);
        for (const sign of [-1, 1]) {
          const plant = encrypt(truth, key, sign);
          assert.deepEqual(
            decode(plant.result, key, sign, plant.bypasses).plain, truth);
          const valid = [];
          for (let mask = 0; mask < 8; mask++) {
            const bypasses = new Set(
              fPositions.filter((_, i) => Boolean(mask & (1 << i))));
            const result = decode(cipher, key, sign, bypasses);
            if (result.contradictions.length === 0) {
              valid.push({mask, ioc: ioc(result.plain),
                eCount: result.plain.filter(x => x === 18).length,
                prefix: result.plain.slice(0, 20).map(x =>
                  corpus.runes[x]).join("")});
            }
          }
          models.push({ccw, reversed, map, sign, valid});
        }
      }
    }
  }
  const surviving = models.flatMap(model => model.valid.map(v => ({
    ccw: model.ccw, reversed: model.reversed, map: model.map,
    sign: model.sign, ...v
  })));
  assert.equal(models.length, 24);
  assert.equal(surviving.length, 9);
  assert.equal(models.filter(m => m.valid.length > 0).length, 6);
  assert(Math.abs(Math.max(...surviving.map(x => x.ioc))
    - 0.04175438596491228) < 1e-12);
  assert(Math.abs(ioc(cipher) - 0.037894736842105266) < 1e-12);
  assert(Math.abs(ioc(solvedControl) - 0.06270996640537514) < 1e-12);
  console.log(JSON.stringify({
    source: "LP1 p05 mixed square, 5 outer + 7 inner + 1 center rune-word cells",
    sourceWordCount: 13, keyRunes: 76, p55Runes: cipher.length,
    originalFPositions: fPositions, tested: 24 * 8,
    valid: surviving.length, validModelFamilies: 6,
    rawP55Ioc: ioc(cipher), solvedP57Ioc: ioc(solvedControl),
    sourceExactPositivePlants: models.length, survivors: surviving
  }, null, 2));
}

if (require.main === module) main();
module.exports = {sourceSpiral, sourceKey, decode, encrypt};
