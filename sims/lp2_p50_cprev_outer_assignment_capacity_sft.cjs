"use strict";

/**
 * Original LP2 p50 32x8 predecessor-row, eight-phase lookup:
 * exact all-secret outer-alphabet frequency capacity.
 *
 * A source-shaped candidate is
 *   C[i] = sigma((P[i] + sign*grid[row(C[i-1]),col(clock[i])]) mod 29).
 * The cipher-to-plaintext outer alphabet sigma is an arbitrary unknown
 * GP29 permutation, never fitted to English. Page-first symbols are free.
 *
 * For any target plaintext symbol set S, every possible sigma is bounded
 * exactly by a 29x29 maximum-weight assignment over original (C,key) bins.
 * Literal-F exceptions are over-granted as arbitrary outputs at ALL
 * ciphertext F sites. This covers the 512 configurations in the previously
 * investigated direct grid_cprev_lookup_sigma.cjs family, irrespective of
 * the complete unknown 29! alphabet, and includes an independent full-length
 * native-GP encryption/decryption positive.
 *
 * Node.js 22, CommonJS. Run: node sims/lp2_p50_cprev_outer_assignment_capacity_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows;
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const M = 29;
/** @param {number} n @returns {number} */
const mod = (n) => ((n % M) + M) % M;

assert.equal(table.length, 32);
assert(table.every((row) => row.length === 8 &&
  row.every((value) => Number.isInteger(value) && value >= 0 && value < 256)));

const original = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(original.length, 12956);

const pageFirst = new Set();
let pageOffset = 0;
for (const page of corpus.pages.filter((page) => page.page <= 55)) {
  if (page.indices.length > 0) pageFirst.add(pageOffset);
  pageOffset += page.indices.length;
}
assert.equal(pageFirst.size, 55);
assert.equal(pageOffset, original.length);

/**
 * Preserve real word continuation over line and page boundaries.
 * Source '$' resets its visible section clock. Physical p50 has no runes.
 * @returns {{c:number,prev:number,pp:number,g:number,sp:number,wp:number}[]}
 */
function originalRecords() {
  const rows = [];
  let page = 0, pagePos = 0, global = 0, sectionPos = 0;
  let wordPos = 0, words = 0, sections = 0, prev = -1;
  for (const ch of read("resources/lp2-transcription.txt")) {
    const value = alphabet.get(ch);
    if (value !== undefined) {
      if (global === original.length) break;
      if (pagePos === corpus.pages[page].indices.length) {
        page++;
        if (page === 50) page++;
        pagePos = 0;
      }
      if (wordPos === 0) words++;
      rows.push({c: value, prev, pp: pagePos, g: global, sp: sectionPos, wp: wordPos});
      prev = value;
      global++;
      pagePos++;
      sectionPos++;
      wordPos++;
    } else if (ch === "$") {
      sections++;
      sectionPos = 0;
      wordPos = 0;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "§") {
      wordPos = 0;
    }
  }
  assert.equal(global, 12956);
  assert.equal(words, 2896);
  assert.equal(sections, 8);
  assert.deepEqual(rows.map((record) => record.c), original);
  return rows;
}

const records = originalRecords();
const fNonPageFirst = records.filter((record, i) =>
  !pageFirst.has(i) && record.c === 0).length;
assert.equal(fNonPageFirst, 456);
assert.equal(original.filter((symbol) => symbol === 0).length, 458);

/**
 * @typedef {{rowMode:string,clock:string,phase:number,reverse:boolean}} Config
 * @param {Pick<typeof records[number], "pp"|"g"|"sp"|"wp">} record
 * @param {number} prevCipher
 * @param {Config} config
 * @returns {number}
 */
function keyDigit(record, prevCipher, config) {
  const row = config.rowMode === "direct" ? prevCipher :
    config.rowMode === "plus3" ? prevCipher + 3 :
    config.rowMode === "reverse" ? 28 - prevCipher : 31 - prevCipher;
  const phase = (record[config.clock] + config.phase) % 8;
  const column = config.reverse ? 7 - phase : phase;
  return table[row][column] % M;
}

/**
 * 29x29 counts N[currentCipher][gridKey]. Page starts are free, so they
 * are not included. With excludeF, all ciphertext-F symbols are free.
 * @param {number[]} ciphertext
 * @param {Config} config
 * @param {boolean} excludeF
 * @returns {number[][]}
 */
