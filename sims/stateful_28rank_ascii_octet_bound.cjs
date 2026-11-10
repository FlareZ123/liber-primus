'use strict';
/**
 * Exact ASCII-octet necessary-condition sieve for prev-rune-indexed
 * 28-choice radix encoders on the original 55 rune-bearing LP2 pages.
 *
 * A row is an arbitrary permutation of the other 28 symbols, so the
 * argument works without finding or assuming any row permutation.
 * All statements are conditional on a *stationary* 29-row table and
 * on 5n base-28 digits packing exactly 3n text octets.
 *
 * Run: node sims/stateful_28rank_ascii_octet_bound.cjs
 * @module stateful_28rank_ascii_octet_bound
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CORPUS = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const PAGES = CORPUS.pages.filter(p => p.status === 'unsolved' && p.indices.length)
  .map(p => p.indices);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((sum, page) => sum + page.length, 0), 12956);
const WIDTHS = [5, 10, 15, 20, 25, 30];
const TEXT_OCTETS = [9, 10, 13,
  ...Array.from({length: 95}, (_, i) => 32 + i)];

/**
 * Determine all possible most-significant radix-28 digits of a
 * 3n-byte unsigned integer whose first (most significant) octet
 * is printable ASCII or tab, LF, CR. This is an overapproximation:
 * it ignores restrictions on the remaining digits and other bytes.
 * @param {number} width Multiple of five.
 * @returns {number[]} Sorted eligible leading digit values.
 */
function allowedLeadingDigits(width) {
  assert.ok(WIDTHS.includes(width));
  const byteCount = 3 * width / 5;
  const place = 28n ** BigInt(width - 1);
  const octetPlace = 256n ** BigInt(byteCount - 1);
  const allowed = new Set();
  for (const b of TEXT_OCTETS) {
    const first = BigInt(b) * octetPlace / place;
    const last = (BigInt(b + 1) * octetPlace - 1n) / place;
    for (let d = first; d <= last; d++) {
      if (d >= 0n && d < 28n) allowed.add(Number(d));
    }
  }
  return [...allowed].sort((a, b) => a - b);
}

/**
 * @param {number[][]} pages Physical page arrays.
 * @param {'page'|'book'} reset Page-context reset or full-book continuation.
 * @param {'drop'|'skip'} policy Drop doublet transitions, or retain markers
 *   in the clock but skip every packet touching a marker.
 * @returns {Array<Array<[number,number]>>}
 */
function transitionStreams(pages, reset, policy) {
  const chunks = reset === 'page' ? pages : [pages.flat()];
  return chunks.map(page => {
    const stream = [];
    for (let i = 1; i < page.length; i++) {
      const a = page[i - 1], b = page[i];
      if (policy === 'drop' && a === b) continue;
      stream.push([a, b]);
    }
    return stream;
  });
}

/**
 * Each allowed leading digit may represent at most one different
 * successor from each stationary previous-rune row. For a fixed row
 * the best possible table assigns the k permitted leading-digit
 * ranks to the k most frequent successor edges. All remaining
 * observed packet leaders must produce a non-text top octet.
 *
 * @param {number[][]} pages
 * @param {number} width
 * @param {'page'|'book'} reset
 * @param {'drop'|'skip'} policy
 * @param {boolean} reverse Read packet digits in reverse order.
 * @param {number} phase
 * @returns {object}
 */
function examine(pages, width, reset, policy, reverse, phase, octetMode = 'printable') {
  const allowed = octetMode === 'seven-bit'
    ? Array.from({length: Number((128n * (256n ** BigInt(3 * width / 5 - 1)) - 1n)
        / (28n ** BigInt(width - 1))) + 1}, (_, i) => i)
    : allowedLeadingDigits(width);
  const k = allowed.length;
  const counts = Array.from({length: 29}, () => new Uint16Array(29));
  let clean = 0, complete = 0, markerPackets = 0;
  for (const stream of transitionStreams(pages, reset, policy)) {
    for (let start = phase; start + width <= stream.length; start += width) {
      complete++;
      let hasMarker = false;
      for (let j = 0; j < width; j++) {
        const [a, b] = stream[start + j];
        if (a === b) { hasMarker = true; break; }
      }
      if (hasMarker) { markerPackets++; continue; }
      clean++;
      const [a, b] = stream[start + (reverse ? width - 1 : 0)];
      assert.notEqual(a, b);
      counts[a][b]++;
    }
  }
  let forcedNonText = 0, violatingRows = 0, minDistinct = 29, maxDistinct = 0;
  for (const row of counts) {
    const histogram = [...row].sort((a, b) => b - a);
    const distinct = histogram.filter(x => x > 0).length;
    minDistinct = Math.min(minDistinct, distinct);
    maxDistinct = Math.max(maxDistinct, distinct);
    violatingRows += Number(distinct > k);
    forcedNonText += histogram.slice(k).reduce((a, b) => a + b, 0);
  }
  assert.ok(clean > 0);
  return {
    width, reset, policy, reverse, phase, allowedDigits: allowed,
    completePackets: complete, markerPackets, cleanPackets: clean,
    minDistinctLeadersPerRow: minDistinct,
    maxDistinctLeadersPerRow: maxDistinct,
    violatingRows, forcedNonText,
    forcedRate: forcedNonText / clean,
    hardExcluded: forcedNonText > 0
  };
}

