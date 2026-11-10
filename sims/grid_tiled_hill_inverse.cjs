'use strict';
/**
 * Source-fixed tiled Hill key schedules from the literal 32x8 LP2 grid:
 * sixteen 4x4 keys or four 8x8 keys, every tile individually invertible F29.
 * Tests both historically documented numeral readings (60 and f-omitting 59),
 * all distinct spatial orderings, key-cycle direction, block phase, book/page
 * clock and exactly invertible outer predecessor-rank maps.
 *
 * This is an exact candidate class, not an identification of Cicada's cipher.
 * node sims/grid_tiled_hill_inverse.cjs
 * Node.js 22, builtins, read-only sources, original + two native positive plants.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = source => fs.readFileSync(path.join(ROOT, source), 'utf8');
const CORPUS = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GRID = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const PAGES = CORPUS.pages.filter(p => p.status === 'unsolved' && p.indices.length)
  .map(p => ({page: p.page, indices: p.indices}));
const DIGITS59 = GRID.alphabet.replace('f', '');
const BYTES = new Map([
  [60, GRID.byte_rows.flat()],
  [59, GRID.rows.flat().map(token =>
    59 * DIGITS59.indexOf(token[0]) + DIGITS59.indexOf(token[1]))]
]);
assert.equal(GRID.rows.length, 32);
assert(GRID.rows.every(row => row.length === 8));
assert(GRID.rows.flat().every(token => !token.includes('f')));
assert([...BYTES.values()].every(bytes => bytes.length === 256 &&
  bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255)));
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);
const WIDTHS = [4, 8];
const mod = n => ((n % 29) + 29) % 29;

/** Invert an arbitrary square matrix over F29; source tiles must all invert. */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) =>
    [...row, ...Array.from({length: n}, (_, j) => Number(j === i))]);
  let determinant = 1;
  for (let i = 0; i < n; i++) {
    let k = i;
    while (k < n && a[k][i] === 0) k++;
    if (k === n) return {determinant: 0, inverse: null};
    if (i !== k) {
      [a[i], a[k]] = [a[k], a[i]];
      determinant = mod(-determinant);
    }
    const scalar = a[i][i];
    determinant = mod(determinant * scalar);
    let inverse = 1;
    while (mod(inverse * scalar) !== 1) inverse++;
    for (let j = 0; j < 2 * n; j++) a[i][j] = mod(inverse * a[i][j]);
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = a[k][i];
      for (let j = 0; j < 2 * n; j++) a[k][j] =
        mod(a[k][j] - factor * a[i][j]);
    }
  }
  return {determinant, inverse: a.map(row => row.slice(n))};
}
const transpose = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]));

/** Return all fixed source-tile matrix keys for one reading and dimension. */
function tiles(radix, width, order, transposed) {
  const bytes = BYTES.get(radix);
  const rows = 32 / width, columns = 8 / width;
  const original = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const matrix = Array.from({length: width}, (_, k) =>
        bytes.slice((r * width + k) * 8 + c * width,
          (r * width + k) * 8 + (c + 1) * width).map(v => v % 29));
      original.push(matrix);
    }
  }
  const ordered = order === 'row' ? original
    : Array.from({length: original.length}, (_, i) =>
        original[(i % rows) * columns + Math.floor(i / rows)]);
  const tileMatrices = ordered.map(matrix =>
    transposed ? transpose(matrix) : matrix);
  const details = tileMatrices.map(matrix => ({matrix, ...invert(matrix)}));
  assert(details.every(item => item.inverse),
    'Source matrix would not define a reversible complete Hill key');
  return details;
}

