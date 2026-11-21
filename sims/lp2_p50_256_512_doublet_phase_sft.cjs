"use strict";

/**
 * Original LP2 anti-repeat exception clock: 256 table cells / 512 printed digits.
 *
 * Source premise: the literal original p50 table has 32x8 base60 two-character
 * tokens, selecting 256 cell phases or 512 individual printed-digit phases.
 * If a fixed continuous table clock controls rare adjacent-ciphertext
 * equalities, sites at those phases should recur more than under source-layout
 * preserving nulls. The test only uses 86 actual same-page equalities. It does
 * not claim a key, a decoder, or plaintext recovery.
 *
 * Run: node sims/lp2_p50_256_512_doublet_phase_sft.cjs
 * Read-only Node22 CommonJS, no packages or network access.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const pages = book.pages.filter(p => p.page <= 55 && p.indices.length);
const sourcePages = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55);
const runeSet = new Set(book.runes);

assert.equal(pages.length, 55);
assert.equal(sourcePages.length, 55);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8 && row.every(t => t.length === 2)));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

/** @type {{global:number,page:number,line:number,prior:number,event:number}[]} */
const eligible = [];
/** @type {{start:number,length:number,events:number[],page:number}[]} */
const pageEntries = [];
let totalRunes = 0;
for (let p = 0; p < pages.length; p++) {
  const source = sourcePages[p];
  const original = pages[p];
  const start = totalRunes;
  const events = [];
  let line = 0;
  let local = 0;
  for (const glyph of source) {
    if (glyph === "/") { line++; continue; }
    if (!runeSet.has(glyph)) continue;
    if (local > 0) {
      const global = start + local;
      const event = +(original.indices[local] === original.indices[local - 1]);
      eligible.push({global, page:original.page, line,
        prior:original.indices[local - 1], event});
      if (event) events.push(global);
    }
    local++;
  }
  assert.equal(local, original.indices.length,
    "transcription misaligned at physical p" + original.page);
  pageEntries.push({start,length:local,events,page:original.page});
  totalRunes += local;
}
assert.equal(totalRunes, 12956);
assert.equal(eligible.length, 12901);
const events = pageEntries.flatMap(p => p.events);
assert.equal(events.length, 86);
const midpoint = totalRunes / 2;

/**
 * Pair collisions are unordered event pairs at the same modulo period phase.
 * Cross counts include only pairs with one event on each side of the fixed
 * original-book midpoint; no phase, shift or split position is optimized.
 *
 * @param {number[]} positions
 * @param {number} period
 * @returns {{pairs:number,cross:number,unique:number}}
 */
function score(positions, period) {
  const all = new Uint8Array(period);
  const first = new Uint8Array(period);
  const second = new Uint8Array(period);
  let pairs = 0;
  let cross = 0;
  let unique = 0;
  for (const global of positions) {
    const phase = global % period;
    pairs += all[phase];
    if (!all[phase]) unique++;
    all[phase]++;
    if (global < midpoint) {
      cross += second[phase];
      first[phase]++;
    } else {
      cross += first[phase];
      second[phase]++;
    }
  }
  return {pairs,cross,unique};
}
const original256 = score(events, 256);
const original512 = score(events, 512);
assert.deepEqual(original256, {pairs:27,cross:14,unique:66});
assert.deepEqual(original512, {pairs:16,cross:9,unique:72});

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Sample exactly the original number of equalities from each fixed source
 * group, without replacement. Under page+physical-line+prior-runic-class
 * conditioning some groups have just one eligible site; this intentionally
 * gives the strongest cautious nuisance-control.
 *
 * @param {string} name
 * @param {(v: typeof eligible[number]) => string} key
 * @param {number} seed
 * @param {number} trials
 */
