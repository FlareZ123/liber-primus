#!/usr/bin/env node
"use strict";

// Agent48 / Director Issue #2553.
// Full-word outside-in order per source-defined LP2 chapter:
// first, last, second, penultimate, ...; plaintext words are restored
// to their original positions after the key-clock traversal.
//
// The collision gate is key-independent and allows every ciphertext F
// either to be a transparent plaintext-F hold or a consumed non-F symbol.
// Only after that gate selects a chapter does the exact word-relation CSP
// fit a period-8 additive key. The holdout words are excluded from fitting.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createSolver, encode, decodeFixed } = require("./lp2_fhold_word_relation_csp.cjs");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const gold = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const wordFrequency = read("resources/control/english_wordfreq_textblob.txt");

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const extract = (s) => Array.from(s).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
const tokens = (a) => a.map((x) => corpus.translit[x]).join("");
const spaced = (a) => a.map((x) => corpus.translit[x]).join(" ");

function outsideIn(items) {
  const out = [];
  for (let left = 0, right = items.length - 1; left <= right; left++, right--) {
    out.push(items[left]);
    if (left !== right) out.push(items[right]);
  }
  return out;
}
function restoreOutsideIn(items) {
  const out = new Array(items.length);
  for (let left = 0, right = items.length - 1, j = 0; left <= right; left++, right--) {
    out[left] = items[j++];
    if (left !== right) out[right] = items[j++];
  }
  return out;
}
function splitTwoThirds(items) {
  const total = items.reduce((n, w) => n + w.length, 0);
  const limit = Math.floor(total * 2 / 3);
  let split = 0, runes = 0;
  while (split < items.length && runes + items[split].length <= limit) {
    runes += items[split].length;
    split++;
  }
  return { split, prefix: items.slice(0, split), holdout: items.slice(split), totalRunes: total, prefixRunes: runes,
    holdoutRunes: total - runes };
}

// Reconstruct the exact original printed word units across page carries.
const sourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const chunks = transcription.replace(/\r\n/g, "\n").split("%");
const originalWords = [];
let active = [], activePages = [], runeOffset = 0;
function flushWord() {
  if (active.length) originalWords.push({
    indices: active.slice(),
    pages: [...new Set(activePages)],
    begin: runeOffset - active.length,
    end: runeOffset
  });
  active = [];
  activePages = [];
}
for (let pi = 0; pi < sourcePages.length; pi++) {
  for (const ch of chunks[pi]) {
    const value = runeToIndex.get(ch);
    if (value !== undefined) {
      active.push(value);
      activePages.push(sourcePages[pi].page);
      runeOffset++;
    } else if (/\\s/u.test(ch) || ch === "/") {
      // Line wrapping and the printed slash do not end a word.
    } else if ("-.,&$§".includes(ch)) {
      flushWord();
    }
  }
}
flushWord();
const bases = [];
let totalRunes = 0;
for (const page of corpus.pages) {
  bases[page.page] = totalRunes;
  totalRunes += page.runic_count;
}
assert.equal(runeOffset, bases[56], "LP2 p0–55 transcription rune count changed");
assert.equal(originalWords.length, 2896, "LP2 p0–55 complete-word count changed");
assert.deepEqual(originalWords.flatMap((w) => w.indices),
  corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices),
  "Printed word tape does not restore to the original p0–55 rune stream");

const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters = chapterRanges.map(([first, last]) => {
  const a = bases[first], b = bases[last + 1];
  const words = originalWords.filter((w) => w.begin >= a && w.end <= b);
  const crossing = originalWords.filter((w) => w.begin < b && w.end > a && !(w.begin >= a && w.end <= b));
  assert.equal(crossing.length, 0, "A printed word crosses a source-defined chapter boundary");
  const ordered = outsideIn(words);
  assert.deepEqual(restoreOutsideIn(ordered).map((w) => w.indices), words.map((w) => w.indices),
    "Outside-in word permutation is not lossless");
  return { first, last, original: words, ordered, cipher: ordered.flatMap((w) => w.indices) };
});
assert.equal(chapters.reduce((n, c) => n + c.cipher.length, 0), 12956);