/** @param {number[][]} pages @returns {object} */
function study(pages = PAGES) {
  const summaries = [], survivors = [], nullLogs = [];
  const log10KeySpace = 29 * Array.from({length: 28}, (_, i) => Math.log10(i + 1))
    .reduce((a, b) => a + b, 0);
  for (const width of WIDTHS) {
    const cases = [];
    for (const reset of ['page', 'book'])
      for (const policy of ['drop', 'skip'])
        for (const reverse of [false, true])
          for (let phase = 0; phase < width; phase++)
            cases.push(examine(pages, width, reset, policy, reverse, phase));
    assert.equal(cases.length, 8 * width);
    // Conditional iid-uniform nonmarker ciphertext null. For any fixed
    // 29-row key, every retained packet has iid-uniform radix-28 digits,
    // hence probability 98^(3D/5)/28^D of exactly all ASCII octets.
    // Union bound over (28!)^29 possible row keys, then over framings.
    const packetLog = 3 * width / 5 * Math.log10(98) - width * Math.log10(28);
    for (const entry of cases) nullLogs.push(log10KeySpace + entry.cleanPackets * packetLog);
    survivors.push(...cases.filter(x => !x.hardExcluded));
    summaries.push({
      width, byteCount: 3 * width / 5,
      allowedLeadingDigits: allowedLeadingDigits(width),
      settings: cases.length,
      hardExcluded: cases.filter(x => x.hardExcluded).length,
      minViolatingRows: Math.min(...cases.map(x => x.violatingRows)),
      minForcedNonTextRate: Math.min(...cases.map(x => x.forcedRate)),
      maxForcedNonTextRate: Math.max(...cases.map(x => x.forcedRate)),
      minCleanPackets: Math.min(...cases.map(x => x.cleanPackets)),
      maxCleanPackets: Math.max(...cases.map(x => x.cleanPackets))
    });
  }
  // Robustness: permit any 7-bit ASCII octet, including NUL/DEL/C0,
  // without assuming printable English. This yields at most 13/14
  // possible leading digits per stationary conditioning row.
  const sevenBit = WIDTHS.map(width => {
    const cases = [];
    for (const reset of ['page', 'book'])
      for (const policy of ['drop', 'skip'])
        for (const reverse of [false, true])
          for (let phase = 0; phase < width; phase++)
            cases.push(examine(pages, width, reset, policy, reverse, phase,
              'seven-bit'));
    const survivors = cases.filter(c => !c.hardExcluded);
    return {
      width, cases: cases.length, excluded: cases.length - survivors.length,
      allowedLeadingDigits: Array.from({length: Number((128n *
        256n ** BigInt(3 * width / 5 - 1) - 1n) /
        28n ** BigInt(width - 1)) + 1}, (_, i) => i),
      survivors: survivors.map(c => ({
        reset: c.reset, policy: c.policy, reverse: c.reverse,
        phase: c.phase, cleanPackets: c.cleanPackets
      }))
    };
  });
  assert.deepEqual(sevenBit.map(x => x.excluded),
    [40, 80, 120, 160, 200, 214]);
  const largestLog = Math.max(...nullLogs);
  const log10NullFamilyUnionBound = largestLog + Math.log10(nullLogs.reduce(
    (sum, v) => sum + 10 ** (v - largestLog), 0));
  assert.ok(Math.abs(log10NullFamilyUnionBound + 1280.1522710975) < 1e-6);
  return {totalSettings: summaries.reduce((n, x) => n + x.settings, 0),
    hardExcluded: summaries.reduce((n, x) => n + x.hardExcluded, 0),
    conditionalNull: {
      model: 'Fix repeated-rune positions, choose each other next ciphertext rune uniformly from 28 possibilities; conditional on any one stationary secret row table, nonmarker packet digits are iid-uniform in 0..27',
      totalStationaryRowTablesLog10: log10KeySpace,
      asciiOctetsPerPacket: '3D/5, each from 98 values',
      unionOverFramingsAndRowsLog10UpperBound: log10NullFamilyUnionBound,
      caution: 'This is a family-union bound under the specified random-ciphertext null, not a probability that a designed Cicada cipher could not encode ASCII, nor a deterministic original-source exclusion.'
    },
    sevenBit, summaries, survivors};
}

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Construct a source-disjoint positive: genuine ASCII packed in 3n-byte
 * integers, encoded using unknown random stationary prev-rune rows.
 * The key-free bound must admit this source for the true packet framing.
 * @param {number} width
 * @returns {object}
 */
