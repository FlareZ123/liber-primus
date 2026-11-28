'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8',
));
const tcp = fs.readFileSync(
  path.join(ROOT, 'resources/historical/2013-tcp-server-worked-examples-source.md'),
  'utf8',
);

function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function egcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

function inverse(a, m) {
  const [g, x] = egcd(a, m);
  return g === 1 ? ((x % m) + m) % m : null;
}

function modPow(base, exponent, modulus) {
  let b = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

const pages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 57)
  .sort((a, b) => a.page - b.page)
  .map((p) => ({
    page: p.page,
    count: p.runic_count,
    q: Math.floor(p.runic_count / MOD),
    r: p.runic_count % MOD,
  }));

function decodeWindow(window) {
  assert.equal(window.length, 5);

  // Raw source-only equality structure, before assigning DH names.
  if (window[2].q !== window[3].q) return null;
  if (window[3].r !== ((MOD - window[3].q) % MOD)) return null;
  if (window[1].q !== window[4].r) return null;
  if (window[1].r !== 0) return null;

  // The remaining positions define one candidate DH tuple.
  const a = window[0].q;
  const g = window[0].r;
  const A = window[1].q;
  const K = window[2].q;
  const e = window[4].q;
  const p = g + window[2].r;

  if (!prime(p) || g <= 0 || g >= p) return null;
  const b = inverse(e, p - 1);
  if (b === null) return null;
  if (modPow(g, a, p) !== A) return null;
  if (modPow(A, b, p) !== K) return null;

  const B = modPow(g, b, p);
  return { a, g, p, A, K, e, b, B };
}

const stages = {
  repeatedHigh: [],
  negativeLow: [],
  repeatedA: [],
  zeroLow: [],
  dhClosed: [],
};
const hits = [];

for (let start = 0; start + 4 < pages.length; start++) {
  const w = pages.slice(start, start + 5);
  if (w[2].q !== w[3].q) continue;
  stages.repeatedHigh.push(w[0].page);

  if (w[3].r !== ((MOD - w[3].q) % MOD)) continue;
  stages.negativeLow.push(w[0].page);

  if (w[1].q !== w[4].r) continue;
  stages.repeatedA.push(w[0].page);

  if (w[1].r !== 0) continue;
  stages.zeroLow.push(w[0].page);

  const state = decodeWindow(w);
  if (!state) continue;
  stages.dhClosed.push(w[0].page);
  hits.push({
    start: w[0].page,
    pageCounts: w.map((x) => x.count),
    base29Pairs: w.map((x) => [x.q, x.r]),
    state,
  });
}

assert.deepEqual(stages.negativeLow, [53]);
assert.deepEqual(stages.repeatedA, [53]);
assert.deepEqual(stages.zeroLow, [53]);
assert.deepEqual(stages.dhClosed, [53]);
assert.deepEqual(hits, [{
  start: 53,
  pageCounts: [179, 232, 76, 85, 95],
  base29Pairs: [[6,5], [8,0], [2,18], [2,27], [3,8]],
  state: { a: 6, g: 5, p: 23, A: 8, K: 2, e: 3, b: 15, B: 19 },
}]);

const radixHits = [];
for (let base = 2; base <= 60; base++) {
  const radixPages = corpus.pages
    .filter((p) => p.page >= 0 && p.page <= 57)
    .sort((a, b) => a.page - b.page)
    .map((p) => ({
      page: p.page,
      count: p.runic_count,
      q: Math.floor(p.runic_count / base),
      r: p.runic_count % base,
    }));

  for (let start = 0; start + 4 < radixPages.length; start++) {
    const w = radixPages.slice(start, start + 5);
    // This decoder treats q,r as two radix digits, so q must itself be a digit.
    if (w.some((x) => x.q >= base)) continue;
    if (w[2].q !== w[3].q) continue;
    if (w[3].r !== ((base - w[3].q) % base)) continue;
    if (w[1].q !== w[4].r) continue;
    if (w[1].r !== 0) continue;

    const a = w[0].q;
    const g = w[0].r;
    const A = w[1].q;
    const K = w[2].q;
    const e = w[4].q;
    const p = g + w[2].r;
    if (!prime(p) || g <= 0 || g >= p) continue;
    const b = inverse(e, p - 1);
    if (b === null) continue;
    if (modPow(g, a, p) !== A) continue;
    if (modPow(A, b, p) !== K) continue;

    radixHits.push({
      base,
      start: w[0].page,
      pairs: w.map((x) => [x.q, x.r]),
      state: { a, g, p, A, K, e, b, B: modPow(g, b, p) },
    });
  }
}
assert.deepEqual(radixHits, [{
  base: 29,
  start: 53,
  pairs: [[6,5], [8,0], [2,18], [2,27], [3,8]],
  state: { a: 6, g: 5, p: 23, A: 8, K: 2, e: 3, b: 15, B: 19 },
}]);

assert.match(tcp, /C: DH 23\s+S: 01 OK 5 8\s+C: 19\s+S: 03 DATA 2/);
assert.match(tcp, /C: BASE29 3301\s+S: 01 OK 3QO/);

const terminal = hits[0];
assert.deepEqual(
  terminal.state,
  { a: 6, g: 5, p: 23, A: 8, K: 2, e: 3, b: 15, B: 19 },
);

const output = {
  source: {
    pages: [53, 54, 55, 56, 57],
    counts: terminal.pageCounts,
    base29Pairs: terminal.base29Pairs,
    rendered: ['65', '80', '2I', '2R', '38'],
  },
  sourceOnlyPattern: {
    repeatedHigh: 'q55 = q56',
    negativeLow: 'r56 = -q56 mod29',
    repeatedA: 'q54 = r57',
    zeroLow: 'r54 = 0',
  },
  derivation: {
    a: 'q53 = 6',
    g: 'r53 = 5',
    A: 'q54 = 8',
    K: 'q55 = q56 = 2',
    e: 'q57 = 3',
    p: 'r53 + r55 = 5 + 18 = 23',
    b: 'inverse(e=3 mod p-1=22) = 15',
    checks: [
      'g^a mod p = 5^6 mod23 = 8 = A',
      'A^b mod p = 8^15 mod23 = 2 = K',
      'B = g^b mod p = 19',
    ],
  },
  reconstructedState: terminal.state,
  corpusCharge: stages,
  radixCharge: {
    bases: [2, 60],
    trueTwoDigitRequired: true,
    hits: radixHits,
  },
  historicalHoldout:
    'Matches authenticated 2013 DH 23 -> 5 8 -> 19 -> 2 exactly.',
  decision:
    'Preserve the unique p53-p57 BASE29 page-count DH decoder as a source-exact terminal-page structural result. Across bases2-60 and all consecutive five-page windows it is the sole two-digit-radix DH closure. It reconstructs the authenticated DH state without unknown-ciphertext language scoring; it does not by itself specify a body cipher.',
};

const json = JSON.stringify(output, null, 2);
console.log(json);
fs.writeFileSync(
  path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json'),
  json + '\n',
);
