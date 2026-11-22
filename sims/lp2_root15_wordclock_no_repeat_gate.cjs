#!/usr/bin/env node
"use strict";

// Source-constrained root-15 no-repeat transducer gate.
// Run from repository root: node sims/lp2_root15_wordclock_no_repeat_gate.cjs

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseLP2Words, physicalLP2Page } = require("./lp2_word_pages.cjs");

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const mod = (n, m) => ((n % m) + m) % m;
const RUNIC = /[\u16A0-\u16FF]/u;
const START = 29;
const ALPHABET_SIZE = 30;
const SMOOTHING = 0.15;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const raw = read("resources/lp2-transcription.txt");
const stream = raw.split("%").slice(0, 55).join("%");
const translit = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

// Recover exact rune, page, printed-line and printed-word coordinates.
// A slash is a printed line break; '%' is a page break. Neither terminates
// a word. Every other non-rune, non-whitespace character is a word delimiter.
const records = [];
const words = [];
const pageStarts = [];
const wordStarts = [];
const lineStarts = [];
let runePage = 0;
let line = 0;
let word = 0;
let currentWord = [];

function finishWord() {
  if (currentWord.length) {
    words.push(currentWord);
    currentWord = [];
    word += 1;
  }
}

for (const ch of stream) {
  if (RUNIC.test(ch)) {
    const page = physicalLP2Page(runePage);
    const previous = records.at(-1);
    const record = {
      glyph: ch,
      c: runeIndex.get(ch),
      g: records.length,
      page,
      line,
      word,
      offset: currentWord.length,
    };
    assert(Number.isInteger(record.c), "rune missing from GP29 alphabet");
    if (!previous || previous.page !== page) pageStarts.push(record.g);
    if (!currentWord.length) wordStarts.push(record.g);
    if (!previous || previous.page !== page || previous.line !== line) lineStarts.push(record.g);
    records.push(record);
    currentWord.push(record);
  } else if (ch === "%") {
    runePage += 1;
    line = 0;
  } else if (ch === "/") {
    line += 1;
  } else if (/\s/u.test(ch)) {
    // The slash already records the physical line break.
  } else {
    finishWord();
  }
}
finishWord();

const parsed = parseLP2Words(raw, 55);
assert.equal(records.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(parsed.words.length, 2896);
assert.equal(pageStarts.length, 55);
assert.equal(wordStarts.length, 2896);
assert.equal(lineStarts.length, 594);
assert.equal(words.filter((w) => w.length === 1).length, 83);
assert.equal(parsed.crossPageWords, 32);
assert.deepEqual(
  records.map((r) => r.c),
  corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices),
  "transcription scanner must reproduce the canonical original rune stream",
);

const pageStartGlobal = new Map(pageStarts.map((g) => [records[g].page, g]));
const pageOffset = new Array(records.length);
const pageCounts = new Map();
for (const r of records) {
  const n = pageCounts.get(r.page) || 0;
  pageOffset[r.g] = n;
  pageCounts.set(r.page, n + 1);
}

const doublets = [];
for (let i = 1; i < records.length; i += 1) {
  if (records[i].c !== records[i - 1].c) continue;
  const w = words[records[i].word];
  const singleton = w.length === 1;
  const role = singleton
    ? "singleton"
    : records[i].offset === 0
      ? "cross-word"
      : records[i].offset === w.length - 1
        ? "word-end"
        : "interior";
  doublets.push({
    g: i,
    page: records[i].page,
    pageOffset: pageOffset[i],
    line: records[i].line,
    word: records[i].word,
    wordOffset: records[i].offset,
    role,
    crossLine: records[i].page === records[i - 1].page && records[i].line !== records[i - 1].line,
    crossPage: records[i].page !== records[i - 1].page,
  });
}

const roleCounts = (events) => ({
  total: events.length,
  crossWord: events.filter((e) => e.role === "cross-word").length,
  wordEnd: events.filter((e) => e.role === "word-end").length,
  interior: events.filter((e) => e.role === "interior").length,
  singleton: events.filter((e) => e.role === "singleton").length,
  crossLine: events.filter((e) => e.crossLine).length,
  crossPage: events.filter((e) => e.crossPage).length,
});

