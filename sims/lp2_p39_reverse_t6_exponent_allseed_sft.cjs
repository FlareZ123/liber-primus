'use strict';

/**
 * All 841 secret seeds of the source-marked p39 double-root recurrence,
 * inside a reversible word-reversed T6 and zero-step GP29 cipher.
 * Exact original p40-p53 black body; Node.js 22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const map = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = n => ((n % 29) + 29) % 29;
const mod28 = n => ((n % 28) + 28) % 28;
const words = [];
let v = [], page = [];
for (const [i, part] of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0, 55).entries()) {
  for (const g of part.replace(/[\/\s]/g, '')) {
    if (map.has(g)) {
      v.push(map.get(g));
      page.push(i < 50 ? i : i + 1);
    } else if (v.length) {
      words.push({v, page: page[0]});
      v = [];
      page = [];
    }
  }
}
if (v.length) words.push({v, page: page[0]});
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(x => x.v),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const red = gp.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
const phi = gp.pages.find(p => p.page === 40).indices.slice(0, 8);
assert.deepEqual(phi, [0, 9, 19, 26, 6, 23, 25, 8]);
const selected = words.filter(w => w.page >= 40 && w.page <= 53);
const text = selected.slice(2).map(w => w.v);
assert.equal(selected.length, 669);
assert.equal(text.length, 667);
assert.equal(text.flat().length, 3000);
const iv = phi.at(-1);

const gpPow = Array(28).fill(1);
for (let i = 1; i < 28; i++) gpPow[i] = mod29(gpPow[i - 1] * 15);
const logarithm = Array(29).fill(-1);
for (let i = 0; i < 28; i++) logarithm[gpPow[i]] = i;
assert.equal(new Set(gpPow).size, 28);
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} x @returns {number[]} */
function encodeEnglish(x) {
  const s = x.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let j = 0; j < s.length;) {
    if (s.startsWith('ING', j)) { out.push(21); j += 3; }
    else if (s.startsWith('IO', j)) { out.push(27); j += 2; }
    else {
      const found = tokens.find(t => s.startsWith(t.s, j));
      assert(found);
      out.push(found.i);
      j += found.s.length;
    }
  }
  return out;
}
const lex = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!m) continue;
  const key = encodeEnglish(m[1]).join(',');
  lex.set(key, Math.max(Number(m[2]), lex.get(key) || 0));
}

/** @param {number} a @param {number} b @param {number} length */
function state(a, b, length) {
  const keys = new Int8Array(length);
  let x = a, y = b;
  for (let i = 0; i < length; i++) {
    keys[i] = x;
    [x, y] = [y, mod29(19 * y + 4 * x)];
  }
  return keys;
}

/**
 * Source-p39 cipher inverse. A zero-step rune is assigned a marked
 * source letter; a T6 source letter S is switched into six-back output
 * unless that output is the zero step. All maps remain 29-way bijections.
 * @param {number[][]} cipher
 * @param {Int8Array} keys
 * @param {number} first
 * @param {number} inside
 * @param {number} initial
 * @returns {number[][]}
 */
function decrypt(cipher, keys, first, inside, initial) {
  const out = [];
  let clock = 0, previous = initial;
  for (const word of cipher) {
    const plain = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j], marker = j === 0 ? first : inside;
      const k = keys[clock] % 28;
      const zeroInverse = d => {
        const unmarked = d === 0 ? 28 : mod28(logarithm[d] - k);
        return unmarked === 28 ? marker : unmarked === marker ? 28 : unmarked;
      };
      const step = mod29(c - previous);
      let p = zeroInverse(step);
      if (j >= 6) {
        const target = mod29(27 * word[j - 6] + 24);
        const targetStep = mod29(target - previous);
        if (targetStep !== 0) {
          const displaced = zeroInverse(targetStep);
          if (step === targetStep) p = 15;
          else if (p === 15) p = displaced;
        }
      }
      plain.push(p);
      previous = c;
      clock++;
    }
    out.push(plain);
  }
  return out;
}

/** @param {number[][]} plain @param {Int8Array} keys
 *  @param {number} first @param {number} inside @param {number} initial */
