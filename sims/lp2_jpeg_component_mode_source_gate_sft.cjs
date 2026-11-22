'use strict';

/**
 * Source gate for the LP1/LP2 JPEG component-mode split.
 *
 * The hypothesis being tested is that the 23 one-component LP2 JPEGs form an
 * independent binary/numeric clue. The test instead asks whether component
 * count is completely predicted by visible production requirements already
 * present in the originals: red ink, plus the established p34-p39 shared
 * cuneiform-header composite group. No ciphertext language scoring is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const imageDir = path.join(root, 'resources', 'liber-primus');
const inkPath = path.join(imageDir, 'lp2-ink-annotations.json');

/** @param {Buffer} data @returns {number} */
function jpegComponentCount(data) {
  assert.equal(data[0], 0xff, 'JPEG must begin with SOI');
  assert.equal(data[1], 0xd8, 'JPEG must begin with SOI');
  let i = 2;
  while (i + 4 <= data.length) {
    while (i < data.length && data[i] !== 0xff) i += 1;
    while (i < data.length && data[i] === 0xff) i += 1;
    if (i >= data.length) break;
    const marker = data[i];
    const markerStart = i - 1;
    i += 1;

    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    assert.ok(i + 2 <= data.length, 'truncated JPEG segment length');
    const segmentLength = data.readUInt16BE(i);
    assert.ok(segmentLength >= 2, 'invalid JPEG segment length');

    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      assert.ok(markerStart + 10 <= data.length, 'truncated JPEG SOF');
      return data[markerStart + 9];
    }
    i += segmentLength;
  }
  throw new Error('No supported JPEG SOF marker found');
}

/** @param {object} page @returns {boolean} */
function hasRedInk(page) {
  const spans = Array.isArray(page.red_spans) ? page.red_spans : [];
  if (spans.some((span) => Number(span.length) > 0)) return true;
  const marks = Array.isArray(page.large_punctuation) ? page.large_punctuation : [];
  return marks.some((mark) => mark[2] === 'red');
}

const ink = JSON.parse(fs.readFileSync(inkPath, 'utf8'));
const annotationByPage = new Map((ink.pages || []).map((page) => [page.page, page]));
const components = [];
for (let scan = 0; scan <= 74; scan += 1) {
  const file = path.join(imageDir, String(scan).padStart(2, '0') + '.jpg');
  components.push(jpegComponentCount(fs.readFileSync(file)));
}

assert.deepEqual(new Set(components), new Set([1, 3]), 'unexpected JPEG component count');
assert.ok(components.slice(0, 33).every((n) => n === 3), 'source scans 00-32 are not uniformly RGB');

const lp2 = [];
for (let page = 0; page < 58; page += 1) {
  const scan = page + 17;
  const n = components[scan];
  const annotation = annotationByPage.get(page) || {};
  lp2.push({page, scan, components:n, red:hasRedInk(annotation)});
}

const grayPages = lp2.filter((x) => x.components === 1).map((x) => x.page);
const rgbPages = lp2.filter((x) => x.components === 3).map((x) => x.page);
const redPages = lp2.filter((x) => x.red).map((x) => x.page);
const lateRgbWithoutRed = lp2
  .filter((x) => x.page >= 16 && x.components === 3 && !x.red)
  .map((x) => x.page);

assert.deepEqual(grayPages, [
  16,17,18,19,20,21,24,25,28,29,30,31,
  41,42,43,44,45,46,47,48,50,51,52
]);
assert.equal(grayPages.length, 23);
assert.equal(rgbPages.length, 35);
assert.equal(redPages.length, 24);
assert.ok(lp2.filter((x) => x.components === 1).every((x) => !x.red), 'a grayscale page carries annotated red ink');
assert.deepEqual(lateRgbWithoutRed, [34,35,37]);

for (const x of lp2.filter((x) => x.page >= 16)) {
  const inCuneiformComposite = x.page >= 34 && x.page <= 39;
  const predicted = x.red || inCuneiformComposite ? 3 : 1;
  assert.equal(x.components, predicted, `component classifier failed on p${x.page}`);
}

/** @param {Array<{components:number}>} xs @returns {Array<{components:number,length:number}>} */
function runs(xs) {
  const out = [];
  for (const x of xs) {
    const last = out[out.length - 1];
    if (last && last.components === x.components) last.length += 1;
    else out.push({components:x.components, length:1});
  }
  return out;
}

const summary = {
  source00to32AllRGB: true,
  lp2Counts: {rgb:rgbPages.length, grayscale:grayPages.length, redAnnotated:redPages.length},
  lp2ModeRuns: runs(lp2),
  grayscalePages: grayPages,
  lateRgbWithoutRed,
  postP16Classifier: 'RGB iff red-annotated OR p34-p39 shared-cuneiform composite; otherwise grayscale',
  postP16PagesChecked: 42,
  postP16Mismatches: 0,
  consequence: 'JPEG component mode has no unexplained post-p16 residual bit after visible production state is accounted for'
};
console.log(JSON.stringify(summary, null, 2));
