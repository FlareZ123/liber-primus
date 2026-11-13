'use strict';

/**
 * Original-input specificity gate for an external claim to decrypt LP2 pages 0–2.
 * Reads a pinned, minimally derived coordinate snapshot and the canonical GP29
 * ciphertext. No network access or external NPM packages required.
 *
 * The loose candidate family below follows the author's published choices:
 * 27×27 original matrix, equally spaced three-cell key nodes on four axes,
 * optional Euler-totient middle replacement, Möbius-derived key rotation,
 * periodic key subtraction modulo 29, and straight 8-direction cipher paths.
 * It deliberately does not impose post-fitted cross-block transition rules.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root, 'im-results', 'lp2-external-27x27-cipher-stage-cells.json'), 'utf8'));
const runes = corpus.pages.slice(0, 3).flatMap(page => page.indices);
assert.equal(runes.length, 729);
const stages = source.stage_cipher_cells;
assert.equal(Object.keys(stages).length, 38);
const consumed = Object.values(stages).flat();
assert.equal(consumed.length, 115);
assert.equal(new Set(consumed.map(cell => cell.join(','))).size, 103);

function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      result -= result / p;
      while (n % p === 0) n /= p;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}

function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let sign = 1;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      sign = -sign;
      n /= p;
      if (n % p === 0) return 0;
      while (n % p === 0) n /= p;
    }
  }
  return n > 1 ? -sign : sign;
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const rays = axes.concat(axes.map(([dy, dx]) => [-dy, -dx]));
const at = (y, x) => runes[y * 27 + x];
const valid = (y, x) => y >= 0 && x >= 0 && y < 27 && x < 27;

// A key-value triple may arise from several independent original-source nodes.
// Preserve multiplicity because finding several nodes for the same output is
// evidence of ambiguity, rather than multiple independent plaintext recoveries.
const sourceKeys = new Map();
for (let y = 0; y < 27; y++) {
  for (let x = 0; x < 27; x++) {
    for (const [dy, dx] of axes) {
      for (let radius = 1; radius <= 13; radius++) {
        const y1 = y - dy * radius;
        const x1 = x - dx * radius;
        const y2 = y + dy * radius;
        const x2 = x + dx * radius;
        if (!valid(y1, x1) || !valid(y2, x2)) break;
        const original = [at(y1, x1), at(y, x), at(y2, x2)];
        for (const transformCenter of [false, true]) {
          const key = original.slice();
          if (transformCenter) {
            if (key[1] === 0) continue;
            key[1] = phi(key[1]);
          }
          if (key.includes(0)) continue;
          const signature = key.reduce((sum, value) => sum + mu(phi(value)), 0);
          const phase = ((signature % 3) + 3) % 3;
          const aligned = key.slice(phase).concat(key.slice(0, phase)).join(',');
          sourceKeys.set(aligned, (sourceKeys.get(aligned) || 0) + 1);
        }
      }
    }
  }
}
assert.equal(sourceKeys.size, 12917);
assert.equal([...sourceKeys.values()].reduce((sum, value) => sum + value, 0), 26024);

const prefix2 = new Map();
for (const [key, number] of sourceKeys) {
  const prefix = key.split(',').slice(0, 2).join(',');
  prefix2.set(prefix, (prefix2.get(prefix) || 0) + number);
}

/**
 * Find independently selectable source-key/straight-ray decodes of an exact
 * target GP-rune sequence, with no target-fitted key values. Words of length
 * 2–3 cannot falsify a three-rune repeating key at the ciphertext level.
 */
function seek(name, target) {
  let eligible = 0;
  let periodic = 0;
  let sourceSupported = 0;
  let sourceUseCombinations = 0;
  const examples = [];
  for (let y = 0; y < 27; y++) {
    for (let x = 0; x < 27; x++) {
      for (const [dy, dx] of rays) {
        if (!valid(y + dy * (target.length - 1), x + dx * (target.length - 1))) continue;
        eligible++;
        const keyStream = target.map((value, i) => (at(y + dy * i, x + dx * i) - value + 29) % 29);
        if (keyStream.some((value, i) => value !== keyStream[i % 3])) continue;
        periodic++;
        const lead = keyStream.slice(0, Math.min(3, target.length)).join(',');
        const number = target.length === 2 ? (prefix2.get(lead) || 0) : (sourceKeys.get(lead) || 0);
        if (!number) continue;
        sourceSupported++;
        sourceUseCombinations += number;
        if (examples.length < 4) {
          examples.push({ start: [y + 1, x + 1], ray: [dy, dx], sourceNodes: number });
        }
      }
    }
  }
  return { name, runes: target.length, eligible, periodic, sourceSupported, sourceUseCombinations, examples };
}

const tests = [
  ['WEATHER', [7, 28, 2, 18, 4], [4600, 5, 3, 6]],
  ['LUXOR', [20, 1, 14, 3, 4], [4600, 7, 4, 6]],
  ['ABCDE', [24, 17, 5, 23, 18], [4600, 2, 1, 3]],
  ['SOLAR', [15, 3, 20, 24, 4], [4600, 7, 3, 5]],
  ['COLD', [5, 3, 20, 23], [4896, 144, 85, 153]],
  ['KEY', [5, 18, 26], [5200, 5200, 2693, 5301]],
  ['DEATH', [23, 18, 2], [5200, 5200, 2679, 5422]],
  ['GO', [6, 3], [5512, 5512, 5153, 171503]],
  ['TURNS', [16, 1, 4, 9, 15], [4600, 5, 3, 8]],
];
for (const [name, gpIndices, expected] of tests) {
  const result = seek(name, gpIndices);
  assert.deepEqual(
    [result.eligible, result.periodic, result.sourceSupported, result.sourceUseCombinations],
    expected,
    name + ' count mismatch'
  );
  console.log(JSON.stringify(result));
}
console.log('PASS: source-exact LP2 p0–2; 38 selected blocks, 115 uses on 103 cells; ' +
  '5-rune and shorter GP29 readings are nonunique under external node/key choices.');
