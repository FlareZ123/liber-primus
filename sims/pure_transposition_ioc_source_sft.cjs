"use strict";

/**
 * Exact rune-frequency invariant for pure transpositions of original LP2.
 *
 * A permutation preserves the symbol multiset and therefore the index of
 * coincidence. Compare the terminal 256-rune hypothesis and all 12,956
 * unsolved runes with disjoint native-GP prose windows at both lengths.
 *
 * SFT: node sims/pure_transposition_ioc_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));

const book = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const terminal = [...pages.get(53), pages.get(54)[0], ...pages.get(55)];
assert.equal(book.length, 12956);
assert.deepEqual([pages.get(53).length, pages.get(54).length, pages.get(55).length], [179, 232, 76]);
assert.equal(pages.get(54)[0], 24);
assert.equal(terminal.length, 256);

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const value of values) freq[value]++;
  return freq.reduce((total, n) => total + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * Literal GP transliteration used by the repository's existing native controls.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const index = new Map(corpus.translit.map((token, i) => [token, i]));
  index.set("ING", 21);
  const normal = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of normal.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      let consumed = false;
      for (const count of [3, 2, 1]) {
        const token = index.get(word.slice(at, at + count));
        if (token !== undefined) {
          out.push(token);
          at += count;
          consumed = true;
          break;
        }
      }
      assert.ok(consumed, "Unmapped English GP token");
    }
  }
  return out;
}

/**
 * @param {number[]} values
 * @param {number} length
 * @returns {{n: number, min: number, max: number, belowOrEqual: number}}
 */
function windows(values, length, threshold) {
  const scores = [];
  for (let at = 0; at + length <= values.length; at += length)
    scores.push(ioc(values.slice(at, at + length)));
  return {
    n: scores.length,
    min: Math.min(...scores),
    max: Math.max(...scores),
    belowOrEqual: scores.filter(score => score <= threshold).length
  };
}

const terminalIoc = ioc(terminal), bookIoc = ioc(book);
assert.ok(Math.abs(terminalIoc - 0.03431372549019608) < 1e-14);
assert.ok(Math.abs(bookIoc - 0.03447839786450569) < 1e-14);

// Exact permutation controls: transposing cannot change these counts.
for (const original of [terminal, book]) {
  const reversed = [...original].reverse();
  assert.equal(ioc(reversed), ioc(original));
}
const permuted = Array.from({length: 256}, (_, i) => terminal[(73 * i) % 256]);
assert.equal(ioc(permuted), terminalIoc);

const sources = [
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt"
];
const reference = sources.map(source => {
  const gp = gpEncode(read(source));
  return {
    source,
    symbols: gp.length,
    terminal: windows(gp, terminal.length, terminalIoc),
    full: windows(gp, book.length, bookIoc)
  };
});
assert.deepEqual(reference.map(x => x.symbols), [323083, 62696, 217644]);
assert.deepEqual(reference.map(x => x.terminal.n), [1262, 244, 850]);
assert.deepEqual(reference.map(x => x.full.n), [24, 4, 16]);
assert.ok(reference.every(x => x.terminal.belowOrEqual === 0 && x.full.belowOrEqual === 0));

console.log(JSON.stringify({
  classification: "key-independent conditional exclusion of pure rune-position permutations",
  original: {terminalLength: terminal.length, terminalIoc, bookLength: book.length, bookIoc},
  references: reference,
  logicalLimit: "Same 29-symbol alphabet and symbol-preserving permutation only; language/register change, additions/deletions, and another layer are not excluded."
}, null, 2));