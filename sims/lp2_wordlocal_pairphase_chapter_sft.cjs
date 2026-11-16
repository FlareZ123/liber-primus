"use strict";

/**
 * Original-input SFT for a word-local paired-output hypothesis in LP2.
 * Run with Node.js 22. Reads the unchanged canonical source transcription.
 * No fitting to candidate plaintext, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const text = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const lp1 = fs.readFileSync(path.join(root, "resources", "transcriptions", "lp1_wulfic_canonical.txt"), "utf8");
const meta = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const lookup = new Map(meta.runes.map((r, i) => [r, i]));
const CHAPTERS = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const SEED = 0x20510627;
const DRAWS = 250000;

/**
 * @param {string} input
 * @param {number} lastRecord Exclusive count of original transcript records.
 * @returns {{page: number, letters: number[]}[]}
 */
function parseWords(input, lastRecord) {
  const words = [];
  const pending = [];
  let record = 0;
  let firstPage = 0;

  /** Emit a complete typographic word; slash/newline/percent are transparent. */
  function flush() {
    if (pending.length) words.push({ page: firstPage, letters: pending.splice(0) });
  }

  for (const symbol of input) {
    if (symbol === "%") {
      record++;
      continue;
    }
    if (record >= lastRecord) break;
    if (lookup.has(symbol)) {
      if (!pending.length) firstPage = record < 50 ? record : record + 1;
      pending.push(lookup.get(symbol));
    } else if ("-.$&§1234567".includes(symbol)) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values */
function ioc29(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return 29 * counts.reduce((n, x) => n + x * (x - 1), 0) / (values.length * (values.length - 1));
}

/**
 * @param {{page: number, letters: number[]}[]} words
 */
function eventsByChapter(words) {
  const groups = Array.from({ length: CHAPTERS.length }, () => []);
  const summary = Array.from({ length: CHAPTERS.length }, () => ({ words: 0, runes: 0, odd: 0, even: 0, oddPairs: 0, evenPairs: 0 }));
  for (const word of words) {
    const chapter = CHAPTERS.findIndex(([lo, hi]) => word.page >= lo && word.page <= hi);
    assert.notEqual(chapter, -1, "Unexpected original page");
    const s = summary[chapter];
    s.words++;
    s.runes += word.letters.length;
    const n = word.letters.length - 1;
    for (let i = 1; i < word.letters.length; i++) {
      if (i & 1) s.oddPairs++; else s.evenPairs++;
      if (word.letters[i] === word.letters[i - 1]) {
        if (i & 1) s.odd++; else s.even++;
        groups[chapter].push({ odd: i & 1, pOdd: Math.ceil(n / 2) / n });
      }
    }
  }
  return { groups, summary };
}

/** Exact conditional odd-count distribution under one event per observed word. */
function addBernoulli(dist, p) {
  const next = new Float64Array(dist.length + 1);
  for (let i = 0; i < dist.length; i++) {
    next[i] += dist[i] * (1 - p);
    next[i + 1] += dist[i] * p;
  }
  return next;
}

/** Compute the two-sided doubled-tail p for every possible prefix odd count. */
function doubledTails(dist) {
  const result = [];
  for (let k = 0; k < dist.length; k++) {
    let lower = 0;
    let upper = 0;
    for (let i = 0; i < dist.length; i++) {
      if (i <= k) lower += dist[i];
      if (i >= k) upper += dist[i];
    }
    result.push(Math.min(1, 2 * Math.min(lower, upper)));
  }
  return result;
}

function wordLocalParityTest(words) {
  const { groups, summary } = eventsByChapter(words);
  assert.deepEqual(summary.map(x => x.words), [158, 255, 383, 437, 224, 326, 378, 669, 66]);
  assert.equal(summary.reduce((n, x) => n + x.runes, 0), 12956);
  assert.equal(summary.reduce((n, x) => n + x.odd + x.even, 0), 63);
  assert.equal(summary.reduce((n, x) => n + x.odd, 0), 27);
  assert.equal(summary.reduce((n, x) => n + x.even, 0), 36);
  assert.equal(groups.reduce((n, g) => n + g.length, 0), 63);
  assert.equal(Math.max(...groups.map(g => g.length)), 14);

  const prefix = [];
  let dist = Float64Array.of(1);
  let observed = 0;
  let expectation = 0;
  for (let c = 0; c < 8; c++) {
    for (const event of groups[c]) {
      observed += event.odd;
      expectation += event.pOdd;
      dist = addBernoulli(dist, event.pOdd);
    }
    const tails = doubledTails(dist);
    prefix.push({ cut: c + 1, odd: observed, events: dist.length - 1, expectation, pTwo: tails[observed], tails });
  }
  assert.equal(prefix[4].events, 32);
  assert.equal(prefix[4].odd, 10);
  assert.ok(Math.abs(prefix[4].expectation - 18.29249639249639) < 1e-10);
  assert.ok(Math.abs(prefix[4].pTwo - 0.005099701810107976) < 1e-10);
  const minObserved = Math.min(...prefix.map(x => x.pTwo));

  // A fully seeded familywise control for the eight source-chapter-prefix scans.
  let state = SEED;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  }
  let hits = 0;
  for (let trial = 0; trial < DRAWS; trial++) {
    let odd = 0;
    let smallest = 1;
    for (let c = 0; c < 8; c++) {
      for (const event of groups[c]) if (random() < event.pOdd) odd++;
      smallest = Math.min(smallest, prefix[c].tails[odd]);
    }
    if (smallest <= minObserved + 1e-14) hits++;
  }
  const familyP = (hits + 1) / (DRAWS + 1);
  assert.ok(familyP > 0.010 && familyP < 0.015);
  console.log("ORIGINAL chapter rows", JSON.stringify(summary));
  console.log("ORIGINAL exact prefix tails", JSON.stringify(prefix.map(({ tails, ...p }) => p)));
  console.log("ORIGINAL familywise", JSON.stringify({ seed: SEED, trials: DRAWS, hits, p: familyP, bonferroniUpper: Math.min(1, 8 * minObserved) }));
}

/** Count the same relative-pair test on a source-original LP1 comparator. */
function lp1Control() {
  for (const [name, source] of [["entire LP1", lp1], ["first three LP1 blocks", lp1.split("%").slice(0, 3).join("%")]]) {
    const words = parseWords(source, 200);
    let dist = Float64Array.of(1);
    let odd = 0, even = 0, glyphs = 0;
    for (const word of words) {
      glyphs += word.letters.length;
      const n = word.letters.length - 1;
      for (let i = 1; i < word.letters.length; i++) {
        if (word.letters[i] !== word.letters[i - 1]) continue;
        if (i & 1) odd++; else even++;
        dist = addBernoulli(dist, Math.ceil(n / 2) / n);
      }
    }
    console.log("CONTROL", JSON.stringify({ name, glyphs, words: words.length, odd, even, pTwo: doubledTails(dist)[odd] }));
  }
}

/**
 * Source-linked GF(29)[epsilon]/epsilon^2 code: every one of 841
 * original ordered ciphertext pairs gets a unique (q,r) pair.
 */
function buildPairMap() {
  const powers = [1];
  for (let k = 1; k <= 28; k++) powers[k] = (powers[k - 1] * 19) % 29;
  assert.equal(powers[28], 1);
  const forward = new Array(841);
  const inverse = new Array(841);
  for (let k = 0; k < 812; k++) {
    const a = powers[k % 28];
    const b = 13 * k * powers[(k + 27) % 28] % 29;
    const x = b;
    const y = (a + b) % 29;
    const q = Math.floor(k / 28), r = k % 28;
    const input = x * 29 + y, output = q * 29 + r;
    assert.equal(forward[input], undefined);
    assert.equal(inverse[output], undefined);
    forward[input] = [q, r];
    inverse[output] = [x, y];
  }
  for (let x = 0; x < 29; x++) {
    forward[x * 29 + x] = [x, 28];
    inverse[x * 29 + 28] = [x, x];
  }
  assert.equal(forward.filter(Boolean).length, 841);
  assert.equal(inverse.filter(Boolean).length, 841);
  return { forward, inverse };
}

function originalDisjointPairGate(words) {
  const { forward, inverse } = buildPairMap();
  const rows = CHAPTERS.map(() => ({ original: [], decoded: [] }));
  let recoded = 0, changed = 0;
  for (const word of words) {
    const chapter = CHAPTERS.findIndex(([lo, hi]) => word.page >= lo && word.page <= hi);
    const decoded = [];
    for (let i = 0; i < word.letters.length; i += 2) {
      if (i + 1 >= word.letters.length) {
        decoded.push(word.letters[i]);
        continue;
      }
      const x = word.letters[i], y = word.letters[i + 1];
      const pair = forward[29 * x + y];
      const back = inverse[29 * pair[0] + pair[1]];
      assert.deepEqual(back, [x, y]);
      decoded.push(...pair);
      recoded += 2;
    }
    for (let i = 0; i < decoded.length; i++) if (decoded[i] !== word.letters[i]) changed++;
    rows[chapter].original.push(...word.letters);
    rows[chapter].decoded.push(...decoded);
  }
  console.log("PAIR MAP", JSON.stringify({ recoded, changed, allRoundTrip: true }));
  for (let c = 0; c < 9; c++) {
    const x = rows[c];
    console.log("PAIR GATE", JSON.stringify({ chapter: c + 1, runes: x.original.length, originalIoc29: ioc29(x.original), decodedIoc29: ioc29(x.decoded) }));
    assert.ok(ioc29(x.decoded) < 1.10, "A surviving native-language IoC would require a holdout");
  }
}


/**
 * Independent fixed-word-multiset control. Each source word containing exactly
 * one repeat in chapters 1–5 is permuted until its repeat count stays one.
 * Thus glyph multiset, word length and doublet-bearing words are all held fixed.
 */
function conditionalWordShuffleGate(words) {
  const marked = words.filter(word => {
    if (word.page > 26) return false;
    let n = 0;
    for (let i = 1; i < word.letters.length; i++) if (word.letters[i] === word.letters[i - 1]) n++;
    return n > 0;
  });
  assert.equal(marked.length, 32);
  let state = 0x33012026;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  }
  const acceptedPerWord = 8000;
  let dist = Float64Array.of(1), observed = 0, expectation = 0;
  for (const word of marked) {
    const a = word.letters.slice();
    let originalRepeats = 0;
    for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) {
      originalRepeats++;
      if (i & 1) observed++;
    }
    assert.equal(originalRepeats, 1);
    let accepted = 0, odd = 0, attempts = 0;
    while (accepted < acceptedPerWord && attempts < 2000000) {
      attempts++;
      for (let j = a.length - 1; j > 0; j--) {
        const k = Math.floor(random() * (j + 1));
        [a[j], a[k]] = [a[k], a[j]];
      }
      let repeats = 0, at = 0;
      for (let j = 1; j < a.length; j++) {
        if (a[j] === a[j - 1]) { repeats++; at = j; }
      }
      if (repeats === originalRepeats) {
        accepted++;
        odd += at & 1;
      }
    }
    assert.equal(accepted, acceptedPerWord);
    const p = odd / accepted;
    expectation += p;
    dist = addBernoulli(dist, p);
  }
  const twoTail = doubledTails(dist)[observed];
  assert.equal(observed, 10);
  assert.ok(twoTail > 0.003 && twoTail < 0.007);
  console.log("WORD MULTISET CONTROL", JSON.stringify({ markedWords: marked.length, acceptedPerWord, seed: 0x33012026, observedOdd: observed, expectedOdd: expectation, exactConditionalTwoTail: twoTail }));
}

