'use strict';
/**
 * Eight vertical 32-byte columns of the LP2 base-60 table as section keys.
 * Reads only repository fixtures, writes no files, and searches a frozen family.
 * Run: node sims/grid_section_column_keys.cjs
 *
 * @module grid_section_column_keys
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const ID = new Map(RUNES.map((r, i) => [r, i]));
const SETTINGS = ['aes-256-ctr', 'chacha20'];
const MOD = 29;
const REPLICATES = 100;
const mod = (x) => (x % MOD + MOD) % MOD;

/**
 * @returns {{ groups: number[][], columnKeys: number[][] }}
 */
function inputs() {
  const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  assert.equal(grid.byte_rows.length, 32);
  const columnKeys = Array.from({ length: 8 }, (_, c) => grid.byte_rows.map(row => row[c]));
  assert.ok(columnKeys.every(key => key.length === 32 && key.every(x => Number.isInteger(x) && x >= 0 && x < 256)));
  assert.deepEqual([columnKeys[5][5], columnKeys[2][6], columnKeys[6][30]], [107, 47, 198]);

  const master = read('resources/transcriptions/liber_primus_master.txt');
  const start = master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
  assert.ok(start > 0);
  const text = master.slice(start).split('%').slice(0, 56).join('%');
  const sections = text.split('$').map(piece => [...piece].filter(c => ID.has(c)).map(c => ID.get(c))).filter(a => a.length);
  assert.equal(sections.length, 9);
  assert.equal(sections.reduce((n, a) => n + a.length, 0), 12956);
  // The fourth section is a two-word bridge. The declared eight-way
  // partition joins it with the following section without dropping any rune.
  const groups = [sections[0], sections[1], sections[2], sections[3].concat(sections[4]),
    sections[5], sections[6], sections[7], sections[8]];
  assert.equal(groups.length, 8);
  return { groups, columnKeys };
}

/** @param {number[]} source @param {string} algorithm @param {number} width */
function cipherBytes(source, algorithm, width, iv = Buffer.alloc(16)) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(source), iv);
  return Buffer.concat([cipher.update(Buffer.alloc(width)), cipher.final()]);
}

/** @param {number[]} cipher @param {Buffer} pad @param {number} sign @param {boolean} scaled */
function ioc(cipher, pad, sign, scaled) {
  const frequencies = new Uint32Array(MOD);
  for (let i = 0; i < cipher.length; i++) {
    const key = scaled ? Math.floor(pad[i] * MOD / 256) : pad[i] % MOD;
    frequencies[mod(cipher[i] + sign * key)]++;
  }
  let numerator = 0;
  for (const n of frequencies) numerator += n * (n - 1);
  return numerator / (cipher.length * (cipher.length - 1));
}

/** @param {number[][]} weighted Matrix for eight sections x eight columns */
function assign(weighted) {
  const states = 1 << 8;
  const best = new Float64Array(states).fill(-Infinity);
  const prevMask = new Int16Array(states), picked = new Int8Array(states);
  best[0] = 0;
  for (let mask = 0; mask < states; mask++) {
    const section = popcount(mask);
    if (section === 8) continue;
    for (let col = 0; col < 8; col++) {
      if (mask & (1 << col)) continue;
      const next = mask | (1 << col);
      const candidate = best[mask] + weighted[section][col];
      if (candidate > best[next]) {
        best[next] = candidate;
        prevMask[next] = mask;
        picked[next] = col;
      }
    }
  }
  const chosen = Array(8);
  for (let mask = 255; mask; mask = prevMask[mask]) {
    chosen[popcount(mask) - 1] = picked[mask];
  }
  return { sum: best[255], assignment: chosen };
}

/** @param {number} n */
function popcount(n) {
  let count = 0;
  for (; n; n &= n - 1) count++;
  return count;
}

