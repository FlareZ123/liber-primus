'use strict';

/**
 * Original LP2 86-doublet channel + printed p50 one-bit mask versus the
 * independently solved p56 SHA-512 digest in Base64.
 *
 * Intended read-only SFT: node sims/lp2_doublet_p50_bit_sha512_base64_sft.cjs
 *
 * The hypothesis is source-motivated, not a Cicada-authenticated opcode.
 * This test asks whether even an arbitrary secret stationary digit mapping
 * can make the unchanged 86 marker symbols yield the known 86 sextets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));

const unsolvedPages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(unsolvedPages.length, 56);
assert.equal(unsolvedPages.filter((p) => p.indices.length).length, 55);
assert.equal(unsolvedPages.reduce((n, p) => n + p.indices.length, 0), 12956);

const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens.filter((t) => t[0] === '0').length, 60);

const source = read('resources/liber-primus/lp1-plaintext-reference.txt');
const p56 = source.split('### 56')[1].split('### 57')[0];
const digest = p56.split(/\r?\n/).map((s) => s.trim())
  .filter((s) => /^[0-9a-f]{40,}$/.test(s)).join('');
assert.match(digest, /^[a-f0-9]{128}$/);
assert.equal(digest.slice(0, 16), '36367763ab73783c');
assert.equal(digest.slice(-16), 'a49fb4f45132c2a8b4'.slice(-16));

const alphabet64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64 = Buffer.from(digest, 'hex').toString('base64');
assert.equal(base64.length, 88);
assert.ok(base64.endsWith('=='));
const target = base64.slice(0, -2).split('').map((ch) => alphabet64.indexOf(ch));
assert.equal(target.length, 86);
assert(target.every((x) => x >= 0 && x <= 63));

// The final sextet contains two standard Base64 padding bits.
assert.equal(target.at(-1) % 16, 0);

let globalOffset = 0;
const events = [];
for (const page of unsolvedPages) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] !== page.indices[i - 1]) continue;
    const global = globalOffset + i;
    const token = tokens[(global - 1) % tokens.length];
    events.push({
      global,
      page: page.page,
      local: i,
      rune: page.indices[i],
      bit: Number(token[0] === '0'),
      token
    });
  }
  globalOffset += page.indices.length;
}
assert.equal(globalOffset, 12956);
assert.equal(events.length, 86);
assert.equal(events.filter((e) => e.bit).length, 33);
assert.deepEqual(events.slice(0, 6).map((e) => e.global),
  [122, 207, 456, 653, 782, 909]);

/**
 * Necessary condition for ANY stationary symbol encoder.
 * An observed input value must always emit the same output value.
 * @param {number[]} input
 * @param {number[]} output
 * @returns {{distinctInput:number,distinctOutput:number,forcedInputConflicts:number,firstConflict:object|null}}
 */
function stationaryGate(input, output) {
  assert.equal(input.length, output.length);
  const seen = new Map();
  const outputs = new Set();
  let forcedInputConflicts = 0;
  let firstConflict = null;
  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    const y = output[i];
    assert(Number.isInteger(x) && x >= 0 && x < 64);
    assert(Number.isInteger(y) && y >= 0 && y < 64);
    outputs.add(y);
    if (seen.has(x) && seen.get(x).value !== y) {
      forcedInputConflicts++;
      if (firstConflict === null) {
        firstConflict = { firstIndex: seen.get(x).index, secondIndex: i,
          input: x, firstOutput: seen.get(x).value, secondOutput: y };
      }
    } else if (!seen.has(x)) {
      seen.set(x, { index: i, value: y });
    }
  }
  return {
    distinctInput: seen.size,
    distinctOutput: outputs.size,
    forcedInputConflicts,
    firstConflict
  };
}

const runeMajor = events.map((e) => e.rune + 29 * e.bit);
const bitMajor = events.map((e) => 2 * e.rune + e.bit);
const runeGate = stationaryGate(runeMajor, target);
const bitGate = stationaryGate(bitMajor, target);

// A stronger ordering-free obstruction: 44 distinct source states
// cannot represent 46 distinct known digest sextets using any function.
assert.deepEqual(
  [runeGate.distinctInput, runeGate.distinctOutput, runeGate.forcedInputConflicts],
  [44, 46, 42]
);
assert.deepEqual(
  [bitGate.distinctInput, bitGate.distinctOutput, bitGate.forcedInputConflicts],
  [44, 46, 42]
);
assert.deepEqual(runeGate.firstConflict,
  {firstIndex: 5, secondIndex: 9, input: 25,
    firstOutput: 58, secondOutput: 3});
assert.equal(events[5].global, 909);
assert.equal(events[9].global, 1591);
assert.equal(events[5].rune, events[9].rune);
assert.equal(events[5].bit, events[9].bit);

// Source-shaped positive: the exact 86 real event input states can carry
// a deterministic invertible 58-to-64 alphabet, and this gate detects it.
const planted = runeMajor.map((x) => (7 * x + 3) % 64);
const plantGate = stationaryGate(runeMajor, planted);
assert.equal(plantGate.forcedInputConflicts, 0);
assert.equal(plantGate.distinctInput, 44);
assert.equal(plantGate.distinctOutput, 44);
const decoded = planted.map((y) => ((y - 3 + 64) * 55) % 64);
assert.deepEqual(decoded, runeMajor);

const results = {
  originalRunes: 12956,
  eventCount: events.length,
  leadingZeroEvents: events.filter((e) => e.bit).length,
  knownDigestBytes: 64,
  knownDigestBase64Sextets: target.length,
  sourceInputDistinct: runeGate.distinctInput,
  digestTargetDistinct: runeGate.distinctOutput,
  runeMajor: runeGate,
  bitMajor: bitGate,
  firstExactContradiction: {
    first: events[runeGate.firstConflict.firstIndex],
    second: events[runeGate.firstConflict.secondIndex]
  },
  positivePlantRecovered: decoded.length,
  status: 'NO: stationary 29-rune x p50-bit symbol maps cannot reproduce known SHA-512 Base64 digest, even with arbitrary secret output alphabet or event reordering'
};
process.stdout.write(JSON.stringify(results, null, 2) + '\n');
