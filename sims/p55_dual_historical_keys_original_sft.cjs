"use strict";

/**
 * Source-fixed p55 dual-key original-input gate.
 * Historical keys: FIRFUMFERENFE (CIRCUMFERENCE), DIVINITY (V -> U).
 * The p55 first rune is a carry from p54, followed by 16 complete starts.
 * This test changes all 76 glyphs reversibly; no null/rune is discarded.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.find(p => p.page === 55).indices;
const lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const mod29 = n => ((n % 29) + 29) % 29;
const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} input @returns {number[]} */
function nativeGp(input) {
  const output = [];
  for (let word of input.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    for (let pos = 0; pos < word.length;) {
      const token = tokens.find(t => word.startsWith(t.token, pos));
      assert(token, "Unmapped GP control token in " + word.slice(pos));
      output.push(token.index);
      pos += token.token.length;
    }
  }
  return output;
}
const circumference = nativeGp("FIRFUMFERENFE");
const divinity = nativeGp("DIVINITY");

/** @typedef {{word:number, within:number, edge:boolean}} Position */
/** @type {Position[]} */
const positions = [];
for (let word = 0; word < lengths.length; word++) {
  for (let within = 0; within < lengths[word]; within++) {
    positions.push({
      word, within,
      edge: lengths[word] <= 2 || within === 0 || within === lengths[word] - 1
    });
  }
}
assert.equal(positions.length, 76);
assert.equal(original.length, 76);
assert.equal(positions.filter(p => p.edge).length, 33);
assert.equal(positions.filter(p => !p.edge).length, 43);
assert.equal(circumference.length, 13);
assert.equal(divinity.length, 8);
assert.equal(
  crypto.createHash("sha256")
    .update(fs.readFileSync(path.join(root, "resources/liber-primus/72.jpg")))
    .digest("hex"),
  "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
  "original p55 source JPEG changed"
);

/** @typedef {"channel"|"word"|"page"} Clock */
/**
 * A printed literal F can be taken as an unencrypted, non-consuming interrupter,
 * matching the known solved-page convention. This is a full-string invertible
 * operation because its raw GP value 0 is preserved as 0.
 *
 * @param {number[]} source
 * @param {Clock} clock
 * @param {boolean} interruptF
 * @param {boolean} swapped
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(source, clock, interruptF, swapped, encrypt) {
  const result = [];
  let outer = 0;
  let inner = 0;
  let page = 0;
  let wordCount = 0;
  for (let i = 0; i < source.length; i++) {
    const place = positions[i];
    if (place.within === 0) wordCount = 0;
    const key = swapped
      ? (place.edge ? divinity : circumference)
      : (place.edge ? circumference : divinity);
    const phase = clock === "channel"
      ? (place.edge ? outer : inner)
      : clock === "word" ? wordCount : page;
    const current = source[i];
    const skip = interruptF && current === 0;
    result.push(skip ? 0 : mod29(current + (encrypt ? 1 : -1) * key[phase % key.length]));
    if (!skip) {
      if (place.edge) outer++;
      else inner++;
      page++;
      wordCount++;
    }
  }
  return result;
}

/**
 * For an F-interrupter interpretation, a decoded non-F symbol cannot become
 * the value F through the keyed transformation if that would make encryption
 * ambiguous. Reject such plants; all unchanged original-cipher re-encodings
 * are only invariant checks, not evidence that this is the historical cipher.
 *
 * @param {number[]} sequence
 * @returns {number}
 */
function ioc(sequence) {
  const count = Array(29).fill(0);
  for (const v of sequence) count[v]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/** @param {number[]} training */
function trigramModel(training) {
  const counts = new Map();
  for (let i = 2; i < training.length; i++) {
    const tri = training[i - 2] * 841 + training[i - 1] * 29 + training[i];
    counts.set(tri, (counts.get(tri) || 0) + 1);
  }
  const denominator = training.length - 2 + 0.1 * (29 ** 3);
  /** @param {number[]} input */
  return input => {
    let total = 0;
    for (let i = 2; i < input.length; i++) {
      const tri = input[i - 2] * 841 + input[i - 1] * 29 + input[i];
      total += Math.log(((counts.get(tri) || 0) + 0.1) / denominator);
    }
    return total / (input.length - 2);
  };
}
const reference = nativeGp(load("resources/control/gibran_prophet_58585.txt"));
assert.equal(reference.length, 62696);
const model = trigramModel(reference.slice(0, 40000));
const heldout = reference.slice(40000);
const heldoutScores = [];
for (let i = 0; i + 76 <= heldout.length; i++) {
  heldoutScores.push(model(heldout.slice(i, i + 76)));
}
heldoutScores.sort((a, b) => a - b);
assert.equal(heldoutScores.length, 22621);

/** @param {number[]} data */
const render = data => data.map(i => corpus.translit[i]).join("");
const rows = [];
for (const clock of ["channel", "word", "page"]) {
  for (const interruptF of [false, true]) {
    for (const swapped of [false, true]) {
      const decoded = transform(original, clock, interruptF, swapped, false);
      const score = model(decoded);
      const heldBelow = heldoutScores.filter(x => x <= score).length;
      rows.push({clock, interruptF, swapped, score, ioc: ioc(decoded),
        heldBelow, output: render(decoded)});
      assert.equal(decoded.length, 76);
      if (!interruptF) {
        assert.deepEqual(transform(decoded, clock, false, swapped, true), original);
        const plant = reference.slice(1000, 1076);
        const encrypted = transform(plant, clock, false, swapped, true);
        assert.deepEqual(transform(encrypted, clock, false, swapped, false), plant);
      }
    }
  }
}
assert.equal(rows.length, 12);
assert(rows.every(r => r.heldBelow === 0), "An original decode enters a native control range");
console.log(JSON.stringify({
  original: render(original),
  p55Sha256: "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
  keys: {circumference, divinity},
  segmentation: lengths, exterior: 33, interior: 43,
  controls: {trainingRunes: 40000, heldoutRunes: heldout.length,
    heldoutWindows: heldoutScores.length,
    worstNativeScore: heldoutScores[0],
    bestNativeScore: heldoutScores[heldoutScores.length - 1]},
  rows
}, null, 2));
