"use strict";
/**
 * Historical 2013 telnet COUNT/NUMBER decimal-reversal operation applied to
 * the solved PARABLE heading and the 2014 seventh-onion square.
 *
 * Original-source facts are distinguished from the proposed cross-year reuse.
 * Usage: node sims/cicada2013_parable_reversal_ring_sft.cjs
 * Node.js 22, built-in modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
/** @param {number} n @returns {number} */
function reverseDecimal(n) {
  return Number(String(n).split("").reverse().join(""));
}
/** @param {number} n @returns {number[]} */
function divisors(n) {
  const a = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      a.push(d);
      if (d * d !== n) a.push(n / d);
    }
  }
  return a.sort((x, y) => x - y);
}
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n @returns {number} */
function primeCount(n) {
  let count = 0;
  for (let x = 2; x <= n; x++) if (isPrime(x)) count++;
  return count;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((a, b) => a + b * (b - 1), 0) / (xs.length * (xs.length - 1));
}
/**
 * @param {number[]} arr
 * @param {number[]} pad
 * @param {number} sign
 * @returns {number[]}
 */
function transform(arr, pad, sign) {
  return arr.map((x, i) => ((x + sign * pad[i % pad.length]) % 29 + 29) % 29);
}
function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const html = read("resources/cicada2014-onion7-index.html");
  const transcript = read("resources/lp2-transcription.txt").split("%");
  const blocks = read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  const middle = blocks[1].trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number));
  assert.deepEqual(middle.map(x => x.length), Array(7).fill(7));

  const primeByRune = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
  const p57 = transcript[56].split(".").map(clause =>
    [...clause].filter(r => primeByRune.has(r)));
  const clauses = p57.filter(c => c.length);
  const sums = clauses.map(c => c.reduce((s, r) => s + primeByRune.get(r), 0));
  assert.deepEqual(sums, [449, 1259, 1031, 1229]);
  const wordCounts = transcript[56].split(".").map(part =>
    part.split("-").filter(word => [...word].some(r => primeByRune.has(r))).length)
    .filter(Boolean);
  assert.deepEqual(wordCounts, [1, 7, 6, 6]);

  const title = Number(html.match(/<title>(\d+)<\/title>/)[1]);
  const div = Number(html.match(/<div id="(\d+)">/)[1]);
  assert.deepEqual([title, div], [133, 331]);

  // 2013 telnet documented COUNT PARABLE -> 449*; '*' flags a prime with
  // composite decimal reversal. NUMBER 449 would factor 944. This is
  // a historically available operation, NOT a 2014 instruction to reuse it.
  assert.equal(isPrime(sums[0]), true);
  assert.equal(isPrime(reverseDecimal(sums[0])), false);
  assert.equal(reverseDecimal(sums[0]), 944);
  assert.deepEqual(divisors(944), [1, 2, 4, 8, 16, 59, 118, 236, 472, 944]);

  // 2014 onion metadata are decimal reversals. NUMBER 331 is prime,
  // therefore the archived 2013 telnet procedure factors 133 = 7*19.
  assert.equal(reverseDecimal(div), title);
  assert.equal(reverseDecimal(title), div);
  assert.equal(isPrime(div), true);
  assert.deepEqual(divisors(reverseDecimal(div)), [1, 7, 19, 133]);
  assert.equal(wordCounts[1], 7);
  assert.equal(wordCounts.slice(1).reduce((a,b) => a+b, 0), 19);

  // PARABLE's "shed circumferences" allows the *hypothesis* that 16
  // refers to the middle square's inner 5x5 perimeter.
  const ring = [];
  for (let c = 1; c <= 5; c++) ring.push(middle[1][c]);
  for (let r = 2; r <= 4; r++) ring.push(middle[r][5]);
  for (let c = 5; c >= 1; c--) ring.push(middle[5][c]);
  for (let r = 4; r >= 2; r--) ring.push(middle[r][1]);
  assert.deepEqual(ring, [
    223,14,47,293,98,23,65,232,223,14,47,293,98,23,65,232
  ]);
  assert.equal(ring.length, 16);
  assert.deepEqual(ring.slice(0,8),ring.slice(8));
  assert.equal(ring.reduce((s,x) => s+x,0),1990);

  const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
  const original = originalPages.flatMap(p => p.indices);
  assert.equal(original.length, 12956);
  const originalIoc = ioc(original);

  // A deliberately *narrow* terminal gate: source ring as the complete
  // unmodified period-16 numeric pad (really period 8). No phase/key hunt.
  const candidates = [];
  for (const encoding of ["value", "reverseDecimal", "primeCount"]) {
    const pad = ring.map(x => (encoding === "value" ? x :
      encoding === "reverseDecimal" ? reverseDecimal(x) : primeCount(x)) % 29);
    for (const sign of [-1,1]) for (const reset of ["book","page"]) {
      const decrypted = reset === "book" ? transform(original,pad,sign) :
        originalPages.flatMap(page => transform(page.indices,pad,sign));
      // A wrong bijective key round-trips too. A solved native-Cicada
      // plant checks implementation, not the historical identity of the key.
      const nativeP57 = corpus.pages.find(p => p.page === 57).indices;
      assert.deepEqual(transform(transform(nativeP57,pad,-sign),pad,sign),nativeP57);
      candidates.push({encoding,sign,reset,ioc:ioc(decrypted),
        preview:decrypted.slice(0,36).map(i=>corpus.translit[i]).join("")});
    }
  }
  assert.equal(candidates.length,12);
  const sorted = [...candidates].sort((a,b)=>b.ioc-a.ioc);
  assert.ok(sorted[0].ioc < 0.03450);
  assert.ok(sorted.at(-1).ioc > 0.03445);

  // The three body clause sums and their reversals are primes. With
  // preselected 4-digit primes 1000..1299, 25/43 have prime reversals,
  // so this alone is not strong cipher evidence.
  assert.deepEqual(sums.slice(1).map(n=>isPrime(n)&&isPrime(reverseDecimal(n))),
    [true,true,true]);
  const primes1000to1299=Array.from({length:300},(_,i)=>i+1000)
    .filter(isPrime);
  assert.equal(primes1000to1299.length,43);
  assert.equal(primes1000to1299.filter(n=>isPrime(reverseDecimal(n))).length,25);
  const output={
    historicalSource:"2013 telnet COUNT PARABLE -> 449* and NUMBER prime-reversal/factorization",
    currentSource:"Solved LP2 p57, 2014 seventh-onion HTML and middle OpenPuff 7x7 square",
    headingAndClauses:sums,
    2013TelnetNumber449:{reversed:944,divisors:divisors(944)},
    2013TelnetNumber331:{reversed:133,divisors:divisors(133)},
    p57WordCounts:wordCounts,
    middleSquareInnerRing:ring,
    ringPeriod:8,
    originalRuneCount:original.length,
    originalIoc,
    directAdditiveInverse:{
      candidates:candidates.length,best:sorted[0],
      minIoc:sorted.at(-1).ioc,maxIoc:sorted[0].ioc
    },
    conclusion:"Historically available operation; no source instruction to use it on the later square, and no recovered key/plaintext."
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={main,reverseDecimal,divisors};
