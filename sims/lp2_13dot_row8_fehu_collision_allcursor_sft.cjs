'use strict';

/**
 * Original 31 thirteen-dot marks -> 32 intervals -> 32 original eight-byte
 * numeric table rows. Exact F-transparent, collision-conditional key-skip
 * inversion with every admissible consumed-key cursor retained.
 *
 * This tests a narrowly source-aligned hypothesis; it does not claim the
 * punctuation actually instructs this cipher. No hidden fitted parameters.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

/** @param {string} file */
function load(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const annotated = load('resources/liber-primus/lp2-ink-annotations.json');
const allRunes = corpus.pages.flatMap(p => p.indices);
assert.equal(allRunes.length, 13136);

/** @type {number[]} */
const boundaries = [0];
let seen = 0;
for (const page of corpus.pages) {
  const notes = annotated.pages.find(x => x.page === page.page);
  for (const mark of notes?.large_punctuation || []) {
    if (mark[1] === 13) boundaries.push(seen + mark[0]);
  }
  seen += page.indices.length;
}
boundaries.push(allRunes.length);
const intervals = Array.from({ length: boundaries.length - 1 },
  (_, i) => allRunes.slice(boundaries[i], boundaries[i + 1]));
const lengths = intervals.map(x => x.length);
assert.deepEqual(lengths, [
  13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11,
  1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008,
  9, 299, 5, 80, 7, 88
]);
assert.equal(intervals.length, 32);
assert.equal(intervals.slice(0, 28).reduce((n, x) => n + x.length, 0), 12956);

const digits59 = grid.alphabet.replace('f', '');

/** @param {number} radix */
function table(radix) {
  if (radix === 60) return grid.byte_rows;
  return grid.rows.map(row => row.map(token => {
    const left = digits59.indexOf(token[0]);
    const right = digits59.indexOf(token[1]);
    assert.ok(left >= 0 && right >= 0);
    return radix * left + right;
  }));
}

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} row @returns {Uint8Array} */
function repeatingPad(row) {
  assert.equal(row.length, 8);
  assert.ok(new Set(row.map(x => x % 29)).size > 1,
    'constant-pad row needs special modular state representation');
  return Uint8Array.from({ length: 16000 }, (_, i) => row[i % 8] % 29);
}

/**
 * F plaintext bypasses both key clock and arithmetic.
 * Rejected proposals consume key ONLY if they repeat the preceding emitted
 * C under the identical (unknown) plaintext rune.
 * A rejection run of length m requires all m rejected pad residues equal.
 * The first differing value terminates all longer lawful skip candidates.
 *
 * @param {number[]} cipher
 * @param {Uint8Array} key
 * @param {1|-1} sign
 * @param {number|null} firstPrevious
 * @returns {{reached:number,states:Set<number>,peak:number}}
 */
function invertAllCursors(cipher, key, sign, firstPrevious) {
  let cursors = new Set([0]);
  let peak = 1;
  for (let i = 0; i < cipher.length; i++) {
    const current = cipher[i];
    const previous = i ? cipher[i - 1] : firstPrevious;
    const next = new Set();
    for (const cursor of cursors) {
      if (current === 0) next.add(cursor);
      for (let skips = 0; cursor + skips < key.length; skips++) {
        if (skips && previous === null) break;
        if (skips > 1 && key[cursor + skips - 1] !== key[cursor]) break;
        const plain = mod29(current - sign * key[cursor + skips]);
        if (plain === 0) continue;
        if (skips === 0 || mod29(plain + sign * key[cursor]) === previous) {
          next.add(cursor + skips + 1);
        }
      }
    }
    cursors = next;
    peak = Math.max(peak, cursors.size);
    if (!cursors.size) return { reached: i, states: cursors, peak };
  }
  return { reached: cipher.length, states: cursors, peak };
}

/** @param {number} seed */
function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * @param {number[]} plain
 * @param {Uint8Array} key
 * @param {1|-1} sign
 * @param {number|null} previous
 * @param {()=>number} random
 * @returns {{cipher:number[],consumed:number,rejected:number,bypass:number}}
 */
