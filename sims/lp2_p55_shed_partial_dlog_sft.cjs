'use strict';

/**
 * SFT: test the p55 prime/shell interpretation as a partial finite-field
 * discrete-log instance. Original source is embedded verbatim from physical p55.
 * The group interpretation remains hypothetical; no plaintext is inferred.
 * Run: node lp2_p55_shed_partial_dlog_sft.cjs
 * Node.js 22+, Windows-compatible, read-only, no external packages.
 */
const assert = require('node:assert/strict');
const alphabet = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const glyphs = new Map(alphabet.map((r, i) => [r, i]));
const page55 = [
  'ᛝ-ᚫᛗᛁᚹ-ᛋᛒ-ᛉᛗ-ᛋᛇᚷᛞᚦᚫ-ᚠᛡᚪᛒᚳᚢ-ᚹᚱ-ᛒ/',
  'ᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛇ-ᛗᛋᛞᛡᛈᚠ-ᛒᚻᛇᚳ-/',
  'ᛇᛖ-ᛠᛖᛁᚷᛉᚷᛋ-ᛖᛋᛇᚦᚦᛖᛋ-ᚦᛟ-ᚳᛠᛁᛗ/',
  'ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.',
].join('\n'); // Canonical physical p55, archive 72.jpg.
const fragments = page55.replace(/[\r\/\n&$§123457]/g, '').split(/[-.]/g).filter(Boolean);
const wordLengths = fragments.map(w => [...w].length);
assert.deepEqual(wordLengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 76);
const complete = fragments.slice(1); // p55's first rune is a genuine carry from p54.
const digits = runes => runes.map(r => {
  const value = glyphs.get(r);
  assert.notEqual(value, undefined);
  return BigInt(value);
});
const base29 = runes => digits(runes).reduce((n, digit) => 29n * n + digit, 0n);
const inside = complete.flatMap(w => [...w].slice(1, -1));
const outside = complete.flatMap(w => [[...w][0], [...w].at(-1)]);
assert.equal(inside.length, 43);
assert.equal(outside.length, 32);
const N = base29(inside);
const E = base29(outside);
assert.equal(N, 510043531279477768552291351270111060625364732293226050492113768n);
assert.equal(E, 54546906948733185277568038540584540814742666891n);
assert.equal(N % 8n, 0n);
assert.equal(E % 43n, 0n);
const P = N / 8n;
const Q = E / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q, 1268532719737981052966698570711268391040527137n);

/** @param {bigint} a @param {bigint} e @param {bigint} p */
function powMod(a, e, p) {
  let x = ((a % p) + p) % p;
  let v = 1n;
  while (e > 0n) {
    if (e & 1n) v = v * x % p;
    x = x * x % p;
    e >>= 1n;
  }
  return v;
}

/** @param {bigint} x @param {bigint} n */
function mod(x, n) { return ((x % n) + n) % n; }

/** @param {bigint} a @param {bigint} n */
function inverse(a, n) {
  let [r, nextR, t, nextT] = [n, mod(a, n), 0n, 1n];
  while (nextR !== 0n) {
    const q = r / nextR;
    [r, nextR] = [nextR, r - q * nextR];
    [t, nextT] = [nextT, t - q * nextT];
  }
  assert.equal(r, 1n);
  return mod(t, n);
}

/**
 * Baby-step/giant-step in a small subgroup of known order, without requiring
 * the (much harder) full-group discrete logarithm.
 * @param {bigint} g @param {bigint} h @param {bigint} order @param {bigint} prime
 * @returns {bigint}
 */
function subgroupLog(g, h, order, prime) {
  const step = Math.ceil(Math.sqrt(Number(order)));
  const babies = new Map();
  let value = 1n;
  for (let j = 0; j < step; j++) {
    if (!babies.has(value)) babies.set(value, j);
    value = value * g % prime;
  }
  const giantFactor = powMod(g, mod(-BigInt(step), order), prime);
  value = h;
  for (let i = 0; i <= step; i++) {
    const j = babies.get(value);
    if (j !== undefined) {
      const x = BigInt(i * step + j);
      if (x < order && powMod(g, x, prime) === h) return x;
    }
    value = value * giantFactor % prime;
  }
  throw new Error('No subgroup logarithm: original candidate group assertion failed');
}

