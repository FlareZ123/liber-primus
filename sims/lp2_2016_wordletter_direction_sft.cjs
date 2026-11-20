'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

// Source-ordered, one-to-one pairing only: p55's 43 strict interior GP0 values
// (cross-page-aware p57 SHED extraction, documented in
// im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md) with the 43
// alphabetic words in the authenticated 2016 signed message.
const P55_INTERIOR_GP0 = [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,
  27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18,
];
const GP_PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const EXPECTED_WORDS = [
  'Hello','The','path','lies','empty','epiphany','seeks','the','devoted',
  'Liber','Primus','is','the','way','Its','words','are','the','map','their',
  'meaning','is','the','road','and','their','numbers','are','the','direction',
  'Seek','and','you','will','be','found','Good','luck','Beware','false',
  'paths','Verify','OpenPGP',
];

const signed = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc', 'utf8');
const bodyStart = signed.indexOf('\\n\\n') + 2; // after the PGP Hash header
const signatureStart = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.ok(bodyStart >= 2 && signatureStart > bodyStart, 'signed-message body markers');
const body = signed.slice(bodyStart, signatureStart).replace(/7A35090F/g, ' ');
const words = body.match(/[A-Za-z]+/g) || [];
assert.equal(words.length, 43, '43 alphabetic signed-message words');
assert.deepEqual(words, EXPECTED_WORDS, 'fixed source-order word list');
assert.equal(P55_INTERIOR_GP0.length, 43, '43 p55 strict interiors');

function select(values, oneBased, fromRight) {
  return values.map((value, i) => {
    const word = words[i];
    let index = ((value - (oneBased ? 1 : 0)) % word.length + word.length) % word.length;
    if (fromRight) index = word.length - 1 - index;
    return word[index].toUpperCase();
  }).join('');
}

const streams = [
  {name:'GP0', values:P55_INTERIOR_GP0},
  {name:'GP-prime', values:P55_INTERIOR_GP0.map(v => GP_PRIMES[v])},
];
const results = [];
for (const stream of streams) {
  for (const oneBased of [false, true]) {
    for (const fromRight of [false, true]) {
      results.push({
        number: stream.name,
        indexing: oneBased ? 'one-based' : 'zero-based',
        direction: fromRight ? 'right-to-left' : 'left-to-right',
        output: select(stream.values, oneBased, fromRight),
      });
    }
  }
}
console.log(JSON.stringify({wordCount:words.length,interiorCount:P55_INTERIOR_GP0.length,results}, null, 2));
