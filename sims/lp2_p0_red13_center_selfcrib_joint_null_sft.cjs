"use strict";
/**
 * Source-conditional calibration of the independently proposed 27x27
 * p0-p2 center self-crib and the p0 red13/phi(13) coordinate.
 *
 * This is a deliberately narrow randomization control, NOT a proposed
 * plaintext decoder or a discovery-adjusted probability for Cicada intent.
 * Original geometry and operators follow Agent10's existing source SFT.
 *
 * Windows 11 / Node.js 22 single-file reproducible test.
 * Read only; all original corpus input stays unchanged.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const chapter = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(chapter.length, 729);

/** @param {number} n @returns {number} */
function phi(n) {
  assert(n >= 1);
  let v = n, m = n;
  for (let d = 2; d * d <= m; d++) {
    if (m % d === 0) {
      v -= v / d;
      while (m % d === 0) m /= d;
    }
  }
  if (m > 1) v -= v / m;
  return v;
}
/** @param {number} n @returns {number} */
function mu(n) {
  assert(n >= 1);
  let s = 1, m = n;
  for (let d = 2; d * d <= m; d++) {
    if (m % d === 0) {
      m /= d;
      s = -s;
      if (m % d === 0) return 0;
    }
  }
  return m > 1 ? -s : s;
}
const tot = Array.from({length: 29}, (_, i) => i ? phi(i) : 0);
const mob = tot.map((n, i) => i ? mu(n) : 0);

/**
 * Reproduce the FIXED author-proposed self-crib operation, only at the
 * mathematically central row14 col14 and the original row13 above it.
 * @param {number[]} t exactly 729 GP29 source rune indices
 * @returns {number} first matching 1-based left-node column, or zero
 */
function centerSelfCrib(t) {
  const center = 27 * 13 + 13;
  const above = 27 * 12 + 13;
  const row = 27 * 13;
  for (let left = 1; left <= 13; left++) {
    const a = t[row + left - 1], b = t[row + left], c = t[row + left + 1];
    if (a === 0 || b === 0 || c === 0 || left + tot[b] !== 14) continue;
    const raw = [a, tot[b], c];
    const phase = ((raw.reduce((sum, k) => sum + mob[k], 0) % 3) + 3) % 3;
    if ((t[center] - raw[phase] + 29) % 29 === t[above] &&
        (t[center + 1] - raw[(phase + 1) % 3] + 29) % 29 === t[above + 1] &&
        (t[center + 2] - raw[(phase + 2) % 3] + 29) % 29 === t[above + 2])
      return left;
  }
  return 0;
}
assert.equal(centerSelfCrib(chapter), 4);
assert.equal(tot[13], 12);
const sourceMarkerIndex = 27 * 12 + 10; // (13,11), left of (13, phi(13))
assert.equal(chapter[sourceMarkerIndex], 13 + tot[13]);
assert.deepEqual(chapter.slice(sourceMarkerIndex, sourceMarkerIndex + 3), [25,11,28]);

/** Fixed-seed xorshift32, unsigned output; deterministic for Node 22. */
let state = 0x33012016;
/** @returns {number} */
function randomUint32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const N = 1000000, trial = chapter.slice();
let centerHits = 0, jointHits = 0, markerHits = 0;
for (let run = 0; run < N; run++) {
  // Full Fisher-Yates of intact original 729 GP symbols: exact multiset kept.
  for (let j = trial.length - 1; j >= 1; j--) {
    const k = randomUint32() % (j + 1);
    [trial[j], trial[k]] = [trial[k], trial[j]];
  }
  const leftMatch = trial[sourceMarkerIndex] === 25;
  if (leftMatch) markerHits++;
  if (centerSelfCrib(trial) !== 0) {
    centerHits++;
    if (leftMatch) jointHits++;
  }
}
assert.deepEqual([centerHits,jointHits,markerHits], [34,2,32832]);
console.log(JSON.stringify({
  source: "unaltered 729 original rune indices from p0-p2; original red13 mark",
  center: [14,14],
  originalNodeLeft: 4,
  markerSelectedCenter: [13,12],
  markerSelectedLeftRuneIndex: 25,
  shuffles: N,
  seed: "0x33012016",
  matches: {centerSelfCrib: centerHits, markerLeft25: markerHits, both: jointHits},
  addOneConditionalTail: (centerHits+1)/(N+1),
  addOneJointTail: (jointHits+1)/(N+1),
  interpretation: "Conditional to a postselected operator; no full route, unknown plaintext authentication, or authorial selector established."
},null,2));
