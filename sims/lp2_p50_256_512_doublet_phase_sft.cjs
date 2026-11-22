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

// Exact canonical printed words, keeping all physical-page carried words whole.
// A word/page group contains only valid within-page predecessor comparisons.
const wordText = sourcePages.join("%").replace(/\/\r?\n/g, "")
  .replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + book.runes.join("") + "]+", "gu");
const sourceWords = wordText.match(runePattern) || [];
const allOriginal = pages.flatMap(p => p.indices);
const runeIndex = new Map(book.runes.map((r,i) => [r,i]));
assert.equal(sourceWords.length, 2896);
assert.deepEqual(sourceWords.flatMap(w => [...w].map(r => runeIndex.get(r))), allOriginal);
const eligibleByGlobal = new Map(eligible.map(v => [v.global,v]));
const tableTokens = grid.rows.flat();
/** @type {Map<string,{sites:{global:number,zero:boolean}[],count:number,zeroCount:number}>} */
const wordGroups = new Map();
let globalRune = 0;
for (let wordId = 0; wordId < sourceWords.length; wordId++) {
  for (const glyph of sourceWords[wordId]) {
    const v = eligibleByGlobal.get(globalRune);
    if (v) {
      const id = wordId + ":" + v.page;
      if (!wordGroups.has(id))
        wordGroups.set(id, {sites:[], count:0, zeroCount:0});
      const group = wordGroups.get(id);
      const zero = tableTokens[(globalRune - 1) % 256][0] === "0";
      group.sites.push({global:globalRune,zero});
      group.count += v.event;
      group.zeroCount += Number(zero && v.event);
    }
    globalRune++;
  }
}
assert.equal(globalRune,12956);
const activeWords = [...wordGroups.values()].filter(g => g.count);
assert.equal(activeWords.length,85);
assert.equal(activeWords.reduce((n,g)=>n+g.count,0),86);
assert.equal(activeWords.reduce((n,g)=>n+g.zeroCount,0),33);


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
 * Condition directly on the exact 85 event-bearing printed word/page IDs,
 * including the two events in p27's single word. A stronger null additionally
 * holds fixed the count of events in literal-leading-zero table cells WITHIN
 * each individual word/page, preserving the established #1500 association and
 * its word-level localization (#1508). This avoids mistaking that known source
 * mask for an independent phase signal.
 *
 * @param {boolean} preserveZero
 * @param {number} seed
 * @param {number} trials
 */
function wordConditionedNull(preserveZero, seed, trials) {
  const random32=xorshift32(seed);
  let tail256=0,tail512=0,tailEither=0,tailBoth=0;
  let mean256=0,mean512=0;
  for(let t=0;t<trials;t++){
    const positions=[];
    for(const word of activeWords){
      const pools=preserveZero?[
        {sites:word.sites.filter(x=>x.zero), count:word.zeroCount},
        {sites:word.sites.filter(x=>!x.zero),count:word.count-word.zeroCount}
      ]:[{sites:word.sites,count:word.count}];
      for(const group of pools){
        const chosen=new Set();
        for(let i=0;i<group.count;i++){
          let picked;
          do {picked=random32()%group.sites.length;}
          while(chosen.has(picked));
          chosen.add(picked);
          positions.push(group.sites[picked].global);
        }
      }
    }
    const a=score(positions,256),b=score(positions,512);
    mean256+=a.pairs;mean512+=b.pairs;
    const x=a.pairs>=original256.pairs,y=b.pairs>=original512.pairs;
    tail256+=+x;tail512+=+y;
    tailEither+=+(x||y);tailBoth+=+(x&&y);
  }
  const p=n=>(n+1)/(trials+1);
  return {name:preserveZero?
    "exact word/page event and literal-leading-zero totals":
    "exact word/page event totals",
    trials, activeWordPageGroups:activeWords.length,
    meanPairs256:mean256/trials,meanPairs512:mean512/trials,
    p256:p(tail256),p512:p(tail512),pEither:p(tailEither),
    pBoth:p(tailBoth)};
}

/**
 * Remove the single largest observed source-table hotspot, literal token "00"
 * at predecessor cell192 (four original equalities, six S256 pairs).
 * Exactly condition on each original event-bearing word/page AND the counts
 * in all three printed-table categories: low60 excluding cell192, non-low60,
 * and the singled-out original cell192. Retain the 82 independent non-hotspot
 * events for the scored test. This is a *diagnostic* chosen after inspecting
 * the original, never an independent confirmatory p-value.
 * @param {number} seed
 * @param {number} trials
 */
function hotspotExcludedNull(seed,trials) {
  const isHot = x => (x.global - 1) % 256 === 192;
  assert.equal(tableTokens[192],"00");
  const realEvents = events.filter(global => (global - 1) % 256 !== 192);
  const excluded = events.length - realEvents.length;
  assert.equal(excluded,4);
  const expected256=score(realEvents,256),expected512=score(realEvents,512);
  assert.deepEqual([expected256.pairs,expected512.pairs],[21,13]);
  const partitions=activeWords.map(word=>{
    const cells=[
      word.sites.filter(x=>!x.zero),
      word.sites.filter(x=>x.zero&&!isHot(x)),
      word.sites.filter(isHot)
    ];
    const counts=cells.map(group=>group.filter(x=>
      eligibleByGlobal.get(x.global).event).length);
    assert.equal(counts.reduce((n,k)=>n+k,0),word.count);
    return {cells,counts};
  });
  const random32=xorshift32(seed);
  let upper256=0,upper512=0,upperEither=0,mean256=0,mean512=0;
  for(let trial=0;trial<trials;trial++){
    const filtered=[];
    for(const gr of partitions){
      for(let kind=0;kind<2;kind++){
        const pool=gr.cells[kind],n=gr.counts[kind],seen=new Set();
        for(let k=0;k<n;k++){
          let selected;
          do { selected=random32()%pool.length; }
          while(seen.has(selected));
          seen.add(selected);
          filtered.push(pool[selected].global);
        }
      }
    }
    assert.equal(filtered.length,82);
    const a=score(filtered,256),b=score(filtered,512);
    mean256+=a.pairs;mean512+=b.pairs;
    const exceed256=a.pairs>=expected256.pairs;
    const exceed512=b.pairs>=expected512.pairs;
    upper256+=+exceed256;
    upper512+=+exceed512;
    upperEither+=+(exceed256||exceed512);
  }
  const prob=n=>(n+1)/(trials+1);
  return {label:"post-inspection leave-four-at-cell192 diagnostic",
    removed:excluded,remaining:realEvents.length,trials,
    sourceToken:"00",sourceCell:192,
    originalPairs256:expected256.pairs,
    originalPairs512:expected512.pairs,
    mean256:mean256/trials,mean512:mean512/trials,
    p256:prob(upper256),p512:prob(upper512),
    pEither:prob(upperEither)};
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
      bytes[(v.global - 1) % 256] < 64).map(v => v.global);
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
  assert.ok(a.pairs > original256.pairs);
  assert.ok(b.pairs > original512.pairs);
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
const wordNulls = [
  wordConditionedNull(false,0x33015008,trials),
  wordConditionedNull(true,0x33015009,trials)
];
const output = {source:"original 32x8 two-digit p50 base60 table",
  original:{runes:totalRunes,pages:pages.length,eligible:eligible.length,
    equalityEvents:events.length,midpoint,period256:original256,
    period512:original512},neighbors,positive:plantedTableGate(),nulls,wordNulls,
  hotspot:hotspotExcludedNull(0x33015053,trials),
  interpretation:"Source-length-aligned phase recurrence only; no key/plaintext"};
console.log(JSON.stringify(output,null,2));
module.exports={score,conditionedNull,wordConditionedNull,
  hotspotExcludedNull,plantedTableGate};
