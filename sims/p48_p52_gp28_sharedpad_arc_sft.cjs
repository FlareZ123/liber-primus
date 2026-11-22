'use strict';

/**
 * P48/p52 source-paired transparent-repeat GP28 shared-key gate.
 *
 * Run: node sims/p48_p52_gp28_sharedpad_arc_sft.cjs
 *
 * The 263-rune p48 prefix and complete 263-rune p52 each have exactly
 * one adjacent ciphertext doublet. Under the explicitly hypothetical
 * page-IV, nonconsuming-repeat, 28-rank decoder, both leave 261 pad
 * positions. If they share an aligned additive mod28 keystream, the
 * pairwise difference of their ranks is independent of the unknown key.
 *
 * The finite native-word constraint covers Shakespeare, Emerson and
 * solved LP1 GP-encodable words lacking GP index28. Original printed
 * word boundaries are treated as plaintext boundaries after deleting
 * the leading IV and one transparent repeat in each text. The first
 * p48 and first/last p52 word fragments remain unconstrained.
 *
 * Conditional exclusion only; no recovered original plaintext or key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pathModule = require('node:path');

const root = pathModule.join(__dirname, '..');
const read = name => fs.readFileSync(pathModule.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt').split('%');
const symbol = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((r, i) => [r, i]));
const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt'
];

/** @param {string} input @returns {number[]|null} */
function encodeWord(input) {
  const normalized = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const pair = gp.get(normalized.slice(i, i + 2));
    if (pair !== undefined) {
      result.push(pair);
      i += 2;
    } else {
      const single = gp.get(normalized[i]);
      if (single === undefined) return null;
      result.push(single);
      i++;
    }
  }
  return result;
}

const dictionary = new Map([[0, new Map([['', []]])]]);
for (const name of sources) {
  for (const raw of read(name).match(/[A-Za-z]+/g) || []) {
    const word = encodeWord(raw);
    if (!word || word.includes(28)) continue;
    if (!dictionary.has(word.length)) dictionary.set(word.length, new Map());
    dictionary.get(word.length).set(word.join(','), word);
  }
}

/** @param {number} pageIndex Index in uncompressed transcript. */
function pieces(pageIndex) {
  return transcript[pageIndex].replace(/\/\s*/g, '')
    .split(/[-.$&§\s]+/)
    .filter(word => /^[\u16A0-\u16FF]+$/u.test(word))
    .map(word => [...word].map(r => symbol.get(r)));
}
const wordA = pieces(48).slice(0, -1);
const wordB = pieces(51); // transcription omits the runeless p50
const cipherA = corpus.pages.find(page => page.page === 48).indices.slice(0, -8);
const cipherB = corpus.pages.find(page => page.page === 52).indices;
assert.deepEqual(wordA.flat(), cipherA);
assert.deepEqual(wordB.flat(), cipherB);
assert.deepEqual([cipherA.length, cipherB.length], [263, 263]);
assert.deepEqual([wordA.length, wordB.length], [66, 60]);

/** @param {number[]} ciphertext @returns {number[]} */
function repeatedPositions(ciphertext) {
  const positions = [];
  for (let i = 1; i < ciphertext.length; i++)
    if (ciphertext[i] === ciphertext[i - 1]) positions.push(i);
  return positions;
}
assert.deepEqual(repeatedPositions(cipherA), [68]);
assert.deepEqual(repeatedPositions(cipherB), [168]);

const log15 = Array(29).fill(-1);
const pow15 = Array(28).fill(0);
let element = 1;
for (let i = 0; i < 28; i++) {
  assert.equal(log15[element], -1);
  log15[element] = i;
  pow15[i] = element;
  element = element * 15 % 29;
}
assert.equal(element, 1);
assert.equal(log15[0], -1);

/**
 * Omit the page-start IV and each adjacent repeated output. Every
 * remaining ciphertext transition is mapped bijectively to Z28.
 * @param {number[][]} words
 * @param {'sorted'|'log15'} register
 * @returns {number[][]}
 */
function compact(words, register) {
  let previous = -1;
  const result = [];
  for (const word of words) {
    const group = [];
    for (const rune of word) {
      if (previous === -1) {
        previous = rune;
        continue;
      }
      const delta = (rune - previous + 29) % 29;
      previous = rune;
      if (delta === 0) continue;
      group.push(register === 'sorted' ? delta - 1 : log15[delta]);
    }
    result.push(group);
  }
  return result;
}

/** @param {number[][]} words */
function domains(words) {
  let start = 0;
  return words.map((word, index) => {
    const result = {
      index, start, len: word.length,
      candidates: [...(dictionary.get(word.length)?.values() || [])]
    };
    start += word.length;
    return result;
  });
}

/**
 * Run exact arc consistency, granting all dictionary words of each
 * compressed word length. A violating overlap is a finite contradiction
 * independent of the unknown shared additive key.
 * @param {number[][]} left
 * @param {number[][]} right
 * @param {number[]} delta
 * @returns {object}
 */
