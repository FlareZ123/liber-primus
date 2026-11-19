"use strict";

/**
 * Director #1687: p50 horizontal-reflection gate inside promoted GP0 navigation.
 *
 * The only positional transform is the source-selected eight-column involution
 * R(8r+c)=8r+(7-c). Existing numeric interpretations are base60 and the
 * already-recorded drop-f base59 reading. Receiver sets are solved p56/p57
 * GP0 values and authenticated 2016 signed-word GP0 values.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const cells = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const runeIndex = new Map(solved.runes.map((rune, index) => [rune, index]));
const transliteration = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N",
  "I", "J", "EO", "P", "X", "S", "T", "B", "E", "M",
  "L", "NG", "OE", "D", "A", "AE", "Y", "IA", "EA"
];
const gpTokens = transliteration
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

assert.equal(cells.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {number} index @returns {number} */
function reflect(index) {
  const row = Math.floor(index / 8);
  const column = index % 8;
  return 8 * row + (7 - column);
}

for (let index = 0; index < 256; index += 1) {
  assert.equal(reflect(reflect(index)), index);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/K/g, "C").replace(/Q/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (normalized.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped " + word + " at " + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {string} sectionName
 * @returns {Array<{index:number,word:string,gp0:number}>}
 */
function parseSolved(sectionName) {
  const section = solved.sections.find((item) => item.name === sectionName);
  assert.ok(section);
  const words = [];
  let current = [];
  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length + 1,
      word: current.map((value) => transliteration[value]).join(""),
      gp0: current.reduce((sum, value) => sum + value, 0)
    });
    current = [];
  }
  for (const ch of [...section.source_text]) {
    const value = runeIndex.get(ch);
    if (value === undefined) flush();
    else current.push(value);
  }
  flush();
  return words;
}

/**
 * @param {Array<{index:number,word:string,gp0:number}>} rows
 * @returns {Array<{index:number,word:string,gp0:number}>}
 */
function uniqueAddresses(rows) {
  const seen = new Set();
  return rows.filter((row) => row.gp0 <= 255 && !seen.has(row.gp0) && seen.add(row.gp0));
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= m; i += 1) result *= (n - m + i) / i;
  return result;
}

/** @param {number} N @param {number} K @param {number} n @param {number} observed @returns {number} */
function hypergeometricUpperTail(N, K, n, observed) {
  const denominator = choose(N, n);
  let numerator = 0;
  for (let k = observed; k <= Math.min(K, n); k += 1) {
    numerator += choose(K, k) * choose(N - K, n - k);
  }
  return numerator / denominator;
}

const p56 = parseSolved("p56_an_end");
const p57 = parseSolved("p57_parable");
const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signedSequence = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word, index) => ({
    index: index + 1,
    word,
    gp0: gp(word).reduce((sum, value) => sum + value, 0)
  }))
  .filter((row) => row.gp0 <= 255);

const sources = {
  p56: uniqueAddresses(p56),
  p57: uniqueAddresses(p57),
  signed: uniqueAddresses(signedSequence)
};
assert.deepEqual(
  Object.fromEntries(Object.entries(sources).map(([name, rows]) => [name, rows.length])),
  { p56: 18, p57: 17, signed: 27 }
);
assert.equal(signedSequence.length, 43);

/**
 * @param {Array<{index:number,word:string,gp0:number}>} source
 * @param {Array<{index:number,word:string,gp0:number}>} receiver
 * @param {59|60} base
 * @param {"direct"|"mirror"} mode
 */
function receiverStats(source, receiver, base, mode) {
  const alphabet = base === 60 ? alphabet60 : alphabet59;
  const targets = new Set(receiver.map((row) => row.gp0));
  const rows = source.map((row) => {
    const address = mode === "mirror" ? reflect(row.gp0) : row.gp0;
    return { ...row, address, token: cells[address], value: decode(cells[address], alphabet) };
  });
  const hits = rows.filter((row) => targets.has(row.value));
  const K = cells.filter((token) => targets.has(decode(token, alphabet))).length;
  return {
    n: source.length,
    K,
    observed: hits.length,
    p: hypergeometricUpperTail(256, K, source.length, hits.length),
    hits
  };
}

