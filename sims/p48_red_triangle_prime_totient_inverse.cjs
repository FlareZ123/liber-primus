'use strict';

/**
 * Source-locked original p48 / red-triangle prime-seed inverse.
 * Run: node sims/p48_red_triangle_prime_totient_inverse.cjs
 *
 * The final eight printed runes of p48, before the page-49 bridge,
 * encode 207035949198 in zero-based GP29. Divide by the prime-value
 * sum of p53's marked red stanza (2262) and by the GP prime of the
 * sole missing glyph among p40/p15/p53 red triangle (67).
 * The quotient, 1366087, is prime. Starting at that prime, test the
 * historically solved p56 phi(prime) cipher with all literal-F masks
 * across p49 (66 runes) and p51 (92 runes), passing the nonrune table.
 *
 * The original source itself is never modified or relabeled.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeGP} = require('./exponent_feedback_lookup_attack.cjs');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/lp2-transcription.txt').split('%');
const glyphs = new Map(corpus.runes.map((g, i) => [g, i]));
const p48End = [...transcript[48].matchAll(/[\u16A0-\u16FF]+/gu)].at(-1)[0];
const n48 = [...p48End].reduce((a, r) => a * 29n + BigInt(glyphs.get(r)), 0n);
assert.equal(p48End, 'ᛇᚠᚢᛞᚣᚪᛚᚠ');
assert.equal(transcript[49].match(/[\u16A0-\u16FF]/u)[0], 'ᛡ');
assert.equal(n48, 207035949198n);

const red53 = ink.pages.find(p => p.page === 53).red_spans[0];
const sum = corpus.pages.find(p => p.page === 53).indices
  .slice(red53.start, red53.start + red53.length)
  .reduce((a, i) => a + corpus.prime[i], 0);
assert.equal(sum, 2262);
const triangle = [40,15,53].flatMap(page => {
  const span = ink.pages.find(p => p.page === page).red_spans[0];
  return corpus.pages.find(p => p.page === page).indices
    .slice(span.start, span.start + span.length);
});
const missing = corpus.prime.filter((p, i) => !triangle.includes(i));
assert.deepEqual(missing, [67]);
const divisor = BigInt(sum * missing[0]);
assert.equal(n48 % divisor, 0n);
const seed = Number(n48 / divisor);
assert.equal(seed, 1366087);

/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
assert.ok(prime(seed));

/** @param {number} startPrime @param {number} count @returns {number[]} */
function phiPrimes(startPrime, count) {
  const result = [];
  for (let n = startPrime; result.length < count; n++)
    if (prime(n)) result.push((n - 1) % 29);
  return result;
}

const native = encodeGP(read('resources/control/shakespeare_first300k.txt'));
assert.equal(native.length, 218800);
const counts = new Uint32Array(29 ** 3), bigrams = new Uint32Array(29 ** 2);
for (let i = 1; i < native.length; i++) {
  bigrams[29 * native[i - 1] + native[i]]++;
  if (i > 1)
    counts[841 * native[i - 2] + 29 * native[i - 1] + native[i]]++;
}
const logp = new Float64Array(29 ** 3), alpha = .3;
for (let a = 0; a < 29; a++)
  for (let b = 0; b < 29; b++)
    for (let c = 0; c < 29; c++) {
      const index = 841 * a + 29 * b + c;
      logp[index] = Math.log((counts[index] + alpha) /
        (bigrams[29 * a + b] + 29 * alpha));
    }

/** @param {number[]} sequence @returns {number} */
function score(sequence) {
  let sum = 0, a = 0, b = 0;
  for (const c of sequence) {
    sum += logp[841 * a + 29 * b + c];
    a = b; b = c;
  }
  return sum / sequence.length;
}
/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const count = new Uint32Array(29);
  for (const x of sequence) count[x]++;
  return count.reduce((s, v) => s + v * (v - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

/**
 * Exhaust every mask on naturally occurring ciphertext-F positions.
 * Model comparison uses exact fixed-language trigram likelihood plus
 * prior p=.2 for literal nonconsuming F, as in prior solved controls.
 * @param {number[]} cipher
 * @param {number} startPrime
 * @returns {object}
 */
function solve(cipher, startPrime) {
  const fs = cipher.flatMap((c, i) => c === 0 ? [i] : []);
  assert.ok(fs.length <= 20);
  const pad = phiPrimes(startPrime, cipher.length);
  let best = null;
  for (let mask = 0; mask < 2 ** fs.length; mask++) {
    const skip = new Set(fs.filter((position, j) => mask & (1 << j)));
    let clock = 0;
    const plaintext = cipher.map((c, i) => skip.has(i)
      ? 0 : (c - pad[clock++] + 29) % 29);
    assert.equal(plaintext.length, cipher.length);
    const prior = fs.length * Math.log(.8) +
      skip.size * (Math.log(.2) - Math.log(.8));
    const objective = score(plaintext) * cipher.length + prior;
    if (!best || objective > best.objective)
      best = {mask,skips:[...skip],plaintext,objective,score:score(plaintext),
        IoC:ioc(plaintext),usedPrimes:clock};
  }
  const skip = new Set(best.skips);
  let k = 0;
  cipher.forEach((c, i) =>
    assert.equal(skip.has(i) ? 0 : (best.plaintext[i] + pad[k++]) % 29, c));
  const translit = a => a.map(x => corpus.translit[x]).join('');
  return {
    originalCipherLength:cipher.length,possibleMasks:2 ** fs.length,
    ciphertextFPositions:fs,selectedSkipPositions:best.skips,
    naturalGPScore:best.score,IoC:best.IoC,
    plaintextTransliteration:translit(best.plaintext),
    exactReencryption: cipher.length
  };
}

const known = solve(corpus.pages.find(p => p.page === 56).indices, 2);
assert.deepEqual(known.selectedSkipPositions, [56]);
assert.ok(known.plaintextTransliteration.startsWith('ANENDWITHINTHEDEEPWEB'));

const bridge = [49,51].flatMap(page =>
  corpus.pages.find(p => p.page === page).indices);
assert.equal(bridge.length, 158);
const unknown = solve(bridge, seed);
const reference = encodeGP(read('resources/control/emerson_essays_2944.txt'))
  .slice(0,bridge.length);
assert.equal(reference.length,158);
console.log(JSON.stringify({
  source:{page48Fragment:p48End,originalGP29:n48.toString(),
    redSum:sum,triangleMissingPrime:missing[0],primeSeed:seed},
  solvedPage56:{runes:known.originalCipherLength,
    masks:known.possibleMasks,skipPositions:known.selectedSkipPositions,
    GPTrigramScore:known.naturalGPScore,exactReencryption:known.exactReencryption,
    prefix:known.plaintextTransliteration.slice(0,60)},
  sourceLockedBridge:{
    pages:[49,51],gap:'original 256-byte table consumes zero prime steps',
    originalCipherIoC:ioc(bridge),...unknown
  },
  independentNativeGP:{length:reference.length,
    trigramScore:score(reference),IoC:ioc(reference)},
  conclusion:'Original plaintext and key authenticity require coherent prose; a wrong-key roundtrip is automatic'
},null,2));
