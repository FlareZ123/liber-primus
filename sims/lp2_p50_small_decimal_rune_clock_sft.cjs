#!/usr/bin/env node
'use strict';
/*
 * Original LP2 source-visible 0D gate clock discrimination.
 *
 * No plaintext fitting, charset search, phase optimization for acceptance,
 * hidden-key inference, or generated "solve" claim.  The source-defined
 * 0[0-9] token mask is compared under twenty explicit source-typed left-endpoint
 * clocks.  Each receives *all* 256 origin phases as an adversarial diagnostic,
 * in addition to the literal p0 phase-zero readout.
 *
 * Usage: node sims/lp2_p50_small_decimal_rune_clock_sft.cjs
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;
const ROOT = path.resolve(__dirname, '..');
function load(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const annotations = load('resources/liber-primus/lp2-ink-annotations.json');
const table = load('resources/liber-primus/lp2-grid-256.json');
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(pages.reduce((n,p) => n + p.indices.length, 0), 12956);
const tokens = table.pages.flatMap(p => p.tokens.flat());
assert.equal(tokens.length, 256);
const small = tokens.flatMap((t,i) => /^0[0-9]$/.test(t) ? [i] : []);
assert.deepEqual(small, [13,39,192,210,229]);
const smallSet = new Set(small);
const cipher = [], red = [], pageId = [], pageStart = [];
for (let pi = 0; pi < pages.length; pi++) {
  const p = pages[pi], start = cipher.length;
  pageStart.push(start);
  const annotation = annotations.pages.find(a => a.page === p.page);
  const ink = Array(p.indices.length).fill(0);
  for (const span of annotation?.red_spans || []) {
    assert(span.start >= 0 && span.start + span.length <= p.indices.length);
    for (let k = span.start; k < span.start + span.length; k++) ink[k] = 1;
  }
  cipher.push(...p.indices);
  red.push(...ink);
  pageId.push(...Array(p.indices.length).fill(pi));
}
assert.equal(cipher.length, 12956);
assert.equal(red.reduce((a,b) => a+b,0), 213);
const blackPrefix = [0];
for (const isRed of red) blackPrefix.push(blackPrefix.at(-1) + 1 - isRed);
const nonFPrefix = [0], nonFNonRedPrefix = [0];
for (let i=0; i<cipher.length; i++) {
  nonFPrefix.push(nonFPrefix.at(-1) + Number(cipher[i] !== 0));
  nonFNonRedPrefix.push(nonFNonRedPrefix.at(-1) + Number(cipher[i] !== 0 && !red[i]));
}
assert.equal(nonFPrefix.at(-1),12498);
// The original transcript (not typographic guesses from the JPEG) fixes
// 2,896 printed groups and 594 physical lines; wraps / and pages % are NOT
// word breaks. This assertion independently ties all reset sites to GP runes.
const sourceText = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeId = new Map(corpus.runes.map((r,i) => [r,i]));
const wordStart = [], lineStart = [];
let offset = 0, wstart = 0, lstart = 0, wordPending = false, wordCount = 0;
for (const ch of sourceText) {
  if (offset === cipher.length) break; // the source also includes solved p56/p57
  if (runeId.has(ch)) {
    assert.equal(cipher[offset], runeId.get(ch), 'original word/line glyph ' + offset);
    wordStart.push(wstart);
    lineStart.push(lstart);
    offset++;
    wordPending = true;
  } else if ('-.&$§'.includes(ch)) {
    if (wordPending) wordCount++;
    wordPending = false;
    wstart = offset;
  } else if ('/%'.includes(ch)) {
    lstart = offset;
  }
}
if (wordPending) wordCount++;
assert.equal(offset, cipher.length);
assert.equal(wordCount, 2896);
assert.equal(new Set(lineStart).size, 594);

// All nine physically printed chapter cuts are fixed by original title/
/// ornament boundaries, not by optimizing the 0D event score. The p50
// runeless page lies inside the p40..53 chapter.
const chapterPageGroups = [
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]
];
const chapterStart = Array(cipher.length);
for (const [first,last] of chapterPageGroups) {
  const begin = pageStart[first];
  const end = last === 55 ? cipher.length : pageStart[last+1];
  chapterStart.fill(begin,begin,end);
}
assert.equal(chapterStart.filter(x=>x === 0).length,729);

const segmentStarts = {
  continuous: Array(cipher.length).fill(0),
  chapter_reset: chapterStart,
  page_reset: pageId.map(p => pageStart[p]),
  line_reset: lineStart,
  word_reset: wordStart
};
const consumption = {
  all_runes: Array.from({length:cipher.length+1},(_,i)=>i),
  skip_F:nonFPrefix, skip_red:blackPrefix, skip_F_and_red:nonFNonRedPrefix
};
const clocks = {};
for (const [segName,starts] of Object.entries(segmentStarts)) {
  for (const [consumeName,prefix] of Object.entries(consumption)) {
    clocks[consumeName + '_' + segName] =
      i => prefix[i+1] - prefix[starts[i]] - 1;
  }
}
const opportunities = [];
for (let i = 0; i+1 < cipher.length; i++) {
  if (pageId[i] !== pageId[i+1]) continue;
  opportunities.push({i, eq: cipher[i] === cipher[i+1]});
}
assert.equal(opportunities.length, 12901);
assert.equal(opportunities.filter(o => o.eq).length, 86);
const mod256 = n => ((n%256)+256)%256;
const result = {source:'original LP2 physical p0-55, p50 literal 0D cells',
  gate_indices:small, total_runes:cipher.length,
  red_runes:red.reduce((a,b)=>a+b,0),
  printed_words:wordCount, physical_lines:new Set(lineStart).size,
  printed_chapters:chapterPageGroups.length,
  transition_opportunities:opportunities.length,
  equal_transitions:86, clocks:{}};
for (const [name, clock] of Object.entries(clocks)) {
  const phases = [];
  for (let phase = 0; phase < 256; phase++) {
    let hits = 0, gates = 0;
    const eventPositions = [];
    for (const {i,eq} of opportunities) {
      if (!smallSet.has(mod256(clock(i)+phase))) continue;
      gates++;
      if (eq) { hits++; if (phase===0) eventPositions.push(i); }
    }
    phases.push({phase, gates, hits, ...(phase===0 ? {event_positions:eventPositions}: {})});
  }
  const at0 = phases[0];
  const peak = Math.max(...phases.map(p => p.hits));
  result.clocks[name] = {
    phase_zero:at0,
    max_hits_over_256_phases:peak,
    phases_attaining_maximum:phases.filter(p => p.hits===peak).map(p=>p.phase),
    number_of_phases_with_at_least_10_hits:phases.filter(p=>p.hits>=10).length
  };
}
const g = result.clocks;
assert.equal(g.all_runes_continuous.phase_zero.gates,251);
assert.equal(g.all_runes_continuous.phase_zero.hits,10);
assert.deepEqual(g.all_runes_continuous.phase_zero.event_positions,
  [781,978,1037,2240,5074,5824,6080,6610,8384,8933]);
assert.deepEqual([
  g.skip_red_continuous.phase_zero.gates,
  g.skip_red_continuous.phase_zero.hits,
  g.skip_red_continuous.max_hits_over_256_phases,
  g.all_runes_page_reset.phase_zero.gates,
  g.all_runes_page_reset.phase_zero.hits,
  g.all_runes_page_reset.max_hits_over_256_phases,
  g.skip_red_page_reset.phase_zero.gates,
  g.skip_red_page_reset.phase_zero.hits,
  g.skip_red_page_reset.max_hits_over_256_phases
], [248,1,6,254,1,6,247,2,6]);
assert.deepEqual([
  g.skip_F_continuous.phase_zero.gates, g.skip_F_continuous.phase_zero.hits,
  g.skip_F_continuous.max_hits_over_256_phases,
  g.skip_F_page_reset.phase_zero.gates, g.skip_F_page_reset.phase_zero.hits,
  g.skip_F_page_reset.max_hits_over_256_phases,
  g.skip_F_and_red_continuous.phase_zero.gates, g.skip_F_and_red_continuous.phase_zero.hits,
  g.skip_F_and_red_continuous.max_hits_over_256_phases,
  g.skip_F_and_red_page_reset.phase_zero.gates, g.skip_F_and_red_page_reset.phase_zero.hits,
  g.skip_F_and_red_page_reset.max_hits_over_256_phases
], [252,3,6,243,2,7,256,2,7,250,1,7]);
assert.deepEqual([
  g.all_runes_chapter_reset.phase_zero.gates, g.all_runes_chapter_reset.phase_zero.hits,
  g.all_runes_chapter_reset.max_hits_over_256_phases,
  g.skip_F_chapter_reset.phase_zero.gates, g.skip_F_chapter_reset.phase_zero.hits,
  g.skip_F_chapter_reset.max_hits_over_256_phases,
  g.skip_red_chapter_reset.phase_zero.gates, g.skip_red_chapter_reset.phase_zero.hits,
  g.skip_red_chapter_reset.max_hits_over_256_phases,
  g.skip_F_and_red_chapter_reset.phase_zero.gates,
  g.skip_F_and_red_chapter_reset.phase_zero.hits,
  g.skip_F_and_red_chapter_reset.max_hits_over_256_phases
], [247,2,6,247,2,5,246,1,6,244,2,6]);
assert.deepEqual([
  g.all_runes_line_reset.phase_zero.gates, g.all_runes_line_reset.phase_zero.hits,
  g.all_runes_line_reset.max_hits_over_256_phases,
  g.skip_F_line_reset.phase_zero.gates, g.skip_F_line_reset.phase_zero.hits,
  g.skip_F_line_reset.max_hits_over_256_phases,
  g.skip_red_line_reset.phase_zero.gates, g.skip_red_line_reset.phase_zero.hits,
  g.skip_red_line_reset.max_hits_over_256_phases,
  g.skip_F_and_red_line_reset.phase_zero.gates, g.skip_F_and_red_line_reset.phase_zero.hits,
  g.skip_F_and_red_line_reset.max_hits_over_256_phases
], [583,8,12,602,5,11,570,8,12,589,5,11]);
assert.deepEqual([
  g.all_runes_word_reset.phase_zero.gates, g.all_runes_word_reset.phase_zero.hits,
  g.all_runes_word_reset.max_hits_over_256_phases,
  g.skip_F_word_reset.phase_zero.gates, g.skip_F_word_reset.phase_zero.hits,
  g.skip_F_word_reset.max_hits_over_256_phases,
  g.skip_red_word_reset.phase_zero.gates, g.skip_red_word_reset.phase_zero.hits,
  g.skip_red_word_reset.max_hits_over_256_phases,
  g.skip_F_and_red_word_reset.phase_zero.gates, g.skip_F_and_red_word_reset.phase_zero.hits,
  g.skip_F_and_red_word_reset.max_hits_over_256_phases
], [3,0,25,1,0,24,3,0,25,1,0,24]);
assert.deepEqual(g.all_runes_continuous.phases_attaining_maximum,[0]);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
