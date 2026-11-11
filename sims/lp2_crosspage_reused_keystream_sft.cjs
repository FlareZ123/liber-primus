'use strict';

/**
 * Original LP2 cross-page reused-keystream gate.
 *
 * Run: node sims/lp2_crosspage_reused_keystream_sft.cjs
 * This script only reads repository source files; it writes nothing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const RUNE_COUNT = 29;
const POSITION_CAP = 180;
const ABC = '0123456789ABCDEFGHIJKLMNOPQRS';

/** @param {string} relativePath @returns {string} */
function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/** @returns {{pages: number[][], labels: string[]}} */
function originalInput() {
  const data = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const filtered = data.pages.filter(p => p.page <= 55 && p.indices.length > 0);
  assert.equal(filtered.length, 55);
  assert.equal(filtered.reduce((n, p) => n + p.indices.length, 0), 12956);
  assert.equal(data.translit.length, RUNE_COUNT);
  return { pages: filtered.map(p => p.indices), labels: data.translit };
}

/** @param {string} text @param {string[]} alphabet @returns {number[]} */
function tokenizeEnglish(text, alphabet) {
  const input = text.toUpperCase();
  const output = [];
  for (let i = 0; i < input.length;) {
    let symbol = -1;
    let size = 0;
    for (let j = 0; j < RUNE_COUNT; j++) {
      if (alphabet[j].length > size && input.startsWith(alphabet[j], i)) {
        symbol = j;
        size = alphabet[j].length;
      }
    }
    if (symbol < 0) i++;
    else {
      output.push(symbol);
      i += size;
    }
  }
  return output;
}

/** @returns {number[]} */
function tokenizeLatin() {
  const text = read('resources/control/latin-vulgate-gp-wholewords.txt');
  const lines = text.split(/\r?\n/)
    .map(x => x.trim()).filter(x => /^[0-9A-S]+$/.test(x));
  return Array.from(lines.join(''), c => ABC.indexOf(c));
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let x = seed | 0;
  return function random() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Equality of corresponding symbols is preserved by a common bijection for
 * each rune position, including an additive shared GP29 keystream.
 * @param {number[][]} pages
 * @returns {{equal: number, pairs: number, fraction: number}}
 */
function samePositionCollision(pages) {
  let equal = 0;
  let pairs = 0;
  for (let column = 0; column < POSITION_CAP; column++) {
    const counts = new Uint16Array(RUNE_COUNT);
    let n = 0;
    for (const page of pages) {
      if (page.length > column) {
        counts[page[column]]++;
        n++;
      }
    }
    pairs += n * (n - 1) / 2;
    for (const value of counts) equal += value * (value - 1) / 2;
  }
  return { equal, pairs, fraction: equal / pairs };
}

/**
 * For C_page[t] = P_page[t] + K[t] + salt_page (mod 29), the difference
 * histogram for each pair rotates by salt_page - salt_other.
 * Pearson chi-square to uniform is unchanged by this rotation.
 * @param {number[][]} pages
 * @returns {number}
 */
function averageDifferenceChiSquare(pages) {
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const n = Math.min(POSITION_CAP, pages[i].length, pages[j].length);
      const counts = new Uint16Array(RUNE_COUNT);
      for (let k = 0; k < n; k++) {
        counts[(pages[i][k] + RUNE_COUNT - pages[j][k]) % RUNE_COUNT]++;
      }
      let squares = 0;
      for (const value of counts) squares += value * value;
      sum += RUNE_COUNT * squares / n - n;
      pairs++;
    }
  }
  assert.equal(pairs, 1485);
  return sum / pairs;
}

/** @param {number[]} values */
function summary(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    mean, min: sorted[0], max: sorted[sorted.length - 1],
    p05: sorted[Math.floor(values.length * 0.05)],
    p95: sorted[Math.floor(values.length * 0.95)]
  };
}

/**
 * @param {number[][]} pages
 * @param {() => number} random
 * @returns {number[][]}
 */
function circularPageOffsets(pages, random) {
  return pages.map(page => {
    const offset = Math.floor(random() * page.length);
    return Array.from(page, (_, i) => page[(i + offset) % page.length]);
  });
}

