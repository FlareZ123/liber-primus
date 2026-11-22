"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json").bytes;
const page = n => corpus.pages.find(p => p.page === n).indices;
const p53 = page(53), p54 = page(54), p55 = page(55);
const frame = [...p53, p54[0], ...p55];
assert.equal(p53.length, 179);
assert.equal(p54.length, 232);
assert.equal(p54[0], 24);
assert.equal(p55.length, 76);
assert.equal(frame.length, 256);
assert.equal(grid.length, 256);
assert.equal(new Set(grid).size, 161);
assert.equal(new Set(frame).size, 29);
const mod = (x, n = 256) => ((x % n) + n) % n;
const keys = [
  { name: "GP index", values: frame },
  { name: "GP prime weight", values: frame.map(index => corpus.prime[index]) },
];
const operations = [
  { name: "XOR", apply: (a, k) => a ^ k, invert: (c, k) => c ^ k },
  { name: "grid + key", apply: (a, k) => mod(a + k), invert: (c, k) => mod(c - k) },
  { name: "grid - key", apply: (a, k) => mod(a - k), invert: (c, k) => mod(c + k) },
  { name: "key - grid", apply: (a, k) => mod(k - a), invert: (c, k) => mod(k - c) },
];
function metrics(bytes) {
  const printable = bytes.filter(x => (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13).length;
  const letters = bytes.filter(x => (x >= 65 && x <= 90) || (x >= 97 && x <= 122)).length;
  const counts = Array(256).fill(0);
  for (const value of bytes) counts[value]++;
  const entropy = -counts.filter(Boolean).reduce((sum, n) => {
    const p = n / bytes.length;
    return sum + p * Math.log2(p);
  }, 0);
  let longest = 0, current = 0;
  for (const value of bytes) {
    if ((value >= 32 && value <= 126) || value === 9 || value === 10 || value === 13) {
      current++;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  const signatures = {
    PNG: [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a],
    JPEG: [0xff,0xd8,0xff], PDF: [0x25,0x50,0x44,0x46],
    ZIP: [0x50,0x4b,0x03,0x04], GZIP: [0x1f,0x8b],
    ELF: [0x7f,0x45,0x4c,0x46], OGG: [0x4f,0x67,0x67,0x53],
    RIFF: [0x52,0x49,0x46,0x46], SQLite: [0x53,0x51,0x4c,0x69,0x74,0x65],
  };
  const matched = Object.entries(signatures)
    .filter(([, prefix]) => prefix.every((value, i) => bytes[i] === value))
    .map(([name]) => name);
  return {
    printable_ratio: printable / bytes.length,
    letter_ratio: letters / bytes.length,
    entropy_bits_per_byte: entropy,
    longest_printable_run: longest,
    known_prefix_signatures: matched,
    first_32_bytes_hex: bytes.slice(0, 32).map(x => x.toString(16).padStart(2, "0")).join(""),
  };
}
const plant = [...fs.readFileSync(path.join(root, "resources/control/gibran_prophet_58585.txt")).subarray(0, 256)];
assert.equal(plant.length, 256);
const results = [];
for (const key of keys) for (const operation of operations) {
  const output = grid.map((value, i) => operation.apply(value, key.values[i]));
  const encryptedPlant = plant.map((value, i) => operation.apply(value, key.values[i]));
  const recoveredPlant = encryptedPlant.map((value, i) => operation.invert(value, key.values[i]));
  assert.deepEqual(recoveredPlant, plant);
  results.push({
    key_encoding: key.name,
    operation: operation.name,
    ...metrics(output),
    synthetic_positive_control_exact: true,
  });
}
const expected = [
  [0.40625, 7.12852441389348, 5],
  [0.38671875, 7.222918152316841, 4],
  [0.3984375, 7.23008691389348, 5],
  [0.3828125, 7.23008691389348, 4],
  [0.39453125, 7.21358081042011, 4],
  [0.328125, 7.089071814400863, 4],
  [0.3671875, 7.248813427641414, 4],
  [0.39453125, 7.248813427641414, 4],
];
for (let i = 0; i < results.length; i++) {
  assert.ok(Math.abs(results[i].printable_ratio - expected[i][0]) < 1e-12);
  assert.ok(Math.abs(results[i].entropy_bits_per_byte - expected[i][1]) < 1e-10);
  assert.equal(results[i].longest_printable_run, expected[i][2]);
  assert.deepEqual(results[i].known_prefix_signatures, []);
}
console.log(JSON.stringify({
  classification: "bounded negative; no bytewise payload recovered",
  source_frame: {
    p53_runes: p53.length, p54_red_A: p54[0], p55_runes: p55.length,
    composite_runes: frame.length, grid_bytes: grid.length,
    distinct_grid_bytes: new Set(grid).size, distinct_frame_runes: new Set(frame).size,
  },
  tested_scope: "row-major p50 bytes against source-order p53+p54-A+p55; GP index/prime-weight keys; XOR and three directed additive operations",
  models: results,
  decision: "Retire these eight direct bytewise-pad consumers only; do not expand arbitrary byte transforms or traversal orders without a new source selector.",
}, null, 2) + "\n");
