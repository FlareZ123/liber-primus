"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");

const alphaWords = line =>
  line.split(/[^A-Za-z0-9]+/u)
    .filter(token => /^[A-Za-z]+$/u.test(token))
    .map(word => word.toUpperCase());

let cursor = 0;
const lines = [];
for (const [lineIndex, text] of clear.split("\n").entries()) {
  const words = alphaWords(text);
  if (words.length === 0) continue;
  lines.push({line: lineIndex + 1, start: cursor, end: cursor + words.length - 1, words, text});
  cursor += words.length;
}
const words = lines.flatMap(line => line.words);
assert.equal(words.length, 43);

const pre = lines.find(line => line.end === 19);
assert.ok(pre);
const post = lines[lines.indexOf(pre) + 1];
assert.ok(post);
assert.deepEqual(pre.words.slice(-3), ["THE", "MAP", "THEIR"]);
assert.deepEqual(post.words.slice(0, 4), ["MEANING", "IS", "THE", "ROAD"]);
assert.equal(pre.text, "Liber Primus is the way.  Its words are the map, their ");
assert.equal(post.text, "meaning is the road, and their numbers are the direction.");
assert.equal(pre.text.length, 55);
assert.equal(post.text.length, 57);
assert.equal(pre.text.length + "meaning".length, 62);

const hardBreakAfter = new Set(lines.map(line => line.end));
assert.equal(hardBreakAfter.has(19), true);
assert.equal(hardBreakAfter.has(18), false);

const tokens = grid.pages.flatMap(page => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
assert.equal(tokens.length, 256);
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primeRank = new Map();
for (let n = 2, rank = 0; rank < 80; n += 1) {
  if (isPrime(n)) primeRank.set(n, ++rank);
}
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}
const rank = (cell, alphabet) => primeRank.get(decode(tokens[cell], alphabet)) || null;
const at = (row, col) => row * 8 + col;
const cells = {r17:at(27,3),r18:at(26,3),r19:at(25,3),r24:at(24,3),r21:at(5,3),r22:at(5,0),r23:at(5,1)};
assert.deepEqual(cells,{r17:219,r18:211,r19:203,r24:195,r21:43,r22:40,r23:41});
assert.deepEqual([
  rank(cells.r17,alpha60),rank(cells.r18,alpha60),rank(cells.r19,alpha59),
  rank(cells.r21,alpha60),rank(cells.r22,alpha59),rank(cells.r23,alpha59),rank(cells.r24,alpha60)
],[17,18,19,21,22,23,24]);

const theirRow = Math.floor(cells.r19 / 8);
assert.equal(theirRow - 5, 20);
for (let row = theirRow; row >= 5; row -= 1) {
  const cell = at(row,3);
  assert.notEqual(rank(cell,alpha60),20);
  assert.notEqual(rank(cell,alpha59),20);
}

assert.deepEqual(words.slice(17,25),["THE","MAP","THEIR","MEANING","IS","THE","ROAD","AND"]);
assert.deepEqual(words.slice(16,24),["ARE","THE","MAP","THEIR","MEANING","IS","THE","ROAD"]);
assert.deepEqual([words[19],words[20]],["THEIR","MEANING"]);
assert.equal(hardBreakAfter.has(19),true);
assert.deepEqual([words[18],words[19]],["MAP","THEIR"]);
assert.equal(hardBreakAfter.has(18),false);

console.log(JSON.stringify({
  status:"PASS: signed hard wrap aligns with p50 rank19->distance20 switch only under zero origin",
  signedBoundary:{afterSourceIndex:19,beforeSourceIndex:20,words:["THEIR","MEANING"],lineLengths:[55,57],firstLineLengthIfMeaningAppended:62},
  p50OperationBoundary:{numericRanks:[19,20],before:"direct prime-rank cell",after:"20-edge geometric distance",directCellsResume:[21,22,23,24]},
  rivals:{zeroOrigin:"THE MAP THEIR | MEANING IS THE ROAD AND",oneBased:"ARE THE MAP | THEIR MEANING IS THE ROAD",interpretation:"local zero-origin preference; ordinary ~60-column wrapping remains a plausible rival"},
  inferenceLimit:"does not authenticate a general zero-based word register, DIRECTION29, a cipher receiver, key, or unknown plaintext"
},null,2));
