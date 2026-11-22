'use strict';

/**
 * Original-source LP2 p49–51 table handoff and authentic p56 ten-dot
 * punctuation positive/negative control.
 * SFT: node sims/lp2_table_handoff_tendot_sft.cjs
 * Uses pinned canonical source; no unknown plaintext is assumed or fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus', name), 'utf8'));
}
const db = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const ink = load('lp2-ink-annotations.json');
const mark = page => ink.pages.find(x => x.page === page)?.large_punctuation || [];
const hasMark = (page, after, n) => mark(page).some(x => x[0] === after && x[1] === n);
const mod = n => (n % 29 + 29) % 29;

/** @param {number} n @returns {number[]} */
function primes(n) {
  const ps = [];
  for (let x = 2; ps.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) ps.push(x);
  }
  return ps;
}
const ps = primes(100);

/**
 * Replay the verified LP2 p56 prime-minus-one inverse with authentic literal-F
 * skip at rune offset 56, changing only whether the key counter resets at
 * the source-original ten-dot punctuation after rune 45.
 * @param {boolean} resetAtTen
 * @returns {number[]}
 */
function decode56(resetAtTen) {
  let k = 0;
  return db.pages[56].indices.map((cipher, i) => {
    if (resetAtTen && i === 45) k = 0;
    if (i === 56) { assert.equal(cipher, 0); return 0; }
    return mod(cipher - (ps[k++] - 1));
  });
}
const translit = values => values.map(v => db.translit[v]).join('-');

assert.deepEqual([db.pages[49].indices.length, db.pages[50].indices.length, db.pages[51].indices.length], [66, 0, 92]);
assert.deepEqual(grid.pages.map(x => [x.page, x.rows, x.cols]), [[49, 10, 8], [50, 13, 8], [51, 9, 8]]);
assert.equal(grid.bytes.length, 256);
assert.ok(hasMark(49, 66, 10), 'Original p49 ten-dot mark after last pre-table rune');
assert.ok(hasMark(56, 45, 10), 'Authentic p56 ten-dot mark at known solve');
assert.deepEqual(db.pages[51].indices.slice(0, 3), [7, 7, 13], 'Original first post-table word W-W-P');

const keep = decode56(false);
const reset = decode56(true);
const expected = ['I', 'T', 'I', 'S', 'TH', 'E', 'D', 'U', 'T', 'Y', 'O', 'F', 'E'];
assert.equal(translit(keep.slice(45, 58)), expected.join('-'));
assert.notDeepEqual(reset.slice(45, 58), keep.slice(45, 58));
const afterMatch = reset.slice(45).filter((v, i) => v === keep[45 + i]).length;
assert.equal(afterMatch, 3);

// A hypothetical fresh p56-style prime clock at p51 would give G-C-N
// for its first complete printed W-W-P word; this branch has no
// authorial table-reset selector and is NOT a full cipher exclusion.
const firstAfter = db.pages[51].indices.slice(0, 3).map((v, i) => mod(v - (ps[i] - 1)));
assert.equal(translit(firstAfter), 'G-C-N');

console.log(JSON.stringify({
  manuscript: 'Original LP2 66 runes | 256 table cells | 92 runes on pp49–51',
  tablePageRows: grid.pages.map(x => x.rows),
  sourceLargeMark: {page: 49, afterRune: 66, redDots: 10},
  authenticControl: {page: 56, afterRune: 45, redDots: 10,
    continued: translit(keep.slice(45, 58)),
    erroneouslyReset: translit(reset.slice(45, 58)),
    matchingPositionsAfterReset: afterMatch, postMarkLength: 40},
  unselectedPrimeRestartCandidate: {page: 51, ciphertextWord: 'W-W-P', output: translit(firstAfter)},
  decision: 'Ten-dot alone does not imply key reset. No original source assigns a GP29 operator, table-state transition or recipient to 256 byte cells.',
  outcome: 'No unknown LP2 plaintext, key, or authenticated decipherment'
}, null, 2));
