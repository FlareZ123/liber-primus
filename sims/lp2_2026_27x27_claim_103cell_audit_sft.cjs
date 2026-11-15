'use strict';
/**
 * Source-pinned 2026 third-party 27x27 claimed LP2 p0-p2 plaintext coverage.
 * Reproduce on Windows 11 with Node.js 22:
 *   node sims/lp2_2026_27x27_claim_103cell_audit_sft.cjs
 *
 * This is a coverage and exact-corpus fidelity test, not a cipher inverse.
 * It does not call the external site's changing default branch.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE_COMMIT = 'ab9d8190e60009179563ac21b2d750271c2782b3';
const SOURCE_BLOB_SHA1 = '9d63d54570c52e3abae52aaed16ab182576ff58c';
const SOURCE_URL = 'https://raw.githubusercontent.com/2retooz270703/' +
  'Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/' +
  SOURCE_COMMIT + '/0-2-live-map.html';
const ALIASES = {
  'S/Z': 'S',
  'C/K': 'C',
  'IA/IO': 'IA',
  'U/V': 'U',
};

/** @param {Buffer} data @returns {string} Git-compatible SHA-1 blob hash. */
function gitBlobSha1(data) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0'))
    .update(data)
    .digest('hex');
}

/** @param {string} html @param {object} corpus @returns {object} */
function analyze(html, corpus) {
  const p0p2 = corpus.pages.filter(page => page.page >= 0 && page.page <= 2)
    .flatMap(page => page.indices);
  assert.equal(p0p2.length, 729);
  const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(body, '27x27 table must exist');
  const rows = [...body[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 27, 'exact source rows');
  const stageCounts = new Map();
  const cipherCells = [];
  let position = 0;
  for (let row = 0; row < rows.length; row++) {
    const cells = [...rows[row][1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length, 27, 'each row must have 27 rune cells');
    for (let column = 0; column < cells.length; column++) {
      const cell = cells[column][1];
      const glyph = cell.match(/<span class="rune">([^<]+)<\/span>/);
      assert.ok(glyph, 'every source cell must have its rune');
      const token = ALIASES[glyph[1]] || glyph[1];
      assert.equal(token, corpus.translit[p0p2[position]],
        'original LP2 canonical rune at source cell ' + (position + 1));
      const marks = [...cell.matchAll(/overlay cipher-layer stage-(\d+)/g)];
      assert.ok(marks.length <= 1, 'no reuse/duplicate overlay per original cell');
      for (const mark of marks) {
        const stage = Number(mark[1]);
        assert.ok(stage >= 1 && stage <= 38);
        stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
        cipherCells.push({row: row + 1, column: column + 1, stage});
      }
      position++;
    }
  }
  assert.equal(position, 729);
  assert.equal(stageCounts.size, 38, 'all reported 38 blocks represented');
  assert.equal(cipherCells.length, 103, 'published plaintext path touches 103 cells');
  const stageEntries = [...stageCounts].sort((a, b) => a[0] - b[0]);
  assert.deepEqual(stageEntries.map(([stage]) => stage),
    Array.from({length: 38}, (_, i) => i + 1));
  assert.deepEqual(stageEntries.map(([, n]) => n),
    [7,5,5,4,4,3,4,2,1,1,3,2,3,3,1,3,3,2,3,2,2,2,2,2,3,2,2,6,2,2,2,3,1,2,2,2,2,3]);
  // The one uniquely documented first seven-rune subtraction is exact, but
  // test its same-key contiguous continuation before following a new hand-picked path.
  const openingOffset = 12 * 27 + 24; // original source (row13,col25)
  const openingKey = [25, 10, 28]; // AE-I-EA
  const continued = p0p2.slice(openingOffset).map(
    (cipher, index) => (cipher - openingKey[index % 3] + 29) % 29
  );
  assert.deepEqual(continued.slice(0, 7), [24, 15, 10, 6, 3, 2, 18],
    'the externally reported seven-rune AS I GO THE inverse is exact');
  const frequencies = Array(29).fill(0);
  continued.forEach(index => frequencies[index]++);
  const continuedIoC = frequencies.reduce(
    (acc, count) => acc + count * (count - 1), 0
  ) / (continued.length * (continued.length - 1));
  assert.ok(Math.abs(continuedIoC - 0.03413454897085233) < 1e-13);

  // Under an otherwise unconstrained period-3 GP29 key, WEATHER is
  // compatible with multiple straight five-rune paths in the same source.
  const weather = [7, 28, 2, 18, 4]; // W EA TH E R
  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [-1, -1], [1, -1], [-1, 1],
  ];
  const weatherMatches = [];
  for (let row = 0; row < 27; row++) for (let column = 0; column < 27; column++) {
    for (const [dr, dc] of directions) {
      const endRow = row + 4 * dr, endColumn = column + 4 * dc;
      if (endRow < 0 || endRow >= 27 || endColumn < 0 || endColumn >= 27) continue;
      const localKey = weather.map((plaintext, index) =>
        (p0p2[(row + dr * index) * 27 + column + dc * index] - plaintext + 29) % 29
      );
      if (localKey.every((value, index) => value === localKey[index % 3])) {
        weatherMatches.push({
          row: row + 1, column: column + 1,
          direction: [dr, dc],
          key: localKey.slice(0, 3).map(index => corpus.translit[index]).join('-'),
        });
      }
    }
  }
  assert.equal(weatherMatches.length, 5);
  assert.ok(weatherMatches.some(match => match.row === 14 &&
    match.column === 14 && match.direction[0] === 0 &&
    match.direction[1] === 1 && match.key === 'X-X-I'));

  return {
    initialSevenRuneInversion: {
      row: 13, column: 25, ciphertextKey: 'AE-I-EA',
      plaintext: 'A S I G O TH E',
      contiguousRuneCount: continued.length,
      immediate38RuneContinuationAfterSeven: continued.slice(7, 45)
        .map(index => corpus.translit[index]).join(' '),
      contiguousIoC: continuedIoC,
    },
    weatherPeriod3GeometryMatches: weatherMatches,
    originalChapterRunes: position,
    independentlyVerifiedSourceCells: position,
    candidateBlocks: stageEntries.length,
    distinctOverlayCipherCells: cipherCells.length,
    ciphertextCellsUntouched: position - cipherCells.length,
    ciphertextCoveragePercent: Math.round(cipherCells.length * 10000 / position) / 100,
    duplicateOverlayTagsPerCell: 0,
    caution: 'The upstream HTML renders one cipher overlay per cell. Its 38 original walkthroughs use 115 rune instances across these 103 distinct source cells (12 repeated reads). See existing comprehensive prior audits.',
    stageCounts: stageEntries,
  };
}

/** @returns {Promise<void>} */
async function main() {
  const response = await fetch(SOURCE_URL, {
    signal: AbortSignal.timeout(30000),
    headers: {'user-agent': 'liber-primus-original-claim-coverage/1.0'},
  });
  assert.equal(response.status, 200, 'immutable GitHub raw source');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(gitBlobSha1(bytes), SOURCE_BLOB_SHA1,
    'upstream claim source bytes are pinned');
  const root = path.resolve(__dirname, '..');
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const result = analyze(bytes.toString('utf8'), corpus);
  console.log(JSON.stringify({
    source: SOURCE_URL,
    sourceBlobSHA1: SOURCE_BLOB_SHA1,
    ...result,
    interpretation: '103 of 729 original positions have candidate plaintext overlays. ' +
      '626 source runes have no claimed plaintext within this map. No full inverse is supplied.',
  }, null, 2));
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || String(error));
    process.exitCode = 1;
  });
}

module.exports = {analyze, gitBlobSha1};
