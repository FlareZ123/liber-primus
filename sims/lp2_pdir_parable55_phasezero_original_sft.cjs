'use strict';

/**
 * A frozen first-party PARABLE-key receiver for the historical 2016
 * wordwise pointer-direction hypothesis (#1329).
 *
 * Source: physical p57 is clear text. Removing both circumference runes
 * of each of its 20 words gives exactly 55 runes. The manuscript has 55
 * unknown rune-bearing physical pages. This tests whether those 55 runes
 * supply a *cyclic key*, phase 0, for a word-directed GP29 anti-repeat
 * inverse on the intact p0–p2 opening (first 300 of 729 runes).
 *
 * Reproduction: node sims/lp2_pdir_parable55_phasezero_original_sft.cjs
 * This is a bounded hypothesis, not a claimed historically sourced cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const sections = raw.split('%').map(s => s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''));
const runeto = new Map(corpus.runes.map((r, i) => [r, i]));
const rune = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const primes = corpus.prime;
const mod = x => (x % 29 + 29) % 29;

/** @param {string} s */
function words(s) {
  return [...s.matchAll(rune)].map(m => Array.from(m[0], g => runeto.get(g)));
}

const p57 = words(sections.at(-1));
assert.equal(p57.length, 20);
assert.equal(p57.flat().length, 95);
const interior = p57.map(w => w.slice(1, -1));
const literal = [...interior[0], ...interior.slice(1).flat()];
const proposed = [...interior.slice(1).flat(), ...interior[0]];
assert.equal(literal.length, 55);
assert.equal(proposed.length, 55);
const keyTapes = [
  ['title-first-index', literal],
  ['body-first-index', proposed],
  ['title-first-prime', literal.map(x => primes[x] % 29)],
  ['body-first-prime', proposed.map(x => primes[x] % 29)]
];

/** Physical p0–p2 source words, with original page/clause counters. */
function originalWindow() {
  const s = sections.slice(0, 3).join('');
  const limits = corpus.pages.slice(0, 3).map(p => p.indices.length);
  const matches = [...s.matchAll(rune)];
  let page = 0;
  let pointer = 0;
  let prevEnd = 0;
  let wp = 0;
  let ws = 0;
  const out = [];
  for (const match of matches) {
    const v = Array.from(match[0], ch => runeto.get(ch));
    if (s.slice(prevEnd, match.index).includes('.')) ws = 0;
    while (page < 2 && pointer >= limits.slice(0, page + 1).reduce((a, b) => a + b, 0)) {
      page++;
      wp = 0;
    }
    out.push({
      runes: v, n: v.length, w: out.length + 1, wp: ++wp, ws: ++ws,
      G: v.reduce((a, b) => a + primes[b], 0),
      R: v.reduce((a, b) => a + b, 0),
      f: v[0], l: v.at(-1),
      pf: primes[v[0]], pl: primes[v.at(-1)]
    });
    pointer += v.length;
    prevEnd = match.index + match[0].length;
  }
  assert.equal(pointer, 729);
  assert.equal(out.length, 158);
  assert.deepEqual(out.flatMap(w => w.runes), corpus.pages.slice(0, 3).flatMap(p => p.indices));
  return out;
}

const W = originalWindow();
const ciphertext = W.flatMap(w => w.runes).slice(0, 300);

