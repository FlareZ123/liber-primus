"use strict";

/**
 * Source-selected-coordinate hypothesis, NOT an authenticated LP2 decryption.
 *
 * The 2014 archived seventh-onion HTML contains 133 / 331, and original LP2
 * physical pages 0-2 contain 729 GP runes. This finite SFT documents the
 * post-observation 27x27 quotient/remainder mapping to the first four blocks
 * already proposed by the external 27x27 researcher.
 *
 * Run on Node.js 22 from any working directory; no network or file writes.
 * The full map and several transition choices were already publicly fitted
 * to English; reproducing them cannot establish an unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const html = fs.readFileSync(path.join(root, "resources", "cicada2014-onion7-index.html"), "utf8");
const transcription = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const titleMatch = html.match(/<title>(\d+)<\/title>/i);
const idMatch = html.match(/<div id="(\d+)"/i);
assert.ok(titleMatch && idMatch, "Archived index must expose exactly the two source numbers");
const title = Number(titleMatch[1]);
const divId = Number(idMatch[1]);
assert.deepEqual([title, divId], [133, 331]);

const stream = corpus.pages.filter(p => p.page >= 0 && p.page <= 2).flatMap(p => p.indices);
const width = Math.sqrt(stream.length);
assert.ok(Number.isInteger(width) && width === 27 && stream.length === 729);
const red = ink.pages.find(p => p.page === 0).red_spans[0];
assert.deepEqual([red.start, red.length], [0, 13]);
const redParts = transcription.split(/\r?\n/, 1)[0].split(".")[0].split("-").map(s => [...s].length);
assert.deepEqual(redParts, [8, 5]);

/** @param {number} n positive integer @returns {number} Euler totient */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let r = n, rest = n;
  for (let d = 2; d * d <= rest; d++) if (rest % d === 0) {
    while (rest % d === 0) rest /= d;
    r -= r / d;
  }
  if (rest > 1) r -= r / rest;
  return r;
}

