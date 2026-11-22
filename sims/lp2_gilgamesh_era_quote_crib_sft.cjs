"use strict";
/**
 * Source-pinned, key-free possible-plaintext test: original LP2 quoted word
 * lengths against three pre-2014 English Gilgamesh/Deluge source editions.
 *
 * Reads original corpus, rune transcript and quote boundaries locally.
 * Downloads the three immutable public-domain source texts into memory only.
 * No guessed cipher key, altered word boundary, or source-dependent fitting.
 * Node.js 22+, CommonJS, built-in modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const https = require("node:https");

const root = path.resolve(__dirname, "..");
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const quotes = json("resources/liber-primus/lp2-quote-punctuation-spans.json");
const transcript = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIDs = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const fromTranscript = [...transcript].filter(c => runeIDs.has(c)).map(c => runeIDs.get(c));
assert.equal(original.length, 12956);
assert.deepEqual(fromTranscript.slice(0, original.length), original);
assert.deepEqual(quotes.quotes.map(q => q.length), [18, 19, 12, 58, 68, 160, 70]);

const templates = [
  [5,7,2,3,4,6,4,3,3,4,4,4,5,4],
  [9,8,3,4,6,3,10,2,4,7,6,2,4],
  [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
  [5,7,2,3,4,10,3,9,7,3,7,4,3,3]
];
templates.forEach((arr, i) => {
  assert.equal(arr.reduce((a, b) => a + b, 0), quotes.quotes[i + 3].length);
});

const sources = [
  {
    name: "Langdon 1917 Gilgamish, PG18897",
    repo: "The-Epic-of-GilgamishA-Fragment-of-the-Gilgamish-Legend-in-Old-Babylonian-Cuneiform_18897",
    commit: "94cd8004ddb196a5fd3ab36914cdb842c32e3c13",
    file: "18897.txt",
    gitBlob: "77a014b1e8bbf62e15705446536d666753b5c13e",
    expected: [5,5,6,4]
  },
  {
    name: "Jastrow/Clay 1920 Old Babylonian Gilgamesh, PG11000",
    repo: "An-Old-Babylonian-Version-of-the-Gilgamesh-Epic_11000",
    commit: "5122acbe61568f7cf2529c1a133998dced6cbde8",
    file: "11000-8.txt",
    gitBlob: "aeff1b08730186ebafcdec2964b2681bf4e07a0e",
    expected: [7,5,7,6]
  },
  {
    name: "Budge 1920 Babylonian Deluge, PG7096",
    repo: "The-Babylonian-Story-of-the-Deluge-as-Told-by-Assyrian-Tablets-from-Nineveh-The-Discovery-of-t__7096",
    commit: "1df00324a35b316bb0e537ff15514fa9c9523d8e",
    file: "7096-8.txt",
    gitBlob: "bc03ea95546e43ebb77781688ab49146c6d00382",
    expected: [7,5,6,6]
  }
];

/** @param {string} url @returns {Promise<Buffer>} */
function getBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error("Source GET failed: " + url + " HTTP " + response.statusCode));
        return;
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

/** @param {string} token @returns {string} */
function normalize(token) {
  return token.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/Æ/g, "AE").replace(/Œ/g, "OE")
    .replace(/QU/g, "CW")
    .replace(/[VKZ]/g, c => ({V:"U",K:"C",Z:"S"})[c])
    .replace(/[^A-Z]/g, "");
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  return (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}

/** @param {number[]} source @param {number[]} target */
function longest(source, target) {
  let previous = new Uint16Array(target.length + 1);
  let best = {length:0, sourceWord:-1, quoteWord:-1};
  for (let i = 0; i < source.length; i++) {
    const current = new Uint16Array(target.length + 1);
    for (let j = 0; j < target.length; j++) {
      if (source[i] !== target[j]) continue;
      const length = previous[j] + 1;
      current[j + 1] = length;
      if (length > best.length) {
        best = {length, sourceWord:i - length + 1, quoteWord:j - length + 1};
      }
    }
    previous = current;
  }
  return best;
}

async function main() {
  const results = [];
  for (const source of sources) {
    const url = "https://raw.githubusercontent.com/GITenberg/" + source.repo + "/" + source.commit + "/" + source.file;
    const bytes = await getBytes(url);
    const blob = crypto.createHash("sha1")
      .update(Buffer.from("blob " + bytes.length + "\0"))
      .update(bytes).digest("hex");
    assert.equal(blob, source.gitBlob, source.name + ": source must be byte-identical");
    const words = (bytes.toString("utf8").match(/[A-Za-zÀ-ž]+/gu) || [])
      .map(normalize).filter(Boolean);
    const lengths = words.map(gpLength);
    assert.ok(lengths.length > 5000);
    const best = templates.map(template => longest(lengths, template));
    assert.deepEqual(best.map(x => x.length), source.expected);
    assert.ok(best.every(x => x.length < 12));
    const anchor = 120;
    const positive = lengths.slice(anchor, anchor + 34);
    const recovered = longest(lengths, positive);
    assert.equal(recovered.length, 34);
    assert.equal(recovered.sourceWord, anchor);
    const wrong = [...positive];
    wrong[16] += 2;
    assert.ok(longest(lengths, wrong).length < 34);
    results.push({
      source: source.name, originalBlob: blob, sourceWords: lengths.length,
      quotations: best.map((hit, i) => ({
        span: i + 4, quoteRunes: quotes.quotes[i + 3].length,
        quoteWords: templates[i].length, ...hit,
        sourceWords: words.slice(hit.sourceWord, hit.sourceWord + hit.length).join(" ")
      }))
    });
  }
  console.log(JSON.stringify({originalUnknownRunes:original.length,
    sourceRule:"exact contiguous GP29 word lengths, no mismatches",
    sources:results, exact12WordCandidates:0,
    sourcePositive:"34/34 identified; deliberately corrupted 34-word control rejected",
    conclusion:"No full or 12-word quotation match in these three finite sources; no plaintext"}, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