function encrypt(plain, keys, first, inside, initial) {
  const result = [];
  let previous = initial, clock = 0;
  for (const word of plain) {
    const cipher = [];
    for (let j = 0; j < word.length; j++) {
      const k = keys[clock] % 28;
      const outputs = Array.from({length: 29}, (_, p) =>
        p === 28 ? previous : mod29(previous + gpPow[(p + k) % 28]));
      const assign = (p, c) => {
        const q = outputs.indexOf(c);
        assert(q >= 0);
        [outputs[p], outputs[q]] = [outputs[q], outputs[p]];
      };
      assign(j === 0 ? first : inside, previous);
      if (j >= 6) {
        const target = mod29(27 * cipher[j - 6] + 24);
        if (target !== previous) assign(15, target);
      }
      const c = outputs[word[j]];
      cipher.push(c);
      previous = c;
      clock++;
    }
    result.push(cipher);
  }
  return result;
}
const candidates = [];
for (const first of [10, 5]) for (const inside of [27, 28]) {
  let bestMatched = 0, longSeedCount = 0, mostLong = 0;
  let best = [];
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const recovered = decrypt(text, state(a, b, 3000), first, inside, iv)
      .map(w => w.slice().reverse());
    let matched = 0, long = 0, maxLength = 0, score = 0, positive = [];
    for (let i = 0; i < recovered.length; i++) {
      const word = recovered[i], freq = lex.get(word.join(',')) || 0;
      if (!freq) continue;
      matched++;
      score += Math.log1p(freq);
      maxLength = Math.max(maxLength, word.length);
      if (word.length >= 6) { long++; positive.push(i); }
    }
    if (long > 0) longSeedCount++;
    bestMatched = Math.max(bestMatched, matched);
    mostLong = Math.max(mostLong, long);
    best.push({a,b,matched,long,maxLength,positive,score:+score.toFixed(2)});
  }
  assert.equal(longSeedCount, 1);
  assert.equal(mostLong, 1);
  assert.equal(bestMatched, 57);
  const rare = best.find(x => x.a === 8 && x.b === 6);
  assert.deepEqual(rare.positive, [369]);
  const recovered = decrypt(text, state(8, 6, 3000), first, inside, iv);
  assert.deepEqual(encrypt(recovered, state(8, 6, 3000), first, inside, iv), text);
  const rarePlain = recovered[369].slice().reverse().map(i => gp.translit[i]).join('');
  assert.equal(rarePlain, 'NEEDLE');
  const positivePlain = recovered.map(w => w.slice().reverse());
  assert.equal(positivePlain[369].length, 6);
  best.sort((a, b) => b.long - a.long || b.score - a.score);
  candidates.push({wordStartMarker: gp.translit[first],
    innerMarker: gp.translit[inside], keys: 841,
    bestMatched, longSeedCount, mostLong, rare,
    bestScoreWithoutLong: best.find(x => x.long === 0)});
}

// Fully independent native English positive, exactly the real 667 word lengths.
const binned = new Map();
for (const roman of read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g) || []) {
  const v = encodeEnglish(roman);
  if (!binned.has(v.length)) binned.set(v.length, []);
  binned.get(v.length).push(v);
}
let seed = 0x33010331;
const next = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
const plant = text.map(w => {
  const options = binned.get(w.length);
  assert(options?.length);
  return options[next() % options.length].slice().reverse();
});
for (const [first, inside] of [[10, 27], [5, 28]]) {
  const stateKey = state(9, 24, 3000);
  const cipher = encrypt(plant, stateKey, first, inside, iv);
  assert.deepEqual(decrypt(cipher, stateKey, first, inside, iv), plant);
}
console.log(JSON.stringify({originalRunes: 3000, originalWords: 667,
  red, recurrence: 's[i+2]=19s[i+1]+4s[i] (mod 29)',
  allSecretSeedsPerVariant: 841,
  sourceNativePositiveRoundTrips: 2, candidates}, null, 2));
console.log('PASS: all 3364 frozen original inverses fail continuous native GP-English; isolated NEEDLE is one word with no recovered context.');
