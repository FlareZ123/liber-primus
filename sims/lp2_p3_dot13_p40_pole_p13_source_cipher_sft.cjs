'use strict';

/**
 * Original LP2 source-indexed H-pole/P-dot13 cipher:
 * p3 red primitive GF29² supplies all 840 key phases; p40 heading supplies
 * fixed H8/primitive root15; original red 13-dot marks select exponent13;
 * p39/p40 T6 map is 8+15^13*(C[j-6]-8).
 *
 * Exact bijective per-rune cipher, word reversal, original p40-53 test.
 * Windows 11 / Node.js 22; no network or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const m29 = x => ((x % 29) + 29) % 29;
const m27 = x => ((x % 27) + 27) % 27;
const src = read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0, 55);
const idx = new Map(gp.runes.map((r, i) => [r, i]));
const words = [];
let runes = [], pages = [];
for (let page = 0; page < src.length; page++) {
  for (const c of src[page].replace(/[\/\s]/g, '')) {
    if (idx.has(c)) {
      runes.push(idx.get(c));
      pages.push(page < 50 ? page : page + 1);
    } else if (runes.length) {
      words.push({runes, page: pages[0]});
      runes = []; pages = [];
    }
  }
}
if (runes.length) words.push({runes, page: pages[0]});
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(x => x.runes),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const original = words.filter(w => w.page >= 40 && w.page <= 53);
const ciphertext = original.slice(2).map(w => w.runes);
assert.equal(original.length, 669);
assert.equal(ciphertext.length, 667);
assert.equal(ciphertext.flat().length, 3000);
const heading = gp.pages.find(p => p.page === 40).indices.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.equal(heading.reduce((n, i) => n + gp.prime[i], 0), 435);
assert.equal(435 / 29, 15);
const h = heading.at(-1);
assert.equal(h, 8);
assert.deepEqual(gp.pages.find(p => p.page === 3).indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(gp.pages.find(p => p.page === 39).indices.slice(119, 122), [27, 5, 15]);

const powers = [1];
for (let i = 1; i < 28; i++) powers.push(m29(powers.at(-1) * 15));
assert.equal(powers[13], 27);
const log = Array(29).fill(-1);
for (let i = 0; i < 28; i++) log[powers[i]] = i;
const ordinaryPlain = Array.from({length: 29}, (_, i) => i).filter(i => i !== 8 && i !== 13);
const ordinaryExp = Array.from({length: 28}, (_, i) => i).filter(i => i !== 13);
assert.equal(ordinaryPlain.length, 27);
assert.equal(ordinaryExp.length, 27);

// Primitive p3 quadratic: u²=3u+8, trace(a+bu)=2a+3b.
const trace = [];
let state = [1, 0];
for (let i = 0; i < 840; i++) {
  trace.push(m29(2 * state[0] + 3 * state[1]));
  const [a, b] = state;
  state = [m29(8 * b), m29(a + 3 * b)];
  if (i < 839) assert.notDeepEqual(state, [1, 0]);
}
assert.deepEqual(state, [1, 0]);

/**
 * @param {number} plain GP29
 * @param {number} key 0..26
 * @returns {number} exponent, or -1 for the pole letter H.
 */
function exponent(plain, key) {
  if (plain === 8) return -1;
  if (plain === 13) return 13;
  const i = ordinaryPlain.indexOf(plain);
  assert(i >= 0);
  return ordinaryExp[(i + key) % 27];
}
/** @param {number} power exponent @param {number} key */
function plainOf(power, key) {
  if (power === -1) return 8;
  if (power === 13) return 13;
  const i = ordinaryExp.indexOf(power);
  assert(i >= 0);
  return ordinaryPlain[m27(i - key)];
}

/** @param {number[][]} input @param {number} phase
 * @param {boolean} inverse */
function transform(input, phase, inverse) {
  let previous = h;
  let clock = 0;
  const out = [];
  for (const word of input) {
    const v = [];
    for (let j = 0; j < word.length; j++) {
      const anchor = j >= 6 ? (inverse ? word[j - 6] : v[j - 6]) : previous;
      const base = anchor === h ? (previous === h ? 9 : previous) : anchor;
      const key = trace[(phase + clock) % 840] % 27;
      if (inverse) {
        const c = word[j];
        let plain;
        if (c === h) plain = 8;
        else {
          const inv = powers[(28 - log[m29(base - h)]) % 28];
          const ratio = m29((c - h) * inv);
          const e = log[ratio];
          assert(e >= 0);
          plain = plainOf(e, key);
        }
        v.push(plain);
        previous = c;
      } else {
        const p = word[j], e = exponent(p, key);
        const c = e < 0 ? h : m29(h + powers[e] * (base - h));
        v.push(c);
        previous = c;
      }
      clock++;
    }
    out.push(v);
  }
  return out;
}

const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
/** @param {string} roman @returns {number[]} */
function nativeGP(roman) {
  const s = roman.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(x => s.startsWith(x.s, i));
      assert(t);
      out.push(t.i); i += t.s.length;
    }
  }
  return out;
}
const dict = new Set();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (m) dict.add(nativeGP(m[1]).join(','));
}
let maximum = 0, longPhases = [];
for (let phase = 0; phase < 840; phase++) {
  const decoded = transform(ciphertext, phase, true).map(w => w.slice().reverse());
  let matched = 0;
  const long = [];
  for (let i = 0; i < decoded.length; i++) {
    const w = decoded[i];
    if (!dict.has(w.join(','))) continue;
    matched++;
    if (w.length >= 6) long.push({wordIndex: i, plaintext: w.map(x => gp.translit[x]).join('')});
  }
  maximum = Math.max(maximum, matched);
  if (long.length) longPhases.push({phase, matched, long});
}
assert.equal(maximum, 54);
assert.deepEqual(longPhases, [{phase: 221, matched: 37,
  long: [{wordIndex: 53, plaintext: 'FLITTNG'}]}]);
assert.deepEqual(transform(transform(ciphertext, 221, true), 221, false), ciphertext);

// Positive: source-native English complete words, matched exactly to the
// original 667 word lengths; encode reversed and recover without loss.
const bins = new Map();
for (const roman of read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g) || []) {
  const v = nativeGP(roman);
  if (!bins.has(v.length)) bins.set(v.length, []);
  bins.get(v.length).push(v);
}
let seed = 0x33011308;
const rng = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
const plant = ciphertext.map(w => {
  const choices = bins.get(w.length);
  assert(choices?.length);
  return choices[rng() % choices.length].slice().reverse();
});
const encoded = transform(plant, 391, false);
assert.deepEqual(transform(encoded, 391, true), plant);
assert.equal(encoded.flat().length, 3000);

console.log(JSON.stringify({originalRuneCount: 3000, originalWords: 667,
  p3FieldOrder: 840, selectedGenerator: 15, selectedExponent: 13,
  poleH: 8, fixedBeaconP: 13,
  phasesTested: 840, maxDictionaryWords: maximum,
  phasesWithLongDictionaryWord: longPhases,
  exactOriginalReplay: true, matchedNativePositive: true}, null, 2));
console.log('PASS: source-marked H-pole/P-dot13 and 27-state field clock are fully bijective; original plaintext remains unrecovered.');
