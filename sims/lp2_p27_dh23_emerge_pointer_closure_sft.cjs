'use strict';

/**
 * Source-exact p57 EMERGE to p50 pointer-graph closure.
 * Run: node sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs
 *
 * This tests one frozen continuation of the already established p27/DH23
 * navigation candidate. It does not search keys and does not score plaintext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
}

/** @param {string[]} tokens @param {string} alphabet */
function decode(tokens, alphabet) {
  return tokens.map((token) =>
    alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]));
}

/** @param {number[]} map @param {number} start @param {number} root */
function pathToRoot(map, start, root) {
  const nodes = [start];
  const seen = new Set([start]);
  let at = start;
  while (at !== root) {
    at = map[at];
    assert(!seen.has(at), `cycle before root from ${start}: repeated ${at}`);
    seen.add(at);
    nodes.push(at);
    assert(nodes.length <= map.length + 1);
  }
  return nodes;
}

/** @param {number[]} map @param {number} start */
function orbit(map, start) {
  const nodes = [];
  const seen = new Map();
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, nodes.length);
    nodes.push(at);
    at = map[at];
    assert(nodes.length <= map.length + 1);
  }
  return {
    nodes,
    repeated: at,
    prefix: seen.get(at),
    period: nodes.length - seen.get(at),
  };
}

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert(tokens.every((token) =>
  token.length === 2 && [...token].every((ch) => alphabet59.includes(ch))));

const map59 = decode(tokens, alphabet59);
const map60 = decode(tokens, alphabet60);
assert(map59.every((value) => value >= 0 && value < 256));
assert(map60.every((value) => value >= 0 && value < 256));

const root = 189;
assert.equal(map59[root], root);
for (let start = 0; start < 256; start++) {
  pathToRoot(map59, start, root);
}

// The signed 2013 worked DH example, already used by the upstream route.
const dh = {
  modulus: 23,
  generator: 5,
  serverPublic: 8,
  clientPublic: 19,
  shared: 2,
  serverSecret: 6,
};
assert.deepEqual([Math.floor(root / 8), root % 8], [dh.modulus, dh.generator]);

