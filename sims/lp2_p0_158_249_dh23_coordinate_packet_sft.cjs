"use strict";
/**
 * Original-source test of a geometric GP29/DH23 packet at the p50
 * 158 <-> 249 reciprocal byte addresses.
 *
 * Scope: source-count/page-layout arithmetic and one previously reported
 * conditional p0 WILL inverse. This does not authenticate the address rule,
 * derive a general cipher or recover new plaintext.
 *
 * Run from Windows 11 with Node.js 22:
 *   node sims/lp2_p0_158_249_dh23_coordinate_packet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number} base @param {number} exp @param {number} mod @returns {number} */
function powmod(base, exp, mod) {
  let x = 1;
  for (let i = 0; i < exp; i++) x = x * base % mod;
  return x;
}
/** @param {number} a @returns {number} */
function inv29(a) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) return b;
  throw new Error("Noninvertible GF29 element: " + a);
}

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const words = parseSharedCorpus();

assert.equal(words.words.length, 2896);
assert.equal(words.runeCount, 12956);
assert.equal(words.crossPageWords, 32);
assert.equal(gp.pages[0].indices.length, 262);
assert.equal(ink.physical_zero_based.red_words.reduce((s, w) => s + w.length, 0), 13);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);

const black = gp.pages[0].indices.length - 13;
const chapterWords = words.byStartPage.slice(0, 3).reduce((n, page) => n + page.length, 0);
assert.equal(black, 249);
assert.equal(chapterWords, 158);

const tokens = grid.pages.flatMap((page) => page.tokens);
const symbols = grid.alphabet;
assert.equal(tokens.length, 256);
assert.equal(symbols.length, 60);
/** @param {string} t @returns {number} */
function base60(t) {
  assert.equal(t.length, 2);
  const a = symbols.indexOf(t[0]), b = symbols.indexOf(t[1]);
  assert(a >= 0 && b >= 0);
  return a * 60 + b;
}
const bytes = tokens.map(base60);
assert(bytes.every((n) => n >= 0 && n <= 255));
assert.deepEqual(bytes, grid.bytes);
assert.equal(tokens[158], "49");
assert.equal(tokens[249], "2c");
assert.equal(bytes[158], 249);
assert.equal(bytes[249], 158);
const twocycles = [];
for (let i = 0; i < bytes.length; i++) {
  const j = bytes[i];
  if (j !== i && i < j && bytes[j] === i) twocycles.push([i, j]);
}
assert.deepEqual(twocycles, [[158, 249]]);

/** @param {number} cell @returns {[number,number]} */
const rc = (cell) => [Math.floor(cell / 8), cell % 8];
const lo = rc(chapterWords), hi = rc(black);
assert.deepEqual(lo, [19, 6]);
assert.deepEqual(hi, [31, 1]);

// Source-observed geometry yields the exact independently reported
// p28/p38 DH23 packet. Role assignments below are hypotheses, NOT clues.
const B = lo[0], a = lo[1];
const Ka = hi[0] - lo[0], g = lo[1] - hi[1];
const Kgp = mod29(Ka * inv29(a));
const p = 23;
const A = powmod(g, a, p);
const Kdh = powmod(B, a, p);
assert.deepEqual({B, a, Ka, g, Kgp, A, Kdh},
  {B: 19, a: 6, Ka: 12, g: 5, Kgp: 2, A: 8, Kdh: 2});
assert.deepEqual(gp.pages[38].indices.slice(54, 57), [g, Ka, B]);

// Conditional PRE-EXISTING candidate: 2016 source YOU -> p50[30] -> p0
// whole word offset141, using p28's H(A,B) last two pad entries.
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert(signed.includes("YOU WILL BE FOUND"));
const you = [26, 3, 1];
const youAddress = you.reduce((s, n) => s + n, 0);
assert.equal(youAddress, 30);
assert.equal(tokens[youAddress], "2L");
const receiver = bytes[youAddress];
assert.equal(receiver, 141);
const cipher = gp.pages[0].indices.slice(receiver, receiver + 4);
assert.deepEqual(cipher, [19, 16, 9, 18]);
const key = [Ka, a, mod29(A - B), mod29(A + B)];
assert.deepEqual(key, [12, 6, 18, 27]);
const output = cipher.map((n, i) => mod29(n - key[i]));
assert.deepEqual(output, [7, 10, 20, 20]); // W I L L in the authentic GP29 chart
assert.deepEqual(output.map((n, i) => mod29(n + key[i])), cipher);

console.log(JSON.stringify({
  original: {runes: 12956, words: 2896, p0Black: black, openingWords: chapterWords},
  p50: {uniqueNontrivialTwoCycle: twocycles[0], tokens: [tokens[158], tokens[249]],
    coordinates: {chapter: lo, black: hi}},
  conditionalDhPacket: {B, a, Ka, g, Kgp, A, Kdh, p},
  p38IndependentSlice: gp.pages[38].indices.slice(54, 57),
  existingConditionalWill: {recipient: receiver, cipher, key,
    gpDecoded: output.map((n) => gp.translit[n]).join("")},
  conclusion: "New source-count -> p50 coordinate -> reported DH-operand bridge. No new plaintext or authenticated cipher."
}, null, 2));
