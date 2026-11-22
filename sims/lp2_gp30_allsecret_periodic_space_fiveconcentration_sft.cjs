'use strict';

/**
 * Exact GP30 all-secret period-vs-language-capacity certificate.
 *
 * Each original LP2 punctuation gap/period is a 30th ciphertext symbol.
 * Any unknown period-m Vigenere key may rotate the full 30-symbol alphabet.
 * Each key symbol is chosen adversarially in every allowed phase. We even
 * allow the five frequent plaintext runes to vary independently by state,
 * making the resulting upper bound more generous than the real cipher.
 *
 * No key search, plaintext fitting, random source, or English dictionary.
 * The native p57 positive witness is drawn from the same source transcript.
 *
 * Windows Node 22:
 *   node sims/lp2_gp30_allsecret_periodic_space_fiveconcentration_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/lp2-transcription.txt').split('$');
const alphabet = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
assert.equal(segments.length, 10);

/** @typedef {{digit:number, section:number, page:number}} Token */

/**
 * @param {string} source
 * @param {number[]} owners Actual physical rune-page IDs, optional for native solved control
 * @returns {{tokens:Token[], runes:number[]}}
 */
function parse(source, owners) {
  /** @type {Token[]} */
  const tokens = [];
  const runes = [];
  let section = 0;
  let page = owners.length ? owners[0] : 57;
  for (const glyph of source) {
    if (glyph === '$') {
      section++;
      continue;
    }
    const n = alphabet.get(glyph);
    if (n !== undefined) {
      if (owners.length) {
        page = owners[runes.length];
        assert.ok(Number.isInteger(page));
      }
      runes.push(n);
      tokens.push({digit:n, section, page});
    } else if (glyph === '-' || glyph === '.') {
      tokens.push({digit:29, section, page});
    }
  }
  if (owners.length) assert.equal(runes.length, owners.length);
  return {tokens, runes};
}

const source = segments.slice(0, 8).join('$');
const pages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const owners = pages.flatMap((p) => p.indices.map(() => p.page));
const original = parse(source, owners);
assert.deepEqual(original.runes, pages.flatMap((p) => p.indices));
assert.equal(original.runes.length, 12956);
assert.equal(original.tokens.length, 15858);
assert.equal(original.tokens.filter((x) => x.digit === 29).length, 2902);
assert.equal(new Set(original.tokens.map((x) => x.section)).size, 8);
assert.equal(new Set(original.tokens.map((x) => x.page)).size, 55);

/**
 * For each state, a GP30 cyclic key maps exactly one ciphertext digit s to
 * plaintext SPACE. The other 29 digits map to plaintext runes. For any fixed
 * global five-plain-rune set, its state count cannot exceed the five largest
 * input counts after excluding s. Permitting the target five-rune set to
 * differ in *every* state only enlarges this bound.
 *
 * Let T5 = count of the five most frequent output runes, S = output SPACEs,
 * N = number of tokens, q = numerator / denominator. The necessary
 * condition for T5/(N-S) >= q is T5 + q*S >= q*N. We upper-bound its LHS
 * independently in every allowed key state. All arithmetic is exact integer
 * arithmetic after multiplying through by denominator.
 *
 * @param {Token[]} tokens
 * @param {number} period positive key period
 * @param {number} numerator target numerator (e.g. 46)
 * @param {number} denominator target denominator (e.g. 95)
 * @param {'global'|'section'|'page'} reset
 * @returns {{period:number, reset:string, bound:number, threshold:number, excluded:boolean, states:number}}
 */
function capacity(tokens, period, numerator, denominator, reset) {
  assert.ok(Number.isInteger(period) && period >= 1);
  assert.ok(Number.isInteger(numerator) && numerator > 0);
  assert.ok(Number.isInteger(denominator) && denominator > numerator);
  /** @type {Map<number,{phase:number,bins:Uint16Array[]}>} */
  const groups = new Map();
  for (const token of tokens) {
    const group = reset === 'global' ? 0 : reset === 'section' ? token.section : token.page;
    if (!groups.has(group)) {
      groups.set(group, {
        phase: 0,
        bins: Array.from({length:period}, () => new Uint16Array(30))
      });
    }
    const state = groups.get(group);
    state.bins[state.phase % period][token.digit]++;
    state.phase++;
  }

  let bound = 0;
  let states = 0;
  for (const group of groups.values()) {
    for (const counts of group.bins) {
      const ordered = [...counts].sort((a, b) => b - a);
      if (ordered[0] === 0) continue;
      states++;
      const topFive = ordered.slice(0, 5).reduce((a, b) => a + b, 0);
      const fifth = ordered[4];
      const sixth = ordered[5];
      let best = -Infinity;
      for (const spaceClassCount of counts) {
        const fiveExcludingSpace = topFive - (
          spaceClassCount >= fifth ? spaceClassCount - sixth : 0
        );
        const proposed = denominator * fiveExcludingSpace +
          numerator * spaceClassCount;
        if (proposed > best) best = proposed;
      }
      assert.ok(Number.isFinite(best));
      bound += best;
    }
  }
  const threshold = numerator * tokens.length;
  return {period, reset, bound, threshold, excluded:bound < threshold, states};
}

