#!/usr/bin/env node
"use strict";

// node sims/lp2_2012_midi_sumrank_table_gate_sft.cjs /path/to/pinned/song.mid
// Original MIDI: neuroretransmit/cicada@b13600373d3400d75ec4208198019f3d92a304dd,
// 2012/009-midi-puzzle/song.mid (signed payload, verified in prior source audit).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const sha256 = value => createHash("sha256").update(value).digest("hex");
const midi = fs.readFileSync(process.argv[2]);
assert.equal(midi.length, 10889);
assert.equal(sha256(midi), "e6c5b86bb1a95f1a2239237eaf9d060ba708f07d46ffe8c4bce4fca06a5c529c");

/** @param {Buffer} b */
function noteOffSums(b) {
  assert.equal(b.toString("ascii", 0, 4), "MThd");
  assert.equal(b.readUInt16BE(8), 1);
  assert.equal(b.readUInt16BE(10), 3);
  assert.equal(b.readUInt16BE(12), 96);
  let pos = 8 + b.readUInt32BE(4);
  const tracks = [];
  for (let k = 0; k < 3; k++) {
    assert.equal(b.toString("ascii", pos, pos + 4), "MTrk");
    const end = pos + 8 + b.readUInt32BE(pos + 4);
    pos += 8;
    let running = 0;
    const sums = [];
    function vlq() {
      let v = 0, c;
      do { assert(pos < end); c = b[pos++]; v = (v << 7) | (c & 127); } while (c & 128);
      return v;
    }
    while (pos < end) {
      const d = vlq();
      let status = b[pos++];
      if (status < 128) { pos--; status = running; assert(status); }
      else if (status < 240) running = status;
      if (status === 255) { pos++; const n = vlq(); pos += n; continue; }
      if (status === 240 || status === 247) { const n = vlq(); pos += n; continue; }
      const type = status & 240;
      const note = b[pos++];
      if (type !== 192 && type !== 208) pos++;
      if (type === 128) sums.push(note + d);
    }
    assert.equal(pos, end);
    tracks.push(sums);
  }
  assert.equal(pos, b.length);
  return tracks;
}
/** @param {number[]} a */
const sortedUnique = a => [...new Set(a)].sort((a, b) => a - b);
const tracks = noteOffSums(midi);
assert.deepEqual(tracks.map(t => t.length), [0, 558, 714]);
const keys = ["abcdefghiklmnopqrstuvwxyz", "abcdefghijklmnoprstuvwy"];
const expected = [
  "8647147926d83ceb2ca73233121a35e5d9e8bbbbbbd8c709e747fb5ba8022d2f",
  "2f5bd7c03e66177acefb26900eabe736378240089ad052f890d5868046ba9111"
];
for (let k = 0; k < keys.length; k++) {
  const values = sortedUnique(tracks[k + 1]);
  assert.equal(values.length, keys[k].length);
  const decoded = tracks[k + 1].map(v => keys[k][values.indexOf(v)]).join("");
  assert.equal(sha256(decoded), expected[k]);
  if (k === 1) assert.equal(decoded, decoded.slice(0, 238).repeat(3));
  console.log("historical control", {track:k + 1, values, decodedSha256:sha256(decoded)});
}

const g = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const all = g.pages.flatMap(p => p.tokens);
assert.equal(all.length, 256);
assert.equal(new Set(all).size, 161);
const scopes = [...g.pages, {page:"all", tokens:all}];
for (const alphabet of [g.alphabet, g.alphabet.replace("f", "")]) {
  const observed = [];
  for (const scope of scopes) {
    const sums = scope.tokens.map(token => {
      const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
      assert(a >= 0 && b >= 0);
      return a + b;
    });
    const values = sortedUnique(sums);
    observed.push(values.length);
    assert(values.length > 29);
    // Historical minimum note+delta is 67, greater than every digit sum.
    assert(values.every(x => !tracks[1].includes(x) && !tracks[2].includes(x)));
    console.log("original table", {radix:alphabet.length, page:scope.page, n:sums.length, distinct:values.length, min:values[0], max:values.at(-1)});
  }
  assert.deepEqual(observed, [43,48,40,60]);
}
// Stronger all-label lower bound: for one fixed first glyph, sums must be
// distinct whenever the second-field glyph values are injective. This holds
// even with arbitrary real first-field offsets, not merely conventional radix.
const prefixCounts = [..."01234"].map(a => new Set(all.filter(t => t[0] === a).map(t => t[1])).size);
assert.deepEqual(prefixCounts, [36,36,41,37,11]);
assert(Math.max(...prefixCounts) > 29);
console.log("all-label shared-table lower bound", Math.max(...prefixCounts), prefixCounts);
console.log("PASS: original 2012 controls; shared direct sum-rank GP29 receiver excluded.");
