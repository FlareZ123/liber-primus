#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const grid = read("resources/liber-primus/lp2-grid-256.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const control = fs.readFileSync("resources/control/gibran_prophet_58585.txt", "utf8");

const pages = [];
let offset = 0;
const all = [];
for (const p of corpus.pages) {
  pages.push({ page: p.page, start: offset, end: offset + p.indices.length, indices: p.indices });
  all.push(...p.indices);
  offset += p.indices.length;
}

const marks = [];
for (const p of ink.pages) {
  const page = pages.find(x => x.page === p.page);
  for (const e of (p.large_punctuation || [])) {
    if (e[1] === 13) marks.push(page.start + e[0]);
  }
}
marks.sort((a, b) => a - b);

const bounds = [0, ...marks, all.length];
const fragments = bounds.slice(0, -1).map((start, i) => ({
  id: i + 1,
  start,
  end: bounds[i + 1],
  length: bounds[i + 1] - start,
  seq: all.slice(start, bounds[i + 1])
}));
const empty = fragments.filter(f => f.length === 0).map(f => f.id);
const ranked = fragments.filter(f => f.length > 0).map(f => ({
  ...f,
  byte: grid.bytes[(f.id - 1) * 8 + 1]
})).sort((a, b) => a.byte - b.byte);

const mod = n => ((n % 29) + 29) % 29;
const inv = n => {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("no inverse");
};
const m7 = x => {
  if (x === 29) return mod(14 * inv(25));
  const d = mod(25 * x + 28);
  return d === 0 ? 29 : mod((14 * x + 25) * inv(d));
};

const seen = new Set();
const orbits = [];
for (let x = 0; x < 30; x++) {
  if (seen.has(x)) continue;
  let y = x;
  const cycle = [];
  while (!seen.has(y)) {
    seen.add(y);
    cycle.push(y);
    y = m7(y);
  }
  orbits.push(cycle);
}
const fixed = Array.from({ length: 30 }, (_, x) => x).filter(x => m7(x) === x);
const orbitSummary = orbits.map((cycle, i) => {
  const fs = cycle.map(rank => ranked[rank]);
  return {
    orbit: i + 1,
    ranks: cycle,
    fragments: fs.map(f => f.id),
    lengths: fs.map(f => f.length),
    sum: fs.reduce((n, f) => n + f.length, 0)
  };
});

const poleCycle = orbits.find(cycle => cycle.includes(7));
const poleIds = new Set(poleCycle.map(rank => ranked[rank].id));
const rankRest = ranked.filter(f => !poleIds.has(f.id));
const orbitRest = orbits.filter(cycle => cycle !== poleCycle)
  .flatMap(cycle => cycle.map(rank => ranked[rank]));
const flatten = fs => fs.flatMap(f => f.seq);
const targets = [
  ["rank-order", flatten(rankRest)],
  ["orbit-order", flatten(orbitRest)]
];

const keyOrders = [
  ["table-order", grid.bytes.slice()],
  ["ranked-row-order",
    Array.from({ length: 32 }, (_, r) => r)
      .sort((a, b) => grid.bytes[a * 8 + 1] - grid.bytes[b * 8 + 1])
      .flatMap(r => grid.bytes.slice(r * 8, r * 8 + 8))]
];

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const native = [];
for (let word of (control.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  for (let j = 0; j < word.length;) {
    const token = tokens.find(t => word.startsWith(t.s, j));
    if (!token) throw new Error("unmapped Gibran control text");
    native.push(token.i);
    j += token.s.length;
  }
}
const train = native.slice(0, 40000);
const trigramCounts = new Map();
for (let i = 2; i < train.length; i++) {
  const k = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
}
const denominator = train.length - 2 + 0.1 * 29 ** 3;
const trigramScore = seq => {
  let score = 0;
  for (let i = 2; i < seq.length; i++) {
    const k = seq[i - 2] * 841 + seq[i - 1] * 29 + seq[i];
    score += Math.log(((trigramCounts.get(k) || 0) + 0.1) / denominator);
  }
  return score / (seq.length - 2);
};
const ioc = seq => {
  const freq = Array(29).fill(0);
  for (const x of seq) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
};

const results = [];
for (const [targetOrder, target] of targets) {
  for (const [keyOrder, keyBytes] of keyOrders) {
    if (target.length !== 10240 || keyBytes.length !== 256) {
      throw new Error("expected 10,240-rune remainder and 256-byte key");
    }
    const key = keyBytes.map(b => mod(b));
    for (const sign of [-1, 1]) {
      const decoded = target.map((c, i) => mod(c + sign * key[i % 256]));
      results.push({
        targetOrder, keyOrder, sign,
        length: decoded.length, keyPeriod: 256, repeats: 40,
        ioc: ioc(decoded), trigram: trigramScore(decoded),
        prefix: decoded.slice(0, 120).map(x => corpus.translit[x]).join("")
      });
    }
  }
}

const columnDistinct = Array.from({ length: 8 }, (_, c) =>
  new Set(Array.from({ length: 32 }, (_, r) => grid.bytes[r * 8 + c])).size);
const poleLength = poleCycle.reduce((n, rank) => n + ranked[rank].length, 0);
const remainderLength = rankRest.reduce((n, f) => n + f.length, 0);
const raw = targets[0][1];

if (marks.length !== 31 || fragments.length !== 32 ||
    JSON.stringify(empty) !== JSON.stringify([9, 12]) ||
    ranked.length !== 30 ||
    JSON.stringify(columnDistinct) !== JSON.stringify([30, 32, 30, 30, 30, 31, 31, 30]) ||
    JSON.stringify(fixed) !== JSON.stringify([22, 25]) ||
    poleCycle.length !== 7 || poleLength !== 2896 ||
    remainderLength !== 10240 || grid.bytes.length !== 256 ||
    results.length !== 8) {
  throw new Error("source structure changed; inspect inputs");
}

console.log(JSON.stringify({
  marks: marks.length,
  fragments: fragments.length,
  empty,
  columnDistinct,
  fixed,
  orbits: orbitSummary,
  poleTraversalFromRank7: (() => {
    const out = [];
    let x = 7;
    for (let i = 0; i < 7; i++) {
      out.push({ rank: x, fragment: ranked[x].id, length: ranked[x].length });
      x = m7(x);
    }
    return out;
  })(),
  poleLength,
  remainderLength,
  remainderRepeats: remainderLength / grid.bytes.length,
  raw: { ioc: ioc(raw), trigram: trigramScore(raw) },
  results
}, null, 2));
