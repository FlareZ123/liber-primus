"use strict";
/**
 * Source-selector gate for p6 red11 -> p55 33 exterior proposal.
 * Run: node sims/lp2_p6_p55_triplicate_selector_gate_sft.cjs
 * No cipher variants or language scores are searched.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pageText = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * Respect the manuscript's word separators, including the incoming p54
 * one-rune carry at p55 position zero. Line-wrap slashes are not separators.
 * @param {string} text Original runic transcription
 * @returns {number[][]} GP29 word-segment values
 */
function segments(text) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  const flush = () => {
    if (current.length > 0) words.push(current);
    current = [];
  };
  for (const ch of Array.from(text)) {
    const value = runeIndex.get(ch);
    if (value !== undefined) current.push(value);
    else if (ch === "/" || /\s/u.test(ch)) continue;
    else flush();
  }
  flush();
  return words;
}

// The transcription omits the rune-free physical p50 table: p55 is piece54.
const p55 = segments(pageText[54]);
const lengths = p55.map(word => word.length);
assert.deepEqual(lengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(lengths.reduce((a, b) => a + b, 0), 76);

/** @type {{segment:number,role:string,value:number}[]} */
const exterior = [];
/** @type {number[]} */
const interior = [];
p55.forEach((word, segment) => {
  if (word.length === 1) {
    exterior.push({segment, role:"carry", value:word[0]});
  } else {
    exterior.push({segment, role:"first", value:word[0]});
    interior.push(...word.slice(1,-1));
    exterior.push({segment, role:"last", value:word[word.length-1]});
  }
});
assert.equal(exterior.length,33);
assert.equal(interior.length,43);

const red11 = ink.pages.flatMap(p => (p.red_spans || [])
  .filter(s => s.length === 11)
  .map(s => ({
    page:p.page, start:s.start, length:s.length,
    gp0:Array.from(s.runes).reduce((sum,ch) => {
      const index=runeIndex.get(ch);
      assert.notEqual(index,undefined);
      return sum+index;
    },0),
    transliteration:Array.from(s.runes)
      .map(ch => corpus.translit[runeIndex.get(ch)]).join("")
  })));
assert.deepEqual(red11.map(s => [s.page,s.start,s.gp0]), [[6,71,181],[15,9,120]]);

// 33=3*11 is a numerical fit; the putative reset at exterior offset22
// bisects one complete word's first/last pair, despite source wordwise SHED.
assert.equal(exterior[21].segment,11);
assert.equal(exterior[21].role,"first");
assert.equal(exterior[22].segment,11);
assert.equal(exterior[22].role,"last");
const cuts = [0,11,22,33];
const groups = cuts.slice(0,-1).map((start,i) => {
  const group=exterior.slice(start,cuts[i+1]);
  return {
    start,endExclusive:cuts[i+1],
    firstSegment:group[0].segment,
    firstRole:group[0].role,
    lastSegment:group[group.length-1].segment,
    lastRole:group[group.length-1].role
  };
});
console.log(JSON.stringify({
  page55:{runes:76,segments:17,completeWords:16,exterior:33,interior:43},
  red11, groups,
  selectorEstablished:false,
  reason:"At least two red11 sources; no source-authored receiver, clock or reset."
},null,2));
