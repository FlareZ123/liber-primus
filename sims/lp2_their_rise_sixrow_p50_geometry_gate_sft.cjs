"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedSource
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const source = (clear.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gp(word);
  return {
    index,
    word: word.toUpperCase(),
    gp0: values.reduce((sum, value) => sum + value, 0),
    length: values.length,
  };
});
assert.equal(source.length, 43);
assert.equal(source[6].word, "SEEKS");
assert.equal(source[23].word, "ROAD");
assert.equal(source[38].word, "BEWARE");
assert.equal(source[40].word, "PATHS");

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const stateValues = new Set(Object.values(state));
const width = state.A;
const height = 32;
const rise = state.a;

const directions = Object.freeze({
  N: [-1, 0],
  NE: [-1, 1],
  E: [0, 1],
  SE: [1, 1],
  S: [1, 0],
  SW: [1, -1],
  W: [0, -1],
  NW: [-1, -1],
});

/**
 * @param {number} gp0
 * @param {0|1} origin
 * @param {keyof typeof directions} direction
 * @returns {number|null}
 */
function move(gp0, origin, direction) {
  const address = gp0 - origin;
  if (address < 0 || address >= width * height) return null;

  const row = Math.floor(address / width);
  const column = address % width;
  const [dr, dc] = directions[direction];
  const nextRow = row + rise * dr;
  const nextColumn = column + rise * dc;

  if (
    nextRow < 0 ||
    nextRow >= height ||
    nextColumn < 0 ||
    nextColumn >= width
  ) {
    return null;
  }

  return nextRow * width + nextColumn + origin;
}

/** @param {0|1} origin @param {keyof typeof directions} direction */
function census(origin, direction) {
  const rows = [];
  for (const entry of source) {
    const destination = move(entry.gp0, origin, direction);
    if (destination === null) continue;
    rows.push({
      sourceIndex: entry.index,
      sourceWord: entry.word,
      gp0: entry.gp0,
      destination,
      stateHit: stateValues.has(destination),
      destinationWord:
        destination >= 0 && destination < source.length
          ? source[destination].word
          : null,
    });
  }

  return {
    origin,
    direction,
    legalMoves: rows.length,
    stateHits: rows.filter((row) => row.stateHit),
    sourceIndexHits: rows.filter((row) => row.destinationWord !== null),
    rows,
  };
}

const family = [];
for (const origin of [0, 1]) {
  for (const direction of Object.keys(directions)) {
    family.push(census(origin, direction));
  }
}

function summary(row) {
  return {
    origin: row.origin,
    direction: row.direction,
    legalMoves: row.legalMoves,
    stateHits: row.stateHits.length,
    sourceIndexHits: row.sourceIndexHits.length,
  };
}

assert.deepEqual(
  family.map(summary),
  [
    { origin:0, direction:"N",  legalMoves:24, stateHits:9, sourceIndexHits:20 },
    { origin:0, direction:"NE", legalMoves:6,  stateHits:2, sourceIndexHits:6 },
    { origin:0, direction:"E",  legalMoves:2,  stateHits:0, sourceIndexHits:2 },
    { origin:0, direction:"SE", legalMoves:0,  stateHits:0, sourceIndexHits:0 },
    { origin:0, direction:"S",  legalMoves:43, stateHits:0, sourceIndexHits:0 },
    { origin:0, direction:"SW", legalMoves:0,  stateHits:0, sourceIndexHits:0 },
    { origin:0, direction:"W",  legalMoves:5,  stateHits:0, sourceIndexHits:5 },
    { origin:0, direction:"NW", legalMoves:5,  stateHits:1, sourceIndexHits:5 },
    { origin:1, direction:"N",  legalMoves:24, stateHits:9, sourceIndexHits:20 },
    { origin:1, direction:"NE", legalMoves:2,  stateHits:2, sourceIndexHits:2 },
    { origin:1, direction:"E",  legalMoves:4,  stateHits:0, sourceIndexHits:4 },
    { origin:1, direction:"SE", legalMoves:0,  stateHits:0, sourceIndexHits:0 },
    { origin:1, direction:"S",  legalMoves:43, stateHits:0, sourceIndexHits:0 },
    { origin:1, direction:"SW", legalMoves:0,  stateHits:0, sourceIndexHits:0 },
    { origin:1, direction:"W",  legalMoves:2,  stateHits:0, sourceIndexHits:2 },
    { origin:1, direction:"NW", legalMoves:7,  stateHits:4, sourceIndexHits:7 },
  ]
);

const north0 = family.find((row) => row.origin === 0 && row.direction === "N");
const north1 = family.find((row) => row.origin === 1 && row.direction === "N");
assert.ok(north0 && north1);
assert.deepEqual(
  north0.rows.map((row) => [row.sourceIndex, row.destination]),
  north1.rows.map((row) => [row.sourceIndex, row.destination])
);

function transition(word) {
  const row = north0.rows.find((entry) => entry.sourceWord === word);
  assert.ok(row, "missing north transition for " + word);
  return row;
}

assert.deepEqual(
  {
    word: transition("SEEKS").sourceWord,
    gp0: transition("SEEKS").gp0,
    destination: transition("SEEKS").destination,
    destinationWord: transition("SEEKS").destinationWord,
  },
  { word:"SEEKS", gp0:71, destination:23, destinationWord:"ROAD" }
);