/**
 * @param {number[][]} pageShapes
 * @param {number[]} reference
 * @param {() => number} random
 * @returns {number[][]}
 */
function referenceWindows(pageShapes, reference, random) {
  return pageShapes.map(page => {
    const offset = Math.floor(random() * (reference.length - page.length));
    return reference.slice(offset, offset + page.length);
  });
}

/** @param {number[]} reference */
function unigramIoc(reference) {
  const h = new Uint32Array(RUNE_COUNT);
  for (const x of reference) h[x]++;
  let matches = 0;
  for (const count of h) matches += count * (count - 1);
  return matches / (reference.length * (reference.length - 1));
}

function main() {
  const { pages, labels } = originalInput();
  const english = tokenizeEnglish(
    read('resources/control/shakespeare_first300k.txt'), labels
  );
  const latin = tokenizeLatin();
  assert.equal(english.length, 213791);
  assert.equal(latin.length, 204802);
  const observed = samePositionCollision(pages);
  const chiObserved = averageDifferenceChiSquare(pages);
  assert.equal(observed.equal, 8431);
  assert.equal(observed.pairs, 242435);

  const randomCollision = xorshift32(3301);
  const collisionsNull = [];
  const collisionsEnglish = [];
  for (let rep = 0; rep < 300; rep++) {
    collisionsNull.push(samePositionCollision(
      circularPageOffsets(pages, randomCollision)).fraction);
    collisionsEnglish.push(samePositionCollision(
      referenceWindows(pages, english, randomCollision)).fraction);
  }

  const randomChi = xorshift32(3301);
  const chiNull = [];
  const chiEnglish = [];
  for (let rep = 0; rep < 60; rep++) {
    chiNull.push(averageDifferenceChiSquare(
      circularPageOffsets(pages, randomChi)));
    chiEnglish.push(averageDifferenceChiSquare(
      referenceWindows(pages, english, randomChi)));
  }

  const randomLatin = xorshift32(0x33013301);
  const chiLatin = [];
  for (let rep = 0; rep < 60; rep++) {
    chiLatin.push(averageDifferenceChiSquare(
      referenceWindows(pages, latin, randomLatin)));
  }

  // Source-native planted positive: a shared key is invisible to these two
  // equality/difference invariants, even with independent page constants.
  const randomPositive = xorshift32(33012016);
  const planted = referenceWindows(pages, english, randomPositive);
  const sharedKey = Array.from({ length: POSITION_CAP },
    () => Math.floor(randomPositive() * RUNE_COUNT));
  const sharedCipher = planted.map(page =>
    page.map((v, i) => (v + sharedKey[i % POSITION_CAP]) % RUNE_COUNT));
  const saltedCipher = planted.map(page => {
    const salt = Math.floor(randomPositive() * RUNE_COUNT);
    return page.map((v, i) => (v + sharedKey[i % POSITION_CAP] + salt) % RUNE_COUNT);
  });
  assert.equal(samePositionCollision(planted).equal,
    samePositionCollision(sharedCipher).equal);
  assert.ok(Math.abs(averageDifferenceChiSquare(planted)
    - averageDifferenceChiSquare(saltedCipher)) < 1e-9);

  const output = {
    input: { pages: pages.length, runes: 12956, inspectedPositions: POSITION_CAP,
      pairComparisons: 1485, englishReferenceRunes: english.length,
      latinReferenceRunes: latin.length },
    original: { ...observed, averageDifferenceChiSquare: chiObserved },
    baseline: { uniformIoc: 1 / RUNE_COUNT,
      englishIoc: unigramIoc(english), latinIoc: unigramIoc(latin) },
    samePosition: { null300: summary(collisionsNull),
      english300: summary(collisionsEnglish) },
    pairDifferences: { null60: summary(chiNull),
      english60: summary(chiEnglish), latin60: summary(chiLatin) },
    plantedPositive: { collisionInvariant: true,
      saltedDifferenceChiInvariant: true }
  };
  console.log(JSON.stringify(output, null, 2));
}

main();
