"use strict";
/**
 * SFT: fixed p6 4|1|4|2 GP0 word blocks against every original LP2 11-rune fragment.
 * Independent of a cipher proposal; prints the full source-only comparison.
 * Run with Node.js 22: node sims/lp2_p6_p32_dh23_block_difference_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const pages = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%");
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} page */
function printedWords(page) {
  const out = [];
  let values = [], offset = 0;
  const flush = () => {
    if (!values.length) return;
    out.push({ start: offset - values.length, end: offset,
      values: values.slice(), length: values.length,
      sum: values.reduce((s, v) => s + v, 0) });
    values = [];
  };
  for (const ch of Array.from(pages[page])) {
    const v = lookup.get(ch);
    if (v !== undefined) { values.push(v); offset++; }
    else if ("-.$&§".includes(ch)) flush();
  }
  flush();
  return out;
}

/** @param {number} page */
function fragments(page) {
  const out = [];
  let values = [], offset = 0;
  const flush = () => {
    if (!values.length) return;
    out.push({ page, index: out.length, start: offset - values.length,
      length: values.length, values: values.slice() });
    values = [];
  };
  for (const ch of Array.from(pages[page])) {
    const v = lookup.get(ch);
    if (v !== undefined) { values.push(v); offset++; }
    else if (ch === "/" || /\s/u.test(ch)) { /* layout line break */ }
    else flush();
  }
  flush();
  return out;
}

/** @param {number[]} values @param {number[]} lengths */
function blockSums(values, lengths) {
  let at = 0;
  const result = lengths.map(n => {
    const sum = values.slice(at, at + n).reduce((s, v) => s + v, 0);
    at += n;
    return sum;
  });
  assert.equal(at, values.length);
  return result;
}

/** @param {number} page @param {number} start */
function redWords(page, start) {
  const span = ink.pages.find(p => p.page === page).red_spans.find(s => s.start === start);
  assert.ok(span);
  return printedWords(page).filter(w => w.start >= span.start && w.end <= span.start + span.length);
}

const p6Words = redWords(6, 71);
const p15Words = redWords(15, 9);
const p6Lengths = p6Words.map(w => w.length);
const p6Sums = p6Words.map(w => w.sum);
assert.deepEqual(p6Lengths, [4, 1, 4, 2]);
assert.deepEqual(p6Sums, [71, 19, 65, 26]);
assert.deepEqual(p15Words.map(w => w.length), [4, 2, 5]);
assert.deepEqual(p15Words.map(w => w.sum), [51, 6, 63]);

const all = Array.from({ length: 56 }, (_, page) => fragments(page))
  .flat().filter(f => f.length === 11);
assert.equal(all.length, 28);
const p32 = fragments(32);
assert.equal(p32.length, 22);
const chosen = p32[7];
assert.equal(chosen.start, 33);
assert.deepEqual(chosen.values, [8, 3, 19, 18, 14, 7, 23, 15, 20, 0, 23]);

const rows = all.map(f => {
  const sums = blockSums(f.values, p6Lengths);
  return { page: f.page, index: f.index, start: f.start,
    sums, differences: p6Sums.map((n, i) => n - sums[i]) };
});
const selected = rows.find(f => f.page === 32 && f.index === 7);
assert.ok(selected);
assert.deepEqual(selected.sums, [48, 14, 65, 23]);
assert.deepEqual(selected.differences, [23, 5, 0, 3]);
assert.deepEqual(rows.filter(x => x.differences[0] === 23).map(x => [x.page, x.index]), [[32, 7]]);
assert.deepEqual(rows.filter(x => x.differences[0] === 23 && x.differences[1] === 5)
  .map(x => [x.page, x.index]), [[32, 7]]);
assert.deepEqual(rows.filter(x => x.differences.join(",") === "23,5,0,3")
  .map(x => [x.page, x.index]), [[32, 7]]);
const p32Other = rows.find(x => x.page === 32 && x.index === 3);
assert.ok(p32Other);
assert.deepEqual(p32Other.differences, [28, 2, -9, -11]);

const p15Sums = p15Words.map(w => w.sum);
const p15Leading235 = all.filter(f => {
  const candidate = blockSums(f.values, [4, 2, 5]);
  return p15Sums[0] - candidate[0] === 23 &&
    p15Sums[1] - candidate[1] === 5;
});
assert.equal(p15Leading235.length, 0);
console.log(JSON.stringify({
  classification: "Exact arithmetic relation, not an authenticated cipher operation",
  p6: { lengths: p6Lengths, sums: p6Sums },
  p32Fragment7: { start: chosen.start, values: chosen.values, blocks: selected.sums, differences: selected.differences },
  controls: { elevenRuneOriginalFragments: all.length, p32ElevenRuneFragments:
    rows.filter(f => f.page === 32), leadingDifference23Count:
    rows.filter(x => x.differences[0] === 23).length,
    p15ThreeWordAlternativeLeading23And5: p15Leading235.length },
  plaintextRecovered: false
}, null, 2));
