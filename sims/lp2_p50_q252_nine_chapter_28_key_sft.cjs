'use strict';
/*
 * Source-constrained test of the p50 polynomial quotient as a 9 x 28
 * repeating GP29 key: one 28-symbol row per original visual chapter.
 *
 * Run from repository root:
 *   node sims/lp2_p50_q252_nine_chapter_28_key_sft.cjs
 *
 * This is a bounded candidate test, not an asserted Cicada instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(
  path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8')
  .toUpperCase().replace(/[^A-Z]/g, '');

const mod = n => ((n % 29) + 29) % 29;
function multiplyAscending(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
function divideDescendingByAscending(highToLow, divisorLowToHigh) {
  const work = highToLow.slice().reverse();
  const quotient = Array(work.length - divisorLowToHigh.length + 1).fill(0);
  let inverse = null;
  for (let x = 1; x < 29; x++) {
    if (mod(x * divisorLowToHigh.at(-1)) === 1) {
      inverse = x;
      break;
    }
  }
  assert.notEqual(inverse, null, 'divisor leading coefficient must be invertible');
  for (let i = work.length - 1; i >= divisorLowToHigh.length - 1; i--) {
    const at = i - divisorLowToHigh.length + 1;
    const amount = mod(work[i] * inverse);
    quotient[at] = amount;
    for (let j = 0; j < divisorLowToHigh.length; j++)
      work[at + j] = mod(work[at + j] - amount * divisorLowToHigh[j]);
  }
  return {
    quotient: quotient.reverse(),
    remainder: work.slice(0, divisorLowToHigh.length - 1)
  };
}
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function makeTrigramModel(text) {
  const counts = new Map();
  for (let i = 0; i < text.length - 2; i++) {
    const gram = text.slice(i, i + 3);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  return { counts, denominator: text.length - 2 + 26 ** 3 };
}
function trigramScore(text, model) {
  let total = 0;
  const n = text.length - 2;
  for (let i = 0; i < n; i++) {
    const count = model.counts.get(text.slice(i, i + 3)) || 0;
    total += Math.log((count + 1) / model.denominator);
  }
  return total / n;
}
function transliterate(indices) {
  return indices.map(index => corpus.translit[index]).join('');
}
const chapterCuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const ciphertext = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(chapterCuts.slice(1).map((end, i) => end - chapterCuts[i]),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const table = grid.byte_rows.flat().map(mod);
assert.equal(table.length, 256);

/*
 * H is the 2013 signed BASE29 representation 3301 -> 3QO = [3,26,24].
 * G is the LP2 p39 red triad [27,5,15]. Their product and the exact
 * zero-remainder quotient are independently documented in the q252 gate.
 */
const H = [3, 26, 24];
const G = [27, 5, 15];
assert.equal(3 * 29 ** 2 + 26 * 29 + 24, 3301);
const divisor = multiplyAscending(H, G);
assert.deepEqual(divisor, [23, 21, 11, 17, 12]);
const { quotient, remainder } = divideDescendingByAscending(table, divisor);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.deepEqual(quotient.slice(0, 16),
  [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21]);

/*
 * 252 = 9 * 28. The nine original visual chapter lengths are source-indexed
 * above; 28 is the GP29 alphabet size excluding the literal F bypass symbol.
 * Each chapter receives one 28-symbol row, repeated continuously within
 * that chapter. F (index 0) is transparent and consumes no key, as on p56.
 */
const keyRows = Array.from({ length: 9 }, (_, chapter) =>
  quotient.slice(chapter * 28, chapter * 28 + 28));
assert.ok(keyRows.every(row => row.length === 28));

