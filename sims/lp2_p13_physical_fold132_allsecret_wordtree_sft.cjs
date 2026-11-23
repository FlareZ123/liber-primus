'use strict';

/**
 * LP2 physical p13/p14: 132 physically overlapped folded-rune key cancellation.
 *
 * CJS SFT, Node 22+. Read-only; uses original ciphertext and printed word
 * boundaries. A native GP29 alphabet and an intentionally broad finite
 * lexical set are used. This cannot rule out arbitrary nonlexical plaintext.
 *
 * Reproducer: node sims/lp2_p13_physical_fold132_allsecret_wordtree_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.find(page => page.page === 13).indices;
const source = load('resources/liber-primus/lp2-transcription.txt').replace(/\r?\n/g, '').split('%')[13];
const runeSet = new Set(corpus.runes);
const gp = new Map(corpus.translit.map((letter, index) => [letter, index]));

assert.equal(original.length, 272);
const p14 = corpus.pages.find(page => page.page === 14).indices;
assert.equal(p14.length, 137);
assert.equal(p14[2], 0, 'The F of the printed FOLD must occupy p14 position 2.');
const lineRunes = source.split('/').map(line => [...line].filter(g => runeSet.has(g))).filter(line => line.length > 0);
const lineLengths = lineRunes.map(line => line.length);
assert.deepEqual(lineLengths, [24, 21, 23, 23, 22, 23, 22, 25, 21, 22, 22, 24]);
const lineOffsets = [];
let lineCursor = 0;
for (const line of lineRunes) {
  lineOffsets.push(lineCursor);
  lineCursor += line.length;
}
assert.equal(lineCursor, original.length);
// Fold the PHYSICAL 12 printed lines, retaining identical horizontal column.
// This differs from a flat 136+136 or reversed-flat 136-rune pairing.
// Eight unmatched source rune positions are not counted as constraints.
const physicalPairs = [];
for (let line = 0; line < 6; line++) {
  const top = lineOffsets[line];
  const bottom = lineOffsets[11 - line];
  const length = Math.min(lineLengths[line], lineLengths[11 - line]);
  for (let x = 0; x < length; x++) physicalPairs.push([top + x, bottom + x]);
}
assert.equal(physicalPairs.length, 132);
const occupied = new Set(physicalPairs.flat());
assert.equal(occupied.size, 264);


/** @param {string} latin @returns {number[] | null} */
function encodeGP(latin) {
  const word = latin.toUpperCase()
    .replaceAll('V', 'U').replaceAll('K', 'C')
    .replaceAll('Z', 'S').replaceAll('Q', 'CW');
  const tokens = [];
  for (let i = 0; i < word.length;) {
    const digraph = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']
      .find(part => word.startsWith(part, i));
    const token = digraph === 'ING' ? 'NG' : digraph || word[i];
    if (!gp.has(token)) return null;
    tokens.push(gp.get(token));
    i += digraph ? digraph.length : 1;
  }
  return tokens;
}

/** @returns {{ wordList: number[][][], count: number, wordKeys: Set<string> }} */
function loadDictionary() {
  const vocab = new Map();
  const input = [
    'resources/control/english_wordfreq_textblob.txt',
    'resources/control/dwyl-english-alpha-gp13-14-only.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt',
  ];
  for (let fileIndex = 0; fileIndex < input.length; fileIndex++) {
    const content = load(input[fileIndex]);
    const words = fileIndex === 0
      ? content.split('\n').map(line => line.trim().split(/\s+/)[0])
      : content.match(/[A-Za-z]+/g) || [];
    for (const word of words) {
      if (!/^[a-z]+$/i.test(word) || word.length > 24) continue;
      const seq = encodeGP(word);
      if (seq && seq.length && seq.length <= 20) vocab.set(seq.join(','), seq);
    }
  }
  const wordList = Array.from({ length: 21 }, () => []);
  for (const word of vocab.values()) wordList[word.length].push(word);
  return { wordList, count: vocab.size, wordKeys: new Set(vocab.keys()) };
}

const { wordList, count: vocabularySize, wordKeys } = loadDictionary();
assert.equal(vocabularySize, 60403);

const wordLengths = [];
let length = 0;
for (const character of source) {
  if (runeSet.has(character)) {
    length++;
  } else if ('-.:;!?'.includes(character) && length) {
    wordLengths.push(length);
    length = 0;
  }
}
if (length) wordLengths.push(length);

