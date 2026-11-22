'use strict';
/**
 * Magicicada 13/17-year cycle hypothesis: key-independent GP29 and
 * no-repeat GP28 phase-alphabet tests on original LP2 p0-55.
 *
 * Run: node sims/lp2_magicicada_13_17_allkey_sft.cjs
 * Node.js 22, standard library only, no writes or network.
 *
 * This is a test of a hypothesized source operation, not a decipherment.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = db.pages.filter((p) => p.page < 56 && p.indices.length);
const sourcePages = pages.map((p) => p.indices);
const lengths = pages.map((p) => p.indices.length);
assert.equal(pages.length, 55);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
const originalDoubletMask = sourcePages.map((p) =>
  p.map((x, i) => i === 0 || x === p[i - 1]));
assert.equal(originalDoubletMask.flat().filter(Boolean).length, 141);
const periods = [13, 17, 221];
const scopes = ['continuous', 'page'];
const rankTypes = ['sorted', 'cyclic'];
const units28 = [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27];

/** @param {number} x @returns {number} */
const mod29 = (x) => (x % 29 + 29) % 29;
/**
 * @param {(number|null)[][]} sequences
 * @param {number} period
 * @param {string} scope
 * @param {number} radix
 * @returns {{same:number,pairs:number,rate:number}}
 */
function phaseEquality(sequences, period, scope, radix) {
  const counts = Array.from({length: period}, () => new Uint32Array(radix));
  let prefix = 0;
  for (const pg of sequences) {
    for (let i = 0; i < pg.length; i++) {
      const symbol = pg[i];
      if (symbol === null) continue;
      assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < radix);
      const position = (scope === 'page' ? i : prefix + i) % period;
      counts[position][symbol]++;
    }
    prefix += pg.length;
  }
  let same = 0;
  let pairs = 0;
  for (const row of counts) {
    let n = 0;
    for (const v of row) {
      n += v;
      same += v * (v - 1) / 2;
    }
    pairs += n * (n - 1) / 2;
  }
  return {same, pairs, rate: same / pairs};
}
/**
 * Invert one of two exact 28-symbol encoders excluding previous glyph.
 * Original page-starts and original identical adjacent pairs are erasures.
 * @param {number[][]} ciphertext
 * @param {string} kind
 * @returns {(number|null)[][]}
 */
function derank(ciphertext, kind) {
  return ciphertext.map((pg) => pg.map((x, i) => {
    if (i === 0 || x === pg[i - 1]) return null;
    const rank = kind === 'sorted'
      ? x - Number(x > pg[i - 1])
      : mod29(x - pg[i - 1]) - 1;
    assert.ok(rank >= 0 && rank < 28);
    return rank;
  }));
}
const originalRanks = Object.fromEntries(rankTypes.map((kind) =>
  [kind, derank(sourcePages, kind)]));
/** @param {number[]} items @returns {number[][]} */
function splitPages(items) {
  let begin = 0;
  return lengths.map((n) => {
    const pg = items.slice(begin, begin + n);
    begin += n;
    assert.equal(pg.length, n);
    return pg;
  });
}
const alphabet = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function gp(text) {
  const canonical = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of canonical.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const tok = alphabet.find((x) => word.startsWith(x.token, i));
      assert.ok(tok, 'GP mapping missing: ' + word.slice(i));
      out.push(tok.index);
      i += tok.token.length;
    }
  }
  return out;
}
/**
 * Control GP28 fold is explicit; the rare 29th source EA symbol maps
 * to index 27 for this finite control, without changing output length.
 * @param {number[][]} plain
 * @returns {(number|null)[][]}
 */
function maskedPlain28(plain) {
  return plain.map((pg, page) => pg.map((x, i) =>
    originalDoubletMask[page][i] ? null : Math.min(x, 27)));
}
/** @param {number} phase @returns {{a29:number,b29:number,a28:number,b28:number}} */
function affineKey(phase) {
  const bytes = crypto.createHash('sha256')
    .update('Magicicada-13-17-' + phase).digest();
  return {
    a29: 1 + bytes[0] % 28, b29: bytes[1] % 29,
    a28: units28[bytes[2] % units28.length], b28: bytes[3] % 28
  };
}
const key = Array.from({length: 221}, (_, i) => affineKey(i));
/**
 * @param {number[][]} plain
 * @param {string} scope
 * @param {string|null} rankKind
 * @returns {number[][]}
 */
