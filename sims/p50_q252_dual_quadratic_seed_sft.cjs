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

function advanceByX(state, polynomial) {
  const inverseLead = inverse29(polynomial[2]);
  const [a, b] = state;
  // x(a + bx) modulo c0 + c1*x + c2*x^2.
  return [
    mod(-b * polynomial[0] * inverseLead),
    mod(a - b * polynomial[1] * inverseLead)
  ];
}

function generateKey(length, seedH, seedG, H, G) {
  let h = seedH.slice();
  let g = seedG.slice();
  const key = [];
  for (let i = 0; i < length; i++) {
    key.push(mod(h[0] + g[0]));
    h = advanceByX(h, H);
    g = advanceByX(g, G);
  }
  return key;
}

function statePeriod(seedH, seedG, H, G, maximum = 30000) {
  const initial = JSON.stringify([seedH, seedG]);
  let h = seedH.slice();
  let g = seedG.slice();
  for (let n = 1; n <= maximum; n++) {
    h = advanceByX(h, H);
    g = advanceByX(g, G);
    if (JSON.stringify([h, g]) === initial) return n;
  }
  return null;
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
      } else {
        i++;
      }
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
  for (let i = 0; i + 238 <= held.length; i++)
    windows.push(score(held.slice(i, i + 238)));
  windows.sort((a, b) => a - b);
  return { score, held, windows };
}

function renderOriginalLayout(segment, runeIndex, translit, decoded) {
  let cursor = 0;
  let output = '';
  for (const ch of segment) {
    if (runeIndex.has(ch)) output += translit[decoded[cursor++]];
    else output += ch;
  }
  assert.equal(cursor, decoded.length);
  return output;
}

function main() {
  const grid = readJson('resources/liber-primus/base60-grid.json');
  const corpus = readJson('resources/liber-primus/lp2-corpus.json');
  const transcript = readText('resources/lp2-transcription.txt');
  const lp1Text = readText('resources/liber-primus/lp1-plaintext-reference.txt');
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const tableSha256 = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(tableSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  // Exact source-linked factors: signed 2013 BASE29 3301 -> 3QO, and p39's red triad.
  const H = [3, 26, 24];
  const G = [27, 5, 15];
  const product = multiplyLow(H, G);
  assert.deepEqual(product, [23, 21, 11, 17, 12]);

  // Original table bytes are high-to-low polynomial coefficients.
  const P = bytes.map(mod).reverse();
  const division = divideLow(P, product);
  assert.deepEqual(division.remainder, [0, 0, 0, 0]);
  const Q = division.quotient;
  assert.equal(Q.length, 252);

  // The issue's one frozen register initialization and readout.
  const seedH = divideLow(Q, H).remainder;
  const seedG = divideLow(Q, G).remainder;
  assert.deepEqual(seedH, [5, 6]);
  assert.deepEqual(seedG, [3, 22]);
  const key = generateKey(238, seedH, seedG, H, G);
  const period = statePeriod(seedH, seedG, H, G);
  assert.equal(period, 24360);

  const p36 = corpus.pages.find((p) => p.page === 36).indices;
  assert.equal(p36.length, 238);
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const p36Segment = transcript.split('%')[36];
  const transcriptP36 = [...p36Segment].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch));
  assert.deepEqual(transcriptP36, p36);

  const reference = makeNativeReference(corpus, lp1Text);
  const model = makeTrigramModel(reference);
  assert.equal(model.windows.length, 406);
  const raw = { ioc: indexOfCoincidence(p36), trigramNatsPerRune: model.score(p36) };
  const native = {
    count: model.windows.length,
    minimum: model.windows[0],
    median: model.windows[Math.floor(model.windows.length / 2)],
    maximum: model.windows[model.windows.length - 1]
  };

  const wrongSeedH = [mod(seedH[0] + 1), seedH[1]];
  const wrongKey = generateKey(238, wrongSeedH, seedG, H, G);
  const results = [];
  for (const sign of [-1, 1]) {
    const decoded = p36.map((c, i) => mod(c + sign * key[i]));
    const forward = decoded.map((p, i) => mod(p - sign * key[i]));
    assert.deepEqual(forward, p36);

    const wrongDecoded = p36.map((c, i) => mod(c + sign * wrongKey[i]));
    const heldoutPlant = model.held.slice(0, 238);
    const plantedCipher = heldoutPlant.map((p, i) => mod(p - sign * key[i]));
    const recoveredPlant = plantedCipher.map((c, i) => mod(c + sign * key[i]));
    assert.deepEqual(recoveredPlant, heldoutPlant);

    results.push({
      sign,
      decoded: {
        ioc: indexOfCoincidence(decoded),
        trigramNatsPerRune: model.score(decoded),
        prefix100: decoded.slice(0, 100).map((x) => corpus.translit[x]).join(''),
        originalLayout: renderOriginalLayout(p36Segment, runeIndex, corpus.translit, decoded)
      },
      wrongSeedTrigramNatsPerRune: model.score(wrongDecoded),
      exactForwardReencryption: true,
      heldoutPositivePlantRunes: recoveredPlant.length,
      heldoutPositivePlantExact: true
    });
  }

  console.log(JSON.stringify({
    source: {
      table: 'resources/liber-primus/base60-grid.json',
      tableByteCount: bytes.length,
      tableByteSha256: tableSha256,
      radix60Conditional: true,
      H,
      G,
      productLow: product,
      quotientSlots: Q.length,
      quotientHSeed: seedH,
      quotientGSeed: seedG,
      quotientSha256: crypto.createHash('sha256').update(Buffer.from(Q)).digest('hex')
    },
    recurrence: {
      readout: 'sum of the two constant coefficients mod 29',
      keyPeriod: period,
      keyDistinctSymbols: new Set(key).size,
      first30KeySymbols: key.slice(0, 30)
    },
    p36: { runes: p36.length, raw, native238RuneWindows: native },
    results,
    decision: 'The one frozen Q252-seeded dual-quadratic stream does not recover p36 plaintext under either additive sign. Both outputs remain far below every held-out native-GP 238-rune window; the one-coefficient wrong-seed control is equally ciphertext-like. Exact re-encryption and held-out positive plants pass. Retire only this specified seed/readout/clock consumer; retain H/G as conditional table factors and parity evidence.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { main, divideLow, multiplyLow, advanceByX, generateKey };
