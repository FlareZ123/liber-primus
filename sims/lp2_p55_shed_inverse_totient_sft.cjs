'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const g = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-page-groups-54-55-derived.json'), 'utf8'));
const alphabet = '0123456789abcdefghijklmnopqrs';

/** @param {string} s @returns {bigint} */
function base29(s) {
  return [...s].reduce((n, c) => {
    const d = alphabet.indexOf(c);
    assert(d >= 0);
    return n * 29n + BigInt(d);
  }, 0n);
}

/** @param {string[]} words */
function split(words) {
  const inside = words.map(w => w.slice(1, -1)).join('');
  const outside = words.map(w => w.length === 1 ? w : w[0] + w.at(-1)).join('');
  return { insideLength: inside.length, outsideLength: outside.length, inside: base29(inside), outside: base29(outside) };
}

const local = split(g.p55.groups.slice(1));
const page = split(g.p55.groups);
const whole = split([g.p54.body_groups.at(-1) + g.p55.groups[0], ...g.p55.groups.slice(1)]);
assert.deepEqual([local.insideLength, local.outsideLength, page.insideLength, page.outsideLength, whole.insideLength, whole.outsideLength], [43, 32, 43, 33, 52, 34]);
const P = 63755441409934721069036418908763882578170591536653256311514221n;
// P's exact Pratt certificate: lp2_p55_shed_prime_shell_sft.cjs.
assert.equal(local.inside, 8n * P);
assert.equal(page.inside, local.inside);
assert(P - 1n > 8n);
// If phi(n)=8P, then P | r^(a-1) or P | r-1 for some prime r|n.
// In the first case r=P, a>=2, and P-1 must divide 8P: impossible.
// Otherwise r-1=kP, where k divides 8. Each possible r is composite.
const witnesses = [[1n, 2n], [2n, 61n], [4n, 3n], [8n, 547n]];
assert.notEqual(8n * P % (P - 1n), 0n);
for (const [k, q] of witnesses) {
  const r = k * P + 1n;
  assert(q > 1n && q < r);
  assert.equal(r % q, 0n);
  console.log('r = ' + k + 'P+1 is composite; proper factor ' + q);
}
assert(local.outside > 1n && local.outside % 2n === 1n);
assert(whole.inside > 1n && whole.inside % 2n === 1n);
for (const [name, row] of Object.entries({local, page, whole})) {
  console.log(name, JSON.stringify(row, (_, x) => typeof x === 'bigint' ? String(x) : x));
}
console.log('PASS: literal inverse-totient pair rejected for all three framings, conditional on the existing P certificate.');
