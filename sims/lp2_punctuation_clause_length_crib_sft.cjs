#!/usr/bin/env node
"use strict";

/*
 * Frozen original-punctuation clause-length crib test (Director Issue #349).
 * Node.js 18+, no dependencies. Run from any cwd:
 *   node sims/lp2_punctuation_clause_length_crib_sft.cjs
 *
 * This is a finite source-crib screen, not a cipher decoder.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const RUNES_SET = new Set([...RUNES]);
const PAGE0 = "ᛋᚻᛖᚩᚷᛗᛡᚠ";
const SHUFFLE_REPS = 2000;
const SEED_WORD_ORDER = 0x03492026;
const SEED_PUNCTUATION = 0x03492027;

const SOURCES = [
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/cicada2012_blake_chorus.txt",
  "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
  "resources/historical/cicada2012-countdown-message.asc",
  "resources/historical/cicada2012-midi-49-words.txt",
  "resources/historical/cicada2013-forest-clue.asc",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/2013-0-wisdom.txt",
  "resources/historical/cicada2014-stage11-message.asc",
  "resources/historical/cicada2016-4gq25-outguess.asc",
  "resources/historical/cicada2017-yEiTHhvF.asc"
];
const UNRELATED_CONTROL = "resources/control/gibran_prophet_58585.txt";

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/* Exact GP-length approximation already used by sims/wordlength_crib_scan.js. */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < s.length; length++) {
    if (s.startsWith("ING", i)) i += 3;
    else if (["TH", "EO", "OE", "AE", "IA", "EA", "NG"].includes(s.slice(i, i + 2))) i += 2;
    else i++;
  }
  return length;
}
function runeWordLengths(text) {
  return text.split(/[-.&$§•⁜⁘]/u)
    .map(part => [...part].filter(ch => RUNES_SET.has(ch)).length)
    .filter(Boolean);
}
function addBoundary(boundaries, pos, type) {
  const last = boundaries[boundaries.length - 1];
  if (last && last.pos === pos) {
    last.type = [...new Set(last.type.split("+").concat(type))].sort().join("+");
  } else {
    boundaries.push({pos, type});
  }
}
function segmentsFromWords(words, boundaries) {
  const prefix = [0];
  for (const n of words) prefix.push(prefix[prefix.length - 1] + n);
  const out = [];
  let at = 0;
  for (const b of boundaries) {
    if (b.pos > at) {
      out.push({length: prefix[b.pos] - prefix[at], type: b.type,
        wordStart: at, wordEnd: b.pos});
      at = b.pos;
    }
  }
  if (at < words.length) {
    out.push({length: prefix[words.length] - prefix[at], type: "E",
      wordStart: at, wordEnd: words.length});
  }
  return out;
}

/*
 * Frozen source normalization:
 * ASCII alphabetic tokens only; GP-equivalent length per word.
 * "." "!" "?" => stop (S); "," => comma (C); blank paragraph => unit (U).
 * Single newlines are formatting and ignored. Semicolons/colons and other
 * nonalphabetic symbols are not event boundaries. Multiple marks at one
 * word gap are merged into one typed boundary, not converted to zero lengths.
 */
function parseTextEvents(text) {
  const words = [];
  const wordText = [];
  const boundaries = [];
  let current = 0;
  let i = 0;
  const flush = type => {
    if (current > 0) {
      addBoundary(boundaries, words.length, type);
      current = 0;
    } else if (boundaries.length && boundaries[boundaries.length - 1].pos === words.length) {
      addBoundary(boundaries, words.length, type);
    }
  };
  while (i < text.length) {
    if (text[i] === "\n") {
      const blank = /^\n[ \t]*\n+/u.exec(text.slice(i));
      if (blank) {
        flush("U");
        i += blank[0].length;
        continue;
      }
    }
    if (/[A-Za-z]/.test(text[i])) {
      let j = i + 1;
      while (j < text.length && /[A-Za-z]/.test(text[j])) j++;
      const word = text.slice(i, j);
      const n = gpLength(word);
      words.push(n);
      wordText.push(word);
      current += n;
      i = j;
      continue;
    }
    if (text[i] === ",") {
      flush("C");
      i++;
      continue;
    }
    if (".!?".includes(text[i])) {
      flush("S");
      i++;
      continue;
    }
    i++;
  }
  return {words, wordText, boundaries, segments: segmentsFromWords(words, boundaries)};
}

