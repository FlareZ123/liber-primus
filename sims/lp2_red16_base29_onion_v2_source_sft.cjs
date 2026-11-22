/**
 * LP2 red16 headings as 80-bit Tor-v2 addresses via the signed 2013 BASE29 rule.
 * Agent31, 2026-11-13. Source-fixed, reversible, no fitted offsets or keys.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
const known2014 = new Set([
  'auqgnxjtvdbll3pv',
  'cu343l33nqaekrnw',
  'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n',
  'q4utgdi2n4m4uim5',
  'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac'
]);

/** @param {number[]} digits GP29 values, most significant rune first. @returns {bigint} */
function fromGp29(digits) {
  return digits.reduce((number, digit) => number * 29n + BigInt(digit), 0n);
}

/** @param {bigint} number 80-bit nonnegative unsigned integer. @returns {string} */
function toOnionHost(number) {
  assert(number >= 0n && number < (1n << 80n));
  let value = number;
  let host = '';
  for (let i = 0; i < 16; i += 1) {
    host = alphabet[Number(value & 31n)] + host;
    value >>= 5n;
  }
  assert.equal(value, 0n);
  return host;
}

/** @param {string} host RFC4648 unpadded base32 host. @returns {bigint} */
function fromOnionHost(host) {
  assert.match(host, /^[a-z2-7]{16}$/);
  let number = 0n;
  for (const character of host) {
    number = number * 32n + BigInt(alphabet.indexOf(character));
  }
  return number;
}

/** @param {bigint} number Integer under 29^16. @returns {number[]} */
function toGp29(number) {
  assert(number >= 0n && number < 29n ** 16n);
  const digits = Array(16).fill(0);
  let value = number;
  for (let i = 15; i >= 0; i -= 1) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

// Historical transport positive: a published 2014 onion host lies inside
// the 16-rune BASE29 integer domain and reverses exactly.
const positiveHost = 'auqgnxjtvdbll3pv';
assert.equal(toOnionHost(fromGp29(toGp29(fromOnionHost(positiveHost)))), positiveHost);

// The authenticated 2014 stage11 signed message explicitly names this host.
const signed2014 = fs.readFileSync(
  path.join(base, 'resources/historical/cicada2014-stage11-message.asc'), 'utf8'
);
assert(signed2014.includes('ky2khlqdf7qdznac.onion'));

const expected = {
  3: ['evcbbeaia3xhi3je', 'fbgi5h43sq5odwp4'],
  23: ['annttvep376tdfdy', 'gawzslode3nxl2tq']
};
const findings = [];
for (const pageNumber of [3, 23]) {
  const page = corpus.pages.find((entry) => entry.page === pageNumber);
  const pageInk = ink.pages.find((entry) => entry.page === pageNumber);
  const red16 = pageInk.red_spans.filter((entry) => entry.length === 16);
  assert.equal(red16.length, 1);
  assert.equal(red16[0].start, 0);
  const original = page.indices.slice(0, 16);
  assert.equal(original.length, 16);
  assert.equal(original.map((index) => corpus.runes[index]).join(''), red16[0].runes);
  for (let direction = 0; direction < 2; direction += 1) {
    const ordered = direction ? original.slice().reverse() : original;
    const value = fromGp29(ordered);
    assert.deepEqual(toGp29(value), ordered);
    const host = toOnionHost(value);
    assert.equal(host, expected[pageNumber][direction]);
    assert.equal(fromOnionHost(host), value);
    findings.push({ page: pageNumber, direction: direction ? 'reverse' : 'printed',
      host: host + '.onion', matchesKnown2014: known2014.has(host) });
  }
}
assert.equal(findings.length, 4);
assert(findings.every((finding) => !finding.matchesKnown2014));
console.log(JSON.stringify({
  hypothesis: 'red16 BASE29 unsigned big endian => zero-padded 80-bit Tor-v2 host',
  positiveHost,
  verifiedSignedHost: 'ky2khlqdf7qdznac.onion',
  originalFindings: findings,
  status: 'no exact match to the seven listed historical 2014 service hosts; no verified destination'
}, null, 2));
