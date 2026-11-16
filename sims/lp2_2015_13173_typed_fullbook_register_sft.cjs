'use strict';

/**
 * Original LP2 source: exact 13,173-position typed image-book serialization,
 * testing the unverified 2015 participant 12-feature, 13,173-row register.
 *
 * Crucial restriction: large 10/13/23-dot glyphs remain typed non-numeric
 * markers. A source-specified map to GP29 or prime numbers does not exist.
 * This reports a possible source length, not a recovered 2015 program or key.
 *
 * Node.js 22 CommonJS; run this one test file in the repository.
 * Reads original canonical repository sources and immutable 2015 participant
 * all_data.csv through fetch for an independent projection fingerprint.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'lp2-corpus.json'), 'utf8')
);
const ink = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'lp2-ink-annotations.json'), 'utf8')
);
const HISTORY_URL =
  'https://raw.githubusercontent.com/resvolver/c1cada/' +
  'e4bdbc24b1d1b5a6462f3332c9a8db785b5c48ec/' +
  'full%20transcript%20data/all_data.csv';
const HISTORY_BLOB = 'f864602155cbb645136ab981456adee23fdfbb35';
const mod29 = x => (x % 29 + 29) % 29;

/** @returns {number[]} N earliest ordinary primes. */
function primes(count) {
  const result = [];
  for (let x = 2; result.length < count; x += 1) {
    let ok = true;
    for (let d = 2; d * d <= x; d += 1) {
      if (x % d === 0) { ok = false; break; }
    }
    if (ok) result.push(x);
  }
  return result;
}

/**
 * @param {number[]} a
 * @returns {{adjacentEqual:number, adjacentEqualFirstDifferences:number}}
 */
function shiftStats(a) {
  const differences = a.slice(1).map((v, i) => mod29(v - a[i]));
  return {
    adjacentEqual: a.slice(1).filter((v, i) => v === a[i]).length,
    adjacentEqualFirstDifferences: differences.slice(1)
      .filter((v, i) => v === differences[i]).length,
  };
}

