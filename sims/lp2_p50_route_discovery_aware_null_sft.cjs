#!/usr/bin/env node
'use strict';

// Discovery-aware, source-preserving null calibration for the frozen p50
// 2016 word-map route search. Read-only: uses canonical source files and
// does not modify repository data.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const clearMatch = signed.match(/Hash: SHA1[\r\n]{2}([\s\S]*?)[\r\n]-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clearMatch, 'authenticated 2016 cleartext body missing');
const words = (clearMatch[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
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
  return hi < 0 || lo < 0 ? -1 : hi * alphabet.length + lo;
}

// Move integer token IDs during permutations. This preserves duplicate-token
// multiplicities exactly while avoiding repeated string allocation.
const uniqueTokens = [...new Set(rawTokens)];
const tokenIdsByName = new Map(uniqueTokens.map((token, id) => [token, id]));
const originalTokenIds = Uint16Array.from(rawTokens, (token) => tokenIdsByName.get(token));
const decoded60 = Int16Array.from(uniqueTokens, (token) => decodeToken(token, alpha60));
const decoded59 = Int16Array.from(uniqueTokens, (token) => decodeToken(token, alpha59));

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
  return Uint16Array.from(out);
}

const traversals = [
  'rowForward', 'rowReverse', 'rowMajorReverseRows', 'rowMajorReverseCols',
  'colForward', 'colReverse', 'colMajorReverseCols', 'colMajorReverseRows'
];
const traversalMaps = traversals.map((name) => ({ name, indices: traversalIndices(name) }));
const pageCounts = new Int16Array(257);
pageCounts.fill(-1);
for (const page of corpus.pages) pageCounts[page.page] = page.indices.length;
const dhDepths = [23, 5, 6, 15, 8, 19, 2];
const maxV0 = Math.max(...Object.values(encodings).flat());
const pairBase = maxV0 + 1;

// For each address origin, index the frozen family by its final two states
// and terminal receiver count. The table-dependent check F(v2)=v3 and
// pageCount(F(v3))=v0 is evaluated before any variable-length walk. This
// exact factorization preserves the familywise event but makes 40k null
// replicates tractable.
const lookupByOrigin = [0, 1].map(() => Array.from({ length: 257 }, () => new Map()));
const rawConfigsPerOrigin = [0, 0];
const eligibleConfigsPerOrigin = [0, 0];

for (const values of Object.values(encodings)) {
  for (let origin = 0; origin <= 1; origin += 1) {
    const low = origin;
    const high = origin + 255;
    for (let window = 0; window <= words.length - 4; window += 1) {
      const v0 = values[window];
      const start = values[window + 1];
      const v2 = values[window + 2];
      const v3 = values[window + 3];
      for (const depth of dhDepths) {
        rawConfigsPerOrigin[origin] += 1;
        if (![start, v2, v3].every((v) => Number.isInteger(v) && v >= low && v <= high)) continue;
        eligibleConfigsPerOrigin[origin] += 1;
        const pairKey = v3 * pairBase + v0;
        const byPair = lookupByOrigin[origin][v2];
        let grouped = byPair.get(pairKey);
        if (!grouped) {
          grouped = new Map();
          byPair.set(pairKey, grouped);
        }
        const stepsToV2 = depth - 2;
        const candidateId = start * 32 + stepsToV2;
        grouped.set(candidateId, (grouped.get(candidateId) || 0) + 1);
      }
    }
  }
}
assert.deepEqual(rawConfigsPerOrigin, [1960, 1960]);
assert.equal(rawConfigsPerOrigin[0] * 2 * 16, 62720);

// One state array represents the exact forward map for a traversal/radix and
// address origin: F(s)=T[s] for zero-based, F(s)=T[s-1]+1 for one-based.
function buildStateMap(tokenIds, indices, decoded, origin) {
  const table = new Int16Array(256);
  for (let cell = 0; cell < 256; cell += 1) {
    table[cell] = decoded[tokenIds[indices[cell]]];
  }
  const F = new Int16Array(257);
  F.fill(-1);
  if (origin === 0) {
    for (let state = 0; state < 256; state += 1) F[state] = table[state];
  } else {
    for (let state = 1; state <= 256; state += 1) {
      const value = table[state - 1];
      F[state] = value < 0 ? -1 : value + 1;
    }
  }
  return F;
}

function evaluateStateMap(F, origin) {
  const low = origin;
  const high = origin + 255;
  const byV2 = lookupByOrigin[origin];
  let rawHits = 0;
  for (let v2 = low; v2 <= high; v2 += 1) {
    const byPair = byV2[v2];
    if (byPair.size === 0) continue;
    const v3 = F[v2];
    if (v3 < low || v3 > high) continue;
    const terminal = F[v3];
    if (terminal < low || terminal > high) continue;
    const receiverPage = terminal - origin;
    const v0 = receiverPage >= 0 && receiverPage < pageCounts.length
      ? pageCounts[receiverPage] : -1;
    if (v0 < 0) continue;
    const grouped = byPair.get(v3 * pairBase + v0);
    if (!grouped) continue;
    for (const [candidateId, multiplicity] of grouped) {
      let state = Math.floor(candidateId / 32);
      const steps = candidateId % 32;
      for (let step = 0; step < steps; step += 1) {
        state = F[state];
        if (state < low || state > high) {
          state = -1;
          break;
        }
      }
      if (state === v2) rawHits += multiplicity;
    }
  }
  return rawHits;
}

