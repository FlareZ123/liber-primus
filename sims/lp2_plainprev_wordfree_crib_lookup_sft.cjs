"use strict";

/**
 * Word-boundary-free, exact-key lookup for known-text LP2 crib recovery.
 *
 * Test two reversible GP29 plaintext-predecessor ciphers while allowing the
 * shared 29-entry key table and every page/alignment initial symbol to be
 * entirely unknown. Literal source passages are looked up at every within-page
 * ciphertext start without relying on printed source word separators.
 *
 * No dictionary, guessed key, language-score threshold, or source text is
 * fitted to the original. Six same-predecessor algebraic equalities restrict
 * candidate alignments before a complete exact-key-consistency check.
 *
 * SFT: node sims/lp2_plainprev_wordfree_crib_lookup_sft.cjs
 * Node 22; read-only; Windows 11/Windows Server compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

const runeTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const gpRunes = values => Array.from(values, i => gp.runes[i]).join("");

/**
 * Period-authentic English GP spelling, including original LP1 ING and IO.
 * @param {string} text
 * @returns {Uint8Array}
 */
function encodeEnglish(text) {
  const normal = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of normal.match(/[A-Z]+/g) || []) {
    for (let k = 0; k < word.length;) {
      if (word.startsWith("ING", k)) {
        output.push(21);
        k += 3;
      } else if (word.startsWith("IO", k)) {
        output.push(27);
        k += 2;
      } else {
        const token = runeTokens.find(t => word.startsWith(t.s, k));
        assert(token, "unencodable source GP word: " + word);
        output.push(token.i);
        k += token.s.length;
      }
    }
  }
  return Uint8Array.from(output);
}
assert.equal(gpRunes(encodeEnglish("FOLLOWING")), "ᚠᚩᛚᛚᚩᚹᛝ");
assert.equal(gpRunes(encodeEnglish("FUNCTION")), "ᚠᚢᚾᚳᛏᛡᚾ");

const PAGE = new Uint8Array(12956);
const END = new Uint32Array(12956);
const original = new Uint8Array(12956);
let nextPage = 0;
for (const p of pages) {
  original.set(p.indices, nextPage);
  for (let k = nextPage; k < nextPage + p.indices.length; k++) {
    PAGE[k] = p.page;
    END[k] = nextPage + p.indices.length;
  }
  nextPage += p.indices.length;
}
assert.equal(nextPage, original.length);

const LOOKAHEAD = 40;
const MARKS = 6;
const validStarts = Array.from({length: original.length}, (_, i) => i)
  .filter(i => END[i] - i >= LOOKAHEAD);
const bookStarts = Array.from({length: original.length - LOOKAHEAD + 1},
  (_, i) => i);
const mod = x => (x % 29 + 29) % 29;

/**
 * Obtain six source-predicted, key-independent equations:
 * when P[i-1]=P[j-1], then T[i]-T[j]=P[i]-P[j] modulo29,
 * with T=C for direct substitution or T=delta(C) for integrator.
 *
 * @param {Uint8Array} plain
 * @param {number} start
 * @returns {Array<[number,number,number]>}
 */
function witnesses(plain, start) {
  const first = new Int8Array(29);
  first.fill(-1);
  const constraints = [];
  for (let i = 1; i <= LOOKAHEAD && constraints.length < MARKS; i++) {
    const predictor = plain[start + i - 1];
    if (first[predictor] === -1) {
      first[predictor] = i;
    } else {
      const j = first[predictor];
      constraints.push([j, i, mod(plain[start + j] - plain[start + i])]);
    }
  }
  return constraints;
}

/**
 * Exact feasible plaintext prefix from completely unrestricted table f.
 * Direct: C[i] = P[i] + f(P[i-1]).
 * Integrator: C[i] = C[i-1] + P[i] - f(P[i-1]).
 *
 * @param {Uint8Array} cipher
 * @param {Uint8Array} plain
 * @param {number} t
 * @param {number} s
 * @param {number} mode
 */
function exactPrefix(cipher, plain, t, s, mode, continuous = false) {
  const seen = new Int8Array(29);
  seen.fill(-1);
  let duplicateChecks = 0;
  let assigned = 0;
  const n = Math.min((continuous ? cipher.length : END[t]) - t,
    plain.length - s);
  let k = 1;
  for (; k < n; k++) {
    const predictor = plain[s + k - 1];
    const current = plain[s + k];
    const value = mode === 0
      ? mod(cipher[t + k] - current)
      : mod(current - cipher[t + k] + cipher[t + k - 1]);
    if (seen[predictor] !== -1) {
      if (seen[predictor] !== value) break;
      duplicateChecks++;
    } else {
      seen[predictor] = value;
      assigned++;
    }
  }
  return {length: k, assigned, duplicateChecks};
}

