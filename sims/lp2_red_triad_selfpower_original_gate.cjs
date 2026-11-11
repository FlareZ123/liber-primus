'use strict';

/**
 * Original-input, source-fixed field self-power inverse on all unsolved LP2.
 * The only two red three-rune marks, p3 [13,23,2] and p39 [27,5,15],
 * select u^2=3u+8 and the retrospective second generator v=u^(23^2).
 * Test direct reversible GP29 addition with v^t, source P(v^t) and the
 * exact grid quotient Q(v^t); do not fit a secret exponent, key or offset.
 * The three source-motivated starting phases are 0, 120, 360.
 *
 * node sims/lp2_red_triad_selfpower_original_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} f @returns {any} */
function load(f) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
/** @param {number} v */
const mod = v => (v % 29 + 29) % 29;
/** @typedef {[number,number]} F */

/** @param {F} a @param {F} b @returns {F} */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}
/** @param {F} a @param {number} exponent @returns {F} */
function power(a, exponent) {
  /** @type {F} */
  let result = [1, 0];
  for (; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) result = mul(result, a);
    a = mul(a, a);
  }
  return result;
}
/** @param {number[]} coefficients @param {F} x @returns {F} */
function evaluate(coefficients, x) {
  /** @type {F} */
  let value = [0, 0];
  for (const k of coefficients) {
    value = mul(value, x);
    value[0] = mod(value[0] + k);
  }
  return value;
}
/**
 * Source polynomial divides by X-24; retain its leading zero.
 * @param {number[]} c
 * @returns {number[]}
 */
