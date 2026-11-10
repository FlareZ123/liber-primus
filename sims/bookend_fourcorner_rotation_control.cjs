'use strict';
/**
 * Exact all-rotation reference for the unrestricted 2x2 bookend candidate.
 * Run: node sims/bookend_fourcorner_rotation_control.cjs
 * Source: 12,956 original unsolved LP2 GP glyphs, 81x81 then 80x80-5.
 * All 8 orientations, every omitted-five gap, all 6,395 circular rotations.
 * Two independently unrestricted source-tuple lookup tables are granted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.slice(0, 56);
const tape = pages.flatMap((page) => page.indices);
assert.equal(tape.length, 12956);
const source = tape.slice(0, 6561);
const target = tape.slice(6561);
const n = target.length;
assert.equal(source.length, 6561);
assert.equal(n, 6395);

/**
 * @param {number[]} codes
 * @returns {Array<[number,number]>}
 */
function repeatedPairs(codes) {
  const first = new Map();
  const seenTwice = new Set();
  const out = [];
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const old = first.get(code);
    if (old === undefined) first.set(code, i);
    else {
      assert.equal(seenTwice.has(code), false, 'tuple occurs more than twice');
      seenTwice.add(code);
      out.push([old, i]);
    }
  }
  return out;
}

/**
 * @typedef {{name:string,before:Array<[number,number]>,after:Array<[number,number]>}} Orientation
 * @returns {Orientation[]}
 */
function orientations() {
  const out = [];
  for (let trans = 0; trans < 2; trans++) for (let fr = 0; fr < 2; fr++) {
    for (let fc = 0; fc < 2; fc++) {
      const codes = [];
      for (let j = 0; j < 6400; j++) {
        const row = Math.floor(j / 80), col = j % 80;
        const sr = trans ? (fr ? 79-col : col) : (fr ? 79-row : row);
        const sc = trans ? (fc ? 79-row : row) : (fc ? 79-col : col);
        const k = sr * 81 + sc;
        codes.push(((source[k]*29+source[k+1])*29+source[k+81])*29+source[k+82]);
      }
      out.push({
        name: [trans, fr, fc].join(''),
        before: repeatedPairs(codes.slice(0, n)),
        after: repeatedPairs(codes.slice(5))
      });
    }
  }
  return out;
}

/**
 * Each unequal duplicate tuple costs exactly one changed output. The
 * before-gap pair [a,b] starts costing at gap b+1; the after-gap pair
 * [a,b] stops costing at gap a+1. The event sweep optimizes all 6,396 gaps.
 * @param {Orientation} variant
 * @param {number} shift
 * @param {boolean[] | null} free
 * @returns {{edits:number,gap:number}}
 */
function minEdits(variant, shift, free = null) {
  let current = 0;
  const events = [];
  for (const [a,b] of variant.before) {
    if (free && (free[a] || free[b])) continue;
    if (target[(a+shift)%n] !== target[(b+shift)%n]) events.push([b+1,1]);
  }
  for (const [a,b] of variant.after) {
    if (free && (free[a] || free[b])) continue;
    if (target[(a+shift)%n] !== target[(b+shift)%n]) {
      current++;
      events.push([a+1,-1]);
    }
  }
  events.sort((a,b) => a[0]-b[0]);
  let best = current, gap = 0;
  for (let i = 0; i < events.length;) {
    const at = events[i][0];
    while (i < events.length && events[i][0] === at) current += events[i++][1];
    if (current < best) { best = current; gap = at; }
  }
  assert.ok(best >= 0 && best <= 40);
  return {edits:best,gap};
}
const pageStarts = new Set();
let index = 0;
for (const page of pages) {
  pageStarts.add(index);
  index += page.indices.length;
}
const free = target.map((rune,i) => {
  const at = 6561+i;
  return !pageStarts.has(at) && tape[at-1] === rune;
});
assert.equal(free.filter(Boolean).length, 45);
const choices = orientations();
const histogram = {};
let original = null, restricted = null;
for (let shift = 0; shift < n; shift++) {
  let best = null;
  for (const orientation of choices) {
    const result = minEdits(orientation, shift);
    if (best === null || result.edits < best.edits) {
      best = {...result, orientation:orientation.name};
    }
  }
  histogram[best.edits] = (histogram[best.edits] || 0) + 1;
  if (shift === 0) {
    original = best;
    for (const orientation of choices) {
      const result = minEdits(orientation, 0, free);
      if (restricted === null || result.edits < restricted.edits) {
        restricted = {...result, orientation:orientation.name};
      }
    }
  }
}
const atMost = Object.entries(histogram)
  .filter(([edits]) => Number(edits) <= original.edits)
  .reduce((sum,[,count]) => sum + count,0);
assert.deepEqual(original,{edits:13,gap:2880,orientation:'110'});
assert.equal(atMost,104);
assert.equal(restricted.edits,13);
assert.equal(Object.values(histogram).reduce((a,b)=>a+b,0),n);
process.stdout.write(JSON.stringify({
  original,
  originalGapAbsoluteRune:6561+original.gap,
  doubletOnlyExceptionModel:{freePositions:45,minNecessaryNonDoubletEdits:restricted},
  exactCircularNull:{rotations:n,minEditHistogram:histogram,atMostOriginal:atMost,
    lowerTail:atMost/n},
},null,2)+'\n');
