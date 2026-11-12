"use strict";
/**
 * LP2 original within-page adjacent repeats as a fixed plaintext escape rune.
 *
 * Testable prerequisite for the GP28 predecessor-exclusion proposal:
 * C[i] === C[i-1] iff plaintext[i] === one fixed reserved GP rune.
 *
 * Keep every original word length, word boundary, and physical-page start.
 * Draw GP-native words independently from pinned English sources, preserving
 * the complete LP2 print layout. For ALL 29 possible reserved runes, count
 * non-page-leading occurrences and how many begin printed words.
 * No ciphertext key or language scoring is fitted.
 *
 * Run from the repo root: node sims/lp2_zero_repeat_marker_wordstart_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeEnglish, seededRandom} =
  require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const cipher = source.flatMap(p => p.indices);
const printed = parseLP2Words(
  read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(cipher.length, 12956);
assert.equal(printed.runeCount, cipher.length);
assert.equal(printed.words.length, 2896);

const glyphIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const lengths = printed.words.map(w => w.length);
const fromWords = printed.words.flatMap(w =>
  Array.from(w.runes, r => glyphIndex.get(r)));
assert.deepEqual(fromWords, cipher);

const pageStarts = new Set();
let offset = 0;
for (const page of source) {
  pageStarts.add(offset);
  offset += page.indices.length;
}
assert.equal(offset, cipher.length);

const wordOffset = new Int16Array(cipher.length);
const wordLength = new Int16Array(cipher.length);
offset = 0;
for (const len of lengths) {
  for (let j = 0; j < len; j++) {
    wordOffset[offset] = j;
    wordLength[offset] = len;
    offset++;
  }
}
assert.equal(offset, cipher.length);

/** @param {number[]} data @returns {{total:number,start:number,start2:number}} */
function repeats(data) {
  let total = 0, start = 0, start2 = 0;
  for (let i = 1; i < data.length; i++) {
    if (pageStarts.has(i) || data[i] !== data[i - 1]) continue;
    total++;
    if (wordOffset[i] === 0) {
      start++;
      if (wordLength[i] === 2) start2++;
    }
  }
  return {total, start, start2};
}
const original = repeats(cipher);
assert.deepEqual(original, {total:86, start:23, start2:3});

/** @param {string} text @returns {Map<number,number[][]>} */
function poolsFrom(text) {
  const pools = new Map();
  for (const token of text.toUpperCase().split(/[^A-Z]+/)) {
    if (!token) continue;
    const symbols = encodeEnglish(token);
    if (!symbols.length) continue;
    if (!pools.has(symbols.length)) pools.set(symbols.length, []);
    pools.get(symbols.length).push(symbols);
  }
  assert(lengths.every(len => pools.has(len)));
  return pools;
}

/**
 * @param {Map<number,number[][]>} pools
 * @param {() => number} rng
 * @returns {number[]}
 */
function sampleNative(pools, rng) {
  return lengths.flatMap(len => {
    const candidates = pools.get(len);
    return candidates[Math.floor(rng() * candidates.length)];
  });
}

/**
 * Exclude first rune of every physical page, as the original repeat
 * computation cannot test predecessor identity there.
 * @param {number[]} data
 * @returns {{counts:Int16Array,starts:Int16Array,starts2:Int16Array}}
 */
function symbolLocations(data) {
  const counts = new Int16Array(29);
  const starts = new Int16Array(29);
  const starts2 = new Int16Array(29);
  for (let i = 0; i < data.length; i++) {
    if (pageStarts.has(i)) continue;
    const symbol = data[i];
    counts[symbol]++;
    if (wordOffset[i] === 0) {
      starts[symbol]++;
      if (wordLength[i] === 2) starts2[symbol]++;
    }
  }
  return {counts, starts, starts2};
}

/**
 * Complete reversible 29-to-28 predecessor-exclusion plant for a reserved
 * GP symbol. A repeated output means precisely this same plaintext symbol.
 * @param {number[]} plaintext @param {number} marker
 * @returns {number[]}
 */
function forward(plaintext, marker) {
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    if (pageStarts.has(i)) {
      out.push(plaintext[i]);
    } else if (plaintext[i] === marker) {
      out.push(out[i - 1]);
    } else {
      const rank = plaintext[i] < marker ? plaintext[i] : plaintext[i] - 1;
      out.push((out[i - 1] + rank + 1) % 29);
    }
  }
  return out;
}

/** @param {number[]} ciphertext @param {number} marker @returns {number[]} */
function inverse(ciphertext, marker) {
  return ciphertext.map((v, i) => {
    if (pageStarts.has(i)) return v;
    const delta = (v - ciphertext[i - 1] + 29) % 29;
    if (delta === 0) return marker;
    const rank = delta - 1;
    return rank < marker ? rank : rank + 1;
  });
}

/**
 * Independently authored GP-runic cleartext from the original Liber Primus:
 * LP1 SOME WISDOM, THE LOSS OF DIVINITY, AN INSTRUCTION, and LP2 PARABLE.
 * These are printed literal plaintext, not model-deciphered candidates.
 * Section numbers refer to the original master $-delimited structure.
 *
 * @param {string} section
 * @returns {number[][]}
 */
function clearWords(section) {
  const words = [];
  let current = [];
  function finish() {
    if (current.length) words.push(current);
    current = [];
  }
  for (const glyph of section) {
    if (glyphIndex.has(glyph)) {
      current.push(glyphIndex.get(glyph));
    } else if (glyph === "/" || glyph === "%" || /\s/u.test(glyph)) {
      // Physical line/page breaks do not terminate printed words.
    } else {
      finish();
    }
  }
  finish();
  return words;
}
const masterText = read("resources/transcriptions/liber_primus_master.txt");
const originalSolvedSections = masterText.slice(masterText.indexOf("\n\n") + 2)
  .split("$");