assert.deepEqual(roleCounts(doublets), {
  total: 86,
  crossWord: 23,
  wordEnd: 19,
  interior: 44,
  singleton: 0,
  crossLine: 4,
  crossPage: 0,
});

const largeMarks = [];
for (const p of annotations.pages || []) {
  if (p.page > 55) continue;
  for (const mark of p.large_punctuation || []) {
    if (pageStartGlobal.has(p.page)) {
      largeMarks.push({ page: p.page, offset: mark[0], size: mark[1], color: mark[2] });
    }
  }
}
const markAdjacent = largeMarks.filter((mark) => {
  const g = pageStartGlobal.get(mark.page) + mark.offset;
  return doublets.some((event) => event.g === g || event.g === g - 1);
});
assert.equal(largeMarks.length, 31);
assert.equal(markAdjacent.length, 0);

// The red-span arithmetic supplies 15 as a candidate primitive root mod 29.
// Its 28 nonzero powers provide a source-derived 28-state clock.
const powers = [];
let power = 1;
for (let i = 0; i < 28; i += 1) {
  powers.push(power);
  power = (power * 15) % 29;
}
assert.equal(new Set(powers).size, 28, "15 must have order 28 modulo 29");
const logarithm = new Map(powers.map((value, exponent) => [value, exponent]));
const key = powers.map((value) => value - 1);
assert.deepEqual([...key].sort((a, b) => a - b), Array.from({ length: 28 }, (_, i) => i));

const resetSets = {
  page: new Set(pageStarts),
  word: new Set(wordStarts),
  line: new Set(lineStarts),
};

// For noninitial runes:
//   D = C_i - C_(i-1) (mod 29)
//   D = 0                 -> plaintext EA (28)
//   D != 0                -> P_i = sign*log_15(D) - K_j (mod 28)
// where K_j = 15^(j+phase)-1 (mod 28).
//
// Page clock: first rune of each page is direct; predecessor and clock reset.
// Word/line clock: predecessor carries across boundaries; only j resets.
// All clocks advance once per rune transition, including zero steps.
// Large punctuation is not a rune and neither advances nor resets the clock.
function decode(cipher, clock, sign, phase) {
  const reset = resetSets[clock];
  const plain = new Array(cipher.length);
  let j = 0;
  let previousCipher = null;

  for (let i = 0; i < cipher.length; i += 1) {
    const c = cipher[i];

    if (clock === "page" && reset.has(i)) {
      plain[i] = c;
      j = 0;
      previousCipher = c;
      continue;
    }
    if (previousCipher === null) {
      plain[i] = c;
      j = 0;
      previousCipher = c;
      continue;
    }
    if (clock !== "page" && reset.has(i)) j = 0;

    const d = mod(c - previousCipher, 29);
    plain[i] = d === 0
      ? 28
      : mod(sign * logarithm.get(d) - key[(j + phase) % 28], 28);

    previousCipher = c;
    j = (j + 1) % 28;
  }
  return plain;
}

function encode(plain, clock, sign, phase) {
  const reset = resetSets[clock];
  const cipher = new Array(plain.length);
  let j = 0;
  let previousCipher = null;

  for (let i = 0; i < plain.length; i += 1) {
    const p = plain[i];

    if (clock === "page" && reset.has(i)) {
      cipher[i] = p;
      j = 0;
      previousCipher = p;
      continue;
    }
    if (previousCipher === null) {
      cipher[i] = p;
      j = 0;
      previousCipher = p;
      continue;
    }
    if (clock !== "page" && reset.has(i)) j = 0;

    const k = key[(j + phase) % 28];
    const d = p === 28 ? 0 : powers[mod(sign * (p + k), 28)];
    cipher[i] = mod(previousCipher + d, 29);
    previousCipher = cipher[i];
    j = (j + 1) % 28;
  }
  return cipher;
}

