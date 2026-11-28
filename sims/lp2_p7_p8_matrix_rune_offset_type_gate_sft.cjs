'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'),
  'utf8'
).replace(/\r/g, '');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'),
  'utf8'
));

const runeSet = new Set(corpus.runes);
const parts = transcription.split('%');

/** @param {number} page */
function segment(page) {
  if (page === 50) return '';
  return parts[page >= 51 ? page - 1 : page];
}

/** @param {number} page */
function pageMeta(page) {
  const before = [];
  const after = [];
  let pending = '';
  let count = 0;

  for (const ch of Array.from(segment(page))) {
    if (runeSet.has(ch)) {
      before.push(pending);
      pending = '';
      count += 1;
    } else {
      pending += ch;
    }
  }
  for (let index = 0; index < count; index += 1) {
    after[index] = index + 1 < count ? before[index + 1] : pending;
  }
  return { before, after, count };
}

const metas = Array.from({ length: 58 }, (_, page) => pageMeta(page));

/** @param {number} page @param {number} offset */
function sourceType(page, offset) {
  const meta = metas[page];
  if (offset < 0 || offset >= meta.count) return 'X';

  const annotation = ink.pages.find((item) => item.page === page);
  const red = (annotation?.red_spans || []).some(
    (span) => offset >= span.start && offset < span.start + span.length
  );

  const before = meta.before[offset] || '';
  const after = meta.after[offset] || '';
  const start = offset === 0 || /[\s.\-&$§]/u.test(before);
  const end = offset === meta.count - 1 || /[\s.\-&$§]/u.test(after);
  const role = start && end ? 'S' : start ? 'W' : end ? 'E' : 'I';

  const largeBefore = (annotation?.large_punctuation || []).some(
    ([position]) => position === offset
  );
  const largeAfter = (annotation?.large_punctuation || []).some(
    ([position]) => position === offset + 1
  );

  return `${red ? 'R' : 'B'}${role}${largeBefore ? '<' : ''}${largeAfter ? '>' : ''}`;
}

const mv = [2, 28, 5, 28, 23, 28, 27];
const targetPages = [8, 9, 10, 11, 12, 13, 14];
const expected = {
  'forward/zero': ['RI', 'BE', 'BI', 'BI', 'BI', 'BS', 'BE'],
  'forward/one': ['RI', 'BI', 'BI', 'BI', 'BI', 'BE', 'BW'],
  'reverse/zero': ['BI', 'BE', 'BE', 'BI', 'BW', 'BS', 'BW'],
  'reverse/one': ['BI', 'BI', 'BI', 'BI', 'BE', 'BE', 'BE'],
};
const expectedCombinations = {
  'forward/zero': 2257920n,
  'forward/one': 11793600n,
  'reverse/zero': 714420n,
  'reverse/one': 7862400n,
};

const results = [];
for (const order of ['forward', 'reverse']) {
  for (const base of ['zero', 'one']) {
    const source = order === 'forward' ? mv : mv.slice().reverse();
    const offsets = source.map((value) => base === 'zero' ? value : value - 1);
    const signature = targetPages.map(
      (page, index) => sourceType(page, offsets[index])
    );
    const label = `${order}/${base}`;
    assert.deepEqual(signature, expected[label]);

    const matchingStarts = [];
    for (let start = 0; start <= 51; start += 1) {
      const candidate = Array.from(
        { length: 7 },
        (_, index) => sourceType(start + index, offsets[index])
      );
      if (candidate.join('|') === signature.join('|')) matchingStarts.push(start);
    }
    assert.deepEqual(matchingStarts, [8]);

    const perPage = targetPages.map((page, index) => {
      let matchingOffsets = 0;
      for (let offset = 0; offset < 29; offset += 1) {
        if (sourceType(page, offset) === signature[index]) matchingOffsets += 1;
      }
      return { page, type: signature[index], matchingOffsets };
    });

    const matchingCombinations = perPage.reduce(
      (product, item) => product * BigInt(item.matchingOffsets),
      1n
    );
    assert.equal(matchingCombinations, expectedCombinations[label]);

    results.push({
      order,
      base,
      offsets,
      signature,
      matchingStarts,
      localOffsetControl: {
        matchingCombinations: matchingCombinations.toString(),
        totalCombinations: (29n ** 7n).toString(),
        perPage,
      },
    });
  }
}

console.log(JSON.stringify({
  status: 'PASS',
  note: 'No selected rune identity is loaded or emitted; only source types are classified.',
  mv,
  results,
  decision: 'The four natural presentations are not distinguished by source type; retire the direct local-rune-offset readout.',
}, null, 2));
