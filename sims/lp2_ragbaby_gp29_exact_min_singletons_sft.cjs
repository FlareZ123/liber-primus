'use strict';

/**
 * All-key exact minimum number of plaintext singleton word types for a
 * full-book GP29 Ragbaby word-number cipher.
 *
 * Source: resources/liber-primus/lp2-transcription.txt and lp2-corpus.json.
 * Under an arbitrary secret alphabet K and standard 1-based word clock w:
 *    K(cipher[w,j]) = K(plain[w,j]) + w + j (mod 29).
 *
 * We fix K(cipher glyph #13)=0 without loss of generality (rotational
 * gauge). For every complete one-rune word (g,w), its plaintext rank is
 * (K(g)-w) mod29. We exhaust the possible rank sets of cardinality <=11
 * and use bipartite matching to decide whether any of the 29! secret
 * alphabets could realize them. At cardinality12 we construct a witness.
 *
 * This proves only a conditional cipher-family obstruction; no plaintext
 * or authentic key is claimed. Windows Node.js 22, no external modules.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
assert.equal(corpus.runes.length, 29);

const glyphIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @type {number[][]} */
const words = [];
let word = [];
for (const ch of transcription) {
  if (glyphIndex.has(ch)) word.push(glyphIndex.get(ch));
  else if (ch === '-' || ch === '.') {
    if (word.length) words.push(word);
    word = [];
  }
}
if (word.length) words.push(word);

const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(words.flat().slice(0, 12956), original);

let symbols = 0;
const sourceWords = [];
for (const w of words) {
  if (symbols === original.length) break;
  symbols += w.length;
  assert.ok(symbols <= original.length);
  sourceWords.push(w);
}
assert.equal(symbols, 12956);
assert.equal(sourceWords.length, 2896);

/** @type {number[][]} */
const shifts = Array.from({ length: 29 }, () => []);
let singletonCount = 0;
sourceWords.forEach((w, i) => {
  if (w.length !== 1) return;
  singletonCount++;
  const g = w[0];
  const shift = (i + 1) % 29;
  if (!shifts[g].includes(shift)) shifts[g].push(shift);
});
shifts.forEach(w => w.sort((a, b) => a - b));
assert.equal(singletonCount, 83);
assert.deepEqual(shifts[13], [10, 15, 16, 22, 23]);
assert.deepEqual(shifts[16], [6, 12, 13, 16, 20]);
assert.deepEqual(shifts[19], [14, 15, 17, 19, 21]);

const mod = x => (x % 29 + 29) % 29;
const masks = Array.from({ length: 29 }, (_, g) =>
  Array.from({ length: 29 }, (_, rank) =>
    shifts[g].reduce((bits, w) => bits | (1 << mod(rank - w)), 0)));
const fixedCipherGlyph = 13;
const fixedRank = 0;
const fixedSet = masks[fixedCipherGlyph][fixedRank];
const freePositions = Array.from({ length: 29 }, (_, r) => r)
  .filter(r => !(fixedSet & (1 << r)));
assert.equal(freePositions.length, 24);
const order = Array.from({ length: 29 }, (_, g) => g)
  .filter(g => g !== fixedCipherGlyph)
  .sort((a, b) => shifts[b].length - shifts[a].length || a - b);

/**
 * @param {number} setMask allowed singleton plaintext *alphabet ranks*
 * @returns {number[] | null} a full bijection rank[g] or null.
 */
function secretAlphabetIfPossible(setMask) {
  const domains = Array(29).fill(0);
  for (const g of order) {
    let possible = 0;
    for (let rank = 1; rank < 29; rank++) {
      if ((masks[g][rank] & setMask) === masks[g][rank])
        possible |= 1 << rank;
    }
    if (!possible) return null;
    domains[g] = possible;
  }

  const occupant = new Int8Array(29).fill(-1);
  occupant[0] = fixedCipherGlyph;

  /** @param {number} g @param {Uint8Array} seen */
  function augment(g, seen) {
    let bits = domains[g];
    while (bits) {
      const bit = bits & -bits;
      bits ^= bit;
      const r = 31 - Math.clz32(bit);
      if (seen[r]) continue;
      seen[r] = 1;
      const incumbent = occupant[r];
      if (incumbent < 0 || augment(incumbent, seen)) {
        occupant[r] = g;
        return true;
      }
    }
    return false;
  }
  for (const g of order) {
    if (!augment(g, new Uint8Array(29))) return null;
  }
  const rankOf = Array(29).fill(-1);
  for (let r = 0; r < 29; r++) rankOf[occupant[r]] = r;
  assert.equal(new Set(rankOf).size, 29);
  return rankOf;
}

