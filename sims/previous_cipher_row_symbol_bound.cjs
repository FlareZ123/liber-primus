"use strict";
/**
 * Exact maximum one-symbol plaintext count for any BOOK-WIDE bijective
 * predecessor-ciphertext row substitution of the original LP2 runes.
 *
 * C[page,i] = S[C[page,i-1]][P[page,i]], i >= 1.
 * Every one of the 29 rows S[x] is an arbitrary permutation of all 29 runes,
 * shared across all 55 rune-bearing physical pages. The first rune of each
 * page is unconstrained, deliberately making the bound generous.
 *
 * For every plaintext rune a, a fixed row can map a to precisely one next
 * ciphertext rune y. Thus count(P=a) at within-page transitions is bounded
 * by sum_x max_y count(Cprev=x,Cnext=y). This exact combinatorial bound
 * includes NONZERO and ZERO ciphertext steps. It requires no key search,
 * language score, independence assumption or fitted cipher parameters.
 *
 * The key-independent bound applies to the F29 zero-step-EA construction
 * with a fixed 29-state ciphertext-dependent F28 pad, as a subfamily.
 * It does not apply to a page-varying row table or a lossy repair channel.
 *
 * Run: node sims/previous_cipher_row_symbol_bound.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const M = 29;
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);

/** @param {number[][]} inputPages */
function rows(inputPages) {
  const counts = Array.from({length: M}, () => Array(M).fill(0));
  for (const page of inputPages)
    for (let i = 1; i < page.length; i++)
      counts[page[i - 1]][page[i]]++;
  return counts;
}
/** @param {number[][]} counts */
function rowBound(counts) {
  return counts.reduce((total, row) => total + Math.max(...row), 0);
}

/**
 * Construct an explicit 29x29 inverse S-box that ATTAINS the bound for
 * a chosen plaintext symbol across every within-page transition.
 * @param {number[][]} counts
 * @param {number} target
 */
function witnessInverse(counts, target) {
  return counts.map(countRow => {
    const winningCipher = countRow.indexOf(Math.max(...countRow));
    const remaining = Array.from({length: M}, (_, i) => i)
      .filter(i => i !== target);
    let j = 0;
    return Array.from({length: M}, (_, ciphertext) =>
      ciphertext === winningCipher ? target : remaining[j++]);
  });
}

/**
 * All plaintext characters after each page's first rune are decoded under
 * the same shared rows. Page-first runes are copied for the witness.
 * @param {number[][]} ciphertext
 * @param {number[][]} inverse
 */
function decode(ciphertext, inverse) {
  return ciphertext.map(page => {
    const out = [page[0]];
    for (let i = 1; i < page.length; i++)
      out.push(inverse[page[i - 1]][page[i]]);
    return out;
  });
}
/** @param {number[][]} inverse */
function forwardRows(inverse) {
  return inverse.map(row => {
    const f = Array(M);
    row.forEach((plain, cipher) => { f[plain] = cipher; });
    assert.equal(new Set(f).size, M);
    return f;
  });
}
/** @param {number[][]} plaintext @param {number[][]} forward */
function encodeRows(plaintext, forward) {
  return plaintext.map(page => {
    const cipher = [page[0]];
    for (let i = 1; i < page.length; i++)
      cipher.push(forward[cipher[i - 1]][page[i]]);
    return cipher;
  });
}

/**
 * GP source-normalization contract shared with the project's reference
 * simulators. This is a source-register diagnostic, not original plaintext.
 * @param {string} text
 * @returns {number[]}
 */