// Complete published factorization of P-1; the 157-bit last prime prevents
// the present subgroup computation from identifying the full group logarithm.
const small = [4n, 5n, 41n, 49477n, 15535963n];
const hard = 101149063843788281988908603592862658065019147521n;
const M = small.reduce((a, b) => a * b, 1n);
assert.equal(P - 1n, M * hard);
assert.equal(powMod(Q, P - 1n, P), 1n);
for (const d of [2n, 5n, 41n, 49477n, 15535963n, hard]) {
  assert.notEqual(powMod(Q, (P - 1n) / d, P), 1n);
}
console.log('Original p55 SHED core/shell: 43/32 GP0 runes; exact replay verified');
console.log('Candidate P = ' + P + ', candidate Q = ' + Q);
console.log('Group order P-1 = ' + M + ' * ' + hard);

let x = 0n;
let product = 1n;
for (const order of small) {
  const projectedGenerator = powMod(Q, (P - 1n) / order, P);
  const projectedValue = powMod(E, (P - 1n) / order, P);
  const component = subgroupLog(projectedGenerator, projectedValue, order, P);
  assert.equal(powMod(projectedGenerator, component, P), projectedValue);
  const correction = mod((component - x) * inverse(product, order), order);
  x += product * correction;
  product *= order;
  assert.equal(x % order, component);
  console.log('DLP modulo ' + order + ': x = ' + component);
}
assert.equal(product, M);
assert.equal(x, 483581994079670n);
for (const n of small) {
  const e = (P - 1n) / n;
  assert.equal(powMod(Q, e * x, P), powMod(E, e, P));
}
assert.notEqual(powMod(Q, x, P), E, 'A partial log is not a full log');

/** @param {bigint} number */
function renderGP0(number) {
  const residues = [];
  do {
    residues.push(Number(number % 29n));
    number /= 29n;
  } while (number > 0n);
  const roman = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
  return residues.reverse().map(k => roman[k]).join('');
}
console.log('Exact partial log: x ≡ ' + x + ' (mod ' + M + ')');
console.log('Literal GP0 positional representation: ' + renderGP0(x));

// Agent11 tested the independent source 43-word signed message against public 8.
// This tests the SAME fixed seven literal exponent encodings against public E.
/** @param {string} word @param {{s:string,i:number}[]} tokens @returns {number[]} */
function encodeSignedGP0(word, tokens) {
  const input = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let at = 0; at < input.length;) {
    if (input.startsWith('ING', at)) {out.push(21); at += 3; continue;}
    if (input.startsWith('IO', at)) {out.push(27); at += 2; continue;}
    const found = tokens.find(t => input.startsWith(t.s, at));
    assert.ok(found, 'Unrecognized signed-message word ' + word);
    out.push(found.i);
    at += found.s.length;
  }
  return out;
}
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const signedDoc = fs.readFileSync(path.join(root,
  'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const signedCleartext = signedDoc.slice(signedDoc.indexOf('Hello.'),
  signedDoc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const signedWords = signedCleartext.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const sequences = signedWords.map(w => encodeSignedGP0(w, tokens));
const candidates = [
  ['first-GP0', sequences.map(v => v[0])],
  ['last-GP0', sequences.map(v => v.at(-1))],
  ['sum-GP0', sequences.map(v => v.reduce((a, b) => a + b, 0) % 29)],
  ['prime-sum', sequences.map(v => v.reduce((a, b) => a + corpus.prime[b], 0) % 29)],
  ['GP-length', sequences.map(v => v.length)],
  ['Latin-first', signedWords.map(w => w.toUpperCase().charCodeAt(0) - 65)],
  ['Latin-last', signedWords.map(w => w.toUpperCase().charCodeAt(w.length - 1) - 65)]
];
let tested = 0;
for (const [label, digits] of candidates) {
  assert.equal(digits.length, 43);
  assert.ok(digits.every(d => Number.isInteger(d) && d >= 0 && d < 29), label);
  for (const reverse of [false, true]) {
    const residue = (reverse ? digits.slice().reverse() : digits)
      .reduce((v, d) => (v * 29n + BigInt(d)) % M, 0n);
    assert.notEqual(residue, x, 'Unexpected signed exponent for original E: ' + label);
    tested++;
  }
}
assert.equal(tested, 14);
const fullBookPrimeSum = corpus.pages
  .filter(pg => pg.page <= 55 && pg.indices?.length)
  .flatMap(pg => pg.indices)
  .reduce((sum, digit) => sum + corpus.prime[digit], 0);
assert.equal(fullBookPrimeSum, 668182);
assert.ok(BigInt(fullBookPrimeSum) < x);
console.log('All ' + tested + ' first-party signed-2016 43-word literal exponents'
  + ' fail the required E public-value small-subgroup residue');
console.log('Complete unknown p0–55 rune-prime sum ' + fullBookPrimeSum
  + ' is below every possible nonnegative exponent for Q^x=E');

console.log('The large subgroup log and any unknown LP2 plaintext remain unrecovered.');
console.log('PASS: original-source conditional finite-field partial discrete log');
