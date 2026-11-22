#!/usr/bin/env node
'use strict';

// Test the simplest direct use of the 76-cell p50 table perimeter as a
// position-preserving GP29 additive/Beaufort key for the 76-rune p55 page.
// The p55 tail is conditionally cribbed as the clear p57 phrase OUR OWN.
// Run from repository root: node sims/lp2_p50_rim76_p55_direct_pad_crib_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
const mod = n => ((n % 29) + 29) % 29;

const ring = [];
for (let c = 0; c < 8; c++) ring.push(c);
for (let r = 1; r < 32; r++) ring.push(r * 8 + 7);
for (let c = 6; c >= 0; c--) ring.push(31 * 8 + c);
for (let r = 30; r >= 1; r--) ring.push(r * 8);
assert.equal(ring.length, 76);
const corners = [
  { name: 'top-left', index: 0 },
  { name: 'top-right', index: 7 },
  { name: 'bottom-right', index: 38 },
  { name: 'bottom-left', index: 45 }
];

const p55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(p55.length, 76);
assert.equal(corpus.translit[p55[0]], 'NG');
assert.deepEqual(p55.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0), [15, 25, 41]);

const cipherCrib = p55.slice(70, 76);
const plainCrib = [3, 1, 4, 3, 7, 9]; // GP29 OUR OWN
assert.deepEqual(cipherCrib, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(plainCrib.map(x => corpus.translit[x]), ['O', 'U', 'R', 'O', 'W', 'N']);
assert.equal([7, 3, 11, 7, 19, 29].reduce((a, b) => a + b, 0), 76);

const targets = [
  { mode: 'C=P+K', key: cipherCrib.map((c, i) => mod(c - plainCrib[i])) },
  { mode: 'C=P-K', key: plainCrib.map((p, i) => mod(p - cipherCrib[i])) },
  { mode: 'C=K-P', key: cipherCrib.map((c, i) => mod(c + plainCrib[i])) }
];
assert.deepEqual(targets[0].key, [20, 10, 26, 14, 11, 1]);
assert.deepEqual(targets[1].key, [9, 19, 3, 15, 18, 28]);
assert.deepEqual(targets[2].key, [26, 12, 5, 20, 25, 19]);

function encode(plain, key, mode, bypassPositions) {
  let phase = 0;
  const cipher = plain.map((p, i) => {
    if (bypassPositions.has(i)) return 0;
    const k = key[phase++];
    if (mode === 'C=P+K') return mod(p + k);
    if (mode === 'C=P-K') return mod(p - k);
    return mod(k - p);
  });
  return { cipher, phase };
}
function decode(cipher, key, mode, bypassPositions) {
  let phase = 0;
  const plain = cipher.map((c, i) => {
    if (bypassPositions.has(i)) return 0;
    const k = key[phase++];
    if (mode === 'C=P+K') return mod(c - k);
    if (mode === 'C=P-K') return mod(c + k);
    return mod(k - c);
  });
  return { plain, phase };
}

const candidates = [];
for (const radix of [59, 60]) {
  const alphabet = radix === 59 ? grid.alphabet.replace('f', '') : grid.alphabet;
  const tableValues = tokens.map(token => {
    const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0, 'A table token is not valid in the selected radix');
    return radix * a + b;
  });
  for (const corner of corners) {
    for (const direction of ['clockwise', 'counterclockwise']) {
      const keyBytes = Array.from({ length: 76 }, (_, k) => {
        const pos = (corner.index + (direction === 'clockwise' ? k : -k) + 7600) % 76;
        return mod(tableValues[ring[pos]]);
      });
      for (let bypassCount = 0; bypassCount <= 3; bypassCount++) {
        const offset = 76 - bypassCount - 6;
        const window = keyBytes.slice(offset, offset + 6);
        assert.equal(window.length, 6);

        // Positive control: exercise this exact key, mode and bypass count.
        // The plant is non-F except at the first N original p55 F sites.
        const bypassSites = [15, 25, 41].slice(0, bypassCount);
        const bypassSet = new Set(bypassSites);
        const plant = Array.from({ length: 76 }, (_, i) => 1 + ((i * 7 + 2) % 28));
        for (const i of bypassSites) plant[i] = 0;
        plant.splice(70, 6, ...plainCrib);

        for (const target of targets) {
          const enc = encode(plant, keyBytes, target.mode, bypassSet);
          const dec = decode(enc.cipher, keyBytes, target.mode, bypassSet);
          assert.deepEqual(dec.plain, plant);
          assert.equal(enc.phase, 76 - bypassCount);
          assert.equal(dec.phase, 76 - bypassCount);

          const matches = window.filter((x, i) => x === target.key[i]).length;
          candidates.push({
            radix, corner: corner.name, direction, bypassCount,
            mode: target.mode, offset, keyWindow: window,
            requiredKey: target.key, matches
          });
        }
      }
    }
  }
}

assert.equal(candidates.length, 192);
const exact = candidates.filter(x => x.matches === 6);
const maximum = Math.max(...candidates.map(x => x.matches));
assert.equal(exact.length, 0);
assert.equal(maximum, 1);

console.log(JSON.stringify({
  p55Length: p55.length,
  p55TailCipher: cipherCrib,
  conditionalPlaintextCrib: plainCrib,
  requiredKeys: targets,
  p55CipherFPositions: [15, 25, 41],
  candidateCount: candidates.length,
  exactSixSymbolMatches: exact,
  maximumSymbolMatches: maximum,
  bestCandidates: candidates.filter(x => x.matches === maximum),
  positiveControls: 'All 192 mode/layout/bypass plants re-encrypt and decrypt exactly.',
  conclusion: 'No direct position-preserving 76-cell perimeter additive/Beaufort pad matches the conditional OUR OWN p55 footer crib.'
}, null, 2));
