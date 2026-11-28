"use strict";

/**
 * P50 origin-invariant rank-interval receiver gate.
 *
 * The corrected p50 geometry still recovers the numerical ordinary-prime
 * rank interval 17..24 independent of whether the signed 2016 word register
 * is zero- or one-origin. Test exactly one receiver:
 *   key = [17,18,19,20,21,22,23,24] mod29
 *   conventional Vigenere decrypt P = C - K
 *   phase0 at the intact 138-rune pretable sentence
 *   p50 typed field consumes no key
 *   posttable 170-rune sentence therefore starts at phase 138 mod8 = 2.
 *
 * SFT: node sims/lp2_p50_rank17_24_flanks_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page = (n) => gp.pages.find((p) => p.page === n).indices;
const mod = (x) => ((x % 29) + 29) % 29;
const key = [17,18,19,20,21,22,23,24];

const pre = [...page(48).slice(-72), ...page(49).slice(0, 66)];
const post = [...page(51).slice(0, 92), ...page(52).slice(0, 78)];
assert.equal(pre.length, 138);
assert.equal(post.length, 170);

function transform(a, start, sign) {
  return a.map((x, i) => mod(x + sign * key[(start + i) % key.length]));
}
function ioc(a) {
  const c = new Array(29).fill(0);
  for (const x of a) c[x]++;
  return c.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const prePlain = transform(pre, 0, -1);
const postPlain = transform(post, pre.length % 8, -1);
assert.equal(pre.length % 8, 2);

assert.ok(Math.abs(ioc(prePlain) - 0.032476462498677666) < 1e-15);
assert.ok(Math.abs(ioc(postPlain) - 0.0347372084928646) < 1e-15);

// Positive: plant the same two-span clock and skip grammar on genuine solved/native GP.
const p57 = gp.pages.find((p) => p.page === 57).indices;
const control = Array.from({length: 308}, (_, i) => p57[i % p57.length]);
const clearPre = control.slice(0, 138);
const clearPost = control.slice(138);
const cipherPre = transform(clearPre, 0, +1);
const cipherPost = transform(clearPost, clearPre.length % 8, +1);
assert.deepEqual(transform(cipherPre, 0, -1), clearPre);
assert.deepEqual(transform(cipherPost, clearPre.length % 8, -1), clearPost);

console.log(JSON.stringify({
  key,
  source: {
    preRunes: pre.length,
    postRunes: post.length,
    postPhase: pre.length % 8
  },
  decodedIoc: {
    pre: ioc(prePlain),
    post: ioc(postPlain)
  },
  positive: "308-symbol two-flank rank17..24 roundtrip PASS"
}, null, 2));
