#!/usr/bin/env node
'use strict';

/**
 * Discovery-aware conditional calibration for the p50/2016 signed-word route.
 * Reproduce with: node sims/lp2_p50_discovery_aware_null_sft.cjs
 *
 * The exact 40,000 table permutations are deterministic and preserve original
 * two-character tokens. Does not alter source files or choose new cipher keys.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const load = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const signed = load('resources/historical/cicada2016-4gq25-outguess.asc');
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const INDEX = new Map(GP.map((x, i) => [x, i]));
const SORTED = GP.slice().sort((a, b) => b.length - a.length);
const ALPHABET60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const ALPHABETS = [ALPHABET60.replace('f', ''), ALPHABET60];
const DEPTHS = [23,5,6,15,8,19,2];
const REPLICATES = 10000;

/** @param {string} word @returns {number[]} */
function runes(word) {
  let rest = word.toUpperCase().replaceAll('V','U').replaceAll('K','C').replaceAll('Z','S');
  const output = [];
  while (rest.length) {
    const token = SORTED.find(x => rest.startsWith(x));
    assert.ok(token, 'Unmapped GP transliteration: ' + word + ':' + rest);
    output.push(INDEX.get(token));
    rest = rest.slice(token.length);
  }
  return output;
}

const start = signed.indexOf('Hello.');
const end = signed.indexOf('-----BEGIN PGP SIGNATURE-----', start);
assert.ok(start >= 0 && end > start, 'Original signed body not located');
const words = (signed.slice(start, end).replace('7A35090F', ' ').match(/[A-Za-z]+/g) || []).map(x => x.toUpperCase());
assert.equal(words.length, 43);
const encodings = Array.from({ length: 7 }, () => []);
for (const word of words) {
  const rs = runes(word);
  const gp0 = rs.reduce((sum, x) => sum + x, 0);
  const gpPrime = rs.reduce((sum, x) => sum + PRIMES[x], 0);
  [gp0, gp0 % 256, gp0 + rs.length, (gp0 + rs.length) % 256,
    gpPrime, gpPrime % 256, rs.length].forEach((x, k) => encodings[k].push(x));
}

const pageCounts = new Map(corpus.pages.map(p => [p.page, p.indices.length]));
assert.equal(pageCounts.size, 58);
assert.equal(pageCounts.get(32), 121);
const countValues = new Set(pageCounts.values());
const candidates = [];
for (let encoding = 0; encoding < 7; encoding++) {
  for (let window = 0; window < 40; window++) {
    const [a,b,c,d] = encodings[encoding].slice(window, window + 4);
    if (countValues.has(a) && [b,c,d].every(x => x >= 0 && x <= 255)) {
      candidates.push({ encoding, window, a, b, c, d });
    }
  }
}
assert.equal(candidates.length, 13);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80,104,72]);
const sourceRows = grid.pages.flatMap(p => {
  const rows = [];
  for (let i = 0; i < p.tokens.length; i += 8) rows.push(p.tokens.slice(i, i + 8).join(' '));
  return rows;
});
const transcriptionHash = crypto.createHash('sha256').update(sourceRows.join('\n') + '\n').digest('hex');
assert.equal(transcriptionHash, '463c57a3949a941027c416522d1b0463a196efb2faa3550377ba15829dcdf6c4');
assert.deepEqual(grid.bytes, tokens.map(t => ALPHABET60.indexOf(t[0]) * 60 + ALPHABET60.indexOf(t[1])));

const traversals = [];
for (let axis = 0; axis < 2; axis++) {
  for (let major = 0; major < 2; major++) {
    for (let minor = 0; minor < 2; minor++) {
      const indices = [];
      for (let a = 0; a < (axis ? 8 : 32); a++) {
        for (let b = 0; b < (axis ? 32 : 8); b++) {
          const x = major ? (axis ? 7-a : 31-a) : a;
          const y = minor ? (axis ? 31-b : 7-b) : b;
          indices.push(axis ? 8*y+x : 8*x+y);
        }
      }
      traversals.push(indices);
    }
  }
}
assert.equal(traversals.length, 8);

