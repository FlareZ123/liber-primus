"use strict";
/**
 * Original LP2 cuneiform red-section, printed-line bookcode and p50 SW rim.
 * Read-only SFT. Node 22, CommonJS. Run from repository root.
 *
 * Independent source selectors:
 * - repeated authentic cuneiform inscriptions (17,13)_60 and (55,1)_60;
 * - red heading at p33 rune91 starts exactly on printed line6;
 * - next red heading at p39 rune119 ends that section;
 * - actual printed lines, using first-party book-coordinate precedent.
 *
 * This is a conditional bookcode, not an authenticated LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const glyphs = new Map(corpus.runes.map((r, i) => [r, i]));
const lines = [];
const headings = [];
for (let p = 0; p < 56; p++) {
  if (p === 50) {
    assert.equal(corpus.pages[p].indices.length, 0, "rune-free numeric p50");
    continue;
  }
  // The physical transcription deliberately excludes the rune-free table p50.
  const source = physical[p < 50 ? p : p - 1];
  const rows = [];
  let current = [], offset = 0, lineStart = 0;
  for (const ch of source) {
    if (glyphs.has(ch)) {
      current.push(glyphs.get(ch));
      offset++;
    } else if (ch === "\n" && current.length) {
      rows.push({page: p, number: rows.length + 1, start: lineStart, end: offset, values: current});
      current = [];
      lineStart = offset;
    }
  }
  if (current.length) {
    rows.push({page: p, number: rows.length + 1, start: lineStart, end: offset, values: current});
  }
  assert.equal(offset, corpus.pages[p].indices.length, "original page rune count p" + p);
  const base = lines.length;
  lines.push(...rows);
  const annotation = ink.pages.find(x => x.page === p);
  for (const span of annotation?.red_spans || []) {
    const row = rows.findIndex(r => r.start <= span.start && r.end > span.start);
    assert(row >= 0, "red rune must be printed on a real line");
    headings.push({page: p, offset: span.start, n: span.length, index: base + row, exactLine: rows[row].start === span.start});
  }
}
headings.sort((a, b) => a.index - b.index);
assert.equal(lines.length, 594);
assert.equal(headings.length, 16);
const start = headings.find(h => h.page === 33 && h.offset === 91);
const stop = headings.find(h => h.page === 39 && h.offset === 119);
assert(start && stop && start.exactLine && stop.exactLine);
assert.equal(lines[start.index].number, 6);
assert.equal(lines[stop.index].number, 7);
const section = lines.slice(start.index, stop.index);
assert.equal(section.length, 69);
assert.equal(section.reduce((a, l) => a + l.values.length, 0), 1468);
assert.equal(corpus.pages.slice(33, 40).reduce((a, p) => a + p.indices.length, 0), 1680);
assert.equal(lines.filter(l => l.page >= 33 && l.page <= 39).length, 80);

/** @param {{values:number[]}[]} rows @param {number} row1 @param {number} col1 */
function at(rows, row1, col1) {
  const row = rows[row1 - 1];
  assert(row && col1 >= 1 && col1 <= row.values.length, "original line/rune pointer out of bounds");
  const code = row.values[col1 - 1];
  return {code, translit: corpus.translit[code], page: row.page, line: row.number, runeOffset: row.start + col1 - 1};
}
const a = at(section, 17, 13);
const b = at(section, 55, 1);
assert.deepEqual(a, {code:15,translit:"S",page:34,line:11,runeOffset:233});
assert.deepEqual(b, {code:7,translit:"W",page:38,line:3,runeOffset:44});
console.log("Original red-section line/rune addresses (17,13),(55,1):",a,b);
console.log("Bookcode reading: SW (southwest), conditional.");

const comparable = [];
for (let i = 0; i < headings.length; i++) {
  const heading = headings[i];
  const end = i + 1 < headings.length ? headings[i + 1].index : lines.length;
  const rows = lines.slice(heading.index, end);
  if (rows.length < 55 || rows[16].values.length < 13 || rows[54].values.length < 1) continue;
  comparable.push({page: heading.page, offset: heading.offset, lineCount: rows.length,
    reading: at(rows,17,13).translit + at(rows,55,1).translit});
}
assert.deepEqual(comparable.map(r => [r.page,r.offset,r.lineCount,r.reading]), [
  [8,0,79,"IS"], [15,9,85,"XA"], [27,0,65,"NNG"],
  [33,91,69,"SW"], [40,0,131,"RAE"]
]);
console.log("All other red-to-red sections supporting both literal coordinates:",comparable);

// Test one concrete next receiver suggested by the extracted compass direction:
// start at the southwest corner of the authentic p49-p51 32x8 numerical grid,
// traverse its 76-cell perimeter in either orientation, use the conventional
// base59/drop-f or base60 token reading modulo GP29 as a direct p55 76-rune key.
const tokens = grid.pages.flatMap(page => page.tokens);
const actual = corpus.pages[55].indices;
assert.equal(tokens.length, 256);
assert.equal(actual.length, 76);
const clockwise = [];
for (let row = 31; row >= 0; row--) clockwise.push([row,0]);
for (let col = 1; col <= 7; col++) clockwise.push([0,col]);
for (let row = 1; row <= 31; row++) clockwise.push([row,7]);
for (let col = 6; col >= 1; col--) clockwise.push([31,col]);
assert.equal(clockwise.length, 76);
const counterclockwise = [clockwise[0],...clockwise.slice(1).reverse()];
const nativeControl = corpus.pages[57].indices.slice(0,76);
assert.equal(nativeControl.length, 76);
/** @param {number[]} xs */
function ioc(xs) {
  const frequency = Array(29).fill(0);
  for (const x of xs) frequency[x]++;
  return frequency.reduce((s,v) => s + v*(v-1),0)/(xs.length*(xs.length-1));
}
const outcomes = [];
for (const [direction, coords] of [["SW clockwise",clockwise],["SW counterclockwise",counterclockwise]]) {
  const keyTokens = coords.map(([row,col]) => tokens[row*8+col]);
  for (const radix of [59,60]) {
    const alphabet = radix === 59 ? grid.alphabet.replace("f","") : grid.alphabet;
    assert.equal(alphabet.length,radix);
    const key = keyTokens.map(token => {
      const hi=alphabet.indexOf(token[0]), lo=alphabet.indexOf(token[1]);
      assert(hi >= 0 && lo >= 0, "table token outside chosen numeric base");
      return (radix*hi+lo)%29;
    });
    for (const sign of [-1,1]) {
      const plain = actual.map((c,i) => (c + sign*key[i] + 29)%29);
      assert(plain.every((x,i) => (x - sign*key[i] + 29)%29 === actual[i]));
      const seeded = nativeControl.map((v,i) => (v - sign*key[i] + 29)%29);
      assert.deepEqual(seeded.map((v,i) => (v + sign*key[i] + 29)%29), nativeControl);
      outcomes.push({direction,radix,sign,ioc:ioc(plain),
        output:plain.map(x=>corpus.translit[x]).join("")});
    }
  }
}
assert.equal(outcomes.length,8);
assert(outcomes.every(x=>x.ioc < 0.04));
console.log("SW-directed p50 rim --> p55 original 76-rune direct-key results:");
for (const result of outcomes) console.log(JSON.stringify(result));
console.log("PASS: source-only SW pointer is exact; eight simple rim-key receivers fail native-GP concentration and recover no readable original plaintext.");
