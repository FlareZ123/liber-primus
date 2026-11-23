'use strict';

/**
 * Single-file test for a provisional cross-artifact DH-shaped coincidence.
 *
 * Usage, from the repository root on Windows 11:
 *   node sims/lp2_dh331_red13_twoanchor_source_sft.cjs
 *
 * The original 2013 signed TCP challenge specifies the one-sided server
 * operations A = g^a mod p and K = B^a mod p. This file tests whether an
 * independently readable set of manuscript/distribution operands reproduces
 * two canonical numeric-table cells. It does not assert an LP2 decryption.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const p0Source = load('resources/liber-primus/lp2-p0-physical-ink-override.json');
const grid = load('resources/liber-primus/base60-grid.json');
const html = fs.readFileSync(
  path.join(root, 'resources/historical/cicada2014-onion7-original-index.html'),
  'utf8'
);

/** @param {bigint} base @param {bigint} exp @param {bigint} modulus */
function modPow(base, exp, modulus) {
  let result = 1n;
  let power = ((base % modulus) + modulus) % modulus;
  let n = exp;
  while (n > 0n) {
    if (n % 2n === 1n) result = result * power % modulus;
    power = power * power % modulus;
    n /= 2n;
  }
  return result;
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values */
function transliterate(values) {
  return values.map((n) => corpus.translit[n]).join(' ');
}

function main() {
  console.log('=== Original-source 331 / 13 / 16 DH-shaped two-anchor gate ===');

  assert.equal(modPow(5n, 6n, 23n), 8n, 'historic DH public-share control');
  assert.equal(modPow(19n, 6n, 23n), 2n, 'historic DH shared-value control');
  console.log('2013 signed TCP DH worked example: p=23 g=5 a=6 B=19, A=8 K=2 [PASS]');

  const first = p0Source.physical_zero_based.red_words;
  assert.deepEqual(first.map((w) => w.length), [8, 5]);
  const gpPrimeSums = first.map((w) =>
    w.gp_indices.reduce((sum, x) => sum + corpus.prime[x], 0));
  assert.deepEqual(gpPrimeSums, [347, 315]);
  const marker = p0Source.physical_zero_based.large_punctuation[0];
  assert.equal(marker.after_runes, 13);
  assert.equal(marker.dots, 13);
  assert.equal(marker.ink, 'red');

  const titleMatch = html.match(/<title>(\d+)<\/title>/i);
  const divMatch = html.match(/<div id="(\d+)"/i);
  assert.ok(titleMatch);
  assert.ok(divMatch);
  const B = Number(titleMatch[1]);
  const p = Number(divMatch[1]);
  const g = (gpPrimeSums[0] - gpPrimeSums[1]) / 2;
  const a = marker.dots;
  assert.equal((gpPrimeSums[0] + gpPrimeSums[1]) / 2, p);
  assert.deepEqual({ p, g, a, B }, { p: 331, g: 16, a: 13, B: 133 });

  const A = Number(modPow(BigInt(g), BigInt(a), BigInt(p)));
  const K = Number(modPow(BigInt(B), BigInt(a), BigInt(p)));
  assert.deepEqual({ A, K }, { A: 203, K: 108 });
  const misleadingHtmlExponentK = Number(modPow(BigInt(B), BigInt(B), BigInt(p)));
  assert.equal(misleadingHtmlExponentK, 133);
  assert.notEqual(misleadingHtmlExponentK, K);
  console.log('Competing a=133 (HTML title as exponent) predicts K=133;');
  console.log('original 13-dot a=13 instead predicts both table anchors.');
  console.log('2014 HTML p/B:', p, B);
  console.log('Original p0 red-word prime sums:', gpPrimeSums);
  console.log('p0 first red13-dot mark supplies a:', a);
  console.log('DH-shaped p/g/a/B:', [p, g, a, B], '=> A/K:', [A, K]);

  const p6 = ink.pages.find((page) => page.page === 6);
  const red = p6.red_spans[0];
  assert.equal(red.start, 71);
  assert.equal(red.length, 11);
  const firstRedWord = Array.from(red.runes).slice(0, 4);
  const index = firstRedWord.reduce((sum, rune) => {
    const value = corpus.runes.indexOf(rune);
    assert.ok(value >= 0);
    return sum + value;
  }, 0);
  assert.equal(index, 71);
  console.log('Original p6 first red-word GP0 sum/start:', index, red.start);

  const tokens = grid.rows.flat();
  const sourceBytes = grid.byte_rows.flat();
  assert.equal(tokens.length, 256);
  assert.equal(sourceBytes.length, 256);
  const alpha60 = grid.alphabet;
  const alpha59 = alpha60.replace('f', '');
  assert.equal(alpha60.length, 60);
  assert.equal(alpha59.length, 59);

  /** @param {string} token @param {string} alphabet */
  function numberFromToken(token, alphabet) {
    return alphabet.indexOf(token[0]) * alphabet.length +
      alphabet.indexOf(token[1]);
  }
  const b60 = tokens.map((token) => numberFromToken(token, alpha60));
  const b59 = tokens.map((token) => numberFromToken(token, alpha59));
  assert.deepEqual(b60, sourceBytes);
  assert.deepEqual([tokens[0], b60[0], b59[0]], ['3N', 203, 200]);
  assert.deepEqual([tokens[index], b60[index], b59[index]], ['1m', 108, 106]);
  assert.equal(b60[0], A);
  assert.equal(b60[index], K);
  assert.notEqual(b59[0], A);
  assert.notEqual(b59[index], K);
  console.log('p50 cell0 (A):', tokens[0], 'radix60', b60[0], 'radix59', b59[0]);
  console.log('p50 cell71 (K):', tokens[index], 'radix60', b60[index],
    'radix59', b59[index]);
  console.log('Two exact source-conditioned outputs under radix60 [PASS]');

  const subgroup = [];
  let x = 1;
  do {
    subgroup.push(x);
    x = x * g % p;
  } while (x !== 1);
  assert.equal(subgroup.length, 15);
  assert.equal(subgroup.includes(B), false);
  console.log('Critical rival: order_331(16)=15; B=133 is not in <16>.');
  console.log('This is a one-sided 2013-server computation, not a valid');
  console.log('two-party shared-generator Diffie-Hellman exchange.');
  console.log('The table has 161 distinct byte values, so repeated powers');
  console.log('of the same base16 cannot generate its 256 bytes.');

  const page32 = corpus.pages.find((page) => page.page === 32).indices;
  assert.equal(page32.length, 121);
  const key = page32.map((_, i) =>
    Number(modPow(BigInt(B), BigInt(a + i), BigInt(p)) % 29n));
  for (const sign of [-1, 1]) {
    const candidate = page32.map((c, i) => (c + sign * key[i] + 29) % 29);
    const replay = candidate.map((q, i) => (q - sign * key[i] + 29) % 29);
    assert.deepEqual(replay, page32);
    console.log('Source-adjacent exponent-counter original p32 trial:',
      'sign', sign, 'length', candidate.length, 'IoC', ioc(candidate).toFixed(8));
    console.log('  first 50 GP symbols:', transliterate(candidate.slice(0, 50)));
  }
  console.log('No authenticated original plaintext/decoder was derived.');
  console.log('Two matched cells were noticed retrospectively: NOT a blind');
  console.log('holdout, not a justified global probability, and not proof');
  console.log('of the intended radix, key, or cipher. All source checks PASS.');
}
main();
