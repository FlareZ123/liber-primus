#!/usr/bin/env node
'use strict';

// Expanded source-selector family audit for the p50 functional graph.
// Enumerates the signed-message four-word route over word encodings,
// address origins, radices, DH depths, and all eight 32x8 table traversals.
// Also reproduces the 2+11 graph and the q/r word-register alternatives.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const clearMatch = signed.match(/Hash: SHA1\\n\\n([\\s\\S]*?)\\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clearMatch, 'authenticated 2016 cleartext body missing');
const words = (clearMatch[1].match(/\\b[A-Za-z]+\\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(words.length, 43, 'expected 43 authenticated natural-language words');

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol: symbol.toLowerCase(), value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
function wordRunes(word) {
  let source = word.toLowerCase()
    .replace(/qu/g, 'cw')
    .replace(/v/g, 'u')
    .replace(/[kq]/g, 'c')
    .replace(/z/g, 's');
  const out = [];
  while (source.length) {
    if (source.startsWith('ing')) {
      out.push(21);
      source = source.slice(3);
      continue;
    }
    if (source.startsWith('io')) {
      out.push(27);
      source = source.slice(2);
      continue;
    }
    const token = gpTokens.find((entry) => source.startsWith(entry.symbol));
    assert.ok(token, 'unmapped signed word ' + word + ' at ' + source);
    out.push(token.value);
    source = source.slice(token.symbol.length);
  }
  return out;
}
const wordRuneIndices = words.map(wordRunes);
const gp0 = wordRuneIndices.map((runes) => runes.reduce((sum, value) => sum + value, 0));
const gp1 = wordRuneIndices.map((runes) => runes.reduce((sum, value) => sum + value + 1, 0));
const gpPrime = wordRuneIndices.map((runes) => runes.reduce((sum, value) => sum + corpus.prime[value], 0));
const encodings = {
  gp0,
  gp0Mod256: gp0.map((value) => value % 256),
  gp1,
  gp1Mod256: gp1.map((value) => value % 256),
  gpPrime,
  gpPrimeMod256: gpPrime.map((value) => value % 256),
  runeCount: wordRuneIndices.map((runes) => runes.length)
};
assert.deepEqual([gp0[5], gp0[6], gp0[7], gp0[8]], [121, 71, 20, 102]);

const rawTokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(rawTokens.length, 256);
assert.equal(grid.alphabet.length, 60);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace('f', '');
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  return hi < 0 || lo < 0 ? null : hi * alphabet.length + lo;
}
const R = 32;
const C = 8;
function traversalIndices(name) {
  const out = [];
  if (name === 'rowForward') {
    for (let r = 0; r < R; r += 1) for (let c = 0; c < C; c += 1) out.push(r * C + c);
  } else if (name === 'rowReverse') {
    for (let r = R - 1; r >= 0; r -= 1) for (let c = C - 1; c >= 0; c -= 1) out.push(r * C + c);
  } else if (name === 'rowMajorReverseRows') {
    for (let r = R - 1; r >= 0; r -= 1) for (let c = 0; c < C; c += 1) out.push(r * C + c);
  } else if (name === 'rowMajorReverseCols') {
    for (let r = 0; r < R; r += 1) for (let c = C - 1; c >= 0; c -= 1) out.push(r * C + c);
  } else if (name === 'colForward') {
    for (let c = 0; c < C; c += 1) for (let r = 0; r < R; r += 1) out.push(r * C + c);
  } else if (name === 'colReverse') {
    for (let c = C - 1; c >= 0; c -= 1) for (let r = R - 1; r >= 0; r -= 1) out.push(r * C + c);
  } else if (name === 'colMajorReverseCols') {
    for (let c = C - 1; c >= 0; c -= 1) for (let r = 0; r < R; r += 1) out.push(r * C + c);
  } else if (name === 'colMajorReverseRows') {
    for (let c = 0; c < C; c += 1) for (let r = R - 1; r >= 0; r -= 1) out.push(r * C + c);
  } else {
    throw new Error('unknown traversal ' + name);
  }
  assert.equal(out.length, 256);
  return out;
}
const traversals = [
  'rowForward', 'rowReverse', 'rowMajorReverseRows', 'rowMajorReverseCols',
  'colForward', 'colReverse', 'colMajorReverseCols', 'colMajorReverseRows'
];
const tables = {};
for (const traversal of traversals) {
  const indices = traversalIndices(traversal);
  for (const radix of ['base60', 'base59']) {
    const alphabet = radix === 'base60' ? alpha60 : alpha59;
    tables[traversal + '/' + radix] = indices.map((index) => decodeToken(rawTokens[index], alphabet));
  }
}

const pageRuneCounts = new Map(corpus.pages.map((page) => [page.page, page.indices.length]));
const dhDepths = [
  ['p', 23], ['g', 5], ['a', 6], ['b', 15], ['A', 8], ['B', 19], ['K', 2]
];
const hits = [];
const counts = { configurations: 0, validStarts: 0, completeWalks: 0 };
for (const [encoding, values] of Object.entries(encodings)) {
  for (const addressMode of ['zero', 'one']) {
    for (let window = 0; window <= words.length - 4; window += 1) {
      const [v0, v1, v2, v3] = values.slice(window, window + 4);
      for (const [depthField, depth] of dhDepths) {
        for (const traversal of traversals) {
          for (const radix of ['base60', 'base59']) {
            counts.configurations += 1;
            const table = tables[traversal + '/' + radix];
            const toCell = (state) => addressMode === 'zero' ? state : state - 1;
            const fromCell = (value) => addressMode === 'zero' ? value : value + 1;
            let state = v1;
            let valid = Number.isInteger(state) && toCell(state) >= 0 && toCell(state) < 256;
            if (valid) counts.validStarts += 1;
            const route = [state];
            for (let step = 0; valid && step < depth; step += 1) {
              const value = table[toCell(state)];
              if (value === null || value === undefined) {
                valid = false;
                break;
              }
              state = fromCell(value);
              route.push(state);
            }
            if (!valid) continue;
            counts.completeWalks += 1;
            const pageNo = addressMode === 'zero' ? state : state - 1;
            if (route[depth - 2] !== v2 || route[depth - 1] !== v3) continue;
            if (pageRuneCounts.get(pageNo) !== v0) continue;
            hits.push({
              encoding, addressMode, window, words: words.slice(window, window + 4),
              values: [v0, v1, v2, v3], depthField, depth, traversal, radix,
              terminal: state, pageNo, route
            });
          }
        }
      }
    }
  }
}
assert.equal(counts.configurations, 62720);
assert.equal(hits.length, 2, 'expected GP0 and GP0-mod256 aliases only');
const distinctKey = (hit) => JSON.stringify({
  window: hit.window, words: hit.words, values: hit.values, addressMode: hit.addressMode,
  depthField: hit.depthField, depth: hit.depth, traversal: hit.traversal,
  radix: hit.radix, terminal: hit.terminal, pageNo: hit.pageNo, route: hit.route
});
const distinct = [...new Map(hits.map((hit) => [distinctKey(hit), hit])).values()];
assert.equal(distinct.length, 1, 'more than one distinct source route survived');
const selected = distinct[0];
assert.deepEqual(selected.words, ['EPIPHANY', 'SEEKS', 'THE', 'DEVOTED']);
assert.equal(selected.depth, 23);
assert.equal(selected.radix, 'base60');
assert.equal(selected.traversal, 'rowForward');
assert.equal(selected.addressMode, 'zero');
assert.equal(selected.pageNo, 32);
assert.equal(selected.values[0], 121);
assert.equal(selected.route[7], gp0[4]); // held-out EMPTY at step 7 = g+K

const next = tables['rowForward/base60'];
const cell199 = decodeToken(rawTokens[199], alpha60);
assert.equal(rawTokens[199], '0l');
assert.equal(cell199, 47);
function cycleFrom(start) {
  const nodes = [];
  const seen = new Set();
  let state = start;
  while (!seen.has(state)) {
    seen.add(state);
    nodes.push(state);
    state = next[state];
  }
  return { nodes, returnsTo: state };
}
const cycle2 = cycleFrom(158);
const cycle11 = cycleFrom(115);
assert.deepEqual(cycle2.nodes, [158, 249]);
assert.deepEqual(cycle11.nodes, [115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197]);
assert.equal(next[32], 115);
const inDegree = Array(256).fill(0);
for (const value of next) inDegree[value] += 1;
const inDegreeHistogram = {};
for (const degree of inDegree) inDegreeHistogram[degree] = (inDegreeHistogram[degree] || 0) + 1;
assert.deepEqual(inDegreeHistogram, { 0: 95, 1: 92, 2: 49, 3: 14, 4: 6 });

const register = words.slice(0, 29);
assert.equal(words[29], 'DIRECTION');
const qPairs = (nodes) => nodes.map((node) => ({ node, q: Math.floor(node / 29), r: node % 29 }));
const qWord = (value) => register[value];
const oneBasedCyclicWord = (value) => register[(value + 28) % 29];
const qR = {
  cycle2: qPairs(cycle2.nodes),
  cycle11: qPairs(cycle11.nodes),
  cycle2ForwardWords: cycle2.nodes.map((node) => {
    const pair = qPairs([node])[0];
    return [qWord(pair.q), qWord(pair.r)];
  }),
  cycle2ReverseWords: cycle2.nodes.slice().reverse().map((node) => {
    const pair = qPairs([node])[0];
    return [qWord(pair.q), qWord(pair.r)];
  }),
  cycle11ForwardWords: cycle11.nodes.map((node) => {
    const pair = qPairs([node])[0];
    return [qWord(pair.q), qWord(pair.r)];
  }),
  cycle11OneBasedCyclicWords: cycle11.nodes.map((node) => {
    const pair = qPairs([node])[0];
    return [oneBasedCyclicWord(pair.q), oneBasedCyclicWord(pair.r)];
  }),
  cycle11SwappedWords: cycle11.nodes.map((node) => {
    const pair = qPairs([node])[0];
    return [qWord(pair.r), qWord(pair.q)];
  })
};
function mode(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
}
const cycle11Q = qR.cycle11.map((pair) => pair.q);
const cycle11R = qR.cycle11.map((pair) => pair.r);
assert.equal(mode(cycle11Q)[0][0], 6);
assert.equal(mode(cycle11R)[0][0], 18);
assert.deepEqual(qR.cycle2.map((pair) => pair.q), [5, 8]);

const result = {
  family: {
    encodings: Object.keys(encodings),
    addressModes: ['zero', 'one'],
    wordWindows: 40,
    dhDepths,
    radices: ['base60', 'base59'],
    traversals,
    configurations: counts.configurations,
    validStarts: counts.validStarts,
    completeWalks: counts.completeWalks,
    rawHits: hits.map(({ encoding, addressMode, window, words, values, depthField, depth, traversal, radix, terminal, pageNo }) =>
      ({ encoding, addressMode, window, words, values, depthField, depth, traversal, radix, terminal, pageNo })),
    distinctRouteCount: distinct.length,
    selectedRoute: selected
  },
  graph: { cell199Token: rawTokens[199], cell199Base60: cell199, cycle2, cycle11, inDegreeHistogram },
  signedRegister: { first29: register, word29: words[29], qR },
  qRModes: { cycle11Q: mode(cycle11Q), cycle11R: mode(cycle11R) }
};
console.log(JSON.stringify(result, null, 2));
