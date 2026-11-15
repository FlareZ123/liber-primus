'use strict';

/**
 * Exact-source reconstruction of the archived 2013 CicadaOS prime_echo program.
 * Repro: node sims/lp2_2013_prime_echo_source_sft.cjs
 * Historical source: neuroretransmit/cicada at ade9a02889ef8acbc8cde8edbfd0a785c369f4c3.
 * This checks script-emitted text, not a native TinyCore/BusyBox boot replay.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const sourcePath = path.resolve(__dirname, '..', 'resources', 'historical',
  'cicada2013-os-original-prime-echo.sh');
const source = fs.readFileSync(sourcePath, 'utf8');
const lines = source.split(/\r?\n/).filter(line => /^echo\s/.test(line));
/** @type {Array<{prime:number, noNewline:boolean, sleep:number}>} */
const commands = lines.map((line, i) => {
  const match = /^echo\s+(-n\s+)?\"(\d+)\t\";\s*sleep\s+([0-9.]+)$/.exec(line);
  assert.ok(match, 'Bad original echo/sleep grammar at command ' + (i + 1));
  return { prime: Number(match[2]), noNewline: Boolean(match[1]), sleep: Number(match[3]) };
});

const primes = [];
for (let n = 2; n <= 3301; n++) {
  let prime = true;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
assert.equal(commands.length, 464);
assert.deepEqual(commands.map(x => x.prime), primes);
for (let i = 0; i < commands.length; i++) {
  const c = commands[i];
  assert.equal(c.noNewline, (i + 1) % 10 !== 0,
    'Original line break differs at prime ordinal ' + (i + 1));
  assert.equal(c.sleep, c.prime === 1033 || c.prime === 3301 ? 2 : 0.05);
}
assert.equal(commands[173].prime, 1033);
assert.equal(commands[463].prime, 3301);
const stdout = Buffer.from(commands.map(c =>
  String(c.prime) + '\t' + (c.noNewline ? '' : '\n')).join(''), 'utf8');
const digest = crypto.createHash('sha256').update(stdout).digest('hex');
assert.equal(stdout.length, 2169);
assert.equal(digest, 'a85ad06dd742fa2b76b3e187accbfbd3691622273a1975ee38306ccd27a31b69');
assert.equal(stdout.toString('utf8').split('\n').length - 1, 46);
console.log('[PASS] source commands 464; primes 2..3301 without omissions');
console.log('[PASS] 1033: ordinal 174, sleep 2s; 3301: ordinal 464, sleep 2s');
console.log('[PASS] ordinary delay 0.05s; newline every 10 primes');
console.log('[PASS] reconstructed stdout 2169 bytes; SHA256 ' + digest);
console.log('[SCOPE] exact archived-script reconstruction; no original LP2 key, alignment or plaintext');
