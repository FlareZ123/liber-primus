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

const next = grid.bytes;
const cells = grid.pages.flatMap(page => page.tokens.map((token, local) => ({
  page: page.page,
  image: page.image,
  row: Math.floor(local / page.cols),
  col: local % page.cols,
  token
})));
if (cells.length !== 256) throw new Error('Expected 256 source cells');
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
const cycle11Start = firstTheWalk.entry;

const ordered2 = rotateCycle(cycle2.nodes, cycle2Start);
const ordered11 = rotateCycle(cycle11.nodes, cycle11Start);

function wordPair(node) {
  const q = Math.floor(node / 29);
  const r = node % 29;
  if (q >= 29 || r >= 29 || !words[q] || !words[r]) {
    throw new Error('Base-29 pair falls outside signed-message word register: ' + node);
  }
  const cell = cells[node];
  return { node, page: cell.page, image: cell.image, row: cell.row, col: cell.col, token: cell.token, byte: next[node], q, r, qWord: words[q], rWord: words[r] };
}

const pairs2 = ordered2.map(wordPair);
const pairs11 = ordered11.map(wordPair);
const qMode = mode(pairs11.map(pair => pair.q));
const rMode = mode(pairs11.map(pair => pair.r));
const first29 = words.slice(0, 29);

const output = {
  classification: 'intermediate hypothesis; not a verified LP2 decryption',
  table: {
    source: 'resources/liber-primus/lp2-grid-256.json',
    shape: grid.shape,
    byteRule: grid.byte_rule,
    byteCount: next.length,
    note: 'The repository marks the base-60 byte interpretation as a hypothesis.'
  },
  signedMessage: {
    source: 'resources/historical/cicada2016-4gq25-outguess.asc',
    wordCount: words.length,
    first29WordRegister: first29,
    wordAtIndex29: words[29],
    firstThe: {
      wordIndex: firstTheIndex,
      gp0: wordValues[firstTheIndex],
      pathToCycle: firstTheWalk.path.slice(0, firstTheWalk.depth + 1),
      cycleEntry: firstTheWalk.entry
    }
  },
  graph: {
    cycles: cycles.map(c => ({ nodes: c.nodes, length: c.nodes.length, basin: c.basin })),
    cycleLengthSum: 13,
    cycleLengthProduct: 22,
    sourceOrientedTwoCycle: pairs2,
    sourceOrientedElevenCycle: pairs11,
    elevenCycleModes: {
      q: { ...qMode, word: qMode.value === null ? null : words[qMode.value] },
      r: { ...rMode, word: rMode.value === null ? null : words[rMode.value] }
    }
  },
  candidateAnchors: {
    p0Title: [pairs2[0].qWord, qMode.value === null ? null : words[qMode.value]],
    routeWords: [pairs2[0].rWord, rMode.value === null ? null : words[rMode.value]],
    exactElevenCyclePair: pairs11.find(pair => pair.q === 6 && pair.r === 18) || null
  },
  caveats: [
    'The successor-map interpretation of the 256 base-60 values is not yet established by an explicit instruction.',
    'The 2016 word-index interpretation of base-29 quotient/remainder is a candidate reading, not a proven cipher.',
    'The source-word GP0 values mostly enter the 252-node basin, so convergence to the 11-cycle alone is not selective.',
    'The direct successor relation does not reproduce the signed message word order.',
    'The cycle values have not yielded the existing p0 13-atom additive key by direct mod-29, H/H-inverse, or p56 prime/totient transforms.'
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
