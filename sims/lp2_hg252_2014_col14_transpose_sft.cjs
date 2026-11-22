"use strict";

/**
 * Source-specific test of the historical Cicada 2014 14-column rearrangement
 * applied to the independently factored 252-GP-digit LP2 numerical quotient.
 * Node.js 22, CommonJS, read-only; all original inputs are repository files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = filename => JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json");
const mod = x => ((x % 29) + 29) % 29;
const ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const FACTOR = [12, 17, 11, 21, 23]; // H(2013 BASE29) × G(p39 red), descending
const original2014 = "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const solved2014 = "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";

/**
 * Apply the exact documented historical column map rowwise, or its inverse.
 * @param {Array<number|string>} items
 * @param {boolean} inverse
 * @returns {Array<number|string>}
 */
function rearrange(items, inverse) {
  assert.equal(items.length % 14, 0);
  const out = items.slice();
  for (let i = 0; i < items.length; i += 14) {
    for (let j = 0; j < 14; j++) {
      if (inverse) out[i + ORDER[j]] = items[i + j];
      else out[i + j] = items[i + ORDER[j]];
    }
  }
  return out;
}

assert.equal(original2014.length, 70);
assert.equal(rearrange([...original2014], false).join(""), solved2014);
assert.deepEqual(rearrange(rearrange([...original2014], false), true), [...original2014]);

// Exact GF(29) polynomial long division in displayed 256-byte source order.
const remainder = grid.byte_rows.flat().map(mod);
assert.equal(remainder.length, 256);
const Q = [];
for (let i = 0; i < 252; i++) {
  const coeff = mod(remainder[i] * 17); // 12^(-1) = 17 mod 29
  Q.push(coeff);
  for (let j = 0; j < 5; j++) remainder[i + j] =
    mod(remainder[i + j] - coeff * FACTOR[j]);
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(Q.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);
assert.equal(Q.length, 18 * 14);

/**
 * Exact inverse path existence for p56-authentic plaintext-F transparency:
 * an F ciphertext can be a nonconsuming F plaintext, or a consumed non-F
 * decoded to F's ciphertext. All other glyphs must consume a key symbol.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {1|-1} sign
 * @returns {{firstImpossible:number|null,pathCount:number}}
 */
function nativeFpaths(cipher, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const j of states) {
      const plain = mod(cipher[i] + sign * key[j % key.length]);
      if (plain !== 0) next.add(j + 1);
      if (cipher[i] === 0) next.add(j);
    }
    if (!next.size) return { firstImpossible: i, pathCount: 0 };
    states = next;
  }
  return { firstImpossible: null, pathCount: states.size };
}

/**
 * Source-pinned synthetic receiver positive, using genuine printed-clear p57
 * and the identical nonconsuming-F clock and sign as the inverse.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {1|-1} sign
 * @returns {number[]}
 */
function nativeFencrypt(plain, key, sign) {
  let j = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p - sign * key[j % key.length]);
    j++;
    return c;
  });
}

const before = gp.pages[48].indices.slice(-72).concat(gp.pages[49].indices);
const after = gp.pages[51].indices.concat(gp.pages[52].indices.slice(0, 78));
const terminal = gp.pages[54].indices.concat(gp.pages[55].indices);
const p02 = gp.pages.slice(0, 3).flatMap(p => p.indices);
const p4053 = gp.pages.slice(40, 54).flatMap(p => p.indices);
assert.deepEqual([before.length, after.length, terminal.length, p02.length, p4053.length],
  [138, 170, 308, 729, 3008]);
const inputs = [["pretable", before], ["posttable", after],
  ["p54-p55", terminal], ["p0-p2", p02], ["p40-p53", p4053]];
const observed = [];
for (const [name, key] of [
  ["forward", rearrange(Q, false)], ["inverse", rearrange(Q, true)]
]) {
  assert.deepEqual(rearrange(key, name === "forward"), Q);
  for (const sign of [-1, 1]) {
    const plant = nativeFencrypt(gp.pages[57].indices, key, sign);
    assert.equal(plant.length, 95);
    assert.equal(nativeFpaths(plant, key, sign).firstImpossible, null);
    for (const [passage, cipher] of inputs) {
      const result = nativeFpaths(cipher, key, sign);
      observed.push({name, sign, passage, length: cipher.length, ...result});
      assert.equal(result.pathCount, 0, name + " " + passage + " failed to reject");
    }
  }
}
assert.deepEqual(
  observed.filter(x => x.passage === "pretable").map(x => x.firstImpossible),
  [123, 0, 109, 125]);
console.log(JSON.stringify({
  source: "LP2 pp49-51 original 32x8 table, 2013 H, p39 red G",
  quotientDigits: Q.length, quotientRows: 18, historicalColumns: ORDER.length,
  historical2014Positive: true, nativeP57PlantedPositives: 4,
  allOriginalReceiversMathematicallyImpossible: observed.length,
  tests: observed,
  conclusion: "Bounded negative; no unknown plaintext, key, or original decoder recovered"
}, null, 2));