const starts = [];
const wordAt = [];
for (let word = 0; word < wordLengths.length; word++) {
  starts.push(wordAt.length);
  for (let i = 0; i < wordLengths[word]; i++) wordAt.push(word);
}
assert.equal(wordLengths.length, 61);
assert.equal(wordAt.length, 272);
assert.equal(starts[33], 134);
assert.equal(wordLengths[33], 4);
const SOURCE_WORD_FIRST = 0;
const SOURCE_WORD_LAST = wordLengths.length - 1;

/**
 * @typedef {[number, number, number]} Constraint
 * @typedef {{u:number,v:number,checks:Constraint[]}} Edge
 */

/**
 * @param {number[]} cipher
 * @param {boolean} oppositeSign
 */
function buildGraph(cipher, oppositeSign) {
  /** @type {Map<string, Edge>} */
  const edges = new Map();
  /** @type {Map<number, Constraint[]>} */
  const self = new Map();
  for (const [p, q] of physicalPairs) {
    const u = wordAt[p];
    const v = wordAt[q];
    // First/last source-page words may continue across page seams, so grant
    // *both* the entire word and all of its constraints for free.
    if ([u, v].some(id => id === SOURCE_WORD_FIRST || id === SOURCE_WORD_LAST)) continue;
    assert(u <= v);
    const d = oppositeSign ? (cipher[p] + cipher[q]) % 29
      : (cipher[p] - cipher[q] + 29) % 29;
    const condition = [p - starts[u], q - starts[v], d];
    if (u === v) {
      if (!self.has(u)) self.set(u, []);
      self.get(u).push(condition);
      continue;
    }
    const id = String(u) + ':' + String(v);
    if (!edges.has(id)) edges.set(id, { u, v, checks: [] });
    edges.get(id).checks.push(condition);
  }
  const adj = Array.from({ length: wordLengths.length }, () => []);
  for (const edge of edges.values()) {
    adj[edge.u].push([edge.v, edge]);
    adj[edge.v].push([edge.u, edge]);
  }

  // Every rune slot participates in at most one edge constraint.
  // This is what makes independently assigned out-of-lexicon words exact
  // rather than a heuristic relaxation.
  const seenSlots = new Set();
  for (const edge of [...edges.values()]) {
    for (const [i, j] of edge.checks) {
      const slots = [String(edge.u) + ':' + i, String(edge.v) + ':' + j];
      for (const slot of slots) {
        assert(!seenSlots.has(slot), 'Overlapping wildcard constraints.');
        seenSlots.add(slot);
      }
    }
  }
  for (const [u, checks] of self) {
    for (const [i, j] of checks) for (const slot of [u + ':' + i, u + ':' + j]) {
      assert(!seenSlots.has(slot), 'Overlapping folded self constraint.');
      seenSlots.add(slot);
    }
  }
  return { edges, self, adj };
}

/** @param {number[]} costs */
function minimum(costs) {
  let value = Infinity;
  for (const cost of costs) if (cost < value) value = cost;
  return value;
}

/**
 * Exactly minimize the count of whole source words declared OOV. A missing
 * word receives arbitrary GP29 symbols, while a lexicon word is fixed.
 * Forest structure and nonoverlapping word slots permit exact tree DP.
 *
 * @param {number[]} cipher
 * @param {boolean} oppositeSign
 */
function minimumNonlexicalWords(cipher, oppositeSign) {
  const { edges, self, adj } = buildGraph(cipher, oppositeSign);
  const visited = new Set();
  const components = [];

  /** @param {number} u @param {number} parent */
  function visit(u, parent) {
    assert(!visited.has(u), 'The original word-intersection graph must remain a forest.');
    visited.add(u);
    const children = adj[u].filter(([v]) => v !== parent)
      .map(([v, edge]) => ({ v, edge, result: visit(v, u) }));
    const vocab = wordList[wordLengths[u]];
    const lexicalCosts = new Array(vocab.length).fill(0);
    const unary = self.get(u);
    if (unary) {
      for (let i = 0; i < vocab.length; i++) {
        const word = vocab[i];
        if (!unary.every(([a, b, d]) => (oppositeSign
          ? (word[a] + word[b]) % 29
          : (word[a] - word[b] + 29) % 29) === d)) lexicalCosts[i] = Infinity;
      }
    }

    let unlexicalCost = 1;
    for (const { v, edge, result } of children) {
      unlexicalCost += Math.min(result.unlexicalCost, minimum(result.lexicalCosts));
      const bestBySignature = new Map();
      for (let i = 0; i < result.lexicalCosts.length; i++) {
        const child = wordList[wordLengths[v]][i];
        const signature = edge.checks
          .map(([a, b]) => child[v === edge.u ? a : b]).join(',');
        const prior = bestBySignature.get(signature) ?? Infinity;
        if (result.lexicalCosts[i] < prior)
          bestBySignature.set(signature, result.lexicalCosts[i]);
      }
      for (let i = 0; i < vocab.length; i++) {
        if (!Number.isFinite(lexicalCosts[i])) continue;
        const parent = vocab[i];
        const expected = edge.checks.map(([a, b, d]) => {
          const value = parent[u === edge.u ? a : b];
          if (oppositeSign) return (d - value + 29) % 29;
          return u === edge.u ? (value - d + 29) % 29 : (value + d) % 29;
        }).join(',');
        lexicalCosts[i] += Math.min(result.unlexicalCost,
          bestBySignature.get(expected) ?? Infinity);
      }
    }
    return { lexicalCosts, unlexicalCost };
  }

  let total = 0;
  for (let u = 1; u < SOURCE_WORD_LAST; u++) {
    if (visited.has(u)) continue;
    const result = visit(u, -1);
    const minimumWords = Math.min(result.unlexicalCost, minimum(result.lexicalCosts));
    total += minimumWords;
    components.push({ root: u, minimumWords });
  }
  assert.equal(edges.size, visited.size - components.length,
    'The source word overlap graph must be a forest.');
  return { total, components, edgeCount: edges.size,
    selfConstraints: [...self.values()].reduce((sum, x) => sum + x.length, 0) };
}

