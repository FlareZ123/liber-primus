"use strict";

/**
 * Issue #1329: all-secret GP29 English capacity for source-number-directed,
 * deterministic cyclic-256 word pointers. Windows Node.js 22, read-only SFT.
 *
 * Source rule names are the 66 registered in
 * https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/dir_rules.txt
 * Rule semantics: work/kscreen/signrules.py and dirrules.py there.
 *
 * This tests 66 directions * 2 orientations * 18 pointer conventions *
 * 2 deterministic equality-update clocks = 4,752 exact original models.
 * Hidden coin/skip branches, nonperiodic keys, and secret chapter phases
 * are deliberately outside this finite family.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeWords, minimumWindow} = require("./lp2_difference_allletter_capacity_sft.cjs");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const Q = 29, KEY_STATES = 256, N = 12956;
const RULES = ("A_cur_n B3_cur_n B5_cur_n B7_cur_n A_cur_w B3_cur_w B5_cur_w B7_cur_w " +
  "A_cur_wp B3_cur_wp B5_cur_wp B7_cur_wp A_cur_ws B3_cur_ws B5_cur_ws B7_cur_ws " +
  "A_prev_n B3_prev_n B5_prev_n B7_prev_n A_prev_G B3_prev_G B5_prev_G B7_prev_G " +
  "A_prev_R B3_prev_R B5_prev_R B7_prev_R A_prev_f B3_prev_f B5_prev_f B7_prev_f " +
  "A_prev_l B3_prev_l B5_prev_l B7_prev_l A_prev_pf B3_prev_pf B5_prev_pf B7_prev_pf " +
  "A_prev_pl B3_prev_pl B5_prev_pl B7_prev_pl B29_prev_G B29_prev_R C_cur_n " +
  "C_cur_wp C_cur_ws C_prev_n C_prev_G C_prev_R C_prev_f C_prev_l D_prev_fl " +
  "E_cur_n3 E_prev_n3 E_cur_n4 E_prev_n4 E_cur_n5 E_prev_n5 G4_prev GP_prev " +
  "G2_cur G4_cur GP_cur").split(" ");

const mod = (n, m) => (n % m + m) % m;
const isPrime = (n) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};

/** Parse exact printed words, 8 source sections, page and clause counters. */
function originalWords() {
  const runes = new Map(GP.runes.map((r, i) => [r, i]));
  const expected = GP.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices || []);
  const sections = [[]];
  let word = [], page = 0, clause = 0, startPage = 0, startClause = 0, count = 0;
  function finish() {
    if (word.length) {
      sections[sections.length - 1].push({r: word, page: startPage, clause: startClause});
      word = [];
    }
  }
  for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
    if (count === N) break;
    const v = runes.get(ch);
    if (v !== undefined) {
      if (word.length === 0) { startPage = page; startClause = clause; }
      word.push(v); count++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "." ) {
      finish(); clause++;
    } else if (ch === "$") {
      finish(); sections.push([]);
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Lines and physical pages may split real words.
    } else {
      finish();
    }
  }
  finish();
  const flatten = sections.flatMap((s) => s.flatMap((w) => w.r));
  assert.equal(count, N);
  assert.deepEqual(flatten, expected);
  assert.deepEqual(sections.map((s) => s.reduce((n, w) => n + w.r.length, 0)),
    [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
  assert.equal(sections.flat().length, 2896);
  return sections.map((section) => {
    let lastPage = null, lastClause = null, wp = 0, ws = 0;
    return section.map((w, index) => {
      wp = w.page === lastPage ? wp + 1 : 1;
      ws = w.clause === lastClause ? ws + 1 : 1;
      lastPage = w.page; lastClause = w.clause;
      const r = w.r;
      return {...w, n: r.length, w: index + 1, wp, ws,
        G: r.reduce((sum, x) => sum + GP.prime[x], 0),
        R: r.reduce((sum, x) => sum + x, 0),
        f: r[0], l: r[r.length - 1],
        pf: GP.prime[r[0]], pl: GP.prime[r[r.length - 1]]};
    });
  });
}

/** Exact 66 published direction-rule formulas, with first-word +1 defaults. */
function direction(name, words, i) {
  const current = words[i], previous = words[i - 1], beforePrevious = words[i - 2];
  let m = /^(A|B3|B5|B7|B29)_(cur|prev)_(n|w|wp|ws|G|R|f|l|pf|pl)$/.exec(name);
  if (m) {
    const word = m[2] === "cur" ? current : previous;
    const value = word?.[m[3]];
    if (value === undefined) return 1;
    if (m[1] === "A") return value % 2 === 0 ? 1 : -1;
    const base = Number(m[1].slice(1));
    return value % base <= (base - 1) / 2 ? 1 : -1;
  }
  m = /^C_(cur|prev)_(n|wp|ws|G|R|f|l|pf|pl)$/.exec(name);
  if (m) {
    const a = m[1] === "cur" ? current : previous;
    const b = m[1] === "cur" ? previous : beforePrevious;
    return a && b ? (a[m[2]] > b[m[2]] ? 1 : -1) : 1;
  }
  if (name === "D_prev_fl") return previous ? (previous.l > previous.f ? 1 : -1) : 1;
  m = /^E_(cur|prev)_n([345])$/.exec(name);
  if (m) {
    const word = m[1] === "cur" ? current : previous;
    return word ? (word.n >= Number(m[2]) ? 1 : -1) : 1;
  }
  if (name === "G4_prev") return previous ? (previous.G % 4 <= 1 ? 1 : -1) : 1;
  if (name === "GP_prev") return previous ? (isPrime(previous.G) ? 1 : -1) : 1;
  if (name === "G2_cur") return current.G % 2 === 0 ? 1 : -1;
  if (name === "G4_cur") return current.G % 4 <= 1 ? 1 : -1;
  if (name === "GP_cur") return isPrime(current.G) ? 1 : -1;
  throw new Error("Unrecognized source direction rule: " + name);
}

/**
 * Walk public ciphertext-selected cyclic-256 phase.
 *
 * h: backward word first-read pre-step (0/1);
 * m: between-word movement (0 none, 1 old direction, 2 new direction);
 * c: backward-word comparator (0 global, 1 within word, 2 last backward);
 * flip: reverse every published direction;
 * skip: on observed comparator equality, spend 2 key steps instead of 1.
 *
 * @param {object[][]} sections Source-ordered complete word records.
 * @param {number[][]} dirs Precomputed direction per complete word.
 * @param {{h:number,m:number,c:number,flip:number,skip:number}} config
 * @param {boolean} addresses Whether to return actual phase indices.
 */
function trace(sections, dirs, config, addresses = false) {
  const hist = new Uint16Array(KEY_STATES * Q);
  const phases = addresses ? [] : null;
  let previous = -1;
  for (let s = 0; s < sections.length; s++) {
    let pointer = 0, old = null, lastBackward = previous;
    for (let w = 0; w < sections[s].length; w++) {
      let dir = dirs[s][w] * (config.flip ? -1 : 1);
      if (old !== null) pointer += config.m === 0 ? 0 : config.m === 1 ? old : dir;
      if (dir < 0 && config.h === 1) pointer--;
      const word = sections[s][w].r;
      for (let i = 0; i < word.length; i++) {
        const cipher = word[i];
        const previousMatch = dir > 0 || config.c === 0 ? previous :
          config.c === 1 ? (i === 0 ? -1 : previous) : lastBackward;
        const phase = mod(pointer, KEY_STATES);
        hist[phase * Q + cipher]++;
        if (addresses) phases.push(phase);
        pointer += dir * (config.skip && previousMatch === cipher && previousMatch >= 0 ? 2 : 1);
        if (dir < 0) lastBackward = cipher;
        previous = cipher;
      }
      old = dir;
    }
  }
  let maxOne = 0, maxTwo = 0, active = 0;
  const majorized = new Uint32Array(Q);
  for (let state = 0; state < KEY_STATES; state++) {
    const sorted = Array.from(hist.subarray(state * Q, (state + 1) * Q))
      .sort((a, b) => b - a);
    for (let p = 0; p < Q; p++) majorized[p] += sorted[p];
    let first = 0, second = 0;
    for (let glyph = 0; glyph < Q; glyph++) {
      const count = hist[state * Q + glyph];
      if (count > first) { second = first; first = count; }
      else if (count > second) second = count;
    }
    maxOne += first;
    maxTwo += first + second;
    if (first) active++;
  }
  assert.equal(majorized.reduce((a, b) => a + b, 0), N);
  // Exactly maximal coincidence over all independently secret GP29
  // bijections at each pointer state (rearrangement inequality).
  const maximumIoCNumerator = majorized.reduce(
    (sum, count) => sum + count * (count - 1), 0);
  return {maxOne, maxTwo, active, maximumIoCNumerator,
    maximumIoC: maximumIoCNumerator / (N * (N - 1)), phases};
}

/**
 * Genuine source-native GP prose plant. All 2,896 word lengths and the
 * cipher's own previous-word GP-prime-parity directions are preserved.
 * The encryption is causal because the rule reads only earlier ciphertext.
 */
function positiveControl(original, nativeWordPools, config) {
  const chosen = new Map();
  const plain = original.map((section) => section.map((word) => {
    const pool = nativeWordPools.get(word.n);
    assert.ok(pool?.length, "No native source word of length " + word.n);
    const i = chosen.get(word.n) || 0;
    chosen.set(word.n, i + 1);
    return pool[i % pool.length];
  }));
  const key = Array.from({length: KEY_STATES}, (_, i) => (7 * i + 11) % Q);
  let previous = -1;
  const encrypted = plain.map((section) => {
    let pointer = 0, old = null, lastBackward = previous, previousWordSum = 0;
    return section.map((word, wi) => {
      let dir = (wi === 0 || previousWordSum % 2 === 0 ? 1 : -1) *
        (config.flip ? -1 : 1);
      if (old !== null) pointer += config.m === 0 ? 0 : config.m === 1 ? old : dir;
      if (dir < 0 && config.h === 1) pointer--;
      const cipherWord = [];
      for (let i = 0; i < word.length; i++) {
        const cipher = (word[i] + key[mod(pointer, KEY_STATES)]) % Q;
        const comparator = dir > 0 || config.c === 0 ? previous :
          config.c === 1 ? (i === 0 ? -1 : previous) : lastBackward;
        pointer += dir * (config.skip && comparator === cipher && comparator >= 0 ? 2 : 1);
        if (dir < 0) lastBackward = cipher;
        previous = cipher;
        cipherWord.push(cipher);
      }
      old = dir;
      previousWordSum = cipherWord.reduce((sum, value) => sum + GP.prime[value], 0);
      return cipherWord;
    });
  });
  // Keep source page/word/section clocks while replacing original symbols.
  const plant = original.map((section, si) => section.map((record, wi) => {
    const r = encrypted[si][wi];
    return {...record, r, G: r.reduce((sum, x) => sum + GP.prime[x], 0)};
  }));
  const dir = plant.map((section) => section.map((_, i) => direction("A_prev_G", section, i)));
  const traced = trace(plant, dir, config, true);
  const cipherFlat = encrypted.flat(2);
  const plainFlat = plain.flat(2);
  assert.equal(traced.phases.length, N);
  const decoded = cipherFlat.map((c, i) => mod(c - key[traced.phases[i]], Q));
  assert.deepEqual(decoded, plainFlat);
  assert.deepEqual(decoded.map((p, i) => (p + key[traced.phases[i]]) % Q), cipherFlat);
  const target = GP.translit.indexOf("E");
  const actualE = plainFlat.filter((x) => x === target).length;
  assert.ok(traced.maxOne >= actualE);
  const actualCounts = new Uint32Array(Q);
  for (const x of decoded) actualCounts[x]++;
  const nativeIoC = actualCounts.reduce((sum, v) => sum + v * (v - 1), 0) /
    (N * (N - 1));
  assert.ok(traced.maximumIoC + 1e-15 >= nativeIoC);
  return {runes: decoded.length, exactRecovery: true, exactReencryption: true,
    nativeIoC, maximumSecretIoC: traced.maximumIoC,
    plaintextE: actualE, allSecretMaximumE: traced.maxOne};
}

/**
 * Exact minimum unigram coincidence across every overlapping GP-native
 * source window of the original ciphertext's 12,956-rune length.
 * @param {number[]} text Native GP rune indices.
 */
function minimumWindowIoC(text) {
  assert.ok(text.length >= N);
  const counts = new Uint32Array(Q);
  let numerator = 0, minimum = Infinity, offset = -1;
  for (let i = 0; i < text.length; i++) {
    const arriving = text[i];
    numerator += 2 * counts[arriving];
    counts[arriving]++;
    if (i >= N) {
      const departing = text[i - N];
      counts[departing]--;
      numerator -= 2 * counts[departing];
    }
    if (i >= N - 1 && numerator < minimum) {
      minimum = numerator;
      offset = i - N + 1;
    }
  }
  return {numerator: minimum, offset, minimumIoC: minimum / (N * (N - 1))};
}

function main() {
  assert.equal(RULES.length, 66);
  assert.equal(new Set(RULES).size, 66);
  const original = originalWords();
  const native = [
    ["Gibran", "resources/control/gibran_prophet_58585.txt"],
    ["Emerson", "resources/control/emerson_essays_2944.txt"],
    ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
  ].map(([name, file]) => {
    const words = encodeWords(read(file));
    const text = words.flat();
    const minimumE = minimumWindow(text, N, GP.translit.indexOf("E"));
    const minimumIoC = minimumWindowIoC(text);
    assert.ok(minimumE && minimumE.count >= 1397);
    return {name, minimumE: minimumE.count, minimumIoC, words};
  });
  const results = [];
  for (const name of RULES) {
    const dirs = original.map((section) =>
      section.map((_, i) => direction(name, section, i)));
    for (let h = 0; h < 2; h++)
      for (let m = 0; m < 3; m++)
        for (let c = 0; c < 3; c++)
          for (let flip = 0; flip < 2; flip++)
            for (let skip = 0; skip < 2; skip++) {
              const config = {h, m, c, flip, skip};
              results.push({name, ...config, ...trace(original, dirs, config)});
            }
  }
  assert.equal(results.length, 4752);
  results.sort((a, b) => a.maxOne - b.maxOne);
  const most = results[results.length - 1];
  const least = results[0];
  assert.ok(most.maxOne < Math.min(...native.map((n) => n.minimumE)));
  const highestCoincidence = results.reduce((best, current) =>
    current.maximumIoCNumerator > best.maximumIoCNumerator ? current : best);
  const referenceMinimumIoC = Math.min(...native.map((n) => n.minimumIoC.minimumIoC));
  assert.ok(highestCoincidence.maximumIoC < referenceMinimumIoC,
    "Arbitrary secret GP alphabet majorization did not exclude native reference");
  const byLength = new Map();
  for (const word of native[0].words) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  const plant = positiveControl(original, byLength,
    {h: 1, m: 2, c: 2, flip: 1, skip: 1});
  const report = {
    originalRunes: N, originalWords: original.flat().length,
    originalSections: original.map((s) => s.reduce((n, w) => n + w.n, 0)),
    sourceDirectionRules: RULES.length, conventions: 18,
    directions: 2, deterministicUpdateClocks: 2, searched: results.length,
    allSecretMaximumE: most.maxOne, bestModel: most,
    allSecretMinimumE: least.maxOne, minimumModel: least,
    allSecretMaximumPair: Math.max(...results.map((r) => r.maxTwo)),
    highestCoincidenceModel: highestCoincidence,
    minimumReferenceIoC: referenceMinimumIoC,
    nativeMinimumE: native.map((n) => ({name: n.name, count: n.minimumE,
      ...n.minimumIoC})),
    sourceNativePositive: plant, recoveredUnknownLP2Plaintext: false,
    scope: "Only source-section phase-zero reset, stationary cyclic-256 phase alphabets, deterministic equality update, no unobserved retries"
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}
if (require.main === module) main();
module.exports = {main, originalWords, direction, trace, RULES, GP, Q, N, KEY_STATES};
