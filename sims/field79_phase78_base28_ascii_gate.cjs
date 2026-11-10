'use strict';
/**
 * Exact all-secret ASCII-leading-byte capacity gate for the restricted
 * 164 x 79 / 78-phase source-rank construction.
 *
 * Input: original 12,956 LP2 GP indices, pages 0..55.
 * Each packet has one leading salt rune and 78 payload transitions. A zero
 * difference is an erased/repeated-output marker; the other 12,706 transitions
 * become rank28 digits. For each of the 78 phase labels, allow an arbitrary
 * secret bijection from rank28 to base28 digit, fixed across all 164 packets.
 *
 * Test the natural 5 base28 digits -> 3 bytes codec. The first output byte of
 * a 5-digit group can only be in a small set of values for a permitted output
 * alphabet. At each phase, at most k of the 28 observed rank values can map
 * to those k allowed leading digits. Assigning them to the k most frequent
 * ranks gives an exact optimistic upper bound, independent of every secret
 * phase permutation.
 *
 * Enumerates 16 declared phase-clock/salt-mix definitions, 3 output
 * segmentations (continuous, 164 packet resets, 55 physical-page resets),
 * 2 marker treatments, 3 orientations, and all 5 group offsets: 1,440 cases.
 * A planted 7-bit ASCII control uses 78 distinct affine phase permutations
 * and must round-trip exactly.
 *
 * This is conditional on fixed per-phase tables and a 5->3 byte register.
 * It does not cover salt x column tables, per-packet/evolving rekeys, other
 * pack widths, compressed output, or non-ASCII plaintext.
 *
 * Run: node sims/field79_phase78_base28_ascii_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56);
const cipher = pages.flatMap(p => p.indices);
const N = cipher.length;
assert.equal(N, 12956);
const mod = (x, n) => (x % n + n) % n;
const CLOCKS = ['global79', 'payload78', 'packetPlusColumn', 'blockOnly'];
const MIXES = ['none', 'addsalt', 'xorsalt', 'mulsalt'];
const ALPHABETS = {
  seven_bit: b => b <= 127,
  printable_controls: b => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126),
  visible_ascii: b => b >= 32 && b <= 126
};
const EXPECTED_LEADS = {
  seven_bit: Array.from({length: 14}, (_, i) => i),
  printable_controls: [0, 1, ...Array.from({length: 11}, (_, i) => i + 3)],
  visible_ascii: Array.from({length: 11}, (_, i) => i + 3)
};
const pageOf = new Int16Array(N);
let pageOffset = 0;
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i++) pageOf[pageOffset + i] = page.page;
  pageOffset += page.indices.length;
}
assert.equal(pageOffset, N);

/** Exact leading base28 digits whose 5-digit range intersects allowed bytes. */
function allowedLeadingDigits(allowedByte) {
  const out = [];
  const suffix = 28n ** 4n;
  const byteScale = 256n ** 2n;
  for (let d = 0; d < 28; d++) {
    const low = (BigInt(d) * suffix) / byteScale;
    const high = ((BigInt(d + 1) * suffix - 1n) / byteScale);
    let possible = false;
    for (let b = 0; b < 256; b++) {
      if (allowedByte(b) && BigInt(b) >= low && BigInt(b) <= high) {
        possible = true;
        break;
      }
    }
    if (possible) out.push(d);
  }
  return out;
}
const LEADS = Object.fromEntries(Object.entries(ALPHABETS)
  .map(([name, predicate]) => [name, allowedLeadingDigits(predicate)]));
for (const [name, expected] of Object.entries(EXPECTED_LEADS))
  assert.deepEqual(LEADS[name], expected, 'exact 5-to-3 leading-digit set');

/** @param {string} clock @param {string} mix */
function makeRecords(clock, mix) {
  const records = [];
  for (let b = 0; b < 164; b++) {
    const first = mod(35 + b * 79, N);
    const salt = mod(cipher[first] - cipher[mod(first - 1, N)], 29);
    for (let j = 1; j <= 78; j++) {
      const idx = mod(first + j, N);
      const difference = mod(cipher[idx] - cipher[mod(idx - 1, N)], 29);
      let t = clock === 'global79' ? 79 * b + j
        : clock === 'payload78' ? 78 * b + j - 1
        : clock === 'packetPlusColumn' ? b + j : b;
      t += 35;
      if (mix === 'addsalt') t += salt;
      else if (mix === 'xorsalt') t ^= salt;
      else if (mix === 'mulsalt') t += b * salt;
      records.push({
        packet: b, page: pageOf[idx], index: idx,
        rank: difference === 0 ? -1 : difference - 1,
        phase: mod(t, 78)
      });
    }
  }
  assert.equal(records.length, 164 * 78);
  assert.equal(records.filter(x => x.rank < 0).length, 86);
  assert.equal(records.filter(x => x.rank >= 0).length, 12706);
  return records;
}

