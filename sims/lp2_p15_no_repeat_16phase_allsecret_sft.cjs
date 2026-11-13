'use strict';
/**
 * Original LP2 p15 no-repeat / 16-phase all-secret alphabet gate.
 * The 16 visible p15 spiral entries motivate the phase only. Every phase
 * is granted any secret 28-symbol alphabet bijection; no actual key is fit.
 * Run: node sims/lp2_p15_no_repeat_16phase_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.resolve(__dirname, '..', filename), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page >= 16 && p.page <= 22)
  .map(p => p.indices);
assert.deepEqual(pages.map(p => p.length), [267, 273, 260, 271, 269, 273, 131]);
const tokens = corpus.translit.map((token, code) => ({ token, code }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function encodeEnglish(text) {
  const result = [];
  for (const match of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = match.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let offset = 0; offset < word.length;) {
      const found = tokens.find(t => word.startsWith(t.token, offset));
      assert.ok(found, 'unsupported source English symbol: ' + word);
      result.push(found.code);
      offset += found.token.length;
    }
  }
  return result;
}

/**
 * @param {number[][]} shaped
 * @param {'chapter'|'page'} reset
 * @param {'all'|'nonzero'} clock
 * @param {boolean} isCiphertext
 * @returns {{numerator:number, denominator:number, ioc:number, repeats:number, eligible:number}}
 */
function fingerprint(shaped, reset, clock, isCiphertext) {
  const groups = Array.from({ length: 16 }, () => Array(28).fill(0));
  let consumed = 0;
  let repeats = 0;
  let eligible = 0;
  for (const page of shaped) {
    if (reset === 'page') consumed = 0;
    let previous = page[0];
    for (let i = 1; i < page.length; i++) {
      const current = page[i];
      const zero = isCiphertext ? current === previous : current === 28;
      if (zero) {
        repeats++;
        if (clock === 'all') consumed++;
      } else {
        const value = isCiphertext
          ? (current - previous + 28) % 29
          : current;
        assert.ok(value >= 0 && value < 28);
        groups[consumed % 16][value]++;
        eligible++;
        consumed++;
      }
      previous = current;
    }
  }
  let numerator = 0;
  let denominator = 0;
  for (const counts of groups) {
    const size = counts.reduce((a, b) => a + b, 0);
    denominator += size * (size - 1);
    numerator += counts.reduce((a, b) => a + b * (b - 1), 0);
  }
  return { numerator, denominator, ioc: numerator / denominator,
    repeats, eligible };
}

/** @param {number[]} data @returns {number[][]} */
function shape(data) {
  let offset = 0;
  return pages.map(p => {
    const out = data.slice(offset, offset + p.length);
    offset += p.length;
    return out;
  });
}

const modes = [];
for (const reset of ['page', 'chapter'])
  for (const clock of ['all', 'nonzero'])
    modes.push({ reset, clock });

const expected = [
  [6568, 184720, 10, 1727],
  [6676, 184728, 10, 1727],
  [6608, 184696, 10, 1727],
  [6746, 184682, 10, 1727],
];
const observations = modes.map(({ reset, clock }, i) => {
  const result = fingerprint(pages, reset, clock, true);
  assert.deepEqual([result.numerator, result.denominator, result.repeats,
    result.eligible], expected[i], 'original data/clock drift');
  return result;
});
const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt',
];
for (const source of sources) {
  const clear = encodeEnglish(read(source));
  const width = pages.reduce((sum, page) => sum + page.length, 0);
  let windows = 0;
  const minimum = modes.map(() => Infinity);
  const equalOrLower = modes.map(() => 0);
  for (let start = 0; start + width <= clear.length; start += 17) {
    const sample = shape(clear.slice(start, start + width));
    for (let m = 0; m < modes.length; m++) {
      const { reset, clock } = modes[m];
      const score = fingerprint(sample, reset, clock, false).ioc;
      minimum[m] = Math.min(minimum[m], score);
      if (score <= observations[m].ioc) equalOrLower[m]++;
    }
    windows++;
  }
  assert.ok(minimum.every((min, i) => min > observations[i].ioc));
  assert.ok(equalOrLower.every(n => n === 0));
  console.log(JSON.stringify({ source, GP29_runes: clear.length,
    windows, minimum, atOrBelowOriginal: equalOrLower }));
}

/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return state >>> 0;
  };
}
/**
 * Reversible positive control with truly secret, different phase alphabets.
 * Every plaintext EA is an exact repeated ciphertext; other runes cannot
 * repeat their predecessor. An original page's first symbol is the IV.
 *
 * @param {number[][]} nativePages
 * @param {'chapter'|'page'} reset
 * @param {'all'|'nonzero'} clock
 * @returns {{sourceScore:number, plantedScore:number, recovered:number}}
 */
function planted(nativePages, reset, clock) {
  const random = prng(3301);
  const maps = Array.from({ length: 16 }, () => {
    const values = Array.from({ length: 28 }, (_, i) => i);
    for (let i = 27; i > 0; i--) {
      const j = random() % (i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  });
  const inverse = maps.map(map => {
    const inv = Array(28);
    map.forEach((value, i) => { inv[value] = i; });
    return inv;
  });
  let consumed = 0, recovered = 0;
  const cipherPages = [];
  const recoveredPages = [];
  for (const page of nativePages) {
    if (reset === 'page') consumed = 0;
    const encrypted = [page[0]];
    const decoded = [page[0]];
    for (let i = 1; i < page.length; i++) {
      const previous = encrypted.at(-1);
      const clear = page[i];
      const cipher = clear === 28 ? previous
        : (previous + maps[consumed % 16][clear] + 1) % 29;
      encrypted.push(cipher);
      const recoveredRune = cipher === previous ? 28
        : inverse[consumed % 16][(cipher - previous + 28) % 29];
      decoded.push(recoveredRune);
      assert.equal(recoveredRune, clear);
      recovered++;
      if (clock === 'all' || clear !== 28) consumed++;
    }
    cipherPages.push(encrypted);
    recoveredPages.push(decoded);
  }
  assert.deepEqual(recoveredPages, nativePages);
  const original = fingerprint(nativePages, reset, clock, false);
  const synthetic = fingerprint(cipherPages, reset, clock, true);
  assert.equal(original.numerator, synthetic.numerator);
  assert.equal(original.denominator, synthetic.denominator);
  return { sourceScore: original.ioc,
    plantedScore: synthetic.ioc, recovered };
}
const sample = shape(encodeEnglish(read(sources[0]))
  .slice(0, pages.reduce((n, p) => n + p.length, 0)));
for (const { reset, clock } of modes) {
  const test = planted(sample, reset, clock);
  assert.equal(test.recovered, 1737);
  console.log(JSON.stringify({ reset, clock, original: fingerprint(
    pages, reset, clock, true), plant: test }));
}
console.log('PASS: finite original-source key-independent 16-phase exclusion');