/**
 * Exhaust every candidate singleton rank set containing the five
 * prescribed ranks for ciphertext P, with a fixed alphabet rotation.
 * @param {number} desiredSize
 */
function exhaustiveCardinality(desiredSize) {
  const need = desiredSize - 5;
  let checked = 0;
  let domainsPassed = 0;
  let witness = null;
  let witnessMask = 0;

  function choose(start, remain, mask) {
    if (remain === 0) {
      checked++;
      const rank = secretAlphabetIfPossible(mask);
      if (rank) {
        domainsPassed++;
        witness = rank;
        witnessMask = mask;
        return true;
      }
      return false;
    }
    for (let j = start; j <= freePositions.length - remain; j++) {
      if (choose(j + 1, remain - 1, mask | (1 << freePositions[j])))
        return true;
    }
    return false;
  }
  const possible = choose(0, need, fixedSet);
  return { possible, checked, domainsPassed, rank: witness, setMask: witnessMask };
}

let totalExcludedSets = 0;
for (let k = 5; k <= 11; k++) {
  const r = exhaustiveCardinality(k);
  assert.equal(r.possible, false, 'Unexpected <=11 singleton secret alphabet');
  totalExcludedSets += r.checked;
  console.log('size=' + k + ' subset candidates=' + r.checked
    + ' full-match=0');
}
const attainable = exhaustiveCardinality(12);
assert.equal(attainable.possible, true);
const rank = attainable.rank;
const S = new Set();
for (let g = 0; g < 29; g++) {
  for (const w of shifts[g]) {
    const v = mod(rank[g] - w);
    assert.ok(attainable.setMask & (1 << v));
    S.add(v);
  }
}
assert.equal(S.size, 12);
assert.deepEqual([...S].sort((a, b) => a - b),
  [0, 1, 6, 7, 13, 14, 15, 19, 22, 23, 25, 27]);
assert.deepEqual(rank,
  [21, 20, 16, 14, 2, 1, 28, 13, 22, 18, 4, 3, 9, 0, 10, 19,
   6, 17, 27, 15, 11, 8, 23, 24, 25, 7, 12, 5, 26]);

// Full 12,956-symbol forward/reverse exact witness with *only* 12
// different one-letter plaintext glyph types, no English asserted.
const invRank = Array(29);
rank.forEach((r, g) => { invRank[r] = g; });
const syntheticPlaintext = sourceWords.map((w, wi) =>
  w.map((c, j) => invRank[mod(rank[c] - (wi + 1) - j)]));
assert.equal(syntheticPlaintext.flat().length, 12956);
const planted = syntheticPlaintext.map((w, wi) =>
  w.map((p, j) => invRank[mod(rank[p] + (wi + 1) + j)]));
assert.deepEqual(planted, sourceWords);
const plainSingletonRanks = new Set(
  syntheticPlaintext.filter(w => w.length === 1).map(w => rank[w[0]]));
assert.equal(plainSingletonRanks.size, 12);

console.log('PASS: original 12956 runes / 2896 words / 83 singleton words.');
console.log('PASS: ' + totalExcludedSets + ' exhaustively inspected sets of 5..11'
  + ' singleton alphabet ranks; none admits any secret GP29 permutation.');
console.log('PASS: minimum 12 singleton plaintext glyph types attainable.');
console.log('  original-shape recovered and reencryped 12956/12956 GP runes.');
console.log('  witness rank: ' + JSON.stringify(rank));
console.log('  singleton plaintext rank set: '
  + JSON.stringify([...S].sort((a, b) => a - b)));
console.log('NO UNKNOWN ENGLISH PLAINTEXT OR AUTHENTIC KEY.');
