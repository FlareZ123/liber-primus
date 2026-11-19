"use strict";

/**
 * SFT: p50 simultaneous base59/base60 authorship audit.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const cells = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
assert.equal(cells.length, 256);
assert.equal(base60.length, 60);
assert.equal(base59.length, 59);

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function physicalPage(partIndex) {
  return partIndex <= 49 ? partIndex : partIndex + 1;
}

function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      start,
      end: start + current.length - 1,
      length: current.length,
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { words, runeCount: offset };
}

const pages = [];
for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
  const page = physicalPage(partIndex);
  if (page > 55) continue;
  pages.push({ page, ...parsePage(parts[partIndex]) });
}

const boundaryEvents = [];
for (let cell = 0; cell < cells.length; cell += 1) {
  const token = cells[cell];
  const value59 = decodeToken(token, base59);
  const value60 = decodeToken(token, base60);

  for (const origin of [0, 1]) {
    const left = value59 - origin;
    const right = value60 - origin;
    if (left < 0 || right < 0) continue;

    for (const page of pages) {
      const leftStart = page.words.findIndex((word) => word.start === left);
      const rightStart = page.words.findIndex((word) => word.start === right);
      const leftEnd = page.words.findIndex((word) => word.end === left);
      const rightEnd = page.words.findIndex((word) => word.end === right);

      const consecutiveStarts =
        leftStart >= 0 && rightStart === leftStart + 1;
      const consecutiveEnds =
        leftEnd >= 0 && rightEnd === leftEnd + 1;

      if (!consecutiveStarts && !consecutiveEnds) continue;

      boundaryEvents.push({
        cell,
        token,
        value59,
        value60,
        origin,
        page: page.page,
        left,
        right,
        consecutiveStarts,
        consecutiveEnds,
        lengths: consecutiveStarts
          ? [
              page.words[leftStart].length,
              page.words[rightStart].length,
            ]
          : null,
      });
    }
  }
}

assert.equal(
  boundaryEvents.filter((event) => event.consecutiveStarts).length,
  670
);
assert.equal(
  boundaryEvents.filter((event) => event.consecutiveEnds).length,
  645
);

const selfPointers = [];
for (let cell = 0; cell < cells.length; cell += 1) {
  const token = cells[cell];
  const value59 = decodeToken(token, base59);
  if (value59 === cell) {
    selfPointers.push({
      cell,
      token,
      value59,
      value60: decodeToken(token, base60),
    });
  }
}

assert.deepEqual(selfPointers, [{
  cell: 189,
  token: "3C",
  value59: 189,
  value60: 192,
}]);

const selfPointerEvents = boundaryEvents.filter((event) => event.cell === 189);
assert.equal(selfPointerEvents.length, 9);
assert.equal(
  selfPointerEvents.filter((event) => event.consecutiveStarts).length,
  4
);
assert.equal(
  selfPointerEvents.filter((event) => event.consecutiveEnds).length,
  5
);

assert.deepEqual(
  selfPointerEvents
    .filter((event) =>
      event.consecutiveStarts &&
      event.lengths[0] === 3 &&
      event.lengths[1] === 4
    )
    .map((event) => ({ page: event.page, origin: event.origin })),
  [
    { page: 0, origin: 0 },
    { page: 24, origin: 1 },
    { page: 48, origin: 0 },
  ]
);

const p0 = pages.find((page) => page.page === 0);
assert.ok(p0);
const p0StartCases = [];
for (let cell = 0; cell < cells.length; cell += 1) {
  const token = cells[cell];
  const value59 = decodeToken(token, base59);
  const value60 = decodeToken(token, base60);

  for (const origin of [0, 1]) {
    const left = value59 - origin;
    const right = value60 - origin;
    const leftStart = p0.words.findIndex((word) => word.start === left);
    const rightStart = p0.words.findIndex((word) => word.start === right);

    if (leftStart < 0 || rightStart !== leftStart + 1) continue;

    p0StartCases.push({
      cell,
      token,
      origin,
      left,
      right,
      lengths: [
        p0.words[leftStart].length,
        p0.words[rightStart].length,
      ],
    });
  }
}

const p0Matched34 = p0StartCases.filter((row) =>
  row.lengths[0] === 3 && row.lengths[1] === 4
);

assert.deepEqual(
  p0Matched34.map((row) => ({
    cell: row.cell,
    token: row.token,
    origin: row.origin,
  })),
  [
    { cell: 67, token: "3C", origin: 0 },
    { cell: 83, token: "3D", origin: 1 },
    { cell: 127, token: "3D", origin: 1 },
    { cell: 162, token: "3C", origin: 0 },
    { cell: 189, token: "3C", origin: 0 },
    { cell: 247, token: "3C", origin: 0 },
  ]
);
assert.equal(
  p0Matched34.filter((row) => row.origin === 0).length / 256,
  0.015625
);

assert.equal(p0.runeCount, 262);
assert.equal(p0.words.length, 59);
const p0Adjacent34 = p0.words.slice(0, -1).filter((word, index) =>
  word.length === 3 && p0.words[index + 1].length === 4
);
assert.equal(p0Adjacent34.length, 5);
assert.equal(p0Adjacent34.length / p0.runeCount, 5 / 262);

const translit = [
  "F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
  "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA",
];
const gpTokens = translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

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
    assert.ok(token);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const signedWords = clear
  .split(/[^A-Za-z]+/)
  .filter(Boolean)
  .map((word) => word.toUpperCase());

const signedPairs34 = [];
for (let index = 0; index + 1 < signedWords.length; index += 1) {
  const leftLength = gp(signedWords[index]).length;
  const rightLength = gp(signedWords[index + 1]).length;
  if (leftLength === 3 && rightLength === 4) {
    signedPairs34.push([
      signedWords[index],
      signedWords[index + 1],
    ]);
  }
}
assert.equal(signedPairs34.length, 4);
assert.ok(
  signedPairs34.some((pair) => pair[0] === "AND" && pair[1] === "THEIR")
);

// Independent authenticated VERIFY control: one radix is selected, not both.
function reflect(cell) {
  return Math.floor(cell / 8) * 8 + (7 - (cell % 8));
}

assert.equal(gp("VERIFY").reduce((a, b) => a + b, 0), 59);
assert.equal(cells[59], "19");
assert.equal(reflect(59), 60);
assert.equal(cells[60], "1k");
assert.equal(decodeToken(cells[60], base59) % 29, 17);
assert.equal(decodeToken(cells[60], base60) % 29, 19);

console.log(JSON.stringify({
  status: "PASS: p50 simultaneous dual-radix audit supports NO-GO",
  fullBoundaryFamily: {
    consecutiveStarts:
      boundaryEvents.filter((event) => event.consecutiveStarts).length,
    consecutiveEnds:
      boundaryEvents.filter((event) => event.consecutiveEnds).length,
  },
  selfPointers,
  selfPointerBoundaryEvents: selfPointerEvents,
  p0: {
    runeCount: p0.runeCount,
    wordCount: p0.words.length,
    matched34Cases: p0Matched34,
    roadOriginTokenMultisetRate:
      p0Matched34.filter((row) => row.origin === 0).length / 256,
    adjacent34Count: p0Adjacent34.length,
    circularShiftRate: p0Adjacent34.length / p0.runeCount,
  },
  signedPairs34,
  verifyControl: {
    sourceAddress: 59,
    sourceToken: cells[59],
    reflectedCell: 60,
    reflectedToken: cells[60],
    base59Mod29: decodeToken(cells[60], base59) % 29,
    base60Mod29: decodeToken(cells[60], base60) % 29,
  },
  decision:
    "NO-GO: no independent solved/source control requires simultaneous base59/base60 consumption; retain ROAD dual outputs only as a local candidate generator.",
}, null, 2));
