"use strict";

/**
 * Source-locked, all-word GP29 outside-in H inverse.
 * Research experiment: six finite H-family decoders, with exact forward replay.
 * Run from this repository with Node.js 22; no external packages or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const manuscript = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const glyph = new Map(corpus.runes.map((rune, index) => [rune, index]));
const words = manuscript
  .replace(/[\/\r\n%]/g, "")
  .split(/[-.&$]/)
  .filter((item) => item.length > 0 && [...item].every((rune) => glyph.has(rune)))
  .map((item) => [...item].map((rune) => glyph.get(rune)));
const reference = corpus.pages.flatMap((page) => page.indices);
const source = words.flat();

assert.equal(corpus.pages.length, 58);
assert.equal(words.length, 2941);
assert.equal(source.length, 13136);
assert.deepEqual(source, reference, "Exact full original GP29 source, including 32 cross-page words");
assert.equal(corpus.pages.slice(0, 56).reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);

const MOD = 29;
const INV_TWO = 15;
const mod = (x) => (x % MOD + MOD) % MOD;

/**
 * H(x,y)=(x-y,x+y) over GF29; inverse H^-1(u,v)=((u+v)/2,(v-u)/2).
 * @param {number[]} word GP29 original word.
 * @param {"one"|"three"|"depth"} clock Fixed one, DH e=3, or depth+1 shell rounds.
 * @param {1|-1} sign H or H^-1.
 * @returns {number[]} Transformed rune values with the untouched odd-length center.
 */
function transform(word, clock, sign) {
  const output = word.slice();
  for (let depth = 0; depth < Math.floor(word.length / 2); depth += 1) {
    let a = word[depth];
    let b = word[word.length - 1 - depth];
    const rounds = clock === "three" ? 3 : clock === "depth" ? depth + 1 : 1;
    for (let round = 0; round < rounds; round += 1) {
      if (sign === 1) {
        [a, b] = [mod(a - b), mod(a + b)];
      } else {
        [a, b] = [mod(INV_TWO * (a + b)), mod(INV_TWO * (b - a))];
      }
    }
    output[depth] = a;
    output[word.length - 1 - depth] = b;
  }
  return output;
}

/** @param {number[]} values GP29 values @returns {number} Chance-normalized IoC. */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return 29 * counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const modes = [
  ["one", 1], ["one", -1],
  ["three", 1], ["three", -1],
  ["depth", 1], ["depth", -1],
];
const all = [];
for (const [clock, sign] of modes) {
  const transformedWords = words.map((word) => transform(word, clock, sign));
  const decoded = transformedWords.flat();
  const restored = transformedWords.flatMap((word) => transform(word, clock, -sign));
  assert.deepEqual(restored, reference, "13,136 / 13,136 exact GP29 re-encryption");
  let cursor = 0;
  const records = [];
  for (let page = 0; page < 58; page += 1) {
    const len = corpus.pages[page].indices.length;
    if (page < 56 && len > 1) {
      const plaintext = decoded.slice(cursor, cursor + len);
      records.push({ page, runes: len, ioc: ioc(plaintext) });
    }
    cursor += len;
  }
  assert.equal(cursor, decoded.length);
  const top = records.reduce((best, rec) => rec.ioc > best.ioc ? rec : best);
  const p55 = records.find((record) => record.page === 55);
  const start55 = corpus.pages.slice(0, 55).reduce((sum, page) => sum + page.indices.length, 0);
  const p55Text = decoded.slice(start55, start55 + 76).map((x) => corpus.translit[x]).join("");
  const fullIoC = ioc(decoded.slice(0, 12956));
  const meanPageIoC = records.reduce((sum, rec) => sum + rec.ioc, 0) / records.length;
  const id = clock + (sign > 0 ? "+" : "-");
  all.push({ id, fullIoC, meanPageIoC, max: top, page55: p55.ioc });
  console.log(JSON.stringify({
    mode: id, unknownRunes: 12956, unknownPages: records.length,
    fullIoC, meanPageIoC, maxPage: top, page55IoC: p55.ioc,
    originalPage55DecodedTransliteration: p55Text,
    plantedCompleteWordRoundTrip: "13136/13136",
  }));
}
const highest = all.reduce((best, candidate) => candidate.max.ioc > best.max.ioc ? candidate : best);
assert.equal(highest.max.page, 55);
assert.equal(highest.id, "one-");
assert.ok(Math.abs(highest.max.ioc - 1.1396491228070176) < 1e-12);
assert.ok(Math.abs(ioc(corpus.pages[57].indices) - 1.818589025755879) < 1e-12);
console.log("PASS: all six original-input decoders reversible; highest unsolved page IoC " + highest.max.ioc.toFixed(9) + " versus clear p57 " + ioc(corpus.pages[57].indices).toFixed(9));
