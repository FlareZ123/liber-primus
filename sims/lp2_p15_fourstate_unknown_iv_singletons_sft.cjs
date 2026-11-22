"use strict";

/**
 * LP2 p15 Fibonacci-prime 4x4 matrix: exhaustive unknown-initial-state
 * decipherment using original pp16-22 one-rune English-word cribs.
 *
 * The scalar stream is K[4t+j] = (M^t v)[j] over GF(29) with an arbitrary
 * unknown four-rune state v. Each original printed one-rune word must
 * decrypt as A, I or O for ordinary GP English with preserved spaces.
 * Four independent singletons leave only 3^4 = 81 possible states.
 * Remaining 13 original singletons are held out completely from the solve.
 * Four matrix orientations x forward/inverse = eight all-state gates.
 *
 * Runs on Windows Node.js 22: node sims/lp2_p15_fourstate_unknown_iv_singletons_sft.cjs
 * Read-only, no external dependencies or runtime file writes.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"), "utf8");

const mod = n => (n % 29 + 29) % 29;
const dot = (a, b) => mod(a.reduce((s, v, i) => s + v * b[i], 0));
const ALPHABET = [24, 10, 3]; // Source GP29 indices of A, I, O.
const BEGIN = corpus.pages.filter(p => p.page < 16)
  .reduce((s, p) => s + p.indices.length, 0);
const END = corpus.pages.filter(p => p.page < 23)
  .reduce((s, p) => s + p.indices.length, 0);
const cipher = corpus.pages.filter(p => p.page >= 16 && p.page <= 22)
  .flatMap(p => p.indices);
assert.deepEqual([BEGIN, END, cipher.length], [3762, 5506, 1744]);

/** Preserve words crossing page or line boundaries. */
function printedWords() {
  const runes = new Set(corpus.runes);
  const stream = transcript.split("%").slice(0, 55).join("%");
  const words = [];
  let current = "", at = 0, begin = 0;
  const flush = () => {
    if (current) words.push({at: begin, runeWord: current});
    current = "";
  };
  for (const ch of stream) {
    if (runes.has(ch)) {
      if (!current) begin = at;
      current += ch;
      at++;
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      flush();
    }
  }
  flush();
  assert.equal(at, 12956);
  assert.equal(words.length, 2896);
  return words;
}
const singletons = printedWords()
  .filter(w => w.runeWord.length === 1 && w.at >= BEGIN && w.at < END)
  .map(w => ({at: w.at - BEGIN, cipher: cipher[w.at - BEGIN]}));
assert.equal(singletons.length, 17);
assert.deepEqual(singletons.map(s => s.at),
  [21,119,244,380,386,414,455,471,596,712,871,937,989,1032,
    1491,1557,1574]);

const unsigned = [
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
].map(row => row.map(mod));
const signed = unsigned.map(row => row.slice());
signed[3][0] = mod(-4516);
signed[3][1] = mod(-1206);
const transpose = matrix => matrix[0].map((_, j) =>
  matrix.map(row => row[j]));
const originalMatrices = [
  ["printed", unsigned],
  ["signed-fibonacci-primes", signed],
  ["printed-transpose", transpose(unsigned)],
  ["signed-transpose", transpose(signed)]
];

/** @param {number} value Nonzero GF29 residue. */
function inverseScalar(value) {
  for (let i = 1; i < 29; i++) if (mod(value * i) === 1) return i;
  throw new Error("GF29 zero pivot");
}
/** Row-reduce an arbitrary n x (4 or 8) GF29 matrix on its first four columns. */
function reduce(rows) {
  const m = rows.map(row => row.slice());
  let rank = 0;
  for (let col = 0; col < 4 && rank < m.length; col++) {
    let pivot = rank;
    while (pivot < m.length && m[pivot][col] === 0) pivot++;
    if (pivot === m.length) continue;
    [m[rank], m[pivot]] = [m[pivot], m[rank]];
    const scale = inverseScalar(m[rank][col]);
    m[rank] = m[rank].map(x => mod(x * scale));
    for (let i = 0; i < m.length; i++) {
      if (i === rank) continue;
      const factor = m[i][col];
      m[i] = m[i].map((value, j) =>
        mod(value - factor * m[rank][j]));
    }
    rank++;
  }
  return {rank, matrix: m};
}
/** @param {number[][]} matrix Invertible 4x4 GF29 matrix. */
function inverse4(matrix) {
  const rows = matrix.map((row, i) => row.concat(
    [0,1,2,3].map(j => Number(i === j))));
  const result = reduce(rows);
  assert.equal(result.rank, 4, "source matrix must be invertible");
  return result.matrix.map(row => row.slice(4));
}
/** Full 4-component output stream of unknown state under a public matrix. */
function streamRows(matrix, length) {
  assert.equal(length % 4, 0);
  let H = [0,1,2,3].map(i => [0,1,2,3].map(j => Number(i === j)));
  const rows = [];
  for (let t = 0; t < length / 4; t++) {
    rows.push(...H.map(row => row.slice()));
    H = H.map(row => matrix[0].map((_, j) =>
      mod(row.reduce((sum, v, k) => sum + v * matrix[k][j], 0))));
  }
  return rows;
}
/**
 * Exhaust the entire 29^4 unknown-state space compatible with the first
 * four independent original singleton cribs. All later singleton cribs are
 * a locked, independent necessary condition for ordinary English.
 */
