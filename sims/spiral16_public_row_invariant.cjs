"use strict";
/**
 * Source-suggested 16-phase public-state cipher: exact key-independent
 * equality invariant under arbitrary 29! per-row secret permutations.
 *
 * C[page,i] = S[(phase16, C[page,i-1])][P[page,i]].
 * Each row is a bijection of the 29 GP indices. The public phase is either
 * the physical-page rune offset, cumulative offset, or count of publicly
 * visible nonrepeated transitions (reset at pages or continuous).
 * Optionally, the row maps plaintext EA (GP index28) to the unchanged
 * previous output, and all other plaintext symbols bijectively to the 28
 * alternatives. This is still a bijective 29-symbol cipher.
 *
 * The 16 phase states are motivated by the original LP2 page-15 4x4
 * Fibonacci-indexed prime source square. No secret key or decoded LP2
 * plaintext is inferred from a low conditional collision ratio.
 *
 * Reproduce: node sims/spiral16_public_row_invariant.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const originalSource = read("resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(originalSource);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
const WORD_LENGTHS = parseSharedCorpus().words.map(w => w.length);
const PHASES = 16, MOD = 29, EA = 28, TRIALS = 150;
const CLOCKS = ["page", "global", "skip-page", "skip-global"];
/** Public phase available from already published glyphs alone. */
function phaseAt(clock, i, absolute, localSteps, globalSteps) {
  if (clock === "page") return i % PHASES;
  if (clock === "global") return (absolute + i) % PHASES;
  if (clock === "skip-page") return localSteps % PHASES;
  if (clock === "skip-global") return globalSteps % PHASES;
  throw new Error("Unknown phase clock " + clock);
}
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);
assert.equal(WORD_LENGTHS.length, 2896);
assert.equal(WORD_LENGTHS.reduce((a, b) => a + b, 0), 12956);

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {string} text @returns {number[][]} */
function gpWords(text) {
  const lookup = new Map(corpus.translit.map((label, i) => [label, i]));
  lookup.set("ING", 21);
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(token => {
    const normalized = token.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const word = [];
    for (let i = 0; i < normalized.length;) {
      let value;
      for (const width of [3, 2, 1]) {
        const found = lookup.get(normalized.slice(i, i + width));
        if (found !== undefined) {
          value = found;
          i += width;
          break;
        }
      }
      assert.notEqual(value, undefined, "unencodable GP source " + token);
      word.push(value);
    }
    return word;
  });
}

const nativeLines = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line => {
    const s = line.trim();
    return !s.startsWith("#") && !s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  });
const sources = {
  "solved-Cicada": gpWords(nativeLines.join(" ")),
  "Shakespeare": gpWords(read("resources/control/shakespeare_first300k.txt"))
};

/** @param {number[][]} reference @returns {Map<number,number[][]>} */
function buckets(reference) {
  const out = new Map();
  for (const word of reference) {
    if (!out.has(word.length)) out.set(word.length, []);
    out.get(word.length).push(word);
  }
  for (const length of WORD_LENGTHS) {
    assert(out.has(length), "missing exact-length authentic source bucket " + length);
  }
  return out;
}

/**
 * Sample independently authored complete GP words with the exact original
 * 2896 word lengths; reflow without splitting the original 55 page sizes.
 * @param {Map<number,number[][]>} byLength
 * @param {number} seed
 * @returns {number[][]}
 */
function samplePages(byLength, seed) {
  const next = random32(seed);
  const flat = WORD_LENGTHS.flatMap(length => {
    const options = byLength.get(length);
    return options[next() % options.length];
  });
  assert.equal(flat.length, 12956);
  let pos = 0;
  const result = pages.map(page => {
    const current = flat.slice(pos, pos + page.length);
    pos += page.length;
    return current;
  });
  assert.equal(pos, 12956);
  return result;
}

/**
 * Build an independent secret bijection for each public phase / previous
 * ciphertext pair, keeping plaintext EA exactly transparent.
 * @param {number} seed
 * @returns {Array<{enc:Uint8Array,dec:Uint8Array}>}
 */
function randomTables(seed) {
  const next = random32(seed);
  const table = [];
  for (let phase = 0; phase < PHASES; phase++) {
    for (let previous = 0; previous < MOD; previous++) {
      const alternatives = Array.from({length: MOD}, (_, i) => i)
        .filter(i => i !== previous);
      for (let i = 27; i > 0; i--) {
        const j = next() % (i + 1);
        [alternatives[i], alternatives[j]] = [alternatives[j], alternatives[i]];
      }
      const enc = new Uint8Array(MOD), dec = new Uint8Array(MOD);
      for (let plain = 0; plain < 28; plain++) {
        enc[plain] = alternatives[plain];
      }
      enc[EA] = previous;
      for (let plain = 0; plain < MOD; plain++) dec[enc[plain]] = plain;
      table.push({enc, dec});
    }
  }
  assert.equal(table.length, PHASES * MOD);
  return table;
}

/**
 * Encrypt/decrypt using an exact reversible source-keyed permutation table.
 * The first rune of each page is a transmitted seed and copies its source.
 * @param {number[][]} data
 * @param {Array<{enc:Uint8Array,dec:Uint8Array}>} table
 * @param {"page"|"global"|"skip-page"|"skip-global"} clock
 * @param {"enc"|"dec"} direction
 */
