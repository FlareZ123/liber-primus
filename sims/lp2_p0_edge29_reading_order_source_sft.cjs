'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt');
const pages = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n%\r?\n/);
const originalWidths = [
  7, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23,
  23, 24, 23, 23, 21, 23, 23, 22, 21, 21, 21,
  21, 23, 21, 24, 22, 25, 23, 21, 24, 22, 19,
];

/** @type {string[][]} */
const lines = [];
/** @type {number[]} */
const pageLineCounts = [];
for (let page = 0; page < 3; page += 1) {
  const physicalLines = pages[page].split(/\r?\n/).filter((line) => line.includes('/'));
  pageLineCounts.push(physicalLines.length);
  for (const [lineIndex, physicalLine] of physicalLines.entries()) {
    const runes = [...physicalLine].filter((char) => /\p{Script=Runic}/u.test(char));
    if (page === 0 && lineIndex === 0) {
      assert.equal(runes.length, 20, 'first source line includes exactly 13 red + 7 black');
      runes.splice(0, 13);
    }
    lines.push(runes);
  }
}
assert.deepEqual(pageLineCounts, [12, 12, 9]);
assert.deepEqual(lines.map((line) => line.length), originalWidths);
assert.equal(lines.reduce((sum, line) => sum + line.length, 0), 716);
assert.equal(lines.reduce((sum, line) => sum + line.length - 2, 0), 650);

const left = lines.map((line) => line[0]);
const right = lines.map((line) => line[line.length - 1]);
const readers = {
  lineLeftThenRight: lines.flatMap((line) => [line[0], line[line.length - 1]]),
  lineRightThenLeft: lines.flatMap((line) => [line[line.length - 1], line[0]]),
  leftDownRightDown: [...left, ...right],
  leftDownRightUp: [...left, ...right.slice().reverse()],
  rightDownLeftUp: [...right, ...left.slice().reverse()],
  rightDownLeftDown: [...right, ...left],
};

/**
 * @param {string[]} symbols Rune edge readout, without altered original glyphs.
 * @returns {{coverTime:number,first46:number,first48:number,firstAppearance:string}}
 */
function summary(symbols) {
  const seen = new Set();
  const order = [];
  let coverTime = 0;
  for (const [index, glyph] of symbols.entries()) {
    if (!seen.has(glyph)) {
      seen.add(glyph);
      order.push(glyph);
      if (seen.size === 29 && !coverTime) coverTime = index + 1;
    }
  }
  assert.equal(symbols.length, 66);
  assert.equal(seen.size, 29);
  return {
    coverTime,
    first46: new Set(symbols.slice(0, 46)).size,
    first48: new Set(symbols.slice(0, 48)).size,
    firstAppearance: order.join(''),
  };
}

const outputs = Object.fromEntries(
  Object.entries(readers).map(([name, symbols]) => [name, summary(symbols)]),
);
assert.deepEqual(
  Object.fromEntries(Object.entries(outputs).map(([name, item]) => [name, item.coverTime])),
  {
    lineLeftThenRight: 46,
    lineRightThenLeft: 46,
    leftDownRightDown: 56,
    leftDownRightUp: 58,
    rightDownLeftUp: 55,
    rightDownLeftDown: 56,
  },
);
assert.equal(
  outputs.lineLeftThenRight.firstAppearance,
  'ᚦᛟᚩᛡᛈᚠᛋᛁᚫᚾᛖᚷᛒᛄᛝᛠᛇᛏᚹᚪᚻᛗᛚᚢᚱᛞᚳᚣᛉ',
);
assert.notEqual(
  outputs.lineLeftThenRight.firstAppearance,
  outputs.lineRightThenLeft.firstAppearance,
  'opposite two-edge traversal does not determine the same keyed order',
);
// A natural follow-up is the permutation that converts the 29-symbol
// first-appearance order of each paired-edge orientation into the other.
// It is an *involution*: every two newly discovered glyphs in a physical
// line are exchanged, and all single discoveries remain fixed. Therefore
// its repeated application has order two and cannot generate a 29-clock.
/**
 * @param {string} original First-occurrence GP29 alphabet, 29 glyphs.
 * @param {string} opposite Oppositely read first-occurrence GP29 alphabet.
 * @returns {{fixedPoints:number,transpositions:number,period:number}}
 */
function oppositeOrderInvolution(original, opposite) {
  const a = [...original];
  const b = [...opposite];
  assert.equal(a.length, 29);
  assert.equal(b.length, 29);
  const placement = new Map(b.map((glyph, index) => [glyph, a[index]]));
  const twice = a.map((glyph) => placement.get(placement.get(glyph)));
  assert.deepEqual(twice, a);
  const fixedPoints = a.filter((glyph) => placement.get(glyph) === glyph).length;
  const transpositions = (a.length - fixedPoints) / 2;
  assert.equal(fixedPoints, 11);
  assert.equal(transpositions, 9);
  return {fixedPoints, transpositions, period:2};
}
const orientationBridge = oppositeOrderInvolution(
  outputs.lineLeftThenRight.firstAppearance,
  outputs.lineRightThenLeft.firstAppearance,
);

console.log(JSON.stringify({sourcePath, pageLineCounts, blackRunes:716, edges:66, core:650, outputs, orientationBridge}, null, 2));
console.log('PASS original opening edge-reader selector gate; no cipher or plaintext inferred.');