/** The frozen 66 rule names in the independent pnotisdev phase30 reference. */
const rules = (
  'A_cur_n B3_cur_n B5_cur_n B7_cur_n ' +
  'A_cur_w B3_cur_w B5_cur_w B7_cur_w ' +
  'A_cur_wp B3_cur_wp B5_cur_wp B7_cur_wp ' +
  'A_cur_ws B3_cur_ws B5_cur_ws B7_cur_ws ' +
  'A_prev_n B3_prev_n B5_prev_n B7_prev_n ' +
  'A_prev_G B3_prev_G B5_prev_G B7_prev_G ' +
  'A_prev_R B3_prev_R B5_prev_R B7_prev_R ' +
  'A_prev_f B3_prev_f B5_prev_f B7_prev_f ' +
  'A_prev_l B3_prev_l B5_prev_l B7_prev_l ' +
  'A_prev_pf B3_prev_pf B5_prev_pf B7_prev_pf ' +
  'A_prev_pl B3_prev_pl B5_prev_pl B7_prev_pl ' +
  'B29_prev_G B29_prev_R ' +
  'C_cur_n C_cur_wp C_cur_ws ' +
  'C_prev_n C_prev_G C_prev_R C_prev_f C_prev_l ' +
  'D_prev_fl ' +
  'E_cur_n3 E_prev_n3 E_cur_n4 E_prev_n4 E_cur_n5 E_prev_n5 ' +
  'G4_prev GP_prev G2_cur G4_cur GP_cur'
).trim().split(/\s+/);
assert.equal(rules.length, 66);

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

/** @param {string} name @param {number} i */
function value(name, i) {
  const x = W[i], prev = W[i - 1], prev2 = W[i - 2];
  if (name === 'G4_prev') return !prev ? 1 : prev.G % 4 <= 1 ? 1 : -1;
  if (name === 'GP_prev') return !prev ? 1 : isPrime(prev.G) ? 1 : -1;
  if (name === 'G2_cur') return x.G % 2 === 0 ? 1 : -1;
  if (name === 'G4_cur') return x.G % 4 <= 1 ? 1 : -1;
  if (name === 'GP_cur') return isPrime(x.G) ? 1 : -1;
  const a = name.match(/^(A|B3|B5|B7|B29)_(cur|prev)_([a-zA-Z]+)$/);
  if (a) {
    const q = (a[2] === 'prev' ? prev : x)?.[a[3]];
    if (q === undefined) return 1;
    const k = a[1] === 'A' ? 2 : Number(a[1].slice(1));
    return a[1] === 'A' ? (q % 2 === 0 ? 1 : -1) : (q % k <= Math.floor(k / 2) ? 1 : -1);
  }
  const b = name.match(/^C_(cur|prev)_([a-zA-Z]+)$/);
  if (b) {
    const y = b[1] === 'cur' ? x : prev, z = b[1] === 'cur' ? prev : prev2;
    return !z ? 1 : y[b[2]] > z[b[2]] ? 1 : -1;
  }
  if (name === 'D_prev_fl') return !prev ? 1 : prev.l > prev.f ? 1 : -1;
  if (name === 'D_prev_pfpl') return !prev ? 1 : prev.pl > prev.pf ? 1 : -1;
  const e = name.match(/^E_(cur|prev)_n([345])$/);
  if (e) {
    const q = (e[1] === 'cur' ? x : prev)?.n;
    return q === undefined ? 1 : q >= Number(e[2]) ? 1 : -1;
  }
  throw new Error('unknown rule ' + name);
}

const vectors = rules.map(name => {
  const d = [];
  for (let i = 0; i < W.length && d.length < 300; i++) {
    d.push(...Array(W[i].n).fill(value(name, i)));
  }
  return d.slice(0, 300);
});
const conventions = [];
for (let h = 0; h < 2; h++) for (let m = 0; m < 3; m++) for (let c = 0; c < 3; c++) {
  conventions.push('' + h + m + c);
}

/**
 * Exact bounded phase30 pointer beam rule under an infinitely repeated
 * 55-rune key tape. The reference engine uses a finite stream and pad;
 * this source-derived key candidate instead defines cyclic wrap explicitly.
 * For each state, maintain its frequency histogram and cumulative 2*pair
 * score. Beam width 8, merge equal next pointers by highest score.
 *
 * @param {number[]} tape
 * @param {number[]} direction
 * @param {string} conv
 * @param {number} orientation
 * @param {number} multiplier
 * @param {number} model
 */
