"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tokens = grid.rows.flat();
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gpValues(word) {
  const normalized = word.toUpperCase()
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
    const token = gpTokens.find(row => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(text) {
  return text.split(/[^A-Za-z]+/).filter(Boolean)
    .flatMap(gpValues)
    .reduce((sum, value) => sum + value, 0);
}

function clearSignedBody(text, sourcePath) {
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  const start = text.indexOf(marker);
  assert.notEqual(start, -1, sourcePath + " must be a clear-signed text source");
  let body = text.slice(start + marker.length);
  const blank = body.indexOf("\n\n");
  assert.notEqual(blank, -1, sourcePath + " has no clear-signed header/body separator");
  body = body.slice(blank + 2);
  const signature = body.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.notEqual(signature, -1, sourcePath + " has no PGP signature block");
  return body.slice(0, signature);
}

function cleanText(text) {
  return text
    .replace(/\b\S+@\S+\b/g, " ")
    .replace(/\b\S+\.onion\b/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/\be\.g\./gi, "eg")
    .replace(/\bi\.e\./gi, "ie");
}

function tableCell(index) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < 256);
  const token = tokens[index];
  const high60 = alphabet60.indexOf(token[0]);
  const low60 = alphabet60.indexOf(token[1]);
  const high59 = alphabet59.indexOf(token[0]);
  const low59 = alphabet59.indexOf(token[1]);
  assert.ok(high60 >= 0 && low60 >= 0);
  assert.ok(high59 >= 0 && low59 >= 0);
  const row = Math.floor(index / 8);
  const column = index % 8;
  return {
    index,
    row,
    column,
    onOuterRing: row === 0 || row === 31 || column === 0 || column === 7,
    token,
    base59: 59 * high59 + low59,
    base60: 60 * high60 + low60,
  };
}

const sourcePaths = [
  "resources/historical/cicada2013-first-onion-hello.asc",
  "resources/historical/cicada2013-forest-clue.asc",
  "resources/historical/cicada2013-if-you-followed.asc",
  "resources/historical/cicada2013-no-more-testing.asc",
  "resources/historical/cicada2013-second-onion-everything-you-need.asc",
  "resources/historical/cicada2013-second-onion-icmp-echo.asc",
  "resources/historical/cicada2013-welcome-and-congratulations.asc",
  "resources/external/2013-do-not-share-this-information-2.asc",
  "resources/historical/cicada2013-os-original-message.txt",
];
const osPath = sourcePaths[sourcePaths.length - 1];
const osScreen = read(osPath);
assert.ok(!osScreen.includes("-----BEGIN PGP SIGNED MESSAGE-----"));
assert.ok(osScreen.includes("The key is all around you."));
assert.ok(osScreen.trim().endsWith("3301"));

let sentenceCount = 0;
const equalPairs = [];
for (const sourcePath of sourcePaths) {
  const raw = read(sourcePath);
  const body = sourcePath === osPath ? raw : clearSignedBody(raw, sourcePath);
  const normalized = cleanText(body);
  const sentences = normalized.split(/[.!?]+/u)
    .map(sentence => sentence.trim())
    .filter(sentence => /[A-Za-z]{2,}/u.test(sentence));
  sentenceCount += sentences.length;
  for (const sentence of sentences) {
    const words = (sentence.match(/[A-Za-z]+(?:'[A-Za-z]+)?/gu) || [])
      .map(word => ({word: word.toUpperCase(), gp0: gp0(word)}));
    for (let i = 0; i + 1 < words.length; i += 1) {
      if (words[i].gp0 === words[i + 1].gp0) {
        equalPairs.push({
          source: sourcePath,
          left: words[i].word,
          right: words[i + 1].word,
          gp0: words[i].gp0,
          cell: tableCell(words[i].gp0),
        });
      }
    }
  }
}

assert.equal(sourcePaths.length, 9);
assert.equal(sentenceCount, 66);
assert.equal(equalPairs.length, 4);
assert.deepEqual(
  equalPairs.map(row => [row.left, row.right, row.gp0, row.cell.onOuterRing]),
  [
    ["YOU'RE", "LOOKING", 52, false],
    ["WON'T", "BE", 35, false],
    ["DRAWN", "TOGETHER", 67, false],
    ["ALL", "AROUND", 64, true],
  ]
);
const ringPairs = equalPairs.filter(row => row.cell.onOuterRing);
assert.equal(ringPairs.length, 1);
assert.deepEqual([ringPairs[0].left, ringPairs[0].right], ["ALL", "AROUND"]);

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.deepEqual(grid.lp2_pages, [49, 50, 51]);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(tokens.length, 256);
assert.equal(alphabet59.length, 59);

const phrase = "THE KEY IS ALL AROUND YOU";
const phraseWords = phrase.split(" ");
const wordValues = phraseWords.map(word => ({word, gp0: gp0(word)}));
assert.deepEqual(wordValues.map(row => row.gp0), [20, 49, 25, 64, 64, 30]);
assert.equal(gp0(phrase), 252);

const cell64 = tableCell(64);
const cell252 = tableCell(252);
assert.deepEqual(
  [cell64.row, cell64.column, cell64.onOuterRing, cell64.token, cell64.base59, cell64.base60],
  [8, 0, true, "22", 120, 122]
);
assert.deepEqual(
  [cell252.row, cell252.column, cell252.onOuterRing, cell252.token, cell252.base59, cell252.base60],
  [31, 4, true, "30", 177, 180]
);
assert.equal(gp0("SHED"), 64);
assert.equal(gp0("PARABLE"), 120);

const token22Cells = tokens.map((token, index) => token === "22" ? index : -1)
  .filter(index => index >= 0);
assert.deepEqual(token22Cells, [64, 104]);
const tableValues60 = tokens.map(token =>
  60 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1])
);
assert.deepEqual(
  tableValues60.map((value, index) => value === 180 ? index : -1)
    .filter(index => index >= 0),
  [252]
);

console.log(JSON.stringify({
  source_count: sourcePaths.length,
  clear_signed_sources: 8,
  os_message_is_pgp_signed: false,
  sentence_fragments: sentenceCount,
  equal_adjacent_gp0_pairs: equalPairs,
  only_outer_ring_pair: ringPairs[0],
  phrase_word_values: wordValues,
  phrase_total_gp0: gp0(phrase),
  wordwise_cell64: cell64,
  sentence_total_cell252: cell252,
  shed_gp0: gp0("SHED"),
  parable_gp0: gp0("PARABLE"),
  token22_occurrences: token22Cells,
  unique_base60_value180_cells: [252],
  scope: "Fixed local 2013 text corpus only; this is a familywise control, not a p-value, global radix proof, plaintext recovery, or cipher."
}, null, 2));
