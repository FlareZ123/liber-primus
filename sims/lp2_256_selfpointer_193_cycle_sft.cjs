'use strict';

/**
 * Original-input single-file test for the source-selected 2016→p50 byte-pointer
 * hypothesis. This is an exploratory structural result, not an LP2 decryption.
 * Run with Node.js from any working directory. Read-only; no network or writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * @param {number[]} table 256 source bytes interpreted as 0-based addresses.
 * @param {number} start
 * @returns {{walk:number[], entry:number, tail:number, cycle:number[]}}
 */
function orbit(table, start) {
  const seen = new Map();
  const walk = [];
  let cursor = start;
  while (!seen.has(cursor)) {
    seen.set(cursor, walk.length);
    walk.push(cursor);
    cursor = table[cursor];
  }
  const tail = seen.get(cursor);
  return { walk, entry: cursor, tail, cycle: walk.slice(tail) };
}

/**
 * Label connected components of the finite functional graph.
 * @param {number[]} table
 * @returns {{cycleLengths:number[], sizes:number[], sourceBasin:number}}
 */
function graphComponents(table) {
  const owner = new Int16Array(256);
  owner.fill(-1);
  const sizes = [];
  const cycleLengths = [];
  let components = 0;
  for (let start = 0; start < 256; start++) {
    if (owner[start] >= 0) continue;
    const local = new Map();
    const trail = [];
    let cursor = start;
    while (owner[cursor] < 0 && !local.has(cursor)) {
      local.set(cursor, trail.length);
      trail.push(cursor);
      cursor = table[cursor];
    }
    let id;
    if (owner[cursor] >= 0) {
      id = owner[cursor];
    } else {
      id = components++;
      cycleLengths[id] = trail.length - local.get(cursor);
      sizes[id] = 0;
    }
    for (const point of trail) {
      owner[point] = id;
      sizes[id]++;
    }
  }
  return { cycleLengths, sizes, sourceBasin: sizes[owner[83]] };
}

/** @param {string} source @returns {number[]} */
function may2014Whitespace(source) {
  const clearText = source.split('-----BEGIN PGP SIGNATURE-----')[0];
  const counts = [];
  for (const line of clearText.split(/\r?\n/u)) {
    if (line.includes('Hello.') || line.includes('Good luck.')) {
      counts.push(line.match(/ *$/u)[0].length);
    } else if (line.includes('ky2khlqdf7qdznac.onion')) {
      counts.push(line.match(/^ */u)[0].length);
      counts.push(line.match(/ *$/u)[0].length);
    } else if (/^ +$/u.test(line)) {
      counts.push(line.length);
    }
  }
  return counts;
}

