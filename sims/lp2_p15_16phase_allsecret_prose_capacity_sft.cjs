"use strict";

/**
 * Exact GP29 16-phase all-secret permutation bound on original LP2 prose.
 *
 * Source question: can the literal 4x4 number square printed on p15 choose
 * a sixteen-phase monoalphabetic/polygraphic-by-position GP29 encoder for
 * the next six intact pages p16..p21? An unknown substitution table at
 * each of sixteen fixed phases may be ANY permutation of the 29 glyphs.
 *
 * Original ciphertext alone fixes, without knowing any key, the largest
 * number of plaintext symbols that could occupy its k most common glyphs:
 *    bound(k) = sum_phase sum_k_largest n[phase][cipherRune].
 * This applies to every 16-phase fixed bijective symbol-to-symbol codec,
 * with continuous, page-reset, or literal printed-word-reset clocks.
 * No assertion extends to evolving alphabets, plaintext-driven state,
 * multi-symbol fractionation, added side channels or binary plaintext.
 *
 * Repro: Node.js 22 CommonJS, repository root, no network/dependencies:
 *    node sims/lp2_p15_16phase_allsecret_prose_capacity_sft.cjs
 * A native matched-word GP29 planted cipher must recover its true source
 * even though original ciphertext cannot sustain ordinary native GP text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const realPages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const source = realPages.flatMap(p => p.indices);
assert.equal(source.length, 12956);
assert.equal(realPages.length, 55);
assert.equal(gp.pages[50].runic_count, 0);

const gpGlyph = new Map(gp.runes.map((r, i) => [r, i]));
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const printed = transcription.split("%").slice(0, 55).join("")
  .replace(/\/\n/g, "").replace(/[\n%]/g, "");
const nativeWordTokens = (printed.match(pattern) || []).map(w =>
  Array.from(w, r => gpGlyph.get(r)));
assert.equal(nativeWordTokens.length, 2896);
assert.deepEqual(nativeWordTokens.flat(), source,
  "original printed words, cross-page carries, and GP29 source must agree");

const pageStart = new Map(), pagePosition = [], wordPosition = [];
let position = 0;
for (const p of realPages) {
  pageStart.set(p.page, position);
  for (let j = 0; j < p.indices.length; j++) pagePosition.push(j);
  position += p.indices.length;
}
for (const w of nativeWordTokens)
  for (let j = 0; j < w.length; j++) wordPosition.push(j);
assert.equal(pagePosition.length, source.length);
assert.equal(wordPosition.length, source.length);

const regions = [
  { name: "opening-p16-21", lo: 16, hi: 21, expected: 1613 },
  { name: "disjoint-floral-p40-53", lo: 40, hi: 53, expected: 3008 }
].map(r => {
  const start = pageStart.get(r.lo);
  const endPage = realPages.find(p => p.page === r.hi);
  const end = pageStart.get(r.hi) + endPage.indices.length;
  assert.equal(end - start, r.expected);
  return { ...r, start, end };
});
const scopes = ["continuous", "page", "word"];
const topSizes = [1, 2, 3, 5, 8];

/** @param {number} globalIndex @param {object} region @param {string} scope */
function phaseOf(globalIndex, region, scope) {
  if (scope === "continuous") return (globalIndex - region.start) % 16;
  if (scope === "page") return pagePosition[globalIndex] % 16;
  if (scope === "word") return wordPosition[globalIndex] % 16;
  throw new Error("unknown phase clock");
}

/** Exact all-secret upper bound for every rank prefix of plaintext GP29. */
function envelope(cipher, region, scope) {
  assert.equal(cipher.length, region.end - region.start);
  const counts = Array.from({ length: 16 }, () => new Uint32Array(29));
  cipher.forEach((symbol, j) => {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    counts[phaseOf(region.start + j, region, scope)][symbol]++;
  });
  return Object.fromEntries(topSizes.map(k => [k,
    counts.reduce((total, phaseCounts) => {
      const sorted = Array.from(phaseCounts).sort((a, b) => b - a);
      return total + sorted.slice(0, k).reduce((s, n) => s + n, 0);
    }, 0)]));
}

