'use strict';
/**
 * Source-only p3–p8 255-word direct book-code test. The 2016 signed hint says
 * "Its words are the map ... their numbers are the direction", and the
 * original p3–p7 contain exactly 255 complete words, followed by exactly 255
 * GP29 symbols on p8. This checks whether a p8 GP0/prime digit can directly
 * select one character in its paired source word.
 *
 * The modulo-wrapped alternative is explicitly a new, unlicensed rule:
 * wrapping a mostly invalid address does not authenticate a solution.
 *
 * Read-only single-file test (Windows 11, Node.js 22):
 *   node sims/lp2_scroll255_direct_word_char_number_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const text = read('lp2-transcription.txt').split('%');
const rune = new Map(corpus.runes.map((value, index) => [value, index]));
const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const character of text[page]) {
    if (rune.has(character)) pending.push(rune.get(character));
    else if ((character === '-' || character === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
const page8 = corpus.pages.find(page => page.page === 8).indices;
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.equal(page8.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(page => page.indices));
assert(words.every(word => word.length >= 1 && word.length <= 12));

/** @param {number} value @param {number} modulus @returns {number} */
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Uint16Array(29);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * @param {number[]} digits
 * @param {0|1} base
 * @returns {{directValid:number,directInvalid:number,moduloIoC:number,preview:string,sha256:string}}
 */
function readWordCharacters(digits, base) {
  assert.equal(digits.length, words.length);
  const direct = [];
  const wrapped = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const offset = digits[i] - base;
    direct.push(offset >= 0 && offset < word.length ? word[offset] : null);
    wrapped.push(word[mod(offset, word.length)]);
  }
  const digest = crypto.createHash('sha256')
    .update(Buffer.from(wrapped)).digest('hex');
  return {
    directValid: direct.filter(value => value !== null).length,
    directInvalid: direct.filter(value => value === null).length,
    moduloIoC: ioc(wrapped),
    preview: wrapped.slice(0, 80).map(value => corpus.translit[value]).join(''),
    sha256: digest
  };
}
const selectors = {
  GP0: page8,
  GPprime: page8.map(value => corpus.prime[value])
};
const test = [];
for (const [name, digits] of Object.entries(selectors)) {
  for (const base of [0, 1]) {
    const data = readWordCharacters(digits, base);
    test.push({selector: name, indexBase: base, ...data});
    // Construct a source-shaped address that actually DOES point to one
    // letter in every word and verify the complete 255-position readback.
    const syntheticAddress = words.map(word =>
      Math.min(2, word.length - 1) + base);
    const expected = words.map(word => word[Math.min(2, word.length - 1)]);
    const recovered = words.map((word, i) => word[syntheticAddress[i] - base]);
    assert.deepEqual(recovered, expected);
    assert.equal(recovered.length, 255);
  }
}
assert.deepEqual(test.map(row => row.directInvalid), [212, 212, 238, 234]);
const expectedIoC = [
  0.03538675312644743,
  0.033719314497452524,
  0.034892697236374864,
  0.035942566002779064
];
for (let i = 0; i < test.length; i++) {
  assert(Math.abs(test[i].moduloIoC - expectedIoC[i]) < 1e-13);
}
console.log(JSON.stringify({
  status: 'PASS',
  original: {
    sourcePhysicalPages: [3, 4, 5, 6, 7],
    sourceWordCount: words.length,
    sourceRuneCount: 1145,
    destinationPhysicalPage: 8,
    destinationRuneCount: page8.length
  },
  candidate: 'one printed p8 number indexes one rune of paired p3–p7 word',
  results: test,
  exactPositive: '4/4 source-shaped 255-character in-range synthetic readbacks',
  conclusion:
    'All direct GP0/GP-prime zero/one-based address models fail to index ' +
    'most original words. The four invented modulo wraps produce uniform-' +
    'like nonlinguistic output. Neither a plaintext nor a source-authored ' +
    'word-character indexing/modulo instruction has been recovered.'
}, null, 2));