/** Exact bijective predecessor-rank map, equal successor = index28. */
function transformOuter(pages, mode, reset, encrypt) {
  let previous = -1;
  return pages.map(page => {
    if (reset === 'page') previous = -1;
    const indices = [];
    for (const x of page.indices) {
      let y = x;
      if (previous >= 0 && mode !== 'direct') {
        if (encrypt) y = x === 28 ? previous :
          mode === 'cyclic' ? mod(previous + x + 1) :
            x + Number(x >= previous);
        else y = x === previous ? 28 :
          mode === 'cyclic' ? mod(x - previous - 1) :
            x - Number(x > previous);
      }
      indices.push(y);
      previous = encrypt ? y : x;
    }
    return {page: page.page, indices};
  });
}
function multiply(matrix, vector) {
  return matrix.map(row => {
    let result = 0;
    for (let j = 0; j < vector.length; j++) result += row[j] * vector[j];
    return mod(result);
  });
}
/**
 * Apply fixed matrix blocks in source order, preserve partial blocks.
 * The key index increments once per complete block. Original-source clock
 * remains continuous across pages under book reset, also across holdout cut.
 */
function apply(pages, keys, reset, phase, reverse, decrypt) {
  const width = keys[0].matrix.length;
  const k = keys.length;
  const lengths = pages.map(page => page.indices.length);
  const chunks = reset === 'page'
    ? pages.map(page => page.indices) : [pages.flatMap(page => page.indices)];
  let index = 0;
  const output = [], evaluated = [];
  for (const source of chunks) {
    if (reset === 'page') index = 0;
    const target = source.slice();
    const mask = new Array(source.length).fill(false);
    for (let start = phase; start + width <= source.length; start += width) {
      const tile = keys[reverse ? (k - 1 - index % k) : index % k];
      index++;
      const values = multiply(decrypt ? tile.inverse : tile.matrix,
        source.slice(start, start + width));
      for (let j = 0; j < width; j++) {
        target[start + j] = values[j];
        mask[start + j] = true;
      }
    }
    output.push(...target);
    evaluated.push(...mask);
  }
  assert.equal(output.length, 12956);
  const rebuilt = [];
  let offset = 0;
  for (let i = 0; i < pages.length; i++) {
    const length = lengths[i];
    rebuilt.push({page: pages[i].page, indices: output.slice(offset, offset + length)});
    offset += length;
  }
  return {pages: rebuilt, flat: output, evaluated};
}
/** Honest within-study original half split, without resetting book matrix phase. */
const CUT = PAGES.filter(page => page.page < 28)
  .reduce((sum, page) => sum + page.indices.length, 0);
