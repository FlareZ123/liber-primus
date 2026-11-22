'use strict';

/**
 * Original LP2 strict-four-dot variable-length F-pair escape gate.
 * A GP29 plaintext F takes two equal ciphertext symbols; all 28 other runes
 * take one predecessor-excluding symbol. Every printed word remains a word.
 * We exclude all stationary last-cipher and source-four-dot-phase escape
 * followers, even allowing their follower tables to be completely secret.
 *
 * SFT for Node.js 22 on Windows 11. No external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const punctuation = JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
const glyphToIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const physical = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(physical.length, 55);
const original = physical.flatMap(p => p.indices);
assert.equal(original.length, 12956);

const pageByOffset = [];
let cursor = 0;
for (const p of physical) {
  for (let i = 0; i < p.indices.length; i++) pageByOffset.push(p.page);
  cursor += p.indices.length;
}
assert.equal(cursor, original.length);

/**
 * Percent signs and slashes are physical page and line breaks, not spaces.
 * Only printed word separators and punctuation terminate logical words.
 * @param {string} input
 * @returns {{indices:number[],offsets:number[]}[]}
 */
function wordsFromSource(input) {
  const words = [];
  let indices = [], offsets = [], count = 0;
  function flush() {
    if (indices.length) words.push({indices, offsets});
    indices = [];
    offsets = [];
  }
  for (const glyph of input) {
    const value = glyphToIndex.get(glyph);
    if (value !== undefined) {
      indices.push(value);
      offsets.push(count++);
    } else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
      // Layout only: 32 authentic words cross physical page boundaries.
    } else {
      flush();
    }
  }
  flush();
  assert.equal(count, 12956);
  return words;
}

const transcript = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');
const words = wordsFromSource(transcript);
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(w => w.indices), original);

const disqualified = new Set([57, 58, 59, 60, 91, 125, 127]);
const stops = punctuation.events
  .filter(e => e.symbol === '⁘' && !disqualified.has(e.index))
  .map(e => e.rune_offset);
assert.equal(stops.length, 138);
assert.equal(stops[0], 154);
assert.equal(stops[stops.length - 1], 12597);

/** @param {number} i @returns {number} */
function phaseFromFourDot(i) {
  let lower = 0, upper = stops.length;
  while (lower < upper) {
    const mid = (lower + upper) >> 1;
    if (stops[mid] <= i) lower = mid + 1;
    else upper = mid;
  }
  return (i - (lower ? stops[lower - 1] : 0)) % 4;
}

/** @typedef {{offset:number, page:number, previous:number, repeated:number, phase:number}} RepeatEvent */
const events = [];
let withinWordPairs = 0;
let wordInitialPairs = 0;
for (const word of words) {
  const a = word.indices;
  for (let i = 0; i + 1 < a.length; i++) {
    if (a[i] !== a[i + 1]) continue;
    withinWordPairs++;
    if (!i) {
      wordInitialPairs++;
      continue; // Unknown word seed is deliberately unrestricted.
    }
    const offset = word.offsets[i];
    events.push({
      offset, page: pageByOffset[offset], previous: a[i - 1],
      repeated: a[i], phase: phaseFromFourDot(offset)
    });
  }
}
assert.equal(withinWordPairs, 63);
assert.equal(wordInitialPairs, 12);
assert.equal(events.length, 51);

// Each F-pair [x,x] must be emitted from one fixed follower h(previous,phase).
// All 28 ordinary symbols are independently allowed to use ANY bijection.
function audit(label, predicate, fourPhase) {
  /** @type {Map<string,Set<number>>} */
  const successors = new Map();
  const examples = new Map();
  let n = 0;
  for (const e of events.filter(predicate)) {
    n++;
    const key = fourPhase ? e.previous + ':' + e.phase : String(e.previous);
    if (!successors.has(key)) successors.set(key, new Set());
    successors.get(key).add(e.repeated);
    const pair = key + '=>' + e.repeated;
    if (!examples.has(pair)) examples.set(pair, e.offset);
  }
  const conflicts = [];
  for (const [key, outputs] of successors) {
    if (outputs.size < 2) continue;
    conflicts.push({
      prior_state: key,
      outputs: [...outputs].map(x => ({
        rune: corpus.translit[x], index: x,
        first_offset: examples.get(key + '=>' + x)
      }))
    });
  }
  console.log(JSON.stringify({
    label, phase: fourPhase ? 'four-dot modulus 4' : 'last emitted rune',
    tested_pairs: n, visited_states: successors.size,
    contradictory_states: conflicts.length, example: conflicts[0]
  }, null, 2));
  return {n, contradictions: conflicts.length, conflicts};
}