function score(tape, direction, conv, orientation, multiplier, model, observed = ciphertext) {
  const h = Number(conv[0]), m = Number(conv[1]), cmp = Number(conv[2]);
  const ds = [], mvs = [], pvs = [];
  let pos = 0, old = 0, lastBack = -1;
  for (let w = 0; w < W.length && pos < 300; w++) {
    const d = direction[pos] * (orientation ? -1 : 1);
    const move = (w === 0 ? 0 : m === 0 ? 0 : m === 1 ? old : d) + (d < 0 && h ? -1 : 0);
    for (let k = 0; k < W[w].n && pos < 300; k++, pos++) {
      const before = pos === 0 ? -1 : observed[pos - 1];
      ds.push(d);
      mvs.push(k === 0 ? move : 0);
      pvs.push(d > 0 || cmp === 0 ? before : cmp === 1 ? (k === 0 ? -1 : before) : lastBack);
      if (d < 0) lastBack = observed[pos];
    }
    old = d;
  }
  const len = tape.length;
  let states = [{ j: 1100, s: 0, counts: new Uint16Array(29) }];
  for (let i = 0; i < 300; i++) {
    const candidate = new Map(), d = ds[i], C = observed[i], pv = pvs[i];
    for (const st of states) {
      const j = st.j + mvs[i];
      const k0 = mod(tape[modKey(j, len)] * multiplier);
      const k1 = mod(tape[modKey(j + d, len)] * multiplier);
      const k2 = mod(tape[modKey(j + 2 * d, len)] * multiplier);
      const p0 = mod(C - k0);
      const options = [[p0, j + (model === 1 && pv === C ? 2 : 1) * d]];
      if (pv >= 0) {
        const p1 = mod(C - k1), p2 = mod(C - k2);
        if (model === 0) {
          if (mod(p1 + k0) === pv) options.push([p1, j + 2 * d]);
          if (mod(p2 + k0) === pv && mod(p2 + k1) === pv) options.push([p2, j + 3 * d]);
        } else if (mod(p2 + k0) === pv) {
          options.push([p2, j + 3 * d]);
        }
      }
      for (const [p, next] of options) {
        const updated = st.s + 2 * st.counts[p];
        const previous = candidate.get(next);
        if (!previous || updated > previous.s) {
          const counts = st.counts.slice();
          counts[p]++;
          candidate.set(next, { j: next, s: updated, counts });
        }
      }
    }
    states = [...candidate.values()].sort((a, b) => b.s - a.s).slice(0, 8);
    assert(states.length);
  }
  return 29 * Math.max(...states.map(s => s.s)) / (300 * 299);
}
function modKey(n, k) {
  return (n % k + k) % k;
}


/** Source-native planted positive, disjoint from all unknown original LP2 pages. */
const reference = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const sample = reference.split('### 3')[1].split('### 4')[0].toUpperCase().replace(/[^A-Z]/g, '');
const latin = new Map(corpus.translit.map((name, i) => [name, i]));
const alias = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
const known = [];
for (let i = 0; i < sample.length;) {
  const digraph = sample.slice(i, i + 2);
  if (latin.has(digraph)) {
    known.push(latin.get(digraph));
    i += 2;
  } else {
    const letter = alias[sample[i]] || sample[i];
    if (latin.has(letter)) known.push(latin.get(letter));
    i++;
  }
}
const plantedPlain = known.slice(0, 300);
assert.equal(plantedPlain.length, 300);
const planted = [];
const sourceDirections = vectors[rules.indexOf('A_cur_n')];
let plantPointer = 1100;
for (let i = 0; i < 300; i++) {
  planted.push(mod(plantedPlain[i] + literal[modKey(plantPointer, literal.length)]));
  plantPointer += sourceDirections[i];
}
const expectedIoc = 29 * plantedPlain.reduce((counts, rune) => {
  counts[rune]++;
  return counts;
}, Array(29).fill(0)).reduce((sum, n) => sum + n * (n - 1), 0) / (300 * 299);
const plantedRecovery = score(literal, sourceDirections, '000', 0, 1, 0, planted);
const wrongKeyRecovery = score(literal.toReversed(), sourceDirections, '000', 0, 1, 0, planted);
assert(expectedIoc > 1.40);
assert(plantedRecovery >= 1.40, 'known GP-native English plant must survive beam search');
assert(wrongKeyRecovery < plantedRecovery, 'negative key control must be weaker');


