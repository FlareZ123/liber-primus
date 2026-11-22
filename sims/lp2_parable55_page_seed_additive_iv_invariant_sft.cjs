'use strict';

/**
 * Single-file original-source gate for a p57 55-symbol page-seed hypothesis.
 *
 * Claim A: every identical p57 seed on two original pages starts the same
 * possibly aperiodic 29-ary bijective substitution at every page-local rune.
 * Same-position glyph equality must then be preserved.
 *
 * Claim B: every identical seed restarts the same arbitrary additive GP29
 * keystream, with even a free, unknown *constant* additive IV per page.
 * The cross-page glyph differences can rotate by the pair's IV difference,
 * but collisions of those differences across positions are invariant.
 *
 * Reproduction (Windows Node 22):
 * node sims/lp2_parable55_page_seed_additive_iv_invariant_sft.cjs
 *
 * This tests necessary conditions only. It is not a decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = c.pages.filter(p => p.page < 56 && p.indices.length).map(p => p.indices);
const length = original.map(p => p.length);
assert.equal(original.length, 55);
assert.equal(length.reduce((a, b) => a + b, 0), 12956);

/** @param {number} v */
const mod = v => (v % 29 + 29) % 29;
const toIndex = new Map(c.runes.map((r, i) => [r, i]));
const regex = new RegExp('[' + c.runes.join('') + ']+', 'gu');
const sections = read('resources/lp2-transcription.txt').split('%')
  .map(x => x.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''));
const clearWords = [...sections.at(-1).matchAll(regex)]
  .map(m => Array.from(m[0], x => toIndex.get(x)));
assert.equal(clearWords.length, 20);
assert.equal(clearWords.flat().length, 95);
const interior = clearWords.map(w => w.slice(1, -1));
const seeds = {
  title_first: interior.flat(),
  body_first: [...interior.slice(1).flat(), ...interior[0]]
};
assert.equal(seeds.title_first.length, 55);
assert.equal(seeds.body_first.length, 55);

/**
 * Key-blind, no-IV invariant for an arbitrary unknown bijection at each
 * (source seed, local rune offset). Same input iff same output.
 * @param {number[][]} pages
 * @param {number[]} seed
 */
function samePositionEquality(pages, seed) {
  let seedPairs = 0;
  let equal = 0;
  let all = 0;
  for (let i = 0; i < seed.length; i++) {
    for (let j = i + 1; j < seed.length; j++) {
      if (seed[i] !== seed[j]) continue;
      seedPairs++;
      const n = Math.min(pages[i].length, pages[j].length);
      for (let k = 0; k < n; k++) {
        all++;
        if (pages[i][k] === pages[j][k]) equal++;
      }
    }
  }
  assert.equal(seedPairs, 106);
  return { seed_pairs: seedPairs, equal_sites: equal, comparable_sites: all,
    scaled29: 29 * equal / all };
}

/**
 * Key-blind and additive-IV-blind invariant for two same-seed pages:
 * C_it - C_jt = P_it - P_jt + IV_i - IV_j (mod29).
 * The entire 29-bin difference histogram may rotate, but its collision
 * count sum_d n_d(n_d-1) cannot change.
 * @param {number[][]} pages
 * @param {number[]} seed
 */
function pairDifferenceCollisions(pages, seed) {
  let seedPairs = 0;
  let equalPairs = 0;
  let allPairs = 0;
  for (let i = 0; i < seed.length; i++) {
    for (let j = i + 1; j < seed.length; j++) {
      if (seed[i] !== seed[j]) continue;
      seedPairs++;
      const n = Math.min(pages[i].length, pages[j].length);
      const counts = Array(29).fill(0);
      for (let k = 0; k < n; k++) counts[mod(pages[i][k] - pages[j][k])]++;
      equalPairs += counts.reduce((s, n) => s + n * (n - 1), 0);
      allPairs += n * (n - 1);
    }
  }
  assert.equal(seedPairs, 106);
  return { seed_pairs: seedPairs, ordered_equal_pairs: equalPairs,
    ordered_comparable_pairs: allPairs, scaled29: 29 * equalPairs / allPairs };
}

/** @param {number[]} seq */
function partition(seq) {
  let at = 0;
  return length.map(n => {
    const out = seq.slice(at, at + n);
    at += n;
    return out;
  });
}

const gp = new Map(c.translit.map((r, i) => [r, i]));
const aliases = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
/** Deterministic historical GP29 transliteration used by the existing corpus gates.
 * @param {string} text
 */
function gp29(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let at = 0; at < letters.length;) {
    const digraph = letters.slice(at, at + 2);
    if (gp.has(digraph)) {
      out.push(gp.get(digraph));
      at += 2;
    } else {
      const letter = aliases[letters[at]] || letters[at];
      if (gp.has(letter)) out.push(gp.get(letter));
      at++;
    }
  }
  return out;
}

