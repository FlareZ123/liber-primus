"use strict";

/**
 * Exact original-cipher upper bounds for a stationary previous-C GP29
 * substitution transducer, allowing all secret 29-symbol alphabets.
 *
 * For every physical page and every rune position i>0:
 *   C[i] = sigma[chapter][C[i-1]][P[i]]
 * where each sigma is ANY bijection of 29 symbols; 'chapter' may be
 * replaced by one constant global table. Page starts are unrestricted.
 *
 * For a fixed set of k plaintext runes, each previous-C row can emit
 * those k plaintext symbols on at most its k largest observed outgoing
 * ciphertext counts. Sum the row maxima over the source tables. This is
 * independent of the 29! secrets and is exact for the stated model.
 *
 * The first rune on every page is unconstrained, so all 55 such runes
 * are added to upper bounds. English comparisons are finite calibration
 * for source-native text, not a proof of its identity with LP2 plaintext.
 *
 * Read-only Node 22 CommonJS, Windows compatible. No workflow required.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const CHAPTER_ENDS = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const TOTAL = 12956;
const STARTS = 55;
const K_VALUES = [1, 2, 3, 4];

assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), TOTAL);
assert.equal(gp.pages[50].indices.length, 0);

/** @returns {number[][]} */
function matrix() {
  return Array.from({length: 29}, () => Array(29).fill(0));
}

/**
 * @param {"global"|"chapter"|"page"} mode
 * @returns {{tables:Map<string,number[][]>, edges:number}}
 */
function transitions(mode) {
  const tables = new Map();
  let offset = 0, edges = 0;
  for (const p of pages) {
    for (let i = 1; i < p.indices.length; i++) {
      const ch = CHAPTER_ENDS.findIndex(end => offset + i < end);
      assert(ch >= 0);
      const key = mode === "global" ? "all"
        : mode === "chapter" ? String(ch) : String(p.page);
      if (!tables.has(key)) tables.set(key, matrix());
      tables.get(key)[p.indices[i - 1]][p.indices[i]]++;
      edges++;
    }
    offset += p.indices.length;
  }
  assert.equal(edges, TOTAL - STARTS);
  return {tables, edges};
}

/**
 * Exact universal upper bound for the sum of occurrences of ANY chosen
 * set of k plaintext runes under arbitrary secret row permutations.
 * @param {Map<string,number[][]>} tables
 * @param {number} k
 * @returns {number}
 */
function upper(tables, k) {
  let sum = 0;
  for (const m of tables.values()) for (const row of m) {
    const ordered = row.slice().sort((a, b) => b - a);
    for (let i = 0; i < k; i++) sum += ordered[i];
  }
  return sum;
}

/**
 * Source-native GP spelling, independently attested by the solved LP1
 * and p57, including ING and IO composite rune conventions.
 * @param {string} text
 * @returns {number[]}
 */
function encodeNative(text) {
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21); i += 3;
      } else if (word.startsWith("IO", i)) {
        out.push(27); i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "GP source spelling missing: " + word);
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

/**
 * @param {number[]} tape
 * @param {number} k
 * @returns {number}
 */
function topK(tape, k) {
  const counts = Array(29).fill(0);
  for (const c of tape) counts[c]++;
  return counts.sort((a, b) => b - a)
    .slice(0, k).reduce((a, b) => a + b, 0);
}

const pooled = transitions("global");
const chapters = transitions("chapter");
const perPage = transitions("page");
const bounds = K_VALUES.map(k => ({
  k,
  global: upper(pooled.tables, k),
  chapter: upper(chapters.tables, k),
  page: upper(perPage.tables, k)
}));
assert.deepEqual(bounds.map(b => b.global), [714, 1359, 1971, 2564]);
assert.deepEqual(bounds.map(b => b.chapter), [1255, 2289, 3203, 4042]);
assert.equal(bounds[0].page, 2735);

const all = pooled.tables.get("all");
const offDiagonal = all.flatMap((row, i) => row.filter((_, j) => j !== i));
assert.equal(offDiagonal.length, 812);
assert.equal(Math.min(...offDiagonal), 5);
const chapter8 = chapters.tables.get("7");
const successors = chapter8.map(row => row.filter(x => x > 0).length);
assert.equal(Math.min(...successors), 25);
assert.equal(Math.max(...successors), 29);