/**
 * @param {Uint8Array} cipher
 * @param {number} mode
 */
function targetArray(cipher, mode, continuous = false) {
  const delta = new Uint8Array(cipher.length);
  if (mode === 0) return cipher;
  if (continuous) {
    for (let i = 1; i < cipher.length; i++)
      delta[i] = mod(cipher[i] - cipher[i - 1]);
    return delta;
  }
  let prevEnd = 0;
  for (const p of pages) {
    for (let i = prevEnd + 1; i < prevEnd + p.indices.length; i++) {
      delta[i] = mod(cipher[i] - cipher[i - 1]);
    }
    prevEnd += p.indices.length;
  }
  return delta;
}

/**
 * Sparse first-witness inverted index. The indexes are reset between
 * cipher modes and target data. Original input is never modified.
 *
 * @param {Uint8Array} cipher
 * @param {number} mode
 */
function indexFor(cipher, mode, continuous = false) {
  const T = targetArray(cipher, mode, continuous);
  const starts = continuous ? bookStarts : validStarts;
  const cache = new Map();
  function firstWitness(i, j, d) {
    const key = ((i * 64 + j) * 29 + d);
    const found = cache.get(key);
    if (found) return found;
    const choices = [];
    for (const t of starts) {
      if (mod(T[t + i] - T[t + j]) === d) choices.push(t);
    }
    cache.set(key, choices);
    return choices;
  }
  return {T, cache, firstWitness};
}

/**
 * @param {Uint8Array} cipher
 * @param {Uint8Array} reference
 * @param {number} mode
 * @param {number} [onlyStart]
 */
function scan(cipher, reference, mode, onlyStart, continuous = false) {
  const index = indexFor(cipher, mode, continuous);
  let looked = 0, skipped = 0, anchored = 0, sixPass = 0;
  let valid40 = 0;
  const best = [];
  const start = onlyStart ?? 0;
  const limit = onlyStart === undefined
    ? reference.length - LOOKAHEAD
    : onlyStart + 1;
  for (let s = start; s < limit; s++) {
    const eq = witnesses(reference, s);
    if (eq.length < MARKS) { skipped++; continue; }
    looked++;
    const [i0, j0, d0] = eq[0];
    const anchors = index.firstWitness(i0, j0, d0);
    for (const t of anchors) {
      anchored++;
      let okay = true;
      for (let q = 1; q < MARKS; q++) {
        const [i, j, d] = eq[q];
        if (mod(index.T[t + i] - index.T[t + j]) !== d) {
          okay = false;
          break;
        }
      }
      if (!okay) continue;
      sixPass++;
      const result = exactPrefix(cipher, reference, t, s, mode, continuous);
      if (result.length >= LOOKAHEAD) valid40++;
      const record = {page: PAGE[t], globalCipherOffset: t,
        sourceRuneOffset: s, runes: result.length,
        tableEntries: result.assigned,
        repeatedEntryChecks: result.duplicateChecks};
      if (best.length < 5 || result.length > best[best.length - 1].runes) {
        best.push(record);
        best.sort((a, b) => b.runes - a.runes);
        best.length = Math.min(5, best.length);
      }
    }
  }
  return {models: mode === 0 ? "direct" : "integrated",
    cipherClock: continuous ? "book-continuous" : "page-contained",
    originalTargets: continuous ? bookStarts.length : validStarts.length,
    sourceRunes: reference.length,
    scannedSourceStarts: looked,
    sixWitnessUnavailable: skipped,
    uniqueFirstWitnesses: index.cache.size,
    firstWitnessCandidates: anchored,
    sixWitnessCandidates: sixPass,
    exactConsistent40Plus: valid40, top: best};
}

const donors = [
  ["Blake Song of Liberty", "resources/control/blake_song_of_liberty_train.txt",
    text => text.split("BEGIN SOURCE TEXT")[1] || text],
  ["Blake Marriage Heaven and Hell 1906", "resources/external/blake-marriage-1906-gutenberg45315.txt",
    text => text],
  ["Crowley Book of Law I", "resources/external/2013-book-of-law-I.txt",
    text => text],
  ["Crowley Book of Law II", "resources/external/2013-book-of-law-II.txt",
    text => text],
  ["Crowley Book of Law III", "resources/external/2013-book-of-law-III.txt",
    text => text],
  ["Gibran The Prophet", "resources/control/gibran_prophet_58585.txt",
    text => text],
  ["Emerson Essays", "resources/control/emerson_essays_2944.txt",
    text => text],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt",
    text => text],
  ["Solved Cicada pages, editorial", "resources/liber-primus/lp1-plaintext-reference.txt",
    text => text.split(/\n### \d+\n/).slice(1).join("\n")
      .split("\n").filter(line => !line.startsWith("[")
        && !/^\s*[\d\s]+$/.test(line)
        && !/^\s*CONTINUED/i.test(line)).join(" ")]
];

