'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  const [a,b] = x;
  const [c,d] = y;
  return [mod(a*c + 8*b*d), mod(a*d + b*c + 3*b*d)];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */
  let acc = [0,0];
  /** @type {[number,number]} */
  let power = [1,0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient*power[0]), mod(acc[1] + coefficient*power[1])];
    power = mul(power,[0,1]);
  }
  return acc;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  // Canonical outside pairing used by the independently established p15 page-count map.
  return [
    values[0] - values[3],
    values[1] - values[2],
    values[1] + values[2],
    values[0] + values[3],
  ];
}

/** @param {number} n @returns {number} */
function base29DigitCount(n) {
  let x = Math.abs(n);
  let count = 1;
  while (x >= MOD) {
    x = Math.floor(x / MOD);
    count += 1;
  }
  return count;
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page,start,length) {
  const record = ink.pages.find((item) => item.page === page);
  assert(record);
  const span = (record.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span);
  return [...span.runes].map((rune) => runeIndex.get(rune));
}

const words = signed.split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(word))
  .map((word) => word.toUpperCase());
assert.strictEqual(words[29], 'DIRECTION');
assert.deepStrictEqual(words.slice(5,9), ['EPIPHANY','SEEKS','THE','DEVOTED']);
assert(signed.toLowerCase().includes('empty; epiphany seeks the devoted.'));

const Q = [5,5,14,9,10,4,27,17,25];
const EQ = evaluate(Q);
assert.deepStrictEqual(EQ,[17,24]);

const log = new Map();
let state = [1,0];
for (let k=0;k<840;k+=1) {
  assert(!log.has(state.join(',')));
  log.set(state.join(','),k);
  state = mul(state,EQ);
}
assert.deepStrictEqual(state,[1,0]);
assert.strictEqual(log.size,840);

/** @param {number[]} source @returns {[number,number]} */
function coordinate(source) {
  const residue = evaluate(source);
  const k = log.get(residue.join(','));
  assert.notStrictEqual(k,undefined);
  return [Math.floor(k/29),k%29];
}

const p56Coordinate = coordinate(redSpan(56,0,5));
const p40Coordinate = coordinate(redSpan(40,0,8));
assert.deepStrictEqual(p56Coordinate,[4,5]);
assert.deepStrictEqual(p40Coordinate,[5,8]);
assert.deepStrictEqual(words.slice(p56Coordinate[0],p56Coordinate[1]+1),['EMPTY','EPIPHANY']);
assert.deepStrictEqual(words.slice(p40Coordinate[0],p40Coordinate[1]+1),['EPIPHANY','SEEKS','THE','DEVOTED']);

// Rebuild the independently established p15 page-count map from raw page rune counts.
const countByPage = new Map(corpus.pages.filter((p) => p.page <= 55).map((p) => [p.page,p.runic_count]));
const map = new Map();
for (let start=0;start<=52;start+=1) {
  const counts = [0,1,2,3].map((delta) => countByPage.get(start+delta));
  assert(counts.every(Number.isInteger));
  const payload = h4(counts).reduce((sum,value) => sum + base29DigitCount(value),0);
  map.set(start,payload);
}
const twoCycles = [];
const fixedPoints = [];
for (const [start,target] of map) {
  if (target === start) fixedPoints.push(start);
  if (map.get(target) === start && start < target) twoCycles.push([start,target]);
}
assert.deepStrictEqual(twoCycles,[[6,8]]);
assert.deepStrictEqual(fixedPoints,[7]);
assert.strictEqual(map.get(6),8);
assert.strictEqual(map.get(7),7);
assert.strictEqual(map.get(8),6);

const redPages = new Set(ink.pages.filter((p) => p.page <=55 && (p.red_spans || []).length).map((p) => p.page));
const consecutiveRedTriples = [];
for (let start=0;start<=53;start+=1) {
  if ([start,start+1,start+2].every((page) => redPages.has(page))) consecutiveRedTriples.push([start,start+1,start+2]);
}
assert.deepStrictEqual(consecutiveRedTriples,[[6,7,8]]);

// Joint cross-holdout: the unique p15 two-cycle + fixed midpoint lands exactly on
// the three-word tail of the independently selected p40 signed clause.
assert.deepStrictEqual([words[6],words[7],words[8]],['SEEKS','THE','DEVOTED']);
assert.strictEqual(words[map.get(6)],'DEVOTED');
assert.strictEqual(words[map.get(7)],'THE');
assert.strictEqual(words[map.get(8)],'SEEKS');

console.log(JSON.stringify({
  q_order: log.size,
  solved_p56_boundary: { coordinate:p56Coordinate, words:words.slice(4,6), punctuation:'EMPTY; EPIPHANY' },
  p40_clause: { coordinate:p40Coordinate, words:words.slice(5,9) },
  p15_page_map: { 6:map.get(6), 7:map.get(7), 8:map.get(8) },
  unique_two_cycle: twoCycles,
  unique_fixed_point: fixedPoints,
  unique_consecutive_red_triple: consecutiveRedTriples,
  signed_tail_action: {
    source:[words[6],words[7],words[8]],
    mapped:[words[map.get(6)],words[map.get(7)],words[map.get(8)]],
  },
},null,2));