/** Three visible source segmentations, retaining original phase labels. */
function segmentations(records) {
  const packets = Array.from({length: 164}, () => []);
  const pageMap = new Map();
  for (const r of records) {
    packets[r.packet].push(r);
    if (!pageMap.has(r.page)) pageMap.set(r.page, []);
    pageMap.get(r.page).push(r);
  }
  for (const rows of pageMap.values()) rows.sort((a, b) => a.index - b.index);
  return {
    continuous: [records],
    packet_reset: packets,
    physical_page_reset: Array.from(pageMap.entries())
      .sort((a, b) => a[0] - b[0]).map(([, rows]) => rows)
  };
}

/**
 * @param {object[][]} segments
 * @param {'delete'|'drop_marker_groups'} markerMode
 * @param {'forward'|'reverse_stream'|'reverse_within_block'} orientation
 * @param {number} offset
 */
function leadingHistogram(segments, markerMode, orientation, offset) {
  const hist = Array.from({length: 78}, () => new Uint16Array(28));
  let groups = 0;
  for (const original of segments) {
    let seq = markerMode === 'delete'
      ? original.filter(x => x.rank >= 0) : original.slice();
    if (orientation === 'reverse_stream') seq = seq.slice().reverse();
    for (let p = offset; p + 5 <= seq.length; p += 5) {
      const block = seq.slice(p, p + 5);
      if (markerMode === 'drop_marker_groups' && block.some(x => x.rank < 0)) continue;
      const lead = orientation === 'reverse_within_block' ? block[4] : block[0];
      if (lead.rank < 0) continue;
      hist[lead.phase][lead.rank]++;
      groups++;
    }
  }
  return {hist, groups};
}

/** Exact maximum permitted leaders under arbitrary bijections, one per phase. */
function maximumAllowed(hist, k) {
  let maximum = 0;
  for (const row of hist) {
    const counts = Array.from(row).sort((a, b) => b - a);
    for (let i = 0; i < k; i++) maximum += counts[i];
  }
  return maximum;
}

function modelSummary() {
  const results = [];
  for (const clock of CLOCKS) for (const mix of MIXES) {
    const records = makeRecords(clock, mix);
    const segmentMap = segmentations(records);
    for (const [segmentation, segments] of Object.entries(segmentMap))
    for (const markerMode of ['delete', 'drop_marker_groups'])
    for (const orientation of ['forward', 'reverse_stream', 'reverse_within_block'])
    for (let offset = 0; offset < 5; offset++) {
      const {hist, groups} = leadingHistogram(segments, markerMode, orientation, offset);
      const common = {clock, mix, segmentation, markerMode, orientation, offset, groups};
      for (const [alphabet, allowed] of Object.entries(LEADS)) {
        const maxAllowed = maximumAllowed(hist, allowed.length);
        results.push({...common, alphabet, allowedLeadingDigits: allowed,
          maxAllowed, forcedOutside: groups - maxAllowed});
      }
    }
  }
  assert.equal(results.length, 1440 * 3);
  return results;
}

function bestAndWorst(results, alphabet) {
  const rows = results.filter(x => x.alphabet === alphabet);
  const best = rows.reduce((a, b) => b.forcedOutside < a.forcedOutside ? b : a);
  const worst = rows.reduce((a, b) => b.forcedOutside > a.forcedOutside ? b : a);
  return {
    models: rows.length,
    minimumForcedOutside: best.forcedOutside,
    bestCase: best,
    maximumForcedOutside: worst.forcedOutside,
    worstCase: worst,
    everyCaseExcluded: rows.every(x => x.forcedOutside > 0),
    groupRange: [
      Math.min(...rows.map(x => x.groups)),
      Math.max(...rows.map(x => x.groups))
    ]
  };
}

