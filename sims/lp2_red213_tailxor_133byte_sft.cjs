'use strict';

/**
 * Reproduce the source-selected 213-rune red/tail XOR-to-five-bit test.
 * All input page and annotation data are repository fixtures, unmodified.
 * Run with Node.js 22: node sims/lp2_red213_tailxor_133byte_sft.cjs
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');

function fixture(name) {
  return JSON.parse(readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
}

/** @param {readonly number[]} symbols @returns {{bytes: Buffer, spareBit: number, bits: string}} */
function packFiveBits(symbols) {
  assert.equal(symbols.length, 213);
  const bits = symbols.map((v) => {
    assert(Number.isInteger(v) && v >= 0 && v < 32);
    return v.toString(2).padStart(5, '0');
  }).join('');
  assert.equal(bits.length, 1065);
  const bytes = Buffer.from(Array.from({ length: 133 }, (_, i) => Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2)));
  return { bytes, spareBit: Number(bits.at(-1)), bits };
}

/** @param {Buffer} bytes @param {number} spareBit @returns {number[]} */
function unpackFiveBits(bytes, spareBit) {
  assert.equal(bytes.length, 133);
  assert(spareBit === 0 || spareBit === 1);
  const bits = Array.from(bytes, (n) => n.toString(2).padStart(8, '0')).join('') + spareBit;
  return Array.from({ length: 213 }, (_, i) => Number.parseInt(bits.slice(i * 5, i * 5 + 5), 2));
}

const corpus = fixture('lp2-corpus.json');
const ink = fixture('lp2-ink-annotations.json');
const pages = new Map(corpus.pages.map((p) => [p.page, p.indices]));
assert.equal(corpus.pages.length, 58);
const marked = ink.pages.filter((p) => p.page < 56);
const spans = marked.flatMap((p) => (p.red_spans || []).map((s) => ({ page: p.page, start: s.start, length: s.length })));
assert.equal(spans.length, 16);
const red = spans.flatMap((s) => pages.get(s.page).slice(s.start, s.start + s.length));
const tail3 = pages.get(3).slice(122);
const tail39 = pages.get(39).slice(122);
assert.equal(tail3.length, 95);
assert.equal(tail39.length, 118);
const key = tail3.concat(tail39);
assert.equal(red.length, 213);
assert.equal(key.length, 213);

const out = red.map((v, i) => v ^ key[i]);
const outsideGP29 = out.map((v, i) => v > 28 ? i : -1).filter((i) => i >= 0);
assert.equal(outsideGP29.length, 23);
const { bytes, spareBit } = packFiveBits(out);
assert.equal(spareBit, 0);
assert.equal(bytes.length, 133);
assert.equal(bytes.subarray(0, 20).toString('hex'), '1ffda9580c9caa6fd944c5c2a2b7df3c587ce70c');
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'ecf68af45150482467e2f2942d924251e6972b78144f3253a292f264013a3b38');
assert.deepEqual(unpackFiveBits(bytes, spareBit), out);
const printable = Array.from(bytes).filter((v) => v === 10 || v === 13 || (v >= 32 && v <= 126)).length;
assert.equal(printable, 47);

// Independently canonical numeric interpretation: authentic GP prime numbers
// are native numbers (2..109), so their exact XOR can be read as 7-bit ASCII.
// Freeze the same red/tail alignment; no bit packing or secret mapping is used.
const primeXor = red.map((v, i) => corpus.prime[v] ^ corpus.prime[key[i]]);
const primeXorBytes = Buffer.from(primeXor);
const primeXorPrintable = primeXor.filter((v) => v >= 32 && v <= 126).length;
const primeXorLetters = primeXor.filter((v) => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length;
assert.equal(primeXorBytes.length, 213);
assert.equal(Math.max(...primeXor), 126);
assert.equal(primeXorPrintable, 155);
assert.equal(primeXorLetters, 87);
assert.equal(primeXorBytes.subarray(0, 20).toString('hex'), '1c4e6a62584a002b587050086a4c263e2c4a06');

// Positive source-shaped plant: all 213 synthetic carrier glyphs are valid GP29
// values, while the same fixed original 213-rune key is retained unchanged.
const plantedRed = key.map((_, i) => (7 * i + 3) % 29);
const plantedFiveBit = plantedRed.map((v, i) => v ^ key[i]);
const plantedPack = packFiveBits(plantedFiveBit);
const recoveredPlant = unpackFiveBits(plantedPack.bytes, plantedPack.spareBit).map((v, i) => v ^ key[i]);
assert.deepEqual(recoveredPlant, plantedRed);
assert.deepEqual(key.map((v, i) => v ^ out[i]), red);

console.log(JSON.stringify({
  originalRedRunes: red.length,
  originalKeyRunes: key.length,
  originalRedSpans: spans.length,
  originalTailLengths: [95, 118],
  originalOutOfGP29: outsideGP29.length,
  originalOutOfGP29Positions: outsideGP29,
  packedBytes: bytes.length,
  spareBit,
  packedSha256: createHash('sha256').update(bytes).digest('hex'),
  printableBytes: printable,
  primeXorByteLength: primeXorBytes.length,
  primeXorPrintable,
  primeXorLetters,
  primeXorFirstTwentyHex: primeXorBytes.subarray(0, 20).toString('hex'),
  firstTwentyHex: bytes.subarray(0, 20).toString('hex'),
  sourceShapedPlantReconstructed: plantedRed.length
}, null, 2));
console.log('ALL ASSERTIONS PASS');
