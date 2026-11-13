'use strict';
/**
 * Original solved p57 word-number graph, with and without literal
 * circumference stripping. This is an exact scope check, not LP2 decryption.
 * Run from repository root: node sims/lp2_p57_shed_bodyword_graph_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}
/** @param {number} a @param {number} n @returns {number} */
function mod(a, n) {
  return (a % n + n) % n;
}
/** Parse a physical rune page, respecting source word separators. */
function pageWords(source, runes) {
  const indices = new Map(runes.map((rune, i) => [rune, i]));
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  for (const char of source) {
    if (indices.has(char)) {
      current.push(indices.get(char));
    } else if ('-.$&§'.includes(char) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}
/** @param {number[]} steps @param {number} direction @returns {number[]} */
function nextNodes(steps, direction) {
  return steps.map((step, index) => mod(index + direction * step, steps.length));
}
/** Find each directed cycle, canonicalized at the smallest zero-based vertex. */
function cycles(next) {
  const visited = new Set();
  const output = [];
  for (let start = 0; start < next.length; start++) {
    if (visited.has(start)) continue;
    const path = [];
    const local = new Map();
    let current = start;
    while (!visited.has(current) && !local.has(current)) {
      local.set(current, path.length);
      path.push(current);
      current = next[current];
    }
    if (local.has(current)) {
      const cycle = path.slice(local.get(current));
      let smallest = 0;
      for (let i = 1; i < cycle.length; i++)
        if (cycle[i] < cycle[smallest]) smallest = i;
      output.push(cycle.slice(smallest).concat(cycle.slice(0, smallest)));
    }
    for (const node of path) visited.add(node);
  }
  output.sort((a, b) => a[0] - b[0]);
  return output;
}
function run() {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const page57Source = read('resources/lp2-transcription.txt').split('%')[56];
  const words = pageWords(page57Source, corpus.runes);
  const original = corpus.pages.find(page => page.page === 57).indices;
  assert.equal(words.length, 20);
  assert.deepEqual(words.flat(), original);
  assert.equal(original.length, 95);
  const title = words[0].map(i => corpus.translit[i]).join('');
  assert.equal(title, 'PARABLE');
  const body = words.slice(1);
  assert.equal(body.length, 19);
  const full = body.map(word => word.reduce((n, symbol) => n + corpus.prime[symbol], 0));
  const inner = body.map(word => word.slice(1, -1)
    .reduce((n, symbol) => n + corpus.prime[symbol], 0));
  assert.deepEqual(full, [
    184,72,280,339,66,72,246,86,186,232,21,55,451,151,72,376,115,215,300
  ]);
  assert.deepEqual(inner, [
    44,0,238,201,0,0,126,0,56,90,3,19,385,60,0,184,67,29,166
  ]);
  const strippedFixed = inner.flatMap((sum, index) =>
    sum % 19 === 0 ? [index + 1] : []);
  assert.deepEqual(strippedFixed, [2,5,6,8,12,15]);
  const fullPositive = cycles(nextNodes(full, +1));
  const fullNegative = cycles(nextNodes(full, -1));
  const innerPositive = cycles(nextNodes(inner, +1));
  const innerNegative = cycles(nextNodes(inner, -1));
  assert(fullPositive.some(c => c.join(',') === '5,14,13,8,18'));
  assert(fullNegative.some(c => c.join(',') === '1,7,8,17,16'));
  assert.deepEqual(innerPositive.filter(c => c.length > 1), []);
  assert.deepEqual(innerNegative.filter(c => c.length > 1), []);
  assert.equal(nextNodes(inner, +1)[7], 7);
  assert.equal(nextNodes(inner, -1)[7], 7);
  // Positive test: the graph routine detects a genuine 19-word single cycle.
  assert.deepEqual(cycles(Array.from({length:19}, (_,i) => (i+1)%19)),
    [Array.from({length:19}, (_,i) => i)]);
  // A separate conditional path navigates first and sheds the circumference
  // afterward. Neither the two signs nor their order is source-authenticated.
  const cycleOrder = [[1,7,8,17,16],[14,13,8,18,5]];
  const interiorKey = cycleOrder.flatMap(walk =>
    walk.flatMap(position => body[position - 1].slice(1, -1)));
  assert.deepEqual(interiorKey, [
    10,5,1,4,0,24,5,10,2,10,10,1,10,9,10,16,
    10,9,10,4,5,1,19,0,18,4,18,9,5,18,9
  ]);
  assert.equal(interiorKey.length, 31);
  // The 31 large transcribed events have only 29 distinct rune offsets;
  // their visible morphologies are not all identical.
  const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
  const prefix = [0];
  for (const page of corpus.pages) prefix.push(prefix[prefix.length-1] + page.indices.length);
  const marks = ink.pages.flatMap(page =>
    (page.large_punctuation || []).map(event => prefix[page.page] + event[0]))
    .sort((a,b) => a-b);
  assert.equal(marks.length, 31);
  assert.equal(new Set(marks).size, 29);
  const first = prefix[39] + 240;
  const last = prefix[53] + 179;
  assert(marks.includes(first) && marks.includes(last));
  assert.equal(last - first, 3008);
  const flat = corpus.pages.flatMap(page => page.indices);
  const sector = flat.slice(first, last);
  const counts = Array(29).fill(0);
  for (const index of sector) counts[index]++;
  const sectorIoC = counts.reduce((sum,count) => sum + count*(count-1), 0) /
    (sector.length*(sector.length-1));
  assert(Math.abs(sectorIoC - 0.0345426274862201) < 1e-14);
  return {
    type: 'Exact source-bound interpretation gate; no recovered LP2 plaintext',
    title, bodyWords: 19, runeCount: 95,
    conditionalInteriorKey: {indices: interiorKey,
      latin: interiorKey.map(i => corpus.translit[i]).join(''),
      sourceLargeRecords: marks.length, distinctLargeOffsets: new Set(marks).size,
      largestBetweenMarkSector: {runes: sector.length, ioc: sectorIoC}},
    sourceFullPrimeSums: full, strippedPrimeSums: inner,
    strippedFixedWordPositions: strippedFixed,
    graphs: {
      fullPlus: fullPositive.map(c => c.map(i => i+1)),
      fullMinus: fullNegative.map(c => c.map(i => i+1)),
      shedPlus: innerPositive.map(c => c.map(i => i+1)),
      shedMinus: innerNegative.map(c => c.map(i => i+1))
    },
    decision: 'Literal wordwise removal of first/last GP rune destroys both previously observed five-cycles through WE; WE is a fixed point under either sign.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, pageWords, cycles, nextNodes};
