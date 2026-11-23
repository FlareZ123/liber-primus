"use strict";
/**
 * Full-book, literal SHED-center original-input gate.
 * Node.js 22 CommonJS. Read-only source-only SFT with genuine GP29 English controls.
 * Human cue: solved LP2 p57 asks readers to shed their circumferences.
 * Test exactly one center from each complete odd-length printed word, in source order.
 * No candidate key, cipher fitting, regex word split, or original plaintext guessing.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeByGlyph = new Map(corpus.runes.map((r, i) => [r, i]));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

/** Only printed punctuation ends words; printed lines and pages do not. */
function parseWords(input) {
  const words = [];
  let current = [];
  for (const ch of input) {
    if (runeByGlyph.has(ch)) {
      current.push(runeByGlyph.get(ch));
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      continue;
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const words = parseWords(transcription.split("%").slice(0, 55).join("%"));
const authentic = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(words.length, 2896, "Complete authentic printed words");
assert.equal(authentic.length, 12956, "All encrypted original runes");
assert.deepEqual(words.flat(), authentic, "Exact original source consistency");

const oddWords = words.filter((w) => (w.length & 1) === 1);
const centers = oddWords.map((w) => w[(w.length - 1) / 2]);
assert.equal(oddWords.length, 1450);
assert.equal(centers.length, 1450);

function coincidence(values) {
  const freq = new Array(29).fill(0);
  for (const i of values) freq[i]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}
const originalIoc = coincidence(centers);
assert(Math.abs(originalIoc - 0.03438947193070132) < 1e-15);

/** The only immediately authored-looking use is the solved p56 additive GP29 cipher.
 * Grant either global or page-reset 1,450-rune key clock, both signs,
 * with the extracted tape frozen as side material. No fitted initial phase.
 * A tape derived from ciphertext itself is not proof of cipher invertibility;
 * the forward replay is valid only with the frozen tape supplied separately.
 */
const pages = corpus.pages.filter((p) => p.page <= 55);
const directPadReceivers = [];
let bookOffset = 0;
for (const [clock, sign] of [
  ["book-global", -1], ["book-global", 1],
  ["page-reset", -1], ["page-reset", 1]
]) {
  const output = [];
  let start = 0;
  for (const page of pages) {
    for (let j = 0; j < page.indices.length; j++) {
      const keyIndex = clock === "book-global" ? start + j : j;
      const value = page.indices[j];
      const key = centers[keyIndex % centers.length];
      const plaintext = (value + sign * key + 29) % 29;
      const reencryption = (plaintext - sign * key + 29) % 29;
      assert.equal(reencryption, value, "Every original rune re-encodes with fixed tape");
      output.push(plaintext);
    }
    start += page.indices.length;
  }
  assert.equal(output.length, 12956);
  directPadReceivers.push({
    clock, sign,
    fullIoc: coincidence(output),
    openingIoc: coincidence(output.slice(0, 729)),
    floralIoc: coincidence(output.slice(9640, 12648))
  });
}
assert.deepEqual(directPadReceivers.map((v) => v.fullIoc), [
  0.03450184807433621, 0.034461727720423926,
  0.034491016651198025, 0.03447829062269244
]);

const gpTokens = corpus.translit.map((name, i) => ({ name, i }))
  .sort((a, b) => b.name.length - a.name.length);
function latinToGp(source) {
  let word = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  while (word.length) {
    const matched = gpTokens.find((token) => word.startsWith(token.name));
    if (!matched) return null;
    result.push(matched.i);
    word = word.slice(matched.name.length);
  }
  return result;
}

let state = 0x3301b3a7;
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const controls = [];
for (const [name, filename, expectedWords] of [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 15733],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 77932],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 55407]
]) {
  const pool = new Map();
  for (const token of read(filename).match(/[A-Za-z]+/g)) {
    const gp = latinToGp(token);
    if (gp === null) continue;
    if (!pool.has(gp.length)) pool.set(gp.length, []);
    pool.get(gp.length).push(gp);
  }
  assert.equal([...pool.values()].reduce((sum, a) => sum + a.length, 0), expectedWords);
  const icValues = [];
  for (let run = 0; run < 1000; run++) {
    const heldout = oddWords.map((w) => {
      const candidateWords = pool.get(w.length);
      assert(candidateWords && candidateWords.length > 0, "Matched-length native donor exists");
      return candidateWords[random32() % candidateWords.length][(w.length - 1) / 2];
    });
    icValues.push(coincidence(heldout));
  }
  const min = Math.min(...icValues);
  const max = Math.max(...icValues);
  const mean = icValues.reduce((sum, x) => sum + x, 0) / icValues.length;
  assert(min > originalIoc, "All native-GP controls discriminate actual unaltered center tape");
  controls.push({ name, controls: icValues.length, min, mean, max, atOrBelowOriginal: 0 });
}


console.log(JSON.stringify({
  status: "PASS",
  source: "Original physical LP2 p0-p55, canonical complete printed words",
  rule: "Shed first and last from each complete printed word repeatedly, retain exactly one central rune when a word has odd length, read in printed order",
  original: {
    runes: authentic.length, completeWords: words.length, oddCenterRunes: centers.length,
    observedIoc: originalIoc,
    first60GP: centers.slice(0, 60).map((v) => corpus.translit[v]).join(" ")
  },
  controls,
  directPadReceivers,
  interpretation: "Literal whole-book odd-center reading does not directly yield conventional native-GP prose. It neither disproves SHED as a key extraction nor tests a changing value cipher or changed word breaks."
}, null, 2));
