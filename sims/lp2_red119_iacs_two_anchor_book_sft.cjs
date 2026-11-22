"use strict";

/**
 * Source-selected three-rune key IACS produces SET and the opening BOOC/BOOK.
 * Exact full original-key controls and declared failure of continuation.
 *
 * Windows 11, Node.js 22:
 * node sims/lp2_red119_iacs_two_anchor_book_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} rel */
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lexicon = read("resources/control/english_wordfreq_textblob.txt");

/** @param {number} page */
const page = (page) => corpus.pages.find((p) => p.page === page).indices;
/** @param {number[]} symbols */
const spell = (symbols) => symbols.map((i) => corpus.translit[i]).join("");
/** @param {number[]} ciphertext @param {number[]} key */
const decrypt = (ciphertext, key) => ciphertext.map((v, i) =>
  (v - key[i % key.length] + 29) % 29);

const red3 = ink.pages.flatMap((p) => (p.red_spans || [])
  .filter((s) => s.length === 3)
  .map((s) => ({ page: p.page, start: s.start, length: s.length })));
assert.deepEqual(red3, [
  { page: 3, start: 119, length: 3 },
  { page: 39, start: 119, length: 3 },
]);

const first = page(0).slice(0, 13);
const marked3 = page(3).slice(119, 122);
const key = page(39).slice(119, 122);
assert.deepEqual(first.slice(0, 4), [15, 8, 18, 3]);
assert.deepEqual(marked3, [13, 23, 2]);
assert.deepEqual(key, [27, 5, 15]);
assert.equal(spell(decrypt(marked3, key)), "SET");
assert.equal(spell(decrypt(first.slice(0, 4), key)), "BOOC");
assert.equal(spell(decrypt(first, key)), "BOOCURFAFEAPGW");

/**
 * Canonical native-GP orthography used in the repository's finite lexicon
 * controls. GP C, U, S represent ordinary K, V, Z where required.
 * @param {string} word
 */
function native(word) {
  return word.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KVQ]/gu, "C").replace(/Z/gu, "S")
    .replace(/ING/gu, "\u014B").replace(/TH/gu, "\u00FE")
    .replace(/IO/gu, "\u026A").replace(/EO/gu, "\u0259")
    .replace(/OE/gu, "\u0153").replace(/AE/gu, "\u00E6")
    .replace(/EA/gu, "\u025B");
}
/** @param {string} word */
function expand(word) {
  return word.replace(/\u014B/gu, "NG").replace(/\u00FE/gu, "TH")
    .replace(/\u026A/gu, "IA").replace(/\u0259/gu, "EO")
    .replace(/\u0153/gu, "OE").replace(/\u00E6/gu, "AE")
    .replace(/\u025B/gu, "EA");
}

const freq3 = new Map();
const freq4 = new Map();
let lexiconTokens = 0;
for (const line of lexicon.split(/\r?\n/u)) {
  const match = /^([a-z]+)\s+(\d+)$/u.exec(line);
  if (!match) continue;
  lexiconTokens++;
  const encoded = native(match[1]);
  const n = [...encoded].length;
  const target = n === 3 ? freq3 : n === 4 ? freq4 : null;
  if (target) {
    const word = expand(encoded);
    target.set(word, (target.get(word) || 0) + Number(match[2]));
  }
}
assert.equal(lexiconTokens, 29157);
assert.equal(freq3.size, 721);
assert.equal(freq4.size, 2065);
assert.equal(freq3.get("SET"), 325);
assert.equal(freq4.get("BOOC"), 125);

const compatibleKeys = [];
for (let k0 = 0; k0 < 29; k0++) {
  for (let k1 = 0; k1 < 29; k1++) {
    for (let k2 = 0; k2 < 29; k2++) {
      const candidate = [k0, k1, k2];
      const three = spell(decrypt(marked3, candidate));
      const four = spell(decrypt(first.slice(0, 4), candidate));
      const score = (freq3.get(three) || 0) * (freq4.get(four) || 0);
      if (score) compatibleKeys.push({
        key: spell(candidate), three, four, frequencyProduct: score,
      });
    }
  }
}
compatibleKeys.sort((a, b) => b.frequencyProduct - a.frequencyProduct);
assert.equal(compatibleKeys.length, 5);
assert.deepEqual(compatibleKeys, [
  { key: "IACS", three: "SET", four: "BOOC", frequencyProduct: 40625 },
  { key: "IAPIA", three: "SIR", four: "BALC", frequencyProduct: 531 },
  { key: "FCIA", three: "PER", four: "SOLO", frequencyProduct: 86 },
  { key: "GPP", three: "WIE", four: "NACY", frequencyProduct: 38 },
  { key: "AMP", three: "ERE", four: "LECH", frequencyProduct: 2 },
]);

const highlights = ink.pages.flatMap((p) => p.page > 55 ? []
  : (p.red_spans || []).map((s) => {
      const encoded = page(p.page).slice(s.start, s.start + s.length);
      const decoded = decrypt(encoded, key);
      const matchingLengths = [3, 4].filter((n) => decoded.length >= n &&
        (n === 3 ? freq3 : freq4).has(spell(decoded.slice(0, n))));
      return { page: p.page, offset: s.start, matchingLengths };
    }));
assert.equal(highlights.length, 16);
assert.deepEqual(highlights.filter((x) => x.matchingLengths.length), [
  { page: 0, offset: 0, matchingLengths: [4] },
  { page: 3, offset: 119, matchingLengths: [3] },
]);

console.log("[source] isolated red3:", red3);
console.log("[result] key", spell(key), "p3 red ->",
  spell(decrypt(marked3, key)), "p0 red4 ->",
  spell(decrypt(first.slice(0, 4), key)), "(BOOK)");
console.log("[continuation] p0 entire original red13 ->",
  spell(decrypt(first, key)), "(not plaintext)");
console.log("[null] frozen dictionary types GP3", freq3.size,
  "GP4", freq4.size, "original lexical entries", lexiconTokens);
console.log("[all-key exact] 29^3 =", 29 ** 3,
  "joint dictionary-compatible keys =", compatibleKeys.length);
for (const item of compatibleKeys) console.log(" ", JSON.stringify(item));
console.log("[other originals] other red span 3/4 starts have no hits:",
  highlights.length, "spans; positives only p0/p3");
console.log("[classification] exploratory source-key candidate. The four-rune",
  "p0 prefix was inspected post hoc. No full text or authentic key recovered.");
