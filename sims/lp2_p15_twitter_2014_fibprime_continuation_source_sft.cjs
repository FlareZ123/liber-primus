"use strict";
/**
 * Original page15 Fibonacci-prime spiral and archived July 2014
 * auxiliary-account Fibonacci-primes tweet (unsigned).
 *
 * This source-only cross-artifact selection is conditional on account
 * authenticity and on reading the very next term as an absolute unknown
 * LP2 rune index. There is no claim of unknown plaintext recovery.
 *
 * Windows Node.js 22: node sims/lp2_p15_twitter_2014_fibprime_continuation_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function input(relative) {
  return fs.readFileSync(path.join(root, relative));
}
/** @param {Buffer} content */
function gitBlobSha1(content) {
  return crypto.createHash("sha1")
    .update(Buffer.from("blob " + content.length + "\0"))
    .update(content)
    .digest("hex");
}
/** @param {number} index */
function fibonacci(index) {
  let previous = 0n, current = 1n;
  for (let i = 0; i < index; i++) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}
/** @param {number} max */
function primesUpTo(max) {
  const composite = new Uint8Array(max + 1);
  const result = [];
  for (let p = 2; p <= max; p++) {
    if (composite[p]) continue;
    result.push(p);
    for (let n = p * p; n <= max; n += p) composite[n] = 1;
  }
  return result;
}
/** @param {bigint} base @param {bigint} power @param {bigint} mod */
function modularPow(base, power, mod) {
  let result = 1n;
  base %= mod;
  while (power > 0n) {
    if (power & 1n) result = result * base % mod;
    base = base * base % mod;
    power >>= 1n;
  }
  return result;
}
/** Deterministic Miller-Rabin for unsigned 64-bit integers.
 * @param {bigint} n
 */
function isPrime64(n) {
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n, s = 0n;
  while (!(d & 1n)) { d /= 2n; s++; }
  for (const a0 of [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n]) {
    const a = a0 % n;
    if (!a) continue;
    let x = modularPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let witness = true;
    for (let i = 1n; i < s; i++) {
      x = x * x % n;
      if (x === n - 1n) { witness = false; break; }
    }
    if (witness) return false;
  }
  return true;
}
const tweetBytes = input("resources/external/cicada2014-aux-fibonacci-twitter-487553631718490112.json");
const canonicalTweetBytes = Buffer.from(tweetBytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
assert.equal(gitBlobSha1(canonicalTweetBytes), "05624b76fd75b7b0acc261d91aae7600f8d623e2");
const tweet = JSON.parse(tweetBytes.toString("utf8"));
assert.equal(tweet.meta.result_count, 1);
const record = tweet.data[0];
assert.equal(record.id, "487553631718490112");
assert.equal(record.created_at, "2014-07-11T11:06:58.000Z");
assert.equal(record.author_id, "2617098684");
const tweetValues = record.text.replace(/\.\.\.$/, "").split(",").map(s => BigInt(s.trim()));
const tweetIndices = [3, 4, 5, 7, 11, 13, 17, 23, 29, 43, 47, 83];
assert.equal(tweetValues.length, 12);
assert.deepEqual(tweetValues, tweetIndices.map(fibonacci));
assert.ok(tweetValues.every(isPrime64), "each archived tweet value is a Fibonacci prime");

const originalPage15Spiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const distinctFib = [];
for (let i = 0; distinctFib.length < 16; i++) {
  const f = Number(fibonacci(i));
  if (distinctFib.at(-1) !== f) distinctFib.push(f);
}
assert.deepEqual(distinctFib, [
  0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987
]);
const primes = primesUpTo(16000);
const reconstructed = distinctFib.map(f => Math.abs(3301 - primes[f]));
assert.deepEqual(reconstructed, originalPage15Spiral);
const insideTweet = tweetValues.filter(f => f <= 987n).map(Number);
assert.deepEqual(insideTweet, [2,3,5,13,89,233]);
const nextFibonacci = Number(fibonacci(17));
assert.equal(nextFibonacci, 1597);
assert.equal(Number(tweetValues[6]), nextFibonacci);
const nextPrimeOrdinal = nextFibonacci + 1;
assert.equal(primes[nextPrimeOrdinal - 1], 13477);
const extrapolated = Math.abs(3301 - primes[nextPrimeOrdinal - 1]);
assert.equal(extrapolated, 10176);

const corpus = JSON.parse(input("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const pages = corpus.pages.filter(p => p.page < 56);
const stream = pages.flatMap(p => p.indices);
assert.equal(stream.length, 12956);
assert.deepEqual(stream.slice(extrapolated - 1, extrapolated + 2), [13,9,7]);
const selectedPage = pages.find(page => page.page === 42);
assert.ok(selectedPage);
const prefixCount = pages.filter(page => page.page < 42)
  .reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(prefixCount, 10144);
assert.equal(extrapolated - 1 - prefixCount, 31);
const sourceWord = selectedPage.indices.slice(31, 34)
  .map(i => corpus.translit[i]).join("");
assert.equal(sourceWord, "PNW");

// The historical auxiliary Twitter avatar/bio displays 9901, an externally
// sourced value. The arithmetic relation is exact but postnoticed.
const profilePrime = 9901n;
assert.ok(isPrime64(profilePrime));
assert.equal(profilePrime, 3n * 3301n - 2n);
assert.equal(profilePrime % 3301n, 3299n);
console.log(JSON.stringify({
  status: "unsigned auxiliary tweet; mathematical bridge, no plaintext",
  archived_tweet_id: record.id,
  archived_timestamp: record.created_at,
  tweet_fibprime_indices: tweetIndices,
  tweet_fibprimes: tweetValues.map(String),
  p15_distinct_fibonacci_indices: distinctFib,
  p15_original_spiral: reconstructed,
  first_tweeted_prime_after_p15_fibonacci_range: nextFibonacci,
  first_unprinted_spiral_value: extrapolated,
  recipient: {lp2_page:42, zero_based_rune_offset:31, complete_original_word:sourceWord},
  avatar_9901_mod_3301: Number(profilePrime % 3301n),
  decode_claim: "none"
}, null, 2));
console.log("PASS: archived tweet, Fibonacci-prime list, original p15, and original LP2 pointer assertions");
