'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    if (out.every(p => p * p > n || n % p !== 0)) out.push(n);
  }
  return out;
}

/**
 * Enumerate every legal skip-or-consume branch under the authenticated p56
 * plaintext-F rule, allowing each source-ciphertext F to consume a key or not.
 * One state per possible branch; a non-F ciphertext may never decode to F.
 * @param {number[]} cipher
 * @param {number[]} primeList
 * @param {number} primeOffset Zero-based prime-list index
 * @param {-1|1} sign Forward rule C=P+sign*K
 * @returns {{firstImpossible:number|null, states: Array<{plain:number[], keyIndex:number, bypass:number[]}>}}
 */
function decode(cipher, primeList, primeOffset, sign) {
  let states = [{ plain: [], keyIndex: primeOffset, bypass: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const state of states) {
      const k = mod(primeList[state.keyIndex] - 1);
      const plain = mod(cipher[i] - sign * k);
      if (plain !== 0) {
        next.push({ plain: state.plain.concat(plain),
          keyIndex: state.keyIndex + 1, bypass: state.bypass });
      }
      if (cipher[i] === 0) {
        next.push({ plain: state.plain.concat(0),
          keyIndex: state.keyIndex, bypass: state.bypass.concat(i) });
      }
    }
    if (next.length === 0) return { firstImpossible: i, states: [] };
    states = next;
  }
  return { firstImpossible: null, states };
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const n of a) counts[n]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} values @param {string[]} translit @returns {string} */
function spell(values, translit) {
  return values.map(x => translit[x]).join(' ');
}

function main() {
  const root = path.join(__dirname, '..', 'resources', 'liber-primus');
  const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
  const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
  const page = n => corpus.pages.find(p => p.page === n).indices;
  const p27 = page(27), p32 = page(32), p55 = page(55), p56 = page(56);
  const primes = firstPrimes(500);
  assert.equal(p55.length, 76);
  assert.equal(p56.length, 85);
  assert.equal(p32.length, 121);
  assert.deepEqual(p55.slice(70, 76), p27.slice(28, 34));
  assert.equal(spell(p55.slice(70, 76), corpus.translit), 'D J U B E I');
  assert.equal(spell(p27.slice(34, 36), corpus.translit), 'AE F');
  assert.equal(p27.slice(34, 36).reduce((s, c) => s + corpus.prime[c], 0), 103);
  assert.equal(grid.pages.flatMap(p => p.tokens)[102], '0W');
  assert.equal(primes[102], 563);
  assert.equal(p32.slice(0, 11).reduce((s, c) => s + corpus.prime[c], 0), 563);
  assert.equal(Array.from({ length: 11 }, (_, i) => p32[i * 11])
    .reduce((s, c) => s + corpus.prime[c], 0), 569);

  // Full 85-rune known p56 passage: 84 successive totient keys, with exactly
  // original local ciphertext-F position 56 passing unencrypted/unconsumed.
  let k = 0;
  const solved56 = p56.map((c, i) => {
    if (i === 56) { assert.equal(c, 0); return 0; }
    const p = mod(c - mod(primes[k++] - 1));
    assert.notEqual(p, 0);
    return p;
  });
  assert.equal(k, 84);
  const known56 = 'A N E N D W I TH I N TH E D E E P W E B TH E R E E X I S T S A P A G E TH A T H A S H E S T O I T I S TH E D U T Y O F E U E R Y P I L G R I M T O S E E C O U T TH I S P A G E';
  assert.equal(spell(solved56, corpus.translit), known56);

  const tests = [];
  for (const [label, source] of [
    ['p55 full including p54 carry', p55],
    ['p55 75-rune body', p55.slice(1)],
    ['p27 entire original page', p27],
    ['p27 after pointed AE-F word', p27.slice(36)],
  ]) {
    for (const sign of [-1, 1]) {
      const test = decode(source, primes, 102, sign);
      const top = test.states.map(s => ({ ...s, ioc: ioc(s.plain) }))
        .sort((a, b) => b.ioc - a.ioc)[0];
      tests.push({
        label, sign, runeCount: source.length,
        firstImpossible: test.firstImpossible,
        survivingKeyPaths: test.states.length,
        ...(top ? {
          strongestIoc: top.ioc, bypassPositions: top.bypass,
          first70Runes: spell(top.plain.slice(0, 70), corpus.translit),
        } : {}),
      });
    }
  }
  // The p55 branch is ruled out for both signs and both natural original starts.
  assert(tests.slice(0, 4).every(t => t.survivingKeyPaths === 0));
  // A p27 positive branch at a selectively chosen marker need not be English.
  assert.equal(tests[6].survivingKeyPaths, 0);
  assert.equal(tests[7].survivingKeyPaths, 2);
  assert(tests[7].strongestIoc < 0.04);
  console.log(JSON.stringify({
    sourceSelector: 'p55 footer => p27 offset28 => AE-F prime sum 103',
    candidateFirstPrime: primes[102],
    originalP56TotientPositiveControl: { recoveredRunes: 85, keyConsumptions: 84,
      originalSkip: 56, matchedKnownPlain: true },
    tests, unknownPlaintextRecovered: false
  }, null, 2));
}
main();