/** Exact original-GP reference registers avoiding invented Latin spelling. */
const nativeSources = [
  ["Old English Beowulf, original GP", () => {
    const source = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
    const alphabet = new Map([...source.positiveControlAlphabet]
      .map((ch, i) => [ch, i]));
    const sequence = Uint8Array.from([...source.sourceGpBase29],
      ch => alphabet.get(ch));
    assert.equal(sequence.length, source.allSourceGpRunes);
    return sequence;
  }],
  ["Latin Vulgate, original wordwise GP", () => {
    const alphabet = new Map([..."0123456789ABCDEFGHIJKLMNOPQRS"]
      .map((ch, i) => [ch, i]));
    const words = read("resources/control/latin-vulgate-gp-wholewords.txt")
      .split(/\r?\n/).map(line => line.trim())
      .filter(line => /^[0-9A-S]+$/.test(line));
    assert.equal(words.length, 39835);
    return Uint8Array.from([...words.join("")], ch => alphabet.get(ch));
  }],
  ["Solved LP1 authentic runes", () => {
    const alphabet = new Map(gp.runes.map((ch, i) => [ch, i]));
    return Uint8Array.from(read("resources/transcriptions/lp1_wulfic_canonical.txt")
      .match(/[\u16A0-\u16FF]/gu) || [], ch => alphabet.get(ch));
  }],
  ["Solved LP2 p57 authentic runes", () => Uint8Array.from(gp.pages[57].indices)]
];

function main() {
  const originalReference = encodeEnglish(read(donors.find(([name]) => name === "Gibran The Prophet")[1]));
  assert.equal(originalReference.length, 62492);
  const plantOffset = 11111;
  const plantPlain = originalReference.subarray(
    plantOffset, plantOffset + pages[0].indices.length);
  const f = Array.from({length:29}, (_, x) => mod(x * x + 7 * x + 11));
  const positive = [];
  for (let mode = 0; mode < 2; mode++) {
    const planted = Uint8Array.from(original);
    planted[0] = 17;
    for (let i = 1; i < plantPlain.length; i++) {
      planted[i] = mode === 0
        ? mod(plantPlain[i] + f[plantPlain[i - 1]])
        : mod(planted[i - 1] + plantPlain[i] - f[plantPlain[i - 1]]);
    }
    const result = scan(planted, originalReference, mode, plantOffset);
    assert.equal(result.top[0]?.runes, plantPlain.length,
      "key-free sparse-index plant should recover every seeded rune");
    positive.push({mode, recovered: result.top[0].runes,
      sourceOffset: result.top[0].sourceRuneOffset});
  }

  const output = [];
  for (const [name, filename, preprocessing] of donors) {
    const reference = encodeEnglish(preprocessing(read(filename)));
    assert(reference.length > LOOKAHEAD, name + ": source empty");
    for (const reversed of [false, true]) {
      const sample = reversed ? Uint8Array.from(reference).reverse() : reference;
      for (let mode = 0; mode < 2; mode++) {
        for (const continuous of [false, true]) {
          const result = scan(original, sample, mode, undefined, continuous);
          output.push({source: name, sourceOrientation: reversed ? "reverse" : "forward", ...result});
          console.log("ORIGINAL " + JSON.stringify(output[output.length - 1]));
        }
      }
    }
  }
  for (const [name, obtain] of nativeSources) {
    const reference = obtain();
    assert(reference.length > LOOKAHEAD, name);
    assert(Array.from(reference).every(x => x >= 0 && x < 29), name);
    for (const reversed of [false, true]) {
      const sample = reversed ? Uint8Array.from(reference).reverse() : reference;
      for (let mode = 0; mode < 2; mode++) {
        for (const continuous of [false, true]) {
          const result = scan(original, sample, mode, undefined, continuous);
          output.push({source: name, sourceOrientation: reversed ? "reverse" : "forward", ...result});
          console.log("ORIGINAL " + JSON.stringify(output[output.length - 1]));
        }
      }
    }
  }
  const total = output.reduce((n, v) => n + v.exactConsistent40Plus, 0);
  console.log("SUMMARY " + JSON.stringify({
    source: "unaltered 55 source pages, 12956 GP29 runes",
    hypothesis: "two 29^29 plaintext-predecessor tables, original print spaces ignored",
    attemptedSources: output.filter(x => x.models === "direct"
      && x.cipherClock === "page-contained" && x.sourceOrientation === "forward").map(x => x.source),
    nativePositive: positive,
    strong40Plus: total,
    status: total ? "candidate requiring independent original validation"
      : "no 40-rune exact source reuse; no unknown plaintext recovered"
  }));
}

if (require.main === module) main();
module.exports = {encodeEnglish, exactPrefix, witnesses, scan};
