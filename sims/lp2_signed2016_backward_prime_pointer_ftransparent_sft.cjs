'use strict';

/**
 * Single preregistered pointer-direction hypothesis from Director #1193.
 * Original source: the 2016 verified signed words "their numbers are the direction".
 * 2014-authored numeric encoding: Gematria Primus prime-value sum of a printed word.
 *
 * Convention (selected before observing any ciphertext output):
 *   - Cipher: authentic solved p56 GP29 C = P + phi(prime) mod 29.
 *   - Literal plaintext F maps to ciphertext F, consuming no key.
 *   - Word 0 walks forward from prime 2 (key index zero).
 *   - After each *ciphertext* word, if its GP-prime sum is prime, the
 *     next word walks backward through the key; otherwise forward.
 *   - Each consumed symbol advances by that word's direction.
 *   - No wrap, no reset at image/page breaks, no hidden deletions.
 *
 * This hypothesis is not claimed to be uniquely selected by the signed clue.
 * The original output is tested on the exact 12,956 LP2 unknown runes.
 * Run: node sims/lp2_signed2016_backward_prime_pointer_ftransparent_sft.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const corpusBytes = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'));
const transcriptBytes = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'));
const corpus = JSON.parse(corpusBytes.toString('utf8'));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.slice(0, 56).flatMap(p => p.indices || []);
const words = [];
let w = [];
let seen = 0;
for (const glyph of Array.from(transcriptBytes.toString('utf8'))) {
  if (runeIndex.has(glyph)) {
    w.push(runeIndex.get(glyph));
    seen += 1;
    if (seen === original.length) break;
  } else if (glyph === '-' || glyph === '.' || glyph === '&') {
    if (w.length) { words.push(w); w = []; }
  }
}
if (w.length) words.push(w);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

const primeValue = corpus.prime;
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** @param {number[]} word @returns {number} */
function sumPrime(word) { return word.reduce((s, c) => s + primeValue[c], 0); }

// Historical key used by the solved p56 prime-totient cipher.
const key = [];
for (let n = 2; key.length < 18000; n += 1) {
  if (isPrime(n)) key.push((n - 1) % 29);
}
const lengths = words.map(word => word.length);

/**
 * Exhaustive reachability, including EVERY ambiguous ciphertext-F interpretation.
 * Equal current cursor states merge exactly. No language scoring or mask selection.
 * @param {number[]} cipher Unchanged GP29 ciphertext
 * @param {number[]} wordLengths Original printed whole-word lengths
 * @param {number} start Initial key index
 * @returns {object}
 */
function reachable(cipher, wordLengths, start) {
  let pointerStates = new Set([start]);
  let offset = 0;
  let direction = 1;
  let maxStates = 1;
  let backwards = 0;
  for (let wi = 0; wi < wordLengths.length; wi += 1) {
    const wordStart = offset;
    for (let j = 0; j < wordLengths[wi]; j += 1, offset += 1) {
      const c = cipher[offset];
      const next = new Set();
      for (const pointer of pointerStates) {
        if (c === 0) next.add(pointer); // transparent plaintext F bypass
        if (pointer >= 0 && pointer < key.length) {
          const p = mod29(c - key[pointer]);
          if (p !== 0) next.add(pointer + direction);
        }
      }
      if (next.size === 0) {
        return {valid:false,furthest:offset,word:wi,withinWord:j,
          direction,backwardWords:backwards,maxStates,finalStates:0};
      }
      pointerStates = next;
      maxStates = Math.max(maxStates, pointerStates.size);
    }
    const word = cipher.slice(wordStart, offset);
    direction = isPrime(sumPrime(word)) ? -1 : 1;
    if (direction === -1) backwards += 1;
  }
  return {valid:true,furthest:offset,backwardWords:backwards,
    maxStates,finalStates:pointerStates.size,
    minFinalPointer:Math.min(...pointerStates),maxFinalPointer:Math.max(...pointerStates)};
}

/**
 * Causal forward cipher for an independently supplied plaintext.
 * Direction is selected only from completed ciphertext words.
 * @param {number[]} plain
 * @param {number[]} wordLengths
 * @param {number} start
 * @returns {object}
 */
