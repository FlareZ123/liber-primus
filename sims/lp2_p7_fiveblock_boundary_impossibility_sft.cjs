"use strict";
/**
 * Source-bound, finite exclusion of a strict five-rune no-adjacent-equal block
 * encoder. Real LP2 rune positions, physical page resets, and printed 10/13-dot
 * marks are untouched. All-secret starting phases are optimized exactly.
 * Run: node sims/lp2_p7_fiveblock_boundary_impossibility_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const rune = /[\u16A0-\u16FF]/u;
const pages = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).map(part => [...part].filter(x => rune.test(x)));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const punct = new Map(annotations.pages.map(p => [p.page, p.large_punctuation || []]));
const totalRunes = pages.reduce((n, p) => n + p.length, 0);
assert.equal(pages.length, 55);
assert.equal(totalRunes, 12956);
const physicalPage = i => i >= 50 ? i + 1 : i;
const marks = annotations.pages.filter(p => p.page <= 55)
  .reduce((n, p) => n + (p.large_punctuation || []).length, 0);
assert.equal(marks, 31);
/** @param {boolean} includeMarks @param {boolean} freeStartingPhase */
function evaluate(includeMarks, freeStartingPhase) {
  let events = 0, allowed = 0, intervalCount = 0, boundaryRepeats = 0;
  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const pageNumber = physicalPage(pi);
    const locations = includeMarks ? (punct.get(pageNumber) || []).map(m => m[0]) : [];
    const boundaries = [0, ...new Set(locations.filter(x => x > 0 && x < page.length)), page.length]
      .sort((a,b) => a - b);
    const repeats = page.flatMap((value, i) => i && value === page[i-1] ? [i] : []);
    for (let part = 0; part + 1 < boundaries.length; part++) {
      const first = boundaries[part], last = boundaries[part+1];
      const phaseCounts = [0, 0, 0, 0, 0];
      for (const i of repeats) {
        if (i < first || i >= last) continue;
        events++;
        if (i === first) { boundaryRepeats++; allowed++; }
        else phaseCounts[(i - first) % 5]++;
      }
      allowed += freeStartingPhase ? Math.max(...phaseCounts) : phaseCounts[0];
      intervalCount++;
    }
  }
  return {events, allowed, violations: events - allowed, intervalCount, boundaryRepeats};
}
/** @param {number[]} sequence @param {number} phase */
function distinctBlockErrors(sequence, phase) {
  let repeatedBlocks = 0, repeatedSymbols = 0, blocks = 0;
  for (let i = phase; i < sequence.length; i += 5) {
    const block = sequence.slice(i, i + 5);
    const extra = block.length - new Set(block).size;
    blocks++;
    if (extra > 0) { repeatedBlocks++; repeatedSymbols += extra; }
  }
  return {phase, blocks, repeatedBlocks, repeatedSymbols};
}
const observed = {
  pageFixed: evaluate(false, false),
  pageFree: evaluate(false, true),
  pageMarksFixed: evaluate(true, false),
  pageMarksFree: evaluate(true, true)
};
assert.deepEqual(observed.pageFixed,
  {events:86,allowed:18,violations:68,intervalCount:55,boundaryRepeats:0});
assert.deepEqual(observed.pageFree,
  {events:86,allowed:52,violations:34,intervalCount:55,boundaryRepeats:0});
assert.deepEqual(observed.pageMarksFixed,
  {events:86,allowed:17,violations:69,intervalCount:74,boundaryRepeats:0});
assert.deepEqual(observed.pageMarksFree,
  {events:86,allowed:54,violations:32,intervalCount:74,boundaryRepeats:0});
const gp = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
assert.equal([...gp].length, 29);
const alphabet = new Map([...gp].map((x,i)=>[x,i]));
const all = pages.flat().map(x => alphabet.get(x));
assert.equal(all.length, 12956);
const shapes = Array.from({length:5},(_,phase)=>distinctBlockErrors(all, phase));
assert.deepEqual(shapes.map(x=>x.repeatedBlocks),[537,584,582,587,541]);
assert.deepEqual(shapes.map(x=>x.repeatedSymbols),[563,609,600,620,577]);
// An actually generated five-block no-repeat sequence has no internal repeats.
const plant = Array.from({length:250},(_,i)=>Math.floor(i/5)%29 + (i%5));
for (let i=0;i<plant.length;i++)plant[i]%=29;
const control = distinctBlockErrors(plant,0);
assert.equal(control.repeatedBlocks,0);
console.log("PASS "+JSON.stringify({runes:totalRunes,largeMarks:marks,observed,shapes,control}));
