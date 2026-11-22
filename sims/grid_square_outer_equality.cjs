'use strict';
/**
 * Cross-clue full 256-bit grid-column AES/ChaCha keys, 128-bit 4x4-square IVs,
 * and an unknown per-symbol 29-rune outer permutation. Reuse the independently
 * authored equality-only lag likelihood. Select on first 800 runes/section,
 * evaluate locked key/config on unselected section tails.
 *
 * Reproduce: node sims/grid_square_outer_equality.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inputs, cipherBytes, assign } = require('./grid_section_column_keys.cjs');
const { candidateIVs } = require('./grid_square_iv_keys.cjs');
const { score } = require('./equality_pad_scan.cjs');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const HEAD = 800, ROUNDS = 40;
const ROOT = path.resolve(__dirname, '..');
const MOD = 29, mod = v => (v % MOD + MOD) % MOD;

/** @param {number[][]} groups @param {number[][]} columns @param {{name:string,iv:Buffer}[]} ivs */
function search(groups, columns, ivs) {
  const first = groups.map(g => g.slice(0, HEAD));
  const tail = groups.map(g => g.slice(HEAD));
  const width = Math.max(...groups.map(g => g.length));
  let best = null;
  for (const { name, iv } of ivs)
    for (const algorithm of ['aes-256-ctr', 'chacha20'])
      for (const reverse of [false, true]) {
        const stream = columns.map(key => cipherBytes(reverse ? key.slice().reverse() : key, algorithm, width, iv));
        for (const scaled of [false, true]) {
          const pads = stream.map(raw => Uint8Array.from(raw, b => scaled ? Math.floor(MOD*b/256) : b%MOD));
          for (const sign of [-1, 1]) {
            const matrix = first.map(cipher => pads.map(pad => score([cipher], [pad.subarray(0, cipher.length)], sign)));
            const match = assign(matrix);
            if (!best || match.sum > best.screen) {
              const assignment = match.assignment;
              const holdout = tail.reduce((sum, c, i) => {
                if (c.length < 18) return sum;
                const key = pads[assignment[i]].subarray(HEAD, HEAD + c.length);
                return sum + score([c], [key], sign);
              }, 0);
              best = {
                iv: name, ivHex: iv.toString('hex'), algorithm, reverse, scaled, sign,
                assignment, screen: match.sum, holdout,
                firstSection: matrix[0][assignment[0]]
              };
            }
          }
        }
      }
  return best;
}

/** @param {number} seed */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[][]} groups @param {number[][]} cols @param {Buffer} iv */
function plant(groups, cols, iv) {
  const source = fs.readFileSync(path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const heldOut = encode(source.slice(240000));
  const total = groups.reduce((n, g) => n + g.length, 0);
  assert.ok(heldOut.length >= total);
  const next = random(0x4575eaa1);
  const sigma = Array.from({ length: MOD }, (_, i) => i);
  for (let i = MOD - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [sigma[i], sigma[j]] = [sigma[j], sigma[i]];
  }
  let at = 0, repairs = 0;
  const cipher = groups.map((group, i) => {
    const pad = cipherBytes(cols[i], 'aes-256-ctr', group.length, iv);
    const out = Array.from({ length: group.length }, (_, k) => sigma[(heldOut[at+k] + pad[k]%MOD)%MOD]);
    at += group.length;
    for (let k = 1; k < out.length; k++)
      if (out[k] === out[k-1] && next()/2**32 < 0.81) {
        out[k] = (out[k] + 1 + next()%28)%MOD;
        repairs++;
      }
    return out;
  });
  return { cipher, repairs, sigma };
}

function main() {
  const { groups, columnKeys } = inputs();
  const ivs = candidateIVs();
  const plantedIV = ivs.find(x => x.name === 'spiral-prime-complement-mod256');
  const source = plant(groups, columnKeys, plantedIV.iv);
  const test = search(source.cipher, columnKeys, ivs);
  console.log('PLANT', JSON.stringify({
    true: { iv: plantedIV.name, mode: 'aes-256-ctr:forward:mod:sign+1',
      assignment: [0,1,2,3,4,5,6,7] },
    repairs: source.repairs,
    recovered: test
  }));
  assert.equal(test.iv, plantedIV.name, 'Expected correct IV in outer-permuted control');
  assert.equal(test.algorithm, 'aes-256-ctr', 'Expected correct stream algorithm');
  assert.ok(!test.reverse && !test.scaled && test.sign === 1);
  assert.deepEqual(test.assignment, [0,1,2,3,4,5,6,7]);

  const observed = search(groups, columnKeys, ivs);
  console.log('ACTUAL', JSON.stringify(observed));
  const next = random(0x4553e109);
  let screenExceed = 0, holdoutExceed = 0, screenSum = 0, holdoutSum = 0;
  let screenMax = -Infinity, holdoutMax = -Infinity;
  for (let i = 0; i < ROUNDS; i++) {
    const controls = Array.from({ length: ivs.length }, (_, j) => ({
      name: 'random' + j,
      iv: Buffer.from(Array.from({ length: 16 }, () => next() & 255))
    }));
    const wrong = search(groups, columnKeys, controls);
    screenSum += wrong.screen;
    holdoutSum += wrong.holdout;
    screenMax = Math.max(screenMax, wrong.screen);
    holdoutMax = Math.max(holdoutMax, wrong.holdout);
    if (wrong.screen >= observed.screen) screenExceed++;
    if (wrong.holdout >= observed.holdout) holdoutExceed++;
  }
  console.log('NULL', JSON.stringify({
    rounds: ROUNDS, candidatesIV: ivs.length, candidateModes: 16,
    columnAssignments: 40320, screenRunesPerSection: HEAD,
    holdoutSectionLengths: groups.map(g => Math.max(0,g.length-HEAD)),
    observedScreen: observed.screen, wrongScreenMean: screenSum/ROUNDS,
    wrongScreenMax: screenMax, selectionP: (screenExceed+1)/(ROUNDS+1),
    observedHoldout: observed.holdout, wrongHoldoutMean: holdoutSum/ROUNDS,
    wrongHoldoutMax: holdoutMax, heldoutP: (holdoutExceed+1)/(ROUNDS+1)
  }));
}
if (require.main === module) main();
module.exports = { search, plant };
