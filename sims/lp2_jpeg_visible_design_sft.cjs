'use strict';

/**
 * Exact visible-page-design <-> original JPEG component-mode gate for LP2.
 *
 * The visual classification is source-facing:
 *  - red-marked pages come from the canonical ink annotations;
 *  - p37 has visible red numeric labels in original 54.jpg, outside that
 *    rune/punctuation annotation schema;
 *  - the ten listed pages have conspicuous black illustrations/ornaments and
 *    no catalogued red ink. Their list is a frozen manual read of originals.
 *
 * This SFT asks only whether that visible decorated/plain classification
 * exactly matches one- versus three-component encoding in the original bytes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inspect, runs } = require('./lp2_jpeg_header_sft.cjs');

const root = path.resolve(__dirname, '..');
const images = path.join(root, 'resources', 'liber-primus');
const ink = JSON.parse(
  fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8')
);

const annotatedRedPages = ink.pages
  .filter((page) =>
    (page.red_spans || []).length ||
    (page.large_punctuation || []).some((item) => item[2] === 'red')
  )
  .map((page) => page.page)
  .sort((a, b) => a - b);
assert.deepEqual(annotatedRedPages, [
  0,2,3,6,7,8,14,15,22,23,26,27,32,33,36,38,39,40,49,53,54,55,56,57,
]);

// Original p37 contains visible red numeric labels, which are intentionally
// outside the rune-span / large-punctuation annotation schema.
const visibleRedOutsideInkSchema = [37];

// Frozen direct visual read of original images: black illustration/ornament,
// but no catalogued red ink. p1 cross/tree; p4-5 scroll ornaments; p9-13
// rooted-tree graphics; p34-35 top symbols.
const blackIllustrationOnlyPages = [1,4,5,9,10,11,12,13,34,35];

const decoratedPages = [...new Set([
  ...annotatedRedPages,
  ...visibleRedOutsideInkSchema,
  ...blackIllustrationOnlyPages,
])].sort((a, b) => a - b);
assert.equal(decoratedPages.length, 35);

const components = [];
let allIccAreRgb = true;
for (let page = 0; page < 58; page += 1) {
  const raw = fs.readFileSync(path.join(images, String(page + 17).padStart(2, '0') + '.jpg'));
  const parsed = inspect(raw);
  const sof = parsed.sections.find((segment) => segment.id === 0xc0);
  assert(sof, 'missing SOF0 p' + page);
  components.push(sof.bytes[5]);

  const app2 = parsed.sections.find((segment) => segment.id === 0xe2);
  assert(app2, 'missing APP2 p' + page);
  assert(app2.bytes.subarray(0, 12).equals(Buffer.from('ICC_PROFILE\0')));
  const iccStart = 14; // ICC_PROFILE\0 + sequence/count bytes
  if (app2.bytes.subarray(iccStart + 16, iccStart + 20).toString('ascii') !== 'RGB ') {
    allIccAreRgb = false;
  }
}
assert(components.every((x) => x === 1 || x === 3));
assert.equal(allIccAreRgb, true);

const rgbPages = components.flatMap((count, page) => count === 3 ? [page] : []);
const grayscalePages = components.flatMap((count, page) => count === 1 ? [page] : []);
assert.deepEqual(rgbPages, decoratedPages);
assert.deepEqual(grayscalePages, [
  16,17,18,19,20,21,24,25,28,29,30,31,41,42,43,44,45,46,47,48,50,51,52,
]);

const modeRuns = runs(components);
assert.deepEqual(modeRuns, [16,6,2,2,2,4,9,8,1,3,5]);
const plainRunLengths = modeRuns.filter((_, i) => i % 2 === 1);
assert.deepEqual(plainRunLengths, [6,2,4,8,3]);

console.log(JSON.stringify({
  annotatedRedPages,
  visibleRedOutsideInkSchema,
  blackIllustrationOnlyPages,
  decoratedPages,
  rgbPages,
  grayscalePages,
  exactVisibleDesignToComponentMatch: true,
  allEmbeddedIccDataSpaces: 'RGB',
  modeRuns,
  plainRunLengths,
  interpretation: 'JPEG component mode is an exact machine-checkable proxy for the visible decorated/plain page partition; it is not an independent hidden channel.',
}, null, 2));
