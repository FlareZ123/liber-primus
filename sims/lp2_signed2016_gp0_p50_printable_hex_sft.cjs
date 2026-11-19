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
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
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
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

/** @param {string} token @returns {string|null} */
function printableHex(token) {
  if (!/^[0-9A-Fa-f]{2}$/u.test(token)) return null;
  const byte = Number.parseInt(token, 16);
  if (byte < 32 || byte > 126) return null;
  return String.fromCharCode(byte);
}

/** @param {string} token @returns {number|null} */
function hexByte(token) {
  return /^[0-9A-Fa-f]{2}$/u.test(token)
    ? Number.parseInt(token, 16)
    : null;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);

const addresses = words.map(gp0);
const table = grid.rows.flat();
assert.equal(table.length, 256);

const hexRows = [];
const printableRows = [];
for (let index = 0; index < words.length; index += 1) {
  const address = addresses[index];
  assert.ok(address >= 0 && address < table.length);
  const token = table[address];
  const byte = hexByte(token);
  if (byte !== null) {
    hexRows.push({ index, word: words[index], address, token, byte });
  }
  const character = printableHex(token);
  if (character !== null) {
    printableRows.push({
      index,
      word: words[index],
      address,
      token,
      character,
    });
  }
}

assert.deepEqual(
  hexRows.map((row) => [row.index,row.word,row.address,row.token,row.byte]),
  [
    [0,"HELLO",69,"1D",29],
    [2,"PATH",39,"05",5],
    [9,"LIBER",69,"1D",29],
    [10,"PRIMUS",62,"24",36],
    [18,"MAP",56,"4E",78],
    [23,"ROAD",54,"2a",42],
    [24,"AND",56,"4E",78],
    [26,"NUMBERS",83,"3D",61],
    [29,"DIRECTION",112,"1D",29],
    [30,"SEEK",56,"4E",78],
    [31,"AND",56,"4E",78],
    [34,"BE",35,"0d",13],
    [36,"GOOD",35,"0d",13],
    [37,"LUCK",31,"2D",45],
    [40,"PATHS",54,"2a",42],
    [41,"VERIFY",59,"19",25],
  ],
);

const printableString = printableRows
  .map((row) => row.character)
  .join("");
assert.equal(printableString, "$N*N=NN-*");
assert.deepEqual(
  printableRows.map((row) => row.word),
  ["PRIMUS","MAP","ROAD","AND","NUMBERS","SEEK","AND","LUCK","PATHS"],
);

assert.equal(table.filter((token) => hexByte(token) !== null).length, 88);
assert.equal(table.filter((token) => printableHex(token) !== null).length, 57);

assert.equal(gp0("MAP"), 56);
assert.equal(gp0("AND"), 56);
assert.equal(gp0("SEEK"), 56);
assert.equal(table[56], "4E");
assert.equal(printableHex(table[56]), "N");

assert.equal(gp0("ROAD"), 54);
assert.equal(gp0("PATHS"), 54);
assert.equal(table[54], "2a");
assert.equal(printableHex(table[54]), "*");

assert.equal(gp0("NUMBERS"), 83);
assert.equal(table[83], "3D");
assert.equal(printableHex(table[83]), "=");

/**
 * @param {boolean} rowMajor
 * @param {boolean} reverseMajor
 * @param {boolean} reverseMinor
 * @returns {string[]}
 */
function traversal(rowMajor, reverseMajor, reverseMinor) {
  const output = [];

  if (rowMajor) {
    const major = Array.from({ length: 32 }, (_, index) => index);
    if (reverseMajor) major.reverse();
    for (const row of major) {
      const minor = Array.from({ length: 8 }, (_, index) => index);
      if (reverseMinor) minor.reverse();
      for (const column of minor) output.push(grid.rows[row][column]);
    }
  } else {
    const major = Array.from({ length: 8 }, (_, index) => index);
    if (reverseMajor) major.reverse();
    for (const column of major) {
      const minor = Array.from({ length: 32 }, (_, index) => index);
      if (reverseMinor) minor.reverse();
      for (const row of minor) output.push(grid.rows[row][column]);
    }
  }

  assert.equal(output.length, 256);
  return output;
}

/** @param {string[]} candidate @returns {string} */
function sourcePrintable(candidate) {
  const output = [];
  for (const address of addresses) {
    const character = printableHex(candidate[address]);
    if (character !== null) output.push(character);
  }
  return output.join("");
}

const traversalStrings = [];
for (const rowMajor of [true,false]) {
  for (const reverseMajor of [false,true]) {
    for (const reverseMinor of [false,true]) {
      traversalStrings.push({
        rowMajor,
        reverseMajor,
        reverseMinor,
        string: sourcePrintable(
          traversal(rowMajor, reverseMajor, reverseMinor)
        ),
      });
    }
  }
}

assert.deepEqual(
  traversalStrings.map((row) => row.string),
  [
    "$N*N=NN-*",
    "N\"$4$",
    "<I<>K'K'",
    "!(!!K!!!H",
    ",;+ -+=",
    "-IM+>)M)=<",
    "H$9>HH'JH4HKH<'-4",
    "&>3*.$)$).$$*3-",
  ],
);

