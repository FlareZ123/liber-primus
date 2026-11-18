'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);

const ordered = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function gpWord(text) {
  const s = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (s.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const hit = ordered.find(x => s.startsWith(x.s, i));
    if (hit) {
      out.push(hit.i);
      i += hit.s.length;
    } else {
      i += 1;
    }
  }
  return out;
}

const reference = (read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g) || []).flatMap(gpWord);
const model = new Float64Array(29 * 29).fill(2);
const totals = new Float64Array(29).fill(58);
for (let i = 1; i < reference.length; i += 1) {
  model[29 * reference[i - 1] + reference[i]] += 1;
  totals[reference[i - 1]] += 1;
}

/** @param {number[]} runes @returns {number} */
function score(runes) {
  let log = 0;
  for (let i = 1; i < runes.length; i += 1) {
    log += Math.log(model[29 * runes[i - 1] + runes[i]] / totals[runes[i - 1]]);
  }
  return log / (runes.length - 1);
}

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

const divinity = [23, 10, 1, 10, 9, 10, 16, 26];
assert.equal(divinity.map(i => gp.translit[i]).join(''), 'DIUINITY');
const seen = new Set();
const inner = [];
for (const rune of divinity) {
  if (!seen.has(rune)) {
    seen.add(rune);
    inner.push(rune);
  }
}
for (let rune = 0; rune < 29; rune += 1) {
  if (!seen.has(rune)) {
    seen.add(rune);
    inner.push(rune);
  }
}
assert.equal(inner.length, 29);

/**
 * @param {number[]} cipher
 * @param {boolean} reversed
 * @param {number} direction
 * @param {number} initial
 * @returns {number[]}
 */
function progressiveDecode(cipher, reversed, direction, initial) {
  const wheel = reversed ? [...inner].reverse() : inner;
  const pos = new Array(29);
  wheel.forEach((rune, i) => { pos[rune] = i; });
  return cipher.map((c, i) => mod29(pos[c] - initial - direction * i));
}

/**
 * @param {number[]} plain
 * @param {boolean} reversed
 * @param {number} direction
 * @param {number} initial
 * @returns {number[]}
 */
function progressiveEncrypt(plain, reversed, direction, initial) {
  const wheel = reversed ? [...inner].reverse() : inner;
  return plain.map((p, i) => wheel[mod29(p + initial + direction * i)]);
}

const progressive = [];
for (const reversed of [false, true]) {
  for (const direction of [1, -1]) {
    for (let initial = 0; initial < 29; initial += 1) {
      const decoded = progressiveDecode(source, reversed, direction, initial);
      progressive.push({
        reversed,
        direction,
        initial,
        score: score(decoded),
        first80: decoded.slice(0, 80).map(i => gp.translit[i]).join('')
      });
    }
  }
}
progressive.sort((a, b) => b.score - a.score);
assert.equal(progressive.length, 116);
assert.deepEqual(
  [progressive[0].reversed, progressive[0].direction, progressive[0].initial],
  [false, 1, 18]
);
assert.ok(Math.abs(progressive[0].score - (-4.526777268280663)) < 1e-12);

const plantPlain = reference.slice(0, source.length);
const plantCipher = progressiveEncrypt(plantPlain, false, 1, 0);
assert.deepEqual(progressiveDecode(plantCipher, false, 1, 0), plantPlain);

const redStarts = new Map();
for (const page of ink.pages) {
  if (page.page > 55) continue;
  for (const span of page.red_spans || []) {
    if (!redStarts.has(page.page)) redStarts.set(page.page, new Set());
    redStarts.get(page.page).add(span.start);
  }
}
const signalCount = [...redStarts.values()].reduce((n, starts) => n + starts.size, 0);
assert.equal(signalCount, 16);

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {boolean} reversed
 * @param {number} indexRune
 * @returns {number[]}
 */
