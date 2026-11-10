"use strict";

// Reproduce the PARABLE prime-ordinal / 8x7 page-map hypothesis and its
// small, source-constrained decryption probes. Run from repository root:
//   node sims/parable_prime_8x7_page_map_probe.cjs
//
// This is an exploratory probe, not an established decryption. It deliberately
// avoids free key searches and reports negative tests as well as the map.

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");

const { ciphertextWords, plaintextWords } =
  require("./authentic_decryption_regression.cjs");
const { trainNativeGP, languageScore, primeTotients } =
  require("./historical_solve_path_transfer.cjs");

const lp2Marker = "ᛋᚻᛖᚩᚷᛗᛡᚠ";
const lp2Start = master.indexOf(lp2Marker);
assert(lp2Start >= 0, "LP2 start marker not found");
const pageText = master.slice(lp2Start).split("%");
assert(pageText.length >= 58, "Expected LP2 pages 0..57");

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function primeOrdinal(n) {
  assert(isPrime(n), String(n) + " is not prime");
  let count = 0;
  for (let x = 2; x <= n; x++) if (isPrime(x)) count++;
  return count;
}
function pageFromOrdinal(n) {
  const r = n % 32;
  const c = n % 28;
  assert.equal(n % 4, 1, "ordinal outside shared residue class");
  assert.equal(r % 4, 1);
  assert.equal(c % 4, 1);
  const row = (r - 1) / 4;
  const col = (c - 1) / 4;
  return { row, col, page: row * 7 + col };
}

// The solved p57 PARABLE has a Latin header followed by three clauses.
const clauses = pageText[57].split(".").slice(1, 4);
assert.equal(clauses.length, 3);
const clauseIndices = clauses.map((s) => ciphertextWords(s).flat());
const clausePrimeSums = clauseIndices.map((xs) =>
  xs.reduce((sum, i) => sum + corpus.prime[i], 0)
);
assert.deepEqual(clausePrimeSums, [1259, 1031, 1229]);
const parableAudioNumber = 1595277641;
assert.equal(clausePrimeSums.reduce((p, x) => p * x, 1), parableAudioNumber);

const ordinals = clausePrimeSums.map(primeOrdinal);
assert.deepEqual(ordinals, [205, 173, 201]);
const ordinalCoordinates = ordinals.map(pageFromOrdinal);
const ordinalPages = ordinalCoordinates.map((x) => x.page);
assert.deepEqual(ordinalPages, [23, 22, 15]);

// Direct page residues of the three clause sums, paired with their
// ordinal-derived destinations, produce the five-page anchor set.
const factorPages = clausePrimeSums.map((x) => x % 56);
assert.deepEqual(factorPages, [27, 23, 5]);
const fivePages = [...new Set([...factorPages, ...ordinalPages])].sort((a, b) => a - b);
assert.deepEqual(fivePages, [5, 15, 22, 23, 27]);

const pageByNumber = new Map(corpus.pages.map((p) => [p.page, p]));
const inkByPage = new Map(ink.pages.map((p) => [p.page, p]));
const markerCount13 = (p) =>
  (inkByPage.get(p)?.large_punctuation || []).filter((x) => x[1] === 13).length;
const anchor13Counts = Object.fromEntries([15, 22, 23].map((p) => [p, markerCount13(p)]));
assert.deepEqual(anchor13Counts, { 15: 3, 22: 1, 23: 1 });

const p57_23Dots = (inkByPage.get(57)?.large_punctuation || [])
  .filter((x) => x[1] === 23);
assert.equal(p57_23Dots.length, 1);

const globalPageStart = new Map();
let cumulativeRunes = 0;
for (let p = 0; p <= 57; p++) {
  globalPageStart.set(p, cumulativeRunes);
  cumulativeRunes += pageByNumber.get(p)?.indices.length || 0;
}
const red10Marks = ink.pages.flatMap((p) =>
  (p.large_punctuation || [])
    .filter((x) => x[1] === 10 && x[2] === "red")
    .map((x) => ({
      page: p.page,
      local: x[0],
      global: globalPageStart.get(p.page) + x[0],
      mod4: (globalPageStart.get(p.page) + x[0]) % 4
    }))
);

// The candidate 55-symbol key is the red rune material on the three
// factor/ordinal-selected pages that actually have red spans, in clause order.
const redKeyPages = [27, 23, 15];
const redKey = [];
const redKeyLengths = {};
for (const p of redKeyPages) {
  const spans = [...(inkByPage.get(p)?.red_spans || [])]
    .sort((a, b) => a.start - b.start);
  const vals = spans.flatMap((s) =>
    pageByNumber.get(p).indices.slice(s.start, s.start + s.length)
  );
  redKeyLengths[p] = vals.length;
  redKey.push(...vals);
}
const nonemptyPageCount = corpus.pages.filter(
  (p) => p.page >= 0 && p.page < 56 && p.indices.length > 0
).length;
assert.deepEqual(redKeyLengths, { 27: 19, 23: 16, 15: 20 });
assert.equal(redKey.length, 55);
assert.equal(nonemptyPageCount, 55);

