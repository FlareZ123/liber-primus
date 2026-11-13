"use strict";
/**
 * 43 signed-2016 words => 43 original-table compass bytes => 43 original p32
 * rune key symbols => 43 literal p55 inner runes, native GP29 inverse.
 * Node 22, Windows: node sims/lp2_p32_route43_p55_interior_peel_sft.cjs
 *
 * Original source input and all 214 contiguous 43-cell address windows;
 * PEEL is a retrospective four-rune hit, NOT recovered LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const t = read("resources/liber-primus/lp2-transcription.txt").split("%");
const g = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(t.length, 57); // Physical p50 is rune-free, omitted in transcription.
const runeId = new Map(c.runes.map((r, i) => [r, i]));
const parse = s => [...s].filter(x => runeId.has(x)).map(x => runeId.get(x));
const words = t[54].replace(/[\s/]/g, "").split(/[-.&$§]/g)
  .map(parse).filter(x => x.length);
const p55 = c.pages.find(x => x.page === 55).indices;
assert.equal(words.length, 17);
assert.deepEqual(words.flat(), p55);
assert.equal(words[0].length, 1); // Incoming word's FINAL rune from p54.
const inner = words.slice(1).flatMap(word => word.slice(1, -1));
assert.equal(inner.length, 43);
const p32 = c.pages.find(x => x.page === 32).indices;
assert.equal(p32.length, 121);
assert.equal(p32.slice(33, 38).map(x => c.translit[x]).join(""), "HOMEX");
assert.deepEqual([82, 83, 127, 128].map(i => g.bytes[i]),
  [201, 193, 193, 201]);
const dirs = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],
  [0,-1],[-1,-1]];
const wrap = x => ((x % 11) + 11) % 11;
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number[]} bytes */
function route(bytes) {
  let row = 3, col = 0;
  const result = [];
  for (const byte of bytes) {
    const [dr, dc] = dirs[byte & 7], dist = byte >> 3;
    row = wrap(row + dr * dist);
    col = wrap(col + dc * dist);
    result.push(p32[row * 11 + col]);
  }
  return { result, end: row * 11 + col };
}
const selected = route(g.bytes.slice(84, 127));
assert.equal(selected.result.length, 43);
assert.equal(selected.end, 37);
const decoded = inner.map((v, i) => mod29(v - selected.result[i]));
const decodedText = decoded.map(x => c.translit[x]).join("");
assert.equal(decodedText,
  "JPEELITHSSXNTHAFROEODBRAEIANJAEDLEADAAEADEMRILOEMJYR");
const peel = ["P","E","E","L"].map(x => c.translit.indexOf(x));
assert.deepEqual(decoded.slice(1, 5), peel);
const ioc = a => {
  const counts = Array(29).fill(0);
  a.forEach(v => counts[v]++);
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
};
assert.equal(Number(ioc(decoded).toFixed(12)), 0.035437430786);

// Exactly all 214 source-order contiguous 43-byte windows, both signs,
// same p32 map start, same entire original p55 inner stream. Do not search
// varying length, map rotation, hidden offsets or arbitrary text.
const hits = [];
for (let start = 0; start + 43 <= g.bytes.length; start++) {
  const key = route(g.bytes.slice(start, start + 43)).result;
  for (const sign of [-1, 1]) {
    const plain = inner.map((v, i) => mod29(v + sign * key[i]));
    for (let i = 0; i <= plain.length - peel.length; i++) {
      if (peel.every((v, j) => plain[i + j] === v))
        hits.push({ start, sign, position: i });
    }
  }
}
assert.deepEqual(hits, [{ start: 84, sign: -1, position: 1 }]);
// Genuine native-GP source plant confirms inverse recovers all 43 symbols.
const planted = c.pages.find(x => x.page === 57).indices.slice(0, 43);
const ct = planted.map((v, i) => mod29(v + selected.result[i]));
assert.deepEqual(ct.map((v, i) => mod29(v - selected.result[i])),
  planted);
console.log(JSON.stringify({
  signedWords: 43, printedTableCells: g.bytes.length,
  selectedTableInterval: [84, 127],
  p32RouteEndpoint: selected.end,
  originalP55Runes: p55.length, originalP55Interior: inner.length,
  directInverseIoC: ioc(decoded), directInverseText: decodedText,
  retrospectivePeelHits: hits, comparisonVariants: 214 * 2,
  independentSourcePositive: "43/43",
  recoveredUnknownPlaintext: false,
}, null, 2));