function positiveControl(width) {
  const draw = random32(0x44230151 ^ width);
  const rows = Array.from({length: 29}, (_, prev) => {
    const out = Array.from({length: 29}, (_, i) => i).filter(i => i !== prev);
    for (let i = 27; i > 0; i--) {
      const j = draw() % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  });
  const MESSAGE = Buffer.from('LIBER PRIMUS TEST: THE HIDDEN MESSAGE IS IN THESE PRINTABLE OCTETS.\n', 'ascii');
  const nBytes = 3 * width / 5, packets = 1000;
  const bytes = [], glyphs = [draw() % 29];
  for (let packet = 0; packet < packets; packet++) {
    let value = 0n;
    for (let j = 0; j < nBytes; j++) {
      const b = MESSAGE[(packet * nBytes + j) % MESSAGE.length];
      bytes.push(b);
      value = value * 256n + BigInt(b);
    }
    const digits = new Array(width);
    for (let i = width - 1; i >= 0; i--) {
      digits[i] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
    for (const d of digits) glyphs.push(rows[glyphs[glyphs.length - 1]][d]);
  }
  const recovered = [];
  for (let i = 1; i < glyphs.length; i += width) {
    let v = 0n;
    for (let j = i; j < i + width; j++) {
      const d = rows[glyphs[j - 1]].indexOf(glyphs[j]);
      assert.ok(d >= 0 && d < 28);
      v = v * 28n + BigInt(d);
    }
    const one = new Array(nBytes);
    for (let j = nBytes - 1; j >= 0; j--) {
      one[j] = Number(v & 255n);
      v >>= 8n;
    }
    recovered.push(...one);
  }
  assert.deepEqual(recovered, bytes);
  const bound = examine([glyphs], width, 'page', 'drop', false, 0);
  assert.equal(bound.cleanPackets, packets);
  assert.equal(bound.forcedNonText, 0);
  assert.equal(bound.violatingRows, 0);
  return {width, packets, octets: bytes.length,
    glyphs: glyphs.length, roundtripped: recovered.length,
    forcedNonText: bound.forcedNonText};
}

function main() {
  const real = study();
  assert.deepEqual(real.summaries.map(x => x.hardExcluded),
    [40, 80, 120, 160, 200, 239]);
  assert.equal(real.totalSettings, 840);
  assert.equal(real.hardExcluded, 839);
  assert.equal(real.survivors.length, 1);
  assert.deepEqual(
    ['width', 'reset', 'policy', 'reverse', 'phase']
      .map(k => real.survivors[0][k]),
    [30, 'page', 'skip', true, 29]);
  const positives = [5, 15, 30].map(positiveControl);
  process.stdout.write(JSON.stringify({
    source: 'resources/liber-primus/lp2-corpus.json',
    sourcePages: 55, originalRunes: 12956,
    model: 'stationary 29 independent prev-rune rows, each a bijection of the other 28 rune values; 5n radix28 digits to 3n ASCII/whitespace bytes',
    textOctets: '0x09, 0x0A, 0x0D, and 0x20 through 0x7E',
    proof: 'Any fixed predecessor row can map at most k distinct outgoing leader glyphs to k allowed leading ranks. Frequencies of all other leaders give a deterministic lower bound on forbidden high octets.',
    evidence: real, positives,
    limitation: 'Only fixed stationary predecessor rows, 5n:3n packet coding, tested shared phase policies. Non-ASCII/compressed bytes, keyed dynamic alphabets and per-page or changing phases remain open.'
  }, null, 2) + '\n');
}
if (require.main === module) main();
module.exports = {allowedLeadingDigits, transitionStreams, examine, study, positiveControl, main};
