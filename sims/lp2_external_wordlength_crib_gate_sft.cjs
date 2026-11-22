/**
 * Original LP2 word-boundary external-source crib gate.
 * Runtime: Node.js 22, CommonJS, no dependencies.
 *
 * A source copy preserving printed word boundaries should produce long exact
 * GP29-normalized word-length runs regardless of the unknown rune cipher.
 * Source scope: 66 KJV books, Gibran's The Prophet, and tiny Shakespeare.
 * Original and source snapshots are frozen by repository commit SHA below.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const BIBLE_REF = "0e8cc040bfb69f564e15ba93b2569b00e28420a8";
const GIBRAN_REF = "6ebc10889ae826388c63daaaf2fd2eb1d9f64e58";
const SHAKESPEARE_REF = "6f9487a6fe5b420b7ca9afb0d7c078e37c1d1b4e";
const BIBLE_REPO = "takelley1/plaintext-bible-kjv";
const DIGRAPHS = ["ING", "TH", "NG", "EO", "AE", "IA", "EA"];
const exactWidth = 12;
const seedWidth = 7;
const contextWidth = 24;

const sourceJobs = [
  ["Gibran / The Prophet", "GITenberg/The-Prophet_58585", GIBRAN_REF, "58585-0.txt", false],
  ["Shakespeare / tinyshakespeare", "karpathy/char-rnn", SHAKESPEARE_REF, "data/tinyshakespeare/input.txt", false],
];

/** @param {string} text @returns {string[]} */
function latinWords(text) {
  return (text.toUpperCase().match(/[A-Z]+(?:['\u2019][A-Z]+)*/g) || []).map((word) => word.replace(/['\u2019]/g, ""));
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  let length = 0;
  for (let i = 0; i < word.length; length++) {
    const digraph = DIGRAPHS.find((item) => word.startsWith(item, i));
    i += digraph ? digraph.length : 1;
  }
  return length;
}

/** @param {number[]} values @param {number} start @param {number} width @returns {string} */
function signature(values, start, width) {
  return values.slice(start, start + width).join(",");
}

/** @param {string} url @returns {Promise<string>} */
async function getText(url) {
  const response = await fetch(url, { headers: { "User-Agent": "lp2-wordlength-source-gate/1.0" } });
  assert.ok(response.ok, "Failed source retrieval: " + response.status + " " + url);
  return response.text();
}

/** @param {string} repo @param {string} ref @param {string} path @returns {string} */
function rawUrl(repo, ref, path) {
  return "https://raw.githubusercontent.com/" + repo + "/" + ref + "/" + path;
}

const transcription = fs.readFileSync("resources/liber-primus/lp2-transcription.txt", "utf8");
const canonical = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const rawPages = transcription.split("%").filter((part) => /[\u16A0-\u16FF]/u.test(part));
assert.equal(rawPages.length, 57, "56 textual sections plus solved p56/p57");
const pages = rawPages.map((part, index) => {
  const physical = index < 50 ? index : index + 1;
  const glyphs = part.replace(/\/\s*/g, "");
  const words = (glyphs.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => word.length);
  const runeCount = words.reduce((a, b) => a + b, 0);
  assert.equal(runeCount, canonical.pages[physical].indices.length, "Physical p" + physical + " rune count");
  return { physical, words };
});

const solved = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
assert.deepEqual(latinWords(solved).map(gpLength), pages.at(-1).words, "Solved p57 source native-rune length positive");
console.log("PASS: all 57 rune-bearing transcription parts match canonical rune totals; p57 original English GP length positive is exact 20/20");

const unknown = pages.filter((page) => page.physical <= 55);
const exact = new Map();
const seeds = new Map();
let exactTargets = 0;
for (const page of unknown) {
  for (let index = 0; index + exactWidth <= page.words.length; index++) {
    const key = signature(page.words, index, exactWidth);
    const hits = exact.get(key) || [];
    hits.push({ page, index });
    exact.set(key, hits);
    exactTargets++;
  }
  for (let index = 0; index + seedWidth <= page.words.length; index++) {
    const key = signature(page.words, index, seedWidth);
    const hits = seeds.get(key) || [];
    hits.push({ page, index });
    seeds.set(key, hits);
  }
}

let corpusWords = 0;
let exactHits = 0;
let seedHits = 0;
let files = 0;
/** @type {{ source:string, page:number, pageWord:number, sourceWord:number, identical:number, comparable:number, phrase:string }[]} */
const near = [];
const exactEvidence = [];

/** @param {string} source @param {string} text @param {boolean} scripture */
function examine(source, text, scripture) {
  const normalized = scripture ? text.replace(/^\s*\d+:\d+:\s*/gm, " ") : text;
  const words = latinWords(normalized);
  const lengths = words.map(gpLength);
  corpusWords += words.length;
  files++;
  let localExact = 0;
  let localSeed = 0;
  for (let i = 0; i + seedWidth <= lengths.length; i++) {
    if (i + exactWidth <= lengths.length) {
      const full = exact.get(signature(lengths, i, exactWidth));
      if (full) {
        exactHits += full.length;
        localExact += full.length;
        for (const candidate of full) {
          const sourcePage = candidate.page;
          let extension = 0;
          while (candidate.index + extension < sourcePage.words.length &&
              i + extension < lengths.length &&
              sourcePage.words[candidate.index + extension] === lengths[i + extension]) extension++;
          exactEvidence.push({
            source, page: sourcePage.physical, pageWord: candidate.index,
            sourceWord: i, extension,
            phrase: words.slice(i, i + Math.min(extension, 18)).join(" ").slice(0,160),
          });
        }
      }
    }
    const candidates = seeds.get(signature(lengths, i, seedWidth));
    if (!candidates) continue;
    localSeed += candidates.length;
    seedHits += candidates.length;
    for (const candidate of candidates) {
      const comparable = Math.min(contextWidth, candidate.page.words.length - candidate.index, lengths.length - i);
      if (comparable < 20) continue;
      let identical = 0;
      for (let j = 0; j < comparable; j++) identical += Number(candidate.page.words[candidate.index + j] === lengths[i + j]);
      const report = {
        source, page: candidate.page.physical, pageWord: candidate.index,
        sourceWord: i, identical, comparable,
        phrase: words.slice(i, i + Math.min(comparable, 18)).join(" ").slice(0,160),
      };
      near.push(report);
    }
  }
  console.log("SOURCE " + source + " bytes=" + Buffer.byteLength(text) +
    " sha256=" + crypto.createHash("sha256").update(text).digest("hex") +
    " words=" + words.length + " exact12=" + localExact + " seeds7=" + localSeed);
}

/** @returns {Promise<void>} */
async function main() {
  const listingUrl = "https://api.github.com/repos/" + BIBLE_REPO + "/contents?ref=" + BIBLE_REF;
  const list = JSON.parse(await getText(listingUrl));
  const books = list.filter((entry) => /^\d\d-.*\.txt$/i.test(entry.name));
  assert.equal(books.length, 66, "Pinned KJV corpus must have 66 book files");
  for (const entry of books) {
    sourceJobs.push(["KJV / " + entry.name, BIBLE_REPO, BIBLE_REF, entry.name, true]);
  }
  for (let offset = 0; offset < sourceJobs.length; offset += 6) {
    const batch = sourceJobs.slice(offset, offset + 6);
    const texts = await Promise.all(batch.map(([, repo, ref, path]) => getText(rawUrl(repo, ref, path))));
    for (let i = 0; i < batch.length; i++) examine(batch[i][0], texts[i], batch[i][4]);
  }
  near.sort((a, b) =>
    (b.identical / b.comparable - a.identical / a.comparable) ||
    (b.identical - a.identical));
  exactEvidence.sort((a, b) => b.extension - a.extension);
  console.log("SUMMARY " + JSON.stringify({
    unknownPages: unknown.length,
    indexed12Windows: exactTargets,
    unique12: exact.size,
    corpusFiles: files,
    corpusWords, exact12: exactHits, seed7: seedHits,
    near20Plus: near.filter((row) => row.identical >= 20).length,
    topNear: near.slice(0, 15),
    exactEvidence: exactEvidence.slice(0, 15),
  }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
