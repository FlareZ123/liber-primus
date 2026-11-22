"use strict";
/**
 * Exact equality test for arbitrary secret GP29 permutations indexed by the
 * previous TWO published ciphertext runes, optionally with a public page
 * phase. Source-normalized direct-GP controls preserve every original LP2
 * word length and physical rune-page length. Run: node sims/two_register_public_row_invariant.cjs
 *
 * The per-state equality relation is unchanged by EVERY secret permutation;
 * sampled native-text plants show statistical power, not logical exclusion
 * of all conceivable adversarial plaintexts. This is NOT a recovered cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const originalText = read("resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(originalText);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
const lengths = parseSharedCorpus().words.map(w => w.length);
const MOD = 29, ROWS = MOD * MOD, EA = 28;
const MODELS = [{phases: 1, trials: 100},
  {phases: 8, trials: 75}, {phases: 16, trials: 75}];
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.length, 0), 12956);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((s, v) => s + v, 0), 12956);

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let v = seed >>> 0;
  return () => {
    v ^= v << 13;
    v ^= v >>> 17;
    v ^= v << 5;
    return v >>> 0;
  };
}

/** @param {string} text @returns {number[][]} */
function gpWords(text) {
  const lookup = new Map(corpus.translit.map((s, i) => [s, i]));
  lookup.set("ING", 21);
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(token => {
    const s = token.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const w = [];
    for (let i = 0; i < s.length;) {
      let match;
      for (const width of [3, 2, 1]) {
        const value = lookup.get(s.slice(i, i + width));
        if (value !== undefined) {
          match = {width, value};
          break;
        }
      }
      assert(match !== undefined, "Source encoding failed at " + token);
      w.push(match.value);
      i += match.width;
    }
    return w;
  });
}

/** @param {number[][]} words @returns {Map<number,number[][]>} */
function byLength(words) {
  const grouped = new Map();
  for (const word of words) {
    if (!grouped.has(word.length)) grouped.set(word.length, []);
    grouped.get(word.length).push(word);
  }
  for (const len of lengths) assert(grouped.has(len), "Missing word length " + len);
  return grouped;
}

/**
 * Match all 2,896 published word lengths without clipping a GP letter.
 * @param {Map<number,number[][]>} groups
 * @param {number} seed
 * @returns {number[][]}
 */
function samplePages(groups, seed) {
  const random = random32(seed), runes = [];
  for (const len of lengths) {
    const words = groups.get(len);
    runes.push(...words[random() % words.length]);
  }
  assert.equal(runes.length, 12956);
  let at = 0;
  return pages.map(page => {
    const out = runes.slice(at, at + page.length);
    at += page.length;
    return out;
  });
}

/**
 * One completely independent, fixed secret permutation for each
 * (page phase, C[i-2], C[i-1]). GP EA maps to C[i-1] to retain exact
 * transparent repeat semantics; all 28 alternatives are freely shuffled.
 * This restriction is used for source-native plants, but the collision
 * invariant covers ALL 29! row bijections even without this restriction.
 *
 * @param {number} phases
 * @param {number} seed
 */
function makeTables(phases, seed) {
  const random = random32(seed), size = phases * ROWS * MOD;
  const enc = new Uint8Array(size), dec = new Uint8Array(size);
  for (let row = 0; row < phases * ROWS; row++) {
    const previous = row % MOD;
    const alt = Array.from({length: MOD}, (_, i) => i)
      .filter(value => value !== previous);
    for (let i = 27; i > 0; i--) {
      const j = random() % (i + 1);
      [alt[i], alt[j]] = [alt[j], alt[i]];
    }
    const offset = row * MOD;
    for (let i = 0; i < 28; i++) enc[offset + i] = alt[i];
    enc[offset + EA] = previous;
    for (let i = 0; i < MOD; i++) dec[offset + enc[offset + i]] = i;
  }
  return {enc, dec};
}

/**
 * A public source page clock; the first TWO ciphertext symbols on every
 * physical rune-bearing page are transmitted seeds.
 * @param {number[][]} input
 * @param {{enc:Uint8Array,dec:Uint8Array}} tables
 * @param {number} phases
 * @param {"enc"|"dec"} direction
 * @returns {number[][]}
 */
