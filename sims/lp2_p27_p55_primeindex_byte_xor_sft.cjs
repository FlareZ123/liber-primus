'use strict';

/**
 * Original-input p27/p55 three-tape transfer with two canonical GP-prime-index
 * byte codebooks from the manuscript's original 256-cell numerical table.
 *
 * Run: node sims/lp2_p27_p55_primeindex_byte_xor_sft.cjs
 * Reads checked-in source JSON only; does not write or mutate files.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @param {string} rel */
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

/** @param {number[]} bytes */
function hex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

/** @param {number[]} a @param {number[]} b @param {number[]} c */
function xor3(a, b, c) {
  assert.equal(a.length, b.length);
  assert.equal(a.length, c.length);
  return a.map((x, i) => x ^ b[i] ^ c[i]);
}

/** @param {number[]} items @param {() => number} random */
function shuffled(items, random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** @param {number} init */
function xorshift32(init) {
  let state = init >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const history = readJson('resources/cicada2014-outguess-hex.json');
const page27 = corpus.pages.find(p => p.page === 27).indices;
const page55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.prime.length, 29);
assert.equal(page27.length, 234);
assert.equal(page55.length, 76);

// Historic 2014 three-share positive: exact source hex to binary, XOR to PGP.
assert.equal(history.sources.length, 3);
const historic = history.sources.map(s => Array.from(Buffer.from(s.hex, 'hex')));
assert(historic.every(s => s.length === 991));
const historicText = Buffer.from(xor3(...historic)).toString('utf8');
assert(historicText.startsWith('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n'));
console.log('2014 historical byte-XOR PGP positive control: 991 bytes, signed header matched');

// Physical p55 terminal six GP runes appear once as a complete word p27[28..34).
const marker = page55.slice(-6);
const positions = [];
for (let i = 0; i + marker.length <= page27.length; i++) {
  if (marker.every((v, j) => page27[i + j] === v)) positions.push(i);
}
assert.deepEqual(positions, [28]);
const remaining = [...page27.slice(34), ...page27.slice(0, 28)];
assert.equal(remaining.length, 228);
const stripes = [
  remaining.slice(0, 76),
  remaining.slice(76, 152),
  remaining.slice(152, 228)
];
const interleaved = [0, 1, 2].map(j => remaining.filter((_, i) => i % 3 === j));
assert(stripes.concat(interleaved).every(t => t.length === 76));

// The GP prime-value index is an independent manuscript-native proposal for
// rune-to-byte transport, NOT an authored instruction. Test both familiar
// zero-based and human one-based offsets; never optimize these after readout.
const expectations = {
  '0/stripes': [29, 0, 19, '23edccf91680a2600af92d42'],
  '0/interleaved': [29, 0, 13, '0b41fd0a1a632666eb3720a7'],
  '1/stripes': [29, 1, 21, 'bb61c17be8a9f827306b4e96'],
  '1/interleaved': [29, 1, 15, 'a82e91e487af2fe640c8fee7']
};
for (const base of [0, 1]) {
  const alphabet = corpus.prime.map(p => grid.bytes[p - base]);
  const inverse = new Map(alphabet.map((v, i) => [v, i]));
  assert.equal(inverse.size, 29, 'codebook must be injective for lossless inversion');
  for (const [mode, tapes] of [['stripes', stripes], ['interleaved', interleaved]]) {
    const byteTapes = tapes.map(tape => tape.map(r => alphabet[r]));
    const out = xor3(...byteTapes);
    const matches = out.filter((b, i) => b === alphabet[page55[i]]).length;
    const representable = out.filter(b => inverse.has(b)).length;
    const readout = [inverse.size, matches, representable, hex(out.slice(0, 12))];
    assert.deepEqual(readout, expectations[base + '/' + mode]);
    assert(!Buffer.from(out).toString('utf8').startsWith('-----BEGIN PGP'));
    console.log(JSON.stringify({
      primeIndexBase: base,
      sourceLayout: mode,
      originalByteLength: out.length,
      uniqueRuneCodebookEntries: inverse.size,
      exactP55Matches: matches,
      xorBytesRepresentableAsGPRunes: representable,
      first12BytesHex: readout[3]
    }));
  }
}

// Fixed-source Monte Carlo: preserve all three 76-position stripe symbol
// multisets, independently permute second and third tapes; no alphabet tuning.
// The empirical rate asks whether original source alignment is unusually rich
// in 29-codebook XOR outputs. It is not a decipherment likelihood.
const alphabet = corpus.prime.map(p => grid.bytes[p]);
const inv = new Set(alphabet);
const tapes = stripes.map(t => t.map(r => alphabet[r]));
const observed = xor3(...tapes).filter(v => inv.has(v)).length;
assert.equal(observed, 19);
const random = xorshift32(0x184341aa);
const replicates = 10000;
let equalOrHigher = 0;
let sum = 0;
for (let i = 0; i < replicates; i++) {
  const output = xor3(tapes[0], shuffled(tapes[1], random), shuffled(tapes[2], random));
  const count = output.filter(v => inv.has(v)).length;
  sum += count;
  if (count >= observed) equalOrHigher++;
}
console.log(JSON.stringify({
  source: 'original marker-aligned p27 stripes + GP-prime-indexed terminal bytes',
  observedRepresentable: observed,
  nullMean: sum / replicates,
  replications: replicates,
  addOneTail: (equalOrHigher + 1) / (replicates + 1),
  verdict: 'No verified unknown p55 plaintext, exact 2014-type share recovery, or independently authored rune-byte transport'
}));