// Exact all-subset F-hold collision relaxation for period L.
// State is the last 3L+1 consumed symbols; each ciphertext F can be held
// (no consumption) or consumed. Track min/max same-phase rune and bigram
// collisions at lags L, 2L and 3L over every such path.
function collisionBounds(cipher, L) {
  const depth = 3 * L + 1;
  let states = new Map([["", [0, 0, 0, 0]]]);
  let peakStates = 1;
  for (const symbol of cipher) {
    const next = new Map();
    const ch = String.fromCharCode(symbol);
    const merge = (suffix, old, add) => {
      const candidate = [old[0] + add[0], old[1] + add[0], old[2] + add[1], old[3] + add[1]];
      const prior = next.get(suffix);
      if (prior) {
        prior[0] = Math.min(prior[0], candidate[0]);
        prior[1] = Math.max(prior[1], candidate[1]);
        prior[2] = Math.min(prior[2], candidate[2]);
        prior[3] = Math.max(prior[3], candidate[3]);
      } else next.set(suffix, candidate);
    };
    for (const [suffix, values] of states) {
      if (symbol === 0) merge(suffix, values, [0, 0]); // transparent F hold
      let runeCollisions = 0, bigramCollisions = 0;
      for (let multiple = 1; multiple <= 3; multiple++) {
        const lag = multiple * L;
        if (suffix.length >= lag && suffix.charCodeAt(suffix.length - lag) === symbol) {
          runeCollisions++;
          if (suffix.length > lag &&
              suffix.charCodeAt(suffix.length - 1) === suffix.charCodeAt(suffix.length - lag - 1)) {
            bigramCollisions++;
          }
        }
      }
      merge((suffix + ch).slice(-depth), values, [runeCollisions, bigramCollisions]);
    }
    states = next;
    peakStates = Math.max(peakStates, states.size);
  }
  const out = [Infinity, -Infinity, Infinity, -Infinity];
  for (const values of states.values()) {
    out[0] = Math.min(out[0], values[0]);
    out[1] = Math.max(out[1], values[1]);
    out[2] = Math.min(out[2], values[2]);
    out[3] = Math.max(out[3], values[3]);
  }
  return { rune: [out[0], out[1]], bigram: [out[2], out[3]], peakStates, finalStates: states.size };
}
function collisionStats(consumed, L) {
  let runes = 0, bigrams = 0;
  for (let i = 0; i < consumed.length; i++) {
    for (let multiple = 1; multiple <= 3; multiple++) {
      const lag = multiple * L;
      if (i >= lag && consumed[i] === consumed[i - lag]) {
        runes++;
        if (i > lag && consumed[i - 1] === consumed[i - lag - 1]) bigrams++;
      }
    }
  }
  return [runes, bigrams];
}
function exactOutsideInWindows(words, runeLength, L, maxWindows = 32) {
  const prefix = [0];
  for (const w of words) prefix.push(prefix.at(-1) + w.length);
  const byTotal = new Map(prefix.map((value, i) => [value, i]));
  const starts = [];
  for (let start = 0; start < words.length; start++) {
    const end = byTotal.get(prefix[start] + runeLength);
    if (end !== undefined && end > start) starts.push(start);
  }
  if (!starts.length) return [];
  const count = Math.min(maxWindows, starts.length);
  const windows = [];
  for (let j = 0; j < count; j++) {
    const start = starts[Math.round(j * (starts.length - 1) / Math.max(1, count - 1))];
    const end = byTotal.get(prefix[start] + runeLength);
    const transformed = outsideIn(words.slice(start, end)).flat();
    assert.equal(transformed.length, runeLength);
    windows.push(collisionStats(transformed.filter((x) => x !== 0), L));
  }
  return windows;
}

const translitLongest = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function wordToGP(source) {
  let word = source.toUpperCase().replace(/[^A-Z]/g, "")
    .replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG").replace(/IO/g, "IA");
  if (!word) return null;
  const out = [];
  while (word.length) {
    const match = translitLongest.find((entry) => word.startsWith(entry.s));
    if (!match) return null;
    out.push(match.i);
    word = word.slice(match.s.length);
  }
  return out;
}
function nativeTextWords(text) {
  return text.split(/[^\u16a0-\u16ff]+/u).filter(Boolean)
    .map((w) => extract(w)).filter((w) => w.length);
}
const externalControls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"]
].map(([name, file]) => ({
  name,
  words: (read(file).match(/[A-Za-z]+/g) || []).map(wordToGP).filter(Boolean)
}));
const nativeControls = gold.sections.map((section) => ({
  name: section.name,
  words: nativeTextWords(section.source_text)
}));
const allControls = [...externalControls, ...nativeControls];

