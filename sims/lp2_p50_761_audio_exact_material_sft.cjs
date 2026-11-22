"use strict";

/**
 * Exact 8-byte substring gate from the printed LP2 256-cell byte table to
 * an original Cicada 2013 binary source: 761.MP3 or DATA/560.13.
 *
 * Why this source: the source's ID3 metadata already contains the later LP2
 * PARABLE, and the historical 2013 route uses its bytes as a true XOR pad.
 * An 8-byte exact hit in a 4 MB audio file has a random null expectation
 * below 1e-10 across all 249 table windows and both byte orientations.
 *
 * Invocation: node sims/lp2_p50_761_audio_exact_material_sft.cjs <historical-binary>
 * The matching algorithm is tested with a 256-byte planted source slice.
 * Original-source search writes no files and does not optimize a key.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const table = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
assert.equal(table.bytes.length, 256);
const encoded = Buffer.from(table.bytes);
const mp3 = fs.readFileSync(process.argv[2]);
const sourceName = path.basename(process.argv[2]);
if (sourceName === "761.MP3") assert.equal(mp3.subarray(0, 3).toString("ascii"), "ID3");

/**
 * @param {Buffer} needle
 * @param {Buffer} haystack
 * @param {number} width
 * @returns {{queryOffset:number, sourceOffset:number, matchLength:number}[]}
 */
function matches(needle, haystack, width) {
  const hits = [];
  for (let i = 0; i + width <= needle.length; i++) {
    const fragment = needle.subarray(i, i + width);
    let j = -1;
    while ((j = haystack.indexOf(fragment, j + 1)) >= 0) {
      let k = width;
      while (i + k < needle.length && j + k < haystack.length &&
        needle[i + k] === haystack[j + k]) k++;
      hits.push({queryOffset:i, sourceOffset:j, matchLength:k});
    }
  }
  return hits;
}

const plantAt = 4096;
assert(mp3.length > plantAt + 256);
const planted = mp3.subarray(plantAt, plantAt + 256);
const plantedHits = matches(planted, mp3, 8);
assert(plantedHits.some(hit => hit.queryOffset === 0 &&
  hit.sourceOffset === plantAt && hit.matchLength === 256));

const forward = matches(encoded, mp3, 8);
const backward = matches(Buffer.from(encoded).reverse(), mp3, 8);
const hash = crypto.createHash("sha256").update(mp3).digest("hex");
const nullBound = (249 * 2 * mp3.length) / (2 ** 64);
const out = {
  candidate: "original LP2 p49–51 table vs. authentic 2013 binary source",
  sourceName,
  sourceBytes: mp3.length,
  sourceSHA256: hash,
  tableBytes: encoded.length,
  windowBytes: 8,
  nullExpected8ByteHitsUpperBound: nullBound,
  plantedControl: {sourceOffset:plantAt, recovered:true},
  forwardHits:forward.length,
  reversedTableHits:backward.length,
  bestForward:forward.sort((a,b)=>b.matchLength-a.matchLength).slice(0,8),
  bestReversed:backward.sort((a,b)=>b.matchLength-a.matchLength).slice(0,8),
  decision: "An exact raw audio copy would reveal a source pad address; otherwise this particular source match is absent. No cipher plaintext follows from a missing match."
};
console.log(JSON.stringify(out, null, 2));
if (forward.length || backward.length) {
  console.log("POTENTIAL_SOURCE_PAD_MATCH_REQUIRES_INDEPENDENT_CONFIRMATION");
}