function signalDecodePages(pages, reversed, indexRune) {
  const wheel = reversed ? [...inner].reverse() : inner;
  const pos = new Array(29);
  wheel.forEach((rune, i) => { pos[rune] = i; });
  const indexPos = pos[indexRune];
  const out = [];
  let shift = 0;
  let armed = false;
  for (const page of pages) {
    const starts = redStarts.get(page.page) || new Set();
    for (let local = 0; local < page.indices.length; local += 1) {
      const c = page.indices[local];
      if (starts.has(local)) {
        shift = mod29(indexPos - c);
        armed = true;
        continue;
      }
      if (armed) out.push(mod29(pos[c] - shift));
    }
  }
  return out;
}

/**
 * @param {number[]} plain
 * @param {boolean} reversed
 * @param {number} indexRune
 * @returns {Array<{page:number,indices:number[]}>}
 */
function signalEncryptPlant(plain, reversed, indexRune) {
  const wheel = reversed ? [...inner].reverse() : inner;
  const pos = new Array(29);
  wheel.forEach((rune, i) => { pos[rune] = i; });
  const indexPos = pos[indexRune];
  const pages = [];
  let shift = 0;
  let armed = false;
  let k = 0;
  for (const page of gp.pages.filter(p => p.page <= 55)) {
    const starts = redStarts.get(page.page) || new Set();
    const indices = [];
    for (let local = 0; local < page.indices.length; local += 1) {
      if (starts.has(local)) {
        const signal = page.indices[local];
        indices.push(signal);
        shift = mod29(indexPos - signal);
        armed = true;
        continue;
      }
      if (!armed) {
        indices.push(page.indices[local]);
        continue;
      }
      indices.push(wheel[mod29(plain[k] + shift)]);
      k += 1;
    }
    pages.push({ page: page.page, indices });
  }
  assert.equal(k, plain.length);
  return pages;
}

const originalPages = gp.pages.filter(p => p.page <= 55)
  .map(p => ({ page: p.page, indices: p.indices }));
const keywordIndices = [...new Set(divinity)];
const signals = [];
for (const reversed of [false, true]) {
  for (const indexRune of keywordIndices) {
    const decoded = signalDecodePages(originalPages, reversed, indexRune);
    signals.push({
      reversed,
      indexRune,
      index: gp.translit[indexRune],
      runes: decoded.length,
      score: score(decoded),
      first100: decoded.slice(0, 100).map(i => gp.translit[i]).join('')
    });
  }
}
signals.sort((a, b) => b.score - a.score);
assert.equal(signals.length, 12);
assert.equal(signals[0].runes, 12940);
assert.deepEqual([signals[0].reversed, signals[0].index], [false, 'Y']);
assert.ok(Math.abs(signals[0].score - (-4.541535049097408)) < 1e-12);

const signalPlantPlain = reference.slice(0, 12940);
const signalPlantPages = signalEncryptPlant(signalPlantPlain, false, 23);
assert.deepEqual(signalDecodePages(signalPlantPages, false, 23), signalPlantPlain);

const nativeScores = [0, 10000, 30000].map(offset =>
  score(reference.slice(offset, offset + source.length))
);
assert.ok(Math.max(...nativeScores) > -2.7);
assert.ok(progressive[0].score < -4.5);
assert.ok(signals[0].score < -4.5);

console.log(JSON.stringify({
  status: 'bounded p57 DIVINITY cipher-disk negative',
  sourceRunes: source.length,
  keywordedInnerWheel: inner.map(i => gp.translit[i]).join(' '),
  progressiveVariants: progressive.length,
  bestProgressive: progressive[0],
  zeroInitialProgressive: progressive.filter(x => x.initial === 0),
  redSignalCount: signalCount,
  redSignalVariants: signals.length,
  bestRedSignal: signals[0],
  sourceIndexD: signals.filter(x => x.indexRune === 23),
  nativeScores,
  progressivePlantRecovered: plantPlain.length,
  redSignalPlantRecovered: signalPlantPlain.length
}, null, 2));