function encodeWord(token) {
  const normalized = token.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const pair = normalized.slice(i, i + 2);
    const pairIndex = translit.indexOf(pair);
    if (pairIndex >= 0) {
      out.push(pairIndex);
      i += 2;
    } else {
      const singleIndex = translit.indexOf(normalized[i]);
      if (singleIndex >= 0) out.push(singleIndex);
      i += 1;
    }
  }
  return out;
}

// LP1 plaintext supplies a source-native positive control. Sample words with
// the exact LP2 ciphertext word-length profile, then use the ciphertext's
// visible clock boundaries. This tests inversion without assuming that
// plaintext and ciphertext word boundaries must coincide.
const nativeLines = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u)
  .filter((line) => {
    const s = line.trim();
    return !s.startsWith("#") && !s.startsWith("[") && !/^[0-9a-f]{25,}$/iu.test(s);
  });
const nativeWords = (nativeLines.join(" ").match(/[A-Za-z]+/gu) || [])
  .map(encodeWord)
  .filter((w) => w.length);
assert.equal(nativeWords.length, 796);
const pools = new Map();
for (const w of nativeWords) {
  if (!pools.has(w.length)) pools.set(w.length, []);
  pools.get(w.length).push(w);
}
for (const length of words.map((w) => w.length)) {
  assert(pools.has(length), "LP1 control lacks a required GP word length");
}

let seed = 0x192015;
function randomUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const sourceSamples = [];
for (let draw = 0; draw < 300; draw += 1) {
  sourceSamples.push(words.map((w) => {
    const pool = pools.get(w.length);
    return pool[randomUint32() % pool.length];
  }).flat());
}
assert(sourceSamples.every((sample) => sample.length === records.length));

const shakespeare = read("resources/control/shakespeare_first300k.txt");
const trainingText = shakespeare.slice(0, 240000);
const trainingWords = (trainingText.match(/[A-Za-z]+/gu) || [])
  .map(encodeWord)
  .filter((w) => w.length);
const trainingStream = trainingWords.flat();
const contextCounts = Array.from({ length: ALPHABET_SIZE }, () =>
  Array.from({ length: ALPHABET_SIZE }, () => 0));
const trigramCounts = Array.from({ length: ALPHABET_SIZE }, () =>
  Array.from({ length: ALPHABET_SIZE }, () =>
    Array(ALPHABET_SIZE).fill(0)));
const trainingSequence = [START, START, ...trainingStream];
for (let i = 2; i < trainingSequence.length; i += 1) {
  const a = trainingSequence[i - 2];
  const b = trainingSequence[i - 1];
  const c = trainingSequence[i];
  trigramCounts[a][b][c] += 1;
  contextCounts[a][b] += 1;
}

function scoreStream(sequence) {
  let score = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigramCounts[a][b][c] + SMOOTHING) /
      (contextCounts[a][b] + SMOOTHING * ALPHABET_SIZE),
    );
  }
  return score / Math.max(1, sequence.length - 2);
}

const pageOfRune = records.map((r) => r.page);
function scorePages(sequence, predicate) {
  let score = 0;
  let n = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    if (!predicate(pageOfRune[i])) continue;
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigramCounts[a][b][c] + SMOOTHING) /
      (contextCounts[a][b] + SMOOTHING * ALPHABET_SIZE),
    );
    n += 1;
  }
  return score / Math.max(1, n);
}

const cipher = records.map((r) => r.c);
const candidates = [];
for (const clock of ["page", "word", "line"]) {
  for (const sign of [1, -1]) {
    for (const phase of [0, 1]) {
      const plain = decode(cipher, clock, sign, phase);
      candidates.push({
        clock,
        sign,
        phase,
        trainPages: scorePages(plain, (p) => p < 28),
        heldoutPages: scorePages(plain, (p) => p >= 28),
        fullStream: scoreStream(plain),
        wordlessStream: plain,
        eaCount: plain.filter((x) => x === 28).length,
      });
    }
  }
}
candidates.sort((a, b) => b.trainPages - a.trainPages);
const best = candidates[0];
const bestPlain = decode(cipher, best.clock, best.sign, best.phase);
const rawScores = {
  trainPages: scorePages(cipher, (p) => p < 28),
  heldoutPages: scorePages(cipher, (p) => p >= 28),
  fullStream: scoreStream(cipher),
};

