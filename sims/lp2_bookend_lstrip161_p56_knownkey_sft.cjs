'use strict';

/**
 * LP2 first-square L-strip -> terminal p55+p56 key-lookup test.
 *
 * A source-shaped known-plaintext attack on the proposed 81x81 -> 80x80
 * deletion strip (81+80=161) and the original p55(76)+p56(85)=161 register.
 * No edits to the supplied source and no unknown plaintext is assumed.
 *
 * Run from repository root with Node.js 22:
 *   node sims/lp2_bookend_lstrip161_p56_knownkey_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const index = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const all = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
const early = all.slice(0, 81 * 81);
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const c56 = corpus.pages.find((page) => page.page === 56).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const solved56 = solved.sections.find((section) => section.name === 'p56_an_end');
const p56 = [...solved56.source_text].filter((ch) => index.has(ch)).map((ch) => index.get(ch));

assert.equal(corpus.runes.length, 29);
assert.equal(all.length, 12956);
assert.equal(early.length, 6561);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(c56.length, 85);
assert.equal(p57.length, 95);
assert.equal(p55.length + p56.length, 81 * 81 - 80 * 80);
assert.equal(p55.length + p56.length + p57.length, 256);

function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
  }
  return primes;
}

// The original 85-rune p56 known text is checked independently against its
// authentic totient-prime mode, including the one plaintext F nonconsumption.
const primes = firstPrimes(90);
let clock = 0;
for (let i = 0; i < p56.length; i++) {
  const p = p56[i];
  const expected = p === 0 ? 0 : (p + primes[clock++ ] - 1) % 29;
  assert.equal(c56[i], expected, 'historical p56 mode at rune ' + i);
}
assert.equal(clock, 84);

function mapPoint(symmetry, x, y) {
  switch (symmetry) {
    case 0: return [x, y];
    case 1: return [80 - x, y];
    case 2: return [x, 80 - y];
    case 3: return [80 - x, 80 - y];
    case 4: return [y, x];
    case 5: return [80 - y, x];
    case 6: return [y, 80 - x];
    case 7: return [80 - y, 80 - x];
    default: throw new Error('invalid square symmetry');
  }
}

function sourceStrip(symmetry, reverse) {
  const strip = [];
  function push(x, y) {
    const point = mapPoint(symmetry, x, y);
    strip.push(early[point[1] * 81 + point[0]]);
  }
  // Delete the final 81-wide row, then the final 80-high column, one overlap.
  for (let x = 0; x < 81; x++) push(x, 80);
  for (let y = 0; y < 80; y++) push(80, y);
  assert.equal(strip.length, 161);
  return reverse ? strip.reverse() : strip;
}

/** Evaluate every secret single-valued key lookup, without enumerating it. */
function contradictions(input, target) {
  assert.equal(input.length, target.length);
  const seen = new Map();
  let mismatches = 0;
  let first = -1;
  for (let j = 0; j < input.length; j++) {
    if (seen.has(input[j])) {
      if (seen.get(input[j]) !== target[j]) {
        mismatches++;
        if (first < 0) first = j;
      }
    } else seen.set(input[j], target[j]);
  }
  return { mismatches, first, distinct: seen.size, map: seen };
}

const summaries = [];
for (let symmetry = 0; symmetry < 8; symmetry++) {
  for (const reverse of [false, true]) {
    const strip = sourceStrip(symmetry, reverse);
    const tail = strip.slice(76);
    const neededShift = c56.map((v, j) => (v - p56[j] + 29) % 29);
    const pad = contradictions(tail, neededShift);
    const plain = contradictions(tail, p56);
    const known = new Set(tail);
    const transferable = strip.slice(0, 76).filter((value) => known.has(value)).length;
    summaries.push({
      symmetry, reverse, padConflicts: pad.mismatches,
      plainConflicts: plain.mismatches, firstPadConflict: pad.first,
      knownClasses: pad.distinct, transferable
    });
    assert(pad.mismatches > 0, 'original key-lookup should contradict');
    assert(plain.mismatches > 0, 'original plaintext lookup should contradict');
  }
}
assert.equal(summaries.length, 16);
assert.equal(Math.min(...summaries.map((v) => v.padConflicts)), 54);
assert.equal(Math.max(...summaries.map((v) => v.padConflicts)), 59);
assert.equal(Math.min(...summaries.map((v) => v.plainConflicts)), 51);

