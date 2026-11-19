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
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) { values.push(21); offset += 3; continue; }
    if (normalized.startsWith("IO", offset)) { values.push(27); offset += 2; continue; }
    const token = gpTokens.find(row => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}
function gp0(text) {
  return text.split(/[^A-Za-z]+/).filter(Boolean).flatMap(gpValues).reduce((a, b) => a + b, 0);
}
function clearSignedBody(text, sourcePath) {
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  const start = text.indexOf(marker);
  assert.notEqual(start, -1, sourcePath + " must be clear-signed");
  let body = text.slice(start + marker.length);
  const blank = body.indexOf("\n\n");
  assert.notEqual(blank, -1);
  body = body.slice(blank + 2);
  const signature = body.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.notEqual(signature, -1, sourcePath + " lacks signature block");
  return body.slice(0, signature);
}
function cleanText(text) {
  return text.replace(/\b\S+@\S+\b/g, " ")
    .replace(/\b\S+\.onion\b/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/\be\.g\./gi, "eg")
    .replace(/\bi\.e\./gi, "ie");
}
function outerRing() {
  const ring = [];
  for (let c = 0; c < 8; c += 1) ring.push(c);
  for (let r = 1; r < 32; r += 1) ring.push(r * 8 + 7);
  for (let c = 6; c >= 0; c -= 1) ring.push(31 * 8 + c);
  for (let r = 30; r >= 1; r -= 1) ring.push(r * 8);
  return ring;
}
function onOuter(index) {
  if (!Number.isInteger(index) || index < 0 || index >= 256) return false;
  const row = Math.floor(index / 8), col = index % 8;
  return row === 0 || row === 31 || col === 0 || col === 7;
}
function cell(index) {
  const token = tokens[index];
  const h60 = alphabet60.indexOf(token[0]), l60 = alphabet60.indexOf(token[1]);
  const h59 = alphabet59.indexOf(token[0]), l59 = alphabet59.indexOf(token[1]);
  assert.ok(h60 >= 0 && l60 >= 0 && h59 >= 0 && l59 >= 0);
  return {
    index, row: Math.floor(index / 8), column: index % 8, onOuterRing: onOuter(index),
    token, base59: 59 * h59 + l59, base60: 60 * h60 + l60
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
  "resources/historical/cicada2013-os-original-message.txt"
];
const osPath = sourcePaths[8];
const osScreen = read(osPath);
assert.ok(!osScreen.includes("-----BEGIN PGP SIGNED MESSAGE-----"));
assert.ok(osScreen.includes("The key is all around you."));
assert.ok(osScreen.trim().endsWith("3301"));

const ring = outerRing();
const ringIndex = new Map(ring.map((v, i) => [v, i]));
assert.equal(ring.length, 76);
assert.equal(ringIndex.get(64), 68);
assert.equal(ringIndex.get(252), 41);
assert.equal((ringIndex.get(252) - ringIndex.get(64) + 76) % 76, 49);
assert.equal((ringIndex.get(64) - ringIndex.get(252) + 76) % 76, 27);

const phraseWords = ["THE", "KEY", "IS", "ALL", "AROUND", "YOU"];
const phraseValues = phraseWords.map(gp0);
assert.deepEqual(phraseValues, [20, 49, 25, 64, 64, 30]);
assert.equal(phraseValues.reduce((a, b) => a + b, 0), 252);
const keyGroupSum = phraseValues[1] + phraseValues[3] + phraseValues[4];
const frameGroupSum = phraseValues[0] + phraseValues[2] + phraseValues[5];
assert.equal(keyGroupSum, 177);
assert.equal(frameGroupSum, 75);
const threeThree = [];
for (let mask = 0; mask < 64; mask += 1) {
  if (mask.toString(2).replace(/0/g, "").length !== 3) continue;
  let sum = 0;
  for (let i = 0; i < 6; i += 1) if ((mask >> i) & 1) sum += phraseValues[i];
  const other = 252 - sum;
  if ((sum === 177 && other === 75) || (sum === 75 && other === 177)) threeThree.push({mask, sum, other});
}
assert.equal(threeThree.length, 1);

const cell64 = cell(64), cell252 = cell(252);
assert.deepEqual([cell64.token, cell64.base59, cell64.base60], ["22", 120, 122]);
assert.deepEqual([cell252.token, cell252.base59, cell252.base60], ["30", 177, 180]);
assert.equal(gp0("SHED"), 64);
assert.equal(gp0("PARABLE"), 120);
const token22Cells = tokens.map((v, i) => v === "22" ? i : -1).filter(i => i >= 0);
assert.deepEqual(token22Cells, [64, 104]);
const value180Cells = tokens.map((v, i) => 60 * alphabet60.indexOf(v[0]) + alphabet60.indexOf(v[1]) === 180 ? i : -1).filter(i => i >= 0);
assert.deepEqual(value180Cells, [252]);

const p55 = corpus.pages.find(p => p.page === 55);
assert.equal(p55.runic_count, 76);
const p55LocallyOwned = p55.runic_count - 1; // first rune is carried from p54
assert.equal(p55LocallyOwned, 75);

let sentenceCount = 0, equalPairs = [], sixWordWindows = 0;
let total252Windows = 0, ringEqual64Windows = 0, key49ArcWindows = 0;
let partition75177Windows = 0, fullMotifWindows = 0;
const motifMatches = [];
for (let sourceIndex = 0; sourceIndex < sourcePaths.length; sourceIndex += 1) {
  const sourcePath = sourcePaths[sourceIndex];
  const raw = read(sourcePath);
  const body = sourcePath === osPath ? raw : clearSignedBody(raw, sourcePath);
  const sentences = cleanText(body).split(/[.!?]+/u)
    .map(s => s.trim()).filter(s => /[A-Za-z]{2,}/u.test(s));
  sentenceCount += sentences.length;
  for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex += 1) {
    const words = (sentences[sentenceIndex].match(/[A-Za-z]+(?:'[A-Za-z]+)?/gu) || [])
      .map(word => ({word: word.toUpperCase(), value: gp0(word)}));
    for (let i = 0; i + 1 < words.length; i += 1) {
      if (words[i].value === words[i + 1].value) {
        equalPairs.push({
          source: sourcePath, left: words[i].word, right: words[i + 1].word,
          gp0: words[i].value, cell: cell(words[i].value)
        });
      }
    }
    for (let start = 0; start + 6 <= words.length; start += 1) {
      sixWordWindows += 1;
      const window = words.slice(start, start + 6);
      const values = window.map(w => w.value);
      const total = values.reduce((a, b) => a + b, 0);
      if (total === 252) total252Windows += 1;
      const hasRingPair64 = values.some((v, i) => i < 5 && v === 64 && values[i + 1] === 64 && onOuter(v));
      if (hasRingPair64) ringEqual64Windows += 1;
      const clockwiseDistance = total < 256 && onOuter(total)
        ? (ringIndex.get(total) - ringIndex.get(64) + 76) % 76 : null;
      const hasKey49 = values.includes(49);
      const key49Arc = hasRingPair64 && hasKey49 && clockwiseDistance === 49;
      if (key49Arc) key49ArcWindows += 1;
      const target = total < 256 ? cell(total).base59 : null;
      let hasPartition = false;
      for (let mask = 0; mask < 64; mask += 1) {
        if (mask.toString(2).replace(/0/g, "").length !== 3) continue;
        let sum = 0;
        for (let i = 0; i < 6; i += 1) if ((mask >> i) & 1) sum += values[i];
        const other = total - sum;
        if ((sum === 75 && other === target) || (sum === target && other === 75)) {
          hasPartition = true;
          break;
        }
      }
      if (hasPartition) partition75177Windows += 1;
      const full = total === 252 && hasRingPair64 && key49Arc && hasPartition;
      if (full) {
        fullMotifWindows += 1;
        motifMatches.push({
          source: sourcePath, sentence_index: sentenceIndex, window_start: start,
          words: window.map(w => w.word), values, total, clockwiseDistance,
          base59CellValue: target
        });
      }
    }
  }
}
assert.equal(sourcePaths.length, 9);
assert.equal(sentenceCount, 66);
assert.equal(equalPairs.length, 4);
assert.deepEqual(
  equalPairs.map(p => [p.left, p.right, p.gp0, p.cell.onOuterRing]),
  [
    ["YOU'RE", "LOOKING", 52, false],
    ["WON'T", "BE", 35, false],
    ["DRAWN", "TOGETHER", 67, false],
    ["ALL", "AROUND", 64, true]
  ]
);
assert.equal(sixWordWindows, 466);
assert.equal(total252Windows, 3);
assert.equal(ringEqual64Windows, 1);
assert.equal(key49ArcWindows, 1);
assert.equal(partition75177Windows, 1);
assert.equal(fullMotifWindows, 1);
assert.deepEqual(motifMatches[0].words, phraseWords);
assert.equal(motifMatches[0].base59CellValue, 177);

console.log(JSON.stringify({
  sources: 9,
  clear_signed_sources: 8,
  os_message_is_pgp_signed: false,
  sentence_fragments: sentenceCount,
  adjacent_equal_gp0_pairs: equalPairs,
  six_word_windows: sixWordWindows,
  windows_total252: total252Windows,
  windows_ring_equal64: ringEqual64Windows,
  windows_key49_clockwise_arc: key49ArcWindows,
  windows_partition75_177: partition75177Windows,
  windows_full_motif: fullMotifWindows,
  full_motif_match: motifMatches[0],
  phrase_word_values: phraseValues,
  phrase_total: 252,
  ring: {length: 76, cell64_position: 68, cell252_position: 41, clockwise_arc: 49, complement: 27},
  phrase_partition: {key_all_around: keyGroupSum, the_is_you: frameGroupSum, unique_three_three_partitions: threeThree.length},
  cell64,
  cell252,
  p55: {runic_count: 76, locally_owned_count: p55LocallyOwned},
  token22_cells: token22Cells,
  base60_value180_cells: value180Cells,
  scope: "Fixed nine-source 2013 text corpus; uniqueness is a finite-corpus control, not a p-value or global radix proof."
}, null, 2));
