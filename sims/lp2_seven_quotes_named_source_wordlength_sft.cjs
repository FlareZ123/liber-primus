"use strict";

/**
 * Exact seven-quotation source grammar decision on original LP2.
 * No fitting to the ciphertext and no generic language-corpus search:
 * only text witnesses explicitly identified in earlier Cicada rounds.
 * Node.js 22 CommonJS, one standalone read-only test file.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const lp2 = read("resources/liber-primus/lp2-transcription.txt");
const runeSet = new Set(gp.runes);
const RUNES = 12956;
const DELIMS = new Set(["-", ".", "&"]);

/** @param {string} s @returns {number[]} */
function sourceWordLengths(s) {
  const result = [];
  let length = 0;
  for (const symbol of s) {
    if (runeSet.has(symbol)) length++;
    else if (DELIMS.has(symbol) && length) {
      result.push(length);
      length = 0;
    }
  }
  if (length) result.push(length);
  return result;
}

const runeCharIndices = [];
for (let i = 0; i < lp2.length && runeCharIndices.length < RUNES; i++) {
  if (runeSet.has(lp2[i])) runeCharIndices.push(i);
}
assert.equal(runeCharIndices.length, RUNES);
assert.equal(annotations.quotes.length, 7);
assert.equal(annotations.quotes.reduce((a, q) => a + q.length, 0), 405);

const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);

/** Authentic Cicada GP English normalization as used in the solved-text controls.
 * @param {string} word
 * @returns {number}
 */
function gpNativeWordLength(word) {
  const w = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < w.length;) {
    const step = w.startsWith("ING", i) ? 3 : w.startsWith("IO", i) ? 2
      : (tokens.find((t) => w.startsWith(t, i)) || "").length;
    assert.ok(step > 0, "unmapped GP candidate: " + word);
    i += step;
    count++;
  }
  return count;
}

/** @param {number[]} pattern @param {number[]} haystack */
function scan(pattern, haystack) {
  let exact = 0;
  let best = pattern.length + 1;
  let bestWordIndex = -1;
  for (let i = 0; i + pattern.length <= haystack.length; i++) {
    let mismatches = 0;
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] !== haystack[i + j]) mismatches++;
      if (mismatches >= best) break;
    }
    if (mismatches < best) {
      best = mismatches;
      bestWordIndex = i;
    }
    if (!mismatches) exact++;
  }
  return {exact, minimumMismatchedWords: best, nearestStartWordZeroBased: bestWordIndex};
}

// Each book below is explicitly referenced in an earlier Cicada puzzle,
// rather than selected post hoc because its theme resembles Liber Primus.
const namedSources = [
  ["Emerson Self-Reliance (2014 book-code source witness)",
    "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"],
  ["Blake Marriage of Heaven and Hell (2012/2013 cited source)",
    "resources/external/blake-marriage-1906-gutenberg45315.txt"],
  ["Crowley Liber AL chapter I (2013 signed book-code source)",
    "resources/external/2013-liber-al-bookcode-I.txt"],
  ["Crowley Liber AL chapter II (2013 signed book-code source)",
    "resources/external/2013-liber-al-bookcode-II.txt"],
  ["Crowley Liber AL chapter III (2013 signed book-code source)",
    "resources/external/2013-liber-al-bookcode-III.txt"]
].map(([name, file]) => {
  const raw = read(file);
  return {
    name,
    file,
    lengths: (raw.match(/[A-Za-z]+/g) || []).map(gpNativeWordLength)
  };
});
namedSources.push({
  name: "Authentic solved first-release LP1 GP-native rune text",
  file: "resources/transcriptions/lp1_wulfic_canonical.txt",
  lengths: sourceWordLengths(read("resources/transcriptions/lp1_wulfic_canonical.txt"))
});

const results = [];
for (let i = 0; i < annotations.quotes.length; i++) {
  const q = annotations.quotes[i];
  const raw = lp2.slice(runeCharIndices[q.start], runeCharIndices[q.end - 1] + 1);
  const pattern = sourceWordLengths(raw);
  assert.equal(pattern.reduce((a, b) => a + b, 0), q.length);
  results.push({
    quote: i + 1,
    originalRuneRange: [q.start, q.end],
    originalPages: q.page_slices.map((s) => s.page),
    originalRunes: q.length,
    originalWords: pattern.length,
    exactPrintedWordLengths: pattern,
    scannedNamedSources: namedSources.map((src) => ({
      name: src.name,
      sourceWordCount: src.lengths.length,
      ...scan(pattern, src.lengths)
    }))
  });
}

for (const q of results) {
  // The four longer quotations cannot be copied verbatim from these
  // named witnesses if native GP word boundaries have been preserved.
  if (q.quote >= 4) {
    assert.ok(q.scannedNamedSources.every((s) => s.exact === 0));
  }
}
assert.ok(results[0].scannedNamedSources.filter((s) => s.exact > 0).length >= 3,
  "short quote matches arise in multiple unrelated historical sources");
assert.ok(results[2].scannedNamedSources.filter((s) => s.exact > 0).length >= 3,
  "two-word quote has nonunique native-size matches");

// Implementation positive: a known source slice matches itself exactly.
for (const src of namedSources) {
  const start = 31;
  const probe = src.lengths.slice(start, start + 14);
  assert.equal(scan(probe, src.lengths).minimumMismatchedWords, 0);
}

console.log(JSON.stringify({
  originalQuoteCount: results.length,
  originalQuotedRuneTotal: results.reduce((a, q) => a + q.originalRunes, 0),
  claim: "bounded named-source word-length gate, not a decipherment",
  quotes: results
}, null, 2));
console.log("PASS: source-tied quote transcription and named-witness comparison");
