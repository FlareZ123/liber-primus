'use strict';

/**
 * Original-source LP2 4x4 Fibonacci-prime spiral as a space-changing
 * rune/word-punctuation transducer. Windows Node.js 22 SFT, read-only.
 *
 * Reproduce: node sims/lp2_p15_spiral16_space_reflow_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), 'utf8').replace(/\r\n/g, '\n');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcripts = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeMap = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
assert.equal(transcripts.length, 57);

/** @returns {number[]} */
function sourceSpiralPermutation() {
  const master = read('resources/transcriptions/liber_primus_master.txt');
  const matches = master.match(/^(?:\d+(?:-\d+){3}\/(?:\n|$)){4}/gm) || [];
  assert.equal(matches.length, 1);
  const grid = matches[0].trim().split('\n').map(line =>
    line.replace(/\/$/, '').split('-').map(Number));
  assert.deepEqual(grid, [
    [3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820]
  ]);
  const coordinates = [
    [1,1], [1,2], [2,2], [2,1], [2,0], [1,0], [0,0], [0,1],
    [0,2], [0,3], [1,3], [2,3], [3,3], [3,2], [3,1], [3,0]
  ];
  const values = coordinates.map(([r,c]) => grid[r][c]);
  assert.deepEqual(values, [
    3299,3298,3296,3294,3288,3278,3258,3222,
    3152,3038,2838,2472,1820,708,1206,4516
  ]);
  const order = coordinates.map(([r,c]) => 4*r+c);
  assert.equal(new Set(order).size, 16);
  return order;
}
const spiral = sourceSpiralPermutation();

/**
 * The source file has a separate rune-text segment for each physical page
 * except numeric-only p50. Expose the 2014 printed continuous word tape:
 * 0..28 = GP glyph, 29 = printed '-' space, 30 = printed '.' stop.
 * Preserve source section ornaments (&,$,§) at their exact token offsets.
 * Physical line/page wrapping is layout, never a plaintext word separator.
 * @param {number} first @param {number} last
 */
function originalTape(first, last) {
  const physical = [];
  for (let page = first; page <= last; page++) {
    if (page !== 50) physical.push(transcripts[page < 50 ? page : page-1]);
  }
  const raw = physical.join('').replace(/[\/\n\r]/g, '');
  const tape = [], ornaments = [];
  for (const char of raw) {
    if (runeMap.has(char)) tape.push(runeMap.get(char));
    else if (char === '-') tape.push(29);
    else if (char === '.') tape.push(30);
    else if ('&$§'.includes(char)) ornaments.push({at:tape.length, char});
    else if (!/\s/u.test(char)) throw Error('Unexpected source token ' + char);
  }
  const runeIndices = corpus.pages
    .filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
  assert.deepEqual(tape.filter(n => n < 29), runeIndices);
  return {raw, tape, ornaments, first, last};
}

/** @param {number[]} tape @param {Array<{at:number,char:string}>} marks */
function restoreTape(tape, marks) {
  const characters = corpus.runes.concat(['-', '.']);
  let result = '', k = 0;
  for (let i = 0; i <= tape.length; i++) {
    while (k < marks.length && marks[k].at === i) {
      result += marks[k].char;
      k++;
    }
    if (i < tape.length) result += characters[tape[i]];
  }
  assert.equal(k, marks.length);
  return result;
}

/**
 * A row-major 4x4 source token block is read in the precise red-centre
 * clockwise Fibonacci-prime spiral. 'spiral' is its forward permutation;
 * 'inverse' is the exact reverse, no phase, offset, skip or fitted key.
 * The final incomplete block passes literally and reversibly unchanged.
 * @param {number[]} tape @param {'spiral'|'inverse'|'reverse16'|'identity'} mode
 * @returns {number[]}
 */
function permute(tape, mode) {
  const output = tape.slice();
  if (mode === 'identity') return output;
  for (let offset = 0; offset + 16 <= tape.length; offset += 16) {
    for (let j = 0; j < 16; j++) {
      if (mode === 'spiral') output[offset+j] = tape[offset+spiral[j]];
      else if (mode === 'inverse') output[offset+spiral[j]] = tape[offset+j];
      else if (mode === 'reverse16') output[offset+j] = tape[offset+15-j];
      else throw Error('Unsupported mode');
    }
  }
  return output;
}

