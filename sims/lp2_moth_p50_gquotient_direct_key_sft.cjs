'use strict';

/**
 * Test the 254-slot GF(29) quotient of the original p50 table as a one-use
 * additive key for the source-selected p53+p55 repeated-moth register.
 *
 * Original inputs only; no fitted phase, reversal, page reset, F skip,
 * word reset, alternative radix, or marker consumption.
 * Node.js 22, built-in modules only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const readBytes = name => fs.readFileSync(path.join(ROOT, name));
const readText = name => readBytes(name).toString('utf8');
const mod = x => ((x % 29) + 29) % 29;
const sha1 = bytes => {
  const header = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
};
function assertBlob(name, expected) {
  const bytes = readBytes(name);
  assert.equal(sha1(bytes), expected, name + ' Git blob SHA-1');
  return bytes;
}
function inverse29(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('No GF(29) inverse for ' + a);
}
function divideHigh(coefficients, divisor) {
  const work = coefficients.slice();
  const quotient = Array(work.length - divisor.length + 1).fill(0);
  const leadInverse = inverse29(divisor[0]);
  for (let i = 0; i < quotient.length; i++) {
    const factor = mod(work[i] * leadInverse);
    quotient[i] = factor;
    for (let j = 0; j < divisor.length; j++) {
      work[i + j] = mod(work[i + j] - factor * divisor[j]);
    }
  }
  return { quotient, remainder: work.slice(-divisor.length + 1), work };
}
function multiplyHigh(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}
function evaluateHigh(coefficients, x) {
  let value = 0;
  for (const coefficient of coefficients) value = mod(value * x + coefficient);
  return value;
}
function derivativeHigh(coefficients) {
  const degree = coefficients.length - 1;
  return coefficients.slice(0, -1).map((coefficient, i) =>
    mod(coefficient * (degree - i)));
}
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (symbols.length * (symbols.length - 1));
}
function transliterate(symbols, alphabet) {
  return symbols.map(symbol => alphabet[symbol]).join('');
}
function gpEncode(text) {
  const letters = {
    A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11,
    L:20, M:19, N:9, O:3, P:13, R:4, S:15, T:16, U:1, W:7,
    X:14, Y:26
  };
  const pairs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
  const aliases = {K:'C', Q:'C', V:'U', Z:'S'};
  const source = text.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/[KQVZ]/g, letter => aliases[letter]);
  const output = [];
  for (let i = 0; i < source.length;) {
    const pair = pairs[source.slice(i, i + 2)];
    if (pair !== undefined) {
      output.push(pair);
      i += 2;
    } else {
      assert.ok(letters[source[i]] !== undefined, 'Unmapped Latin letter: ' + source[i]);
      output.push(letters[source[i]]);
      i++;
    }
  }
  return output;
}
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function main() {
  const gridBytes = assertBlob(
    'resources/liber-primus/base60-grid.json',
    '4698c0806e6bab06a39cfbc3c3283b862de58b35'
  );
  const corpusBytes = assertBlob(
    'resources/liber-primus/lp2-corpus.json',
    '054f2a0f780b7d46901acbe3d9bf4f0ac1801165'
  );
  const annotationBytes = assertBlob(
    'resources/liber-primus/lp2-ink-annotations.json',
    '0614aca67969a14ae006e0c1ae6aee6dcd8136e6'
  );
  const shakespeareBytes = assertBlob(
    'resources/control/shakespeare_first300k.txt',
    '94c677ad9dd50771c6670e0c4e4dad9052b46d85'
  );
  const gibranBytes = assertBlob(
    'resources/control/gibran_prophet_58585.txt',
    'df260a07d56bf5998d40a6360b6132c35c252d10'
  );
  const emersonBytes = assertBlob(
    'resources/control/emerson_essays_2944.txt',
    'a92be8ba5b3511a003a22ba31523c14397aaa83a'
  );

  const grid = JSON.parse(gridBytes.toString('utf8'));
  const corpus = JSON.parse(corpusBytes.toString('utf8'));
  const annotations = JSON.parse(annotationBytes.toString('utf8'));

  // Reconstruct the conventional radix-60 bytes from the original printed
  // two-character tokens; byte_rows is checked independently, not trusted.
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  assert.equal(digits.length, 60);
  assert.equal(grid.rows.length, 32);
  assert.ok(grid.rows.every(row => row.length === 8));
  assert.equal(grid.byte_rows.length, 32);
  const tokens = grid.rows.flat();
  assert.equal(tokens.length, 256);
  const bytes = tokens.map(token => {
    assert.equal(token.length, 2);
    const high = digits.indexOf(token[0]);
    const low = digits.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0, 'Invalid base-60 token ' + token);
    return high * 60 + low;
  });
  assert.deepEqual(bytes, grid.byte_rows.flat());
  assert.ok(bytes.every(byte => byte >= 0 && byte <= 255));

  const p39 = corpus.pages.find(page => page.page === 39);
  const p53 = corpus.pages.find(page => page.page === 53);
  const p54 = corpus.pages.find(page => page.page === 54);
  const p55 = corpus.pages.find(page => page.page === 55);
  const p57 = corpus.pages.find(page => page.page === 57);
  const a39 = annotations.pages.find(page => page.page === 39);
  const a53 = annotations.pages.find(page => page.page === 53);
  const a54 = annotations.pages.find(page => page.page === 54);
  const a55 = annotations.pages.find(page => page.page === 55);

  // The red p39 triad is low-first polynomial data; the table polynomial
  // uses high-first coefficient order, so reverse the triad for division.
  assert.equal(a39.red_spans[0].start, 119);
  assert.equal(a39.red_spans[0].length, 3);
  const gLow = p39.indices.slice(119, 122);
  assert.deepEqual(gLow, [27, 5, 15]);
  const gHigh = gLow.slice().reverse();
  assert.deepEqual(gHigh, [15, 5, 27]);

  // The enlarged p54 A independently identifies the repeated root 24.
  assert.equal(a54.red_spans[0].start, 0);
  assert.equal(a54.red_spans[0].length, 9);
  assert.equal(p54.indices[0], 24);
  const root = 24;

  // Original p50 table polynomial: 256 printed row-major bytes, reduced
  // modulo 29. The source-factor gate selects this conditional representation.
  const coefficients = bytes.map(byte => mod(byte));
  assert.equal(coefficients.length, 256);
  assert.equal(evaluateHigh(coefficients, root), 0);
  assert.equal(evaluateHigh(derivativeHigh(coefficients), root), 0);
  assert.equal(evaluateHigh(gHigh, root), 0);
  assert.equal(evaluateHigh(derivativeHigh(gHigh), root), 0);

  const division = divideHigh(coefficients, gHigh);
  const quotient = division.quotient;
  assert.equal(quotient.length, 254);
  assert.deepEqual(division.remainder, [0, 0]);
  assert.ok(division.work.slice(0, quotient.length).every(value => value === 0));
  assert.equal(quotient[0], 0); // retained leading physical coefficient slot
  assert.deepEqual(multiplyHigh(quotient, gHigh), coefficients);

  // Repeated moth artwork selects p53 and p55 as a candidate pair.
  // p55 begins with an incoming NG carried from p54; exclude only that
  // incomplete carry, preserving all 75 complete p55-body runes.
  assert.equal(p53.indices.length, 179);
  assert.equal(p55.indices.length, 76);
  assert.equal(p55.indices[0], 21);
  assert.equal(corpus.translit[21], 'NG');
  assert.deepEqual(a53.large_punctuation, [[179, 13, 'red']]);
  assert.deepEqual(a55.large_punctuation, [[76, 13, 'red']]);
  const target = [...p53.indices, ...p55.indices.slice(1)];
  assert.equal(target.length, 254);
  assert.equal(target.length, quotient.length);

  const minus = target.map((cipher, i) => mod(cipher - quotient[i]));
  const plus = target.map((cipher, i) => mod(cipher + quotient[i]));
  assert.deepEqual(minus.map((plain, i) => mod(plain + quotient[i])), target);
  assert.deepEqual(plus.map((plain, i) => mod(plain - quotient[i])), target);

  // Positive control: a known clear 95-rune p57 stream, tiled to the exact
  // register length, must be recovered under both conventional directions.
  assert.equal(p57.indices.length, 95);
  const plant = Array.from({length: 254}, (_, i) => p57.indices[i % p57.indices.length]);
  const plantedMinusCipher = plant.map((plain, i) => mod(plain + quotient[i]));
  const plantedMinusPlain = plantedMinusCipher.map((cipher, i) => mod(cipher - quotient[i]));
  const plantedPlusCipher = plant.map((plain, i) => mod(plain - quotient[i]));
  const plantedPlusPlain = plantedPlusCipher.map((cipher, i) => mod(cipher + quotient[i]));
  assert.deepEqual(plantedMinusPlain, plant);
  assert.deepEqual(plantedPlusPlain, plant);

  // Independent GP29 English-language trigram control.
  const shakespeare = shakespeareBytes.toString('utf8');
  const gibran = gibranBytes.toString('utf8');
  const emerson = emersonBytes.toString('utf8');
  assert.equal(shakespeare.length, 300000);
  assert.equal(gibran.length, 90965);
  assert.equal(emerson.length, 439075);
  const training = gpEncode(shakespeare.slice(0, 200000));
  const heldOutShakespeare = gpEncode(shakespeare.slice(200000));
  const controls = [
    heldOutShakespeare,
    gpEncode(gibran),
    gpEncode(emerson)
  ];
  const trigramCounts = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i < training.length - 2; i++) {
    const key = training[i] * 841 + training[i + 1] * 29 + training[i + 2];
    trigramCounts[key]++;
  }
  const denominator = training.length - 2 + 0.01 * 29 * 29 * 29;
  function trigramScore(symbols) {
    let total = 0;
    for (let i = 0; i < symbols.length - 2; i++) {
      const key = symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2];
      total += Math.log((trigramCounts[key] + 0.01) / denominator);
    }
    return total / (symbols.length - 2);
  }
  const random = xorshift(0x239254);
  const controlScores = [];
  for (let i = 0; i < 3000; i++) {
    const source = controls[i % controls.length];
    const start = random() % (source.length - 254);
    controlScores.push(trigramScore(source.slice(start, start + 254)));
  }
  controlScores.sort((a, b) => a - b);
  const controlSummary = {
    n: controlScores.length,
    min: controlScores[0],
    p1: controlScores[Math.floor(controlScores.length * 0.01)],
    p5: controlScores[Math.floor(controlScores.length * 0.05)],
    median: controlScores[Math.floor(controlScores.length * 0.5)],
    max: controlScores[controlScores.length - 1]
  };
  const p57Score = trigramScore(p57.indices);
  const scores = {
    raw: trigramScore(target),
    subtract: trigramScore(minus),
    add: trigramScore(plus),
    p57Clear95: p57Score
  };
  assert.ok(scores.subtract < controlSummary.min - 5);
  assert.ok(scores.add < controlSummary.min - 5);

  const output = {
    source: {
      tableTokens: tokens.length,
      polynomialCoefficientOrder: 'high-first; original printed row-major',
      p39RedTriadLowFirst: gLow,
      p54EnlargedA: root,
      divisorHighFirst: gHigh,
      p50PolynomialAt24: evaluateHigh(coefficients, root),
      p50DerivativeAt24: evaluateHigh(derivativeHigh(coefficients), root)
    },
    quotient: {
      length: quotient.length,
      remainder: division.remainder,
      leadingSlot: quotient[0],
      head: quotient.slice(0, 20),
      tail: quotient.slice(-18),
      ioc: ioc(quotient)
    },
    target: {
      p53Runes: p53.indices.length,
      p55Runes: p55.indices.length,
      p55IncomingCarry: corpus.translit[p55.indices[0]],
      p55BodyRunes: p55.indices.length - 1,
      totalRunes: target.length,
      terminalMarkers: 2,
      eventsIncludingMarkers: target.length + 2,
      rawIoc: ioc(target)
    },
    directInverses: {
      subtract: {
        ioc: ioc(minus),
        p53Ioc: ioc(minus.slice(0, 179)),
        p55Ioc: ioc(minus.slice(179)),
        trigram: scores.subtract,
        p53Trigram: trigramScore(minus.slice(0, 179)),
        p55Trigram: trigramScore(minus.slice(179)),
        prefix: transliterate(minus, corpus.translit).slice(0, 120)
      },
      add: {
        ioc: ioc(plus),
        p53Ioc: ioc(plus.slice(0, 179)),
        p55Ioc: ioc(plus.slice(179)),
        trigram: scores.add,
        p53Trigram: trigramScore(plus.slice(0, 179)),
        p55Trigram: trigramScore(plus.slice(179)),
        prefix: transliterate(plus, corpus.translit).slice(0, 120)
      },
      rawTrigram: scores.raw
    },
    englishControls: {
      trainingSymbols: training.length,
      controlLengths: controls.map(control => control.length),
      controlWindows: controlSummary,
      clearP57Trigram: scores.p57Clear95
    },
    positiveControl: {
      p57TiledRunes: plant.length,
      subtractRecovered: plantedMinusPlain.length,
      addRecovered: plantedPlusPlain.length,
      exact: true
    }
  };
  console.log(JSON.stringify(output, null, 2));
  console.log('PASS: exact source reconstruction, GF(29) division, both original inverses,');
  console.log('      both 254/254 p57 plants, and independently sampled English controls.');
}

main();
