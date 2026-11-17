'use strict';

/**
 * Source-locked conditional "THE END" crib at LP2 p27 and p55.
 * Enumerate all literal-F bypass masks for a reversible GP29 plaintext
 * autokey with lag 5 or 6 and algebraic sign +/-.
 * "THE END" is conjectural, not authenticated unknown plaintext.
 *
 * Run with Node.js 22; only built-in modules are used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(root, 'utf8'));
const CRIB = [16, 8, 18, 18, 9, 23];
const mod = n => (n % 29 + 29) % 29;

/**
 * @param {number[]} ciphertext - Original physical page runes.
 * @param {number} anchor - Page-local first ciphertext rune of DJU.
 * @param {number} lag - Previous-plaintext feedback distance.
 * @param {1|-1} sign - C=P+sign*P[i-lag] modulo 29.
 * @param {number[]} skips - Transparent original ciphertext-F positions.
 */
function decode(ciphertext, anchor, lag, sign, skips) {
  const bypass = new Set(skips);
  const consumed = ciphertext.map((c, at) => ({ c, at })).filter(row => !bypass.has(row.at));
  const C = consumed.map(row => row.c);
  const start = consumed.findIndex(row => row.at === anchor);
  assert(start >= lag);
  const P = new Array(C.length).fill(null);
  for (let i = 0; i < 6; i++) {
    assert.equal(consumed[start + i].at, anchor + i);
    P[start + i] = CRIB[i];
  }
  let conflicts = 0;
  for (let i = start + 5; i >= lag; i--) {
    const prev = mod(sign * (C[i] - P[i]));
    if (P[i - lag] !== null && P[i - lag] !== prev) conflicts++;
    else P[i - lag] = prev;
  }
  for (let i = start + 6; i < C.length; i++) P[i] = mod(C[i] - sign * P[i - lag]);
  assert(P.every(v => v !== null));
  // Historical plaintext-F transparency forbids any encrypted plaintext F.
  conflicts += P.filter(v => v === 0).length;
  for (let i = lag; i < C.length; i++) {
    if (mod(P[i] + sign * P[i - lag]) !== C[i]) conflicts++;
  }
  const out = [];
  let j = 0;
  for (let i = 0; i < ciphertext.length; i++) out.push(bypass.has(i) ? 0 : P[j++]);
  const freq = new Array(29).fill(0);
  for (const v of out) freq[v]++;
  const ioc = freq.reduce((a, v) => a + v * (v - 1), 0) / (out.length * (out.length - 1));
  return { ok: conflicts === 0, conflicts, out, ioc, skips };
}

/**
 * @param {number[]} ciphertext
 * @param {number} anchor
 * @param {number} lag
 * @param {1|-1} sign
 */
function enumerate(ciphertext, anchor, lag, sign) {
  const f = ciphertext.flatMap((v, i) => v === 0 ? [i] : []);
  const valid = [];
  for (let mask = 0; mask < 2 ** f.length; mask++) {
    const skipped = f.filter((_, bit) => (mask & 2 ** bit) !== 0);
    const result = decode(ciphertext, anchor, lag, sign, skipped);
    if (result.ok) valid.push(result);
  }
  valid.sort((a, b) => b.ioc - a.ioc);
  return { total: 2 ** f.length, valid };
}

// Positive control: literal F is emitted unchanged, and consumes no
// plaintext-feedback state. Five unknown initial-key runes are permitted.
const plant = [3, 6, 11, 0, 7, 9, 12, 1, 4, 8, 5, ...CRIB];
const consumedPlain = [];
const encoded = [];
for (const symbol of plant) {
  if (symbol === 0) encoded.push(0);
  else {
    const i = consumedPlain.length;
    encoded.push(mod(symbol + (i < 5 ? i + 1 : consumedPlain[i - 5])));
    consumedPlain.push(symbol);
  }
}
const positive = decode(encoded, 11, 5, 1, [3]);
assert(positive.ok);
assert.deepEqual(positive.out, plant);
console.log('PASS: 17-rune planted GP29 plaintext with literal-F transparency');

const cases = [];
for (const [page, anchor] of [[27, 28], [55, 70]]) {
  const ciphertext = corpus.pages.find(p => p.page === page).indices;
  assert.deepEqual(ciphertext.slice(anchor, anchor + 6), [23, 11, 1, 17, 18, 10]);
  for (const lag of [5, 6]) {
    for (const sign of [1, -1]) {
      const { total, valid } = enumerate(ciphertext, anchor, lag, sign);
      const best = valid[0];
      cases.push({
        page, anchor, lag, sign,
        originalCiphertextCount: ciphertext.length,
        bypassMasks: total, validMasks: valid.length,
        bestIoc: best ? Number(best.ioc.toFixed(8)) : null,
        bestSkipMask: best ? best.skips : null,
        bestPlaintextHead: best ? best.out.slice(0, 40).map(i => corpus.translit[i]).join('') : null
      });
    }
  }
}
const counts = Object.fromEntries(cases.map(c => [`p${c.page}/lag${c.lag}/sign${c.sign}`, c.validMasks]));
assert.deepEqual(counts, {
  'p27/lag5/sign1': 12, 'p27/lag5/sign-1': 0,
  'p27/lag6/sign1': 0, 'p27/lag6/sign-1': 0,
  'p55/lag5/sign1': 0, 'p55/lag5/sign-1': 0,
  'p55/lag6/sign1': 0, 'p55/lag6/sign-1': 4
});
console.log(JSON.stringify({ conditionalCrib: 'DJU BEI -> THE END', cases }, null, 2));