const controlScores = sourceSamples.map(scoreStream);
const sortedControlScores = [...controlScores].sort((a, b) => a - b);
const quantile = (p) => sortedControlScores[Math.floor((sortedControlScores.length - 1) * p)];
const mean = controlScores.reduce((a, b) => a + b, 0) / controlScores.length;

const plant = sourceSamples[0];
const plantCipher = encode(plant, best.clock, best.sign, best.phase);
const plantBack = decode(plantCipher, best.clock, best.sign, best.phase);
const plantEA = plant.filter((x) => x === 28).length;
const plantDoublets = plantCipher.reduce(
  (n, c, i) => n + (i > 0 && c === plantCipher[i - 1] ? 1 : 0),
  0,
);
assert.deepEqual(plantBack, plant, "source-native positive control must round-trip exactly");
assert.equal(plantDoublets, plantEA, "zero steps must correspond exactly to GP-EA on the word clock");

const bestEvents = doublets.filter((e) => e.g + 1 < bestPlain.length);
const successorCounts = new Map();
for (const e of bestEvents) {
  const successor = bestPlain[e.g + 1];
  successorCounts.set(successor, (successorCounts.get(successor) || 0) + 1);
}
const maxSuccessorMultiplicity = Math.max(...successorCounts.values());

const summary = {
  model: "root-15 discrete-log difference transducer with source-visible clock resets",
  source: {
    runes: records.length,
    physicalPages: pageStarts.length,
    words: words.length,
    singletonWords: words.filter((w) => w.length === 1).length,
    printedLines: lineStarts.length,
    wordsCrossingPage: parsed.crossPageWords,
    largeMarksOnUnsolvedPages: largeMarks.length,
    largeMarksAdjacentToDoublets: markAdjacent.length,
    doublets: roleCounts(doublets),
    trainPageDoublets: roleCounts(doublets.filter((e) => e.page < 28)),
    heldoutPageDoublets: roleCounts(doublets.filter((e) => e.page >= 28)),
    doubletPositions: doublets,
  },
  sourceRoot: {
    primitiveRoot: 15,
    order: powers.length,
    powers,
    zeroBasedClockValues: key,
    clockPhasesTested: [0, 1],
    orientationsTested: [1, -1],
  },
  resetSemantics: {
    page: "first rune of each physical page is direct; previous ciphertext and clock reset",
    word: "clock resets at printed word starts; previous ciphertext carries across words, lines and pages",
    line: "clock resets at printed line starts; previous ciphertext carries across lines and pages",
    largeMarks: "pass without consuming or resetting a rune clock",
    zeroDifference: "decode as GP-EA (index 28); clock advances once for that rune",
    singletonWords: "their sole rune is processed as a normal transition under the word clock; no special omission",
  },
  candidateScores: candidates.map(({ wordlessStream, ...row }) => row),
  selectedOnPages0To27: {
    clock: best.clock,
    sign: best.sign,
    phase: best.phase,
    trainPages: best.trainPages,
    heldoutPages: best.heldoutPages,
    fullStream: best.fullStream,
    eaCount: best.eaCount,
    postDoubletSuccessors: bestEvents.length,
    distinctPostDoubletSuccessors: successorCounts.size,
    maxPostDoubletSuccessorMultiplicity: maxSuccessorMultiplicity,
    postDoubletSuccessorCounts: Object.fromEntries(
      [...successorCounts.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([rune, count]) => [translit[rune], count]),
    ),
  },
  rawCipherScores: rawScores,
  nativeLP1MatchedControls: {
    draws: controlScores.length,
    sourceWords: nativeWords.length,
    scoreMean: mean,
    scoreP05: quantile(0.05),
    scoreP50: quantile(0.5),
    scoreP95: quantile(0.95),
    positiveControlRunes: plant.length,
    exactRoundTripRunes: plantBack.filter((x, i) => x === plant[i]).length,
    sourceEA: plantEA,
    ciphertextDoublets: plantDoublets,
  },
};

process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
