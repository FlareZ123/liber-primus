'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x, m = 29) => ((x % m) + m) % m;

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
  const remainder = dividend.map((x) => mod(x));
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

function nativeGp(text, tokens) {
  let normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find((t) => normalized.startsWith(t.s, i));
    if (token) {
      out.push(token.i);
      i += token.s.length;
    } else {
      i++;
    }
  }
  return out;
}

function makeModel(reference, windowLength = 238) {
  const split = Math.floor(reference.length * 0.8);
  const train = reference.slice(0, split);
  const held = reference.slice(split);
  const counts = new Map();
  let total = 0;
  for (let i = 0; i + 2 < train.length; i++) {
    const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
    counts.set(k, (counts.get(k) || 0) + 1);
    total++;
  }
  const denominator = total + 0.05 * 29 ** 3;
  const score = (sequence) => {
    let logp = 0;
    for (let i = 0; i + 2 < sequence.length; i++) {
      const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
      logp += Math.log(((counts.get(k) || 0) + 0.05) / denominator);
    }
    return logp / (sequence.length - 2);
  };
  const windows = [];
  for (let i = 0; i + windowLength <= held.length; i++)
    windows.push(score(held.slice(i, i + windowLength)));
  windows.sort((a, b) => a - b);
  return { score, held, windows };
}

function decode(cipher, lengths, keys, sign, firstAsStep, wrongSeed = false) {
  let previous = 0;
  let keyPosition = 0;
  let section = 0;
  const out = [];
  const boundaries = [];
  let sum = 0;
  for (const length of lengths) {
    sum += length;
    boundaries.push(sum);
  }

  for (let i = 0; i < cipher.length; i++) {
    while (section < lengths.length - 1 && i >= boundaries[section]) {
      section++;
      keyPosition = 0;
    }
    const current = cipher[i];
    const delta = mod(current - previous);
    if (i === 0 && !firstAsStep) {
      out.push(current);
      previous = current;
      continue;
    }
    if (delta === 0) {
      out.push(28); // EA; transparent and does not consume a key symbol.
      previous = current;
      continue;
    }
    let key = keys[section][keyPosition % 28];
    if (wrongSeed && section === 0 && keyPosition === 0) key = mod(key + 1, 28);
    keyPosition++;
    out.push(mod(delta - 1 + sign * key, 28));
    previous = current;
  }
  return out;
}

function encode(plain, lengths, keys, sign, firstAsStep) {
  let previous = 0;
  let keyPosition = 0;
  let section = 0;
  const out = [];
  const boundaries = [];
  let sum = 0;
  for (const length of lengths) {
    sum += length;
    boundaries.push(sum);
  }

  for (let i = 0; i < plain.length; i++) {
    while (section < lengths.length - 1 && i >= boundaries[section]) {
      section++;
      keyPosition = 0;
    }
    const symbol = plain[i];
    if (i === 0 && !firstAsStep) {
      out.push(symbol);
      previous = symbol;
      continue;
    }
    if (symbol === 28) {
      out.push(previous);
      continue;
    }
    const key = keys[section][keyPosition % 28];
    keyPosition++;
    const delta = mod(symbol - sign * key, 28) + 1;
    previous = mod(previous + delta);
    out.push(previous);
  }
  return out;
}