async function main() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(ink.counts.runes, 13136);
  assert.equal(ink.counts.large, 36);
  const typed = [{ type: 'imagined-F', gp: 0 }];
  const markPositions = [];
  for (let page = 0; page < corpus.pages.length; page += 1) {
    const runeIndices = corpus.pages[page].indices;
    const annotation = ink.pages.find(x => x.page === page);
    if (annotation) assert.equal(annotation.rune_count, runeIndices.length);
    const byAfter = new Map();
    for (const [at, dots, color] of annotation?.large_punctuation || []) {
      assert.ok(at >= 0 && at <= runeIndices.length);
      assert.ok([10, 13, 23].includes(dots));
      assert.ok(color === 'red' || color === 'black');
      const marks = byAfter.get(at) || [];
      marks.push({ type: 'mark', page, afterRune: at, dots, color, gp: null });
      byAfter.set(at, marks);
    }
    for (let off = 0; off <= runeIndices.length; off += 1) {
      for (const mark of byAfter.get(off) || []) {
        markPositions.push({
          typedOffset: typed.length,
          page, afterRune: off, dots: mark.dots, color: mark.color,
        });
        typed.push(mark);
      }
      if (off < runeIndices.length) {
        typed.push({ type: 'rune', page, runeOffset: off, gp: runeIndices[off] });
      }
    }
  }

  const counts = typed.reduce((a, event) => {
    a[event.type] = (a[event.type] || 0) + 1;
    return a;
  }, {});
  assert.deepEqual(counts, { 'imagined-F': 1, rune: 13136, mark: 36 });
  assert.equal(typed.length, 13173);
  assert.equal(markPositions.filter(x => x.dots === 13).length, 31);
  assert.equal(markPositions.filter(x => x.dots === 10).length, 4);
  assert.equal(markPositions.filter(x => x.dots === 23).length, 1);
  assert.deepEqual(markPositions[0], {
    typedOffset: 14, page: 0, afterRune: 13, dots: 13, color: 'red',
  });
  assert.deepEqual(
    markPositions.filter(x => x.page === 7 && x.afterRune === 194)
      .map(x => [x.typedOffset, x.color]),
    [[1868, 'black'], [1869, 'red']]
  );
  assert.deepEqual(markPositions.at(-1), {
    typedOffset: 13172, page: 57, afterRune: 95, dots: 23, color: 'red',
  });
  const firstP57 = typed.findIndex(x => x.type === 'rune' && x.page === 57);
  assert.equal(firstP57, 13076);
  const prefix = typed
    .filter(x => x.type === 'rune' && x.page < 57)
    .map(x => x.gp);
  const all = typed.filter(x => x.type === 'rune').map(x => x.gp);
  assert.equal(prefix.length, 13041);
  assert.equal(all.length, 13136);
  assert.deepEqual(prefix, corpus.pages.slice(0, 57).flatMap(x => x.indices));

  /* Explicitly separate what the 2015 first-chapter operation actually does
     from any proposed handling of non-GP29 physical punctuation. */
  const original729 = corpus.pages.slice(0, 3).flatMap(x => x.indices);
  assert.equal(original729.length, 729);
  const p = primes(730);
  let previous = mod29(-p[0]); // imagined leading F uses prime2
  const D = original729.map((v, i) => {
    const shifted = mod29(v - p[i + 1]); // first *real* rune uses prime3
    const d = mod29(shifted - previous);
    previous = shifted;
    return d;
  });
  const historyFirstChapterEqual =
    D.slice(1).filter((v, i) => v === D[i]).length;
  assert.equal(historyFirstChapterEqual, 40);
  const canonToP56 = shiftStats(prefix);
  const canonToP57 = shiftStats(all);
  assert.deepEqual(canonToP56, {
    adjacentEqual: 88, adjacentEqualFirstDifferences: 440,
  });
  assert.deepEqual(canonToP57, {
    adjacentEqual: 89, adjacentEqualFirstDifferences: 443,
  });

  /* Frozen original Aug 2015 participant array: 13,041 rune-only rows.
     The lone multiline quoted CSV field is parsed without splitting rows. */
  const response = await fetch(HISTORY_URL);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const gitBlob = crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  assert.equal(gitBlob, HISTORY_BLOB);
  const csv = bytes.toString('utf8');
  const historical = [...csv.matchAll(/"(\d+)",(\d+),"(\d+)\s*",/g)]
    .map(m => ({ row: Number(m[1]), ttl: Number(m[2]), value: Number(m[3]) }));
  assert.equal(historical.length, 13041);
  assert.ok(historical.every((r, i) => r.row === i + 1 && r.ttl === i + 1));
  const disagreement = historical.flatMap((r, i) =>
    r.value === prefix[i] ? [] : [{ row: i + 1, old: r.value, original: prefix[i] }]
  );
  assert.deepEqual(disagreement.map(x => x.row),
    [1539, 1928, 2088, 3099, 6533, 7794, 8061, 8078, 8705, 8707, 9299]);
  assert.equal(disagreement.length, 11);
  const historyShift = shiftStats(historical.map(x => x.value));
  assert.deepEqual(historyShift, {
    adjacentEqual: 90, adjacentEqualFirstDifferences: 439,
  });

  const serialized = typed.map(e => {
    if (e.type === 'imagined-F') return 'I:0';
    if (e.type === 'rune') return 'R:' + e.page + ':' + e.runeOffset + ':' + e.gp;
    return 'M:' + e.page + ':' + e.afterRune + ':' + e.dots + ':' + e.color;
  }).join('\n') + '\n';
  const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');
  console.log(JSON.stringify({
    claim: 'candidate original typed stream, no recovered 2015 generator',
    originalBookRunes: all.length,
    physicalMarks: markPositions.length,
    imaginedLeadingF: 1,
    totalTypedRows: typed.length,
    typedStreamSha256: sha256,
    physicalMarkDotCounts: { '13': 31, '10': 4, '23': 1 },
    originalSourceExampleMarks: {
      first: markPositions[0],
      p7Coincident: markPositions.filter(x => x.page === 7 && x.afterRune === 194),
      final: markPositions.at(-1),
    },
    firstP57TypedOffset: firstP57,
    originalLaterParticipantRuneOnlyRows: prefix.length,
    historicalParticipantCsvBlob: HISTORY_BLOB,
    historicalCsvRuneAgreements: prefix.length - disagreement.length,
    historicalCsvRuneDisagreements: disagreement,
    historicalFirstChapterPrimeDeltaAdjacentRepeats: historyFirstChapterEqual,
    rawRUNEFirstDifference: {
      originalToP56: canonToP56,
      originalFull: canonToP57,
      laterParticipant: historyShift,
    },
    missingData: 'No original map from physical punctuation event to a GP29 numeral, 2015 12-feature row schema, or independently authored inverse is known.',
  }, null, 2));
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