// Existing p27/p55 repeated-word-pair result, independently recoverable
// from the canonical master transcription.
function wordTokens(p) {
  return ciphertextWords(pageText[p]).map((w) => w.join(","));
}
function adjacentWordPairs(ws) {
  return new Set(ws.slice(0, -1).map((w, i) => w + "|" + ws[i + 1]));
}
const p27Pairs = adjacentWordPairs(wordTokens(27));
const p55Pairs = adjacentWordPairs(wordTokens(55));
const sharedWordPairs = [...p27Pairs].filter((x) => p55Pairs.has(x));

// Page orders on the 8x7 torus, row-major page numbering.
function diagonalOrder() {
  let r = 3, c = 2;
  const out = [];
  for (let i = 0; i < 56; i++) {
    out.push(r * 7 + c);
    r = (r + 7) % 8;
    c = (c + 6) % 7;
  }
  assert.equal(new Set(out).size, 56);
  return out;
}
function squareSpiralOrder() {
  let r = 3, c = 2, d = 0;
  const dirs = [[0, -1], [-1, 0], [0, 1], [1, 0]];
  const seen = new Set([23]);
  const out = [23];
  let visits = 0;
  for (let length = 1; out.length < 56 && length < 100; length++) {
    for (let turn = 0; turn < 2 && out.length < 56; turn++) {
      const [dr, dc] = dirs[d];
      for (let k = 0; k < length; k++) {
        r = (r + dr + 8) % 8;
        c = (c + dc + 7) % 7;
        visits++;
        const p = r * 7 + c;
        if (!seen.has(p)) {
          seen.add(p);
          out.push(p);
        }
        if (out.length === 56) break;
      }
      d = (d + 1) % 4;
    }
  }
  assert.equal(out.length, 56);
  assert.equal(new Set(out).size, 56);
  assert.deepEqual(out.slice(0, 3), [23, 22, 15]);
  return { order: out, visits: visits + 1 };
}

const physical = Array.from({ length: 56 }, (_, i) => i);
const diagonal = diagonalOrder();
const squareSpiral = squareSpiralOrder();
const orders = [
  ["physical", physical],
  ["diagonal", diagonal],
  ["square-spiral", squareSpiral.order],
];

const allPages = corpus.pages
  .filter((p) => p.page >= 0 && p.page < 56)
  .sort((a, b) => a.page - b.page);
const totalRunes = allPages.reduce((s, p) => s + p.indices.length, 0);
const maxPageLength = Math.max(...allPages.map((p) => p.indices.length));
const nonemptyPhysical = allPages.filter((p) => p.indices.length > 0).map((p) => p.page);
function keySortedPageOrder(direction) {
  return nonemptyPhysical
    .map((page, i) => ({ page, key: redKey[i], i }))
    .sort((a, b) => direction * (a.key - b.key) || a.i - b.i)
    .map((x) => x.page);
}
const keySortedOrders = [
  ["red55-key-sort-ascending", keySortedPageOrder(1)],
  ["red55-key-sort-descending", keySortedPageOrder(-1)]
];
const control = read("resources/control/emerson_essays_2944.txt");
const model = trainNativeGP(control);
const knownP56Plain = plaintextWords(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT " +
  "IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE"
).flat();
const score = (xs) => languageScore(xs, model);
const preview = (xs) => xs.slice(0, 100).map((i) => corpus.translit[i]).join("");
const rawPhysical = allPages.flatMap((p) => p.indices);

function decodeTotient(order, resetPage, skipOwnPageF) {
  const globalKeys = primeTotients(totalRunes);
  const pageKeys = primeTotients(maxPageLength);
  const out = [];
  let globalIndex = 0;
  for (const pageNo of order) {
    const input = pageByNumber.get(pageNo).indices;
    let localIndex = 0;
    for (let j = 0; j < input.length; j++) {
      const c = input[j];
      if (skipOwnPageF && j === pageNo && c === 0) {
        out.push(c);
        continue;
      }
      const k = resetPage ? pageKeys[localIndex] : globalKeys[globalIndex];
      out.push((c - (k % 29) + 29) % 29);
      localIndex++;
      globalIndex++;
    }
  }
  return out;
}
function decodeVigenere(order, key, resetPage, sign) {
  const out = [];
  let globalIndex = 0;
  for (const pageNo of order) {
    const input = pageByNumber.get(pageNo).indices;
    let localIndex = 0;
    for (const c of input) {
      const ki = resetPage ? localIndex % key.length : globalIndex % key.length;
      out.push((c + sign * key[ki] + 29) % 29);
      localIndex++;
      globalIndex++;
    }
  }
  return out;
}
function decodePageShift(order, key, sign) {
  const out = [];
  let pageIndex = 0;
  for (const pageNo of order) {
    const input = pageByNumber.get(pageNo).indices;
    if (!input.length) continue;
    const shift = key[pageIndex++];
    for (const c of input) out.push((c + sign * shift + 29) % 29);
  }
  assert.equal(pageIndex, 55);
  return out;
}

