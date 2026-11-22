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
/** GP28 repeat-transparent output: D_i=C_i-C_(i-1), with D=0<->EA=28. */
const mod28 = (x) => ((x % 28) + 28) % 28;
const exp15 = [], log15 = new Array(29).fill(-1);
for (let i = 0, v = 1; i < 28; i++, v = v * 15 % 29) {
  assert.equal(log15[v], -1);
  exp15.push(v);
  log15[v] = i;
}
assert.equal(new Set(exp15).size, 28);
/**
 * @param {number[][]} groups @param {number[]} key @param {-1|1} sign
 * @param {boolean} reset @returns {number[]}
 */
function stepDecode(groups, key, sign, reset) {
  const out = [];
  let previous = 0, index = 0;
  for (const group of groups) {
    if (reset) index = 0;
    for (const c of group) {
      const delta = mod(c - previous);
      out.push(delta === 0 ? 28 : mod28(log15[delta] + sign * key[index % 256]));
      previous = c;
      index++;
    }
  }
  return out;
}
/**
 * @param {number[]} plain @param {number[]} key @param {-1|1} sign
 * @param {boolean} reset @returns {number[]}
 */
function stepEncode(plain, key, sign, reset) {
  const out = [];
  let previous = 0, index = 0, at = 0;
  for (const group of pages) {
    if (reset) index = 0;
    for (const unused of group.indices) {
      const p = plain[at++];
      const delta = p === 28 ? 0 : exp15[mod28(p - sign * key[index % 256])];
      previous = mod(previous + delta);
      out.push(previous);
      index++;
    }
  }
  return out;
}
const stepCandidates = [];
for (const [projection, sourceValues] of Object.entries(projections))
  for (const phase of [0, 1])
    for (const reset of [false, true])
      for (const keyMap of ['ordinal', 'log15'])
        for (const sign of [-1, 1]) {
          const rawKey = sourceValues.slice(phase, phase + 256);
          const key = rawKey.map((v) =>
            keyMap === 'ordinal' ? v % 28 : (v === 0 ? 0 : log15[v]));
          const plain = stepDecode(pages.map((p) => p.indices), key, sign, reset);
          assert.equal(plain.filter((v) => v === 28).length, 86);
          assert.deepEqual(stepEncode(plain, key, sign, reset), ciphertext);
          stepCandidates.push({projection, phase, reset, keyMap, sign,
            train: ioc(plain.slice(0, 6761)),
            hold: ioc(plain.slice(6761)),
            full: ioc(plain),
            prefix: plain.slice(0, 70).map((v) => corpus.translit[v]).join('')});
        }
assert.equal(stepCandidates.length, 64);
stepCandidates.sort((a, b) => b.train - a.train);
const stepBest = stepCandidates[0];
const stepRawKey = projections[stepBest.projection].slice(stepBest.phase, stepBest.phase + 256);
const stepKey = stepRawKey.map((v) =>
  stepBest.keyMap === 'ordinal' ? v % 28 : (v === 0 ? 0 : log15[v]));
const stepPlanted = stepEncode(plant, stepKey, stepBest.sign, stepBest.reset);
assert.deepEqual(stepDecode(pages.map((p, i) => {
  const start = pages.slice(0, i).reduce((sum, v) => sum + v.indices.length, 0);
  return stepPlanted.slice(start, start + p.indices.length);
}), stepKey, stepBest.sign, stepBest.reset), plant);

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
  stepTransport: { kind: 'GP28 repeat-transparent; 86 observed doublets preserved',
    variants: stepCandidates.length, originalBest: stepBest,
    bestHold: stepBest.hold, exactNativeRecovered: plant.length,
    nativeIoc: ioc(plant), examples: stepCandidates.slice(0, 4) },
  interpretation: 'The exact source-state recurrence and polynomial output hypotheses are conjectural. Additive inverses reencrypt trivially for any key; this test finds no supported plaintext.'
}, null, 2));