/** 3 bytes -> 5 base28 digits, repeated over the 12,706 rank slots. */
function positiveControl() {
  const records = makeRecords('payload78', 'none');
  const nonzero = records.filter(x => x.rank >= 0);
  const text = Buffer.from('LIBER PRIMUS - THE WAY IS NOT CLEAR. ', 'ascii');
  const bytes = Buffer.alloc(7623);
  for (let i = 0; i < bytes.length; i++) bytes[i] = text[i % text.length];
  assert.ok(bytes.every(b => b <= 127));
  const digits = [];
  for (let i = 0; i < bytes.length; i += 3) {
    let value = (BigInt(bytes[i]) << 16n)
      | (BigInt(bytes[i + 1]) << 8n) | BigInt(bytes[i + 2]);
    const block = Array(5);
    for (let j = 4; j >= 0; j--) {
      block[j] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
    digits.push(...block);
  }
  digits.push(7); // one trailing digit outside the 2,541 complete groups
  assert.equal(digits.length, nonzero.length);
  assert.equal(nonzero.length, 12706);
  const units = [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27];
  const key = Array.from({length: 78}, (_, phase) => ({
    a: units[(phase * 7 + 3) % units.length],
    b: (phase * 11 + 5) % 28
  }));
  const inverse = key.map(({a, b}) => {
    const inv = Array(28);
    for (let d = 0; d < 28; d++) inv[mod(a * d + b, 28)] = d;
    return inv;
  });
  const encoded = [];
  let cursor = 0;
  for (const r of records)
    encoded.push(r.rank < 0 ? -1
      : mod(key[r.phase].a * digits[cursor++] + key[r.phase].b, 28));
  assert.equal(cursor, digits.length);
  const recovered = [];
  cursor = 0;
  for (let i = 0; i < records.length; i++)
    if (records[i].rank >= 0) recovered.push(inverse[records[i].phase][encoded[i]]);
  assert.deepEqual(recovered, digits);
  const hist = Array.from({length: 78}, () => new Uint16Array(28));
  const groups = Math.floor(nonzero.length / 5);
  for (let g = 0; g < groups; g++) {
    const r = nonzero[g * 5];
    hist[r.phase][encoded[records.indexOf(r)]]++;
    assert.ok(LEADS.seven_bit.includes(digits[g * 5]));
  }
  const maxAllowed = maximumAllowed(hist, LEADS.seven_bit.length);
  assert.ok(maxAllowed >= groups);
  return {
    bytes: bytes.length,
    rankDigits: digits.length,
    completeFiveDigitGroups: groups,
    trailingDigits: digits.length - groups * 5,
    phaseTables: 78,
    allBytesSevenBit: true,
    inverseRecoversEveryDigit: true,
    upperBoundAllowsEveryLeadingByte: true,
    maxAllowedLeadingGroups: maxAllowed
  };
}

function main() {
  const results = modelSummary();
  const summary = {
    source: {
      originalRunes: N, packets: 164, payloadSlots: 164 * 78,
      repeatedTransitionMarkers: 86, nonzeroRankDigits: 12706
    },
    model: 'one arbitrary fixed 28-symbol bijection per phase, shared across 164 packets',
    codec: 'five base28 digits -> three bytes; first output byte only',
    declaredClocks: CLOCKS,
    declaredSaltMixes: MIXES,
    framingCases: 1440,
    allowedLeadingDigits: LEADS,
    bounds: {
      seven_bit: bestAndWorst(results, 'seven_bit'),
      printable_controls: bestAndWorst(results, 'printable_controls'),
      visible_ascii: bestAndWorst(results, 'visible_ascii')
    },
    naturalPayload78NoSaltContinuous: results.find(x =>
      x.alphabet === 'seven_bit' && x.clock === 'payload78' && x.mix === 'none'
      && x.segmentation === 'continuous' && x.markerMode === 'delete'
      && x.orientation === 'forward' && x.offset === 0),
    positiveControl: positiveControl(),
    conclusion: 'All 1,440 fixed-78-phase 5-to-3 byte framings force at least one forbidden leading octet. This is a conditional register exclusion, not a plaintext recovery.'
  };
  assert.equal(summary.bounds.seven_bit.minimumForcedOutside, 281);
  assert.equal(summary.bounds.printable_controls.minimumForcedOutside, 354);
  assert.equal(summary.bounds.visible_ascii.minimumForcedOutside, 516);
  assert.deepEqual({
    groups: summary.naturalPayload78NoSaltContinuous.groups,
    forced7: summary.naturalPayload78NoSaltContinuous.forcedOutside
  }, {groups: 2541, forced7: 392});
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}
if (require.main === module) main();
module.exports = {main, makeRecords, leadingHistogram, maximumAllowed, allowedLeadingDigits};
