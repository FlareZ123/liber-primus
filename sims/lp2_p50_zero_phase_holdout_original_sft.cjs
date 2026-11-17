/**
 * LP2 source-zero table clock: original repeat-phase holdout and boundary test.
 * Read-only SFT; Node.js 22 CommonJS; no ciphertext alteration.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const textPages = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\s*\n/);
const cells = grid.pages.flatMap((p) => p.tokens);
const zero = cells.map((token) => token[0] === '0');
assert.equal(cells.length, 256);
assert.equal(zero.filter(Boolean).length, 60);
assert.equal(textPages.length, 57);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
/** @typedef {{ position:number, event:number, chapter:number, boundary:string }} Pair */
/** @type {Pair[]} */
const pairs = [];
let globalOffset = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55 && p.indices.length)) {
  const chapter = chapters.findIndex(([first, last]) => page.page >= first && page.page <= last);
  assert.ok(chapter >= 0);
  const chars = Array.from(textPages[page.page < 50 ? page.page : page.page - 1]);
  const runes = [];
  for (let i = 0; i < chars.length; i++) {
    const value = corpus.runes.indexOf(chars[i]);
    if (value >= 0) runes.push({ location: i, value });
  }
  assert.deepEqual(runes.map((r) => r.value), page.indices, 'page ' + page.page);
  for (let i = 1; i < runes.length; i++) {
    const gap = chars.slice(runes[i-1].location + 1, runes[i].location).join('');
    const word = /[-.&$§]/.test(gap) ? 'between-word' : 'within-word';
    const line = /[\/\n]/.test(gap) ? 'line-break' : 'same-line';
    pairs.push({
      position: globalOffset + i - 1,
      event: Number(page.indices[i] === page.indices[i-1]),
      chapter,
      boundary: word + '/' + line
    });
  }
  globalOffset += page.indices.length;
}
assert.equal(globalOffset, 12956);
assert.equal(pairs.length, 12901);
assert.equal(pairs.reduce((sum, pair) => sum + pair.event, 0), 86);
/**
 * @param {Pair[]} sample
 * @param {number} phase
 * @returns {{ total:number, events:number, hits:number, exposure:number, rateRatio:number, z:number }}
 */
function score(sample, phase) {
  let events = 0, hits = 0, exposure = 0;
  for (const pair of sample) {
    events += pair.event;
    if (zero[(pair.position + phase) & 255]) {
      exposure++;
      hits += pair.event;
    }
  }
  const total = sample.length;
  const expected = events * exposure / total;
  const variance = events * (exposure / total)
    * (1 - exposure / total) * (total - events) / (total - 1);
  return {
    total, events, hits, exposure,
    rateRatio: (hits / exposure) / ((events - hits) / (total - exposure)),
    z: (hits - expected) / Math.sqrt(variance)
  };
}
const train = pairs.filter((p) => p.chapter <= 3);
const heldout = pairs.filter((p) => p.chapter >= 4);
const phases = Array.from({ length: 256 }, (_, phase) => ({
  phase, train: score(train, phase), heldout: score(heldout, phase)
})).sort((a, b) => b.train.z - a.train.z || a.phase - b.phase);
const phase0 = phases.find((p) => p.phase === 0);
const blind = phases[0];
const boundaries = Object.fromEntries(
  [...new Set(pairs.map((p) => p.boundary))].map((name) =>
    [name, score(pairs.filter((p) => p.boundary === name), 0)])
);
assert.deepEqual([
  score(pairs,0).total, score(pairs,0).events, score(pairs,0).hits, score(pairs,0).exposure,
  phase0.train.total, phase0.train.events, phase0.train.hits, phase0.train.exposure,
  phase0.heldout.total, phase0.heldout.events, phase0.heldout.hits, phase0.heldout.exposure
], [12901,86,33,3025,5483,29,12,1285,7418,57,21,1740]);
assert.equal(blind.phase, 152);
assert.equal(phases.findIndex((p) => p.phase === 0) + 1, 10);
assert.deepEqual(Object.entries(boundaries).map(([name,s]) => [name,s.events,s.hits]).sort(),
  [
    ['between-word/line-break',1,0],
    ['between-word/same-line',22,10],
    ['within-word/line-break',3,1],
    ['within-word/same-line',60,22]
  ]);
console.log(JSON.stringify({
  overall:score(pairs,0),
  naturalPhase0:{train:phase0.train,heldout:phase0.heldout,trainingRank:10},
  blindPhaseWinner:blind,
  boundaries
},null,2));
