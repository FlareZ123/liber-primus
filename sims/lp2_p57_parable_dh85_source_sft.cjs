'use strict';

/**
 * PARABLE 2013 metadata and 2014 p57 four-clause DH reconstruction.
 * Run from repository root: node sims/lp2_p57_parable_dh85_source_sft.cjs
 * Source-only math; no guessed LP2 unknown plaintext or ciphertext fit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = (index) => corpus.pages.find((p) => p.page === index);
const p55 = page(55), p56 = page(56), p57 = page(57);
assert.deepEqual([p55.runic_count ?? p55.indices.length, p56.runic_count ?? p56.indices.length,
  p57.runic_count ?? p57.indices.length], [76, 85, 95]);
const clauses = [[0, 7], [7, 37], [37, 67], [67, 95]];
const sums = clauses.map(([start, end]) => p57.indices.slice(start, end)
  .reduce((sum, rune) => sum + corpus.prime[rune], 0));
assert.deepEqual(sums, [449, 1259, 1031, 1229]);
assert.equal(sums.slice(1).reduce((product, value) => product * value, 1), 1595277641);

/** @param {number} x @param {number} e @param {number} mod @returns {number} */
function powMod(x, e, mod) {
  let result = 1;
  for (let base = x % mod, exponent = e; exponent > 0; exponent = Math.floor(exponent / 2), base = base * base % mod) {
    if (exponent % 2 === 1) result = result * base % mod;
  }
  return result;
}
/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}
/**
 * Small historical DH modulus allows a complete deterministic discrete-log scan.
 * @param {number} p @param {number} g @param {number} target
 * @returns {{log:number|null,order:number}}
 */
function discreteLog(p, g, target) {
  let value = 1, first = null, order = 0;
  for (let exponent = 0; exponent < p; exponent++) {
    if (value === target && first === null) first = exponent;
    value = value * g % p;
    if (value === 1) { order = exponent + 1; break; }
  }
  assert.ok(order > 0);
  return { log: first, order };
}

// Positive control is Cicada's signed 2013 DH 23 worked tuple:
// p=23, g=5, a=6, A=8, b=15, B=19, shared key=2.
assert.equal(powMod(5, 6, 23), 8);
assert.equal(powMod(5, 15, 23), 19);
assert.equal(powMod(8, 15, 23), 2);
assert.equal(powMod(19, 6, 23), 2);

// Natural printed order: title=B, three body clauses=[p,g,A].
const [B, p, g, A] = sums;
assert.ok(prime(p) && prime(g) && prime(A));
assert.ok(0 < g && g < p && 0 < A && A < p && 0 < B && B < p);
const server = discreteLog(p, g, A), client = discreteLog(p, g, B);
assert.deepEqual(server, { log: 85, order: 629 });
assert.deepEqual(client, { log: 349, order: 629 });
assert.equal(server.log, p56.indices.length); // Independent solved-page rune count.
const sharedServer = powMod(B, server.log, p);
const sharedClient = powMod(A, client.log, p);
assert.equal(sharedServer, 352);
assert.equal(sharedClient, 352);
console.log(JSON.stringify({
  sourceClauses:sums,
  signed2013Metadata:1595277641,
  auth2013DH23Shared:2,
  inferredPacket:{p,g,serverPublic:A,clientPublic:B,groupOrder:server.order,
    serverExponent:server.log,clientExponent:client.log,sharedSecret:sharedServer},
  adjacentSolvedP56OriginalRunes:p56.indices.length,
  newUnknownPlaintextRecovered:false,
  interpretation:'source-typed hypothesis; DH mode and intended consumer not author-authenticated'
},null,2));


// First source-key consumer: transfer the independently authenticated
// solved-p56 prime/totient/F-transparency rule to original p55, with DH shared
// secret352 selecting either prime index352, one-based 352nd prime at351,
// or least prime >=352 (353, zero-based index70). The first glyph of p55 is
// a source-printed continuation of p54's final word, so compare local0/local1.
// Every original ciphertext F bypass mask is enumerated, not language-fitted.
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let x = 2; primes.length < count; x++) {
    if (primes.every((q) => x % q !== 0)) primes.push(x);
  }
  return primes;
}
const primes = firstPrimes(500);
const firstAboveShared = primes.findIndex((value) => value >= sharedServer);
assert.equal(firstAboveShared, 70);
assert.equal(primes[firstAboveShared], 353);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const symbol of symbols) freq[symbol]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/**
 * Enumerate every ciphertext F bypass subset under an exact reversible
 * prime/totient encoder. sign=-1 means the authentic p56 inverse.
 * @param {number[]} cipher Native source rune indices.
 * @param {number} primeStart Starting zero-based ordinary prime ordinal.
 * @param {-1|1} sign Input operation C ± (prime-1).
 * @returns {{mask:number,plain:number[],ioc:number}[]}
 */
