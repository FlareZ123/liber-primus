'use strict';
/**
 * Frozen direct-transfer test: historical 2013 Cicada Twitter byte stream
 * as a continuous additive GP29 pad on original unknown LP2 pages 0–55.
 *
 * Run from repository root:
 *   node sims/lp2_2013_twitter_stream_direct_pad_sft.cjs
 *
 * This tests only two source-fixed byte-to-GP29 reductions, both signs,
 * zero initial offset, one continuous stream, no page resets or F skips.
 * It does not claim the historical 2013 stream was intended for LP2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(ROOT, 'resources', 'cicada2013-twitter-hex-stream.txt'), 'utf8'
);
const rows = source.trimEnd().split(/\r?\n/).map((line) => {
  const match = line.match(/^([0-9a-f]+): ([0-9a-f]+)$/);
  assert(match, 'every source line must be offset: hex');
  return { offset: Number.parseInt(match[1], 16), hex: match[2] };
});
assert.equal(rows.length, 988);
rows.sort((a, b) => a.offset - b.offset);
const bytes = [];
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  assert.equal(row.offset, i * 65, 'complete, gapless 65-byte offset grid');
  assert.equal(row.hex.length % 2, 0);
  const rowBytes = row.hex.match(/../g).map((hex) => Number.parseInt(hex, 16));
  assert.equal(rowBytes.length, i === 987 ? 12 : 65);
  bytes.push(...rowBytes);
}
assert.equal(bytes.length, 64167);

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const unknownPages = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55);
assert.equal(unknownPages.length, 56);
const unknownRunes = unknownPages.flatMap((page) => page.indices);
assert.equal(unknownRunes.length, 12956);
assert(bytes.length >= unknownRunes.length);
const p55 = unknownPages.find((page) => page.page === 55).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

const mod29 = (value) => ((value % 29) + 29) % 29;
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
const originalIoC = ioc(unknownRunes);
const p57NativeIoC = ioc(p57);
const mappings = [
  { name: 'byte mod 29', key: (byte) => byte % 29 },
  { name: 'uniform 8-bit bucket', key: (byte) => Math.floor(byte * 29 / 256) }
];
const results = [];
for (const mapping of mappings) {
  for (const sign of [-1, 1]) {
    let cursor = 0;
    const decoded = [];
    const pageScores = [];
    for (const page of unknownPages) {
      const pageKey = page.indices.map(() => mapping.key(bytes[cursor++]));
      const pagePlain = page.indices.map((cipher, i) => mod29(cipher + sign * pageKey[i]));
      decoded.push(...pagePlain);
      pageScores.push({ page: page.page, length: pagePlain.length, ioc: ioc(pagePlain) });
      // Exact original-cipher forward replay.
      assert.deepEqual(
        pagePlain.map((plain, i) => mod29(plain - sign * pageKey[i])),
        page.indices
      );
    }
    assert.equal(cursor, 12956);
    const p55Score = pageScores.find((item) => item.page === 55).ioc;
    const maxPage = pageScores.filter((item) => item.length > 1)
      .reduce((best, item) => item.ioc > best.ioc ? item : best);
    assert(maxPage.ioc < 0.05, 'no page reaches a native-language-like IoC');
    // Positive plant: the same fixed map/sign must invert a native GP page
    // when encrypted with this exact stream and the same zero-start clock.
    const plantKey = bytes.slice(0, p57.length).map(mapping.key);
    const plantedCipher = p57.map((plain, i) => mod29(plain - sign * plantKey[i]));
    assert.deepEqual(
      plantedCipher.map((cipher, i) => mod29(cipher + sign * plantKey[i])),
      p57
    );
    results.push({
      mapping: mapping.name,
      sign: sign < 0 ? 'subtract key' : 'add key',
      wholeBookIoC: ioc(decoded),
      p55IoC: p55Score,
      maximumPageIoC: maxPage.ioc,
      maximumPage: maxPage.page,
      pagesAtOrAbove005: pageScores.filter((item) => item.ioc >= 0.05).map((item) => item.page),
      exactOriginalForwardReplay: true,
      p57PositivePlant: '95/95'
    });
  }
}
assert(Math.abs(originalIoC - 0.03447839786450569) < 1e-15);
assert(Math.abs(p57NativeIoC - 0.06270996640537514) < 1e-15);
const expected = [
  0.034492958919593544,
  0.03446060763926333,
  0.0344959497746075,
  0.03448721552470619
];
results.forEach((result, i) =>
  assert(Math.abs(result.wholeBookIoC - expected[i]) < 1e-15)
);
console.log(JSON.stringify({
  status: 'PASS',
  source: 'resources/cicada2013-twitter-hex-stream.txt',
  records: rows.length,
  reconstructedBytes: bytes.length,
  unknownPagesIncludingEmptyP50: unknownPages.length,
  unknownRuneCount: unknownRunes.length,
  keyStartOffset: 0,
  clock: 'one continuous stream across original pages 0–55',
  conversions: mappings.map((mapping) => mapping.name),
  signs: ['subtract key', 'add key'],
  originalUnknownIoC: originalIoC,
  clearP57NativeIoC: p57NativeIoC,
  results,
  conclusion: 'All four direct GP29 transfers remain near-uniform; none of 55 rune-bearing pages reaches IoC 0.05. This rejects only the frozen zero-offset bytewise additive transfers.'
}, null, 2));
