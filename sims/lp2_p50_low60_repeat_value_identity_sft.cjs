'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const TRIALS = 200000;
const SEED = 0x25A60;

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {() => number} next @param {number} bound @returns {number} */
function randomInt(next, bound) {
  const limit = 0x100000000 - (0x100000000 % bound);
  let value;
  do value = next(); while (value >= limit);
  return value % bound;
}

/** @param {number[]} values @param {() => number} next */
function shuffle(values, next) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = randomInt(next, i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
}

function main() {
  const pages = corpus.pages.filter((page) => page.page <= 55);
  const tokens = grid.pages.flatMap((page) => page.tokens);
  assert.equal(tokens.length, 256);
  const events = [];
  let globalRune = 0;

  for (const page of pages) {
    for (let local = 0; local + 1 < page.indices.length; local += 1) {
      if (page.indices[local] !== page.indices[local + 1]) continue;
      const phase = (globalRune + local) & 255;
      const byte = grid.bytes[phase];
      if (byte >= 60) continue;
      events.push({
        page: page.page,
        local,
        phase,
        byte,
        token: tokens[phase],
        residue: byte % 29,
        rune: page.indices[local],
      });
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(events.length, 33);

  const originalMatches = events.reduce(
    (sum, event) => sum + Number(event.rune === event.residue),
    0
  );
  assert.equal(originalMatches, 2);

  const residues = events.map((event) => event.residue);
  const runes = events.map((event) => event.rune);
  const expectedMatches = residues.reduce(
    (sum, residue) =>
      sum + runes.filter((rune) => rune === residue).length / runes.length,
    0
  );

  const next = xorshift32(SEED);
  const histogram = new Map();
  let atLeastOriginal = 0;

  for (let trial = 0; trial < TRIALS; trial += 1) {
    const shuffledRunes = runes.slice();
    shuffle(shuffledRunes, next);
    let matches = 0;
    for (let i = 0; i < residues.length; i += 1) {
      matches += Number(shuffledRunes[i] === residues[i]);
    }
    histogram.set(matches, (histogram.get(matches) || 0) + 1);
    atLeastOriginal += Number(matches >= originalMatches);
  }

  const histogramObject = Object.fromEntries(
    [...histogram.entries()].sort((a, b) => a[0] - b[0])
  );

  console.log(JSON.stringify({
    status: 'PASS',
    rule: 'For the 33 fixed low60 adjacent-repeat events, test repeated GP index === aligned p50 byte mod29.',
    original: {
      events: events.length,
      matches: originalMatches,
      expectedMatchesUnderFixedMultisets: expectedMatches,
      literalSecondCharacterReadout: events.map((event) => event.token[1]).join(''),
      repeatedRuneReadout: events.map((event) => corpus.translit[event.rune]).join(''),
      matchingEvents: events
        .filter((event) => event.rune === event.residue)
        .map((event) => ({
          page: event.page,
          local: event.local,
          phase: event.phase,
          byte: event.byte,
          rune: event.rune,
          translit: corpus.translit[event.rune],
        })),
    },
    permutation: {
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      fixed: '33 event positions, p50 residues, and repeated-rune multiset',
      atLeastOriginal,
      atLeastOriginalRate: atLeastOriginal / TRIALS,
      histogram: histogramObject,
    },
    decision: 'Direct low60 byte-mod29 equality does not explain the p50 repeat-class association.',
  }, null, 2));
}

main();
