'use strict';

/**
 * Director #1549: p55 5-rune -> 24-bit serialization robustness.
 *
 * Frozen from #1525:
 * - phase1 p55 alignment;
 * - 75 runes as fifteen quintets;
 * - quotient/carry q=floor(v/2^24), low24 remainder;
 * - 45-byte decoded frame;
 * - primary framing event = first byte equals preceding GP29 rune index AND
 *   last byte equals 45;
 * - exact same 267 page/phase windows;
 * - page-histogram-preserving Fisher-Yates matched null.
 *
 * Only four predeclared serializers vary:
 * - rune digits forward/reversed within each quintet;
 * - low24 output bytes big-endian/little-endian.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */
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
const GROUPS = 15;
const TRIALS = 20000;
const SEED = 0x1549A06;

const SERIALIZERS = [
  {name: 'forward-runes / big-endian-bytes', reverseRunes: false, littleEndian: false},
  {name: 'forward-runes / little-endian-bytes', reverseRunes: false, littleEndian: true},
  {name: 'reversed-runes / big-endian-bytes', reverseRunes: true, littleEndian: false},
  {name: 'reversed-runes / little-endian-bytes', reverseRunes: true, littleEndian: true},
];

/**
 * @param {number[]} digits
 * @param {number} start
 * @param {boolean} reverseRunes
 * @returns {number}
 */
function quintetValueAt(digits, start, reverseRunes) {
  let value = 0;
  for (let j = 0; j < 5; j += 1) {
    const offset = reverseRunes ? 4 - j : j;
    value = value * RADIX + digits[start + offset];
  }
  return value;
}

/** @param {number} lower @param {boolean} littleEndian @returns {number[]} */
function bytesFromLow24(lower, littleEndian) {
  const big = [(lower >>> 16) & 255, (lower >>> 8) & 255, lower & 255];
  return littleEndian ? big.reverse() : big;
}

/**
 * @param {number[]} page
 * @param {number} phase
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function scanWindow(page, phase, serializer) {
  assert.ok(page.length >= phase + PACKET_RUNES);
  const frame = [];
  let flags = '';

  for (let group = 0; group < GROUPS; group += 1) {
    const value = quintetValueAt(
      page,
      phase + group * 5,
      serializer.reverseRunes
    );
    const flag = Number(value >= LIMIT);
    const lower = value - flag * LIMIT;
    flags += String(flag);
    frame.push(...bytesFromLow24(lower, serializer.littleEndian));
  }

  assert.equal(frame.length, PACKET_BYTES);
  const header = phase > 0 && frame[0] === page[phase - 1];
  const footer = frame[PACKET_BYTES - 1] === PACKET_BYTES;
  return {header, footer, primary: header && footer, flags, frame};
}

/**
 * Fast endpoint-only primary test used inside the matched-null loop.
 * @param {number[]} page
 * @param {number} phase
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function primaryAt(page, phase, serializer) {
  if (phase === 0) return false;
  const firstValue = quintetValueAt(page, phase, serializer.reverseRunes);
  const lastValue = quintetValueAt(
    page,
    phase + PACKET_RUNES - 5,
    serializer.reverseRunes
  );
  const firstLower = firstValue - Number(firstValue >= LIMIT) * LIMIT;
  const lastLower = lastValue - Number(lastValue >= LIMIT) * LIMIT;
  const firstBytes = bytesFromLow24(firstLower, serializer.littleEndian);
  const lastBytes = bytesFromLow24(lastLower, serializer.littleEndian);
  return firstBytes[0] === page[phase - 1] &&
    lastBytes[2] === PACKET_BYTES;
}

/**
 * @param {number[][]} pages
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function scanBook(pages, serializer) {
  let eligible = 0;
  const primaryWindows = [];
  for (let pageNumber = 0; pageNumber < pages.length; pageNumber += 1) {
    const page = pages[pageNumber];
    for (let phase = 0; phase < 5; phase += 1) {
      if (page.length < phase + PACKET_RUNES) continue;
      eligible++;
      if (primaryAt(page, phase, serializer)) {
        primaryWindows.push({page: pageNumber, phase});
      }
    }
  }
  return {eligible, primaryHits: primaryWindows.length, primaryWindows};
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

/** @param {() => number} nextU32 @param {number} bound */
function randomInt(nextU32, bound) {
  const range = 0x100000000;
  const limit = range - (range % bound);
  let value;
  do value = nextU32(); while (value >= limit);
  return value % bound;
}

