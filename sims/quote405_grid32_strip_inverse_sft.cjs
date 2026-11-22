"use strict";

/**
 * Historical LP2 32x405 four-gap challenge. Seven quote spans give 405 GP
 * runes and 32 table rows give 32 keyed strips. Four derived offsets are
 * inserted only as legacy synthetic gaps; the correct original images do
 * not contain separators at those cuts.
 *
 * Tests historical GP29 modular-addition and invertible predecessor-exclusion
 * as two candidate plaintext registers, with either quote+row8 key or RC4
 * initialized from exactly one original grid row. No fitted key or phase.
 *
 * SFT: node sims/quote405_grid32_strip_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ann = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows.flat();
const cipher = corpus.pages.filter((p) => p.status === "unsolved")
  .flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);
assert.equal(grid.length, 256);
assert.deepEqual(ann.source_visible_internal_separators_before_rune, []);
assert.equal(ann.legacy_apostrophe_hypothesis.before_rune.length, 4);
assert.equal(ann.quotes.length, 7);
const quoted = ann.quotes.flatMap((q) => cipher.slice(q.start, q.end));
assert.equal(quoted.length, 405);
assert.deepEqual(ann.quotes.map((q) => q.end - q.start),
  [18, 19, 12, 58, 68, 160, 70]);
const gapSet = new Set(ann.legacy_apostrophe_hypothesis.before_rune);
const expanded = [];
for (let at = 0; at < cipher.length; at++) {
  if (gapSet.has(at)) expanded.push(null);
  expanded.push(cipher[at]);
}
assert.equal(expanded.length, 32 * 405);
assert.deepEqual(
  [1110, 5139, 8517, 10092].map((i) => [Math.floor(i / 405), i % 405]),
  [[2, 300], [12, 279], [21, 12], [24, 372]]
);
for (const i of [1110, 5139, 8517, 10092]) assert.equal(expanded[i], null);

const mod = (x, base) => ((x % base) + base) % base;
const pow15 = Array(28);
const dlog = Array(29).fill(-1);
let x = 1;
for (let i = 0; i < 28; i++) {
  pow15[i] = x;
  dlog[x] = i;
  x = (x * 15) % 29;
}
assert.equal(x, 1);
assert.ok(dlog.slice(1).every((i) => i >= 0));

/** Original eight source bytes as one 64-bit-row RC4 KSA key. */
function rc4(key, total) {
  const S = Array.from({length: 256}, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  let a = 0, b = 0;
  const bytes = [];
  for (let i = 0; i < total; i++) {
    a = (a + 1) & 255;
    b = (b + S[a]) & 255;
    [S[a], S[b]] = [S[b], S[a]];
    bytes.push(S[(S[a] + S[b]) & 255]);
  }
  return bytes;
}
const streamRows = Array.from({length: 32}, (_, row) =>
  rc4(grid.slice(row * 8, row * 8 + 8), 256 + 405));
const directKeys = [];
for (const quoteSign of [-1, 1]) for (const rowSign of [-1, 1]) {
  const keys = Array.from({length: 32 * 405}, (_, t) => {
    const row = Math.floor(t / 405), col = t % 405;
    return quoteSign * quoted[col] + rowSign * grid[8 * row + (col % 8)];
  });
  directKeys.push({id: "quoted=" + quoteSign + "/grid=" + rowSign, keys});
}
const streamKeys = [];
for (const drop of [0, 256]) for (const map of ["mod", "scale"])
  for (const sign of [-1, 1]) {
    const keys = Array.from({length: 32 * 405}, (_, t) => {
      const row = Math.floor(t / 405), col = t % 405;
      const byte = streamRows[row][drop + col];
      return sign * (map === "mod" ? byte % 29 : Math.floor(byte * 29 / 256));
    });
    streamKeys.push({id: "rc4drop=" + drop + "/byte=" + map + "/sign=" + sign,
      keys});
  }
assert.equal(directKeys.length + streamKeys.length, 12);

/**
 * Exact inverse for the historical synthetic model. Four legacy gap
 * positions consume clock slots and emit no GP symbol.
 */
function inverse(printed, keys, register) {
  let previous = 0;
  const plaintext = [];
  for (let t = 0; t < printed.length; t++) {
    const curr = printed[t];
    if (curr === null) continue;
    if (register === "direct") plaintext.push(mod(curr - keys[t], 29));
    else {
      const step = mod(curr - previous, 29);
      plaintext.push(step === 0 ? 28 : mod(dlog[step] - keys[t], 28));
    }
    previous = curr;
  }
  return plaintext;
}

/** Exact source-native forward inverse with separate synthetic source. */
function forward(plaintext, keys, register) {
  let pos = 0, previous = 0;
  const printed = [];
  for (let t = 0; t < expanded.length; t++) {
    if (expanded[t] === null) { printed.push(null); continue; }
    const plain = plaintext[pos++];
    let curr;
    if (register === "direct") curr = mod(plain + keys[t], 29);
    else curr = plain === 28 ? previous :
      mod(previous + pow15[mod(plain + keys[t], 28)], 29);
    printed.push(curr);
    previous = curr;
  }
  assert.equal(pos, plaintext.length);
  return printed;
}
function ioc(seq) {
  const count = Array(29).fill(0);
  for (const rune of seq) count[rune]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
function top12(seq) {
  const count = Array(29).fill(0);
  for (const rune of seq) count[rune]++;
  return count.sort((a, b) => b - a).slice(0, 12)
    .reduce((sum, n) => sum + n, 0) / seq.length;
}
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const nativeLatin = [...read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u).filter((line) => /^[0-9A-S]+$/u.test(line)).join("")
  .slice(0, cipher.length)].map((ch) => alphabet.indexOf(ch));
assert.equal(nativeLatin.length, cipher.length);
assert.ok(nativeLatin.every((c) => c >= 0 && c < 29));
const measurements = [];
for (const source of [...directKeys, ...streamKeys]) {
  for (const register of ["direct", "nonzeroStep"]) {
    const decodedOriginal = inverse(expanded, source.keys, register);
    assert.equal(decodedOriginal.length, cipher.length);
    assert.deepEqual(forward(decodedOriginal, source.keys, register), expanded);
    const planted = forward(nativeLatin, source.keys, register);
    assert.deepEqual(inverse(planted, source.keys, register), nativeLatin);
    measurements.push({model: source.id + "/" + register,
      originalIoc: ioc(decodedOriginal),
      originalTop12: top12(decodedOriginal),
      nativeLatinRecovered: nativeLatin.length,
      sample: decodedOriginal.slice(0, 64).map((v) => corpus.translit[v]).join("")
    });
  }
}
assert.equal(measurements.length, 24);
measurements.sort((a, b) => b.originalIoc - a.originalIoc);
const bestDirect = measurements.find((m) => m.model.includes("quoted=") &&
  m.model.includes("/direct"));
const bestStream = measurements.find((m) => m.model.includes("rc4drop=") &&
  m.model.includes("/direct"));
assert.ok(bestDirect.originalIoc < 0.04);
assert.ok(bestStream.originalIoc < 0.04);
assert.ok(measurements[0].originalIoc < 0.04);

console.log(JSON.stringify({
  classification: "historical synthetic four-gap 32x405 negative; source premise retired; no plaintext",
  sourceVisibleInternalSeparatorCount: ann.source_visible_internal_separators_before_rune.length,
  actualOriginalRunes: cipher.length,
  originalQuoteRuneCount: quoted.length,
  tableRows: grid.length / 8,
  legacySyntheticGapCount: gapSet.size,
  expandedPositions: expanded.length,
  sourceNativeLatinIoC: ioc(nativeLatin),
  rawOriginalIoC: ioc(cipher),
  candidateCount: measurements.length,
  allFullLengthOriginalAndNativePlantRoundTrips: true,
  measurements
}, null, 2));
