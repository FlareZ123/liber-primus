"use strict";

// Test the 121-rune p32 map as a fixed, twice-repeated additive key for p0.
// Source order only: p32 row-major/page order, p0 body after the 20-rune header.
// Run from repository root:
//   node sims/p32_grid_121_repeat_key_on_p0_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const readText = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const trans = corpus.translit;
const page = n => corpus.pages.find(p => p.page === n).indices;
const p0 = page(0);
const p32 = page(32);
const bodyOffset = 20;
const body = p0.slice(bodyOffset);
assert.equal(p32.length, 121);
assert.equal(body.length, 242);
assert.equal(bodyOffset, 13 + 7);
const mod = (x, n = 29) => ((x % n) + n) % n;

function gpEnglish(text) {
  const index = new Map(trans.map((token, i) => [token, i]));
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const width of [3, 2, 1]) {
        const token = word.slice(i, i + width);
        if (index.has(token)) {
          out.push(index.get(token));
          i += width;
          matched = true;
          break;
        }
      }
      if (!matched) throw new Error("Unmapped control text at " + word.slice(i));
    }
  }
  return out;
}
function trigramModel(train) {
  const counts = new Uint32Array(29 ** 3);
  for (let i = 2; i < train.length; i++)
    counts[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
  const denominator = train.length - 2 + counts.length * 0.2;
  return values => {
    let total = 0;
    for (let i = 2; i < values.length; i++) {
      const n = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
      total += Math.log((counts[n] + 0.2) / denominator);
    }
    return total / (values.length - 2);
  };
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance,
    actual + " differs from " + expected);

const keys = [
  { name: "GP index", values: p32 },
  { name: "GP prime weight", values: p32.map(index => corpus.prime[index]) },
];
const train = gpEnglish(readText("resources/control/emerson_essays_2944.txt"))
  .slice(0, 50000);
const gibran = gpEnglish(readText("resources/control/gibran_prophet_58585.txt"));
const score = trigramModel(train);
const holdoutScores = [];
for (let start = 0; start + body.length <= gibran.length; start += 7)
  holdoutScores.push(score(gibran.slice(start, start + body.length)));
holdoutScores.sort((a, b) => a - b);

const results = [];
for (const key of keys) for (const sign of [-1, 1]) {
  const repeated = Array.from({ length: body.length }, (_, i) => key.values[i % 121]);
  const output = body.map((value, i) => mod(value + sign * repeated[i]));
  const recovered = output.map((value, i) => mod(value - sign * repeated[i]));
  assert.deepEqual(recovered, body);

  const plant = gibran.slice(300, 300 + body.length);
  assert.equal(plant.length, body.length);
  const plantedCipher = plant.map((value, i) => mod(value - sign * repeated[i]));
  assert.deepEqual(plantedCipher.map((value, i) =>
    mod(value + sign * repeated[i])), plant);

  results.push({
    key_encoding: key.name,
    operation: sign < 0 ? "C-K" : "C+K",
    trigram_nats_per_rune: score(output),
    ioc: ioc(output),
    first_121_rune_block_score: score(output.slice(0, 121)),
    second_121_rune_block_score: score(output.slice(121)),
    preview: output.slice(0, 96).map(index => trans[index]).join(""),
    original_round_trip_exact: true,
    synthetic_positive_control_exact: true,
  });
}
close(score(body), -12.00700961389401);
close(ioc(body), 0.03429237680463633);
close(results[0].trigram_nats_per_rune, -11.8606958775299);
close(results[1].trigram_nats_per_rune, -11.920786392632749);
close(results[2].trigram_nats_per_rune, -11.787417016462038);
close(results[3].trigram_nats_per_rune, -11.975028828402948);
assert.equal(holdoutScores.length, 8982);
close(holdoutScores[0], -8.629568189356355);
assert.equal(results.filter(x => x.trigram_nats_per_rune >= holdoutScores[0]).length, 0);

console.log(JSON.stringify({
  classification: "bounded negative; no p0 plaintext recovered",
  target: {
    p0_body_offset: bodyOffset,
    p0_body_runes: body.length,
    p32_map_runes: p32.length,
    repeated_periods: 2,
    key_reading: "p32 page order / row-major",
  },
  raw: { trigram_nats_per_rune: score(body), ioc: ioc(body) },
  models: results,
  native_gibran_holdout: {
    length: body.length,
    stride: 7,
    windows: holdoutScores.length,
    minimum: holdoutScores[0],
    q10: holdoutScores[Math.floor(holdoutScores.length * 0.1)],
    median: holdoutScores[Math.floor(holdoutScores.length * 0.5)],
    q90: holdoutScores[Math.floor(holdoutScores.length * 0.9)],
  },
  decision: "Retire only row-major p32-map repeating-key Vigenere with GP-index/prime-weight keys and both signs. The exact 121/242 length relation does not authenticate the map-as-key interpretation.",
}, null, 2) + "\n");
