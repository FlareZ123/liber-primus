#!/usr/bin/env node
'use strict';

/**
 * Original LP2 two-symbol 812-unit / predecessor-step cipher gate.
 *
 * No key fitting: grant every one of the 29 predecessor-step states a
 * completely arbitrary secret GP29 permutation, independently in each
 * of the nine source-visible visual chapters. The sorted ciphertext
 * row occupancies yield exact all-secret plaintext-frequency ceilings.
 *
 * The independent 2013/LP2 source algebra motivates, but does NOT
 * authenticate, the choice of this model. See paired report.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const native = gp.pages.find(p => p.page === 57).indices;
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const MOD = 29;
assert.equal(source.length, 12956);
assert.equal(native.length, 95);
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), source.length);

const mod = x => (x % MOD + MOD) % MOD;
const log19 = Array(MOD).fill(-1);
for (let x = 1, i = 0; i < 28; i++, x = mod(19 * x)) {
  assert.equal(log19[x], -1);
  log19[x] = i;
}
assert.equal(log19.filter(x => x >= 0).length, 28);

/** @param {number} previous @param {number} beforePrevious */
function state(previous, beforePrevious) {
  const difference = mod(previous - beforePrevious);
  return difference ? log19[difference] : 28;
}

/** @param {number[]} runes */
function counts(runes) {
  const n = Array(MOD).fill(0);
  for (const x of runes) {
    assert(Number.isInteger(x) && x >= 0 && x < MOD);
    n[x]++;
  }
  return n;
}

/** @param {number[]} stream */
function chunks(stream) {
  const result = [];
  let offset = 0;
  for (const n of chapterLengths) {
    result.push(stream.slice(offset, offset + n));
    offset += n;
  }
  assert.equal(offset, stream.length);
  return result;
}

/**
 * Exact upper bound on the frequency of ANY one decoded GP29 rune:
 * each state row can map only one ciphertext glyph to that plaintext
 * glyph under a bijection. First two positions per chapter are granted
 * arbitrarily, so the bound also covers unknown initial states.
 * @param {number[]} stream
 */
function chapterwiseBound(stream) {
  const perChapter = [];
  const matrices = [];
  for (const chapter of chunks(stream)) {
    const m = Array.from({length: MOD}, () => Array(MOD).fill(0));
    for (let i = 2; i < chapter.length; i++) {
      m[state(chapter[i - 1], chapter[i - 2])][chapter[i]]++;
    }
    const b = 2 + m.reduce((sum, row) => sum + Math.max(...row), 0);
    perChapter.push(b);
    matrices.push(m);
  }
  return {
    total: perChapter.reduce((a, b) => a + b, 0),
    perChapter,
    matrices
  };
}

