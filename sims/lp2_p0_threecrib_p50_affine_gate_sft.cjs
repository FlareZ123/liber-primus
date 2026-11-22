"use strict";

/**
 * Three-crib p0 gate for a source-natural p50 pointwise value layer.
 *
 * Tests C_i = a*P_i + b*S_i + d (mod 29) for all nonzero a,b and all d,
 * over fixed source streams derived from the canonical p50 table and the
 * independently archived 2014 sexagesimal byte stream. Both current-cell and
 * predecessor-cell clocks are exhaustive within this frozen family.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"
));
const sex = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/cicada2014-sexagesimal-source.json"), "utf8"
));

const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const p0 = corpus.pages.find(p => p.page === 0).indices;
const known = [
  [0,18],[1,13],[2,10],[3,13],[4,8],[5,24],[6,9],[7,26],[8,15],[9,18],[10,18],[11,5],[12,15],
  [103,2],[104,18],[105,4],[106,3],[107,24],[108,23],
  [235,2],[236,18],[237,23],[238,18],[239,1],[240,3],[241,16],[242,18],[243,23]
];
assert.equal(known.length, 28);
assert.deepEqual(p0.slice(0,13), [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(p0.slice(103,109), [8,12,16,8,25,27]);
assert.deepEqual(p0.slice(235,244), [8,5,15,22,16,22,21,1,4]);
assert.equal(grid.bytes.length, 256);
assert.equal(sex.decimal_values.length, 256);

const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
function base59(tok) {
  const hi = alpha59.indexOf(tok[0]);
  const lo = alpha59.indexOf(tok[1]);
  return hi < 0 || lo < 0 ? null : hi * 59 + lo;
}

const streams = [
  ["p50_byte29", grid.bytes.map(x => x % MOD)],
  ["2014_sex_byte29", sex.decimal_values.map(x => x % MOD)],
  ["p50_hi60", tokens.map(t => alpha60.indexOf(t[0]) % MOD)],
  ["p50_lo60", tokens.map(t => alpha60.indexOf(t[1]) % MOD)],
  ["p50_base59mod29", tokens.map(t => { const v = base59(t); return v === null ? null : v % MOD; })],
  ["2014_sex_hi_base29", sex.decimal_values.map(x => Math.floor(x / MOD))],
  ["2014_sex_lo_base29", sex.decimal_values.map(x => x % MOD)],
  ["p50_hi_base29", grid.bytes.map(x => Math.floor(x / MOD))],
  ["p50_lo_base29", grid.bytes.map(x => x % MOD)]
];

function scan() {
  const survivors = [];
  const best = [];
  for (const [name, source] of streams) {
    for (const predecessor of [false, true]) {
      let top = {matches:-1, a:null, b:null, d:null};
      for (let a = 1; a < MOD; a++) {
        for (let b = 1; b < MOD; b++) {
          for (let d = 0; d < MOD; d++) {
            let matches = 0;
            let complete = true;
            for (const [pos, plain] of known) {
              const cell = (pos - (predecessor ? 1 : 0) + 256) % 256;
              const sourceValue = source[cell];
              if (sourceValue === null) { complete = false; break; }
              if (mod(a * plain + b * sourceValue + d) === p0[pos]) matches++;
              else complete = false;
            }
            if (matches > top.matches) top = {matches, a, b, d};
            if (complete) survivors.push({name, predecessor, a, b, d});
          }
        }
      }
      best.push({name, predecessor, ...top});
    }
  }
  best.sort((x,y) => y.matches - x.matches || x.name.localeCompare(y.name));
  return {survivors, best};
}


function scanDh2Stride() {
  const survivors = [];
  const best = [];
  for (const [name, source] of streams) {
    for (const step of [2, -2]) {
      let top = {matches:-1, start:null, a:null, b:null, d:null};
      for (let start = 0; start < 256; start++) {
        const [firstPos, firstPlain] = known[0];
        const firstSource = source[mod(start + step * firstPos) % 256];
        if (firstSource === null) continue;
        for (let a = 1; a < MOD; a++) {
          for (let b = 1; b < MOD; b++) {
            const d = mod(p0[firstPos] - a * firstPlain - b * firstSource);
            let matches = 0;
            let complete = true;
            for (const [pos, plain] of known) {
              const sourceValue = source[mod(start + step * pos) % 256];
              if (sourceValue === null) { complete = false; break; }
              if (mod(a * plain + b * sourceValue + d) === p0[pos]) matches++;
              else complete = false;
            }
            if (matches > top.matches) top = {matches, start, a, b, d};
            if (complete) survivors.push({name, step, start, a, b, d});
          }
        }
      }
      best.push({name, step, ...top});
    }
  }
  best.sort((x,y) => y.matches - x.matches || x.name.localeCompare(y.name));
  return {survivors, best};
}

function positiveControl() {
  const source = streams.find(([name]) => name === "p50_hi60")[1];
  const a = 7, b = 11, d = 4;
  const cipher = new Map(known.map(([pos, plain]) => [pos, mod(a*plain + b*source[pos] + d)]));
  let matches = 0;
  for (const [pos, plain] of known) {
    if (mod(a*plain + b*source[pos] + d) === cipher.get(pos)) matches++;
  }
  assert.equal(matches, 28);
}

function main() {
  positiveControl();
  const {survivors, best} = scan();
  const dh2Stride = scanDh2Stride();
  assert.deepEqual(survivors, []);
  assert.equal(best[0].matches, 7);
  assert.equal(best[0].name, "p50_hi60");
  assert.deepEqual(dh2Stride.survivors, []);
  assert.equal(dh2Stride.best[0].matches, 8);
  console.log(JSON.stringify({
    crib_runes: known.length,
    source_streams: streams.map(([name]) => name),
    source_clocks: ["current_cell", "predecessor_cell"],
    family: "C = aP + bS + d mod29; a,b in 1..28; d in 0..28",
    survivors,
    best: best.slice(0, 18),
    dh23_shared_secret_2_stride: {
      traversal_steps: [2, -2],
      circular_starts: 256,
      survivors: dh2Stride.survivors,
      best: dh2Stride.best.slice(0, 18)
    },
    decision: "no p50/2014-sexagesimal affine pointwise or DH2-stride value layer fits all three p0 cribs"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {scan, scanDh2Stride};
