'use strict';

/**
 * Director #1549: frozen four-way serializer robustness gate for the p55
 * quintet framing candidate.
 *
 * Family:
 *   - rune digits within each quintet: forward or reversed;
 *   - each 24-bit remainder's three output bytes: big-endian or little-endian.
 *
 * Everything else is inherited unchanged from #1525: phase family, 75-rune
 * windows, 45-byte packet, quotient/carry rule, header/footer equalities,
 * 267-window census, matched page-histogram-preserving null and PRNG seed.
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
const PACKET_RUNES = 75;
const PACKET_BYTES = 45;
const TRIALS = 20000;
const SEED = 0x1525A25;

const SERIALIZERS = [
  {name: 'forward-big', reverseRunes: false, littleEndian: false},
  {name: 'forward-little', reverseRunes: false, littleEndian: true},
  {name: 'reverse-big', reverseRunes: true, littleEndian: false},
  {name: 'reverse-little', reverseRunes: true, littleEndian: true},
];

/**
 * Interpret one five-rune group as a base29 integer.
 * @param {number[]} page
 * @param {number} start
 * @param {boolean} reverseRunes
 * @returns {number}
 */
function quintetValueAt(page, start, reverseRunes) {
  let value = 0;
  if (reverseRunes) {
    for (let i = 4; i >= 0; i -= 1) value = value * RADIX + page[start + i];
  } else {
    for (let i = 0; i < 5; i += 1) value = value * RADIX + page[start + i];
  }
  return value;
}

/**
 * Split the exact quotient/remainder transport and emit one three-byte group.
 * @param {number} value
 * @param {boolean} littleEndian
 * @returns {{flag:number, bytes:number[]}}
 */
function emitGroup(value, littleEndian) {
  const flag = Math.floor(value / LIMIT);
  const lower = value - flag * LIMIT;
  assert.ok(flag === 0 || flag === 1);
  const bytes = [
    (lower >>> 16) & 255,
    (lower >>> 8) & 255,
    lower & 255,
  ];
  if (littleEndian) bytes.reverse();
  return {flag, bytes};
}

/**
 * Primary framing event only. The same two equalities from #1525 are checked:
 * emitted first byte equals the immediately preceding GP29 rune, and emitted
 * final byte equals 45.
 *
 * @param {number[]} page
 * @param {number} phase
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function primaryAt(page, phase, serializer) {
  assert.ok(page.length >= phase + PACKET_RUNES);

  const firstValue = quintetValueAt(page, phase, serializer.reverseRunes);
  const lastValue = quintetValueAt(
    page,
    phase + PACKET_RUNES - 5,
    serializer.reverseRunes
  );
  const firstBytes = emitGroup(firstValue, serializer.littleEndian).bytes;
  const lastBytes = emitGroup(lastValue, serializer.littleEndian).bytes;

  const header = phase > 0 && firstBytes[0] === page[phase - 1];
  const footer = lastBytes[2] === PACKET_BYTES;
  return {
    firstByte: firstBytes[0],
    lastByte: lastBytes[2],
    header,
    footer,
    primary: header && footer,
  };
}

/**
 * Full 15-group frame for exact source inspection and inverse checks.
 * @param {number[]} page
 * @param {number} phase
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function frameAt(page, phase, serializer) {
  const bytes = [];
  let flags = '';
  for (let group = 0; group < 15; group += 1) {
    const value = quintetValueAt(
      page,
      phase + group * 5,
      serializer.reverseRunes
    );
    const emitted = emitGroup(value, serializer.littleEndian);
    flags += String(emitted.flag);
    bytes.push(...emitted.bytes);
  }
  assert.equal(bytes.length, PACKET_BYTES);
  return {bytes, flags, ...primaryAt(page, phase, serializer)};
}

/**
 * Exact 267-window scan.
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
      eligible += 1;
      if (primaryAt(page, phase, serializer).primary) {
        primaryWindows.push({page: pageNumber, phase});
      }
    }
  }

  return {
    eligible,
    primaryHits: primaryWindows.length,
    primaryWindows,
  };
}

/** @param {number} seed */
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
 * Encode one desired emitted 3-byte group under one frozen serializer.
 * Uses carry flag zero because any 24-bit value is valid under 29^5.
 *
 * @param {number[]} emittedBytes
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function encodeGroup(emittedBytes, serializer) {
  assert.equal(emittedBytes.length, 3);
  const raw = emittedBytes.slice();
  if (serializer.littleEndian) raw.reverse();

  let value = (raw[0] << 16) + (raw[1] << 8) + raw[2];
  const digits = new Array(5);
  for (let i = 4; i >= 0; i -= 1) {
    digits[i] = value % RADIX;
    value = Math.floor(value / RADIX);
  }
  assert.equal(value, 0);
  if (serializer.reverseRunes) digits.reverse();
  return digits;
}

