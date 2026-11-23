'use strict';
/**
 * Original LP2 2014 first-party 5x5/7x7/5x5 square-event transposition +
 * 2014 signed historical FIRFUMFERENFE GP29 additive Vigenere.
 *
 * 64 frozen inverses: ascending original cell ranks or clockwise outside-in
 * square spirals; three independent read/scatter bits; both key signs; key
 * advances on GP29 rune events or on every GP30 rune/space event.
 *
 * Original gap identity, original 12,956 rune values and 2,896 complete-word
 * boundaries are preserved by the encoder/decoder, including 32 cross-page
 * words. The historical source does not say to combine these two operators.
 * This is a finite original-source hypothesis test, not a selected decoder.
 *
 * Run (Windows 11, Node.js 22): node sims/lp2_2014_squares_event_and_firfum_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
/** @param {string} filepath @returns {string} */
function read(filepath) {
  return fs.readFileSync(path.join(base, filepath), 'utf8');
}
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sections = read('resources/liber-primus/lp2-transcription.txt').split('%');
const cells = read('resources/cicada2014-openpuff-magic-squares.txt')
  .match(/\d+/g).map(Number);
assert.equal(cells.length, 99);
const squareCells = [cells.slice(0, 25), cells.slice(25, 74), cells.slice(74)];
const dimensions = [5, 7, 5];
for (let k = 0; k < 3; k++) {
  const square = squareCells[k], n = dimensions[k];
  assert.equal(square.length, n * n);
  const sum = k === 0 ? 3301 : 1033;
  for (let row = 0; row < n; row++) {
    assert.equal(square.slice(row * n, (row + 1) * n).reduce((a, b) => a + b, 0), sum);
  }
}
const runeIndex = new Map(source.runes.map((r, i) => [r, i]));
const events = [];
const ranges = [];
let gapPending = false;
for (let k = 0; k < 55; k++) {
  const page = k < 50 ? k : k + 1, start = events.length;
  let count = 0;
  for (const ch of sections[k]) {
    const ix = runeIndex.get(ch);
    if (ix !== undefined) {
      events.push(ix);
      gapPending = false;
      count++;
    } else if ('-.&$§'.includes(ch) && !gapPending) {
      events.push(29);
      gapPending = true;
    }
  }
  assert.deepEqual(events.slice(start).filter(v => v < 29),
    source.pages[page].indices);
  ranges.push({page, start, end:events.length, runes:count});
}
assert.equal(events.length, 15852);
assert.equal(events.filter(v => v < 29).length, 12956);
assert.equal(events.filter(v => v === 29).length, 2896);
assert.equal(ranges.length, 55);

/** @param {number[]} a @returns {number[]} */
function cellRank(a) {
  return a.map((value, index) => ({value, index}))
    .sort((a, b) => a.value - b.value || a.index - b.index)
    .map(x => x.index);
}
/** @param {number} side @returns {number[]} */
function clockwiseSpiral(side) {
  const order = [];
  let left = 0, right = side - 1, top = 0, bottom = side - 1;
  while (left <= right && top <= bottom) {
    for (let c = left; c <= right; c++) order.push(top * side + c);
    top++;
    for (let r = top; r <= bottom; r++) order.push(r * side + right);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) order.push(bottom * side + c);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) order.push(r * side + left);
      left++;
    }
  }
  assert.equal(new Set(order).size, side * side);
  return order;
}
const permutations = {
  rank: squareCells.map(cellRank),
  spiral: dimensions.map(clockwiseSpiral),
};

/** @param {number[]} tape @param {number[][]} perms @param {number} mask
 * @param {boolean} [inverse] @returns {number[]} */
function permuteEvents(tape, perms, mask, inverse = false) {
  const output = tape.slice();
  let offset = 0;
  while (offset + 99 <= tape.length) {
    for (let k = 0; k < 3; k++) {
      const perm = perms[k], scatter = Boolean((mask >> k) & 1) !== inverse;
      for (let j = 0; j < perm.length; j++) {
        if (scatter) output[offset + perm[j]] = tape[offset + j];
        else output[offset + j] = tape[offset + perm[j]];
      }
      offset += perm.length;
    }
  }
  return output;
}
// From the historical 2014 GP cipher key FIRFUMFERENFE, modulo29.
// This source was tested on plain runes previously, NOT on joint square-event
// permutation followed by Vigenere; no source mandates this composition.
const key = [0,19,25,0,28,10,0,11,25,11,20,0,11];
/** @param {number[]} tape @param {-1|1} sign
 * @param {'rune'|'event'} clock @returns {number[]} */
