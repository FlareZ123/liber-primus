"use strict";

/**
 * SFT: authenticated VERIFY reflection selects base60 by preserving DH B.
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

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function reflect(cell) {
  return Math.floor(cell / 8) * 8 + (7 - (cell % 8));
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.notEqual(high, -1);
  assert.notEqual(low, -1);
  return high * alphabet.length + low;
}

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

const cells = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const stateByValue = new Map(
  Object.entries(state).map(([label, value]) => [value, label])
);

assert.equal(gp0("VERIFY"), 59);
assert.equal(cells[59], "19");
assert.equal(Number(cells[59]), state.B);
assert.equal(reflect(59), 60);
assert.equal(cells[60], "1k");

const verify59 = decodeToken(cells[60], base59);
const verify60 = decodeToken(cells[60], base60);
assert.equal(verify59, 104);
assert.equal(verify60, 106);
assert.equal(mod(verify59, 29), 17);
assert.equal(mod(verify60, 29), state.B);

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const words = [...new Set(
  clear.split(/[^A-Za-z]+/).filter(Boolean).map((word) => word.toUpperCase())
)];

const stateLiteralRows = [];
for (const word of words) {
  const address = gp0(word);
  if (address < 0 || address >= cells.length) continue;

  const token = cells[address];
  if (!/^\d{2}$/.test(token)) continue;

  const literal = Number(token);
  const label = stateByValue.get(literal);
  if (!label) continue;

  const reflected = reflect(address);
  const reflectedToken = cells[reflected];
  const value59 = decodeToken(reflectedToken, base59);
  const value60 = decodeToken(reflectedToken, base60);

  stateLiteralRows.push({
    word,
    address,
    token,
    literal,
    label,
    reflected,
    reflectedToken,
    base59: value59,
    base60: value60,
    mod59: mod(value59, 29),
    mod60: mod(value60, 29),
    preserve59: mod(value59, 29) === literal,
    preserve60: mod(value60, 29) === literal,
  });
}

assert.deepEqual(stateLiteralRows, [
  {
    word: "PATH",
    address: 39,
    token: "05",
    literal: 5,
    label: "g",
    reflected: 32,
    reflectedToken: "1t",
    base59: 113,
    base60: 115,
    mod59: 26,
    mod60: 28,
    preserve59: false,
    preserve60: false,
  },
  {
    word: "VERIFY",
    address: 59,
    token: "19",
    literal: 19,
    label: "B",
    reflected: 60,
    reflectedToken: "1k",
    base59: 104,
    base60: 106,
    mod59: 17,
    mod60: 19,
    preserve59: false,
    preserve60: true,
  },
]);

assert.deepEqual(
  stateLiteralRows.filter((row) => row.preserve59 !== row.preserve60),
  [stateLiteralRows[1]]
);

console.log(JSON.stringify({
  status: "PASS: VERIFY reflection uniquely selects base60 by preserving DH B",
  VERIFY: stateLiteralRows[1],
  controlRows: stateLiteralRows,
  classification:
    "authenticated-source radix verification under source-selected p50 reflection; no LP rune-offset interpretation used.",
}, null, 2));
