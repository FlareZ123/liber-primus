'use strict';
/**
 * Original-JPEG red-dropcap geometry against independently frozen
 * GP29 printed-line greedy compositor. Windows 11 / Node.js 22 SFT.
 *
 * Red connected-component widths come from the source 2014 LP2
 * 2400x3600 JPEGs, archive indices physicalPage+17.
 * Geometry selectors (page, printed line) were established from the
 * actual illustrated first three text lines following each red initial,
 * independently of which compositor joins the model predicts.
 *
 * This is an original-layout control, NOT a decoded LP2 cipher.
 */
const assert = require('node:assert/strict');
const { parseOriginal, fit, classify } = require('./lp2_original_linewrap_greedy_geometry_sft.cjs');

/** @typedef {{page:number,firstLine:number,width:number}} RedCap */

/** @type {readonly RedCap[]} */
const RED_CAPS = Object.freeze([
  {page: 0, firstLine: 0, width: 150},
  {page: 3, firstLine: 0, width: 150},
  {page: 3, firstLine: 6, width: 229},
  {page: 6, firstLine: 3, width: 149},
  {page: 8, firstLine: 0, width: 284},
  {page: 15, firstLine: 6, width: 150},
  {page: 23, firstLine: 0, width: 230},
  {page: 27, firstLine: 0, width: 230},
  {page: 33, firstLine: 0, width: 230},
  {page: 33, firstLine: 6, width: 219},
  {page: 39, firstLine: 5, width: 231},
  {page: 40, firstLine: 0, width: 150},
  {page: 54, firstLine: 0, width: 149}
]);

/** @type {number} */
const GAP = 12; // Approximate 12px original x-gap between the giant and text.
/** @type {number} */
const CAP_LINES = 3; // 497-498px tall originals overlap three 188px lines.

/**
 * @param {{page:number,line:number,base:number,firstWidth:number,nextWidth:number,inside:boolean,ending:string}} b
 * @param {{W:number,dash:number,stop:number}} model
 * @param {number} [gap]
 * @param {number} [heightLines]
 * @returns {'forced'|'early'|'overflow'}
 */
function classifyWithOriginalDropcap(b, model, gap = GAP, heightLines = CAP_LINES) {
  const red = RED_CAPS.find(c => c.page === b.page &&
    b.line >= c.firstLine && b.line < c.firstLine + heightLines);
  const margin = red ? red.width + gap - (b.line === red.firstLine ? b.firstWidth : 0) : 0;
  return classify({ ...b, base: b.base + margin }, model);
}

/**
 * @param {ReturnType<typeof parseOriginal>['breaks']} breaks
 * @param {{W:number,dash:number,stop:number}} model
 * @param {number} [gap]
 * @param {number} [heightLines]
 * @returns {Record<string,{forced:number,early:number,overflow:number,total:number,earlyParagraphs:number}>}
 */
function compare(breaks, model, gap = GAP, heightLines = CAP_LINES) {
  const groups = {
    originalAll: { predicate: () => true, image: false },
    imageAll: { predicate: () => true, image: true },
    originalHoldoutWithinWord: { predicate: b => b.page >= 28 && b.inside, image: false },
    imageHoldoutWithinWord: { predicate: b => b.page >= 28 && b.inside, image: true },
    originalRedCapLines: {
      predicate: b => RED_CAPS.some(c => c.page === b.page &&
        b.line >= c.firstLine && b.line < c.firstLine + heightLines), image: false
    },
    imageRedCapLines: {
      predicate: b => RED_CAPS.some(c => c.page === b.page &&
        b.line >= c.firstLine && b.line < c.firstLine + heightLines), image: true
    }
  };
  /** @type {Record<string,{forced:number,early:number,overflow:number,total:number,earlyParagraphs:number}>} */
  const result = {};
  for (const [name, group] of Object.entries(groups)) {
    const events = breaks.filter(group.predicate);
    const stats = { forced: 0, early: 0, overflow: 0, total: events.length, earlyParagraphs: 0 };
    for (const event of events) {
      const prediction = group.image ? classifyWithOriginalDropcap(event, model, gap, heightLines) : classify(event, model);
      stats[prediction]++;
      if (prediction === 'early' && event.ending === '.') stats.earlyParagraphs++;
    }
    result[name] = stats;
  }
  return result;
}

function main() {
  const source = parseOriginal();
  const model = fit(source.breaks);
  assert.deepEqual(model, { W: 1200, dash: 16, stop: 46, trainScore: 184 });
  assert.equal(RED_CAPS.length, 13);
  assert.equal(RED_CAPS.reduce((n, c) =>
    n + source.breaks.filter(b => b.page === c.page &&
      b.line >= c.firstLine && b.line < c.firstLine + CAP_LINES).length, 0), 37);

  const r = compare(source.breaks, model);
  assert.deepEqual(r.originalAll,
    {forced: 450, early: 78, overflow: 11, total: 539, earlyParagraphs: 11});
  assert.deepEqual(r.imageAll,
    {forced: 473, early: 50, overflow: 16, total: 539, earlyParagraphs: 11});
  assert.deepEqual(r.originalHoldoutWithinWord,
    {forced: 174, early: 29, overflow: 5, total: 208, earlyParagraphs: 0});
  assert.deepEqual(r.imageHoldoutWithinWord,
    {forced: 180, early: 20, overflow: 8, total: 208, earlyParagraphs: 0});
  assert.deepEqual(r.originalRedCapLines,
    {forced: 2, early: 35, overflow: 0, total: 37, earlyParagraphs: 2});
  assert.deepEqual(r.imageRedCapLines,
    {forced: 25, early: 7, overflow: 5, total: 37, earlyParagraphs: 2});

  const sensitivity = [0, 8, 12, 16, 24].map(gap => {
    const result = compare(source.breaks, model, gap, CAP_LINES);
    return { gap, all: result.imageAll, withheld: result.imageHoldoutWithinWord };
  });

  console.log(JSON.stringify({
    originalJPEG: 'liber-primus-jpegs/<page + 17>.jpg',
    redConnectedComponents: RED_CAPS,
    model, gap: GAP, heightLines: CAP_LINES, observations: r,
    sensitivity, conclusion: 'Physical drop-cap footprint predicts 23 more original wraps; ciphertext remains undeciphered.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { RED_CAPS, classifyWithOriginalDropcap, compare };
