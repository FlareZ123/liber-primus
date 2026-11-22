'use strict';

/**
 * Original-source dual-radix probe: the p57 13-dot marker selects the
 * 13th clockwise cell of the 32x8 numeric table circumference.
 * No guessed plaintext, key, or cryptanalytic optimization is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(tokens.some(token => token.includes('f')), false);

/** @param {string} token @param {string} alphabet */
function value(token, alphabet) {
  assert.equal(token.length, 2);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return alphabet.length * high + low;
}

/** Clockwise perimeter indices, starting at the top-left physical table cell. */
const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) ring.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const cells = ring.slice(12, 19);
const selected = cells.map(index => tokens[index]);
assert.deepEqual(cells, [47, 55, 63, 71, 79, 87, 95]);
assert.deepEqual(selected, ['1G', '1K', '0p', '1m', '1M', '15', '0Z']);

const ascii60 = selected.map(token => value(token, alphabet60));
const ascii59 = selected.map(token => value(token, alphabet59));
assert.deepEqual(ascii60, [76, 80, 51, 108, 82, 65, 35]);
assert.deepEqual(ascii59, [75, 79, 50, 106, 81, 64, 35]);
assert.equal(String.fromCharCode(...ascii60.slice(0, 3)), 'LP3');
assert.equal(String.fromCharCode(...ascii59.slice(0, 3)), 'KO2');
assert.equal(String.fromCharCode(...ascii60), 'LP3lRA#');
assert.equal(String.fromCharCode(...ascii59), 'KO2jQ@#');

const welcome = lp1.split('### 3\n')[1].split('### 4\n')[0];
const firstKoan = lp1.split('### 6\n')[1].split('### 7\n')[0];
const secondKoan = lp1.split('### 14\n')[1].split('### 15\n')[0];
const parable = lp1.split('### 57\n')[1];

assert.ok(welcome.includes('LIKE THE INSTAR, IT IS ONLY THROUGH GOING WITHIN THAT WE MAY EMERGE'));
assert.ok(secondKoan.includes('THE I IS THE VOICE OF THE CIRCUMFERENCE'));
assert.ok(firstKoan.startsWith('A KOAN'));
assert.ok(secondKoan.startsWith('A KOAN'));
assert.ok(parable.includes('LIKE THE INSTAR TUNNELING TO THE SURFACE'));
assert.ok(parable.includes('WE MUST SHED OUR OWN CIRCUMFERENCES'));
assert.ok(parable.includes('FIND THE DIVINITY WITHIN AND EMERGE'));

const headings = (lp1.match(/^A KOAN$/gm) || []).length;
assert.equal(headings, 2);

console.log('Source-native 32x8 perimeter cells: 76, all distinct.');
console.log('Source-fixed 1-based clockwise ring cells 13..19:', cells);
console.log('Unchanged printed tokens:', selected.join(' '));
console.log('Base60 literal ASCII:', String.fromCharCode(...ascii60));
console.log('Drop-f base59 literal ASCII:', String.fromCharCode(...ascii59));
console.log('LP1 page03 WELCOME: LIKE THE INSTAR ... EMERGE');
console.log('LP1 page14 second KOAN: THE I IS THE VOICE OF THE CIRCUMFERENCE');
console.log('LP2 page57 PARABLE: LIKE THE INSTAR ... / ... CIRCUMFERENCES');
console.log('PASS: exact dual readings and independent solved-text references; no decryption established.');
