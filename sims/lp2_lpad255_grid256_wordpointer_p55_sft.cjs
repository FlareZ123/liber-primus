"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "lp2-grid-256.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");

const parse = parseLP2Words(transcript);
assert.equal(parse.runeCount, 12956);
assert.equal(parse.words.length, 2896);
const chapter = parse.words
  .filter((word) => word.startPage >= 3 && word.endPage <= 7)
  .map((word) => [...word.runes].map((rune) => corpus.runes.indexOf(rune)));
assert.equal(chapter.length, 255);
assert.equal(chapter.reduce((sum, word) => sum + word.length, 0), 1145);
assert.equal(Math.max(...chapter.map((word) => word.length)), 12);

const redSites = [[3, 0], [3, 119], [6, 71], [7, 194]];
const redStart = redSites.map(([page, position]) => {
  const p = ink.pages.find((entry) => entry.page === page);
  assert(p.red_spans.some((span) => span.start === position));
  return corpus.pages.find((entry) => entry.page === page).indices[position];
});
assert.deepEqual(redStart, [20, 13, 24, 23]); // Original red initials L P A D.

const values = grid.bytes;
assert.equal(values.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(values)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) ring.push(31 * 8 + col);
for (let row = 30; row > 0; row--) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
assert.deepEqual(values.flatMap((v, i) => v === 0 ? [i] : []), [192, 229]);
assert.equal(ring.indexOf(192), 52);
assert.equal(values[ring[52]], 0);

const p55 = corpus.pages.find((entry) => entry.page === 55).indices;
const p57 = corpus.pages.find((entry) => entry.page === 57).indices.slice(0, 76);
assert.equal(p55.length, 76);
assert.equal(p57.length, 76);
assert.equal(p55[52], 14); // Original X at the table's zero sentinel.

const mod29 = (v) => ((v % 29) + 29) % 29;

/**
 * Address a 255-word dictionary with 256 byte values, reserving 0 as F.
 * @param {"first"|"last"} end Which unchanged word endpoint supplies a GP rune.
 * @returns {number[]} One source-derived GP29 key rune per table perimeter cell.
 */
function pointerKey(end) {
  return ring.map((offset) => {
    const address = values[offset];
    if (address === 0) return 0;
    const word = chapter[address - 1];
    return end === "first" ? word[0] : word[word.length - 1];
  });
}

/** @param {number[]} input GP29 indices. */
function coincidence(input) {
  const count = Array(29).fill(0);
  for (const v of input) count[v]++;
  const n = input.length;
  return count.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}

assert.equal(coincidence(p55).toFixed(14), "0.03789473684211");
const frozen = [
  {end: "first", sign: -1, ioc: "0.03894736842105"},
  {end: "first", sign: +1, ioc: "0.03543859649123"},
  {end: "last", sign: -1, ioc: "0.03508771929825"},
  {end: "last", sign: +1, ioc: "0.03543859649123"},
];
console.log("Original LP2: p3–7=255 words/1145 runes, table=256 bytes, p55=76 runes");
console.log("Red LPAD indices:", redStart.join(","), "zero table slots: 192,229");
for (const item of frozen) {
  const key = pointerKey(item.end);
  const decoded = p55.map((cipher, i) => mod29(cipher + item.sign * key[i]));
  assert.equal(coincidence(decoded).toFixed(14), item.ioc);
  const reencryption = decoded.map((plain, i) => mod29(plain - item.sign * key[i]));
  assert.deepEqual(reencryption, p55);

  const synthetic = p57.map((plain, i) => mod29(plain - item.sign * key[i]));
  assert.deepEqual(synthetic.map((cipher, i) => mod29(cipher + item.sign * key[i])), p57);
  console.log(item.end, item.sign, "IoC", item.ioc,
    "first24:", decoded.slice(0, 24).map((value) => corpus.translit[value]).join(" "));
}
console.log("PASS: original-source dictionary pointer and p55 inversion gates");
