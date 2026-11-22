/**
 * Original 2014 Onion7 signed handoff: prime-valued horizontal margins.
 * The trailing and blank-line whitespace bytes are NOT PGP-authenticated.
 * This is a source candidate, not a recovered LP2 cipher/key.
 * Run: node sims/lp2_2014_release_whitespace_prime19_sft.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} filepath */
const read = (filepath) => fs.readFileSync(path.join(root, filepath), 'utf8');
const signed = read('resources/historical/cicada2014-stage11-message.asc');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const first12 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
assert.deepEqual(corpus.prime.slice(0, 12), first12);
const signedStart = signed.indexOf('Hash: SHA1');
const signedEnd = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.ok(signedStart > 0 && signedEnd > signedStart);
const lines = signed.slice(signedStart + 'Hash: SHA1'.length, signedEnd).split(/\r?\n/);

/** @type {{line: number, side: string, spaces: number}[]} */
const margins = [];
for (const [i, line] of lines.entries()) {
  if (/^ +$/.test(line)) {
    margins.push({ line: i + 1, side: 'blank', spaces: line.length });
  } else {
    const lead = /^ +/.exec(line)?.[0].length || 0;
    const tail = / +$/.exec(line)?.[0].length || 0;
    if (lead > 0) margins.push({ line: i + 1, side: 'leading', spaces: lead });
    if (tail > 0) margins.push({ line: i + 1, side: 'trailing', spaces: tail });
  }
}
const sourcePrimeRuns = margins.map(x => x.spaces);
const expected = first12.filter(p => p !== 19);
assert.deepEqual(sourcePrimeRuns, expected);
const missing = first12.filter(p => !sourcePrimeRuns.includes(p));
assert.deepEqual(missing, [19]);
const missingRune = corpus.translit[corpus.prime.indexOf(missing[0])];
assert.equal(missingRune, 'W');
const keyIndex = sourcePrimeRuns.map(p => corpus.prime.indexOf(p));
assert.deepEqual(keyIndex, [0,1,2,3,4,5,6,8,9,10,11]);
const keyValues = sourcePrimeRuns.map(p => p % 29);

/** @param {number[]} source @param {number[]} key @param {number} sign */
function decode(source, key, sign) {
  return source.map((x, i) => (x + sign * key[i % key.length] % 29 + 29) % 29);
}
/** @param {number[]} xs */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, c) => s + c * (c-1), 0) / (xs.length * (xs.length - 1));
}
const windows = {
  p0to2: corpus.pages.filter(x => x.page <= 2).flatMap(x => x.indices),
  p55: corpus.pages.find(x => x.page === 55).indices
};
assert.equal(windows.p0to2.length, 729);
assert.equal(windows.p55.length, 76);
const outputs = [];
for (const [window, ciphertext] of Object.entries(windows)) {
  for (const key of [{ label: 'prime-counts', digits: keyValues },
                     { label: 'GP-prime-ordinals', digits: keyIndex }]) {
    for (const sign of [-1, +1]) {
      const plaintext = decode(ciphertext, key.digits, sign);
      outputs.push({
        window, key: key.label, sign, sourceIoC: ioc(ciphertext),
        decipheredIoC: ioc(plaintext),
        first40: plaintext.slice(0, 40).map(x => corpus.translit[x]).join(' ')
      });
    }
  }
}
assert.ok(outputs.filter(x => x.window === 'p0to2').every(x => x.decipheredIoC < 0.04));
assert.ok(outputs.filter(x => x.window === 'p55').every(x => x.decipheredIoC < 0.04));
console.log(JSON.stringify({
  source: '2014 original Stage11 Onion7 PGP cleartext', margins,
  orderedPrimeMargins: sourcePrimeRuns, missingGPPrime: 19,
  missingRune, keyIndex, caveat: 'trailing and blank-only spaces are excluded from OpenPGP signature coverage',
  keyTests: outputs, recoveredUnknownLP2Plaintext: false
}, null, 2));
