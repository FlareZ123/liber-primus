#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const mod29 = (n) => ((n % 29) + 29) % 29;

const onion = readJson("resources/external/2014-onion6-seven-rune-pages.json");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const punctuation = readJson("resources/liber-primus/lp2-punctuation-identity.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const transcription = readText("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const keyText = "FIRFUMFERENFE";
const key = [...keyText].map((c) => corpus.translit.indexOf(c));
assert.equal(key.length, 13);
assert.ok(key.every((n) => n >= 0), "historical key must map into GP29");

function parseColonMarkedPage(page) {
  const symbols = [];
  const skipRuneOffsets = [];
  const colonCharOffsets = [];
  let pendingColon = false;
  let charOffset = 0;
  for (const ch of [...page.runic_text]) {
    if (ch === ":") {
      colonCharOffsets.push(charOffset);
      pendingColon = true;
    } else if (runeIndex.has(ch)) {
      if (pendingColon) skipRuneOffsets.push(symbols.length);
      symbols.push(runeIndex.get(ch));
      pendingColon = false;
    }
    charOffset++;
  }
  assert.equal(pendingColon, false, "no dangling colon marker");
  return { page: page.page, symbols, skipRuneOffsets, colonCharOffsets };
}
const historical = onion.originals
  .filter((p) => p.page === "107" || p.page === "167")
  .map(parseColonMarkedPage);
assert.deepEqual(historical.map((p) => p.symbols.length), [226, 93]);
assert.deepEqual(historical[0].skipRuneOffsets, [49, 58]);
assert.deepEqual(historical[0].colonCharOffsets, [68, 82]);
assert.deepEqual(historical[0].skipRuneOffsets.map((i) => historical[0].symbols[i]), [0, 0]);
assert.deepEqual(historical[0].skipRuneOffsets.map((i) => corpus.translit[historical[0].symbols[i]]), ["F", "F"]);
assert.deepEqual(historical[1].skipRuneOffsets, []);

function decryptHistorical({ carry, markedSkip }) {
  let consumed = 0;
  const decodedPages = [];
  for (const page of historical) {
    const before = consumed;
    const decoded = page.symbols.map((c, i) => {
      if (markedSkip && page.skipRuneOffsets.includes(i)) return c;
      const p = mod29(c - key[consumed % key.length]);
      consumed++;
      return p;
    });
    decodedPages.push({
      page: page.page,
      runeCount: page.symbols.length,
      consumedBefore: before,
      consumedAfter: consumed,
      phaseAfter: consumed % key.length,
      plaintextLabels: decoded.map((i) => corpus.translit[i]).join("")
    });
    if (!carry) consumed = 0;
  }
  return {
    pages: decodedPages,
    consumedTotal: decodedPages.at(-1).consumedAfter,
    plaintextLabels: decodedPages.map((p) => p.plaintextLabels).join("")
  };
}
const historicalContinuous = decryptHistorical({ carry: true, markedSkip: true });
const historicalReset = decryptHistorical({ carry: false, markedSkip: true });
const historicalNoSkip = decryptHistorical({ carry: true, markedSkip: false });
const correctedRoman = onion.corrected_roman.find((p) => p.pages.includes("107")).text;
const normalizedWitness = correctedRoman
  .toUpperCase()
  .replace(/[^A-Z]/g, "")
  .replace(/K/g, "C")
  .replace(/V/g, "U")
  .replace(/DURING/g, "DURNG");
assert.equal(historicalContinuous.plaintextLabels, normalizedWitness,
  "continuous key with only the two explicit colon-F bypasses must match the corrected witness");
assert.notEqual(historicalReset.plaintextLabels, normalizedWitness,
  "page reset is not the historical schedule");
assert.notEqual(historicalNoSkip.plaintextLabels, normalizedWitness,
  "consuming the two explicitly marked F runes is not the historical schedule");
assert.equal(historicalContinuous.pages[0].consumedAfter, 224);
assert.equal(historicalContinuous.pages[0].phaseAfter, 3);
assert.equal(historicalContinuous.consumedTotal, 317);

const pageStarts = [];
let running = 0;
for (const page of corpus.pages) {
  pageStarts.push(running);
  running += page.indices.length;
}
const allIndices = corpus.pages.flatMap((p) => p.indices);
assert.equal(corpus.pages.length, 58);
assert.equal(running, 13136);
assert.equal(corpus.pages.slice(0, 56).reduce((s, p) => s + p.indices.length, 0), 12956);
const pageStartFs = corpus.pages
  .filter((p) => p.indices.length && corpus.translit[p.indices[0]] === "F")
  .map((p) => ({ page: p.page, globalOffset: pageStarts[p.page] }));
assert.deepEqual(pageStartFs, [
  { page: 15, globalOffset: 3603 },
  { page: 40, globalOffset: 9640 }
]);

const red13Marks = [];
for (const page of ink.pages) {
  for (const [localOffset, dotCount, color] of (page.large_punctuation || [])) {
    if (dotCount === 13 && color === "red") {
      red13Marks.push({
        page: page.page,
        localOffset,
        globalOffset: pageStarts[page.page] + localOffset
      });
    }
  }
}
const red13ByOffset = new Map(red13Marks.map((m) => [m.globalOffset, m]));
const red13BeforeF = [...red13ByOffset.values()]
  .filter((m) => allIndices[m.globalOffset] === 0)
  .sort((a, b) => a.globalOffset - b.globalOffset);
assert.deepEqual(red13BeforeF.map((m) => m.globalOffset), [3603, 9640]);
assert.deepEqual(red13BeforeF.map((m) => m.page), [15, 39]);
assert.deepEqual(red13BeforeF.map((m) => corpus.translit[allIndices[m.globalOffset]]), ["F", "F"]);

const smallFullStopsBeforeF = punctuation.events
  .filter((e) => e.symbol === "⁘" && allIndices[e.rune_offset] === 0)
  .map((e) => ({ page: e.page, localOffset: e.local_rune_offset, globalOffset: e.rune_offset }));
const commaMarksBeforeF = punctuation.events
  .filter((e) => e.symbol === "⁚" && allIndices[e.rune_offset] === 0);
assert.equal(smallFullStopsBeforeF.length, 7);
assert.equal(commaMarksBeforeF.length, 0);
assert.equal((transcription.match(/:/g) || []).length, 0);

const p0Ink = ink.pages.find((p) => p.page === 0);
const p0Title = p0Ink.red_spans.find((s) => s.start === 0 && s.length === 13);
assert.ok(p0Title);
assert.equal([...p0Title.runes].length, 13);
const p0Boundary = p0Ink.large_punctuation.find(([offset, dots, color]) =>
  offset === 13 && dots === 13 && color === "red");
assert.ok(p0Boundary);
assert.equal(corpus.translit[corpus.pages[0].indices[13]], "TH",
  "p0 red13 boundary precedes TH, not F");
const redTitleKey = [...p0Title.runes].map((r) => runeIndex.get(r));
assert.equal(redTitleKey.length, 13);

const selectedSkipOffsets = new Set([3603, 9640]);
function directTitleKeyTest(sign) {
  const unknownRuneLimit = 12956;
  let globalOffset = 0;
  let consumed = 0;
  let out = "";
  for (const ch of [...transcription]) {
    if (!runeIndex.has(ch)) {
      if (globalOffset < unknownRuneLimit) out += ch;
      continue;
    }
    if (globalOffset >= unknownRuneLimit) break;
    const c = runeIndex.get(ch);
    if (globalOffset < 13) {
      globalOffset++;
      continue;
    }
    if (selectedSkipOffsets.has(globalOffset)) {
      out += ch;
      globalOffset++;
      continue;
    }
    out += corpus.runes[mod29(c + sign * redTitleKey[consumed % 13])];
    consumed++;
    globalOffset++;
  }
  assert.equal(globalOffset, unknownRuneLimit, "process exactly original LP2 p0-p55");
  const runeLabels = [...out].map((ch) =>
    runeIndex.has(ch) ? corpus.translit[runeIndex.get(ch)] : ch
  ).join("");
  return {
    sign: sign < 0 ? "subtract" : "add",
    consumed,
    finalPhase: consumed % 13,
    preview: runeLabels.slice(0, 360)
  };
}
const directTitleSubtract = directTitleKeyTest(-1);
const directTitleAdd = directTitleKeyTest(1);

const inspectedImages = [
  "17.jpg", "27.jpg", "41.jpg", "43.jpg", "48.jpg", "59.jpg", "65.jpg",
  "31.jpg", "32.jpg", "56.jpg", "57.jpg"
].map((name) => "resources/liber-primus/" + name);
for (const file of inspectedImages) assert.ok(fs.existsSync(path.join(root, file)), "missing original image " + file);

const result = {
  historical_2014_control: {
    source_repository: onion.source_repository,
    source_caveat: onion.source_caveat,
    pages: historical.map((p) => ({
      page: p.page,
      runes: p.symbols.length,
      colon_char_offsets: p.colonCharOffsets,
      colon_before_F_rune_offsets: p.skipRuneOffsets
    })),
    key: keyText,
    key_length: key.length,
    page107_consumed: historicalContinuous.pages[0].consumedAfter,
    page167_start_phase: historicalContinuous.pages[0].phaseAfter,
    total_consumed: historicalContinuous.consumedTotal,
    normalized_corrected_roman_exact_match: true,
    normalization: ["K→C", "V→U", "DURING→DURNG"],
    page_reset_matches: false,
    no_skip_matches: false
  },
  lp2_original_marker_census: {
    pages: corpus.pages.length,
    total_runes: running,
    unknown_p0_to_p55_runes: 12956,
    literal_colons: 0,
    page_start_F: pageStartFs,
    unique_red13_marks: red13ByOffset.size,
    red13_marks_immediately_before_F: red13BeforeF,
    small_full_stop_marks_immediately_before_F: smallFullStopsBeforeF,
    comma_marks_immediately_before_F: 0,
    p0_red_title: p0Title.runes,
    p0_red_title_length: 13,
    p0_red13_boundary_next_rune: "TH",
    interpretation: "two red13 section marks are a reproducible candidate selector for the two page-start F runes, but red13 is a general section marker, not an authenticated F-skip instruction"
  },
  bounded_p0_title_key_test: {
    key: p0Title.runes,
    key_labels: redTitleKey.map((i) => corpus.translit[i]),
    skip_offsets: [...selectedSkipOffsets],
    subtract: directTitleSubtract,
    add: directTitleAdd,
    interpretation: "neither direct sign produces recognizable plaintext; this rejects only the untransformed red-title-as-key hypothesis"
  },
  original_images_inspected: inspectedImages
};
console.log(JSON.stringify(result, null, 2));
console.log("PASS: original 2014 marked-F control reproduced; LP2 red13 candidate and competing punctuation classes enumerated from original source data.");
