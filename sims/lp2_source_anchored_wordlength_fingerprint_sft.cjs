"use strict";
/**
 * Original LP2 word-length fingerprint against five fixed literary controls.
 *
 * Windows 11 / Node 22: run this one file from the repository checkout.
 * Read-only. No packages, network access, random data, or tunable parameters.
 * A match is necessary for verbatim GP29 text if printed word boundaries
 * survive encryption; matching lengths alone do not establish plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} rel */
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
/** @param {string} value */
function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
const originalName = "resources/liber-primus/lp2-transcription.txt";
const corpusName = "resources/liber-primus/lp2-corpus.json";
const originalText = read(originalName);
const corpus = JSON.parse(read(corpusName));
const runes = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit.map((text, ordinal) => ({ text, ordinal }))
  .sort((a, b) => b.text.length - a.text.length);

/** @param {string} source */
function cipherWords(source) {
  const out = [];
  let word = [];
  for (const ch of source) {
    if (runes.has(ch)) word.push(runes.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      // Original line and page wraps do not end printed words.
    } else if (word.length) {
      out.push(word);
      word = [];
    }
  }
  if (word.length) out.push(word);
  return out;
}

/** @param {string} latin */
function gpWord(latin) {
  const s = latin.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG");
  const indices = [];
  for (let i = 0; i < s.length;) {
    const match = translit.find(entry => s.startsWith(entry.text, i));
    if (!match) return null;
    indices.push(match.ordinal);
    i += match.text.length;
  }
  return indices;
}
/** @param {string} source */
function englishWords(source) {
  return (source.toUpperCase().match(/[A-Z]+/g) || [])
    .map(word => ({ word, runes: gpWord(word) }))
    .filter(row => row.runes && row.runes.length > 0);
}
/** @param {string} source */
function solvedLP1Words(source) {
  return englishWords(source.split(/\r?\n/).filter(line =>
    !line.startsWith("#") && !line.startsWith("[") &&
    !/^\s*\d+\s*/.test(line)).join(" "));
}
/** @param {string} source */
function latinWords(source) {
  return source.split(/\r?\n/).map(line => line.trim())
    .filter(line => /^[0-9A-S]+$/.test(line))
    .map(word => ({ word, runes: Array.from(word) }));
}

/**
 * Exact contiguous word-length matches. An eight-word seed is exhaustive
 * for every match of length nine or greater. We extend both directions,
 * deduplicating overlapping seed hits to prevent inflated counts.
 * @param {number[]} target
 * @param {number[]} reference
 * @param {number} minimum
 * @returns {Array<{ targetStart:number, referenceStart:number, length:number }>}
 */
function findMatches(target, reference, minimum = 9) {
  const seedSize = minimum - 1;
  const lookup = new Map();
  for (let i = 0; i + seedSize <= target.length; i++) {
    const key = target.slice(i, i + seedSize).join(",");
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key).push(i);
  }
  const matches = new Map();
  for (let j = 0; j + seedSize <= reference.length; j++) {
    const hits = lookup.get(reference.slice(j, j + seedSize).join(","));
    if (!hits) continue;
    for (const i of hits) {
      let a = i, b = j, length = seedSize;
      while (a > 0 && b > 0 && target[a - 1] === reference[b - 1]) {
        a--;
        b--;
        length++;
      }
      while (a + length < target.length &&
          b + length < reference.length &&
          target[a + length] === reference[b + length]) length++;
      if (length >= minimum) {
        const key = a + ":" + b;
        matches.set(key, { targetStart: a, referenceStart: b, length });
      }
    }
  }
  return Array.from(matches.values())
    .sort((a, b) => b.length - a.length ||
      a.targetStart - b.targetStart || a.referenceStart - b.referenceStart);
}

const pages = originalText.split("%").slice(0, 55).join("%");
const original = cipherWords(pages);
assert.equal(original.length, 2896, "original complete-word count");
assert.equal(original.flat().length, 12956, "original GP29 rune count");
assert.deepEqual(original.flat(), corpus.pages
  .filter(page => page.page <= 55).flatMap(page => page.indices),
  "printed-source reconstruction must match pinned rune corpus");
const lengths = original.map(word => word.length);
const controls = [
  { name: "Shakespeare", path: "resources/control/shakespeare_first300k.txt", parse: englishWords, count: 55407 },
  { name: "Gibran", path: "resources/control/gibran_prophet_58585.txt", parse: englishWords, count: 15733 },
  { name: "Emerson", path: "resources/control/emerson_essays_2944.txt", parse: englishWords, count: 77932 },
  { name: "Solved LP1", path: "resources/liber-primus/lp1-plaintext-reference.txt", parse: solvedLP1Words, count: 761 },
  { name: "Latin Vulgate GP", path: "resources/control/latin-vulgate-gp-wholewords.txt", parse: latinWords, count: 39835 }
];
console.log("ORIGINAL", JSON.stringify({ completeWords: original.length,
  runes: original.flat().length,
  sha256: sha256(originalText), corpusSha256: sha256(read(corpusName)) }));

let all = [];
for (const control of controls) {
  const raw = read(control.path);
  const words = control.parse(raw);
  assert.equal(words.length, control.count, "source corpus size: " + control.name);
  const sizes = words.map(w => w.runes.length);
  const hits = findMatches(lengths, sizes, 9);
  const max = hits.length ? hits[0].length : 0;
  console.log("SOURCE", JSON.stringify({ name: control.name,
    words: words.length, sha256: sha256(raw),
    matchesNineOrLonger: hits.length, max,
    matches: hits.map(h => ({ ...h,
      sourceText: words.slice(h.referenceStart, h.referenceStart + h.length)
        .map(w => w.word).join(" ") })) }));
  for (const hit of hits) all.push({ source: control.name, ...hit });
  if (control.name === "Gibran") {
    const positive = lengths.slice();
    const planted = sizes.slice(5000, 5014);
    assert.equal(planted.length, 14);
    positive.splice(1000, planted.length, ...planted);
    const found = findMatches(positive, sizes, 9);
    assert(found.some(hit => hit.targetStart <= 1000 &&
      hit.targetStart + hit.length >= 1014 &&
      hit.referenceStart <= 5000 &&
      hit.referenceStart + hit.length >= 5014),
    "positive plant of 14 genuine source word lengths must be detected");
    console.log("POSITIVE", JSON.stringify({
      source: control.name, plantedWords: 14,
      targetStart: 1000, sourceStart: 5000, detected: true }));
  }
}
all.sort((a, b) => b.length - a.length);
assert.equal(all.length, 9, "locked number of nine-word overlaps");
assert(all.every(hit => hit.length === 9),
  "no ten-word exact source-typed length overlap");
assert.equal(controls.reduce((n, x) => n + x.count, 0), 189668);
console.log("DECISION", JSON.stringify({
  originalWords: lengths.length, controlWords: 189668,
  exactNineWordOverlaps: all.length, exactTenOrMore: 0,
  longestObserved: 9,
  recoveredUnknownPlaintext: false,
  interpretation: "No unaltered ten-word contiguous quotation from these five source corpora under preserved original printed GP29 word lengths",
  limitations: "Not an exclusion of another text, noncanonical GP spelling, dynamic word boundaries, paraphrase, or unknown source"
}));