const sourceTexts = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const english = [];
let firstPlain = null;
for (const [source, file] of sourceTexts) {
  const all = gp29(read(file));
  for (let offset = 0; offset + 12956 <= all.length; offset += 12956) {
    const plain = partition(all.slice(offset, offset + 12956));
    if (!firstPlain) firstPlain = plain;
    english.push({
      source, offset,
      title_equal: samePositionEquality(plain, seeds.title_first).scaled29,
      body_equal: samePositionEquality(plain, seeds.body_first).scaled29,
      title_delta: pairDifferenceCollisions(plain, seeds.title_first).scaled29,
      body_delta: pairDifferenceCollisions(plain, seeds.body_first).scaled29
    });
  }
}
assert.equal(english.length, 44);
const observed = {
  title_equal: samePositionEquality(original, seeds.title_first),
  body_equal: samePositionEquality(original, seeds.body_first),
  title_delta: pairDifferenceCollisions(original, seeds.title_first),
  body_delta: pairDifferenceCollisions(original, seeds.body_first)
};
const minimum = Object.fromEntries(
  Object.keys(observed).map(k => [k, Math.min(...english.map(x => x[k]))]));
const expectedOriginal = {
  title_equal: [785, 22716, 1.0021570699066737],
  body_equal: [826, 23150, 1.0347300215982722],
  title_delta: [180828, 5268178, 0.995412835329406],
  body_delta: [183162, 5295942, 1.0029751081110783]
};
for (const [name, vals] of Object.entries(expectedOriginal)) {
  const x = observed[name];
  if (name.endsWith('equal')) {
    assert.equal(x.equal_sites, vals[0]);
    assert.equal(x.comparable_sites, vals[1]);
  } else {
    assert.equal(x.ordered_equal_pairs, vals[0]);
    assert.equal(x.ordered_comparable_pairs, vals[1]);
  }
  assert(Math.abs(x.scaled29 - vals[2]) < 1e-12);
  assert(x.scaled29 < minimum[name], 'Original matches native GP English gate: ' + name);
}
assert(Math.abs(minimum.title_equal - 1.5881317133298116) < 1e-12);
assert(Math.abs(minimum.body_equal - 1.6172354211663067) < 1e-12);
assert(Math.abs(minimum.title_delta - 1.0298175194535948) < 1e-12);
assert(Math.abs(minimum.body_delta - 1.035983777767959) < 1e-12);

/** Positive, independent full-original-length 29-symbol ciphertext plants. */
function plantAndRecover(plainPages, seed) {
  /** @param {number} s @param {number} t */
  const keystream = (s, t) => mod(s * s * 11 + 17 * s * t + 3 * t * t + 7 * t + 23);
  /** @param {number} page */
  const pageIV = page => mod(page * page + 13 * page + 5);
  const cipher = plainPages.map((p, i) => p.map((value, t) =>
    mod(value + keystream(seed[i], t) + pageIV(i))));
  const recovered = cipher.map((p, i) => p.map((value, t) =>
    mod(value - keystream(seed[i], t) - pageIV(i))));
  assert.deepEqual(recovered, plainPages, 'Native GP29 hidden-IV plant must recover exactly');
  assert.deepEqual(pairDifferenceCollisions(cipher, seed), pairDifferenceCollisions(plainPages, seed),
    'Secret same-seed additive stream and page IV cannot alter difference collisions');
  const affine = plainPages.map((p, i) => p.map((value, t) => {
    const a = 1 + ((seed[i] + t * 7) % 28);
    return mod(a * value + seed[i] * 11 + 13 * t);
  }));
  assert.deepEqual(samePositionEquality(affine, seed), samePositionEquality(plainPages, seed),
    'Secret seed-position GP29 affine bijection cannot alter same-position equality');
  return { additive_iv_delta: pairDifferenceCollisions(cipher, seed),
    secret_affine_equality: samePositionEquality(affine, seed),
    recovered_runes: 12956 };
}
const planted = {
  title_first: plantAndRecover(firstPlain, seeds.title_first),
  body_first: plantAndRecover(firstPlain, seeds.body_first)
};
console.log(JSON.stringify({
  original: observed,
  english_controls: { count: english.length, authors: sourceTexts.map(x => x[0]),
    minima_scaled29: minimum },
  exact_positive_plants: planted,
  conclusion: 'Seed-only 29-symbol bijections without an IV and same-seed additive streams with any constant page IV fail the original GP29 English-profile gate; page-dependent key schedule or other registers remain possible'
}, null, 2));
