'use strict';

/**
 * GP29 one-step predecessor-exclusion with printed word-gap escape.
 * Source-native positive plant, exact cipher/side-bit inverse, original
 * pp0-39 training and pp40-55 holdout. Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Page-wise Euler trail retains full 29x29 directed bigrams, endpoints and
 * rune histogram; original printed word/line/page positions remain unchanged.
 * @param {number[]} page @param {() => number} random @returns {number[]}
 */
function eulerShuffle(page, random) {
  const edges = Array.from({length: 29}, () => []);
  for (let i = 1; i < page.length; i++) edges[page[i - 1]].push(page[i]);
  for (const out of edges) for (let i = out.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  const stack = [page[0]], trail = [];
  while (stack.length) {
    const out = edges[stack[stack.length - 1]];
    if (out.length) stack.push(out.pop());
    else trail.push(stack.pop());
  }
  trail.reverse();
  assert.equal(trail.length, page.length);
  assert.equal(trail[0], page[0]);
  assert.equal(trail.at(-1), page.at(-1));
  return trail;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = new Uint32Array(29);
  for (const r of a) count[r]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * In the primary source, '%' means page break and '/' means printed line
 * break; both preserve words, including the real p54->p55 carry.
 * Other nonrune punctuation separates words. Source contains 2,896 words.
 * @returns {{page:number,c:number[],b:number[]}[]}
 */
function loadOriginal() {
  const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const raw = read('resources/liber-primus/lp2-transcription.txt')
    .split('%').slice(0, 55).join('%');
  const glyphs = new Map(gp.runes.map((r, i) => [r, i]));
  const runes = [], gaps = [];
  let active = false;
  for (const ch of raw) {
    if (glyphs.has(ch)) {
      runes.push(glyphs.get(ch));
      gaps.push(0);
      active = true;
    } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Wrapping, not word punctuation.
    } else if (active) {
      gaps[gaps.length - 1] = 1;
      active = false;
    }
  }
  assert.equal(runes.length, 12956);
  assert.equal(gaps.reduce((s, b) => s + b, 0), 2896);
  let offset = 0;
  const rows = [];
  for (const p of gp.pages.filter(p => p.status === 'unsolved' && p.indices.length)) {
    const c = runes.slice(offset, offset + p.indices.length);
    const b = gaps.slice(offset, offset + p.indices.length);
    assert.deepEqual(c, p.indices, 'physical LP2 page ' + p.page);
    rows.push({page: p.page, c, b});
    offset += c.length;
  }
  assert.equal(rows.length, 55);
  assert.equal(offset, runes.length);
  return rows;
}

/**
 * Separate source-native GP English; no original LP2 plaintext or key used.
 * @param {number} n @returns {number[]}
 */
function nativeEnglish(n) {
  const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const tokens = gp.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const words = read('resources/control/shakespeare_first300k.txt')
    .toUpperCase().match(/[A-Z]+/g) || [];
  const out = [];
  for (const wordRaw of words) {
    const word = wordRaw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const match = tokens.find(x => word.startsWith(x.token, i));
      assert(match, 'native GP word ' + word);
      out.push(match.i);
      i += match.token.length;
    }
    if (out.length >= n) break;
  }
  assert(out.length >= n);
  return out.slice(0, n);
}

/**
 * Source-motivated low-state escape transducer, using original printed
 * word-gap coordinates as cover. Plain symbol equal to prior cipher symbol
 * is mapped to +1 with a forced gap, except deterministic every-fifth-site
 * literal repeats. Plain symbol equal to successor uses a forced zero gap.
 * A +1 output is thereby disambiguated by its post-rune gap bit.
 * @param {{page:number,c:number[],b:number[]}[]} template
 * @param {number[]} plaintext
 */
function encode(template, plaintext) {
  let offset = 0, escapes = 0, repeats = 0;
  const rows = template.map(src => {
    const plain = plaintext.slice(offset, offset + src.c.length);
    offset += plain.length;
    const c = [], b = src.b.slice();
    for (let i = 0; i < plain.length; i++) {
      const value = plain[i];
      if (i === 0) { c.push(value); continue; }
      const previous = c[i - 1];
      if (value === previous) {
        if ((i + src.page * 31) % 5 === 0) {
          c.push(previous);
          repeats++;
        } else {
          c.push((previous + 1) % 29);
          b[i] = 1;
          escapes++;
        }
      } else if (value === (previous + 1) % 29) {
        c.push(value);
        b[i] = 0;
      } else c.push(value);
    }
    return {page: src.page, c, b};
  });
  assert.equal(offset, plaintext.length);
  assert.deepEqual(decode(rows), plaintext);
  return {rows, escapes, repeats};
}

/**
 * Reversible inverse from emitted runes and emitted word-gap side bits only.
 * @param {{page:number,c:number[],b:number[]}[]} rows
 * @returns {number[]}
 */
function decode(rows) {
  const plain = [];
  for (const row of rows) {
    plain.push(row.c[0]);
    for (let i = 1; i < row.c.length; i++) {
      const previous = row.c[i - 1], current = row.c[i];
      plain.push(current === (previous + 1) % 29 && row.b[i] ? previous : current);
    }
  }
  return plain;
}

/**
 * Key-independent I(wordEnd;successorTransition | predecessorSymbol) in bits,
 * plus directional gap-rate difference and deterministic decoded GP29 IoC.
 * @param {{page:number,c:number[],b:number[]}[]} rows
 */
