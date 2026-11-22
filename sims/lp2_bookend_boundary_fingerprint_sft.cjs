"use strict";
/**
 * Necessary-condition test for two copies of the same word-segmented
 * plaintext in the source-anchored LP2 bookend spans, allowing arbitrary
 * independent rune encryptions on the two copies.
 *
 * Node.js 22, CommonJS; original source only; no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const first55 = raw.split("%").slice(0, 55).join("%");
const symbols = new Set(source.runes);
const original = source.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
const ORIGINAL_RUNES = 12956, HALF = 6761, ANCHOR = 6561;
const SECOND_LENGTH = ORIGINAL_RUNES - HALF;
const FIRST_OFFSET = ANCHOR - SECOND_LENGTH;
assert.deepEqual({HALF,ANCHOR,SECOND_LENGTH,FIRST_OFFSET},
  {HALF:6761,ANCHOR:6561,SECOND_LENGTH:6195,FIRST_OFFSET:366});

/** Exact whole-word boundaries, treating print line and page wraps as neutral. */
function originalBoundaries() {
  const boundary = new Uint8Array(original.length);
  let i = 0, inWord = false, words = 0;
  for (const ch of first55) {
    if (symbols.has(ch)) {
      i++; inWord = true;
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      // The same text may continue over a line or page break.
    } else if (inWord) {
      boundary[i - 1] = 1;
      inWord = false; words++;
    }
  }
  if (inWord) {
    boundary[i - 1] = 1;
    words++;
  }
  assert.equal(i, ORIGINAL_RUNES);
  assert.equal(words, 2896);
  return boundary;
}
function count(v) {
  let n = 0;
  for (const x of v) n += x;
  return n;
}
/** Matched marked boundaries at aligned rune coordinates. */
function overlap(a, b, shift = 0) {
  assert.equal(a.length, b.length);
  let n = 0;
  for (let i = 0; i < a.length; i++)
    n += a[i] & b[(i + shift) % a.length];
  return n;
}
function fingerprint() {
  const boundary = originalBoundaries();
  const a = boundary.slice(FIRST_OFFSET, ANCHOR);
  const b = boundary.slice(HALF);
  assert.equal(a.length, SECOND_LENGTH);
  assert.equal(b.length, SECOND_LENGTH);
  const nA = count(a), nB = count(b), observed = overlap(a,b);
  const nullOverlaps = [];
  for (let shift = 0; shift < b.length; shift++)
    nullOverlaps.push(overlap(a,b,shift));
  const sorted = nullOverlaps.slice().sort((x,y)=>x-y);
  const higher = nullOverlaps.filter(x=>x>=observed).length;
  // A genuine identical word-boundary stream remains identical under
  // arbitrary independent GP29 one-time-pad-looking rune encryption.
  const plaintext = original.slice(FIRST_OFFSET, ANCHOR);
  const pad1 = plaintext.map((_,i)=>(i*13+17)%29);
  const pad2 = plaintext.map((_,i)=>(i*19+23)%29);
  const encoded1 = plaintext.map((v,i)=>(v+pad1[i])%29);
  const encoded2 = plaintext.map((v,i)=>(v+pad2[i])%29);
  assert.equal(encoded1.length, SECOND_LENGTH);
  assert.equal(encoded2.length, SECOND_LENGTH);
  assert.ok(encoded1.some((v,i)=>v!==encoded2[i]));
  assert.deepEqual(encoded1.map((v,i)=>(v-pad1[i]+29)%29),plaintext);
  assert.deepEqual(encoded2.map((v,i)=>(v-pad2[i]+29)%29),plaintext);
  assert.equal(overlap(a,a),nA);
  assert.equal(nullOverlaps.length, SECOND_LENGTH);
  assert.equal(nA, 1380);
  assert.equal(nB, 1388);
  assert.equal(observed, 297);
  assert.equal(higher, 4968);
  assert.equal(sorted[Math.floor(sorted.length/2)], 309);
  return {
    status: "No same word-segmented plaintext under bookend alignment",
    input: {originalRunes:ORIGINAL_RUNES, words:2896,
      firstPhysicalHalfRunes:HALF,
      firstBookendTerminal:ANCHOR,
      alignedFirstSpan:[FIRST_OFFSET, ANCHOR],
      alignedSecondSpan:[HALF, ORIGINAL_RUNES],
      alignedRuneCount:SECOND_LENGTH},
    original: {firstBoundaryCount:nA,secondBoundaryCount:nB,
      sharedBoundaryPositions:observed,
      expectedUnderCircularShifts:nA*nB/SECOND_LENGTH,
      sameBoundaryInventory: nA===nB,
      perfectSharedPlaintextRequires:nA},
    exactCircularShiftComparison: {
      shifts:SECOND_LENGTH, median:sorted[Math.floor(sorted.length/2)],
      minimum:sorted[0],maximum:sorted.at(-1),
      shiftsWithOverlapAtLeastOriginal:higher,
      plusOneUpperTail:(higher+1)/(SECOND_LENGTH+1)},
    positive: {
      independentRunePadsRecoverSamePlaintext: true,
      equalSourceWordBoundaryIntersection:nA
    }
  };
}
if (require.main === module)
  console.log(JSON.stringify(fingerprint(),null,2));
module.exports = {originalBoundaries,overlap,fingerprint};
