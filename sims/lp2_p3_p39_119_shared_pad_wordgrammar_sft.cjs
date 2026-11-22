"use strict";
/**
 * P3/P39 red-119 two-time-pad original-input word-grammar gate.
 * SFT: node sims/lp2_p3_p39_119_shared_pad_wordgrammar_sft.cjs
 *
 * A fixed reused additive GF29 key cancels in aligned differences.
 * The 119-rune cut on each page is source-visible and exactly ends a word.
 * Exact product-trie dynamic programming grants any shared secret key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pageText = read("resources/lp2-transcription.txt").split("%");
const namedSources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
const mod = n => (n % 29 + 29) % 29;
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const latinIndex = new Map(gp.translit.map((t, i) => [t, i]));
const latinTokens = gp.translit.slice().sort((a, b) => b.length - a.length);

/** @param {string} w @returns {number[] | null} */
function spell(w) {
  const s = w.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = latinTokens.find(x => s.startsWith(x, i));
    if (t === undefined) return null;
    out.push(latinIndex.get(t));
    i += t.length;
  }
  return out;
}

/**
 * Return original page rune values and real printed word ends.
 * Physical wraps and whitespace are not word delimiters.
 * @param {number} number
 */
function parsePage(number) {
  const indices = [], ends = [];
  let wordLength = 0;
  for (const char of pageText[number]) {
    if (runeIndex.has(char)) {
      indices.push(runeIndex.get(char));
      wordLength++;
    } else if (char !== "/" && !/\s/u.test(char) && wordLength) {
      ends.push(indices.length);
      wordLength = 0;
    }
  }
  if (wordLength) ends.push(indices.length);
  assert.deepEqual(indices, gp.pages[number].indices);
  return {indices, ends};
}
/** @param {number[]} ends @returns {number[]} */
function wordLengths(ends) {
  let previous = 0;
  return ends.filter(end => end <= 119).map(end => {
    const length = end - previous;
    previous = end;
    return length;
  });
}
const p3 = parsePage(3), p39 = parsePage(39);
assert.equal(p3.ends.includes(119), true);
assert.equal(p39.ends.includes(119), true);
const lengthsA = wordLengths(p3.ends), lengthsB = wordLengths(p39.ends);
assert.deepEqual(lengthsA, [2,11,3,4,7,7,7,4,6,12,1,9,2,4,3,8,6,3,6,4,4,6]);
assert.deepEqual(lengthsB, [2,1,5,3,6,5,4,4,8,5,3,6,7,4,4,7,6,2,6,4,5,6,2,5,3,6]);

/** @type {Map<number, Map<string, number[]>>} */
const dictionary = new Map();
for (const filename of namedSources) {
  const words = filename.endsWith("english_wordfreq_textblob.txt")
    ? (read(filename).match(/^[a-z]+\s+\d+$/gm) || []).map(row => row.split(/\s+/)[0])
    : (read(filename).toUpperCase().match(/[A-Z]+/g) || []);
  for (const word of words) {
    const runes = spell(word);
    if (!runes || runes.length > 20) continue;
    const existing = dictionary.get(runes.length) || new Map();
    existing.set(runes.join(","), runes);
    dictionary.set(runes.length, existing);
  }
}
assert.equal([...dictionary.values()].reduce((n, entries) => n + entries.size, 0), 32081);

/**
 * @param {Map<string, number[]>} entries
 * @param {boolean} backwards
 */
function makeTrie(entries, backwards) {
  const nodes = [{next: new Int32Array(29).fill(-1), terminal: false}];
  for (const word of entries.values()) {
    let state = 0;
    for (const rune of backwards ? word.slice().reverse() : word) {
      let child = nodes[state].next[rune];
      if (child < 0) {
        child = nodes.length;
        nodes[state].next[rune] = child;
        nodes.push({next: new Int32Array(29).fill(-1), terminal: false});
      }
      state = child;
    }
    nodes[state].terminal = true;
  }
  return nodes;
}
const forward = new Map(), backward = new Map();
for (const [length, entries] of dictionary) {
  forward.set(length, makeTrie(entries, false));
  backward.set(length, makeTrie(entries, true));
}
/** @param {number[]} lengths */
function endsFromLengths(lengths) {
  let sum = 0;
  return lengths.map(length => (sum += length));
}