const collisionResults = chapters.map((chapter) => {
  const bounds = collisionBounds(chapter.cipher, 8);
  const controls = [];
  for (const control of allControls) {
    const windows = exactOutsideInWindows(control.words, chapter.cipher.length, 8, 32);
    if (!windows.length) continue;
    const runes = windows.map((x) => x[0]);
    const bigrams = windows.map((x) => x[1]);
    const jointPass = windows.filter((x) =>
      x[0] >= bounds.rune[0] && x[0] <= bounds.rune[1] &&
      x[1] >= bounds.bigram[0] && x[1] <= bounds.bigram[1]).length;
    controls.push({
      name: control.name, windows: windows.length,
      runeRange: [Math.min(...runes), Math.max(...runes)],
      bigramRange: [Math.min(...bigrams), Math.max(...bigrams)],
      jointPass
    });
  }
  return {
    pages: [chapter.first, chapter.last],
    words: chapter.original.length,
    runes: chapter.cipher.length,
    cipherF: chapter.cipher.filter((x) => x === 0).length,
    bounds,
    controls,
    totalJointPass: controls.reduce((n, c) => n + c.jointPass, 0)
  };
});
const eligible = collisionResults.filter((x) => x.totalJointPass > 0)
  .sort((a, b) => b.totalJointPass - a.totalJointPass || b.runes - a.runes || a.pages[0] - b.pages[0]);
assert(eligible.length > 0, "No source-defined chapter qualifies; do not run key search");
const selected = eligible[0];
assert.deepEqual(selected.pages, [54, 55], "Collision support selected a different chapter; review before fitting");
assert.equal(selected.totalJointPass, 1, "Unexpected p54–55 collision-support count");

// One fixed source-derived baseline only: the authentic LP1 period-8 key
// DIVINITY (native GP29 spelling DIUINITY), phase 0 at the beginning of p0.
const divinityKey = wordToGP("DIVINITY");
assert.equal(tokens(divinityKey), "DIUINITY");
function firstNoPath(cipher, key, startPhase = 0) {
  let phases = new Set([startPhase]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const phase of phases) {
      const c = cipher[i];
      if (c === 0) {
        next.add(phase); // transparent plaintext F
        if (key[phase] !== 0) next.add((phase + 1) % key.length);
      } else if (c !== key[phase]) next.add((phase + 1) % key.length);
    }
    if (!next.size) return i;
    phases = next;
  }
  return -1;
}
const divinityFirstChapterFailure = firstNoPath(chapters[0].cipher, divinityKey, 0);
assert.equal(divinityFirstChapterFailure, 303, "Fixed DIVINITY baseline contradiction changed");

// Build a GP29 word dictionary from a fixed public frequency list and the
// already-solved native GP29 sections. No p54–55 plaintext is added.
const dict = Array.from({ length: 30 }, () => new Map());
function addDictionaryWord(word) {
  const gp = wordToGP(word);
  if (!gp || !gp.length || gp.length >= dict.length) return;
  dict[gp.length].set(gp.join(","), gp);
}
for (const line of wordFrequency.split(/\r?\n/u)) {
  const fields = line.trim().split(/\s+/u);
  if (fields.length >= 2 && /^[A-Za-z]+$/u.test(fields[0]) && /^\d+$/u.test(fields[1])) {
    addDictionaryWord(fields[0]);
  }
}
for (const section of gold.sections) {
  for (const word of nativeTextWords(section.source_text)) dict[word.length].set(word.join(","), word);
}
const dictionarySize = dict.reduce((n, m) => n + m.size, 0);

