'use strict';

/**
 * The dated 2014 May 19 Cicada solver suggestion "last prime used on 56
 * the one after starts on page 55" tested exactly on original page 55.
 * Includes both source-plausible counts: 84 consumed p56 phi-prime keys
 * with its known literal-F skip, or 85 glyphs with no skip.
 *
 * Read-only CJS SFT: node sims/lp2_2014_p55_prime_cursor_continuation_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const authentic = require('./authentic_decryption_regression.cjs');

const p55 = corpus.pages.find((record) => record.page === 55).indices;
const p57 = corpus.pages.find((record) => record.page === 57).indices;
assert.equal(p55.length, 76);
assert.ok(p57.length >= 76);
const known = authentic.run().find((record) => record.section === 'LP2 page 56');
assert.ok(known);
assert.equal(known.recoveredRunes, 85);
assert.equal(known.FInterrupters, 1);
assert.equal(known.keySymbolsConsumed, 84);

const primes = [];
for (let n = 2; primes.length < 200; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
assert.equal(primes[84], 439);
assert.equal(primes[85], 443);
assert.equal(primes[91], 479);
const mod = (n) => ((n % 29) + 29) % 29;
const text = (runes) => runes.map((i) => corpus.translit[i]).join('');

/** @param {number[]} source @param {number} start */
function invertWithPlaintextFRule(source, start) {
  /** @type {Array<{plain:number[],cursor:number,mask:string}>} */
  let states = [{ plain: [], cursor: start, mask: '' }];
  let firstFailure = null;
  let maxStates = 1;
  for (let i = 0; i < source.length; i++) {
    const next = [];
    const cipher = source[i];
    const cursorExamples = [...new Set(states.map((state) => state.cursor))];
    for (const state of states) {
      // The known p56 encoder leaves every literal plaintext-F as ciphertext F,
      // with no key consumption. Some ciphertext F values may instead be keyed
      // non-F; exhaust those possibilities without language-fitting.
      if (cipher === 0) next.push({
        plain: [...state.plain, 0], cursor: state.cursor, mask: state.mask + 'F'
      });
      const decoded = mod(cipher - (primes[state.cursor] - 1));
      if (decoded !== 0) next.push({
        plain: [...state.plain, decoded], cursor: state.cursor + 1,
        mask: state.mask + '.'
      });
    }
    if (!next.length) {
      firstFailure = { atZeroBasedIndex: i, cipherGP: corpus.translit[cipher],
        primeCandidates: cursorExamples.map((cursor) => primes[cursor]),
        expectedPlaintextAtContradiction: 'F (only as nontransparent output)' };
      break;
    }
    states = next;
    maxStates = Math.max(maxStates, states.length);
  }
  return { firstFailure, states, maxStates };
}

/** @param {number[]} source @param {number} start */
function encryptWithPlaintextFRule(source, start) {
  let cursor = start;
  return source.map((plain) =>
    plain === 0 ? 0 : mod(plain + (primes[cursor++] - 1)));
}

const output = [];
for (const pageReading of [
  { name: 'all76 glyphs, including incoming p54 carry', cipher: p55, firstPageOffset: 0 },
  { name: '75 complete-word glyphs after incoming carry', cipher: p55.slice(1), firstPageOffset: 1 }
]) {
  for (const start of [84, 85]) {
    const reading = invertWithPlaintextFRule(pageReading.cipher, start);
    assert.ok(reading.firstFailure);
    assert.equal(reading.states.length > 0, true); // last nonempty stage retained
    const expectedIndex = pageReading.firstPageOffset === 0
      ? (start === 84 ? 7 : 71)
      : (start === 84 ? 18 : 6);
    assert.equal(reading.firstFailure.atZeroBasedIndex, expectedIndex);
    assert.equal(reading.firstFailure.cipherGP,
      pageReading.firstPageOffset === 0
        ? (start === 84 ? 'X' : 'J')
        : (start === 84 ? 'C' : 'X'));
    const controlText = p57.slice(0, pageReading.cipher.length);
    const controlCipher = encryptWithPlaintextFRule(controlText, start);
    const control = invertWithPlaintextFRule(controlCipher, start);
    assert.equal(control.firstFailure, null);
    assert.ok(control.states.some((candidate) =>
      candidate.plain.length === controlText.length
        && candidate.plain.every((value, i) => value === controlText[i])));
    output.push({
      originalPageReading: pageReading.name,
      p56KeyCountAssumption: start === 84
        ? 'Authentic p56 plaintext F transparently bypassed'
        : 'Counterfactual all 85 p56 glyphs consume primes',
      startOrdinalOneBased: start + 1, startPrime: primes[start],
      remainingStatesAtContradiction: 0,
      maxBranchStatesBeforeContradiction: reading.maxStates,
      firstFailure: {
        ...reading.firstFailure,
        originalPage55ZeroBasedOffset: reading.firstFailure.atZeroBasedIndex
          + pageReading.firstPageOffset
      },
      knownP57SourceNativePlant: 'PASS exact ' + controlText.length
        + '/' + controlText.length
    });
  }
}
assert.deepEqual(p55.flatMap((v, i) => v === 0 ? [i] : []), [15, 25, 41]);
console.log(JSON.stringify({
  sourceWitness: '2014 May 19 02:37 <Ammar__> Try this the last prime used on 56 the one after starts on page 55',
  original: { page: 55, runes: p55.length, firstEight: text(p55.slice(0, 8)),
    fSites: [15, 25, 41] },
  historicalP56: { consumedPrimes: known.keySymbolsConsumed,
    originalRunes: known.recoveredRunes, actualPlaintextFBypasses: known.FInterrupters },
  outputs: output,
  conclusion: 'Both prime-count continuations on both original p55 body/carry boundaries contradict the authentic plaintext-F rule. No unknown LP2 plaintext found.'
}, null, 2));
