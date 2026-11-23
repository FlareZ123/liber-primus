#!/usr/bin/env node
'use strict';

// Reproduce the candidate p50 -> functional graph -> base-29 2016 word-register route.
// Run from the repository root:
//   node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs
// Optional fixed-multiset permutation null:
//   node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs --null=100000

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const signed = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'),
  'utf8'
);
const historical2014 = readJson('resources/cicada2014-sexagesimal-source.json');

const crypto = require('crypto');

// Full row-major human visual transcription from original scans 66/67/68.
// This is a recorded source read, not an OCR inference from lp2-grid-256.json.
const visualRowsByPage = {
  "49": [
    [
      "3N",
      "3p",
      "2l",
      "36",
      "1b",
      "3v",
      "26",
      "33"
    ],
    [
      "1W",
      "49",
      "2a",
      "3g",
      "47",
      "04",
      "33",
      "3W"
    ],
    [
      "21",
      "3M",
      "0F",
      "0X",
      "1g",
      "2H",
      "0x",
      "1R"
    ],
    [
      "1n",
      "3I",
      "2r",
      "0P",
      "2U",
      "16",
      "2L",
      "2D"
    ],
    [
      "1t",
      "1s",
      "3H",
      "0d",
      "0s",
      "1K",
      "2D",
      "05"
    ],
    [
      "1K",
      "1O",
      "0S",
      "1D",
      "3o",
      "1l",
      "3J",
      "1G"
    ],
    [
      "4D",
      "0G",
      "0l",
      "0x",
      "1Q",
      "2p",
      "2a",
      "1K"
    ],
    [
      "4E",
      "1w",
      "2Q",
      "19",
      "1k",
      "3G",
      "24",
      "0p"
    ],
    [
      "22",
      "4F",
      "0P",
      "3C",
      "3J",
      "1D",
      "2n",
      "1m"
    ],
    [
      "2i",
      "1J",
      "3P",
      "2v",
      "1s",
      "2O",
      "0k",
      "1M"
    ]
  ],
  "50": [
    [
      "2M",
      "0w",
      "3L",
      "3D",
      "2r",
      "0S",
      "1p",
      "15"
    ],
    [
      "3V",
      "3e",
      "3I",
      "0n",
      "3u",
      "1O",
      "0u",
      "0Z"
    ],
    [
      "3g",
      "2U",
      "1C",
      "0Y",
      "1N",
      "3n",
      "0W",
      "3Q"
    ],
    [
      "22",
      "13",
      "0V",
      "3c",
      "0E",
      "34",
      "0W",
      "1t"
    ],
    [
      "1D",
      "2N",
      "3H",
      "47",
      "0s",
      "2p",
      "0Z",
      "34"
    ],
    [
      "0g",
      "3v",
      "1Q",
      "0s",
      "0D",
      "0K",
      "2h",
      "3D"
    ],
    [
      "3L",
      "2x",
      "1Q",
      "20",
      "2n",
      "2L",
      "1C",
      "2p"
    ],
    [
      "0A",
      "29",
      "3r",
      "0D",
      "45",
      "0k",
      "2e",
      "2W"
    ],
    [
      "25",
      "3U",
      "1W",
      "2r",
      "46",
      "2s",
      "2X",
      "39"
    ],
    [
      "3p",
      "0X",
      "0E",
      "1q",
      "0q",
      "4B",
      "49",
      "48"
    ],
    [
      "3r",
      "3b",
      "3C",
      "1M",
      "1j",
      "0I",
      "4A",
      "48"
    ],
    [
      "40",
      "3m",
      "4E",
      "0s",
      "2S",
      "1v",
      "3T",
      "0I"
    ],
    [
      "3t",
      "2B",
      "2k",
      "2t",
      "2O",
      "0e",
      "2l",
      "1L"
    ]
  ],
  "51": [
    [
      "28",
      "2a",
      "0J",
      "1L",
      "0c",
      "3C",
      "2o",
      "0X"
    ],
    [
      "00",
      "2Z",
      "2d",
      "1T",
      "2u",
      "1t",
      "1j",
      "0l"
    ],
    [
      "1o",
      "1E",
      "3T",
      "18",
      "3E",
      "1G",
      "27",
      "0L"
    ],
    [
      "0v",
      "2t",
      "06",
      "11",
      "1A",
      "2U",
      "4B",
      "1O"
    ],
    [
      "2M",
      "3d",
      "2S",
      "0x",
      "0w",
      "0q",
      "0p",
      "2V"
    ],
    [
      "18",
      "0q",
      "1D",
      "49",
      "2O",
      "00",
      "1v",
      "2t"
    ],
    [
      "1k",
      "3s",
      "3G",
      "21",
      "3w",
      "0W",
      "29",
      "2r"
    ],
    [
      "2O",
      "2L",
      "0g",
      "3Y",
      "0M",
      "0u",
      "3I",
      "3C"
    ],
    [
      "1r",
      "2c",
      "2q",
      "3o",
      "30",
      "0a",
      "39",
      "1K"
    ]
  ]
};
const visualTokens = [49, 50, 51].flatMap(page => visualRowsByPage[page].flat());
const visualTokenText = [49, 50, 51]
  .flatMap(page => visualRowsByPage[page].map(row => row.join(' ')))
  .join(String.fromCharCode(10)) + String.fromCharCode(10);
