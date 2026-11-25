#!/usr/bin/env node
"use strict";

// Bounded test: convert the p50 base60 graph's 11-cycle values to a rank
// permutation and apply it to the p32 11x11 rune matrix. No key/offset search.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const quad = fs.readFileSync(path.join(root, "resources/control/dukotah_english_quadgrams.txt"), "utf8").trim();
const counts = new Map(quad.split(/\r?\n/).map(line => {
  const [gram, count] = line.trim().split(/\s+/);
  return [gram, Number(count)];
}));
const total = [...counts.values()].reduce((a, b) => a + b, 0);
const score = text => {
  let sum = 0, n = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    sum += Math.log((counts.get(text.slice(i, i + 4)) || 0.01) / total);
    n++;
  }
  return sum / n;
};
const p32 = corpus.pages["32"].indices;
if (p32.length !== 121 || corpus.pages["32"].runic_count !== 121) throw new Error("p32 is not the expected 121-rune sequence");
const cycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
const sorted = [...cycle].sort((a, b) => a - b);
const permutation = cycle.map(x => sorted.indexOf(x));
const inverse = Array(11);
permutation.forEach((v, i) => { inverse[v] = i; });
const matrix = Array.from({ length: 11 }, (_, r) => p32.slice(r * 11, (r + 1) * 11));
const render = m => m.flat().map(i => corpus.translit[i]).join("");
const original = render(matrix);
const variants = [];
for (const [name, order] of [["cycle-rank", permutation], ["inverse-rank", inverse]]) {
  for (const axis of ["rows", "cols"]) {
    for (const transpose of [false, true]) {
      let m = matrix.map(row => row.slice());
      if (axis === "rows") m = order.map(i => m[i]);
      else m = m.map(row => order.map(i => row[i]));
      if (transpose) m = Array.from({ length: 11 }, (_, c) => m.map(row => row[c]));
      const text = render(m);
      variants.push({ name, axis, transpose, score: score(text), text });
    }
  }
}
variants.sort((a, b) => b.score - a.score);
const p57 = corpus.pages["57"].indices.map(i => corpus.translit[i]).join("").replace("DIUINITY", "DIVINITY");
console.log(JSON.stringify({
  cycle, permutation, inverse, original: { score: score(original), text: original },
  p57_clear_control: { score: score(p57), text: p57 },
  variants
}, null, 2));
