#!/usr/bin/env node
'use strict';

// Audit the historical Wulfic "P20 = 812 runes" object against the current
// canonical LP2 corpus. The external source is pinned, not copied:
// Wulfic/Cicada3301-Liber_Primus@0f89de541b:pages/page_20/runes.txt
// Git blob SHA: 088f54d1336501d7378bcbf74703981d6358e1c2
//
// The old rune-only stream is exactly the canonical slice p3 + p4 + p5 +
// p6[0:71], not internal LP2 p20. This script checks the slice digest,
// page counts, and prime-position counts without downloading external data.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const page = n => {
  const p = pages.get(n);
  if (!p) throw new Error('Missing LP2 page ' + n);
  return p;
};
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let d = 5; d * d <= n; d += 6) {
    if (n % d === 0 || n % (d + 2) === 0) return false;
  }
  return true;
}
function primePositionCount(length) {
  let count = 0;
  for (let i = 0; i < length; i++) if (isPrime(i)) count++;
  return count;
}

const p3 = page(3), p4 = page(4), p5 = page(5), p6 = page(6);
const p20 = page(20);
const oldSlice = [
  ...p3.indices,
  ...p4.indices,
  ...p5.indices,
  ...p6.indices.slice(0, 71)
];
const oldSliceRunes = oldSlice.map(i => corpus.runes[i]).join('');
const oldSliceSha1 = crypto.createHash('sha1').update(oldSliceRunes, 'utf8').digest('hex');

assert.deepEqual(
  [p3.runic_count, p4.runic_count, p5.runic_count, p6.runic_count],
  [217, 261, 263, 196]
);
assert.equal(oldSlice.length, 812);
assert.equal(oldSliceSha1, 'd6e96026e64beb82a7376ea2cbd082cf1ad72b87');
assert.equal(p20.runic_count, 269);
assert.equal(primePositionCount(812), 141);
assert.equal(primePositionCount(269), 57);
assert.equal(primePositionCount(988), 166); // Raw-file character offsets, not rune ordinals.

const startOffset = corpus.pages.slice(0, 3).reduce((n, p) => n + p.runic_count, 0);
assert.equal(startOffset, 729);

console.log(JSON.stringify({
  pinned_external_artifact: {
    repository: 'Wulfic/Cicada3301-Liber_Primus',
    commit: '0f89de541b',
    path: 'pages/page_20/runes.txt',
    git_blob_sha1: '088f54d1336501d7378bcbf74703981d6358e1c2',
    raw_code_points_in_file: 988,
    rune_only_count: 812,
    rune_only_sha1: oldSliceSha1
  },
  canonical_mapping: {
    start_lp2_page: 3,
    start_rune_offset: startOffset,
    components: [
      { page: 3, count: p3.runic_count },
      { page: 4, count: p4.runic_count },
      { page: 5, count: p5.runic_count },
      { page: 6, count: 71, note: 'prefix only' }
    ],
    total: oldSlice.length,
    ends_mid_page: true
  },
  prime_position_counts: {
    stale_812_rune_slice: {
      prime: primePositionCount(812),
      nonprime: 812 - primePositionCount(812)
    },
    actual_internal_lp2_p20: {
      runes: p20.runic_count,
      prime: primePositionCount(p20.runic_count),
      nonprime: p20.runic_count - primePositionCount(p20.runic_count)
    },
    raw_988_character_offsets: primePositionCount(988)
  },
  reported_166_646_partition_reproduced: false
}, null, 2));
