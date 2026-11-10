'use strict';

/**
 * Source-conditioned LP2 test of the 180 omitted primes in Cicada's 2013
 * telnet output, with optional mixing against the 180 known LP2 closing runes.
 *
 * A synthetic English control is generated independently of unknown LP2 text.
 * All real-ciphertext parameters are frozen by the finite, declared family.
 * No plaintext, key or cipher mechanism is asserted.
 *
 * Run: node sims/telnet2013_missing_primes_holdout.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(
  ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');

const pages = corpus.pages.filter(p => p.page <= 55 &&
  p.status === 'unsolved' && p.indices.length).map(p => p.indices);
const closing = corpus.pages.filter(p => p.page >= 56).flatMap(p => p.indices);
const MOD = 29;

/** @param {number} a @param {number} n */
function mod(a, n) { return (a % n + n) % n; }

/** @param {number} lower @param {number} upper */
function primesInRange(lower, upper) {
  const out = [];
  for (let n = lower; n < upper; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) {
      prime = false;
      break;
    }
    if (prime) out.push(n);
  }
  return out;
}

const missing = primesInRange(73, 1229);
assert.equal(missing.length, 180);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);
assert.equal(closing.length, 180);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, 12956);
const keyFamilies = [
  ['omitted-primes', missing.map(p => mod(p, MOD))],
  ['primes-plus-known-closing', missing.map((p, i) => mod(p + closing[i], MOD))],
  ['primes-minus-known-closing', missing.map((p, i) => mod(p - closing[i], MOD))]
];

/** @param {number[]} xs @param {number} alphabet */
function ioc(xs, alphabet) {
  const counts = new Uint32Array(alphabet);
  for (const value of xs) if (value >= 0) counts[value]++;
  const n = counts.reduce((a, x) => a + x, 0);
  return counts.reduce((a, x) => a + x * (x - 1), 0) / (n * (n - 1));
}

/** @param {number[]} stream @param {'direct'|'rank-sorted'|'rank-cyclic'} layer */
function decodeRanks(stream, layer) {
  if (layer === 'direct') return stream.slice();
  const ranks = [-1];
  for (let i = 1; i < stream.length; i++) {
    const current = stream[i], prev = stream[i - 1];
    ranks.push(current === prev ? -1 : layer === 'rank-sorted'
      ? current - Number(current > prev)
      : mod(current - prev, MOD) - 1);
  }
  return ranks;
}

/**
 * @param {number[][]} ciphertext
 * @param {'direct'|'rank-sorted'|'rank-cyclic'} layer
 * @param {string} familyName
 * @param {number[]} key
 * @param {'page'|'continuous'} scope
 * @param {-1|1} sign
 * @param {number} phase
 */
function evaluate(ciphertext, layer, familyName, key, scope, sign, phase) {
  const alphabet = layer === 'direct' ? 29 : 28;
  const train = [], heldout = [];
  let global = 0, previous = -1;
  for (let page = 0; page < ciphertext.length; page++) {
    const glyphs = ciphertext[page];
    const ranks = decodeRanks(scope === 'continuous' && previous >= 0
      ? [previous, ...glyphs] : glyphs, layer);
    const skipFirst = scope === 'continuous' && previous >= 0 ? 1 : 0;
    for (let j = 0; j < glyphs.length; j++, global++) {
      const rank = ranks[j + skipFirst];
      const offset = scope === 'page' ? j : global;
      const v = rank < 0 ? -1 : mod(rank + sign * key[(offset + phase) % key.length],
        alphabet);
      (page % 2 === 0 ? train : heldout).push(v);
    }
    previous = glyphs.at(-1);
  }
  return {layer, family:familyName, scope, sign, phase,
    trainIoC: ioc(train, alphabet), heldoutIoC: ioc(heldout, alphabet)};
}

/**
 * @param {number[][]} ciphertext
 * @param {'direct'|'rank-sorted'|'rank-cyclic'} layer
 */
