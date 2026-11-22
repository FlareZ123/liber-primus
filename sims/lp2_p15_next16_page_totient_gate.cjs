'use strict';

// Bounded original-source gate: does p15's 16 Fibonacci-prime start ranks
// key the next 16 physical pages p16-p31 under the solved p56 phi(prime)
// inverse, with a page-local key reset and the authentic transparent-F rule?
// Run: node sims/lp2_p15_next16_page_totient_gate.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const mod29 = n => ((n % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(2000);

// Established original p15 spiral: first sixteen distinct Fibonacci values.
// Each value F produces one-based starting prime ordinal F+1.
const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const starts = fibonacci.map(value => value + 1);
assert.equal(starts.length, 16);
assert.equal(starts[0], 1);
assert.equal(starts[15], 988);

function transparentFPath(cipher, startOrdinal) {
  let states = new Set([0]);
  for (let offset = 0; offset < cipher.length; offset++) {
    const symbol = cipher[offset];
    const next = new Set();
    for (const consumed of states) {
      // A ciphertext F may be a literal plaintext F and consume no key.
      if (symbol === 0) next.add(consumed);

      // Otherwise the authentic p56 inverse consumes phi(prime).
      // A key-consuming inverse may not produce plaintext F: the forward
      // encoder would have copied that F literally to ciphertext.
      const primeOrdinal = startOrdinal + consumed;
      const prime = primes[primeOrdinal - 1];
      assert.notEqual(prime, undefined);
      const plain = mod29(symbol - (prime - 1));
      if (plain !== 0) next.add(consumed + 1);
    }
    if (next.size === 0) {
      const before = [...states].sort((a, b) => a - b);
      return {
        possible: false,
        firstFailure: {
          offset,
          cipherIndex: symbol,
          cipherRune: source.translit[symbol],
          statesBefore: before,
          attempts: before.map(consumed => {
            const primeOrdinal = startOrdinal + consumed;
            const prime = primes[primeOrdinal - 1];
            const phi = prime - 1;
            return {
              consumed,
              primeOrdinal,
              prime,
              phiMod29: mod29(phi),
              forcedPlain: mod29(symbol - phi)
            };
          })
        }
      };
    }
    states = next;
  }
  return { possible: true, endStates: [...states].sort((a, b) => a - b) };
}

// Positive control: the independently established p56 plaintext must
// forward-encrypt to the exact original p56 ciphertext under start ordinal 1.
const expectedWords =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens = source.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
function toGpRunes(words) {
  const out = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}
function encrypt(plain, startOrdinal) {
  let consumed = 0;
  const cipher = plain.map(symbol => {
    if (symbol === 0) return 0;
    const prime = primes[startOrdinal - 1 + consumed];
    assert.notEqual(prime, undefined);
    consumed++;
    return mod29(symbol + prime - 1);
  });
  return { cipher, consumed };
}
const knownPlain = toGpRunes(expectedWords);
const knownCipher = source.pages.find(page => page.page === 56).indices;
assert.equal(knownPlain.length, 85);
assert.equal(knownPlain.filter(symbol => symbol === 0).length, 1);
const knownForward = encrypt(knownPlain, 1);
assert.equal(knownForward.consumed, 84);
assert.deepEqual(knownForward.cipher, knownCipher);
const knownPath = transparentFPath(knownCipher, 1);
assert.equal(knownPath.possible, true);
assert.ok(knownPath.endStates.includes(84));

// Human-readable next-page interpretation: p15 is the key page; its sixteen
// Fibonacci-prime starts apply in order to the following sixteen pages p16-31.
// Each physical page restarts at its assigned one-based prime ordinal.
const pages = source.pages.filter(page => page.page >= 16 && page.page <= 31);
assert.equal(pages.length, 16);
const results = pages.map((page, index) => {
  const startOrdinal = starts[index];
  const gate = transparentFPath(page.indices, startOrdinal);
  return {
    page: page.page,
    runes: page.indices.length,
    startOrdinal,
    startPrime: primes[startOrdinal - 1],
    possible: gate.possible,
    firstFailure: gate.firstFailure || null,
    endStates: gate.endStates || null
  };
});
assert.equal(results.filter(result => !result.possible).length, 16);
assert.deepEqual(results[0].firstFailure, {
  offset: 7,
  cipherIndex: 18,
  cipherRune: 'E',
  statesBefore: [7],
  attempts: [{
    consumed: 7,
    primeOrdinal: 8,
    prime: 19,
    phiMod29: 18,
    forcedPlain: 0
  }]
});

console.log(JSON.stringify({
  status: 'PASS',
  hypothesis: 'p15 Fibonacci-prime starts assigned pagewise to p16-p31; p56 phi(prime) inverse',
  startOrdinals: starts,
  knownP56Control: {
    ciphertextRunes: knownCipher.length,
    plaintextRunes: knownPlain.length,
    literalPlaintextFs: 1,
    consumedKeySymbols: knownForward.consumed,
    exactForwardReplay: true,
    transparentFPathExists: knownPath.possible
  },
  rejectedPages: results.map(result => ({
    page: result.page,
    startOrdinal: result.startOrdinal,
    startPrime: result.startPrime,
    firstFailure: result.firstFailure
  })),
  conclusion: 'All 16 next-page assignments violate the source-authentic transparent-F forward constraint; no unknown plaintext or key recovered.'
}, null, 2));
