'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'),
  'utf8'
);

const RADIX = 29;
const LIMIT = 2 ** 24;
const PACKET_RUNES = 75;
const PACKET_BYTES = 45;
const EXACT_FLAGS = '100100000000000';
const TRIALS = 100000;
const SEED = 0x1617A1;

/**
 * Compute one big-endian base-29 quintet.
 * @param {number[]} digits
 * @param {number} start
 * @returns {number}
 */
function quintetValueAt(digits, start) {
  let value = 0;
  for (let i = 0; i < 5; i += 1) {
    value = value * RADIX + digits[start + i];
  }
  return value;
}

/**
 * Apply the exact #1525 framing predicate at one fixed page-local start.
 * @param {number[]} pageRunes
 * @param {number} start
 * @returns {{primary:boolean,firstByte:number|null,lastByte:number|null}}
 */
function scanWindow(pageRunes, start) {
  if (start <= 0 || pageRunes.length < start + PACKET_RUNES) {
    return { primary: false, firstByte: null, lastByte: null };
  }

  const firstValue = quintetValueAt(pageRunes, start);
  const firstLower = firstValue - Number(firstValue >= LIMIT) * LIMIT;
  const lastValue = quintetValueAt(pageRunes, start + 70);
  const lastLower = lastValue - Number(lastValue >= LIMIT) * LIMIT;
  const firstByte = (firstLower >>> 16) & 255;
  const lastByte = lastLower & 255;

  return {
    primary: firstByte === pageRunes[start - 1] && lastByte === PACKET_BYTES,
    firstByte,
    lastByte,
  };
}

/**
 * Convert transcription-rune page index to physical LP2 page index.
 * Physical p50 is the rune-free numeric table and is absent from the transcription.
 * @param {number} runePage
 * @returns {number}
 */
function physicalPage(runePage) {
  return runePage >= 50 ? runePage + 1 : runePage;
}

/**
 * Derive one source-selected start per rune-bearing physical page:
 * the first rune of the first word wholly local to the page after any carried prefix.
 * This equals the carried-rune count at that page start.
 * @returns {Map<number, number>}
 */
