'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x) => ((x % 29) + 29) % 29;

function inverse29(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error('non-invertible GF(29) coefficient');
}
function multiplyLow(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
function divideLow(dividend, divisor) {
  const remainder = dividend.map(mod);
  const quotient = Array(remainder.length - divisor.length + 1).fill(0);
  const inverseLead = inverse29(divisor[divisor.length - 1]);
  for (let k = remainder.length - 1; k >= divisor.length - 1; k--) {
    const coefficient = mod(remainder[k] * inverseLead);
    quotient[k - divisor.length + 1] = coefficient;
    for (let j = 0; j < divisor.length; j++) {
      remainder[k - divisor.length + 1 + j] =
        mod(remainder[k - divisor.length + 1 + j] - coefficient * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(0, divisor.length - 1) };
}
function indexOfCoincidence(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
function makeNativeReference(corpus, lp1Text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const prose = lp1Text.split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const reference = [];
  for (let word of prose.match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      if (token) {
        reference.push(token.i);
        i += token.s.length;
      } else i++;
    }
  }
  return reference;
}
function makeTrigramModel(reference) {
  const split = Math.floor(reference.length * 0.8);
  const train = reference.slice(0, split);
  const held = reference.slice(split);
  const counts = new Map();
  let total = 0;
  for (let i = 0; i + 2 < train.length; i++) {
    const key = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
    total++;
  }
  const denominator = total + 0.05 * 29 ** 3;
  const score = (sequence) => {
    let logp = 0;
    for (let i = 0; i + 2 < sequence.length; i++) {
      const key = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
      logp += Math.log(((counts.get(key) || 0) + 0.05) / denominator);
    }
    return logp / (sequence.length - 2);
  };
  return { score, held };
}
function windowScores(sequence, score, width) {
  const values = [];
  for (let i = 0; i + width <= sequence.length; i++)
    values.push(score(sequence.slice(i, i + width)));
  values.sort((a, b) => a - b);
  return values;
}

function main() {
  const grid = readJson('resources/liber-primus/lp2-grid-256.json');
  const corpus = readJson('resources/liber-primus/lp2-corpus.json');
  const lp1Text = readText('resources/liber-primus/lp1-plaintext-reference.txt');
  const bytes = grid.pages.flatMap((page) => page.bytes);
  assert.equal(bytes.length, 256);
  const tableSha256 = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(tableSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  // Source-linked factors: 2013 BASE29 3301 -> 3QO, and the p39 red triad.
  const H = [3, 26, 24];
  const G = [27, 5, 15];
  const divisor = multiplyLow(H, G);
  assert.deepEqual(divisor, [23, 21, 11, 17, 12]);
  const division = divideLow(bytes.map(mod).reverse(), divisor);
  assert.deepEqual(division.remainder, [0, 0, 0, 0]);
  const quotient = division.quotient.reverse();
  assert.equal(quotient.length, 252);
  assert.deepEqual(quotient.slice(0, 14), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8]);
  assert.deepEqual(quotient.slice(-14), [9, 23, 14, 1, 26, 13, 18, 2, 14, 8, 27, 19, 4, 6]);

  const chapterRanges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
    [27, 32], [33, 39], [40, 53], [54, 55]];
  const expectedCounts = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
  const chapters = chapterRanges.map(([first, last]) =>
    corpus.pages.filter((page) => page.page >= first && page.page <= last)
      .flatMap((page) => page.indices));
  assert.deepEqual(chapters.map((x) => x.length), expectedCounts);
  assert.equal(chapters.reduce((n, x) => n + x.length, 0), 12956);

  const keyBlocks = Array.from({ length: 9 }, (_, i) => quotient.slice(i * 28, (i + 1) * 28));
  const blockStats = keyBlocks.map((block, i) => {
    const unique = new Set(block).size;
    return {
      chapter: i + 1,
      uniqueValues: unique,
      duplicateSlots: 28 - unique,
      zeroCount: block.filter((x) => x === 0).length,
      missingNonzeroValues: Array.from({ length: 28 }, (_, j) => j + 1)
        .filter((x) => !block.includes(x)).length,
      isPermutationOfGF29Nonzero: unique === 28 && block.every((x) => x !== 0)
    };
  });

  const reference = makeNativeReference(corpus, lp1Text);
  const model = makeTrigramModel(reference);
  const nativeWindows = windowScores(model.held, model.score, 238);
  assert.equal(nativeWindows.length, 412);
  const native = {
    referenceRunes: reference.length,
    heldoutRunes: model.held.length,
    windowLength: 238,
    windowCount: nativeWindows.length,
    minimum: nativeWindows[0],
    median: nativeWindows[Math.floor(nativeWindows.length / 2)],
    maximum: nativeWindows[nativeWindows.length - 1]
  };

  let plantOffset = 0;
  const plantChecks = [];
  for (let chapter = 0; chapter < chapters.length; chapter++) {
    const plain = Array.from({ length: chapters[chapter].length },
      (_, i) => reference[(plantOffset + i) % reference.length]);
    plantOffset = (plantOffset + plain.length) % reference.length;
    const key = keyBlocks[chapter];
    for (const sign of [-1, 1]) {
      const encrypted = plain.map((p, i) => mod(p - sign * key[i % 28]));
      const decoded = encrypted.map((c, i) => mod(c + sign * key[i % 28]));
      assert.deepEqual(decoded, plain);
    }
    plantChecks.push({ chapter: chapter + 1, runes: plain.length, exactBothSigns: true });
  }

  const results = [];
  for (const sign of [-1, 1]) {
    const decodedBook = [];
    const wrongKeyBook = [];
    const perChapter = chapters.map((cipher, chapter) => {
      const key = keyBlocks[chapter];
      const wrongKey = key.slice();
      wrongKey[0] = mod(wrongKey[0] + 1);
      const plain = cipher.map((c, i) => mod(c + sign * key[i % 28]));
      const wrongPlain = cipher.map((c, i) => mod(c + sign * wrongKey[i % 28]));
      assert.deepEqual(plain.map((p, i) => mod(p - sign * key[i % 28])), cipher);
      decodedBook.push(...plain);
      wrongKeyBook.push(...wrongPlain);
      const windows = windowScores(plain, model.score, 238);
      return {
        chapter: chapter + 1,
        pages: chapterRanges[chapter][0] + '-' + chapterRanges[chapter][1],
        runes: plain.length,
        ioc: indexOfCoincidence(plain),
        trigramNatsPerRune: model.score(plain),
        best238Window: windows[windows.length - 1],
        median238Window: windows[Math.floor(windows.length / 2)],
        first40Runes: plain.slice(0, 40).map((x) => corpus.translit[x]).join(' ')
      };
    });
    const bestChapter238Window = Math.max(...perChapter.map((x) => x.best238Window));
    results.push({
      operation: sign === -1 ? 'P = C - K' : 'P = C + K',
      fullIoc: indexOfCoincidence(decodedBook),
      fullTrigramNatsPerRune: model.score(decodedBook),
      oneCoefficientWrongKeyTrigramNatsPerRune: model.score(wrongKeyBook),
      bestChapter238Window,
      chapters: perChapter
    });
  }

  const report = {
    classification: 'bounded negative; no unknown plaintext or authentic key',
    sourceTableSha256: tableSha256,
    sourceFactors: { H, G, product: divisor },
    quotientLength: quotient.length,
    quotientHighToLow: quotient,
    quotientFirst14: quotient.slice(0, 14),
    quotientLast14: quotient.slice(-14),
    chapterRanges,
    chapterRuneCounts: expectedCounts,
    keyBlockStatistics: blockStats,
    nativeReference: native,
    syntheticPositiveControls: plantChecks,
    results
  };
  console.log(JSON.stringify(report, null, 2));
}
main();
