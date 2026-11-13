'use strict';

/**
 * A key-independent capacity gate for a repeated 29-state Kautz/Euler trail.
 *
 * The falsifiable model traverses every ordered pair of *distinct* GP29 symbols
 * exactly 16 times, in an arbitrary secret order, and may insert any number of
 * duplicate-previous-symbol "hold" events. Its directed-edge multiplicities
 * are independent of the unknown secret traversal order and any fixed secret
 * alphabet relabeling. This is not claimed to be Cicada's selected mechanism.
 *
 * Usage: node sims/lp2_balanced_kautz_edge_capacity_sft.cjs
 * Works with Node.js 20+ on Windows 11 or other Node-supported platforms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WIDTH = 29;
const EDGE_TYPES = WIDTH * (WIDTH - 1);
const COPIES = 16;
const EXPECTED_RUNES = 12956;
const EXPECTED_WITHIN_PAGE_PAIRS = 12901;
const EXPECTED_WITHIN_PAGE_REPEATS = 86;

/** @param {number[][]} pages */
function countTransitions(pages) {
  const counts = new Uint16Array(WIDTH * WIDTH);
  let pairs = 0;
  let repeats = 0;
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      const a = page[i - 1];
      const b = page[i];
      assert.ok(a >= 0 && a < WIDTH && b >= 0 && b < WIDTH);
      counts[a * WIDTH + b]++;
      pairs++;
      repeats += Number(a === b);
    }
  }
  const offDiagonal = [];
  for (let a = 0; a < WIDTH; a++) {
    for (let b = 0; b < WIDTH; b++) {
      if (a !== b) offDiagonal.push({ a, b, count: counts[a * WIDTH + b] });
    }
  }
  assert.equal(offDiagonal.length, EDGE_TYPES);
  const histogram = new Map();
  for (const { count } of offDiagonal) {
    histogram.set(count, (histogram.get(count) || 0) + 1);
  }
  offDiagonal.sort((x, y) => y.count - x.count || x.a - y.a || x.b - y.b);
  return {
    pairs, repeats,
    offDiagonalTotal: pairs - repeats,
    max: offDiagonal[0].count,
    min: offDiagonal.at(-1).count,
    edgesOver16: offDiagonal.filter(x => x.count > COPIES).length,
    topEdges: offDiagonal.slice(0, 5),
    histogram: [...histogram].sort((x, y) => x[0] - y[0]),
  };
}

/** @returns {number[]} Deterministic 812-edge closed Euler walk with no self loops. */
function oneKautzTour() {
  const exits = Array.from({ length: WIDTH }, (_, a) =>
    Array.from({ length: WIDTH }, (_, b) => b).filter(b => b !== a).reverse()
  );
  const stack = [0];
  const reversed = [];
  while (stack.length) {
    const a = stack.at(-1);
    if (exits[a].length) stack.push(exits[a].pop());
    else reversed.push(stack.pop());
  }
  const trail = reversed.reverse();
  assert.equal(trail.length, EDGE_TYPES + 1);
  assert.equal(trail[0], trail.at(-1));
  const positive = countTransitions([trail]);
  assert.equal(positive.max, 1);
  assert.equal(positive.min, 1);
  assert.equal(positive.repeats, 0);
  return trail;
}

/** @param {number[]} sizes @param {number[]} runes */
function repartition(sizes, runes) {
  let offset = 0;
  const pages = sizes.map(n => {
    const section = runes.slice(offset, offset + n);
    offset += n;
    return section;
  });
  assert.equal(offset, runes.length);
  return pages;
}

/** @param {number[]} pageSizes */
function plantedControl(pageSizes) {
  const cycle = oneKautzTour();
  const path = cycle.slice();
  for (let repetition = 1; repetition < COPIES; repetition++) {
    path.push(...cycle.slice(1));
  }
  assert.equal(path.length, EDGE_TYPES * COPIES + 1);

  // Recreate the entire original 12,956-rune budget with precisely 86
  // zero-step holds. A hold adds one diagonal transition and cannot create
  // any new non-diagonal edge, so all 16-fold capacities remain invariant.
  const holds = EXPECTED_WITHIN_PAGE_REPEATS;
  const source = path.slice(0, EXPECTED_RUNES - holds);
  const sites = new Set(Array.from({ length: holds }, (_, i) =>
    Math.floor((i + 0.5) * source.length / holds)
  ));
  assert.equal(sites.size, holds);
  const generated = [];
  for (let i = 0; i < source.length; i++) {
    generated.push(source[i]);
    if (sites.has(i)) generated.push(source[i]);
  }
  assert.equal(generated.length, EXPECTED_RUNES);
  assert.equal(countTransitions([generated]).repeats, holds);
  const byPage = countTransitions(repartition(pageSizes, generated));
  assert.ok(byPage.max <= COPIES);
  return { runes: generated.length, continuousHolds: holds,
    withinPagePairs: byPage.pairs, withinPageRepeats: byPage.repeats,
    maxOffDiagonalMultiplicity: byPage.max, edgesOver16: byPage.edgesOver16 };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
    'utf8'
  ));
  const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length)
    .map(p => p.indices);
  const sizes = pages.map(p => p.length);
  assert.equal(pages.length, 55);
  assert.equal(sizes.reduce((a, b) => a + b, 0), EXPECTED_RUNES);
  const observed = countTransitions(pages);
  assert.equal(observed.pairs, EXPECTED_WITHIN_PAGE_PAIRS);
  assert.equal(observed.repeats, EXPECTED_WITHIN_PAGE_REPEATS);
  assert.equal(observed.max, 29);
  assert.equal(observed.min, 5);
  assert.equal(observed.edgesOver16, 339);
  const plant = plantedControl(sizes);
  assert.equal(plant.edgesOver16, 0);
  console.log(JSON.stringify({
    input: 'Original unknown LP2 p0-p55, physical page boundaries respected',
    model: 'Any secret order of 16 visits to each of 812 nonself GP29 edges, ' +
      'optionally with duplicate-previous-symbol holds; arbitrary alphabet bijection',
    original: observed,
    positiveControl: plant,
    outcome: 'EXCLUDED: 339 observed ordered nonself rune pairs exceed ' +
      'the strict 16-event per-edge capacity; no unknown plaintext recovered',
    limitations: 'Does not exclude unbalanced anti-repeat generators, ' +
      'resets with separate 16-copy budgets, adaptive renaming, or ' +
      'arbitrary position-dependent/stateful stream ciphers',
  }, null, 2));
}
if (require.main === module) main();
module.exports = { countTransitions, oneKautzTour, repartition, plantedControl };
