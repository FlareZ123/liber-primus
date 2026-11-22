"use strict";
/**
 * Director #542: exact state-coloring and fixed-period obstruction for
 * length-preserving, reversible, state-keyed whole-word codebooks.
 *
 * Run from repository root: node sims/lp2_word_state_budget_sft.cjs
 * All inputs are committed sources; no network or external packages required.
 *
 * Distinguish the exact graph theorem from conditional native-language
 * samples and from constructions fitted to the original ciphertext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const ALIASES = [..."FU@ORCGWHNIJ#PXSTBEML!+DA%Y^~"];
const runeSet = new Set(RUNES);
const runeIndex = new Map(RUNES.map((r, i) => [r, i]));
const gpIndex = new Map(ALIASES.map((r, i) => [r, i]));
const SOURCES = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const SEED = 0x05423301;
const TRIALS = 70;
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

/** Preserve original physical pages; line breaks do not delimit words. */
function originalWords() {
  const raw = read("resources/liber-primus/lp2-transcription.txt")
    .split("%").slice(0, 55).join("%");
  const words = [];
  let page = 0, token = "", startPage = 0;
  function finish() {
    if (!token) return;
    words.push({c: token, length: [...token].length, page: startPage});
    token = "";
  }
  for (const ch of raw) {
    if (runeSet.has(ch)) {
      if (!token) startPage = page;
      token += ch;
    } else if (ch === "%") page++;
    else if ("-.&$§".includes(ch)) finish();
  }
  finish();
  assert.equal(page, 54);
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((a, w) => a + w.length, 0), 12956);
  const pageCounts = Array(55).fill(0);
  words.forEach((w, i) => {
    w.index = i;
    w.local = pageCounts[w.page]++;
  });
  assert.equal(Math.max(...pageCounts), 71);
  return words;
}

/** Same GP-length normalizer as the existing original-word source control. */
function normalizeGP(raw) {
  const word = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const digraph = {TH:"@", EO:"#", OE:"+", AE:"%", IA:"^", EA:"~", NG:"!"};
  let out = "";
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out += "!"; i += 3; }
    else if (digraph[word.slice(i, i + 2)]) {
      out += digraph[word.slice(i, i + 2)]; i += 2;
    } else out += word[i++];
  }
  return out;
}
function poolsFor(file) {
  const pools = new Map();
  for (const token of read(file).match(/[A-Za-z]+/g) || []) {
    const word = normalizeGP(token);
    if (!pools.has(word.length)) pools.set(word.length, []);
    pools.get(word.length).push(word);
  }
  return pools;
}
/** Deterministic unsigned XorShift32; no platform PRNG dependence. */
function seededRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}
function matched(words, pools, random) {
  return words.map(w => {
    const candidates = pools.get(w.length);
    assert.ok(candidates && candidates.length, "missing GP length " + w.length);
    const plain = candidates[random() % candidates.length];
    assert.equal(plain.length, w.length);
    for (const char of plain) assert.ok(gpIndex.has(char), "unknown GP " + char);
    return plain;
  });
}

/** Record every exact period t that divides a contradictory position gap. */
function excludePeriods(bad, gap) {
  if (gap === 0) { bad.fill(1); return; }
  for (let d = 1; d * d <= gap; d++) {
    if (gap % d) continue;
    bad[d] = 1;
    bad[gap / d] = 1;
  }
}
function firstAllowed(bad, bound) {
  for (let t = 1; t <= bound; t++) if (!bad[t]) return t;
  return null;
}
/**
 * A state table is a separate bijection within each word length.
 * For every pair (p,c), equal p with different c, or equal c with
 * different p, cannot share an internal state.
 * globalCycle: one book-wide codebook and an unbroken word-index clock.
 * pageCycle: a different codebook per page, local word-index clock.
 * sharedResetCycle: book-wide codebook but a page-reset clock.
 * Arbitrary-state lower bound is the maximum bipartite graph degree.
 */
