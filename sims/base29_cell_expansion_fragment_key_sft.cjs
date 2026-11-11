#!/usr/bin/env node
"use strict";
/*
 * Source-constrained test of applying the signed 2013 BASE29 numeral
 * conversion to each original base-60 cell in the 32x8 LP2 table.
 *
 * Two fixed transports only:
 *   (1) each projectively mapped table row is the repeating key for its
 *       corresponding 13-dot-delimited fragment;
 *   (2) the 490-digit row-major BASE29 expansion is one continuous key.
 *
 * No fitted offsets, alphabet permutations, language-model key fitting,
 * or postselected clocks. Run with Node.js 22 from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const mod = x => (x % 29 + 29) % 29;
const base29Digits = n => {
  assert(Number.isInteger(n) && n >= 0);
  const out = [];
  do { out.unshift(n % 29); n = Math.floor(n / 29); } while (n);
  return out;
};
assert.deepEqual(base29Digits(3301), [3, 26, 24]); // signed 2013 example: 3301 -> 3QO
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const value60 = s => alphabet60.indexOf(s[0]) * 60 + alphabet60.indexOf(s[1]);
assert.equal(alphabet60.length, 60);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(r => r.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(r => r.length === 8));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert(grid.rows.every((r, i) => r.every((v, j) => value60(v) === grid.byte_rows[i][j])));
const gridSha256 = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(gridSha256, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const pages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const pageByNumber = new Map(pages.map(p => [p.page, p]));
const pageStarts = new Map();
let totalRunes = 0;
for (const p of pages) {
  pageStarts.set(p.page, totalRunes);
  totalRunes += p.indices.length;
}
const C = pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
assert.equal(totalRunes, 13136);
const events = [];
for (const p of ink.pages) {
  assert.equal(p.rune_count, pageByNumber.get(p.page).indices.length);
  for (const m of p.large_punctuation || []) {
    if (m[1] === 13) events.push({
      page: p.page, offset: m[0],
      global: pageStarts.get(p.page) + m[0], color: m[2]
    });
  }
}
events.sort((a, b) => a.global - b.global ||
  ((a.color === "black" ? 0 : 1) - (b.color === "black" ? 0 : 1)));
assert.equal(events.length, 31);
assert.equal(events[7].page, 7);
assert.equal(events[7].offset, 194);
assert.equal(events[7].color, "black");
assert.equal(events[8].page, 7);
assert.equal(events[8].offset, 194);
assert.equal(events[8].color, "red");
const bounds = [0, ...events.map(e => e.global), totalRunes];
assert.equal(bounds.length, 33);
assert.equal(bounds[28], C.length);
assert.equal(bounds[1] - bounds[0], 13);
const fragmentLengths = Array.from({ length: 32 }, (_, i) => bounds[i + 1] - bounds[i]);

// p3 red triad gives u^2 = 3u + 8. Multiplication by u on P^1(F_29),
// starting at the p39/p54 source value 24, has the 30-state orbit below.
// The black overprint gets the extra row 30; the trailing fragment gets 31.
function inv29(x) {
  for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i;
  throw new Error("nonunit in F29");
}
function projectiveOrbit(start = 24) {
  const out = [];
  let x = start;
  for (let i = 0; i < 30; i++) {
    out.push(x);
    const num = x === null ? 0 : mod(8 * x);
    const den = x === null ? 1 : mod(x + 3);
    x = den === 0 ? null : mod(num * inv29(den));
  }
  assert.equal(x, start);
  assert.equal(new Set(out.map(v => v === null ? "inf" : String(v))).size, 30);
  return out;
}
const states = projectiveOrbit();
assert.deepEqual(states, [24,25,21,10,14,9,20,18,28,4,26,null,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7]);
const fragmentRows = [];
let stateIndex = 0;
for (let f = 0; f < 32; f++) {
  if (f === 7) fragmentRows.push(30);
  else if (f === 31) fragmentRows.push(31);
  else {
    const state = states[stateIndex++];
    fragmentRows.push(state === null ? 29 : state);
  }
}
assert.equal(stateIndex, 30);
assert.deepEqual(fragmentRows, [24,25,21,10,14,9,20,30,18,28,4,26,29,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7,31]);
assert.deepEqual(fragmentRows.slice().sort((a,b) => a-b), Array.from({length:32}, (_,i) => i));

const rowKeys = grid.byte_rows.map(row => row.flatMap(base29Digits));
const globalKey = grid.byte_rows.flatMap(row => row.flatMap(base29Digits));
assert.equal(globalKey.length, 490);
const applyFragments = (input, sign, encrypt) => {
  const out = new Array(input.length);
  for (let f = 0; f < 28; f++) {
    const start = bounds[f], end = bounds[f + 1];
    const key = rowKeys[fragmentRows[f]];
    assert(key.length > 0);
    for (let i = start; i < end; i++) {
      const k = key[(i - start) % key.length];
      out[i] = mod(input[i] + (encrypt ? sign : -sign) * k);
    }
  }
  return out;
};
const applyGlobal = (input, sign, encrypt) =>
  input.map((v, i) => mod(v + (encrypt ? sign : -sign) * globalKey[i % globalKey.length]));

const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a,b) => b.s.length - a.s.length);
function gpEnglish(text) {
  const norm = text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out = [];
  for (const word of norm.match(/[A-Z]+/g) || []) {
    const buf = [];
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (!token) { buf.length = 0; break; }
      buf.push(token.i); i += token.s.length;
    }
    out.push(...buf);
  }
  return out;
}
const native = gpEnglish(english);
const train = native.slice(0, 100000);
const heldout = native.slice(100000, 112956);
assert.equal(heldout.length, C.length);
const tri = new Uint32Array(29 ** 3);
const ctx = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const k = train[i - 2] * 29 + train[i - 1];
  tri[k * 29 + train[i]]++;
  ctx[k]++;
}
function metrics(a) {
  const freq = Array(29).fill(0);
  for (const v of a) freq[v]++;
  let score = 0;
  for (let i = 2; i < a.length; i++) {
    const k = a[i - 2] * 29 + a[i - 1];
    score += Math.log((tri[k * 29 + a[i]] + 0.1) / (ctx[k] + 2.9));
  }
  return {
    ioc: freq.reduce((s,n) => s + n * (n - 1), 0) / (a.length * (a.length - 1)),
    top12: freq.slice().sort((a,b) => b-a).slice(0,12).reduce((s,n) => s+n,0) / a.length,
    trigramNatsPerRune: score / (a.length - 2)
  };
}
const translit = a => a.map(v => corpus.translit[v]).join("");
const rawMetrics = metrics(C);
const outputs = [];
for (const sign of [-1, 1]) {
  const fragmentPlain = applyFragments(C, sign, false);
  const globalPlain = applyGlobal(C, sign, false);
  const fragmentReplay = applyFragments(fragmentPlain, sign, true);
  const globalReplay = applyGlobal(globalPlain, sign, true);
  assert.deepEqual(fragmentReplay, C);
  assert.deepEqual(globalReplay, C);
  const fragmentPlantCipher = applyFragments(heldout, sign, true);
  const fragmentPlantRecovered = applyFragments(fragmentPlantCipher, sign, false);
  const globalPlantCipher = applyGlobal(heldout, sign, true);
  const globalPlantRecovered = applyGlobal(globalPlantCipher, sign, false);
  assert.deepEqual(fragmentPlantRecovered, heldout);
  assert.deepEqual(globalPlantRecovered, heldout);
  outputs.push({
    sign: sign === 1 ? "C-K" : "C+K",
    fragmentMapped: {
      firstFragmentCipher: translit(C.slice(0, bounds[1])),
      firstFragmentKeyDigits: rowKeys[fragmentRows[0]].join(""),
      firstFragmentPlain: translit(fragmentPlain.slice(0, bounds[1])),
      prefix80: translit(fragmentPlain.slice(0,80)),
      metrics: metrics(fragmentPlain),
      exactReplay: true,
      heldoutPlantRecovered: fragmentPlantRecovered.length
    },
    globalContinuous: {
      keyLength: globalKey.length,
      firstFragmentPlain: translit(globalPlain.slice(0, bounds[1])),
      prefix80: translit(globalPlain.slice(0,80)),
      metrics: metrics(globalPlain),
      exactReplay: true,
      heldoutPlantRecovered: globalPlantRecovered.length
    }
  });
}
const result = {
  classification: "bounded negative for direct BASE29-expanded additive keys; no unknown plaintext or key recovered",
  source: {
    signed2013BASE29Example: "3301 -> 3QO -> [3,26,24]",
    base60GridBytes: 256,
    base60GridSHA256: gridSha256,
    gridShape: [32,8],
    base29ExpandedGlobalKeyLength: globalKey.length,
    markerLayers: events.length,
    fragments: fragmentLengths.length,
    unknownRuneCount: C.length,
    unknownFragmentEnd: bounds[28],
    projectiveGenerator: "u^2 = 3u + 8 over F29, orbit starts at source value 24",
    projectiveStates: states.map(v => v === null ? "infinity" : v),
    fragmentToGridRows: fragmentRows,
    fragmentLengths,
    rowKeyLengths: rowKeys.map(k => k.length)
  },
  baseline: rawMetrics,
  englishHeldoutControl: metrics(heldout),
  results: outputs
};
console.log(JSON.stringify(result, null, 2));