function main() {
  const grid = readJson('resources/liber-primus/base60-grid.json');
  const corpus = readJson('resources/liber-primus/lp2-corpus.json');
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const tableSha256 = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(tableSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  const H = [3, 26, 24];
  const G = [27, 5, 15];
  const product = multiplyLow(H, G);
  assert.deepEqual(product, [23, 21, 11, 17, 12]);
  const P = bytes.map((x) => mod(x)).reverse();
  const division = divideLow(P, product);
  assert.deepEqual(division.remainder, [0, 0, 0, 0]);
  const Q = division.quotient;
  assert.equal(Q.length, 252);

  // Original-image red-heading/preceding-page-red13 chapter cuts.
  const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
    [27, 32], [33, 39], [40, 53], [54, 55]];
  const pages = corpus.pages.filter((p) => p.page <= 55);
  const chapterArrays = chapters.map(([a, b]) =>
    pages.filter((p) => p.page >= a && p.page <= b).flatMap((p) => p.indices));
  const lengths = chapterArrays.map((x) => x.length);
  assert.deepEqual(lengths, [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
  const cipher = chapterArrays.flat();
  assert.equal(cipher.length, 12956);
  const zeroSteps = cipher.slice(1).filter((x, i) => x === cipher[i]).length;
  assert.equal(zeroSteps, 86);

  // Nine quotient rows, each 28 symbols; reduce GF(29) values to the non-EA GP28 alphabet.
  const keys = Array.from({ length: 9 }, (_, i) =>
    Q.slice(i * 28, (i + 1) * 28).map((x) => mod(x, 28)));
  const rowUniqueCounts = keys.map((row) => new Set(row).size);

  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const controls = [
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt'
  ].map((p) => nativeGp(readText(p), tokens));
  const reference = controls.flat();
  const model = makeModel(reference, 238);
  assert.equal(model.windows.length, 119213);
  const native = {
    count: model.windows.length,
    minimum: model.windows[0],
    median: model.windows[Math.floor(model.windows.length / 2)],
    maximum: model.windows[model.windows.length - 1]
  };

  const results = [];
  for (const firstAsStep of [false, true]) {
    for (const sign of [-1, 1]) {
      const plain = decode(cipher, lengths, keys, sign, firstAsStep, false);
      const wrong = decode(cipher, lengths, keys, sign, firstAsStep, true);
      const positivePlant = model.held.slice(0, cipher.length);
      assert.equal(positivePlant.length, cipher.length);
      const plantedCipher = encode(positivePlant, lengths, keys, sign, firstAsStep);
      const recoveredPlant = decode(plantedCipher, lengths, keys, sign, firstAsStep, false);
      assert.deepEqual(recoveredPlant, positivePlant);

      let best238Window = -Infinity;
      for (let i = 0; i + 238 <= plain.length; i++)
        best238Window = Math.max(best238Window, model.score(plain.slice(i, i + 238)));

      const sectionScores = [];
      let offset = 0;
      for (let i = 0; i < lengths.length; i++) {
        sectionScores.push(model.score(plain.slice(offset, offset + lengths[i])));
        offset += lengths[i];
      }

      results.push({
        firstSymbolAsStep: firstAsStep,
        sign,
        fullTextTrigramNatsPerRune: model.score(plain),
        ioc: indexOfCoincidence(plain),
        best238RuneWindow: best238Window,
        wrongSeedFullTextScore: model.score(wrong),
        sectionScores,
        prefix180: plain.slice(0, 180).map((x) => corpus.translit[x]).join(''),
        positivePlantRunes: recoveredPlant.length,
        positivePlantExact: true
      });
    }
  }

  console.log(JSON.stringify({
    source: {
      tableByteSha256: tableSha256,
      factorsH: H,
      factorsG: G,
      quotientSlots: Q.length,
      quotientSha256: crypto.createHash('sha256').update(Buffer.from(Q)).digest('hex'),
      chapterPageRanges: chapters,
      chapterRuneLengths: lengths,
      quotientRowsMod28: keys,
      rowUniqueCounts
    },
    chainModel: {
      status: 'conditional hypothesis',
      zeroSteps: zeroSteps,
      zeroStepOutput: 'literal EA (GP29 index 28), key clock does not advance',
      chainState: 'continuous across all nine chapters',
      keyRows: 'one repeating 28-symbol Q252 row per original visual chapter',
      keyClock: 'resets at each original visual chapter boundary',
      firstSymbolConventions: ['literal initial symbol', 'initial step from zero']
    },
    native238RuneControls: native,
    results,
    decision: 'The fixed Q252 9x28 per-chapter key on the continuous chain-step stream fails under both signs and both first-symbol conventions. The best candidate 238-rune window remains far below the worst native window; the one-coefficient wrong-seed control is indistinguishable. Held-out 12,956-rune positive plants recover exactly. Retire only this Q252-to-chain-step key schedule; neither the chain model nor other Q252 uses are thereby disproved.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { main, decode, encode };
