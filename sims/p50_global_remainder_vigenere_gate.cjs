#!/usr/bin/env node
"use strict";

// Fixed, source-pinned tests of the p49-p51 256-cell table as a GP29 key.
// Two natural clocks are tested: one continuous book-global clock and a
// reset to key[0] at each original rune-bearing page. No phase is fitted.

const fs = require("node:fs");
const crypto = require("node:crypto");
const read = p => fs.readFileSync(p);
const parse = p => JSON.parse(read(p).toString("utf8"));
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const gitBlobSha1 = b => crypto.createHash("sha1")
  .update(Buffer.from(`blob ${b.length}\0`)).update(b).digest("hex");
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

const paths = {
  corpus: "resources/liber-primus/lp2-corpus.json",
  base60: "resources/liber-primus/base60-grid.json",
  grid: "resources/liber-primus/lp2-grid-256.json",
  control: "resources/control/gibran_prophet_58585.txt"
};
const expectedBlob = {
  corpus: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
  base60: "4698c0806e6bab06a39cfbc3c3283b862de58b35",
  grid: "39c4f098566fc5eba9d6738416a2fd193f800701",
  control: "df260a07d56bf5998d40a6360b6132c35c252d10"
};
const raw = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, read(p)]));
for (const k of Object.keys(paths)) {
  assert(gitBlobSha1(raw[k]) === expectedBlob[k], `${k} Git blob mismatch`);
}
const corpus = JSON.parse(raw.corpus.toString("utf8"));
const base60 = JSON.parse(raw.base60.toString("utf8"));
const grid = JSON.parse(raw.grid.toString("utf8"));
const pageSet = corpus.pages.filter(p => p.page <= 55);
const cipher = pageSet.filter(p => p.runic_count > 0).flatMap(p => p.indices);
const bytes = base60.byte_rows.flat();
assert(pageSet.length === 56, "expected p0-p55");
assert(pageSet.filter(p => p.runic_count > 0).length === 55, "expected 55 rune-bearing pages");
assert(cipher.length === 12956, "expected 12,956 unsolved runes");
assert(bytes.length === 256, "expected 256 table bytes");
assert(JSON.stringify(bytes) === JSON.stringify(grid.bytes), "base60-grid and lp2-grid-256 differ");
assert(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255), "invalid table byte");
const key = bytes.map(x => x % 29);
assert(new Set(key).size === 29, "expected all 29 GP residues in key");

const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const native = [];
const controlText = raw.control.toString("utf8");
for (let word of (controlText.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  for (let j = 0; j < word.length;) {
    const token = tokens.find(t => word.startsWith(t.s, j));
    assert(token, `unmapped Gibran control at ${word.slice(j)}`);
    native.push(token.i);
    j += token.s.length;
  }
}
assert(native.length === 62696, "native-GP control transcription changed");

// Train the same native-GP trigram model used by the neighboring p50 tests.
const train = native.slice(0, 40000);
const trigramCounts = new Float64Array(29 ** 3);
for (let i = 2; i < train.length; i++) {
  trigramCounts[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
}
const denominator = train.length - 2 + 0.1 * (29 ** 3);
const trigramScore = seq => {
  let score = 0;
  for (let i = 2; i < seq.length; i++) {
    const k = seq[i - 2] * 841 + seq[i - 1] * 29 + seq[i];
    score += Math.log((trigramCounts[k] + 0.1) / denominator);
  }
  return score / (seq.length - 2);
};
const heldNative = [];
for (let i = 40000; i + 256 <= native.length; i++) {
  heldNative.push(trigramScore(native.slice(i, i + 256)));
}
heldNative.sort((a, b) => a - b);
const worstNativeWindow = heldNative[0];
const medianNativeWindow = heldNative[Math.floor(heldNative.length / 2)];

const mod = x => ((x % 29) + 29) % 29;
const decrypt = (sign, k) => cipher.map((x, i) => mod(x + sign * k[i % 256]));
const ioc = seq => {
  const counts = new Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
};
const candidate = sign => {
  const decoded = decrypt(sign, key);
  const restored = decoded.map((x, i) => mod(x - sign * key[i % 256]));
  assert(restored.every((x, i) => x === cipher[i]), "inverse round-trip failed");
  const windows = [];
  for (let i = 0; i + 256 <= decoded.length; i += 256) {
    windows.push(trigramScore(decoded.slice(i, i + 256)));
  }
  return {
    sign: sign < 0 ? "C-K" : "C+K",
    meanTrigram: trigramScore(decoded),
    ioc: ioc(decoded),
    windows: windows.length,
    windowMin: Math.min(...windows),
    windowMedian: windows.slice().sort((a, b) => a - b)[25],
    windowMax: Math.max(...windows),
    windowsAtOrBelowWorstNative: windows.filter(x => x <= worstNativeWindow).length,
    first120: decoded.slice(0, 120).map(x => corpus.translit[x]).join("")
  };
};

function mulberry32(seed) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(0x20261111);
const nullScores = { minus: [], plus: [] };
for (let n = 0; n < 512; n++) {
  const shuffled = key.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  nullScores.minus.push(trigramScore(decrypt(-1, shuffled)));
  nullScores.plus.push(trigramScore(decrypt(1, shuffled)));
}
const summarize = values => {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(0.95 * (sorted.length - 1))],
    max: sorted[sorted.length - 1]
  };
};
const results = [candidate(-1), candidate(1)];
const nullSummary = {
  minus: summarize(nullScores.minus),
  plus: summarize(nullScores.plus)
};
const nullP = {};
for (const [name, index] of [["minus", 0], ["plus", 1]]) {
  const score = results[index].meanTrigram;
  const atOrAbove = nullScores[name].filter(x => x >= score).length;
  nullP[name] = { nullAtOrAbove: atOrAbove, addOneP: (1 + atOrAbove) / 513 };
}

const output = {
  hypothesis: "B mod 29, row-major, period 256, phase 0, continuous over p0-p55 rune stream; both additive signs",
  sources: Object.fromEntries(Object.keys(paths).map(k => [k, {
    path: paths[k],
    gitBlobSha1: expectedBlob[k],
    sha256: sha256(raw[k]),
    bytes: raw[k].length
  }])),
  dimensions: {
    pages: pageSet.length,
    runeBearingPages: 55,
    runes: cipher.length,
    tableBytes: bytes.length,
    keyUniqueResidues: new Set(key).size,
    nativeGpRunes: native.length,
    heldNativeWindows: heldNative.length,
    worstNativeWindow,
    medianNativeWindow
  },
  raw: { meanTrigram: trigramScore(cipher), ioc: ioc(cipher) },
  candidates: results,
  shuffledKeyNull: nullSummary,
  empiricalUpperTailP: nullP
};
assert(close(results[0].meanTrigram, -12.279453489937294), "C-K score changed");
assert(close(results[1].meanTrigram, -12.280555278323039), "C+K score changed");
assert(results.every(x => x.windows === 50 && x.windowsAtOrBelowWorstNative === 50),
  "candidate windows no longer match the recorded negative");
console.log(JSON.stringify(output, null, 2));