/* 2013-0-wisdom first prose paragraph is already GP29. */
function parseRunicEvents(text) {
  const prose = text.split(/\r?\n\r?\n/u)[0];
  const words = [];
  const boundaries = [];
  let current = 0;
  for (const ch of prose) {
    if (RUNES_SET.has(ch)) current++;
    else if ("•-.&$§".includes(ch)) {
      if (current) {
        words.push(current);
        current = 0;
      }
    } else if (ch === "⁘" || ch === "⁜") {
      if (current) {
        words.push(current);
        current = 0;
      }
      addBoundary(boundaries, words.length, ch === "⁘" ? "S" : "U");
    }
  }
  if (current) words.push(current);
  return {words, wordText: [], boundaries, segments: segmentsFromWords(words, boundaries)};
}

function prepareSource(file, raw) {
  let content = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (file.includes("lp1-plaintext-reference")) {
    content = content.split(/^###\s*56\s*$/m)[0]
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/^\s*###.*$/gm, " ")
      .replace(/^\s*[0-9a-f ]{16,}$/gmi, " ")
      .replace(/^\s*[0-9 ]{8,}$/gm, " ");
  } else if (file.includes("cicada2012_blake_chorus")) {
    const body = content.split("BEGIN SOURCE TEXT")[1];
    assert.ok(body, "Blake source-text delimiter missing");
    content = body.split("END SOURCE TEXT")[0];
  } else if (file.includes("2012-marriage-")) {
    content = content.replace(/([a-z])-\s*\n([a-z])/g, "$1$2");
  } else if (file.endsWith(".asc")) {
    assert.ok(content.startsWith("-----BEGIN PGP SIGNED MESSAGE-----"),
      "Unexpected signed-message format: " + file);
    content = content.split(/\n\n/u).slice(1).join("\n\n")
      .split("-----BEGIN PGP SIGNATURE-----")[0]
      .replace(/[a-z0-9]{16}\.onion/gi, " ");
  } else if (file.includes("2013-book-of-law-")) {
    // Leading N. is a verse label, not a printed sentence stop.
    content = content.replace(/^[ \t]*\d+\.[ \t]*/gm, " ");
  }
  return content;
}
function loadSource(file) {
  const raw = read(file);
  const hash = sha256(raw);
  const content = prepareSource(file, raw);
  const parsed = file.endsWith("2013-0-wisdom.txt")
    ? parseRunicEvents(content) : parseTextEvents(content);
  return {file, sha256: hash, ...parsed};
}

function buildTarget(inventory) {
  const excludedStopIndices = new Set([57, 58, 59, 60, 91, 125, 127]);
  const stops = inventory.events.filter(e => e.symbol === "⁘" && !excludedStopIndices.has(e.index));
  const commas = inventory.events.filter(e => e.symbol === "⁚");
  const reclassified = inventory.events.find(e => e.index === 127);
  const units = inventory.events.filter(e =>
    e.symbol === "⁜" && e.large_mark && e.large_mark.dot_count === 13);

  assert.equal(stops.length, 138);
  assert.equal(commas.length, 4);
  assert.ok(reclassified && reclassified.symbol === "⁘");
  assert.equal(units.length, 28);
  assert.equal(new Set(units.map(e => e.rune_offset)).size, 26);

  const events = stops.map(e => ({offset: e.rune_offset, type: "S"}))
    .concat(commas.map(e => ({offset: e.rune_offset, type: "C"})))
    .concat([{offset: reclassified.rune_offset, type: "C"}])
    .concat(units.map(e => ({offset: e.rune_offset, type: "U"})));
  const byOffset = new Map();
  for (const e of events) {
    if (!byOffset.has(e.offset)) byOffset.set(e.offset, new Set());
    byOffset.get(e.offset).add(e.type);
  }
  const offsets = [...byOffset.keys()].sort((a, b) => a - b);
  const intervals = [];
  let previous = 0;
  for (const offset of offsets) {
    if (offset <= previous) throw new Error("Non-increasing punctuation offsets");
    intervals.push({length: offset - previous,
      type: [...byOffset.get(offset)].sort().join("+"),
      start: previous, end: offset});
    previous = offset;
  }
  assert.equal(intervals.length, 169);
  assert.equal(previous, 12956);
  assert.equal(intervals.reduce((sum, x) => sum + x.length, 0), 12956);
  return {intervals, counts: {
    fourDotStops: stops.length,
    threeDotCommas: commas.length + 1,
    thirteenDotRecords: units.length,
    thirteenDotUniqueOffsets: new Set(units.map(e => e.rune_offset)).size,
    uniqueBoundaries: offsets.length,
    intervals: intervals.length,
    totalRunes: previous
  }};
}

function buildIndex(target, typed, seedLength) {
  const index = new Map();
  for (let i = 0; i <= target.length - seedLength; i++) {
    const key = target.slice(i, i + seedLength)
      .map(x => typed ? String(x.length) + ":" + x.type : String(x.length)).join("|");
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  return {index, seedLength, typed, target};
}
function maxMatch(source, targetIndex) {
  const segments = source.segments;
  const k = targetIndex.seedLength;
  let best = {length: 0, targetStart: -1, sourceStart: -1};
  for (let j = 0; j <= segments.length - k; j++) {
    const key = segments.slice(j, j + k)
      .map(x => targetIndex.typed ? String(x.length) + ":" + x.type : String(x.length)).join("|");
    for (const i of targetIndex.index.get(key) || []) {
      let length = k;
      while (i + length < targetIndex.target.length && j + length < segments.length) {
        const a = targetIndex.target[i + length];
        const b = segments[j + length];
        if (a.length !== b.length || (targetIndex.typed && a.type !== b.type)) break;
        length++;
      }
      if (length > best.length) best = {length, targetStart: i, sourceStart: j};
    }
  }
  return best;
}
function xorshift32(seed) {
  let x = seed >>> 0;
  return function next() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function shuffle(array, rng) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function wordOrderShuffle(source, rng) {
  if (!source.words.length) return {...source, segments: shuffle(source.segments, rng)};
  const words = shuffle(source.words, rng);
  return {...source, words, segments: segmentsFromWords(words, source.boundaries)};
}
function punctuationPositionShuffle(source, rng) {
  if (!source.words.length) return {...source, segments: shuffle(source.segments, rng)};
  const n = source.words.length;
  const k = source.boundaries.length;
  if (!k) return {...source, segments: segmentsFromWords(source.words, [])};
  if (k > n - 1) return wordOrderShuffle(source, rng);
  const positions = shuffle(Array.from({length: n - 1}, (_, i) => i + 1), rng)
    .slice(0, k).sort((a, b) => a - b);
  const types = shuffle(source.boundaries.map(b => b.type), rng);
  const boundaries = positions.map((pos, i) => ({pos, type: types[i]}));
  return {...source, boundaries, segments: segmentsFromWords(source.words, boundaries)};
}
function runNull(sources, lengthIndex, typedIndex, mode, seed, reps, observedLength, observedTyped) {
  const rng = xorshift32(seed);
  const lengthHistogram = {};
  const typedHistogram = {};
  let lengthAtLeastObserved = 0;
  let typedAtLeastObserved = 0;
  for (let rep = 0; rep < reps; rep++) {
    let maxLength = 0;
    let maxTyped = 0;
    for (const source of sources) {
      const shuffled = mode === "word"
        ? wordOrderShuffle(source, rng)
        : punctuationPositionShuffle(source, rng);
      maxLength = Math.max(maxLength, maxMatch(shuffled, lengthIndex).length);
      maxTyped = Math.max(maxTyped, maxMatch(shuffled, typedIndex).length);
    }
    lengthHistogram[maxLength] = (lengthHistogram[maxLength] || 0) + 1;
    typedHistogram[maxTyped] = (typedHistogram[maxTyped] || 0) + 1;
    if (maxLength >= observedLength) lengthAtLeastObserved++;
    if (maxTyped >= observedTyped) typedAtLeastObserved++;
  }
  return {
    repetitions: reps,
    seed: "0x" + seed.toString(16).padStart(8, "0"),
    lengthHistogram,
    typedHistogram,
    lengthP: (lengthAtLeastObserved + 1) / (reps + 1),
    typedP: (typedAtLeastObserved + 1) / (reps + 1)
  };
}
function countSeedHits(sources, target, seedLength) {
  const index = buildIndex(target, false, seedLength);
  let hits = 0;
  for (const source of sources) {
    for (let j = 0; j <= source.segments.length - seedLength; j++) {
      const key = source.segments.slice(j, j + seedLength)
        .map(x => String(x.length)).join("|");
      hits += (index.index.get(key) || []).length;
    }
  }
  return hits;
}
function compareWordLengths(runeLengths, words) {
  const expected = words.map(gpLength);
  return {
    runeWords: runeLengths.length,
    plaintextWords: words.length,
    exact: runeLengths.filter((n, i) => n === expected[i]).length,
    allExact: runeLengths.length === words.length && runeLengths.every((n, i) => n === expected[i])
  };
}
function referencePage(reference, pageNumber) {
  const headings = [...reference.matchAll(/^###\s*(\d+)\s*$/gm)];
  const index = headings.findIndex(h => Number(h[1]) === pageNumber);
  if (index < 0) throw new Error("Missing plaintext reference page " + pageNumber);
  const heading = headings[index];
  const end = headings[index + 1] ? headings[index + 1].index : reference.length;
  return reference.slice(heading.index + heading[0].length, end);
}
function solvedControls() {
  const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
  const lp1Raw = read("resources/transcriptions/lp1_wulfic_canonical.txt");
  const lp1Pages = lp1Raw.split("%").filter(page => [...page].some(ch => RUNES_SET.has(ch)));
  const lp1Page1Words = referencePage(reference, 1).match(/[A-Za-z]+/g) || [];
  const lp1Page1Runes = runeWordLengths(lp1Pages[0]);

  const master = read("resources/transcriptions/liber_primus_master.txt");
  const begin = master.indexOf(PAGE0);
  assert.ok(begin >= 0, "LP2 page-zero incipit missing");
  const pages = master.slice(begin).split("%");
  assert.equal(pages.length, 59);
  const p56Runes = runeWordLengths(pages[56]);
  const p57Runes = runeWordLengths(pages[57]);
  const p56Words = referencePage(reference, 56)
    .replace(/^\s*[0-9a-f ]{16,}$/gmi, " ").match(/[A-Za-z]+/g) || [];
  const p57Words = referencePage(reference, 57).match(/[A-Za-z]+/g) || [];

  const wisdom = parseRunicEvents(read("resources/external/2013-0-wisdom.txt"));
  const wisdomPhrases = [
    "SOME WISDOM", "THE PRIMES ARE SACRED",
    "THE TOTIENT FUNCTION IS SACRED", "ALL THINGS SHOULD BE ENCRYPTED"
  ];
  const wisdomExpected = wisdomPhrases.map(phrase =>
    phrase.split(/\s+/u).reduce((sum, word) => sum + gpLength(word), 0));
  const wisdomActual = wisdom.segments.map(x => x.length);

  return {
    lp1Page1: compareWordLengths(lp1Page1Runes, lp1Page1Words),
    p56: compareWordLengths(p56Runes, p56Words),
    p57: compareWordLengths(p57Runes, p57Words),
    2013Wisdom: {
      actualRunicSegmentLengths: wisdomActual,
      expectedGpLengths: wisdomExpected,
      exactSegments: wisdomActual.filter((n, i) => n === wisdomExpected[i]).length,
      totalSegments: wisdomExpected.length
    }
  };
}
function gibranControl(lengthIndex, typedIndex) {
  let raw = read(UNRELATED_CONTROL).replace(/\r\n/g, "\n");
  const start = /^\*\*\* START OF THIS PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/im.exec(raw);
  const end = /^\*\*\* END OF THIS PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/im.exec(raw);
  raw = raw.slice(start ? start.index + start[0].length : 0, end ? end.index : undefined);
  const parsed = parseTextEvents(raw);
  return {
    file: UNRELATED_CONTROL,
    sha256: sha256(read(UNRELATED_CONTROL)),
    words: parsed.words.length,
    events: parsed.segments.length,
    maxLengthOnly: maxMatch(parsed, lengthIndex),
    maxTyped: maxMatch(parsed, typedIndex)
  };
}

function main() {
  const inventory = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
  const built = buildTarget(inventory);
  const target = built.intervals;
  const sources = SOURCES.map(loadSource);
  const lengthIndex = buildIndex(target, false, 2);
  const typedIndex = buildIndex(target, true, 2);

  const perSource = sources.map(source => ({
    file: source.file,
    sha256: source.sha256,
    words: source.words.length,
    events: source.segments.length,
    maxLengthOnly: maxMatch(source, lengthIndex),
    maxTyped: maxMatch(source, typedIndex)
  }));
  const observedLength = Math.max(...perSource.map(x => x.maxLengthOnly.length));
  const observedTyped = Math.max(...perSource.map(x => x.maxTyped.length));
  const seed6Hits = countSeedHits(sources, target, 6);

  const candidates = [];
  for (const source of sources) {
    const match = maxMatch(source, lengthIndex);
    if (match.length < 2) continue;
    const i = match.targetStart;
    const j = match.sourceStart;
    const typed = source.segments.slice(j, j + 2).every((x, k) =>
      x.length === target[i + k].length && x.type === target[i + k].type);
    candidates.push({source, match, typed});
  }
  candidates.sort((a, b) =>
    b.match.length - a.match.length ||
    Number(b.typed) - Number(a.typed) ||
    a.source.file.localeCompare(b.source.file)
  );

  let holdout = null;
  if (candidates.length) {
    const candidate = candidates[0];
    const i = candidate.match.targetStart;
    const j = candidate.match.sourceStart;
    const nextSource = candidate.source.segments.slice(j + 2, j + 4);
    const nextTarget = target.slice(i + 2, i + 4);
    let predictedOffset = target[i + 1].end;
    const predictions = nextSource.map(x => {
      predictedOffset += x.length;
      return {length: x.length, type: x.type, predictedBoundary: predictedOffset};
    });
    holdout = {
      source: candidate.source.file,
      sourceEventStart: j,
      targetIntervalStart: i,
      seedLengths: candidate.source.segments.slice(j, j + 2).map(x => x.length),
      seedTypes: candidate.source.segments.slice(j, j + 2).map(x => x.type),
      sourceNextTwo: nextSource,
      predictedNextBoundaries: predictions,
      actualNextTwo: nextTarget,
      lengthsPass: nextSource.length === 2 && nextTarget.length === 2 &&
        nextSource.every((x, k) => x.length === nextTarget[k].length),
      typesPass: nextSource.length === 2 && nextTarget.length === 2 &&
        nextSource.every((x, k) => x.type === nextTarget[k].type),
      fullHoldoutPass: nextSource.length === 2 && nextTarget.length === 2 &&
        nextSource.every((x, k) => x.length === nextTarget[k].length && x.type === nextTarget[k].type)
    };
  }

  const nullWordOrder = runNull(sources, lengthIndex, typedIndex,
    "word", SEED_WORD_ORDER, SHUFFLE_REPS, observedLength, observedTyped);
  const nullPunctuation = runNull(sources, lengthIndex, typedIndex,
    "punctuation", SEED_PUNCTUATION, SHUFFLE_REPS, observedLength, observedTyped);
  const controls = solvedControls();
  const unrelated = gibranControl(lengthIndex, typedIndex);
  const totalWords = sources.reduce((sum, x) => sum + x.words.length, 0);
  const totalEvents = sources.reduce((sum, x) => sum + x.segments.length, 0);

  assert.equal(totalWords, 6991);
  assert.equal(totalEvents, 904);
  assert.equal(observedLength, 2);
  assert.equal(observedTyped, 2);
  assert.equal(seed6Hits, 0);
  assert.equal(controls.lp1Page1.allExact, true);
  assert.equal(controls.p56.allExact, true);
  assert.equal(controls.p57.allExact, true);
  assert.equal(controls["2013Wisdom"].exactSegments, 3);

  process.stdout.write(JSON.stringify({
    experiment: "LP2 original punctuation clause-length crib screen",
    target: built.counts,
    sourceCorpus: {
      files: sources.length, words: totalWords, eventIntervals: totalEvents,
      manifest: sources.map(x => ({
        file: x.file, sha256: x.sha256, words: x.words.length, events: x.segments.length
      }))
    },
    observed: {maxLengthOnly: observedLength, maxTyped: observedTyped, perSource},
    seedAndHoldout: {sixIntervalSeedHits: seed6Hits, strongestTwoEventHoldout: holdout},
    nulls: {wordOrder: nullWordOrder, punctuationPosition: nullPunctuation},
    controls,
    unrelatedControl: unrelated,
    normalization: {
      gpWordLength: "QU->CW, V->U, K->C, Z->S; greedily contract TH, EO, OE, AE, IA, EA, NG and ING, per word",
      textBoundaries: {stop: ".!?", comma: ",", unit: "blank paragraph",
        ignored: "single newline, semicolon, colon, other nonalphabetic symbols"},
      specialSource: "2013-0-wisdom first prose paragraph counted directly in GP runes; ⁘=stop, ⁜=unit",
      verseLabels: "leading N. prefixes removed from the three Book of the Law files",
      punctuationReclassification: "event 127 remains ⁘ in the source inventory but is treated as a comma in this morphology-driven test"
    }
  }, null, 2) + "\n");
}
main();