function search(ciphertext, rows, sites=singletons) {
  const observed = sites.map(s => ({at: s.at, cipher: ciphertext[s.at]}));
  const form = observed.map(s => rows[s.at]);
  const chosen = [];
  for (let i = 0; i < observed.length && chosen.length < 4; i++) {
    const candidate = chosen.map(k => form[k]).concat([form[i]]);
    if (reduce(candidate).rank > chosen.length) chosen.push(i);
  }
  assert.equal(chosen.length, 4);
  const inv = inverse4(chosen.map(i => form[i]));
  let minimumContradictions = Infinity;
  const bestKeys = [];
  const perfectKeys = [];
  for (let choice = 0; choice < 81; choice++) {
    let code = choice;
    const target = chosen.map(i => {
      const plain = ALPHABET[code % 3];
      code = Math.floor(code / 3);
      return mod(observed[i].cipher - plain);
    });
    const key = inv.map(row => dot(row, target));
    const contradictions = observed.filter((item, i) =>
      !ALPHABET.includes(mod(item.cipher - dot(form[i], key)))).length;
    if (contradictions < minimumContradictions) {
      minimumContradictions = contradictions;
      bestKeys.length = 0;
      bestKeys.push(key);
    } else if (contradictions === minimumContradictions) {
      bestKeys.push(key);
    }
    if (contradictions === 0) perfectKeys.push(key);
  }
  return {
    firstFourIndependent: chosen.map(i => observed[i].at),
    testedCompleteStates: 81,
    rejectedByHeldout: 81 - perfectKeys.length,
    minimumContradictions,
    minimumAmongThirteenHeldout: minimumContradictions,
    keysAtMinimum: bestKeys.length,
    firstBestKey: bestKeys[0],
    perfectKeys
  };
}

/** Exact independent native-solved-text positive plant for one full chapter. */
function positive() {
  const H = streamRows(signed, cipher.length);
  const key = [9, 2, 15, 20];
  const native = corpus.pages[57].indices;
  assert.equal(native.length, 95);
  const plain = Array.from({length: cipher.length},
    (_, i) => native[i % native.length]);
  singletons.forEach((s, i) => { plain[s.at] = ALPHABET[i % 3]; });
  const encrypted = plain.map((x, i) => mod(x + dot(H[i], key)));
  const recovered = search(encrypted, H);
  assert(recovered.perfectKeys.some(candidate =>
    candidate.every((x, i) => x === key[i])));
  const decrypted = encrypted.map((x, i) => mod(x - dot(H[i], key)));
  assert.deepEqual(decrypted, plain);
  assert.deepEqual(decrypted.map((x, i) => mod(x + dot(H[i], key))),
    encrypted);
  return {
    source: "authenticated solved p57 GP29 text, repeated with 17 A/I/O slots",
    plantedRunes: decrypted.length, plantedState: key,
    exactInverse: true, exactForward: true,
    recoveredTrueUnknownStateFromSingletons: true,
    zeroContradictionStateCount: recovered.perfectKeys.length
  };
}

function run() {
  const reports = [];
  for (const [name, matrix] of originalMatrices) {
    for (const [direction, selected] of [
      ["forward", matrix], ["inverse", inverse4(matrix)]
    ]) {
      const rows = streamRows(selected, cipher.length);
      const test = search(cipher, rows);
      assert.equal(test.perfectKeys.length, 0,
        "Original cipher cannot satisfy all 17 A/I/O one-rune cribs");
      reports.push({matrix: name, direction, ...test,
        perfectKeys: undefined});
    }
  }
  assert.equal(reports.length, 8);
  assert.deepEqual(reports.map(x => x.minimumContradictions),
    [9,7,9,8,10,9,9,7]);
  return {
    classification: "source-conditional exhaustive four-state key exclusion",
    premise: "one shared 4D additive GP29 register across original pp16–22",
    source: "p15 Fibonacci-prime square and original printed word boundaries",
    original: {ciphertextRunes: cipher.length,
      printedOneRuneWords: singletons.length,
      firstFourIndependentCribs: reports[0].firstFourIndependent,
      untouchedHeldoutCribs: singletons.length - 4,
      fullStateSpacePerModel: 29 ** 4,
      admissibleAfterFourCribsPerModel: 3 ** 4,
      models: reports },
    positiveControl: positive(),
    conclusion: "No initial 4D state for any of eight source-natural public operators decodes all original one-rune printed words as A/I/O. No unknown plaintext or key recovered.",
    limitations: "Only this one per-four-rune additive stream with a shared chapter state and native GP-English words. Does not exclude per-page resets, nonlinear consumers, other clocks, or encrypted/binary prose."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, search, streamRows, inverse4, printedWords};