/**
 * @param {Token[]} tokens
 * @param {number} numerator
 * @param {number} denominator
 * @param {'global'|'section'|'page'} reset
 * @param {number} upperPeriod
 * @returns {number} The first inconclusive period, not a proven cipher period
 */
function firstInconclusive(tokens, numerator, denominator, reset, upperPeriod) {
  for (let period = 1; period <= upperPeriod; period++) {
    const test = capacity(tokens, period, numerator, denominator, reset);
    if (!test.excluded) return period;
  }
  return -1;
}

// The original source-authentic p57 PARABLE has 95 plain GP runes with
// exactly 46 occurrences of its five most frequent rune labels.
const solved = parse(segments[9], []);
const plaintext = solved.tokens.map((t) => t.digit);
assert.equal(solved.runes.length, 95);
assert.equal(plaintext.length, 115);
assert.equal(plaintext.filter((x) => x === 29).length, 20);
const counts = Array(29).fill(0);
for (const n of solved.runes) counts[n]++;
assert.equal(counts.sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0), 46);

// Source-native positive: any key-based reversible 30-symbol Vigenere
// encryption of p57 must *survive* the necessary upper bound when tested at
// its true key period. This plant includes source-native printed SPACEs.
const divinity = [23, 10, 1, 10, 9, 10, 16, 26];
const planted = plaintext.map((p, i) => ({
  digit:(p + divinity[i % divinity.length]) % 30,
  section:0,
  page:57
}));
assert.deepEqual(planted.map((t, i) => (t.digit - divinity[i % 8] + 30) % 30), plaintext);
assert.equal(capacity(planted, 8, 46, 95, 'global').excluded, false);

const qNative = [
  firstInconclusive(original.tokens, 46, 95, 'global', 340),
  firstInconclusive(original.tokens, 46, 95, 'section', 70),
  firstInconclusive(original.tokens, 46, 95, 'page', 20)
];
const qConservative = [
  firstInconclusive(original.tokens, 2, 5, 'global', 120),
  firstInconclusive(original.tokens, 2, 5, 'section', 30),
  firstInconclusive(original.tokens, 2, 5, 'page', 10)
];
assert.deepEqual(qNative, [315, 41, 6]);
assert.deepEqual(qConservative, [98, 14, 2]);

// Inconclusiveness is not monotone in period: 315 is the first inconclusive
// global period, while 316 and even 333 remain source-excluded.
assert.equal(capacity(original.tokens, 314, 46, 95, 'global').excluded, true);
assert.equal(capacity(original.tokens, 315, 46, 95, 'global').excluded, false);
assert.equal(capacity(original.tokens, 316, 46, 95, 'global').excluded, true);
assert.equal(capacity(original.tokens, 333, 46, 95, 'global').excluded, true);

console.log('GP30 all-secret periodic SPACE/five-letter upper bound: PASS');
console.log('Exact source: 12956 runes + 2902 authentic printed spaces/periods = 15858 tokens');
console.log('Authentic solved GP30 plant: 95 runes, 20 separator tokens, 46 top-five; period8 passes');
console.log('First INCONCLUSIVE period, reference q=46/95:');
console.log('  global ' + qNative[0] + ', 8 source sections ' + qNative[1] +
  ', 55 independently rekeyed rune pages ' + qNative[2]);
console.log('First INCONCLUSIVE period, conservative q=2/5:');
console.log('  global ' + qConservative[0] + ', sections ' + qConservative[1] +
  ', pages ' + qConservative[2]);
for (const period of [1, 8, 29, 97, 98, 314, 315, 316, 333]) {
  const record = capacity(original.tokens, period, 46, 95, 'global');
  console.log('Global native-q all-secret period ' + period + ': ' +
    JSON.stringify(record));
}
console.log('Decision: all continuous GP30 Vigenere periods 1..314 are source-excluded');
console.log('at native p57 top-five concentration, including arbitrary hidden phase keys.');
console.log('This is a necessary class gate only; it does not recover LP2 plaintext.');
