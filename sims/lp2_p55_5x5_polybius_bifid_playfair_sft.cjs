#!/usr/bin/env node
"use strict";

// Reproduce the bounded p55 5x5 Polybius/Playfair/Bifid hypothesis test.
// Run from any directory: node sims/lp2_p55_5x5_polybius_bifid_playfair_sft.cjs
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const translit = corpus.translit;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const body = p55.slice(1); // first rune is carried across the p54/p55 page boundary
const symbols = [...new Set(body)].sort((a, b) => a - b);
if (p55.length !== 76 || body.length !== 75 || symbols.length !== 25) {
  throw new Error("Unexpected p55 source dimensions or alphabet support");
}

// The p57/prime-rank-derived block is rows 22..26, columns 2..6 (1-based).
// Use the missing-f radix-59 reading from the p57/p50 numeric lead.
const radix59 = table.alphabet.replace("f", "");
const values = table.rows.flat().map(token => {
  let n = 0;
  for (const ch of token) {
    const digit = radix59.indexOf(ch);
    if (digit < 0) throw new Error("A selected table token is invalid in radix59: " + token);
    n = n * 59 + digit;
  }
  return n;
});
const cells = [];
for (let r = 21; r < 26; r++) {
  for (let c = 1; c < 6; c++) {
    const index = r * 8 + c;
    cells.push({ row: r + 1, col: c + 1, index, value: values[index] });
  }
}
const ranked = [...cells].sort((a, b) => a.value - b.value);
if (new Set(cells.map(x => x.value)).size !== 25) {
  throw new Error("The selected 5x5 numeric block is not a 25-value permutation");
}

// Freeze the natural keyed-square construction: ascending numeric rank maps
// to the observed p55-body symbols in canonical GP29 index order.
const square = ranked.map((_, i) => symbols[i]);
const pos = new Map(square.map((symbol, i) => [symbol, [Math.floor(i / 5), i % 5]]));

function render(indices) {
  return indices.map(i => translit[i]).join("");
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}
function playfair(input, direction) {
  const out = [];
  for (let i = 0; i < input.length; i += 2) {
    const [r1, c1] = pos.get(input[i]);
    const [r2, c2] = pos.get(input[i + 1]);
    let a, b;
    const step = direction === "decrypt" ? -1 : 1;
    if (r1 === r2) {
      a = square[r1 * 5 + (c1 + step + 5) % 5];
      b = square[r2 * 5 + (c2 + step + 5) % 5];
    } else if (c1 === c2) {
      a = square[((r1 + step + 5) % 5) * 5 + c1];
      b = square[((r2 + step + 5) % 5) * 5 + c2];
    } else {
      a = square[r1 * 5 + c2];
      b = square[r2 * 5 + c1];
    }
    out.push(a, b);
  }
  return out;
}
function bifid(input, period, direction) {
  const out = [];
  for (let start = 0; start < input.length; start += period) {
    const chunk = input.slice(start, start + period);
    const coords = chunk.map(x => pos.get(x));
    if (direction === "encrypt") {
      const stream = [...coords.map(x => x[0]), ...coords.map(x => x[1])];
      for (let j = 0; j < chunk.length; j++) {
        out.push(square[stream[2 * j] * 5 + stream[2 * j + 1]]);
      }
    } else {
      const stream = coords.flat();
      const rows = stream.slice(0, chunk.length);
      const cols = stream.slice(chunk.length);
      for (let j = 0; j < chunk.length; j++) {
        out.push(square[rows[j] * 5 + cols[j]]);
      }
    }
  }
  return out;
}
function probabilityExactlyKDistinct(alphabetSize, draws, k) {
  let dp = Array(alphabetSize + 1).fill(0);
  dp[0] = 1;
  for (let t = 0; t < draws; t++) {
    const next = Array(alphabetSize + 1).fill(0);
    for (let seen = 0; seen <= alphabetSize; seen++) {
      next[seen] += dp[seen] * seen / alphabetSize;
      if (seen < alphabetSize) next[seen + 1] += dp[seen] * (alphabetSize - seen) / alphabetSize;
    }
    dp = next;
  }
  return dp[k];
}

const candidates = [];
for (const direction of ["decrypt", "encrypt"]) {
  const output = playfair(p55, direction);
  candidates.push({ cipher: "playfair", input: "full76", direction, ioc: ioc(output), output: render(output) });
}
for (const period of [5, 25, 75]) {
  for (const direction of ["decrypt", "encrypt"]) {
    const output = bifid(body, period, direction);
    candidates.push({ cipher: "bifid", input: "body75", period, direction, ioc: ioc(output), output: render(output) });
  }
}
const missing = translit.map((symbol, index) => ({ symbol, index })).filter(x => !symbols.includes(x.index));
const report = {
  source_lengths: { p55_full: p55.length, p55_after_carried_rune: body.length, p55_distinct_symbols: symbols.length },
  p55_symbols: symbols.map(i => ({ index: i, rune: translit[i] })),
  missing_from_p55_body: missing,
  probability_exactly_25_distinct_under_uniform_gp29: probabilityExactlyKDistinct(29, 75, 25),
  numeric_square: cells.map(x => ({ row: x.row, col: x.col, value: x.value })),
  numeric_square_corners: {
    top_left: values[21 * 8 + 1],
    top_right: values[21 * 8 + 5],
    bottom_left: values[25 * 8 + 1],
    bottom_right: values[25 * 8 + 5]
  },
  keyed_polybius_square: Array.from({ length: 5 }, (_, r) => square.slice(r * 5, r * 5 + 5).map(i => translit[i])),
  candidates
};
console.log(JSON.stringify(report, null, 2));
