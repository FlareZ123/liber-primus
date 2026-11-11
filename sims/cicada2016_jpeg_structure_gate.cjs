#!/usr/bin/env node
"use strict";

// Exact source-native JPEG container audit for the signed 2016 tree image.
// Run from repository root: node sims/cicada2016_jpeg_structure_gate.cjs
// No third-party dependencies and no steganographic decoder.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p));
const hex = n => n.toString(16).padStart(2, "0").toUpperCase();

function parseJpeg(bytes) {
  assert.equal(bytes[0], 0xff, "missing SOI prefix");
  assert.equal(bytes[1], 0xd8, "missing SOI marker");
  const segments = [], dqt = [], dht = [];
  let p = 2, eoiOffset = -1, sosOffset = -1;
  while (p < bytes.length) {
    assert.equal(bytes[p], 0xff, "JPEG marker sync lost at " + p);
    while (bytes[p] === 0xff) p++;
    const marker = bytes[p++], start = p - 2;
    if (marker === 0xd9) {
      eoiOffset = start;
      segments.push({ marker: "FFD9", offset: start, length: 2 });
      break;
    }
    if (marker === 0xda) {
      const length = (bytes[p] << 8) | bytes[p + 1];
      const end = p + length;
      assert.ok(length >= 2 && end <= bytes.length, "bad SOS length");
      segments.push({ marker: "FFDA", offset: start, length: length + 2 });
      sosOffset = start;
      let q = end;
      while (q < bytes.length - 1) {
        if (bytes[q] !== 0xff) { q++; continue; }
        let r = q + 1;
        while (bytes[r] === 0xff) r++;
        if (bytes[r] === 0x00 || (bytes[r] >= 0xd0 && bytes[r] <= 0xd7)) {
          q = r + 1;
          continue;
        }
        if (bytes[r] === 0xd9) {
          eoiOffset = q;
          segments.push({ marker: "FFD9", offset: q, length: 2 });
          p = bytes.length;
          break;
        }
        p = q;
        break;
      }
      if (eoiOffset >= 0) break;
      continue;
    }
    const length = (bytes[p] << 8) | bytes[p + 1];
    const dataStart = p + 2, end = p + length;
    assert.ok(length >= 2 && end <= bytes.length, "bad segment length at " + start);
    const item = { marker: "FF" + hex(marker), offset: start, length: length + 2 };
    if (marker === 0xe0) item.app0 = Array.from(bytes.slice(dataStart, end));
    if (marker === 0xdb) {
      let q = dataStart;
      while (q < end) {
        const info = bytes[q++], precision = info >> 4, id = info & 15, values = [];
        assert.ok(precision === 0 || precision === 1);
        for (let i = 0; i < 64; i++) {
          values.push(precision ? ((bytes[q] << 8) | bytes[q + 1]) : bytes[q]);
          q += precision ? 2 : 1;
        }
        dqt.push({ id, precision, values });
      }
    }
    if (marker === 0xc4) {
      let q = dataStart;
      while (q < end) {
        const info = bytes[q++], classId = info >> 4, id = info & 15;
        const counts = Array.from(bytes.slice(q, q + 16)); q += 16;
        const n = counts.reduce((a, b) => a + b, 0);
        const symbols = Array.from(bytes.slice(q, q + n)); q += n;
        dht.push({ classId, id, counts, symbols });
      }
    }
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      item.precision = bytes[dataStart];
      item.height = (bytes[dataStart + 1] << 8) | bytes[dataStart + 2];
      item.width = (bytes[dataStart + 3] << 8) | bytes[dataStart + 4];
      item.components = bytes[dataStart + 5];
      item.componentSpecs = [];
      let q = dataStart + 6;
      for (let i = 0; i < item.components; i++) {
        item.componentSpecs.push({
          id: bytes[q],
          sampling: hex(bytes[q + 1]),
          quantTable: bytes[q + 2]
        });
        q += 3;
      }
    }
    segments.push(item);
    p = end;
  }
  assert.notEqual(eoiOffset, -1, "no EOI found");
  return { bytes: bytes.length, eoiOffset, trailing: bytes.length - (eoiOffset + 2), sosOffset, segments, dqt, dht };
}

