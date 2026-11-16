'use strict';

/**
 * Source-prior second-stage gate for the fixed 2015 p0–2 prime/difference
 * register. The p56 solved page supplies the prime-totient key direction;
 * the 40 repeated D symbols supply a two-state key clock: advance on a
 * changed D symbol, hold on an adjacent repeat.
 *
 * This is a complete bijection. Given P, the encoder computes D using the
 * current key, then updates the clock from the resulting D; the decoder
 * performs the same clock update from the observed D. No phase, key, IV or
 * boundary is fitted.
 *
 * Run from repository root:
 *   node sims/lp2_2015_p0_p56_totient_repeat_hold_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod = x => ((x % 29) + 29) % 29;

function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}
function adjacentEquals(xs) {
  return xs.slice(1).filter((x, i) => x === xs[i]).length;
}

/** Exact contemporary 2015 first stage, including imaginary preceding F. */
function firstStage(cipher, primes) {
  let previousShift = mod(-primes[0]); // F=0 shifted by prime 2
  return cipher.map((c, i) => {
    const shifted = mod(c - primes[i + 1]); // first printed rune uses prime 3
    const d = mod(shifted - previousShift);
    previousShift = shifted;
    return d;
  });
}

/** Frozen second-stage decoder: P[i] = D[i] - phi(p_k), clock holds on repeats. */
function decryptRepeatHold(d, phi) {
  let k = 0;
  let previousD = null;
  const p = d.map((value, i) => {
    const plain = mod(value - phi[k]);
    if (i === 0 || value !== previousD) k++;
    previousD = value;
    return plain;
  });
  return { plain: p, keySymbolsConsumed: k };
}

/** Exact inverse of decryptRepeatHold for every GP29 input sequence. */
function encryptRepeatHold(p, phi) {
  let k = 0;
  let previousD = null;
  return p.map((value, i) => {
    const d = mod(value + phi[k]);
    if (i === 0 || d !== previousD) k++;
    previousD = d;
    return d;
  });
}

const original = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(original.length, 729);

const primes = firstPrimes(730);
assert.deepEqual(primes.slice(0, 5), [2, 3, 5, 7, 11]);
const D = firstStage(original, primes);
assert.equal(adjacentEquals(D), 40);
assert.equal(D.filter(x => x === 0).length, 21);

const phi = primes.map(p => mod(p - 1)); // p56 source direction: subtract phi(p)
const { plain: P, keySymbolsConsumed } = decryptRepeatHold(D, phi);
assert.equal(keySymbolsConsumed, 689); // 729 positions minus 40 hold events
assert.deepEqual(encryptRepeatHold(P, phi), D); // exact forward reciphering
assert.deepEqual(decryptRepeatHold(encryptRepeatHold(P, phi), phi).plain, P);

// Original six-rune p2 word at global rune offset 543. The D sequence has
// four consecutive 26s; repeat-hold forces P[2] = P[3] = P[4], independent
// of the key values or initial phase.
const words = parseLP2Words(
  read('resources/liber-primus/lp2-transcription.txt'), 3
).words;
const witness = words.find(w => w.offset === 543);
assert.ok(witness);
assert.equal(witness.runes, 'ᚾᚻᛒᛖᚷᛇ');
assert.deepEqual(D.slice(543, 549), [15, 26, 26, 26, 26, 13]);
assert.equal(P[543 + 2], P[543 + 3]);
assert.equal(P[543 + 3], P[543 + 4]);

// The repository's source-native GP29 English dictionary has no six-rune
// entry with equal symbols at positions 2,3,4. Recheck the exact normalization
// used by the companion 2015 feedback witness.
const tokens = corpus.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);
function encodeGP(word) {
  const w = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < w.length;) {
    const token = tokens.find(t => w.startsWith(t.token, i));
    if (!token) return null;
    out.push(token.i);
    i += token.token.length;
  }
  return out;
}
let dictionaryEntries = 0, encodable = 0, sixRuneWords = 0, tripleMatches = 0;
for (const m of read('resources/control/english_wordfreq_textblob.txt')
  .matchAll(/^([a-z]+) (\d+)$/gm)) {
  dictionaryEntries++;
  const gp = encodeGP(m[1]);
  if (!gp) continue;
  encodable++;
  if (gp.length !== 6) continue;
  sixRuneWords++;
  if (gp[2] === gp[3] && gp[3] === gp[4]) tripleMatches++;
}
assert.equal(dictionaryEntries, 29157);
assert.equal(encodable, 29154);
assert.equal(tripleMatches, 0);

console.log(JSON.stringify({
  source: '2015 p0–2 prime shift + first difference; p56 prime-totient key',
  firstStage: {
    runes: original.length,
    adjacentEqualities: adjacentEquals(D),
    literalZeroes: D.filter(x => x === 0).length
  },
  frozenSecondStage: {
    key: 'phi(p) = p - 1 mod 29, primes start at 2',
    sign: 'subtract',
    initialKeyIndex: 0,
    state: 'hold key index when current D equals previous D; otherwise advance',
    keySymbolsConsumed,
    outputIoC: ioc(P),
    normalizedIoC: 29 * ioc(P),
    exactForwardReciphering: true
  },
  structuralWitness: {
    globalOffset: 543,
    originalWord: witness.runes,
    D: D.slice(543, 549),
    forcedPlaintextEquality: 'P[2] = P[3] = P[4]',
    dictionaryEntries,
    encodable,
    sixRuneWords,
    tripleMatches
  },
  decision: 'Reject this complete repeat-hold second-stage: it forces a triple repeated GP symbol inside an original six-rune word, and no word in the repository English GP29 lexicon satisfies that constraint.'
}, null, 2));
