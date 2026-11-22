"use strict";

/**
 * Key-independent all-secret GP29 affine Hill(2..4) original-source gate.
 * Scans every nonzero inverse row up to scalar multiplication in every
 * red-titled LP2 body, allowing all possible block starting phases.
 * Node 22; reads repository inputs; no file writes.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const full = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const titles = [
  [0, 0, 13], [3, 0, 16], [8, 0, 12],
  [15, 9, 11], [23, 0, 16], [27, 0, 19],
  [33, 0, 10], [33, 91, 8], [40, 0, 8]
];
const titleStarts = [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640];
const bodySizes = [716, 1129, 1726, 1883, 1005, 1414, 81, 1581, 3308];
assert.equal(full.length, 12956);
const starts = [];
for (let i = 0; i < titles.length; i++) {
  const [page, offset, count] = titles[i];
  const prior = corpus.pages.filter((p) => p.page < page).reduce((s, p) => s + p.indices.length, 0);
  const mark = ink.pages.find((p) => p.page === page).red_spans.find((r) => r.start === offset && r.length === count);
  assert.ok(mark);
  assert.equal(corpus.pages[page].indices.slice(offset, offset + count).map((r) => corpus.runes[r]).join(""), mark.runes);
  assert.equal(prior + offset, titleStarts[i]);
  starts.push(prior + offset);
}
starts.push(full.length);
const bodies = titles.map((t, i) => full.slice(starts[i] + t[2], starts[i + 1]));
assert.deepEqual(bodies.map((x) => x.length), bodySizes);

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const count = new Int32Array(29);
  for (const x of arr) count[x]++;
  let pairs = 0;
  for (const x of count) pairs += x * (x - 1);
  return pairs / (arr.length * (arr.length - 1));
}

/**
 * Every projective direction represents all nonzero scalar multiples of one
 * possible inverse-Hill-matrix row. Scaling/translation preserves GP29 IoC.
 * Exhausts (29^m-1)/28 = 30, 871, or 25260 directions for m=2,3,4.
 *
 * @param {number[]} input
 * @param {number} m
 * @param {number} phase
 * @returns {{blocks:number,max:number,vector:number[],above05:number}}
 */
function search(input, m, phase) {
  const blocks = Math.floor((input.length - phase) / m);
  assert.ok(blocks >= 2);
  let max = -1, best = [], above05 = 0;
  for (let pivot = 0; pivot < m; pivot++) {
    for (let n = 0; n < 29 ** (m - pivot - 1); n++) {
      const v = Array(m).fill(0);
      v[pivot] = 1;
      let code = n;
      for (let j = pivot + 1; j < m; j++) {
        v[j] = code % 29;
        code = Math.floor(code / 29);
      }
      const count = new Int32Array(29);
      for (let i = 0, base = phase; i < blocks; i++, base += m) {
        let acc = 0;
        for (let j = 0; j < m; j++) acc += v[j] * input[base + j];
        count[acc % 29]++;
      }
      let pairs = 0;
      for (const x of count) pairs += x * (x - 1);
      const value = pairs / (blocks * (blocks - 1));
      if (value > max) {
        max = value;
        best = v;
      }
      if (value >= 0.05) above05++;
    }
  }
  return { blocks, max, vector: best, above05 };
}

const results = [];
for (let body = 0; body < bodies.length; body++) {
  for (const m of [2, 3, 4]) {
    const values = Array.from({ length: m }, (_, phase) => search(bodies[body], m, phase));
    let best = values[0], at = 0;
    for (let phase = 1; phase < m; phase++) {
      if (values[phase].max > best.max) {
        best = values[phase];
        at = phase;
      }
    }
    const above05 = values.reduce((s, x) => s + x.above05, 0);
    results.push({ body, runes: bodies[body].length, m, bestIoc: best.max, phase: at, vector: best.vector, above05 });
    if (body !== 6) assert.equal(above05, 0);
  }
}
console.log("Original source, every GP29 projective direction and phase:", JSON.stringify(results));

const translit = new Map(corpus.translit.map((s, i) => [s, i]));
/** @param {string} input @returns {number[]} */
function gpEncode(input) {
  const normalized = input.toUpperCase().replaceAll("QU", "CW").replaceAll("ING", "NG")
    .replaceAll("K", "C").replaceAll("Q", "CW").replaceAll("V", "U")
    .replaceAll("Z", "S").replace(/[^A-Z]/g, "");
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const pair = translit.get(normalized.slice(i, i + 2));
    if (pair !== undefined) {
      output.push(pair);
      i += 2;
    } else {
      const one = translit.get(normalized[i]);
      assert.notEqual(one, undefined);
      output.push(one);
      i++;
    }
  }
  return output;
}

let firstControl = null;
for (const file of ["shakespeare_first300k.txt", "gibran_prophet_58585.txt", "emerson_essays_2944.txt"]) {
  const english = gpEncode(fs.readFileSync(path.join(root, "resources/control", file), "utf8"));
  assert.ok(english.length >= full.length);
  if (firstControl === null) firstControl = english;
  const min = { 2: 1, 3: 1, 4: 1 };
  let begin = 0;
  for (let body = 0; body < bodies.length; body++) {
    const sample = english.slice(begin, begin + bodies[body].length);
    begin += bodies[body].length;
    if (body === 6) continue; // 81-rune title interlude is too small.
    for (const m of [2, 3, 4]) {
      for (let k = 0; k < m; k++) {
        min[m] = Math.min(min[m], ioc(sample.filter((_, j) => j % m === k)));
      }
    }
  }
  for (const m of [2, 3, 4]) assert.ok(min[m] > 0.05);
  console.log("Held-out register positive min IoC:", file, JSON.stringify(min));
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let k = 1; k < 29; k++) if ((k * value) % 29 === 1) return k;
  throw new Error("Noninvertible scalar");
}

/**
 * Planted dense, invertible Hill matrix M=I+J, where J is the all-ones matrix.
 * P=(I-J/(m+1))C and det(M)=m+1 is nonzero for m=2..4.
 *
 * @param {number[]} plain
 * @param {number} m
 * @returns {number[]}
 */
function encrypt(plain, m) {
  const out = plain.slice();
  for (let base = 0; base + m <= plain.length; base += m) {
    const sum = mod29(plain.slice(base, base + m).reduce((s, x) => s + x, 0));
    for (let j = 0; j < m; j++) out[base + j] = mod29(plain[base + j] + sum);
  }
  return out;
}

/** @param {number[]} cipher @param {number} m @returns {number[]} */
function decrypt(cipher, m) {
  const out = cipher.slice();
  for (let base = 0; base + m <= cipher.length; base += m) {
    const sum = mod29(cipher.slice(base, base + m).reduce((s, x) => s + x, 0) * inverse(m + 1));
    for (let j = 0; j < m; j++) out[base + j] = mod29(cipher[base + j] - sum);
  }
  return out;
}

for (const m of [2, 3, 4]) {
  const original = firstControl.slice(0, bodySizes[0]);
  const cipher = encrypt(original, m);
  assert.deepEqual(decrypt(cipher, m), original);
  const found = search(cipher, m, 0);
  assert.ok(found.max > 0.05);
  console.log("Dense Hill positive:", JSON.stringify({ m, bestIoc: found.max, vector: found.vector }));
}
console.log("PASS: 8 substantial original bodies have no English-like Hill(2..4) linear projection.");