function measure(rows) {
  const table = Array.from({length: 29}, () => [[0, 0], [0, 0]]);
  const n = [0, 0], gaps = [0, 0];
  let repeats = 0;
  for (const row of rows) for (let i = 1; i < row.c.length; i++) {
    const prior = row.c[i - 1], curr = row.c[i];
    const y = Number(curr === (prior + 1) % 29), b = row.b[i];
    assert(b === 0 || b === 1);
    table[prior][y][b]++;
    n[y]++;
    gaps[y] += b;
    repeats += Number(prior === curr);
  }
  const N = n[0] + n[1];
  let mi = 0;
  for (const t of table) {
    const sum = t.flat().reduce((s, v) => s + v, 0);
    const row = t.map(v => v[0] + v[1]);
    const col = [t[0][0] + t[1][0], t[0][1] + t[1][1]];
    for (let y = 0; y < 2; y++) for (let b = 0; b < 2; b++) {
      const v = t[y][b];
      if (v) mi += v / N * Math.log2(v * sum / (row[y] * col[b]));
    }
  }
  const original = rows.flatMap(r => r.c);
  return {
    runes: original.length, pairs: N, repeats,
    successor: n[1], successorEnds: gaps[1],
    other: n[0], otherEnds: gaps[0],
    delta: gaps[1] / n[1] - gaps[0] / n[0],
    cmiBits: mi,
    rawIoC: ioc(original),
    candidatePlainIoC: ioc(decode(rows))
  };
}

/**
 * Exact page/word/line coordinates and exact 29x29 original bigrams are
 * preserved by every conditional Euler randomization. Monte Carlo +1 tails.
 * @param {{page:number,c:number[],b:number[]}[]} rows
 * @param {number} seed @param {number} trials
 */
function calibrate(rows, seed, trials) {
  const actual = measure(rows), rng = random32(seed);
  let sumDelta = 0, sumMI = 0, exceedDelta = 0, exceedMI = 0;
  for (let i = 0; i < trials; i++) {
    const randomized = rows.map(row => ({
      page: row.page, c: eulerShuffle(row.c, rng), b: row.b
    }));
    const x = measure(randomized);
    sumDelta += x.delta;
    sumMI += x.cmiBits;
    exceedDelta += Number(x.delta >= actual.delta);
    exceedMI += Number(x.cmiBits >= actual.cmiBits);
  }
  return {
    actual, trials, nullMeanDelta: sumDelta / trials,
    nullMeanMI: sumMI / trials,
    positiveTailDeltaP: (exceedDelta + 1) / (trials + 1),
    upperTailMIP: (exceedMI + 1) / (trials + 1)
  };
}

function main() {
  const original = loadOriginal();
  const first = original.filter(r => r.page < 40);
  const withheld = original.filter(r => r.page >= 40);
  assert.equal(first.length, 40);
  assert.equal(withheld.length, 15);
  const plain = nativeEnglish(12956);
  const plant = encode(original, plain);
  const positiveTrain = calibrate(plant.rows.filter(r => r.page < 40), 0x24060401, 160);
  const positiveHold = calibrate(plant.rows.filter(r => r.page >= 40), 0x24060402, 160);
  assert(positiveTrain.actual.delta > 0.07);
  assert(positiveHold.actual.delta > 0.07);
  assert(positiveTrain.positiveTailDeltaP < 0.02);
  assert(positiveHold.positiveTailDeltaP < 0.02);
  assert(positiveTrain.upperTailMIP < 0.02);
  assert(positiveHold.upperTailMIP < 0.02);
  assert(plant.repeats > 0);
  // Reciphering the planted plaintext with its own emitted gaps is identical:
  // all protected slots are forced; unprotected slots retain their cover bits.
  const rerun = encode(plant.rows, plain);
  assert.deepEqual(rerun.rows, plant.rows);
  const actualTrain = calibrate(first, 0x24060403, 320);
  const actualHold = calibrate(withheld, 0x24060404, 320);
  assert.equal(actualTrain.actual.runes, 9640);
  assert.equal(actualHold.actual.runes, 3316);
  assert.equal(actualTrain.actual.repeats, 65);
  assert.equal(actualHold.actual.repeats, 21);
  assert.equal(actualTrain.actual.successor, 358);
  assert.equal(actualHold.actual.successor, 99);
  assert.equal(actualTrain.actual.successorEnds, 70);
  assert.equal(actualHold.actual.successorEnds, 23);
  assert(actualTrain.actual.candidatePlainIoC < 0.04);
  assert(actualHold.actual.candidatePlainIoC < 0.04);
  console.log(JSON.stringify({
    hypothesis: 'fixed GP29 predecessor exclusion, gap=escape bit, literal fifth-site repeats',
    source: 'LP2 original 12956 runes, 2896 printed word ends, 55 rune-bearing pages',
    observed: {training: actualTrain, heldout: actualHold},
    planted: {
      escapeSymbols: plant.escapes, literalRepeats: plant.repeats,
      nativeEnglishIoC: ioc(plain), reversible: true,
      training: positiveTrain, heldout: positiveHold
    },
    conclusion: 'Exact GP29 plant is recoverable; the tested source-boundary side channel is unsupported on actual LP2. No original plaintext/key is recovered.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {loadOriginal, nativeEnglish, encode, decode, measure, calibrate};
