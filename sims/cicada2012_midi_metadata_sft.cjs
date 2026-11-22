#!/usr/bin/env node
"use strict";

// Exact original-container MIDI metadata/SysEx inventory.
// Usage: node sims/cicada2012_midi_metadata_sft.cjs /path/to/song.mid
// This program reads only. It does not search unknown LP2 ciphertext.

const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

assert(process.argv[2], "Pass original song.mid path");
const b = fs.readFileSync(process.argv[2]);
const hash = crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from("blob " + b.length + "\0"), b]))
  .digest("hex");
assert.equal(b.length, 10889);
assert.equal(hash, "11924e0e195208c2eea757655035e149fb8a190f", "source blob SHA mismatch");
assert.equal(b.toString("ascii", 0, 4), "MThd");
const headerLength = b.readUInt32BE(4);
const format = b.readUInt16BE(8);
const trackCount = b.readUInt16BE(10);
const division = b.readUInt16BE(12);
assert.equal(headerLength, 6);
assert.equal(format, 1);
assert.equal(trackCount, 3);
assert.equal(division, 96);

const NAMES = {
  0: "sequence-number", 1: "text", 2: "copyright", 3: "track-name",
  4: "instrument-name", 5: "lyric", 6: "marker", 7: "cue-point",
  8: "program-name", 9: "device-name", 0x20: "channel-prefix",
  0x21: "port-prefix", 0x2f: "end-of-track", 0x51: "tempo",
  0x54: "smpte", 0x58: "time-signature", 0x59: "key-signature",
  0x7f: "sequencer-specific"
};

/** @param {{at:number}} pos @param {number} end @returns {number} */
function readVlq(pos, end) {
  let n = 0;
  for (let k = 0; k < 4; k++) {
    assert(pos.at < end, "truncated MIDI VLQ");
    const c = b[pos.at++];
    n = n * 128 + (c & 127);
    if (!(c & 128)) return n;
  }
  throw new Error("Invalid MIDI VLQ longer than four bytes");
}

const tracks = [];
let off = 8 + headerLength;
for (let index = 0; index < trackCount; index++) {
  assert.equal(b.toString("ascii", off, off + 4), "MTrk");
  const length = b.readUInt32BE(off + 4);
  const start = off + 8;
  const end = start + length;
  assert(end <= b.length, "MTrk extends beyond file");
  const pos = {at:start};
  let tick = 0;
  let running = 0;
  let channelEvents = 0;
  const meta = [];
  const sysex = [];
  while (pos.at < end) {
    const eventOffset = pos.at;
    const delta = readVlq(pos, end);
    tick += delta;
    let status = b[pos.at++];
    if (status < 0x80) {
      assert(running >= 0x80 && running <= 0xef, "running status without channel message");
      pos.at--;
      status = running;
    } else if (status < 0xf0) {
      running = status;
    }

    if (status === 0xff) {
      const type = b[pos.at++];
      const n = readVlq(pos, end);
      assert(pos.at + n <= end, "truncated MIDI meta-event");
      const data = b.subarray(pos.at, pos.at + n);
      pos.at += n;
      const m = {offset:eventOffset, tick, delta, type:"0x" + type.toString(16).padStart(2,"0"),
        name:NAMES[type] || "unknown", length:n, hex:data.toString("hex")};
      if (type >= 1 && type <= 9) m.text = data.toString("latin1");
      if (type === 0x51) {
        assert.equal(n, 3);
        m.microsecondsPerQuarter = data.readUIntBE(0,3);
      }
      if (type === 0x58) {
        assert.equal(n, 4);
        m.numerator = data[0];
        m.denominator = 2 ** data[1];
        m.clocksPerClick = data[2];
        m.notated32ndsPerQuarter = data[3];
      }
      if (type === 0x59) {
        assert.equal(n, 2);
        m.sharpsFlats = data.readInt8(0);
        m.minor = data[1] === 1;
      }
      meta.push(m);
      continue;
    }
    if (status === 0xf0 || status === 0xf7) {
      running = 0;
      const n = readVlq(pos, end);
      assert(pos.at + n <= end, "truncated MIDI SysEx");
      sysex.push({offset:eventOffset,tick,delta,status:"0x" + status.toString(16),
        length:n,hex:b.toString("hex",pos.at,pos.at+n)});
      pos.at += n;
      continue;
    }
    assert(status >= 0x80 && status <= 0xef, "unexpected MIDI system status");
    const kind = status & 0xf0;
    pos.at += (kind === 0xc0 || kind === 0xd0) ? 1 : 2;
    assert(pos.at <= end, "truncated MIDI channel event");
    channelEvents++;
  }
  assert.equal(pos.at, end, "track framing error");
  assert(meta.some(m => m.name === "end-of-track"), "no EOT");
  tracks.push({index, startOffset:start, byteLength:length, endTick:tick, channelEvents, meta, sysex});
  off = end;
}
assert.equal(off, b.length, "unexpected data after final track");

const events = tracks.flatMap(t => t.meta.map(e => ({track:t.index,...e})));
const sysex = tracks.flatMap(t => t.sysex.map(e => ({track:t.index,...e})));
const names = [...new Set(events.map(e => e.name))].sort();
const counts = Object.fromEntries(names.map(name => [name,events.filter(e => e.name === name).length]));
console.log(JSON.stringify({
  originalSource:{
    repository:"neuroretransmit/cicada",
    commit:"b13600373d3400d75ec4208198019f3d92a304dd",
    file:"2012/009-midi-puzzle/song.mid",
    gitBlobSha1:hash, sha256:crypto.createHash("sha256").update(b).digest("hex"),
    byteLength:b.length, format, trackCount,division,trailingBytes:b.length-off
  },
  tracks:tracks.map(t => ({index:t.index,startOffset:t.startOffset,byteLength:t.byteLength,
    endTick:t.endTick,channelEvents:t.channelEvents})),
  metadata:{total:events.length,counts,events},
  sysex:{total:sysex.length,events:sysex}
},null,2));
