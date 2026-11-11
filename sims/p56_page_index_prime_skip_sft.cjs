'use strict';

/**
 * SFT: test the literal solved-p56 prime decoder as a page-local rule.
 *
 * Historical p56 mechanics:
 *   - page-local consecutive primes starting 2,3,5,...
 *   - plaintext index = ((cipherIndex - prime) mod 29) + 1 mod 29
 *   - the zero-based rune whose position equals the physical page number is
 *     passed through unchanged and does not consume a prime.
 *
 * The experiment applies exactly that rule to every rune-bearing LP2 page.
 */

const fs = require('fs');
const assert = require('assert');

const corpus = JSON.parse(
  fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8')
);

function makePrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const maxLen = Math.max(...corpus.pages.map((page) => page.runic_count));
const primes = makePrimes(maxLen + 1);

function decodePage(page) {
  let primeIndex = 0;
  return page.indices.map((cipher, position) => {
    if (position === page.page) return cipher;

    const prime = primes[primeIndex];
    primeIndex += 1;
    const zeroBased = ((cipher - prime) % 29 + 29) % 29;
    return (zeroBased + 1) % 29;
  });
}

function indexOfCoincidence(values) {
  if (values.length < 2) return 0;
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

function transliterate(values) {
  return values.map((value) => corpus.translit[value]).join('');
}

const decoded = corpus.pages
  .filter((page) => page.indices.length > 0)
  .map((page) => {
    const values = decodePage(page);
    return {
      page: page.page,
      length: values.length,
      ioc: indexOfCoincidence(values),
      text: transliterate(values),
    };
  });

const p56 = decoded.find((row) => row.page === 56);
assert(p56, 'missing solved p56 control');
assert.strictEqual(
  p56.text,
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
);

const unsolved = decoded.filter((row) => row.page <= 55);
const ranked = [...unsolved].sort((a, b) => b.ioc - a.ioc);
const max = ranked[0];
const min = ranked[ranked.length - 1];

console.log('p56 positive control');
console.log(`  length=${p56.length}`);
console.log(`  IoC=${p56.ioc.toFixed(12)}`);
console.log(`  plaintext=${p56.text}`);
console.log('');
console.log('unsolved LP2 pages under the identical page-index skip rule');
console.log(`  max IoC: p${max.page} = ${max.ioc.toFixed(12)}`);
console.log(`  min IoC: p${min.page} = ${min.ioc.toFixed(12)}`);
console.log('  top 10:');
for (const row of ranked.slice(0, 10)) {
  console.log(
    `    p${String(row.page).padStart(2, '0')} n=${String(row.length).padStart(3, ' ')} IoC=${row.ioc.toFixed(12)} sample=${row.text.slice(0, 72)}`
  );
}

assert(p56.ioc > max.ioc, 'an unsolved page unexpectedly exceeds the solved p56 control IoC');

console.log('');
console.log('PASS: the exact p56 page-number pass-through decoder reproduces p56,');
console.log('while every unsolved rune-bearing page remains far below that control.');
