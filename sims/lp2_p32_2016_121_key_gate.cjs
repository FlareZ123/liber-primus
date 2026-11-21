"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const chunks = read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(chunks.length, 57);
const pageText = chunks[32];
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeToTranslit = new Map(corpus.runes.map((r, i) => [r, corpus.translit[i]]));
const translitIndex = new Map(corpus.translit.map((s, i) => [s, i]));
translitIndex.set("K", translitIndex.get("C"));
translitIndex.set("V", translitIndex.get("U"));
const digraphs = new Set(corpus.translit.filter((s) => s.length === 2));

// Exact alphabetic words from the authenticated 2016 clear-signed message:
// body = 29 words from "The" through "direction"; coda = six words in
// "Seek and you will be found." Source: resources/cicada2016-4gq25.md.
const bodyWords = [
  "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE", "DEVOTED",
  "LIBER", "PRIMUS", "IS", "THE", "WAY", "ITS", "WORDS", "ARE", "THE",
  "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD", "AND", "THEIR",
  "NUMBERS", "ARE", "THE", "DIRECTION",
];
const codaWords = ["SEEK", "AND", "YOU", "WILL", "BE", "FOUND"];

function gpTokens(word) {
  const s = word.toUpperCase().replaceAll("K", "C").replaceAll("V", "U");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (digraphs.has(pair)) { out.push(pair); i += 2; }
    else { out.push(s[i]); i += 1; }
  }
  for (const token of out) assert.ok(translitIndex.has(token), `Unknown GP token ${token}`);
  return out;
}

const bodyKey = bodyWords.flatMap((w) => gpTokens(w).map((t) => translitIndex.get(t)));
const codaNumbers = codaWords.map((w) => gpTokens(w)
  .reduce((sum, t) => sum + translitIndex.get(t), 0) % 29);
const key = [...bodyKey, ...codaNumbers];
const cipher = [...pageText].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch));

assert.equal(bodyWords.length, 29);
assert.equal(bodyKey.length, 115);
assert.deepEqual(codaNumbers, [27, 27, 1, 28, 6, 7]);
assert.equal(key.length, 121);
assert.equal(cipher.length, 121);
assert.equal(corpus.pages.find((p) => p.page === 32).runic_count, 121);

function decrypt(kind) {
  let i = 0;
  let output = "";
  for (const ch of pageText) {
    if (!runeIndex.has(ch)) { output += ch; continue; }
    const c = runeIndex.get(ch), k = key[i++];
    const p = kind === "vigenere-minus" ? (c - k + 29) % 29
      : kind === "vigenere-plus" ? (c + k) % 29
      : kind === "beaufort" ? (k - c + 29) % 29
      : (() => { throw new Error(`Unknown mode ${kind}`); })();
    output += corpus.runes[p];
  }
  assert.equal(i, 121);
  return [...output].map((ch) => runeToTranslit.get(ch) ?? ch).join("");
}

const outputs = {
  vigenereMinus: decrypt("vigenere-minus"),
  vigenerePlus: decrypt("vigenere-plus"),
  beaufort: decrypt("beaufort"),
};
const keyHash = crypto.createHash("sha256").update(Buffer.from(key)).digest("hex");
const cipherHash = crypto.createHash("sha256").update(Buffer.from(cipher)).digest("hex");
console.log(JSON.stringify({
  bodyWords: bodyWords.length,
  bodyRuneCount: bodyKey.length,
  codaWords: codaWords.length,
  codaNumbers,
  keyLength: key.length,
  keySha256: keyHash,
  p32RuneCount: cipher.length,
  p32IndexSha256: cipherHash,
  outputs,
  decision: "No readable plaintext under the three standard additive orientations; length match alone does not establish a key."
}, null, 2));
