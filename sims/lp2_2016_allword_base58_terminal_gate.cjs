"use strict";
/**
 * All-word test of the source-proposed 2016 word-map base-58 recursion.
 *
 * The signed 2016 words/map/numbers clue motivates, but does not specify,
 * GP-prime-sum(word) -> (page = sum % 58, zero-based word = floor(sum / 58)).
 * Apply exactly that already-published candidate pointer to every one of
 * the 2,896 source-visible unsolved words, following it until the rune-free
 * physical p50 table or a repeated book address. No phase or key fitting.
 *
 * Run: node sims/lp2_2016_allword_base58_terminal_gate.cjs
 * Node 22 CommonJS, built-ins only; reads original committed source.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const raw = read("resources/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndices = text => [...text].filter(ch => runeIndex.has(ch))
  .map(ch => runeIndex.get(ch));

assert.equal(corpus.pages.length, 58);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
  .digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const textPages = raw.split("%").filter(s => /[\u16A0-\u16FF]/u.test(s));
assert.equal(textPages.length, 57);
const pages = Array.from({length: 58}, () => []);
for (let i = 0; i < textPages.length; i++) {
  const physical = i >= 50 ? i + 1 : i;
  const unwrapped = textPages[i].replace(/[\/\s]/gu, "");
  pages[physical] = unwrapped.split(/[-.&$§,:!?]/u)
    .map(toIndices).filter(word => word.length);
}
assert.equal(pages[50].length, 0);
assert.equal(pages.reduce((n, page) => n + page.length, 0), 2973);
for (const pg of corpus.pages) {
  assert.deepEqual(pages[pg.page].flat(), pg.indices,
    "Physical-page word segmentation at p" + pg.page);
}
const sourceWords = parseLP2Words(raw, 55).words.map(w => toIndices(w.runes));
assert.equal(sourceWords.length, 2896);
assert.equal(sourceWords.reduce((n, word) => n + word.length, 0), 12956);
const p50 = grid.pages.find(p => p.page === 50);
assert(p50 && p50.bytes.length === 104 && p50.tokens.length === 104);

/** @param {number[]} word GP29 rune indices */
function address(word) {
  const sum = word.reduce((n, glyph) => n + corpus.prime[glyph], 0);
  return {sum, page: sum % 58, index: Math.floor(sum / 58)};
}

/** @param {number[]} initial GP29 word
 * @returns {{kind:"numeric",steps:number,index:number,byte:number}|{kind:"cycle",steps:number,at:string}}
 */
function walk(initial) {
  let at = address(initial);
  let steps = 0;
  const seen = new Set();
  while (true) {
    const id = at.page + ":" + at.index;
    if (seen.has(id)) return {kind:"cycle", steps, at:id};
    seen.add(id);
    steps++;
    if (at.page === 50) {
      assert(at.index < p50.bytes.length, "Numeric table address out of bounds");
      return {kind:"numeric", steps, index:at.index, byte:p50.bytes[at.index]};
    }
    const next = pages[at.page][at.index];
    assert(next, "Book word address out of bounds: " + id);
    at = address(next);
  }
}

const records = sourceWords.map(walk);
const numeric = records.filter(x => x.kind === "numeric");
const cyclic = records.filter(x => x.kind === "cycle");
assert.deepEqual([numeric.length, cyclic.length], [710, 2186]);
assert.equal(Math.max(...records.map(x => x.steps)), 40);
const tableHits = new Map();
for (const hit of numeric)
  tableHits.set(hit.index, (tableHits.get(hit.index) || 0) + 1);
assert.deepEqual(Array.from(tableHits).sort((a,b)=>a[0]-b[0]),
  [[0,40],[1,55],[2,586],[3,20],[4,3],[5,4],[6,2]]);
const payload = numeric.map(x => x.byte);
assert.equal(payload.filter(n => n >= 32 && n <= 126).length, 57);
assert.deepEqual([...new Set(payload)].sort((a,b)=>a-b),
  [28,58,111,142,173,193,201]);

// Original-source positive navigation controls from the previously frozen
// 2016 signed word-map reading. These check indexing and the real p56 solve.
assert.deepEqual(address(toIndices("ᚦᛖ")), {sum:72,page:14,index:1});
assert.equal(pages[14][1].map(i => corpus.translit[i]).join(""), "FOLD");
assert.deepEqual(address(pages[14][1]), {sum:171,page:55,index:2});
assert.equal(pages[55][2].map(i => corpus.translit[i]).join(""), "SB");
assert.deepEqual(address(pages[55][2]), {sum:114,page:56,index:1});
assert.deepEqual(pages[56][1], [22,15,4]);
assert.deepEqual(pages[56][1].map((v,i) =>
  (v - [4,6,10][i] + 29) % 29), [18,9,23]);
assert.equal(pages[57][1].map(i => corpus.translit[i]).join(""), "LICE");
// A controlled direct table destination, X+U = 47+3 = 50, p50 cell zero.
assert.deepEqual(walk([14,1]), {kind:"numeric",steps:1,index:0,byte:142});

console.log(JSON.stringify({
  status:"No universal terminal decoder under the frozen 2016 base-58 word-walk",
  source:{words:sourceWords.length,runes:12956,pages:58},
  outcomes:{numeric:numeric.length,cycles:cyclic.length,
    largestPath:Math.max(...records.map(x=>x.steps))},
  numericTableVisits:Array.from(tableHits).sort((a,b)=>a[0]-b[0]),
  distinctEmittedByteValues:[...new Set(payload)].sort((a,b)=>a-b),
  printableEmittedBytes:57,
  interpretation:"75.5% of original word routes never reach a numeric cell. " +
    "Of the 24.5% that do, 586/710 collapse to the identical p50 cell 2. " +
    "No word-complete plaintext or unambiguous continuation is recovered."
}, null, 2));
