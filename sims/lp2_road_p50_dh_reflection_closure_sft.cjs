"use strict";

/**
 * SFT: ROAD number-direction p50 cell closes onto the p28 DH state.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

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
    assert.ok(token, `unmapped GP spelling: ${word}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function base29(values) {
  return values.reduce((number, value) => number * 29 + value, 0);
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.notEqual(high, -1);
  assert.notEqual(low, -1);
  return high * alphabet.length + low;
}

function reflect(cell) {
  return Math.floor(cell / 8) * 8 + (7 - (cell % 8));
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const ka = state.K * state.a;
assert.equal(ka, 12);
assert.equal(state.A - 1 - state.g, state.K);

const cells = grid.pages.flatMap((page) => page.tokens);
assert.equal(cells.length, 256);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");

const road = gp("ROAD");
assert.deepEqual(road, [4, 3, 24, 23]);
const roadNumber = base29(road);
assert.equal(roadNumber, 100798);
const roadResidue = roadNumber % 256;
assert.equal(roadResidue, 190);
const roadCell = roadResidue - 1;
assert.equal(roadCell, 189);

assert.equal(Math.floor(roadCell / 8), state.p);
assert.equal(roadCell % 8, state.g);
assert.equal(cells[roadCell], "3C");
assert.equal(base60.indexOf("3"), state.e);
assert.equal(base60.indexOf("C"), ka);
assert.equal(base59.indexOf("3"), state.e);
assert.equal(base59.indexOf("C"), ka);
assert.equal(decodeToken(cells[roadCell], base59), roadCell);

const reflected = reflect(roadCell);
assert.equal(reflected, 186);
assert.equal(Math.floor(reflected / 8), state.p);
assert.equal(reflected % 8, state.K);
assert.equal(cells[reflected], "0J");
assert.equal(decodeToken(cells[reflected], base59), state.B);
assert.equal(decodeToken(cells[reflected], base60), state.B);
assert.equal(cells[state.B], "0X");
assert.equal(parseInt(cells[roadCell], 16), base60.length);
assert.equal(`${cells[state.B]}${cells[roadCell]}`, "0X3C");

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const distinctWords = [...new Set(
  clear.split(/[^A-Za-z]+/).filter(Boolean).map((word) => word.toUpperCase())
)];
const fourRuneTargets = distinctWords
  .map((word) => ({ word, values: gp(word) }))
  .filter((row) => row.values.length === 4);

assert.deepEqual(
  fourRuneTargets.map((row) => row.word),
  ["LIES","THEIR","MEANING","ROAD","SEEK","WILL","GOOD","LUCK","PATHS"]
);

const rows = [];
for (const target of fourRuneTargets) {
  const number = base29(target.values);
  const residue = number % 256;

  for (const origin of ["zero", "one"]) {
    const cell = origin === "zero" ? residue : (residue + 255) % 256;
    const mirrored = reflect(cell);
    const token = cells[cell];
    const mirroredToken = cells[mirrored];

    const mirroredBase59 = decodeToken(mirroredToken, base59);
    const mirroredBase60 = decodeToken(mirroredToken, base60);
    const stableEndpoint = mirroredBase59 === mirroredBase60
      ? mirroredBase59
      : null;
    const endpointToken =
      stableEndpoint !== null && stableEndpoint >= 0 && stableEndpoint < cells.length
        ? cells[stableEndpoint]
        : null;
    const literalHex =
      endpointToken !== null &&
      /^0[xX]$/.test(endpointToken) &&
      /^[0-9A-Fa-f]{2}$/.test(token)
        ? parseInt(token, 16)
        : null;

    const closure =
      Math.floor(cell / 8) === state.p &&
      cell % 8 === state.g &&
      decodeToken(token, base59) === cell &&
      Math.floor(mirrored / 8) === state.p &&
      mirrored % 8 === state.K &&
      mirroredBase59 === state.B &&
      mirroredBase60 === state.B &&
      endpointToken === "0X" &&
      literalHex === base60.length;

    rows.push({
      word: target.word,
      values: target.values,
      number,
      residue,
      origin,
      cell,
      row: Math.floor(cell / 8),
      col: cell % 8,
      token,
      tokenBase59: decodeToken(token, base59),
      reflected: mirrored,
      reflectedRow: Math.floor(mirrored / 8),
      reflectedCol: mirrored % 8,
      reflectedToken: mirroredToken,
      reflectedBase59: mirroredBase59,
      reflectedBase60: mirroredBase60,
      stableEndpoint,
      endpointToken,
      literalHex,
      closure,
    });
  }
}

assert.equal(rows.length, 18);
assert.deepEqual(
  rows.filter((row) => row.closure).map((row) => ({
    word: row.word,
    origin: row.origin,
    cell: row.cell,
    token: row.token,
    reflected: row.reflected,
    reflectedToken: row.reflectedToken,
  })),
  [{
    word: "ROAD",
    origin: "one",
    cell: 189,
    token: "3C",
    reflected: 186,
    reflectedToken: "0J",
  }]
);

console.log(JSON.stringify({
  status: "PASS: ROAD p50 number-direction cell closes onto DH state",
  road: {
    values: road,
    base29: roadNumber,
    residue: roadResidue,
    oneBasedCell: roadCell,
    coordinates: [state.p, state.g],
    token: cells[roadCell],
    tokenDigits: [state.e, ka],
    tokenBase59: decodeToken(cells[roadCell], base59),
    reflected,
    reflectedCoordinates: [state.p, state.K],
    reflectedToken: cells[reflected],
    reflectedValue: state.B,
    BToken: cells[state.B],
    literalHexObject: `${cells[state.B]}${cells[roadCell]}`,
    literalHexValue: parseInt(cells[roadCell], 16),
    alphabetLength: base60.length,
  },
  family: {
    targetCount: fourRuneTargets.length,
    cases: rows.length,
    closures: rows.filter((row) => row.closure),
  },
  classification:
    "retrospective downstream structural corroboration of ROAD; exact finite-family DH and literal-hex radix60 closure, no new plaintext claimed.",
}, null, 2));
