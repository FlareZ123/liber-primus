"use strict";

/**
 * SFT: cross-object GOOD/LUCK key bridges.
 *
 * Verifies:
 * - the existing GOOD key is independently encoded by p28 HERE line1;
 * - the existing LUCK key is independently encoded by p50 row4 under the
 *   already recovered DH columns and horizontal reflection;
 * - row4/right has the unique [K*b,g,K*g] H-tail among all 64 half-rows;
 * - the finite row/half/state-correction family selects only LUCK;
 * - LUCK alone among authenticated 2016 words addresses literal p50 token 2D.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const tableValues = grid.pages.flatMap((page) => page.bytes);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function inverse29(value) {
  for (let candidate = 1; candidate < 29; candidate += 1) {
    if ((value * candidate) % 29 === 1) return candidate;
  }
  throw new Error("noninvertible GP29 value");
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset));
    assert.ok(token);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(source) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: runeOffset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => runeIndex.get(rune)));
}

function runeLines(page) {
  return parts[page]
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word) => ({word: word.toUpperCase(), values: gp(word)}));
}

const state = Object.freeze({p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2});
assert.equal(mod29(state.K * state.b), 1);

const p28Lines = runeLines(28);
assert.equal(p28Lines.length, 12);
const hereFragments = lineFragments(p28Lines[0]);
const dhFragments = lineFragments(p28Lines[5]);
assert.equal(hereFragments.length, 5);
assert.equal(dhFragments.length, 5);
assert.deepEqual(H(dhFragments[0][0], dhFragments[0].at(-1)), [state.b, state.K]);
assert.deepEqual(H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1)), [state.A, state.B]);

const here = [
  ...H(hereFragments[0][0], hereFragments[0].at(-1)),
  ...H(hereFragments[1][0], hereFragments[1].at(-1)),
];
assert.deepEqual(here, gp("HERE"));

const goodDhKey = [
  H(state.A, state.B)[0],
  H(state.A, state.B)[0],
  state.p,
  dhFragments.flat()[state.p - 1],
];
const goodHereKey = [
  H(hereFragments[0][0], hereFragments[0].at(-1))[1],
  H(hereFragments[1][0], hereFragments[1].at(-1))[1],
  hereFragments[2][0],
  hereFragments[2].at(-1),
];
assert.deepEqual(goodDhKey, [18, 18, 23, 20]);
assert.deepEqual(goodHereKey, goodDhKey);

let eligibleTripleLines = 0;
const goodHereVectorHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (let lineIndex = 0; lineIndex < runeLines(page).length; lineIndex += 1) {
    const fragments = lineFragments(runeLines(page)[lineIndex]);
    if (
      fragments.length < 3 ||
      fragments[0].length < 2 ||
      fragments[1].length < 2 ||
      fragments[2].length < 2
    ) continue;
    eligibleTripleLines += 1;
    const vector = [
      H(fragments[0][0], fragments[0].at(-1))[1],
      H(fragments[1][0], fragments[1].at(-1))[1],
      fragments[2][0],
      fragments[2].at(-1),
    ];
    if (vector.every((value, index) => value === goodDhKey[index])) {
      goodHereVectorHits.push({page, line: lineIndex + 1, vector});
    }
  }
}
assert.equal(eligibleTripleLines, 432);
assert.deepEqual(goodHereVectorHits, [{page: 28, line: 1, vector: goodDhKey}]);

const p0 = parsePage(parts[0]);
const goodReceiver = p0.find((word) => word.start === 49);
assert.ok(goodReceiver);
assert.deepEqual(
  goodReceiver.values.map((value, index) => mod29(value - goodDhKey[index])),
  gp("GOOD"),
);

const luckSourceKey = [
  H(state.K, state.b)[1],
  H(state.K, state.b)[0],
  here.length,
  hereFragments.flat()[state.B - 1],
];
assert.deepEqual(luckSourceKey, [17, 16, 4, 22]);

function rowResidues(row) {
  return tableValues
    .slice(row * state.A, row * state.A + state.A)
    .map((value) => value % 29);
}

function luckRowVector(row) {
  const values = rowResidues(row);
  return [
    values[state.a],
    H(values[state.K], values[state.g])[1],
    H(values[0], values[state.A - 1])[1],
    values[state.g],
  ];
}

const luckRowMatches = [];
for (let row = 0; row < 32; row += 1) {
  const vector = luckRowVector(row);
  if (vector.every((value, index) => value === luckSourceKey[index])) {
    luckRowMatches.push({row, vector});
  }
}
assert.deepEqual(luckRowMatches, [{row: 4, vector: luckSourceKey}]);

const luckReceiver = p0.find((word) => word.start === 39);
assert.ok(luckReceiver);
assert.deepEqual(
  luckReceiver.values.map((value, index) => mod29(value - luckSourceKey[index])),
  gp("LUCK"),
);

assert.equal(gp0("GOOD"), 35);
assert.equal(tableTokens[35], "0d");
assert.equal(tableValues[35], 39);
const reflect = (address) =>
  state.A * Math.floor(address / state.A) +
  (state.A - 1 - (address % state.A));
assert.equal(reflect(35), 36);
assert.equal(Math.floor(35 / state.A), Math.floor(39 / state.A));

const selectedHalf = tableValues.slice(36, 40).map((value) => value % 29);
assert.deepEqual(selectedHalf, [25, 22, 17, 5]);
const selectedH = [
  ...H(selectedHalf[0], selectedHalf[3]),
  ...H(selectedHalf[1], selectedHalf[2]),
];
assert.deepEqual(selectedH, [20, 1, 5, 10]);
assert.deepEqual(
  selectedH.slice(1),
  [mod29(state.K * state.b), state.g, mod29(state.K * state.g)],
);

const stateTailHits = [];
for (let row = 0; row < 32; row += 1) {
  for (const half of [0, 4]) {
    const raw = tableValues
      .slice(row * state.A + half, row * state.A + half + 4)
      .map((value) => value % 29);
    const shell = [...H(raw[0], raw[3]), ...H(raw[1], raw[2])];
    if (shell.slice(1).every((value, index) => value === selectedH[index + 1])) {
      stateTailHits.push({row, half: half === 0 ? "left" : "right", shell});
    }
  }
}
assert.deepEqual(stateTailHits, [{
  row: 4,
  half: "right",
  shell: selectedH,
}]);

const correctedLuck = selectedH.slice();
correctedLuck[3] = mod29(correctedLuck[3] * state.b);
assert.deepEqual(correctedLuck, gp("LUCK"));
assert.equal(state.b, inverse29(state.K));

const message = signedWords();
const fourTargets = [...new Map(
  message
    .filter((row) => row.values.length === 4)
    .map((row) => [row.values.join(","), row])
).values()];

const correctionHits = [];
let correctionConfigs = 0;
for (let row = 0; row < 32; row += 1) {
  for (const halfOffset of [0, 4]) {
    const raw = tableValues
      .slice(row * state.A + halfOffset, row * state.A + halfOffset + 4)
      .map((value) => value % 29);
    const shell = [...H(raw[0], raw[3]), ...H(raw[1], raw[2])];

    correctionConfigs += 1;
    const direct = fourTargets.find((target) =>
      target.values.every((value, index) => value === shell[index]));
    if (direct) correctionHits.push({row, halfOffset, mode: "none", target: direct.word});

    for (let coordinate = 0; coordinate < 4; coordinate += 1) {
      for (const [fieldName, fieldValue] of Object.entries(state)) {
        for (const operation of ["multiply", "divide"]) {
          correctionConfigs += 1;
          const output = shell.slice();
          output[coordinate] = mod29(
            output[coordinate] *
            (operation === "multiply" ? fieldValue : inverse29(fieldValue))
          );
          const target = fourTargets.find((candidate) =>
            candidate.values.every((value, index) => value === output[index]));
          if (target) {
            correctionHits.push({
              row,
              half: halfOffset === 0 ? "left" : "right",
              coordinate: coordinate + 1,
              field: fieldName,
              operation,
              output,
              target: target.word,
            });
          }
        }
      }
    }
  }
}
assert.equal(correctionConfigs, 3648);
assert.deepEqual(correctionHits, [
  {
    row: 4,
    half: "right",
    coordinate: 4,
    field: "b",
    operation: "multiply",
    output: gp("LUCK"),
    target: "LUCK",
  },
  {
    row: 4,
    half: "right",
    coordinate: 4,
    field: "K",
    operation: "divide",
    output: gp("LUCK"),
    target: "LUCK",
  },
]);

assert.equal(gp0("LUCK"), 31);
assert.equal(tableTokens[31], "2D");
assert.deepEqual(
  message
    .filter((row) => gp0(row.word) < 256 && tableTokens[gp0(row.word)] === "2D")
    .map((row) => row.word),
  ["LUCK"],
);

console.log(JSON.stringify({
  status: "PASS: GOOD/LUCK exact keys have independent source-object encodings",
  good: {
    key: goodDhKey,
    hereKey: goodHereKey,
    eligibleTripleLines,
    hereVectorHits: goodHereVectorHits,
  },
  luck: {
    key: luckSourceKey,
    rowMatches: luckRowMatches,
    selectedHalf,
    selectedH,
    uniqueDhTail: stateTailHits,
    corrected: correctedLuck,
    correctionConfigs,
    correctionHits,
    postToken: {address: 31, token: tableTokens[31]},
  },
}, null, 2));
