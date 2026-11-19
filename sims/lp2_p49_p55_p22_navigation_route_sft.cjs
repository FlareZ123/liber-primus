"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {string} relative @returns {any} */
function runJson(relative) {
  const output = execFileSync(process.execPath, [path.join(root, relative)], {
    encoding: "utf8",
    windowsHide: true,
  });
  return JSON.parse(output);
}

const p49Route = runJson("sims/lp2_p49_direction76_p55_receiver_sft.cjs");
const p55Route = runJson("sims/lp2_p55_circumferences131_p22_receiver_sft.cjs");

assert.equal(p49Route.status, "PASS");
assert.equal(p49Route.p49.coreGp0, 76);
assert.deepEqual(p49Route.p49.authenticatedLabel, ["DIRECTION"]);
assert.equal(p49Route.p55Receiver.physicalRunes, 76);

assert.equal(p55Route.status, "PASS");
assert.equal(p55Route.p55.coreGp0, 38);
assert.equal(p55Route.p55.base59Output, 131);
assert.equal(p55Route.p55.meaning, "CIRCUMFERENCES");
assert.equal(p55Route.receiver.page, 22);
assert.equal(p55Route.receiver.physicalRunes, 131);

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

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
  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

const segments = raw.split("%").slice(0, 55);
let words = [];
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of segments.join("%")) {
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

const p22 = signature(completeWords.get(22));
assert.deepEqual(p22.cores, [8, 2, 2, 7, 18, 7, 6, 16, 13, 0, 2, 21, 9]);
assert.equal(p22.gp0, 111);
assert.equal(tape[111], "1t");
assert.equal(base59(111), 113);

const p23 = signature(completeWords.get(23));
assert.deepEqual(p23.cores, [17, 17, 11, 8, 1, 1, 0, 19, 1, 20, 5, 3, 27, 24, 19, 17, 6, 18, 3, 17, 4, 23, 8]);
assert.equal(p23.nWords, 46);
assert.equal(p23.gp0, 269);

const p24 = signature(completeWords.get(24));
assert.deepEqual(p24.cores, [4, 11, 13, 9, 17, 0, 1, 26, 6, 13, 21, 22, 18, 9, 23, 22, 11, 17, 7, 10, 2, 1, 22, 11, 21, 27, 3, 16]);
assert.equal(p24.nWords, 64);
assert.equal(p24.gp0, 363);

const pageCounts = new Set(
  corpus.pages.filter((page) => page.page <= 55).map((page) => page.indices.length),
);
pageCounts.add(0);
assert.equal(pageCounts.has(113), false);

const signedStart = signed.indexOf("Hello.");
const signedEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
const signedWords = signed
  .slice(signedStart, signedEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
  .split(/\s+/);

const signedGp0 = new Set(signedWords.map(gp0));
const p57Gp0 = new Set(p57Words.map(gp0));
assert.equal(signedGp0.has(113), false);
assert.equal(p57Gp0.has(113), false);

// A 256-cell wrap is tested only as a diagnostic rival, not as a source-selected rule.
const p23Wrapped = base59(p23.gp0 % tape.length);
const p24Wrapped = base59(p24.gp0 % tape.length);
assert.deepEqual(p23Wrapped, { token: "04", value: 4 });
assert.deepEqual(p24Wrapped, { token: "3c", value: 215 });
assert.equal(signedGp0.has(p23Wrapped.value), false);
assert.equal(signedGp0.has(p24Wrapped.value), false);
assert.equal(p57Gp0.has(p23Wrapped.value), false);
assert.equal(p57Gp0.has(p24Wrapped.value), false);

console.log(JSON.stringify({
  status: "PASS",
  route: [
    "p49 recursive SHED -> 76 -> DIRECTION -> unique 76-rune p55",
    "p55 recursive SHED -> 38 -> 131=CIRCUMFERENCES -> unique 131-rune p22",
    "p22 same SHED -> 111 -> base59 113 -> no typed page/source/p57 receiver",
    "p23 same SHED -> 269 (outside 256); diagnostic mod256 index13 -> 04 -> 4, no signed/p57 word",
    "p24 same SHED -> 363 (outside 256); diagnostic mod256 index107 -> 3c -> 215, no signed/p57 word",
  ],
  p22Stop: {
    cores: p22.cores,
    coreGp0: p22.gp0,
    p50Token: tape[p22.gp0],
    base59Output: base59(p22.gp0),
    physicalRuneCountMatch: false,
    signed2016Gp0Match: false,
    solvedP57Gp0Match: false,
  },
  p23p24Stop: {
    p23: { words: p23.nWords, cores: p23.cores, gp0: p23.gp0, wrapped: p23Wrapped },
    p24: { words: p24.nWords, cores: p24.cores, gp0: p24.gp0, wrapped: p24Wrapped },
    wrappedValuesMatchSigned2016OrP57: false,
    wrapIsSourceSelected: false,
  },
  interpretation: "The numeric SHED route terminates at p22; use p22's independently established source instruction rather than tuning another numeric hop.",
}, null, 2));
