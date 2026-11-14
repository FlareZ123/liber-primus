"use strict";
/**
 * Signed-2016 word-map pixel gate on authentic LP2 ciphertext.
 *
 * A source-informed but unverified interpretation of the signed phrase
 * "its words are the map ... their numbers are the direction": interpret
 * each complete printed word using the historical 2013 BASE29 operation,
 * then map the integer to the signed tree carrier's two prime pixel axes
 * (x mod 563, y mod 569). This tests a natural one-pixel-per-word
 * point selector without tuning a start, symbol key, threshold or route.
 *
 * Run: node sims/lp2_2016_wordmap_pixel_coordinates_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const jpeg = require("./vendor/jpeg-js-decoder.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {Buffer} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative));
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const source = read("resources/liber-primus/lp2-transcription.txt").toString("utf8")
  .split("%").slice(0, 55).join("%");
const idx = new Map(corpus.runes.map((r, i) => [r, i]));
/** @type {number[][]} */
const words = [];
/** @type {number[]} */
let current = [];
let count = 0;
for (const ch of source) {
  if (idx.has(ch)) {
    current.push(idx.get(ch));
    count++;
  } else if ("-.$&§0123456789".includes(ch) && current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.equal(count, 12956);
assert.equal(words.length, 2896);
const target = words.filter(w => w.length >= 4);
const image = jpeg(read("resources/historical/cicada2016-4gq25.jpg"),
  {useTArray: true, formatAsRGBA: false, maxResolutionInMP: 2});
assert.equal(image.width, 563);
assert.equal(image.height, 569);
const width = image.width;
const height = image.height;
/** @param {number[]} letters @returns {[number, number]} */
function point(letters) {
  let x = 0, y = 0;
  for (const digit of letters) {
    x = (x * 29 + digit) % width;
    y = (y * 29 + digit) % height;
  }
  return [x, y];
}
/** @param {number[]} letters @param {Uint8Array} data @returns {number} */
function darkness(letters, data) {
  const [x, y] = point(letters);
  const k = 3 * (y * width + x);
  return 255 - (data[k] + data[k + 1] + data[k + 2]) / 3;
}
const observed = target.reduce((sum, w) => sum + darkness(w, image.data), 0) / target.length;
let state = 0x20165635;
/** @returns {number} */
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 5000;
let higher = 0, nullTotal = 0, nullSq = 0;
for (let trial = 0; trial < trials; trial++) {
  let sum = 0;
  for (const w of target) {
    const shuffled = w.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    sum += darkness(shuffled, image.data);
  }
  const mean = sum / target.length;
  higher += Number(mean >= observed);
  nullTotal += mean;
  nullSq += mean * mean;
}
const mean = nullTotal / trials;
const variance = Math.max(0, nullSq / trials - mean * mean);
const positions = target.map(point);
const planted = Uint8Array.from(image.data);
for (const [x, y] of positions) {
  const k = 3 * (y * width + x);
  planted[k] = 0;
  planted[k + 1] = 0;
  planted[k + 2] = 0;
}
const plantedRead = target.map(w => darkness(w, planted));
assert.equal(plantedRead.filter(x => x === 255).length, target.length);
const result = {
  hypothesis: "Original LP2 word BASE29 values select points in the signed-2016 tree",
  status: "Source-motivated proposed consumer; not a signed decoder instruction",
  originalRunes: count,
  originalWords: words.length,
  sampledWords: target.length,
  reasonForMinLength: "29^4 = 707281 exceeds both the 563x569 image address area and each axis",
  imageDimensions: [width, height],
  originalMeanPixelDarkness: observed,
  wordInternalRuneShuffleTrials: trials,
  shuffledMeanPixelDarkness: mean,
  shuffledSdPixelDarkness: Math.sqrt(variance),
  upperTailProbability: (higher + 1) / (trials + 1),
  plantedAllPointsDark: plantedRead.length,
  firstTenSourcePixelPoints: positions.slice(0, 10),
  independentPlaintextRecovered: false
};
console.log(JSON.stringify(result, null, 2));