const visualTokenHash = crypto.createHash('sha256').update(visualTokenText).digest('hex');
const expectedVisualTokenHash = '463c57a3949a941027c416522d1b0463a196efb2faa3550377ba15829dcdf6c4';
if (visualTokens.length !== 256 || visualTokenHash !== expectedVisualTokenHash) {
  throw new Error('The full original-scan visual transcription changed');
}
const expectedScanHashes = {
  '66.jpg': 'aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335',
  '67.jpg': 'bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776',
  '68.jpg': '2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b'
};
for (const [name, expected] of Object.entries(expectedScanHashes)) {
  const actual = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, 'resources/liber-primus', name)))
    .digest('hex');
  if (actual !== expected) throw new Error('Original scan checksum mismatch: ' + name);
}


const next = grid.bytes;
const cells = grid.pages.flatMap(page => page.tokens.map((token, local) => ({
  page: page.page,
  image: page.image,
  row: Math.floor(local / page.cols),
  col: local % page.cols,
  token
})));
if (cells.length !== 256) throw new Error('Expected 256 source cells');
if (JSON.stringify(visualTokens) !== JSON.stringify(cells.map(cell => cell.token))) {
  throw new Error('Original-scan visual transcription disagrees with canonical grid tokens');
}
if (!Array.isArray(next) || next.length !== 256 ||
    next.some(x => !Number.isInteger(x) || x < 0 || x > 255)) {
  throw new Error('Expected exactly 256 byte values in lp2-grid-256.json');
}

const start = signed.indexOf('Hello.');
const end = signed.indexOf('-----BEGIN PGP SIGNATURE-----', start);
if (start < 0 || end < 0) throw new Error('Could not isolate signed-message body');

const body = signed.slice(start, end).replace(/\b7A35090F\b/g, ' ');
const words = body.match(/[A-Za-z]+/g) || [];
if (words.length !== 43) {
  throw new Error('Expected 43 signed-message words after removing key ID; got ' + words.length);
}