const training = audit('physical pages 0-39', e => e.page <= 39, false);
const heldout = audit('physical pages 40-55', e => e.page >= 40, false);
const full = audit('all 55 rune-bearing pages', () => true, false);
const training4 = audit('physical pages 0-39', e => e.page <= 39, true);
const heldout4 = audit('physical pages 40-55', e => e.page >= 40, true);
const full4 = audit('all 55 rune-bearing pages', () => true, true);
assert.deepEqual(
  [training.n, training.contradictions, heldout.n, heldout.contradictions,
    full.n, full.contradictions, training4.contradictions,
    heldout4.contradictions, full4.contradictions],
  [43, 13, 8, 2, 51, 15, 8, 0, 10]
);

/**
 * Frozen complete example: q tracks the last emitted rune within a printed word.
 * F emits [q+5,q+5]; non-F emits one of 28 other runes.
 * @param {number[][]} plainWords
 * @param {number} step
 * @returns {number[][]}
 */
function encode(plainWords, step = 5) {
  return plainWords.map(word => {
    const ciphertext = [];
    let q = 0;
    for (const p of word) {
      if (p === 0) {
        const x = (q + step) % 29;
        ciphertext.push(x, x);
        q = x;
      } else {
        const rank = p - 1;
        const x = rank < q ? rank : rank + 1;
        ciphertext.push(x);
        q = x;
      }
    }
    return ciphertext;
  });
}

/**
 * Unique lookahead decoder: adjacent equality is a two-symbol F codeword.
 * @param {number[][]} cipherWords
 * @param {number} step
 * @returns {number[][]}
 */
function decode(cipherWords, step = 5) {
  return cipherWords.map(word => {
    const plaintext = [];
    let q = 0;
    for (let i = 0; i < word.length;) {
      const x = word[i];
      if (i + 1 < word.length && x === word[i + 1]) {
        assert.equal(x, (q + step) % 29, 'wrong F escape follower');
        plaintext.push(0);
        q = x;
        i += 2;
      } else {
        assert.notEqual(x, q, 'unpaired or illicit self-repeat');
        const rank = x < q ? x : x - 1;
        plaintext.push(rank + 1);
        q = x;
        i++;
      }
    }
    return plaintext;
  });
}

// Positive: 95 authentic clear p57 GP symbols repeated, with preserved
// synthetic word divisions and a cross-page layout split inside a word.
const clear57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear57.length, 95);
assert.ok(clear57.includes(0));
const plant = [];
for (let k = 0; k < 6; k++) {
  for (let pos = 0; pos < clear57.length; pos += 7) {
    plant.push(clear57.slice(pos, pos + 7));
  }
}
const cipherPlant = encode(plant);
assert.deepEqual(decode(cipherPlant), plant);
assert.deepEqual(encode(decode(cipherPlant)), cipherPlant);
assert.ok(cipherPlant.flat().length > plant.flat().length);
const carried = cipherPlant[4];
const restoredCarry = [carried.slice(0, 3), carried.slice(3)].flat();
assert.deepEqual(decode([restoredCarry])[0], plant[4]);
assert.throws(() => decode(cipherPlant, 6), /wrong F escape follower/);
console.log(JSON.stringify({
  plant_plain_runes: plant.flat().length,
  plant_cipher_runes: cipherPlant.flat().length,
  plant_words: plant.length,
  native_gp_p57_control: true,
  cross_page_carry_rejoined: true,
  wrong_step_rejected: true,
  conclusion: 'All stationary and four-dot-phase secret F-pair followers excluded on original LP2; no plaintext recovered'
}, null, 2));
