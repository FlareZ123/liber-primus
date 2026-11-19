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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedSource = read("resources/external/2013-tcp-server-signed-source.md");

assert.match(
  signedSource,
  /commands RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE/,
);
assert.match(
  signedSource,
  /NEXT as client-supplied text for the server to store\. The server does not calculate or choose the next instruction\./,
);

const commands = [
  "RAND",
  "QUINE",
  "BASE29",
  "CODE",
  "KOAN",
  "DH",
  "NEXT",
  "GOODBYE",
];

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace("f", "");
const parts = transcription.split("%").slice(0, 55);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function encodeGp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z0-9]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (/\d/.test(normalized[offset])) {
      offset += 1;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP spelling: ${word} at ${offset}`);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {number} */
function gp1(values) {
  return values.reduce((total, value) => total + value + 1, 0);
}

/** @param {string} token @returns {number|null} */
function decode59(token) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet59.indexOf(char);
    if (digit < 0) return null;
    value = value * alphabet59.length + digit;
  }
  return value;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {{
 *   page:number,
 *   lineRows:Array<{line:number,start:number,length:number,first:string}>,
 *   words:number[][],
 * }}
 */
function pageData(page) {
  const source = physicalPart(page);
  const lines = source.trim().split("/").filter((line) => line.trim().length > 0);

  let lineOffset = 0;
  const lineRows = lines.map((line, index) => {
    const values = [...line]
      .filter((char) => runeSet.has(char))
      .map((char) => runeIndex.get(char));
    const row = {
      line: index + 1,
      start: lineOffset,
      length: values.length,
      first: values
        .slice(0, Math.min(2, values.length))
        .map((value) => corpus.translit[value])
        .join(""),
    };
    lineOffset += values.length;
    return row;
  });

  const normalized = source.replace(/\/\s*/g, "");
  const words = (normalized.match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => runeIndex.get(rune)));

  return {page, lineRows, words};
}

const commandRows = commands.map((command) => {
  const gp0 = sum(encodeGp(command));
  return {
    command,
    gp0,
    token: tokens[gp0],
    base60: base60[gp0],
    base59: decode59(tokens[gp0]),
  };
});

assert.deepEqual(commandRows, [
  {command: "RAND", gp0: 60, token: "1k", base60: 106, base59: 104},
  {command: "QUINE", gp0: 49, token: "0G", base60: 16, base59: 16},
  {command: "BASE29", gp0: 74, token: "3P", base60: 205, base59: 202},
  {command: "CODE", gp0: 49, token: "0G", base60: 16, base59: 16},
  {command: "KOAN", gp0: 41, token: "1O", base60: 84, base59: 83},
  {command: "DH", gp0: 31, token: "2D", base60: 133, base59: 131},
  {command: "NEXT", gp0: 57, token: "1w", base60: 118, base59: 116},
  {command: "GOODBYE", gp0: 96, token: "3g", base60: 222, base59: 218},
]);

const modes = [];
for (const row of commandRows) {
  for (const radix of ["base60", "base59"]) {
    for (const origin of ["zero", "one"]) {
      const value = row[radix];
      assert.notEqual(value, null);
      modes.push({
        ...row,
        radix,
        origin,
        offset: origin === "zero" ? value : value - 1,
      });
    }
  }
}
assert.equal(modes.length, 32);

const pages = [];
for (let page = 0; page <= 55; page += 1) {
  if (page !== 50) pages.push(pageData(page));
}
assert.equal(pages.length, 55);

// Charge command, radix, origin and receiver page before target scoring.
const lineLandings = [];
for (const mode of modes) {
  for (const page of pages) {
    const line = page.lineRows.find((row) => row.start === mode.offset);
    if (line) {
      lineLandings.push({
        command: mode.command,
        radix: mode.radix,
        origin: mode.origin,
        offset: mode.offset,
        page: page.page,
        line: line.line,
        first: line.first,
      });
    }
  }
}
assert.equal(lineLandings.length, 54);

const p28Landings = lineLandings.filter((row) => row.page === 28);
assert.deepEqual(p28Landings, [{
  command: "NEXT",
  radix: "base60",
  origin: "one",
  offset: 117,
  page: 28,
  line: 6,
  first: "DH",
}]);

const dhLineLandings = lineLandings.filter((row) => row.first === "DH");
assert.deepEqual(dhLineLandings, p28Landings);

// The full page/direction family uses the page-numbered word as the root and
// charges both immediate neighbor directions.
const directed = [];
for (const mode of modes) {
  for (const page of pages) {
    if (page.page < 1 || page.page > 55) continue;
    const rootIndex = page.page - 1;
    if (rootIndex >= page.words.length) continue;

    for (const direction of [-1, 1]) {
      const neighborIndex = rootIndex + direction;
      if (neighborIndex < 0 || neighborIndex >= page.words.length) continue;
      const line = page.lineRows.find((row) => row.start === mode.offset);
      const neighbor = page.words[neighborIndex];
      directed.push({
        command: mode.command,
        radix: mode.radix,
        origin: mode.origin,
        offset: mode.offset,
        page: page.page,
        direction,
        neighborWord: neighborIndex + 1,
        neighborGp1: gp1(neighbor),
        neighborLength: neighbor.length,
        forwardAdjacentPair:
          neighbor.length === 2 && neighbor[1] === neighbor[0] + 1,
        lineFirst: line ? line.first : null,
      });
    }
  }
}
assert.equal(directed.length, 3040);

const joint = directed.filter((row) =>
  row.lineFirst === "DH" && row.neighborGp1 === 51);
assert.deepEqual(joint, [{
  command: "NEXT",
  radix: "base60",
  origin: "one",
  offset: 117,
  page: 28,
  direction: 1,
  neighborWord: 29,
  neighborGp1: 51,
  neighborLength: 2,
  forwardAdjacentPair: true,
  lineFirst: "DH",
}]);

// Held-out semantic command: if the authenticated command names were
// executable navigation opcodes under this numeric grammar, DH is the direct
// pre-target control for the manuscript's unique visible DH line. It misses it
// in every source-supported radix/origin mode.
const p28 = pages.find((page) => page.page === 28);
assert.ok(p28);
const p28Dh = p28.lineRows.find((line) => line.first === "DH");
assert.deepEqual(p28Dh, {line: 6, start: 117, length: 23, first: "DH"});

const dhModeOffsets = modes
  .filter((row) => row.command === "DH")
  .map((row) => ({
    radix: row.radix,
    origin: row.origin,
    offset: row.offset,
  }));
assert.deepEqual(dhModeOffsets, [
  {radix: "base60", origin: "zero", offset: 133},
  {radix: "base60", origin: "one", offset: 132},
  {radix: "base59", origin: "zero", offset: 131},
  {radix: "base59", origin: "one", offset: 130},
]);
assert.equal(dhModeOffsets.filter((row) => row.offset === p28Dh.start).length, 0);

// The historical source also blocks treating NEXT's English name as the
// protocol operation: NEXT is an upload/store command, not a server-computed
// "advance one word" instruction.
const nextHistory = {
  organizerChoosesInstruction: false,
  serverComputesSuccessor: false,
  clientSuppliesStoredText: true,
};
assert.deepEqual(nextHistory, {
  organizerChoosesInstruction: false,
  serverComputesSuccessor: false,
  clientSuppliesStoredText: true,
});

console.log(JSON.stringify({
  status: "PASS: NEXT numerical alignment is unique but fails opcode-transfer gate",
  commands: commandRows,
  chargedFamily: {
    commandRadixOriginModes: modes.length,
    receiverPages: pages.length,
    lineStartLandings: lineLandings.length,
    directedPageNeighborTrials: directed.length,
  },
  p28: {
    uniqueLineLanding: p28Landings,
    uniqueJointDhMust: joint,
  },
  heldOutDh: {
    targetLineStart: p28Dh.start,
    testedOffsets: dhModeOffsets,
    hits: 0,
  },
  authenticatedNextSemantics: nextHistory,
  decision:
    "The GP0/p50 alignment of NEXT to p28 DH is a sharp numeric coincidence, " +
    "but the signed protocol defines NEXT as client-upload storage rather than " +
    "a successor operator, and the held-out DH command fails the same numeric " +
    "navigation rule. Keep NEXT as thematic/numeric corroboration, not an " +
    "authenticated source opcode for LP2 navigation.",
}, null, 2));
