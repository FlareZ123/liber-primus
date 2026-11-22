"use strict";
/**
 * Source-locked p50+DIVINITY GP29 collision-skip decoder, LP2 p0-p2.
 * Node.js 22, CommonJS, standalone. Reads repository resources only.
 *
 * Candidate encryption, with per-rune mutable key pointer j:
 *   K(j) = (sourceTable[j mod 256] + DIUINITY[j mod 8]) mod 29
 *   try C = (P + K(j)) mod 29
 *   if C equals preceding ciphertext, skip with probability q=0.81,
 *   consuming a key position; otherwise emit C.
 *
 * The inverse Viterbi lattice requires EVERY hypothesized skipped
 * key position to reproduce the exact observed preceding ciphertext.
 * Printed original word starts reset only the language scorer.
 * The real LP2 source never enters the LM training or positive plant.
 *
 * The key, table combination, page zero start and skip rule are hypotheses.
 * No unknown LP2 plaintext is claimed. No files are written.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const printed = read("resources/liber-primus/lp2-transcription.txt");
const byteTable = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const MOD = 29, START = 29, Q = 0.81, BEAM = 5000, MAX_DRIFT = 50;
const DIUINITY = [23, 10, 1, 10, 9, 10, 16, 26];
assert.equal(byteTable.length, 256);
assert.equal(gp.translit.length, 29);
assert.deepEqual(gp.pages.slice(0, 3).map((p) => p.indices.length), [262, 266, 201]);
const cipher = gp.pages.slice(0, 3).flatMap((p) => p.indices);
assert.equal(cipher.length, 729);
const runeIndex = new Map(gp.runes.map((v, i) => [v, i]));
const letters = new Map(gp.translit.map((v, i) => [v, i]));
/**
 * Encode native English as GP runes under one fixed greedy spelling.
 * The same codec applies to independent train/control texts.
 * @param {string} source
 * @returns {number[]}
 */
function gpWord(source) {
  const s = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    let value;
    if (s.startsWith("ING", i)) { value = 21; i += 3; }
    else if (s.startsWith("IO", i)) { value = 27; i += 2; }
    else if (letters.has(s.slice(i, i + 2))) {
      value = letters.get(s.slice(i, i + 2)); i += 2;
    } else {
      value = letters.get(s[i]); i++;
    }
    if (value !== undefined) out.push(value);
  }
  return out;
}
/** @param {string} s @returns {number[][]} */
function gpWords(s) {
  return (s.match(/[A-Za-z]+/g) || []).map(gpWord).filter((a) => a.length);
}
const controlWords = gpWords(shakespeare);
const trainingWords = gpWords(gibran);
assert.equal(trainingWords.length, 15733);
assert.equal(controlWords.length, 55407);
/**
 * Original word starts from original rune stream, preserving line/page wraps.
 * @returns {boolean[]}
 */
function originalStarts() {
  let count = 0, start = true;
  const out = [];
  for (const ch of printed) {
    if (runeIndex.has(ch)) {
      if (count < cipher.length) { out.push(start); start = false; }
      count++;
      if (count >= cipher.length) break;
    } else if ("- .&§:!?".includes(ch) && ch.trim()) start = true;
  }
  assert.equal(out.length, cipher.length);
  return out;
}
const starts = originalStarts();
/** @returns {number[]} */
function originalWordLengths() {
  const out = [];
  let current = 0;
  for (const b of starts) {
    if (b && current) out.push(current);
    current = b ? 1 : current + 1;
  }
  if (current) out.push(current);
  return out;
}
const wordLengths = originalWordLengths();
assert.equal(wordLengths.length, 158);
/** @returns {number[]} */
function positivePlaintext() {
  const byLength = new Map();
  for (const w of controlWords) {
    if (!byLength.has(w.length)) byLength.set(w.length, []);
    byLength.get(w.length).push(w);
  }
  const out = [];
  for (let i = 0; i < wordLengths.length; i++) {
    const pool = byLength.get(wordLengths[i]);
    assert(pool && pool.length, "Missing native positive word length");
    out.push(...pool[(i * 37 + 13) % pool.length]);
  }
  assert.equal(out.length, cipher.length);
  return out;
}
const plaintext = positivePlaintext();
// Source-native word-internal GP trigram model, including word start.
const triples = new Uint32Array(30 * 30 * 29);
const pairCounts = new Uint32Array(30 * 30);
for (const w of trainingWords) {
  let a = START, b = START;
  for (const p of w) {
    triples[(a * 30 + b) * 29 + p]++;
    pairCounts[a * 30 + b]++;
    a = b; b = p;
  }
}
/** @param {number} a @param {number} b @param {number} p */
function logProse(a, b, p) {
  return Math.log((triples[(a * 30 + b) * 29 + p] + 0.08) /
    (pairCounts[a * 30 + b] + 0.08 * 29));
}
/** @param {number} j @param {number} tableOffset */
function key(j, tableOffset = 0) {
  return (byteTable[(j + tableOffset) % 256] + DIUINITY[j % 8]) % MOD;
}
/** @returns {{cipher:number[], skipCount:number, doublets:number}} */
function plant() {
  let rngState = 0x3301;
  const random = () => {
    rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
    return rngState / 4294967296;
  };
  const output = [];
  let prevKey = -1, skipCount = 0, doublets = 0;
  for (let i = 0; i < plaintext.length; i++) {
    let j = prevKey + 1;
    let c = (plaintext[i] + key(j)) % MOD;
    while (i > 0 && c === output[i - 1] && random() < Q) {
      j++;
      c = (plaintext[i] + key(j)) % MOD;
      skipCount++;
    }
    if (i > 0 && c === output[i - 1]) doublets++;
    output.push(c);
    prevKey = j;
  }
  return { cipher: output, skipCount, doublets };
}
/**
 * Exact skip-compatibility Viterbi inverse of the stated model.
 * A hidden skip may occur ONLY if the same unknown plaintext under
 * that skipped key would equal the preceding printed cipher rune.
 * @param {number[]} input
 * @param {number} tableOffset
 * @returns {{plain:number[],score:number,skipCount:number,maxActive:number}}
 */