/** @param {string} value @returns {boolean} */
function discoveredShape(value) {
  if (value.length !== 9) return false;
  const symbol = value[1];
  return (
    value[0] === "$" &&
    /^[A-Z]$/u.test(symbol) &&
    value[2] === "*" &&
    value[3] === symbol &&
    value[4] === "=" &&
    value[5] === symbol &&
    value[6] === symbol &&
    value[7] === "-" &&
    value[8] === "*"
  );
}

const cyclicRows = [];
for (let origin = 0; origin < 256; origin += 1) {
  const shifted = Array.from(
    { length: 256 },
    (_, index) => table[(index + origin) % 256],
  );
  cyclicRows.push({
    origin,
    string: sourcePrintable(shifted),
  });
}

assert.equal(
  cyclicRows.filter((row) => row.string.length === 9).length,
  20,
);
assert.deepEqual(
  cyclicRows
    .filter((row) => discoveredShape(row.string))
    .map((row) => [row.origin,row.string]),
  [[0,"$N*N=NN-*"]],
);

// The original printable-node GP0 addresses form an authenticated DH-state
// direction tape under consecutive differences modulo29.
const originalPrintableAddresses = printableRows.map((row) => row.address);
assert.deepEqual(originalPrintableAddresses, [62,56,54,56,83,56,56,31,54]);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} nodeAddresses @returns {number[]} */
function addressDirections(nodeAddresses) {
  const output = [];
  for (let index = 1; index < nodeAddresses.length; index += 1) {
    output.push(mod29(nodeAddresses[index] - nodeAddresses[index - 1]));
  }
  return output;
}

const state = Object.freeze({ p:23, K:2, q:4, B:19 });
const originalDirections = addressDirections(originalPrintableAddresses);
assert.deepEqual(
  originalDirections,
  [state.p,mod29(-state.K),state.K,mod29(-state.K),state.K,0,state.q,state.p],
);

const directionStateSet = new Set([0,state.K,mod29(-state.K),state.q,state.p]);
const directionControl = [];

for (let origin = 0; origin < 256; origin += 1) {
  const shifted = Array.from(
    { length: 256 },
    (_, index) => table[(index + origin) % 256],
  );
  const selectedAddresses = [];
  const characters = [];

  for (let index = 0; index < words.length; index += 1) {
    const character = printableHex(shifted[addresses[index]]);
    if (character !== null) {
      selectedAddresses.push(addresses[index]);
      characters.push(character);
    }
  }

  const directions = addressDirections(selectedAddresses);
  if (
    directions.length > 0 &&
    directions.every((value) => directionStateSet.has(value))
  ) {
    directionControl.push({
      origin,
      string: characters.join(""),
      selectedCount: selectedAddresses.length,
      directions,
    });
  }
}

assert.deepEqual(
  directionControl.map((row) => [
    row.origin,
    row.string,
    row.selectedCount,
    row.directions,
  ]),
  [
    [0,"$N*N=NN-*",9,[23,27,2,27,2,0,4,23]],
    [22,"NN",2,[0]],
    [41,"\"<",2,[0]],
    [51,"<<<<",4,[0,0,0]],
    [198,"909*990",7,[27,2,27,2,0,27]],
  ],
);
assert.deepEqual(
  directionControl
    .filter((row) => row.directions.length >= 8)
    .map((row) => row.origin),
  [0],
);

const directionShell = [
  mod29(originalDirections[0] - originalDirections[7]),
  mod29(originalDirections[0] + originalDirections[7]),
  mod29(originalDirections[1] - originalDirections[6]),
  mod29(originalDirections[1] + originalDirections[6]),
  mod29(originalDirections[2] - originalDirections[5]),
  mod29(originalDirections[2] + originalDirections[5]),
  mod29(originalDirections[3] - originalDirections[4]),
  mod29(originalDirections[3] + originalDirections[4]),
];
assert.deepEqual(directionShell, [0,17,23,2,2,2,25,0]);
assert.deepEqual(
  directionShell,
  [0,mod29(state.B-state.K),state.p,state.K,state.K,state.K,
    mod29(state.p+state.K),0],
);

// Independent p0 DEVOTED zero-based source-number readout outer frame.
const devoted = [23,18,1,3,16,18,23];
assert.deepEqual(
  devoted.map((index) => words[index]),
  ["ROAD","MAP","THE","LIES","ARE","MAP","ROAD"],
);
assert.equal(
  printableHex(table[gp0(words[devoted[0]])]) +
  printableHex(table[gp0(words[devoted[1]])]),
  "*N",
);
assert.equal(
  printableHex(table[gp0(words[devoted[5]])]) +
  printableHex(table[gp0(words[devoted[6]])]),
  "N*",
);

console.log(JSON.stringify({
  status: "PASS",
  hexRows,
  printableRows,
  printableString,
  tableCounts: {
    hex: table.filter((token) => hexByte(token) !== null).length,
    printableHex: table.filter((token) => printableHex(token) !== null).length,
  },
  traversalStrings,
  cyclicControl: {
    length9: cyclicRows.filter((row) => row.string.length === 9).length,
    discoveredShape: cyclicRows.filter((row) => discoveredShape(row.string)),
  },
  directionTape: {\n    addresses: originalPrintableAddresses,\n    directions: originalDirections,\n    shell: directionShell,\n    cyclicSurvivors: directionControl,\n  },\n  devotedOuterFrame: {
    sourceWords: devoted.map((index) => words[index]),
    left: "*N",
    right: "N*",
  },
}, null, 2));
