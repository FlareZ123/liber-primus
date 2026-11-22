'use strict';

/**
 * LP2 original-source SFT: arbitrary secret GP29 substitution chosen by the
 * current rune of a cyclic red heading. Runs in Node.js 22 (CommonJS).
 *
 * This is an all-key necessary-condition exclusion, not a decryption.
 * Fully consuming title clock; no plaintext-F skip or page-private rekey.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const PAGES = JSON.parse(read('resources/liber-primus/lp2-corpus.json')).pages;
const CHAPTERS = [
  { name: 'p0-2', first: 0, last: 2, head: 13 },
  { name: 'p8-14', first: 8, last: 14, head: 12 },
  { name: 'p15-22', first: 15, last: 22, head: 20 },
  { name: 'p23-26', first: 23, last: 26, head: 16 },
  { name: 'p27-32', first: 27, last: 32, head: 19 },
  { name: 'p40-52', first: 40, last: 52, head: 8 },
  { name: 'p54-55', first: 54, last: 55, head: 9 },
];

/** @param {{name:string,first:number,last:number,head:number}} ch */
function chapter(ch) {
  const title = PAGES[ch.first].indices.slice(0, ch.head);
  /** @type {number[]} */
  const body = [];
  for (let p = ch.first; p <= ch.last; p += 1) {
    body.push(...PAGES[p].indices.slice(p === ch.first ? ch.head : 0));
  }
  assert.equal(title.length, ch.head);
  assert(title.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  assert(body.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  return { ...ch, title, body };
}

/**
 * @param {number[]} title
 * @param {number[]} body
 * @param {number} phase
 * @param {number} direction
 * @returns {number[][]}
 */
function histogram(title, body, phase, direction) {
  const h = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < body.length; i += 1) {
    const t = ((phase + direction * i) % title.length + title.length) % title.length;
    h[title[t]][body[i]] += 1;
  }
  return h;
}

/** @param {number[][]} rows */
function capacity(rows) {
  const sorted = rows.map((r) => r.slice().sort((a, b) => b - a));
  return {
    b1: sorted.reduce((n, r) => n + r[0], 0),
    b5: sorted.reduce((n, r) => n + r.slice(0, 5).reduce((a, b) => a + b, 0), 0),
  };
}

/** @param {number[][]} rows */
function mergeRows(rows) {
  const result = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (const h of rows) {
    for (let i = 0; i < 29; i += 1) {
      for (let j = 0; j < 29; j += 1) result[i][j] += h[i][j];
    }
  }
  return result;
}

/**
 * Upper bound: each chapter gets independently chosen secret S-boxes, title
 * phase and scan direction. This strictly contains the shared-key model.
 * @param {ReturnType<typeof chapter>[]} chapters
 */
function universalCapacity(chapters) {
  let length = 0;
  let b1 = 0;
  let b5 = 0;
  for (const ch of chapters) {
    let max1 = 0;
    let max5 = 0;
    for (const direction of [-1, 1]) {
      for (let phase = 0; phase < ch.head; phase += 1) {
        const c = capacity(histogram(ch.title, ch.body, phase, direction));
        max1 = Math.max(max1, c.b1);
        max5 = Math.max(max5, c.b5);
      }
    }
    b1 += max1;
    b5 += max5;
    length += ch.body.length;
  }
  return { length, b1, b5 };
}

/** Convert complete Latin words to GP29, greedy historically attested digraphs. */
function toGp(text) {
  /** @type {Record<string, number>} */
  const map = {
    F: 0, U: 1, TH: 2, O: 3, R: 4, C: 5, G: 6, W: 7, H: 8,
    N: 9, I: 10, J: 11, EO: 12, P: 13, X: 14, S: 15, T: 16,
    B: 17, E: 18, M: 19, L: 20, NG: 21, OE: 22, D: 23, A: 24,
    AE: 25, Y: 26, IA: 27, EA: 28, K: 5, Q: 5, V: 1, Z: 15,
  };
  const digraphs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
  /** @type {number[]} */
  const out = [];
  for (const match of text.toUpperCase().matchAll(/[A-Z]+/g)) {
    const word = match[0];
    for (let i = 0; i < word.length;) {
      const pair = digraphs.find((d) => word.startsWith(d, i));
      if (pair) { out.push(map[pair]); i += 2; }
      else { out.push(map[word[i]]); i += 1; }
    }
  }
  return out;
}

/** @param {number[]} source @param {number} width */
function nativeWindowMinimum(source, width) {
  assert(source.length >= width);
  const hist = Array(29).fill(0);
  let min1 = Infinity;
  let min5 = Infinity;
  for (let i = 0; i < source.length; i += 1) {
    hist[source[i]] += 1;
    if (i >= width) hist[source[i - width]] -= 1;
    if (i >= width - 1) {
      const sorted = hist.slice().sort((a, b) => b - a);
      min1 = Math.min(min1, sorted[0]);
      min5 = Math.min(min5, sorted.slice(0, 5).reduce((a, b) => a + b, 0));
    }
  }
  return { windows: source.length - width + 1, min1, min5 };
}

function controls() {
  const prophet = read('resources/control/gibran_prophet_58585.txt');
  const start = prophet.indexOf('Almustafa');
  const stop = prophet.indexOf('End of the Project Gutenberg');
  assert(start >= 0 && stop > start);
  return {
    Gibran: toGp(prophet.slice(start, stop)),
    Shakespeare: toGp(read('resources/control/shakespeare_first300k.txt')),
  };
}

function plantedPositive(chapters, source) {
  /** @type {number[]} */
  const plaintext = [];
  /** @type {number[]} */
  const reconstructed = [];
  let offset = 0;
  const rows = [];
  chapters.forEach((ch, chapterId) => {
    /** @type {number[]} */
    const crypt = [];
    for (let i = 0; i < ch.body.length; i += 1) {
      const p = source[offset + i];
      const state = ch.title[i % ch.head];
      const multiplier = 1 + ((chapterId * 5 + state * 17) % 28);
      const shift = (chapterId * 7 + state * 11) % 29;
      const enc = (multiplier * p + shift) % 29;
      const inverse = Array.from({ length: 29 }, (_, j) => j)
        .find((j) => (multiplier * j + shift) % 29 === enc);
      assert.notEqual(inverse, undefined);
      plaintext.push(p);
      crypt.push(enc);
      reconstructed.push(inverse);
    }
    rows.push(histogram(ch.title, crypt, 0, 1));
    offset += ch.body.length;
  });
  assert.deepEqual(reconstructed, plaintext);
  const caps = rows.map(capacity);
  const cap = { b1: caps.reduce((n, x) => n + x.b1, 0), b5: caps.reduce((n, x) => n + x.b5, 0) };
  const freq = Array(29).fill(0);
  for (const p of plaintext) freq[p] += 1;
  const sorted = freq.sort((a, b) => b - a);
  assert(cap.b1 >= sorted[0]);
  assert(cap.b5 >= sorted.slice(0, 5).reduce((a, b) => a + b, 0));
  console.log('PASS planted full-GP-native row-permutation inverse:', plaintext.length, 'runes');
}

function main() {
  const chapters = CHAPTERS.map(chapter);
  const registers = {
    'p0-2+p23-26': [chapters[0], chapters[3]],
    'four-clean-chapters': [chapters[0], chapters[1], chapters[3], chapters[4]],
    'six-chapters-no-p15': chapters.filter((c) => c.name !== 'p15-22'),
    'seven-chapters': chapters,
  };
  const expected = {
    'p0-2+p23-26': [1721, 155, 593],
    'four-clean-chapters': [4852, 385, 1530],
    'six-chapters-no-p15': [7972, 585, 2352],
    'seven-chapters': [9855, 727, 2925],
  };
  const donors = controls();
  for (const [name, spans] of Object.entries(registers)) {
    const bound = universalCapacity(spans);
    assert.deepEqual([bound.length, bound.b1, bound.b5], expected[name]);
    console.log(name, 'upper bound', bound);
    for (const [controlName, source] of Object.entries(donors)) {
      const result = nativeWindowMinimum(source, bound.length);
      console.log('  native', controlName, result);
      assert(bound.b5 < result.min5, 'Original must fail the all-secret top-five GP-English gate');
    }
  }
  plantedPositive(registers['four-clean-chapters'], donors.Gibran);
  console.log('PASS all original-rubric all-secret bounds; no unknown LP2 plaintext recovered');
}

main();
