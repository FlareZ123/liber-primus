#!/usr/bin/env node
"use strict";

/**
 * Test the source-motivated binary-row reading of the 10-dot 3x7 stencil
 * as a seven-symbol additive GP29 key on the 553-rune p36/p38 interval.
 *
 * The 553 runes are 139 (p36 suffix) + 228 (p37) + 186 (p38 prefix)
 * = 553 = 79*7. The stencil rows .#. and #.# decode as 2 and 5 in binary,
 * giving [2,5,2,5,2,5,2]. Both natural matrix orientations are tested:
 * 79 rows x 7 columns (period-7 key) and 7 rows x 79 columns (79-rune
 * row blocks). Both additive directions and the complementary bit reading
 * are tested. No unconstrained phase or key search is performed.
 *
 * Run: node sims/ten_dot_553_additive_key_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encode } = require("./word_partition_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const GP_SIZE = 29;
const STENCIL_ROWS = [".#.", "#.#", ".#.", "#.#", ".#.", "#.#", ".#."];

function ioc(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  let pairs = 0;
  for (const count of counts.values()) pairs += count * (count - 1);
  return values.length > 1 ? pairs / (values.length * (values.length - 1)) : 0;
}

function applyKey(values, key, layout, sign) {
  return values.map((value, index) => {
    const keyIndex = layout === "period7" ? index % 7 : Math.floor(index / 79);
    return (value + sign * key[keyIndex] + GP_SIZE) % GP_SIZE;
  });
}

function run() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const p36 = corpus.pages.find(page => page.page === 36).indices;
  const p37 = corpus.pages.find(page => page.page === 37).indices;
  const p38 = corpus.pages.find(page => page.page === 38).indices;
  const parts = [p36.slice(99), p37, p38.slice(0, 186)];
  const passage = parts.flat();
  assert.deepEqual(parts.map(part => part.length), [139, 228, 186]);
  assert.equal(passage.length, 553);
  assert.equal(7 * 79, passage.length);

  const key = STENCIL_ROWS.map(row =>
    parseInt(row.replace(/#/g, "1").replace(/\./g, "0"), 2)
  );
  assert.deepEqual(key, [2, 5, 2, 5, 2, 5, 2]);
  const keys = [
    { name: "dots-as-one", values: key },
    { name: "dots-as-zero", values: key.map(value => 7 - value) }
  ];

  const shakespeare = (read("resources/control/shakespeare_first300k.txt")
    .toUpperCase().match(/[A-Z]+/g) || []).map(encode).flat().slice(0, 553);
  assert.equal(shakespeare.length, 553);
  const controlIoC = ioc(shakespeare);

  const variants = [];
  for (const layout of ["period7", "rowBlock79"]) {
    for (const keySpec of keys) {
      for (const sign of [-1, 1]) {
        const output = applyKey(passage, keySpec.values, layout, sign);
        const encryptedControl = applyKey(shakespeare, keySpec.values, layout, -sign);
        const recoveredControl = applyKey(encryptedControl, keySpec.values, layout, sign);
        assert.deepEqual(recoveredControl, shakespeare);
        variants.push({
          layout,
          keyReading: keySpec.name,
          sign,
          key: keySpec.values,
          outputIoC: Number(ioc(output).toFixed(9)),
          first120Runes: output.slice(0, 120)
        });
      }
    }
  }

  const maxOutputIoC = Math.max(...variants.map(variant => variant.outputIoC));
  assert.ok(controlIoC > maxOutputIoC + 0.02);

  return {
    classification: "source-motivated direct additive-key test; no plaintext recovered",
    delimiters: {
      p36LocalOffset: 99,
      p38LocalOffset: 186,
      componentLengths: parts.map(part => part.length),
      passageLength: passage.length,
      factorization: "553 = 7 * 79",
      passageIoC: Number(ioc(passage).toFixed(9))
    },
    stencil: {
      rows: STENCIL_ROWS,
      binaryRowValues: key,
      note: "3-bit left-to-right binary; dot=1, blank=0"
    },
    controls: {
      name: "Shakespeare GP29-encoded control",
      symbols: shakespeare.length,
      ioc: Number(controlIoC.toFixed(9))
    },
    testedLayouts: {
      period7: "79 rows x 7 columns; key repeats every 7 runes",
      rowBlock79: "7 rows x 79 columns; one key symbol per 79-rune row"
    },
    variants,
    decision: {
      maximumCandidateIoC: Number(maxOutputIoC.toFixed(9)),
      allCandidatesRemainNearUniform: variants.every(v => v.outputIoC < 0.04),
      controlWellSeparated: controlIoC - maxOutputIoC
    },
    exclusions: [
      "The 10-dot stencil's binary row values are not a direct additive GP29 key for the 553-rune interval under either natural 7x79 orientation.",
      "The p36/p38 interval cannot be recovered by this fixed additive key interpretation."
    ],
    remaining: [
      "A different source-selected use of the stencil",
      "A nonlinear/stateful operation involving the p15/p53 79/78 arithmetic",
      "A different key consumer or register"
    ]
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { ioc, applyKey, run };
