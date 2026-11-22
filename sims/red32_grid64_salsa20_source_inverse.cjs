"use strict";
/**
 * Source-locked Salsa20/256 grid-nonce LP2 inversion.
 *
 * Candidate motivated by 32 red-run lengths (a 256-bit Salsa20 key),
 * 31 original thirteen-dot delimiters (32 fragments), and the printed
 * 32-by-8 byte grid (32 Salsa20 64-bit nonces).
 *
 * Requires @noble/ciphers 2.4.0 and Node 22:
 *   node sims/red32_grid64_salsa20_source_inverse.cjs
 *
 * This is an original-cipher test, not an asserted historical method.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { salsa20 } = require("@noble/ciphers/salsa.js");
const { chacha20orig } = require("@noble/ciphers/chacha.js");
const { events, keyTables } = require("./red_256_event_key_inverse.cjs");

const root = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/base60-grid.json").byte_rows;
const e = events();
const key = Uint8Array.from(keyTables(e).get("redRun32/forward"));
assert.equal(key.length, 32);
assert.equal(grid.length, 32);
for (const row of grid) {
  assert.equal(row.length, 8);
  for (const v of row) assert.ok(Number.isInteger(v) && v >= 0 && v < 256);
}

/**
 * The punctuation at page offset k sits immediately before rune k.
 * Multiple marks at one offset create genuinely empty fragments.
 * @returns {{page:number,offset:number,c:number,fragment:number}[][]}
 */
function makeFragments() {
  const marked = new Map();
  for (const record of ink.pages) for (const glyph of record.large_punctuation || []) {
    if (glyph[1] !== 13) continue;
    const location = record.page + ":" + glyph[0];
    marked.set(location, (marked.get(location) || 0) + 1);
  }
  assert.equal([...marked.values()].reduce((a, b) => a + b, 0), 31);
  const fragments = Array.from({ length: 32 }, () => []);
  let fragment = 0;
  for (const page of corpus.pages) {
    for (let offset = 0; offset <= page.indices.length; offset++) {
      fragment += marked.get(page.page + ":" + offset) || 0;
      assert.ok(fragment < 32);
      if (offset < page.indices.length) fragments[fragment].push({
        page: page.page, offset, c: page.indices[offset], fragment
      });
    }
  }
  assert.equal(fragment, 31);
  assert.equal(fragments.reduce((a, f) => a + f.length, 0), 13136);
  assert.equal(fragments.slice(0, 28).reduce((a, f) => a + f.length, 0), 12956);
  assert.equal(fragments.slice(28).reduce((a, f) => a + f.length, 0), 180);
  return fragments;
}
const fragments = makeFragments();

/** @param {number[]} values */
function stats(values) {
  const counts = Array(29).fill(0);
  for (const v of values) { assert.ok(v >= 0 && v < 29); counts[v]++; }
  const n = values.length;
  const top12 = counts.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((a, b) => a + b, 0);
  const pairs = counts.reduce((a, x) => a + x * (x - 1), 0);
  return {
    symbols: n, top12, top12Rate: +(top12 / n).toFixed(6),
    normalizedIoC: +(29 * pairs / (n * (n - 1))).toFixed(6),
    EA: counts[28], E: counts[18]
  };
}

/**
 * Exact local 300-rune GP index-of-coincidence peak, constrained to original
 * thirteen-dot marker fragments. No window crosses a known source boundary.
 * @param {number[]} symbols
 */
function peak300(symbols) {
  const length = 300, denominator = length * (length - 1);
  let offset = 0, best = { normalizedIoC: 0, fragment: -1, offsetInFragment: -1 };
  for (let g = 0; g < 28; g++) {
    const count = fragments[g].length;
    if (count < length) { offset += count; continue; }
    const histogram = Array(29).fill(0);
    for (let j = 0; j < length; j++) histogram[symbols[offset+j]]++;
    let pairs = histogram.reduce((total, v) => total + v * (v-1), 0);
    for (let j = 0; j <= count-length; j++) {
      const ioc = 29 * pairs / denominator;
      if (ioc > best.normalizedIoC) best = {
        normalizedIoC: +ioc.toFixed(6), fragment: g, offsetInFragment: j
      };
      if (j === count-length) break;
      const oldRune = symbols[offset+j], newRune = symbols[offset+j+length];
      pairs -= 2 * (histogram[oldRune] - 1);
      histogram[oldRune]--;
      pairs += 2 * histogram[newRune];
      histogram[newRune]++;
    }
    offset += count;
  }
  return best;
}

