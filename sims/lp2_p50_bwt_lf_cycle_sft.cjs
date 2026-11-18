"use strict";

/**
 * SFT: Is the exact LP2 256-numeral table a single-block, standard circular
 * Burrows-Wheeler last column? BWT preserves its symbols and a primitive
 * n-symbol source induces exactly one n-cycle in the stable LF map.
 *
 * Run on Windows 11: node sims/lp2_p50_bwt_lf_cycle_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";

/**
 * @param {number[]} last
 * @returns {{lf: number[], cycles: number[][]}}
 */
function stableLF(last) {
  const counts = new Map();
  const occurrence = last.map(value => {
    const count = counts.get(value) || 0;
    counts.set(value, count + 1);
    return count;
  });
  let first = 0;
  const start = new Map();
  for (const value of [...counts.keys()].sort((a, b) => a - b)) {
    start.set(value, first);
    first += counts.get(value);
  }
  const lf = last.map((value, index) => start.get(value) + occurrence[index]);
  const seen = new Set();
  const cycles = [];
  for (let i = 0; i < last.length; i++) {
    if (seen.has(i)) continue;
    const cycle = [];
    let row = i;
    while (!seen.has(row)) {
      seen.add(row);
      cycle.push(row);
      row = lf[row];
    }
    assert.equal(row, i, "LF must be a permutation of rows");
    cycles.push(cycle);
  }
  cycles.sort((a, b) => b.length - a.length);
  assert.equal(cycles.reduce((sum, c) => sum + c.length, 0), last.length);
  return {lf, cycles};
}

/** @param {number[]} plain @returns {{last:number[], primary:number}} */
function circularBWT(plain) {
  const n = plain.length;
  const rows = Array.from({length: n}, (_, i) => i);
  rows.sort((a, b) => {
    for (let k = 0; k < n; k++) {
      const diff = plain[(a + k) % n] - plain[(b + k) % n];
      if (diff) return diff;
    }
    return a - b;
  });
  return {
    last: rows.map(i => plain[(i + n - 1) % n]),
    primary: rows.indexOf(0)
  };
}

/** @param {number[]} last @param {number} primary @returns {number[]} */
function naiveInverse(last, primary) {
  const {lf} = stableLF(last);
  const output = Array(last.length);
  let row = primary;
  for (let i = last.length - 1; i >= 0; i--) {
    output[i] = last[row];
    row = lf[row];
  }
  return output;
}

/** @param {number[]} values @returns {Object<string,number[]>} */
function orientations(values) {
  return {
    "row": values,
    "column": Array.from({length: 256}, (_, i) =>
      values[8 * (i % 32) + Math.floor(i / 32)]
    ),
    "row-serpentine": Array.from({length: 256}, (_, i) =>
      values[8 * Math.floor(i / 8) +
        (Math.floor(i / 8) % 2 ? 7 - i % 8 : i % 8)]
    ),
    "column-serpentine": Array.from({length: 256}, (_, i) =>
      values[8 * (Math.floor(i / 32) % 2 ? 31 - i % 32 : i % 32) +
        Math.floor(i / 32)]
    )
  };
}

function main() {
  const tokens = source.pages.flatMap(p => p.tokens);
  const original = source.bytes;
  assert.equal(tokens.length, 256);
  assert.equal(original.length, 256);
  assert.deepStrictEqual(tokens.map(t =>
    60 * alphabet60.indexOf(t[0]) + alphabet60.indexOf(t[1])
  ), original);
  assert.equal(createHash("sha256").update(Buffer.from(original)).digest("hex"), SHA);

  const planted = [...Buffer.from("ONE UNIQUE HISTORICAL MESSAGE WITH A SINGLE BWT CYCLE.")];
  const encoded = circularBWT(planted);
  assert.deepStrictEqual(naiveInverse(encoded.last, encoded.primary), planted);
  assert.deepStrictEqual(stableLF(encoded.last).cycles.map(c => c.length), [planted.length]);
  console.log("Positive control: complete circular BWT and inverse exact", {
    length: planted.length, primary: encoded.primary
  });

  const alphabets = {
    base60: alphabet60,
    base59: alphabet60.replace("f", "")
  };
  const findings = {};
  for (const [radixName, alphabet] of Object.entries(alphabets)) {
    const radix = alphabet.length;
    const values = tokens.map(token =>
      radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1])
    );
    assert.ok(values.every(v => Number.isInteger(v) && v >= 0));
    assert.equal(new Set(values).size, 161);
    const modes = {};
    for (const [name, last] of Object.entries(orientations(values))) {
      const {cycles} = stableLF(last);
      const lengths = cycles.map(c => c.length);
      assert.ok(lengths.length > 1, "Unexpected genuine single BWT cycle");
      const row = index => cycles.find(c => c.includes(index)).length;
      const inv = naiveInverse(last, 133);
      const forward = circularBWT(inv);
      const recon = forward.primary === 133 &&
        forward.last.every((value, i) => value === last[i]);
      assert.equal(recon, false, "Invalid row133 must fail full BWT reproduction");
      modes[name] = {
        cycleLengths: lengths,
        index133Cycle: row(133),
        index132Cycle: row(132),
        index331Modulo256Cycle: row(331 % 256),
        circularBWTReproducesInput: recon
      };
      console.log(radixName + " " + name + ": " + lengths.join("+") +
        " (index133 cycle " + row(133) + ")");
    }
    findings[radixName] = modes;
  }
  assert.deepStrictEqual(findings.base60, findings.base59);
  assert.deepStrictEqual(findings.base60.row.cycleLengths,
    [188,24,16,12,7,3,3,2,1]);
  assert.deepStrictEqual(findings.base60.column.cycleLengths,
    [140,50,33,15,13,5]);
  assert.deepStrictEqual(findings.base60["row-serpentine"].cycleLengths,
    [112,66,43,16,12,5,2]);
  assert.deepStrictEqual(findings.base60["column-serpentine"].cycleLengths,
    [96,80,37,36,4,2,1]);
  console.log("PASS: all 4 source-geometric readouts are incompatible with a");
  console.log("standard single-block circular BWT of this 256-token multiset.");
  console.log(JSON.stringify({sourceSHA256: SHA, distinctTokens: 161, findings}, null, 2));
}

if (require.main === module) main();
module.exports = {stableLF, circularBWT, naiveInverse, orientations};