function applyVigenere(tape, sign, clock) {
  let cursor = 0;
  return tape.map((v) => {
    if (v === 29) {
      if (clock === 'event') cursor++;
      return v;
    }
    const result = (v + sign * key[cursor % key.length] + 29) % 29;
    cursor++;
    return result;
  });
}
/** @param {number[]} tape @returns {object} */
function diagnostics(tape) {
  const freq = new Array(29).fill(0);
  let gaps = 0, empty = 0, maxWord = 0, wordLength = 0, runes = 0;
  for (const v of tape) {
    if (v === 29) {
      gaps++;
      if (wordLength === 0) empty++;
      maxWord = Math.max(maxWord, wordLength);
      wordLength = 0;
    } else {
      runes++;
      freq[v]++;
      wordLength++;
    }
  }
  maxWord = Math.max(maxWord, wordLength);
  return {
    runes, gaps, empty, maxWord,
    ioc:freq.reduce((sum, n) => sum + n * (n - 1), 0) / (runes * (runes - 1)),
  };
}
/** @param {number[]} tape @param {number} from @param {number} to */
function pageSpan(tape, from, to) {
  const start = ranges.find(x => x.page === from).start;
  const end = ranges.find(x => x.page === to).end;
  return tape.slice(start, end);
}
// Original source positive: the genuinely decrypted p57 parable and all
// its real spaces, independently of any unknown-page decipherment.
function solvedP57Events() {
  const tape = [];
  let previousGap = false;
  for (const ch of sections[56]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      tape.push(v); previousGap = false;
    } else if ('-.&$§'.includes(ch) && !previousGap) {
      tape.push(29); previousGap = true;
    }
  }
  assert.deepEqual(tape.filter(x => x < 29), source.pages[57].indices);
  assert.equal(tape.filter(x => x === 29).length, 20);
  assert.equal(tape.length, 115);
  return tape;
}
const native57 = solvedP57Events();
const result = [];
for (const kind of ['rank', 'spiral']) {
  const perms = permutations[kind];
  for (let mask = 0; mask < 8; mask++) {
    for (const sign of [-1, 1]) {
      for (const clock of ['rune', 'event']) {
        const inverse = permuteEvents(events, perms, mask);
        const plain = applyVigenere(inverse, sign, clock);
        const restored = permuteEvents(
          applyVigenere(plain, -sign, clock), perms, mask, true);
        assert.deepEqual(restored, events);
        // Construct a ciphertext from authentic solved GP29 text and literal
        // printed spaces, then decode it using the same untouched parameters.
        const encrypted57 = permuteEvents(
          applyVigenere(native57, -sign, clock), perms, mask, true);
        assert.deepEqual(
          applyVigenere(permuteEvents(encrypted57, perms, mask), sign, clock),
          native57);
        result.push({
          kind, mask, sign, clock,
          training:diagnostics(pageSpan(plain, 16, 21)),
          holdout:diagnostics(pageSpan(plain, 40, 53)),
        });
      }
    }
  }
}
assert.equal(result.length, 64);
const selected = [...result].sort((a, b) =>
  Math.min(b.training.ioc, b.holdout.ioc) -
  Math.min(a.training.ioc, a.holdout.ioc))[0];
assert.equal(selected.kind, 'spiral');
assert.equal(selected.mask, 1);
assert.equal(selected.sign, 1);
assert.equal(selected.clock, 'event');
assert.equal(selected.training.empty, 24);
assert.equal(selected.holdout.empty, 68);
assert.ok(selected.training.ioc < 0.04 && selected.holdout.ioc < 0.04);
assert.ok(result.every(x => x.training.ioc < 0.04 && x.holdout.ioc < 0.04));
const report = {
  fullOriginalSourceEvents:events.length,
  originalRuneCount:12956,
  printedWordGapCount:2896,
  sampleCount:result.length,
  sourceSelectedParts:'2014 authentic square cells and Vigenere key only',
  unsupportedParts:'composing them, transposing GP30 spaces, rank/spiral square read',
  baseline:{
    training:diagnostics(pageSpan(events, 16, 21)),
    holdout:diagnostics(pageSpan(events, 40, 53)),
  },
  bestOf64:selected,
  outputRanges:result.map(x => ({kind:x.kind, mask:x.mask, sign:x.sign,
    clock:x.clock, trainIoC:x.training.ioc, heldIoC:x.holdout.ioc,
    trainEmpty:x.training.empty, heldEmpty:x.holdout.empty})),
  genuineSolvedP57Positive:{events:native57.length, runeCount:95,
    gapCount:20, recoveredForAll64:true},
  originalReencryption:'all 15,852 events exactly replayed in all 64 cases',
  conclusion:'No original plaintext or author-selected inverse recovered.',
};
console.log(JSON.stringify(report, null, 2));
console.log('PASS: original-event source input, 64 inverses, heldouts, solved p57 positives');
