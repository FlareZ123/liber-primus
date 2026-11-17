'use strict';

/**
 * Source-frozen LP2 308-rune final chapter vs clear PARABLE95 and its 23 dots.
 * Exact complete cyclic Vigenere-offset gate plus 6 historically motivated
 * unshifted/23-shifted direct operations.
 * All sources are committed, original inputs; Node.js 22 / CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const load = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const source = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const page = (id) => source.pages.find((entry) => entry.page === id).indices;
const cipher = page(54).concat(page(55));
const key = page(57);
const label = (part) => part.map((x) =>
  x < 29 ? source.translit[x] : '[' + x + ']').join('');
const ioc = (part) => {
  const hist = Array(29).fill(0);
  for (const x of part) if (x < 29) hist[x]++;
  return hist.reduce((sum, f) => sum + f * (f - 1), 0) /
    (part.length * (part.length - 1));
};
const decode = (part, offset, method) => part.map((c, i) => {
  const k = key[(i + offset) % key.length];
  return method === 'minus' ? (c - k + 29) % 29 :
    method === 'plus' ? (c + k) % 29 : c ^ k;
});
const encode = (part, offset, method) => part.map((p, i) => {
  const k = key[(i + offset) % key.length];
  return method === 'minus' ? (p + k) % 29 :
    method === 'plus' ? (p - k + 29) % 29 : p ^ k;
});

assert.equal(page(54).length, 232);
assert.equal(page(55).length, 76);
assert.equal(key.length, 95);
assert.equal(cipher.length, 3 * key.length + 23);
assert.deepEqual(cipher.slice(0, 9), [24, 19, 21, 23, 27, 2, 14, 10, 19]);
assert.equal(label(key.slice(0, 7)), 'PARABLE');
assert.equal(source.translit[key[23]], 'E');
assert.ok(Math.abs(ioc(key) - 0.06270996640537514) < 1e-12);

// The primary family grants every one of 95 possible source-key phases
// independently for each GP29 sign, without fitting or choosing one phase.
let allOffsets = 0;
let ceiling = {ioc: 0, offset: -1, method: ''};
let floor = {ioc: 1, offset: -1, method: ''};
let firstEnglishSingleton = 0;
const plant = Array.from({length: cipher.length}, (_, i) => key[i % key.length]);
for (let offset = 0; offset < key.length; offset++) {
  for (const method of ['minus', 'plus']) {
    const decoded = decode(cipher, offset, method);
    const score = ioc(decoded);
    if (score > ceiling.ioc) ceiling = {ioc: score, offset, method};
    if (score < floor.ioc) floor = {ioc: score, offset, method};
    if (decoded[0] === source.translit.indexOf('A') ||
        decoded[0] === source.translit.indexOf('I')) firstEnglishSingleton++;
    assert.deepEqual(encode(decoded, offset, method), cipher);
    assert.deepEqual(decode(encode(plant, offset, method), offset, method), plant);
    allOffsets++;
  }
}
assert.equal(allOffsets, 190);

// The five-bit historical XOR transport must yield a legal 29-rune value
// at EVERY destination position. Grant all 95 possible key registrations.
const xorInvalid = [];
for (let offset = 0; offset < key.length; offset++) {
  const output = decode(cipher, offset, 'xor');
  xorInvalid.push({offset, invalid: output.filter((x) => x > 28).length});
  assert.deepEqual(encode(output, offset, 'xor'), cipher);
  assert.deepEqual(decode(encode(plant, offset, 'xor'), offset, 'xor'), plant);
}
const leastXorInvalid = xorInvalid.reduce((best, x) => x.invalid < best.invalid ? x : best);
const mostXorInvalid = xorInvalid.reduce((best, x) => x.invalid > best.invalid ? x : best);
assert.deepEqual(leastXorInvalid, {offset: 44, invalid: 14});
assert.deepEqual(mostXorInvalid, {offset: 8, invalid: 37});
assert.equal(xorInvalid.filter((x) => x.invalid === 0).length, 0);
assert.equal(firstEnglishSingleton, 11);
assert.deepEqual({offset: ceiling.offset, method: ceiling.method},
  {offset: 77, method: 'plus'});
assert.ok(Math.abs(ceiling.ioc - 0.03695164770083337) < 1e-12);
assert.deepEqual({offset: floor.offset, method: floor.method},
  {offset: 7, method: 'plus'});
assert.ok(Math.abs(floor.ioc - 0.032763653284825923) < 1e-12);

// Source-native controls: identical canonical GP29 tokenization as
// sims/lp2_cipher_feedback_entropy_sft.cjs, all contiguous 308-rune windows.
const tokens = source.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function native(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((item) => word.startsWith(item.s, i));
      assert.ok(token, 'unmapped GP29 source token');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
function lowestWindowIoC(data, width) {
  const freq = Array(29).fill(0);
  for (let i = 0; i < width; i++) freq[data[i]]++;
  let same = freq.reduce((sum, f) => sum + f * (f - 1), 0);
  let lowest = Infinity;
  let at = -1;
  let beneath = 0;
  for (let start = 0; start + width <= data.length; start++) {
    const value = same / (width * (width - 1));
    if (value < lowest) { lowest = value; at = start; }
    if (value <= ceiling.ioc) beneath++;
    if (start + width < data.length) {
      const leaving = data[start], entering = data[start + width];
      same -= 2 * (freq[leaving] - 1);
      freq[leaving]--;
      same += 2 * freq[entering];
      freq[entering]++;
    }
  }
  return {lowest, at, windows: data.length - width + 1, beneath};
}
const controls = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt',
    62807, 0.05254029358263886],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt',
    218493, 0.05015017555734168],
  ['Emerson', 'resources/control/emerson_essays_2944.txt',
    324323, 0.049917509200896826]
].map(([name, filename, expectedWindows, expectedMin]) => {
  const result = lowestWindowIoC(native(load(filename)), cipher.length);
  assert.equal(result.windows, expectedWindows);
  assert.ok(Math.abs(result.lowest - expectedMin) < 1e-12);
  assert.equal(result.beneath, 0);
  return {name, ...result};
});

// Two source-registered starts, including 23 as a hypothetical dot offset;
// original source does not authenticate a 23-offset key or a 5-bit XOR codec.
const anchors = [
  [0, 'minus', 'J', 'ABEAIJAEMN', 0, 0.03566140699691188],
  [0, 'plus', 'H', 'XAEESOEOUF', 0, 0.03454037818858666],
  [0, 'xor', 'NG', 'JBSIOEEA[30]AE', 26, 0.028300689538474554],
  [23, 'minus', 'G', 'EAFWAFAEAE', 0, 0.03426540885824273],
  [23, 'plus', 'P', 'IPIUROAEL', 0, 0.03426540885824273],
  [23, 'xor', 'I', 'WFWAFEACE', 25, 0.02802572020813063]
];
for (const [offset, method, first, next, invalid, expectedIoC] of anchors) {
  const decoded = decode(cipher, offset, method);
  assert.equal(label(decoded.slice(0, 1)), first);
  assert.equal(label(decoded.slice(1, 9)), next);
  assert.equal(decoded.filter((x) => x > 28).length, invalid);
  assert.ok(Math.abs(ioc(decoded) - expectedIoC) < 1e-12);
  assert.deepEqual(encode(decoded, offset, method), cipher);
  assert.deepEqual(decode(encode(plant, offset, method), offset, method), plant);
}
console.log(JSON.stringify({
  original: {terminalRunes: cipher.length, clearKeyRunes: key.length, terminalDots: 23},
  all95CyclicAdditiveOffsets: {tested: allOffsets, ceiling, floor, firstEnglishSingleton},
  all95CyclicFiveBitXorOffsets: {tested: xorInvalid.length, leastXorInvalid, mostXorInvalid, legal: 0},
  independentNativeControlWindows: controls,
  sourceFixedPlusXorAnchors: anchors.map((a) => ({offset: a[0], method: a[1], invalid: a[4]})),
  exactReencryption: true,
  plantedNativeRuneRecovery: true
}, null, 2));
console.log('PASS: original 308 GP runes, 285 cyclic phases and 605623 source-native windows');