/**
 * Independent exact primary-event plant for one serializer.
 * @param {{reverseRunes:boolean,littleEndian:boolean}} serializer
 */
function plantedPage(serializer) {
  const preceding = 21;
  const bytes = Array.from(
    {length: PACKET_BYTES},
    (_, i) => (37 * i + 19) & 255
  );
  bytes[0] = preceding;
  bytes[PACKET_BYTES - 1] = PACKET_BYTES;

  const body = [];
  for (let group = 0; group < 15; group += 1) {
    body.push(...encodeGroup(
      bytes.slice(group * 3, group * 3 + 3),
      serializer
    ));
  }
  assert.equal(body.length, PACKET_RUNES);
  return [preceding, ...body];
}

function main() {
  const pages = corpus.pages.slice(0, 56).map((page) => page.indices.slice());
  assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 12956);

  const originals = {};
  const plants = {};

  for (const serializer of SERIALIZERS) {
    const scanned = scanBook(pages, serializer);
    assert.equal(scanned.eligible, 267);
    originals[serializer.name] = {
      ...scanned,
      p55Phase1: frameAt(pages[55], 1, serializer),
    };

    const plant = plantedPage(serializer);
    const decoded = frameAt(plant, 1, serializer);
    assert.equal(decoded.primary, true);
    assert.equal(decoded.firstByte, plant[0]);
    assert.equal(decoded.lastByte, PACKET_BYTES);
    plants[serializer.name] = {
      primary: decoded.primary,
      firstByte: decoded.firstByte,
      precedingRune: plant[0],
      lastByte: decoded.lastByte,
      flags: decoded.flags,
    };
  }

  assert.deepEqual(
    originals['forward-big'].primaryWindows,
    [{page: 55, phase: 1}]
  );
  assert.equal(originals['forward-little'].primaryHits, 0);
  assert.equal(originals['reverse-big'].primaryHits, 0);
  assert.equal(originals['reverse-little'].primaryHits, 0);
  assert.equal(
    Buffer.from(originals['forward-big'].p55Phase1.bytes).toString('hex'),
    '15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d'
  );
  assert.equal(
    originals['forward-big'].p55Phase1.flags,
    '100100000000000'
  );

  /*
   * Same shuffled books and same PRNG seed as #1525. Scanning all serializers
   * consumes no RNG, so forward-big must reproduce 118/20,000 exactly.
   */
  const nextU32 = xorshift32(SEED);
  const nulls = Object.fromEntries(SERIALIZERS.map((serializer) => [
    serializer.name,
    {
      familywisePrimary: 0,
      totalPrimaryHits: 0,
      hitHistogram: new Map(),
    },
  ]));

  for (let trial = 0; trial < TRIALS; trial += 1) {
    const shuffled = pages.map((page) => shuffledPage(page, nextU32));

    for (const serializer of SERIALIZERS) {
      const result = scanBook(shuffled, serializer);
      const out = nulls[serializer.name];
      if (result.primaryHits > 0) out.familywisePrimary += 1;
      out.totalPrimaryHits += result.primaryHits;
      out.hitHistogram.set(
        result.primaryHits,
        (out.hitHistogram.get(result.primaryHits) || 0) + 1
      );
    }
  }

  const matchedNull = {};
  for (const serializer of SERIALIZERS) {
    const raw = nulls[serializer.name];
    matchedNull[serializer.name] = {
      familywisePrimary: raw.familywisePrimary,
      familywisePrimaryRate: raw.familywisePrimary / TRIALS,
      meanPrimaryHitsPerBook: raw.totalPrimaryHits / TRIALS,
      hitHistogram: Object.fromEntries(
        [...raw.hitHistogram.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([count, books]) => [String(count), books])
      ),
    };
  }

  assert.equal(matchedNull['forward-big'].familywisePrimary, 118);

  console.log(JSON.stringify({
    status: 'PASS',
    protocol: {
      trials: TRIALS,
      seed: '0x' + SEED.toString(16),
      serializers: SERIALIZERS,
      frozenEvent: 'same 267-window header equality AND footer byte=45 as #1525',
      null: 'same within-physical-page Fisher-Yates books as #1525; page rune histograms and all layout boundaries fixed',
    },
    originals,
    plantedPositives: plants,
    matchedNull,
    decision: originals['forward-big'].primaryHits === 1 &&
      SERIALIZERS.slice(1).every(
        (serializer) => originals[serializer.name].primaryHits === 0
      )
      ? 'original forward-big serializer is uniquely selected inside the frozen four-way family'
      : 'serialization family remains underselected',
  }, null, 2));
}

main();