function conditionedNull(name, key, seed, trials) {
  const groups = new Map();
  for (const v of eligible) {
    const k = key(v);
    if (!groups.has(k)) groups.set(k, {sites:[],count:0});
    const g = groups.get(k);
    g.sites.push(v.global);
    g.count += v.event;
  }
  const active = [...groups.values()].filter(g => g.count);
  const random32 = xorshift32(seed);
  let tail256 = 0, tail512 = 0, tailEither = 0, tailBoth = 0;
  let cross256 = 0, cross512 = 0, mean256 = 0, mean512 = 0;
  for (let trial = 0; trial < trials; trial++) {
    const sampled = [];
    for (const group of active) {
      const indices = new Set();
      for (let k = 0; k < group.count; k++) {
        let item;
        do { item = random32() % group.sites.length; }
        while (indices.has(item));
        indices.add(item);
        sampled.push(group.sites[item]);
      }
    }
    const a = score(sampled, 256);
    const b = score(sampled, 512);
    mean256 += a.pairs;
    mean512 += b.pairs;
    const x = a.pairs >= original256.pairs;
    const y = b.pairs >= original512.pairs;
    tail256 += +x;
    tail512 += +y;
    tailEither += +(x || y);
    tailBoth += +(x && y);
    cross256 += +(a.cross >= original256.cross);
    cross512 += +(b.cross >= original512.cross);
  }
  const p = n => (n + 1) / (trials + 1);
  return {name,trials,groups:groups.size,activeGroups:active.length,
    meanPairs256:mean256/trials,meanPairs512:mean512/trials,
    p256:p(tail256),p512:p(tail512),pEither:p(tailEither),
    pBoth:p(tailBoth),pCross256:p(cross256),pCross512:p(cross512)};
}

/**
 * Synthetic positive control: original per-page event totals, but require
 * every event to land at a phase whose *actual printed table byte* is below64.
 * This is a calibration of detection power for a fixed phase-gated event
 * channel, not a cipher encryption, decryption, or putative creator key.
 * @returns {object}
 */
function plantedTableGate() {
  const random32 = xorshift32(0x201443);
  const artificial = [];
  for (const p of pageEntries) {
    const pool = eligible.filter(v => v.page === p.page &&
      bytes[v.global % 256] < 64).map(v => v.global);
    assert.ok(pool.length >= p.events.length);
    const indices = new Set();
    for (let i = 0; i < p.events.length; i++) {
      let index;
      do { index = random32() % pool.length; }
      while (indices.has(index));
      indices.add(index);
      artificial.push(pool[index]);
    }
  }
  const a = score(artificial,256), b=score(artificial,512);
  assert.equal(artificial.length,86);
  assert.equal(a.pairs,52);
  assert.equal(b.pairs,27);
  return {eventCount:artificial.length,
    sourceEligiblePhases:bytes.filter(b=>b<64).length,
    pairs256:a.pairs,pairs512:b.pairs};
}

const periods = [245,246,247,248,249,250,251,252,253,254,255,
  256,257,258,259,260,261,262,263,264,265,266,267,
  500,501,502,503,504,505,506,507,508,509,510,511,512,
  513,514,515,516,517,518,519,520,521,522,523,524];
const neighbors = periods.map(period => ({period,...score(events,period)}));
assert.ok(neighbors.filter(x=>x.period!==256 && x.period<500)
  .every(x=>x.pairs<original256.pairs));
assert.ok(neighbors.filter(x=>x.period!==512 && x.period>500)
  .every(x=>x.pairs<original512.pairs));

const trials = 50000;
const nulls = [
  conditionedNull("exact physical-page event totals",
    v=>String(v.page),0x33012566,trials),
  conditionedNull("physical-page and line event totals",
    v=>v.page+":"+v.line,0x33012567,trials),
  conditionedNull("page, line, and preceding rune",
    v=>v.page+":"+v.line+":"+v.prior,0x33012568,trials),
  conditionedNull("1,000-rune event rate",
    v=>String(Math.floor(v.global/1000)),0x33012569,trials)
];
assert.ok(nulls[0].p256<0.02 && nulls[0].p512<0.02);
const output = {source:"original 32x8 two-digit p50 base60 table",
  original:{runes:totalRunes,pages:pages.length,eligible:eligible.length,
    equalityEvents:events.length,midpoint,period256:original256,
    period512:original512},neighbors,positive:plantedTableGate(),nulls,
  interpretation:"Source-length-aligned phase recurrence only; no key/plaintext"};
console.log(JSON.stringify(output,null,2));
module.exports={score,conditionedNull,plantedTableGate};