/** Encode ordinary English using the source's full GP rune spelling. */
function nativeEnglish(raw) {
  const words = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {out.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {out.push(27); i += 2; continue;}
      const t = tokens.find(x => word.startsWith(x.s, i));
      assert(t, 'unrecognized GP native segment: ' + word.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/** @param {number[]} values @param {number} n */
function minWindowTop(values, n) {
  const h = counts(values.slice(0, n));
  let min = Math.max(...h), at = 0;
  for (let i = n; i < values.length; i++) {
    h[values[i - n]]--;
    h[values[i]]++;
    const top = Math.max(...h);
    if (top < min) {min = top; at = i - n + 1;}
  }
  return {min, at, windows: values.length - n + 1};
}

/** Deterministic test-only shuffle; seed is NOT a Cicada key. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}
const random = rng(0x8123301);
const maps = chapterLengths.map(() => Array.from({length: MOD}, () => {
  const p = Array.from({length: MOD}, (_, i) => i);
  for (let j = MOD - 1; j > 0; j--) {
    const k = random() % (j + 1);
    [p[j], p[k]] = [p[k], p[j]];
  }
  assert.equal(new Set(p).size, MOD);
  return p;
}));

/**
 * Source-shaped test-only reversible rotor.
 * @param {number[]} plain
 */
function encodeRotor(plain) {
  return chunks(plain).flatMap((p, c) => {
    const x = p.slice(0, 2);
    for (let i = 2; i < p.length; i++) {
      x.push(maps[c][state(x[i - 1], x[i - 2])][p[i]]);
    }
    return x;
  });
}

/** @param {number[]} cipher */
function decodeRotor(cipher) {
  return chunks(cipher).flatMap((c, chapter) => {
    const p = c.slice(0, 2);
    for (let i = 2; i < c.length; i++) {
      const permutation = maps[chapter][state(c[i - 1], c[i - 2])];
      p.push(permutation.indexOf(c[i]));
    }
    return p;
  });
}

/**
 * Single, frozen additional source-coefficient experiment:
 * 19+13 epsilon is the source-constructed order-812 dual unit. Using
 * its coefficients as a previous-two-ciphertext temporal filter is
 * a separate unprinted inference, with no fitted parameters.
 * @param {number[]} ciphertext
 */
function inverseTwoTap(ciphertext) {
  return chunks(ciphertext).flatMap(c => c.map((x, i) =>
    i < 2 ? x : mod(x - 19 * c[i - 1] - 13 * c[i - 2])));
}
function forwardTwoTap(plaintext) {
  return chunks(plaintext).flatMap(p => {
    const c = p.slice(0, 2);
    for (let i = 2; i < p.length; i++)
      c.push(mod(p[i] + 19 * c[i - 1] + 13 * c[i - 2]));
    return c;
  });
}

/** @param {number[]} runes */
function ioc(runes) {
  const h = counts(runes);
  return h.reduce((s, v) => s + v * (v - 1), 0) /
    (runes.length * (runes.length - 1));
}

/** Exact original printed-word lag-5 pair receiver, no reflow. */
function lagFivePairs() {
  const text = read('resources/lp2-transcription.txt').split('%')
    .slice(0, 55).join('%').replace(/\/\r?\n/g, '')
    .replace(/[\r\n%]/g, '');
  const ix = new Map(gp.runes.map((r, i) => [r, i]));
  const runes = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
  const words = (text.match(runes) || []).map(w =>
    Array.from(w, r => ix.get(r)));
  assert.equal(words.length, 2896);
  assert.deepEqual(words.flat(), source);
  let events = 0, eligible = 0, equalNext = 0, unequalNext = 0;
  const evidence = [];
  for (let w = 0; w < words.length; w++) {
    const x = words[w];
    for (let i = 6; i < x.length; i++) {
      if (x[i] !== x[i - 5] || x[i - 1] !== x[i - 6]) continue;
      events++;
      const next = i + 1 < x.length;
      if (next) {
        eligible++;
        if (x[i + 1] === x[i - 4]) equalNext++;
        else unequalNext++;
      }
      evidence.push({word: w, last: i, nextSame: next ?
        x[i + 1] === x[i - 4] : null});
    }
  }
  assert.equal(events, 9);
  assert.equal(eligible, 5);
  assert.equal(equalNext, 1);
  assert.equal(unequalNext, 4);
  return {events, words: new Set(evidence.map(e => e.word)).size,
    eligible, equalNext, unequalNext, evidence};
}

function main() {
  const original = chapterwiseBound(source);
  assert.deepEqual(original.perChapter,
    [94, 130, 152, 175, 112, 148, 154, 221, 62]);
  assert.equal(original.total, 1248);

  const english = nativeEnglish(read('resources/control/gibran_prophet_58585.txt'));
  assert.equal(english.length, 62492);
  const reference = minWindowTop(english, source.length);
  assert.deepEqual(reference, {min: 1416, at: 16749, windows: 49537});
  assert(original.total < reference.min);

  const plain = english.slice(0, source.length);
  const testCipher = encodeRotor(plain);
  assert.deepEqual(decodeRotor(testCipher), plain);
  assert(chapterwiseBound(testCipher).total >= Math.max(...counts(plain)));
  const native95 = native.slice();
  const nativePad = Array.from({length: source.length},
    (_, i) => native95[i % native95.length]);
  assert.deepEqual(inverseTwoTap(forwardTwoTap(nativePad)), nativePad);
  assert.deepEqual(forwardTwoTap(inverseTwoTap(source)), source);

  const twoTap = inverseTwoTap(source);
  assert.equal(Number(ioc(twoTap).toFixed(12)), 0.034476693911);
  const events = lagFivePairs();

  const output = {
    status: 'bounded exclusion, no recovered plaintext or authentic cipher',
    sourceRunes: source.length,
    chapterLengths,
    state: 'log_19(previous ciphertext difference mod29), 28=zero',
    allSecretChapterwiseTopOneCeiling: original.total,
    allSecretChapterwiseTopOneByChapter: original.perChapter,
    nativeGibranReference: reference,
    nativeEnglishMinTopDeficit: reference.min - original.total,
    plantedRotorExact: testCipher.length,
    plantedTwoTapExact: nativePad.length,
    frozenTwoTapOriginalIoC: ioc(twoTap),
    sourceFiveEchoPairEvents: events
  };
  console.log(JSON.stringify(output, null, 2));
}
if (require.main === module) main();
module.exports = {state, chapterwiseBound, lagFivePairs, inverseTwoTap,
  forwardTwoTap};
