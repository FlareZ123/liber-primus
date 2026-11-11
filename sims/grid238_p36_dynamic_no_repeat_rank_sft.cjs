"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
const MOD = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < MOD; i++) {
    if (mod(x * i) === 1) return i;
  }
  throw new RangeError("not a field unit");
}

/** @param {number[]} values @returns {number[]} */
function trimmed(values) {
  const a = values.slice();
  while (a.length > 1 && a[a.length - 1] === 0) a.pop();
  return a;
}

/**
 * @param {number[]} a Ascending coefficients.
 * @param {number[]} d Ascending coefficients of a proven factor.
 * @returns {number[]}
 */
function divideExact(a, d) {
  const t = a.slice();
  const q = Array(a.length - d.length + 1).fill(0);
  const unit = inv(d[d.length - 1]);
  for (let i = q.length - 1; i >= 0; i--) {
    const scale = mod(t[i + d.length - 1] * unit);
    q[i] = scale;
    for (let j = 0; j < d.length; j++) {
      t[i + j] = mod(t[i + j] - scale * d[j]);
    }
  }
  assert.ok(t.slice(0, d.length - 1).every((v) => v === 0));
  return trimmed(q);
}

const sourceBytes = grid.byte_rows.flat();
assert.equal(sourceBytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(sourceBytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
let q = trimmed(sourceBytes.slice().reverse().map(mod));
for (const f of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
]) {
  q = divideExact(q, f);
}
q = q.map((x) => mod(x * inv(q[q.length - 1])));
assert.equal(q.length, 239);
assert.equal(q[0], 5);
assert.equal(q[238], 1);

const pages = corpus.pages.filter((p) => p.page <= 55 && p.runic_count > 0);
const cipher = pages.flatMap((p) => p.indices);
const seed = corpus.pages[36].indices.slice();
const before = pages.filter((p) => p.page < 36).flatMap((p) => p.indices);
const after = pages.filter((p) => p.page > 36).flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);
assert.equal(before.length, 8706);
assert.equal(seed.length, 238);
assert.equal(after.length, 4012);

/** @param {number[]} state @returns {number} */
function forward(state) {
  let value = 0;
  for (let j = 0; j < 238; j++) value -= q[j] * state[j];
  value = mod(value);
  state.shift();
  state.push(value);
  return value;
}

/** @param {number[]} state @returns {number} */
function backward(state) {
  let value = state[237];
  for (let j = 1; j < 238; j++) value += q[j] * state[j - 1];
  value = mod(-inv(q[0]) * value);
  state.pop();
  state.unshift(value);
  return value;
}

/**
 * @param {boolean} reverseSeed
 * @param {"p36"|"book"|"book-with-seed"} clock
 * @returns {number[]}
 */
function makeKey(reverseSeed, clock) {
  const start = reverseSeed ? seed.slice().reverse() : seed.slice();
  const state = start.slice();
  if (clock === "p36") {
    const left = [];
    for (let i = 0; i < before.length; i++) left.push(backward(state));
    const right = [];
    const afterState = start.slice();
    for (let i = 0; i < after.length; i++) right.push(forward(afterState));
    return left.reverse().concat(Array(238).fill(0), right);
  }
  const k = clock === "book-with-seed" ? start.slice() : [];
  while (k.length < cipher.length) k.push(forward(state));
  return k;
}

/** @param {number} keyValue @param {"mod28"|"scale"} representation */
function digitKey(keyValue, representation) {
  return representation === "mod28" ? keyValue % 28 :
    Math.floor(keyValue * 28 / 29);
}

/**
 * Exact predecessor-exclusion encoding. Plain F (index 0) is the
 * transparent repeated-cipher sentinel, after the published p56
 * selective-F precedent. All other 28 plain symbols are bijective.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @param {"mod28"|"scale"} representation
 * @returns {number[]}
 */
function encrypt(plaintext, key, sign, representation) {
  const out = [];
  let previous = 0;
  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext[i];
    const k = digitKey(key[i], representation);
    const current = p === 0 ? previous :
      mod(previous + 1 + mod28(p - 1 - sign * k));
    out.push(current);
    previous = current;
  }
  return out;
}

/** @param {number} n @returns {number} */
function mod28(n) {
  return ((n % 28) + 28) % 28;
}

/**
 * Exact inverse of encrypt, preserving all original equal-rune events.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @param {"mod28"|"scale"} representation
 * @returns {number[]}
 */
function decrypt(ciphertext, key, sign, representation) {
  const out = [];
  let previous = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const k = digitKey(key[i], representation);
    const p = c === previous ? 0 :
      1 + mod28(mod(c - previous - 1) + sign * k);
    out.push(p);
    previous = c;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((n, x) => n + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}

const known = corpus.pages[57].indices;
const results = [];
for (const clock of ["p36", "book", "book-with-seed"]) {
  for (const reverseSeed of [false, true]) {
    for (const sign of [1, -1]) {
      for (const representation of ["mod28", "scale"]) {
        const k = makeKey(reverseSeed, clock);
        const original = decrypt(cipher, k, sign, representation);
        const plantedPlain = Array.from(
          {length: cipher.length}, (_, i) => known[i % known.length]
        );
        const plantedCipher = encrypt(plantedPlain, k, sign, representation);
        assert.deepEqual(
          decrypt(plantedCipher, k, sign, representation), plantedPlain
        );
        assert.deepEqual(
          encrypt(original, k, sign, representation), cipher
        );
        const outside = original.slice(0, before.length)
          .concat(original.slice(before.length + seed.length));
        assert.equal(outside.filter((v) => v === 0).length, 83);
        results.push({
          clock, reverseSeed, sign, representation, ioc: ioc(outside),
          prefix: outside.slice(0, 72).map((v) => corpus.translit[v]).join(""),
        });
      }
    }
  }
}
results.sort((a, b) => b.ioc - a.ioc);
assert.equal(results.length, 24);
assert.ok(results[0].ioc < 0.03535);
assert.ok(results[results.length - 1].ioc > 0.03520);
console.log(JSON.stringify({
  factorDegree: q.length - 1,
  seedLength: seed.length,
  runeCount: cipher.length,
  testedSettings: results.length,
  originalRawIoC: ioc(before.concat(after)),
  strongestModel: results[0],
  weakestModel: results[results.length - 1],
  nativeP57IoC: ioc(known),
  allInverseControlsExact: true,
}, null, 2));
