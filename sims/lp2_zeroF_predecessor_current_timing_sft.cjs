'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap((page) => page.tokens);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);

const sourceText = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runePattern = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = (sourceText.match(runePattern) || []).map((word) =>
  Array.from(word, (glyph) => glyphIndex.get(glyph)));

assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const pageAt = new Uint8Array(original.length);
let pageOffset = 0;
for (const page of pages) {
  pageAt.fill(page.page, pageOffset, pageOffset + page.indices.length);
  pageOffset += page.indices.length;
}

const special = [
  corpus.translit.indexOf('F'),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter((index) => index >= 0),
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

/** @param {number} value @param {number} left @param {number} right @returns {number} */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {number} control @returns {number} */
function marker(control) {
  if (tokens[control][0] === '0') return 0;
  return special[bytes[control] & 7];
}

/** @param {number} index @param {'predecessor'|'current'} timing @returns {number} */
function controlCell(index, timing) {
  return timing === 'predecessor' ? ((index - 1) & 255) : (index & 255);
}

/** @param {number[]} plain @param {'predecessor'|'current'} timing @returns {number[]} */
function encrypt(plain, timing) {
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i += 1) {
    cipher[i] = swap(plain[i], cipher[i - 1], marker(controlCell(i, timing)));
  }
  return cipher;
}

/** @param {number[]} cipher @param {'predecessor'|'current'} timing @returns {number[]} */
function decrypt(cipher, timing) {
  const plain = new Array(cipher.length);
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i += 1) {
    plain[i] = swap(cipher[i], cipher[i - 1], marker(controlCell(i, timing)));
  }
  return plain;
}

/** @param {number[]} stream @returns {{adjacent:number,leadingZeroAdjacent:number,lag5:number,leadingZeroShare:number}} */
function counts(stream) {
  let adjacent = 0;
  let leadingZeroAdjacent = 0;
  for (let i = 1; i < stream.length; i += 1) {
    if (pageAt[i] !== pageAt[i - 1] || stream[i] !== stream[i - 1]) continue;
    adjacent += 1;
    leadingZeroAdjacent += Number(tokens[(i - 1) & 255][0] === '0');
  }

  let wordOffset = 0;
  let lag5 = 0;
  for (const word of words) {
    for (let j = 5; j < word.length; j += 1) {
      lag5 += Number(stream[wordOffset + j] === stream[wordOffset + j - 5]);
    }
    wordOffset += word.length;
  }
  return {
    adjacent,
    leadingZeroAdjacent,
    lag5,
    leadingZeroShare: adjacent ? leadingZeroAdjacent / adjacent : 0,
  };
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {string} file @returns {Map<number, number[][]>} */
function nativePools(file) {
  const pools = new Map();
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}

const target = counts(original);
assert.equal(target.adjacent, 86);
assert.equal(target.leadingZeroAdjacent, 33);
assert.equal(target.lag5, 104);

const random = xorshift32(0x3301A518);
const trials = 48;
const registers = [];

for (const [name, file] of [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
]) {
  const pools = nativePools(file);
  const sampled = [];
  for (let trial = 0; trial < trials; trial += 1) {
    sampled.push(words.flatMap((word) => {
      const options = pools.get(word.length);
      assert.ok(options?.length);
      return options[Math.floor(random() * options.length)];
    }));
  }

  const plainCounts = sampled.map(counts);
  const timing = {};
  for (const mode of ['predecessor', 'current']) {
    const encoded = sampled.map((plain) => {
      const cipher = encrypt(plain, mode);
      assert.deepEqual(decrypt(cipher, mode), plain);
      return counts(cipher);
    });
    const mean = (arr, key) =>
      arr.reduce((sum, item) => sum + item[key], 0) / arr.length;
    timing[mode] = {
      adjacent: mean(encoded, 'adjacent'),
      lag5: mean(encoded, 'lag5'),
      leadingZeroShare: mean(encoded, 'leadingZeroShare'),
    };
  }
  const meanPlain = (key) =>
    plainCounts.reduce((sum, item) => sum + item[key], 0) / plainCounts.length;
  registers.push({
    name,
    plain: {
      adjacent: meanPlain('adjacent'),
      lag5: meanPlain('lag5'),
      leadingZeroShare: meanPlain('leadingZeroShare'),
    },
    timing,
  });
}

// Guard the previously committed predecessor-control sample exactly.
const predecessorExpected = {
  Shakespeare: { adjacent: 6707 / 48, lag5: 5661 / 48, share: 0.39679820342206146 },
  Gibran: { adjacent: 8093 / 48, lag5: 5644 / 48, share: 0.4130530305230735 },
  Emerson: { adjacent: 7898 / 48, lag5: 6221 / 48, share: 0.4167166415388099 },
};
for (const register of registers) {
  const expected = predecessorExpected[register.name];
  assert.ok(Math.abs(register.timing.predecessor.adjacent - expected.adjacent) < 1e-15);
  assert.ok(Math.abs(register.timing.predecessor.lag5 - expected.lag5) < 1e-15);
  assert.ok(Math.abs(register.timing.predecessor.leadingZeroShare - expected.share) < 1e-15);
}

const originalTiming = {};
for (const mode of ['predecessor', 'current']) {
  const decoded = decrypt(original, mode);
  assert.deepEqual(encrypt(decoded, mode), original);
  const structure = counts(decoded);
  originalTiming[mode] = {
    structure,
    changedPositions: decoded.reduce(
      (sum, value, index) => sum + Number(value !== original[index]), 0),
  };
}
assert.equal(originalTiming.predecessor.structure.adjacent, 478);
assert.equal(originalTiming.predecessor.structure.lag5, 99);
assert.equal(originalTiming.predecessor.changedPositions, 549);

/** @param {{adjacent:number,lag5:number,leadingZeroShare:number}} point @param {keyof typeof target} key @returns {number} */
function distance(point, key) {
  return Math.abs(point[key] - target[key]);
}

const comparisons = registers.map((register) => ({
  name: register.name,
  predecessorCloserThanCurrent: {
    adjacent:
      distance(register.timing.predecessor, 'adjacent') <
      distance(register.timing.current, 'adjacent'),
    lag5:
      distance(register.timing.predecessor, 'lag5') <
      distance(register.timing.current, 'lag5'),
    leadingZeroShare:
      Math.abs(register.timing.predecessor.leadingZeroShare - target.leadingZeroShare) <
      Math.abs(register.timing.current.leadingZeroShare - target.leadingZeroShare),
  },
}));

console.log(JSON.stringify({
  model: 'zeroF exact rule; only predecessor-cell vs current-cell control timing varies',
  target,
  registers,
  comparisons,
  originalTiming,
}, null, 2));