/** @param {number[][]} groups @param {number[][]} columns */
function evaluate(groups, columns, iv = Buffer.alloc(16)) {
  const N = groups.reduce((sum, arr) => sum + arr.length, 0);
  const maxLength = Math.max(...groups.map(a => a.length));
  const results = [];
  for (const algorithm of SETTINGS) for (const reverse of [false, true]) {
    const streams = columns.map(key => cipherBytes(reverse ? key.slice().reverse() : key, algorithm, maxLength, iv));
    for (const scaled of [false, true]) for (const sign of [-1, 1]) {
      const weighted = groups.map(group => streams.map(pad => group.length * ioc(group, pad, sign, scaled)));
      const optimum = assign(weighted);
      const fixed = weighted.reduce((sum, row, i) => sum + row[i], 0);
      results.push({
        algorithm, reverse, scaled, sign, fixed: fixed / N,
        optimum: optimum.sum / N, assignment: optimum.assignment,
        groupIocs: optimum.assignment.map((c, i) => weighted[i][c] / groups[i].length)
      });
    }
  }
  results.sort((a, b) => b.optimum - a.optimum);
  return { winner: results[0], fixedWinner: results.reduce((a, b) => b.fixed > a.fixed ? b : a), all: results };
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

/** @param {number[][]} columns @param {() => number} next */
function shuffledColumns(columns, next) {
  return columns.map(c => {
    const a = c.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
}

/** @param {number[][]} groups @param {number[][]} columns */
function plant(groups, columns) {
  const english = encode(read('resources/control/shakespeare_first300k.txt'));
  const needed = groups.reduce((n, g) => n + g.length, 0);
  assert.ok(english.length >= needed);
  const next = random(0x45330147);
  let offset = 0, repairs = 0;
  const cipherGroups = [];
  for (let s = 0; s < groups.length; s++) {
    const n = groups[s].length;
    const pad = cipherBytes(columns[s], 'aes-256-ctr', n);
    const values = Array.from({ length: n }, (_, i) => (english[offset + i] + (pad[i] % MOD)) % MOD);
    for (let i = 1; i < n; i++) {
      if (values[i] === values[i - 1] && next() / 2 ** 32 < 0.81) {
        values[i] = (values[i] + 1 + next() % 28) % MOD;
        repairs++;
      }
    }
    offset += n;
    cipherGroups.push(values);
  }
  const test = evaluate(cipherGroups, columns);
  const planted = test.all.find(r => r.algorithm === 'aes-256-ctr' && !r.reverse && !r.scaled && r.sign === -1);
  assert.ok(planted && planted.fixed > 0.045, 'Known-key English plant must remain detectable');
  return { repairs, trueKey: planted.fixed, winner: test.winner, fixedWinner: test.fixedWinner };
}

function main() {
  const { groups, columnKeys } = inputs();
  const actual = evaluate(groups, columnKeys);
  console.log('INPUTS', JSON.stringify({ sections: 8, lengths: groups.map(a => a.length),
    runeCount: groups.reduce((sum, a) => sum + a.length, 0),
    correctedGridCells: [45, 50, 246] }));
  console.log('PLANT', JSON.stringify(plant(groups, columnKeys)));
  console.log('ACTUAL', JSON.stringify({ winner: actual.winner,
    fixedWinner: actual.fixedWinner, topFive: actual.all.slice(0, 5) }));
  const rand = random(0x45330218);
  let outrankOpt = 0, outrankFixed = 0, sumOpt = 0, sumFixed = 0, maxOpt = 0;
  for (let t = 0; t < REPLICATES; t++) {
    const control = evaluate(groups, shuffledColumns(columnKeys, rand));
    const opt = control.winner.optimum, fixed = control.fixedWinner.fixed;
    sumOpt += opt;
    sumFixed += fixed;
    maxOpt = Math.max(maxOpt, opt);
    if (opt >= actual.winner.optimum) outrankOpt++;
    if (fixed >= actual.fixedWinner.fixed) outrankFixed++;
  }
  console.log('NULL', JSON.stringify({
    shuffles: REPLICATES, nullModel: 'independent within-column byte order shuffle',
    observedOptimum: actual.winner.optimum,
    nullOptimumMean: sumOpt / REPLICATES,
    nullOptimumMaximum: maxOpt,
    familywiseOptimumUpperTail: (outrankOpt + 1) / (REPLICATES + 1),
    observedFixed: actual.fixedWinner.fixed,
    nullFixedMean: sumFixed / REPLICATES,
    familywiseFixedUpperTail: (outrankFixed + 1) / (REPLICATES + 1)
  }));
}
if (require.main === module) main();
module.exports = { inputs, cipherBytes, ioc, assign, evaluate, plant };
