"use strict";

/**
 * SFT: exact all-secret test of a cubic GP29 ciphertext-feedback cipher.
 *
 * Candidate, independently of any private shift k_w:
 *   C[w, j] = C[w, j-1] + (P[w, j] + k_w)^3 (mod 29),
 *   C[w, -1] = 0, with a separate k_w in 0..28 for every printed word.
 *
 * Since 3*19 = 57 = 1 (mod 28), the GP29 cube has an exact inverse.
 * Thus Q[w,j] = (C[w,j]-C[w,j-1])^19 = P[w,j]+k_w,
 * and Q[w,j]-Q[w,j-1] = P[w,j]-P[w,j-1] regardless of k_w.
 * Every statistic below is invariant across ALL 29^2896 hidden shifts.
 *
 * Run from repository root with Node.js 22: node sims/lp2_cube_feedback_wordshift_allsecret_sft.cjs
 * Reads only pinned repository files, writes nothing. All source files remain unchanged.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const TRANS = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
  "A", "AE", "Y", "IA", "EA"];
const RUNE_INDEX = new Map(RUNES.map((r, i) => [r, i]));
const LATIN_INDEX = new Map(TRANS.map((r, i) => [r, i]));
const SPELLINGS = ["ING", "TH", "EO", "OE", "AE", "IA", "EA", "IO", "NG"];
const CUBES = Array.from({ length: MOD }, (_, i) => i * i * i % MOD);
const ROOTS = new Array(MOD);
CUBES.forEach((v, i) => { ROOTS[v] = i; });
assert.equal(new Set(CUBES).size, MOD, "Cubing must be a permutation of GF(29)");

/** @param {string} location Repository-relative input path. */
function read(location) {
  return fs.readFileSync(path.join(ROOT, location), "utf8");
}

/**
 * Parse complete original rune words. '%' advances the rune-bearing page,
 * but does NOT terminate a word carried across that physical page boundary.
 * @param {string} text Canonical rune transcription.
 * @returns {Array<{runes:number[], start:number, end:number}>}
 */
function runeWords(text) {
  const words = [];
  let word = [];
  let page = 0;
  let start = 0;
  let end = 0;
  function finish() {
    if (word.length) words.push({ runes: word, start, end });
    word = [];
  }
  for (const ch of text) {
    const rune = RUNE_INDEX.get(ch);
    if (rune !== undefined) {
      if (!word.length) start = page;
      word.push(rune);
      end = page;
    } else if (ch === "%") {
      page++;
    } else if (!"/ \t\r\n".includes(ch)) {
      finish();
    }
  }
  finish();
  return words;
}

/**
 * Convert public-domain English to the attested GP29 digraph convention.
 * Preserve supplied word boundaries, ING->NG, IO->IA, QU->CW,
 * and the source's C/U/S equivalents of Q/K, V, Z.
 * @param {string} source Original English text.
 * @returns {Array<{runes:number[]}>}
 */
function englishWords(source) {
  const words = [];
  for (const match of source.match(/[A-Za-z]+/g) || []) {
    const spelling = match.toUpperCase().replace(/QU/g, "CW")
      .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const runes = [];
    for (let j = 0; j < spelling.length;) {
      const piece = SPELLINGS.find((p) => spelling.startsWith(p, j)) || spelling[j];
      const index = LATIN_INDEX.get(piece === "ING" ? "NG" : piece === "IO" ? "IA" : piece);
      assert.notEqual(index, undefined, "Unknown GP rune for " + piece);
      runes.push(index);
      j += piece.length;
    }
    words.push({ runes });
  }
  return words;
}

/** @param {number} a Canonical representative in 0..28. */
function root(a) {
  return ROOTS[a];
}

/** @param {number[]} cipher One complete original word. */
function peel(cipher) {
  return cipher.map((c, j) => root((c - (j ? cipher[j - 1] : 0) + MOD) % MOD));
}

/**
 * @param {number[]} plain Native-GP source word.
 * @param {number} shift Private whole-word shift.
 */
function encryptWord(plain, shift) {
  const output = [];
  let previous = 0;
  for (const p of plain) {
    const q = (p + shift) % MOD;
    previous = (CUBES[q] + previous) % MOD;
    output.push(previous);
  }
  return output;
}

/**
 * @param {Array<{runes:number[]}>} words Words with exact original boundaries.
 * @param {boolean} ciphertext True for original ciphertext to cube-peel.
 * @returns {number[]} GF29 within-word consecutive-difference histogram.
 */
function differences(words, ciphertext) {
  const hist = new Array(MOD).fill(0);
  for (const word of words) {
    const seq = ciphertext ? peel(word.runes) : word.runes;
    for (let j = 1; j < seq.length; j++) {
      hist[(seq[j] - seq[j - 1] + MOD) % MOD]++;
    }
  }
  return hist;
}

/** @param {number[]} h Histogram, positive total. */
function count(h) {
  return h.reduce((sum, n) => sum + n, 0);
}

/**
 * Compare source histogram to a FIXED native-GP English author baseline.
 * @param {number[]} observed Source-exact 29-bin count.
 * @param {number[]} base Native-author 29-bin count.
 */
