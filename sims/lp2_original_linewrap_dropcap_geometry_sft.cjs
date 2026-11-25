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
const fs = require('node:fs');
const path = require('node:path');
const { parseOriginal, fit, classify } = require('./lp2_original_linewrap_greedy_geometry_sft.cjs');

/** @typedef {{page:number,firstLine:number,width:number}} RedCap */

/** @type {readonly RedCap[]} */
const RED_CAPS = Object.freeze([
  {page: 0, firstLine: 0, width: 150},
  {page: 3, firstLine: 0, width: 150},
  {page: 3, firstLine: 6, width: 229},
  {page: 6, firstLine: 4, width: 149},
  {page: 8, firstLine: 0, width: 284},
  {page: 15, firstLine: 1, width: 150},
  {page: 23, firstLine: 0, width: 230},
  {page: 27, firstLine: 0, width: 230},
  {page: 33, firstLine: 0, width: 230},
  {page: 33, firstLine: 5, width: 219},
  {page: 39, firstLine: 6, width: 231},
  {page: 40, firstLine: 0, width: 150},
  {page: 54, firstLine: 0, width: 149}
]);

/** @type {number} */
const GAP = 12; // Approximate 12px original x-gap between the giant and text.
/** @type {number} */
const CAP_LINES = 3; // 497-498px tall originals overlap three 188px lines.
const NUMBER_INSET = 76; // Independent original JPEG first-black x676–680 vs normal x~601.

/**
 * @param {{page:number,line:number,base:number,firstWidth:number,nextWidth:number,inside:boolean,ending:string}} b
 * @param {{W:number,dash:number,stop:number}} model
 * @param {number} [gap]
 * @param {number} [heightLines]
 * @returns {'forced'|'early'|'overflow'}
 */
function classifyWithOriginalDropcap(b, model, gap = GAP, heightLines = CAP_LINES) {
  return classify({ ...b, base: b.base + redCapMargin(b, gap, heightLines) +
    (b.numericPrefix ? NUMBER_INSET : 0) }, model);
}

/**
 * @param {{page:number,line:number,firstWidth:number}} b
 * @param {number} [gap]
 * @param {number} [heightLines]
 * @returns {number}
 */