function countMatrix(ciphertext, config, excludeF) {
  const counts = Array.from({length:M}, () => Array(M).fill(0));
  for (let i = 0; i < ciphertext.length; i++) {
    if (pageFirst.has(i) || (excludeF && ciphertext[i] === 0)) continue;
    const symbol = ciphertext[i];
    const key = keyDigit(records[i], ciphertext[i - 1], config);
    counts[symbol][key]++;
  }
  return counts;
}

/**
 * Hungarian maximum-weight perfect matching for a square matrix.
 * Rows are source ciphertext glyph identities, columns the 29 unknown
 * values of sigma^-1(glyph), each value used precisely once.
 * @param {number[][]} weights
 * @returns {number}
 */
function assignmentMaximum(weights) {
  const n = weights.length;
  assert(weights.every((row) => row.length === n));
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const best = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const reduced = -weights[i0 - 1][j - 1] - u[i0] - v[j];
        if (reduced < best[j]) {
          best[j] = reduced;
          way[j] = j0;
        }
        if (best[j] < delta) {
          delta = best[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          best[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0]);
    do {
      const next = way[j0];
      p[j0] = p[next];
      j0 = next;
    } while (j0);
  }
  let maximum = 0;
  for (let j = 1; j <= n; j++) maximum += weights[p[j] - 1][j - 1];
  return maximum;
}

/**
 * Exact best combined number of selected GP plaintext symbols under any
 * secret 29-symbol outer permutation, before adding unconstrained slots.
 * @param {number[][]} counts
 * @param {number[]} target
 * @param {number} sign
 * @returns {number}
 */
function targetCapacity(counts, target, sign) {
  const weights = Array.from({length:M}, (_, cipher) =>
    Array.from({length:M}, (_, inverseLabel) =>
      target.reduce((sum, plain) =>
        sum + counts[cipher][mod(sign * (inverseLabel - plain))], 0)));
  return assignmentMaximum(weights);
}

assert.equal(assignmentMaximum([[3,1,2],[4,6,1],[5,2,8]]), 17);
assert.equal(assignmentMaximum([[1,7,3],[6,4,2],[5,8,9]]), 22);

const natural = solved.sections.flatMap((section) =>
  [...section.source_text].flatMap((ch) =>
    alphabet.has(ch) ? [alphabet.get(ch)] : []));
assert.equal(natural.length, 2979);
assert.equal(natural.filter((value) => value === 18).length, 380);
assert.equal(natural.filter((value) => value === 3).length, 256);

const modes = [];
for (const rowMode of ["direct","plus3","reverse","reversePlus3"]) {
  for (const clock of ["pp","g","sp","wp"]) {
    for (let phase = 0; phase < 8; phase++) {
      for (const reverse of [false,true]) {
        const config = {rowMode, clock, phase, reverse};
        const full = countMatrix(original, config, false);
        const noF = countMatrix(original, config, true);
        const looseF = fNonPageFirst + pageFirst.size;
        const E = targetCapacity(full, [18], 1) + pageFirst.size;
        const EO = targetCapacity(full, [18,3], 1) + pageFirst.size;
        const EfreeF = targetCapacity(noF, [18], 1) + looseF;
        const EOfreeF = targetCapacity(noF, [18,3], 1) + looseF;
        // In a two-target assignment, changing additive sign is equivalent
        // to reflecting the entire secret outer permutation.
        assert.equal(targetCapacity(full, [18], -1) + pageFirst.size, E);
        assert.equal(targetCapacity(full, [18,3], -1) + pageFirst.size, EO);
        modes.push({config,E,EO,EfreeF,EOfreeF});
      }
    }
  }
}
assert.equal(modes.length, 256);  // Two inverse signs share these capacities.
const maxima = {
  E: Math.max(...modes.map((mode) => mode.E)),
  EO: Math.max(...modes.map((mode) => mode.EO)),
  EfreeF: Math.max(...modes.map((mode) => mode.EfreeF)),
  EOfreeF: Math.max(...modes.map((mode) => mode.EOfreeF)),
};
assert.deepEqual(maxima, {E:747,EO:1284,EfreeF:1195,EOfreeF:1719});

