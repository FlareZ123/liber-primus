'use strict';

/**
 * Source-selected conditional 28-step chain receiver on original LP2.
 *
 * First-party physical p57 gives a 55-rune strict word-interior tape.
 * The encrypted pp0-55 have 86/12901 within-page adjacent doublets.
 * This tests direct source-keyed 28 nonzero chain steps, reserving
 * the final GP29 rune EA (or first rune F as a control) for zero step.
 *
 * SFT: node sims/lp2_parable55_chain28_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const sections = text.split('%').map(s => s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const rx = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const words = s => [...s.matchAll(rx)].map(m => Array.from(m[0], g => runeIndex.get(g)));
const mod = (x, base) => (x % base + base) % base;
const original = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);
const p57 = words(sections.at(-1));
assert.equal(p57.length, 20);
assert.equal(p57.flat().length, 95);
const interiors = p57.map(w => w.slice(1, -1));
const titleFirst = [...interiors[0], ...interiors.slice(1).flat()];
const bodyFirst = [...interiors.slice(1).flat(), ...interiors[0]];
assert.equal(titleFirst.length, 55);
assert.equal(bodyFirst.length, 55);
assert(titleFirst.every(x => x < 28), 'source-native p57 key excludes EA (28)');

/**
 * 28-ary full-rune chain:
 * step = 0 => reserved GP29 rune (EA=28 or F=0);
 * step = 1..28 => nonreserved plaintext symbol = (step-1-sign*key) mod28.
 * Initial previous ciphertext rune is fixed at zero; optional physical
 * page resets restart both the key phase and preceding rune.
 *
 * @param {number[][]} pages
 * @param {number[]} tape
 * @param {number} sign
 * @param {number} reserve
 * @param {boolean} reset
 */
function inverse(pages, tape, sign, reserve, reset) {
  let previous = 0, position = 0;
  const out = [];
  for (const page of pages) {
    if (reset) {
      previous = 0;
      position = 0;
    }
    for (const c of page) {
      const step = mod(c - previous, 29);
      if (step === 0) out.push(reserve);
      else {
        const symbol = mod(step - 1 - sign * tape[position % 55], 28);
        out.push(reserve === 28 ? symbol : symbol + 1);
      }
      previous = c;
      position++;
    }
  }
  return out;
}

/** @param {number[]} runes */
function ioc(runes) {
  const count = Array(29).fill(0);
  for (const r of runes) count[r]++;
  return 29 * count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

/**
 * Source-native LP1 known plaintext positive. The Latin-to-GP29 mapping
 * is fixed before reading LP2 and normalizes K,Q,V,Z (not native GP chars).
 * For the frozen word text it recovers exactly under the artificial chain.
 */
const reference = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const source = reference.split('### 3')[1].split('### 4')[0]
  .toUpperCase().replace(/[^A-Z]/g, '');
const latin = new Map(corpus.translit.map((name, i) => [name, i]));
const alias = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
const pool = [];
for (let i = 0; i < source.length;) {
  const two = source.slice(i, i + 2);
  if (latin.has(two)) {
    pool.push(latin.get(two));
    i += 2;
  } else {
    const one = alias[source[i]] || source[i];
    if (latin.has(one)) pool.push(latin.get(one));
    i++;
  }
}
const plantedPlain = pool.slice(0, 300);
assert.equal(plantedPlain.length, 300);
let previous = 0;
const planted = [];
for (let i = 0; i < plantedPlain.length; i++) {
  const p = plantedPlain[i];
  const step = p === 28 ? 0 : 1 + mod(p + titleFirst[i % 55], 28);
  const c = mod(previous + step, 29);
  planted.push(c);
  previous = c;
}
const recovered = inverse([planted], titleFirst, 1, 28, false);
assert.deepEqual(recovered, plantedPlain, 'all 300 source-native original-GP symbols invert');
const wrong = inverse([planted], titleFirst.toReversed(), 1, 28, false);
const control = {
  known_plain_ioc: ioc(plantedPlain),
  known_cipher_zero_steps: plantedPlain.filter(x => x === 28).length,
  correct_key_ioc: ioc(recovered),
  wrong_key_ioc: ioc(wrong)
};
assert(control.known_plain_ioc > 1.4);
assert(control.correct_key_ioc > control.wrong_key_ioc);

const scopes = [
  ['original_p0_to_p2', [0, 1, 2]],
  ['heldout_p40_to_p53', Array.from({ length: 14 }, (_, i) => i + 40)],
  ['terminal_p54_to_p55', [54, 55]],
  ['original_complete', original.map(p => p.page)]
];
const tested = [];
for (const [order, tape] of [['title-first', titleFirst], ['body-first', bodyFirst]]) {
  for (const sign of [1, -1]) {
    for (const reserve of [28, 0]) {
      for (const reset of [false, true]) {
        tested.push({
          order, sign, reserve, physical_page_reset: reset,
          results: scopes.map(([name, indices]) => {
            const cipherPages = indices.map(index => corpus.pages[index].indices);
            const plaintext = inverse(cipherPages, tape, sign, reserve, reset);
            return { name, runes: plaintext.length, normalized_ioc: ioc(plaintext) };
          })
        });
      }
    }
  }
}
assert.equal(tested.length, 16);
for (const run of tested) {
  for (const r of run.results) assert(r.normalized_ioc < 1.06);
}
const best = Object.fromEntries(scopes.map(([name]) => {
  const choices = tested.map(r => ({ key: r.order, sign: r.sign,
    reserve: r.reserve, reset: r.physical_page_reset,
    ioc: r.results.find(v => v.name === name).normalized_ioc }));
  choices.sort((a, b) => b.ioc - a.ioc);
  return [name, choices[0]];
}));
assert.equal(best.original_p0_to_p2.ioc.toFixed(6), '1.035933');
assert.equal(best.original_complete.ioc.toFixed(6), '1.024512');
console.log(JSON.stringify({
  source: { p57_strict_interior_key: 55, contains_EA: false,
    original_unknown_pages: original.length, original_runes: 12956,
    tested_models: tested.length, two_tape_orders: true,
    two_additive_signs: true, two_boundary_clocks: true,
    zero_step_reserved: [28, 0] },
  positive_control: control,
  strongest_original_by_scope: best,
  conclusion: 'Exact source-key direct 28-step chain negative on p0 and independent original sections'
}, null, 2));
