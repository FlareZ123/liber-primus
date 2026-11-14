'use strict';

/**
 * Exhaust the public 27x27 model's *published* outgoing block-38 forecast
 * on the original unchanged 729-rune pp0-2 ciphertext, with a frozen
 * source-native GP wordlist. No plaintext or key is fitted to prior stages.
 *
 * This is a test of the 2026 third-party model, NOT of a Cicada-authored
 * rule. The 38-stage prefix and outgoing predictions were chosen by that
 * project's author, and key/coordinate choice after them is unfixed.
 *
 * SFT: node sims/lp2_public27_stage39_heldout_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const dictionarySource = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8'
);
const pages = source.pages.filter((p) => p.page <= 2);
assert.deepEqual(pages.map((p) => p.indices.length), [262, 266, 201]);
const matrix = pages.flatMap((p) => p.indices);
assert.equal(matrix.length, 729);
const gpTokens = source.translit;
const greed = [...gpTokens].sort((a, b) => b.length - a.length);

/** @param {number} row @param {number} col @returns {number} */
function cell(row, col) {
  assert.ok(row >= 1 && row <= 27 && col >= 1 && col <= 27);
  return matrix[27 * (row - 1) + col - 1];
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(n >= 1);
  let count = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      count -= count / p;
    }
  }
  if (n > 1) count -= count / n;
  return count;
}

/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  assert.ok(n >= 1);
  let sign = 1;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    n /= p;
    sign = -sign;
    if (n % p === 0) return 0;
    while (n % p === 0) n /= p;
  }
  return n > 1 ? -sign : sign;
}

/** @param {number} row @param {number} col @returns {number} */
function n0(row, col) { return 27 * (row - 1) + col; }
/** @param {number} row @param {number} col @returns {number} */
function n1(row, col) { return 27 * (col - 1) + 28 - row; }
/** @param {number} row @param {number} col @returns {number} */
function n2(row, col) { return 730 - n0(row, col); }
/** @param {number} row @param {number} col @returns {number} */
function n3(row, col) { return 27 * (27 - col) + row; }

/** @param {number} a @param {number} b @returns {boolean} */
function squarefreeGcd(a, b) { return mu(gcd(a, b)) !== 0; }

/** @param {string} latin @returns {string|null} */
function encodeWord(latin) {
  const text = latin.toUpperCase()
    .replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const digits = [];
  for (let i = 0; i < text.length;) {
    const token = greed.find((s) => text.startsWith(s, i));
    if (!token) return null;
    digits.push(gpTokens.indexOf(token));
    i += token.length;
  }
  return digits.join(',');
}

// Freeze ordinary corpus words with at least 20 independent source attestations.
const vocabulary = new Map();
for (const line of dictionarySource.split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const freq = Number(match[2]);
  if (freq < 20) continue;
  const encoding = encodeWord(match[1]);
  if (!encoding) continue;
  const current = vocabulary.get(encoding);
  if (!current || current.freq < freq) vocabulary.set(encoding, {word: match[1], freq});
}

// Frozen 38->39 forecast, as published BEFORE this test: signature (0,+1,0),
// key phase 1; key node horizontal, nonmirror, even radius, even/even center;
// ciphertext diagonal and leftmost=BEGINNING; endpoint row odd, leftmost row
// odd/column even; exact d8=0 from previous block's L=(8,17).
// Four squarefree GCD tests are copied exactly from public Report 10.
// Both of the method's explicitly allowed center modes are permitted.
const nodes = [];
for (let row = 2; row <= 26; row += 2) {
  for (let col = 2; col <= 26; col += 2) {
    for (let radius = 2; radius <= 12; radius += 2) {
      if (col - radius < 1 || col + radius > 27) continue;
      const originalNode = [cell(row, col - radius), cell(row, col), cell(row, col + radius)];
      if (originalNode.includes(0) || originalNode[0] === originalNode[2]) continue;
      for (const transform of [false, true]) {
        const derived = transform
          ? [originalNode[0], phi(originalNode[1]), originalNode[2]]
          : originalNode;
        if (derived.map((x) => mu(phi(x))).join(',') !== '0,1,0') continue;
        const key = [derived[1], derived[2], derived[0]]; // phase=1
        nodes.push({row, col, radius, transform, originalNode, key});
      }
    }
  }
}

