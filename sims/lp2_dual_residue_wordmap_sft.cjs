#!/usr/bin/env node
"use strict";

// Reproduce the candidate GP29 dual-residue word-map alignment.
// Run from any working directory: node sims/lp2_dual_residue_wordmap_sft.cjs

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const T = grid.bytes;

const wordMap = [
  "HELLO", "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY", "ITS", "WORDS",
  "ARE", "THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD",
  "AND", "THEIR", "NUMBERS", "ARE", "THE"
];

const tokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function gp29FromText(text) {
  const s = text.toUpperCase().replace(/\\s+/g, "")
    .replace(/K/g, "C").replace(/V/g, "U").replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let pos = 0; pos < s.length;) {
    const hit = tokens.find(({ token }) => s.startsWith(token, pos));
    if (!hit) throw new Error("Cannot GP29-tokenize at " + JSON.stringify(s.slice(pos)));
    out.push(hit.index);
    pos += hit.token.length;
  }
  return out;
}

function summarize(indices) {
  let n = 0n;
  for (const x of indices) n = n * 29n + BigInt(x);
  const q = Number(n % 23n);
  const r = Number(n % 29n);
  return {
    gp29_length: indices.length,
    gp29_indices: indices,
    N_mod_23: q,
    N_mod_29: r,
    N_mod_667: Number(n % 667n),
    word_pair: [wordMap[q], wordMap[r]],
    pair_address: 29 * q + r
  };
}

function trace(start) {
  if (start < 0 || start >= T.length) return null;
  const seen = new Map();
  const sequence = [];
  let x = start;
  while (!seen.has(x)) {
    seen.set(x, sequence.length);
    sequence.push(x);
    x = T[x];
  }
  const mu = seen.get(x);
  return {
    transient_length: mu,
    cycle_length: sequence.length - mu,
    cycle_entry: x,
    sequence
  };
}

const p0 = corpus.pages[0].indices;
const p15 = corpus.pages[15].indices;
const p53 = corpus.pages[53].indices;

const operands = {
  p0_title: gp29FromText("EPIPHANY SEEKS"),
  p0_right_rise: gp29FromText("EPIPHANY SEEKS THE DEVOTED"),
  p0_prefix_73_79: p0.slice(73, 80),
  p0_horizontal_readout: gp29FromText("WORDS MAP MEANING NUMBERS"),
  p0_core_80_102: p0.slice(80, 103),
  p0_span_73_102: p0.slice(73, 103),
  p15_window_23_73: p15.slice(23, 74),
  p53_red_span_128_178: p53.slice(128, 179)
};

const results = {};
for (const [name, indices] of Object.entries(operands)) {
  const result = summarize(indices);
  result.p50_trace = trace(result.pair_address);
  result.N_mod_179_squared = Number((() => {
    let n = 0n;
    for (const x of indices) n = n * 29n + BigInt(x);
    return n % (179n * 179n);
  })());
  results[name] = result;
}

const cycle2 = [158, 249];
const cycle11 = [115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197];
function verifyCycle(cycle) {
  return cycle.every((node, i) => T[node] === cycle[(i + 1) % cycle.length]);
}

const prefixMatches = [];
for (let page = 0; page <= 55; page++) {
  const a = corpus.pages[page].indices;
  for (let offset = 0; offset <= a.length - 7; offset++) {
    const v = summarize(a.slice(offset, offset + 7));
    if (v.N_mod_23 === 7 && v.N_mod_29 === 13) prefixMatches.push({ page, offset });
  }
}

const basinCounts = {};
for (let i = 0; i < T.length; i++) {
  const z = trace(i);
  const key = String(z.cycle_length);
  basinCounts[key] = (basinCounts[key] || 0) + 1;
}

const output = {
  grid_shape: grid.shape,
  grid_pages: grid.pages.map(p => ({ page: p.page, rows: p.rows, cols: p.cols, token_count: p.tokens.length })),
  p50_cycles: {
    cycle2,
    cycle2_verified: verifyCycle(cycle2),
    cycle11,
    cycle11_verified: verifyCycle(cycle11),
    basin_counts_by_cycle_length: basinCounts
  },
  operands: results,
  prefix_7_13_window_count: prefixMatches.length,
  prefix_7_13_window_matches: prefixMatches
};

console.log(JSON.stringify(output, null, 2));