const primeSumKey = clausePrimeSums.map((x) => x % 29);
assert.deepEqual(primeSumKey, [12, 16, 11]);
const tests = [];
for (const [orderName, order] of orders) {
  for (const resetPage of [false, true]) {
    for (const skipOwnPageF of [false, true]) {
      const out = decodeTotient(order, resetPage, skipOwnPageF);
      tests.push({
        family: "p56-prime-totient",
        order: orderName,
        clock: resetPage ? "page-reset" : "continuous",
        FRule: skipOwnPageF ? "skip F at local offset = physical page number" : "no inferred skips",
        score: score(out),
        preview: preview(out)
      });
    }
  }
  for (const resetPage of [false, true]) {
    for (const sign of [-1, 1]) {
      const out = decodeVigenere(order, primeSumKey, resetPage, sign);
      tests.push({
        family: "three-clause-prime-sum-Vigenere",
        order: orderName,
        clock: resetPage ? "page-reset" : "continuous",
        operation: sign < 0 ? "subtract" : "add",
        score: score(out),
        preview: preview(out)
      });
    }
  }
}
for (const [orderName, order] of [["physical", physical], ["square-spiral", squareSpiral.order]]) {
  for (const resetPage of [false, true]) {
    for (const sign of [-1, 1]) {
      const out = decodeVigenere(order, redKey, resetPage, sign);
      tests.push({
        family: "55-red-rune-key-Vigenere",
        order: orderName,
        clock: resetPage ? "page-reset" : "continuous",
        operation: sign < 0 ? "subtract" : "add",
        score: score(out),
        preview: preview(out)
      });
    }
  }
  for (const sign of [-1, 1]) {
    const out = decodePageShift(order, redKey, sign);
    tests.push({
      family: "one-red-rune-shift-per-nonempty-page",
      order: orderName,
      operation: sign < 0 ? "subtract" : "add",
      score: score(out),
      preview: preview(out)
    });
  }
}

for (const [orderName, order] of keySortedOrders) {
  const raw = order.flatMap((p) => pageByNumber.get(p).indices);
  tests.push({
    family: "red55-stable-page-sort",
    order: orderName,
    operation: "raw page permutation",
    score: score(raw),
    preview: preview(raw)
  });
  for (const resetPage of [false, true]) {
    const out = decodeTotient(order, resetPage, false);
    tests.push({
      family: "red55-stable-page-sort-plus-p56-totient",
      order: orderName,
      clock: resetPage ? "page-reset" : "continuous",
      score: score(out),
      preview: preview(out)
    });
  }
}

const summary = {
  source: {
    parableAudioNumber,
    clausePrimeSums,
    primeOrdinals: ordinals,
    factorPagesModulo56: factorPages,
    ordinalCoordinates,
    ordinalPages,
    fivePageSet: fivePages,
    pageGrid: "8x7 row-major, page = 7*row + col",
    fragmentMarkers13: {
      p0_55: ink.pages.filter((p) => p.page >= 0 && p.page < 56)
        .reduce((s, p) => s + (p.large_punctuation || []).filter((x) => x[1] === 13).length, 0),
      p56: (inkByPage.get(56)?.large_punctuation || []).filter((x) => x[1] === 13).length,
      p57: (inkByPage.get(57)?.large_punctuation || []).filter((x) => x[1] === 13).length,
      total: ink.pages.filter((p) => p.page >= 0 && p.page <= 57)
        .reduce((s, p) => s + (p.large_punctuation || []).filter((x) => x[1] === 13).length, 0)
    },
    anchor13Counts,
    p57_23DotCount: p57_23Dots.length,
    red10Marks,
    redKeyPages,
    redKeyLengths,
    redKeyLength: redKey.length,
    redKeyTransliteration: redKey.map((i) => corpus.translit[i]).join(""),
    nonemptyPageCount,
    emptyPages: allPages.filter((p) => !p.indices.length).map((p) => p.page),
    sharedP27P55WordPairs: sharedWordPairs
  },
  pageOrders: {
    diagonal: { length: diagonal.length, first: diagonal.slice(0, 12), order: diagonal },
    squareSpiral: {
      length: squareSpiral.order.length,
      visitsUntilAllUnique: squareSpiral.visits,
      first: squareSpiral.order.slice(0, 12),
      order: squareSpiral.order
    },
    red55KeySort: keySortedOrders.map(([name, order]) => ({
      name,
      length: order.length,
      first: order.slice(0, 15),
      last: order.slice(-10)
    }))
  },
  scoreReference: {
    rawPhysical: score(rawPhysical),
    knownSolvedP56Plaintext: score(knownP56Plain),
    totalRunes
  },
  tests: tests.sort((a, b) => b.score - a.score)
};

console.log(JSON.stringify(summary, null, 2));