/**
 * Evaluate the full 40 x 7 x 2 x 7 x 2 x 8 = 62,720 family.
 * Cached paths and terminal-count prefilter are algebraic optimizations only.
 * @param {string[]} tape original multiset in permuted physical positions
 * @param {boolean} details
 * @returns {{count:number, matches:object[]}}
 */
function findHits(tape, details = false) {
  const decoded = ALPHABETS.map(al => tape.map(t => al.indexOf(t[0]) * al.length + al.indexOf(t[1])));
  let count = 0;
  const matches = [];
  for (let radix = 0; radix < 2; radix++) {
    for (let orientation = 0; orientation < 8; orientation++) {
      const next = traversals[orientation].map(i => decoded[radix][i]);
      for (let origin = 0; origin < 2; origin++) {
        const cache = new Map();
        for (const c of candidates) {
          const begin = c.b + origin;
          let route = cache.get(begin);
          if (!route) {
            route = [begin];
            for (let step = 0; step < 23; step++) {
              const index = route[step] - origin;
              if (index < 0 || index >= 256) break;
              route.push(next[index] + origin);
            }
            cache.set(begin, route);
          }
          for (const depth of DEPTHS) {
            if (pageCounts.get(route[depth]) !== c.a) continue;
            if (route[depth-2] === c.c+origin && route[depth-1] === c.d+origin) {
              count++;
              if (details) matches.push({
                encoding: c.encoding, words: words.slice(c.window,c.window+4),
                radix: radix === 0 ? 59 : 60, orientation, origin, depth,
                page: route[depth], path: route.slice(0, depth+1)
              });
            }
          }
        }
      }
    }
  }
  return { count, matches };
}

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

/**
 * Unbiased Fisher-Yates with 32-bit rejection (all exact original tokens move).
 * @param {string[]} tape @param {number[]} indices @param {() => number} random
 */
function permute(tape, indices, random) {
  for (let i = indices.length - 1; i > 0; i--) {
    const m = i+1, cutoff = Math.floor(4294967296 / m) * m;
    let value;
    do { value = random(); } while (value >= cutoff);
    const a = indices[i], b = indices[value % m];
    [tape[a], tape[b]] = [tape[b], tape[a]];
  }
}

const groups = [
  [Array.from({length:256},(_,i)=>i)],
  [[0,80],[80,184],[184,256]].map(([a,b])=>Array.from({length:b-a},(_,i)=>a+i)),
  Array.from({length:32},(_,i)=>Array.from({length:8},(_,j)=>8*i+j)),
  Array.from({length:8},(_,j)=>Array.from({length:32},(_,i)=>8*i+j))
];
const groupNames = ['global','within-page','within-row','within-column'];
const baseline = findHits(tokens, true);
assert.equal(baseline.count, 2);
assert.ok(baseline.matches.every(h =>
  h.words.join(' ') === 'EPIPHANY SEEKS THE DEVOTED' &&
  h.radix === 60 && h.orientation === 0 && h.origin === 0 &&
  h.depth === 23 && h.page === 32 &&
  h.path.join(',') === '71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32'
));
const results = [];
for (let k = 0; k < groups.length; k++) {
  const seed = (0x20261121+k) >>> 0;
  const random = xorshift32(seed);
  let any = 0, rawHits = 0;
  const histogram = {};
  for (let iteration = 0; iteration < REPLICATES; iteration++) {
    const tape = tokens.slice();
    for (const indices of groups[k]) permute(tape, indices, random);
    const count = findHits(tape).count;
    if (count) {
      any++;
      rawHits += count;
      histogram[count] = (histogram[count] || 0) + 1;
    }
  }
  results.push({ null: groupNames[k], seed: '0x'+seed.toString(16),
    trials: REPLICATES, any, rawHits, histogram });
}
const expected = [0,3,15,5];
assert.deepEqual(results.map(r => r.any), expected, 'Main calibration changed');
console.log(JSON.stringify({
  classification: 'Conditional navigation selectivity; no unknown ciphertext plaintext or creator key',
  baseline: baseline.matches,
  candidates: candidates.length,
  testedConfigurations: 62720,
  conditionalUpper95ForZeroOf10000: 1-Math.pow(0.05,1/10000),
  sourceTokenSha256: transcriptionHash,
  results
}, null, 2));