function transformByChapter(input, keys, sign, skipF, encrypt) {
  const output = [];
  for (let chapter = 0; chapter < 9; chapter++) {
    const start = chapterCuts[chapter];
    const end = chapterCuts[chapter + 1];
    const row = keys.slice(chapter * 28, chapter * 28 + 28);
    let pointer = 0;
    for (let i = start; i < end; i++) {
      const value = input[i];
      if (skipF && value === 0) {
        output.push(0);
        continue;
      }
      const key = row[pointer % row.length];
      pointer++;
      output.push(mod(value + (encrypt ? -sign : sign) * key));
    }
  }
  return output;
}
function decode(keys, sign, skipF) {
  const plain = transformByChapter(ciphertext, keys, sign, skipF, false);
  const reencrypted = transformByChapter(plain, keys, sign, skipF, true);
  assert.deepEqual(reencrypted, ciphertext, 'candidate must exactly re-encrypt original input');
  return plain;
}
function summarize(values, model) {
  const text = transliterate(values);
  return {
    runeIoc: indexOfCoincidence(values),
    characterTrigramLogScore: trigramScore(text, model),
    transliterationPrefix: text.slice(0, 120)
  };
}

/* Use the first 80% of the supplied Shakespeare control to train; score the
 * last 20% as an independent held-out reference. Spaces/punctuation are
 * removed consistently because LP2 word separators are not part of this
 * character-level screening score. */
const split = Math.floor(shakespeare.length * 0.8);
const train = shakespeare.slice(0, split);
const heldOut = shakespeare.slice(split);
const model = makeTrigramModel(train);
const rawSummary = summarize(ciphertext, model);

const forward = decode(quotient, -1, true);
const reverse = decode(quotient.slice().reverse(), -1, true);
const oppositeSign = decode(quotient, 1, true);
const noBypass = decode(quotient, -1, false);
const candidates = {
  sourceOrderSubtractWithFBypass: summarize(forward, model),
  ascendingCoefficientOrderSubtractWithFBypass: summarize(reverse, model),
  sourceOrderAddWithFBypass: summarize(oppositeSign, model),
  sourceOrderSubtractWithoutFBypass: summarize(noBypass, model)
};

/* Deterministic full-length positive control for the exact key-reset and
 * F-bypass implementation. This validates code, not the historical premise. */
let state = 0x330129;
const plantedPlain = Array.from({ length: ciphertext.length }, (_, i) => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return (i % 97 === 0) ? 0 : state % 29;
});
const plantedCipher = transformByChapter(plantedPlain, quotient, -1, true, true);
const plantedRecovered = transformByChapter(plantedCipher, quotient, -1, true, false);
assert.deepEqual(plantedRecovered, plantedPlain);

const report = {
  source: {
    tableCells: table.length,
    tableShape: '32x8',
    field: 'GF(29)',
    H,
    G,
    divisorAscending: divisor,
    divisionRemainder: remainder,
    quotientLength: quotient.length,
    quotientFirst16: quotient.slice(0, 16),
    keyShape: '9x28',
    chapterLengths: chapterCuts.slice(1).map((end, i) => end - chapterCuts[i]),
    keyRows: keyRows.map((row, i) => ({
      chapter: i + 1,
      uniqueSymbols: new Set(row).size,
      zeroSymbols: row.filter(x => x === 0).length,
      values: row
    }))
  },
  languageControl: {
    trainingCharacters: train.length,
    heldOutCharacters: heldOut.length,
    heldOutCharacterTrigramLogScore: trigramScore(heldOut, model)
  },
  original: {
    runeCount: ciphertext.length,
    ciphertext: rawSummary,
    candidates
  },
  positiveControl: {
    plantedRunes: plantedPlain.length,
    recoveredRunes: plantedRecovered.length,
    exact: plantedRecovered.every((value, i) => value === plantedPlain[i])
  },
  decision: 'The frozen 9x28 per-chapter repeating additive-key interpretation does not improve the original ciphertext and yields no English-like plaintext. This rejects only this source-motivated receiver, not every possible use of the q252 quotient.'
};
console.log(JSON.stringify(report, null, 2));
