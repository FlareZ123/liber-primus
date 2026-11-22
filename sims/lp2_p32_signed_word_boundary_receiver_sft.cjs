"use strict";

/**
 * SFT: authenticated 2016 GP0 words select p32 word boundaries, and the
 * original p50 byte-pointer map induces SEEKS -> EMPTY -> THE -> DEVOTED
 * as successive p32-boundary hits.
 *
 * Windows Node 22:
 *   node sims/lp2_p32_signed_word_boundary_receiver_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const table = grid.byte_rows.flat();

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Canonical GP0 sum using the repository alphabet conventions.
 * @param {string} word
 * @returns {number}
 */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let offset = 0;
  let sum = 0;
  while (offset < normalized.length) {
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
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + word + " at " + offset);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

/**
 * Physical page-local cumulative rune positions that end a printed word.
 * @param {string} pageText
 * @returns {number[]}
 */
function wordBoundaries(pageText) {
  const boundaries = [];
  let runePosition = 0;
  let inWord = false;

  for (const character of [...pageText]) {
    if (/[\u16A0-\u16FF]/u.test(character)) {
      runePosition += 1;
      inWord = true;
    } else if (inWord) {
      boundaries.push(runePosition);
      inWord = false;
    }
  }
  if (inWord) boundaries.push(runePosition);

  return [...new Set(boundaries)];
}

const signedClear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(signedClear);

const signedWords = (signedClear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());

const values = Object.fromEntries(
  [...new Set(signedWords)].map((word) => [word, gp0(word)])
);

assert.equal(values.THE, 20);
assert.equal(values.SEEKS, 71);
assert.equal(values.EMPTY, 92);
assert.equal(values.DEVOTED, 102);
assert.equal(values.EPIPHANY, 121);

const targetValues = [
  values.THE,
  values.SEEKS,
  values.EMPTY,
  values.DEVOTED,
  values.EPIPHANY,
];

const physicalPages = transcription.split("%");
const p32Text = physicalPages[32];
assert.ok(p32Text);
const p32Boundaries = wordBoundaries(p32Text);
const p32Runes = corpus.pages.find((page) => page.page === 32);
assert.ok(p32Runes);

assert.equal(p32Runes.indices.length, 121);
assert(targetValues.every((value) => p32Boundaries.includes(value)));

const pageHits = [];
for (let page = 0; page <= 55; page += 1) {
  const boundaries = wordBoundaries(physicalPages[page] || "");
  const hits = targetValues.filter((value) => boundaries.includes(value));
  const runeCount = corpus.pages.find((row) => row.page === page)?.indices.length || 0;
  pageHits.push({ page, runeCount, hits });
}

assert.deepEqual(
  pageHits.filter((row) => row.hits.length === targetValues.length),
  [{ page: 32, runeCount: 121, hits: targetValues }]
);
assert.deepEqual(
  pageHits.filter((row) => row.runeCount === 121).map((row) => row.page),
  [32]
);

/**
 * Follow the byte-pointer map until the next member of boundarySet appears.
 * @param {number} start
 * @param {Set<number>} boundarySet
 * @returns {{to:number|null,steps:number,path:number[]}}
 */
function nextBoundary(start, boundarySet) {
  const pathValues = [start];
  const seen = new Set([start]);
  let state = table[start];
  let steps = 1;

  while (!boundarySet.has(state) && !seen.has(state)) {
    seen.add(state);
    pathValues.push(state);
    state = table[state];
    steps += 1;
  }
  pathValues.push(state);

  return {
    to: boundarySet.has(state) ? state : null,
    steps,
    path: pathValues,
  };
}

const boundarySet = new Set(p32Boundaries);
const seeksToEmpty = nextBoundary(values.SEEKS, boundarySet);
const emptyToThe = nextBoundary(values.EMPTY, boundarySet);
const theToDevoted = nextBoundary(values.THE, boundarySet);

assert.deepEqual(
  { to: seeksToEmpty.to, steps: seeksToEmpty.steps },
  { to: values.EMPTY, steps: 7 }
);
assert.deepEqual(
  { to: emptyToThe.to, steps: emptyToThe.steps },
  { to: values.THE, steps: 14 }
);
assert.deepEqual(
  { to: theToDevoted.to, steps: theToDevoted.steps },
  { to: values.DEVOTED, steps: 1 }
);

assert.deepEqual(
  seeksToEmpty.path,
  [71,108,14,183,81,58,146,92]
);
assert.deepEqual(
  emptyToThe.path,
  [92,236,238,129,179,175,18,15,212,70,169,228,144,125,20]
);
assert.deepEqual(
  theToDevoted.path,
  [20,102]
);

// The four words of EPIPHANY SEEKS THE DEVOTED all mark p32 boundaries;
// EMPTY from the preceding sentence supplies the unique fifth receiver mark.
const clause = ["EPIPHANY", "SEEKS", "THE", "DEVOTED"];
assert(clause.every((word) => p32Boundaries.includes(values[word])));

console.log(JSON.stringify({
  status: "PASS",
  authenticatedValues: {
    THE: values.THE,
    SEEKS: values.SEEKS,
    EMPTY: values.EMPTY,
    DEVOTED: values.DEVOTED,
    EPIPHANY: values.EPIPHANY,
  },
  p32: {
    runeCount: p32Runes.indices.length,
    wordBoundaries: p32Boundaries,
    targetBoundaryHits: targetValues,
  },
  familyAudit: {
    unknownPhysicalPages: 56,
    allFiveHits: pageHits.filter((row) =>
      row.hits.length === targetValues.length
    ),
    exact121RunePages: pageHits.filter((row) => row.runeCount === 121),
  },
  inducedBoundaryPath: {
    SEEKS_to_EMPTY: seeksToEmpty,
    EMPTY_to_THE: emptyToThe,
    THE_to_DEVOTED: theToDevoted,
  },
  decision:
    "The signed 2016 values select p32's printed word geometry directly: p32 alone has all five authenticated boundary positions, and the p50 pointer connects SEEKS->EMPTY->THE->DEVOTED as successive p32-boundary hits.",
}, null, 2));
