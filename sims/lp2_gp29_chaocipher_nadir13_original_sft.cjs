'use strict';

/**
 * Bounded GP29 Chaocipher transfer test against the original LP2 corpus.
 * Run in Node.js from any working directory. No external dependencies.
 * The 26-letter canonical positive follows Moshe Rubin's Chaocipher example.
 *
 * Source fixture: resources/liber-primus/lp2-corpus.json
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ALPHABET = Array.from({ length: 29 }, (_, i) => i);
const REVERSE = ALPHABET.slice().reverse();
const CHAPTER_STARTS = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);

/**
 * Mutates the two alphabet wheels after each rune, keeping their state
 * available for continuations across a page boundary.
 * @param {number[]} input
 * @param {{left:number[],right:number[]}} wheels
 * @param {'encode'|'decode'} mode
 * @param {number} nadir
 * @returns {number[]}
 */
function run(input, wheels, mode, nadir) {
  const output = [];
  let { left, right } = wheels;
  for (const symbol of input) {
    const index = (mode === 'encode' ? right : left).indexOf(symbol);
    assert(index >= 0, 'rune outside current alphabet');
    output.push((mode === 'encode' ? left : right)[index]);
    left = left.slice(index).concat(left.slice(0, index));
    left.splice(nadir, 0, left.splice(1, 1)[0]);
    right = right.slice(index + 1).concat(right.slice(0, index + 1));
    right.splice(nadir, 0, right.splice(2, 1)[0]);
  }
  wheels.left = left;
  wheels.right = right;
  return output;
}

/** @param {number[]} input */
function ioc(input) {
  const counts = new Array(29).fill(0);
  for (const symbol of input) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (input.length * (input.length - 1));
}

/** @param {number[]} input */
function equals(input) {
  let count = 0;
  for (let i = 1; i < input.length; i++) if (input[i] === input[i - 1]) count++;
  return count;
}

/** @param {string} value */
function asciiCodes(value) {
  return Array.from(value, letter => letter.charCodeAt(0) - 65);
}

const knownLeft = asciiCodes('HXUCZVAMDSLKPEFJRIGTWOBNYQ');
const knownRight = asciiCodes('PTLNBQDEOYSFAVZKGJRIHWXUMC');
const knownCipher = run(asciiCodes('WELLDONEISBETTERTHANWELLSAID'), {
  left: knownLeft.slice(), right: knownRight.slice()
}, 'encode', 13).map(i => String.fromCharCode(i + 65)).join('');
assert.equal(knownCipher, 'OAHQHCNYNXTSZJRRHJBYHQKSOUJY');

const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length > 0);
const original = pages.flatMap(page => page.indices);
const originalEqual = pages.reduce((sum, page) => sum + equals(page.indices), 0);
assert.equal(original.length, 12956);
assert.equal(originalEqual, 86);

const p57 = corpus.pages.find(page => page.page === 57).indices;
const outputs = [];
for (const clock of ['continuous', 'chapter', 'page']) {
  for (const nadir of [13, 14]) {
    for (const leftEntry of [['forward', ALPHABET], ['reverse', REVERSE]]) {
      for (const rightEntry of [['forward', ALPHABET], ['reverse', REVERSE]]) {
        const [leftName, left0] = leftEntry;
        const [rightName, right0] = rightEntry;
        const plant = run(p57, { left: left0.slice(), right: right0.slice() }, 'encode', nadir);
        assert.deepEqual(run(plant, { left: left0.slice(), right: right0.slice() }, 'decode', nadir), p57);
        let wheels;
        const all = [];
        const pageOutputs = [];
        for (const page of pages) {
          if (!wheels || clock === 'page' || (clock === 'chapter' && CHAPTER_STARTS.has(page.page))) {
            wheels = { left: left0.slice(), right: right0.slice() };
          }
          const plaintext = run(page.indices, wheels, 'decode', nadir);
          all.push(...plaintext);
          pageOutputs.push({ page: page.page, original: page.indices, plaintext });
        }
        // An authentic source is recovered by each wrong bijective key too:
        // round-trip is an implementation invariant, not a key validator.
        wheels = undefined;
        for (const page of pageOutputs) {
          if (!wheels || clock === 'page' || (clock === 'chapter' && CHAPTER_STARTS.has(page.page))) {
            wheels = { left: left0.slice(), right: right0.slice() };
          }
          assert.deepEqual(run(page.plaintext, wheels, 'encode', nadir), page.original);
        }
        outputs.push({
          clock,
          nadir,
          left: leftName,
          right: rightName,
          ioc: Number(ioc(all).toFixed(8)),
          p0First320Ioc: Number(ioc(all.slice(0, 320)).toFixed(8)),
          samePageEqual: pageOutputs.reduce((sum, page) => sum + equals(page.plaintext), 0),
          p40to53Ioc: Number(ioc(pageOutputs.filter(page => page.page >= 40 && page.page <= 53).flatMap(page => page.plaintext)).toFixed(8))
        });
      }
    }
  }
}
assert.equal(outputs.length, 24);
const range = key => ({
  min: Math.min(...outputs.map(row => row[key])),
  max: Math.max(...outputs.map(row => row[key]))
});
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  n: original.length,
  runePages: pages.length,
  originalSamePageEqual: originalEqual,
  historicalChaocipherPositive: knownCipher,
  plantedP57RoundTrips: outputs.length,
  originalRoundTrips: outputs.length,
  tested: outputs.length,
  ranges: {
    ioc: range('ioc'),
    samePageEqual: range('samePageEqual'),
    p0First320Ioc: range('p0First320Ioc'),
    p40to53Ioc: range('p40to53Ioc')
  },
  cases: outputs
}, null, 2));
