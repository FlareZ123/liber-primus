'use strict';
/**
 * Source-native LP2 printed-line greedy-wrap decoder.
 *
 * Question: can a deterministic visual compositor account for the observed
 * physical breaks, leaving little independent break-position metadata?
 * The 29 rune advances were independently fitted to original scan 60.jpg,
 * first seven lines, in source_glyph_advance_inversion.py.
 *
 * Fit only the normal line width and the printed '-' / '.' advances on
 * within-word lines of physical pp0–27; evaluate disjoint pp28–55.
 * Inputs stay in their original source order. No plaintext is inferred.
 * Windows 11 / Node.js 22 standalone SFT, read only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { WIDTHS } = require('./line_start_raster_width_control.cjs');

/** @type {string} */
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const IDS = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.equal(WIDTHS.length, 29);

/**
 * @typedef {{ page:number, line:number, inside:boolean, base:number,
 *            dashes:number, stops:number, firstWidth:number,
 *            ending:string, nextWidth:number }} Break
 */

/** @returns {{breaks:Break[],pageCount:number,runeCount:number,lineCount:number}} */
function parseOriginal() {
  const sourcePages = raw.split('%').slice(0, 55);
  assert.equal(sourcePages.length, 55);
  /** @type {Break[]} */
  const breaks = [];
  let runeCount = 0;
  let lineCount = 0;

  for (const [page, rec] of sourcePages.entries()) {
    const originalPage = page < 50 ? page : page + 1;
    const glyphs = [...rec].filter(c => IDS.has(c)).map(c => IDS.get(c));
    assert.deepEqual(glyphs, corpus.pages[originalPage].indices,
      'original rune transcription mismatch, physical LP2 p' + originalPage);
    runeCount += glyphs.length;

    const lines = rec.split('/').filter(s => [...s].some(c => IDS.has(c)));
    lineCount += lines.length;
    for (let line = 0; line < lines.length - 1; line++) {
      const printed = [...lines[line]].filter(c => IDS.has(c) || c === '-' || c === '.');
      const next = [...lines[line + 1]].find(c => IDS.has(c));
      assert(next !== undefined);
      breaks.push({
        page: originalPage,
        line,
        inside: IDS.has(printed.at(-1)),
        base: printed.reduce((v, ch) => v + (IDS.has(ch) ? WIDTHS[IDS.get(ch)] : 0), 0),
        dashes: printed.filter(c => c === '-').length,
        stops: printed.filter(c => c === '.').length,
        firstWidth: WIDTHS[IDS.get(printed.find(c => IDS.has(c)))],
        ending: printed.at(-1),
        nextWidth: WIDTHS[IDS.get(next)]
      });
    }
  }
  assert.equal(runeCount, 12956);
  assert.equal(lineCount, 594);
  assert.equal(breaks.length, 539);
  assert.equal(breaks.filter(b => b.inside).length, 418);
  return { breaks, pageCount: 55, runeCount, lineCount };
}

/**
 * Fixed-page, fixed-text greedy width condition: a line fits,
 * and adding the first rune of the next line would overflow.
 * @param {Break} b
 * @param {{W:number,dash:number,stop:number}} p
 * @returns {'forced'|'early'|'overflow'}
 */
function classify(b, p) {
  const end = b.base + b.dashes * p.dash + b.stops * p.stop;
  if (end > p.W) return 'overflow';
  if (end + b.nextWidth > p.W) return 'forced';
  return 'early';
}

/**
 * Freeze one compositor model from untouched early within-word breaks.
 * Only 17*18*51 finite choices, with exact deterministic tie order.
 * @param {Break[]} breaks
 * @returns {{W:number,dash:number,stop:number,trainScore:number}}
 */
function fit(breaks) {
  let best = { W: 1150, dash: 8, stop: 16, trainScore: -1 };
  const train = breaks.filter(b => b.page < 28 && b.inside);
  assert.equal(train.length, 210);
  for (let dash = 8; dash <= 24; dash++) {
    for (let stop = 16; stop <= 50; stop += 2) {
      for (let W = 1150; W <= 1250; W += 2) {
        const p = { W, dash, stop };
        const score = train.reduce((n, b) => n + Number(classify(b, p) === 'forced'), 0);
        if (score > best.trainScore) best = { ...p, trainScore: score };
      }
    }
  }
  return best;
}

/**
 * @param {Break[]} breaks
 * @param {{W:number,dash:number,stop:number}} model
 * @returns {Record<string, {forced:number, early:number, overflow:number, total:number}>}
 */
function evaluate(breaks, model) {
  const conditions = {
    trainWithinWord: b => b.page < 28 && b.inside,
    heldoutWithinWord: b => b.page >= 28 && b.inside,
    trainAll: b => b.page < 28,
    heldoutAll: b => b.page >= 28,
    allWithinWord: b => b.inside,
    allWordGap: b => !b.inside,
    all: () => true
  };
  /** @type {Record<string, {forced:number, early:number, overflow:number, total:number}>} */
  const out = {};
  for (const [name, include] of Object.entries(conditions)) {
    const selected = breaks.filter(include);
    const counts = { forced: 0, early: 0, overflow: 0, total: selected.length };
    for (const b of selected) counts[classify(b, model)]++;
    out[name] = counts;
  }
  return out;
}

function main() {
  const src = parseOriginal();
  const model = fit(src.breaks);
  const result = evaluate(src.breaks, model);
  assert.deepEqual(model, { W: 1200, dash: 16, stop: 46, trainScore: 184 });
  assert.deepEqual(result.trainWithinWord, { forced: 184, early: 24, overflow: 2, total: 210 });
  assert.deepEqual(result.heldoutWithinWord, { forced: 174, early: 29, overflow: 5, total: 208 });
  assert.deepEqual(result.all, { forced: 450, early: 78, overflow: 11, total: 539 });
  assert.deepEqual(result.allWordGap, { forced: 92, early: 25, overflow: 4, total: 121 });

  const byPage = new Map();
  for (const b of src.breaks) {
    const cur = byPage.get(b.page) || { page: b.page, total: 0, early: 0, overflow: 0 };
    cur.total++;
    if (classify(b, model) === 'early') cur.early++;
    if (classify(b, model) === 'overflow') cur.overflow++;
    byPage.set(b.page, cur);
  }
  const outliers = [...byPage.values()]
    .sort((a, b) => (b.early / b.total) - (a.early / a.total))
    .slice(0, 12);

  console.log(JSON.stringify({
    source: ['resources/liber-primus/lp2-transcription.txt',
      'resources/liber-primus/lp2-corpus.json',
      'sims/line_start_raster_width_control.cjs'],
    pages: src.pageCount, runes: src.runeCount,
    lines: src.lineCount, wraps: src.breaks.length,
    model, counts: result, earlyOutliers: outliers
  }, null, 2));
}

if (require.main === module) main();
module.exports = { parseOriginal, classify, fit, evaluate };
