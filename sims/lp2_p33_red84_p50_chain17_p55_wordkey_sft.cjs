"use strict";
/**
 * Original source-selected 17-node table chain and complete p55 word-key gate.
 * Original start: p33 local91 red8 GP0=84.
 * Original stop: p39 local119 red3 GP0=47.
 * Typed optional continuation: after 47, printed byte76 = entire original
 * physical p55 length76 (first carry rune and 16 full source words).
 *
 * Tests all four frozen per-word GP29 Caesar consumers, with no phase tuning,
 * exact untouched glyph boundaries, and full-length reverse-encode positives.
 *
 * Windows11 / Node.js 22: node sims/lp2_p33_red84_p50_chain17_p55_wordkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const lookup = new Map(gp.runes.map((rune, i) => [rune, i]));
const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
/** @param {string} token @returns {number} */
function b60(token) {
  const x = grid.alphabet.indexOf(token[0]);
  const y = grid.alphabet.indexOf(token[1]);
  assert.ok(x >= 0 && y >= 0);
  return 60 * x + y;
}
const bytes = tokens.map(b60);
/** @param {string} source @returns {number[]} */
function runicValues(source) {
  return [...source].filter((rune) => lookup.has(rune))
    .map((rune) => lookup.get(rune));
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0) /
    (seq.length * (seq.length - 1));
}
const start = ink.pages.find((p) => p.page === 33).red_spans
  .find((s) => s.start === 91);
const stop = ink.pages.find((p) => p.page === 39).red_spans
  .find((s) => s.start === 119);
assert.equal(start.length, 8);
assert.equal(stop.length, 3);
const startGP0 = runicValues(start.runes).reduce((a, b) => a + b, 0);
const stopGP0 = runicValues(stop.runes).reduce((a, b) => a + b, 0);
assert.equal(startGP0, 84);
assert.equal(stopGP0, 47);
const pathIndices = [startGP0];
const visited = new Set(pathIndices);
while (pathIndices.at(-1) !== stopGP0) {
  const next = bytes[pathIndices.at(-1)];
  assert.ok(!visited.has(next), "chain stops before p39 selected destination");
  visited.add(next);
  pathIndices.push(next);
}
assert.deepEqual(pathIndices,
  [84,173,117,171,54,156,52,86,111,115,247,192,0,203,68,199,47]);
const sourceValues = pathIndices.map((p) => bytes[p]);
assert.deepEqual(sourceValues,
  [173,117,171,54,156,52,86,111,115,247,192,0,203,68,199,47,76]);
assert.equal(bytes[stopGP0], 76);
assert.equal(pathIndices.length, 17);
assert.equal(sourceValues.length, 17);

// Familywise controls: the original p50 byte-pointer graph has a 252-cell
// basin. Reaching the red3's GP0=47 and visiting 17 nodes are not unique.
const marks = ink.pages.flatMap((page) => (page.red_spans || []).map((span) => {
  const index = runicValues(span.runes).reduce((a, b) => a + b, 0) % 256;
  const sequence = [index];
  const visited = new Set(sequence);
  while (sequence.at(-1) !== stopGP0) {
    const next = bytes[sequence.at(-1)];
    if (visited.has(next)) break;
    visited.add(next);
    sequence.push(next);
  }
  return {
    page: page.page, local: span.start, index,
    reached: sequence.at(-1) === stopGP0,
    visited: sequence.length
  };
}));
assert.equal(marks.length, 18);
assert.equal(marks.filter((row) => row.reached).length, 18);
assert.deepEqual(marks.filter((row) => row.visited === 17).map((row) =>
  [row.page, row.local, row.index]), [
  [8,0,131], [33,0,109], [33,91,84]
]);

const originalPage55 = text.split(/^\s*%\s*$/m)[54];
assert.ok(originalPage55);
const printed55 = originalPage55.replace(/\/\s*/g, "");
const fragmentSources = printed55.match(/[\u16A0-\u16FF]+/gu) || [];
const fragments = fragmentSources.map(runicValues);
assert.deepEqual(fragments.map((word) => word.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(fragments.length, pathIndices.length);
const original = fragments.flat();
assert.equal(original.length, 76);
assert.deepEqual(original, gp.pages.find((p) => p.page === 55).indices);

/** @param {number[][]} input @param {"node"|"byte"} keyKind
 * @param {-1|1} sign @returns {number[][]}
 */
function transform(input, keyKind, sign) {
  assert.equal(input.length, 17);
  return input.map((word, i) => {
    const key = keyKind === "node" ? pathIndices[i] : sourceValues[i];
    return word.map((c) => (c + sign * key % 29 + 29) % 29);
  });
}
const candidates = [];
for (const keyKind of ["node", "byte"]) {
  for (const sign of [-1, 1]) {
    const decoded = transform(fragments, keyKind, sign);
    const replay = transform(decoded, keyKind, -sign);
    assert.deepEqual(replay, fragments);
    const plaintext = decoded.flat();
    assert.equal(plaintext.length, 76);
    candidates.push({
      keyKind,
      sign,
      gp29IoC: Number(ioc(plaintext).toFixed(12)),
      sourceSeparatedGPTranslit: decoded
        .map((w) => w.map((r) => gp.translit[r]).join("")).join(" "),
    });
  }
}
assert.equal(candidates.length, 4);
assert.ok(candidates.every((c) => c.gp29IoC < 0.04));
const solved = gp.pages.find((p) => p.page === 57).indices;
assert.equal(solved.length, 95);
const positive = fragments.map((w, i) =>
  solved.slice(fragments.slice(0, i).reduce((a, z) => a + z.length, 0),
    fragments.slice(0, i + 1).reduce((a, z) => a + z.length, 0)));
assert.equal(positive.flat().length, 76);
for (const keyKind of ["node", "byte"]) {
  for (const sign of [-1, 1]) {
    const planted = transform(positive, keyKind, -sign);
    assert.deepEqual(transform(planted, keyKind, sign), positive);
  }
}
console.log(JSON.stringify({
  classification: "Bounded four-variant original 76-rune negative; no plaintext",
  redStart: {page: 33, offset: 91, GP0: startGP0},
  redStop: {page: 39, offset: 119, GP0: stopGP0},
  indexRoute: pathIndices,
  redFamilyControl: {
    sourceSpans: marks.length,
    reachedTarget: marks.filter((r) => r.reached).length,
    equal17Visited: marks.filter((r) => r.visited === 17),
  },
  printedBytes: sourceValues,
  endCellOutput: bytes[stopGP0],
  p55Lengths: fragments.map((w) => w.length),
  p55Runes: original.length,
  cipherIoC: Number(ioc(original).toFixed(12)),
  candidates,
  solvedPlaintextPlants: "4/4 exact 76-rune forward-and-inverse",
  conclusion: "The natural word-Caesar consumer is negative; path is conditional"
}, null, 2));
console.log("PASS: exact source route, complete original 76-rune negative, four solved plants");