function transform(data, table, clock, direction) {
  let absolute = 0, globalSteps = 0;
  const result = data.map(page => {
    let localSteps = 0;
    const out = [page[0]];
    for (let i = 1; i < page.length; i++) {
      const phase = phaseAt(clock, i, absolute, localSteps, globalSteps);
      const previous = direction === "enc" ? out[i - 1] : page[i - 1];
      const row = table[phase * MOD + previous];
      out.push(row[direction][page[i]]);
      const visible = direction === "enc" ? out[i] : page[i];
      if (visible !== previous) { localSteps++; globalSteps++; }
    }
    absolute += page.length;
    return out;
  });
  return result;
}

/**
 * Number of unordered same-output and all pairs sharing EXACTLY the same
 * (phase16, previous ciphertext) row. Secret bijections cannot change
 * equality within these rows.
 * @param {number[][]} ciphertext
 * @param {"page"|"global"|"skip-page"|"skip-global"} clock
 */
function conditionalCollision(ciphertext, clock) {
  const hist = new Uint16Array(PHASES * MOD * MOD);
  const totals = new Uint16Array(PHASES * MOD);
  let matching = 0, eligible = 0, absolute = 0, transitions = 0, equalSteps = 0;
  let globalSteps = 0;
  for (const page of ciphertext) {
    let localSteps = 0;
    for (let i = 1; i < page.length; i++) {
      const current = page[i], preceding = page[i - 1];
      const phase = phaseAt(clock, i, absolute, localSteps, globalSteps);
      const state = phase * MOD + preceding;
      matching += hist[state * MOD + current]++;
      eligible += totals[state]++;
      transitions++;
      equalSteps += Number(current === preceding);
      if (current !== preceding) { localSteps++; globalSteps++; }
    }
    absolute += page.length;
  }
  return {matching, eligible, rate: matching / eligible,
    groups: totals.reduce((s, n) => s + Number(n > 0), 0),
    transitions, equalSteps};
}

/**
 * Independent 28-way Markov null, conditional on the original complete set
 * of exact repeated-ciphertext positions. It preserves 55 page lengths.
 * @param {number} seed
 */
function antiRepeatNull(seed) {
  const next = random32(seed);
  return pages.map(page => {
    const out = [page[0]];
    for (let i = 1; i < page.length; i++) {
      const prev = out[i - 1];
      if (page[i] === page[i - 1]) out.push(prev);
      else {
        const rank = next() % 28;
        out.push(rank < prev ? rank : rank + 1);
      }
    }
    return out;
  });
}

/** @param {number[]} scores @param {number} observed */
function summary(scores, observed) {
  const order = scores.slice().sort((a, b) => a - b), n = scores.length;
  return {
    n, mean: scores.reduce((s, v) => s + v, 0) / n,
    minimum: order[0], median: order[Math.floor(n / 2)],
    maximum: order.at(-1),
    lowerOrEqual: scores.filter(v => v <= observed).length,
    upperOrEqual: scores.filter(v => v >= observed).length,
    lowerTailAddOne: (1 + scores.filter(v => v <= observed).length) / (n + 1)
  };
}

function run() {
  const observed = Object.fromEntries(CLOCKS.map(clock =>
    [clock, conditionalCollision(pages, clock)]));
  assert.deepEqual(
    [observed.page.matching, observed.page.eligible,
      observed.global.matching, observed.global.eligible],
    [6365, 179922, 6432, 179506]
  );
  const report = {};
  for (const clock of CLOCKS) {
    const origin = observed[clock].rate;
    const nulls = Array.from({length: TRIALS}, (_, j) =>
      conditionalCollision(antiRepeatNull(0x25160100 + j * 131), clock).rate);
    const planted = {};
    for (const [label, source] of Object.entries(sources)) {
      const byLength = buckets(source);
      const collisions = [], eaCounts = [];
      for (let trial = 0; trial < TRIALS; trial++) {
        const plaintext = samplePages(byLength, 0x2516ac00 + trial * 47);
        const tables = randomTables(0x25165000 + trial * 113);
        const ciphertext = transform(plaintext, tables, clock, "enc");
        const recovered = transform(ciphertext, tables, clock, "dec");
        assert.deepEqual(recovered, plaintext);
        assert.deepEqual(transform(recovered, tables, clock, "enc"), ciphertext);
        const stat = conditionalCollision(ciphertext, clock);
        collisions.push(stat.rate);
        eaCounts.push(stat.equalSteps);
      }
      planted[label] = {
        referenceWords: source.length,
        referenceRunes: source.flat().length,
        collision: summary(collisions, origin),
        meanVisibleEA: eaCounts.reduce((a, b) => a + b, 0) / eaCounts.length
      };
    }
    report[clock] = {
      original: observed[clock],
      sourceMatchedAntiRepeatNull: summary(nulls, origin),
      exactReversibleNativeGPPlants: planted
    };
  }
  return {
    sourceSHA256: crypto.createHash("sha256").update(originalSource)
      .digest("hex"),
    initialEvidence: "16 phases from physical LP2 page15 Fibonacci prime square",
    originalUnsolvedRunePages: pages.length, originalRunes: 12956,
    fixedArchitecture: "arbitrary stationary 29-way secret bijection for each (public phase mod16, previous cipher rune); transparent GP EA; physical-page seed",
    report,
    interpretation: "Original conditional collision concentration remains near a 28-way Markov null despite source-native GP plaintext plants with a fully invertible arbitrary phase/context substitution, including observable no-repeat key-draw skip clocks. The key-independent equality constraint excludes only direct author-GP-like plaintext under this entire fixed public-state family; hidden key evolution, external prior encryption, variable phase/skips and alternative plaintext registers remain open."
  };
}
if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}
module.exports = {gpWords, randomTables, transform, conditionalCollision,
  antiRepeatNull, run};