function chiSquare(observed, base) {
  const n = count(observed);
  const total = count(base);
  return observed.reduce((chi, actual, i) => {
    const expected = base[i] * n / total;
    return chi + (actual - expected) ** 2 / expected;
  }, 0);
}

/** @returns {() => number} Fixed-seed xorshift32 for matched controls. */
function rng() {
  let state = 0x33011033;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {Array<{runes:number[]}>} book Independent source-native English.
 * @returns {Map<number, Array<{runes:number[]}>>} Words grouped by exact rune length.
 */
function poolsByLength(book) {
  const pool = new Map();
  for (const word of book) {
    const len = word.runes.length;
    if (!pool.has(len)) pool.set(len, []);
    pool.get(len).push(word);
  }
  return pool;
}

/**
 * Return exactly original-word-length-matched independently authored samples.
 * The reference language model and sampling convention never use ciphertext
 * values. This test retains archive headers, which are part of the fixed files.
 * @param {Array<{runes:number[]}>} original Original words.
 * @param {Map<number, Array<{runes:number[]}>>} pools Native word-length pools.
 * @param {() => number} random Deterministic RNG.
 */
function matched(original, pools, random) {
  return original.map((word) => {
    const pool = pools.get(word.runes.length);
    assert.ok(pool && pool.length, "Missing native word length " + word.runes.length);
    return pool[random() % pool.length];
  });
}

const original = runeWords(read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%"));
assert.equal(original.length, 2896);
assert.equal(original.reduce((n, word) => n + word.runes.length, 0), 12956);

const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%");
const genuinelyPrintedGP = runeWords([3, 8, 9, 10, 11, 14].map((i) => lp1[i]).join("&"));
assert.equal(genuinelyPrintedGP.reduce((n, word) => n + word.runes.length, 0), 1001);

const parable = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim();
const printedParable = JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .pages.find((p) => p.page === 57).indices;
assert.deepEqual(englishWords(parable).flatMap((w) => w.runes), printedParable,
  "Authorial cleartext spelling control must reproduce all 95 original p57 runes");

const train = original.filter((w) => w.start >= 16 && w.end <= 21);
const holdout = original.filter((w) => w.start >= 40 && w.end <= 45);
assert.equal(train.length, 372);
assert.equal(holdout.length, 349);
assert.equal(train.reduce((n, w) => n + w.runes.length, 0), 1605);
assert.equal(holdout.reduce((n, w) => n + w.runes.length, 0), 1591);
const regions = { "p16-p21": train, "p40-p45": holdout };
const books = {
  Gibran: englishWords(read("resources/control/gibran_prophet_58585.txt")),
  Shakespeare: englishWords(read("resources/control/shakespeare_first300k.txt")),
  Emerson: englishWords(read("resources/control/emerson_essays_2944.txt"))
};
const random = rng();

for (const [name, originalWords] of Object.entries(regions)) {
  const observed = differences(originalWords, true);
  console.log(name, "printed words", originalWords.length, "runes",
    originalWords.reduce((n, w) => n + w.runes.length, 0),
    "within-word pairs", count(observed));
  for (const [author, book] of Object.entries(books)) {
    const baseline = differences(book, false);
    const pools = poolsByLength(book);
    const actual = chiSquare(observed, baseline);
    const simulated = [];
    for (let repeat = 0; repeat < 240; repeat++) {
      const plain = matched(originalWords, pools, random);
      simulated.push(chiSquare(differences(plain, false), baseline));
    }
    simulated.sort((a, b) => a - b);
    assert.ok(actual > simulated[239],
      author + " matched author-native controls must not resemble original ciphertext");
    console.log(" ", author, "original chi-square", actual.toFixed(4),
      "matched-native min/median/max",
      [simulated[0], simulated[119], simulated[239]].map((v) => v.toFixed(4)).join("/"),
      "above-source", simulated.filter((v) => v >= actual).length, "/240");
  }
}

/* Fully reversible planted text with 29 independent per-word secret values. */
for (const [name, originalWords] of Object.entries(regions)) {
  const source = books.Shakespeare;
  const pools = poolsByLength(source);
  const plain = matched(originalWords, pools, random);
  const secret = plain.map(() => random() % MOD);
  const ciphertext = plain.map((word, j) => encryptWord(word.runes, secret[j]));
  const reconstructed = ciphertext.map((word) => peel(word));
  for (let j = 0; j < plain.length; j++) {
    const key = (reconstructed[j][0] - plain[j].runes[0] + MOD) % MOD;
    assert.equal(key, secret[j]);
    assert.deepEqual(reconstructed[j],
      plain[j].runes.map((p) => (p + key) % MOD));
    assert.deepEqual(encryptWord(plain[j].runes, key), ciphertext[j]);
  }
  const plant = ciphertext.map((runes) => ({ runes }));
  assert.deepEqual(differences(plant, true), differences(plain, false));
  console.log("PLANT", name, "fully recovered", plain.reduce((n, w) => n + w.runes.length, 0),
    "native GP runes and", plain.length, "private word shifts with exact reencryption");
}
console.log("PASS: no per-word secret shifts recover source-native prose under the fixed cubed feedback inverse.");
