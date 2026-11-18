'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const RADIX = 29;
const LIMIT = 2 ** 24;
const MAX = RADIX ** 5;
const PACKET_RUNES = 75;
const PACKET_BYTES = 45;
const EXACT_FLAGS = '100100000000000';
const TRIALS = 20000;
const SEED = 0x1525A25;

/**
 * Compute one big-endian base-29 quintet value.
 * @param {number[]} digits
 * @param {number} start
 * @returns {number}
 */
function quintetValueAt(digits, start) {
  let value = 0;
  for (let i = 0; i < 5; i += 1) value = value * RADIX + digits[start + i];
  return value;
}

/**
 * Decode the frozen 75-rune framing at one page-local phase.
 * @param {number[]} page
 * @param {number} phase
 * @returns {{firstByte:number,lastByte:number,flags:string,header:boolean,footer:boolean,primary:boolean,exactFlags:boolean,strict:boolean}}
 */
function scanWindow(page, phase) {
  assert.ok(page.length >= phase + PACKET_RUNES);
  let flags = '';
  let firstByte = -1;
  let lastByte = -1;

  for (let group = 0; group < 15; group += 1) {
    const value = quintetValueAt(page, phase + group * 5);
    const flag = Number(value >= LIMIT);
    const lower = value - flag * LIMIT;
    flags += String(flag);
    if (group === 0) firstByte = (lower >>> 16) & 255;
    if (group === 14) lastByte = lower & 255;
  }

  const header = phase > 0 && firstByte === page[phase - 1];
  const footer = lastByte === PACKET_BYTES;
  const primary = header && footer;
  const exactFlags = flags === EXACT_FLAGS;

  return {
    firstByte,
    lastByte,
    flags,
    header,
    footer,
    primary,
    exactFlags,
    strict: primary && exactFlags,
  };
}

/**
 * Scan the exact finite family used in the original discovery.
 * @param {number[][]} pages
 * @returns {{eligible:number,primaryHits:number,exactFlagHits:number,strictHits:number,primaryWindows:Array<{page:number,phase:number}>,exactFlagWindows:Array<{page:number,phase:number}>,strictWindows:Array<{page:number,phase:number}>}}
 */
function scanBook(pages) {
  let eligible = 0;
  let primaryHits = 0;
  let exactFlagHits = 0;
  let strictHits = 0;
  const primaryWindows = [];
  const exactFlagWindows = [];
  const strictWindows = [];

  for (let pageNumber = 0; pageNumber < pages.length; pageNumber += 1) {
    const page = pages[pageNumber];
    for (let phase = 0; phase < 5; phase += 1) {
      if (page.length < phase + PACKET_RUNES) continue;
      eligible += 1;
      const result = scanWindow(page, phase);
      if (result.primary) {
        primaryHits += 1;
        primaryWindows.push({page: pageNumber, phase});
      }
      if (result.exactFlags) {
        exactFlagHits += 1;
        exactFlagWindows.push({page: pageNumber, phase});
      }
      if (result.strict) {
        strictHits += 1;
        strictWindows.push({page: pageNumber, phase});
      }
    }
  }

  return {
    eligible,
    primaryHits,
    exactFlagHits,
    strictHits,
    primaryWindows,
    exactFlagWindows,
    strictWindows,
  };
}

/**
 * Deterministic 32-bit PRNG.
 * @param {number} seed
 * @returns {() => number}
 */
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
 * Draw an unbiased integer in [0, bound) from a 32-bit generator.
 * @param {() => number} nextU32
 * @param {number} bound
 * @returns {number}
 */
function randomInt(nextU32, bound) {
  assert.ok(Number.isInteger(bound) && bound > 0);
  const range = 0x100000000;
  const limit = range - (range % bound);
  let x;
  do x = nextU32(); while (x >= limit);
  return x % bound;
}

/**
 * Fisher-Yates shuffle a copy of one physical page, preserving its exact rune histogram.
 * @param {number[]} source
 * @param {() => number} nextU32
 * @returns {number[]}
 */
