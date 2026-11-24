#!/usr/bin/env node
'use strict';

// Reproduce the only source-natural orientation/half-boundary candidates
// for the p41 two-cluster phone mask against the exact 2012 phrase spaces.
// This is a bounded separator test, not a rotation search.

const words = ['CALL','US','AT','US','TELE','PHONE','NUMBER','TWO','ONE','FOUR','THREE','NINE','OH','NINE','SIX','OH','EIGHT'];
const lengths = words.map(word => word === 'THREE' ? 4 : word.length); // TH is one GP29 rune.
const actualSpaces = [];
let total = 0;
for (let i = 0; i < words.length; i++) {
  total += lengths[i];
  if (i < words.length - 1) {
    actualSpaces.push(total);
    total++;
  }
}
if (total !== 75 || actualSpaces.length !== 16) throw new Error('phrase tokenization mismatch');

const actual = new Set(actualSpaces);
function test(name, pattern, phase) {
  const predicted = new Set();
  for (let i = 0; i < 75; i++) if (pattern[(i + phase) % 10] === '0') predicted.add(i);
  const matched = [...actual].filter(i => predicted.has(i)).length;
  return {
    name, pattern, phase, predicted_zero_count: predicted.size,
    predicted_zero_positions: [...predicted],
    actual_space_matches: matched,
    false_positives: predicted.size - matched,
    missed_spaces: actual.size - matched,
    exact: predicted.size === actual.size && matched === actual.size
  };
}

const cases = [
  test('left-first / phase0', '0110111111', 0),
  test('right-first / phase0', '1111101101', 0),
  test('right-first / phase5', '1111101101', 5),
  test('left-first / phase5', '0110111111', 5)
];
if (cases.some(x => x.actual_space_matches !== 2)) throw new Error('unexpected overlap');
if (cases[0].predicted_zero_count !== 16 || cases[2].predicted_zero_count !== 16) throw new Error('expected 16-zero count match');
console.log(JSON.stringify({
  source: {
    p41_original_scan: '58.jpg',
    right_cluster: '11111 (five filled)',
    left_cluster: '01101 (three filled, two outlined; clockwise from top is only a candidate traversal)',
    right_first_phone_pattern: '1111101101',
    2012_phrase: 'CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT'
  },
  phrase: { word_count: words.length, gp29_letter_runes: 59, literal_spaces: 16, mixed_positions: total, space_positions: actualSpaces },
  tests: cases,
  decision: 'two-dot phone checksum does not supply the 16-space separator mask'
}, null, 2));
