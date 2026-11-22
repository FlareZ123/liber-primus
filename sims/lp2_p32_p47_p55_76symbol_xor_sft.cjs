#!/usr/bin/env node
"use strict";

/**
 * Agent8: test the source-derived 76-symbol p32/p47 key against p55.
 * Reconstructs the selected words from original canonical resources, checks
 * the 58-page corpus / 57-section transcription alignment, and tests only
 * the direct one-byte-ordinal XOR plus the natural 5-bit GP29 packing.
 *
 * Run from repository root:
 *   node sims/lp2_p32_p47_p55_76symbol_xor_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const sections = transcription.split("%");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const lowDigit = grid.bytes.map((value) => value % 60);

assert.equal(corpus.pages.length, 58);
assert.equal(sections.length, 57);
assert.equal(corpus.pages.find((page) => page.page === 50).indices.length, 0);

/** The corpus has an empty page-50 placeholder; later pages shift one section. */
function sectionIndexForPage(page) {
  if (page === 50) return null;
  return page <= 49 ? page : page - 1;
}

/** @param {string} section @returns {number[][]} */
function pageWords(section) {
  const normalized = section
    .replace(/\//gu, "")
    .replace(/[&$]/gu, "")
    .replace(/\./gu, "-")
    .replace(/\s+/gu, "");
  return normalized.split("-").map((token) =>
    [...token].filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune))
  ).filter((word) => word.length > 0);
}

/** @param {number} start @returns {number[]} */
function terminalCycle(start) {
  if (!Number.isInteger(start) || start < 0 || start >= lowDigit.length) return [];
  const seen = new Map();
  const path = [];
  let value = start;
  while (!seen.has(value)) {
    seen.set(value, path.length);
    path.push(value);
    value = lowDigit[value];
  }
  return path.slice(seen.get(value));
}

function entersRoadCycle(word) {
  const gp0 = word.reduce((sum, value) => sum + value, 0);
  const cycle = terminalCycle(gp0);
  return cycle.length === 2 && cycle.includes(54) && cycle.includes(36);
}

function selectedWords(page, expectedIndexes) {
  const sectionIndex = sectionIndexForPage(page);
  assert.notEqual(sectionIndex, null);
  const words = pageWords(sections[sectionIndex]);
  const indexes = words.map((word, index) => entersRoadCycle(word) ? index : -1)
    .filter((index) => index >= 0);
  assert.deepEqual(indexes, expectedIndexes);
  return expectedIndexes.map((index) => words[index]);
}

function sum(words, selector) {
  return words.flat().reduce((total, value) => total + selector(value), 0);
}

function spell(values) {
  return values.map((value) => value < 29 ? corpus.translit[value] : "[" + value + "]").join("");
}

function pack5(values) {
  const output = [];
  let accumulator = 0;
  let bits = 0;
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 32);
    accumulator = (accumulator << 5) | value;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      output.push((accumulator >> bits) & 0xff);
      accumulator &= (1 << bits) - 1;
    }
  }
  if (bits > 0) output.push((accumulator << (8 - bits)) & 0xff);
  return Buffer.from(output);
}

function unpack5(bytes, count) {
  const output = [];
  let accumulator = 0;
  let bits = 0;
  let cursor = 0;
  while (output.length < count) {
    while (bits < 5) {
      assert.ok(cursor < bytes.length, "truncated five-bit stream");
      accumulator = (accumulator << 8) | bytes[cursor++];
      bits += 8;
    }
    bits -= 5;
    output.push((accumulator >> bits) & 31);
    accumulator &= (1 << bits) - 1;
  }
  return output;
}

function maxPrintableRun(bytes) {
  let current = 0;
  let maximum = 0;
  for (const value of bytes) {
    if (value >= 32 && value <= 126) {
      current += 1;
      maximum = Math.max(maximum, current);
    } else current = 0;
  }
  return maximum;
}

// The 76-key construction is source ordered: p32 selected stream, p47 stream,
// then the ROAD/PATHS -> FOUND two-cycle states.
const p32Selected = selectedWords(32, [3, 7, 12, 13, 14, 17]);
const p47Selected = selectedWords(47, [10, 21, 22, 29, 39, 42, 48, 58]);
const p32Stream = p32Selected.flat();
const p47Stream = p47Selected.flat();
assert.equal(p32Stream.length, 42);
assert.equal(p47Stream.length, 32);
assert.equal(sum(p32Selected, (value) => value), 611);
assert.equal(sum(p32Selected, (value) => corpus.prime[value]), 2209);
assert.equal(sum(p47Selected, (value) => value), 534);
assert.equal(sum(p47Selected, (value) => corpus.prime[value]), 2013);
assert.equal(spell(p32Stream), "WNGHWBMSOEEIIAHOMEXWDSLFDUBHEAWNGUHEONGIAEAJSPTHTEAROE");
assert.equal(spell(p47Stream), "IAYEOEIAGAEFNWLTIAEJEAENGHTHEOBOEAELEOEAAOAAE");

const key8 = [...p32Stream, ...p47Stream, 54, 36];
assert.equal(key8.length, 76);
const key5 = [...p32Stream, ...p47Stream, 54 % 29, 36 % 29];
assert.equal(key5.length, 76);