function scan(ciphertext, layer) {
  const scores = [];
  for (const [family, key] of keyFamilies)
    for (const scope of /** @type {const} */ (['page','continuous']))
      for (const sign of /** @type {const} */ ([-1,1]))
        for (let phase = 0; phase < 180; phase++)
          scores.push(evaluate(ciphertext, layer, family, key, scope, sign, phase));
  scores.sort((a, b) => b.trainIoC - a.trainIoC);
  return {n:scores.length, selectedByTraining:scores[0],
    topThree:scores.slice(0,3)};
}

/** @param {string} english @returns {number[]} */
function gp(english) {
  const tokens = corpus.translit.map((token, index) => [token, index])
    .sort((a,b) => b[0].length - a[0].length);
  const out = [];
  for (const raw of english.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replaceAll('QU','CW').replaceAll('V','U')
      .replaceAll('K','C').replaceAll('Z','S');
    for (let i = 0; i < word.length;) {
      const next = tokens.find(([token]) => word.startsWith(token, i));
      assert.ok(next, 'GP token unavailable at ' + word.slice(i));
      out.push(next[1]);
      i += next[0].length;
    }
  }
  return out;
}

/** @param {number} seed @returns {()=>number} */
function random32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * @param {number[]} language
 * @param {'direct'|'rank-sorted'|'rank-cyclic'} layer
 * @param {number[]} key
 * @param {number} phase
 */
function plant(language, layer, key, phase) {
  const rand = random32(0x33011337);
  const alphabet = layer === 'direct' ? 29 : 28;
  const output = [];
  let pos = 0, changed = 0;
  for (const page of pages) {
    const glyphs = [];
    for (let j = 0; j < page.length; j++, pos++) {
      const p = language[pos] % alphabet;
      const encoded = layer === 'direct'
        ? mod(p - key[(j + phase) % 180], alphabet)
        : mod(p - key[(j + phase) % 180], alphabet);
      let c;
      if (layer === 'direct') {
        c = encoded;
        if (glyphs.length && glyphs.at(-1) === c && rand() < 0.81) {
          c = mod(c + 1 + Math.floor(rand() * 28), 29);
          changed++;
        }
      } else {
        // Exact predecessor-exclusion forward transform. The first rune is
        // a literal seed; its source value cannot be recovered by rank inverse.
        c = j === 0 ? 0 : encoded + Number(encoded >= glyphs[j-1]);
      }
      glyphs.push(c);
    }
    output.push(glyphs);
  }
  return {pages:output, changed};
}

function run() {
  const original = Object.fromEntries(
    (/** @type {const} */ (['direct','rank-sorted','rank-cyclic']))
      .map(layer => [layer, scan(pages, layer)]));
  const source = gp(text);
  assert.ok(source.length >= 12956);
  const language = source.slice(0,12956);
  const planted = {};
  for (const layer of /** @type {const} */ (['direct','rank-sorted'])) {
    const encrypted = plant(language, layer, keyFamilies[0][1], 37);
    const ranked = scan(encrypted.pages, layer);
    assert.equal(ranked.selectedByTraining.family, 'omitted-primes');
    assert.equal(ranked.selectedByTraining.scope, 'page');
    assert.equal(ranked.selectedByTraining.sign, 1);
    assert.equal(ranked.selectedByTraining.phase, 37);
    assert.ok(ranked.selectedByTraining.heldoutIoC > 0.045);
    planted[layer] = {changed:encrypted.changed, ...ranked.selectedByTraining};
  }
  const sourceIoC = ioc(language,29);
  assert.ok(sourceIoC > 0.045);
  const actualBest = original.direct.selectedByTraining;
  assert.ok(actualBest.heldoutIoC < 0.04);
  return {
    source: '2013 telnet prime list: 180 consecutive omitted primes, 73 through 1223',
    closingLength:closing.length,
    unbrokenSourceLength:missing.length,
    unsolvedPages:pages.length,
    unsolvedRunes:pages.flat().length,
    originalCipherIoC:ioc(pages.flat(),29),
    split:'even-numbered rune-bearing pages train, odd-numbered pages held out',
    families:keyFamilies.map(([label])=>label),
    search:'3 key sources * 2 reset scopes * 2 signs * 180 phases per decoder',
    original,
    planted:{sourceIoC, ...planted},
    outcome:'No original LP2 plaintext recovered from this finite key family'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports = {mod,primesInRange,decodeRanks,ioc,evaluate,scan,gp,plant,run};
