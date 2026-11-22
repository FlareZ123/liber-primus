"use strict";

/**
 * Original-source T7 doublet "void" convention: exact page/line/rune and
 * word-local event coordinates; explicit 1649=400+712+537 correction.
 * Read-only Node.js 22 SFT. Execute from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {any} */
const readJSON = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
/** @param {string} p @returns {string} */
const readText = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");

const gp = readJSON("resources/liber-primus/lp2-corpus.json");
const ink = readJSON("resources/liber-primus/lp2-ink-annotations.json");
const text = readText("resources/liber-primus/lp2-transcription.txt");
const alphabet = new Map(gp.runes.map((rune, i) => [rune, i]));
const segments = text.split("%");
assert.equal(segments.length, 57,
  "57 text-bearing physical pages, p50 grid-only omitted");
const originalPages = gp.pages.filter(page => page.page <= 55);
assert.equal(originalPages.length, 56);
const expected = originalPages.flatMap(page => page.indices);
assert.equal(expected.length, 12956);

/**
 * Rune data from the full printed transcription; the only true word breaks
 * are dash and sentence-dot, even across the 32 printed page carries.
 * Slash ends a physical line and percent ends a physical rune-bearing page.
 * Both are deliberately transparent to the word adjacency rule.
 *
 * @typedef {{global:number,page:number,offset:number,line:number,
 *            lineRune:number,rune:number,wordStart:boolean}} Glyph
 * @type {Glyph[]}
 */
const source = [];
let nextWord = true;
for (const [segmentIndex, segment] of segments.entries()) {
  const page = segmentIndex < 50 ? segmentIndex : segmentIndex + 1;
  let offset = 0;
  for (const [lineIndex, line] of segment.split("/").entries()) {
    let lineRune = 0;
    for (const glyph of [...line]) {
      if (alphabet.has(glyph)) {
        lineRune++;
        source.push({
          global: source.length,
          page,
          offset: offset++,
          line: lineIndex + 1,
          lineRune,
          rune: alphabet.get(glyph),
          wordStart: nextWord
        });
        nextWord = false;
      } else if (glyph === "-" || glyph === ".") {
        nextWord = true;
      }
    }
  }
  assert.equal(offset, gp.pages[page].indices.length, "page rune count");
}
assert.equal(source.length, 13136);
for (let i = 0; i < expected.length; i++)
  assert.equal(source[i].rune, expected[i], "unaltered original GP index");

const runes = source.slice(0, 12956);
const words = runes.filter(x => x.wordStart).length;
assert.equal(words, 2896);
/**
 * @param {"page"|"word"|"continuous"} mode
 * @param {number[]} values
 * @returns {number[]}
 */
function repeatedEvents(mode, values) {
  const sites = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1]) continue;
    if (mode === "page" && runes[i].page !== runes[i - 1].page) continue;
    if (mode === "word" && runes[i].wordStart) continue;
    sites.push(i);
  }
  return sites;
}

/**
 * Longest exact strict segment containing no *event second site*.
 * @param {number[]} sites Sorted 0-based second-site coordinates
 * @returns {{start:number,end:number,length:number,left:number|null,right:number|null}}
 */
function longestVoid(sites) {
  let previous = -1;
  let winner = null;
  for (const next of [...sites, runes.length]) {
    const candidate = {
      start: previous + 1, end: next - 1,
      length: next - previous - 1,
      left: previous === -1 ? null : previous,
      right: next === runes.length ? null : next
    };
    if (!winner || candidate.length > winner.length) winner = candidate;
    previous = next;
  }
  return winner;
}

const Dpage = repeatedEvents("page", expected);
const Dword = repeatedEvents("word", expected);
const Dflat = repeatedEvents("continuous", expected);
assert.equal(Dpage.length, 86);
assert.equal(Dword.length, 65);
assert(Dflat.length >= Dpage.length);
const longPage = longestVoid(Dpage);
const longWord = longestVoid(Dword);
assert.deepEqual(longPage, {
  start:3141, end:3851, length:711, left:3140, right:3852
});
assert.deepEqual(longWord, {
  start:8935, end:9916, length:982, left:8934, right:9917
});

/** @param {number} i @returns {object} */
function coordinate(i) {
  const {page, offset, line, lineRune, rune, wordStart} = runes[i];
  return {global:i,page,offset,line,lineRune,GP29:rune,
    transliteration:gp.translit[rune],wordStart};
}