const targetPage = corpus.pages.find((page) => page.page === 55);
assert.ok(targetPage);
const target = targetPage.indices;
assert.equal(target.length, 76);
const targetSectionIndex = sectionIndexForPage(55);
const targetSectionRuneCount = [...sections[targetSectionIndex]]
  .filter((character) => runeIndex.has(character)).length;
assert.equal(targetSectionRuneCount, target.length);

// Corrected mapping check: every nonempty corpus page agrees with its source
// transcription section, including the page-50 placeholder offset.
const pageCountChecks = corpus.pages.filter((page) => page.indices.length > 0).map((page) => {
  const sectionIndex = sectionIndexForPage(page.page);
  assert.notEqual(sectionIndex, null);
  const count = [...sections[sectionIndex]].filter((character) => runeIndex.has(character)).length;
  assert.equal(count, page.indices.length, "page/section mismatch at corpus page " + page.page);
  return { page: page.page, section: sectionIndex, runes: count };
});

function pageAggregate(page) {
  const sectionIndex = sectionIndexForPage(page.page);
  assert.notEqual(sectionIndex, null);
  const words = pageWords(sections[sectionIndex]);
  const selected = words.filter(entersRoadCycle);
  return {
    page: page.page,
    selectedCount: selected.length,
    selectedRuneLength: selected.reduce((total, word) => total + word.length, 0),
    selectedGp0: selected.flat().reduce((total, value) => total + value, 0),
    selectedPrime: selected.flat().reduce((total, value) => total + corpus.prime[value], 0),
  };
}

const allPageRows = corpus.pages
  .filter((page) => page.page <= 55 && page.indices.length > 0)
  .map(pageAggregate);
const dualSquareMatches = allPageRows.flatMap((row) => {
  const root = Math.round(Math.sqrt(row.selectedPrime));
  return root <= 55 && root * root === row.selectedPrime && row.selectedGp0 === 13 * root
    ? [{ page: row.page, m: root }]
    : [];
});
assert.deepEqual(dualSquareMatches, [{ page: 32, m: 47 }]);
assert.deepEqual(
  allPageRows.find((row) => row.page === 32),
  { page: 32, selectedCount: 6, selectedRuneLength: 42, selectedGp0: 611, selectedPrime: 2209 }
);
assert.deepEqual(
  allPageRows.find((row) => row.page === 47),
  { page: 47, selectedCount: 8, selectedRuneLength: 32, selectedGp0: 534, selectedPrime: 2013 }
);

// Natural bytewise XOR: one GP29 ordinal per byte; the two terminal states
// remain byte values 54 and 36.
const xor8 = target.map((value, index) => value ^ key8[index]);
const xor8RoundTrip = xor8.map((value, index) => value ^ key8[index]);
assert.deepEqual(xor8RoundTrip, target);
const printable8 = xor8.filter((value) => value >= 32 && value <= 126).length;
const invalidGp8 = xor8.filter((value) => value >= 29).length;

// Compact 5-bit GP29 packing. Since the terminal states are addresses rather
// than runes, this variant explicitly projects them into GP29 modulo 29.
const cipher5 = pack5(target);
const key5Bytes = pack5(key5);
assert.equal(cipher5.length, 48);
assert.equal(key5Bytes.length, 48);
const xor5Bytes = Buffer.from(cipher5.map((value, index) => value ^ key5Bytes[index]));
const xor5 = unpack5(xor5Bytes, 76);
const xor5Direct = target.map((value, index) => value ^ key5[index]);
assert.deepEqual(xor5, xor5Direct);
const xor5RoundTrip = xor5.map((value, index) => value ^ key5[index]);
assert.deepEqual(xor5RoundTrip, target);
const invalid5 = xor5.map((value, index) => value >= 29 ? { index, value } : null)
  .filter(Boolean);

const output = {
  source: {
    corpusPages: corpus.pages.length,
    transcriptionSections: sections.length,
    page55Section: targetSectionIndex,
    page55Runes: target.length,
    pageSectionCountChecks: pageCountChecks.length,
  },
  key: {
    p32SelectedWordIndexes: [3, 7, 12, 13, 14, 17],
    p32RuneLength: p32Stream.length,
    p32Gp0Sum: 611,
    p32PrimeSum: 2209,
    p47SelectedWordIndexes: [10, 21, 22, 29, 39, 42, 48, 58],
    p47RuneLength: p47Stream.length,
    p47Gp0Sum: 534,
    p47PrimeSum: 2013,
    appendedStateValues8bit: [54, 36],
    appendedStateResidues5bit: [54 % 29, 36 % 29],
    keyLength: key8.length,
  },
  oneByteOrdinalXor: {
    outputHex: Buffer.from(xor8).toString("hex"),
    printableAsciiBytes: printable8,
    longestPrintableRun: maxPrintableRun(xor8),
    valuesOutsideGp29: invalidGp8,
    outputBytes: xor8,
  },
  fiveBitXor: {
    packedByteLength: xor5Bytes.length,
    output: spell(xor5),
    invalidGp29Codes: invalid5,
    outputValues: xor5,
  },
};
console.log(JSON.stringify(output, null, 2));