/**
 * Exact path existence under two native GP-English word dictionaries,
 * one fixed but entirely unknown additive key, and two printed layouts.
 * A state is the pair of currently active dictionary-trie nodes.
 * @param {number[]} cipherA
 * @param {number[]} cipherB
 * @param {number[]} lenA
 * @param {number[]} lenB
 * @param {boolean} reverseB
 */
function exactJointDecoder(cipherA, cipherB, lenA, lenB, reverseB = false) {
  const endA = endsFromLengths(lenA), endB = endsFromLengths(lenB);
  const readB = reverseB ? cipherB.slice(0, 119).reverse() : cipherB;
  assert.equal(endA.at(-1), 119);
  assert.equal(endB.at(-1), 119);
  let states = new Map([["0,0", [0, 0]]]);
  const stateCounts = [];
  for (let i = 0; i < 119; i++) {
    const slotA = endA.findIndex(end => end > i);
    const slotB = endB.findIndex(end => end > i);
    const trieA = forward.get(lenA[slotA]);
    const trieB = (reverseB ? backward : forward).get(lenB[slotB]);
    assert.ok(trieA && trieB, "missing native word length");
    const lastA = endA[slotA] === i + 1;
    const lastB = endB[slotB] === i + 1;
    const delta = mod(cipherA[i] - readB[i]);
    const next = new Map();
    for (const [left, right] of states.values()) {
      for (let digit = 0; digit < 29; digit++) {
        const other = mod(digit - delta);
        const newLeft = trieA[left].next[digit];
        const newRight = trieB[right].next[other];
        if (newLeft < 0 || newRight < 0) continue;
        if (lastA && !trieA[newLeft].terminal) continue;
        if (lastB && !trieB[newRight].terminal) continue;
        const a = lastA ? 0 : newLeft;
        const b = lastB ? 0 : newRight;
        next.set(a + "," + b, [a, b]);
      }
    }
    states = next;
    stateCounts.push(next.size);
    if (next.size === 0) return {
      possible: false, firstImpossibleRune: i + 1,
      statesBefore: i ? stateCounts[i - 1] : 1
    };
  }
  return {possible: true, finalStates: states.size};
}

// Two complete positive plants use exactly the original word-length layouts.
// Both reveal no secret key to the dictionary solver; one reverses the second pad.
let seed = 0x330119;
/** @returns {number} */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
/** @param {number[]} lengths @returns {number[]} */
function nativeWords(lengths) {
  return lengths.flatMap(length => {
    const options = [...dictionary.get(length).values()];
    return options[Math.floor(random() * options.length)];
  });
}
const nativeA = nativeWords(lengthsA), nativeB = nativeWords(lengthsB);
const key = Array.from({length: 119}, (_, i) => mod(i * 7 + 19));
const encodeA = nativeA.map((x, i) => mod(x + key[i]));
const encodeB = nativeB.map((x, i) => mod(x + key[i]));
const encodeBReverse = nativeB.map((x, i) => mod(x + key[118 - i]));
const positiveForward = exactJointDecoder(encodeA, encodeB, lengthsA, lengthsB);
const positiveReverse = exactJointDecoder(
  encodeA, encodeBReverse, lengthsA, lengthsB.slice().reverse(), true
);
assert.equal(positiveForward.possible, true);
assert.equal(positiveReverse.possible, true);
const actualForward = exactJointDecoder(
  p3.indices, p39.indices, lengthsA, lengthsB
);
const actualReverse = exactJointDecoder(
  p3.indices, p39.indices, lengthsA, lengthsB.slice().reverse(), true
);
assert.equal(actualForward.possible, false);
assert.equal(actualForward.firstImpossibleRune, 11);
assert.equal(actualReverse.possible, false);
assert.equal(actualReverse.firstImpossibleRune, 6);
console.log(JSON.stringify({
  source: "original p3 and p39 first 119 GP29 runes",
  dictionary: namedSources,
  uniqueNativeWords: [...dictionary.values()].reduce((n, m) => n + m.size, 0),
  fullWordBoundaries: [lengthsA.length, lengthsB.length],
  positiveForward, positiveReverse, actualForward, actualReverse,
  recoveredUnknownPlaintext: false
}, null, 2));
