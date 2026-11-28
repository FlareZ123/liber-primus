#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeId = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const allPages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const unknownPages = allPages.filter((row) => row.page >= 0 && row.page <= 55);
assert.equal(allPages.length, 58);
assert.equal(unknownPages.length, 56);

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRS";
const mod29 = (n) => ((n % 29) + 29) % 29;
const H2 = (x, y) => [mod29(x - y), mod29(x + y)];

function base29(n) {
  assert.ok(Number.isInteger(n) && n >= 0);
  if (n === 0) return "0";
  let x = n;
  let out = "";
  while (x > 0) {
    out = ALPHABET[x % 29] + out;
    x = Math.floor(x / 29);
  }
  return out;
}

function digits2(n) {
  assert.ok(n >= 0 && n < 29 * 29, "two BASE29 digits required");
  return [Math.floor(n / 29), n % 29];
}

function H(values) {
  const m = Math.floor(values.length / 2);
  const out = [];
  for (let i = 0; i < m; i += 1) {
    out.push(mod29(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2) out.push(values[m]);
  for (let i = m - 1; i >= 0; i -= 1) {
    out.push(mod29(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let x = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  while (e > 0n) {
    if (e & 1n) result = (result * x) % m;
    x = (x * x) % m;
    e >>= 1n;
  }
  return Number(result);
}

const page = (n) => {
  const row = allPages.find((x) => x.page === n);
  assert.ok(row, "missing p" + n);
  return row;
};
const count = (n) => page(n).runic_count;

// State independently fixed by the upstream M5N7 -> p57 -> 5N route.
const state = { p: 23, g: 5, a: 6, b: 15, K: 2 };
state.A = modPow(state.g, state.a, state.p);
state.B = modPow(state.g, state.b, state.p);
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, K: 2, A: 8, B: 19 });
assert.equal(modPow(state.A, state.b, state.p), state.K);

// p53 is independently selected upstream; p57 fixes the terminal boundary.
const terminal = [];
for (let p = 49; p <= 57; p += 1) {
  terminal.push({ page: p, count: count(p), base29: base29(count(p)) });
}
assert.deepEqual(
  terminal.map((x) => [x.page, x.count, x.base29]),
  [
    [49, 66, "28"],
    [50, 0, "0"],
    [51, 92, "35"],
    [52, 263, "92"],
    [53, 179, "65"],
    [54, 232, "80"],
    [55, 76, "2I"],
    [56, 85, "2R"],
    [57, 95, "38"],
  ]
);

const shells = [];
for (let depth = 0; depth <= 4; depth += 1) {
  if (depth === 0) {
    shells.push({
      depth,
      pages: [53],
      value: count(53),
      base29: base29(count(53)),
      digits: digits2(count(53)),
    });
  } else {
    const left = 53 - depth;
    const right = 53 + depth;
    const value = count(left) + count(right);
    const [lq, lr] = digits2(count(left));
    const [rq, rr] = digits2(count(right));
    assert.ok(lr + rr < 29, "terminal shell sum must be carry-free");
    assert.equal(value, (lq + rq) * 29 + (lr + rr));
    shells.push({
      depth,
      pages: [left, right],
      value,
      base29: base29(value),
      digits: digits2(value),
    });
  }
}
assert.deepEqual(
  shells.map((x) => [x.depth, x.pages, x.value, x.base29, x.digits]),
  [
    [0, [53], 179, "65", [6, 5]],
    [1, [52, 54], 495, "H2", [17, 2]],
    [2, [51, 55], 168, "5N", [5, 23]],
    [3, [50, 56], 85, "2R", [2, 27]],
    [4, [49, 57], 161, "5G", [5, 16]],
  ]
);
assert.deepEqual(shells[0].digits, [state.a, state.g]);
assert.deepEqual(shells[2].digits, [state.g, state.p]);
assert.deepEqual(shells[3].digits, [state.K, mod29(-state.K)]);
assert.deepEqual(shells[1].digits, [state.b + state.K, state.K]);

// Fixed shell1 transform: [x+y, x-y, y] -> p27 [B,b,K].
const [x, y] = shells[1].digits;
const shellTriple = [mod29(x + y), mod29(x - y), y];
assert.deepEqual(shellTriple, [state.B, state.b, state.K]);
assert.deepEqual(shellTriple, [19, 15, 2]);

// Canonical H9, separately on high and low BASE29 columns.
const digitRows = terminal.map((row) => digits2(row.count));
const hHigh = H(digitRows.map((d) => d[0]));
const hLow = H(digitRows.map((d) => d[1]));
const hPairs = hHigh.map((v, i) => [v, hLow[i]]);
assert.deepEqual(hPairs, [
  [28, 0], [27, 2], [1, 16], [1, 2], [6, 5],
  [17, 2], [5, 23], [2, 27], [5, 16],
]);
assert.deepEqual(hPairs[4], [state.a, state.g]);
assert.deepEqual(hPairs[6], [state.g, state.p]);
assert.deepEqual(hPairs[7], [state.K, mod29(-state.K)]);

// Manuscript-wide centered nine-page charge.
const centered = [];
for (let center = 4; center <= 53; center += 1) {
  const d1 = base29(count(center - 1) + count(center + 1));
  const d2 = base29(count(center - 2) + count(center + 2));
  const centerToken = base29(count(center));
  const ds = Array.from({ length: 9 }, (_, i) => digits2(count(center - 4 + i)));
  const hi = H(ds.map((d) => d[0]));
  const lo = H(ds.map((d) => d[1]));
  const pairs = hi.map((v, i) => [v, lo[i]]);
  centered.push({
    center,
    d1,
    d2,
    centerToken,
    hGp: pairs[6],
    hK: pairs[7],
  });
}
assert.deepEqual(centered.filter((r) => r.d2 === "5N").map((r) => r.center), [53]);
assert.deepEqual(centered.filter((r) => r.d1 === "H2").map((r) => r.center), [53]);
assert.deepEqual(centered.filter((r) => r.centerToken === "65").map((r) => r.center), [53]);
assert.deepEqual(
  centered.filter((r) => r.d1 === "H2" && r.d2 === "5N" && r.centerToken === "65")
    .map((r) => r.center),
  [53]
);
assert.deepEqual(
  centered.filter((r) => r.hGp.join(",") === "5,23").map((r) => r.center),
  [53]
);
assert.deepEqual(
  centered.filter((r) => r.hK.join(",") === "2,27").map((r) => r.center),
  [53]
);

// Charge T(x,y)=[x+y,x-y,y] over every one of 200 symmetric shell sums.
const tripleHits = [];
for (let center = 4; center <= 53; center += 1) {
  for (let depth = 1; depth <= 4; depth += 1) {
    const sum = count(center - depth) + count(center + depth);
    const [sx, sy] = digits2(sum);
    const triple = [mod29(sx + sy), mod29(sx - sy), sy];
    if (triple.join(",") === "19,15,2") {
      tripleHits.push({ center, depth, pages: [center - depth, center + depth], sum });
    }
  }
}
assert.deepEqual(tripleHits, [{ center: 53, depth: 1, pages: [52, 54], sum: 495 }]);

// Reconstruct all source red-span descriptors exactly as the earlier p27 SFT.
const segment = (p) => p === 50 ? "" : transcript[p >= 51 ? p - 1 : p];
function pageWords(p) {
  if (p === 50) return [];
  const pg = page(p);
  const raw = segment(p);
  assert.ok(raw, "missing transcription p" + p);
  const words = [];
  let current = [];
  let runeOffset = 0;
  for (const symbol of raw) {
    if (runeId.has(symbol)) {
      assert.equal(pg.indices[runeOffset], runeId.get(symbol), "transcription mismatch p" + p);
      current.push(runeOffset);
      runeOffset += 1;
    } else if ("-.&$§".includes(symbol) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  assert.equal(runeOffset, pg.indices.length);
  return words;
}
const wordCache = new Map(unknownPages.map((row) => [row.page, pageWords(row.page)]));
const redRows = [];
for (const pg of unknownPages) {
  const ann = ink.pages.find((x) => x.page === pg.page);
  if (!ann || pg.page === 50) continue;
  const isRed = Array(pg.indices.length).fill(false);
  for (const span of ann.red_spans || []) {
    for (let k = span.start; k < span.start + span.length; k += 1) isRed[k] = true;
  }
  for (const span of ann.red_spans || []) {
    const words = wordCache.get(pg.page);
    const following = words.find(
      (w) => w[0] === span.start + span.length && w.every((k) => !isRed[k])
    );
    const redSum = pg.indices.slice(span.start, span.start + span.length)
      .reduce((sum, value) => sum + value, 0);
    const followingSum = following
      ? following.reduce((sum, k) => sum + pg.indices[k], 0)
      : null;
    redRows.push({
      page: pg.page,
      start: span.start,
      triple: [
        span.length,
        mod29(redSum),
        followingSum === null ? null : mod29(followingSum),
      ],
    });
  }
}
assert.equal(redRows.length, 16);
assert.deepEqual(
  redRows.filter((r) => r.triple.join(",") === shellTriple.join(",")),
  [{ page: 27, start: 0, triple: [19, 15, 2] }]
);

// Fixed-marginal diagnostic for the center/d1/d2 identities.
const values = allPages.map((p) => ({ page: p.page, count: p.runic_count }));
function orderedPairs(target, excluded) {
  const out = [];
  for (const a of values) for (const b of values) {
    if (a.page === b.page || excluded.has(a.page) || excluded.has(b.page)) continue;
    if (a.count + b.count === target) out.push([a.page, b.page]);
  }
  return out;
}
const centerCandidates = values.filter((v) => v.count === 179);
assert.deepEqual(centerCandidates.map((v) => v.page), [53]);
const d1Pairs = orderedPairs(495, new Set([53]));
assert.equal(d1Pairs.length, 20);
let compatibleAssignments = 0;
for (const [a, b] of d1Pairs) {
  compatibleAssignments += orderedPairs(168, new Set([53, a, b])).length;
}
assert.equal(compatibleAssignments, 40);
const denominator = 58 * 57 * 56 * 55 * 54;
const fixedWindowProbability = compatibleAssignments / denominator;
const expectedAcross50 = 50 * fixedWindowProbability;

// Existing p27 receiver coordinates: B=19 word, K=2 symmetric shed.
const p27Words = pageWords(27);
const selected = p27Words[state.B];
assert.ok(selected);
assert.equal(selected.length, 12);
const selectedIndices = selected.map((k) => page(27).indices[k]);
const core = selectedIndices.slice(state.K, selectedIndices.length - state.K);
const translit = (v) => v.map((i) => corpus.translit[i]).join("");
assert.equal(translit(selectedIndices), "EORNSOOCAEYEE");
assert.equal(translit(core), "NSOOCAEY");

const output = {
  classification: "source-constrained terminal page-count navigation/state handoff; no unknown plaintext",
  terminal,
  shells,
  shellTriple,
  canonicalH9Pairs: hPairs,
  controls: {
    ninePageCenters: centered.length,
    tripleShellPositions: 200,
    tripleHits,
    p27RedDescriptorHits: redRows.filter((r) => r.triple.join(",") === shellTriple.join(",")),
    fixedMarginal: {
      compatibleAssignments,
      denominator,
      fixedWindowProbability,
      expectedAcross50,
    },
  },
  p27Receiver: {
    page: 27,
    wordIndexZeroBased: state.B,
    shedDepth: state.K,
    selectedWord: translit(selectedIndices),
    core: translit(core),
  },
  decision:
    "Preserve p53-centered terminal shell sums as an independent source-only route to [g,p], [B,b,K], and the frozen p27/B/K receiver. No rune-level inverse or authenticated KDF follows.",
};
const json = JSON.stringify(output, null, 2);
console.log(json);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP || process.cwd(), "source-test-output.json"), json + "\n");