/** @param {number[]} tape */
function metrics(tape) {
  const freq = Array(29).fill(0);
  let runeCount = 0, spaces = 0, stops = 0;
  let emptyWords = 0, adjacentSpaces = 0, spaceBeforeStop = 0;
  let words = 0, length = 0, maximumWord = 0, shortWords = 0;
  for (let i = 0; i < tape.length; i++) {
    const v = tape[i];
    if (v < 29) {
      freq[v]++; runeCount++; length++;
      continue;
    }
    if (v === 29) {
      spaces++;
      if (i && tape[i-1] === 29) adjacentSpaces++;
      if (!length) emptyWords++;
    } else {
      assert.equal(v, 30);
      stops++;
      if (i && tape[i-1] === 29) spaceBeforeStop++;
    }
    if (length) {
      words++;
      maximumWord = Math.max(maximumWord, length);
      if (length <= 2) shortWords++;
    }
    length = 0;
  }
  if (length) {
    words++;
    maximumWord = Math.max(maximumWord, length);
    if (length <= 2) shortWords++;
  }
  const topFive = [...freq].sort((a,b) => b-a).slice(0,5)
    .reduce((sum,n) => sum+n, 0) / runeCount;
  const ioc = freq.reduce((sum,n) => sum+n*(n-1), 0)
    / (runeCount*(runeCount-1));
  return {tokens:tape.length,runes:runeCount,spaces,stops,
    words,emptyWords,adjacentSpaces,spaceBeforeStop,
    maximumWord,shortWords,topFive, ioc};
}

function main() {
  const chapter = originalTape(16,22);
  const withheld = originalTape(40,53);
  const solved = originalTape(57,57);
  const expected = [
    {source:chapter, runes:1744, spaces:381, stops:19, words:400},
    {source:withheld, runes:3008, spaces:626, stops:43, words:669},
    {source:solved, runes:95, spaces:16, stops:4, words:20},
  ];
  for (const {source,runes,spaces,stops,words} of expected) {
    const m = metrics(source.tape);
    assert.equal(m.runes, runes);
    assert.equal(m.spaces, spaces);
    assert.equal(m.stops, stops);
    assert.equal(m.words, words);
    assert.equal(m.emptyWords, 0);
    assert.equal(restoreTape(source.tape, source.ornaments), source.raw);
  }
  const result = {source:'LP2 p15 original Fibonacci-prime spiral 4x4',
    order:spiral, retainedPageWrapsAsLayout:true, regions:[]};
  for (const source of [chapter, withheld]) {
    const original = metrics(source.tape);
    const modes = {};
    for (const mode of ['spiral','inverse','reverse16']) {
      const recovered = permute(source.tape, mode);
      const inverse = mode === 'spiral' ? 'inverse'
        : mode === 'inverse' ? 'spiral' : 'reverse16';
      assert.deepEqual(permute(recovered,inverse),source.tape);
      assert.equal(restoreTape(permute(recovered,inverse),
        source.ornaments),source.raw);
      const m = metrics(recovered);
      assert.equal(m.runes,original.runes);
      assert.equal(m.spaces,original.spaces);
      assert.equal(m.stops,original.stops);
      assert.equal(m.topFive,original.topFive);
      assert.equal(m.ioc,original.ioc);
      modes[mode] = m;
    }
    result.regions.push({physicalPages:[source.first,source.last],
      source:original,modes});
  }
  const controls = {};
  for (const mode of ['spiral','inverse']) {
    const inverse = mode === 'spiral' ? 'inverse' : 'spiral';
    const ciphertext = permute(solved.tape,inverse);
    const recovered = permute(ciphertext,mode);
    assert.deepEqual(recovered,solved.tape);
    assert.equal(metrics(recovered).emptyWords,0);
    controls[mode] = {solvedNativeRunes:95,
      fullPunctuationAndWordTapeRoundTrip:true};
  }
  result.positiveControls = controls;
  const [first,held] = result.regions;
  assert.ok(first.modes.spiral.emptyWords >= 30);
  assert.ok(first.modes.inverse.emptyWords >= 30);
  assert.ok(held.modes.spiral.emptyWords >= 30);
  assert.ok(held.modes.inverse.emptyWords >= 30);
  console.log(JSON.stringify(result,null,2));
}
main();