/**
 * @param {Uint8Array} useKey
 * @param {number} nonceShift
 * @returns {Uint8Array[]}
 */
function streams(useKey, nonceShift, colOrder = [0,1,2,3,4,5,6,7], cipher = salsa20) {
  return fragments.slice(0, 28).map((items, g) =>
    cipher(useKey, Uint8Array.from(colOrder.map(c => grid[(g + nonceShift) % 32][c])),
      new Uint8Array(items.length)));
}

/**
 * The native-29 model maps keystream bytes into GP29.
 * The native-28 model interprets a zero ciphertext step as GP-EA;
 * all other output steps decode into a 28-way exclusion rank.
 *
 * @param {Uint8Array[]} stream
 * @param {"gp29"|"rank28"} type
 * @param {1|-1} sign
 * @param {boolean} reset
 * @returns {{values:number[], reciphered:number, markers:number, pageDoublets:number}}
 */
function decode(stream, type, sign, reset) {
  const values = [];
  let previous = 0, priorPage = -1, markers = 0, pageDoublets = 0, reciphered = 0;
  for (let g = 0; g < 28; g++) {
    if (reset) previous = 0;
    for (let j = 0; j < fragments[g].length; j++) {
      const item = fragments[g][j];
      const c = item.c, k = stream[g][j] % (type === "gp29" ? 29 : 28);
      let p, re;
      if (type === "gp29") {
        p = ((c - sign * k) % 29 + 29) % 29;
        re = ((p + sign * k) % 29 + 29) % 29;
      } else {
        const delta = (c - previous + 29) % 29;
        p = delta === 0 ? 28 : ((delta - 1 - sign * k) % 28 + 28) % 28;
        re = p === 28 ? previous :
          (previous + 1 + ((p + sign * k) % 28 + 28) % 28) % 29;
        if (p === 28) markers++;
      }
      assert.equal(re, c, "Inversion/reencryption invariant");
      reciphered++;
      if (item.page === priorPage && c === previous) pageDoublets++;
      values.push(p);
      previous = c;
      priorPage = item.page;
    }
  }
  assert.equal(values.length, 12956);
  return { values, reciphered, markers, pageDoublets };
}

/**
 * Source-native full-length positive controls test the inverse, including
 * all 86 original within-page doublet offsets in the GP28 marker model.
 *
 * @param {Uint8Array[]} stream
 * @param {"gp29"|"rank28"} type
 * @returns {{exact:number, sampleTop12:number, markerOffsets:number}}
 */
function planted(stream, type) {
  const original = fragments.slice(0, 28).flat();
  const sample = corpus.pages[57].indices;
  assert.equal(sample.length, 95);
  const p = original.map((item, i) => sample[i % sample.length]);
  const markerFlags = original.map((item, i) =>
    i > 0 && original[i - 1].page === item.page && original[i - 1].c === item.c);
  const originalMarkers = markerFlags.filter(Boolean).length;
  assert.equal(originalMarkers, 86);
  if (type === "rank28") {
    for (let i = 0; i < p.length; i++) {
      if (markerFlags[i]) p[i] = 28;
      else if (p[i] === 28) p[i] = 24;
    }
  }
  const enc = [];
  let previous = 0;
  for (let g = 0, i = 0; g < 28; g++) {
    previous = 0;
    for (let j = 0; j < fragments[g].length; j++, i++) {
      const k = stream[g][j] % (type === "gp29" ? 29 : 28);
      const q = p[i];
      const c = type === "gp29" ? (q + k) % 29 :
        q === 28 ? previous : (previous + 1 + (q + k) % 28) % 29;
      enc.push(c);
      previous = c;
    }
  }
  assert.equal(enc.length, p.length);
  let i = 0, exact = 0;
  for (let g = 0; g < 28; g++) {
    previous = 0;
    for (let j = 0; j < fragments[g].length; j++, i++) {
      const k = stream[g][j] % (type === "gp29" ? 29 : 28);
      const c = enc[i];
      const delta = (c - previous + 29) % 29;
      const recovered = type === "gp29" ?
        ((c - k) % 29 + 29) % 29 :
        delta === 0 ? 28 : ((delta - 1 - k) % 28 + 28) % 28;
      assert.equal(recovered, p[i]);
      exact++;
      previous = c;
    }
  }
  return {
    exact, sampleTop12: stats(p).top12,
    markerOffsets: type === "rank28" ? p.filter(x => x === 28).length : null,
    originalDoubletOffsets: originalMarkers
  };
}