// Grant the *authentic* p56 plaintext-F-transparent clock too. In p55 there
// are three literal F ciphertext symbols, each of which may or may not use
// one strip-key slot, so the p56 start may be any slot 73,74,75,76. The one
// genuine plaintext F in p56 NEVER consumes a strip-key slot. This tests all
// four possible unknown-page key consumptions, with no original plaintext
// guess or clock-phase fitting.
const p55FCipherCount = p55.filter((v) => v === 0).length;
assert.equal(p55FCipherCount, 3);
const skipSummaries = [];
for (let symmetry = 0; symmetry < 8; symmetry++) {
  for (const reverse of [false, true]) {
    const strip = sourceStrip(symmetry, reverse);
    for (let consumed55 = p55.length - p55FCipherCount; consumed55 <= p55.length; consumed55++) {
      const input = [];
      const needed = [];
      let consumed56 = 0;
      for (let j = 0; j < p56.length; j++) {
        if (p56[j] === 0) continue;
        input.push(strip[consumed55 + consumed56++]);
        needed.push((c56[j] - p56[j] + 29) % 29);
      }
      assert.equal(consumed56, 84);
      const test = contradictions(input, needed);
      skipSummaries.push({
        symmetry, reverse, consumed55, consumed56,
        keyConflicts: test.mismatches
      });
      assert(test.mismatches > 0);
    }
  }
}
assert.equal(skipSummaries.length, 64);
assert.equal(Math.min(...skipSummaries.map((v) => v.keyConflicts)), 51);
assert.equal(Math.max(...skipSummaries.map((v) => v.keyConflicts)), 57);

// A planted *nonlinear, secret* 29-way GP lookup proves the consistency test
// is sensitive. Learn it on synthetic p56 and recover p55 without knowing
// the planted mapping, at each p55 position covered by p56 source symbols.
const plantedStrip = sourceStrip(5, false);
const secret = (v) => (7 * v * v + 3 * v + 11) % 29;
const syntheticC56 = p56.map((p, j) => (p + secret(plantedStrip[76 + j])) % 29);
const learned = contradictions(
  plantedStrip.slice(76),
  syntheticC56.map((c, j) => (c - p56[j] + 29) % 29)
);
assert.equal(learned.mismatches, 0);
const syntheticC55 = p57.slice(0, 76).map((p, j) => (p + secret(plantedStrip[j])) % 29);
let recovered = 0;
for (let j = 0; j < syntheticC55.length; j++) {
  if (learned.map.has(plantedStrip[j])) {
    assert.equal(
      (syntheticC55[j] - learned.map.get(plantedStrip[j]) + 29) % 29,
      p57[j],
      'known-plaintext plant at p55 position ' + j
    );
    recovered++;
  }
}
assert.equal(recovered, 75);

console.log(JSON.stringify({
  source: 'original first 6561 GP29 runes; authentic p55 and p56',
  interpretation: '81x81 final-row/column L-strip; eight dihedral symmetries and reversal',
  historicalP56PrimeMode: '85/85 exact, including one transparent F and 84 key terms',
  allSecretLookup: '0/16 variants consistent with original p56 known plaintext',
  sourceShapes: summaries,
  sourceTransparentF: { variants: skipSummaries.length, minimumContradictions: 51, maximumContradictions: 57 },
  nonlinearPositive: '0 contradictions; ' + recovered + '/76 planted p55 runes recovered from p56',
  verdict: 'The literal L-strip terminal key-lookup family fails; no LP2 plaintext recovered.'
}, null, 2));
