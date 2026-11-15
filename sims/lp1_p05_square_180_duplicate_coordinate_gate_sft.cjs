'use strict';

/**
 * Original LP1 p05 5x5 magic-square / LP2 p49-p55 coordinate gate.
 * Read-only, Node 22 CommonJS, no fitted parameters or guessed plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'), 'utf8');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const lines = source.split(/\r?\n/);
const begin = lines.findIndex((line) => line.startsWith('272-138-'));
assert.ok(begin >= 0, 'Original LP1 p05 square is present');

const square = lines.slice(begin, begin + 5).map((line) => line.replace(/\/$/, '').split('-').map((token) => {
  if (/^\d+$/.test(token)) return { numeric: Number(token), runes: [], name: token };
  const runes = [...token].map((rune) => {
    const index = gp.runes.indexOf(rune);
    assert.ok(index >= 0, 'Source square rune exists in original GP chart');
    return index;
  });
  return { numeric: runes.reduce((sum, index) => sum + gp.prime[index], 0), runes, name: token };
}));
assert.deepEqual(square.map((line) => line.length), [5, 5, 5, 5, 5]);

const rowSums = square.map((row) => row.reduce((sum, cell) => sum + cell.numeric, 0));
const columnSums = Array.from({ length: 5 }, (_, col) =>
  square.reduce((sum, row) => sum + row[col].numeric, 0));
assert.deepEqual(rowSums, Array(5).fill(1033));
assert.deepEqual(columnSums, Array(5).fill(1033));
assert.equal(square.reduce((sum, row, i) => sum + row[i].numeric, 0), 1033);
assert.equal(square.reduce((sum, row, i) => sum + row[4 - i].numeric, 0), 1033);

const pairs = [];
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const targetRow = 4 - row, targetCol = 4 - col;
    const a = square[row][col], b = square[targetRow][targetCol];
    assert.equal(a.numeric, b.numeric, 'All 25 printed values are centrally symmetric');
    if (row < targetRow || (row === targetRow && col <= targetCol)) {
      pairs.push({
        from: [row + 1, col + 1], to: [targetRow + 1, targetCol + 1],
        value: a.numeric, aRunes: a.runes.length, bRunes: b.runes.length
      });
    }
  }
}
assert.equal(pairs.length, 13);
assert.equal(pairs.filter((pair) => pair.aRunes > 0 && pair.bRunes > 0).length, 6);
assert.equal(pairs.filter((pair) => (pair.aRunes > 0) !== (pair.bRunes > 0)).length, 2);
assert.equal(pairs.filter((pair) => pair.aRunes > 0 && pair.bRunes > 0 &&
  pair.aRunes !== pair.bRunes).length, 2);

const words = [];
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const cell = square[row][col];
    if (cell.runes.length) words.push({ row: row + 1, col: col + 1, ...cell });
  }
}
assert.equal(words.length, 13);
assert.equal(words.reduce((sum, word) => sum + word.runes.length, 0), 76);

let cursor = 0;
const seen = new Set();
const dropped = [];
const dropPositions = [];
for (const word of words) {
  const key = word.runes.join(',');
  if (seen.has(key)) {
    dropped.push({ row: word.row, col: word.col, count: word.runes.length });
    for (let offset = 0; offset < word.runes.length; offset++) dropPositions.push(cursor + offset);
  }
  seen.add(key);
  cursor += word.runes.length;
}
assert.deepEqual(dropped, [{ row: 4, col: 3, count: 4 }, { row: 4, col: 5, count: 6 }]);
assert.deepEqual(dropPositions, [53, 54, 55, 56, 65, 66, 67, 68, 69, 70]);
const dropSet = new Set(dropPositions);
const sourceTape = words.flatMap((word) => word.runes);
const sourceRemoved = sourceTape.filter((_, i) => dropSet.has(i));
const sourceKept = sourceTape.filter((_, i) => !dropSet.has(i));
assert.equal(sourceRemoved.length, 10);
assert.equal(sourceKept.length, 66);
assert.equal(sourceKept.length, gp.pages[49].indices.length);
assert.equal(sourceTape.length, gp.pages[55].indices.length);
const fourCells = words.filter((word) => word.runes.length === 4);
const sixCells = words.filter((word) => word.runes.length === 6);
assert.equal(fourCells.length * sixCells.length, 15);

const p55 = gp.pages[55].indices;
const p49 = gp.pages[49].indices;
const p55Kept = p55.filter((_, i) => !dropSet.has(i));
const p55Removed = p55.filter((_, i) => dropSet.has(i));
const literalInsertionMatches = p55Removed.filter((value, i) => value === sourceRemoved[i]).length;
const directRouteMatches = p55Kept.filter((value, i) => value === p49[i]).length;
assert.equal(literalInsertionMatches, 0);
assert.equal(directRouteMatches, 3);

// A synthetic known-plaintext control demonstrates that the erasure/restore
// positions and literal insertion are perfectly invertible on their restricted domain.
const known = gp.pages[57].indices.slice(0, 66);
const planted = [];
let knownPos = 0, sourcePos = 0;
for (let i = 0; i < 76; i++) {
  planted.push(dropSet.has(i) ? sourceRemoved[sourcePos++] : known[knownPos++]);
}
assert.deepEqual(planted.filter((_, i) => !dropSet.has(i)), known);
assert.deepEqual(planted.filter((_, i) => dropSet.has(i)), sourceRemoved);
assert.notDeepEqual(p55Removed, sourceRemoved);

console.log(JSON.stringify({
  source: 'LP1 p05 original 5x5 mixed square and LP2 p49/p55',
  rows: rowSums, columns: columnSums, diagonals: [1033, 1033],
  antipodalPairs: pairs.length, mixedRuneNumericAntipodes: 2,
  unequalLengthRuneAntipodes: 2,
  wordCells: words.length, fullRunes: sourceTape.length,
  uniqueWords: seen.size, keptRunes: sourceKept.length,
  droppedCoordinates: dropped, droppedOffsetsZeroBased: dropPositions,
  nonselectedTwoCellLengthTenDeletions: 15,
  originalLiteralInsertionMatches: literalInsertionMatches,
  originalDirectP49P55RouteMatches: directRouteMatches,
  possiblePreimagesPer76to66Drop: (29n ** 10n).toString(),
  plantedPositive: '66/66 recovered, 10/10 literal side characters'
}, null, 2));
