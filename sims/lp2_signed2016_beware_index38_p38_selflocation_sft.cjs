"use strict";

/**
 * SFT for the authenticated signed-2016 BEWARE index38 -> p38 self-location.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedTokens = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
const signed = signedTokens.map((word, index) => {
  const values = gp(word);
  return {
    index,
    label: word.toUpperCase(),
    values,
    length: values.length,
    gp0: sum(values),
  };
});
assert.equal(signed.length, 43);

const predecessorEchoes = [];
for (let index = 1; index < signed.length; index += 1) {
  const current = signed[index];
  if (current.gp0 >= grid.bytes.length) continue;
  const low60 = grid.bytes[current.gp0] % 60;
  if (low60 === signed[index - 1].gp0) {
    predecessorEchoes.push({
      index,
      predecessor: signed[index - 1].label,
      predecessorGp0: signed[index - 1].gp0,
      current: current.label,
      currentGp0: current.gp0,
      p50Low60: low60,
    });
  }
}

assert.deepEqual(predecessorEchoes, [{
  index: 38,
  predecessor: "LUCK",
  predecessorGp0: 31,
  current: "BEWARE",
  currentGp0: 88,
  p50Low60: 31,
}]);

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * Parse canonical words across line and page breaks.
 *
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,
 *   values:number[]
 * }>}
 */
function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const words = parseWords();
const sameIndexStateHits = [];

for (let index = 0; index < signed.length; index += 1) {
  const target = signed[index];
  const matches = words.filter((word) =>
    word.startPage === index &&
    word.endPage === index &&
    word.values.length === target.length &&
    sum(word.values) === target.gp0
  );

  if (matches.length > 0) {
    sameIndexStateHits.push({
      index,
      label: target.label,
      matches: matches.map((word) => ({
        start: word.startOffset,
        end: word.endOffset,
      })),
      predecessorEcho:
        index > 0 &&
        target.gp0 < grid.bytes.length &&
        grid.bytes[target.gp0] % 60 === signed[index - 1].gp0,
    });
  }
}

assert.deepEqual(
  sameIndexStateHits.map((hit) => hit.index),
  [6, 11, 21, 33, 34, 38, 40]
);
assert.deepEqual(
  sameIndexStateHits.filter((hit) => hit.predecessorEcho).map((hit) => hit.index),
  [38]
);

const bewareHit = sameIndexStateHits.find((hit) => hit.index === 38);
assert.deepEqual(bewareHit.matches, [{ start: 57, end: 62 }]);
assert.equal(signed[38].label, "BEWARE");
assert.equal(signed[38].length, 6);
assert.equal(signed[38].gp0, 88);
assert.equal(signed[37].label, "LUCK");
assert.equal(signed[37].gp0, 31);

console.log(JSON.stringify({
  status: "PASS",
  authenticatedSourceSelector: predecessorEchoes[0],
  sameIndexStateHitCount: sameIndexStateHits.length,
  sameIndexStateHits,
  selectedPage: {
    page: 38,
    sourceWordIndex: 38,
    sourceWord: "BEWARE",
    receiver: [57, 62],
  },
  classification:
    "Source-state page selector: BEWARE is the only signed-2016 word whose p50-low GP0 state echoes its predecessor, and its zero-based source index38 points to p38, where exactly one complete word has BEWARE length/GP0 at offsets57..62.",
}, null, 2));