const ZIGZAG = [
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,
  12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,
  35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
  58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
];
const LUMA = [
  16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,
  14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,
  18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,
  49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99
];
const CHROMA = [
  17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,
  24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,
  ...Array(32).fill(99)
];
function ijgQuant(base, quality) {
  const scale = quality < 50 ? Math.floor(5000 / quality) : 200 - 2 * quality;
  return ZIGZAG.map(i => Math.max(1, Math.min(255, Math.floor((base[i] * scale + 50) / 100))));
}
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const headerSignature = j => j.segments.slice(0, -1).map(s => [s.marker, s.length]);
const dhtSignature = j => j.dht.map(h => [h.classId, h.id, h.counts, h.symbols]);

const target = parseJpeg(read("resources/historical/cicada2016-4gq25.jpg"));
const control = parseJpeg(read("resources/liber-primus/00.jpg"));
assert.equal(target.bytes, 26342);
assert.equal(target.eoiOffset, 26340);
assert.equal(target.trailing, 0);
assert.equal(target.sosOffset, 609);
assert.equal(target.dqt.length, 2);
assert.equal(target.dht.length, 4);
assert.equal(target.dqt.every(t => t.precision === 0), true);
assert.equal(target.segments.filter(s => s.marker === "FFC0").length, 1);
assert.equal(target.segments.filter(s => s.marker === "FFDA").length, 1);
const frame = target.segments.find(s => s.marker === "FFC0");
assert.equal(frame.width, 563);
assert.equal(frame.height, 569);
assert.deepEqual(frame.componentSpecs, [
  { id: 1, sampling: "22", quantTable: 0 },
  { id: 2, sampling: "11", quantTable: 1 },
  { id: 3, sampling: "11", quantTable: 1 }
]);
assert.equal(frame.precision, 8);
assert.equal(frame.components, 3);
const app0 = target.segments.find(s => s.marker === "FFE0").app0;
assert.deepEqual(app0, [74,70,73,70,0,1,1,0,0,1,0,1,0,0]);
assert.ok(target.segments.every(s =>
  !(s.marker >= "FFE1" && s.marker <= "FFEF") && s.marker !== "FFFE"));
assert.ok(equal(target.dqt[0].values, ijgQuant(LUMA, 75)));
assert.ok(equal(target.dqt[1].values, ijgQuant(CHROMA, 75)));
const matchingQualities = [];
for (let q = 1; q <= 100; q++) {
  if (equal(target.dqt[0].values, ijgQuant(LUMA, q)) &&
      equal(target.dqt[1].values, ijgQuant(CHROMA, q))) matchingQualities.push(q);
}
assert.deepEqual(matchingQualities, [75]);
assert.ok(equal(dhtSignature(target), dhtSignature(control)));
assert.ok(equal(headerSignature(target), headerSignature(control)));
assert.ok(equal(target.segments.find(s => s.marker === "FFE0").app0,
                  control.segments.find(s => s.marker === "FFE0").app0));
assert.equal(control.trailing, 0);
assert.equal(control.bytes, 168876);
assert.equal(control.segments.find(s => s.marker === "FFC0").width, 2400);
assert.equal(control.segments.find(s => s.marker === "FFC0").height, 3600);
assert.ok(control.dqt.every(t => t.values.every(v => v === 1)));

console.log(JSON.stringify({
  target: {
    bytes: target.bytes, eoiOffset: target.eoiOffset, trailing: target.trailing,
    sosOffset: target.sosOffset,
    segments: target.segments.map(s => [s.marker, s.offset, s.length]),
    frame, quantizationQuality: matchingQualities,
    dqtIds: target.dqt.map(t => t.id),
    dhtIds: target.dht.map(t => [t.classId, t.id])
  },
  ordinaryControl: {
    bytes: control.bytes, eoiOffset: control.eoiOffset, trailing: control.trailing,
    frame: control.segments.find(s => s.marker === "FFC0"),
    dqtAllOnes: control.dqt.every(t => t.values.every(v => v === 1))
  },
  comparisons: {
    identicalJfifApp0: true,
    identicalHeaderMarkerLengthSequence: true,
    identicalFourDhtTables: true,
    targetDqtMatchesIjgQuality75: true,
    targetHasNoApp1ToApp15OrCom: true,
    targetHasNoTrailingBytes: true
  },
  scope: "JPEG container only; no DCT/OutGuess decoding performed"
}, null, 2));
