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
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

// Authenticated/recovered DH state.
const state = {
  p: 23,
  g: 5,
  b: 15,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
  A: 8,
};
assert.equal(state.p - state.g, 18);
assert.equal(state.b + state.K, 17);
assert.equal(state.K * state.g, 10);

/** @param {number} address @param {string} alphabet @param {number} radix @returns {number} */
function tableValue(address, alphabet, radix) {
  const token = tape[address];
  return radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

// P33's map-road RISE receiver.
const RISE_GP0 = 47;
assert.equal(tape[RISE_GP0], "1G");
const rise59 = tableValue(RISE_GP0, alpha59, 59);
const rise60 = tableValue(RISE_GP0, alpha60, 60);
assert.deepEqual([rise59, rise60], [75, 76]);

// Reconstruct continuous words and page-crossing carries exactly as printed.
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
    // Physical line wrapping preserves the current word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

// Incoming carry length for every rune page.
const carryByPhysical = new Map([[0, 0]]);
for (let page = 1; page < segments.length; page += 1) {
  const crossing = words.find((word) =>
    word[0].page < page && word.some((site) => site.page === page)
  );
  carryByPhysical.set(
    physicalPage(page),
    crossing ? crossing.filter((site) => site.page === page).length : 0
  );
}

// RISE's two radix readings uniquely identify p55's two legitimate counts:
// 76 physical runes, 75 locally owned after the one-rune incoming carry.
const risePageHits = corpus.pages
  .filter((page) => page.page <= 55)
  .map((page) => ({
    physicalPage: page.page,
    runes: page.indices.length,
    carry: carryByPhysical.get(page.page) || 0,
    localRunes: page.indices.length - (carryByPhysical.get(page.page) || 0),
  }))
  .filter((page) => page.runes === rise60 && page.localRunes === rise59);

assert.deepEqual(risePageHits, [{
  physicalPage: 55,
  runes: 76,
  carry: 1,
  localRunes: 75,
}]);

// Build strict word-interior streams page by page. Only words wholly contained
// on a page contribute interiors; cross-page carry fragments are boundaries.
const pageInteriors = [];
for (let page = 0; page < segments.length; page += 1) {
  const completeWords = words.filter((word) =>
    word[0].page === page && word[word.length - 1].page === page
  );
  const interior = completeWords.flatMap((word) =>
    word.length >= 3 ? word.slice(1, -1).map((site) => site.value) : []
  );
  pageInteriors.push({
    physicalPage: physicalPage(page),
    completeWords: completeWords.length,
    interior,
  });
}

const p55 = pageInteriors.find((page) => page.physicalPage === 55);
assert.ok(p55);
assert.equal(p55.completeWords, 16);
assert.equal(p55.interior.length, 43);

// "DIVINITY" begins with D, whose GP ordinal is p=23. In the peeled p55
// interior D occurs exactly at one-based positions g=5 and p=23.
const dPositions = p55.interior
  .map((value, index) => value === state.p ? index + 1 : null)
  .filter((position) => position !== null);
assert.deepEqual(dPositions, [state.g, state.p]);

const left = state.g;
const right = state.p;
const span = p55.interior.slice(left - 1, right);
const centerPosition = (left + right) / 2;
const centerValue = p55.interior[centerPosition - 1];

assert.equal(right - left, state.p - state.g);
assert.equal(right - left - 1, state.b + state.K);
assert.equal(span.length, state.B);
assert.equal(centerPosition, 14);
assert.equal(centerValue, state.K * state.g);

// Corpus-wide control in the correct source object: concatenate the strict
// interiors of complete words on each page, then charge every 43-rune window
// for the exact [D at g, D at p, center K*g] state geometry.
let chargedWindows = 0;
const geometryHits = [];
for (const page of pageInteriors) {
  for (let start = 0; start + 43 <= page.interior.length; start += 1) {
    chargedWindows += 1;
    const values = page.interior;
    if (
      values[start + state.g - 1] === state.p
      && values[start + state.p - 1] === state.p
      && values[start + centerPosition - 1] === state.K * state.g
    ) {
      geometryHits.push({
        physicalPage: page.physicalPage,
        start,
        interiorLength: page.interior.length,
      });
    }
  }
}

assert.equal(chargedWindows, 4803);
assert.deepEqual(geometryHits, [{
  physicalPage: 55,
  start: 0,
  interiorLength: 43,
}]);

console.log(JSON.stringify({
  status: "PASS",
  sourceState: state,
  p33RiseReceiver: {
    gp0: RISE_GP0,
    token: tape[RISE_GP0],
    base59: rise59,
    base60: rise60,
    exactPageHits: risePageHits,
  },
  p55StrictInterior: {
    length: p55.interior.length,
    completeWords: p55.completeWords,
    dRuneOrdinal: state.p,
    dPositions,
    positionGap: right - left,
    strictBetween: right - left - 1,
    inclusiveSpan: span.length,
    centerPosition,
    centerValue,
    stateReading: {
      positions: ["g", "p"],
      gap: "p-g",
      strictBetween: "b+K",
      inclusiveSpan: "B",
      centerRune: "K*g",
    },
  },
  control: {
    strictInterior43Windows: chargedWindows,
    exactGeometryHits: geometryHits,
  },
  decision: "P33's RISE road uniquely selects physical p55 by its 75/76 local/physical rune counts. After the source-instructed circumference peel, p55's 43-rune strict interior uniquely realizes D=p at positions [g,p]=[5,23], with gap p-g=18, b+K=17 strict-between runes, inclusive span B=19, and center rune K*g=10. This is a source-constrained state geometry, not yet a plaintext decryption.",
}, null, 2));
