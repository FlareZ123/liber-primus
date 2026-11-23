#!/usr/bin/env node
"use strict";

// Bounded test: use the 121-rune p32 page as an 11x11 Hill key for the
// 308-rune p54-p55 chapter (28 consecutive 11-symbol blocks) over GF(29).
// Prime weights are the primary key encoding because p32's first row/column
// prime-weight sums are 563/569, matching the authenticated 2016 carrier size.
// Raw GP indices are included only as a control. No permutations, padding,
// offsets, or fitted parameters are searched.

const fs = require("node:fs");
const crypto = require("node:crypto");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const p32 = pages.get(32).indices;
const target = pages.get(54).indices.concat(pages.get(55).indices);
const p57 = pages.get(57).indices;
const N = 29;
const mod = x => ((x % N) + N) % N;

if (p32.length !== 121 || pages.get(54).indices.length !== 232 ||
    pages.get(55).indices.length !== 76 || target.length !== 308 || target.length % 11 !== 0) {
  throw new Error("Canonical page lengths changed; refusing to silently alter the experiment.");
}

function invMod(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}

function inverseMatrix(A) {
  const n = A.length;
  const M = A.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  let det = 1;
  let rank = 0;
  for (let c = 0; c < n; c++) {
    let pivot = c;
    while (pivot < n && M[pivot][c] === 0) pivot++;
    if (pivot === n) return { inverse: null, det: 0, rank };
    if (pivot !== c) {
      [M[pivot], M[c]] = [M[c], M[pivot]];
      det = mod(-det);
    }
    const v = M[c][c];
    det = mod(det * v);
    const iv = invMod(v, N);
    if (iv === null) throw new Error("Nonzero pivot unexpectedly lacks an inverse in GF(29).");
    for (let j = 0; j < 2 * n; j++) M[c][j] = mod(M[c][j] * iv);
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const f = M[i][c];
      if (f === 0) continue;
      for (let j = 0; j < 2 * n; j++) M[i][j] = mod(M[i][j] - f * M[c][j]);
    }
    rank++;
  }
  return { inverse: M.map(row => row.slice(n)), det, rank };
}

function applyBlocks(input, M, convention) {
  const out = [];
  for (let offset = 0; offset < input.length; offset += 11) {
    const v = input.slice(offset, offset + 11);
    if (convention === "column") {
      for (let i = 0; i < 11; i++) {
        out.push(mod(M[i].reduce((sum, x, j) => sum + x * v[j], 0)));
      }
    } else {
      for (let j = 0; j < 11; j++) {
        let sum = 0;
        for (let i = 0; i < 11; i++) sum += v[i] * M[i][j];
        out.push(mod(sum));
      }
    }
  }
  return out;
}

function ioc(a) {
  let numerator = 0;
  for (let x = 0; x < N; x++) {
    let count = 0;
    for (const v of a) if (v === x) count++;
    numerator += count * (count - 1);
  }
  return numerator / (a.length * (a.length - 1));
}

const quadText = fs.readFileSync("resources/control/dukotah_english_quadgrams.txt", "utf8");
const quadgrams = new Map();
let quadTotal = 0;
for (const line of quadText.split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (!m) continue;
  const count = Number(m[2]);
  quadgrams.set(m[1], count);
  quadTotal += count;
}
const quadFloor = Math.log10(0.01 / Math.max(1, quadTotal));
function latin(a) {
  return a.map(i => corpus.translit[i]).join("").replace(/[^A-Z]/g, "");
}
function quadScore(a) {
  const s = latin(a);
  if (s.length < 4) return null;
  let total = 0;
  for (let i = 0; i <= s.length - 4; i++) {
    total += Math.log10((quadgrams.get(s.slice(i, i + 4)) || 0.01) / quadTotal);
  }
  return total / (s.length - 3);
}
function sha256(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

const Kprime = Array.from({ length: 11 }, (_, r) =>
  Array.from({ length: 11 }, (_, c) => corpus.prime[p32[r * 11 + c]] % N));
const Kraw = Array.from({ length: 11 }, (_, r) => p32.slice(r * 11, (r + 1) * 11));
const primeWeights = p32.map(i => corpus.prime[i]);
const row0 = primeWeights.slice(0, 11).reduce((a, b) => a + b, 0);
const col0 = Array.from({ length: 11 }, (_, r) => primeWeights[r * 11]).reduce((a, b) => a + b, 0);

const outputs = [];
for (const [keyName, K] of [["prime-weight-mod29", Kprime], ["raw-GP-index", Kraw]]) {
  const inv = inverseMatrix(K);
  if (!inv.inverse) {
    outputs.push({ key: keyName, determinant: inv.det, rank: inv.rank, status: "singular" });
    continue;
  }
  const cases = [
    ["column-vector / inverse key", inv.inverse, "column"],
    ["column-vector / forward key", K, "column"],
    ["row-vector / inverse key", inv.inverse, "row"],
    ["row-vector / forward key", K, "row"]
  ];
  for (const [name, matrix, convention] of cases) {
    const decoded = applyBlocks(target, matrix, convention);
    const rendered = latin(decoded);
    outputs.push({
      key: keyName,
      determinant: inv.det,
      rank: inv.rank,
      convention: name,
      ioc: Number(ioc(decoded).toFixed(8)),
      quadgram_log10_per_gram: Number(quadScore(decoded).toFixed(5)),
      sha256: sha256(rendered),
      preview: rendered.slice(0, 180)
    });
  }
}

console.log(JSON.stringify({
  experiment: "p32 11x11 Hill key -> p54-p55 28 blocks of 11 over GF(29)",
  source_alignment: {
    p32_runes: p32.length,
    p54_runes: pages.get(54).indices.length,
    p55_runes: pages.get(55).indices.length,
    p54_p55_total: target.length,
    blocks_of_11: target.length / 11,
    p32_prime_weight_first_row_sum: row0,
    p32_prime_weight_first_column_sum: col0,
    authenticated_2016_image_dimensions: [563, 569]
  },
  controls: {
    rawBaseline: { ioc: Number(ioc(target).toFixed(8)), quadgram_log10_per_gram: Number(quadScore(target).toFixed(5)) },
    p57: { length: p57.length, ioc: Number(ioc(p57).toFixed(8)), quadgram_log10_per_gram: Number(quadScore(p57).toFixed(5)) }
  },
  outputs
}, null, 2));