assert.deepEqual(
  {
    word: transition("BEWARE").sourceWord,
    gp0: transition("BEWARE").gp0,
    destination: transition("BEWARE").destination,
    destinationWord: transition("BEWARE").destinationWord,
  },
  { word:"BEWARE", gp0:88, destination:40, destinationWord:"PATHS" }
);

assert.deepEqual(
  ["BEWARE", "PATHS", "SEEKS", "ROAD"].map((word) => {
    const row = transition(word);
    return [word, row.destination, row.destinationWord];
  }),
  [
    ["BEWARE", 40, "PATHS"],
    ["PATHS", 6, "SEEKS"],
    ["SEEKS", 23, "ROAD"],
    ["ROAD", 6, "SEEKS"],
  ]
);

const seeksRoadVariants = family.filter((row) =>
  row.rows.some((entry) =>
    entry.sourceWord === "SEEKS" &&
    entry.destination === 23 &&
    entry.destinationWord === "ROAD"
  )
);
const bewarePathsVariants = family.filter((row) =>
  row.rows.some((entry) =>
    entry.sourceWord === "BEWARE" &&
    entry.destination === 40 &&
    entry.destinationWord === "PATHS"
  )
);
assert.deepEqual(
  seeksRoadVariants.map((row) => [row.origin, row.direction]),
  [[0,"N"],[1,"N"]]
);
assert.deepEqual(
  bewarePathsVariants.map((row) => [row.origin, row.direction]),
  [[0,"N"],[1,"N"]]
);

// Solved-p57 word EMERGE has GP0=83 and rises to signed word35 FOUND.
const emerge = gp("EMERGE");
assert.equal(emerge.reduce((sum, value) => sum + value, 0), 83);
const emergeVariants = [];
for (const origin of [0,1]) {
  for (const direction of Object.keys(directions)) {
    const destination = move(83, origin, direction);
    if (destination !== null) {
      emergeVariants.push({
        origin,
        direction,
        destination,
        destinationWord:
          destination >= 0 && destination < source.length
            ? source[destination].word
            : null,
      });
    }
  }
}
assert.deepEqual(
  emergeVariants.filter((row) => row.destinationWord === "FOUND"),
  [
    { origin:0, direction:"N", destination:35, destinationWord:"FOUND" },
    { origin:1, direction:"N", destination:35, destinationWord:"FOUND" },
  ]
);

// Sealed p29 consequence from commit 0a1c2057df70ecaae3c0ea480a127599ea737177.
assert.equal(transition("MEANING").gp0, 77);
assert.equal(transition("MEANING").destination, 29);
assert.equal(transition("MEANING").destinationWord, "DIRECTION");
const directionValues = gp("DIRECTION");
assert.equal(directionValues.length, 8);
assert.equal(directionValues.reduce((sum, value) => sum + value, 0), 112);

const pageParts = transcription.split("%").slice(0, 55);
const p29 = pageParts[29];
let p29Words = [];
let values = [];
let offset = 0;
let start = 0;

function flushP29() {
  if (!values.length) return;
  p29Words.push({
    index: p29Words.length,
    start,
    end: offset - 1,
    length: values.length,
    gp0: values.reduce((sum, value) => sum + value, 0),
    values: values.slice(),
  });
  values = [];
}

for (const character of p29) {
  const value = runeIndex.get(character);
  if (value !== undefined) {
    if (!values.length) start = offset;
    values.push(value);
    offset += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line wraps are layout only.
  } else {
    flushP29();
  }
}
flushP29();

const p29DirectionReceivers = p29Words.filter(
  (word) => word.length === directionValues.length && word.gp0 === 112
);
assert.equal(p29DirectionReceivers.length, 0);
assert.deepEqual(
  p29Words
    .filter((word) => word.length === 8)
    .map((word) => ({ start:word.start, gp0:word.gp0 })),
  [
    { start:138, gp0:132 },
    { start:239, gp0:128 },
    { start:247, gp0:131 },
  ]
);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "THEIR RISE fixed-six-row p50 geometry passes source/solved controls; sealed p29 receiver transfer fails",
  operation:{table:"32x8",width,height,riseRows:rise,formula:"GP0 - 48 for north"},
  family:family.map(summary),
  north:{
    stateHits:north0.stateHits,
    sourceIndexHits:north0.sourceIndexHits,
    graph:["BEWARE->PATHS","PATHS->SEEKS","SEEKS->ROAD","ROAD->SEEKS"],
  },
  controls:{
    sourceHoldout:"BEWARE GP0 88 -> 40 PATHS",
    solved:"EMERGE GP0 83 -> 35 FOUND",
    seeksRoadVariants:seeksRoadVariants.map((row)=>[row.origin,row.direction]),
    bewarePathsVariants:bewarePathsVariants.map((row)=>[row.origin,row.direction]),
    emergeFoundVariants:emergeVariants.filter((row)=>row.destinationWord==="FOUND"),
  },
  sealedUnknownTransfer:{
    precommit:"0a1c2057df70ecaae3c0ea480a127599ea737177",
    source:"MEANING GP0 77 -> 29 DIRECTION",
    expectedState:{page:29,length:8,gp0:112},
    observedLen8:p29Words.filter((word)=>word.length===8).map((word)=>({
      start:word.start,gp0:word.gp0,values:word.values
    })),
    receivers:p29DirectionReceivers,
    result:"FAIL",
  },
},null,2));
