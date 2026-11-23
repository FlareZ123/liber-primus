"use strict";

/**
 * P15 Fibonacci-prime ordinals -> authentic LP2 complete-word GP-prime sums
 * -> historical HTML 133 and twin-prime ranks; single AES-256 byte consumer.
 * This is a provenance-constrained *conditional* clue, not a solved LP2 page.
 * SFT: node sims/lp2_p15_fibonacci_globalword_2014index_twins_aes256_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createDecipheriv, createCipheriv} = require("node:crypto");
const {readSquare, clockwiseSpiral, uniqueFibonacciPrimeRanks, primeList} =
  require("./fibonacci_prime_spiral.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
/** @param {Buffer} byteSequence @returns {{printable:number,alphaRun:number,preview:string}} */
function measure(byteSequence) {
  let printable = 0, consecutive = 0, alphaRun = 0;
  for (const byte of byteSequence) {
    if (byte >= 32 && byte < 127) printable++;
    consecutive = ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122))
      ? consecutive + 1 : 0;
    alphaRun = Math.max(alphaRun, consecutive);
  }
  return {
    printable, alphaRun,
    preview: [...byteSequence.subarray(0, 64)].map((b) =>
      b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("")
  };
}
/** @param {string} mode @param {Buffer} key @param {Buffer} input @returns {Buffer} */
function cryptoPass(mode, key, input) {
  const iv = mode === "aes-256-ecb" ? null : Buffer.alloc(16);
  const dec = createDecipheriv(mode, key, iv);
  if (mode !== "aes-256-ctr") dec.setAutoPadding(false);
  return Buffer.concat([dec.update(input), dec.final()]);
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const authenticHTML = read("resources/historical/cicada2014-onion7-original-index.html");
assert.match(authenticHTML, /<title>133<\/title>/u);
assert.match(authenticHTML, /<div id="331">/u);
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const runes = new Set(corpus.runes);
assert.equal(runes.size, 29);
const words = transcript.split("%").slice(0, 55).join("")
  .replace(/[\/\n\r\s&$§]/gu, "")
  .split(/[-.]/u).filter((w) =>
    w.length > 0 && Array.from(w).every((c) => runes.has(c)));
const allRunes = words.join("");
const original = corpus.pages.filter((p) => p.page <= 55).flatMap((p) =>
  p.indices.map((i) => corpus.runes[i])).join("");
assert.equal(words.length, 2896);
assert.equal(allRunes.length, 12956);
assert.equal(allRunes, original);
const ranks = uniqueFibonacciPrimeRanks();
assert.deepEqual(ranks,
  [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
const square = readSquare();
const printedSpiral = clockwiseSpiral().map(([row,col]) => square[row][col]);
const primes = primeList(Math.max(...ranks));
assert.deepEqual(printedSpiral,
  ranks.map((rank) => Math.abs(3301-primes[rank-1])));
const twinPrimes = primeList(464);
assert.equal(twinPrimes[462], 3299);
assert.equal(twinPrimes[463], 3301);
const gpPrime = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
/** @param {string} word @returns {number} */
function sumGP(word) {
  return Array.from(word).reduce((s,c) => s + gpPrime.get(c), 0);
}
const sums = words.map(sumGP);
const sourceWordSums = ranks.map((rank) => sums[rank-1]);
assert.deepEqual(sourceWordSums,
  [347,315,160,122,563,133,618,64,69,463,139,464,5,238,124,25]);
assert.equal(sums[8], 133);
assert.equal(sums[55], 463);
assert.equal(sums[144], 464);
const targetAddresses = [
  {ordinal:9, expected:133, meaning:"2014 signed-stage index HTML title"},
  {ordinal:56, expected:463, meaning:"prime ordinal of original p15 red 3299"},
  {ordinal:145, expected:464, meaning:"prime ordinal of Cicada 3301"}
];
const matchClasses = targetAddresses.map((target) => {
  const expectedLength = Array.from(words[target.ordinal-1]).length;
  const matches = [];
  let eligible = 0;
  for (let i = 0; i < words.length; i++) {
    if (Array.from(words[i]).length !== expectedLength) continue;
    eligible++;
    if (sums[i] === target.expected) matches.push(i+1);
  }
  return {ordinal:target.ordinal, gpPrimeSum:target.expected,
    length:expectedLength, sameLengthPopulation:eligible,
    sameLengthMatches:matches, meaning:target.meaning};
});
assert.deepEqual(matchClasses.map((x) =>
  [x.length,x.sameLengthPopulation,x.sameLengthMatches.length]),
  [[3,720,12],[9,78,1],[8,156,1]]);
const conditionalExactRate = matchClasses.reduce((p,x) =>
  p*x.sameLengthMatches.length/x.sameLengthPopulation,1);
const key = Buffer.alloc(32);
for (let i=0;i<sourceWordSums.length;i++)
  key.writeUInt16BE(sourceWordSums[i],2*i);
assert.equal(key.toString("hex"),
  "015b013b00a0007a02330085026a0040004501cf008b01d0000500ee007c0019");
const tableBytes = Buffer.from(grid.pages.flatMap((p) => p.bytes));
assert.equal(tableBytes.length, 256);
const modes = ["aes-256-ctr", "aes-256-cbc", "aes-256-ecb"];
const cipherTests = modes.map((mode) => {
  const originalCandidate = cryptoPass(mode,key,tableBytes);
  const artificial = Buffer.alloc(256, 0x41);
  const iv = mode === "aes-256-ecb" ? null : Buffer.alloc(16);
  const enc = createCipheriv(mode, key, iv);
  if (mode !== "aes-256-ctr") enc.setAutoPadding(false);
  const encrypted = Buffer.concat([enc.update(artificial),enc.final()]);
  assert.deepEqual(cryptoPass(mode,key,encrypted),artificial);
  return {mode, ...measure(originalCandidate),
    outputFirst16:originalCandidate.subarray(0,16).toString("hex"),
    plantedExact:true};
});
assert.ok(cipherTests.every((x) => x.printable < 140 && x.alphaRun <= 6));
console.log(JSON.stringify({
  classification:"conditional cross-artifact clue and bounded failed raw AES-256 consumer; no unknown plaintext",
  sourceWordOrdinals:ranks,
  sourceWordPrimeSums,
  threeSourceMatches:matchClasses,
  conditionalExactTripleRateWithinLengthClasses:conditionalExactRate,
  caution:"Retrospective target selection and 2016 clue: rate is not a discovery-adjusted p-value",
  sourceDerivedAES256Key:key.toString("hex"),
  p50ByteLayer:"provisional base60 256 raw cell bytes",
  cipherTests
},null,2));
console.log("PASS: original source Fibonacci-globalword 2014-index/twin-rank and AES256");