/** @param {number[]} text @param {Config} cfg @param {number[]} sigma */
function encrypt(text, cfg, sigma) {
  const ciphertext = [];
  for (let i = 0; i < text.length; i++) {
    const key = pageFirst.has(i) ? 0 : keyDigit(records[i], ciphertext[i-1], cfg);
    ciphertext.push(sigma[mod(text[i] + key)]);
  }
  return ciphertext;
}

/** @param {number[]} ciphertext @param {Config} cfg @param {number[]} sigma */
function decrypt(ciphertext, cfg, sigma) {
  const inverse = Array(M);
  for (let index = 0; index < M; index++) inverse[sigma[index]] = index;
  return ciphertext.map((value, i) => {
    const key = pageFirst.has(i) ? 0 : keyDigit(records[i], ciphertext[i-1], cfg);
    return mod(inverse[value] - key);
  });
}

const nativePlant = Array.from({length: original.length}, (_, i) =>
  natural[i % natural.length]);
let state = 0x3301abcd;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const sigma = Array.from({length:M}, (_, i) => i);
for (let i = M - 1; i > 0; i--) {
  const j = nextRandom() % (i + 1);
  [sigma[i],sigma[j]] = [sigma[j],sigma[i]];
}
const plantedConfig = {rowMode:"reversePlus3",clock:"wp",phase:5,reverse:true};
const plantedCipher = encrypt(nativePlant, plantedConfig, sigma);
assert.deepEqual(decrypt(plantedCipher, plantedConfig, sigma), nativePlant);
const plantedMatrix = countMatrix(plantedCipher, plantedConfig, false);
const plantedE = nativePlant.filter((value) => value === 18).length;
const plantedEO = nativePlant.filter((value) => value === 18 || value === 3).length;
const plantedCapacity = {
  E: targetCapacity(plantedMatrix, [18], 1) + pageFirst.size,
  EO: targetCapacity(plantedMatrix, [18,3], 1) + pageFirst.size,
};
assert(plantedCapacity.E >= plantedE);
assert(plantedCapacity.EO >= plantedEO);

const byClock = {};
for (const clock of ["pp","g","sp","wp"]) {
  const subset = modes.filter((mode) => mode.config.clock === clock);
  byClock[clock] = {
    E: Math.max(...subset.map((mode) => mode.E)),
    EO: Math.max(...subset.map((mode) => mode.EO)),
    EfreeF: Math.max(...subset.map((mode) => mode.EfreeF)),
    EOfreeF: Math.max(...subset.map((mode) => mode.EOfreeF)),
  };
}
assert.deepEqual(byClock, {
  pp:{E:746,EO:1280,EfreeF:1193,EOfreeF:1709},
  g: {E:741,EO:1283,EfreeF:1185,EOfreeF:1707},
  sp:{E:747,EO:1273,EfreeF:1195,EOfreeF:1701},
  wp:{E:744,EO:1284,EfreeF:1183,EOfreeF:1719},
});

console.log(JSON.stringify({
  status:"PASS",
  model:"previous-published-GP29-rune selects p50 32x8 row; four eight-phase clocks; an arbitrary secret 29! outer alphabet",
  original:{runes:original.length,words:2896,pages:55,eligible:original.length-pageFirst.size,
    ciphertextF:458,eligibleF:fNonPageFirst,sourceGridRows:table.length,sourceGridColumns:8},
  allSecret:{configs:512,signEquivalence:2,radix:29,capacityMaxima:maxima,byClock,
    percentages:Object.fromEntries(Object.entries(maxima).map(([key,value]) =>
      [key,100*value/original.length]))},
  nativeControl:{runes:natural.length,E:380,O:256,
    expectedEAtOriginalLength:380*original.length/natural.length,
    expectedEOAtOriginalLength:636*original.length/natural.length},
  nativePlant:{ciphertextRunes:plantedCipher.length,secretAlphabet:sigma,
    recovered:original.length,E:plantedE,EO:plantedEO,plantedCapacity},
  decision:"No original LP2 plaintext or key. Every one of 512 source-grid feedback + fixed-secret-outer-alphabet models is too sparse in every GP plaintext E and E+O class to produce the pooled authenticated solved-page native GP register, even granting all original F and page-first slots arbitrary plaintext. Changing per-position alphabet, hidden running state, nonnative register or transposition lies outside this exclusion."
}, null, 2));