// The original external 1649 "no-doublet" is a union of three distinct
// inter-event gaps. There are two genuine internal repeated-rune events.
const four = [2740,3140,3852,4389];
assert.deepEqual(four.map(i => Dpage.includes(i)), [true,true,true,true]);
assert.deepEqual(four.map(i => Dword.includes(i)), [true,true,true,true]);
const interEventGaps = four.slice(1).map((x, i) => x - four[i]);
assert.deepEqual(interEventGaps, [400,712,537]);
assert.equal(interEventGaps.reduce((sum, n) => sum + n, 0), 1649);
const interval = {start:four[0],end:four.at(-1),length:four.at(-1)-four[0]+1};
const sourceDroughtEvents = Dpage.filter(i => i >= interval.start && i <= interval.end);
assert.deepEqual(sourceDroughtEvents, four);
assert.equal(interval.length, 1650);
const internalDoublets = sourceDroughtEvents.slice(1,-1);
assert.deepEqual(internalDoublets, [3140,3852]);

// Other visible boundaries do not match drought endpoints: check ink
// and 13-dot red page15 transition fixed independently by image markup.
const p15 = ink.pages.find(page => page.page === 15);
assert(p15);
assert.deepEqual(p15.red_spans.map(x => [x.start,x.length]), [[0,9],[9,11]]);
assert.deepEqual(p15.large_punctuation.map(x=>x.slice(0,2)), [[0,13],[9,13],[20,13]]);
const page15GlobalStart = runes.find(x=>x.page===15).global;
assert.equal(page15GlobalStart, 3603);
assert(page15GlobalStart > longPage.start &&
  page15GlobalStart < longPage.end);
const eventPages = [11,12,16,18];
assert.deepEqual(four.map(i=>runes[i].page),eventPages);
assert(eventPages.every(p=>!ink.pages.some(info=>info.page===p &&
  ((info.red_spans||[]).length || (info.large_punctuation||[]).length))),
  "none of the four sparse-run doublet sites are a recorded ink marker");

// Separate original mark at p40 begins well inside longest word-bound gap,
// rather than selecting either endpoint of a 982-symbol regime.
const p40Start = runes.find(x=>x.page===40).global;
assert.equal(p40Start, 9640);
assert(p40Start>longWord.start && p40Start<longWord.end);
const p39 = ink.pages.find(page=>page.page===39);
assert(p39.red_spans.some(x=>x.start===119 && x.length===3));

// Instrument positive: replace a genuine 1650-symbol interval with a
// deterministic alternating GP29 source example; then this same detector
// must recognize its absence of adjacent repeats (no false 4-event claim).
const altered = expected.slice();
for(let i=interval.start;i<=interval.end;i++) altered[i]=i%2;
const positiveEvents = repeatedEvents("page", altered);
assert(positiveEvents.every(i=>i<interval.start||i>interval.end));
const alteredVoid = longestVoid(positiveEvents);
assert(alteredVoid.length>=1650);

console.log(JSON.stringify({
  source:"unchanged exact original LP2 55 rune-bearing unsolved pages",
  sourceRunes:expected.length,
  originalWords:words,
  originalPageLocalDoublets:Dpage.length,
  originalWordLocalDoublets:Dword.length,
  originalUnrestrictedDoublets:Dflat.length,
  apparent1649:{
    fourEventSecondSiteCoordinates:four.map(coordinate),
    gaps:interEventGaps,
    intervalInclusive:interval,
    actualDoubletsWithinInterval:sourceDroughtEvents,
    twoInternalDoublets:internalDoublets,
    diagnosis:"doublet-sparse three-gap union, not a strict 1649 no-doublet run"
  },
  strictPageLocalLongest:{...longPage,from:coordinate(longPage.start),
    to:coordinate(longPage.end)},
  strictWordLocalLongest:{...longWord,from:coordinate(longWord.start),
    to:coordinate(longWord.end)},
  independentOriginalInk:{
    page15RedStartGlobal:page15GlobalStart,
    page15RedMarkBoundaries:[3603,3612,3623],
    page15HeaderInteriorToStrict711:true,
    page40FloralStartGlobal:p40Start,
    page40FloralInteriorToStrict982:true,
    markedEventsExactlyAt1649Endpoints:0
  },
  syntheticZeroEventPlant:{
    length:interval.length,successfulDetector:true,
    longestStrictEventFreeLength:alteredVoid.length
  },
  originalPlaintextRecovered:false,
  sourceSelectedResetOrStateOpcode:false
},null,2));
