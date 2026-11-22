"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number[]} values @returns {number|null} */
function recursiveCore(values) {
  let layer = values.slice();
  while (layer.length > 1) layer = layer.slice(1, -1);
  return layer.length ? layer[0] : null;
}

/** @param {number[][]} words @returns {{cores:number[],gp0:number}} */
function signature(words) {
  const cores = words.map(recursiveCore).filter((value) => value !== null);
  return { cores, gp0: cores.reduce((sum, value) => sum + value, 0) };
}

/** @param {number} address @returns {number|null} */
function base59(address) {
  if (address < 0 || address >= tape.length) return null;
  const token = tape[address];
  return 59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1]);
}

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values.reduce((sum, value) => sum + value, 0);
}

const segments = raw.split("%").slice(0, 55);
const stream = segments.join("%");

/** @typedef {{page:number,value:number}[]} Word */
/** @type {Word[]} */
const words = [];
/** @type {{page:number,value:number}[]} */
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({ page: runePage, value: runeIndex.get(character) });
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line wrapping preserves a word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/** @type {Map<number, number[][]>} */
const completeWords = new Map();
for (let page = 0; page < segments.length; page += 1) {
  completeWords.set(
    physicalPage(page),
    words
      .filter((word) => word[0].page === page && word[word.length - 1].page === page)
      .map((word) => word.map((site) => site.value)),
  );
}
completeWords.set(50, []);

const pageCounts = new Map(
  corpus.pages
    .filter((page) => page.page <= 55)
    .map((page) => [page.page, page.indices.length]),
);
pageCounts.set(50, 0);

/** @type {Map<number, number[]>} */
const pagesByRuneCount = new Map();
for (const [page, count] of pageCounts) {
  if (!pagesByRuneCount.has(count)) pagesByRuneCount.set(count, []);
  pagesByRuneCount.get(count).push(page);
}

const p55 = signature(completeWords.get(55));
assert.deepEqual(p55.cores, [1, 6, 2, 11, 18]);
assert.equal(p55.gp0, 38);
assert.equal(tape[38], "2D");
assert.equal(base59(38), 131);
assert.equal(gp0("CIRCUMFERENCES"), 131);
assert.deepEqual(pagesByRuneCount.get(131), [22]);

const p22 = corpus.pages.find((page) => page.page === 22);
assert.ok(p22);
assert.equal(p22.indices.length, 131);

const pageRows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const currentSignature = signature(completeWords.get(page) || []);
  const output = base59(currentSignature.gp0);
  pageRows.push({
    page,
    coreCount: currentSignature.cores.length,
    coreGp0: currentSignature.gp0,
    base59Output: output,
    outputRuneCountTargets: output === null ? [] : (pagesByRuneCount.get(output) || []),
  });
}

const outputCountHits = pageRows.filter((row) => row.outputRuneCountTargets.length);
assert.deepEqual(outputCountHits, [{
  page: 55,
  coreCount: 5,
  coreGp0: 38,
  base59Output: 131,
  outputRuneCountTargets: [22],
}]);

console.log(JSON.stringify({
  status: "PASS",
  route: "p55 recursive SHED -> 38 -> p50[38]=2D -> base59 131=CIRCUMFERENCES -> unique 131-rune physical page p22",
  p55: {
    cores: p55.cores,
    coreGp0: p55.gp0,
    p50Token: tape[p55.gp0],
    base59Output: base59(p55.gp0),
    meaning: "CIRCUMFERENCES",
  },
  receiver: {
    page: p22.page,
    physicalRunes: p22.indices.length,
  },
  controls: {
    runeBearingPages: pageRows.length,
    outputCountHits,
  },
}, null, 2));
