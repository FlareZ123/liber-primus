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
 * Minimal number of rune substitutions required after granting an arbitrary
 * global bijection of the 29 symbols and an arbitrary position permutation.
 * For two frequency multisets this is half their sorted L1 distance.
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number}
 */
function minEditsAfterRelabelAndTranspose(left, right) {
  assert.equal(left.length, right.length);
  /** @param {number[]} values */
  const counts = values => {
    const freq = Array(29).fill(0);
    for (const rune of values) freq[rune]++;
    return freq.sort((a, b) => a - b);
  };
  const first = counts(left), second = counts(right);
  return first.reduce((sum, n, i) => sum + Math.abs(n - second[i]), 0) / 2;
}

/**
 * @param {number[]} values
 * @param {number[]} original
 * @param {number} threshold
 * @returns {{n: number, min: number, max: number, belowOrEqual: number, minEdits: number, medianEdits: number, maxEdits: number}}
 */
function windows(values, original, threshold) {
  const scores = [], editCounts = [];
  const length = original.length;
  for (let at = 0; at + length <= values.length; at += length) {
    const target = values.slice(at, at + length);
    scores.push(ioc(target));
    editCounts.push(minEditsAfterRelabelAndTranspose(original, target));
  }
  editCounts.sort((a, b) => a - b);
  return {
    n: scores.length,
    min: Math.min(...scores),
    max: Math.max(...scores),
    belowOrEqual: scores.filter(score => score <= threshold).length,
    minEdits: editCounts[0],
    medianEdits: editCounts[Math.floor(editCounts.length / 2)],
    maxEdits: editCounts[editCounts.length - 1]
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
assert.equal(minEditsAfterRelabelAndTranspose(terminal, permuted), 0);
assert.equal(minEditsAfterRelabelAndTranspose(terminal, terminal.map(v => (v + 7) % 29)), 0);

/**
 * Optimal edit bound after granting each physical rune-bearing page a
 * different 29-rune alphabet permutation and any within-page transposition.
 * @param {number[]} target
 * @returns {number}
 */
function pagewiseMinimumEdits(target) {
  assert.equal(target.length, book.length);
  let offset = 0, edits = 0;
  for (const page of corpus.pages.filter(p => p.page < 56 && p.indices.length)) {
    const n = page.indices.length;
    edits += minEditsAfterRelabelAndTranspose(
      page.indices, target.slice(offset, offset + n));
    offset += n;
  }
  assert.equal(offset, book.length);
  return edits;
}

/**
 * @param {number[]} values
 * @returns {{n:number,minEdits:number,medianEdits:number,maxEdits:number}}
 */
function pagewiseWindows(values) {
  const edits = [];
  for (let at = 0; at + book.length <= values.length; at += book.length)
    edits.push(pagewiseMinimumEdits(values.slice(at, at + book.length)));
  edits.sort((a, b) => a - b);
  return {
    n: edits.length, minEdits: edits[0],
    medianEdits: edits[Math.floor(edits.length / 2)],
    maxEdits: edits[edits.length - 1]
  };
}

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
    terminal: windows(gp, terminal, terminalIoc),
    full: windows(gp, book, bookIoc),
    independentPageKeys: pagewiseWindows(gp)
  };
});
assert.deepEqual(reference.map(x => x.symbols), [323083, 62696, 217644]);
assert.deepEqual(reference.map(x => x.terminal.n), [1262, 244, 850]);
assert.deepEqual(reference.map(x => x.full.n), [24, 4, 16]);
assert.ok(reference.every(x => x.terminal.belowOrEqual === 0 && x.full.belowOrEqual === 0));
assert.deepEqual(reference.map(x => x.terminal.minEdits), [48, 51, 45]);
assert.deepEqual(reference.map(x => x.full.minEdits), [4467, 4378, 4219]);
assert.deepEqual(reference.map(x => x.independentPageKeys.n), [24, 4, 16]);
assert.deepEqual(reference.map(x => x.independentPageKeys.minEdits), [3437, 3380, 3171]);
assert.equal(pagewiseMinimumEdits(book), 0);

console.log(JSON.stringify({
  classification: "all-secret global and physical-page-local alphabet and position permutation edit bounds",
  original: {terminalLength: terminal.length, terminalIoc, bookLength: book.length, bookIoc},
  references: reference,
  logicalLimit: "Any global GP29 alphabet bijection plus arbitrary positional permutation; additional rune substitutions are bounded against finite GP-English controls. Subpage-changing keys, other registers, variable-rate transformations or additional cipher layers are not excluded."
}, null, 2));