function evaluate(words, plaintext) {
  const byPlain = new Map(), byCipher = new Map();
  const degreeGlobal = [new Map(), new Map()];
  const degreePage = Array.from({length:55}, () => [new Map(), new Map()]);
  const badGlobal = new Uint8Array(2897);
  const badPage = new Uint8Array(2897);
  const badSharedReset = new Uint8Array(2897);
  const conflicts = [0, 0, 0];
  const addNeighbor = (m, key, value) => {
    if (!m.has(key)) m.set(key, new Set());
    m.get(key).add(value);
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i], p = plaintext[i];
    const a = w.length + ":" + p, b = w.length + ":" + w.c;
    if (!byPlain.has(a)) byPlain.set(a, []);
    if (!byCipher.has(b)) byCipher.set(b, []);
    byPlain.get(a).push(i);
    byCipher.get(b).push(i);
    addNeighbor(degreeGlobal[0], a, w.c);
    addNeighbor(degreeGlobal[1], b, p);
    addNeighbor(degreePage[w.page][0], a, w.c);
    addNeighbor(degreePage[w.page][1], b, p);
  }
  function mark(groups, side) {
    for (const ids of groups.values()) {
      for (let a = 0; a < ids.length; a++)
        for (let b = 0; b < a; b++) {
          const i = ids[a], j = ids[b];
          if (side === "plain" && words[i].c === words[j].c) continue;
          if (side === "cipher" && plaintext[i] === plaintext[j]) continue;
          excludePeriods(badGlobal, Math.abs(i - j)); conflicts[0]++;
          excludePeriods(badSharedReset,
            Math.abs(words[i].local - words[j].local)); conflicts[2]++;
          if (words[i].page === words[j].page) {
            excludePeriods(badPage,
              Math.abs(words[i].local - words[j].local));
            conflicts[1]++;
          }
        }
    }
  }
  mark(byPlain, "plain");
  mark(byCipher, "cipher");
  const maxDegree = map => {
    let max = 0;
    for (const neighbors of map.values()) max = Math.max(max, neighbors.size);
    return max;
  };
  const globalStates = Math.max(...degreeGlobal.map(maxDegree));
  const pageStates = Math.max(...degreePage.map(pair =>
    Math.max(...pair.map(maxDegree))));
  return {
    globalStates, pageStates,
    globalCycle: firstAllowed(badGlobal, 2896),
    pageCycle: firstAllowed(badPage, 71),
    sharedResetCycle: firstAllowed(badSharedReset, 2896),
    conflicts
  };
}

/**
 * Construct an optimal bipartite edge coloring using alternating paths.
 * The theorem that every bipartite graph needs exactly Delta colors
 * proves sharpness of the arbitrary-state lower bound.
 * Edges are distinct (plaintext,ciphertext) pairs.
 */
function colorEdges(edges) {
  const byU = new Map(), byV = new Map(), du = new Map(), dv = new Map();
  for (const e of edges) {
    if (!byU.has(e.u)) byU.set(e.u, new Map());
    if (!byV.has(e.v)) byV.set(e.v, new Map());
    du.set(e.u, (du.get(e.u) || 0) + 1);
    dv.set(e.v, (dv.get(e.v) || 0) + 1);
  }
  const delta = Math.max(0, ...du.values(), ...dv.values());
  function free(map) {
    for (let k = 0; k < delta; k++) if (!map.has(k)) return k;
    throw Error("unavailable color");
  }
  function attach(e, k) {
    assert.ok(!byU.get(e.u).has(k));
    assert.ok(!byV.get(e.v).has(k));
    byU.get(e.u).set(k, e);
    byV.get(e.v).set(k, e);
    e.color = k;
  }
  for (const e of edges) {
    const alpha = free(byU.get(e.u)), beta = free(byV.get(e.v));
    if (alpha === beta) { attach(e, alpha); continue; }
    let onU = true, vertex = e.u, next = beta;
    const path = [];
    while (true) {
      const edge = (onU ? byU : byV).get(vertex).get(next);
      if (!edge) break;
      path.push(edge);
      vertex = onU ? edge.v : edge.u;
      onU = !onU;
      next = next === alpha ? beta : alpha;
      assert.ok(path.length <= edges.length);
    }
    for (const edge of path) {
      byU.get(edge.u).delete(edge.color);
      byV.get(edge.v).delete(edge.color);
    }
    for (const edge of path) edge.color =
      edge.color === alpha ? beta : alpha;
    for (const edge of path) attach(edge, edge.color);
    attach(e, beta);
  }
  return delta;
}
function tinyExhaustive() {
  for (let mask = 0; mask < 512; mask++) {
    const edges = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (mask & (1 << (3 * i + j))) edges.push({u:i, v:j});
    const degrees = [];
    for (let n = 0; n < 3; n++) {
      degrees.push(edges.filter(e => e.u === n).length);
      degrees.push(edges.filter(e => e.v === n).length);
    }
    assert.equal(colorEdges(edges), Math.max(...degrees));
  }
}