function plant(plain, scope, rankKind) {
  let prefix = 0;
  return plain.map((pg, pi) => {
    const ciphertext = [];
    for (let i = 0; i < pg.length; i++) {
      const k = key[(scope === 'page' ? i : prefix + i) % 221];
      if (rankKind === null) {
        ciphertext.push((k.a29 * pg[i] + k.b29) % 29);
      } else if (i === 0) {
        ciphertext.push(0);
      } else if (originalDoubletMask[pi][i]) {
        ciphertext.push(ciphertext[i - 1]);
      } else {
        const code = Math.min(pg[i], 27);
        const rank = (k.a28 * code + k.b28) % 28;
        const last = ciphertext[i - 1];
        ciphertext.push(rankKind === 'sorted'
          ? rank + Number(rank >= last) : (last + rank + 1) % 29);
      }
    }
    prefix += pg.length;
    return ciphertext;
  });
}
const reference = gp(read('resources/control/shakespeare_first300k.txt'))
  .slice(1500, 1500 + 12956);
assert.equal(reference.length, 12956);
const refPages = splitPages(reference);
for (const scope of scopes) {
  const target29 = phaseEquality(refPages, 221, scope, 29);
  const coded29 = phaseEquality(plant(refPages, scope, null), 221, scope, 29);
  assert.deepEqual(coded29, target29, 'full GP29 hidden affine key must cancel');
  for (const kind of rankTypes) {
    const planted = plant(refPages, scope, kind);
    const recovered = derank(planted, kind);
    const target = maskedPlain28(refPages);
    const transformed28 = phaseEquality(recovered, 221, scope, 28);
    const reference28 = phaseEquality(target, 221, scope, 28);
    assert.deepEqual(transformed28, reference28,
      'hidden 221-cycle GP28 key + no-repeat encoder must cancel');
    assert.deepEqual(originalDoubletMask,
      planted.map((pg) => pg.map((v, i) => i === 0 || v === pg[i-1])),
      'positive plant must reproduce all original 86 doublets');
  }
}
const originals = [];
for (const period of periods) {
  for (const scope of scopes) {
    const direct = phaseEquality(sourcePages, period, scope, 29);
    originals.push({period, scope, family: 'GP29', ...direct});
    for (const kind of rankTypes) {
      originals.push({
        period, scope, family: kind + '-rank28',
        ...phaseEquality(originalRanks[kind], period, scope, 28)
      });
    }
  }
}
assert.deepEqual(
  originals.find((x) => x.period === 221 && x.scope === 'continuous' &&
    x.family === 'GP29'),
  {period: 221, scope: 'continuous', family: 'GP29',
    same: 12989, pairs: 373317, rate: 12989 / 373317});
assert.deepEqual(
  originals.find((x) => x.period === 221 && x.scope === 'continuous' &&
    x.family === 'cyclic-rank28'),
  {period: 221, scope: 'continuous', family: 'cyclic-rank28',
    same: 13206, pairs: 365223, rate: 13206 / 365223});
const controlFiles = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const controls = controlFiles.map(([name, file]) => [name, gp(read(file))]);
const contrast = [];
for (const period of periods) {
  for (const scope of scopes) {
    for (const type of ['GP29', 'rank28']) {
      const observed = originals
        .filter((x) => x.period === period && x.scope === scope &&
          (type === 'GP29' ? x.family === 'GP29' : x.family !== 'GP29'))
        .map((x) => x.rate);
      const maxObserved = Math.max(...observed);
      for (const [name, control] of controls) {
        const scores = [];
        for (let offset = 0; offset + 12956 <= control.length; offset += 1000) {
          const window = splitPages(control.slice(offset, offset + 12956));
          const sequences = type === 'GP29' ? window : maskedPlain28(window);
          scores.push(phaseEquality(sequences, period, scope,
            type === 'GP29' ? 29 : 28).rate);
        }
        assert.ok(scores.length > 0, 'missing native-GP source control');
        scores.sort((a, b) => a - b);
        const min = scores[0];
        assert.ok(min > maxObserved,
          'source-control/native-English exclusion changed');
        contrast.push({
          period, scope, type, source: name, windows: scores.length,
          min, median: scores[Math.floor(scores.length / 2)],
          max: scores[scores.length - 1], maxObserved
        });
      }
    }
  }
}
console.log(JSON.stringify({
  premise: 'Magicicada 13/17/221 fixed phase alphabets',
  originalRunes: 12956, erasedPageStartsAndDoublets: 141,
  periods, originals, contrast, positivePlanted: 'PASS'
}, null, 2));