/** @param {number} n positive integer @returns {number} Mobius value */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n, sign = 1;
  for (let d = 2; d * d <= rest; d++) if (rest % d === 0) {
    rest /= d;
    sign = -sign;
    if (rest % d === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} r one-based row @param {number} c one-based column @returns {number} zero-based flat cell */
function pos(r, c) {
  assert.ok(Number.isInteger(r) && r >= 1 && r <= width);
  assert.ok(Number.isInteger(c) && c >= 1 && c <= width);
  return (r - 1) * width + c - 1;
}

/** @param {number} i zero-based flat cell @returns {[number,number]} one-based (row,column) */
function rc(i) {
  assert.ok(Number.isInteger(i) && i >= 0 && i < stream.length);
  return [1 + Math.floor(i / width), 1 + i % width];
}

/** @param {number[]} k unrotated GP key @returns {number[]} Mobius-aligned three-symbol key */
function phaseKey(k) {
  const phase = ((k.map(x => mu(phi(x))).reduce((a, b) => a + b, 0) % 3) + 3) % 3;
  return k.slice(phase).concat(k.slice(0, phase));
}

/** @param {number[]} spots flat ciphertext cells @param {number[]} key three-symbol key @returns {string} */
function decode(spots, key) {
  assert.equal(key.length, 3);
  return spots.map((i, j) => corpus.translit[(stream[i] - key[j % 3] + 29) % 29]).join("");
}

/** @param {number[]} spots ciphertext cells @param {number[]} key three-symbol key @returns {number[]} */
function roundTrip(spots, key) {
  const p = spots.map((i, j) => (stream[i] - key[j % 3] + 29) % 29);
  return p.map((x, j) => (x + key[j % 3]) % 29);
}

const qTitle = Math.floor(title / width), rTitle = title % width;
const qDiv = Math.floor(divId / width), rDiv = divId % width;
assert.deepEqual([qTitle, rTitle, qDiv, rDiv], [4, 25, 12, 7]);
assert.equal(corpus.prime ? red.length : -1, 13);
const redSum = stream.slice(0, red.length).reduce((total, n) => total + corpus.prime[n], 0);
assert.equal(redSum, 2 * divId);

// Block 1: Red 13 selects row, div-ID quotient selects key-center column;
// title remainder selects cipher start; div-ID remainder selects length.
const node1 = [pos(red.length, qDiv - 1), pos(red.length, qDiv), pos(red.length, qDiv + 1)];
assert.deepEqual(node1, [334, 335, 336]);
const raw1 = node1.map(i => stream[i]);
assert.deepEqual(raw1, [25, 11, 28]);
const key1 = phaseKey([raw1[0], phi(raw1[1]), raw1[2]]);
assert.deepEqual(key1, [25, 10, 28]);
const spots1 = Array.from({ length: rDiv }, (_, i) => pos(red.length, rTitle) + i);
assert.deepEqual(spots1, [348, 349, 350, 351, 352, 353, 354]);
assert.equal(rc(spots1.at(-1))[1], qTitle);
assert.equal(decode(spots1, key1), "ASIGOTHE");

// Block 2: Overlap the previous endpoint with the next 3-rune source node.
// The center of an odd-width square fixes the ciphertext start; the remainder
// of the two original HTML values' sum supplies the block length.
const raw2 = stream.slice(spots1.at(-1), spots1.at(-1) + 3);
assert.deepEqual(raw2, [14, 22, 14]);
const derived2 = [raw2[0], phi(raw2[1]), raw2[2]];
const key2 = phaseKey(derived2);
assert.deepEqual(key2, [14, 14, 10]);
const center = (width + 1) / 2;
const len2 = (title + divId) % width;
assert.deepEqual([center, len2], [14, 5]);
const spots2 = Array.from({ length: len2 }, (_, i) => pos(center, center) + i);
assert.deepEqual(spots2, [364, 365, 366, 367, 368]);
assert.equal(decode(spots2, key2), "WEATHER");

// Block 3: Continue one cell past the previous block; use phi(I)=4 for the
// shift to a vertical source center, and I=10 for its radius. Vertical source,
// no center transform, and upward ciphertext direction remain chosen rules.
const start3 = spots2.at(-1) + 1;
assert.deepEqual(rc(start3), [14, 19]);
const shift3 = phi(derived2[1]);
const radius3 = derived2[1];
const node3 = [pos(center - radius3, rc(start3)[1] + shift3), pos(center, rc(start3)[1] + shift3), pos(center + radius3, rc(start3)[1] + shift3)];
assert.deepEqual(node3, [103, 373, 643]);
const raw3 = node3.map(i => stream[i]);
assert.deepEqual(raw3, [8, 21, 5]);
const key3 = phaseKey(raw3);
assert.deepEqual(key3, raw3);
const spots3 = Array.from({ length: len2 }, (_, i) => start3 - width * i);
assert.deepEqual(spots3, [369, 342, 315, 288, 261]);
assert.equal(decode(spots3, key3), "TURNS");

// Block 4: phi(NG)=12 selects down-12 from block-3 start for the source center
// and left-12 for the next ciphertext start. The same HTML quotient is 12.
// The title quotient supplies four runes; upward path retains block-3 direction.
const delta4 = phi(raw3[1]);
assert.equal(delta4, qDiv);
const [r3, c3] = rc(start3);
const center4 = pos(r3 + delta4, c3);
const node4 = [center4 - width, center4, center4 + width];
assert.deepEqual(node4, [666, 693, 720]);
const raw4 = node4.map(i => stream[i]);
assert.deepEqual(raw4, [8, 2, 8]);
const key4 = phaseKey([raw4[0], phi(raw4[1]), raw4[2]]);
assert.deepEqual(key4, [1, 8, 8]);
const spots4 = Array.from({ length: qTitle }, (_, i) => pos(r3, c3 - delta4) - width * i);
assert.deepEqual(spots4, [357, 330, 303, 276]);
assert.equal(rc(spots4[0])[1], rDiv);
assert.equal(decode(spots4, key4), "COLD");

const blocks = [[spots1, key1], [spots2, key2], [spots3, key3], [spots4, key4]];
for (const [n, [spots, key]] of blocks.entries()) {
  assert.deepEqual(roundTrip(spots, key), spots.map(i => stream[i]), "Exact forward key invariant at block " + (n + 1));
  console.log("BLOCK", n + 1,
    "cipher=", spots.map(i => corpus.translit[stream[i]]).join(""),
    "key=", key.map(x => corpus.translit[x]).join("-"),
    "source_start=", rc(spots[0]).join(":"),
    "runes=", spots.length,
    "candidate=", decode(spots, key));
}
const alt = {};
for (const [name, step] of Object.entries({ up: -width, down: width, right: 1, left: -1 })) {
  const cells = Array.from({ length: len2 }, (_, i) => start3 + i * step);
  alt[name] = decode(cells, key3);
}
assert.deepEqual(alt, { up: "TURNS", down: "TCPYX", right: "TXLMF", left: "TYIARNG" });
console.log("BLOCK3-DIRECTION-CONTROLS", JSON.stringify(alt));
console.log("CANDIDATE ONLY: already published 27x27 positions, retrospective HTML address mapping, no uniquely source-selected transition or authenticated plaintext.");