// Reproduce the pre-existing base59 path from MUST=186 to the root.
// Its first hop is the signed client public 19 and its total distance is
// the signed server public 8.
const mustPath = pathToRoot(map59, 186, root);
assert.deepEqual(mustPath, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.equal(mustPath[1], dh.clientPublic);
assert.equal(mustPath.length - 1, dh.serverPublic);

// Parse the exact solved p57 words from the canonical 95-rune source page.
const names = [
  'PARABLE', 'LIKE', 'THE', 'INSTAR', 'TUNNELING', 'TO', 'THE',
  'SURFACE', 'WE', 'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES',
  'FIND', 'THE', 'DIVINITY', 'WITHIN', 'AND', 'EMERGE',
];
const runeLengths = [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6];
assert.equal(runeLengths.reduce((sum, n) => sum + n, 0), 95);

const page57 = corpus.pages.find((page) => page.page === 57);
assert(page57);
assert.equal(page57.runic_count, 95);

let offset = 0;
const words = names.map((name, i) => {
  const runes = page57.indices.slice(offset, offset + runeLengths[i]);
  offset += runeLengths[i];
  const gp0 = runes.reduce((sum, rune) => sum + rune, 0);
  const primeSum = runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
  return {position: i + 1, name, gp0, primeSum, address: primeSum % 256};
});
assert.equal(offset, 95);

const byName = Object.fromEntries(words.map((word) => [word.name + ':' + word.position, word]));
assert.equal(byName['THE:16'].primeSum, 72);
assert.equal(byName['MUST:10'].primeSum, 186);
assert.equal(byName['EMERGE:20'].primeSum, 300);

// New frozen closure: the already selected EMERGE sum 300 is addressed into
// the literal 256-cell table by its unique residue 44.
const emerge = byName['EMERGE:20'];
assert.equal(emerge.address, 44);
const emergePath = pathToRoot(map59, emerge.address, root);
assert.deepEqual(emergePath, [44, 226, 72, 161, 214, 247, 189]);

// The total path length is the independent server secret 6.
assert.equal(emergePath.length - 1, dh.serverSecret);

// The EMERGE branch joins the established MUST path after the independent
// shared value 2 pointer steps, at address72, which is GP-prime(THE).
const merge = emergePath.find((node) => mustPath.includes(node));
assert.equal(merge, 72);
assert.equal(emergePath.indexOf(merge), dh.shared);
assert.equal(merge, byName['THE:16'].primeSum);

// The merge leaves the exact common tail already present in the MUST path.
assert.deepEqual(
  emergePath.slice(emergePath.indexOf(merge)),
  mustPath.slice(mustPath.indexOf(merge)),
);

// Fixed-graph discrimination. Exactly 11 of the 256 source addresses lie six
// edges from the root, and among the 20 printed p57 words EMERGE is the only
// word whose prime-sum residue selects one of those depth-six addresses.
const depths = Array.from({length: 256}, (_, start) =>
  pathToRoot(map59, start, root).length - 1);
const depthSixAddresses = depths.flatMap((depth, address) =>
  depth === dh.serverSecret ? [address] : []);
assert.deepEqual(depthSixAddresses, [26, 33, 44, 76, 84, 100, 147, 208, 212, 239, 251]);
const p57DepthSix = words.filter((word) => depths[word.address] === dh.serverSecret);
assert.deepEqual(p57DepthSix.map((word) => [word.position, word.name, word.primeSum, word.address]),
  [[20, 'EMERGE', 300, 44]]);
const p57SelfLengthDepth = words.filter((word, i) => depths[word.address] === runeLengths[i]);
assert.deepEqual(
  p57SelfLengthDepth.map((word, i) => [word.position, word.name, word.primeSum, word.address]),
  [[20, 'EMERGE', 300, 44]],
);

// Conventional base60 does not reproduce the closure. Address44 enters an
// 11-cycle and never reaches the base59 DH root.
const base60Orbit = orbit(map60, emerge.address);
assert.equal(base60Orbit.repeated, 115);
assert.equal(base60Orbit.prefix, 9);
assert.equal(base60Orbit.period, 11);
assert(!base60Orbit.nodes.includes(root));


// #1950 source-selection family audit: p27/p50/p57 only; no p0/p28 output.
const clientSecret = 15; // manuscript-derived, not a signed TCP field
const signedPublicDepthValues = new Set([dh.shared, dh.generator, dh.serverPublic, dh.clientPublic, dh.modulus]);
const extendedDepthValues = new Set([...signedPublicDepthValues, dh.serverSecret, clientSecret]);
const candidates = [];
for (const word of words) for (const sumType of ['gp0', 'primeSum']) {
  const raw = word[sumType];
  for (const addressMode of ['direct', 'mod256']) {
    const start = addressMode === 'mod256' ? raw % 256 : (raw < 256 ? raw : null);
    if (start !== null) candidates.push({
      word: word.name, position: word.position, length: runeLengths[word.position - 1],
      sumType, addressMode, raw, start,
    });
  }
}
assert.equal(candidates.length, 74);

// Valid signed-DH/table coordinates only. clientPublic19 cannot be a column
// in an eight-column grid; serverPublic8 is valid only with one-based columns.
const rootVariants = [
  {label: 'zero (p,g)', address: dh.modulus * 8 + dh.generator},
  {label: 'zero (p,shared)', address: dh.modulus * 8 + dh.shared},
  {label: 'one (p,g)', address: (dh.modulus - 1) * 8 + dh.generator - 1},
  {label: 'one (p,serverPublic)', address: (dh.modulus - 1) * 8 + dh.serverPublic - 1},
  {label: 'one (p,shared)', address: (dh.modulus - 1) * 8 + dh.shared - 1},
];
assert.deepEqual(rootVariants.map((r) => r.address), [189, 186, 180, 183, 177]);
assert(dh.clientPublic > 8);
function stepsTo(map, start, target) {
  let at = start, n = 0; const seen = new Set();
  while (at !== target) {
    if (!Number.isInteger(at) || at < 0 || at >= 256 || seen.has(at)) return -1;
    seen.add(at); at = map[at]; n += 1;
  }
  return n;
}
function walkSteps(map, start, count) {
  const path = [start]; let at = start;
  for (let i = 0; i < count; i += 1) {
    at = map[at];
    if (!Number.isInteger(at) || at < 0 || at >= 256) return null;
    path.push(at);
  }
  return path;
}

// Both word->root and root->word orientations use the same forward map
// cell->value. The inverse relation is branching, not a unique pointer map.
const depthHits = [];
for (const [radix, map] of [['base59', map59], ['base60', map60]]) {
  for (const rootVariant of rootVariants) for (const c of candidates) {
    const a = stepsTo(map, c.start, rootVariant.address);
    if (a >= 0 && a === c.length && extendedDepthValues.has(a))
      depthHits.push({radix, root: rootVariant.label, orientation: 'word-to-root', ...c,
        depth: a, publicDepth: signedPublicDepthValues.has(a)});
    const b = stepsTo(map, rootVariant.address, c.start);
    if (b >= 0 && b === c.length && extendedDepthValues.has(b))
      depthHits.push({radix, root: rootVariant.label, orientation: 'root-to-word', ...c,
        depth: b, publicDepth: signedPublicDepthValues.has(b)});
  }
}
assert.equal(candidates.length * rootVariants.length * 2 * 2, 1480);
assert.equal(depthHits.length, 3);
const distinctDepthHits = new Set(depthHits.map((h) =>
  [h.radix, h.root, h.orientation, h.word, h.sumType, h.start, h.depth].join('|')));
assert.equal(distinctDepthHits.size, 2);

// A real rival: base60 forward from shared coordinate186 reaches WITHIN=115
// in five edges (= public g=5). WITHIN follows the clear post-SHED transition,
// so this pre-SHED base60 path is state-incompatible.
const within = byName['WITHIN:18'];
assert.equal(within.primeSum, 115);
const withinBase60Path = walkSteps(map60, 186, 5);
assert.deepEqual(withinBase60Path, [186, 19, 33, 114, 197, 115]);
assert.equal(stepsTo(map59, 186, 115), -1);

// Merge family: charge every p57 GP0/GP-prime sum as a possible merge label.
const wordSumNodes = new Set();
for (const word of words) for (const raw of [word.gp0, word.primeSum]) {
  if (raw < 256) wordSumNodes.add(raw);
  wordSumNodes.add(raw % 256);
}
function firstMustMerge(map, start) {
  let at = start, entryDepth = 0; const seen = new Set();
  while (Number.isInteger(at) && at >= 0 && at < 256 && !seen.has(at)) {
    const index = mustPath.indexOf(at);
    if (index >= 0) return {entryDepth, mergeIndex: index, mergeNode: at};
    seen.add(at); at = map[at]; entryDepth += 1;
  }
  return null;
}
const mergeFamilyHits = [];
for (const c of candidates) {
  const m = firstMustMerge(map59, c.start);
  if (!m || m.entryDepth === 0) continue;
  const remaining = mustPath.length - 1 - m.mergeIndex;
  const totalDepth = m.entryDepth + remaining;
  if (extendedDepthValues.has(m.entryDepth) && extendedDepthValues.has(totalDepth) &&
      c.length === totalDepth && wordSumNodes.has(m.mergeNode))
    mergeFamilyHits.push({...c, ...m, remaining, totalDepth});
}
assert.equal(mergeFamilyHits.length, 1);
assert.deepEqual(
  [mergeFamilyHits[0].word, mergeFamilyHits[0].sumType, mergeFamilyHits[0].addressMode,
   mergeFamilyHits[0].start, mergeFamilyHits[0].entryDepth, mergeFamilyHits[0].mergeNode,
   mergeFamilyHits[0].totalDepth],
  ['EMERGE', 'primeSum', 'mod256', 44, 2, 72, 6],
);

// SURFACE is a p57-internal holdout. Scan all20 GP0 target words, not SURFACE only.
const surface = byName['SURFACE:8'];
assert.equal(surface.gp0, 67);
const familyRootToken = tokens[root];
assert.equal(tokens[surface.gp0], familyRootToken);
const familyRootTokenCopies = tokens.flatMap((token, address) =>
  token === familyRootToken ? [address] : []);
assert.deepEqual(familyRootTokenCopies, [67, 162, 189, 247]);
const familyP57RootTokenWords = words
  .filter((word) => word.gp0 < 256 && tokens[word.gp0] === familyRootToken)
  .map((word) => ({position: word.position, word: word.name, address: word.gp0}));
assert.deepEqual(familyP57RootTokenWords, [{position: 8, word: 'SURFACE', address: 67}]);
const familyEmergeColumns = emergePath.map((address) => address % 8);
const familyMissingColumns = Array.from({length: 8}, (_, i) => i)
  .filter((i) => !familyEmergeColumns.includes(i));
assert.deepEqual(familyEmergeColumns, [4, 2, 0, 1, 6, 7, 5]);
assert.deepEqual(familyMissingColumns, [3]);

const targetAddresses = words.map((word) => ({
  address: word.gp0, word: word.name, position: word.position, column: word.gp0 % 8,
}));
assert(targetAddresses.every((t) => t.address >= 0 && t.address < 256));
const targetsByColumn = Array.from({length: 8}, (_, column) =>
  targetAddresses.filter((target) => target.column === column));
function completionHits(tokenTable, map) {
  const hits = [];
  for (const c of candidates) {
    const path = walkSteps(map, c.start, c.length);
    if (!path) continue;
    const end = path[path.length - 1];
    if (map[end] !== end) continue;
    const columns = new Set(path.map((address) => address % 8));
    if (columns.size !== 7) continue;
    const missing = Array.from({length: 8}, (_, i) => i)
      .filter((i) => !columns.has(i));
    if (missing.length !== 1) continue;
    const targets = targetsByColumn[missing[0]]
      .filter((target) => tokenTable[target.address] === tokenTable[end]);
    if (targets.length) hits.push({
      source: c.word, position: c.position, sumType: c.sumType, addressMode: c.addressMode,
      start: c.start, length: c.length, path, end, endToken: tokenTable[end],
      missingColumn: missing[0],
      targets: targets.map((t) => ({word: t.word, position: t.position, address: t.address})),
    });
  }
  return hits;
}
const originalCompletions = completionHits(tokens, map59);
const base60Completions = completionHits(tokens, map60);
assert.equal(originalCompletions.length, 1);
assert.deepEqual(
  [originalCompletions[0].source, originalCompletions[0].sumType, originalCompletions[0].addressMode,
   originalCompletions[0].start, originalCompletions[0].path, originalCompletions[0].end,
   originalCompletions[0].endToken, originalCompletions[0].missingColumn, originalCompletions[0].targets],
  ['EMERGE', 'primeSum', 'mod256', 44, [44, 226, 72, 161, 214, 247, 189], 189, '3C', 3,
   [{word: 'SURFACE', position: 8, address: 67}]],
);
assert.equal(base60Completions.length, 0);

// Conditional exact-multiset nulls. Freeze the eight MUST edges, root fixed
// point, and p27 coordinate selector cell254=39; shuffle the other246 tokens.
const fixedCells = [...mustPath, 254];
assert.equal(new Set(fixedCells).size, fixedCells.length);
assert.equal(tokens[254], '39');
const fixedSet = new Set(fixedCells);
const fixedTokens = new Map(fixedCells.map((address) => [address, tokens[address]]));
const pool = tokens.filter((_, address) => !fixedSet.has(address));
function randomTableStream(seed) {
  let state = seed >>> 0;
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
  return () => {
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = random() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const table = new Array(256);
    for (const [address, token] of fixedTokens) table[address] = token;
    let j = 0;
    for (let address = 0; address < 256; address += 1)
      if (!fixedSet.has(address)) table[address] = shuffled[j++];
    return table;
  };
}
function resolveToMust(map) {
  const distance = new Int16Array(256); distance.fill(-2);
  const targetIndex = new Int16Array(256); targetIndex.fill(-1);
  mustPath.forEach((address, i) => { distance[address] = 0; targetIndex[address] = i; });
  for (let start = 0; start < 256; start += 1) {
    if (distance[start] !== -2) continue;
    const path = [], seen = new Set();
    let at = start, baseDistance = -1, baseTarget = -1;
    while (true) {
      if (!Number.isInteger(at) || at < 0 || at >= 256) break;
      if (distance[at] !== -2) { baseDistance = distance[at]; baseTarget = targetIndex[at]; break; }
      if (seen.has(at)) break;
      seen.add(at); path.push(at); at = map[at];
    }
    for (let i = path.length - 1; i >= 0; i -= 1) {
      if (baseDistance < 0) { distance[path[i]] = -1; targetIndex[path[i]] = -1; }
      else { baseDistance += 1; distance[path[i]] = baseDistance; targetIndex[path[i]] = baseTarget; }
    }
  }
  return {distance, targetIndex};
}
function wilson95(hits, trials) {
  const z = 1.96, p = hits / trials, den = 1 + z * z / trials;
  const center = (p + z * z / (2 * trials)) / den;
  const half = z * Math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / den;
  return [center - half, center + half];
}
const mergeTrials = 50000, nextMergeTable = randomTableStream(0x19502026);
let mergeNullHits = 0, exactMergeNullHits = 0;
for (let trial = 0; trial < mergeTrials; trial += 1) {
  const resolved = resolveToMust(decode(nextMergeTable(), alphabet59));
  let any = false, exact = false;
  for (const c of candidates) {
    const entry = resolved.distance[c.start], ix = resolved.targetIndex[c.start];
    if (entry <= 0 || ix < 0) continue;
    const node = mustPath[ix], total = entry + (mustPath.length - 1 - ix);
    if (extendedDepthValues.has(entry) && extendedDepthValues.has(total) &&
        c.length === total && wordSumNodes.has(node)) any = true;
    if (entry === 2 && total === 6 && c.length === 6 && node === 72) exact = true;
  }
  if (any) mergeNullHits += 1;
  if (exact) exactMergeNullHits += 1;
}
assert.equal(mergeNullHits, 2355);
assert.equal(exactMergeNullHits, 2355);

const completionTrials = 100000, nextCompletionTable = randomTableStream(0x1950F00D);
let completionNullHits = 0, endpoint189NullHits = 0, missingColumn3NullHits = 0;
for (let trial = 0; trial < completionTrials; trial += 1) {
  const randomTokens = nextCompletionTable(), map = decode(randomTokens, alphabet59);
  let any = false, at189 = false, missing3 = false;
  for (const c of candidates) {
    const path = walkSteps(map, c.start, c.length);
    if (!path) continue;
    const end = path[path.length - 1];
    if (map[end] !== end || new Set(path.map((a) => a % 8)).size !== 7) continue;
    const missing = Array.from({length: 8}, (_, i) => i)
      .filter((i) => !path.some((a) => a % 8 === i));
    if (missing.length !== 1) continue;
    const token = randomTokens[end];
    if (!targetsByColumn[missing[0]].some((target) => randomTokens[target.address] === token)) continue;
    any = true;
    if (end === 189) at189 = true;
    if (missing[0] === 3) missing3 = true;
  }
  if (any) completionNullHits += 1;
  if (at189) endpoint189NullHits += 1;
  if (missing3) missingColumn3NullHits += 1;
}
assert.equal(completionNullHits, 211);
assert.equal(endpoint189NullHits, 203);
assert.equal(missingColumn3NullHits, 21);
const familywiseAudit = {
  sourceFamily: {
    p57Words: words.length, startVariants: candidates.length, roots: rootVariants,
    configurations: candidates.length * rootVariants.length * 2 * 2,
    signedPublicDepthValues: [...signedPublicDepthValues],
    extendedDepthValues: [...extendedDepthValues],
    depthLengthHits: depthHits, distinctDepthLengthHits: distinctDepthHits.size,
    withinBase60Path, mergeFamilyHits,
    surfaceHoldout: {
      position: surface.position, gp0Address: surface.gp0, rootToken: familyRootToken,
      rootTokenCopies: familyRootTokenCopies, matchingP57Words: familyP57RootTokenWords,
      emergeColumns: familyEmergeColumns, missingColumn: familyMissingColumns[0],
      originalCompletions,
    },
  },
  conditionalNulls: {
    fixedCells, frozenMustEdges: 8, frozenP27SelectorCell: 254,
    depthMerge: {trials: mergeTrials, hits: mergeNullHits, rate: mergeNullHits / mergeTrials,
      wilson95: wilson95(mergeNullHits, mergeTrials)},
    fixedPointColumnCompletion: {trials: completionTrials, hits: completionNullHits,
      rate: completionNullHits / completionTrials,
      wilson95: wilson95(completionNullHits, completionTrials),
      endpoint189Hits: endpoint189NullHits, missingColumn3Hits: missingColumn3NullHits},
    seeds: {depthMerge: '0x19502026', fixedPointColumnCompletion: '0x1950F00D'},
  },
};
assert.equal(familywiseAudit.conditionalNulls.depthMerge.hits, 2355);
assert.equal(familywiseAudit.conditionalNulls.fixedPointColumnCompletion.hits, 211);


process.stdout.write(JSON.stringify({
  status: 'source-constrained navigation closure; MOD256 SELECTOR UNRESOLVED; NO UNKNOWN PLAINTEXT',
  emerge: {
    primeSum: emerge.primeSum,
    tableAddressModulo256: emerge.address,
    path: emergePath,
    edgesToDhRoot: emergePath.length - 1,
  },
  merge: {
    afterEdges: emergePath.indexOf(merge),
    address: merge,
    p57Word: 'THE',
    gpPrimeSum: byName['THE:16'].primeSum,
  },
  dhRoot: {
    address: root,
    row: Math.floor(root / 8),
    column: root % 8,
    signedTuple: dh,
  },
  mustPath,
  fixedGraphControl: {
    depthSixAddresses,
    p57WordsAtDepthSix: p57DepthSix.map((word) => word.name),
    p57WordsWhoseOwnRuneLengthEqualsDepth: p57SelfLengthDepth.map((word) => word.name),
    fixedAddressFraction: depthSixAddresses.length / 256,
  },
  base60Control: {
    start: emerge.address,
    prefix: base60Orbit.prefix,
    period: base60Orbit.period,
    repeated: base60Orbit.repeated,
  },
  familywiseAudit,
}, null, 2) + '\n');
