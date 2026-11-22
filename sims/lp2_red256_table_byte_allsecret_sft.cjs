"use strict";
/**
 * The 225 source-annotated red GP29 runes and 31 13-dot marks form 256
 * candidate events. Test whether each original base60 numeric-table byte
 * could be decoded by ANY deterministic byte -> red-event symbol lookup.
 *
 * Scope: candidate 13-dot-only event selection from derivative annotations,
 * fixed physical page / within-page order, original printed grid row order.
 * Rune glyphs 0..28 and large 13-dot mark 29 are distinct output values.
 * This does not exclude keyed, stateful, position-dependent or permuted maps.
 *
 * Run: node sims/lp2_red256_table_byte_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {any} */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const gp = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const gpIndex = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(gpIndex.size, 29);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/**
 * A mark with source offset k occurs before any red rune whose index is k.
 * The original red rune preceding the mark, if red, is at index k-1.
 * @returns {number[]}
 */
function makeEventTape() {
  const events = [];
  for (const p of ink.pages) {
    /** @type {{at:number,symbol:number}[]} */
    const within = [];
    for (const s of p.red_spans || []) {
      Array.from(s.runes).forEach((r, j) => {
        assert(gpIndex.has(r));
        within.push({at:s.start + j, symbol:gpIndex.get(r)});
      });
    }
    for (const mark of p.large_punctuation || []) {
      if (mark[1] === 13) within.push({at:mark[0], symbol:29});
    }
    within.sort((a, b) => a.at - b.at ||
      ((a.symbol === 29 ? -1 : 1) - (b.symbol === 29 ? -1 : 1)));
    events.push(...within.map(x => x.symbol));
  }
  return events;
}
const tape = makeEventTape();
const redRunes = tape.filter(v => v < 29).length;
const markers = tape.filter(v => v === 29).length;
assert.deepEqual([redRunes, markers, tape.length], [225, 31, 256]);
assert.deepEqual(tape.slice(0, 15), [15,8,18,3,6,19,27,0,15,26,18,21,5,29,29]);

/**
 * Exact minimum number of table-to-event contradictions over ALL possible
 * byte-to-symbol lookup tables: each byte must choose its most frequent
 * observed event label. Repeated byte cells supply the all-secret constraint.
 * @param {number[]} cells table byte values in one source-oriented order
 * @param {number[]} events GP29/red-mark event values at the same positions
 */
function bestDeterministicLookup(cells, events) {
  assert.equal(cells.length, events.length);
  /** @type {Map<number,Map<number,number>>} */
  const rows = new Map();
  for (let i = 0; i < cells.length; i++) {
    const byte = cells[i], symbol = events[i];
    const counts = rows.get(byte) || new Map();
    counts.set(symbol, (counts.get(symbol) || 0) + 1);
    rows.set(byte, counts);
  }
  let ambiguous = 0, unavoidableMismatches = 0;
  for (const counts of rows.values()) {
    if (counts.size > 1) ambiguous++;
    const values = [...counts.values()];
    unavoidableMismatches += values.reduce((s, x) => s + x, 0) -
      Math.max(...values);
  }
  return {distinctBytes:rows.size, ambiguousBytes:ambiguous,
    minimumChangedEvents:unavoidableMismatches,
    deterministicLookupPossible:unavoidableMismatches === 0};
}
const forward = bestDeterministicLookup(grid.bytes, tape);
const reverse = bestDeterministicLookup([...grid.bytes].reverse(), tape);
const reverseRows = bestDeterministicLookup(
  Array.from({length:256}, (_,i) => grid.bytes[8*Math.floor(i/8)+7-i%8]), tape);
assert.deepEqual(forward, {distinctBytes:161, ambiguousBytes:66,
  minimumChangedEvents:90, deterministicLookupPossible:false});
assert.deepEqual(reverse, {distinctBytes:161, ambiguousBytes:68,
  minimumChangedEvents:93, deterministicLookupPossible:false});
assert.deepEqual(reverseRows, {distinctBytes:161, ambiguousBytes:68,
  minimumChangedEvents:90, deterministicLookupPossible:false});

// Exact positive plant: an arbitrary unknown static table f(byte) is recovered
// by this invariant with zero contradictions even though byte values repeat.
const planted = grid.bytes.map(b => (17*b + 11) % 30);
assert.equal(bestDeterministicLookup(grid.bytes, planted).minimumChangedEvents, 0);

const markerPositions = tape.flatMap((v, i) => v === 29 ? [i] : []);
assert.deepEqual(markerPositions,
  [13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,
    141,142,153,154,163,164,168,169,229,239,240,246,247,255]);
const endOfEightRows = markerPositions.filter(i => i % 8 === 7).length;
assert.equal(endOfEightRows, 6);

console.log(JSON.stringify({source:"original LP2 page-order red-event candidate + canonical 256-cell grid",
  sourceAnnotation:"derived; not a full independent original-image census",
  redRunes, thirteenDotMarks:markers, candidateEvents:tape.length,
  tableBytes: grid.bytes.length,
  sourceReadout:{forward, reverse, reverseRows},
  markerAtEightCellRowEnds:endOfEightRows,
  plantedStaticLookupPasses:true,
  decision:"No static deterministic original table-byte to 30-symbol red-event lookup can produce the 256-event candidate tape in the three fixed orders. Original unknown plaintext and key remain unrecovered."
}, null, 2));