/**
 * @param {Array<{index:number,word:string,gp0:number}>} sequence
 * @param {59|60} base
 * @param {"direct"|"mirror"} mode
 */
function nextWordHits(sequence, base, mode) {
  const alphabet = base === 60 ? alphabet60 : alphabet59;
  const hits = [];
  for (let i = 0; i + 1 < sequence.length; i += 1) {
    const source = sequence[i];
    const next = sequence[i + 1];
    if (source.gp0 > 255 || next.gp0 > 255) continue;
    const address = mode === "mirror" ? reflect(source.gp0) : source.gp0;
    const value = decode(cells[address], alphabet);
    if (value === next.gp0) hits.push({ source, next, address, token: cells[address], value });
  }
  return hits;
}

const family = [];
for (const sourceName of Object.keys(sources)) {
  for (const receiverName of Object.keys(sources)) {
    for (const base of [60, 59]) {
      for (const mode of ["direct", "mirror"]) {
        family.push({
          source: sourceName,
          receiver: receiverName,
          base,
          mode,
          ...receiverStats(sources[sourceName], sources[receiverName], base, mode)
        });
      }
    }
  }
}
assert.equal(family.length, 36);
const mirrorFamily = family.filter((row) => row.mode === "mirror").sort((a, b) => a.p - b.p);
const directFamily = family.filter((row) => row.mode === "direct").sort((a, b) => a.p - b.p);
assert.equal(mirrorFamily.length, 18);
assert.equal(mirrorFamily[0].source, "p56");
assert.equal(mirrorFamily[0].receiver, "p56");
assert.equal(mirrorFamily[0].base, 60);
assert.equal(mirrorFamily[0].observed, 3);
assert.ok(Math.abs(mirrorFamily[0].p - 0.12194452388557359) < 1e-12);
assert.equal(Math.min(1, mirrorFamily[0].p * mirrorFamily.length), 1);
assert.equal(directFamily[0].source, "p57");
assert.equal(directFamily[0].receiver, "signed");
assert.equal(directFamily[0].base, 60);
assert.equal(directFamily[0].observed, 6);
assert.ok(Math.abs(directFamily[0].p - 0.012695003284347835) < 1e-12);
assert.ok(Math.abs(Math.min(1, directFamily[0].p * family.length) - 0.45702011823652205) < 1e-12);

const next = [];
for (const [source, sequence] of Object.entries({ p56, p57, signed: signedSequence })) {
  for (const base of [60, 59]) {
    for (const mode of ["direct", "mirror"]) {
      next.push({ source, base, mode, hits: nextWordHits(sequence, base, mode) });
    }
  }
}
assert.ok(next.filter((row) => row.mode === "mirror").every((row) => row.hits.length === 0));
const directSigned60 = next.find((row) => row.source === "signed" && row.base === 60 && row.mode === "direct");
assert.equal(directSigned60.hits.length, 1);
assert.equal(directSigned60.hits[0].source.word.toLowerCase(), "the");
assert.equal(directSigned60.hits[0].next.word.toLowerCase(), "devoted");

const exactTokenPairs = [];
for (let index = 0; index < 256; index += 1) {
  if (index < reflect(index) && cells[index] === cells[reflect(index)]) {
    exactTokenPairs.push([index, reflect(index), cells[index]]);
  }
}
assert.deepEqual(exactTokenPairs, []);

const values60 = cells.map((token) => decode(token, alphabet60));
const commutingPairs = [];
for (let index = 0; index < 256; index += 1) {
  if (index < reflect(index) && values60[reflect(index)] === reflect(values60[index])) {
    commutingPairs.push([index, reflect(index), values60[index], values60[reflect(index)]]);
  }
}
assert.deepEqual(commutingPairs, [[67, 68, 192, 199]]);