function divideBy24(c) {
  const q = [c[0]];
  for (let i = 1; i < c.length - 1; i++)
    q.push(mod(c[i] + 24 * q[q.length - 1]));
  assert.equal(mod(c[c.length - 1] + 24 * q[q.length - 1]), 0);
  return q;
}
/** @param {number[]} symbols */
function ioc(symbols) {
  const h = new Uint32Array(29);
  for (const c of symbols) h[c]++;
  return h.reduce((s, count) => s + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/**
 * @param {number[][]} pages
 * @param {number[]} key
 * @param {'global'|'page'} clock
 * @param {number} phase
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function decipher(pages, key, clock, phase, sign) {
  let globalOffset = 0;
  return pages.map(page => {
    const result = page.map((symbol, i) => {
      const at = ((clock === 'global' ? globalOffset : 0) + i + phase) % 840;
      return mod(symbol + sign * key[at]);
    });
    globalOffset += page.length;
    return result;
  });
}
function main() {
  const corpus = load('resources/liber-primus/lp2-corpus.json');
  const ink = load('resources/liber-primus/lp2-ink-annotations.json');
  const grid = load('resources/liber-primus/lp2-grid-256.json');
  const triads = ink.pages.flatMap(page => (page.red_spans || [])
    .filter(span => span.length === 3)
    .map(span => ({page: page.page, position: span.start,
      glyphs: [...span.runes].map(ch => corpus.runes.indexOf(ch))})));
  assert.deepEqual(triads, [
    {page: 3, position: 119, glyphs: [13, 23, 2]},
    {page: 39, position: 119, glyphs: [27, 5, 15]}
  ]);
  assert.equal(grid.bytes.length, 256);
  const pages = corpus.pages.filter(page => page.page < 56 && page.indices.length)
    .map(page => page.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.flat().length, 12956);

  const v = power([0, 1], triads[0].glyphs[1] ** 2);
  assert.deepEqual(v, [9, 4]);
  assert.deepEqual(power(v, 840), [1, 0]);
  assert.deepEqual(power(v, 817), [23, 27]);
  assert.deepEqual(power(v, 173), [17, 2]);
  /** @type {number[]} */
  const P = grid.bytes.map(mod);
  const Q = divideBy24(divideBy24(P)).map(value => mod(2 * value));
  assert.equal(Q.length, 254);
  assert.equal(Q[0], 0);
  assert.deepEqual(evaluate(P, power(v, 817)), [0, 0]);
  assert.deepEqual(evaluate(P, power(v, 173)), [0, 0]);

  /** @type {F[]} */
  const states = [];
  let state = /** @type {F} */ ([1, 0]);
  for (let t = 0; t < 840; t++) {
    states.push(state);
    state = mul(state, v);
  }
  assert.deepEqual(state, [1, 0]);

  /** @type {Record<string, (x:F)=>number>} */
  const projection = {
    a: x => x[0],
    b: x => x[1],
    trace: x => mod(2 * x[0] + 3 * x[1]),
    norm: x => mod(x[0] * x[0] + 3 * x[0] * x[1] - 8 * x[1] * x[1])
  };
  const records = [];
  let plantResult = null;
  for (const source of ['v', 'P(v)', 'Q(v)']) {
    const sourceStates = states.map(x => source === 'v' ? x :
      evaluate(source === 'P(v)' ? P : Q, x));
    for (const [projectionName, project] of Object.entries(projection)) {
      const key = sourceStates.map(project);
      for (const clock of ['global', 'page'])
        for (const phase of [0, 120, 360])
          for (const sign of /** @type {(1|-1)[]} */ ([-1, 1])) {
            const decoded = decipher(pages, key, clock, phase, sign);
            // Independently re-encrypt the complete original ciphertext.
            const recovered = decipher(decoded, key, clock, phase,
              /** @type {1|-1} */ (-sign));
            assert.deepEqual(recovered, pages);
            records.push({
              source, projection: projectionName, clock, phase, sign,
              ioc: ioc(decoded.flat())
            });
            if (source === 'Q(v)' && projectionName === 'trace' &&
                clock === 'global' && phase === 120 && sign === 1) {
              const external = fs.readFileSync(path.join(ROOT,
                'resources/control/shakespeare_first300k.txt'), 'utf8');
              const English = plaintextWords(external).flat().slice(0, 12956);
              assert.equal(English.length, 12956);
              const lengths = pages.map(page => page.length);
              let offset = 0;
              const plantedPages = lengths.map(n => {
                const part = English.slice(offset, offset + n);
                offset += n;
                return part;
              });
              const syntheticCipher = decipher(plantedPages, key, clock, phase, -1);
              const restored = decipher(syntheticCipher, key, clock, phase, 1);
              assert.deepEqual(restored, plantedPages);
              plantResult = {
                recoveredRunes: restored.flat().length,
                plaintextIoc: ioc(English),
                cipherIoc: ioc(syntheticCipher.flat())
              };
            }
          }
    }
  }
  assert.equal(records.length, 144);
  assert(plantResult && plantResult.recoveredRunes === 12956);
  const top = records.slice().sort((a, b) => b.ioc - a.ioc);
  const rawIoc = ioc(pages.flat());
  assert(Math.abs(rawIoc - 0.03447839786450569) < 1e-12);
  assert(Math.abs(top[0].ioc - 0.03454777140192099) < 1e-12);
  assert(top.every(x => x.ioc < 0.035));
  console.log(JSON.stringify({
    classification: 'Bounded source-fixed original-input negative, no unknown plaintext',
    originalRunes: 12956, originalIoc: rawIoc,
    derivedGenerator: v,
    exactGridRoots: ['v^(-23)=23+27u', 'v^173=17+2u'],
    reversibleCandidates: records.length,
    allOriginalGlyphsReencryptedExactly: true,
    topSix: top.slice(0, 6),
    minimumIoc: top[top.length - 1].ioc,
    nativeEnglishPlant: plantResult,
    scope: 'Only direct mod29 additive projections of v^t, P(v^t), Q(v^t), source phases 0/120/360, book/page clocks, both signs; no feedback or non-GP register.'
  }, null, 2));
}
if (require.main === module) main();