/**
 * If the within-word odd-pair steps were already GP29 plaintext under any
 * fixed substitution, their IoC would rise. This checks that direct readout.
 */
function differenceReadoutGate(words) {
  const tapes = Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => []));
  for (const word of words) {
    const era = word.page <= 26 ? 0 : 1;
    for (let i = 1; i < word.letters.length; i++) {
      tapes[era][i & 1].push((word.letters[i] - word.letters[i - 1] + 29) % 29);
    }
  }
  const out = tapes.map(era => era.map(vals => ({ n: vals.length, zeros: vals.filter(x => x === 0).length, ioc29: ioc29(vals) })));
  assert.deepEqual(out.map(x => x.map(y => y.n)), [[2167, 2903], [2140, 2850]]);
  assert.deepEqual(out.map(x => x.map(y => y.zeros)), [[22, 10], [14, 17]]);
  assert.ok(Math.abs(out[0][1].ioc29 - 1.0270560671450646) < 1e-10);
  console.log("UNKEYED DELTA READOUT", JSON.stringify(out));
}

const words = parseWords(text, 55);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.letters.length, 0), 12956);
wordLocalParityTest(words);
conditionalWordShuffleGate(words);
differenceReadoutGate(words);
lp1Control();
originalDisjointPairGate(words);
console.log("PASS original typed words, chapter family correction, dual-ring disjoint inverse, LP1 control");
