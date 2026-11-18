'use strict';
/**
 * Exact original-input gate for a p50 leading-zero collision/rejection cipher.
 *
 * Proposed emitter:
 *   K[j] = p50 byte[j mod 256] mod 29
 *   Z[j] = literal p50 token begins with '0'
 *   candidate = P + sign*K[j] mod 29
 *   if candidate === previous ciphertext and !Z[j], consume j and retry
 *   otherwise emit candidate and consume j
 *
 * The model is motivated by the original observation that literal leading-zero
 * p50 cells contain 33/86 adjacent ciphertext repeats despite only ~23.4% of
 * eligible positions.  This test grants every long original word all 256
 * starting phases and every possible first-rune collision comparator, both
 * additive signs, and asks only whether a registered native-GP English word
 * can be a complete exact preimage.
 *
 * Windows 11 / Node 22 / CommonJS.  Read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const rawLexicon = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8'
);

const symbols = new Map(gp.runes.map((s, i) => [s, i]));
const words = parseLP2Words(transcription, 55).words.map((word) =>
  Array.from(word.runes, (rune) => {
    const value = symbols.get(rune);
    assert.notEqual(value, undefined);
    return value;
  })
);
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
assert.deepEqual(words.flat(), gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices));

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
const key = grid.bytes.map((value) => value % 29);
const leadingZero = tokens.map((token) => token[0] === '0');

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

const translitTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw @returns {number[]} */
function encodeWord(raw) {
  const s = raw.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (s.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = translitTokens.find((item) => s.startsWith(item.s, i));
    if (!token) return [];
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

const lexByLength = new Map();
for (const line of rawLexicon.split(/\r?\n/u)) {
  if (!/^[A-Za-z]+ /u.test(line)) continue;
  const raw = line.split(' ', 1)[0].toUpperCase();
  const encoded = encodeWord(raw);
  if (encoded.length < 10 || encoded.length > 14) continue;
  if (!lexByLength.has(encoded.length)) lexByLength.set(encoded.length, new Map());
  lexByLength.get(encoded.length).set(encoded.join(','), {word: raw, encoded});
}
for (const raw of ['CIRCUMFERENCES', 'BEHAVIORS', 'ENCRYPTED', 'ILLUSIONS', 'INHABITING', 'PRIMALITY']) {
  const encoded = encodeWord(raw);
  if (encoded.length < 10 || encoded.length > 14) continue;
  if (!lexByLength.has(encoded.length)) lexByLength.set(encoded.length, new Map());
  lexByLength.get(encoded.length).set(encoded.join(','), {word: raw, encoded});
}
assert.deepEqual(
  Object.fromEntries([...lexByLength].map(([length, group]) => [length, group.size])),
  {10: 2388, 11: 1450, 12: 767, 13: 379, 14: 154}
);

/** @param {{word:string, encoded:number[]}[]} entries */
function makeTrie(entries) {
  const edge = [new Int32Array(29).fill(-1)];
  const ends = [''];
  for (const {word, encoded} of entries) {
    let node = 0;
    for (const digit of encoded) {
      let next = edge[node][digit];
      if (next === -1) {
        next = edge.length;
        edge[node][digit] = next;
        edge.push(new Int32Array(29).fill(-1));
        ends.push('');
      }
      node = next;
    }
    ends[node] = word;
  }
  return {edge, ends};
}
const tries = new Map([...lexByLength].map(([length, group]) =>
  [length, makeTrie([...group.values()])]
));

/**
 * Emit exactly one plaintext rune under the proposed retry rule.
 * @param {number} plain
 * @param {number} phase
 * @param {number} previousCipher
 * @param {1|-1} sign
 * @returns {{cipher:number,next:number,rejections:number}|null}
 */
function emitRune(plain, phase, previousCipher, sign) {
  for (let rejections = 0; rejections < 256; rejections += 1) {
    const candidate = mod29(plain + sign * key[phase]);
    const next = (phase + 1) & 255;
    if (candidate !== previousCipher || leadingZero[phase]) {
      return {cipher: candidate, next, rejections};
    }
    phase = next;
  }
  return null;
}

/**
 * Return one exact complete dictionary preimage when any exists.
 * First-rune comparator is deliberately granted all 29 values.
 * @param {number[]} cipher
 * @param {{edge:Int32Array[],ends:string[]}} trie
 * @param {1|-1} sign
 * @returns {object|null}
 */
function reachWord(cipher, trie, sign) {
  let states = new Map();

  for (let start = 0; start < 256; start += 1) {
    for (let previousCipher = 0; previousCipher < 29; previousCipher += 1) {
      for (let plain = 0; plain < 29; plain += 1) {
        const child = trie.edge[0][plain];
        if (child < 0) continue;
        const emitted = emitRune(plain, start, previousCipher, sign);
        if (!emitted || emitted.cipher !== cipher[0]) continue;
        const id = emitted.next + ',' + child;
        if (!states.has(id)) {
          states.set(id, {
            phase: emitted.next,
            node: child,
            start,
            previousCipher,
            plaintext: [plain],
            rejections: [emitted.rejections]
          });
        }
      }
    }
  }

  for (let i = 1; i < cipher.length && states.size > 0; i += 1) {
    const nextStates = new Map();
    const previousCipher = cipher[i - 1];
    const target = cipher[i];

    for (const state of states.values()) {
      const edges = trie.edge[state.node];
      for (let plain = 0; plain < 29; plain += 1) {
        const child = edges[plain];
        if (child < 0) continue;
        const emitted = emitRune(plain, state.phase, previousCipher, sign);
        if (!emitted || emitted.cipher !== target) continue;
        const id = emitted.next + ',' + child;
        if (!nextStates.has(id)) {
          nextStates.set(id, {
            phase: emitted.next,
            node: child,
            start: state.start,
            previousCipher: state.previousCipher,
            plaintext: state.plaintext.concat(plain),
            rejections: state.rejections.concat(emitted.rejections)
          });
        }
      }
    }
    states = nextStates;
  }

  for (const state of states.values()) {
    const word = trie.ends[state.node];
    if (word) return {...state, word};
  }
  return null;
}

/**
 * @param {number[]} plaintext
 * @param {number} start
 * @param {number} previousCipher
 * @param {1|-1} sign
 * @returns {{cipher:number[],rejections:number[],end:number}}
 */
function encryptWord(plaintext, start, previousCipher, sign) {
  let phase = start;
  const cipher = [];
  const rejections = [];
  for (const plain of plaintext) {
    const previous = cipher.length ? cipher[cipher.length - 1] : previousCipher;
    const emitted = emitRune(plain, phase, previous, sign);
    assert(emitted);
    cipher.push(emitted.cipher);
    rejections.push(emitted.rejections);
    phase = emitted.next;
  }
  return {cipher, rejections, end: phase};
}

// Forced-rejection positive.  The exact inverse must recover CIRCUMFERENCES.
const plantPlain = encodeWord('CIRCUMFERENCES');
assert.equal(plantPlain.length, 14);
const plant = encryptWord(plantPlain, 0, 0, -1);
assert.deepEqual(plant.rejections, [0,0,1,0,0,0,0,0,0,0,0,1,0,0]);
assert.deepEqual(plant.cipher, [5,11,21,24,25,9,20,13,16,7,19,1,9,6]);
const plantHit = reachWord(plant.cipher, tries.get(14), -1);
assert(plantHit);
assert.equal(plantHit.word, 'CIRCUMFERENCES');
assert(plantHit.rejections.some((count) => count > 0));

const longSlots = words.map((word, index) => ({word, index}))
  .filter(({word}) => word.length >= 10 && word.length <= 14);
assert.equal(longSlots.length, 109);

let hitSlots = 0;
const hits = [];
for (const slot of longSlots) {
  const trie = tries.get(slot.word.length);
  for (const sign of [-1, 1]) {
    const hit = reachWord(slot.word, trie, sign);
    if (hit) {
      hitSlots += 1;
      hits.push({
        slot: slot.index,
        length: slot.word.length,
        sign,
        word: hit.word,
        start: hit.start,
        firstComparator: hit.previousCipher,
        rejections: hit.rejections
      });
    }
  }
}
assert.equal(hitSlots, 0);
assert.deepEqual(hits, []);

console.log(JSON.stringify({
  originalRunes: 12956,
  originalWords: words.length,
  testedLongWordSlots: longSlots.length,
  registeredLongLexiconTypes: [...lexByLength.values()].reduce((sum, group) => sum + group.size, 0),
  bothSigns: true,
  startingPhasesPerWord: 256,
  firstComparatorsPerWord: 29,
  exactOriginalHitSlots: hitSlots,
  forcedRejectionPlant: {
    word: 'CIRCUMFERENCES',
    cipher: plant.cipher,
    rejections: plant.rejections,
    recovered: plantHit.word
  }
}, null, 2));
console.log('PASS: exact p50 leading-zero collision/rejection decoder has zero registered English preimages at all 109 original long-word slots.');
