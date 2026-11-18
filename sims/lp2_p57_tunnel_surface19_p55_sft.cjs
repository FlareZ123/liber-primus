"use strict";

/**
 * P57 "TUNNELNG TO THE SURFACE" -> base59 p50 pointer-path key -> p55 gate.
 *
 * Frozen source route:
 *   TUNNELNG GP0=94 selects p50 cell94.
 *   SURFACE GP0=67 selects token3C -> base59 189.
 *   189 is the unique base59 p50 fixed point.
 *   Follow base59 pointers from cell94 through fixed point189.
 *   The visited path has19 nodes, exactly dividing p55's76 runes four times.
 *
 * Frozen receiver family:
 *   - forward path only;
 *   - key values are either visited cell indices mod29 or each visited token's
 *     emitted base59 pointer value mod29;
 *   - repeat the 19-value key four times;
 *   - plaintext is C+K or C-K mod29.
 *
 * No phase, reversal, affine offset, alternate radix, or fitted mutation.
 *
 * Run:
 *   node sims/lp2_p57_tunnel_surface19_p55_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const runeIndex = new Map(
  corpus.runes.map((rune, index) => [rune, index])
);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet59.length + low;
}

function pointerPath(start, stop) {
  const out = [];
  const seen = new Set();
  let cell = start;
  while (!seen.has(cell)) {
    assert.ok(cell >= 0 && cell < tokens.length);
    seen.add(cell);
    out.push(cell);
    if (cell === stop) return out;
    cell = decode59(tokens[cell]);
  }
  throw new Error("Pointer path cycled before the selected surface");
}

const p57 = solved.sections.find(
  (section) => section.name === "p57_parable"
);
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text).map((word) => ({
  text: word.map((value) => corpus.translit[value]).join(""),
  gp0: word.reduce((sum, value) => sum + value, 0),
}));
const tunnel = p57Words.find((word) => word.text === "TUNNELNG");
const surface = p57Words.find((word) => word.text === "SURFACE");
assert.deepEqual(tunnel, { text: "TUNNELNG", gp0: 94 });
assert.deepEqual(surface, { text: "SURFACE", gp0: 67 });
assert.equal(tokens[surface.gp0], "3C");
assert.equal(decode59(tokens[surface.gp0]), 189);

const fixedPoints = tokens
  .map((token, index) => decode59(token) === index ? index : null)
  .filter((value) => value !== null);
assert.deepEqual(fixedPoints, [189]);

const visited = pointerPath(tunnel.gp0, 189);
assert.deepEqual(
  visited,
  [94,55,79,81,57,116,53,168,236,234,193,153,33,112,72,161,214,247,189]
);
assert.equal(visited.length, 19);
assert.equal(76 / visited.length, 4);

const emitted = visited.map((cell) => decode59(tokens[cell]));
assert.deepEqual(
  emitted,
  [55,79,81,57,116,53,168,236,234,193,153,33,112,72,161,214,247,189,189]
);

const p55 = corpus.pages.find((page) => page.page === 55);
assert.ok(p55);
assert.equal(p55.indices.length, 76);
const cipher = p55.indices;

const sections = transcription.replace(/\r\n/g, "\n").split(/\n%\n/);
const p55Source = sections[54]
  .replace(/\/\n/g, "")
  .replace(/[\n&$%§\/]/g, "");
const sourceWords = p55Source.split(/[-.]/).filter(Boolean);
const wordLengths = sourceWords.map((word) => [...word].length);
assert.deepEqual(
  wordLengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]
);
assert.equal(wordLengths.reduce((sum, value) => sum + value, 0), 76);

const translitTokens = corpus.translit.map((text, index) => ({
  text,
  index,
})).sort((a, b) => b.text.length - a.text.length);

function normalizeEnglish(text) {
  return text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S")
    .replace(/Q/g, "C");
}

function encodeEnglishWord(word) {
  const source = normalizeEnglish(word);
  const out = [];
  for (let offset = 0; offset < source.length;) {
    const token = translitTokens.find(
      (candidate) => source.startsWith(candidate.text, offset)
    );
    if (!token) return null;
    out.push(token.index);
    offset += token.text.length;
  }
  return out;
}

const vocab = new Map();
const triCounts = new Map();
for (const word of shakespeare.toUpperCase().match(/[A-Z]+/g) || []) {
  const encoded = encodeEnglishWord(word);
  if (!encoded) continue;
  if (!vocab.has(encoded.length)) vocab.set(encoded.length, []);
  vocab.get(encoded.length).push(encoded);
  for (let i = 0; i + 3 <= encoded.length; i += 1) {
    const id = encoded[i] * 841 + encoded[i + 1] * 29 + encoded[i + 2];
    triCounts.set(id, (triCounts.get(id) || 0) + 1);
  }
}
const observedTotal = [...triCounts.values()]
  .reduce((sum, value) => sum + value, 0);
assert.equal(observedTotal, 111151);
const alpha = 0.05;
const denominator = observedTotal + alpha * 29 ** 3;

function score(values) {
  assert.equal(values.length, 76);
  let cursor = 0;
  let sum = 0;
  let count = 0;
  for (const length of wordLengths) {
    for (let i = 0; i + 3 <= length; i += 1) {
      const id = values[cursor + i] * 841
        + values[cursor + i + 1] * 29
        + values[cursor + i + 2];
      sum += Math.log(((triCounts.get(id) || 0) + alpha) / denominator);
      count += 1;
    }
    cursor += length;
  }
  assert.equal(cursor, 76);
  assert.ok(count > 0);
  return sum / count;
}

const mod = (value) => ((value % 29) + 29) % 29;
const roman = (values) =>
  values.map((value) => corpus.translit[value]).join("");

const keyFamilies = {
  visitedCells: visited.map(mod),
  emittedPointers: emitted.map(mod),
};
const candidates = [];
for (const [keyName, period] of Object.entries(keyFamilies)) {
  assert.equal(period.length, 19);
  const key = Array.from({ length: 76 }, (_, i) => period[i % 19]);
  for (const sign of [-1, 1]) {
    const plain = cipher.map(
      (value, i) => mod(value + sign * key[i])
    );
    candidates.push({
      keyName,
      sign,
      score: score(plain),
      roman: roman(plain),
      plain,
    });
    const rebuilt = plain.map(
      (value, i) => mod(value - sign * key[i])
    );
    assert.deepEqual(rebuilt, cipher);
  }
}
assert.equal(candidates.length, 4);
candidates.sort((a, b) => b.score - a.score);

let seed = 0x6a190055;
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
function sampleNative() {
  const out = [];
  for (const length of wordLengths) {
    const choices = vocab.get(length);
    assert.ok(choices && choices.length > 0);
    const selected = choices[rand32() % choices.length];
    out.push(...selected);
  }
  assert.equal(out.length, 76);
  return out;
}
const nativeScores = [];
for (let i = 0; i < 2000; i += 1) {
  nativeScores.push(score(sampleNative()));
}
nativeScores.sort((a, b) => a - b);

// Source-shaped positive under the exact visited-cell key.
const plant = sampleNative();
const positiveKey = Array.from(
  { length: 76 },
  (_, i) => keyFamilies.visitedCells[i % 19]
);
const syntheticCipher = plant.map(
  (value, i) => mod(value + positiveKey[i])
);
const recovered = syntheticCipher.map(
  (value, i) => mod(value - positiveKey[i])
);
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  status:
    "PASS: p57 TUNNELNG-to-SURFACE 19-node pointer key tested on original p55",
  sourceRoute: {
    tunnelGp0: tunnel.gp0,
    surfaceGp0: surface.gp0,
    surfaceToken: tokens[surface.gp0],
    selectedSurfaceFixedPoint: 189,
    uniqueBase59FixedPoints: fixedPoints,
    visited,
    emitted,
    pathNodes: visited.length,
    p55Runes: cipher.length,
    exactRepeats: cipher.length / visited.length,
  },
  original: {
    unchangedScore: score(cipher),
    candidates: candidates.map(({ plain, ...candidate }) => candidate),
    best: (() => {
      const { plain, ...candidate } = candidates[0];
      return candidate;
    })(),
  },
  exactWordShapeNativeControls: {
    samples: nativeScores.length,
    min: nativeScores[0],
    median: nativeScores[Math.floor(nativeScores.length / 2)],
    p95: nativeScores[Math.floor(nativeScores.length * 0.95)],
    bestOriginalAboveNativeMin:
      candidates[0].score >= nativeScores[0],
  },
  positivePlant: {
    recoveredRunes: recovered.length,
    nativeScore: score(recovered),
  },
}, null, 2));