let seed = 3301;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @returns {number[]} */
function randomNativePlaintext() {
  return wordLengths.flatMap(n => wordList[n][random32() % wordList[n].length]);
}

/** @param {number[]} plaintext */
function encryptShared(plaintext, oppositeSign) {
  // The eight physical overhang runes are unconstrained by the repeated pad.
  const ciphertext = plaintext.map(x => (x + random32() % 29) % 29);
  for (const [p, q] of physicalPairs) {
    const key = random32() % 29;
    ciphertext[p] = (plaintext[p] + key) % 29;
    ciphertext[q] = (plaintext[q] + (oppositeSign ? -key : key) + 29) % 29;
  }
  return ciphertext;
}

/** @param {number[]} data */
function shuffle(data) {
  const array = data.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const modes = [];
for (const oppositeSign of [false, true]) {
  const originalResult = minimumNonlexicalWords(original, oppositeSign);
  const native = randomNativePlaintext();
  const plantedCiphertext = encryptShared(native, oppositeSign);
  const positive = minimumNonlexicalWords(plantedCiphertext, oppositeSign);
  assert.equal(positive.total, 0, 'A planted native two-time-pad plaintext must survive.');
  modes.push({
    oppositeSign,
    originalMinimumOOV: originalResult.total,
    componentMinimums: originalResult.components.map(x => x.minimumWords),
    originalEdgeCount: originalResult.edgeCount,
    selfConstraints: originalResult.selfConstraints,
  });
}
// The original-source outcome is reported directly, without target tuning.

const nulls = [];
for (let sample = 0; sample < 24; sample++) {
  const shuffled = shuffle(original);
  const costs = [];
  for (const oppositeSign of [false, true]) {
    costs.push(minimumNonlexicalWords(shuffled, oppositeSign).total);
  }
  nulls.push(costs);
}
const sortedMin = nulls.map(row => Math.min(...row)).sort((a, b) => a - b);
const nativeSource = load('resources/liber-primus/lp1-plaintext-reference.txt');
const authenticWords = nativeSource.split(/### \d+\n/).flatMap(section =>
  (section.match(/\b[A-Z]{2,}\b/g) || []).filter(word => word.length >= 2));
const unknownToLexicon = authenticWords.filter(word => !wordKeys.has(
  (encodeGP(word) || []).join(','))).length;

console.log(JSON.stringify({
  source: 'original LP2 p13 30.jpg, physical 12-line same-column fold, adjacent p14 31.jpg FOLD',
  runeCount: original.length,
  foldedPairs: physicalPairs.length,
  overhangRuneCount: original.length - occupied.size,
  lineLengths,
  printedWords: wordLengths.length,
  completeCandidateWords: wordLengths.length - 2,
  lexiconTypes: vocabularySize,
  genuineSourceLexiconUnrecognized: {
    count: unknownToLexicon,
    total: authenticWords.length,
  },
  modes,
  nativePlants: 2,
  shuffledSourceNulls: {
    samples: nulls.length,
    eachMinimumOOV: sortedMin,
    medianMinimumOOV: sortedMin[Math.floor(sortedMin.length / 2)],
    originalMinimumAcrossModes: Math.min(...modes.map(m => m.originalMinimumOOV)),
  },
}, null, 2));