function redCapMargin(b, gap = GAP, heightLines = CAP_LINES) {
  const red = RED_CAPS.find(c => c.page === b.page &&
    b.line >= c.firstLine && b.line < c.firstLine + heightLines);
  return red ? red.width + gap - (b.line === red.firstLine ? b.firstWidth : 0) : 0;
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
      b.line >= c.firstLine && b.line < c.firstLine + CAP_LINES).length, 0), 39);

  const r = compare(source.breaks, model);
  assert.deepEqual(r.originalAll,
    {forced: 450, early: 78, overflow: 11, total: 539, earlyParagraphs: 11});
  assert.deepEqual(r.imageAll,
    {forced: 484, early: 40, overflow: 15, total: 539, earlyParagraphs: 11});
  assert.deepEqual(r.originalHoldoutWithinWord,
    {forced: 174, early: 29, overflow: 5, total: 208, earlyParagraphs: 0});
  assert.deepEqual(r.imageHoldoutWithinWord,
    {forced: 186, early: 14, overflow: 8, total: 208, earlyParagraphs: 0});
  assert.deepEqual(r.originalRedCapLines,
    {forced: 0, early: 39, overflow: 0, total: 39, earlyParagraphs: 0});
  assert.deepEqual(r.imageRedCapLines,
    {forced: 31, early: 6, overflow: 2, total: 39, earlyParagraphs: 0});

  // Exact shortfall of the residual 29 original nonparagraph early joins.
  // This is a geometric diagnostic, not a key extraction channel.
  const residualSlack = source.breaks
    .filter(b => b.ending !== '.' && classifyWithOriginalDropcap(b, model) === 'early')
    .map(b => model.W - b.base - redCapMargin(b) - (b.numericPrefix ? NUMBER_INSET : 0) - b.dashes * model.dash -
      b.stops * model.stop - b.nextWidth).sort((a, b) => a - b);
  assert.equal(residualSlack.length, 29);
  const residualCounts = { within10: 15, within20: 19, within30: 22,
    within50: 26, within75: 29, within100: 29, over150: 0 };
  for (const [name, limit] of Object.entries({
    within10: 10, within20: 20, within30: 30, within50: 50,
    within75: 75, within100: 100
  })) {
    assert.equal(residualSlack.filter(n => n <= limit).length, residualCounts[name], name);
  }
  assert.equal(residualSlack.filter(n => n > 150).length, residualCounts.over150);
  assert.ok(Math.abs(residualSlack[14] - 8.969) < 0.001);

  // Freeze a source-early normal-line tolerance, then test later pages.
  // The only exclusions are source-visible paragraph-ending short lines.
  const normal = source.breaks.map(b => {
    const l = b.base + redCapMargin(b) + (b.numericPrefix ? NUMBER_INSET : 0) +
      b.dashes * model.dash + b.stops * model.stop;
    const kind = classifyWithOriginalDropcap(b, model);
    const shortfall = kind === 'early' ? model.W - l - b.nextWidth :
      kind === 'overflow' ? l - model.W : 0;
    return { page: b.page, line: b.line, kind, shortfall,
      paragraph: kind === 'early' && b.ending === '.' };
  }).filter(b => !b.paragraph);
  const trainNormal = normal.filter(b => b.page < 28);
  const heldoutNormal = normal.filter(b => b.page >= 28);
  assert.equal(trainNormal.length, 278);
  assert.equal(heldoutNormal.length, 250);
  const maxTrainingMiss = Math.max(...trainNormal.map(b => b.shortfall));
  const trainingTolerance = Math.ceil(maxTrainingMiss);
  assert.equal(trainingTolerance, 51);
  const heldoutInTolerance = heldoutNormal.filter(b => b.shortfall <= trainingTolerance);
  const heldoutExceptions = heldoutNormal.filter(b => b.shortfall > trainingTolerance)
    .map(b => [b.page, b.line]);
  assert.equal(heldoutInTolerance.length, 248);
  assert.deepEqual(heldoutExceptions, [[40, 8], [42, 5]]);
  assert.ok(Math.max(...heldoutNormal.map(b => b.shortfall)) < 73);

  // Literal source endpoint ledger for all non-forced joins (#2838).
  // This does not tune thresholds or select a key by output.
  const alphabet = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
  const names = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split(' ');
  const original = fs.readFileSync(path.join(__dirname, '..', 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
  const pages = original.split('%').slice(0, 55).map(rec =>
    rec.split('/').map(row => [...row].filter(c => alphabet.includes(c))).filter(row => row.length));
  const residualLedger = source.breaks.filter(b => classifyWithOriginalDropcap(b, model) !== 'forced').map(b => {
    const page = pages[b.page < 50 ? b.page : b.page - 1];
    const last = page[b.line].at(-1), next = page[b.line + 1][0];
    const kind = classifyWithOriginalDropcap(b, model);
    const end = b.base + redCapMargin(b) + (b.numericPrefix ? NUMBER_INSET : 0) +
      b.dashes * model.dash + b.stops * model.stop;
    const deviation = kind === 'early' ? model.W - end - b.nextWidth : end - model.W;
    assert.ok(deviation >= -1e-9);
    return {page:b.page, line:b.line, kind, paragraph:kind === 'early' && b.ending === '.',
      deviation, last, next, lastGP:names[alphabet.indexOf(last)], nextGP:names[alphabet.indexOf(next)]};
  });
  assert.equal(residualLedger.length, 55);
  const literal = residualLedger.filter(b => !b.paragraph && b.deviation > trainingTolerance);
  assert.deepEqual(literal.map(b => b.lastGP), ['T','T']);
  assert.deepEqual(literal.map(b => b.nextGP), ['F','H']);
  assert.ok(Math.abs(residualLedger.find(b => b.page === 36 && b.line === 5).deviation - 14.178) < .001);
  assert.ok(Math.abs(residualLedger.find(b => b.page === 37 && b.line === 4).deviation - 14.029) < .001);

  const sensitivity = [0, 8, 12, 16, 24].map(gap => {
    const result = compare(source.breaks, model, gap, CAP_LINES);
    return { gap, all: result.imageAll, withheld: result.imageHoldoutWithinWord };
  });

  console.log(JSON.stringify({
    originalJPEG: 'liber-primus-jpegs/<page + 17>.jpg',
    redConnectedComponents: RED_CAPS,
    model, gap: GAP, heightLines: CAP_LINES, numberedPrefixInset: NUMBER_INSET, observations: r,
    sensitivity, normalLineTolerance: { trainingTolerance, maxTrainingMiss, train: trainNormal.length,
      heldout: heldoutNormal.length, heldoutInTolerance: heldoutInTolerance.length, heldoutExceptions }, residualLedger, literalResidualTapes: {last:literal.map(b=>b.last).join(''), next:literal.map(b=>b.next).join('')}, residualShortfall: { median: residualSlack[14], ...residualCounts }, conclusion: 'Source-correct red initials and five original red numerals explain 34 more joins; ciphertext remains undeciphered.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = { RED_CAPS, redCapMargin, classifyWithOriginalDropcap, compare };
