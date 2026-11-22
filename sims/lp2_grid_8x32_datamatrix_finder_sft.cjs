"use strict";

/**
 * Original printed 32x8 table versus the exact 8x32 rectangular ECC200
 * Data Matrix symbol. Checks the mandatory finder/timing modules under
 * wholly secret, static byte-to-bit mappings and four rigid orientations.
 * Node.js 22; execute from the repository root. Read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const table = JSON.parse(fs.readFileSync(
  "resources/liber-primus/base60-grid.json", "utf8"
));
const rows = table.byte_rows;
const tokens = table.rows;
assert.deepEqual(table.page_row_counts, [10, 13, 9]);
assert.equal(rows.length, 32);
assert.ok(rows.every((row) => row.length === 8));
assert.equal(tokens.length, 32);
assert.equal(
  crypto.createHash("sha256")
    .update(Buffer.from(rows.flat())).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

/**
 * Source-physical 32x8 table turned 90 degrees into a standard ECC200 8x32.
 * ZXing SymbolInfo: new SymbolInfo(true, 10, 11, 14, 6, 2).
 * Two adjacent 8x16 regions, each enclosing a 6x14 data region.
 */
function border(y, x) {
  const col = x % 16;
  if (y === 0) return col % 2 === 0 ? 1 : 0;
  if (y === 7) return 1;
  if (col === 0) return 1;
  if (col === 15) return y % 2;
  return null;
}

/**
 * Exact lower bound on finder mismatches when each secret state can emit
 * either bit freely, but must use the same bit every time it reoccurs.
 * @param {{byte:number, token:string, target:number, sourceRow:number, sourceCol:number}[]} observed
 * @param {(item:object)=>string|number} state
 */
function minimumErrors(observed, state) {
  const hist = new Map();
  for (const item of observed) {
    const key = state(item);
    const count = hist.get(key) || [0, 0];
    count[item.target]++;
    hist.set(key, count);
  }
  return [...hist.values()].reduce(
    (errors, pair) => errors + Math.min(pair[0], pair[1]), 0
  );
}

/** Original data only, rigid flips after a 32x8 to 8x32 rotation. */
function originalBorder(flipRow, flipCol) {
  const found = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 32; x++) {
      const target = border(y, x);
      if (target === null) continue;
      const sourceRow = flipCol ? 31 - x : x;
      const sourceCol = flipRow ? 7 - y : y;
      found.push({
        byte: rows[sourceRow][sourceCol],
        token: tokens[sourceRow][sourceCol],
        target, sourceRow, sourceCol
      });
    }
  }
  assert.equal(found.length, 88);
  return found;
}
function page(row) {
  return row < 10 ? 49 : row < 23 ? 50 : 51;
}
const observed = [];
for (const flipRow of [0, 1]) {
  for (const flipCol of [0, 1]) {
    const sample = originalBorder(flipRow, flipCol);
    let bestBit = Infinity, bestBitPlane = null;
    for (let bit = 0; bit < 8; bit++) {
      for (let polarity = 0; polarity < 2; polarity++) {
        const mistakes = sample.reduce(
          (sum, item) => sum + (((item.byte >> bit) & 1) ^ polarity ^ item.target),
          0
        );
        if (mistakes < bestBit) {
          bestBit = mistakes;
          bestBitPlane = [bit, polarity];
        }
      }
    }
    observed.push({
      flipRow, flipCol,
      secretByte: minimumErrors(sample, (item) => item.byte),
      secretByteByPage: minimumErrors(
        sample, (item) => page(item.sourceRow) + ":" + item.byte
      ),
      secretFirstDigit: minimumErrors(sample, (item) => item.token[0]),
      secretSecondDigit: minimumErrors(sample, (item) => item.token[1]),
      secretByteByRowParity: minimumErrors(
        sample, (item) => (item.sourceRow % 2) + ":" + item.byte
      ),
      bestBit,
      bestBitPlane
    });
  }
}
assert.deepEqual(
  observed.map((x) => x.secretByte), [6, 4, 4, 5]
);
assert.deepEqual(
  observed.map((x) => x.secretByteByPage), [2, 1, 1, 2]
);
assert.deepEqual(
  observed.map((x) => x.secretFirstDigit), [22, 22, 21, 22]
);
assert.deepEqual(
  observed.map((x) => x.secretSecondDigit), [16, 19, 14, 16]
);
assert.deepEqual(
  observed.map((x) => x.secretByteByRowParity), [1, 0, 1, 0]
);
assert.deepEqual(
  observed.map((x) => x.bestBit), [37, 37, 33, 39]
);

// A native-shaped synthetic positive and an incorrect-source control.
// Every required finder module is present; interior modules are unrestricted
// because the test proves only a necessary finder condition, not full ECC200.
const planted = [];
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 32; x++) {
    const target = border(y, x);
    if (target === null) continue;
    planted.push({
      byte: target ? 0xaa : 0x55,
      token: "00",
      target, sourceRow: x, sourceCol: y
    });
  }
}
assert.equal(planted.length, 88);
assert.equal(minimumErrors(planted, (x) => x.byte), 0);
assert.equal(
  planted.reduce((sum, x) => sum + (((x.byte >> 7) & 1) ^ x.target), 0),
  0
);
const corrupted = planted.map((x) => ({ ...x }));
corrupted[1].byte = corrupted[1].byte === 0xaa ? 0x55 : 0xaa;
assert.ok(minimumErrors(corrupted, (x) => x.byte) >= 1);

console.log("PASS exact 8x32 ECC200 geometry, 88 mandatory modules, pinned table");
console.log("PASS full-source 32x8 rotation and all four rigid orientations");
console.log("Source findings:", JSON.stringify(observed));
console.log("PASS native-shaped finder plant and deliberate corruption control");
console.log("Direct byte, digit, bitplane and page-secret assignments all fail.");
console.log("Row-parity-secret mapping remains a conditional finder-only loophole.");