// Independent planted native control: a disjoint solved LP1 KOAN text,
// outside-in word order, encrypted with the authentic DIVINITY key and
// transparent-F clock. The first 2/3 trains the exact CSP; the last 1/3
// is excluded from fitting and must be predicted exactly.
const koan = gold.sections.find((s) => s.name === "0_koan_1");
assert(koan, "Missing disjoint native KOAN control");
const controlOriginalWords = nativeTextWords(koan.source_text);
const controlOrderedPlain = outsideIn(controlOriginalWords);
const controlSplit = splitTwoThirds(controlOrderedPlain);
const controlCipher = encode(controlOrderedPlain, divinityKey);
const controlCipherPrefix = controlCipher.slice(0, controlSplit.split);
const controlCipherHoldout = controlCipher.slice(controlSplit.split);
const solver = createSolver(8, dict, 1);
const controlSolve = solver.solve(controlCipherPrefix, { limit: 100000 });
const controlKey = controlSolve.keys.length === 1 ? controlSolve.keys[0] : null;
let controlPrediction = null;
if (controlKey) {
  const controlPrefixPlain = controlKey.p;
  const controlEndPhase = controlPrefixPlain.flat().filter((x) => x !== 0).length % 8;
  const decoded = decodeFixed(controlCipherHoldout, controlKey.key, dict, controlEndPhase, 1);
  if (decoded) {
    const replay = encodeFromPhase(decoded.p, controlKey.key, controlEndPhase);
    controlPrediction = {
      key: spaced(controlKey.key),
      uniqueKey: controlSolve.exact && controlSolve.keys.length === 1,
      paths: controlKey.paths,
      prefixWords: controlSplit.split,
      holdoutWords: controlCipherHoldout.length,
      endPhase: controlEndPhase,
      holdoutExact: JSON.stringify(decoded.p) === JSON.stringify(controlOrderedPlain.slice(controlSplit.split)),
      forwardReplay: JSON.stringify(replay) === JSON.stringify(controlCipherHoldout),
      holdoutPaths: decoded.paths
    };
  }
}
function encodeFromPhase(words, key, startPhase) {
  let phase = startPhase;
  return words.map((word) => word.map((p) => {
    if (p === 0) return 0;
    const c = (p + key[phase]) % 29;
    phase = (phase + 1) % key.length;
    return c;
  }));
}
if (!controlPrediction || controlSolve.keys.length !== 1 || !controlSolve.exact ||
    !controlPrediction.holdoutExact || !controlPrediction.forwardReplay ||
    JSON.stringify(controlKey.key) !== JSON.stringify(divinityKey)) {
  process.stdout.write(JSON.stringify({
    diagnostic: "disjoint native control did not pass",
    controlSolve: {
      exact: controlSolve.exact, exhausted: controlSolve.exhausted,
      nodes: controlSolve.nodes, passes: controlSolve.passes,
      rowVisits: controlSolve.rowVisits, initialRows: controlSolve.initialRows,
      keys: controlSolve.keys.map((x) => ({
        key: spaced(x.key), paths: x.paths, endPhases: x.endPhases
      }))
    },
    controlPrediction,
    dictionarySize,
    controlWords: controlOrderedPlain.length,
    split: controlSplit
  }, null, 2) + "\\n");
  process.exit(0);
}

// Target: the source-selected p54–55 chapter. Prefix = maximal whole-word
// prefix not exceeding 2/3 of the chapter's rune count; remaining words are
// a genuinely withheld continuation. All earlier chapters remain in the
// CSP as ciphertext-only wildcard words, preserving one global phase clock.
const targetChapter = chapters.find((c) => c.first === 54 && c.last === 55);
const targetSplit = splitTwoThirds(targetChapter.ordered);
assert.equal(targetSplit.split, 42);
assert.equal(targetSplit.prefixRunes, 204);
assert.equal(targetSplit.holdout.length, 24);
assert.equal(targetSplit.holdoutRunes, 104);
const targetIndex = chapters.indexOf(targetChapter);
const precedingOrderedWords = chapters.slice(0, targetIndex).flatMap((c) => c.ordered);
const targetPrefixInput = [...precedingOrderedWords, ...targetSplit.prefix];
const wildcardWords = new Set(Array.from({ length: precedingOrderedWords.length }, (_, i) => i));
const targetSolve = solver.solve(targetPrefixInput, { limit: 250000, wildcard: wildcardWords });

