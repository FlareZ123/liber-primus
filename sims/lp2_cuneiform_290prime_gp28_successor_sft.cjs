'use strict';

// Reproducible bounded inverse for the source-selected 2013 prime_echo 290-prime
// interval and the ciphertext-motivated GP28 predecessor-exclusion cipher.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources/historical/cicada2013-os-original-prime-echo.sh'),
  'utf8',
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8',
));

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const n = symbols.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const primeLines = source.split(/\r?\n/).filter((line) => /^echo\s/.test(line));
assert.equal(primeLines.length, 464);
const commands = primeLines.map((line) => {
  const match = line.match(/^echo\s+(?:-n\s+)?"(\d+)\s*";\s*sleep\s+(\.05|2)$/);
  assert.ok(match, 'Unexpected prime_echo source command: ' + line);
  return { prime: Number(match[1]), delay: Number(match[2]) };
});
assert.deepEqual(
  commands.flatMap(({ prime, delay }, i) => delay === 2 ? [[i + 1, prime]] : []),
  [[174, 1033], [464, 3301]],
);
assert.equal(commands.filter(({ delay }) => delay === 0.05).length, 462);
const primes = commands.slice(174).map(({ prime }) => prime);
assert.equal(primes.length, 290);
assert.equal(primes[0], 1039);
assert.equal(primes[289], 3301);
const key = primes.map((prime) => (prime - 1) % 28);

const chapter = corpus.pages
  .filter(({ page }) => page >= 33 && page <= 39)
  .flatMap(({ indices }) => indices);
assert.equal(chapter.length, 1680);
const original = chapter.slice(91);
const iv = chapter[90];
assert.equal(original.length, 1589);
assert.equal(iv, 20);

/**
 * A plaintext EA (index 28) repeats previous ciphertext without advancing the
 * prime clock. Any other plaintext index is mapped bijectively to one of 28
 * possible next runes, excluding the immediately previous ciphertext.
 *
 * @param {number[]} plaintext GP29 plaintext indices.
 * @param {number} prior The preceding ciphertext rune.
 * @returns {{symbols:number[],consumed:number}}
 */
function encrypt(plaintext, prior) {
  const symbols = [];
  let previous = prior;
  let consumed = 0;
  for (const p of plaintext) {
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    const c = p === 28
      ? previous
      : (previous + 1 + (p + key[consumed % key.length]) % 28) % 29;
    if (p !== 28) consumed++;
    symbols.push(c);
    previous = c;
  }
  return { symbols, consumed };
}

/**
 * @param {number[]} ciphertext GP29 ciphertext indices.
 * @param {number} prior The preceding ciphertext rune.
 * @returns {{symbols:number[],consumed:number}}
 */
function decrypt(ciphertext, prior) {
  const symbols = [];
  let previous = prior;
  let consumed = 0;
  for (const c of ciphertext) {
    assert.ok(Number.isInteger(c) && c >= 0 && c < 29);
    if (c === previous) {
      symbols.push(28);
    } else {
      const digit = (c - previous - 1 + 29) % 29;
      symbols.push((digit - key[consumed % key.length] + 28) % 28);
      consumed++;
    }
    previous = c;
  }
  return { symbols, consumed };
}

const decoded = decrypt(original, iv);
const restored = encrypt(decoded.symbols, iv);
assert.deepEqual(restored.symbols, original);
assert.equal(decoded.consumed, 1577);
assert.equal(decoded.symbols.filter((symbol) => symbol === 28).length, 12);
assert.ok(Math.abs(ioc(decoded.symbols) - 0.03528192088872966) < 1e-14);

// Independent native-language positive with twelve explicitly placed EA
// sentinels, confirming both the 28-way register and nonconsuming key clock.
const sourcePlain = corpus.pages.find(({ page }) => page === 57).indices;
assert.equal(sourcePlain.length, 95);
const planted = Array.from({ length: original.length },
  (_, i) => sourcePlain[i % sourcePlain.length]);
for (let i = 40; i < planted.length; i += 137) planted[i] = 28;
assert.equal(planted.filter((symbol) => symbol === 28).length, 12);
const encodedPlant = encrypt(planted, iv);
const recoveredPlant = decrypt(encodedPlant.symbols, iv);
assert.deepEqual(recoveredPlant.symbols, planted);
assert.equal(recoveredPlant.consumed, 1577);
assert.equal(encodedPlant.consumed, 1577);
assert.ok(Math.abs(ioc(planted) - 0.07057335301101876) < 1e-14);
assert.ok(Math.abs(ioc(encodedPlant.symbols) - 0.03442749507397362) < 1e-14);

console.log(JSON.stringify({
  chapterLength: chapter.length,
  originalLength: original.length,
  primeKeyLength: key.length,
  sourceRepeatEvents: original.length - decoded.consumed,
  sourceCipherIoC: ioc(original),
  sourceDecodedIoC: ioc(decoded.symbols),
  plantedNativeIoC: ioc(planted),
  plantedCipherIoC: ioc(encodedPlant.symbols),
  originalRoundtrip: true,
  plantRoundtrip: true,
  first110Decoded: decoded.symbols.slice(0, 110)
    .map((index) => corpus.translit[index]).join(' '),
}, null, 2));
