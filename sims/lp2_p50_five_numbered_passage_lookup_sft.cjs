"use strict";

/**
 * Source-typed original p50 high/low digit book-lookup hypothesis.
 *
 * The 256 physically printed p49–51 cells are two-character tokens with
 * first digit '0'..'4' and second digit a source-attested base60 digit.
 * The original p36–38 artwork prints exactly five numbered passages 1..5.
 * Decode token ab as rune at offset b (zero based) of numbered passage a+1.
 * All 256 book coordinates must be valid in the unmodified first 60 runes
 * of each passage. This yields a fully specified 256-rune candidate stream.
 * Compare its direct and fixed C-K/C+K consumers with original prose, then
 * test the exact p55+p56+p57 terminal-256 alignment against solved p56 and
 * clear p57 using the established prime-minus-one operation.
 *
 * This is a source-led negative gate, not a claim of recovered plaintext.
 * Windows 11 Node.js 22, single runnable SFT:
 * node sims/lp2_p50_five_numbered_passage_lookup_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const text = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(text("resources/liber-primus/base60-grid.json"));
const source = text("resources/liber-primus/lp2-transcription.txt");
const pageSegments = source.split("%");
const numberedSection = pageSegments.slice(36, 39).join("\n");
const labelPattern = /([1-5])-/g;
const labels = Array.from(numberedSection.matchAll(labelPattern),
  found => ({n: Number(found[1]), offset: found.index}));
assert.deepEqual(labels.map(x => x.n), [1, 2, 3, 4, 5],
  "five physically numbered original p36–38 blocks");
const glyphIndex = new Map(gp.runes.map((r, i) => [r, i]));
const sourceEnd = numberedSection.indexOf("&", labels[4].offset);
assert(sourceEnd > labels[4].offset);
const paragraphs = labels.map((label, i) => {
  const end = labels[i + 1]?.offset ?? sourceEnd;
  const part = numberedSection.slice(label.offset + 2, end);
  return Array.from(part).filter(x => glyphIndex.has(x))
    .map(x => glyphIndex.get(x));
});
assert.deepEqual(paragraphs.map(x => x.length),
  [139, 91, 98, 96, 129], "unchanged source numbered units");
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
const tokens = grid.rows.flat();
const one = grid.alphabet;
assert.equal(one.length, 60);
assert.equal(tokens.length, 256);
const ranges = new Int32Array(5);
const lookup = tokens.map((token, i) => {
  assert.equal(token.length, 2, "physical printed token exactly two digits");
  const passage = Number(token[0]);
  const offset = one.indexOf(token[1]);
  assert(Number.isInteger(passage) && passage >= 0 && passage <= 4);
  assert(offset >= 0 && offset < 60);
  assert(offset < paragraphs[passage].length, "in-range source rune slot " + i);
  ranges[passage]++;
  return paragraphs[passage][offset];
});
assert.equal(lookup.length, 256);
const allIn = ranges.reduce((sum, n) => sum + n, 0);
assert.equal(allIn, 256);
const ic = seq => {
  const counts = new Int32Array(29);
  seq.forEach(i => counts[i]++);
  return Array.from(counts).reduce((s, n) => s + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
};
const translit = seq => seq.map(i => gp.translit[i]).join("");
const shift = (cipher, key, sign) =>
  cipher.map((v, i) => (v + 29 + sign * key[i % key.length]) % 29);
const flank = [49, 51].flatMap(i => gp.pages[i].indices);
assert.equal(flank.length, 158);
const minus = shift(flank, lookup, -1);
const plus = shift(flank, lookup, +1);
const clear = gp.pages[57].indices;
const planted = shift(clear, lookup, +1);
assert.deepEqual(shift(planted, lookup, -1), clear,
  "source-selected key correctly inverses a planted native-GP sample");
const sourceOutput = {
  firstDigitCounts: Array.from(ranges),
  paragraphLengths: paragraphs.map(x => x.length),
  tableUnits: tokens.length,
  flankLength: flank.length,
  keyIoC: ic(lookup),
  keyPrefix: translit(lookup.slice(0, 100)),
  flankOriginalIoC: ic(flank),
  flankMinusIoC: ic(minus),
  flankPlusIoC: ic(plus),
  flankMinusFirst90: translit(minus.slice(0, 90)),
  flankPlusFirst90: translit(plus.slice(0, 90)),
  clearP57IoC: ic(clear)
};

const p55Original = gp.pages[55].indices;
const p56Cipher = gp.pages[56].indices;
const p57Clear = gp.pages[57].indices;
assert.deepEqual([p55Original.length, p56Cipher.length, p57Clear.length],
  [76, 85, 95], "original terminal page lengths");
assert.equal(p55Original.length + p56Cipher.length + p57Clear.length, 256,
  "fixed p55+p56+p57 terminal alignment");

function primesUpTo(limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1); sieve[0] = 0; sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++) if (sieve[p]) {
    for (let n = p * p; n <= limit; n += p) sieve[n] = 0;
  }
  return Array.from({length: limit + 1}, (_, i) => i).filter(i => sieve[i]);
}
const primes = primesUpTo(10000);
const p56Plain = [];
const p56RequiredKey = [];
let primeCursor = 0;
for (let i = 0; i < p56Cipher.length; i++) {
  if (i === 56) {
    assert.equal(p56Cipher[i], 0, "the source-transparent F is p56 local56");
    p56Plain.push(0);
    p56RequiredKey.push(0);
    continue;
  }
  const key = (primes[primeCursor] - 1) % 29;
  p56RequiredKey.push(key);
  p56Plain.push((p56Cipher[i] - key + 29) % 29);
  primeCursor++;
}
assert.equal(primeCursor, 84, "one literal F consumes no prime");
assert.equal(p56Cipher.filter(x => x === 0).length, 5,
  "four other ciphertext-F events remain encrypted");
assert.equal(translit(p56Plain.slice(0, 5)), "ANEND",
  "independent solved-p56 positive control");

const mismatchCount = (a, b) => {
  assert.equal(a.length, b.length);
  return a.reduce((n, x, i) => n + (x !== b[i] ? 1 : 0), 0);
};
const lookupP56 = lookup.slice(76, 161);
const lookupP57 = lookup.slice(161, 256);
const p56KeyMismatches = mismatchCount(lookupP56, p56RequiredKey);
const p56PlainMismatches = mismatchCount(lookupP56, p56Plain);
const p57PlainMismatches = mismatchCount(lookupP57, p57Clear);
assert.deepEqual([p56KeyMismatches, p56PlainMismatches, p57PlainMismatches],
  [84, 83, 93], "fixed terminal-256 known-plaintext/key holdout");

let p56InversePaths = [{ptr: 0, vals: [], literalFs: 0}];
for (const c of lookup) {
  const next = [];
  for (const state of p56InversePaths) {
    if (c === 0) {
      next.push({ptr: state.ptr, vals: [...state.vals, 0],
        literalFs: state.literalFs + 1});
    }
    const p = (c - (primes[state.ptr] - 1) + 29) % 29;
    next.push({ptr: state.ptr + 1, vals: [...state.vals, p],
      literalFs: state.literalFs});
  }
  p56InversePaths = next;
}
assert.equal(lookup.filter(x => x === 0).length, 7,
  "seven ciphertext-F branches in the 256-rune lookup");
assert.equal(p56InversePaths.length, 128,
  "exhaustive 2^7 literal/encrypted-F branch count");
const terminalPathStats = p56InversePaths.map(state => ({
  ptr: state.ptr, literalFs: state.literalFs, ioc: ic(state.vals),
  head: translit(state.vals.slice(0, 80))
}));
const terminalMaxIoC = Math.max(...terminalPathStats.map(x => x.ioc));
const terminalPointers = [...new Set(terminalPathStats.map(x => x.ptr))]
  .sort((a, b) => a - b);
assert.deepEqual(terminalPointers, [249, 250, 251, 252, 253, 254, 255, 256]);
assert(terminalMaxIoC < 0.04,
  "none of the 128 source-started p56 inverse paths is native-GP prose");
sourceOutput.terminal256Holdout = {
  pageLengths: [p55Original.length, p56Cipher.length, p57Clear.length],
  lookupOffsets: {p56: [76, 161], p57: [161, 256]},
  lookupP56RequiredKeyMismatches: p56KeyMismatches,
  lookupP56PlainMismatches: p56PlainMismatches,
  lookupP57PlainMismatches: p57PlainMismatches,
  p56CiphertextFPositions: p56Cipher.map((x, i) => x === 0 ? i : -1)
    .filter(i => i >= 0),
  lookupCiphertextFCount: lookup.filter(x => x === 0).length,
  p56InversePathCount: p56InversePaths.length,
  p56InverseFinalPrimePointers: terminalPointers,
  p56InverseMaxIoC: terminalMaxIoC,
  bestP56InverseHead: terminalPathStats
    .sort((a, b) => b.ioc - a.ioc)[0].head
};

console.log(JSON.stringify(sourceOutput, null, 2));
assert.equal(ic(lookup), 0.03939950980392157);
assert.equal(ic(clear), 0.06270996640537514);
assert(ic(minus) < 0.045 && ic(plus) < 0.045);
console.log("PASS: exact five-numbered-passage lookup is valid, but "
  + "direct/flank consumers and the fixed terminal-256/p56-prime "
  + "receiver holdouts do not produce authenticated native-GP plaintext.");
