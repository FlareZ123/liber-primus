'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = new Map(source.pages.map((p) => [p.page, p.indices]));
const mod = (x) => ((x % 29) + 29) % 29;
const total = (a) => a.reduce((s, x) => mod(s + x), 0);
const ioc = (a) => {
  const freq = new Array(29).fill(0);
  for (const x of a) freq[x]++;
  return freq.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
};
const read = (a) => a.map((x) => source.translit[x]).join('');

function difference(a, b, align) {
  const n = Math.max(a.length, b.length);
  const pad = (xs) => align === 'start'
    ? xs.concat(new Array(n - xs.length).fill(0))
    : new Array(n - xs.length).fill(0).concat(xs);
  const x = pad(a);
  const y = pad(b);
  return x.map((v, i) => mod(v - y[i]));
}

function divideByXMinusOne(d) {
  const q = [d[0]];
  for (let i = 1; i < d.length - 1; i++) q.push(mod(d[i] + q[i - 1]));
  const remainder = mod(d[d.length - 1] + q[q.length - 1]);
  const forward = [q[0]];
  for (let i = 1; i < q.length; i++) forward.push(mod(q[i] - q[i - 1]));
  forward.push(mod(-q[q.length - 1]));
  assert.deepEqual(forward, d);
  return {q, remainder};
}

const unsolved = source.pages.filter((p) => p.page <= 55);
assert.equal(unsolved.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(unsolved.filter((p) => p.indices.length > 0).length, 55);
const fib = [8, 13, 21, 34, 55];
const residues = fib.map((n) => total(page.get(n)));
assert.deepEqual(residues, [11, 10, 10, 1, 1]);
assert.equal(residues[1], residues[2]);
assert.equal(residues[3], residues[4]);
assert.equal(residues[0], mod(residues[1] + residues[3]));

const ranges = [
  [Array.from({length: 7}, (_, i) => 8 + i), Array.from({length: 7}, (_, i) => 8 + i)],
  [Array.from({length: 8}, (_, i) => 15 + i)],
  [Array.from({length: 7}, (_, i) => 33 + i)],
  [[54, 55]]
];
let alternatives = 0;
let pairMatches = 0;
let fullMatches = 0;
const fullAssignments = [];
for (const n8 of ranges[0][0])
  for (const n13 of ranges[0][1]) {
    if (n8 === n13) continue;
    for (const n21 of ranges[1][0])
      for (const n34 of ranges[2][0])
        for (const n55 of ranges[3][0]) {
          alternatives++;
          if (total(page.get(n13)) !== total(page.get(n21))) continue;
          if (total(page.get(n34)) !== total(page.get(n55))) continue;
          pairMatches++;
          if (total(page.get(n8)) !== mod(total(page.get(n13)) + total(page.get(n34)))) continue;
          fullMatches++;
          fullAssignments.push([n8, n13, n21, n34, n55]);
        }
  }
assert.equal(alternatives, 4704);
assert.equal(pairMatches, 18);
assert.equal(fullMatches, 2);
assert.deepEqual(fullAssignments, [[8, 11, 21, 34, 55], [8, 13, 21, 34, 55]]);
console.log('Fibonacci pages / GP29 index residues:', fib.map((p, i) => p + ':' + residues[i]).join(' '));
console.log('Chapter-conditioned alternative allocations:', {alternatives, pairMatches, fullMatches, fullAssignments});
console.log('Conditional full-match fraction:', fullMatches / alternatives);

for (const [a, b] of [[13, 21], [34, 55]]) {
  for (const align of ['start', 'end']) {
    const d = difference(page.get(a), page.get(b), align);
    const {q, remainder} = divideByXMinusOne(d);
    assert.equal(remainder, 0);
    console.log('Original polynomial inverse', {
      pages: [a, b], align, length: q.length, remainder,
      quotientIoC: ioc(q), first80GP: read(q.slice(0, 80))
    });
  }
}

// Exact synthetic forward control using independently known clear p57 GP runes.
// Multiplying Q(X) by (X-1) must invert to the original message exactly.
const known = page.get(57);
assert.equal(known.length, 95);
const planted = [known[0]];
for (let i = 1; i < known.length; i++) planted.push(mod(known[i] - known[i - 1]));
planted.push(mod(-known[known.length - 1]));
const got = divideByXMinusOne(planted);
assert.equal(got.remainder, 0);
assert.deepEqual(got.q, known);
console.log('Solved-p57 95-rune quotient positive control PASS:', {
  recovered: known.length, ioc: ioc(got.q)
});