/** @param {string} page @returns {string[]} */
function runeWords(page) {
  return page.replace(/\/\s*/gu, '').replace(/\s+/gu, '')
    .split(/[-.&$§]/u).filter((s) => /[\u16a0-\u16ff]/u.test(s))
    .map((s) => [...s].filter((ch) => /[\u16a0-\u16ff]/u.test(ch)).join(''));
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const count = Array(29).fill(0);
  for (const x of symbols) count[x]++;
  return count.reduce((sum, k) => sum + k * (k - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} values @param {number[]} table @returns {number[]} */
function copyWithoutFixed(values, table) {
  for (let j = 0, i = 0; i < 256; i++) {
    if (i !== 83 && i !== 127) values[j++] = table[i];
  }
  return values;
}

/** Deterministic xorshift32 RNG for reproducing the shuffled original null. */
let rng = 0x4c503230;
/** @returns {number} */
function randomUint32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}

function main() {
  const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const table = grid.bytes;
  assert.equal(table.length, 256);
  assert.ok(table.every((x) => Number.isInteger(x) && x >= 0 && x < 256));
  assert.equal(table[83], 193);
  assert.equal(table[127], 193);
  const sourcePrimes = may2014Whitespace(read('resources/cicada2014-may2-signed-message.asc'));
  assert.deepEqual(sourcePrimes, [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]);

  // The signed 2016 "lies"→p50/local3 route has already been frozen in the
  // project's base-58 word-map SFT. The marker bytes above are its direct input.
  const pages = read('resources/lp2-transcription.txt').split('%');
  const p57 = runeWords(pages[56]);
  assert.equal(p57[0], 'ᛈᚪᚱᚪᛒᛚᛖ');
  const body = p57.slice(1);
  assert.equal(body.length, 19);
  assert.equal(body[7], 'ᚹᛖ');
  assert.equal(body.reduce((n, w) => n + [...w].length, 0), 88);

  const p55 = corpus.pages.find((p) => p.page === 55).indices;
  const p32 = corpus.pages.find((p) => p.page === 32).indices;
  assert.equal(p55.length, 76);
  assert.equal(p32.length, 121);
  assert.equal(p32.slice(0, 11).reduce((s, x) => s + corpus.primes[x], 0), 563);
  assert.equal(Array.from({ length: 11 }, (_, i) => p32[i * 11])
    .reduce((s, x) => s + corpus.primes[x], 0), 569);

  const pointer = orbit(table, 83);
  const second = orbit(table, 127);
  assert.equal(pointer.tail, 10);
  assert.equal(pointer.entry, 76);
  assert.deepEqual(pointer.cycle, [76, 114, 197, 115, 247, 192, 0, 203, 68, 199, 47]);
  assert.deepEqual(pointer.walk.slice(1), second.walk.slice(1));
  const graph = graphComponents(table);
  assert.deepEqual(graph.cycleLengths.slice().sort((a, b) => a - b), [2, 11]);
  assert.deepEqual(graph.sizes.slice().sort((a, b) => a - b), [4, 252]);
  console.log('2014 signed whitespace prime groups:', sourcePrimes.join(','));
  console.log('2016 source cell83=193, cell127=193, p55=76 runes, p32=11x11');
  console.log('source orbit:', pointer.walk.join(' -> '), '->', pointer.entry);
  console.log('cycle:', pointer.cycle.join(','));
  console.log('components:', JSON.stringify(graph));

  for (const reverse of [false, true]) {
    const key = reverse ? pointer.cycle.slice().reverse() : pointer.cycle;
    for (const sign of [-1, 1]) {
      const decoded = p55.map((x, i) => mod29(x + sign * key[i % key.length]));
      const reencoded = decoded.map((x, i) => mod29(x - sign * key[i % key.length]));
      assert.deepEqual(reencoded, p55);
      console.log('direct GP29 candidate', JSON.stringify({
        reverse, sign, ioc: indexOfCoincidence(decoded),
        transliteration: decoded.map((x) => corpus.translit[x]).join(''),
      }));
    }
  }

  // Key-free p32 readouts are fixed by natural row/column and byte modulo.
  const rowColumn = pointer.cycle.map((x, i) => p32[11 * i + x % 11]);
  const linear = pointer.cycle.map((x) => p32[x % 121]);
  console.log('p32 11-position row/column:', rowColumn.map((x) => corpus.translit[x]).join(''));
  console.log('p32 11-position linear:', linear.map((x) => corpus.translit[x]).join(''));

  // Conditional null: retain the exact 254 unmarked byte multiset and both
  // source-selected 3D cells, shuffle only the other cell assignments.
  const positions = Array.from({ length: 256 }, (_, i) => i).filter((i) => i !== 83 && i !== 127);
  const remaining = copyWithoutFixed(Array(254), table);
  const shuffled = Array(256).fill(0);
  shuffled[83] = shuffled[127] = 193;
  const n = 50000;
  const counts = { cycle11: 0, entry76: 0, both: 0, basin252: 0, allThree: 0 };
  for (let rep = 0; rep < n; rep++) {
    const next = remaining.slice();
    for (let j = next.length - 1; j > 0; j--) {
      const k = randomUint32() % (j + 1);
      [next[j], next[k]] = [next[k], next[j]];
    }
    for (let j = 0; j < next.length; j++) shuffled[positions[j]] = next[j];
    const candidate = orbit(shuffled, 83);
    const graphNull = graphComponents(shuffled);
    const isCycle = candidate.cycle.length === 11;
    const isEntry = candidate.entry === 76;
    const isBasin = graphNull.sourceBasin >= 252;
    if (isCycle) counts.cycle11++;
    if (isEntry) counts.entry76++;
    if (isCycle && isEntry) counts.both++;
    if (isBasin) counts.basin252++;
    if (isCycle && isEntry && isBasin) counts.allThree++;
  }
  console.log('original-multiset shuffle null', JSON.stringify({
    samples: n, rngSeed: '0x4c503230', fixed: { 83: 193, 127: 193 },
    counts,
    addOneP: Object.fromEntries(Object.entries(counts)
      .map(([key, value]) => [key, (value + 1) / (n + 1)])),
  }));
  console.log('All original-source and bijective-inverse assertions passed.');
}

main();
