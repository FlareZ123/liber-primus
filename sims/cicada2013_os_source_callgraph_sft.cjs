'use strict';

/**
 * Original-source, read-only 2013 Cicada OS direct script-call graph.
 * Inputs are immutable copies of the surviving source mirrors; original
 * 136,398,848-byte ISO extraction is separately verified in #467.
 * No foreign program or script is ever executed here.
 * Run: node sims/cicada2013_os_source_callgraph_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const base = path.resolve(__dirname, '..', 'resources', 'historical');

/**
 * @param {string} name
 * @param {number} size
 * @param {string} gitBlob
 * @returns {string}
 */
function source(name, size, gitBlob) {
  const data = fs.readFileSync(path.join(base, name));
  assert.equal(data.length, size);
  const digest = createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0', 'utf8'))
    .update(data)
    .digest('hex');
  assert.equal(digest, gitBlob);
  return data.toString('utf8');
}

const cicada = source(
  'cicada2013-os-original-cicada.sh',
  106,
  'd4798f10c44efc34cdf651d5054d2a7663c8e8a4'
);
const primeEcho = source(
  'cicada2013-os-original-prime-echo.sh',
  12248,
  '65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649'
);
const message = source(
  'cicada2013-os-original-message.txt',
  65,
  '93484d6a3612eb8032d4c38bf7ff3da0d358e9ac'
);

const canonicalCicada = [
  '#!/bin/ash',
  '',
  'clear',
  '/usr/local/bin/prime_echo',
  'clear',
  '',
  'cat /usr/local/bin/message.txt',
  '',
  'sleep 10',
  '',
  '/sbin/reboot',
  ''
].join('\n');
assert.equal(cicada, canonicalCicada);
assert(message.includes('The key is all around you.'));
assert.equal(message.match(/@\d+/g)?.length, 1);

/**
 * Parse the *entire* original program; reject any unrecognized operation.
 * Every echo is literally followed on its own source line by one sleep;
 * the output digits are literal source constants, not computed at runtime.
 * @param {string} sourceText
 * @returns {{primes:number[], delays:number[]}}
 */
function parsePrimeEcho(sourceText) {
  const lines = sourceText.split('\n');
  assert.equal(lines[0], '#!/bin/ash ');
  assert.equal(lines[1], '');
  assert.equal(lines.at(-1), '');
  const primes = [];
  const delays = [];
  for (const line of lines.slice(2, -1)) {
    const match = /^echo(?: -n| ) "(\d+)\t"; sleep (\.05|2)$/.exec(line);
    assert(match, 'unexpected shell action: ' + line);
    primes.push(Number(match[1]));
    delays.push(Number(match[2]));
  }
  return { primes, delays };
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
}

const actual = parsePrimeEcho(primeEcho);
const allPrimes = Array.from({ length: 3300 }, (_, i) => i + 2)
  .filter(isPrime);
assert.deepEqual(actual.primes, allPrimes);
assert.equal(actual.primes.length, 464);
assert.deepEqual(
  actual.primes.filter((p, i) => actual.delays[i] === 2),
  [1033, 3301]
);
assert(actual.delays.every(x => x === 2 || x === 0.05));

// Positive control: one data-dependent read added to either strict script
// must trip the parser / canonical startup comparison before any execution.
const doctored = primeEcho.replace('echo -n "2\t"', 'cat /tmp/wisdom');
assert.notEqual(doctored, primeEcho);
assert.throws(() => parsePrimeEcho(doctored), /unexpected shell action/);
assert.notEqual(
  cicada.replace('cat /usr/local/bin/message.txt', 'cat /tmp/wisdom'),
  canonicalCicada
);

console.log(JSON.stringify({
  directExternalFileRead: '/usr/local/bin/message.txt',
  directInvokedScript: '/usr/local/bin/prime_echo',
  primeCount: actual.primes.length,
  firstPrime: actual.primes[0],
  lastPrime: actual.primes.at(-1),
  intentionalLongPausesAfter: [1033, 3301],
  userInputOrComputedPathInScripts: false,
  namedWisdomOrFollyReadInScripts: false,
  scope: 'original startup script and all 464 literal prime_echo commands',
  control: 'unexpected computed read is rejected'
}, null, 2));
