'use strict';
/**
 * Original-source GF(29^2) 256-event polynomial-output gate.
 * The source-field and event-clock proposal was previously frozen in
 * gf29s2_event_state_final_state_gate.cjs. This tests its still-open
 * non-linear P(s), P'(s) trace/norm output keys against original LP2.
 *
 * Usage: node sims/gf29s2_event_poly_output_original_sft.cjs
 * Requires Node 22, no packages, no file mutations, no guessing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {any} */
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json').bytes;
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const pages = corpus.pages.filter((p) => p.page < 56);
const ciphertext = pages.flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(grid.length, 256);

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @typedef {[number, number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
const mul = (a, b) => [
  mod(a[0] * b[0] + 8 * a[1] * b[1]),
  mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
];
/** @param {number[]} coeff @param {Field} x @returns {Field} */
function poly(coeff, x) {
  let y = [0, 0];
  for (let i = 0; i < coeff.length; i++) {
    y = mul(y, x);
    y[0] = mod(y[0] + coeff[i]);
  }
  return y;
}
/** @param {Field} x @returns {number} */
const trace = (x) => mod(2 * x[0] + 3 * x[1]);
/** @param {Field} x @returns {number} */
const norm = (x) => mod(x[0] ** 2 + 3 * x[0] * x[1] - 8 * x[1] ** 2);

/** Reconstruct every original ink event in exact visual order. */
function sourceEvents() {
  const gp = new Map(corpus.runes.map((r, i) => [r, i]));
  const events = [];
  for (const pg of ink.pages) {
    assert.equal(corpus.pages[pg.page].indices.length, pg.rune_count);
    for (const [order, punctuation] of (pg.large_punctuation || []).entries())
      if (punctuation[1] === 13)
        events.push({ page: pg.page, pos: punctuation[0], kind: 0, order, e: 0 });
    for (const span of (pg.red_spans || []))
      Array.from(span.runes).forEach((rune, j) => {
        const g = gp.get(rune);
        assert.notEqual(g, undefined);
        assert.equal(corpus.pages[pg.page].indices[span.start + j], g);
        events.push({ page: pg.page, pos: span.start + j,
          kind: 1, order: j, e: mod(g + 1 - 13) });
      });
  }
  events.sort((a, b) => a.page - b.page || a.pos - b.pos ||
    a.kind - b.kind || a.order - b.order);
  assert.equal(events.length, 256);
  assert.equal(events.filter((e) => e.kind).length, 225);
  assert.equal(events.filter((e) => !e.kind).length, 31);
  assert.deepEqual(events.filter((e) => e.page === 7 && e.pos === 194)
    .map((e) => e.kind), [0, 0, 1]);
  return events;
}
const source = sourceEvents();
const Z = [23, 27];
const seed = [4, 24];
const coeff = grid.map(mod);
const derivative = coeff.slice(0, -1).map((v, i) => mod(v * (coeff.length - 1 - i)));
assert.deepEqual(poly(coeff, Z), [0, 0]);
const states = [seed];
for (const event of source) {
  const next = mul(Z, states.at(-1));
  states.push([mod(next[0] + event.e), next[1]]);
}
assert.deepEqual(states.at(-1), [0, 21]);
assert.equal(new Set(states.map((x) => x.join(','))).size, 225);

const projections = {
  'P-trace': states.map((s) => trace(poly(coeff, s))),
  'P-norm': states.map((s) => norm(poly(coeff, s))),
  'Pprime-trace': states.map((s) => trace(poly(derivative, s))),
  'Pprime-norm': states.map((s) => norm(poly(derivative, s)))
};
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const g of a) counts[g]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/**
 * @param {number[][]} grouped
 * @param {number[]} key
 * @param {-1 | 1} sign
 * @param {boolean} reset
 * @returns {number[]}
 */
function inverse(grouped, key, sign, reset) {
  let index = 0;
  const result = [];
  for (const group of grouped) {
    if (reset) index = 0;
    for (const c of group) result.push(mod(c + sign * key[index++ % 256]));
  }
  return result;
}
/** @param {string} txt @returns {number[]} */
function nativeGP(txt) {
  const alphabet = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (let word of txt.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG');
    const glyphs = [];
    for (let i = 0; i < word.length;) {
      const token = alphabet.find((x) => word.startsWith(x.s, i));
      if (!token) { glyphs.length = 0; break; }
      glyphs.push(token.i);
      i += token.s.length;
    }
    out.push(...glyphs);
  }
  return out;
}
const english = nativeGP(fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'), 'utf8'));
assert(english.length > 150000);
const plant = english.slice(english.length - ciphertext.length);
assert.equal(plant.length, ciphertext.length);
const candidates = [];
for (const [projection, sourceValues] of Object.entries(projections))
  for (const phase of [0, 1])
    for (const reset of [false, true])
      for (const sign of [-1, 1]) {
        const key = sourceValues.slice(phase, phase + 256);
        assert.equal(key.length, 256);
        const plain = inverse(pages.map((p) => p.indices), key, sign, reset);
        let index = 0, i = 0;
        const roundtrip = [];
        for (const page of pages) {
          if (reset) index = 0;
          for (const unused of page.indices)
            roundtrip.push(mod(plain[i++] - sign * key[index++ % 256]));
        }
        assert.deepEqual(roundtrip, ciphertext);
        candidates.push({
          projection, phase, reset, sign,
          train: ioc(plain.slice(0, 6761)),
          hold: ioc(plain.slice(6761)), entire: ioc(plain),
          prefix: plain.slice(0, 45).map((x) => corpus.translit[x]).join('')
        });
      }
assert.equal(candidates.length, 32);
candidates.sort((a, b) => b.train - a.train);
const best = candidates[0];
const winner = projections[best.projection].slice(best.phase, best.phase + 256);
const plantGroups = [], originalGroups = [];
let at = 0, index = 0;
for (const page of pages) {
  if (best.reset) index = 0;
  const out = [];
  for (let j = 0; j < page.indices.length; j++)
    out.push(mod(plant[at++] - best.sign * winner[index++ % 256]));
  plantGroups.push(out);
  originalGroups.push(page.indices);
}
const recovered = inverse(plantGroups, winner, best.sign, best.reset);
assert.deepEqual(recovered, plant);
console.log(JSON.stringify({
  status: 'Scoped negative: no original unknown GP29 plaintext identified',
  input: { runes: ciphertext.length, inkEvents: 256, redRunes: 225,
    thirteenDotMarks: 31, uniqueFieldStates: 225 },
  source: { z: Z, seed, final: states.at(-1),
    fieldPolynomial: 'u^2=3u+8',
    polynomial: 'printed base60 grid, descending F29 coefficients' },
  design: { projections: Object.keys(projections), phases: [0, 1],
    clocks: ['book', 'page'], signs: [-1, 1], candidates: 32 },
  original: { ioc: ioc(ciphertext), best,
    nativeControlIoc: ioc(plant), plantRecovered: recovered.length,
    examples: candidates.slice(0, 6) },
  interpretation: 'The exact source-state recurrence and polynomial output hypotheses are conjectural. Additive inverses reencrypt trivially for any key; this test finds no supported plaintext.'
}, null, 2));