function shuffledPage(source, nextU32) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(nextU32, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Encode one exact five-rune group from a 3-byte payload and frozen carry bit.
 * @param {number[]} bytes
 * @param {number} flag
 * @returns {number[]}
 */
function encodeGroup(bytes, flag) {
  assert.equal(bytes.length, 3);
  assert.ok(flag === 0 || flag === 1);
  const lower = (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
  const value = flag * LIMIT + lower;
  assert.ok(value < MAX);
  const digits = Array(5);
  let remaining = value;
  for (let i = 4; i >= 0; i -= 1) {
    digits[i] = remaining % RADIX;
    remaining = Math.floor(remaining / RADIX);
  }
  assert.equal(remaining, 0);
  return digits;
}

/**
 * Build an independent deterministic positive whose p55-like phase1 window
 * has the frozen overflow string plus the two byte-framing equalities.
 * @returns {number[]}
 */
function plantedPage() {
  const preceding = 21;
  const bytes = Array.from({length: PACKET_BYTES}, (_, i) => (17 + 37 * i) & 255);
  bytes[0] = preceding;
  bytes[9] = 11;
  bytes[10] = 22;
  bytes[11] = 33;
  bytes[PACKET_BYTES - 1] = PACKET_BYTES;

  const flags = [...EXACT_FLAGS].map(Number);
  const body = [];
  for (let group = 0; group < 15; group += 1) {
    const triple = bytes.slice(group * 3, group * 3 + 3);
    if (flags[group] === 1) {
      const lower = (triple[0] << 16) + (triple[1] << 8) + triple[2];
      assert.ok(lower < MAX - LIMIT);
    }
    body.push(...encodeGroup(triple, flags[group]));
  }
  assert.equal(body.length, PACKET_RUNES);
  return [preceding, ...body];
}

function main() {
  const pages = corpus.pages.slice(0, 56).map((page) => page.indices.slice());
  const original = scanBook(pages);

  assert.equal(original.eligible, 267);
  assert.deepEqual(original.primaryWindows, [{page: 55, phase: 1}]);
  assert.deepEqual(original.exactFlagWindows, [
    {page: 1, phase: 0},
    {page: 53, phase: 4},
    {page: 55, phase: 1},
  ]);
  assert.deepEqual(original.strictWindows, [{page: 55, phase: 1}]);

  const plant = plantedPage();
  const planted = scanWindow(plant, 1);
  assert.equal(planted.primary, true);
  assert.equal(planted.exactFlags, true);
  assert.equal(planted.strict, true);
  assert.equal(planted.firstByte, plant[0]);
  assert.equal(planted.lastByte, PACKET_BYTES);
  assert.equal(scanWindow(plant, 0).primary, false);

  const nextU32 = xorshift32(SEED);
  let familywisePrimary = 0;
  let familywiseExactFlags = 0;
  let familywiseStrict = 0;
  let totalPrimaryHits = 0;
  let totalExactFlagHits = 0;
  let totalStrictHits = 0;
  let primaryAtLeastOriginalCount = 0;
  let exactAtLeastOriginalCount = 0;
  let strictAtLeastOriginalCount = 0;
  const primaryHitHistogram = new Map();
  const exactHitHistogram = new Map();
  const strictHitHistogram = new Map();

  for (let trial = 0; trial < TRIALS; trial += 1) {
    const shuffled = pages.map((page) => shuffledPage(page, nextU32));
    const result = scanBook(shuffled);

    if (result.primaryHits > 0) familywisePrimary += 1;
    if (result.exactFlagHits > 0) familywiseExactFlags += 1;
    if (result.strictHits > 0) familywiseStrict += 1;
    if (result.primaryHits >= original.primaryHits) primaryAtLeastOriginalCount += 1;
    if (result.exactFlagHits >= original.exactFlagHits) exactAtLeastOriginalCount += 1;
    if (result.strictHits >= original.strictHits) strictAtLeastOriginalCount += 1;

    totalPrimaryHits += result.primaryHits;
    totalExactFlagHits += result.exactFlagHits;
    totalStrictHits += result.strictHits;
    primaryHitHistogram.set(result.primaryHits, (primaryHitHistogram.get(result.primaryHits) || 0) + 1);
    exactHitHistogram.set(result.exactFlagHits, (exactHitHistogram.get(result.exactFlagHits) || 0) + 1);
    strictHitHistogram.set(result.strictHits, (strictHitHistogram.get(result.strictHits) || 0) + 1);
  }

  const sortedHistogram = (map) => Object.fromEntries(
    [...map.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => [String(k), v])
  );

  console.log(JSON.stringify({
    status: 'PASS',
    protocol: {
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      null: 'independent within-physical-page Fisher-Yates; page rune histograms and all layout boundaries fixed',
      primary: 'any of the same 267 page/phase windows has header equality AND footer byte=45',
      secondary: 'exact original 15-bit overflow signature, tracked separately and intersected with primary',
    },
    original,
    plantedPositive: {
      phase: 1,
      primary: planted.primary,
      exactFlags: planted.exactFlags,
      strict: planted.strict,
      firstByte: planted.firstByte,
      precedingRune: plant[0],
      lastByte: planted.lastByte,
      exactOverflowBits: planted.flags,
      wrongPhase0Primary: scanWindow(plant, 0).primary,
    },
    matchedNull: {
      familywisePrimary,
      familywisePrimaryRate: familywisePrimary / TRIALS,
      primaryAtLeastOriginalCount,
      primaryAtLeastOriginalRate: primaryAtLeastOriginalCount / TRIALS,
      meanPrimaryHitsPerBook: totalPrimaryHits / TRIALS,
      primaryHitHistogram: sortedHistogram(primaryHitHistogram),
      familywiseExactFlags,
      familywiseExactFlagsRate: familywiseExactFlags / TRIALS,
      exactAtLeastOriginalCount,
      exactAtLeastOriginalRate: exactAtLeastOriginalCount / TRIALS,
      meanExactFlagHitsPerBook: totalExactFlagHits / TRIALS,
      exactHitHistogram: sortedHistogram(exactHitHistogram),
      familywiseStrict,
      familywiseStrictRate: familywiseStrict / TRIALS,
      strictAtLeastOriginalCount,
      strictAtLeastOriginalRate: strictAtLeastOriginalCount / TRIALS,
      meanStrictHitsPerBook: totalStrictHits / TRIALS,
      strictHitHistogram: sortedHistogram(strictHitHistogram),
    },
    conclusion: 'familywise discovery-aware calibration only; no plaintext or key',
  }, null, 2));
}

main();