let targetPrediction = {
  status: targetSolve.exhausted ? "search-limit-reached" :
    targetSolve.keys.length === 0 ? "no-dictionary-consistent-key" :
    targetSolve.keys.length > 1 ? "multiple-keys" : "one-key",
  exact: targetSolve.exact,
  exhausted: targetSolve.exhausted,
  nodes: targetSolve.nodes,
  passes: targetSolve.passes,
  rowVisits: targetSolve.rowVisits,
  initialRows: targetSolve.initialRows,
  keyCount: targetSolve.keys.length,
  candidates: targetSolve.keys.map((candidate) => ({
    key: spaced(candidate.key),
    paths: candidate.paths,
    endPhases: candidate.endPhases
  }))
};
if (targetSolve.keys.length === 1 && targetSolve.exact && !targetSolve.exhausted) {
  const candidate = targetSolve.keys[0];
  const precedingPlain = candidate.p.slice(0, precedingOrderedWords.length);
  const targetPrefixPlain = candidate.p.slice(precedingOrderedWords.length);
  const targetStartPhase = precedingPlain.flat().filter((x) => x !== 0).length % 8;
  const targetHoldoutStartPhase = (targetStartPhase +
    targetPrefixPlain.flat().filter((x) => x !== 0).length) % 8;
  const holdoutDecoded = decodeFixed(targetSplit.holdout, candidate.key, dict, targetHoldoutStartPhase, 1);
  if (holdoutDecoded) {
    const replay = encodeFromPhase(holdoutDecoded.p, candidate.key, targetHoldoutStartPhase);
    const transformedPlain = [...targetPrefixPlain, ...holdoutDecoded.p];
    const restoredPlain = restoreOutsideIn(transformedPlain);
    targetPrediction = {
      ...targetPrediction,
      key: spaced(candidate.key),
      paths: candidate.paths,
      targetStartPhase,
      holdoutStartPhase: targetHoldoutStartPhase,
      holdoutPaths: holdoutDecoded.paths,
      holdoutForwardReplay: JSON.stringify(replay) === JSON.stringify(targetSplit.holdout),
      holdoutWords: holdoutDecoded.p.map(tokens),
      restoredWords: restoredPlain.map(tokens),
      restoredText: restoredPlain.map(tokens).join(" "),
      dictionaryWords: restoredPlain.filter((w) => dict[w.length]?.has(w.join(","))).length,
      totalWords: restoredPlain.length
    };
  }
}

const output = {
  decisionGate: "period-8 outside-in full-word key-clock test",
  sourceWordTape: { words: originalWords.length, runes: runeOffset, chapterRanges },
  permutation: "first,last,second,penultimate,... within each source-defined chapter; inverse restoration checked",
  period: 8,
  collisionSelection: { chapters: collisionResults, selected },
  fixedDIVINITYBaseline: { key: spaced(divinityKey), phaseAtBookStart: 0, firstChapterFirstNoPath: divinityFirstChapterFailure },
  dictionary: { uniqueWords: dictionarySize, source: "TextBlob word-frequency list plus solved native GP29 sections; no target plaintext" },
  disjointNativeControl: {
    source: "LP1 0_koan_1 native plaintext; synthetic ciphertext encrypted with authentic DIVINITY key under exact outside-in/F-hold model",
    plaintextWords: controlOriginalWords.length,
    plaintextRunes: controlOrderedPlain.flat().length,
    split: { prefixWords: controlSplit.split, prefixRunes: controlSplit.prefixRunes, holdoutWords: controlSplit.holdout.length, holdoutRunes: controlSplit.holdoutRunes },
    solve: { exact: controlSolve.exact, exhausted: controlSolve.exhausted, nodes: controlSolve.nodes, keyCount: controlSolve.keys.length, key: controlKey ? spaced(controlKey.key) : null },
    prediction: controlPrediction
  },
  target: {
    chapter: [54,55],
    originalWords: targetChapter.original.length,
    originalRunes: targetChapter.cipher.length,
    split: { prefixWords: targetSplit.split, prefixRunes: targetSplit.prefixRunes, holdoutWords: targetSplit.holdout.length, holdoutRunes: targetSplit.holdoutRunes },
    precedingCiphertextWordsUsedOnlyAsWildcards: precedingOrderedWords.length,
    solve: targetPrediction
  },
  caveat: "The KOAN positive control is planted, not an observed LP2 ciphertext. It validates the exact solver and outside-in restoration, not the LP2 hypothesis. A target key is not established unless the disjoint holdout prediction is coherent and globally replayable."
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
