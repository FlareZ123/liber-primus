"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const p32 = corpus.pages.find((page) => page.page === 32);
assert.ok(p32);

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const side = dh.a + dh.g;
assert.equal(side, dh.A + dh.e);
assert.equal(side, 11);
assert.equal(p32.indices.length, side ** 2);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpIndices(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  let offset = 0;
  while (offset < normalized.length) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP word " + word + " at " + offset);
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gpIndices(word).reduce((sum, value) => sum + value, 0);
}

const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word, index) => ({
  index,
  word: word.toUpperCase(),
  gp: gpIndices(word),
}));
assert.deepEqual(
  words.slice(16, 19).map((row) => row.word),
  ["ARE", "THE", "MAP"]
);

const tableTokens = grid.rows.flat();
assert.equal(grid.rows[0].length, dh.A);
assert.equal(gp0("MAP"), 56);
assert.equal(tableTokens[56], "4E");
assert.equal(String.fromCharCode(Number.parseInt(tableTokens[56], 16)), "N");
assert.equal(56 - dh.A, 48);
assert.equal(gp0("HERE"), 48);

// Charge a compact state-address family: every DH field, then every ordered
// pair under +, -, and *. Collapse algebraically duplicate numeric addresses.
const fields = Object.entries(dh);
const addressLabels = new Map();

/** @param {string} label @param {number} value */
function addAddress(label, value) {
  if (!Number.isInteger(value) || value < 0 || value >= p32.indices.length) return;
  if (!addressLabels.has(value)) addressLabels.set(value, []);
  addressLabels.get(value).push(label);
}

for (const [name, value] of fields) addAddress(name, value);
for (const [leftName, left] of fields) {
  for (const [rightName, right] of fields) {
    addAddress(leftName + "+" + rightName, left + right);
    addAddress(leftName + "-" + rightName, left - right);
    addAddress(leftName + "*" + rightName, left * right);
  }
}
assert.equal(addressLabels.size, 49);

const distinctTwoRuneTargets = new Map();
for (const word of words) {
  if (word.gp.length !== 2) continue;
  const key = word.gp.join(",");
  if (!distinctTwoRuneTargets.has(key)) distinctTwoRuneTargets.set(key, word.word);
}
assert.deepEqual(
  [...distinctTwoRuneTargets.values()].sort(),
  ["BE", "IS", "THE"]
);

const directions = [
  { name: "N", dr: -1, dc: 0 },
  { name: "S", dr: 1, dc: 0 },
  { name: "W", dr: 0, dc: -1 },
  { name: "E", dr: 0, dc: 1 },
];

const hits = [];
let comparisons = 0;
for (const [start, labels] of addressLabels) {
  const row = Math.floor(start / side);
  const col = start % side;
  for (const direction of directions) {
    const nextRow = row + direction.dr;
    const nextCol = col + direction.dc;
    if (nextRow < 0 || nextRow >= side || nextCol < 0 || nextCol >= side) continue;
    const end = nextRow * side + nextCol;
    const values = [p32.indices[start], p32.indices[end]];
    for (const [key, word] of distinctTwoRuneTargets) {
      comparisons += 1;
      if (key !== values.join(",")) continue;
      hits.push({ start, labels, direction: direction.name, end, values, word });
    }
  }
}
assert.deepEqual(hits, [
  {
    start: dh.p + dh.g,
    labels: ["p+g", "g+p"],
    direction: "N",
    end: dh.p - dh.a,
    values: gpIndices("THE"),
    word: "THE",
  },
]);

assert.equal(dh.p + dh.g - side, dh.p - dh.a);
assert.equal(p32.indices[dh.p + dh.g], gpIndices("THE")[0]);
assert.equal(p32.indices[dh.p - dh.a], gpIndices("THE")[1]);

// The north direction was frozen independently by MAP -> p50[56]=4E -> N.
// With N fixed, THE remains the only authenticated two-rune hit.
const northHits = hits.filter((hit) => hit.direction === "N");
assert.equal(northHits.length, 1);
assert.equal(northHits[0].word, "THE");

// The THE read terminates on the same E cell selected by the independent
// three-state ARE extraction.
const areStates = [dh.g ** dh.e, gp0("THE"), gp0("DEVOTED")];
assert.deepEqual(areStates, [125, 20, 102]);
const areOffsets = areStates.map((state) => {
  const sourceRow = Math.floor(state / dh.A);
  const sourceCol = state % dh.A;
  return (sourceRow % side) * side + sourceCol;
});
assert.deepEqual(areOffsets, [49, 26, 17]);
assert.equal(areOffsets[2], dh.p - dh.a);