function plant(plain, key, sign, previous, random) {
  const cipher = [];
  let consumed = 0, rejected = 0, bypass = 0;
  for (const value of plain) {
    if (value === 0) {
      cipher.push(0);
      previous = 0;
      bypass++;
      continue;
    }
    for (;;) {
      assert.ok(consumed < key.length);
      const candidate = mod29(value + sign * key[consumed++]);
      if (previous !== null && candidate === previous && random() < 13 / 16) {
        rejected++;
        continue;
      }
      cipher.push(candidate);
      previous = candidate;
      break;
    }
  }
  return { cipher, consumed, rejected, bypass };
}

const clear57 = corpus.pages[57].indices;
assert.equal(clear57.length, 95);
const results = [];
let positiveControls = 0;
for (const radix of [60, 59]) {
  const rows = table(radix);
  for (const reverse of [false, true]) {
    for (const sign of /** @type {Array<1|-1>} */ ([1, -1])) {
      for (const carry of [false, true]) {
        const configuration = { radix, reverse, sign, carry };
        let decodedOriginal = 0, fullOriginal = 0, maxPrefix = 0;
        let previousOriginal = null, previousPlant = null;
        const random = xorshift((0x3301abcd ^ (radix << 16) ^
          ((reverse ? 1 : 0) << 10) ^ ((sign === 1 ? 1 : 0) << 6) ^
          (carry ? 1 : 0)) >>> 0);
        let plantedRejects = 0, plantedBypass = 0;
        for (let interval = 0; interval < 28; interval++) {
          const row = reverse ? rows[interval].slice().reverse() : rows[interval];
          const pad = repeatingPad(row);
          const given = intervals[interval];
          const firstOriginal = carry ? previousOriginal : null;
          const result = invertAllCursors(given, pad, sign, firstOriginal);
          decodedOriginal += result.reached;
          maxPrefix = Math.max(maxPrefix, result.reached);
          if (result.reached === given.length) fullOriginal++;
          if (given.length) previousOriginal = given[given.length - 1];

          const plain = Array.from({ length: given.length },
            (_, i) => clear57[i % clear57.length]);
          const firstPlant = carry ? previousPlant : null;
          const test = plant(plain, pad, sign, firstPlant, random);
          const recovered = invertAllCursors(test.cipher, pad, sign, firstPlant);
          assert.equal(recovered.reached, plain.length);
          assert.ok(recovered.states.has(test.consumed));
          if (test.cipher.length) previousPlant = test.cipher[test.cipher.length - 1];
          plantedRejects += test.rejected;
          plantedBypass += test.bypass;
          positiveControls++;
        }
        assert.ok(fullOriginal < 28);
        assert.ok(plantedRejects > 0);
        assert.ok(plantedBypass > 0);
        results.push({ ...configuration, decodedOriginal, fullOriginal,
          maxPrefix, positiveRejects: plantedRejects,
          positiveBypass: plantedBypass });
      }
    }
  }
}

assert.equal(results.length, 16);
assert.equal(positiveControls, 448);
assert.equal(Math.max(...results.map(x => x.fullOriginal)), 14);
assert.equal(Math.max(...results.map(x => x.decodedOriginal)), 2523);
assert.equal(results.filter(x => x.fullOriginal === 28).length, 0);
// Carrying prior ciphertext across row resets should not be selected to
// improve any frozen original-input configuration in this finite experiment.
for (let i = 0; i < results.length; i += 2) {
  assert.equal(results[i].decodedOriginal, results[i + 1].decodedOriginal);
  assert.equal(results[i].fullOriginal, results[i + 1].fullOriginal);
}

console.log(JSON.stringify({
  source: '31 original thirteen-dot events; 32 intervals; 32x8 native byte grid',
  originalUnknownRunes: 12956,
  originalIntervals: 28,
  configurations: results.length,
  nativeClearGPPositiveIntervals: positiveControls,
  successfulFullOriginalConfigurations: 0,
  maxCompletelyEncodedIntervals: Math.max(...results.map(x => x.fullOriginal)),
  maxEncodedOriginalPrefixSum: Math.max(...results.map(x => x.decodedOriginal)),
  individualRuns: results
}, null, 2));
