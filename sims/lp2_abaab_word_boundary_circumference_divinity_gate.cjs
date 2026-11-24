#!/usr/bin/env node
"use strict";

// Test a source-motivated, reversible word-boundary transducer:
//   1. Use the visible five-site p55 floral pattern ABAAB on word gaps.
//   2. Merge across one polarity of the A/B gaps.
//   3. Shed each resulting packet's first/last rune ("circumference").
//   4. Apply the p57 DIVINITY/DIUINITY key to the packet interior.
// The original word lengths and shells are retained as a reversible sidecar.
//
// This is a bounded hypothesis test, not an assertion that the participant's
// ABAAB interpretation is Cicada-authored. Global and page-reset clocks,
// both polarities, both Vigenere directions, and p16-21/p40-53 holdouts are
// evaluated without tuning.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((s, i) => [s, i]));
const sourcePages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const chunks = read("resources/lp2-transcription.txt").replace(/\r\n/g, "\n").split("%");
const SEPARATORS = new Set(["-", ".", "&", "$", "§"]);
const PATTERN = [1, 0, 1, 1, 0]; // A B A A B
const DIVINITY = [23, 10, 1, 10, 9, 10, 16, 26]; // DIUINITY in GP29

function sourceWords() {
  const words = [];
  let current = [];
  let currentPages = [];
  function finish() {
    if (current.length) {
      words.push({ runes: current, pages: Array.from(new Set(currentPages)) });
    }
    current = [];
    currentPages = [];
  }
  for (let part = 0; part < sourcePages.length; part++) {
    const page = sourcePages[part].page;
    for (const ch of chunks[part]) {
      const rune = runeIndex.get(ch);
      if (rune !== undefined) {
        current.push(rune);
        currentPages.push(page);
      } else if (/\s/.test(ch) || ch === "/") {
        continue;
      } else if (SEPARATORS.has(ch)) {
        finish();
      }
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, w) => n + w.runes.length, 0), 12956);
  return words;
}

function makeGroups(words, clock, polarity) {
  const groups = [];
  let current = { wordIds: [], runes: [], pages: new Set() };
  let phase = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    current.wordIds.push(i);
    current.runes.push(...word.runes);
    for (const p of word.pages) current.pages.add(p);
    if (i === words.length - 1) {
      groups.push(current);
      break;
    }
    if (clock === "page-reset" && words[i + 1].pages[0] !== word.pages[0]) phase = 0;
    const isA = PATTERN[phase % PATTERN.length] === 1;
    const keepBoundary = polarity === "A-keep" ? isA : !isA;
    if (keepBoundary) {
      groups.push(current);
      current = { wordIds: [], runes: [], pages: new Set() };
    }
    phase++;
  }
  return groups;
}

function transformGroup(group, direction, words) {
  const flat = group.runes;
  const shell = flat.length === 1 ? [flat[0]] : [flat[0], flat[flat.length - 1]];
  const interior = flat.slice(1, -1).map((v, i) =>
    (v + direction * DIVINITY[i % DIVINITY.length] + 29 * 4) % 29);
  return {
    wordIds: group.wordIds,
    wordLengths: group.wordIds.map((i) => words[i].runes.length),
    pages: Array.from(group.pages),
    shell,
    interior,
    packetLength: flat.length
  };
}

function inverseGroup(record, direction) {
  const interior = record.interior.map((v, i) =>
    (v - direction * DIVINITY[i % DIVINITY.length] + 29 * 4) % 29);
  const flat = record.shell.length === 1
    ? [record.shell[0]]
    : [record.shell[0], ...interior, record.shell[1]];
  const out = [];
  let offset = 0;
  for (const length of record.wordLengths) {
    out.push(flat.slice(offset, offset + length));
    offset += length;
  }
  assert.equal(offset, flat.length);
  return out;
}

function gpWord(word) {
  let s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  const entries = corpus.translit.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const hit = entries.find(([t]) => s.startsWith(t, i));
    if (hit) { out.push(hit[1]); i += hit[0].length; }
    else i++;
  }
  return out;
}

function englishWords(source) {
  return (source.toUpperCase().match(/[A-Z]+/g) || [])
    .map(gpWord).filter((w) => w.length);
}

function makeBigramModel(source) {
  const counts = new Float64Array(29 * 29).fill(2);
  const totals = new Float64Array(29).fill(58);
  for (const word of englishWords(source)) {
    for (let i = 1; i < word.length; i++) {
      counts[29 * word[i - 1] + word[i]]++;
      totals[word[i - 1]]++;
    }
  }
  return { counts, totals };
}

function measure(records, model) {
  const hist = new Uint32Array(29);
  let log = 0;
  let pairs = 0;
  let interiorRunes = 0;
  for (const record of records) {
    const a = record.interior;
    interiorRunes += a.length;
    for (const x of a) hist[x]++;
    for (let i = 1; i < a.length; i++) {
      log += Math.log(model.counts[29 * a[i - 1] + a[i]] / model.totals[a[i - 1]]);
      pairs++;
    }
  }
  return {
    groups: records.length,
    interiorRunes,
    pairs,
    bigramLog: pairs ? log / pairs : null,
    ioc: interiorRunes > 1
      ? hist.reduce((sum, x) => sum + x * (x - 1), 0) / (interiorRunes * (interiorRunes - 1))
      : 0
  };
}

function scoreGroupsInRange(records, lo, hi, model) {
  const selected = records.filter((r) => r.pages.every((p) => p >= lo && p <= hi));
  return measure(selected, model);
}

function roundTripCheck(words, groups, direction, transformed) {
  for (let i = 0; i < groups.length; i++) {
    const restored = inverseGroup(transformed[i], direction);
    assert.deepEqual(restored, groups[i].wordIds.map((id) => words[id].runes));
  }
  return true;
}

function main() {
  const words = sourceWords();
  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  const gibran = read("resources/control/gibran_prophet_58585.txt");
  const model = makeBigramModel(shakespeare);
  const nativeGibran = englishWords(gibran).map((interior) => ({ interior }));
  const directWordResults = [];
  for (const direction of [-1, 1]) {
    const direct = words.map((w, i) => ({
      wordIds: [i], wordLengths: [w.runes.length], pages: w.pages,
      shell: w.runes.length === 1 ? [w.runes[0]] : [w.runes[0], w.runes[w.runes.length - 1]],
      interior: w.runes.slice(1, -1).map((v, j) =>
        (v + direction * DIVINITY[j % DIVINITY.length] + 116) % 29),
      packetLength: w.runes.length
    }));
    directWordResults.push({ direction, score: measure(direct, model) });
  }

  const output = {
    sourceWords: words.length,
    sourceRunes: words.reduce((n, w) => n + w.runes.length, 0),
    pattern: "ABAAB on interword gaps",
    key: "DIUINITY",
    nativeGibran: measure(nativeGibran, model),
    directOriginalWordInterior: directWordResults,
    results: []
  };

  for (const clock of ["global", "page-reset"]) {
    for (const polarity of ["A-keep", "B-keep"]) {
      const groups = makeGroups(words, clock, polarity);
      for (const direction of [-1, 1]) {
        const transformed = groups.map((g) => transformGroup(g, direction, words));
        const exactRoundTrip = roundTripCheck(words, groups, direction, transformed);
        output.results.push({
          clock,
          polarity,
          direction,
          exactRoundTrip,
          all: measure(transformed, model),
          p16_21: scoreGroupsInRange(transformed, 16, 21, model),
          p40_53: scoreGroupsInRange(transformed, 40, 53, model)
        });
      }
    }
  }

  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}

main();