function transform(input, tables, phases, direction) {
  return input.map(page => {
    const out = page.slice(0, 2);
    for (let i = 2; i < page.length; i++) {
      const previous2 = direction === "enc" ? out[i - 2] : page[i - 2];
      const previous1 = direction === "enc" ? out[i - 1] : page[i - 1];
      const row = (i % phases) * ROWS + previous2 * MOD + previous1;
      out.push(tables[direction][row * MOD + page[i]]);
    }
    return out;
  });
}

/**
 * Exact secret-key-invariant count for any fixed ciphertext; within a state
 * row, two equal outputs imply two equal plaintext inputs, regardless of
 * the unknown bijection. Count unordered equal pairs / all row pairs.
 * @param {number[][]} ciphertext
 * @param {number} phases
 */
function conditionalCollision(ciphertext, phases) {
  const histogram = new Uint16Array(phases * ROWS * MOD);
  const totals = new Uint16Array(phases * ROWS);
  let matching = 0, eligible = 0, doublets = 0, transitions = 0;
  for (const page of ciphertext) {
    for (let i = 2; i < page.length; i++) {
      const row = (i % phases) * ROWS + page[i - 2] * MOD + page[i - 1];
      const value = page[i];
      matching += histogram[row * MOD + value]++;
      eligible += totals[row]++;
      doublets += Number(value === page[i - 1]);
      transitions++;
    }
  }
  return {matching, eligible, rate: matching / eligible,
    doublets, transitions};
}

/** @param {number[]} values @param {number} original */
function range(values, original) {
  const sorted = values.slice().sort((a, b) => a - b);
  const lowerOrEqual = values.filter(v => v <= original).length;
  return {
    n: values.length, min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted.at(-1), lowerOrEqual,
    lowerTailAddOne: (lowerOrEqual + 1) / (values.length + 1)
  };
}

function run() {
  const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split(/\r?\n/u).filter(line => {
      const s = line.trim();
      return s && !s.startsWith("#") && !s.startsWith("[")
        && !/^[0-9a-f]{25,}$/iu.test(s);
    }).join(" ");
  const sources = {
    "solved-Cicada": byLength(gpWords(lp1)),
    "Shakespeare": byLength(gpWords(read("resources/control/shakespeare_first300k.txt")))
  };
  const results = {};
  for (const {phases, trials} of MODELS) {
    const original = conditionalCollision(pages, phases);
    const controls = {};
    for (const [name, source] of Object.entries(sources)) {
      const rates = [], repeated = [];
      for (let trial = 0; trial < trials; trial++) {
        const plaintext = samplePages(source, 0x5ac00000 + trial * 47);
        const tables = makeTables(phases, 0x5aa00000 + trial * 113);
        const ciphertext = transform(plaintext, tables, phases, "enc");
        const decoded = transform(ciphertext, tables, phases, "dec");
        assert.deepEqual(decoded, plaintext, "Synthetic full decryption failed");
        assert.deepEqual(transform(decoded, tables, phases, "enc"), ciphertext,
          "Synthetic reencryption failed");
        const statistic = conditionalCollision(ciphertext, phases);
        rates.push(statistic.rate);
        repeated.push(statistic.doublets);
      }
      controls[name] = {
        collision: range(rates, original.rate),
        repeated: range(repeated, original.doublets)
      };
    }
    results["phase" + phases] = {original, controls};
  }
  assert.equal(results.phase1.original.matching, 3511);
  assert.equal(results.phase1.original.eligible, 100584);
  assert.equal(results.phase1.original.doublets, 85);
  assert.equal(results.phase1.original.transitions, 12846);
  return {
    sourceSHA256: crypto.createHash("sha256").update(originalText).digest("hex"),
    hypothesis: "public page-clock and two preceding ciphertext runes select an independently secret GP29 permutation row; optional transparent EA repeat",
    status: "conditional source-native statistical exclusion, no genuine plaintext",
    wordLengths: lengths.length,
    originalRunes: pages.reduce((s, p) => s + p.length, 0),
    models: results
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {gpWords, makeTables, transform, conditionalCollision, run};