const runeTokens = corpus.translit
  .map((token, index) => ({ token: String(token).toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function wordRunes(word) {
  let remaining = String(word).toLowerCase()
    .replace(/v/g, 'u')
    .replace(/k/g, 'c')
    .replace(/z/g, 's');
  const out = [];
  while (remaining.length) {
    const match = runeTokens.find(x => remaining.startsWith(x.token));
    if (!match) throw new Error('Unmapped GP transliteration in word: ' + word + ' at ' + remaining);
    out.push(match.index);
    remaining = remaining.slice(match.token.length);
  }
  return out;
}

const wordValues = words.map(word => wordRunes(word).reduce((sum, x) => sum + x, 0));

const bodyWords = words.slice(1, 30); // The 29-word core excludes the separate Hello. salutation.
if (bodyWords.length !== 29 || bodyWords[3].toLowerCase() !== 'empty' ||
    bodyWords[4].toLowerCase() !== 'epiphany' || bodyWords[28].toLowerCase() !== 'direction') {
  throw new Error('The source-selected 29-word body register no longer matches the signed payload');
}
const bodyWordValues = bodyWords.map(word => wordRunes(word).reduce((sum, x) => sum + x, 0));
const wordPrimeValues = words.map(word => wordRunes(word).reduce((sum, x) => sum + corpus.prime[x], 0));
const bodyPrimeValues = wordPrimeValues.slice(1, 30);

const transcription = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p0Text = transcription.split('%')[0];
const p0WordSpans = [];
let p0Offset = 0;
let p0Current = [];
function flushP0Word() {
  if (!p0Current.length) return;
  p0WordSpans.push({
    ordinal: p0WordSpans.length + 1,
    start: p0Offset - p0Current.length,
    end: p0Offset,
    values: p0Current.slice()
  });
  p0Current = [];
}
for (const char of p0Text) {
  const value = runeIndex.get(char);
  if (value !== undefined) {
    p0Current.push(value);
    p0Offset += 1;
  } else if (char === '/' || /\s/u.test(char)) {
    continue;
  } else {
    flushP0Word();
  }
}
flushP0Word();
if (p0Offset !== 262 || p0WordSpans.length !== 59) {
  throw new Error('Original p0 printed-word parser changed: expected 262 runes and 59 words');
}

const mod29 = value => ((value % 29) + 29) % 29;
const adjacentBodyMapPairs = [];
for (let index = 0; index + 1 < bodyWords.length; index += 1) {
  const sums = bodyWordValues.slice(index, index + 2);
  const addresses = sums.map(value => next[value]);
  if (Math.abs(addresses[0] - addresses[1]) !== 1) continue;
  const low = Math.min(...addresses);
  const high = Math.max(...addresses);
  const target = p0WordSpans.find(word =>
    word.start < low && word.end === high && word.values.length === 2
  ) || null;
  adjacentBodyMapPairs.push({
    bodyOrdinals: [index + 1, index + 2],
    words: bodyWords.slice(index, index + 2),
    gp0: sums,
    addresses,
    residues: sums.map(mod29),
    target: target ? {
      ordinal: target.ordinal,
      start: target.start,
      end: target.end,
      cipher: target.values
    } : null
  });
}
if (adjacentBodyMapPairs.length !== 1) {
  throw new Error('Expected exactly one adjacent p50 destination pair in the 29-word body register');
}
const selectedAdjacentPair = adjacentBodyMapPairs[0];
if (selectedAdjacentPair.words.map(word => word.toLowerCase()).join('|') !== 'empty|epiphany' ||
    selectedAdjacentPair.gp0.join(',') !== '92,121' ||
    selectedAdjacentPair.addresses.join(',') !== '236,237' ||
    selectedAdjacentPair.residues.join(',') !== '5,5' ||
    !selectedAdjacentPair.target ||
    selectedAdjacentPair.target.ordinal !== 53 ||
    selectedAdjacentPair.target.start !== 235 ||
    selectedAdjacentPair.target.end !== 237 ||
    selectedAdjacentPair.target.cipher.join(',') !== '8,5') {
  throw new Error('The EMPTY/EPIPHANY pair no longer selects the original p0 two-rune receiver');
}
const p0TwoRunePlaintext = selectedAdjacentPair.target.cipher.map((value, index) =>
  mod29(value - selectedAdjacentPair.residues[index])
);
const p0TwoRuneAlternative = selectedAdjacentPair.target.cipher.map((value, index) =>
  mod29(value + selectedAdjacentPair.residues[index])
);
const p0TwoRuneRoundTrip = p0TwoRunePlaintext.map((value, index) =>
  mod29(value + selectedAdjacentPair.residues[index])
);
const p0TwoRuneAlternativeRoundTrip = p0TwoRuneAlternative.map((value, index) =>
  mod29(value - selectedAdjacentPair.residues[index])
);
if (p0TwoRunePlaintext.join(',') !== '3,0' ||
    p0TwoRuneAlternative.join(',') !== '13,10' ||
    p0TwoRuneRoundTrip.join(',') !== '8,5' ||
    p0TwoRuneAlternativeRoundTrip.join(',') !== '8,5') {
  throw new Error('The two additive signs no longer reproduce the p0 OF/PI alternatives and exact round trips');
}

function decomposeFunctionalGraph(mapping) {
  const n = mapping.length;
  const component = new Int16Array(n).fill(-1);
  const position = new Int16Array(n).fill(-1);
  const cycles = [];
  let componentCount = 0;

  for (let startNode = 0; startNode < n; startNode++) {
    if (component[startNode] >= 0) continue;
    const pathNodes = [];
    let node = startNode;

    while (component[node] < 0 && position[node] < 0) {
      position[node] = pathNodes.length;
      pathNodes.push(node);
      node = mapping[node];
    }

    let id;
    if (position[node] >= 0) {
      const cycleStart = position[node];
      const cycleNodes = pathNodes.slice(cycleStart);
      id = componentCount++;
      cycles.push(cycleNodes);
      for (let i = cycleStart; i < pathNodes.length; i++) component[pathNodes[i]] = id;
      for (let i = cycleStart - 1; i >= 0; i--) component[pathNodes[i]] = id;
    } else {
      id = component[node];
      for (let i = pathNodes.length - 1; i >= 0; i--) component[pathNodes[i]] = id;
    }

    for (const x of pathNodes) position[x] = -1;
  }

  const basinSizes = new Array(componentCount).fill(0);
  for (let node = 0; node < n; node++) basinSizes[component[node]]++;

  return cycles.map((nodes, index) => ({ nodes, basin: basinSizes[index] }));
}

function walkUntilRepeat(startNode, mapping) {
  const seen = new Map();
  const pathNodes = [];
  let node = startNode;
  while (!seen.has(node)) {
    seen.set(node, pathNodes.length);
    pathNodes.push(node);
    node = mapping[node];
  }
  const entryIndex = seen.get(node);
  return {
    path: pathNodes,
    entry: node,
    depth: entryIndex,
    cycle: pathNodes.slice(entryIndex)
  };
}

function rotateCycle(cycle, startNode) {
  const index = cycle.indexOf(startNode);
  if (index < 0) throw new Error('Requested cycle start is not on cycle: ' + startNode);
  return cycle.slice(index).concat(cycle.slice(0, index));
}

function mode(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const maxCount = Math.max(...counts.values());
  const winners = [...counts.entries()]
    .filter(([, count]) => count === maxCount)
    .map(([value]) => value)
    .sort((a, b) => a - b);
  return { value: winners.length === 1 ? winners[0] : null, winners, count: maxCount };
}

const cycles = decomposeFunctionalGraph(next);
const oldBytes = historical2014.decimal_values;
if (!Array.isArray(oldBytes) || oldBytes.length !== 256) {
  throw new Error('Expected the archived 2014 256-byte witness');
}
const oldCycles = decomposeFunctionalGraph(oldBytes);
const historicalDiffs = next.map((value, index) => value !== oldBytes[index] ? index : null)
  .filter(index => index !== null);
const historicalOneAtATime = historicalDiffs.map(index => {
  const candidate = oldBytes.slice();
  candidate[index] = next[index];
  const candidateCycles = decomposeFunctionalGraph(candidate);
  return {
    correctedIndex: index,
    cycleLengths: candidateCycles.map(c => c.nodes.length).sort((a, b) => a - b),
    basinSizes: candidateCycles.map(c => c.basin).sort((a, b) => a - b)
  };
});
const only199Corrected = oldBytes.slice();
only199Corrected[199] = next[199];
const only199Cycles = decomposeFunctionalGraph(only199Corrected);

const sortedCycleSignature = graphCycles => graphCycles
  .map(c => ({ nodes: c.nodes.slice().sort((a, b) => a - b), basin: c.basin }))
  .sort((a, b) => a.nodes[0] - b.nodes[0]);
const oldLengths = oldCycles.map(c => c.nodes.length).sort((a, b) => a - b);
const only199Lengths = only199Cycles.map(c => c.nodes.length).sort((a, b) => a - b);
const only199RestoresCurrentGraph =
  JSON.stringify(sortedCycleSignature(only199Cycles)) ===
  JSON.stringify(sortedCycleSignature(cycles));
if (historicalDiffs.length !== 10 || oldLengths.join(',') !== '2,21' ||
    oldBytes[199] !== 21 || next[199] !== 47 ||
    only199Lengths.join(',') !== '2,11' || !only199RestoresCurrentGraph ||
    historicalOneAtATime.some(test =>
      test.correctedIndex !== 199 && test.cycleLengths.includes(11))) {
  throw new Error('The one-cell-199 historical control no longer reproduces');
}
const cycle2 = cycles.find(c => c.nodes.length === 2);
const cycle11 = cycles.find(c => c.nodes.length === 11);
if (cycles.length !== 2 || !cycle2 || !cycle11) {
  throw new Error('Observed graph no longer has exactly one 2-cycle and one 11-cycle');
}

// Source-oriented starts:
// - orient the 2-cycle at the node whose base-29 quotient is g=5;
// - orient the 11-cycle at the entry reached from the first signed-message word "The".
const g = 5;
const cycle2Start = cycle2.nodes.find(node => Math.floor(node / 29) === g);
if (cycle2Start === undefined) throw new Error('No 2-cycle node has base-29 quotient g=5');

const firstTheIndex = words.findIndex(word => word.toLowerCase() === 'the');
if (firstTheIndex < 0) throw new Error('No first THE word found');
const firstTheWalk = walkUntilRepeat(wordValues[firstTheIndex], next);
if (!cycle11.nodes.includes(firstTheWalk.entry)) {
  throw new Error('First THE does not enter the 11-cycle');
}
const p32Route = [wordValues[6]];
let p32State = wordValues[6];
for (let step = 0; step < 23; step++) {
  p32State = next[p32State];
  p32Route.push(p32State);
}
const p32RuneCount = corpus.pages.find(page => page.page === 32).indices.length;
const emptyIndex = words.findIndex(word => word.toUpperCase() === 'EMPTY');
if (p32Route[23] !== 32 || p32Route[21] !== wordValues[firstTheIndex] ||
    p32Route[22] !== wordValues[8] || p32RuneCount !== wordValues[5] ||
    p32Route[7] !== wordValues[emptyIndex] || p32Route[7] !== 92 ||
    next[32] !== 115 || firstTheWalk.entry !== 115) {
  throw new Error('The independent p32 route / 11-cycle phase bridge no longer reproduces');
}
// A second, single-word GP-prime start from the signed 29-word body register.
// The 2013 worked DH example supplies g=5 and shared K=2; treating these as
// graph-step milestones is a hypothesis, not an instruction in the protocol.
const dhK = 2;
const mapWordIndex = bodyWords.findIndex(word => word.toLowerCase() === 'map');
const wayWordIndex = bodyWords.findIndex(word => word.toLowerCase() === 'way');
const mapPrimeAddress = bodyPrimeValues[mapWordIndex];
const wayPrimeAddress = bodyPrimeValues[wayWordIndex];
const mapPrimeWalk = walkUntilRepeat(mapPrimeAddress, next);
const wayPrimeWalk = walkUntilRepeat(wayPrimeAddress, next);
const mapGp0Walk = walkUntilRepeat(bodyWordValues[mapWordIndex], next);
const mapStepG = mapPrimeWalk.path[g];
const mapStepGPlusK = mapPrimeWalk.path[g + dhK];
const messagePrimeMilestoneMatches = words.map((word, index) => {
  const address = wordPrimeValues[index];
  if (address >= 256) return null;
  const path = walkUntilRepeat(address, next).path;
  return { word, address, stepG: path[g], stepGPlusK: path[g + dhK] };
}).filter(item => item && item.stepG === 121 && item.stepGPlusK === 32);
const bodyPrimeP32Matches = bodyWords.map((word, index) => {
  const address = bodyPrimeValues[index];
  if (address >= 256) return null;
  const path = walkUntilRepeat(address, next).path;
  return { word, address, stepToP32: path.indexOf(32) };
}).filter(item => item && item.stepToP32 >= 0);
function advance(start, steps) {
  let node = start;
  for (let step = 0; step < steps; step++) node = next[node];
  return node;
}
const rawGraphMilestoneStarts = Array.from({ length: 256 }, (_, start) => start)
  .filter(start => advance(start, g) === 121 && advance(start, g + dhK) === 32);
const p32Section = transcription.split('%')[32];
const p32Fragments = p32Section.split(/[-.&$§]/u)
  .map(part => Array.from(part).filter(rune => runeIndex.has(rune)).join(''))
  .filter(fragment => fragment.length > 0);
const p32FragmentIndex7 = p32Fragments[7];
const p32FragmentIndex7Translit = Array.from(p32FragmentIndex7)
  .map(rune => corpus.translit[runeIndex.get(rune)]).join('');
const p32FragmentIndex7StartOffset = p32Fragments.slice(0, 7)
  .reduce((sum, fragment) => sum + Array.from(fragment).length, 0);
if (mapWordIndex !== 17 || wayWordIndex !== 12 ||
    mapPrimeAddress !== 211 || wayPrimeAddress !== 219 ||
    cells[219].token !== '0x' || cells[211].token !== '11' ||
    mapPrimeWalk.path[g] !== 121 || mapPrimeWalk.path[g + dhK] !== 32 ||
    mapPrimeWalk.path.indexOf(32) !== g + dhK || mapPrimeWalk.entry !== 115 ||
    mapGp0Walk.path.includes(32) || wayPrimeWalk.path.includes(32) ||
    wayPrimeWalk.entry !== 76 ||
    messagePrimeMilestoneMatches.length !== 1 ||
    messagePrimeMilestoneMatches[0].word.toLowerCase() !== 'map' ||
    rawGraphMilestoneStarts.join(',') !== '211,233' ||
    p32RuneCount !== 121 || p32Fragments.length !== 22 ||
    p32FragmentIndex7Translit !== 'HOMEXWDSLFD' ||
    Array.from(p32FragmentIndex7).length !== 11 ||
    p32FragmentIndex7StartOffset !== 33) {
  throw new Error('The source-word MAP GP-prime → EPIPHANY → p32 route no longer reproduces');
}

const cycle11Start = next[32];

const ordered2 = rotateCycle(cycle2.nodes, cycle2Start);
const ordered11 = rotateCycle(cycle11.nodes, cycle11Start);

function wordPair(node) {
  const q = Math.floor(node / 29);
  const r = node % 29;
  if (q >= 29 || r >= 29 || !bodyWords[q] || !bodyWords[r]) {
    throw new Error('Base-29 pair falls outside the 29-word body register: ' + node);
  }
  const cell = cells[node];
  return { node, page: cell.page, image: cell.image, row: cell.row, col: cell.col, token: cell.token, byte: next[node], q, r, qWord: bodyWords[q], rWord: bodyWords[r] };
}

const pairs2 = ordered2.map(wordPair);
const pairs11 = ordered11.map(wordPair);
const qMode = mode(pairs11.map(pair => pair.q));
const rMode = mode(pairs11.map(pair => pair.r));
const bodyWordRegister = bodyWords;

const output = {
  classification: 'source-selected base60 navigation map with an additional conditional GP-prime(MAP) start to p32; one two-symbol p0 key candidate; no verified LP2 decryption',
  table: {
    source: 'resources/liber-primus/lp2-grid-256.json',
    shape: grid.shape,
    byteRule: grid.byte_rule,
    byteCount: next.length,
    note: 'The forward base60 byte-as-next-address operation is selected by the independent EPIPHANY SEEKS THE DEVOTED → p32 route; the single-word GP-prime(MAP) start is a second conditional route, not part of the four-word-window family.'
  },
  signedMessage: {
    source: 'resources/historical/cicada2016-4gq25-outguess.asc',
    wordCount: words.length,
    bodyWordCount: bodyWords.length,
    bodyWordRegister,
    firstCodaWord: words[30],
    firstThe: {
      bodyOrdinal: firstTheIndex,
      gp0: wordValues[firstTheIndex],
      pathToCycle: firstTheWalk.path.slice(0, firstTheWalk.depth + 1),
      cycleEntry: firstTheWalk.entry
    },
    sourceSelectedP32Route: {
      startWord: words[6],
      bodyOrdinal: 6,
      startAddress: wordValues[6],
      dhDepth: 23,
      route: p32Route,
      terminalPage: 32,
      terminalRuneCount: p32RuneCount,
      heldOutEmpty: { step: 7, address: p32Route[7], gp0: wordValues[emptyIndex] },
      cyclePhase: next[32]
    },
    mapPrimeP32Route: {
      startWord: bodyWords[mapWordIndex],
      bodyOrdinal: mapWordIndex + 1,
      gpPrimeAddress: mapPrimeAddress,
      gp0ControlAddress: bodyWordValues[mapWordIndex],
      wayGpPrimeAddress: wayPrimeAddress,
      wayMapCellTokens: [cells[219].token, cells[211].token],
      path: mapPrimeWalk.path.slice(0, 9),
      dhWorkedExample: { p: 23, g, K: dhK, milestones: { epiphanyAt: g, p32At: g + dhK } },
      milestones: { step5: mapStepG, step7: mapStepGPlusK },
      epiphanyGp0: 121,
      p32RuneCount: p32RuneCount,
      zeroBasedFragmentIndex: 7,
      printedFragmentOrdinal: 8,
      fragmentStartRuneOffset: p32FragmentIndex7StartOffset,
      fragmentRuneCount: Array.from(p32FragmentIndex7).length,
      fragmentTransliteration: p32FragmentIndex7Translit,
      allMessageWordMilestoneMatches: messagePrimeMilestoneMatches,
      bodyWordsThatReachP32: bodyPrimeP32Matches,
      rawGraphStartsMatchingMilestones: rawGraphMilestoneStarts,
      cycleEntry: mapPrimeWalk.entry
    }
  },
  historical2014Control: {
    source: 'resources/cicada2014-sexagesimal-source.json',
    differingIndices: historicalDiffs,
    archivedCycles: oldCycles.map(c => ({ nodes: c.nodes, length: c.nodes.length, basin: c.basin })),
    archived21CycleModes: (() => {
      const c = oldCycles.find(x => x.nodes.length === 21);
      if (!c) return null;
      return {
        q: mode(c.nodes.map(node => Math.floor(node / 29))),
        r: mode(c.nodes.map(node => node % 29))
      };
    })(),
    oneAtATimeOriginalCorrections: historicalOneAtATime,
    correctingOnlyCell199: only199Cycles.map(c => ({
      nodes: c.nodes, length: c.nodes.length, basin: c.basin
    })),
    only199RestoresCurrentGraph
  },
  graph: {
    cycles: cycles.map(c => ({ nodes: c.nodes, length: c.nodes.length, basin: c.basin })),
    cycleLengthSum: 13,
    cycleLengthProduct: 22,
    sourceOrientedTwoCycle: pairs2,
    sourceOrientedElevenCycle: pairs11,
    elevenCycleModes: {
      q: { ...qMode, word: qMode.value === null ? null : bodyWords[qMode.value] },
      r: { ...rMode, word: rMode.value === null ? null : bodyWords[rMode.value] }
    }
  },
  p0AdjacentWordKeyCandidate: {
    sourceRegister: 'corrected 29-word signed-message body core; one-based ordinals',
    adjacentPairsChecked: bodyWords.length - 1,
    adjacentDestinationPairs: adjacentBodyMapPairs,
    keyRule: 'each source word GP0 sum reduced modulo 29',
    plaintextRules: {
      subtract: 'C-K; [8,5]-[5,5] = [3,0] = OF',
      add: 'C+K; [8,5]+[5,5] = [13,10] = PI'
    },
    subtractiveCandidate: p0TwoRunePlaintext,
    subtractiveTranslit: p0TwoRunePlaintext.map(value => corpus.translit[value]).join(''),
    additiveAlternative: p0TwoRuneAlternative,
    additiveAlternativeTranslit: p0TwoRuneAlternative.map(value => corpus.translit[value]).join(''),
    roundTrips: [p0TwoRuneRoundTrip, p0TwoRuneAlternativeRoundTrip],
    classification: 'unique two-symbol key candidate; plaintext sign unresolved; competes with an earlier THE crib; no reusable cipher'
  },
  candidateAnchors: {
    p0Title: [pairs2[0].qWord, qMode.value === null ? null : words[qMode.value]],
    routeWords: [pairs2[0].rWord, rMode.value === null ? null : words[rMode.value]],
    exactElevenCyclePair: pairs11.find(pair => pair.q === 6 && pair.r === 18) || null
  },
  caveats: [
    'The 13-node q/r word-pair sequence is a second-layer cross-source readout, not plaintext or a proven cipher.',
    'The unique adjacent EMPTY/EPIPHANY pair supplies residues [5,5]; C-K gives OF and C+K gives PI for the same p0 two-rune receiver. The source does not fix the sign, and an earlier THE crib also competes.',
    'The 2016 source pronoun "Its" refers to Liber Primus; using the signed message words as the q/r register is an additional interpretation, though its zero-based form aligns with the independent DH word-position audit.',
    'The source-word GP0 values mostly enter the 252-node basin, so the first-THE path alone is not selective; the four-word p32 route supplies the selective grammar and fixes phase115.',
    'The p0 title candidate EPIPHANY SEEKS was already known and is not counted as a blind prediction.',
    'The direct successor relation does not reproduce the signed message word order.',
    'The cycle values have not yielded the existing p0 13-atom additive key by direct mod-29, H/H-inverse, or p56 prime/totient transforms.',
    'A second single-word start GPprime(MAP)=211 reaches node 121 at step g=5 and p32 at step g+K=7. Only MAP among the 43 signed-message words matches both milestones; two of 256 raw starts (211 and 233) match, with 233 not message-derived.',
    'The 2013 DH worked-example g=5 and shared K=2 are authenticated values, but the protocol does not instruct using them as graph-step counts. The MAP route is therefore a conditional navigation hypothesis, not a proved instruction.',
    'The p32 terminal at zero-based path index 7 aligns with p32 zero-based fragment index 7 (the eighth printed fragment, HOMEXWDSLFD). Treating graph depth as a fragment index is a secondary hypothesis; the p6 red 4-1-4-2 shape is structural, not a cipher key.'
  ]
};

console.log(JSON.stringify(output, null, 2));

const nullArg = process.argv.find(arg => arg.startsWith('--null='));
if (nullArg) {
  const samples = Number(nullArg.slice('--null='.length));
  if (!Number.isInteger(samples) || samples < 1) throw new Error('Invalid --null sample count');

  let seed = 0x20261120;
  function randomUint32() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  function randomBelow(limit) {
    const range = 0x100000000;
    const cutoff = Math.floor(range / limit) * limit;
    let value;
    do { value = randomUint32(); } while (value >= cutoff);
    return value % limit;
  }
  function shuffledMultiset(values) {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomBelow(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function wordPairBase29(node) {
    return [Math.floor(node / 29), node % 29];
  }
  function hasExactTwoCyclePairs(cycle) {
    const pairs = cycle.nodes.map(wordPairBase29).map(pair => pair.join(',')).sort();
    return pairs.join('|') === '5,13|8,17';
  }
  function modeValue(values) {
    return mode(values).value;
  }
  function jointSignature(randomCycles) {
    if (randomCycles.length !== 2) return false;
    const c2 = randomCycles.find(c => c.nodes.length === 2);
    const c11 = randomCycles.find(c => c.nodes.length === 11);
    if (!c2 || !c11 || !hasExactTwoCyclePairs(c2)) return false;
    const qValues = c11.nodes.map(node => Math.floor(node / 29));
    const rValues = c11.nodes.map(node => node % 29);
    return modeValue(qValues) === 6 &&
      modeValue(rValues) === 18 &&
      c11.nodes.includes(192);
  }

  let exactGraph = 0;
  let joint = 0;
  let exactCyclePair = 0;
  let twoCyclePair = 0;
  let elevenCycleMode = 0;

  for (let i = 0; i < samples; i++) {
    const randomMap = shuffledMultiset(next);
    const randomCycles = decomposeFunctionalGraph(randomMap);
    const lengths = randomCycles.map(c => c.nodes.length).sort((a, b) => a - b);
    const basins = randomCycles.map(c => c.basin).sort((a, b) => a - b);
    const c2 = randomCycles.find(c => c.nodes.length === 2);
    const c11 = randomCycles.find(c => c.nodes.length === 11);

    if (lengths.join(',') === '2,11') exactCyclePair++;
    if (randomCycles.length === 2 &&
        lengths.join(',') === '2,11' &&
        basins.join(',') === '4,252') exactGraph++;
    if (c2 && hasExactTwoCyclePairs(c2)) twoCyclePair++;
    if (c11) {
      const qValues = c11.nodes.map(node => Math.floor(node / 29));
      const rValues = c11.nodes.map(node => node % 29);
      if (modeValue(qValues) === 6 && modeValue(rValues) === 18 && c11.nodes.includes(192)) {
        elevenCycleMode++;
      }
    }
    if (jointSignature(randomCycles)) joint++;
  }

  console.log(JSON.stringify({
    permutationNull: {
      samples,
      seed: '0x20261120',
      preserved: 'observed 256-byte multiset; uniformly shuffled among 256 cell positions',
      exactCycleLengths2and11: exactCyclePair,
      exactTwoComponentGraphWithBasins4and252: exactGraph,
      exactTwoCycleBase29Pairs: twoCyclePair,
      elevenCycleModeQ6R18WithNode192: elevenCycleMode,
      jointSourceSignature: joint,
      zeroCount95PercentUpperBound: joint === 0 ? 3 / samples : null
    }
  }, null, 2));
}
