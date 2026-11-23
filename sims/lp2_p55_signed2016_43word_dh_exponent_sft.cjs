'use strict';
/**
 * Finite original-source gate: are the authenticated 2016 message's
 * exactly 43 words the 43 BASE29 digits of the original p55 finite-field
 * Diffie-Hellman private exponent, under basic acrostic/checksum readings?
 *
 * SFT: node sims/lp2_p55_signed2016_43word_dh_exponent_sft.cjs
 * Windows 11 / Node.js 22, built-ins only, no writes or network.
 * No recovered plaintext or author-selected opcode is asserted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const message = signed.slice(signed.indexOf('Hello.'),
  signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
const signedWords = message.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
assert.deepEqual(signedWords.slice(-4), ['false', 'paths', 'Verify', 'OpenPGP']);
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]} */
function gpEncode(word) {
  const text = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let at = 0; at < text.length;) {
    if (text.startsWith('ING', at)) {out.push(21); at += 3; continue;}
    if (text.startsWith('IO', at)) {out.push(27); at += 2; continue;}
    const next = tokens.find(token => text.startsWith(token.s, at));
    assert.ok(next, 'unencodable signed word ' + word);
    out.push(next.i);
    at += next.s.length;
  }
  return out;
}
/** @param {number[]} digits @returns {bigint} */
const fromBase29 = digits =>
  digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function powMod(base, exponent, modulus) {
  let out = 1n;
  for (; exponent > 0n; exponent >>= 1n, base = base * base % modulus) {
    if (exponent & 1n) out = out * base % modulus;
  }
  return out;
}

// Reconstruct field operands from all original physical p55 runes.
const source = corpus.pages.find(page => page.page === 55).indices;
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(source.length, 76);
assert.equal(source[0], 21); // word carry from physical p54
let at = 1;
const words = lengths.map(length => {
  const w = source.slice(at, at + length);
  assert.equal(w.length, length);
  at += length;
  return w;
});
assert.equal(at, 76);
const inner = words.flatMap(w => w.slice(1, -1));
const outer = words.flatMap(w => [w[0], w[w.length - 1]]);
assert.deepEqual([inner.length, outer.length], [43, 32]);
const N = fromBase29(inner), E = fromBase29(outer);
assert.equal(N % 8n, 0n);
assert.equal(E % 43n, 0n);
const P = N / 8n, Q = E / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q, 1268532719737981052966698570711268391040527137n);
const M = 630311729907820n;
assert.equal((P - 1n) % M, 0n);
// Independently verified exact partial logarithm for A=8.
const requiredPrivateModM = 97883509924151n;
assert.equal(powMod(Q, requiredPrivateModM * ((P - 1n) / M), P),
  powMod(8n, (P - 1n) / M, P));

const encodings = signedWords.map(gpEncode);
const candidates = [
  ['first-GP0', encodings.map(w => w[0])],
  ['last-GP0', encodings.map(w => w[w.length - 1])],
  ['sum-GP0', encodings.map(w => w.reduce((x, v) => x + v, 0) % 29)],
  ['prime-sum', encodings.map(w =>
    w.reduce((x, v) => x + corpus.prime[v], 0) % 29)],
  ['word-GP-length', encodings.map(w => w.length)],
  ['Latin-A0-first', signedWords.map(w => w.toUpperCase().charCodeAt(0) - 65)],
  ['Latin-A0-last', signedWords.map(w =>
    w.toUpperCase().charCodeAt(w.length - 1) - 65)]
];
const decisions = [];
for (const [name, digits] of candidates) {
  assert.equal(digits.length, 43);
  assert(digits.every(x => Number.isInteger(x) && x >= 0 && x <= 28));
  for (const reversed of [false, true]) {
    const exponent = fromBase29(reversed ? digits.slice().reverse() : digits);
    const partial = exponent % M;
    const publicValue = powMod(Q, exponent, P);
    const matches8 = publicValue === 8n;
    const matches43 = publicValue === 43n;
    assert.ok(!matches8 || partial === requiredPrivateModM);
    assert.equal(matches8, false);
    assert.equal(matches43, false);
    decisions.push({name, reversed, exponentBits: exponent.toString(2).length,
      matchesRequiredSmoothLog:partial === requiredPrivateModM,
      publicMatches8:matches8, publicMatches43:matches43});
  }
}
// Algebraic positive: a constructed exponent projecting to the known
// exact smooth-order log necessarily passes the same projection gate.
const planted = requiredPrivateModM + 42n * M;
assert.equal(planted % M, requiredPrivateModM);
assert.equal(powMod(Q, planted * ((P - 1n) / M), P),
  powMod(8n, (P - 1n) / M, P));
assert.equal(decisions.length, 14);
console.log(JSON.stringify({
  originalPage55:{interiorRunes:43, exteriorRunes:32,
    p:P.toString(),g:Q.toString()},
  signed2016Words:signedWords.length, testedExplicitExponents:decisions.length,
  requiredDHPrivateResidueModM:requiredPrivateModM.toString(),
  smoothOrderM:M.toString(), candidates:decisions,
  plantedSmoothLogPositive:true, plaintextRecovered:false,
  decision:'Fourteen literal acrostic/length/checksum 43-word private exponents fail exact original Q^x=8 DH equation; does not exclude unspecified 2016 word cipher.'
}, null, 2));