const p56ByAddress = new Map(sources.p56.map((row) => [row.gp0, row.word]));
const p57ByAddress = new Map(sources.p57.map((row) => [row.gp0, row.word]));
assert.equal(p56ByAddress.get(67), "EUERY");
assert.equal(p57ByAddress.get(67), "SURFACE");
const overlap = new Set([...p56ByAddress.keys()].filter((address) => p57ByAddress.has(address)));
assert.ok(overlap.has(67));
assert.ok(!sources.p56.filter((row) => !overlap.has(row.gp0)).some((row) => row.gp0 === 67));
assert.ok(!sources.p57.filter((row) => !overlap.has(row.gp0)).some((row) => row.gp0 === 67));

let rngState = 0x1687a18;
function randomUnit() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
function touches(set, index) {
  return set.has(index) || set.has(reflect(index));
}
const p56Set = new Set(sources.p56.map((row) => row.gp0));
const p57Set = new Set(sources.p57.map((row) => row.gp0));
const solvedUnion = new Set([...p56Set, ...p57Set]);
const trials = 200000;
let globalAtLeastOne = 0;
let solvedUnionAtLeastOne = 0;
let bothSolvedAtLeastOne = 0;
for (let trial = 0; trial < trials; trial += 1) {
  const shuffled = values60.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomUnit() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let global = 0;
  let unionHits = 0;
  let bothHits = 0;
  for (let index = 0; index < 256; index += 1) {
    if (index >= reflect(index)) continue;
    if (shuffled[reflect(index)] !== reflect(shuffled[index])) continue;
    global += 1;
    if (touches(solvedUnion, index)) unionHits += 1;
    if (touches(p56Set, index) && touches(p57Set, index)) bothHits += 1;
  }
  if (global >= 1) globalAtLeastOne += 1;
  if (unionHits >= 1) solvedUnionAtLeastOne += 1;
  if (bothHits >= 1) bothSolvedAtLeastOne += 1;
}
const permutation = {
  seed: "0x1687a18",
  trials,
  pGlobal: (globalAtLeastOne + 1) / (trials + 1),
  pSolvedUnion: (solvedUnionAtLeastOne + 1) / (trials + 1),
  pBothSolved: (bothSolvedAtLeastOne + 1) / (trials + 1)
};
assert.ok(Math.abs(permutation.pGlobal - 0.4041129794351028) < 1e-15);
assert.ok(Math.abs(permutation.pSolvedUnion - 0.09598452007739962) < 1e-15);
assert.ok(Math.abs(permutation.pBothSolved - 0.027754861225693872) < 1e-15);

console.log(JSON.stringify({
  status: "PASS",
  issue: 1687,
  sourceSelectedOperation: "R(8r+c)=8r+(7-c)",
  sourceCounts: { p56: sources.p56.length, p57: sources.p57.length, signed2016: sources.signed.length },
  mirrorReceiverFamily: {
    tests: mirrorFamily.length,
    best: mirrorFamily[0],
    familywiseBonferroni: Math.min(1, mirrorFamily[0].p * mirrorFamily.length)
  },
  directBaseline: {
    best: directFamily[0],
    directPlusMirrorFamilywiseBonferroni: Math.min(1, directFamily[0].p * family.length)
  },
  mirrorImmediateNextHits: next.filter((row) => row.mode === "mirror").reduce((sum, row) => sum + row.hits.length, 0),
  exactTokenMirrorPairs: exactTokenPairs,
  valueEquivariance: {
    commutingPairs,
    sharedSolvedAddress67: { p56: p56ByAddress.get(67), p57: p57ByAddress.get(67) },
    exclusiveP56Hits: 0,
    exclusiveP57Hits: 0,
    matchedPermutation: permutation
  },
  decision: "Horizontal reflection remains a source-selected orientation involution. It adds no predictive solved-control grammar beyond GP0 addressing, so #1687 does not authorize an unknown-page decoder test."
}, null, 2));
