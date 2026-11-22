'use strict';

/**
 * P7 five-red-product quartic as literal second-order ciphertext-feedback
 * on original LP2. A frozen, source-led reversible cipher experiment.
 *
 * Two candidate emissions, with both signs:
 *   P_i = C_i +/- Q(C_(i-1)-C_(i-2))
 *   P_i = C_i-C_(i-1) +/- Q(C_(i-1)-C_(i-2)) (mod 29).
 *
 * Re-key clocks: chapter-continuous or each physical page. Prior ciphertext
 * register starts at (0,0) at each selected boundary. Unknown initial states
 * would change only the first two cipher positions under the fixed operation.
 *
 * This does not assert that the human author selected the quartic, the
 * ciphertext difference as its argument, or either emission.
 *
 * Standalone Windows 11 / Node.js 22 SFT using read-only canonical sources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} x @returns {number} */
function quartic(x) {
  x = mod(x);
  return mod(11 + x * (26 + x * (8 + x * (15 + x * 2))));
}

/** @param {number[]} cells @returns {number} */
function product(cells) {
  return cells.reduce((a, b) => mod(a * b), 1);
}
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(corpus.pages[7].indices.slice(-14), redWords.flat());
assert.deepEqual(redWords.map(product), [11, 26, 8, 15, 2]);
assert.deepEqual([quartic(3), quartic(4)], [3, 4]);
assert.equal(corpus.pages[8].indices.length, 255);

const groups = [[8, 14], [16, 21], [40, 53]].map(([start, end]) => {
  const pageData = corpus.pages.filter(p => p.page >= start && p.page <= end);
  return {
    label: String(start) + '..' + String(end),
    parts: pageData.map(p => p.indices),
    length: pageData.reduce((n, p) => n + p.indices.length, 0)
  };
});
assert.deepEqual(groups.map(g => g.length), [1729, 1613, 3008]);
assert.equal(corpus.pages[50].indices.length, 0);
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);

/** @typedef {{mode:'cipher'|'difference', sign:-1|1, reset:'page'|'chapter'}} Variant */

/**
 * Both directions share the source ciphertext register. The secret
 * plaintext does not drive state, making exact invertibility testable.
 *
 * @param {number[][]} parts source symbol sequence, split by physical page
 * @param {Variant} variant
 * @param {boolean} encrypt true: plaintext -> ciphertext
 * @returns {number[]}
 */
function transform(parts, variant, encrypt) {
  let previous = 0;
  let second = 0;
  const result = [];
  for (const part of parts) {
    if (variant.reset === 'page') {
      previous = 0;
      second = 0;
    }
    for (const input of part) {
      const key = quartic(mod(previous - second));
      const offset = variant.mode === 'difference' ? previous : 0;
      const output = encrypt
        ? mod(input + offset - variant.sign * key)
        : mod(input - offset + variant.sign * key);
      const ciphertext = encrypt ? output : input;
      result.push(output);
      second = previous;
      previous = ciphertext;
    }
  }
  return result;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const hist = Array(29).fill(0);
  for (const x of sequence) hist[x]++;
  return hist.reduce((a, n) => a + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
const results = [];
for (const mode of ['cipher', 'difference']) {
  for (const sign of [-1, 1]) {
    for (const reset of ['page', 'chapter']) {
      /** @type {Variant} */
      const variant = { mode, sign, reset };
      const encryptedControl = transform([solved], variant, true);
      assert.deepEqual(transform([encryptedControl], variant, false), solved);

      const chapterOutputs = [];
      for (const group of groups) {
        const plaintext = transform(group.parts, variant, false);
        const split = [];
        let pos = 0;
        for (const part of group.parts) {
          split.push(plaintext.slice(pos, pos + part.length));
          pos += part.length;
        }
        assert.equal(pos, group.length);
        assert.deepEqual(transform(split, variant, true), group.parts.flat());
        const coincidence = ioc(plaintext);
        assert(coincidence < 0.038);
        chapterOutputs.push({
          chapter: group.label,
          runes: plaintext.length,
          coincidence: Number(coincidence.toFixed(12)),
          first32: plaintext.slice(0, 32).map(v => corpus.translit[v]).join('.'),
          exactOriginalReencryption: true
        });
      }
      results.push({ ...variant, chapters: chapterOutputs,
        solved95PlantReproduced: true });
    }
  }
}
assert.equal(results.length, 8);
assert(results.every(v => v.chapters.length === 3));
console.log(JSON.stringify({
  source: 'original p7 red five GP29 word products [11,26,8,15,2]',
  operation: 'Q(x)=11+26*x+8*x^2+15*x^3+2*x^4 mod29',
  originalUnknownRunes: original.length,
  testedSourceFixedModels: results.length,
  originalReceiverGroups: groups.map(g => ({ chapter: g.label, runes: g.length })),
  allOriginalInversesNonprose: true,
  noAuthenticatedPlaintextRecovered: true,
  results
}, null, 2));
