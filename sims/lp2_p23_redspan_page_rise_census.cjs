'use strict';

/**
 * Census the source-visible page+red-span-length "rise" relation.
 * This is a descriptive structural test, not proof that addition is an
 * authored operation. It reports every red span whose page index plus
 * span length lands on another page with a red span, then distinguishes
 * the p23->p39 centered pair from the p3->p6 control.
 *
 * Node.js 22+, deterministic and offline.
 */
const fs = require('node:fs');
const a = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const pages = new Map(a.pages.map(p => [p.page, p]));
const spans = [];
for (const page of a.pages) {
  for (const span of (page.red_spans || [])) {
    const targetPage = page.page + span.length;
    const target = pages.get(targetPage);
    spans.push({
      source_page: page.page,
      source_start: span.start,
      source_length: span.length,
      target_page: targetPage,
      target_red_spans: target?.red_spans || [],
      target_rune_count: target?.rune_count ?? null
    });
  }
}
const hits = spans.filter(x => x.target_red_spans.length > 0);
const p23 = spans.find(x => x.source_page === 23 && x.source_start === 0 && x.source_length === 16);
const p39 = pages.get(39);
const p3 = spans.find(x => x.source_page === 3 && x.source_length === 3);
const p6 = pages.get(6);
if (spans.length !== 18) throw new Error('Expected 18 original red spans');
if (hits.length !== 2) throw new Error('Unexpected page+span-length hit count');
if (!p23 || p23.target_page !== 39) throw new Error('p23+16 did not select p39');
if (!p39 || p39.rune_count !== 240 || p39.red_spans.length !== 1 ||
    p39.red_spans[0].start !== 119 || p39.red_spans[0].length !== 3) {
  throw new Error('p39 centered red3 source coordinates changed');
}
if (!p3 || p3.target_page !== 6 || !p6 || p6.red_spans.length !== 1 ||
    p6.red_spans[0].start !== 71 || p6.red_spans[0].length !== 11) {
  throw new Error('Expected p3+3 -> p6 control');
}
const p39Centered = p39.red_spans[0].start === Math.floor((p39.rune_count - 3) / 2);
const p6Centered = p6.red_spans[0].start === Math.floor((p6.rune_count - 11) / 2);
const summary = {
  schema: 1,
  source: 'resources/liber-primus/lp2-ink-annotations.json',
  red_span_count: spans.length,
  all_page_plus_length_hits: hits,
  p23_to_p39: {
    source_page: 23, source_red_start: 0, source_red_length: 16,
    target_page: 39, target_red_start: 119, target_red_length: 3,
    target_rune_count: 240, target_red3_centered: p39Centered,
    source_midpoint_word_boundary: 'previously established: p23 red word lengths [2,6,3,5], boundary 8|8'
  },
  p3_to_p6_control: {
    source_page: 3, source_red_start: 119, source_red_length: 3,
    target_page: 6, target_red_start: 71, target_red_length: 11,
    target_rune_count: 196, target_red11_centered: p6Centered
  },
  interpretation_boundary: 'p23+16=39 is a candidate rise selector; the arithmetic operation is not independently authenticated by this census'
};
console.log('LP2-P23-REDSPAN-PAGE-RISE-CENSUS', JSON.stringify(summary));