/** Actual native-GP rank frequencies. */
function topCounts(sequence) {
  const histogram = new Uint32Array(29);
  for (const symbol of sequence) histogram[symbol]++;
  const sorted = Array.from(histogram).sort((a, b) => b - a);
  return Object.fromEntries(topSizes.map(k =>
    [k, sorted.slice(0, k).reduce((s, n) => s + n, 0)]));
}
let rngState = 0x15153299;
/** Deterministic source-control sampling; no stochastic output inference. */
function randomInt(n) {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) % n;
}
function donorPools(sourcePath) {
  const sourceText = read(sourcePath);
  const text = sourcePath.includes("latin-vulgate")
    ? sourceText.split("\n")
      .filter(line => !line.trimStart().startsWith("#")).join(" ")
    : sourceText;
  const pools = new Map();
  for (const original of text.match(/[A-Za-z]+/g) || []) {
    const converted = encodeSourceNativeGP(original);
    if (!pools.has(converted.length)) pools.set(converted.length, []);
    pools.get(converted.length).push(converted);
  }
  for (const word of nativeWordTokens)
    assert(pools.has(word.length), "source lacks exact GP word length");
  return pools;
}
function drawDonor(pools) {
  const result = [];
  for (const word of nativeWordTokens) {
    const options = pools.get(word.length);
    result.push(...options[randomInt(options.length)]);
  }
  assert.equal(result.length, source.length);
  return result;
}
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
/** Reversible positive with a fresh random secret 29! permutation per phase. */
function positivePlant(native, region, scope) {
  const tables = Array.from({ length: 16 },
    () => shuffle(Array.from({ length: 29 }, (_, i) => i)));
  const inverse = tables.map(table => {
    const row = Array(29);
    table.forEach((c, p) => { row[c] = p; });
    assert.equal(new Set(row).size, 29);
    return row;
  });
  const cipher = native.map((p, j) =>
    tables[phaseOf(region.start + j, region, scope)][p]);
  const decoded = cipher.map((c, j) =>
    inverse[phaseOf(region.start + j, region, scope)][c]);
  assert.deepEqual(decoded, native, "source-native positive must invert");
  const cap = envelope(cipher, region, scope);
  const ranked = topCounts(decoded);
  for (const k of topSizes)
    assert(ranked[k] <= cap[k], "mathematical capacity positive");
  return {
    recovered: decoded.length,
    allRunesExact: decoded.every((p, i) => p === native[i]),
    top5Bound: cap[5],
    top5Actual: ranked[5]
  };
}

const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Latin Vulgate", "resources/control/latin-vulgate-latin26-wholewords.txt"]
];
const originalCaps = Object.fromEntries(regions.map(region =>
  [region.name, Object.fromEntries(scopes.map(scope =>
    [scope, envelope(source.slice(region.start, region.end), region, scope)]))]));
assert.deepEqual(originalCaps["opening-p16-21"].continuous,
  { 1: 122, 2: 230, 3: 328, 5: 502, 8: 732 });
assert.deepEqual(originalCaps["opening-p16-21"].page[5], 507);
assert.deepEqual(originalCaps["opening-p16-21"].word[5], 444);
assert.equal(originalCaps["disjoint-floral-p40-53"].continuous[5], 839);
assert.equal(originalCaps["disjoint-floral-p40-53"].page[5], 834);
assert.equal(originalCaps["disjoint-floral-p40-53"].word[5], 762);

const sourceControls = [];
let plants = null;
for (const [name, sourcePath] of controls) {
  const pools = donorPools(sourcePath);
  const observed = Object.fromEntries(regions.map(region =>
    [region.name, { count: 60, minTop1: Infinity, maxTop1: 0,
      minTop5: Infinity, maxTop5: 0 }]));
  for (let trial = 0; trial < 60; trial++) {
    const text = drawDonor(pools);
    for (const region of regions) {
      const plain = text.slice(region.start, region.end);
      const rank = topCounts(plain);
      const record = observed[region.name];
      record.minTop1 = Math.min(record.minTop1, rank[1]);
      record.maxTop1 = Math.max(record.maxTop1, rank[1]);
      record.minTop5 = Math.min(record.minTop5, rank[5]);
      record.maxTop5 = Math.max(record.maxTop5, rank[5]);
      for (const scope of scopes) {
        assert(rank[1] > originalCaps[region.name][scope][1],
          "native plaintext top1 must exceed original " + region.name +
          " " + name + " " + scope + " " + trial);
        assert(rank[5] > originalCaps[region.name][scope][5],
          "native plaintext top5 must exceed original " + region.name +
          " " + name + " " + scope + " " + trial);
      }
    }
    if (name === "Gibran" && trial === 0) {
      plants = Object.fromEntries(regions.map(region =>
        [region.name, Object.fromEntries(scopes.map(scope =>
          [scope, positivePlant(
            text.slice(region.start, region.end), region, scope)]))]));
    }
  }
  sourceControls.push({ name, sourcePath, sourceWordLengthClasses: pools.size,
    regionRankRanges: observed });
}
assert(plants);
if (require.main === module) {
  console.log(JSON.stringify({
    status: "EXACT 16-phase stationary original-cipher exclusion; no plaintext recovered",
    originalSource: "resources/liber-primus/lp2-corpus.json",
    printedWords: nativeWordTokens.length,
    runes: source.length,
    phaseStates: 16,
    rankSizes: topSizes,
    originalCapacity: originalCaps,
    gpNativeSourceControls: sourceControls,
    sourceNativePlantedSecretAlphabets: plants,
    stop: "A recoverable changing-state cipher, transposition, or non-GP intermediate needs a separately fixed source operation"
  }, null, 2));
}
module.exports = { envelope, topCounts, phaseOf };
