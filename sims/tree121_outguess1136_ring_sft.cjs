"use strict";
/**
 * Signed-tree inner-five circumference checkpoint and fixed ring-pad inverse.
 * Run: node sims/tree121_outguess1136_ring_sft.cjs
 * Original inputs: canonical LP2 indices and the archived 2016 signed payload.
 * The ring/payload connection is retrospective and is not a decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeEnglish} = require("./outer_permutation_assignment.cjs");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const payload = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"));
const allPages = corpus.pages
  .filter(p => p.status === "unsolved" && p.indices.length > 0)
  .map(p => p.indices);
const total = allPages.reduce((n, p) => n + p.length, 0);
assert.equal(allPages.length, 55);
assert.equal(total, 12956);
assert.equal(payload.length, 1136);

const square = corpus.pages[32].indices;
assert.equal(square.length, 121);
const gpPrime = n => corpus.prime[n];
const sumPrime = xs => xs.reduce((s, x) => s + gpPrime(x), 0);
assert.equal(sumPrime(square.slice(0, 11)), 563);
assert.equal(sumPrime(Array.from({length: 11}, (_, r) => square[r * 11])), 569);

const ring = k => {
  const cells = [];
  const n = 11;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (Math.min(row, col, n - row - 1, n - col - 1) === k) {
        cells.push(square[row * n + col]);
      }
    }
  }
  return cells;
};
const lengths = [40, 32, 24, 16, 8, 1];
const sums = [1917, 1539, 1046, 1136, 388, 19];
for (let k = 0; k < 6; k++) {
  assert.equal(ring(k).length, lengths[k]);
  assert.equal(sumPrime(ring(k)), sums[k]);
}
assert.equal(sumPrime(square), 6045);

const clockwise = [];
for (let col = 3; col <= 7; col++) clockwise.push([3, col]);
for (let row = 4; row <= 7; row++) clockwise.push([row, 7]);
for (let col = 6; col >= 3; col--) clockwise.push([7, col]);
for (let row = 6; row >= 4; row--) clockwise.push([row, 3]);
const cw = clockwise.map(([row, col]) => square[row * 11 + col]);
const ccw = [cw[0], ...cw.slice(1).reverse()];
assert.deepEqual(cw, [18, 14, 7, 23, 15, 23, 27, 17,
  11, 28, 27, 21, 12, 27, 6, 27]);
assert.equal(sumPrime(cw), payload.length);

function mod(x, m) { return ((x % m) + m) % m; }
function ioc(values) {
  const count = Array(29).fill(0);
  for (const v of values) count[v]++;
  const n = values.length;
  return count.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
function flat(pages) { return pages.flat(); }
function options() {
  const out = [];
  for (const key of [cw, ccw]) {
    for (const prime of [false, true]) {
      for (const mode of ["gp29", "gp28"]) {
        for (const sign of [-1, 1]) {
          for (const reset of ["book", "page"]) {
            for (const markerStep of mode === "gp28" ? [false, true] : [true]) {
              out.push({key, prime, mode, sign, reset, markerStep});
            }
          }
        }
      }
    }
  }
  return out;
}
function transform(pages, opt, decrypt) {
  const m = opt.mode === "gp29" ? 29 : 28;
  let clock = 0;
  return pages.map(page => {
    if (opt.reset === "page") clock = 0;
    const result = [];
    for (let i = 0; i < page.length; i++) {
      const v = page[i];
      if (opt.mode === "gp28" && i === 0) {
        result.push(v);
        clock++;
        continue;
      }
      const prev = decrypt ? page[i - 1] : result[i - 1];
      if (opt.mode === "gp28" && (decrypt ? v === prev : v === 28)) {
        result.push(decrypt ? 28 : prev);
        if (opt.markerStep) clock++;
        continue;
      }
      const k = (opt.prime ? gpPrime(opt.key[clock % 16]) :
        opt.key[clock % 16]) % m;
      if (opt.mode === "gp29") {
        result.push(mod(v + (decrypt ? 1 : -1) * opt.sign * k, m));
      } else {
        const rank = decrypt ? mod(v - prev - 1, 29) :
          mod(v - opt.sign * k, 28);
        result.push(decrypt ? mod(rank + opt.sign * k, 28) :
          mod(prev + rank + 1, 29));
      }
      clock++;
    }
    return result;
  });
}
const original = flat(allPages);
const scores = [];
for (const opt of options()) {
  const plaintext = transform(allPages, opt, true);
  assert.deepEqual(transform(plaintext, opt, false), allPages);
  scores.push({mode: opt.mode, direction: opt.key === cw ? "cw" : "ccw",
    basis: opt.prime ? "prime" : "ordinal", sign: opt.sign,
    reset: opt.reset, markerStep: opt.markerStep, ioc: ioc(flat(plaintext))});
}
assert.equal(scores.length, 48);
scores.sort((a, b) => b.ioc - a.ioc);
assert(scores[0].ioc < 0.036);

const source = fs.readFileSync(
  path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const english = encodeEnglish(source).slice(0, total);
assert.equal(english.length, total);
const sizes = allPages.map(p => p.length);
function shaped(values) {
  let offset = 0;
  return sizes.map(size => {
    const p = values.slice(offset, offset + size);
    offset += size;
    return p;
  });
}
const gp29Plant = shaped(english);
const gp28Plant = gp29Plant.map((page, p) => page.map((v, i) => {
  if (i > 0 && allPages[p][i] === allPages[p][i - 1]) return 28;
  return v === 27 ? 10 : v === 28 ? 27 : v;
}));
const bestGP29 = {key: cw, prime: false, mode: "gp29",
  sign: 1, reset: "page", markerStep: true};
const bestGP28 = {key: cw, prime: true, mode: "gp28",
  sign: -1, reset: "book", markerStep: false};
for (const [opt, plain] of [[bestGP29, gp29Plant], [bestGP28, gp28Plant]]) {
  const cipher = transform(plain, opt, false);
  assert.deepEqual(transform(cipher, opt, true), plain);
  assert.equal(flat(cipher).length, total);
}
console.log(JSON.stringify({
  ringSumsOuterToInner: sums,
  clockwiseRingOrdinals: cw,
  clockwiseRingPrime: cw.map(gpPrime),
  payloadBytes: payload.length,
  originalRuneCount: total,
  scannedModelCount: scores.length,
  rawIoC: ioc(original),
  bestOriginal: scores[0],
  nativeGP29PlantIoC: ioc(flat(gp29Plant)),
  nativeGP28PlantIoC: ioc(flat(gp28Plant)),
  originalRoundtrips: scores.length,
  nativePlantRoundtrips: 2,
  recoveredAuthenticPlaintext: false
}, null, 2));
