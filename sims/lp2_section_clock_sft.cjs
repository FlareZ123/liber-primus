"use strict";

/**
 * Source-only SFT: compare the inherited printed-section clock with the
 * alternative later red-title clock at original LP2 physical page 33.
 * Read-only, deterministic, and independent of any proposed cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = read("resources/lp2-transcription.txt").split("%").slice(0, 55);
const RUNE = /[\u16A0-\u16FF]/gu;

/** @param {string} s */
function onlyRunes(s) { return (s.match(RUNE) || []).join(""); }

/** @param {string} s */
function countWords(s) {
  return s.replace(/[/%\s]/gu, "").split(/[-.&$§]/u)
    .filter((part) => onlyRunes(part).length > 0).length;
}

/** @param {string[]} ps */
function sections(ps) {
  return ps.join("%").split("$").slice(0, 8).map((s) => ({
    runes: onlyRunes(s).length,
    words: countWords(s)
  }));
}

/** @param {string[]} ps */
function markerPositions(ps) {
  const out = [];
  let global = 0;
  ps.forEach((s, i) => {
    let local = 0;
    for (const ch of s) {
      if (/[\u16A0-\u16FF]/u.test(ch)) local++;
      else if (ch === "$")
        out.push({ physicalPage: i >= 50 ? i + 1 : i,
          localRuneOffset: local, globalRuneOffset: global + local });
    }
    global += local;
  });
  return out;
}

function main() {
  assert.equal(pages.length, 55);
  for (let i = 0; i < pages.length; i++) {
    const physical = i >= 50 ? i + 1 : i;
    const truth = corpus.pages.find((p) => p.page === physical);
    assert.ok(truth);
    assert.equal(onlyRunes(pages[i]),
      truth.indices.map((n) => corpus.runes[n]).join(""),
      "Canonical rune mismatch at physical page " + physical);
  }
  const originalRunes = onlyRunes(pages.join("%"));
  assert.equal(originalRunes.length, 12956);
  const marked = ink.pages.find((p) => p.page === 33).red_spans;
  assert.deepEqual(marked.map((s) => [s.start, s.length]), [[0, 10], [91, 8]]);
  assert.equal(onlyRunes(pages[33]).slice(91, 99), marked[1].runes);

  const currentMarkers = markerPositions(pages);
  assert.deepEqual(currentMarkers.map((m) => m.globalRuneOffset),
    [729, 1874, 3612, 5506, 6527, 7960, 9640, 12956]);

  const variant = pages.slice();
  variant[32] = variant[32].replace(/\$\s*$/u, "");
  variant[33] = variant[33].replace(/(&\s*)(ᛝᚦᛇ-ᛁᚠᚳᛟᛇ)/u,
    "$1$\n$2");
  assert.notEqual(variant[32], pages[32]);
  assert.notEqual(variant[33], pages[33]);
  assert.equal(onlyRunes(variant.join("%")), originalRunes);

  const alternativeMarkers = markerPositions(variant);
  assert.deepEqual(alternativeMarkers.map((m) => m.globalRuneOffset),
    [729, 1874, 3612, 5506, 6527, 8051, 9640, 12956]);

  const inherited = sections(pages);
  const redTitleClock = sections(variant);
  assert.deepEqual(inherited.map((s) => s.runes),
    [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
  assert.deepEqual(redTitleClock.map((s) => s.runes),
    [729, 1145, 1738, 1894, 1021, 1524, 1589, 3316]);
  assert.deepEqual(inherited.map((s) => s.words),
    [158, 255, 385, 435, 224, 326, 378, 735]);
  assert.deepEqual(redTitleClock.map((s) => s.words),
    [158, 255, 385, 435, 224, 349, 355, 735]);
  assert.equal(inherited.reduce((n, s) => n + s.words, 0), 2896);
  assert.equal(redTitleClock.reduce((n, s) => n + s.words, 0), 2896);

  const report = {
    status: "TWO COMPETING SOURCE CLOCKS; NO LP2 KEY OR PLAINTEXT",
    originalRuneCount: originalRunes.length,
    originalWordCount: 2896,
    sourcePage33RedTitleOffsets: marked.map((s) => s.start),
    inheritedMarkers: currentMarkers,
    laterRedTitleMarkers: alternativeMarkers,
    inheritedSections: inherited,
    laterRedTitleSections: redTitleClock,
    shiftedRunes: 91,
    shiftedWords: 23,
    originalCiphertextBitwisePreserved: true,
    interpretation: "The second p33 red title is a plausible reset; the source alone does not certify any cipher reset."
  };
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) main();
module.exports = { main, markerPositions, sections };
