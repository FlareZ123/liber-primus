'use strict';
/**
 * Source-frozen 2014 three-share XOR test on the 729-rune LP2 opening chapter.
 * Run: node sims/lp2_firstchapter_243_xor_sft.cjs
 * This tests only two natural layouts and two source-internal representations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const original = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const chapter = original.pages.filter((p) => p.page <= 2).flatMap((p) => p.indices);
const parable = original.pages.find((p) => p.page === 57).indices;
assert.equal(chapter.length, 729);
assert.equal(parable.length, 95);
assert.equal(original.prime.length, 29);

/** @param {number[]} tape @param {'contiguous'|'interleaved'} layout @returns {number[][]} */
function triples(tape, layout) {
  assert.equal(tape.length % 3, 0);
  const width = tape.length / 3;
  return Array.from({ length: width }, (_, i) => layout === 'contiguous'
    ? [tape[i], tape[i + width], tape[i + 2 * width]]
    : tape.slice(i * 3, i * 3 + 3));
}

/** @param {number[][]} shares @param {'rune'|'prime'} encoding @returns {number[]} */
function xorShares(shares, encoding) {
  return shares.map((three) => three.reduce((acc, rune) => acc ^ (encoding === 'prime' ? original.prime[rune] : rune), 0));
}

const results = [];
for (const layout of ['contiguous', 'interleaved']) {
  const shares = triples(chapter, layout);
  for (const encoding of ['rune', 'prime']) {
    const output = xorShares(shares, encoding);
    const withinGP = output.filter((byte) => byte < 29).length;
    const printable = output.filter((byte) => byte >= 32 && byte <= 126).length;
    results.push({ layout, encoding, validGP: withinGP, invalidGP: output.length - withinGP, printableASCII: printable, total: output.length });
    assert.equal(output.length, 243);
  }
}
assert.deepEqual(results.map((r) => [r.layout, r.encoding, r.validGP, r.printableASCII]), [
  ['contiguous', 'rune', 218, 0],
  ['contiguous', 'prime', 53, 174],
  ['interleaved', 'rune', 217, 0],
  ['interleaved', 'prime', 55, 177],
]);

/* Plant genuine LP2 p57 GP29 plaintext under three arbitrary nontrivial shares. */
const plantedTriples = parable.map((plain, i) => {
  const a = (i * 7 + 3) % 29;
  let b = (i * 11 + 5) % 29;
  while ((plain ^ a ^ b) >= 29) b = (b + 1) % 29;
  return [a, b, plain ^ a ^ b];
});
assert.deepEqual(xorShares(plantedTriples, 'rune'), parable);
assert.ok(plantedTriples.every((t) => t.every((v) => v >= 0 && v < 29)));

/* The source GP prime weights can form every seven-bit ASCII byte by XOR. */
const primeTriples = new Map();
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const byte = original.prime[a] ^ original.prime[b] ^ original.prime[c];
      if (!primeTriples.has(byte)) primeTriples.set(byte, [a, b, c]);
    }
  }
}
assert.equal(primeTriples.size, 128);
const plantedAscii = Array.from({ length: 243 }, (_, i) => 'THE DEEP WEB EXISTS A PAGE'[i % 26].charCodeAt(0));
assert.deepEqual(xorShares(plantedAscii.map((b) => primeTriples.get(b)), 'prime'), plantedAscii);
console.log(JSON.stringify({ results, gpPlant: parable.length, primeBytePlant: plantedAscii.length,
  interpretation: 'No intact GP29 plaintext or readable ASCII on unchanged opening chapter' }, null, 2));