function decode(input, tableOffset = 0) {
  let nodes = [{ j: -1, a: START, b: START, p: START, score: 0, parent: null }];
  let maxActive = 0;
  for (let i = 0; i < input.length; i++) {
    const next = new Map();
    for (const prior of nodes) {
      for (let skipped = 0; skipped <= 3; skipped++) {
        const j = prior.j + 1 + skipped;
        if (j - i > MAX_DRIFT) continue;
        const p = (input[i] - key(j, tableOffset) + MOD) % MOD;
        let compatible = true;
        for (let k = prior.j + 1; k < j; k++) {
          if ((p + key(k, tableOffset)) % MOD !== input[i - 1]) {
            compatible = false; break;
          }
        }
        if (!compatible) continue;
        const a = starts[i] ? START : prior.a;
        const b = starts[i] ? START : prior.b;
        const score = prior.score + logProse(a, b, p) +
          skipped * Math.log(Q) +
          (i > 0 && input[i] === input[i - 1] ? Math.log(1 - Q) : 0);
        const node = { j, a: b, b: p, p, score, parent: prior };
        const signature = j + "|" + b + "|" + p;
        const other = next.get(signature);
        if (!other || score > other.score) next.set(signature, node);
      }
    }
    nodes = Array.from(next.values())
      .sort((a, b) => b.score - a.score).slice(0, BEAM);
    maxActive = Math.max(maxActive, nodes.length);
    assert(nodes.length > 0, "No compatible path at source offset " + i);
  }
  const best = nodes[0], out = [], keyPositions = [];
  for (let p = best; p.parent; p = p.parent) {
    out.push(p.p);
    keyPositions.push(p.j);
  }
  out.reverse();
  keyPositions.reverse();
  assert.equal(out.length, input.length);
  return {
    plain: out,
    score: best.score / input.length,
    skipCount: keyPositions.at(-1) + 1 - input.length,
    maxActive
  };
}
const planted = plant();
const plantResult = decode(planted.cipher);
const original = decode(cipher);
const wrongPhase = decode(cipher, 19);
const recovered = plantResult.plain.filter((v, i) => v === plaintext[i]).length;
assert.equal(planted.skipCount, 29);
assert.equal(planted.doublets, 5);
assert.equal(plantResult.skipCount, 29);
assert.equal(recovered, 729, "A valid planted stream must decode exactly");
assert(original.score < -4.0, "Unexpected source-language signal: investigate");
assert(plantResult.score > -3.0);
const result = {
  question: "Does source p50 byte%29 + historical DIUINITY invert original LP2 p0-p2 after collision skips?",
  input: {
    pages: [0, 1, 2],
    runes: cipher.length,
    printedWords: wordLengths.length,
    tableBytes: byteTable.length,
    q: Q,
    trainingSource: "Gibran, independent",
    plantSource: "Shakespeare, matched printed word lengths"
  },
  planted: {
    actualSkips: planted.skipCount,
    doublets: planted.doublets,
    recovered: recovered,
    decoderSkips: plantResult.skipCount,
    scorePerRune: plantResult.score
  },
  original: {
    scorePerRune: original.score,
    decoderSkips: original.skipCount,
    initialGP: original.plain.slice(0, 32).map((v) => gp.translit[v]).join(" ")
  },
  wrongSourceOffset19: {
    scorePerRune: wrongPhase.score,
    decoderSkips: wrongPhase.skipCount
  },
  result: "The exact original-input skip-aware inverse is nonlinguistic; no unknown plaintext or authenticated key"
};
console.log(JSON.stringify(result, null, 2));
