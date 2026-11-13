'use strict';

/**
 * Test whether the exact 256 printed LP2 table bytes encode a four-sibling
 * SHA-512 Merkle inclusion proof for one of the 16 original bordered pages.
 *
 * Source geometry: physical p40..55 is a 16-image border sequence; 2^4=16.
 * The pp49..51 table is 32x8=256 bytes, four 64-byte SHA-512 siblings.
 * The solved physical p56 prints a 64-byte target digest.
 *
 * No secret or adaptive phase is fitted to the ciphertext or target.
 * Run: node sims/lp2_p50_merkle16_sha512_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const source = (file) => fs.readFileSync(path.join(ROOT, file));
/** @param {string} file */
const json = (file) => JSON.parse(source(file).toString('utf8'));
/** @param {Buffer} input */
const sha512 = (input) => crypto.createHash('sha512').update(input).digest();
/** @param {Buffer} input */
const sha256Hex = (input) => crypto.createHash('sha256').update(input).digest('hex');

const grid = json('resources/liber-primus/base60-grid.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const witness = json('resources/cicada2014-anend-binary-witness.json');
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
for (const row of rows) assert.equal(row.length, 8);
const gridBytes = Buffer.from(rows.flat());
assert.equal(gridBytes.length, 256);
assert.equal(sha256Hex(gridBytes),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const target = Buffer.from(witness.target_hex, 'hex');
assert.equal(target.length, 64);
assert.equal(target.toString('hex').slice(0, 16), '36367763ab73783c');

/** @type {{name:string, siblings:Buffer[]}[]} */
const groupings = [
  {
    name: 'four consecutive 8x8 row tiles',
    siblings: Array.from({ length: 4 }, (_, n) => gridBytes.subarray(n * 64, n * 64 + 64)),
  },
  {
    name: 'four consecutive 32x2 column strips',
    siblings: Array.from({ length: 4 }, (_, pair) => Buffer.from(
      rows.flatMap((row) => [row[pair * 2], row[pair * 2 + 1]]))),
  },
];
for (const group of groupings) {
  assert.equal(group.siblings.length, 4);
  assert.equal(group.siblings.reduce((n, b) => n + b.length, 0), 256);
}

/**
 * Compute a four-level 16-leaf SHA-512 Merkle proof root.
 * @param {Buffer} leaf
 * @param {Buffer[]} siblings
 * @param {number} leafIndex
 * @param {boolean} reversed
 * @returns {Buffer}
 */
function merkleRoot(leaf, siblings, leafIndex, reversed) {
  let current = sha512(leaf);
  for (let level = 0; level < 4; level++) {
    const sibling = siblings[reversed ? 3 - level : level];
    const pair = (leafIndex >>> level) & 1
      ? Buffer.concat([sibling, current])
      : Buffer.concat([current, sibling]);
    current = sha512(pair);
  }
  return current;
}

/** @param {number} page @returns {{name:string,bytes:Buffer}[]} */
function pageRegisters(page) {
  const original = corpus.pages.find((p) => p.page === page);
  assert.ok(original);
  const indices = original.indices;
  const runes = indices.map((i) => corpus.runes[i]).join('');
  const translit = indices.map((i) => corpus.translit[i]).join('');
  return [
    { name: 'source JPEG bytes', bytes: source('resources/liber-primus/' + (page + 17) + '.jpg') },
    { name: 'canonical GP indices', bytes: Buffer.from(indices) },
    { name: 'unseparated UTF8 rune transcript', bytes: Buffer.from(runes, 'utf8') },
    { name: 'unseparated ASCII GP transliteration', bytes: Buffer.from(translit, 'ascii') },
  ];
}

// Test vector: a planted inclusion proof verifies exactly and rejects tampering.
const plantedLeaf = Buffer.from('liber primus source-selected Merkle plant', 'utf8');
const controlSiblings = groupings[0].siblings;
const root11 = merkleRoot(plantedLeaf, controlSiblings, 11, false);
assert.ok(merkleRoot(plantedLeaf, controlSiblings, 11, false).equals(root11));
assert.ok(!merkleRoot(Buffer.from('altered leaf'), controlSiblings, 11, false).equals(root11));
assert.ok(!merkleRoot(plantedLeaf, controlSiblings, 10, false).equals(root11));
assert.ok(!merkleRoot(plantedLeaf, controlSiblings, 11, true).equals(root11));

let trials = 0;
const matches = [];
let longestPrefix = { bytes: -1, page: -1, register: '', grouping: '', order: '' };
for (let page = 40; page <= 55; page++) {
  const index = page - 40;
  for (const register of pageRegisters(page)) {
    for (const grouping of groupings) {
      for (const reversed of [false, true]) {
        const root = merkleRoot(register.bytes, grouping.siblings, index, reversed);
        trials++;
        if (root.equals(target)) {
          matches.push({ page, register: register.name, grouping: grouping.name, reversed });
        }
        let sharedBytes = 0;
        while (sharedBytes < 64 && root[sharedBytes] === target[sharedBytes]) sharedBytes++;
        if (sharedBytes > longestPrefix.bytes) {
          longestPrefix = {
            bytes: sharedBytes,
            page, register: register.name,
            grouping: grouping.name,
            order: reversed ? 'root-to-leaf' : 'leaf-to-root',
          };
        }
      }
    }
  }
}
assert.equal(trials, 256);
assert.deepEqual(matches, [],
  'A genuine full SHA-512 root match requires immediate independent investigation.');

// Independent complete 16-leaf tree: each physical printed image/symbol
// is hashed as one original leaf, rather than using table-proposed siblings.
// Check the actual full root and every original sibling against p50's four
// physical 64-byte groups. These are exact digest equalities, without scores.
const sourcePages = Array.from({ length: 16 }, (_, i) => pageRegisters(40 + i));
let fullTreeRootsMatching = 0;
let exactGridSiblingMatches = 0;
const fullTreeRoots = {};
for (let kind = 0; kind < 4; kind++) {
  const label = sourcePages[0][kind].name;
  const levels = [sourcePages.map((page) => sha512(page[kind].bytes))];
  while (levels.at(-1).length > 1) {
    const previous = levels.at(-1);
    const next = [];
    for (let i = 0; i < previous.length; i += 2)
      next.push(sha512(Buffer.concat([previous[i], previous[i + 1]])));
    levels.push(next);
  }
  assert.deepEqual(levels.map((xs) => xs.length), [16, 8, 4, 2, 1]);
  const root = levels[4][0];
  fullTreeRoots[label] = root.toString('hex');
  if (root.equals(target)) fullTreeRootsMatching++;
  for (let leaf = 0; leaf < 16; leaf++) {
    for (const group of groupings) {
      for (const reversed of [false, true]) {
        for (let level = 0; level < 4; level++) {
          const authenticSibling = levels[level][(leaf >>> level) ^ 1];
          const printedSibling = group.siblings[reversed ? 3 - level : level];
          if (authenticSibling.equals(printedSibling)) exactGridSiblingMatches++;
        }
      }
    }
  }
}
assert.equal(fullTreeRootsMatching, 0,
  'Original-source complete Merkle root matches p56 target: investigate');
assert.equal(exactGridSiblingMatches, 0,
  'One printed table 64-byte group is a true source-page Merkle sibling: investigate');
console.log(JSON.stringify({
  sourceGridSHA256: sha256Hex(gridBytes),
  sha512Target: target.toString('hex'),
  sourcePages: 'physical LP2 p40..p55, original archive 57.jpg..72.jpg',
  trials,
  grouped64ByteSiblings: groupings.map((g) => g.name),
  registerKinds: pageRegisters(55).map((x) => x.name),
  matchedRoots: matches,
  strongestPrefix: longestPrefix,
  fullTreeRoots,
  fullTreeRootsMatching,
  exactGridSiblingMatches,
}, null, 2));
console.log('PASS: 256 proof variants and four complete 16-leaf roots, no printed-SHA512 match or table-sibling equality; tamper controls pass.');