function deriveSelectedStarts() {
  const runePattern = /[\u16A0-\u16FF]/u;
  const segments = transcription.split('%').slice(0, 55);
  const stream = segments.join('%');

  /** @type {Array<Array<{rune:string,page:number}>>} */
  const words = [];
  /** @type {Array<{rune:string,page:number}>} */
  let current = [];
  let page = 0;

  function finish() {
    if (!current.length) return;
    words.push(current);
    current = [];
  }

  for (const character of stream) {
    if (runePattern.test(character)) {
      current.push({ rune: character, page });
    } else if (character === '%') {
      page += 1;
    } else if (character === '/' || /\s/u.test(character)) {
      // Printed wrapping does not terminate a canonical word.
    } else {
      finish();
    }
  }
  finish();

  const starts = new Map([[0, 0]]);
  const histogram = {};

  for (let runePage = 1; runePage < segments.length; runePage += 1) {
    const crossing = words.find((word) =>
      word[0].page < runePage && word.some((site) => site.page === runePage)
    );
    const carryRunes = crossing
      ? crossing.filter((site) => site.page === runePage).length
      : 0;
    starts.set(physicalPage(runePage), carryRunes);
    histogram[carryRunes] = (histogram[carryRunes] || 0) + 1;
  }

  assert.deepEqual(histogram, {
    0: 22,
    1: 9,
    2: 12,
    3: 3,
    4: 2,
    5: 4,
    6: 1,
    7: 1,
  });

  return starts;
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
 * Draw an unbiased integer in [0, bound).
 * @param {() => number} nextU32
 * @param {number} bound
 * @returns {number}
 */
function randomInt(nextU32, bound) {
  assert.ok(Number.isInteger(bound) && bound > 0);
  const range = 0x100000000;
  const limit = range - (range % bound);
  let value;
  do value = nextU32(); while (value >= limit);
  return value % bound;
}

/**
 * Draw the eleven page symbols that completely determine the frozen predicate:
 * preceding rune, first quintet, and last quintet.
 *
 * Under a uniform within-page Fisher-Yates shuffle, any eleven distinct target
 * positions have the same ordered distribution as the first eleven positions of
 * a random permutation. Sampling these eleven positions without replacement is
 * therefore exactly distribution-equivalent to shuffling the full page for this
 * predicate, while avoiding irrelevant work.
 *
 * @param {number[]} pageRunes
 * @param {() => number} nextU32
 * @returns {number[]}
 */
function drawRelevantEleven(pageRunes, nextU32) {
  const length = pageRunes.length;
  const swaps = new Map();
  const out = Array(11);

  for (let i = 0; i < 11; i += 1) {
    const j = i + randomInt(nextU32, length - i);
    const valueJ = swaps.has(j) ? swaps.get(j) : pageRunes[j];
    const valueI = swaps.has(i) ? swaps.get(i) : pageRunes[i];
    out[i] = valueJ;
    swaps.set(j, valueI);
  }

  return out;
}

/**
 * Apply the frozen predicate to the eleven distribution-equivalent sampled symbols.
 * @param {number[]} values
 * @returns {boolean}
 */
function primaryFromRelevantEleven(values) {
  assert.equal(values.length, 11);
  const preceding = values[0];

  let firstValue = 0;
  for (let i = 1; i <= 5; i += 1) {
    firstValue = firstValue * RADIX + values[i];
  }

  let lastValue = 0;
  for (let i = 6; i <= 10; i += 1) {
    lastValue = lastValue * RADIX + values[i];
  }

  const firstLower = firstValue - Number(firstValue >= LIMIT) * LIMIT;
  const lastLower = lastValue - Number(lastValue >= LIMIT) * LIMIT;
  const firstByte = (firstLower >>> 16) & 255;
  const lastByte = lastLower & 255;

  return firstByte === preceding && lastByte === PACKET_BYTES;
}

/**
 * Encode one exact five-rune group for the existing #1525 inverse plant.
 * @param {number[]} bytes
 * @param {number} flag
 * @returns {number[]}
 */
function encodeGroup(bytes, flag) {
  assert.equal(bytes.length, 3);
  assert.ok(flag === 0 || flag === 1);

  const lower = (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
  let value = flag * LIMIT + lower;
  assert.ok(value < RADIX ** 5);

  const digits = Array(5);
  for (let i = 4; i >= 0; i -= 1) {
    digits[i] = value % RADIX;
    value = Math.floor(value / RADIX);
  }
  assert.equal(value, 0);
  return digits;
}

/**
 * Recreate the exact independent phase1 positive from #1525.
 * @returns {number[]}
 */
function plantedPage() {
  const preceding = 21;
  const bytes = Array.from(
    { length: PACKET_BYTES },
    (_, index) => (17 + 37 * index) & 255
  );
  bytes[0] = preceding;
  bytes[9] = 11;
  bytes[10] = 22;
  bytes[11] = 33;
  bytes[PACKET_BYTES - 1] = PACKET_BYTES;

  const body = [];
  [...EXACT_FLAGS].map(Number).forEach((flag, group) => {
    body.push(...encodeGroup(bytes.slice(group * 3, group * 3 + 3), flag));
  });

  assert.equal(body.length, PACKET_RUNES);
  return [preceding, ...body];
}

function main() {
  const starts = deriveSelectedStarts();
  const pages = corpus.pages.slice(0, 56).map((page) => page.indices.slice());

  const selected = [];
  for (let page = 0; page < 56; page += 1) {
    if (!pages[page].length) continue;
    const start = starts.get(page) ?? 0;
    const eligible = pages[page].length >= start + PACKET_RUNES;
    const result = eligible
      ? scanWindow(pages[page], start)
      : { primary: false, firstByte: null, lastByte: null };

    selected.push({
      page,
      start,
      runeCount: pages[page].length,
      eligible,
      ...result,
    });
  }

  const eligible = selected.filter((item) => item.eligible);
  const originalHits = eligible.filter((item) => item.primary);
  const nullPages = eligible
    .filter((item) => item.start > 0)
    .map((item) => ({ page: item.page, runes: pages[item.page] }));

  assert.equal(selected.length, 55);
  assert.equal(eligible.length, 54);
  assert.equal(nullPages.length, 31);
  assert.deepEqual(originalHits, [{
    page: 55,
    start: 1,
    runeCount: 76,
    eligible: true,
    primary: true,
    firstByte: 21,
    lastByte: 45,
  }]);

  const plant = plantedPage();
  const planted = scanWindow(plant, 1);
  assert.deepEqual(planted, { primary: true, firstByte: 21, lastByte: 45 });
  assert.equal(scanWindow(plant, 0).primary, false);

  const nextU32 = xorshift32(SEED);
  let familywiseHits = 0;
  const hitHistogram = new Map();
  const perPageHits = new Map(nullPages.map(({ page }) => [page, 0]));

  for (let trial = 0; trial < TRIALS; trial += 1) {
    let hits = 0;

    for (const item of nullPages) {
      if (primaryFromRelevantEleven(drawRelevantEleven(item.runes, nextU32))) {
        hits += 1;
        perPageHits.set(item.page, perPageHits.get(item.page) + 1);
      }
    }

    if (hits > 0) familywiseHits += 1;
    hitHistogram.set(hits, (hitHistogram.get(hits) || 0) + 1);
  }

  assert.equal(familywiseHits, 78);
  assert.deepEqual(
    Object.fromEntries([...hitHistogram.entries()].sort((a, b) => a[0] - b[0])),
    { 0: 99922, 1: 78 }
  );

  console.log(JSON.stringify({
    status: 'PASS',
    protocol: {
      trials: TRIALS,
      seed: `0x${SEED.toString(16)}`,
      selectedStart:
        'first rune of first complete word wholly local to each physical page after any carried prefix',
      null:
        'independent within-page histogram-preserving shuffle; fixed selected starts; exact eleven-position ordered sampling',
      predicate:
        'same #1525 big-endian 5xGP29->low24 framing: first byte echoes preceding GP29 index and last byte equals 45',
    },
    selected,
    eligibleCount: eligible.length,
    eligiblePositiveStartCount: nullPages.length,
    originalHits,
    plantedPositive: {
      phase: 1,
      primary: planted.primary,
      firstByte: planted.firstByte,
      precedingRune: plant[0],
      lastByte: planted.lastByte,
      wrongPhase0Primary: scanWindow(plant, 0).primary,
    },
    matchedNull: {
      familywiseHits,
      familywiseRate: familywiseHits / TRIALS,
      hitHistogram: Object.fromEntries(
        [...hitHistogram.entries()].sort((a, b) => a[0] - b[0])
      ),
      perPageHits: Object.fromEntries(
        [...perPageHits.entries()].sort((a, b) => a[0] - b[0])
      ),
    },
    conclusion:
      'p55 remains the sole source-selected original hit; the narrowed matched-null familywise rate is 0.00078. No plaintext, key, or historical serializer is recovered.',
  }, null, 2));
}

main();
