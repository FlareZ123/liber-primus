'use strict';

/**
 * Audit the 38 published 27x27 LP2 candidate block placements for repeat
 * visits and incompatible GP plaintext assignments on original source cells.
 *
 * Source: external 2retooz270703 public candidate at immutable commit
 * ab9d8190e60009179563ac21b2d750271c2782b3 (14 Nov 2026).
 * Coordinates/outputs are copied from plaintext-i-found/01..38.md.
 * Stage 16 uses the author's MAIN SOON route, not its explicit alternative.
 * The standard C GP rune also represents K in English KEY and ASK.
 *
 * SFT: node sims/lp2_public27_original_cell_conflicts_sft.cjs
 * Scope: exact original source-cell coverage and consistency, not
 * independent verification of all 38 selected key derivations.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = source.pages.filter((p) => p.page <= 2);
assert.deepEqual(pages.map((p) => p.indices.length), [262, 266, 201]);
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 729);

// Exact, immutable selection from the public walk-through, in stage order.
const mainRouteRows = "01 13,25=A 13,26=S 13,27=I 14,1=G 14,2=O 14,3=TH 14,4=E\n02 14,14=W 14,15=EA 14,16=TH 14,17=E 14,18=R\n03 14,19=T 13,19=U 12,19=R 11,19=N 10,19=S\n04 14,7=C 13,7=O 12,7=L 11,7=D\n05 26,19=I 26,18=M 26,17=A 26,16=Y\n06 19,16=C 18,16=R 17,16=Y\n07 11,16=N 12,17=O 13,18=W 14,19=TH 15,20=E\n08 15,20=I 16,19=D 17,18=EA\n09 18,15=O 18,16=F\n10 19,17=TH 19,16=E\n11 19,23=E 20,23=N 21,23=D\n12 21,9=I 21,10=S\n13 26,3=D 26,2=EA 26,1=TH\n14 25,16=S 26,15=E 27,14=E\n15 27,18=Y 26,17=O 25,16=U\n16 25,16=S 25,17=O 25,18=O 25,19=N\n17 25,25=TH 25,26=E 25,27=N\n18 22,21=TH 21,20=E\n19 21,4=C 20,4=E 19,4=Y\n20 18,7=I 19,6=S\n21 9,16=T 8,17=O\n22 9,20=G 9,21=O\n23 12,23=T 12,22=O\n24 9,19=TH 9,18=E\n25 14,24=EA 15,23=S 16,22=T\n26 6,12=O 7,13=F\n27 20,12=TH 20,13=E\n28 19,11=M 18,12=A 17,13=P 16,14=L 15,15=I 14,16=F 13,17=E\n29 18,11=M 18,12=A 18,13=Y\n30 25,12=B 26,11=E\n31 11,11=TH 11,12=E\n32 10,10=D 11,9=EA 12,8=TH\n33 12,18=O 12,17=F\n34 6,11=Y 6,12=O 6,13=U\n35 7,2=G 8,1=O\n36 27,1=D 27,2=O\n37 22,2=A 22,1=S\n38 5,17=I 6,17=A 7,17=S 8,17=C";

const grouped = new Map();
let visits = 0;
const lines = mainRouteRows.trim().split('\n');
assert.equal(lines.length, 38);
for (const line of lines) {
  const [stage, ...entries] = line.trim().split(/\s+/);
  for (const entry of entries) {
    const [coordinate, plaintext] = entry.split('=');
    const [row, column] = coordinate.split(',').map(Number);
    assert.ok(row >= 1 && row <= 27 && column >= 1 && column <= 27);
    const plainIndex = source.translit.indexOf(plaintext);
    assert.ok(plainIndex >= 0, 'unknown plain rune ' + entry);
    const originalIndex = original[27 * (row - 1) + column - 1];
    assert.ok(originalIndex >= 0 && originalIndex <= 28);
    const keyIndex = (originalIndex - plainIndex + 29) % 29;
    const a = grouped.get(coordinate) || [];
    a.push({stage, plaintext, originalIndex, keyIndex});
    grouped.set(coordinate, a);
    visits++;
  }
}
assert.equal(visits, 115);
assert.equal(grouped.size, 103);
const repeated = [...grouped].filter(([_coordinate, visitsAtCell]) => visitsAtCell.length > 1);
const inconsistent = repeated.filter(([_coordinate, visitsAtCell]) =>
  new Set(visitsAtCell.map((x) => x.plaintext)).size > 1
);
assert.equal(repeated.length, 11);
assert.deepEqual(inconsistent.map(([xy]) => xy).sort(),
  ['14,16','14,19','26,17','19,16','18,16','12,17','15,20','25,16','8,17'].sort()
);
assert.equal(729 - grouped.size, 626);

// The first two local outputs match the independent original-source gate.
const firstTwo = lines.slice(0, 2).flatMap((line) =>
  line.split(/\s+/).slice(1).map((entry) => entry.split('=')[1])
).join('');
assert.equal(firstTwo, 'ASIGOTHEWEATHER');

console.log('PASS: 38 published main-route blocks; 115 GP plaintext occurrences');
console.log('Original 729-cell receiver: 103 distinct visited; 626 unvisited');
console.log('Revisited cells: 11; contradictory GP assignments: 9');
for (const [xy, observed] of inconsistent) {
  const ci = observed[0].originalIndex;
  const entries = observed.map((x) => x.stage + ':' + x.plaintext + '/key' + x.keyIndex);
  console.log(xy + ' C=' + source.translit[ci] + '(' + ci + ') => ' + entries.join(' vs '));
}
console.log('CONCLUSION: no single-valued GP plaintext per original cell for this route.');
console.log('This does not exclude multiple-key visits if an authentic state/clock is supplied.');