/**
 * Independent source-native anti-repeat calibration. Encipher the same
 * 300 verified GP English runes under the true pointer-key skip rule.
 * Unlike the all-direct plant, this actually forces ciphertext collisions.
 */
const forcedCollisionPlant = [];
let collisionPointer = 1100, previousCipher = -1;
let collisionSkips = 0, doubleSkips = 0, maxSkipCollision = 0;
for (let i = 0; i < plantedPlain.length; i++) {
  const delta = sourceDirections[i], plain = plantedPlain[i];
  let tries = 0, emitted = -1;
  while (tries <= 2) {
    emitted = mod(plain + literal[modKey(collisionPointer, literal.length)]);
    if (emitted !== previousCipher) break;
    if (tries === 2) throw new Error('source pad repeated over three forced skip positions');
    tries++;
    collisionPointer += delta;
  }
  forcedCollisionPlant.push(emitted);
  previousCipher = emitted;
  collisionPointer += delta;
  collisionSkips += tries;
  if (tries === 2) doubleSkips++;
  maxSkipCollision = Math.max(maxSkipCollision, tries);
}
assert(collisionSkips >= 4, 'source pad + native English must force multiple skip events');
const collisionRecoveredIoc = score(literal, sourceDirections, '000', 0, 1, 0, forcedCollisionPlant);
assert(collisionRecoveredIoc >= 1.40,
  'real source-pad collision-skipping English positive must survive beam8 first300 screen');

const best = [];
let max = 0, above135 = 0, above140 = 0, evaluated = 0;
for (let r = 0; r < rules.length; r++) {
  for (const conv of conventions) {
    for (let orientation = 0; orientation < 2; orientation++) {
      for (const [key, tape] of keyTapes) {
        for (const mult of [1, 28]) {
          for (let model = 0; model < 2; model++) {
            const ioc = score(tape, vectors[r], conv, orientation, mult, model);
            evaluated++;
            max = Math.max(max, ioc);
            if (ioc >= 1.35) above135++;
            if (ioc >= 1.4) above140++;
            if (best.length < 10 || ioc > best.at(-1).ioc) {
              best.push({ ioc, rule: rules[r], conv, orientation, key, mult, model });
              best.sort((a, b) => b.ioc - a.ioc);
              best.length = Math.min(best.length, 10);
            }
          }
        }
      }
    }
  }
}
assert.equal(evaluated, 38016);
assert.equal(above135, 0);
assert.equal(above140, 0);
assert(Math.abs(max - 1.2013823857302117) < 1e-10);
console.log(JSON.stringify({
  source: {
    p57_inner_runes: literal.length,
    physical_pages_0_to_2_runes: 729,
    printed_words: W.length,
    tested_prefix: 300,
    key_phase: 0,
    cyclic_key_repeated: true,
    pointer_start: 1100,
    beam: 8,
    k_clock: 'forward/backward by printed word'
  },
  evaluated, max_ioc: max, above135, above140, top: best,
  source_native_plant: { expectedIoc, plantedRecovery, wrongKeyRecovery,
    collisionSkips, doubleSkips, maxSkipCollision, collisionRecoveredIoc },
  conclusion: 'No original p0 prefix hit in this fixed p57 55-rune cyclic-key and word-direction family'
}, null, 2));
