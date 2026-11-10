"use strict";
/**
 * Find candidate plaintext books from the 86 exact equal-rune positions in
 * unsolved LP2. Conditional source hypothesis: within a physical LP2 page,
 * ciphertext C[i]===C[i-1] iff plaintext GP[i] is EA (index 28).
 * This is not an authenticated Cicada cipher model or recovered plaintext.
 *
 * Usage: node sims/ea_marker_source_locator.cjs [other_plaintext_file ...]
 * Node 18+ CommonJS; source GP tokenizer shared with existing experiments.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");

const root = path.resolve(__dirname, "..");
const abs = (p) => path.resolve(root, p);
const corpus = JSON.parse(fs.readFileSync(abs(
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);

const starts = new Map();
const boundaries = new Set();
let offset = 0;
for (const p of pages) {
  starts.set(p.page, offset);
  boundaries.add(offset);
  offset += p.indices.length;
}
assert.equal(offset, 12956);

/**
 * @param {number[]} text A GP index stream with the original physical page sizes.
 * @returns {Uint8Array} Markers for within-page equal adjacent pairs.
 */
function equalitySites(text) {
  const flags = new Uint8Array(text.length);
  for (let i = 1; i < text.length; i++) {
    if (!boundaries.has(i) && text[i] === text[i-1]) flags[i] = 1;
  }
  return flags;
}
const observed = equalitySites(cipher);
assert.equal(observed.reduce((a, b) => a+b), 86);

const sectionBounds = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]].map(([first,last]) => {
  const page = pages.find((p) => p.page === last);
  assert(page);
  return {name:"p"+first+"-"+last, lo:starts.get(first),
    hi:starts.get(last)+page.indices.length};
});
assert.equal(sectionBounds[0].hi, 729);
assert.equal(sectionBounds.at(-1).hi, 12956);

/**
 * Exhaustive exact ungapped source-offset search. Returns the best necessary
 * match count, even when there are extra EA positions in the source window.
 * A copied original source under the declared model must hit every marker.
 * @param {Uint8Array} target Source-registered binary EA anchors.
 * @param {number[]} source Canonical GP runes of a candidate source text.
 * @returns {{hits:number,markers:number,firstOffset:number,ties:number,windows:number,sourceEA:number}}
 */
function locate(target, source) {
  const maxOffset = source.length-target.length;
  assert(maxOffset >= 0);
  const markerPositions = [];
  for (let i=0;i<target.length;i++) if (target[i]) markerPositions.push(i);
  const ea = [];
  for (let j=0;j<source.length;j++) if(source[j]===28) ea.push(j);
  const counts = new Uint16Array(maxOffset+1);
  for (const m of markerPositions) {
    for (const s of ea) {
      const o = s-m;
      if (o>=0 && o<=maxOffset) counts[o]++;
    }
  }
  let hits=-1, firstOffset=-1, ties=0;
  for (let o=0;o<=maxOffset;o++) {
    if (counts[o]>hits) {hits=counts[o];firstOffset=o;ties=1;}
    else if (counts[o]===hits) ties++;
  }
  return {hits,markers:markerPositions.length,firstOffset,ties,
    windows:maxOffset+1,sourceEA:ea.length};
}

/**
 * Source-native positive plant: bijective predecessor feedback with transparent
 * GP-EA and an arbitrary known nonzero-step pad. Exact roundtrip across all
 * 55 physical page segments and blind source-offset recovery is required.
 * @param {number[]} source
 * @param {number} begin
 */
function plant(source,begin) {
  const plain=source.slice(begin,begin+cipher.length);
  assert.equal(plain.length,cipher.length);
  const ciphertext=[],recovered=[];
  let base=0;
  for (const p of pages) {
    const iv=p.page%29;
    let previous=(plain[base]+iv)%29;
    ciphertext.push(previous);
    recovered.push((previous-iv+29)%29);
    for(let j=1;j<p.indices.length;j++) {
      const k=base+j,pad=(7*k+11)%28;
      const delta=plain[k]===28?0:1+(plain[k]+pad)%28;
      const next=(previous+delta)%29;
      ciphertext.push(next);
      const d=(next-previous+29)%29;
      recovered.push(d===0?28:(d-1-pad+56)%28);
      previous=next;
    }
    base+=p.indices.length;
  }
  assert.deepEqual(recovered,plain);
  assert.equal(ciphertext.length,12956);
  const result=locate(equalitySites(ciphertext),source);
  assert.equal(result.firstOffset,begin);
  assert.equal(result.ties,1);
  assert.equal(result.hits,result.markers);
  return {actualOffset:begin,recoveredOffset:result.firstOffset,
    matchedMarkers:result.hits,allRunePositionsRoundTrip:12956};
}

function main() {
  const references=[
    "resources/control/shakespeare_first300k.txt",
    "resources/control/gibran_prophet_58585.txt",
    ...process.argv.slice(2),
  ];
  const output=[];
  for(const name of references) {
    const filename=path.isAbsolute(name)?name:abs(name);
    const source=toGematria(fs.readFileSync(filename,"utf8"));
    if(source.length<cipher.length) {
      output.push({reference:name,gpRunes:source.length,bookScan:"source shorter than book"});
      continue;
    }
    const whole=locate(observed,source);
    const sectionResults=sectionBounds.map((s)=>({
      section:s.name,runes:s.hi-s.lo,
      ...locate(observed.slice(s.lo,s.hi),source),
    }));
    const controls=[1000,10000,20000]
      .filter((i)=>i+cipher.length<=source.length)
      .map((i)=>plant(source,i));
    output.push({reference:name,gpRunes:source.length,whole,
      sections:sectionResults,positiveControls:controls});
  }
  process.stdout.write(JSON.stringify({
    assumption:"ciphertext doublet iff plaintext GP-EA, no insertions or deletions",
    originalRunes:12956, originalDoubletMarkers:86,
    referenceTests:output, recoveredOriginalPlaintext:false
  },null,2)+"\n");
}
if(require.main===module)main();
module.exports={locate,equalitySites};