function decodePrimeMasks(cipher, primeStart, sign) {
  const fehuPositions = cipher.flatMap((symbol, i) => symbol === 0 ? [i] : []);
  assert.equal(fehuPositions.length, 3);
  const out = [];
  for (let mask = 0; mask < 2 ** fehuPositions.length; mask++) {
    let index = primeStart;
    const plain = [];
    let legal = true;
    for (let i = 0; i < cipher.length; i++) {
      const bypass = fehuPositions.some((position, bit) => position === i &&
        (mask & (1 << bit)) !== 0);
      const value = bypass ? 0 : (cipher[i] + sign * (primes[index++] - 1) % 29 + 29) % 29;
      if (value === 0 && !bypass) { legal = false; break; }
      plain.push(value);
    }
    if (legal) out.push({ mask, plain, ioc: ioc(plain) });
  }
  return out;
}
const keyStarts = [351, 352, firstAboveShared];
const p55KeyTests = [];
for (const primeStart of keyStarts) {
  for (const skipCarry of [0, 1]) {
    for (const sign of [-1, 1]) {
      const cipher = p55.indices.slice(skipCarry);
      const paths = decodePrimeMasks(cipher, primeStart, sign);
      p55KeyTests.push({
        primeStart, skipCarry, sign,
        legalPaths: paths.length,
        ioc: paths.map((candidate) => Number(candidate.ioc.toFixed(6)))
      });
      console.log('P55 source-DH key', primeStart, skipCarry, sign,
        'legal', paths.length, 'IoC', paths.map((candidate) => candidate.ioc.toFixed(6)).join(','));
    }
  }
}
assert.deepEqual(p55KeyTests.map((caseResult) => caseResult.legalPaths),
  [0, 2, 0, 0, 3, 0, 0, 2, 0, 4, 0, 0]);
// The planted p57 native source survives every source-chosen prime ordinal,
// with F never consuming a key, exactly as on authentic solved p56.
for (const primeStart of keyStarts) {
  const planted = p57.indices.slice(0, 76);
  let cursor = primeStart;
  const ciphertext = planted.map((value) =>
    value === 0 ? 0 : (value + primes[cursor++] - 1) % 29);
  const recovered = ciphertext.map((value, i) => {
    if (planted[i] === 0) return 0;
    // The true non-F transition is predetermined in this positive.
    return (value - (primes[primeStart + planted.slice(0, i)
      .filter((v) => v !== 0).length] - 1) % 29 + 29) % 29;
  });
  assert.deepEqual(recovered, planted);
}
console.log('PASS: the DH352 prime-index transfer to original p55 has no source-English plaintext; native GP29 plants recover 76/76.');


// New source-only self-address: DH shared352 modulo the original 95 GP runes
// lands at p57 rune offset67, the literal first F of the imperative FIND.
const p57Pointer = sharedServer % p57.indices.length;
assert.equal(p57Pointer, 67);
const wordFIND = p57.indices.slice(p57Pointer, p57Pointer + 4)
  .map((index) => corpus.translit[index]).join('');
assert.equal(wordFIND, 'FIND');
assert.equal(p57Pointer, clauses[3][0]); // Exact fourth printed stanza boundary.
assert.equal(sharedServer - client.log, 3); // Number of printed body stanzas.
const findTail = p57.indices.slice(p57Pointer);
const findCycle = findTail.concat(p57.indices.slice(0, p57Pointer));
assert.deepEqual([findTail.length, findCycle.length], [28, 95]);

/** @param {number[]} cipher @param {number[]} key @param {-1|1} sign @returns {number[]} */
function vignereGP(cipher, key, sign) {
  return cipher.map((symbol, i) => (symbol + sign * key[i % key.length] + 29) % 29);
}
const originalUnknown = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(originalUnknown.length, 12956);
for (const [name, key] of [['FIND-tail28', findTail], ['FIND-cycle95', findCycle]]) {
  const planted = vignereGP(p57.indices, key, 1);
  assert.deepEqual(vignereGP(planted, key, -1), p57.indices); // Native clear positive.
  for (const sign of [-1, 1]) {
    for (const [scope, ciphertext] of [
      ['p55-page', p55.indices], ['p55-body', p55.indices.slice(1)],
      ['whole-book', originalUnknown]
    ]) {
      const plain = vignereGP(ciphertext, key, sign);
      console.log('SOURCE pointer FIND key=' + name + ' sign=' + sign +
        ' scope=' + scope + ' exactIoC=' + ioc(plain).toFixed(6) +
        ' opening=' + plain.slice(0, 24).map((v) => corpus.translit[v]).join(''));
    }
  }
}
console.log('PASS: K352 modulo p57 length95 points exactly at FIND/last stanza; both frozen literal Vigenere key consumers fail to recover original prose.');


// A second fixed source-key use of the actual historical DH opcode is a
// multiplicative group orbit: x0=shared352, x[n+1]=1031*x[n] modulo1259;
// GP29 key output = x[n] modulo29. The original author does not instruct
// this extension, so the result is a bounded independent rival.
function dhOrbitGP(count) {
  const result = [];
  let x = sharedServer;
  for (let i = 0; i < count; i++) {
    result.push(x % 29);
    x = x * g % p;
  }
  return result;
}
assert.deepEqual(dhOrbitGP(15), [4,1,4,15,9,15,11,23,18,8,24,24,19,28,0]);
const orbitP55 = dhOrbitGP(p55.indices.length);
const orbitUnknown = dhOrbitGP(originalUnknown.length);
const orbitMetrics = [];
for (const [scope, ciphertext, key] of [
  ['p55', p55.indices, orbitP55],
  ['whole', originalUnknown, orbitUnknown]
]) {
  for (const sign of [-1, 1]) {
    const result = ciphertext.map((cipher, i) => (cipher + sign * key[i] + 29) % 29);
    orbitMetrics.push(Number(ioc(result).toFixed(6)));
    console.log('DH SOURCE orbit GP29 scope=' + scope + ' sign=' + sign +
      ' exactIoC=' + ioc(result).toFixed(6));
  }
}
assert.deepEqual(orbitMetrics, [0.030877,0.036491,0.034473,0.034470]);
const orbitClearKey = dhOrbitGP(95);
const orbitPlant = p57.indices.map((value, i) => (value + orbitClearKey[i]) % 29);
assert.deepEqual(orbitPlant.map((value, i) =>
  (value - orbitClearKey[i] + 29) % 29), p57.indices);
console.log('PASS: source-derived DH group orbit is invertible but does not recover native GP unknown-page prose.');
