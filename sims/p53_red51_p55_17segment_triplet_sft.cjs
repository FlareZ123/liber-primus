"use strict";
/**
 * Natural p53 red51 → p55 17 page-local segment × three-rune key gate.
 *
 * The 51 red runes give exactly three key glyphs per p55 printed segment.
 * Source-frozen order, sign, word-local 3-rune repetition; no fitted phase.
 *
 * Run: node sims/p53_red51_p55_17segment_triplet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p53 = corpus.pages.find(page => page.page === 53);
const p55 = corpus.pages.find(page => page.page === 55);
const p57 = corpus.pages.find(page => page.page === 57);
const redSpan = annotations.pages.find(page => page.page === 53).red_spans[0];
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];

assert.equal(redSpan.start,128);
assert.equal(redSpan.length,51);
assert.equal(lengths.length,17);
assert.equal(lengths.reduce((a,b)=>a+b,0),p55.indices.length);
assert.equal(p55.indices.length,76);

const key = [...redSpan.runes].map(rune=>corpus.runes.indexOf(rune));
assert.equal(key.length,51);
assert.ok(key.every(index=>index>=0));
assert.deepEqual(key,p53.indices.slice(128,179));

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  symbols.forEach(index=>counts[index]++);
  return counts.reduce((acc,n)=>acc+n*(n-1),0)/(symbols.length*(symbols.length-1));
}

/**
 * @param {number[]} values
 * @param {number[]} keyStream
 * @param {number} sign
 * @returns {{decoded:number[],wordStrings:string[]}}
 */
function invert(values,keyStream,sign) {
  let offset = 0;
  const decoded = [];
  const wordStrings = [];
  for (let j = 0; j < lengths.length; j++) {
    const section=[];
    for (let t = 0; t < lengths[j]; t++) {
      const value = (values[offset+t]+sign*keyStream[3*j+(t%3)]+29)%29;
      section.push(value);
      decoded.push(value);
    }
    wordStrings.push(section.map(index=>corpus.translit[index]).join(""));
    offset += lengths[j];
  }
  assert.equal(offset,values.length);
  return {decoded,wordStrings};
}

/** @returns {object} */
function run() {
  const original = p55.indices;
  const minus = invert(original,key,-1);
  const plus = invert(original,key,1);
  assert.deepEqual(invert(minus.decoded,key,+1).decoded,original);
  assert.deepEqual(invert(plus.decoded,key,-1).decoded,original);
  const native = p57.indices.slice(0,76);
  const planted = invert(native,key,+1);
  assert.deepEqual(invert(planted.decoded,key,-1).decoded,native);
  const reverseTriplets = Array.from({length:17},(_,j)=>key.slice(3*(16-j),3*(17-j))).flat();
  assert.notDeepEqual(invert(planted.decoded,reverseTriplets,-1).decoded,native);
  assert.ok(Math.abs(ioc(original)-0.037894736842105266)<1e-12);
  assert.ok(Math.abs(ioc(minus.decoded)-0.034035087719298245)<1e-12);
  assert.ok(Math.abs(ioc(plus.decoded)-0.030877192982456142)<1e-12);
  assert.ok(Math.abs(ioc(native)-0.05964912280701754)<1e-12);
  return {
    source:"Original image-adjudicated p53 red span (51 runes), original p55 17 printed local segments (76 runes)",
    caveat:"p55's first segment is the trailing rune of an 11-rune word started on p54; 17 is a page-local typographic count, 16 new starts",
    keyLength:key.length,
    segmentLengths:lengths,
    keyRuneValues:key,
    originalIoC:ioc(original),
    candidateMinus:{ioc:ioc(minus.decoded),words:minus.wordStrings},
    candidatePlus:{ioc:ioc(plus.decoded),words:plus.wordStrings},
    solvedP57First76IoC:ioc(native),
    syntheticPlant:"full 76/76 GP native word positions reconstructed; wrong triplet-group order rejected",
    result:"Neither sign yields coherent GP prose; unselected key-role and all other constructions remain unresolved"
  };
}
if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={run,invert,ioc};
