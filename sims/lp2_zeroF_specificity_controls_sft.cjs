"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const authenticVigenere =
  require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const bytes = grid.bytes;
const tokens = grid.pages.flatMap(page => page.tokens);

assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter(index => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

function marker(control) {
  if (tokens[control][0] === "0") return 0;
  return special[bytes[control] & 7];
}

function zeroFEncrypt(plain) {
  const cipher = new Array(plain.length);
  if (!plain.length) return cipher;
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    cipher[i] = swap(plain[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return cipher;
}

function zeroFDecrypt(cipher) {
  const plain = new Array(cipher.length);
  if (!cipher.length) return plain;
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    plain[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return plain;
}

function layoutFromSegments(segments) {
  const pageLengths = [];
  const wordLengths = [];
  const stream = [];
  for (const segment of segments) {
    const words = segment.match(runePattern) || [];
    let pageLength = 0;
    for (const word of words) {
      const encoded = Array.from(word, glyph => glyphIndex.get(glyph));
      assert.ok(encoded.every(Number.isInteger));
      stream.push(...encoded);
      wordLengths.push(encoded.length);
      pageLength += encoded.length;
    }
    pageLengths.push(pageLength);
  }
  assert.equal(pageLengths.reduce((a, b) => a + b, 0), stream.length);
  assert.equal(wordLengths.reduce((a, b) => a + b, 0), stream.length);
  return { stream, pageLengths, wordLengths };
}

function metrics(stream, pageLengths, wordLengths) {
  assert.equal(stream.length, pageLengths.reduce((a, b) => a + b, 0));
  assert.equal(stream.length, wordLengths.reduce((a, b) => a + b, 0));

  let adjacent = 0;
  let adjacentEligible = 0;
  let offset = 0;
  for (const length of pageLengths) {
    for (let j = 1; j < length; j++) {
      adjacentEligible++;
      if (stream[offset + j] === stream[offset + j - 1]) adjacent++;
    }
    offset += length;
  }

  let lag5 = 0;
  let lag5Eligible = 0;
  offset = 0;
  for (const length of wordLengths) {
    for (let j = 5; j < length; j++) {
      lag5Eligible++;
      if (stream[offset + j] === stream[offset + j - 5]) lag5++;
    }
    offset += length;
  }

  return {
    adjacent,
    adjacentEligible,
    adjacentRate: adjacent / adjacentEligible,
    lag5,
    lag5Eligible,
    lag5Rate: lag5Eligible ? lag5 / lag5Eligible : 0
  };
}

function transformCase(name, stream, pageLengths, wordLengths) {
  const decoded = zeroFDecrypt(stream);
  const raw = metrics(stream, pageLengths, wordLengths);
  const after = metrics(decoded, pageLengths, wordLengths);
  const edits = decoded.reduce(
    (sum, value, i) => sum + Number(value !== stream[i]), 0);
  return {
    name,
    n: stream.length,
    raw,
    after,
    edits,
    editRate: edits / stream.length,
    deltaAdjacent: after.adjacent - raw.adjacent,
    deltaAdjacentRate: after.adjacentRate - raw.adjacentRate,
    deltaLag5: after.lag5 - raw.lag5,
    deltaLag5Rate: after.lag5Rate - raw.lag5Rate
  };
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function summarize(rows, key) {
  const values = rows.map(row => row[key]).sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const pick = p => values[Math.floor(p * (values.length - 1))];
  return {
    min: values[0],
    p05: pick(0.05),
    median: pick(0.5),
    p95: pick(0.95),
    max: values.at(-1),
    mean,
    sd: Math.sqrt(variance)
  };
}

function nativePools(file) {
  const pools = new Map();
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}

// Fixed unknown-LP2 target and exact physical layout, matching #1422.
const lp2Pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
const lp2Original = lp2Pages.flatMap(page => page.indices);
const lp2PageLengths = lp2Pages.map(page => page.indices.length);
const sourceText = transcription.split("%").slice(0, 55).join("%")
  .replaceAll("/", "").replaceAll("\r", "").replaceAll("\n", "")
  .replaceAll("%", "");
const lp2Words = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, glyph => glyphIndex.get(glyph)));
const lp2WordLengths = lp2Words.map(word => word.length);

assert.equal(lp2Original.length, 12956);
assert.equal(lp2Words.length, 2896);
assert.deepEqual(lp2Words.flat(), lp2Original);

const target = transformCase(
  "LP2 p0-p55",
  lp2Original,
  lp2PageLengths,
  lp2WordLengths
);
assert.equal(target.raw.adjacent, 86);
assert.equal(target.raw.lag5, 104);
assert.equal(target.after.adjacent, 478);
assert.equal(target.after.lag5, 99);
assert.equal(target.edits, 549);

// Authentic solved LP1 p1 Atbash ciphertext, original page-local word layout.
const lp1Segments = lp1.split("%");
const p1Layout = layoutFromSegments([lp1Segments[0]]);
assert.equal(p1Layout.stream.length, 184);
const p1Plain = p1Layout.stream.map(c => (28 * c + 28) % 29);
const p1 = transformCase(
  "LP1 p1 authentic Atbash ciphertext",
  p1Layout.stream,
  p1Layout.pageLengths,
  p1Layout.wordLengths
);
p1.knownPlaintext = metrics(
  p1Plain,
  p1Layout.pageLengths,
  p1Layout.wordLengths
);

// Authentic solved LP1 p3-p4 Vigenere ciphertext and exact known plaintext.
const p34Layout = layoutFromSegments(lp1Segments.slice(1, 3));
assert.equal(p34Layout.stream.length, 515);
assert.deepEqual(p34Layout.stream, authenticVigenere.cipher);
const p34 = transformCase(
  "LP1 p3-p4 authentic Vigenere ciphertext",
  authenticVigenere.cipher,
  p34Layout.pageLengths,
  p34Layout.wordLengths
);
p34.knownPlaintext = metrics(
  authenticVigenere.plaintext,
  p34Layout.pageLengths,
  p34Layout.wordLengths
);

// Source-shaped iid GP29 nulls with the exact LP2 page and word layout.
const random = xorshift32(0x33011524);
const randomRows = [];
for (let trial = 0; trial < 512; trial++) {
  const stream = Array.from({ length: lp2Original.length }, () => random() % 29);
  randomRows.push(transformCase(
    "random-" + trial,
    stream,
    lp2PageLengths,
    lp2WordLengths
  ));
}
const randomSummary = Object.fromEntries([
  "deltaAdjacent",
  "deltaAdjacentRate",
  "deltaLag5",
  "deltaLag5Rate",
  "edits",
  "editRate"
].map(key => [key, summarize(randomRows, key)]));

// Planted positive: exact source-shaped native GP English under the same
// zero-F wrapper. The inverse must restore all 12,956 runes exactly.
const pools = nativePools("resources/control/shakespeare_first300k.txt");
const plantRandom = xorshift32(0x3301F00D);
const plantPlain = lp2WordLengths.flatMap(length => {
  const options = pools.get(length);
  assert.ok(options?.length, "missing native pool for word length " + length);
  return options[plantRandom() % options.length];
});
assert.equal(plantPlain.length, lp2Original.length);
const plantCipher = zeroFEncrypt(plantPlain);
const plantDecoded = zeroFDecrypt(plantCipher);
assert.deepEqual(plantDecoded, plantPlain);
const plant = {
  name: "source-shaped native English zero-F wrapper plant",
  n: plantPlain.length,
  plain: metrics(plantPlain, lp2PageLengths, lp2WordLengths),
  wrapped: metrics(plantCipher, lp2PageLengths, lp2WordLengths),
  unwrapped: metrics(plantDecoded, lp2PageLengths, lp2WordLengths),
  exactRecovery: true,
  wrapperEdits: plantCipher.reduce(
    (sum, value, i) => sum + Number(value !== plantPlain[i]), 0)
};

// Frozen empirical specificity checks on the predeclared outputs.
const randomAtLeastTargetAdjacent =
  randomRows.filter(row => row.deltaAdjacent >= target.deltaAdjacent).length;
const randomAtMostTargetLag5 =
  randomRows.filter(row => row.deltaLag5 <= target.deltaLag5).length;
const randomJointDirectionMagnitude = randomRows.filter(row =>
  row.deltaAdjacent >= target.deltaAdjacent &&
  row.deltaLag5 <= target.deltaLag5
).length;

assert.equal(plant.exactRecovery, true);

console.log(JSON.stringify({
  model: "exact frozen #1422 zero-F moving-exception transform",
  target,
  authenticSolvedCicada: [p1, p34],
  randomMatchedControls: {
    trials: randomRows.length,
    summary: randomSummary,
    atLeastTargetAdjacentDelta: randomAtLeastTargetAdjacent,
    atMostTargetLag5Delta: randomAtMostTargetLag5,
    jointAtLeastTargetDirectionMagnitude: randomJointDirectionMagnitude
  },
  plantedSurfaceWrapperPositive: plant,
  decisionInputsOnly: [
    "adjacent-equal count/rate",
    "within-word lag-five return count/rate",
    "transform edit count/rate"
  ]
}, null, 2));
