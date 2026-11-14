'use strict';

/**
 * A source-fixed alternative-key test: the legacy GIMP Dissolve random field
 * visible in LP2 p57. This tests the actual GP29 ciphertext, not an invented
 * short seed search. All source-dependent variants are frozen below.
 *
 * Reproduce: node sims/lp2_p57_gimp_dissolve_seed_original_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8',
));
const modulus = 29;
const rawPages = corpus.pages.slice(0, 56).filter((p) => p.indices.length);
const unknown = rawPages.flatMap((p) => p.indices);
const firstChapter = rawPages.slice(0, 3).flatMap((p) => p.indices);

/**
 * Original GLib GRand MT19937 initialization and tempering used in GIMP 2.8.
 * The exact printed constants and first outputs are checked against the
 * historical GLib C implementation, independently executed with ctypes.
 * @param {number} seed
 * @returns {() => number} Unsigned 32-bit random integer.
 */
function gRand(seed) {
  const state = new Uint32Array(624);
  state[0] = seed >>> 0;
  for (let i = 1; i < state.length; i += 1) {
    state[i] = (Math.imul(1812433253, state[i - 1] ^ (state[i - 1] >>> 30)) + i) >>> 0;
  }
  let cursor = 624;
  return () => {
    if (cursor === 624) {
      for (let i = 0; i < 624; i += 1) {
        const x = (state[i] & 0x80000000) | (state[(i + 1) % 624] & 0x7fffffff);
        state[i] = (state[(i + 397) % 624]
          ^ (x >>> 1) ^ ((x & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      cursor = 0;
    }
    let x = state[cursor++];
    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;
    return x >>> 0;
  };
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(modulus).fill(0);
  for (const symbol of symbols) counts[symbol] += 1;
  return counts.reduce((sum, value) => sum + value * (value - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @param {number[]} key @param {1|-1} sign */
function decodeDirect(symbols, key, sign) {
  return symbols.map((cipher, i) => (cipher + sign * key[i] + modulus) % modulus);
}

/**
 * Tests complete feasibility of a narrow, explicitly invertible GP29 mode:
 * - plaintext F is literal ciphertext F and consumes zero key;
 * - every other plaintext rune adds the next key rune modulo 29;
 * - a collision with the immediately previous ciphertext rune may consume
 *   another key rune and retry with the SAME plaintext;
 * - observed residual doublets are permitted through zero-skip output.
 *
 * A candidate skip is legal only if every skipped key output would have
 * been the preceding ciphertext glyph. This is stronger than arbitrary
 * hidden-pointer jumps and weaker than a hard no-doublet rule.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {{survives:boolean, firstFailure?:number, paths?:number, maxPaths:number}}
 */
function strictFehuSkipFeasibility(cipher, key) {
  let positions = new Set([0]);
  let maxPaths = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    const next = new Set();
    for (const j of positions) {
      if (cipher[i] === 0) next.add(j);
      for (let skips = 0; skips <= 4; skips += 1) {
        const consumed = j + skips;
        assert.ok(consumed < key.length, 'Insufficient generated key');
        const plain = (cipher[i] - key[consumed] + modulus) % modulus;
        if (plain === 0) continue;
        let valid = true;
        for (let earlier = 0; earlier < skips; earlier += 1) {
          if ((plain + key[j + earlier]) % modulus !== cipher[i - 1]) {
            valid = false;
            break;
          }
        }
        if (valid) next.add(consumed + 1);
      }
    }
    if (!next.size) return { survives: false, firstFailure: i, maxPaths };
    positions = next;
    maxPaths = Math.max(maxPaths, positions.size);
  }
  return { survives: true, paths: positions.size, maxPaths };
}

/**
 * Synthetic control demonstrating a valid original-length F-transparency
 * and collision-skip encoder followed by decoder feasibility.
 * @param {number[]} plain
 * @param {number[]} key
 */
function encodeFehuSkip(plain, key) {
  let j = 0, previous = null;
  const encrypted = [];
  for (const letter of plain) {
    if (letter === 0) {
      encrypted.push(0);
      previous = 0;
      continue;
    }
    let cipher;
    do {
      cipher = (letter + key[j++]) % modulus;
      assert.ok(j < key.length);
    } while (cipher === previous);
    encrypted.push(cipher);
    previous = cipher;
  }
  return { encrypted, finalClock: j };
}

const first = gRand(314159265);
assert.deepEqual(Array.from({ length: 12 }, () => first()), [
  3721122731, 618219707, 807213306, 3144837749,
  3447982176, 3230631767, 755972506, 1398685501,
  3196876378, 1337812403, 909895126, 1889049173,
]);
const make = gRand(314159265);
const raw = Array.from({ length: unknown.length + 2048 }, () => make());
const makeTable = gRand(314159265);
const rowSeeds = Array.from({ length: 4096 }, () => makeTable());
assert.deepEqual(rowSeeds.slice(0, 6), raw.slice(0, 6));
const row0 = gRand(rowSeeds[0]);
assert.deepEqual(Array.from({ length: 20 }, () => row0() % 255), [
  87, 10, 191, 6, 133, 152, 5, 71, 134, 199, 88,
  235, 186, 95, 169, 95, 37, 49, 23, 76,
]);

// GIMP 2.8.10 uses a 4096-entry MT row seed table and g_rand_int_range(0,255).
// The p57 documented source-crop alignment is x+4, y-9 and the detected native
// 293-pixel crop width. This is source-grounded, though the original *canvas*
// size is unknown and using the field as an LP2 key is only a hypothesis.
const imageRandom = [];
for (let y = 0; imageRandom.length < unknown.length + 200; y += 1) {
  const generator = gRand(rowSeeds[((y - 9) % 4096 + 4096) % 4096]);
  for (let x = 0; x < 4; x += 1) generator();
  for (let x = 0; x < 293; x += 1) imageRandom.push(generator());
}
const keyFamilies = [
  ['direct-u32-mod29', raw.map((x) => x % 29)],
  ['direct-gimp-range255-mod29', raw.map((x) => x % 255 % 29)],
  ['source-4096-row-seeds-mod29',
    Array.from({ length: raw.length }, (_, i) => rowSeeds[i % 4096] % 29)],
  ['source-row-first-pixels-range255-mod29',
    Array.from({ length: raw.length }, (_, i) => gRand(rowSeeds[i % 4096])() % 255 % 29)],
  ['source-p57-raster293-x4-y-9-range255-mod29',
    imageRandom.map((x) => x % 255 % 29)],
];

const output = [];
for (const [name, key] of keyFamilies) {
  const add = decodeDirect(unknown, key, 1);
  const subtract = decodeDirect(unknown, key, -1);
  const firstChapterResult = strictFehuSkipFeasibility(firstChapter, key);
  const pageOutcomes = rawPages.map((page) => ({
    page: page.page,
    ...strictFehuSkipFeasibility(page.indices, key),
  }));
  output.push({
    source: name,
    allUnknownIocAdd: ioc(add),
    allUnknownIocSubtract: ioc(subtract),
    first729IocSubtract: ioc(subtract.slice(0, firstChapter.length)),
    strictFehuSkipFirst729: firstChapterResult,
    perPageFeasibleCount: pageOutcomes.filter((item) => item.survives).length,
    perPageFirstFailures: pageOutcomes.filter((item) => !item.survives)
      .slice(0, 6).map((item) => [item.page, item.firstFailure]),
  });

  // A source-native positive plant: take known clear p57 GP runes as text,
  // encrypt under this *exact* GIMP key with the hypothesized cipher,
  // confirm that strict known-key inference includes the true key clock.
  const plant = encodeFehuSkip(corpus.pages[57].indices, key);
  const recovered = strictFehuSkipFeasibility(plant.encrypted, key);
  assert.ok(recovered.survives, 'Must admit the planted native GP cipher');
  assert.ok(recovered.paths >= 1);
}

assert.equal(unknown.length, 12956);
assert.equal(firstChapter.length, 729);
assert.ok(Math.abs(ioc(corpus.pages[57].indices) - 0.06270996640537514) < 1e-12);
assert.equal(output[0].strictFehuSkipFirst729.firstFailure, 471);
assert.equal(output[1].strictFehuSkipFirst729.firstFailure, 26);
assert.equal(output[4].strictFehuSkipFirst729.firstFailure, 16);
for (const candidate of output) {
  assert.ok(candidate.allUnknownIocAdd < 0.036);
  assert.ok(candidate.allUnknownIocSubtract < 0.036);
}
console.log(JSON.stringify({
  controlP57PlainIoc: ioc(corpus.pages[57].indices),
  originalUnknownCipherRunes: unknown.length,
  originalFirstChapterRunes: firstChapter.length,
  originalPages: rawPages.length,
  variants: output,
  conclusion: 'No source-selected unknown LP2 plaintext or GIMP pad in tested exact transports',
}, null, 2));
