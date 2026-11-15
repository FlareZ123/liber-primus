'use strict';

// Original LP2 pp8-14 tree-to-instar lexical-key gate.
// Standalone, read-only CommonJS single-file test.
// Run from any directory with Node.js; repository resources resolve relative to this file.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const pages = transcription.split('%');
const runeToIndex = new Map(data.runes.map((rune, index) => [rune, index]));
const chapter = data.pages.filter(page => page.page >= 8 && page.page <= 14);
const original = chapter.flatMap(page => page.indices);
const words = [];

// '%' is the original transcription's physical-page delimiter.
// '-' and '.' divide words/clauses; '/' is a print-line continuation.
// The fixed gate treats printed page edges as word edges; it does not
// claim to test all possible ways of carrying a word across an image.
for (let pageNumber = 8; pageNumber <= 14; pageNumber += 1) {
  let current = [];
  /** Complete the source-visible word. */
  function flush() {
    if (current.length) {
      words.push({ pageNumber, runes: current });
      current = [];
    }
  }
  for (const character of pages[pageNumber]) {
    if (runeToIndex.has(character)) {
      current.push(runeToIndex.get(character));
    } else if ('-.:&$'.includes(character)) {
      flush();
    }
  }
  flush();
}
assert.equal(original.length, 1729);
assert.equal(words.length, 385);
assert.deepEqual(words.flatMap(word => word.runes), original);

/** @param {number[]} sequence GP29 integer sequence @returns {number} */
function indexOfCoincidence(sequence) {
  const freq = new Array(29).fill(0);
  for (const number of sequence) freq[number] += 1;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/** @param {string} text Canonical GP29 letter labels @returns {number[]} */
function keyFromLabels(text) {
  return [...text].map(letter => {
    const index = data.translit.indexOf(letter);
    assert.ok(index >= 0, 'Not a source-supported GP29 label: ' + letter);
    return index;
  });
}

/**
 * Deterministic source-word entry: page-order, outside-in, or inside-out.
 * @param {number} length Word length
 * @param {'page'|'outside-in'|'inside-out'} route
 * @returns {number[]}
 */
function visitOrder(length, route) {
  if (route === 'page') return Array.from({ length }, (_, i) => i);
  if (route === 'outside-in') {
    return Array.from({ length }, (_, i) => i % 2 === 0 ?
      i / 2 : length - 1 - Math.floor(i / 2));
  }
  const left = Math.floor((length - 1) / 2);
  const right = Math.ceil(length / 2);
  return Array.from({ length }, (_, i) => i % 2 === 0 ?
    left - i / 2 : right + Math.floor(i / 2));
}

/**
 * The sign is the subtraction/addition of a fixed repeating key.
 * Permutation is word local, while key clock is continuous for pp8-14.
 * @param {number[]} key
 * @param {'page'|'outside-in'|'inside-out'} route
 * @param {-1|1} sign
 * @returns {{decoded:number[],valid:boolean,p14:number[]}}
 */
function trial(key, route, sign) {
  const decoded = [];
  const reconstructed = [];
  let clock = 0;
  for (const word of words) {
    const order = visitOrder(word.runes.length, route);
    assert.equal(new Set(order).size, word.runes.length);
    const ciphertextInTraversalOrder = order.map(i => word.runes[i]);
    const plaintextInTraversalOrder = ciphertextInTraversalOrder.map((c, i) =>
      (c + sign * key[(clock + i) % key.length] + 29) % 29);
    const recoveredInTraversalOrder = plaintextInTraversalOrder.map((p, i) =>
      (p - sign * key[(clock + i) % key.length] + 29) % 29);
    const recoveredOriginalOrder = new Array(word.runes.length);
    for (let i = 0; i < order.length; i += 1) {
      recoveredOriginalOrder[order[i]] = recoveredInTraversalOrder[i];
    }
    reconstructed.push(...recoveredOriginalOrder);
    decoded.push(...plaintextInTraversalOrder);
    clock += word.runes.length;
  }
  return {
    decoded,
    valid: reconstructed.every((x, i) => x === original[i]),
    p14: decoded.slice(-chapter[chapter.length - 1].indices.length)
  };
}


/**
 * Exact historic plaintext-F transparent key reachability. At ciphertext F,
 * retain both literal F/no-key and consuming non-F possibilities; at any
 * non-F ciphertext, consumption is mandatory and P=F is forbidden.
 *
 * @param {number[]} cipher Already in the frozen original word visit order
 * @param {number[]} key Fixed GP29-key labels
 * @returns {{firstImpossible:number|null,priorClocks:number[]}}
 */
function nativeFehuReach(cipher, key) {
  let clocks = new Set([0]);
  for (let i = 0; i < cipher.length; i += 1) {
    const next = new Set();
    for (const consumed of clocks) {
      const c = cipher[i];
      if (c === 0) next.add(consumed);
      if (((c - key[consumed % key.length] + 29) % 29) !== 0) {
        next.add(consumed + 1);
      }
    }
    if (!next.size) {
      return { firstImpossible: i, priorClocks: [...clocks].sort((a,b) => a-b) };
    }
    clocks = next;
  }
  return { firstImpossible: null, priorClocks: [...clocks].sort((a,b) => a-b) };
}

const historicalFFailures = {
  'DIVINITY': { 'page': 1, 'outside-in': 75, 'inside-out': 10 },
  'INSTAR': { 'page': 13 }
};

const baseline = indexOfCoincidence(original);
const clearP57 = indexOfCoincidence(data.pages[57].indices);
const configs = [
  { name: 'DIVINITY', key: keyFromLabels('DIUINITY'), routes: ['page', 'outside-in', 'inside-out'] },
  { name: 'INSTAR', key: keyFromLabels('INSTAR'), routes: ['page'] }
];
console.log(JSON.stringify({
  originalChapter: { pages: '8-14', runes: original.length, sourceWords: words.length, ioc: baseline },
  actualClearP57: { runes: data.pages[57].indices.length, ioc: clearP57 }
}));
for (const config of configs) {
  for (const route of config.routes) {
    const cipherInVisitOrder = words.flatMap(word =>
      visitOrder(word.runes.length, route).map(i => word.runes[i]));
    const exactNativeF = nativeFehuReach(cipherInVisitOrder, config.key);
    assert.equal(exactNativeF.firstImpossible, historicalFFailures[config.name][route]);
    console.log(JSON.stringify({
      key: config.name, route, actualHistoricalPlaintextFSkip: true,
      firstImpossibleRune: exactNativeF.firstImpossible,
      priorConsumedKeyClocks: exactNativeF.priorClocks
    }));
    for (const sign of [-1, 1]) {
      const result = trial(config.key, route, sign);
      assert.ok(result.valid, 'failed exact original-cipher reconstruction');
      console.log(JSON.stringify({
        key: config.name,
        gpKeyIndices: config.key,
        route,
        shift: sign === -1 ? 'cipher-minus-key' : 'cipher-plus-key',
        chapterIoC: indexOfCoincidence(result.decoded),
        p14IoC: indexOfCoincidence(result.p14),
        exactReencryption: result.valid,
        p8First30: result.decoded.slice(0, 30).map(i => data.translit[i]).join(' ')
      }));
    }
  }
}
console.log('Decision: no 120-rune original plaintext; all four native F-transparent hypotheses are exact algebraic negatives.');