// Matched square-page control: p6 is the only other nonempty perfect-square
// unknown page. Under the same state-address family, it has no northward
// authenticated two-rune hit. Its sole all-direction hit is BE to the east.
const squarePages = corpus.pages
  .filter((page) => page.page <= 55 && page.indices.length > 0)
  .filter((page) => Number.isInteger(Math.sqrt(page.indices.length)))
  .map((page) => ({ page: page.page, side: Math.sqrt(page.indices.length), indices: page.indices }));
assert.deepEqual(squarePages.map((row) => [row.page, row.side]), [[6, 14], [32, 11]]);

const squareHits = [];
for (const page of squarePages) {
  for (const [start, labels] of addressLabels) {
    if (start >= page.indices.length) continue;
    const row = Math.floor(start / page.side);
    const col = start % page.side;
    for (const direction of directions) {
      const nextRow = row + direction.dr;
      const nextCol = col + direction.dc;
      if (
        nextRow < 0 || nextRow >= page.side ||
        nextCol < 0 || nextCol >= page.side
      ) continue;
      const end = nextRow * page.side + nextCol;
      const values = [page.indices[start], page.indices[end]];
      for (const [key, word] of distinctTwoRuneTargets) {
        if (key !== values.join(",")) continue;
        squareHits.push({
          page: page.page,
          start,
          labels,
          direction: direction.name,
          end,
          values,
          word,
        });
      }
    }
  }
}
assert.deepEqual(squareHits, [
  {
    page: 6,
    start: 14,
    labels: ["a+A", "A+a", "B-g"],
    direction: "E",
    end: 15,
    values: gpIndices("BE"),
    word: "BE",
  },
  {
    page: 32,
    start: dh.p + dh.g,
    labels: ["p+g", "g+p"],
    direction: "N",
    end: dh.p - dh.a,
    values: gpIndices("THE"),
    word: "THE",
  },
]);
assert.deepEqual(squareHits.filter((hit) => hit.direction === "N"), [
  squareHits[1],
]);

// Follow-up to the report's explicit next question: keep this exact 49-address
// family and cardinal grammar, extend the read from two cells to three, and
// charge every distinct authenticated three-rune source word. This is the
// smallest unchanged-grammar test for the source continuation MAP.
const distinctThreeRuneTargets = new Map();
for (const word of words) {
  if (word.gp.length !== 3) continue;
  const key = word.gp.join(",");
  if (!distinctThreeRuneTargets.has(key)) distinctThreeRuneTargets.set(key, word.word);
}
assert.deepEqual(
  [...distinctThreeRuneTargets.values()].sort(),
  ["AND", "ARE", "ITS", "MAP", "PATH", "WAY", "YOU"]
);

const squareThreeRuneHits = [];
for (const page of squarePages) {
  for (const [start, labels] of addressLabels) {
    if (start >= page.indices.length) continue;
    const row = Math.floor(start / page.side);
    const col = start % page.side;
    for (const direction of directions) {
      const values = [];
      let valid = true;
      for (let step = 0; step < 3; step += 1) {
        const nextRow = row + direction.dr * step;
        const nextCol = col + direction.dc * step;
        if (
          nextRow < 0 || nextRow >= page.side ||
          nextCol < 0 || nextCol >= page.side
        ) {
          valid = false;
          break;
        }
        values.push(page.indices[nextRow * page.side + nextCol]);
      }
      if (!valid) continue;
      const word = distinctThreeRuneTargets.get(values.join(","));
      if (!word) continue;
      squareThreeRuneHits.push({
        page: page.page,
        start,
        labels,
        direction: direction.name,
        values,
        word,
      });
    }
  }
}
assert.deepEqual(squareThreeRuneHits, []);

console.log(JSON.stringify({
  status: "PASS",
  p32: {
    side,
    start: dh.p + dh.g,
    startExpression: "p+g",
    direction: "N",
    end: dh.p - dh.a,
    endExpression: "p-a",
    values: gpIndices("THE"),
    word: "THE",
    sharesAreOffset: areOffsets[2],
  },
  sourceDirection: {
    mapGp0: gp0("MAP"),
    token: tableTokens[56],
    asciiDirection: "N",
    destination: gp0("HERE"),
  },
  family: {
    distinctAddressValues: addressLabels.size,
    distinctTwoRuneTargets: [...distinctTwoRuneTargets.values()],
    comparisons,
    hits,
    squareHits,
    distinctThreeRuneTargets: [...distinctThreeRuneTargets.values()],
    squareThreeRuneHits,
  },
  classification:
    "second source-state p32 extraction; exact 3-cell cardinal extension has no authenticated source-word hit on p32 or matched p6",
}, null, 2));
