"use strict";
/**
 * Source-exact LP2 word-edge and fixed-reserve inverse gate.
 *
 * A lossless 29-ary state mapping can reserve the previous ciphertext rune
 * for one plaintext symbol R. For every non-page-first position, then,
 * C[t] === C[t-1] iff P[t] === R. This test pins the 86 candidate R
 * positions directly from original source and compares them with native
 * GP29 English word masks, without selecting cipher alphabets from C.
 *
 * SFT: node sims/lp2_wordedge_fixedreserve_source_sft.cjs
 * Node 22, CommonJS, read-only, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const sourceSections = raw.split("%");
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(sourceSections.length, 57);

const words = [];
const cells = [];
const groups = [];
let currentWord = [];
let previous = null;
let previousPhysicalPage = -1;
for (let s = 0; s < 55; s++) {
  const physical = s < 50 ? s : s + 1;
  const pageRunes = [];
  const edgePairs = [];
  let between = "";
  for (const ch of sourceSections[s]) {
    if (runeMap.has(ch)) {
      const value = runeMap.get(ch);
      const known = previousPhysicalPage === physical;
      const repeat = known && value === previous;
      if (known && /[-.]/.test(between)) {
        edgePairs.push({a: previous, b: value});
      }
      const cell = {value, physical, known, repeat};
      cells.push(cell);
      currentWord.push(cell);
      pageRunes.push(value);
      previous = value;
      previousPhysicalPage = physical;
      between = "";
    } else {
      between += ch;
      if ("-.&$§".includes(ch) && currentWord.length) {
        words.push(currentWord);
        currentWord = [];
      }
    }
  }
  assert.deepEqual(pageRunes, gp.pages[physical].indices);
  groups.push({physical, edges: edgePairs});
}
if (currentWord.length) words.push(currentWord);
assert.equal(cells.length, 12956);
assert.equal(words.length, 2896);
assert.equal(groups.length, 55);
assert.equal(cells.filter(c => c.known).length, 12901);
const repeats = cells.filter(c => c.repeat).length;
assert.equal(repeats, 86);
const observed = groups.reduce((n, p) =>
  n + p.edges.filter(e => e.a === e.b).length, 0);
const boundaries = groups.reduce((n, p) => n + p.edges.length, 0);
assert.equal(boundaries, 2873);
assert.equal(observed, 23);
assert.equal(repeats - observed, 63);

/** Expected random cross-word matches, conditioning on BOTH original
 * endpoint histograms independently on every physical page.
 * @param {{physical:number,edges:{a:number,b:number}[]}[]} pages
 */
function conditionedMean(pages) {
  let expected = 0;
  for (const {edges} of pages) {
    const a = new Int32Array(29);
    const b = new Int32Array(29);
    for (const e of edges) {
      a[e.a]++;
      b[e.b]++;
    }
    expected += a.reduce((v, count, i) => v + count * b[i], 0) / edges.length;
  }
  return expected;
}
const expected = conditionedMean(groups);
assert.ok(Math.abs(expected - 100.77990995074072) < 1e-9);

/** Deterministic xorshift32, no system entropy.
 * @param {number} seed
 */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const next = random(0x33012014);
const simulations = 20000;
const scores = [];
for (let round = 0; round < simulations; round++) {
  let matches = 0;
  for (const {edges} of groups) {
    const starts = edges.map(e => e.b);
    for (let i = starts.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [starts[i], starts[j]] = [starts[j], starts[i]];
    }
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].a === starts[i]) matches++;
    }
  }
  scores.push(matches);
}
const sorted = scores.slice().sort((a, b) => a - b);
const nullMean = scores.reduce((n, x) => n + x, 0) / simulations;
const nullLess = scores.filter(x => x <= observed).length;
assert.equal(nullLess, 0);
assert.equal(sorted[0], 66);
assert.ok(Math.abs(nullMean - 100.77935) < 1e-6);

/**
 * Explicit lossless GP29 fixed-reserve state cipher.
 * The page-first rune passes directly; the remaining 28 plaintext
 * values map bijectively to the 28 output runes != previous C.
 * @param {number[]} plain
 * @param {number} reserve
 * @returns {number[]}
 */
function encryptReserve(plain, reserve) {
  return plain.map((p, i, out) => {
    if (i === 0) return p;
    const previousCipher = out[i - 1];
    if (p === reserve) return previousCipher;
    const rank = p - (p > reserve ? 1 : 0);
    return (previousCipher + 1 + rank) % 29;
  });
}
/** @param {number[]} cipher @param {number} reserve @returns {number[]} */
function decryptReserve(cipher, reserve) {
  return cipher.map((c, i) => {
    if (i === 0) return c;
    if (c === cipher[i - 1]) return reserve;
    const rank = (c - cipher[i - 1] - 1 + 29) % 29;
    return rank + (rank >= reserve ? 1 : 0);
  });
}
for (const reserve of [0, 15, 21, 27, 28]) {
  const sourcePlain = gp.pages[57].indices;
  const cipher = encryptReserve(sourcePlain, reserve);
  assert.deepEqual(decryptReserve(cipher, reserve), sourcePlain);
  for (let i = 1; i < sourcePlain.length; i++) {
    assert.equal(cipher[i] === cipher[i - 1], sourcePlain[i] === reserve);
  }
}

// Complete authentic word-position masks, preserving page-carried words.
const shapes = words.map(w => {
  let known = 0;
  let repeat = 0;
  w.forEach((cell, i) => {
    if (cell.known) known |= 1 << i;
    if (cell.repeat) repeat |= 1 << i;
  });
  return {length: w.length, known, repeat};
});
assert.equal(shapes.reduce((n, w) => n + w.length, 0), 12956);
assert.equal(Math.max(...shapes.map(w => w.length)), 14);

