"use strict";

/**
 * Original LP2 sixteen red spans versus the exact sixteen Fibonacci-prime
 * starting ordinals, using only the historically solved p56 totient cipher.
 *
 * SFT: node sims/p15_red_span_fibonacci_totient_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = (s) => JSON.parse(fs.readFileSync(path.join(root, s), "utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const marks = load("resources/liber-primus/lp2-ink-annotations.json");
const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const printed = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const primes = [];
for (let n = 2; primes.length < 1100; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
assert.deepEqual(fib.map((n) => Math.abs(3301 - primes[n])), printed);
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const spans = marks.pages.flatMap((p) => (p.red_spans || []).map((s) => ({
  page: p.page, start: s.start,
  indices: [...s.runes].map((r) => {
    assert.ok(alphabet.has(r)); return alphabet.get(r);
  })
})));
const unknown = spans.filter((s) => s.page <= 55);
assert.equal(unknown.length, 16);
assert.equal(unknown.reduce((n, s) => n + s.indices.length, 0), 213);
for (const span of unknown) {
  const sourcePage = gp.pages.find((p) => p.page === span.page);
  assert.deepEqual(span.indices,
    sourcePage.indices.slice(span.start, span.start + span.indices.length));
}

/** @param {number} n */
function mod(n) { return ((n % 29) + 29) % 29; }

/** @param {number[]} c @param {number} start @param {boolean} literalF */
function decrypt(c, start, literalF) {
  let pos = start;
  return c.map((v) => literalF && v === 0 ? 0 : mod(v - primes[pos++] + 1));
}

/** @param {number[]} p @param {number} start */
function encrypt(p, start) {
  return p.map((v, i) => mod(v + primes[start + i] - 1));
}

/** @param {number[]} a */
function pairs(a) {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}

/** @param {number[]} order @param {boolean} literalF */
function join(order, literalF) {
  return unknown.flatMap((s, i) => decrypt(s.indices, fib[order[i]], literalF));
}

const p56 = spans.find((s) => s.page === 56);
const p57 = spans.find((s) => s.page === 57);
assert.equal(decrypt(p56.indices, 0, false).map((i) => gp.translit[i]).join(""), "ANEND");
assert.equal(p57.indices.map((i) => gp.translit[i]).join(""), "PARABLE");
const solved = gp.pages.find((p) => p.page === 57).indices;
for (let i = 0; i < 16; i++) {
  const s = unknown[i], start = fib[i], candidate = decrypt(s.indices, start, false);
  assert.deepEqual(decrypt(encrypt(candidate, start), start, false), candidate);
  const planted = Array.from({length:s.indices.length},
    (_, j) => solved[(i * 13 + j) % solved.length]);
  assert.deepEqual(decrypt(encrypt(planted, start), start, false), planted);
  console.log("red", i+1, "physical page", s.page, "rune offset", s.start,
    "prime ordinal", start+1,
    "decoded", candidate.map((v) => gp.translit[v]).join(""));
}
const ordered = Array.from({length:16}, (_, i) => i);
const outputs = [join(ordered, false), join(ordered, true)];
const originalPairs = outputs.map(pairs);
const exceed = [0,0], sums = [0,0];
let state = 0x3301;
function random() {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  state >>>= 0; return state;
}
const reps = 100000;
for (let trial = 0; trial < reps; trial++) {
  const order = [...ordered];
  for (let j = 15; j > 0; j--) {
    const k = random() % (j+1);
    [order[j],order[k]] = [order[k],order[j]];
  }
  for (let m = 0; m < 2; m++) {
    const val = pairs(join(order, m === 1));
    sums[m] += val;
    if (val <= originalPairs[m]) exceed[m]++;
  }
}
const denom = 213 * 212;
console.log("original source red IoC",
  (pairs(unknown.flatMap((s) => s.indices))/denom).toFixed(9));
console.log("readable p57 IoC", (pairs(solved)/(solved.length*(solved.length-1))).toFixed(9));
for (let m=0;m<2;m++) {
  console.log("literal F:",Boolean(m),
    "observed IoC:",(originalPairs[m]/denom).toFixed(9),
    "permuted mean:",(sums[m]/reps/denom).toFixed(9),
    "lower-tail:",(exceed[m]+1)+"/"+(reps+1));
}
console.log("PASS: original span integrity, p15 spiral, solved p56/p57, round-trips");