/** @param {number[]} source @param {() => number} nextU32 */
function shuffledPage(source, nextU32) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(nextU32, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Encode one output-byte triple and carry bit to source runes under one
 * serializer. This is used only as an independent power control.
 * @param {number[]} outputBytes
 * @param {number} flag
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function encodeGroup(outputBytes, flag, serializer) {
  assert.equal(outputBytes.length, 3);
  const big = serializer.littleEndian ? outputBytes.slice().reverse() : outputBytes;
  const lower = (big[0] << 16) + (big[1] << 8) + big[2];
  const value = flag * LIMIT + lower;
  assert.ok(value < MAX);

  const digits = Array(5);
  let remaining = value;
  for (let i = 4; i >= 0; i -= 1) {
    digits[i] = remaining % RADIX;
    remaining = Math.floor(remaining / RADIX);
  }
  assert.equal(remaining, 0);
  return serializer.reverseRunes ? digits.reverse() : digits;
}

/**
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function plantedPage(serializer) {
  const preceding = 21;
  const frame = Array.from(
    {length: PACKET_BYTES},
    (_, i) => (17 + 37 * i) & 255
  );
  frame[0] = preceding;
  frame[PACKET_BYTES - 1] = PACKET_BYTES;

  const body = [];
  for (let group = 0; group < GROUPS; group += 1) {
    const triple = frame.slice(group * 3, group * 3 + 3);
    body.push(...encodeGroup(triple, 0, serializer));
  }
  assert.equal(body.length, PACKET_RUNES);
  return [preceding, ...body];
}

function main() {
  const pages = corpus.pages.slice(0, 56).map((page) => page.indices.slice());

  const original = SERIALIZERS.map((serializer) => {
    const census = scanBook(pages, serializer);
    assert.equal(census.eligible, 267);

    const p55 = scanWindow(pages[55], 1, serializer);
    const plant = plantedPage(serializer);
    const recoveredPlant = scanWindow(plant, 1, serializer);
    assert.equal(recoveredPlant.primary, true);
    assert.equal(recoveredPlant.frame[0], plant[0]);
    assert.equal(recoveredPlant.frame[PACKET_BYTES - 1], PACKET_BYTES);
    assert.equal(scanWindow(plant, 0, serializer).primary, false);

    return {
      ...serializer,
      ...census,
      p55Phase1: {
        firstByte: p55.frame[0],
        lastByte: p55.frame[PACKET_BYTES - 1],
        flags: p55.flags,
        frameHex: Buffer.from(p55.frame).toString('hex'),
        primary: p55.primary,
      },
      plantedPositive: {
        exactPrimaryDetected: recoveredPlant.primary,
        wrongPhase0Primary: scanWindow(plant, 0, serializer).primary,
      },
    };
  });

  /* Exact #1525 reproduction for the originally chosen serializer. */
  assert.deepEqual(original[0].primaryWindows, [{page: 55, phase: 1}]);
  assert.equal(
    original[0].p55Phase1.frameHex,
    '15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d'
  );
  assert.equal(original[0].p55Phase1.flags, '100100000000000');

  const nextU32 = xorshift32(SEED);
  const nulls = SERIALIZERS.map(() => ({
    familywiseBooks: 0,
    totalPrimaryHits: 0,
    hitHistogram: new Map(),
  }));

  for (let trial = 0; trial < TRIALS; trial += 1) {
    const shuffled = pages.map((page) => shuffledPage(page, nextU32));

    for (let s = 0; s < SERIALIZERS.length; s += 1) {
      const result = scanBook(shuffled, SERIALIZERS[s]);
      const hits = result.primaryHits;
      if (hits > 0) nulls[s].familywiseBooks++;
      nulls[s].totalPrimaryHits += hits;
      nulls[s].hitHistogram.set(
        hits,
        (nulls[s].hitHistogram.get(hits) || 0) + 1
      );
    }
  }

  const matchedNull = nulls.map((entry, s) => ({
    name: SERIALIZERS[s].name,
    familywiseBooks: entry.familywiseBooks,
    familywiseRate: entry.familywiseBooks / TRIALS,
    meanPrimaryHitsPerBook: entry.totalPrimaryHits / TRIALS,
    hitHistogram: Object.fromEntries(
      [...entry.hitHistogram.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([hits, count]) => [String(hits), count])
    ),
  }));

  const originalHitSerializers = original
    .filter((entry) => entry.primaryHits > 0)
    .map((entry) => ({
      name: entry.name,
      primaryHits: entry.primaryHits,
      primaryWindows: entry.primaryWindows,
    }));

  console.log(JSON.stringify({
    status: 'PASS',
    protocol: {
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      eligibleWindowsPerBook: 267,
      fixedPrimary: 'phase>0 first decoded byte = preceding GP29 index AND final decoded byte = 45',
      null: 'independent within-page Fisher-Yates, exact page histograms and source layout fixed',
      family: 'rune digits forward/reversed x low24 bytes big/little endian',
    },
    original,
    originalHitSerializers,
    matchedNull,
    decision: originalHitSerializers.length === 1 &&
      originalHitSerializers[0].name === SERIALIZERS[0].name
      ? 'original serializer is uniquely selected within the four frozen canonical conventions'
      : 'serialization remains underselected within the four frozen canonical conventions',
  }, null, 2));
}

main();