const sourceStreams = streams(key, 0);
const controls = [
  { name: "literal", stream: sourceStreams },
  { name: "nonceRowShiftPlus1", stream: streams(key, 1) },
  { name: "keyByteReverse", stream: streams(Uint8Array.from(key).reverse(), 0) },
  { name: "PATIENCEcolumns", stream: streams(key, 0, [6,5,3,0,2,4,7,1]) },
  { name: "ChaCha20orig", stream: streams(key, 0, undefined, chacha20orig) },
  { name: "ChaCha20PATIENCE", stream: streams(key, 0, [6,5,3,0,2,4,7,1], chacha20orig) }
];
const results = [];
for (const control of controls) for (const type of ["gp29", "rank28"])
  for (const sign of [1, -1]) for (const reset of [true, false]) {
    const decoded = decode(control.stream, type, sign, reset);
    results.push({
      source: control.name, register: type, sign, reset,
      ...stats(decoded.values), peak300: peak300(decoded.values),
      markers: decoded.markers,
      withinPageSame: decoded.pageDoublets,
      plaintextFirst30: decoded.values.slice(0, 30)
        .map(v => corpus.translit[v]).join(""),
      exactReencryption: decoded.reciphered
    });
  }
const positive = {
  gp29: planted(sourceStreams, "gp29"),
  rank28: planted(sourceStreams, "rank28")
};
const gridCipher = Uint8Array.from(grid.flat());
const gridMessage = salsa20(key, new Uint8Array(8), gridCipher);
const gridTextMetrics = {
  bytes: gridMessage.length,
  asciiPrintable: Array.from(gridMessage).filter(x =>
    (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13).length,
  prefixHex: Buffer.from(gridMessage.slice(0, 32)).toString("hex"),
  prefixLatin1: Buffer.from(gridMessage.slice(0, 32)).toString("latin1")
    .replace(/[^\x20-\x7E]/g, "."),
  interpretation: "Literal grid row-major as Salsa20 ciphertext, zero 64-bit nonce"
};
assert.deepEqual(salsa20(key, new Uint8Array(8), gridMessage), gridCipher);

assert.equal(positive.gp29.exact, 12956);
assert.equal(positive.rank28.exact, 12956);
results.sort((a, b) => b.top12 - a.top12);
console.log(JSON.stringify({
  title: "Original LP2 32 red-run byte key and 32 grid 64-bit nonce Salsa20/ChaCha20 original inverses",
  classification: "source-motivated conditional test, not authentic key recovery",
  keyHex: Buffer.from(key).toString("hex"),
  fragmentLengths: fragments.map(f => f.length),
  registerHandling: "gp29 additive or rank28 with transparent EA repeat",
  originalBaseline: stats(fragments.slice(0,28).flat().map(item => item.c)),
  originalPeak300: peak300(fragments.slice(0,28).flat().map(item => item.c)),
  chachaGridMessage: (() => {
    const bytes = chacha20orig(key, new Uint8Array(8), gridCipher);
    assert.deepEqual(chacha20orig(key, new Uint8Array(8), bytes), gridCipher);
    return {asciiPrintable: Array.from(bytes).filter(x =>
      (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13).length,
      bytes: bytes.length, prefixHex: Buffer.from(bytes.slice(0, 32)).toString("hex")};
  })(),
  gridMessage: gridTextMetrics,
  positive, resultCount: results.length,
  results,
  decision: "A genuine direct-GP solution would yield original plaintext with strong GP-language mass and independent coherent text. Exact reencryption alone holds for every wrong key."
}, null, 2));