function evaluateTable(tokenIds) {
  let rawHits = 0;
  for (const traversal of traversalMaps) {
    for (const radix of ['base60', 'base59']) {
      const decoded = radix === 'base60' ? decoded60 : decoded59;
      for (let origin = 0; origin <= 1; origin += 1) {
        const F = buildStateMap(tokenIds, traversal.indices, decoded, origin);
        rawHits += evaluateStateMap(F, origin);
      }
    }
  }
  return rawHits;
}

// Implementation invariant: reproduce the exact two raw aliases (GP0 and
// GP0 mod 256) on the original table before testing any randomized input.
const observedRawHits = evaluateTable(originalTokenIds);
assert.equal(observedRawHits, 2, 'factorized family search must reproduce the two observed aliases');

class XorShift32 {
  constructor(seed) {
    this.state = seed >>> 0;
    assert.notEqual(this.state, 0, 'xorshift32 seed must be nonzero');
  }
  nextUint32() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }
  below(bound) {
    const range = 0x100000000;
    const limit = Math.floor(range / bound) * bound;
    let value;
    do { value = this.nextUint32(); } while (value >= limit);
    return value % bound;
  }
}

function makeGroups(kind) {
  if (kind === 'global') return [Array.from({ length: 256 }, (_, i) => i)];
  if (kind === 'page') {
    const groups = [];
    let offset = 0;
    for (const page of grid.pages) {
      groups.push(Array.from({ length: page.tokens.length }, (_, i) => offset + i));
      offset += page.tokens.length;
    }
    assert.equal(offset, 256);
    return groups;
  }
  if (kind === 'row') {
    return Array.from({ length: R }, (_, r) =>
      Array.from({ length: C }, (_, c) => r * C + c));
  }
  if (kind === 'column') {
    return Array.from({ length: C }, (_, c) =>
      Array.from({ length: R }, (_, r) => r * C + c));
  }
  throw new Error('unknown null kind ' + kind);
}

function permute(baseIds, groups, rng) {
  const out = baseIds.slice();
  for (const group of groups) {
    for (let i = group.length - 1; i > 0; i -= 1) {
      const j = rng.below(i + 1);
      const a = group[i];
      const b = group[j];
      const tmp = out[a];
      out[a] = out[b];
      out[b] = tmp;
    }
  }
  return out;
}

function wilson95(successes, trials) {
  const z = 1.959963984540054;
  const p = successes / trials;
  const den = 1 + (z * z) / trials;
  const center = (p + (z * z) / (2 * trials)) / den;
  const half = z * Math.sqrt((p * (1 - p) / trials) + (z * z / (4 * trials * trials))) / den;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

const replicates = 10000;
const nulls = [
  { name: 'global-token-permutation', kind: 'global', seed: 0x20261121 },
  { name: 'within-physical-page', kind: 'page', seed: 0x20261122 },
  { name: 'within-original-row', kind: 'row', seed: 0x20261123 },
  { name: 'within-original-column', kind: 'column', seed: 0x20261124 }
];

console.log(JSON.stringify({
  event: 'discovery-aware familywise any-hit',
  rawConfigurations: 62720,
  wordWindows: 40,
  encodings: Object.keys(encodings),
  dhDepths,
  addressOrigins: ['zero', 'one'],
  radices: ['base60', 'base59'],
  traversals: traversals,
  receiverPages: corpus.pages.length,
  words: words.length,
  sourceTokenCount: rawTokens.length,
  distinctTokenCount: uniqueTokens.length,
  eligibleConfigsPerOrigin,
  observedRawHits
}));

const allResults = [];
for (const spec of nulls) {
  const rng = new XorShift32(spec.seed);
  const groups = makeGroups(spec.kind);
  let anyHitReplicates = 0;
  let totalRawHits = 0;
  let maxRawHits = 0;
  const rawHitHistogram = new Map();
  const startTime = Date.now();
  for (let replicate = 1; replicate <= replicates; replicate += 1) {
    const randomized = permute(originalTokenIds, groups, rng);
    const rawHits = evaluateTable(randomized);
    totalRawHits += rawHits;
    if (rawHits > 0) anyHitReplicates += 1;
    if (rawHits > maxRawHits) maxRawHits = rawHits;
    rawHitHistogram.set(rawHits, (rawHitHistogram.get(rawHits) || 0) + 1);
    if (replicate % 1000 === 0) {
      console.log('progress ' + spec.name + ' ' + replicate + '/' + replicates +
        ' any=' + anyHitReplicates + ' elapsed_s=' + ((Date.now() - startTime) / 1000).toFixed(1));
    }
  }
  const rate = anyHitReplicates / replicates;
  const ci = wilson95(anyHitReplicates, replicates);
  const result = {
    name: spec.name,
    seed: '0x' + spec.seed.toString(16),
    replicates,
    anyHitReplicates,
    familywiseRate: rate,
    wilson95: ci,
    exactOneSided95UpperIfZero: anyHitReplicates === 0 ? 1 - Math.pow(0.05, 1 / replicates) : null,
    totalRawHits,
    maxRawHits,
    rawHitHistogram: Object.fromEntries([...rawHitHistogram.entries()].sort((a, b) => a[0] - b[0])),
    elapsedSeconds: (Date.now() - startTime) / 1000
  };
  allResults.push(result);
  console.log('NULL_RESULT ' + JSON.stringify(result));
}

console.log('FINAL_RESULT ' + JSON.stringify({
  observedRawHits,
  replicatesPerNull: replicates,
  familywise: allResults,
  interpretation: 'Conditional exchangeability bounds only; no creator-intent or cipher claim.'
}, null, 2));
