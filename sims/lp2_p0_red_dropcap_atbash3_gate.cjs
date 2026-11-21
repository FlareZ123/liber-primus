#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');

// Historical operation documented by the participant reconstruction of the
// original 2014 fourth-onion pages:
// Gematria.rune_to_english(..., mode="atbash", rot=3).
// The rune lookup is reversed GP order; +3 in that order is i -> (2-i) mod 29
// when input/output are represented by standard GP29 indices.
// Pinned source: cicada-solvers/neuroretransmit-cicada@b13600373d3400d75ec4208198019f3d92a304dd
//   2014/006-fourth-onion/gematriaprimus.py and README.md.
//
// The 13 source-order dropcap offsets and GP indices are frozen from
// im-results/lp2-red-dropcap-p0-columnar-gate.md (Round44 P1 original-image
// red-channel extraction, checked against the local canonical corpus).
const offsets = [0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051, 9519, 9640, 12648];
const inputIndices = [15, 20, 13, 24, 14, 20, 1, 19, 23, 21, 27, 0, 24];
const gpText = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S',
  'T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
];
const gpRunes = [
  'ᚠ','ᚢ','ᚦ','ᚩ','ᚱ','ᚳ','ᚷ','ᚹ','ᚻ','ᚾ','ᛁ','ᛄ','ᛇ','ᛈ','ᛉ',
  'ᛋ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛝ','ᛟ','ᛞ','ᚪ','ᚫ','ᚣ','ᛡ','ᛠ'
];

const decodeIndex = i => ((2 - i) % 29 + 29) % 29;
const inputText = inputIndices.map(i => gpText[i]);
const outputIndices = inputIndices.map(decodeIndex);
const outputText = outputIndices.map(i => gpText[i]);
assert.deepEqual(inputText, ['S','L','P','A','X','L','U','M','D','NG','IA','F','A']);
assert.deepEqual(outputIndices, [16,11,18,7,17,11,1,12,8,10,4,2,7]);
assert.equal(outputText.join(''), 'TJEWBJUEOHIRTHW');

const runeIndex = new Map(gpRunes.map((r, i) => [r, i]));
const decodeRunes = s => [...s].map(ch => runeIndex.has(ch)
  ? gpText[decodeIndex(runeIndex.get(ch))]
  : ch).join('');

// Direction control: first line of the 2014 fourth-onion 06.jpg.runes.txt.
// The historical script emits this raw spelling; the README later corrects
// "COAN" to "KOAN" editorially.
const controlCipher = 'ᚹ-ᚣᛠᚹᛟ.ᚹ-ᛇᚹᛟ-ᚻᛈᚣᛝᚻᛈᚻ-ᛋᛠ-/';
const controlPlain = decodeRunes(controlCipher);
assert.equal(controlPlain, 'A-COAN.A-MAN-DECIDED-TO-/');

console.log(JSON.stringify({
  offsets,
  input_indices: inputIndices,
  input_gp: inputText,
  operation: 'i -> (2-i) mod 29 (2014 Atbash-order +3)',
  output_indices: outputIndices,
  output_gp: outputText,
  output: outputText.join(''),
  direction_control: {cipher: controlCipher, plain: controlPlain},
  decision: 'Negative: no coherent instruction or independently meaningful key.'
}, null, 2));