function arc(left, right, delta) {
  const A = domains(left), B = domains(right), edges = [];
  for (let i = 1; i < A.length; i++) {
    for (let j = 1; j < B.length - 1; j++) {
      const a = A[i], b = B[j];
      const start = Math.max(a.start, b.start);
      const end = Math.min(a.start + a.len, b.start + b.len);
      if (end > start) edges.push({i, j, start, end});
    }
  }
  assert.equal(edges.length, 109);
  let removed = 0;
  for (let pass = 0; pass < 30; pass++) {
    let changed = 0;
    for (const edge of edges) {
      const x = A[edge.i], y = B[edge.j];
      const width = edge.end - edge.start;
      const xStart = edge.start - x.start;
      const yStart = edge.start - y.start;
      const available = new Set(y.candidates.map(word =>
        String.fromCharCode(...word.slice(yStart, yStart + width))));
      const accepted = new Set(), nextX = [];
      for (const word of x.candidates) {
        const needed = [];
        for (let k = 0; k < width; k++)
          needed.push((word[xStart + k] - delta[edge.start + k] + 28) % 28);
        const key = String.fromCharCode(...needed);
        if (available.has(key)) {
          nextX.push(word);
          accepted.add(key);
        }
      }
      const nextY = y.candidates.filter(word =>
        accepted.has(String.fromCharCode(...word.slice(yStart, yStart + width))));
      changed += x.candidates.length - nextX.length +
        y.candidates.length - nextY.length;
      x.candidates = nextX;
      y.candidates = nextY;
      if (!nextX.length || !nextY.length)
        return {feasible: false, pass, edge,
          overlapRunes: width, removed: removed + changed,
          edges: edges.length};
    }
    removed += changed;
    if (!changed)
      return {feasible: true, pass, removed, edges: edges.length,
        remaining: [A, B].map(list =>
          list.reduce((sum, item) => sum + item.candidates.length, 0))};
  }
  return {feasible: true, incomplete: true, removed, edges: edges.length};
}

let state = 0x33012548;
/** @returns {number} */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

/** @param {number[][]} words @returns {number[][]} */
function plantedWords(words) {
  return words.map(word => {
    const options = [...dictionary.get(word.length).values()];
    assert.ok(options.length > 0);
    return options[random() % options.length];
  });
}

/**
 * Construct a true common-pad ciphertext, holding original 263-position
 * layouts and the two different repeat positions. Repeating outputs
 * consume no pad; the first rune is a freely chosen IV.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} iv
 * @param {number} repeatPosition
 * @param {'sorted'|'log15'} register
 * @returns {number[]}
 */
function encrypt(plain, key, iv, repeatPosition, register) {
  const out = [iv];
  let consumed = 0;
  for (let i = 1; i < 263; i++) {
    const previous = out[i - 1];
    if (i === repeatPosition) {
      out.push(previous);
      continue;
    }
    const rank = (plain[consumed] + key[consumed]) % 28;
    const delta = register === 'sorted' ? rank + 1 : pow15[rank];
    out.push((previous + delta) % 29);
    consumed++;
  }
  assert.equal(consumed, 261);
  return out;
}

const findings = [];
for (const register of ['sorted', 'log15']) {
  const a = compact(wordA, register), b = compact(wordB, register);
  assert.deepEqual([a.flat().length, b.flat().length], [261, 261]);
  const difference = a.flat().map((x, i) => (x - b.flat()[i] + 28) % 28);
  const original = arc(a, b, difference);
  assert.equal(original.feasible, false);

  const nativeA = plantedWords(a), nativeB = plantedWords(b);
  const plainA = nativeA.flat(), plainB = nativeB.flat();
  const hiddenPad = Array.from({length: 261}, () => random() % 28);
  const encryptedA = encrypt(plainA, hiddenPad, cipherA[0], 68, register);
  const encryptedB = encrypt(plainB, hiddenPad, cipherB[0], 168, register);
  assert.deepEqual(repeatedPositions(encryptedA), [68]);
  assert.deepEqual(repeatedPositions(encryptedB), [168]);

  const reformedA = [];
  const reformedB = [];
  let offset = 0;
  for (const w of wordA) {
    reformedA.push(encryptedA.slice(offset, offset + w.length));
    offset += w.length;
  }
  offset = 0;
  for (const w of wordB) {
    reformedB.push(encryptedB.slice(offset, offset + w.length));
    offset += w.length;
  }
  const rankA = compact(reformedA, register).flat();
  const rankB = compact(reformedB, register).flat();
  assert.deepEqual(rankA, plainA.map((v, i) => (v + hiddenPad[i]) % 28));
  assert.deepEqual(rankB, plainB.map((v, i) => (v + hiddenPad[i]) % 28));
  const plantedDifference = rankA.map((x, i) => (x - rankB[i] + 28) % 28);
  assert.deepEqual(plantedDifference,
    plainA.map((x, i) => (x - plainB[i] + 28) % 28));
  const positive = arc(nativeA, nativeB, plantedDifference);
  assert.equal(positive.feasible, true);
  findings.push({register, original, positive});
}
console.log(JSON.stringify({
  source: 'Original LP2 p48 prefix263 and p52 whole263',
  originalRepeatLocations: [[68], [168]],
  compactedRuneLengths: [261, 261],
  originalWordCounts: [wordA.length, wordB.length],
  referenceSources: sources,
  dictionarySizes: [...dictionary].map(([len, words]) => [len, words.size])
    .sort((a, b) => a[0] - b[0]),
  findings,
  conclusion: 'The exact paired, aligned, common-pad GP28 register fails ' +
    'native-reference word constraints for both source-motivated rank maps. ' +
    'The same inverse and contradiction finder accept genuine hidden-key ' +
    'plants. Different segmentation, dictionary, state and key clocks remain open.'
}, null, 2));
