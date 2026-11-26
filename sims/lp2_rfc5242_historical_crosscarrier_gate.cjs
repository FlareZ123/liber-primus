#!/usr/bin/env node
"use strict";

// Finite RFC 5242 source-family gate.
// Tests the three named 2014 256-byte archival streams directly and after
// same-index XOR with the original LP2 p49-51 32x8 numeric panel.
// For each 256-byte object, enumerate all single-byte framing positions,
// then require all 85 three-octet codepoints to have a clear leading bit.
// Big-endian is the RFC reading; little-endian is only a permissive control.
// No permutations, arbitrary masks, or fitted keys are searched.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");

const inventory = JSON.parse(fs.readFileSync(
  path.join(root, "resources/cicada-hiddenservice-256-candidates.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
));
const table = grid.byte_rows.flat();
const alphabet = grid.alphabet;
const tokenBytes = grid.rows.flat().map(token =>
  alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1])
);
assert.equal(table.length, 256);
assert.deepEqual(table, tokenBytes);
assert.equal(inventory.sourceServices.length, 3);

function scoreAfterDeletion(bytes, deleteIndex, leadOffset) {
  const stream = bytes.filter((_, i) => i !== deleteIndex);
  assert.equal(stream.length, 255);
  let violations = 0;
  for (let i = 0; i < 255; i += 3) {
    if (stream[i + leadOffset] >= 128) violations++;
  }
  return violations;
}

function bestDeletion(bytes, leadOffset) {
  let best = { bad: Infinity, del: -1 };
  for (let del = 0; del < 256; del++) {
    const bad = scoreAfterDeletion(bytes, del, leadOffset);
    if (bad < best.bad) best = { bad, del };
  }
  return best;
}

function positions(bytes, value) {
  return bytes.map((v, i) => v === value ? i : -1).filter(i => i >= 0);
}

function zeroTripletStarts(bytes) {
  const out = [];
  for (let i = 0; i <= bytes.length - 3; i++) {
    if (bytes[i] === 0 && bytes[i + 1] === 0 && bytes[i + 2] === 0) out.push(i);
  }
  return out;
}

function synthetic(endian, invalid) {
  const bytes = Array(256).fill(0);
  bytes[0] = 0x7f; // framing byte
  for (let i = 0; i < 85; i++) {
    const triple = endian === "big"
      ? (invalid ? [0x81, 0x02, 0x03] : [0x01, 0x02, 0x03])
      : (invalid ? [0x03, 0x02, 0x81] : [0x03, 0x02, 0x01]);
    bytes.splice(1 + 3 * i, 3, ...triple);
  }
  return bytes;
}

const results = inventory.sourceServices.map(service => {
  const raw = Array.from(Buffer.from(service.hex, "hex"));
  assert.equal(raw.length, 256);
  const xored = raw.map((value, i) => value ^ table[i]);
  const zeroPositions = positions(xored, 0);
  return {
    id: service.id,
    raw: {
      zero_byte_positions: positions(raw, 0),
      zero_triplet_starts: zeroTripletStarts(raw),
      best_big_endian: bestDeletion(raw, 0),
      best_little_endian: bestDeletion(raw, 2)
    },
    xor_with_lp2_grid: {
      zero_byte_positions: zeroPositions,
      zero_triplet_starts: zeroTripletStarts(xored),
      best_big_endian: bestDeletion(xored, 0),
      best_little_endian: bestDeletion(xored, 2),
      zero_byte_deletions: zeroPositions.map(del => ({
        del,
        big_endian_bad: scoreAfterDeletion(xored, del, 0),
        little_endian_bad: scoreAfterDeletion(xored, del, 2)
      }))
    }
  };
});

const positiveControls = {
  big_endian_valid_bad: scoreAfterDeletion(synthetic("big", false), 0, 0),
  big_endian_invalid_bad: scoreAfterDeletion(synthetic("big", true), 0, 0),
  little_endian_valid_bad: scoreAfterDeletion(synthetic("little", false), 0, 2),
  little_endian_invalid_bad: scoreAfterDeletion(synthetic("little", true), 0, 2)
};
assert.deepEqual(positiveControls, {
  big_endian_valid_bad: 0,
  big_endian_invalid_bad: 85,
  little_endian_valid_bad: 0,
  little_endian_invalid_bad: 85
});

const output = {
  schema: "lp2-rfc5242-historical-crosscarrier-v1",
  method: {
    source_order: "unchanged order in cicada-hiddenservice-256-candidates.json",
    receiver: "each 256-byte stream directly, then same-index XOR with the 256-byte LP2 p49-51 table",
    framing: "enumerate every possible one-byte deletion; remaining 255 bytes form 85 three-octet codepoints",
    endian: "big-endian is the RFC 5242 leading-octet reading; little-endian is a permissive control",
    criterion: "all 85 leading octets must be below 128 (0 violations)"
  },
  panel_bytes: 256,
  required_codepoints: 85,
  positive_controls: positiveControls,
  results
};
process.stdout.write(JSON.stringify(output, null, 2) + "\\n");
