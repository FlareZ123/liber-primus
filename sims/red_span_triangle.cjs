"use strict";

/**
 * Exact source-locked test for the three-red-span page-pointer/totient triangle.
 * Node.js 22, CommonJS; no dependencies beyond Node's standard library.
 * All "page" values are physical zero-based LP2 page indices.
 * This is a cipher-side arithmetic test, not a plaintext decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const annotation = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));

/** @param {number} limit @returns {number[]} Ordinary primes in increasing order. */
function primesBelow(limit) {
  const ok = new Uint8Array(limit);
  ok.fill(1);
  const out = [];
  for (let p = 2; p < limit; p++) {
    if (!ok[p]) continue;
    out.push(p);
    for (let k = p * p; k < limit; k += p) ok[k] = 0;
  }
  return out;
}

/**
 * @typedef {{page:number,start:number,len:number,q:number[],hist:Map<number,number>}} Span
 * Source-preserving rotations apply one shared cyclic offset to every marked
 * span on a physical page, with exactly the original rune inventory.
 * @returns {Span[]}
 */
function collectSpans() {
  const spans = [];
  for (const page of annotation.pages) {
    if (page.page >= 56) continue;
    const glyphs = corpus.pages[page.page].indices;
    assert.equal(glyphs.length, page.rune_count, "page corpus/ink mismatch");
    const values = glyphs.map((i) => corpus.prime[i]);
    for (const marked of page.red_spans || []) {
      assert.equal(
        glyphs.slice(marked.start, marked.start + marked.length)
          .map((i) => corpus.runes[i]).join(""),
        marked.runes,
        "source runes disagree with source ink");
      const n = values.length;
      const prefix = [0];
      for (let k = 0; k < n + marked.length; k++) {
        prefix.push(prefix[prefix.length - 1] + values[k % n]);
      }
      const q = [];
      const hist = new Map();
      for (let shift = 0; shift < n; shift++) {
        const sum = prefix[marked.start + shift + marked.length]
          - prefix[marked.start + shift];
        const v = sum % 29 === 0 ? sum / 29 : -1;
        q.push(v);
        hist.set(v, (hist.get(v) || 0) + 1);
      }
      spans.push({page: page.page, start: marked.start, len: marked.length, q, hist});
    }
  }
  assert.equal(spans.length, 16);
  return spans;
}

/** @param {number} a @param {number} b @returns {bigint} Greatest common divisor. */
function gcd(a, b) {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

/**
 * @param {Span[]} spans
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number[]} primes
 * @returns {number} Exact probability as an IEEE-754 approximation.
 */
function tripleProbability(spans, a, b, c, primes) {
  const A = spans[a], B = spans[b], C = spans[c];
  const m = B.page;
  if (a === b || a === c || b === c || m >= 29 ||
      C.page !== corpus.prime[m]) return 0;
  let p = 0;
  if (A.page === B.page) {
    for (let i = 0; i < B.q.length; i++) {
      const k = B.q[i];
      if (A.q[i] !== m || k < 1 || k > primes.length) continue;
      p += (C.hist.get(primes[k - 1] - 1) || 0) / C.q.length / B.q.length;
    }
  } else if (A.page === C.page) {
    for (let i = 0; i < C.q.length; i++) {
      if (A.q[i] !== m) continue;
      for (const [k, count] of B.hist) {
        if (k >= 1 && k <= primes.length && C.q[i] === primes[k - 1] - 1)
          p += count / B.q.length / C.q.length;
      }
    }
  } else {
    const pA = (A.hist.get(m) || 0) / A.q.length;
    for (const [k, count] of B.hist) {
      if (k >= 1 && k <= primes.length)
        p += pA * count / B.q.length
          * (C.hist.get(primes[k - 1] - 1) || 0) / C.q.length;
    }
  }
  return p;
}

/**
 * One triangle has three distinct red spans:
 * (1) q_A = page(B);
 * (2) page(C) = GP_prime[q_A], with zero-based rune index q_A;
 * (3) q_C = ordinary_prime[q_B] - 1, with one-based prime ordinal q_B.
 * @returns {object} Machine-readable reproducibility record.
 */
function run() {
  const spans = collectSpans();
  const primes = primesBelow(2000);
  const actualQ = spans.map((s) => s.q[0]);
  const original = [];
  const feasible = [];
  for (let a = 0; a < spans.length; a++) {
    for (let b = 0; b < spans.length; b++) {
      for (let c = 0; c < spans.length; c++) {
        if (a === b || a === c || b === c ||
            spans[b].page >= 29 ||
            spans[c].page !== corpus.prime[spans[b].page]) continue;
        const m = actualQ[a], k = actualQ[b];
        if (m === spans[b].page && k >= 1 && k <= primes.length &&
            actualQ[c] === primes[k - 1] - 1) original.push([a, b, c]);
        const prob = tripleProbability(spans, a, b, c, primes);
        if (prob > 0) feasible.push({a, b, c, probability: prob});
      }
    }
  }
  assert.deepEqual(original, [[13, 6, 14]]);
  assert.deepEqual(feasible.map((x) => [x.a, x.b, x.c]),
    [[3, 6, 14], [10, 6, 14], [13, 6, 14]]);
  const candidateA = feasible.map((x) => x.a);
  for (const a of candidateA)
    assert.equal(spans[a].hist.get(15), 1);
  assert.equal(spans[6].hist.get(22), 1);
  assert.equal(spans[14].hist.get(78), 1);

  // The three A pages are distinct and independent of B=page15, C=page53.
  // The exact familywise union therefore reduces to an elementary product.
  let allA = 1n, noA = 1n;
  for (const a of candidateA) {
    const n = BigInt(spans[a].q.length);
    allA *= n;
    noA *= n - 1n;
  }
  let num = allA - noA;
  let den = allA * BigInt(spans[6].q.length) * BigInt(spans[14].q.length);
  const factor = gcd(num, den);
  num /= factor;
  den /= factor;
  assert.equal(num, 22669n);
  assert.equal(den, 45960075084n);

  const show = (index) => ({
    page: spans[index].page, start: spans[index].start,
    len: spans[index].len, q: actualQ[index]
  });
  const result = {
    source: "original GP rune indices and independently annotated red spans",
    rule: "qA=pageB; pageC=GPprime[qA]; qC=prime[qB]-1",
    checked_spans: spans.length,
    observed: original.map((item) => item.map(show)),
    feasible_triples_under_any_page_rotation:
      feasible.map((x) => ({a: show(x.a), b: show(x.b),
        c: show(x.c), probability: x.probability})),
    exact_family_probability: num.toString() + "/" + den.toString(),
    exact_family_probability_decimal: Number(num) / Number(den),
    exact_family_inverse_frequency: Number(den) / Number(num),
    fixed_original_target_rotation_indices: {
      page40: spans[13].q.flatMap((v, i) => v === 15 ? [i] : []),
      page15: spans[6].q.flatMap((v, i) => v === 22 ? [i] : []),
      page53: spans[14].q.flatMap((v, i) => v === 78 ? [i] : [])
    },
    caveat: "Post-selected rule; no LP2 plaintext or key recovered"
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {run, collectSpans, tripleProbability};
