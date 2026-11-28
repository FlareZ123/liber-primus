"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const mod29 = (x) => ((x % 29) + 29) % 29;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

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
    if (normalized.startsWith("ING", offset)) { values.push(21); offset += 3; continue; }
    if (normalized.startsWith("IO", offset)) { values.push(27); offset += 2; continue; }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({ index, word: word.toUpperCase(), values: gp(word) }));
assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(30).map((row) => row.word), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD",
  "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

const window57 = [];
for (let start = 0; start + 13 <= sourceWords.length; start += 1) {
  const count = sourceWords.slice(start, start + 13).reduce((sum, row) => sum + row.values.length, 0);
  if (count === 57) window57.push(start);
}
assert.deepEqual(window57, [3, 30]);
assert.equal(sourceWords.slice(30).reduce((sum, row) => sum + row.values.length, 0), 57);

function presentations4(values) {
  assert.equal(values.length, 4);
  const outer = [values[0], values[3]];
  const inner = [values[1], values[2]];
  const out = [];
  for (const outerFirst of [true, false]) {
    const pairs = outerFirst ? [outer, inner] : [inner, outer];
    for (const leftMinusRight of [true, false]) {
      const differences = pairs.map(([left, right]) => mod29(leftMinusRight ? left - right : right - left));
      const sums = pairs.map(([left, right]) => mod29(left + right));
      for (const differenceFirst of [true, false]) {
        const first = differenceFirst ? differences : sums;
        const second = differenceFirst ? sums : differences;
        for (const bounce of [true, false]) {
          out.push({ outerFirst, leftMinusRight, differenceFirst, bounce,
            vector: first.concat(bounce ? second.slice().reverse() : second) });
        }
      }
    }
  }
  return out;
}

function presentations5(values) {
  assert.equal(values.length, 5);
  const outer = [values[0], values[4]];
  const inner = [values[1], values[3]];
  const center = values[2];
  const out = [];
  for (const outerFirst of [true, false]) {
    const pairs = outerFirst ? [outer, inner] : [inner, outer];
    for (const leftMinusRight of [true, false]) {
      const differences = pairs.map(([left, right]) => mod29(leftMinusRight ? left - right : right - left));
      const sums = pairs.map(([left, right]) => mod29(left + right));
      for (const differenceFirst of [true, false]) {
        const first = differenceFirst ? differences : sums;
        const second = differenceFirst ? sums : differences;
        for (const bounce of [true, false]) {
          out.push({ outerFirst, leftMinusRight, differenceFirst, bounce,
            vector: first.concat([center], bounce ? second.slice().reverse() : second) });
        }
      }
    }
  }
  return out;
}

const p6Widths = [4, 1, 4, 2];
const all16 = presentations4(p6Widths);
assert.equal(all16.length, 16);
const p57Topology = all16.filter((row) => row.outerFirst && row.bounce);
assert.equal(p57Topology.length, 4);

const support = [
  { rank: 17, coord: 3, dir: -1 },
  { rank: 22, coord: 5, dir: +1 },
  { rank: 38, coord: 6, dir: +1 },
  { rank: 39, coord: 2, dir: +1 },
];
const kIndex = support.findIndex((row) => row.coord === 2);
assert.equal(kIndex, 3);
const forward = support.slice(kIndex).concat(support.slice(0, kIndex));
const p50Packet = forward.map((row) => mod29(row.dir * row.coord));
assert.deepEqual(p50Packet, [2, 26, 5, 6]);

const selected = p57Topology.filter((row) => row.vector.join(",") === p50Packet.join(","));
assert.equal(selected.length, 1);
assert.deepEqual(selected[0], {
  outerFirst: true, leftMinusRight: true, differenceFirst: true, bounce: true,
  vector: [2, 26, 5, 6],
});

const [K, minusE, g, a] = p50Packet;
const F = 0;
const one = 1;
const L = [minusE, one, mod29(-minusE), K];
const C = [minusE, one, F, one, mod29(-minusE)];
const T = [mod29(-a), g, mod29(-K), one];
const R = L.map((value, index) => mod29(value + T[index]));
assert.deepEqual([L, C, T, R], [
  [26, 1, 3, 2], [26, 1, 0, 1, 3], [23, 5, 27, 1], [20, 6, 1, 3],
]);

const centerTarget = [23, 0, 0, 2, 0];
const centerPresentations = presentations5(C);
const centerMatches = centerPresentations.filter((row) => row.vector.join(",") === centerTarget.join(","));
assert.equal(centerMatches.length, 1);
assert.deepEqual(centerMatches[0], {
  outerFirst: true, leftMinusRight: true, differenceFirst: true, bounce: true,
  vector: centerTarget,
});

const perimeter = L.concat([C[0], C[4]], R);
const interior = C.slice(1, 4);
assert.deepEqual([perimeter.length, interior.length, perimeter.length + interior.length], [10, 3, 13]);
assert.deepEqual([
  perimeter.reduce((sum, value) => mod29(sum + value), 0),
  interior.reduce((sum, value) => mod29(sum + value), 0),
  L.concat(C, R).reduce((sum, value) => mod29(sum + value), 0),
], [4, 2, 6]);

console.log(JSON.stringify({
  status: "PASS",
  signedTail: { selectedStart: 30, words: sourceWords.slice(30).map((row) => row.word),
    gpRuneCount: 57, allThirteenWordWindowsWithCount57: window57 },
  hFamily: { chargedPresentations: all16.length,
    p57TopologyPresentations: p57Topology.map((row) => row.vector),
    hFreeP50Packet: p50Packet, selectedCanonical: selected[0] },
  heldOutCenterColumn: { input: C, chargedPresentations: centerPresentations.length,
    uniqueSparseOutput: centerTarget, interpretation: "[p,F,F,K,F]" },
  stencilShell: { cellCounts: { perimeter: perimeter.length, interior: interior.length, total: 13 },
    addressGridSums: { perimeter: 4, interior: 2, total: 6 } },
  conclusion: "The p6-selected signed tail addresses solved p57 by GP-rune count. P57 supplies only the outer-in/bounce traversal topology; independent p50 support order selects canonical H among the remaining four arithmetic/sign presentations. Canonical H then uniquely maps the H-free red13 center column to [p,F,F,K,F]. This is a local p6 operator selector, not a general LP2 decryption.",
}, null, 2));
