'use strict';

/**
 * Source-fixed 2013 ICMP prime identifiers as ordinal reads of the original
 * 2014 LP2 thirteen-dot segments. Run from the repository root on Node 22.
 * No guessed key, alphabet, packet-order permutation or phase is fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const positions = [0];
for (const page of corpus.pages) positions.push(positions.at(-1) + page.indices.length);
const all = corpus.pages.flatMap((page) => page.indices);
const marks = [0, all.length];
for (const page of ink.pages) {
  for (const [offset, count] of page.large_punctuation || []) {
    if (count === 13) marks.push(positions[page.page] + offset);
  }
}
marks.sort((a, b) => a - b);
assert.equal(marks.length, 33);
assert.equal(marks[28], 12956);
assert.equal(positions[56], 12956);
assert.equal(marks[8], marks[9]);
assert.equal(marks[11], marks[12]);

/** @param {number} x */
function prime(x) {
  for (let f = 2; f * f <= x; f++) if (x % f === 0) return false;
  return x >= 2;
}
const ids = [];
for (let x = 3302; ids.length < 28; x++) if (prime(x)) ids.push(x);
assert.deepEqual(ids.slice(18, 21), [3457, 3461, 3463]);

/**
 * @param {number[]} tape
 * @returns {{slot:number,id:number,position:number,symbol:number}[]}
 */
function select(tape) {
  const picks = [];
  for (let slot = 0; slot < 28; slot++) {
    const length = marks[slot + 1] - marks[slot];
    if (length === 0) continue;
    const position = marks[slot] + ids[slot] % length;
    picks.push({ slot, id: ids[slot], position, symbol: tape[position] });
  }
  return picks;
}
const picks = select(all);
assert.equal(picks.length, 26);
assert.equal(new Set(picks.map((p) => p.position)).size, 26);
assert.equal(new Set(picks.map((p) => p.symbol)).size, 17);
const render = (picks) => picks.map((p) => corpus.translit[p.symbol]).join('');
const direct = render(picks);
const atbash = picks.map((p) => corpus.translit[28 - p.symbol]).join('');
assert.equal(direct, 'MWTIATHNGEOWOIAEANTXWEEOEOYIESNJIF');

const plant = all.slice();
const controls = corpus.pages[57].indices.slice(0, picks.length);
assert.equal(controls.length, picks.length);
for (let i = 0; i < picks.length; i++) plant[picks[i].position] = controls[i];
assert.deepEqual(select(plant).map((p) => p.symbol), controls);
assert.equal(render(select(plant)), controls.map((x) => corpus.translit[x]).join(''));

console.log('2013 28 prime-ID predictions:', ids.join(','));
console.log('28 original LP2 slots: 2 empty (8,11), 26 selected GP runes');
console.log('Direct:', direct);
console.log('Atbash:', atbash);
console.log('Original distinct GP symbols:', new Set(picks.map((p) => p.symbol)).size);
console.log('Source-native 26-symbol plant: 26/26 exact recovery');
console.log('Status: no readable instruction or original LP2 plaintext recovered.');
