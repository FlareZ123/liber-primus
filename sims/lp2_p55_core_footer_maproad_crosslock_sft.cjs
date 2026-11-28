"use strict";

/**
 * SFT: p55 recursive-core / terminal-footer dual-radix MAP/ROAD cross-lock.
 *
 * Run:
 *   node sims/lp2_p55_core_footer_maproad_crosslock_sft.cjs
 *
 * Original-source structural/navigation test. No unknown LP2 plaintext is
 * decoded here.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

/** @param {number} x */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
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

/** @param {number} page */
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

/** @param {number[]} values */
function recursiveCore(values) {
  if (values.length % 2 === 0) return null;
  return values[(values.length - 1) / 2];
}

/** @param {number[][]} pageWords */
function signature(pageWords) {
  const cores = pageWords.map(recursiveCore).filter((value) => value !== null);
  return {
    cores,
    coreGp0: cores.reduce((sum, value) => sum + value, 0),
  };
}

const p55 = signature(completeWords.get(55));
assert.deepEqual(p55.cores, [1, 6, 2, 11, 18]);
assert.equal(p55.coreGp0, 38);

// The five-core object has one untouched center; established p55 state work
// fixes it as K=2.
const K = p55.cores[(p55.cores.length - 1) / 2];
assert.equal(K, 2);

// Independently selected p55 terminal footer.
const p55Page = corpus.pages.find((page) => page.page === 55);
assert.ok(p55Page);
const footer = p55Page.indices.slice(-6);
assert.deepEqual(footer, [23, 11, 1, 17, 18, 10]);

// Frozen footer H6: outer-to-inner differences, inner-to-outer sums.
const pairs = [
  [footer[0], footer[5]],
  [footer[1], footer[4]],
  [footer[2], footer[3]],
];
const h6 = [
  ...pairs.map(([left, right]) => mod29(left - right)),
  ...pairs.map(([left, right]) => mod29(left + right)).reverse(),
];
assert.deepEqual(h6, [13, 22, 13, 18, 0, 4]);

const q = h6[h6.length - 1];
assert.equal(q, 4);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[38], "2D");
assert.equal(grid.bytes[38], 133);

const alpha59 = grid.alphabet.replace("f", "");
assert.equal(alpha59.length, 59);

/** @param {string} token */
function base59Value(token) {
  const high = alpha59.indexOf(token[0]);
  const low = alpha59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, `token outside live base59 alphabet: ${token}`);
  return 59 * high + low;
}

const bytes59 = tokens.map(base59Value);
assert.equal(bytes59[38], 131);

/** @param {number[]} map @param {number} start @param {number} depth */
function advance(map, start, depth) {
  let address = start;
  for (let step = 0; step < depth; step += 1) {
    assert.ok(address >= 0 && address < 256, `pointer left p50 at ${address}`);
    address = map[address];
  }
  return address;
}

const start60 = grid.bytes[p55.coreGp0];
const start59 = bytes59[p55.coreGp0];

const map60 = {
  K: advance(grid.bytes, start60, K),
  q: advance(grid.bytes, start60, q),
};
const road59 = {
  K: advance(bytes59, start59, K),
  q: advance(bytes59, start59, q),
};

assert.deepEqual(map60, { K: 46, q: 47 });
assert.deepEqual(road59, { K: 35, q: 5 });
assert.equal(start59, 131);

// Complete page-family census.
const eligible = [];
for (let page = 0; page <= 55; page += 1) {
  const sig = signature(completeWords.get(page) || []);
  if (sig.coreGp0 >= 256) continue;

  const startBase60 = grid.bytes[sig.coreGp0];
  const startBase59 = bytes59[sig.coreGp0];

  eligible.push({
    page,
    coreCount: sig.cores.length,
    coreGp0: sig.coreGp0,
    base60: {
      K: advance(grid.bytes, startBase60, K),
      q: advance(grid.bytes, startBase60, q),
    },
    base59: {
      K: advance(bytes59, startBase59, K),
      q: advance(bytes59, startBase59, q),
    },
  });
}

assert.equal(eligible.length, 12);
assert.deepEqual(
  eligible.filter((row) => row.base60.K === 46 && row.base60.q === 47).map((row) => row.page),
  [55],
);
assert.deepEqual(
  eligible.filter((row) => row.base59.K === 46 && row.base59.q === 47).map((row) => row.page),
  [],
);

assert.deepEqual(
  Array.from({ length: 56 }, (_, page) => ({
    page,
    ...signature(completeWords.get(page) || []),
  }))
    .filter((row) => row.cores.length === 5)
    .map((row) => row.page),
  [49, 55],
);

// Broader role-family audit. This explicitly records the extra hits that
// appear if the p55-local K/q selectors are discarded and arbitrary known
// DH-state depths are scanned.
const stateDepths = {
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
};
const broadHits = [];

for (let page = 0; page <= 55; page += 1) {
  const sig = signature(completeWords.get(page) || []);
  if (sig.coreGp0 >= 256) continue;
  const start = grid.bytes[sig.coreGp0];

  for (const [leftRole, leftDepth] of Object.entries(stateDepths)) {
    for (const [rightRole, rightDepth] of Object.entries(stateDepths)) {
      if (leftRole === rightRole) continue;
      if (
        advance(grid.bytes, start, leftDepth) === 46 &&
        advance(grid.bytes, start, rightDepth) === 47
      ) {
        broadHits.push({ page, leftRole, leftDepth, rightRole, rightDepth });
      }
    }
  }
}

assert.deepEqual(broadHits, [
  { page: 7, leftRole: "q", leftDepth: 4, rightRole: "a", rightDepth: 6 },
  { page: 55, leftRole: "K", leftDepth: 2, rightRole: "q", rightDepth: 4 },
  { page: 55, leftRole: "K", leftDepth: 2, rightRole: "b", rightDepth: 15 },
]);

console.log(JSON.stringify({
  classification: "source-constrained dual-radix navigation cross-lock; no plaintext",
  p55: {
    cores: p55.cores,
    coreGp0: p55.coreGp0,
    localDepths: { K, q },
    footer,
    h6,
    p50Cell38: tokens[38],
    base59RoadStart: start59,
    base60MapStart: start60,
    base59RoadEndpoints: road59,
    base60MapEndpoints: map60,
  },
  census: {
    eligibleCoreSumPages: eligible.length,
    exactBase60KqPages: [55],
    exactBase59KqPages: [],
    fiveCorePages: [49, 55],
    broadStateDepthHits: broadHits,
  },
}, null, 2));