function ioc(frequencies, n) {
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0)
    / (n * (n - 1));
}
function score(out, reset, phase, width) {
  const train = new Array(29).fill(0), heldout = new Array(29).fill(0);
  let nt = 0, nh = 0;
  for (let i = 0; i < out.flat.length; i++) {
    if (!out.evaluated[i]) continue;
    if (reset === 'book') {
      const start = phase + Math.floor((i - phase) / width) * width;
      if (start < CUT && start + width > CUT) continue;
    }
    if (i < CUT) {train[out.flat[i]]++; nt++;}
    else {heldout[out.flat[i]]++; nh++;}
  }
  return {trainIoC: ioc(train, nt), heldoutIoC: ioc(heldout, nh),
    trainRunes: nt, heldoutRunes: nh};
}
/** All distinct source-key and channel configurations; no fitted source bytes. */
function configs() {
  const result = [];
  for (const radix of [60, 59]) for (const width of WIDTHS)
    for (const order of (width === 4 ? ['row', 'column'] : ['row']))
      for (const transposed of [false, true])
        for (const reset of ['book', 'page'])
          for (const outer of ['direct', 'cyclic', 'sorted'])
            for (const reverse of [false, true])
              for (let phase = 0; phase < width; phase++)
                result.push({radix, width, order, transposed,
                  reset, outer, reverse, phase});
  assert.equal(result.length, 768);
  return result;
}
const OPTIONS = configs();
/** @param {{radix:number,width:number,order:string,transposed:boolean}} cfg */
function sourceKeys(cfg) {
  return tiles(cfg.radix, cfg.width, cfg.order, cfg.transposed);
}
function decrypt(pages, cfg) {
  const source = transformOuter(pages, cfg.outer, cfg.reset, false);
  return apply(source, sourceKeys(cfg), cfg.reset, cfg.phase, cfg.reverse, true);
}
function encrypt(pages, cfg) {
  const core = apply(pages, sourceKeys(cfg),
    cfg.reset, cfg.phase, cfg.reverse, false).pages;
  return transformOuter(core, cfg.outer, cfg.reset, true);
}
/** Scan given manuscript-layout ciphertext for fixed source candidate keys. */
function scan(pages) {
  const all = OPTIONS.map(cfg => ({
    ...cfg, ...score(decrypt(pages, cfg), cfg.reset, cfg.phase, cfg.width)
  }));
  all.sort((a, b) => b.trainIoC - a.trainIoC);
  return all;
}
/** Original source-text positive independent of 29-rune cipher targets. */
function sourcePlain() {
  const source = read('resources/control/shakespeare_first300k.txt');
  const vocab = CORPUS.translit.map((word, index) => ({word, index}))
    .sort((a, b) => b.word.length - a.word.length);
  const tokens = [];
  for (let word of source.slice(-65000).toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const match = vocab.find(item => word.startsWith(item.word, i));
      if (match) {tokens.push(match.index); i += match.word.length;}
      else i++;
    }
  }
  assert(tokens.length > 12956);
  let offset = 0;
  return PAGES.map(page => {
    const indices = tokens.slice(offset, offset + page.indices.length);
    offset += indices.length;
    return {page: page.page, indices};
  });
}
function run() {
  const original = scan(PAGES), source = sourcePlain();
  const positiveConfigs = [
    {radix: 60, width: 4, order: 'row', transposed: false,
      reset: 'page', outer: 'sorted', reverse: false, phase: 2},
    {radix: 59, width: 8, order: 'row', transposed: true,
      reset: 'book', outer: 'cyclic', reverse: true, phase: 1}
  ];
  const positives = positiveConfigs.map(key => {
    const plant = encrypt(source, key);
    assert.deepEqual(decrypt(plant, key).pages, source);
    assert.deepEqual(encrypt(decrypt(plant, key).pages, key), plant);
    const ranked = scan(plant);
    const actualRank = ranked.findIndex(candidate =>
      Object.entries(key).every(([name, value]) => candidate[name] === value)) + 1;
    assert.equal(actualRank, 1,
      'Actual source-fixed planted key must be recovered blindly');
    return {key, actualRank, recoveredRunes: 12956, reencryptedRunes: 12956,
      trueTrainIoC: ranked[0].trainIoC,
      trueHeldoutIoC: ranked[0].heldoutIoC};
  });
  const bestByWidth = WIDTHS.map(width => {
    const cases = original.filter(row => row.width === width);
    const key = cases[0];
    assert.equal(cases.length, 384);
    assert.deepEqual(encrypt(decrypt(PAGES, key).pages, key), PAGES,
      'Original best source inverse must reencrypt all runes exactly');
    return {width, bestTraining: key,
      originalReencryptedRunes: 12956,
      postselectedMaximumHeldout: Math.max(...cases.map(row => row.heldoutIoC))};
  });
  assert(original[0].heldoutIoC < 0.04);
  return {
    classification: 'Direct tiled source-grid Hill key schedule, original negative',
    originalRunes: 12956, physicalRunePages: PAGES.length,
    sourceGridTokens: 256, declaredConfigs: OPTIONS.length,
    tiles: [4, 8].flatMap(width => [60, 59].map(radix => ({
      width, radix, determinantMod29: tiles(radix, width, 'row', false)
        .map(tile => tile.determinant)
    }))),
    bestOriginalTraining: original[0], bestByWidth,
    positives,
    conclusion: 'Original source-fixed tiled Hill decodings remain near-uniform while two native GP-source plants recover the exact key, plaintext, and source ciphertext. No unknown LP2 plaintext or authentic key recovered.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = {run, invert, tiles, transformOuter, apply, score, configs,
  decrypt, encrypt, sourcePlain, scan};