const solvedNative = [2, 4, 6, 17].map(section => {
  const words = clearWords(originalSolvedSections[section]);
  return {
    section, runes:words.reduce((n, w) => n + w.length, 0),
    printedWords:words.length,
    EA:words.reduce((n, w) => n + w.filter(x => x === 28).length, 0),
    EAstarts:words.filter(w => w[0] === 28).length
  };
});
assert.deepEqual(solvedNative.map(x =>
  [x.runes,x.printedWords,x.EA,x.EAstarts]), [
  [157,31,2,0], [755,181,6,0], [89,18,0,0], [95,20,0,0]
]);

/**
 * Corrected 2014-puzzle-independent Old English source profile.
 * Its 10,885 source words contain no fourteen-rune word. The original LP2
 * has three 14-rune words; fill exactly these three slots from deterministic
 * length-14 contiguous genuine Beowulf GP-rune spans (step37). Thus this
 * fourth register is a sensitivity test, not a pure word-sampling control.
 * @param {string} source
 * @returns {Map<number,number[][]>}
 */
function beowulfPools(source) {
  const profile = JSON.parse(source);
  const alphabet = profile.positiveControlAlphabet;
  const sequence = Array.from(profile.sourceGpBase29,
    glyph => alphabet.indexOf(glyph));
  assert.equal(sequence.length, 48012);
  assert(sequence.every(value => value >= 0 && value < 29));
  const pools = new Map();
  let cursor = 0;
  for (const len of profile.allSourceGpWordLengths) {
    if (!pools.has(len)) pools.set(len, []);
    pools.get(len).push(sequence.slice(cursor, cursor + len));
    cursor += len;
  }
  assert.equal(cursor, sequence.length);
  const missing = [...new Set(lengths)].filter(len => !pools.has(len));
  assert.deepEqual(missing, [14]);
  assert.equal(lengths.filter(len => len === 14).length, 3);
  const spans = [];
  for (let i = 0; i + 14 <= sequence.length; i += 37) {
    spans.push(sequence.slice(i, i + 14));
  }
  pools.set(14, spans);
  return pools;
}

const references = [
  ["Shakespeare","shakespeare_first300k.txt",0x330121],
  ["Gibran","gibran_prophet_58585.txt",0x330122],
  ["Emerson","emerson_essays_2944.txt",0x330123],
  ["Beowulf (Old English)","beowulf_oe_gp_profile_corrected.json",0x330124]
];
const REPLICATES = 1500;
const sourceResults = [];
for (const [name, filename, seed] of references) {
  const file = read("resources/control/" + filename);
  const pools = name === "Beowulf (Old English)" ?
    beowulfPools(file) : poolsFrom(file);
  const rng = seededRandom(seed);
  let eaTotalMin = Infinity, eaTotalMax = 0;
  let eaStartMin = Infinity, eaStartMax = 0;
  let eaStart2Min = Infinity, eaStart2Max = 0;
  let eaTotalSum = 0, eaStartSum = 0, eaStart2Sum = 0;
  let anyMarkerJoint = 0, eaJoint = 0, eaStartAtLeast23 = 0;
  let first;
  for (let trial = 0; trial < REPLICATES; trial++) {
    const plain = sampleNative(pools, rng);
    if (trial === 0) first = plain;
    assert.equal(plain.length, cipher.length);
    const loc = symbolLocations(plain);
    const total = loc.counts[28], start = loc.starts[28];
    const start2 = loc.starts2[28];
    eaTotalMin = Math.min(eaTotalMin, total);
    eaTotalMax = Math.max(eaTotalMax, total);
    eaStartMin = Math.min(eaStartMin, start);
    eaStartMax = Math.max(eaStartMax, start);
    eaStart2Min = Math.min(eaStart2Min, start2);
    eaStart2Max = Math.max(eaStart2Max, start2);
    eaTotalSum += total;
    eaStartSum += start;
    eaStart2Sum += start2;
    if (start >= original.start) eaStartAtLeast23++;
    if (Math.abs(total - original.total) <= 10 &&
      start >= original.start) eaJoint++;
    for (let symbol = 0; symbol < 29; symbol++) {
      if (Math.abs(loc.counts[symbol] - original.total) <= 10 &&
        loc.starts[symbol] >= original.start) anyMarkerJoint++;
    }
  }
  // Positive plant: all original print and page positions preserved.
  for (const marker of [0, 11, 28]) {
    const encoded = forward(first, marker);
    assert.deepEqual(inverse(encoded, marker), first);
    const loc = symbolLocations(first);
    const events = repeats(encoded);
    assert.equal(events.total, loc.counts[marker]);
    assert.equal(events.start, loc.starts[marker]);
    assert.equal(events.start2, loc.starts2[marker]);
  }
  sourceResults.push({
    name, seed, replicates:REPLICATES,
    EA: {
      total:[eaTotalMin, eaTotalSum / REPLICATES, eaTotalMax],
      wordStarts:[eaStartMin, eaStartSum / REPLICATES, eaStartMax],
      twoRuneWordStarts:[eaStart2Min,eaStart2Sum / REPLICATES,eaStart2Max],
      startAtLeast23:eaStartAtLeast23,
      near86AndStartAtLeast23:eaJoint
    },
    anyOf29MarkersNear86AndStartAtLeast23:anyMarkerJoint
  });
}
const report = {original, solvedNative, markerCount:29,
  toleranceTotal:10, replicatesPerSource:REPLICATES, sources:sourceResults};
assert(sourceResults.every(x =>
  x.EA.near86AndStartAtLeast23 === 0 &&
  x.anyOf29MarkersNear86AndStartAtLeast23 === 0));
console.log(JSON.stringify(report, null, 2));