/** Fixed finite control windows, 12956 runes each, step 1703. */
const controls = [
  ["Gibran", read("resources/control/gibran_prophet_58585.txt")],
  ["Shakespeare", read("resources/control/shakespeare_first300k.txt")]
];
let countWindows = 0;
for (const [name, source] of controls) {
  const tape = encodeNative(source);
  const whole = K_VALUES.map(k => topK(tape, k) / tape.length);
  const minima = K_VALUES.map(() => 1);
  let windows = 0;
  for (let start = 0; start + TOTAL <= tape.length; start += 1703) {
    const sample = tape.slice(start, start + TOTAL);
    for (let i = 0; i < K_VALUES.length; i++) {
      const k = K_VALUES[i], actual = topK(sample, k);
      const allowed = bounds[i].chapter + STARTS;
      assert(actual > allowed, name + " control window failed k=" + k);
      minima[i] = Math.min(minima[i], actual / TOTAL);
    }
    windows++;
  }
  assert(windows > 0);
  countWindows += windows;
  console.log("CONTROL", name, "runes", tape.length, "windows", windows,
    "whole_top4", whole, "minimum_window_top4", minima);
}
assert.equal(countWindows, 150);

const reference = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/### \d+\n/).slice(1).join(" ");
const solved = encodeNative(reference);
assert.equal(solved.length, 3510);
for (let i = 0; i < K_VALUES.length; i++) {
  assert(topK(solved, K_VALUES[i]) / solved.length >
    (bounds[i].chapter + STARTS) / TOTAL);
}

/**
 * Planted original-page-shaped cipher, with new secret alphabets chosen by
 * previous ciphertext rune and optionally by original visual chapter.
 * @param {"global"|"chapter"} mode
 * @param {number[]} plaintext
 * @returns {{cipher:number[],decoded:number[]}}
 */
function plant(mode, plaintext) {
  let seed = mode === "global" ? 0x33015131 : 0x33015331;
  /** @returns {number} */
  function random29() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % 29;
  }
  const sets = mode === "global" ? 1 : 9;
  const maps = Array.from({length:sets}, () =>
    Array.from({length:29}, () => {
      const perm = Array.from({length:29}, (_, i) => i);
      for (let i = 28; i > 0; i--) {
        const j = random29() % (i + 1);
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
      return perm;
    }));
  const inverse = maps.map(set => set.map(perm => {
    const inv = Array(29);
    perm.forEach((c, i) => {inv[c] = i;});
    return inv;
  }));
  const cipher = [], decoded = [];
  let offset = 0;
  for (const page of pages) {
    const first = plaintext[offset];
    const initial = (first + random29()) % 29;
    cipher.push(initial);
    decoded.push(first);
    for (let i = 1; i < page.indices.length; i++) {
      const originalPos = offset + i;
      const ch = mode === "global" ? 0
        : CHAPTER_ENDS.findIndex(end => originalPos < end);
      const predecessor = cipher[originalPos - 1];
      const emitted = maps[ch][predecessor][plaintext[originalPos]];
      cipher.push(emitted);
      decoded.push(inverse[ch][predecessor][emitted]);
    }
    offset += page.indices.length;
  }
  return {cipher, decoded};
}

const plantPlain = encodeNative(controls[0][1]).slice(0, TOTAL);
for (const mode of ["global", "chapter"]) {
  const {cipher, decoded} = plant(mode, plantPlain);
  assert.deepEqual(decoded, plantPlain, "planted secret inverse: " + mode);
  const plantPages = [];
  let cursor = 0;
  for (const p of pages) {
    plantPages.push({page:p.page, indices:cipher.slice(cursor, cursor + p.indices.length)});
    cursor += p.indices.length;
  }
  const tables = new Map();
  let shift = 0;
  for (const p of plantPages) {
    for (let i = 1; i < p.indices.length; i++) {
      const pos = shift + i;
      const ch = mode === "global" ? 0 : CHAPTER_ENDS.findIndex(end => pos < end);
      const key = String(ch);
      if (!tables.has(key)) tables.set(key, matrix());
      tables.get(key)[p.indices[i - 1]][p.indices[i]]++;
    }
    shift += p.indices.length;
  }
  for (const k of K_VALUES) {
    assert(topK(plantPlain, k) <= upper(tables, k) + STARTS,
      "necessary bound must pass genuine encrypted plant: " + mode);
  }
  console.log("PLANTED PASS", mode, "runes", decoded.length);
}

console.log("ORIGINAL", "edges", pooled.edges, "page_heads", STARTS,
  "offdiag_min", Math.min(...offDiagonal),
  "chapter8_successor_min", Math.min(...successors));
for (const b of bounds) console.log("BOUND", b.k,
  "global", b.global, "chapter", b.chapter, "page", b.page,
  "chapter_with_heads_fraction", (b.chapter + STARTS) / TOTAL);
console.log("PASS: exact key-independent first-order quasigroup exclusion",
  "for tested source-native English controls; no unknown plaintext claimed");
