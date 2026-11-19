#!/usr/bin/env node
'use strict';

// Fixed source hypothesis: community-reported 2014 Fibonacci-prime account
// -> F1..F43 or the 12 listed Fibonacci primes -> GP29 residues
// -> additive key on p55's source-framed 43-rune interior.
// No phase, reversal, reset, or fitted parameter search.

const assert = require('node:assert/strict');

const GP = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
];

const CIPHER = [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,
  23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
];

const INTERIOR_WORD_LENGTHS = [2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1];
const FIBONACCI_PRIMES = [
  2n, 3n, 5n, 13n, 89n, 233n, 1597n, 28657n, 514229n,
  433494437n, 2971215073n, 99194853094755497n
];

const mod29 = n => Number((BigInt(n) % 29n + 29n) % 29n);

function fibonacciThrough43() {
  let a = 1n, b = 1n;
  const out = [];
  for (let i = 1; i <= 43; i++) {
    out.push(a);
    [a, b] = [b, a + b];
  }
  return out;
}

function fibonacciPeriodMod29() {
  let a = 0, b = 1;
  for (let n = 1; n <= 1000; n++) {
    [a, b] = [b, (a + b) % 29];
    if (a === 0 && b === 1) return n;
  }
  throw new Error('Pisano period not found');
}

function decode(key, sign) {
  return CIPHER.map((c, i) => ((c + sign * key[i % key.length]) % 29 + 29) % 29);
}

function render(values) {
  return values.map(x => GP[x]).join(' ');
}

function group(values) {
  let offset = 0;
  return INTERIOR_WORD_LENGTHS.map(length => {
    const word = values.slice(offset, offset + length).map(x => GP[x]).join('');
    offset += length;
    return word;
  });
}

function evaluate(name, key) {
  assert(key.length > 0);
  const minus = decode(key, -1);
  const plus = decode(key, 1);
  return {
    name,
    key,
    minus: render(minus),
    minus_fragments: group(minus),
    plus: render(plus),
    plus_fragments: group(plus)
  };
}

const fib = fibonacciThrough43();
assert.equal(fib.length, 43);
assert.equal(fib[42], 433494437n, 'F43 must be the listed Fibonacci prime');
assert.equal(CIPHER.length, 43);
assert.equal(INTERIOR_WORD_LENGTHS.reduce((a, b) => a + b, 0), 43);
assert.equal(fibonacciPeriodMod29(), 14);

const results = [
  evaluate('F1..F43 mod 29', fib.map(mod29)),
  evaluate('listed Fibonacci-prime values mod 29', FIBONACCI_PRIMES.map(mod29)),
  evaluate('listed Fibonacci-prime totients mod 29', FIBONACCI_PRIMES.map(p => mod29(p - 1n)))
];

console.log(JSON.stringify({
  scope: 'p55 source-framed 43-rune interior; direct additive key only',
  cipher_gp29: CIPHER,
  interior_word_lengths: INTERIOR_WORD_LENGTHS,
  fibonacci_prime_values: FIBONACCI_PRIMES.map(String),
  fibonacci_key_period_mod29: fibonacciPeriodMod29(),
  results
}, null, 2));