let completePlacements = 0;
let placementsLengthAtLeast5 = 0;
const matches = [];
for (const node of nodes) {
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      for (let ray = 1; ray <= 26; ray += 2) {
        const row = 8 + dr * ray;
        const col = 17 + dc * ray;
        if (row < 1 || row > 27 || col < 1 || col > 27) continue;
        if (row % 2 !== 1 || col % 2 !== 0) continue;
        for (const stepRow of [-1, 1]) {
          for (let length = 3; length <= 27; length += 2) {
            const endRow = row + stepRow * (length - 1);
            const endCol = col + length - 1;
            if (endRow < 1 || endRow > 27 || endCol > 27) break;
            // B=L because the next block starts at its westernmost cell.
            if (!squarefreeGcd(n0(node.row, node.col), n0(row, col))) continue;
            if (!squarefreeGcd(n1(node.row, node.col), n3(endRow, endCol))) continue;
            if (!squarefreeGcd(n0(node.row, node.col), n2(endRow, endCol))) continue;
            completePlacements++;
            if (length >= 5) placementsLengthAtLeast5++;
            const ciphertext = Array.from(
              {length}, (_, i) => cell(row + stepRow * i, col + i)
            );
            const plaintext = ciphertext.map(
              (c, i) => (c - node.key[i % 3] + 29) % 29
            );
            const word = vocabulary.get(plaintext.join(','));
            if (!word) continue;
            assert.ok(plaintext.every((p, i) =>
              (p + node.key[i % 3]) % 29 === ciphertext[i]
            ));
            matches.push({
              ...word, row, col, endRow, endCol, stepRow,
              length, sourceRow: node.row, sourceCol: node.col,
              radius: node.radius, transform: node.transform,
              originalNode: node.originalNode, key: node.key,
              ciphertext, plaintext
            });
          }
        }
      }
    }
  }
}

assert.equal(nodes.length, 86);
assert.equal(vocabulary.size, 4988);
assert.equal(completePlacements, 13790);
assert.equal(placementsLengthAtLeast5, 10636);
assert.equal(matches.length, 25);
const sameCells = matches.filter((m) =>
  m.row === 5 && m.col === 20 && m.stepRow === -1 && m.length === 3
);
const words = new Set(sameCells.map((m) => m.word));
assert.ok(words.has('how') && words.has('aim'));
const longer = matches.filter((m) => m.length >= 5);
assert.equal(longer.length, 1);
assert.equal(longer[0].word, 'making');
assert.deepEqual(longer[0].key, [2, 19, 21]);
assert.deepEqual(longer[0].ciphertext, [21, 14, 26, 12, 11]);
assert.deepEqual(longer[0].plaintext, [19, 24, 5, 10, 21]);
for (const word of ['how', 'aim']) {
  const entry = sameCells.find((m) => m.word === word);
  assert.deepEqual(entry.ciphertext, [26, 27, 17]);
  assert.deepEqual(entry.plaintext, word === 'how' ? [8, 3, 7] : [24, 10, 19]);
  assert.deepEqual(entry.key, word === 'how' ? [18, 24, 10] : [2, 17, 27]);
}

console.log('PASS: original 729 cipher cells; 86 eligible original source-node/mode choices');
console.log('PASS: 13,790 forecast-compatible source/path placements, 10,636 length>=5');
console.log('PASS: 25 source-native frequency>=20 English word hits across 4,988 GP spellings');
console.log('PASS: same original Y-IA-B segment decodes both HOW and AIM under distinct source nodes');
console.log('PASS: unique >=5-rune dictionary output is conditional MACING (MAKING), 5 runes');
console.log('No uniquely selected stage39 key, no original author-authenticated plaintext, no full inverse.');
