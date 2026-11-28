'use strict';

/**
 * Source-frozen terminal composition:
 *   solved p56 plaintext || clear p57 -> 76 ordinal-wheel carry positions;
 *   shed p50 circumference -> 30x6 inner register (180 cells);
 *   select inner cells at those 76 carry positions;
 *   use selected values as the complete p55 key under the historically
 *   attested GP29 additive family, with source-era XOR as an alphabet gate.
 *
 * Also tests the actual p54||p55 308-rune chapter clock, where p55 begins
 * at key phase 232 mod 76 = 4.
 *
 * Run from repository root:
 *   node sims/lp2_terminal180_carrypos_inner180_p55_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));

const mod = (x, n = 29) => ((x % n) + n) % n;
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} words @returns {number[]} */
function toGp(words) {
  const source = words.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < source.length;) {
    if (source[i] === ' ') {
      i++;
      continue;
    }
    if (source.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (source.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const hit = tokens.find(({ s }) => source.startsWith(s, i));
    assert.ok(hit, 'No GP token at ' + source.slice(i));
    out.push(hit.i);
    i += hit.s.length;
  }
  return out;
}

/** @param {number[]} source */
function carryEvents(source) {
  let wheel = 0;
  const events = [];
  for (let i = 0; i < source.length; i++) {
    const before = wheel;
    const total = wheel + source[i];
    wheel = total % 29;
    if (total >= 29) {
      events.push({
        pos: i,
        trigger: source[i],
        before,
        after: wheel,
        primeTrigger: gp.prime[source[i]] % 29,
      });
    }
  }
  assert.equal(wheel, 0);
  return events;
}

/** @param {number[]} runes */
function scaledIoC(runes) {
  const hist = Array(29).fill(0);
  for (const rune of runes) hist[rune]++;
  return 29 * hist.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

/** @param {number[]} cipher @param {number[]} key @param {-1|1} sign */
function additiveDecode(cipher, key, sign) {
  return cipher.map((c, i) => mod(c + sign * key[i % key.length]));
}

/** @param {number[]} plain @param {number[]} key @param {-1|1} sign */
function additiveEncode(plain, key, sign) {
  return plain.map((p, i) => mod(p - sign * key[i % key.length]));
}

/** @param {number[]} a @param {number[]} b */
function bestShift(a, b) {
  const counts = Array(29).fill(0);
  for (let i = 0; i < a.length; i++) counts[mod(a[i] - b[i])]++;
  const best = Math.max(...counts);
  return { shift: counts.indexOf(best), matches: best };
}

const p56Words =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56 = toGp(p56Words);
const p57 = gp.pages.find(({ page }) => page === 57).indices;
const terminal = p56.concat(p57);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(terminal.length, 180);
assert.equal(terminal.reduce((sum, x) => sum + x, 0), 2204);

const events = carryEvents(terminal);
assert.equal(events.length, 76);

const innerTokens = grid.rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
const inner60 = grid.byte_rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
assert.equal(innerTokens.length, 180);
assert.equal(inner60.length, 180);

const alphabet59 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
assert.equal(alphabet59.length, 59);
const inner59 = innerTokens.map((token) => {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, 'Token outside drop-f base59: ' + token);
  return 59 * hi + lo;
});

const p54 = gp.pages.find(({ page }) => page === 54).indices;
const p55 = gp.pages.find(({ page }) => page === 55).indices;
const chapter = p54.concat(p55);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(chapter.length, 308);
assert.equal(232 % 76, 4);

const selected = {
  base60: events.map(({ pos }) => inner60[pos]),
  base59: events.map(({ pos }) => inner59[pos]),
};
for (const values of Object.values(selected)) assert.equal(values.length, 76);

const direct = [];
const chapterResults = [];
const eventCorrespondence = [];

for (const [radix, bytes] of Object.entries(selected)) {
  const key = bytes.map((value) => value % 29);

  for (const sign of /** @type {const} */ ([-1, 1])) {
    const p55Plain = additiveDecode(p55, key, sign);
    assert.deepEqual(additiveEncode(p55Plain, key, sign), p55);
    direct.push({
      radix,
      sign,
      scaledIoC: scaledIoC(p55Plain),
      first24: p55Plain.slice(0, 24).map((i) => gp.translit[i]).join(' '),
    });

    const chapterPlain = additiveDecode(chapter, key, sign);
    assert.deepEqual(additiveEncode(chapterPlain, key, sign), chapter);
    chapterResults.push({
      radix,
      sign,
      scaledIoC: scaledIoC(chapterPlain),
      p55Phase: p54.length % 76,
      p54First40: chapterPlain.slice(0, 40).map((i) => gp.translit[i]).join(' '),
      p55First40: chapterPlain.slice(232, 272).map((i) => gp.translit[i]).join(' '),
    });

    // Mechanism-positive: the same frozen key recovers a native solved tail.
    const planted = p57.slice(0, 76);
    const plantedCipher = additiveEncode(planted, key, sign);
    assert.deepEqual(additiveDecode(plantedCipher, key, sign), planted);
  }

  const xor = p55.map((c, i) => c ^ (bytes[i] & 31));
  direct.push({
    radix,
    operation: 'xor-low5',
    nativeGp: xor.filter((x) => x < 29).length,
    invalidPositions: xor.flatMap((x, i) => x >= 29 ? [i] : []),
  });

  const residue = bytes.map((x) => x % 29);
  const exact = {};
  const shifts = {};
  for (const field of ['trigger', 'before', 'after', 'primeTrigger']) {
    const source = events.map((event) => event[field]);
    exact[field] = residue.filter((x, i) => x === source[i]).length;
    shifts[field] = bestShift(residue, source);
  }
  eventCorrespondence.push({ radix, exact, shifts });
}

assert.deepEqual(
  direct.filter((x) => x.operation === 'xor-low5').map((x) => x.nativeGp),
  [69, 69]
);
assert.deepEqual(
  chapterResults.map((x) => Number(x.scaledIoC.toFixed(12))),
  [0.996150429375, 0.977748635729, 0.994923643132, 1.004737933077]
);

console.log(JSON.stringify({
  status: 'PASS: carry-position-selected inner-table p55 receiver is source-frozen and negative under direct GP29/XOR consumers',
  source: {
    terminalRunes: terminal.length,
    terminalOrdinalSum: 2204,
    carries: events.length,
    carryPositions: events.map(({ pos }) => pos),
    innerCells: inner60.length,
    selectedCells: 76,
    p55Runes: p55.length,
    chapterRunes: chapter.length,
    p55ChapterKeyPhase: p54.length % 76,
  },
  selected,
  direct,
  eventCorrespondence,
  chapterResults,
}, null, 2));


/**
 * Second source-frozen bridge: the same 76 carry positions partition the
 * 180-cell interior into 76 consecutive intervals. Collapse each interval by
 * GP29 residue-sum and compare it directly with the 76-cell circumference.
 * Also sample the cumulative interior sum at each carry endpoint.
 *
 * This is an authentication test for the 180<->76 table architecture itself,
 * independent of p55 plaintext.
 */
function rimRowMajor(matrix) {
  const out = matrix[0].slice();
  for (let row = 1; row < 31; row++) out.push(matrix[row][0], matrix[row][7]);
  out.push(...matrix[31]);
  return out;
}

function rimClockwise(matrix) {
  const out = matrix[0].slice();
  for (let row = 1; row < 32; row++) out.push(matrix[row][7]);
  for (let col = 6; col >= 0; col--) out.push(matrix[31][col]);
  for (let row = 30; row >= 1; row--) out.push(matrix[row][0]);
  return out;
}

function compressIntervals(inner) {
  const out = [];
  let start = 0;
  for (const { pos } of events) {
    out.push(inner.slice(start, pos + 1).reduce((sum, x) => sum + x, 0) % 29);
    start = pos + 1;
  }
  assert.equal(start, 180);
  return out;
}

function prefixSamples(inner) {
  let running = 0;
  const all = inner.map((value) => {
    running = mod(running + value);
    return running;
  });
  return events.map(({ pos }) => all[pos]);
}

function directMatch(a, b) {
  return a.filter((value, i) => value === b[i]).length;
}

const matrix59 = grid.rows.map((row) => row.map((token) => {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return 59 * hi + lo;
}));

const intervalBridge = {};
for (const [radix, matrix, inner] of [
  ['base60', grid.byte_rows, inner60],
  ['base59', matrix59, inner59],
]) {
  const interval = compressIntervals(inner);
  const prefix = prefixSamples(inner);
  const rims = {
    rowMajor: rimRowMajor(matrix).map((x) => x % 29),
    clockwise: rimClockwise(matrix).map((x) => x % 29),
  };
  intervalBridge[radix] = {
    interval,
    prefix,
    exact: {
      intervalRowMajor: directMatch(interval, rims.rowMajor),
      intervalClockwise: directMatch(interval, rims.clockwise),
      prefixRowMajor: directMatch(prefix, rims.rowMajor),
      prefixClockwise: directMatch(prefix, rims.clockwise),
    },
    bestShift: {
      intervalRowMajor: bestShift(rims.rowMajor, interval),
      intervalClockwise: bestShift(rims.clockwise, interval),
      prefixRowMajor: bestShift(rims.rowMajor, prefix),
      prefixClockwise: bestShift(rims.clockwise, prefix),
    },
  };
}

assert.deepEqual(intervalBridge.base60.exact, {
  intervalRowMajor: 0,
  intervalClockwise: 2,
  prefixRowMajor: 1,
  prefixClockwise: 2,
});
assert.deepEqual(intervalBridge.base59.exact, {
  intervalRowMajor: 4,
  intervalClockwise: 2,
  prefixRowMajor: 3,
  prefixClockwise: 2,
});

console.log(JSON.stringify({
  status: 'PASS: carry-interval compression does not reproduce the p50 circumference under either documented radix',
  intervalLengths: events.map(({ pos }, i) => pos - (i ? events[i - 1].pos : -1)),
  intervalBridge,
}, null, 2));


/**
 * Third typed bridge: every terminal carry block has length 1..5 and GP-index
 * sum 6..52. A p50 base60 rim token is exactly two digits whose first digit is
 * 0..4 and second digit 0..59. Test the literal pair
 *   (block length - 1, block GP-index sum)
 * against the 76 rim tokens. This needs no radix ambiguity.
 */
const terminalBlocks = [];
let blockStart = 0;
for (const { pos } of events) {
  const values = terminal.slice(blockStart, pos + 1);
  terminalBlocks.push({
    lengthDigit: values.length - 1,
    sumDigit: values.reduce((sum, x) => sum + x, 0),
  });
  blockStart = pos + 1;
}
assert.equal(blockStart, 180);
assert.equal(terminalBlocks.length, 76);
assert.ok(terminalBlocks.every(({ lengthDigit, sumDigit }) =>
  lengthDigit >= 0 && lengthDigit <= 4 && sumDigit >= 0 && sumDigit < 60
));

function tokenDigits(token) {
  return [grid.alphabet.indexOf(token[0]), grid.alphabet.indexOf(token[1])];
}

const digitPairGate = {};
for (const [order, rimTokens] of Object.entries({
  rowMajor: rimRowMajor(grid.rows),
  clockwise: rimClockwise(grid.rows),
})) {
  let high = 0;
  let low = 0;
  let pair = 0;
  for (let i = 0; i < 76; i++) {
    const [hi, lo] = tokenDigits(rimTokens[i]);
    const block = terminalBlocks[i];
    if (hi === block.lengthDigit) high++;
    if (lo === block.sumDigit) low++;
    if (hi === block.lengthDigit && lo === block.sumDigit) pair++;
  }
  digitPairGate[order] = { high, low, pair };
}

assert.deepEqual(digitPairGate, {
  rowMajor: { high: 15, low: 0, pair: 0 },
  clockwise: { high: 23, low: 3, pair: 1 },
});

console.log(JSON.stringify({
  status: 'PASS: literal (carry-block length-1, block GP-sum) does not encode the p50 rim tokens',
  digitPairGate,
}, null, 2));


/**
 * Fourth typed bridge: use the terminal carry partition to compress all 180
 * p50 interior cells into 76 literal two-digit table tokens. The carry-block
 * length supplies high digit 0..4; the sum of the same-length interior block
 * modulo the active table radix supplies the low digit.
 */
function compressInteriorTokens(inner, radix) {
  let offset = 0;
  const out = terminalBlocks.map(({ lengthDigit }) => {
    const length = lengthDigit + 1;
    const low = inner.slice(offset, offset + length)
      .reduce((sum, value) => sum + value, 0) % radix;
    offset += length;
    return [lengthDigit, low];
  });
  assert.equal(offset, 180);
  return out;
}

const interiorTokenGate = {};
for (const [radix, base, inner, alphabet] of [
  ['base60', 60, inner60, grid.alphabet],
  ['base59', 59, inner59, alphabet59],
]) {
  const compressed = compressInteriorTokens(inner, base);
  const comparisons = {};
  for (const [order, rimTokens] of Object.entries({
    rowMajor: rimRowMajor(grid.rows),
    clockwise: rimClockwise(grid.rows),
  })) {
    let high = 0;
    let low = 0;
    let pair = 0;
    for (let i = 0; i < 76; i++) {
      const hi = alphabet.indexOf(rimTokens[i][0]);
      const lo = alphabet.indexOf(rimTokens[i][1]);
      assert.ok(hi >= 0 && lo >= 0);
      if (hi === compressed[i][0]) high++;
      if (lo === compressed[i][1]) low++;
      if (hi === compressed[i][0] && lo === compressed[i][1]) pair++;
    }
    comparisons[order] = { high, low, pair };
  }
  interiorTokenGate[radix] = comparisons;
}

assert.deepEqual(interiorTokenGate, {
  base60: {
    rowMajor: { high: 15, low: 1, pair: 1 },
    clockwise: { high: 23, low: 1, pair: 0 },
  },
  base59: {
    rowMajor: { high: 15, low: 1, pair: 1 },
    clockwise: { high: 23, low: 1, pair: 0 },
  },
});

console.log(JSON.stringify({
  status: 'PASS: carry-partitioned interior-token compressor does not reproduce the p50 rim',
  interiorTokenGate,
}, null, 2));
