"use strict";

/**
 * Original LP2 pp49–51 ten-dot / 79-unit source crosslink.
 * Source-derived counts only. No decipherment or key inference.
 * Run: node sims/lp2_tendot_79_flank_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(base, "lp2-ink-annotations.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(base, "base60-grid.json"), "utf8"));
const transcription = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
const sourcePages = new Map(corpus.pages.map(p => [p.page, p]));
const markers = new Map(ink.pages.map(p => [p.page, p.large_punctuation || []]));
const unsolved = corpus.pages.filter(p => p.status === "unsolved");
const size = p => p.indices.length;
const get = n => sourcePages.get(n);

function countDoublets(runes) {
  let n = 0;
  for (let i = 1; i < runes.length; i++) if (runes[i] === runes[i-1]) n++;
  return n;
}

function originalSourceGate() {
  assert.equal(unsolved.length, 55);
  assert.equal(unsolved.reduce((s,p) => s + size(p), 0), 12956);
  assert.equal(unsolved.reduce((s,p) => s + countDoublets(p.indices), 0), 86);
  assert.equal(unsolved.reduce((s,p) => s + size(p)-1, 0), 12901);
  assert.equal(size(get(49)), 66);
  assert.equal(size(get(50)), 0);
  assert.equal(size(get(51)), 92);
  assert.ok(markers.get(49).some(([at,d]) => at === 66 && d === 10));
  assert.deepEqual(grid.page_row_counts, [10,13,9]);
  assert.equal(grid.byte_rows.length, 32);
  assert.equal(grid.byte_rows.flat().length, 256);
  const consecutivePairs = [];
  for (let i=0; i<unsolved.length-1; i++) {
    const a=unsolved[i], b=unsolved[i+1];
    if ((size(a) + size(b)) % 79 === 0)
      consecutivePairs.push([a.page,b.page,size(a),size(b)]);
  }
  assert.deepEqual(consecutivePairs, [[49,51,66,92]]);
  const startsWithDoublet = unsolved.filter(p=>p.indices[0]===p.indices[1]).map(p=>p.page);
  assert.deepEqual(startsWithDoublet, [51]);
  assert.deepEqual(get(51).indices.slice(0,2), [7,7]);
  assert.equal(countDoublets(get(49).indices),0);
  assert.equal(countDoublets(get(51).indices),1);
  const bridge = [...get(49).indices, ...get(51).indices];
  assert.equal(bridge.length, 2*79);
  assert.equal(66,79-13);
  assert.equal(92,79+13);
  assert.equal(countDoublets(bridge),1);
  assert.equal(bridge[66],bridge[67]);
  assert.deepEqual([bridge[78],bridge[79],bridge[157]],[4,19,0]);
  const bookStart = unsolved.filter(p=>p.page<49).reduce((s,p)=>s+size(p),0);
  assert.equal(bookStart,12048);
  assert.equal(bookStart+66,12114);
  assert.equal(bookStart+158,12206);

  const physical51Transcript = transcription.split("%")[50];
  const page51Words = physical51Transcript.replace(/[\s/]+/gu,"")
    .split(/[-.&$§]+/u).filter(Boolean)
    .map(x=>[...x].filter(c=>/[\u16A0-\u16FF]/u.test(c)).length);
  assert.deepEqual(page51Words.slice(0,3),[3,6,5]);
  assert.ok(3+6 < 13 && 13 < 3+6+5);

  // Internal punctuation successors only, plus the explicitly paired
  // p49 --> p51 table continuation. Terminal marks otherwise have no
  // intra-page successor and are omitted.
  const successorPairs = [];
  for (const [page, events] of markers) {
    for (const [at,dots] of events) {
      const source = get(page).indices;
      let next = source.slice(at,at+2);
      if (page === 49 && at === 66 && dots === 10)
        next = get(51).indices.slice(0,2);
      if (next.length === 2)
        successorPairs.push({page, at, dots, equal:next[0]===next[1]});
    }
  }
  assert.equal(successorPairs.length,25);
  assert.deepEqual(successorPairs.filter(p=>p.equal),[{page:49,at:66,dots:10,equal:true}]);

  // Exact page-assignment comparison; descriptive only because the 79
  // alignment and doubled-prefix condition were selected post hoc.
  let divisiblePairs=0, matchingOrdered=0;
  for (const a of unsolved) for (const b of unsolved) {
    if(a===b)continue;
    if((size(a)+size(b))%79===0) {
      divisiblePairs++;
      if(b.indices[0]===b.indices[1]) matchingOrdered++;
    }
  }
  assert.equal(divisiblePairs,34);
  assert.equal(matchingOrdered,1);

  const result = {
    input:"original LP2 physical pages49-51 and complete 55-page rune corpus",
    bridgeRunePages:[49,51],
    gridRows:grid.page_row_counts,
    gridBytes:256,
    tenDotAfterPage49Rune:66,
    runeCounts:[66,92],
    bridge:[bookStart,bookStart+158],
    localUnitsOf79:2,
    firstUnitEndsAt:{physicalPage:51,offsetAfterRune:13,
      withinThirdPrintedWord:true},
    uniqueAdjacentPagePairDivisible79:consecutivePairs,
    uniquePageStartDoublet:startsWithDoublet,
    sourceRuneDoubletAt:{physicalPage:51,offsets:[0,1],
      runes:"ᚹᚹ", gpIndices:[7,7]},
    originalDoubletsAllPages:86,
    punctuationSuccessorPairs:successorPairs.length,
    punctuationSuccessorDoublets:successorPairs.filter(p=>p.equal),
    arbitraryOrderedPagePairs:unsolved.length*(unsolved.length-1),
    pairsSumDivisible79:divisiblePairs,
    pairsWithDivisibilityAndSecondPageDoublet:matchingOrdered,
    caveat:"Retrospective source alignment; no key, plaintext or proven cipher packet clock."
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}

if (require.main === module) originalSourceGate();
module.exports = { originalSourceGate };
