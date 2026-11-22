'use strict';

/**
 * Original LP2 GP29 predecessor-exclusion -> base-28/29 binary container gate.
 * Historical motivation: Cicada 2013 BASE29 and 2014 BZip2 stages; LP2's
 * independently observed scarcity of adjacent equal ciphertext runes.
 *
 * Run: node sims/lp2_predecessor_rank_binary_original_sft.cjs
 * Read-only, deterministic, native Windows Node.js CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dataset = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const cuts = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const domains = [
  ...dataset.pages.slice(0, 56).filter((p) => p.indices.length > 0)
    .map((p) => ({ label: `p${p.page}`, runes: p.indices })),
  ...cuts.map(([a, b]) => ({
    label: `chapter${a}-${b}`,
    runes: dataset.pages.slice(a, b + 1).flatMap((p) => p.indices)
  })),
  {
    label: 'book',
    runes: dataset.pages.slice(0, 56).flatMap((p) => p.indices)
  }
];
const kinds = ['abs+', 'abs-', 'cyc+', 'cyc-'];
const escapes = ['skip', 'escape'];
const initializations = ['first-as-IV', 'fixed0'];
const signatures = [
  ['BZIP2', /425a683[1-9]/g],
  ['GZIP', /1f8b08/g],
  ['XZ', /fd377a585a00/g],
  ['PNG', /89504e470d0a1a0a/g],
  ['ZIP', /504b0304/g],
  ['PDF', /255044462d/g],
  ['7ZIP', /377abcaf271c/g],
  ['ELF', /7f454c46/g],
  ['WASM', /0061736d/g],
  ['SQLITE', /53514c69746520666f726d6174203300/g],
  ['ZIP-EMPTY', /504b0506/g],
  ['JPEG', /ffd8ff/g]
];

/**
 * @param {number} predecessor
 * @param {number} symbol
 * @param {'abs+'|'abs-'|'cyc+'|'cyc-'} kind
 * @returns {number} 0..27 when symbols differ
 */
function rank(predecessor, symbol, kind) {
  assert.notEqual(predecessor, symbol);
  const absolute = symbol - Number(symbol > predecessor);
  const cyclic = (symbol - predecessor + 28) % 29;
  if (kind === 'abs+') return absolute;
  if (kind === 'abs-') return 27 - absolute;
  if (kind === 'cyc+') return cyclic;
  return 27 - cyclic;
}

/** @param {number[]} runes @param {string} kind @param {string} escape @param {string} init */
function decode(runes, kind, escape, init) {
  assert(runes.length > 1);
  const base = escape === 'escape' ? 29n : 28n;
  let n = 0n;
  let predecessor = init === 'fixed0' ? 0 : runes[0];
  const first = init === 'fixed0' ? 0 : 1;
  let duplicateCount = 0;
  for (let i = first; i < runes.length; i++) {
    const c = runes[i];
    if (c === predecessor) {
      duplicateCount++;
      if (escape === 'skip') {
        predecessor = c;
        continue;
      }
      n = n * base + 28n;
    } else {
      n = n * base + BigInt(rank(predecessor, c, kind));
    }
    predecessor = c;
  }
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return { hex, duplicateCount };
}

/** Encode a 28-rank plant using cyclic predecessor exclusion. */
function plant28(digits, initial = 0) {
  const result = [];
  let predecessor = initial;
  for (const digit of digits) {
    assert(digit >= 0 && digit < 28);
    predecessor = (predecessor + 1 + digit) % 29;
    result.push(predecessor);
  }
  return result;
}

function toBase28Bytes(hex) {
  let n = BigInt('0x' + hex);
  const digits = [];
  while (n > 0n) {
    digits.push(Number(n % 28n));
    n /= 28n;
  }
  return digits.reverse();
}

const fixture = '1f8b0800000000000003'; // Valid gzip header bytes, not a payload claim.
const planted = plant28(toBase28Bytes(fixture));
assert.equal(decode(planted, 'cyc+', 'skip', 'fixed0').hex, fixture,
  'gzip header must survive an exact predecessor-rank-28 encode/decode plant');
assert.equal(dataset.pages.length, 58);
assert.equal(domains.length, 65);

let tests = 0;
let binaryBytes = 0;
const hits = [];
for (const domain of domains) {
  for (const kind of kinds) {
    for (const escape of escapes) {
      for (const init of initializations) {
        const { hex } = decode(domain.runes, kind, escape, init);
        tests++;
        binaryBytes += hex.length / 2;
        for (const [format, regex] of signatures) {
          regex.lastIndex = 0;
          for (const hit of hex.matchAll(regex)) {
            if (hit.index % 2 === 0) {
              hits.push({
                domain: domain.label,
                kind, escape, init, format,
                offsetBytes: hit.index / 2
              });
            }
          }
        }
      }
    }
  }
}
console.log('Positive native rank28 gzip-header plant passed');
console.log('Original domains:', domains.length, 'variants:', tests,
  'bytes scanned:', binaryBytes);
console.log('Container signature hits:', JSON.stringify(hits));
assert.equal(tests, 1040);
assert.equal(binaryBytes, 374438);
assert.deepEqual(hits, []);
console.log('PASS: no tested standard container magic on original LP2 rank-transport streams');
