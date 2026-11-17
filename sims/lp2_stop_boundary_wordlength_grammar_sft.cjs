#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
const RUNIC = /[\u16A0-\u16FF]/u;
const CHAPTER_ENDS = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const EXCLUDE_NONFOURDOT = new Set([57, 58, 59, 60, 91, 125, 127]);
const TRIALS = 12000;

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), 'utf8');
}

/** @param {number[]} lengths @returns {Map<number,number>} */
function endOffsets(lengths) {
  const out = new Map();
  let position = 0;
  lengths.forEach((len, index) => {
    position += len;
    out.set(position, index);
  });
  return out;
}

/** @param {number[]} lengths @param {number[]} stopIndices @returns {{stops:number,beforeShort:number,afterShort:number,delta:number,rate:number}} */
function statistic(lengths, stopIndices) {
  let beforeShort = 0, afterShort = 0;
  for (const i of stopIndices) {
    assert(i >= 0 && i + 1 < lengths.length);
    if (lengths[i] <= 3) beforeShort++;
    if (lengths[i + 1] <= 3) afterShort++;
  }
  return {
    stops: stopIndices.length,
    beforeShort, afterShort,
    delta: afterShort - beforeShort,
    rate: (afterShort - beforeShort) / stopIndices.length
  };
}

/** @param {number[]} lengths @param {number[]} stops @param {Array<[number,number]>} groups @param {number} seed */
function shuffledBoundaryNull(lengths, stops, groups, seed) {
  let state = seed >>> 0;
  /** @returns {number} */
  function draw() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const observed = statistic(lengths, stops);
  let sum = 0, sumSquares = 0, upper = 0, lower = 0;
  for (let trial = 0; trial < TRIALS; trial++) {
    const sample = lengths.slice();
    // Preserve the full GP-word-length inventory in each printed visual chapter.
    for (const [start, end] of groups) {
      for (let j = end - 1; j > start; j--) {
        const k = start + draw() % (j - start + 1);
        const temp = sample[j];
        sample[j] = sample[k];
        sample[k] = temp;
      }
    }
    const d = statistic(sample, stops).delta;
    sum += d;
    sumSquares += d * d;
    if (d >= observed.delta) upper++;
    if (d <= observed.delta) lower++;
  }
  const mean = sum / TRIALS;
  return {
    observed, nullMean: mean,
    nullSd: Math.sqrt(sumSquares / TRIALS - mean * mean),
    upperTail: (upper + 1) / (TRIALS + 1),
    lowerTail: (lower + 1) / (TRIALS + 1)
  };
}

/** @param {string} raw @returns {number[]} */
function dotRuneOffsets(raw) {
  let runes = 0;
  const dots = [];
  for (const character of raw) {
    if (RUNIC.test(character)) runes++;
    else if (character === '.') dots.push(runes);
  }
  return dots;
}

/** @param {number[]} offsets @param {number[]} lengths @returns {number[]} */
function toBoundaries(offsets, lengths) {
  const positions = endOffsets(lengths);
  const out = offsets.map(offset => positions.get(offset));
  assert(out.every(index => index !== undefined && index + 1 < lengths.length));
  return out;
}

/** @param {string} source @param {string} open @param {string} close @returns {string} */
function section(source, open, close) {
  const start = source.indexOf(open);
  const end = source.indexOf(close);
  assert(start >= 0 && end > start);
  return source.slice(start, end);
}

/** @param {string} text @param {number} seed */
function solvedReference(text, seed) {
  const parsed = parseLP2Words(text);
  const lengths = parsed.words.map(word => word.length);
  const stops = toBoundaries(dotRuneOffsets(text), lengths);
  return {words: lengths.length, ...shuffledBoundaryNull(lengths, stops, [[0, lengths.length]], seed)};
}

function main() {
  const raw = read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%');
  const parsed = parseLP2Words(raw);
  const lengths = parsed.words.map(word => word.length);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  const ink = JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
  const originalStops = ink.events.filter(event =>
    event.symbol === '⁘' && !EXCLUDE_NONFOURDOT.has(event.index));
  assert.equal(originalStops.length, 138);
  assert(originalStops.every(event => event.original_ink_event !== false));
  const stops = toBoundaries(originalStops.map(event => event.rune_offset), lengths);
  const chapterBoundaries = [0, ...CHAPTER_ENDS.map(end => endOffsets(lengths).get(end) + 1)];
  assert.deepEqual(chapterBoundaries, [0,158,413,796,1233,1457,1783,2161,2830,2896]);
  const groups = chapterBoundaries.slice(0,-1).map((v,i) => [v,chapterBoundaries[i + 1]]);
  const original = shuffledBoundaryNull(lengths, stops, groups, 0x3301B055);
  assert.deepEqual(original.observed, {
    stops:138, beforeShort:64, afterShort:61, delta:-3, rate:-3 / 138
  });
  const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
  const clearP10to13 = solvedReference(
    section(lp1, 'ᚦᛖ-ᛚᚩᛋᛋ', 'ᚪ-ᛋᚹᚪᛁ'), 0x3301B056);
  const clearWisdom = solvedReference(
    section(lp1, 'ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ', 'ᚹ-ᚣᛠᚹ'), 0x3301B057);
  assert.equal(clearP10to13.observed.stops, 23);
  assert.equal(clearP10to13.observed.delta, 7);
  assert.equal(clearWisdom.observed.stops, 5);
  assert.equal(clearWisdom.observed.delta, 2);
  assert(clearP10to13.upperTail < 0.05);
  const chapter = [];
  for (let index = 0; index < groups.length; index++) {
    const [start,end] = groups[index];
    const local = stops.filter(position => position >= start && position + 1 < end);
    const observed = local.length ? statistic(lengths, local) : null;
    chapter.push({index, words:end-start, ...observed});
  }
  process.stdout.write(JSON.stringify({
    source: {runes:parsed.runeCount,words:parsed.words.length,largeInkStopsIgnored:true,
      originalPixelVerifiedFourDotStops:138},
    original, solvedNativeLP1:{clearP10to13,clearWisdom},
    byOriginalVisualChapter:chapter,
    exactSourceExclusions:[...EXCLUDE_NONFOURDOT],
    null:{trials:TRIALS,permuted:'word-length inventories within printed visual chapters'}
  },null,2) + '\n');
}
main();