function encrypt(plain, wordLengths, start) {
  let cursor = start;
  let direction = 1;
  let offset = 0;
  let turns = 0;
  let bypasses = 0;
  const out = [];
  for (let wi = 0; wi < wordLengths.length; wi += 1) {
    const cword = [];
    for (let j = 0; j < wordLengths[wi]; j += 1, offset += 1) {
      const p = plain[offset];
      if (p === 0) {
        cword.push(0);
        bypasses += 1;
        continue;
      }
      assert.ok(cursor >= 0 && cursor < key.length,
        'Positive control pointer out of range; fixed test requires a valid plant');
      cword.push(mod29(p + key[cursor]));
      cursor += direction;
    }
    out.push(...cword);
    const newDirection = isPrime(sumPrime(cword)) ? -1 : 1;
    if (newDirection !== direction) turns += 1;
    direction = newDirection;
  }
  assert.equal(offset, plain.length);
  return {cipher:out,finalPointer:cursor,turns,bypasses};
}

/** Source-native, whole-word Gematria Primus encoder for an independent plant. */
function encodeReference(text) {
  const tokens = corpus.translit.map((s, i) => ({s, i}))
    .sort((a,b) => b.s.length - a.s.length);
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (const word of normalized.split(/[^A-Z]+/)) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find(t => word.startsWith(t.s, i));
      assert.ok(t, 'Unmapped source-native GP letter');
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const knownP56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const knownPlain = encodeReference(knownP56);
assert.equal(knownPlain.length, 85);
const positiveP56 = encrypt(knownPlain, [85], 0);
assert.deepEqual(positiveP56.cipher, corpus.pages[56].indices);
const p56Reach = reachable(corpus.pages[56].indices, [85], 0);
assert.equal(p56Reach.furthest, 85);

// Original full book, with real word clock and cross-page words preserved.
const full = reachable(original, lengths, 0);
const originalP0 = original.slice(0, 729);
const p0 = reachable(originalP0, lengths.slice(0, 158), 0);
assert.equal(lengths.slice(0, 158).reduce((a,b) => a + b,0),729);
assert.equal(full.furthest, p0.furthest);
// One matched null: rotate the rune order inside every printed word by one.
// Every exact word length, GP-prime sum, prime/composite direction and
// number of ambiguous F sites is preserved; original position is destroyed.
const rotationNull = words.flatMap(word =>
  word.length > 1 ? [...word.slice(1), word[0]] : word);
assert.equal(rotationNull.length, original.length);
const nullReach = reachable(rotationNull, lengths, 0);

// Synthetic full-register native GP plaintext, deliberately starts cursor at
// 100 to exercise BOTH pointer directions without immediate underflow.
// A shifted positive-control start does NOT change the fixed original start0.
const sourceRef = fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const plantPlain = encodeReference(sourceRef).slice(0, original.length);
assert.equal(plantPlain.length, original.length);
const plantCipher = encrypt(plantPlain, lengths, 100);
const plantReach = reachable(plantCipher.cipher, lengths, 100);
assert.equal(plantReach.furthest, plantCipher.cipher.length);
assert.ok(plantReach.valid && plantCipher.turns > 100 && plantCipher.bypasses > 100);
// Exact byte-for-byte re-encryption of plaintext is guaranteed by the
// independently constructed forward cipher, not merely a wrong-key round trip.
assert.deepEqual(encrypt(plantPlain,lengths,100).cipher,plantCipher.cipher);
assert.equal(full.valid, false);
assert.equal(full.furthest, 35);
assert.equal(full.word, 6);

console.log(JSON.stringify({
  test:'Source-fixed 2016 signed word-number pointer / authentic p56 phi key',
  originalCipher:'C=P+phi(prime) mod29; plaintext F transparent',
  direction:'previous ciphertext word GP prime sum: prime => backward, composite => forward',
  clock:'first word forward, pointer0, continuous over 32 page-carry words, no wrap',
  sources:{
    corpusSha256:crypto.createHash('sha256').update(corpusBytes).digest('hex'),
    transcriptSha256:crypto.createHash('sha256').update(transcriptBytes).digest('hex')
  },
  original:{runes:original.length,words:words.length,full,p0,matchedRotationNull:nullReach},
  authenticPositive:{p56ExactCipher:true,p56:positiveP56.bypasses ? p56Reach : null,
    literalFBypasses:positiveP56.bypasses},
  independentPlant:{runes:plantPlain.length,source:'Shakespeare fixed GP29 reference',
    originalWordLengths:true,startKeyPointer:100,turns:plantCipher.turns,
    literalFBypasses:plantCipher.bypasses,reach:plantReach,
    exactReencryption:true},
  decision:'Fixed prime-backward/composite-forward original start0 fails at rune35. Other direction conventions, key starts and streams not tested. No unknown plaintext or key.'
},null,2));