function englishGP(text) {
  const tokens = new Map(corpus.translit.map((s, i) => [s, i]));
  const out = [];
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const w = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < w.length;) {
      let matched = false;
      for (const len of [3, 2, 1]) {
        const v = tokens.get(w.slice(i, i + len));
        if (v !== undefined) { out.push(v); i += len; matched = true; break; }
      }
      assert.ok(matched, "Source contains unsupported GP symbol");
    }
  }
  return out;
}

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function randomRows(seed) {
  const random = rng(seed);
  return Array.from({length: M}, () => {
    const row = Array.from({length: M}, (_, i) => i);
    for (let i = M - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  });
}

/** @param {number[][]} pg @param {number} rune */
function transitionOccurrences(pg, rune) {
  let count = 0;
  for (const page of pg)
    for (let i = 1; i < page.length; i++)
      count += Number(page[i] === rune);
  return count;
}

function main() {
  const counts = rows(pages);
  const total = counts.flat().reduce((a, b) => a + b, 0);
  const repeats = counts.reduce((n, row, i) => n + row[i], 0);
  assert.equal(total, 12901);
  assert.equal(repeats, 86);
  const bound = rowBound(counts);
  assert.equal(bound, 714);
  const target = 18; // GP E; any of the 29 targets has the same exact bound.
  const inverse = witnessInverse(counts, target);
  const forward = forwardRows(inverse);
  const decoded = decode(pages, inverse);
  assert.deepEqual(encodeRows(decoded, forward), pages);
  const attained = transitionOccurrences(decoded, target);
  assert.equal(attained, bound);

  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  const training = englishGP(shakespeare.slice(0, 210000));
  const heldout = englishGP(shakespeare.slice(210000));
  assert.equal(training.length, 153216);
  assert.ok(heldout.length > 12956 + 17);
  const englishE = training.filter(x => x === target).length;
  const latin = JSON.parse(read("resources/control/latin-vulgate-gp-trigrams.json"));
  assert.equal(latin.n, 203357);
  const sourcePages = [];
  let at = 17;
  for (const page of pages) {
    sourcePages.push(heldout.slice(at, at + page.length));
    at += page.length;
  }

  // Independent source-English positive using random arbitrary 29x29 rows.
  // The exact plaintext and all shared 29 substitution tables are recovered.
  const plantRows = randomRows(0x3301cafe);
  const plantedCipher = encodeRows(sourcePages, plantRows);
  const plantedInverse = forwardRows(plantRows);
  const recovered = decode(plantedCipher, plantedInverse);
  assert.deepEqual(recovered, sourcePages);
  assert.deepEqual(encodeRows(recovered, plantRows), plantedCipher);
  const plantBound = rowBound(rows(plantedCipher));
  const sourceE = transitionOccurrences(sourcePages, target);
  assert.equal(sourceE, 1484);
  assert.equal(plantBound, 1586);
  assert.ok(plantBound >= sourceE);
  assert.ok(englishE / training.length > (bound + 55) / 12956);
  assert.ok(latin.u[target] / latin.n > (bound + 55) / 12956);

  const output = {
    status: "Exact key-independent bound; no unknown LP2 plaintext recovered",
    family: "One BOOK-WIDE 29x29 bijection S[previous published ciphertext]",
    original: {
      physicalRunePages: pages.length, runes: 12956,
      withinPageTransitions: total, equalAdjacentSteps: repeats,
      maxCountForAnyPlaintextSymbolOnTransitions: bound,
      arbitraryFirstPageRunes: pages.length,
      maxCountForAnyPlaintextSymbolInFullText: bound + pages.length,
      maxFractionInFullText: (bound + pages.length) / 12956,
      rowMaximumCounts: counts.map(row => Math.max(...row)),
      explicitWitnessSymbol: corpus.translit[target],
      witnessAchievedTransitionCount: attained,
      originalCiphertextRoundtripRunes: 12956
    },
    controls: {
      englishTraining: {runes: training.length,
        E: englishE, Eshare: englishE / training.length},
      latinVulgate: {runes: latin.n, E: latin.u[target],
        Eshare: latin.u[target] / latin.n},
      authenticGPShakespearePlant: {
        seed: "0x3301cafe", plaintextRunes: 12956,
        trueESymbolsOnTransitions: sourceE,
        cipherRowBound: plantBound,
        exactlyRecoveredPlaintextRunes: 12956,
        roundtripCiphertextRunes: 12956
      }
    },
    scope: "Book-wide, direct, deterministic bijective one-prior-cipher " +
      "row tables with no lossy output repair, no additional clock or " +
      "page/section-varying secret state. The source-register comparison " +
      "does not rule out atypically low-frequency plaintext, alternative " +
      "segmentation, compressed data, or hidden multi-symbol encodings."
  };
  console.log(JSON.stringify(output, null, 2));
}
main();