const tokens = gp.translit.map((symbol, value) =>
  ({symbol: symbol.toLowerCase(), value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** Original-solved-source calibrated English to GP29.
 * @param {string} word
 * @returns {number[]}
 */
function encodeGP(word) {
  const norm = word.toLowerCase()
    .replace(/qu/g, "cw").replace(/ing/g, "ng")
    .replace(/io/g, "ia")
    .replace(/[vkz]/g, c => ({v:"u", k:"c", z:"s"})[c]);
  const out = [];
  for (let i = 0; i < norm.length;) {
    const token = tokens.find(t => norm.startsWith(t.symbol, i));
    assert.ok(token, "Unknown GP English input " + word);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}
const pools = {
  Gibran: Array.from({length: 15}, () => []),
  Shakespeare: Array.from({length: 15}, () => []),
  SolvedCicada: Array.from({length: 15}, () => [])
};
for (const [name, file] of [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const indices = encodeGP(word);
    if (indices.length <= 14) pools[name][indices.length].push(indices);
  }
}
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
for (const section of solved.sections) {
  let word = [];
  for (const ch of section.source_text) {
    if (runeMap.has(ch)) word.push(runeMap.get(ch));
    else if (word.length) {
      if (word.length <= 14) pools.SolvedCicada[word.length].push(word);
      word = [];
    }
  }
  if (word.length && word.length <= 14) pools.SolvedCicada[word.length].push(word);
}
const unique = Array.from({length: 15}, () => new Set());
for (const family of Object.values(pools)) {
  for (let length = 1; length <= 14; length++) {
    assert.ok(family[length].length);
    for (const word of family[length]) unique[length].add(word.join(","));
  }
}
const expectedSizes = [0,14,67,336,961,1247,1342,1086,781,523,280,159,74,22,5];
assert.deepEqual(unique.map(s => s.size), expectedSizes);

// For any candidate reserved rune, compare exact positions in each
// original printed word, including observed absence at all other sites.
const possibleMasks = Array.from({length:15},
  () => Array.from({length:29}, () => new Set()));
for (let length = 1; length <= 14; length++) {
  for (const word of unique[length]) {
    const values = word.split(",").map(Number);
    for (let reserve = 0; reserve < 29; reserve++) {
      let mask = 0;
      values.forEach((v, i) => {
        if (v === reserve) mask |= 1 << i;
      });
      possibleMasks[length][reserve].add(mask);
    }
  }
}
const contradictions = gp.translit.map((symbol, reserve) => {
  const failed = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    let found = false;
    for (const mask of possibleMasks[shape.length][reserve]) {
      if ((mask & shape.known) === shape.repeat) {
        found = true;
        break;
      }
    }
    if (!found) failed.push(i);
  }
  return {symbol, reserve, impossibleWords: failed.length, examples:failed.slice(0,5)};
}).sort((a,b) => a.impossibleWords - b.impossibleWords);
assert.deepEqual(contradictions.filter(x => x.impossibleWords === 0).map(x => x.symbol), ["S"]);
for (const [symbol, expectedMiss] of [
  ["NG",19],["EA",15],["IA",45],["X",52],["J",56],["R",1],["F",4]
]) {
  assert.equal(contradictions.find(x => x.symbol === symbol).impossibleWords, expectedMiss);
}

// Expected count of the reserved symbol in an original-word-length-matched
// native English control; original ciphertext fixes 86 such occurrences
// at non-page-first positions and leaves only 55 page-first sites unknown.
const lengthCount = new Int32Array(15);
for (const {length} of shapes) lengthCount[length]++;
function expectedCount(nativePools, symbol) {
  let mean = 0, variance = 0;
  for (let len = 1; len <= 14; len++) {
    const candidates = nativePools[len];
    const values = candidates.map(w => w.filter(x => x === symbol).length);
    const m = values.reduce((n,v) => n + v, 0) / values.length;
    const v = values.reduce((n,x) => n + (x-m)**2, 0) / values.length;
    mean += m * lengthCount[len];
    variance += v * lengthCount[len];
  }
  return {expected:mean, sd:Math.sqrt(variance)};
}
const nativeCounts = Object.fromEntries(
  Object.entries(pools).map(([name, nativePools]) => [
    name,
    Object.fromEntries(["S","NG","EA","IA"].map(name => {
      const index = gp.translit.indexOf(name);
      return [name, expectedCount(nativePools,index)];
    }))
  ])
);
assert.ok(nativeCounts.Gibran.S.expected > 900);
assert.ok(nativeCounts.Shakespeare.S.expected > 900);
assert.ok(nativeCounts.SolvedCicada.S.expected > 800);
const evidence = {
  original:{runes:cells.length,printedWords:words.length,withinPagePairs:12901,
    repeats,wordEdgePairs:boundaries,wordEdgeRepeats:observed,
    wordInternalPairs:12901-boundaries,wordInternalRepeats:repeats-observed},
  pageConditionedPermutation:{expected,iterations:simulations,seed:"0x33012014",
    min:sorted[0],max:sorted[sorted.length-1],mean:nullMean,
    q01:sorted[Math.floor(simulations*0.01)],exceedancesAtOrBelowObserved:nullLess},
  reserveLexicalGate:{permittedOriginalTotalReserveRange:[86,141],
    uniqueNativeWordsByLength:expectedSizes,contradictions},
  nativeLengthMatchedExpectedReserveCounts:nativeCounts
};
console.log(JSON.stringify(evidence, null, 2));