/**
 * Positive control 1: fit the smallest number of arbitrary secret word
 * codebooks to a source-native sample and the exact ORIGINAL ciphertext.
 * This demonstrates information-theoretic compatibility, not decryption:
 * the fitted table explicitly contains every original ciphertext word.
 */
function exactFittedCodebook(words, plaintext, expectedStates) {
  const edges = [], edgeByPair = new Map();
  for (let i = 0; i < words.length; i++) {
    const w = words[i], p = plaintext[i];
    const key = JSON.stringify([w.length, p, w.c]);
    if (edgeByPair.has(key)) continue;
    const edge = {
      u: w.length + ":" + p,
      v: w.length + ":" + w.c,
      len: w.length, p, c: w.c
    };
    edges.push(edge);
    edgeByPair.set(key, edge);
  }
  assert.equal(colorEdges(edges), expectedStates);
  const encode = new Map(), decode = new Map();
  for (const e of edges) {
    const k1 = JSON.stringify([e.color, e.len, e.p]);
    const k2 = JSON.stringify([e.color, e.len, e.c]);
    assert.ok(!encode.has(k1) && !decode.has(k2));
    encode.set(k1, e.c);
    decode.set(k2, e.p);
  }
  for (let i = 0; i < words.length; i++) {
    const w = words[i], p = plaintext[i];
    const e = edgeByPair.get(JSON.stringify([w.length, p, w.c]));
    assert.equal(encode.get(JSON.stringify([e.color, w.length, p])), w.c);
    assert.equal(decode.get(JSON.stringify([e.color, w.length, w.c])), p);
  }
  return {distinctPairs: edges.length, states: expectedStates,
    exactlyReencodedWords: words.length};
}

/** Positive control 2: independently generated page-local Caesar keys. */
function independentNativePlant(words, plaintext) {
  let n = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i], shift = ((w.page + 1) * 7 + w.local * 11) % 29;
    const src = [...plaintext[i]].map(x => gpIndex.get(x));
    const cipher = src.map(x => (x + shift) % 29);
    const recovered = cipher.map(x => (x - shift + 29) % 29);
    assert.deepEqual(recovered, src);
    assert.equal(cipher.length, w.length);
    n += cipher.length;
  }
  assert.equal(n, 12956);
  return {words: words.length, runes: n, pageClock: 71};
}

/**
 * Segmentation counterexample: a continuous GP29 one-time pad maps ANY
 * exact-length GP plaintext stream to the original ciphertext, regardless
 * of where visible ciphertext word breaks are placed. Its 12,956-symbol
 * key is fitted and has no authenticated historical source.
 */
function continuousPadCounterexample(words, plaintext) {
  const c = [...words.map(w => w.c).join("")].map(x => runeIndex.get(x));
  const p = [...plaintext.join("")].map(x => gpIndex.get(x));
  assert.equal(c.length, 12956);
  assert.equal(p.length, c.length);
  const key = c.map((value, i) => (value - p[i] + 29) % 29);
  for (let i = 0; i < c.length; i++)
    assert.equal((p[i] + key[i]) % 29, c[i]);
  return {symbols: key.length,
    idealIndependentKeyBits: key.length * Math.log2(29)};
}
function range(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {min: sorted[0], median: sorted[Math.floor(sorted.length / 2)],
    max: sorted.at(-1)};
}
function main() {
  const words = originalWords(), random = seededRandom(SEED);
  tinyExhaustive();
  for (const source of SOURCES) {
    const pools = poolsFor(source), rows = [];
    let first;
    for (let i = 0; i < TRIALS; i++) {
      const p = matched(words, pools, random);
      if (i === 0) first = p;
      rows.push(evaluate(words, p));
    }
    const fields = ["globalStates", "pageStates", "globalCycle", "pageCycle"];
    const summary = Object.fromEntries(fields.map(field =>
      [field, range(rows.map(r => r[field]))]));
    const fitted = exactFittedCodebook(words, first, rows[0].globalStates);
    const planted = independentNativePlant(words, first);
    const pad = continuousPadCounterexample(words, first);
    assert.equal(rows.filter(r => r.sharedResetCycle !== null).length, 0);
    console.log(JSON.stringify({
      source, seed: "0x05423301", trials: TRIALS,
      summary, sharedResetPossible: 0,
      example: rows[0], fitted, planted, pad
    }));
  }
  console.log("PASS all 512 simple 3x3 bipartite graphs, source-native plants, original-stream round trips");
}
if (require.main === module) main();
module.exports = {originalWords, normalizeGP, evaluate,
  colorEdges, tinyExhaustive, exactFittedCodebook};
