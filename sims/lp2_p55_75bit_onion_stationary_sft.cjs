'use strict';

/**
 * Frozen source-led p55 75-bit Tor-v2 candidate gate.
 * Run from the repository root with Node.js 22.
 * No dependencies; no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @type {{pages: Array<{page: number,indices: number[]}>, translit: string[]}} */
const source = JSON.parse(fs.readFileSync(path.join('resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = source.pages.find((entry) => entry.page === 55);
assert.ok(page);
assert.equal(page.indices.length, 76);
const body = page.indices.slice(1);
assert.equal(body.length, 75);

const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
const candidate = '6sws36unkmvdy4b7';
assert.equal(candidate.length, 16);
assert.equal(base32.indexOf(candidate[15]), 31);

/** @param {string} hostname @returns {number[]} */
function toBits(hostname) {
  return [...hostname].flatMap((character) => {
    const n = base32.indexOf(character);
    assert.ok(n >= 0);
    return [4, 3, 2, 1, 0].map((power) => (n >> power) & 1);
  });
}
/** @param {number[]} bits @returns {string} */
function toBase32(bits) {
  assert.equal(bits.length % 5, 0);
  let answer = '';
  for (let i = 0; i < bits.length; i += 5) {
    const value = bits.slice(i, i + 5).reduce((acc, bit) => (acc << 1) | bit, 0);
    answer += base32[value];
  }
  return answer;
}

// Original visible p55 page: 75 complete-body runes plus proposed
// right-hand 5-dot suffix 11111. This clocks the input in printed order.
const targetBits = toBits(candidate.slice(0, 15));
assert.equal(targetBits.length, body.length);
/** @type {Map<number, {offset:number,bit:number}>} */
const assigned = new Map();
/** @type {Array<{symbol:string,first:number,second:number,firstBit:number,secondBit:number}>} */
const contradictions = [];
for (let i = 0; i < body.length; i += 1) {
  const rune = body[i];
  const bit = targetBits[i];
  const prior = assigned.get(rune);
  if (prior && prior.bit !== bit) {
    contradictions.push({
      symbol: source.translit[rune], first: prior.offset,
      second: i, firstBit: prior.bit, secondBit: bit,
    });
  } else if (!prior) {
    assigned.set(rune, { offset: i, bit });
  }
}
assert.equal(assigned.size, 25);
assert.ok(contradictions.length > 0);
// Two original p55 M runes at body offsets 1 and 7 already force a contradiction.
assert.deepEqual(contradictions[0], {
  symbol: 'M', first: 1, second: 7, firstBit: 1, secondBit: 0,
});
// A 29-entry stationary bit alphabet would be a complete free secret. A
// contradiction in two occurrences therefore excludes all 2^29 possibilities.
const parityAlphabet = Array.from({ length: 29 }, (_, value) => value & 1);
const planted = body.map((rune) => parityAlphabet[rune]);
assert.deepEqual(toBits(toBase32(planted)), planted);
for (let i = 0; i < body.length; i += 1) {
  assert.equal(planted[i], parityAlphabet[body[i]]);
}
console.log(JSON.stringify({
  source: 'LP2 p55, physical page 55 / 72.jpg',
  bodyRunes: body.length, distinctBodyRunes: assigned.size,
  base32Candidate: candidate, finalStencilValue: 31,
  firstContradiction: contradictions[0],
  totalRepeatedRuneContradictions: contradictions.length,
  stationaryRuneBitMappingsPassing: 0,
  plantedPositiveRecovered: true,
}, null, 2));
